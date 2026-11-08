/* A88 club-core.js : 우리동네 아지트의 규칙 엔진(게시판, 한줄낙서, 출석부, 채팅 기록, 쪽지, 등급).
   서버(server.js, 방마다 하나)와 브라우저(혼자 보기, 브라우저 저장소)가 같은 파일을 쓴다.
   화면 글은 모두 textContent로만 그려지고 여기서는 HTML을 만들지 않는다. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ClubCore=api})(typeof self!=='undefined'?self:this,function(){
'use strict';
const LIM={title:30,body:400,comment:50,scrawl:40,chat:50,note:80,attend:24,nick:14,
 posts:60,comments:20,scrawls:50,chats:40,attends:60,members:150,box:12,page:10,replyBytes:7000};
const LABELS=['새싹','준회원','정회원','우수회원','열혈회원'];
const STEPS=[0,8,25,60,120];
const STAFF_LV=9,STAFF_LABEL='운영진';
const RESERVED=/^(운영자|관리자|운영진|시삽|부시삽|매니저|admin|administrator|system|시스템)/i;
const DAY=864e5;

/* ───────── 시간 (한국 시간 기준) ───────── */
const kst=t=>new Date(t+324e5);
const dayKey=t=>kst(t).toISOString().slice(0,10);
const clock=t=>{const d=kst(t);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')};
function when(at,now){
 const m=Math.floor((now-at)/6e4);
 if(m<1)return'방금 전';
 if(m<60)return m+'분 전';
 const days=Math.round((Date.parse(dayKey(now))-Date.parse(dayKey(at)))/DAY);
 if(days<=0)return'오늘 '+clock(at);
 if(days===1)return'어제 '+clock(at);
 if(days<7)return days+'일 전';
 if(days<30)return Math.floor(days/7)+'주 전';
 return'오래 전';
}

/* ───────── 글자 다듬기 ───────── */
function line(s,max){return String(s==null?'':s).normalize('NFC').replace(/[\x00-\x1f\x7f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
function para(s,max){
 const t=String(s==null?'':s).normalize('NFC').replace(/\r\n?/g,'\n').replace(/[\x00-\x09\x0b-\x1f\x7f<>]/g,'');
 return t.split('\n').map(x=>x.replace(/[ \t]+$/,'')).slice(0,12).join('\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,max);
}
const nickOf=s=>line(s,LIM.nick)||'이름 없는 친구';
const bytes=o=>{
 const s=JSON.stringify(o);
 if(typeof TextEncoder==='function')return new TextEncoder().encode(s).length;
 let n=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);n+=c<128?1:c<2048?2:(c>=55296&&c<=56319?(i++,4):3)}return n;
};
/* 닉네임은 사용자가 정한 글자이므로 __proto__ 같은 이름이 와도 안전하게 앞에 ~를 붙여 보관한다 */
const K=n=>'~'+n;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const mget=(c,n)=>own(c.members,K(n))?c.members[K(n)]:null;
const mnames=c=>Object.keys(c.members).map(k=>k.slice(1));
const nget=(c,n)=>own(c.notes,K(n))?c.notes[K(n)]:null;
const nbox=(c,n)=>own(c.notes,K(n))?c.notes[K(n)]:(c.notes[K(n)]=[]);

/* ───────── 만들기 ───────── */
function create(seed,now){
 seed=seed||{};now=now||Date.now();
 const c={v:1,nextId:1,posts:[],scrawl:[],chat:[],attend:{day:dayKey(now),rows:[]},members:{},notes:{},staff:(seed.staff||[]).slice(),npc:Object.assign({},seed.npc||{}),created:now,touched:now};
 for(const n of seed.members||[])c.members[K(n)]={posts:0,comments:0,scr:0,att:0,visits:12,day:'',first:now,last:now,seed:1};
 const ps=(seed.posts||[]).slice().reverse();
 for(const p of ps){
  c.posts.push({id:c.nextId++,title:line(p.title,LIM.title+12),body:para(p.body,LIM.body+200),nick:p.nick,at:now-(p.ago||0)*6e4,
   rec:[],recBase:p.recBase||0,hits:p.hits||0,notice:!!p.notice,
   comments:(p.comments||[]).map(x=>({nick:x.nick,text:line(x.text,LIM.comment+40),at:now-(x.ago||0)*6e4}))});
  const m=mget(c,p.nick);if(m)m.posts++;
  for(const x of p.comments||[]){const mm=mget(c,x.nick);if(mm)mm.comments++}
 }
 for(const s of(seed.scrawl||[]).slice().reverse())c.scrawl.push({nick:s.nick,text:line(s.text,LIM.scrawl),at:now-(s.ago||0)*6e4});
 for(const s of(seed.chat||[]).slice().reverse())c.chat.push({nick:s.nick,text:line(s.text,LIM.chat),at:now-(s.ago||0)*6e4});
 c.scrawl.sort((a,b)=>a.at-b.at);c.chat.sort((a,b)=>a.at-b.at);
 return c;
}
/* 브라우저 저장소에서 불러온 값이 이상하면 새로 만든다 */
function revive(raw,seed,now){
 try{
  const c=typeof raw==='string'?JSON.parse(raw):raw;
  if(c&&c.v===1&&Array.isArray(c.posts)&&Array.isArray(c.scrawl)&&Array.isArray(c.chat)&&c.members&&typeof c.members==='object'&&c.notes&&typeof c.notes==='object'&&c.attend&&Array.isArray(c.attend.rows)&&Number.isFinite(c.nextId)){
   c.posts=c.posts.filter(p=>p&&Number.isFinite(p.id)&&typeof p.title==='string'&&typeof p.body==='string'&&typeof p.nick==='string'&&Array.isArray(p.comments)&&Array.isArray(p.rec)).slice(0,LIM.posts+20);
   c.staff=(seed&&seed.staff||[]).slice();c.npc=Object.assign({},seed&&seed.npc||{});
   return c;
  }
 }catch(_){}
 return create(seed,now);
}

/* ───────── 등급 ───────── */
function member(c,name,now){
 let m=mget(c,name);
 if(!m){
  const names=mnames(c);
  if(names.length>=LIM.members){
   const drop=names.filter(n=>!c.staff.includes(n)&&!mget(c,n).seed).sort((a,b)=>points(mget(c,a))-points(mget(c,b))||mget(c,a).last-mget(c,b).last)[0];
   if(drop){delete c.members[K(drop)];delete c.notes[K(drop)]}
  }
  m=c.members[K(name)]={posts:0,comments:0,scr:0,att:0,visits:0,day:'',first:now,last:now};
 }
 m.last=now;return m;
}
function points(m){return m?m.posts*5+m.comments*2+m.scr+m.att*3+m.visits:0}
function levelOf(c,name){
 if(c.staff.includes(name))return STAFF_LV;
 const p=points(mget(c,name));let lv=0;
 for(let i=0;i<STEPS.length;i++)if(p>=STEPS[i])lv=i;
 return lv;
}
const labelOf=lv=>lv===STAFF_LV?STAFF_LABEL:LABELS[lv]||LABELS[0];

/* ───────── 응답 크기 줄이기 (한 번에 8192바이트를 넘으면 서버가 버린다) ───────── */
function fit(reply){
 const trim=(arr,keepNewest)=>{while(arr.length>1&&bytes(reply)>LIM.replyBytes)keepNewest?arr.shift():arr.pop()};
 if(reply.rows)trim(reply.rows,reply.op==='chat_log'||reply.op==='scrawl_list');
 if(reply.post&&reply.post.comments)trim(reply.post.comments,true);
 return reply;
}
const R=(op,data)=>fit(Object.assign({type:'club',op},data));
const ERR=(forOp,message)=>({ok:false,reply:{type:'club',op:'error',for:forOp,message},push:[]});

/* ───────── 한 가지 요청 처리 ───────── */
function rowOf(c,p){return{id:p.id,title:p.title,nick:p.nick,lv:levelOf(c,p.nick),at:p.at,rec:p.recBase+p.rec.length,nc:p.comments.length,hits:p.hits,notice:!!p.notice}}
function postOf(c,p,viewer){
 return{id:p.id,title:p.title,body:p.body,nick:p.nick,lv:levelOf(c,p.nick),at:p.at,rec:p.recBase+p.rec.length,hits:p.hits,notice:!!p.notice,
  mine:p.nick===viewer,recd:p.rec.includes(viewer),
  comments:p.comments.map(x=>({nick:x.nick,lv:levelOf(c,x.nick),text:x.text,at:x.at}))};
}
const dirty=what=>({scope:'club',skipSelf:true,msg:{type:'club',op:'dirty',what}});
function rollDay(c,now){const k=dayKey(now);if(c.attend.day!==k){c.attend={day:k,rows:[]}}}
function sameRecent(list,nick,text,now,ms){
 for(let i=list.length-1;i>=Math.max(0,list.length-4);i--){const x=list[i];if(x.nick===nick&&x.text===text&&now-x.at<ms)return true}
 return false;
}
function attendReply(c,name,now){
 rollDay(c,now);
 const rows=c.attend.rows.slice(0,30).map((x,i)=>({n:i+1,nick:x.nick,lv:levelOf(c,x.nick),text:x.text,at:x.at}));
 return R('attend_list',{day:c.attend.day,rows,mine:c.attend.rows.some(x=>x.nick===name),total:c.attend.rows.length});
}

function apply(c,who,msg,now){
 now=now||Date.now();
 const name=nickOf(who&&who.name);
 const op=String(msg&&msg.op||'');
 c.touched=now;
 const writes=new Set(['post','comment','rec','del','scrawl','attend','chat','note']);
 if(writes.has(op)){
  if(RESERVED.test(name)||c.staff.includes(name))return ERR(op,'운영진과 같은 이름으로는 쓸 수 없어요. 이름을 바꿔서 다시 들어와 주세요.');
 }
 const me=member(c,name,now);
 const staffName=c.staff.includes(name);

 if(op==='hello'){
  const k=dayKey(now);if(me.day!==k){me.day=k;me.visits++}
  const unread=(nget(c,name)||[]).filter(n=>!n.read).length;
  rollDay(c,now);
  const lv=levelOf(c,name);
  const notice=c.posts.filter(p=>p.notice).sort((a,b)=>b.id-a.id)[0];
  return{ok:true,reply:R('hello',{me:{name,lv,label:labelOf(lv),points:points(me),posts:me.posts,comments:me.comments},
   unread,attended:c.attend.rows.some(x=>x.nick===name),
   counts:{posts:c.posts.length,members:mnames(c).length,attend:c.attend.rows.length},
   notice:notice?{id:notice.id,title:notice.title}:null,
   recent:c.posts.filter(p=>!p.notice).sort((a,b)=>b.id-a.id).slice(0,4).map(p=>rowOf(c,p))}),push:[]};
 }

 if(op==='list'){
  const all=c.posts.slice().sort((a,b)=>(b.notice-a.notice)||b.id-a.id);
  const pages=Math.max(1,Math.ceil(all.length/LIM.page));
  const page=Math.max(1,Math.min(pages,Math.floor(Number(msg.page))||1));
  return{ok:true,reply:R('list',{page,pages,total:all.length,rows:all.slice((page-1)*LIM.page,page*LIM.page).map(p=>rowOf(c,p))}),push:[]};
 }

 if(op==='get'){
  const p=c.posts.find(x=>x.id===Math.floor(Number(msg.id)));
  if(!p)return ERR(op,'삭제되었거나 없는 글입니다.');
  if(!msg.quiet)p.hits++;
  return{ok:true,reply:R('post',{post:postOf(c,p,name)}),push:[]};
 }

 if(op==='post'){
  const title=line(msg.title,LIM.title),body=para(msg.body,LIM.body);
  if(!title)return ERR(op,'제목을 입력해 주세요.');
  if(!body)return ERR(op,'내용을 입력해 주세요.');
  if(c.posts.slice(-4).some(p=>p.nick===name&&p.title===title&&now-p.at<6e4))return ERR(op,'같은 글을 계속 올리면 도배입니다. 잠시 후에 써 주세요.');
  const p={id:c.nextId++,title,body,nick:name,at:now,rec:[],recBase:0,hits:0,notice:false,comments:[]};
  c.posts.push(p);me.posts++;
  if(c.posts.length>LIM.posts){
   const old=c.posts.filter(x=>!x.notice).sort((a,b)=>a.id-b.id)[0];
   if(old)c.posts.splice(c.posts.indexOf(old),1);
  }
  return{ok:true,reply:R('post',{post:postOf(c,p,name),flash:'글이 등록되었습니다.',done:'post'}),push:[dirty('board')]};
 }

 if(op==='comment'){
  const p=c.posts.find(x=>x.id===Math.floor(Number(msg.id)));
  if(!p)return ERR(op,'삭제되었거나 없는 글입니다.');
  const text=line(msg.text,LIM.comment);
  if(!text)return ERR(op,'댓글 내용을 입력해 주세요.');
  if(sameRecent(p.comments,name,text,now,3e4))return ERR(op,'같은 댓글을 연달아 달면 도배입니다.');
  p.comments.push({nick:name,text,at:now});me.comments++;
  while(p.comments.length>LIM.comments)p.comments.shift();
  return{ok:true,reply:R('post',{post:postOf(c,p,name),flash:'댓글이 등록되었습니다.',done:'comment'}),push:[dirty('board')]};
 }

 if(op==='rec'){
  const p=c.posts.find(x=>x.id===Math.floor(Number(msg.id)));
  if(!p)return ERR(op,'삭제되었거나 없는 글입니다.');
  if(p.nick===name)return ERR(op,'내가 쓴 글은 추천할 수 없어요.');
  if(p.rec.includes(name))return ERR(op,'이미 추천한 글입니다.');
  p.rec.push(name);
  return{ok:true,reply:R('post',{post:postOf(c,p,name),flash:'추천했습니다.',done:'rec'}),push:[dirty('board')]};
 }

 if(op==='del'){
  const i=c.posts.findIndex(x=>x.id===Math.floor(Number(msg.id)));
  if(i<0)return ERR(op,'삭제되었거나 없는 글입니다.');
  if(c.posts[i].nick!==name||staffName||c.posts[i].notice)return ERR(op,'내가 쓴 글만 지울 수 있어요.');
  c.posts.splice(i,1);if(me.posts>0)me.posts--;
  return{ok:true,reply:R('deleted',{}),push:[dirty('board')]};
 }

 if(op==='scrawl_list'){
  return{ok:true,reply:R('scrawl_list',{rows:c.scrawl.slice(-24).reverse().map(x=>({nick:x.nick,lv:levelOf(c,x.nick),text:x.text,at:x.at}))}),push:[]};
 }
 if(op==='scrawl'){
  const text=line(msg.text,LIM.scrawl);
  if(!text)return ERR(op,'한 줄을 입력해 주세요.');
  if(sameRecent(c.scrawl,name,text,now,6e4))return ERR(op,'같은 낙서를 연달아 쓰면 도배입니다.');
  c.scrawl.push({nick:name,text,at:now});me.scr++;
  while(c.scrawl.length>LIM.scrawls)c.scrawl.shift();
  return{ok:true,reply:R('scrawl_list',{rows:c.scrawl.slice(-24).reverse().map(x=>({nick:x.nick,lv:levelOf(c,x.nick),text:x.text,at:x.at})),flash:'낙서를 남겼어요.'}),push:[dirty('scrawl')]};
 }

 if(op==='attend_list')return{ok:true,reply:attendReply(c,name,now),push:[]};
 if(op==='attend'){
  rollDay(c,now);
  if(c.attend.rows.some(x=>x.nick===name))return ERR(op,'오늘은 이미 출석했어요. 내일 또 와 주세요!');
  const text=line(msg.text,LIM.attend)||'출석합니다~';
  c.attend.rows.push({nick:name,text,at:now});me.att++;
  while(c.attend.rows.length>LIM.attends)c.attend.rows.pop();
  const r=attendReply(c,name,now);r.flash=c.attend.rows.length===1?'오늘의 출석 1등입니다!':'출석 도장을 찍었어요.';
  return{ok:true,reply:r,push:[dirty('attend')]};
 }

 if(op==='chat_log')return{ok:true,reply:R('chat_log',{rows:c.chat.slice(-20).map(x=>({nick:x.nick,st:c.staff.includes(x.nick)?1:0,text:x.text,at:x.at}))}),push:[]};
 if(op==='chat'){
  const text=line(msg.text,LIM.chat);
  if(!text)return{ok:false,reply:null,push:[]};
  const row={nick:name,st:staffName?1:0,text,at:now};
  c.chat.push({nick:name,text,at:now});while(c.chat.length>LIM.chats)c.chat.shift();
  return{ok:true,reply:null,push:[{scope:'club',skipSelf:false,msg:{type:'club',op:'chat',row}}]};
 }

 if(op==='inbox'){
  const box=nget(c,name)||[];
  const rows=box.slice().reverse().map(n=>({from:n.from,text:n.text,at:n.at,read:!!n.read}));
  for(const n of box)n.read=true;
  return{ok:true,reply:R('inbox',{rows}),push:[]};
 }
 if(op==='note'){
  const to=line(msg.to,LIM.nick),text=line(msg.text,LIM.note);
  if(!to)return ERR(op,'받는 사람을 골라 주세요.');
  if(!text)return ERR(op,'쪽지 내용을 입력해 주세요.');
  if(to===name)return ERR(op,'나에게는 쪽지를 보낼 수 없어요.');
  if(!mget(c,to))return ERR(op,'그런 닉네임의 회원이 없어요.');
  const box=nbox(c,to);
  box.push({from:name,text,at:now,read:false});
  while(box.length>LIM.box)box.shift();
  const push=[{scope:'to',to,msg:{type:'club',op:'note_new',from:name}}];
  /* 가상 회원은 바로 자동 답장을 보낸다 */
  if(own(c.npc,to)){
   const mine=nbox(c,name);
   mine.push({from:to,text:c.npc[to],at:now+1,read:false});
   while(mine.length>LIM.box)mine.shift();
   push.length=0;
   push.push({scope:'to',to:name,msg:{type:'club',op:'note_new',from:to},delayMs:900});
  }
  return{ok:true,reply:R('note_ok',{to}),push};
 }

 if(op==='members'){
  const rows=mnames(c).map(n=>({nick:n,lv:levelOf(c,n),points:points(mget(c,n))})).sort((a,b)=>(b.lv===STAFF_LV)-(a.lv===STAFF_LV)||b.points-a.points).slice(0,40);
  return{ok:true,reply:R('members',{rows}),push:[]};
 }

 return ERR(op,'알 수 없는 요청입니다.');
}

return{LIM,LABELS,STAFF_LV,labelOf,create,revive,apply,levelOf,points,when,dayKey,clock,line,para,nickOf,bytes};
});
