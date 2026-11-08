'use strict';
/* A90: PC방 컴퓨터의 2006년 기믹(알림 풍선, 우클릭 메뉴, 휴지통, 화면 등록 정보, 작업 관리자, 블루스크린, 사장님 호출,
   지뢰 찾기, 그림판, 타자 연습, 계산기, 버디버디, 바이러스 도우미, 마당공유, 팝업 광고)를 한꺼번에 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);let fetches=0,logouts=0;
const fast=(fn,ms)=>setTimeout(fn,Math.min(ms||0,15));
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{fetches++;throw Error('external browsing forbidden')},setTimeout:fast,clearTimeout,setInterval,clearInterval};w.window=w;
const src=f=>fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8');
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','web-data','web-ghost','web-flash','web-sites','xp-desktop'])vm.runInNewContext(src(f),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x},has=(s,n=root)=>all(n).some(x=>x.textContent&&x.textContent.includes(s)&&x.children.length===0);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const json=x=>JSON.stringify(x);

(async()=>{
/* 1. 규칙 계산: 지뢰 찾기 */
const A=w.XPApps;
const g=A.createGame(9,9,10,7);g.reveal(40);assert.equal(g.state,'play');assert.equal(g.cells.filter(c=>c.mine).length,10,'지뢰 개수');assert.ok(!g.cells[40].mine,'첫 칸은 안전');for(const j of g.near(40))assert.ok(!g.cells[j].mine,'첫 칸 주변도 안전');
const g2=A.createGame(9,9,10,7);g2.reveal(40);assert.equal(json(g.cells.map(c=>c.mine)),json(g2.cells.map(c=>c.mine)),'같은 씨앗이면 같은 판');
assert.ok(g.opened>=9,'빈 칸을 누르면 한꺼번에 열림');
const f0=g.cells.findIndex(c=>!c.open&&!c.mine);g.flag(f0);assert.equal(g.flags,1);assert.equal(g.left(),9);assert.equal(g.reveal(f0),false,'깃발 칸은 열리지 않음');g.flag(f0);assert.equal(g.flags,0);
for(let i=0;i<g.cells.length;i++)if(!g.cells[i].mine)g.reveal(i);assert.equal(g.state,'won');assert.equal(g.flags,10,'이기면 남은 지뢰에 깃발');assert.equal(g.left(),0);
const g3=A.createGame(9,9,10,3);g3.reveal(0);const mi=g3.cells.findIndex(c=>c.mine);g3.flag(g3.cells.findIndex((c,i)=>!c.mine&&!c.open&&i!==mi));g3.reveal(mi);assert.equal(g3.state,'lost');assert.equal(g3.boom,mi);assert.ok(g3.cells.some(c=>c.wrong),'틀린 깃발 표시');assert.equal(g3.reveal(1),false,'끝난 판은 더 못 엶');
const g4=A.createGame(5,5,3,11);g4.reveal(12);const num=g4.cells.findIndex(c=>c.open&&c.n>0);if(num>=0){const mines=g4.near(num).filter(j=>g4.cells[j].mine);for(const j of mines)g4.flag(j);if(mines.length===g4.cells[num].n){g4.chord(num);assert.ok(g4.near(num).every(j=>g4.cells[j].mine?g4.cells[j].flag:g4.cells[j].open||g4.state==='lost'),'숫자 누르기로 주변이 열림')}}
assert.equal(A.LEVELS.easy.mines,10);assert.equal(A.LEVELS.mid.rows*A.LEVELS.mid.cols,256);
/* 2. 그림판 계산 */
const img={width:4,height:3,data:new Uint8ClampedArray(4*3*4).fill(255)};for(const x of [2])for(let y=0;y<3;y++){const p=(y*4+x)*4;img.data[p]=0;img.data[p+1]=0;img.data[p+2]=0}
assert.equal(A.floodFill(img,0,0,[255,0,0,255]),6,'세로줄로 막힌 왼쪽만 채움');assert.equal(img.data[(0*4+3)*4+1],255,'오른쪽은 그대로');assert.equal(A.floodFill(img,0,0,[255,0,0,255]),0,'같은 색은 채우지 않음');assert.equal(A.floodFill(img,9,9,[1,2,3,255]),0);
const lp=A.linePoints(0,0,5,2);assert.equal(json(lp[0]),'[0,0]');assert.equal(json(lp.at(-1)),'[5,2]');assert.equal(A.linePoints(3,3,3,3).length,1);assert.equal(json(A.hexRgba('#ff8040')),'[255,128,64,255]');assert.equal(A.PALETTE.length,28);
/* 3. 타자 연습 계산 */
assert.equal(A.strokes('가'),2);assert.equal(A.strokes('각'),3);assert.equal(A.strokes('값'),4);assert.equal(A.strokes('과'),3);assert.equal(A.strokes('왜'),3);assert.equal(A.strokes('ㅋㅋ'),2);assert.equal(A.strokes('A'),2);assert.equal(A.strokes('꽃'),4,'쌍자음은 두 번');assert.equal(A.strokes(' '),1);
assert.equal(A.lev('kitten','sitting'),3);assert.equal(A.lev('','abc'),3);assert.equal(A.lev('같음','같음'),0);
const perfect=A.SENTENCES.slice(0,5).map(t=>({target:t,typed:t,ms:6000}));const sp=A.summarize(perfect);assert.equal(sp.acc,100);assert.ok(sp.cpm>0&&sp.cpm<=1200);assert.ok(['병아리 타자','초보 타자','중급 타자','고수 타자','타자 왕'].includes(sp.grade));
const sloppy=A.summarize(A.SENTENCES.slice(0,5).map(t=>({target:t,typed:t.slice(0,-3)+'ㅋㅋㅋ',ms:6000})));assert.ok(sloppy.acc<100&&sloppy.cpm<sp.cpm,'틀리면 정확도와 타수가 내려감');
assert.equal(A.summarize(A.SENTENCES.slice(0,1).map(t=>({target:t,typed:t,ms:1}))).cpm,1200,'타수 상한');
assert.equal(A.gradeOf(10),'병아리 타자');assert.equal(A.gradeOf(160),'초보 타자');assert.equal(A.gradeOf(999),'타자 왕');assert.ok(A.SENTENCES.length>=15);
/* 4. 계산기 */
const press=(keys)=>{const c=A.calcNew();for(const k of keys)A.calcPress(c,k);return c};
assert.equal(press(['1','2','+','3','=']).disp,'15');assert.equal(press(['0','.','1','+','0','.','2','=']).disp,'0.3');assert.equal(press(['5','/','0','=']).disp,'0으로 나눌 수 없습니다');assert.equal(press(['9','sqrt']).disp,'3');assert.equal(press(['neg','sqrt']).disp,'0','0의 제곱근은 0');
assert.equal(press(['4','neg','sqrt']).disp,'잘못된 입력입니다');assert.equal(press(['2','0','0','+','1','0','pct','=']).disp,'220');assert.equal(press(['2','+','3','=','=']).disp,'8','=을 또 누르면 반복');assert.equal(press(['8','inv']).disp,'0.125');
assert.equal(press(['1','2','3','back','back']).disp,'1');assert.equal(press(['1','2','ce']).disp,'0');assert.equal(press(['7','ms','c','mr']).disp,'7','C를 눌러도 메모리는 남음');assert.equal(press(['5','m+','5','m+','mr']).disp,'10');assert.equal(press(['5','ms','mc','mr']).disp,'0');
assert.equal(press(['1','+','2','*','3','=']).disp,'9','왼쪽부터 차례로 계산');assert.equal(press(['5','neg']).disp,'-5');assert.equal(press(['.','5']).disp,'0.5');assert.equal(press(['1','/','3','=']).disp,'0.333333333333');
const err=press(['1','/','0','=']);A.calcPress(err,'5');assert.equal(err.disp,'0으로 나눌 수 없습니다','오류 뒤에는 C를 눌러야 함');A.calcPress(err,'c');assert.equal(err.disp,'0');
assert.equal(press(Array(30).fill('9')).disp.length,16,'자릿수 제한');

