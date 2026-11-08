'use strict';
/* A88 우리동네 아지트: 진짜 서버와 웹소켓 접속 여러 개로 방 안 공유, 방 사이 분리, 쪽지, 속도 제한을 확인한다 */
const assert=require('node:assert/strict'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const srv=require(path.join(__dirname,'../server.js'));
 const server=srv.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const port=server.address().port,URL='ws://127.0.0.1:'+port+'/ws';
 const peers=[];
 async function peer(room,name){
  const ws=new WebSocket(URL),p={ws,name,msgs:[]};
  ws.addEventListener('message',e=>p.msgs.push(JSON.parse(e.data)));
  await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});
  ws.send(JSON.stringify({type:'join',room,name}));
  await until(p,m=>m.type==='welcome');peers.push(p);return p;
 }
 async function until(p,f,ms=2500,from=0){const t0=Date.now();for(;;){const m=p.msgs.slice(from).find(f);if(m)return m;if(Date.now()-t0>ms)throw new Error('시간 초과 '+p.name+' 조건 '+f.toString().slice(0,110)+' 받은 것 '+JSON.stringify(p.msgs.filter(m=>m.type==='club').map(m=>m.op+(m.message?':'+m.message:''))));await sleep(8)}}
 const club=(p,o)=>{p.ws.send(JSON.stringify({type:'club',...o}))};
 const mark=p=>p.msgs.length;
 const after=(p,at,f,ms)=>until(p,f,ms,at);
 const quiet=async(p,at,f,ms=250)=>{await sleep(ms);assert.ok(!p.msgs.slice(at).some(f),'받으면 안 되는 메시지 '+p.name)};
 const wait=()=>sleep(740); /* 쓰기 간격 제한 */
 try{
  const A=await peer('CLUBT1','민수'),B=await peer('CLUBT1','수진'),C=await peer('CLUBT2','타방'),D=await peer('CLUBT1','구경꾼');
  /* 1. 들어가기와 접속자 */
  club(A,{op:'enter'});
  let h=await until(A,m=>m.type==='club'&&m.op==='hello');
  assert.equal(h.me.name,'민수');assert.deepEqual(h.online,['민수']);assert.ok(h.t>1e12);assert.equal(h.counts.posts,12);
  assert.ok(h.counts.members>=13);
  club(B,{op:'enter'});
  const hb=await until(B,m=>m.type==='club'&&m.op==='hello');assert.deepEqual([...hb.online].sort(),['민수','수진']);
  const who=await until(A,m=>m.type==='club'&&m.op==='who'&&m.list.length===2);assert.deepEqual(who.list,['민수','수진']);
  assert.ok(srv.clubs.has('CLUBT1')&&!srv.clubs.has('CLUBT2'),'클럽은 쓰는 방에서만 만든다');

  /* 구경꾼은 목록만 읽고(접속 표시는 안 됨) 회원 명단에는 오른다 */
  club(D,{op:'list'});await until(D,m=>m.type==='club'&&m.op==='list');

  /* 2. 글쓰기: 쓴 사람은 답을, 같이 있는 사람은 새로 고침 알림을 받는다. 클럽을 안 연 사람은 못 받는다 */
  let a0=mark(A),b0=mark(B),d0=mark(D);
  club(A,{op:'post',title:'우리 모여라',body:'오늘 6시에 오락실 앞!'});
  const posted=await after(A,a0,m=>m.type==='club'&&m.op==='post');
  assert.equal(posted.post.nick,'민수');assert.equal(posted.flash,'글이 등록되었습니다.');
  const dirty=await after(B,b0,m=>m.type==='club'&&m.op==='dirty');assert.equal(dirty.what,'board');
  await quiet(A,a0,m=>m.type==='club'&&m.op==='dirty');
  await quiet(D,d0,m=>m.type==='club');
  club(B,{op:'list',page:1});
  const list=await after(B,b0,m=>m.type==='club'&&m.op==='list');
  assert.equal(list.total,13);assert.ok(list.rows.some(r=>r.title==='우리 모여라'&&r.nick==='민수'));
  /* 댓글과 추천 */
  b0=mark(B);a0=mark(A);
  club(B,{op:'comment',id:posted.post.id,text:'나도 갈게 ㅋㅋ'});
  const cm=await after(B,b0,m=>m.type==='club'&&m.op==='post');assert.equal(cm.post.comments[0].nick,'수진');
  await after(A,a0,m=>m.type==='club'&&m.op==='dirty');
  await wait();
  club(B,{op:'rec',id:posted.post.id});
  assert.equal((await after(B,b0,m=>m.type==='club'&&m.op==='post'&&m.post.rec===1)).post.recd,true);

  /* 3. 방 사이는 나뉜다 */
  club(C,{op:'enter'});
  const hc=await until(C,m=>m.type==='club'&&m.op==='hello');assert.equal(hc.counts.posts,12);assert.deepEqual(hc.online,['타방']);
  const c0=mark(C);
  club(A,{op:'chat',text:'아무나 있어?'});
  const chatB=await until(B,m=>m.type==='club'&&m.op==='chat');assert.equal(chatB.row.text,'아무나 있어?');assert.equal(chatB.row.nick,'민수');
  await until(A,m=>m.type==='club'&&m.op==='chat');
  await quiet(C,c0,m=>m.type==='club'&&m.op==='chat');
  assert.ok(!D.msgs.some(m=>m.type==='club'&&m.op==='chat'),'클럽을 열지 않은 사람에게는 가지 않는다');

  /* 4. 쪽지는 클럽을 안 열어도 알림이 가고, 열어 보면 읽힌다 */
  await wait();
  club(A,{op:'note',to:'구경꾼',text:'너도 와!'});
  assert.equal((await until(A,m=>m.type==='club'&&m.op==='note_ok')).to,'구경꾼');
  assert.equal((await until(D,m=>m.type==='club'&&m.op==='note_new')).from,'민수');
  await sleep(150);club(D,{op:'enter'});
  assert.equal((await until(D,m=>m.type==='club'&&m.op==='hello')).unread,1);
  await sleep(150);club(D,{op:'inbox'});
  assert.equal((await until(D,m=>m.type==='club'&&m.op==='inbox')).rows[0].text,'너도 와!');

  /* 5. 가상 회원은 자동 답장 (약간 늦게 온다) */
  const a1=mark(A);await wait();
  club(A,{op:'note',to:'쪼꼬미',text:'안녕'});
  await after(A,a1,m=>m.type==='club'&&m.op==='note_ok');
  assert.equal((await after(A,a1,m=>m.type==='club'&&m.op==='note_new',2500)).from,'쪼꼬미');

  /* 6. 속도 제한, 이상한 요청 */
  await wait();const a2=mark(A);
  club(A,{op:'post',title:'도배 1',body:'a'});club(A,{op:'post',title:'도배 2',body:'b'});
  const slow=await after(A,a2,m=>m.type==='club'&&m.op==='error');assert.match(slow.message,/천천히/);
  club(A,{});const bad=await after(A,a2,m=>m.type==='club'&&m.op==='error'&&m.message==='알 수 없는 요청입니다.');assert.ok(bad);
  A.ws.send(JSON.stringify({type:'club',op:{x:1}}));A.ws.send(JSON.stringify({type:'club',op:'list',page:'<b>'}));
  await sleep(300);assert.equal(A.ws.readyState,1,'이상한 요청에도 연결은 유지');

  /* 7. 운영진 이름은 못 쓴다 */
  const S=await peer('CLUBT1','운영자');
  club(S,{op:'enter'});await until(S,m=>m.type==='club'&&m.op==='hello');
  await sleep(150);club(S,{op:'post',title:'공지',body:'가짜 운영자'});
  assert.match((await until(S,m=>m.type==='club'&&m.op==='error')).message,/운영진/);

  /* 8. 나가면 접속자 목록에서 빠지고, 방이 비어도 글은 남는다 */
  const a3=mark(A);
  B.ws.close();
  const left=await after(A,a3,m=>m.type==='club'&&m.op==='who'&&!m.list.includes('수진'),3000);assert.ok(left.list.includes('민수'));
  for(const p of[A,D,S])p.ws.close();
  await sleep(300);
  const entry=srv.clubs.get('CLUBT1');assert.ok(entry&&entry.expires>Date.now(),'비면 6시간 뒤 삭제 예약');
  const A2=await peer('CLUBT1','민수');club(A2,{op:'enter'});
  const again=await until(A2,m=>m.type==='club'&&m.op==='hello');assert.equal(again.counts.posts,14,'다시 들어와도 글이 남아 있다');
  assert.equal(srv.clubs.get('CLUBT1').expires,0);
  /* 9. 모든 응답은 한 번에 8192바이트 이하 */
  for(const p of peers)for(const m of p.msgs)assert.ok(Buffer.byteLength(JSON.stringify(m))<=8192);
 }finally{
  for(const p of peers)try{p.ws.close()}catch{}
  server.close();
 }
 console.log('club server a88 ok');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
