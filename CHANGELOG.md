# Changelog

## v1.0.0 — 2026-09-09

First stable public release.

### Release-blocking fixes

- Fixed DDM/DMS rounding carry so switching coordinate display after `.route` import cannot create invalid `60.00″` / `60.00000′` display values and disable map opening.
- Removed stale visible `v0.9.0` release-candidate text from the HTML title/workspace header.
- GPX creator metadata is normalized to the v1.0.0 application version in the release build.
- Added a release consistency check that rejects stale `v0.9.0` text in the final v1.0.0 HTML.

### Distribution / documentation

- Canonical release filename is now `Sperry_Route_Coordinate_Studio_v1.0.0.html`.
- Unversioned `Sperry_Route_Coordinate_Studio.html` is retained only as a latest-stable alias.
- Android-safe ZIP now contains the versioned HTML filename.
- Reworked README to follow the established ECDIS project publication style: full English section followed by a full Turkish section, detailed operation/limitations, and references.
- Expanded `docs/QA_v1.0.0.md` with browser regression and version-consistency checks.

### Functional baseline retained

- Sperry `.route` plus GPX, KML/KMZ, CSV/TXT, GeoJSON and spreadsheet workflows.
- Canonical `Waypoint + outbound Leg` model.
- DD/DDM/DMS display propagation, map editing, leg direction arrows/labels, Rhumb/Great Circle handling, planned speed/time/ETA.
- Qibla/Kaaba view with Istanbul, arbitrary map start, or active-route WP start; WMM2025 variation with compass deviation excluded.

## v0.9.0 — 2026-09-07

Release-candidate baseline before the v1.0.0 regression correction and documentation pass.
