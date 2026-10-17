# AGENTS.md — Kairós OS

## Purpose

This file defines the mandatory operating rules for AI coding agents working on Kairós OS.

It applies to:

- Codex
- OpenCode
- other compatible coding agents
- automated reviewers

Kairós OS uses documentation-driven development.

Agents must not invent architecture independently when accepted project documentation already exists.

---

# Product

Official name:

# Kairós OS

Kairós OS is a Debian-based Linux desktop operating environment/distribution.

Current architecture:

```text
Hardware / Virtual Machine
        ↓
Linux Kernel
        ↓
Debian
        ↓
systemd / udev / D-Bus / APT
        ↓
Xorg
        ↓
Openbox
        ↓
Kairós System Layer
        ↓
Kairós Desktop Shell
        ↓
Real Linux Applications

Kairós OS is NOT a simulation.
Legacy simulator components may remain for academic purposes but must not be confused with production Linux capabilities.
Primary goals
Kairós OS should provide:
- branded boot experience
- Kairós session
- geometric desktop shell
- launcher
- real Linux applications
- VSCodium/compatible development environment
- terminal
- Files
- Task Manager
- Devices
- Settings
- System Layer
- Kairós AI
- ISO generation
- VirtualBox support
Source of truth
Before implementing any task, inspect relevant documentation.
Priority:
1. docs/ARCHITECTURE_DECISION.md
2. docs/OPEN_DECISIONS.md
3. docs/IMPLEMENTATION_PLAN.md
4. docs/14-roadmap-8-weeks.md
5. component documentation
6. security documentation
7. branding/design documentation
If authoritative documents conflict:
STOP.
Report the conflict.
Do not silently choose one.
Mandatory project skills
Project-specific skills live under:
.agents/skills/

Required skills:
kairos-context
kairos-ui
kairos-os-security
kairos-dependency-security
kairos-docs
kairos-git-workflow

Skill selection
Every significant task
Start with:
kairos-context

It defines architecture and source-of-truth rules.
UI / UX / branding
Use:
kairos-context
kairos-ui

Examples:
- Desktop Shell
- launcher
- panel
- Settings
- Task Manager
- Files
- AI interface
- terminal branding
- Openbox theme
- Plymouth
- wallpaper
- icons
Security-sensitive work
Use:
kairos-context
kairos-os-security

Examples:
- Electron preload
- IPC
- Electron main
- D-Bus
- polkit
- systemd
- packages
- power
- devices
- .desktop parsing
- URL handling
- AI credentials
- remote content
Dependency changes
Use:
kairos-context
kairos-dependency-security

Examples:
- npm package
- Electron update
- Debian package
- APT repository
- VSCodium
- fonts
- icons
- system libraries
- build tools
Documentation changes
Use:
kairos-context
kairos-docs

Git/GitHub operations
Use:
kairos-git-workflow

before:
- creating branch
- worktree
- commit
- PR
- merge
- release
- rollback
Recommended workflow
For every implementation task:
1. Read task
       ↓
2. Load kairos-context
       ↓
3. Read relevant docs
       ↓
4. Inspect current code
       ↓
5. Select specialist skill
       ↓
6. Produce change plan
       ↓
7. Create/use isolated Git branch
       ↓
8. Implement smallest valid change
       ↓
9. Test
       ↓
10. Review security/UI as applicable
       ↓
11. Update documentation
       ↓
12. Record evidence
       ↓
13. Commit
       ↓
14. PR/review

Implementation preflight
Before changing code, report:
Task:
Category:
Relevant documentation:
Current implementation:
Files expected to change:
Dependencies:
Risks:
Security impact:
Validation plan:
Rollback:

Do not begin large implementation before understanding the existing code.
No unnecessary rewrites
Preserve working code.
Do not rewrite JavaScript merely to convert it to TypeScript.
TypeScript migration should be gradual and justified.
Do not replace Electron simply because another framework exists.
Do not replace Openbox during MVP.
Do not replace Debian.
No fake system features
Production Kairós applications must use real Linux information.
Do not simulate:
- CPU
- RAM
- processes
- storage
- hardware
- network
- USB
- applications
when a feature is presented as a real system capability.
Legacy educational simulation must remain clearly separated.
Desktop architecture
Kairós Desktop Shell is not the Window Manager.
Openbox manages Linux/X11 windows.
Kairós Shell manages:
- wallpaper
- panel
- launcher
- widgets
- notifications
- indicators
- shortcuts
- user experience
Do not attempt to embed external Linux applications into fake HTML windows.
VS Code/VSCodium must run as a real Linux process/window.
Firefox must run as a real Linux process/window.
Terminal must execute a real shell.
Application launching
Application discovery should use Linux/XDG mechanisms.
Relevant paths:
/usr/share/applications/
~/.local/share/applications/

Prefer structured launching through:
- GIO
- GAppInfo
- validated argv
Do not execute .desktop Exec content through arbitrary shell interpolation.
Electron security
Required baseline:
contextIsolation = true
nodeIntegration = false

Prefer sandbox where compatible.
Renderer must never receive arbitrary system command execution.
Good:
window.kairos.system.getCpu()
window.kairos.system.getMemory()
window.kairos.apps.launch(appId)

Forbidden:
window.kairos.exec(command)

Privilege model
Kairós Desktop does not run as root.
Use controlled Linux mechanisms:
- polkit
- D-Bus
- systemd/logind
- UDisks2
- NetworkManager
- PackageKit
Never solve privilege problems with global passwordless sudo.
Kairós AI
Kairós AI is not allowed unrestricted root or shell access.
Initial system context is read-only.
Context must be:
- opt-in
- minimal
- previewable
- redacted when necessary
Never expose:
- passwords
- tokens
- SSH keys
- secrets
- credential stores
to the AI automatically.
UI identity
Kairós UI is:
- geometric
- precise
- minimal
- technological
- intelligent
- calm
Primary symbol:
geometric owl.
Primary colors:
#0B1F3A
#123B73
#1296F3
#19C2FF
#BFE9FF
#F7FAFC
#1C2733
#0A0F16

Do not create generic gaming/cyberpunk UI.
The interface should remain identifiable as Kairós even without displaying the logo.
Design tokens
Use shared tokens.
Avoid raw style duplication.
Prefer:
colors
spacing
typography
shadows
components

Dependencies
Before introducing a dependency:
- justify it
- check maintenance
- check license
- check transitive dependencies
- check redistribution
- check security
- check rollback
Do not add dependencies casually.
Git policy
Do not develop directly on:
main

Use branches.
For concurrent Codex/OpenCode work use separate worktrees.
Suggested branch types:
feat/
fix/
security/
docs/
build/
chore/

No force push to protected branches without explicit human approval.
Multi-agent coordination
Codex and OpenCode must not independently modify the same feature simultaneously unless explicitly coordinated.
Prefer:
Codex
→ one task / branch / worktree

OpenCode
→ different task / branch / worktree

After completion, hand off through commit/PR rather than copying untracked changes between agents.
Documentation policy
If implementation changes:
- architecture
- behavior
- security
- IPC
- privileges
- build
- ISO
- packages
- application integration
update the relevant documentation.
Do not fabricate evidence.
Evidence policy
For integration work record evidence.
Examples:
docs/evidence/

Evidence can include:
- logs
- screenshots
- command output
- checksums
- build information
- VM configuration
- test results
Host safety
System-level Linux work belongs in:
- development VM
- build VM
- isolated environment
unless explicitly approved otherwise.
Never:
- repartition host disks
- alter host bootloader
- format host drives
- modify host system services unintentionally
ISO
Initial ISO architecture:
Debian
+
Linux Kernel
+
Xorg
+
Openbox
+
Kairós Session
+
Kairós Desktop
+
Kairós System Layer
+
Kairós Applications
+
Branding

Build system:
Debian live-build

Artifact naming:
kairos-os-<version>-amd64.iso

Do not invent version numbers.
Virtualization
Primary target:
VirtualBox

Future compatibility:
QEMU/KVM
VMware
GNOME Boxes

Validate real guest behavior.
Do not claim host hardware capabilities when only virtual hardware is visible.
MVP priority
Priority order:
1. Desktop
2. ISO
3. real Linux applications
4. Launcher
5. System Layer
6. VSCodium
7. Files / Task Manager / Settings
8. Security
9. Kairós AI
10. additional features

AI must not block the core OS.
Out of MVP
Do not prioritize unless explicitly approved:
- custom kernel
- custom Window Manager
- custom Wayland compositor
- Wine
- local large AI models
- Docker desktop architecture
- Kubernetes
- microservices
- custom filesystem
- custom drivers
Implementation gates
Follow the implementation plan by gates.
Gate 1
Architecture/session:
TASK-001
through
TASK-008

Goal:
Debian
→ Xorg
→ Openbox
→ Kairós Session
→ Kairós Desktop
→ Launcher
→ real Linux application

Do not continue to major ISO/system features if this gate fails.
Gate 2
ISO:
TASK-009
through
TASK-012

Goal:
bootable Kairós technical ISO.
Gate 3
Usable desktop:
TASK-013
through
TASK-016

Goal:
- Application Registry
- Launcher
- Terminal
- VSCodium
- Git
Gate 4
System integration:
TASK-017
through
TASK-028

Goal:
real system information and desktop integration.
Gate 5
AI:
TASK-029
through
TASK-030

Gate 6
Release:
TASK-031
through
TASK-036

Completion rule
Do not say:
DONE
COMPLETE
READY
SECURE
PRODUCTION READY

without evidence.
A task is complete only when its acceptance criteria are verified.
Agent handoff format
At the end of work provide:
KAIROS TASK HANDOFF

Task:
Status:
Branch:
Worktree:
Commits:

Files changed:

Implementation:

Tests executed:

Evidence:

Security review:

Documentation updated:

Known issues:

Open decisions:

Recommended next task:

Final principle
Kairós OS uses Linux and Debian as its foundation.
The project should not waste time rebuilding solved infrastructure without a clear reason.
Engineering effort should focus on:
- identity
- desktop experience
- integration
- system tools
- security
- development workflow
- AI integration
- maintainability
The goal is a real, bootable, usable Linux desktop environment with a distinct Kairós identity.