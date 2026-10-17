# 02. Viabilidad y alcance de ocho semanas

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los identificadores técnicos actuales usan `kairos`; el manual técnico describe la implementación vigente. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

**Viabilidad técnica condicionada; plazo del MVP ampliado aún no confirmado.** El estudio previo de capacidad depende de disponibilidad y experiencia aún no confirmadas: dos integrantes con 15–20 horas semanales cada uno, 240–320 horas totales en ocho semanas; al menos uno capaz de depurar Linux, empaquetado y permisos. Con una persona a 10 horas semanales, reducir funciones o prever 12–16 semanas como hipótesis inicial.

Estimación histórica del alcance anterior, no presupuesto del MVP ampliado: arquitectura/prototipos 25–35 h, Live y sesión 35–45 h, UI/IPC 35–45 h, archivos/procesos 45–60 h, hardware/apps/configuración 30–40 h y QA/documentación 35–45 h: **205–270 h**, más 15–20 % de contingencia. Son rangos de planificación; el extremo alto supera 320 h con reserva. En ese caso se reestima fecha o se presenta una demo parcial expresamente identificada; no se declara cumplido el MVP ampliado.

## Clasificación

| Nivel | Funciones | Definición de terminado |
|---|---|---|
| MVP | ISO Live amd64, BIOS, Kairós Desktop en Electron, Openbox/X11, usuario sin root | Arranca desde ISO en VirtualBox; escritorio y apps nativas utilizables |
| MVP | Explorador real en hogar, crear/leer/editar/copiar/mover/renombrar/borrar con confirmación | Archivo creado en UI visible desde terminal del invitado y viceversa |
| MVP | Monitor real PID, PPID, usuario, CPU, RSS, estado y tiempos | Contraste con herramientas Linux y proceso controlado |
| MVP | Terminal externa Bash; Firefox y VSCodium/Git de demostración | Se ejecutan como usuario y sus ventanas quedan delante del escritorio |
| MVP | Inventario de hardware y USB | Muestra dispositivos del invitado y alta/baja de un USB transferido |
| MVP | Configuración mínima | Idioma/tema persistente en sesión; red y audio reales o indisponibilidad explícita |
| Importante | UEFI sin Secure Boot; persistencia ext4 en segundo disco virtual | Reinicio conserva archivo si se activa persistencia; firmware probado |
| Importante | Redimensionado con Guest Additions; controles básicos de audio/red | Evidencia en combinación fija de versiones |
| MVP ampliado | Panel con ventanas nativas, Kairós AI cloud y Settings | Evidencia exigida por la especificación Kairós; ver matriz vigente |
| Opcional | Terminal embebida, VMware/Boxes | Solo tras cerrar criterios MVP |
| Futuro | Instalador a disco, cuentas gráficas múltiples, Store administrativa, Wine, LibreOffice | Requieren nuevo alcance y pruebas |
| Experimental | Kernel Lab, drivers propios, compositor Wayland propio | Proyectos educativos independientes |

El filesystem del invitado es real aunque sea una capa Live temporal. **Arrancar una ISO, persistir datos e instalar en disco son entregables distintos.** Un modo Live temporal cumple el arranque, pero no promete conservar datos. Si la evaluación exige instalación y persistencia como condición obligatoria, reestimar antes de comprometer ocho semanas.

## Recursos y presupuesto técnico

Como presupuesto inicial sin benchmark: VM invitada con 2 vCPU, 4 GiB RAM, 20–30 GiB de disco virtual opcional; host con capacidad para esa VM. VM de build Debian con aproximadamente 4 vCPU, 8 GiB RAM y 30–40 GiB libres. Intentar ISO comprimida de 1.5–3 GiB con catálogo pequeño; Electron, navegador y firmware pueden excederla. Medir desde semana 2, no prometer tamaño ni RAM por comparación de frameworks.

Objetivos de QA propuestos: escritorio listo en menos de 90 s desde firmware sobre equipo de referencia; 30 min de uso sin caída, sin swap sostenido al abrir monitor, explorador y navegador. Registrar hardware, versión de hipervisor y tres corridas. El resultado real fijará los mínimos publicados.

## Valor académico

| Concepto | Demostración verificable |
|---|---|
| Kernel y system calls | Identificar kernel Debian; trazar un proceso de laboratorio con strace como usuario permitido |
| Procesos, padre/hijo y memoria | Bash crea hijo; monitor muestra PPID, RSS y estados reales |
| Filesystem y permisos | UI crea archivo; terminal verifica propietario, modo y contenido |
| Drivers y dispositivos | Dispositivo sysfs enlazado a driver; USB transferido genera evento |
| Shell y IPC | Bash con pipes Unix; UI consulta helper por IPC documentado |
| Bootloader y virtualización | Firmware → cargador → kernel/initramfs → Live → sesión gráfica |
| Planificación y sincronización | Mantener VirtualSystem para experimentar RR/FCFS y semáforos; no atribuir sus resultados al scheduler Linux |

No hace falta modificar kernel para explicar estos conceptos. El diseño conserva el laboratorio determinista y añade observación del sistema real.

## Reestimación por alcance Kairós

Los rangos 205–270 h y supuestos de equipo de este estudio son históricos y no presupuestan adecuadamente AI, IDE y panel obligatorio. Conservarlos solo como referencia; TASK-008/012 medirán la integración y fijarán estimación nueva. Ocho semanas es objetivo condicionado de riesgo alto, no garantía. Los 15 criterios actuales no se sustituyen por una demo más reducida sin declarar alcance parcial.
