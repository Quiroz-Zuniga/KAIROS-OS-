# 13. Modelo de seguridad

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los identificadores técnicos actuales usan `kairos`; el manual técnico describe la implementación vigente. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

## Fronteras

1. El anfitrión ejecuta el hipervisor; Kairós OS opera en el invitado. No montar automáticamente carpetas host ni transferir USB sin acción del usuario.
2. Kernel/servicios Linux aplican UID/GID, permisos y políticas. Renderer web no es autoridad de autenticación.
3. Electron principal se ejecuta como usuario normal. Python también; no necesita root para inventario y métricas accesibles.
4. Una operación administrativa específica se delega a un servicio existente con polkit/logind/UDisks/NetworkManager. Si se necesita helper propio en fase posterior, debe ser mínimo, auditable y no aceptar shell arbitrario.

## Usuarios y cuentas

El login y cuentas actuales son simulados. No sirven para iniciar sesión Linux ni controlar acceso a archivos Linux. Usar mecanismo de sesión existente y PAM cuando se requiera autenticación; no implementar PAM desde JavaScript ni recopilar contraseñas para luego pasarlas a sudo. UID/GID del proceso define operaciones reales.

Para una ISO Live académica puede usarse autologin de un usuario limitado, documentando que acceso físico a VM implica acceso a sus datos. Bloqueo gráfico real requiere un bloqueador de sesión integrado, no ocultar el DOM. No incluir sudo NOPASSWD global ni contraseñas administrativas estáticas publicadas en ISO; si una configuración Live base las trae, revisarla antes de distribuir. Cuentas múltiples y recuperación real quedan fuera del MVP.

## Electron y contenido

Mantener `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`, `webSecurity:true`. Si el sandbox falla, corregir empaquetado/kernel/políticas y dependencias: no añadir `--no-sandbox` ni ejecutar root como solución. Restringir navegación, popups, permisos de cámara/micrófono y ventanas externas. Aplicar CSP con recursos locales y sin eval; inventariar scripts inline actuales para migrarlos sin romper apps.

Preload expone un método por capacidad. El main valida sender, frame/URL de confianza, esquema, tamaño, alcance y autorización en **cada** llamada. Iframes locales con scripts+mismo origen no aíslan código potencialmente hostil; no deben heredar API privilegiada por acceso al padre. Los sitios web se abren en navegador externo sin ese preload. Nombre de archivo, SSID, nombre de proceso y USB se insertan como texto.

Fuentes: [aislamiento de contexto](https://www.electronjs.org/docs/latest/tutorial/context-isolation) y [sandbox Electron](https://www.electronjs.org/docs/latest/tutorial/sandbox/). El wrapper actual aplica varias de estas medidas, pero ampliar su API obliga a revisar nuevamente las fronteras.

## Privilegios administrativos

Ejemplo propuesto: UI solicita desmontar un volumen identificado por objeto UDisks → main valida la referencia y contexto → UDisks aplica política polkit al sujeto/sesión → agente gráfico autentica si corresponde → servicio realiza operación → UI recibe resultado real. El agente polkit debe ejecutarse en sesión; un daemon instalado sin agente no garantiza diálogo. Evitar reglas polkit permisivas para todos los usuarios o acciones comodín.

sudo permanece herramienta administrativa de terminal para usuarios autorizados, no transporte de UI ni sustituto de polkit. No guardar contraseñas en localStorage, IPC logs, entorno o argumentos. Acciones de paquetes requieren plan/transacción y autorización; no ejecución libre de APT desde renderer.

AppArmor: conservar políticas provistas por la base y comprobar estado efectivo. Un perfil propio para Kairós Desktop puede diseñarse tras estabilizar rutas; activar restricciones sin pruebas puede romper sandbox/Electron. systemd: servicios propios, si se introducen, usarán mínimo acceso, límites, NoNewPrivileges y protecciones compatibles; no copiar opciones sin validar el servicio.

## Amenazas y criterios de revisión

| Amenaza | Control mínimo | Prueba futura |
|---|---|---|
| XSS obtiene acceso a kernel/filesystem | API estrecha, CSP, sin Node; scope en backend | Texto con HTML no ejecuta; canal genérico inexistente |
| Ruta traversal/symlink | Permisos Linux + reglas de resolución y alcance | Rechazar salida del hogar en mutación confinada |
| Inyección de comandos/opciones | Ejecutables fijos, args validados, sin shell | Nombre con metacaracteres no ejecuta órdenes |
| Terminación del proceso equivocado | Identidad PID/inicio y política; pidfd cuando disponible | PID viejo se rechaza |
| Paquetes o EXE maliciosos | APT firmado; Wine fuera de MVP | No hay ejecución automática de descargas |
| Exposición del host | Sin shares/clipboard por defecto | Probar VM aislada de directorios host |
| Fallo de helper o canal saturado | Timeouts, tamaños y cola limitada | UI sigue respondiendo y señala unavailable |
| Intercepción X11 entre clientes | Entorno de confianza del MVP | Documentar límite; Wayland futuro si se requiere aislamiento mayor |

No se declara este diseño una frontera segura frente a malware ejecutado como el mismo usuario. La VM y sus snapshots son el entorno de prueba; aislar red o shares según la prueba concreta. Los cambios sobre host continúan fuera del alcance actual.

Referencia de autorización comprobada: [manual polkit de Debian trixie](https://manpages.debian.org/trixie/polkitd/polkit.8.en.html), que describe autoridades, sujetos, acciones y agentes de autenticación. Las políticas específicas propuestas aún requieren pruebas en la sesión Kairós.

## Ampliación Kairós: AI, registro y ventanas

Kairós AI usa contexto mínimo read-only opt-in; claves fuera de renderer/bundle/logs. No entrega shell, root ni mutaciones a modelo cloud. Un prompt o texto de proceso no concede capacidades. Reglas de [19](19-kairos-ai.md).

.desktop es configuración ejecutable: solo entradas XDG conocidas, acción explícita de usuario y GIO; no ejecutar descargas como app. Ventanas por XID revalidado y métodos enumerados; ninguna capacidad X11 genérica al renderer. Los clientes X11 del mismo display siguen teniendo límites de aislamiento; no anunciar sandbox entre aplicaciones nativas por usar Electron aislado.

El rol administrador simulado y el bloqueo DOM nunca autorizan operaciones Linux. Los privilegios de build quedan dentro de VM separada; en esta entrega no se ejecutaron. La ausencia de revisión completa de assets/paquetes bloquea publicación, aunque permite prototipo local.
