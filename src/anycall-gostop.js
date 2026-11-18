/* A126 (2026-11-18 22:38 KST) 애니콜 휴대폰 게임 「모바일 신맞고」 판 0.126.0
   NATE 게임에서 받아서 휴대폰 게임 메뉴에서 하는 컴퓨터와의 맞고(둘이 치는 고스톱). 액정 화면(src/anycall-lcd.js)이 화면으로 붙인다.
   - 화투 48장과 보너스 피 2장(쌍피, 쓰리피). 한 사람 10장, 바닥 8장으로 시작한다.
   - 7점이 나면 고 또는 스톱. 1고 +1점, 2고 +2점, 3고부터 두 배씩. 흔들기와 폭탄 두 배, 멍따 두 배, 피박 · 광박 · 고박 두 배, 나가리 다음 판 두 배.
   - 쪽, 뻑, 자뻑, 따닥, 싹쓸이, 폭탄은 상대 피를 빼앗는다. 총통(같은 달 넉 장)은 바로 이긴다. 뻑 세 번 연달아 하면 바로 이긴다.
   - 패를 낼 때, 뒤집을 때, 먹을 때마다 소리와 진동과 화면 흔들림. 광, 홍단, 청단, 초단, 고도리, 고, 스톱 같은 일에는 큰 글씨 연출.
   - 화투 그림은 모두 코드로 그린다. 더 예쁜 그림은 A126_신맞고_그림_요청문.txt 의 요청문으로 만들어 보내 주시면 다음 판에서 끼운다.
   - 돈은 게임 안에서만 쓰는 게임 머니(원)다. 진짜 돈은 오가지 않는다. */
