/* A100 애니콜 슬라이드폰 몸체 (버전 A100 · 2026-11-13 KST)
   A100: 닫힘 거리를 다시 535로(아래판 끝이 살짝 보이는 쪽이 자연스러움). 닫혔을 때 윗판 아래 양 모서리가 뾰족하게 튀어나와
        보이던 것은, 닫힐수록 그 모서리를 둥글게 깎아 그려서 아래판의 둥근 끝과 이어지게 했다(그림 파일은 그대로).
        카메라 조준 틀을 게임 화면 위에 보여 주고, 찍은 사진을 내 컴퓨터 파일로 내려받을 수 있다.
   A99: 닫힘 거리 595(A100에서 되돌림).
        글 쓰는 화면에서는 휴대폰 아래에 자판 입력 칸이 생긴다. 문자와 전화가 오면 진동(흔들림)과 알림.
   - 받은 그림 두 장을 그대로 쓴다: 하판(숫자 키패드, 고정)과 상판(액정과 조작 버튼, 움직임).
   - 그림을 바꿔 끼우지 않는다. 하판을 먼저 그리고, 액정 화면, 그 위에 상판을 겹친 뒤 상판의 세로 위치만 바꾼다.
   - 열기와 닫기는 기본 260ms, 끝에서 부드럽게 멈춘다. 움직이는 동안 들어온 누름은 무시한다.
   - 액정 화면 내용은 src/anycall-lcd.js 가 맡는다. 상판 구멍 아래에 따로 그려져 상판과 함께 움직이고, 테두리 밖으로는 보이지 않는다.
   - 간편모드: 게임 화면 위에 떠 있는 작은 휴대폰. 끌어서 옮기고 크기를 바꿀 수 있다. 걷고 뛰는 조작은 그대로 게임으로 간다.
   - 전체화면: 테두리를 두 번 누르거나 아래 선택 막대에서 고른다.
   좌표는 모두 원본 그림(887×1774) 기준이고, 화면 크기에 맞춰 같은 비율로 줄인다. */
