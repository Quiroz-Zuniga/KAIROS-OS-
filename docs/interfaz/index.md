# Interfaz gráfica de KAIRÓS OS

Esta documentación describe el escritorio web de KAIRÓS OS. El escritorio permite abrir aplicaciones, organizar accesos, crear documentos y probar estados de energía dentro de una simulación académica.

El código fuente está en Interfaz-. La consola y el instalador de simulador/ pertenecen a un alcance independiente y no se modificaron para estas correcciones.

## Uso desde el navegador

Abrir Interfaz-/index.html con la vista previa HTTP del editor o con un servidor estático ya disponible. Pulsar **Entrar a KAIRÓS OS**. Los módulos requieren HTTP; abrir directamente un archivo mediante file:// no proporciona el entorno de módulos necesario.

1. Usar Inicio para buscar aplicaciones por nombre y abrirlas.
2. Arrastrar una aplicación desde Inicio o la barra al escritorio para crear un acceso.
3. Hacer clic derecho en el fondo para ver opciones de tamaño, orden, actualización y creación de elementos.
4. Hacer clic derecho sobre un icono para abrirlo, consultar propiedades o quitarlo.
5. Abrir Chrome y buscar Wikipedia, KAIRÓS OS o WinRAR en el catálogo de demostración.
6. Usar el botón de energía de Inicio o de la barra superior para bloquear, reiniciar, suspender o apagar KAIROS.

## Documentación con MkDocs

El sitio principal se configura en `mkdocs.yml` en la raíz del repositorio. Incluye este manual, la arquitectura actual, los comandos de desarrollo y las propuestas de evolución. Usa MkDocs Material y validación estricta en GitHub Actions.

## Alcance de la simulación

Los archivos del escritorio se guardan en el almacenamiento del navegador, bajo una clave propia de la interfaz. No se ejecutan instaladores EXE, no se comprimen archivos reales, no se solicitan permisos de cámara o micrófono y los controles de Wi-Fi, sonido y batería son virtuales. El funcionamiento usa memoria y almacenamiento del navegador, como cualquier aplicación web.

Una búsqueda web externa se abre únicamente cuando el usuario pulsa el enlace correspondiente; sale a una pestaña del navegador. El catálogo interno funciona sin consultar buscadores externos. Eliminar los datos del sitio elimina los documentos virtuales, y cambiar de origen o puerto crea un almacenamiento independiente.

Consulta [las correcciones](correcciones.md), [la arquitectura](arquitectura.md) y [la verificación](verificacion.md).
