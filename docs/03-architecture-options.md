# 03. Comparación de arquitecturas

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los identificadores técnicos actuales usan `kairos`; el manual técnico describe la implementación vigente. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

A, B y C no son alternativas del mismo nivel. A sustituye el kernel; B elige una distribución personalizada; C define cómo la UI y servicios propios se integran sobre esa distribución. La propuesta combina **B como distribución y C como arquitectura de aplicaciones**.

## Kernel propio frente a Linux

| Aspecto | Desde cero | Kernel Linux de la base |
|---|---|---|
| Tiempo | Boot mínimo educativo posible; escritorio completo fuera de ocho semanas | Integración de semanas sobre componentes existentes |
| CPU, memoria y aislamiento | Implementar scheduler, paginación, syscalls y protección | Ya disponibles y mantenidos; observar con interfaces públicas |
| Drivers y gráficos | PCI, GPU, disco y entrada bloquean apps | Drivers virtuales existentes; requiere probar combinación |
| Filesystem y red | Crear/adaptar VFS, almacenamiento y protocolos | ext4, pila TCP/IP, sockets y herramientas |
| USB y audio | Enumeración, clases, hotplug y mezclador propios | Subsistemas Linux, udev y PipeWire |
| Seguridad y estabilidad | Validación muy limitada y enorme superficie nueva | Base mantenida; configuración y UI siguen siendo responsabilidad Kairós OS |
| Virtualización | Un hipervisor simplifica hardware, no elimina su implementación | Invitado estándar con drivers de VM |

Un kernel de juguete no ejecutará automáticamente Electron ni aplicaciones Linux: necesitaría ABI, loader, libc y user space compatibles o portar sus runtimes. Recomendación: kernel Debian sin parches. `KAIRÓS OS Kernel Lab` puede arrancar en QEMU con serial y un experimento de memoria/procesos, en repositorio o carpeta experimental separada, sin dependencia de entrega.

## Bases candidatas

| Base | Ventaja | Costo para este proyecto | Decisión |
|---|---|---|---|
| Debian 13/trixie | Paquetes, Live y actualizaciones integradas | Aprender receta Live y sesión personalizada | Principal |
| Ubuntu LTS | Ecosistema y escritorio conocido | Imagen mínima y personalización pueden añadir capas | Alternativa si equipo ya domina su construcción |
| Arch + archiso | Flexible y documentación técnica | Rolling release exige congelar snapshots y resolver variación | No para primer plazo |
| Alpine | Base compacta | musl y disponibilidad de runtimes web complican reutilización | No priorizar tamaño antes de compatibilidad |
| Buildroot | Imagen controlada para dispositivo dedicado | No ofrece el flujo APT de escritorio general; gestión de imagen completa | Adecuado para appliance futuro |
| Yocto | Capas, recetas y productos embebidos mantenibles | Curva y compilación desproporcionadas al equipo/plazo | No para MVP |
| Linux From Scratch | Excelente aprendizaje de toolchain/base | Construcción y mantenimiento manuales, GUI requiere más trabajo | Ruta académica independiente |

