/* A76: retained blue-charcoal PC bang; repaired tiled floor and independent depth scales. */
(function(w){'use strict';
const WIDTH=810,HEIGHT=270,SX=WIDTH/2172,SY=HEIGHT/724,ACTOR_SCALE=1.65,ACTOR_HEIGHT=51*ACTOR_SCALE;
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/pcroom/interior.webp'});
const xy=([x,y])=>[x*SX,y*SY];
const regions=[
{id:'front',polygon:[[20,684],[2150,684],[2150,718],[20,718]].map(xy)},
{id:'entry',polygon:[[395,568],[580,568],[580,700],[395,700]].map(xy)},
{id:'seat-aisle',polygon:[[1353,700],[1375,700],[1375,525],[1353,525]].map(xy)}
];
const frontLayers=[
[[0,505],[120,505],[120,520],[390,520],[390,680],[0,680]],
[[676,315],[1250,315],[1310,435],[1310,645],[676,645]],
[[1430,327],[2024,327],[2055,455],[2055,648],[1430,648]]
].map(p=>p.map(xy));
const peerFloors=new Map(),ENTRY={x:478*SX,y:603*SY},FRONT=684*SY;
function scale(floor){return 1.45+.20*Math.max(0,Math.min(1,(floor-196)/72))}
function onSegment(x,y,a,b){const cross=(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);return Math.abs(cross)<1e-5&&x>=Math.min(a[0],b[0])-1e-6&&x<=Math.max(a[0],b[0])+1e-6&&y>=Math.min(a[1],b[1])-1e-6&&y<=Math.max(a[1],b[1])+1e-6}
function inside(poly,x,y){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(onSegment(x,y,a,b))return true;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
function walkable(x,y){return regions.some(r=>inside(r.polygon,x,y))}
function project(x,y){if(walkable(x,y))return{x,y};let best={x:ENTRY.x,y:ENTRY.y,d:Infinity};for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),xx=a[0]+dx*t,yy=a[1]+dy*t,d=Math.hypot(xx-x,yy-y);if(d<best.d)best={x:xx,y:yy,d}}return best}
function bounds(x){const ys=[];for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0]))continue;if(a[0]===b[0])ys.push(a[1],b[1]);else ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))}return{top:Math.min(...ys),bottom:Math.max(...ys)}}
function enter(p,y=ENTRY.y){const q=project(p.x,y);p.x=q.x;p.pcFloorY=q.y;p.pcJump=0;p.pcVelocity=0;p.y=q.y;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.pcFloorY))enter(p);if((h||v)&&['sit','bench'].includes(p.pose))p.pose='stand';const resting=['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');if(resting){p.walking=0;p.y=p.pcFloorY;return}const n=Math.hypot(h,v)||1,nx=p.x+h/n*100*dt;if(walkable(nx,p.pcFloorY))p.x=nx;const ny=p.pcFloorY+v/n*55*dt;if(walkable(p.x,ny))p.pcFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.pcJump>0||p.pcVelocity>0){p.pcVelocity-=510*dt;p.pcJump=Math.max(0,p.pcJump+p.pcVelocity*dt);if(!p.pcJump){p.pcVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.pcFloorY-p.pcJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.pose='jump';p.pcVelocity=188;p.pcJump=.01;p.onGround=false}
function draw(c,cam){c.save();c.fillStyle='#bbb6ad';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),0,WIDTH,HEIGHT)}c.restore();return true}
function front(c,a){if(!ready||a.floor>=FRONT-.1)return;c.save();c.beginPath();for(const poly of frontLayers){poly.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath()}c.clip();c.imageSmoothingEnabled=false;c.drawImage(im,0,0,WIDTH,HEIGHT);c.restore()}
function actor(c,a,p,t){c.save();c.fillStyle='#35404a28';c.beginPath();c.ellipse(a.x,a.floor+.6,14,2.1,0,0,Math.PI*2);c.fill();c.translate(Math.round(a.x),Math.round(a.y));const z=scale(a.floor);c.scale(z,z);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand'),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,a.id,a.held);c.restore()}
function keeper(c,t){if(!ready)return;c.save();c.beginPath();c.rect(180*SX,190*SY,205*SX,345*SY);c.clip();c.translate(280*SX,650*SY);c.scale(1.5,1.5);w.CHARART?.drawNPC(c,'npc_office',0,0,1,Math.floor(t/5)%2?'work':'idle');c.restore()}
function label(c,a){if(!a.name)return;c.save();c.textAlign='center';c.font='bold 9px sans-serif';const width=Math.min(95,Math.max(28,a.name.length*8+12)),ny=a.y-51*scale(a.floor)-15;c.fillStyle='#20374bcc';c.fillRect(a.x-width/2,ny-12,width,13);c.fillStyle='#fff2d5';c.fillText(a.name,a.x,ny-1);if(a.bubble&&performance.now()<a.bubbleUntil){const bw=Math.min(205,Math.max(37,a.bubble.length*8+13));c.fillStyle='#fff9e8';c.fillRect(a.x-bw/2,ny-41,bw,22);c.fillStyle='#23394a';c.font='9px sans-serif';c.fillText(a.bubble,a.x,ny-26)}c.restore()}
function render(c,p,t){keeper(c,t);const actors=[{x:p.x,y:p.y,floor:p.pcFloorY,self:true}];for(const a of w.A25NET?.drawPeers||w.A25NET?.peers||[])if(a.scene==='pcroom'){if(a.pose!=='jump')peerFloors.set(a.id,a.y);actors.push({...a,floor:a.pose==='jump'?(peerFloors.get(a.id)??project(a.x,a.y).y):a.y})}actors.sort((a,b)=>a.floor-b.floor);for(const a of actors){actor(c,a,p,t);front(c,a)}for(const a of actors)if(!a.self)label(c,a)}
function spot(type,x,y,r,title,txt=''){return{type,x:x*SX,y:y*SY,r,title,txt,icon:type==='exit'?'↶':'·'}}
function hotspots(){return[
spot('exit',478,603,19,'PC방 출입문'),
spot('pcCounter',330,685,28,'비회원 카드 받는 카운터','먼저 카운터에서 선불로 계산하고 자리 번호표를 받는다.'),
{...spot('pc',820,684,24,'PC방12번 자리','브라운관 모니터와 일반 키보드가 놓인 자리.'),seat:12},
{...spot('pc',1580,684,24,'PC방17번 자리','초기 LCD 모니터가 들어온 자리.'),seat:17},
spot('routeNote',1364,545,18,'좌석 사이 안쪽 통로','본체와 칸막이 사이로 짧은 통로가 나 있다. 게임 소리와 팬 돌아가는 소리가 가까워진다.'),
spot('routeNote',2020,686,23,'벽 쪽 음료 선반','컵라면과 종이컵이 가지런하다. 카운터 쪽 음료 선반에는 보라색 웰치스 포도맛 캔이 놓여 있다.')
]}
w.PcRoomMap={WIDTH,HEIGHT,ENTRY,scale,ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,readyPromise,draw,render,enter,walk,jump,bounds,walkable,front,actor,hotspots,sourcePoint:(x,y)=>({x:x*SX,y:y*SY}),get geometry(){return{width:WIDTH,height:HEIGHT,actorScale:ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,front:FRONT,regions:JSON.parse(JSON.stringify(regions))}},get ready(){return ready}};
})(window);
