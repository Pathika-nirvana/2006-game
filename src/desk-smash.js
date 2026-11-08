/* A89: 바탕화면 부수기. 가상 컴퓨터 화면 위에 투명한 층을 덮고, 고른 도구로 금, 구멍, 그을음, 구덩이, 물감, 절단선을 그린다.
   그림 파일과 소리는 쓰지 않는다. 나가기를 누르면 모두 원래대로 돌아온다. 게임 안 컴퓨터 화면에서만 동작한다. */
(function(w){'use strict';
const TOOLS=[['hammer','망치'],['gun','권총'],['flame','화염방사기'],['bomb','폭탄'],['paint','물감총'],['saw','전기톱']];
const RADIUS={hammer:62,gun:20,flame:46,bomb:150,paint:58,saw:24},GX=32,GY=20;
const PAINT=['#e8352b','#f5a31a','#f2e228','#35b24a','#2b8fe0','#8a4bd2','#e954a8'];
const rnd=(a,b)=>a+Math.random()*(b-a);
let cur=null;

function crack(g,x,y,k){
 const halo=g.createRadialGradient(x,y,0,x,y,30*k);halo.addColorStop(0,'rgba(255,255,255,.9)');halo.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=halo;g.beginPath();g.arc(x,y,30*k,0,7);g.fill();
 g.lineCap='round';g.lineJoin='round';const n=8+Math.floor(Math.random()*6);
 for(let i=0;i<n;i++){let a=i/n*Math.PI*2+rnd(-.2,.2),px=x,py=y;const len=rnd(70,160)*k,steps=6+Math.floor(Math.random()*4),pts=[[px,py]];
  for(let s=0;s<steps;s++){a+=rnd(-.4,.4);px+=Math.cos(a)*len/steps;py+=Math.sin(a)*len/steps;pts.push([px,py])}
  for(const [col,wd,off] of [['rgba(255,255,255,.75)',2.4,1],['rgba(15,15,25,.9)',1.4,0]]){g.strokeStyle=col;g.lineWidth=wd;g.beginPath();pts.forEach(([a1,b1],j)=>{j?g.lineTo(a1+off,b1+off):g.moveTo(a1+off,b1+off)});g.stroke()}
  if(i%2===0){const [bx,by]=pts[Math.min(3,pts.length-1)],ba=a+rnd(-1,1);g.strokeStyle='rgba(15,15,25,.8)';g.lineWidth=1;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(ba)*len*.35,by+Math.sin(ba)*len*.35);g.stroke()}}
 g.strokeStyle='rgba(15,15,25,.7)';g.lineWidth=1.2;for(let r=1;r<=2;r++){g.beginPath();for(let i=0;i<=9;i++){const a=i/9*Math.PI*2,rr=(18+r*20)*k*rnd(.85,1.15);i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.stroke()}}
function hole(g,x,y){
 g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(x,y,10,0,7);g.fill();g.fillStyle='rgba(30,30,36,.95)';g.beginPath();g.arc(x,y,5,0,7);g.fill();
 g.strokeStyle='rgba(20,20,28,.85)';g.lineWidth=1.1;g.lineCap='round';for(let i=0;i<7;i++){const a=rnd(0,Math.PI*2),l=rnd(12,34);g.beginPath();g.moveTo(x+Math.cos(a)*6,y+Math.sin(a)*6);g.lineTo(x+Math.cos(a+rnd(-.2,.2))*l,y+Math.sin(a+rnd(-.2,.2))*l);g.stroke()}}
function soot(g,x,y){
 const gr=g.createRadialGradient(x,y,0,x,y,rnd(26,40));gr.addColorStop(0,'rgba(8,6,4,.55)');gr.addColorStop(.6,'rgba(30,18,8,.28)');gr.addColorStop(1,'rgba(30,18,8,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,42,0,7);g.fill()}
function crater(g,x,y){
 const scorch=g.createRadialGradient(x,y,10,x,y,180);scorch.addColorStop(0,'rgba(10,8,6,.8)');scorch.addColorStop(.5,'rgba(50,30,14,.45)');scorch.addColorStop(1,'rgba(50,30,14,0)');g.fillStyle=scorch;g.beginPath();g.arc(x,y,180,0,7);g.fill();
 g.fillStyle='rgba(5,5,6,.92)';g.beginPath();const n=18;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=rnd(46,80);i?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fill();
 crack(g,x,y,1.8)}
function splat(g,x,y){
 const col=PAINT[Math.floor(Math.random()*PAINT.length)];g.fillStyle=col;g.globalAlpha=.88;g.beginPath();g.arc(x,y,rnd(16,28),0,7);g.fill();
 for(let i=0;i<10;i++){const a=rnd(0,Math.PI*2),d=rnd(24,68);g.beginPath();g.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,rnd(2,8),0,7);g.fill()}g.globalAlpha=1}
function cut(g,x1,y1,x2,y2){g.lineCap='round';g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=7;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle='rgba(10,10,14,.95)';g.lineWidth=4;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}

function open(ctx){
 const {desk,E,B}=ctx;if(!desk)return null;if(cur)return cur;
 const layer=E('div','ds-layer'),base=E('canvas','ds-base'),fx=E('canvas','ds-fx'),panel=E('div','ds-panel'),msg=E('p','ds-msg','도구를 고르고 바탕화면을 마음껏 부숴 보세요. 나가기를 누르면 모두 원래대로 돌아와요.');
 layer.setAttribute('role','dialog');layer.setAttribute('aria-label','바탕화면 부수기');layer.tabIndex=0;
 const rect=desk.getBoundingClientRect?desk.getBoundingClientRect():{width:0,height:0},W=Math.max(320,Math.round(rect.width||desk.clientWidth||800)),H=Math.max(240,Math.round(rect.height||desk.clientHeight||500));
 for(const c of [base,fx]){c.width=W;c.height=H}
 const g=base.getContext?base.getContext('2d'):null,fg=fx.getContext?fx.getContext('2d'):null;
 let tool='hammer',hits=0,down=false,last=null,raf=0,closed=false,flash=0,done=false;const grid=new Uint8Array(GX*GY),timers=[],sparks=[],buttons=[];
 const percentEl=E('strong','ds-percent','파괴율 0%');
 const mark=(x,y,r)=>{const cw=W/GX,ch=H/GY;for(let gy=Math.max(0,Math.floor((y-r)/ch));gy<=Math.min(GY-1,Math.floor((y+r)/ch));gy++)for(let gx=Math.max(0,Math.floor((x-r)/cw));gx<=Math.min(GX-1,Math.floor((x+r)/cw));gx++){const cx=(gx+.5)*cw,cy=(gy+.5)*ch;if(Math.hypot(cx-x,cy-y)<=r+Math.min(cw,ch)*.5)grid[gy*GX+gx]=1}};
 const cells=()=>{let n=0;for(const v of grid)n+=v;return n},percent=()=>Math.min(100,Math.round(cells()/grid.length*100));
 const refresh=()=>{const p=percent();percentEl.textContent='파괴율 '+p+'%';if(p>=100&&!done){done=true;msg.hidden=false;msg.textContent='바탕화면이 완전히 박살 났어요! 원상복구를 누르면 처음으로 돌아가요.'}};
 const shake=big=>{desk.classList.remove('ds-shake-s','ds-shake-l');void desk.offsetWidth;desk.classList.add(big?'ds-shake-l':'ds-shake-s');timers.push(w.setTimeout(()=>desk.classList.remove('ds-shake-s','ds-shake-l'),big?520:260))};
 const loop=()=>{raf=0;if(closed||!fg)return;fg.clearRect(0,0,W,H);let alive=false;
  if(flash>0){fg.fillStyle='rgba(255,255,230,'+Math.min(.9,flash)+')';fg.fillRect(0,0,W,H);flash-=.07;alive=true}
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.life-=.06;if(s.life<=0){sparks.splice(i,1);continue}s.x+=s.vx;s.y+=s.vy;fg.fillStyle=s.color+Math.max(0,s.life)+')';fg.beginPath();fg.arc(s.x,s.y,s.r*s.life+.5,0,7);fg.fill();alive=true}
  if(alive&&w.requestAnimationFrame)raf=w.requestAnimationFrame(loop)};
 const kick=()=>{if(!raf&&w.requestAnimationFrame&&fg)raf=w.requestAnimationFrame(loop)};
 const spark=(x,y,n,color)=>{for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),v=rnd(1,4);sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.6,r:rnd(2,5),life:1,color})}kick()};
 function hit(t,x,y,x2,y2){
  hits++;mark(x,y,RADIUS[t]);msg.hidden=true;
  if(t==='saw'&&x2!==undefined){const steps=Math.max(1,Math.ceil(Math.hypot(x2-x,y2-y)/12));for(let i=1;i<=steps;i++)mark(x+(x2-x)*i/steps,y+(y2-y)*i/steps,RADIUS.saw)}
  if(g){g.save();
   if(t==='hammer')crack(g,x,y,1);else if(t==='gun')hole(g,x,y);else if(t==='flame')soot(g,x,y);else if(t==='bomb')crater(g,x,y);else if(t==='paint')splat(g,x,y);else if(t==='saw')cut(g,x,y,x2===undefined?x+1:x2,y2===undefined?y:y2);
   g.restore()}
  if(t==='hammer'){shake(false);spark(x,y,6,'rgba(255,255,255,')}else if(t==='gun')spark(x,y,4,'rgba(255,220,120,');else if(t==='flame')spark(x,y,2,'rgba(255,140,30,');else if(t==='bomb'){shake(true);flash=.9;spark(x,y,22,'rgba(255,170,40,')}else if(t==='saw'&&x2!==undefined)spark(x2,y2,3,'rgba(255,230,120,');
  refresh()}
 const at=e=>{const r=base.getBoundingClientRect?base.getBoundingClientRect():{left:0,top:0,width:W,height:H};return{x:(e.clientX-r.left)*W/(r.width||W),y:(e.clientY-r.top)*H/(r.height||H)}};
 const onDown=e=>{if(e.preventDefault)e.preventDefault();const p=at(e);down=true;last=p;try{fx.setPointerCapture&&fx.setPointerCapture(e.pointerId)}catch(_){}hit(tool,p.x,p.y)};
 const onMove=e=>{if(!down)return;const p=at(e);if(tool==='saw'){hit('saw',last.x,last.y,p.x,p.y);last=p}else if(tool==='flame'||tool==='paint'){if(Math.hypot(p.x-last.x,p.y-last.y)>(tool==='paint'?34:14)){hit(tool,p.x,p.y);last=p}}};
 const onUp=()=>{down=false;last=null};
 fx.addEventListener('pointerdown',onDown);fx.addEventListener('pointermove',onMove);fx.addEventListener('pointerup',onUp);fx.addEventListener('pointercancel',onUp);fx.addEventListener('contextmenu',e=>{if(e.preventDefault)e.preventDefault()});
 const pick=id=>{tool=id;for(const [tid,b] of buttons){b.classList.toggle('on',tid===id);b.setAttribute('aria-pressed',String(tid===id))}};
 for(const [id,label] of TOOLS){const b=B(label,()=>pick(id),'ds-tool');buttons.push([id,b]);panel.append(b)}
 const reset=()=>{if(g)g.clearRect(0,0,W,H);if(fg)fg.clearRect(0,0,W,H);grid.fill(0);sparks.length=0;flash=0;hits=0;done=false;desk.classList.remove('ds-shake-s','ds-shake-l');msg.hidden=false;msg.textContent='원래대로 돌려놨어요. 다시 마음껏 부숴 보세요.';refresh()};
 panel.append(percentEl,B('원상복구',reset,'ds-act'),B('나가기',()=>close(),'ds-act ds-exit'));
 const key=e=>{if(e.key==='Escape'){e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();close();return}const n=Number.parseInt(e.key,10);if(n>=1&&n<=TOOLS.length){e.stopPropagation&&e.stopPropagation();pick(TOOLS[n-1][0])}};
 layer.addEventListener('keydown',key);
 layer.append(base,fx,panel,msg);desk.append(layer);pick('hammer');layer.focus&&layer.focus({preventScroll:true});
 function close(){if(closed)return;closed=true;if(raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(raf);for(const t of timers)w.clearTimeout(t);desk.classList.remove('ds-shake-s','ds-shake-l');layer.remove();if(cur===api)cur=null}
 const api={close,reset,hit,pick,percent,state:()=>({open:!closed,tool,hits,percent:percent(),cells:cells(),size:{w:W,h:H},canvas:!!g}),layer,tools:TOOLS.map(t=>t[0]),radius:RADIUS};
 cur=api;return api}
w.DeskSmash={open,close(){if(cur)cur.close()},state(){return cur?cur.state():{open:false}},tools:TOOLS.map(t=>({id:t[0],label:t[1]}))};
})(window);
