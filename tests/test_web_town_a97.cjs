'use strict';
/* A97 (2026-11-12 KST): 새 사이트 네 곳(우리동네 소식통, 동일초등학교, 폰꾸미기 천국, 뮤직박스), 동네를 소재로 한 포털 글,
   다듬고 더한 주니어네이버와 야후꾸러기 글, 읽는 순서와 버전 표시, 시대 고증을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.dataset={};this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,f)=>{const s=f===undefined?!this.classList.contains(c):f;s?this.classList.add(c):this.classList.remove(c);return s}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...ns){for(const n of ns){n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...ns){this.children.unshift(...ns)}insertBefore(n,b){const i=this.children.indexOf(b);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...ns){this.children=[];this._text='';this.append(...ns)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(){}emit(k,e={}){for(const fn of [...this.listeners[k]||[]])fn({target:this,preventDefault(){},stopPropagation(){},...e})}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}toDataURL(){return 'data:image/png;base64,'+'A'.repeat(60)}focus(){}getBoundingClientRect(){return{left:0,top:0,width:640,height:380}}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.body=new Node('body');doc.createElement=t=>new Node(t);let fetches=0;
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Map,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{fetches++;throw Error('external browsing forbidden')},setTimeout:(f,ms)=>setTimeout(f,Math.min(ms||0,15)),clearTimeout,setInterval,clearInterval};w.window=w;
const SRC=['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','kids-more','kids-extra','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','pc-games','xp-minihome','pc-mail','web-data','web-stories','web-ghost','web-flash','web-sites','web-more','web-fun','web-town','pc-system','xp-desktop'];
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
for(const f of SRC)vm.runInNewContext(read('src/'+f+'.js'),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(x=>x.classList.contains(c));
const btn=(t,n=root)=>{const b=all(n).filter(x=>x.tagName==='BUTTON'&&(typeof t==='string'?x.textContent.trim()===t:t.test(x.textContent))).at(-1);assert.ok(b,'button '+t);return b};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const saved=()=>JSON.parse(memory.get('2006_xp_desktop_v1')||'{}');
(async()=>{
const api=w.XPDesktop.mount(root,{boot:false,seat:12});
const WS=w.WebSites,T=w.WebTown,pg=()=>cls('web-site')[0],text=()=>pg().textContent,go=r=>{api.navigate(r);return text()};
const toasts=()=>api.modules.shell.toasts().join('\n');
/* 1. 사이트 등록, 주소, 모든 화면 */
assert.equal(WS.order.length,23,'사이트 스물세 곳');assert.equal(new Set(WS.order.map(i=>WS.domain(i))).size,23,'주소가 모두 다름');
for(const id of ['w-town','w-dongil','w-phone','w-music']){assert.ok(WS.owns(id));assert.equal(WS.resolveHost(WS.domain(id)),id);for(const type of WS.sites[id].types){go({type,portal:id,id:''});assert.ok(pg()&&text().length>120,id+' '+type)}}
assert.ok(go({type:'home',portal:'w-links'}).includes('우리 동네')&&text().includes('우리동네 소식통')&&text().includes('동일초등학교'),'링크천국 새 분류');
assert.equal(JSON.stringify(WS.search('은하분식').map(x=>x.id)),JSON.stringify(['w-town']));assert.ok(WS.search('급식').some(x=>x.id==='w-dongil'));assert.ok(WS.search('벨소리').some(x=>x.id==='w-phone'));assert.ok(WS.search('가요').some(x=>x.id==='w-music'));
/* 2. 우리동네 소식통: 지금 지도의 가게가 모두 있다 */
const names=T.PLACES.map(p=>p[1]).join(' ');
const road=w.document?read('src/commercial-road.js'):'';for(const shop of ['중앙약국','진영제과','김밥나라','한빛 이동통신','제일서점','행복사진관','은하 비디오','영진컴퓨터','미선미용실','뮤직박스'])assert.ok(road.includes(shop)&&names.includes(shop),'큰길 가게 '+shop);
const html=read('index.html');for(const spot of ['은하분식','중앙 이발관','동네 철물','동일초등학교','은하아파트'])assert.ok(html.includes(spot)&&names.includes(spot),'동네 장소 '+spot);assert.ok(names.includes('우리슈퍼')&&read('src/supermarket-map.js').includes('우리슈퍼'));
go({type:'map',portal:'w-town'});const map=find(n=>n.classList.contains('tw-map'));const [bx,by,bw,bh]=T.PLACES.find(p=>p[0]==='bunsik')[3];map.emit('pointerdown',{clientX:bx+bw/2,clientY:by+bh/2});
assert.ok(find(n=>n.classList.contains('tw-pick')).textContent.includes('컵떡볶이 500원'),'약도에서 은하분식 고르기');btn('가게 이야기 보기 ▶').click();assert.ok(text().includes('떡볶이요정'));
{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('tw-form')),t=f.children[2];t.value='내 번호 010-1234-5678 연락 주세요';f.emit('submit');assert.ok(text().includes('개인정보는 쓸 수 없어요'),'전화번호 거름');
 const f2=find(n=>n.tagName==='FORM'&&n.classList.contains('tw-form'));f2.children[2].value='<b>핫도그</b> 최고';f2.emit('submit');assert.equal(saved().web.town.rev.bunsik.length,1);assert.ok(text().includes('<b>핫도그</b> 최고')&&!find(n=>n.tagName==='B'&&n.textContent==='핫도그'),'글자 그대로')}
