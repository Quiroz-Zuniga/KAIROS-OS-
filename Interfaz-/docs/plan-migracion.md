# Plan de migración y adaptabilidad de UPHOS

**Fecha:** 15 de octubre de 2026.  
**Estado:** implementación aplicada dentro de `Interfaz-/`; validación y límites en [reporte-migracion.md](reporte-migracion.md).  
**Objetivo:** migrar la lógica del proyecto hacia un núcleo virtual reutilizable, conservando la interfaz existente, sus aplicaciones y los flujos que utiliza el usuario.

## 1. Criterio rector y prioridad de requisitos

**Adaptar la lógica; preservar la experiencia del usuario.** La migración no autoriza reemplazar el escritorio por un dashboard ni rehacer las aplicaciones para ajustarlas a una arquitectura nueva. La arquitectura debe ofrecer adaptadores para los componentes existentes.

Este plan toma como base las dos especificaciones proporcionadas: «Transformar el simulador antiguo en un núcleo de sistema operativo virtual reutilizable para UPHOS» y «Migrar y adaptar la interfaz antigua para convertirla en la GUI oficial de UPHOS», junto con la corrección posterior del usuario de conservar toda la interfaz.

Cuando las especificaciones anteriores sugieran otro fondo, iconografía o distribución, prevalece la instrucción de preservar la interfaz. La instrucción del 15 de octubre de 2026 autoriza aplicar los diez colores institucionales a las superficies y controles. Los tokens institucionales `#181858` y `#E8A810` se incorporarán sin sustituir sus fondos, iconos y controles. La adaptación de marca incluye nombres, textos, metadatos y los colores autorizados; no cambia fondos, iconos ni la composición del escritorio.

Preservar una pantalla no obliga a conservar una dependencia defectuosa, una contraseña en texto plano o métricas inventadas. Se conservará su presentación y se cambiará el comportamiento interno, haciendo explícita cualquier capacidad aún no disponible.

## 2. Estado comprobado del repositorio al redactar el plan

Inspección del checkout con referencia Git `eff5903`:

| Elemento | Estado observado | Implicación |
| --- | --- | --- |
| Tecnología | HTML, CSS y JavaScript; Tailwind/PostCSS en herramientas de desarrollo | Adaptar el stack actual; no introducir React, Next.js o Electron para esta migración |
| Entrada | `index.html`: desbloqueo, fondo, logo y reloj originales | Mantener la pantalla y su composición |
| Escritorio | `resources/html/escritorio.html`: barras, dock, menú, calendario, propiedades y accesos | Es la base visual; no crear otro shell paralelo |
| Ventanas | `resources/js/template.js`: clase WindowManager y creación de ventanas | Evolucionar la implementación existente |
| Lanzamiento | Registro y eventos de aplicaciones dentro de `resources/js/escritorio.js` | Extraer responsabilidades gradualmente, manteniendo IDs y selectores compatibles |
| Procesos | `resources/js/procesos.js` consulta `localhost:8080/api/usuarios/procesos` | Sustituir por consultas al futuro contrato público del Core |
| Editor | Operaciones mediante Axios contra `localhost:8080`; peso generado con `Math.random()` | Conservar controles; eliminar datos ficticios y preparar el adaptador de archivos |
| Usuarios | `resources/js/user.js` almacena contraseñas en localStorage | Aislar ese mecanismo; no convertirlo en autenticación definitiva |
| Recursos externos | CSS, fuentes, scripts e iconos mediante CDN | Inventariar y servir localmente los recursos necesarios, manteniendo su apariencia y licencias |
| Fullscreen | Solicitudes automáticas desde scripts del escritorio y otras entradas | Pasar a una acción explícita; la presentación no dependerá de su aceptación |
| Core y pruebas | No existen actualmente `src/`, `tests/` ni reportes de migración en este checkout | No asumir que la implementación descrita en mensajes anteriores está disponible |
| Desarrollo | `npm run dev` apunta a `src/input.css`, ausente en el checkout | Reparar el arranque antes de usarlo como criterio de validación |

Hay modificaciones locales previas en `package.json` y `readme.md`. Deben preservarse e incorporarse con cuidado. Este documento no modifica código de aplicación, dependencias ni configuración.

