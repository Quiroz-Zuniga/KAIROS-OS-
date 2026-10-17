# 07. Integración Linux de Kairós OS

Contrato y módulos detallados en [20](20-system-layer.md). El proceso principal recibe IPC de capacidades específicas, llama APIs Node o helper Python por stdin/stdout y utiliza D-Bus cuando el servicio ya lo ofrece. Unix sockets solo si aparece un cliente independiente. No introducir REST localhost para CPU, archivos o ejecución.

El endpoint `/api/system-status` existente pertenece al desarrollo web histórico. No es el System Layer: hardware.js actual no lo consume. Reusar lectores, añadir pruebas y cambiar transporte al integrar; no ampliar el endpoint con mutaciones.

## Aplicaciones, terminal y ventanas

Launcher obtiene IDs de entradas XDG y lanza mediante GIO; respeta campos y localización sin pasar Exec a shell. Detalles: [17](17-application-integration.md). Firefox, VSCodium y terminal son procesos Linux externos administrados por Openbox. El panel observa ventanas mediante EWMH; lanzar un proceso no basta para saber qué ventanas siguen abiertas.

Terminal inicial: xterm + Bash, prompt basado en usuario/hostname reales y [branding de terminal](24-terminal-branding.md). No ejecuta catálogo de comandos simulado. Terminal propia futura: xterm.js → node-pty → PTY → Bash como usuario normal. Pipes sin PTY no equivalen a terminal interactiva. [node-pty](https://github.com/microsoft/node-pty) describe el binding; validar ABI antes de incorporarlo.

## Servicios

NetworkManager consulta estado de red; una VM NAT suele presentar Ethernet. PipeWire/WirePlumber aporta audio. UDisks2 gestiona volúmenes y polkit autoriza acciones cuando corresponda. logind gestiona apagado/reinicio tras comprobar capacidad e inhibidores; informar cancelación/error sin cambiar solo el DOM. No usar `sudo` desde renderer.

## Paquetes

Kairós Store → Package Service → PackageKit/APT → repositorios Debian. Candidatos `searchPackage`, `installPackage`, `removePackage`, `updatePackages`; disponibles solo si backend y política están implementados. Store administrativa fuera del MVP. Lecturas primero; transacciones requieren origen firmado, plan, autorización, progreso y errores, respetando locks dpkg. Prohibido interpolar `apt install ${input}` o borrar locks.

PackageKit es candidato, no decisión cerrada: comprobar backend APT, acciones polkit, cancelación y conflictos en trixie antes de adoptarlo. La documentación web upstream de PackageKit devolvió 403/error en esta revisión; no se presenta la compatibilidad exacta como validada. Alternativa: administración inicial mediante herramientas Debian existentes. Ver OPEN DECISION OD-06.

## Seguridad y errores

API conceptual `window.kairos.system.getCpu()`, `getMemory()`, `apps.launch(id)`; sin exec genérico ni IPC libre. El main valida sender/frame, esquema, límites y permisos. Toda lectura incluye origen Linux, timestamp, estado unavailable y errores estables; nunca rellena datos con VirtualSystem. Red/paquetes/energía exponen operaciones enumeradas y políticas de servicio. Referencia: [seguridad Electron](https://www.electronjs.org/docs/latest/tutorial/security).

Wine y compatibilidad EXE permanecen fuera de MVP. Mantener los ejercicios virtuales como tales; `WinRAR-demo.exe` no acredita ejecución Windows ni binario descargado.