(function(w){'use strict';
const doc=w.document,VERSION='A100';
const SRC={front:'assets/phone/anycall_front_moving.png?v=A98',back:'assets/phone/anycall_back_fixed.png?v=A98'};
/* 원본 그림 실측값
   stage: 양옆 바깥(알파 1 이하의 잡티뿐)을 뺀, 실제로 보이는 범위
   slide: 닫힌 상태에서 상판이 아래로 내려가 있는 거리. 미리보기 두 장과 맞춘 535(하판 아래 끝이 상판 밑으로 살짝 보임).
          A99에서 595로 바꿨다가, 아래 끝이 보이는 쪽이 자연스럽다고 해서 A100에서 되돌렸다.
   front/back: 각 그림에서 실제로 쓰는 위아래 범위
   hole: 상판 액정 구멍 (투명한 부분 252~629 × 231~694)
   lcd: 액정 화면을 그리는 칸. 구멍보다 사방 4픽셀 넓어서 가장자리가 상판 테두리 밑에 숨는다. */
const G=Object.freeze({imgW:887,imgH:1774,stage:Object.freeze({x:140,y:16,w:600,h:1730}),slide:535,
 front:Object.freeze({y:16,h:1140}),back:Object.freeze({y:944,h:802}),
 hole:Object.freeze({x:252,y:231,w:377,h:463}),lcd:Object.freeze({x:248,y:227,w:385,h:471}),rim:34});
const DUR=260,BAR=40,TYPE_H=38,MIN_H=250;
const easeOut=t=>1-Math.pow(1-t,3);
/* 실루엣: 알파 128 이상인 범위를 8픽셀 간격으로 잰 값 (가로줄마다 왼쪽 오른쪽, 세로줄마다 위 아래).
   눌린 곳이 휴대폰 몸인지, 테두리인지 가리는 데 쓴다. file:// 로 열어도 그림 픽셀을 읽을 필요가 없다. */
const SIL={
 f:{y0:16,rows:[0,0,328,556,290,599,259,629,236,650,224,661,215,672,205,680,200,685,194,692,190,695,186,698,183,702,179,706,175,710,175,710,170,714,170,715,170,715,170,715,166,719,166,719,166,719,166,719,166,719,165,719,161,723,161,723,161,723,161,723,161,723,161,723,161,723,161,723,157,727,157,728,157,728,157,728,158,728,157,728,157,728,157,728,157,728,157,727,158,727,157,727,158,727,158,728,158,728,157,728,157,727,157,728,158,728,157,728,158,727,158,728,158,728,157,728,158,728,157,728,157,728,157,727,158,727,157,728,157,728,157,727,157,728,158,728,158,728,158,728,158,728,157,728,158,728,157,728,158,728,157,728,157,728,157,727,157,728,157,728,157,728,157,728,158,728,158,727,158,728,157,727,162,723,162,723,162,723,162,723,161,723,161,723,161,723,161,723,161,723,161,723,162,723,162,723,162,723,162,723,162,723,161,723,158,723,158,723,156,723,152,723,152,723,152,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,155,727,156,727,156,727,153,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,152,727,155,727,158,727,159,727,159,727,159,727,159,727,163,717,187,693,212,668,241,639,276,604,319,561,392,488,0,0],cols:[0,0,0,0,848,1062,220,1104,143,1107,116,1109,97,1112,85,1115,76,1117,65,1120,58,1122,54,1124,48,1126,45,1128,41,1130,40,1132,37,1134,36,1136,36,1137,32,1139,32,1140,28,1142,28,1143,28,1144,24,1145,24,1147,24,1148,24,1148,24,1149,20,1150,20,1151,20,1151,20,1152,20,1152,20,1152,20,1153,20,1153,20,1153,20,1153,20,1153,20,1153,20,1152,20,1152,20,1152,20,1151,20,1151,20,1150,21,1149,24,1148,24,1148,24,1147,24,1145,24,1144,28,1143,28,1142,29,1140,32,1139,32,1137,36,1136,36,1134,40,1132,40,1130,44,1128,46,1126,51,1124,55,1122,61,1120,68,1117,77,1115,88,1112,106,1109,126,1107,169,1104,286,1101,0,0,0,0]},
 b:{y0:944,rows:[0,0,171,698,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,168,701,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,159,727,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,163,723,166,719,167,719,167,719,167,719,167,719,167,719,167,719,167,719,167,719,167,719,171,715,171,714,171,715,171,715,171,715,171,715,171,715,176,710,176,710,175,710,176,710,175,710,179,706,179,706,179,706,183,702,183,702,187,698,188,698,191,694,194,692,198,688,201,685,205,680,209,676,216,670,223,663,230,655,237,648,247,637,259,627,286,598,326,558,0,0,0,0],cols:[0,0,0,0,0,0,1106,1399,951,1534,946,1595,945,1628,945,1645,945,1662,945,1677,945,1686,945,1694,945,1702,945,1709,945,1715,945,1720,945,1724,945,1726,945,1727,945,1730,945,1730,945,1734,945,1734,945,1734,945,1738,945,1738,945,1738,945,1738,945,1738,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1742,945,1738,945,1738,945,1738,945,1738,945,1738,945,1734,945,1734,945,1734,945,1730,945,1730,945,1726,945,1724,945,1720,945,1718,945,1712,945,1708,945,1699,945,1691,945,1681,945,1673,945,1661,947,1644,956,1614,1109,1573,1106,1479,1103,1283,0,0,0,0]}};
function silAt(S,x,y){const i=Math.round((y-S.y0)/8),j=Math.round((x-G.stage.x)/8);
 if(i<0||j<0||2*i+1>=S.rows.length||2*j+1>=S.cols.length)return null;
 const l=S.rows[2*i],r=S.rows[2*i+1],t=S.cols[2*j],b=S.cols[2*j+1];
 if(!r||!b||x<l||x>r||y<t||y>b)return null;return Math.min(x-l,r-x,y-t,b-y)}
/* 상판 버튼 (상판 그림 기준 좌표). cx,cy 는 눌렀을 때 빛나는 가운데 */
const NAV={x:307,y:858,w:273,h:176,cx:443,cy:956,rx:136,ry:88,c:{x:380,y:925,w:127,h:63}};
const FRONT=[
 {id:'menu',name:'매뉴',x:212,y:846,w:94,h:116,cx:260,cy:905},
 {id:'ok',name:'확인',x:578,y:846,w:96,h:116,cx:626,cy:905},
 {id:'clr',name:'취소',x:362,y:1040,w:170,h:96,cx:447,cy:1090},
 {id:'send',name:'통화',x:206,y:962,w:156,h:164,cx:282,cy:1062},
 {id:'end',name:'종료',x:532,y:962,w:146,h:164,cx:606,cy:1062}];
const NAV_GLOW={up:[443,898],down:[443,1012],left:[352,957],right:[536,957],nate:[443,956]};
/* 하판 숫자 키패드 (하판 그림 기준 좌표) */
const PAD=['1','2','3','4','5','6','7','8','9','*','0','#'];
const PAD_COLS=[[216,344],[370,517],[544,675]],PAD_ROWS=[[1187,1281],[1284,1381],[1384,1478],[1481,1578]];
const KEY_NAMES={menu:'매뉴',ok:'확인',up:'위 (Music)',down:'아래 (GPS)',left:'왼쪽',right:'오른쪽',nate:'NATE',send:'통화',clr:'취소',end:'종료'};
/* 누를 때 나는 소리: 숫자판은 실제 전화기처럼 두 음을 섞은 신호음, 상판 버튼은 버튼마다 다른 높이의 한 음 */
const DTMF_R=[697,770,852,941],DTMF_C=[1209,1336,1477];
const TONE={menu:1047,ok:1175,up:1319,down:1397,left:784,right:880,nate:988,send:1568,clr:523,end:659};
function toneFor(id){const i=PAD.indexOf(id);return i>=0?[DTMF_R[Math.floor(i/3)],DTMF_C[i%3]]:[TONE[id]||1000]}
/* 키보드 연결표. 나중에 키를 더 붙일 때 여기만 고치면 된다. */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'ok',NumpadEnter:'ok',Backspace:'clr',Delete:'clr',Escape:'end',KeyM:'menu',KeyS:'send',Slash:'nate',NumpadMultiply:'*',NumpadDivide:'#'};
for(let d=0;d<10;d++){KEYMAP['Digit'+d]=String(d);KEYMAP['Numpad'+d]=String(d)}

const UI_KEY='2006_anycall_ui_v1';
const prefs={mode:'mini',h:0,x:null,y:null,keyTone:true,keyVol:3,slideTone:true};
try{const s=JSON.parse(w.localStorage?.getItem(UI_KEY)||'null');if(s&&typeof s==='object'){for(const k of Object.keys(prefs))if(k in s)prefs[k]=s[k];if(prefs.mode!=='full')prefs.mode='mini';prefs.keyVol=Math.max(1,Math.min(5,Number(prefs.keyVol)||3))}}catch(_){}
function savePrefs(){try{w.localStorage?.setItem(UI_KEY,JSON.stringify(prefs))}catch(_){}}

/* ---------- 소리 ---------- */
const A={ctx:null,log:[],count:0};
function audioState(){const st=w.GameAudio?.state;return{on:!st||st.enabled!==false,vol:st&&Number.isFinite(st.volume)?st.volume:.65}}
function audioCtx(){if(A.ctx)return A.ctx;const C=w.AudioContext||w.webkitAudioContext;if(!C)return null;try{A.ctx=new C()}catch(_){A.ctx=null}return A.ctx}
function beep(freqs,ms=100,gain=.1,type='sine',delay=0){
 A.count++;A.log.push({freqs:freqs.slice(),ms});if(A.log.length>40)A.log.shift();
 const s=audioState();if(!s.on||!s.vol)return{silent:true,why:'off'};const c=audioCtx();if(!c)return{silent:true,why:'none'};
 try{if(c.state==='suspended'&&c.resume)c.resume();const t0=c.currentTime+.004+delay,len=ms/1000,v=Math.max(.0001,s.vol*gain);
  const g=c.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.006);g.gain.setValueAtTime(v,t0+len*.75);g.gain.linearRampToValueAtTime(0,t0+len);g.connect(c.destination);
  for(const f of freqs){const o=c.createOscillator();o.type=type;o.frequency.value=f;o.connect(g);o.start(t0);o.stop(t0+len+.03)}
  return{silent:false}}catch(_){return{silent:true,why:'none'}}}
