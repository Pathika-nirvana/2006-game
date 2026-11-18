'use strict';
/* A126 (2026-11-18 KST): 컴퓨터 전체화면의 「액정 크기」 옵션 창. 휴대폰 그대로 / 액정 크게 / 액정 화면 가득,
   큰 액정에서는 아래판이 열린 것으로 쳐서 숫자 키가 들어가는지, 간편모드와 휴대전화에서는 예전 그대로인지. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?s=>({width:String(s).length*6}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=String(tag).toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this.textContent='';this.hidden=false;this.dataset={};this.parent=null;this.width=300;this.height=150;this.value='';this.offsetWidth=10;
  const self=this;this.classList={add:(...c)=>{for(const x of c)if(!self.classList.contains(x))self.className=(self.className+' '+x).trim()},remove:(...c)=>{self.className=self.className.split(/\s+/).filter(x=>!c.includes(x)).join(' ')},contains:c=>self.className.split(/\s+/).includes(c),toggle:(c,on)=>{const has=self.classList.contains(c);const want=on===undefined?!has:!!on;if(want&&!has)self.classList.add(c);if(!want&&has)self.classList.remove(c);return want}}}
 get isConnected(){let n=this;while(n.parent)n=n.parent;return n===doc}
 append(...n){for(const c of n){if(typeof c==='string')continue;c.parent=this;this.children.push(c)}}
 setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]}
 addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f)}removeEventListener(){}
 emit(t,e={}){for(const f of this.listeners[t]||[])f({target:this,preventDefault(){},stopPropagation(){},clientX:0,clientY:0,button:0,pointerId:1,...e})}
 getContext(){return this.tagName==='CANVAS'?(this._ctx=this._ctx||fakeCtx()):null}
 toDataURL(){return 'data:image/jpeg;base64,'+'Q'.repeat(this.width>100?5000:3000)}
 getBoundingClientRect(){return{left:0,top:0,width:parseFloat(this.style.width)||100,height:parseFloat(this.style.height)||100,right:0,bottom:0}}
 appendChild(n){this.append(n);return n}remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}
 setPointerCapture(){}blur(){if(doc.activeElement===this)doc.activeElement=null}focus(){doc.activeElement=this}click(){this.emit('click')}querySelector(){return null}}
const doc=new Node('#document');doc.body=new Node('body');doc.body.parent=doc;doc.createElement=t=>new Node(t);doc.activeElement=null;
const ids={};for(const id of ['phoneLabel','clockLabel','areaLabel','sceneLabel','weatherLabel','timeLabel','hint','game']){ids[id]=new Node(id==='game'?'canvas':'span');ids[id].id=id}
ids.game.width=480;ids.game.height=270;ids.clockLabel.textContent='오후 4:32';ids.areaLabel.textContent='동일초등학교 앞';ids.sceneLabel.textContent='거리';ids.weatherLabel.textContent='비 내림';ids.timeLabel.textContent='늦은 오후';
doc.getElementById=id=>ids[id]||null;doc.querySelector=()=>null;doc.addEventListener=()=>{};
const memory=new Map(),winListeners=[],timers=[],sent=[],subs=new Set(),vib=[],tunes=[];
memory.set('2006_xp_desktop_v1',JSON.stringify({web:{phone:{got:{r1:1}}}}));
class Img{constructor(){this.complete=false;this.naturalWidth=0;this.width=120;this.height=90}set src(v){this._src=v;this.complete=true;this.naturalWidth=120;timers.push({f:()=>this.onload?.(),ms:0})}get src(){return this._src}}
const peers=[{id:'p2',name:'영희',scene:'street',x:1200},{id:'p3',name:'민수',scene:'pcroom',x:300}];
const net={ready:true,id:'p1'};
const w={document:doc,Math,Number,String,Array,Object,JSON,Set,Map,Promise,Date,console,Uint8ClampedArray,
 localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v))},
 innerWidth:1100,innerHeight:760,devicePixelRatio:1,Image:Img,navigator:{userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',maxTouchPoints:0},matchMedia:q=>({matches:false}),
 addEventListener:(t,f,cap)=>winListeners.push({t,f,cap:!!cap}),removeEventListener(){},
 setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout(){},
 performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},GameAudio:{state:{enabled:true,volume:.65},unlock(){}},
 __GAME_DEBUG__:{player:{scene:'street',x:1000},clearInput(){}},
 A25NET:{get state(){return{ready:net.ready,id:net.id,room:'TEST'}},get peers(){return peers.slice()},send:o=>sent.push(o),subscribe(fn){subs.add(fn);return()=>subs.delete(fn)}}};
w.window=w;w.__tunes=tunes;
/* A126: 소리 시험용 가짜 오디오 (시간은 acTime 으로 직접 흘린다) */
let acTime=0;const made={osc:0,buf:0,conv:0,gain:0};
class FakeParam{constructor(v){this.value=v}setValueAtTime(){}linearRampToValueAtTime(){}exponentialRampToValueAtTime(){}cancelScheduledValues(){}}
class FakeNode{constructor(){this.gain=new FakeParam(1);this.frequency=new FakeParam(440);this.Q=new FakeParam(1);this.detune=new FakeParam(0);this.type='';this.buffer=null;this.loop=false}connect(){}disconnect(){}start(){}stop(){}}
class FakeAC{constructor(){this.state='running';this.sampleRate=4000;this.destination=new FakeNode()}get currentTime(){return acTime}createGain(){made.gain++;return new FakeNode()}createOscillator(){made.osc++;return new FakeNode()}
 createBufferSource(){made.buf++;return new FakeNode()}createBiquadFilter(){return new FakeNode()}createConvolver(){made.conv++;return new FakeNode()}createBuffer(ch,n){const d=[];for(let i=0;i<ch;i++)d.push(new Float32Array(n));return{getChannelData:i=>d[i]}}resume(){}}