(function(w){'use strict';
const VERSION='A126';
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const won=n=>Math.round(n).toLocaleString('ko-KR');
/* ---------- 화투 ----------
   k: gwang 광, yeol 열끗, tti 띠, pi 피, ssang 쌍피, bonus 보너스 피
   s: 띠 종류(hong 홍단, cheong 청단, cho 초단, rain 비띠), 광 rain(비광), 열끗 godori(고도리 새), gukjin(9월 국진: 쌍피로도 셀 수 있음) */
const DECK_DEF=[
 [1,'gwang'],[1,'tti','hong'],[1,'pi'],[1,'pi'],
 [2,'yeol','godori'],[2,'tti','hong'],[2,'pi'],[2,'pi'],
 [3,'gwang'],[3,'tti','hong'],[3,'pi'],[3,'pi'],
 [4,'yeol','godori'],[4,'tti','cho'],[4,'pi'],[4,'pi'],
 [5,'yeol'],[5,'tti','cho'],[5,'pi'],[5,'pi'],
 [6,'yeol'],[6,'tti','cheong'],[6,'pi'],[6,'pi'],
 [7,'yeol'],[7,'tti','cho'],[7,'pi'],[7,'pi'],
 [8,'gwang'],[8,'yeol','godori'],[8,'pi'],[8,'pi'],
 [9,'yeol','gukjin'],[9,'tti','cheong'],[9,'pi'],[9,'pi'],
 [10,'yeol'],[10,'tti','cheong'],[10,'pi'],[10,'pi'],
 [11,'gwang'],[11,'ssang'],[11,'pi'],[11,'pi'],
 [12,'gwang','rain'],[12,'yeol'],[12,'tti','rain'],[12,'ssang'],
 [0,'bonus','2'],[0,'bonus','3']];
const MONTH=['보너스','송학','매조','벚꽃','흑싸리','난초','모란','홍싸리','공산','국화','단풍','오동','비'];
const CARDS=DECK_DEF.map((d,i)=>({id:i,m:d[0],k:d[1],s:d[2]||'',pv:d[1]==='pi'?1:d[1]==='ssang'?2:d[1]==='bonus'?+d[2]:0}));
/* 폭탄을 쓰면 손에 들어오는 빈 패 (내면 뒤집기만 한다) */
function dummy(st){const id=100+(st.dn=(st.dn||0)+1);const c={id,m:-1,k:'dummy',s:'',pv:0};st.extra[id]=c;return c}
function card(st,id){return id>=100?st.extra[id]:CARDS[id]}
const KNAME={gwang:'광',yeol:'열끗',tti:'띠',pi:'피',ssang:'쌍피',bonus:'보너스 피',dummy:'폭탄 패'};
function cardName(c){if(!c)return'';if(c.k==='bonus')return'보너스 '+(c.pv===3?'쓰리피':'쌍피');if(c.k==='dummy')return'폭탄 패';
 const t=c.k==='tti'?(c.s==='hong'?'홍단':c.s==='cheong'?'청단':c.s==='cho'?'초단':'비띠'):c.k==='gwang'?(c.s==='rain'?'비광':'광'):c.s==='godori'?'고도리 새':c.s==='gukjin'?'국진':KNAME[c.k];return c.m+'월 '+t}
/* ---------- 판의 규칙 (화면과 상관없이 돌아간다) ----------
   패가 있는 곳(z): deck 더미(맨 끝이 맨 위), floor 바닥, hand[0] 나 hand[1] 컴퓨터, cap[0] cap[1] 먹은 패, stage 막 뒤집은 패.
   규칙 함수는 판을 바로 바꾸면서, 같은 일을 하나씩 다시 해 볼 수 있는 기록(op)을 남긴다. 화면은 그 기록을 하나씩 움직여 보여 준다. */
function mkRnd(seed){let s=(seed>>>0)||1;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,rnd){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function newZones(){return{deck:[],floor:[],hand:[[],[]],cap:[[],[]],stage:[],meta:{}}}
function cloneZ(z){return{deck:z.deck.slice(),floor:z.floor.slice(),hand:[z.hand[0].slice(),z.hand[1].slice()],cap:[z.cap[0].slice(),z.cap[1].slice()],stage:z.stage.slice(),meta:{...z.meta}}}
function rmId(z,id){for(const a of [z.deck,z.floor,z.stage,z.hand[0],z.hand[1],z.cap[0],z.cap[1]]){const i=a.indexOf(id);if(i>=0){a.splice(i,1);return true}}return false}
function zoneArr(z,to,p){return to==='hand'?z.hand[p]:to==='cap'?z.cap[p]:z[to]}
function applyOp(z,op){
 if(op.op==='mv'){for(const id of op.ids){rmId(z,id);zoneArr(z,op.to,op.p).push(id)}}
 else if(op.op==='gone'){for(const id of op.ids)rmId(z,id)}
 else if(op.op==='add'){zoneArr(z,op.to,op.p).push(op.id)}
 else if(op.op==='meta'){z.meta[op.key]=op.v}}
function emit(st,op){applyOp(st.z,op);st.ops.push(op);return op}
const capCards=(st,p,z)=>(z||st.z).cap[p].map(id=>card(st,id));
const handCards=(st,p,z)=>(z||st.z).hand[p].map(id=>card(st,id));
const floorCards=(st,z)=>(z||st.z).floor.map(id=>card(st,id));
/* ---------- 점수 ---------- */
function tallyOf(cs,asPi){let gw=0,rainG=false,ye=0,god=0,tt=0,hong=0,cheong=0,cho=0,pi=0;
 for(const c of cs){if(!c)continue;switch(c.k){case 'gwang':gw++;if(c.s==='rain')rainG=true;break;
  case 'yeol':if(c.s==='gukjin'&&asPi)pi+=2;else{ye++;if(c.s==='godori')god++}break;
  case 'tti':tt++;if(c.s==='hong')hong++;else if(c.s==='cheong')cheong++;else if(c.s==='cho')cho++;break;
  case 'dummy':break;default:pi+=c.pv}}
 const P={gwang:gw===5?15:gw===4?4:gw===3?(rainG?2:3):0,yeol:ye>=5?ye-4:0,godori:god===3?5:0,tti:tt>=5?tt-4:0,hong:hong===3?3:0,cheong:cheong===3?3:0,cho:cho===3?3:0,pi:pi>=10?pi-9:0};
 let total=0;for(const k in P)total+=P[k];return{P,total,gw,ye,tt,pi,god,hong,cheong,cho,rainG,mung:ye>=7,asPi:!!asPi}}
/* 국진(9월 열끗)은 열끗 또는 쌍피 중 점수가 더 좋은 쪽으로 센다 */
function scoreOf(cs){const a=tallyOf(cs,false),b=tallyOf(cs,true);const va=a.total*(a.mung?2:1),vb=b.total*(b.mung?2:1);return vb>va?b:a}
function score(st,p,z){return scoreOf(capCards(st,p,z))}
/* ---------- 한 판 시작 ---------- */
const STAKE_GO=7;
function newGame(o={}){const st={z:newZones(),extra:{},dn:0,ops:[],rnd:o.rnd||mkRnd(o.seed||Date.now()),first:o.first||0,turn:o.first||0,goN:[0,0],goScore:[0,0],shake:[0,0],shook:[{},{}],
  ppeok:{},ppeokRun:[0,0],need:null,over:null,nagari:o.nagari||0,turnN:0,said:[{},{}],level:o.level==null?1:o.level,inst:!!o.instant};
 deal(st);return st}
function deal(st){let ids;
 for(let tries=0;tries<30;tries++){ids=shuffle(CARDS.map(c=>c.id),st.rnd);
  /* 바닥 8장 = 맨 위 8장. 바닥에 같은 달 넉 장이면 다시 섞는다 */
  const fl=[...ids.slice(0,4),...ids.slice(14,18)].map(i=>CARDS[i]),cnt={};let bad=false;for(const c of fl){if(c.m>0){cnt[c.m]=(cnt[c.m]||0)+1;if(cnt[c.m]===4)bad=true}}if(!bad)break}
 const z=st.z;z.deck=ids.slice().reverse();/* 맨 끝이 맨 위 */st.deck0=z.deck.slice();
 const take=n=>{const out=[];for(let i=0;i<n;i++)out.push(z.deck[z.deck.length-1-i]);return out};
 const f=st.first,o=1-f;
 for(const [to,p,n] of [['floor',0,4],['hand',f,5],['hand',o,5],['floor',0,4],['hand',f,5],['hand',o,5]])emit(st,{op:'mv',ids:take(n),to,p,dur:340,sfx:'deal',deal:1});
 /* 바닥의 보너스 피는 선이 가져가고 더미에서 한 장 채운다 */
 for(let g=0;g<6;g++){const b=floorCards(st).filter(c=>c.k==='bonus');if(!b.length)break;for(const c of b){emit(st,{op:'mv',ids:[c.id],to:'cap',p:f,dur:380,sfx:'bonus'});emit(st,{op:'fx',kind:'bonus',p:f});if(z.deck.length)emit(st,{op:'mv',ids:[z.deck[z.deck.length-1]],to:'floor',dur:300,sfx:'flip',flip:1})}}
 /* 총통: 손에 같은 달 넉 장 */
 for(const p of [f,o]){const cnt={};for(const c of handCards(st,p))if(c.m>0)cnt[c.m]=(cnt[c.m]||0)+1;const m=Object.keys(cnt).find(k=>cnt[k]===4);
  if(m){emit(st,{op:'fx',kind:'chongtong',p,m:+m,ids:handCards(st,p).filter(c=>c.m===+m).map(c=>c.id)});return finish(st,p,{special:'chongtong'})}}
 st.turn=f;st.need={type:'pick',p:f}}
/* ---------- 패 내기 ---------- */
const MONTH_OF=(st,id)=>card(st,id).m;
function canBomb(st,p,id){const c=card(st,id);if(!c||c.m<=0)return false;return handCards(st,p).filter(x=>x.m===c.m).length===3&&floorCards(st).filter(x=>x.m===c.m).length===1}
function canShake(st,p,id){const c=card(st,id);if(!c||c.m<=0||st.shook[p][c.m])return false;return handCards(st,p).filter(x=>x.m===c.m).length===3&&floorCards(st).filter(x=>x.m===c.m).length===0}
function pick(st,p,id,opt={}){const z=st.z;if(st.over||!st.need||st.need.type!=='pick'||st.need.p!==p||!z.hand[p].includes(id))return false;
 const c=card(st,id);st.need=null;st.pend=null;st.turnN++;
 emit(st,{op:'meta',key:'act'+p,v:st.turnN});
 if(c.k==='dummy'){emit(st,{op:'gone',ids:[id],dur:160,sfx:'flick',from:'hand',p});st.pend=null;return flip(st,p)}
 if(c.k==='bonus'){emit(st,{op:'mv',ids:[id],to:'cap',p,dur:420,sfx:'bonus',from:'hand'});emit(st,{op:'fx',kind:'bonus',p});
  if(z.deck.length)emit(st,{op:'mv',ids:[z.deck[z.deck.length-1]],to:'hand',p,dur:360,sfx:'draw'});st.need={type:'pick',p};return true}
 const hm=handCards(st,p).filter(x=>x.m===c.m),fm=floorCards(st).filter(x=>x.m===c.m);
 if(opt.bomb&&hm.length===3&&fm.length===1){
  emit(st,{op:'fx',kind:'bomb',p,ids:hm.map(x=>x.id)});emit(st,{op:'mv',ids:hm.map(x=>x.id),to:'floor',dur:380,sfx:'slam',from:'hand',p});
  emit(st,{op:'mv',ids:[...hm.map(x=>x.id),fm[0].id],to:'cap',p,dur:460,sfx:'capture'});st.shake[p]++;emit(st,{op:'meta',key:'shake'+p,v:st.shake[p]});
  stealPi(st,p,1,'bomb');for(let i=0;i<2;i++){const d=dummy(st);emit(st,{op:'add',id:d.id,to:'hand',p,dur:200,sfx:'draw'})}
  st.pend=null;return flip(st,p)}
 if(opt.shake&&hm.length===3&&fm.length===0&&!st.shook[p][c.m]){st.shook[p][c.m]=1;st.shake[p]++;emit(st,{op:'fx',kind:'shake',p,ids:hm.map(x=>x.id)});emit(st,{op:'meta',key:'shake'+p,v:st.shake[p]})}
 emit(st,{op:'mv',ids:[id],to:'floor',dur:300,sfx:'slap',from:'hand',p,hit:fm.length?fm[0].id:null});
 if(fm.length===2){st.need={type:'match',p,card:id,options:fm.map(x=>x.id),src:'hand'};return true}
 st.pend={card:id,m:c.m,n0:fm.length,mt:fm.map(x=>x.id)};return flip(st,p)}
/* 바닥에 같은 달이 두 장일 때 고른 패 */
function chooseMatch(st,p,pid){const N=st.need;if(!N||N.type!=='match'||N.p!==p||!N.options.includes(pid))return false;st.need=null;
 if(N.src==='hand'){const other=N.options.find(x=>x!==pid);st.pend={card:N.card,m:card(st,N.card).m,n0:2,mt:[pid],other};emit(st,{op:'fx',kind:'pickOne',p,ids:[pid]});return flip(st,p)}
 emit(st,{op:'mv',ids:[N.card,pid],to:'cap',p,dur:380,sfx:'match'});return settle(st,p,N.fl||{})}
function flip(st,p){const z=st.z;
 if(!z.deck.length){resolvePend(st,p);return settle(st,p,{})}
 const fid=z.deck[z.deck.length-1],F=card(st,fid);
 emit(st,{op:'mv',ids:[fid],to:'stage',dur:300,sfx:'flip',flip:1});
 if(F.k==='bonus'){emit(st,{op:'mv',ids:[fid],to:'cap',p,dur:420,sfx:'bonus'});emit(st,{op:'fx',kind:'bonus',p});return flip(st,p)}
 const P=st.pend;
 if(P&&P.card!=null&&F.m===P.m){
  if(P.n0===0){emit(st,{op:'mv',ids:[fid],to:'floor',dur:260,sfx:'slap',hit:P.card});emit(st,{op:'fx',kind:'jjok',p});emit(st,{op:'mv',ids:[P.card,fid],to:'cap',p,dur:420,sfx:'capture'});stealPi(st,p,1,'jjok');st.pend=null;return settle(st,p,{})}
  if(P.n0===1){emit(st,{op:'mv',ids:[fid],to:'floor',dur:260,sfx:'slap',hit:P.card});emit(st,{op:'fx',kind:'ppeok',p,m:F.m});st.ppeok[F.m]={by:p};st.pend=null;st.ppeokRun[p]++;
   if(st.ppeokRun[p]>=3){emit(st,{op:'fx',kind:'ppeok3',p});return finish(st,p,{special:'ppeok3'})}return settle(st,p,{ppeok:1})}
  if(P.n0===2){emit(st,{op:'mv',ids:[fid],to:'floor',dur:260,sfx:'slap',hit:P.card});emit(st,{op:'fx',kind:'ttadak',p});emit(st,{op:'mv',ids:[P.card,...P.mt,P.other,fid],to:'cap',p,dur:460,sfx:'capture'});stealPi(st,p,1,'ttadak');st.pend=null;return settle(st,p,{})}}
 resolvePend(st,p);
 const fm=floorCards(st).filter(x=>x.m===F.m);
 emit(st,{op:'mv',ids:[fid],to:'floor',dur:260,sfx:'slap',hit:fm.length?fm[0].id:null});
 if(fm.length===0)return settle(st,p,{});
 if(fm.length===1){emit(st,{op:'mv',ids:[fid,fm[0].id],to:'cap',p,dur:380,sfx:'match'});return settle(st,p,{})}
 if(fm.length===2){st.need={type:'match',p,card:fid,options:fm.map(x=>x.id),src:'flip'};return true}
 eatPile(st,p,F.m,[fid,...fm.map(x=>x.id)]);return settle(st,p,{})}
function resolvePend(st,p){const P=st.pend;st.pend=null;if(!P||P.card==null)return;
 if(P.n0===1||P.n0===2)emit(st,{op:'mv',ids:[P.card,P.mt[0]],to:'cap',p,dur:380,sfx:'match'});
 else if(P.n0===3)eatPile(st,p,P.m,[P.card,...P.mt])}
/* 같은 달 넉 장을 한꺼번에 먹기. 뻑 무더기면 상대 피를 빼앗는다 (내가 싼 뻑이면 자뻑, 두 장) */
function eatPile(st,p,m,ids){const pp=st.ppeok[m];emit(st,{op:'mv',ids,to:'cap',p,dur:460,sfx:'capture'});
 if(pp){delete st.ppeok[m];const self=pp.by===p;emit(st,{op:'fx',kind:self?'jappeok':'ppeokEat',p});stealPi(st,p,self?2:1,'ppeok')}else emit(st,{op:'fx',kind:'four',p})}
/* 상대 피 빼앗기: 피 한 장을 먼저, 없으면 쌍피 */
function stealPi(st,p,n,why){const o=1-p;for(let i=0;i<n;i++){const cs=capCards(st,o);const c=cs.find(x=>x.k==='pi')||cs.find(x=>x.k==='ssang')||cs.find(x=>x.k==='bonus');if(!c){emit(st,{op:'fx',kind:'noPi',p});break}
  emit(st,{op:'mv',ids:[c.id],to:'cap',p,dur:440,sfx:'steal',steal:1,from:'cap',fp:o})}}
const SETS=[['gwang','광'],['godori','고도리'],['hong','홍단'],['cheong','청단'],['cho','초단']];
/* 판 정리: 싹쓸이, 새 족보 알림, 고/스톱 묻기 */
function settle(st,p,fl){const z=st.z;if(!fl.ppeok)st.ppeokRun[p]=0;
 const last=!z.hand[0].length&&!z.hand[1].length;
 if(!z.floor.length&&!last&&z.deck.length){emit(st,{op:'fx',kind:'sweep',p});stealPi(st,p,1,'sweep')}
 const sc=score(st,p),pv=st.said[p];
 for(const [k] of SETS){const v=k==='gwang'?sc.gw:sc.P[k];if(k==='gwang'){if(sc.gw>=3&&(pv.gw||0)<sc.gw){emit(st,{op:'fx',kind:'gwang',p,n:sc.gw,rain:sc.rainG});pv.gw=sc.gw}}else if(v>0&&!pv[k]){emit(st,{op:'fx',kind:k,p});pv[k]=1}}
 if(sc.mung&&!pv.mung){emit(st,{op:'fx',kind:'mung',p});pv.mung=1}
 if(sc.total>=STAKE_GO&&sc.total>st.goScore[p]){if(!z.hand[p].length)return stop(st,p);st.need={type:'gostop',p,score:sc.total};emit(st,{op:'fx',kind:'canGo',p,score:sc.total});return true}
 return nextTurn(st,p)}
function nextTurn(st,p){const z=st.z;if(!z.hand[0].length&&!z.hand[1].length)return nagari(st);
 const n=1-p;st.turn=z.hand[n].length?n:p;st.need={type:'pick',p:st.turn};return true}
function goStop(st,p,goOn){const N=st.need;if(!N||N.type!=='gostop'||N.p!==p)return false;st.need=null;
 if(!goOn)return stop(st,p);st.goN[p]++;st.goScore[p]=score(st,p).total;emit(st,{op:'fx',kind:'go',p,n:st.goN[p]});emit(st,{op:'meta',key:'go'+p,v:st.goN[p]});return nextTurn(st,p)}
function stop(st,p){st.need=null;emit(st,{op:'fx',kind:'stop',p});return finish(st,p,{})}
function nagari(st){st.need=null;emit(st,{op:'fx',kind:'nagari'});st.over={draw:true,nagari:st.nagari+1};emit(st,{op:'end'});return true}
/* ---------- 계산 ---------- */
function settlement(st,wn,o={}){const l=1-wn;const a=score(st,wn),b=score(st,l);const mults=[];let pts;
 if(o.special){pts=10;mults.push([o.special==='chongtong'?'총통':'세 번 뻑',0])}
 else{pts=a.total;const g=st.goN[wn];if(g>0){pts+=g;if(g>=3)mults.push([g+'고',Math.pow(2,g-2)])}
  if(st.shake[wn])mults.push([st.shake[wn]>1?'흔들기 '+st.shake[wn]+'번':'흔들기',Math.pow(2,st.shake[wn])]);
  if(a.mung)mults.push(['멍따',2]);
  if(a.P.pi>0&&b.pi<=5)mults.push(['피박',2]);
  if(a.P.gwang>0&&b.gw===0)mults.push(['광박',2]);
  if(st.goN[l]>0)mults.push(['고박',2])}
 if(st.nagari>0)mults.push(['나가리 판',Math.pow(2,st.nagari)]);
 let k=1;for(const m of mults)if(m[1])k*=m[1];
 return{winner:wn,base:a.total,P:a.P,go:o.special?0:st.goN[wn],pts,mult:k,mults,final:pts*k,special:o.special||null,loserPi:b.pi,loserGw:b.gw}}
function finish(st,wn,o){st.need=null;st.over=settlement(st,wn,o);emit(st,{op:'end',winner:wn});return true}
/* ---------- 컴퓨터 상대 ----------
   level 0 쉬움(자주 실수하고 겁이 많다), 1 보통, 2 어려움(남은 패를 세고 고를 잘 부른다) */
function unseen(st,p,m){/* p 가 볼 수 없는 같은 달 패 수 (상대 손 + 더미) */const z=st.z;let n=0;for(const id of [...z.hand[1-p],...z.deck]){const c=card(st,id);if(c&&c.m===m)n++}return n}
/* p 가 이 패를 먹으면 얼마나 좋은가 (족보 진행을 본다) */
function cval(st,p,c){if(!c||c.k==='dummy')return 0;const mine=capCards(st,p),opp=capCards(st,1-p);const cnt=(cs,f)=>cs.filter(f).length;
 switch(c.k){
  case 'gwang':{const n=cnt(mine,x=>x.k==='gwang');return 7+n*4-(c.s==='rain'&&n<2?2:0)}
  case 'yeol':{let v=3;if(c.s==='godori'){const n=cnt(mine,x=>x.s==='godori'),on=cnt(opp,x=>x.s==='godori');v=on?3.5:5+n*4}const ny=cnt(mine,x=>x.k==='yeol');if(ny>=4)v+=2;if(ny>=6)v+=3;return v}
  case 'tti':{let v=3;if(c.s!=='rain'){const same=cnt(mine,x=>x.k==='tti'&&x.s===c.s),os=cnt(opp,x=>x.k==='tti'&&x.s===c.s);v+=os?0:same*3}if(cnt(mine,x=>x.k==='tti')>=4)v+=2;return v}
  case 'ssang':return 4.2;case 'bonus':return c.pv+2;
  default:{let np=0;for(const x of mine)np+=x.k==='pi'||x.k==='ssang'||x.k==='bonus'?x.pv:0;return 1.4+(np>=7?1.2:0)}}}
/* 상대가 이 패를 먹으면 얼마나 아픈가 */
const deny=(st,p,c)=>cval(st,1-p,c);
function aiPick(st,p){const z=st.z,hand=handCards(st,p),floor=floorCards(st),L=st.level;let best=null,bv=-1e9;
 for(const c of hand){let v=0,opt={};
  if(c.k==='bonus')v=100;
  else if(c.k==='dummy')v=.6;
  else{const fm=floor.filter(x=>x.m===c.m),hm=hand.filter(x=>x.m===c.m);
   if(canBomb(st,p,c.id)){v=40+fm.reduce((a,x)=>a+cval(st,p,x),0)+hm.reduce((a,x)=>a+cval(st,p,x),0);opt.bomb=true}
   else if(fm.length===0){const u=unseen(st,p,c.m);v=-deny(st,p,c)*(u>0?.75:.25)-.3;if(hm.length===2&&u===1)v-=2;/* 남은 한 장을 내가 들고 있으면 기다리는 편이 낫다 */if(L>=2&&hm.length>=2)v-=1}
   else if(fm.length===1){v=2+cval(st,p,c)+cval(st,p,fm[0]);const u=unseen(st,p,c.m);if(u>0&&z.deck.length)v-=(L>=1?2.2:1)*u/(z.deck.length+z.hand[1-p].length)*3}
   else if(fm.length===2){v=2.5+cval(st,p,c)+Math.max(...fm.map(x=>cval(st,p,x)))}
   else{v=5+cval(st,p,c)+fm.reduce((a,x)=>a+cval(st,p,x),0)+(st.ppeok[c.m]?(st.ppeok[c.m].by===p?9:6):0)}
   if(canShake(st,p,c.id)&&L>0){opt.shake=true;v+=1.5}}
  if(L===0)v+=st.rnd()*6-3;else if(L===1)v+=st.rnd()*1.2-.6;
  if(v>bv){bv=v;best={id:c.id,opt}}}
 return best}
function aiMatch(st,p,options){let best=options[0],bv=-1e9;for(const id of options){const v=cval(st,p,card(st,id))+(st.level===0?st.rnd()*4:0);if(v>bv){bv=v;best=id}}return best}
function aiGo(st,p){const z=st.z,me=score(st,p).total,op=score(st,1-p).total,L=st.level,hand=z.hand[p].length,deck=z.deck.length,g=st.goN[p];
 if(hand<=1||deck<=2)return false;
 if(L===0)return me<9&&op<=2&&hand>=5&&g===0&&st.rnd()<.5;
 if(op>=5||(st.goN[1-p]>0&&op>=4))return false;
 if(L>=2){if(op<=2&&hand>=4&&g<3)return true;if(op<=3&&hand>=5&&me<12)return true;return false}
 if(g>=2)return op<=1&&hand>=5;return me<11&&op<=3&&hand>=4}
/* 한 걸음: 컴퓨터 차례면 고르고, 아니면 아무것도 안 함. instant 판(시험용)에서는 둘 다 컴퓨터로 끝까지 */
function aiStep(st,p){const N=st.need;if(!N||N.p!==p)return false;
 if(N.type==='pick'){const b=aiPick(st,p);if(!b)return false;return pick(st,p,b.id,b.opt)}
 if(N.type==='match')return chooseMatch(st,p,aiMatch(st,p,N.options));
 if(N.type==='gostop')return goStop(st,p,aiGo(st,p));return false}
function playOut(st,maxSteps=400){let n=0;while(!st.over&&st.need&&n++<maxSteps)aiStep(st,st.need.p);return st}
/* ---------- 화투 그림 (코드로 그린다) ----------
   카드 한 장을 화면 배율에 맞춘 작은 그림판에 한 번 그려 두고 붙인다. 달마다 꽃과 동물, 광은 붉은 동그라미 光, 띠는 띠지. */
let MK=null;
function mkcv(wd,ht){try{const c=MK?MK(Math.max(1,Math.round(wd)),Math.max(1,Math.round(ht))):null;if(!c)return null;const g=c.getContext&&c.getContext('2d');return g?{c,g,w:c.width,h:c.height}:null}catch(_){return null}}
const ART=new Map();
function cachedArt(key,fn){if(ART.has(key))return ART.get(key);let v=null;try{v=fn()}catch(_){v=null}ART.set(key,v);if(ART.size>900){const k0=ART.keys().next().value;ART.delete(k0)}return v}
const COL={cream:'#fbf4e2',edge:'#3a1c14',red:'#d4232b',redD:'#8e1218',blue:'#2456b8',green:'#2f6b2a',greenD:'#1d4219',black:'#1c1820',pink:'#f08aa8',pinkL:'#ffd0de',
 purple:'#6a3aa0',yellow:'#f2c230',gold:'#e8b030',brown:'#7a4a24',sky:'#e86a3a',white:'#ffffff',gray:'#8a8a96'};
function el(g,x,y,rx,ry,c,rot){g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,Math.PI*2);g.fill()}
function poly(g,pts,c){g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill()}
function ln(g,x0,y0,x1,y1,c,wd){g.strokeStyle=c;g.lineWidth=wd;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()}
function curve(g,pts,c,wd){g.strokeStyle=c;g.lineWidth=wd;g.lineCap='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length-1;i+=2)g.quadraticCurveTo(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);g.stroke()}
function rrect(g,x,y,wd,ht,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+wd-r,y);g.quadraticCurveTo(x+wd,y,x+wd,y+r);g.lineTo(x+wd,y+ht-r);g.quadraticCurveTo(x+wd,y+ht,x+wd-r,y+ht);g.lineTo(x+r,y+ht);g.quadraticCurveTo(x,y+ht,x,y+ht-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
/* 꽃잎 다섯 장 */
function flower(g,x,y,r,c,cc){for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;el(g,x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.48,r*.48,c)}el(g,x,y,r*.32,r*.32,cc||COL.yellow)}
function leaf(g,x,y,len,ang,c){g.save();g.translate(x,y);g.rotate(ang);el(g,len/2,0,len/2,len*.2,c);g.restore()}
/* 띠: 비스듬한 띠지. kind hong 붉은 글씨 띠, cheong 파란 띠, cho 붉은 민 띠, rain 비띠 */
function ribbon(g,W,H,kind){const col=kind==='cheong'?COL.blue:COL.red;g.save();g.translate(W*.42,H*.12);g.rotate(.12);g.fillStyle=col;g.fillRect(0,0,W*.2,H*.62);
 g.fillStyle='rgba(255,255,255,.25)';g.fillRect(W*.02,0,W*.035,H*.62);
 if(kind==='hong'||kind==='cheong'){g.fillStyle=COL.black;for(let i=0;i<3;i++)g.fillRect(W*.075,H*(.08+i*.15),W*.05,H*.09)}
 if(kind==='rain'){g.strokeStyle=COL.black;g.lineWidth=W*.03;g.beginPath();for(let i=0;i<6;i++)g.lineTo(W*(i%2?.15:.05),H*(.05+i*.1));g.stroke()}
 poly(g,[[0,H*.62],[W*.1,H*.68],[W*.2,H*.62],[W*.2,H*.7],[0,H*.7]],col);g.restore()}
function gwangMark(g,W,H){el(g,W*.76,H*.15,W*.17,W*.17,COL.red);g.fillStyle=COL.white;g.font='bold '+(W*.24).toFixed(2)+'px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('光',W*.76,H*.155)}
function ssangMark(g,W,H){el(g,W*.8,H*.86,W*.15,W*.15,COL.gold);g.fillStyle=COL.black;g.font='bold '+(W*.2).toFixed(2)+'px "Malgun Gothic",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('쌍',W*.8,H*.865)}
function bird(g,x,y,s,body,wing,beak,flip){g.save();g.translate(x,y);if(flip)g.scale(-1,1);el(g,0,0,s*.55,s*.32,body);el(g,s*.42,-s*.2,s*.2,s*.2,body);poly(g,[[s*.6,-s*.22],[s*.82,-s*.16],[s*.6,-s*.12]],beak);el(g,-s*.1,-s*.12,s*.35,s*.15,wing,-.4);poly(g,[[-s*.5,0],[-s*.85,-s*.12],[-s*.8,s*.12]],body);el(g,s*.47,-s*.24,s*.04,s*.04,COL.black);g.restore()}
/* 달마다 그림. W,H = 카드 크기, c = 카드 */
function monthArt(g,c,W,H){const k=c.k,s=c.s;
 switch(c.m){
 case 1:{/* 송학: 솔과 해와 학 */if(k==='gwang'){g.fillStyle='#f6d6c0';g.fillRect(0,0,W,H*.55);el(g,W*.5,H*.32,W*.26,W*.26,COL.red)}
  ln(g,W*.5,H*.95,W*.48,H*.5,COL.brown,W*.08);for(const [x,y,r] of [[.3,.62,.2],[.66,.58,.22],[.5,.45,.2],[.28,.82,.18],[.72,.8,.2]])el(g,W*x,H*y,W*r,W*r*.7,COL.green);for(const [x,y] of [[.3,.6],[.66,.56],[.5,.43]])el(g,W*x,H*y,W*.1,W*.06,COL.greenD);
  if(k==='gwang'){el(g,W*.32,H*.78,W*.2,W*.13,COL.white);ln(g,W*.4,H*.74,W*.52,H*.56,COL.black,W*.05);el(g,W*.53,H*.55,W*.06,W*.06,COL.red)}break}
 case 2:{/* 매조: 매화 가지와 꾀꼬리 */curve(g,[[W*.1,H*.9],[W*.3,H*.5],[W*.75,H*.25]],COL.black,W*.07);ln(g,W*.4,H*.55,W*.75,H*.7,COL.black,W*.05);
  for(const [x,y] of [[.25,.62],[.42,.42],[.6,.3],[.72,.62],[.55,.66],[.82,.24]])flower(g,W*x,H*y,W*.11,COL.red,COL.pinkL);if(k==='yeol')bird(g,W*.48,H*.82,W*.38,'#d8c040','#a09020','#e07020');break}
 case 3:{/* 벚꽃: 벚꽃 무리, 광은 장막 */for(const [x,y] of [[.2,.18],[.4,.12],[.6,.2],[.8,.14],[.3,.32],[.55,.36],[.75,.34],[.15,.45],[.45,.5],[.85,.48]])flower(g,W*x,H*y,W*.1,COL.pink,COL.pinkL);
  if(k==='gwang'){for(let i=0;i<6;i++){g.fillStyle=i%2?COL.white:COL.red;g.fillRect(W*(.08+i*.14),H*.58,W*.14,H*.34)}g.fillStyle=COL.redD;g.fillRect(W*.06,H*.56,W*.88,H*.04)}
  else{ln(g,W*.5,H*.95,W*.45,H*.55,COL.brown,W*.06)}break}
 case 4:case 7:{/* 흑싸리(검정) 홍싸리(빨강): 늘어진 줄기 */const sc=c.m===4?COL.black:'#b02020',dc=c.m===4?'#c02020':'#5a1010';
  for(let i=0;i<4;i++){const x=W*(.18+i*.2);curve(g,[[x,H*.02],[x+W*.12,H*.3],[x+W*.02,H*.6]],sc,W*.035);for(let j=0;j<5;j++)leaf(g,x+W*.05*Math.sin(j),H*(.08+j*.11),W*.12,.5+j*.2,sc)}
  for(const [x,y] of [[.3,.45],[.62,.4],[.8,.58]])el(g,W*x,H*y,W*.04,W*.04,dc);
  if(k==='yeol'&&c.m===4){el(g,W*.72,H*.8,W*.13,W*.13,'#f0a030');bird(g,W*.38,H*.76,W*.36,'#4a4a58','#2a2a34','#e0a020',true)}
  if(k==='yeol'&&c.m===7){el(g,W*.5,H*.8,W*.3,H*.1,'#6a3a1a');el(g,W*.76,H*.76,W*.12,H*.07,'#6a3a1a');for(const x of [.32,.42,.58,.68])ln(g,W*x,H*.86,W*x,H*.95,'#3a1a0a',W*.05);el(g,W*.84,H*.75,W*.03,W*.03,COL.white)}
  break}
 case 5:{/* 난초: 붓꽃과 다리 */for(let i=0;i<5;i++)curve(g,[[W*(.2+i*.15),H*.98],[W*(.15+i*.16),H*.6],[W*(.25+i*.14),H*.3]],COL.green,W*.045);
  for(const [x,y] of [[.3,.3],[.62,.24],[.8,.4]]){el(g,W*x,H*y,W*.1,W*.14,COL.purple);el(g,W*x,H*y+W*.06,W*.06,W*.05,'#d8b0f0')}
  if(k==='yeol'){g.save();g.translate(W*.1,H*.82);g.rotate(-.35);for(let i=0;i<5;i++){g.fillStyle=i%2?'#8a5a2a':'#a87038';g.fillRect(i*W*.17,0,W*.15,H*.07)}g.restore()}break}
 case 6:{/* 모란: 큰 붉은 꽃과 나비 */for(const [x,y,a] of [[.25,.75,.3],[.75,.72,-.4],[.5,.88,0]])leaf(g,W*x,H*y,W*.3,a,'#2a6a5a');
  el(g,W*.5,H*.55,W*.3,W*.24,COL.redD);el(g,W*.5,H*.53,W*.24,W*.19,COL.red);el(g,W*.5,H*.5,W*.14,W*.11,'#ff6a70');el(g,W*.5,H*.49,W*.06,W*.05,COL.yellow);
  if(k==='yeol'){for(const [x,y,cc] of [[.3,.2,'#f0c040'],[.68,.16,'#60a0e0']]){el(g,W*x-W*.06,H*y,W*.08,W*.1,cc,-.4);el(g,W*x+W*.06,H*y,W*.08,W*.1,cc,.4);ln(g,W*x,H*y-W*.08,W*x,H*y+W*.08,COL.black,W*.025)}}break}
 case 8:{/* 공산: 검은 산, 광은 붉은 하늘에 흰 달, 열끗은 기러기 */if(k==='gwang'||k==='yeol'){g.fillStyle=k==='gwang'?'#e85a30':'#f0a070';g.fillRect(0,0,W,H*.55)}
  if(k==='gwang')el(g,W*.5,H*.28,W*.3,W*.3,'#fff8e0');
  if(k==='yeol')for(const [x,y] of [[.3,.2],[.52,.12],[.72,.24]]){poly(g,[[W*x-W*.12,H*y],[W*x,H*y+W*.05],[W*x+W*.12,H*y],[W*x,H*y+W*.1]],COL.black)}
  g.fillStyle=COL.black;g.beginPath();g.moveTo(0,H);g.lineTo(0,H*.55);g.quadraticCurveTo(W*.5,H*.32,W,H*.55);g.lineTo(W,H);g.closePath();g.fill();
  for(let i=0;i<5;i++)ln(g,W*(.15+i*.18),H*.95,W*(.12+i*.18),H*.7,'#5a5a60',W*.02);break}
 case 9:{/* 국화: 노란 국화, 열끗은 술잔 */for(const [x,y] of [[.3,.7],[.7,.72]])leaf(g,W*x,H*y,W*.28,x<.5?-.6:.6,COL.green);
  for(const [x,y,r] of [[.5,.42,.2],[.25,.25,.12],[.78,.28,.12]]){for(let i=0;i<12;i++){const a=i/12*Math.PI*2;el(g,W*x+Math.cos(a)*W*r*.6,H*y+Math.sin(a)*W*r*.6,W*r*.32,W*r*.18,COL.yellow,a)}el(g,W*x,H*y,W*r*.4,W*r*.4,'#e08a20')}
  if(k==='yeol'){poly(g,[[W*.3,H*.72],[W*.7,H*.72],[W*.6,H*.9],[W*.4,H*.9]],COL.red);el(g,W*.5,H*.72,W*.2,H*.03,'#ff6a5a');g.fillStyle=COL.gold;g.font='bold '+(W*.16).toFixed(2)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('壽',W*.5,H*.81)}break}
 case 10:{/* 단풍: 붉은 잎, 열끗은 사슴 */for(const [x,y,r] of [[.25,.2,.14],[.6,.15,.12],[.8,.35,.13],[.4,.42,.15],[.18,.6,.12],[.7,.6,.12]]){for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;poly(g,[[W*x,H*y],[W*x+Math.cos(a-.25)*W*r,H*y+Math.sin(a-.25)*W*r],[W*x+Math.cos(a)*W*r*1.25,H*y+Math.sin(a)*W*r*1.25],[W*x+Math.cos(a+.25)*W*r,H*y+Math.sin(a+.25)*W*r]],COL.red)}}
  if(k==='yeol'){el(g,W*.48,H*.8,W*.24,H*.08,'#a0602a');el(g,W*.7,H*.7,W*.08,H*.06,'#a0602a');for(const x of [.32,.42,.55,.62])ln(g,W*x,H*.84,W*x,H*.96,'#6a3a1a',W*.04);ln(g,W*.7,H*.65,W*.66,H*.56,'#6a3a1a',W*.03);ln(g,W*.74,H*.65,W*.8,H*.56,'#6a3a1a',W*.03)}break}
 case 11:{/* 오동: 검은 잎, 광은 봉황 */g.fillStyle='#f2e6a8';g.fillRect(0,H*.6,W,H*.4);for(const [x,y,r] of [[.25,.2,.2],[.6,.15,.22],[.82,.38,.16],[.4,.4,.2]])el(g,W*x,H*y,W*r,W*r*.8,COL.black);
  if(k==='gwang'){bird(g,W*.45,H*.72,W*.6,'#d03030','#30a060','#f0c030');el(g,W*.2,H*.78,W*.14,W*.06,'#f0c030',-.3)}else for(let i=0;i<3;i++)ln(g,W*(.3+i*.2),H*.65,W*(.3+i*.2),H*.95,'#a0a040',W*.05);break}
 case 12:{/* 비: 빗줄기와 버들, 광은 우산 쓴 사람, 열끗 제비, 쌍피 번개 북 */g.fillStyle='#4a4a58';for(let i=0;i<7;i++)ln(g,W*(.1+i*.14),H*.05,W*(.04+i*.14),H*.35,'rgba(90,90,110,.7)',W*.02);
  for(let i=0;i<3;i++)curve(g,[[W*(.7+i*.08),H*.02],[W*(.6+i*.1),H*.4],[W*(.75+i*.07),H*.75]],'#3a7a3a',W*.03);
  if(k==='gwang'){poly(g,[[W*.15,H*.48],[W*.5,H*.3],[W*.72,H*.5]],COL.yellow);ln(g,W*.44,H*.42,W*.44,H*.86,COL.brown,W*.03);el(g,W*.38,H*.62,W*.1,W*.1,'#f0d0b0');el(g,W*.38,H*.78,W*.14,H*.12,COL.black);el(g,W*.7,H*.9,W*.08,W*.05,'#3a9a3a')}
  else if(k==='yeol')bird(g,W*.4,H*.62,W*.5,'#1a1a3a','#3a3a6a','#c02020');
  else if(k==='ssang'){el(g,W*.45,H*.62,W*.22,W*.22,COL.red);g.strokeStyle=COL.black;g.lineWidth=W*.04;g.beginPath();g.arc(W*.45,H*.62,W*.12,0,Math.PI*1.4);g.stroke();poly(g,[[W*.1,H*.75],[W*.3,H*.85],[W*.22,H*.86],[W*.35,H*.98],[W*.12,H*.84],[W*.2,H*.83]],'#f0d040')}
  break}}
 if(k==='tti')ribbon(g,W,H,s);
 if(k==='gwang')gwangMark(g,W,H);
 if(k==='ssang'||(k==='yeol'&&s==='gukjin'))ssangMark(g,W,H)}
/* 카드 한 장 그림 (ds = 화면 배율). id 대신 'back' 이면 뒷면 */
function cardCv(c,wd,ht,ds){const key=(c?c.id:'back')+':'+wd+'x'+ht+':'+ds;return cachedArt(key,()=>{const cv=mkcv(wd*ds,ht*ds);if(!cv)return null;const g=cv.g;g.scale(ds,ds);const r=Math.max(1,wd*.1);
 if(!c){/* 뒷면: 붉은 바탕에 마름모 무늬 */rrect(g,0,0,wd,ht,r);g.fillStyle='#b8141c';g.fill();g.save();g.clip();g.strokeStyle='rgba(255,190,120,.35)';g.lineWidth=wd*.06;for(let i=-4;i<8;i++){ln(g,i*wd*.25,0,i*wd*.25+ht,ht,'rgba(255,190,120,.3)',wd*.05);ln(g,i*wd*.25,ht,i*wd*.25+ht,0,'rgba(120,0,0,.35)',wd*.05)}
  el(g,wd/2,ht/2,wd*.28,wd*.28,'#6a0a10');g.fillStyle='#ffd27a';g.font='bold '+(wd*.3).toFixed(2)+'px "Malgun Gothic",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('花',wd/2,ht/2+wd*.01);g.restore();
  rrect(g,.3,.3,wd-.6,ht-.6,r);g.strokeStyle='#2a0004';g.lineWidth=.6;g.stroke();return cv}
 if(c.k==='dummy'){rrect(g,0,0,wd,ht,r);g.fillStyle='#3a3a44';g.fill();g.fillStyle='#ff9a40';g.font='bold '+(wd*.32).toFixed(2)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('폭',wd/2,ht*.4);g.fillText('탄',wd/2,ht*.66);return cv}
 rrect(g,0,0,wd,ht,r);g.fillStyle=c.k==='bonus'?'#ffd84a':COL.cream;g.fill();g.save();rrect(g,.5,.5,wd-1,ht-1,r*.8);g.clip();
 if(c.k==='bonus'){g.fillStyle='#ffb020';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;poly(g,[[wd/2,ht/2],[wd/2+Math.cos(a)*wd,ht/2+Math.sin(a)*wd],[wd/2+Math.cos(a+.4)*wd,ht/2+Math.sin(a+.4)*wd]],'rgba(255,255,255,.35)')}
  g.fillStyle=COL.red;g.font='bold '+(wd*.62).toFixed(2)+'px "Malgun Gothic",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(c.pv),wd/2,ht*.42);g.fillStyle=COL.black;g.font='bold '+(wd*.26).toFixed(2)+'px "Malgun Gothic",sans-serif';g.fillText('보너스',wd/2,ht*.78)}
 else monthArt(g,c,wd,ht);
 g.restore();rrect(g,.3,.3,wd-.6,ht-.6,r);g.strokeStyle=COL.edge;g.lineWidth=.55;g.stroke();
 /* 작은 달 숫자 (왼쪽 위) */if(c.m>0&&wd>=14){g.fillStyle='rgba(255,255,255,.8)';g.fillRect(.6,.6,wd*.32,ht*.17);g.fillStyle=COL.redD;g.font='bold '+(wd*.26).toFixed(2)+'px "Malgun Gothic",sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(String(c.m),1,1)}
 return cv})}
/* 상대 얼굴 (작은 그림) */
const OPP=[{n:'옆집 할머니',lv:0,stake:100,hair:'#d8d8e0',skin:'#f0c8a0',cloth:'#7a4a8a',glasses:0,
  say:{go:['할미도 고!','고~ 해 볼까나'],stop:['스톱! 할미가 이겼네','아이고 스톱이여'],ppeok:['아이고 뻑이네','어머 뻑이야'],jjok:['쪽! 미안혀~'],win:['용돈 잘 받을게~'],lose:['할미가 졌네 허허'],sweep:['싹 쓸었다~']}},
 {n:'복덕방 김 사장',lv:1,stake:300,hair:'#2a2a30',skin:'#e8b890',cloth:'#3a4a6a',glasses:1,
  say:{go:['고 한 번 가 보지!','고! 사나이는 고야'],stop:['여기서 스톱이네','스톱! 계산하시게'],ppeok:['어허 뻑이로구먼','뻑이야 뻑'],jjok:['쪽! 허허 미안하네'],win:['자네 아직 멀었어'],lose:['오늘은 운이 없구먼'],sweep:['싹쓸이 받게!']}},
 {n:'전설의 꾼 박 씨',lv:2,stake:1000,hair:'#4a3a30',skin:'#d8a880',cloth:'#1a1a1a',glasses:2,
  say:{go:['...고.','고.'],stop:['스톱.','끝이다.'],ppeok:['...뻑.','손이 미끄러졌군'],jjok:['쪽.'],win:['패가 말해 주지.'],lose:['오늘은 졌다.'],sweep:['쓸었다.']}}];
function faceCv(o,sz,ds){return cachedArt('face:'+o.n+':'+sz+':'+ds,()=>{const cv=mkcv(sz*ds,sz*ds);if(!cv)return null;const g=cv.g;g.scale(ds,ds);const s=sz;
 rrect(g,0,0,s,s,s*.15);g.fillStyle='#2a3a5a';g.fill();el(g,s*.5,s*1.02,s*.42,s*.28,o.cloth);el(g,s*.5,s*.5,s*.27,s*.3,o.skin);
 if(o.lv===0){el(g,s*.5,s*.28,s*.3,s*.16,o.hair);el(g,s*.5,s*.18,s*.12,s*.1,o.hair)}else if(o.lv===1){el(g,s*.5,s*.26,s*.28,s*.12,o.hair)}else{el(g,s*.5,s*.24,s*.34,s*.08,'#2a2420');el(g,s*.5,s*.17,s*.2,s*.1,'#2a2420')}
 if(o.glasses===1){g.strokeStyle='#1a1a1a';g.lineWidth=s*.04;g.strokeRect(s*.32,s*.46,s*.14,s*.08);g.strokeRect(s*.54,s*.46,s*.14,s*.08)}else if(o.glasses===2){g.fillStyle='#101010';g.fillRect(s*.3,s*.45,s*.4,s*.08)}else{el(g,s*.4,s*.5,s*.03,s*.02,'#2a2a2a');el(g,s*.6,s*.5,s*.03,s*.02,'#2a2a2a')}
 g.strokeStyle='#8a4a3a';g.lineWidth=s*.03;g.beginPath();g.arc(s*.5,s*.6,s*.08,.2,Math.PI-.2);g.stroke();if(o.lv===0){el(g,s*.36,s*.6,s*.04,s*.025,'rgba(255,120,120,.5)');el(g,s*.64,s*.6,s*.04,s*.025,'rgba(255,120,120,.5)')}
 return cv})}
/* ---------- 소리: 패 치는 소리, 짝, 뻑, 쪽, 따닥, 폭탄, 고, 스톱 ... 그리고 가야금 같은 배경 가락 ---------- */
const AU={out:null,ctx:null,nb:null,bgm:null,last:{}};
let host=null,K=null,D=null;
function actx(){try{return host&&host.audioCtx?host.audioCtx():null}catch(_){return null}}
function avol(){try{return host&&host.audioVol?host.audioVol():0}catch(_){return 0}}
function bus(c){if(AU.out&&AU.ctx===c)return AU.out;AU.ctx=c;AU.out=c.createGain();AU.out.connect(c.destination);AU.nb=null;return AU.out}
function noise(c){if(AU.nb&&AU.nbc===c)return AU.nb;const n=Math.floor(c.sampleRate*.8),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;AU.nb=b;AU.nbc=c;return b}
function tone(c,o,type,f1,f2,at,dur,gv){const os=c.createOscillator();os.type=type;os.frequency.setValueAtTime(f1,at);if(f2!==f1)os.frequency.exponentialRampToValueAtTime(Math.max(20,f2),at+dur);const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(gv,at+Math.min(.01,dur*.2));g.gain.exponentialRampToValueAtTime(.0001,at+dur);os.connect(g);g.connect(o);os.start(at);os.stop(at+dur+.03)}
function hiss(c,o,ft,f1,f2,at,dur,gv,q){const n=c.createBufferSource();n.buffer=noise(c);const f=c.createBiquadFilter();f.type=ft;f.Q.value=q||1;f.frequency.setValueAtTime(f1,at);if(f2&&f2!==f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,f2),at+dur);const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(gv,at+.004);g.gain.exponentialRampToValueAtTime(.0001,at+dur);n.connect(f);f.connect(g);g.connect(o);n.start(at,Math.random()*.4);n.stop(at+dur+.03)}
/* 패 내리치는 소리: 짧은 딱 + 낮은 쿵. 세기 k */
function slap(c,o,at,k){hiss(c,o,'bandpass',2600,900,at,.06,.5*k,1.4);tone(c,o,'sine',170,55,at,.11,.55*k);hiss(c,o,'lowpass',500,200,at,.09,.25*k)}
const SFX={
 deal:(c,o,t)=>{hiss(c,o,'bandpass',3200,1800,t,.04,.18,2);tone(c,o,'triangle',900,700,t,.025,.05)},
 slap:(c,o,t)=>slap(c,o,t,1),slam:(c,o,t)=>{slap(c,o,t,1.4);slap(c,o,t+.07,1.2);tone(c,o,'sine',90,35,t,.3,.5)},
 flip:(c,o,t)=>{hiss(c,o,'highpass',2500,6000,t,.07,.25);tone(c,o,'square',1300,1600,t+.03,.03,.05)},
 match:(c,o,t)=>{slap(c,o,t,.9);hiss(c,o,'bandpass',4200,3000,t+.05,.05,.3,3);tone(c,o,'triangle',1568,1568,t+.06,.08,.08)},
 capture:(c,o,t)=>{hiss(c,o,'bandpass',1200,3600,t,.18,.22,1.2);for(let i=0;i<3;i++)tone(c,o,'triangle',1047*Math.pow(1.26,i),1047*Math.pow(1.26,i),t+.05+i*.05,.09,.07)},
 steal:(c,o,t)=>{hiss(c,o,'bandpass',3000,600,t,.22,.3,1.5);slap(c,o,t+.2,.7);tone(c,o,'square',880,1320,t+.22,.08,.06)},
 draw:(c,o,t)=>hiss(c,o,'bandpass',2000,3000,t,.05,.15,2),flick:(c,o,t)=>hiss(c,o,'highpass',3000,5000,t,.05,.18),
 bonus:(c,o,t)=>{for(let i=0;i<4;i++)tone(c,o,'square',1319*Math.pow(1.19,i),1319*Math.pow(1.19,i),t+i*.05,.09,.07);hiss(c,o,'highpass',6000,6000,t,.25,.08)},
 kiss:(c,o,t)=>{hiss(c,o,'highpass',2000,2000,t,.03,.5);tone(c,o,'sine',900,2400,t,.06,.25);hiss(c,o,'highpass',2500,2500,t+.12,.03,.4);tone(c,o,'sine',1000,2600,t+.12,.06,.2)},
 ppeok:(c,o,t)=>{tone(c,o,'sine',110,38,t,.45,.8);hiss(c,o,'lowpass',1400,200,t,.5,.6);tone(c,o,'sawtooth',320,110,t+.08,.5,.16)},
 ttadak:(c,o,t)=>{slap(c,o,t,1.5);slap(c,o,t+.11,1.5);for(let i=0;i<4;i++)tone(c,o,'square',784*Math.pow(1.26,i),784*Math.pow(1.26,i),t+.24+i*.06,.1,.08)},
 sweep:(c,o,t)=>{hiss(c,o,'bandpass',400,4000,t,.55,.45,1.1);for(let i=0;i<6;i++)tone(c,o,'triangle',1568*Math.pow(1.12,i),1568*Math.pow(1.12,i),t+.35+i*.05,.12,.06)},
 boom:(c,o,t)=>{tone(c,o,'sine',80,26,t,.8,.9);hiss(c,o,'lowpass',2400,120,t,.9,.8);hiss(c,o,'bandpass',300,80,t+.1,.8,.4)},
 rattle:(c,o,t)=>{for(let i=0;i<10;i++){hiss(c,o,'bandpass',2600+i*80,2200,t+i*.045,.03,.25,3);tone(c,o,'triangle',600+(i%2)*200,600,t+i*.045,.03,.05)}},
 gwang:(c,o,t)=>{for(let i=0;i<5;i++)tone(c,o,'sine',1047*Math.pow(1.335,i%3)*(i>2?2:1),1047*Math.pow(1.335,i%3)*(i>2?2:1),t+i*.07,.5,.09);hiss(c,o,'highpass',7000,9000,t,.6,.08)},
 dan:(c,o,t)=>{[523,659,784,1047].forEach((f,i)=>{tone(c,o,'triangle',f,f,t+i*.07,.35,.12);tone(c,o,'sine',f*2,f*2,t+i*.07,.25,.04)})},
 birds:(c,o,t)=>{for(let i=0;i<6;i++){const b=2600+Math.random()*900;tone(c,o,'sine',b,b*1.3,t+i*.09,.06,.08);tone(c,o,'sine',b*1.1,b*1.4,t+i*.09+.04,.05,.05)}},
 go:(c,o,t,n)=>{const k=Math.pow(1.12,(n||1)-1);tone(c,o,'square',330*k,660*k,t,.22,.16);tone(c,o,'sawtooth',494*k,988*k,t,.25,.08);tone(c,o,'square',660*k,660*k,t+.22,.25,.12);slap(c,o,t,1)},
 stamp:(c,o,t)=>{tone(c,o,'sine',140,50,t,.25,.7);hiss(c,o,'lowpass',900,300,t,.15,.5);tone(c,o,'square',220,180,t+.02,.08,.08)},
 fanfare:(c,o,t)=>{[[523,0],[659,.12],[784,.24],[1047,.36],[784,.54],[1047,.66]].forEach(([f,d])=>{tone(c,o,'square',f,f,t+d,.16,.09);tone(c,o,'triangle',f/2,f/2,t+d,.16,.08)});hiss(c,o,'highpass',5000,8000,t+.36,.6,.06)},
 lose:(c,o,t)=>{[[392,0],[370,.25],[349,.5],[330,.75]].forEach(([f,d])=>tone(c,o,'triangle',f,f*.98,t+d,.3,.12))},
 trombone:(c,o,t)=>{[[294,0,.35],[277,.4,.35],[262,.8,.35],[247,1.2,.9]].forEach(([f,d,du])=>{tone(c,o,'sawtooth',f,f*.97,t+d,du,.07);tone(c,o,'sine',f/2,f/2*.97,t+d,du,.08)})},
 coin:(c,o,t)=>{tone(c,o,'square',988,988,t,.05,.07);tone(c,o,'square',1319,1319,t+.05,.12,.07)},
 cursor:(c,o,t)=>tone(c,o,'square',1200,1200,t,.02,.04),pop:(c,o,t)=>tone(c,o,'sine',600,1200,t,.06,.1),
 count:(c,o,t)=>tone(c,o,'square',1568,1568,t,.02,.03),deny:(c,o,t)=>tone(c,o,'square',200,180,t,.12,.08)};
function sfx(id,arg){try{if(D&&D.games&&D.games.gostop&&D.games.gostop.sfx===0)return;const c=actx();if(!c){if(host&&host.beep)host.beep([700],40,.04,'square');return}const now=c.currentTime;if(AU.last[id]&&now-AU.last[id]<.03)return;AU.last[id]=now;
 const o=bus(c);o.gain.value=.5*avol();const f=SFX[id];if(f)f(c,o,now+.005,arg)}catch(_){}}
function buzz(p){try{if(D&&D.games&&D.games.gostop&&D.games.gostop.vib===0)return;host&&host.vibrate&&host.vibrate(p,'touch')}catch(_){}}
/* 배경 가락: 가야금처럼 튕기는 소리 + 장구 (덩, 기덕). 5음 음계 */
const BGM={bpm:96,len:32,mel:'A4:1 C5:.5 D5:.5 E5:1 D5:.5 C5:.5 A4:1 G4:1 A4:2 C5:1 D5:.5 E5:.5 G5:1 E5:1 D5:2 E5:1 D5:.5 C5:.5 A4:1 C5:1 D5:1 E5:.5 D5:.5 C5:1 A4:1 G4:.5 A4:.5 C5:1 A4:3',
 bass:'A2:2 A2:2 E2:2 A2:2 D2:2 D2:2 E2:2 E2:2 A2:2 A2:2 D2:2 D2:2 E2:2 G2:2 A2:4',
 drum:'D:1 k:.5 k:.5 D:1 k:1 D:1 k:.5 k:.5 D:1 R:1 D:1 k:.5 k:.5 D:1 k:1 D:1 k:.5 k:.5 D:.5 k:.5 k:.5 k:.5 D:1 k:.5 k:.5 D:1 k:1 D:1 k:.5 k:.5 D:1 R:1 D:1 k:.5 k:.5 D:1 k:1 D:1 D:1 D:2'};
const NOTE={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
function nf(n){const m=/^([A-G]#?)(\d)$/.exec(n);return m?440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12):0}
function track(str){const ev=[];let t=0;for(const tok of str.trim().split(/\s+/)){const [n,d]=tok.split(':');const du=+d||1;if(n!=='R')ev.push({t,d:du,n});t+=du}return{ev,len:t}}
const BT={mel:track(BGM.mel),bass:track(BGM.bass),drum:track(BGM.drum)};
function bgmOn(){return!(D&&D.games&&D.games.gostop&&D.games.gostop.bgm===0)}
function bgmStart(){bgmStop();if(!bgmOn())return;const c=actx();if(!c)return;try{const g=c.createGain();g.gain.value=.14*avol();g.connect(c.destination);AU.bgm={g,t0:c.currentTime+.1,idx:[0,0,0],loop:0}}catch(_){AU.bgm=null}}
function bgmStop(){const B=AU.bgm;AU.bgm=null;if(B){try{const c=actx();if(c){B.g.gain.setValueAtTime(B.g.gain.value,c.currentTime);B.g.gain.linearRampToValueAtTime(0,c.currentTime+.2)}setTimeout(()=>{try{B.g.disconnect()}catch(_){}},300)}catch(_){}}}
function bgmTick(){const B=AU.bgm;if(!B)return;const c=actx();if(!c){AU.bgm=null;return}if(c.state==='suspended')return;const spb=60/BGM.bpm,ahead=c.currentTime+.35;const T=[BT.mel,BT.bass,BT.drum];
 B.g.gain.value=.14*avol()*(AU.duck>Date.now()?.25:1);
 for(let guard=0;guard<3;guard++){let done=true;for(let k=0;k<3;k++){const tr=T[k];let i=B.idx[k];while(i<tr.ev.length&&B.t0+tr.ev[i].t*spb<ahead){const e=tr.ev[i],at=B.t0+e.t*spb;if(at>=c.currentTime-.05)bgmNote(c,B.g,k,e,at,e.d*spb);i++}B.idx[k]=i;if(i<tr.ev.length)done=false}
  if(done&&B.t0+BGM.len*spb<ahead){B.t0+=BGM.len*spb;B.idx=[0,0,0];B.loop++}else break}}
function bgmNote(c,o,k,e,at,dur){try{if(k===0){const f=nf(e.n);/* 가야금: 세모파 튕김 + 살짝 떨림 */const os=c.createOscillator();os.type='triangle';os.frequency.setValueAtTime(f,at);os.frequency.setValueAtTime(f*1.012,at+dur*.5);os.frequency.linearRampToValueAtTime(f,at+dur*.9);const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(.5,at+.006);g.gain.exponentialRampToValueAtTime(.0005,at+Math.min(1.4,dur+.5));os.connect(g);g.connect(o);os.start(at);os.stop(at+dur+.6);tone(c,o,'sine',f*2,f*2,at,.25,.12)}
 else if(k===1)tone(c,o,'triangle',nf(e.n),nf(e.n),at,Math.min(.6,dur),.5);
 else if(e.n==='D'){tone(c,o,'sine',130,60,at,.22,.7);hiss(c,o,'lowpass',400,150,at,.12,.25)}else{hiss(c,o,'bandpass',3200,2400,at,.04,.3,2);tone(c,o,'triangle',800,600,at,.03,.08)}}catch(_){}}
/* ---------- 화면: 자리, 움직임, 연출, 조작 ---------- */
const W=150,H=184;
const DECK={x:67,y:61},STAGE={x:88,y:56},CARD={w:15,h:22},HANDC={w:18,h:27},MINI={w:11,h:16},MINI2={w:9,h:13};
/* 바닥 자리 16곳: 위 줄 6, 가운데 양옆 4, 아래 줄 6 */
const SLOTS=(()=>{const xs=[3,27,51,75,99,123],L=[];for(const x of xs)L.push([x,34]);for(const x of xs)L.push([x,90]);for(const x of [3,27,99,123])L.push([x,62]);return L})();
const GROUPS=[['gwang',2],['yeol',30],['tti',64],['pi',98]];
const groupOf=c=>c.k==='gwang'?'gwang':c.k==='yeol'?'yeol':c.k==='tti'?'tti':'pi';
const U={mode:'title',sel:0,opp:1,st:null,V:null,opi:0,flights:[],timers:[],busy:0,parts:[],banners:[],rings:[],shake:{t0:0,a:0,dur:1},flash:null,cursor:0,choice:null,think:0,say:null,res:null,pause:null,slots:{},ds:2,
 lastWinner:0,nagari:0,help:0,speed:1,t:0,menu:0,sett:0};
const now=()=>K&&K.now?K.now():Date.now();
function gsData(){if(!D.games||typeof D.games!=='object')D.games={};const g=D.games.gostop||(D.games.gostop={});if(!Number.isFinite(g.money))g.money=50000;for(const k of ['win','lose','draw','best','refill','ppeok','go'])if(!Number.isFinite(g[k]))g[k]=0;if(g.bgm==null)g.bgm=1;if(g.sfx==null)g.sfx=1;if(g.vib==null)g.vib=1;if(g.fast==null)g.fast=0;return g}
function sv(){try{K.save&&K.save()}catch(_){}}
/* ---------- 패 자리 ---------- */
function syncSlots(V,st){const months=new Set(V.floor.map(id=>card(st,id).m));for(const m of Object.keys(U.slots))if(!months.has(+m))delete U.slots[m];
 const used=new Set(Object.values(U.slots));for(const m of months){if(U.slots[m]!=null)continue;let s=0;while(used.has(s)&&s<SLOTS.length-1)s++;U.slots[m]=s;used.add(s)}}
function handXY(n,i){const step=n>1?Math.min(19,(W-6-HANDC.w)/(n-1)):0,x0=(W-(step*(n-1)+HANDC.w))/2;return[x0+i*step,154]}
function posOf(V,st,id){const c=card(st,id);
 if(V.deck.includes(id))return{x:DECK.x,y:DECK.y,w:16,h:24,face:false};
 if(V.stage.includes(id))return{x:STAGE.x,y:STAGE.y,w:HANDC.w,h:HANDC.h,face:true};
 let i=V.hand[0].indexOf(id);if(i>=0){const [x,y]=handXY(V.hand[0].length,i);return{x,y,w:HANDC.w,h:HANDC.h,face:true,hand:i}}
 i=V.hand[1].indexOf(id);if(i>=0)return{x:94+i*5,y:2,w:8,h:11,face:false};
 i=V.floor.indexOf(id);if(i>=0){const m=c.m,s=U.slots[m]!=null?U.slots[m]:0,sl=SLOTS[s]||SLOTS[0];const same=V.floor.filter(x=>card(st,x).m===m);const k=same.indexOf(id);return{x:sl[0]+k*4,y:sl[1]+k*2,w:CARD.w,h:CARD.h,face:true}}
 for(const p of [0,1]){i=V.cap[p].indexOf(id);if(i>=0){const gk=groupOf(c),G=GROUPS.find(g=>g[0]===gk);const list=V.cap[p].filter(x=>groupOf(card(st,x))===gk);const k=list.indexOf(id);const n=list.length;const room=gk==='pi'?W-G[1]-12:30;const step=n>1?Math.min(p?5:6,room/(n-1)):0;
   const M=p?MINI2:MINI;return{x:G[1]+k*step,y:p?14:117,w:M.w,h:M.h,face:true}}}
 return{x:DECK.x,y:DECK.y,w:16,h:24,face:false}}
/* ---------- 연출 ---------- */
const SP=()=>U.speed;
function addTimer(at,fn){U.timers.push({at,fn})}
function particles(x,y,n,o={}){for(let i=0;i<n;i++){const a=(o.a0!=null?o.a0:0)+Math.random()*(o.spread!=null?o.spread:Math.PI*2),v=(o.v||40)*(.4+Math.random()*.8);
 U.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),ay:o.g!=null?o.g:60,t0:U.t,life:(o.life||600)*(.6+Math.random()*.6),col:o.cols?o.cols[i%o.cols.length]:(o.col||'#fff'),sz:(o.sz||1.6)*(.6+Math.random()*.8),sh:o.sh||'dot',rot:Math.random()*6})}
 if(U.parts.length>420)U.parts.splice(0,U.parts.length-420)}
function ring(x,y,col,r1,dur){U.rings.push({x,y,col,r1:r1||16,t0:U.t,dur:dur||380})}
function shake(a,dur){U.shake={t0:U.t,a,dur:dur||300}}
function flash(col,a,dur){U.flash={col,a:a||.6,t0:U.t,dur:dur||300}}
function banner(text,o={}){U.banners.push({text,sub:o.sub||'',col:o.col||'#ffe45a',col2:o.col2||'#ff7a20',out:o.out||'#3a0a08',t0:U.t+(o.delay||0),dur:o.dur||1100,size:o.size||26,kind:o.kind||'',y:o.y||86});if(U.banners.length>4)U.banners.shift()}
function bubble(p,kind){if(p!==1)return;const o=OPP[U.opp];const L=o&&o.say[kind];if(!L)return;U.say={text:L[Math.floor(Math.random()*L.length)],t0:U.t,dur:1700}}
/* 판이 기록한 일을 하나씩 움직여 보여 준다 */
function runOp(op,t){const st=U.st,V=U.V;const sp=SP();
 if(op.op==='mv'||op.op==='add'){const ids=op.op==='add'?[op.id]:op.ids;const from=ids.map(id=>op.op==='add'?{x:DECK.x,y:DECK.y,w:16,h:24,face:false}:posOf(V,st,id));applyOp(V,op);syncSlots(V,st);const to=ids.map(id=>posOf(V,st,id));
  const dur=Math.max(90,(op.dur||300)*sp);ids.forEach((id,i)=>{const d=dur+(op.deal?i*22*sp:i*40*sp);U.flights.push({id,from:from[i],to:to[i],t0:t,dur:d,flip:!!op.flip,arc:op.to==='cap'?-10:op.to==='floor'?-6:-3,lift:op.from==='hand'});});
  const land=t+dur+(ids.length-1)*40*sp;
  const s=op.sfx;
  if(s==='deal'){sfx('deal')}
  else if(s==='slap'||s==='slam'){addTimer(land,()=>{sfx(s);const P=to[0];const hit=op.hit!=null;shake(hit?2.2:1.2,hit?200:140);buzz(hit?22:12);particles(P.x+P.w/2,P.y+P.h,hit?10:6,{v:hit?34:22,up:6,g:40,life:380,cols:['#d8d0b8','#a89878','#fff'],sz:1.3,a0:Math.PI,spread:Math.PI});ring(P.x+P.w/2,P.y+P.h/2,hit?'#fff6b0':'#ffffff',hit?15:10,300)})}
  else if(s==='flip'){sfx('flip')}
  else if(s==='match'||s==='capture'){sfx(s==='capture'?'capture':'match');addTimer(land,()=>{const P=to[to.length-1];particles(P.x+P.w/2,P.y+P.h/2,6,{v:26,g:0,life:420,cols:['#fff6a0','#ffffff'],sh:'spark',sz:1.4});sfx('count')})}
  else if(s==='steal'){sfx('steal');const P=to[0];addTimer(land,()=>{banner('피 한 장!',{size:12,y:op.p?36:110,dur:700,col:'#ffffff',col2:'#ff8aa0',kind:'small'});particles(P.x+5,P.y+8,8,{v:30,g:20,life:500,cols:['#ff8aa0','#fff'],sh:'heart'});buzz([18,30,18])})}
  else if(s==='bonus'){sfx('bonus')}else if(s==='draw'){sfx('draw')}
  U.busy=t+(op.deal?dur*.55:op.op==='add'?dur*.6:dur*(s==='slap'?1.05:.95))+(ids.length-1)*40*sp;
  if(op.flip)U.busy=t+dur+260*sp;return}
 if(op.op==='gone'){const P=posOf(V,st,op.ids[0]);applyOp(V,op);sfx('flick');particles(P.x+P.w/2,P.y+P.h/2,8,{v:20,g:-10,life:400,col:'#9a9aa8'});U.busy=t+200*sp;return}
 if(op.op==='meta'){applyOp(V,op);return}
 if(op.op==='fx'){fxOp(op,t);return}
 if(op.op==='end'){U.busy=t+500*sp;return}}
const GW_TXT=(n,rain)=>n>=5?'오광!!':n===4?'사광!':rain?'비광 삼광':'삼광!';
function fxOp(op,t){const p=op.p,sp=SP();let dur=0;const mine=p===0;
 switch(op.kind){
  case 'jjok':banner('쪽!',{col:'#ffd0e0',col2:'#ff4a8a',size:30});sfx('kiss');particles(75,86,18,{v:50,g:-10,life:800,cols:['#ff5a8a','#ffb0c8','#fff'],sh:'heart',sz:2.2});flash('#ffb0d0',.35,250);buzz([20,40,20]);bubble(p,'jjok');dur=800;break;
  case 'ppeok':banner('뻑!',{col:'#ffcf8a',col2:'#b04a10',size:34,kind:'splat'});sfx('ppeok');shake(5,500);flash('#5a2a0a',.35,350);particles(75,80,26,{v:70,g:80,life:900,cols:['#8a5a2a','#c08a50','#4a2a10'],sz:2.4});buzz([60,40,90]);bubble(p,'ppeok');if(p===0)gsData().ppeok++;dur=950;break;
  case 'ppeokEat':banner('뻑 먹기!',{col:'#fff2a0',col2:'#e09020',size:22,sub:'피 한 장 뺏기'});sfx('ttadak');particles(75,86,16,{v:40,cols:['#ffe45a','#fff']});dur=700;break;
  case 'jappeok':banner('자뻑!',{col:'#ffe0a0',col2:'#ff3020',size:28,sub:'피 두 장 뺏기'});sfx('ttadak');shake(3,300);particles(75,86,24,{v:50,cols:['#ffe45a','#ff7a40','#fff'],sh:'star'});buzz([30,30,30,30,60]);dur=900;break;
  case 'ttadak':banner('따닥!',{col:'#fff6a0',col2:'#ff9a10',size:30,kind:'double'});sfx('ttadak');shake(3.5,260);addTimer(t+110*sp,()=>shake(3.5,260));ring(75,80,'#fff',30,420);addTimer(t+110*sp,()=>ring(75,80,'#ffe45a',36,420));buzz([25,60,25]);dur=850;break;
  case 'sweep':banner('싹쓸이!',{col:'#c8fbff',col2:'#20a0e0',size:26,kind:'sweep',sub:'바닥을 다 쓸었다'});sfx('sweep');U.sweep={t0:t,dur:600*sp};particles(75,80,30,{v:60,g:10,life:900,cols:['#c8fbff','#fff','#7ad0ff'],sh:'star'});buzz([20,30,20,30,60]);bubble(p,'sweep');dur=1000;break;
  case 'bomb':banner('폭탄!',{col:'#fff0a0',col2:'#ff3010',size:32,kind:'boom'});sfx('boom');shake(6,650);flash('#ffffff',.85,320);ring(75,80,'#ffb040',60,600);particles(75,80,40,{v:90,g:50,life:1000,cols:['#ff5a10','#ffd040','#3a3a3a','#fff'],sz:2.6});buzz([80,40,120]);U.showIds={ids:op.ids,t0:t,dur:700*sp};dur=1100;break;
  case 'shake':banner('흔들기!',{col:'#f0d8ff',col2:'#9a40e0',size:26,kind:'wobble',sub:'점수 두 배'});sfx('rattle');U.showIds={ids:op.ids,t0:t,dur:1100*sp,wobble:1};buzz([15,20,15,20,15,20,15]);dur=1300;break;
  case 'chongtong':banner('총통!',{col:'#fff6c0',col2:'#ffb000',size:34,sub:op.m+'월 넉 장! 바로 승리'});sfx('fanfare');U.showIds={ids:op.ids,t0:t,dur:1500*sp};U.gold={t0:t,dur:1800};flash('#fff0a0',.6,400);buzz([60,40,60,40,200]);dur=1700;break;
  case 'gwang':banner(GW_TXT(op.n,op.rain),{col:'#fffbe0',col2:'#ffc020',size:op.n>=5?32:26,kind:'rays',sub:op.n>=5?'15점':op.n===4?'4점':op.rain?'2점':'3점'});sfx('gwang');flash('#fff8c0',.45,300);U.rays={t0:t,dur:1100*sp};particles(75,84,20,{v:45,g:0,life:900,cols:['#fff6a0','#ffffff'],sh:'star'});buzz([30,30,30]);dur=1000;break;
  case 'godori':banner('고도리!',{col:'#e8ffe0',col2:'#30a040',size:28,sub:'5점'});sfx('birds');U.birds={t0:t,dur:1500*sp};buzz([20,40,20,40,20]);dur=1100;break;
  case 'hong':banner('홍단!',{col:'#ffe0e0',col2:'#e0202a',size:28,kind:'ribbon',sub:'3점'});sfx('dan');U.ribbon={t0:t,dur:900*sp,col:'#e0202a'};buzz([25,40,25]);dur=950;break;
  case 'cheong':banner('청단!',{col:'#e0ecff',col2:'#2a5ad8',size:28,kind:'ribbon',sub:'3점'});sfx('dan');U.ribbon={t0:t,dur:900*sp,col:'#2a5ad8'};buzz([25,40,25]);dur=950;break;
  case 'cho':banner('초단!',{col:'#fff0e0',col2:'#c03a20',size:28,kind:'ribbon',sub:'3점'});sfx('dan');U.ribbon={t0:t,dur:900*sp,col:'#c03a20'};buzz([25,40,25]);dur=950;break;
  case 'mung':banner('멍따!',{col:'#fff0d0',col2:'#9a5a20',size:26,sub:'열끗 일곱 장, 두 배'});sfx('dan');dur=900;break;
  case 'four':banner('넉 장!',{col:'#ffffff',col2:'#6a8aff',size:18,dur:700});sfx('match');dur=500;break;
  case 'bonus':banner('보너스!',{col:'#fff8b0',col2:'#ffa000',size:20,dur:700,y:mine?110:40});particles(75,mine?120:30,12,{v:30,g:30,cols:['#ffe45a','#fff'],sh:'star'});dur=450;break;
  case 'noPi':banner('뺏을 피가 없다',{size:11,col:'#fff',col2:'#888',dur:700,kind:'small'});dur=300;break;
  case 'canGo':dur=300;break;
  case 'go':{const n=op.n;banner(n+'고!',{col:'#fff2b0',col2:'#ff4010',size:28+Math.min(10,n*2),kind:'fire',sub:n>=3?'두 배씩 올라간다':'+'+n+'점'});sfx('go',n);shake(2+n,400);U.fire={t0:t,dur:1000*sp};buzz([30,30,30]);bubble(p,'go');if(p===0)gsData().go++;dur=1100;break}
  case 'stop':banner('스톱!',{col:'#ffffff',col2:'#d02020',size:32,kind:'stamp'});sfx('stamp');shake(4,300);buzz([60]);bubble(p,'stop');dur=900;break;
  case 'nagari':banner('나가리',{col:'#e0e0e0',col2:'#606070',size:28,sub:'다음 판은 두 배'});sfx('trombone');U.gray={t0:t};dur=1600;break;
  case 'ppeok3':banner('세 번 뻑!',{col:'#ffe0a0',col2:'#ff4000',size:28,sub:'바로 승리'});sfx('fanfare');dur=1300;break;
  case 'pickOne':dur=120;break}
 U.busy=Math.max(U.busy,t+dur*sp)}
/* ---------- 한 판 ---------- */
function startMatch(i){const g=gsData();U.opp=i;const o=OPP[i];if(g.money<o.stake*7){K.pop&&K.pop('돈이 모자라요.\n「돈 받기」를 눌러 주세요');sfx('deny');return}
 U.st=newGame({first:U.lastWinner,level:o.lv,nagari:U.nagari});U.V=newZones();U.V.deck=U.st.deck0.slice();U.opi=0;U.flights=[];U.timers=[];U.parts=[];U.banners=[];U.rings=[];U.slots={};U.cursor=0;U.choice=null;U.think=0;U.res=null;U.say=null;U.pause=null;
 U.busy=0;U.mode='play';U.speed=g.fast?.65:1;U.startAt=now();if(U.nagari)banner('나가리 판 ×'+Math.pow(2,U.nagari),{size:16,col:'#fff',col2:'#606070',delay:0,dur:1200,y:84});bgmStart();sfx('pop')}
function idle(t){const st=U.st;return st&&U.opi>=st.ops.length&&t>=U.busy&&!U.flights.some(f=>t<f.t0+f.dur)}
function pump(t){const st=U.st;if(!st)return;
 for(const tm of U.timers.slice())if(t>=tm.at){U.timers.splice(U.timers.indexOf(tm),1);try{tm.fn()}catch(_){}}
 let guard=0;while(U.opi<st.ops.length&&t>=U.busy&&guard++<40)runOp(st.ops[U.opi++],t);
 U.flights=U.flights.filter(f=>t<f.t0+f.dur+40);
 if(!idle(t))return;
 if(st.over){if(!U.res)showResult(t);return}
 const N=st.need;if(!N)return;
 if(N.p===1){if(!U.think)U.think=t+(N.type==='pick'?520+Math.random()*420:380)*SP();else if(t>=U.think){U.think=0;aiStep(st,1)}return}
 if(N.type==='gostop'&&!U.choice){U.choice={type:'gostop',sel:0,score:N.score,t0:t};sfx('pop');buzz([30,40,30])}
 if(N.type==='match'&&!U.choice){U.choice={type:'match',sel:0,options:N.options.slice(),t0:t}}}
function playHand(i){const st=U.st;if(!st||!idle(U.t)||!st.need||st.need.type!=='pick'||st.need.p!==0||U.choice)return;const id=U.V.hand[0][i];if(id==null)return;U.cursor=i;
 if(canBomb(st,0,id)){U.choice={type:'bomb',sel:0,id,t0:U.t};sfx('pop');return}
 if(canShake(st,0,id)){U.choice={type:'shake',sel:0,id,t0:U.t};sfx('pop');return}
 pick(st,0,id,{})}
function choiceKey(id){const C=U.choice,st=U.st;if(!C)return false;const n=C.type==='match'?C.options.length:2;
 if(id==='left'||id==='4'||id==='up'||id==='2'){C.sel=(C.sel+n-1)%n;sfx('cursor');return true}
 if(id==='right'||id==='6'||id==='down'||id==='8'){C.sel=(C.sel+1)%n;sfx('cursor');return true}
 let pickIdx=null;if(id==='ok'||id==='5')pickIdx=C.sel;else if(id==='1')pickIdx=0;else if(id==='3'&&n>1)pickIdx=1;
 if(pickIdx==null)return true;U.choice=null;
 if(C.type==='match')chooseMatch(st,0,C.options[pickIdx]);
 else if(C.type==='gostop')goStop(st,0,pickIdx===0);
 else if(C.type==='bomb')pick(st,0,C.id,pickIdx===0?{bomb:true}:{});
 else if(C.type==='shake')pick(st,0,C.id,pickIdx===0?{shake:true}:{});
 return true}
/* ---------- 결과 ---------- */
function showResult(t){const st=U.st,g=gsData(),o=OPP[U.opp];bgmStop();
 if(st.over.draw){U.res={draw:true,t0:t};g.draw++;U.nagari=Math.min(3,st.over.nagari);sv();return}
 const R=st.over,win=R.winner===0,money=R.final*o.stake;U.nagari=0;U.lastWinner=R.winner;
 const before=g.money;if(win){g.money+=money;g.win++;g.best=Math.max(g.best,money)}else{g.money=Math.max(0,g.money-money);g.lose++}
 U.res={R,win,money,before,after:g.money,t0:t,stampN:0};sv();
 if(win){sfx('fanfare');U.gold={t0:t,dur:2200};buzz([40,40,40,40,120]);bubble(1,'lose')}else{sfx('lose');bubble(1,'win')}}
/* ---------- 그리기 ---------- */
function setDS(g){let a=2;try{const m=g.getTransform&&g.getTransform();if(m)a=Math.hypot(m.a,m.b)}catch(_){}U.ds=clamp(Math.round(a),1,4)}
function Tx(g,s,x,y,o){try{K.T(g,s,x,y,o)}catch(_){}}
function drawCard(g,c,x,y,w,h,face,alpha){const big=w>=15.5?HANDC:w>=12?CARD:MINI;const cv=cardCv(face?c:null,big.w,big.h,U.ds);if(alpha!=null)g.globalAlpha=alpha;
 if(cv){g.imageSmoothingEnabled=true;try{g.drawImage(cv.c,x,y,w,h)}catch(_){}}else{g.fillStyle=face?'#fbf4e2':'#b8141c';g.fillRect(x,y,w,h)}if(alpha!=null)g.globalAlpha=1}
function felt(g){const cv=cachedArt('felt:'+U.ds,()=>{const c=mkcv(W*U.ds,H*U.ds);if(!c)return null;const x=c.g;x.scale(U.ds,U.ds);const gr=x.createRadialGradient(W/2,H*.45,10,W/2,H*.45,130);gr.addColorStop(0,'#2d6a3a');gr.addColorStop(1,'#123a1e');x.fillStyle=gr;x.fillRect(0,0,W,H);
  x.globalAlpha=.07;for(let i=-H;i<W;i+=3){x.strokeStyle=i%2?'#000':'#9fd0a0';x.lineWidth=.5;x.beginPath();x.moveTo(i,0);x.lineTo(i+H,H);x.stroke()}x.globalAlpha=1;
  x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,W,30);x.fillRect(0,114,W,36);x.fillStyle='rgba(255,230,160,.12)';x.fillRect(0,30,W,.6);x.fillRect(0,113.5,W,.6);return c});
 if(cv)try{g.drawImage(cv.c,0,0,W,H)}catch(_){}else{g.fillStyle='#1d4a28';g.fillRect(0,0,W,H)}}
function flying(id,t){return U.flights.some(f=>f.id===id&&t<f.t0+f.dur)}
function drawGame(g,t){const st=U.st,V=U.V;if(!st||!V)return;const sh=U.shake,k=Math.max(0,1-(t-sh.t0)/sh.dur);g.save();if(k>0&&sh.a)g.translate((Math.random()*2-1)*sh.a*k,(Math.random()*2-1)*sh.a*k);
 felt(g);const o=OPP[U.opp];const sc0=score(st,0,V),sc1=score(st,1,V);
 /* 상대 */const fc=faceCv(o,11,U.ds);if(fc)try{g.drawImage(fc.c,1,1.5,11,11)}catch(_){}
 const thinking=st.need&&st.need.p===1&&!st.over&&idle(t);
 Tx(g,o.n,14,6.5,{size:6.4,bold:true,color:'#ffe9b0'});Tx(g,'점수 '+sc1.total+(V.meta.go1?' · '+V.meta.go1+'고':'')+(V.meta.shake1?' · 흔들':'')+(thinking?' · 생각 중'+'.'.repeat(1+Math.floor(t/300)%3):''),14,12.5,{size:5.8,color:thinking?'#9fe8ff':'#d8e8d0'});
 V.hand[1].forEach((id,i)=>{if(flying(id,t))return;const P=posOf(V,st,id);drawCard(g,null,P.x,P.y,P.w,P.h,false)});
 drawCaps(g,V,st,1,t);drawCaps(g,V,st,0,t);
 /* 바닥 */const C=U.choice;
 for(const id of V.floor){if(flying(id,t))continue;const P=posOf(V,st,id);let sel=false;if(C&&C.type==='match'&&C.options.includes(id))sel=C.options[C.sel]===id;
  drawCard(g,card(st,id),P.x,P.y,P.w,P.h,true);if(C&&C.type==='match'&&C.options.includes(id)){const a=.5+.5*Math.sin(t/120);g.strokeStyle=sel?'rgba(255,240,90,'+(.6+.4*a)+')':'rgba(255,255,255,.55)';g.lineWidth=sel?1.4:.8;g.strokeRect(P.x-.8,P.y-.8,P.w+1.6,P.h+1.6)}}
 /* 뻑 표시 */for(const m in st.ppeok){const s=U.slots[m];if(s==null)continue;const sl=SLOTS[s];Tx(g,'뻑',sl[0]+10,sl[1]+2,{size:6,bold:true,color:'#ff7a40',align:'center',shadow:'#000'})}
 /* 더미 */const dn=V.deck.length;for(let i=Math.min(3,Math.ceil(dn/7));i>0;i--)if(dn)drawCard(g,null,DECK.x-i*.8,DECK.y-i*.8,16,24,false);if(dn){const top=V.deck[dn-1];if(!flying(top,t))drawCard(g,null,DECK.x,DECK.y,16,24,false)}
 Tx(g,String(dn),DECK.x+8,DECK.y+29,{size:6,bold:true,color:'#ffe9b0',align:'center',shadow:'#000'});
 for(const id of V.stage){if(flying(id,t))continue;const P=posOf(V,st,id);drawCard(g,card(st,id),P.x,P.y,P.w,P.h,true)}
 /* 내 정보 줄 */const g0=gsData();
 Tx(g,'내 점수 '+sc0.total+(V.meta.go0?' · '+V.meta.go0+'고':'')+(V.meta.shake0?' · 흔들×'+V.meta.shake0:''),2,144.5,{size:6.6,bold:true,color:sc0.total>=7?'#ffe45a':'#e8f4e0',shadow:'#000'});
 Tx(g,won(g0.money)+'원',W-2,144.5,{size:6.2,color:'#ffe9b0',align:'right',shadow:'#000'});
 /* 내 손 */const myTurn=st.need&&st.need.type==='pick'&&st.need.p===0&&idle(t)&&!U.choice&&!st.over;const n=V.hand[0].length;if(U.cursor>=n)U.cursor=Math.max(0,n-1);
 V.hand[0].forEach((id,i)=>{if(flying(id,t))return;let [x,y]=handXY(n,i);const cur=myTurn&&i===U.cursor;if(cur)y-=6;const c=card(st,id);drawCard(g,c,x,y,HANDC.w,HANDC.h,true);
  if(myTurn){const fm=V.floor.filter(f=>card(st,f).m===c.m).length;if(fm&&c.m>0){g.fillStyle='rgba(255,230,80,.9)';g.beginPath();g.arc(x+HANDC.w-2.5,y+2.5,1.6,0,Math.PI*2);g.fill()}
   if(cur){g.strokeStyle='rgba(255,240,90,'+(.7+.3*Math.sin(t/110))+')';g.lineWidth=1.2;g.strokeRect(x-.6,y-.6,HANDC.w+1.2,HANDC.h+1.2)}
   if(i<10)Tx(g,String((i+1)%10),x+2.4,y+HANDC.h-1.5,{size:5.2,bold:true,color:'#2a1a10'})}});
 if(myTurn&&Math.floor(t/600)%2)Tx(g,'내 차례',W/2,151,{size:5.6,bold:true,color:'#ffe45a',align:'center',shadow:'#000'});
 /* 날아가는 패 */for(const f of U.flights.slice().sort((a,b)=>a.t0-b.t0)){if(t<f.t0)continue;const k2=clamp((t-f.t0)/f.dur,0,1),e=1-Math.pow(1-k2,3),c=card(st,f.id);
  const x=lerp(f.from.x,f.to.x,e),y=lerp(f.from.y,f.to.y,e)+Math.sin(k2*Math.PI)*(f.arc||0)-(f.lift?Math.sin(k2*Math.PI)*4:0);let w2=lerp(f.from.w,f.to.w,e),h2=lerp(f.from.h,f.to.h,e);
  /* 뒤집기: 반쯤에서 앞면으로 바뀌고 가로로 접혔다 펴진다 */let face=f.to.face;if(f.flip){const fx=Math.abs(Math.cos(k2*Math.PI));face=k2>.5;const ww=w2*Math.max(.06,fx);drawCard(g,c,x+(w2-ww)/2,y-Math.sin(k2*Math.PI)*5,ww,h2*(1+.12*Math.sin(k2*Math.PI)),face);continue}
  if(k2<.5&&!f.from.face&&f.to.face)face=k2>.35;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+1.5,y+2,w2,h2);drawCard(g,c,x,y,w2,h2,face)}
 drawFx(g,t);
 /* 흔들기, 폭탄, 총통 패 보여 주기 */if(U.showIds&&t<U.showIds.t0+U.showIds.dur){const L=U.showIds.ids,n2=L.length,k3=Math.min(1,(t-U.showIds.t0)/200);g.fillStyle='rgba(0,0,0,'+(.45*k3)+')';g.fillRect(0,56,W,46);
  L.forEach((id,i)=>{const x=W/2-(n2*22)/2+i*22+2,y=62+(U.showIds.wobble?Math.sin(t/45+i*2)*2.5:0);g.save();g.translate(x+9,y+13);if(U.showIds.wobble)g.rotate(Math.sin(t/60+i)*.12);drawCard(g,card(st,id),-9,-13.5,18,27,true);g.restore()})}
 drawBanners(g,t);
 if(U.say&&t<U.say.t0+U.say.dur){const s=U.say.text;g.font=K.fnt?K.fnt(6.4,true):'bold 6.4px sans-serif';const tw=Math.min(110,g.measureText(s).width+8);g.fillStyle='rgba(255,255,250,.96)';g.beginPath();g.moveTo(14,31);g.lineTo(18,26);g.lineTo(18+tw,26);g.lineTo(18+tw,18);g.lineTo(18,18);g.lineTo(18,26);g.fill();
  g.fillRect(18,17,tw,10);g.beginPath();g.moveTo(16,27);g.lineTo(22,26.5);g.lineTo(19,30);g.fill();Tx(g,s,22,24.4,{size:6.4,bold:true,color:'#2a1a10'})}
 g.restore();
 if(U.choice)drawChoice(g,t);
 if(U.res)drawResult(g,t);
 if(U.pause)drawPause(g,t)}
function drawCaps(g,V,st,p,t){for(const [gk,x0] of GROUPS){const list=V.cap[p].filter(id=>groupOf(card(st,id))===gk);for(const id of list){if(flying(id,t))continue;const P=posOf(V,st,id);drawCard(g,card(st,id),P.x,P.y,P.w,P.h,true)}
 if(list.length){let n=list.length;if(gk==='pi'){n=0;for(const id of list){const c=card(st,id);n+=c.k==='yeol'?2:c.pv}}const y=p?27.6:134.8;Tx(g,String(n),x0+(gk==='pi'?2:1),y,{size:5.6,bold:true,color:'#fff',shadow:'#000'})}}}
function drawFx(g,t){/* 고리 */U.rings=U.rings.filter(r=>t<r.t0+r.dur);for(const r of U.rings){const k=(t-r.t0)/r.dur;g.strokeStyle=r.col;g.globalAlpha=1-k;g.lineWidth=1.4*(1-k)+.3;g.beginPath();g.arc(r.x,r.y,2+r.r1*k,0,Math.PI*2);g.stroke()}g.globalAlpha=1;
 /* 싹쓸이 빗자루 줄 */if(U.sweep&&t<U.sweep.t0+U.sweep.dur){const k=(t-U.sweep.t0)/U.sweep.dur;const x=-30+k*(W+60);const gr=g.createLinearGradient(x-30,0,x,0);gr.addColorStop(0,'rgba(200,250,255,0)');gr.addColorStop(1,'rgba(200,250,255,.7)');g.fillStyle=gr;g.fillRect(x-30,32,30,82)}
 /* 광 빛살 */if(U.rays&&t<U.rays.t0+U.rays.dur){const k=(t-U.rays.t0)/U.rays.dur;g.save();g.translate(75,84);g.rotate(t/900);g.globalAlpha=.4*(1-k);for(let i=0;i<12;i++){g.rotate(Math.PI/6);g.fillStyle=i%2?'#fff6b0':'#ffd040';g.beginPath();g.moveTo(0,0);g.lineTo(-6,-90);g.lineTo(6,-90);g.fill()}g.restore();g.globalAlpha=1}
 /* 고도리 새 다섯 마리 */if(U.birds&&t<U.birds.t0+U.birds.dur){const k=(t-U.birds.t0)/U.birds.dur;for(let i=0;i<5;i++){const x=-20+(k*1.3-i*.08)*(W+40),y=60+i*6+Math.sin(k*12+i)*4,f=Math.floor(t/90+i)%2;g.fillStyle='#1a2a1a';g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y-(f?3:-1));g.lineTo(x-2,y);g.lineTo(x+5,y-(f?3:-1));g.closePath();g.fill();g.fillStyle='#e0a020';g.fillRect(x+1.5,y-.6,1.5,1)}}
 /* 띠 펄럭 */if(U.ribbon&&t<U.ribbon.t0+U.ribbon.dur){const k=(t-U.ribbon.t0)/U.ribbon.dur;g.globalAlpha=1-k*.8;g.fillStyle=U.ribbon.col;for(let i=0;i<3;i++){g.save();g.translate(30+i*45,70+Math.sin(t/80+i)*3);g.rotate(Math.sin(t/120+i)*.3);g.fillRect(-4,-14*(1-k*.5),8,28*(1-k*.5));g.restore()}g.globalAlpha=1}
 /* 고 불꽃 */if(U.fire&&t<U.fire.t0+U.fire.dur){const k=(t-U.fire.t0)/U.fire.dur;if(Math.random()<.8)particles(75+(Math.random()*2-1)*30,98,2,{v:20,a0:-Math.PI/2-.4,spread:.8,g:-30,life:500,cols:['#ff5a10','#ffd040','#ff9a20'],sz:2})}
 /* 금빛 비 */if(U.gold&&t<U.gold.t0+U.gold.dur&&Math.random()<.9)particles(Math.random()*W,-4,2,{v:10,a0:Math.PI/2,spread:.2,g:50,life:1600,cols:['#ffe45a','#fff6b0','#ffb020'],sh:'star',sz:1.8});
 /* 알갱이 */U.parts=U.parts.filter(q=>t<q.t0+q.life);for(const q of U.parts){const s=(t-q.t0)/1000,k=1-(t-q.t0)/q.life;const x=q.x+q.vx*s,y=q.y+q.vy*s+.5*q.ay*s*s;g.globalAlpha=Math.max(0,k);g.fillStyle=q.col;
  if(q.sh==='heart'){const r=q.sz;g.beginPath();g.arc(x-r*.5,y,r*.55,0,Math.PI*2);g.arc(x+r*.5,y,r*.55,0,Math.PI*2);g.moveTo(x-r,y+.2);g.lineTo(x,y+r*1.2);g.lineTo(x+r,y+.2);g.fill()}
  else if(q.sh==='star'||q.sh==='spark'){const r=q.sz;g.save();g.translate(x,y);g.rotate(q.rot+s*4);g.fillRect(-r,-r*.25,r*2,r*.5);g.fillRect(-r*.25,-r,r*.5,r*2);g.restore()}
  else g.fillRect(x-q.sz/2,y-q.sz/2,q.sz,q.sz)}g.globalAlpha=1;
 /* 번쩍 */if(U.flash){const k=(t-U.flash.t0)/U.flash.dur;if(k<1){g.globalAlpha=U.flash.a*(1-k);g.fillStyle=U.flash.col;g.fillRect(0,0,W,H);g.globalAlpha=1}else U.flash=null}}
function drawBanners(g,t){U.banners=U.banners.filter(b=>t<b.t0+b.dur);for(const b of U.banners){if(t<b.t0)continue;const k=(t-b.t0)/b.dur;
 let sc=k<.12?.3+k/.12*.95:k<.22?1.25-(k-.12)/.1*.25:1;let a=k>.8?1-(k-.8)/.2:1;let dx=0,dy=0,rot=0;
 if(b.kind==='wobble')rot=Math.sin(t/50)*.12;if(b.kind==='splat'&&k<.25)dx=(Math.random()*2-1)*3;if(b.kind==='stamp'){sc=k<.1?2.2-k/.1*1.2:1;rot=-.12}if(b.kind==='double'&&k>.1&&k<.2)sc=1.35;
 if(b.kind==='small'){sc=1;dy=-k*8}
 g.save();g.translate(W/2+dx,b.y+dy);g.rotate(rot);g.scale(sc,sc);g.globalAlpha=Math.max(0,a);
 if(b.kind!=='small'){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-70,-b.size*.7,140,b.size*1.25+(b.sub?9:0))}
 g.font=(K.fnt?K.fnt(b.size,true):'bold '+b.size+'px sans-serif');g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=Math.max(2,b.size*.16);g.strokeStyle=b.out;g.strokeText(b.text,0,0);
 const gr=g.createLinearGradient(0,-b.size*.5,0,b.size*.5);gr.addColorStop(0,b.col);gr.addColorStop(1,b.col2);g.fillStyle=gr;g.fillText(b.text,0,0);
 if(b.sub){g.font=(K.fnt?K.fnt(7,true):'bold 7px sans-serif');g.lineWidth=2;g.strokeStyle='#000';g.strokeText(b.sub,0,b.size*.62);g.fillStyle='#fff';g.fillText(b.sub,0,b.size*.62)}
 g.restore()}g.globalAlpha=1;g.textAlign='left';g.textBaseline='alphabetic'}
