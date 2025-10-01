#!/usr/bin/env node
// Quick gate to ensure docs match the current version.
// CMD may be old, but it still slaps in batch mode.

const fs = require('fs');
const path = require('path');

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch (e) {
    throw new Error(`Missing required file: ${file}`);
  }
}

function main() {
  const pkg = require('../package.json');
  const version = pkg.version;
  if (!version) throw new Error('package.json version not found');

  const files = ['CHANGELOG.md', 'RELEASE_NOTES.md'];
  const patterns = [new RegExp(`\\bv${version}\\b`), new RegExp(`\\b${version}\\b`)];

  const failures = [];
  for (const f of files) {
    const content = read(path.join(__dirname, '..', f));
    const ok = patterns.some((re) => re.test(content));
    if (!ok) failures.push(f);
  }

  if (failures.length) {
    console.error(`Version ${version} not found in: ${failures.join(', ')}`);
    console.error('Run "npm run notes" or update the docs before tagging.');
    process.exit(1);
  }

  console.log(`Docs verified: version ${version} present in CHANGELOG.md and RELEASE_NOTES.md.`);
}

try { main(); } catch (e) { console.error(e.message); process.exit(1); }