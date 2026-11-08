/* A91: 공포 사이트의 귀신 얼굴과 귀여운 고양이 그림.
   A92: 귀신 얼굴 여섯 장은 사용자가 그려 온 그림(assets/pc-desktop/ghost/ghost-sheet.webp 한 장에 격자로 들어 있음)을
   원본 그대로 두고 칸마다 잘라서 보여 준다. 그림을 못 불러오면 A91의 코드로 그린 얼굴이 대신 나온다.
   놀래키는 화면은 번쩍이지 않고 한 번 커지며 나타난다. 움직임을 줄이는 설정을 쓰면 흔들림 없이 바로 나타난다.
   소리: 놀라는 순간 jump1.mp3가 나오고, 그 소리가 끝나면 얼굴에 맞는 흐느끼는 소리가 이어진다.
   소리는 게임의 효과음 켜기와 끄기, 음량 설정을 그대로 따른다. */
(function(w){'use strict';
const KINDS=['half','child','scream','cracked','blood','grin'];
const DIR='assets/pc-desktop/ghost/',SHEET=DIR+'ghost-sheet.webp?v=A92';
/* 격자 한 칸마다 [왼쪽, 위, 너비, 높이]. 칸 사이의 검은 구분선 안쪽으로 3픽셀 들어간 자리다. */
const RECTS=[[3,3,491,514],[505,3,490,514],[1007,3,490,514],[3,529,491,517],[505,529,490,517],[1007,529,490,517]];
const SOB_GROUP={half:'child',child:'child',cracked:'child',scream:'female',blood:'female',grin:'female'};
const SOB_COUNT=3;
const rng=seed=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}};
const ell=(g,x,y,rx,ry,rot)=>{g.beginPath();g.ellipse(x,y,Math.max(.5,rx),Math.max(.5,ry),rot||0,0,6.2832);g.fill()};
const tri=(g,a,b,c,d,e,f)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.closePath();g.fill()};
function ghost(g,W,H,kind,seed){
 const R=rng(seed||7),cx=W/2,m=Math.min(W,H);let cy=H*.47,fw=m*.30,fh=m*.40;
 if(kind==='child'){fw=m*.24;fh=m*.27;cy=H*.54}if(kind==='scream'){fw=m*.25;fh=m*.45}
 g.fillStyle='#030403';g.fillRect(0,0,W,H);
 const bg=g.createRadialGradient(cx,cy,m*.05,cx,cy,m*.8);bg.addColorStop(0,'#3b4538');bg.addColorStop(.55,'#111511');bg.addColorStop(1,'#000');g.fillStyle=bg;g.fillRect(0,0,W,H);
 if(kind!=='scream'&&kind!=='grin'){g.fillStyle='#040404';g.beginPath();g.moveTo(cx-fw*1.45,H+10);g.bezierCurveTo(cx-fw*2,cy+fh*.2,cx-fw*1.6,cy-fh*1.3,cx,cy-fh*1.2);g.bezierCurveTo(cx+fw*1.6,cy-fh*1.3,cx+fw*2,cy+fh*.2,cx+fw*1.45,H+10);g.closePath();g.fill()}
 g.fillStyle='#0b0c0b';g.fillRect(cx-fw*.34,cy+fh*.8,fw*.68,H);
 const fg=g.createRadialGradient(cx-fw*.15,cy-fh*.25,fw*.1,cx,cy,fh*1.12);fg.addColorStop(0,'#e6e8dc');fg.addColorStop(.6,'#b7bbab');fg.addColorStop(1,'#464b41');g.fillStyle=fg;ell(g,cx,cy,fw,fh);
 g.fillStyle='rgba(20,24,18,.28)';ell(g,cx,cy+fh*.72,fw*.8,fh*.3);
 const sock=(x,y,rx,ry,rot)=>{g.fillStyle='#050505';ell(g,x,y,rx,ry,rot||0);g.fillStyle='rgba(0,0,0,.35)';ell(g,x,y,rx*1.25,ry*1.2,rot||0)};
 const eye=(x,y,rx,ry,iris)=>{sock(x,y,rx*1.2,ry*1.25);g.fillStyle='#f1f1e6';ell(g,x,y,rx,ry);g.fillStyle='#0a0a0a';ell(g,x+rx*.1,y,iris,iris);g.fillStyle='rgba(150,20,20,.55)';g.lineWidth=1;for(let i=0;i<6;i++){g.strokeStyle='rgba(150,20,20,.6)';g.beginPath();g.moveTo(x+Math.cos(i)*rx*.95,y+Math.sin(i)*ry*.95);g.lineTo(x+Math.cos(i)*rx*.45,y+Math.sin(i)*ry*.4);g.stroke()}};
 const nose=()=>{g.fillStyle='rgba(30,30,24,.5)';ell(g,cx-fw*.1,cy+fh*.2,fw*.045,fw*.06);ell(g,cx+fw*.1,cy+fh*.2,fw*.045,fw*.06)};
 const strands=(n,left,len)=>{g.lineCap='round';for(let i=0;i<n;i++){const sx=cx+(left?-fw*(R()*1.5):(R()-.5)*fw*2.2),sy=cy-fh*(1.05+R()*.1);g.strokeStyle='rgba(2,2,2,'+(.75+R()*.25)+')';g.lineWidth=2+R()*4;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx+(R()-.5)*fw*.8,cy+(R()-.3)*fh*.6,sx+(R()-.5)*fw*.9,cy+fh*len*(.5+R()*.6));g.stroke()}};
 if(kind==='long'){
  eye(cx+fw*.4,cy-fh*.1,fw*.28,fw*.2,fw*.08);nose();
  g.strokeStyle='#241414';g.lineWidth=3;g.beginPath();g.moveTo(cx-fw*.35,cy+fh*.5);g.quadraticCurveTo(cx+fw*.1,cy+fh*.62,cx+fw*.75,cy+fh*.45);g.stroke();
  g.fillStyle='#030303';g.beginPath();g.moveTo(cx-fw*1.1,cy-fh*1.1);g.bezierCurveTo(cx+fw*.2,cy-fh*1.25,cx+fw*.3,cy-fh*.3,cx+fw*.05,cy+fh*.15);g.bezierCurveTo(cx-fw*.1,cy+fh*.7,cx-fw*.7,cy+fh*1.1,cx-fw*1.2,cy+fh*1.2);g.closePath();g.fill();strands(34,true,1.2)}
 else if(kind==='child'){
  g.fillStyle='rgba(120,128,120,.35)';ell(g,cx,cy+fh*.3,fw*.9,fh*.5);sock(cx-fw*.42,cy-fh*.05,fw*.3,fw*.4,-.1);sock(cx+fw*.42,cy-fh*.05,fw*.3,fw*.4,.1);nose();
  g.strokeStyle='#120808';g.lineWidth=3;g.beginPath();g.moveTo(cx-fw*.55,cy+fh*.48);g.quadraticCurveTo(cx,cy+fh*.82,cx+fw*.55,cy+fh*.48);g.stroke();
  g.fillStyle='#050505';g.beginPath();g.moveTo(cx-fw*1.02,cy-fh*.2);g.quadraticCurveTo(cx,cy-fh*1.45,cx+fw*1.02,cy-fh*.2);g.quadraticCurveTo(cx+fw*.5,cy-fh*.62,cx,cy-fh*.55);g.quadraticCurveTo(cx-fw*.5,cy-fh*.62,cx-fw*1.02,cy-fh*.2);g.fill()}
 else if(kind==='scream'){
  sock(cx-fw*.42,cy-fh*.25,fw*.2,fw*.36,.25);sock(cx+fw*.42,cy-fh*.25,fw*.2,fw*.36,-.25);nose();
  const mg=g.createRadialGradient(cx,cy+fh*.45,2,cx,cy+fh*.45,fh*.4);mg.addColorStop(0,'#000');mg.addColorStop(1,'#2a0c0c');g.fillStyle=mg;ell(g,cx,cy+fh*.48,fw*.38,fh*.36);
  g.fillStyle='rgba(235,235,220,.85)';tri(g,cx-fw*.2,cy+fh*.14,cx-fw*.1,cy+fh*.14,cx-fw*.15,cy+fh*.26);tri(g,cx+fw*.1,cy+fh*.14,cx+fw*.2,cy+fh*.14,cx+fw*.15,cy+fh*.26);
  g.strokeStyle='rgba(0,0,0,.75)';g.lineWidth=3;for(let i=0;i<9;i++){const sx=cx+(i-4)*fw*.28;g.beginPath();g.moveTo(sx,cy-fh*1.05);g.quadraticCurveTo(sx+(R()-.5)*fw*.6,cy-fh*.5,sx+(R()-.5)*fw*.3,cy-fh*.1);g.stroke()}}
 else if(kind==='cracked'){
  sock(cx-fw*.42,cy-fh*.12,fw*.3,fw*.34,.1);eye(cx+fw*.4,cy-fh*.1,fw*.17,fw*.12,fw*.03);nose();
  g.strokeStyle='rgba(8,8,8,.85)';g.lineWidth=2;for(let i=0;i<11;i++){let x=cx+(R()-.5)*fw*.5,y=cy-fh*.1;g.beginPath();g.moveTo(x,y);for(let s=0;s<6;s++){x+=(R()-.5)*fw*.35;y+=(R()-.35)*fh*.3;g.lineTo(x,y)}g.stroke()}
  g.strokeStyle='#150b0b';g.lineWidth=3;g.beginPath();g.moveTo(cx-fw*.5,cy+fh*.5);g.lineTo(cx+fw*.5,cy+fh*.5);g.stroke();for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(cx+i*fw*.12,cy+fh*.42);g.lineTo(cx+i*fw*.12,cy+fh*.58);g.stroke()}
  strands(16,false,.9)}
 else if(kind==='blood'){
  sock(cx-fw*.4,cy-fh*.1,fw*.26,fw*.3,.1);sock(cx+fw*.4,cy-fh*.1,fw*.26,fw*.3,-.1);nose();
  for(let i=0;i<9;i++){const x=cx+(i<5?-fw*.4:fw*.4)+(R()-.5)*fw*.3;g.strokeStyle='rgba('+(110+Math.floor(R()*50))+',6,6,.9)';g.lineWidth=2+R()*4;g.beginPath();g.moveTo(x,cy+fh*.02);g.bezierCurveTo(x+(R()-.5)*fw*.3,cy+fh*.3,x+(R()-.5)*fw*.3,cy+fh*.6,x+(R()-.5)*fw*.2,cy+fh*(.75+R()*.35));g.stroke()}
  g.fillStyle='#1a0505';ell(g,cx,cy+fh*.52,fw*.3,fh*.08);g.fillStyle='rgba(120,6,6,.9)';ell(g,cx,cy+fh*.58,fw*.12,fh*.12);strands(26,false,1.1)}
 else{
  g.fillStyle='#050505';g.beginPath();g.moveTo(cx-fw*.7,cy-fh*.12);g.quadraticCurveTo(cx-fw*.4,cy-fh*.3,cx-fw*.15,cy-fh*.08);g.quadraticCurveTo(cx-fw*.4,cy-fh*.0,cx-fw*.7,cy-fh*.12);g.fill();g.beginPath();g.moveTo(cx+fw*.7,cy-fh*.12);g.quadraticCurveTo(cx+fw*.4,cy-fh*.3,cx+fw*.15,cy-fh*.08);g.quadraticCurveTo(cx+fw*.4,cy-fh*.0,cx+fw*.7,cy-fh*.12);g.fill();
  g.fillStyle='#f1f1e6';ell(g,cx-fw*.4,cy-fh*.1,fw*.07,fw*.04);ell(g,cx+fw*.4,cy-fh*.1,fw*.07,fw*.04);nose();
  g.fillStyle='#120505';g.beginPath();g.moveTo(cx-fw*.95,cy+fh*.25);g.quadraticCurveTo(cx,cy+fh*1.15,cx+fw*.95,cy+fh*.25);g.quadraticCurveTo(cx,cy+fh*.45,cx-fw*.95,cy+fh*.25);g.fill();
  g.fillStyle='#ecece0';for(let i=0;i<13;i++){const t=i/12,x=cx-fw*.85+t*fw*1.7,y=cy+fh*(.3+Math.sin(t*3.14159)*.34);tri(g,x-fw*.05,y-fh*.04,x+fw*.05,y-fh*.04,x,y+fh*.07)}
  strands(14,false,.8)}
 g.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<500;i++)g.fillRect(R()*W,R()*H,1+R()*2,1);
 g.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<H;y+=3)g.fillRect(0,y,W,1);
 const vg=g.createRadialGradient(cx,H*.5,m*.3,cx,H*.5,m*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.85)');g.fillStyle=vg;g.fillRect(0,0,W,H)}
