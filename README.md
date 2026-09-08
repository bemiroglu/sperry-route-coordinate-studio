# Sperry Route & Coordinate Studio

A single-file HTML5 waypoint and route editor/converter focused on Sperry Marine VisionMaster FT `.route` workflows while also supporting common route, geospatial and spreadsheet formats.

The application runs locally in the browser. It can import an existing route, create or edit waypoints manually or on an OpenStreetMap basemap, calculate Rhumb Line and Great Circle legs, manage planned speed/time/ETA, and export the resulting route to supported interchange formats. The internal model deliberately separates **waypoints** from the **legs between them** so that source formats with different leg semantics can be mapped more safely.

**Stable public release: `v1.0.0`**

> This is a planning, inspection and format-conversion tool. It is not an ECDIS, route-monitoring system or substitute for bridge procedures, chart review, company requirements, vessel-specific manoeuvring limits or navigational judgement. Every operational route and safety parameter must be independently checked on the target ECDIS before use.

---

## English

### Download and run

No installation or web server is required. Download the **versioned release file** and open it with a current browser.

- **Versioned HTML — recommended desktop download:** [`Sperry_Route_Coordinate_Studio_v1.0.0.html`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio_v1.0.0.html)
- **Android-safe ZIP:** [`Sperry_Route_Coordinate_Studio_v1.0.0.zip`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/downloads/Sperry_Route_Coordinate_Studio_v1.0.0.zip)
- **Latest-stable alias:** [`Sperry_Route_Coordinate_Studio.html`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio.html)

The versioned file is the canonical release artifact. The unversioned file is kept only as a convenience alias to the latest stable build.

#### Android filename note

Some Android browser/download-manager combinations may interpret GitHub Raw content in a way that appends `.xml`, producing a filename such as:

`Sperry_Route_Coordinate_Studio_v1.0.0.html.xml`

The recommended Android path is therefore the ZIP above. Extract the archive and open the enclosed `Sperry_Route_Coordinate_Studio_v1.0.0.html` file. If a direct HTML download has already been renamed to `.html.xml`, remove only the final `.xml` extension.

### Main capabilities

- Full **English / Turkish** interface switch.
- DD, DDM and DMS coordinate parsing and display.
- Decimal point or comma support and Turkish/English hemisphere letters where applicable.
- One coordinate-display selection propagated to the waypoint table, Bulk Text preview, map waypoint editor and live drag readout.
- WGS 84 geographic latitude/longitude as the canonical working coordinate model.
- Waypoint insert, delete, reorder, insert-between, bulk append and duplicate-name disambiguation.
- OpenStreetMap route display with draggable waypoints and live coordinates while dragging.
- Precise map-popup editing of waypoint name, latitude, longitude, outbound-leg geometry, planned speed and notes.
- Route-direction arrows and optional course/distance labels placed on leg geometry rather than on waypoint markers.
- Rhumb Line and Great Circle calculations, with route default plus per-leg override.
- Planned speed, leg time, cumulative distance/time and ETA using an explicit fixed UTC offset.
- Route import/export adapters for Sperry `.route`, GPX, KML/KMZ, CSV/TXT, GeoJSON and XLS/XLSX where the required browser library is available.
- Independent Qibla / Kaaba inspection view with Istanbul default, arbitrary map-selected start, or start selected from the active waypoint list.
- WMM2025 magnetic variation in the Qibla view; vessel/compass deviation is explicitly excluded.

### Quick start

1. Open `Sperry_Route_Coordinate_Studio_v1.0.0.html` in a current Chrome, Edge or Firefox browser.
2. Either import a supported route file, use **Bulk Text**, enter waypoints in the table, or open the map and build a route from an empty map.
3. Select the preferred coordinate display: **DD**, **DDM** or **DMS**.
4. Set route-level defaults such as planned speed, Rhumb/Great Circle geometry, fixed UTC offset and departure local time.
5. Review or edit individual outbound legs in the waypoint table.
6. Use **SHOW ON MAP** to inspect and edit the route spatially.
7. Export to the required target format.
8. For Sperry `.route`, independently verify the imported result and all safety/manoeuvring parameters on the target VisionMaster installation before operational use.

