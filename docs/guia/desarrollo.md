# Desarrollo y pruebas

## Entorno

Usa Node.js 22.12 o posterior. El simulador web se ejecuta sin instalar dependencias; Electron necesita pnpm y sus paquetes. La interfaz usa npm y `package-lock.json`. Evita mezclar gestores dentro de la misma carpeta.

## Comprobaciones por componente

Desde la raíz:

```bash
(cd simulador && npm test)
(cd Interfaz- && npm test)
(cd Interfaz- && npm run test:hardware)
```

El simulador verifica instalación, credenciales, archivos, conflictos, recuperación, terminal y almacenamiento nativo. La interfaz verifica el calendario y las invariantes de procesos, memoria, E/S y recursos. Las pruebas de Python validan el análisis de las respuestas del colector.

## Build de interfaz

```bash
cd Interfaz-
npm ci
npm run build
KAIROS_SERVE_DIR=dist npm run dev
```

El build prepara dependencias locales, genera CSS con Tailwind y copia las vistas y recursos a `dist/`. Ese directorio no se versiona.

## Pruebas de navegador

```bash
cd Interfaz-
npx playwright install
npm run test:browser
```

El recorrido inicia un servidor temporal. `CHROME_PATH` selecciona Chrome; `KAIROS_FIREFOX_PATH` y `KAIROS_WEBKIT_PATH` permiten indicar otros ejecutables. Los motores ausentes deben declararse como no verificados.

Para verificar el build y el montaje en subcarpeta:

```bash
KAIROS_SERVE_DIR=dist npm run test:browser
KAIROS_SERVE_DIR=.. KAIROS_BASE_PATH=/Interfaz- npm run test:browser
```

`tests/desktop-corrections.js` contiene el recorrido específico de documentos, ventanas y energía. Sus capturas y reportes son evidencia de la ejecución que los generó; no sustituyen volver a verificar tras cambios funcionales.

## Empaquetar Electron

```bash
cd simulador
pnpm install --frozen-lockfile
pnpm empaquetar
```

La configuración produce un portable Windows x64 en `entregables/`. El script utiliza una carpeta temporal y rechaza sobrescribir un artefacto existente. La edición y arquitectura elegidas dentro del instalador son atributos simulados, no otra arquitectura del ejecutable. El cambio de identidad no regenera por sí mismo un portable publicado.

## Convenciones

- Marca visible: **KAIRÓS OS**. Identificadores y archivos: `kairos`.
- Mantener separados presentación, núcleo, archivos y persistencia.
- No ejecutar entradas del usuario con `eval` ni con comandos del sistema.
- Probar cambios de rutas y contratos en ambos extremos del puente.
- No incluir `node_modules`, `dist`, `site`, entornos Python o entregables en Git.