Las entregas mencionadas previamente son contexto histórico, no evidencia de implementación presente. Durante la ejecución se buscará primero una versión recuperable del Core; si no existe, se implementará incrementalmente según la especificación, sin inventar un simulador previo que no está en este repositorio.

## 3. Contrato de preservación de interfaz

Antes de modificar lógica se creará una referencia visual e interactiva del estado actual. Cada pantalla tendrá capturas, selectores relevantes, acciones y resultado esperado. Los defectos existentes se anotarán para distinguir una corrección de una regresión.

| Superficie | Debe conservarse | Adaptación interna permitida |
| --- | --- | --- |
| Desbloqueo | Fondo, reloj, fecha, logo, posiciones y acceso | Separar bloqueo visual de sesión y de boot; retirar fullscreen automático |
| Login y registro | Tarjetas, campos, fondos y navegación reconocible | Aislar credenciales inseguras; explicar indisponibilidad hasta integrar sesiones reales |
| Escritorio | Wallpaper original o elegido, barra superior y área de trabajo | Separar sus controladores, limpiar eventos y evitar recargas que reinicien el sistema |
| Dock y menú | Iconos originales, orden, tamaños, distribución y accesos | Centralizar el registro; vincular actividad a procesos reales |
| Ventanas | Cabecera, controles, aspecto y acciones conocidas | Mejorar foco, z-index, límites, restauración y liberación de listeners |
| Calendario | Presentación, navegación y edición de eventos | Extraer su lógica sin mezclar fechas personales con ticks de simulación |
| Accesos y contexto | Arrastrar, colocar, abrir, eliminar y ver propiedades | Validar posiciones y datos sin cambiar el flujo |
| Aplicaciones | Pantallas, controles, recursos y funciones válidas | Adaptar sus servicios y ciclo de vida sin sustituir sus vistas |
| Procesos | Tabla y ruta existentes | Alimentar sus filas desde snapshots; añadir capacidades sin eliminar la vista antigua |
| Widgets | Posición, contenedores y jerarquía | Conectar métricas reales; indicar ausencia de proveedor para clima/noticias |

Se mantienen rutas e IDs relevantes durante la transición, incluidos `windowsContainer`, `boton-inicio`, `menu-inicio` y las clases de las barras. Si se requiere retirar uno, se documentarán sus consumidores y su sustitución compatible antes del cambio.

Las mejoras de accesibilidad y responsive deben respetar esa composición. No se reemplazarán iconos originales por otra biblioteca o emojis como decisión incidental de refactorización. Los nuevos paneles del sistema se abrirán como aplicaciones o extensiones de la vista de procesos, sin ocupar permanentemente el escritorio ni reemplazar el menú.

## 4. Arquitectura objetivo

```text
Interfaz original y aplicaciones existentes
                    │
     WindowManager / ApplicationRegistry
                    │
           SystemController
                    │
             API pública Core
                    │
              VirtualSystem
                    │
 Processes · Scheduler · Memory · I/O · Resources
            Services · Devices · Events

CLI futura ─────────► misma API pública
Adaptadores futuros ► contratos de capacidades
```

### Núcleo: única fuente de estado del sistema

- Process Manager: PCB, PID, estados `NEW`, `READY`, `RUNNING`, `BLOCKED`, `TERMINATED` y transiciones validadas. Tipos `application`, `system`, `service`, `simulation`; campos de propietario y sesión preparados sin autenticar.
- Scheduler: estrategias FCFS, SJF, Priority y Round Robin, conservando cualquier implementación válida recuperada. No dependerá de ventanas ni del tiempo real.
- Memoria: RAM lógica configurable, asignación/liberación, insuficiencia y datos consultables. La política inicial y su semántica se documentarán antes de integrarla.
- E/S: solicitudes, espera y finalización mediante ticks; dispositivos virtuales como disk0, keyboard0, mouse0, display0, network0 y audio0.
- Recursos: mutex/semaphore, propietarios y colas de espera. Servicios y dispositivos con contratos mínimos, sin administrar hardware real.
- Reloj: ticks discretos y deterministas. La hora de la barra, el calendario y el temporizador son conceptos de presentación o utilidad independientes.
- Eventos y snapshots: datos serializables, consultas sin referencias mutables internas e historial acotado. La GUI no reconstruye otra máquina de estados.

