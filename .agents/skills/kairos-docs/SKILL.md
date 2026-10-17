---
name: kairos-docs
description: Keep Kairós OS architecture, ADRs, implementation plans, roadmap, security model, evidence, build instructions, interfaces, and user/developer documentation precise and synchronized with the repository.
---

# Kairós Documentation

## Principle

Documentation is part of the engineering system.

It is not decoration.

Agents must not invent architecture from memory when project documentation exists.

---

# Documentation structure

Prefer:

```text
ADRs

for accepted architectural decisions.
Prefer:
OPEN_DECISIONS.md

for unresolved architectural choices.
Prefer:
IMPLEMENTATION_PLAN.md

for task execution order.
Prefer dedicated component documentation for:
- system layer
- launcher
- UI
- AI
- ISO
- security
- virtualization
Prefer evidence files for integration results.
Do not duplicate authority
If one document owns a decision, other docs should link to it.
Avoid maintaining the same rule independently in five files.
This creates drift.
Architecture decision format
When a significant architecture decision changes, document:
Title

Status

Context

Problem

Decision

Alternatives

Consequences

Security Impact

Migration

Rollback

References

Superseding decisions
Never silently edit historical reasoning to pretend the architecture was always different.
If an accepted ADR changes:
create or document a superseding decision.
OPEN DECISIONS
If unresolved:
do not invent certainty.
Use:
## OPEN DECISION

### Question

### Why it matters

### Options

### Option A

### Option B

### Recommended direction

### Blocking tasks

Implementation task quality
Every important task should define:
WHY
WHAT
FILES
DEPENDENCIES
RISK
ACCEPTANCE
EVIDENCE
ROLLBACK

Avoid task names like:
Finish system
Improve UI
Fix security

Prefer small, verifiable tasks.
Evidence
Acceptable evidence includes:
- test results
- screenshots
- VM screenshots
- build logs
- checksums
- package manifests
- terminal output
- reproduction steps
Never fabricate evidence.
Precision
Use bounded claims.
Bad:
Kairós supports USB.

Better:
Kairós can enumerate USB devices exposed to the guest VM.

Bad:
VS Code is installed.

when the actual product contains VSCodium.
Bad:
Secure IPC implemented.

Better:
Launcher IPC validates sender, application ID schema, and rejects arbitrary command strings.

Status terminology
Prefer:
Planned
In progress
Implemented
Validated
Blocked
Experimental

Do not use:
Complete
Production-ready
Secure
Stable

without sufficient evidence.
Code/docs synchronization
Update documentation when behavior changes involving:
- architecture
- boot
- session
- IPC
- security boundary
- package list
- application registry
- system layer
- AI
- privileges
- ISO build
- virtualization
- release process
Small internal refactors do not require unnecessary documentation churn.
Commands
Documentation commands must be reproducible.
Avoid fake examples presented as verified commands.
When command is illustrative:
label it accordingly.
Versions
Never invent:
- Debian version
- kernel version
- Electron version
- package version
- ISO version
Read real values from project/build evidence.
Naming
User-facing product:
Kairós OS

Technical names:
kairos-*

Old names:
UPHOS
UPH-OS

should only remain for historical compatibility or migration context.
README
README should primarily:
- explain project
- show architecture summary
- link authoritative docs
- explain development setup
- explain build/test workflow
Do not turn README into a copy of every architecture document.
Documentation completion checklist
Before finishing documentation work:
- names consistent
- links valid
- versions verified
- commands verified
- assumptions marked
- OPEN DECISIONS explicit
- ADRs synchronized
- no unsupported claims
- no fake evidence
- stale UPH naming removed where appropriate