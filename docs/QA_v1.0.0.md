# Sperry Route & Coordinate Studio v1.0.0 — Release QA

Date: 2026-09-09

## Release-blocking corrections included in v1.0.0

### 1. DDM / DMS display-switch regression

Observed failure during real use: after importing a Sperry `.route`, switching coordinate display from DDM to DMS could make **SHOW ON MAP / HARİTADA GÖSTER** unusable. Switching back did not necessarily recover the route.

Root cause: coordinate display formatting could round a value near a minute/degree boundary to `60.00″` or `60.00000′`. The coordinate parser correctly rejects minute/second values >= 60; therefore a valid coordinate could become invalid only because its display format was changed.

Correction: DDM/DMS formatting now performs explicit carry propagation at 60 seconds / 60 minutes. Display-format conversion is required to remain parseable.

### 2. Release-version consistency

A previous publication step left visible `v0.9.0` text in the workspace header even though the JavaScript version constant had already been changed to `v1.0.0`. GPX creator metadata also retained the old release-candidate version.

Correction:

- HTML title: `v1.0.0`
- visible workspace kicker: `v1.0.0`
- JavaScript `APP_VERSION`: `v1.0.0`
- release build normalizes remaining release-candidate markers to `v1.0.0`
- release consistency check fails if `v0.9.0` occurs anywhere in the final v1.0.0 HTML.

### 3. Canonical release filename

The canonical public artifact is:

`Sperry_Route_Coordinate_Studio_v1.0.0.html`

`Sperry_Route_Coordinate_Studio.html` is retained only as a latest-stable convenience alias. The versioned root file, latest alias and pinned download HTML must be byte-identical.

## Automated parser / formatter checks

Development-side release checks completed before publication:

- JavaScript syntax: **PASS**
- Coordinate round-trip regression: **34/34 PASS**
- DDM/DMS boundary carry handling: **PASS**
- Static release consistency: **PASS**
- Final release version consistency: **PASS**
- Clear-text programmer identity absent from final source: **PASS**

## Browser-path regression

Chromium was exercised through Playwright using the full application DOM and a deterministic Leaflet API stub. This isolates application interaction logic from CDN/network availability while still exercising the browser event path.

The previously supplied real development sample `AHP-5_Nene-Hatun_B-C-G-H.route` was used locally for regression. It is **not** included in the public repository.

Test sequence:

1. Import `.route` — **PASS**, 5 active waypoints.
2. Confirm zero invalid non-empty waypoint rows — **PASS**.
3. Repeated display switches `DMS → DD → DDM → DMS → DDM → DMS` — **PASS**.
4. Open map after every display-format switch — **PASS**.
5. Qibla start selector contains Istanbul, map-selected start and the five active route waypoints — **PASS**.
6. Select route WP as Qibla start — **PASS**.
7. Clear waypoint table and open an empty map — **PASS**.
8. Browser runtime errors during this sequence — **0**.

## Distribution checks

### HTML

The GitHub build workflow generates:

- `Sperry_Route_Coordinate_Studio_v1.0.0.html` — canonical release file
- `Sperry_Route_Coordinate_Studio.html` — latest-stable alias
- `downloads/Sperry_Route_Coordinate_Studio_v1.0.0.html` — pinned download copy

The build verifies byte equality between these files and records SHA-256 values in `SHA256SUMS.txt`.

### Android ZIP

`downloads/Sperry_Route_Coordinate_Studio_v1.0.0.zip` contains the versioned HTML filename:

`Sperry_Route_Coordinate_Studio_v1.0.0.html`

This ZIP is the recommended Android download path when a browser/download manager appends an unwanted `.xml` extension to raw HTML downloads.

## Import/export scope retained from the development line

The canonical route model remains `Waypoint + outbound Leg`. Current adapters cover Sperry `.route`, CSV/TXT, GPX, KML/KMZ, GeoJSON and XLS/XLSX where runtime dependencies are available.

Earlier development regression covered representative `.route → CSV/GPX/KML/GeoJSON → .route` round trips. No intentional adapter-semantic change was introduced by the final version-label/documentation correction pass.

KMZ and XLS/XLSX still depend on JSZip / SheetJS loaded at runtime. Third-party KMZ files can contain vendor-specific structures, multiple KML documents or NetworkLinks that are not guaranteed to map losslessly.

## Navigation / calculation caveats

- Coordinate reference: WGS 84 geographic latitude/longitude.
- Current Rhumb/Great Circle distance/bearing calculations use a spherical Earth model (`R = 6,371,008.8 m`), not an ellipsoidal navigation-grade geodesic solver.
- Sperry Great Circle `.route` token remains unverified from a real VisionMaster Great Circle route file; the application does not invent it.
- New-route turn-radius default `40 m` remains provisional and vessel/operation dependent.
- WMM2025 magnetic values exclude vessel/compass deviation.
- Operational route checking on the target ECDIS remains mandatory.

## Release decision

`v1.0.0` is accepted as the first stable public baseline with the limitations above stated openly in README/NOTICE. Future development is tracked separately in `ROADMAP.md` so that the v1.0.0 baseline can remain reproducible and reviewable.
