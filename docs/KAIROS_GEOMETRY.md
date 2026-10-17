# KAIROS_GEOMETRY — guía de construcción

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Retícula base de 4 px. Separaciones preferidas 4/8/12/16/24/32/48 px. Alineación a retícula y simetría en símbolo; alineación óptica revisada para iconos y texto. Evitar valores aislados repetidos.

| Elemento | Regla |
|---|---|
| Diagonales | 45° preferida en cortes de marca; no recortar campos de texto ni áreas clicables; otras diagonales solo por proporción del búho revisado |
| Líneas | Bordes 1 px en escala de referencia; trazo de iconos consistente 1.5–2 px; sin neón ni glow |
| Radios | 4 px controles, 6 px tarjetas, 8 px ventanas locales; maximizado 0; no siluetas móviles generales |
| Proporciones | Iconos sobre caja común 24×24; símbolo con área segura y ojos legibles a 16 px; no estirar ejes independientemente |
| Superficies | Planos sólidos diferenciados por color y borde; blur opcional mínimo y con fallback sólido |
| Ventanas | Titlebar compacta propuesta de 32 px, borde fino y controles geométricos coherentes; Openbox gestiona nativas |
| Panel | Altura inicial 48 px, grupos con separación 16/24; estado activo mediante línea y etiqueta accesible |
| Componentes | Botones rectangulares, campos alineados, jerarquía tipográfica sobria y listas en cuadrícula común |
| Sombras | Suaves y discretas; nunca sustituyen borde o contraste para distinguir elementos |
| Movimiento | 120–240 ms solo para cambios de estado; sin animación constante ni rebotes decorativos |

Minimizar: línea horizontal. Maximizar: cuadrado de trazo. Cerrar: dos diagonales precisas. Iconos con labels accesibles; no depender solo de tooltip o color. Target de interacción puede superar caja visual para accesibilidad sin deformar iconografía.

Wallpaper con pocas diagonales/polígonos de baja opacidad; búho reconocible por ojos y espacio negativo. Sin plumas realistas, fuego, 3D fuerte ni sombras pesadas. La referencia raster se simplificará, no se copiarán sus detalles automáticamente.

Aceptación: comparar shell sin logo y reconocer retícula/superficies/controles; misma geometría claro/oscuro; texto largo, escalado 125/150/200%, teclado y tamaños de VM de referencia sin solapamientos. Un valor fuera de escala exige motivo documentado en componente, no otro token global arbitrario.
