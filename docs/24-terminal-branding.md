# 24. Terminal, búho y Fastfetch

Estado: especificación; no se modificó Bash, terminal, hostname ni MOTD del anfitrión. La consola simulada conserva sus comandos educativos. Linux MVP abre xterm/Bash real.

| Token | Color |
|---|---|
| --terminal-bg | #071019 |
| --terminal-text | #D9F2FF |
| --terminal-blue | #19C2FF |
| --terminal-green | #23C483 |
| --terminal-warning | #F4B740 |
| --terminal-error | #E5484D |

Prompt conceptual kairos@system:~$: usuario real cyan, hostname real blue, ruta ice; no fijar kairos/root si no son la identidad del proceso. Colores ANSI encerrados correctamente en secuencias no imprimibles de PS1; mantener longitud/cursor. Cambios por usuario en imagen, sin reemplazar /etc/profile global innecesariamente. No ejecutar Fastfetch en cada shell no interactiva ni añadir demoras al boot.

## Adaptaciones candidatas, todavía no oficiales

Referencia recibida: `Logo/kairoz-terminal-boot.txt`; incluye bloques Unicode y textos de arranque mezclados. Conservar original como referencia. No es una reproducción vectorial ni un arte aprobado para terminal. Preparar dos variantes nuevas, sin K en el búho:

ASCII candidato:

```text
 /\     /\
/  \___/  \
| (o) (o) |
 \   V   /
  \ / \ /
   /___\
```

Unicode candidato:

```text
 ╱╲     ╱╲
╱  ╲___╱  ╲
│ (◉) (◉) │
 ╲   V   ╱
  ╲ ╱ ╲ ╱
   ╱___╲
```

Estos bocetos deberán revisarse en fuente monoespaciada antes de convertirse en activos. Probar UTF-8, locale no UTF-8, ancho con wcwidth, 80×24 y ventanas estrechas, fuente alternativa, copy/paste y alineación de ojos. Captura desde terminal real y ajuste manual son criterios obligatorios; no declarar validación por imprimir Markdown. ASCII es fallback por configuración cuando Unicode no alinea, no por suposición sobre TERM.

## Fastfetch

Configuración futura `system/branding/fastfetch/config.jsonc`, logo terminal revisado y alias/lanzador opcional. Mostrar Kairós OS; Base Debian GNU/Linux; kernel real; Bash; Openbox; nombre real del emulador; CPU/memoria/uptime reales. Solo titular «Kairós Terminal» si se distribuye un wrapper identificado como tal; no atribuir motor propio a xterm.

No falsificar os-release del proveedor Debian para modificar una sola línea. La marca proviene de paquete/metadata Kairós y configuración del fetch, conservando atribuciones. Verificar esquema y disponibilidad del Fastfetch elegido al implementar; si no está disponible, usar un script mínimo de consulta real sin etiquetarlo Fastfetch. OD-08 decide variante terminal y herramienta después de esa prueba.
