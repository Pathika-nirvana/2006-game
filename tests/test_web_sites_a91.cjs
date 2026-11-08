'use strict';
/* A91: 여러 가지 홈페이지, 귀신 함정, 플래시 만화, 바탕화면 부수기 내려받기와 설치, 사장님 호출 제거를 검사한다. */
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

const sleep=wait;
const rx=(re,n=root)=>find(x=>x.tagName==='BUTTON'&&re.test(x.textContent),n);
const click=(re,n=root)=>{const b=rx(re,n);assert.ok(b,'버튼 '+re);b.click();return b};
const saved=()=>JSON.parse(memory.get('2006_xp_desktop_v1')||'{}');
(async()=>{
const WS=w.WebSites,WG=w.WebGhost,WF=w.WebFlash,WD=w.WebData,SU=w.XPSetup;
/* 1. 사이트 목록과 주소 */
assert.equal(WS.order.length,10,'사이트 열 곳');assert.equal(new Set(WS.order.map(i=>WS.domain(i))).size,10,'주소가 모두 다름');
for(const id of WS.order){assert.ok(id.startsWith('w-'));assert.equal(WS.resolveHost(WS.domain(id)),id,id+' 주소 찾기');assert.equal(WS.resolveHost('www.'+WS.domain(id).replace(/^www\./,'')),id)}
assert.equal(WS.resolveHost('nowhere.example'),null);
assert.equal(WS.route('w-sorum',new URL('http://www.sorum.co.kr/story?id=s1')).id,'s1');assert.equal(WS.route('w-sorum',new URL('http://www.sorum.co.kr/nothing')).type,'home','모르는 쪽은 처음으로');
assert.equal(WS.favorites(()=>{}).filter(x=>Array.isArray(x)).length,8,'추천 사이트 여덟 곳');
/* 2. 그림 그리기 계산 */
assert.equal(WG.KINDS.length,6,'귀신 얼굴 여섯 종류');
assert.equal(WF.SKITS.length,3);for(const s of WF.SKITS){assert.ok(s.subs[0][0]===0&&s.len>=10);for(const t of [0,s.len/2,s.len])s.draw(fakeCtx(),480,300,t)}
const gm=WF.createPoop(5);gm.move(5);assert.equal(gm.st.x,.94,'오른쪽 한계');gm.move(-5);assert.equal(gm.st.x,.06,'왼쪽 한계');for(let i=0;i<4000&&!gm.st.over;i++)gm.step(.016);assert.equal(gm.st.over,true,'가만히 있으면 맞음');const sc=gm.st.score;gm.step(1);assert.equal(gm.st.score,sc,'끝난 뒤에는 점수가 멈춤');
assert.equal(json(WF.createPoop(9).st.items),json(WF.createPoop(9).st.items));
/* 3. 바탕화면에 붙이고 모든 사이트의 모든 쪽 열기 */
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
assert.ok(api.modules.setup,'설치 모듈이 붙음');
assert.ok(!find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.includes('바탕화면 부수기')),'처음에는 바탕화면 부수기가 없음');
api.openApp('browser');
const pageCount=[];
for(const id of WS.order){const S=WS.sites[id];for(const type of S.types){api.navigate({type,portal:id,id:type==='story'?'s1':type==='item'?'smash':type==='play'?'ramen':type==='room'?'0':''});const pg=find(n=>n.classList.contains('web-site'));assert.ok(pg,id+' '+type+' 화면');assert.ok(pg.textContent.length>20,id+' '+type+' 글자가 있음');pageCount.push(id+'/'+type)}}
assert.ok(pageCount.length>=39,'열어 본 쪽 수 '+pageCount.length);
/* 4. 귀신 함정 */
api.navigate({type:'story',portal:'w-sorum',id:'s1'});assert.equal(WG.active(),null);
click(/마지막 줄 보기/);const ov=find(n=>n.classList.contains('ws-scare'));assert.ok(ov,'귀신 화면이 뜸');assert.equal(ov.attributes.role,'alertdialog');assert.ok(WG.active());
ov.emit('keydown',{code:'Escape'});assert.ok(WG.active(),'너무 빨리 누르면 닫히지 않음');
click(/마지막 줄 보기/);assert.equal(cls('ws-scare').length,1,'이미 떠 있으면 겹치지 않음');
await sleep(60);ov.emit('keydown',{code:'Enter'});assert.equal(WG.active(),null,'닫힘');assert.equal(cls('ws-scare').length,0);assert.ok(has('마지막 줄은 보지 않는 편이 좋았습니다.'),'닫은 뒤 글귀');
assert.equal(saved().web.scared,1,'놀란 횟수 저장');
api.navigate({type:'story',portal:'w-sorum',id:'s3'});api.navigate({type:'main',portal:'w-sorum'});await sleep(60);assert.equal(WG.active(),null,'쪽을 떠나면 시간 함정이 멈춤');
api.navigate({type:'curse',portal:'w-sorum'});
let guard=0;while(!WG.active()&&guard++<400)await sleep(20);assert.ok(WG.active(),'저주 편지 시간이 지나면 뜸');await sleep(60);find(n=>n.classList.contains('ws-scare')).emit('keydown',{code:'Space'});assert.equal(WG.active(),null);
assert.equal(api.state.windowCount>=4,true,'귀신 창이 세 개 뜸');assert.ok(api.modules.shell&&true);
WG.stop();
/* 5. 놀라게 하지 않는 쪽 */
api.navigate({type:'home',portal:'w-cute'});assert.equal(WG.active(),null,'귀여운 사진 첫 화면에서는 안 뜸');
/* 6. 글 남기기는 저장되고 길이가 제한됨 */
api.navigate({type:'guestbook',portal:'w-hompy'});{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('ws-form'));const [nick,txt]=f.children;nick.value='손님';txt.value='가'.repeat(300);f.emit('submit');assert.ok(saved().web.gb.hompy[0].length<=100,'방명록 길이 제한');assert.ok(has('['))}
/* 7. 채팅방 도배는 쫓겨남 */
api.navigate({type:'room',portal:'w-chat',id:'0'});{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('ch-form'));const inp=f.children[0];for(let i=0;i<3;i++){inp.value='도배';f.emit('submit')}let seen=false;for(let i=0;i<150;i++){if(has('도배로 강제퇴장'))seen=true;await sleep(2)}assert.ok(seen,'도배 퇴장 글');assert.ok(!find(n=>n.classList.contains('ch-title')),'퇴장 뒤 대화방에서 나감');assert.ok(has('대화방 목록'),'대화방 목록으로 돌아감')}
/* 8. 처음 깔려 있는 것이 없음: 자료실에서 내려받기 */
api.navigate({type:'item',portal:'w-jaryo',id:'smash'});assert.ok(has('아직 설치하지 않았습니다.'));
click(/다운로드/);for(let i=0;i<300&&!find(n=>n.classList.contains('xp-dlask'));i++)await sleep(20);assert.ok(find(n=>n.classList.contains('xp-dlask')),'저장 확인 창');
assert.equal(saved().xp?.setupFile??false,false,'아직 파일이 없음');
click(/^저장/);for(let i=0;i<500&&!api.modules.setup.state().setupFile;i++)await sleep(20);assert.equal(api.modules.setup.state().setupFile,true,'바탕화면에 설치 파일이 생김');
assert.ok(find(n=>n.classList.contains('xp-setupfile')&&n.textContent.includes('DeskBreaker_setup.exe')),'설치 파일 아이콘');assert.equal(api.modules.setup.state().smash,false);
await sleep(30);assert.equal(saved().xp.setupFile,true,'저장됨');
/* 9. 설치 마법사 */
const sf=find(n=>n.classList.contains('xp-setupfile'));sf.emit('dblclick');assert.ok(has('설치 마법사에 오신 것을 환영합니다.'));assert.equal(api.modules.setup.state().wizard,0);
click(/다음/);assert.equal(rx(/다음/).disabled,true,'동의 전에는 다음이 막힘');
const radios=cls('xp-wiz-radio');radios[0].children[0].emit('change');assert.equal(rx(/다음/).disabled,false);click(/다음/);assert.ok(has('설치 위치 선택'));
click(/^설치\(I\)|^설치/);for(let i=0;i<600&&!api.modules.setup.state().smash;i++)await sleep(20);assert.equal(api.modules.setup.state().smash,true,'설치가 끝남');
assert.ok(find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.trim()==='바탕화면 부수기'),'설치 뒤 바탕화면 아이콘');
assert.equal(saved().xp.smash,true);
click(/마침/);
api.destroy();
/* 10. 다시 켜도 설치가 남고, 지우면 사라짐 */
const api2=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
assert.ok(find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.trim()==='바탕화면 부수기'),'다시 켜도 설치가 남음');
assert.equal(api2.modules.setup.uninstall('smash')!==false,true);
for(let i=0;i<50;i++){const y=rx(/^예/);if(y){y.click();break}await sleep(10)}
await sleep(30);assert.equal(api2.modules.setup.state().smash,false,'제거됨');assert.ok(!find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.trim()==='바탕화면 부수기'),'제거 뒤 아이콘이 사라짐');assert.ok(find(n=>n.classList.contains('xp-setupfile')),'설치 파일은 남음');
/* 11. 사장님 호출은 어디에도 없음 */
const SRC=['xp-shell','xp-desktop','xp-apps','xp-messenger','xp-net','xp-setup','web-sites','web-data'].map(f=>src(f)).join('\n');
assert.ok(!/ordersWin|사장님 호출|음식 주문|order-row/.test(SRC),'사장님 호출과 주문 코드가 없음');
assert.equal(typeof w.XPShell.MENU,'undefined');
/* 12. 글과 소스 검사: 줄표, 시대에 맞지 않는 말, 개인정보를 받는 칸 */
const BAD=[String.fromCharCode(0x2014),'게임 속','재구성','스마트폰','트위터','페이스북','카카오톡','유튜브','인스타','넷플릭스','코로나','실화냐','개이득','레전드','인싸','팩폭','꿀잼','노잼','기레기','지못미','갓생','국룰'];
const files=['src/web-data.js','src/web-sites.js','src/web-ghost.js','src/web-flash.js','src/xp-setup.js','assets/pc-desktop/web-sites.css'];
for(const f of files){const t=fs.readFileSync(path.join(__dirname,'..',f),'utf8');for(const b of BAD)assert.ok(!t.includes(b),f+' 에 '+b)}
assert.ok(!fs.readFileSync(path.join(__dirname,'test_web_sites_a91.cjs'),'utf8').includes(String.fromCharCode(0x2014)),'시험 파일에 줄표');
const wsrc=fs.readFileSync(path.join(__dirname,'../src/web-sites.js'),'utf8');assert.ok(!/type\s*=\s*['"](password|email|tel|file)['"]/.test(wsrc),'비밀번호나 연락처를 받는 칸이 없음');assert.ok(!/fetch\(|XMLHttpRequest|window\.open|location\.href/.test(wsrc+src('web-ghost')+src('web-flash')+src('xp-setup')),'바깥으로 나가는 코드가 없음');
assert.ok(!/<img|new Image|\.mp3|\.ogg|\.wav|Audio\(/.test(src('web-flash')+wsrc),'플래시짱과 사이트 본문은 그림 파일과 소리 파일을 직접 쓰지 않음(귀신 그림과 소리는 web-ghost 한 곳에서만, A92)');
assert.equal(fetches,0,'외부 접속 없음');
api2.destroy();
console.log('PASS A91 web sites ('+pageCount.length+' pages), 6 ghost kinds, 3 skits, poop game, download and installer flow, boss call removed');
})().catch(e=>{console.error(e);process.exit(1)});
