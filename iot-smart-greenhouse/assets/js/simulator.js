const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const random=(min,max,d=1)=>+(Math.random()*(max-min)+min).toFixed(d);
// Симулятор: плавное изменение значений + реакция на исполнительные устройства
function simulateZone(z){
 const A=z.actuators,n=Date.now(),r=a=>(Math.random()-.5)*a,ph=z.id.charCodeAt(6),o={};
 SENSORS.forEach(s=>{if(Math.random()<.01)z.sensorsOff[s.k]=!z.sensorsOff[s.k]}); // редкие offline
 const amb=24+8*Math.sin(n/70000+ph);
 o.temperature=z.temperature+(amb-z.temperature)*.08+r(1)+(A.heater?.9:0)-(A.fan?1:0)-(A.vent?.6:0);
 o.humidity=z.humidity+(65-z.humidity)*.05+r(3)+(A.humidifier?3:0)-(A.fan?1:0)-(A.vent?1:0);
 o.soil=z.soil-random(.4,1.2)+(A.pump?4:0);
 o.light=18000+11000*Math.sin(n/110000+ph)+r(2000)+(A.growLight?6000:0);
 o.co2=z.co2+(800-z.co2)*.1+r(120)-(A.vent?90:0);
 o.waterLevel=z.waterLevel-(A.pump?random(.5,1):random(0,.05));
 const lim={temperature:[5,45,1],humidity:[20,98,0],soil:[5,95,0],light:[0,40000,0],co2:[380,2500,0],waterLevel:[0,100,1]};
 SENSORS.forEach(s=>{if(!z.sensorsOff[s.k]){const[a,b,d]=lim[s.k];z[s.k]=+clamp(o[s.k],a,b).toFixed(d)}});
 z.updated=n;return z;
}
