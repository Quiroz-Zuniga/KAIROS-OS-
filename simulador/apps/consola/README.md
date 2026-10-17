# Terminal UPHOS

La terminal se abre al iniciar sesión o al elegir Probar UPHOS Live desde el arranque. No hay escritorio. El prompt es `usuario@uphos U:\home\usuario>`. Escribe directamente a su derecha y ejecuta con Enter. No hay botón Ejecutar ni selector gráfico de idioma.

La ayuda distingue los nombres de comandos en ámbar. Al completar un comando reconocido (incluidos sus alias), su nombre aparece en rojo; los argumentos permanecen en el color normal. Las coincidencias parciales o desconocidas no se resaltan. El color también se conserva en el registro de comandos ejecutados y al recorrer el historial. Estos estilos se definen con `--color-ayuda` y `--color-comando` en `consola.css`; `presentacion.js` gestiona rangos de texto, sin cambiar el análisis ni ejecutar contenido. Los resultados de archivos siguen siendo texto literal.

## Pestañas y atajos

- `+` o Alt+Mayús+T: abre una pestaña de consola.
- `×` o Alt+Mayús+W: cierra la pestaña activa; la última permanece abierta. Una pestaña con una operación en curso no puede cerrarse.
- Alt+Izquierda/Derecha: cambia de pestaña. Las flechas izquierda/derecha también navegan cuando el foco está en una pestaña.
- Arriba/Abajo: recorre el historial de la pestaña actual.
- Ctrl+L: limpia la salida visible, conservando historial.

Cada pestaña conserva su ruta, historial, salida, desplazamiento y entrada sin terminar. Todas comparten el usuario y los archivos virtuales. `js/core/sesiones-terminal.js` ordena las operaciones y actualiza los archivos antes de cada comando. Si otra pestaña elimina la carpeta actual, vuelve al hogar. Cerrar una pestaña no borra archivos. `reiniciar` y `apagar` terminan todas las pestañas de la sesión.

## Responsabilidades

- `analizador.js`: convierte entrada en nombre y argumentos; detecta comillas y escapes inválidos.
- `validador.js`: resuelve alias, comprueba cantidad de argumentos y opciones.
- `ejecutor.js`: llama al núcleo y presenta resultados traducidos.
- `interprete.js`: coordina las tres fases y muestra errores comprensibles.
- `registro-comandos.js`: catálogo y alias (120 principales; los alias son accesos alternativos).
- `pestanias.js`: estados independientes de pestañas y selección.
- `historial.js`: navegación arriba/abajo y restauración del borrador.
- `consola.js` y `consola.css`: interfaz de terminal.
- `js/core/terminal.js`: sesión, directorio actual y operaciones virtuales.
- `js/services/archivos.js`: rutas y operaciones de archivos.
- `js/persistence/repositorio.js`: guardado transaccional con revisión para evitar sobrescrituras entre pestañas.

## Sintaxis

Los nombres y rutas distinguen mayúsculas de minúsculas. Los argumentos se separan con espacios. Las comillas simples o dobles agrupan espacios; `""` representa texto vacío. La barra inversa separa rutas; antes de comillas, espacios u otra barra inversa actúa como escape. Agrupa rutas con espacios entre comillas. No hay expansión de variables, comodines, tuberías, redirecciones, cadenas de órdenes ni ejecución de código.

