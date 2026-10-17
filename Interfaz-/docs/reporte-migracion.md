# Migración aplicada a Interfaz-

Fecha: 15 de octubre de 2026. Rama de integración: `interfaz-ruben-quiroz`.

## Resultado y alcance

La interfaz existente se conecta a un núcleo virtual independiente mediante SystemController y un registro de aplicaciones. Se mantienen rutas, escritorio, dock, menú, ventanas, calendario y aplicaciones. Se incorporan la paleta de diez colores KAIRÓS OS, el logo proporcionado por el usuario con transparencia real, un wallpaper institucional SVG y una lupa dorada. Por instrucciones posteriores se retiraron las dos imágenes del logo Arvik, su lupa morada y los colores morados del shell y controles. Las preferencias que apuntaban a los fondos predeterminados anteriores dejan de seleccionarlos; las imágenes personales se conservan.

Todo el trabajo está en `Interfaz-/`. No se modifica `simulador/`, el sistema operativo anfitrión ni los cambios previos en `.gitignore`, `.agents/` o `skills-lock.json` de la raíz.

## Registro por etapa

| Etapa | Resultado aplicado | Evidencia |
| --- | --- | --- |
| E0 | Inventario del código y referencia inicial de bloqueo, acceso y escritorio; arranque reparado | `docs/evidencia/antes-*.png`, scripts dev/build |
| E1 | Núcleo implementado en esta carpeta sin importar ni duplicar servicios del simulador hermano | 14 pruebas headless, `tests/core.test.js` |
| E2 | Controller y registro conectan aperturas al Core, con compensación ante fallos y falta de RAM | Recorrido calculadora–PID–RAM |
| E3 | Foco, arrastre, resize, maximizar/restaurar, minimizar y cierre; cancelación de listeners y desmontaje de iframe | Pruebas de ventana y accesos, capturas móvil/escritorio |
| E4 | Tabla original ampliada a monitor de memoria, planificación, E/S, recursos, servicios y eventos | Snapshot único, escenarios y terminación externa |
| E5 | Todas las entradas originales se montan; capacidades ausentes se declaran explícitamente | Pruebas de rutas; matriz inferior |
| E6 | Build estático verificado en tres motores; documentación y evidencia | `browser-results.json`; alcance y límites declarados abajo |

## Aplicaciones

| Aplicación | Estado |
| --- | --- |
| Calculadora | Operación 2+3=5 verificada; minimizar/restaurar mantiene PID; cerrar libera RAM |
| Editor | Conserva edición y formato; guardar/listar declara KAIROSFS pendiente, sin backend ni tamaños inventados |
| Imágenes | Galería, selección y wallpaper conectados al documento padre; nuevo fondo institucional |
| Videos | Reproductor conserva sus botones al cambiar el video; errores visibles y URLs temporales liberadas |
| KAIRÓS OS Beats | Listas y reproductor conservados, sin autoplay obligatorio; error de medios visible |
| Pac-Man / temporizador | Vistas y relojes propios conservados; documento desmontado al cerrar |
| Tareas personales | Listas/árbol/hash conservados; preferencias validadas y texto de usuario escapado |
| Monitor | Núcleo único; consultas y acciones disponibles desde el escritorio |
| Explorador | Vista conservada, antiguo VFS aislado; conexión KAIROSFS pendiente |
| Terminal | Retirada de la GUI por instrucción posterior; sin acceso, ruta ni aplicación registrada |
| Acceso / registro | Retirados por instrucción posterior. El bloqueo abre el escritorio y los datos de usuario se conectarán desde la instalación |
| Cámara | Apertura sin pedir permiso automáticamente; reproducción solicita cámara mediante acción explícita, libera tracks al cerrar |
| Búsqueda | Entrada original conservada; consulta codificada para navegación externa |
| Clima / noticias / antivirus | Declaran ausencia de proveedor o motor; no publican valores/escaneos ficticios |

## Verificación

