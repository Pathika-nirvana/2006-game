'use strict';
/* A94: 인터넷 디테일 보강. 어린이 포털 읽을거리, 소름닷컴 긴 괴담, 새 사이트 네 곳, 숨은 미스터리 홈페이지와 복선, 포털 사이트 검색, 시대 고증을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...nodes){for(const n of nodes){n.parentNode=this}this.children.unshift(...nodes)}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}getBoundingClientRect(){return{left:0,top:0,width:480,height:320}}toDataURL(){return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABstarstarstar'}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.body=new Node('body');doc.createElement=t=>new Node(t);
const fast=(fn,ms)=>setTimeout(fn,Math.min(ms||0,15));
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('external browsing forbidden')},setTimeout:fast,clearTimeout,setInterval,clearInterval};w.window=w;
const SRC=['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','web-data','web-stories','web-ghost','web-flash','web-sites','web-more','pc-system','xp-desktop'];
const read=f=>fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8');
for(const f of SRC)vm.runInNewContext(read(f),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),has=(s,n=root)=>n.textContent.includes(s);
const btn=(re,n=root)=>{const b=find(x=>x.tagName==='BUTTON'&&(typeof re==='string'?x.textContent===re:re.test(x.textContent)),n);assert.ok(b,'button '+re);return b};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const saved=()=>JSON.parse(memory.get('2006_xp_desktop_v1')||'{}');
(async()=>{
const WS=w.WebSites,ST=w.WebStories,WM=w.WebMore,K=w.KidsData,D=w.WebData;
/* 1. 시대 고증: 그 뒤에 생긴 말과 사건은 쓰지 않는다 */
const BAD=[String.fromCharCode(0x2014),'병맛','힐링','먹방','고인물','흑역사','귀요미','치맥','새벽감성','갑분싸','썸타','멘붕','킹왕짱','엄친아','된장녀','왜소행성','와이파이','스마트폰','카톡','카카오','페북','페이스북','트위터','유튜브','인스타','넷플릭스','인생샷','브이로그','갓생','꿀잼','노잼','레전드','인싸','실화냐','개이득','지못미','국룰'];
for(const f of ['web-data','web-stories','web-more','web-sites','kids-data','kids-portal','portal-boards']){const body=read(f).replace(/\/\*[\s\S]*?\*\//g,'');for(const b of BAD)assert.ok(!body.includes(b),'시대에 안 맞는 말 '+b+' in '+f)}
assert.ok(!/명왕성[^.]{0,30}(빠졌|제외|퇴출)/.test(read('kids-data')),'명왕성 퇴출(2006년 8월)은 아직 일어나지 않음');
/* 2. 어린이 포털 읽을거리 */
for(const site of ['jr','yk']){const list=K[site].read;assert.equal(list.length,10,site+' 읽을거리 10편');for(const x of list){assert.ok(x.cat&&x.title&&x.fact,'분야, 제목, 한마디 '+x.id);assert.ok(x.body.length>=450,'충분히 긴 글 '+x.id);assert.ok(/■ /.test(x.body),'소제목 '+x.id);assert.ok(x.at<='05.30 16:32')}
 for(const x of K[site].story.slice(3))assert.ok(x.body.length>=600,'긴 이야기 '+x.id)}
assert.ok(K.jr.read.find(x=>x.id==='jr-r9').body.includes('6월 13일 밤 10시'),'토고전 시각');
assert.ok(K.jr.read.find(x=>x.id==='jr-r8').replies.some(t=>t.startsWith('별지기::')),'북극성 글에 별지기 댓글 (복선)');
assert.ok(K.yk.board.some(x=>x.nick==='바다소라'&&/다락방/.test(x.body)),'꾸러기 광장 친구 찾기 글 (복선)');
/* 3. 소름닷컴 긴 괴담 */
const longs=ST.sorum;assert.ok(longs.length>=8,'긴 괴담 여러 편');const ids=new Set(D.sorum.stories.map(x=>x.id));assert.equal(ids.size,D.sorum.stories.length,'글 번호가 겹치지 않음');
for(const st of longs){assert.ok(st.text.length>=1200,'길이 '+st.id);assert.ok(st.date<='05.30 16:32','날짜 '+st.id);assert.ok(st.comments.length>=6,'댓글 '+st.id);assert.ok(['real','serial','short'].includes(st.cat))}
const camp=longs.filter(x=>x.series==='camp');assert.equal(camp.length,3,'수련회 연재 세 편');assert.equal(JSON.stringify(camp.map(x=>x.part)),'[1,2,3]');
assert.ok(longs.find(x=>x.id==='minihome').comments.some(t=>t.includes('별이네 다락방')),'미니홈피 괴담 댓글에 다락방 소문 (복선)');
/* 4. 새 사이트 등록과 검색 */
assert.equal(WS.order.length,15,'사이트 열다섯 곳');assert.equal(new Set(WS.order.map(i=>WS.domain(i))).size,15);
for(const id of ['w-novel','w-class','w-emo','w-xfile','w-star']){assert.ok(WS.owns(id));assert.equal(WS.resolveHost(WS.domain(id)),id)}
const favs=WS.favorites(()=>{}).filter(Array.isArray).map(x=>x[0]);assert.ok(favs.includes('소설나라')&&favs.includes('미스터리 X파일')&&favs.includes('이모티콘 세상'));assert.ok(!favs.includes('별이네 다락방'),'숨은 사이트는 즐겨찾기에 없음');
assert.ok(WS.search('괴담').some(x=>x.id==='w-sorum'));assert.ok(WS.search('타임캡슐').some(x=>x.id==='w-class'),'타임캡슐로 학급 홈피가 찾아짐');assert.ok(WS.search('인터넷 소설').some(x=>x.id==='w-novel'));
assert.ok(!WS.search('다락방').some(x=>x.id==='w-star')&&!WS.search('별이네').some(x=>x.id==='w-star'),'숨은 사이트는 검색에 안 나옴');
/* 5. 외계어 번역기 */
assert.equal(WM.alien('안녕하세요'),'ㅇrㄴ녕ㅎrㅅㅔ욤');assert.equal(WM.alien('사랑해'),'ㅅrㄹrㅇㅎH');assert.equal(WM.alien('가'),'7r');assert.equal(WM.alien('abc 1'),'abc 1');assert.equal(WM.circled('ab'),'ⓐⓑ');
/* 6. 화면 열기 */
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});api.openApp('browser');
const pg=()=>find(n=>n.classList.contains('web-site'));
const opened=[];for(const id of ['w-novel','w-class','w-emo','w-xfile','w-star'])for(const type of WS.sites[id].types){api.navigate({type,portal:id,id:type==='read'&&id==='w-novel'?'3':type==='read'?'nessie':type==='post'?'b4':''});assert.ok(pg(),id+' '+type);assert.ok(pg().textContent.length>30,id+' '+type+' 글자');opened.push(id+'/'+type)}
assert.equal(opened.length,24,"열어 본 쪽 수");
/* 7. 소름닷컴 게시판과 긴 글 */
api.navigate({type:'main',portal:'w-sorum'});assert.ok(has('실화 괴담',pg())&&has('연재',pg())&&has('스크롤 압박',pg())&&has('NEW',pg()),'분류, 스크롤 압박, 새 글 표시');
btn('연재').click();assert.ok(has('수련회 마지막 날 밤 (1/3)',pg())&&!has('엘리베이터 4층 버튼',pg()),'연재만 보기');
api.navigate({type:'story',portal:'w-sorum',id:'pc22'});assert.ok(cls('sr-para').length>=20,'문단마다 나뉨');assert.ok(has('읽는 데 약',pg()));assert.ok(has('글쓴이의 말',pg()));
const hold=find(n=>n.classList.contains('sr-hold'));assert.ok(hold,'마지막 문단은 천천히');await wait(40);assert.ok(hold.classList.contains('sr-shown'),'잠시 뒤 보임');
btn(/불 끄고 읽기/).click();assert.equal(saved().web.srNight,1);assert.ok(pg().classList.contains('sr-night'),'불 끄고 읽기');btn(/불 켜고 읽기/).click();assert.equal(saved().web.srNight,0);
btn(/추천하기/).click();assert.equal(saved().web.rec['sr-pc22'],1);assert.ok(has('추천 완료',pg()));
api.navigate({type:'story',portal:'w-sorum',id:'camp2'});assert.ok(has('연재 목록',pg())&&has('다음 편 보기',pg())&&has('이전 편',pg()));btn(/다음 편 보기/).click();assert.ok(has('(3/3)',pg())&&has('(완결)',pg()));
assert.equal(JSON.stringify(longs.find(x=>x.id==='camp3').trap.slice(0,2)),'["time","child"]','마지막 편은 시간이 지나면 귀신');
assert.ok(has('[야간알바생]',(api.navigate({type:'story',portal:'w-sorum',id:'pc22'}),pg())),'닉네임 댓글');
w.WebGhost.stop();
/* 8. 어린이 포털 화면 */
api.navigate({type:'read',portal:'jr'});assert.ok(cls('k-readtable').length===1&&has('읽는 시간',pg()||root),'주니어 읽을거리 표');assert.ok(cls('k-chip').length>=6,'분야 고르기');
api.navigate({type:'read',portal:'jr',query:'우주'});assert.ok(find(n=>n.classList.contains('k-readtable')).textContent.includes('북극성')&&!find(n=>n.classList.contains('k-readtable')).textContent.includes('월드컵'));
api.navigate({type:'item',portal:'jr',id:'jr-r8'});assert.ok(cls('k-fact').length===1&&cls('k-related').length===1&&cls('k-sub').length>=2,'알고 있나요, 함께 읽어요, 소제목');assert.ok(find(n=>n.classList.contains('k-named')&&n.textContent.includes('별지기')),'이름 붙은 댓글');
api.navigate({type:'read',portal:'yk'});assert.ok(cls('ky-readcard').length===10,'꾸러기 백과 카드');assert.ok(cls('ky-tab').length===8);
api.navigate({type:'home',portal:'yk'});assert.ok(cls('ky-readbox').length===1);api.navigate({type:'home',portal:'jr'});assert.ok(cls('kj-read').length===1);
api.navigate({type:'item',portal:'yk',id:'yk-b9'});assert.ok(find(n=>n.classList.contains('k-named')&&n.textContent.includes('꾸러기지킴이')));
/* 9. 소설나라 */
api.navigate({type:'home',portal:'w-novel'});assert.ok(has('인기 소설 TOP 10',pg())&&cls('nv-rank').length>=10);
api.navigate({type:'novel',portal:'w-novel'});assert.ok(has('작가의 말',pg())&&has('5월 30일',pg()),'작가의 말에 약속한 날 (복선)');
api.navigate({type:'read',portal:'w-novel',id:'3'});assert.ok(has('오후 4시 30분',pg())&&has('철봉',pg()));btn(/이 회차 추천하기/).click();assert.equal(saved().web.rec['nv-3'],1);
{const f=find(n=>n.tagName==='FORM'&&n.classList.contains('ws-form'));const [nick,txt]=f.children;nick.value='독자';txt.value='별이 꼭 왔으면';f.emit('submit');assert.ok(saved().web.cm['nv-3'][0].includes('별이 꼭 왔으면'))}
api.navigate({type:'novel',portal:'w-novel',id:'o1'});assert.ok(has('정회원만',pg()));
/* 10. 하늘반 */
api.navigate({type:'home',portal:'w-class'});assert.ok(has('알림장',pg())&&has('4시 30분',pg()));
api.navigate({type:'album',portal:'w-class'});assert.ok(cls('cl-xbox').length===6&&has('2004.05.30',pg()),'엑스박스 사진첩과 옛 사진');
api.navigate({type:'post',portal:'w-class',id:'b4'});assert.ok(has('바다소라',pg())&&has('링크천국',pg())&&has('[정다운쌤]',pg()),'친구 찾는 글과 선생님 댓글');
/* 11. 이모티콘 세상 */
api.navigate({type:'list',portal:'w-emo',query:'그림 문자'});assert.ok(cls('em-chip').some(x=>x.classList.contains('art')),'그림 문자');
api.navigate({type:'name',portal:'w-emo',query:'소라'});assert.ok(cls('em-name').length>=11,'꾸미기 결과');btn('버디버디 대화명으로').click();assert.equal(saved().xp.nick,'★彡 소라 彡★','버디버디 대화명이 바뀜');
api.navigate({type:'alien',portal:'w-emo',query:'사랑해'});assert.ok(has('ㅅrㄹrㅇㅎH',pg()));
/* 12. 미스터리 X파일 */
api.navigate({type:'ufo',portal:'w-xfile'});assert.ok(has('별지기',pg())&&has('2년 만에 도시에',pg()),'UFO 제보에 별지기 (복선)');
api.navigate({type:'esp',portal:'w-xfile'});for(let i=0;i<25;i++){btn('○').click()}await wait(40);assert.ok(has('결과: 25번 중',pg()),'초능력 테스트 결과');assert.ok(Number.isFinite(saved().web.esp));
/* 13. 다른 사이트의 복선 */
api.navigate({type:'home',portal:'w-links'});const rv=find(n=>n.classList.contains('revive'));assert.ok(rv&&rv.textContent.includes('별이네 다락방'),'링크천국 죽은 링크에 다락방');rv.click();for(let i=0;i<40&&!WS.sites['w-star'];i++)await wait(5);let guard=0;while(!find(n=>n.classList.contains('ws-star'))&&guard++<200)await wait(5);assert.ok(find(n=>n.classList.contains('ws-star')),'연결 시도 뒤 다락방이 열림');
api.navigate({type:'room',portal:'w-chat',id:'0'});assert.ok(D.chat.lines.some(t=>t.includes('별지기')));WS.stop();
assert.ok(D.hompy.guest.some(([n])=>n==='별지기'),'하늘이 방명록에 별지기');
const kin=w.PortalBoards.records.find(x=>x.id==='naver-kin-capsule');assert.ok(kin&&kin.body.includes('5월 30일 오후 4시 반'),'네이버 지식iN 타임캡슐 질문');
/* 14. 포털 검색 '사이트' 칸 */
api.navigate({type:'search',portal:'naver',query:'타임캡슐'});assert.ok(cls('p94-sites').length===1&&has('6학년 2반 하늘반'),'사이트 검색 결과');assert.ok(has('2년 전에 묻은 타임캡슐'),'지식iN 결과');
api.navigate({type:'search',portal:'naver',query:'외계어'});assert.ok(has('이모티콘 세상'),'다른 글이 없어도 사이트만 나옴');assert.ok(!has('검색결과가 없습니다'));
api.navigate({type:'search',portal:'naver',query:'별이네 다락방'});assert.ok(!cls('p94-sites').length,'숨은 사이트는 검색 안 됨');
/* 15. 별이네 다락방 풀기 */
api.navigate({type:'home',portal:'w-star'});assert.ok(has('LAST UPDATE 2004.06.17',pg()));const v0=saved().web.star.visits;btn(/사다리 타고/).click();assert.equal(saved().web.star.visits,v0+1,'방문 수');assert.ok(has('TOTAL',pg()));
api.navigate({type:'about',portal:'w-star'});const hid=find(n=>n.classList.contains('st-hidden'));assert.ok(hid&&hid.textContent.includes('첫 번째 열쇠'),'흰 글씨 숨은 글');find(n=>n.classList.contains('st-hidebox')).emit('dblclick');assert.ok(find(n=>n.classList.contains('st-hidebox')).classList.contains('peek'),'두 번 누르면 살짝 보임');
api.navigate({type:'diary',portal:'w-star'});assert.ok(has('5월 30일 오후 4시 30분',pg())&&has('2006.05.29',pg()));
api.navigate({type:'album',portal:'w-star'});const sky=find(n=>n.classList.contains('st-sky'));sky.emit('click',{clientX:10,clientY:300});assert.ok(has('그냥 별이야',pg()));sky.emit('click',{clientX:Math.round(300*480/400),clientY:Math.round(170*320/260)});assert.ok(has('북두칠성 별이야',pg()),'북두칠성 별 힌트');
sky.emit('click',{clientX:Math.round(w.WebMore.POLARIS.x*480/400),clientY:Math.round(w.WebMore.POLARIS.y*320/260)});assert.equal(saved().web.star.polaris,1,'북극성을 찾음');assert.ok(has('북극성이야',pg()));
btn('이 사진을 내 그림으로 저장').click();assert.ok(api.modules.shell.state().pics.includes('별이네 북두칠성.png'),'내 그림에 저장');btn('바탕 화면으로 설정').click();assert.equal(api.modules.shell.state().wallpaper,'image','다락방 별 사진 바탕 화면');
api.navigate({type:'room',portal:'w-star'});const doorForm=()=>find(n=>n.tagName==='FORM'&&n.classList.contains('st-form'));
const tryKey=v=>{const f=doorForm();f.children[0].value=v;f.emit('submit')};
tryKey('시리우스');assert.ok(has('땡!',pg()));tryKey('금성');tryKey('달');assert.ok(has('힌트',pg()),'틀리면 힌트');
tryKey(' 북극성 ');assert.equal(saved().web.star.door1,1,'첫 번째 문');assert.ok(has('두 번째 문',pg()));
tryKey('1234');assert.ok(has('땡!',pg()));tryKey('5월 30일');assert.equal(saved().web.star.done,1,'두 번째 문과 비밀의 방');
assert.ok(has('2006년 5월 29일에 덧붙임',pg())&&has('그거 나야',pg())&&has('별이가 오고 있다고',pg()),'편지와 덧붙임');
const lines=cls('st-first').map(x=>x.textContent).join('');assert.equal(lines,'소라야고마워','세로로 읽으면 소라야 고마워');btn('세로로 읽기').click();assert.ok(find(n=>n.classList.contains('st-letter')).classList.contains('vert'));
assert.ok(saved().web.star.wrong>=4,'틀린 횟수');
api.navigate({type:'guest',portal:'w-star'});assert.ok(has('지금 교문 앞이야',pg())&&has('철봉 앞이야',pg()),'풀고 나면 방명록에 새 글');
api.navigate({type:'main',portal:'w-star'});assert.ok(has('문이 열렸어요',pg()));
/* 오른쪽 클릭: 소스 보기 */
pg().emit('contextmenu',{clientX:50,clientY:50});const menu=find(n=>n.classList.contains('xp-menu'));assert.ok(menu&&has('소스 보기',menu),'오른쪽 단추 메뉴');btn(/소스 보기/,menu).click();assert.ok(find(n=>n.classList.contains('st-src')&&n.textContent.includes('하나는 하늘에 있고')),'소스에 숨은 주석');
/* 16. 다시 켜도 남음 */
api.destroy();const api2=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});api2.navigate({type:'room',portal:'w-star'});assert.ok(has('별이네 다락방의 비밀을 모두 풀었습니다',pg()),'푼 기록이 남음');api2.destroy();
console.log('PASS A94 kids reading (20 articles, 6 stories), sorum long stories (series, night mode, slow ending, rec), 4 new sites + hidden mystery site, cross-site clues, portal site search, era words');
})().catch(e=>{console.error(e);process.exit(1)});
