# 11. Virtualización y perfil de pruebas

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los nombres de código/datos UPHOS son históricos y se conservan. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

**Objetivo inicial: VirtualBox en host x86_64, invitado Debian amd64.** No prometer arrancar esta ISO x86_64 mediante virtualización nativa en host ARM; allí se requiere emulación o una imagen arm64 diferente.

## VirtualBox

Perfil inicial propuesto: Linux/Debian 64 bits, 2 vCPU, 4 GiB RAM, VMSVGA, 128 MiB vídeo, aceleración 3D inicialmente desactivada, SATA para disco virtual opcional y óptico para ISO, NAT, audio virtual compatible. Son puntos de partida que deben medirse; VMSVGA y soporte gráfico dependen del kernel/Mesa y versiones concretas.

| Aspecto | Plan | Aceptación |
|---|---|---|
| Vídeo | Xorg/Mesa con controlador invitado; probar render software si falla 3D | UI usable, sin pantallas negras ni necesidad de --no-sandbox |
| Resolución | Guest Additions compatibles y componentes de sesión | Cambiar tamaño no pierde menú ni ventanas; resolución fija como fallback |
| Red | NAT y DHCP por NetworkManager | IP del invitado y resolución DNS reales; no exigir Wi-Fi |
| Audio | Dispositivo virtual + ALSA/PipeWire/WirePlumber | Reproduce muestra y muestra estado real |
| Almacenamiento | ISO óptica; VDI SATA opcional para datos | Distingue Live, disco y USB; sin formateo automático |
| USB | Passthrough configurado en host por su usuario | Alta/baja visible dentro del invitado |
| Portapapeles | Desactivado por defecto; opt-in tras pruebas | Ningún dato del host se expone automáticamente |
| Carpetas compartidas/arrastrar | Fuera del mínimo | Solo habilitar rutas y permisos explícitos posteriormente |

Guest Additions se ejecutan en invitado. Preferir paquetes compatibles disponibles en los repositorios elegidos; verificar que `virtualbox-guest-utils`/`virtualbox-guest-x11` existen para trixie y el origen habilitado antes de agregarlos a la receta. Si no, evaluar integración oficial de una versión fijada, sin mezclar dos instalaciones. Los módulos ya presentes en kernel no sustituyen necesariamente los servicios de sesión de redimensionado. Headers y toolchain solo se requieren en la ruta que compila módulos; evitar incluirlos permanentemente si no hacen falta.

Oracle recomienda alinear versión de Additions y host para mejores resultados; registrar ambas. El redimensionado Linux con VMSVGA utiliza componentes específicos como VBoxDRMClient según versión. Fuente: [manual oficial Guest Additions 7.2](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/guestadditions.html). Extension Pack pertenece al host y tiene términos propios; no integrarlo ni instalarlo automáticamente en esta entrega. Confirmar requisitos USB de la versión utilizada en el [manual de VirtualBox](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/index.html).

## Matriz entre hipervisores

| Plataforma | Prioridad | Adaptaciones probables | Estado de este estudio |
|---|---|---|---|
| VirtualBox BIOS | MVP | VMSVGA, SATA, NAT; Additions para extras | Diseño; no probado |
| VirtualBox UEFI | Importante | EFI amd64, Secure Boot desactivado inicialmente | Diseño; no probado |
| QEMU/KVM | Secundaria | virtio disco/red; SeaBIOS u OVMF; agente opcional | Diseño; no probado |
| GNOME Boxes | Secundaria | QEMU/libvirt; SPICE y agentes si se necesitan extras | No es arquitectura de ISO distinta; no probado |
| VMware | Opcional | Controladores Linux y open-vm-tools/desktop según necesidad | Diseño; no probado |
| Hyper-V Gen 2 | Futuro | UEFI, drivers Hyper-V Linux, disco/red sintéticos | Evaluar Secure Boot y vídeo; no probado |
| Hyper-V Gen 1 | Futuro | BIOS y dispositivos emulados | No certificado |

Un ISO puede servir a varios hipervisores; servicios de integración son extras específicos. No instalar todos los agentes por anticipación. No certificar Hyper-V/VMware porque un kernel los soporte: necesitan pruebas de la imagen completa.

## Protocolo de evidencia

Registrar checksum ISO, commit/configuración, kernel, paquetes, versión host/hipervisor, firmware, CPU/RAM/dispositivos VM. Probar boot limpio, login/sesión, apps nativas al frente, archivos, procesos, red, audio, apagado y segundo arranque. BIOS y UEFI se prueban en VMs separadas. Para USB registrar consentimiento de transferencia y resultados dentro del invitado. Medir tiempo y RAM con herramientas invitadas; screenshots solos no prueban filesystem ni CPU reales.

Como referencia secundaria de plataforma, Microsoft publica [soporte de invitados Debian en Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/supported-debian-virtual-machines-on-hyper-v). Esa tabla no certifica esta futura imagen Kairós OS. Las consultas a paquetes VirtualBox Guest de trixie no resolvieron disponibilidad en este estudio; se mantiene como tarea explícita antes de fijar listas de build.

## Matriz Kairós ampliada

Añadir explícitamente arranque a sesión predeterminada, teclado (distribución, acentos y atajos Alt+Tab), mouse (captura/integración, clic/arrastre), almacenamiento visible real y apagado/reinicio desde UI. Portapapeles se prueba desactivado y, con opt-in del usuario del entorno de QA, transferencia bidireccional; no se habilita ni se consulta automáticamente el host. La evidencia corresponde al invitado y versiones concretas. OD-07 conserva el origen de Additions abierto hasta prueba; este documento no certifica disponibilidad de paquetes.
