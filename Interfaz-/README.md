# UPHOS · Interfaz de Rubén Quiroz

Simulación académica de escritorio en HTML, CSS y JavaScript. Esta parte se desarrolla en **interfaz-ruben-quiroz**. Los archivos del escritorio, las descargas de demostración, los procesos y los dispositivos son virtuales.

## Abrir la interfaz

Abrir index.html usando una vista previa HTTP del editor o un servidor estático existente y pulsar **Entrar a UPHOS**. La entrada del escritorio es resources/html/escritorio.html. No abrir mediante file://, porque se utilizan módulos JavaScript.

## Funciones

- Inicio con filtro de aplicaciones, Procesos y Energía.
- Bloquear, reiniciar, suspender y apagar únicamente la sesión simulada.
- Accesos de Chrome y Papelera; arrastre desde Inicio o la barra con persistencia al recargar.
- Menús de escritorio e iconos: Ver, Ordenar por, Actualizar, Nuevo, Propiedades, administrador simulado y Abrir con.
- Carpetas y documentos virtuales; editor con guardado, explorador y papelera con restauración.
- Chrome con catálogo de búsqueda local y búsqueda web explícita en otra pestaña; WinRAR-demo.exe es una descarga virtual sin binario real.
- Panel de volumen, Wi-Fi y batería de demostración. Cámara y multimedia sin permisos de dispositivos.

El clic en el fondo minimiza las ventanas; sus botones permiten restaurarlas. Los documentos Word y ZIP son representaciones de la simulación, sin exportación DOCX ni compresión real. El volumen de interfaz es independiente de UPHFS y de la consola situada en simulador/.

## Documentación con MkDocs

El [manual](docs/manual/index.md) explica el uso, las correcciones, la arquitectura y la verificación. [mkdocs.yml](mkdocs.yml) configura el sitio en español y requirements-docs.txt declara su dependencia. La compilación y publicación no se ejecutaron, respetando la petición de no usar terminal ni línea de comandos.

## Verificación

La prueba tests/desktop-corrections.js recibe una página de Playwright aislada y la URL de la interfaz. Comprueba las acciones mediante el navegador, sin shell. El [informe](docs/manual/verificacion.md) incluye resultados y límites. Los informes anteriores de docs/ se conservan como antecedentes; el manual actual describe esta revisión.
