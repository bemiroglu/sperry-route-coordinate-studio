# Sperry Route & Coordinate Studio v0.9.0 — QA / Public Baseline Review

## Implemented in v0.9.0

- Coordinate display selector (`DD`, `DDM`, `DMS`) now propagates to:
  - waypoint map popup/editor,
  - Bulk Text interpretation preview,
  - waypoint table Latitude/Longitude input cells after import, bulk acceptance, map insertion, map drag/drop, popup save, field blur, and display-format change.
- Valid coordinate input values are normalized to the selected display format without changing the underlying geographic position.
- Live coordinate feedback was added while dragging a waypoint on the map. A small transient tooltip follows the marker and uses the active DD/DDM/DMS display format.
- A subtle direction arrow was added to each route leg. It is placed around 42% of the leg so that it does not compete with the distance/course label at the leg midpoint.
  - Rhumb Line: constant course direction.
  - Great Circle: local tangent direction around the arrow position.
- Visible use of the word `BONUS` was removed from the Qibla/Kaaba button and panel text.
- Existing Qibla/Kaaba WMM2025 magnetic-variation view remains independent of the route editor.

## Magnetic course in the main waypoint/Excel model

Not added in this public baseline. This is intentional:

- A Rhumb Line can reasonably be given a single true course, but magnetic bearing still depends on magnetic declination at place/date.
- A Great Circle does not have one constant course; its true course changes continuously along the leg, and magnetic course would change both because of path geometry and spatial magnetic variation.
- A vessel's compass course would additionally require vessel-specific compass deviation, which the application does not know.

If added later, the safe field name should be something like `Initial Magnetic Bearing at Departure WP (WMM2025; deviation excluded)` rather than a generic `Magnetic Compass Course`.

## Static and runtime checks

- JavaScript syntax (`node --check`): PASS
- HTML IDs: 92 total / 92 unique
- Old `v0.8 RC` version text: none
- Visible/internal `bonus` wording: none
- Clear programmer identity string in source: none; existing obfuscation preserved
- Coordinate formatting/parser runtime tests: 4/4 PASS
- Istanbul → Kaaba initial great-circle bearing sanity range: PASS
- WMM2025 reference check used by existing self-test: PASS
- Total focused runtime checks: 6/6 PASS

## Browser limitation of the build environment

A full end-to-end Leaflet/CDN browser smoke test could not be completed in the container because headless Chromium did not finish loading the external CDN resources. A short manual Chrome/Edge smoke test is therefore still recommended after cloning/downloading the public baseline.

## Recommended smoke test

1. Enter/import 3–5 WPs.
2. Switch DD → DDM → DMS and confirm:
   - Bulk Text preview,
   - table Latitude/Longitude cells,
   - map popup/editor
   all change consistently.
3. Drag a map WP and confirm the live coordinate tooltip updates during the drag.
4. Release the marker and confirm the table receives the selected-format coordinate value.
5. Confirm leg direction arrows point WP1 → WP2 → WP3 and do not obscure the midpoint distance/course labels.
6. Open/close Qibla/Kaaba view and confirm the main route state is unchanged.
7. Export one `.route`, `.csv`, `.gpx`, `.kml/.kmz`, and `.xlsx`, then re-import representative files.
