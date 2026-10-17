# 04. Arquitectura de Kairós OS

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Estado: diseño objetivo; rutas nuevas todavía no implementadas. La [ADR](ARCHITECTURE_DECISION.md) gobierna esta revisión.

```text
Hardware / VM amd64
  Linux + Debian (systemd, udev, D-Bus, APT)
    Xorg + Openbox + sesión de usuario + agente polkit
      Kairós Desktop (Electron, usuario normal)
        renderer local → preload limitado → main
          Kairós System Layer
            Node APIs / helper Python de usuario / D-Bus
      Aplicaciones Linux (Firefox, VSCodium, terminal, Files)
```

Openbox administra foco, mover, resize, minimizar, maximizar, stacking, fullscreen y Alt+Tab. El WindowManager DOM actual puede conservarse para apps locales de confianza y el laboratorio; no recibe ventanas X11 como iframes ni identifica cada iframe como proceso Linux.

## Cambio mínimo y responsabilidades

| Unidad futura | Base reutilizada | Responsabilidad |
|---|---|---|
| desktop/main, desktop/preload | Patrón de simulador/electron, sin copiar API de volumen virtual | Sesión UI, ciclo de ventanas shell, IPC seguro |
| desktop/renderer, shell, components | Interfaz-/resources/html, js y css | Wallpaper, panel, launcher, indicadores y notificaciones |
| services/linux | Lector system_status.py revisado | Capacidades de usuario y contratos; sin REST de administración |
| apps/launcher, settings, ai | Catálogo/vistas y widgets existentes cuando sirven | Apps propias modulares; funciones Linux declaradas |
| apps/files, task-manager, devices | Presentación existente | Proveedores reales separados del modelo académico |
| apps/terminal | Lanzador de terminal existente | Bash real; PTY embebido posterior |
| system/session, openbox, branding | No existe implementación | Entrada de sesión, tema y arranque |
| themes/dark, light; assets/branding, icons, wallpapers, fonts | Vendor y referencia Logo/ | Tokens, identidad y licencias |
| distro/live; packaging/debian | No existen | Receta e instalación en imagen, no en host |
| scripts, tools, tests; artifacts | Scripts/tests existentes como referencia | Build, QA y artefactos generados |

No crear carpetas vacías por anticipación. Las rutas del plan se crean al implementar su tarea. Las fuentes heredadas permanecen en lugar; una extracción debe eliminar la duplicación activa solo tras verificar equivalencia. Recursos de terceros sin derechos aclarados quedan fuera del empaquetado, sin borrarlos del laboratorio.

## Sesión y panel

El login manager seleccionado iniciará Kairós Session por defecto en la ISO. Autologin solo para usuario Live limitado. Sesión autenticada instalada y bloqueo real quedan sujetos a integración PAM existente, no al login HTML. Openbox y Electron se ejecutan con el UID de sesión; main supervisa helpers y cierra suscripciones al terminar.

Prototipar wallpaper con rol desktop y panel con rol dock, reserva de espacio y foco adecuados. No usar fullscreen permanente ni alwaysOnTop para todo el shell. Si Electron no expone una propiedad X11 necesaria, evaluar helper mínimo o ventana panel separada antes de cambiar tecnología. Consultar [16](16-desktop-shell.md) para EWMH y alternativas.

## Gestión del cambio

WHY: conectar capacidades reales sin reescritura. WHAT: frontera de plataforma y entrada Linux. IMPACT: controller debe separar appId, launchId, XID y PID. MIGRATION: una capacidad vertical por tarea y modo Linux explícito. ROLLBACK: retirar esa capacidad o volver a referencia por archivo; laboratorio y datos no se borran. No existe fallback silencioso de métricas Linux a valores simulados.
