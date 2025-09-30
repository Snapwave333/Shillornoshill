# AI Asset Generation Prompts and Specs

This document defines the missing and under‑utilized visual assets for Shill Or No Shill, along with high‑quality prompts you can use with any AI image generator (e.g., Midjourney, Stable Diffusion, Ideogram, DALL·E). It also specifies file names, sizes, and styling to keep the project consistent.

## Global Art Direction
- Style: modern neon/cyberpunk + glassmorphism, soft glow, crisp typography.
- Color palette: electric blue (#4FD1FF), magenta (#FF4FD1), violet (#8A5CF6), midnight navy (#0C1020), soft white accents.
- Lighting: subtle rim lighting, depth via gradients and blur.
- Backgrounds: noise/grain very subtle, avoid distracting patterns.

## Deliverable Checklist
Place outputs under these paths:

1) Backgrounds (1920×1080 PNG, landscape)
- assets/images/backgrounds/game-bg.png
- assets/images/backgrounds/settings-bg.png

Prompt (generic background):
"Futuristic neon glassmorphism UI background, cyberpunk color palette (electric blue, magenta, violet), soft glow, bokeh highlights, high contrast center vignette, minimal noise, clean gradients, 1920×1080, cinematic lighting, ultra‑sharp, no text, no logo"

2) Banker Portrait (1024×1024 PNG, transparent background preferred)
- assets/images/avatars/banker.png

Prompt:
"Stylized banker portrait, confident, mysterious, suit with subtle neon accents, soft rim lighting, cyberpunk aesthetic, clean background or transparent, 1024×1024, realistic stylization with painterly finish, no text"

3) Briefcase Set (26 images, 512×512 PNG, transparent)
- assets/images/cases/case-01.png … case-26.png

Prompt:
"Futuristic briefcase icon with neon edge glow and glass surface, large centered number [N], bold sans‑serif, high contrast, 512×512, transparent background, cyberpunk palette, consistent styling across all 26 variations"

4) UI Icons (SVG or 1024×1024 PNG)
- assets/images/icons/start.svg — "Play" triangle with glow
- assets/images/icons/settings.svg — gear icon, 12 teeth, soft glow
- assets/images/icons/restart.svg — circular arrow
- assets/images/icons/banker.svg — silhouette bust icon
- assets/images/icons/offer.svg — hand with card/briefcase or dollar tag

Prompt (for PNG variants):
"Minimal neon UI icon [START/SETTINGS/RESTART/BANKER/OFFER], simple silhouette, glassmorphism with glow, 1024×1024, centered, transparent background, symmetric composition, sharp edges"

5) Logo Variants
- assets/images/branding/logo-horizontal.png (2000×800)
- assets/images/branding/logo-square.png (1024×1024)
- assets/images/branding/favicon-512.png (512×512)

Prompt:
"Logo text 'Shill Or No Shill' in sleek neon typographic style, glassy bevel, cyberpunk glow, high legibility, horizontal layout for banner, square mark for app icon, consistent palette, white/transparent backgrounds"

## Replacement Guidance
- You can replace any of the SVG placeholders under assets/images/** with your AI‑generated PNG/SVG outputs; keep the same filenames to avoid code changes.
- Keep transparent backgrounds on icons and briefcases.
- For performance, consider compressing PNGs (e.g., TinyPNG) and optimizing SVGs (SVGO).

## Integration Notes
- Backgrounds can be referenced via CSS: body { background: url('assets/images/backgrounds/game-bg.png') center/cover no-repeat; }
- Briefcases will be used for case rendering in future UI updates; keep a consistent style.
- Banker portrait can be used in offer panels and modals.
- Icons can be applied to action buttons (Start, Settings, Restart) or section headers.

## QA Checklist
- Consistent palette and glow across all assets.
- Cropping tight to subject; no excess margins.
- Transparent PNGs where applicable.
- High contrast and legibility at small sizes.