API objetivo conceptual: `initialize`, `boot`, `tick`, `step`, `run`, `pause`, `reset`, `shutdown`, `getState` y consulta de eventos. Los nombres definitivos se ajustarán al código recuperado o implementado y se documentarán. El snapshot cubrirá status, clock, cpu, processes, queues, memory, io, resources, services, devices y scheduler.

El Core funcionará en pruebas sin DOM, consola interactiva, almacenamiento ni temporizadores obligatorios. No ejecutará comandos del anfitrión ni administrará procesos, RAM, usuarios, particiones o servicios físicos.

### Capa de adaptación

SystemController será el único puente de la GUI hacia la API pública: arranque, acciones, consulta de estado, traducción de errores y actualización de vistas. Usará eventos públicos si existen; de lo contrario, una observación centralizada y cancelable. No habrá un timer de simulación por ventana.

ApplicationRegistry centralizará ID, nombre, icono original, entrada existente, tamaño, política de instancias, memoria virtual y capacidad disponible. No sustituirá las vistas de las aplicaciones. Se conservarán inicialmente sus nombres internos mediante alias cuando evite romper accesos existentes.

WindowManager conservará estado visual y delegará el ciclo de vida del proceso al controller. Cada instancia real de aplicación tendrá una asociación inequívoca con su PID. No se generarán PIDs a partir de IDs del DOM, `Date.now()` o valores aleatorios.

Contratos de archivos, sesiones y plataforma sólo se introducirán cuando tengan un consumidor concreto. Un contrato pendiente devolverá un resultado explícito de capacidad no disponible; no un éxito ficticio.

### Estado y errores

| Estado | Propietario | Persistencia en esta fase |
| --- | --- | --- |
| Procesos, RAM, CPU, scheduler, E/S, servicios y ticks | Core | En memoria; no persistir snapshots como si fueran sesiones |
| Foco, ventanas, posición, tamaño y pestaña | GUI | Preferencias visuales validadas cuando corresponda |
| Tema, wallpaper y eventos personales | GUI o aplicación | Conservar datos válidos y claves existentes con migración versionada si fuera necesaria |
| Archivos virtuales y credenciales | Implementaciones definitivas futuras | No crear otro VFS ni otro almacén de contraseñas |

Los datos provenientes de formularios, almacenamiento, aplicaciones o mensajes se validarán en su frontera. Los errores tendrán un mensaje visible y diagnóstico disponible; no se ocultarán con capturas vacías. Se conservarán preferencias personales sin copiar contraseñas en texto plano a una solución nueva.

## 5. Matriz de adaptabilidad de aplicaciones

| Aplicación/capacidad | Decisión para esta migración | Comprobación de aceptación |
| --- | --- | --- |
| Calculadora | Mantener HTML, teclado y operaciones; asociar ventana a proceso | Operación conocida correcta, minimizar conserva PID y cerrar libera RAM |
| Editor | Mantener formato y controles; separar operaciones de archivos del backend antiguo | Edición válida; guardar/listar informa su capacidad real, sin tamaños aleatorios ni archivos ficticios |
| Imágenes y wallpaper | Mantener galería, selección y cambio de fondo | La selección llega al escritorio correcto y se conserva sin alterar el Core |
| Video y Arvik Beats | Mantener reproductores y listas; administrar su limpieza al cerrar | Controles operativos; errores de medios visibles y sin reproducción residual tras cierre |
| Pac-Man y temporizador | Mantener aplicaciones y sus relojes propios | Funcionan sin convertirse en otro reloj de simulación; limpieza al cerrar |
| Gestor de tareas personal | Mantener listas, árbol/hash y datos válidos de la aplicación | No confundir tareas personales con procesos del sistema |
| Vista de procesos / System Monitor | Adaptar primero la tabla existente; añadir vistas para memoria, scheduler, E/S, recursos, servicios, dispositivos y eventos | Todos los datos y acciones provienen del mismo Core |
| Terminal antigua | Conservar acceso y referencia visual; aislar comandos antiguos | No ejecutar comandos reales ni construir otra terminal provisional |
| Explorador antiguo | Conservar presentación y acceso; preparar conexión posterior | No crear otro árbol de archivos que compita con UPHFS |
| Login, registro y usuario | Conservar pantallas; aislar autenticación local insegura | Sin contraseñas nuevas en texto plano ni afirmaciones de sesión autenticada |
| Cámara, búsqueda y clima | Revisar proveedores y permisos actuales; conservar vista y acceso | Sólo declarar disponible lo comprobado; no confundir permisos del navegador con dispositivos virtuales |
| Antivirus | Conservar presentación; revisar qué representa su análisis | No presentar un escaneo simulado como protección real del equipo |
| Configuración y Acerca de | Añadir sólo preferencias de GUI y descripción honesta de UPHOS | Tema funcional y declaración de sistema operativo virtual simulado |

