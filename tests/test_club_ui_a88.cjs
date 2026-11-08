'use strict';
/* A88 우리동네 아지트 화면 시험: 혼자 보기, 친구와 함께(가짜 네트워크), 글자 안전, 정리 */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.join(__dirname,'..');
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c},remove:c=>this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' '),toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);if(n.parentNode===this)this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return{scale(){}}}}
const all=n=>[n,...n.children.flatMap(c=>all(c))];
const find=(root,f)=>all(root).find(f);
const has=(root,s)=>assert.ok(root.textContent.includes(s),'text: '+s+'\n'+root.textContent.slice(0,400));
const hasNot=(root,s)=>assert.ok(!root.textContent.includes(s),'unexpected: '+s);
const button=(root,s)=>{const x=find(root,n=>n.tagName==='BUTTON'&&n.textContent===s);assert.ok(x,'button: '+s);return x};
const menu=(root,s)=>{const x=find(root,n=>n.classList.contains('p88c-menu-btn')&&n.textContent.startsWith(s));assert.ok(x,'menu: '+s);return x};
const cls=(root,c)=>all(root).filter(n=>n.classList.contains(c));
const input=(root,label)=>{const x=find(root,n=>(n.tagName==='INPUT'||n.tagName==='TEXTAREA')&&n.attributes['aria-label']===label);assert.ok(x,'input: '+label);return x};
const club=root=>find(root,n=>n.classList.contains('p88c'));

function boot(opts){
 opts=opts||{};
 const memory=opts.memory||new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);
 const queue=[],intervals=[];
 const w={document:doc,Date,URL,encodeURIComponent,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('no network')},
  setTimeout:(fn,ms)=>{queue.push({fn,ms});return queue.length},setInterval:(fn,ms)=>{intervals.push({fn,ms,on:true});return intervals.length},clearInterval:id=>{if(intervals[id-1])intervals[id-1].on=false}};
 w.window=w;
 if(opts.net)w.A25NET=opts.net;
 for(const f of['portal-news','portal-boards','portal-pages','pc-system','club-seed','club-core','club'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/'+f+'.js'),'utf8'),w);
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/xp-desktop.js'),'utf8'),w);
 const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3550});
 const flush=()=>{while(queue.length)queue.shift().fn()};
 return{w,root,api,memory,queue,intervals,flush};
}
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const NAME_KEY='2006_a25_name';

