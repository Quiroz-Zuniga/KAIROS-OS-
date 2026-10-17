"""Validate the reviewed skill snapshot; no execution of imported scripts."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import yaml

root = Path(__file__).resolve().parents[3]
evidence = Path(__file__).resolve().parent
names = {
    'designing-frontend-interfaces', 'reviewing-interface-quality',
    'reviewing-security', 'systematic-debugging',
    'verifying-before-completion', 'using-git-worktrees',
}
original = {
    'kairos-context', 'kairos-ui', 'kairos-os-security',
    'kairos-dependency-security', 'kairos-docs', 'kairos-git-workflow',
}
manifest = json.loads((evidence / 'manifest.json').read_text())
assert manifest['commit'] == 'c269996b62c8a8f245264851e24110b46c9d8863'
actual = {p.name for p in (root / '.agents/skills').iterdir() if p.is_dir()}
assert actual == names | original, actual
for name in sorted(actual):
    path = root / '.agents/skills' / name / 'SKILL.md'
    text = path.read_text()
    assert text.startswith('---\n'), path
    parts = text.split('---\n', 2)
    assert len(parts) == 3, path
    meta = yaml.safe_load(parts[1])
    assert isinstance(meta, dict), path
    assert meta['name'] == name, path
    assert re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', name), name
    assert len(name) <= 64
    assert isinstance(meta['description'], str) and 1 <= len(meta['description']) <= 1024
    if name in original:
        baseline = subprocess.check_output(
            ['git', 'show', '7257af1:' + str(path.relative_to(root))], cwd=root
        )
        assert path.read_bytes() == baseline, path
    print('PASS frontmatter / folder-name:', name)
expected_files = set(manifest['files'])
actual_files = {
    str(p.relative_to(root))
    for name in names
    for p in (root / '.agents/skills' / name).rglob('*')
    if p.is_file()
}
assert actual_files == expected_files
for path, record in manifest['files'].items():
    file = root / path
    assert not file.is_symlink(), path
    assert hashlib.sha256(file.read_bytes()).hexdigest() == record['sha256'], path
print('PASS pinned snapshot hashes:', len(expected_files), 'files')
for name in names:
    assert (root / '.agents/skills' / name / 'LICENSE.txt').is_file(), name
print('PASS six local license notices')
discovery = json.loads((evidence / 'discovery.json').read_text())
assert {entry['name'] for entry in discovery['skills']} == names
for entry in discovery['skills']:
    assert entry['codex'] == entry['opencode'] == 'VERIFIED'
    assert entry['path'] == f".agents/skills/{entry['name']}/SKILL.md"
print('PASS recorded discovery: Codex 6/6, OpenCode 6/6 (not a live re-scan)')
agents = (root / 'AGENTS.md').read_text()
assert 'Kairós project-specific skills override external skills when rules conflict.' in agents
assert 'External skills must be loaded only when relevant.' in agents
assert agents.count('```') % 2 == 0
assert all(name in agents for name in names)
print('PASS authority, progressive disclosure, selection and Markdown fence')
changed = subprocess.check_output(
    ['git', 'diff', '--name-only', '7257af1'], cwd=root, text=True
).splitlines()
allowed_docs = {'AGENTS.md', 'docs/agent-skills.md', 'docs/evidence/external-agent-skills.md'}
for path in changed:
    assert path in expected_files or path in allowed_docs or path.startswith('docs/evidence/external-agent-skills/'), path
print('PASS tracked scope vs baseline; no product / OPEN_DECISIONS / TASK-000 changes')
# Check new local Markdown links in authored docs. Skill examples are upstream text.
for rel in ['docs/agent-skills.md', 'docs/evidence/external-agent-skills.md', 'AGENTS.md']:
    path = root / rel
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if '://' not in target and not target.startswith('#'):
            assert (path.parent / target.split('#')[0]).exists(), (rel, target)
print('PASS authored Markdown local links')
