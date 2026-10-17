# 21. Identidad y activos de Kairós OS

Nombre visible oficial **Kairós OS**, con acento; identificadores nuevos ASCII `kairos-*`. Concepto: momento oportuno, visión, orden y precisión. Evitar discurso religioso, estética gamer/cyberpunk, infantil y exceso de identidad AI.

## Fuente disponible y brecha

`Logo/Kairos.png` es referencia raster inspeccionada: búho simétrico azul/cyan, texto Kairós OS, sombras, degradados y detalles que requieren simplificación a tamaño pequeño. No existe un SVG oficial del búho en el árbol. Los SVG de calendario/papelera/wallpaper históricos no lo sustituyen. No hacer autotrace ni envolver PNG en SVG fingiendo vectorización. Dibujar geometría limpia conservando referencia y revisar manualmente antes de declarar activo oficial. No se generaron imágenes en esta entrega de análisis.

Activos futuros obligatorios bajo assets/branding/: kairos-logo.svg, kairos-symbol.svg, kairos-logo-light.svg, kairos-logo-dark.svg, kairos-symbol-light.svg y kairos-symbol-dark.svg. Convención: light = destinado a fondos claros (trazo navy); dark = destinado a fondos oscuros (ice/azul legible). Versiones sin sufijo: variante principal oscura para presentación; metadata/documentación explicará esta convención. No confiar solo en nombres para elegir contraste.

Búho geométrico reconocible, simétrico y sin elementos superfluos. Símbolo solo y composición con texto, fondo transparente y viewBox estable. Retícula de diseño y zona de seguridad de 1/4 de la anchura del ojo como propuesta inicial, ajustada por pruebas. Validar 16/24/32/64 px y versiones monocromas; eliminar detalles que desaparezcan. Sin placa decorativa; sombra casi imperceptible opcional en presentación, no baked-in en símbolo base. La adaptación de terminal no lleva K dentro del búho.

## Superficies

Favicon/launcher usan símbolo; About/login y splash admiten logo completo. GRUB y Plymouth requieren exportaciones raster en resolución apropiada desde SVG revisado; no asumir soporte SVG directo. No ocultar diagnósticos de arranque. About mostrará versión, build, kernel, arquitectura, base Debian y versión Desktop con «Based on Debian GNU/Linux». No alterar origen del kernel o atribuciones para aparentar independencia.

Wallpaper: navy/black, diagonales/polígonos sutiles y baja opacidad, sin competir con ventanas. Boot: fondo black, búho azul/cyan, texto white y animación mínima opcional. Branding no debe introducir pausas artificiales; respeta reduced-motion donde esté disponible.

## Licencias y entrega

Conservar fuente, autoría, licencia/permiso de logo, fuentes y recursos. No asumir derechos sobre música/vídeos por estar en el repositorio. Recursos sin permiso claro quedan fuera de la ISO hasta resolverlos. [06](06-ui-migration.md) define el mapa de migración; identificadores históricos se preservan.