function panel(g,x,y,w2,h2){g.fillStyle='rgba(12,8,4,.9)';g.fillRect(x,y,w2,h2);g.strokeStyle='#d8b04a';g.lineWidth=.8;g.strokeRect(x+.5,y+.5,w2-1,h2-1);g.strokeStyle='rgba(216,176,74,.4)';g.strokeRect(x+2,y+2,w2-4,h2-4)}
function btns(g,labels,sel,y,t){const n=labels.length,bw=58,gap=8,x0=W/2-(n*bw+(n-1)*gap)/2;labels.forEach((s,i)=>{const x=x0+i*(bw+gap),on=i===sel;g.fillStyle=on?'#c0282a':'#3a2a1a';g.fillRect(x,y,bw,16);if(on){g.strokeStyle='rgba(255,240,120,'+(.6+.4*Math.sin(t/120))+')';g.lineWidth=1;g.strokeRect(x+.5,y+.5,bw-1,15)}
 Tx(g,s,x+bw/2,y+11.5,{size:8.2,bold:true,color:on?'#fff6c0':'#c8b8a0',align:'center'})})}
function drawChoice(g,t){const C=U.choice;if(!C)return;
 if(C.type==='match'){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(20,124,110,13);Tx(g,'먹을 패를 고르세요 (좌우, 확인)',W/2,133,{size:6.4,bold:true,color:'#ffe45a',align:'center'});return}
 panel(g,12,58,126,62);
 if(C.type==='gostop'){const go=(U.st.goN[0]||0)+1;Tx(g,C.score+'점 났다!',W/2,73,{size:12,bold:true,color:'#ffe45a',align:'center',shadow:'#000'});Tx(g,go>=3?go+'고부터는 두 배씩!':'고 하면 더 벌고, 지면 고박',W/2,85,{size:6.6,color:'#d8c8b0',align:'center'});btns(g,[go+'고!','스톱'],C.sel,92,t);Tx(g,'1 고 · 3 스톱',W/2,116,{size:5.6,color:'#8a7a6a',align:'center'})}
 else if(C.type==='bomb'){Tx(g,'폭탄!',W/2,74,{size:13,bold:true,color:'#ff9a40',align:'center',shadow:'#000'});Tx(g,'세 장을 한꺼번에 낼까요?',W/2,86,{size:7,color:'#e8d8c0',align:'center'});btns(g,['폭탄','한 장만'],C.sel,92,t)}
 else if(C.type==='shake'){Tx(g,'같은 달 세 장!',W/2,74,{size:11,bold:true,color:'#d8a8ff',align:'center',shadow:'#000'});Tx(g,'흔들까요? 이기면 두 배',W/2,86,{size:7,color:'#e8d8c0',align:'center'});btns(g,['흔들기','그냥 내기'],C.sel,92,t)}}
