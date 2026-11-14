/* A69: compact private yard, entered from the existing green street gate. */
(function(w){'use strict';
const WIDTH=480,HEIGHT=270,ENTRY={x:437,y:259},im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/courtyard/interior.webp'});
const edge=[[102,249],[144,231],[164,222],[223,222],[330,224],[397,238],[438,254],[460,264]];
function bounds(x){let top=edge[0][1];for(let i=1;i<edge.length;i++){if(x<=edge[i][0]){const a=edge[i-1],b=edge[i];top=a[1]+Math.max(0,Math.min(1,(x-a[0])/(b[0]-a[0])))*(b[1]-a[1]);break}top=edge[i][1]}return{top,bottom:266}}
function walkable(x,y){const b=bounds(x);return x>=102&&x<=460&&y>=b.top-.001&&y<=b.bottom+.001}
function enter(p,y=ENTRY.y){p.x=Math.max(102,Math.min(460,p.x));const b=bounds(p.x);p.y=p.yardFloorY=Math.max(b.top,Math.min(b.bottom,y));p.yardJump=0;p.yardVelocity=0;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.yardFloorY))enter(p);const n=Math.hypot(h,v)||1,nx=p.x+h/n*84*dt*(p.dashMultiplier||1),ny=p.yardFloorY+v/n*54*dt*(p.dashMultiplier||1);if(walkable(nx,p.yardFloorY))p.x=nx;if(walkable(p.x,ny))p.yardFloorY=ny;if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.yardJump>0||p.yardVelocity>0){p.yardVelocity-=510*dt;p.yardJump=Math.max(0,p.yardJump+p.yardVelocity*dt);if(!p.yardJump){p.yardVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.yardFloorY-p.yardJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.yardJump=.01;p.yardVelocity=188;p.onGround=false;p.pose='jump'}
function draw(c,phase=0,rain=0,t=0){c.save();c.imageSmoothingEnabled=false;if(ready)c.drawImage(im,0,0,WIDTH,HEIGHT);else{c.fillStyle='#687878';c.fillRect(0,0,WIDTH,HEIGHT)}if(phase===1){c.fillStyle='#c0794720';c.fillRect(0,0,WIDTH,HEIGHT)}if(phase===2){c.fillStyle='#20365388';c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#f6d89928';c.fillRect(173,121,34,75)}if(rain){c.fillStyle='#31495e32';c.fillRect(0,0,WIDTH,HEIGHT);c.fillStyle='#dbe6eb80';for(let i=0;i<40;i++)c.fillRect((i*107+t*39)%480,(i*73+t*145)%270,1,4)}c.restore();return true}
function scale(floor){return 1.3+.9*Math.max(0,Math.min(1,(floor-222)/44))}
const peerFloors=new Map();
function render(c,p,t){const actors=(w.A25NET?.drawPeers||[]).filter(a=>a.scene==='courtyard').map(a=>{const floor=a.pose==='jump'?(peerFloors.get(a.id)??ENTRY.y):a.y;if(a.pose!=='jump')peerFloors.set(a.id,floor);return{...a,floor}});const ids=new Set(actors.map(a=>a.id));for(const id of peerFloors.keys())if(!ids.has(id))peerFloors.delete(id);actors.push({...p,floor:p.yardFloorY??p.y,self:true});actors.sort((a,b)=>a.floor-b.floor);for(const a of actors){const s=scale(a.floor);c.save();c.translate(a.x,a.y);c.scale(s,s);if(a.self){w.WORLD.drawKid(c,0,0,p.dir,p.walking,p.shirt,false,['sit','bench'].includes(p.pose),p.pose);w.SHOPS.renderHeld(c,0,0,p.dir,p.pose,t)}else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,'yard-'+a.id,a.held);c.restore();if(!a.self){c.fillStyle='#fff8df';c.font='9px sans-serif';c.textAlign='center';c.fillText(a.name||'친구',a.x,a.y-51*s-8);c.textAlign='left';if(a.bubble&&a.bubbleUntil>performance.now()/1000){const text=a.bubble.slice(0,24),width=Math.max(40,text.length*8+12),y=a.y-51*s-37;c.fillStyle='#fff6dc';c.fillRect(a.x-width/2,y,width,21);c.fillStyle='#354851';c.fillText(text,a.x-width/2+6,y+14)}}}}
function hotspots(){return[
{type:'resLink',x:439,y:259,r:21,to:'street',spawn:1756,title:'초록 대문으로 나가기',txt:'대문을 열면 들어왔던 주택가 보도로 이어진다.',icon:'↶'},
{type:'routeNote',x:108,y:250,r:18,title:'마당의 수돗가',txt:'콘크리트 물받이 곁에 빨간 고무대야가 놓여 있다. 초록 호스는 벽에 감아 두었고, 수도 아래에는 솔이 하나 놓여 있다.',icon:'·'},
{type:'routeNote',x:136,y:237,r:16,title:'벽에 붙여 놓은 장독',txt:'크기가 다른 갈색 장독을 벽 쪽에 모아 두었다. 사람 다니는 마당 한가운데는 비워 놓았다.',icon:'·'},
{type:'routeNote',x:191,y:225,r:19,title:'집 현관과 고무 슬리퍼',txt:'얕은 현관 턱 위에 파란 슬리퍼와 분홍 슬리퍼가 가지런히 놓여 있다. 창문 안쪽으로 레이스 커튼이 보인다.',icon:'·'},
{type:'routeNote',x:279,y:227,r:20,title:'창문 아래 화분들',txt:'수국 화분과 작은 꽃들이 창문 아래 나란히 놓여 있다. 빗물받이 아래의 배수구로 물이 빠져나간다.',icon:'·'},
{type:'routeNote',x:365,y:239,r:19,title:'접이식 빨래 건조대',txt:'소박한 철제 건조대가 벽 옆에 놓여 있다. 창문 위 발코니에도 빨래를 널 수 있게 봉을 달아 두었다.',icon:'·'}]}
w.CourtyardMap={WIDTH,HEIGHT,ENTRY,readyPromise,bounds,walkable,enter,walk,jump,draw,render,scale,hotspots,get ready(){return ready}};
})(window);