function kitten(g,W,H,i){
 const pal=[['#f6e3c8','#e29a4a','#fff4e4'],['#d7e8f6','#8d949c','#f1f3f5'],['#f9dfe6','#f4f2ec','#ffffff']][i%3],cx=W/2,cy=H*.52,r=Math.min(W,H)*.3;
 g.fillStyle=pal[0];g.fillRect(0,0,W,H);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,H*.78,W,H*.22);
 g.fillStyle=pal[1];tri(g,cx-r*1.0,cy-r*.1,cx-r*.6,cy-r*1.3,cx-r*.05,cy-r*.8);tri(g,cx+r*1.0,cy-r*.1,cx+r*.6,cy-r*1.3,cx+r*.05,cy-r*.8);
 g.fillStyle='#f4b6c2';tri(g,cx-r*.82,cy-r*.3,cx-r*.58,cy-r*1.0,cx-r*.27,cy-r*.72);tri(g,cx+r*.82,cy-r*.3,cx+r*.58,cy-r*1.0,cx+r*.27,cy-r*.72);
 g.fillStyle=pal[1];ell(g,cx,cy,r*1.12,r);if(i%3===0){g.strokeStyle='rgba(120,60,10,.55)';g.lineWidth=3;for(let s=-1;s<=1;s++){g.beginPath();g.moveTo(cx+s*r*.25,cy-r*.98);g.lineTo(cx+s*r*.2,cy-r*.55);g.stroke()}}
 g.fillStyle=pal[2];ell(g,cx,cy+r*.36,r*.6,r*.42);g.fillStyle='#262626';ell(g,cx-r*.46,cy-r*.12,r*.14,r*.2);ell(g,cx+r*.46,cy-r*.12,r*.14,r*.2);g.fillStyle='#fff';ell(g,cx-r*.5,cy-r*.2,r*.05,r*.06);ell(g,cx+r*.42,cy-r*.2,r*.05,r*.06);
 g.fillStyle='#e66f8a';tri(g,cx-r*.1,cy+r*.18,cx+r*.1,cy+r*.18,cx,cy+r*.3);
 g.strokeStyle='#5a4a4a';g.lineWidth=2;g.beginPath();g.moveTo(cx,cy+r*.3);g.lineTo(cx,cy+r*.4);g.moveTo(cx,cy+r*.4);g.quadraticCurveTo(cx-r*.16,cy+r*.52,cx-r*.3,cy+r*.4);g.moveTo(cx,cy+r*.4);g.quadraticCurveTo(cx+r*.16,cy+r*.52,cx+r*.3,cy+r*.4);
 for(const s of [-1,1])for(let k=0;k<3;k++){g.moveTo(cx+s*r*.5,cy+r*.3+k*r*.07);g.lineTo(cx+s*r*1.15,cy+r*.18+k*r*.2)}g.stroke();
 if(i%3===1){g.fillStyle='#d94a5a';tri(g,cx-r*.35,cy+r*1.02,cx,cy+r*.9,cx-r*.35,cy+r*1.3);tri(g,cx+r*.35,cy+r*1.02,cx,cy+r*.9,cx+r*.35,cy+r*1.3);ell(g,cx,cy+r*1.02,r*.1,r*.1)}}