const PNAME={gwang:'광',yeol:'열끗',tti:'띠',pi:'피',godori:'고도리',hong:'홍단',cheong:'청단',cho:'초단'};
function drawResult(g,t){const R=U.res;const k=Math.min(1,(t-R.t0)/300);g.fillStyle='rgba(0,0,0,'+(.55*k)+')';g.fillRect(0,0,W,H);panel(g,6,8,138,170);
 if(R.draw){Tx(g,'나가리',W/2,48,{size:20,bold:true,color:'#d0d0d8',align:'center',shadow:'#000'});Tx(g,'아무도 일곱 점을 못 냈다',W/2,66,{size:7.4,color:'#c8c0b0',align:'center'});Tx(g,'다음 판은 두 배 (×'+Math.pow(2,U.nagari)+')',W/2,80,{size:7.4,bold:true,color:'#ffe45a',align:'center'});
  Tx(g,'5 한 판 더 · 취소 그만',W/2,158,{size:6.6,color:'#a89878',align:'center'});return}
 const RR=R.R,el2=t-R.t0;Tx(g,R.win?'승리!':'패배',W/2,26,{size:16,bold:true,color:R.win?'#ffe45a':'#a0a8c0',align:'center',shadow:R.win?'#a02010':'#000'});
 Tx(g,R.win?'내가 이겼다':OPP[U.opp].n+' 승리',W/2,36,{size:6.4,color:'#d8c8b0',align:'center'});
 let y=47;const items=[];if(RR.special)items.push([RR.special==='chongtong'?'총통':'세 번 뻑','10점','#ffe45a']);else{for(const kk of Object.keys(RR.P))if(RR.P[kk])items.push([PNAME[kk],RR.P[kk]+'점','#fff']);if(RR.go)items.push([RR.go+'고','+'+RR.go+'점','#ffb080'])}
 items.forEach((it,i)=>{const x=i%2?80:14,yy=y+Math.floor(i/2)*9;Tx(g,it[0],x,yy,{size:6.8,color:'#e8e0d0'});Tx(g,it[1],x+56,yy,{size:6.8,bold:true,color:it[2],align:'right'})});
 y+=Math.ceil(items.length/2)*9;g.fillStyle='rgba(216,176,74,.5)';g.fillRect(14,y-5,122,.6);y+=3;
 const ms=RR.mults.filter(m=>m[1]);ms.forEach((m,i)=>{const at=400+i*380;if(el2<at)return;if(R.stampN<=i){R.stampN=i+1;sfx('stamp');shake(2,150);buzz(25)}const s=el2-at<120?1.8-(el2-at)/120*.8:1;
  g.save();g.translate(28+(i%3)*42,y+5+Math.floor(i/3)*14);g.rotate(-.1);g.scale(s,s);g.strokeStyle='#e02020';g.lineWidth=1;g.strokeRect(-17,-6,34,12);Tx(g,m[0]+' ×'+m[1],0,2.4,{size:6.2,bold:true,color:'#ff4040',align:'center'});g.restore()});
 const rows=Math.ceil(ms.length/3);y+=rows*14+(rows?2:0);const done=el2>400+ms.length*380;y=Math.max(y,104);
 if(done){Tx(g,RR.pts+'점'+(RR.mult>1?' × '+RR.mult:'')+' = '+RR.final+'점',W/2,y+6,{size:8.4,bold:true,color:'#fff',align:'center'});
  const o=OPP[U.opp],cnt=Math.min(1,(el2-400-ms.length*380)/800),m=Math.round(R.money*cnt);if(cnt<1&&Math.floor(t/60)%2)sfx('count');
  Tx(g,'점당 '+won(o.stake)+'원',W/2,y+15,{size:6,color:'#a89878',align:'center'});Tx(g,(R.win?'+':'-')+won(m)+'원',W/2,y+29,{size:12,bold:true,color:R.win?'#7dff8a':'#ff7070',align:'center',shadow:'#000'});
  Tx(g,'내 돈 '+won(R.after)+'원',W/2,y+39,{size:6.6,color:'#e8d8b0',align:'center'})}
 Tx(g,'5 한 판 더 · 취소 그만',W/2,173,{size:6.4,color:'#a89878',align:'center'})}
