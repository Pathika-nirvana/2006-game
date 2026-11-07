/* A66: approved side-scrolling room, native art and shallow explorable corners. */
(function(w){'use strict';
const WIDTH=675,HEIGHT=270,SX=WIDTH/1983,SY=HEIGHT/793,ACTOR_SCALE=2.2,ACTOR_HEIGHT=51*ACTOR_SCALE;
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/stationery-interior/interior.webp'});
const xy=([x,y])=>[x*SX,y*SY];
const regions=[
 {id:'front',polygon:[[20,714],[1962,714],[1962,750],[20,750]].map(xy)},
 {id:'paper-corner',polygon:[[420,716],[550,716],[550,609],[473,609]].map(xy)},
 {id:'toy-corner',polygon:[[1628,716],[1765,716],[1765,608],[1683,608]].map(xy)}
];
const frontLayers=[
 [[216,99],[417,99],[475,152],[475,608],[417,714],[216,714]],
 [[550,95],[680,95],[680,530],[1057,530],[1057,714],[550,714]],
 [[1360,96],[1626,96],[1683,147],[1683,607],[1628,714],[1360,714]],
 [[1752,356],[1977,356],[1977,714],[1752,714]]
].map(p=>p.map(xy));
const peerFloors=new Map(),ENTRY={x:40,y:245},FRONT=714*SY;
function onSegment(x,y,a,b){const cross=(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);return Math.abs(cross)<1e-5&&x>=Math.min(a[0],b[0])-1e-6&&x<=Math.max(a[0],b[0])+1e-6&&y>=Math.min(a[1],b[1])-1e-6&&y<=Math.max(a[1],b[1])+1e-6}
function inside(poly,x,y){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(onSegment(x,y,a,b))return true;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
function walkable(x,y){return regions.some(r=>inside(r.polygon,x,y))}
function project(x,y){if(walkable(x,y))return{x,y};let best={x:ENTRY.x,y:ENTRY.y,d:Infinity};for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),xx=a[0]+dx*t,yy=a[1]+dy*t,d=Math.hypot(xx-x,yy-y);if(d<best.d)best={x:xx,y:yy,d}}return best}
function bounds(x){const ys=[];for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0]))continue;if(a[0]===b[0])ys.push(a[1],b[1]);else ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))}return{top:Math.min(...ys),bottom:Math.max(...ys)}}
function enter(p,y=ENTRY.y){const q=project(p.x,y);p.x=q.x;p.stationeryFloorY=q.y;p.stationeryJump=0;p.stationeryVelocity=0;p.y=q.y;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.stationeryFloorY))enter(p);if((h||v)&&['sit','bench'].includes(p.pose))p.pose='stand';const resting=['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');if(resting){p.walking=0;p.y=p.stationeryFloorY;return}const n=Math.hypot(h,v)||1,nx=p.x+h/n*100*dt;if(walkable(nx,p.stationeryFloorY))p.x=nx;const ny=p.stationeryFloorY+v/n*55*dt;if(walkable(p.x,ny))p.stationeryFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.stationeryJump>0||p.stationeryVelocity>0){p.stationeryVelocity-=510*dt;p.stationeryJump=Math.max(0,p.stationeryJump+p.stationeryVelocity*dt);if(!p.stationeryJump){p.stationeryVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.stationeryFloorY-p.stationeryJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.pose='jump';p.stationeryVelocity=188;p.stationeryJump=.01;p.onGround=false}
function draw(c,cam){c.save();c.fillStyle='#bbb6ad';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),0,WIDTH,HEIGHT)}c.restore();return true}
function front(c,a){if(!ready||a.floor>=FRONT-.1)return;c.save();c.beginPath();for(const poly of frontLayers){poly.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath()}c.clip();c.imageSmoothingEnabled=false;c.drawImage(im,0,0,WIDTH,HEIGHT);c.restore()}
function actor(c,a,p,t){c.save();c.fillStyle='#35404a28';c.beginPath();c.ellipse(a.x,a.floor+.6,14,2.1,0,0,Math.PI*2);c.fill();c.translate(Math.round(a.x),Math.round(a.y));c.scale(ACTOR_SCALE,ACTOR_SCALE);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand'),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,a.id,a.held);c.restore()}
function keeper(c,t){if(!ready)return;c.save();c.beginPath();c.rect(1120*SX,250*SY,140*SX,(529-250)*SY);c.clip();c.translate(1190*SX,FRONT);c.scale(ACTOR_SCALE,ACTOR_SCALE);w.CHARART?.drawNPC(c,'npc_shopkeeper',0,0,1,Math.floor(t/5)%2?'work':'idle');c.restore()}
function label(c,a){if(!a.name)return;c.save();c.textAlign='center';c.font='bold 9px sans-serif';const width=Math.min(95,Math.max(28,a.name.length*8+12)),ny=a.y-ACTOR_HEIGHT-15;c.fillStyle='#20374bcc';c.fillRect(a.x-width/2,ny-12,width,13);c.fillStyle='#fff2d5';c.fillText(a.name,a.x,ny-1);if(a.bubble&&performance.now()<a.bubbleUntil){const bw=Math.min(205,Math.max(37,a.bubble.length*8+13));c.fillStyle='#fff9e8';c.fillRect(a.x-bw/2,ny-41,bw,22);c.fillStyle='#23394a';c.font='9px sans-serif';c.fillText(a.bubble,a.x,ny-26)}c.restore()}
function render(c,p,t){keeper(c,t);const actors=[{x:p.x,y:p.y,floor:p.stationeryFloorY,self:true}];for(const a of w.A25NET?.drawPeers||w.A25NET?.peers||[])if(a.scene==='stationery'){if(a.pose!=='jump')peerFloors.set(a.id,a.y);actors.push({...a,floor:a.pose==='jump'?(peerFloors.get(a.id)??project(a.x,a.y).y):a.y})}actors.sort((a,b)=>a.floor-b.floor);for(const a of actors){actor(c,a,p,t);front(c,a)}for(const a of actors)if(!a.self)label(c,a)}
function spot(type,x,y,r,title,txt=''){return{type,x:x*SX,y:y*SY,r,title,txt,icon:type==='exit'?'↶':'·'}}
function hotspots(){return[
 spot('exit',105,722,24,'별빛문구 밖으로 나가기'),
 spot('routeNote',505,630,20,'문구 선반 안쪽 구석','공책 선반 사이로 들어오니 작은 준비물과 미술 재료가 안쪽까지 놓여 있다.'),
 spot('routeNote',1720,629,19,'완구 선반 안쪽 구석','선반 옆면을 따라 안쪽에도 작은 모형 상자와 장난감이 진열되어 있다.'),
 spot('routeNote',840,727,24,'필기구 유리 진열장','낮은 유리장 안에 지우개와 샤프심, 작은 필통과 준비물이 나뉘어 담겨 있다.'),
 spot('shop',1205,726,24,'문방구 과자 고르기'),
 spot('routeNote',1300,725,23,'문구점 계산대','작은 계산대에 물건을 올려놓고 동전을 꺼낸다.'),
 spot('arcade',1850,726,25,'문구점 구석 오락기')
]}
w.StationeryInterior={WIDTH,HEIGHT,ENTRY,ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,readyPromise,draw,render,enter,walk,jump,bounds,walkable,front,actor,hotspots,sourcePoint:(x,y)=>({x:x*SX,y:y*SY}),get geometry(){return{width:WIDTH,height:HEIGHT,actorScale:ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,front:FRONT,regions:JSON.parse(JSON.stringify(regions))}},get ready(){return ready}};
})(window);
