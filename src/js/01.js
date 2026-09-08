
'use strict';
const APP_VERSION='v1.0.0'; const INITIAL_ROWS=50; const R=6371008.8; const NM=1852; const KNOT_TO_MS=0.5144444444444445;
const $=id=>document.getElementById(id);
let APP_LANG='tr';
const QIBLA_TARGET={lat:21.422487,lon:39.826206};
const QIBLA_ISTANBUL={lat:41.0082,lon:28.9784};
let qiblaMap=null,qiblaLayer=null,qiblaStartMarker=null,qiblaTargetMarker=null,qiblaStart={...QIBLA_ISTANBUL};
function txt(tr,en){return APP_LANG==='en'?en:tr}
function applyLanguage(){document.documentElement.lang=APP_LANG;document.querySelectorAll('[data-tr][data-en]').forEach(el=>{el.textContent=APP_LANG==='en'?el.dataset.en:el.dataset.tr});document.querySelectorAll('[data-tr-placeholder][data-en-placeholder]').forEach(el=>{el.placeholder=APP_LANG==='en'?el.dataset.enPlaceholder:el.dataset.trPlaceholder});$('langTR')?.classList.toggle('active',APP_LANG==='tr');$('langEN')?.classList.toggle('active',APP_LANG==='en');updateRowLanguage();initTZLabels();renderFileStatus();recalcAll();if($('qWpSelect'))populateQiblaWpSelect()}
function setLanguage(lang){APP_LANG=lang==='en'?'en':'tr';applyLanguage()}
function updateRowLanguage(){for(const r of rows){if(!r.dom)continue;const g=r.dom.querySelector('.geom');if(g){g.options[0].textContent=txt('ROTA VARSAYILANI','ROUTE DEFAULT');g.options[1].textContent='RHUMB';g.options[2].textContent='GREAT CIRCLE'}const d=r.dom.querySelector('.del');if(d)d.title=txt('Sil','Delete');const ins=r.dom.querySelector('.ins');if(ins)ins.title=txt('Bu satırın sonrasına WP ekle','Insert a WP after this row');const up=r.dom.querySelector('.up');if(up)up.title=txt('WP sırasını yukarı taşı','Move WP up');const dn=r.dom.querySelector('.down');if(dn)dn.title=txt('WP sırasını aşağı taşı','Move WP down')}}
function _z9(){const a='CyAlKCVpDCQgOyaN1iU8aWQdCHgLHA==',k=73;const s=atob(a);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)^k;return new TextDecoder().decode(u)}
function placeAuthor(){const t=_z9();$('authorEntry').textContent=t;$('authorTop').textContent=t;$('mapWatermark').textContent=t}
const rows=[]; const PAGE_OPENED_MS=Date.now(); let departureAuto=true; let sourceFileState={mode:'none',name:'',message:''}; let bulkPreview=[]; let map=null, mapLayers=null, legLabelLayer=null, popupTimer=null, mapDataCache=null, dragCoordTooltip=null; let selectedMapRowIndex=null, pendingInsertAfter=null, pendingOpenRow=null; const mapMarkers=new Map();
/* Magnetic declination: WMM2025 coefficients and calculation adapted from
   dpyeates/magvar (MIT License, Copyright (c) 2025 Darren Yeates).
   Model coefficients are WMM2025; NOAA/NCEI lists WMM2025 as the current model
   for 2025–2029. This local implementation avoids a network API dependency. */
const WMM25_G=[
[0,0,0,0,0,0,0,0,0,0,0,0,0],[-29351.8,-1410.8,0,0,0,0,0,0,0,0,0,0,0],[-2556.6,2951.1,1649.3,0,0,0,0,0,0,0,0,0,0],[1361.0,-2404.1,1243.8,453.6,0,0,0,0,0,0,0,0,0],[895.0,799.5,55.7,-281.1,12.1,0,0,0,0,0,0,0,0],[-233.2,368.9,187.2,-138.7,-142.0,20.9,0,0,0,0,0,0,0],[64.4,63.8,76.9,-115.7,-40.9,14.9,-60.7,0,0,0,0,0,0],[79.5,-77.0,-8.8,59.3,15.8,2.5,-11.1,14.2,0,0,0,0,0],[23.2,10.8,-17.5,2.0,-21.7,16.9,15.0,-16.8,0.9,0,0,0,0],[4.6,7.8,3.0,-0.2,-2.5,-13.1,2.4,8.6,-8.7,-12.9,0,0,0],[-1.3,-6.4,0.2,2.0,-1.0,-0.6,-0.9,1.5,0.9,-2.7,-3.9,0,0],[2.9,-1.5,-2.5,2.4,-0.6,-0.1,-0.6,-0.1,1.1,-1.0,-0.2,2.6,0],[-2.0,-0.2,0.3,1.2,-1.3,0.6,0.6,0.5,-0.1,-0.4,-0.2,-1.3,-0.7]];
const WMM25_H=[
[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,4545.4,0,0,0,0,0,0,0,0,0,0,0],[0,-3133.6,-815.1,0,0,0,0,0,0,0,0,0,0],[0,-56.6,237.5,-549.5,0,0,0,0,0,0,0,0,0],[0,278.6,-133.9,212.0,-375.6,0,0,0,0,0,0,0,0],[0,45.4,220.2,-122.9,43.0,106.1,0,0,0,0,0,0,0],[0,-18.4,16.8,48.8,-59.8,10.9,72.7,0,0,0,0,0,0],[0,-48.9,-14.4,-1.0,23.4,-7.4,-25.1,-2.3,0,0,0,0,0],[0,7.1,-12.6,11.4,-9.7,12.7,0.7,-5.2,3.9,0,0,0,0],[0,-24.8,12.2,8.3,-3.3,-5.2,7.2,-0.6,0.8,10.0,0,0,0],[0,3.3,0.0,2.4,5.3,-9.1,0.4,-4.2,-3.8,0.9,-9.1,0,0],[0,0,2.9,-0.6,0.2,0.5,-0.3,-1.2,-1.7,-2.9,-1.8,-2.3,0],[0,-1.3,0.7,1.0,-1.4,0.0,0.6,-0.1,0.8,0.1,-1.0,0.1,0.2]];
const WMM25_GD=[
[0,0,0,0,0,0,0,0,0,0,0,0,0],[12.0,9.7,0,0,0,0,0,0,0,0,0,0,0],[-11.6,-5.2,-8.0,0,0,0,0,0,0,0,0,0,0],[-1.3,-4.2,0.4,-15.6,0,0,0,0,0,0,0,0,0],[-1.6,-2.4,-6.0,5.6,-7.0,0,0,0,0,0,0,0,0],[0.6,1.4,0.0,0.6,2.2,0.9,0,0,0,0,0,0,0],[-0.2,-0.4,0.9,1.2,-0.9,0.3,0.9,0,0,0,0,0,0],[0,-0.1,-0.1,0.5,-0.1,-0.8,-0.8,0.8,0,0,0,0,0],[-0.1,0.2,0.0,0.5,-0.1,0.3,0.2,0,0.2,0,0,0,0],[0,-0.1,0.1,0.3,-0.3,0,0.3,-0.1,0.1,-0.1,0,0,0],[0.1,0.0,0.1,0.1,0,-0.3,0,-0.1,-0.1,0,0,0,0],[0,0,0,0,0,-0.1,0,0,-0.1,-0.1,-0.1,-0.1,0],[0,0,0,0,0,0,0.1,0,0,0,-0.1,0,-0.1]];
