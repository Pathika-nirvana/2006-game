/* A63: a small residential lane behind Eunha snack / stationery. */
(function(w){'use strict';
const WIDTH=720,im=new w.Image();let ready=false;
const readyPromise=new Promise(resolve=>{im.onload=()=>{ready=true;resolve(true)};im.onerror=()=>resolve(false);im.src='assets/maps/back-alley/interior.webp'});
// Floor coordinates are independent of jump height. Keep feet off doorsteps and wall clutter.
const edge=[[18,256],[52,250],[108,238],[172,229],[248,227],[283,203],[312,190],[335,225],[448,228],[552,229],[648,233],[702,246]];
function bounds(x){let top=edge[edge.length-1][1];for(let i=1;i<edge.length;i++)if(x<=edge[i][0]){const a=edge[i-1],b=edge[i],t=Math.max(0,(x-a[0])/(b[0]-a[0]));top=a[1]+(b[1]-a[1])*t;break}return{top,bottom:264}}
function enter(p,y=255){const b=bounds(p.x);p.alleyFloorY=Math.max(b.top,Math.min(b.bottom,y));p.alleyJump=0;p.alleyVelocity=0;p.y=p.alleyFloorY;p.vy=0;p.onGround=true}
function walk(p,h,v,dt){if(!Number.isFinite(p.alleyFloorY))enter(p);const n=Math.hypot(h,v)||1;p.x=Math.max(18,Math.min(WIDTH-18,p.x+h/n*91*dt));const b=bounds(p.x);p.alleyFloorY=Math.max(b.top,Math.min(b.bottom,p.alleyFloorY+v/n*63*dt));if(h)p.dir=h>0?1:0;p.walking=h||v?p.walking+dt*11:0;if(p.alleyJump>0||p.alleyVelocity>0){p.alleyVelocity-=510*dt;p.alleyJump=Math.max(0,p.alleyJump+p.alleyVelocity*dt);if(!p.alleyJump){p.alleyVelocity=0;p.onGround=true;p.pose='stand'}else{p.onGround=false;p.pose='jump'}}p.y=p.alleyFloorY-p.alleyJump;p.vy=0}
function jump(p){if(!p.onGround||p.pose==='eat')return;p.alleyVelocity=188;p.alleyJump=.01;p.onGround=false;p.pose='jump'}
function draw(c,cam){c.save();c.fillStyle='#4d5558';c.fillRect(0,0,480,270);if(ready){c.imageSmoothingEnabled=false;c.drawImage(im,-Math.round(cam),-18,WIDTH,288)}c.restore();return true}
function hotspots(){return[
 {type:'routeGate',x:38,y:256,r:24,to:'street',spawn:1197,title:'문구점과 은하분식 사이로 나가기',txt:'골목 입구 너머에서 가게 소리가 들린다.',icon:'↶'},
 {type:'routeNote',x:394,y:232,r:22,title:'벽돌담의 낙서',txt:'락카가 뭉치고 흘러내린 자국. 휘갈긴 선이 벽돌 틈을 가로지른다.',icon:'·'},
 {type:'routeNote',x:366,y:232,r:22,title:'담장 아래 묶은 봉투',txt:'목을 묶은 비닐봉투 옆에 납작한 상자가 놓여 있다. 벽 가장자리에는 담배꽁초와 빈 봉지가 흩어져 있다.',icon:'·'},
 {type:'routeNote',x:580,y:233,r:22,title:'벽에 기대 둔 자재',txt:'남은 벽돌과 잘라 놓은 파이프, 빛바랜 판자. 사람 다니는 길은 비워 두었다.',icon:'·'}
]}
w.BackAlleyMap={WIDTH,readyPromise,enter,walk,jump,draw,bounds,hotspots,get ready(){return ready}};
})(window);
