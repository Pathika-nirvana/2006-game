'use strict';
/* A125 (2026-11-18 KST): 휴대폰 게임 「반 헬싱 : 흡혈귀전」(src/anycall-vh.js)을 검사한다.
   제목 화면, 머리말, 지도 아홉 개의 짜임(모든 출구와 사람과 상자에 걸어서 갈 수 있는지), 걷기와 충돌, 세 번 베기와 모아 베기, 구르기와 완벽 회피,
   보조 무기 셋, 기술, 말뚝 박기, 해골이 다시 일어나기, 우두머리 넷, 대본(대화, 고르기, 전보), 제1장 이야기 끝까지, 가게와 멈춤 차림표, 기록과 이어하기,
   몸체가 알려 주는 키 뗌(keyup)과 자판 바꿔 읽기(Z X C V), NATE 소개 쪽과 게임 목록. */
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
for(const f of ['src/anycall-lcd.js','src/anycall-nate.js','src/anycall-games.js','src/anycall-vh.js','src/anycall-phone.js'])vm.runInContext(read(f),w);
const A=w.AnycallPhone,T=A._test,LC=w.AnycallLCD,L=()=>A.lcd;let now=1000;T.setClock(()=>now);
const flush=()=>{for(const t of timers.splice(0))t.f()};
const step=ms=>{const end=now+ms;while(now<end){now+=16;T.step(now)}};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=16;T.step(now);L().event('keyup',k);now+=16;T.step(now)}};
const hold=k=>{A.press(k);now+=16;T.step(now)};const up=k=>{L().event('keyup',k);now+=16;T.step(now)};
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);

