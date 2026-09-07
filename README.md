# Sperry Route & Coordinate Studio

Browser-based route and waypoint editor/converter focused on Sperry Marine VisionMaster FT `.route` workflows, while also supporting common geospatial and spreadsheet formats.

**Current baseline:** `v0.9.0`

> This is a technical planning/conversion tool, not a substitute for ECDIS route checking, bridge procedures, chart review, vessel-specific manoeuvring limits, or navigational judgment. Verify every exported route and safety parameter on the target ECDIS before operational use.

## Highlights

- Turkish / English interface (`TR | EN`).
- Canonical WGS 84 waypoint model with raw-input preservation and explicit validation.
- Coordinate parser for DD, DDM and DMS, including Turkish/English hemisphere letters and decimal point/comma forms.
- Selected coordinate display format propagates across the waypoint table, Bulk Text interpretation preview, map popup/editor and live drag readout.
- Dynamic waypoint table: insert, delete, move up/down, bulk append, clear table, and automatic duplicate-name disambiguation.
- OpenStreetMap map editor with draggable waypoints, live coordinate feedback while dragging, map-based waypoint insertion/deletion/editing, route-direction arrows and optional leg distance/course labels.
- Rhumb Line and Great Circle calculations, route-level default plus per-leg override.
- Planned speed, leg time, cumulative distance/time and ETA calculations with fixed UTC offset selection.
- Import/export support for Sperry `.route`, CSV/TXT, GPX, KML/KMZ, GeoJSON and XLS/XLSX where the browser dependency is available.
- Metadata-aware canonical `Waypoint + Leg` model to reduce semantic loss during cross-format conversion.
- Qibla / Kaaba inspection view with WGS 84 great-circle bearing and WMM2025 magnetic variation; compass deviation is explicitly excluded.

## Run

Download `Sperry_Route_Coordinate_Studio.html` and open it in a modern Chromium/Firefox browser.

The application is delivered as one HTML file, but the current build loads these runtime dependencies from public CDNs:

- Leaflet 1.9.4
- SheetJS/xlsx 0.18.5
- JSZip 3.10.1

OpenStreetMap tiles also require network access. A fully vendored/offline build is a future work item.

## Coordinate model

The internal canonical model is WGS 84 geographic latitude/longitude. The application currently does **not** expose a fake datum selector. Other source CRS/datum families such as UTM, ED50 or TUREF/ITRF should only be added with a real, verified transformation engine.

Accepted coordinate examples include:

```text
41.123456
41,123456
41 07.40736 N
41° 07,40736' K
41 07 24.4416
41°07'24,4416"N
```

The parser rejects contradictory sign/hemisphere combinations and invalid latitude/longitude/minute/second ranges rather than silently correcting them.

## Waypoints and legs

The application deliberately separates waypoint data from leg data:

```text
WP01  ---- LEG 01 ---->  WP02  ---- LEG 02 ---->  WP03
```

A leg owns its geometry, distance, course, planned speed and travel time. A waypoint owns its position, name, note and arrival/cumulative values. Import/export adapters map this canonical model to each file format's own semantics.

## Sperry `.route` notes

Observed VisionMaster FT `.route` files use a DataSet-style XML structure containing `Summaries`, `ControlPoints` and related fields. The application preserves/imports as much Sperry metadata as supported by the current model.

Important current limitations:

- Verified example files use `RhumbLine` for `DepartingControlLineType`.
- A real VisionMaster Great Circle token has not yet been verified. The application therefore does not invent one.
- If a route contains Great Circle legs, Sperry export requires explicit downgrade confirmation to Rhumb Line; the editor's original route remains unchanged.
- New-route Sperry turn radius currently defaults to **40 m as a provisional user-selected working value**. It must be verified for the vessel and operation.

## File conversion

The intended pipeline is:

```text
Source file / manual input
        ↓
Parse + validate
        ↓
Canonical WGS 84 Waypoint + Leg model
        ↓
User review/edit
        ↓
Target-format adapter
```

No target format can represent every property of every source format. Future releases should expose a formal `preserved / transformed / lost` conversion report before export.

## Excel output

XLS/XLSX output includes route data and summary information. Planned-speed cells are intended to remain editable, with spreadsheet formulas updating leg time, cumulative time and ETA. Route geometry determines the leg distance/course written by the HTML geodesy engine; changing only the text in an Excel `Geometry` cell does not currently recompute geodesy in Excel.

The default CSV/list separator is `;`, suitable for common Turkish Excel workflows, and can be changed by the user.

## Qibla / Kaaba view

The independent Qibla view:

- starts from Istanbul,
- allows arbitrary start-point selection or dragging,
- draws a great-circle line to the Kaaba,
- reports true initial bearing and distance,
- computes magnetic variation using WMM2025,
- reports magnetic bearing as `True − declination`.

Compass deviation is vessel/compass-specific and is **not** included.

## Examples

The `examples/` directory contains synthetic, non-operational files for parser/conversion testing. They are not navigational recommendations.

## QA

See `docs/QA_v0.9.0.md` for the focused release checks and the remaining browser-smoke-test caveat.

## Third-party attribution

See `NOTICE.md`. The WMM2025 magnetic-variation implementation includes/adapts MIT-licensed work by Darren Yeates. Leaflet, SheetJS and JSZip are runtime dependencies loaded from their public CDNs and remain subject to their respective licenses.

## Project license

No project-wide `LICENSE` file is included in this initial public baseline. Unless a license is added by the repository owner, normal copyright restrictions apply to the project code. Third-party components remain under their own licenses.
