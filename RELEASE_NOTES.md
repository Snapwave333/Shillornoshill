# Shill Or No Shill — Release Notes

## v1.4.0 — Stable
Release Date: September 30, 2025

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
- Tag repository with `v1.4.0` and publish to GitHub Releases.
- Changelog and README updated.