const PAUSE=['계속하기','배경 음악','규칙 보기','그만두기'];
function drawPause(g,t){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);panel(g,22,44,106,86);Tx(g,'잠깐 멈춤',W/2,58,{size:9,bold:true,color:'#ffe45a',align:'center'});
 PAUSE.forEach((s,i)=>{const y=66+i*14;if(i===U.pause.sel){g.fillStyle='#7a1a1a';g.fillRect(28,y,94,12)}Tx(g,s+(i===1?(bgmOn()?' 켬':' 끔'):''),W/2,y+9,{size:8,bold:i===U.pause.sel,color:i===U.pause.sel?'#fff6c0':'#c8b8a0',align:'center'})})}
/* 제목, 상대 고르기, 규칙, 전적, 설정 */
const TMENU=['컴퓨터와 한 판','규칙 보기','전적과 돈','설정','나가기'];
function drawTitle(g,t){felt(g);const fan=[CARDS[0],CARDS[8],CARDS[28],CARDS[40],CARDS[44]];
 fan.forEach((c,i)=>{g.save();g.translate(75,124);g.rotate((i-2)*.24+Math.sin(t/900)*.03);drawCard(g,c,-9,-70,18,27,true);g.restore()});
 g.save();g.translate(75,27);const s=1+Math.sin(t/500)*.03;g.scale(s,s);g.font=K.fnt?K.fnt(9,true):'bold 9px sans-serif';g.textAlign='center';g.lineWidth=2.5;g.strokeStyle='#000';g.strokeText('모바일',0,-9);g.fillStyle='#fff';g.fillText('모바일',0,-9);
 g.font=K.fnt?K.fnt(24,true):'bold 24px sans-serif';g.lineWidth=4;g.strokeStyle='#5a0a08';g.strokeText('신맞고',0,12);const gr=g.createLinearGradient(0,-6,0,14);gr.addColorStop(0,'#fff2a0');gr.addColorStop(1,'#ff7a10');g.fillStyle=gr;g.fillText('신맞고',0,12);g.restore();g.textAlign='left';
 TMENU.forEach((m,i)=>{const y=110+i*13;const on=U.sel===i;if(on){g.fillStyle='rgba(160,20,20,.85)';g.fillRect(34,y,82,12);Tx(g,'▶',38,y+9,{size:7,color:'#ffe45a'})}Tx(g,m,W/2,y+9,{size:8.2,bold:on,color:on?'#fff6c0':'#e0f0d8',align:'center',shadow:'#000'})});
 Tx(g,'내 돈 '+won(gsData().money)+'원 (게임 머니)',W/2,179,{size:6.2,color:'#ffe9b0',align:'center',shadow:'#000'})}