function keyBeep(id){if(!prefs.keyTone)return null;const f=toneFor(id),v=prefs.keyVol/5;return f.length>1?beep(f,120,.05+.07*v,'sine'):beep(f,85,.025+.04*v,'square')}
function slideSound(open){if(!prefs.slideTone)return;const v=.05+.05*prefs.keyVol/5;if(open){beep([1319],45,v,'triangle');beep([1976],70,v,'triangle',.05)}else{beep([1568],45,v,'triangle');beep([988],70,v,'triangle',.05)}}

/* ---------- 상태 ---------- */
const P={built:false,ready:false,loading:false,shown:false,mode:prefs.mode,pos:G.slide,open:false,anim:null,press:null,dirty:true,lcdDirty:true,k:0,cssW:0,cssH:0,raf:0,hint:null,gesture:null,lastRim:null,resize:null};
let clock=()=>(w.performance?.now?w.performance.now():Date.now());
const IMG={front:null,back:null};
const C={front:null,corner:null,back:null,lcd:null,lcdG:null,k:0};
let root,win,canvas,g,bar,segMini,segFull,typ,typIn,lcd=null;

function E(tag,cls,text){const e=doc.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function canvasOf(wd,ht){const c=doc.createElement('canvas');c.width=Math.max(1,wd);c.height=Math.max(1,ht);return c}
function build(){if(P.built||!doc?.body)return;P.built=true;
 root=E('div','ac-root ac-mini');root.hidden=true;root.id='anycallPhone';
 const back=E('div','ac-backdrop');back.addEventListener('pointerdown',e=>{if(e.target===back){e.preventDefault();setMode('mini')}});
 win=E('div','ac-win');win.setAttribute('role','dialog');win.setAttribute('aria-label','애니콜 슬라이드폰');
 canvas=E('canvas','ac-canvas');canvas.setAttribute('aria-label','애니콜 휴대폰. 몸통을 누르면 슬라이드가 열리고 닫혀. 테두리를 두 번 누르면 전체화면.');
 g=canvas.getContext?canvas.getContext('2d'):null;
 bar=E('div','ac-bar');
 const seg=E('div','ac-seg');seg.setAttribute('role','group');seg.setAttribute('aria-label','휴대폰 보기 방식');
 segMini=E('button','','간편모드');segMini.type='button';segMini.dataset.mode='mini';
 segFull=E('button','','전체화면');segFull.type='button';segFull.dataset.mode='full';seg.append(segMini,segFull);
 const minus=E('button','ac-size','－'),plus=E('button','ac-size','＋'),tip=E('span','ac-tip','테두리 두 번 클릭: 간편모드 · Esc: 종료 버튼'),close=E('button','ac-close','넣기');
 minus.type=plus.type=close.type='button';minus.title='작게';plus.title='크게';close.title='휴대폰을 가방에 넣기 (N)';minus.setAttribute('aria-label','휴대폰 작게');plus.setAttribute('aria-label','휴대폰 크게');
 const grip=E('span','ac-grip');grip.title='끌어서 크기 조절';grip.setAttribute('aria-hidden','true');
 bar.append(seg,minus,plus,tip,close,grip);
 typ=E('div','ac-type');typ.hidden=true;typIn=E('input');typIn.type='text';typIn.setAttribute('aria-label','휴대폰 글 자판으로 쓰기');typIn.autocomplete='off';typIn.spellcheck=false;
 const typGo=E('button','','보내기');typGo.type='button';typ.append(typIn,typGo);
 typIn.addEventListener('input',e=>{const c=P.typing;if(!c)return;c.onInput?.(typIn.value);if(!e.isComposing){const v=c.get?.();if(v!=null&&v!==typIn.value)typIn.value=v}});
 typIn.addEventListener('compositionend',()=>{const c=P.typing;if(!c)return;c.onInput?.(typIn.value)});
 typIn.addEventListener('keydown',e=>{if(e.isComposing||e.keyCode===229)return;if(e.key==='Enter'){e.preventDefault();P.typing?.onEnter?.();const v=P.typing?.get?.();if(v!=null)typIn.value=v}else if(e.key==='Escape'){e.preventDefault();typIn.blur();doc.getElementById('game')?.focus?.()}});
 typGo.addEventListener('pointerdown',e=>e.stopPropagation());typGo.addEventListener('click',e=>{e.preventDefault();P.typing?.onEnter?.();const v=P.typing?.get?.();if(v!=null)typIn.value=v});
 typ.addEventListener('pointerdown',e=>e.stopPropagation());
 const click=(b,fn)=>b.addEventListener('click',e=>{e.preventDefault();fn();b.blur?.()});
 click(segMini,()=>setMode('mini'));click(segFull,()=>setMode('full'));click(minus,()=>resizeBy(-60));click(plus,()=>resizeBy(60));click(close,()=>hide());
 for(const b of [segMini,segFull,minus,plus,close])b.addEventListener('pointerdown',e=>e.stopPropagation());
 bar.addEventListener('pointerdown',barDown);grip.addEventListener('pointerdown',gripDown);
 win.append(canvas,typ,bar);root.append(back,win);doc.body.append(root);
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>{P.gesture=null});
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 w.addEventListener('resize',()=>{if(P.shown)layout()});
 if(w.AnycallLCD?.create)lcd=w.AnycallLCD.create(host);
}
function load(){if(P.ready||P.loading)return;P.loading=true;let left=2;
 for(const k of ['front','back']){const im=new w.Image();im.decoding='async';im.onload=()=>{IMG[k]=im;if(--left===0){P.ready=true;C.k=0;layout();paintThumbs()}};im.onerror=()=>{P.loading=false;toast('휴대폰 그림을 불러오지 못했어.')};im.src=SRC[k]}}
