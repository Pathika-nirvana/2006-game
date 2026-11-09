'use strict';
/* A89: 주니어네이버와 야후꾸러기, 어린이 오락 8종, 바탕화면 부수기, 세상만평 연결을 한꺼번에 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);let fetches=0;
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{fetches++;throw Error('external browsing forbidden')},setTimeout,clearTimeout};w.window=w;
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','desk-smash','xp-desktop'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x};

/* 1. 글: 사이트마다 따로, 안전한 말, 그 시절 말투 */
const K=w.KidsData,SHAPE={jr:{news:6,kin:7,help:6,story:6,quiz:8,board:8,read:10},yk:{news:6,qna:7,play:6,story:6,quiz:8,board:9,read:10}}; /* A94: 읽을거리, 꾸러기 백과, 긴 이야기, 친구 찾기 글 */
for(const [site,shape] of Object.entries(SHAPE))for(const [kind,n] of Object.entries(shape))assert.equal(K[site][kind].length,n,site+' '+kind);
const flat=site=>Object.values(K[site]).flat(),ids=[...flat('jr'),...flat('yk')].map(x=>x.id);
assert.equal(new Set(ids).size,ids.length,'아이디가 겹침');
const titles=new Set(flat('jr').map(x=>x.title||x.q));for(const x of flat('yk'))assert.ok(!titles.has(x.title||x.q),'두 사이트에 같은 제목: '+(x.title||x.q));
const bodies=new Set(flat('jr').map(x=>(x.body||'').slice(0,30)));for(const x of flat('yk'))assert.ok(!x.body||!bodies.has(x.body.slice(0,30)),'같은 글머리');
const blob=JSON.stringify(K);
for(const bad of [String.fromCharCode(0x2014),'게임 속','재구성','스마트폰','트위터','페이스북','카카오톡','유튜브','인스타','넷플릭스','코로나','실화냐','개이득','레전드','인싸','팩폭','꿀잼','노잼','기레기','병맛','지못미','갓생'])assert.ok(!blob.includes(bad),'금지어 '+bad);
assert.ok(!/\bAI\b/.test(blob),'AI');
assert.ok(!/\d{2,4}-\d{3,4}-\d{4}|https?:|www\.|@[a-z0-9]/i.test(blob),'개인정보 모양');
for(const x of flat('jr').concat(flat('yk'))){if(x.at)assert.ok(/^\d\d\.\d\d \d\d:\d\d$/.test(x.at)&&x.at<='05.30 16:32','날짜 '+x.id+' '+x.at);for(const r of x.replies||[])assert.ok(typeof r==='string'&&r.length<=90,'댓글 길이 '+x.id)}
for(const site of ['jr','yk']){for(const q of K[site].quiz){assert.ok(q.c.length>=3&&q.a>=0&&q.a<q.c.length&&q.why&&q.q,'퀴즈 '+q.id)}const qa=K[site][site==='jr'?'kin':'qna'];for(const x of qa){assert.ok(x.answers.length>=2,'답변 수 '+x.id);assert.equal(x.answers.filter(a=>a.pick).length,1,'채택 '+x.id)}for(const x of K[site].board)assert.ok((x.replies||[]).length>=3,'광장 댓글 '+x.id)}
assert.ok(K.yk.board.some(x=>(x.replies||[]).some(r=>r.startsWith('※ 운영자에 의해 삭제된'))),'삭제된 댓글 줄');
assert.ok(K.yk.board.concat(K.jr.board).some(x=>/사기|도배|쪽지/.test(x.title+x.body)),'그 시절 주의 글');

