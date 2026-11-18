'use strict';
/* A126 (2026-11-18 KST): 「반 헬싱 : 흡혈귀전」 새 그림과 소리를 검사한다.
   그림 파일 아홉 장과 제목 음악을 그대로 넣었는지, 제목 mp3 재생과 멈춤과 실패할 때 합성 오르간, 배경 음악이 끊기지 않고 계속 연주되는지(A125 버그),
   곳마다 다른 곡(진료소, 저택, 하얀 귀부인의 방), 주변 소리, 짧은 가락, 주인공 · 괴물 · 우두머리 · 물건 · 벽 · 땅 · 얼굴 큰 그림, 도트 그림으로 바꾸기, 그림이 없을 때. */
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
 innerWidth:1100,innerHeight:760,devicePixelRatio:1,Image:Img,navigator:{userAgent:'Mozilla/5.0 (Linux; Android 13; SM-S911N) Mobile',maxTouchPoints:5,vibrate:p=>{vib.push(p);return true}},matchMedia:q=>({matches:/coarse/.test(q)}),
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
const step=ms=>{const end=now+ms;while(now<end){now+=16;acTime+=.016;T.step(now)}};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=16;T.step(now);L().event('keyup',k);now+=16;T.step(now)}};
/* 0. 그림 파일과 제목 음악 파일 (그대로 넣었는지) */
const VHD=['반헬싱_주인공.webp','MOBILE_반헬싱_괴물.webp','MOBILE_반헬싱_우두머리.webp','MOBILE_반헬싱_얼굴.webp','MOBILE_반헬싱_땅칸.webp','MOBILE_반헬싱_벽.webp','MOBILE_반헬싱_물건.webp','MOBILE_반헬싱_제목화면.webp','MOBILE_반헬싱_머리말.webp'];
for(const f of VHD){const b=fs.readFileSync(path.join(ROOT,'assets/vh',f));assert.equal(b.slice(0,4).toString(),'RIFF','webp '+f);assert.equal(b.slice(8,12).toString(),'WEBP')}
{const b=fs.readFileSync(path.join(ROOT,'assets/vh/Shadow_of_the_Organ_main_title.mp3'));assert.equal(b.length,509074,'제목 음악 크기 그대로');assert.ok(b[0]===0x49||b[0]===0xff,'mp3 머리')}
const vsrc=read('src/anycall-vh.js');for(const f of VHD)assert.ok(vsrc.includes(f),'그림 이름 '+f);assert.ok(vsrc.includes('Shadow_of_the_Organ_main_title.mp3'));
assert.equal(w.AnycallVH.version,'A126');
A.show('full');flush();A.slide(true);step(300);
const D=L().data;D.got=D.got||{};D.got.vh=1;const VH=L().vh,X=VH._test,G=X.G,AU=X.AU,IM=X.IM;
/* 1. 제목 음악: mp3 를 틀고, 멈추면 멈춘다 */
L().go('vh');step(200);flush();assert.equal(G.mode,'title');assert.equal(AU.cur,'title');assert.ok(AU.mp3on,'제목에서는 mp3');const au=audios[audios.length-1];
assert.ok(au&&/assets\/vh\/Shadow_of_the_Organ_main_title\.mp3$/.test(au.src),'mp3 주소');assert.equal(au.loop,true);step(100);assert.equal(au.paused,false,'재생 중');assert.ok(au.volume>0&&au.volume<=1);
X.stopMusic();assert.equal(au.paused,true,'멈춤');
/* mp3 를 못 읽으면 예전 합성 오르간으로 */{AU.mp3bad=0;X.playMusic('title',true);au.ev.error&&au.ev.error();assert.ok(AU.mp3bad,'mp3 실패 표시');assert.ok(AU.song&&AU.song.id==='title','합성 오르간으로 바꿈');AU.mp3bad=0;AU.mp3=null}
/* 2. 배경 음악이 계속 연주된다 (A125 에서는 첫 순간에 멈췄다) */
X.newGame('normal');X.startPlay();step(50);assert.equal(G.mode,'play');
X.playMusic('village',true);const o0=made.osc;for(let i=0;i<120;i++)step(50);assert.ok(AU.song&&AU.song.id==='village','6초 뒤에도 연주 중');assert.ok(made.osc-o0>40,'음표가 계속 나옴 '+(made.osc-o0));
assert.ok(AU.wet,'잔향');assert.ok(made.conv>=1);
for(const [m,want] of [['clinic','clinic'],['mansion','manor'],['inn','inn'],['church','church']]){X.enterMap(m,5.5,5.5,[1,1]);step(60);assert.equal(AU.cur,want,'곳마다 음악 '+m)}
X.enterMap('crypt2',6.5,6.5,[1,1]);step(60);assert.equal(AU.cur,G.s.flags.lucia_dead?'crypt':'lament','하얀 귀부인의 방');
/* 3. 주변 소리 */
X.enterMap('village',12.5,14.5,[1,1]);step(100);assert.equal(X.ambKind(),G.s.flags.night?'crickets':'wind');assert.equal(AU.ambK,X.ambKind(),'주변 소리 켜짐');
X.enterMap('crypt1',5.5,5.5,[1,1]);step(100);assert.equal(AU.ambK,'deep');X.enterMap('church',6.5,9.5,[1,1]);step(100);assert.equal(AU.ambK,'hall');
G.s.opt.sfx=0;step(100);assert.equal(AU.ambK,null,'효과음을 끄면 주변 소리도 끔');G.s.opt.sfx=1;
/* 4. 짧은 가락: 배경 음악을 잠깐 줄인다 */X.playMusic('church',true);const g0=made.gain;X.jingle('victory');assert.ok(made.gain>g0);assert.ok(AU.duckUntil>acTime,'음악 줄이기');step(200);assert.ok(AU.song,'가락 뒤에도 음악');
/* 불길한 가락: 라슬로가 정체를 드러낼 때, 루치아가 깨어날 때 */{for(const k of ['guestReveal','lucia'])assert.ok(JSON.stringify(X.EV[k](G.s)).includes('["jingle","dread"]'),'불길한 가락 '+k);X.playMusic('church',true);AU.duckUntil=0;G.sc=null;G.dlg=null;G.ask=null;G.menu=null;X.runScript([['jingle','dread']]);step(100);assert.ok(AU.duckUntil>acTime,'대본으로 가락');step(200);G.sc=null}
/* 5. 그림: 새 그림이면 큰 그림, 도트로 바꾸면 예전 그림 */
step(50);flush();assert.ok(IM.use,'새 그림 사용');assert.ok(IM.rs>=2&&IM.rs<=3,'배율 '+IM.rs);
{const s=X.sprite('hero','se_stand',0,{});assert.ok(s&&s.hi,'주인공 새 그림');assert.ok(Math.abs(s.h-27)<1.5,'키 27 '+s.h);const f=X.sprite('hero','se_stand',0,{flip:true});assert.ok(Math.abs((f.w-f.ax)-s.ax)<.01,'뒤집으면 발 자리도 뒤집힘');
 for(const n of ['se_w1','se_w2','se_atk','se_cast','se_roll','ne_stand','ne_w1','ne_w2','ne_atk','ne_cast','ne_roll','dead'])assert.ok(X.sprite('hero',n,0,{}).hi,'주인공 '+n);
 for(const [set,i,o] of [['wolf',0,{}],['wolf',2,{remap:'wolfB'}],['bat',1,{}],['ghoul',2,{}],['skel',1,{}],['vamp',3,{remap:'spawn'}],['vamp',2,{}],['rat',0,{}],['crow',1,{}],['alpha',2,{}],['knight',1,{}],['lucia',2,{}],['bones',0,{}]]){const m=X.sprite('mon',set,i,o);assert.ok(m&&m.hi&&m.w>0&&m.h>0,'괴물 '+set+i)}
 assert.ok(X.sprite('mon','wolf',0,{mode:'white'}).hi,'맞으면 하얗게');assert.ok(X.sprite('hero','se_stand',0,{mode:'sil'}).hi,'가려지면 실루엣');
 assert.ok(X.sprite('npc','marta',0,{}).hi!==1,'동네 사람은 도트 그림');
 for(const k of ['pine','dead','grave','cross','statue','candle','brazier','lamp','urn','crate','barrel','chest','chestO','coffin','coffinO','well','altar','bed','table','pew','organ','wagon','firepit','forge'])assert.ok(X.propCv(k,0).hi,'물건 '+k);
 assert.ok(!X.propCv('bush',0).hi,'그림 없는 물건은 도트');
 for(const [c,d] of [['#',''],['H','winl'],['R',''],['C','gwinr'],['S',''],['X','nichel'],['I','paintr'],['L',''],['F',''],['O',''],['|',''],['D','doorl']]){const cu=X.cubeCv(c,d,false,0);assert.ok(cu&&cu.hi,'벽 '+c+d)}
 assert.ok(X.cubeCv('#','',false,6).hi,'낮은 벽');
 for(const ch of ['.',',',';',':','_','=','-','"','~','b','%','*','+','w'])assert.ok(X.floorHi(ch,1,0),'땅 '+ch);
 assert.ok(X.faceImg('marta',44,48),'얼굴');assert.ok(X.faceImg('villagerW',44,48),'마을 아주머니 얼굴');
}
X.setArtPref('dot');step(50);assert.ok(!IM.use,'도트 그림');assert.ok(!X.sprite('hero','se_stand',0,{}).hi);X.setArtPref('new');step(50);assert.ok(IM.use);
/* 6. 설정 차림표에 그림 고르기 */
{G.sc=null;G.dlg=null;G.ask=null;G.menu=null;G.card=null;G.tele=null;G.shop=null;G.fade={a:0,v:0,cb:null};if(G.hero)G.hero.st='idle';X.openPause();const M=G.menu;assert.ok(M,'멈춤 열림');M.sub='opt';const items=X.menuItems();const it=items.find(x=>x.k==='art');assert.ok(it&&it.sub==='새 그림','설정: 그림');M.sel=items.indexOf(it);press('ok');assert.equal(X.artOn(),false,'도트로 바꿈');press('ok');assert.equal(X.artOn(),true);press('menu');}
/* 7. 그림 파일을 못 읽으면 도트 그림으로 */{IM.bad.hero=1;X.dropHi&&0;step(50);assert.ok(!IM.use,'주인공 그림이 없으면 도트');IM.bad.hero=0;step(50);assert.ok(IM.use)}
/* 8. 오래 걸리면 배율 낮추기 */{IM.rs=3;IM.cap=3;IM.use=true;for(let i=0;i<120;i++)X.drawCost?X.drawCost(20):0}
console.log('반 헬싱 A126 (그림, 소리) 검사 통과',made.osc,made.conv);
