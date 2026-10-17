# 12. ISO Kairós OS con Debian live-build

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Estado: arquitectura y plan; no existe receta ejecutable, ISO ni evidencia de boot en este árbol. Un portable Electron de Windows no es una distribución ni sustituye este trabajo.

## Flujo

Fuentes → paquetes Debian → Kairós Desktop/System Layer → sesión/branding/configuración → live-build → `artifacts/kairos-os-<version>-amd64.iso`. Ejemplo de nombre de release futuro: kairos-os-0.1.0-amd64.iso; no asigna una versión ya publicada.

Preparar receta bajo distro/live/: auto/config, listas config/package-lists/kairos.list.chroot, includes.chroot y hooks mínimos. Instalar el .deb propio bajo /usr/share/kairos y lanzador bajo /usr/bin; entrada de sesión XDG en la imagen. Build únicamente en VM Debian desechable: root necesario para chroot/montajes no se traslada a Electron. No ejecutar recetas de imagen sobre la instalación anfitriona.

Fijar suite trixie/amd64, versión de live-build, repositorios/origen/fecha, runtime y hashes de artefactos externos. Paquetes base: Linux Debian, live-boot/live-config, Xorg/Openbox, D-Bus, agente polkit, sesión elegida, xterm/Bash, Firefox ESR, gestor de archivos nativo y servicios de red/audio. VSCodium/Git conforme al perfil de demostración; no incluir toolchains completas automáticamente. Dependencias exactas se verifican al empaquetar; no instalar listas hipotéticas.

La documentación de [Debian Live](https://live-team.pages.debian.net/live-manual/html/live-manual/the-basics.en.html) respalda la ruta de construcción. Las opciones y cargadores se verifican contra la versión instalada en VM, no copiando una receta supuestamente probada de este documento.

## Branding y firmware

GRUB/Plymouth muestran Kairós OS, búho revisado y fondo sobrio; conservar entradas y logs de diagnóstico. Actualizar initramfs de la imagen si el tema lo exige. No desactivar errores de boot para simular éxito. El cargador BIOS depende del perfil live-build; si usa Syslinux, documentarlo y tematizarlo sin anunciar GRUB BIOS. GRUB EFI y Secure Boot son validaciones separadas. OD-10 conserva alternativas.

Sesión Kairós predeterminada: firmware → cargador → Plymouth/inicialización → login/autologin Live limitado → Openbox/Kairós Desktop, sin otro escritorio visible ni apertura manual. Usuario normal y sandbox efectivo son criterios obligatorios.

## Reproducibilidad y entrega

Construcción limpia reproducible en comportamiento; identidad bit a bit no se promete. Entregar SHA256SUMS, manifiesto dpkg, versión Desktop, configuración/commit o snapshot recuperable, logs sin secretos y licencias/fuentes u ofertas requeridas. No copiar home, secretos, cachés, node_modules de desarrollo, música o vídeos sin derechos aclarados.

Primera ISO técnica semana 2 después del hito de sesión/app real. Release final requiere [MVP_ACCEPTANCE](MVP_ACCEPTANCE.md), matriz VirtualBox, reconstrucción limpia y tres arranques registrados. Una ISO con solo UI que simula procesos no cumple.

Live SquashFS + overlay permite archivos reales temporales. Informar pérdida al apagar; persistencia ext4 es tarea independiente en disco virtual de prueba. Instalación a disco queda fuera de este MVP salvo cambio explícito de alcance y presupuesto.
