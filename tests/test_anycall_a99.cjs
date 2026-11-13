'use strict';
/* A99 (2026-11-13 KST): 애니콜 휴대폰 두 번째. 닫았을 때 아래판이 삐져나오지 않는지(실루엣으로 검사), 숫자판 한글 입력(천지인),
   자판 입력 칸, 같은 방 친구와 진짜 문자, 포토 메일, 전화(울림, 받기, 거절, 부재중, 통화 중, 끊김), 서버 전달 규칙,
   카메라와 사진첩, DMB, 멜로디 작곡, 게임 받기, 점프 달리기, 숫자 야구, 달력, 계산기, 메모장, 친구 찾기, 매너모드, 요금과 엄마 문자를 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

/* 1. 파일, 버전 */
const html=read('index.html');
for(const f of ['src/anycall-lcd.js','src/anycall-phone.js'])assert.ok(new RegExp('<script src="'+f.replace(/[.]/g,'\\.')+'\\?v=A(99|10\\d)"></script>').test(html),'버전 '+f);
assert.ok(/assets\/phone\/anycall-phone\.css\?v=A(99|10\d)/.test(html));
for(const f of ['src/anycall-phone.js','src/anycall-lcd.js','assets/phone/anycall-phone.css','server_phone.js']){const s=read(f);assert.ok(s.includes('A99')&&s.includes('2026-11-13'),'버전과 날짜 '+f);assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음 '+f)}
assert.ok(read('server.js').includes("const PHONE=require('./server_phone.js');")&&read('server.js').includes("if(obj.type==='phone')"),'서버에 휴대폰 전달');

/* 2. 서버 전달 규칙 */
const SP=require(path.join(ROOT,'server_phone.js'));
{const a={id:'a',name:'철수'},b={id:'b',name:'영희'},room=[a,b];let t=1e6;
 let r=SP.relay(a,{op:'sms',to:'b',text:'<b>안녕</b>\n놀자'},room,t);assert.equal(r.length,2);assert.equal(r[0][0],b);assert.equal(r[0][1].text,'b 안녕 /b 놀자','꺾쇠와 줄바꿈 지움');assert.equal(r[0][1].name,'철수');assert.equal(r[1][1].op,'sent');
 r=SP.relay(a,{op:'sms',to:'b',text:'또'},room,t+100);assert.equal(r[0][1].op,'error','너무 빠름');
 r=SP.relay(a,{op:'sms',to:'zz',text:'x'},room,t+5000);assert.equal(r[0][1].message,'그 친구가 지금 방에 없어요.');
 r=SP.relay(a,{op:'sms',to:'a',text:'x'},room,t+9000);assert.equal(r[0][1].op,'error','나에게는 못 보냄');
 r=SP.relay(a,{op:'photo',to:'b',photo:'data:image/jpeg;base64,'+'A'.repeat(7000)},room,t);assert.equal(r[0][1].message,'사진이 너무 커요.');
 r=SP.relay(a,{op:'photo',to:'b',photo:'javascript:alert(1)'},room,t+5000);assert.equal(r[0][1].op,'error');
 r=SP.relay(a,{op:'photo',to:'b',photo:'data:image/jpeg;base64,QUJD',text:'사진'},room,t+10000);assert.equal(r[0][1].photo,'data:image/jpeg;base64,QUJD');
 r=SP.relay(a,{op:'ring',to:'b',call:'x1'},room,t);assert.equal(r[0][1].call,'x1');r=SP.relay(b,{op:'answer',to:'a',call:'x1'},room,t);assert.equal(r[0][0],a);
 r=SP.relay(a,{op:'talk',to:'b',call:'x1',text:'가'.repeat(100)},room,t);assert.equal(r[0][1].text.length,70);assert.deepEqual(SP.relay(a,{op:'hack',to:'b'},room,t),[])}

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
 __GAME_DEBUG__:{player:{scene:'pcroom',x:500},clearInput(){}},
 A25NET:{get state(){return{ready:net.ready,id:net.id,room:'TEST'}},get peers(){return peers.slice()},send:o=>sent.push(o),subscribe(fn){subs.add(fn);return()=>subs.delete(fn)}}};
