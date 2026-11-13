'use strict';
/* A98 (2026-11-13 KST): 애니콜 슬라이드폰. (A99에서 닫힘 거리 595, 메뉴 16칸, 문자 쓰기에 맞춰 고침) 받은 그림 그대로 쓰기, 상판을 실제로 옮기는 260ms 애니메이션,
   움직이는 동안 누름 막기, 닫혔을 때 숫자판 막기, 버튼 위치와 소리 높이, 간편모드와 전체화면, 키보드,
   액정 화면(전화, 문자, 통화 기록, 벨소리, 배경 화면, 게임, NATE, 내 위치, 설정), 메뉴판의 휴대폰 탭, 가방 속 기본 소지품을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/* 1. The replacement panels are WebP and are distinct images. */
for(const name of ['front','back']){
 const image=fs.readFileSync(path.join(ROOT,'assets/phone/anycall_'+name+'.webp'));
 assert.equal(image.toString('ascii',8,12),'WEBP');
}
/* 2. 메뉴판: 옷 아이보리 탭을 지우고 휴대폰 탭 */
const html=read('index.html');
const menu=html.slice(html.indexOf('<details id="gameMenu"'),html.indexOf('</details>',html.indexOf('<details id="gameMenu"')));
assert.ok(!html.includes('id="outfitBtn"')&&!html.includes('id="outfitLabel"')&&!menu.includes('아이보리'),'옷 아이보리 탭 없음');
assert.ok(menu.includes('<button id="phoneBtn" type="button">휴대폰 <span id="phoneLabel">애니콜</span></button>'),'휴대폰 탭');
assert.ok(html.includes("uiClick('phoneBtn',()=>window.AnycallPhone?.toggle());")&&!html.includes("uiClick('outfitBtn'"),'휴대폰 탭 누르기');
assert.ok(html.includes("if(k==='KeyN'){window.AnycallPhone?.toggle();return}"),'N 키');assert.ok(html.includes('N 휴대폰 꺼내기/넣기'),'조작법 안내');
assert.ok(html.includes('if(D.outfit)D.outfit.textContent='),'V 옷 바꾸기는 그대로 두되 지운 탭을 건드리지 않음');
assert.ok(html.includes("window.AnycallPhone?.bagCard?.()"),'가방에 기본 소지품');
const iWA=html.indexOf('src/world-audio.js'),iL=html.search(/<script src="src\/anycall-lcd\.js\?v=A(?:9[89]|10\d)"><\/script>/),iP=html.search(/<script src="src\/anycall-phone\.js\?v=A(?:9[89]|10\d)"><\/script>/);
assert.ok(iWA>0&&iL>iWA&&iP>iL,'읽는 순서: 소리 → 액정 → 몸체');assert.ok(/<link rel="stylesheet" href="assets\/phone\/anycall-phone\.css\?v=A(?:9[89]|10\d)">/.test(html));assert.ok(html.includes('src/web-town.js?v=A98'));
for(const f of ['src/anycall-phone.js','src/anycall-lcd.js','assets/phone/anycall-phone.css']){const s=read(f);assert.ok(/A(?:9[89]|10\d)/.test(s)&&s.includes('2026-11-13'),'버전과 날짜 '+f);assert.ok(!s.includes(String.fromCharCode(0x2014)),'긴 줄표 없음 '+f)}
assert.ok(/drawWall,/.test(read('src/web-town.js').split('w.WebTown=')[1]),'배경 화면 그리기를 내보냄');