/* ---------- 사용자가 그려 온 얼굴 그림 ---------- */
let sheet=null,sheetState='idle';const waiting=[];
function settle(){for(const f of waiting.splice(0)){try{f()}catch(_){}}}
function preload(){
 if(sheetState==='idle'){sheetState='loading';
  try{const Img=w.Image;if(!Img){sheetState='fail'}else{const im=new Img();im.onload=()=>{sheet=im;sheetState='ready';settle()};im.onerror=()=>{sheetState='fail';settle()};im.src=SHEET}}catch(_){sheetState='fail'}}
 warm()}
function photo(g,W,H,kind){
 const i=KINDS.indexOf(kind);if(!sheet||i<0||!g||!g.drawImage)return false;
 const r=RECTS[i];g.fillStyle='#000';g.fillRect(0,0,W,H);
 const k=Math.min(W/r[2],H/r[3]),dw=r[2]*k,dh=r[3]*k;
 try{g.drawImage(sheet,r[0],r[1],r[2],r[3],(W-dw)/2,(H-dh)/2,dw,dh)}catch(_){return false}return true}
function face(g,W,H,kind,seed){
 if(!g)return;if(photo(g,W,H,kind))return;
 if(sheetState==='loading'){g.fillStyle='#000';g.fillRect(0,0,W,H);waiting.push(()=>face(g,W,H,kind,seed));return}
 try{ghost(g,W,H,kind,seed)}catch(_){}}