Una capacidad no disponible seguirá siendo reconocible desde su acceso original y mostrará su estado. La disponibilidad y las restricciones quedarán registradas por aplicación. No se borrarán aplicaciones sólo para reducir el trabajo de integración.

## 6. Etapas de ejecución y puertas de salida

### E0. Línea base visual y diagnóstico reproducible

1. Registrar Git, cambios locales, rutas, assets, dependencias y entradas de todas las aplicaciones.
2. Reparar el comando de desarrollo con el menor cambio necesario; no regenerar CSS de forma que cambie la apariencia sin comparación.
3. Capturar desbloqueo, login, registro, escritorio, menú, calendario, propiedades y cada aplicación en sus estados relevantes.
4. Registrar flujos válidos, errores actuales, servicios ausentes y llamadas externas. Establecer referencias en 1366×768, 1920×1080 y 2560×1440; comprobar usabilidad de ventanas pequeñas.

**Salida:** inventario y evidencia visual versionables; ejecución local reproducible; lista de defectos previos separada de las regresiones. Ningún reemplazo de interfaz.

### E1. Recuperar o construir el Core independiente

1. Verificar si existe una entrega recuperable compatible y revisar su API y pruebas antes de reutilizarla.
2. Si falta, implementar por bloques: dominio/procesos/reloj → scheduler/memoria → E/S/recursos → servicios/dispositivos → snapshots/eventos.
3. Preparar FileSystemPort y asociaciones owner/userId/sessionId sin implementar VFS ni autenticación.
4. Documentar políticas, unidades, transiciones, procesos persistentes y ciclo de vida. Mantener escenarios académicos y ejecución headless.

**Salida:** pruebas de cada gestor, invariantes y serialización aprobadas; Core independiente de UI, navegador y persistencia. No declarar esta etapa terminada por existir sólo una fachada.

### E2. Crear la frontera de integración sobre el escritorio existente

1. Introducir SystemController y registro central con alias de compatibilidad.
2. Separar responsabilidades de escritorio sin sustituir su HTML/CSS. Evitar listeners duplicados entre scripts antiguos y nuevos.
3. Adaptar abrir/cerrar una calculadora como primer recorrido vertical: acción existente → admisión del Core → ventana original → cierre y liberación.
4. Tratar insuficiencia de memoria, lanzamiento fallido y terminación externa sin ventanas o procesos huérfanos.

**Salida:** recorrido verificable con PID y RAM reales, misma apariencia, resto del escritorio accesible.

### E3. Estabilizar ventanas, dock y estado visual

1. Mejorar WindowManager existente: foco, orden de apilado, minimizar, maximizar/restaurar, arrastre y límites.
2. Liberar listeners, timers y medios de cada aplicación al cerrar. Revisar eventos entre documentos si las aplicaciones se montan en iframes.
3. Vincular actividad del dock al proceso y ventana correctos; preservar iconos y posiciones.
4. Mantener arrastre de accesos, calendario y propiedades; validar almacenamiento personal y separar bloqueo visual de autenticación.

**Salida:** abrir/minimizar/restaurar/cerrar repetidamente no duplica procesos ni listeners; reloj virtual y preferencias no se mezclan.

### E4. Conectar procesos y observación del sistema

1. Sustituir la consulta al backend de procesos por el snapshot público conservando la tabla existente.
2. Añadir System Monitor como aplicación complementaria, sin transformarlo en el escritorio predeterminado.
3. Conectar sus vistas a datos reales; exponer sólo operaciones soportadas y paginar historiales/tablas cuando sea necesario.
4. Usar eventos reales de boot, sin retrasos de carga artificiales. Las notificaciones mostrarán fallos relevantes, no cada tick.