w.window=w;vm.createContext(w);
const WT=read('src/web-town.js');vm.runInContext(WT.match(/function freq\(n\)\{[^\n]*\}/)[0]+'\n'+WT.replace(/^[\s\S]*?(const RINGS=\[)/,'$1').replace(/\nconst SMS_ART=[\s\S]*$/,'')+';window.WebTown={RINGS,PHONE_WALLS,drawWall,CONTACTS,freq,synthPlay(){return{silent:true,why:"off"}},synthStop(){}};',w);
vm.runInContext(read('src/anycall-lcd.js'),w);if(fs.existsSync(path.join(ROOT,'src/anycall-nate.js')))vm.runInContext(read('src/anycall-nate.js'),w);vm.runInContext(read('src/anycall-phone.js'),w);
const A=w.AnycallPhone,T=A._test,G=A.geometry,LC=w.AnycallLCD,L=()=>A.lcd;let now=1000;T.setClock(()=>now);
assert.ok(/^A(99|10\d)$/.test(A.version));assert.ok(/^A(99|10\d)$/.test(LC.version));
const net$=m=>{for(const f of subs)f(m)};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=30;T.step(now)}};
const run=ms=>{const end=now+ms;while(now<end){now+=50;T.step(now)}};
const lastSent=op=>sent.filter(o=>o.op===op).at(-1);

/* 4. 닫았을 때 아래판이 삐져나오지 않음: 하판 가로줄마다 상판(닫힌 위치)이 그 폭을 덮는지 실루엣으로 검사 */
/* A100: 닫힘 거리는 다시 535(아래판 아래 끝이 살짝 보이는 쪽이 자연스러움). 대신 윗판 아래 양 모서리를 둥글게 깎아,
   닫혔을 때 윗판 옆면이 아래판보다 뾰족하게 튀어나오지 않는지 실루엣으로 검사한다 */
assert.equal(G.slide,535,'닫힘 거리 535로 되돌림');
{const b=T.sil.b,backL=y=>{const i=Math.round((y-b.y0)/8);return b.rows[2*i]},backR=y=>{const i=Math.round((y-b.y0)/8);return b.rows[2*i+1]};
 for(const y of [1080,1096,1108]){const abs=y+G.slide;assert.ok(T.cornerX(y,-1)>=backL(abs)-20,'왼쪽 모서리가 (옆면이 원래 아래판보다 19칸 넓은 만큼까지만) 아래판 밖으로 뾰족하게 나오지 않음 y='+y+' ('+T.cornerX(y,-1).toFixed(0)+' vs '+backL(abs)+')');assert.ok(T.cornerX(y,1)<=backR(abs)+20,'오른쪽 모서리 y='+y)}
 assert.ok(T.cornerX(990,-1)===150&&T.cornerX(990,1)===730,'위쪽 옆면은 그대로')}
/* 5. 숫자판 한글 입력 (천지인 모음 + 숫자판 자음) */
const ed=LC.Editor({max:80,now:()=>now});const type=s=>{for(const k of s.split(' ')){ed.key(k);now+=60}};
type('8 1 * 4 4 right 4 4 * * 1 8 7 7 1 * 7 * 1 1 8 * * 0');assert.equal(ed.text(),'안녕하세요');ed.clear();
type('3 1 * 4 2');assert.equal(ed.text(),'닭','겹받침');type('8 1');assert.equal(ed.text(),'닭이');ed.clear();
type('2 1 * 8 * * 0');assert.equal(ed.text(),'가요','받침이 다음 글자로 넘어감');ed.clear();
type('2 * 0 1 * 7 7 1 *');assert.equal(ed.text(),'과하','ㅘ (ㆍㅡ ㅣㆍ)');ed.clear();
type('9 9 0 * * 1');assert.equal(ed.text(),'춰','ㅊ 은 9 두 번, ㅝ 는 ㅡㆍㆍㅣ');ed.clear();
type('2');now+=2000;type('2');assert.equal(ed.text(),'ㄱㄱ','오래 쉬면 새 글자');ed.clear();
type('2 2 2');assert.equal(ed.text(),'ㄲ','같은 키를 빨리: ㄱ ㅋ ㄲ');ed.key('clr');assert.equal(ed.text(),'');
type('1 *');ed.key('clr');assert.equal(ed.text(),'ㅣ','모음은 한 획씩 지움');ed.clear();
ed.nextMode();assert.equal(ed.mode,'en');type('4 4 right 4 4 4');assert.equal(ed.text(),'hi');ed.nextMode();type('0 1 0');assert.equal(ed.text(),'hi010');ed.nextMode();assert.equal(ed.mode,'ko');ed.clear();
for(let i=0;i<60;i++){ed.key('8');ed.key('1');now+=2000}assert.ok(ed.bytes()<=80,'80바이트 넘지 않음');ed.setText('엄마 ^^');assert.equal(ed.text(),'엄마 ^^');
assert.equal(LC.composeJamo(['ㄱ','ㅏ','ㅂ','ㅅ']),'값');

