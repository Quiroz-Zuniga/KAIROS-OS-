# 01. Estado actual de las bases históricas de Kairós OS

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


## Dos productos que todavía no comparten núcleo

`simulador/` implementa arranque e instalación académicos, cuentas, recuperación, consola y archivos virtuales. `Interfaz-/` implementa el escritorio gráfico. No hay un escritorio Linux, imagen de arranque, kernel propio ni una integración entre ambos volúmenes de datos.

```text
simulador/index.html → js/bootstrap.js
  → installer/interfaz.js → installer/instalar.js
  → core + apps/consola + services/archivos.js
  → persistence/repositorio.js (IndexedDB)
  o platform/repositorio-local.js → preload → Electron → almacén privado

Interfaz-/resources/html/escritorio.html → escritorio.js
  → SystemController → VirtualSystem (procesos lógicos, ticks, memoria lógica)
  → template.js → ventanas HTML con iframes
  → desktop-store.js → localStorage
```

El Electron actual abre el simulador de consola, no la interfaz gráfica hermana. Su configuración de empaquetado produce un portable Windows; un EXE de Electron no es un ISO ni un sistema invitado. El manifiesto declara Electron 44.7.0 y electron-builder 26.15.3: son valores encontrados, no versiones upstream verificadas ni recomendación automática de mantenerlos.

## Inventario y decisión por componente

Las rutas de esta tabla parten de la raíz del repositorio.

| Componente actual | Tecnología | Estado | Reutilizable | Debe migrarse | Tecnología recomendada |
|---|---|---|---|---|---|
| `simulador/index.html`, `css/`, `assets/` | HTML/CSS/JS | Instalador y marca funcionales como simulación | Tema, textos, accesibilidad y recursos | Separar asistente simulado de instalación real | HTML/CSS existentes |
| `simulador/js/installer/{modelo,particiones,instalar}.js` | ES modules | Disco lógico de 64 GiB; escribe objetos, no bloques | Validaciones pedagógicas y flujo | No traducir formateo automáticamente a discos | Conservar laboratorio; instalador Linux posterior |
| `simulador/js/core/sistema.js`, `usuarios.js`, `credenciales.js` | JS/Web Crypto | Login y cuentas propias; PBKDF2-SHA256, 210000 iteraciones | Flujos de demostración e i18n | Autenticación y autorización Linux | PAM/login existente; UID/GID |
| `simulador/js/core/red.js`, licencias, recuperación | JS | Modelo de red, ediciones académicas y recuperación local | Módulo educativo separado | No convertir IP ficticia ni licencias en control Linux | NetworkManager; cuentas Linux |
| `simulador/apps/consola/` | HTML/CSS/JS | Analizador, catálogo, editor, pestañas e historial | UI y ejercicios | Intérprete no ejecuta Bash ni crea PTY | Terminal externa + Bash; PTY después |
| `simulador/js/services/archivos.js` | JS | Árbol en memoria; reglas propias de nombres | Contratos y pruebas del modelo | Operaciones POSIX, binarios, permisos y enlaces | Node fs como usuario |
| `simulador/js/persistence/repositorio.js` | IndexedDB | Estado transaccional por origen | Guardado del laboratorio | No es disco Linux ni ext4 | Preferencias XDG; filesystem invitado |
| `simulador/electron/{main,preload}.cjs` | Electron/Node | Ventana aislada; IPC de almacenamiento | Patrón de puente específico | Entrada gráfica, paquete Debian y capacidades Linux | Electron estable verificado + IPC |
| `simulador/electron/almacen-local.cjs` | Node fs | Estado JSON y espejo de volumen privado | Validación, revisiones y pruebas | Espejo no importa cambios externos; no es gestor general | Adaptador de archivos separado |
| `simulador/js/desktop/README.md` | Documentación | Carpeta reservada | Responsabilidad conceptual | Escritorio allí no implementado | Reusar GUI de `Interfaz-/` |
| `Interfaz-/resources/html/escritorio.html`, `escritorio.js` | HTML/JS | Escritorio, menú Inicio, accesos, barra y energía simulada | Alto, con adaptador | Apps nativas, sesión y energía Linux | Electron + Openbox |
| `resources/js/template.js` en `Interfaz-/` | JS/CSS/iframes | WindowManager DOM: mover, foco, cerrar, minimizar | Ventanas de apps web locales | No controla ventanas X11/Wayland | Openbox para apps nativas |
| `resources/js/system/{controller,applications}.js` | ES modules | Catálogo y una instancia por app; vincula PID ficticio y ventana | Catálogo, iconos y parte del controller | Identidad de app, ventana y proceso deben separarse | Lanzador por ID permitido |
| `resources/js/core/virtual-system.js`, `procesos.js` | JS puro + DOM | CPU lógica única; FCFS/SJF/Priority/RR, E/S, mutex, semáforos | Muy alto para enseñanza | No son métricas ni scheduler Linux | Laboratorio + monitor real independiente |
| `resources/js/system/{desktop-store,virtual-app}.js` | JS/localStorage | Archivos, papelera, carpetas, descargas ficticias | Vista y UX | Almacenamiento, copiar/mover, permisos y MIME | API fs limitada y papelera real |
| `resources/js/editor.js` | JS | Texto y estilo; guarda en volumen de interfaz | Editor y controles | Guardado real y conflictos externos | Escritura atómica en hogar |
| `resources/js/system/hardware.js` | JS/DOM | Wi-Fi, batería y audio de demostración | Presentación | Proveedor de estado real | Lectores Linux con unavailable |
| `scripts/{hardware-bridge.js,system_status.py,serve.js}` en `Interfaz-/` | Node/Python | Endpoint local de lectura; sysfs, nmcli, pactl/wpctl | Lectores, caché y comandos fijos | Panel actual desconectado; trasladar transporte a IPC | Helper Python sin privilegios |
| `resources/js/calendar/model.js`, calculadora, temporizador, Pac Man | JS/HTML/CSS | Apps locales y modelo de calendario | Alto | Revisar almacenamiento, licencias y rutas | Mantener Vanilla JS |
| Catálogo Chrome, multimedia, cámara, clima, antivirus | JS/HTML | Varias entradas redirigen a `virtual.html`; originales siguen en `resources/app/` | Marca, rutas y algunos widgets | No atribuir navegador, antivirus o dispositivos reales | Firefox/VLC externos; cámara posterior |
| `resources/app/Gestor-Tareas-Proyecto-ED-UPh/` | JS | App académica con árbol, hash y lista | App educativa | No confundir tareas personales con procesos Linux | Mantener como app |
| `resources/css/`, `resources/src/input.css`, `resources/vendor/` | CSS/Tailwind y vendor | Tema e iconos locales; CSS de algunas apps carga fuentes remotas | Alto | Empaquetado offline y auditoría de licencias | Conservar recursos revisados |
| `tests/`, scripts build/serve y docs de ambas bases | Node test/Python/browser | Pruebas y antecedentes presentes | Contratos y regresión | Añadir pruebas Linux e ISO cuando se implemente | Pruebas por capa y VM |

