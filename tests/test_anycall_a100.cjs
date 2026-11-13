'use strict';
/* A100 (2026-11-13 KST): 애니콜 NATE 무선 인터넷. 접속 화면, 패킷 요금(0.5KB당 6.5원)과 정보이용료, 번호 메뉴와 0 * # 매뉴 조작,
   숫자 바로가기, 검색, 벨소리 받기와 결제 알림 문자, 컬러링(친구에게 연결음으로 들림), 게임 받기와 지원하지 않는 기종,
   테마, 배경 화면, 이모티콘 보관함, 실내 접속 오류, 즐겨찾기, 데이터 요금 알림 문자, 채팅, 싸이월드 모바일 방명록,
   뉴스와 만화와 지도, 카메라 조준과 파일 저장을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

/* 1. 파일과 순서 */
const html=read('index.html');
const at=f=>html.indexOf('<script src="'+f+'?v=A100"></script>');
assert.ok(at('src/anycall-lcd.js')>0&&at('src/anycall-nate.js')>at('src/anycall-lcd.js')&&at('src/anycall-phone.js')>at('src/anycall-nate.js'),'읽는 순서: 액정 → NATE → 몸체');
assert.ok(html.includes('assets/phone/anycall-phone.css?v=A100'));
for(const f of ['src/anycall-nate.js','src/anycall-lcd.js','src/anycall-phone.js','assets/phone/anycall-phone.css','server_phone.js']){const s=read(f);assert.ok(s.includes('A100')&&s.includes('2026-11-13'),'버전과 날짜 '+f);assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음 '+f)}
assert.ok(/send:\(kind,o\)=>/.test(read('src/xp-minihome.js')),'미니홈피 보내기 내보냄');
const SP=require(path.join(ROOT,'server_phone.js'));
{const a={id:'a',name:'철수'},b={id:'b',name:'영희'};const r=SP.relay(b,{op:'tone',to:'a',call:'c9',ring:'r3<x>'},[a,b],1e6);assert.equal(r[0][1].ring,'r3 x');assert.equal(r[0][1].call,'c9')}

/* 3. 가짜 화면 */
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
const memory=new Map(),winListeners=[],timers=[],sent=[],subs=new Set();
memory.set('2006_xp_desktop_v1',JSON.stringify({web:{phone:{got:{r1:1}}}}));
class Img{constructor(){this.complete=false;this.naturalWidth=0;this.width=120;this.height=90}set src(v){this._src=v;this.complete=true;this.naturalWidth=120;timers.push({f:()=>this.onload?.(),ms:0})}get src(){return this._src}}
const peers=[{id:'p2',name:'영희',scene:'street',x:1200},{id:'p3',name:'민수',scene:'pcroom',x:300}];
const net={ready:true,id:'p1'};
const w={document:doc,Math,Number,String,Array,Object,JSON,Set,Map,Promise,Date,console,Uint8ClampedArray,
 localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v))},
 innerWidth:1100,innerHeight:760,devicePixelRatio:1,Image:Img,
 addEventListener:(t,f,cap)=>winListeners.push({t,f,cap:!!cap}),removeEventListener(){},
 setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout(){},
 performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},GameAudio:{state:{enabled:true,volume:.65},unlock(){}},
 __GAME_DEBUG__:{player:{scene:'street',x:1000},clearInput(){}},
 A25NET:{get state(){return{ready:net.ready,id:net.id,room:'TEST'}},get peers(){return peers.slice()},send:o=>sent.push(o),subscribe(fn){subs.add(fn);return()=>subs.delete(fn)}}};
w.window=w;vm.createContext(w);

for(const f of ['src/web-town.js']){const WT=read(f);vm.runInContext(WT.match(/function freq\(n\)\{[^\n]*\}/)[0]+'\n'+WT.replace(/^[\s\S]*?(const PLACES=\[)/,'$1').replace(/\nfunction drawWall[\s\S]*?\n(const CONTACTS=)/,'\nfunction drawWall(){}\n$1').replace(/\nconst SMS_ART=[\s\S]*$/,'')+';window.WebTown={PLACES,TOWN_BOARD,RINGS,PHONE_WALLS,drawWall,drawTown(){},CONTACTS,freq,MB_NEWS:[["별빛소녀 2집","05.30 11:00","예약 받아요"]],synthPlay(){return{silent:true,why:"off"}},synthStop(){}};',w)}
vm.runInContext(read('src/portal-news.js'),w);vm.runInContext(read('src/portal-comics.js'),w);
vm.runInContext(read('src/anycall-lcd.js'),w);vm.runInContext(read('src/anycall-nate.js'),w);vm.runInContext(read('src/anycall-phone.js'),w);
const A=w.AnycallPhone,T=A._test,LC=w.AnycallLCD,L=()=>A.lcd,NB=()=>L().nate,BS=()=>NB().state;let now=1000;T.setClock(()=>now);
assert.equal(A.version,'A100');assert.equal(LC.version,'A100');assert.equal(w.AnycallNate.version,'A100');
const net$=m=>{for(const f of subs)f(m)};const flush=()=>{for(const t of timers.splice(0))t.f()};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=30;T.step(now)}};
const run=ms=>{const end=now+ms;while(now<end){now+=50;T.step(now)}};
const go=(...ks)=>{for(const k of ks){press(k);run(2600)}};
const lastSent=op=>sent.filter(o=>o.op===op).at(-1);
A.show('full');flush();A.slide(true);run(300);assert.equal(A.state.open,true);
const root=doc.body.children.find(n=>n.className.includes('ac-root')),typ=root.children[1].children.find(n=>n.className==='ac-type'),typIn=typ.children[0];

