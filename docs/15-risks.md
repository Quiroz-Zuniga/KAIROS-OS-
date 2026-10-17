# 15. Riesgos y decisiones pendientes

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los identificadores técnicos actuales usan `kairos`; el manual técnico describe la implementación vigente. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

Severidad combina impacto y probabilidad estimados para ocho semanas; no es una medición estadística. Crítico amenaza objetivo/plazo o datos; alto requiere hito temprano; medio requiere mitigación planificada; bajo se controla con prácticas rutinarias.

| Riesgo | Nivel | Evidencia o causa | Mitigación / señal de decisión |
|---|---|---|---|
| Kernel o drivers propios | Crítico | ABI, memoria y hardware multiplican alcance | Usar Linux sin parches; Kernel Lab independiente |
| Confundir VFS/PID ficticios con Linux | Crítico | Dos modelos virtuales distintos presentes | Contratos separados y demostración cruzada UI/Bash |
| UI o IPC ejecutados root | Crítico | Facilitaría acceso total por XSS o canal defectuoso | UID normal, API estrecha, polkit; no sudo libre |
| Destruir datos al importar/formatear | Crítico | Instalador actual solo valida modelo | Sin instalación real ni particionado en MVP; copia con respaldo |
| Ventanas nativas ocultas por UI | Alto | WM DOM no controla X11 | Prototipo día 3 y fallback Openbox convencional |
| Pocos recursos/horas de equipo | Alto | Disponibilidad no confirmada | Confirmar capacidad; recortar antes de semana 2 |
| Compilar ISO tarde | Alto | Fallos sesión/firmware pueden bloquear demo | Primera ISO semana 2 y build limpio semana 7 |
| Versiones Electron manifiesto/build | Alto | Configuración actual Windows; soporte Linux sin verificar | Verificar binarios estables, sandbox y bibliotecas al implementar |
| Seguridad de iframes y apps heredadas | Alto | scripts + mismo origen y acceso al padre | Revisar capacidad antes de conectar Linux; remoto externo |
| Symlinks/TOCTOU/ediciones externas | Alto | Árbol virtual no tiene semántica POSIX | Scope backend, permisos, conflictos y pruebas con filesystem real |
| USB no transferido/host sin requisitos | Alto | Invitado no ve inventario físico completo | Preparar host/dispositivo; probar semana 5 |
| Guest Additions | Alto | Versión host/kernel y paquetes variables | Matriz fija, elegir un origen; resolución fija fallback |
| Wine/Proton/.exe | Alto | Apps y dependencias no previsibles | Fase posterior con catálogo probado y VM aislada |
| Live sin persistencia anunciado como instalado | Alto | SquashFS/overlay temporal | Etiquetar modo; persistencia independiente |
| Seguridad y privacidad X11 | Alto | Clientes del mismo display no se aíslan fuertemente | MVP en entorno confiable; considerar Wayland más adelante |
| Redistribución de assets/licencias | Alto | Apps/vendor y recursos con orígenes diversos | Inventario de atribución; retirar del empaquetado lo no aclarado sin borrar fuente |
| Demasiados lenguajes/frameworks | Medio/alto | Opciones tecnológicas exceden necesidades | JS+Python+shell; TypeScript gradual; sin reescritura |
| ISO/RAM demasiado grandes | Medio | Chromium Electron + navegador y multimedia | Catálogo mínimo; medir manifiesto y RAM desde semana 2 |
| UEFI/Secure Boot | Medio/alto | Firmware y firmas tienen pruebas propias | BIOS primero, EFI sin Secure Boot; no garantía implícita |
| Cambios repositorios/seguridad | Medio | Paquetes e índices evolucionan | Registrar origen/versiones; rebuild y mantenimiento tras entrega |
| Datos divergentes de dos implementaciones | Medio | IndexedDB, JSON nativo y localStorage no sincronizados | Migración explícita por copia; no fusión automática |
| Fuentes remotas de CSS/apps | Bajo/medio | Imports existentes | Vendor/atribución o fallback offline |
| VMware/Hyper-V/hardware real | Alto si se exige inicialmente | Multiplica matriz | VirtualBox primero; certificar plataformas posteriores individualmente |

## Preguntas que deben cerrarse al comenzar implementación

Horas/personas disponibles; hardware x86_64 y memoria del host; exigencia académica de instalación a disco frente a Live; persistencia obligatoria o no; disponibilidad de USB de prueba; firmware prioritario; derechos de distribución de recursos. Este estudio adopta supuestos explícitos y no bloquea la documentación por esas respuestas. La implementación deberá ajustar alcance según ellas.

## Fuentes y grado de confianza

Código local es evidencia principal del estado actual, revisado el 16-10-2026. Las capacidades externas se contrastaron con documentación primaria: [Debian Live](https://live-team.pages.debian.net/live-manual/html/live-manual/the-basics.en.html), [lb config trixie](https://manpages.debian.org/trixie/live-build/lb_config.1.en.html), [Electron](https://www.electronjs.org/docs/latest/tutorial/sandbox/), [Tauri](https://v2.tauri.app/start/prerequisites/), [Linux filesystems](https://docs.kernel.org/filesystems/), [psutil](https://psutil.io/api/), [pyudev](https://pyudev.readthedocs.io/en/latest/), [UDisks2](https://storaged.org/doc/udisks2-api/latest/), [NetworkManager](https://networkmanager.dev/docs/api/latest/), [Oracle VirtualBox 7.2](https://docs.oracle.com/en/virtualization/virtualbox/7.2/user/index.html), [Buildroot](https://buildroot.org/downloads/manual/manual.html), [Yocto](https://docs.yoctoproject.org/overview-manual/yp-intro.html), [LFS](https://www.linuxfromscratch.org/lfs/view/stable/).

No se pudo consultar directamente la página Archiso ni algunas páginas freedesktop/GRUB por restricciones de acceso. Sus comandos concretos y políticas deberán verificarse en manuales de paquetes de la VM. Las licencias de la tabla de stack son preliminares; el cierre se hace sobre el inventario exacto de redistribución. Las valoraciones de plazo, consumo, dificultad y elección son inferencias de arquitectura, no resultados de benchmark ni garantías de los fabricantes.

## Riesgos añadidos por Kairós

| Riesgo | Nivel | Tratamiento |
|---|---|---|
| Declarar MVP usando alcance anterior menor | Alto | Exigir los 15 criterios actuales, incluido panel real, IDE y AI funcional |
| AI sin proveedor, presupuesto o secreto seguro | Alto | OD-05 antes de conexión real; shell operativo sin AI; criterio pendiente si no hay respuesta real |
| Licencia/galería y updates de IDE | Alto | VSCodium recomendado con artefacto/avisos exactos; no asumir Marketplace Microsoft compatible |
| SVG inexistente o autotrace deficiente | Medio | Redibujar/revisar familia desde referencia; no renombrar raster como vector |
| Marca rompe claves o protocolos persistentes | Alto | Migración por superficies de documento 06; conservar IDs y copia recuperable |
| .desktop/XID confundidos con ejecución confiable/PID | Alto | GIO y acciones por identidad adecuada; no canal shell libre |
| Plan ocho semanas sin capacidad confirmada | Alto | Gate primer hito y nueva estimación; no declarar demo parcial MVP completo |

Las decisiones abiertas vigentes están en [OPEN_DECISIONS](OPEN_DECISIONS.md); prevalecen frente a preguntas antiguas resueltas por la especificación. No hay evidencia actual de ISO ni VM: esos son bloqueadores de aceptación, no de comenzar el prototipo. La documentación de PackageKit no pudo recuperarse; backend concreto sigue sin validar.
