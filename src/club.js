/* A88 club.js : PC방 컴퓨터 안의 "우리동네 아지트" (같은 방 친구들끼리 쓰는 카페 모양의 모임 공간).
   게시판, 한줄낙서, 출석부, 실시간 채팅, 쪽지함, 회원 목록이 있다.
   같은 방에 들어와 있으면 서버(server.js)를 통해 친구들과 함께 쓰고, 혼자일 때는 이 브라우저에만 저장되는 혼자 보기로 열린다.
   규칙은 club-core.js, 처음 글은 club-seed.js에 있다. xp-desktop.js의 openApp('club')이 ClubUI.open(ctx)를 부른다. */
(function(w){'use strict';
const VERSION='A88';
const LOCAL_KEY='2006_club_local_v1';
const NAME_KEY='2006_a25_name';

function open(ctx){
 const Core=w.ClubCore,Seed=w.ClubSeed;
 if(!ctx||!ctx.windowFor||!ctx.E||!ctx.B||!Core||!Seed)return false;
 const{windowFor,E,B}=ctx;
 const win=windowFor('club','우리동네 아지트',true);
 if(win.club){win.club.refresh();return true}
 win.content.replaceChildren();
 win.node.classList.add('p88c-win');

 /* ───────── 상태 ───────── */
 const net=()=>w.A25NET;
 const online=()=>{const n=net();return !!(n&&n.state&&n.state.ready)};
 const S={mode:online()?'online':'local',page:'home',boardPage:1,postId:null,me:null,unread:0,counts:null,recent:[],list:null,post:null,scrawl:[],attend:null,chat:[],inbox:null,members:[],who:[],flash:'',flashErr:false,draft:{},inputs:{},chatNew:0,skew:0,to:''};
 const local={club:null,name:'동네 친구'};
 let timers=[],unsub=null,beat=null,dead=false;
 const nowEst=()=>Date.now()+S.skew;
 const when=at=>Core.when(at,nowEst());
 const store=()=>{try{return w.localStorage}catch(_){return null}};
 function loadLocal(){
  let name='';try{name=store().getItem(NAME_KEY)||''}catch(_){}
  local.name=Core.nickOf(name||'동네 친구');
  let raw=null;try{raw=store().getItem(LOCAL_KEY)}catch(_){}
  local.club=Core.revive(raw,Seed,Date.now());
 }
 function saveLocal(){try{store().setItem(LOCAL_KEY,JSON.stringify(local.club))}catch(_){}}
 const later=(fn,ms)=>{const f=w.setTimeout;if(typeof f==='function')return f(fn,ms);fn();return null};

 /* ───────── 서버 또는 혼자 보기로 요청 보내기 ───────── */
 /* 서버는 읽기 요청을 60ms보다 촘촘하게 받지 않으므로 연달아 보낼 때는 조금씩 간격을 둔다 */
 let nextAt=0;
 function pace(msg){
  const now=Date.now(),at=Math.max(now,nextAt);nextAt=at+90;
  const go=()=>{if(!dead&&online())net().send(Object.assign({type:'club'},msg))};
  if(at-now<5)go();else later(go,at-now);
 }
 function send(msg){
  if(dead)return;
  if(S.mode==='online'&&online()){pace(msg);return}
  if(S.mode==='online')switchMode('local');
  if(!local.club)loadLocal();
  const res=Core.apply(local.club,{name:local.name},msg,Date.now());
  saveLocal();
  if(res.reply)handle(Object.assign({t:Date.now()},res.reply));
  for(const p of res.push||[]){
   if(p.scope==='club'&&!p.skipSelf)handle(Object.assign({t:Date.now()},p.msg));
   else if(p.scope==='to'&&p.to===local.name)later(()=>handle(Object.assign({t:Date.now()},p.msg)),p.delayMs||0);
  }
 }
 function switchMode(mode){
  if(S.mode===mode&&S.me)return;
  S.mode=mode;S.me=null;S.who=[];S.list=null;S.post=null;S.inbox=null;S.attend=null;S.chat=[];S.members=[];S.skew=0;
  if(mode==='local')loadLocal();
  enter();
 }
 function enter(){
  if(S.mode==='online'&&online())send({op:'enter'});
  else{if(!local.club)loadLocal();S.who=[local.name];send({op:'hello'})}
  loadPage();
 }
 function loadPage(){
  const p=S.page;
  if(p==='home')send({op:'list',page:1});
  else if(p==='board')send({op:'list',page:S.boardPage});
  else if(p==='read'&&S.postId)send({op:'get',id:S.postId,quiet:true});
  else if(p==='scrawl')send({op:'scrawl_list'});
  else if(p==='attend')send({op:'attend_list'});
  else if(p==='chat')send({op:'chat_log'});
  else if(p==='inbox'){send({op:'inbox'});send({op:'members'})}
  else if(p==='members')send({op:'members'});
 }

 /* ───────── 받은 메시지 ───────── */
 function handle(m){
  if(dead||!m||m.type!=='club')return;
  if(win.node.isConnected===false){cleanup();return}
  if(Number.isFinite(m.t))S.skew=m.t-Date.now();
  if(m.flash){S.flash=m.flash;S.flashErr=false}
  switch(m.op){
   case'hello':S.me=m.me;S.unread=m.unread||0;S.counts=m.counts;S.recent=m.recent||[];if(Array.isArray(m.online))S.who=m.online;break;
   case'list':S.list=m;S.boardPage=m.page;if(S.page==='home')S.recent=m.rows.filter(r=>!r.notice).slice(0,5);break;
   case'post':
    S.post=m.post;
    if(m.done==='post'){S.postId=m.post.id;S.page='read';S.draft.title='';S.draft.body=''}
    if(S.page!=='read'||S.postId!==m.post.id)return;
    if(m.done==='comment')S.draft.comment='';
    if(m.done)send({op:'hello'});
    break;
   case'deleted':S.page='board';S.flash='글을 삭제했어요.';S.flashErr=false;send({op:'list',page:S.boardPage});send({op:'hello'});break;
   case'scrawl_list':S.scrawl=m.rows||[];if(m.flash){S.draft.scrawl='';send({op:'hello'})}break;
   case'attend_list':S.attend=m;if(m.flash){S.draft.attend='';send({op:'hello'})}if(S.me&&m.mine)S.me.attended=true;break;
   case'chat_log':S.chat=m.rows||[];S.chatNew=0;break;
   case'chat':S.chat.push(m.row);while(S.chat.length>40)S.chat.shift();if(S.page==='chat'){appendChat(m.row);return}S.chatNew++;break;
   case'inbox':S.inbox=m.rows||[];S.unread=0;break;
   case'members':S.members=m.rows||[];break;
   case'who':S.who=m.list||[];drawSide();return;
   case'note_new':S.unread++;S.flash='새 쪽지가 도착했어요. ('+m.from+')';S.flashErr=false;if(S.page==='inbox')send({op:'inbox'});break;
   case'note_ok':S.flash=m.to+' 님께 쪽지를 보냈어요.';S.flashErr=false;S.draft.noteText='';break;
   case'dirty':
    if(m.what==='board'){if(S.page==='board'||S.page==='home')send({op:'list',page:S.page==='home'?1:S.boardPage});else if(S.page==='read'&&S.postId)send({op:'get',id:S.postId,quiet:true})}
    else if(m.what==='scrawl'&&S.page==='scrawl')send({op:'scrawl_list'});
    else if(m.what==='attend'&&S.page==='attend')send({op:'attend_list'});
    return;
   case'error':S.flash=m.message||'처리하지 못했어요.';S.flashErr=true;break;
   default:return;
  }
  render();
 }

 /* ───────── 그리기 도구 ───────── */
 const root=E('div','p88c');
 const banner=E('header','p88c-banner'),body=E('div','p88c-body'),side=E('aside','p88c-side'),main=E('main','p88c-main');
 body.append(side,main);root.append(banner,body);win.content.append(root);
 const tag=lv=>{const t=E('em','p88c-lv p88c-lv'+(lv===Core.STAFF_LV?'s':Math.min(lv,4)),Core.labelOf(lv));return t};
 function who(nick,lv){const s=E('span','p88c-who');s.append(E('b','',nick),tag(lv));return s}
 function input(key,ph,max,type){
  const inp=E(type==='area'?'textarea':'input','p88c-in'+(type==='area'?' p88c-area':''));
  if(type!=='area')inp.type='text';
  inp.placeholder=ph||'';inp.maxLength=max||100;inp.value=S.draft[key]||'';
  inp.setAttribute('aria-label',ph||key);
  S.inputs[key]=inp;
  inp.addEventListener('input',()=>{S.draft[key]=inp.value});
  return inp;
 }
 const val=key=>S.inputs[key]?S.inputs[key].value:(S.draft[key]||'');
 function enterKey(inp,fn){inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){e.preventDefault?.();fn()}})}
 const btn=(label,fn,cls)=>B(label,fn,'p88c-btn'+(cls?' '+cls:''));
 const head=(title,sub)=>{const h=E('div','p88c-head');h.append(E('h2','',title));if(sub)h.append(E('span','',sub));return h};
 const empty=t=>E('p','p88c-empty',t);
 function go(page){S.page=page;S.flash='';if(page==='chat')S.chatNew=0;render();if(page!=='write')loadPage()}

 /* ───────── 왼쪽 메뉴 ───────── */
 function drawSide(){
  side.replaceChildren();
  const me=E('section','p88c-card'),mb=E('div','p88c-card-body');
  me.append(E('h3','','내 정보'));
  if(S.me){
   mb.append(E('b','p88c-me-name',S.me.name));
   const lvRow=E('div','p88c-me-lv');lvRow.append(tag(S.me.lv));mb.append(lvRow);
   mb.append(E('span','','글 '+S.me.posts+' · 리플 '+S.me.comments));
   mb.append(E('span','','활동 점수 '+S.me.points));
  }else mb.append(E('span','','불러오는 중...'));
  me.append(mb);
  const menu=E('nav','p88c-menu');
  const items=[['home','카페 대문'],['board','자유게시판'],['scrawl','한줄낙서'],['attend','출석부'],['chat','실시간 채팅'+(S.chatNew?' ('+S.chatNew+')':'')],['inbox','쪽지함'+(S.unread?' ('+S.unread+')':'')],['members','회원 목록']];
  for(const[id,label]of items){
   const b=B(label,()=>go(id),'p88c-menu-btn'+((S.page===id||(id==='board'&&(S.page==='read'||S.page==='write')))?' on':''));
   if((id==='inbox'&&S.unread)||(id==='chat'&&S.chatNew))b.classList.add('new');
   menu.append(b);
  }
  const on=E('section','p88c-card');on.append(E('h3','','접속 중 ('+S.who.length+')'));
  const list=E('div','p88c-card-body p88c-online');
  if(!S.who.length)list.append(E('span','p88c-dim','아무도 없어요'));
  for(const n of S.who){
   const me2=S.me&&n===S.me.name;
   const b=B(n+(me2?' (나)':''),()=>{if(!me2){S.to=n;go('inbox')}},'p88c-online-btn');b.title=me2?'나':n+' 님께 쪽지 보내기';list.append(b);
  }
  on.append(list);
  side.append(me,menu,on);
 }
 function drawBanner(){
  banner.replaceChildren();
  const t=E('div','p88c-title');t.append(E('strong','',Seed.name),E('span','',Seed.motto));
  const st=E('div','p88c-status'+(S.mode==='online'?' on':''));
  const room=net()&&net().state&&net().state.room;
  st.textContent=S.mode==='online'?'● 방 '+(room||'')+' 친구들과 함께 쓰는 중':'○ 혼자 보기 (같은 방 친구가 없을 때는 이 브라우저에만 저장돼요)';
  banner.append(t,st);
 }
 function flashBar(){if(!S.flash)return null;return E('div','p88c-flash'+(S.flashErr?' err':''),S.flash)}

 /* ───────── 쪽(페이지) ───────── */
 function postRows(rows,compact){
  const box=E('div','p88c-table');
  if(!compact){const h=E('div','p88c-tr p88c-th');for(const x of['번호','제목','글쓴이','작성일','조회','추천'])h.append(E('span','',x));box.append(h)}
  for(const r of rows){
   const tr=B('',()=>{S.postId=r.id;S.page='read';render();send({op:'get',id:r.id})},'p88c-tr'+(compact?' p88c-compact':'')+(r.notice?' notice':''));
   const title=E('span','p88c-ttl');
   if(r.notice)title.append(E('em','p88c-badge','공지'));
   title.append(E('b','',r.title));if(r.nc)title.append(E('i','p88c-nc','['+r.nc+']'));
   if(compact){tr.append(title,E('span','p88c-by',r.nick),E('span','p88c-dim',when(r.at)))}
   else tr.append(E('span','p88c-no',r.notice?'-':String(r.id)),title,who(r.nick,r.lv),E('span','p88c-dim',when(r.at)),E('span','p88c-dim',String(r.hits)),E('span','p88c-dim',String(r.rec)));
   box.append(tr);
  }
  return box;
 }
 function pageHome(){
  const c=E('div','p88c-page');
  c.append(head('카페 대문','우리 동네 친구들이 모이는 곳'));
  if(S.me&&S.counts){
   const stat=E('div','p88c-stats');
   for(const[l,v]of[['전체 글',S.counts.posts],['회원',S.counts.members],['오늘 출석',S.counts.attend]]){const s=E('span','');s.append(E('small','',l),E('b','',String(v)));stat.append(s)}
   c.append(stat);
  }
  const fl=flashBar();if(fl)c.append(fl);
  const cta=E('div','p88c-cta');
  const att=S.me&&S.me.attended;
  cta.append(btn(att?'오늘 출석 완료':'출석 도장 찍으러 가기',()=>go('attend'),att?'':'hot'),btn('글쓰기',()=>go('write')),btn('실시간 채팅 들어가기',()=>go('chat')));
  c.append(cta);
  const nt=S.list&&S.list.rows.filter(r=>r.notice);
  if(nt&&nt.length){c.append(E('h3','p88c-sub','공지'));c.append(postRows(nt,true))}
  c.append(E('h3','p88c-sub','새로 올라온 글'));
  c.append(S.recent.length?postRows(S.recent,true):empty('아직 글이 없어요.'));
  return c;
 }
 function pageBoard(){
  const c=E('div','p88c-page');c.append(head('자유게시판','욕설, 도배, 사칭은 금지예요 ^^'));
  const fl=flashBar();if(fl)c.append(fl);
  const bar=E('div','p88c-bar');bar.append(btn('글쓰기',()=>go('write'),'hot'));c.append(bar);
  if(!S.list)c.append(empty('불러오는 중...'));
  else{
   c.append(S.list.rows.length?postRows(S.list.rows,false):empty('아직 글이 없어요. 첫 글을 남겨 보세요!'));
   const pg=E('div','p88c-pager');
   pg.append(btn('◀ 이전',()=>{if(S.list.page>1){S.boardPage=S.list.page-1;send({op:'list',page:S.boardPage})}},S.list.page<=1?'off':''),E('span','','쪽 '+S.list.page+' / '+S.list.pages),btn('다음 ▶',()=>{if(S.list.page<S.list.pages){S.boardPage=S.list.page+1;send({op:'list',page:S.boardPage})}},S.list.page>=S.list.pages?'off':''));
   c.append(pg);
  }
  return c;
 }
 function pageRead(){
  const c=E('div','p88c-page');
  const p=S.post;
  if(!p||p.id!==S.postId){c.append(head('게시글'),empty('불러오는 중...'));c.append(btn('목록',()=>go('board')));return c}
  const art=E('article','p88c-article');
  const th=E('div','p88c-art-head');
  th.append(E('h2','',(p.notice?'[공지] ':'')+p.title));
  const meta=E('div','p88c-art-meta');meta.append(who(p.nick,p.lv),E('span','p88c-dim',when(p.at)),E('span','p88c-dim','조회 '+p.hits),E('span','p88c-dim','추천 '+p.rec));
  th.append(meta);art.append(th,E('p','p88c-art-body',p.body));
  const fl=flashBar();
  const acts=E('div','p88c-bar');
  acts.append(btn('추천 '+p.rec,()=>send({op:'rec',id:p.id}),p.recd||p.mine?'off':'hot'),btn('목록',()=>go('board')));
  if(p.mine)acts.append(btn('삭제',()=>send({op:'del',id:p.id})));
  c.append(art);if(fl)c.append(fl);c.append(acts);
  c.append(E('h3','p88c-sub','리플 '+p.comments.length));
  const cl=E('div','p88c-comments');
  if(!p.comments.length)cl.append(empty('첫 리플을 남겨 보세요!'));
  for(const x of p.comments){const r=E('div','p88c-cm');r.append(who(x.nick,x.lv),E('span','p88c-cm-text',x.text),E('span','p88c-dim',when(x.at)));cl.append(r)}
  c.append(cl);
  const f=E('div','p88c-form');const inp=input('comment','리플을 남겨 주세요 (50자)',50);
  const submit=()=>{const t=val('comment').trim();if(t)send({op:'comment',id:p.id,text:t})};
  enterKey(inp,submit);f.append(inp,btn('등록',submit,'hot'));c.append(f);
  return c;
 }
 function pageWrite(){
  const c=E('div','p88c-page');c.append(head('글쓰기','제목 30자, 내용 400자까지'));
  const fl=flashBar();if(fl)c.append(fl);
  const t=input('title','제목',30),b=input('body','내용을 입력해 주세요',400,'area');
  const f=E('div','p88c-write');f.append(E('label','','제목'),t,E('label','','내용'),b);
  const bar=E('div','p88c-bar');
  bar.append(btn('등록',()=>{send({op:'post',title:val('title'),body:val('body')})},'hot'),btn('취소',()=>go('board')));
  c.append(f,bar);return c;
 }
 function pageScrawl(){
  const c=E('div','p88c-page');c.append(head('한줄낙서','오늘 한 마디 남기고 가세요 ^^'));
  const fl=flashBar();if(fl)c.append(fl);
  const f=E('div','p88c-form');const inp=input('scrawl','한 줄 낙서 (40자)',40);
  const submit=()=>{const t=val('scrawl').trim();if(t)send({op:'scrawl',text:t})};
  enterKey(inp,submit);f.append(inp,btn('남기기',submit,'hot'));c.append(f);
  const l=E('div','p88c-scrawls');
  if(!S.scrawl.length)l.append(empty('첫 낙서를 남겨 보세요!'));
  for(const x of S.scrawl){const r=E('div','p88c-sc');r.append(who(x.nick,x.lv),E('span','p88c-sc-text',x.text),E('span','p88c-dim',when(x.at)));l.append(r)}
  c.append(l);return c;
 }
 function pageAttend(){
  const c=E('div','p88c-page');c.append(head('출석부','하루에 한 번, 1등에게는 시삽이 떡볶이를 쏩니다!'));
  const fl=flashBar();if(fl)c.append(fl);
  const a=S.attend;
  if(a&&a.mine)c.append(E('div','p88c-done','오늘 출석 완료! 내일도 와 주세요 ^^'));
  else{
   const f=E('div','p88c-form');const inp=input('attend','출석 한마디 (24자)',24);
   const submit=()=>send({op:'attend',text:val('attend')});
   enterKey(inp,submit);f.append(inp,btn('출석 도장 쾅!',submit,'hot'));c.append(f);
  }
  const l=E('div','p88c-table');
  const h=E('div','p88c-tr p88c-th att');for(const x of['순서','글쓴이','한마디','시간'])h.append(E('span','',x));l.append(h);
  if(!a||!a.rows.length)l.append(empty('아직 출석한 사람이 없어요. 오늘의 1등은 바로 당신!'));
  else for(const r of a.rows){const tr=E('div','p88c-tr att');tr.append(E('span','p88c-no',r.n+'등'),who(r.nick,r.lv),E('span','p88c-ttl',r.text),E('span','p88c-dim',Core.clock(r.at)));l.append(tr)}
  c.append(l);return c;
 }
 let chatLog=null;
 function chatLine(r){const d=E('div','p88c-chat-line');d.append(E('b','p88c-chat-nick'+(r.st?' staff':''),r.nick),E('span','',r.text));return d}
 function appendChat(r){
  if(!chatLog)return;
  chatLog.append(chatLine(r));
  while(chatLog.children.length>40)chatLog.children[0].remove();
  chatLog.scrollTop=chatLog.scrollHeight;
 }
 function pageChat(){
  const c=E('div','p88c-page p88c-chatpage');c.append(head('실시간 채팅','같은 방에 있는 친구들과 바로 이야기해요'));
  const fl=flashBar();if(fl)c.append(fl);
  chatLog=E('div','p88c-chat');
  if(!S.chat.length)chatLog.append(empty('아직 이야기가 없어요.'));
  for(const r of S.chat)chatLog.append(chatLine(r));
  c.append(chatLog);
  const f=E('div','p88c-form');const inp=input('chat','할 말을 입력하고 Enter (50자)',50);
  const submit=()=>{const t=val('chat').trim();if(!t)return;S.draft.chat='';if(S.inputs.chat)S.inputs.chat.value='';send({op:'chat',text:t})};
  enterKey(inp,submit);f.append(inp,btn('보내기',submit,'hot'));c.append(f);
  if(S.mode==='local')c.append(E('p','p88c-dim','혼자 보기에서는 내가 쓴 말만 보여요. 같은 방 친구가 들어오면 함께 이야기할 수 있어요.'));
  later(()=>{if(chatLog)chatLog.scrollTop=chatLog.scrollHeight},0);
  return c;
 }
 function pageInbox(){
  const c=E('div','p88c-page');c.append(head('쪽지함','친구에게 쪽지를 보내 보세요'));
  const fl=flashBar();if(fl)c.append(fl);
  const f=E('div','p88c-note');
  const sel=E('select','p88c-in p88c-select');sel.setAttribute('aria-label','받는 사람');
  S.inputs.noteTo=sel;
  const names=S.members.map(r=>r.nick).filter(n=>!S.me||n!==S.me.name);
  const first=E('option','','받는 사람을 고르세요');first.value='';sel.append(first);
  for(const n of names){const o=E('option','',n);o.value=n;sel.append(o)}
  sel.value=S.to&&names.includes(S.to)?S.to:'';
  sel.addEventListener('change',()=>{S.to=sel.value});
  const t=input('noteText','쪽지 내용 (80자)',80);
  const submit=()=>{const to=(sel.value||S.to||'').trim();send({op:'note',to,text:val('noteText')})};
  enterKey(t,submit);f.append(sel,t,btn('보내기',submit,'hot'));c.append(f);
  c.append(E('h3','p88c-sub','받은 쪽지'));
  const l=E('div','p88c-notes');
  if(!S.inbox)l.append(empty('불러오는 중...'));
  else if(!S.inbox.length)l.append(empty('받은 쪽지가 없어요.'));
  else for(const n of S.inbox){const r=E('div','p88c-note-row'+(n.read?'':' unread'));r.append(E('b','',n.from),E('span','p88c-note-text',n.text),E('span','p88c-dim',when(n.at)),B('답장',()=>{S.to=n.from;render()},'p88c-mini'));l.append(r)}
  c.append(l);return c;
 }
 function pageMembers(){
  const c=E('div','p88c-page');c.append(head('회원 목록','활동 점수가 높으면 등급이 올라가요'));
  const t=E('div','p88c-table');
  const h=E('div','p88c-tr p88c-th mem');for(const x of['글쓴이','등급','활동 점수'])h.append(E('span','',x));t.append(h);
  for(const r of S.members){const tr=E('div','p88c-tr mem');tr.append(E('b','',r.nick),tag(r.lv),E('span','p88c-dim',String(r.points)));t.append(tr)}
  if(!S.members.length)t.append(empty('불러오는 중...'));
  c.append(t);
  const g=E('p','p88c-dim','등급: 새싹, 준회원, 정회원, 우수회원, 열혈회원 (운영진은 시삽만 해요)');c.append(g);return c;
 }
 const pages={home:pageHome,board:pageBoard,read:pageRead,write:pageWrite,scrawl:pageScrawl,attend:pageAttend,chat:pageChat,inbox:pageInbox,members:pageMembers};

 function render(){
  if(dead)return;
  const focusKey=Object.keys(S.inputs).find(k=>S.inputs[k]&&S.inputs[k]===(w.document&&w.document.activeElement));
  S.inputs={};chatLog=null;
  drawBanner();drawSide();
  main.replaceChildren();
  main.append((pages[S.page]||pageHome)());
  if(focusKey&&S.inputs[focusKey])try{S.inputs[focusKey].focus()}catch(_){}
 }
 function cleanup(){
  dead=true;if(unsub){try{unsub()}catch(_){}unsub=null}
  if(beat&&typeof w.clearInterval==='function')w.clearInterval(beat);beat=null;
 }

 /* ───────── 시작 ───────── */
 const n=net();
 if(n&&typeof n.subscribe==='function'){
  unsub=n.subscribe(m=>{
   if(dead||!m)return;
   if(win.node.isConnected===false){cleanup();return}
   if(m.type==='club')handle(m);
   else if(m.type==='welcome'&&S.mode!=='online'){S.mode='online';S.me=null;S.who=[];S.list=null;S.post=null;S.inbox=null;S.attend=null;S.chat=[];S.members=[];render();enter()}
   else if(m.type==='network_close'&&S.mode==='online'){switchMode('local');render()}
  });
 }
 if(typeof w.setInterval==='function'){
  beat=w.setInterval(()=>{
   if(dead)return;
   if(win.node.isConnected===false){cleanup();return}
   if(S.mode==='online'&&online())net().send({type:'club',op:'beat'});
  },20000);
 }
 render();
 enter();
 win.club={refresh(){if(dead)return;render();loadPage()},state:()=>({mode:S.mode,page:S.page,me:S.me,who:S.who.slice(),unread:S.unread,postId:S.postId}),go,send,handle,cleanup,local};
 return true;
}

w.ClubUI={version:VERSION,open};
})(window);
