# 16. Kairós Desktop Shell

Responsabilidad: wallpaper, launcher, búsqueda de apps, panel, fijados, ventanas abiertas, reloj, indicadores, notificaciones y quick settings. La búsqueda inicial indexa aplicaciones, no archivos personales ni web. Electron es presentación y puente de capacidades; Openbox administra ventanas nativas.

## Ventanas shell y panel

Prototipo de dos superficies: fondo tipo desktop bajo apps; panel tipo dock con reserva `_NET_WM_STRUT_PARTIAL`. El panel debe seguir accesible sin cubrir apps maximizadas. Probar foco de launcher, Escape, Alt+Tab, pantalla completa de Firefox, cambios de resolución, escalado y cierre del shell. No usar fullscreen persistente del fondo ni alwaysOnTop para todas sus ventanas.

EWMH aporta `_NET_CLIENT_LIST`, `_NET_ACTIVE_WINDOW`, `_NET_WM_NAME`, `_NET_WM_ICON`, `_NET_WM_STATE` y tipos de ventana; `WM_CLASS` y `_NET_WM_PID` ayudan a correlación, sin garantizar identidad app/proceso. Usar XID para acciones de ventana y appId para fijados. Atender ventanas que ya existían, apps monoinstancia, múltiples ventanas y desaparición entre lectura/acción. Excluir desktop/dock y skip-taskbar; no crear botones por cada proceso del sistema. Fuente: [EWMH](https://specifications.freedesktop.org/wm/latest/).

## Opciones de implementación — OPEN DECISION OD-02

| Opción | Uso | Costo y prueba decisiva |
|---|---|---|
| wmctrl con execFile fijo | Prototipo rápido de enumeración/activar/minimizar/cerrar | Polling limitado; parsing y carreras; verificar soporte de acciones en Openbox |
| libwnck vía PyGObject | Lista y eventos de ventanas | Añade GLib/GTK al helper; medir dependencias y ciclo de eventos |
| Xlib/xcb en helper mínimo | Eventos/properties EWMH directos | Mayor complejidad y mantenimiento; justificar frente a alternativas |

Recomendación provisional: wmctrl para primer recorrido, después elegir proveedor por eventos o polling medido. Un monitor X11 no necesita root. No exponer XID arbitrario sin verificar ventana actual y operación permitida. Electron no adquiere rol de WM.

Tema Kairós Openbox: titlebar compacta, borde 1 px, botones geométricos y superficies/color equivalentes a tokens. Openbox no interpreta CSS; generar o mantener mapeo explícito y verificar captura comparativa. Bandeja XEmbed: protocolo separado de EWMH; status notifiers D-Bus pueden requerir host específico. OD-03 decide soporte inicial; mostrar controles propios sin fingir bandeja completa.

## Aceptación

Sesión Kairós inicia sola; Firefox/terminal aparecen encima; panel muestra ventanas externas con foco/minimizar/restaurar/cerrar; maximizar respeta panel; Alt+Tab funciona. Fijados ausentes se distinguen de apps abiertas. Crash de helper señala indisponibilidad; reinicio de shell no termina aplicaciones externas ni duplica Openbox. Un único reintento con backoff evita bucles de reinicio.
