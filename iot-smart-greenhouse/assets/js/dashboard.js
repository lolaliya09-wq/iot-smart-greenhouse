const $=s=>document.querySelector(s);
const NAV=[['index','Home'],['dashboard','Dashboard'],['zones','Zones'],['sensors','Sensors'],['control','Control'],['alerts','Alerts & Log'],['analytics','Analytics'],['settings','Settings']];
const zn=id=>{const z=S.zones.find(x=>x.id===id);return z?z.name:id};
const openAlerts=()=>S.alerts.filter(a=>a.status==='open');
const avg=k=>S.zones.reduce((t,z)=>t+z[k],0)/S.zones.length;
const riskCls=r=>r>=50?'red':r>=25?'yel':'grn';
const fv=(z,x)=>z.sensorsOff[x.k]?'<span class="red">offline</span>':`${z[x.k]} ${x.u}`;
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',2500)}
const kpi=(l,v,c='')=>`<div class="card kpi"><small>${l}</small><b class="${c}">${v}</b></div>`;
function kpis(){
 const el=$('#kpi');if(!el)return;
 const off=S.zones.reduce((n,z)=>n+Object.values(z.sensorsOff).filter(Boolean).length,0),tot=S.zones.length*SENSORS.length,oa=openAlerts().length;
 el.innerHTML=kpi('Temperature',avg('temperature').toFixed(1)+' °C')+kpi('Humidity',avg('humidity').toFixed(0)+' %')+kpi('Soil',avg('soil').toFixed(0)+' %')+
  kpi('Water (min)',Math.min(...S.zones.map(z=>z.waterLevel)).toFixed(0)+' %')+kpi('Active alerts',oa,oa?'red':'grn')+kpi('Devices online',`${tot-off}/${tot}`);
}
const zoneCard=(z,rec)=>{const s=S.zs[z.id],r=calculateRisk(z,s);
 return`<div class="card"><h3>${z.name} <small>${z.id}</small> <span class="pill ${riskCls(r)}">Risk ${r}</span></h3><div class="vals">${SENSORS.map(x=>`<div><small>${x.n}</small><b>${fv(z,x)}</b></div>`).join('')}</div>
 <div>${ACT.filter(([k])=>z.actuators[k]).map(([,n])=>`<span class="pill on">${n}</span>`).join('')||'<small>No active devices</small>'} <span class="pill">${z.mode.toUpperCase()}</span></div>
 ${rec?`<ul>${getRecommendations(z,s).map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</div>`};
const FIELDS=[['temperature','min','Temperature min °C'],['temperature','max','Temperature max °C'],['humidity','min','Humidity min %'],['humidity','max','Humidity max %'],['soil','min','Soil min %'],['soil','max','Soil max %'],['light','min','Light min lux'],['co2','max','CO₂ max ppm'],['waterLevel','critical','Water critical %']];

const P={
 index:{shell:()=>`<div class="card"><h2 style="margin-top:0">IoT Smart Greenhouse</h2><p>Веб‑платформа мониторинга и управления теплицей на симулированных данных: 3 зоны, 6 датчиков, 6 исполнительных устройств, Manual/Auto, alerts, event log и аналитика на Chart.js.</p>${NAV.slice(1).map(([h,n])=>`<a class="pill" href="${h}.html">${n}</a>`).join('')}</div><div id="kpi" class="grid6" style="margin-top:14px"></div>`,update:kpis},
 dashboard:{shell:()=>`<div id="kpi" class="grid6"></div><h2>Zones</h2><div id="zc" class="grid3"></div><h2>Latest alerts</h2><div id="la"></div>`,
  update(){kpis();$('#zc').innerHTML=S.zones.map(z=>zoneCard(z)).join('');$('#la').innerHTML=alertRows(S.alerts.slice(0,5))}},
 zones:{shell:()=>`<div class="bar"><input id="q" class="flt" placeholder="Search zone…"></div><div id="zc" class="grid3"></div>`,
  update(){$('#zc').innerHTML=S.zones.filter(z=>match(z.name+z.id,$('#q').value)).map(z=>zoneCard(z,1)).join('')}},
 sensors:{shell:()=>`<div class="bar"><input id="q" class="flt" placeholder="Search sensor…"><select id="zf" class="flt"><option value="">All zones</option>${S.zones.map(z=>`<option value="${z.id}">${z.name}</option>`).join('')}</select></div><div id="tb"></div>`,
  update(){const rows=[];S.zones.forEach(z=>{if($('#zf').value&&$('#zf').value!==z.id)return;SENSORS.forEach(x=>{if(match(x.n+z.name,$('#q').value))rows.push(`<tr><td>${x.n}</td><td>${z.sensorsOff[x.k]?'—':z[x.k]}</td><td>${x.u}</td><td>${z.name}</td><td><span class="pill ${z.sensorsOff[x.k]?'red':'grn'}">${z.sensorsOff[x.k]?'offline':'online'}</span></td><td>${fmt(z.updated)}</td></tr>`)})});
   $('#tb').innerHTML=`<div class="tw"><table><tr><th>Sensor</th><th>Value</th><th>Unit</th><th>Zone</th><th>Status</th><th>Updated</th></tr>${rows.join('')}</table></div>`}},
 control:{shell:()=>`<div id="zc" class="grid3"></div>`,
  update(){$('#zc').innerHTML=S.zones.map(z=>`<div class="card"><h3>${z.name} <button class="pill ${z.mode==='auto'?'on':''}" data-act="mode|${z.id}">${z.mode.toUpperCase()}</button></h3>${ACT.map(([k,n])=>`<div class="tg"><span>${n}${z.mode==='auto'?' <small>(Auto)</small>':''}</span><button class="${z.actuators[k]?'on':''}" ${z.mode==='auto'?'disabled':''} data-act="dev|${z.id}|${k}">${z.actuators[k]?'ON':'OFF'}</button></div>`).join('')}<p><small>Water ${z.waterLevel}%</small> <button data-act="refill|${z.id}">Refill tank</button></p></div>`).join('')}},
 alerts:P_alerts,analytics:P_analytics,
 settings:{shell:()=>`<div class="card"><h3>Thresholds</h3><p><small>Учебные пороги — не агрономические нормы.</small></p><div class="bar"><select id="zsel"></select></div><div class="form">${FIELDS.map(([k,p,l])=>`<label>${l}<input type="number" id="f_${k}_${p}"></label>`).join('')}<label>Theme<select id="theme"><option value="dark">Dark</option><option value="light">Light</option></select></label><label>Simulation speed (sec)<select id="spd"><option>3</option><option>5</option><option>10</option></select></label></div><p><button class="btn" id="save">Save</button> <button id="reset">Reset data</button></p></div>`,
  init(){$('#zsel').innerHTML=S.zones.map(z=>`<option value="${z.id}">${z.name}</option>`).join('');
   const fill=()=>{const s=S.zs[$('#zsel').value];FIELDS.forEach(([k,p])=>$(`#f_${k}_${p}`).value=s[k][p])};
   $('#zsel').onchange=fill;fill();$('#theme').value=S.theme;$('#spd').value=S.speed;
   $('#save').onclick=()=>{const s=S.zs[$('#zsel').value],v={};
    FIELDS.forEach(([k,p])=>v[k+p]=parseFloat($(`#f_${k}_${p}`).value));
    if(Object.values(v).some(isNaN)||v.temperaturemin>=v.temperaturemax||v.humiditymin>=v.humiditymax||v.soilmin>=v.soilmax){toast('Check values: min must be < max');return}
    FIELDS.forEach(([k,p])=>s[k][p]=v[k+p]);S.theme=$('#theme').value;S.speed=+$('#spd').value;
    document.documentElement.dataset.theme=S.theme;saveData('greenhouseState',S);startSim();toast('Settings saved')};
   $('#reset').onclick=()=>{if(confirm('Reset all data?')){localStorage.removeItem('greenhouseState');location.reload()}}},
  update(){}}
};
function layout(page){
 document.documentElement.dataset.theme=S.theme;
 $('#app').innerHTML=`<aside class="side"><div class="logo">🌱 SmartGreenhouse</div>${NAV.map(([h,n])=>`<a href="${h}.html" class="${h===page?'on':''}">${n}</a>`).join('')}</aside><div class="main"><header class="top"><b>IoT Smart Greenhouse</b><span id="modeInd" class="pill"></span><span class="sp"></span><a class="pill" href="alerts.html" id="bell"></a><button class="pill" data-act="theme">🌓</button><span class="pill">👤 Operator</span></header><main id="view"></main></div>`;
}
function tick(){
 S.zones.forEach(z=>{const s=S.zs[z.id],p={...z};simulateZone(z);
  if(z.waterLevel<=s.waterLevel.critical&&z.actuators.pump&&z.mode!=='auto'){z.actuators.pump=false;log(z.id,'safety','PUMP_OFF','Pump stopped: low water level')}
  if(z.mode==='auto')runAutomation(z,s);
  checkAlerts(z,s,p)});
 const h={t:new Date().toTimeString().slice(0,8),z:{}};
 S.zones.forEach(z=>h.z[z.id]={temperature:z.temperature,humidity:z.humidity,soil:z.soil,risk:calculateRisk(z,S.zs[z.id])});
 S.history.push(h);if(S.history.length>30)S.history.shift();
 saveData('greenhouseState',S);
}
let timer;
function startSim(){clearInterval(timer);timer=setInterval(()=>{tick();refresh()},S.speed*1000)}
function refresh(){
 const a=S.zones.filter(z=>z.mode==='auto').length;
 $('#modeInd').textContent=`${a===S.zones.length?'AUTO':a?'MIXED':'MANUAL'} · ${a}/${S.zones.length} zones auto`;
 $('#bell').textContent='🔔 '+openAlerts().length;
 P[document.body.dataset.page].update();
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b)return;
 const[a,id,d]=b.dataset.act.split('|'),z=S.zones.find(x=>x.id===id);
 if(a==='theme'){S.theme=S.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=S.theme}
 if(a==='mode'){z.mode=z.mode==='auto'?'manual':'auto';log(z.id,'operator','MODE_'+z.mode.toUpperCase(),'Mode switched to '+z.mode)}
 if(a==='dev'){const v=!z.actuators[d];
  if(d==='pump'&&v&&z.waterLevel<=S.zs[z.id].waterLevel.critical){toast('Pump blocked: low water level');return}
  z.actuators[d]=v;log(z.id,'operator',d.toUpperCase()+(v?'_ON':'_OFF'),'Manual toggle')}
 if(a==='refill'){z.waterLevel=100;log(z.id,'operator','REFILL','Water tank refilled')}
 if(a==='ack'){const al=S.alerts.find(x=>x.id===id);if(al)al.status='acknowledged'}
 saveData('greenhouseState',S);refresh();
});
document.addEventListener('input',e=>{if(e.target.matches('.flt'))refresh()});
document.addEventListener('DOMContentLoaded',()=>{
 const page=document.body.dataset.page,p=P[page];
 layout(page);$('#view').innerHTML=p.shell();if(p.init)p.init();refresh();startSim();
});