### Coordinate input and display

The parser accepts common forms such as:

```text
41.123456
41,123456
41 07.40736 N
41° 07,40736' K
41 07 24.4416
41°07'24,4416"N
```

Hemisphere mapping includes:

- `N` / `K` = North / Kuzey
- `S` / `G` = South / Güney
- `E` / `D` = East / Doğu
- `W` / `B` = West / Batı

The parser does not silently repair a sign/hemisphere conflict. Latitude/longitude limits and minute/second ranges are validated. The display formatter uses explicit carry handling at 60 seconds / 60 minutes so that a valid coordinate cannot become invalid merely by switching between DDM and DMS.

### Waypoint and leg model

The internal route model is conceptually:

```text
WP01  ---- LEG 01 ---->  WP02  ---- LEG 02 ---->  WP03
```

A **waypoint** owns its name, position, note and arrival/cumulative values. A **leg** owns geometry, distance, true course, planned speed and leg time.

This distinction matters because route formats do not all attach leg attributes to waypoints in the same way. Import/export adapters therefore map source semantics to the canonical `Waypoint + Leg` model instead of allowing format-specific ownership rules to leak into the editor.

### Map editing

The map supports both inspection and editing:

- an empty waypoint table may still open the map;
- a waypoint can be created by clicking the map;
- an existing waypoint can be dragged;
- its current coordinate is shown live during drag;
- clicking a waypoint opens a precise coordinate editor;
- saving writes the values back to the main waypoint table and closes the editor;
- waypoints can be deleted or a new waypoint can be inserted after the selected point;
- course/distance labels can be shown for all legs, shown in smart collision-reduction mode, or hidden;
- a small arrow on each leg indicates route direction.

### Rhumb Line and Great Circle

The current application uses a spherical Earth model with mean radius `6,371,008.8 m` for its Rhumb Line / Great Circle calculations. Coordinates are handled as WGS 84 geographic latitude/longitude, but these route calculations should **not** be described as an ellipsoidal WGS 84 geodesic solver.

For each leg the application can calculate:

- distance in nautical miles;
- Rhumb constant true course, or Great Circle initial true course;
- planned leg time from distance / planned speed.

Great Circle map geometry is interpolated for display; interpolated map points are not user waypoints.

### Time and ETA

The application uses an explicit fixed UTC offset:

`Local Time = UTC + Offset`

The default is `UTC+03:00`. Departure local time initially follows the page-open time in the selected offset. ETA values are derived from cumulative planned leg time.

The fixed-offset design is deliberate: daylight-saving or jurisdictional time-zone rules are not guessed automatically.

### Sperry Marine `.route` handling

Observed VisionMaster `.route` files use a DataSet-style XML structure with route summaries and control points. In the route samples used during development:

- latitude/longitude are stored in radians;
- `DepartingTrackSpeed` is associated with the outbound leg;
- `DepartingControlLineType = RhumbLine` is present;
- the file exposes turn radius, off-track limits and speed-range fields.

The exact VisionMaster token for a Great Circle control line has **not** been verified from a real Great Circle `.route` file. The application therefore does not invent one. If a route containing Great Circle legs is exported to Sperry `.route`, the user must explicitly approve a lossy conversion of those legs to `RhumbLine`; the edited route itself remains unchanged.

The new-route turn-radius field currently uses **40 m as a provisional working default** requested for this project. It is not a universal vessel value and must be replaced/checked against vessel and operation-specific manoeuvring data before operational use.

### Import / export formats

Current adapters include:

- Sperry Marine `.route`
- GPX 1.1
- KML
- KMZ
- CSV / TXT
- GeoJSON
- XLS / XLSX

