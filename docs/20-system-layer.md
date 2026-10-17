# 20. Kairós System Layer

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Bibliotecas en main y un helper de usuario cuando convenga; no daemon root monolítico. El renderer usa métodos explícitos `window.kairos.system.getCpu()`, `getMemory()` y `window.kairos.apps.launch(id)`. Los namespaces siguientes son contratos conceptuales; solo se publican métodos implementados.

| Interfaz | Proveedor propuesto | MVP y permisos |
|---|---|---|
| system.info | os-release, uname/Node os, versión paquete desktop/build | Solo lectura; About con Kairós, kernel, arquitectura, base Debian |
| system.cpu | /proc/stat o psutil con deltas monotónicos | Solo lectura, primera muestra pendiente |
| system.memory | /proc/meminfo o psutil | Bytes y semántica de available/used; sin números lógicos |
| system.processes | psutil/procfs | PID/PPID, nombre, usuario, estado, CPU, RSS y command limitado; señal posterior |
| system.storage | lsblk JSON fijo, statvfs/Node statfs, UDisks | Inventario y espacio; montaje autorizado posterior |
| system.devices | /sys + udev/pyudev; lspci/lsusb fijos opcionales | Inventario y eventos; no escribir /dev ni cargar módulos |
| system.network | NetworkManager D-Bus o nmcli fijo revisado | Estado real; cambios tipados después de política |
| system.audio | PipeWire/WirePlumber; pactl/wpctl fijo | Estado y control solo si implementado y verificado |
| system.users | UID/GID/NSS de sesión; PAM existente si procede | Identidad real; no crear usuarios desde datos simulados |
| system.power | logind D-Bus + agente polkit | Apagar/reiniciar; revisar capacidad, inhibidores y cancelación |
| system.packages | PackageKit candidato / herramientas Debian | Consulta; instalación gráfica posterior |

IPC Electron es la frontera principal. Node fs vive en main; métricas/inventario pueden compartir helper Python por JSON Lines stdin/stdout. D-Bus se usa para servicios existentes; Unix sockets solo si aparece necesidad de proceso independiente. No redirigir capacidades al servidor web histórico.

## Contrato

Resultado versionado `{version, requestId, source, available, timestamp, data, error}`; errores E_INVALID, E_PERMISSION, E_NOT_FOUND, E_CONFLICT, E_UNAVAILABLE, E_TIMEOUT. Fechas UTC en transporte y formato local en UI. CPU/memoria/procesos a 1–2 s como presupuesto inicial, un muestreador; campos inaccesibles null y sin pedir root. Caducidad visible; no fallback simulado.

Helper: mensajes hasta 1 MiB, cola acotada, correlación, timeout por operación, stderr sin secretos, backoff y cancelación al terminar sesión. No transmitir archivos grandes por ese canal. Main valida frame/sender, argumentos y alcance en cada método. Executables fijos con argumentos y shell:false; no exec, sudo o ipcRenderer genéricos. [13](13-security.md) fija controles de seguridad.

## Datos sensibles y pruebas

Command se muestra solo hasta límite de longitud y según permisos; no exponer environ ni recopilar secretos. AI recibe otro DTO reducido, nunca el snapshot completo de procesos. Frente a AccessDenied o proceso desaparecido se entrega estado parcial. Bytes/MiB y CPU por núcleo/global se etiquetan según [08](08-process-management.md).

Probar lectura contra herramientas dentro de la VM, pérdida de helper, datos incompletos, proceso fugaz y entrada no confiable como texto. Files propios requieren conflictos, permisos y symlinks de [09](09-filesystem.md); inicialmente gestor nativo real cumple navegación sin exponer mutaciones incompletas al renderer.
