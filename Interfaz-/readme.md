# UPHOS · Interfaz

Interfaz original del escritorio conectada a un núcleo de sistema operativo **virtual** en HTML, CSS y JavaScript. Conserva aplicaciones, dock, calendario, menú e iconos de aplicaciones. Usa el logo UPHOS transparente y un fondo institucional nuevo. Aplica la paleta institucional azul y dorada de UPHOS.

## Ejecutar

```sh
cd Interfaz-
npm ci
npm run dev
```

Abrir `http://127.0.0.1:4173`. Desde el bloqueo, pulsar Entrar o Enter para abrir directamente el escritorio. Esta interfaz no contiene login, registro ni terminal. Los datos de usuario se obtendrán de la instalación cuando se conecte su contrato; UPHFS se integrará en una fase posterior. No se modifican archivos del equipo ni se administran procesos físicos.

## Uso

- Abrir una aplicación desde el dock o menú. Volver a pulsar su icono restaura la misma instancia.
- Minimizar conserva su proceso y memoria. El botón de restauración aparece sobre el dock. Cerrar libera la memoria virtual.
- **Procesos**, en la barra superior, abre el monitor: pausa, paso, planificación, procesos académicos, memoria, E/S, recursos, servicios y eventos.
- Calendario y fondo son preferencias personales; Actualizar escritorio conserva los procesos abiertos.
- Pantalla completa se activa únicamente con el botón de la barra.

## Verificar y distribuir

```sh
npm test
npm run build
npm run test:browser
```

El build genera `dist/` con todas las vistas y recursos. Para servirlo: `UPHOS_SERVE_DIR=dist npm run dev`. Las rutas se resuelven desde cada archivo: funciona tanto como raíz del sitio como dentro de una subcarpeta, por ejemplo `http://127.0.0.1:5500/Interfaz-/resources/html/escritorio.html` con Live Server desde la raíz del repositorio.

La prueba de navegador levanta su servidor temporal en el puerto 4174. Usa Playwright; puede requerir `npx playwright install`. Chromium toma `/usr/bin/google-chrome` por defecto, configurable con `CHROME_PATH`. Los ejecutables Firefox y WebKit pueden indicarse mediante `UPHOS_FIREFOX_PATH` y `UPHOS_WEBKIT_PATH`; si faltan motores, el resultado los declara no disponibles. Para verificar la distribución: `UPHOS_SERVE_DIR=dist npm run test:browser`.

Para probar la misma estructura de Live Server desde la raíz del repositorio: `UPHOS_SERVE_DIR=.. UPHOS_BASE_PATH=/Interfaz- npm run test:browser`.

`npm run vendor` regenera dependencias visuales locales y sus licencias. `npm run build:css` regenera Tailwind. Se conservó Tailwind 3 para mantener compatibilidad con la interfaz; ver la auditoría pendiente en el reporte.

Consultar [arquitectura](docs/arquitectura.md), [plan original y estado](docs/plan-migracion.md) y [reporte de migración](docs/reporte-migracion.md).
