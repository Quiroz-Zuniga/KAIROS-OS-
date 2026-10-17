# Arquitectura y comentarios

La interfaz conserva HTML, CSS y JavaScript modulares, sin modificar el sistema operativo anfitrión ni integrarse con la consola del otro desarrollador.

| Módulo | Responsabilidad |
| --- | --- |
| resources/html/escritorio.html | Estructura accesible del escritorio, menús, diálogo y pantalla de sesión. |
| resources/js/escritorio.js | Inicio, filtro, arrastre, menús contextuales, documentos y acciones de energía. |
| resources/js/system/controller.js | Vincula procesos virtuales con ventanas; permite minimizarlas y reiniciar la sesión gráfica. |
| resources/js/system/desktop-store.js | Lee/escribe el volumen de interfaz, crea elementos y valida nombres y duplicados. |
| resources/js/system/applications.js | Registro de rutas e iconos compartido por Inicio, barra y accesos. |
| resources/js/system/virtual-app.js | Catálogo de búsqueda, descargas de demostración, explorador, papelera y aplicaciones multimedia virtuales. |
| resources/js/system/hardware.js | Controles de dispositivos virtuales sin consultar el conector del equipo. |
| resources/js/editor.js | Editor existente conectado al volumen de interfaz para guardar y volver a abrir texto. |
| resources/css/desktop.css | Presentación del escritorio, menús, diálogo y estados de sesión, con adaptación móvil. |
| resources/css/virtual.css | Presentación de aplicaciones virtuales. |

## Persistencia

La clave localStorage **kairos.desktop.v1** guarda versión, tamaño de iconos y lista de elementos. Cada elemento tiene identificador, nombre y tipo. Los accesos guardan el identificador de aplicación y las coordenadas. Los documentos guardan contenido de texto y carpeta de origen. El campo deleted permite mover a la papelera y restaurar sin borrar el contenido.

Escritorio y Descargas son ubicaciones virtuales. Las carpetas nuevas actúan como contenedores navegables. La creación de elementos desde el menú contextual los sitúa en el escritorio. La sincronización de vistas usa eventos de almacenamiento y eventos internos de KAIROS. El editor y el explorador comparten el volumen; no existe sincronización con KAIROSFS de la consola. No se implementó edición simultánea con resolución de conflictos.

El rechazo de almacenamiento muestra un error en lugar de anunciar un guardado correcto. Los nombres se escriben como texto en el DOM para evitar interpretar etiquetas introducidas por el usuario.

## Ventanas y energía

Se conservó WindowManager para cerrar, minimizar, restaurar, mover y maximizar. El fondo solicita minimizar todas las ventanas. El reinicio cierra procesos mediante el núcleo virtual y lo vuelve a arrancar. El apagado lo deja detenido hasta pulsar Encender. El bloqueo y la suspensión son pausas gráficas, sin autenticación ni contraseña.

## Comentarios en el código

Los módulos modificados incluyen comentarios de Rubén Quiroz en los límites de responsabilidad: almacenamiento aislado, selección de documentos entre ventanas, arrastre, acciones de energía, guardado en el editor y controles virtuales. Se explica el propósito de las decisiones sin comentar cada instrucción.

## Ramas y alcance

La rama de trabajo comprobada fue **interfaz-ruben-quiroz**. Todos los archivos editados o creados en esta intervención están dentro de Interfaz-/. No se cambió de rama, no se editaron referencias de Git y no se hicieron commits, pushes ni merges. main y desarrolloJorge conservaron sus referencias. simulador/ y el código de consola permanecieron fuera del alcance.