/* 3. 가짜 화면에서 모듈 읽기 */
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='measureText'?s=>({width:String(s).length*6}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=String(tag).toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this.textContent='';this.hidden=false;this.dataset={};this.parent=null;this.width=300;this.height=150;
  const self=this;this.classList={add:(...c)=>{for(const x of c)if(!self.classList.contains(x))self.className=(self.className+' '+x).trim()},remove:(...c)=>{self.className=self.className.split(/\s+/).filter(x=>!c.includes(x)).join(' ')},contains:c=>self.className.split(/\s+/).includes(c),toggle:(c,on)=>{const has=self.classList.contains(c);const want=on===undefined?!has:!!on;if(want&&!has)self.classList.add(c);if(!want&&has)self.classList.remove(c);return want}}}
 get isConnected(){let n=this;while(n.parent)n=n.parent;return n===doc}
 append(...n){for(const c of n){if(typeof c==='string')continue;c.parent=this;this.children.push(c)}}
 setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]}
 addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f)}removeEventListener(){}
 emit(t,e={}){for(const f of this.listeners[t]||[])f({target:this,preventDefault(){},stopPropagation(){},clientX:0,clientY:0,button:0,pointerId:1,...e})}
 getContext(){return this.tagName==='CANVAS'?(this._ctx=this._ctx||fakeCtx()):null}
 getBoundingClientRect(){return{left:0,top:0,width:parseFloat(this.style.width)||100,height:parseFloat(this.style.height)||100,right:0,bottom:0}}
 setPointerCapture(){}blur(){}focus(){}click(){this.emit('click')}
 querySelector(){return null}}
const doc=new Node('#document');doc.body=new Node('body');doc.body.parent=doc;doc.createElement=t=>new Node(t);
const ids={};for(const id of ['phoneLabel','clockLabel','areaLabel','sceneLabel','weatherLabel','timeLabel','hint','game']){ids[id]=new Node('span');ids[id].id=id}
ids.clockLabel.textContent='오후 4:32';ids.areaLabel.textContent='동일초등학교 앞';ids.sceneLabel.textContent='거리';ids.weatherLabel.textContent='맑음';ids.timeLabel.textContent='늦은 오후';ids.phoneLabel.textContent='애니콜';
doc.getElementById=id=>ids[id]||null;doc.querySelector=()=>null;doc.addEventListener=()=>{};
const memory=new Map(),winListeners=[],timers=[];const images=[];
class Img{constructor(){images.push(this)}set src(v){this._src=v}get src(){return this._src}}
const w={document:doc,Math,Number,String,Array,Object,JSON,Set,Map,Promise,Date,console,Uint8ClampedArray,
 localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v))},
 innerWidth:1100,innerHeight:760,devicePixelRatio:1,Image:Img,
 addEventListener:(t,f,cap)=>winListeners.push({t,f,cap:!!cap}),removeEventListener(){},
 setTimeout:(f,ms)=>{timers.push({f,ms});return timers.length},clearTimeout(){},
 performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},GameAudio:{state:{enabled:true,volume:.65},unlock(){}},
 WebTown:null};
