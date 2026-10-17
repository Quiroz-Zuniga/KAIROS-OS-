# Arquitectura de la interfaz UPHOS

Todos los archivos de esta entrega están dentro de `Interfaz-/`. El simulador hermano no se importa ni se modifica.

```text
Escritorio original → SystemController → VirtualSystem
                         ↕                    ↓
                   WindowManager        snapshot + eventos
                         ↕                    ↓
                   iframes existentes   Monitor / widgets
```

## Núcleo y contrato público

`resources/js/core/virtual-system.js` exporta `VirtualSystem`. No depende de DOM, temporizadores, almacenamiento, red, consola ni hardware. Se puede ejecutar con Node. Cada `getState()` entrega una copia serializable; `subscribe()` devuelve su cancelación.

- `boot`, `run`, `pause`, `step`, `tick`, `reset`, `shutdown` controlan el ciclo virtual. `tick` sólo avanza si está ejecutándose; `step` avanza exactamente un tick incluso en pausa.
- `createProcess`, `terminate`: PID monotónico, propietario/sesión opcionales sin autenticación, tipos application/system/service/simulation. Admisión NEW → READY; despacho → RUNNING; espera → BLOCKED; cierre → TERMINATED. Una sola CPU virtual.
- `setScheduler`: FCFS, SJF y Priority son no expropiativos. Round Robin rota al finalizar el quantum. Menor número indica mayor prioridad; desempates por llegada a READY. Las aplicaciones tienen ráfaga persistente (`null`) y los escenarios académicos una ráfaga finita. En FCFS una aplicación persistente ocupa la CPU hasta bloquearse/terminar; para uso del escritorio se elige Round Robin.
- Memoria: reserva de capacidad lógica en MB, sin direcciones físicas ni fragmentación. Admisión completa o error; terminar cancela E/S, libera reservas y recursos, y despierta esperas. Minimizar conserva el PID y la reserva.
- `requestIO`: espera determinista de ticks por solicitud; solicitudes independientes, sin modelar ancho de banda o exclusividad del dispositivo. `devices` refleja available/busy a partir de solicitudes pendientes.
- `createResource`, `acquire`, `release`: mutex de capacidad 1 o semáforo de capacidad N; propietarios y cola FIFO. No se detectan interbloqueos automáticamente.
- `setService`: contrato mínimo de estado del servicio lógico `desktop`; no controla servicios físicos ni desconecta la GUI al cambiar su indicador.
- Historial limitado a 200 eventos y 100 procesos terminados. Nunca descarta procesos activos. `reset` conserva la secuencia de PID para evitar identificadores obsoletos.

## Adaptación y ventanas

`resources/js/system/applications.js` conserva las rutas, iconos e identificadores originales; incluye alias del dock. Cada app admite una instancia. `SystemController` es el único puente al núcleo: admite el proceso antes de crear la ventana, compensa fallos y destruye ventanas terminadas desde el monitor. Un temporizador central genera ticks. Apagar destruye los procesos y vuelve al bloqueo; al entrar otra vez se inicia una simulación nueva. El reloj de la barra y los relojes de las aplicaciones siguen siendo independientes.

`WindowManager` conserva la cabecera y los controles, añade foco, arrastre limitado, redimensionado CSS, maximizar/restaurar y acceso de restauración fuera de la ventana minimizada. Sus listeners se cancelan al cerrar. Desmontar el iframe libera su documento; la cámara detiene tracks y el reproductor revoca URLs temporales mediante `pagehide`.

El monitor consulta el controller del escritorio padre. No importa el núcleo ni crea una segunda máquina. Las vistas de memoria, E/S, dispositivos, recursos, servicios y eventos se alimentan del mismo snapshot. Si se abre su HTML directamente, indica que debe abrirse desde el escritorio.

## Preferencias y capacidades posteriores

`preferences.js` valida datos de presentación y conserva claves de calendario, galería, tareas y wallpaper. JSON dañado y almacenamiento inaccesible no impiden el arranque; los errores de escritura tienen aviso visible. Los objetos URL de videos cargados duran lo que dura la ventana; no se guardan URLs caducadas. No se persisten snapshots como sesiones.

El bloqueo abre directamente el escritorio, sin login ni registro. No se leen, copian ni crean contraseñas. La GUI no incluye terminal. Los datos de usuario deberán proceder de la instalación cuando se conecte su contrato definitivo. Los registros previos permanecen sin modificar; no se crea un perfil ficticio. UPHFS queda pendiente de integración. El explorador conserva su HTML, pero no carga su antiguo VFS. El editor conserva edición/formato y comunica que guardar/listar no está disponible. Antivirus, clima y noticias declaran ausencia de proveedor.

Cámara, micrófono y búsqueda web dependen de permisos/proveedores externos; no representan dispositivos físicos administrados por el Core. Abrir la cámara no solicita permisos automáticamente.

## Tema y dependencias

`resources/css/uphos.css` define los diez colores solicitados. Se conservan la disposición, las rutas y los iconos de aplicaciones; por petición posterior, se sustituyeron el logo, el wallpaper y la lupa del sistema antiguo por la marca UPHOS. Las superficies usan azul institucional/profundo/noche; los acentos y el foco usan dorados. Tailwind se recompila desde `resources/src/input.css` sin perder los componentes originales.

`resources/vendor/` contiene dependencias con versión fijada, fuentes Inter y licencias. El shell, calendario e iconos no necesitan CDN. Las aplicaciones de terceros conservan sus recursos; algunas fuentes decorativas importadas por sus CSS siguen siendo opcionales y requieren conexión. El estilo de respaldo sigue funcionando sin ellas. No se descargan recursos al abrir las páginas principales.

## Monitor, calendario y lecturas del anfitrión

El menú contextual del dock abre el monitor registrado en `applications.js`. Sus paneles transforman snapshots y eventos en filas, tarjetas y estados legibles; ninguna vista mantiene otra instancia del núcleo. Las ventanas admiten dimensiones iniciales específicas sin perder maximizar/restaurar.

El calendario tiene un modelo puro en `resources/js/calendar/model.js` y una vista independiente en `calendar.js`. Valida fechas reales y rangos horarios, adapta el formato anterior de `calendar-events` y conserva el almacenamiento mediante `preferences.js`. Mes, semana y agenda comparten los mismos eventos y filtros. La semana organiza eventos coincidentes en columnas.

El estado físico se consulta mediante `hardware.js` → GET `/api/system-status` → `hardware-bridge.js` → `scripts/system_status.py`. El servidor local inyecta la ruta del conector en HTML; los servidores estáticos no lo anuncian. El adaptador usa comandos fijos, sin shell, con tiempo máximo y caché de 5 segundos. El servidor sólo escucha en 127.0.0.1 y restringe Host/Origin. Python consulta sysfs, pactl/wpctl y NetworkManager sin modificar la configuración del anfitrión. No persiste los resultados ni transmite nombres de redes a terceros. El refresco del panel es cada 15 segundos.

Este adaptador de lectura no forma parte de VirtualSystem: sus indicadores físicos no sustituyen los dispositivos virtuales ni alteran sus procesos. Los estados ausentes o las plataformas no compatibles se declaran explícitamente; el navegador ofrece su batería y conectividad cuando dispone de esas APIs. El volumen del anfitrión y los SSID no se inventan cuando no hay conector.
