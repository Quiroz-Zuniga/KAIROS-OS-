# Kairós OS — arquitectura y plan de implementación

Revisión: **16 de octubre de 2026**. Producto objetivo: distribución/entorno de escritorio Debian amd64 con Linux, Xorg/Openbox, Kairós Desktop en Electron, aplicaciones nativas y System Layer de capacidades explícitas. El código actual conserva dos bases académicas: simulador/ e Interfaz-/; la transición a Linux aún no está implementada.

Primera ejecución de la especificación: inspección, GAP ANALYSIS, migración propuesta de marca/diseño, ADR, roadmap y tareas pequeñas. Se modificó únicamente Markdown en docs/ y se creó IMPLEMENTATION_PLAN.md en raíz. No se instalaron paquetes, generaron SVG/ISO, ejecutaron aplicaciones/hardware o cambiaron servicios/configuración del anfitrión. La ausencia de .git en raíz impide confirmar ramas/estado Git; no se afirman cambios rastreados ni commits.

## Entrada de revisión

- [IMPLEMENTATION_PLAN](../IMPLEMENTATION_PLAN.md): 36 tareas con archivos, objetivo, dependencias, riesgo y aceptación.
- [GAP ANALYSIS](GAP_ANALYSIS.md): evidencia real, discrepancias y archivos afectados.
- [ADR principal](ARCHITECTURE_DECISION.md): WHY / WHAT / IMPACT / MIGRATION / ROLLBACK.
- [OPEN DECISIONS](OPEN_DECISIONS.md): alternativas aún no probadas.
- [15 criterios de MVP](MVP_ACCEPTANCE.md): aceptación sin rebajar requisitos.
- [Validación documental](REVIEW_VALIDATION.md): alcance comprobado y límites.

## Documentos

| Documento | Contenido |
|---|---|
| [01. Estado](01-current-state.md) | Inventario y bases históricas |
| [02. Viabilidad](02-feasibility-study.md) | Supuestos de capacidad y reestimación requerida |
| [03. Alternativas](03-architecture-options.md) | Linux/base/UI y justificación de reutilización |
| [04. Arquitectura](04-recommended-architecture.md) | Capas y estructura incremental |
| [05. Stack](05-technology-stack.md) | Lenguajes, dependencias y avisos |
| [06. Migración](06-ui-migration.md) | Branding por superficie y compatibilidad de datos |
| [07. Linux](07-linux-integration.md) | IPC, D-Bus, apps, terminal y paquetes |
| [08. Procesos](08-process-management.md) | Métricas y monitor de solo lectura |
| [09. Archivos](09-filesystem.md) | POSIX, Live y Files nativo inicial |
| [10. Dispositivos](10-device-management.md) | udev/sysfs, inventario y hotplug |
| [11. VM](11-virtualization.md) | VirtualBox y matriz de evidencia |
| [12. ISO](12-iso-build.md) | live-build, marca y artefacto versionado |
| [13. Seguridad](13-security.md) | Fronteras, usuario, privilegios y AI |
| [14. Roadmap](14-roadmap-8-weeks.md) | Ocho semanas condicionadas y gates |
| [15. Riesgos](15-risks.md) | Riesgos de integración y alcance |
| [16. Desktop Shell](16-desktop-shell.md) | Wallpaper/panel, EWMH, WM y tray |
| [17. Aplicaciones](17-application-integration.md) | Registry XDG/.desktop y GIO |
| [18. Desarrollo](18-development-environment.md) | VS Code/VSCodium/Code OSS y ediciones |
| [19. Kairós AI](19-kairos-ai.md) | Servicio cloud, UI y contexto opt-in |
| [20. System Layer](20-system-layer.md) | Módulos, fuentes, IPC y errores |
| [21. Marca](21-brand-guidelines.md) | Búho, variantes SVG y boot |
| [22. Colores](22-color-system.md) | Tokens, temas, tipografía y estados |
| [23. Geometría](23-kairos-geometry.md) | Entrada a guía normativa |
| [24. Terminal](24-terminal-branding.md) | Colores, ASCII/Unicode y fetch |
| [KAIROS_GEOMETRY](KAIROS_GEOMETRY.md) | Retícula, componentes y proporciones |

## Estado y fuentes

Observado = localizado en archivos; propuesto = no implementado; estimado = hipótesis sin benchmark. La revisión no auditó cada línea/binario de terceros. Evidencias de Interfaz-/docs/ son históricas y a veces describen etapas distintas: prevalecen código actual y GAP ANALYSIS para estado observado. Conservar nombres UPHOS en IDs, rutas, protocolos y citas históricas evita romper datos; no implica marca de producto vigente.

Las decisiones técnicas son inferencias sobre el código y capacidades contrastadas en documentación primaria enlazada junto a cada tema. Debian, Electron, EWMH, Desktop Entry, IDE y VirtualBox se consultaron; PackageKit devolvió error/403 y sigue abierto. Las versiones exactas y operaciones deben verificarse en el prototipo, no deducirse de documentación latest.

READY FOR IMPLEMENTATION significa que puede comenzar el primer hito acotado en VM. No certifica seguridad integral, compatibilidad, ISO arrancable ni MVP completo. La prueba funcional final corresponde a los 15 criterios y evidencia de reconstrucción.
