---
name: kairos-dependency-security
description: Control Kairós OS npm, Electron, Debian, system package, toolchain, and release dependencies, including CVEs, secrets, licenses, lockfiles, SBOM, provenance, package sources, and software supply-chain security.
---

# Kairós Dependency Security

## Goal

Dependencies must be:

- necessary
- maintained
- auditable
- reproducible
- redistributable
- minimal

Do not install dependencies simply because they simplify one line of code.

---

# Dependency approval questions

Before adding a dependency answer:

1. What problem does it solve?
2. Can the current stack solve the problem already?
3. Is the project actively maintained?
4. Who maintains it?
5. What is its license?
6. Can Kairós redistribute it?
7. What transitive dependencies does it introduce?
8. Does it run install scripts?
9. Does it need network access?
10. Does it need privilege?
11. Does it introduce native code?
12. What is the rollback/removal strategy?

---

# JavaScript / npm

Requirements:

- commit lockfile
- use reproducible install commands
- inspect dependency changes
- inspect transitive dependencies
- avoid unnecessary install scripts
- avoid abandoned security-sensitive libraries

Treat Electron itself as security-sensitive.

---

# Lockfile

A pull request modifying:

```text
package-lock.json
pnpm-lock.yaml
yarn.lock

must explain why.
Large unexplained lockfile changes must be investigated.
npm security
Use:
npm audit

as one signal.
Do not assume every npm audit finding is exploitable.
Prioritize findings based on:
- severity
- reachability
- runtime usage
- exploitability
Debian packages
For each package included in Kairós ISO record:
- package name
- purpose
- repository
- whether runtime/build-only
- license notes when relevant
Minimize installed packages.
APT repositories
Avoid unnecessary third-party repositories.
Before adding one verify:
- source authenticity
- signing keys
- maintenance
- architecture support
- Debian compatibility
- redistribution requirements
Unsafe installers
Do not use:
curl URL | bash
wget -O- URL | sh

inside reproducible release builds.
Prefer:
- signed repositories
- verified artifacts
- pinned packages
- checksums
Vulnerability tools
Use where available:
npm audit
OSV-Scanner
Trivy
Grype
Debian Security Tracker

No single scanner is authoritative.
Verify critical findings.
Secret scanning
Use tools such as:
Gitleaks

before releases and important merges.
Never commit:
- AI API keys
- GitHub tokens
- SSH private keys
- signing private keys
- registry credentials
- real .env
Provide:
.env.example

without real values.
SBOM
For release candidates generate SBOM.
Cover:
- npm dependencies
- Electron runtime
- Kairós packages
- Debian packages included in ISO
Preferred standards:
SPDX
CycloneDX

Tools may include:
Syft

Licenses
Before redistributing software verify:
- license
- notice requirements
- source obligations
- modification requirements
- trademark restrictions
Pay particular attention to:
- VS Code
- VSCodium
- Electron
- fonts
- icons
- Debian packages
- AI models
- wallpapers/assets
VS Code / VSCodium
Do not assume the Microsoft VS Code binary can be redistributed under the same terms as Code OSS.
Document explicitly which variant is shipped.
Fonts
Every bundled font needs known redistribution permission.
Do not package random downloaded fonts.
AI models
If local AI models are added later verify:
- model license
- redistribution rights
- commercial restrictions
- attribution
- file size
- security implications
Update policy
Classify dependency updates as:
SECURITY_CRITICAL
ROUTINE
BREAKING
DEFERRED

Avoid major upgrades during release freeze unless necessary.
CI security gates
Target pipeline:
lockfile validation
      ↓
secret scan
      ↓
dependency scan
      ↓
tests
      ↓
build
      ↓
SBOM
      ↓
checksum
      ↓
signing/provenance

Release supply chain
Future releases should progressively support:
- SHA256
- SBOM
- artifact signatures
- provenance
- reproducible build documentation
Harness or equivalent tooling may later help here but is not required for initial MVP.
Reject dependency when
Reject if:
- purpose is unclear
- license is unknown/incompatible
- package is abandoned and security-sensitive
- package duplicates existing capability
- privilege requirement is unjustified
- untrusted input reaches shell
- source cannot be reasonably verified
- build becomes non-reproducible without justification
