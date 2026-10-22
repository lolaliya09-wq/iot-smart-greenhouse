function saveData(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
function loadData(key,fallback){
 try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}
}
let S=loadData('greenhouseState',null);
if(!S||!S.zones||!S.zs)S=freshState();
function log(zoneId,source,action,message){
 S.events.unshift({id:S.seq++,zoneId,source,action,message,timestamp:fmt(Date.now())});
 if(S.events.length>200)S.events.length=200;
}