/* 6. 몸체 보이기, 메뉴 16칸 */
A.show('full');now+=10;/* 그림 두 장 불러오기 끝내기 */
for(const t of timers.splice(0))t.f();
assert.equal(A.state.ready,true);A.slide(true);now+=300;T.step(now);assert.equal(A.state.open,true);
assert.equal(LC.apps.length,16,'메뉴 16칸');assert.deepEqual(LC.apps.slice(0,16).map(a=>a.id).join(),'contacts,sms,calls,camera,album,dmb,nate,games,ring,wall,melody,find,cal,calc,memo,set');
assert.equal(LC.fakeNum('p2'),LC.fakeNum('p2'));assert.ok(/^01[1679]-\d{4}-\d{4}$/.test(LC.fakeNum('p2')));
const root=doc.body.children.find(n=>n.className.includes('ac-root')),win=root.children[1],typ=win.children.find(n=>n.className==='ac-type'),typIn=typ.children[0];

/* 7. 전화번호부: 같은 방 친구가 맨 위 */
press('menu','1');assert.equal(L().screen,'contacts');assert.equal(L().book()[0].n,'영희');assert.equal(L().book()[0].friend,true);press('end');

/* 8. 문자 쓰기: 숫자판 → 자판 칸에도 보임, 자판 칸에 쓰면 액정에도 보임, 같은 방 친구에게 진짜로 보냄 */
press('menu','2','2','1');assert.equal(L().screen,'compose');assert.equal(typ.hidden,false,'글 쓰는 화면에 자판 칸');
press('8','1','*','4','4');assert.equal(L().editor.text(),'안');assert.equal(typIn.value,'안','숫자판으로 쓴 글이 자판 칸에도');
typIn.value='영희야 놀이터 ㄱㄱ';typIn.emit('input',{isComposing:false});assert.equal(L().editor.text(),'영희야 놀이터 ㄱㄱ','자판 칸 → 액정');
typIn.emit('keydown',{key:'Enter'});assert.equal(L().screen,'sending','Enter = 보내기');assert.equal(lastSent('sms').to,'p2');assert.equal(lastSent('sms').text,'영희야 놀이터 ㄱㄱ');
assert.equal(typ.hidden,true,'보내는 중에는 자판 칸 숨김');net$({type:'phone',op:'sent',for:'sms',to:'p2'});run(1500);assert.notEqual(L().screen,'sending');assert.ok(L().state.pop.text.includes('전송 완료'));
press('end','menu','2','2','2');assert.equal(L().state.arg.to.n,'민수','두 번째 사람은 같은 방 친구 민수');press('nate');assert.equal(L().screen,'phrases');for(let i=0;i<12;i++)press('down');press('ok');assert.equal(L().editor.text(),'^^','이모티콘 넣기');press('end');

/* 9. 문자 받기: 휴대폰을 넣어 둔 상태면 알림, 진동 모드면 흔들림 */
A.hide();net$({type:'phone',op:'sms',from:'p2',name:'영희',text:'지금 감 ㅋㅋ'});assert.equal(L().data.inbox[0].from,'영희');assert.equal(L().data.inbox[0].fromPeer,'p2');
assert.ok(ids.hint.textContent.includes('[휴대폰] 문자 · 영희'),'넣어 둔 상태면 게임 화면에 알림');assert.ok(ids.phoneLabel.textContent.startsWith('새 문자'));
A.show('full');press('menu','left','ok');assert.equal(L().screen,'set');press('ok');assert.equal(L().data.alert,'vib','매너모드: 진동');press('end');
const canvas=T.canvas;net$({type:'phone',op:'sms',from:'p3',name:'민수',text:'나도'});assert.ok(canvas.className.includes('ac-buzz'),'진동');

