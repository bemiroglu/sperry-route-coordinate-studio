# NOTICE

## WMM2025 magnetic variation

The Qibla / Kaaba magnetic-variation feature contains/adapts code and World Magnetic Model 2025 coefficients from:

- Darren Yeates, `dpyeates/magvar`
- https://github.com/dpyeates/magvar

Upstream license: MIT License, Copyright (c) 2025 Darren Yeates.

MIT permission notice (upstream): permission is granted, free of charge, to use, copy, modify, merge, publish, distribute, sublicense and/or sell copies of the software, subject to inclusion of the copyright and permission notice in copies or substantial portions of the software. The software is provided without warranty.

The upstream repository's full license text is available at:
https://github.com/dpyeates/magvar/blob/master/LICENSE

The WMM2025 magnetic model is used for directional/geodetic inspection. Magnetic bearing shown by this application excludes vessel-specific compass deviation.

## Runtime dependencies

The current single-HTML build loads the following libraries from public CDNs at runtime; they are not redistributed as separate files in this repository:

- Leaflet 1.9.4 — https://leafletjs.com/
- SheetJS/xlsx 0.18.5 — https://sheetjs.com/
- JSZip 3.10.1 — https://stuk.github.io/jszip/

OpenStreetMap tiles are displayed with OpenStreetMap attribution in the application.
