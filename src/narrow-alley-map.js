/* A75: residential passage reached through the gap in the existing back lane. */
(function(w){'use strict';
const WIDTH=720,HEIGHT=270,ENTRY={x:66,y:244},SCENE='hidden_alley';
const im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/narrow-alley/interior.webp'});
// The rear edge follows door thresholds, sacks and masonry. The clear strip is continuous.
const edge=[[44,236],[72,230],[114,226],[150,229],[234,227],[308,225],[380,228],[420,226],[448,222],[500,224],[550,228],[590,226],[638,231],[686,242]];
function bounds(x){let top=edge[0][1];for(let i=1;i<edge.length;i++){if(x<=edge[i][0]){const a=edge[i-1],b=edge[i];top=a[1]+Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])))*(b[1]-a[1]);break}top=edge[i][1]}return{top,bottom:263}}
function walkable(x,y){const b=bounds(x);return x>=44&&x<=686&&y>=b.top-.001&&y<=b.bottom+.001}
function enter(p,y=ENTRY.y){p.x=Math.max(44,Math.min(686,p.x));const b=bounds(p.x);p.narrowFloorY=Math.max(b.top,Math.min(b.bottom,y));p.narrowJump=0;p.narrowVelocity=0;p.y=p.narrowFloorY;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.narrowFloorY))enter(p);if((h||v)&&['sit','bench'].includes(p.pose))p.pose='stand';const rest=['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand');if(rest){p.walking=0;p.y=p.narrowFloorY;return}const n=Math.hypot(h,v)||1,nx=p.x+h/n*84*dt*(p.dashMultiplier||1),ny=p.narrowFloorY+v/n*49*dt*(p.dashMultiplier||1);if(walkable(nx,p.narrowFloorY))p.x=nx;if(walkable(p.x,ny))p.narrowFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.narrowJump>0||p.narrowVelocity>0){p.narrowVelocity-=510*dt;p.narrowJump=Math.max(0,p.narrowJump+p.narrowVelocity*dt);if(!p.narrowJump){p.narrowVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.narrowFloorY-p.narrowJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.narrowJump=.01;p.narrowVelocity=188;p.onGround=false;p.pose='jump'}
function scale(floor){return 1.65+.25*Math.max(0,Math.min(1,(floor-222)/41))}
function draw(c,cam){c.save();c.fillStyle='#555651';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),0,WIDTH,HEIGHT)}c.restore();return true}
function front(c){if(!ready)return;c.save();c.beginPath();c.moveTo(0,225);c.lineTo(23,229);c.lineTo(38,240);c.lineTo(37,270);c.lineTo(0,270);c.closePath();c.moveTo(720,219);c.lineTo(694,223);c.lineTo(671,239);c.lineTo(670,270);c.lineTo(720,270);c.closePath();c.clip();c.imageSmoothingEnabled=false;c.drawImage(im,0,0,WIDTH,HEIGHT);c.restore()}
const peerFloors=new Map();
function render(c,p,t){const actors=(w.A25NET?.drawPeers||[]).filter(a=>a.scene===SCENE).map(a=>{const floor=a.pose==='jump'?(peerFloors.get(a.id)??ENTRY.y):a.y;if(a.pose!=='jump')peerFloors.set(a.id,floor);return{...a,floor}}),ids=new Set(actors.map(a=>a.id));for(const id of peerFloors.keys())if(!ids.has(id))peerFloors.delete(id);actors.push({...p,floor:p.narrowFloorY??p.y,self:true});w.BossEncounter?.drawFloor(c);w.BossEncounter?.draw(c,p.narrowFloorY,false);actors.sort((a,b)=>a.floor-b.floor);for(const a of actors){const s=scale(a.floor);c.save();c.fillStyle='#26332d36';c.beginPath();c.ellipse(a.x,a.floor,10*s,1.6*s,0,0,Math.PI*2);c.fill();c.translate(Math.round(a.x),Math.round(a.y));c.scale(s,s);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose)||(p.pose==='eat'&&p.eatRestore!=='stand'),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,'narrow-'+a.id,a.held);c.restore()}
w.BossEncounter?.draw(c,p.narrowFloorY,true);front(c);w.BossEncounter?.drawIndicators(c,p);for(const a of actors){if(a.self)continue;const top=a.y-51*scale(a.floor);c.save();c.font='bold 9px sans-serif';c.textAlign='center';c.fillStyle='#fff4d8';c.fillText(a.name||'친구',a.x,top-8);if(a.bubble&&performance.now()<a.bubbleUntil){const message=a.bubble.slice(0,24),width=Math.min(205,Math.max(37,message.length*8+13));c.fillStyle='#fff9e8';c.fillRect(a.x-width/2,top-43,width,22);c.fillStyle='#23394a';c.fillText(message,a.x,top-28)}c.restore()}}
function hotspots(){return[
{type:'routeGate',x:668,y:252,r:19,to:'alley_d1',spawn:58,spawnY:249,title:'빗물 고인 첫 골목으로',icon:'↗'},
{type:'routeGate',x:66,y:244,r:22,to:'back_alley',spawn:312,spawnY:202,title:'들어왔던 주택 골목으로',txt:'좁은 틈 너머로 아까 지나온 대문과 전봇대가 보인다.',icon:'↶'},
{type:'routeNote',x:211,y:235,r:20,title:'담장 밑 묶인 봉투와 폐지',txt:'목을 질끈 묶은 검은 봉투와 빛바랜 흰 봉투. 접어 묶은 상자 옆으로 구겨진 과자 봉지가 밀려 있다.',icon:'·'},
{type:'routeNote',x:431,y:232,r:19,title:'벽에 휘갈긴 락카 자국',txt:'벽면에 짧고 서툰 낙서가 겹쳐 있다. 붉은 락카가 흘러내린 아래로 검은 선을 그어 놓았다.',icon:'·'},
{type:'routeNote',x:497,y:235,r:19,title:'그늘진 뒷문 앞 작은 턱',txt:'뒤집힌 플라스틱 상자와 종이컵이 놓여 있다. 배수구 주변에는 담배꽁초가 유난히 많이 모여 있다.',icon:'·'},
{type:'routeNote',x:581,y:239,r:18,title:'벽 쪽에 모아 둔 자재',txt:'짧게 자른 파이프와 깨진 벽돌이 통로 가장자리에 놓여 있다. 한쪽 벽에 몸을 붙이면 겨우 두 사람이 비켜 갈 만하다.',icon:'·'}
]}
// Authored placement data for later NPC work; no population or combat is enabled here.
const spawnZones=[{id:'rear-door-shade',scene:SCENE,minX:452,maxX:530,minY:232,maxY:249,capacity:2},{id:'drain-wall',scene:SCENE,minX:388,maxX:415,minY:236,maxY:250,capacity:1}];
w.NarrowAlleyMap={WIDTH,HEIGHT,SCENE,ENTRY,readyPromise,bounds,walkable,enter,walk,jump,draw,render,front,scale,hotspots,get spawnZones(){return spawnZones.map(z=>({...z}))},get ready(){return ready}};
})(window);
