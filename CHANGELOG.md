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

## 1.4.1 (Stable)

- Settings UI
  - Moved primary action buttons to the top under the header.
  - Removed charts from Configuration Preview.
  - Removed Case Value Editor Mode toggle; custom values are standard.

- Release
  - Version bump to 1.4.1.
  - Updated release notes.

## 1.4.2 (Stable)

- Updater UX
  - Launch-time update check with user prompt and release notes.
  - Opt-in download; restart prompt after download.
  - Fallback release notes from local file or GitHub.

## 1.4.3 (Stable)

- Settings Layout
  - Configuration Preview moved directly under action buttons.
  - Prize Configuration panel now spans full grid width.
  - Full-viewport page background for consistent theming.

- Release
  - Version bump to 1.4.3.
  - Updated release notes and README.

## v2.0.4 — Stable
- See RELEASE_NOTES.md for detailed changes.

## v2.0.5 — Stable
- Fix: prevent case value grid resetting to 0 after saving via Case Wizard.
- Add local preview server script (static-server.ps1) for consistent testing.
- Auto-updater release notes improvements and tagging flow.

## v3.0.0 — Stable
- See RELEASE_NOTES.md for detailed changes.