The application aims for the safest practical conversion, not fictional full equivalence. Formats differ in route semantics and metadata richness; third-party KMZ/KML files may also contain vendor extensions, multiple datasets or `NetworkLink` structures that require additional adapter work.

Where this application writes its own GPX/KML/GeoJSON metadata, outbound-leg semantics are recorded so that a later re-import can preserve geometry and planned-speed ownership more reliably.

### Excel and CSV

CSV/list separator defaults to `;` for Turkish Excel workflows and can be changed by the user.

XLS/XLSX output is a route-calculation workbook rather than a coordinate dump. Planned Speed cells can be edited in Excel; formulas are provided for leg time, cumulative time and local/UTC ETA. Leg distance/course are calculated by the HTML application according to the selected Rhumb/Great Circle geometry and exported as values.

Changing only the `Geometry` text in Excel does not recompute geodesy. A future optional full-calculation workbook is recorded in the roadmap.

### Qibla / Kaaba inspection view

This side view is independent from the route editor. Its start point can be:

- Istanbul (default),
- any point clicked/dragged on the map,
- or any waypoint from the currently active route.

It reports Great Circle distance and initial true bearing to the Kaaba. Magnetic variation is calculated with the embedded WMM2025 model and reported as:

`Magnetic bearing = True bearing − magnetic declination`

Compass deviation is **not** included. This view is for directional/geodetic inspection, not navigational decision-making.

### Network and browser dependencies

The single HTML file currently loads these runtime libraries from public CDNs:

- Leaflet 1.9.4
- SheetJS/xlsx 0.18.5
- JSZip 3.10.1

OpenStreetMap tiles also require network access. Core route logic remains local in the browser; the application itself does not upload the selected route file to a project server.

A vendored/offline build is explicitly retained as future work.

### Validation and release quality

`v1.0.0` includes regression checks for the failure mode where switching DDM ↔ DMS after `.route` import could make valid coordinates unparsable and prevent reopening the map. The formatter now propagates rounding carry correctly.

Repository checks include:

- JavaScript syntax validation;
- coordinate parser/formatter round-trip tests including rounding boundaries;
- static HTML ID uniqueness;
- version-consistency checks preventing stale release-candidate text in the final HTML;
- deterministic equality between the versioned canonical file, latest-stable alias and pinned download HTML;
- browser-path regression work documented in `docs/QA_v1.0.0.md`.

See [`docs/QA_v1.0.0.md`](docs/QA_v1.0.0.md) for the release audit and known limitations.

### Limitations

- Not an ECDIS or navigation system.
- No guarantee that all vendor-specific KML/KMZ extensions can be preserved.
- Current geodesy is spherical, not an ellipsoidal navigation-grade solver.
- VisionMaster Great Circle `.route` token remains unverified.
- The 40 m turn-radius default is provisional and vessel/operation dependent.
- Fixed UTC offsets are used; daylight-saving rules are not inferred.
- Magnetic values exclude vessel/compass deviation.
- Full offline operation is not yet provided because mapping/spreadsheet/ZIP libraries and OSM tiles are network dependencies.

### Repository example data

Only synthetic demonstration files should be placed in the public repository. Real operational AHP routes and the Sperry Marine manual are intentionally not distributed with this project.

### Planned development

Deferred work is tracked in [`ROADMAP.md`](ROADMAP.md). Important future directions include conversion-fidelity reporting, deeper Sperry metadata preservation, verified Great Circle support, vessel/manoeuvring profiles, route validation, ellipsoidal/CRS work, offline packaging and a **SAR search-pattern route generator** that can create configurable search patterns from a selected start position and export them through the same canonical route model.

---

## Türkçe

### İndir ve çalıştır

Kurulum veya web sunucusu gerekmez. **Sürüm numarası taşıyan kararlı dosyayı** indirip güncel bir tarayıcıda açın.

