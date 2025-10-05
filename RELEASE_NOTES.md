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