## Límites relevantes para la migración

1. `desktop-store.js` guarda `kairos.desktop.v1`; IndexedDB usa `kairos-simulator`. No se sincronizan, ni comparten credenciales.
2. `almacen-local.cjs` materializa copias de un estado JSON. Cambiar el espejo desde Linux no actualiza ese estado. No usarlo como gestor de `$HOME`.
3. `template.js` permite scripts y mismo origen en iframes locales; eso no ofrece aislamiento fuerte ante una app comprometida. El código hijo también consulta `window.parent`. Debe revisarse antes de añadir privilegios.
4. `main.cjs` ya habilita sandbox/contextIsolation y deshabilita Node en renderer. También comprueba ventana y URL del frame para cada canal. Es una base útil, no una API de administración.
5. `scripts/serve.js` conserva `/api/system-status` en loopback con restricciones Host/Origin. No se ejecutó el servidor ni el lector durante este estudio. El `hardware.js` actual no hace fetch: el diagrama antiguo de `Interfaz-/docs/arquitectura.md` ya no describe ese enlace.
6. Baseline verificada durante la limpieza: Git está disponible en la raíz; HEAD de partida `54a2503dbd32d46dbf7c5e65c4382da58283c034`, rama inicial `main`, remoto `origin` = `git@github.com:Quiroz-Zuniga/KAIROS-OS-.git`. La limpieza se prepara en `codex/chore-repository-baseline`; estos valores describen esta revisión, no una rama obligatoria para tareas futuras. `AGENTS.md` tenía cambios previos y `.agents/` y `.vscode/` estaban sin seguimiento; se conservan. En el cierre de TASK-000 se verificó que `main` no tiene protección activa ni reglas efectivas; [evidencia](evidence/task-000.md). El desarrollo nuevo debe usar ramas aisladas; `develop` es opcional. El manual técnico documenta la implementación posterior al cambio de identidad.

La estructura actual ya es modular en varios puntos. La necesidad es introducir fronteras de plataforma, no reemplazar toda la aplicación ni imponer un framework.

## Alcance de la revisión Kairós OS

La especificación cambia el producto objetivo a distribución/entorno Debian real, pero no cambia por sí sola lo implementado. Los identificadores KAIRÓS OS de este inventario son evidencia literal. [GAP_ANALYSIS](GAP_ANALYSIS.md) añade marca, sesión, Code, AI, EWMH y archivos afectados. Logo/Kairos.png existe como referencia raster; no existe todavía la familia SVG oficial. No se ejecutaron pruebas de aplicación ni VM en esta entrega documental.
