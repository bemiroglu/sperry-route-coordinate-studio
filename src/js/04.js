function coordDDM(dd,axis,prec=5){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E'),scale=10**prec,total=Math.round(Math.abs(dd)*60*scale),d=Math.floor(total/(60*scale)),m=(total-d*60*scale)/scale,ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${m.toFixed(prec).padStart(2+1+prec,'0')}′ ${hemi}`}
function coordDMS(dd,axis,prec=2){const hemi=axis==='lat'?(dd<0?'S':'N'):(dd<0?'W':'E'),scale=10**prec,total=Math.round(Math.abs(dd)*3600*scale),d=Math.floor(total/(3600*scale)),rem=total-d*3600*scale,m=Math.floor(rem/(60*scale)),sec=(rem-m*60*scale)/scale,ds=axis==='lat'?String(d).padStart(2,'0'):String(d).padStart(3,'0');return `${ds}° ${pad2(m)}′ ${sec.toFixed(prec).padStart(2+1+prec,'0')}″ ${hemi}`}
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
function finalizeWaypointNames(notify=false){let changed=0;const used=new Set();for(let i=0;i<rows.length;i++){const r=rows[i];if(!nonEmpty(r))continue;let before=r.name.trim(),base=before,target=base;if(!base){let n=Math.max(1,i+1);do{target=`WP${String(n++).padStart(3,'0')}`}while(used.has(wpNameKey(target)))}else if(used.has(wpNameKey(base))){let n=1;do{const suf=` (${n++})`;target=base.slice(0,Math.max(1,32-suf.length))+suf}while(used.has(wpNameKey(target)))}target=target.slice(0,32);used.add(wpNameKey(target));if(target!==before){r.name=target;if(r.dom)r.dom.querySelector('.name').value=target;changed++;if(notify&&before)showStatus(`${esc(before)} → ${esc(target)} · ${txt('mükerrer WP adı benzersizleştirildi.','duplicate WP name was made unique.')}`)}}return changed}
