# Release Notes - v2.0.4

## What's New

*   **Public Release Configuration:** Updated `package.json` to target the `Shillornoshill_public` repository for releases.
*   **Explicit NSIS Target:** Modified the `release` script to explicitly include `nsis` for Windows builds, ensuring the `.exe` is properly generated and packaged.
*   **In-App Update Mechanism:** Confirmed the functionality of `electron-updater` for seamless in-app updates.

## Known Issues

*   Image generation via Gemini API is currently experiencing quota issues, preventing the automatic creation of the banner image.

## Installation

To install this update, please visit the [Releases page](https://github.com/Snapwave333/Shillornoshill_public/releases) and download the latest installer.

## v2.0.4 — Stable
Release Date: 2025-10-05

### New Features
- Randomize Case Positions: Button in Settings to shuffle display order without changing case values.
- Template Save/Load System: Save current configuration to a JSON template and load it later.

### Improvements
- Liquid Glass theme integration for Settings and modals.
- Better UI feedback for save, randomize, and template operations.

### Bug Fixes
- Ensured case grid respects custom case order when provided.
- Fixed missing UI refresh after template load.

### Template Schema
- `schemaVersion`: string (e.g., "1.0")
- `name`: template display name
- `savedAt`: ISO timestamp
- `settings`: serialized game settings including `customValuesOverride`, `caseOrder`, and `numberOfCases`

### Deployment
- Tag repository with `v2.0.4` and publish to GitHub Releases.
- Changelog and README updated.

## v2.0.5 — Stable
Release Date: 2025-10-05

### New Features
- Randomize Case Positions: Button in Settings to shuffle display order without changing case values.
- Template Save/Load System: Save current configuration to a JSON template and load it later.

### Improvements
- Liquid Glass theme integration for Settings and modals.
- Better UI feedback for save, randomize, and template operations.

### Bug Fixes
- Ensured case grid respects custom case order when provided.
- Fixed missing UI refresh after template load.

### Template Schema
- `schemaVersion`: string (e.g., "1.0")
- `name`: template display name
- `savedAt`: ISO timestamp
- `settings`: serialized game settings including `customValuesOverride`, `caseOrder`, and `numberOfCases`

### Commit Summary
- Fix: prevent case value grid reset on wizard save; bump version to 2.0.5; add static-server.ps1 for local preview
- docs: sprinkle light humor in README after Highlights for reader delight
- docs: embed hero banner and social preview SVGs in README for improved repo visuals
- chore(branding): add dynamic SVG banner, dark/light logos, and social preview; include preview page
- Update README.md with detailed GitHub page content
- Release v2.0.4 - Updated version, release notes, and README
- Create blank.yml
- Initial commit

### Deployment
- Tag repository with `v2.0.5` and publish to GitHub Releases.
- Changelog and README updated.

## v2.5.5 — Stable
Release Date: 2025-10-05

### New Features and Updates
- General updates and improvements across the application.

### Deployment
- Tag repository with `v2.5.5` and publish to GitHub Releases.
- Changelog and README updated.
