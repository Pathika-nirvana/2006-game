'use strict';
/* A126 (2026-11-18 KST) 문방구 오락기 「동네 태권 대전」 온라인 2인 대전 중계:
   진짜 서버와 웹소켓 접속 여러 개로 짝짓기, 속도 재기, 시작 신호, 신호 전달과 거르기, 너무 잦은 신호 버리기,
   그만두기와 접속 끊김 알림, 방 사이 분리를 확인한다. */
const assert=require('node:assert/strict'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ARC=require(path.join(__dirname,'../server_arcade.js'));
/* 1. 혼자 계산되는 부분 */
assert.deepEqual(ARC.clean({k:'in',m:2,f:9,b:999,x:'나쁜 칸'}),{k:'in',m:2,f:9,b:255});
assert.deepEqual(ARC.clean({k:'pick',ch:7,dn:'yes'}),{k:'pick',ch:2,dn:1});
assert.deepEqual(ARC.clean({k:'hash',m:1,f:60,h:-5}),{k:'hash',m:1,f:60,h:0});
assert.deepEqual(ARC.clean({k:'again',junk:[1,2]}),{k:'again'});
assert.equal(ARC.clean({k:'eval'}),null);assert.equal(ARC.clean([1]),null);assert.equal(ARC.clean('in'),null);
assert.equal(ARC.delayFor(0,0),3,'가까우면 가장 적게');
assert.equal(ARC.delayFor(80,80),7);assert.equal(ARC.delayFor(2000,2000),10,'아주 멀어도 10칸까지');
(async()=>{
 const srv=require(path.join(__dirname,'../server.js'));
 const server=srv.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const port=server.address().port,URL='ws://127.0.0.1:'+port+'/ws';
 const peers=[];
 async function peer(room,name,auto=true){
  const ws=new WebSocket(URL),p={ws,name,msgs:[],auto};
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);p.msgs.push(m);if(m.type==='welcome')p.id=m.id;if(p.auto&&m.type==='duel'&&m.op==='probe')ws.send(JSON.stringify({type:'duel',op:'pong',n:m.n}))});
  await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});
  ws.send(JSON.stringify({type:'join',room,name}));
  await until(p,m=>m.type==='welcome');peers.push(p);return p;
 }
 async function until(p,f,ms=3000,from=0){const t0=Date.now();for(;;){const m=p.msgs.slice(from).find(f);if(m)return m;if(Date.now()-t0>ms)throw new Error('시간 초과 '+p.name+' '+f.toString().slice(0,100)+' 받은 것 '+JSON.stringify(p.msgs.filter(m=>m.type==='duel').slice(-6)));await sleep(10)}}
 const duel=(p,o)=>p.ws.send(JSON.stringify({type:'duel',...o}));
 const mark=p=>p.msgs.length;
 const D=(op)=>m=>m.type==='duel'&&m.op===op;
 const quiet=async(p,at,f,ms=250)=>{await sleep(ms);assert.ok(!p.msgs.slice(at).some(f),'받으면 안 되는 메시지 '+p.name+' '+JSON.stringify(p.msgs.slice(at).filter(f)))};
 try{
  const A=await peer('DUELA1','민수'),B=await peer('DUELA1','수진'),C=await peer('DUELA1','구경꾼'),X=await peer('DUELB1','다른방');
  /* 2. 먼저 누른 사람은 기다리고, 같은 방 사람들에게 기다린다는 소식이 간다 */
  let c0=mark(C),x0=mark(X);
  duel(A,{op:'queue'});
  await until(A,D('wait'));
  const lob=await until(C,m=>D('lobby')(m)&&m.waiting.length===1,3000,c0);assert.deepEqual(lob.waiting,[{id:A.id,name:'민수'}]);
  await quiet(X,x0,D('lobby'));
  /* 3. 두 번째 사람이 누르면 짝이 지어지고 속도를 세 번 잰 뒤 둘에게 시작 신호 */
  const a0=mark(A),b0=mark(B);
  duel(B,{op:'queue'});
  const sa=await until(A,D('start'),3000,a0),sb=await until(B,D('start'),3000,b0);
  assert.equal(A.msgs.slice(a0).filter(D('probe')).length,3,'속도 재기 세 번');
  assert.equal(sa.side,0);assert.equal(sb.side,1);assert.equal(sa.seed,sb.seed);assert.ok(sa.seed>0);
  assert.equal(sa.delay,sb.delay);assert.ok(sa.delay>=3&&sa.delay<=10);
  assert.deepEqual(sa.foe,{id:B.id,name:'수진'});assert.deepEqual(sb.foe,{id:A.id,name:'민수'});
  await until(C,m=>D('lobby')(m)&&m.waiting.length===0,3000,c0);
  /* 4. 신호는 상대에게만, 걸러서 간다 */
  let bb=mark(B),cc=mark(C),aa=mark(A);
  duel(A,{op:'relay',msg:{k:'in',m:1,f:4,b:300,evil:'<script>'}});
  const got=await until(B,D('msg'),3000,bb);assert.deepEqual(got.msg,{k:'in',m:1,f:4,b:255});
  duel(A,{op:'relay',msg:{k:'boom'}});duel(C,{op:'relay',msg:{k:'in',m:1,f:1,b:1}});
  await quiet(B,bb+1,D('msg'));await quiet(C,cc,D('msg'));await quiet(A,aa,D('msg'));
  duel(B,{op:'relay',msg:{k:'pick',ch:1,dn:1}});
  assert.deepEqual((await until(A,D('msg'),3000,aa)).msg,{k:'pick',ch:1,dn:1});
  /* 5. 1초에 180개를 넘는 신호는 버린다 (화면 1초는 60칸) */
  await sleep(1050);bb=mark(B);
  for(let i=0;i<220;i++)duel(A,{op:'relay',msg:{k:'in',m:1,f:100+i,b:i&255}});
  await sleep(400);
  const n=B.msgs.slice(bb).filter(D('msg')).length;assert.ok(n>=170&&n<=180,'받은 신호 '+n);
  await sleep(1050);/* 다음 1초부터는 다시 받는다 */
  /* 6. 그만두면 상대에게 알림, 다시 상대를 찾을 수 있다 */
  bb=mark(B);duel(A,{op:'cancel'});
  assert.equal((await until(B,D('leave'),3000,bb)).why,'left');
  bb=mark(B);duel(A,{op:'relay',msg:{k:'in',m:1,f:1,b:1}});await quiet(B,bb,D('msg'));
  /* 7. 대전 중 접속이 끊기면 gone */
  aa=mark(A);cc=mark(C);duel(C,{op:'queue'});await until(C,D('wait'),3000,cc);duel(A,{op:'queue'});
  await until(A,D('start'),3000,aa);await until(C,D('start'),3000,cc);
  aa=mark(A);C.ws.close();
  assert.equal((await until(A,D('leave'),3000,aa)).why,'gone');
  /* 8. 신호로 leave 를 보내도 짝이 풀린다 */
  aa=mark(A);bb=mark(B);duel(A,{op:'queue'});await until(A,D('wait'),3000,aa);duel(B,{op:'queue'});
  await until(A,D('start'),3000,aa);await until(B,D('start'),3000,bb);
  bb=mark(B);duel(A,{op:'relay',msg:{k:'leave'}});
  assert.deepEqual((await until(B,D('msg'),3000,bb)).msg,{k:'leave'});await until(B,D('leave'),3000,bb);
  /* 9. 속도 재기에 답하지 않는 사람이 있어도 조금 뒤에 시작한다 */
  const E=await peer('DUELC1','답함'),F=await peer('DUELC1','안답함',false);
  duel(E,{op:'queue'});await until(E,D('wait'));const t0=Date.now();duel(F,{op:'queue'});
  const se=await until(E,D('start'),5000),sf=await until(F,D('start'),5000);
  assert.ok(Date.now()-t0>=2000,'기다린 뒤 시작');assert.equal(se.seed,sf.seed);assert.ok(se.delay>=3);
  /* 10. 기다리던 사람이 나가면 목록에서 빠진다 */
  const G1=await peer('DUELD1','기다림'),H=await peer('DUELD1','지켜봄');let h0=mark(H);
  duel(G1,{op:'queue'});await until(H,m=>D('lobby')(m)&&m.waiting.length===1,3000,h0);h0=mark(H);G1.ws.close();
  await until(H,m=>D('lobby')(m)&&m.waiting.length===0,3000,h0);
  assert.deepEqual(srv.arcade.snapshot('DUELD1').waiting,[]);
  console.log('arcade duel A126 ok');
 }finally{for(const p of peers)try{p.ws.close()}catch{}server.close();setTimeout(()=>process.exit(process.exitCode||0),100)}
})().catch(e=>{console.error(e);process.exit(1)});
