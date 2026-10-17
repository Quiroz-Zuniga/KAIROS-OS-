# Evidencia histórica de las correcciones

> Reporte de una revisión anterior. Sus resultados, ramas, capturas y límites corresponden a aquella ejecución. Para validar el código actual, ejecutar las pruebas indicadas en el manual técnico.

Revisión realizada el 16 de octubre de 2026. El recorrido ejercitó acciones del escritorio, almacenamiento del navegador, ventanas de aplicaciones y reapertura de datos. Se usó Chrome automatizado con Playwright mediante APIs de JavaScript, con un origen HTTP local y contextos de prueba aislados. No se usó terminal ni línea de comandos.

## Resultados

**21 comprobaciones aprobadas** en el recorrido reproducible de tests/desktop-corrections.js:

| Área | Evidencia funcional |
| --- | --- |
| Inicio y escritorio | Papelera y Chrome iniciales; filtro por Calculadora; arrastre desde Inicio y acceso conservado al recargar. |
| Ventanas | Clic en fondo minimiza; restaurar vuelve a mostrar; cierre retira la ventana. |
| Documentos | Creación de texto, guardado y lectura después de recargar; Abrir con carga el contenido en el editor original. |
| Papelera | Eliminar retira el icono; Restaurar lo devuelve. |
| Navegador | Wikipedia devuelve resultado local; enlace web usa una pestaña externa; WinRAR-demo.exe aparece en Descargas. |
| Dispositivos | Cambio de volumen a 23 % y desconexión de Wi-Fi afectan solo los controles virtuales. |
| Energía | Bloquear y Suspender pausan; Reiniciar vuelve al núcleo activo y cierra ventanas; Apagar detiene el núcleo y cierra ventanas. |
| JavaScript | Sin errores de página durante el recorrido aprobado. |

Otras **cinco comprobaciones** verificaron la navegación de una carpeta nueva, los avisos de formato simulado de Word y ZIP, el rechazo de nombres duplicados y la confirmación de administrador simulado antes de abrir Chrome.

Las capturas revisadas corresponden a una pantalla de escritorio de 1366 × 900 y una móvil de 390 × 844. El menú Inicio se mantiene dentro de la pantalla y la vista móvil no presenta desbordamiento horizontal. Los archivos de evidencia de esta revisión están en docs/evidencia/correcciones-interfaz/.

## Correcciones encontradas durante la prueba

Se ajustó la posición de Inicio para medir el panel visible antes de colocarlo sobre la barra. Se restauró la hoja de estilos compartida de ventanas para conservar altura y controles utilizables. La prueba del editor espera a que termine la carga del documento antes de validar el texto.

El Firefox disponible no coincidía con la versión esperada por la biblioteca y su operación automática de rellenado de texto no era fiable. El recorrido aprobado se ejecutó con Chrome instalado. No se declara validación completa en Firefox ni WebKit para esta revisión.

## Límites

La búsqueda interna consulta un catálogo de demostración, no un índice de toda la web. Se verificó la URL y apertura externa del enlace de Google; no se verificaron los resultados reales de Google. La descarga es un registro virtual; no se descargó WinRAR real ni se ejecutó un instalador.

Los dispositivos usan valores de demostración. No se verificó ni modificó hardware del equipo. El bloqueo no autentica usuarios. Los documentos Word y ZIP no son exportables en sus formatos reales.

La configuración y las páginas de MkDocs se revisaron como archivos fuente. **No se ejecutó el compilador de MkDocs** por la restricción de línea de comandos. No se regeneró dist/, no se publicó un sitio y no se modificó el ejecutable de consola.

## Ramas

Al terminar, HEAD continuaba apuntando a interfaz-ruben-quiroz. Se compararon las referencias de main y desarrolloJorge con las leídas al inicio y permanecieron iguales. Todos los cambios de esta intervención se limitaron a Interfaz-/; no se hicieron operaciones de publicación ni integración de ramas.
