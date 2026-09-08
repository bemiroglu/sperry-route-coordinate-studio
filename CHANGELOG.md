# Changelog

## v1.0.0 — Initial stable public release

- Fixed a coordinate-display regression where switching an imported route to DMS could produce rounded `60.00″`/`60.00000′` values, leave rows invalid and disable map display. DDM/DMS formatters now carry rounding into the next minute/degree safely.
- Added regression coverage for repeated DD ↔ DDM ↔ DMS switching after real Sperry `.route` import.
- Added Qibla / Kaaba start-point selector populated from the current waypoint list while keeping Istanbul as the default and retaining arbitrary map/drag selection.
- Qibla coordinate readout now follows the application's selected DD/DDM/DMS display format.
- Corrected several malformed CSS selectors discovered during release audit (`.wptable`, `.state`, `.mini-btn`, `.brand`).
- Retained live coordinate feedback while dragging waypoints and leg direction arrows / distance-course labels.
- Retained canonical outbound-leg semantics introduced before release.
- Added bilingual Turkish-first README, explicit Android download guidance and ZIP distribution path.
- Added SAR search-pattern route generation to the deferred roadmap.
- Promoted application version to `v1.0.0`.

## v0.9.0 — Release candidate baseline

- Propagated selected DD/DDM/DMS formatting to waypoint table, Bulk Text interpretation, map editor and live drag feedback.
- Added small leg direction arrows.
- Removed informal “bonus” wording from the Qibla / Kaaba view.
- Added public repository source/build structure.

## Earlier development history

The pre-1.0 iterations established:

- Sperry `.route` parsing/export based on verified sample structure.
- Multi-format GPX/KML/KMZ/CSV/GeoJSON/XLS/XLSX adapters.
- Canonical `Waypoint + Leg` model.
- Rhumb / Great Circle calculations.
- Planned-speed, time-zone and ETA model.
- Map editing, waypoint insertion/reordering, duplicate-name handling and route labels.
- WMM2025-backed Qibla / Kaaba inspection view.
