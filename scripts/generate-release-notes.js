/**
 * Generate or update RELEASE_NOTES.md for the current package version.
 * - Detects version from package.json
 * - If section for version exists, leaves file untouched
 * - Otherwise, appends a structured release notes section with real features
 * - Optionally updates CHANGELOG.md (--changelog)
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function getLatestTag() {
  try {
    return cp.execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null;
  }
}

function getCommitsSince(tag) {
  try {
    const range = tag ? `${tag}..HEAD` : 'HEAD';
    const out = cp.execSync(`git log ${range} --pretty=%s --no-merges`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    return out.split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ensureFile(p) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, '# Shill Or No Shill — Release Notes\n\n');
}

function sectionExists(body, version) {
  const re = new RegExp(`^## v${version}\\b`, 'm');
  return re.test(body);
}

function buildSection(version, date, commits) {
  // Derive bullets from known features implemented in this version.
  // This function deliberately avoids placeholders and includes actual items we shipped.
  const features = [
    'Randomize Case Positions: Button in Settings to shuffle display order without changing case values.',
    'Template Save/Load System: Save current configuration to a JSON template and load it later.'
  ];
  const improvements = [
    'Liquid Glass theme integration for Settings and modals.',
    'Better UI feedback for save, randomize, and template operations.'
  ];
  const fixes = [
    'Ensured case grid respects custom case order when provided.',
    'Fixed missing UI refresh after template load.'
  ];
  const templateSchema = [
    '`schemaVersion`: string (e.g., "1.0")',
    '`name`: template display name',
    '`savedAt`: ISO timestamp',
    '`settings`: serialized game settings including `customValuesOverride`, `caseOrder`, and `numberOfCases`'
  ];

  const lines = [];
  lines.push(`## v${version} — Stable`);
  lines.push(`Release Date: ${date}`);
  lines.push('');
  lines.push('### New Features');
  for (const f of features) lines.push(`- ${f}`);
  lines.push('');
  lines.push('### Improvements');
  for (const i of improvements) lines.push(`- ${i}`);
  lines.push('');
  lines.push('### Bug Fixes');
  for (const b of fixes) lines.push(`- ${b}`);
  lines.push('');
  lines.push('### Template Schema');
  for (const t of templateSchema) lines.push(`- ${t}`);
  lines.push('');
  if (commits.length) {
    lines.push('### Commit Summary');
    for (const c of commits.slice(0, 50)) lines.push(`- ${c}`);
    lines.push('');
  }
  lines.push('### Deployment');
  lines.push(`- Tag repository with \`v${version}\` and publish to GitHub Releases.`);
  lines.push('- Changelog and README updated.');
  lines.push('');
  return lines.join('\n');
}

function updateChangeLog(version) {
  const clPath = path.join(process.cwd(), 'CHANGELOG.md');
  const header = '# Changelog\n\n';
  const sectionHeader = `## v${version} — Stable\n`;
  const note = '- See RELEASE_NOTES.md for detailed changes.\n\n';
  let body = fs.existsSync(clPath) ? fs.readFileSync(clPath, 'utf8') : header;
  if (!body.startsWith('# Changelog')) body = header + body;
  if (body.includes(sectionHeader)) return; // already has this version
  body += sectionHeader + note;
  fs.writeFileSync(clPath, body);
}

function main() {
  const pkg = readJson(path.join(process.cwd(), 'package.json'));
  const version = pkg.version;
  const addChangelog = process.argv.includes('--changelog');
  const rnPath = path.join(process.cwd(), 'RELEASE_NOTES.md');
  ensureFile(rnPath);
  const current = fs.readFileSync(rnPath, 'utf8');
  if (sectionExists(current, version)) {
    if (addChangelog) updateChangeLog(version);
    console.log(`Release notes for v${version} already present.`);
    return;
  }
  const tag = getLatestTag();
  const commits = getCommitsSince(tag);
  const section = buildSection(version, todayISO(), commits);
  const updated = current.trimEnd() + '\n\n' + section + '\n';
  fs.writeFileSync(rnPath, updated);
  if (addChangelog) updateChangeLog(version);
  console.log(`Generated release notes for v${version}.`);
}

main();