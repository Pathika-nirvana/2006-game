/* A101 · 애니콜 상판은 움직이고 하판은 고정된다. 좌표 기준은 새 상판 원본. (2026-11-13 KST) */
(function(w){'use strict';
const doc=w.document,VERSION='A101';
const SRC={front:'assets/phone/anycall_front.webp',back:'assets/phone/anycall_back.webp'};
const G=Object.freeze({
 stage:Object.freeze({x:100,y:20,w:740,h:2176}),slide:646,
 front:Object.freeze({h:1510}),back:Object.freeze({x:3,y:908,scale:.927}),
 hole:Object.freeze({x:228,y:300,w:482,h:601}),
 lcd:Object.freeze({x:220,y:292,w:498,h:617}),rim:42
});
const DUR=260,BAR=40,TYPE_H=38,MIN_H=250,POWER_HOLD=850;
const easeOut=t=>1-Math.pow(1-t,3);
/* 원본 알파 경계를 8픽셀 간격으로 샘플링한 클릭 실루엣. */
const SIL={
 f:{"y0":20,"rows":[0,0,384,555,310,630,269,668,243,694,225,712,210,727,199,738,190,748,181,756,174,762,168,768,163,774,158,779,153,783,149,787,146,791,143,794,140,796,137,799,135,802,133,804,131,806,129,808,127,810,125,811,124,813,122,814,121,815,120,817,119,818,118,819,117,820,116,821,115,822,114,822,114,823,113,824,113,825,113,825,112,826,112,827,111,827,111,828,111,828,111,828,110,828,110,829,110,829,109,830,109,830,109,830,109,830,109,831,109,831,109,831,108,831,108,832,108,832,108,832,108,832,108,832,108,832,108,832,108,832,108,832,108,832,108,832,107,832,107,832,107,832,107,832,107,832,107,832,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,107,833,108,833,108,833,108,833,108,833,108,833,108,833,108,833,108,833,109,833,108,833,109,833,109,833,109,833,109,832,110,832,110,831,110,831,110,831,111,830,111,830,112,830,112,829,113,829,113,828,114,827,114,827,115,826,116,825,117,824,119,823,120,821,122,820,123,818,125,816,127,814,129,812,131,810,134,807,137,804,141,801,145,796,150,792,156,786,162,780,169,774,177,764,186,755,198,742,213,728,231,708,258,680,303,633,383,545,0,0],"cols":[0,0,463,1183,280,1328,225,1369,189,1399,163,1418,142,1433,127,1445,114,1455,103,1463,93,1471,86,1477,78,1482,72,1487,67,1491,63,1495,59,1498,55,1502,52,1504,49,1506,47,1508,45,1510,43,1511,41,1513,39,1514,38,1515,37,1516,36,1517,34,1518,33,1519,32,1520,32,1521,31,1522,30,1522,29,1523,29,1523,28,1524,28,1524,27,1524,28,1525,27,1525,27,1525,26,1525,26,1525,26,1525,26,1525,26,1525,26,1525,26,1525,26,1525,26,1525,26,1525,27,1525,27,1524,27,1524,28,1524,28,1523,29,1523,29,1522,30,1522,30,1521,31,1521,32,1520,33,1519,34,1518,35,1517,36,1516,37,1515,39,1514,40,1513,42,1511,44,1510,47,1508,49,1507,51,1505,55,1503,58,1500,62,1497,66,1493,72,1490,78,1485,84,1480,92,1475,102,1468,113,1461,126,1452,141,1442,163,1429,187,1414,222,1390,273,1358,363,1299,0,0]},
 b:{"y0":1204,"rows":[0,0,0,0,129,827,129,827,129,827,128,827,128,827,129,827,128,828,128,828,124,827,123,827,118,827,115,828,112,828,111,827,111,828,111,827,111,828,111,828,111,828,111,828,111,828,111,828,113,828,118,828,123,828,125,828,124,828,119,828,114,828,112,828,112,828,111,828,111,828,111,828,111,828,111,828,111,828,112,828,113,828,114,828,118,828,123,828,128,828,128,828,128,828,128,828,129,828,129,828,129,828,129,828,129,828,129,828,129,828,129,828,129,828,130,827,131,826,131,826,131,826,131,826,131,826,131,826,132,825,132,825,132,825,132,825,133,825,133,824,133,824,133,824,133,824,134,823,134,823,134,823,135,823,135,822,135,822,136,822,136,822,136,822,137,821,137,821,137,820,137,820,137,820,137,819,138,819,138,818,139,818,140,817,140,817,141,816,142,815,142,814,143,813,144,812,145,811,147,810,148,809,150,807,151,805,152,803,155,801,157,798,160,796,163,793,166,790,169,786,174,782,177,778,182,773,187,769,193,762,200,756,206,749,214,742,225,732,234,722,246,709,264,692,285,669,353,593,0,0],"cols":[0,0,0,0,1303,1538,1284,1549,1215,1747,1214,1943,1214,2006,1215,2041,1216,2065,1219,2082,1229,2096,1267,2109,1294,2120,1304,2130,1310,2137,1316,2145,1320,2152,1321,2157,1323,2162,1324,2167,1324,2171,1324,2174,1324,2177,1324,2179,1324,2181,1324,2183,1324,2184,1324,2184,1324,2185,1324,2186,1324,2187,1324,2187,1324,2188,1324,2188,1324,2189,1324,2189,1324,2189,1324,2190,1324,2190,1324,2190,1324,2190,1324,2190,1324,2190,1324,2191,1324,2191,1324,2191,1324,2191,1324,2191,1324,2191,1324,2191,1324,2190,1324,2190,1324,2190,1324,2190,1324,2190,1324,2190,1324,2189,1324,2189,1324,2189,1324,2189,1324,2188,1324,2188,1324,2187,1324,2187,1324,2186,1324,2185,1324,2185,1324,2184,1324,2184,1324,2183,1324,2181,1324,2180,1324,2178,1324,2175,1324,2172,1324,2169,1323,2164,1322,2160,1321,2154,1318,2148,1313,2141,1308,2133,1299,2125,1285,2114,1232,2102,1226,2089,1218,2072,1216,2053,1215,2026,1214,1983,1214,1894,1263,1654,0,0]}};
function silAt(S,x,y){const i=Math.round((y-S.y0)/8),j=Math.round((x-G.stage.x)/8);
 if(i<0||j<0||2*i+1>=S.rows.length||2*j+1>=S.cols.length)return null;
 const l=S.rows[2*i],r=S.rows[2*i+1],t=S.cols[2*j],b=S.cols[2*j+1];
 if(!r||!b||x<l||x>r||y<t||y>b)return null;return Math.min(x-l,r-x,y-t,b-y)}
/* 상판 버튼 (상판 그림 기준 좌표). cx,cy 는 눌렀을 때 빛나는 가운데 */
const NAV={x:305,y:1118,w:332,h:206,cx:470,cy:1227,rx:166,ry:103,c:{x:391,y:1188,w:164,h:81}};
const FRONT=[
 {id:'menu',name:'메뉴',x:177,y:1085,w:122,h:144,cx:234,cy:1168},
 {id:'ok',name:'확인',x:647,y:1085,w:125,h:144,cx:713,cy:1168},
 {id:'clr',name:'취소',x:352,y:1338,w:242,h:101,cx:475,cy:1391},
 {id:'send',name:'통화',x:179,y:1230,w:172,h:204,cx:269,cy:1360},
 {id:'end',name:'종료',x:594,y:1230,w:177,h:204,cx:681,cy:1360}];
const NAV_GLOW={up:[470,1160],down:[470,1291],left:[354,1229],right:[590,1229],nate:[470,1227]};
const PAD=['1','2','3','4','5','6','7','8','9','*','0','#'];
const PAD_COLS=[[198,354],[387,571],[604,763]],PAD_ROWS=[[1530,1645],[1647,1762],[1764,1877],[1880,2001]];
const KEY_NAMES={menu:'매뉴',ok:'확인',up:'위 (Music)',down:'아래 (GPS)',left:'왼쪽',right:'오른쪽',nate:'NATE',send:'통화',clr:'취소',end:'종료'};
/* 누를 때 나는 소리: 숫자판은 실제 전화기처럼 두 음을 섞은 신호음, 상판 버튼은 버튼마다 다른 높이의 한 음 */
const DTMF_R=[697,770,852,941],DTMF_C=[1209,1336,1477];
const TONE={menu:1047,ok:1175,up:1319,down:1397,left:784,right:880,nate:988,send:1568,clr:523,end:659};
function toneFor(id){const i=PAD.indexOf(id);return i>=0?[DTMF_R[Math.floor(i/3)],DTMF_C[i%3]]:[TONE[id]||1000]}
/* 키보드 연결표. 나중에 키를 더 붙일 때 여기만 고치면 된다. */
const KEYMAP={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'ok',NumpadEnter:'ok',Backspace:'clr',Delete:'clr',Escape:'end',KeyM:'menu',KeyS:'send',Slash:'nate',NumpadMultiply:'*',NumpadDivide:'#'};
for(let d=0;d<10;d++){KEYMAP['Digit'+d]=String(d);KEYMAP['Numpad'+d]=String(d)}

const UI_KEY='2006_anycall_ui_v1';
const prefs={mode:'mini',h:0,x:null,y:null,keyTone:true,keyVol:3,slideTone:true,powerOn:true};
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
const P={built:false,ready:false,loading:false,shown:false,mode:prefs.mode,pos:G.slide,open:false,anim:null,press:null,dirty:true,lcdDirty:true,k:0,cssW:0,cssH:0,raf:0,hint:null,gesture:null,power:prefs.powerOn===false?'off':'on',powerAt:0,hold:null,lastRim:null,resize:null};
let clock=()=>(w.performance?.now?w.performance.now():Date.now());
const IMG={front:null,back:null};
const C={front:null,back:null,lcd:null,lcdG:null,k:0};
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
 const minus=E('button','ac-size','－'),plus=E('button','ac-size','＋'),tip=E('span','ac-tip','종료 버튼 길게: 전원'),close=E('button','ac-close','넣기');
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
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',cancelPointer);canvas.addEventListener('lostpointercapture',cancelPointer);
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
function layer(x,id,k,ox,oy){
 const im=IMG[id],b=G.back,front=id==='front',scale=front?1:b.scale;
 x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
 x.drawImage(im,((front?0:b.x)-ox)*k,((front?0:b.y)-oy)*k,im.width*scale*k,im.height*scale*k);
}
function buildCache(){
 const k=P.k;C.k=k;if(!P.ready||!g)return;
 const {x,y,w,h}=G.stage;
 C.front=canvasOf(Math.round(w*k),Math.round(G.front.h*k));
 C.back=canvasOf(Math.round(w*k),Math.round(h*k));
 layer(C.front.getContext('2d'),'front',k,x,y);
 layer(C.back.getContext('2d'),'back',k,x,y);
 C.lcd=canvasOf(Math.round(G.lcd.w*k),Math.round(G.lcd.h*k));C.lcdG=C.lcd.getContext('2d');P.lcdDirty=true;
}

/* ---------- 그리기 ---------- */
function drawLcd(now){const c=C.lcdG;if(!c)return;const k=P.k;c.setTransform(1,0,0,1,0,0);c.fillStyle='#06090f';c.fillRect(0,0,C.lcd.width,C.lcd.height);
 if(!lcd)return;const LW=lcd.W,LH=lcd.H;c.setTransform(G.hole.w*k/LW,0,0,G.hole.h*k/LH,(G.hole.x-G.lcd.x)*k,(G.hole.y-G.lcd.y)*k);
 c.save();c.beginPath();c.rect(0,0,LW,LH);c.clip();try{if(P.power==='on')lcd.draw(c,now);else drawPower(c,now,LW,LH)}catch(err){c.fillStyle='#fff';c.font='10px sans-serif';c.fillText('화면 오류',8,20)}c.restore()}
function togglePower(now){
 if(P.anim||P.power==='booting'||P.power==='stopping')return;
 const on=P.power==='off';
 P.power=on?'booting':'stopping';P.powerAt=now;prefs.powerOn=on;savePrefs();
 P.hint=null;P.press=null;
 lcd?.event?.(on?'poweron':'poweroff');
 const notes=on?[523,659,784,1047]:[784,659,523];
 notes.forEach((f,i)=>beep([f],i===notes.length-1?250:112,.085,'triangle',i*.105));
 P.lcdDirty=P.dirty=true;schedule();
}
function drawPower(g,now,width,height){
 const boot=P.power==='booting',t=Math.max(0,now-P.powerAt);
 g.fillStyle='#030507';g.fillRect(0,0,width,height);
 if(P.power==='off')return;
 const progress=Math.min(1,t/(boot?1450:1040));
 const alpha=boot?Math.min(1,t/300):Math.min(1,(1-progress)*3);
 g.globalAlpha=alpha;
 const bg=g.createLinearGradient(0,0,width,height);
 bg.addColorStop(0,'#060e2c');bg.addColorStop(.53,boot?'#153e94':'#192e68');bg.addColorStop(1,'#02051b');
 g.fillStyle=bg;g.fillRect(0,0,width,height);
 for(let i=0;i<3;i++){
  const y=height*(.67+i*.035);
  g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(width*.49,y+12,width,y-22);
  g.lineWidth=1;g.strokeStyle=['#537be5','#3459b8','#23459a'][i];g.stroke();
 }
 g.fillStyle='#fff';g.textAlign='center';g.font='italic bold 29px Arial,sans-serif';
 g.fillText('Anycall',width/2,height*.51);
 g.fillStyle='#c3d7ff';g.font='bold 10px Dotum,Gulim,sans-serif';
 g.fillText(boot?'SAMSUNG':'안녕히 계세요',width/2,height*.59);
 if(boot){
  g.fillStyle='#284c9d';g.fillRect(width*.36,height*.82,width*.28,2);
  g.fillStyle='#a4cdff';g.fillRect(width*.36,height*.82,width*.28*progress,2);
 }
 g.globalAlpha=1;
}
function paint(now){if(!g||!P.ready||!C.front)return;if(P.lcdDirty){P.lcdDirty=false;drawLcd(now)}
 const k=P.k,off=Math.round(P.pos*k);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,canvas.width,canvas.height);
 g.drawImage(C.back,0,0);
 g.drawImage(C.lcd,Math.round((G.lcd.x-G.stage.x)*k),Math.round((G.lcd.y-G.stage.y)*k)+off);
 g.drawImage(C.front,0,off);
 if(P.press&&now<P.press.until){const p=P.press,x=(p.cx-G.stage.x)*k,y=(p.cy-G.stage.y+(p.layer==='f'?P.pos:0))*k,r=(p.r||44)*k,a=.42*(1-Math.max(0,(now-p.t0)/(p.until-p.t0))*.6);
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(200,232,255,'+a.toFixed(3)+')');gr.addColorStop(1,'rgba(200,232,255,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
 /* 비어 있는 윗부분(닫혔을 때 상판 위쪽)은 누름이 게임으로 지나가게 잘라 둔다 */
 const top=Math.max(0,Math.floor((P.pos+2)*P.cssH/G.stage.h));canvas.style.clipPath=top?'inset('+top+'px 0 0 0)':'none'}
function schedule(){if(P.raf||!P.shown)return;const raf=w.requestAnimationFrame||(f=>w.setTimeout(()=>f(clock()),16));P.raf=raf(frame)}
function frame(){P.raf=0;if(!P.shown)return;step(clock());schedule()}
function step(now){
 if(P.hold&&!P.hold.fired&&now-P.hold.at>=POWER_HOLD){
  P.hold.fired=true;togglePower(now);
 }
 if(P.power==='booting'||P.power==='stopping'){
  const boot=P.power==='booting';
  if(now-P.powerAt>=(boot?1450:1040))P.power=boot?'on':'off';
  P.lcdDirty=P.dirty=true;
 }
 if(P.anim){const a=P.anim,t=Math.min(1,Math.max(0,(now-a.t0)/a.dur));P.pos=a.from+(a.to-a.from)*easeOut(t);if(t>=1){P.pos=a.to;P.anim=null;P.open=a.to===0;if(P.power==='on')lcd?.event?.('slid',P.open)}P.dirty=true}
 if(P.press&&now>=P.press.until){P.press=null;P.dirty=true}else if(P.press)P.dirty=true;
 if(P.power==='on'&&lcd?.needs?.(now)){P.lcdDirty=true;P.dirty=true}
 if(P.dirty){P.dirty=false;paint(now)}}

/* ---------- 슬라이드 ---------- */
const keypadOpen=()=>P.pos===0&&!P.anim;
function slide(open){if(P.anim)return false;const want=open==null?!(P.pos===0):!!open;const to=want?0:G.slide;if(P.pos===to)return false;
 P.anim={from:P.pos,to,t0:clock(),dur:DUR};P.open=false;if(P.power==='on'){slideSound(want);lcd?.event?.('slide',want)}P.dirty=true;schedule();return true}

/* ---------- 누르기 ---------- */
function press(id,src){if(P.power!=='on'||(!PAD.includes(id)&&!TONE[id]))return false;if(P.anim)return false;
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
function beginHold(id,x,y){if(!P.hold&&!P.anim)P.hold={id,x,y,at:clock(),fired:false}}
function releaseHold(id,src){
 const h=P.hold;if(!h||h.id!==id)return false;
 P.hold=null;
 const now=clock();
 if(!h.fired){
  if(now-h.at>=POWER_HOLD)togglePower(now);
  else press('end',src);
 }
 return true;
}
function cancelPointer(e){
 if(P.hold?.id===e.pointerId)P.hold=null;
 if(P.gesture?.id===e.pointerId)P.gesture=null;
}
function down(e){if(e.button>0||P.gesture||P.hold)return;const n=toNative(e),h=hit(n.x,n.y);e.preventDefault();w.GameAudio?.unlock?.();if(typIn&&doc.activeElement===typIn)typIn.blur();
 if(!h){P.gesture=null;return}
 if(h.kind==='btn'||h.kind==='key'){
  if(h.id==='end'){
   beginHold(e.pointerId,e.clientX,e.clientY);try{canvas.setPointerCapture(e.pointerId)}catch(_){}
  }else press(h.id,'pointer');
  return;
 }
 P.gesture={kind:h.kind,x:e.clientX,y:e.clientY,ox:prefs.x,oy:prefs.y,drag:false,id:e.pointerId};try{canvas.setPointerCapture(e.pointerId)}catch(_){}}
function move(e){
 const hold=P.hold;
 if(hold?.id===e.pointerId&&Math.hypot(e.clientX-hold.x,e.clientY-hold.y)>9)P.hold=null;
 const s=P.gesture;if(!s||s.id!==e.pointerId||P.mode==='full')return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(!s.drag&&Math.hypot(dx,dy)>6)s.drag=true;
 if(s.drag){prefs.x=s.ox+dx;prefs.y=s.oy+dy;layout()}}
function up(e){if(releaseHold(e.pointerId,'pointer'))return;const s=P.gesture;if(!s||s.id!==e.pointerId)return;P.gesture=null;if(s.drag){savePrefs();return}
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
  if(code==='KeyN'){hide();return}if(code==='Space'){slide();return}const id=keyId(e);if(id==='end')beginHold('Escape');else if(id)press(id,'key');return}
 if(gameBusy())return;const id=keyId(e);if(!id)return;
 if(PAD.includes(id)||id==='clr'&&code==='Backspace'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();if(!e.repeat||id==='clr')press(id,'key')}}
w.addEventListener('keydown',onKey,true);
w.addEventListener('keyup',e=>{if(e.code==='Escape'&&releaseHold('Escape','key')){e.preventDefault();e.stopImmediatePropagation?.()}},true);
w.addEventListener('blur',()=>{P.hold=null;P.gesture=null});

/* ---------- 보이기 ---------- */
function setMode(m){P.mode=m==='full'?'full':'mini';prefs.mode=P.mode;savePrefs();if(P.mode==='full')w.__GAME_DEBUG__?.clearInput?.();if(P.shown)layout()}
function show(mode){build();if(!root)return;if(mode)P.mode=prefs.mode=mode==='full'?'full':'mini';load();root.hidden=false;P.shown=true;doc.body.classList.add('ac-phone-on');lcd?.event?.('show');if(P.ready)layout();else schedule();savePrefs()}
function hide(){if(!root)return;root.hidden=true;P.shown=false;if(P.aim)P.aim.hidden=true;P.gesture=null;P.hold=null;doc.body.classList.remove('ac-phone-on');if(P.raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(P.raf);P.raf=0;lcd?.event?.('hide');doc.getElementById('game')?.focus?.()}
function toggle(mode){if(P.shown&&(!mode||mode===P.mode))hide();else show(mode)}

/* ---------- 가방 속 기본 소지품 ---------- */
const thumbs=new Set();
function drawThumb(c){
 const x=c.getContext?.('2d');if(!x||!P.ready)return;
 const top=G.stage.y+G.slide,s=Math.min(c.width/G.stage.w,c.height/(G.stage.h-G.slide));
 const left=G.stage.x-(c.width/s-G.stage.w)/2;
 x.clearRect(0,0,c.width,c.height);layer(x,'back',s,left,top);
 x.fillStyle='#0b1a33';x.fillRect((G.lcd.x-left)*s,(G.lcd.y+G.slide-top)*s,G.lcd.w*s,G.lcd.h*s);
 layer(x,'front',s,left,top-G.slide);
}
function paintThumbs(){for(const c of thumbs){if(!c.isConnected){thumbs.delete(c);continue}drawThumb(c)}}
function bagCard(){const b=E('button','item-card shelf-item ac-bag-card');b.type='button';b.dataset.item='anycall-basic';const c=canvasOf(56,96);c.className='ac-thumb';thumbs.add(c);
 const info=E('div','item-card-copy');info.append(E('strong','','기본형 애니콜'),E('small','','늘 가지고 다니는 것'));b.append(c,info);load();drawThumb(c);return b}
function bagDetail(onTake){const box=E('div','ac-bag-detail');const c=canvasOf(84,144);c.className='ac-thumb big';thumbs.add(c);load();drawThumb(c);
 const body=E('div','bag-description');body.append(E('strong','','기본형 애니콜 슬라이드폰'),E('p','','처음부터 가지고 있는 휴대폰. 몸통을 누르면 슬라이드가 열리고, 숫자판으로 전화를 걸거나 문자를 보낼 수 있어. 걸으면서 켜 둘 수도 있어. (단축키 N)'));
 const take=E('button','primary','휴대폰 꺼내기');take.type='button';take.addEventListener('click',()=>onTake?.());box.append(c,body,take);return box}

/* ---------- 액정 화면에 주는 도구 ---------- */
const host={
 get open(){return keypadOpen()},get sliding(){return!!P.anim},get shown(){return P.shown},get powered(){return P.power==='on'},get mode(){return P.mode},prefs,savePrefs,
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
 get state(){return{power:P.power,shown:P.shown,mode:P.mode,pos:P.pos,open:keypadOpen(),sliding:!!P.anim,ready:P.ready,cssW:P.cssW,cssH:P.cssH,k:P.k,x:prefs.x,y:prefs.y,h:prefs.h,keyTone:prefs.keyTone,keyVol:prefs.keyVol}},
 _test:{cache:C,hit,toneFor,beeps:()=>A.log.slice(),beepCount:()=>A.count,step:now=>step(now),setClock(fn){clock=fn},sil:SIL,front:FRONT,nav:NAV,padCols:PAD_COLS,padRows:PAD_ROWS,layout,paint:()=>paint(clock()),get canvas(){return canvas}}};
if(doc?.body)build();else doc?.addEventListener?.('DOMContentLoaded',build);
})(window);
