/* A98 애니콜 액정 화면 (버전 A98 · 2026-11-13 KST)
   휴대폰 몸체(src/anycall-phone.js)와 떨어져 있는 화면 내용. 가로 150 × 세로 184 칸을 기준으로 그린다.
   대기 화면, 메뉴, 전화번호부, 문자, 통화 기록, 벨소리, 배경 화면, 미니 게임 두 개, NATE, 내 위치, 설정.
   새 기능은 AnycallLCD.registerApp({id,name,icon,enter,draw,key,needs}) 로 메뉴 끝에 붙일 수 있다.
   버튼 이름: 0~9 * # (숫자판), menu(매뉴) ok(확인) up down left right nate send(통화) clr(취소) end(종료) */
(function(w){'use strict';
const W=150,H=184,TOP=12,BOT=16,TITLE=16;
const STORE='2006_anycall_data_v1';
const FONT='"Malgun Gothic","Apple SD Gothic Neo","NanumGothic",sans-serif';
const fnt=(s,b)=>(b?'bold ':'')+s+'px '+FONT;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const DIG=['1','2','3','4','5','6','7','8','9','*','0','#'];

/* ---------- 들어 있는 사람들 (번호는 게임 속 가짜 번호) ---------- */
const BOOK=[
 {id:'mom',n:'엄마',num:'011-0530-2006',talk:['여보세요? 어디야?','학교 끝났으면 일찍 들어와~','저녁은 김치찌개야. 손 씻고!']},
 {id:'dad',n:'아빠',num:'016-0530-1004',talk:['어, 그래. 아빠 회의 중이야.','이따 퇴근할 때 통닭 사 갈게!']},
 {id:'home',n:'우리 집',num:'02-2006-0530',noAnswer:true},
 {id:'minho',n:'단짝 민호',num:'019-1111-2006',talk:['ㅇㅇ 왜?','PC방 17번 자리 맡아 놓을게 ㅋㅋ','빨리 와 카트 한 판 하자']},
 {id:'bro',n:'우리 형',num:'017-2006-0530',talk:['왜 ㅡㅡ','형 바빠. 끊어.']},
 {id:'teacher',n:'학원 쌤',num:'011-0530-0909',voice:true},
 {id:'bunsik',n:'은하분식',num:'02-530-2006',talk:['네~ 은하분식입니다!','떡볶이요? 학교 끝나면 바로 와~ 따끈하게 해 줄게']},
 {id:'china',n:'중국집 (짜장)',num:'02-530-8282',talk:['네, 중국집입니다~','짜장면 한 그릇이요? 지금 바로 출발합니다!']}];
/* 문자 답장. 폰꾸미기 천국(web-town.js)의 답장 규칙이 있으면 그것을 먼저 쓴다 */
const OWN_REPLY={dad:'아빠 운전 중. 이따 보자 ^^',home:'(집 전화에는 문자가 안 가요)',bunsik:'[은하분식] 문자 주문은 안 받아요~ 가게로 와 ^^',china:'[중국집] 배달은 전화로 해 주세요~'};
const PHRASES=['뭐해? ㅋㅋ','PC방 ㄱㄱ?','놀이터로 나와~','숙제 뭐였지?','떡볶이 먹으러 갈래?','지금 집에 가는 중','엄마 사랑해 ♡','배고파 ㅠㅠ','학원 늦을 것 같아','ㅇㅋ 알았어','문자 그만~ 알 다 깨짐 ㅋㅋ','내일 학교 쉬는 날 맞지?'];
const SEED_INBOX=[
 {id:'s1',from:'엄마',fromId:'mom',text:'학교 끝나면 바로 학원 가라. 간식은 식탁 위에 있어',time:'15:10',read:false},
 {id:'s2',from:'단짝 민호',fromId:'minho',text:'오늘 PC방 ㄱ? 카트 한 판 ㄱㄱ',time:'14:52',read:false},
 {id:'s3',from:'NATE 알림',text:'[무료 알림] 6월은 월드컵! 응원 벨소리와 배경 화면을 받아 보세요',time:'12:00',read:true}];
const SEED_CALLS=[{t:'miss',n:'엄마',num:'011-0530-2006',time:'15:58'},{t:'in',n:'단짝 민호',num:'019-1111-2006',time:'15:40'},{t:'out',n:'우리 집',num:'02-2006-0530',time:'08:12'}];
const FALLBACK_RINGS=[['b1','기본 벨소리 1','기본','16화음',132,'E5:0.5 G5:0.5 C6:1 R:0.5 E5:0.5 G5:0.5 C6:1','C3:4',0],['b2','기본 벨소리 2','기본','16화음',120,'A5:0.5 E5:0.5 A5:0.5 E5:0.5 R:1','A3:3',0]];
const FORTUNE=['오늘은 친구랑 화해하기 좋은 날! 먼저 문자 보내 봐','군것질 운 최고! 분식집에서 덤을 받을지도','숙제를 미루면 엄마 잔소리 운이 올라가요','놀이터에서 새 친구를 사귈 운','PC방 운 보통. 6시 전에 집에 가면 대길','받아쓰기 시험 운 상승! 오늘 한 번만 연습해 봐'];
const NEWS=['[스포츠] 독일 월드컵 개막 D-10! 거리 응원 준비 한창','[생활] 내일(31일)은 지방선거일, 학교 쉬는 날','[연예] 올여름 극장가 대작 줄줄이 개봉','[날씨] 이번 주 낮 기온 25도 안팎, 자외선 조심'];

/* ---------- 메뉴 앱 목록 ---------- */
const APPS=[];
const BUILTIN=[['contacts','전화번호부','contacts'],['sms','문자','sms'],['calls','통화 기록','calls'],['ring','벨소리','ring'],['wall','배경 화면','wall'],['games','게임','game'],['nate','NATE','nate'],['gps','내 위치','gps'],['set','설정','set']];
for(const [id,name,icon] of BUILTIN)APPS.push({id,name,icon,builtin:true});
function registerApp(app){if(!app||!app.id||!app.name)throw Error('앱에는 id 와 name 이 있어야 해');const i=APPS.findIndex(a=>a.id===app.id);if(i>=0)APPS[i]=app;else APPS.push(app);return APPS.length}

/* ---------- 그리기 도구 ---------- */
function R(g,x,y,wd,ht,c){g.fillStyle=c;g.fillRect(x,y,wd,ht)}
function T(g,s,x,y,o={}){s=String(s);g.font=fnt(o.size||11,o.bold);g.textAlign=o.align||'left';g.textBaseline=o.base||'alphabetic';
 if(o.shadow){g.fillStyle=o.shadow;if(o.max)g.fillText(s,x+.8,y+.8,o.max);else g.fillText(s,x+.8,y+.8)}g.fillStyle=o.color||'#111';if(o.max)g.fillText(s,x,y,o.max);else g.fillText(s,x,y)}
function grad(g,y0,y1,a,b){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr}
function rr(g,x,y,wd,ht,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+wd-r,y);g.quadraticCurveTo(x+wd,y,x+wd,y+r);g.lineTo(x+wd,y+ht-r);g.quadraticCurveTo(x+wd,y+ht,x+wd-r,y+ht);g.lineTo(x+r,y+ht);g.quadraticCurveTo(x,y+ht,x,y+ht-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
function fit(g,s,maxW,size,bold){s=String(s);g.font=fnt(size,bold);if(g.measureText(s).width<=maxW)return s;while(s.length>1&&g.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…'}
function wrap(g,text,maxW,size,bold){g.font=fnt(size,bold);const out=[];for(const para of String(text).split('\n')){let line='';for(const ch of para){if(g.measureText(line+ch).width>maxW&&line){out.push(line);line=ch.trim()?ch:''}else line+=ch}out.push(line)}return out}

/* 작은 그림 아이콘 (22칸) */
const ICON={
 contacts(g,x,y){R(g,x+4,y+2,14,18,'#2f6fd6');R(g,x+6,y+4,10,14,'#e9f1ff');for(let i=0;i<3;i++)R(g,x+8,y+7+i*3.5,6,1.4,'#2f6fd6');R(g,x+3,y+5,2,2,'#ffcf4a');R(g,x+3,y+10,2,2,'#ffcf4a');R(g,x+3,y+15,2,2,'#ffcf4a')},
 sms(g,x,y){R(g,x+2,y+5,18,13,'#ffd34a');g.strokeStyle='#a46a00';g.lineWidth=1.2;g.strokeRect(x+2.5,y+5.5,17,12);g.beginPath();g.moveTo(x+2.5,y+5.5);g.lineTo(x+11,y+12);g.lineTo(x+19.5,y+5.5);g.stroke()},
 calls(g,x,y){g.fillStyle='#2bb24c';g.beginPath();g.moveTo(x+4,y+6);g.quadraticCurveTo(x+6,y+18,x+16,y+19);g.lineTo(x+18,y+15);g.lineTo(x+14,y+13);g.lineTo(x+12,y+15);g.quadraticCurveTo(x+9,y+13,x+8,y+10);g.lineTo(x+10,y+8);g.lineTo(x+8,y+4);g.closePath();g.fill();g.strokeStyle='#e8402a';g.lineWidth=1.6;g.beginPath();g.moveTo(x+13,y+9);g.lineTo(x+19,y+3);g.moveTo(x+15,y+3);g.lineTo(x+19,y+3);g.lineTo(x+19,y+7);g.stroke()},
 ring(g,x,y){g.fillStyle='#d6407a';g.beginPath();g.ellipse(x+7,y+17,4,3,-.4,0,Math.PI*2);g.ellipse(x+16,y+15,4,3,-.4,0,Math.PI*2);g.fill();R(g,x+9.5,y+4,1.8,13,'#d6407a');R(g,x+18.3,y+2,1.8,13,'#d6407a');g.beginPath();g.moveTo(x+9.5,y+4);g.lineTo(x+20,y+1.5);g.lineTo(x+20,y+5);g.lineTo(x+9.5,y+7.5);g.fill()},
 wall(g,x,y){R(g,x+2,y+4,18,15,'#7ac8ff');g.fillStyle='#3d9b48';g.beginPath();g.moveTo(x+2,y+19);g.lineTo(x+9,y+10);g.lineTo(x+14,y+15);g.lineTo(x+16,y+13);g.lineTo(x+20,y+19);g.fill();g.fillStyle='#ffe25a';g.beginPath();g.arc(x+15,y+8,2.5,0,Math.PI*2);g.fill();g.strokeStyle='#335';g.lineWidth=1;g.strokeRect(x+2.5,y+4.5,17,14)},
 game(g,x,y){g.fillStyle='#6a4ad8';rr(g,x+1,y+6,20,11,5);g.fill();R(g,x+5,y+10,6,2,'#fff');R(g,x+7,y+8,2,6,'#fff');g.fillStyle='#ffd34a';g.beginPath();g.arc(x+15,y+10,1.6,0,Math.PI*2);g.arc(x+18,y+13,1.6,0,Math.PI*2);g.fill()},
 nate(g,x,y){g.fillStyle='#ff7a12';g.beginPath();g.arc(x+11,y+11,9,0,Math.PI*2);g.fill();T(g,'N',x+11,y+15.5,{size:12,bold:true,color:'#fff',align:'center'})},
 gps(g,x,y){g.fillStyle='#e8402a';g.beginPath();g.arc(x+11,y+8,6,Math.PI,0);g.lineTo(x+11,y+20);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+11,y+8,2.4,0,Math.PI*2);g.fill()},
 set(g,x,y){g.fillStyle='#7b8494';for(let i=0;i<8;i++){const a=i*Math.PI/4;R(g,x+11+Math.cos(a)*7-1.6,y+11+Math.sin(a)*7-1.6,3.2,3.2,'#7b8494')}g.beginPath();g.arc(x+11,y+11,6.5,0,Math.PI*2);g.fill();g.fillStyle='#e9eef8';g.beginPath();g.arc(x+11,y+11,2.6,0,Math.PI*2);g.fill()},
 app(g,x,y){g.fillStyle='#3a9a8a';rr(g,x+3,y+3,16,16,4);g.fill();T(g,'+',x+11,y+16,{size:13,bold:true,color:'#fff',align:'center'})}};

function create(host){
 const now=()=>host.now();
 /* ---------- 저장 ---------- */
 const D={wall:'cat',ring:'r4',inbox:SEED_INBOX.map(m=>({...m})),sent:[],calls:SEED_CALLS.map(c=>({...c})),best:{mole:0,snake:0},n:3};
 try{const s=JSON.parse(w.localStorage?.getItem(STORE)||'null');if(s&&typeof s==='object'){for(const k of ['wall','ring'])if(typeof s[k]==='string')D[k]=s[k];for(const k of ['inbox','sent','calls'])if(Array.isArray(s[k]))D[k]=s[k].slice(0,30);if(s.best&&typeof s.best==='object')D.best={mole:+s.best.mole||0,snake:+s.best.snake||0};if(Number.isFinite(s.n))D.n=s.n}}catch(_){}
 const save=()=>{try{w.localStorage?.setItem(STORE,JSON.stringify(D))}catch(_){}};
 const unread=()=>D.inbox.filter(m=>!m.read).length;
 const syncLabel=()=>{const n=unread();host.label(n?'새 문자 '+n:'애니콜')};
 const rings=()=>(w.WebTown?.RINGS?.length?w.WebTown.RINGS:FALLBACK_RINGS);
 const walls=()=>(w.WebTown?.PHONE_WALLS?.length?w.WebTown.PHONE_WALLS:[['cat','별밤 고양이']]);
 const book=()=>BOOK;
 const nowStr=()=>{const c=host.clock();return c.hh+':'+c.mm};

 /* ---------- 화면 상태 ---------- */
 const S={scr:'idle',arg:null,sel:0,stack:[],dial:'',pop:null,blink:-1,dirty:true,tune:null,preview:0,live:null};
 function go(scr,arg){S.stack.push({scr:S.scr,arg:S.arg,sel:S.sel});S.scr=scr;S.arg=arg==null?null:arg;S.sel=0;enter();dirty()}
 function replace(scr,arg){S.scr=scr;S.arg=arg==null?null:arg;S.sel=0;enter();dirty()}
 function back(){stopTune();if(!S.stack.length){home();return}const p=S.stack.pop();S.scr=p.scr;S.arg=p.arg;S.sel=p.sel;S.live=null;dirty()}
 function home(){stopTune();S.stack=[];S.scr='idle';S.arg=null;S.sel=0;S.live=null;dirty()}
 function enter(){S.live=null;const sc=SCR[S.scr]||appOf(S.scr);sc?.enter?.(api)}
 function dirty(){S.dirty=true;host.invalidate()}
 function pop(text,ms=1600,modal=false){S.pop={text,until:now()+ms,modal};dirty()}
 function stopTune(){if(S.tune){S.tune=null;host.stopTune()}S.preview=0}
 function playRing(r,loop){stopTune();S.tune=r[0];const res=host.playTune(r,()=>{if(S.tune===r[0]){S.tune=null;dirty()}});if(res?.silent&&res.why==='off')pop('효과음이 꺼져 있어\n소리가 안 나요');dirty()}
 const appOf=id=>APPS.find(a=>a.id===id);

 /* ---------- 공통 틀 ---------- */
 function status(g){g.fillStyle=grad(g,0,TOP,'#33435f','#0d1524');g.fillRect(0,0,W,TOP);
  for(let i=0;i<5;i++){const hh=2+i*1.7;R(g,3+i*3,10-hh,2,hh,'#e8f0ff')}
  let x=21;if(unread()){R(g,x,3.5,9,6,'#ffd34a');g.strokeStyle='#8a5a00';g.lineWidth=.8;g.beginPath();g.moveTo(x,3.5);g.lineTo(x+4.5,7);g.lineTo(x+9,3.5);g.stroke();x+=12}
  if(!host.audioOn()||!host.prefs.keyTone){R(g,x,5,2.5,3,'#e8f0ff');g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(x+2.5,5);g.lineTo(x+5.5,2.5);g.lineTo(x+5.5,10.5);g.lineTo(x+2.5,8);g.fill();g.strokeStyle='#ff6a5a';g.lineWidth=1;g.beginPath();g.moveTo(x+7,4);g.lineTo(x+10,9);g.moveTo(x+10,4);g.lineTo(x+7,9);g.stroke()}
  if(S.scr!=='idle')T(g,nowStr(),W/2,9.5,{size:8.5,bold:true,color:'#e8f0ff',align:'center'});
  g.strokeStyle='#e8f0ff';g.lineWidth=.9;g.strokeRect(W-17.5,3,13,6.5);R(g,W-4.5,4.8,1.5,3,'#e8f0ff');for(let i=0;i<3;i++)R(g,W-16+i*4,4.5,3,3.5,'#7dff8a')}
 function soft(g,l,c,r){g.fillStyle=grad(g,H-BOT,H,'#3a4252','#0f131b');g.fillRect(0,H-BOT,W,BOT);R(g,0,H-BOT,W,.8,'#596277');
  if(l)T(g,l,5,H-4.6,{size:10,bold:true,color:'#fff'});if(c)T(g,c,W/2,H-4.6,{size:10,bold:true,color:'#ffd27a',align:'center'});if(r)T(g,r,W-5,H-4.6,{size:10,bold:true,color:'#fff',align:'right'})}
 function title(g,t,right){g.fillStyle=grad(g,TOP,TOP+TITLE,'#3d82e0','#1546a0');g.fillRect(0,TOP,W,TITLE);R(g,0,TOP+TITLE-1,W,1,'#0b2c6a');T(g,t,W/2,TOP+12,{size:11,bold:true,color:'#fff',align:'center',max:W-(right?52:10)});if(right)T(g,right,W-4,TOP+11.5,{size:8.5,color:'#d8e8ff',align:'right'})}
 function list(g,items,sel,y0=TOP+TITLE){const rowH=19,n=Math.max(1,Math.floor((H-BOT-y0)/rowH)),first=sel<n?0:sel-n+1;R(g,0,y0,W,H-BOT-y0,'#f2f6fc');
  if(!items.length){T(g,'비어 있어요',W/2,y0+30,{size:10,color:'#7a8494',align:'center'});return}
  for(let i=first;i<Math.min(items.length,first+n);i++){const it=items[i],y=y0+(i-first)*rowH,on=i===sel;
   if(on){g.fillStyle=grad(g,y,y+rowH,'#ffae4a','#f07a10');g.fillRect(0,y,W,rowH)}else R(g,0,y,W,rowH,i%2?'#e8eff9':'#fbfdff');
   R(g,0,y+rowH-.6,W,.6,'#cdd8e8');let x=4;
   if(it.num!==false&&items.length<=12){if(i<10)T(g,(i<9?String(i+1):'0')+'.',x,y+13.2,{size:9,bold:true,color:on?'#fff':'#5a6a86'});x=15}
   if(it.mark){T(g,it.mark,x,y+13.2,{size:10,bold:true,color:on?'#fff':(it.markColor||'#2f6fd6')});x+=11}
   const lw=W-x-(it.sub?Math.min(48,g.measureText?(g.font=fnt(8.5),g.measureText(it.sub).width+10):40):6);T(g,fit(g,it.label,lw,10.5,on||it.bold),x,y+13.2,{size:10.5,bold:on||it.bold,color:on?'#fff':'#16202e'});
   if(it.sub)T(g,it.sub,W-4,y+12.8,{size:8.5,color:on?'#fff3e0':'#6b778a',align:'right'})}
  if(items.length>n){const th=(H-BOT-y0)*n/items.length,ty=y0+(H-BOT-y0-th)*first/Math.max(1,items.length-n);R(g,W-2.5,y0,2.5,H-BOT-y0,'#c9d4e6');R(g,W-2.5,ty,2.5,th,'#4a7fd0')}}
 function listKey(id,items,act){const n=items.length;if(!n){if(id==='clr'||id==='left')back();return true}
  if(id==='up'){S.sel=(S.sel-1+n)%n;return true}if(id==='down'){S.sel=(S.sel+1)%n;return true}
  if(id==='ok'||id==='nate'){act(items[S.sel],S.sel);return true}if(id==='clr'||id==='left'){back();return true}
  const d=DIG.indexOf(id);if(d>=0&&d<9&&n<=12&&d<n){S.sel=d;act(items[d],d);return true}if(id==='0'&&n>=10&&n<=12){S.sel=9;act(items[9],9);return true}return false}
 function popup(g){if(!S.pop)return;const lines=wrap(g,S.pop.text,W-34,10.5,true),hh=lines.length*14+16,y=(H-hh)/2;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);g.fillStyle='#fffdf4';rr(g,10,y,W-20,hh,5);g.fill();g.strokeStyle='#f07a10';g.lineWidth=1.6;g.stroke();
  lines.forEach((l,i)=>T(g,l,W/2,y+17+i*14,{size:10.5,bold:true,color:'#1d2633',align:'center'}))}
 function wallpaper(g,kind,y0,hh){const T2=w.WebTown;if(T2?.drawWall){g.save();g.translate(0,y0);try{T2.drawWall(g,kind,W,hh)}catch(_){}g.restore();return}g.fillStyle=grad(g,y0,y0+hh,'#3a7ad8','#a8d8ff');g.fillRect(0,y0,W,hh)}

 /* ---------- 전화 걸기 ---------- */
 function findNum(num){const clean=String(num).replace(/\D/g,'');return book().find(p=>p.num.replace(/\D/g,'')===clean)||null}
 function call(target){stopTune();let who=typeof target==='string'?(findNum(target)||{n:target,num:target,unknown:true}):target;
  const c={who,phase:'dial',t0:now(),lines:[],talk0:0,result:null,ring:0};
  const digits=String(who.num||'').replace(/\D/g,'');
  if(who.unknown){if(/^(112|119|113|122)$/.test(digits))c.result={msg:'긴급 전화는 장난으로 걸면 안 돼요!\n(게임 속 휴대폰이라 연결되지 않아요)',fast:true};
   else if(digits==='114')c.result={msg:'안내 114입니다~\n동네 가게 번호는 전화번호부에 있어요',fast:false};
   else if(digits.length<7)c.result={msg:'번호를 확인하고\n다시 걸어 주세요',fast:true};else c.result={msg:'지금 거신 번호는\n없는 번호입니다.\n확인하시고 다시 걸어 주십시오.',fast:false}}
  else if(who.voice)c.result={msg:'지금은 전화를 받을 수 없어\n소리샘으로 연결됩니다.\n삐 소리가 나면 말씀하세요.',voice:true};
  else if(who.noAnswer)c.result={msg:'전화를 받지 않습니다.\n(집에 아무도 없나 봐)',late:true};
  D.calls.unshift({t:'out',n:who.n,num:who.num,time:nowStr()});D.calls=D.calls.slice(0,30);save();
  S.call=c;S.dial='';S.stack=[];S.scr='call';S.sel=0;dirty()}
 function hang(msg){const c=S.call;if(!c)return;c.phase='ended';c.endAt=now()+1300;c.endMsg=msg||'통화 종료';dirty()}

 /* ---------- 문자 ---------- */
 function sendSms(to,text){const id='m'+(++D.n);D.sent.unshift({id,to:to.n,toId:to.id,text,time:nowStr()});D.sent=D.sent.slice(0,30);save();
  const rules=(w.WebTown?.CONTACTS||[]).find(c=>c[0]===to.id);let reply=null;if(rules)reply=(rules[2].find(([re])=>re.test(text))||[null,rules[3]])[1];else if(OWN_REPLY[to.id])reply=OWN_REPLY[to.id];
  if(reply&&to.id!=='home'){const st=w.setTimeout||setTimeout;st(()=>receive({from:to.n,fromId:to.id,text:reply}),2600+Math.round(Math.random()*1800))}}
 function receive(m){D.inbox.unshift({id:'r'+(++D.n),from:m.from,fromId:m.fromId||null,text:m.text,time:nowStr(),read:false});D.inbox=D.inbox.slice(0,30);save();syncLabel();
  const r=rings().find(x=>x[0]==='r9');if(r&&!S.call)playRing(r);if(host.shown)pop('문자 왔숑~\n'+m.from,2200);dirty()}

 /* ---------- 화면들 ---------- */
 const SCR={};
 SCR.idle={draw(g,t){wallpaper(g,D.wall,TOP,H-TOP-BOT);status(g);const c=host.clock(),blink=Math.floor(t/600)%2===0;
   T(g,c.hh+(blink?':':' ')+c.mm,W/2,54,{size:31,bold:true,color:'#fff',align:'center',shadow:'rgba(0,0,0,.6)'});
   T(g,c.date,W/2,70,{size:10,bold:true,color:'#fff',align:'center',shadow:'rgba(0,0,0,.6)'});
   const n=unread();if(n&&!S.dial){g.fillStyle='rgba(255,255,255,.88)';rr(g,22,80,W-44,17,4);g.fill();ICON.sms(g,25,77.5);T(g,'새 문자 '+n+'통',W/2+9,92.5,{size:9.5,bold:true,color:'#1d2633',align:'center'})}
   if(S.dial){const y=H-BOT-48;g.fillStyle='rgba(255,255,255,.93)';g.fillRect(0,y,W,48);R(g,0,y,W,1,'#9fb4d6');T(g,'번호 입력',5,y+11,{size:8.5,color:'#4a5a76'});
    const s=S.dial,size=s.length>11?16:s.length>8?19:22;T(g,s,W-6,y+39,{size,bold:true,color:'#0d1524',align:'right',max:W-12})}
   soft(g,'메뉴',S.dial?'':'NATE',S.dial?'통화':'문자함')},
  key(id){if(DIG.includes(id)){if(S.dial.length<16)S.dial+=id;if(S.dial==='*#06#'){S.dial='';pop('애니콜 SCH-A98\n2006년 5월 출고\n버전 A98',2600)}return true}
   if(id==='clr'){if(S.dial)S.dial=S.dial.slice(0,-1);return true}
   if(id==='end'){S.dial='';return true}
   if(id==='send'){if(S.dial)call(S.dial);else go('calls');return true}
   if(id==='ok'){if(S.dial)call(S.dial);else go('inbox');return true}
   if(id==='menu'){S.dial='';go('menu');return true}
   if(id==='nate'){go('nate');return true}if(id==='up'){go('ring','music');return true}if(id==='down'){go('gps');return true}
   if(id==='left'||id==='right'){const ws=walls(),i=ws.findIndex(x=>x[0]===D.wall);D.wall=ws[(Math.max(0,i)+(id==='left'?-1:1)+ws.length)%ws.length][0];save();return true}return false}};

 SCR.menu={draw(g){R(g,0,TOP,W,H-TOP,'#eef3fb');status(g);const a=APPS[S.sel];title(g,a?a.name:'메뉴');
   const cols=3,rows=Math.ceil(APPS.length/cols),vis=3,ch=(H-TOP-TITLE-BOT)/vis,cw=W/cols,firstRow=clamp(Math.floor(S.sel/cols)-vis+1,0,Math.max(0,rows-vis));
   for(let i=firstRow*cols;i<Math.min(APPS.length,(firstRow+vis)*cols);i++){const x=(i%cols)*cw,y=TOP+TITLE+(Math.floor(i/cols)-firstRow)*ch,on=i===S.sel;
    if(on){g.fillStyle=grad(g,y+2,y+ch-2,'#ffb85c','#f07a10');rr(g,x+3,y+2,cw-6,ch-4,6);g.fill()}
    (ICON[APPS[i].icon]||ICON.app)(g,x+cw/2-11,y+4);T(g,APPS[i].name,x+cw/2,y+ch-6,{size:9,bold:on,color:on?'#fff':'#26324a',align:'center',max:cw-4});
    if(i<9)T(g,String(i+1),x+6,y+11,{size:8,bold:true,color:on?'#fff':'#8090ac'})}
   soft(g,'','선택','')},
  key(id){const n=APPS.length,cols=3;if(id==='up'){S.sel=(S.sel-cols+n*cols)%n;return true}if(id==='down'){S.sel=(S.sel+cols)%n;return true}
   if(id==='left'){S.sel=(S.sel-1+n)%n;return true}if(id==='right'){S.sel=(S.sel+1)%n;return true}
   if(id==='ok'||id==='nate'){openApp(APPS[S.sel]);return true}if(id==='clr'||id==='menu'){back();return true}
   const d=DIG.indexOf(id);if(d>=0&&d<9&&d<n){S.sel=d;openApp(APPS[d]);return true}return false}};
 function openApp(a){if(!a)return;if(a.open)a.open(api);else go(a.id)}

 SCR.contacts={items(){return book().map(p=>({label:p.n,sub:p.num.slice(-4),p}))},
  draw(g){status(g);title(g,'전화번호부',book().length+'명');list(g,this.items(),S.sel);soft(g,'문자','선택','통화')},
  key(id){const it=this.items();if(id==='send'){if(it[S.sel])call(it[S.sel].p);return true}if(id==='menu'){if(it[S.sel])go('compose',{to:it[S.sel].p});return true}
   return listKey(id,it,x=>go('person',x.p))}};
 SCR.person={draw(g){const p=S.arg;status(g);title(g,p.n);R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#f2f6fc');ICON.contacts(g,W/2-11,TOP+TITLE+8);
   T(g,p.n,W/2,TOP+TITLE+46,{size:13,bold:true,color:'#16202e',align:'center'});T(g,p.num,W/2,TOP+TITLE+62,{size:11,color:'#2f4a7a',align:'center'});
   const it=this.items();list(g,it,S.sel,TOP+TITLE+74);soft(g,'','선택','통화')},
  items(){return[{label:'전화 걸기',mark:'☎',num:true},{label:'문자 보내기',mark:'✉',num:true}]},
  key(id){const p=S.arg;if(id==='send'){call(p);return true}return listKey(id,this.items(),(x,i)=>i===0?call(p):go('compose',{to:p}))}};

 SCR.sms={items(){return[{label:'받은 문자함',sub:unread()?'새 '+unread():D.inbox.length+'통'},{label:'문자 쓰기'},{label:'보낸 문자함',sub:D.sent.length+'통'}]},
  draw(g){status(g);title(g,'문자');list(g,this.items(),S.sel);soft(g,'','선택','')},
  key(id){return listKey(id,this.items(),(x,i)=>go(['inbox','compose','outbox'][i],i===1?{}:null))}};
 SCR.inbox={items(){return D.inbox.map(m=>({label:m.from+'  '+m.text,sub:m.time,mark:m.read?'·':'●',markColor:m.read?'#9aa6ba':'#f07a10',bold:!m.read,num:false,m}))},
  draw(g){status(g);title(g,'받은 문자함',unread()?'새 '+unread():'');list(g,this.items(),S.sel);soft(g,'답장','읽기','통화')},
  key(id){const it=this.items(),m=it[S.sel]?.m;if(id==='send'&&m){const p=book().find(b=>b.id===m.fromId);if(p)call(p);else pop('번호가 없는\n알림 문자예요');return true}
   if(id==='menu'&&m){const p=book().find(b=>b.id===m.fromId);if(p)go('compose',{to:p});else pop('답장할 수 없는\n알림 문자예요');return true}
   return listKey(id,it,x=>{x.m.read=true;save();syncLabel();go('read',x.m)})}};
 SCR.outbox={items(){return D.sent.map(m=>({label:m.to+'  '+m.text,sub:m.time,mark:'✓',markColor:'#2bb24c',num:false,m}))},
  draw(g){status(g);title(g,'보낸 문자함');list(g,this.items(),S.sel);soft(g,'','읽기','')},
  key(id){return listKey(id,this.items(),x=>go('read',{...x.m,from:'받는 사람: '+x.m.to,sent:true}))}};
 SCR.read={enter(){S.scroll=0},draw(g){const m=S.arg;status(g);title(g,m.from,m.time);R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#fffef6');
   const lines=wrap(g,m.text,W-14,11.5,false),vis=Math.floor((H-TOP-TITLE-BOT-10)/15);S.maxScroll=Math.max(0,lines.length-vis);
   lines.slice(S.scroll||0,(S.scroll||0)+vis).forEach((l,i)=>T(g,l,7,TOP+TITLE+18+i*15,{size:11.5,color:'#1b2433'}));
   T(g,(w.WebTown?.smsBytes?w.WebTown.smsBytes(m.text):m.text.length*2)+'바이트',W-5,H-BOT-4,{size:8,color:'#9a8a5a',align:'right'});soft(g,m.sent?'':'답장','',m.sent?'':'통화')},
  key(id){const m=S.arg;if(id==='up'){S.scroll=Math.max(0,(S.scroll||0)-1);return true}if(id==='down'){S.scroll=Math.min(S.maxScroll||0,(S.scroll||0)+1);return true}
   if(id==='clr'||id==='ok'||id==='left'){back();return true}const p=book().find(b=>b.id===m.fromId);
   if(id==='send'&&!m.sent){if(p)call(p);else pop('번호가 없는\n알림 문자예요');return true}
   if(id==='menu'&&!m.sent){if(p)go('compose',{to:p});else pop('답장할 수 없는\n알림 문자예요');return true}return false}};
 SCR.compose={enter(){S.step=S.arg?.to?1:0},items(){return S.step===0?book().filter(p=>p.id!=='home').map(p=>({label:p.n,sub:p.num.slice(-4),p})):PHRASES.map(t=>({label:t,num:true}))},
  draw(g){status(g);const to=S.arg?.to;title(g,S.step===0?'받는 사람 고르기':'상용구 고르기',S.step===1&&to?to.n:'');list(g,this.items(),S.sel);soft(g,'','선택','')},
  key(id){const it=this.items();return listKey(id,it,x=>{if(S.step===0){S.arg={to:x.p};S.step=1;S.sel=0}else replace('sending',{to:S.arg.to,text:x.label})})}};
 SCR.sending={enter(){S.t0=now();S.live='sending'},draw(g,t){status(g);title(g,'문자 보내기');R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#f2f6fc');const p=clamp((t-S.t0)/1300,0,1);
   ICON.sms(g,W/2-11+Math.sin(t/90)*2,52);T(g,(S.arg.to.n)+'에게',W/2,92,{size:10.5,bold:true,color:'#16202e',align:'center'});
   const lines=wrap(g,'"'+S.arg.text+'"',W-24,9.5,false);lines.slice(0,2).forEach((l,i)=>T(g,l,W/2,107+i*12,{size:9.5,color:'#44506a',align:'center'}));
   R(g,16,136,W-32,8,'#c9d4e6');R(g,16,136,(W-32)*p,8,'#2bb24c');T(g,p<1?'전송 중...':'전송 완료!',W/2,158,{size:10,bold:true,color:p<1?'#2f4a7a':'#1f8a3a',align:'center'});soft(g,'','','')},
  needs(t){if(t-S.t0>=1900){sendSms(S.arg.to,S.arg.text);back();pop('문자를 보냈어요',1300);return true}return true},
  key(id){return true}};

 SCR.calls={items(){return D.calls.map(c=>({label:c.n,sub:c.time,mark:c.t==='out'?'↗':c.t==='in'?'↙':'✕',markColor:c.t==='miss'?'#e8402a':c.t==='in'?'#2bb24c':'#2f6fd6',num:false,c}))},
  draw(g){status(g);title(g,'통화 기록',D.calls.length+'건');list(g,this.items(),S.sel);soft(g,'','선택','통화')},
  key(id){const it=this.items();if(id==='send'||id==='ok'||id==='nate'){const c=it[S.sel]?.c;if(c)call(findNum(c.num)||c.num);return true}return listKey(id,it,()=>{})}};

 SCR.ring={enter(){const rs=rings();const i=rs.findIndex(r=>r[0]===D.ring);S.sel=S.arg==='music'?0:Math.max(0,i)},
  items(){return rings().map(r=>({label:r[1],sub:r[3],mark:r[0]===D.ring&&S.arg!=='music'?'✓':S.tune===r[0]?'♪':'',markColor:'#1f8a3a',num:false,r}))},
  draw(g,t){status(g);title(g,S.arg==='music'?'뮤직':'벨소리',S.tune?'♪ 재생 중':'');list(g,this.items(),S.sel);
   if(S.tune){for(let i=0;i<5;i++){const hh=3+Math.abs(Math.sin(t/120+i*1.3))*9;R(g,W-26+i*4,TOP+TITLE-2-hh,3,hh,'#7dff8a')}}
   soft(g,S.arg==='music'?'':'듣기',S.arg==='music'?(S.tune?'정지':'재생'):'설정','')},
  needs(t){if(S.preview&&t>=S.preview){S.preview=0;const r=rings()[S.sel];if(r)playRing(r)}return!!S.tune&&Math.floor(t/120)!==S.eq&&((S.eq=Math.floor(t/120)),true)},
  key(id){const it=this.items(),r=it[S.sel]?.r;
   if(id==='up'||id==='down'){listKey(id,it,()=>{});if(S.arg!=='music'){stopTune();S.preview=now()+450}return true}
   if(id==='menu'&&r&&S.arg!=='music'){playRing(r);return true}
   if((id==='ok'||id==='nate')&&r){if(S.arg==='music'){if(S.tune===r[0])stopTune();else playRing(r)}else{D.ring=r[0];save();stopTune();pop('‘'+r[1]+'’\n벨소리로 정했어요')}return true}
   if(id==='clr'||id==='left'){stopTune();back();return true}return listKey(id,it,()=>{})}};

 SCR.wall={enter(){S.sel=Math.max(0,walls().findIndex(x=>x[0]===D.wall))},
  draw(g){const ws=walls(),cur=ws[S.sel]||ws[0];wallpaper(g,cur[0],TOP,H-TOP-BOT);status(g);
   g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,TOP,W,17);T(g,'◀ '+cur[1]+' ▶',W/2,TOP+12.5,{size:10.5,bold:true,color:'#fff',align:'center'});
   T(g,(S.sel+1)+'/'+ws.length,W-4,H-BOT-4,{size:9,bold:true,color:'#fff',align:'right',shadow:'rgba(0,0,0,.7)'});if(cur[0]===D.wall)T(g,'✓ 지금 배경',5,H-BOT-4,{size:9,bold:true,color:'#fff',shadow:'rgba(0,0,0,.7)'});soft(g,'','설정','')},
  key(id){const n=walls().length;if(id==='left'||id==='up'){S.sel=(S.sel-1+n)%n;return true}if(id==='right'||id==='down'){S.sel=(S.sel+1)%n;return true}
   if(id==='ok'||id==='nate'){D.wall=walls()[S.sel][0];save();pop('배경 화면으로\n정했어요');return true}if(id==='clr'){back();return true}return false}};

 SCR.games={items(){return[{label:'두더지 잡기',sub:'최고 '+D.best.mole},{label:'지렁이 게임',sub:'최고 '+D.best.snake}]},
  draw(g){status(g);title(g,'게임');list(g,this.items(),S.sel);T(g,'숫자판은 슬라이드를 올리고!',W/2,H-BOT-6,{size:8.5,color:'#6b778a',align:'center'});soft(g,'','시작','')},
  key(id){return listKey(id,this.items(),(x,i)=>go(i?'snake':'mole'))}};
 /* 두더지 잡기: 숫자 1~9가 구멍. 슬라이드를 닫았을 때는 방향 버튼과 NATE로 잡는다 */
 SCR.mole={enter(){const t=now();S.g={score:0,end:t+30000,holes:Array(9).fill(0),cur:4,next:t+700,over:false,flash:null,sec:30};S.live='mole'},
  draw(g,t){const G2=S.g;status(g);title(g,'두더지 잡기',G2.over?'':Math.max(0,Math.ceil((G2.end-t)/1000))+'초');R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#8fd16a');
   T(g,'점수 '+G2.score,6,TOP+TITLE+12,{size:10,bold:true,color:'#1d3a12'});T(g,'최고 '+D.best.mole,W-6,TOP+TITLE+12,{size:9,color:'#2d4a22',align:'right'});
   for(let i=0;i<9;i++){const x=12+(i%3)*44,y=TOP+TITLE+18+Math.floor(i/3)*42,cx=x+19,cy=y+28;
    if(i===G2.cur){g.strokeStyle='#fff';g.lineWidth=1.5;rr(g,x,y,38,38,5);g.stroke()}
    g.fillStyle='#3a2a1a';g.beginPath();g.ellipse(cx,cy,15,6,0,0,Math.PI*2);g.fill();
    if(G2.holes[i]>t){g.fillStyle='#8a5a32';g.beginPath();g.arc(cx,cy-7,10,Math.PI,0);g.lineTo(cx+10,cy);g.lineTo(cx-10,cy);g.fill();R(g,cx-4,cy-10,2,2,'#111');R(g,cx+2,cy-10,2,2,'#111');R(g,cx-2,cy-6,4,2.5,'#ff9aa8')}
    if(G2.flash&&G2.flash.i===i&&t<G2.flash.until){T(g,'뿅!',cx,cy-12,{size:11,bold:true,color:'#fff',align:'center',shadow:'#c0392b'})}
    T(g,String(i+1),x+4,y+10,{size:8.5,bold:true,color:'#1d3a12'})}
   if(G2.over){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,64,W,52);T(g,'끝! 점수 '+G2.score,W/2,86,{size:14,bold:true,color:'#fff',align:'center'});T(g,'확인: 다시 · 취소: 나가기',W/2,104,{size:9,color:'#ffe7b0',align:'center'})}
   soft(g,'',G2.over?'다시':'잡기','')},
  needs(t){const G2=S.g;if(G2.over)return false;let ch=false;if(t>=G2.end){G2.over=true;if(G2.score>D.best.mole){D.best.mole=G2.score;save()}return true}
   if(t>=G2.next){const free=[];for(let i=0;i<9;i++)if(G2.holes[i]<=t)free.push(i);if(free.length){G2.holes[free[Math.floor(Math.random()*free.length)]]=t+650+Math.random()*550}G2.next=t+420+Math.random()*480;ch=true}
   const s=Math.ceil((G2.end-t)/1000);if(s!==G2.sec){G2.sec=s;ch=true}if(G2.flash&&t>=G2.flash.until){G2.flash=null;ch=true}for(let i=0;i<9;i++)if(G2.holes[i]&&G2.holes[i]<=t){G2.holes[i]=0;ch=true}return ch},
  key(id){const G2=S.g,t=now();if(G2.over){if(id==='ok'||id==='nate'){SCR.mole.enter();return true}if(id==='clr'){back();return true}return true}
   const hitAt=i=>{if(G2.holes[i]>t){G2.score++;G2.holes[i]=0;G2.flash={i,until:t+260};host.beep([1760,2350],60,.05,'square',.06)}};
   const d=DIG.indexOf(id);if(d>=0&&d<9){G2.cur=d;hitAt(d);return true}
   if(id==='up')G2.cur=(G2.cur+6)%9;else if(id==='down')G2.cur=(G2.cur+3)%9;else if(id==='left')G2.cur=G2.cur%3?G2.cur-1:G2.cur+2;else if(id==='right')G2.cur=G2.cur%3===2?G2.cur-2:G2.cur+1;
   else if(id==='ok'||id==='nate')hitAt(G2.cur);else if(id==='clr'){back();return true}return true}};
 /* 지렁이 게임: 방향 버튼이나 2 4 6 8 */
 SCR.snake={enter(){const t=now();S.g={body:[{x:7,y:6},{x:6,y:6},{x:5,y:6}],dir:{x:1,y:0},want:{x:1,y:0},food:{x:11,y:6},last:t,stepMs:200,score:0,over:false};S.live='snake'},
  draw(g){const G2=S.g,cs=9,ox=3,oy=TOP+TITLE+14,cols=16,rows=12;status(g);title(g,'지렁이 게임');R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#c9e6a0');
   T(g,'점수 '+G2.score,6,TOP+TITLE+11,{size:9.5,bold:true,color:'#2d4a22'});T(g,'최고 '+D.best.snake,W-6,TOP+TITLE+11,{size:9,color:'#2d4a22',align:'right'});
   R(g,ox-1,oy-1,cols*cs+2,rows*cs+2,'#5a7a3a');R(g,ox,oy,cols*cs,rows*cs,'#e2f2c4');
   g.fillStyle='#e8402a';g.beginPath();g.arc(ox+G2.food.x*cs+4.5,oy+G2.food.y*cs+4.5,3.6,0,Math.PI*2);g.fill();
   G2.body.forEach((p,i)=>{R(g,ox+p.x*cs+.5,oy+p.y*cs+.5,cs-1,cs-1,i?'#3d7a2a':'#1f5a14')});
   if(G2.over){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,70,W,48);T(g,'끝! 점수 '+G2.score,W/2,92,{size:14,bold:true,color:'#fff',align:'center'});T(g,'확인: 다시 · 취소: 나가기',W/2,108,{size:9,color:'#ffe7b0',align:'center'})}
   soft(g,'',G2.over?'다시':'','')},
  needs(t){const G2=S.g;if(G2.over||t-G2.last<G2.stepMs)return false;G2.last=t;G2.dir=G2.want;const h=G2.body[0],n={x:h.x+G2.dir.x,y:h.y+G2.dir.y};
   if(n.x<0||n.y<0||n.x>=16||n.y>=12||G2.body.some(p=>p.x===n.x&&p.y===n.y)){G2.over=true;host.beep([220,180],260,.06,'square');if(G2.score>D.best.snake){D.best.snake=G2.score;save()}return true}
   G2.body.unshift(n);if(n.x===G2.food.x&&n.y===G2.food.y){G2.score++;G2.stepMs=Math.max(95,G2.stepMs-7);host.beep([1568],50,.05,'square');let f;do{f={x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*12)}}while(G2.body.some(p=>p.x===f.x&&p.y===f.y));G2.food=f}else G2.body.pop();return true},
  key(id){const G2=S.g;if(G2.over){if(id==='ok'||id==='nate'){SCR.snake.enter();return true}if(id==='clr'){back();return true}return true}
   const map={up:[0,-1],'2':[0,-1],down:[0,1],'8':[0,1],left:[-1,0],'4':[-1,0],right:[1,0],'6':[1,0]};const m=map[id];
   if(m){if(m[0]!==-G2.dir.x||m[1]!==-G2.dir.y)G2.want={x:m[0],y:m[1]};return true}if(id==='clr'){back();return true}return true}};

 SCR.nate={enter(){S.step=0},items(){return[{label:'오늘의 운세'},{label:'뉴스 속보'},{label:'동네 날씨'},{label:'벨소리 · 배경 화면'}]},
  draw(g,t){status(g);if(S.step===0){R(g,0,TOP,W,H-TOP,'#fff7ef');ICON.nate(g,W/2-11,30);T(g,'NATE에 접속할까요?',W/2,70,{size:11,bold:true,color:'#1d2633',align:'center'});
    wrap(g,'접속하면 데이터 요금이 나와요. 엄마한테 혼날 수도 있어요!',W-24,9.5).forEach((l,i)=>T(g,l,W/2,90+i*13,{size:9.5,color:'#7a5a3a',align:'center'}));soft(g,'','접속','')}
   else if(S.step===1){R(g,0,TOP,W,H-TOP,'#fff7ef');ICON.nate(g,W/2-11,48);const p=clamp((t-S.t0)/1400,0,1);R(g,20,92,W-40,7,'#f0d8c0');R(g,20,92,(W-40)*p,7,'#ff7a12');T(g,'NATE 접속 중...',W/2,116,{size:10,bold:true,color:'#7a4a12',align:'center'});soft(g,'','','')}
   else{status(g);g.fillStyle=grad(g,TOP,TOP+TITLE,'#ff9a3a','#e8620a');g.fillRect(0,TOP,W,TITLE);T(g,'NATE',W/2,TOP+12,{size:11.5,bold:true,color:'#fff',align:'center'});list(g,this.items(),S.sel);soft(g,'','선택','')}},
  needs(t){if(S.step===1){if(t-S.t0>=1500){S.step=2;S.sel=0}return true}return false},
  key(id){if(S.step===0){if(id==='ok'||id==='nate'){S.step=1;S.t0=now();S.live='nate'}else if(id==='clr')back();return true}if(S.step===1)return true;
   if(id==='clr'||id==='left'){back();pop('NATE 접속을 끝냈어요\n(데이터 요금 120원)',1700);return true}
   return listKey(id,this.items(),(x,i)=>{const p=host.place();const txt=i===0?FORTUNE[Math.floor(Math.random()*FORTUNE.length)]:i===1?NEWS.join('\n\n'):i===2?'지금 동네 날씨: '+p.weather+'\n시간: '+p.time+'\n\n'+(p.weather.includes('비')?'우산 챙기세요! 골목길 물웅덩이 조심':'놀이터 가기 딱 좋은 날씨예요'):'PC방 컴퓨터 ‘폰꾸미기 천국’에서 벨소리를 미리 들어 볼 수 있어요.\n\n이 휴대폰의 벨소리와 배경 화면 메뉴에도 들어 있어요!';
    go('read',{from:x.label,time:nowStr(),text:txt,sent:true})})}};
 SCR.gps={enter(){S.t0=now();S.live='gps'},draw(g,t){status(g);title(g,'내 위치 (GPS)');R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,'#0e2a1e');
   const cx=W/2,cy=72,p=(t-S.t0)/1600;g.strokeStyle='#3ad27a';g.lineWidth=1;for(const r of [12,24,36]){g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke()}
   g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(t/300)*36,cy+Math.sin(t/300)*36);g.stroke();
   if(p<1){T(g,'위성 찾는 중...',W/2,128,{size:10.5,bold:true,color:'#9effc0',align:'center'})}
   else{const pl=host.place();g.fillStyle='#ff5a4a';g.beginPath();g.arc(cx+8,cy-6,4,0,Math.PI*2);g.fill();T(g,'지금 있는 곳',W/2,122,{size:9,color:'#9effc0',align:'center'});T(g,pl.area,W/2,138,{size:11.5,bold:true,color:'#fff',align:'center',max:W-10});T(g,pl.scene+' · '+pl.time,W/2,153,{size:9,color:'#cfe',align:'center',max:W-10})}
   soft(g,'','','')},
  needs(t){return t-S.t0<4000||Math.floor(t/150)!==S.gt&&((S.gt=Math.floor(t/150)),true)},key(id){if(id==='clr'||id==='ok'){back();return true}return true}};
 SCR.set={items(){const p=host.prefs;return[{label:'키음',sub:p.keyTone?'켜짐':'꺼짐'},{label:'키음 크기',sub:'■'.repeat(p.keyVol)+'□'.repeat(5-p.keyVol)},{label:'슬라이드 소리',sub:p.slideTone?'켜짐':'꺼짐'},{label:'받은 문자 다 읽음'},{label:'휴대폰 정보'}]},
  draw(g){status(g);title(g,'설정');list(g,this.items(),S.sel);T(g,'효과음 크기는 게임 소리 설정을 따라요',W/2,H-BOT-5,{size:7.5,color:'#6b778a',align:'center'});soft(g,'','바꾸기','')},
  key(id){const p=host.prefs,i=S.sel;if((id==='left'||id==='right')&&i===1){p.keyVol=clamp(p.keyVol+(id==='left'?-1:1),1,5);host.savePrefs();host.keyBeep('5');return true}
   return listKey(id,this.items(),(x,j)=>{if(j===0)p.keyTone=!p.keyTone;else if(j===1)p.keyVol=p.keyVol%5+1;else if(j===2)p.slideTone=!p.slideTone;else if(j===3){D.inbox.forEach(m=>m.read=true);save();syncLabel();pop('모두 읽음으로\n바꿨어요')}else pop('애니콜 슬라이드폰\n2006년 5월\n버전 A98',2200);host.savePrefs()})}};
 SCR.call={draw(g,t){const c=S.call;if(!c){home();return}R(g,0,TOP,W,H-TOP,'#0d1a2e');g.fillStyle=grad(g,TOP,H,'#1b3a6a','#08101e');g.fillRect(0,TOP,W,H-TOP);status(g);
   const who=c.who;ICON.calls(g,W/2-11,TOP+10);T(g,who.unknown?'모르는 번호':who.n,W/2,TOP+52,{size:14,bold:true,color:'#fff',align:'center',max:W-10});T(g,who.num||'',W/2,TOP+67,{size:10,color:'#bcd4ff',align:'center'});
   if(c.phase==='dial'){const dots='.'.repeat(1+Math.floor((t-c.t0)/400)%3);T(g,'전화 거는 중'+dots,W/2,TOP+92,{size:10.5,bold:true,color:'#ffd27a',align:'center'})}
   else if(c.phase==='talk'){const s=Math.floor((t-c.talk0)/1000);T(g,'통화 중  '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'),W/2,TOP+86,{size:10,bold:true,color:'#7dff8a',align:'center'});
    let y=TOP+100;for(const l of c.lines.slice(-3)){const ls=wrap(g,l,W-26,9.5,false);g.fillStyle='rgba(255,255,255,.92)';rr(g,8,y-2,W-16,ls.length*12+6,4);g.fill();ls.forEach((x,i)=>T(g,x,13,y+8+i*12,{size:9.5,color:'#16202e'}));y+=ls.length*12+9}}
   else if(c.phase==='msg'){wrap(g,c.result.msg,W-16,9.5,true).forEach((l,i)=>T(g,l,W/2,TOP+92+i*13,{size:9.5,bold:true,color:'#ffe7b0',align:'center'}))}
   else{T(g,c.endMsg||'통화 종료',W/2,TOP+96,{size:11,bold:true,color:'#ff9a8a',align:'center'})}
   soft(g,'','','종료')},
  needs(t){const c=S.call;if(!c)return false;
   if(c.phase==='dial'){if(!c.result?.fast&&t>=c.ring){c.ring=t+3000;host.beep([440,480],1000,.05,'sine')}const wait=c.result?.fast?700:c.result?.late?6200:2400;if(t-c.t0>=wait){if(c.result){c.phase='msg';c.msgAt=t;if(c.result.voice)host.beep([1000],600,.05,'sine',2.6)}else{c.phase='talk';c.talk0=t;c.next=t}}return true}
   if(c.phase==='talk'){const lines=c.who.talk||['여보세요?'];if(t>=c.next&&c.lines.length<lines.length){c.lines.push(lines[c.lines.length]);c.next=t+1900}if(c.lines.length>=lines.length&&t>=c.next+1600)hang('상대방이 전화를 끊었어요');return true}
   if(c.phase==='msg'){if(t-c.msgAt>=(c.result.voice?6000:4200))hang('통화 종료');return true}
   if(c.phase==='ended'&&t>=c.endAt){S.call=null;home();return true}return false},
  key(id){const c=S.call;if(!c)return true;if(id==='end'||id==='clr'){if(c.phase==='ended'){S.call=null;home()}else hang(c.phase==='talk'?'통화 종료':'전화를 끊었어요');return true}return true}};


 /* ---------- 몸체가 부르는 것 ---------- */
 function key(id){if(S.pop&&S.pop.modal){S.pop=null;dirty();return}if(S.pop)S.pop=null;
  if(id==='end'&&S.scr!=='call'){S.dial='';home();return}
  const sc=SCR[S.scr]||appOf(S.scr);if(sc?.key)sc.key.call(sc,id,api);dirty()}
 function draw(g,t){S.dirty=false;const sc=SCR[S.scr]||appOf(S.scr);if(sc?.draw)sc.draw.call(sc,g,t,api);else{status(g);title(g,'준비 중');soft(g,'','','')}
  if(host.hintActive(t)){g.fillStyle='rgba(10,20,40,.85)';rr(g,12,104,W-24,30,5);g.fill();T(g,'슬라이드를 올려야',W/2,116,{size:9.5,bold:true,color:'#fff',align:'center'});T(g,'숫자를 누를 수 있어요',W/2,128,{size:9.5,bold:true,color:'#fff',align:'center'})}
  popup(g);S.blink=Math.floor(t/600)}
 function needs(t){let n=S.dirty;if(S.pop&&t>=S.pop.until){S.pop=null;n=true}if(S.scr==='idle'&&Math.floor(t/600)!==S.blink)n=true;if(host.hintActive(t)!==S.hinted){S.hinted=host.hintActive(t);n=true}
  const sc=SCR[S.scr]||appOf(S.scr);if(sc?.needs&&sc.needs.call(sc,t,api))n=true;return n}
 function event(type,v){if(type==='slide'&&!v&&S.scr==='idle'&&S.dial){S.dial=''}if(type==='hide')stopTune();if(type==='show')syncLabel();dirty()}
 const api={W,H,data:D,state:S,go,back,home,pop,call,receive,sendSms,unread,book,rings,walls,draw,key,needs,event,save,
  get screen(){return S.scr},get dial(){return S.dial}};
 syncLabel();
 return api}

w.AnycallLCD={version:'A98',W,H,create,registerApp,apps:APPS,book:BOOK,phrases:PHRASES};
})(window);