**Salida:** crear y terminar procesos, cambiar política, avanzar/pausar, solicitar E/S y gestionar recursos/servicios produce cambios coherentes en todas las vistas.

### E5. Adaptar aplicaciones y dependencias una por una

1. Seguir la matriz de aplicaciones; conservar su interfaz y comportamiento válido antes de extraer lógica.
2. Sustituir llamadas al backend ausente por capacidades reales o indisponibilidad explícita.
3. Consolidar dependencias visuales locales con licencias y versiones; comparar fuentes, iconos y espaciado tras cada cambio.
4. Implementar temas y accesibilidad de forma incremental. Retirar código antiguo sólo después de demostrar que su sustituto cubre el mismo flujo.

**Salida:** cada aplicación tiene estado documentado, regresión funcional y evidencia visual; no hay servicios ficticios activos.

### E6. Cierre y preparación de adaptadores futuros

1. Ejecutar la matriz final de pruebas, comprobaciones de arquitectura, build y revisión de dependencias.
2. Revisar cada pantalla contra su referencia original; documentar diferencias intencionales y su motivo.
3. Actualizar README, arquitectura, guía de GUI y reporte de migración con resultados exactos, limitaciones y aplicaciones pendientes.
4. Definir puntos de conexión futuros para terminal, UPHFS, sesiones y plataforma sin implementarlos en esta fase.

**Salida:** interfaz preservada, núcleo como única fuente de estado, distribución reproducible y evidencia suficiente para revisar la migración.

**Dependencias:** E0 → E1 → E2 → E3 → E4 → E5 → E6. El inventario de aplicaciones puede completarse durante E0; ninguna aplicación se conectará a un contrato de Core aún no verificado. Cada etapa se entregará en cambios pequeños y revisables, sin mezclar un rediseño con refactorizaciones.

## 7. Validación y criterios de aceptación

Las pruebas y comandos se crearán o ajustarán durante la implementación: hoy no existe una suite de Core/GUI en este checkout. No se registran resultados anticipados.

| Área | Evidencia requerida |
| --- | --- |
| Preservación visual | Comparación con capturas originales por pantalla y resolución, incluyendo menús y estados de ventanas; controlar hora/fechas/animaciones dinámicas al comparar |
| Flujos | Desbloqueo, navegación, lanzamiento, foco, minimizar/restaurar, cierre, calendario, wallpaper y accesos |
| Core | Ciclo de vida, transiciones, CPU única, planificación de las cuatro políticas, memoria, insuficiencia, E/S y recursos con escenarios deterministas |
| Integración | Acción de GUI → API pública → snapshot/evento → vista; cierre o terminación externa limpia proceso/ventana/RAM |
| Consistencia | Misma información en tabla, monitor y widgets; pausa estable y paso exacto; reinicio sin referencias a PIDs anteriores |
| Fallos | Almacenamiento bloqueado, datos inválidos, recursos externos ausentes, falta de RAM y operaciones no disponibles |
| Arquitectura | Sin imports internos desde vistas, sin segundo scheduler/gestor de memoria, sin DOM/almacenamiento/comandos del host en el Core |
| Navegadores | Chromium, Firefox y WebKit cuando su entorno esté disponible; reportar cualquier motor no ejecutado |
| Accesibilidad | Teclado, foco, labels, contraste claro/oscuro, estados con texto y revisión automatizada con alcance declarado |
| Distribución | Build con todas las vistas/assets necesarios y rutas originales; prueba de la salida construida, no sólo del servidor de desarrollo |

Checklist de cierre:

