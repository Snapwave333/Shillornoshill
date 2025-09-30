# Changelog

## 1.1.0 (Stable)

- Icons
  - Added AI-styled SVG app icon at `assets/images/icons/ai/app-icon.svg`.
  - Updated `scripts/generate-icon.js` to prefer the AI SVG and fall back to the PNG logo.
  - Regenerated multi-size PNGs and `build/icon.ico` for Electron packaging.

- Game Master UI
  - Enhanced `game-master-settings.html` with:
    - SFX toggle and beep hooks for Apply/Save actions (non-blocking `AudioContext`).
    - Tunable background overlay intensity via a CSS variable and slider.
    - Auto-swap header icons to AI variants when available.

- Build & Release
  - Bumped version to `1.1.0`.
  - Confirmed GitHub Actions workflow `release.yml` to build and publish on tag `v*` using `npm run release`.

Notes: If the AI SVG is missing, the icon generation gracefully falls back to the existing PNG logo.

## 1.1.1

- Updater reliability improvements
  - Added `electron-log` integration for autoUpdater diagnostics.
  - Configured `autoInstallOnAppQuit` and disabled prerelease updates.
  - Enhanced event logging for checking, availability, progress, and installation.

- Dependency updates
  - Added `electron-log` to dependencies for production logging.

## 1.1.2

- Window preferences
  - Added user-configurable Fullscreen and Resizable options in the View menu.
  - Preferences persist to userData and are applied on launch.## v1.4.0 — Stable
- See RELEASE_NOTES.md for detailed changes.

