# 22. Design System y tokens de Kairós

Estado: especificación lista para implementación; aún no se importan tokens en la GUI. Ruta propuesta desktop/renderer/styles/tokens.css que compone colors.css, spacing.css, typography.css, shadows.css y components.css. Temas comparten geometría; no duplican componentes. HEX solo en definición central y adaptadores generados para Openbox/Plymouth/terminal.

## Paleta

| Token | HEX |
|---|---|
| --kairos-navy | #0B1F3A |
| --kairos-deep-blue | #123B73 |
| --kairos-blue | #1296F3 |
| --kairos-cyan | #19C2FF |
| --kairos-ice | #BFE9FF |
| --kairos-white | #F7FAFC |
| --kairos-light-gray | #DCE4EC |
| --kairos-steel-gray | #7D8FA3 |
| --kairos-graphite | #1C2733 |
| --kairos-black | #0A0F16 |

| Semántica | Oscuro principal | Claro |
|---|---|---|
| --bg-primary | #0A0F16 | #F7FAFC |
| --bg-secondary | #111923 | #EEF3F7 |
| --bg-tertiary | #1C2733 | #DCE4EC |
| --surface | #16212D | #FFFFFF |
| --surface-hover | #1E2C3B | #EAF4FC |
| --border | #2B3B4C | #C7D2DD |
| --text-primary | #F7FAFC | #0B1F3A |
| --text-secondary | #A8B4C2 | #4C6175 |
| --text-muted | #708090 | #7D8FA3 |
| --accent-primary | #1296F3 | #1296F3 |
| --accent-secondary | #19C2FF | #19C2FF |
| --accent-dark | #123B73 | #123B73 |

Referenciar paleta donde coincidan valores. Estados: --success #23C483; --warning #F4B740; --danger #E5484D; --info alias blue. No usar estados para decoración; acompañar con texto/icono. Tokens de foco y texto sobre acento se eligen por contraste medido: no asumir que blanco sobre azul o muted sobre claro cumplen para texto pequeño. Usar navy/black sobre acentos brillantes cuando corresponda; texto informativo activo no usa muted si falla contraste.

Gradiente de marca permitido: 135deg, navy 0%, deep-blue 45%, blue 75%, cyan 100%. Solo wallpaper/splash/login/About, no fondos de cada botón y ventana.

## Sistema reutilizable

| Grupo | Especificación inicial |
|---|---|
| Espaciado | --space-1…7: 4, 8, 12, 16, 24, 32, 48 px |
| Tipografía | UI Inter local; alternativa Noto Sans; terminal DejaVu Sans Mono; fallback sans-serif/monospace |
| Jerarquía | Display 32/40, heading 24/32, subheading 18/24, body 14/20, caption 12/16, monospace 13/20 px; pesos 400/500/600 |
| Bordes/radios | 1 px, radios 4/6/8 px; 0 en maximizado; evitar 20–40 px generales |
| Sombras | --shadow-panel: 0 2px 8px con negro a 10%; --shadow-window: 0 4px 16px al 14%; contraste de superficie primero |
| Movimiento | --duration-fast 120ms, --duration-normal 180ms, --duration-slow 240ms; opacity/transform; reduced-motion sin transiciones |
| Iconografía | Capa común outline 16/20/24 px, trazo visual 1.5–2 px; no mezclar familias en shell |
| Interacción | normal/hover/pressed/focus-visible/disabled/busy/error; foco visible además de color |
| Geometría ventana | Titlebar 32 px propuesta; borde 1 px; controles 28 px; áreas de interacción mínimas ajustadas por accesibilidad; panel 48 px |

Inter ya está vendorizada con licencia en Interfaz-/resources/vendor/. Comparar alternativas: Inter conserva aspecto y evita migración; Noto Sans aporta cobertura más amplia; DejaVu Sans Mono sirve para terminal y fallback Unicode. Hay paquetes [fonts-inter](https://packages.debian.org/trixie/fonts-inter) y [fonts-dejavu-core](https://packages.debian.org/trixie/fonts-dejavu-core) en trixie; fijar licencia/versión exacta en manifiesto. No imponer una fuente de red para boot offline.

La capa de iconos puede envolver Bootstrap Icons ya vendorizada para reutilizar licencias; seleccionar solo variantes outline y crear propios para búho/launcher. OD-09 cierra si basta esa familia o se requiere otra; no cargar dos bibliotecas nuevas sin necesidad.

## Verificación antes de integrar

Hoja de componentes con ambos temas, foco/disabled/error, labels largos y escalado; contraste de texto normal 4.5:1 y componentes esenciales 3:1 como objetivo; navegación por teclado y reduced-motion. Comparar Openbox y CSS con misma geometría. Tokenizar primero, cambiar una superficie y comparar capturas; no reemplazar todos los colores por búsqueda global.
