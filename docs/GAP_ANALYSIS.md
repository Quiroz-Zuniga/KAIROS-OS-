# GAP ANALYSIS — Kairós OS

Revisión: 2026-10-16. Evidencia del árbol actual, no de una distribución instalada. Se inventariaron fuentes y recursos de ambos proyectos, se leyeron los documentos de docs/ y antecedentes de Interfaz-/docs/, manifiestos, entradas Electron/web, controladores, persistencia, lectores y estilos principales. Se inspeccionó visualmente Logo/Kairos.png y se leyó Logo/kairoz-terminal-boot.txt. Dependencias vendorizadas, binarios y cada línea de apps de terceros no recibieron auditoría exhaustiva.

No hay `.git` accesible en la raíz: `git status` devuelve «not a git repository». Las afirmaciones de ramas/cambios previos de informes antiguos son antecedentes, no estado verificable ahora. No se hizo commit, instalación, build, arranque VM ni consulta de hardware. Las suites presentes no se ejecutaron porque esta entrega modifica Markdown exclusivamente.

## Matriz observada

| Área | Evidencia existente | Brecha / conservar / adaptar | Prioridad |
|---|---|---|---|
| Consola e instalación | simulador/js/core, installer y apps/consola; tests | Conservar como laboratorio; instalación, cuentas y filesystem virtuales no son Linux | Conservación |
| Electron | simulador/electron/main.cjs y preload.cjs | Aislamiento útil; abre simulador/index.html; API solo de almacenamiento; falta entrada gráfica Linux | P0 |
| GUI | Interfaz-/resources/html/escritorio.html y escritorio.js | Reusar menús, accesos, calendario, editor y ventanas locales; no hay sesión X11 | P0 |
| Controlador | system/controller.js crea VirtualSystem y procesos por app | Separar appId/launchId/XID/PID; no trasladar PIDs virtuales a Linux | P0 |
| Ventanas | template.js mueve divs/iframes; sandbox scripts + mismo origen | Mantener para laboratorio; Openbox para nativas; falta EWMH/panel real | P0/P1 |
| Launcher | system/applications.js catálogo fijo de HTML | Falta registry XDG, .desktop y lanzamiento nativo por ID | P0 |
| Files/editor | desktop-store.js localStorage; editor.js | Conservar datos; archivos reales mediante API distinta o gestor nativo inicial | P1 |
| Procesos | core/virtual-system.js y procesos.js, scheduler académico | Monitor Linux read-only separado, unidades/muestreo reales | P1 |
| Dispositivos/red/audio | hardware.js controles virtuales; system_status.py lector separado | No están conectados; trasladar lectores a IPC; inventario udev pendiente | P1 |
| Datos | uphos.desktop.v1, uphos-simulator y almacenamiento Electron UPHOS | No renombrar/borrar por branding; no comparten volumen ni credenciales | P0 |
| Marca | uphos.css azul/dorado; PNGs antiguos; Logo/Kairos.png | Nuevo raster disponible, sin seis SVG oficiales; detalles/sombras se simplifican manualmente | P0 |
| Terminal | Consola educativa; sin app terminal en catálogo gráfico | xterm/Bash externo primero; referencia Unicode no es splash validado | P0 |
| Code | Sin app ni paquete VSCodium/VS Code integrado | Seleccionar artefacto, licencia/avisos, actualización, marketplace y prueba de edición/Git | P1 |
| AI | Sin app/servicio/contrato Kairós AI | Cloud opt-in y solo lectura; proveedor/credenciales sin resolver | P2 |
| Sesión/tema | Sin system/session ni tema Openbox propio | Inicio predeterminado, supervisor de shell, energía y tema | P0 |
| Paquetes/ISO | electron-builder portable Windows en simulador/package.json | EXE no es ISO; falta .deb y live-build, GRUB/Plymouth | P0 |
| QA | Node/Python/browser y capturas históricas | Conservar; agregar pruebas Linux y VM con manifiesto/checksum | P0–P2 |

## Discrepancias que cambian el plan

Interfaz-/docs/arquitectura.md y reporte-migracion.md contienen etapas antiguas con panel físico conectado; el código actual y docs/manual/arquitectura.md describen dispositivos virtuales. Hay editor/explorador sobre volumen de interfaz, aunque informes antiguos los marcaban pendientes. No atribuir evidencia de etapas distintas al código actual. Los números de versiones de manifiestos son observados, no prueba de que exista un runtime Linux compatible.

El estudio anterior hacía opcional el panel de ventanas reales y no exigía AI/VSCodium. La especificación nueva los incorpora al MVP: [14](14-roadmap-8-weeks.md) y [MVP_ACCEPTANCE](MVP_ACCEPTANCE.md) sustituyen ese alcance reducido. Un shell maximizado sobre otro escritorio solo es diagnóstico; no acredita sesión Kairós predeterminada.

## Archivos afectados

Esta entrega: docs/ARCHITECTURE_DECISION.md, 04, 06, 07, 12, 14 y README revisados; 01/02/03/05/08/09/10/11/13/15 con aclaraciones vigentes; nuevos 16–24, GAP_ANALYSIS, OPEN_DECISIONS, MVP_ACCEPTANCE, REVIEW_VALIDATION y KAIROS_GEOMETRY; IMPLEMENTATION_PLAN.md raíz. No se editan fuentes ejecutables, recursos, manifiestos o AGENTS.md.

Implementación futura: AGENTS.md; entradas/estilos/controladores de Interfaz-/; traducciones/branding visible de simulador/ cuando corresponda; desktop/, services/linux/, system/, themes/, assets/, packaging/debian/, distro/live/, scripts/ y tests/ según tarea. [06](06-ui-migration.md) identifica las superficies e IDs que se preservan.

## Conclusión técnica

Arquitectura viable por reutilización, implementación Linux ausente y plazo de riesgo alto. Primer desarrollo: contrato mínimo y wrapper gráfico aislado dentro de VM Debian con sesión Openbox, launcher mínimo y una app nativa al frente. Logo completo, AI y terminal embebida no bloquean esa prueba. Ready for implementation significa que puede comenzar ese prototipo; no que exista ya un MVP o una ISO verificable.