- **Sürüm numaralı HTML — masaüstü için önerilen indirme:** [`Sperry_Route_Coordinate_Studio_v1.0.0.html`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio_v1.0.0.html)
- **Android için güvenli ZIP:** [`Sperry_Route_Coordinate_Studio_v1.0.0.zip`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/downloads/Sperry_Route_Coordinate_Studio_v1.0.0.zip)
- **En son kararlı sürüm kısayolu:** [`Sperry_Route_Coordinate_Studio.html`](https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio.html)

Esas yayın dosyası sürüm numaralı dosyadır. Sürümsüz dosya yalnız “en son kararlı sürüm” kısayolu olarak tutulur.

#### Android dosya adı notu

Bazı Android tarayıcı/indirme yöneticisi birleşimleri GitHub Raw içeriğini yorumlarken dosyanın sonuna `.xml` ekleyebilir ve şu tür bir ad oluşturabilir:

`Sperry_Route_Coordinate_Studio_v1.0.0.html.xml`

Bu nedenle Android'de önerilen yol yukarıdaki ZIP dosyasını indirmektir. ZIP'i açıp içindeki `Sperry_Route_Coordinate_Studio_v1.0.0.html` dosyasını kullanın. Doğrudan indirilmiş dosya `.html.xml` olmuşsa yalnız en sondaki `.xml` uzantısını kaldırın.

### Başlıca özellikler

- Tam **Türkçe / İngilizce** arayüz geçişi.
- DD, DDM ve DMS koordinat girişi ve gösterimi.
- Nokta/virgül ondalık ayırıcı desteği ve uygun yerlerde Türkçe/İngilizce yarımküre harfleri.
- Tek koordinat gösterim seçiminin WP tablosuna, Toplu Metin önizlemesine, harita WP editörüne ve sürükleme sırasındaki canlı koordinata uygulanması.
- Kanonik çalışma koordinatı olarak WGS 84 coğrafi enlem/boylam.
- WP ekleme, silme, yukarı/aşağı taşıma, iki WP arasına ekleme, toplu ekleme ve mükerrer WP adlarını benzersizleştirme.
- OpenStreetMap üzerinde sürüklenebilir WP'ler ve sürüklerken canlı koordinat gösterimi.
- Harita popup penceresinden WP adı, enlem, boylam, çıkış leg geometrisi, planlanan hız ve not için hassas düzenleme.
- WP üzerine yığılmayan, leg üzerinde gösterilen rota yön oku ve isteğe bağlı mesafe/true course etiketi.
- Rhumb Line ve Great Circle; rota varsayılanı ile leg bazında geçersiz kılma.
- Planlanan hız, leg süresi, kümülatif mesafe/süre ve açık sabit UTC ofsetiyle ETA.
- Gerekli tarayıcı kütüphanesi mevcutsa Sperry `.route`, GPX, KML/KMZ, CSV/TXT, GeoJSON ve XLS/XLSX içe/dışa aktarma.
- İstanbul varsayılanlı, haritadan serbest başlangıç veya aktif WP listesinden başlangıç seçilebilen bağımsız Kıble / Kâbe görünümü.
- Kıble penceresinde WMM2025 manyetik varyasyon; gemi/pusula deviation değerinin dahil olmadığı açıkça belirtilir.

### Hızlı kullanım

1. `Sperry_Route_Coordinate_Studio_v1.0.0.html` dosyasını güncel Chrome, Edge veya Firefox ile açın.
2. Desteklenen bir rota dosyasını içe aktarın; **Toplu Metin** kullanın; WP tablosuna elle koordinat girin veya boş haritadan rota oluşturmaya başlayın.
3. Koordinat gösterimini **DD**, **DDM** veya **DMS** seçin.
4. Planlanan hız, Rhumb/Great Circle varsayılanı, sabit UTC ofseti ve kalkış yerel saati gibi rota ayarlarını belirleyin.
5. WP tablosunda her WP'den sonraki çıkış legini gözden geçirin/düzenleyin.
6. **HARİTADA GÖSTER** ile rotayı mekânsal olarak denetleyin ve gerekiyorsa düzenleyin.
7. Hedef dosya formatına dışa aktarın.
8. Sperry `.route` çıktısını operasyonel kullanımdan önce hedef VisionMaster üzerinde ayrıca açıp rota ve emniyet/manevra parametrelerini doğrulayın.

