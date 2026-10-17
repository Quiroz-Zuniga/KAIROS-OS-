# 10. Drivers, hardware y USB

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los nombres de código/datos UPHOS son históricos y se conservan. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

## Alcance real

Linux enumera dispositivos y asigna drivers. Kairós OS presenta ese inventario y sus eventos; no escribe drivers ni permite cargar módulos arbitrarios. Un módulo cargado no implica que todos sus dispositivos estén sanos; un dispositivo sin enlace a driver tampoco significa siempre fallo.

| Fuente/herramienta | Uso | Límite |
|---|---|---|
| `/sys`, sysfs | Topología, propiedades, enlaces a drivers | Campos dependen del tipo; dispositivos desaparecen |
| udev/libudev/pyudev | Metadatos y eventos add/remove/change | Identificar ancestros y recomponer snapshot |
| lspci | PCI y drivers asociados | Solo hardware visible en invitado; base de IDs puede faltar |
| lsusb | Enumeración VID/PID | No proporciona siempre fabricante/modelo/driver completo |
| lsblk JSON | Discos, particiones, tipos y montajes | No equivale a listar todo USB; especificar columnas |
| lshw | Informe ampliado opcional | Parte requiere privilegios; salida grande |
| `/dev` | Nodos de dispositivo | No abrir/escribir por inventario; depende de permisos |
| `/proc/modules`, modinfo | Módulos y metadatos | Drivers incorporados al kernel no aparecen como módulos |
| modprobe | Gestión de módulos | Fuera de UI MVP; operación administrativa |
| dmesg/journal | Diagnóstico de eventos | Puede estar restringido; no elevar solo por leerlo |

MVP: catálogo de categorías CPU/memoria, almacenamiento, red, audio, PCI y USB. Cada ficha muestra identificador estable dentro de sesión, ruta sysfs, bus, fabricante/modelo si disponibles, driver ligado, estado observado y timestamp. Diferenciar «enumerado», «driver asociado», «montado» y «funcionalidad comprobada»; inventario no prueba conectividad ni audio.

## USB y correlación

Datos propuestos: VID y PID en hexadecimal, serial si existe y se decide mostrarlo, fabricante, modelo/producto, clase/tipo, interfaces, drivers por interfaz y puntos de montaje. VID/PID identifican modelo, no unidad única. Serial puede estar ausente o duplicado; ruta física/sysfs distingue conexiones dentro de la sesión.

USB compuesto puede tener varios drivers. Correlacionar dispositivo USB → interfaces → descendientes block → particiones → UDisks/tabla de montajes. Un teclado USB no tiene punto de montaje. No poner uno ficticio ni asumir relación uno a uno entre USB y disco. Algunas cadenas son controladas por dispositivo: tratarlas como texto y limitar tamaño.

Helper pyudev con monitor en usuario normal, snapshot inicial y eventos de alta/baja; agrupar ráfagas y resincronizar tras errores. Evitar carrera de suscripción/snapshot mediante buffer temporal o segunda enumeración. Al retirar un dispositivo, invalidar propiedades; al retirar almacenamiento, advertir operaciones fallidas y no afirmar expulsión segura si no se realizó.

Para montaje futuro usar UDisks2 D-Bus y polkit, no `sudo mount` armado desde un nombre proporcionado por renderer. Desmontar y expulsar son pasos distintos. libusb solo se justificaría para transferir datos a una clase específica no cubierta por drivers; puede requerir permisos y competir con driver del kernel. **No hace falta libusb para inventario y eventos.**

Fuentes: [pyudev](https://pyudev.readthedocs.io/en/latest/), [UDisks2](https://storaged.org/doc/udisks2-api/latest/), [sysfs y filesystems Linux](https://docs.kernel.org/filesystems/).

## Visibilidad virtualizada

La VM ve dispositivos virtuales y USB que el hipervisor le transfiere; no todos los USB del host. NAT presenta una NIC Ethernet virtual aunque el host use Wi-Fi. USB passthrough depende de configuración, permisos y, según versión/controlador de VirtualBox, componentes adicionales del host. Guest Additions no son un servicio universal de USB.

Prueba de aceptación: inventario sin USB externo funciona; conectar dispositivo de prueba, transferirlo desde hipervisor, observar VID/PID y driver; si almacenamiento, correlacionar partición/montaje; desconectar y verificar baja sin error de UI. Esta demostración debe prepararse con el equipo real antes de la exposición; un USB que permanece en host no valida detección desde Kairós OS.

## Estado de implementación Kairós

El panel hardware.js actual usa controles virtuales; system_status.py es un lector separado. Ninguno acredita aún Kairós Devices sobre la ISO. TASK-021 y TASK-025 conectarán inventario/eventos e indicadores por IPC con origen real. El inventario añade display y distingue categorías sin hardware accesible.
