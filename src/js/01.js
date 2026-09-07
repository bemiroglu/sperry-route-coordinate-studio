
'use strict';
const APP_VERSION='v0.9.0'; const INITIAL_ROWS=50; const R=6371008.8; const NM=1852; const KNOT_TO_MS=0.5144444444444445;
const $=id=>document.getElementById(id);
let APP_LANG='tr';
const QIBLA_TARGET={lat:21.422487,lon:39.826206};
const QIBLA_ISTANBUL={lat:41.0082,lon:28.9784};
let qiblaMap=null,qiblaLayer=null,qiblaStartMarker=null,qiblaTargetMarker=null,qiblaStart={...QIBLA_ISTANBUL};
function txt(tr,en){return APP_LANG==='en'?en:tr}
function applyLanguage(){document.documentElement.lang=APP_LANG;document.querySelectorAll('[data-tr][data-en]').forEach(el=>{el.textContent=APP_LANG==='en'?el.dataset.en:el.dataset.tr});document.querySelectorAll('[data-tr-placeholder][data-en-placeholder]').forEach(el=>{el.placeholder=APP_LANG==='en'?el.dataset.enPlaceholder:el.dataset.trPlaceholder});$('langTR')?.classList.toggle('active',APP_LANG==='tr');$('langEN')?.classList.toggle('active',APP_LANG==='en');updateRowLanguage();initTZLabels();renderFileStatus();recalcAll()}
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
const WMM25_HD=[
[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,-21.5,0,0,0,0,0,0,0,0,0,0,0],[0,-27.7,-12.1,0,0,0,0,0,0,0,0,0,0],[0,4.0,-0.3,-4.1,0,0,0,0,0,0,0,0,0],[0,-1.1,4.1,1.6,-4.4,0,0,0,0,0,0,0,0],[0,-0.5,2.2,0.4,1.7,1.9,0,0,0,0,0,0,0],[0,0.3,-1.6,-0.4,0.9,0.7,0.9,0,0,0,0,0,0],[0,0.6,0.5,-0.8,0.0,-1.0,0.6,-0.2,0,0,0,0,0],[0,-0.2,0.5,-0.4,0.4,-0.5,-0.6,0.3,0.2,0,0,0,0],[0,-0.3,0.3,-0.3,0.3,0.2,-0.1,-0.2,0.4,0.1,0,0,0],[0,0,0,-0.2,0.1,-0.1,0.1,0.0,-0.1,0.2,0,0,0],[0,0,0.1,0,0.1,0,0,0.1,0,0,0,0,0],[0,0,0,-0.1,0.1,0,0,0,0,0,0,0,-0.1]];
const WMM25_JD0=2460677;
function zero2d(r,c){return Array.from({length:r},()=>Array(c).fill(0))}
function julianUtc(date){return Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())/86400000+2440587.5}
function wmm2025Declination(latitude,longitude,date=new Date(),altitudeKm=0){
  const globe={a:6378.137,b:6356.7523142,r0:6371.2},P=zero2d(13,13),DP=zero2d(13,13),gnm=zero2d(13,13),hnm=zero2d(13,13),sm=new Float64Array(13),cm=new Float64Array(13),root=new Float64Array(13),roots=Array.from({length:13},()=>Array.from({length:13},()=>new Float64Array(2)));
  for(let n=2;n<=12;n++)root[n]=Math.sqrt((2*n-1)/(2*n));
  for(let m=0;m<=12;m++){const mm=m*m;for(let n=Math.max(m+1,2);n<=12;n++){roots[m][n][0]=Math.sqrt((n-1)*(n-1)-mm);roots[m][n][1]=1/Math.sqrt(n*n-mm)}}
  const latRad=latitude*Math.PI/180,lonRad=longitude*Math.PI/180,sinLat=Math.sin(latRad),cosLat=Math.cos(latRad),sr=Math.sqrt(globe.a**2*cosLat**2+globe.b**2*sinLat**2),theta=Math.atan2(cosLat*(altitudeKm*sr+globe.a**2),sinLat*(altitudeKm*sr+globe.b**2)),r=Math.sqrt(altitudeKm**2+2*altitudeKm*sr+(globe.a**4-(globe.a**4-globe.b**4)*sinLat**2)/(globe.a**2-(globe.a**2-globe.b**2)*sinLat**2)),c=Math.cos(theta),ss=Math.sin(theta),invS=1/(ss+(ss===0?1e-8:0));
  P[0][0]=1;P[1][1]=ss;DP[0][0]=0;DP[1][1]=c;P[1][0]=c;DP[1][0]=-ss;
  for(let n=2;n<=12;n++){P[n][n]=P[n-1][n-1]*ss*root[n];DP[n][n]=(DP[n-1][n-1]*ss+P[n-1][n-1]*c)*root[n]}
  for(let m=0;m<=12;m++)for(let n=Math.max(m+1,2);n<=12;n++){P[n][m]=(P[n-1][m]*c*(2*n-1)-P[n-2][m]*roots[m][n][0])*roots[m][n][1];DP[n][m]=((DP[n-1][m]*c-P[n-1][m]*ss)*(2*n-1)-DP[n-2][m]*roots[m][n][0])*roots[m][n][1]}
  const yearFrac=(julianUtc(date)-WMM25_JD0)/365.25;for(let n=1;n<=12;n++)for(let m=0;m<=12;m++){gnm[n][m]=WMM25_G[n][m]+yearFrac*WMM25_GD[n][m];hnm[n][m]=WMM25_H[n][m]+yearFrac*WMM25_HD[n][m]}
  for(let m=0;m<=12;m++){sm[m]=Math.sin(m*lonRad);cm[m]=Math.cos(m*lonRad)}
  let BR=0,BTheta=0,BPhi=0,fn0=globe.r0/r,fn=fn0**2;for(let n=1;n<=12;n++){let c1=0,c2=0,c3=0;for(let m=0;m<=n;m++){const tmp=gnm[n][m]*cm[m]+hnm[n][m]*sm[m];c1+=tmp*P[n][m];c2+=tmp*DP[n][m];c3+=m*(gnm[n][m]*sm[m]-hnm[n][m]*cm[m])*P[n][m]}fn*=fn0;BR+=(n+1)*c1*fn;BTheta-=c2*fn;BPhi+=c3*fn*invS}
  const psi=theta-(Math.PI/2-latRad),X=-BTheta*Math.cos(psi)-BR*Math.sin(psi),Y=BPhi;return X!==0||Y!==0?Math.atan2(Y,X)*180/Math.PI:0;
}

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function xmlEsc(s){return esc(s)}
function fmtNum(n,d=2){return Number.isFinite(n)?n.toFixed(d):'—'}
function pad2(n){return String(n).padStart(2,'0')}
function pad3(n){return String(n).padStart(3,'0')}
function tzLabel(min){const sign=min>=0?'+':'-';const a=Math.abs(min);return `UTC${sign}${pad2(Math.floor(a/60))}:${pad2(a%60)}`}
function datetimeLocalFromUtcMs(ms,offsetMin){const d=new Date(ms+offsetMin*60000);return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth()+1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`}
