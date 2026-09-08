# Sperry Route & Coordinate Studio

**Türkçe** | [English](#english)

Tarayıcı içinde çalışan; Sperry Marine VisionMaster FT `.route` iş akışlarını merkeze alırken GPX, KML/KMZ, CSV, XLS/XLSX ve GeoJSON gibi yaygın rota/coğrafi veri biçimleri arasında mümkün olduğunca güvenli dönüşüm yapmayı amaçlayan waypoint ve rota editörü.

**İlk kararlı genel sürüm:** `v1.0.0`

> Bu araç rota planlama, veri inceleme ve format dönüşümü içindir. ECDIS rota kontrolünün, köprüüstü prosedürlerinin, güncel harita incelemesinin, gemiye özgü manevra limitlerinin veya seyir kararının yerine geçmez. Operasyonel kullanımdan önce her rota ve emniyet parametresi hedef ECDIS üzerinde ayrıca doğrulanmalıdır.

## İndir / çalıştır

### Masaüstü

Tek HTML dosyasını indirin ve güncel Chrome/Edge/Firefox ile açın:

- **Doğrudan HTML:** `https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio.html`
- **GitHub dosya sayfası:** `https://github.com/bemiroglu/sperry-route-coordinate-studio/blob/main/Sperry_Route_Coordinate_Studio.html`

### Android

Bazı Android tarayıcıları / indirme yöneticileri GitHub Raw içeriğinin MIME türünü yeniden yorumlayıp indirilen dosya adına yanlışlıkla `.xml` ekleyebilir (`.html.xml`). Bu davranış HTML uygulamasının kendisinden değil, indirme zincirindeki MIME/dosya-adı yorumundan kaynaklanabilir.

**Önerilen Android indirmesi:**

- `https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/downloads/Sperry_Route_Coordinate_Studio_v1.0.0.zip`

ZIP'i açıp içindeki `Sperry_Route_Coordinate_Studio.html` dosyasını kullanın. Böylece dosya uzantısı korunur.

Doğrudan HTML indirip dosya adı `Sperry_Route_Coordinate_Studio.html.xml` olursa, Android dosya yöneticisinde son `.xml` uzantısını kaldırıp adı tekrar `Sperry_Route_Coordinate_Studio.html` yapabilirsiniz.

## Başlıca özellikler

- Gerçek **TR / EN** arayüzü.
- DD, DDM ve DMS koordinat girişi/gösterimi; Türkçe/İngilizce yarımküre harfleri ve nokta/virgül ondalık desteği.
- Seçilen koordinat gösterim formatının WP tablosu, Toplu Metin önizlemesi, harita WP editörü ve sürükleme sırasındaki canlı koordinat etiketine uygulanması.
- WGS 84 tabanlı kanonik waypoint modeli ve açık doğrulama.
- WP ekleme, silme, yukarı/aşağı taşıma, araya WP ekleme, toplu ekleme ve mükerrer isimleri otomatik benzersizleştirme.
- OpenStreetMap üzerinde WP sürükleme, sürüklerken canlı koordinat, harita üzerinde WP ekleme/silme/düzenleme.
- Leg üzerinde yön oku ile mesafe/true course etiketi; etiketleri `tümü / akıllı / kapalı` modlarında yönetme.
- Rhumb Line ve Great Circle; rota varsayılanı + leg bazında seçim.
- Planlanan hız, leg süresi, kümülatif mesafe/süre ve sabit UTC offset ile ETA.
- Sperry `.route`, CSV/TXT, GPX, KML/KMZ, GeoJSON ve tarayıcı bağımlılığı yüklüyse XLS/XLSX içe/dışa aktarma.
- Kaynak formatların farklı leg-semantiklerini kanonik `Waypoint + Leg` modeline eşleme.
- Bağımsız **Kıble / Kâbe** görünümü: İstanbul varsayılan başlangıç, haritadan serbest başlangıç veya mevcut rota waypointlerinden başlangıç seçimi; WGS 84 great-circle yön/mesafe ve WMM2025 manyetik varyasyon.

## Koordinat modeli

İç kanonik model WGS 84 coğrafi enlem/boylamdır. Uygulama şu aşamada göstermelik bir datum seçimi sunmaz. WGS 84/UTM, ED50/UTM veya TUREF/ITRF gibi başka kaynak CRS'ler ancak doğrulanmış dönüşüm motoru ile eklenmelidir.

Örnek kabul edilen girişler:

```text
41.123456
41,123456
41 07.40736 N
41° 07,40736' K
41 07 24.4416
41°07'24,4416"N
```

Parser; işaret/yarımküre çelişkisini, eksen uyuşmazlığını ve geçersiz derece/dakika/saniye aralıklarını sessizce düzeltmek yerine reddeder.

## Waypoint ve leg modeli

```text
WP01  ---- LEG 01 ---->  WP02  ---- LEG 02 ---->  WP03
```

Waypoint; konum, ad, not ve varış/kümülatif değerleri taşır. Leg; geometri, mesafe, true course, planlanan hız ve seyir süresini taşır. Format adaptörleri kaynak/hedef dosyanın semantiğini bu modele dönüştürür.

## Sperry `.route` notları

- Doğrulanmış örneklerde `DepartingControlLineType = RhumbLine` görülmüştür.
- VisionMaster Great Circle tokenı henüz gerçek bir `.route` örneği ile doğrulanmamıştır; uygulama bunu uydurmaz.
- Great Circle leg içeren rota `.route` olarak dışa aktarılırken kullanıcı açıkça onay verirse aynı WP'ler korunup RhumbLine'a indirgenebilir; editördeki asıl rota değişmez.
- Yeni rota için Sperry turn radius varsayılanı şimdilik **40 m geçici çalışma değeri**dir; gemi ve operasyona göre doğrulanmalıdır.

## Excel / CSV

XLS/XLSX çalışma kitabında Planned Speed hücreleri değiştirildiğinde leg time, cumulative time ve ETA formüllerinin yeniden hesaplanması amaçlanır. Geometriye göre leg distance/course HTML tarafında hesaplanır; Excel'de yalnız `Geometry` metnini değiştirmek jeodeziyi yeniden hesaplamaz.

CSV/list ayıracı varsayılan olarak Türkçe Excel kullanımına uygun `;` değeridir ve kullanıcı tarafından değiştirilebilir.

## Kıble / Kâbe görünümü

Başlangıç noktası:

- varsayılan İstanbul,
- haritada tıklanan/sürüklenen herhangi bir konum,
- veya mevcut rota WP listesinden seçilen bir waypoint

olabilir. Kâbe'ye Great Circle ilk azimutu ve mesafesi hesaplanır. Magnetic değer WMM2025 declination kullanılarak `True − declination` şeklinde verilir. Gemi/pusulaya özgü **deviation dahil değildir**.

## Çalışma zamanı bağımlılıkları

Tek dosyalı uygulama şu bağımlılıkları CDN'den yükler:

- Leaflet 1.9.4
- SheetJS/xlsx 0.18.5
- JSZip 3.10.1

OpenStreetMap karoları da internet gerektirir. Tam offline/vendored sürüm roadmap'tedir.

## Test ve kalite

İlk sürüm regresyon notları `docs/QA_v1.0.0.md` içindedir. Sentetik örnekler `examples/` dizinindedir. Gerçek operasyonel rota dosyaları veya Sperry üretici dokümanları kamuya açık depoya eklenmemiştir.

## Gelecek geliştirmeler

`ROADMAP.md` içinde saklanır. Özellikle ileride değerlendirilecek yan işlevlerden biri; kullanıcı tarafından başlangıç noktası, leg uzunluğu, dönüş yönü ve diğer parametreleri verilen **SAR arama patternlerinden rota üretip `.route`/diğer rota formatlarına aktarma** modülüdür.

## Üçüncü taraf atıfları

Bkz. `NOTICE.md`. WMM2025 manyetik varyasyon hesaplaması Darren Yeates'in MIT lisanslı `magvar` çalışmasından uyarlanmıştır. Leaflet, SheetJS ve JSZip kendi lisanslarına tabidir.

## Proje lisansı

Bu ilk sürümde proje-geneli bir `LICENSE` dosyası tanımlanmamıştır. Repository sahibi ayrıca bir lisans ilan edene kadar proje kodunda normal telif hakları geçerlidir; üçüncü taraf bileşenlerin kendi lisansları saklıdır.

---

<a id="english"></a>

# English

Browser-based waypoint and route editor/converter focused on Sperry Marine VisionMaster FT `.route` workflows while supporting common GPX, KML/KMZ, CSV, XLS/XLSX and GeoJSON interchange where practical.

**First stable public release:** `v1.0.0`

> This is a planning, inspection and conversion tool. It does not replace ECDIS route checking, bridge procedures, chart review, vessel-specific manoeuvring limits or navigational judgment. Verify every exported route and safety parameter on the target ECDIS before operational use.

## Download / run

- **Direct HTML:** `https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/Sperry_Route_Coordinate_Studio.html`
- **Android-safe ZIP:** `https://raw.githubusercontent.com/bemiroglu/sperry-route-coordinate-studio/main/downloads/Sperry_Route_Coordinate_Studio_v1.0.0.zip`

If an Android download manager renames the direct HTML to `.html.xml`, either use the ZIP above or rename the downloaded file so that its final extension is `.html`.

## Highlights

- Full Turkish / English interface.
- DD / DDM / DMS parsing and display across the table, Bulk Text preview, map editor and live drag readout.
- Canonical WGS 84 `Waypoint + Leg` model.
- Waypoint insert/delete/reorder, map editing and live coordinate feedback while dragging.
- Rhumb Line and Great Circle calculations with per-leg control.
- Planned speed, leg/cumulative time and ETA with fixed UTC-offset handling.
- Import/export adapters for Sperry `.route`, CSV/TXT, GPX, KML/KMZ, GeoJSON and XLS/XLSX when the browser dependency is available.
- Qibla / Kaaba inspection view with Istanbul default, arbitrary map selection or current-route waypoint selection; WMM2025 variation is reported with compass deviation explicitly excluded.

For detailed limitations, Sperry notes, Excel behavior, testing and future work, see the Turkish section above and `ROADMAP.md` / `docs/QA_v1.0.0.md`.
