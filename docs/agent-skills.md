# Skills externas de agentes — Kairós OS

Fecha de revisión: 2026-10-16 (America/Tegucigalpa).
Alcance: primera ronda de seis skills; no se ejecutó TASK-001.

## Procedencia y licencias

Fuente mantenida de los seis nombres exactos: [osmontero/opencode-skills](https://github.com/osmontero/opencode-skills).
Revisión fijada: `c269996b62c8a8f245264851e24110b46c9d8863`.
HEAD upstream observado: 2026-10-07; el proyecto tiene historial de mantenimiento
visible. La fecha por carpeta indica su último cambio, no una garantía de soporte.
No se importaron forks desconocidos, agentes, configuraciones ni instaladores upstream.

| Skill | Source (ruta exacta en commit fijado) | License | Local path | Purpose | Último cambio upstream |
|---|---|---|---|---|---|
| `designing-frontend-interfaces` | [skills/designing-frontend-interfaces](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/designing-frontend-interfaces) | Apache-2.0 | `.agents/skills/designing-frontend-interfaces/` | Metodología visual; identidad y tokens Kairós prevalecen | 2026-07-24T20:16:24+01:00 |
| `reviewing-interface-quality` | [skills/reviewing-interface-quality](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/reviewing-interface-quality) | MIT | `.agents/skills/reviewing-interface-quality/` | Revisión visual con evidencia y severidad | 2026-07-26T14:30:13+01:00 |
| `reviewing-security` | [skills/reviewing-security](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/reviewing-security) | MIT | `.agents/skills/reviewing-security/` | Revisión de rutas de entrada, sinks e impacto | 2026-07-25T17:43:26+01:00 |
| `systematic-debugging` | [skills/systematic-debugging](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/systematic-debugging) | MIT | `.agents/skills/systematic-debugging/` | Investigación de causa raíz antes de corregir | 2026-07-24T20:16:24+01:00 |
| `verifying-before-completion` | [skills/verifying-before-completion](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/verifying-before-completion) | MIT | `.agents/skills/verifying-before-completion/` | Verificación reciente antes de afirmar resultados | 2026-05-08T00:26:11+01:00 |
| `using-git-worktrees` | [skills/using-git-worktrees](https://github.com/osmontero/opencode-skills/tree/c269996b62c8a8f245264851e24110b46c9d8863/skills/using-git-worktrees) | MIT | `.agents/skills/using-git-worktrees/` | Técnica de aislamiento; política Git Kairós prevalece | 2026-07-24T20:16:24+01:00 |

`designing-frontend-interfaces` incluye LICENSE.txt Apache-2.0; se conserva esa
licencia individual aunque la raíz del repositorio sea MIT. Las tres adaptaciones
`systematic-debugging`, `using-git-worktrees` y `verifying-before-completion`
conservan el aviso MIT de Jesse Vincent (obra/superpowers), adaptado por Osmany
Montero. Para los dos reviewers originales sin LICENSE.txt individual se agregó
una copia exacta del LICENSE MIT raíz (copyright Osmany Montero, 2026).
Los textos completos se conservan localmente porque sus condiciones requieren
redistribuir los avisos. No se interpreta el MIT raíz como reemplazo de Apache-2.0.

La selección de las adaptaciones mantenidas conserva los seis nombres aprobados.
En obra/superpowers la skill comparable de verificación se llama
`verification-before-completion`; no se renombró ni se creó un alias. Aquí se usa
el nombre oficial de la adaptación `verifying-before-completion`.

Todos los archivos de las seis carpetas se revisaron como texto antes de
importarlos: SKILL.md, referencias, licencias, shell auxiliar y ejemplo TypeScript.
Ningún script upstream fue ejecutado. Se conservó cada archivo byte por byte;
las únicas adiciones dentro de las carpetas son los dos avisos MIT indicados.
Los SHA-256 y rutas de origen están en [manifest.json](evidence/external-agent-skills/manifest.json).

## Autoridad, selección y flujos

[AGENTS.md](../AGENTS.md) establece la prioridad de instrucciones:
AGENTS.md → kairos-context → skill especialista Kairós → skill externa →
comportamiento genérico. La documentación aceptada de Kairós sigue gobernando
las decisiones del proyecto según su orden de fuentes de verdad.
Cargar solo skills relevantes y referencias necesarias (progressive disclosure).

- UI: kairos-context → kairos-ui → designing-frontend-interfaces → implementación
  → reviewing-interface-quality → verifying-before-completion.
- Seguridad: kairos-context → kairos-os-security → implementación
  → reviewing-security → verifying-before-completion.
- Depuración: kairos-context → especialista relevante → systematic-debugging
  → corrección → verifying-before-completion.
- Concurrencia Git: kairos-git-workflow → using-git-worktrees.

## Solapamientos y conflictos revisados

| Combinación | Complemento | Conflicto / aplicación local |
|---|---|---|
| kairos-ui + designing-frontend-interfaces | Identidad específica + método visual general | Rotación de estética, rechazo de Inter, un solo radio, nuevos colores, fuentes externas y animaciones decorativas ceden ante tokens, branding, licencias y movimiento Kairós. |
| kairos-ui + reviewing-interface-quality | Reglas Kairós + revisión con capturas | Umbrales web, viewport móvil, h1 y estado en URL se evalúan según componente desktop; no autorizan rediseño. La referencia a WCAG 2.5.8/44px del material es una simplificación upstream y debe verificarse antes de citarla como requisito normativo. |
| kairos-os-security + reviewing-security | Política/boundaries propios + proceso de trazado | Scanners y ejemplos no autorizan instalaciones ni envío de contenido; usar herramientas disponibles y reportar alcance. Ejemplos vulnerables son ilustraciones, nunca recetas. |
| kairos-os-security + systematic-debugging | Diagnósticos mínimos + búsqueda de causa raíz | El ejemplo `env`/IDENTITY puede exponer valores. AGENTS.md prohíbe reproducirlo: usar datos mínimos redactados, nunca credenciales ni entorno completo. |
| kairos-git-workflow + using-git-worktrees | Política propia + técnica de aislamiento | Setup automático, commits de ignores y cleanup requieren el alcance autorizado; no instalar dependencias ni crear commits adicionales en esta tarea. Nunca reset/clean/force push destructivos. |
| kairos-context/kairos-docs + verifying-before-completion | Criterios propios + evidencia reciente | Los resultados y porcentajes upstream no son evidencia de Kairós. |

La búsqueda de riesgos incluyó comandos destructivos, curl/wget a shell,
desactivación de seguridad, credenciales, force push, reset, eliminación y comandos
ajenos al propósito. No se encontró un instalador remoto ni borrado automático en
el conjunto seleccionado. Sí se detectaron los ejemplos de diagnóstico y setup
anteriores; quedan subordinados explícitamente a las reglas Kairós, sin editar el
contenido upstream. `find-polluter.sh` ejecuta pruebas npm y suprime sus fallos:
requiere inspección del proyecto/pruebas, no certifica PASS y no se ejecutó.
El TypeScript es un ejemplo de otro proyecto con imports propios, no una nueva
utilidad del producto ni una dependencia instalada.

## Skills relacionadas que no se importaron

Segunda ronda pendiente: designing-user-experience, building-accessible-interfaces,
writing-plans, coauthoring-docs, requesting-code-review, receiving-code-review.
Las referencias REQUIRED/companion upstream no autorizan instalarlas ni cargarlas.
Otros recursos ausentes: test-driven-development, testing-webapps/with_server.py,
designing-canvas-art/canvas-fonts, applying-themes/check_contrast.py,
finishing-a-development-branch, brainstorming y ejecutores de planes/agentes.
Usar las reglas Kairós y herramientas disponibles; declarar controles no ejecutados.
No se instaló ninguna dependencia transitiva de skills.

## Descubrimiento y validación

Las seis rutas `.agents/skills/<nombre>/SKILL.md` existen y mantienen el nombre
exacto. Frontmatter YAML válido desde el primer byte, name y description no vacíos,
carpeta coherente y longitudes compatibles. Las seis skills propias se preservaron.
No se creó una jerarquía paralela ni configuración global.

Descubrimiento local **VERIFIED** para las seis en ambos clientes:

- Codex CLI `0.162.0-alpha.2`: `skills/list` con cwd raíz y `forceReload: true`,
  sin ejecutar un modelo; cada entrada resuelve al SKILL.md del repositorio.
- OpenCode `1.19.3`: `opencode debug skill`, seis entradas con ubicación local exacta.

Resultados reducidos sin contenido global en [discovery.json](evidence/external-agent-skills/discovery.json).
Se verificó el catálogo local, no la selección automática por un modelo ni el
refresco de una conversación ya abierta. Las nuevas skills estarán disponibles
para el siguiente turno de Codex; si el catálogo sigue obsoleto, reiniciar sesión.
Reiniciar OpenCode para cargar cambios de configuración/skills en sesiones abiertas.
Referencia oficial: [OpenCode Agent Skills](https://opencode.ai/docs/skills/).
La consulta a [Codex Skills](https://developers.openai.com/codex/skills/) redirigió a
[Build skills](https://learn.chatgpt.com/docs/build-skills); la evidencia efectiva
para esta instalación es el catálogo local, no una suposición basada en esa página.

Validación reproducible de formato e integridad:
`python3 docs/evidence/external-agent-skills/validate.py` (PyYAML ya disponible).
Para refrescar descubrimiento, ejecutar OpenCode desde raíz y consultar el método
skills/list del app-server Codex con el protocolo de la versión instalada.

## Alcance y rollback

Cambios: seis carpetas externas, sección External Skills en AGENTS.md, este registro
y evidencia. Se cerró el fence Markdown preexistente tras el diagrama de AGENTS.md
para que las reglas y la sección nueva se interpreten como texto Markdown.
No se reescribió el resto del archivo ni se cambió TASK-000.
No se modificaron producto, arquitectura, Electron, Openbox, System Layer,
OPEN_DECISIONS, manifiestos ni lockfiles. No se instalaron dependencias, generó ISO,
hizo push o merge. `.vscode/` sin seguimiento pertenece al estado previo y se excluye.
Rollback: revertir exclusivamente el commit de integración, preservando trabajo ajeno.

Segunda ronda: propuesta futura, requiere autorización separada. TASK-001 queda sin
ejecutar; esta integración no certifica sus prerrequisitos funcionales/VM.
