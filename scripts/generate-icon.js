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

async function main() {
  const projectRoot = path.join(__dirname, '..');
  const sourcePng = path.join(projectRoot, 'hill-or-no-shill-logo.png');
  const buildDir = path.join(projectRoot, 'build');
  const pngOutDir = path.join(buildDir, 'icons');

  const sizes = [16, 32, 48, 64, 128, 256];

  if (!fs.existsSync(sourcePng)) {
    console.error('Source logo not found:', sourcePng);
    process.exitCode = 1;
    return;
  }

  await ensureDir(buildDir);
  await ensureDir(pngOutDir);

  console.log('Generating PNG variants...');
  const pngPaths = [];
  for (const size of sizes) {
    const outPath = path.join(pngOutDir, `${size}.png`);
    await sharp(sourcePng)
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
  await sharp(sourcePng)
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