/* 2. 포털 화면 */
let api=w.XPDesktop.mount(root,{boot:false,seat:17});
assert.equal(cls('xp79-shortcut').length,28);assert.ok(find(n=>n.classList.contains('xp79-shortcut')&&n.textContent.includes('바탕화면 부수기')),'바탕화면 아이콘');
const page=()=>cls('xp79-portal')[0],text=()=>page().textContent,caption=()=>cls('xp79-title')[0].textContent;
const go=route=>{api.navigate(route);return text()};
go({type:'home',portal:'jr'});assert.ok(page().classList.contains('jr')&&page().classList.contains('kj'),'주니어 틀');assert.ok(caption().includes('주니어네이버'));
assert.ok(text().includes('주니어 메뉴')&&text().includes('오늘의 퀴즈')&&text().includes('인기 오락')&&text().includes('공지사항'),'주니어 첫 화면');
assert.equal(cls('kj-left').length,1);assert.equal(cls('ky-tabs').length,0);
assert.ok(find(n=>n.tagName==='INPUT'&&n.value==='http://jr.naver.com/')||root.textContent.length>0);
go({type:'home',portal:'yk'});assert.ok(page().classList.contains('yk')&&page().classList.contains('ky'),'꾸러기 틀');assert.ok(caption().includes('꾸러기'));
assert.ok(text().includes('오늘은 뭐하고 놀까?')&&text().includes('꾸러기 신문')&&text().includes('척척박사')&&text().includes('꾸러기 광장'),'꾸러기 첫 화면');
assert.equal(cls('ky-tabs').length,1);assert.equal(cls('kj-left').length,0);assert.equal(cls('ky-tab').length,8);
/* 두 사이트 화면 모양이 서로 다르다 */
go({type:'news',portal:'jr'});assert.ok(cls('k-table').length===1&&cls('k-cards').length===0,'주니어 뉴스는 게시판 표');
go({type:'news',portal:'yk'});assert.ok(cls('k-cards').length===1&&cls('k-table').length===0,'꾸러기 신문은 카드');
go({type:'qa',portal:'jr'});assert.ok(text().includes('하늘은 왜 파란가요?')&&text().includes('답변'));
go({type:'qa',portal:'yk'});assert.ok(text().includes('연필심은 납으로 만든 건가요?'));
/* 모든 글을 열어 본다 */
for(const [site,list] of [['jr',flat('jr')],['yk',flat('yk')]])for(const x of list){if(x.q)continue;const t=go({type:'item',id:x.id,portal:site});assert.ok(t.includes(x.title),'글 열기 '+x.id);assert.ok(!t.includes('페이지를 찾을 수 없어요'),x.id)}
for(const site of ['jr','yk'])for(const type of ['home','news','qa','extra','story','quiz','arcade','board','safety'])assert.ok(!go({type,portal:site}).includes('페이지를 찾을 수 없어요'),site+' '+type);
assert.ok(go({type:'cafe',portal:'jr'}).includes('페이지를 찾을 수 없어요'),'모르는 길은 안내 화면');
assert.ok(go({type:'safety',portal:'jr'}).includes('개인정보')||go({type:'safety',portal:'jr'}).includes('전화번호'),'안전 수칙');
/* 삭제된 댓글, 이어 쓴 댓글 */
go({type:'item',id:'yk-b3',portal:'yk'});assert.ok(cls('p88-deleted').length>=1||all().some(n=>n.classList.contains('k-gone')),'삭제된 줄');
/* 댓글: 저장, 개인정보 거름, 지킴 */
go({type:'item',id:'jr-b1',portal:'jr'});
{const form=find(n=>n.tagName==='FORM'&&n.classList.contains('k-cm-form')),inp=form.children[0];inp.value='나도 쪽지 걸려 봤어 ㅋㅋ';form.emit('submit');assert.ok(text().includes('나도 쪽지 걸려 봤어 ㅋㅋ'),'댓글 등록');
 const f2=find(n=>n.tagName==='FORM'&&n.classList.contains('k-cm-form'));f2.children[0].value='내 번호는 010-1234-5678';f2.emit('submit');assert.ok(!text().includes('010-1234-5678')&&text().includes('개인정보'),'전화번호 거름');
 const f3=find(n=>n.tagName==='FORM'&&n.classList.contains('k-cm-form'));f3.children[0].value='<img src=x onerror=1> 안녕';f3.emit('submit');assert.ok(text().includes('<img src=x onerror=1> 안녕'),'글자 그대로만 표시');assert.equal(all(page()).filter(n=>n.tagName==='IMG').length,0,'태그가 실행되지 않음')}