### Koordinat girişi ve gösterimi

Parser şu tür girişleri kabul eder:

```text
41.123456
41,123456
41 07.40736 N
41° 07,40736' K
41 07 24.4416
41°07'24,4416"N
```

Yarımküre eşlemesi:

- `N` / `K` = Kuzey
- `S` / `G` = Güney
- `E` / `D` = Doğu
- `W` / `B` = Batı

İşaret ve yarımküre çelişkisi sessizce düzeltilmez. Enlem/boylam sınırları ile dakika/saniye aralıkları doğrulanır. Gösterim formatter'ı 60 saniye / 60 dakika sınırlarında açık carry işlemi uygular; böylece yalnız DDM ↔ DMS gösterim değişikliği geçerli bir koordinatı geçersiz metne dönüştürmez.

### Waypoint ve leg veri modeli

Uygulamanın iç rota modeli:

```text
WP01  ---- LEG 01 ---->  WP02  ---- LEG 02 ---->  WP03
```

**Waypoint**; ad, mevki, not ve varış/kümülatif değerlerini taşır. **Leg**; geometri, mesafe, true course, planlanan hız ve leg süresini taşır.

Bu ayrım önemlidir; çünkü rota formatları leg özelliklerini waypointlere aynı mantıkla bağlamaz. Bu nedenle içe/dışa aktarma adaptörleri formatın kendi sahiplik kuralını editöre taşımak yerine kanonik `Waypoint + Leg` modeline eşler.

### Harita düzenleme

Harita yalnız görüntüleme alanı değildir:

- WP tablosu boşken de harita açılabilir;
- haritaya tıklayarak yeni WP oluşturulabilir;
- WP sürüklenebilir;
- sürükleme boyunca anlık koordinat gösterilir;
- WP'ye tıklayınca hassas koordinat düzenleme penceresi açılır;
- kaydetme sonrası değerler ana tabloya işlenir ve edit penceresi kapanır;
- WP silinebilir veya seçili WP'nin sonrasına yeni WP eklenebilir;
- leg mesafe/rota etiketleri “tümü / akıllı / kapalı” biçiminde yönetilebilir;
- her leg üzerindeki küçük ok rota yönünü gösterir.

### Rhumb Line ve Great Circle

Mevcut uygulama Rhumb Line / Great Circle hesaplarında ortalama Dünya yarıçapı `6.371.008,8 m` olan **küresel** modeli kullanır. Koordinat datum/referansı WGS 84 coğrafi enlem/boylamdır; fakat mevcut rota hesabı **ellipsoidal WGS 84 geodezik çözücü** olarak tanımlanmamalıdır.

Her leg için:

- deniz mili cinsinden mesafe;
- Rhumb sabit true course veya Great Circle başlangıç true course;
- mesafe / planlanan hızdan leg süresi

hesaplanır.

Great Circle eğrisi haritada ara noktalarla çizilir; bu ara noktalar kullanıcı waypointi değildir.

### Zaman ve ETA

Uygulama açık sabit UTC ofseti kullanır:

`Yerel Saat = UTC + Ofset`

Varsayılan `UTC+03:00`'dır. Kalkış yerel saati başlangıçta HTML sayfasının açıldığı anda seçili ofsetteki saate göre doldurulur. ETA, kümülatif planlanan leg sürelerinden türetilir.

Sabit-ofset yaklaşımı bilinçlidir; yaz/kış saati veya ülke saat dilimi kuralları otomatik tahmin edilmez.

### Sperry Marine `.route` işleme

