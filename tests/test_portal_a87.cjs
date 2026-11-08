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
const KEY='2006_xp_desktop_v1';
const text=()=>root.textContent;
const portals=['naver','daum','yahoo'];
const recs=[...news.records,...boards.records];
/* 1. 분량: 기사는 여러 문단, 글은 한두 줄이 아니다 */
for(const r of news.records.filter(x=>x.type==='뉴스')){const paras=r.body.split(/\n\s*\n/).length;const min=r.section==='이벤트'?250:380;assert.ok(r.body.length>=min,r.id+' article too short: '+r.body.length);assert.ok(paras>=(r.section==='이벤트'?3:4),r.id+' paragraphs '+paras);assert.ok((r.replies||[]).length>=4,r.id+' replies')}
for(const r of boards.records.filter(x=>x.type==='카페')){assert.ok(r.body.length>=100,r.id+' post too short: '+r.body.length);assert.ok((r.replies||[]).length>=3,r.id+' replies')}
for(const r of boards.records.filter(x=>x.type==='지식iN')){assert.ok((r.answers||[]).length>=1&&r.answers.every(a=>a.text.length>=25),r.id+' answers');const pk=r.answers.find(a=>a.pick);assert.ok(pk&&pk.text.length>=80,r.id+' picked answer is too short')}
/* 2. 그 시절 말투가 들어 있고, 그 시절에 없던 말은 없다 */
const corpus=recs.map(r=>[r.body,...(r.replies||[]).map(x=>typeof x==='string'?x:x.t),...(r.answers||[]).map(a=>a.text)].join('\n')).join('\n');
for(const tok of ['ㅎㅎ','ㅋㅋ','ㅠㅠ','--;','ㅡㅡ','OTL','^^','열공','피방','눈팅','퍼가','냉무','지름','ㄴ ','ㅜㅜ','냉무','지름','출첵','방가','ㄱㄱ','덧글','리플'])assert.ok(corpus.includes(tok),'missing period speech: '+tok);
for(const bad of ['스마트폰','트위터','페이스북','카카오톡','유튜브','아이폰','갤럭시','인스타','LTE','4G','5G','넷플릭스','코로나','—'])assert.ok(!corpus.includes(bad)&&!recs.some(r=>r.title.includes(bad)),'anachronism '+bad);
/* 3. 2005년과 2006년 앞쪽 날짜도 입력 시각과 목록 표기가 맞다 */
const old=news.records.filter(r=>/^\d\d\.\d\d\.\d\d /.test(r.at));assert.ok(old.length>=4,'older articles');
api.navigate({type:'article',id:'naver-kimchi',portal:'naver'});assert.ok(text().includes('입력 2005.10.31 09:30'));assert.ok(cls('p86-reply-meta').every(m=>/^05\.10\.31 /.test(m.textContent)),'old article replies keep the old date');
api.navigate({type:'section',query:'생활·문화',portal:'naver'});assert.ok(text().includes('05.10.31')||text().includes('05.10.03')||cls('p87-pager').length,'old stamp or pager');
/* 4. 기사 앞머리, 저작권, 글자 크기, 많이 본 뉴스 */
api.navigate({type:'article',id:'naver-election',portal:'naver'});assert.ok(text().includes('【서울=새한일보】')&&text().includes('ⓒ 새한일보 무단전재 및 재배포 금지')&&text().includes('이 시각 많이 본 뉴스'));
const wrap=cls('p87-articlebody')[0];assert.ok(wrap);button('글자 크게').click();assert.ok(wrap.classList.contains('big'));button('글자 작게').click();assert.ok(!wrap.classList.contains('big'));button('글자 작게').click();assert.ok(wrap.classList.contains('small'));
assert.ok(cls('p86-para').length>=5,'long article body');
/* 5. 대댓글 */
api.navigate({type:'post',id:'daum-agora-pcbang',portal:'daum'});const nested=cls('p87-nested');assert.ok(nested.length>=1,'nested replies');assert.ok(nested.every(n=>!/ㄴ /.test(n.textContent)&&n.textContent.includes('└')));
/* 6. 목록 쪽 넘기기 */
api.navigate({type:'cafe',portal:'daum'});assert.ok(text().includes('/ 2 쪽'),'daum cafe pager');const rows1=cls('p86-row').length;assert.ok(rows1>=12);const firstTitle=cls('p86-subject')[cls('p86-subject').length-1].textContent;button('다음 ▶').click();assert.ok(text().includes('2 / 2 쪽'));assert.notEqual(cls('p86-subject').at(-1).textContent,firstTitle);button('◀ 이전').click();assert.ok(text().includes('1 / 2 쪽'));
api.navigate({type:'cafe',portal:'naver'});assert.ok(text().includes('/ 2 쪽'));
api.navigate({type:'section',query:'생활·문화',portal:'naver'});assert.ok(text().includes('쪽'),'section pager');
/* 7. 홈 화면이 비어 보이지 않는다 */
for(const p of portals){
 api.navigate({type:'home',portal:p});const t=text();
 for(const label of ['많이 본 뉴스','오늘의 운세','넌센스 퀴즈','오늘의 투표','오늘의 영어 한마디','이벤트 · 알림','많이 읽은 글'])assert.ok(t.includes(label),p+' home lacks '+label);
 assert.ok(cls('p83-news-line').length>=5,p+' news desk has '+cls('p83-news-line').length+' lines');
 assert.ok(cls('xp79-portal-box').length>=12,p+' home modules '+cls('xp79-portal-box').length);
 /* 운세 */
 button('범').click();assert.ok(text().includes('범띠')&&text().includes('행운의 숫자'));assert.equal(JSON.parse(memory.get(KEY)).fortune,'범');
 /* 넌센스 퀴즈 */
 api.navigate({type:'home',portal:p});button('정답 보기').click();assert.ok(text().includes('정답  '));const q1=cls('p87-q').find(n=>n.textContent.startsWith('Q.')).textContent;button('다음 문제 ▶').click();assert.notEqual(cls('p87-q').find(n=>n.textContent.startsWith('Q.')).textContent,q1);
 /* 투표 */
 api.navigate({type:'home',portal:p});const opt=cls('p87-opt').find(n=>n.textContent.startsWith('○ '));assert.ok(opt,p+' poll option');opt.click();assert.ok(text().includes('(내 선택)')&&text().includes('참여 ')&&cls('p87-bar').length>=3);assert.ok(new RegExp(p+'=0').test(JSON.parse(memory.get(KEY)).snackVote),'vote saved');
}
/* 새로 고쳐도 투표와 운세가 남는다 */
api.destroy?.();const api2=w.XPDesktop.mount(root,{boot:false,seat:17});api2.navigate({type:'home',portal:'naver'});assert.ok(text().includes('(내 선택)')&&text().includes('범띠'),'persisted poll and fortune');
/* 8. 홈 링크는 모두 내용이 있는 곳으로 간다 */
for(const p of portals){api2.navigate({type:'home',portal:p});const btns=cls('xp79-web-link').filter(b=>b.listeners&&b.listeners.click);assert.ok(btns.length>=30,p+' home links');}
console.log('PASS A87 longer articles/posts/answers, period speech and no anachronisms, 2005 dates, dateline/copyright/font size, nested replies, pagination, filled home modules (fortune, quiz, poll persisted)');
