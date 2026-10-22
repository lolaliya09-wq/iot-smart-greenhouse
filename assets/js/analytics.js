const CH={},COL=['#36a3ff','#72e0c4','#ffc857'];
const P_analytics={
 shell:()=>`<div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr))">${[['temperature','Temperature °C'],['humidity','Air Humidity %'],['soil','Soil Moisture %'],['risk','Zone Risk Score']].map(([k,t])=>`<div class="card"><h3>${t}</h3><div class="ch"><canvas id="c_${k}"></canvas></div></div>`).join('')}</div><h2>Risk &amp; Recommendations</h2><div id="an" class="grid3"></div>`,
 update(){
  $('#an').innerHTML=S.zones.map(z=>{const s=S.zs[z.id],r=calculateRisk(z,s),an=S.alerts.filter(a=>a.zoneId===z.id&&a.type.startsWith('anomaly')&&a.status!=='resolved');
   return`<div class="card"><h3>${z.name} <span class="pill ${riskCls(r)}">Risk ${r}</span></h3><ul>${getRecommendations(z,s).map(x=>`<li>${x}</li>`).join('')}</ul>${an.length?`<p><b>Anomalies:</b> ${an.map(a=>a.message).join('; ')}</p>`:''}</div>`}).join('');
  if(typeof Chart==='undefined'){if(!$('#nochart'))$('#view').insertAdjacentHTML('afterbegin','<p id="nochart" class="red">Chart.js не загрузился (нет интернета?)</p>');return}
  Chart.defaults.color='#8fa7bf';
  const lab=S.history.map(h=>h.t),opt={responsive:true,maintainAspectRatio:false,animation:false};
  ['temperature','humidity','soil'].forEach(k=>{
   const ds=S.zones.map((z,i)=>({label:z.name,data:S.history.map(h=>h.z[z.id]?h.z[z.id][k]:null),borderColor:COL[i],backgroundColor:COL[i],tension:.35,pointRadius:1}));
   if(!CH[k])CH[k]=new Chart($('#c_'+k),{type:'line',data:{labels:lab,datasets:ds},options:opt});
   else{CH[k].data.labels=lab;CH[k].data.datasets=ds;CH[k].update()}});
  const risks=S.zones.map(z=>calculateRisk(z,S.zs[z.id])),cols=risks.map(r=>r>=50?'#ff7070':r>=25?'#ffc857':'#72e0c4');
  if(!CH.risk)CH.risk=new Chart($('#c_risk'),{type:'bar',data:{labels:S.zones.map(z=>z.name),datasets:[{label:'Risk score',data:risks,backgroundColor:cols}]},options:{...opt,scales:{y:{min:0,max:100}}}});
  else{CH.risk.data.datasets[0].data=risks;CH.risk.data.datasets[0].backgroundColor=cols;CH.risk.update()}
 }};
