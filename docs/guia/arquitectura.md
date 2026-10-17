# Arquitectura actual

## Separación de responsabilidades

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Arranque | `simulador/js/bootstrap.js` | Elegir instalación, acceso y sesión Live. |
| Instalador | `simulador/js/installer/` | Validar pasos, particiones lógicas y confirmación de instalación. |
| Núcleo | `simulador/js/core/` | Cuentas, sesiones, comandos, configuración, red y recuperación. |
| Consola | `simulador/apps/consola/` | Analizar argumentos, historial, pestañas, edición y presentación. |
| Archivos | `simulador/js/services/` | Operaciones sobre el árbol virtual. |
| Persistencia web | `simulador/js/persistence/` | Transacciones IndexedDB, revisiones y control de conflictos. |
| Adaptador nativo | `simulador/js/platform/` | Contrato del repositorio para el puente Electron. |
| Proceso principal | `simulador/electron/` | Ventana, validación de IPC y volumen privado. |
| Escritorio | `Interfaz-/resources/js/` | Ventanas, aplicaciones, calendario, preferencias e interacción. |
| Núcleo del escritorio | `Interfaz-/resources/js/core/` | Procesos virtuales y planificación determinista. |

## Flujo de la consola

```text
Entrada → analizador → validador → ejecutor → núcleo/servicio
                                            ↓
Presentación ← resultado ← confirmación de persistencia
```

Los comandos no se ejecutan con un shell del anfitrión. El sistema valida rutas y permisos sobre su modelo. Una operación persistente confirma el guardado antes de anunciar éxito. Las pestañas comparten archivos y mantienen directorio, historial y borrador propios.

## Escritorio independiente

La interfaz usa un núcleo determinista para simular FCFS, SJF, prioridad y Round Robin. La admisión depende de RAM virtual; la E/S bloquea y libera CPU; los recursos compartidos utilizan colas. Los pasos de simulación no representan métricas reales del equipo.

Las ventanas muestran aplicaciones del proyecto dentro del navegador. Los documentos del escritorio se almacenan con `kairos.desktop.v1`; la consola usa `kairos-simulator`. No existe sincronización entre ambos.

## Frontera Electron

El renderer tiene `nodeIntegration: false`, `contextIsolation: true` y sandbox. `preload.cjs` publica `kairosLocal`; el proceso principal recibe canales `kairos:*` y verifica el emisor. El backend valida rutas, revisiones y fecha de instalación antes de modificar el volumen privado.

La interfaz gráfica tiene un puente local opcional de estado del equipo, servido en `/api/system-status`. Es una consulta de solo lectura y no convierte los controles de red, audio o energía en controles físicos.

## Evolución propuesta

La [ADR-001](../ARCHITECTURE_DECISION.md) describe un entorno Debian con Xorg/Openbox, una shell Electron y una capa de capacidades explícitas. Esa arquitectura no está implementada por este cambio de identidad. Las operaciones Linux se desarrollarán y validarán en una VM aislada, conforme al alcance aprobado.
