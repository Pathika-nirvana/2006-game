'use strict';
/* A95: PC방에서 할 수 있는 것 늘리기. 온라인 게임 실행기와 작은 게임 열 가지, 미니홈피와 파도타기, 메일함(음식 주문은 A91 결정대로 넣지 않음),
   새 사이트 네 곳(펫, 경매, 말놀이, 사진관), 이름 궁합 획수 계산, 어린이 포털 보강(그림일기, 받아쓰기, 새 오락, 새 글), 시대 고증을 검사한다. */
const log=()=>{};
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):k==='measureText'?(s)=>({width:String(s).length*7}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(k,v){this[k]=v}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.dataset={};this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){if(typeof n==='string'){const t=new Node('#text');t._text=n;n=t}n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...nodes){for(const n of nodes){n.parentNode=this}this.children.unshift(...nodes)}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}getBoundingClientRect(){return{left:0,top:0,width:480,height:300}}toDataURL(){return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABstarstarstar'}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.body=new Node('body');doc.createElement=t=>new Node(t);
const fast=(fn,ms)=>setTimeout(fn,Math.min(ms||0,15));
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Map,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('external browsing forbidden')},setTimeout:fast,clearTimeout,setInterval,clearInterval,navigator:{}};w.window=w;
const SRC=['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','kids-more','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','pc-games','xp-minihome','pc-mail','web-data','web-stories','web-ghost','web-flash','web-sites','web-more','web-fun','pc-system','xp-desktop'];
const read=f=>fs.readFileSync(path.join(ROOT,'src/'+f+'.js'),'utf8');
for(const f of SRC){if(!fs.existsSync(path.join(ROOT,'src/'+f+'.js')))continue;vm.runInNewContext(read(f),w,{filename:f+'.js'})}
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),has=(s,n=root)=>n.textContent.includes(s);
const btn=(re,n=root)=>{const b=find(x=>x.tagName==='BUTTON'&&(typeof re==='string'?x.textContent===re:re.test(x.textContent)),n);assert.ok(b,'button '+re);return b};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const saved=()=>JSON.parse(memory.get('2006_xp_desktop_v1')||'{}');

