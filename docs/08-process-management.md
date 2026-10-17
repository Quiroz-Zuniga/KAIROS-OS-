# 08. Administrador de procesos reales

> Revisión Kairós OS, 2026-10-16: la [ADR vigente](ARCHITECTURE_DECISION.md), el [roadmap](14-roadmap-8-weeks.md) y los [15 criterios MVP](MVP_ACCEPTANCE.md) gobiernan el alcance actual. Los identificadores técnicos actuales usan `kairos`; el manual técnico describe la implementación vigente. Las pruebas citadas de etapas anteriores no se ejecutaron en esta revisión.

## Fuente y semántica

La tabla real procederá de Linux mediante psutil dentro del invitado. `/proc` es procfs, una vista del kernel, no archivos persistentes ni el árbol virtual de KAIROS. `ps`, `top` y `htop` son instrumentos de contraste; systemd aporta unidades y cgroups, no una lista completa equivalente de todos los procesos.

| Campo | Fuente propuesta | Semántica |
|---|---|---|
| PID / PPID | psutil pid/ppid; /proc/PID/stat | IDs del namespace observado del invitado |
| Nombre | name/comm | Texto no confiable; no usarlo como identidad autorizada |
| Usuario | uids + resolución NSS | UID es autoridad; nombre puede fallar o demorar |
| CPU % | deltas de cpu_times sobre reloj monotónico | Convención top: 100 % por CPU lógica; multihilo puede superar 100 % |
| RAM | memory_info.rss | Bytes residentes; no suma exacta de RAM física por páginas compartidas |
| Estado | status | sleeping/running/zombie/etc.; no copiar estados virtuales propios |
| Tiempo CPU | cpu_times user + system | CPU acumulada, distinta de tiempo transcurrido |
| Inicio / transcurrido | create_time y reloj adecuado | Útil también para evitar reutilización de PID |

Muestreo cada 1–2 s, cacheado y único por sesión; no crear Python por cada fila ni ejecutar top y parsear su interfaz interactiva. Primera muestra CPU se presenta como pendiente/null. Normalizar contra número de CPU solo si la UI etiqueta explícitamente la convención; CPU global 0–100 % utiliza su propia medición. RSS en MiB = bytes/2^20, no MB sin aclaración. Registrar timestamp y datos caducados.

Usar `process_iter` con atributos mínimos; capturar NoSuchProcess, AccessDenied y desaparición entre campos. Mostrar campos inaccesibles sin pedir root, y paginar listas grandes. Limitar lectura de cmdline/environ por privacidad; no son necesarios para MVP. `/proc` puede restringirse por hidepid/namespaces. Fuentes: [psutil API](https://psutil.io/api/) y [documentación procfs del kernel](https://docs.kernel.org/filesystems/proc.html).

## Acciones

Comenzar con observación. Terminación limitada a procesos de prueba/lanzados por Kairós Desktop y del mismo UID; excluir kernel, init, servicios de sesión y la propia UI/helper. El UID por sí solo no basta como política de producto: terminar el gestor de ventanas también puede cerrar la sesión.

Antes de enviar SIGTERM revalidar PID, UID y create_time capturados; si identidad cambió, devolver conflicto. La comprobación de PID+inicio reduce riesgo, pero no elimina toda carrera entre comprobación y señal; usar pidfd cuando la biblioteca/plataforma elegida lo permita para una referencia estable. Esperar salida y actualizar lista; SIGKILL solo acción posterior explícita si se incorpora. No simular que un proceso murió al quitar una fila ni prometer kill exitoso antes de consultar resultado.

## Relación con el laboratorio actual

`VirtualSystem` conserva FCFS, SJF, prioridad, RR, recursos y ticks para enseñanza. El monitor Linux no puede cambiar el scheduler global seleccionando esas opciones. Scheduling Linux, prioridades/nice y políticas RT tienen semántica y privilegios distintos; modificarlos no está en MVP. Separar pantallas y contratos, no sustituir las filas de simulación dejando acciones incompatibles.

## Aceptación futura

Desde Bash invitado crear un hijo de prueba con vida conocida. La UI muestra PID/PPID/usuario y desaparición; comparar RSS y CPU aproximados con ps, admitiendo diferencias de instante. Probar proceso CPU intensivo acotado y multihilo para validar convención. Probar AccessDenied y proceso fugaz sin colapsar vista. Una petición sobre identidad anterior devuelve conflicto o proceso ausente. Ninguna prueba apunta a procesos del anfitrión.

## Privacidad del campo Command

La especificación nueva solicita Command. Se podrá mostrar una representación limitada por permisos/longitud en Task Manager, sin environ ni registro permanente; no enviar cmdline al contexto AI por defecto. Primera versión solo observa, terminar procesos queda posterior. Los PID del laboratorio no entran en esta API.
