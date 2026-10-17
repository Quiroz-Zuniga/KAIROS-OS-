# Correcciones de interfaz

Se revisaron el texto y las capturas de Prueba de Consola.docx. Solo se aplicó la sección de interfaz gráfica, respetando las restricciones del usuario sobre consola, terminal y ramas ajenas.

| Observación | Comportamiento implementado |
| --- | --- |
| Cuatro opciones de energía | Bloquear y suspender pausan el núcleo conservando ventanas; reiniciar y apagar cierran los procesos virtuales. Una pantalla permite continuar o encender. Los documentos se conservan. |
| Acciones del botón superior en Inicio | Inicio incluye Procesos y Energía. La barra superior conserva un acceso rápido a energía. |
| Arrastrar aplicaciones | Inicio y barra generan accesos; el escritorio permite moverlos. Los accesos y coordenadas se conservan al recargar. |
| Menú del fondo | Ver con tres tamaños, Ordenar por nombre/tipo/fecha, Actualizar, Nuevo y Propiedades. |
| Nuevo | Crea carpetas, texto, documentos Word simulados y contenedores ZIP simulados. |
| Menú de iconos | Abrir, propiedades, administrador simulado para aplicaciones, Abrir con para documentos y eliminación/restauración. |
| Clic en un espacio vacío | Cierra menús y minimiza las ventanas. Se recuperan con sus botones de restauración sin terminar procesos. |
| Buscador bloqueado | Chrome muestra resultados de un catálogo local y ofrece un enlace explícito de búsqueda web en otra pestaña; evita incrustar Google dentro del iframe. |
| Descarga de WinRAR | Un botón crea WinRAR-demo.exe en Descargas del explorador virtual. No descarga un binario real ni lo ejecuta. |
| Panel bloqueado de dispositivos | Controles virtuales de volumen, silencio y Wi-Fi; batería de ejemplo al 85 %. Sin lectura del hardware anfitrión. |
| Iconos iniciales | Papelera de reciclaje y Chrome visibles desde el primer acceso. |

## Decisiones y límites

**Terminal:** se omitió la sugerencia de abrir una terminal desde el menú contextual porque el usuario excluyó terminal y línea de comandos de este trabajo. Tampoco se modificaron idioma ni creación de cuentas de la consola.

**Administrador:** es una confirmación de demostración; abre la misma aplicación y no crea permisos de seguridad ni privilegios reales.

**Documentos Word y ZIP:** son tipos dentro del volumen virtual. El documento Word permite editar texto plano; el ZIP es un contenedor de demostración vacío. No son archivos DOCX/ZIP válidos para exportación. La interfaz informa de estas limitaciones al abrirlos.

**Aplicaciones multimedia:** cámara, clima, galería, videos y música usan demostraciones locales. Sus controles no acceden a dispositivos ni a archivos personales. Las aplicaciones locales conservadas, como calculadora, calendario, tareas y juego, siguen siendo parte del escritorio.

**Clic en el fondo:** minimizar conserva el trabajo abierto y cumple la petición de despejar el escritorio. No se cierran permanentemente las aplicaciones por hacer clic en el fondo.

**Documentación anterior:** los informes situados directamente en docs/ son antecedentes de la migración; sus descripciones del panel real y de UPHFS no representan el nuevo volumen de interfaz. Este manual documenta el comportamiento de esta revisión.
