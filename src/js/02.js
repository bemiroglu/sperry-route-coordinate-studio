function renderFileStatus(){const el=$('fileStatus');if(!el)return;const st=sourceFileState||{mode:'none'};if(st.mode==='reading')el.textContent=`${txt('Okunuyor','Reading')}: ${st.name||''}`;else if(st.mode==='loaded')el.textContent=`${txt('Yüklendi','Loaded')}: ${st.name||''}`;else if(st.mode==='preview')el.textContent=txt('Metin önizlemeye alındı.','Text loaded into preview.');else if(st.mode==='error')el.textContent=`${txt('Hata','Error')}: ${st.message||''}`;else el.textContent=txt('Henüz dosya seçilmedi.','No file selected yet.')}
function setFileStatus(mode='none',name='',message=''){sourceFileState={mode,name,message};renderFileStatus()}
function initTZ(){const vals=[];for(let m=-720;m<=840;m+=60) vals.push(m);[-570,-210,210,270,330,345,390,525,570,630,765,825].forEach(v=>vals.push(v));[...new Set(vals)].sort((a,b)=>a-b).forEach(v=>{const o=document.createElement('option');o.value=v;if(v===180)o.selected=true;$('tzSelect').appendChild(o)});initTZLabels()}
function initTZLabels(){const s=$('tzSelect');if(!s)return;[...s.options].forEach(o=>{const v=+o.value;o.textContent=tzLabel(v)+(v===180?' — '+txt('Türkiye','Türkiye'):'')})}
function parseLocalDateTimeInput(v,offsetMin){if(!v)return null;const m=v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);if(!m)return null;const t=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0))-offsetMin*60000;return new Date(t)}
function formatLocalFromUtcMs(ms,offsetMin,withDate=true){if(!Number.isFinite(ms))return '—';const d=new Date(ms+offsetMin*60000);const date=`${pad2(d.getUTCDate())}.${pad2(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`;const time=`${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;return withDate?`${date} ${time}`:time}
function durationText(hours){if(!Number.isFinite(hours))return '—';const sec=Math.round(hours*3600);const d=Math.floor(sec/86400),h=Math.floor((sec%86400)/3600),m=Math.floor((sec%3600)/60),s=sec%60;return (d?`${d}d `:'')+`${pad2(h)}:${pad2(m)}${s?':'+pad2(s):''}`}
function hemiInfo(ch){ch=String(ch||'').toUpperCase();if(['N','K'].includes(ch))return {axis:'lat',sign:1,h:'N'};if(['S','G'].includes(ch))return {axis:'lat',sign:-1,h:'S'};if(['E','D'].includes(ch))return {axis:'lon',sign:1,h:'E'};if(['W','B'].includes(ch))return {axis:'lon',sign:-1,h:'W'};return null}
function parseCoordinate(raw,axis){
  const original=String(raw??'').trim(); if(!original)return {ok:false,empty:true,error:txt('Boş','Empty')};
  let s=original.toUpperCase().replace(/[−–—]/g,'-').replace(/º/g,'°').replace(/[’′´`]/g,"'").replace(/[”″]/g,'"');
  const letters=[...s.matchAll(/[NKSGEDWB]/g)].map(m=>m[0]); let hemi=null;
  if(letters.length){const infos=letters.map(hemiInfo).filter(Boolean);if(infos.some(x=>x.axis!==axis))return {ok:false,error:txt('Yarımküre eksenle uyumsuz','Hemisphere-axis mismatch')};const signs=[...new Set(infos.map(x=>x.sign))];if(signs.length>1)return {ok:false,error:txt('Çelişkili yarımküre','Conflicting hemispheres')};hemi=infos[0];s=s.replace(/[NKSGEDWB]/g,' ')}
  s=s.replace(/,/g,'.').replace(/[°'":;]/g,' ').replace(/\s+/g,' ').trim();
  if(/[^0-9+\-. ]/.test(s))return {ok:false,error:txt('Tanımsız karakter','Unsupported character')};
  const parts=s.split(' ').filter(Boolean);if(parts.length<1||parts.length>3)return {ok:false,error:txt('DD, DDM veya DMS bekleniyor','Expected DD, DDM or DMS')};
  const nums=parts.map(Number);if(nums.some(n=>!Number.isFinite(n)))return {ok:false,error:txt('Sayısal değer okunamadı','Numeric value could not be parsed')};
  if(nums.slice(1).some(n=>n<0))return {ok:false,error:txt('Dakika/saniye negatif olamaz','Minutes/seconds cannot be negative')};
  const neg=nums[0]<0 || Object.is(nums[0],-0);const deg=Math.abs(nums[0]),min=parts.length>=2?nums[1]:0,sec=parts.length>=3?nums[2]:0;
  if(min>=60||sec>=60)return {ok:false,error:txt('Dakika/saniye 60’tan küçük olmalı','Minutes/seconds must be less than 60')};
  const max=axis==='lat'?90:180;let mag=deg+min/60+sec/3600;if(mag>max+1e-12)return {ok:false,error:txt(`${axis==='lat'?'Enlem':'Boylam'} sınırı aşıldı`,`${axis==='lat'?'Latitude':'Longitude'} limit exceeded`)};if(deg===max&&(min>0||sec>0))return {ok:false,error:txt('Derece sınırında dakika/saniye sıfır olmalı','Minutes/seconds must be zero at the degree limit')};
  let sign=neg?-1:1;if(hemi){if(neg&&hemi.sign>0)return {ok:false,error:txt('İşaret ve yarımküre çelişkili','Sign-hemisphere conflict')};sign=hemi.sign}
  const dd=sign*mag;return {ok:true,dd,format:parts.length===1?'DD':parts.length===2?'DDM':'DMS',hemi:axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E'),raw:original};
}
function coordDD(dd,axis,prec=6){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E');return `${Math.abs(dd).toFixed(prec)}° ${hemi}`}
function coordDDM(dd,axis,prec=5){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E');const a=Math.abs(dd),d=Math.floor(a),m=(a-d)*60;const ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${m.toFixed(prec).padStart(2+1+prec,'0')}′ ${hemi}`}
function coordDMS(dd,axis,prec=2){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E');const a=Math.abs(dd),d=Math.floor(a),mf=(a-d)*60,m=Math.floor(mf),sec=(mf-m)*60;const ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${pad2(m)}′ ${sec.toFixed(prec).padStart(2+1+prec,'0')}″ ${hemi}`}
function coordFmt(dd,axis,fmt){return fmt==='dd'?coordDD(dd,axis,6):fmt==='dms'?coordDMS(dd,axis,2):coordDDM(dd,axis,5)}
function popupCoord(dd,axis){return coordFmt(dd,axis,$('displayFmt')?.value||'ddm')}
function popupInputCoord(dd,axis){return popupCoord(dd,axis)}
function activeCoordFmt(){return $('displayFmt')?.value||'ddm'}
function displayedCoord(dd,axis){return coordFmt(dd,axis,activeCoordFmt())}
function setRowCoordDisplay(r,axis,dd){const v=displayedCoord(dd,axis);if(axis==='lat')r.latRaw=v;else r.lonRaw=v;if(r.dom)r.dom.querySelector(axis==='lat'?'.lat':'.lon').value=v;return v}
function normalizeRowCoordDisplay(r,axis){const key=axis==='lat'?'latRaw':'lonRaw',raw=String(r[key]||'').trim();if(!raw)return false;const p=parseCoordinate(raw,axis);if(!p.ok)return false;setRowCoordDisplay(r,axis,p.dd);return true}
function syncCoordinateInputsToDisplay(){for(const r of rows){normalizeRowCoordDisplay(r,'lat');normalizeRowCoordDisplay(r,'lon')}}
function displayFormatChanged(){syncCoordinateInputsToDisplay();if($('bulkText')?.value.trim())previewBulk();recalcAll()}
function rad(x){return x*Math.PI/180} function deg(x){return x*180/Math.PI}
function normBearing(x){return (x%360+360)%360}
function gcCalc(a,b){const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon);const dp=p2-p1;const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;const delta=2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);return {nm:R*delta/NM,bearing:normBearing(deg(Math.atan2(y,x)))} }
function rhumbCalc(a,b){const p1=rad(a.lat),p2=rad(b.lat);let dl=rad(b.lon-a.lon);if(Math.abs(dl)>Math.PI)dl=dl>0?-(2*Math.PI-dl):(2*Math.PI+dl);const dp=p2-p1;const dpsi=Math.log(Math.tan(Math.PI/4+p2/2)/Math.tan(Math.PI/4+p1/2));const q=Math.abs(dpsi)>1e-12?dp/dpsi:Math.cos(p1);const dist=Math.sqrt(dp*dp+q*q*dl*dl)*R;return {nm:dist/NM,bearing:normBearing(deg(Math.atan2(dl,dpsi)))} }
function gcPoints(a,b,n=48){const p1=rad(a.lat),l1=rad(a.lon),p2=rad(b.lat),l2=rad(b.lon);const d=gcCalc(a,b).nm*NM/R;if(d<1e-12)return [[a.lat,a.lon],[b.lat,b.lon]];const sd=Math.sin(d);const out=[];for(let i=0;i<=n;i++){const f=i/n,A=Math.sin((1-f)*d)/sd,B=Math.sin(f*d)/sd;const x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2),y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2),z=A*Math.sin(p1)+B*Math.sin(p2);out.push([deg(Math.atan2(z,Math.sqrt(x*x+y*y))),deg(Math.atan2(y,x))])}return out}
function wpNameKey(s){return String(s||'').trim().toLocaleUpperCase('tr-TR')}
function uniqueWpName(requested,excludeRow=null,seqHint=1){
  const used=new Set(rows.filter(r=>r!==excludeRow&&r.name.trim()).map(r=>wpNameKey(r.name)));
  let base=String(requested||'').trim().replace(/\s+/g,' ');
  if(!base){let n=Math.max(1,seqHint|0);do{base=`WP${String(n++).padStart(3,'0')}`}while(used.has(wpNameKey(base)));return base.slice(0,32)}
  if(!used.has(wpNameKey(base)))return base.slice(0,32);
  let n=1,cand='';do{const suf=` (${n++})`;cand=base.slice(0,Math.max(1,32-suf.length))+suf}while(used.has(wpNameKey(cand)));return cand
}