- `npm test`: **14/14** pruebas aprobadas. Incluyen invariantes de CPU/RAM, las cuatro políticas, E/S, mutex/semaphore FIFO, errores atómicos, límites del historial y reinicio sin reutilizar PID.
- `npm run build`: aprobado; `dist/` contiene todas las vistas, scripts y assets. No necesita el backend antiguo.
- `KAIROS_SERVE_DIR=dist npm run test:browser`: aprobado en **Chromium, Firefox y WebKit** usando ejecutables instalados. Resultado: `docs/evidencia/browser-results.json`.
- Recorrido verificado: desbloqueo → escritorio → aplicación → admisión/Core → ventana → operación → minimizar/restaurar → cerrar/liberar. También se prueban falta de RAM, terminación externa, escenario académico, paso de reloj, todas las entradas de apps, calendario, wallpaper, JSON dañado, arrastre/apertura/eliminación de acceso tamaño móvil 390×844 y apagado hacia la pantalla de bloqueo.
- Las solicitudes externas se bloquean durante las pruebas. No se detectan errores JavaScript ni respuestas locales 4xx/5xx en esos recorridos.
- Axe WCAG 2 A/AA sobre el **escritorio al finalizar los recorridos**: sin infracciones detectadas en los tres motores. No equivale a una auditoría completa de todas las aplicaciones o todos sus estados.
- Capturas posteriores en `docs/evidencia/despues-*.png`; referencias iniciales de tres pantallas en `antes-*.png`. No hay comparación automatizada píxel a píxel de todas las aplicaciones originales.

Los ejecutables disponibles para Firefox y WebKit pertenecen al runtime del entorno y se pasaron explícitamente con `KAIROS_FIREFOX_PATH` y `KAIROS_WEBKIT_PATH`. Los comandos reproducibles y las opciones están en el README.

## Límites y deuda pendiente

- KAIROSFS, sesiones, credenciales y terminal definitiva quedan expresamente para la fase posterior del plan. No se construyeron sustitutos provisionales.
- E/S y memoria son modelos académicos de capacidad/espera; no representan RAM física ni velocidad de hardware. El contrato mínimo de servicio sólo registra estado lógico. Ver `arquitectura.md` para semántica exacta de planificación y recursos.
- Las pruebas de apps comprueban su montaje, no cada función interna de cada aplicación de terceros. No se verificaron cámara/micrófono reales ni navegación contra proveedores externos.
- Algunas fuentes decorativas de las aplicaciones importadas siguen siendo opcionales por red; el shell, calendario, iconos y fuente Inter se sirven localmente con licencias.
- La auditoría local de dependencias reporta **7 avisos de herramientas de desarrollo** (5 altos, 2 moderados), en la cadena Tailwind 3 / globbing / PostCSS. Se aplicaron las actualizaciones compatibles. La corrección automática restante propone Tailwind 4 y cambia el sistema de estilos; no se forzó esa actualización. Informe completo: `docs/evidencia/dependency-audit.json`. La distribución no incluye `node_modules`.
- Las imágenes, música y código de aplicaciones recibidos con la carpeta se conservan. Las dependencias añadidas tienen sus licencias en `resources/vendor/licenses/`; no se afirma una auditoría legal de los assets originales.

## Logo transparente

Entrada original: `resources/assets/images/kairos-logo.png`. Activo aplicado: `resources/assets/images/kairos-logo-transparent.png`, PNG RGBA con alfa 0–255, sin placa blanca en CSS. La sombra tenue de presentación permite leer sus letras azules sobre fondos oscuros sin alterar el relleno. Wallpaper nuevo: `resources/assets/images/kairos-wallpaper.svg`.

Se usó el editor integrado `image_gen`, con la habilidad `imagegen`. Prompt final:

> Extract the provided KAIRÓS OS wordmark onto TRUE alpha transparency, suitable as a clean production website logo. Change ONLY white background to transparent. Keep every navy and gold letter interior fully opaque; preserve the original exact letter shapes and blue/gold colors. The hole of the O and P and gaps between letters must be EMPTY TRANSPARENT: no yellow or red specks, noise or residual pixels. All contours clean smooth antialiased, flat crisp logo. No new textures, no red, no black or white background, no fake checkerboard. Horizontal canvas tightly fitted to KAIRÓS OS with small clear transparent margins. Text exactly KAIROS.

## Integración Git

