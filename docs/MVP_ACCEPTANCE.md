# MVP — matriz de aceptación

Estado inicial: **los 15 criterios están pendientes en Linux/ISO**. La GUI web y las capturas históricas no acreditan ninguno por sí solas. Cada evidencia registrará build, checksum de ISO, kernel/paquetes, firmware, hipervisor y recursos de VM, sin secretos.

| ID | Criterio solicitado | Prueba exigida en invitado |
|---|---|---|
| MVP-01 | Arrancar ISO | Tres arranques de la misma ISO identificada por SHA256 |
| MVP-02 | Branding Kairós | Cargador/splash/sesión con nombre/activos correctos y logs accesibles |
| MVP-03 | Escritorio Kairós | Sesión predeterminada automática, shell usuario normal y sandbox efectivo |
| MVP-04 | Launcher Kairós | Catálogo real y búsqueda; errores explícitos para entrada ausente |
| MVP-05 | App Linux real | Firefox/terminal externo con ventana X11/foco/Alt+Tab; panel refleja ventanas |
| MVP-06 | VS Code/VSCodium | Abrir IDE real desde launcher, versión/origen/avisos registrados |
| MVP-07 | Editar archivo | Guardar texto en hogar y verificar/modificar desde terminal; Git init/status |
| MVP-08 | Terminal real | Bash interactiva, pipes y Ctrl+C en terminal nativa, sin intérprete académico |
| MVP-09 | Archivos reales | Gestor nativo inicial navega, crea y muestra cambios reales; permisos correctos |
| MVP-10 | Procesos reales | PID/PPID/CPU/RSS/UID/estado contrastados con herramientas Linux |
| MVP-11 | Hardware real | Inventario del invitado, alta/baja USB transferido; sin baterías/SSID ficticios |
| MVP-12 | Settings | App modular abre, tema/idioma y About; estados red/audio o unavailable reales |
| MVP-13 | Kairós AI | App abre y conversa con proveedor real seleccionado; contexto read-only opt-in |
| MVP-14 | Apagar/reiniciar | Interfaz llama logind/política real, maneja inhibidor/cancelación y apaga/reinicia VM |
| MVP-15 | VirtualBox | Matriz de boot, gráficos, resolución, mouse, teclado, audio, red, storage, clipboard y USB |

Clipboard y shares host opt-in; probar tanto desactivados como habilitados por acción explícita en entorno de QA, nunca compartir datos automáticamente. BIOS es gate inicial; UEFI sin Secure Boot se informa por separado. Persistencia y Live temporal se identifican en UI/guía. Una prueba no ejecutada se marca pendiente, no aprobada por inferencia.

No se exige terminal propia PTY ni Files completo si las apps Linux reales satisfacen sus criterios. Panel con ventanas reales, VSCodium y AI sí forman parte del alcance nuevo. Los informes finales no deben llamarlo MVP completo si hay algún criterio pendiente. Evidencia de pruebas de seguridad, reconstrucción y sesión de 30 minutos acompaña los 15 criterios.
