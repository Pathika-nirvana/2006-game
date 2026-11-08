'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c},remove:c=>this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' '),toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);if(n.parentNode===this)this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return{scale(){}}}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);const memos=[];let logouts=0,fetches=0;const w={document:doc,Date,URL,encodeURIComponent,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add:(...a)=>memos.push(a)},fetch:()=>{fetches++;throw Error('external browsing forbidden')}};w.window=w;
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/xp-desktop.js'),'utf8'),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x};
const DISCLAIMER='※ 이 화면은 게임 속에 만든 가상 인터넷입니다.';
const BANNED=['재구성','게임 속','실제 당시','판매 페이지','분위기를 참고해','—','AI','요금 가입이나 결제 없이','예시 날씨'];
const news=w.PortalNews,boards=w.PortalBoards;
let api=w.XPDesktop.mount(root,{boot:false,seat:17});
const text=()=>(cls('xp79-portal')[0]?cls('xp79-portal')[0].textContent:root.textContent);
const NEWS=['daum-item-fraud','naver-bait','daum-real-name','yahoo-bulpum','naver-p2p','yahoo-account','daum-antis'];
const POSTS=['naver-cafe-bait','naver-cafe-bulpum','naver-cafe-blacklist','daum-agora-realname','daum-cafe-flame','daum-cafe-anti','yahoo-cafe-spamnote'];
const QS=['naver-kin-itemfraud','naver-kin-photo','daum-kin-popup','yahoo-kin-account'];
const by=(list,id)=>list.find(r=>r.id===id);
const nowOf=(s)=>{if(/^\d\d:\d\d$/.test(s))s='05.30 '+s;const m=/^(?:(\d\d)\.)?(\d\d)\.(\d\d) (\d\d):(\d\d)$/.exec(s);const yr=m[1]?2000+ +m[1]:2006;return ((((yr-2006)*12+(+m[2]-5))*31+ +m[3])*1440)+ +m[4]*60+ +m[5]};
const NOW=nowOf('05.30 16:32');
/* 1. 새 기사와 글이 모두 있고, 길이와 시각 규칙을 지킨다 */
for(const id of NEWS){const r=by(news.records,id);assert.ok(r,id);assert.equal(r.type,'뉴스');const paras=r.body.split(/\n\s*\n/).length;assert.ok(paras>=4&&r.body.length>=380,id+' length '+r.body.length+'/'+paras);assert.ok(nowOf(r.at)<=NOW,id+' future stamp');assert.ok(r.replies.length>=5,id+' replies');assert.ok(r.replies.some(x=>/^※ 운영자에 의해 삭제된 댓글입니다\.$/.test(x)),id+' has a deleted comment line')}
for(const id of POSTS){const r=by(boards.records,id);assert.ok(r&&r.type==='카페',id);assert.ok(r.body.length>=100&&r.replies.length>=3&&nowOf(r.at)<=NOW,id)}
for(const id of QS){const r=by(boards.records,id);assert.ok(r&&r.type==='지식iN',id);assert.ok(r.answers.length>=3&&r.answers.every(a=>a.text.length>=25),id);const pk=r.answers.find(a=>a.pick);assert.ok(pk&&pk.text.length>=80&&r.reply===pk.text,id+' picked')}
/* 2. 무법지대 소재: 낚시, 불펌, 도배, 사기, 악플, 삭제된 댓글, 행운의 편지, 팝업 */
const mine=[...NEWS.map(i=>by(news.records,i)),...POSTS.map(i=>by(boards.records,i)),...QS.map(i=>by(boards.records,i))];
const blob=mine.map(r=>[r.title,r.tags,r.body,...(r.replies||[]),...(r.answers||[]).map(a=>a.text)].join('\n')).join('\n');
for(const tok of ['낚시','불펌','도배','사기','악플','삭제된 댓글','행운의 편지','광고 창','먹튀','계정','실명','안티','등업','쪽지'])assert.ok(blob.includes(tok),'theme missing: '+tok);
/* 3. 안전: 실제 사람, 전화번호, 주소, 누리집 주소, 욕설 목록, 혐오 표현을 쓰지 않는다 */
for(const bad of [/\b0\d{1,2}-\d{3,4}-\d{4}\b/,/https?:\/\//,/www\./,/\d{6}-\d{7}/,/@[a-z]/i,/\.com|\.net|\.co\.kr/])assert.ok(!bad.test(blob),'unsafe pattern '+bad);
for(const bad of ['한남','김치녀','홍어','일베','빨갱이','좌빨','수꼴','메갈','틀딱','맘충','자살','죽어라','씨발','병신','개새끼'])assert.ok(!blob.includes(bad),'unsafe word '+bad);
/* 4. 그 시절에 없던 말은 새 글에도 없다 */
for(const bad of ['스마트폰','트위터','페이스북','카카오톡','유튜브','인스타','넷플릭스','코로나','실화냐','개이득','레전드','인싸','팩폭','꿀잼','노잼','기레기','병맛','지못미','갓생','—'])assert.ok(!blob.includes(bad)&&!mine.some(r=>r.title.includes(bad)),'anachronism '+bad);
/* 5. 화면에서 열린다. 삭제된 댓글은 회색 줄로 따로 그려진다 */
const open=(type,id,portal)=>{api.navigate({type,id,portal});const r=by(type==='article'?news.records:boards.records,id);assert.ok(text().includes(r.title.slice(0,10)),id+' did not open');for(const b of ['재구성','게임 속','AI','—'])assert.ok(!text().replace('※ 이 화면은 게임 속에 만든 가상 인터넷입니다.','').includes(b),id+' banned text '+b)};
for(const id of NEWS){open('article',id,by(news.records,id).owner)}
for(const id of POSTS){open('post',id,by(boards.records,id).owner)}
for(const id of QS){open('question',id,by(boards.records,id).owner)}
api.navigate({type:'article',id:'daum-real-name',portal:'daum'});
const gone=cls('p88-deleted');assert.ok(gone.length>=1,'deleted comment row');assert.ok(gone.every(g=>g.textContent.includes('운영자에 의해 삭제된 댓글입니다.')&&!g.textContent.includes('추천')));
assert.ok(cls('p86-reply').length>=cls('p88-deleted').length+3,'normal replies stay');
/* 6. 목록 쪽 넘기기와 개수 */
api.navigate({type:'cafe',portal:'daum'});assert.ok(text().includes('/ 2 쪽'));assert.ok(cls('p86-row').length>=12);
api.navigate({type:'cafe',portal:'naver'});assert.ok(text().includes('/ 2 쪽'));
/* 7. 입력한 댓글은 지금처럼 남는다 (A87 동작 그대로) */
api.navigate({type:'post',id:'naver-cafe-bait',portal:'naver'});const form=find(n=>n.tagName==='FORM'&&n.classList.contains('xp79-comment-form'));assert.ok(form,'comment form still there');
console.log('PASS A88 lawless-era content: '+NEWS.length+' articles, '+POSTS.length+' posts, '+QS.length+' questions, deleted comment rows, safe wording, no anachronism, pager');