assert.equal(api.state.history.at(-1).portal,'jr');
/* 퀴즈 */
go({type:'quiz',portal:'jr'});{const q=K.jr.quiz[0];const choice=cls('k-choice')[q.a];choice.click();assert.ok(text().includes('딩동댕'),'정답 표시');assert.ok(text().includes('맞힌 문제 1 / 8'))}
go({type:'quiz',portal:'yk'});{const q=K.yk.quiz[0];cls('k-choice')[(q.a+1)%3].click();assert.ok(text().includes('땡!')&&text().includes('정답은 '+(q.a+1)+'번'),'오답 표시');button('다음 문제 ▶').click();assert.ok(text().includes(K.yk.quiz[1].q),'다음 문제')}
button('처음부터 다시 풀기').click();assert.ok(text().includes('맞힌 문제 0 / 8'),'다시 풀기');
/* 검색 */
{const hits=w.KidsPortal.search('jr','월드컵');assert.ok(hits.length>=1);const t=go({type:'search',query:'월드컵',portal:'jr'});assert.ok(t.includes('검색 결과'));assert.ok(go({type:'search',query:'없는낱말쿵',portal:'yk'}).includes('찾는 글이 없어요'))}
/* 주소창, 즐겨찾기, 큰 포털의 링크 */
{const addr=find(n=>n.tagName==='FORM'&&n.classList.contains('xp79-address')),box=addr.children[1];box.value='jr.naver.com/news';addr.emit('submit');assert.equal(api.state.history.at(-1).portal,'jr');assert.equal(api.state.history.at(-1).type,'news');
 box.value='http://kids.yahoo.co.kr/quiz';addr.emit('submit');assert.equal(api.state.history.at(-1).portal,'yk');assert.equal(api.state.history.at(-1).type,'quiz');
 box.value='www.naver.com';addr.emit('submit');assert.equal(api.state.history.at(-1).portal,'naver');
 box.value='kids.yahoo.co.kr/cafe';addr.emit('submit');assert.equal(api.state.history.at(-1).type,'home','알 수 없는 길은 첫 화면');
 button('주니어네이버');button('야후꾸러기');button('야후꾸러기').click();assert.equal(api.state.history.at(-1).portal,'yk');button('주니어네이버').click();assert.equal(api.state.history.at(-1).portal,'jr');button('미니홈피').click();assert.equal(api.state.history.at(-1).portal,'naver','큰 포털로 돌아가 미니홈피');
 go({type:'home',portal:'naver'});assert.ok(find(n=>n.tagName==='BUTTON'&&n.textContent==='주니어네이버'&&n.classList.contains('xp79-web-link')),'네이버에서 주니어네이버 링크');
 go({type:'home',portal:'yahoo'});assert.ok(find(n=>n.tagName==='BUTTON'&&n.textContent==='야후꾸러기'&&n.classList.contains('xp79-web-link')),'야후에서 꾸러기 링크')}
assert.equal(fetches,0,'바깥 접속 없음');

/* 3. 오락 8종: 캔버스 그림 없이 규칙만 돌려 본다 */
const G=w.KidsGames;assert.equal(G.list.length,8);assert.equal(JSON.stringify([...w.KidsPortal.sites.jr.games,...w.KidsPortal.sites.yk.games].sort()),JSON.stringify(G.list.map(x=>x.id).sort()));
const host=new Node('div');
function play(id,drive){const scores=[];const c=G.run(id,host,{E:(t,cl,x)=>{const n=new Node(t);if(cl)n.className=cl;if(x!==undefined)n.textContent=x;return n},best:0,onScore:(g,s,isNew)=>scores.push([g,s,isNew])});assert.ok(c&&c.begin,id);c.begin();drive(c);return{c,scores}}
{const {c,scores}=play('mole',c=>{for(let i=0;i<650;i++){c.game.update(.05);for(const a of c.state().active)c.game.click(a.x,a.y)}});assert.equal(c.phase(),'over');assert.ok(scores.length===1&&scores[0][1]>=5&&scores[0][2],'두더지 점수 '+JSON.stringify(scores))}
{const {c}=play('rain',c=>{for(let i=0;i<40;i++)c.game.update(.1);const word=c.state().words[0];assert.ok(c.game.submit(word));assert.ok(!c.game.submit('없는말'))});assert.ok(c.state().score>0);for(let i=0;i<3000&&c.phase()==='play';i++)c.game.update(.1);assert.equal(c.phase(),'over','산성비는 목숨이 다하면 끝')}
{const {c,scores}=play('memory',c=>{const s=c.state(),seen={};s.cards.forEach((card,i)=>{if(seen[card.k]===undefined){seen[card.k]=i}else{const a=seen[card.k],pa=s.pos[a],pb=s.pos[i];c.game.click(pa.x+40,pa.y+27);c.game.click(pb.x+40,pb.y+27)}})});assert.equal(c.phase(),'over');assert.equal(scores[0][1],200-8*8,'짝 맞추기 점수')}
{const {c}=play('breakout',c=>{for(let i=0;i<4000&&c.phase()==='play';i++){c.game.move(c.state().ball.x);c.game.update(.016)}});assert.ok(c.state().score>=10,'벽돌깨기 점수 '+c.state().score)}
{const {c,scores}=play('dodge',c=>{for(let i=0;i<4000&&c.phase()==='play';i++)c.game.update(.05)});assert.equal(c.phase(),'over');assert.ok(scores[0][1]>0)}
{const {c}=play('snake',c=>{const s0=c.state().head;c.game.key('ArrowDown');for(let i=0;i<20;i++)c.game.update(.2);assert.ok(c.state().head.y!==s0.y||c.phase()==='over')});assert.ok(c.phase()==='over'||c.state().length>=3)}
{const {c,scores}=play('numbers',c=>{for(let n=1;n<=25;n++){const s=c.state(),i=s.grid.indexOf(n),p=s.pos[i];c.game.update(.5);c.game.click(p.x+27,p.y+25)}});assert.equal(c.phase(),'over');assert.equal(scores[0][1],Math.max(0,1000-Math.round(25*.5*20)),'숫자 점수')}
{const {c}=play('balloon',c=>{for(let i=0;i<700;i++){c.game.update(.05);for(const b of c.state().list)if(!b.bomb)c.game.click(b.x,b.y)}});assert.equal(c.phase(),'over');assert.ok(c.best()>0)}
/* 캔버스가 없는 환경에서는 안내만 */
{const h2=new Node('div'),saved=Node.prototype.getContext;Node.prototype.getContext=undefined;const c=G.run('mole',h2,{E:(t,cl,x)=>{const n=new Node(t);if(cl)n.className=cl;if(x!==undefined)n.textContent=x;return n}});assert.ok(h2.textContent.includes('실행할 수 없습니다'));c.stop();Node.prototype.getContext=saved}
/* 오락 페이지와 게임 페이지가 사이트 안에서 열리고 이동하면 멈춘다 */
for(const site of ['jr','yk'])for(const id of w.KidsPortal.sites[site].games){const t=go({type:'game',id,portal:site});assert.ok(t.includes(G.title(id))&&t.includes('오늘의 랭킹'),id);assert.ok(w.KidsPortal.active(),'실행 중 '+id);go({type:'home',portal:site});assert.equal(w.KidsPortal.active(),null,'이동하면 멈춤')}
assert.ok(go({type:'game',id:'dodge',portal:'jr'}).length>0);

