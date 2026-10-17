---
name: kairos-context
description: Load and enforce the architectural, product, branding, roadmap, and project constraints of Kairós OS before making changes. Use this skill before any task that affects architecture, desktop behavior, system integration, naming, roadmap, packaging, ISO generation, or cross-cutting decisions.
---

# Kairós Context

## Purpose

Treat the Kairós OS documentation as the primary source of truth for project decisions.

Kairós OS is a Debian-based Linux desktop environment/distribution.

Current architectural baseline:

- Linux kernel
- Debian base
- Xorg initially
- Openbox initially
- Electron-based Kairós Desktop Shell
- real Linux applications
- Kairós System Layer for controlled system access
- Debian live-build for ISO generation
- VirtualBox as the first virtualization target
- QEMU/KVM and VMware as future compatibility targets

Kairós OS is not a simulation.

The project may preserve previous simulation/laboratory components for academic or historical purposes, but production Kairós features must operate on real Linux capabilities.

---

# Required preflight

Before editing code:

1. Identify the task category.

Possible categories:

- UI
- UX
- desktop shell
- Linux integration
- system services
- security
- dependencies
- documentation
- Git/GitHub
- build
- packaging
- ISO
- AI
- virtualization
- branding

2. Read the relevant project documentation.

3. Inspect the current implementation.

4. Identify what already works.

5. Identify what must remain compatible.

6. List assumptions.

7. List unresolved decisions.

8. Determine whether an ADR or OPEN DECISION controls the task.

9. Preserve working functionality unless migration is explicitly required.

---

# Source-of-truth order

When documentation conflicts, use this priority unless a newer accepted ADR explicitly supersedes another document:

1. `docs/ARCHITECTURE_DECISION.md`
2. `docs/OPEN_DECISIONS.md`
3. `docs/IMPLEMENTATION_PLAN.md`
4. `docs/14-roadmap-8-weeks.md`
5. architecture-specific documentation
6. security documentation
7. design/branding documentation
8. implementation comments

If two authoritative documents conflict:

STOP.

Do not silently choose one.

Report:

- conflicting documents
- conflicting decisions
- affected implementation
- recommended resolution

---

# Core architecture

The intended stack is conceptually:

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
Applications

Kairós OS owns:
- visual identity
- desktop shell
- launcher
- panel
- system applications
- system integration layer
- AI integration
- branding
- user workflow
Debian provides:
- base operating system
- package ecosystem
- GNU/Linux userland
- system services
Linux provides:
- kernel
- memory management
- processes
- drivers
- filesystem support
- hardware abstraction
- networking
Core project rules
Do not replace Debian without an accepted architecture decision.
Do not write a custom kernel for the current MVP.
Do not replace Openbox until the project explicitly approves a Kairós Window Manager.
Do not migrate functional JavaScript only because TypeScript is preferred.
Migration to TypeScript should be progressive.
Do not introduce REST APIs when:
- Electron IPC
- D-Bus
- Unix sockets
- native APIs
can solve the problem more appropriately.
Do not expose arbitrary shell execution to the Electron renderer.
Do not treat simulated information as real Linux information.
Do not present fake:
- processes
- RAM values
- hardware
- storage
- applications
- network state
inside production Kairós applications.
Do not make Kairós AI a blocker for:
- desktop
- launcher
- ISO
- system layer
- applications
Do not introduce without approved architectural justification:
- Kubernetes
- Redis
- PostgreSQL
- microservices
- cloud backend
- Docker as desktop requirement
Product identity
Official user-facing name:
Kairós OS
Preferred technical identifiers:
kairos
kairos-desktop
kairos-shell
kairos-session
kairos-system
kairos-launcher
kairos-ai
kairos-files
kairos-settings

Avoid creating new identifiers using:
UPHOS
UPH-OS
uphos

except for historical compatibility.
Do not rename existing persistent identifiers blindly.
If changing an identifier could affect:
- stored data
- IPC
- configuration
- migrations
- tests
- user files
create a migration plan first.
Existing simulator/laboratory
Legacy simulation components must not automatically be deleted.
Treat them as separate from the Linux runtime implementation.
Possible uses include:
- academic demonstration
- scheduler visualization
- OS concepts
- comparison between simulation and real Linux
Do not mix simulated process IDs with Linux process IDs.
Do not make simulated state appear as system state.
Implementation behavior
Before coding, summarize:
Current state
What exists now?
Intended change
What will be modified?
Files
Which files are affected?
Reason
Why is the change necessary?
Dependencies
What must already exist?
Risk
What can break?
Validation
How will success be verified?
Rollback
How can the change be reverted safely?
Host safety
Linux integration must be developed and tested in:
- development VM
- disposable VM
- isolated build environment
when system-level changes are involved.
Do not:
- repartition the host
- modify host bootloader
- install system services on the host unintentionally
- mount or format host disks
- change host network configuration
when the task belongs to Kairós VM/ISO development.
OPEN DECISIONS
If an implementation depends on an unresolved OPEN DECISION:
STOP.
Do not guess.
Document:
OPEN DECISION REQUIRED

Decision:
Impact:
Options:
Recommended option:
Blocking tasks:

Completion rule
A task is not complete because code was written.
Completion requires applicable evidence:
- implementation
- tests
- integration validation
- screenshots for UI
- logs for system integration
- documentation updates
- security review when required
Never mark something as complete if acceptance criteria have not been verified.