/* 5. 바탕화면에 붙었는지 */
let api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){logouts++}});
const mods=api.modules;assert.ok(mods.shell&&mods.apps&&mods.msn&&mods.net,'네 모듈이 모두 붙음');
assert.equal(cls('xp79-shortcut').length,28);assert.ok(find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.includes('버디버디')),'메신저 바탕화면 아이콘');assert.ok(!find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.includes('바탕화면 부수기')),'바탕화면 부수기는 처음에 깔려 있지 않음');
const desk=find(n=>n.classList.contains('xp79-desktop')),SH=mods.shell;
const startTexts=cls('xp79-start-menu').flatMap(m=>m.children.map(c=>c.textContent));for(const t of ['모든 프로그램 ▶','컴퓨터 끄기...','로그오프'])assert.ok(startTexts.includes(t),'시작 메뉴 '+t);
for(const t of ['그림판','계산기','타자 연습','작업 관리자','지뢰찾기','Internet Explorer','버디버디','마당공유','바이러스 도우미','화면 등록 정보','네트워크 상태'])assert.ok(has(t),'모든 프로그램 '+t);
/* 6. 알림 풍선, 대화 상자, 메뉴 */
for(let i=0;i<5;i++)SH.toast({title:'풍선'+i,text:'본문',ms:0});assert.equal(SH.toasts().length,3,'풍선은 동시에 3개까지');
const clicked=[];SH.toast({title:'눌러 보기',text:'x',ms:0,onClick:()=>clicked.push(1)});cls('xp-toast').at(-1).emit('click',{target:cls('xp-toast').at(-1)});assert.equal(clicked.length,1,'풍선을 누르면 동작');
let dlgDone=0;const dlg=SH.dialog({title:'확인',text:'테스트',buttons:[['예',()=>dlgDone++],['아니요']]});assert.equal(cls('xp-modal').length,1);button('예').click();assert.equal(dlgDone,1);assert.equal(cls('xp-modal').length,0);
SH.dialog({title:'취소 시험',text:'x',buttons:[['확인']]});assert.equal(SH.state().modals,1);assert.equal(mods.shell.onKey('Escape',{preventDefault(){}}),true,'ESC로 대화 상자 닫기');assert.equal(SH.state().modals,0);
desk.emit('contextmenu',{target:desk,clientX:300,clientY:300});assert.equal(SH.state().menu,true);for(const t of ['새로 고침(E)','새로 만들기(W)  ▶','폴더(F)','텍스트 문서','화면 등록 정보(R)'])assert.ok(has(t),'우클릭 메뉴 '+t);
assert.equal(SH.onKey('Escape',{preventDefault(){}}),true);assert.equal(SH.state().menu,false,'ESC로 메뉴 닫기');
/* 7. 새 폴더, 이름 바꾸기, 휴지통 */
desk.emit('contextmenu',{target:desk,clientX:100,clientY:100});button('폴더(F)').click();assert.equal(json(SH.state().items),json(['새 폴더']),'새 폴더');
const ren=find(n=>n.classList.contains('xp-rename'));ren.value='사진 백업';button('확인').click();assert.equal(json(SH.state().items),json(['사진 백업']),'이름 바꾸기');
SH.addItem('text');button('취소').click();assert.equal(SH.state().items.length,2);assert.ok(SH.state().items[1].endsWith('.txt'));
SH.addItem('text');button('취소').click();assert.notEqual(SH.state().items[1],SH.state().items[2],'같은 이름은 번호가 붙음');
const saved1=JSON.parse(memory.get('2006_xp_desktop_v1'));assert.equal(saved1.xp.items.length,3,'바탕화면 항목이 저장됨');
const userNodes=cls('xp-useritem');assert.equal(userNodes.length,3);userNodes[0].emit('contextmenu',{target:userNodes[0],clientX:50,clientY:50});button('삭제').click();assert.equal(SH.state().items.length,2);assert.equal(json(SH.state().trash),json(['사진 백업']),'삭제하면 휴지통으로');
api.openApp('trash');assert.ok(has('사진 백업'));button('복원').click();assert.equal(SH.state().trash.length,0);assert.equal(SH.state().items.length,3,'복원');
while(SH.state().items.length<12)SH.addItem('folder'),button('취소').click();SH.addItem('folder');assert.equal(SH.state().items.length,12,'12개까지');assert.ok(SH.toasts().some(t=>t.includes('12개까지')));
/* 8. 화면 등록 정보와 화면 보호기 */
api.openApp('display');button('파란 바탕').click();button('적용(A)').click();assert.equal(SH.state().wallpaper,'blue');assert.equal(desk.style.background,'#3a6ea5');
button('화면 보호기').click();button('거품').click();button('10분').click();button('확인').click();assert.equal(SH.state().saver,'bubbles');assert.equal(SH.state().saverMin,10);
const savedWall=JSON.parse(memory.get('2006_xp_desktop_v1')).xp;assert.equal(savedWall.wallpaper,'blue');assert.equal(savedWall.saver,'bubbles');
SH.startSaver('stars',true);assert.equal(SH.state().saverOn,true);assert.equal(SH.onKey('KeyA',{preventDefault(){}}),true,'아무 키나 누르면 화면 보호기 끝');assert.equal(SH.state().saverOn,false);
assert.equal(SH.startSaver('none'),false);
/* 9. 시계, 시간 알림, 달력 */
assert.equal(SH.state().clock,'오후 4:32');api.updateTime(3600-120);assert.equal(find(n=>n.classList.contains('xp79-clock')).textContent,'오후 4:34','시계가 흐름');
api.openApp('calendar');assert.ok(has('2006년 5월'));assert.ok(cls('today').some(n=>n.textContent==='30'),'5월 30일 표시');
api.updateTime(3600-160);assert.ok(SH.log().some(t=>t.includes('자동 업데이트')),'자동 업데이트 알림');api.updateTime(600);assert.ok(SH.log().some(t=>t.includes('10분')),'남은 시간 10분 알림');api.updateTime(300);assert.ok(SH.log().some(t=>t.includes('5분')),'남은 시간 5분 알림');
/* 10. 작업 관리자, 블루스크린, 다시 시작 */
api.openApp('taskmgr');button('프로세스').click();let procs=SH.processes();assert.ok(procs.some(p=>p.name==='explorer.exe')&&procs.some(p=>p.name==='winlogon.exe'));api.openApp('minesweeper');assert.ok(SH.processes().some(p=>p.name==='winmine.exe'),'열린 프로그램이 프로세스에 보임');
mods.net.infect();assert.ok(SH.processes().some(p=>p.name==='svch0st.exe'&&p.bad),'감염되면 수상한 프로세스');SH.endProcess(SH.processes().find(p=>p.kind==='virus'),()=>{});assert.equal(mods.net.state().infected,false,'프로세스 끝내기로 일단 멈춤');
SH.endProcess(procs.find(p=>p.name==='winlogon.exe'),()=>{});assert.equal(cls('xp-modal').length,1,'핵심 프로세스는 경고');button('아니요').click();assert.equal(SH.state().bsod,false);
SH.endProcess(procs.find(p=>p.name==='winlogon.exe'),()=>{});button('예').click();assert.equal(SH.state().bsod,true,'블루스크린');assert.ok(has('STOP: 0x000000F4'));
SH.onKey('KeyA',{preventDefault(){}});assert.equal(api.state.booting,true,'아무 키나 누르면 다시 시작');assert.equal(api.state.windowCount,0,'다시 시작하면 열린 창이 모두 닫힘');assert.equal(SH.state().bsod,false);
assert.equal(JSON.parse(memory.get('2006_xp_desktop_v1')).xp.items.length,12,'다시 시작해도 바탕화면 항목은 남음');
api.destroy();api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){logouts++}});const SH2=api.modules.shell;assert.equal(SH2.state().wallpaper,'blue','저장된 배경을 다시 불러옴');assert.equal(SH2.state().items.length,12,'저장된 항목을 다시 불러옴');
/* 11. 사장님 호출과 음식 주문은 이 시절에 없었으므로 아예 없어야 함 (A91) */
assert.equal(api.modules.shell.state().orders,undefined,'주문 상태가 없음');assert.equal(typeof api.modules.shell.call,'undefined','사장님 호출 함수가 없음');assert.ok(!all().some(n=>/사장님 호출|음식 주문/.test(n.textContent||'')),'화면 어디에도 사장님 호출이 없음');
/* 12. 컴퓨터 끄기 */
api.modules.shell.shutdownDialog();for(const t of ['대기 모드','끄기','다시 시작'])button(t);button('대기 모드').click();assert.equal(api.modules.shell.state().standby,true);api.modules.shell.onKey('KeyA',{preventDefault(){}});assert.equal(api.modules.shell.state().standby,false);
api.modules.shell.shutdownDialog();button('끄기').click();await wait(60);assert.equal(logouts,1,'끄기를 누르면 자리에서 일어남');