- [ ] Interfaz y flujos originales inventariados y preservados con evidencia.
- [ ] Cambios visuales limitados a adaptaciones documentadas, sin shell alternativo.
- [ ] Aplicaciones y accesos originales conservados; disponibilidad real indicada.
- [ ] Core reutilizable y probado sin navegador; capacidades académicas conservadas.
- [ ] GUI conectada sólo a API pública mediante su controller.
- [ ] Abrir/cerrar mantiene consistencia de PID, ventana y RAM lógica.
- [ ] Métricas, colas y eventos proceden del Core, sin valores de sistema inventados.
- [ ] Preferencias personales separadas de procesos, ticks y sesiones.
- [ ] Sin contraseñas nuevas en texto plano ni autenticación ficticia activa.
- [ ] Sin segundo VFS, terminal provisional o APIs destructivas del anfitrión.
- [ ] Pruebas, build y revisión visual aprobados con resultados exactos.
- [ ] Documentación, diferencias intencionales y deuda pendiente entregadas.

## 8. Riesgos y reversibilidad

| Riesgo | Tratamiento |
| --- | --- |
| Confundir el estado histórico con el checkout actual | Verificar archivos, API y pruebas en E0/E1; no marcar capacidades por lo dicho anteriormente |
| Perder apariencia al modularizar o recompilar CSS | Conservar marcado/assets, introducir cambios pequeños y comparar capturas antes de retirar estilos |
| Duplicar lógica durante la transición | Un solo controller y una sola fuente de estado; desactivar el camino antiguo cuando se conecte el nuevo |
| Romper datos personales | Inventariar claves y formatos; migraciones validadas y reversibles; no borrar almacenamiento en bloque |
| Ventanas huérfanas o procesos sin memoria | Admitir antes de mostrar y compensar fallos; reconciliar terminaciones desde el Core |
| Conservar una función engañosa por preservar su pantalla | Mantener presentación y acceso, declarar capacidad pendiente y retirar la respuesta ficticia |
| Complejidad innecesaria | Reutilizar módulos válidos; extraer sólo fronteras necesarias; evitar reorganizaciones masivas y frameworks nuevos |

Antes de cada etapa se preservará una referencia recuperable de los cambios relevantes, sin sobrescribir trabajo local. Si hay regresión, se revierte únicamente el cambio de esa etapa, conservando la línea base y los datos personales válidos. No se usará un restablecimiento destructivo del repositorio como método de migración.

## 9. Alcance posterior, sin adelantar implementación

La integración de la terminal UPHOS existente, UPHFS, usuarios/sesiones y sus mecanismos de credenciales será una fase posterior basada en sus implementaciones reales. Después podrán incorporarse Electron, IPC/preload, persistencia tecnológica e instalador.

En esta fase se dejan fronteras claras y accesos visuales compatibles. No se construyen sustitutos temporales de esos módulos ni se asume que ya están disponibles.

## 10. Entregables y registro de ejecución

Entregables previstos: inventario y referencia visual, Core independiente, capa de adaptación, interfaz original conectada, registro de aplicaciones, pruebas, build y documentos de arquitectura/GUI/migración. Las rutas nuevas son una propuesta y se ajustarán a la estructura real sin mover archivos por estética.

| Etapa | Estado al crear este plan | Evidencia para actualizarlo |
| --- | --- | --- |
| E0 | Pendiente; inspección preliminar incluida en sección 2 | Inventario completo, capturas y arranque reproducible |
| E1 | Pendiente de recuperación o implementación | API pública y pruebas headless |
| E2 | Pendiente | Recorrido calculadora–proceso–ventana–RAM |
| E3 | Pendiente | Pruebas de ventanas, dock y preferencias |
| E4 | Pendiente | Vistas y acciones conectadas al mismo Core |
| E5 | Pendiente | Matriz de aplicaciones y comparaciones por componente |
| E6 | Pendiente | Resultados finales, build y reporte |

**Primer paso previsto originalmente:** completar E0. La ejecución posterior y sus cambios de marca autorizados están documentados en la sección 11 y el reporte.

## 11. Ejecución aplicada (15 de octubre de 2026)

Las secciones anteriores registran el plan y la inspección inicial. Se implementaron Core independiente, SystemController, registro de aplicaciones, adaptación de ventanas, monitor conectado, preferencias validadas y tema institucional. Todo queda en `Interfaz-/`, sin dependencias del directorio hermano `simulador/`.

El registro actualizado y la evidencia verificable están en [reporte-migracion.md](reporte-migracion.md). Las casillas históricas de la sección 7 no constituyen una declaración de validación exhaustiva: se detalla el alcance probado y lo pendiente en ese reporte.