/* 1. 혼자 보기 */
{
 const memory=new Map([[NAME_KEY,'민수']]);
 const{root,api,w,flush,queue}=boot({memory});
 /* 바탕화면 아이콘, 시작 메뉴 */
 assert.ok(find(root,n=>n.classList.contains('xp79-shortcut')&&n.textContent.includes('우리동네 아지트')),'바탕화면 아이콘');
 api.openApp('club');
 const c=club(root);
 for(const t of['우리동네 아지트','혼자 보기','카페 대문','내 정보','민수','새싹','접속 중 (1)','공지','[공지] 우리동네 아지트 이용 규칙','새로 올라온 글','낚시','전체 글'])has(c,t);
 /* 게시판 */
 menu(c,'자유게시판').click();
 has(c,'번호');has(c,'글쓴이');has(c,'쪽 1 / 2');
 assert.equal(cls(c,'p88c-tr').length,1+10);
 button(c,'다음 ▶').click();has(c,'쪽 2 / 2');
 button(c,'◀ 이전').click();has(c,'쪽 1 / 2');
 /* 글 읽기 */
 find(c,n=>n.classList.contains('p88c-tr')&&n.textContent.includes('사칭')).click();
 for(const t of['닉네임 앞에 이상한 문자','리플 3','3반반장','시삽_동네지기','운영진'])has(c,t);
 button(c,'목록').click();has(c,'쪽 1 / 2');
 /* 글쓰기 */
 button(c,'글쓰기').click();
 input(c,'제목').value='<b>오늘</b> 급식 뭐임?';input(c,'내용을 입력해 주세요').value='<img src=x onerror=alert(1)>\n카레면 좋겠다 ㅋㅋ';
 button(c,'등록').click();
 has(c,'글이 등록되었습니다.');has(c,'b 오늘 /b 급식 뭐임?');has(c,'카레면 좋겠다');has(c,'리플 0');
 assert.ok(!c.textContent.includes('<b>'),'꺾쇠는 지워진다');
 assert.equal(w.ClubUI.version,'A88');
 /* 내가 쓴 글은 추천 불가, 삭제 가능 */
 assert.ok(button(c,'추천 0').classList.contains('off'));
 button(c,'추천 0').click();has(c,'내가 쓴 글은 추천할 수 없어요.');
 has(c,'글 1');
 /* 리플: Enter로 등록 */
 const cm=input(c,'리플을 남겨 주세요 (50자)');cm.value='첫 리플 ㅎㅎ';cm.emit('keydown',{key:'Enter'});
 has(c,'리플 1');has(c,'첫 리플 ㅎㅎ');has(c,'댓글이 등록되었습니다.');
 assert.equal(input(c,'리플을 남겨 주세요 (50자)').value,'','등록하면 입력칸이 비워진다');
 /* 한글 조합 중 Enter는 무시 */
 const cm2=input(c,'리플을 남겨 주세요 (50자)');cm2.value='두번째';
 cm2.emit('keydown',{key:'Enter',isComposing:true});cm2.emit('keydown',{key:'Enter',keyCode:229});
 hasNot(c,'리플 2');
 /* 삭제 */
 button(c,'삭제').click();has(c,'글을 삭제했어요.');hasNot(c,'급식 뭐임');
 /* 한줄낙서 */
 menu(c,'한줄낙서').click();has(c,'오늘 급식 카레 나왔음');
 input(c,'한 줄 낙서 (40자)').value='나 왔다 ㅋㅋ';button(c,'남기기').click();has(c,'나 왔다 ㅋㅋ');has(c,'낙서를 남겼어요.');
 /* 출석부 */
 menu(c,'출석부').click();has(c,'아직 출석한 사람이 없어요');
 input(c,'출석 한마디 (24자)').value='1등 ㅋㅋㅋ';button(c,'출석 도장 쾅!').click();
 for(const t of['오늘의 출석 1등입니다!','1등 ㅋㅋㅋ','오늘 출석 완료'])has(c,t);
 /* 채팅 */
 menu(c,'실시간 채팅').click();has(c,'오락실지박령');has(c,'ㅎㅇㅎㅇ');has(c,'혼자 보기에서는 내가 쓴 말만');
 const ci=input(c,'할 말을 입력하고 Enter (50자)');ci.value='ㅎㅇ 나 왔음';ci.emit('keydown',{key:'Enter'});
 has(c,'ㅎㅇ 나 왔음');assert.equal(ci.value,'');
 /* 쪽지 */
 menu(c,'쪽지함').click();has(c,'받는 사람을 고르세요');has(c,'받은 쪽지가 없어요');
 const sel=find(c,n=>n.tagName==='SELECT');assert.ok(sel.children.length>=12,'회원 목록이 채워진다');
 sel.value='쪼꼬미';sel.emit('change');
 input(c,'쪽지 내용 (80자)').value='안녕!';button(c,'보내기').click();
 has(c,'쪼꼬미 님께 쪽지를 보냈어요.');
 hasNot(c,'방가방가 ^^ 나중에 놀자');
 flush(); /* 가상 회원의 자동 답장이 잠시 뒤에 온다 */
 has(c,'새 쪽지가 도착했어요. (쪼꼬미)');has(c,'방가방가 ^^ 나중에 놀자');
 has(menu(c,'쪽지함'),'쪽지함');
 /* 회원 목록 */
 menu(c,'회원 목록').click();has(c,'활동 점수');has(c,'시삽_동네지기');has(c,'운영진');has(c,'열공하는곰돌이');
 /* 저장: 같은 브라우저로 다시 열면 내가 쓴 낙서가 남아 있다 */
 assert.ok(memory.get('2006_club_local_v1').includes('나 왔다 ㅋㅋ'));
 const again=boot({memory});again.api.openApp('club');
 menu(club(again.root),'한줄낙서').click();has(club(again.root),'나 왔다 ㅋㅋ');
 /* 내 문서 창이나 다른 창이 있어도 같은 창을 다시 열면 중복되지 않는다 */
 api.openApp('club');assert.equal(cls(root,'p88c').length,1);
}

