/* A126 (2026-11-18 22:38 KST, 판 0.126.0): 문방구 오락기 「동네 태권 대전」 온라인 2인 대전 중계. server.js 가 불러 쓴다.
   같은 방(함께 걷기) 친구 둘을 먼저 온 순서대로 짝지어 주고, 두 오락기 화면이 주고받는 입력 신호를 그대로 건네준다.
   싸움 계산은 두 화면이 똑같이 하므로 서버는 싸움을 계산하지 않고 아무것도 저장하지 않는다.
   짝이 지어지면 두 사람에게 세 번씩 속도 재기(probe)를 보내고, 돌아온 시간으로 입력을 몇 칸 늦출지(delay) 정한다.
   받는 op: queue(상대 찾기) cancel(그만두기) relay(신호 msg) pong(속도 재기 답 n)
   보내는 op: wait(기다리는 중) probe(속도 재기 n) start(시작: side seed delay foe) msg(상대 신호) leave(상대가 나감 why)
             lobby(같은 방에서 상대를 기다리는 사람 목록) error(안내 글) */
'use strict';
const KINDS=new Set(['pick','in','hash','again','leave']);
const PROBES=3,PROBE_WAIT=2500,FRAME=1000/60;
function int(v,lo,hi){v=Math.floor(Number(v));return Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo}
/* 오락기 화면끼리 주고받는 신호만 통과시킨다. 모르는 칸은 버리고 숫자는 범위 안으로 자른다. */
function clean(msg){
  if(!msg||typeof msg!=='object'||Array.isArray(msg))return null;
  const k=String(msg.k||'');if(!KINDS.has(k))return null;
  if(k==='pick')return{k,ch:int(msg.ch,0,2),dn:msg.dn?1:0};
  if(k==='in')return{k,m:int(msg.m,0,1e6),f:int(msg.f,0,1e8),b:int(msg.b,0,255)};
  if(k==='hash')return{k,m:int(msg.m,0,1e6),f:int(msg.f,0,1e8),h:int(msg.h,0,4294967295)};
  return{k};
}
/* 두 사람 사이를 오가는 시간(한쪽 방향)으로 늦출 칸 수를 정한다. 3칸(0.05초)보다 적게, 10칸보다 많게는 하지 않는다. */
function delayFor(rttA,rttB){
  const one=(rttA+rttB)/2;
  return Math.max(3,Math.min(10,Math.ceil((one+28)/FRAME)));
}
function median(a){if(!a.length)return 160;const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)]}
/* opt.send(접속, 메시지), opt.members(방) → 같은 방 접속 목록, opt.now, opt.later(함수, ms), opt.stop(타이머) */
function create(opt){
  const send=opt.send,members=opt.members,now=opt.now||Date.now,later=opt.later||setTimeout,stop=opt.stop||clearTimeout;
  const waiting=new Map();/* 방 → 기다리는 접속 목록 */
  const live=s=>s&&!s.closed&&s.room;
  function queueOf(room){const q=(waiting.get(room)||[]).filter(x=>live(x)&&x.room===room&&!x.duel);if(q.length)waiting.set(room,q);else waiting.delete(room);return q}
  function lobby(room){const list=queueOf(room).map(x=>({id:x.id,name:x.name}));for(const m of members(room)||[])if(!m.closed)send(m,{type:'duel',op:'lobby',waiting:list})}
  function probe(d,s,n){d.sent.set(s,{n,t:now()});send(s,{type:'duel',op:'probe',n})}
  function pair(a,b){
    const d={a,b,seed:(Math.floor(Math.random()*2147483646)+1),rtt:new Map([[a,[]],[b,[]]]),sent:new Map(),started:false,timer:null,room:a.room};
    a.duel=b.duel=d;a.duelSide=0;b.duelSide=1;
    probe(d,a,1);probe(d,b,1);
    d.timer=later(()=>begin(d),PROBE_WAIT);
  }
  function begin(d){
    if(d.started||d.a.duel!==d||d.b.duel!==d)return;d.started=true;if(d.timer){stop(d.timer);d.timer=null}
    const delay=delayFor(median(d.rtt.get(d.a)),median(d.rtt.get(d.b)));d.delay=delay;
    send(d.a,{type:'duel',op:'start',side:0,seed:d.seed,delay,foe:{id:d.b.id,name:d.b.name}});
    send(d.b,{type:'duel',op:'start',side:1,seed:d.seed,delay,foe:{id:d.a.id,name:d.a.name}});
  }
  function foeOf(s){const d=s.duel;return d?(d.a===s?d.b:d.a):null}
  /* 짝을 풀고 상대에게 알린다. why: left(나감) gone(접속이 끊김) */
  function part(s,why){
    const d=s.duel;if(!d)return;const f=foeOf(s);
    if(d.timer){stop(d.timer);d.timer=null}
    s.duel=null;if(f&&f.duel===d){f.duel=null;if(live(f))send(f,{type:'duel',op:'leave',why})}
  }
  function dequeue(s){const room=s.room;if(!room)return false;const q=waiting.get(room)||[];const i=q.indexOf(s);if(i<0)return false;q.splice(i,1);if(!q.length)waiting.delete(room);return true}
  function message(s,obj){
    if(!live(s)||!obj||typeof obj!=='object')return;
    const op=String(obj.op||'').slice(0,10);
    if(op==='queue'){
      if(s.duel){if(!s.duel.started)return;part(s,'left')}
      const q=queueOf(s.room);
      if(q.includes(s)){send(s,{type:'duel',op:'wait'});return}
      const foe=q.find(x=>x!==s);
      if(foe){dequeue(foe);pair(foe,s);lobby(s.room);return}
      q.push(s);waiting.set(s.room,q);send(s,{type:'duel',op:'wait'});lobby(s.room);return;
    }
    if(op==='cancel'){const was=dequeue(s);part(s,'left');if(was)lobby(s.room);return}
    if(op==='pong'){
      const d=s.duel;if(!d||d.started)return;const p=d.sent.get(s);const n=int(obj.n,0,99);
      if(!p||p.n!==n)return;d.sent.delete(s);d.rtt.get(s).push(Math.max(0,now()-p.t));
      if(n<PROBES)probe(d,s,n+1);
      else if(d.rtt.get(d.a).length>=PROBES&&d.rtt.get(d.b).length>=PROBES)begin(d);
      return;
    }
    if(op==='relay'){
      const d=s.duel;if(!d||!d.started)return;
      /* 1초에 180개(화면 1초 60칸의 세 배)를 넘으면 그 1초 동안은 버린다 */
      const t=now();if(!s.duelWin||t-s.duelWin>=1000){s.duelWin=t;s.duelCount=0}
      if(++s.duelCount>180)return;
      const m=clean(obj.msg);if(!m)return;
      const f=foeOf(s);if(live(f))send(f,{type:'duel',op:'msg',msg:m});
      if(m.k==='leave')part(s,'left');
      return;
    }
  }
  /* 접속이 끊기거나 방을 떠날 때 */
  function leave(s){const room=s.room;const was=dequeue(s);part(s,'gone');if(was&&room)lobby(room)}
  function snapshot(room){return{waiting:queueOf(room).map(x=>x.id)}}
  return{message,leave,snapshot};
}
module.exports={create,clean,delayFor,KINDS,PROBES};