Las rutas absolutas comienzan con `U:\` (también se admite `/`); las relativas parten del directorio actual. Se admiten `.`, `..` y separadores repetidos. `entrar` sin ruta vuelve a `/home/usuario`. `volver` va al padre y `volver -` intercambia el directorio actual y el anterior. Subir desde la raíz mantiene `/`.

Solo pueden modificarse elementos dentro de `/home/usuario`; el hogar y las carpetas del sistema están protegidos. El padre debe existir. Copiar solo admite archivos; mover admite archivos y carpetas. Los destinos deben estar libres y no se sobrescriben. Escribir requiere un archivo existente y reemplaza su contenido. Límite inicial por archivo: 1 MiB.

Borrar una carpeta con contenido requiere `-recursivo`. No hay papelera ni deshacer en esta fase. No se puede borrar el directorio actual ni sus antecesores.

## Catálogo

La tabla de los 120 comandos, sus argumentos y funciones está en [GUIA-CONSOLA.md](../../GUIA-CONSOLA.md). La ayuda del propio sistema se consulta con `ayuda` o `ayuda comando`.

## Ejemplo

```text
crear carpeta "mis documentos"
entrar "mis documentos"
crear archivo nota.txt
escribir nota.txt "Hola UPHOS"
leer nota.txt
copiar nota.txt copia.txt
mover copia.txt final.txt
archivos
volver
volver -
```

Los archivos se conservan al recargar. Ruta actual e historial solo duran durante la sesión. `limpiar` limpia la salida, pero mantiene el historial. Flecha abajo al final restaura la entrada que estabas escribiendo.

Español es predeterminado; `idioma en` cambia respuestas, ayuda y errores a inglés. `idioma es` vuelve a español y `idioma` consulta la selección actual. Afecta a todas las pestañas durante la sesión, sin modificar nombres, contenido, sintaxis ni preferencias guardadas. Los mensajes anteriores del registro no se reescriben al cambiar idioma.

`usuarios` consulta las cuentas instaladas y nunca muestra credenciales. Procesos y memoria son modelos simulados (dos procesos y 128 MiB lógicos con una base de 24 MiB más contenido). `reiniciar` vuelve al arranque; `apagar` cierra la sesión y presenta el estado apagado. Ninguno reinicia ni apaga Windows.

No se usa `eval` ni se ejecutan comandos de Windows. En el navegador se usa IndexedDB; en Electron, el puente de almacenamiento escribe únicamente en la carpeta privada de UPHOS.

## Reinstalación y ayuda contextual

La cuenta instalada muestra `reinstalar` en la ayuda. Sin argumentos solo informa qué datos se perderán. `reinstalar confirmar` borra la instalación después de comprobar revisión y fecha, termina todas las consolas y abre el instalador. Un fallo de almacenamiento conserva la sesión. Esta orden no está disponible en Live.

Live ofrece `configurar`, `particionar`, `formatear` e `instalar` en su ayuda. Estas órdenes no aparecen en la ayuda de la cuenta instalada. La instalación usa una rueda azul y dorada durante aproximadamente diez segundos y vuelve automáticamente al acceso. El ritmo es una capa de presentación compartida con el asistente gráfico.


Consulta el catálogo actualizado y ejemplos en [GUIA-CONSOLA.md](../../GUIA-CONSOLA.md). El acceso inicial se gestiona en `acceso.js`, separado del intérprete.


## Editor, entrada segura y red

`editor.js` monta el editor de texto sobre la consola; no implementa un escritorio. Ctrl+G muestra ayuda, Ctrl+O/Ctrl+S guarda y Ctrl+X sale con confirmación cuando hay cambios. Guardar invoca al núcleo; la comparación del contenido original evita perder cambios de otra pestaña. La cancelación conserva el texto mientras se decide qué hacer.

`secretos.js` localiza solamente el argumento de contraseña, incluyendo entradas incompletas. No oculta el nombre de usuario ni su nombre completo. Se recomienda introducir la clave en la entrada oculta que solicita `cuenta crear usuario "Nombre"`, en lugar de incluirla en la orden.

`catalogo-ampliado.js` registra 70 órdenes nuevas, sumadas a las 50 anteriores. Las implementaciones se distribuyen entre comandos-archivos.js, comandos-configuracion.js y red.js. Las mutaciones usan una copia, se validan y se publican después de guardar; los errores dejan el estado anterior. `ocultar` afecta a `archivos`; `archivos -todo` incluye los elementos ocultos. `sololectura` bloquea escrituras hasta usar `escribible`.

`ping` es una comprobación del modelo de conectividad, no una prueba de acceso real a Internet. `ip` y `red` muestran la misma dirección almacenada para esta instalación. Las tablas DNS, rutas y puertos son virtuales.
