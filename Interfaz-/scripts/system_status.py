"""Lecturas del equipo, sin modificar redes, audio, archivos ni procesos.

Linux: sysfs para batería, NetworkManager para redes conocidas (sin rescan),
y PulseAudio/PipeWire para volumen. No acepta comandos ni datos de la web.
"""
import json
import os
import platform
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path


def read_text(path):
    try:
        return path.read_text().strip()
    except (OSError, UnicodeError):
        return None


def command(args):
    if not shutil.which(args[0]):
        return None
    try:
        result = subprocess.run(args, capture_output=True, text=True, timeout=1,
                                check=False, env={**os.environ, 'LC_ALL': 'C'})
        return result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired, UnicodeError):
        return None


def split_nmcli(line):
    """nmcli escapa dos puntos y barras en nombres de red."""
    fields, current, escaped = [], [], False
    for char in line:
        if escaped:
            current.append(char)
            escaped = False
        elif char == '\\':
            escaped = True
        elif char == ':':
            fields.append(''.join(current))
            current = []
        else:
            current.append(char)
    fields.append(''.join(current))
    return fields


def parse_networks(output):
    networks = {}
    for line in output.splitlines():
        fields = split_nmcli(line)
        if len(fields) != 4:
            continue
        active, ssid, strength, security = fields
        if not ssid or not strength.isdigit():
            continue
        item = {'ssid': ssid[:160], 'signal': min(100, max(0, int(strength))),
                'secure': security not in ('', '--'), 'connected': active == '*'}
        old = networks.get(ssid)
        if not old or item['connected'] or (not old['connected'] and item['signal'] > old['signal']):
            networks[ssid] = item
    return sorted(networks.values(), key=lambda n: (not n['connected'], -n['signal']))[:40]


def battery_status(root=Path('/sys/class/power_supply')):
    try:
        supplies = list(root.iterdir())
    except OSError:
        supplies = []
    for supply in supplies:
        if read_text(supply / 'type') != 'Battery' or read_text(supply / 'present') == '0':
            continue
        capacity = read_text(supply / 'capacity')
        try:
            level = float(capacity)
        except (ValueError, TypeError):
            level = None
            for kind in ('energy', 'charge'):
                try:
                    current = float(read_text(supply / (kind + '_now')))
                    full = float(read_text(supply / (kind + '_full')))
                    if full > 0:
                        level = 100 * current / full
                        break
                except (ValueError, TypeError):
                    continue
        if level is None:
            continue
        state = read_text(supply / 'status')
        plugged = any(read_text(s / 'online') == '1' for s in supplies if read_text(s / 'type') in ('Mains', 'USB', 'USB_C'))
        return {'available': True, 'level': round(min(100, max(0, level))),
                'charging': state == 'Charging', 'plugged': plugged or state in ('Charging', 'Full'),
                'full': state == 'Full', 'source': 'sysfs'}
    return {'available': False, 'message': 'No hay una batería legible en este equipo.'}


def audio_status():
    volume = command(['pactl', 'get-sink-volume', '@DEFAULT_SINK@'])
    muted = command(['pactl', 'get-sink-mute', '@DEFAULT_SINK@'])
    if volume is not None and muted is not None:
        channels = [int(n) for n in re.findall(r'(\d+)%', volume)]
        if channels:
            return {'available': True, 'volume': round(sum(channels) / len(channels)),
                    'muted': bool(re.search(r'\byes\b', muted)), 'source': 'PulseAudio / PipeWire'}
    value = command(['wpctl', 'get-volume', '@DEFAULT_AUDIO_SINK@'])
    match = re.search(r'Volume:\s*([0-9.]+)', value or '')
    if match:
        return {'available': True, 'volume': round(float(match.group(1)) * 100),
                'muted': '[MUTED]' in value, 'source': 'PipeWire'}
    return {'available': False, 'message': 'No se puede leer el volumen de la salida de audio.'}


def network_status():
    status = command(['nmcli', '-t', '-f', 'DEVICE,TYPE,STATE', 'device', 'status'])
    if status is None:
        return {'available': False, 'networks': [], 'message': 'NetworkManager no está disponible para consultar redes.'}
    devices = [split_nmcli(row) for row in status.splitlines()]
    connected = [d for d in devices if len(d) == 3 and d[2] == 'connected']
    wifi_devices = [d for d in devices if len(d) == 3 and d[1] == 'wifi']
    known = command(['nmcli', '-t', '--escape', 'yes', '-f', 'IN-USE,SSID,SIGNAL,SECURITY',
                     'device', 'wifi', 'list', '--rescan', 'no']) if wifi_devices else ''
    networks = parse_networks(known or '')
    current = next((n for n in networks if n['connected']), None)
    radio = command(['nmcli', 'radio', 'wifi']) if wifi_devices else None
    connection_type = 'wifi' if any(d[1] == 'wifi' for d in connected) else 'ethernet' if any(d[1] == 'ethernet' for d in connected) else None
    return {'available': True, 'connected': bool(connection_type), 'connectionType': connection_type,
            'wifiAvailable': bool(wifi_devices), 'wifiEnabled': radio == 'enabled' if radio is not None else None,
            'ssid': current['ssid'] if current else None, 'signal': current['signal'] if current else None,
            'networks': networks, 'source': 'NetworkManager',
            'message': 'Redes conocidas por el equipo. No se fuerza un nuevo escaneo.' if wifi_devices else 'Este equipo no tiene una interfaz Wi-Fi disponible.'}


def get_status():
    if platform.system() != 'Linux':
        unavailable = {'available': False, 'message': 'El conector local actual admite Linux.'}
        return {'source': 'local-python', 'battery': unavailable, 'audio': unavailable,
                'network': {**unavailable, 'networks': []}, 'updatedAt': datetime.now(timezone.utc).isoformat()}
    return {'source': 'local-python', 'battery': battery_status(), 'audio': audio_status(),
            'network': network_status(), 'updatedAt': datetime.now(timezone.utc).isoformat()}


if __name__ == '__main__':
    print(json.dumps(get_status(), ensure_ascii=False, allow_nan=False))