/* ---------- 소리 ---------- */
let registered=false,sound=null,warmed=false;const lastSob={child:-1,female:-1};
const sobId=(group,i)=>'scare-sob-'+group+'-'+i;
function audio(){
 const A=w.GameAudio;if(!A||typeof A.registerClip!=='function'||typeof A.playCue!=='function')return null;
 if(!registered){registered=true;A.registerClip('scare-jump',DIR+'jump1.mp3?v=A92');for(const gr of ['child','female'])for(let i=1;i<=SOB_COUNT;i++)A.registerClip(sobId(gr,i),DIR+'sob-'+gr+'-'+i+'.mp3?v=A92')}
 return A}
function warm(){
 if(warmed)return;warmed=true;
 try{const Au=w.Audio;if(Au){const a=new Au();a.preload='auto';a.src=DIR+'jump1.mp3?v=A92'}}catch(_){}}
function stopSound(){const s=sound;sound=null;if(s){s.dead=true;try{s.stop()}catch(_){}}}
function playScare(kind){
 stopSound();const A=audio();if(!A)return false;
 const group=SOB_GROUP[kind]||'female',my={dead:false,stop:()=>{}};sound=my;
 const sob=()=>{if(my.dead)return;let i=1+Math.floor(Math.random()*SOB_COUNT);if(i===lastSob[group])i=i%SOB_COUNT+1;lastSob[group]=i;my.stop=A.playCue(sobId(group,i),.85,()=>{my.stop=()=>{}})};
 try{my.stop=A.playCue('scare-jump',1,sob)}catch(_){return false}return true}