function toast(msg){const h=doc.getElementById('hint');if(h){h.textContent=msg;h.classList.add('show');setTimeout(()=>h.classList.remove('show'),2200)}}

/* ---------- 크기와 위치 ---------- */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function vp(){return{vw:w.innerWidth||1024,vh:w.innerHeight||768}}
function maxMiniH(){const {vh}=vp();return Math.max(MIN_H,Math.min(760,vh-BAR-16))}
function frameRect(){const fr=doc.querySelector('.game-frame')?.getBoundingClientRect?.();return fr&&fr.width&&fr.height?fr:null}
/* 게임 화면이 휴대폰을 품을 만큼 크면 그 안 오른쪽 아래, 작으면(휴대전화 화면) 게임 화면 바로 아래에 둔다 */
function frameRoom(H){const fr=frameRect();return!fr||fr.height>=H+BAR+8}
function defaultMiniH(){const {vh}=vp();let h=Math.round(vh*.6);if(!frameRoom(h)){const fr=frameRect(),below=Math.round(vh-fr.bottom-BAR-90);if(below>=MIN_H)h=Math.min(h,below)}return clamp(h,MIN_H,Math.min(520,maxMiniH()))}
function layout(){if(!P.built)return;const {vw,vh}=vp();let H;
 if(P.mode==='full')H=Math.round(clamp(vh-BAR-24,MIN_H,G.stage.h*.75));else{if(!prefs.h)prefs.h=defaultMiniH();H=Math.round(clamp(prefs.h,MIN_H,maxMiniH()))}
 if(P.mode==='full'&&H*G.stage.w/G.stage.h>vw-16)H=Math.round((vw-16)*G.stage.h/G.stage.w);
 const cssW=Math.round(H*G.stage.w/G.stage.h),dpr=Math.min(3,Math.max(1,w.devicePixelRatio||1)),pw=Math.round(cssW*dpr),ph=Math.round(H*dpr);
 canvas.style.width=cssW+'px';canvas.style.height=H+'px';if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph}
 P.cssW=cssW;P.cssH=H;P.k=ph/G.stage.h;if(C.k!==P.k)buildCache();
 const winW=Math.max(cssW,P.mode==='full'?Math.min(vw-16,430):214),winH=H+BAR+(P.typing?TYPE_H:0);win.style.width=winW+'px';typ.style.width=Math.min(winW,Math.max(cssW+40,230))+'px';
 if(P.mode==='full'){win.style.left=Math.round((vw-winW)/2)+'px';win.style.top=Math.max(4,Math.round((vh-winH)/2))+'px'}
 else{if(prefs.x==null||prefs.y==null){const fr=frameRect(),right=fr?Math.min(vw,fr.right):vw,bottom=fr?Math.min(vh,fr.bottom):vh;prefs.x=right-winW-8+(fr&&!frameRoom(H)?8:0);prefs.y=fr&&!frameRoom(H)?bottom+6:bottom-winH-8}
  prefs.x=clamp(prefs.x,4-Math.round((winW-cssW)/2),vw-winW-4+Math.round((winW-cssW)/2));prefs.y=clamp(prefs.y,4,vh-winH-4);
  win.style.left=Math.round(prefs.x)+'px';win.style.top=Math.round(prefs.y)+'px'}
 root.classList.toggle('ac-full',P.mode==='full');root.classList.toggle('ac-mini',P.mode!=='full');
 segMini.setAttribute('aria-pressed',String(P.mode!=='full'));segFull.setAttribute('aria-pressed',String(P.mode==='full'));
 P.dirty=P.lcdDirty=true;schedule()}
/* 그림은 크기가 바뀔 때만 한 번 줄여 두고, 매 장면에는 좌표만 바꿔서 붙인다 */
/* 윗판 아래 모서리를 깎는 선 (원본 좌표). 옆면(x=150,730)에서 내려오다 아래 가장자리 x=200, 686에서 만난다 */
const CORNER={y0:1000,yb:1116,lx:200,rx:686,p:2.2};
function cornerX(y,side){const c=CORNER,t=Math.max(0,(y-c.y0)/(c.yb-c.y0)),e=Math.pow(t,c.p);return side<0?150+(c.lx-150)*e:730-(730-c.rx)*e}
function cornerPath(x,k,ox,oy){x.beginPath();for(const side of [-1,1]){const edge=side<0?ox-10:ox+G.stage.w+10;x.moveTo((edge-ox)*k,(CORNER.y0-oy)*k);
 for(let y=CORNER.y0;y<=1160;y+=4)x.lineTo((cornerX(y,side)-ox)*k,(y-oy)*k);x.lineTo((edge-ox)*k,(1160-oy)*k);x.closePath()}}
