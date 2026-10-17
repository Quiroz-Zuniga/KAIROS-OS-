# 06. Migración controlada de interfaz y branding

La denominación del producto objetivo es **Kairós OS**. UPHOS/UPH-OS describe el laboratorio y sus identificadores históricos. Esta entrega actualiza arquitectura y documentación; la interfaz ejecutable aún presenta la marca anterior.

## Conservar y adaptar

Conservar simulador, consola, calendario, calculadora, pruebas, rutas y datos. Reusar escritorio, launcher visual, editor y widgets como presentación. Adaptar SystemController para que appId, launchId, XID y PID sean entidades distintas. Preservar VirtualSystem como laboratorio; el monitor real no importa su scheduler. No convertir instalador simulado en instalador Linux.

## Mapa de cambio por superficie

| Superficie / archivos afectados después | Migración prevista | Protección y reversión |
|---|---|---|
| Interfaz-/index.html, resources/html/escritorio.html y escritorio.js | Texto Kairós, búho, launcher y About | Capturas de referencia; cambio de presentación aislado |
| resources/css/uphos.css, desktop.css, windows.css y resources/src/input.css | Tokens Kairós y geometría común | Adaptador temporal --uph-* solo de estilos; conservar clases hasta migrar consumidores |
| resources/js/system/applications.js | Títulos visibles y catálogo nativo aparte | Mantener IDs originales, aliases y rutas del laboratorio |
| Logo/Kairos.png; assets/branding futuros | Fuente visual conservada; SVG dibujado y revisado | Sin autotrace ni PNG embebido presentado como vector |
| simulador/index.html, css/marca.css, assets/locales/*.js | Marca visible al migrar laboratorio | Mantener claves de traducción y pruebas |
| simulador/electron/main.cjs, preload.cjs | Entrada Linux nueva con window.kairos | API histórica uphosLocal / canales uphos: intactos para laboratorio |
| package.json de ambas bases y locks | Metadatos visibles primero; nombres técnicos solo con tarea propia | appId hn.uphos.simulator, nombres npm y rutas no cambian sin migración |
| desktop-store.js y repositorio.js | Nuevas preferencias XDG versionadas | uphos.desktop.v1, uphos-simulator y directorio UPHOS permanecen legibles |
| system/session, openbox, branding; packaging/debian; distro/live | kairos-session, paquetes kairos-*, hostname Live kairos | Solo imagen/VM; hostname del host sin cambios |
| GRUB/Plymouth/terminal/Fastfetch | Kairós OS y búho adaptado | Logs y arranque de diagnóstico accesibles |
| docs/ y READMEs de producto | Nombre nuevo en recomendaciones actuales | Evidencias históricas, atribuciones e IDs se conservan literalmente |

No hacer sustitución global. Primero inventariar coincidencias, clasificarlas como texto, identificador persistente, protocolo o evidencia histórica y revisar cada grupo. Búsquedas `rg` y regresiones verifican la migración; no exigir cero coincidencias UPHOS en el árbol histórico.

## Datos y compatibilidad

No renombrar claves de IndexedDB/localStorage para resolver branding. Una eventual importación será copia explícita de documentos exportables y preferencias, con respaldo, esquema, conflictos y reporte; nunca credenciales, particiones o EXE ficticios. No fusionar los dos volúmenes por nombre. No aplicar reglas de nombres virtuales como reglas POSIX.

## Etapas verificables

Baseline y copia recuperable → tokens/activos → entrada Electron Linux → sesión y app nativa → descubrimiento .desktop → panel EWMH → capacidades read-only → archivos → Settings/AI. La ISO técnica sigue al primer hito; no espera al rediseño completo. Las tareas pequeñas y dependencias están en [el plan](../IMPLEMENTATION_PLAN.md).

WHY: marca coherente sin pérdida de funciones. WHAT: nuevas superficies y adaptadores. IMPACT: contratos y almacenamiento no se renombran junto con textos. MIGRATION: una superficie por tarea. ROLLBACK: restauración de esos archivos y datos originales conservados; nunca borrar datos del sitio ni resetear todo el árbol.