Geliştirme sırasında incelenen VisionMaster `.route` dosyaları DataSet tarzı XML yapısında rota özeti ve control point kayıtları içerir. İncelenen örneklerde:

- enlem/boylam radyan olarak tutulur;
- `DepartingTrackSpeed` çıkış legiyle ilişkilidir;
- `DepartingControlLineType = RhumbLine` görülür;
- turn radius, off-track limitleri ve hız aralığı alanları bulunur.

VisionMaster `.route` içindeki Great Circle control-line tokenı gerçek bir Great Circle rota dosyasından henüz doğrulanmamıştır. Program bunu uydurmaz. Great Circle leg içeren rota Sperry `.route` olarak dışa aktarılmak istenirse kullanıcı, aynı waypointlerin korunup ilgili leglerin `RhumbLine` olarak kayıplı biçimde dışa aktarılmasına açıkça onay vermelidir; editördeki asıl rota değişmez.

Yeni rota için turn-radius alanındaki **40 m**, bu proje için geçici çalışma varsayılanıdır. Evrensel gemi değeri değildir; operasyonel kullanımda gemiye ve manevraya özgü gerçek verilerle değiştirilmesi/doğrulanması gerekir.

### İçe / dışa aktarma formatları

Mevcut adaptörler:

- Sperry Marine `.route`
- GPX 1.1
- KML
- KMZ
- CSV / TXT
- GeoJSON
- XLS / XLSX

Amaç, formatlar arasında gerçekte var olmayan tam eşdeğerlik iddia etmek değil, mümkün olan en güvenli dönüşümü yapmaktır. Formatların metadata ve leg semantiği farklıdır; üçüncü taraf KML/KMZ dosyaları üretici uzantıları, birden fazla dataset veya `NetworkLink` gibi yapılar taşıyabilir.

Uygulamanın kendi GPX/KML/GeoJSON çıktılarında, yeniden içe aktarmada geometri ve planlanan hız sahipliğini daha güvenilir korumak için outbound-leg semantiği metadata olarak yazılır.

### Excel ve CSV

CSV/liste ayıracı Türkçe Excel akışına uygun olarak varsayılan `;` değeridir ve kullanıcı tarafından değiştirilebilir.

XLS/XLSX çıktısı yalnız koordinat dökümü değildir; rota hesap çalışma kitabıdır. Excel'de Planned Speed hücresi değiştirildiğinde leg time, cumulative time ve yerel/UTC ETA formülleri yeniden hesaplanabilir. Leg distance/course, HTML uygulamasında seçilen Rhumb/Great Circle geometrisine göre hesaplanıp değer olarak aktarılır.

Excel'de yalnız `Geometry` metnini değiştirmek jeodezik hesabı yeniden yapmaz. Tam hesap yapan ayrı workbook seçeneği gelecek çalışma listesinde tutulmaktadır.

### Kıble / Kâbe inceleme görünümü

Bu yan görünüm ana rota editöründen bağımsızdır. Başlangıç noktası:

- İstanbul (varsayılan),
- haritada tıklanan/sürüklenen herhangi bir nokta,
- veya aktif rotadaki herhangi bir waypoint

olabilir.

Kâbe'ye Great Circle mesafesi ve başlangıç true bearing hesaplanır. Manyetik varyasyon gömülü WMM2025 modeliyle hesaplanır:

`Magnetic bearing = True bearing − magnetic declination`

Gemi/pusula **deviation** değeri dahil değildir. Bu pencere seyir kararı için değil, yön/jeodezi incelemesi içindir.

### Ağ ve tarayıcı bağımlılıkları

Tek HTML dosyası şu çalışma zamanı kütüphanelerini public CDN üzerinden yükler:

- Leaflet 1.9.4
- SheetJS/xlsx 0.18.5
- JSZip 3.10.1

OpenStreetMap karoları için de internet bağlantısı gerekir. Rota verisinin temel işlenmesi tarayıcı içinde yereldir; uygulamanın kendisi seçilen rota dosyasını proje sunucusuna yüklemez.