/* 2. 서버가 없을 때 저장값이 망가졌어도 열린다 */
{
 const memory=new Map([['2006_club_local_v1','{"v":1,"posts":"망가짐"}'],[NAME_KEY,'<b>이상한</b> 이름이름이름이름이름이름']]);
 const{root,api}=boot({memory});api.openApp('club');
 has(club(root),'새로 올라온 글');has(club(root),'b 이상한 /b 이름이름');
}

/* 3. 친구와 함께 (가짜 네트워크: 서버가 보내는 메시지를 그대로 흉내) */
{
 const sent=[],subs=new Set();
 const net={state:{ready:true,room:'ROOM88',id:'me',peers:2},send:o=>sent.push(o),subscribe:fn=>{subs.add(fn);return()=>subs.delete(fn)}};
 const memory=new Map([[NAME_KEY,'민수']]);
 const{root,api,flush,intervals}=boot({memory,net});
 const push=m=>{for(const f of[...subs])f(m)};
 const t0=Date.now();
 api.openApp('club');
 const c=club(root);
 same(sent[0],{type:'club',op:'enter'},'열면 접속을 알린다');
 has(c,'방 ROOM88 친구들과 함께 쓰는 중');
 flush();assert.ok(sent.some(m=>m.op==='list'),'목록 요청은 간격을 두고 뒤따른다');
 assert.equal(subs.size,1);
 /* 서버가 보낸 인사 */
 push({type:'club',op:'hello',t:t0,me:{name:'민수',lv:0,label:'새싹',points:1,posts:0,comments:0},unread:2,attended:false,counts:{posts:5,members:4,attend:1},notice:null,recent:[],online:['민수','수진']});
 has(c,'접속 중 (2)');has(c,'수진');has(menu(c,'쪽지함'),'(2)');
 assert.ok(menu(c,'쪽지함').classList.contains('new'));
 push({type:'club',op:'list',t:t0,page:1,pages:1,total:1,rows:[{id:7,title:'친구가 쓴 글 ㅋㅋ',nick:'수진',lv:1,at:t0-9*60000,rec:2,nc:1,hits:3,notice:false}]});
 /* 접속자 이름을 누르면 쪽지 쓰기로 */
 find(c,n=>n.classList.contains('p88c-online-btn')&&n.textContent==='수진').click();flush();
 has(c,'받는 사람을 고르세요');
 assert.ok(sent.some(m=>m.op==='inbox'));
 menu(c,'카페 대문').click();has(c,'친구가 쓴 글 ㅋㅋ');has(c,'9분 전');
 /* 새 글 알림(dirty)이 오면 목록을 다시 받는다 */
 flush();sent.length=0;
 push({type:'club',op:'dirty',what:'board'});flush();
 assert.ok(sent.some(m=>m.op==='list'));
 /* 실시간 채팅: 친구가 보낸 말이 바로 붙는다 */
 menu(c,'실시간 채팅').click();flush();
 push({type:'club',op:'chat_log',t:t0,rows:[{nick:'수진',st:0,text:'먼저 와 있었음',at:t0}]});has(c,'먼저 와 있었음');
 const lines=cls(c,'p88c-chat-line').length;
 push({type:'club',op:'chat',t:t0,row:{nick:'수진',st:0,text:'ㅋㅋ 왔네',at:t0}});
 assert.equal(cls(c,'p88c-chat-line').length,lines+1);has(c,'ㅋㅋ 왔네');
 /* 내가 쓴 말은 서버에 보내고, 화면에는 서버가 돌려주는 것만 붙는다 */
 sent.length=0;
 const ci=input(c,'할 말을 입력하고 Enter (50자)');ci.value='나도 왔어';ci.emit('keydown',{key:'Enter'});flush();
 same(sent.filter(m=>m.op==='chat'),[{type:'club',op:'chat',text:'나도 왔어'}]);hasNot(c,'나도 왔어');
 push({type:'club',op:'chat',t:t0,row:{nick:'민수',st:0,text:'나도 왔어',at:t0}});has(c,'나도 왔어');
 /* 다른 쪽에 있을 때 온 채팅은 메뉴에 표시 */
 menu(c,'카페 대문').click();flush();
 push({type:'club',op:'chat',t:t0,row:{nick:'수진',st:0,text:'야 어디야',at:t0}});
 assert.ok(menu(c,'실시간 채팅').classList.contains('new'));has(menu(c,'실시간 채팅'),'(1)');
 /* 새 쪽지 알림 */
 push({type:'club',op:'note_new',from:'수진'});has(c,'새 쪽지가 도착했어요. (수진)');
 /* 서버 오류 문구 */
 push({type:'club',op:'error',for:'post',message:'조금 천천히 해 주세요.'});has(c,'조금 천천히 해 주세요.');
 assert.ok(find(c,n=>n.classList.contains('p88c-flash')&&n.classList.contains('err')));
 /* 접속자 목록 갱신 */
 push({type:'club',op:'who',t:t0,list:['민수']});has(c,'접속 중 (1)');
 /* 20초마다 접속 중 신호 */
 sent.length=0;const beat=intervals.find(i=>i.on&&i.ms===20000);assert.ok(beat);beat.fn();same(sent,[{type:'club',op:'beat'}]);
 /* 다른 종류 메시지는 무시 */
 push({type:'state',id:'x'});push({type:'club',op:'모르는 것'});push(null);
 /* 연결이 끊기면 혼자 보기로 바뀐다 */
 push({type:'network_close'});has(c,'혼자 보기');
 sent.length=0;menu(c,'한줄낙서').click();assert.equal(sent.length,0,'끊긴 뒤에는 서버로 보내지 않는다');
 /* 다시 방에 들어오면 친구들과 함께로 돌아간다 */
 net.state.ready=true;push({type:'welcome',id:'me',room:'ROOM88',players:[]});flush();
 has(c,'친구들과 함께 쓰는 중');assert.ok(sent.some(m=>m.op==='enter'));
 /* 창이 닫히면(화면에서 사라지면) 구독과 신호를 정리한다 */
 const win=find(root,n=>n.classList.contains('p88c-win'));win.isConnected=false;
 push({type:'club',op:'who',list:[]});
 assert.equal(subs.size,0);assert.ok(!intervals.some(i=>i.on&&i.ms===20000));
}

