/* A76: compact Woori grocery, browse-only inventory, midground aisle and stocked foreground. */
(function(w){'use strict';
const WIDTH=720,HEIGHT=270,SX=WIDTH/2048,SY=HEIGHT/768,ACTOR_SCALE=1.8,ACTOR_HEIGHT=51*ACTOR_SCALE;
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/supermarket/interior.webp'});
const xy=([x,y])=>[x*SX,y*SY];
const regions=[
 {id:'main-aisle',polygon:[[38,620],[2010,620],[2010,695],[38,695]].map(xy)},
 {id:'household-nook',polygon:[[1355,632],[1436,632],[1408,497],[1382,497]].map(xy)}
];
// Foreground display silhouette is redrawn from the native art, not a floor overlay.
const frontLayers=[[[0, 647], [70, 647], [70, 688], [196, 688], [196, 648], [272, 648], [272, 650], [346, 650], [346, 656], [397, 656], [397, 647], [472, 647], [477, 638], [495, 632], [523, 631], [553, 635], [592, 638], [611, 645], [657, 642], [695, 643], [716, 648], [757, 649], [773, 654], [805, 652], [842, 652], [884, 654], [900, 648], [935, 647], [988, 649], [1041, 648], [1076, 650], [1095, 641], [1133, 642], [1164, 648], [1206, 646], [1248, 647], [1284, 649], [1324, 653], [1344, 644], [1380, 643], [1417, 648], [1469, 656], [1504, 665], [1532, 665], [1536, 631], [1544, 626], [1565, 626], [1574, 634], [1587, 646], [1592, 640], [1597, 628], [1617, 628], [1625, 635], [1635, 646], [1655, 650], [1663, 645], [1669, 636], [1688, 636], [1695, 648], [1720, 648], [1724, 638], [1743, 638], [1751, 649], [1770, 650], [1775, 640], [1793, 640], [1798, 651], [1825, 652], [1830, 642], [1848, 642], [1854, 651], [1870, 651], [1874, 641], [1891, 641], [1900, 654], [1933, 654], [1937, 646], [1982, 646], [1986, 657], [2048, 657], [2048, 768], [0, 768]]].map(poly=>poly.map(xy));
const peerFloors=new Map(),ENTRY={x:44,y:229},FRONT=HEIGHT;
function scale(floor){return 1.5+.30*Math.max(0,Math.min(1,(floor-174)/70))}
function onSegment(x,y,a,b){const cross=(x-a[0])*(b[1]-a[1])-(y-a[1])*(b[0]-a[0]);return Math.abs(cross)<1e-5&&x>=Math.min(a[0],b[0])-1e-6&&x<=Math.max(a[0],b[0])+1e-6&&y>=Math.min(a[1],b[1])-1e-6&&y<=Math.max(a[1],b[1])+1e-6}
function inside(poly,x,y){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[j],b=poly[i];if(onSegment(x,y,a,b))return true;if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes}
function walkable(x,y){return regions.some(r=>inside(r.polygon,x,y))}
function project(x,y){if(walkable(x,y))return{x,y};let best={x:ENTRY.x,y:ENTRY.y,d:Infinity};for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),xx=a[0]+dx*t,yy=a[1]+dy*t,d=Math.hypot(xx-x,yy-y);if(d<best.d)best={x:xx,y:yy,d}}return best}
function bounds(x){const ys=[];for(const r of regions)for(let i=0;i<r.polygon.length;i++){const a=r.polygon[i],b=r.polygon[(i+1)%r.polygon.length];if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0]))continue;if(a[0]===b[0])ys.push(a[1],b[1]);else ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))}return{top:Math.min(...ys),bottom:Math.max(...ys)}}
function enter(p,y=ENTRY.y){const q=project(p.x,y);p.x=q.x;p.superFloorY=q.y;p.superJump=0;p.superVelocity=0;p.y=q.y;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.superFloorY))enter(p);if((h||v)&&['sit','bench'].includes(p.pose))p.pose='stand';const resting=['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');if(resting){p.walking=0;p.y=p.superFloorY;return}const n=Math.hypot(h,v)||1,nx=p.x+h/n*100*dt*(p.dashMultiplier||1);if(walkable(nx,p.superFloorY))p.x=nx;const ny=p.superFloorY+v/n*55*dt*(p.dashMultiplier||1);if(walkable(p.x,ny))p.superFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.superJump>0||p.superVelocity>0){p.superVelocity-=510*dt;p.superJump=Math.max(0,p.superJump+p.superVelocity*dt);if(!p.superJump){p.superVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.superFloorY-p.superJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.pose='jump';p.superVelocity=188;p.superJump=.01;p.onGround=false}
function draw(c,cam){c.save();c.fillStyle='#bbb6ad';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),0,WIDTH,HEIGHT)}c.restore();return true}
function front(c){if(!ready)return;c.save();c.beginPath();for(const poly of frontLayers){poly.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath()}c.clip();c.imageSmoothingEnabled=false;c.drawImage(im,0,0,WIDTH,HEIGHT);c.restore()}
function actor(c,a,p,t){c.save();c.fillStyle='#35404a28';c.beginPath();c.ellipse(a.x,a.floor+.6,14,2.1,0,0,Math.PI*2);c.fill();c.translate(Math.round(a.x),Math.round(a.y));const z=scale(a.floor);c.scale(z,z);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand'),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,a.id,a.held);c.restore()}
function keeper(c,t){if(!ready)return;c.save();c.beginPath();c.rect(95,88,125,63);c.clip();c.translate(185,190);c.scale(1.45,1.45);w.CHARART?.drawNPC(c,'npc_shopkeeper',0,0,1,Math.floor(t/5)%2?'work':'idle');c.restore()}
function label(c,a){if(!a.name)return;c.save();c.textAlign='center';c.font='bold 9px sans-serif';const width=Math.min(95,Math.max(28,a.name.length*8+12)),ny=a.y-51*scale(a.floor)-15;c.fillStyle='#20374bcc';c.fillRect(a.x-width/2,ny-12,width,13);c.fillStyle='#fff2d5';c.fillText(a.name,a.x,ny-1);if(a.bubble&&performance.now()<a.bubbleUntil){const bw=Math.min(205,Math.max(37,a.bubble.length*8+13));c.fillStyle='#fff9e8';c.fillRect(a.x-bw/2,ny-41,bw,22);c.fillStyle='#23394a';c.font='9px sans-serif';c.fillText(a.bubble,a.x,ny-26)}c.restore()}
function render(c,p,t){keeper(c,t);const actors=[{x:p.x,y:p.y,floor:p.superFloorY,self:true}];for(const a of w.A25NET?.drawPeers||w.A25NET?.peers||[])if(a.scene==='supermarket'){if(a.pose!=='jump')peerFloors.set(a.id,a.y);actors.push({...a,floor:a.pose==='jump'?(peerFloors.get(a.id)??project(a.x,a.y).y):a.y})}actors.sort((a,b)=>a.floor-b.floor);for(const a of actors)actor(c,a,p,t);front(c);for(const a of actors)if(!a.self)label(c,a)}
function spot(type,x,y,r,title,txt=''){return{type,x:x*SX,y:y*SY,r,title,txt,icon:type==='exit'?'↶':'·'}}
function hotspots(){return[
 spot('exit',125,652,20,'우리슈퍼 밖으로 나가기'),
 spot('routeNote',496,636,20,'우리슈퍼 계산대','작은 전화기와 계산기, 동전을 담아 두는 접시가 있다. 계산대 옆에는 영수증과 손으로 적은 메모가 붙어 있다.'),
 spot('routeNote',919,644,20,'라면과 과자 진열대','익숙한 봉지과자와 라면, 초코파이가 선반에 빼곡하다. 아래 칸에는 치약과 세제도 함께 놓여 있다.'),
 spot('routeNote',1391,535,18,'생활용품 선반 안쪽','세제와 비누, 휴지와 소스병을 진열한 작은 통로가 가게 안쪽으로 이어진다.'),
 spot('routeNote',1709,638,22,'음료 냉장고','물과 우유, 주스와 탄산음료가 유리문 안에 줄지어 서 있다. 냉장고 모터가 낮게 울린다.'),
 spot('routeNote',1933,645,20,'아이스크림 냉동고','유리 뚜껑 너머로 익숙한 막대 아이스크림들이 보인다.')
]}
w.SupermarketMap={WIDTH,HEIGHT,ENTRY,scale,ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,readyPromise,draw,render,enter,walk,jump,bounds,walkable,front,actor,hotspots,sourcePoint:(x,y)=>({x:x*SX,y:y*SY}),get geometry(){return{width:WIDTH,height:HEIGHT,actorScale:ACTOR_SCALE,actorHeight:ACTOR_HEIGHT,front:FRONT,regions:JSON.parse(JSON.stringify(regions))}},get ready(){return ready}};
})(window);
