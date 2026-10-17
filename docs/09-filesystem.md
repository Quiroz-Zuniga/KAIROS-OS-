# 09. Filesystem y gestor de archivos

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los nombres de código/datos UPHOS son históricos y se conservan. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

## Elección y distinción Live

| Sistema | Ventaja | Costo inicial | Decisión |
|---|---|---|---|
| ext4 | Journaling, soporte extendido y herramientas estándar | Sin snapshots nativos integrados | Disco de datos/persistencia e instalación futura |
| btrfs | CoW, checksums y snapshots | Más conceptos de subvolúmenes, espacio y recuperación | Reevaluar si rollback se vuelve requisito |
| XFS | Escalabilidad y herramientas maduras | Beneficio pequeño para VM académica; reducción de tamaño no es flujo simple | No inicial |

La ISO contiene ISO9660 y un root comprimido **SquashFS**, no una raíz ext4 modificable. live-boot monta capa de escritura temporal con overlay; archivos de esa sesión son reales, pero se pierden al apagar salvo persistencia. ext4 se recomienda para un segundo disco virtual de persistencia o el destino de un instalador futuro. UPHFS es un modelo académico y no se implementará como driver de disco.

Fuentes: [filesystems del kernel](https://docs.kernel.org/filesystems/), [ext4](https://cdn.kernel.org/doc/html/latest/admin-guide/ext4.html), [live-boot](https://manpages.debian.org/trixie/live-boot-doc/live-boot.7.en.html). La preferencia ext4 es una decisión por simplicidad, no una afirmación de superioridad en todos los casos.

## API del explorador

Node fs ejecutado como UID del invitado, comenzando en `$HOME`, con propiedades reales: tipo, tamaño, UID/GID, permisos, mtime y filesystem. No reutilizar el estado JSON completo del simulador como origen de archivos reales. Las reglas Windows actuales de nombres reservados/case folding tampoco son reglas POSIX.

| Operación | Diseño y casos que se deben cubrir |
|---|---|
| Listar/propiedades | lstat; paginado; errores por entrada; no seguir enlaces ciegamente |
| Crear carpeta | mkdir con modo afectado por umask; conflicto explícito |
| Leer/editar | Límite inicial texto 1 MiB, binario detectado; UI no interpreta HTML como código |
| Guardar | Archivo temporal del mismo directorio + rename; comparar revisión/stat para no pisar edición externa |
| Copiar | No sobrescribir sin decisión; progreso y cancelación; evitar enlaces/ciclos y destino dentro del origen |
| Mover/renombrar | rename; si EXDEV, copiar/verificar y solo después borrar origen; no prometer atomicidad entre volúmenes |
| Borrar | Confirmar alcance; papelera real con implementación de estándar o backend probado; hasta entonces borrado explícito sin restauración prometida |
| Abrir | MIME/asociación permitida; lanzador externo con argumentos seguros; no ejecutar por extensión |
| Permisos | Respetar kernel; mostrar acceso denegado; cambios chmod solo sobre elementos propios si se incluyen |

Confinamiento inicial: raíces habilitadas hogar y montajes externos autorizados. Validar rutas en backend; rechazar NUL, traversal y rutas fuera del alcance. `startsWith('/home/user')` es insuficiente por prefijos parecidos y enlaces simbólicos. Definir enlaces de solo lectura inicialmente y no permitir atravesar symlinks para mutaciones confinadas. Canonicalización/lstat sola tiene carreras TOCTOU; si se requiere aislamiento fuerte frente a otro proceso del mismo UID, usar operaciones relativas a descriptores con resolución segura o servicio adecuado. No presentar la validación de cadenas como sandbox.

El proceso corre como usuario Linux: incluso una omisión de scope no debe otorgar privilegios root. El usuario aún puede modificar sus archivos desde una terminal; el alcance del explorador es una barrera de aplicación, no aislamiento entre procesos del mismo usuario.

## Datos persistentes y recuperación

Preferencias de UI en XDG_CONFIG_HOME y XDG_STATE_HOME; caché en XDG_CACHE_HOME, con límites. Los documentos viven como archivos normales. Una edición externa debe verse al refrescar; watchers son ayuda, no única verdad. Guardado JSON de preferencias debe ser atómico y versionado.

Persistencia importante: segundo VDI vacío, ext4 y configuración de live-boot para `/home`, documentada y creada únicamente dentro de una VM de laboratorio en una fase posterior autorizada. Esta entrega no contiene comandos de particionado. Probar falta de espacio, desconexión de medio y sesión sin persistencia. Indicar al usuario qué permanece al reiniciar.

Aceptación: crear carpeta y texto desde UI, comprobar contenido desde Bash, modificarlo allí y refrescar UI; copiar, mover y renombrar; rechazo de escritura fuera de alcance y permiso denegado; confirmar borrado; probar symlink y nombre con espacios/metacaracteres sin ejecución de comandos.

## Implementación inicial Kairós

Integrar un gestor Linux nativo como Thunar satisface navegación real antes de construir Kairós Files completo. La API propia descrita aquí es evolución: no abrir mutaciones incompletas al renderer por conservar una vista HTML. Conservar el volumen virtual del laboratorio. Live temporal se anuncia claramente; persistencia/instalación se deciden por OD-11.