function drawOpp(g,t){felt(g);Tx(g,'상대 고르기',W/2,14,{size:10,bold:true,color:'#ffe45a',align:'center',shadow:'#000'});
 OPP.forEach((o,i)=>{const y=22+i*46,on=U.opp===i;g.fillStyle=on?'rgba(160,20,20,.75)':'rgba(0,0,0,.35)';g.fillRect(6,y,138,42);if(on){g.strokeStyle='rgba(255,230,90,'+(.6+.4*Math.sin(t/120))+')';g.lineWidth=1;g.strokeRect(6.5,y+.5,137,41)}
  const fc=faceCv(o,30,U.ds);if(fc)try{g.drawImage(fc.c,11,y+6,30,30)}catch(_){}Tx(g,o.n,48,y+14,{size:8.4,bold:true,color:'#fff'});Tx(g,'난이도 '+['쉬움','보통','어려움'][o.lv],48,y+25,{size:6.6,color:['#9fe89a','#ffd860','#ff8a7a'][o.lv]});Tx(g,'점당 '+won(o.stake)+'원',48,y+35,{size:6.6,color:'#c8e8c0'})});
 Tx(g,'내 돈 '+won(gsData().money)+'원',W/2,168,{size:7,color:'#ffe9b0',align:'center',shadow:'#000'});Tx(g,'확인 시작 · 취소 뒤로',W/2,179,{size:6.2,color:'#c8d8c0',align:'center'})}
