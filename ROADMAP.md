# Roadmap / Deferred Improvements

This file records development ideas intentionally deferred after the v0.9.0 public baseline.

1. **Conversion fidelity report** — before export, classify source metadata as preserved, transformed, defaulted or lost.
2. **Sperry round-trip depth** — preserve more `Summaries`, `ControlPoints`, `CriticalPoints`, `AdditionalData`, alarm limits and vendor metadata without lossy rewriting.
3. **Verified Sperry Great Circle support** — enable only after a real VisionMaster `.route` example confirms the exact token/semantics.
4. **Vessel/manoeuvring profiles** — replace the provisional 40 m turn-radius default with vessel- and operation-specific profiles (LOA/LBP, propulsion type, ROT, tactical diameter, advance/transfer, wheel-over logic).
5. **Advanced map editing** — undo/redo, multi-select, split-leg insertion, context menu, label dragging/pinning and more sophisticated collision avoidance.
6. **Route validation report** — duplicate/zero-length legs, self-intersection, extreme jumps, sharp turns, missing metadata and target-format incompatibilities.
7. **Full-calculation Excel workbook** — optional spreadsheet formulas for geodesic distance/course recalculation when coordinates or geometry are changed in Excel.
8. **Source CRS transformation layer** — WGS 84/UTM, ED50/UTM, TUREF/ITRF and other systems through verified EPSG/PROJ-equivalent definitions while preserving raw source values.
9. **Magnetic route analysis** — if added, use precise terminology such as initial magnetic bearing at departure WP (WMM, deviation excluded); Great Circle legs require position-dependent treatment rather than one constant magnetic course.
10. **Large-route performance** — virtualized table rendering, Web Workers for import/geodesy and incremental map drawing for hundreds/thousands of waypoints.
11. **Offline build** — vendor Leaflet, SheetJS and JSZip; optionally add an offline/PWA or local-tile variant.
12. **Automated regression corpus** — synthetic plus legally shareable real-world GPX/KML/KMZ/CSV/XLSX/route samples, browser tests and release checksums.
13. **Standard route exchange** — evaluate IEC 61174 RTZ / IHO S-421 and NMEA 0183 RTE/WPL import/export as separate adapters to the canonical waypoint+leg model.
