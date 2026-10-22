function runAutomation(z,s){
 const set=(d,v,why)=>{if(z.actuators[d]!==v){z.actuators[d]=v;log(z.id,'automation',d.toUpperCase()+(v?'_ON':'_OFF'),why)}};
 const lowWater=z.waterLevel<=s.waterLevel.critical;
 // Полив (SAFETY: при низком уровне воды насос не включается) + гистерезис +5%
 if(lowWater)set('pump',false,'Pump blocked: low water level');
 else if(z.soil<s.soil.min)set('pump',true,'Pump ON: low soil moisture');
 else if(z.soil>=s.soil.min+5||z.soil>=s.soil.max)set('pump',false,'Pump OFF: soil moisture restored');
 // Температура (гистерезис 1°C)
 if(z.temperature>s.temperature.max)set('fan',true,'Fan ON: temperature above max');
 else if(z.temperature<=s.temperature.max-1)set('fan',false,'Fan OFF: temperature normal');
 if(z.temperature<s.temperature.min)set('heater',true,'Heater ON: temperature below min');
 else if(z.temperature>=s.temperature.min+1)set('heater',false,'Heater OFF: temperature normal');
 // Свет
 if(z.light<s.light.min)set('growLight',true,'Grow Light ON: low light');
 else if(z.light>=s.light.min*1.15)set('growLight',false,'Grow Light OFF: enough light');
 // Влажность воздуха
 if(z.humidity<s.humidity.min)set('humidifier',true,'Humidifier ON: low air humidity');
 else if(z.humidity>=s.humidity.min+5)set('humidifier',false,'Humidifier OFF: humidity restored');
 // Форточка: жара или CO₂
 if(z.temperature>s.temperature.max||z.co2>s.co2.max)set('vent',true,'Vent OPEN: high temperature or CO₂');
 else if(z.temperature<=s.temperature.max-1&&z.co2<=s.co2.max-100)set('vent',false,'Vent CLOSED: air normal');
}
function calculateRisk(z,s){
 let n=0;
 if(z.temperature>s.temperature.max)n+=25;
 if(z.temperature<s.temperature.min)n+=20;
 if(z.humidity<s.humidity.min||z.humidity>s.humidity.max)n+=10;
 if(z.soil<s.soil.min)n+=25;
 if(z.light<s.light.min)n+=10;
 if(z.waterLevel<=s.waterLevel.critical)n+=25;
 if(z.co2>s.co2.max)n+=15;
 return Math.min(n,100);
}
const percentChange=(a,b)=>a===0?0:Math.abs((b-a)/a)*100;
const detectSuddenChange=(a,b)=>percentChange(a,b)>=30;
// Формат: что произошло → почему важно → что делать
function getRecommendations(z,s){
 const r=[];
 if(z.soil<s.soil.min)r.push(`Почва ${z.soil}% ниже ${s.soil.min}% → растения испытывают водный стресс → ${z.waterLevel<=s.waterLevel.critical?'пополнить бак, затем включить полив':'включить полив'}.`);
 if(z.waterLevel<=s.waterLevel.critical)r.push(`Вода в баке ${z.waterLevel}% → насос заблокирован → пополнить резервуар.`);
 if(z.temperature>s.temperature.max)r.push(`Температура ${z.temperature}°C выше ${s.temperature.max}°C → риск теплового стресса → проверить вентиляцию.`);
 if(z.temperature<s.temperature.min)r.push(`Температура ${z.temperature}°C ниже ${s.temperature.min}°C → замедление роста → проверить обогрев.`);
 if(z.light<s.light.min)r.push(`Освещённость ${z.light} lux ниже ${s.light.min} → недостаток света → включить фитолампу.`);
 if(z.humidity<s.humidity.min||z.humidity>s.humidity.max)r.push(`Влажность воздуха ${z.humidity}% вне диапазона ${s.humidity.min}–${s.humidity.max}% → риск болезней/пересыхания → скорректировать увлажнение/вентиляцию.`);
 if(z.co2>s.co2.max)r.push(`CO₂ ${z.co2} ppm выше ${s.co2.max} → ухудшение воздухообмена → открыть форточку.`);
 Object.keys(z.sensorsOff).filter(k=>z.sensorsOff[k]).forEach(k=>r.push(`Датчик ${k} offline → данные устарели → проверить подключение.`));
 return r.length?r:['Параметры в норме → риска нет → вмешательство не требуется.'];
}
