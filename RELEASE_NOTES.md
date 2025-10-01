# Shill Or No Shill — Release Notes

## v1.4.1 — Stable
Release Date: October 1, 2025

### UI Changes
- Settings: Moved action buttons (Save, Launch, Export, Randomize, Save Template, Load Template) to the top under the header.
- Settings: Removed charts from Configuration Preview for a cleaner summary.
- Settings: Removed "Case Value Editor Mode" toggle and "Use Custom Case Values" options; all cases are custom by design.

### Notes
- Functionality for Case Value Editor, max prize, and zero-value case steppers remains intact.
- No breaking changes to template schema.

---
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