/* 0. 파일, 버전, 읽는 순서 */
const html=read('index.html');const at=f=>html.search(new RegExp('<script src="'+f.replace(/[.]/g,'\\.')+'[?]v=A1\\d\\d"></script>'));
assert.ok(at('src/anycall-games.js')>0&&at('src/anycall-vh.js')>at('src/anycall-games.js')&&at('src/anycall-phone.js')>at('src/anycall-vh.js'),'읽는 순서: 게임 → 반 헬싱 → 몸체');
for(const f of ['src/anycall-vh.js','src/anycall-lcd.js','src/anycall-nate.js','src/anycall-phone.js']){const s=read(f);assert.ok(/A12\d/.test(s)&&s.includes('2026-11-18'),'버전과 날짜 '+f);assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음 '+f)}
/* A126: 다음 판에서 버전이 올라가도 통과하도록 A1xx 로 확인 */for(const v of [w.AnycallVH.version,A.version,LC.version,w.AnycallNate.version])assert.ok(/^A1\d\d$/.test(v),'버전 '+v);
A.show('full');flush();A.slide(true);step(300);
const VH=L().vh,X=VH._test,G=X.G,D=L().data;D.got=D.got||{};
const kev=(code,key,repeat)=>({code,key,repeat,target:doc.body,preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}});
const keyupL=winListeners.find(l=>l.t==='keyup');
const ok=()=>press('ok');
const talkAll=(max=200)=>{let n=0;step(80);while(n++<max){if(G.card){step(1300);press('ok');continue}if(G.tele||G.dlg){press('ok');continue}if(G.ask){press('ok');continue}if(G.shop){press('clr');continue}if(G.sc||G.fade.v){step(60);continue}break}step(30);return n};
const choose=i=>{for(let k=0;k<40&&!G.ask;k++){if(G.dlg||G.tele)press('ok');else step(60)}assert.ok(G.ask,'고르기 창');G.ask.sel=i;press('ok')};
const tp=(x,y,f)=>{const h=G.hero;h.x=x+.5;h.y=y+.5;if(f){h.fx=f[0];h.fy=f[1]}h.st='idle';h.kbx=h.kby=0;G.cam.x=(h.x-h.y)*16;G.cam.y=(h.x+h.y)*8};
const mobs=t=>G.ents.filter(e=>e.kind==='mob'&&!e.dead&&(!t||e.type===t));
const calm=()=>{for(const e of G.ents)if(e.kind==='mob'&&!e.boss&&!e.tag){e.dead=1;e.gone=1}G.shots.length=0;G.hz.length=0};
const goMap=(id,x,y,f,keep)=>{X.enterMap(id,x+.5,y+.5,f||[1,1]);if(!keep)calm();step(40);talkAll()};
const face=(e)=>{const h=G.hero;const dx=e.x-h.x,dy=e.y-h.y,n=Math.hypot(dx,dy);h.fx=dx/n;h.fy=dy/n};
const talkTo=id=>{const n=G.ents.find(e=>e.kind==='npc'&&e.id===id&&!e.leaving);assert.ok(n,'사람 있음 '+id);const h=G.hero;h.x=n.x+.85;h.y=n.y+.2;X.G.hero.st='idle';face(n);const it=X.findInteract();assert.ok(it&&it.kind==='talk'&&it.e===n,'말 걸 수 있음 '+id);press('ok');step(30)};
/* 1. 게임 목록, NATE 소개, 제목 화면 */
press('menu','8');assert.equal(L().screen,'games');const items=L().state;const gl=w.AnycallLCD;
const row=L().data;assert.ok(!D.got.vh);L().state.sel=6;press('ok');assert.ok(L().state.confirm&&L().state.confirm.text.includes('반 헬싱'),'큰 게임은 NATE에서 받기');press('clr');
const NB=L().nate;const cat=w.AnycallNate.CATALOG.find(c=>c.id==='vh');assert.ok(cat&&cat.big&&cat.play&&cat.price===5000&&cat.how.includes('말뚝')&&cat.reviews.length>=4,'NATE 목록에 반 헬싱');
press('end');D.got.vh=1;L().go('vh');step(60);assert.equal(L().screen,'vh');assert.equal(G.mode,'title');
{const g=doc.createElement('canvas').getContext('2d');w.AnycallVH.preview(g,'vh',1000,72,88)}
assert.equal(L().keyAlias('KeyZ'),'ok');assert.equal(L().keyAlias('KeyX'),'send');assert.equal(L().keyAlias('KeyC'),'clr');assert.equal(L().keyAlias('KeyV'),'nate');assert.equal(L().keyAlias('KeyQ'),null);
assert.equal(X.screen.ownsSound('5'),true,'게임 소리는 게임이 낸다');assert.equal(X.screen.repeats('down'),true,'제목 화면에서는 아래 키 되풀이');
press('down');assert.equal(G.sel,1);press('up');press('ok');assert.equal(G.tsub,'diff');press('up','ok');assert.equal(G.mode,'prologue');assert.equal(G.s.diff,'easy');
X.setSeed(7);press('ok');press('ok');assert.equal(G.pro.i,1,'머리말 다음 쪽');press('clr');assert.equal(G.mode,'play','취소로 머리말 건너뛰기');assert.equal(G.m.id,'village');
assert.equal(X.screen.repeats('down'),false,'싸움 중에는 되풀이 안 함');
/* 2. 도착: 마부, 늑대 둘 (연습 싸움) */
step(700);assert.ok(G.sc||G.dlg,'도착 대본');let n=talkAll();assert.equal(mobs('wolf').length,2,'늑대 둘');assert.ok(G.watch.some(wt=>wt.tag==='tut'));
assert.ok(!G.ents.some(e=>e.kind==='npc'&&e.id==='coachman'&&!e.leaving),'마부는 떠남');
const h=G.hero;const [w1,w2]=mobs('wolf');tp(5,5,[1,0]);w1.x=6.2;w1.y=5.5;w1.st='rec';w1.t=0;w2.x=12;w2.y=3;w2.st='idle';
/* 키보드 Z (자판 바꿔 읽기) 로 베기, 키를 떼면 몸체가 keyup 을 보낸다 */
T.onKey(kev('KeyZ','z',false));now+=16;T.step(now);keyupL.f(kev('KeyZ','z',false));assert.equal(h.st,'atk','Z = 베기');step(160);assert.ok(w1.hp<w1.mhp,'늑대가 맞음 '+w1.hp);
const hp1=w1.hp;step(400);w1.x=h.x+h.fx*.8;w1.y=h.y+h.fy*.8;w1.st='rec';w1.t=0;press('5');step(20);press('5');step(20);press('5');assert.equal(h.sw&&h.sw.buf,1,'연타는 다음 베기로 이어짐');step(300);assert.ok(h.sw&&h.sw.i>=1,'두 번째 베기 '+(h.sw&&h.sw.i));
step(700);assert.ok(w1.dead||w1.hp<hp1);
/* 모아 베기: 누르고 있으면 모으고, 떼면 회전 베기 */
if(!w1.dead){X.killMob(w1)}tp(5,5,[1,0]);step(400);w2.x=6;w2.y=6;w2.st='rec';w2.t=0;hold('ok');step(1500);assert.equal(h.st,'charge','꾹 = 모으기');assert.equal(h.chgL,2,'두 단계까지 모음');up('ok');assert.equal(h.st,'spin','떼면 회전 베기');step(100);assert.ok(w2.hp<w2.mhp||w2.dead,'회전 베기에 맞음');
for(const m2 of mobs())X.killMob(m2);step(200);talkAll();assert.equal(G.s.flags.tut,1,'연습 끝');assert.ok(G.s.tele.includes('t1'),'미나의 첫 전보');assert.equal(X.mainStep(G.s).t,'황금 왕관 여관');
assert.ok(G.s.kills.wolf>=2,'늑대 도감');
/* 3. 걷기와 벽: 6 = 화면 오른쪽 = 지도 (+x,-y) */
tp(10,11,[1,1]);const x0=h.x,y0=h.y;hold('6');step(300);up('6');assert.ok(h.x>x0+.3&&h.y<y0-.3,'6은 화면 오른쪽으로 '+[h.x-x0,h.y-y0]);
tp(8,8,[-1,0]);hold('7');step(500);up('7');step(400);assert.ok(G.hero.x>=8.25&&G.m.id==='village','여관 벽을 뚫지 않음 '+G.hero.x);
/* 휴대폰 버튼을 손가락으로 누르고 있는 동안만 걷기: 몸체가 손을 뗀 순간 keyup 을 보낸다 */
const stage=A.geometry.stage,cv=T.canvas,keyEv=k=>{const i=A.pad.indexOf(k),c=T.padCols[i%3],r=T.padRows[Math.floor(i/3)];return{clientX:((c[0]+c[1])/2-stage.x)*A.state.cssW/stage.w,clientY:((r[0]+r[1])/2-stage.y)*A.state.cssH/stage.h,pointerId:9}};
tp(16,16,[1,1]);const px0=G.hero.x;cv.emit('pointerdown',keyEv('3'));step(400);assert.ok(G.keys['3'],'누르고 있는 중');assert.ok(G.hero.x>px0+.4,'3 = 화면 오른쪽 아래로 걷기 '+(G.hero.x-px0));
cv.emit('pointerup',keyEv('3'));step(50);assert.ok(!G.keys['3'],'손을 떼면 keyup');const px2=G.hero.x;step(300);assert.ok(Math.abs(G.hero.x-px2)<.05,'손을 떼면 멈춤');
/* 4. 여관 문으로 들어가기 (문 쪽으로 밀기) */
tp(8,10,[-1,0]);hold('7');step(600);up('7');step(400);assert.equal(G.m.id,'inn','여관 안');assert.equal(G.s.map,'inn');assert.ok(w.localStorage.getItem('2006_anycall_vh_v1'),'지도를 옮기면 저절로 기록');
talkTo('marta');talkAll();assert.equal(G.s.flags.q_inn,1);assert.ok(G.s.rel.includes('rosary'),'묵주를 목에 검');assert.equal(X.mainStep(G.s).t,'밤의 병');
/* 가게 */
const g0=G.s.gold;X.openShop('inn');assert.ok(G.shop);press('ok');assert.equal(G.s.gold,g0-30);assert.equal(G.s.inv.herb,4);press('right');assert.equal(G.shop.tab,1);press('ok');assert.equal(G.s.gold,g0-15,'반값에 팔기');press('clr');assert.ok(!G.shop);
/* 침대에서 쉬기 */
G.s.hp=10;tp(10,8,[1,0]);const sv=X.findInteract();assert.ok(sv&&sv.kind==='save','침대');press('ok');choose(0);talkAll();assert.equal(Math.round(G.s.hp),G.st.hp,'쉬면 체력이 다 참');
/* 5. 진료소, 성당, 아나, 이반 */
goMap('clinic',5,7);talkTo('emil');talkAll();assert.equal(G.s.flags.q_emil,1);assert.equal(G.s.flags.sq_wings,1);
goMap('church',6,12);talkTo('josef');talkAll();assert.equal(G.s.flags.q_josef,1);assert.ok(G.s.subs.includes('holy'),'성수');assert.equal(G.s.sub,'holy');
goMap('village',12,15);talkTo('ana');talkAll();assert.equal(G.s.flags.q_ana,1);assert.ok(G.s.tele.includes('t2'));assert.equal(X.mainStep(G.s).t,'묘지 열쇠');
goMap('inn',8,8);talkTo('ivan');choose(0);talkAll();assert.equal(G.s.flags.q_key,1);assert.equal(G.s.inv.key,1);
/* 목표 화살표가 가리킬 길: 여관에서 묘지로 */
assert.equal(X.routeTo('inn','cemetery').to,'village');assert.equal(X.routeTo('village','cemetery').to,'forest');
/* 6. 안개 숲: 아이 미하이, 늑대 우두머리 */
goMap('forest',3,3);assert.ok(G.m.def.fog>0);talkTo('mihai');talkAll();assert.equal(G.s.flags.kid_mihai,1);
const alpha=mobs('alpha')[0];assert.ok(alpha&&alpha.st==='wait');tp(21,18,[1,1]);step(100);talkAll();assert.ok(G.arena,'빈터가 닫힘');assert.equal(G.boss,alpha);assert.equal(alpha.st!=='wait',true);
tp(21,18);h.x=30;step(30);assert.ok(h.x<=27.4,'우두머리 싸움 중에는 빈터를 못 나감');
alpha.hp=Math.round(alpha.mhp*.6);step(200);let tries=0;while(alpha.st!=='howl'&&tries++<60)step(50);assert.equal(alpha.st,'howl','체력이 줄면 울부짖음');step(1500);assert.ok(mobs('wolf').length>=2,'늑대를 부름');
X.hurtMob(alpha,99999,{ignoreInv:1});step(100);talkAll();assert.equal(G.s.flags.forest_alpha,1);assert.ok(G.s.relics.includes('fang'));assert.ok(!G.arena);
/* 7. 공동묘지: 뼈 기사, 묘당 */
goMap('cemetery',2,3);assert.ok(G.m.def.rain);const kn=mobs('knight')[0];assert.ok(kn);
const cnd=X.G.ents.find(e=>e.kind==='chest'&&e.cid==='c_candle');assert.ok(cnd);
tp(20,24,[1,0]);step(100);talkAll();assert.ok(G.arena&&G.m.solid[24*G.m.w+18]===1,'앞마당 문이 닫힘');
/* 방패: 앞에서 때리면 거의 안 들어간다, 모아 베기는 방패를 깬다 */
kn.st='chase';kn.x=h.x+1;kn.y=h.y;kn.fx=-1;kn.fy=0;kn.guard=1;const k0=kn.hp;X.hurtMob(kn,100,{dirx:1,diry:0,melee:1});assert.ok(k0-kn.hp<20,'방패로 막음 '+(k0-kn.hp));
X.hurtMob(kn,10,{dirx:1,diry:0,breakGuard:1});assert.equal(kn.guard,0);assert.equal(kn.st,'stagger','방패가 깨지면 비틀');
X.hurtMob(kn,99999,{ignoreInv:1});step(100);talkAll();assert.equal(G.s.flags.cem_knight,1);assert.equal(G.m.solid[24*G.m.w+18],0,'문이 다시 열림');
tp(24,23,[0,-1]);step(80);talkAll();assert.equal(G.s.flags.saw_tomb,1);assert.equal(G.s.flags.night,1,'밤이 됨');
hold('8');step(300);up('8');talkAll();assert.equal(G.m.id,'cemetery','문장이 없으면 못 들어감');
/* 묘지의 첫 기록 장소 = 아버지 일기 1쪽 */
calm();G.hero.st='idle';tp(5,20,[0,-1]);const alt=X.findInteract();assert.ok(alt&&alt.kind==='save');press('ok');talkAll(400);assert.ok(G.s.pages.includes(0),'일기 1쪽');assert.ok(G.s.tele.includes('t3'));
/* 8. 밤의 마을: 촌장, 라다의 거울, 창백한 손님 */
goMap('village',23,18);assert.equal(G.m.amb.a>.5,true,'밤');goMap('mansion',6,9);talkTo('dragomir');talkAll();assert.equal(G.s.flags.q_drag,1);
goMap('village',8,25);talkTo('rada');talkAll();assert.equal(G.s.flags.q_mirror,1);assert.equal(G.s.inv.mirror,1);
goMap('inn',5,8);talkTo('guest');choose(0);talkAll();assert.equal(G.m.id,'village','광장으로');assert.equal(G.s.flags.guest_reveal,1);const gs=mobs('guest')[0];assert.ok(gs&&G.boss===gs,'라슬로와 싸움');assert.ok(G.arena);
X.hurtMob(gs,99999,{ignoreInv:1});assert.equal(gs.st,'down','흡혈귀는 쓰러져 무릎 꿇음');tp(Math.floor(gs.x)-1,Math.floor(gs.y),[1,0]);h.x=gs.x-.9;h.y=gs.y;face(gs);const st1=X.findInteract();assert.equal(st1&&st1.kind,'stake','말뚝 박기 안내');
press('ok');assert.equal(h.st,'stake');step(600);talkAll();assert.ok(gs.dead,'말뚝으로 끝');assert.equal(G.s.flags.guest_dead,1);assert.equal(G.s.inv.crest,1);assert.ok(G.s.tele.includes('t4'));
/* 9. 묘당 열고 납골당 */
goMap('cemetery',24,23);calm();tp(24,22,[0,-1]);hold('8');step(200);up('8');talkAll();assert.equal(G.s.flags.tomb_open,1);assert.ok(!G.s.inv.crest);hold('8');step(700);up('8');step(300);talkAll();assert.equal(G.m.id,'crypt1','납골당');calm();
assert.equal(G.s.flags.emil_join,1,'에밀이 따라옴');G.s.hp=5;talkTo('emil');talkAll();assert.equal(Math.round(G.s.hp),G.st.hp,'에밀의 치료');
/* 해골: 무너진 뒤 다시 일어남, 뼈 더미를 치면 끝 */
const sk=X.mkMob('skel',G.hero.x+3,G.hero.y);G.ents.push(sk);X.hurtMob(sk,99999,{ignoreInv:1});assert.equal(sk.st,'bones');step(4400);assert.equal(sk.st==='rise'||sk.st==='chase'||sk.st==='wind'||sk.st==='throw'||sk.st==='swing',true,'다시 일어남 '+sk.st);
X.hurtMob(sk,99999,{ignoreInv:1});assert.equal(sk.st,'bones');X.hurtMob(sk,5,{});assert.ok(sk.dead,'뼈 더미를 치면 산산조각');
/* 흡혈귀: 말뚝을 안 박으면 다시 일어남, 거룩한 불은 정화 */
const sp=X.mkMob('spawn',G.hero.x+3,G.hero.y+1);G.ents.push(sp);X.hurtMob(sp,99999,{ignoreInv:1});assert.equal(sp.st,'down');step(3500);assert.equal(sp.st!=='down',true,'다시 일어남');assert.ok(sp.hp>0);
X.hurtMob(sp,99999,{ignoreInv:1});assert.equal(sp.st,'down');G.hz.push({type:'fire',x:sp.x,y:sp.y,r:.9,t:0,life:500,dmg:5,tick:0});step(60);assert.ok(sp.dead,'성수 불길로 정화');
/* 화로 넷에 거룩한 불 → 계단 문이 열림 */
assert.ok(G.ents.some(e=>e.kind==='gate'&&e.flag==='braziers'&&!e.gone));for(const bz of G.ents.filter(e=>e.kind==='brazier'))X.lightBraziers(bz.x,bz.y,.5);step(60);talkAll();
assert.equal(G.s.flags.braziers,1);assert.ok(!G.ents.some(e=>e.kind==='gate'&&e.flag==='braziers'&&!e.gone),'계단 문 열림');assert.equal(G.m.solid[25*G.m.w+19],0);
/* 지렛대 → 감옥 문 → 엘레나 */
tp(12,13,[1,0]);const lv=X.findInteract();assert.equal(lv&&lv.kind,'lever');press('ok');talkAll();assert.equal(G.s.flags.cell_open,1);assert.equal(G.m.solid[19*G.m.w+10],0,'감옥 문 열림');
talkTo('elena');talkAll();assert.equal(G.s.flags.kid_elena,1);
/* 금 간 벽 → 통닭과 탑 카드 */
const cr=G.ents.find(e=>e.kind==='crack');assert.ok(cr);for(let i=0;i<3;i++)X.hurtMob===null;tp(2,8,[0,1]);for(let i=0;i<3;i++){h.st='idle';press('5');step(420)}assert.ok(cr.gone,'벽이 무너짐');G.s.hp=20;tp(1,10);step(400);assert.equal(Math.round(G.s.hp),G.st.hp,'통닭으로 체력이 다 참');tp(1,11);step(400);assert.ok(G.s.cards.includes('tower'),'탑 카드');
/* 일기 2쪽 */
tp(24,5,[1,0]);const pg=X.findInteract();assert.equal(pg&&pg.kind,'look');press('ok');talkAll();assert.ok(G.s.pages.includes(1),'일기 2쪽');
/* 10. 하얀 귀부인 */
goMap('crypt2',8,14,[0,-1]);const lu=mobs('lucia')[0];assert.ok(lu&&lu.st==='wait');tp(8,11,[0,-1]);step(100);talkAll();assert.equal(G.boss,lu);assert.ok(G.arena);
lu.hp=Math.round(lu.mhp*.29);step(100);talkAll();assert.equal(G.s.flags.blood,1,'물리고 혈기에 눈뜸');assert.equal(G.s.blood,100);
hold('#');step(520);up('#');assert.ok(G.awakeT>G.time,'# 길게 = 혈기 각성');assert.equal(G.s.blood,0);const atkA=X.stats().atk;G.awakeT=0;assert.ok(atkA>X.stats().atk,'각성하면 공격이 셈');
X.hurtMob(lu,99999,{ignoreInv:1});assert.equal(lu.st,'down');for(let k=0;k<40&&!G.ask;k++){if(G.dlg)press('ok');else step(60)}choose(0);talkAll();assert.equal(G.s.flags.lucia_dead,1);assert.equal(G.s.flags.stake,'emil');assert.ok(lu.dead);
tp(8,4,[0,-1]);const cof=X.findInteract();assert.equal(cof&&cof.kind,'look');press('ok');talkAll();assert.ok(G.s.pages.includes(2),'일기 3쪽');
/* 11. 새벽, 제1장 끝 */
goMap('village',9,11);talkAll();assert.equal(G.s.flags.ch1_end,1,'제1장 끝');assert.equal(D.games.vhClear,1,'게임 목록에 1장 완료');assert.equal(VH.summary(),'제1장 완료');assert.ok(G.s.tele.includes('t5'));assert.equal(X.mainStep(G.s).t,'제1장 끝');assert.ok(G.m.amb.a<.3,'새벽');
talkTo('m1');talkAll();talkTo('m2');talkAll();assert.equal(G.s.flags.sq_kids,2);assert.ok(G.s.relics.includes('charm'),'아이들의 부적');
/* 12. 대장간: 촛대 셋 → 채찍, 벼리기 */
G.s.inv.candle=3;goMap('village',18,24);talkTo('miklos');talkAll(400);assert.ok(G.s.wpns.includes('whip'),'사슬 채찍');assert.equal(G.s.flags.sq_silver,2);
/* 13. 멈춤 차림표: 장비 바꾸기, 기술 배우기, 물약 */
press('menu');assert.ok(G.menu);press('down','down','ok');assert.equal(G.menu.sub,'equip');press('ok');G.menu.sel=G.s.wpns.indexOf('whip');press('ok');assert.equal(G.s.wpn,'whip');press('clr');assert.ok(G.menu&&!G.menu.sub,'장비에서 나옴');
G.s.sp=5;G.menu.sel=4;press('ok');assert.equal(G.menu.sub,'skill');G.menu.sel=Object.keys(X.SKILL).indexOf('sign');press('ok');assert.ok(G.s.skills.sign);assert.equal(G.s.skill,'sign');press('clr');
G.menu.sel=0;press('ok');G.s.hp=10;press('ok');assert.ok(G.s.hp>10,'물약');press('menu');assert.ok(!G.menu);
/* 기술: 성호 긋기 */
const r1=X.mkMob('rat',h.x+1,h.y);r1.st='idle';G.ents.push(r1);G.s.mp=99;step(50);press('#');assert.equal(h.st,'cast');step(80);assert.ok(r1.dead||r1.hp<r1.mhp,'성호에 맞음');
/* 보조 무기: 석궁, 십자가 */
G.s.sub='bow';G.s.silver=10;h.st='idle';const r2=X.mkMob('ghoul',h.x+h.fx*2,h.y+h.fy*2);r2.st='idle';G.ents.push(r2);step(30);press('*');assert.equal(G.s.silver,9);assert.ok(G.shots.some(p=>p.type==='bolt'));step(300);assert.ok(r2.hp<r2.mhp,'화살에 맞음');
G.s.subs.push('cross');G.s.sub='cross';step(300);press('*');assert.equal(G.s.silver,5);step(1500);assert.ok(!G.shots.some(p=>p.type==='cross'),'십자가는 돌아옴');
/* 구르기 무적과 완벽 회피 */
h.st='idle';h.cd.roll=0;press('0');assert.equal(h.st,'roll');const hp2=G.s.hp;X.hurtHero(50,null);assert.equal(G.s.hp,hp2,'구르는 순간 무적');assert.ok(h.counter>G.time,'완벽 회피 → 반격');step(500);
/* 14. 기록과 이어하기 */
X.writeSave('manual');const sv2=X.readSave();assert.equal(sv2.map,'village');assert.equal(sv2.flags.ch1_end,1);assert.ok(sv2.lv>=1);
press('menu');G.menu.sel=9;press('ok');press('ok');assert.equal(G.mode,'title');assert.equal(G.sel,1);press('ok');assert.equal(G.mode,'play');assert.equal(G.m.id,'village');assert.equal(G.s.flags.ch1_end,1);
/* 15. 쓰러짐 → 마지막 기록에서 다시 */
const hh=G.hero;G.s.hp=1;hh.inv=0;hh.st='idle';X.hurtHero(500,null);assert.equal(hh.st,'dead');step(2600);assert.equal(G.mode,'over');press('ok');assert.equal(G.mode,'play');assert.ok(G.s.hp>0);
/* 우물 바닥의 은은 한 번만 */
const sv0=G.s.silver;tp(13,14,[1,0]);G.hero.st='idle';const wl=X.findInteract();assert.equal(wl&&wl.kind,'look');press('ok');talkAll();tp(13,14,[1,0]);G.hero.st='idle';press('ok');talkAll();assert.ok(G.s.silver-sv0<=5,'우물 은은 한 번');
/* 게임 중 전화: 멈췄다가 끊으면 게임으로 돌아와 멈춤 차림표 */
if(G.menu)press('menu');L().npcCall('mom');step(1500);assert.equal(L().screen,'call','게임 중 전화');press('end');step(1800);assert.equal(L().screen,'vh','전화 끊으면 게임으로');assert.ok(G.menu,'돌아오면 멈춤');press('menu');
/* 16. 화면에서 나가면 기록, 다시 오면 멈춤 차림표 */
press('end');assert.equal(L().screen,'idle');L().go('vh');step(60);assert.equal(G.mode,'play');assert.ok(G.menu,'다시 오면 멈춤');press('menu');
/* 게임 목록 요약 */
press('end');press('menu','8');const it6=L().screen==='games'?null:null;
console.log('반 헬싱 검사 통과');