/* 2. 접속: 접속 화면 → NATE 홈, 패킷 요금 */
const d0=L().data.bill.data;press('nate');assert.equal(L().screen,'nate');assert.equal(BS().cur,null,'처음엔 접속 화면');run(1500);
assert.equal(BS().cur.id,'home');assert.equal(BS().pkts,7,'3.4KB = 7패킷');assert.equal(BS().won,45.5,'7패킷 × 6.5원');assert.equal(L().data.bill.data-d0,46,'휴대폰 요금에 데이터 통화료');
const home=BS().cur.items();assert.ok(home[0].search,'맨 위 검색 칸');assert.equal(home[1].label,'벨소리·컬러링');assert.equal(home[9].label,'MY NATE (요금·즐겨찾기)');
go('9');assert.equal(BS().cur.id,'my','9 = MY NATE');go('*');assert.equal(BS().cur.id,'home','* = 이전');go('4','2');assert.equal(BS().cur.id,'wc');assert.ok(BS().cur.text.includes('토고'),'월드컵 일정');
go('0');assert.equal(BS().cur.id,'home','0 = NATE 홈');assert.equal(BS().stack.length,0);

/* 3. 벨소리 받기: 확인 → 받는 막대 → 정보이용료 700원 + 데이터, 결제 알림 문자 */
const r2=w.WebTown.RINGS.find(r=>r[0]==='r2');NB().nav('ringItem',r2);run(2000);assert.equal(BS().cur.id,'ringItem');const info0=L().data.bill.info,data0=L().data.bill.data;
press('2');assert.ok(L().state.confirm.text.includes('700원'),'받기 전에 물어봄');press('ok');assert.ok(BS().dl,'받는 중');run(4500);
assert.equal(L().data.got.r2,1);assert.equal(L().data.bill.info-info0,700);assert.ok(L().data.bill.data-data0>=312,'24KB 데이터 통화료');assert.equal(L().data.payLog[0].won,700);
flush();assert.ok(L().data.inbox.some(m=>m.from==='NATE 알림'&&m.text.includes('700원')),'결제 알림 문자');

/* 4. 컬러링: 정하면 친구가 걸 때 그 노래를 듣는다 */
NB().nav('colorSet',w.WebTown.RINGS.find(r=>r[0]==='r3'));run(1800);press('2','ok');assert.equal(L().data.coloring,'r3');press('end');run(2700);
net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'k1'});assert.equal(lastSent('tone').ring,'r3','받는 쪽이 컬러링을 알려 줌');press('end');run(1600);
press('menu','1','send');const cid=lastSent('ring').call;net$({type:'phone',op:'tone',from:'p2',call:cid,ring:'r1'});assert.equal(L().state.call.tone,'r1','거는 쪽은 상대 컬러링을 들음');run(200);assert.equal(L().state.tune,'r1');press('end');run(1600);

/* 5. 숫자 바로가기, 없는 번호 */
press('2','0','0','6','nate');run(1500);run(2600);assert.equal(BS().cur.id,'wc','2006 + NATE = 월드컵 특집');assert.equal(BS().stack[0].pg.id,'home');press('end');run(2700);
press('9','9','9','9','nate');assert.ok(L().state.pop.text.includes('없는 바로가기'));run(1500);assert.equal(BS().cur.id,'home');press('end');run(2700);

/* 6. 검색: 자판 칸으로 쓰고 Enter */
press('nate');run(1500);press('ok');run(2000);assert.equal(BS().cur.id,'search');assert.equal(typ.hidden,false,'검색 칸');
typIn.value='월드컵';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});run(2000);assert.equal(BS().cur.id,'results');assert.ok(BS().cur.items().some(x=>x.label==='월드컵 특집'));assert.equal(typ.hidden,true);
assert.ok(BS().cur.items().some(x=>x.go&&x.go[0]==='article'),'포털 기사도 찾아짐');

/* 7. 게임: 지원하지 않는 기종 (돈 안 나감), 받을 수 있는 게임 (데이터 요금 알림 문자) */
const g3=w.AnycallNate.CATALOG.find(g=>g.id==='g3'),runG=w.AnycallNate.CATALOG.find(g=>g.id==='run');const i1=L().data.bill.info;
NB().nav('gameItem',g3);run(2000);press('1');assert.ok(L().state.pop.text.includes('지원하지 않는'));assert.equal(L().state.confirm,null);assert.equal(L().data.bill.info,i1,'돈 안 나감');
NB().nav('gameItem',runG);run(2000);press('1','ok');run(5000);assert.equal(L().data.got.run,1);assert.ok(BS().won>=1000);flush();assert.ok(L().data.inbox.some(m=>m.text.includes('1,000원을 넘었습니다')),'데이터 요금 알림 문자');

