'use strict';
/* A126 (2026-11-18 KST): 휴대폰 게임 「모바일 신맞고」(src/anycall-gostop.js)를 검사한다.
   화투 50장, 점수(광, 비광, 고도리, 홍단, 청단, 초단, 피, 쌍피, 국진, 멍따), 쪽, 뻑, 뻑 먹기, 자뻑, 따닥, 싹쓸이, 폭탄과 빈 패, 흔들기, 보너스 피,
   고와 스톱, 마지막 패 저절로 스톱, 계산(고 점수, 흔들기, 피박, 광박, 고박, 나가리 판), 나가리, 세 번 뻑, 총통,
   컴퓨터끼리 400판(패 수와 다시 보기), 화면(제목, 규칙, 전적, 설정, 상대 고르기, 판, 결과, 한 판 더, 멈춤, 용돈 받기), NATE 목록. */
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
w.window=w;w.__tunes=tunes;vm.createContext(w);

for(const f of ['src/web-town.js']){const WT=read(f);vm.runInContext(WT.match(/function freq\(n\)\{[^\n]*\}/)[0]+'\n'+WT.replace(/^[\s\S]*?(const PLACES=\[)/,'$1').replace(/\nfunction drawWall[\s\S]*?\n(const CONTACTS=)/,'\nfunction drawWall(){}\n$1').replace(/\nconst SMS_ART=[\s\S]*$/,'')+';window.WebTown={PLACES,TOWN_BOARD,TOWN_NOTICE,POLLS,DG_NOTICE,DG_MEAL,DG_HOMEWORK,RINGS,PHONE_WALLS,drawWall,drawTown(){},CONTACTS,freq,MB_NEWS:[["별빛소녀 2집","05.30 11:00","예약 받아요"]],synthPlay(){window.__tunes.push(arguments[0]);return{silent:true,why:"off"}},synthStop(){window.__tunes.push(null)}};',w);vm.runInContext(WT.match(/\nconst SMS_ART=[^\n]*/)[0]+WT.match(/\nconst SONGS=\[[\s\S]*?\n\];/)[0]+';window.WebTown.SMS_ART=SMS_ART;window.WebTown.SONGS=SONGS;',w)}
vm.runInContext(read('src/portal-news.js'),w);vm.runInContext(read('src/portal-comics.js'),w);
for(const f of ['src/anycall-lcd.js','src/anycall-nate.js','src/anycall-games.js','src/anycall-vh.js','src/anycall-gostop.js','src/anycall-phone.js'])vm.runInContext(read(f),w);
const A=w.AnycallPhone,T=A._test,LC=w.AnycallLCD,L=()=>A.lcd;let now=1000;T.setClock(()=>now);
const flush=()=>{for(const t of timers.splice(0))t.f()};
const step=ms=>{const end=now+ms;while(now<end){now+=16;T.step(now)}};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=16;T.step(now);L().event('keyup',k);now+=16;T.step(now)}};
/* 0. 파일, 버전, 읽는 순서 */
const html=read('index.html');const at=f=>html.search(new RegExp('<script src="'+f.replace(/[.]/g,'\\.')+'[?]v=A1\\d\\d"></script>'));
assert.ok(at('src/anycall-vh.js')>0&&at('src/anycall-gostop.js')>at('src/anycall-vh.js')&&at('src/anycall-phone.js')>at('src/anycall-gostop.js'),'읽는 순서: 반 헬싱 → 신맞고 → 몸체');
{const s=read('src/anycall-gostop.js');assert.ok(s.includes('A126')&&s.includes('2026-11-18'),'버전과 날짜');assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음')}
assert.equal(w.AnycallGostop.version,'A126');
A.show('full');flush();A.slide(true);step(300);
const D=L().data;D.got=D.got||{};const GS=L().gostop;assert.ok(GS&&GS.screens.gostop,'신맞고 화면');const X=GS._test,U=X.U,C=X.CARDS;
/* 1. 게임 목록과 NATE */
assert.ok(w.AnycallLCD.version==='A126');const cat=w.AnycallNate.CATALOG.find(c=>c.id==='gostop');assert.ok(cat&&cat.play&&cat.big&&cat.price===3000&&cat.how.includes('고')&&cat.reviews.length>=4,'NATE 목록에 신맞고');
assert.ok(!w.AnycallNate.CATALOG.some(c=>c.id==='g6'),'장식용 고스톱 한판은 진짜 게임으로 바뀜');
{const g=doc.createElement('canvas').getContext('2d');w.AnycallGostop.preview(g,'gostop',1000,72,88)}
assert.equal(C.length,50,'화투 48장 + 보너스 2장');
{const by=k=>C.filter(c=>c.k===k).length;assert.equal(by('gwang'),5);assert.equal(by('yeol'),9);assert.equal(by('tti'),10);assert.equal(by('ssang'),2);assert.equal(by('bonus'),2);assert.equal(by('pi'),22)}
/* 2. 점수 */
const cid=(m,k,s,n)=>C.filter(c=>c.m===m&&c.k===k&&(s==null||c.s===s))[n||0].id;const cs=ids=>ids.map(i=>C[i]);
const G1=cid(1,'gwang'),G3=cid(3,'gwang'),G8=cid(8,'gwang'),G11=cid(11,'gwang'),G12=cid(12,'gwang');
assert.equal(X.tallyOf(cs([G1,G3,G8])).P.gwang,3,'삼광 3점');assert.equal(X.tallyOf(cs([G1,G3,G12])).P.gwang,2,'비광 끼면 2점');
assert.equal(X.tallyOf(cs([G1,G3,G8,G12])).P.gwang,4,'사광 4점');assert.equal(X.tallyOf(cs([G1,G3,G8,G11,G12])).P.gwang,15,'오광 15점');
assert.equal(X.tallyOf(cs([cid(2,'yeol'),cid(4,'yeol'),cid(8,'yeol')])).P.godori,5,'고도리 5점');
assert.equal(X.tallyOf(cs([cid(1,'tti'),cid(2,'tti'),cid(3,'tti')])).P.hong,3,'홍단');assert.equal(X.tallyOf(cs([cid(6,'tti'),cid(9,'tti'),cid(10,'tti')])).P.cheong,3,'청단');assert.equal(X.tallyOf(cs([cid(4,'tti'),cid(5,'tti'),cid(7,'tti')])).P.cho,3,'초단');
{const pis=C.filter(c=>c.k==='pi').slice(0,10).map(c=>c.id);assert.equal(X.tallyOf(cs(pis)).P.pi,1,'피 10장 1점');const p8=pis.slice(0,8).concat([cid(11,'ssang')]);assert.equal(X.tallyOf(cs(p8)).pi,10,'쌍피는 두 장');
 const ye=[cid(5,'yeol'),cid(6,'yeol'),cid(7,'yeol'),cid(10,'yeol')];assert.equal(X.scoreOf(cs([...ye,cid(9,'yeol')])).P.yeol,1,'국진을 열끗으로 세면 다섯 장');
 const s2=X.scoreOf(cs([...pis.slice(0,8),cid(9,'yeol')]));assert.equal(s2.pi,10,'국진을 쌍피로 세서 피 10장');assert.equal(s2.P.pi,1);
 const y7=C.filter(c=>c.k==='yeol'&&c.s!=='gukjin').slice(0,7).map(c=>c.id);assert.ok(X.tallyOf(cs(y7)).mung,'멍따 (열끗 일곱 장)')}
/* 3. 정해 둔 판으로 규칙 확인 */
function mk(o){const st=X.newGame({seed:5,level:1});st.ops=[];st.over=null;st.ppeok={};st.ppeokRun=[0,0];st.goN=[0,0];st.goScore=[0,0];st.shake=[0,0];st.shook=[{},{}];st.said=[{},{}];
 st.z={deck:(o.deck||[]).slice().reverse(),floor:o.floor||[],hand:[o.h0||[],o.h1||[]],cap:[o.c0||[],o.c1||[]],stage:[],meta:{}};st.turn=0;st.need={type:'pick',p:o.p||0};return st}
const fxs=st=>st.ops.filter(o=>o.op==='fx').map(o=>o.kind);const capHas=(st,p,ids)=>ids.every(i=>st.z.cap[p].includes(i));
const P1=C.filter(c=>c.k==='pi'&&c.m===1).map(c=>c.id),P2=C.filter(c=>c.k==='pi'&&c.m===2).map(c=>c.id),P3=C.filter(c=>c.k==='pi'&&c.m===3).map(c=>c.id);
/* 쪽 */{const y6=cid(6,'yeol'),p6=cid(6,'pi'),st=mk({floor:[cid(3,'tti')],h0:[y6,cid(4,'pi')],h1:[cid(5,'pi')],deck:[p6,cid(8,'pi'),cid(8,'pi',null,1)],c1:[P1[0],P1[1]]});
 assert.ok(X.pick(st,0,y6));assert.ok(fxs(st).includes('jjok'),'쪽');assert.ok(capHas(st,0,[y6,p6]),'쪽: 두 장 먹기');assert.ok(st.z.cap[0].includes(P1[0])||st.z.cap[0].includes(P1[1]),'쪽: 피 한 장 뺏기');assert.equal(st.need.type,'pick');assert.equal(st.need.p,1)}
/* 뻑, 그리고 상대가 뻑 먹기 */{const t6=cid(6,'tti'),y6=cid(6,'yeol'),p6=cid(6,'pi'),p6b=cid(6,'pi',null,1);
 const st=mk({floor:[t6,cid(3,'tti')],h0:[y6,cid(4,'pi')],h1:[p6b,cid(5,'pi')],deck:[p6,cid(8,'pi'),cid(8,'pi',null,1)],c0:[P1[0],P2[0]]});
 X.pick(st,0,y6);assert.ok(fxs(st).includes('ppeok'),'뻑');assert.equal(JSON.stringify(st.ppeok[6]),'{"by":0}');assert.equal(st.z.floor.filter(i=>C[i].m===6).length,3,'뻑: 세 장이 바닥에 남음');
 st.ops=[];X.pick(st,1,p6b);assert.ok(fxs(st).includes('ppeokEat'),'뻑 먹기');assert.ok(capHas(st,1,[t6,y6,p6,p6b]),'넉 장 다 먹음');assert.ok(!st.ppeok[6]);assert.equal(st.z.cap[1].filter(i=>P1.includes(i)||P2.includes(i)).length,1,'피 한 장 뺏김')}
/* 자뻑: 내가 싼 뻑을 내가 먹으면 두 장 */{const t6=cid(6,'tti'),y6=cid(6,'yeol'),p6=cid(6,'pi'),p6b=cid(6,'pi',null,1);
 const st=mk({floor:[t6,cid(3,'tti')],h0:[y6,p6b],h1:[cid(5,'pi'),cid(5,'tti')],deck:[p6,cid(8,'pi'),cid(8,'pi',null,1),cid(9,'pi'),cid(9,'pi',null,1)],c1:[P1[0],P1[1],P2[0]]});
 X.pick(st,0,y6);X.pick(st,1,cid(5,'pi'));st.ops=[];X.pick(st,0,p6b);assert.ok(fxs(st).includes('jappeok'),'자뻑');assert.equal(st.z.cap[0].filter(i=>[P1[0],P1[1],P2[0]].includes(i)).length,2,'자뻑: 피 두 장')}
/* 따닥 */{const t6=cid(6,'tti'),y6=cid(6,'yeol'),p6=cid(6,'pi'),p6b=cid(6,'pi',null,1);const st=mk({floor:[t6,p6],h0:[y6,cid(4,'pi')],h1:[cid(5,'pi')],deck:[p6b,cid(8,'pi')],c1:[P1[0]]});
 X.pick(st,0,y6);assert.equal(st.need.type,'match','같은 달 두 장이면 고르기');assert.deepEqual([...st.need.options].sort(),[t6,p6].sort());X.chooseMatch(st,0,t6);
 assert.ok(fxs(st).includes('ttadak'),'따닥');assert.ok(capHas(st,0,[t6,y6,p6,p6b,P1[0]]),'따닥: 넉 장 + 피 한 장')}
/* 싹쓸이 */{const t6=cid(6,'tti'),y6=cid(6,'yeol'),p7=cid(7,'pi'),y7=cid(7,'yeol');const st=mk({floor:[t6,p7],h0:[y6,cid(4,'pi')],h1:[cid(5,'pi')],deck:[y7,cid(8,'pi')],c1:[P1[0]]});
 X.pick(st,0,y6);assert.equal(st.z.floor.length,0);assert.ok(fxs(st).includes('sweep'),'싹쓸이');assert.ok(st.z.cap[0].includes(P1[0]),'싹쓸이: 피 뺏기')}
/* 폭탄과 빈 패 */{const y9=cid(9,'yeol'),t9=cid(9,'tti'),p9=cid(9,'pi'),p9b=cid(9,'pi',null,1);const st=mk({floor:[p9b,cid(3,'tti')],h0:[y9,t9,p9,cid(4,'pi')],h1:[cid(5,'pi'),cid(5,'tti')],deck:[cid(8,'pi'),cid(8,'pi',null,1),cid(10,'pi')],c1:[P1[0]]});
 assert.ok(X.canBomb(st,0,y9));X.pick(st,0,y9,{bomb:true});assert.ok(fxs(st).includes('bomb'),'폭탄');assert.ok(capHas(st,0,[y9,t9,p9,p9b,P1[0]]),'폭탄: 넉 장 + 피');assert.equal(st.shake[0],1,'폭탄은 흔들기 한 번');
 const dummies=st.z.hand[0].filter(i=>i>=100);assert.equal(dummies.length,2,'빈 패 두 장');X.pick(st,1,cid(5,'pi'));const before=st.z.hand[0].length;X.pick(st,0,dummies[0]);assert.equal(st.z.hand[0].length,before-1,'빈 패는 내기만 하고 뒤집는다');assert.ok(!st.z.hand[0].includes(dummies[0]))}
/* 흔들기 */{const y10=cid(10,'yeol'),t10=cid(10,'tti'),p10=cid(10,'pi');const st=mk({floor:[cid(3,'tti')],h0:[y10,t10,p10],h1:[cid(5,'pi')],deck:[cid(8,'pi'),cid(8,'pi',null,1)]});
 assert.ok(X.canShake(st,0,y10));X.pick(st,0,y10,{shake:true});assert.ok(fxs(st).includes('shake'));assert.equal(st.shake[0],1);assert.ok(!X.canShake(st,0,t10),'같은 달은 한 번만 흔든다')}
/* 보너스 피: 내면 먹고 한 장 더 받고 계속 */{const b2=C.find(c=>c.k==='bonus'&&c.pv===2).id;const st=mk({floor:[cid(3,'tti')],h0:[b2,cid(4,'pi')],h1:[cid(5,'pi')],deck:[cid(8,'pi'),cid(8,'pi',null,1)]});
 X.pick(st,0,b2);assert.ok(st.z.cap[0].includes(b2));assert.equal(st.z.hand[0].length,2,'더미에서 한 장 받음');assert.equal(st.need.p,0,'내 차례 계속')}
/* 고와 스톱 */{const st=mk({floor:[cid(3,'tti'),cid(6,'tti')],h0:[cid(3,'pi'),cid(4,'pi'),cid(4,'pi',null,1)],h1:[cid(5,'pi'),cid(5,'tti'),cid(7,'pi')],deck:[cid(8,'pi'),cid(8,'pi',null,1),cid(10,'pi'),cid(10,'pi',null,1)],c0:[G1,G8,G11,cid(1,'tti'),cid(2,'tti'),cid(4,'tti'),cid(5,'tti')]});
 X.pick(st,0,cid(3,'pi'));assert.equal(st.need.type,'gostop','7점이면 고/스톱');assert.equal(st.need.score,7);X.goStop(st,0,true);assert.equal(st.goN[0],1);assert.ok(fxs(st).includes('go'));assert.equal(st.need.type,'pick');assert.equal(st.need.p,1);
 X.pick(st,1,cid(5,'pi'));X.pick(st,0,cid(4,'pi'));assert.ok(!st.over,'점수가 안 오르면 계속');
 const s3=mk({floor:[cid(3,'tti')],h0:[cid(3,'pi'),cid(4,'pi')],h1:[cid(5,'pi')],deck:[cid(8,'pi'),cid(8,'pi',null,1)],c0:[G1,G8,G11,cid(1,'tti'),cid(2,'tti'),cid(4,'tti'),cid(5,'tti')]});X.pick(s3,0,cid(3,'pi'));X.goStop(s3,0,false);assert.ok(s3.over&&s3.over.winner===0,'스톱하면 끝');assert.ok(fxs(s3).includes('stop'))}
/* 마지막 패로 7점이면 저절로 스톱 */{const st=mk({floor:[cid(3,'tti')],h0:[cid(3,'pi')],h1:[],deck:[cid(8,'pi')],c0:[G1,G8,G11,cid(1,'tti'),cid(2,'tti'),cid(4,'tti'),cid(5,'tti')]});X.pick(st,0,cid(3,'pi'));assert.ok(st.over&&st.over.winner===0,'손이 비면 스톱')}
/* 계산: 고, 흔들기, 피박, 광박, 고박, 나가리 판 */{const st=mk({c0:[G1,G3,G8,...C.filter(c=>c.k==='pi').slice(0,12).map(c=>c.id)],c1:[P3[0]]});st.goN=[1,1];st.shake=[1,0];st.nagari=1;
 const R=X.settlement(st,0);const names=R.mults.map(m=>m[0]);for(const n of ['흔들기','피박','광박','고박','나가리 판'])assert.ok(names.includes(n),'배수 '+n);assert.equal(R.base,3+3);assert.equal(R.pts,7,'1고 +1점');assert.equal(R.mult,32);assert.equal(R.final,224);
 st.goN=[3,0];st.shake=[0,0];st.nagari=0;const R3=X.settlement(st,0);assert.equal(R3.pts,9,'3고: +3점');assert.ok(R3.mults.some(m=>m[0]==='3고'&&m[1]===2),'3고 두 배')}
/* 나가리 */{const st=mk({floor:[cid(3,'tti')],h0:[cid(4,'pi')],h1:[cid(5,'pi')],deck:[cid(8,'pi'),cid(10,'pi')]});X.pick(st,0,cid(4,'pi'));X.pick(st,1,cid(5,'pi'));assert.ok(st.over&&st.over.draw,'나가리');assert.equal(st.over.nagari,1);assert.ok(fxs(st).includes('nagari'))}
/* 세 번 연속 뻑 */{const t6=cid(6,'tti'),y6=cid(6,'yeol'),p6=cid(6,'pi');const st=mk({floor:[t6,cid(3,'tti')],h0:[y6,cid(4,'pi')],h1:[cid(5,'pi')],deck:[p6,cid(8,'pi')]});st.ppeokRun[0]=2;X.pick(st,0,y6);assert.ok(st.over&&st.over.special==='ppeok3'&&st.over.pts===10,'세 번 뻑 승리')}
/* 총통 (처음 받은 패에 같은 달 넉 장) */{let found=null;for(let sd=1;sd<4000&&!found;sd++){const st=X.newGame({seed:sd*13+1});if(st.over&&st.over.special==='chongtong')found=st}assert.ok(found,'총통 판 찾음');assert.equal(found.over.final,10*(found.nagari?2:1));assert.ok(fxs(found).includes('chongtong'))}
/* 4. 컴퓨터끼리 많이: 패 수, 다시 보기, 끝맺음 */{const kinds={};let draws=0;for(let gi=0;gi<400;gi++){const st=X.newGame({seed:gi*7919+11,first:gi%2,level:gi%3});X.playOut(st,700);assert.ok(st.over,'판이 끝남 '+gi);
  const view=X.newZones();view.deck=st.deck0.slice();for(const op of st.ops){X.applyOp(view,op);if(op.op==='fx')kinds[op.kind]=(kinds[op.kind]||0)+1}
  const all=z=>[...z.deck,...z.floor,...z.stage,...z.hand[0],...z.hand[1],...z.cap[0],...z.cap[1]].filter(i=>i<100).sort((a,b)=>a-b);const a=all(st.z);assert.equal(a.length,50);assert.equal(new Set(a).size,50,'같은 패 두 번 없음');
  assert.equal(JSON.stringify(a),JSON.stringify(all(view)),'다시 보기 판과 같음');assert.equal(st.z.stage.length,0);if(st.over.draw)draws++;else if(!st.over.special)assert.ok(st.over.base>=7,'7점 이상이어야 이김')}
 for(const k of ['ppeok','jjok','sweep','bomb','go','stop','gwang','bonus'])assert.ok(kinds[k]>0,'컴퓨터 판에서 나온 일: '+k)}
/* 5. 화면: 제목 → 상대 고르기 → 판 → 결과 → 한 판 더 */
press('end');D.got.gostop=1;L().go('gostop');step(60);assert.equal(L().screen,'gostop');assert.equal(U.mode,'title');
assert.equal(X.screen.ownsSound('5'),true);press('down');assert.equal(U.sel,1);press('ok');assert.equal(U.mode,'help');press('right');assert.equal(U.help,1);press('clr');assert.equal(U.mode,'title');
press('down','ok');assert.equal(U.mode,'rec');press('clr');press('down','ok');assert.equal(U.mode,'set');const gd=X.gsData();const bg=gd.bgm;press('ok');assert.equal(gd.bgm,bg?0:1,'설정 바꾸기');press('ok');press('clr');
U.sel=0;press('ok');assert.equal(U.mode,'opp');press('down');assert.equal(U.opp,2);press('up','up');assert.equal(U.opp,0);const m0=gd.money;press('ok');assert.equal(U.mode,'play');assert.ok(U.st&&U.V);
step(4000);assert.ok(X.idle(now),'나눠 주기 끝');assert.equal(U.V.hand[0].length+(U.st.over?0:0),U.st.z.hand[0].length);
let guard=0,choices={};while(!U.res&&guard++<900){const st=U.st;if(U.choice){choices[U.choice.type]=1;press(U.choice.type==='gostop'?'3':'ok');step(100);continue}
 if(st.need&&st.need.type==='pick'&&st.need.p===0&&X.idle(now)){const h=U.V.hand[0];let pick=0;for(let i=0;i<h.length;i++){const c=X.card(st,h[i]);if(U.V.floor.some(f=>X.card(st,f).m===c.m)){pick=i;break}}press(String((pick+1)%10));step(60);continue}
 step(120)}
assert.ok(U.res,'결과 화면');step(3000);
if(U.res.draw)assert.ok(U.nagari>=1,'나가리 판 이어짐');else{const R=U.res;assert.equal(gd.money,R.win?m0+R.money:Math.max(0,m0-R.money),'돈 계산');assert.equal(R.money,R.R.final*X.OPP[0].stake)}
assert.ok(/원|새 게임/.test(GS.summary()));
press('ok');assert.ok(!U.res&&U.mode==='play','한 판 더');step(3000);
/* 멈춤 차림표 */press('menu');assert.ok(U.pause,'멈춤');press('down','ok');press('clr');assert.ok(!U.pause);
L().event('hide');assert.ok(U.pause,'휴대폰을 넣으면 멈춤');press('clr');
/* 돈이 모자라면 시작하지 않고, 전적에서 돈 받기 */gd.money=0;press('menu','down','down','down','ok');assert.equal(U.mode,'title');U.sel=0;press('ok','ok');assert.equal(U.mode,'opp','돈이 없으면 시작 안 함');press('clr');U.sel=2;press('ok','ok');assert.equal(gd.money,30000,'용돈 받기');assert.equal(gd.refill,1);
console.log('모바일 신맞고 검사 통과',JSON.stringify(choices));
