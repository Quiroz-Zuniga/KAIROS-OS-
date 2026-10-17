# 06. Identidad y evolución de interfaz

La marca visible del laboratorio es **KAIRÓS OS**. Los identificadores técnicos usan `kairos` y las variables de entorno `KAIROS_`.

## Cambio aplicado

- Títulos, mensajes, consola y escritorio usan la identidad nueva.
- Las hojas de estilo, eventos, clases, imágenes y canales IPC tienen nombres de la familia `kairos`.
- El logo raster proviene de `Logo/Kairos.png`; el wallpaper usa azul y cyan.
- Los namespaces de datos son `kairos-simulator`, `kairos.desktop.v1` y la carpeta privada `KAIROS` de Electron.
- Los datos de versiones anteriores no se borran ni se migran automáticamente. Consultar [datos y seguridad](guia/datos.md).

## Evolución propuesta

La nueva identidad no implementa la sesión Linux. El siguiente trabajo debe integrar la shell con Openbox, capacidades explícitas y aplicaciones nativas dentro de una VM. Los volúmenes, usuarios y procesos del simulador no deben tratarse como recursos Linux reales.

La familia SVG del búho, su legibilidad en tamaños pequeños y los assets de boot continúan pendientes. El logo actual es un archivo raster; no se presenta como vector oficial.

## Verificación

Las pruebas automatizadas verifican los contratos renombrados. El recorrido del escritorio debe cubrir entrada, ventanas, documentos, persistencia, energía y ausencia de errores de JavaScript. El sitio de documentación se genera con `mkdocs build --strict`.