/* 10. 전화 오기 (넣어 둔 상태 → 저절로 꺼내짐) → 받기 → 통화 중 말하기 → 상대가 끊음 */
A.hide();net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'c1'});assert.equal(A.state.shown,true,'전화가 오면 휴대폰이 나옴');assert.equal(L().screen,'call');assert.equal(L().state.call.phase,'ring');
net$({type:'phone',op:'ring',from:'p3',name:'민수',call:'c2'});assert.equal(lastSent('busy').to,'p3','다른 전화는 통화 중');
press('send');assert.equal(lastSent('answer').call,'c1');assert.equal(L().state.call.phase,'live');assert.equal(typ.hidden,false,'통화 중 말하기 칸');
press('2','1','*','8');assert.equal(L().editor.text(),'강');press('ok');assert.equal(lastSent('talk').text,'강');assert.equal(L().editor.text(),'','말한 뒤 비움');
net$({type:'phone',op:'talk',from:'p2',name:'영희',call:'c1',text:'응 바로 갈게'});assert.equal(L().state.call.lines.at(-1).text,'응 바로 갈게');
net$({type:'phone',op:'talk',from:'p3',name:'민수',call:'c1',text:'끼어들기'});assert.notEqual(L().state.call.lines.at(-1).text,'끼어들기','다른 사람 말은 무시');
now+=12000;net$({type:'phone',op:'hang',from:'p2',name:'영희',call:'c1'});assert.equal(L().state.call.endMsg,'상대방이 전화를 끊었어요');run(1600);assert.equal(L().screen,'idle');
assert.ok(L().data.bill.sec>=12,'통화 시간 요금');assert.equal(L().data.calls.find(c=>c.n==='영희').t,'in');

/* 11. 부재중 전화 (25초 안 받음), 내가 거는 전화, 상대가 방을 나감 */
net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'c3'});run(26000);assert.equal(lastSent('decline').call,'c3');assert.equal(L().data.calls[0].t,'miss');run(1600);
press('menu','1','send');assert.equal(lastSent('ring').to,'p2');const cid=lastSent('ring').call;assert.equal(L().state.call.phase,'dial');
net$({type:'phone',op:'answer',from:'p2',name:'영희',call:cid});assert.equal(L().state.call.phase,'live');net$({type:'left',id:'p2'});assert.equal(L().state.call.endMsg,'연결이 끊겼어요');run(1600);
press('menu','1','send');const cid2=lastSent('ring').call;net$({type:'phone',op:'busy',from:'p2',call:cid2});assert.equal(L().state.call.endMsg,'상대방이 통화 중이에요');run(1600);
net.ready=false;press('menu','1','send');assert.equal(L().screen,'contacts','방 밖이면 친구에게 못 검');net.ready=true;press('end');

/* 12. 카메라 → 사진첩 → 배경 화면, 포토 메일 */
press('menu','4');assert.equal(L().screen,'camera');press('right','up','ok');assert.equal(L().photos.length,1);assert.ok(L().photos[0].url.startsWith('data:image/jpeg'));assert.ok(JSON.parse(memory.get('2006_anycall_photos_v1')).length===1,'사진 저장');
press('menu');assert.equal(L().screen,'album');for(const t of timers.splice(0))t.f();press('menu','1');assert.ok(L().data.wall.startsWith('ph:'),'사진을 배경 화면으로');
press('menu','2');assert.equal(L().screen,'photoTo');press('ok');assert.equal(L().screen,'sending');assert.ok(lastSent('photo').photo.length<=6000);assert.equal(lastSent('photo').to,'p2');net$({type:'phone',op:'sent',for:'photo'});run(1500);press('end');
net$({type:'phone',op:'photo',from:'p2',name:'영희',text:'나도 찍음',photo:'data:image/jpeg;base64,QUJD'});press('end','ok');assert.equal(L().screen,'inbox');press('ok');assert.equal(L().screen,'read');press('ok');assert.equal(L().photos.length,2,'받은 사진 저장');press('end');

