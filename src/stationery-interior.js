/* A74: compact storefront interior, midground walking and stocked foreground occlusion. */
(function(w){'use strict';
const WIDTH=480,HEIGHT=270,SX=WIDTH/1672,SY=HEIGHT/941,ACTOR_SCALE=1.3,ACTOR_HEIGHT=51*ACTOR_SCALE;
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/stationery-interior/interior.webp'});
const xy=([x,y])=>[x*SX,y*SY];
const regions=[
 {id:'aisle',polygon:[[70,606],[1640,606],[1640,696],[70,696]].map(xy)},
 {id:'browsing-nook',polygon:[[905,611],[1022,611],[962,445],[915,445]].map(xy)}
];
// Trace the stocked foreground silhouette; redraw only these authored pixels over actors.
const frontLayers=[[[0,710],[66,668],[138,645],[228,645],[267,647],[267,703],[352,703],[352,625],[399,620],[399,652],[450,626],[525,626],[550,631],[550,655],[590,630],[664,630],[664,649],[739,630],[799,630],[799,647],[843,630],[905,630],[905,650],[927,629],[970,613],[1025,614],[1067,648],[1084,648],[1084,589],[1105,581],[1145,585],[1167,581],[1203,585],[1203,674],[1218,674],[1218,582],[1441,582],[1441,588],[1472,588],[1472,583],[1672,583],[1672,941],[0,941]]].map(p=>p.map(xy));
const peerFloors=new Map(),ENTRY={x:35,y:180},FRONT=HEIGHT;
function scale(floor){return 1.08+Math.max(0,Math.min(1,(floor-128)/72))*.22}
function onSegment(x,y,a,b){const cross=(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);return Math.abs(cross)<1e-5&&x>=Math.min(a[0],b[0])-1e-6&&x<=Math.max(a[0],b[0])+1e-6&&y>=Math.min(a[1],b[1])-1e-6&&y<=Math.max(a[1],b[1])+1e-6}
function inside(poly,x,y){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(onSegment(x,y,a,b))return true;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
function walkable(x,y){return regions.some(r=>inside(r.polygon,x,y))}
function project(x,y){if(walkable(x,y))return{x,y};let best={x:ENTRY.x,y:ENTRY.y,d:Infinity};for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),xx=a[0]+dx*t,yy=a[1]+dy*t,d=Math.hypot(xx-x,yy-y);if(d<best.d)best={x:xx,y:yy,d}}return best}
function bounds(x){const ys=[];for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0]))continue;if(a[0]===b[0])ys.push(a[1],b[1]);else ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))}return{top:Math.min(...ys),bottom:Math.max(...ys)}}
function enter(p,y=ENTRY.y){const q=project(p.x,y);p.x=q.x;p.stationeryFloorY=q.y;p.stationeryJump=0;p.stationeryVelocity=0;p.y=q.y;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.stationeryFloorY))enter(p);if((h||v)&&['sit','bench'].includes(p.pose))p.pose='stand';const resting=['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');if(resting){p.walking=0;p.y=p.stationeryFloorY;return}const n=Math.hypot(h,v)||1,nx=p.x+h/n*100*dt;if(walkable(nx,p.stationeryFloorY))p.x=nx;const ny=p.stationeryFloorY+v/n*55*dt;if(walkable(p.x,ny))p.stationeryFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.stationeryJump>0||p.stationeryVelocity>0){p.stationeryVelocity-=510*dt;p.stationeryJump=Math.max(0,p.stationeryJump+p.stationeryVelocity*dt);if(!p.stationeryJump){p.stationeryVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.stationeryFloorY-p.stationeryJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.pose='jump';p.stationeryVelocity=188;p.stationeryJump=.01;p.onGround=false}
function draw(c,cam){c.save();c.fillStyle='#bbb6ad';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),0,WIDTH,HEIGHT)}c.restore();return true}
function front(c){if(!ready)return;c.save();c.beginPath();for(const poly of frontLayers){poly.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath()}c.clip();c.imageSmoothingEnabled=false;c.drawImage(im,0,0,WIDTH,HEIGHT);c.restore()}
function actor(c,a,p,t){c.save();c.fillStyle='#35404a28';c.beginPath();c.ellipse(a.x,a.floor+.6,14,2.1,0,0,Math.PI*2);c.fill();c.translate(Math.round(a.x),Math.round(a.y));const z=scale(a.floor);c.scale(z,z);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand'),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,a.id,a.held);c.restore()}
function keeper(c,t){if(!ready)return;c.save();c.beginPath();c.rect(1275*SX,230*SY,115*SX,205*SY);c.clip();c.translate(1330*SX,490*SY);c.scale(1.18,1.18);w.CHARART?.drawNPC(c,'npc_shopkeeper',0,0,1,Math.floor(t/5)%2?'work':'idle');c.restore()}
function label(c,a){if(!a.name)return;c.save();c.textAlign='center';c.font='bold 9px sans-serif';const width=Math.min(95,Math.max(28,a.name.length*8+12)),ny=a.y-51*scale(a.floor)-15;c.fillStyle='#20374bcc';c.fillRect(a.x-width/2,ny-12,width,13);c.fillStyle='#fff2d5';c.fillText(a.name,a.x,ny-1);if(a.bubble&&performance.now()<a.bubbleUntil){const bw=Math.min(205,Math.max(37,a.bubble.length*8+13));c.fillStyle='#fff9e8';c.fillRect(a.x-bw/2,ny-41,bw,22);c.fillStyle='#23394a';c.font='9px sans-serif';c.fillText(a.bubble,a.x,ny-26)}c.restore()}
function render(c,p,t){keeper(c,t);const actors=[{x:p.x,y:p.y,floor:p.stationeryFloorY,self:true}];for(const a of w.A25NET?.drawPeers||w.A25NET?.peers||[])if(a.scene==='stationery'){if(a.pose!=='jump')peerFloors.set(a.id,a.y);actors.push({...a,floor:a.pose==='jump'?(peerFloors.get(a.id)??project(a.x,a.y).y):a.y})}actors.sort((a,b)=>a.floor-b.floor);for(const a of actors)actor(c,a,p,t);front(c);for(const a of actors)if(!a.self)label(c,a)}
function spot(type,x,y,r,title,txt=''){return{type,x:x*SX,y:y*SY,r,title,txt,icon:type==='exit'?'↶':'·'}}
function hotspots(){return[
 spot('exit',115,628,14,'별빛문구 밖으로 나가기'),
 spot('arcade',335,622,18,'별빛문구 오락기'),
 spot('capsule',450,622,14,'100원 뽑기'),
 spot('routeNote',945,489,15,'문구 선반 안쪽 구석','선반 옆으로 들어서면 공책과 준비물이 안쪽까지 빼곡하다.'),
 spot('routeNote',685,648,17,'필기구와 미술 준비물','모나미 볼펜, 색연필과 크레파스가 진열대에 가지런히 쌓여 있다.'),
 spot('shop',1300,622,22,'문방구 과자 고르기'),
 spot('routeNote',1540,622,18,'별빛문구 계산대','유리 진열장 너머로 작은 전화기와 동전통이 보인다.')
]}
w.StationeryInterior={WIDTH,HEIGHT,ENTRY,scale,ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,readyPromise,draw,render,enter,walk,jump,bounds,walkable,front,actor,hotspots,sourcePoint:(x,y)=>({x:x*SX,y:y*SY}),get geometry(){return{width:WIDTH,height:HEIGHT,actorScale:ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,front:FRONT,regions:JSON.parse(JSON.stringify(regions))}},get ready(){return ready}};
})(window);
