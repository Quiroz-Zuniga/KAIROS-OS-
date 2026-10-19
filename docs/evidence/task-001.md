# TASK-001 — Baseline funcional y alcance de trabajo

Fecha local: 2026-10-18 (America/Tegucigalpa).
Estado: VALIDATED para inventario, referencia recuperable y regresión automatizada
del laboratorio. No certifica experiencia gráfica ni integración Linux.

## Referencia y alcance

- Base inspeccionada: `c7974f5daadc1afcfdd85e6124d52446ea4abed5`.
- Rama de trabajo: `codex/task-001-functional-baseline`.
- Worktree: checkout principal del repositorio; no hubo agentes concurrentes.
- Remoto observado: `git@github.com:Quiroz-Zuniga/KAIROS-OS-.git`.
- Estado inicial: sin cambios versionados; `.vscode/` sin seguimiento, preservado.
- Cambios: inventario funcional/datos, estado de TASK-001 y este registro.
- Sin modificaciones del producto, dependencias, lockfiles, servicios o discos.

La referencia recuperable de este cierre será el commit que introduce el registro:
`git log -1 --format=%H -- docs/evidence/task-001.md`. La referencia de código
anterior permanece accesible. No se crea tag ni versión de producto.

## Pruebas ejecutadas

Herramientas observadas: Node.js v24.18.0, npm 11.16.0, Python 3.13.5.
Comandos desde la raíz y resúmenes de sus salidas reales:

```text
(cd simulador && npm test)
> node --test tests/*.test.js
tests 165
suites 0
pass 165
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 10565.250144
exit 0

(cd Interfaz- && npm test)
> node --test tests/*.test.js
tests 19
suites 0
pass 19
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 1754.893356
exit 0

(cd Interfaz- && npm run test:hardware)
> python3 -m unittest discover -s tests -p test_system_status.py
Ran 4 tests in 0.002s
OK
exit 0
```

Son resúmenes, no transcripciones completas. Ninguna de las suites ejecutadas
registró fallos. Las 16 suites de archivos del simulador cubren instalación,
consola, archivos, credenciales, recuperación, conflictos, idioma y teclado.
Incluyen reapertura de `AlmacenLocal` en temporales. Las dos suites Node de
interfaz cubren calendario y núcleo virtual. Python usa fixtures de batería y
cadenas de nmcli, sin consultar hardware real del anfitrión.

Validación documental adicional: `git diff --check` sin errores; destinos locales
de enlaces Markdown existentes; inventario confirmado de 16 archivos de pruebas
Node del simulador y 2 de interfaz. Los hashes SHA-256 de `.vscode/settings.json`
y `skills-lock.json` coincidieron antes y después de editar documentación. El diff
versionado respecto de la base contiene solo los archivos documentales previstos.

## Inventario y límites de aceptación

El [inventario actualizado](../01-current-state.md) identifica componentes,
persistencia y recuperación. Se conserva la separación entre las dos bases:
IndexedDB/almacén Electron del simulador y localStorage del escritorio.
`desktop/`, `system/`, `services/`, `distro/` y `packaging/` no existen en la base
inspeccionada; sus rutas en el plan son futuras.

| Criterio TASK-001 | Evidencia |
| --- | --- |
| Referencia recuperable | SHA base completo y commit documental identificable por ruta |
| Inventario de datos | Identificadores, rutas, claves y preservación en 01-current-state |
| Comandos de regresión | Tres comandos ejecutados, conteos y salidas anteriores |
| Protección del host | Inspección de fuentes y pruebas con fixtures/temporales; sin operaciones de sistema |

No se ejecutaron `test:browser` ni `tests/desktop-corrections.js`: generan capturas
y reportes sobre las rutas de evidencia histórica; el cierre se limita a suites
automatizadas sin abrir una GUI. No se ejecutaron Electron, build, empaquetado,
servidor, sesión Debian/Xorg/Openbox, VM o ISO. No hay evidencia gráfica actual
ni certificación del runtime fijado en el manifiesto histórico. La disponibilidad
de VM sigue sin confirmarse (OD-12); las demás decisiones abiertas permanecen
pendientes. TASK-002 debe resolver runtime, sandbox y contrato mínimo con su
propia revisión de dependencias/seguridad.

## Seguridad, preservación y rollback

Revisión acotada al diff documental: sin canales IPC nuevos, privilegios, comandos
libres, cambios de credenciales ni datos personales incluidos. Las cuentas del
laboratorio no se presentan como cuentas Linux. No es una auditoría del producto.

No se abrieron perfiles personales. Git no respalda datos ignorados o externos:
antes de futuras migraciones se debe conservar el origen/perfil web y la raíz
privada completa de Electron con la app cerrada. Los cambios externos al espejo
no se importan automáticamente. No copiar estados entre las dos bases.

Rollback: revertir únicamente el commit documental de TASK-001 en una rama,
conservando cambios ajenos; sin reset destructivo, limpieza global o modificación
del anfitrión. `.vscode/settings.json` y `skills-lock.json` permanecen fuera del
alcance. No se realiza push ni merge.