go({type:'board',portal:'w-town'});assert.ok(text().includes('놀이터 그네 옆에서 실내화 주머니'));{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('tw-form'));f.children[2].value='파란 우산 주웠어요';f.emit('submit');assert.ok(text().includes('파란 우산 주웠어요'))}
btn(/수요일 분리수거, 상자는 꼭 펴서/).click();assert.ok(text().includes('철망 수거함'));
go({type:'vote',portal:'w-town'});cls('tw-vbtn')[0].click();assert.equal(saved().web.town.votes.snack,0);assert.ok(text().includes('투표해 주셔서 고마워요')&&!cls('tw-vbtn').some(b=>b.textContent==='은하분식 컵떡볶이'),'한 번만 투표');
assert.ok(go({type:'notice',portal:'w-town'}).includes('여름 소독')&&text().includes('동일초등학교 강당'));
/* 3. 동일초등학교: 5월 급식표, 알림장, 가정통신문, 게시판 */
go({type:'meal',portal:'w-dongil'});assert.equal(cls('dg-day').length,23,'5월 평일 23일');assert.ok(text().includes('5월 30일 (오늘)')&&text().includes('카레라이스'));
btn(/^5어린이날$/).click();assert.ok(find(n=>n.classList.contains('dg-mealpick')).textContent.includes('어린이날이라 학교를 쉬어요'));
btn(/^19쌀밥$/).click();cls('dg-star')[3].click();assert.equal(saved().web.dongil.meal['19'],4,'급식 별점');
for(const [d,m] of Object.entries(T.DG_MEAL)){const dow=(Number(d)-1)%7;assert.ok(dow<5,'평일 급식 '+d)}assert.ok(!T.DG_MEAL[31]&&T.DG_OFF[31]==='지방선거일');
go({type:'home',portal:'w-dongil'});btn(/수학 익힘책/).click();assert.equal(saved().web.dongil.hw['0'],true);assert.ok(text().includes('(1/5)'));
assert.ok(go({type:'notice',portal:'w-dongil',id:'g1'}).includes('전국동시지방선거일')&&text().includes('동일초등학교장'));
go({type:'board',portal:'w-dongil'});{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('dg-form'));f.children[1].value='www.가짜.com 놀러 와';f.emit('submit');assert.ok(text().includes('개인정보는 쓸 수 없어요'))}
/* 4. 폰꾸미기 천국: 문자 80바이트, 하루 5통, 답장, 배경 화면 저장, 벨소리 */
assert.equal(T.smsBytes('가a ♡'),6);assert.equal(T.smsBytes(''),0);
go({type:'sms',portal:'w-phone'});const ta=()=>find(n=>n.tagName==='TEXTAREA');
ta().value='가'.repeat(41);ta().emit('input');assert.ok(text().includes('82 / 80 바이트'));btn('보내기').click();assert.ok(toasts().includes('80바이트가 넘어서'));
ta().value='민호야 PC방 가자';ta().emit('input');btn('보내기').click();await sleep(60);assert.ok(find(n=>n.classList.contains('pn-lcd')).textContent.includes('17번 자리 맡아 놔'),'민호 답장');
for(let i=0;i<4;i++){ta().value='안녕 '+i;btn('보내기').click()}assert.equal(saved().web.phone.sent,5);ta().value='여섯 번째';btn('보내기').click();assert.ok(toasts().includes('무료 문자 5통을 다 썼어요'));assert.equal(saved().web.phone.sent,5);
go({type:'art',portal:'w-phone'});btn('문자에 넣기').click();assert.equal(api.state.history.at(-1).type,'sms');assert.equal(ta().value,T.SMS_ART.at(-1)[1],'문자 그림 넣기');
go({type:'wall',portal:'w-phone'});const pics0=api.modules.shell.pics().length;btn('내 그림으로 저장').click();assert.equal(api.modules.shell.pics().length,pics0+1,'배경 화면을 내 그림으로');assert.ok(api.modules.shell.pics().at(-1).name.startsWith('폰 배경'));
go({type:'bell',portal:'w-phone'});assert.equal(cls('pn-ring').length,10);btn('▶ 미리 듣기').click();assert.ok(cls('pn-ring').some(r=>r.textContent.includes('■ 듣는 중')),'미리 듣기');
btn('내 폰에 받기').click();assert.ok(find(n=>n.classList.contains('xp-dialog'))&&find(n=>n.classList.contains('xp-dialog')).textContent.includes('부모님 허락'),'결제 안내');for(const d of cls('xp-modal'))d.remove();
/* 5. 뮤직박스: 차트, 미리 듣기, 가사, 미니홈피 배경음악 담기 */
go({type:'chart',portal:'w-music'});assert.equal(cls('mb-row').length,10);btn('▶ 듣기').click();assert.ok(find(n=>n.classList.contains('mb-now')).textContent.includes('1분 미리 듣기'));
const bgmBtn=()=>find(x=>x.tagName==='BUTTON'&&x.textContent==='미니홈피 배경음악 담기');const dot0=api.modules.mini.state().dotori;bgmBtn().click();assert.ok(api.modules.mini.state().items.includes('bgm-1'),'미니홈피 배경음악 (1위 노래)');assert.equal(api.modules.mini.state().dotori,dot0-3);
bgmBtn().click();assert.ok(toasts().includes('이미 미니홈피에 담은 노래'));
assert.ok(go({type:'lyrics',portal:'w-music',id:'s2'}).includes('우산 속 두 사람')&&text().includes('비야 그치지 마'));
for(const [id,bgm] of Object.entries(T.BGM_OF)){const it=w.MiniHome.SHOP.find(x=>x.id===bgm);const song=T.SONGS.find(x=>x[0]===id);assert.ok(it&&it.name.includes(song[1].replace(' (피아노)','')),'배경음악 이름 '+id)}
/* 6. 소리 가락: 모든 음이 읽히고 길이가 맞다 */
assert.equal(T.freq('A4'),440);assert.ok(Math.abs(T.freq('C4')-261.63)<.01);
for(const r of T.RINGS){for(const tune of [r[5],r[6]])for(const n of T.parseTune(tune))assert.ok(n.n==='R'||T.freq(n.n)>0,r[1]+' '+n.n);assert.ok(T.tuneBeats(r[5])>=2,'가락 길이 '+r[1])}
for(const s of T.SONGS)for(const tune of [s[6],s[7]])for(const n of T.parseTune(tune))assert.ok(n.n==='R'||T.freq(n.n)>0,s[1]+' '+n.n);
/* 7. 동네를 소재로 한 포털 글 */
const recs=w.PortalBoards.records,mine=['naver-cafe-eunha','naver-kin-ppopgi','naver-cafe-rooftop','daum-cafe-pc17','daum-agora-recycle','yahoo-local-bakery','yahoo-local-photo','yahoo-kin-video','naver-cafe-hakwon','daum-cafe-musicbox','naver-kin-arcade','yahoo-blog-barber'];
for(const id of mine){const r=recs.find(x=>x.id===id);assert.ok(r,id);assert.ok(/은하|동일초|별빛문구|큰길|PC방|뮤직박스|진영제과|행복사진관|이발관|비디오|김밥나라|청솔/.test(r.title+r.body),'동네 소재 '+id);api.navigate({type:r.type==='카페'?'post':'question',id,portal:r.owner});assert.ok(root.textContent.includes(r.title.slice(0,12)),'열림 '+id)}
/* 8. 어린이 포털: 다듬은 글과 더한 글 */
const K=w.KidsData,SHAPE={jr:{news:10,kin:11,help:8,story:8,quiz:16,board:12,read:12},yk:{news:10,qna:11,play:8,story:8,quiz:16,board:13,read:12}};
for(const [site,shape] of Object.entries(SHAPE))for(const [kind,n] of Object.entries(shape))assert.equal(K[site][kind].length,n,site+' '+kind);
for(const id of ['jr-s1','jr-s2','jr-s3','yk-s1','yk-s2','yk-s3']){const x=[...K.jr.story,...K.yk.story].find(s=>s.id===id);assert.ok(x.body.length>=500,'다듬은 동화 '+id+' '+x.body.length)}
for(const x of [...K.jr.help,...K.yk.play].filter(x=>!/^(jr-h7|yk-p7)$/.test(x.id)))assert.ok(/■ /.test(x.body)&&x.body.length>=300,'소제목 있는 설명 '+x.id);
const flat=site=>Object.values(K[site]).filter(Array.isArray).flat();const titles=new Set(flat('jr').map(x=>x.title||x.q));for(const x of flat('yk'))assert.ok(!titles.has(x.title||x.q),'두 사이트에 같은 제목 '+(x.title||x.q));
for(const x of [...flat('jr'),...flat('yk')]){if(x.at)assert.ok(x.at<='05.30 16:32',x.id);for(const r of x.replies||[])assert.ok(r.length<=90,x.id)}
for(const site of ['jr','yk'])for(const x of K[site].read)assert.ok(x.fact&&x.body.length>=450&&/■ /.test(x.body),'읽을거리 '+x.id);
assert.ok(K.jr.read.find(x=>x.id==='jr-r11').fact.includes('만 19세'),'2006년 선거 나이');assert.ok(!/명왕성[^.]{0,30}(빠졌|제외|퇴출)/.test(read('src/kids-extra.js')+read('src/kids-data.js')));
api.navigate({type:'item',id:'jr-s8',portal:'jr'});assert.ok(root.textContent.includes('마지막 캡슐'));api.navigate({type:'item',id:'yk-r11',portal:'yk'});assert.ok(root.textContent.includes('석빙고'));api.navigate({type:'item',id:'jr-h8',portal:'jr'});assert.ok(root.textContent.includes('방위표'));
/* 9. 읽는 순서, 버전 표시, 줄표와 시대에 안 맞는 말 */
assert.ok(html.indexOf('src/web-fun.js')<html.indexOf('src/web-town.js')&&html.indexOf('src/web-town.js')<html.indexOf('src/xp-desktop.js'),'사이트 읽는 순서');
assert.ok(html.indexOf('src/kids-more.js')<html.indexOf('src/kids-extra.js')&&html.indexOf('src/kids-extra.js')<html.indexOf('src/xp-desktop.js'),'어린이 글 읽는 순서');
for(const f of ['web-town','kids-extra','kids-data','kids-more','portal-boards','xp-minihome'])assert.ok(new RegExp('src/'+f+'\\.js\\?v=A(9[7-9]|1\\d\\d)').test(html),'버전 '+f);assert.ok(html.includes('web-town.css?v=A97')&&html.includes('pc-fun.css?v=A97'));
const BAD=[String.fromCharCode(0x2014),'병맛','힐링','먹방','고인물','흑역사','귀요미','치맥','멘붕','킹왕짱','엄친아','된장녀','와이파이','스마트폰','카톡','카카오','페북','페이스북','트위터','유튜브','인스타','넷플릭스','인생샷','갓생','꿀잼','노잼','레전드','인싸','실화냐','개이득','지못미','국룰','꿀팁','최애','덕질','혼밥'];
for(const f of ['src/web-town.js','src/kids-extra.js','server_minihome.js','assets/pc-desktop/web-town.css']){const body=read(f).replace(/\/\*[\s\S]*?\*\//g,'');for(const b of BAD)assert.ok(!body.includes(b),b+' in '+f)}
assert.ok(!/사장님 호출|음식 주문/.test(read('src/web-town.js')),'PC방 음식 주문은 다시 넣지 않는다');
assert.equal(fetches,0,'바깥 접속 없음');
api.destroy();console.log('A97 town sites, posts and kids tests passed');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
