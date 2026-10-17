# IMPLEMENTATION PLAN — Kairós OS

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Fecha: 2026-10-16. Estado: planificación de primera ejecución; **ninguna tarea de código se marca completada por esta revisión**. Evidencia y brechas en [GAP_ANALYSIS](GAP_ANALYSIS.md), decisiones en [ADR](ARCHITECTURE_DECISION.md), [OPEN DECISIONS](OPEN_DECISIONS.md) y [roadmap](14-roadmap-8-weeks.md).

## Reglas de ejecución

Conservar `simulador/`, GUI, datos y pruebas. No reescritura ni traslado global. Preparar una referencia recuperable antes de cada etapa. Git está disponible en la raíz; [01-current-state](01-current-state.md) registra la baseline observada. Preservar además cambios locales y archivos sin seguimiento; un commit previo no los incluye automáticamente. Toda integración/privilegio Linux se prueba dentro de VM de desarrollo/build; esta revisión no instaló paquetes ni tocó el host. Rutas futuras indicadas son propuestas; escoger JS/TS por costo real, con TypeScript gradual y sin migrar JS funcional por preferencia.

Cada tarea entrega un cambio revisable con su evidencia; tareas de integración pueden dividirse más al descubrir fallos. No introducir todos los servicios a la vez. Ejecutar suites existentes apropiadas al cambiar código; contratos, seguridad y recorridos Linux requieren pruebas significativas, las tareas visuales requieren captura. Las tareas se enlazan por número, TASK-008 cierra primer hito y TASK-012 cierra primera ISO técnica. No emitir estado READY como certificación de ISO/MVP.

WHY: producto real sobre Debian. WHAT: shell/servicios/sesión/paquete incrementales. IMPACT: proveedores reales separados de laboratorio. MIGRATION: tareas siguientes y compatibilidad de datos de documento 06. ROLLBACK: restaurar solo cambio de tarea desde snapshot; sin borrar datos, reset destructivo ni acciones sobre discos del host.

## TASK-000

Nombre: Repository Safety Baseline.

Estado: VALIDATED con el commit local de cierre `chore(repo): normalize agent skills and repository baseline`. Evidencia en [task-000](evidence/task-000.md); TASK-001 no ejecutada.

