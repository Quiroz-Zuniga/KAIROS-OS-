<p align="center"><img src="Logo/Kairos.png" alt="KAIRÓS OS" width="260"></p>

# KAIRÓS OS

Simulación académica modular de un sistema operativo, desarrollada con HTML, CSS y JavaScript para la Universidad Politécnica de Honduras. Incluye un instalador, una consola con 120 comandos, persistencia local y una interfaz de escritorio con aplicaciones y planificación de procesos virtuales.

[Documentación técnica](docs/index.md) · [Arquitectura](docs/guia/arquitectura.md) · [Desarrollo](docs/guia/desarrollo.md) · [Plan de evolución](docs/ARCHITECTURE_DECISION.md)

## Estado del proyecto

| Componente | Disponible hoy |
| --- | --- |
| `simulador/` | Instalador, modo Live, usuarios, terminal, archivos virtuales e IndexedDB. Wrapper Electron con almacenamiento privado. |
| `Interfaz-/` | Escritorio web, ventanas, aplicaciones, calendario y núcleo determinista de procesos, memoria, E/S y recursos. |
| `docs/` | Manual técnico con MkDocs Material y especificación de evolución hacia un entorno Debian. |

Las dos aplicaciones se ejecutan por separado y no comparten sesión, credenciales ni volumen de archivos. La distribución Linux, la ISO y la integración con aplicaciones nativas están **propuestas**, no implementadas. El código actual no instala un sistema operativo ni particiona discos reales.

## Requisitos

- Node.js 22.12 o posterior para desarrollo y herramientas de empaquetado.
- Navegador moderno con módulos ES, Web Crypto e IndexedDB.
- Python 3.10 o posterior para documentación; el colector opcional de estado del equipo requiere Python 3.
- pnpm para instalar las dependencias de Electron usando su lockfile.

## Ejecutar el simulador

```bash
cd simulador
npm start
```

Abrir <http://127.0.0.1:8080>. La versión web no requiere instalar dependencias. El asistente permite instalar un modelo virtual o iniciar una sesión Live. Una instalación persistida abre el acceso por consola.

## Ejecutar el escritorio

```bash
cd Interfaz-
npm ci
npm run dev
```

Abrir <http://127.0.0.1:4173> y pulsar **Entrar a KAIRÓS OS**. Para generar la distribución estática:

```bash
npm run build
KAIROS_SERVE_DIR=dist npm run dev
```

## Arquitectura del repositorio

```text
.
├── simulador/
│   ├── apps/          # Consola, analizador, ejecución y presentación
│   ├── js/            # Núcleo, instalador, archivos y persistencia
│   ├── css/           # Presentación del simulador
│   ├── assets/        # Identidad, traducciones e iconos
│   ├── electron/      # Ventana aislada y puente de almacenamiento
│   └── tests/         # Pruebas del simulador y almacenamiento
├── Interfaz-/
│   ├── resources/     # Escritorio, aplicaciones, estilos y recursos locales
│   ├── scripts/       # Servidor, build y puente de estado de solo lectura
│   └── tests/         # Núcleo, calendario y recorridos de navegador
├── docs/              # Manual técnico y especificaciones
├── Logo/              # Identidad visual
├── mkdocs.yml         # Sitio de documentación principal
└── requirements-docs.txt
```

El navegador maneja estado virtual. Electron expone métodos concretos mediante `contextBridge`, con aislamiento de contexto y Node.js deshabilitado en el renderer. Consulta los [contratos y límites](docs/guia/arquitectura.md).

## Verificación

```bash
(cd simulador && npm test)
(cd Interfaz- && npm test)
(cd Interfaz- && npm run test:hardware)
(cd Interfaz- && npm run build)
```

Las pruebas de navegador requieren Playwright y motores instalados; ver [desarrollo y pruebas](docs/guia/desarrollo.md). Los reportes y capturas de revisiones previas no certifican automáticamente la versión actual.

## Documentación con MkDocs

```bash
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r requirements-docs.txt
.venv-docs/bin/mkdocs serve
```

Abrir <http://127.0.0.1:8000>. Para generar y verificar el sitio:

```bash
.venv-docs/bin/mkdocs build --strict
```

Material aporta búsqueda en español, navegación por secciones, temas claro/oscuro y bloques de código copiables. El sitio generado queda en `site/`, excluido de Git. El workflow de documentación valida cada cambio y permite publicar en GitHub Pages mediante ejecución manual; primero debe seleccionarse **GitHub Actions** como origen de Pages en el repositorio.

## Identidad y almacenamiento

La marca visible es **KAIRÓS OS**; los identificadores técnicos usan `kairos` o `KAIROS`. La versión actual emplea `kairos-simulator` en IndexedDB, `kairos.desktop.v1` en localStorage y la carpeta privada `KAIROS` para Electron. Las variables opcionales del entorno comienzan por `KAIROS_`.

El cambio de identidad inicia un espacio de datos nuevo. No migra ni borra automáticamente instalaciones de versiones anteriores. Antes de actualizar una instalación existente, exportar sus archivos virtuales desde esa versión. Las claves Pro son demostraciones académicas locales, no licencias comerciales.

## Alcance y licencia

El simulador no modifica el kernel ni la configuración del sistema anfitrión. El puente local opcional consulta estado del equipo en modo de solo lectura; el escritorio conserva dispositivos virtuales por defecto. Las operaciones reales sobre archivos se limitan al almacenamiento privado de Electron y las acciones explícitas del usuario.

El repositorio incluye una [licencia GPL-3.0](LICENSE). Las dependencias y recursos de terceros conservan sus licencias y atribuciones en sus directorios; comprobarlas antes de redistribuir binarios o multimedia.
