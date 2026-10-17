# 14. Roadmap concreto de ocho semanas — Kairós OS

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Semanas relativas al inicio de implementación; no fechas comprometidas. Supuestos de capacidad de [02](02-feasibility-study.md) siguen sin confirmar; el alcance nuevo añade panel, VSCodium y AI. Riesgo alto: medir primer hito y reestimar, sin prometer 205–270 h para requisitos ampliados. Tareas en [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md).

| Semana | Entregable verificable | Tareas principales | Gate / riesgo |
|---|---|---|---|
| 1 | Baseline; tokens/tema inicial; Electron gráfico en sesión Openbox; launcher mínimo abre app real | 001–008 | Desktop como usuario normal, sandbox, foco y Alt+Tab. Sin este hito, no avanzar extras ni certificar experiencia |
| 2 | Paquete Linux y primera ISO técnica; marca boot inicial; perfil VirtualBox registrado | 009–012 | ISO arranca sola a sesión Kairós y abre terminal/app sin red. Resolver receta/cargadores antes de más features |
| 3 | Application Registry, launcher real, xterm/Bash y VSCodium/Git | 013–016 | Editar/guardar y verificar en terminal, catálogo XDG correcto; licencia/updates e IDE medidos |
| 4 | System Layer de lectura: info/CPU/RAM/procesos/storage/devices | 017–021 | Datos contrastados en invitado; helper caído no bloquea; nunca fallback simulado |
| 5 | Task Manager read-only, Files nativo, Settings modular, panel EWMH y energía | 022–027 | Ventanas abiertas reales y foco; archivo visible en terminal; power por servicio con cancelación |
| 6 | Kairós AI cloud y contexto mínimo read-only; notificaciones de capacidades | 028–030 | Conversación real con proveedor seleccionado; sin acceso arbitrario ni root; desktop independiente de AI |
| 7 | Freeze, seguridad, Guest Additions, branding final y reconstrucción | 031–034 | Corregir defectos, medir recursos, matriz de dispositivos y permisos; sin features tardías |
| 8 | QA MVP completo, ISO final y documentación/demostración | 035–036 | 15 criterios con evidencia, tres boots y sesión de 30 min; no anunciar completado si falta uno |

Orden de prioridad: Desktop → ISO → apps reales/Launcher/System Layer/Code → Files/Task Manager → seguridad transversal → AI → extras. Seguridad inicia en semana 1; semana 7 es auditoría/cierre. Launcher mínimo se hace antes de ISO para probar la arquitectura; descubrimiento completo llega semana 3. No esperar AI para integrar boot.

## Puntos de decisión

Día 3: si shell oculta ventanas o requiere no-sandbox/root, resolver integración o registrar bloqueo técnico. Fallback maximizado sirve para diagnóstico, no para aceptación. Fin semana 2 sin ISO: pausar extras y reestimar. Fin semana 3 sin IDE: corregir empaquetado y licencias, no recrear Code en HTML. Fin semana 5 sin fuentes reales: priorizar contratos/servicios sobre acabado visual. Antes de semana 6 sin proveedor AI: puede hacerse UI y pruebas de errores, pero el criterio de conversación sigue pendiente.

Freeze al iniciar semana 7. Si no caben los 15 criterios, acordar extensión o demo parcial claramente identificada; no cambiar el significado de «MVP aceptado». Wine, terminal PTY propia, Store administrativa, instalación, modelos locales grandes y WM/kernel propios no son rescate del cronograma.

## Recursos y medición

Perfil provisional de VM: 2 vCPU/4 GiB RAM, VMSVGA/NAT; build en VM separada con espacio suficiente. Son supuestos del estudio, no mínimos certificados. Registrar consumo en reposo y con Firefox/Code/monitor, tamaño ISO y tiempo de arranque desde semana 2. La dedicación real y benchmark del primer hito determinan la nueva estimación.