/* 13. DMB, 멜로디 작곡 */
press('menu','6');assert.equal(L().screen,'dmb');run(400);press('right');assert.equal(L().state.tv.ch,1);press('end');
press('menu');L().state.sel=10;press('ok');assert.equal(L().screen,'melody');const b0=T.beepCount();press('1');assert.equal(Math.round(T.beeps().at(-1).freqs[0]),523,'1 = 도 (키음 대신 음)');assert.equal(T.beepCount(),b0+1);
press('3','5','*','8','9','0','1');assert.equal(L().state.mel.notes.length,6);assert.equal(L().state.mel.notes[3][0],'C6','8 = 높은 도');assert.equal(L().state.mel.notes[5][0],'C6','0 = 옥타브 올림');
press('menu');assert.ok(L().data.ring.startsWith('mel:'),'내 곡을 벨소리로');assert.ok(L().rings().some(r=>r[0]===L().data.ring));press('end');

/* 14. 게임: NATE에서 받기(요금), 점프 달리기, 숫자 야구 */
press('menu','8','3');assert.ok(L().state.confirm,'받을지 물어봄');press('ok');assert.equal(L().screen,'dl');run(2000);assert.equal(L().data.got.run,1);assert.equal(L().data.bill.info,2000);
press('3');assert.equal(L().screen,'run');run(300);press('5');run(100);assert.ok(L().state.g.y>0,'점프');run(20000);assert.equal(L().state.g.over,true);press('clr','4','ok');run(2000);press('4');assert.equal(L().screen,'ball');
const Bg=L().state.g;Bg.ans='123';press('3','2','1');assert.equal(JSON.stringify(Bg.hist[0]),'{"g":"321","s":1,"b":2}');press('1','2','3');assert.equal(Bg.win,true);press('end');

/* 15. 달력, 계산기, 메모장, 친구 찾기 */
press('menu');L().state.sel=12;press('ok');for(let i=0;i<14;i++)press('right');assert.equal(JSON.stringify(L().state.cal),'{"m":1,"d":13}','6월 13일');press('end');
press('menu');L().state.sel=13;press('ok','1','2','*','*','*','3','#');assert.equal(L().state.calc.cur,'36','12 × 3');press('end');
press('menu');L().state.sel=14;press('ok','ok');assert.equal(L().screen,'memoEdit');typIn.value='리코더 챙기기';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});assert.equal(L().data.memos[0].t,'리코더 챙기기');press('end');
press('down');run(1600);assert.equal(L().screen,'find');const fi=SCR_items();assert.ok(fi.some(x=>x.label==='영희: 담장길 · 은하분식')&&fi.some(x=>x.label==='민수: 동네 PC방'),'친구 위치');press('end');
function SCR_items(){const out=[];/* 액정 목록 글자를 꺼내 보기 */const sc=L().state;return L().friends().map(f=>({label:f.n+': '+LC.placeOf(f.p)}))}

/* 16. 요금과 엄마 문자, PC에서 받은 벨소리, 싸이월드 모바일 (A100부터 NATE 무선 인터넷 안에서) */
w.__GAME_DEBUG__.player.scene='street';
assert.ok(L().rings().some(r=>r[0]==='r1'),'PC방 폰꾸미기 천국에서 받은 벨소리');
const total=L().billTotal();assert.ok(total>=4000);L().data.bill.info+=10000;L().save();press('nate');run(1500);press('end');for(const t of timers.splice(0))t.f();
assert.ok(L().data.inbox.some(m=>m.from==='엄마'&&m.text.includes('압수')),'요금이 많이 나오면 엄마 문자');
const sentMini=[];w.MiniHome={send:(k,o)=>{sentMini.push([k,o]);return true},live:{list:[{hid:'h1',n:'영희',title:'♡영희의 놀이터♡',mood:'신남',today:3,total:120,on:true,np:1}],me:{hid:'h9'},gb:{}}};
press('nate');run(1500);press('6');run(1500);assert.equal(L().nate.state.cur.id,'cy');press('1');run(1500);assert.equal(L().nate.state.cur.id,'cyHome');assert.ok(L().nate.state.cur.text.includes('TODAY 3'));assert.equal(sentMini[0][1].op,'visit','놀러 가기');press('end');
/* 17. 휴대폰 화면의 알림 키음: 멜로디 화면에서는 몸체의 키음을 내지 않음 */
assert.equal(L().ownsSound('1'),false);
console.log('PASS test_anycall_a99');