w.window=w;
vm.createContext(w);
vm.runInContext(read('src/web-town.js').replace(/^[\s\S]*?(const RINGS=\[)/,'$1').replace(/\nconst SMS_ART=[\s\S]*$/,'')+';window.WebTown={RINGS,PHONE_WALLS,drawWall,CONTACTS,synthPlay(){return{silent:true,why:"off"}},synthStop(){}};',w);
assert.equal(w.WebTown.RINGS.length,10,'폰꾸미기 천국 벨소리를 그대로 씀');
vm.runInContext(read('src/anycall-lcd.js'),w);if(fs.existsSync(path.join(ROOT,'src/anycall-nate.js')))vm.runInContext(read('src/anycall-nate.js'),w);vm.runInContext(read('src/anycall-phone.js'),w);
const A=w.AnycallPhone,T=A._test,L=()=>A.lcd,G=A.geometry;let now=1000;T.setClock(()=>now);
assert.ok(/^A(?:9[89]|10\d)$/.test(A.version));assert.ok(/^A(?:9[89]|10\d)$/.test(w.AnycallLCD.version));
const root=doc.body.children.find(n=>n.className.includes('ac-root'));assert.ok(root&&root.hidden,'몸체는 처음엔 숨어 있음');

/* 4. 좌표: 실측값과 액정 칸 */
assert.ok(G.slide>600&&G.slide<700,'새 하판 숫자 키가 드러나는 이동 거리');assert.equal(A.duration,260,'기본 260ms');
assert.ok(G.lcd.x<G.hole.x&&G.lcd.y<G.hole.y&&G.lcd.x+G.lcd.w>G.hole.x+G.hole.w&&G.lcd.y+G.lcd.h>G.hole.y+G.hole.h,'액정 칸이 구멍을 덮음');
assert.ok(G.stage.x<=152&&G.stage.x+G.stage.w>=728&&G.stage.y<=20&&G.stage.y+G.stage.h>=1743,'보이는 범위가 실루엣을 다 품음');

/* 5. 보이기, 그림 불러오기 */
A.show();assert.equal(root.hidden,false);assert.equal(A.state.mode,'mini','처음은 간편모드');assert.equal(images.length,2);
for(const im of images)im.onload();assert.equal(A.state.ready,true);
assert.ok(A.state.cssH>=250&&A.state.cssH<=520,'간편모드 크기');assert.equal(Math.round(A.state.cssW),Math.round(A.state.cssH*G.stage.w/G.stage.h),'비율 그대로');
assert.equal(ids.phoneLabel.textContent,'새 문자 2','안 읽은 문자 수가 탭에 보임');

/* 6. 누른 곳 찾기 */
const PAD=['1','2','3','4','5','6','7','8','9','*','0','#'];
const keyCenter=i=>[(T.padCols[i%3][0]+T.padCols[i%3][1])/2,(T.padRows[Math.floor(i/3)][0]+T.padRows[Math.floor(i/3)][1])/2];
for(let i=0;i<12;i++){const [x,y]=keyCenter(i);assert.notEqual(T.hit(x,y)?.kind,'key','닫힘: 숫자판은 상판에 가려짐 '+PAD[i])}
for(const b of T.front)assert.equal(T.hit(b.cx,b.cy+G.slide)?.id,b.id,'닫힘 상태 상판 버튼 '+b.name);
assert.equal(T.hit(470,1227+G.slide)?.id,'nate');assert.equal(T.hit(470,1160+G.slide)?.id,'up');assert.equal(T.hit(470,1291+G.slide)?.id,'down');assert.equal(T.hit(354,1229+G.slide)?.id,'left');assert.equal(T.hit(590,1229+G.slide)?.id,'right');
assert.equal(T.hit(440,460+G.slide)?.kind,'body','액정은 몸통 (누르면 슬라이드)');assert.equal(T.hit(125,700+G.slide)?.kind,'rim','바깥 가장자리는 테두리');
assert.equal(T.hit(60,900),null,'투명한 곳');assert.equal(T.hit(440,300),null,'닫혔을 때 위쪽 빈 곳');

/* 7. 열기: 실제로 상판이 움직이고, 움직이는 동안 누름은 무시 */
const pos=[];assert.equal(A.slide(true),true);const t0=now;
for(const dt of [0,16,65,130,195,259]){now=t0+dt;T.step(now);pos.push(A.state.pos);assert.equal(A.state.sliding,true,'움직이는 중 '+dt);assert.equal(A.slide(false),false,'움직이는 중 다시 누름 무시');assert.equal(A.press('5'),false,'움직이는 중 키 무시');assert.equal(A.press('ok'),false)}
for(let i=1;i<pos.length;i++)assert.ok(pos[i]<pos[i-1]||pos[i]===pos[i-1]&&i===1,'계속 위로');
assert.ok(Math.abs(pos[3]-G.slide*0.125)<1,'끝이 부드러운 움직임 (절반 시간에 87.5% 이동)');
now=t0+260;T.step(now);assert.equal(A.state.pos,0,'260ms에 정확히 열림');assert.equal(A.state.open,true);assert.equal(A.state.sliding,false);
for(let i=0;i<12;i++){const [x,y]=keyCenter(i);const h=T.hit(x,y);assert.equal(h.kind,'key');assert.equal(h.id,PAD[i],'열림: 숫자판 '+PAD[i])}
for(const b of T.front)assert.equal(T.hit(b.cx,b.cy)?.id,b.id,'열림 상태 상판 버튼 '+b.name);

/* 8. 소리: 누를 때마다 버튼마다 다른 높이 */
const tones=['1','2','3','4','5','6','7','8','9','*','0','#','menu','ok','up','down','left','right','nate','send','clr','end'].map(id=>T.toneFor(id).join('+'));
assert.equal(new Set(tones).size,22,'스물두 버튼 모두 다른 소리');assert.equal(JSON.stringify(T.toneFor('5')),'[770,1336]','숫자판은 두 음 신호');
const before=T.beepCount();assert.equal(A.press('0'),true);assert.equal(A.press('1'),true);assert.equal(T.beepCount(),before+2);assert.equal(JSON.stringify(T.beeps().slice(-2).map(b=>b.freqs)),'[[941,1336],[697,1209]]');
assert.equal(L().dial,'01','숫자 입력');assert.equal(A.press('clr'),true);assert.equal(L().dial,'0','취소로 지움');A.press('end');assert.equal(L().dial,'','종료로 비움');

/* 9. 닫기, 닫혔을 때 숫자판 막힘 */
assert.equal(A.slide(false),true);const t1=now;for(const dt of [0,100,200,260]){now=t1+dt;T.step(now)}
assert.equal(A.state.pos,G.slide);assert.equal(A.state.open,false);assert.equal(A.press('7'),false,'닫히면 숫자판 막힘');assert.equal(L().dial,'');assert.equal(A.press('menu'),true,'닫혀도 상판 버튼은 됨');
A.press('end');

/* 10. 키보드: 간편모드는 숫자만, 전체화면은 모두 */
const cap=winListeners.find(l=>l.t==='keydown'&&l.cap).f;
const key=(code,k,extra={})=>{const e={code,key:k||'',target:doc.body,repeat:false,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},stopImmediatePropagation(){this.stopped=true},...extra};cap(e);if(code==='Escape')winListeners.find(l=>l.t==='keyup'&&l.cap)?.f(e);return e};
A.slide(true);now+=300;T.step(now);
let e=key('ArrowRight','ArrowRight');assert.equal(e.prevented,false,'간편모드: 방향키는 게임으로 (걸으면서 켜 두기)');
e=key('Digit5','5');assert.equal(e.stopped,true);assert.equal(L().dial,'5','간편모드: 숫자는 휴대폰으로');
e=key('Digit5','5',{target:{tagName:'INPUT'}});assert.equal(e.stopped,false,'채팅 칸에서는 건드리지 않음');
w.SHOPS={isOpen:true};e=key('Digit6','6');assert.equal(e.stopped,false,'가게 창이 열려 있으면 숫자는 가게로');w.SHOPS={isOpen:false};
key('Escape','Escape');assert.equal(L().dial,'5','간편모드: Esc 는 게임 몫');
A.setMode('full');assert.equal(A.state.mode,'full');assert.ok(root.className.includes('ac-full'));
e=key('Escape','Escape');assert.equal(e.stopped,true);assert.equal(L().dial,'','전체화면: Esc = 종료 버튼');
key('KeyM','m');assert.equal(L().screen,'menu','M = 매뉴');e=key('ArrowRight','ArrowRight');assert.equal(e.stopped,true,'전체화면: 방향키는 휴대폰');assert.equal(L().state.sel,1);
key('Escape','Escape');key('Space',' ');now+=300;T.step(now);assert.equal(A.state.pos,G.slide,'Space = 슬라이드');key('Space',' ');now+=300;T.step(now);assert.equal(A.state.open,true);
key('KeyN','n');assert.equal(A.state.shown,false,'N = 넣기');A.show('full');assert.equal(A.state.shown,true);