/* 13. 지뢰 찾기 창 */
api.openApp('minesweeper');assert.equal(cls('xp-ms-cell').length,81);const ap=api.modules.apps;const cells=cls('xp-ms-cell');cells[40].click();assert.equal(ap.mines.state().state,'play');cells[0].emit('contextmenu',{target:cells[0]});api.updateTime(3599);api.updateTime(3598);assert.ok(ap.mines.state().secs>=2,'시간이 흐름');
button('중급').click();assert.equal(cls('xp-ms-cell').length,256);button('초급').click();assert.equal(cls('xp-ms-cell').length,81);
const mg=ap.mines.game();mg.reveal(0);cls('xp-ms-cell')[0].click();for(let i=0;i<81;i++){const gm=ap.mines.game();if(!gm.cells[i].mine)cls('xp-ms-cell')[i].click()}assert.equal(ap.mines.state().state,'won');assert.ok(JSON.parse(memory.get('2006_xp_desktop_v1')).xp.bestMine.easy>=1,'최고 기록 저장');
assert.equal(find(n=>n.classList.contains('xp-ms-face')).textContent,'B)');
/* 14. 계산기 창과 타자 연습 창, 그림판 창 */
api.openApp('calc');for(const k of ['7','*','6','=']){const key=cls('xp-calc-key').find(n=>n.textContent===k);key.click()}assert.equal(find(n=>n.classList.contains('xp-calc-screen')).textContent,'42');
api.openApp('typing');button('시작하기').click();assert.equal(ap.typing.state().phase,'play');for(let i=0;i<5;i++){const inp=find(n=>n.classList.contains('xp-ty-input')),t=find(n=>n.classList.contains('xp-ty-target')).textContent;inp.value=t;inp.emit('input');ap.typing.submit()}assert.equal(ap.typing.state().phase,'done');assert.equal(ap.typing.state().last.acc,100);assert.ok(has('연습 결과'));
api.openApp('paint');assert.equal(ap.paint.state().tool,'pencil');button('붓').click();assert.equal(ap.paint.state().tool,'brush');cls('xp-pt-color')[16].click();assert.equal(ap.paint.state().fg,'#ff0000');cls('xp-pt-color')[1].emit('contextmenu',{target:cls('xp-pt-color')[1]});assert.equal(ap.paint.state().bg,'#808080');button('10px').click();assert.equal(ap.paint.state().size,10);assert.equal(ap.paint.state().canvas,true);
/* 15. 메신저 */
const M=api.modules.msn;api.openApp('messenger');assert.ok(has('버디버디에 로그인하는 중'));await wait(60);assert.ok(cls('xp-msn-buddy').length>=8,'친구 목록');
const st0=M.state();assert.equal(st0.buddies.find(b=>b.id==='sonagi').online,true);assert.equal(st0.buddies.find(b=>b.id==='dosa').online,false);
api.updateTime(3600-150-1);api.updateTime(3600-151);
assert.ok(M.state().buddies.find(b=>b.id==='byeol').online,'150초에 별빛요정이 접속');
api.updateTime(1);
const base=3600;api.updateTime(base-250);assert.ok(M.state().buddies.find(b=>b.id==='dosa').online);api.updateTime(base-340);assert.ok(M.state().buddies.find(b=>b.id==='dosa').log>=1,'컴퓨터도사가 먼저 말을 걺');
M.openChat('sonagi');const chatInput=find(n=>n.classList.contains('xp-chat-input'));chatInput.value='안녕';const form=chatInput.parentNode;form.emit('submit');await wait(80);assert.ok(M.state().buddies.find(b=>b.id==='sonagi').log>=3,'답장이 옴');assert.ok(find(n=>n.classList.contains('xp-chat-log')).textContent.includes('방가방가')||find(n=>n.classList.contains('xp-chat-log')).textContent.includes('ㅎㅇ')||find(n=>n.classList.contains('xp-chat-log')).textContent.includes('접속했네'),'첫 인사 답장');
M.nudge('sonagi');assert.ok(cls('xp-shake').length>=1,'흔들기');await wait(80);
const R=w.XPMessenger;const dosa=R.BUDDIES.find(b=>b.id==='dosa');assert.ok(R.replyFor(dosa,'바이러스 걸린 것 같아',0).includes('백신'));assert.ok(R.replyFor(dosa,'컴퓨터가 느려요',0).includes('작업 관리자'));assert.ok(R.replyFor(dosa,'팝업이 계속 떠요',1).includes('팝업 차단'));
button('흔들기');M.send('arcade','여보세요');assert.ok(find(n=>n.classList.contains('xp-chat-log'))!==undefined);
const offId=R.BUDDIES.find(b=>b.id==='arcade');assert.equal(offId.loginAt,null);
/* 상태와 대화명 */
api.openApp('messenger');button('대화명 변경').click();const nickIn=find(n=>n.classList.contains('xp-rename'));nickIn.value='♥동네 최강♥';button('확인').click();assert.equal(M.state().nick,'♥동네 최강♥');
const before=M.state().status;find(n=>n.tagName==='BUTTON'&&n.textContent.startsWith('상태:')).click();assert.notEqual(M.state().status,before);
/* 16. 인터넷 창 덧붙임과 마당공유 */
const N=api.modules.net;api.openApp('browser');assert.ok(cls('xp-ie-pb').length===1,'팝업 차단 단추');
for(const t of ['knowledge','cafe']){api.navigate({type:t,portal:'naver'})}assert.equal(N.state().notice,'activex','세 번째 이동에서 노란 설치 알림줄');assert.ok(cls('xp-ie-bar').length===1);
cls('xp-ie-bar')[0].click();assert.ok(has('이 소프트웨어를 설치하시겠습니까?'));button('설치 안 함(D)').click();assert.equal(N.state().notice,'');assert.equal(N.state().bars,0);
for(let i=0;i<3;i++)api.navigate({type:'home',portal:'naver'});assert.ok(N.state().popups>=1,'네 번째 이동에서 팝업 광고');
const adBtn=cls('xp-ad-btn')[0];adBtn.click();assert.ok(has('사실이 아닙니다')||has('거짓')||has('속아')||has('요금')||has('똑같이')||has('가짜'),'광고를 눌러도 안내만 나옴');
for(const c of cls('xp-dialog-btn'))if(c.textContent==='닫기'){c.click();break}
const nBefore=N.state().popups;cls('xp-ad-close')[0].click();assert.equal(N.state().popups,nBefore-1,'팝업을 닫으면 없어짐');
N.popup(true);N.popup(true);N.popup(true);N.popup(true);assert.ok(N.state().popups<=3,'팝업은 동시에 3개까지');for(const k of [...api.state.windowCount?[]:[]]);
cls('xp-ie-pb')[0].click();assert.equal(N.state().popupBlock,true);const pu=N.state().popups;N.popup(false);assert.equal(N.state().popups,pu,'팝업 차단을 켜면 막힘');assert.equal(N.state().blocked,1);assert.ok(N.state().notice==='popup'||N.state().notice==='activex');
cls('xp-ie-pb')[0].click();assert.equal(N.state().popupBlock,false);
/* 마당공유와 감염 */
api.openApp('p2p');assert.ok(cls('xp-p2p-row').length>=11);assert.equal(N.state().realtime,true);N.download('f6');N.download('f1');assert.ok(N.state().files[5].startsWith('down'));for(let i=0;i<40;i++)api.updateTime(900-i);assert.equal(N.state().files[5].split(':')[0],'blocked','실시간 감시가 켜져 있으면 차단');assert.equal(N.state().files[0].split(':')[0],'done');assert.equal(N.state().infected,false);
N.download('f2');N.download('f3');N.download('f4');assert.equal(N.download('f5'),false,'동시에 3개까지');for(let i=0;i<60;i++)api.updateTime(850-i);
api.openApp('antivirus');button('실시간 감시: 켬').click();assert.equal(N.state().realtime,false);N.download('f7');for(let i=0;i<50;i++)api.updateTime(800-i);assert.equal(N.state().infected,true,'실시간 감시가 꺼져 있으면 감염');assert.ok(find(n=>n.classList.contains('xp-tray-btn')&&n.classList.contains('bad')),'트레이 백신 아이콘이 붉게');
button('검사 시작').click();assert.equal(N.state().av,'scan');for(let i=0;i<12;i++)api.updateTime(700-i);assert.equal(N.state().infected,false,'검사하면 치료');assert.ok(has('치료했습니다'));
/* 설치한 도구 모음 치료 */
N.infect();const barsBefore=N.state().bars;api.modules.shell.endProcess({kind:'bar',name:'x',mem:1},()=>{});
/* 17. 글과 소스에 금지어와 대시가 없는지 */
const BAD=[String.fromCharCode(0x2014),'게임 속','재구성','스마트폰','트위터','페이스북','카카오톡','유튜브','인스타','넷플릭스','코로나','실화냐','개이득','레전드','인싸','팩폭','꿀잼','노잼','기레기','지못미','갓생','국룰','AI'];
const blob=[w.XPMessenger.BUDDIES.map(b=>[b.nick,b.msg,...b.greet,...b.generic,...b.rules.flatMap(r=>r[1])].join('\n')).join('\n'),w.XPMessenger.EVENTS.map(e=>e.text||'').join('\n'),w.XPNet.ADS.map(a=>[a.title,a.big,a.text,a.btn,a.fake].join(' ')).join('\n'),w.XPNet.FILES.map(f=>f.name+f.note).join('\n'),w.XPApps.SENTENCES.join('\n')].join('\n');
for(const bad of BAD)assert.ok(!blob.includes(bad),'금지어 '+bad);
for(const f of ['src/xp-shell.js','src/xp-apps.js','src/xp-messenger.js','src/xp-net.js','assets/pc-desktop/xp-extras.css','tests/test_xp_extras_a90.cjs'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes(String.fromCharCode(0x2014)),f+' 에 줄표');
assert.ok(!/01\d-?\d{3,4}-?\d{4}|@[a-z]+\.[a-z]/i.test(blob),'전화번호나 이메일 모양이 없음');
assert.equal(fetches,0,'외부 접속 없음');
/* 17b. 망가진 저장 값이 들어와도 안전한지 */
api.destroy();memory.set('2006_xp_desktop_v1',JSON.stringify({xp:{items:[{id:1,kind:'folder',name:'x'},{id:'a',kind:'evil',name:'y'},{id:'b',kind:'text',name:'<b>굵게</b>',text:'t'.repeat(5000)}],trash:'no',wallpaper:'javascript:alert(1)',saver:'zzz',saverMin:99,bars:99,paint:'url(javascript:alert(1))',orders:[{total:'abc'}],bestMine:'x'}}));
const apiH=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600});const sh=apiH.modules.shell.state();assert.equal(sh.wallpaper,'bliss');assert.equal(sh.saver,'stars');assert.equal(sh.saverMin,5);assert.equal(json(sh.items),json(['<b>굵게</b>']),'망가진 항목은 걸러짐');assert.equal(apiH.modules.net.state().bars,3,'도구 모음 수 상한');assert.equal(typeof apiH.modules.apps.mines.state().level,'string');
const hs=w.XPShell.xs({saved:{xp:{paint:'data:image/png;base64,'+'A'.repeat(500000)}}});assert.equal(hs.paint,'','너무 큰 그림은 버림');assert.equal(w.XPShell.xs({saved:{xp:{paint:'data:image/png;base64,AAAAAAAAAAAAAAAAAAAAAAAA'}}}).paint.length>20,true,'정상 그림은 유지');apiH.destroy();
/* 18. 모듈이 없어도 바탕화면은 돌아감 */
const w2={...w,XPShell:undefined,XPApps:undefined,XPMessenger:undefined,XPNet:undefined,XPDesktop:undefined};w2.window=w2;const root2=new Node('main'),doc2=new Node('document');doc2.createElement=t=>new Node(t);w2.document=doc2;
for(const f of ['portal-news','portal-boards','portal-pages','xp-desktop'])vm.runInNewContext(src(f),w2);const api2=w2.XPDesktop.mount(root2,{boot:false,seat:3,remaining:600});assert.ok(api2);assert.equal(api2.modules.shell,undefined);api2.openApp('minesweeper');api2.openApp('trash');api2.updateTime(500);api2.destroy();
console.log('test_xp_extras_a90 ok');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
