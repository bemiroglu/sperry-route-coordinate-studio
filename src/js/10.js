  for(let r=2;r<=last;r++){
    const i=r-2,p=pts[i],isLast=i===pts.length-1;
    if(r===2){xlsCell(ws,`I${r}`,{v:0,f:'=0',z:'0.0000'});xlsCell(ws,`J${r}`,{v:0,f:'=0',z:'[h]:mm:ss'})}
    else{xlsCell(ws,`I${r}`,{v:p.cumNm,f:`=I${r-1}+S${r-1}`,z:'0.0000'});xlsCell(ws,`J${r}`,{v:Number.isFinite(p.cumH)?p.cumH/24:0,f:`=J${r-1}+V${r-1}`,z:'[h]:mm:ss'})}
    const localCached=Number.isFinite(p.eta)?excelSerialFromLocalInput(datetimeLocalFromUtcMs(p.eta,+$('tzSelect').value)):undefined;
    const utcCached=Number.isFinite(p.eta)?excelSerialFromLocalInput(datetimeLocalFromUtcMs(p.eta,0)):undefined;
    xlsCell(ws,`K${r}`,{v:localCached,f:`=IF(Summary!$B$12="","",Summary!$B$12+J${r})`,z:'dd.mm.yyyy hh:mm'});
    xlsCell(ws,`L${r}`,{v:utcCached,f:`=IF(Summary!$B$13="","",Summary!$B$13+J${r})`,z:'dd.mm.yyyy hh:mm'});
    if(!isLast)xlsCell(ws,`V${r}`,{v:Number.isFinite(p.legH)?p.legH/24:undefined,f:`=IF(U${r}>0,S${r}/U${r}/24,"")`,z:'[h]:mm:ss'});else ws[`V${r}`]={t:'s',v:''};
  }
  ws['!cols']=[{wch:9},{wch:16},{wch:13},{wch:14},{wch:20},{wch:21},{wch:22},{wch:23},{wch:14},{wch:17},{wch:19},{wch:19},{wch:12},{wch:24},{wch:14},{wch:16},{wch:16},{wch:16},{wch:17},{wch:22},{wch:18},{wch:15}];
  XLSX.utils.book_append_sheet(wb,ws,'Route');
  const depLocal=excelSerialFromLocalInput($('departure').value||''),tzOff=+$('tzSelect').value,depUtc=Number.isFinite(depLocal)?depLocal-tzOff/1440:NaN;
  const s=[['Route name',$('routeName').value],['Coordinate reference / Datum','WGS 84 (EPSG:4326)'],['Route model version','2'],['Leg semantics','OUTBOUND'],['Default geometry',$('defaultGeom').value==='gc'?'Great Circle':'Rhumb Line'],['Default planned speed kn',+$('defaultSpeed').value||11],['Turn radius m',+$('turnRadius').value||40],['Off track limit m',+$('offTrack').value||100],['CSV/list separator preference',getExcelSeparator()],['Time zone',tzLabel(tzOff)],['Time zone offset min',tzOff],['Departure local',Number.isFinite(depLocal)?depLocal:''],['Departure UTC',Number.isFinite(depUtc)?depUtc:''],['Waypoint count',pts.length],['Total distance NM',mapDataCache.cumNm],['Planned duration',Number.isFinite(mapDataCache.totalH)?mapDataCache.totalH/24:0],['Overall planned average speed kn',Number.isFinite(mapDataCache.overall)?mapDataCache.overall:''],['Note',$('routeNote').value||''],['Final ETA local',Number.isFinite(depLocal)&&Number.isFinite(mapDataCache.totalH)?depLocal+mapDataCache.totalH/24:''],['Final ETA UTC',Number.isFinite(depUtc)&&Number.isFinite(mapDataCache.totalH)?depUtc+mapDataCache.totalH/24:'']];
  const sw=XLSX.utils.aoa_to_sheet(s);const lastRoute=last;
  if(Number.isFinite(depLocal)){sw.B12={t:'n',v:depLocal,z:'dd.mm.yyyy hh:mm'}}
  if(Number.isFinite(depUtc))xlsCell(sw,'B13',{v:depUtc,f:'=IF(B12="","",B12-B11/1440)',z:'dd.mm.yyyy hh:mm'});else xlsCell(sw,'B13',{f:'=IF(B12="","",B12-B11/1440)',z:'dd.mm.yyyy hh:mm'});
  xlsCell(sw,'B15',{v:mapDataCache.cumNm,f:`=MAX(Route!I2:I${lastRoute})`,z:'0.0000'});
  xlsCell(sw,'B16',{v:Number.isFinite(mapDataCache.totalH)?mapDataCache.totalH/24:0,f:`=MAX(Route!J2:J${lastRoute})`,z:'[h]:mm:ss'});
  xlsCell(sw,'B17',{v:Number.isFinite(mapDataCache.overall)?mapDataCache.overall:undefined,f:'=IF(B16>0,B15/(B16*24),"")',z:'0.00'});
  xlsCell(sw,'B19',{v:Number.isFinite(depLocal)&&Number.isFinite(mapDataCache.totalH)?depLocal+mapDataCache.totalH/24:undefined,f:'=IF(B12="","",B12+B16)',z:'dd.mm.yyyy hh:mm'});
  xlsCell(sw,'B20',{v:Number.isFinite(depUtc)&&Number.isFinite(mapDataCache.totalH)?depUtc+mapDataCache.totalH/24:undefined,f:'=IF(B13="","",B13+B16)',z:'dd.mm.yyyy hh:mm'});
  sw['!cols']=[{wch:36},{wch:28}];XLSX.utils.book_append_sheet(wb,sw,'Summary');
  wb.Workbook=wb.Workbook||{};wb.Workbook.CalcPr={calcMode:'auto',fullCalcOnLoad:'1',forceFullCalc:'1'};
  XLSX.writeFile(wb,sanitizeFile($('routeName').value)+'.'+type,{bookType:type,cellDates:false,bookSST:true});
}
