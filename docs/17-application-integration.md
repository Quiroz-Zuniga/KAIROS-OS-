# 17. Application Registry e integración nativa

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Estado: diseño; el catálogo actual apunta a HTML. Primer hito usa una entrada nativa validada; el registro completo sigue en semana 3.

Descubrir `$XDG_DATA_HOME/applications` (por defecto ~/.local/share/applications), `$XDG_DATA_DIRS/applications` (por defecto /usr/local/share y /usr/share), con prioridad XDG y Desktop File ID estable. Incluir subdirectorios según especificación. No tratar directorios de descargas como catálogo. Las entradas del usuario son configuraciones ejecutables de ese usuario: se lanzan por acción explícita y nunca se consideran administración confiable.

Leer Type, Name/locales, Exec, Icon, Categories, Terminal, MimeType, TryExec, Hidden, NoDisplay, OnlyShowIn/NotShowIn, DBusActivatable y StartupWMClass. Resolver ocultamiento/override y ejecutables faltantes. Un Icon puede ser nombre de tema o ruta; limitar tamaño y no insertar SVG de terceros inline en DOM. Mostrar nombre como texto.

Flujo: descubrimiento → normalización/cache → búsqueda/fijados → apps.launch(appId, documentos validados) → GIO → proceso/activación D-Bus → ventana X11 → Openbox → panel. appId no es PID ni XID. El resultado de launch confirma solicitud o error, no inventa que ya exista una ventana.

Delegar lanzamiento a GIO/GDesktopAppInfo siempre que sea posible. Un parser propio debe cubrir localización y códigos de campo, no `split(' ')`; Exec no pasa por shell. Terminal=true usa terminal configurada y argumentos seguros; DBusActivatable puede delegar a instancia existente. Probar espacios, comillas, %f/%F/%u/%U, %% y entradas inválidas. Fuente: [Desktop Entry](https://specifications.freedesktop.org/desktop-entry/latest/) y [Exec](https://specifications.freedesktop.org/desktop-entry/latest/exec-variables.html).

## Catálogo MVP

Firefox ESR, xterm/Bash, VSCodium recomendado y Files inicial real (Thunar o gestor nativo equivalente). Kairós Files propio es evolución; no bloquear el criterio de archivos reales por construir todo un gestor. Calculadora/calendario/tareas educativas pueden mantenerse como apps locales, sin afirmar que su PID virtual sea proceso Linux.

Archivos abiertos utilizan asociaciones GIO/xdg-open/xdg-mime con rutas y esquemas permitidos. No ejecutar EXE, .desktop o scripts descargados por extensión ni abrir URLs arbitrarias mediante una capacidad administrativa.

## Verificación

Cambiar una entrada local de prueba actualiza catálogo; override Hidden oculta; NoDisplay no aparece en launcher normal. Abrir dos ventanas y una app monoinstancia produce panel coherente. Entradas Terminal=true y rutas con metacaracteres no ejecutan shell adicional. Aplicación no instalada y fallo GIO devuelven error visible. No hay emulaciones HTML de Firefox, Code o terminal en modo Linux.
