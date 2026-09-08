# Sperry Route & Coordinate Studio v1.0.0 — Release QA

Date: 2026-09-08

## Release-blocking regression fixed

Observed failure: after importing a Sperry `.route`, changing coordinate display from DDM to DMS could make `HARİTADA GÖSTER / SHOW ON MAP` unusable and changing the display format back did not necessarily recover the rows.

Root cause: DDM/DMS formatting used floating-point rounding without explicit carry handling. Coordinates close enough to a minute/degree boundary could render as `60.00″` or `60.00000′`. The parser correctly rejects values >= 60, so the formatted display text could become an invalid new input value.

Fix: DDM and DMS are now formed from integer-scaled minute/second units; rounding is completed first and any carry is propagated into minute/degree fields before text is produced.

## Automated browser regression

Chromium engine was exercised through Playwright using the full application DOM and a deterministic Leaflet API stub (network navigation is administratively blocked in this execution environment).

Tested with the real previously supplied `AHP-5_Nene-Hatun_B-C-G-H.route` sample:

- `.route` import: **PASS**, 5 active WPs.
- Initial map eligibility after import: **PASS**.
- DDM → DMS switch: **PASS**, 0 invalid rows, map button remains enabled.
- DMS map opening: **PASS**.
- Repeated `DD → DDM → DMS → DDM → DMS`: **PASS**, no invalid rows and map remains available.
- Empty waypoint table → map view: **PASS**.
- Qibla start selector contains Istanbul + current route WPs: **PASS**.
- Selecting a route WP as Qibla start: **PASS**.
- Turkish/English Qibla selector label regeneration: **PASS**.
- Page runtime errors during this regression sequence: **0**.

## Coordinate parser / formatter tests

- Existing parser self-test: **8/8 PASS**.
- New DDM/DMS rounding-boundary self-test: **PASS**.
- Coordinate-display propagation to waypoint table: **PASS**.
- Bulk Text interpretation uses selected display format: code-path verified and covered by shared formatter.

## Cross-format round-trip regression

Starting from the same Sperry route, browser-driven exports were captured and re-imported for:

- `.route → CSV → .route`: **PASS**.
- `.route → GPX → .route`: **PASS**.
- `.route → KML → .route`: **PASS**.
- `.route → GeoJSON → .route`: **PASS**.

Each re-import produced 5 valid WPs and kept Sperry export enabled. These checks exercise the application's own adapters; they do not claim that every third-party vendor extension can be preserved.

## KMZ / XLS / XLSX scope

KMZ and spreadsheet code paths remain dependent on runtime JSZip / SheetJS libraries loaded from CDN. Previous development QA covered the application's mapping logic and representative KMZ structures, but this execution environment does not permit a live CDN browser navigation test. Third-party KMZ files can still contain vendor-specific structures or NetworkLinks requiring future adapter work.

## Static release audit

- JavaScript syntax (`node --check`): **PASS**.
- HTML IDs: **93/93 unique**.
- Static `$('<id>')` references resolve to existing IDs: **PASS**.
- Suspect malformed custom CSS selectors after audit: **0**.
- Source-visible programmer identity remains obfuscated: **PASS**.
- Public repository contains no real operational AHP route samples or Sperry manual: intended policy.

## Navigation / calculation caveats retained

- Coordinate datum: WGS 84; current Rhumb/Great Circle distance and bearing calculations use the application's spherical Earth model, not an ellipsoidal navigation-grade geodesic solver.
- Sperry Great Circle XML token remains unverified. The application does not invent it.
- New-route Sperry turn radius default `40 m` remains provisional and vessel/operation dependent.
- WMM2025 magnetic value excludes vessel/compass deviation.

## Release decision

`v1.0.0` is suitable as the first public baseline provided the above limitations are stated in README/NOTICE and operational routes are independently verified on the target ECDIS.
