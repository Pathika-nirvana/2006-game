'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c},remove:c=>this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' '),toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);if(n.parentNode===this)this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return{scale(){}}}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);const memos=[];let logouts=0,fetches=0;const w={document:doc,Date,URL,encodeURIComponent,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add:(...a)=>memos.push(a)},fetch:()=>{fetches++;throw Error('external browsing forbidden')}};w.window=w;
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/xp-desktop.js'),'utf8'),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x};
const DISCLAIMER='※ 이 화면은 게임 속에 만든 가상 인터넷입니다.';
const BANNED=['재구성','게임 속','실제 당시','판매 페이지','분위기를 참고해','—','AI','요금 가입이나 결제 없이','예시 날씨'];
const clean=()=>(cls('xp79-portal')[0]?cls('xp79-portal')[0].textContent:'').replace(DISCLAIMER,'');
const NOWV=(()=>{const f=(s)=>{if(/^\d\d:\d\d$/.test(s))s='05.30 '+s;const m=/^(?:(\d\d)\.)?(\d\d)\.(\d\d) (\d\d):(\d\d)$/.exec(s);const yr=m[1]?2000+ +m[1]:2006;return ((((yr-2006)*12+(+m[2]-5))*31+ +m[3])*1440)+ +m[4]*60+ +m[5]};f.now=f('05.30 16:32');return f})();
const news=w.PortalNews,boards=w.PortalBoards;
let api=w.XPDesktop.mount(root,{boot:false,seat:17});
const portals=['naver','daum','yahoo'];
/* 1. 자료 점검: id 중복, 시각, 인기검색어 */
const ids=new Set();for(const r of [...news.records,...boards.records]){assert.ok(!ids.has(r.id),'dup id '+r.id);ids.add(r.id);assert.ok(['naver','daum','yahoo'].includes(r.owner),r.id);assert.ok(/^((\d\d\.)?\d\d\.\d\d )?\d\d:\d\d$/.test(r.at),'at '+r.id);const v=NOWV(r.at);assert.ok(v<=NOWV.now,'future article '+r.id);assert.ok(r.body&&r.title&&r.tags,r.id)}
for(const p of portals){const prof=news.profiles[p];assert.equal(prof.trend.length,10,p+' trend');assert.equal(prof.delta.length,10);
 for(const term of prof.trend){api.navigate({type:'search',query:term,portal:p});const hits=cls('xp79-search-hit');assert.ok(hits.length>=1,p+' search has no hit: '+term)}}
/* 2. 모든 화면에 금지 표현이 없고 그림 파일이 있다 */
function visit(route,label){api.navigate(route);const text=clean();for(const bad of BANNED)assert.ok(!text.includes(bad),label+' contains banned text '+bad);for(const im of all(cls('xp79-portal')[0]||root).filter(n=>n.tagName==='IMG'&&n.src&&!n.src.startsWith('data:')))assert.ok(fs.existsSync(path.join(__dirname,'..',im.src.split('?')[0])),label+' missing image '+im.src)}
for(const p of portals){
 visit({type:'home',portal:p},p+' home');
 for(const t of ['mail','weather','shopping','cafe','knowledge','gameweb','minihome','comics'])visit({type:t,portal:p},p+' '+t);
 for(const q of ['주요뉴스','IT·과학','생활·문화','속보','토론','UCC','거기','위젯','스포츠','경제·생활','종합뉴스','통합검색'])visit({type:'section',query:q,portal:p},p+' section '+q);
 visit({type:'unavailable',query:'http://www.example.com',portal:p},p+' unavailable');assert.ok(root.textContent.includes('페이지를 표시할 수 없습니다')&&root.textContent.includes('HTTP 404'));
 visit({type:'search',query:'없는검색어xyz',portal:p},p+' nohit');assert.ok(root.textContent.includes('검색결과가 없습니다'));
 for(const r of [...news.records,...boards.records].filter(x=>x.owner===p)){
  const type=r.type==='카페'?'post':r.type==='지식iN'?'question':'article';visit({type,id:r.id,portal:p},p+' '+r.id);
  /* 댓글 시각은 글보다 늦고 16:32 이전이어야 한다 */
  const base=NOWV(r.at);let last=base;
  for(const m of cls('p86-reply-meta')){const t=/^((?:\d\d\.)?\d\d\.\d\d \d\d:\d\d)/.exec(m.textContent);if(!t)continue;const v=NOWV(t[1]);if(m.textContent.startsWith('05.30 16:32')&&!(r.replies||[]).length)continue;assert.ok(v<=NOWV.now,r.id+' reply in future');assert.ok(v>=base,r.id+' reply before article');}
 }
}
/* 3. 상품 후기 화면: 사용자가 지적한 문구가 사라졌다 */
api.navigate({type:'article',id:'naver-ad-phone',portal:'naver'});let t=clean();for(const bad of ['슬라이드를 올리면 숫자 키패드가 드러나고, 닫으면 검은 전면과 붉은 터치 조명이 남는다','2006년의 휴대전화 광고는','새로 만든 게임 속 광고','요금 가입이나 결제 없이'])assert.ok(!t.includes(bad),'old phrase '+bad);
assert.ok(t.includes('구매자 사용기')&&t.includes('지문')&&t.includes('상품 정보')&&t.includes('대리점별 상이'));
/* 4. 메일: 받은메일함/스팸메일함 전환, 읽음 처리, 상세 보기 */
api.navigate({type:'mail',portal:'naver'});assert.ok(root.textContent.includes('스팸메일함'));const before=root.textContent.match(/받은메일함 \((\d+)\//)[1];button('[공지] 이번 주 토요일 정모 장소 안내').click();assert.ok(root.textContent.includes('신촌 역 3번 출구'));button('◀ 목록으로').click();const after=root.textContent.match(/받은메일함 \((\d+)\//)[1];assert.equal(+after,+before-1,'unread count drops after reading');
button(root.textContent.match(/스팸메일함 \(\d+\)/)[0]).click();assert.ok(root.textContent.includes('(광고)'));
/* 5. 하단과 공지줄 */
api.navigate({type:'home',portal:'daum'});assert.ok(cls('p86-notice').length===1&&cls('p86-footer').length===1);assert.ok(root.textContent.includes('Copyright © 2006 Daum'));
/* 6. 인기검색어 증감 표시와 포털별 차이 */
api.navigate({type:'home',portal:'naver'});assert.ok(cls('p86-delta').length>=4);const rn=cls('p83-ranking')[0].textContent;api.navigate({type:'home',portal:'yahoo'});assert.notEqual(rn,cls('p83-ranking')[0].textContent);
/* 7. 만화 독자 한마디 */
api.navigate({type:'comic',id:'offline-01',portal:'naver'});assert.ok(cls('xp79-comment').length>=3);
api.destroy();
console.log('PASS A86 portal news/boards/mail/weather/ads: unique ids, no future stamps, every trend term has hits, no meta wording on any page, images exist, replies after article and before 16:32, mail tabs/read state, notice/footer, comic reader comments');
