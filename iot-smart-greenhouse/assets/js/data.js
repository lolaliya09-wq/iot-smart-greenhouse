const SENSORS=[
 {k:'temperature',n:'Temperature',u:'°C'},{k:'humidity',n:'Air Humidity',u:'%'},
 {k:'soil',n:'Soil Moisture',u:'%'},{k:'light',n:'Light Sensor',u:'lux'},
 {k:'co2',n:'CO₂ Sensor',u:'ppm'},{k:'waterLevel',n:'Water Level',u:'%'}];
const ACT=[['pump','Irrigation Pump'],['fan','Fan'],['growLight','Grow Light'],['humidifier','Humidifier'],['heater','Heater'],['vent','Vent']];
// Учебные пороги, изменяются в Settings (не агрономические нормы)
const DEFAULT_SETTINGS={temperature:{min:20,max:28},humidity:{min:50,max:80},soil:{min:35,max:75},light:{min:12000},co2:{max:1500},waterLevel:{critical:15}};
const mkZone=(id,name,o)=>({id,name,temperature:24+o,humidity:65,soil:50-o*3,light:18000,co2:800,waterLevel:80-o*5,mode:'auto',
 sensorsOff:{},actuators:{pump:false,fan:false,growLight:false,humidifier:false,heater:false,vent:false},updated:Date.now()});
function freshState(){
 const zones=[mkZone('ZONE-01','Tomatoes',0),mkZone('ZONE-02','Cucumbers',2),mkZone('ZONE-03','Greens',-2)];
 const zs={};zones.forEach(z=>zs[z.id]=JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
 return{zones,zs,alerts:[],events:[],history:[],theme:'dark',speed:5,seq:1};
}
const fmt=t=>new Date(t).toLocaleString('sv-SE').slice(0,19);