const HELP=[['점수 (7점부터 고/스톱)','광 3장 3점 (비광 끼면 2점)\n광 4장 4점, 5장 15점\n열끗 5장 1점, 한 장마다 +1\n고도리 (새 세 마리) 5점\n띠 5장 1점, 한 장마다 +1\n홍단 · 청단 · 초단 각 3점\n피 10장 1점, 한 장마다 +1\n(쌍피 2장, 보너스 피 2~3장)'],
 ['고와 스톱','7점이 나면 고 또는 스톱.\n스톱: 바로 끝내고 돈을 받는다.\n고: 계속 친다. 점수가 더 나면\n다시 고/스톱을 고른다.\n1고 +1점, 2고 +2점,\n3고부터는 두 배, 네 배...\n고 했다가 지면 고박 (두 배)'],
 ['두 배 되는 일','흔들기 (같은 달 세 장 보여 주기)\n폭탄 (세 장 + 바닥 한 장)\n멍따 (열끗 일곱 장 이상)\n피박 (내 피 점수, 상대 피 5장 이하)\n광박 (내 광 점수, 상대 광 0장)\n고박 (상대가 고 하고 졌을 때)\n나가리 다음 판'],
 ['피 뺏기','쪽: 낸 패와 뒤집은 패가 짝\n따닥: 같은 달 넉 장을 한 번에\n뻑 먹기: 남이 싼 뻑 무더기 먹기\n자뻑: 내가 싼 뻑 먹기 (두 장)\n싹쓸이: 바닥을 다 쓸면\n폭탄: 세 장 한꺼번에\n총통: 처음에 같은 달 넉 장 = 승리'],
 ['조작','1~9, 0: 그 자리 패를 바로 낸다\n좌우: 고르기, 확인: 내기\n노란 점: 바닥에 같은 달이 있음\n고르기 창: 좌우와 확인 (1, 3)\n메뉴: 잠깐 멈춤\n컴퓨터 전체화면에서는 숫자 키와\n넘패드, 방향키, Enter 를 쓴다']];
