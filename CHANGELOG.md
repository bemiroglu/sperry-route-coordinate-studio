# Changelog

## v0.9.0 — 2026-09-07

Initial public baseline.

### Route/coordinate editor
- DD / DDM / DMS parser and display modes.
- Display-mode propagation to waypoint-table coordinate cells, Bulk Text interpretation preview, map popup/editor and live map-drag coordinate feedback.
- Dynamic waypoint insertion, deletion and ordering.
- Duplicate waypoint-name disambiguation.
- Bulk-text and file import into one canonical WGS 84 waypoint model.
- Clear-table workflow and append-vs-new-route workflow.

### Leg model and geodesy
- Waypoint and outbound-leg semantics separated in the internal model.
- Rhumb Line and Great Circle per-route/per-leg support.
- Leg distance, course, planned speed, travel time, cumulative distance/time and ETA.
- Leg midpoint distance/course labels with all/smart/off modes.
- Subtle leg-direction arrows.

### Map editing
- OpenStreetMap display.
- Empty-map route creation.
- Drag-and-drop waypoint editing with live coordinate readout.
- Precise coordinate editing in waypoint popup.
- Map-based waypoint add/delete/edit.

### File conversion
- Sperry `.route` import/export with explicit Great Circle safety limitation.
- CSV/TXT, GPX, KML/KMZ, GeoJSON and XLS/XLSX workflows.
- Broader KMZ parsing including multiple KML entries, LineString/MultiGeometry and common `gx:Track` handling.
- Legacy inbound-leg metadata compatibility from earlier development files.

### Spreadsheet workflow
- User-selectable CSV/list separator, default `;`.
- Planned-speed spreadsheet formulas for leg/cumulative time and ETA.
- Fixed-offset timezone metadata and local/UTC ETA handling.

### Qibla / Kaaba
- Independent great-circle direction window.
- Istanbul default start, arbitrary start selection/dragging.
- WMM2025 magnetic variation and magnetic bearing (compass deviation excluded).

### Safety / current limitations
- WGS 84 remains the only canonical coordinate datum.
- Sperry Great Circle XML token is not yet verified; no invented token is emitted.
- New-route Sperry turn-radius default is provisional 40 m and must be vessel/operation verified.
- Current build uses CDN-hosted Leaflet, SheetJS and JSZip plus online OSM tiles.