Tam vendored/offline sürüm roadmap'te saklanmaktadır.

### Doğrulama ve sürüm kalitesi

`v1.0.0`, `.route` içe aktarımından sonra DDM ↔ DMS geçişinin geçerli koordinatları parse edilemez hale getirip harita açılmasını engelleyebildiği regresyon için özel düzeltme ve test içerir. Formatter artık yuvarlama carry işlemini doğru taşır.

Repository kontrolleri:

- JavaScript syntax doğrulaması;
- rounding sınırları dahil koordinat parser/formatter round-trip testleri;
- HTML ID benzersizlik kontrolü;
- final HTML içinde eski release-candidate sürüm metni kalmasını engelleyen sürüm tutarlılığı kontrolü;
- sürüm numaralı esas dosya, “latest stable” kısayolu ve sabit download HTML'inin byte-byte aynı olduğunun doğrulanması;
- `docs/QA_v1.0.0.md` içinde belgelenen tarayıcı/regresyon testleri.

Ayrıntı için [`docs/QA_v1.0.0.md`](docs/QA_v1.0.0.md) dosyasına bakın.

### Sınırlamalar

- ECDIS veya seyir sistemi değildir.
- Her üçüncü taraf KML/KMZ üretici uzantısının korunacağı garanti edilmez.
- Mevcut jeodezi küreseldir; ellipsoidal navigation-grade çözücü değildir.
- VisionMaster Great Circle `.route` tokenı henüz doğrulanmamıştır.
- 40 m turn-radius varsayılanı geçici ve gemi/operasyon bağımlıdır.
- Sabit UTC ofseti kullanılır; yaz/kış saati otomatik uygulanmaz.
- Manyetik değerlerde gemi/pusula deviation yoktur.
- Harita/spreadsheet/ZIP kütüphaneleri ve OSM karoları ağ bağımlılığı nedeniyle henüz tam offline çalışma sağlanmaz.

### Repository örnek verisi

Public repository'de yalnız sentetik/demo veriler bulunmalıdır. Gerçek operasyonel AHP rotaları ve Sperry Marine kılavuzu bu repository ile dağıtılmaz.

### Gelecek geliştirmeler

Ertelenen işler [`ROADMAP.md`](ROADMAP.md) içinde sürümden bağımsız olarak korunur. Önemli başlıklar arasında conversion-fidelity raporu, daha derin Sperry metadata round-trip, doğrulanmış Great Circle desteği, gemi/manevra profilleri, route validation, ellipsoidal/CRS geliştirmeleri, offline paketleme ve kullanıcı tarafından seçilen başlangıç noktası ile arama parametrelerinden **SAR search-pattern rotaları üretip aynı kanonik model üzerinden `.route`/diğer formatlara aktarma** modülü vardır.

---

## Reference / Kaynakça

Northrop Grumman Sperry Marine B.V. (2014). *VisionMaster FT Ship's Manual, Volume 2: Configuration & Commissioning* (Part No. 65900011V2-12, Rev. A). The manual is used as a technical reference but is **not distributed** with this repository.

National Centers for Environmental Information. (2024/2025). *World Magnetic Model 2025 (WMM2025).* NOAA/NCEI. https://www.ncei.noaa.gov/products/world-magnetic-model

Topografix. (2004). *GPX 1.1 schema.* https://www.topografix.com/GPX/1/1/

Butler, H., Daly, M., Doyle, A., Gillies, S., Hagen, S., & Schaub, T. (2016). *The GeoJSON format (RFC 7946).* Internet Engineering Task Force. https://www.rfc-editor.org/rfc/rfc7946

Open Geospatial Consortium. (2015). *OGC KML 2.3.* https://www.ogc.org/standard/kml/

Map data: © OpenStreetMap contributors.

Third-party software notices and the WMM implementation attribution are listed in [`NOTICE.md`](NOTICE.md).
