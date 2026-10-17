---
name: kairos-os-security
description: Define and enforce Kairós OS security boundaries across Electron, Debian/Linux, IPC, preload, D-Bus, polkit, systemd, application launching, files, devices, packages, power operations, remote content, and Kairós AI.
---

# Kairós OS Security

## Security principle

Kairós Desktop must never become a privileged shell disguised as a graphical interface.

Capabilities must be:

- explicit
- limited
- validated
- auditable

---

# Trust zones

Treat separately:

1. Electron renderer
2. Electron preload
3. Electron main
4. Kairós System Layer
5. Linux system services
6. external applications
7. user files
8. `.desktop` files
9. remote web content
10. AI providers/models

---

# Renderer

Treat Electron renderer as untrusted.

Required:

```js
contextIsolation = true
nodeIntegration = false

Use sandbox where compatible.
Renderer must not receive:
- require
- filesystem unrestricted access
- process spawning
- raw Node APIs
- unrestricted D-Bus
- sudo
- arbitrary shell commands
Preload
Preload exposes a small capability API.
Good:
window.kairos.system.getCpu()
window.kairos.system.getMemory()
window.kairos.apps.launch(appId)

Bad:
window.kairos.exec(command)
window.kairos.shell(input)

Every exposed method must have a documented purpose.
IPC
IPC requests require:
- explicit channel
- sender validation
- input schema
- output schema
- length limits
- type validation
- predictable errors
For external operations:
- timeout
- cancellation where useful
Never create generic channels:
exec
shell
runCommand
admin
system
sudo

Main process
Electron main is trusted but must not automatically become root.
It should orchestrate narrowly scoped capabilities.
Avoid:
main process
   ↓
sudo everything

Kairós System Layer
System Layer is a privilege boundary.
Separate:
Read-only
Examples:
system.info
system.cpu
system.memory
system.processes
system.storage
system.devices
system.network

Mutating
Examples:
system.power.shutdown
packages.install
devices.mount
network.modify

Mutating operations require explicit policy and authorization.
Root policy
Kairós Desktop must not run as root.
Prefer:
- polkit
- D-Bus
- systemd
- logind
- UDisks2
- NetworkManager
- PackageKit
Do not architect the product around:
sudo NOPASSWD: ALL

Application launcher
.desktop files are untrusted structured input.
Do not:
sh -c "$EXEC_FROM_DESKTOP"

Do not concatenate commands.
Do not trust:
- paths
- arguments
- environment substitutions
Prefer:
- GIO
- GAppInfo
- validated argv
- fixed helpers
Correctly handle desktop entry field codes.
External applications
Linux applications launched by Kairós are external processes.
Do not assume:
- Firefox
- VS Code/VSCodium
- terminals
are trusted components of Kairós.
Do not give them privileged internal IPC access automatically.
URLs
Validate external URLs.
Restrict:
- custom protocols
- file URLs
- navigation
- window.open behavior
Remote content must not gain Node privileges.
Files
For privileged file operations:
- validate canonical paths
- consider symlinks
- verify target scope
- verify ownership
- avoid path traversal
Never silently:
- format disks
- delete system paths
- overwrite boot files
- mount arbitrary host storage
Devices
Device actions must distinguish:
- enumeration
- read
- mount
- unmount
- write
- format
Enumeration does not require the same privilege as destructive actions.
Never expose generic block-device write capabilities to UI.
Power
Use:
- systemd/logind
- D-Bus
- polkit
for:
- shutdown
- reboot
- suspend
Handle:
- permission denial
- inhibitors
- errors
Do not emulate success.
Packages
Installing software is privileged.
Prefer:
UI
 ↓
structured package request
 ↓
PackageKit / controlled package service
 ↓
authorization

Avoid:
renderer
 ↓
apt install <user input>

Kairós AI
Kairós AI initially has read-only system access.
AI must not automatically receive:
- API keys
- passwords
- SSH keys
- tokens
- environment variables
- browser cookies
- credential stores
- private files
- full process command lines
System context must be:
- opt-in
- previewable
- minimal
- redacted where appropriate
AI responses are untrusted data.
Never interpret an AI response as authorization.
Never provide unrestricted shell execution to AI.
X11
Document that X11 has weaker application isolation than modern Wayland designs.
Do not claim that X11 prevents applications from observing/interacting with the session.
This is a known architecture limitation.
Logs
Logs must avoid:
- secrets
- credentials
- authorization headers
- API keys
- environment secrets
- private file content
Use structured, redacted logs.
Secrets
Never store production credentials in:
- source code
- renderer bundle
- Git
- screenshots
- logs
Use an appropriate secure configuration mechanism.
Mandatory security review
Trigger this skill for changes involving:
- Electron main
- preload
- IPC
- remote content
- URL handling
- .desktop parsing
- application launching
- D-Bus
- polkit
- systemd
- power
- packages
- storage mutation
- mounting
- devices
- AI credentials
- auto-update
- release/signing
Security testing
Test:
- invalid input
- oversized input
- malformed IPC
- unauthorized sender
- missing permission
- cancellation
- timeout
- unavailable service
- dangerous paths
- special characters
- command injection attempts
- URL abuse
Completion criteria
Security-sensitive work is not complete until:
- renderer has no unrestricted Node access
- arbitrary commands cannot be executed
- inputs are validated
- authorization denial works
- errors fail closed
- secrets are not leaked
- logs are safe
- privileges are minimized