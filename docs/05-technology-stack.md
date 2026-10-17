# 05. Stack mínimo y dependencias

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los nombres de código/datos UPHOS son históricos y se conservan. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

## Lenguajes necesarios

| Área | Lenguaje recomendado | Motivo |
|---|---|---|
| Kernel | Ninguno nuevo; kernel Linux binario Debian | No se desarrolla kernel; C/Rust/Assembly de upstream no se convierten en stack propio |
| Kairós System Layer | JavaScript en proceso principal y Python en un helper | Reutiliza Node/Electron y lector Python; psutil/pyudev evitan parsing frágil |
| UI | HTML/CSS/JavaScript; JSDoc inicialmente | Conserva vistas, estilos y módulos |
| Herramientas | Shell POSIX para build; Python solo si evita duplicar utilidades | Recetas pequeñas, revisables y ejecutadas en VM de build |
| Drivers | Ninguno propio | Paquetes y módulos Linux; no desarrollar C por anticipación |
| Shell de usuario | Bash | Disponible y ampliamente utilizado; zsh configurable posteriormente |
| Apps | JavaScript para propias; paquetes Linux para externas | No portar programas que ya existen |

TypeScript aporta contratos al IPC, pero no da permisos, sandbox ni acceso a kernel. Adoptarlo primero en contratos nuevos si el equipo lo domina; no bloquear ISO por conversión masiva. C/C++ se limitan inicialmente a dependencias compiladas; Rust solo si Tauri se reevalúa. C#/.NET no aporta una función indispensable al MVP y aumenta runtime y empaquetado. Assembly queda en Kernel Lab. No se introducen React, Kubernetes, infraestructura cloud propia ni microservicios; la API cloud de Kairós AI se integra como proveedor externo.

## Registro propuesto

Licencias principales orientativas de upstream, **no un dictamen de redistribución**. Cada paquete/binario puede contener código con varias licencias; confirmar `debian/copyright`, avisos y versión exacta en el manifiesto de la imagen antes de distribuir. No se instalaron estas dependencias. M = MVP, I = importante, F = posterior.

| Nombre / fase | Función | Licencia principal | Ventaja | Riesgo | Dependencia del sistema |
|---|---|---|---|---|---|
| Linux Debian / M | Kernel, memoria, drivers | GPL-2.0-only con excepciones y licencias por archivo | Hardware y ABI existentes | No todo dispositivo soportado | Módulos y firmware compatibles |
| live-build, live-boot, live-config / M | Construcción y arranque Live | Principalmente GPL; verificar cada paquete | Ruta mantenida Debian | Hooks y repositorios variables | Debian build VM, debootstrap |
| GRUB / M | Arranque EFI y posible BIOS | GPL-3.0-or-later | Soporta ambas familias de firmware | Perfil Live puede usar Syslinux BIOS | grub EFI/PC según receta |
| Syslinux / condicional | Arranque BIOS del perfil Live estándar | GPL y otras por componentes | Evita modificar receta estable | Segunda familia de cargador | Paquetes BIOS de live-build |
| systemd/udev / M | Servicios, sesión, eventos | LGPL-2.1-or-later y otras por componente | No reinventar ciclo del sistema | Permisos y unidades | Linux, D-Bus según uso |
| D-Bus / M | Comunicación con servicios Linux | AFL-2.1 o GPL-2.0-or-later, según archivos | Identidad del llamante y APIs existentes | Políticas mal diseñadas | Bus de sistema/sesión |
| Electron / M | Runtime UI y proceso principal | MIT + licencias Chromium/Node/terceros | Wrapper existente | RAM, actualizaciones y superficie privilegiada | Bibliotecas gráficas Linux y sandbox funcional |
| Node.js fs/child_process / M | Archivos y lanzador | MIT + terceros | Incluido en Electron | Inyección si se construye shell | Permisos del usuario invitado |
| Python 3 / M | Helper Linux | PSF y otras por componente | Lector ya existente | Protocolo y ciclo de vida | Intérprete en imagen |
| psutil / M | Procesos, CPU, RAM y discos | BSD-3-Clause | API uniforme y errores definidos | Restricciones de /proc | procfs Linux |
| pyudev / M | Enumeración y eventos | LGPL-2.1-or-later | Hotplug sin driver propio | Dispositivos desaparecen durante lectura | libudev, sysfs |
| Openbox / M | Ventanas nativas X11 | GPL-2.0-or-later | Integración ligera y conocida | Proyecto/X11 requieren evaluar mantenimiento | Xorg, sesión y fuentes |
| Xorg / M | Servidor gráfico | Principalmente MIT/X11, por módulo | Ecosistema VM y apps existentes | Poco aislamiento entre clientes | Mesa/DRM/controlador invitado |
| NetworkManager / M | Estado/red y configuración delegada | GPL-2.0-or-later; librerías con otros términos | nmcli y D-Bus | Polkit y secretos | Servicio NetworkManager |
| PipeWire + WirePlumber / M | Audio y política de sesión | MIT, con excepciones por componentes | Compatibilidad audio Linux | Servicio de usuario/driver virtual | ALSA; pipewire-pulse si se usa pactl |
| UDisks2 / I | Montajes USB y propiedades | GPL-2.0-or-later; API/librerías según paquete | D-Bus y autorización polkit | Montaje modifica estado real | udev, polkit, herramientas fs |
| polkit + agente / M | Autorizar operaciones administrativas | Principalmente LGPL-2.0-or-later y componentes GPL | No ejecutar toda UI root | No basta instalar daemon sin agente/políticas | Sesión logind y agente gráfico |
| Bash + xterm / M | Shell y terminal real externo | GPL-3.0-or-later / MIT-X11 | Cero puente PTY propio | Terminal permite acciones del usuario | X11 y PTY del kernel |
| APT/dpkg / M base; Store F | Paquetes firmados y transacciones | GPL-2.0-or-later, por componentes | Reutiliza distribución | Scripts de paquetes con privilegios | Repositorios, claves, root autorizado |
| Firefox ESR / M | Web real | MPL-2.0 + terceros | Evita navegador privilegiado casero | RAM, red y actualizaciones | Bibliotecas, certificados |
| VLC / opción M | Multimedia real | GPL-2.0-or-later y componentes | Evita codecs propios | Tamaño y licencias de plugins | Audio y plugins seleccionados |
| xterm.js + node-pty / F | Terminal embebida y pseudoterminal | MIT / MIT | Implementan emulación/PTY | Módulo nativo, ABI y canales de entrada | Toolchain al construir, PTY Linux |
| Wine / F | Compatibilidad Windows | LGPL-2.1-or-later + terceros | Algunas apps sin portar | Incompatibilidad y software malicioso | Bibliotecas y arquitecturas según paquete |

Fuentes primarias: [psutil API](https://psutil.io/api/), [licencia psutil](https://github.com/giampaolo/psutil/blob/master/LICENSE), [pyudev](https://pyudev.readthedocs.io/en/latest/), [licencia pyudev](https://github.com/pyudev/pyudev/blob/master/COPYING), [Openbox](https://openbox.org/help/Contents), [NetworkManager](https://networkmanager.dev/docs/api/latest/), [PipeWire](https://pipewire.pages.freedesktop.org/pipewire/), [UDisks2](https://storaged.org/doc/udisks2-api/latest/), [xterm.js](https://github.com/xtermjs/xterm.js), [node-pty](https://github.com/microsoft/node-pty). La tabla de licencias debe cerrarse con los paquetes exactos del build siguiendo la [información de licencias Debian](https://www.debian.org/legal/licenses/).

## Dependencias evaluadas, no añadidas

Tauri (MIT/Apache-2.0, WebKitGTK con sus términos) implica Rust. GTK (LGPL, bindings por separado) exige reescribir vistas; Qt tiene opciones LGPL/GPL/comerciales y módulos/bindings con condiciones distintas: PySide y PyQt no son intercambiables en licencia. Bindings C# deben validarse antes de elegir Qt con .NET. libusb (LGPL-2.1-or-later) sirve para transferencia USB a bajo nivel, no hace falta para inventario. python3-dbus/PyGObject pueden añadirse al helper cuando la CLI fija deje de bastar; confirmar las licencias de sus paquetes. No añadir simultáneamente tres bibliotecas D-Bus.

electron-builder existente sirve como referencia de empaquetado, pero el flujo actual Windows debe adaptarse a un artefacto Linux compatible con `.deb`. Es necesario verificar Electron estable y su soporte real al implementar; el número del manifiesto no garantiza disponibilidad de binarios para Linux.

## Stack vigente de Kairós OS

Reutilizar JS/HTML/CSS y wrapper aislado; TypeScript progresivo en contratos nuevos. El Electron declarado en simulador/package.json se verifica para Linux antes de fijarlo; esta revisión no certifica disponibilidad ni soporte. Sesión Xorg/Openbox, no compositor propio. VSCodium/Git pasan al MVP demo; VLC sigue opcional. PackageKit es candidato para Store futura, sin transacciones desde renderer. AI cloud requiere proveedor/credenciales seleccionados, sin descargar modelos locales grandes.

Diseño: Inter vendorizada inicialmente, alternativa Noto Sans y DejaVu Sans Mono; revisar licencias de cada artefacto. Tokens y geometría en [22](22-color-system.md) y [KAIROS_GEOMETRY](KAIROS_GEOMETRY.md); IDE/ediciones en [18](18-development-environment.md), módulos del sistema en [20](20-system-layer.md). La tabla histórica de licencias orienta inventario pero no cierra permisos de redistribución de una futura ISO.