Fuentes: [Debian Live](https://live-team.pages.debian.net/live-manual/html/live-manual/the-basics.en.html), [Buildroot](https://buildroot.org/downloads/manual/manual.html), [Yocto](https://docs.yoctoproject.org/overview-manual/yp-intro.html), [LFS](https://www.linuxfromscratch.org/lfs/view/stable/). Son capacidades de herramientas; las valoraciones de plazo son inferencias para Kairós OS. La página Archiso no pudo leerse por protección del sitio; su receta concreta queda por validar al evaluar esa alternativa.

## Interfaz gráfica

| Opción | Rendimiento y RAM, cualitativos | Acceso Linux y procesos/archivos | Dificultad y mantenimiento | Ventanas, seguridad y reutilización |
|---|---|---|---|---|
| Electron | Chromium/Node incluidos; mayor base y varios procesos | IPC a Node y helpers; muy directo | Menor migración: wrapper existente; actualizar runtime y empaquetar Linux | Muy alta reutilización; renderer aislado; necesita WM externo |
| Tauri | Paquete menor al usar WebKitGTK; RAM depende de UI y WebView | Comandos Rust y capacidades; puede usar helpers | Añade Rust y diferencias WebKit; revisar cada API | Alta reutilización HTML; no sustituye WM; permisos estrechos |
| GTK con C/Python/Rust | UI nativa; suele evitar runtime de navegador | GLib/GIO y D-Bus integrados | Reescribir widgets/layout; Python acelera pero agrega binding | Gran integración Linux; poca reutilización de HTML/CSS |
| Qt con C++/Python/C# | UI nativa/QML; QtWebEngine cambia presupuesto | QtCore/DBus; bindings según lenguaje | C++/PySide maduros; C# exige evaluar binding, soporte y licencia | Reescritura importante; controles/WM siguen distintos |
| Chromium kiosk + web | Runtime navegador; no garantiza menor RAM | Requiere puente local separado para acceder al SO | Fácil pantalla inicial; difícil frontera segura y apps externas | Conserva UI; kiosk puede ocultar apps nativas; no es escritorio por sí solo |

No se justifican cifras de RAM sin mediciones comparables. Las opciones nativas pueden ser convenientes si se acepta una migración larga. [Tauri exige Rust y dependencias WebKitGTK](https://v2.tauri.app/start/prerequisites/); Electron permite conservar el código y aplicar [aislamiento de contexto](https://www.electronjs.org/docs/latest/tutorial/context-isolation). La elección actual se fundamenta en costo de migración, no en superioridad universal de rendimiento.

## Matriz final

Escala cualitativa. Tiempo = orientación hasta un MVP comparable, con los supuestos de personal de 02; no cotización. En opciones de UI, ISO significa que necesitan una base Linux adicional.

| Arquitectura | Complejidad | Tiempo | Riesgo | Reutilización actual | ISO | Hardware | Recomendación |
|---|---|---|---|---|---|---|---|
| Kernel propio | Extrema | Fuera de 8 semanas; meses/años según alcance | Crítico | Baja | Boot mínimo posible | Drivers propios limitados | Solo laboratorio |
| Debian personalizado | Media | 8 semanas acotadas | Medio | Alta con web | live-build | Linux | Base elegida |
| Arch personalizado | Media/alta | 8–12+ semanas estimadas | Alto | Alta con web | archiso | Linux | Segunda opción experta |
| Buildroot | Alta para escritorio | 12+ semanas estimadas | Alto | Parcial | Configurable, no escritorio listo | Linux seleccionado | Appliance futuro |
| Yocto | Muy alta inicial | Fuera del MVP | Alto | Parcial | Recetas/imagen | Linux/BSP | No inicial |
| Linux From Scratch | Muy alta | Fuera del MVP | Alto | Parcial | Manual | Linux integrado manualmente | Formación separada |
| Aplicación Electron | Baja/media en UI | Incremental desde semana 1 | Medio | Muy alta | No sola | Vía backend Linux | UI elegida |
| Shell web sobre Linux | Media | Prototipo rápido; integración incierta | Alto si kiosk bloquea apps | Muy alta | Con base Linux | Vía puente | Fallback de demo limitado |
| GTK/Qt | Alta migración | Probablemente supera 8 semanas | Alto para este código | Baja visual, lógica parcial | Con base Linux | Buena integración | Reevaluar después |
| Híbrido Debian + Electron + Openbox | Media/alta acotada | 8 semanas bajo condiciones | Medio/alto | Muy alta | Sí | Linux y servicios existentes | Recomendación global |

Fuentes complementarias para UI nativa: [documentación GTK y bindings](https://www.gtk.org/docs/), [licencias y módulos Qt](https://doc.qt.io/qt-6/licensing.html), [Qt for Python](https://doc.qt.io/qtforpython-6/licenses.html). La comparación de esfuerzo parte de que la base histórica ya está escrita en HTML/CSS/JS; no es un benchmark entre toolkits.
