/** ART A26: authoritative co-op toy physics for one 12-player room.
 * Shared positions are server defaults until a future revision of world-edit sync.
 * This deliberately models a cartoon game, not real-world playground safety.
 */
'use strict';
const STEP=1/60;
const DEVICES={
 swing_pair:{id:'swing_pair',name:'그네',x:3515,w:94,mid:3562,ground:207},
 roundabout:{id:'roundabout',name:'뺑뺑이',x:3840,w:116,mid:3898,ground:207}
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const round=x=>Math.round(x*1000)/1000;
function createRoom(){return {tick:0,swings:[{angle:0,omega:0,rider:null},{angle:0,omega:0,rider:null}],roundabout:{angle:0,omega:0,riders:[]},flights:new Map(),lastPush:new Map(),event:0};}
function occupancy(room,id){
 for(let i=0;i<2;i++)if(room.swings[i].rider===id)return {device:'swing_pair',seat:i,role:'rider'};
 if(room.roundabout.riders.includes(id))return{device:'roundabout',seat:0,role:'rider'};
 return null;
}
function clearUser(room,id){
 if(!room)return;
 for(const s of room.swings)if(s.rider===id)s.rider=null;
 room.roundabout.riders=room.roundabout.riders.filter(x=>x!==id);
 room.flights.delete(id);room.lastPush.delete(id);
}
function controlled(session,device){
 if(!DEVICES[device]||!session?.room||session.state.scene!=='street')return false;
 const x=Number(session.state.x),y=Number(session.state.y);
 return Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x-DEVICES[device].mid)<=145&&Math.abs(y-207)<65;
}
function act(room,s,command,people){
 const action=String(command?.action||'');
 const device=String(command?.device||'');
 const d=DEVICES[device];
 if(!d)return{ok:false,message:'없는 놀이기구야.'};
 const on=occupancy(room,s.id),f=room.flights.get(s.id);
 if(action==='dismount'){
  if(!on)return{ok:false,message:'지금 탑승 중이 아니야.'};
  clearUser(room,s.id);s.state.pose='stand';s.state.y=207;
  return{ok:true,message:'놀이기구에서 내렸어.'};
 }
 if(action==='mount'){
  if(!controlled(s,device))return{ok:false,message:'놀이터에서 놀이기구 가까이 와야 해.'};
  if(on||f)return{ok:false,message:'이미 타고 있거나 착지 중이야.'};
  if(device==='swing_pair'){
   let index=Number(command.seat)===1?1:0;
   if(room.swings[index].rider){index=1-index;if(room.swings[index].rider)return{ok:false,message:'그네 두 자리가 모두 찼어.'};}
   room.swings[index].rider=s.id;
  }else{
   if(room.roundabout.riders.length>=3)return{ok:false,message:'뺑뺑이 자리가 다 찼어.'};
   room.roundabout.riders.push(s.id);
  }
  s.state.pose='swing';return{ok:true,message:device==='swing_pair'?'그네에 앉았어. 친구가 밀어줄 수 있어.':'뺑뺑이에 탔어. 친구가 돌려줄 수 있어.'};
 }
 if(action==='push'){
  if(!controlled(s,device))return{ok:false,message:'가까이 가서 밀어줘야 해.'};
  if(on||f)return{ok:false,message:'타고 있는 동안 다른 놀이기구를 밀 수 없어.'};
  if(device==='swing_pair'&&!room.swings.some(a=>a.rider))return{ok:false,message:'그네에 타고 있는 친구가 없어.'};
  if(device==='roundabout'&&!room.roundabout.riders.length)return{ok:false,message:'뺑뺑이에 탄 친구가 없어.'};
  const key=s.id+':'+device;
  if(room.tick-(room.lastPush.get(key)??-999)<11)return{ok:false,message:'조금 간격을 두고 다시 밀어줘.'};
  room.lastPush.set(key,room.tick);
  const power=clamp(Number(command.strength)||1,0.5,3.5), sign=Number(command.direction)===-1?-1:1;
  if(device==='swing_pair'){
   const seat=room.swings.find(a=>a.rider),direction=Math.abs(seat.omega)>.08?Math.sign(seat.omega):sign;
   seat.omega=clamp(seat.omega+direction*(.21+.19*power),-3.8,3.8);
  }else room.roundabout.omega=clamp(room.roundabout.omega+sign*(.14+.18*power),-4.2,4.2);
  return{ok:true,message:power>=3?'힘껏 밀었어! 너무 강하면 튕겨 나가!':'살짝 밀어줬어.'};
 }
 if(action==='pump'){
  if(!on||device!=='swing_pair')return{ok:false,message:'그네에 타고 있어야 해.'};
  const seat=room.swings[on.seat],sgn=Number(command.direction)===-1?-1:1;
  seat.omega=clamp(seat.omega+sgn*.08,-3.8,3.8);
  return{ok:true,message:'몸을 움직여 그네에 박자를 맞췄어.'};
 }
 return{ok:false,message:'알 수 없는 놀이터 동작이야.'};
}
function launch(room,id,device,seat,angle,omega,people){
 let x,y,vx,vy;
 const d=DEVICES[device];
 if(device==='swing_pair'){
  x=d.mid-18+seat*36+60*Math.sin(angle);y=101+77*Math.cos(angle)-12;
  vx=clamp(60*omega*Math.cos(angle)*1.3,-340,340);
  vy=clamp(-77*omega*Math.sin(angle)-65,-320,20);
  room.swings[seat].rider=null;
 }else{
  x=d.mid+22*Math.cos(angle);y=174;
  vx=clamp(-Math.sin(angle)*omega*110+Math.sign(omega)*65,-340,340);
  vy=-95-Math.abs(omega)*32;
  room.roundabout.riders=room.roundabout.riders.filter(v=>v!==id);
 }
 room.flights.set(id,{x,y,vx,vy,spin:0,age:0,landed:false,device});
 const s=people?.get(id);if(s){s.state.pose='jump';s.state.x=x;s.state.y=y}
 room.event++;
}
function tick(room,people){
 room.tick++;
 for(let i=0;i<2;i++){
  const s=room.swings[i],acceler=-(9.81/1.75)*Math.sin(s.angle)-.14*s.omega;
  s.omega+=acceler*STEP;s.angle+=s.omega*STEP;
  if(s.rider&&Math.abs(s.angle)>=.62&&Math.abs(s.omega)>=1.6&&s.angle*s.omega>0){launch(room,s.rider,'swing_pair',i,s.angle,s.omega,people)}
  if(Math.abs(s.angle)>.95){s.angle=clamp(s.angle,-.95,.95);s.omega*=-.35;}
  if(Math.abs(s.angle)<.0001&&Math.abs(s.omega)<.0003){s.angle=0;s.omega=0}
 }
 const r=room.roundabout;
 r.omega*=Math.exp(-.24*STEP);r.angle=(r.angle+r.omega*STEP+Math.PI*2)%(Math.PI*2);
 if(r.riders.length&&Math.abs(r.omega)>=2.15){for(const id of [...r.riders])launch(room,id,'roundabout',0,r.angle,r.omega,people)}
 for(const [id,f] of room.flights){
  if(!people?.has(id)){room.flights.delete(id);continue}
  if(!f.landed){f.age+=STEP;f.vy+=480*STEP;f.x=clamp(f.x+f.vx*STEP,0,4240);f.y+=f.vy*STEP;f.spin+=f.vx*STEP*.009;
   if(f.y>=207){f.y=207;f.vx=0;f.vy=0;f.landed=true;f.age=0;room.event++;}
  }else{f.age+=STEP;if(f.age>1.05){room.flights.delete(id);const p=people.get(id);if(p){p.state.pose='stand';p.state.y=207;}}}
  const p=people.get(id);if(p){p.state.x=f.x;p.state.y=f.y;p.state.pose=f.landed?'stand':'jump';}
 }
 for(let i=0;i<2;i++){const s=room.swings[i];const player=people?.get(s.rider);if(player){player.state.x=DEVICES.swing_pair.mid-18+i*36+60*Math.sin(s.angle);player.state.y=101+77*Math.cos(s.angle);player.state.pose='swing';}}
 for(const id of room.roundabout.riders){const p=people?.get(id);if(p){p.state.x=DEVICES.roundabout.mid+18*Math.cos(r.angle);p.state.y=183+5*Math.sin(r.angle);p.state.pose='swing';}}
}
function snapshot(room){return{tick:room.tick,event:room.event,devices:DEVICES,
 swings:room.swings.map(a=>({angle:round(a.angle),omega:round(a.omega),rider:a.rider})),
 roundabout:{angle:round(room.roundabout.angle),omega:round(room.roundabout.omega),riders:[...room.roundabout.riders]},
 flights:[...room.flights].map(([id,f])=>({id,x:round(f.x),y:round(f.y),spin:round(f.spin),landed:f.landed,device:f.device}))};}
module.exports={STEP,DEVICES,createRoom,act,tick,snapshot,clearUser,occupancy};