/* 8. 폰꾸미기: 테마, 배경 화면, 이모티콘 보관함 */
NB().nav('theme');run(2000);press('2','ok');run(1500);assert.equal(L().data.theme,'pink');assert.equal(L().data.got['t:pink'],1);
assert.ok(!L().walls().some(x=>x[0]==='heart'),'처음엔 없는 배경');NB().nav('wallItem',['heart','하트 뿅뿅']);run(2000);press('1','ok');run(1500);assert.equal(L().data.wall,'heart');assert.ok(L().walls().some(x=>x[0]==='heart'));
NB().nav('emoCat',['웃음',['^^','^_^']]);run(1500);press('1');assert.equal(L().data.emoBox[0],'^^');

/* 9. 실내에서는 가끔 접속 오류 → 다시 시도 */
const rnd=Math.random;w.Math.random=()=>0.01;w.__GAME_DEBUG__.player.scene='pcroom';NB().nav('news');run(2000);assert.equal(BS().cur.id,'fail');press('1');run(2500);assert.equal(BS().cur.id,'news','다시 시도하면 들어감');w.Math.random=rnd;w.__GAME_DEBUG__.player.scene='street';

/* 10. 뉴스 기사, 만화, 지도, 소설, 심리 테스트 */
const rec=w.PortalNews.records.find(r=>r.type==='뉴스');NB().nav('article',rec);run(3000);assert.ok(BS().cur.text.includes(rec.title));press('right');assert.ok(BS().scroll>0,'긴 기사는 ▶로 넘김');
const ep=w.PortalComics.episodes[0];NB().nav('comicView',{ep,i:0});run(2000);T.paint();assert.ok(BS().cur.items()[0].label.includes('다음 컷'));go('1');assert.equal(BS().cur.arg.i,1);
NB().nav('map');run(2500);T.paint();press('5');assert.equal(BS().cur.zoom,1,'지도 확대');
NB().nav('psyQ',{i:0,s:[0,0,0]});run(1500);go('1','2','1');assert.ok(BS().cur.text.includes('당신은'),'심리 테스트 결과');

/* 11. 채팅 (함께 걷기 방 채팅으로 나감), 싸이월드 방명록 쓰기 */
NB().nav('chat');run(2000);typIn.value='폰으로 채팅';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});const chat=sent.filter(o=>o.type==='chat').at(-1);assert.equal(chat.text,'[폰] 폰으로 채팅');
net$({type:'chat',id:'p2',name:'영희',text:'오 신기하다'});assert.equal(BS().chat.at(-1).t,'오 신기하다');
const mini=[];w.MiniHome={send:(k,o)=>{mini.push([k,o]);return true},live:{list:[{hid:'h1',n:'영희',title:'영희네',today:1,total:9,on:true}],me:{hid:'h9'},gb:{h1:{total:1,list:[{n:'민수',t:'안녕'}]}}}};
NB().nav('cyGb',{hid:'h1',n:'영희'});run(2000);assert.equal(mini.at(-1)[1].op,'gb');assert.ok(BS().cur.live().includes('[민수] 안녕'));
go('1');assert.equal(BS().cur.id,'cyWrite');typIn.value='폰으로 남김';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});assert.equal(mini.at(-1)[0],'write');assert.equal(mini.at(-1)[1].t,'폰으로 남김');

/* 12. 즐겨찾기, 옵션으로 끊기, 종료 버튼 = 접속 끊기와 요금 안내 */
go('0');NB().nav('weather');run(2000);press('menu');assert.ok(BS().opts);press('2');assert.equal(L().data.bm[0].id,'weather');
press('menu','4');assert.notEqual(L().screen,'nate');assert.ok(L().state.pop.text.includes('패킷'),'끊을 때 요금 안내');
press('nate');run(1500);press('end');assert.equal(L().screen,'idle');assert.ok(L().state.pop.text.includes('NATE 접속 끊음'));

/* 13. 카메라: 확대하고 조준 옮기기, 사진을 내 컴퓨터 파일로 */
const anchors=[];const mk=doc.createElement;doc.createElement=t=>{const n=mk(t);if(String(t).toLowerCase()==='a')anchors.push(n);return n};
press('menu','4');press('3','3');assert.equal(L().state.cam.z,2);press('right','right','down');assert.ok(L().state.cam.px>0&&L().state.cam.py>0,'조준 옮김');press('0');assert.equal(L().state.cam.px,0);press('ok');
press('menu','menu','3');assert.ok(anchors.some(a=>/^anycall_photo_20060530_\d{4}_\d+\.jpg$/.test(a.download)&&String(a.href).startsWith('data:image/jpeg')),'파일로 내려받기');assert.ok(L().state.pop.text.includes('내 컴퓨터에 저장'));
doc.createElement=mk;
console.log('PASS test_anycall_a100');
