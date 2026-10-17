# Textos traducibles

`es.js` y `en.js` son catálogos centralizados con las mismas claves y parámetros. Español (`es`) es el idioma predeterminado; inglés (`en`) es seleccionable. Las etiquetas de los idiomas se muestran en su propio idioma.

Usar `traducir(clave, parametros)` desde `js/core/i18n.js`. No escribir mensajes de interfaz o errores directamente en los módulos. Los valores devueltos son texto plano: usar `textContent`, o escapar antes de construir HTML. Los parámetros se escriben como `{nombre}`. Una clave ausente devuelve `[clave]`; un idioma desconocido usa español.

La base no incluye pluralización, carga remota ni detección automática del idioma del equipo. La instalación guarda el idioma elegido. `es-HN` de instalaciones anteriores se interpreta como `es` sin reescribir datos.

Los comandos principales permanecen en español y ofrecen algunos alias en inglés. Las respuestas y ayuda siguen el idioma seleccionado, sin traducir rutas ni contenido de archivos. El historial previo conserva el texto ya mostrado. Sus textos están centralizados en estos catálogos. El aviso de JavaScript desactivado en `index.html` es un fallback estático en español, necesario cuando el traductor no puede ejecutarse.