/* 11. 테두리 두 번 누르기, 몸통 누르기, 아래 선택 막대 */
const canvas=T.canvas;canvas.style.width=A.state.cssW+'px';canvas.style.height=A.state.cssH+'px';
const px=(nx,ny)=>({clientX:(nx-G.stage.x)*A.state.cssW/G.stage.w,clientY:(ny-G.stage.y)*A.state.cssH/G.stage.h});
const tap=(nx,ny)=>{canvas.emit('pointerdown',px(nx,ny));canvas.emit('pointerup',px(nx,ny))};
tap(125,700);now+=150;tap(125,700);assert.equal(A.state.mode,'mini','전체화면에서 테두리 두 번 → 간편모드');
tap(125,700);now+=600;tap(125,700);assert.equal(A.state.mode,'mini','너무 느리면 두 번 누름 아님');now+=600;
tap(125,700);now+=150;tap(125,700);assert.equal(A.state.mode,'full','간편모드에서 테두리 두 번 → 전체화면');
tap(440,460);assert.equal(A.state.sliding,true,'몸통(액정) 한 번 → 슬라이드');now+=300;T.step(now);assert.equal(A.state.pos,G.slide);
tap(440,460+G.slide);now+=300;T.step(now);assert.equal(A.state.open,true);
const bar=root.children[1].children.find(n=>n.className==='ac-bar'),seg=bar.children[0];seg.children[0].click();assert.equal(A.state.mode,'mini','선택 막대: 간편모드');seg.children[1].click();assert.equal(A.state.mode,'full','선택 막대: 전체화면');
seg.children[0].click();const h0=A.state.cssH;bar.children[2].click();assert.equal(A.state.cssH,Math.min(h0+60,700),'크게');bar.children[1].click();bar.children[1].click();assert.equal(A.state.cssH,h0-60,'작게');
for(let i=0;i<20;i++)bar.children[1].click();assert.equal(A.state.cssH,250,'너무 작아지지 않음');
/* 간편모드 끌어 옮기기 */
const x0=A.state.x;canvas.emit('pointerdown',px(125,700));canvas.emit('pointermove',{clientX:px(125,700).clientX-120,clientY:px(125,700).clientY});canvas.emit('pointerup',{clientX:0,clientY:0});
assert.ok(A.state.x<x0,'테두리를 끌면 자리 이동');assert.equal(A.state.open,true,'끌었을 때는 슬라이드 그대로');
assert.ok(JSON.parse(memory.get('2006_anycall_ui_v1')).h===250,'크기 저장');