/* 4. 서버 응답이 중간에 끊겨도 화면은 죽지 않는다 */
{
 const subs=new Set();
 const net={state:{ready:true,room:'ROOM88'},send(){},subscribe:fn=>{subs.add(fn);return()=>subs.delete(fn)}};
 const{root,api,flush}=boot({net});
 api.openApp('club');const c=club(root);
 const push=m=>{for(const f of[...subs])f(m)};
 menu(c,'자유게시판').click();has(c,'불러오는 중');
 find(c,n=>n.classList.contains('p88c-menu-btn')&&n.textContent==='출석부').click();has(c,'출석부');
 push({type:'club',op:'post',post:{id:5,title:'x',body:'y',nick:'z',lv:0,at:Date.now(),rec:0,hits:0,notice:false,comments:[],mine:false,recd:false}});
 has(c,'출석부');hasNot(c,'게시글');
}

/* 5. 안전: 화면 글은 textContent로만 그린다 */
{
 const src=fs.readFileSync(path.join(ROOT,'src/club.js'),'utf8');
 assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function/.test(src),'HTML 삽입 금지');
 const core=fs.readFileSync(path.join(ROOT,'src/club-core.js'),'utf8');
 assert.ok(!/innerHTML|eval\(|new Function/.test(core));
 for(const banned of['스마트폰','트위터','페이스북','카카오톡','유튜브','—'])assert.ok(!src.includes(banned),banned);
}
console.log('club ui a88 ok');