Archivos: AGENTS.md; .agents/skills/*/SKILL.md; .gitignore; documentación de baseline y referencia del plan.

Objetivo: Establecer una baseline segura y versionada del repositorio antes de comenzar implementación: verificar Git real, versionar las reglas de agentes aprobadas, validar skills y revisar ignores y documentación obsoleta. Mantener una tarea/rama/responsable; usar worktrees separados para trabajo concurrente. No desarrollar en main; develop sigue siendo opcional.

Dependencias: Ninguna. Preservar los cambios previos antes de preparar la baseline.

Riesgo: Medio: mezclar cambios del usuario o afirmar protecciones remotas no verificadas.

Criterio de aceptación: Estado Git y remoto registrados; seis skills con frontmatter válido y nombres coherentes; reglas aprobadas versionadas en referencia recuperable, sin secretos ni cambios ajenos; ignores revisados; estrategia de ramas/worktrees documentada; protección de main verificada o explícitamente pendiente con responsable por asignar. No inicializar de nuevo el repositorio ni cerrar decisiones de producto.

Evidencia: [Registro de cierre](evidence/task-000.md), validación local de las seis skills, revisión de staging y diff. La referencia recuperable es el commit local que incorpora este cierre; su SHA exacto se obtiene con `git log -1 --format=%H -- docs/evidence/task-000.md`. El usuario autorizó un único commit, sin push, merge ni tag. BRANCH PROTECTION: VERIFIED — main sin protección activa ni reglas efectivas; PR/checks no exigidos y force push/eliminación no restringidos por estas reglas. Su configuración queda pendiente para el responsable humano del repositorio.

Rollback: Revertir únicamente los cambios propios desde la referencia/copia previa, conservando archivos modificados y sin seguimiento del usuario; sin reset destructivo ni limpieza global.

## TASK-001

Nombre: Baseline y alcance de trabajo.

Archivos: AGENTS.md; docs/01-current-state.md; tests existentes.

Objetivo: Establecer la baseline funcional, inventariar componentes y datos, delimitar el alcance Linux frente al laboratorio y registrar regresiones. Preservar simulador/datos y su recuperación; las reglas de agentes y la baseline del repositorio pertenecen a TASK-000.

Dependencias: 000.

Riesgo: Medio: alcance funcional, regresiones y preservación de datos.

Criterio de aceptación: Referencia recuperable, inventario de datos y comandos de regresión registrados; prohibición de modificar host preservada.

## TASK-002

Nombre: Contrato mínimo y runtime Linux.

Archivos: desktop/package.json; desktop/main/contracts.*; desktop/preload/contracts.*.

Objetivo: Verificar Electron Linux disponible y fijar runtime/lock; contrato apps.launch por ID sin ejecución libre.

Dependencias: 001.

Riesgo: Alto: runtime/sandbox.

Criterio de aceptación: Runtime elegido arranca como usuario y contrato rechaza argumentos inválidos; versión y dependencias documentadas.

## TASK-003

Nombre: Entrada Electron gráfica aislada.

Archivos: desktop/main/index.*; desktop/preload/index.*; Interfaz-/resources/html/escritorio.html.

Objetivo: Abrir GUI existente mediante entrada Linux separada con protocolo/recurso local revisado.

Dependencias: 002.

Riesgo: Alto: iframes y navegación.

Criterio de aceptación: contextIsolation/sandbox activos, nodeIntegration false; frame no autorizado rechazado y navegación remota bloqueada.

## TASK-004

Nombre: Tokens y hoja de componentes.

Archivos: desktop/renderer/styles/{tokens,colors,spacing,typography,shadows,components}.css; themes/.

Objetivo: Crear tokens oscuros/claros y puente de estilos histórico sin sustitución global.

Dependencias: 001.

Riesgo: Medio: contraste/regresión.

Criterio de aceptación: Muestras normal/hover/focus/disabled/error en ambos temas, teclado y contraste revisados; no cambia persistencia.

## TASK-005

Nombre: Sesión Kairós inicial.

Archivos: system/session/kairos-session; system/session/kairos.desktop; configuración de login manager en imagen.

Objetivo: Iniciar Openbox y shell por sesión predeterminada en VM Debian de desarrollo.

Dependencias: 003.

Riesgo: Alto: ciclo de sesión.

Criterio de aceptación: Login/autologin Live entra a Kairós sin otro escritorio ni apertura manual; UID normal, D-Bus y agente polkit disponibles.

## TASK-006

Nombre: Roles desktop y panel.

Archivos: desktop/main/shell-windows.*; system/openbox/rc.xml.

Objetivo: Validar fondo bajo apps, panel tipo dock y reserva de espacio con proveedor X11 mínimo.

Dependencias: 005.

Riesgo: Alto: foco/stacking.

Criterio de aceptación: Firefox sobre wallpaper, maximizado respeta panel, launcher recibe foco y Alt+Tab funciona; sin fullscreen/alwaysOnTop global.

## TASK-007

Nombre: Launcher mínimo de app nativa.

Archivos: desktop/main/apps.*; desktop/preload/index.*; apps/launcher/.

Objetivo: Lanzar una entrada nativa curada por ID mediante GIO/helper fijo.

Dependencias: 006.

Riesgo: Alto: confundir lanzamiento con ventana.

Criterio de aceptación: Firefox o xterm real abre desde launcher; error de ejecutable ausente visible; ninguna cadena shell desde renderer.

## TASK-008

Nombre: Gate del primer hito.

Archivos: tests/integration/session.*; docs/evidence/session.md.

Objetivo: Verificar cadena Debian-Xorg-Openbox-sesión-shell-launcher-app nativa y recuperación del shell.

Dependencias: 004, 007.

Riesgo: Alto: arquitectura aún no probada.

Criterio de aceptación: Capturas/logs de foco/Alt+Tab y sandbox; reiniciar shell no mata apps; laboratorio sigue disponible. Fallo bloquea receta ampliada.

## TASK-009

Nombre: Paquete Debian del shell.

Archivos: packaging/debian/; scripts/package-desktop.*.

Objetivo: Empaquetar shell, dependencias runtime y archivos de sesión sin secretos ni dev dependencies.

Dependencias: 008.

Riesgo: Alto: bibliotecas/avisos.

Criterio de aceptación: Instalar/desinstalar en snapshot VM limpia; sesión inicia, permisos correctos y manifiesto/avisos disponibles.

## TASK-010

Nombre: Receta Live mínima.

Archivos: distro/live/auto/config; distro/live/config/package-lists/kairos.list.chroot; scripts/build-iso.*.

Objetivo: Crear receta fijada en VM de build con paquete Kairós y apps mínimas.

Dependencias: 009.

Riesgo: Alto: boot/repositorios.

Criterio de aceptación: Build limpio produce ISO identificada y log/manifiesto; ningún paso actúa sobre discos del anfitrión.

## TASK-011

Nombre: Boot y nombre de artefacto.

Archivos: system/branding/grub/; system/branding/plymouth/; scripts/collect-artifacts.*.

Objetivo: Aplicar marca textual y splash sobrio inicial; nombre kairos-os-<version>-amd64.iso.

Dependencias: 010.

Riesgo: Medio: initramfs/cargador.

Criterio de aceptación: Boot muestra Kairós y diagnóstico accesible; cargador efectivo registrado; SHA256/manifiesto acompañan ISO.

## TASK-012

Nombre: Boot VirtualBox inicial.

Archivos: docs/evidence/virtualbox-initial.md; docs/11-virtualization.md.

Objetivo: Probar ISO técnica BIOS y recoger perfil, tamaño, RAM/tiempo; investigar Additions.

Dependencias: 011.

Riesgo: Alto: gráficos/resolución.

Criterio de aceptación: Arranque sin red llega a shell y abre terminal/app; versión host/guest/firmware/checksum registrados.

## TASK-013

Nombre: Application Registry XDG.

Archivos: desktop/main/application-registry.*; tests/integration/desktop-entries.*.

Objetivo: Descubrir y normalizar entradas XDG con prioridad, locale y campos de visibilidad.

Dependencias: 007, 012.

Riesgo: Medio: semántica .desktop.

Criterio de aceptación: Fixture Hidden/override/NoDisplay/TryExec/locales y entrada inválida; IDs estables sin descargar ejecutables.

## TASK-014

Nombre: Launcher completo y asociaciones.

Archivos: apps/launcher/; desktop/main/apps.*.

Objetivo: Buscar/lanzar por appId usando GIO, Terminal/DBusActivatable y documentos permitidos.

Dependencias: 013.

Riesgo: Alto: expansión/inyección.

Criterio de aceptación: Pruebas de rutas con espacios, field codes, app monoinstancia y errores; sin Exec interpretado como shell.

## TASK-015

Nombre: Terminal Linux y búho validado.

Archivos: apps/terminal/; system/branding/terminal/; system/branding/fastfetch/.

Objetivo: Configurar xterm/Bash de usuario y arte ASCII/UTF-8 revisado, sin construir PTY propio.

Dependencias: 014.

Riesgo: Medio: fuentes/locale.

Criterio de aceptación: Bash/pipes/Ctrl+C reales; ancho en dos fuentes y locale fallback; snapshot/captura antes de declarar logo terminal oficial.

## TASK-016

Nombre: VSCodium y Git de demostración.

Archivos: distro/live/config/package-lists/; packaging/ide/; docs/18-development-environment.md.

Objetivo: Cerrar OD-04 y fijar artefacto/origen/updates, avisos y delta tamaño del IDE.

Dependencias: 014, 015.

Riesgo: Alto: licencia/paquete.

Criterio de aceptación: Desde launcher editar/guardar en hogar, comprobar terminal/Git; versión/hash y perfil Standard/Developer explícitos.

## TASK-017

Nombre: System Layer y helper de lectura.

Archivos: services/linux/; desktop/main/system.*; desktop/preload/index.*.

Objetivo: Implementar contrato versionado, helper con límites y métodos mínimos de info.

Dependencias: 012, 002.

Riesgo: Alto: IPC y framing.

Criterio de aceptación: Sender/esquema/límites validados, timeout/caída helper manejados y ningún canal exec/root/REST de administración.

## TASK-018

Nombre: CPU y memoria reales.

Archivos: services/linux/metrics.*; tests/integration/metrics.*.

Objetivo: Muestrear CPU con deltas y RAM con semántica/unidades.

Dependencias: 017.

Riesgo: Medio: primeras muestras/unidades.

Criterio de aceptación: Comparación en VM con herramientas Linux, primera CPU pendiente y datos caducados/unavailable visibles.

## TASK-019

Nombre: Procesos reales de solo lectura.

Archivos: services/linux/processes.*; tests/integration/processes.*.

Objetivo: Listar PID/PPID/nombre/UID/CPU/RSS/estado/command limitado sin señales.

Dependencias: 018.

Riesgo: Medio: procesos fugaces/privacidad.

Criterio de aceptación: Proceso de prueba coincide con ps; AccessDenied/desaparición sin caída; AI no recibe cmdline completa.

## TASK-020

Nombre: Almacenamiento real de lectura.

Archivos: services/linux/storage.*; tests/integration/storage.*.

Objetivo: Inventariar lsblk JSON y espacio/Live temporal sin formatear ni montar automáticamente.

Dependencias: 017.

Riesgo: Medio: medios ausentes.

Criterio de aceptación: Distingue ISO/overlay/disco virtual; permisos/campos ausentes correctos; no mutaciones de bloques.

## TASK-021

Nombre: Dispositivos reales y eventos.

Archivos: services/linux/devices.*; apps/devices/; tests/integration/devices.*.

Objetivo: Inventario sysfs/udev, USB/PCI/red/audio/display con snapshot y altas/bajas.

Dependencias: 017.

Riesgo: Alto: passthrough.

Criterio de aceptación: Alta/baja de USB transferido y campos reales; sin USB sigue operativo, no inventa hardware del host.

## TASK-022

Nombre: Kairós Task Manager.

Archivos: apps/task-manager/; desktop/main/system.*.

Objetivo: Mostrar procesos/métricas reales separado del monitor de scheduler educativo.

Dependencias: 019.

Riesgo: Medio: UI y identidad.

Criterio de aceptación: Tabla filtra/actualiza datos reales con unidades; no ejecuta terminate virtual sobre PID Linux ni ofrece matar procesos aún.

## TASK-023

Nombre: Files nativo inicial.

Archivos: apps/files/; desktop/main/apps.*; distro/live/config/package-lists/.

Objetivo: Integrar gestor nativo real y asociaciones, conservar diseño futuro de Kairós Files propio.

Dependencias: 014, 020.

Riesgo: Medio: permisos/datos.

Criterio de aceptación: Crear/navegar/editar archivo invitado y verlo desde Bash; errores permisos; no importa volumen virtual automáticamente.

## TASK-024

Nombre: Panel de ventanas reales.

Archivos: services/linux/windows.*; desktop/main/windows.*; desktop/renderer/shell/panel.*.

Objetivo: Cerrar OD-02 y enlazar EWMH a barra con estados/foco/acciones por XID.

Dependencias: 014, 006.

Riesgo: Alto: carreras y correlación.

Criterio de aceptación: Dos ventanas y app monoinstancia aparecen; activar/minimizar/restaurar/cerrar funciona; no usa PID como identidad de ventana.

## TASK-025

Nombre: Red y audio mediante capacidades.

Archivos: services/linux/network.*; services/linux/audio.*; desktop/renderer/shell/quick-settings.*.

Objetivo: Adaptar lectores Python existentes al IPC, sin fallback a valores virtuales.

Dependencias: 017.

Riesgo: Medio: proveedores ausentes.

Criterio de aceptación: Ethernet NAT y audio invitado reales; no batería/Wi-Fi muestra ausencia; cambios solo si método/política ya verificados.

## TASK-026

Nombre: Settings y About modulares.

Archivos: apps/settings/; desktop/main/preferences.*.

Objetivo: Apariencia/idioma/tema/About y secciones de capacidades disponibles.

Dependencias: 004, 018, 020, 021, 025.

Riesgo: Medio: persistencia Live.

Criterio de aceptación: About muestra build/kernel/arquitectura/base Debian/Desktop; ajustes sobreviven relanzar shell, Live temporal indicado.

## TASK-027

Nombre: Apagar y reiniciar por logind.

Archivos: services/linux/power.*; desktop/preload/index.*; apps/settings/.

Objetivo: Acciones enumeradas con comprobación de capacidad, inhibidores y autorización del servicio.

Dependencias: 005, 017.

Riesgo: Alto: energía real.

Criterio de aceptación: Cancelar no apaga; autorización denegada visible; apagar/reiniciar VM ocurre realmente desde interfaz.

## TASK-028

Nombre: Indicadores y notificaciones.

Archivos: desktop/renderer/shell/notifications.*; system/session/.

Objetivo: Mostrar eventos/errores relevantes y decidir protocolos de tray OD-03.

Dependencias: 024, 025, 027.

Riesgo: Medio: alcance tray.

Criterio de aceptación: Estado de apps/red/audio/errores consistente; protocolos soportados documentados, sin inventar iconos de apps ausentes.

## TASK-029

Nombre: Kairós AI: app y adaptador.

Archivos: apps/ai/; services/ai/.

Objetivo: Crear app propia y contrato cloud, almacenamiento local de conversaciones con errores/cancelación.

Dependencias: 026.

Riesgo: Medio: disponibilidad proveedor.

Criterio de aceptación: App abre offline sin bloquear desktop; no configurada visible, sin keys renderer/logs ni simulación de respuesta real.

## TASK-030

Nombre: AI cloud y contexto opt-in.

Archivos: services/ai/; services/linux/context.*; tests/integration/ai.*.

Objetivo: Cerrar OD-05 y conectar conversación real con contexto mínimo de solo lectura.

Dependencias: 029, 018, 019.

Riesgo: Alto: credenciales/costo/privacidad.

Criterio de aceptación: Mensaje/respuesta real con credencial autorizada; cancelar/timeout/cuota; previsualiza contexto; ninguna capacidad de escritura/root.

## TASK-031

Nombre: SVG oficial y migración visible de marca.

Archivos: assets/branding/; assets/wallpapers/; Interfaz-/ y simulador/ solo superficies inventariadas; docs/06-ui-migration.md.

Objetivo: Dibujar/revisar seis SVG, wallpaper y reemplazar textos/activos por superficies sin renombrar datos.

Dependencias: 004.

Riesgo: Medio: detalle/licencias/regresión.

Criterio de aceptación: SVG real y legible 16–64px, ambos temas; fuente/permiso; IDs/claves/canales históricos y flujos intactos.

## TASK-032

Nombre: Tema Openbox y boot final.

Archivos: system/openbox/themes/Kairos/; system/branding/; desktop/renderer/styles/.

Objetivo: Alinear controles/bordes con geometría y aplicar activos finales al boot/About/login.

Dependencias: 031, 024, 026.

Riesgo: Medio: diferencias CSS/WM.

Criterio de aceptación: Capturas comparadas claro/oscuro, maximizado/panel, fuente/escala; no pausas boot ni marcas que falseen base Debian.

## TASK-033

Nombre: Auditoría de seguridad y licencias.

Archivos: tests/integration/security.*; packaging/debian/; docs/13-security.md.

Objetivo: Revisar IPC/iframes/CSP, paquetes, secretos y recursos de redistribución antes de freeze final.

Dependencias: 016, 022, 023, 027, 030, 032.

Riesgo: Alto: ampliación de privilegios.

Criterio de aceptación: Pruebas de sender/inyección/URL/rutas; renderer sin root/Node; assets no autorizados fuera de imagen; avisos/fuentes requeridos incluidos.

## TASK-034

Nombre: Guest integration y rebuild limpio.

Archivos: distro/live/; docs/evidence/guest-integration.md; scripts/collect-artifacts.*.

Objetivo: Cerrar OD-07/10, construir en entorno limpio y verificar matriz VirtualBox.

Dependencias: 033.

Riesgo: Alto: versiones/firmware.

Criterio de aceptación: Boot/resolución/mouse/teclado/audio/red/storage/clipboard opt-in/USB documentados; BIOS y UEFI separados, Additions sin mezcla.

## TASK-035

Nombre: QA integral de los 15 criterios.

Archivos: tests/integration/; docs/MVP_ACCEPTANCE.md; docs/evidence/release.md.

Objetivo: Ejecutar demostración completa sobre ISO candidata y corregir defectos.

Dependencias: 034.

Riesgo: Alto: integración final.

Criterio de aceptación: 15 criterios con evidencia, tres boots, 30 min de sesión y errores/cancelación; cada pendiente impide declarar MVP completo.

## TASK-036

Nombre: Entrega reproducible y guía final.

Archivos: artifacts/; docs/README.md; docs/12-iso-build.md; guía VirtualBox.

Objetivo: Entregar ISO/checksum/manifiesto/configuración/logs/licencias y límites de Live.

Dependencias: 035.

Riesgo: Medio: trazabilidad.

Criterio de aceptación: Nombre versionado sin espacios y reconstrucción documentada; guía permite repetir demo y rollback en VM sin modificar host.