(async()=>{
/* 1. 온라인 게임 실행기: 18개 게임 모두 패치, 로그인, 서버 선택, 게임 화면 */
await (async()=>{memory.clear();root.replaceChildren();
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
const PG=w.PCGames;assert.ok(PG);
const ids=Object.keys(PG.GENRE);assert.equal(ids.length,18);
for(const id of ids){
 api.openApp('game-'+id);
 const win=find(n=>n.classList.contains('pg-root'));assert.ok(win,'launcher '+id);
 await wait(400);
 const start=btn('게임 시작');assert.equal(start.disabled,false,'patched '+id);start.click();
 const form=find(n=>n.tagName==='FORM'&&n.classList.contains('pg-login'));assert.ok(form);form.emit('submit');await wait(300);
 assert.ok(cls('pg-server').length>=2,'servers '+id);
 const okServer=cls('pg-server').find(b=>!b.classList.contains('full'));okServer.click();
 assert.ok(find(n=>n.classList.contains('pg-gamebar')),'gamebar '+id);
 const genre=PG.GENRE[id];
 if(genre==='rts'){assert.ok(cls('pg-rooms').length===1);const joins=all=>0;btn('APM 측정기 (혼자 연습)').click();}
 const run=api.modules?null:null;
 const mod=w.XPDesktop.current;
 // close window
 api.closeWin?api.closeWin('game-'+id):0;
 log('ok',id,genre);
}
log('saved games keys',Object.keys(saved().games||{}).length);
api.destroy();

})();
/* 2. 장르별 작은 게임 열 가지가 끝까지 돌아간다 */
await (async()=>{memory.clear();root.replaceChildren();
const PG=w.PCGames,D=PG.defs;const E=(t,c,x)=>{const n=new Node(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n};
const said=[];const api={save(){},refresh(){},say:(a,b)=>said.push(a+':'+b),name:()=>'테스터',cheer(){}};
function mk(def){const host=new Node('div');const r=PG.runner(host,E,def,{});return r}
const steps=(r,n,dt=.02,f)=>{for(let i=0;i<n;i++){if(f)f(i);r.step(dt)}};
// hunt
{const S={lv:1,exp:0,gold:0,pot:5,wp:0,kills:0,deaths:0,items:[],plays:0};const r=mk(D.huntDef(PG.INFO.maple,S,api));r.begin();
 for(let i=0;i<4000&&S.lv<4;i++){const st=r.state();if(st.mobs.length){const m=st.mobs[0];r.game.down(m.x,m.y)}if(st.hp<st.hpMax*.4)r.game.potion();r.step(.02);if(r.phase()==='over')r.begin()}
 assert.ok(S.lv>=4,'level up '+S.lv);assert.ok(S.kills>5&&S.gold>0);log('hunt lv',S.lv,'kills',S.kills,'gold',S.gold,'pot',S.pot,'items',S.items);
 // death
 const S2={lv:1,exp:50,gold:0,pot:0,wp:0,kills:0,deaths:0,items:[],plays:0};const r2=mk(D.huntDef(PG.INFO.diablo,S2,api));r2.begin();steps(r2,6000,.02);assert.equal(r2.phase(),'over');assert.equal(S2.deaths,1);assert.ok(S2.exp<50,'exp lost');}
// shoot
{const S={exp:0,best:0,plays:0};const r=mk(D.shootDef('sudden',S,api));r.begin();let shots=0;
 for(let i=0;i<1700;i++){const st=r.state();const t=st.targets.find(t=>!t.ally&&t.rise>=1);if(t&&i%3===0){r.game.down(t.x,t.y);shots++}r.step(.02)}
 assert.equal(r.phase(),'over');assert.ok(S.best>500,'shoot score '+S.best);assert.ok(S.exp>0);log('shoot best',S.best,'rank',PG.rankOf(S.exp));}
// race
{const S={best:0,wins:0,plays:0};const r=mk(D.raceDef(S,api));r.begin();
 for(let i=0;i<6000&&r.phase()==='play';i++){const st=r.state();const near=st.obs.find(o=>o.d>st.dist&&o.d-st.dist<8&&o.kind!=='box'&&o.lane===st.lane);if(near){r.game.key(st.lane<2?'ArrowRight':'ArrowLeft',true)}if(st.gauge>=1)r.game.fire();r.step(.02)}
 assert.equal(r.phase(),'over');assert.ok(S.best>20&&S.best<60,'race time '+S.best);log('race',PG.fmtTime(S.best),'wins',S.wins);}
// run
{const S={best:0,wins:0,plays:0};const r=mk(D.runDef(S,api));r.begin();
 for(let i=0;i<5000&&r.phase()==='play';i++){const st=r.state();if(st.obs.some(o=>o.x>124&&o.x<175))r.game.jump();r.step(.02)}
 assert.equal(r.phase(),'over');assert.ok(S.best>25&&S.best<60,'run time '+S.best);log('run',PG.fmtTime(S.best),'wins',S.wins);}
// bomb
{const S={best:0,plays:0};const r=mk(D.bombDef(S,api));r.begin();steps(r,6000,.02);assert.equal(r.phase(),'over','bomb ends when idle');assert.ok(S.best>0);log('bomb best idle',S.best);}
// ring
{const S={wins:0,loss:0,streak:0,best:0,plays:0};const r=mk(D.ringDef(S,api));r.begin();for(let i=0;i<1200&&r.phase()==='play';i++){if(i%2===0)r.game.key(i%4===0?'ArrowLeft':'ArrowRight',true);r.step(.02)}assert.equal(r.phase(),'over');assert.equal(S.wins,1,'ring win');
 r.begin();steps(r,1200,.02);assert.equal(S.loss,1,'ring lose idle');assert.equal(S.streak,0);log('ring',S);}
// golf
{const S={best:0,plays:0};const r=mk(D.golfDef(S,api));r.begin();
 for(let h=0;h<5;h++){let st=r.state();r.game.click();const want=st.dist/260;for(let i=0;i<200;i++){r.step(.01);if(r.state().bar>=want-.004)break}r.game.click();for(let i=0;i<200;i++){r.step(.005);if(r.state().bar<=0.003)break}r.game.click();for(let i=0;i<300&&r.phase()==='play'&&r.state().hole===h+1;i++)r.step(.02)}
 assert.equal(r.phase(),'over');assert.ok(S.best>0&&S.best<200,'golf '+S.best);log('golf total',S.best);}
// hoop
{const S={best:0,plays:0};const r=mk(D.hoopDef(S,api));r.begin();
 for(let i=0;i<4000&&r.phase()==='play';i++){const st=r.state();if(!st.charging&&!st.ball)r.game.down();else if(st.charging&&st.pw>=(st.zone[0]+st.zone[1])/2&&st.pw<=st.zone[1])r.game.up();r.step(.01)}
 assert.equal(r.phase(),'over');assert.ok(S.best>=20,'hoop '+S.best);log('hoop',S.best);}
// dance
{const S={best:0,plays:0};const r=mk(D.danceDef(S,api));r.begin();
 for(let i=0;i<8000&&r.phase()==='play';i++){const st=r.state();if(st.wait<=0){if(st.idx<st.seq.length)r.game.press(st.seq[st.idx]);else if(Math.abs(st.t-.92)<.012)r.game.hit()}r.step(.005)}
 assert.equal(r.phase(),'over');assert.ok(S.best>=3000,'dance '+S.best);log('dance',S.best);}
// apm
{const S={w:0,l:0,apm:0,plays:0};const r=mk(D.apmDef(S,api,{n:'봇',apm:100}));r.begin();for(let i=0;i<800&&r.phase()==='play';i++){r.game.down(100,100);r.step(.02)}assert.equal(r.phase(),'over');assert.equal(S.w,1);assert.ok(S.apm>=200);log('apm',S);}
log('engines ok');


})();
/* 3. 미니홈피와 파도타기 */
await (async()=>{memory.clear();root.replaceChildren();
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
const MH=w.MiniHome;assert.equal(MH.FRIENDS.length,12);
api.openApp('minihome');const r0=find(n=>n.classList.contains('mh-root'));assert.ok(r0,'popup');
assert.ok(has('TODAY',r0)&&has('내 도토리 10개',r0),'counter, dotori');
const mini=api.modules.mini;
// friend network links are valid
for(const f of MH.FRIENDS){for(const [id] of f.ilchon)assert.ok(MH.FRIENDS.some(x=>x.id===id),'ilchon link '+f.id+'->'+id);for(const [id] of f.says)assert.ok(MH.FRIENDS.some(x=>x.id===id),'says '+f.id);
 for(const d of f.diary)assert.ok(d[0]<='2006.05.30 (화)'||d[0].startsWith('2006.05.30'),'diary date '+f.id+d[0]);for(const g of f.guest)assert.ok(g[1]<='2006.05.30 16:32','gb date '+f.id+g[1]);for(const p of f.photos)assert.ok(p[2]<='2006.05.30','photo date')}
// wave select from my home has sujin
const sel=find(n=>n.tagName==='SELECT'&&n.classList.contains('mh-wave'));assert.ok(sel.children.some(o=>o.value==='sujin'),'start ilchon sujin');
sel.value='sujin';sel.emit('change');let rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('수진이의 반짝반짝',rt),'visited sujin');assert.equal(saved().mini.dotori,11,'first visit +1');
// tabs
for(const t of ['프로필','다이어리','사진첩','방명록','홈']){btn(t).click();assert.ok(find(n=>n.classList.contains('mh-h')),t)}
btn('방명록').click();const f1=find(n=>n.tagName==='FORM'&&n.classList.contains('mh-write'));const inp=find(n=>n.tagName==='INPUT',f1);inp.value='방가방가 놀러 왔어요';f1.emit('submit');
assert.equal(saved().mini.dotori,12,'gb +1');await wait(120);rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('방가방가 놀러 왔어요',rt));
// wave from sujin to minho
const sel2=find(n=>n.tagName==='SELECT'&&n.classList.contains('mh-wave'));sel2.value='minho';sel2.emit('change');rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('게임 연구소',rt));
// ilchon request -> dialog
btn('일촌 신청').click();const ok=find(n=>n.tagName==='BUTTON'&&n.textContent==='신청');assert.ok(ok,'dialog');ok.click();await wait(100);
assert.equal(saved().mini.ilchon.minho,'겜친구','ilchon accepted');
// sora away
mini.go('sora','guest');rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('철봉 앞',rt),'away note');
const f2=find(n=>n.tagName==='FORM'&&n.classList.contains('mh-write'));find(n=>n.tagName==='INPUT',f2).value='혹시 별이 소식 아세요?';f2.emit('submit');await wait(80);rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('주인이 아직 답글을 달지 않았어요',rt),'sora no reply');
// boss diary seat
mini.go('boss','diary');rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('12번 자리 손님',rt),'seat in diary');
// my home: diary
mini.go('me','diary');const fd=find(n=>n.tagName==='FORM'&&n.classList.contains('mh-write'));find(n=>n.tagName==='TEXTAREA',fd).value='오늘은 PC방에서 미니홈피를 꾸몄다';fd.emit('submit');await wait(80);
assert.equal(saved().mini.diary.length,1);assert.ok(saved().mini.diary[0].cm.length===1,'friend commented');
// guestbook answers came (답방)
mini.go('me','guest');rt=find(n=>n.classList.contains('mh-root'));assert.ok(saved().mini.gbMine.length>=1,'답방 '+saved().mini.gbMine.length);
// shop & room
const before=saved().mini.dotori;assert.ok(mini.buy('teddy'));assert.equal(saved().mini.dotori,before-3);mini.go('me','room');btn('곰 인형').click();btn(/바닥 1:/).click();assert.equal(saved().mini.room.slots.F0,'teddy');
assert.ok(mini.buy('bgm-5'));rt=find(n=>n.classList.contains('mh-root'));assert.ok(has('반짝반짝 작은 별',rt),'bgm shown');
{let n=0;for(const id of ['piano','tv','sofa','fish','scope','bed','guitar','shelf'])if(mini.buy(id))n++;assert.ok(n>=1);assert.ok(saved().mini.dotori<10,'spent');assert.equal(mini.buy('bed'),false,'owned or poor');}
mini.go('me','shop');assert.ok(cls('mh-item').length===37,'shop rows '+cls('mh-item').length);
// profile save
mini.go('me','profile');const fp=find(n=>n.tagName==='FORM'&&n.classList.contains('mh-profile'));find(n=>n.tagName==='INPUT',fp).value='♡ 나의 작은 방 ♡';fp.emit('submit');assert.equal(saved().mini.title,'♡ 나의 작은 방 ♡');
// portal route opens popup
api.navigate({type:'minihome',portal:'naver'});assert.ok(has('새 창으로 열렸어요'));
log('mini ok dotori',saved().mini.dotori,'gbMine',saved().mini.gbMine.length);
api.destroy();

})();
/* 4. 메일함 (PC방 음식 주문은 A91 결정대로 없음) */
await (async()=>{memory.clear();root.replaceChildren();
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
api.openApp('mail');assert.ok(find(n=>n.classList.contains('ml-root')),'mail page');
const PM=w.PCMail;for(const m of PM.INBOX)assert.ok(('2006/'+m.at)<='2006/05/30 16:32','date '+m.id);
assert.ok(cls('ml-row').length>=12,'mails '+cls('ml-row').length);
const row=t=>cls('ml-row').find(r=>r.textContent.includes(t));
row('학원 끝나면').click();assert.ok(has('수박'),'read mom');btn('목록').click();assert.ok(!row('학원 끝나면').className.includes('read')===false,'read state');
// phishing reply
row('계정 확인 요청').click();btn('답장').click();assert.ok(find(n=>n.textContent.includes('운영자는 절대로')),'phish warning');find(n=>n.tagName==='BUTTON'&&n.textContent==='확인').click();
assert.equal(saved().mail.spam['m-phish'],1);
// ad refuse -> new ad
row('게임머니 100만').click();btn('수신 거부').click();await wait(60);assert.ok(saved().mail.got.some(x=>/수신 거부 감사/.test(x.subj)),'more ads');
// luck forward 7
row('행운의 편지').click();btn('전달').click();btn('주소록 일곱 명에게 한꺼번에 보내기').click();assert.equal(saved().mail.sent.length,7);await wait(60);assert.ok(saved().mail.got.some(x=>/이런 거 보내지 마라/.test(x.body)),'luck replies');
// compose to minho
btn('메일 쓰기').click();const f=find(n=>n.tagName==='FORM'&&n.classList.contains('ml-compose'));const ins=f.children.filter(n=>n.tagName==='LABEL').map(l=>l.children[1]);ins[0].value='kart_minho@dongne-mail.net';ins[2].value='안녕';find(n=>n.tagName==='TEXTAREA',f).value='PC방 ㄱ?';f.emit('submit');await wait(60);
assert.ok(saved().mail.got.some(x=>x.from==='민호'&&/Re: 안녕/.test(x.subj)),'reply from minho');
// wrong mail reply bounce
btn(/받은편지함/).click();row('(제목 없음)').click();btn('답장').click();const f2=find(n=>n.tagName==='FORM'&&n.classList.contains('ml-compose'));f2.emit('submit');await wait(60);assert.ok(saved().mail.got.some(x=>/반송/.test(x.subj)&&/메일함이 가득 찼습니다/.test(x.body)),'bounce');
// delete luck -> trash -> restore
btn(/받은편지함/).click();cls("ml-row").find(r=>r.textContent.includes("[펌] 행운의 편지")).click();btn("삭제").click();btn(/^휴지통 \(/).click();assert.ok(row('행운의 편지'));row('행운의 편지').click();btn('되살리기').click();
// card
btn(/받은편지함/).click();row('인터넷 엽서').click();btn('엽서 열어 보기').click();assert.ok(find(n=>n.classList.contains('ml-card')&&n.classList.contains('open')));
// A91에서 뺀 PC방 음식 주문과 사장님 호출은 다시 넣지 않는다
assert.ok(!api.modules.counter&&!w.PCCounter,'음식 주문 모듈 없음');assert.ok(!find(n=>n.textContent==='음식 주문'),'음식 주문 단추 없음');
api.destroy();log('mail ok');

})();
/* 5. 새 사이트 네 곳 */
await (async()=>{memory.clear();root.replaceChildren();
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});api.openApp('browser');
const WS=w.WebSites,F=w.WebFun;const pg=()=>find(n=>n.classList.contains('web-site'));
assert.equal(WS.order.length,19);for(const id of ['w-pet','w-auction','w-word','w-photo']){assert.ok(WS.owns(id));assert.equal(WS.resolveHost(WS.domain(id)),id);for(const type of WS.sites[id].types){api.navigate({type,portal:id,id:''});assert.ok(pg()&&pg().textContent.length>30,id+' '+type)}}
// duplicates in words
assert.equal(new Set(F.WORDS).size,F.WORDS.length,'no duplicate words');assert.ok(F.WORDS.length>=450,'words '+F.WORDS.length);
assert.equal(JSON.stringify(F.heads('력')),'["력","역"]');assert.equal(JSON.stringify(F.heads('리')),'["리","이"]');assert.equal(JSON.stringify(F.heads('라')),'["라","나"]');assert.equal(JSON.stringify(F.heads('녀')),'["녀","여"]');assert.equal(JSON.stringify(F.heads('가')),'["가"]');
// pet
api.navigate({type:'home',portal:'w-pet'});const kinds=cls('pt-kind');assert.equal(kinds.length,4);kinds[0].click();assert.ok(has('알을 쓰다듬어',pg())||has('알',pg()));
const pcv=find(n=>n.classList.contains('pt-canvas'));for(let i=0;i<5;i++)pcv.emit('pointerdown');await wait(5);assert.equal(saved().web.pet.stage,'baby');
api.navigate({type:'room',portal:'w-pet'});saved();btn('씻기기').click();btn('놀아 주기').click();assert.ok(saved().web.pet.care>=2,'care '+saved().web.pet.care);btn('재우기').click();assert.equal(saved().web.pet.sleep,true);btn('밥 주기').click();btn('깨우기').click();assert.equal(saved().web.pet.sleep,false);
api.navigate({type:'board',portal:'w-pet'});btn('내 펫 자랑하기').click();assert.ok(has('뽀글이',pg()));
// auction
api.navigate({type:'home',portal:'w-auction'});assert.equal(cls('au-card').length,8);const before=saved().web.auc.money;const b1=cls('au-btn')[0];b1.click();assert.ok(saved().web.auc.money<before,'money held');assert.equal(saved().web.auc.items[0].top,'나');
// force end
const st=saved();
// word chain
api.navigate({type:'chain',portal:'w-word'});assert.ok(has('끝말봇',pg()));
const lines=cls('wd-line');const botFirst=lines[lines.length-1].textContent.split(' : ')[1];const need=botFirst[botFirst.length-1];const cand=F.nextWords(need,[botFirst]);assert.ok(cand.length,'player candidate');
const form=find(n=>n.tagName==='FORM'&&n.classList.contains('wd-form'));const inp=find(n=>n.tagName==='INPUT',form);const mine=cand.find(x=>F.nextWords(x[x.length-1],[botFirst,x]).length>2)||cand[0];inp.value=mine;form.emit('submit');await wait(30);
const l2=cls('wd-line');assert.ok(l2.some(x=>x.textContent.startsWith('나 : '+mine)),'my word accepted');assert.ok(l2.length>=4,'bot answered');
inp.value='abc';form.emit('submit');assert.ok(has('한글 2~6글자',pg()));
// poem
api.navigate({type:'poem',portal:'w-word'});const pf=find(n=>n.tagName==='FORM'&&n.classList.contains('wd-poem'));const pins=pf.children.filter(n=>n.tagName==='LABEL').map(l=>l.children[1]);pins.forEach((x,i)=>x.value='줄'+i);pf.emit('submit');assert.equal(saved().web.word.poems.length,1);
// ox
api.navigate({type:'ox',portal:'w-word'});btn('O').click();assert.ok(find(n=>n.classList.contains('wd-res')).textContent.length>5);
// photo
api.navigate({type:'studio',portal:'w-photo'});assert.ok(find(n=>n.classList.contains('ph-canvas')));find(n=>n.classList.contains('ph-canvas')).emit('pointerdown',{clientX:100,clientY:100});btn('흑백').click();btn('내 그림으로 저장').click();
const pics=api.modules.shell.pics();log('pics after save',pics.length);
// links page shows new sites
api.navigate({type:'home',portal:'w-links'});assert.ok(has('뽀글뽀글 펫 키우기',pg())&&has('말놀이 천국',pg()));
// search
assert.ok(WS.search('끝말잇기').some(x=>x.id==='w-word'));assert.ok(WS.search('경매').some(x=>x.id==='w-auction'));
// OX dates/era: questions true facts
api.destroy();log('fun ok');

})();
/* 6. 주니어네이버와 야후꾸러기 보강 */
await (async()=>{memory.clear();root.replaceChildren();
const K=w.KidsData,KM=w.KidsMore,KG=w.KidsGames;
const SHAPE={jr:{news:8,kin:9,help:7,story:7,quiz:12,board:10,read:10},yk:{news:8,qna:9,play:7,story:7,quiz:12,board:11,read:10}};
for(const [site,shape] of Object.entries(SHAPE))for(const [kind,n] of Object.entries(shape))assert.equal(K[site][kind].length,n,site+' '+kind);
const flat=site=>Object.values(K[site]).flat(),ids=[...flat('jr'),...flat('yk')].map(x=>x.id);assert.equal(new Set(ids).size,ids.length,'ids');
const blob=JSON.stringify(K);assert.ok(!/\d{2,4}-\d{3,4}-\d{4}|https?:|www\.|@[a-z0-9]/i.test(blob),'private');
for(const x of flat('jr').concat(flat('yk'))){if(x.at)assert.ok(/^\d\d\.\d\d \d\d:\d\d$/.test(x.at)&&x.at<='05.30 16:32','date '+x.id);for(const r of x.replies||[])assert.ok(r.length<=90)}
for(const site of ['jr','yk'])for(const x of K[site][site==='jr'?'kin':'qna'])assert.equal(x.answers.filter(a=>a.pick).length,1,'pick '+x.id);
for(const s of [K.jr.story[6],K.yk.story[6]])assert.ok(s.body.length>=600,'story len '+s.body.length);
assert.ok(KG.has('gugu')&&KG.has('rope'));assert.equal(KG.list.length,10);
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
api.navigate({type:'home',portal:'jr'});assert.ok(has('그림일기'),'jr menu diary');assert.ok(has('구구단 풍선'),'jr hot games');
api.navigate({type:'diary',portal:'jr'});assert.ok(find(n=>n.classList.contains('kd-pad')),'pad');assert.ok(cls('kd-card').length===3,'friend diaries');
const pad=find(n=>n.classList.contains('kd-pad'));pad.emit('pointerdown',{clientX:10,clientY:10});pad.emit('pointermove',{clientX:60,clientY:40});pad.emit('pointerup');
find(n=>n.classList.contains('kd-title')).value='PC방에 갔다';find(n=>n.classList.contains('kd-text')).value='오늘은 친구랑 PC방에 가서 그림일기를 썼다. 컵라면도 먹었다. 정말 재미있었다. 내일도 오고 싶다!';
btn('일기 올리기').click();assert.equal(saved().kids.diary.length,1);await wait(40);assert.equal(saved().kids.diary[0].stamp,'참 잘했어요');assert.ok(cls('kd-stamp').length>=4,'stamps shown');
// private info blocked
api.navigate({type:'diary',portal:'jr'});find(n=>n.classList.contains('kd-title')).value='번호';find(n=>n.classList.contains('kd-text')).value='내 번호는 010-1234-5678';const pad2=find(n=>n.classList.contains('kd-pad'));pad2.emit('pointerdown',{clientX:10,clientY:10});btn('일기 올리기').click();assert.ok(has('개인정보는 쓸 수 없어요'));assert.equal(saved().kids.diary.length,1);
// yk dict
api.navigate({type:'home',portal:'yk'});assert.equal(cls('ky-tab').length,9);assert.ok(has('꾸러기 줄넘기'),'yk tile');
api.navigate({type:'dict',portal:'yk'});for(let i=0;i<10;i++){const q=find(n=>n.classList.contains('kq-q'));assert.ok(q,'q '+i);const item=KM.DICT.find(d=>d[0]===q.textContent);btn(item[1][item[2]]).click();await wait(20)}
assert.ok(has('100점'),'perfect');assert.equal(saved().kids.scores.dict,100);assert.ok(has('참 잘했어요'));
// games via runner
const host=new Node('div');const r=KG.run('gugu',host,{});r.begin();const st=r.state();const right=st.balloons.find(b=>b.n===st.q.ans);r.game.click(right.x,right.y);assert.ok(r.state().score>=10,'gugu score');r.stop();
const host2=new Node('div');const r2=KG.run('rope',host2,{});r2.begin();let jumps=0;for(let i=0;i<3000&&r2.phase()==='play';i++){const s=r2.state();const PI=Math.PI;const ph=((s.ang-PI/2)%(2*PI)+2*PI)%(2*PI);if(!s.air&&ph>2*PI-(.35*s.speed))r2.game.click();r2.game.update(.01)}assert.ok(r2.state().count>=10,'rope count '+r2.state().count);r2.stop();
// address routing to new type
api.navigate({type:'dict',portal:'yk'});assert.ok(w.KidsPortal.types.includes('dict')&&w.KidsPortal.types.includes('diary'));
api.destroy();log('kids ok');

})();
/* 7. 시대 고증과 글쓰기 규칙 */
{const t=fs.readFileSync(path.join(__dirname,'test_web_more_a94.cjs'),'utf8');const m=/const BAD=\[(.*?)\];/s.exec(t);const BAD=eval('['+m[1]+']');
 for(const f of ['pc-games','xp-minihome','pc-mail','web-fun','kids-more']){const body=read(f).replace(/\/\*[\s\S]*?\*\//g,'');for(const b of [...BAD,'인생샷','집사','덕질','최애','혼밥'])assert.ok(!body.includes(b),'시대에 안 맞는 말 '+b+' in '+f);assert.ok(!/ordersWin|사장님 호출|음식 주문|order-row|PCCounter/.test(body),'음식 주문 코드 없음 '+f);assert.ok(!body.includes(String.fromCharCode(0x2014)),'줄표 '+f)}
 for(const f of ['assets/pc-desktop/pc-fun.css','assets/pc-desktop/web-fun.css'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes(String.fromCharCode(0x2014)),'줄표 '+f);
 const P=w.WebSites.pairStrokes;assert.equal(P('김철수','이영희').pc,57,'획수 궁합 계산');assert.equal(P('ab','가'),null);
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');for(const f of ['pc-games','xp-minihome','pc-mail','web-fun','kids-more'])assert.ok(new RegExp('src/'+f+'\\.js\\?v=A(9[5-9]|1\\d\\d)').test(html),'index '+f);assert.ok(/pc-fun\.css\?v=A9[5-9]/.test(html)&&/web-fun\.css\?v=A9[5-9]/.test(html)); /* A97: 고친 파일은 새 버전 표시를 단다 */
 assert.ok(!html.includes('src/pc-counter.js'),'음식 주문 파일 없음');
 assert.ok(html.indexOf('src/web-sites.js')<html.indexOf('src/web-fun.js')&&html.indexOf('src/kids-portal.js')<html.indexOf('src/kids-more.js'),'읽는 순서');}
console.log('A95 PC fun tests passed');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