let active=null,count=0;
function scare(env,o){
 o=o||{};const desk=env&&env.desk,E=env&&env.E,B=env&&env.B;if(!desk||!E||!B||active)return null;
 const kind=KINDS.includes(o.kind)?o.kind:KINDS[count%KINDS.length];count++;
 const ov=E('div','ws-scare'),cv=E('canvas','ws-scare-cv'),msg=E('p','ws-scare-msg',o.text||''),W=Math.max(320,desk.clientWidth||900),H=Math.max(240,desk.clientHeight||600);
 cv.width=W;cv.height=H;const g=cv.getContext?cv.getContext('2d'):null;preload();if(g)face(g,W,H,kind,o.seed||count*7919+13);
 let dead=false,ready=false;
 const close=()=>{if(dead||!ready)return;dead=true;w.clearTimeout(t);ov.remove();active=null;o.after&&o.after()};
 const btn=B('닫기',close,'ws-scare-x');btn.disabled=true;
 ov.tabIndex=0;ov.setAttribute('role','alertdialog');ov.setAttribute('aria-label','귀신이 나타났습니다');ov.append(cv,msg,btn);desk.append(ov);ov.focus&&ov.focus();playScare(kind);
 const t=w.setTimeout(()=>{ready=true;btn.disabled=false;ov.classList.add('ready')},o.hold===undefined?1300:o.hold);
 ov.addEventListener('keydown',e=>{e.stopPropagation&&e.stopPropagation();e.preventDefault&&e.preventDefault();const k=e.code||e.key;if(k==='Escape'||k==='Enter'||k==='Space')close()});
 ov.addEventListener('pointerdown',e=>{e.stopPropagation&&e.stopPropagation();close()});
 active={node:ov,kind,close:()=>{ready=true;close()},stop:()=>{dead=true;w.clearTimeout(t);ov.remove();active=null}};return active}
function popups(env,n){
 const X=env&&env.X;if(!X||!X.windowFor)return 0;let made=0;
 for(let i=0;i<Math.min(3,n||3);i++){const key='ghostpop-'+i;if(X.windows&&X.windows.has(key))continue;const win=X.windowFor(key,'Microsoft Internet Explorer');win.node.classList.add('xp-small','ws-popwin');win.node.style.width='min(250px,60%)';win.node.style.height='min(250px,60%)';win.node.style.left=(8+i*9)+'%';win.node.style.top=(7+i*8)+'%';
  const cv=env.E('canvas','ws-pop-cv');cv.width=250;cv.height=200;const g=cv.getContext?cv.getContext('2d'):null;preload();if(g)face(g,250,200,KINDS[(i*2+1)%KINDS.length],101+i*31);
  win.content.replaceChildren(cv,env.E('p','ws-pop-text','뒤를 돌아보지 마세요'));made++}
 return made}
const api={KINDS,RECTS,SHEET,ghost,kitten,face,preload,scare,popups,rng,active:()=>active,count:()=>count,sheetState:()=>sheetState,sounding:()=>!!sound,stop(){if(active)active.stop();stopSound()}};
w.WebGhost=api;
})(window);
