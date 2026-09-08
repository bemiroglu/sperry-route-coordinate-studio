  const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw new Error(txt('Geçersiz KML XML','Invalid KML XML'));
  const placemarks=localElements(doc,'Placemark');let points=[];const paths=[];
  for(const pm of placemarks){
    const point=firstLocal(pm,'Point');const pc=point?firstLocal(point,'coordinates'):null;
    if(pc){const a=parseKmlTupleText(pc.textContent)[0];if(a)points.push({name:(directLocal(pm,'name')||firstLocal(pm,'name'))?.textContent||`WP${String(points.length+1).padStart(3,'0')}`,lat:a[1],lon:a[0],note:(directLocal(pm,'description')||firstLocal(pm,'description'))?.textContent||'',geom:parseGeomValue(kmlDataValue(pm,'leg_geometry')),speed:parseSpeedValue(kmlDataValue(pm,'planned_speed_kn'))})}
    for(const ls of localElements(pm,'LineString')){const c=firstLocal(ls,'coordinates');const a=parseKmlTupleText(c?.textContent||'');if(a.length>=2)paths.push({coords:a,name:(directLocal(pm,'name')||firstLocal(pm,'name'))?.textContent||'',note:(directLocal(pm,'description')||firstLocal(pm,'description'))?.textContent||''})}
    for(const tr of localElements(pm,'Track')){const a=parseGxTrack(tr);if(a.length>=2)paths.push({coords:a,name:(directLocal(pm,'name')||firstLocal(pm,'name'))?.textContent||'',note:(directLocal(pm,'description')||firstLocal(pm,'description'))?.textContent||''})}
  }
  // Some KMLs place LineString/gx:Track outside a Placemark. Include them as fallbacks.
  if(!paths.length){for(const ls of localElements(doc,'LineString')){const a=parseKmlTupleText(firstLocal(ls,'coordinates')?.textContent||'');if(a.length>=2)paths.push({coords:a,name:'',note:''})}for(const tr of localElements(doc,'Track')){const a=parseGxTrack(tr);if(a.length>=2)paths.push({coords:a,name:'',note:''})}}
  const docNode=localElements(doc,'Document')[0]||doc.documentElement,sem=kmlDataValue(docNode,'leg_semantics').trim().toLowerCase();
  let rec=[];let kind='points';paths.sort((a,b)=>b.coords.length-a.coords.length);const bestPath=paths[0]||null;const pointMetadata=hasLegMetadata(points);
  if(points.length>=2&&(sem==='outbound'||pointMetadata||!bestPath||points.length>bestPath.coords.length*1.25)){rec=points;if(sem!=='outbound'&&hasLegMetadata(rec))rec=shiftInboundLegMetadataToOutbound(rec)}
  else if(bestPath){const p=bestPath;kind='path';rec=p.coords.map((c,i)=>({name:`WP${String(i+1).padStart(3,'0')}`,lat:c[1],lon:c[0],note:i===0?p.note:''}))}
  else if(points.length)rec=points;
  if(!rec.length)throw new Error(txt('KML/KMZ içinde desteklenen Point, LineString veya gx:Track koordinatı bulunamadı','No supported Point, LineString or gx:Track coordinates were found in KML/KMZ'));
  const dn=directLocal(docNode,'name')?.textContent||'';
  return {records:rec,meta:{name:dn||name.replace(/\.kml$/i,'').replace(/\.kmz$/i,''),defaultGeom:parseGeomValue(kmlDataValue(docNode,'default_geometry')),defaultSpeed:parseSpeedValue(kmlDataValue(docNode,'default_speed_kn'))},kind,count:rec.length};
}
function importKML(text,name){const p=parseKMLCandidate(text,name);loadPointRecords(p.records,p.meta);return p}
async function importKMZBuffer(buf,name){
  if(!window.JSZip)throw new Error(txt('JSZip yüklenemedi','JSZip could not be loaded'));
  const z=await JSZip.loadAsync(buf);let names=Object.keys(z.files).filter(n=>!z.files[n].dir&&n.toLowerCase().endsWith('.kml'));
  if(!names.length)throw new Error(txt('KMZ içinde KML bulunamadı','No KML found inside KMZ'));
  names.sort((a,b)=>{const ad=/^(?:.*\/)?doc\.kml$/i.test(a)?0:1,bd=/^(?:.*\/)?doc\.kml$/i.test(b)?0:1;return ad-bd||a.split('/').length-b.split('/').length||a.length-b.length});
