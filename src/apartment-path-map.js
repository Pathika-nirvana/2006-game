/* A57: inside the estate. Ground position is independent of jump height. */
(function(w){'use strict';
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/apartment-path/interior.webp'});
const WIDTH=1182,TOP=210,BOTTOM=259;
const edge=[[18,176],[50,126],[90,145],[142,210],[475,210],[500,199],[908,199],[932,159],[977,158],[1004,207],[1164,207]];
function bounds(x){let top=TOP;for(let i=1;i<edge.length;i++)if(x<=edge[i][0]){const a=edge[i-1],b=edge[i],t=Math.max(0,(x-a[0])/(b[0]-a[0]));top=a[1]+(b[1]-a[1])*t;break}return {top,bottom:BOTTOM}}
function enter(p,y=222){p.apartmentFloorY=Math.max(bounds(p.x).top,Math.min(BOTTOM,y));p.apartmentJump=0;p.apartmentVelocity=0;p.y=p.apartmentFloorY;p.onGround=true;p.vy=0}
function walk(p,h,v,dt){
 if(!Number.isFinite(p.apartmentFloorY))enter(p);
 if((h||v)&&['bench','sit'].includes(p.pose)){p.pose='stand';p.apartmentFloorY=p.apartmentStandY??p.apartmentFloorY;p.apartmentStandY=null}
 const resting=['bench','sit'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');
 if(!resting){const n=Math.hypot(h,v)||1;
  p.x=Math.max(18,Math.min(WIDTH-18,p.x+h/n*91*dt*(p.dashMultiplier||1)));const b=bounds(p.x);
  p.apartmentFloorY=Math.max(b.top,Math.min(b.bottom,p.apartmentFloorY+v/n*66*dt*(p.dashMultiplier||1)));
  if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;
  if(p.apartmentJump>0||p.apartmentVelocity>0){p.apartmentVelocity-=510*dt;p.apartmentJump=Math.max(0,p.apartmentJump+p.apartmentVelocity*dt);if(!p.apartmentJump){p.apartmentVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}
  p.y=p.apartmentFloorY-(p.apartmentJump||0);
 }else p.walking=0;
 p.vy=0;
}
function jump(p){if(!p.onGround||p.pose==='eat')return;if(['bench','sit'].includes(p.pose)){p.pose='stand';p.apartmentFloorY=p.apartmentStandY??p.apartmentFloorY;p.apartmentStandY=null}p.apartmentVelocity=188;p.apartmentJump=.01;p.onGround=false;p.pose='jump'}
function draw(c,cam){if(!ready){c.save();c.fillStyle='#87b6d1';c.fillRect(0,0,480,270);c.fillStyle='#777c79';c.fillRect(0,170,480,100);c.restore();return true;}c.save();c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),-63,WIDTH,WIDTH/3);c.restore();return true}
function neighbor(t){return{x:777+Math.sin(t*.29)*40,y:220+Math.sin(t*.17)*9,dir:Math.cos(t*.29)>=0?1:0}}
function avatar(c,a){const floor=a.floor??a.y;c.save();c.fillStyle='#36433e35';c.beginPath();c.ellipse(a.x,floor+1,8,2.3,0,0,7);c.fill();c.translate(a.x,a.y);const scale=Math.max(.88,Math.min(1.04,.88+(floor-TOP)*.0017));c.scale(scale,scale);w.CHARART?.drawRemote?.(c,a.look,0,0,a.dir??1,a.pose||'stand',a.id,a.held);c.restore()}
function render(c,p,t){const n=neighbor(t),actors=[{...n,id:'apartment-neighbor',look:'npc_market',pose:'walk'},{x:p.x,y:p.y,floor:p.apartmentFloorY,dir:p.dir,pose:p.pose==='jump'?'jump':p.walking?'walk':p.pose,look:w.CHARART?.selected,id:'self',held:w.SHOPS?.heldKind}];for(const a of w.A25NET?.peers||[])if(a.scene==='apartment_path')actors.push({...a,floor:a.y});actors.sort((a,b)=>(a.floor??a.y)-(b.floor??b.y));for(const a of actors)avatar(c,a)}
w.ApartmentPathMap={readyPromise,draw,render,walk,enter,jump,bounds,neighbor,get ready(){return ready}};
})(window);
