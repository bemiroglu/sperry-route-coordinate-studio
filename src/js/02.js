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
