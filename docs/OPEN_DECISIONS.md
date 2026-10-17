# OPEN DECISIONS

Fecha: 2026-10-16. Ninguna opción pendiente se presenta como implementada. Los responsables son roles propuestos, no personas asignadas. Una decisión requiere evidencia guardada y actualización de ADR/plan cuando altere arquitectura.

| ID | OPEN DECISION y alternativas | Recomendación / responsable | Gate de cierre |
|---|---|---|---|
| OD-01 | Inicio de sesión: LightDM con sesión XDG vs login/startx supervisado | LightDM Live de usuario limitado; integración Linux | Semana 1: autoinicio, cierre/reinicio y entorno D-Bus/polkit correctos sin root en shell |
| OD-02 | Panel: wmctrl vs libwnck/PyGObject vs Xlib/xcb | wmctrl prototipo; elegir según pruebas de eventos/costo; integración Linux | Semana 1 mínimo y semana 5 definitivo: foco, XID, varias ventanas, reserva de espacio |
| OD-03 | Tray: host XEmbed, StatusNotifier D-Bus o aplazar tray general | Indicadores propios primero; investigar host separado; desktop | Semana 5: documentar protocolos soportados; no prometer todos los iconos |
| OD-04 | IDE/edición: VSCodium binario fijado vs build Code OSS; Standard demo vs Developer mínima | VSCodium + Git para demo, toolchains separadas; release | Antes de cerrar paquetes ISO: avisos, origen, updates, tamaño, ejecución/guardado |
| OD-05 | AI: proveedor cloud, modelo, presupuesto y secreto efímero vs almacén seguro | Adaptador cloud con credencial de usuario y contexto opt-in; AI | Antes de TASK-030: selección explícita y prueba real; sin ello MVP AI pendiente |
| OD-06 | Paquetes: PackageKit/backend APT vs herramientas Debian existentes | Consultas primero y Store posterior; Linux/security | Prototipo transacción/polkit en VM antes de exponer mutaciones; docs web upstream no accesibles |
| OD-07 | Guest Additions: paquetes compatibles del origen elegido vs ISO oficial fijada | Evitar mezclar instalaciones; release/QA | Semana 2 investigar, semana 7 verificar con host concreto; no asumir disponibilidad de paquetes |
| OD-08 | Terminal/arte: xterm vs alternativa ligera; Unicode vs ASCII; Fastfetch vs script mínimo | xterm/Bash y ASCII fallback; desktop/branding | Semana 3: terminal real, fuente UTF-8/ancho y herramienta disponible |
| OD-09 | Fuentes/iconos: Inter local vs Noto Sans; Bootstrap outline vs familia nueva | Reusar Inter/Bootstrap revisados y DejaVu Mono; diseño | Semana 1: glifos, licencia, offline y contraste; SVG oficial pendiente de revisión |
| OD-10 | Firmware: perfil BIOS validado + GRUB EFI vs GRUB unificado | Receta live-build estándar y branding equivalente; release | Semana 2: boot BIOS; semana 7 UEFI sin Secure Boot si viable; registrar cargador efectivo |
| OD-11 | Persistencia/instalación: Live temporal vs /home persistente vs instalador real | Live MVP, persistencia separada; producto/release | Antes de prometer entrega: confirmar rúbrica académica; instalación a disco implica reestimación |
| OD-12 | Horas, equipo y VM disponibles; ocho semanas vs extensión | No inventar disponibilidad; responsable técnico | Inicio: asignación real y reestimación tras primer hito; capacidad insuficiente cambia fecha, no declara MVP parcial completo |

Disponibilidad de versión Electron Linux, sandbox y bibliotecas se resuelve en TASK-002. El número declarado en simulador/package.json no sustituye esa prueba. Sin entorno de VM confirmado se pueden preparar fuentes, pero no certificar integración o ISO.
