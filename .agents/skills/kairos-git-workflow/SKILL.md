---
name: kairos-git-workflow
description: Enforce safe Git and GitHub collaboration for Kairós OS across Codex, OpenCode, and human contributors using isolated branches, worktrees, commits, pull requests, reviews, release traceability, rollback, and non-destructive Git operations.
---

# Kairós Git Workflow

## Core rule

No autonomous agent develops directly on:

```text
main
Use isolated branches.
For concurrent agents prefer Git worktrees.
Branch structure
Protected:
main

Optional integration:
develop

Feature branches:
feat/<scope>

Bug fixes:
fix/<scope>

Security:
security/<scope>

Documentation:
docs/<scope>

Build/ISO:
build/<scope>

Maintenance:
chore/<scope>

Examples:
feat/kairos-session
feat/application-registry
feat/system-layer
security/electron-ipc
build/live-iso
docs/architecture-review

Multi-agent work
Codex and OpenCode should not independently modify the same working tree for unrelated tasks.
Prefer:
.worktrees/
├── codex-task-002/
├── opencode-task-004/
└── review-task-004/

Rule:
1 task
1 branch
1 primary owner

until handoff.
Before starting work
Verify:
git status
git branch --show-current
git remote -v

Confirm:
- correct repository
- correct branch
- known working-tree state
- expected base commit
- task scope
- no credentials staged
Missing Git
If Git is not initialized:
STOP feature implementation.
Establish repository baseline first.
Do not implement many files and initialize Git later.
Commits
Commits should be:
- focused
- reviewable
- coherent
- reversible
Avoid combining:
UI redesign
+
security architecture
+
dependency updates
+
documentation rewrite

in one commit.
Commit format
Preferred:
type(scope): summary

Examples:
feat(session): add Kairós X11 session
feat(launcher): add XDG application registry
security(ipc): validate application launch requests
fix(panel): preserve active-window state
docs(adr): record launcher architecture
build(iso): add Kairós live-build package list

Allowed types
Recommended:
feat
fix
security
docs
test
build
chore
refactor

Pull requests
Each PR should contain:
Purpose
What does the PR solve?
Task
Which TASK does it implement?
Architecture impact
Does it change architecture?
Files
Major files/directories affected.
Tests
What was executed?
Evidence
Logs/screenshots where applicable.
Security
Does the PR change a trust boundary?
Rollback
How can it be reverted?
Limitations
What remains incomplete?
Visual PRs
UI changes should include screenshots when practical.
Prefer:
- before
- after
- dark mode
- light mode where relevant
- failure state if applicable
Security PRs
Security-sensitive PRs require explicit security review.
Examples:
- IPC
- preload
- package service
- power
- D-Bus
- polkit
- AI credentials
- application launching
Review separation
When possible:
implementation agent
        ↓
different reviewer

Use specialist review:
UI:
interface review

Security:
security review

Architecture:
spec/ADR review

Release:
reproducibility review

Merge conditions
Before merge:
- acceptance criteria met
- tests pass
- docs synchronized
- no secrets
- no temporary debugging code
- no host-specific absolute paths
- no unrelated changes
- critical review comments resolved
Main protection
Prefer GitHub branch protection for:
main

Recommended controls:
- PR required
- required checks
- no force push
- no deletion
- review required when team size permits
Destructive Git commands
Do not use without explicit human approval:
git reset --hard
git push --force
git push --force-with-lease
git clean -fd

when they may destroy shared/uncommitted work.
Never solve uncertainty by deleting work.
Rebase
Rebase local feature work if appropriate.
Do not rewrite shared reviewed history without coordination.
Releases
When releases begin:
v0.1.0
v0.2.0

Release must be connected to:
- Git commit SHA
- ISO checksum
- build manifest
- SBOM when available
- build instructions
- known limitations
ISO artifacts
Never commit large generated ISO files directly into Git unless repository policy explicitly requires it.
Prefer release artifacts or designated artifact storage.
Rollback
Before risky migration:
- create commit
- create branch/tag if justified
- record current state
- document rollback
- preserve important data
A VM snapshot can complement Git but does not replace source control.
Agent handoff
When Codex/OpenCode stops a task, report:
Task:
Branch:
Worktree:
Commits:
Files changed:
Implemented:
Pending:
Tests executed:
Failures:
Decisions:
Documentation changed:
Next recommended step:
