/**
 * Generate Windows ICO and PNG app icons from the source logo.
 * - Resizes the source PNG to multiple sizes
 * - Builds a multi-size icon.ico
 * - Copies 256x256 PNG to build/icon.png for tray/taskbar usage
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
let toIco = require('png-to-ico');
// Support both CommonJS and ESM default export styles
toIco = typeof toIco === 'function' ? toIco : toIco.default;

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

function getArg(name) {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const kv = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (kv) return kv.split('=')[1];
  return undefined;
}

async function main() {
  const projectRoot = path.join(__dirname, '..');
  // Source selection priority:
  // 1) CLI: --source <path> or --source=path
  // 2) Env: APP_ICON_SOURCE
  // 3) Branded square PNG: assets/images/branding/logo-square.png
  // 4) Root PNG: hill-or-no-shill-logo.png
  // 5) AI SVG fallback: assets/images/icons/ai/app-icon.svg
  const cliSource = getArg('source');
  const envSource = process.env.APP_ICON_SOURCE;
  const brandedPng = path.join(projectRoot, 'assets', 'images', 'branding', 'logo-square.png');
  const rootPng = path.join(projectRoot, 'hill-or-no-shill-logo.png');
  const fallbackSvg = path.join(projectRoot, 'assets', 'images', 'icons', 'ai', 'app-icon.svg');
  const candidates = [cliSource, envSource, brandedPng, rootPng, fallbackSvg].filter(Boolean);
  const sourcePath = candidates.find((p) => fs.existsSync(p));
  const buildDir = path.join(projectRoot, 'build');
  const pngOutDir = path.join(buildDir, 'icons');

  const sizes = [16, 32, 48, 64, 128, 256];

  if (!sourcePath || !fs.existsSync(sourcePath)) {
    console.error('Source logo not found. Checked candidates:', candidates);
    process.exitCode = 1;
    return;
  }

  await ensureDir(buildDir);
  await ensureDir(pngOutDir);

  console.log('Generating PNG variants...');
  console.log('Source image:', sourcePath);
  const pngPaths = [];
  for (const size of sizes) {
    const outPath = path.join(pngOutDir, `${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    pngPaths.push(outPath);
  }

  console.log('Building ICO...');
  const icoBuffer = await toIco(pngPaths);
  const icoPath = path.join(buildDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);

  console.log('Preparing icon.png (256x256)...');
  const iconPngPath = path.join(buildDir, 'icon.png');
  await sharp(sourcePath)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(iconPngPath);

  console.log('Done. Generated:');
  console.log(' -', icoPath);
  console.log(' -', iconPngPath);
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exitCode = 1;
});