const audios=[];class FakeAudio{constructor(){this.paused=true;this.volume=1;this.currentTime=0;this.loop=false;this.ev={};audios.push(this)}set src(v){this._src=v}get src(){return this._src}play(){this.paused=false;return{catch(){}}}pause(){this.paused=true}addEventListener(t,f){this.ev[t]=f}}
w.AudioContext=FakeAC;w.Audio=FakeAudio;
vm.createContext(w);

for(const f of ['src/web-town.js']){const WT=read(f);vm.runInContext(WT.match(/function freq\(n\)\{[^\n]*\}/)[0]+'\n'+WT.replace(/^[\s\S]*?(const PLACES=\[)/,'$1').replace(/\nfunction drawWall[\s\S]*?\n(const CONTACTS=)/,'\nfunction drawWall(){}\n$1').replace(/\nconst SMS_ART=[\s\S]*$/,'')+';window.WebTown={PLACES,TOWN_BOARD,TOWN_NOTICE,POLLS,DG_NOTICE,DG_MEAL,DG_HOMEWORK,RINGS,PHONE_WALLS,drawWall,drawTown(){},CONTACTS,freq,MB_NEWS:[["별빛소녀 2집","05.30 11:00","예약 받아요"]],synthPlay(){window.__tunes.push(arguments[0]);return{silent:true,why:"off"}},synthStop(){window.__tunes.push(null)}};',w);vm.runInContext(WT.match(/\nconst SMS_ART=[^\n]*/)[0]+WT.match(/\nconst SONGS=\[[\s\S]*?\n\];/)[0]+';window.WebTown.SMS_ART=SMS_ART;window.WebTown.SONGS=SONGS;',w)}
vm.runInContext(read('src/portal-news.js'),w);vm.runInContext(read('src/portal-comics.js'),w);
for(const f of ['src/anycall-lcd.js','src/anycall-nate.js','src/anycall-games.js','src/anycall-vh.js','src/anycall-phone.js'])vm.runInContext(read(f),w);
const A=w.AnycallPhone,T=A._test,LC=w.AnycallLCD,L=()=>A.lcd;let now=1000;T.setClock(()=>now);
const flush=()=>{for(const t of timers.splice(0))t.f()};
const step=ms=>{const end=now+ms;while(now<end){now+=16;T.step(now)}};
const findCls=(n,c)=>{if(String(n.className||'').split(/\s+/).includes(c))return n;for(const ch of n.children||[]){const r=findCls(ch,c);if(r)return r}return null};
assert.equal(A.version,'A126');
A.show('full');flush();step(300);
assert.equal(T.bigOn(),false,'처음에는 휴대폰 그대로');
const lcdBtn=findCls(doc.body,'ac-lcd'),opt=findCls(doc.body,'ac-opt');assert.ok(lcdBtn&&opt,'액정 크기 단추와 옵션 창');assert.equal(lcdBtn.hidden,false,'컴퓨터 전체화면에서는 보임');
assert.equal(opt.hidden,true);lcdBtn.click();assert.equal(opt.hidden,false,'옵션 창 열기');
const list=findCls(opt,'ac-opt-list');assert.equal(list.children.length,3,'세 가지 크기');
/* 슬라이드를 닫아 둔 채로 큰 액정을 고르면 아래판이 열린 것으로 친다 */
A.slide(false);step(400);const lcd=A.lcd;lcd.go&&lcd.home&&lcd.home();step(50);
list.children[1].click();step(50);assert.equal(T.bigOn(),true,'액정 크게');assert.equal(T.prefs.big,1);
const c=T.canvas,cw=parseFloat(c.style.width),ch=parseFloat(c.style.height);assert.ok(Math.abs(cw/ch-498/617)<.01,'액정 비율 '+cw+'x'+ch);assert.ok(ch>=500,'크게 '+ch);
assert.equal(findCls(doc.body,'ac-root').className.includes('ac-big'),true);
assert.equal(A.press('5'),true,'아래판을 안 열어도 숫자 키가 들어간다');assert.equal(A.press('*'),true);
const before=A.lcd.screen;
list.children[2].click();step(50);const ch2=parseFloat(T.canvas.style.height);assert.ok(ch2>ch,'화면 가득은 더 크게 '+ch2);
/* 그리기와 누르기: 몸통 그림 없이 액정만 */T.paint();assert.ok(!T.cache.front&&T.cache.lcd,'몸통 그림은 만들지 않음');
const cv=T.canvas;cv.emit('pointerdown',{clientX:10,clientY:10});
/* 간편모드로 가면 예전 그대로 */
const seg=findCls(doc.body,'ac-seg');seg.children[0].click();step(50);assert.equal(T.bigOn(),false,'간편모드에서는 큰 액정 아님');assert.equal(lcdBtn.hidden,true,'간편모드에서는 단추 숨김');
seg.children[1].click();step(50);assert.equal(T.bigOn(),true,'전체화면으로 돌아오면 다시 큰 액정');
list.children[0].click();step(50);assert.equal(T.bigOn(),false,'휴대폰 그대로');assert.ok(T.cache.front,'몸통 그림 다시');
/* 설정이 기억된다 */assert.equal(JSON.parse(memory.get('2006_anycall_ui_v1')).big,0);
console.log('큰 액정 검사 통과');