/* 12. 액정: 전화번호부 → 전화 → 통화 → 통화 기록 */
const press=(...ids)=>{for(const id of ids){assert.equal(A.press(id),true,'누름 '+id);now+=30;T.step(now)}};
const run=ms=>{const end=now+ms;while(now<end){now+=50;L().needs(now)}};
press('menu');assert.equal(L().screen,'menu');press('1');assert.equal(L().screen,'contacts');
press('send');assert.equal(L().screen,'call');run(2600);assert.equal(L().state.call.phase,'talk','엄마가 받음');run(4000);assert.ok(L().state.call.lines.length>=2);
press('end');run(1500);assert.equal(L().screen,'idle');assert.equal(L().data.calls[0].n,'엄마');assert.equal(L().data.calls[0].t,'out');
for(const d of '0193')press(d);press('send');run(3000);assert.ok(/없는 번호|다시 걸어/.test(L().state.call.result.msg),'없는 번호 안내');press('end');run(1500);
for(const d of '119')press(d);press('send');assert.ok(L().state.call.result.msg.includes('장난'),'긴급 번호는 걸리지 않음');press('end');run(1500);
press('send');assert.equal(L().screen,'calls','통화 버튼만 누르면 통화 기록');press('end');

/* 13. 문자: 상용구로 보내고 답장 받기 */
press('menu','2','2');assert.equal(L().screen,'compose');press('1');assert.equal(L().state.step,1,'받는 사람: 엄마');press('nate','down','ok');assert.equal(L().editor.text(),'PC방 ㄱㄱ?','상용구 넣기');press('ok');assert.equal(L().screen,'sending');
run(2000);assert.equal(L().data.sent[0].text,'PC방 ㄱㄱ?');assert.equal(L().data.sent[0].to,'엄마');
const tm=timers.at(-1);assert.ok(tm.ms>=2600&&tm.ms<=4400,'답장은 조금 뒤에');tm.f();
assert.equal(L().data.inbox[0].from,'엄마');assert.equal(L().data.inbox[0].text,'PC방 그만하고 6시까지 들어와!!','폰꾸미기 천국의 엄마 답장 규칙');assert.equal(ids.phoneLabel.textContent,'새 문자 3');
press('end','ok');assert.equal(L().screen,'inbox','확인 = 문자함');press('ok');assert.equal(L().screen,'read');assert.equal(L().data.inbox[0].read,true);assert.equal(ids.phoneLabel.textContent,'새 문자 2');press('end');
assert.ok(JSON.parse(memory.get('2006_anycall_data_v1')).sent.length===1,'문자 저장');