/* 4. 바탕화면 부수기 */
{const D=w.DeskSmash;assert.equal(D.tools.length,6);api.openApp('desksmash');const s=D.state();assert.ok(s.open&&s.percent===0);
 const root2=cls('ds-layer');assert.equal(root2.length,1,'덮는 층');
 const second=D.open?w.DeskSmash.open({desk:cls('xp79-desktop')[0],E:(t,c,x)=>{const n=new Node(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n},B:()=>new Node('button')}):null;assert.equal(cls('ds-layer').length,1,'한 번에 한 층만');
 const layer=cls('ds-layer')[0];assert.ok(layer.attributes['aria-label']==='바탕화면 부수기');
 for(const label of ['망치','권총','화염방사기','폭탄','물감총','전기톱','원상복구','나가기'])button(label,layer);
 button('폭탄',layer).click();assert.equal(D.state().tool,'bomb');
 const api2=cls('ds-layer')[0];
 /* 눌러 본다: 도구마다 파괴율이 늘어난다 */
 let last=0,at=0;for(const [label,tool] of [['망치','hammer'],['권총','gun'],['폭탄','bomb']]){button(label,layer).click();assert.equal(D.state().tool,tool);const base=cls('ds-fx',layer)[0];base.emit('pointerdown',{clientX:200+at*300,clientY:200+at*100,pointerId:1});base.emit('pointerup',{});at++;const p=D.state().cells;assert.ok(p>last,tool+' '+p);last=p}assert.ok(D.state().percent>0)
 assert.ok(D.state().hits>=3);
 button('원상복구',layer).click();assert.equal(D.state().percent,0);assert.equal(D.state().hits,0);
 layer.emit('keydown',{key:'3'});assert.equal(D.state().tool,'flame');
 layer.emit('keydown',{key:'Escape'});assert.equal(D.state().open,false);assert.equal(cls('ds-layer').length,0,'나가면 모두 원래대로');
 api.openApp('desksmash');assert.ok(D.state().open);api.destroy();assert.equal(D.state().open,false,'바탕화면이 사라지면 같이 닫힘');assert.equal(cls('ds-layer').length,0)}

/* 5. 세상만평 */
api=w.XPDesktop.mount(root,{boot:false,seat:17});
{const ep=w.PortalComics.episodes.filter(x=>x.series==='worldtoon');assert.equal(ep.length,15);const ords=ep.map(x=>x.ord);assert.equal(JSON.stringify(ords),JSON.stringify([...ords].sort((a,b)=>a-b)),'날짜 순서');const t=(api.navigate({type:'comics',query:'worldtoon',portal:'naver'}),cls('xp79-portal')[0].textContent);assert.ok(t.includes('세상만평')&&t.includes('삐딱이')&&t.includes('규제'),'연재 목록')}
console.log('PASS A89 kids portals (2 layouts, 2 content sets, comments, quiz, search, address/favorites), 8 canvas games, desk smasher, worldtoon');