function cornerEdge(x,k,ox,oy){x.beginPath();for(const side of [-1,1]){x.moveTo((cornerX(CORNER.y0,side)-ox)*k,(CORNER.y0-oy)*k);for(let y=CORNER.y0;y<=1112;y+=4)x.lineTo((cornerX(y,side)-ox)*k,(y-oy)*k)}}
function buildCache(){const k=P.k;C.k=k;if(!P.ready||!g)return;const sw=G.stage.w,sx=G.stage.x;
 const mk=(im,y,h)=>{const c=canvasOf(Math.round(sw*k),Math.round(h*k)),x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,sx,y,sw,h,0,0,c.width,c.height);return c};
 C.front=mk(IMG.front,G.front.y,G.front.h);C.back=mk(IMG.back,G.back.y,G.back.h);
 /* 윗판 아래 양 모서리: 깎아 낸 모양(C.front)과 원래 모양(C.corner)을 따로 둔다. 열렸을 때는 원래 모양, 닫힐수록 깎은 모양으로 천천히 바뀐다 */
 C.corner=mk(IMG.front,G.front.y,G.front.h);
 const fc=C.front.getContext('2d');fc.globalCompositeOperation='destination-out';cornerPath(fc,k,G.stage.x,G.front.y);fc.fill();
 fc.globalCompositeOperation='source-atop';fc.strokeStyle='rgba(120,128,142,.55)';fc.lineWidth=Math.max(1,2.2*k);cornerEdge(fc,k,G.stage.x,G.front.y);fc.stroke();fc.globalCompositeOperation='source-over';
 C.lcd=canvasOf(Math.round(G.lcd.w*k),Math.round(G.lcd.h*k));C.lcdG=C.lcd.getContext('2d');P.lcdDirty=true}

/* ---------- 그리기 ---------- */
function drawLcd(now){const c=C.lcdG;if(!c)return;const k=P.k;c.setTransform(1,0,0,1,0,0);c.fillStyle='#06090f';c.fillRect(0,0,C.lcd.width,C.lcd.height);
 if(!lcd)return;const LW=lcd.W,LH=lcd.H;c.setTransform(G.hole.w*k/LW,0,0,G.hole.h*k/LH,(G.hole.x-G.lcd.x)*k,(G.hole.y-G.lcd.y)*k);
 c.save();c.beginPath();c.rect(0,0,LW,LH);c.clip();try{lcd.draw(c,now)}catch(err){c.fillStyle='#fff';c.font='10px sans-serif';c.fillText('화면 오류',8,20)}c.restore()}