/* 14. 벨소리, 배경 화면, 설정 */
press('menu','9');assert.equal(L().screen,'ring');press('down','ok');assert.notEqual(L().data.ring,'r4','벨소리 바꿈');press('end');
press('menu','0','right','ok');assert.equal(L().data.wall,L().walls()[1][0],'배경 화면 바꿈 (A100부터 처음에는 세 가지, 나머지는 NATE에서 받기)');press('end');
press('menu','left','ok');assert.equal(L().screen,'set');press('down','ok');assert.equal(A.state.keyTone,false,'키음 끄기');const bc=T.beepCount();press('clr');assert.equal(T.beepCount(),bc,'키음 꺼짐');press('ok');assert.equal(L().screen,'set');press('down','ok');assert.equal(A.state.keyTone,true,'키음 다시 켜기');press('end');

/* 15. 게임: 두더지 잡기와 지렁이 */
press('menu','8','1');assert.equal(L().screen,'mole');const M=L().state.g;M.holes[4]=now+5000;press('5');assert.equal(M.score,1,'숫자 5로 가운데 두더지');M.holes[0]=now+5000;press('up','left');assert.equal(M.cur,0);press('nate');assert.equal(M.score,2,'방향과 NATE로도 잡기');
run(31000);assert.equal(M.over,true);assert.ok(L().data.best.mole>=2,'최고 점수 저장');press('clr','down','ok');assert.equal(L().screen,'snake');
const Sn=L().state.g;press('down');run(300);assert.equal(Sn.dir.y,1,'아래로 꺾기');press('up');run(300);assert.equal(Sn.dir.y,1,'바로 뒤로는 못 감');
run(5000);assert.equal(Sn.over,true,'벽에 부딪히면 끝');press('end');

/* 16. NATE, 내 위치, 새 기능 붙이기 */
press('nate');assert.equal(L().screen,'nate');run(1500);assert.equal(L().nate.state.cur.id,'home','A100: NATE 무선 인터넷 첫 화면');press('4');run(1500);press('1');run(1500);assert.equal(L().nate.state.cur.id,'weather');assert.ok(L().nate.state.cur.text.includes('맑음'),'게임 날씨');press('end');
press('down');run(1700);assert.equal(L().screen,'find','아래(GPS) = 친구 찾기');press('end');
const n0=w.AnycallLCD.apps.length;w.AnycallLCD.registerApp({id:'todo',name:'할 일',icon:'app',draw(){},key(){}});assert.equal(w.AnycallLCD.apps.length,n0+1,'메뉴에 새 기능 붙이기');
assert.throws(()=>w.AnycallLCD.registerApp({id:'x'}));

/* 17. 가방 카드 */
const card=A.bagCard();assert.ok(card.className.includes('item-card'));assert.ok(card.children[1].children[0].textContent.includes('애니콜'));
let took=0;const det=A.bagDetail(()=>took++);det.children.at(-1).click();assert.equal(took,1,'가방에서 꺼내기');
A.hide();assert.equal(root.hidden,true);
console.log('PASS test_anycall_a98');
