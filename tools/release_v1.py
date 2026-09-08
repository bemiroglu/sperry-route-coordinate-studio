from pathlib import Path
import hashlib, zipfile

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'
HTML=SRC/'html'; CSS=SRC/'css'; JS=SRC/'js'

def readcat(paths):
    return ''.join(p.read_text(encoding='utf-8') for p in paths)

def split_lines(text, n):
    lines=text.splitlines(keepends=True)
    return [''.join(lines[round(i*len(lines)/n):round((i+1)*len(lines)/n)]) for i in range(n)]

head=(HTML/'00_head.html').read_text(encoding='utf-8')
css_files=sorted(CSS.glob('*.css')); body_files=sorted(HTML.glob('*_body.html')); js_files=sorted(JS.glob('*.js'))
css=readcat(css_files); body=readcat(body_files); js=readcat(js_files)

# Idempotency: only transform the pre-1.0 source once.
if "const APP_VERSION='v1.0.0'" not in js:
    head=head.replace('Sperry Route & Coordinate Studio v0.9.0','Sperry Route & Coordinate Studio v1.0.0')
    js=js.replace("const APP_VERSION='v0.9.0';","const APP_VERSION='v1.0.0';")

    # CSS audit fixes + Qibla source selector styling.
    for old,new in [('}wptable td{','}.wptable td{'),('}state.ok{','}.state.ok{'),('}mini-btn{','}.mini-btn{'),('}wptable .opshead{','}.wptable .opshead{'),('}brand small{','}.brand small{')]:
        css=css.replace(old,new)
    qcss='.qibla-panel button{padding:6px 8px;font:10px/1 Arial,sans-serif}'
    qcss_add=qcss+".qibla-source{margin-top:8px}.qibla-source label{display:block;margin-bottom:4px;font:700 9px/1.2 Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#687277}.qibla-source select{width:100%;padding:6px 7px;border:1px solid #ccc5b9;border-radius:6px;background:#fff;font:10px/1.25 Arial,sans-serif;color:#26363d}"
    if '.qibla-source{' not in css: css=css.replace(qcss,qcss_add)

    # Qibla WP start selector.
    qold='<div data-tr="Haritada bir noktaya tıklayın veya başlangıç işaretini sürükleyin. Hat, seçilen noktadan Kâbe\'ye great-circle olarak yeniden hesaplanır." data-en="Click anywhere on the map or drag the start marker. The line is recalculated as a great circle from the selected point to the Kaaba."></div><div class="qibla-stats">'
    qnew='<div data-tr="Haritada bir noktaya tıklayın veya başlangıç işaretini sürükleyin. Hat, seçilen noktadan Kâbe\'ye great-circle olarak yeniden hesaplanır." data-en="Click anywhere on the map or drag the start marker. The line is recalculated as a great circle from the selected point to the Kaaba."></div><div class="qibla-source"><label data-tr="Başlangıç noktası" data-en="Start point"></label><select id="qWpSelect" aria-label="Qibla start point"></select></div><div class="qibla-stats">'
    if 'id="qWpSelect"' not in body:
        if qold not in body: raise SystemExit('Qibla markup anchor not found')
        body=body.replace(qold,qnew)

    # Language refresh + v1 version.
    aold="function applyLanguage(){document.documentElement.lang=APP_LANG;document.querySelectorAll('[data-tr][data-en]').forEach(el=>{el.textContent=APP_LANG==='en'?el.dataset.en:el.dataset.tr});document.querySelectorAll('[data-tr-placeholder][data-en-placeholder]').forEach(el=>{el.placeholder=APP_LANG==='en'?el.dataset.enPlaceholder:el.dataset.trPlaceholder});$('langTR')?.classList.toggle('active',APP_LANG==='tr');$('langEN')?.classList.toggle('active',APP_LANG==='en');updateRowLanguage();initTZLabels();renderFileStatus();recalcAll()}"
    anew=aold[:-1]+";if($('qWpSelect'))populateQiblaWpSelect()}"
    if aold in js: js=js.replace(aold,anew)

    # DDM/DMS rounding carry: fixes display-format switch invalidating rows at 60.00 sec/min boundaries.
    old_ddm="function coordDDM(dd,axis,prec=5){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E');const a=Math.abs(dd),d=Math.floor(a),m=(a-d)*60;const ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${m.toFixed(prec).padStart(2+1+prec,'0')}′ ${hemi}`}"
    new_ddm="function coordDDM(dd,axis,prec=5){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E'),scale=10**prec,total=Math.round(Math.abs(dd)*60*scale),d=Math.floor(total/(60*scale)),m=(total-d*60*scale)/scale,ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${m.toFixed(prec).padStart(2+1+prec,'0')}′ ${hemi}`}"
    old_dms="function coordDMS(dd,axis,prec=2){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E');const a=Math.abs(dd),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf),sec=(mf-m)*60;const ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${pad2(m)}′ ${sec.toFixed(prec).padStart(2+1+prec,'0')}″ ${hemi}`}"
    new_dms="function coordDMS(dd,axis,prec=2){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E'),scale=10**prec,total=Math.round(Math.abs(dd)*3600*scale),d=Math.floor(total/(3600*scale)),rem=total-d*3600*scale,m=Math.floor(rem/(60*scale)),sec=(rem-m*60*scale)/scale,ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${pad2(m)}′ ${sec.toFixed(prec).padStart(2+1+prec,'0')}″ ${hemi}`}"
    if old_ddm not in js or old_dms not in js: raise SystemExit('Coordinate formatter anchors not found')
    js=js.replace(old_ddm,new_ddm).replace(old_dms,new_dms)

    js=js.replace("function qiblaCoordText(p){return `${coordDDM(p.lat,'lat',3)} · ${coordDDM(p.lon,'lon',3)}`}","function qiblaCoordText(p){return `${displayedCoord(p.lat,'lat')} · ${displayedCoord(p.lon,'lon')}`}")

    mag="function magneticText(d){if(!Number.isFinite(d))return '—';const dir=d>=0?'E':'W';return `${Math.abs(d).toFixed(2)}° ${dir}`}\n"
    qfunc=mag+"function populateQiblaWpSelect(){const sel=$('qWpSelect');if(!sel)return;const prev=sel.value||'istanbul',pts=routeRowsData();sel.innerHTML=`<option value=\"istanbul\">${txt('İstanbul (varsayılan)','Istanbul (default)')}</option><option value=\"custom\" disabled>${txt('Haritadan seçilen konum','Map-selected position')}</option>`+pts.map((p,i)=>`<option value=\"wp:${i}\">${esc(p.name)} · ${esc(displayedCoord(p.lat,'lat'))} · ${esc(displayedCoord(p.lon,'lon'))}</option>`).join('');if([...sel.options].some(o=>o.value===prev&&!o.disabled))sel.value=prev;else sel.value='istanbul'}\nfunction markQiblaCustom(){const sel=$('qWpSelect');if(!sel)return;const opt=[...sel.options].find(o=>o.value==='custom');if(opt)opt.disabled=false;sel.value='custom'}\nfunction qiblaSelectStart(){const sel=$('qWpSelect');if(!sel)return;const v=sel.value;if(v==='istanbul'){qiblaStart={...QIBLA_ISTANBUL};updateQibla(true);return}if(v.startsWith('wp:')){const i=Number(v.slice(3)),p=routeRowsData()[i];if(p){qiblaStart={lat:p.lat,lon:p.lon};updateQibla(true)}}}\n"
    if 'function populateQiblaWpSelect()' not in js:
        if mag not in js: raise SystemExit('Qibla function anchor not found')
        js=js.replace(mag,qfunc)
    js=js.replace("qiblaStartMarker.on('dragend',e=>{const ll=e.target.getLatLng();qiblaStart={lat:ll.lat,lon:ll.lng};updateQibla(false)})","qiblaStartMarker.on('dragend',e=>{const ll=e.target.getLatLng();qiblaStart={lat:ll.lat,lon:ll.lng};markQiblaCustom();updateQibla(false)})")
    js=js.replace("qiblaMap.on('click',e=>{qiblaStart={lat:e.latlng.lat,lon:e.latlng.lng};updateQibla(false)})","qiblaMap.on('click',e=>{qiblaStart={lat:e.latlng.lat,lon:e.latlng.lng};markQiblaCustom();updateQibla(false)})")
    js=js.replace("function openQibla(){const m=$('qiblaModal');m.classList.add('show');m.setAttribute('aria-hidden','false');initQiblaMap();setTimeout(()=>{qiblaMap.invalidateSize();updateQibla(true)},30)}","function openQibla(){recalcAll();populateQiblaWpSelect();const m=$('qiblaModal');m.classList.add('show');m.setAttribute('aria-hidden','false');initQiblaMap();setTimeout(()=>{qiblaMap.invalidateSize();updateQibla(true)},30)}")
    js=js.replace("function resetQiblaIstanbul(){qiblaStart={...QIBLA_ISTANBUL};updateQibla(true)}","function resetQiblaIstanbul(){qiblaStart={...QIBLA_ISTANBUL};if($('qWpSelect'))$('qWpSelect').value='istanbul';updateQibla(true)}")
    js=js.replace("$('qFit').onclick=()=>updateQibla(true);","$('qFit').onclick=()=>updateQibla(true);$('qWpSelect').onchange=qiblaSelectStart;")

    old_self="function selfTest(){const cases=[['41.123456','lat',41.123456],['41,123456','lat',41.123456],['-41.123456','lat',-41.123456],['41 07.40736 N','lat',41.123456],['41°07\\'24.4416\" K','lat',41.123456],['029 07 24.4416 D','lon',29.123456],['29,123456 B','lon',-29.123456],['-29.123456 W','lon',-29.123456]];let ok=0;for(const [s,a,e] of cases){const r=parseCoordinate(s,a);if(r.ok&&Math.abs(r.dd-e)<1e-6)ok++}console.info(`Coordinate parser self-test: ${ok}/${cases.length}`);return ok===cases.length}"
    new_self="function selfTest(){const cases=[['41.123456','lat',41.123456],['41,123456','lat',41.123456],['-41.123456','lat',-41.123456],['41 07.40736 N','lat',41.123456],['41°07\\'24.4416\" K','lat',41.123456],['029 07 24.4416 D','lon',29.123456],['29,123456 B','lon',-29.123456],['-29.123456 W','lon',-29.123456]];let ok=0;for(const [s,a,e] of cases){const r=parseCoordinate(s,a);if(r.ok&&Math.abs(r.dd-e)<1e-6)ok++}const boundary=12+59/60+59.999999/3600,dms=coordDMS(boundary,'lat',2),dmsBack=parseCoordinate(dms,'lat'),ddm=coordDDM(12+59.9999999/60,'lat',5),ddmBack=parseCoordinate(ddm,'lat');const roundtripOk=dmsBack.ok&&ddmBack.ok&&!/60\\.00|60\\.00000/.test(dms+' '+ddm);console.info(`Coordinate parser self-test: ${ok}/${cases.length}; display-rounding: ${roundtripOk?'PASS':'FAIL'}`);return ok===cases.length&&roundtripOk}"
    if old_self in js: js=js.replace(old_self,new_self)

    # Rewrite fragments deterministically while preserving build ordering.
    (HTML/'00_head.html').write_text(head,encoding='utf-8')
    media=css.find('@media'); css_parts=[css[:media],css[media:]] if media>=0 else split_lines(css,len(css_files))
    for p,t in zip(css_files,css_parts): p.write_text(t,encoding='utf-8')
    for p,t in zip(body_files,split_lines(body,len(body_files))): p.write_text(t,encoding='utf-8')
    for p,t in zip(js_files,split_lines(js,len(js_files))): p.write_text(t,encoding='utf-8')

# Distribution ZIP and checksums are regenerated on every build.
app=ROOT/'Sperry_Route_Coordinate_Studio.html'
# build_single_file.py runs after this script, so ZIP/checksums are finalized there by workflow step below.
