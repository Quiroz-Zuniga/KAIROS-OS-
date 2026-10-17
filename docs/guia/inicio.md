# Primeros pasos

## Elegir la aplicación

El **simulador** permite instalar una máquina virtual lógica, administrar cuentas y utilizar la consola. El **escritorio** permite abrir aplicaciones y observar procesos y recursos virtuales. Se ejecutan por separado.

## Clonar el repositorio

```bash
git clone https://github.com/Quiroz-Zuniga/KAIROS-OS-.git
cd KAIROS-OS-
```

## Simulador web

Con Node.js instalado:

```bash
cd simulador
npm start
```

Abre <http://127.0.0.1:8080>. Elige el asistente de instalación o el modo Live. La instalación guarda el perfil, las cuentas y los archivos del modelo en IndexedDB; Live mantiene el trabajo temporal en memoria. Después del acceso, `ayuda` muestra los comandos y `ayuda crear` explica cómo crear archivos y carpetas.

## Escritorio web

En otra terminal, desde la raíz del repositorio:

```bash
cd Interfaz-
npm ci
npm run dev
```

Abre <http://127.0.0.1:4173>. Pulsa **Entrar a KAIRÓS OS**, abre Inicio y selecciona una aplicación. El escritorio guarda sus documentos virtuales en localStorage.

!!! tip "Módulos JavaScript"
    Utiliza las direcciones HTTP anteriores. Abrir el HTML mediante `file://` no proporciona el entorno necesario para módulos y persistencia.

## Aplicación Electron

```bash
cd simulador
pnpm install --frozen-lockfile
pnpm desktop
```

Electron utiliza un volumen privado en el equipo. Las cuentas de la versión web no aparecen automáticamente en Electron. El empaquetado Windows se ejecuta con `pnpm empaquetar`; revisa sus requisitos y límites en [desarrollo](desarrollo.md).

## Detener

Usa `Ctrl+C` en cada terminal del servidor. Cerrar la pestaña finaliza la sesión web; la instalación persistida continúa disponible al volver al mismo origen.
