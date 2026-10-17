# ADR-001 — Kairós OS: distribución y entorno de escritorio Debian

> Documento de planificación o revisión previa. El [manual técnico actual](guia/arquitectura.md) describe el código disponible; las capacidades Linux de esta especificación siguen propuestas.


Fecha: 2026-10-16. Estado: **dirección arquitectónica adoptada por la especificación; implementación y validación pendientes**. Sustituye la recomendación anterior de evolución de KAIROS. Esta revisión entrega documentación, no un escritorio Linux terminado.

## Decisión

| Campo | Decisión |
|---|---|
| Product | Kairós OS |
| Type | Debian-based Linux desktop distribution/environment |
| Architecture | amd64 / x86_64 inicialmente |
| Kernel / Base | Linux empaquetado por Debian / Debian 13 trixie |
| Display / Window Manager | Xorg / Openbox inicialmente |
| Desktop Shell | Kairós Desktop en Electron; HTML/CSS/JavaScript reutilizados, TypeScript progresivo en contratos nuevos |
| System Integration | Kairós System Layer: Electron IPC + APIs Linux + D-Bus + servicios existentes |
| Applications | Aplicaciones Linux nativas; aplicaciones propias locales cuando aporten una función |
| Development Environment | VSCodium recomendado inicialmente; VS Code/Code OSS comparados en documento 18 |
| AI | Kairós AI, servicio cloud inicialmente y contexto opt-in de solo lectura |
| Packages | APT/dpkg; PackageKit candidato para futuras transacciones gráficas |
| ISO | Debian live-build; kairos-os-<version>-amd64.iso |
| Primary Virtualization Target | VirtualBox; BIOS primero, UEFI sin Secure Boot como objetivo separado |
| Visual Identity | Búho geométrico y paleta azul/cyan |
| Design Principle | Geométrico, preciso, inteligente, mínimo |

La base trixie se verifica en [Debian Releases](https://www.debian.org/releases/). La versión concreta de paquetes/runtime se fijará en el manifiesto del prototipo; no se deduce del manifiesto del simulador.

## WHY

Ya existen una GUI modular, aplicaciones locales, pruebas y un wrapper Electron aislado. Faltan sesión, ventanas nativas, registro de aplicaciones, capacidades Linux y empaquetado. Reutilizar esas bases reduce la migración; Openbox resuelve ventanas reales. No se desarrolla kernel, driver, WM o compositor propio.

## WHAT

Hardware/VM → Linux → Debian → systemd/udev/D-Bus/APT → Xorg → Openbox → Kairós System Layer → Kairós Desktop → aplicaciones Linux. La sesión Kairós será predeterminada en la imagen, sin abrir manualmente una app desde otro escritorio. Wallpaper y panel tendrán roles X11 separados cuando la prueba lo requiera. Electron no sustituye al WM.

## IMPACT

La especificación vigente cambia el producto de simulación a entorno/distribución real. El código actual continúa siendo simulación hasta completar capacidades concretas. `simulador/` y `Interfaz-/` permanecen disponibles como laboratorio y base de migración. No convertir particiones virtuales en operaciones de disco ni credenciales académicas en cuentas Linux. `AGENTS.md` delimita la simulación ejecutable y mantiene la protección del anfitrión. Las capacidades Linux requieren un alcance de implementación separado.

## MIGRATION

Crear una entrada Linux separada y extraer gradualmente la GUI, sin mover todo el árbol. Mantener pruebas y definir una migración de datos explícita cuando sea necesaria. Nuevas capacidades usan `window.kairos`, métodos explícitos y validación backend. Migración de marca por superficies, con mapa de compatibilidad y pruebas de datos. Plan detallado: [IMPLEMENTATION_PLAN](IMPLEMENTATION_PLAN.md), [GAP_ANALYSIS](GAP_ANALYSIS.md) y [06](06-ui-migration.md).

Primer hito obligatorio: Debian → Xorg → Openbox → sesión Kairós → escritorio → launcher → Firefox o terminal real, con foco y Alt+Tab. Después cerrar receta ISO y System Layer. El launcher mínimo no implica tener ya completado el descubrimiento de aplicaciones de semana 3.

## ROLLBACK

Recuperar únicamente los archivos de cada tarea desde una copia o referencia verificable; este directorio no expone un repositorio Git en su raíz. Conservar datos originales y laboratorio. Si falla la sesión, recuperar una sesión de diagnóstico en la VM; ejecutar el shell maximizado sirve para depurar pero **no cumple** el criterio de experiencia Kairós. Ningún rollback requiere reset destructivo, particionar o cambiar el anfitrión.

## Límites y decisiones

Live temporal, persistencia e instalación son entregas distintas. Instalador a disco, Wine, modelos locales grandes, Store administrativa y WM/kernel propios quedan fuera. Los 15 criterios de MVP incluyen VSCodium, panel de ventanas reales, Settings y AI funcional; no se reducen al alcance del estudio anterior. Riesgo alto; ocho semanas son condicionales a horas/equipo aún desconocidos. [OPEN DECISIONS](OPEN_DECISIONS.md) registra alternativas y gates sin inventar resolución.
