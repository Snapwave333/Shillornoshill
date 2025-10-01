#!/usr/bin/env node
// Tiny cross-shell tag helper — because consistency is king.
// This function is smoother than a fresh Windows install.

const { execSync } = require('child_process');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${err.message}`);
  }
}

function runInherit(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    throw new Error(`Command failed: ${cmd}\n${err.message}`);
  }
}

function main() {
  const pkg = require('../package.json');
  const version = pkg.version;
  if (!version) throw new Error('package.json version not found');
  const tag = `v${version}`;

  const argv = process.argv.slice(2);
  const force = argv.includes('--force');

  // Sanity checks
  const inRepo = run('git rev-parse --is-inside-work-tree');
  if (inRepo !== 'true') throw new Error('Not inside a Git repository');

  let originUrl = '';
  try {
    originUrl = run('git remote get-url origin');
  } catch (_) {
    throw new Error('Git remote "origin" not found. Add it before tagging.');
  }

  const hasLocal = run(`git tag -l ${tag}`);

  if (force) {
    if (hasLocal) runInherit(`git tag -d ${tag}`);
    // Remove remote tag if exists (ignore errors)
    try { runInherit(`git push origin :refs/tags/${tag}`); } catch (_) {}
  }

  // Create tag if missing
  const existsNow = force ? '' : hasLocal;
  if (!existsNow) {
    console.log(`Creating tag ${tag}`);
    runInherit(`git tag ${tag}`);
  } else {
    console.log(`Tag ${tag} already exists locally.`);
  }

  // Push tag to origin
  console.log(`Pushing ${tag} to origin (${originUrl})`);
  runInherit(`git push origin ${tag}`);
  console.log(`Done: ${tag} pushed.`);
}

try {
  main();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}