function drawHelp(g,t){felt(g);const P=HELP[U.help];panel(g,6,8,138,168);Tx(g,P[0],W/2,22,{size:8.4,bold:true,color:'#ffe45a',align:'center'});
 P[1].split('\n').forEach((ln,i)=>Tx(g,ln,13,38+i*14,{size:7,color:'#f0e6d0'}));Tx(g,'◀ '+(U.help+1)+' / '+HELP.length+' ▶   취소 뒤로',W/2,170,{size:6.4,color:'#a89878',align:'center'})}
function drawRec(g,t){felt(g);const d=gsData();panel(g,10,14,130,156);Tx(g,'전적과 돈',W/2,30,{size:9,bold:true,color:'#ffe45a',align:'center'});
 const L=[['이긴 판',d.win+'판'],['진 판',d.lose+'판'],['나가리',d.draw+'판'],['한 판 최고 수입',won(d.best)+'원'],['뻑 낸 횟수',d.ppeok+'번'],['고 부른 횟수',d.go+'번'],['돈 받은 횟수',d.refill+'번']];
 L.forEach(([a,b],i)=>{Tx(g,a,20,48+i*13,{size:7.4,color:'#e8e0d0'});Tx(g,b,130,48+i*13,{size:7.4,bold:true,color:'#fff',align:'right'})});
 Tx(g,'내 돈 '+won(d.money)+'원',W/2,148,{size:9,bold:true,color:'#7dff8a',align:'center'});Tx(g,d.money<10000?'5 돈 받기 (3만 원) · 취소 뒤로':'취소 뒤로',W/2,163,{size:6.6,color:'#a89878',align:'center'})}
const SETS_UI=[['bgm','배경 음악'],['sfx','효과음'],['vib','진동'],['fast','빠르기']];
function drawSet(g,t){felt(g);const d=gsData();panel(g,14,30,122,110);Tx(g,'설정',W/2,46,{size:9,bold:true,color:'#ffe45a',align:'center'});
 SETS_UI.forEach(([k,n],i)=>{const y=56+i*16,on=U.sett===i;if(on){g.fillStyle='#7a1a1a';g.fillRect(20,y,110,13)}Tx(g,n,26,y+9.5,{size:8,color:'#f0e6d0'});Tx(g,k==='fast'?(d.fast?'빠르게':'보통'):(d[k]?'켬':'끔'),124,y+9.5,{size:8,bold:true,color:on?'#fff6c0':'#ffd860',align:'right'})});
 Tx(g,'확인 바꾸기 · 취소 뒤로',W/2,132,{size:6.6,color:'#a89878',align:'center'})}
/* ---------- 휴대폰에 붙이기 ---------- */
let INST=null;
function create(kit){K=kit;host=kit.host;D=kit.D;MK=(wd,ht)=>host&&host.makeCanvas?host.makeCanvas(wd,ht):null;gsData();
 const up=id=>id==='up'||id==='2',down=id=>id==='down'||id==='8',left=id=>id==='left'||id==='4',right=id=>id==='right'||id==='6',ok=id=>id==='ok'||id==='5';
 function toTitle(){bgmStop();U.mode='title';U.st=null;U.res=null;U.pause=null;U.choice=null}
 function quitPlay(){bgmStop();U.st=null;U.res=null;U.pause=null;U.choice=null;U.mode='title'}
 const screen={
  enter(){U.t=now();if(U.mode!=='play'){U.mode='title';U.sel=0}else if(!U.res)U.pause=U.pause||{sel:0}},
  draw(g,t){U.t=t;setDS(g);g.save&&g.save();try{switch(U.mode){case 'title':drawTitle(g,t);break;case 'opp':drawOpp(g,t);break;case 'help':drawHelp(g,t);break;case 'rec':drawRec(g,t);break;case 'set':drawSet(g,t);break;default:drawGame(g,t)}}catch(err){w.console&&w.console.error&&w.console.error('gostop draw',err)}g.restore&&g.restore()},
  needs(t){U.t=t;try{if(U.mode==='play'&&!U.pause){pump(t);bgmTick()}}catch(err){w.console&&w.console.error&&w.console.error('gostop step',err)}return true},
  key(id){U.t=U.t||now();
   if(U.mode==='title'){const n=TMENU.length;if(up(id)){U.sel=(U.sel+n-1)%n;sfx('cursor')}else if(down(id)){U.sel=(U.sel+1)%n;sfx('cursor')}
    else if(ok(id)){sfx('pop');if(U.sel===0)U.mode='opp';else if(U.sel===1){U.mode='help';U.help=0;U.helpFrom='title'}else if(U.sel===2)U.mode='rec';else if(U.sel===3){U.mode='set';U.sett=0}else{try{K.back()}catch(_){}}}
    else if(id==='clr'){try{K.back()}catch(_){}}return true}
   if(U.mode==='opp'){if(up(id)){U.opp=(U.opp+2)%3;sfx('cursor')}else if(down(id)){U.opp=(U.opp+1)%3;sfx('cursor')}else if(ok(id))startMatch(U.opp);else if(id==='clr'){U.mode='title';sfx('cursor')}return true}
   if(U.mode==='help'){if(left(id)){U.help=(U.help+HELP.length-1)%HELP.length;sfx('cursor')}else if(right(id)||ok(id)){U.help=(U.help+1)%HELP.length;sfx('cursor')}else if(id==='clr'||id==='menu'){U.mode=U.helpFrom==='play'?'play':'title';sfx('cursor')}return true}
   if(U.mode==='rec'){const d=gsData();if(ok(id)&&d.money<10000){d.money=30000;d.refill++;sv();sfx('coin');K.pop&&K.pop('엄마가 용돈을 주셨다!\n3만 원 (게임 머니)')}else if(id==='clr'||ok(id)){U.mode='title'}return true}
   if(U.mode==='set'){const d=gsData(),n=SETS_UI.length;if(up(id)){U.sett=(U.sett+n-1)%n;sfx('cursor')}else if(down(id)){U.sett=(U.sett+1)%n;sfx('cursor')}else if(ok(id)){const k=SETS_UI[U.sett][0];d[k]=d[k]?0:1;sv();sfx('pop')}else if(id==='clr')U.mode='title';return true}
   /* 판 */
   if(U.pause){const P=U.pause;if(up(id)){P.sel=(P.sel+3)%4;sfx('cursor')}else if(down(id)){P.sel=(P.sel+1)%4;sfx('cursor')}
    else if(ok(id)){if(P.sel===0){U.pause=null;bgmStart()}else if(P.sel===1){const d=gsData();d.bgm=d.bgm?0:1;sv();sfx('pop')}else if(P.sel===2){U.mode='help';U.help=0;U.helpFrom='play'}else quitPlay()}
    else if(id==='clr'||id==='menu'){U.pause=null;bgmStart()}return true}
   if(U.res){if(ok(id))startMatch(U.opp);else if(id==='clr')toTitle();return true}
   if(id==='menu'||id==='clr'){U.pause={sel:0};bgmStop();sfx('pop');return true}
   if(U.choice){choiceKey(id);return true}
   const n=U.V?U.V.hand[0].length:0;
   if(/^[0-9]$/.test(id)){const i=id==='0'?9:+id-1;if(i<n)playHand(i);return true}
   if(left(id)&&n){U.cursor=(U.cursor+n-1)%n;sfx('cursor');return true}
   if(right(id)&&n){U.cursor=(U.cursor+1)%n;sfx('cursor');return true}
   if(id==='ok'){playHand(U.cursor);return true}
   return true},
  event(type,v){if(type==='hide'||type==='poweroff'){bgmStop();if(U.mode==='play'&&!U.res&&U.st)U.pause=U.pause||{sel:0}}else if(type==='show'){if(U.mode==='play'&&!U.pause&&U.st)bgmStart()}},
  leave(why){bgmStop();if(U.mode==='play'&&U.st&&!U.res)U.pause={sel:0}},
  resume(){U.t=now();if(U.mode==='play'&&U.st&&!U.res)U.pause=U.pause||{sel:0}},
  ownsSound(){return true},
  repeats(id){return U.mode==='play'&&!U.choice&&!U.pause&&(id==='left'||id==='right'||id==='4'||id==='6')}};
 function preview(g,id,t,ww,hh){g.save&&g.save();try{const k=Math.min(ww/W,hh/H);g.scale(k,k);U.ds=Math.max(1,Math.min(3,Math.round((g.getTransform?Math.hypot(g.getTransform().a,g.getTransform().b):2)*1)));
  felt(g);const fan=[CARDS[0],CARDS[8],CARDS[28],CARDS[40],CARDS[44]];fan.forEach((c,i)=>{g.save();g.translate(75,110);g.rotate((i-2)*.26);drawCard(g,c,-12,-80,24,36,true);g.restore()});
  g.font=K.fnt?K.fnt(26,true):'bold 26px sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#5a0a08';g.strokeText('신맞고',75,40);g.fillStyle='#ffd040';g.fillText('신맞고',75,40);
  const f=Math.floor(t/1400)%3,lab=['뻑!','쪽!','고!'][f];g.font=K.fnt?K.fnt(30,true):'bold 30px sans-serif';g.lineWidth=5;g.strokeStyle='#3a0a08';const s=1+Math.max(0,.4-((t%1400)/1400))*1.2;g.save();g.translate(75,150);g.scale(s,s);g.strokeText(lab,0,0);g.fillStyle='#ff7a20';g.fillText(lab,0,0);g.restore();g.textAlign='left'}catch(_){}g.restore&&g.restore()}
 function summary(){const d=gsData();return d.win+d.lose+d.draw?won(d.money)+'원 · '+d.win+'승 '+d.lose+'패':'새 게임'}
 INST={preview,summary};
 return{screens:{gostop:screen},preview,summary,version:VERSION,
  _test:{U,CARDS,newGame,playOut,score,scoreOf,tallyOf,settlement,pick,chooseMatch,goStop,aiStep,aiPick,applyOp,newZones,startMatch,pump,playHand,choiceKey,gsData,idle,canBomb,canShake,card,cardCv,OPP,screen,HELP,SFX,BGM}}}
w.AnycallGostop={version:VERSION,create,CARDS,MONTH,cardName,preview:(g,id,t,ww,hh)=>{if(INST)INST.preview(g,id,t,ww,hh)},summary:()=>INST?INST.summary():'새 게임'};
})(window);