La carpeta `Interfaz-/` era nueva y no estaba versionada en este checkout; se integra completa para que la entrega sea ejecutable. Se revisó el contenido con `git diff --cached`, se verificó por rutas NUL que todos los archivos pertenecen a `Interfaz-/` y se excluyeron `node_modules/` y `dist/`. Comando de preparación: `git add -- Interfaz-`. Las modificaciones previas fuera de esa carpeta se conservan pendientes.

Mensaje del commit de integración: `feat(interfaz): migrar escritorio y aplicar identidad KAIRÓS OS`. Incluye la interfaz recibida, el Core/adaptadores, marca institucional, recursos locales, pruebas y documentación como una entrega funcional.

## Actualización posterior: retirar terminal y autenticación de la GUI

Por petición del usuario se eliminaron login, registro, su script y la terminal con su script, icono y entrada del registro de aplicaciones. El botón de entrada ahora abre el escritorio directamente; el bloqueo visual permanece. Se retiró el indicador de perfil invitado. No se inventan datos de usuario: se conectarán desde la instalación en una fase posterior. Las capturas iniciales de login son referencia histórica, no pantallas disponibles. Las pruebas comprueban que las tres rutas eliminadas responden 404 y que la terminal no puede lanzarse.

## Corrección de rutas para Live Server

La interfaz se probaba originalmente servida como raíz; al abrir `/Interfaz-/resources/html/escritorio.html` desde un servidor del repositorio, las rutas absolutas `/resources/` apuntaban fuera de la carpeta y dejaban la página sin estilos ni scripts. Se sustituyen por rutas relativas en HTML/CSS y rutas basadas en `import.meta.url` para el registro de aplicaciones y la navegación del escritorio. Las preferencias de imágenes resuelven su ubicación desde el script y admiten los formatos guardados anteriormente.

Se amplía la prueba de navegador para comprobar que la barra tiene estilos y que los logos/iconos se cargan. Se verifica el recorrido completo tanto bajo `/Interfaz-/` (servidor del repositorio, equivalente a Live Server) como desde la distribución `dist/` servida como raíz. No es necesario mover carpetas ni cambiar el puerto del servidor.

## Actualización: monitor, calendario y estado del equipo

Se añade **Ver procesos** al menú de la barra de aplicaciones, accesible por clic, clic derecho y teclado. El monitor sustituye los bloques JSON por tablas y tarjetas de procesos, memoria, colas, dispositivos/E/S, recursos, servicios y actividad. Incluye búsqueda, diálogo de nueva tarea y acciones con nombres legibles.

El calendario incorpora mes completo de seis semanas, semana con horarios y eventos simultáneos, agenda, mini calendario, categorías, búsqueda, editor de eventos y deshacer eliminación. Conserva los eventos antiguos y la identidad azul/dorada de KAIROS.

Se incorpora lectura real de batería, volumen/silencio y redes Wi-Fi mediante un conector local de Python 3 para Linux. Se verificaron las tres fuentes disponibles en este equipo. Se consulta la caché de NetworkManager; no se modifica el anfitrión ni se utiliza el micrófono. Los servidores estáticos mantienen las funciones disponibles del navegador y explican cómo abrir la versión local. Los datos de prueba del panel y las capturas son fixtures; la evidencia de la consulta real sólo guarda disponibilidad y códigos HTTP, sin SSID.

Verificación actualizada:

- 19 pruebas JavaScript: núcleo y modelo de calendario.
- 4 pruebas Python con fixtures: batería, audio y análisis de redes.
- Compilación de distribución aprobada.
- Recorridos completos en Chromium, Firefox y WebKit: procesos, E/S, memoria, recursos, calendario crear/editar/eliminar/deshacer, indicadores físicos con fixtures y funciones anteriores del escritorio.
- Axe WCAG 2 A/AA sin infracciones en los estados comprobados del escritorio, monitor, calendario mensual y agenda. No constituye una auditoría de todos los estados de todas las apps.
- Endpoint local real: GET 200, método de escritura 405, origen externo 403. Se comprueba también la inyección del conector bajo `/Interfaz-/`.

Referencias de capacidades: [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API), [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation) y [nmcli](https://networkmanager.pages.freedesktop.org/NetworkManager/NetworkManager/nmcli.html).
