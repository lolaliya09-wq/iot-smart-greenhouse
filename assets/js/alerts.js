function checkAlerts(z,s,p){
 const off=Object.keys(z.sensorsOff).filter(k=>z.sensorsOff[k]);
 const C=[
  ['soil',z.soil<s.soil.min,'warning','Soil moisture is below threshold'],
  ['temp_high',z.temperature>s.temperature.max,'warning','Temperature above maximum'],
  ['temp_low',z.temperature<s.temperature.min,'warning','Temperature below minimum'],
  ['humidity',z.humidity<s.humidity.min||z.humidity>s.humidity.max,'warning','Air humidity out of range'],
  ['co2',z.co2>s.co2.max,'warning','CO₂ above threshold'],
  ['water',z.waterLevel<=s.waterLevel.critical,'critical','Water level critical: pump blocked'],
  ['offline',off.length>0,'warning','Sensor offline: '+off.join(', ')]];
 ['temperature','humidity','soil','co2'].forEach(k=>C.push(['anomaly_'+k,detectSuddenChange(p[k],z[k]),'warning','Sudden change (≥30%) of '+k]));
 C.forEach(([type,on,severity,message])=>{
  const a=S.alerts.find(x=>x.zoneId===z.id&&x.type===type&&x.status!=='resolved');
  if(on&&!a){
   S.alerts.unshift({id:'ALERT-'+String(S.seq++).padStart(3,'0'),zoneId:z.id,type,severity,message,status:'open',createdAt:fmt(Date.now())});
   if(S.alerts.length>100)S.alerts.length=100;
  }else if(!on&&a)a.status='resolved';
 });
}
const alertRows=l=>l.length?`<div class="tw"><table><tr><th>ID</th><th>Date</th><th>Zone</th><th>Severity</th><th>Reason</th><th>Status</th><th></th></tr>${l.map(a=>`<tr><td>${a.id}</td><td>${a.createdAt}</td><td>${zn(a.zoneId)}</td><td><span class="pill ${a.severity==='critical'?'red':'yel'}">${a.severity}</span></td><td>${a.message}</td><td>${a.status}</td><td>${a.status==='open'?`<button data-act="ack|${a.id}">Ack</button>`:''}</td></tr>`).join('')}</table></div>`:'<p><small>No alerts</small></p>';
const match=(txt,q)=>!q||txt.toLowerCase().includes(q.toLowerCase());
const P_alerts={
 shell:()=>`<div class="bar"><input id="q" class="flt" placeholder="Search alerts…"><select id="sev" class="flt"><option value="">All severities</option><option>warning</option><option>critical</option></select><select id="st" class="flt"><option value="">All statuses</option><option>open</option><option>acknowledged</option><option>resolved</option></select></div><div id="al"></div>
 <h2>Event Log</h2><div class="bar"><input id="qe" class="flt" placeholder="Search events…"><select id="src" class="flt"><option value="">All sources</option><option>automation</option><option>operator</option><option>safety</option></select></div><div id="ev"></div>`,
 update(){
  const q=$('#q').value,sv=$('#sev').value,st=$('#st').value;
  $('#al').innerHTML=alertRows(S.alerts.filter(a=>(!sv||a.severity===sv)&&(!st||a.status===st)&&match(a.message+zn(a.zoneId)+a.id,q)).slice(0,50));
  const qe=$('#qe').value,sr=$('#src').value,ev=S.events.filter(e=>(!sr||e.source===sr)&&match(e.message+e.action+zn(e.zoneId),qe)).slice(0,60);
  $('#ev').innerHTML=ev.length?`<div class="tw"><table><tr><th>Time</th><th>Zone</th><th>Source</th><th>Action</th><th>Message</th></tr>${ev.map(e=>`<tr><td>${e.timestamp}</td><td>${zn(e.zoneId)}</td><td>${e.source}</td><td>${e.action}</td><td>${e.message}</td></tr>`).join('')}</table></div>`:'<p><small>No events yet</small></p>';
 }};