function paint(now){if(!g||!P.ready||!C.front)return;if(P.lcdDirty){P.lcdDirty=false;drawLcd(now)}
 const k=P.k,off=Math.round(P.pos*k);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,canvas.width,canvas.height);
 g.drawImage(C.back,0,Math.round((G.back.y-G.stage.y)*k));
 g.drawImage(C.lcd,Math.round((G.lcd.x-G.stage.x)*k),Math.round((G.lcd.y-G.stage.y)*k)+off);
 {const t=Math.min(1,Math.max(0,P.pos/G.slide)),a=C.corner?1-t*t*(3-2*t):0;if(a>.995)g.drawImage(C.corner,0,off);else{g.drawImage(C.front,0,off);if(a>.005){g.globalAlpha=a;g.drawImage(C.corner,0,off);g.globalAlpha=1}}}
 if(P.press&&now<P.press.until){const p=P.press,x=(p.cx-G.stage.x)*k,y=(p.cy-G.stage.y+(p.layer==='f'?P.pos:0))*k,r=(p.r||44)*k,a=.42*(1-Math.max(0,(now-p.t0)/(p.until-p.t0))*.6);
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(200,232,255,'+a.toFixed(3)+')');gr.addColorStop(1,'rgba(200,232,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
 /* 비어 있는 윗부분(닫혔을 때 상판 위쪽)은 누름이 게임으로 지나가게 잘라 둔다 */
 const top=Math.max(0,Math.floor((P.pos+2)*P.cssH/G.stage.h));canvas.style.clipPath=top?'inset('+top+'px 0 0 0)':'none'}
function schedule(){if(P.raf||!P.shown)return;const raf=w.requestAnimationFrame||(f=>w.setTimeout(()=>f(clock()),16));P.raf=raf(frame)}
function frame(){P.raf=0;if(!P.shown)return;step(clock());schedule()}
function step(now){
 if(P.anim){const a=P.anim,t=Math.min(1,Math.max(0,(now-a.t0)/a.dur));P.pos=a.from+(a.to-a.from)*easeOut(t);if(t>=1){P.pos=a.to;P.anim=null;P.open=a.to===0;lcd?.event?.('slid',P.open)}P.dirty=true}
 if(P.press&&now>=P.press.until){P.press=null;P.dirty=true}else if(P.press)P.dirty=true;
 if(lcd?.needs?.(now)){P.lcdDirty=true;P.dirty=true}
 if(P.dirty){P.dirty=false;paint(now)}}

/* ---------- 슬라이드 ---------- */
const keypadOpen=()=>P.pos===0&&!P.anim;
function slide(open){if(P.anim)return false;const want=open==null?!(P.pos===0):!!open;const to=want?0:G.slide;if(P.pos===to)return false;
 P.anim={from:P.pos,to,t0:clock(),dur:DUR};P.open=false;slideSound(want);lcd?.event?.('slide',want);P.dirty=true;schedule();return true}

/* ---------- 누르기 ---------- */
function press(id,src){if(!PAD.includes(id)&&!TONE[id])return false;if(P.anim)return false;
 if(PAD.includes(id)&&!keypadOpen()){P.hint={until:clock()+1500};lcd?.event?.('locked',id);P.lcdDirty=P.dirty=true;schedule();return false}
 const now=clock();let glow=null;const pi=PAD.indexOf(id);
 if(pi>=0){const c=PAD_COLS[pi%3],r=PAD_ROWS[Math.floor(pi/3)];glow={layer:'b',cx:(c[0]+c[1])/2,cy:(r[0]+r[1])/2,r:58}}
 else if(NAV_GLOW[id])glow={layer:'f',cx:NAV_GLOW[id][0],cy:NAV_GLOW[id][1],r:id==='nate'?52:40};
 else{const b=FRONT.find(x=>x.id===id);if(b)glow={layer:'f',cx:b.cx,cy:b.cy,r:50}}
 if(glow)P.press={...glow,id,t0:now,until:now+140};
 if(!lcd?.ownsSound?.(id))keyBeep(id);try{lcd?.key?.(id,src)}catch(err){w.console?.error?.(err)}P.lcdDirty=P.dirty=true;schedule();return true}
/* 원본 좌표로 무엇이 눌렸는지 */
function hit(nx,ny){const fy=ny-P.pos,df=silAt(SIL.f,nx,fy);
 if(df!=null){
  if(nx>=NAV.x&&nx<=NAV.x+NAV.w&&fy>=NAV.y&&fy<=NAV.y+NAV.h){const c=NAV.c;if(nx>=c.x&&nx<=c.x+c.w&&fy>=c.y&&fy<=c.y+c.h)return{kind:'btn',id:'nate'};
   const dx=(nx-NAV.cx)/NAV.rx,dy=(fy-NAV.cy)/NAV.ry;if(dx*dx+dy*dy<=1.25)return{kind:'btn',id:Math.abs(dy)>=Math.abs(dx)?(dy<0?'up':'down'):(dx<0?'left':'right')}}
  for(const b of FRONT)if(nx>=b.x&&nx<=b.x+b.w&&fy>=b.y&&fy<=b.y+b.h)return{kind:'btn',id:b.id};
  return{kind:df<G.rim?'rim':'body',layer:'f'}}
 const db=silAt(SIL.b,nx,ny);
 if(db!=null){for(let i=0;i<PAD.length;i++){const c=PAD_COLS[i%3],r=PAD_ROWS[Math.floor(i/3)];if(nx>=c[0]&&nx<=c[1]&&ny>=r[0]&&ny<=r[1])return{kind:'key',id:PAD[i],live:keypadOpen()}}
  return{kind:db<G.rim?'rim':'body',layer:'b'}}
 return null}
function toNative(e){const r=canvas.getBoundingClientRect();return{x:G.stage.x+(e.clientX-r.left)*G.stage.w/Math.max(1,r.width),y:G.stage.y+(e.clientY-r.top)*G.stage.h/Math.max(1,r.height)}}
function down(e){if(e.button>0)return;const n=toNative(e),h=hit(n.x,n.y);e.preventDefault();w.GameAudio?.unlock?.();if(typIn&&doc.activeElement===typIn)typIn.blur();
 if(!h){P.gesture=null;return}
 if(h.kind==='btn'||h.kind==='key'){P.gesture=null;press(h.id,'pointer');return}
 P.gesture={kind:h.kind,x:e.clientX,y:e.clientY,ox:prefs.x,oy:prefs.y,drag:false,id:e.pointerId};try{canvas.setPointerCapture(e.pointerId)}catch(_){}}
function move(e){const s=P.gesture;if(!s||P.mode==='full')return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(!s.drag&&Math.hypot(dx,dy)>6)s.drag=true;
 if(s.drag){prefs.x=s.ox+dx;prefs.y=s.oy+dy;layout()}}
function up(e){const s=P.gesture;P.gesture=null;if(!s)return;if(s.drag){savePrefs();return}
 if(s.kind==='body'){slide();P.lastRim=null;return}
 const now=clock(),L=P.lastRim;if(L&&now-L.t<420&&Math.hypot(e.clientX-L.x,e.clientY-L.y)<28){P.lastRim=null;setMode(P.mode==='full'?'mini':'full');return}
 P.lastRim={t:now,x:e.clientX,y:e.clientY}}
function barDown(e){if(P.mode==='full'||e.target!==bar&&!e.target.classList?.contains('ac-tip'))return;e.preventDefault();const s={x:e.clientX,y:e.clientY,ox:prefs.x,oy:prefs.y};
 const mv=ev=>{prefs.x=s.ox+ev.clientX-s.x;prefs.y=s.oy+ev.clientY-s.y;layout()},end=()=>{w.removeEventListener('pointermove',mv);w.removeEventListener('pointerup',end);savePrefs()};
 w.addEventListener('pointermove',mv);w.addEventListener('pointerup',end)}
function gripDown(e){if(P.mode==='full')return;e.preventDefault();e.stopPropagation();const s={y:e.clientY,x:e.clientX,h:P.cssH};
 const mv=ev=>{const dy=ev.clientY-s.y,dx=(ev.clientX-s.x)*G.stage.h/G.stage.w,d=Math.abs(dy)>=Math.abs(dx)?dy:dx;prefs.h=clamp(s.h+d,MIN_H,maxMiniH());layout()},end=()=>{w.removeEventListener('pointermove',mv);w.removeEventListener('pointerup',end);savePrefs()};
 w.addEventListener('pointermove',mv);w.addEventListener('pointerup',end)}
function resizeBy(d){prefs.h=clamp((P.cssH||defaultMiniH())+d,MIN_H,maxMiniH());layout();savePrefs()}

/* ---------- 키보드 ----------
   전체화면: 휴대폰이 키를 모두 받는다 (게임 캐릭터는 멈춰 있음).
   간편모드: 숫자, *, #, 백스페이스만 휴대폰으로 가고, 방향키 점프 상호작용은 그대로 게임으로 간다. */
function gameBusy(){return!!(w.PLAYROOM?.isOpen||w.SHOPS?.isOpen||w.MEMO?.isOpen||w.ROUTES?.isMapOpen||w.GameInterface?.isMenuOpen||doc.getElementById('charEditor')&&!doc.getElementById('charEditor').classList.contains('hidden'))}
function keyId(e){if(e.key&&/^[0-9*#]$/.test(e.key))return e.key;return KEYMAP[e.code]||null}
function onKey(e){if(!P.shown)return;const t=e.target||doc.activeElement;if(e.isComposing||e.keyCode===229||['INPUT','TEXTAREA','SELECT'].includes(t?.tagName)||t?.isContentEditable)return;if(e.ctrlKey||e.metaKey||e.altKey)return;
 const code=e.code;
 if(P.mode==='full'){if(/^F\d+$/.test(code)||code==='Tab')return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(e.repeat&&!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Backspace'].includes(code))return;
  if(code==='KeyN'){hide();return}if(code==='Space'){slide();return}const id=keyId(e);if(id)press(id,'key');return}
 if(gameBusy())return;const id=keyId(e);if(!id)return;
 if(PAD.includes(id)||id==='clr'&&code==='Backspace'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(!e.repeat||id==='clr')press(id,'key')}}
w.addEventListener('keydown',onKey,true);

/* ---------- 보이기 ---------- */
function setMode(m){P.mode=m==='full'?'full':'mini';prefs.mode=P.mode;savePrefs();if(P.mode==='full')w.__GAME_DEBUG__?.clearInput?.();if(P.shown)layout()}
function show(mode){build();if(!root)return;if(mode)P.mode=prefs.mode=mode==='full'?'full':'mini';load();root.hidden=false;P.shown=true;doc.body.classList.add('ac-phone-on');lcd?.event?.('show');if(P.ready)layout();else schedule();savePrefs()}
function hide(){if(!root)return;root.hidden=true;P.shown=false;if(P.aim)P.aim.hidden=true;P.gesture=null;doc.body.classList.remove('ac-phone-on');if(P.raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(P.raf);P.raf=0;lcd?.event?.('hide');doc.getElementById('game')?.focus?.()}
function toggle(mode){if(P.shown&&(!mode||mode===P.mode))hide();else show(mode)}

/* ---------- 가방 속 기본 소지품 ---------- */
const thumbs=new Set();
function drawThumb(c){const x=c.getContext?.('2d');if(!x||!P.ready)return;const top=G.slide+14,bottom=G.slide+1156,s=c.height/(bottom-top);x.clearRect(0,0,c.width,c.height);x.imageSmoothingQuality='high';
 const ox=(c.width-G.stage.w*s)/2;x.drawImage(IMG.back,G.stage.x,944,G.stage.w,802,ox,(944-top)*s,G.stage.w*s,802*s);
 x.fillStyle='#0b1a33';x.fillRect(ox+(G.hole.x-G.stage.x)*s,(G.hole.y+G.slide-top)*s,G.hole.w*s,G.hole.h*s);
 const fr=canvasOf(Math.round(G.stage.w*s),Math.round(1140*s)),fx=fr.getContext('2d');if(fx){fx.drawImage(IMG.front,G.stage.x,16,G.stage.w,1140,0,0,fr.width,fr.height);fx.globalCompositeOperation='destination-out';cornerPath(fx,s,G.stage.x,16);fx.fill()}
 x.drawImage(fr,ox,(16+G.slide-top)*s)}
function paintThumbs(){for(const c of thumbs){if(!c.isConnected){thumbs.delete(c);continue}drawThumb(c)}}
function bagCard(){const b=E('button','item-card shelf-item ac-bag-card');b.type='button';b.dataset.item='anycall-basic';const c=canvasOf(56,96);c.className='ac-thumb';thumbs.add(c);
 const info=E('div','item-card-copy');info.append(E('strong','','기본형 애니콜'),E('small','','늘 가지고 다니는 것'));b.append(c,info);load();drawThumb(c);return b}
function bagDetail(onTake){const box=E('div','ac-bag-detail');const c=canvasOf(84,144);c.className='ac-thumb big';thumbs.add(c);load();drawThumb(c);
 const body=E('div','bag-description');body.append(E('strong','','기본형 애니콜 슬라이드폰'),E('p','','처음부터 가지고 있는 휴대폰. 몸통을 누르면 슬라이드가 열리고, 숫자판으로 전화를 걸거나 문자를 보낼 수 있어. 걸으면서 켜 둘 수도 있어. (단축키 N)'));
 const take=E('button','primary','휴대폰 꺼내기');take.type='button';take.addEventListener('click',()=>onTake?.());box.append(c,body,take);return box}

/* ---------- 액정 화면에 주는 도구 ---------- */
const host={
 get open(){return keypadOpen()},get sliding(){return!!P.anim},get shown(){return P.shown},get mode(){return P.mode},prefs,savePrefs,
 now:()=>clock(),beep,keyBeep,toneFor,
 invalidate(){P.lcdDirty=P.dirty=true;schedule()},
 hintActive(now){return!!(P.hint&&now<P.hint.until)},
 audioOn(){const s=audioState();return s.on&&s.vol>0},
 clock(){const txt=doc.getElementById('clockLabel')?.textContent||'오후 4:32';const m=/(오전|오후)?\s*(\d{1,2}):(\d{2})/.exec(txt);let h=16,mi=32;if(m){h=Number(m[2]);mi=Number(m[3]);if(m[1]==='오후'&&h<12)h+=12;if(m[1]==='오전'&&h===12)h=0}
  return{h,m:mi,hh:String(h).padStart(2,'0'),mm:String(mi).padStart(2,'0'),date:'05월 30일 (화)',year:2006}},
 place(){const q=id=>doc.getElementById(id)?.textContent?.trim()||'';return{area:q('areaLabel')||'동네',scene:q('sceneLabel')||'거리',weather:q('weatherLabel')||'맑음',time:q('timeLabel')||'늦은 오후'}},
 label(text){const l=doc.getElementById('phoneLabel');if(l)l.textContent=text||'애니콜'},
 slide,setMode,hide,
 playTune(ring,onEnd){const T=w.WebTown;if(!T?.synthPlay||!ring)return{silent:true};return T.synthPlay([[ring[5],'square',.13],[ring[6]||'R:1','triangle',.18]],ring[4],onEnd)},
 stopTune(){w.WebTown?.synthStop?.()},
 /* 글 쓰는 화면: 휴대폰 아래 자판 입력 칸 (cfg 가 없으면 숨김) */
 typing(cfg){const had=!!P.typing;P.typing=cfg||null;if(!typ)return;typ.hidden=!cfg;
  if(cfg){typIn.placeholder=cfg.placeholder||'자판으로 쓰기';if(typIn.value!==(cfg.value||''))typIn.value=cfg.value||'';
   if(P.shown&&!(w.matchMedia?.('(pointer:coarse)')?.matches))setTimeout(()=>{if(P.typing===cfg&&P.shown)try{typIn.focus({preventScroll:true})}catch(_){}},40)}
  else if(doc.activeElement===typIn){typIn.blur();doc.getElementById('game')?.focus?.()}
  if(had!==!!cfg&&P.shown)layout()},
 typingValue(v){if(!typIn||!P.typing)return;if(typIn.value!==v)typIn.value=v},
 get typingShown(){return!!P.typing},
 buzz(){if(!canvas)return;canvas.classList.remove('ac-buzz');void canvas.offsetWidth;canvas.classList.add('ac-buzz');clearTimeout(P.buzzT);P.buzzT=setTimeout(()=>canvas.classList.remove('ac-buzz'),760);P.buzzed=(P.buzzed||0)+1},
 alert(o){if(!P.shown){if(o?.kind==='call')show();else toast('[휴대폰] '+(o?.text||'알림')+' · 메뉴의 휴대폰 탭이나 N 키로 꺼내 봐')}},
 toast,
 gameCanvas(){return doc.getElementById('game')},
 makeCanvas:(wd,ht)=>canvasOf(wd,ht),
 makeImage(url,onload){if(!url||!w.Image)return null;const im=new w.Image();im.onload=()=>onload?.();im.src=url;return im},
 scene(){return w.__GAME_DEBUG__?.player?.scene||'street'},
 me(){const p=w.__GAME_DEBUG__?.player;return p?{scene:p.scene,x:p.x}:null},
 /* 카메라 조준 틀: 게임 화면 위에 찍힐 범위를 점선으로 보여 준다 (r: 게임 그림 좌표 {x,y,w,h}, 없으면 숨김) */
 cameraFrame(r){const gc=doc.getElementById('game'),fr=gc?.parentElement;if(!gc||!fr)return;let el=P.aim;
  if(!r||!P.shown){if(el)el.hidden=true;return}
  if(!el){el=P.aim=E('div','ac-aim');el.append(E('span','','휴대폰 카메라'));el.setAttribute('aria-hidden','true');fr.append(el)}
  const gr=gc.getBoundingClientRect?.(),pr=fr.getBoundingClientRect?.();if(!gr||!pr||!gr.width)return;const sx=gr.width/(gc.width||480),sy=gr.height/(gc.height||270);
  el.hidden=false;el.style.left=Math.round(gr.left-pr.left+r.x*sx)+'px';el.style.top=Math.round(gr.top-pr.top+r.y*sy)+'px';el.style.width=Math.round(r.w*sx)+'px';el.style.height=Math.round(r.h*sy)+'px'},
 /* 사진을 내 컴퓨터 파일로 내려받기 (그림판과 같은 방법) */
 download(name,url){try{const a=doc.createElement('a');let href=url,made=null;
  try{if(typeof w.Blob==='function'&&w.URL?.createObjectURL&&typeof w.atob==='function'){const m=/^data:([a-z/]+);base64,(.*)$/.exec(url);if(m){const bin=w.atob(m[2]),buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);made=w.URL.createObjectURL(new w.Blob([buf],{type:m[1]}));href=made}}}catch(_){href=url;made=null}
  a.href=href;a.download=name;a.style.display='none';(doc.body||doc.documentElement).appendChild(a);a.click?.();a.remove?.();if(made)setTimeout(()=>{try{w.URL.revokeObjectURL(made)}catch(_){}},4000);P.downloads=(P.downloads||0)+1;return true}catch(_){return false}},
 pcSave(name,url,wd,ht){const sh=w.XPDesktop?.current?.modules?.shell;if(!sh?.picSave)return null;try{return sh.picSave(name,url,wd,ht)}catch(_){return{ok:false}}}
};

w.AnycallPhone={version:VERSION,geometry:G,duration:DUR,keymap:KEYMAP,pad:PAD.slice(),keyNames:KEY_NAMES,
 show,hide,toggle,setMode,slide,press,bagCard,bagDetail,
 get lcd(){build();return lcd},
 get state(){return{shown:P.shown,mode:P.mode,pos:P.pos,open:keypadOpen(),sliding:!!P.anim,ready:P.ready,cssW:P.cssW,cssH:P.cssH,k:P.k,x:prefs.x,y:prefs.y,h:prefs.h,keyTone:prefs.keyTone,keyVol:prefs.keyVol}},
 _test:{cornerX,corner:CORNER,cache:C,hit,toneFor,beeps:()=>A.log.slice(),beepCount:()=>A.count,step:now=>step(now),setClock(fn){clock=fn},sil:SIL,front:FRONT,nav:NAV,padCols:PAD_COLS,padRows:PAD_ROWS,layout,paint:()=>paint(clock()),get canvas(){return canvas}}};
if(doc?.body)build();else doc?.addEventListener?.('DOMContentLoaded',build);
})(window);
