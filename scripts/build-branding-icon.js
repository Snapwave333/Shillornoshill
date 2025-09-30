/**
 * Build a square branding PNG (logo-square.png) that matches the provided design:
 * - Purple starburst background
 * - Blue globe with latitude/longitude grid
 * - Two rounded squares: green "SHILL" with check, red "NO SHILL" with cross
 * - Ribbon banner: "SHILL OR NO SHILL"
 *
 * Output: assets/images/branding/logo-square.png (1024×1024)
 *
 * PowerShell: because typing less is a lifestyle.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

function buildSvg({ size = 1024 } = {}) {
  const s = size;
  const center = s / 2;
  const bg = `
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#4B2DB4"/>
        <stop offset="60%" stop-color="#3A1D8F"/>
        <stop offset="100%" stop-color="#24135A"/>
      </radialGradient>
      <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6B2CEF"/>
        <stop offset="100%" stop-color="#4C1DBD"/>
      </linearGradient>
      <linearGradient id="orbGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3BC7FF"/>
        <stop offset="100%" stop-color="#0077CC"/>
      </linearGradient>
      <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.4" />
      </filter>
    </defs>
  `;

  // Globe grid paths
  const globeRadius = s * 0.30;
  const gridLines = [];
  const latitudes = [-60, -30, 0, 30, 60];
  const longitudes = Array.from({ length: 8 }, (_, i) => i * 22.5 - 78.75);
  for (const lat of latitudes) {
    const ry = globeRadius * Math.cos((lat * Math.PI) / 180);
    const cy = center + globeRadius * Math.sin((lat * Math.PI) / 180);
    gridLines.push(`<ellipse cx="${center}" cy="${cy.toFixed(2)}" rx="${globeRadius.toFixed(2)}" ry="${ry.toFixed(2)}" stroke="#86D9FF" stroke-opacity="0.45" stroke-width="2" fill="none" />`);
  }
  for (const lon of longitudes) {
    const rx = globeRadius * Math.cos((lon * Math.PI) / 180);
    const cx = center + globeRadius * Math.sin((lon * Math.PI) / 180);
    gridLines.push(`<ellipse cx="${cx.toFixed(2)}" cy="${center}" rx="${rx.toFixed(2)}" ry="${globeRadius.toFixed(2)}" stroke="#86D9FF" stroke-opacity="0.45" stroke-width="2" fill="none" />`);
  }

  // Decision buttons
  const btnSize = s * 0.18;
  const btnRadius = s * 0.04;
  const gap = s * 0.06;
  const leftX = center - btnSize - gap / 2;
  const rightX = center + gap / 2;
  const btnY = center - btnSize * 0.25;
  const checkMark = (
    `<path d="M ${leftX + btnSize*0.28} ${btnY + btnSize*0.55} l ${btnSize*0.10} ${btnSize*0.10} l ${btnSize*0.24} -${btnSize*0.24}" stroke="#ffffff" stroke-width="10" stroke-linecap="round" fill="none" />`
  );
  const crossMark = (
    `<path d="M ${rightX + btnSize*0.30} ${btnY + btnSize*0.30} l ${btnSize*0.40} ${btnSize*0.40}" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />`+
    `<path d="M ${rightX + btnSize*0.70} ${btnY + btnSize*0.30} l -${btnSize*0.40} ${btnSize*0.40}" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />`
  );

  // Ribbon banner
  const ribbonW = s * 0.78;
  const ribbonH = s * 0.12;
  const ribbonX = center - ribbonW / 2;
  const ribbonY = center + globeRadius * 0.85;

  // Stars
  const stars = Array.from({ length: 18 }, () => {
    const x = Math.random() * s;
    const y = Math.random() * s;
    const r = Math.random() * 2 + 1;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffffff" opacity="${(Math.random()*0.5+0.3).toFixed(2)}"/>`;
  }).join('');

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
    ${bg}
    <rect x="0" y="0" width="${s}" height="${s}" fill="url(#bgGrad)"/>
    <g>${stars}</g>

    <!-- Globe -->
    <g filter="url(#softShadow)">
      <circle cx="${center}" cy="${center}" r="${globeRadius}" fill="url(#orbGlow)" stroke="#9FE0FF" stroke-width="3" />
      ${gridLines.join('\n')}
    </g>

    <!-- Decision buttons -->
    <g filter="url(#softShadow)">
      <rect x="${leftX}" y="${btnY}" rx="${btnRadius}" ry="${btnRadius}" width="${btnSize}" height="${btnSize}" fill="#2FC26B" />
      <rect x="${rightX}" y="${btnY}" rx="${btnRadius}" ry="${btnRadius}" width="${btnSize}" height="${btnSize}" fill="#E64646" />
      ${checkMark}
      ${crossMark}
      <text x="${leftX + btnSize/2}" y="${btnY + btnSize*0.85}" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${Math.floor(s*0.04)}" fill="#ffffff" text-anchor="middle">SHILL</text>
      <text x="${rightX + btnSize/2}" y="${btnY + btnSize*0.85}" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${Math.floor(s*0.038)}" fill="#ffffff" text-anchor="middle">NO SHILL</text>
    </g>

    <!-- Ribbon -->
    <g filter="url(#softShadow)">
      <rect x="${ribbonX}" y="${ribbonY}" width="${ribbonW}" height="${ribbonH}" rx="${s*0.03}" fill="url(#ribbonGrad)" stroke="#F1B44E" stroke-width="6" />
      <text x="${center}" y="${ribbonY + ribbonH*0.65}" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${Math.floor(s*0.06)}" fill="#FFD77A" text-anchor="middle">SHILL OR NO SHILL</text>
    </g>
  </svg>
  `;
}

async function main() {
  const root = path.join(__dirname, '..');
  const outDir = path.join(root, 'assets', 'images', 'branding');
  await ensureDir(outDir);
  const outPng = path.join(outDir, 'logo-square.png');
  const svg = buildSvg({ size: 1024 });
  const buffer = Buffer.from(svg);
  await sharp(buffer, { density: 300 }).png().toFile(outPng);
  console.log('Generated branding PNG:', outPng);
}

main().catch((e) => {
  console.error('Branding generation failed:', e);
  process.exitCode = 1;
});