# Roadmap / Deferred Improvements

This file records development items intentionally deferred after the `v1.0.0` initial stable release.

1. **SAR search-pattern generator** — side module that starts from a user-selected position and generates route legs for standard SAR search patterns. Candidate inputs include pattern family, initial course, leg/track spacing, leg length, number of legs, turn direction and speed. Output should pass through the same canonical `Waypoint + Leg` model and export to Sperry `.route` and other supported formats. Exact pattern definitions must be tied to authoritative SAR guidance before implementation.
2. **Conversion fidelity report** — before export, classify source metadata as preserved, transformed, defaulted or lost.
3. **Sperry round-trip depth** — preserve more `Summaries`, `ControlPoints`, `CriticalPoints`, `AdditionalData`, alarm limits and vendor metadata without lossy rewriting.
4. **Verified Sperry Great Circle support** — enable only after a real VisionMaster `.route` example confirms the exact token and semantics.
5. **Vessel/manoeuvring profiles** — replace the provisional 40 m turn-radius working default with vessel- and operation-specific profiles (LOA/LBP, propulsion type, ROT, tactical diameter, advance/transfer, wheel-over logic).
6. **Advanced map editing** — undo/redo, multi-select, split-leg insertion, context menu, label dragging/pinning and more sophisticated collision avoidance.
7. **Route validation report** — duplicate/zero-length legs, self-intersection, extreme jumps, sharp turns, missing metadata and target-format incompatibilities.
8. **Full-calculation Excel workbook** — optional spreadsheet formulas for geodesic distance/course recalculation when coordinates or geometry are changed in Excel.
9. **Source CRS transformation layer** — WGS 84/UTM, ED50/UTM, TUREF/ITRF and other systems through verified EPSG/PROJ-equivalent definitions while preserving raw source values.
10. **Magnetic route analysis** — if added, use precise terminology such as initial magnetic bearing at departure WP (WMM, compass deviation excluded). Great Circle legs require position-dependent treatment rather than one constant magnetic course.
11. **Large-route performance** — virtualized table rendering, Web Workers for import/geodesy and incremental map drawing for hundreds/thousands of waypoints.
12. **Offline build** — vendor Leaflet, SheetJS and JSZip; optionally add an offline/PWA or local-tile variant.
13. **Automated regression corpus** — synthetic plus legally shareable real-world GPX/KML/KMZ/CSV/XLSX/route samples, browser tests and release checksums.
14. **Standard route exchange** — evaluate IEC 61174 RTZ / IHO S-421 and NMEA 0183 RTE/WPL import/export as separate adapters to the canonical waypoint+leg model.
15. **Waypoint/leg magnetic reporting options** — if operationally useful, support departure/mid-leg/arrival magnetic bearing reporting with date/model metadata rather than a misleading single magnetic-course value.
