'use strict';
/* A124 (2026-11-17 KST): 전화와 문자 놀이(발신 번호 표시 제한, 소리샘, 콜키퍼, ARS, 114, 080 수신 거부, 단축 번호, 매너모드 길게,
   엄마와 민호가 먼저 거는 전화, 가짜 전화, 알람), 문자(문자 그림, 여러 명에게, 전달, 수신 확인, 스팸과 스팸 차단, 행운의 문자, 숫자 암호),
   휴대전화 진짜 진동(설정 세 가지, 알림과 누를 때), NATE 새 쪽(신규 게임, 선물하기, 투표, 이름 궁합, 사다리, OX 퀴즈, 학교 생활 ...),
   휴대폰 게임 두 개(쿵짝 리듬왕, 골목대장 전설)와 서버 전달 규칙을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const SPAM_WIN='[축하] 경품 이벤트 당첨! MP3 플레이어를 받으세요. 확인 1588-0530';
const at=f=>html.search(new RegExp('<script src="'+f.replace(/[.]/g,'\\.')+'[?]v=A124"></script>'));
/* 0. 파일과 순서 */
const html=read('index.html');
assert.ok(at('src/anycall-lcd.js')>0&&at('src/anycall-nate.js')>at('src/anycall-lcd.js')&&at('src/anycall-games.js')>at('src/anycall-nate.js')&&at('src/anycall-phone.js')>at('src/anycall-games.js'),'읽는 순서: 액정 → NATE → 게임 → 몸체');
for(const f of ['src/anycall-lcd.js','src/anycall-nate.js','src/anycall-games.js','src/anycall-phone.js','server_phone.js']){const s=read(f);assert.ok(s.includes('A124')&&s.includes('2026-11-17'),'버전과 날짜 '+f);assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음 '+f)}
/* 1. 서버 전달 규칙 */
const SP=require(path.join(ROOT,'server_phone.js'));
{const a={id:'a',name:'철수'},b={id:'b',name:'영희'},room=[a,b];let t=1e6;
 let r=SP.relay(a,{op:'ring',to:'b',call:'c1',hide:1},room,t);assert.equal(r[0][1].hide,1);assert.equal(r[0][1].name,'','발신 번호 표시 제한이면 이름을 보내지 않음');
 r=SP.relay(b,{op:'decline',to:'a',call:'c1',why:'off'},room,t);assert.equal(r[0][1].why,'off');r=SP.relay(b,{op:'decline',to:'a',call:'c1',why:'<x>'},room,t+500);assert.equal(r[0][1].why,undefined);
 const tv=t+=5000;r=SP.relay(a,{op:'vm',to:'b',text:'나야 <b>전화해</b>'},room,tv);assert.equal(r[0][1].op,'vm');assert.ok(!/[<>]/.test(r[0][1].text));
 r=SP.relay(a,{op:'sms',to:'b',text:'안녕',mid:'m12'},room,t+=5000);assert.equal(r[0][1].mid,'m12');
 r=SP.relay(b,{op:'seen',to:'a',mid:'m12'},room,t+=5000);assert.equal(r[0][1].op,'seen');assert.equal(r[0][1].mid,'m12');assert.deepEqual(SP.relay(b,{op:'seen',to:'a',mid:'??'},room,t+=5000),[]);
 r=SP.relay(a,{op:'gift',to:'b',item:'rhythm',text:''},room,t+=5000);assert.equal(r[0][1].item,'rhythm');assert.equal(r[1][1].for,'gift');
 r=SP.relay(a,{op:'gift',to:'b',item:'a b c'},room,t+=5000);assert.equal(r[0][1].op,'error','선물 이름이 이상하면 거절');
 r=SP.relay(a,{op:'vm',to:'b',text:'또'},room,tv+500);assert.equal(r[0][1].op,'error','소리샘은 2초 간격');}
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
for(const f of ['src/anycall-lcd.js','src/anycall-nate.js','src/anycall-games.js','src/anycall-phone.js'])vm.runInContext(read(f),w);
const A=w.AnycallPhone,T=A._test,LC=w.AnycallLCD,L=()=>A.lcd,NB=()=>L().nate,BS=()=>NB().state;let now=1000;T.setClock(()=>now);
assert.equal(A.version,'A124');assert.equal(LC.version,'A124');assert.equal(w.AnycallNate.version,'A124');assert.equal(w.AnycallGames.version,'A124');
const net$=m=>{for(const f of subs)f(m)};const flush=()=>{for(const t of timers.splice(0))t.f()};
const press=(...ks)=>{for(const k of ks){A.press(k);now+=30;T.step(now)}};
const run=ms=>{const end=now+ms;while(now<end){now+=50;T.step(now)}};
const go=(...ks)=>{for(const k of ks){press(k);run(2600)}};
const lastSent=op=>sent.filter(o=>o.op===op).at(-1);
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);
A.show('full');flush();A.slide(true);run(300);assert.equal(A.state.open,true);
const root=doc.body.children.find(n=>n.className.includes('ac-root')),typ=root.children[1].children.find(n=>n.className==='ac-type'),typIn=typ.children[0];
const D=L().data,S=L().state;
/* 2. 진짜 진동: 휴대전화(안드로이드)면 처음부터 '알림+누를 때' */
assert.equal(A.state.vibMobile,true);assert.equal(A.state.vibCan,true);assert.equal(A.state.vib,'all','휴대전화는 진짜 진동 켜짐');
vib.length=0;press('5');same(vib,[14],'누를 때 짧은 떨림');press('clr');
vib.length=0;A.slide(false);run(400);same(vib[0],[12,60,16],'슬라이드 떨림');A.slide(true);run(400);
/* 설정: 진짜 진동 바꾸기 (끄기 → 알림만 → 알림+누를 때) */
press('end','menu','left','ok');assert.equal(L().screen,'set');S.sel=4;vib.length=0;press('ok');assert.equal(A.state.vib,'off');press('ok');assert.equal(A.state.vib,'alert');same(vib.at(-1),[200,90,200],'켜면 시험 떨림');
vib.length=0;press('down');assert.equal(vib.length,0,'알림만이면 누를 때는 안 떪');press('up','ok');assert.equal(A.state.vib,'all');
/* 벨소리 방식 네 가지: 벨소리 → 진동 → 벨+진동 → 무음 */
S.sel=0;press('ok');assert.equal(D.alert,'vib');press('ok');assert.equal(D.alert,'both');press('ok');assert.equal(D.alert,'mute');press('ok');assert.equal(D.alert,'ring');press('end');
/* 매너모드(진동)일 때 문자와 전화가 오면 기기도 같은 박자로 떤다 */
D.alert='vib';vib.length=0;net$({type:'phone',op:'sms',from:'p2',name:'영희',text:'떨려?',mid:'m7'});same(vib[0],[200,90,200],'문자 진동');
vib.length=0;net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'cv1'});run(1700);assert.ok(vib.some(p=>JSON.stringify(p)==='[420,160,420]'),'전화 진동');press('end');run(1600);assert.equal(L().screen,'idle');
assert.ok(vib.includes(0),'끊으면 진동 멈춤');D.alert='ring';
/* 컴퓨터(진동 없음)에서는 고를 수 없다 */
T.setVibSupport({mobile:false});press('menu','left','ok');S.sel=4;press('ok');assert.ok(S.pop.text.includes('휴대전화'));assert.equal(A.state.vib,'all');T.setVibSupport({mobile:true});press('end');
/* 3. 숫자 길게: 단축 번호, # 길게 = 매너모드, 1 길게 = 소리샘 */
press('#');L().event('hold','#');assert.equal(D.alert,'vib','# 길게: 매너모드');assert.equal(L().dial,'');press('#');L().event('hold','#');assert.equal(D.alert,'ring','다시 길게: 해제');
/* 키보드로 누르고 있기 (자동 반복의 첫 번째가 '길게') */
const kev=(code,key,repeat)=>({code,key,repeat,target:doc.body,preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}});
T.onKey(kev('Digit2','2',false));assert.equal(L().dial,'2');T.onKey(kev('Digit2','2',true));assert.equal(L().screen,'call','2 길게: 엄마에게');assert.equal(S.call.who.id,'mom');press('end');run(1600);
/* 손가락으로 누르고 있기 */
const stage=A.geometry.stage,cv=T.canvas,keyEv=k=>{const i=A.pad.indexOf(k),c=T.padCols[i%3],r=T.padRows[Math.floor(i/3)];return{clientX:((c[0]+c[1])/2-stage.x)*A.state.cssW/stage.w,clientY:((r[0]+r[1])/2-stage.y)*A.state.cssH/stage.h,pointerId:7}};
cv.emit('pointerdown',keyEv('1'));assert.equal(L().dial,'1');run(900);assert.equal(L().screen,'vmbox','1 길게: 소리샘');cv.emit('pointerup',keyEv('1'));press('end');
cv.emit('pointerdown',keyEv('3'));run(300);cv.emit('pointerup',keyEv('3'));run(800);assert.equal(L().screen,'idle','짧게 누르면 그냥 숫자');assert.equal(L().dial,'3');press('end');
/* 단축 번호 정하기 */
press('menu','1');S.sel=L().book().findIndex(p=>p.id==='bunsik');press('ok');assert.equal(L().screen,'person');S.sel=3;press('ok');assert.equal(L().screen,'speedSet');press('5');assert.equal(D.speed['5'],'bunsik');press('end');
press('5');L().event('hold','5');assert.equal(S.call.who.id,'bunsik','5 길게: 은하분식');press('end');run(1600);
/* 4. 발신 번호 표시 제한: *23# + 번호 */
const fnum=LC.fakeNum('p2').replace(/\D/g,'');
press('*','2','3','#');for(const d of fnum)press(d);press('send');assert.equal(lastSent('ring').hide,1,'친구에게 번호 숨기고 걸기');assert.ok(D.calls[0].n.includes('번호 숨김'));press('end');run(1600);
net$({type:'phone',op:'ring',from:'p3',name:'',call:'h1',hide:1});assert.equal(S.call.who.n,'발신 번호 표시 제한');press('send');assert.equal(S.call.phase,'live');assert.equal(D.calls[0].peer,null,'숨긴 번호는 다시 걸 수 없음');press('end');run(1600);
press('menu','3');S.sel=0;press('send');assert.ok(S.pop.text.includes('숨겨진'));press('end');
const momNum=LC.book.find(b=>b.id==='mom').num.replace(/\D/g,'');press('*','2','3','#');for(const d of momNum)press(d);press('send');run(2600);assert.equal(S.call.phase,'talk');run(2000);assert.ok(S.call.lines.join(' ').includes('누구'),'엄마: 누구세요?');press('end');run(1600);
/* 5. 소리샘: 친구가 거절하면 음성 메시지를 남긴다 */
press('menu','1','send');const cid=lastSent('ring').call;net$({type:'phone',op:'decline',from:'p2',name:'영희',call:cid});assert.equal(S.call.phase,'vmprompt');assert.ok(S.call.vmMsg.includes('소리샘'));
run(3600);assert.equal(S.call.phase,'vmrec');assert.equal(typ.hidden,false,'녹음 중에는 자판 칸');typIn.value='나 놀이터야 전화해';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});
assert.equal(lastSent('vm').text,'나 놀이터야 전화해');assert.equal(S.call.endMsg,'메시지가 저장되었습니다');run(1600);
press('menu','1','send');const cid2=lastSent('ring').call;net$({type:'phone',op:'decline',from:'p2',name:'영희',call:cid2,why:'off'});assert.ok(S.call.vmMsg.includes('전원이 꺼져'),'꺼져 있으면 그 시절 안내');press('end');run(1600);
/* 학원 쌤(안 받음) → 소리샘 → 나중에 답장 */
press('menu','1');S.sel=L().book().findIndex(p=>p.id==='teacher');press('send');run(2500);assert.equal(S.call.phase,'msg');run(3400);assert.equal(S.call.phase,'vmrec');for(const k of '2*15')press(k);press('ok');assert.equal(S.call.endMsg,'메시지가 저장되었습니다');run(1600);flush();
assert.ok(D.inbox.some(m=>m.fromId==='teacher'&&m.text.includes('소리샘')),'쌤 답장');
/* 음성 메시지 받기 → 1 길게 → 듣기 */
net$({type:'phone',op:'vm',from:'p3',name:'민수',text:'야 내일 학교 쉬는 날이야!'});assert.equal(D.vm[0].from,'민수');assert.ok(D.inbox[0].text.includes('[소리샘]'));
press('end','1');L().event('hold','1');assert.equal(L().screen,'vmbox');press('ok');assert.equal(L().screen,'vmplay');assert.equal(D.vm[0].heard,true);run(4000);press('3','ok');assert.equal(D.vm.length,0,'3: 지우기');press('end');
/* 6. 콜키퍼: 꺼져 있을 때 온 전화를 켜면 알려 준다 */
const end=T.front.find(b=>b.id==='end'),evE={clientX:(end.cx-stage.x)*A.state.cssW/stage.w,clientY:(end.cy-stage.y)*A.state.cssH/stage.h};
cv.emit('pointerdown',evE);run(850);run(1100);assert.equal(A.state.power,'off');cv.emit('pointerup',evE);
net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'ck1'});assert.equal(lastSent('decline').why,'off','꺼져 있으면 꺼짐으로 알림');assert.equal(D.ck.length,1);
cv.emit('pointerdown',evE);run(850);cv.emit('pointerup',evE);run(1500);assert.equal(A.state.power,'on');flush();assert.ok(D.inbox[0].from==='콜키퍼'&&D.inbox[0].text.includes('영희'),'콜키퍼 문자');assert.equal(D.ck.length,0);
console.log("PART2 OK",JSON.stringify(L().data.inbox.slice(0,3).map(m=>m.from+":"+m.text.slice(0,30))));
/* 7. ARS: 1588-0530 숫자로 고르기, 투표 정보이용료, 상담원 연결 대기 */
const info0=D.bill.info,sec0=D.bill.sec;press('end');for(const d of '15880530')press(d);press('send');run(1800);assert.equal(S.call.phase,'ars');assert.ok(S.call.ars.text.includes('은하 ARS'));
press('1');assert.equal(S.call.ars.node,'wx');assert.ok(S.call.ars.text.includes('비 내림'),'1번: 우리 동네 날씨');press('*');assert.equal(S.call.ars.node,'root');
press('2','7');assert.equal(S.call.ars.node,'luck2');press('*','4','3');assert.equal(S.call.ars.node,'voted');assert.equal(D.bill.info-info0,200,'투표 200원');assert.ok(D.payLog[0].name.includes('투표'));
press('*','9');assert.equal(S.call.ars.bad,true,'없는 번호: 잘못 누르셨습니다');press('0');run(4000);assert.equal(S.call.phase,'agent');assert.ok(S.call.ars.agentText.includes('대기 고객'));run(26000);assert.ok(S.call.ars.agentText.includes('점심시간'),'26초 기다리면 상담원');run(9000);assert.equal(S.call,null,'상담원이 끊음');assert.equal(L().screen,'idle');
assert.ok(D.bill.sec-sec0>=30,'ARS도 통화료');
/* 114 안내 → 가게 연결 (80원) */
const info1=D.bill.info;press('1','1','4','send');run(1800);assert.equal(S.call.who.n,'안내 114');press('3');assert.ok(S.call.ars.text.includes('02-530-0117'),'별빛문구 번호');press('1');assert.equal(D.bill.info-info1,80);assert.equal(S.call.who.n,'별빛문구완구','바로 연결');run(2600);assert.equal(S.call.phase,'talk');press('end');run(1600);
assert.ok(D.calls.some(c=>c.n==='별빛문구완구'),'통화 기록에 남음');
/* 8. 스팸 문자, 스팸 차단, 080 수신 거부 */
S.everShown=true;S.life.t0=Date.now()-3.2*60000;S.life.nextTry=0;L().tick();assert.equal(D.inbox[0].spam,1,'3분 뒤 광고 문자');assert.equal(D.inbox[0].from,'모르는 번호');
press('end','menu','2');S.sel=7;press('ok');assert.equal(D.spamBlock,true,'스팸 차단 켜기');S.life.spamAt=0;S.life.nextTry=0;const nIn=D.inbox.length;L().tick();assert.equal(D.inbox.length,nIn,'차단하면 받은 문자함에 안 옴');assert.equal(D.spam.length,1,'스팸 보관함으로');
S.sel=6;press('ok');assert.equal(L().screen,'spambox');press('ok');assert.equal(L().screen,'read');press('end');
press('0','8','0','5','3','0','0','0','0','0','send');run(1800);assert.equal(S.call.ars.kind,'optout');press('1');assert.equal(D.optout,true,'080 수신 거부');press('end');run(1600);
/* 스팸 신고: 모르는 번호 문자 → 메뉴 → 스팸으로 신고 */
D.spamBlock=false;S.life.spamAt=0;S.life.nextTry=0;L().tick();const spamMsg=D.inbox[0];assert.equal(spamMsg.spam,1);press('end','ok');S.sel=0;press('menu');assert.equal(L().screen,'readMenu');
S.sel=/(0\d{1,2}-\d{3,4}-\d{4}|1\d{3}-\d{4})/.test(spamMsg.text)?2:1;/* 전달, (문자 속 번호로 걸기), 스팸 신고 */
press('ok');assert.ok(!D.inbox.includes(spamMsg),'신고하면 받은 문자함에서 빠짐');assert.equal(D.spam[0].text,spamMsg.text);assert.equal(L().screen,'sms');press('end');
/* 문자 속 번호로 바로 걸기 (당첨 문자 → 1588-0530 ARS) */
L().receive({from:'모르는 번호',text:SPAM_WIN,spam:1});press('end','ok');S.sel=0;press('menu');S.sel=1;press('ok');assert.equal(L().screen,'call');assert.equal(S.call.who.ars,'info','문자 속 번호로 ARS');press('end');run(1600);
/* 9. 엄마가 먼저 거는 전화: 번호로 대답, 있는 곳에 따라 다른 대답 (PC방인데 집에 간다고 하면 들킴) */
w.__GAME_DEBUG__.player.scene='pcroom';assert.equal(L().npcCall('mom'),true);assert.equal(S.call.phase,'ring');press('send');assert.equal(S.call.phase,'script');assert.ok(S.call.lines[0].text.includes('어디야'));assert.equal(S.call.opts.length,3);
press('1');run(1000);assert.ok(S.call.lines.at(-1).text.includes('키보드 소리'),'거짓말 들킴');run(4000);run(1600);assert.equal(L().screen,'idle');flush();assert.ok(D.inbox.some(m=>m.fromId==='mom'&&m.text.includes('저녁 없다')),'엄마 문자');
w.__GAME_DEBUG__.player.scene='playground';L().npcCall('mom');press('send','3');run(1000);assert.ok(S.call.lines.at(-1).text.includes('6시 전에는'),'놀이터에 있으면 그대로 믿음');press('end');run(1600);
w.__GAME_DEBUG__.player.scene='street';
/* 안 받으면 부재중 + 문자 */
L().npcCall('minho');run(25500);assert.equal(D.calls[0].t,'miss');run(1600);flush();assert.ok(D.inbox.some(m=>m.fromId==='minho'&&m.text.includes('전화 좀 받아')),'안 받으면 민호 문자');
/* 동네가 알아서: 4분 반 뒤 민호 전화 (실제 시간) */
S.life.t0=Date.now()-4.6*60000;S.life.nextTry=0;S.life.spamN=9;L().tick();assert.equal(S.call&&S.call.npc&&S.call.script,'minho','민호가 먼저 전화');press('end');run(1600);
/* 저녁이 되면 엄마 전화 */
ids.clockLabel.textContent='오후 6:24';S.life.nextTry=0;L().tick();assert.ok(S.life.momAt>0);S.life.momAt=Date.now()-1;S.life.nextTry=0;L().tick();assert.equal(S.call&&S.call.script,'mom','저녁이 되면 엄마 전화');press('end');run(1600);ids.clockLabel.textContent='오후 4:32';
/* 설정에서 끄면 안 옴 */
D.npc=false;S.life.minho=false;S.life.nextTry=0;L().tick();assert.equal(S.call,null);D.npc=true;
/* 10. 가짜 전화와 알람 */
press('menu');S.sel=L().state.sel;press('end');press('menu');const ai=LC.apps.findIndex(a=>a.id==='alarm');S.sel=ai;press('ok');assert.equal(L().screen,'alarm');S.sel=4;press('ok');assert.equal(L().screen,'idle');assert.ok(S.fake);run(10200);assert.equal(S.call.script,'fake_mom','10초 뒤 가짜 전화');press('send');run(3000);assert.ok(S.call.lines.some(l=>l.text.includes('가짜 전화')));press('end');run(1600);
press('menu');S.sel=ai;press('ok');S.sel=0;press('ok');assert.ok(S.alarm);press('end');run(61000);assert.equal(L().screen,'alarmRing','1분 뒤 알람');press('*');assert.ok(S.alarm,'5분 뒤 다시');assert.equal(L().screen,'idle');S.alarm.at=now;run(100);assert.equal(L().screen,'alarmRing');press('ok');assert.equal(L().screen,'idle');assert.equal(S.alarm,null);
/* 11. 문자: 문자 그림, 여러 명에게, 전달, 수신 확인, 행운의 문자, 숫자 암호 */
press('menu','2');S.sel=4;press('ok');assert.equal(L().screen,'phrases');assert.equal(S.arg.art,true);press('1');assert.equal(L().screen,'compose');assert.equal(S.step,0);
press('*');press('down','*');press('down','*');assert.equal(S.marks.length,3,'*로 세 명');press('ok');assert.equal(S.step,1);assert.ok(S.arg.toList.length===3);
assert.ok(L().editor.text().includes('\n')&&L().editor.text().includes('생일 축하'),'문자 그림 넣기 (여러 줄)');assert.ok(L().editor.bytes()<=80);
sent.length=0;press('ok');assert.equal(L().screen,'sending');for(let i=0;i<20&&L().screen==='sending';i++){run(300);const m=sent.filter(o=>o.op==='sms').at(-1);if(m&&!m.acked){m.acked=1;net$({type:'phone',op:'sent',for:'sms',to:m.to,at:now})}}
assert.equal(sent.filter(o=>o.op==='sms').length,2,'같은 방 친구 둘에게 (1.3초 간격)');assert.equal(L().screen,'sms');assert.ok(S.pop.text.includes('3명에게'),'세 명 다 보냄');
/* 수신 확인 */
const mine=D.sent.find(m=>m.peer&&m.toId==='peer:p2');net$({type:'phone',op:'seen',from:'p2',name:'영희',mid:mine.id});assert.ok(mine.seenAt,'친구가 읽음');
net$({type:'phone',op:'sms',from:'p3',name:'민수',text:'8282',mid:'m99'});press('end','ok');S.sel=0;press('ok');assert.equal(L().screen,'read');assert.equal(lastSent('seen').mid,'m99','읽으면 수신 확인 보냄');assert.ok(L().state.arg.seen);
/* 전달 */
press('menu');S.sel=1;press('ok');assert.equal(L().screen,'compose');assert.equal(S.arg.fw,'8282');S.sel=0;press('ok');assert.equal(L().editor.text(),'8282','전달하면 글이 들어 있음');press('end');
/* 행운의 문자: 세 명에게 전달하면 민호가 떡볶이 쏨 */
S.life.chain=false;S.life.t0=Date.now()-9.5*60000;S.life.nextTry=0;S.life.minho=true;S.life.mom=true;L().tick();assert.ok(D.inbox[0].text.includes('행운의 문자'));
D.chain=0;for(let i=0;i<3;i++)L().sendSms({n:'엄마',id:'mom'},D.inbox[0].text);flush();assert.ok(D.inbox.some(m=>m.text.includes('떡볶이는 내가 쏜다')),'행운의 문자 보상');
console.log("PART4 OK");
/* 12. NATE: 신규 게임 줄, 바로가기 3535, 게임 받기(요금), 바로 해 보기 */
press('end','nate');run(1500);const home=BS().cur.items();assert.equal(home[9].label,'MY NATE (요금·즐겨찾기)');assert.ok(home[11].label.includes('쿵짝 리듬왕'),'홈에 신규 게임');press('end');
press('3','5','3','5','nate');run(1500);run(2600);assert.equal(BS().cur.id,'newGames','3535 = 신규 게임');const rg=w.AnycallNate.CATALOG.find(g=>g.id==='rhythm');
NB().nav('gameItem',rg,{failRate:0});run(2600);assert.equal(BS().cur.items()[0].label,'게임 받기');assert.ok(BS().cur.items().some(x=>x.label.includes('선물하기')));
const won0=BS().won,info2=D.bill.info;press('1');assert.ok(S.confirm.text.includes('290KB'));press('ok');run(4300);assert.equal(D.got.rhythm,1,'리듬왕 받음');assert.equal(D.bill.info-info2,3000);assert.ok(BS().won-won0>=3700,'데이터 통화료 290KB = 약 3,770원');
flush();assert.ok(S.confirm&&S.confirm.text.includes('지금 해 볼까요'));press('ok');assert.equal(L().screen,'rhythm','받고 바로 실행');press('end');
/* 휴대폰 게임 메뉴에서 안 받은 큰 게임 → NATE 게임 쪽으로 */
press('menu','8');S.sel=5;press('ok');assert.ok(S.confirm.text.includes('NATE'));press('ok');assert.equal(L().screen,'nate');run(1500);run(2600);assert.equal(BS().cur.id,'gameItem');assert.equal(BS().cur.arg.id,'rpg');press('end');
/* 선물하기: 같은 방 친구에게 게임 선물 → 서버가 받았다고 하면 그때 요금 */
press('nate');run(1500);NB().nav('giftTo',{item:'rpg',name:'게임 골목대장 전설',price:3500},{failRate:0});run(2600);const info3=D.bill.info;press('1');assert.ok(S.confirm.text.includes('영희'));press('ok');assert.equal(lastSent('gift').item,'rpg');assert.equal(D.bill.info,info3,'아직 요금 안 나감');
net$({type:'phone',op:'sent',for:'gift',to:'p2',at:now});run(100);assert.equal(D.bill.info-info3,3500,'선물 요금');assert.ok(S.pop.text.includes('선물했어요'));
/* 선물 받기 */
net$({type:'phone',op:'gift',from:'p3',name:'민수',item:'rpg',text:'같이 하자'});assert.equal(D.got.rpg,1,'선물로 받은 게임');assert.ok(D.inbox[0].text.includes('NATE 선물')&&D.inbox[0].text.includes('골목대장'));assert.equal(D.gifts[0].from,'민수');
net$({type:'phone',op:'gift',from:'p3',name:'민수',item:'<script>'});assert.equal(D.gifts.length,1,'이상한 선물은 무시');
/* 이름 궁합 (획수), 사다리, OX 퀴즈, 학교 생활, TV, 투표, 문자 그림 받기 */
assert.equal(w.AnycallNate.matchScore('김철수','이영희').pct,57,'김철수 ♡ 이영희 = 57%');assert.equal(w.AnycallNate.strokes('김'),7);
NB().nav('match',null,{failRate:0});run(2600);typIn.value='김철수 이영희';typIn.emit('input',{isComposing:false});typIn.emit('keydown',{key:'Enter'});run(2600);assert.equal(BS().cur.id,'matchRes');assert.ok(BS().cur.text.includes('57%'));
NB().nav('ladder',null,{failRate:0});run(2600);press('2');assert.ok(BS().cur.run);run(1700);
NB().nav('quiz',null,{failRate:0});run(2600);press('1');run(2600);for(let i=0;i<5;i++){press('1');run(2600)}assert.equal(BS().cur.id,'quizQ');assert.ok(BS().cur.text.includes('문제 맞혔어요'),'퀴즈 결과');
NB().nav('meal',null,{failRate:0});run(2600);assert.ok(BS().cur.text.includes('카레라이스'),'오늘 급식');
NB().nav('tv',null,{failRate:0});run(2600);assert.ok(BS().cur.text.includes('주몽'));
const info4=D.bill.info;NB().nav('vote',null,{failRate:0});run(2600);assert.ok(BS().cur.items().length>=5);press('1','ok');run(2600);assert.equal(D.bill.info-info4,100,'투표 100원');assert.equal(BS().cur.id,'voteRes');
NB().nav('arts',null,{failRate:0});run(2600);press('1');run(2600);press('1');assert.ok(D.emoBox.some(x=>x.includes('생일 축하')),'문자 그림을 보관함에');
NB().nav('results','이름 궁합',{failRate:0});run(2600);assert.ok(BS().cur.items().some(x=>x.label==='이름 궁합'),'검색으로 찾기');
NB().nav('novel',null,{failRate:0});run(2600);assert.equal(BS().cur.items().length,6,'소설 6화까지');
NB().nav('psy',null,{failRate:0});run(2600);assert.equal(BS().cur.items().length,2,'심리 테스트 두 가지');
NB().nav('gifts',null,{failRate:0});run(2600);assert.ok(BS().cur.text.includes('민수'));press('end');
console.log("PART5 OK");
/* 13. 쿵짝 리듬왕: 곡 → 음표, 판정, 콤보, 피버, 점수, 기록 */
const GX=L().games,GT=GX._test;assert.ok(GX&&GT,'게임 모듈');
const songs=GT.rhythmSongs();assert.ok(songs.length>=12,'곡 12개 (리듬왕 전용 2 + 뮤직박스 10)');
const ch0=GT.buildChart(songs[0],0),ch1=GT.buildChart(songs[0],1),ch2=GT.buildChart(songs[0],2);assert.ok(ch0.notes.length<ch1.notes.length&&ch1.notes.length<=ch2.notes.length,'쉬움 < 보통 <= 어려움');
assert.ok(ch1.notes.every((n,i)=>i===0||n.t>=ch1.notes[i-1].t),'시간 순서');assert.ok(ch1.notes.every(n=>n.lane>=0&&n.lane<=2));assert.equal(JSON.stringify(GT.buildChart(songs[0],1).notes.map(n=>n.lane)),JSON.stringify(ch1.notes.map(n=>n.lane)),'같은 곡은 늘 같은 악보');
assert.ok(ch0.end>20&&ch0.end<60,'한 곡 20~60초');assert.ok(ch2.notes.some((n,i)=>i>0&&n.t===ch2.notes[i-1].t),'어려움은 두 줄 동시');
/* 실제로 해 보기: 소리가 없으면 화면 시계로 */
press('menu','8');S.sel=4;press('ok');assert.equal(L().screen,'rhythm');const RG=GT.RG;assert.equal(RG.mode,'title');press('ok');assert.equal(RG.mode,'select');RG.sel=0;RG.diff=1;press('ok');assert.equal(RG.mode,'play');
assert.equal(L().ownsSound('5'),true,'놀이 중에는 키음 대신 음표 소리');
const notes=RG.chart.notes;let hit=0;const t0=now;
for(const n of notes){const target=t0+ (n.t+1.2)*1000;if(n.i%7===6)continue;while(now<target-10){now+=10;T.step(now)}now=target;T.step(now);const key=[ '4','5','6'][n.lane];A.press(key);hit++}
run(4000);assert.equal(RG.mode,'result');assert.ok(RG.result.cnt.p>=hit-3,'제때 누르면 PERFECT');assert.ok(RG.result.cnt.m>=1,'빼먹은 음표는 MISS');assert.ok(['S','A','B'].includes(RG.result.grade));assert.ok(RG.result.score>0);
assert.ok(D.games.rhythm.best[songs[0].id+':1'].score===RG.result.score,'기록 저장');assert.equal(D.games.rhythmBest,RG.result.score);
/* 너무 일찍 누르면 무시, 조금 늦으면 GOOD */
press('ok');RG.sel=1;RG.diff=0;press('ok');const n0=RG.chart.notes[0],tt=now-30;now=tt+(n0.t+1.2-0.5)*1000;T.step(now);A.press(['4','5','6'][n0.lane]);assert.equal(n0.j,null,'0.5초 일찍 누르면 무시');
now=tt+(n0.t+1.2+0.12)*1000;T.step(now);A.press(['4','5','6'][n0.lane]);assert.equal(n0.j,'d','0.12초 늦으면 GOOD');
/* 멈춤 → 계속 → 그만 */
press('clr');assert.equal(RG.mode,'pause');press('ok');assert.equal(RG.mode,'play');press('clr','3');assert.equal(RG.mode,'select');
/* 어려움은 보통을 B 이상으로 깨야 열림 */
RG.sel=1;RG.diff=2;press('ok');assert.equal(RG.mode,'select');assert.ok(S.pop.text.includes('어려움'));
/* 전화가 오면 멈췄다가 끊으면 돌아옴 */
RG.sel=0;RG.diff=1;press('ok');assert.equal(RG.mode,'play');net$({type:'phone',op:'ring',from:'p2',name:'영희',call:'gr1'});assert.equal(L().screen,'call');assert.equal(RG.mode,'pause','전화 오면 멈춤');
press('end');run(1600);assert.equal(L().screen,'rhythm','끊으면 게임으로');assert.equal(RG.mode,'pause');press('end');assert.equal(L().screen,'idle');
console.log("PART6 OK");
/* 14. 골목대장 전설 */
const RP=GT.RP,rnd=Math.random;const talkAll=()=>{for(let i=0;i<12&&RP.talk;i++){press('ok');press('ok')}};
press('menu','8');S.sel=5;press('ok');assert.equal(L().screen,'rpg');assert.equal(RP.mode,'title');press('ok');assert.equal(RP.mode,'name');assert.equal(typ.hidden,false,'이름은 자판으로도');
for(const k of '7*1#8')press(k);/* ㅅ ㆍ ㅣ → 서, # 띄움 x, ㅇ */ typIn.value='철수';typIn.emit('input',{isComposing:false});press('ok');assert.equal(RP.mode,'map');assert.equal(RP.s.name,'철수');assert.equal(RP.s.map,'town');assert.ok(RP.talk,'엄마 이야기로 시작');talkAll();assert.equal(RP.talk,null);
assert.equal(L().repeats('up'),true,'걷기는 누르고 있으면 계속');assert.equal(L().repeats('5'),false);
/* 걷기와 막힘 */
const s=RP.s;press('up');run(200);assert.equal(s.y,5);press('left');run(200);assert.equal(s.x,6);
GT.enterMap('town',1,6,'l');press('left');run(200);assert.equal(s.x,1,'나무에 막힘');
/* 버튼을 누르고 있으면 계속 걷는다 (몸체가 되풀이) */
GT.enterMap('town',2,5,'r');const nav=T.nav,stg=A.geometry.stage,up={clientX:(nav.cx+nav.rx*.7-stg.x)*A.state.cssW/stg.w,clientY:(nav.cy-stg.y)*A.state.cssH/stg.h,pointerId:9};
T.canvas.emit('pointerdown',up);run(1000);T.canvas.emit('pointerup',up);run(300);assert.ok(s.x>=5,'오른쪽 버튼을 누르고 있는 동안 여러 칸');
/* 집: 엄마에게 말 걸면 회복과 저장 */
GT.enterMap('town',3,4,'u');s.hp=5;press('up');assert.ok(RP.talk&&RP.talk.name==='엄마');talkAll();assert.equal(s.hp,GT.stat(s).hp,'힘이 다 참');assert.ok(memory.get('2006_anycall_rpg_v1'),'저장');
/* 문방구: 30cm 자 사기 */
GT.enterMap('town',11,4,'u');press('up');talkAll();assert.equal(RP.mode,'shop');press('1');assert.equal(s.weapon,'ruler');assert.equal(s.gold,10);press('clr');talkAll();assert.equal(RP.mode,'map');
/* 싸움: 슬라임 이기기 → 경험치와 돈 */
const ex0=s.exp,g0=s.gold;GT.startBattle('slime');assert.equal(RP.mode,'battle');run(1300);assert.equal(RP.bt.phase,'cmd');
for(let i=0;i<12&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}assert.equal(RP.mode,'map','이김');assert.equal(s.exp-ex0,6);assert.equal(s.gold-g0,8);
/* 레벨 업과 기술 */
s.exp=GT.expNeed(1)-1;GT.startBattle('slime');for(let i=0;i<14&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}assert.equal(s.lv,2,'레벨 2');
s.lv=5;s.mp=20;GT.startBattle('cat');run(1300);press('2');assert.ok(RP.bt.sub&&RP.bt.sub.items.length===3,'레벨 5: 기술 세 개');press('3');assert.equal(s.mp,15,'구슬 폭탄 MP 5');
for(let i=0;i<14&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}assert.equal(RP.mode,'map');
/* 가방: 싸움 중 떡꼬치 */
s.hp=10;s.items.skewer=1;GT.startBattle('mosq');run(1300);press('3');assert.equal(RP.bt.sub.title,'가방');press('1');run(1300);assert.ok(s.hp>10||RP.mode!=='battle','떡꼬치로 회복');for(let i=0;i<14&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}
/* 도망 (보스는 못 도망) */
Math.random=()=>0;GT.startBattle('crow');run(1300);press('4');run(1300);run(1300);assert.equal(RP.mode,'map','도망 성공');Math.random=rnd;
/* 쓰러지면 집에서 깨어나고 돈이 반 */
s.gold=100;s.hp=1;GT.startBattle('shadow');run(1300);Math.random=()=>.99;press('4');for(let i=0;i<6&&RP.mode==='battle';i++)run(1300);Math.random=rnd;assert.equal(RP.mode,'gameover');run(1300);press('ok');assert.equal(s.map,'town');assert.equal(s.gold,50);assert.equal(s.hp,GT.stat(s).hp);talkAll();
/* 뒷산: 몬스터가 나오는 풀숲, 상자, 꼬마 부탁 */
GT.enterMap('forest',8,10,'u');Math.random=()=>0;RP.encN=10;press('up');run(200);Math.random=rnd;assert.equal(RP.mode,'battle','풀숲에서 몬스터');RP.bt.hp=0;RP.bt.q=[{chk:1}];GT.advanceBattle();for(let i=0;i<6&&RP.mode==='battle';i++){press('ok');run(300)}assert.equal(RP.mode,'map');
GT.enterMap('forest',8,6,'u');press('up');talkAll();assert.equal(s.items.marble,1,'상자에서 왕구슬');
GT.enterMap('forest',13,9,'r');const g1=s.gold;press('ok');talkAll();assert.equal(s.flags.kidDone,1);assert.equal(s.gold-g1,120,'꼬마 부탁 보상');assert.ok(!s.items.marble);
GT.enterMap('forest',8,16,'d');press('down');run(200);assert.equal(s.map,'town','아래로 나가면 마을');assert.equal(s.y,1);
/* 폐교: 잠긴 문, 해골 모형(중간 보스) → 열쇠 → 계단 → 옥상 */
GT.enterMap('school',2,5,'u');press('up');assert.ok(RP.talk.pages[0].includes('잠겨'));talkAll();
GT.enterMap('school',13,3,'u');press('ok');talkAll();assert.equal(RP.mode,'battle');assert.equal(RP.bt.id,'skel');RP.bt.hp=1;run(1300);s.lv=8;Object.assign(s,{hp:GT.stat(s).hp});for(let i=0;i<10&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}
assert.equal(s.flags.skel,1);assert.equal(s.items.key,1,'과학실 열쇠');talkAll();assert.ok(!RP.npcs.some(n=>n.id==='skel'&&!n.gone));
GT.enterMap('school',2,5,'u');press('up');talkAll();assert.equal(s.flags.stairOpen,1);press('up');run(200);assert.equal(s.y,4,'열린 문으로 지나감');press('up');run(200);press('left');run(200);press('up');run(200);press('up');run(200);
assert.equal(s.map,'roof','계단으로 옥상');
/* 도깨비 대장 → 황금 딱지 상자 → 엔딩 */
GT.enterMap('roof',5,3,'u');press('ok');talkAll();assert.equal(RP.bt.id,'king');assert.equal(RP.bt.mon.boss,true);run(1300);assert.equal(RP.bt.phase,'cmd');press('4');run(100);assert.equal(RP.bt.cur&&RP.bt.cur.t,'도망칠 수 없다!');
for(let i=0;i<6&&RP.bt.phase!=='cmd';i++)run(1300);RP.bt.hp=1;RP.bt.healed=true;s.hp=GT.stat(s).hp;for(let i=0;i<14&&RP.mode==='battle';i++){if(RP.bt&&RP.bt.phase==='cmd')press('1');run(1300)}assert.equal(s.flags.king,1);talkAll();
press('ok');talkAll();assert.equal(RP.mode,'ending','엔딩');assert.equal(D.games.rpgClears,1);assert.equal(s.items.goldDdakji,1);run(3000);press('ok');assert.equal(RP.mode,'title');
/* 이어 하기 */
press('end');press('menu','8');S.sel=5;press('ok');assert.equal(RP.sel,1,'기록이 있으면 이어 하기');press('ok');assert.equal(RP.mode,'map');assert.equal(RP.s.name,'철수');press('end');assert.equal(L().screen,'idle');
console.log('PASS test_anycall_a124');
