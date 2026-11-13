/* A101 애니콜 액정 화면 (버전 A101 · 2026-11-13 KST)
   A100: NATE를 2006년 무선 인터넷처럼 따로 만든 브라우저(src/anycall-nate.js)로 바꿈. 카메라 조준과 파일 저장, 메뉴 색 테마,
         배경 화면 받기, 숫자 바로가기(번호를 누르고 NATE), 컬러링(친구가 나에게 걸 때 연결음 대신 노래).
   휴대폰 몸체(src/anycall-phone.js)와 떨어져 있는 화면 내용. 가로 150 × 세로 184 칸을 기준으로 그린다.
   A98: 대기 화면, 메뉴, 전화번호부, 문자, 통화 기록, 벨소리, 배경 화면, 게임 두 개, NATE, 내 위치, 설정.
   A99: 문자를 자판으로 바로 쓰기(입력 칸)와 숫자판 한글 입력(천지인 모음 + 숫자판에 적힌 자음),
        같은 방 친구와 진짜 문자, 포토 메일, 진짜 전화(울림, 받기, 거절, 통화 중 말하기),
        카메라와 사진첩, DMB 방송, 멜로디 작곡, 친구 찾기, 달력, 계산기, 메모장, 게임 두 개 더(점프 달리기, 숫자 야구),
        NATE 벨소리 게임 받기와 싸이월드 모바일, 매너모드(진동, 무음), 이번 달 요금과 엄마 잔소리 문자.
   새 기능은 AnycallLCD.registerApp({id,name,icon,enter,draw,key,needs}) 로 메뉴 끝에 붙일 수 있다.
   버튼 이름: 0~9 * # (숫자판), menu(매뉴) ok(확인) up down left right nate send(통화) clr(취소) end(종료) */
(function(w){'use strict';
const W=150,H=184,TOP=12,BOT=16,TITLE=16;
const STORE='2006_anycall_data_v1',PSTORE='2006_anycall_photos_v1';
const FONT='"Malgun Gothic","Apple SD Gothic Neo","NanumGothic",sans-serif';
const fnt=(s,b)=>(b?'bold ':'')+s+'px '+FONT;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const DIG=['1','2','3','4','5','6','7','8','9','*','0','#'];
const smsBytes=s=>{let n=0;for(const ch of String(s||''))n+=ch.charCodeAt(0)<128?1:2;return n};

/* ---------- 한글 숫자판 입력 ----------
   자음은 숫자판에 적힌 대로 (같은 키를 다시 누르면 바뀜): 2 ㄱ ㅋ ㄲ · 3 ㄷ ㅌ ㄸ · 4 ㄹ ㄴ · 5 ㅁ · 6 ㅂ ㅍ ㅃ · 7 ㅅ ㅎ ㅆ · 8 ㅇ · 9 ㅈ ㅊ ㅉ
   모음은 애니콜 천지인: 1 ㅣ · * ㆍ · 0 ㅡ (ㅣㆍ=ㅏ, ㆍㅣ=ㅓ, ㆍㅡ=ㅗ, ㅡㆍ=ㅜ ...) · # 띄어쓰기 · ▶ 다음 글자 */
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const DBL={'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
const KO_CONS={'2':'ㄱㅋㄲ','3':'ㄷㅌㄸ','4':'ㄹㄴ','5':'ㅁ','6':'ㅂㅍㅃ','7':'ㅅㅎㅆ','8':'ㅇ','9':'ㅈㅊㅉ'};
const STROKE={'1':'I','*':'D','0':'E'};
const VOW={I:'ㅣ',E:'ㅡ',D:'ㆍ',DD:'‥',ID:'ㅏ',IDD:'ㅑ',DI:'ㅓ',DDI:'ㅕ',DE:'ㅗ',DDE:'ㅛ',ED:'ㅜ',EDD:'ㅠ',EI:'ㅢ',IDI:'ㅐ',IDDI:'ㅒ',DII:'ㅔ',DDII:'ㅖ',DEI:'ㅚ',DEID:'ㅘ',DEIDI:'ㅙ',EDI:'ㅟ',EDDI:'ㅝ',EDDII:'ㅞ'};
const EN_KEYS={'1':'.,?!\'-1','2':'abc2','3':'def3','4':'ghi4','5':'jkl5','6':'mno6','7':'pqrs7','8':'tuv8','9':'wxyz9','0':'0','*':'*@/()&~'};
const TAP_MS=1100;
const isC=c=>CHO.includes(c)&&c.length===1,isV=c=>JUNG.includes(c)&&c.length===1;
function composeJamo(L){let out='',i=0;const n=L.length;
 while(i<n){const c=L[i];
  if(isC(c)&&i+1<n&&isV(L[i+1])){const ci=CHO.indexOf(c),vi=JUNG.indexOf(L[i+1]);i+=2;let ji=0;
   if(i<n&&isC(L[i])&&JONG.indexOf(L[i])>0&&!(i+1<n&&isV(L[i+1]))){let jc=L[i];i++;
    if(i<n&&isC(L[i])&&DBL[jc+L[i]]&&!(i+1<n&&isV(L[i+1]))){jc=DBL[jc+L[i]];i++}ji=JONG.indexOf(jc)}
   out+=String.fromCharCode(0xAC00+(ci*21+vi)*28+ji)}
  else{out+=c;i++}}
 return out}
function Editor(o={}){const ed={tokens:[],mode:o.mode||'ko',pend:null,max:o.max||80,now:o.now||(()=>Date.now())};
 const MODES=['ko','en','num'];
 ed.text=()=>composeJamo(ed.tokens.map(t=>t.t==='v'?VOW[t.s]:t.ch));
 ed.bytes=()=>smsBytes(ed.text());
 ed.setText=s=>{ed.tokens=Array.from(String(s||'')).map(ch=>({t:'l',ch}));ed.pend=null;while(ed.bytes()>ed.max)ed.tokens.pop()};
 ed.clear=()=>{ed.tokens=[];ed.pend=null};
 ed.nextMode=()=>{ed.mode=MODES[(MODES.indexOf(ed.mode)+1)%MODES.length];ed.pend=null;return ed.mode};
 ed.modeName=()=>({ko:'한글',en:'영문',num:'숫자'})[ed.mode];
 ed.pending=t=>!!(ed.pend&&t-ed.pend.at<TAP_MS);
 const fits=()=>ed.bytes()<=ed.max;
 const push=tok=>{ed.tokens.push(tok);if(!fits()){ed.tokens.pop();return false}return true};
 ed.del=()=>{ed.pend=null;const last=ed.tokens[ed.tokens.length-1];if(!last)return false;if(last.t==='v'&&last.s.length>1)last.s=last.s.slice(0,-1);else ed.tokens.pop();return true};
 ed.key=id=>{const t=ed.now();
  if(id==='clr'||id==='left')return ed.del();
  if(id==='right'){if(ed.pend){ed.pend=null;return true}return push({t:'l',ch:' '})}
  if(id==='#'&&ed.mode!=='num'){ed.pend=null;return push({t:'l',ch:' '})}
  if(ed.mode==='num'){if(!DIG.includes(id))return false;ed.pend=null;return push({t:'l',ch:id})}
  const cyc=ed.mode==='ko'?KO_CONS[id]:EN_KEYS[id];
  if(cyc){const p=ed.pend,tok=p&&ed.tokens[p.idx];
   if(p&&p.key===id&&t-p.at<TAP_MS&&tok&&p.idx===ed.tokens.length-1){const old=tok.ch;tok.ch=cyc[(cyc.indexOf(tok.ch)+1)%cyc.length];if(!fits())tok.ch=old;p.at=t;return true}
   const ok=push({t:ed.mode==='ko'?'c':'l',ch:cyc[0],key:id});ed.pend=ok?{key:id,at:t,idx:ed.tokens.length-1}:null;return ok}
  if(ed.mode==='ko'&&STROKE[id]){ed.pend=null;const s=STROKE[id],last=ed.tokens[ed.tokens.length-1];
   if(last&&last.t==='v'&&VOW[last.s+s]){last.s+=s;if(!fits())last.s=last.s.slice(0,-1);return true}return push({t:'v',s})}
  return false};
 ed.insert=s=>{ed.pend=null;let ok=true;for(const ch of Array.from(String(s)))if(!push({t:'l',ch})){ok=false;break}return ok};
 return ed}

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
const OWN_REPLY={dad:'아빠 운전 중. 이따 보자 ^^',bunsik:'[은하분식] 문자 주문은 안 받아요~ 가게로 와 ^^',china:'[중국집] 배달은 전화로 해 주세요~'};
const PHRASES=['뭐해? ㅋㅋ','PC방 ㄱㄱ?','놀이터로 나와~','숙제 뭐였지?','떡볶이 먹으러 갈래?','지금 집에 가는 중','엄마 사랑해 ♡','배고파 ㅠㅠ','학원 늦을 것 같아','ㅇㅋ 알았어','문자 그만~ 알 다 깨짐 ㅋㅋ','내일 학교 쉬는 날 맞지?'];
const EMO=['^^','^_^','*^^*','ㅋㅋㅋ','ㅎㅎ','ㅠㅠ','ㅡㅡ;','-_-','♡','♥','★','☆','~','!','?','.','♪','(^o^)/','orz','=3=','ㅇㅋ','ㄱㄱ','ㅂㅂ','ㄴㄴ'];
const SEED_INBOX=[
 {id:'s1',from:'엄마',fromId:'mom',text:'학교 끝나면 바로 학원 가라. 간식은 식탁 위에 있어',time:'15:10',read:false},
 {id:'s2',from:'단짝 민호',fromId:'minho',text:'오늘 PC방 ㄱ? 카트 한 판 ㄱㄱ',time:'14:52',read:false},
 {id:'s3',from:'NATE 알림',text:'[무료 알림] 6월은 월드컵! 응원 벨소리와 배경 화면을 받아 보세요',time:'12:00',read:true}];
const SEED_CALLS=[{t:'miss',n:'엄마',num:'011-0530-2006',time:'15:58'},{t:'in',n:'단짝 민호',num:'019-1111-2006',time:'15:40'},{t:'out',n:'우리 집',num:'02-2006-0530',time:'08:12'}];
const FALLBACK_RINGS=[['r4','기본 벨소리','기본','16화음',132,'E5:0.5 G5:0.5 C6:1 R:0.5 E5:0.5 G5:0.5 C6:1','C3:4',0],['r9','문자 알림','기본','16화음',120,'E6:0.25 G6:0.25 C7:0.5','C4:2',0]];
const FREE_RINGS=['r4','r7','r9','r10'];
const FORTUNE=['오늘은 친구랑 화해하기 좋은 날! 먼저 문자 보내 봐','군것질 운 최고! 분식집에서 덤을 받을지도','숙제를 미루면 엄마 잔소리 운이 올라가요','놀이터에서 새 친구를 사귈 운','PC방 운 보통. 6시 전에 집에 가면 대길','받아쓰기 시험 운 상승! 오늘 한 번만 연습해 봐'];
const NEWS=['[스포츠] 독일 월드컵 개막 D-10! 거리 응원 준비 한창','[생활] 내일(31일)은 지방선거일, 학교 쉬는 날','[연예] 올여름 극장가 대작 줄줄이 개봉','[날씨] 이번 주 낮 기온 25도 안팎, 자외선 조심'];
/* 2006년 5월과 6월 달력 (5월 1일은 월요일, 6월 1일은 목요일). 월드컵 경기는 한국 시간 */
const MONTHS=[{y:2006,m:5,first:1,days:31},{y:2006,m:6,first:4,days:30}];
const EVENTS={'5-1':'근로자의 날','5-5':'어린이날 (쉬는 날)','5-8':'어버이날 · 카네이션!','5-15':'스승의 날','5-30':'오늘','5-31':'지방선거일 (학교 쉬는 날)','6-1':'국어 받아쓰기 시험','6-6':'현충일 (쉬는 날)','6-9':'독일 월드컵 개막','6-13':'월드컵 토고전 밤 10시','6-19':'월드컵 프랑스전 새벽 4시','6-24':'월드컵 스위스전 새벽 4시'};
const SCENES={street:'동네 큰길',pcroom:'동네 PC방',stationery:'별빛문구완구',supermarket:'우리슈퍼',courtyard:'주택가의 작은 마당',lobby:'아파트 공동현관',hall:'아파트 2층 복도',rooftop:'공동주택 옥상',hidden_alley:'주택 사이 좁은 뒷골목',back_alley:'문구점 뒤 주택 골목',main_road:'상가와 학원이 있는 큰길',side_alley:'주택가 샛길',apartment_path:'아파트 안쪽 길',playground:'아파트 놀이터'};
const STREET=[[950,'동일초등학교 앞'],[1290,'담장길 · 은하분식'],[1690,'문방구가 있는 골목'],[2310,'주택가'],[3040,'큰길과 골목 경계'],[1e9,'아파트 단지 쪽']];
const INDOOR=new Set(['pcroom','stationery','supermarket','lobby','hall']);
const GAMES=[{id:'mole',name:'두더지 잡기',free:true},{id:'snake',name:'지렁이 게임',free:true},{id:'run',name:'점프 달리기',price:2000},{id:'ball',name:'숫자 야구',price:2000}];
const PRICE={sms:30,callPer10:18,ring:700,wall:500,theme:1000,color:300};
/* 메뉴 색 테마 (NATE 폰꾸미기에서 받음) */
const THEMES={blue:{name:'기본 파랑',title:['#3d82e0','#1546a0'],sel:['#ffae4a','#f07a10']},pink:{name:'딸기 우유',title:['#ff8ac0','#d6407a'],sel:['#ff9ad0','#e84d8a']},black:{name:'블랙 메탈',title:['#5a5f6a','#1a1d24'],sel:['#6ac8ff','#2a7ad8']},green:{name:'풀잎 초록',title:['#5ac06a','#2a7a3a'],sel:['#ffd34a','#e8a400']}};
const FREE_WALLS=['cat','sea','chick'];
const NOTE_KEYS={'1':'C','2':'D','3':'E','4':'F','5':'G','6':'A','7':'B','8':'C+'};
const LENS=[[.5,'8분'],[1,'4분'],[2,'2분']];

/* ---------- 메뉴 ---------- */
const APPS=[];
const BUILTIN=[['contacts','전화번호부','전화부','contacts'],['sms','문자','문자','sms'],['calls','통화 기록','통화기록','calls'],['camera','카메라','카메라','camera'],
 ['album','사진첩','사진첩','album'],['dmb','DMB 방송','DMB','dmb'],['nate','NATE','NATE','nate'],['games','게임','게임','game'],
 ['ring','벨소리','벨소리','ring'],['wall','배경 화면','배경화면','wall'],['melody','멜로디 작곡','작곡','melody'],['find','친구 찾기','친구찾기','gps'],
 ['cal','달력','달력','cal'],['calc','계산기','계산기','calc'],['memo','메모장','메모장','memo'],['set','설정','설정','set']];
for(const [id,name,short,icon] of BUILTIN)APPS.push({id,name,short,icon,builtin:true});
function registerApp(app){if(!app||!app.id||!app.name)throw Error('앱에는 id 와 name 이 있어야 해');const i=APPS.findIndex(a=>a.id===app.id);if(i>=0)APPS[i]=app;else APPS.push(app);return APPS.length}

/* ---------- 그리기 도구 ---------- */
function R(g,x,y,wd,ht,c){g.fillStyle=c;g.fillRect(x,y,wd,ht)}
function T(g,s,x,y,o={}){s=String(s);g.font=fnt(o.size||11,o.bold);g.textAlign=o.align||'left';g.textBaseline=o.base||'alphabetic';
 if(o.shadow){g.fillStyle=o.shadow;if(o.max)g.fillText(s,x+.8,y+.8,o.max);else g.fillText(s,x+.8,y+.8)}g.fillStyle=o.color||'#111';if(o.max)g.fillText(s,x,y,o.max);else g.fillText(s,x,y)}
function grad(g,y0,y1,a,b){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,a);gr.addColorStop(1,b);return gr}
function rr(g,x,y,wd,ht,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+wd-r,y);g.quadraticCurveTo(x+wd,y,x+wd,y+r);g.lineTo(x+wd,y+ht-r);g.quadraticCurveTo(x+wd,y+ht,x+wd-r,y+ht);g.lineTo(x+r,y+ht);g.quadraticCurveTo(x,y+ht,x,y+ht-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);g.closePath()}
function circ(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
function fit(g,s,maxW,size,bold){s=String(s);g.font=fnt(size,bold);if(g.measureText(s).width<=maxW)return s;while(s.length>1&&g.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…'}
function wrap(g,text,maxW,size,bold){g.font=fnt(size,bold);const out=[];for(const para of String(text).split('\n')){let line='';for(const ch of para){if(g.measureText(line+ch).width>maxW&&line){out.push(line);line=ch.trim()?ch:''}else line+=ch}out.push(line)}return out}
const ICON={
 contacts(g,x,y){R(g,x+4,y+2,14,18,'#2f6fd6');R(g,x+6,y+4,10,14,'#e9f1ff');for(let i=0;i<3;i++)R(g,x+8,y+7+i*3.5,6,1.4,'#2f6fd6');R(g,x+3,y+5,2,2,'#ffcf4a');R(g,x+3,y+10,2,2,'#ffcf4a');R(g,x+3,y+15,2,2,'#ffcf4a')},
 sms(g,x,y){R(g,x+2,y+5,18,13,'#ffd34a');g.strokeStyle='#a46a00';g.lineWidth=1.2;g.strokeRect(x+2.5,y+5.5,17,12);g.beginPath();g.moveTo(x+2.5,y+5.5);g.lineTo(x+11,y+12);g.lineTo(x+19.5,y+5.5);g.stroke()},
 calls(g,x,y){g.fillStyle='#2bb24c';g.beginPath();g.moveTo(x+4,y+6);g.quadraticCurveTo(x+6,y+18,x+16,y+19);g.lineTo(x+18,y+15);g.lineTo(x+14,y+13);g.lineTo(x+12,y+15);g.quadraticCurveTo(x+9,y+13,x+8,y+10);g.lineTo(x+10,y+8);g.lineTo(x+8,y+4);g.closePath();g.fill();g.strokeStyle='#e8402a';g.lineWidth=1.6;g.beginPath();g.moveTo(x+13,y+9);g.lineTo(x+19,y+3);g.moveTo(x+15,y+3);g.lineTo(x+19,y+3);g.lineTo(x+19,y+7);g.stroke()},
 camera(g,x,y){g.fillStyle='#3a4458';rr(g,x+1,y+6,20,13,3);g.fill();R(g,x+5,y+4,6,3,'#3a4458');circ(g,x+11,y+12.5,4.6,'#cfe3ff');circ(g,x+11,y+12.5,2.6,'#1f3a6a');R(g,x+16,y+8,3,2,'#ffd34a')},
 album(g,x,y){R(g,x+2,y+3,18,16,'#c98a4a');R(g,x+4,y+5,14,12,'#fff');R(g,x+5,y+6,12,8,'#7ac8ff');g.fillStyle='#3d9b48';g.beginPath();g.moveTo(x+5,y+14);g.lineTo(x+9,y+9);g.lineTo(x+13,y+14);g.fill();circ(g,x+14,y+8,1.6,'#ffe25a')},
 dmb(g,x,y){g.fillStyle='#2b2f3a';rr(g,x+1,y+5,20,14,2);g.fill();R(g,x+3,y+7,16,10,'#5ad2ff');R(g,x+3,y+13,16,4,'#2a7ad8');g.strokeStyle='#2b2f3a';g.lineWidth=1.2;g.beginPath();g.moveTo(x+7,y+5);g.lineTo(x+4,y+1);g.moveTo(x+15,y+5);g.lineTo(x+18,y+1);g.stroke()},
 ring(g,x,y){g.fillStyle='#d6407a';g.beginPath();g.ellipse(x+7,y+17,4,3,-.4,0,Math.PI*2);g.ellipse(x+16,y+15,4,3,-.4,0,Math.PI*2);g.fill();R(g,x+9.5,y+4,1.8,13,'#d6407a');R(g,x+18.3,y+2,1.8,13,'#d6407a');g.beginPath();g.moveTo(x+9.5,y+4);g.lineTo(x+20,y+1.5);g.lineTo(x+20,y+5);g.lineTo(x+9.5,y+7.5);g.fill()},
 wall(g,x,y){R(g,x+2,y+4,18,15,'#7ac8ff');g.fillStyle='#3d9b48';g.beginPath();g.moveTo(x+2,y+19);g.lineTo(x+9,y+10);g.lineTo(x+14,y+15);g.lineTo(x+16,y+13);g.lineTo(x+20,y+19);g.fill();circ(g,x+15,y+8,2.5,'#ffe25a');g.strokeStyle='#335';g.lineWidth=1;g.strokeRect(x+2.5,y+4.5,17,14)},
 game(g,x,y){g.fillStyle='#6a4ad8';rr(g,x+1,y+6,20,11,5);g.fill();R(g,x+5,y+10,6,2,'#fff');R(g,x+7,y+8,2,6,'#fff');circ(g,x+15,y+10,1.6,'#ffd34a');circ(g,x+18,y+13,1.6,'#ffd34a')},
 melody(g,x,y){for(let i=0;i<4;i++)R(g,x+1,y+5+i*4,20,.8,'#8a94a8');circ(g,x+7,y+16,2.6,'#2f6fd6');R(g,x+9,y+5,1.4,11,'#2f6fd6');circ(g,x+15,y+13,2.6,'#2f6fd6');R(g,x+17,y+2,1.4,11,'#2f6fd6');R(g,x+9,y+5,9.4,1.6,'#2f6fd6')},
 nate(g,x,y){circ(g,x+11,y+11,9,'#ff7a12');T(g,'N',x+11,y+15.5,{size:12,bold:true,color:'#fff',align:'center'})},
 gps(g,x,y){g.fillStyle='#e8402a';g.beginPath();g.arc(x+11,y+8,6,Math.PI,0);g.lineTo(x+11,y+20);g.closePath();g.fill();circ(g,x+11,y+8,2.4,'#fff');circ(g,x+4,y+16,2,'#2bb24c');circ(g,x+18,y+15,2,'#2f6fd6')},
 cal(g,x,y){R(g,x+2,y+4,18,16,'#fff');R(g,x+2,y+4,18,5,'#e8402a');g.strokeStyle='#8090ac';g.lineWidth=.8;g.strokeRect(x+2.5,y+4.5,17,15);for(let i=0;i<3;i++)for(let j=0;j<4;j++)R(g,x+4+j*4,y+11+i*3,2,1.6,'#5a6a86');R(g,x+6,y+2,1.6,4,'#5a6a86');R(g,x+14,y+2,1.6,4,'#5a6a86')},
 calc(g,x,y){g.fillStyle='#4a5468';rr(g,x+4,y+1,14,20,2);g.fill();R(g,x+6,y+3,10,5,'#b8e8a8');for(let i=0;i<3;i++)for(let j=0;j<3;j++)R(g,x+6+j*3.6,y+10+i*3.6,2.6,2.6,j===2&&i===2?'#ff8a3a':'#e9eef8')},
 memo(g,x,y){R(g,x+4,y+2,14,18,'#fff6b0');g.strokeStyle='#b8a040';g.lineWidth=.8;g.strokeRect(x+4.5,y+2.5,13,17);for(let i=0;i<4;i++)R(g,x+6,y+6+i*3.4,10,.8,'#b8a040');g.fillStyle='#e8402a';g.beginPath();g.moveTo(x+14,y+16);g.lineTo(x+20,y+8);g.lineTo(x+21,y+9);g.lineTo(x+15,y+17);g.fill()},
 set(g,x,y){for(let i=0;i<8;i++){const a=i*Math.PI/4;R(g,x+11+Math.cos(a)*7-1.6,y+11+Math.sin(a)*7-1.6,3.2,3.2,'#7b8494')}circ(g,x+11,y+11,6.5,'#7b8494');circ(g,x+11,y+11,2.6,'#e9eef8')},
 app(g,x,y){g.fillStyle='#3a9a8a';rr(g,x+3,y+3,16,16,4);g.fill();T(g,'+',x+11,y+16,{size:13,bold:true,color:'#fff',align:'center'})}};

function fakeNum(id){let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return ['011','016','017','019'][h%4]+'-'+(1000+h%9000)+'-'+(1000+Math.floor(h/9000)%9000)}
function placeOf(p){if(!p)return'동네 어딘가';if(p.playground)return'아파트 놀이터';if(p.scene==='street'){const a=STREET.find(([x])=>p.x<x);return a?a[1]:'동네 큰길'}return SCENES[p.scene]||'동네 어딘가'}

function create(host){
 const now=()=>host.now();
 /* ---------- 저장 ---------- */
 const D={v:2,wall:'cat',ring:'r4',inbox:SEED_INBOX.map(m=>({...m})),sent:[],calls:SEED_CALLS.map(c=>({...c})),best:{mole:0,snake:0,run:0,ball:0},n:3,bill:{sms:0,sec:0,data:0,info:0},momWarned:false,got:{},mel:[],memos:[],alert:'ring',theme:'blue',coloring:null,emoBox:[],bm:[],payLog:[]};
 try{const s=JSON.parse(w.localStorage?.getItem(STORE)||'null');if(s&&typeof s==='object'){for(const k of ['wall','ring','alert','theme','coloring'])if(typeof s[k]==='string')D[k]=s[k];for(const k of ['inbox','sent','calls','mel','memos','emoBox','bm','payLog'])if(Array.isArray(s[k]))D[k]=s[k].slice(0,30);
  for(const k of ['best','bill','got'])if(s[k]&&typeof s[k]==='object')Object.assign(D[k],s[k]);if(Number.isFinite(s.n))D.n=s.n;D.momWarned=!!s.momWarned}}catch(_){}
 if(!['ring','vib','mute'].includes(D.alert))D.alert='ring';
 const save=()=>{try{w.localStorage?.setItem(STORE,JSON.stringify(D))}catch(_){}};
 let PH=[];try{const p=JSON.parse(w.localStorage?.getItem(PSTORE)||'[]');if(Array.isArray(p))PH=p.filter(x=>x&&typeof x.url==='string').slice(0,12)}catch(_){}
 const savePhotos=()=>{try{w.localStorage?.setItem(PSTORE,JSON.stringify(PH.filter(p=>p.url).map(({id,url,time,place})=>({id,url,time,place}))))}catch(_){host.toast?.('사진첩 저장 공간이 꽉 찼어요')}};
 const unread=()=>D.inbox.filter(m=>!m.read).length;
 const syncLabel=()=>{const n=unread();host.label(n?'새 문자 '+n:'애니콜')};
 const nowStr=()=>{const c=host.clock();return c.hh+':'+c.mm};
 const pcGot=()=>{try{return JSON.parse(w.localStorage?.getItem('2006_xp_desktop_v1')||'{}')?.web?.phone?.got||{}}catch(_){return{}}};
 const has=id=>FREE_RINGS.includes(id)||!!D.got[id]||!!pcGot()[id]||GAMES.some(gm=>gm.id===id&&gm.free);
 const melRing=m=>['mel:'+m.id,m.name,'직접 작곡','16화음',m.bpm||120,m.notes.map(([n,d])=>n+':'+d).join(' ')||'R:1','R:1',0];
 const allRings=()=>[...(w.WebTown?.RINGS?.length?w.WebTown.RINGS:FALLBACK_RINGS),...D.mel.map(melRing)];
 const rings=()=>allRings().filter(r=>has(r[0])||r[0].startsWith('mel:'));
 const ringById=id=>allRings().find(r=>r[0]===id)||allRings()[0];
 const allWalls=()=>(w.WebTown?.PHONE_WALLS?.length?w.WebTown.PHONE_WALLS:[['cat','별밤 고양이']]);
 const walls=()=>[...allWalls().filter(x=>FREE_WALLS.includes(x[0])||D.got['w:'+x[0]]||D.wall===x[0]),...PH.map((p,i)=>['ph:'+p.id,'내 사진 '+(i+1)])];
 const billTotal=()=>D.bill.sms*PRICE.sms+Math.ceil(D.bill.sec/10)*PRICE.callPer10+D.bill.data+D.bill.info;
 function charge(kind,v){D.bill[kind]=(D.bill[kind]||0)+v;save();if(billTotal()>=10000&&!D.momWarned){D.momWarned=true;save();later(()=>receive({from:'엄마',fromId:'mom',text:'이번 달 휴대폰 요금 만 원 넘었다!! NATE 또 했지? 한 번만 더 그러면 휴대폰 압수야'}),3000)}}
 const later=(f,ms)=>(w.setTimeout||setTimeout)(f,ms);

 /* ---------- 같은 방 친구 (함께 걷기 방) ---------- */
 const NET={ready:()=>!!w.A25NET?.state?.ready,me:()=>w.A25NET?.state?.id||'',peers:()=>{try{return w.A25NET?.peers||[]}catch(_){return[]}},
  send(op,o){if(!NET.ready())return false;w.A25NET.send({type:'phone',op,...o});return true}};
 const friends=()=>NET.peers().map(p=>({id:'peer:'+p.id,peer:p.id,n:p.name||'친구',num:fakeNum(p.id),friend:true,p}));
 const book=()=>[...friends(),...BOOK];
 const findNum=num=>{const c=String(num).replace(/\D/g,'');return book().find(p=>p.num.replace(/\D/g,'')===c)||null};
 const peerAlive=id=>NET.peers().some(p=>p.id===id);

 /* ---------- 화면 상태 ---------- */
 const S={scr:'idle',arg:null,sel:0,stack:[],dial:'',pop:null,confirm:null,blink:-1,dirty:true,tune:null,preview:0,call:null,ed:null,hinted:false,buzzAt:0};
 const appOf=id=>APPS.find(a=>a.id===id);
 const cur=()=>SCR[S.scr]||appOf(S.scr);
 function afterNav(){if(S.scr!=='camera')host.cameraFrame?.(null);const sc=cur();if(sc?.typing&&S.ed)host.typing({value:S.ed.text(),placeholder:sc.typing(),max:S.ed.max,get:()=>S.ed?S.ed.text():'',onInput:v=>{if(!S.ed)return;S.ed.setText(v);dirty()},onEnter:()=>{key('ok')}});else host.typing(null)}
 function go(scr,arg){S.stack.push({scr:S.scr,arg:S.arg,sel:S.sel,ed:S.ed});S.scr=scr;S.arg=arg==null?null:arg;S.sel=0;S.ed=null;enter();afterNav();dirty()}
 function replace(scr,arg){S.scr=scr;S.arg=arg==null?null:arg;S.sel=0;S.ed=null;enter();afterNav();dirty()}
 function back(){stopTune();S.confirm=null;if(!S.stack.length){home();return}const p=S.stack.pop();S.scr=p.scr;S.arg=p.arg;S.sel=p.sel;S.ed=p.ed||null;afterNav();dirty()}
 function home(){stopTune();S.stack=[];S.scr='idle';S.arg=null;S.sel=0;S.ed=null;S.confirm=null;afterNav();dirty()}
 function enter(){const sc=cur();sc?.enter?.call(sc,api)}
 function dirty(){S.dirty=true;host.invalidate()}
 function pop(text,ms=1600,modal=false){S.pop={text,until:now()+ms,modal};dirty()}
 function ask(text,yes){S.confirm={text,yes};dirty()}
 function stopTune(){if(S.tune){S.tune=null;host.stopTune()}S.preview=0}
 function playRing(r){stopTune();if(!r)return;S.tune=r[0];const res=host.playTune(r,()=>{if(S.tune===r[0]){S.tune=null;dirty()}});if(res?.silent&&res.why==='off'&&host.shown)pop('효과음이 꺼져 있어\n소리가 안 나요');dirty()}
 function notifyAlert(kind,text){if(D.alert==='ring'){if(kind==='sms'&&!S.call)playRing(ringById('r9'))}else if(D.alert==='vib')host.buzz();host.alert({kind,text})}
 function editorFor(max){S.ed=Editor({max,now});return S.ed}
 function edChanged(){if(S.ed)host.typingValue(S.ed.text())}

 /* ---------- 공통 틀 ---------- */
 function status(g){g.fillStyle=grad(g,0,TOP,'#33435f','#0d1524');g.fillRect(0,0,W,TOP);
  for(let i=0;i<5;i++){const hh=2+i*1.7;R(g,3+i*3,10-hh,2,hh,'#e8f0ff')}
  let x=21;if(unread()){R(g,x,3.5,9,6,'#ffd34a');g.strokeStyle='#8a5a00';g.lineWidth=.8;g.beginPath();g.moveTo(x,3.5);g.lineTo(x+4.5,7);g.lineTo(x+9,3.5);g.stroke();x+=12}
  if(D.alert==='vib'){g.strokeStyle='#e8f0ff';g.lineWidth=1;g.strokeRect(x+2.5,3,4,7);g.beginPath();g.moveTo(x+.5,4);g.lineTo(x+.5,9);g.moveTo(x+8.5,4);g.lineTo(x+8.5,9);g.stroke();x+=12}
  else if(D.alert==='mute'||!host.audioOn()||!host.prefs.keyTone){R(g,x,5,2.5,3,'#e8f0ff');g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(x+2.5,5);g.lineTo(x+5.5,2.5);g.lineTo(x+5.5,10.5);g.lineTo(x+2.5,8);g.fill();g.strokeStyle='#ff6a5a';g.lineWidth=1;g.beginPath();g.moveTo(x+7,4);g.lineTo(x+10,9);g.moveTo(x+10,4);g.lineTo(x+7,9);g.stroke();x+=12}
  if(NET.ready()){T(g,'방',x+1,9.5,{size:7.5,bold:true,color:'#7dff8a'});x+=10}
  if(S.scr!=='idle')T(g,nowStr(),W/2+8,9.5,{size:8.5,bold:true,color:'#e8f0ff',align:'center'});
  g.strokeStyle='#e8f0ff';g.lineWidth=.9;g.strokeRect(W-17.5,3,13,6.5);R(g,W-4.5,4.8,1.5,3,'#e8f0ff');for(let i=0;i<3;i++)R(g,W-16+i*4,4.5,3,3.5,'#7dff8a')}
 function soft(g,l,c,r){g.fillStyle=grad(g,H-BOT,H,'#3a4252','#0f131b');g.fillRect(0,H-BOT,W,BOT);R(g,0,H-BOT,W,.8,'#596277');
  if(l)T(g,l,5,H-4.6,{size:10,bold:true,color:'#fff'});if(c)T(g,c,W/2,H-4.6,{size:10,bold:true,color:'#ffd27a',align:'center'});if(r)T(g,r,W-5,H-4.6,{size:10,bold:true,color:'#fff',align:'right'})}
 const TH=()=>THEMES[D.theme]||THEMES.blue;
 function title(g,t,right,col){col=col||TH().title;g.fillStyle=grad(g,TOP,TOP+TITLE,col[0],col[1]);g.fillRect(0,TOP,W,TITLE);R(g,0,TOP+TITLE-1,W,1,'#0b2c6a');T(g,t,W/2,TOP+12,{size:11,bold:true,color:'#fff',align:'center',max:W-(right?56:10)});if(right)T(g,right,W-4,TOP+11.5,{size:8.5,color:'#d8e8ff',align:'right'})}
 function body(g,c){R(g,0,TOP+TITLE,W,H-TOP-TITLE-BOT,c||'#f2f6fc')}
 function list(g,items,sel,y0=TOP+TITLE){const rowH=19,n=Math.max(1,Math.floor((H-BOT-y0)/rowH)),first=sel<n?0:sel-n+1;R(g,0,y0,W,H-BOT-y0,'#f2f6fc');
  if(!items.length){T(g,'비어 있어요',W/2,y0+30,{size:10,color:'#7a8494',align:'center'});return}
  for(let i=first;i<Math.min(items.length,first+n);i++){const it=items[i],y=y0+(i-first)*rowH,on=i===sel;
   if(on){g.fillStyle=grad(g,y,y+rowH,TH().sel[0],TH().sel[1]);g.fillRect(0,y,W,rowH)}else R(g,0,y,W,rowH,i%2?'#e8eff9':'#fbfdff');
   R(g,0,y+rowH-.6,W,.6,'#cdd8e8');let x=4;
   if(it.num!==false&&items.length<=12){if(i<10)T(g,(i<9?String(i+1):'0')+'.',x,y+13.2,{size:9,bold:true,color:on?'#fff':'#5a6a86'});x=15}
   if(it.mark){T(g,it.mark,x,y+13.2,{size:10,bold:true,color:on?'#fff':(it.markColor||'#2f6fd6')});x+=11}
   g.font=fnt(8.5);const sw=it.sub?Math.min(56,g.measureText(it.sub).width+8):6;
   T(g,fit(g,it.label,W-x-sw,10.5,on||it.bold),x,y+13.2,{size:10.5,bold:on||it.bold,color:on?'#fff':(it.dim?'#8a94a8':'#16202e')});
   if(it.sub)T(g,it.sub,W-4,y+12.8,{size:8.5,color:on?'#fff3e0':'#6b778a',align:'right'})}
  if(items.length>n){const th=(H-BOT-y0)*n/items.length,ty=y0+(H-BOT-y0-th)*first/Math.max(1,items.length-n);R(g,W-2.5,y0,2.5,H-BOT-y0,'#c9d4e6');R(g,W-2.5,ty,2.5,th,'#4a7fd0')}}
 function listKey(id,items,act){const n=items.length;if(!n){if(id==='clr'||id==='left')back();return true}
  if(id==='up'){S.sel=(S.sel-1+n)%n;return true}if(id==='down'){S.sel=(S.sel+1)%n;return true}
  if(id==='ok'||id==='nate'){act(items[S.sel],S.sel);return true}if(id==='clr'||id==='left'){back();return true}
  const d=DIG.indexOf(id);if(d>=0&&d<9&&n<=12&&d<n){S.sel=d;act(items[d],d);return true}if(id==='0'&&n>=10&&n<=12){S.sel=9;act(items[9],9);return true}return false}
 function popup(g){if(!S.pop)return;const lines=wrap(g,S.pop.text,W-34,10.5,true),hh=lines.length*14+16,y=(H-hh)/2;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,W,H);g.fillStyle='#fffdf4';rr(g,10,y,W-20,hh,5);g.fill();g.strokeStyle='#f07a10';g.lineWidth=1.6;g.stroke();
  lines.forEach((l,i)=>T(g,l,W/2,y+17+i*14,{size:10.5,bold:true,color:'#1d2633',align:'center'}))}
 function confirmBox(g){if(!S.confirm)return;const lines=wrap(g,S.confirm.text,W-30,10,true),hh=lines.length*13+34,y=(H-hh)/2;
  g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,W,H);g.fillStyle='#f4f8ff';rr(g,8,y,W-16,hh,5);g.fill();g.strokeStyle='#2f6fd6';g.lineWidth=1.6;g.stroke();
  lines.forEach((l,i)=>T(g,l,W/2,y+16+i*13,{size:10,bold:true,color:'#1d2633',align:'center'}));T(g,'확인: 예   ·   취소: 아니요',W/2,y+hh-8,{size:8.5,bold:true,color:'#2f6fd6',align:'center'})}
 function photoImg(id){if(!host.makeImage)return null;const p=PH.find(x=>x.id===id)||D.inbox.find(m=>m.id===id&&m.photo)&&{id,url:D.inbox.find(m=>m.id===id).photo};if(!p)return null;
  if(p.cv)return p.cv;IMG.has(id)||IMG.set(id,host.makeImage(p.url,()=>dirty()));const im=IMG.get(id);return im&&im.complete&&im.naturalWidth?im:null}
 const IMG=new Map();
 function wallpaper(g,kind,y0,hh){if(String(kind).startsWith('ph:')){const im=photoImg(kind.slice(3));if(im){R(g,0,y0,W,hh,'#000');const s=Math.max(W/(im.width||120),hh/(im.height||90));const dw=(im.width||120)*s,dh=(im.height||90)*s;g.drawImage(im,(W-dw)/2,y0+(hh-dh)/2,dw,dh);return}}
  const T2=w.WebTown;if(T2?.drawWall&&!String(kind).startsWith('ph:')){g.save();g.translate(0,y0);try{T2.drawWall(g,kind,W,hh)}catch(_){}g.restore();return}g.fillStyle=grad(g,y0,y0+hh,'#3a7ad8','#a8d8ff');g.fillRect(0,y0,W,hh)}
 /* 글 쓰는 칸 (숫자판 입력과 자판 입력 공용) */
 function drawEditor(g,ed,y0,y1,t,label){R(g,0,y0,W,y1-y0,'#fffef6');R(g,0,y0,W,13,'#e9eef8');
  T(g,label||'',4,y0+10,{size:8.5,bold:true,color:'#2f4a7a',max:W-70});
  const mc={ko:'#e8402a',en:'#2f6fd6',num:'#2bb24c'}[ed.mode];g.fillStyle=mc;rr(g,W-58,y0+2,24,10,2);g.fill();T(g,ed.modeName(),W-46,y0+10,{size:8,bold:true,color:'#fff',align:'center'});
  T(g,ed.bytes()+'/'+ed.max,W-4,y0+10,{size:8,color:ed.bytes()>=ed.max?'#e8402a':'#6b778a',align:'right'});
  const txt=ed.text(),pend=ed.pending(t);const lines=wrap(g,txt,W-12,11,false),vis=Math.max(1,Math.floor((y1-y0-18)/14)),shown=lines.slice(-vis);
  shown.forEach((l,i)=>T(g,l,5,y0+26+i*14,{size:11,color:'#1b2433'}));
  const last=shown[shown.length-1]||'';g.font=fnt(11);const cx=5+g.measureText(last).width,cy=y0+16+(shown.length-1)*14;
  if(pend&&last){const lw=g.measureText(last.slice(-1)).width;g.strokeStyle='#f07a10';g.lineWidth=1;g.strokeRect(cx-lw-.5,cy,lw+1,13)}
  if(Math.floor(t/500)%2===0)R(g,cx+.5,cy+1,1.2,12,'#1b2433')}
 function edHelp(g,ed,y){const s=ed.mode==='ko'?'1ㅣ *ㆍ 0ㅡ  #띄움 ▶다음':ed.mode==='en'?'2abc~9wxyz 1.,?! #띄움':'숫자 그대로 · ▶띄움';T(g,s,W/2,y,{size:7.5,color:'#6b778a',align:'center'})}

 /* ---------- 전화 ---------- */
 function call(target){stopTune();if(S.call&&S.call.phase!=='ended')return;let who=typeof target==='string'?(findNum(target)||{n:target,num:target,unknown:true}):target;
  const c={who,phase:'dial',t0:now(),lines:[],talk0:0,result:null,ring:0};const digits=String(who.num||'').replace(/\D/g,'');
  if(who.peer){if(!NET.ready()||!peerAlive(who.peer)){pop('같은 방에 있어야\n걸 수 있어요');return}c.cid=Math.random().toString(36).slice(2,10);c.real=true;NET.send('ring',{to:who.peer,call:c.cid})}
  else if(who.unknown){if(/^(112|119|113|122)$/.test(digits))c.result={msg:'긴급 전화는 장난으로 걸면 안 돼요!\n(게임 속 휴대폰이라 연결되지 않아요)',fast:true};
   else if(digits==='114')c.result={msg:'안내 114입니다~\n동네 가게 번호는 전화번호부에 있어요',fast:false};
   else if(digits.length<7)c.result={msg:'번호를 확인하고\n다시 걸어 주세요',fast:true};else c.result={msg:'지금 거신 번호는\n없는 번호입니다.\n확인하시고 다시 걸어 주십시오.',fast:false}}
  else if(who.voice)c.result={msg:'지금은 전화를 받을 수 없어\n소리샘으로 연결됩니다.\n삐 소리가 나면 말씀하세요.',voice:true};
  else if(who.noAnswer)c.result={msg:'전화를 받지 않습니다.\n(집에 아무도 없나 봐)',late:true};
  D.calls.unshift({t:'out',n:who.n,num:who.num,time:nowStr(),peer:who.peer||null});D.calls=D.calls.slice(0,30);save();
  S.call=c;S.dial='';S.stack=[];S.scr='call';S.sel=0;S.ed=null;afterNav();dirty()}
 function endCall(msg){const c=S.call;if(!c||c.phase==='ended')return;stopTune();if(c.talk0)charge('sec',Math.round((now()-c.talk0)/1000));c.phase='ended';c.endAt=now()+1400;c.endMsg=msg||'통화 종료';S.ed=null;afterNav();dirty()}
 function hang(msg){const c=S.call;if(!c)return;if(c.real&&c.phase!=='ended')NET.send('hang',{to:c.who.peer,call:c.cid});endCall(msg)}
 function incoming(m){
  if(host.powered===false){NET.send('decline',{to:m.from,call:m.call});return}
  const who={n:m.name||'친구',num:fakeNum(m.from),peer:m.from,friend:true};
  if(S.call&&S.call.phase!=='ended'){NET.send('busy',{to:m.from,call:m.call});D.calls.unshift({t:'miss',n:who.n,num:who.num,time:nowStr(),peer:m.from});save();return}
  if(D.coloring&&allRings().some(r=>r[0]===D.coloring))NET.send('tone',{to:m.from,call:m.call,ring:D.coloring});
  S.call={who,cid:m.call,real:true,incoming:true,phase:'ring',t0:now(),lines:[],talk0:0};S.dial='';S.stack=[];S.scr='call';S.sel=0;S.ed=null;afterNav();
  host.alert({kind:'call',text:who.n+'에게서 전화가 왔어요'});dirty()}
 function answer(){const c=S.call;if(!c||c.phase!=='ring')return;stopTune();NET.send('answer',{to:c.who.peer,call:c.cid});c.phase='live';c.talk0=now();c.lines.push({sys:1,text:'통화가 연결됐어요'});
  D.calls.unshift({t:'in',n:c.who.n,num:c.who.num,time:nowStr(),peer:c.who.peer});save();editorFor(70);afterNav();dirty()}
 function decline(missed){const c=S.call;if(!c||c.phase!=='ring')return;NET.send('decline',{to:c.who.peer,call:c.cid});D.calls.unshift({t:'miss',n:c.who.n,num:c.who.num,time:nowStr(),peer:c.who.peer});save();endCall(missed?'부재중 전화':'전화를 거절했어요')}
 function sayLine(){const c=S.call,ed=S.ed;if(!c||c.phase!=='live'||!ed)return;const text=ed.text().trim();if(!text)return;NET.send('talk',{to:c.who.peer,call:c.cid,text});c.lines.push({me:1,text});ed.clear();edChanged();dirty()}

 /* ---------- 문자 ---------- */
 function sendSms(to,text,photo){const id='m'+(++D.n);D.sent.unshift({id,to:to.n,toId:to.id,text,time:nowStr(),photo:photo?1:0});D.sent=D.sent.slice(0,30);charge('sms',1);save();
  if(to.peer){if(!NET.send(photo?'photo':'sms',photo?{to:to.peer,photo,text}:{to:to.peer,text}))return 'offline';return 'net'}
  const rules=(w.WebTown?.CONTACTS||[]).find(c=>c[0]===to.id);let reply=null;if(rules)reply=(rules[2].find(([re])=>re.test(text))||[null,rules[3]])[1];else if(OWN_REPLY[to.id])reply=OWN_REPLY[to.id];
  if(reply&&to.id!=='home')later(()=>receive({from:to.n,fromId:to.id,text:reply}),2600+Math.round(Math.random()*1800));return 'local'}
 function receive(m){D.inbox.unshift({id:'r'+(++D.n),from:m.from,fromId:m.fromId||null,fromPeer:m.fromPeer||null,text:m.text,photo:m.photo||null,time:nowStr(),read:false});D.inbox=D.inbox.slice(0,30);save();syncLabel();
  if(host.powered===false)return;
  notifyAlert('sms',(m.photo?'포토 메일 · ':'문자 · ')+m.from);if(host.shown&&!S.call)pop((m.photo?'포토 메일 왔숑~\n':'문자 왔숑~\n')+m.from,2200);dirty()}
 function contactOf(m){if(m.fromPeer){const f=friends().find(x=>x.peer===m.fromPeer);return f||null}return BOOK.find(b=>b.id===m.fromId)||null}

 /* ---------- 네트워크 받기 ---------- */
 function onNet(m){if(!m||typeof m!=='object')return;const c=S.call;
  if((m.type==='left'&&c&&c.real&&c.who.peer===m.id)||(m.type==='network_close'&&c&&c.real)){endCall('연결이 끊겼어요');return}
  if(m.type!=='phone')return;const mine=c&&c.real&&c.cid===m.call&&c.who.peer===m.from&&c.phase!=='ended';
  if(m.op==='sms')receive({from:m.name||'친구',fromPeer:m.from,text:m.text||''});
  else if(m.op==='photo')receive({from:m.name||'친구',fromPeer:m.from,text:m.text||'(사진)',photo:typeof m.photo==='string'?m.photo:null});
  else if(m.op==='ring')incoming(m);
  else if(m.op==='tone'&&mine&&c.phase==='dial'&&typeof m.ring==='string'&&allRings().some(r=>r[0]===m.ring)){c.tone=m.ring;c.ring=0}
  else if(m.op==='answer'&&mine&&c.phase==='dial'){stopTune();c.phase='live';c.talk0=now();c.lines.push({sys:1,text:'통화가 연결됐어요'});editorFor(70);afterNav()}
  else if(m.op==='decline'&&mine)endCall('상대방이 받지 않아요');
  else if(m.op==='busy'&&mine)endCall('상대방이 통화 중이에요');
  else if(m.op==='hang'&&mine)endCall('상대방이 전화를 끊었어요');
  else if(m.op==='talk'&&mine&&c.phase==='live'){c.lines.push({me:0,text:String(m.text||'')});host.beep([1320],40,.04,'sine')}
  else if(m.op==='sent'&&(m.for==='sms'||m.for==='photo'))S.ack={ok:true,at:now()};
  else if(m.op==='error'){if(m.for==='sms'||m.for==='photo')S.ack={ok:false,msg:m.message,at:now()};else if(m.for==='ring'&&c&&c.real)endCall(m.message||'연결할 수 없어요');else pop(m.message||'보내지 못했어요')}
  dirty()}
 const unsub=w.A25NET?.subscribe?.(onNet);

 /* ---------- 화면들 ---------- */
 const SCR={};
 SCR.idle={draw(g,t){wallpaper(g,D.wall,TOP,H-TOP-BOT);status(g);const c=host.clock(),blink=Math.floor(t/600)%2===0;
   T(g,c.hh+(blink?':':' ')+c.mm,W/2,52,{size:31,bold:true,color:'#fff',align:'center',shadow:'rgba(0,0,0,.6)'});
   T(g,c.date,W/2,67,{size:10,bold:true,color:'#fff',align:'center',shadow:'rgba(0,0,0,.6)'});T(g,'독일 월드컵 D-10',W/2,80,{size:8.5,bold:true,color:'#ffe08a',align:'center',shadow:'rgba(0,0,0,.6)'});
   const n=unread();if(n&&!S.dial){g.fillStyle='rgba(255,255,255,.88)';rr(g,22,86,W-44,17,4);g.fill();ICON.sms(g,25,83.5);T(g,'새 문자 '+n+'통',W/2+9,98.5,{size:9.5,bold:true,color:'#1d2633',align:'center'})}
   if(S.dial){const y=H-BOT-48;g.fillStyle='rgba(255,255,255,.93)';g.fillRect(0,y,W,48);R(g,0,y,W,1,'#9fb4d6');T(g,'번호 입력',5,y+11,{size:8.5,color:'#4a5a76'});
    const s=S.dial,size=s.length>11?16:s.length>8?19:22;T(g,s,W-6,y+39,{size,bold:true,color:'#0d1524',align:'right',max:W-12})}
   soft(g,'메뉴',S.dial?'':'NATE',S.dial?'통화':'문자함')},
  key(id){if(DIG.includes(id)){if(S.dial.length<16)S.dial+=id;if(S.dial==='*#06#'){S.dial='';pop('애니콜 SCH-A99\n2006년 5월 출고\n버전 A99',2600)}return true}
   if(id==='clr'){if(S.dial)S.dial=S.dial.slice(0,-1);return true}if(id==='end'){S.dial='';return true}
   if(id==='send'){if(S.dial)call(S.dial);else go('calls');return true}if(id==='ok'){if(S.dial)call(S.dial);else go('inbox');return true}
   if(id==='menu'){S.dial='';go('menu');return true}if(id==='nate'){const code=S.dial;S.dial='';go('nate',code||null);return true}if(id==='up'){go('ring','music');return true}if(id==='down'){go('find');return true}
   if(id==='left'||id==='right'){const ws=walls(),i=ws.findIndex(x=>x[0]===D.wall);D.wall=ws[(Math.max(0,i)+(id==='left'?-1:1)+ws.length)%ws.length][0];save();return true}return false}};

 SCR.menu={draw(g){R(g,0,TOP,W,H-TOP,'#eef3fb');status(g);const a=APPS[S.sel];title(g,a?a.name:'메뉴');
   const cols=4,vis=4,rows=Math.ceil(APPS.length/cols),ch=(H-TOP-TITLE-BOT)/vis,cw=W/cols,firstRow=clamp(Math.floor(S.sel/cols)-vis+1,0,Math.max(0,rows-vis));
   for(let i=firstRow*cols;i<Math.min(APPS.length,(firstRow+vis)*cols);i++){const x=(i%cols)*cw,y=TOP+TITLE+(Math.floor(i/cols)-firstRow)*ch,on=i===S.sel;
    if(on){g.fillStyle=grad(g,y+1,y+ch-1,TH().sel[0],TH().sel[1]);rr(g,x+1.5,y+1,cw-3,ch-2,5);g.fill()}
    (ICON[APPS[i].icon]||ICON.app)(g,x+cw/2-11,y+1.5);T(g,APPS[i].short||APPS[i].name,x+cw/2,y+ch-3,{size:8,bold:on,color:on?'#fff':'#26324a',align:'center',max:cw-2});
    if(i<10)T(g,i<9?String(i+1):'0',x+3,y+8,{size:7,bold:true,color:on?'#fff':'#8090ac'})}
   if(rows>vis){R(g,W-2,TOP+TITLE,2,H-TOP-TITLE-BOT,'#c9d4e6');R(g,W-2,TOP+TITLE+(H-TOP-TITLE-BOT)*firstRow/rows,2,(H-TOP-TITLE-BOT)*vis/rows,'#4a7fd0')}
   soft(g,'','선택','')},
  key(id){const n=APPS.length,cols=4;if(id==='up'){S.sel=(S.sel-cols+Math.ceil(n/cols)*cols)%(Math.ceil(n/cols)*cols);if(S.sel>=n)S.sel=n-1;return true}if(id==='down'){S.sel=S.sel+cols>=n?S.sel%cols:S.sel+cols;return true}
   if(id==='left'){S.sel=(S.sel-1+n)%n;return true}if(id==='right'){S.sel=(S.sel+1)%n;return true}
   if(id==='ok'||id==='nate'){openApp(APPS[S.sel]);return true}if(id==='clr'||id==='menu'){back();return true}
   const d=DIG.indexOf(id);if(d>=0&&d<9&&d<n){S.sel=d;openApp(APPS[d]);return true}if(id==='0'&&n>=10){S.sel=9;openApp(APPS[9]);return true}return false}};
 function openApp(a){if(!a)return;if(a.open)a.open(api);else go(a.id)}

 /* 전화번호부: 같은 방 친구가 맨 위 */
 SCR.contacts={items(){return book().map(p=>({label:p.n,sub:p.friend?'같은 방':p.num.slice(-4),mark:p.friend?'●':'',markColor:'#2bb24c',num:false,p}))},
  draw(g){status(g);const f=friends().length;title(g,'전화번호부',f?'친구 '+f:book().length+'명');list(g,this.items(),S.sel);soft(g,'문자','선택','통화')},
  key(id){const it=this.items();if(id==='send'){if(it[S.sel])call(it[S.sel].p);return true}if(id==='menu'){if(it[S.sel])go('compose',{to:it[S.sel].p});return true}
   return listKey(id,it,x=>go('person',x.p))}};
 SCR.person={draw(g){const p=S.arg;status(g);title(g,p.n);body(g);ICON.contacts(g,W/2-11,TOP+TITLE+6);
   T(g,p.n,W/2,TOP+TITLE+42,{size:13,bold:true,color:'#16202e',align:'center'});T(g,p.num,W/2,TOP+TITLE+56,{size:10.5,color:'#2f4a7a',align:'center'});
   if(p.friend)T(g,'같은 방 친구 · '+placeOf(NET.peers().find(x=>x.id===p.peer)),W/2,TOP+TITLE+69,{size:8.5,color:'#1f8a3a',align:'center',max:W-8});
   list(g,this.items(),S.sel,TOP+TITLE+74);soft(g,'','선택','통화')},
  items(){return[{label:'전화 걸기',mark:'☎'},{label:'문자 보내기',mark:'✉'}]},
  key(id){const p=S.arg;if(id==='send'){call(p);return true}return listKey(id,this.items(),(x,i)=>i===0?call(p):go('compose',{to:p}))}};

 SCR.sms={items(){return[{label:'받은 문자함',sub:unread()?'새 '+unread():D.inbox.length+'통'},{label:'문자 쓰기'},{label:'보낸 문자함',sub:D.sent.length+'통'},{label:'상용구 보기'}]},
  draw(g){status(g);title(g,'문자');list(g,this.items(),S.sel);soft(g,'','선택','')},
  key(id){return listKey(id,this.items(),(x,i)=>i===0?go('inbox'):i===1?go('compose',{}):i===2?go('outbox'):go('phrases',{view:true}))}};
 SCR.inbox={items(){return D.inbox.map(m=>({label:m.from+'  '+(m.photo?'[사진] ':'')+m.text,sub:m.time,mark:m.read?'·':'●',markColor:m.read?'#9aa6ba':'#f07a10',bold:!m.read,num:false,m}))},
  draw(g){status(g);title(g,'받은 문자함',unread()?'새 '+unread():'');list(g,this.items(),S.sel);soft(g,'답장','읽기','통화')},
  key(id){const it=this.items(),m=it[S.sel]?.m;if(id==='send'&&m){const p=contactOf(m);if(p)call(p);else pop('전화할 수 없는\n문자예요');return true}
   if(id==='menu'&&m){const p=contactOf(m);if(p)go('compose',{to:p});else pop('답장할 수 없는\n문자예요');return true}
   return listKey(id,it,x=>{x.m.read=true;save();syncLabel();go('read',x.m)})}};
 SCR.outbox={items(){return D.sent.map(m=>({label:m.to+'  '+(m.photo?'[사진] ':'')+m.text,sub:m.time,mark:'✓',markColor:'#2bb24c',num:false,m}))},
  draw(g){status(g);title(g,'보낸 문자함');list(g,this.items(),S.sel);soft(g,'','읽기','')},
  key(id){return listKey(id,this.items(),x=>go('read',{...x.m,photo:null,from:'받는 사람: '+x.m.to,sent:true}))}};
 SCR.read={enter(){S.scroll=0},draw(g){const m=S.arg;status(g);title(g,m.from,m.time);body(g,'#fffef6');let y0=TOP+TITLE+4;
   if(m.photo){const im=photoImg(m.id);if(im){g.drawImage(im,W/2-48,y0,96,72)}else R(g,W/2-48,y0,96,72,'#ccd');y0+=76}
   const lines=wrap(g,m.text,W-14,11.5,false),vis=Math.max(1,Math.floor((H-BOT-y0-8)/15));S.maxScroll=Math.max(0,lines.length-vis);
   lines.slice(S.scroll||0,(S.scroll||0)+vis).forEach((l,i)=>T(g,l,7,y0+13+i*15,{size:11.5,color:'#1b2433'}));
   T(g,smsBytes(m.text)+'바이트',W-5,H-BOT-4,{size:8,color:'#9a8a5a',align:'right'});soft(g,m.sent?'':'답장',m.photo?'저장':'',m.sent?'':'통화')},
  key(id){const m=S.arg;if(id==='up'){S.scroll=Math.max(0,(S.scroll||0)-1);return true}if(id==='down'){S.scroll=Math.min(S.maxScroll||0,(S.scroll||0)+1);return true}
   if((id==='ok'||id==='nate')&&m.photo){if(PH.length>=12)PH.pop();PH.unshift({id:'p'+(++D.n),url:m.photo,time:m.time,place:'포토 메일 · '+m.from});savePhotos();save();pop('사진첩에 저장했어요');return true}
   if(id==='clr'||id==='ok'||id==='left'){back();return true}const p=contactOf(m);
   if(id==='send'&&!m.sent){if(p)call(p);else pop('전화할 수 없는\n문자예요');return true}
   if(id==='menu'&&!m.sent){if(p)go('compose',{to:p});else pop('답장할 수 없는\n문자예요');return true}return false}};
 /* 문자 쓰기: 받는 사람 → 글 (숫자판 한글 입력, 자판 입력, 상용구, 이모티콘) → 보내기 */
 SCR.compose={enter(){S.step=S.arg?.to?1:0;if(S.step===1)editorFor(80)},
  typing(){return S.step===1?'자판으로 바로 쓰기 · Enter 보내기':null},
  items(){return book().filter(p=>p.id!=='home').map(p=>({label:p.n,sub:p.friend?'같은 방':p.num.slice(-4),mark:p.friend?'●':'',markColor:'#2bb24c',num:false,p}))},
  draw(g,t){status(g);if(S.step===0){title(g,'받는 사람 고르기');list(g,this.items(),S.sel);soft(g,'','선택','');return}
   const to=S.arg.to;title(g,'문자 쓰기',to.n);drawEditor(g,S.ed,TOP+TITLE,H-BOT-10,t,'받는 사람: '+to.n);edHelp(g,S.ed,H-BOT-2.5);soft(g,S.ed.modeName(),'이모티콘','보내기')},
  key(id){if(S.step===0){const it=this.items();return listKey(id,it,x=>{S.arg={to:x.p};S.step=1;S.sel=0;editorFor(80);afterNav()})}
   const ed=S.ed;if(id==='menu'){ed.nextMode();return true}if(id==='nate'){go('phrases',{ed});return true}
   if(id==='ok'||id==='send'){const text=ed.text().trim();if(!text){pop('보낼 글을 써 주세요');return true}replace('sending',{to:S.arg.to,text});return true}
   if(id==='clr'&&!ed.tokens.length){back();return true}if(id==='up'||id==='down')return true;
   if(ed.key(id)){edChanged();return true}if(ed.bytes()>=ed.max)pop('80바이트까지만 쓸 수 있어요',900);return true}};
 SCR.phrases={items(){return[...D.emoBox.map(t=>({label:'보관함  '+t,num:false,v:t})),...PHRASES.map(t=>({label:t,num:false,v:t})),...EMO.map(t=>({label:'이모티콘  '+t,num:false,v:t}))]},
  draw(g){status(g);title(g,S.arg?.view?'상용구':'상용구 · 이모티콘');list(g,this.items(),S.sel);soft(g,'',S.arg?.view?'':'넣기','')},
  key(id){return listKey(id,this.items(),x=>{if(S.arg?.view)return;const ed=S.arg.ed;back();if(ed&&!ed.insert(x.v))pop('80바이트까지만 쓸 수 있어요',900);edChanged()})}};
 SCR.sending={enter(){S.t0=now();S.ack=null;S.res=sendSms(S.arg.to,S.arg.text,S.arg.photo||null)},draw(g,t){status(g);title(g,S.arg.photo?'포토 메일 보내기':'문자 보내기');body(g);
   const p=clamp((t-S.t0)/1300,0,1);ICON.sms(g,W/2-11+Math.sin(t/90)*2,50);T(g,(S.arg.to.n)+'에게',W/2,90,{size:10.5,bold:true,color:'#16202e',align:'center'});
   wrap(g,'"'+S.arg.text+'"',W-24,9.5,false).slice(0,2).forEach((l,i)=>T(g,l,W/2,105+i*12,{size:9.5,color:'#44506a',align:'center'}));
   R(g,16,134,W-32,8,'#c9d4e6');R(g,16,134,(W-32)*p,8,'#2bb24c');T(g,p<1?'전송 중...':'잠시만요...',W/2,156,{size:10,bold:true,color:'#2f4a7a',align:'center'});soft(g,'','','')},
  needs(t){if(t-S.t0<1300)return true;const r=S.res;
   if(r==='offline'){back();pop('같은 방에 있어야\n보낼 수 있어요');return true}
   if(r==='net'){if(S.ack&&S.ack.ok){back();pop('전송 완료!',1300);return true}if(S.ack&&!S.ack.ok){back();pop(S.ack.msg||'보내지 못했어요');return true}if(t-S.t0>6000){back();pop('보내지 못했어요');return true}return true}
   if(t-S.t0>=1900){back();pop('전송 완료!',1300)}return true},key(){return true}};

 SCR.calls={items(){return D.calls.map(c=>({label:c.n,sub:c.time,mark:c.t==='out'?'↗':c.t==='in'?'↙':'✕',markColor:c.t==='miss'?'#e8402a':c.t==='in'?'#2bb24c':'#2f6fd6',num:false,c}))},
  draw(g){status(g);title(g,'통화 기록',D.calls.length+'건');list(g,this.items(),S.sel);soft(g,'','선택','통화')},
  key(id){const it=this.items();if(id==='send'||id==='ok'||id==='nate'){const c=it[S.sel]?.c;if(c){const f=c.peer&&friends().find(x=>x.peer===c.peer);call(f||findNum(c.num)||c.num)}return true}return listKey(id,it,()=>{})}};
 SCR.call={typing(){return S.call&&S.call.phase==='live'&&S.call.real?'통화 중 말하기 · Enter 보내기':null},
  draw(g,t){const c=S.call;if(!c){home();return}g.fillStyle=grad(g,TOP,H,'#1b3a6a','#08101e');g.fillRect(0,TOP,W,H-TOP);status(g);const who=c.who;
   if(c.real&&c.phase==='live'){R(g,0,TOP,W,30,'rgba(0,0,0,.25)');ICON.calls(g,4,TOP+4);T(g,who.n,30,TOP+13,{size:11,bold:true,color:'#fff',max:W-34});const s=Math.floor((t-c.talk0)/1000);
    T(g,'통화 중  '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'),30,TOP+25,{size:8.5,bold:true,color:'#7dff8a'});
    let y=H-BOT-46;const shown=[];for(let i=c.lines.length-1;i>=0&&shown.length<4;i--)shown.unshift(c.lines[i]);let yy=TOP+34;
    for(const l of shown){const ls=wrap(g,l.text,W-30,9,false).slice(0,2),hh=ls.length*11+4,x=l.sys?W/2-50:l.me?W-8-Math.min(W-30,Math.max(...ls.map(z=>(g.font=fnt(9),g.measureText(z).width)))+8):8;
     const bw=l.sys?100:Math.min(W-30,Math.max(...ls.map(z=>(g.font=fnt(9),g.measureText(z).width)))+8);g.fillStyle=l.sys?'rgba(255,255,255,.18)':l.me?'#ffe27a':'#ffffff';rr(g,x,yy,bw,hh,4);g.fill();
     ls.forEach((z,i)=>T(g,z,l.sys?W/2:x+4,yy+10+i*11,{size:9,color:l.sys?'#cfe':'#16202e',align:l.sys?'center':'left'}));yy+=hh+3;if(yy>y)break}
    if(S.ed)drawEditor(g,S.ed,H-BOT-36,H-BOT,t,'말하기');soft(g,S.ed?S.ed.modeName():'','말하기','종료');return}
   ICON.calls(g,W/2-11,TOP+10);T(g,who.unknown?'모르는 번호':who.n,W/2,TOP+52,{size:14,bold:true,color:'#fff',align:'center',max:W-10});T(g,who.num||'',W/2,TOP+67,{size:10,color:'#bcd4ff',align:'center'});
   if(c.phase==='ring'){const k=Math.floor(t/300)%2;T(g,'전화가 왔어요!',W/2,TOP+92,{size:11,bold:true,color:k?'#ffd27a':'#fff',align:'center'});T(g,'통화 버튼: 받기',W/2,TOP+112,{size:9,color:'#7dff8a',align:'center'});T(g,'종료 버튼: 거절',W/2,TOP+125,{size:9,color:'#ff9a8a',align:'center'});soft(g,'','받기','거절');return}
   if(c.phase==='dial'){const dots='.'.repeat(1+Math.floor((t-c.t0)/400)%3);T(g,'전화 거는 중'+dots,W/2,TOP+92,{size:10.5,bold:true,color:'#ffd27a',align:'center'});if(c.real)T(g,'같은 방 친구에게 거는 중',W/2,TOP+108,{size:8.5,color:'#9fc0ff',align:'center'})}
   else if(c.phase==='talk'){const s=Math.floor((t-c.talk0)/1000);T(g,'통화 중  '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'),W/2,TOP+86,{size:10,bold:true,color:'#7dff8a',align:'center'});
    let y=TOP+100;for(const l of c.lines.slice(-3)){const ls=wrap(g,l,W-26,9.5,false);g.fillStyle='rgba(255,255,255,.92)';rr(g,8,y-2,W-16,ls.length*12+6,4);g.fill();ls.forEach((x,i)=>T(g,x,13,y+8+i*12,{size:9.5,color:'#16202e'}));y+=ls.length*12+9}}
   else if(c.phase==='msg'){wrap(g,c.result.msg,W-16,9.5,true).forEach((l,i)=>T(g,l,W/2,TOP+92+i*13,{size:9.5,bold:true,color:'#ffe7b0',align:'center'}))}
   else T(g,c.endMsg||'통화 종료',W/2,TOP+96,{size:11,bold:true,color:'#ff9a8a',align:'center',max:W-8});
   soft(g,'','','종료')},
  needs(t){const c=S.call;if(!c)return false;
   if(c.phase==='ring'){if(t-c.t0>25000){decline(true);return true}if(D.alert==='ring'&&!S.tune)playRing(ringById(D.ring));if(D.alert==='vib'&&t-S.buzzAt>1500){S.buzzAt=t;host.buzz()}return Math.floor(t/300)!==S.rk&&((S.rk=Math.floor(t/300)),true)}
   if(c.phase==='dial'&&c.real){if(c.tone){if(!S.tune)playRing(ringById(c.tone))}else if(t>=c.ring){c.ring=t+3000;host.beep([440,480],1000,.05,'sine')}if(t-c.t0>30000)hang('상대방이 받지 않아요');return Math.floor(t/400)!==S.rk&&((S.rk=Math.floor(t/400)),true)}
   if(c.phase==='dial'){if(!c.result?.fast&&t>=c.ring){c.ring=t+3000;host.beep([440,480],1000,.05,'sine')}const wait=c.result?.fast?700:c.result?.late?6200:2400;if(t-c.t0>=wait){if(c.result){c.phase='msg';c.msgAt=t;if(c.result.voice)host.beep([1000],600,.05,'sine',2.6)}else{c.phase='talk';c.talk0=t;c.next=t}}return true}
   if(c.phase==='talk'){const lines=c.who.talk||['여보세요?'];if(t>=c.next&&c.lines.length<lines.length){c.lines.push(lines[c.lines.length]);c.next=t+1900}if(c.lines.length>=lines.length&&t>=c.next+1600)hang('상대방이 전화를 끊었어요');return true}
   if(c.phase==='live')return Math.floor(t/500)!==S.rk&&((S.rk=Math.floor(t/500)),true);
   if(c.phase==='msg'){if(t-c.msgAt>=(c.result.voice?6000:4200))hang('통화 종료');return true}
   if(c.phase==='ended'&&t>=c.endAt){S.call=null;home();return true}return false},
  key(id){const c=S.call;if(!c)return true;
   if(c.phase==='ring'){if(id==='send'||id==='ok')answer();else if(id==='end'||id==='clr')decline(false);return true}
   if(id==='end'){if(c.phase==='ended'){S.call=null;home()}else hang(c.phase==='talk'||c.phase==='live'?'통화 종료':'전화를 끊었어요');return true}
   if(c.phase==='live'&&S.ed){if(id==='ok'||id==='send'){sayLine();return true}if(id==='menu'){S.ed.nextMode();return true}if(id==='nate'){go('phrases',{ed:S.ed});return true}if(S.ed.key(id))edChanged();return true}
   if(id==='clr'){if(c.phase==='ended'){S.call=null;home()}else hang(c.phase==='talk'?'통화 종료':'전화를 끊었어요');return true}return true}};

 /* ---------- 카메라와 사진첩 ---------- */
 const FILTERS=[['기본','none'],['흑백','grayscale(1)'],['옛날 사진','sepia(.85) contrast(1.05)'],['뽀샤시','brightness(1.18) saturate(1.3) contrast(.9)']];
 const ZOOMS=[1,1.4,2];
 /* 조준: 확대해도 방향 버튼(또는 2 4 6 8)으로 찍을 곳을 옮긴다. 찍힐 범위는 게임 화면 위에도 점선 틀로 보인다 */
 function viewSrc(gc,c){const cw=gc.width||480,ch=gc.height||270,z=ZOOMS[c.z],sh=ch/z,sw=Math.min(cw,sh*4/3),mx=(cw-sw)/2,my=(ch-sh)/2;c.px=clamp(c.px||0,-mx,mx);c.py=clamp(c.py||0,-my,my);return[mx+c.px,my+c.py,sw,sh]}
 SCR.camera={enter(){S.cam={f:0,z:0,px:0,py:0,flash:0}},draw(g,t){const c=S.cam,gc=host.gameCanvas?.();R(g,0,TOP,W,H-TOP,'#000');status(g);
   const vh=112,vy=TOP+12;if(gc){const [sx,sy,sw,sh]=viewSrc(gc,c);g.save();if('filter' in g)g.filter=FILTERS[c.f][1];try{g.drawImage(gc,sx,sy,sw,sh,0,vy,W,vh)}catch(_){}g.restore();host.cameraFrame?.({x:sx,y:sy,w:sw,h:sh})}else T(g,'화면을 찾을 수 없어요',W/2,70,{size:10,color:'#fff',align:'center'});
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.2;for(const [x,y,dx,dy] of [[6,vy+6,1,1],[W-6,vy+6,-1,1],[6,vy+vh-6,1,-1],[W-6,vy+vh-6,-1,-1]]){g.beginPath();g.moveTo(x,y+10*dy);g.lineTo(x,y);g.lineTo(x+10*dx,y);g.stroke()}
   g.strokeStyle='rgba(255,90,70,.95)';g.lineWidth=1;g.beginPath();g.moveTo(W/2-7,vy+vh/2);g.lineTo(W/2+7,vy+vh/2);g.moveTo(W/2,vy+vh/2-7);g.lineTo(W/2,vy+vh/2+7);g.stroke();
   if(gc){const cw=gc.width||480,ch=gc.height||270,[sx,sy,sw,sh]=viewSrc(gc,c),mw=34,mh=mw*ch/cw,mx=W-mw-4,my=vy+vh-mh-4;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(mx-1,my-1,mw+2,mh+2);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.6;g.strokeRect(mx,my,mw,mh);g.strokeStyle='#ffd27a';g.lineWidth=1;g.strokeRect(mx+sx/cw*mw,my+sy/ch*mh,sw/cw*mw,sh/ch*mh)}
   R(g,0,TOP,W,12,'rgba(0,0,0,.55)');T(g,'130만 화소  ×'+ZOOMS[c.z],4,TOP+9,{size:8,bold:true,color:'#fff'});T(g,FILTERS[c.f][0],W-4,TOP+9,{size:8,bold:true,color:'#ffd27a',align:'right'});
   if(t<c.flash){g.fillStyle='rgba(255,255,255,'+((c.flash-t)/160).toFixed(2)+')';g.fillRect(0,vy,W,vh)}
   T(g,'방향·2468 조준  1·3 확대  * 효과  0 가운데',W/2,vy+vh+11,{size:7,color:'#cfd8e8',align:'center'});soft(g,'사진첩','찰칵',PH.length+'/12')},
  needs(t){return Math.floor(t/60)!==S.cf&&((S.cf=Math.floor(t/60)),true)},
  key(id){const c=S.cam,step=24/ZOOMS[c.z];const pan={left:[-1,0],'4':[-1,0],right:[1,0],'6':[1,0],up:[0,-1],'2':[0,-1],down:[0,1],'8':[0,1]}[id];
   if(pan){c.px+=pan[0]*step;c.py+=pan[1]*step;return true}if(id==='*'){c.f=(c.f+1)%FILTERS.length;return true}
   if(id==='3'||id==='#'){c.z=id==='#'?(c.z+1)%ZOOMS.length:Math.min(ZOOMS.length-1,c.z+1);return true}if(id==='1'){c.z=Math.max(0,c.z-1);return true}if(id==='0'){c.px=0;c.py=0;return true}
   if(id==='menu'){replace('album');return true}if(id==='clr'){back();return true}
   if(id==='ok'||id==='nate'||id==='5'){snap();return true}return true}};
 function snap(){const c=S.cam,gc=host.gameCanvas?.();if(!gc||!host.makeCanvas)return;const cv=host.makeCanvas(240,180),x=cv.getContext('2d');if(!x)return;
  const [sx,sy,sw,sh]=viewSrc(gc,c);x.save();if('filter' in x)x.filter=FILTERS[c.f][1];try{x.drawImage(gc,sx,sy,sw,sh,0,0,240,180)}catch(_){}x.restore();
  x.font=fnt(12,true);x.textAlign='right';x.fillStyle='rgba(0,0,0,.6)';x.fillText('2006.05.30 '+nowStr(),235.2,175.2);x.fillStyle='#ff9a2a';x.fillText('2006.05.30 '+nowStr(),234,174);
  let url=null;try{url=cv.toDataURL('image/jpeg',.8)}catch(_){url=null}
  const p={id:'p'+(++D.n),url,time:nowStr(),place:host.place().area,cv:url?null:cv};if(PH.length>=12)PH.pop();PH.unshift(p);save();savePhotos();
  c.flash=now()+160;host.beep([2200],30,.05,'square');host.beep([1500],60,.05,'square',.04);pop(url?'찰칵! 사진첩에 저장했어요':'찰칵! (이 컴퓨터에서는\n껐다 켜면 사진이 사라져요)',1100)}
 SCR.album={draw(g){S.sel=Math.min(S.sel,Math.max(0,PH.length-1));status(g);title(g,'사진첩',PH.length+'/12');body(g,'#20242e');
   if(!PH.length){T(g,'사진이 없어요',W/2,80,{size:10,color:'#cfd8e8',align:'center'});T(g,'카메라로 찍어 보세요',W/2,96,{size:9,color:'#8a94a8',align:'center'})}
   const first=Math.max(0,Math.floor(S.sel/3)-2)*3;for(let i=first;i<Math.min(PH.length,first+9);i++){const k=i-first,x=3+(k%3)*49,y=TOP+TITLE+4+Math.floor(k/3)*45,im=photoImg(PH[i].id);
    if(im)g.drawImage(im,x,y,46,34.5);else R(g,x,y,46,34.5,'#556');if(i===S.sel){g.strokeStyle='#ffae4a';g.lineWidth=2;g.strokeRect(x-1,y-1,48,36.5)}T(g,PH[i].time,x+23,y+42,{size:7,color:'#cfd8e8',align:'center'})}
   soft(g,'메뉴','보기','')},
  key(id){const n=PH.length;if(!n){if(id==='clr'||id==='left')back();return true}if(id==='left'){S.sel=(S.sel-1+n)%n;return true}if(id==='right'){S.sel=(S.sel+1)%n;return true}
   if(id==='up'){S.sel=Math.max(0,S.sel-3);return true}if(id==='down'){S.sel=Math.min(n-1,S.sel+3);return true}if(id==='clr'){back();return true}
   if(id==='ok'||id==='nate'){go('photo',PH[S.sel].id);return true}if(id==='menu'){go('photoMenu',PH[S.sel].id);return true}return true}};
 SCR.photo={draw(g){const p=PH.find(x=>x.id===S.arg);status(g);if(!p){back();return}title(g,p.place||'사진',p.time);body(g,'#000');const im=photoImg(p.id);if(im)g.drawImage(im,0,TOP+TITLE+8,W,112.5);soft(g,'메뉴','','')},
  key(id){if(id==='menu'||id==='ok'||id==='nate'){replace('photoMenu',S.arg);return true}if(id==='clr'){back();return true}return true}};
 SCR.photoMenu={items(){const L=[{label:'배경 화면으로',k:'wall'},{label:'친구에게 보내기 (포토 메일)',k:'send'},{label:'내 컴퓨터에 파일로 저장',k:'file'}];if(host.pcSave&&w.XPDesktop?.current?.modules?.shell?.picSave)L.push({label:'PC ‘내 그림’에 저장',k:'pc'});L.push({label:'지우기',k:'del'});return L},draw(g){status(g);title(g,'사진 메뉴');list(g,this.items(),S.sel);soft(g,'','선택','')},
  key(id){const pid=S.arg;return listKey(id,this.items(),(x,i)=>{const p=PH.find(q=>q.id===pid);if(!p){back();return}
   const k=x.k;if(k==='wall'){D.wall='ph:'+pid;save();back();pop('배경 화면으로 정했어요')}
   else if(k==='send'){if(!p.url){pop('이 사진은 보낼 수 없어요');return}if(!friends().length){pop('같은 방 친구에게만\n보낼 수 있어요');return}go('photoTo',pid)}
   else if(k==='file'){if(!p.url){pop('파일로 열어서 놀 때는\n사진을 저장할 수 없어요\n(서버 주소로 열어 주세요)',2600);return}const n=PH.length-PH.indexOf(p);const ok=host.download?.('anycall_photo_20060530_'+String(p.time||'').replace(':','')+'_'+n+'.jpg',p.url);pop(ok?'내 컴퓨터에 저장했어요\n(내려받기 폴더)':'저장하지 못했어요',2000)}
   else if(k==='pc'){if(!p.url){pop('이 사진은 저장할 수 없어요');return}const r=host.pcSave('폰카 '+String(p.time||'').replace(':','')+'.jpg',p.url,240,180);pop(r&&r.ok?'PC ‘내 그림’에 저장했어요':'PC에 저장하지 못했어요',1800)}
   else ask('이 사진을 지울까요?',()=>{PH=PH.filter(q=>q.id!==pid);if(D.wall==='ph:'+pid)D.wall='cat';savePhotos();save();IMG.delete(pid);back();pop('지웠어요')})})}};
 SCR.photoTo={items(){return friends().map(p=>({label:p.n,mark:'●',markColor:'#2bb24c',num:false,p}))},draw(g){status(g);title(g,'포토 메일 받는 친구');list(g,this.items(),S.sel);soft(g,'','보내기','')},
  key(id){return listKey(id,this.items(),x=>{const p=PH.find(q=>q.id===S.arg),small=shrink(p);if(!small){pop('사진을 줄이지 못했어요');return}replace('sending',{to:x.p,text:'['+(p.place||'사진')+'] 찍었어 ^^',photo:small})})}};
 function shrink(p){if(!p||!host.makeCanvas)return null;const im=photoImg(p.id);if(!im)return null;const cv=host.makeCanvas(96,72),x=cv.getContext('2d');if(!x)return null;x.drawImage(im,0,0,96,72);
  for(const q of [.6,.45,.3]){try{const u=cv.toDataURL('image/jpeg',q);if(u.length<=6000)return u}catch(_){return null}}return null}

 /* ---------- DMB 방송 ---------- */
 const CH=[['뉴스','동네 저녁 뉴스'],['만화','꼬마 공룡 초록이'],['스포츠','월드컵 응원 특집'],['음악','가요 순위 열전'],['홈쇼핑','쇼핑 라이브']];
 SCR.dmb={enter(){S.tv={ch:0,t0:now()}},draw(g,t){const tv=S.tv,[kind,name]=CH[tv.ch],scene=host.scene?.()||'street',weak=INDOOR.has(scene);R(g,0,TOP,W,H-TOP,'#000');status(g);
   const y0=TOP+12,hh=H-BOT-y0-14,k=(t-tv.t0)/1000;g.save();g.beginPath();g.rect(0,y0,W,hh);g.clip();drawTv(g,kind,k,y0,hh);
   if(t-tv.t0<700||weak&&Math.floor(k*3)%4===0){for(let i=0;i<220;i++){const v=(i*7919+Math.floor(t/40)*104729)%255;R(g,(i*37+Math.floor(t/30)*13)%W,y0+(i*53+Math.floor(t/50)*7)%hh,3,2,'rgb('+v+','+v+','+v+')')}}
   g.restore();R(g,0,TOP,W,12,'#111');T(g,'DMB '+(tv.ch+7)+'  '+name,4,TOP+9,{size:8,bold:true,color:'#fff',max:W-40});
   for(let i=0;i<4;i++)R(g,W-18+i*4,TOP+9-(i+1)*2,3,(i+1)*2,weak&&i>0?'#555':'#7dff8a');
   R(g,0,H-BOT-14,W,14,'#0b1a33');if(weak)T(g,'실내라 수신이 약해요',W/2,H-BOT-4,{size:8.5,bold:true,color:'#ffb35a',align:'center'});else{const s=TICK[tv.ch],tw=s.length*8.6,x=W-((k*28)%(tw+W));T(g,s,x,H-BOT-4,{size:8.5,color:'#fff'})}
   soft(g,'','채널 '+(tv.ch+7),'')},
  needs(t){return Math.floor(t/70)!==S.tf&&((S.tf=Math.floor(t/70)),true)},
  key(id){const tv=S.tv,n=CH.length;if(id==='up'||id==='right'){tv.ch=(tv.ch+1)%n;tv.t0=now();return true}if(id==='down'||id==='left'){tv.ch=(tv.ch-1+n)%n;tv.t0=now();return true}
   const d=DIG.indexOf(id);if(d>=0&&d<n){tv.ch=d;tv.t0=now();return true}if(id==='clr'){back();return true}return true}};
 const TICK=['독일 월드컵 개막 D-10 · 대표팀 최종 훈련 돌입 · 내일은 지방선거일 투표소 확인하세요','다음 시간에는 초록이와 친구들의 바닷가 소풍 이야기가 이어집니다','대~한민국 짝짝짝 짝짝! 토고전은 6월 13일 밤 10시','이번 주 신청곡은 문자로 보내 주세요 (정보이용료 별도)','상담원 연결 080-530-2006 · 무이자 3개월 · 선착순 마감 임박'];
 function person(g,x,y,s,c,k){circ(g,x,y-s*1.6,s*.55,'#f2c9a0');R(g,x-s*.5,y-s*1.1,s,s*1.2,c);R(g,x-s*.55,y-s*2.2,s*1.1,s*.45,'#222')}
 function drawTv(g,kind,k,y0,hh){const W2=W;
  if(kind==='뉴스'){R(g,0,y0,W2,hh,'#1f3f7a');R(g,0,y0+hh-36,W2,36,'#5a3a20');person(g,48,y0+hh-30,22,'#223',k);R(g,86,y0+12,54,40,'#0d2650');T(g,'속보',113,y0+28,{size:11,bold:true,color:'#ffd34a',align:'center'});T(g,'월드컵',113,y0+42,{size:9,color:'#fff',align:'center'});if(Math.sin(k*9)>0)R(g,44,y0+hh-63,8,2,'#a33')}
  else if(kind==='만화'){R(g,0,y0,W2,hh,'#8fd6ff');R(g,0,y0+hh-20,W2,20,'#6ac04a');for(let i=0;i<3;i++){const x=((k*12+i*60)%(W2+40))-20;circ(g,x,y0+14+i*6,7,'#fff');circ(g,x+8,y0+12+i*6,8,'#fff')}
   const bx=W2/2+Math.sin(k*1.4)*40,by=y0+hh-28-Math.abs(Math.sin(k*4))*22;circ(g,bx,by,13,'#6ad06a');circ(g,bx+5,by-4,2.5,'#fff');circ(g,bx+5.5,by-4,1.2,'#111');R(g,bx-4,by+4,8,2,'#2a6a2a');for(let i=0;i<3;i++){g.fillStyle='#3a9a3a';g.beginPath();g.moveTo(bx-10+i*6,by-10);g.lineTo(bx-7+i*6,by-17);g.lineTo(bx-4+i*6,by-10);g.fill()}}
  else if(kind==='스포츠'){R(g,0,y0,W2,hh,'#2a8a3a');g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1;g.strokeRect(6,y0+6,W2-12,hh-12);g.beginPath();g.moveTo(W2/2,y0+6);g.lineTo(W2/2,y0+hh-6);g.stroke();g.beginPath();g.arc(W2/2,y0+hh/2,14,0,Math.PI*2);g.stroke();
   for(let i=0;i<40;i++){const x=(i*17)%W2,y=y0+4+(i%3)*4,up=Math.sin(k*8+i)>0;R(g,x,y-(up?2:0),3,3,i%2?'#e8302a':'#ffffff')}
   circ(g,W2/2+Math.sin(k*1.3)*50,y0+hh/2+Math.cos(k*1.7)*20,3,'#fff');T(g,'대~한민국!',W2/2,y0+hh-12,{size:11,bold:true,color:'#ffe08a',align:'center',shadow:'#000'})}
  else if(kind==='음악'){R(g,0,y0,W2,hh,'#1a0a2a');for(let i=0;i<5;i++){g.fillStyle='rgba('+(150+i*20)+',80,255,.25)';g.beginPath();g.moveTo(15+i*30,y0);g.lineTo(5+i*30+Math.sin(k*2+i)*14,y0+hh);g.lineTo(28+i*30+Math.sin(k*2+i)*14,y0+hh);g.fill()}
   for(let i=0;i<3;i++){const x=40+i*35,j=Math.abs(Math.sin(k*5+i))*6;person(g,x,y0+hh-12-j,14,['#e84d8a','#4d8ae8','#e8c84d'][i],k)}T(g,'1위',12,y0+16,{size:11,bold:true,color:'#ffd34a'})}
  else{R(g,0,y0,W2,hh,'#fff4e0');const a=k*2;g.save();g.translate(W2/2-25,y0+hh/2);g.scale(Math.cos(a),1);g.fillStyle='#3a3a4a';rr(g,-12,-26,24,52,5);g.fill();R(g,-9,-20,18,20,'#7ac8ff');g.restore();
   T(g,'애니콜 줄',W2-40,y0+24,{size:10,bold:true,color:'#e8402a',align:'center'});T(g,Math.sin(k*6)>0?'9,900원':'오늘만!',W2-40,y0+44,{size:13,bold:true,color:'#1d2633',align:'center'});T(g,'080-530-2006',W2-40,y0+60,{size:8,color:'#555',align:'center'})}}

 /* ---------- NATE: 2006년 무선 인터넷 (src/anycall-nate.js 의 브라우저) ---------- */
 SCR.nate={enter(){NB?NB.open(S.arg):pop('NATE에 접속할 수 없어요')},typing(){return NB?NB.typing():null},
  draw(g,t){if(NB)NB.draw(g,t);else{status(g);title(g,'NATE');soft(g,'','','')}},key(id){if(NB)return NB.key(id);back();return true},needs(t){return NB?NB.needs(t):false},ownsSound:id=>NB?NB.ownsSound(id):false};
 SCR.dl={enter(){S.t0=now()},draw(g,t){status(g);title(g,'다운로드',null,['#ff9a3a','#e8620a']);body(g,'#fff7ef');const p=clamp((t-S.t0)/1800,0,1);T(g,S.arg.name,W/2,70,{size:11,bold:true,color:'#1d2633',align:'center',max:W-10});
   R(g,18,90,W-36,8,'#f0d8c0');R(g,18,90,(W-36)*p,8,'#ff7a12');T(g,Math.round(p*100)+'%  받는 중...',W/2,116,{size:9.5,bold:true,color:'#7a4a12',align:'center'});soft(g,'','','')},
  needs(t){if(t-S.t0>=1900){D.got[S.arg.id]=1;charge('info',S.arg.price);const nm=S.arg.name;back();pop('‘'+nm+'’\n받기 완료!');return true}return true},key(){return true}};
 /* ---------- 친구 찾기 (내 위치 + 같은 방 친구 위치) ---------- */
 SCR.find={enter(){S.t0=now()},items(){const meP=host.place();return[{label:'나: '+meP.area,mark:'★',markColor:'#e8402a',num:false,me:true},...friends().map(f=>({label:f.n+': '+placeOf(f.p),mark:'●',markColor:'#2bb24c',num:false,f}))]},
  draw(g,t){status(g);title(g,'친구 찾기 (GPS)');if(t-S.t0<1500){body(g,'#0e2a1e');const cx=W/2,cy=86;g.strokeStyle='#3ad27a';g.lineWidth=1;for(const r of [12,24,36]){g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke()}
    g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(t/200)*36,cy+Math.sin(t/200)*36);g.stroke();T(g,'위성 찾는 중...',W/2,142,{size:10.5,bold:true,color:'#9effc0',align:'center'});soft(g,'','','');return}
   list(g,this.items(),S.sel);if(!friends().length)T(g,NET.ready()?'같은 방에 친구가 없어요':'방에 들어가면 친구 위치가 보여요',W/2,H-BOT-6,{size:8.5,color:'#6b778a',align:'center'});soft(g,'문자','선택','통화')},
  needs(t){return t-S.t0<1600},
  key(id){if(now()-S.t0<1500){if(id==='clr')back();return true}const it=this.items(),x=it[S.sel];
   if(id==='send'&&x?.f){call(x.f);return true}if(id==='menu'&&x?.f){go('compose',{to:x.f});return true}
   return listKey(id,it,x=>{if(x.me){const p=host.place();go('read',{from:'내 위치',time:nowStr(),text:'지금 있는 곳: '+p.area+'\n장소: '+p.scene+'\n시간: '+p.time+' · 날씨: '+p.weather,sent:true});return}
    const me=host.me?.(),fp=x.f.p,same=me&&me.scene===fp.scene,dist=same?Math.round(Math.abs((me.x||0)-(fp.x||0))/16):null;
    go('read',{from:x.f.n,time:'같은 방',text:'지금 있는 곳: '+placeOf(fp)+'\n'+(same?'나랑 같은 곳! 약 '+dist+'걸음 떨어져 있어요':'나랑 다른 곳에 있어요')+'\n\n통화 버튼: 전화 · 매뉴: 문자',sent:true})})}};

 /* ---------- 벨소리와 뮤직 ---------- */
 SCR.ring={enter(){const rs=rings();const i=rs.findIndex(r=>r[0]===D.ring);S.sel=S.arg==='music'?0:Math.max(0,i)},
  items(){return rings().map(r=>({label:r[1],sub:r[0].startsWith('mel:')?'내 곡':r[3],mark:r[0]===D.ring&&S.arg!=='music'?'✓':S.tune===r[0]?'♪':'',markColor:'#1f8a3a',num:false,r}))},
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
  draw(g){const ws=walls(),c=ws[S.sel]||ws[0];wallpaper(g,c[0],TOP,H-TOP-BOT);status(g);
   g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,TOP,W,17);T(g,'◀ '+c[1]+' ▶',W/2,TOP+12.5,{size:10.5,bold:true,color:'#fff',align:'center'});
   T(g,(S.sel+1)+'/'+ws.length,W-4,H-BOT-4,{size:9,bold:true,color:'#fff',align:'right',shadow:'rgba(0,0,0,.7)'});if(c[0]===D.wall)T(g,'✓ 지금 배경',5,H-BOT-4,{size:9,bold:true,color:'#fff',shadow:'rgba(0,0,0,.7)'});soft(g,'','설정','')},
  key(id){const n=walls().length;if(id==='left'||id==='up'){S.sel=(S.sel-1+n)%n;return true}if(id==='right'||id==='down'){S.sel=(S.sel+1)%n;return true}
   if(id==='ok'||id==='nate'){D.wall=walls()[S.sel][0];save();pop('배경 화면으로\n정했어요');return true}if(id==='clr'){back();return true}return false}};
 /* 멜로디 작곡: 1~7 도레미파솔라시, 8 높은 도, 9 쉼표, 0 옥타브, * 음 길이, # 처음부터 듣기 */
 SCR.melody={enter(){S.mel={notes:[],oct:5,len:0}},ownsSound:id=>/^[1-8]$/.test(id),
  draw(g,t){const M=S.mel;status(g);title(g,'멜로디 작곡',M.notes.length+'/32');body(g,'#fffef6');const y0=TOP+TITLE+14;
   for(let i=0;i<5;i++)R(g,4,y0+i*8,W-8,.8,'#8a94a8');const first=Math.max(0,M.notes.length-12);
   M.notes.slice(first).forEach(([n,d],i)=>{const x=10+i*11;if(n==='R'){R(g,x-2,y0+14,6,3,'#444');return}const m=/^([A-G])(\d)$/.exec(n);const step='CDEFGAB'.indexOf(m[1])+(+m[2]-5)*7;const y=y0+36-step*4;
    circ(g,x,y,3,d>=2?'#fff':'#2f6fd6');if(d>=2){g.strokeStyle='#2f6fd6';g.lineWidth=1;g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.stroke()}R(g,x+2.4,y-12,1,12,'#2f6fd6');if(d<=.5)R(g,x+2.4,y-12,4,1.6,'#2f6fd6')});
   T(g,'옥타브 '+M.oct+'  ·  음 길이 '+LENS[M.len][1]+'음표',W/2,y0+58,{size:9,bold:true,color:'#2f4a7a',align:'center'});
   ['1~7 도레미파솔라시  8 높은도','9 쉼표  0 옥타브  * 음 길이','# 처음부터 듣기  취소 지우기'].forEach((s,i)=>T(g,s,W/2,y0+76+i*12,{size:8,color:'#6b778a',align:'center'}));
   soft(g,'벨소리로','저장','')},
  key(id){const M=S.mel;const fq=n=>{const f=w.WebTown?.freq;return f?f(n):440};
   if(NOTE_KEYS[id]){if(M.notes.length>=32){pop('32음까지 쓸 수 있어요',900);return true}const k=NOTE_KEYS[id],n=k==='C+'?'C'+(M.oct+1):k+M.oct,d=LENS[M.len][0];M.notes.push([n,d]);host.beep([fq(n)],Math.round(d*260),.08,'square');return true}
   if(id==='9'){M.notes.push(['R',LENS[M.len][0]]);return true}if(id==='0'){M.oct=M.oct>=6?4:M.oct+1;return true}if(id==='*'){M.len=(M.len+1)%LENS.length;return true}
   if(id==='#'){if(!M.notes.length)return true;playRing(['mel:try','미리 듣기','직접 작곡','16화음',120,M.notes.map(([n,d])=>n+':'+d).join(' '),'R:1',0]);return true}
   if(id==='clr'){if(M.notes.length)M.notes.pop();else back();return true}
   if(id==='ok'||id==='nate'||id==='menu'){if(!M.notes.length){pop('먼저 음을 눌러 보세요');return true}const mel={id:String(++D.n),name:'내가 만든 곡 '+(D.mel.length+1),notes:M.notes.slice(),bpm:120};if(D.mel.length>=3)D.mel.shift();D.mel.push(mel);
    if(id==='menu')D.ring='mel:'+mel.id;save();stopTune();pop(id==='menu'?'‘'+mel.name+'’\n벨소리로 정했어요':'‘'+mel.name+'’\n저장했어요 (벨소리 목록)');M.notes=[];return true}return true}};

 /* ---------- 게임 ---------- */
 SCR.games={items(){return GAMES.map(gm=>({label:gm.name,sub:has(gm.id)?'최고 '+(D.best[gm.id]||0):'NATE '+gm.price.toLocaleString('ko-KR')+'원',dim:!has(gm.id),gm}))},
  draw(g){status(g);title(g,'게임');list(g,this.items(),S.sel);T(g,'숫자판은 슬라이드를 올리고!',W/2,H-BOT-6,{size:8.5,color:'#6b778a',align:'center'});soft(g,'','시작','')},
  key(id){return listKey(id,this.items(),x=>{if(has(x.gm.id))go(x.gm.id);else ask('‘'+x.gm.name+'’은 NATE에서 받아야 해요.\n정보이용료 '+x.gm.price.toLocaleString('ko-KR')+'원\n받을까요?',()=>go('dl',{id:x.gm.id,price:x.gm.price,name:x.gm.name}))})}};
 SCR.mole={enter(){const t=now();S.g={score:0,end:t+30000,holes:Array(9).fill(0),cur:4,next:t+700,over:false,flash:null,sec:30}},
  draw(g,t){const G2=S.g;status(g);title(g,'두더지 잡기',G2.over?'':Math.max(0,Math.ceil((G2.end-t)/1000))+'초');body(g,'#8fd16a');
   T(g,'점수 '+G2.score,6,TOP+TITLE+12,{size:10,bold:true,color:'#1d3a12'});T(g,'최고 '+D.best.mole,W-6,TOP+TITLE+12,{size:9,color:'#2d4a22',align:'right'});
   for(let i=0;i<9;i++){const x=12+(i%3)*44,y=TOP+TITLE+18+Math.floor(i/3)*42,cx=x+19,cy=y+28;
    if(i===G2.cur){g.strokeStyle='#fff';g.lineWidth=1.5;rr(g,x,y,38,38,5);g.stroke()}
    g.fillStyle='#3a2a1a';g.beginPath();g.ellipse(cx,cy,15,6,0,0,Math.PI*2);g.fill();
    if(G2.holes[i]>t){g.fillStyle='#8a5a32';g.beginPath();g.arc(cx,cy-7,10,Math.PI,0);g.lineTo(cx+10,cy);g.lineTo(cx-10,cy);g.fill();R(g,cx-4,cy-10,2,2,'#111');R(g,cx+2,cy-10,2,2,'#111');R(g,cx-2,cy-6,4,2.5,'#ff9aa8')}
    if(G2.flash&&G2.flash.i===i&&t<G2.flash.until)T(g,'뿅!',cx,cy-12,{size:11,bold:true,color:'#fff',align:'center',shadow:'#c0392b'});
    T(g,String(i+1),x+4,y+10,{size:8.5,bold:true,color:'#1d3a12'})}
   if(G2.over)over(g,G2.score);soft(g,'',G2.over?'다시':'잡기','')},
  needs(t){const G2=S.g;if(G2.over)return false;let ch=false;if(t>=G2.end){G2.over=true;best('mole',G2.score);return true}
   if(t>=G2.next){const free=[];for(let i=0;i<9;i++)if(G2.holes[i]<=t)free.push(i);if(free.length)G2.holes[free[Math.floor(Math.random()*free.length)]]=t+650+Math.random()*550;G2.next=t+420+Math.random()*480;ch=true}
   const s=Math.ceil((G2.end-t)/1000);if(s!==G2.sec){G2.sec=s;ch=true}if(G2.flash&&t>=G2.flash.until){G2.flash=null;ch=true}for(let i=0;i<9;i++)if(G2.holes[i]&&G2.holes[i]<=t){G2.holes[i]=0;ch=true}return ch},
  key(id){const G2=S.g,t=now();if(G2.over)return overKey(id,'mole');
   const hitAt=i=>{if(G2.holes[i]>t){G2.score++;G2.holes[i]=0;G2.flash={i,until:t+260};host.beep([1760,2350],60,.05,'square',.06)}};
   const d=DIG.indexOf(id);if(d>=0&&d<9){G2.cur=d;hitAt(d);return true}
   if(id==='up')G2.cur=(G2.cur+6)%9;else if(id==='down')G2.cur=(G2.cur+3)%9;else if(id==='left')G2.cur=G2.cur%3?G2.cur-1:G2.cur+2;else if(id==='right')G2.cur=G2.cur%3===2?G2.cur-2:G2.cur+1;
   else if(id==='ok'||id==='nate')hitAt(G2.cur);else if(id==='clr'){back();return true}return true}};
 function over(g,score){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,66,W,50);T(g,'끝! 점수 '+score,W/2,88,{size:14,bold:true,color:'#fff',align:'center'});T(g,'확인: 다시 · 취소: 나가기',W/2,106,{size:9,color:'#ffe7b0',align:'center'})}
 function overKey(id,which){if(id==='ok'||id==='nate'){SCR[which].enter();return true}if(id==='clr'){back();return true}return true}
 function best(k,v){if(v>(D.best[k]||0)){D.best[k]=v;save()}}
 SCR.snake={enter(){const t=now();S.g={body:[{x:7,y:6},{x:6,y:6},{x:5,y:6}],dir:{x:1,y:0},want:{x:1,y:0},food:{x:11,y:6},last:t,stepMs:200,score:0,over:false}},
  draw(g){const G2=S.g,cs=9,ox=3,oy=TOP+TITLE+14,cols=16,rows=12;status(g);title(g,'지렁이 게임');body(g,'#c9e6a0');
   T(g,'점수 '+G2.score,6,TOP+TITLE+11,{size:9.5,bold:true,color:'#2d4a22'});T(g,'최고 '+D.best.snake,W-6,TOP+TITLE+11,{size:9,color:'#2d4a22',align:'right'});
   R(g,ox-1,oy-1,cols*cs+2,rows*cs+2,'#5a7a3a');R(g,ox,oy,cols*cs,rows*cs,'#e2f2c4');circ(g,ox+G2.food.x*cs+4.5,oy+G2.food.y*cs+4.5,3.6,'#e8402a');
   G2.body.forEach((p,i)=>R(g,ox+p.x*cs+.5,oy+p.y*cs+.5,cs-1,cs-1,i?'#3d7a2a':'#1f5a14'));if(G2.over)over(g,G2.score);soft(g,'',G2.over?'다시':'','')},
  needs(t){const G2=S.g;if(G2.over||t-G2.last<G2.stepMs)return false;G2.last=t;G2.dir=G2.want;const h=G2.body[0],n={x:h.x+G2.dir.x,y:h.y+G2.dir.y};
   if(n.x<0||n.y<0||n.x>=16||n.y>=12||G2.body.some(p=>p.x===n.x&&p.y===n.y)){G2.over=true;host.beep([220,180],260,.06,'square');best('snake',G2.score);return true}
   G2.body.unshift(n);if(n.x===G2.food.x&&n.y===G2.food.y){G2.score++;G2.stepMs=Math.max(95,G2.stepMs-7);host.beep([1568],50,.05,'square');let f;do{f={x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*12)}}while(G2.body.some(p=>p.x===f.x&&p.y===f.y));G2.food=f}else G2.body.pop();return true},
  key(id){const G2=S.g;if(G2.over)return overKey(id,'snake');const map={up:[0,-1],'2':[0,-1],down:[0,1],'8':[0,1],left:[-1,0],'4':[-1,0],right:[1,0],'6':[1,0]};const m=map[id];
   if(m){if(m[0]!==-G2.dir.x||m[1]!==-G2.dir.y)G2.want={x:m[0],y:m[1]};return true}if(id==='clr'){back();return true}return true}};
 /* 점프 달리기: 5, 위, NATE, 확인 = 점프 */
 SCR.run={enter(){const t=now();S.g={y:0,vy:0,obs:[],next:t+900,last:t,speed:70,dist:0,over:false}},
  draw(g,t){const G2=S.g,gy=H-BOT-24;status(g);title(g,'점프 달리기',Math.floor(G2.dist/10)+'m');body(g,'#bfe8ff');R(g,0,gy,W,H-BOT-gy,'#c8a46a');R(g,0,gy,W,2,'#8a6a3a');
   for(let i=0;i<4;i++){const x=((i*50-G2.dist*.3)%200+200)%200-25;circ(g,x,TOP+TITLE+18+(i%2)*8,6,'#fff');circ(g,x+7,TOP+TITLE+16+(i%2)*8,7,'#fff')}
   for(const o of G2.obs){if(o.k===0){R(g,o.x,gy-14,10,14,'#6a7484');R(g,o.x-1,gy-16,12,3,'#4a5464')}else{g.fillStyle='#a0622a';g.beginPath();g.ellipse(o.x+6,gy-6,7,5,0,0,Math.PI*2);g.fill();circ(g,o.x+12,gy-10,3.5,'#a0622a');R(g,o.x+13,gy-11,1.5,1.5,'#111')}}
   const px=26,py=gy-G2.y,leg=Math.floor(G2.dist/6)%2;circ(g,px,py-21,4.5,'#f2c9a0');R(g,px-5,py-25,10,3,'#2a2a2a');R(g,px-4,py-16,8,9,'#e8402a');R(g,px-4,py-7,3,7-(G2.y>0?0:leg*2),'#24324a');R(g,px+1,py-7,3,7-(G2.y>0?0:(1-leg)*2),'#24324a');
   T(g,'최고 '+(D.best.run||0)+'m',W-5,TOP+TITLE+11,{size:8.5,color:'#2f4a7a',align:'right'});if(G2.over)over(g,Math.floor(G2.dist/10)+'m');soft(g,'',G2.over?'다시':'점프','')},
  needs(t){const G2=S.g;if(G2.over)return false;const dt=Math.min(.05,(t-G2.last)/1000);G2.last=t;if(dt<=0)return false;G2.dist+=G2.speed*dt;G2.speed=Math.min(170,G2.speed+dt*3.5);
   if(G2.y>0||G2.vy>0){G2.vy-=420*dt;G2.y=Math.max(0,G2.y+G2.vy*dt);if(G2.y===0)G2.vy=0}
   for(const o of G2.obs)o.x-=G2.speed*dt;G2.obs=G2.obs.filter(o=>o.x>-20);if(t>=G2.next){G2.obs.push({x:W+5,k:Math.random()<.5?0:1});G2.next=t+700+Math.random()*900*(90/G2.speed)}
   if(G2.obs.some(o=>o.x<30&&o.x+12>20&&G2.y<13)){G2.over=true;host.beep([200],250,.06,'square');best('run',Math.floor(G2.dist/10))}return true},
  key(id){const G2=S.g;if(G2.over)return overKey(id,'run');if(['5','up','nate','ok','2'].includes(id)){if(G2.y===0){G2.vy=170;G2.y=.1;host.beep([988,1319],50,.04,'square')}return true}if(id==='clr'){back();return true}return true}};
 /* 숫자 야구: 1~9 서로 다른 세 숫자 맞히기, 10번 안에 */
 SCR.ball={enter(){const d=['1','2','3','4','5','6','7','8','9'];for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}S.g={ans:d.slice(0,3).join(''),guess:'',hist:[],over:false,win:false}},
  draw(g){const G2=S.g;status(g);title(g,'숫자 야구',G2.hist.length+'/10');body(g,'#f4fff0');
   T(g,'세 숫자를 맞혀 봐! (1~9, 겹치지 않게)',W/2,TOP+TITLE+12,{size:8,color:'#44506a',align:'center'});
   for(let i=0;i<3;i++){g.fillStyle='#fff';rr(g,36+i*27,TOP+TITLE+18,22,24,3);g.fill();g.strokeStyle='#2f6fd6';g.lineWidth=1.2;g.stroke();T(g,G2.guess[i]||'',47+i*27,TOP+TITLE+36,{size:15,bold:true,color:'#16202e',align:'center'})}
   G2.hist.slice(-6).forEach((h,i)=>{const y=TOP+TITLE+56+i*12;T(g,h.g,30,y,{size:9.5,bold:true,color:'#16202e'});T(g,h.s+'S '+h.b+'B'+(h.s+h.b?'':' (아웃)'),W-30,y,{size:9.5,bold:true,color:h.s===3?'#e8402a':'#2f4a7a',align:'right'})});
   if(G2.over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,70,W,48);T(g,G2.win?'홈런! 정답 '+G2.ans:'아깝다! 정답 '+G2.ans,W/2,92,{size:12,bold:true,color:'#fff',align:'center'});T(g,'확인: 다시 · 취소: 나가기',W/2,108,{size:9,color:'#ffe7b0',align:'center'})}
   soft(g,'','','')},
  key(id){const G2=S.g;if(G2.over)return overKey(id,'ball');if(id==='clr'){if(G2.guess)G2.guess=G2.guess.slice(0,-1);else back();return true}
   if(/^[1-9]$/.test(id)&&!G2.guess.includes(id)){G2.guess+=id;if(G2.guess.length===3){let s=0,b=0;for(let i=0;i<3;i++){if(G2.guess[i]===G2.ans[i])s++;else if(G2.ans.includes(G2.guess[i]))b++}
    G2.hist.push({g:G2.guess,s,b});G2.guess='';if(s===3){G2.over=true;G2.win=true;best('ball',11-G2.hist.length);host.beep([1568,2093],200,.05,'square')}else if(G2.hist.length>=10)G2.over=true}}return true}};

 /* ---------- 달력, 계산기, 메모장 ---------- */
 SCR.cal={enter(){S.cal={m:0,d:30}},draw(g){const C=S.cal,M=MONTHS[C.m];status(g);title(g,'◀ '+M.y+'년 '+M.m+'월 ▶');body(g,'#fff');
   const cw=W/7,y0=TOP+TITLE+2;['일','월','화','수','목','금','토'].forEach((d,i)=>T(g,d,cw*i+cw/2,y0+9,{size:8,bold:true,color:i===0?'#e8402a':i===6?'#2f6fd6':'#44506a',align:'center'}));
   for(let d=1;d<=M.days;d++){const idx=M.first+d-1,cx=(idx%7)*cw,cy=y0+12+Math.floor(idx/7)*15,key=M.m+'-'+d,ev=EVENTS[key],sel=d===C.d;
    if(sel){g.fillStyle='#ffae4a';rr(g,cx+1,cy,cw-2,14,3);g.fill()}else if(M.m===5&&d===30){g.strokeStyle='#e8402a';g.lineWidth=1;g.strokeRect(cx+1.5,cy+.5,cw-3,13)}
    const red=idx%7===0||/쉬는 날/.test(ev||'');T(g,String(d),cx+cw/2,cy+10.5,{size:9,bold:sel,color:sel?'#fff':red?'#e8402a':idx%7===6?'#2f6fd6':'#16202e',align:'center'});if(ev&&!sel)circ(g,cx+cw-4,cy+3,1.5,'#f07a10')}
   const ev=EVENTS[M.m+'-'+C.d];R(g,0,H-BOT-24,W,24,'#eef3fb');T(g,M.m+'월 '+C.d+'일',5,H-BOT-14,{size:8.5,bold:true,color:'#2f4a7a'});T(g,ev||'일정 없음',5,H-BOT-3,{size:9,bold:!!ev,color:ev?'#e8402a':'#8a94a8',max:W-10});soft(g,'','','')},
  key(id){const C=S.cal;const mv=n=>{let d=C.d+n;while(d<1){if(C.m>0){C.m--;d+=MONTHS[C.m].days}else{d=1}}while(d>MONTHS[C.m].days){if(C.m<MONTHS.length-1){d-=MONTHS[C.m].days;C.m++}else d=MONTHS[C.m].days}C.d=d};
   if(id==='left')mv(-1);else if(id==='right')mv(1);else if(id==='up')mv(-7);else if(id==='down')mv(7);else if(id==='*'){C.m=0;C.d=1}else if(id==='#'){C.m=1;C.d=1}else if(id==='clr')back();return true}};
 SCR.calc={enter(){S.calc={cur:'0',acc:null,op:null,fresh:true}},draw(g){const K=S.calc;status(g);title(g,'계산기');body(g,'#dfe8d0');g.fillStyle='#b8e8a8';rr(g,8,TOP+TITLE+8,W-16,36,3);g.fill();
   T(g,K.acc!=null?String(K.acc)+' '+(K.op||''):'',W-12,TOP+TITLE+19,{size:8.5,color:'#3a5a2a',align:'right'});T(g,K.cur,W-12,TOP+TITLE+39,{size:17,bold:true,color:'#1d2a12',align:'right',max:W-24});
   ['* 연산 바꾸기 (+ - × ÷)','# 또는 확인: 계산','◀ 소수점 · 취소: 지우기'].forEach((s,i)=>T(g,s,W/2,TOP+TITLE+66+i*14,{size:8.5,color:'#44506a',align:'center'}));soft(g,'','=','')},
  key(id){const K=S.calc,OPS=['+','-','×','÷'];const calc=()=>{if(K.op==null||K.acc==null)return parseFloat(K.cur);const a=K.acc,b=parseFloat(K.cur);let r=K.op==='+'?a+b:K.op==='-'?a-b:K.op==='×'?a*b:b===0?NaN:a/b;return Math.round(r*1e8)/1e8};
   if(/^[0-9]$/.test(id)){if(K.fresh){K.cur=id;K.fresh=false}else if(K.cur.length<10)K.cur=K.cur==='0'?id:K.cur+id;return true}
   if(id==='left'){if(K.fresh){K.cur='0.';K.fresh=false}else if(!K.cur.includes('.'))K.cur+='.';return true}
   if(id==='*'){if(K.fresh&&K.op){K.op=OPS[(OPS.indexOf(K.op)+1)%4];return true}const v=calc();K.acc=Number.isFinite(v)?v:0;K.op='+';K.fresh=true;K.cur=String(K.acc);return true}
   if(id==='#'||id==='ok'||id==='nate'){const v=calc();K.cur=Number.isFinite(v)?String(v):'오류';K.acc=null;K.op=null;K.fresh=true;return true}
   if(id==='clr'){if(!K.fresh&&K.cur.length>1)K.cur=K.cur.slice(0,-1);else if(K.cur!=='0'||K.op){K.cur='0';K.acc=null;K.op=null;K.fresh=true}else back();return true}return true}};
 SCR.memo={items(){return[{label:'+ 새 메모 쓰기',bold:true,num:false},...D.memos.map(m=>({label:m.t,sub:m.time,num:false,m}))]},draw(g){status(g);title(g,'메모장',D.memos.length+'/10');list(g,this.items(),S.sel);soft(g,'지우기','열기','')},
  key(id){const it=this.items(),x=it[S.sel];if(id==='menu'&&x?.m){ask('이 메모를 지울까요?',()=>{D.memos=D.memos.filter(m=>m!==x.m);save();S.sel=0;pop('지웠어요')});return true}
   return listKey(id,it,x=>{if(!x.m&&D.memos.length>=10){pop('메모는 10개까지예요');return}go('memoEdit',x.m||null)})}};
 SCR.memoEdit={enter(){editorFor(120);if(S.arg)S.ed.setText(S.arg.t)},typing(){return'자판으로 바로 쓰기 · Enter 저장'},
  draw(g,t){status(g);title(g,S.arg?'메모 고치기':'새 메모');drawEditor(g,S.ed,TOP+TITLE,H-BOT-10,t,'메모');edHelp(g,S.ed,H-BOT-2.5);soft(g,S.ed.modeName(),'저장','')},
  key(id){const ed=S.ed;if(id==='menu'){ed.nextMode();return true}if(id==='nate'){go('phrases',{ed});return true}
   if(id==='ok'||id==='send'){const t=ed.text().trim();if(!t){back();return true}if(S.arg){S.arg.t=t;S.arg.time=nowStr()}else D.memos.unshift({t,time:nowStr()});save();back();pop('저장했어요',1000);return true}
   if(id==='clr'&&!ed.tokens.length){back();return true}if(id==='up'||id==='down')return true;if(ed.key(id))edChanged();return true}};

 /* ---------- 설정 ---------- */
 SCR.set={items(){const p=host.prefs;return[{label:'벨소리 방식',sub:{ring:'벨소리',vib:'진동',mute:'무음'}[D.alert]},{label:'키음',sub:p.keyTone?'켜짐':'꺼짐'},{label:'키음 크기',sub:'■'.repeat(p.keyVol)+'□'.repeat(5-p.keyVol)},{label:'슬라이드 소리',sub:p.slideTone?'켜짐':'꺼짐'},{label:'이번 달 요금',sub:billTotal().toLocaleString('ko-KR')+'원'},{label:'받은 문자 다 읽음'},{label:'휴대폰 정보'}]},
  draw(g){status(g);title(g,'설정');list(g,this.items(),S.sel);soft(g,'','바꾸기','')},
  key(id){const p=host.prefs,i=S.sel;if((id==='left'||id==='right')&&i===2){p.keyVol=clamp(p.keyVol+(id==='left'?-1:1),1,5);host.savePrefs();host.keyBeep('5');return true}
   return listKey(id,this.items(),(x,j)=>{if(j===0){D.alert={ring:'vib',vib:'mute',mute:'ring'}[D.alert];save();if(D.alert==='vib')host.buzz()}else if(j===1)p.keyTone=!p.keyTone;else if(j===2)p.keyVol=p.keyVol%5+1;else if(j===3)p.slideTone=!p.slideTone;
    else if(j===4)go('bill');else if(j===5){D.inbox.forEach(m=>m.read=true);save();syncLabel();pop('모두 읽음으로\n바꿨어요')}else pop('애니콜 슬라이드폰\n2006년 5월\n버전 A99',2200);host.savePrefs()})}};
 SCR.bill={draw(g){status(g);title(g,'이번 달 요금');body(g,'#fffef6');const b=D.bill,rows=[['문자 '+b.sms+'건',b.sms*PRICE.sms],['통화 '+b.sec+'초',Math.ceil(b.sec/10)*PRICE.callPer10],['NATE 데이터',b.data],['정보이용료',b.info]];
   rows.forEach(([a,v],i)=>{T(g,a,8,TOP+TITLE+18+i*16,{size:10,color:'#2a3446'});T(g,v.toLocaleString('ko-KR')+'원',W-8,TOP+TITLE+18+i*16,{size:10,bold:true,color:'#2a3446',align:'right'})});
   R(g,6,TOP+TITLE+80,W-12,1,'#999');T(g,'합계',8,TOP+TITLE+96,{size:11,bold:true,color:'#16202e'});const tot=billTotal();T(g,tot.toLocaleString('ko-KR')+'원',W-8,TOP+TITLE+96,{size:12,bold:true,color:tot>=10000?'#e8402a':'#16202e',align:'right'});
   T(g,'만 원이 넘으면 엄마한테 혼나요!',W/2,TOP+TITLE+116,{size:8.5,color:'#8a6a3a',align:'center'});soft(g,'','다음 달로','')},
  key(id){if(id==='ok'||id==='nate'){ask('다음 달로 넘길까요?\n(요금이 0원이 돼요)',()=>{D.bill={sms:0,sec:0,data:0,info:0};D.momWarned=false;save();pop('새 달이 시작됐어요')});return true}if(id==='clr'){back();return true}return true}};

 /* ---------- 몸체가 부르는 것 ---------- */
 function key(id){if(S.confirm){if(id==='ok'||id==='nate'||id==='send'){const f=S.confirm.yes;S.confirm=null;f()}else if(id==='clr'||id==='end')S.confirm=null;dirty();return}
  if(S.pop&&S.pop.modal){S.pop=null;dirty();return}if(S.pop)S.pop=null;
  if(id==='end'&&S.scr==='nate'&&NB){NB.exit(true);dirty();return}
  if(id==='end'&&S.scr!=='call'){S.dial='';home();return}
  const sc=cur();if(sc?.key)sc.key.call(sc,id,api);dirty()}
 function draw(g,t){S.dirty=false;const sc=cur();if(sc?.draw)sc.draw.call(sc,g,t,api);else{status(g);title(g,'준비 중');soft(g,'','','')}
  if(host.hintActive(t)){g.fillStyle='rgba(10,20,40,.85)';rr(g,12,104,W-24,30,5);g.fill();T(g,'슬라이드를 올려야',W/2,116,{size:9.5,bold:true,color:'#fff',align:'center'});T(g,'숫자를 누를 수 있어요',W/2,128,{size:9.5,bold:true,color:'#fff',align:'center'})}
  confirmBox(g);popup(g);S.blink=Math.floor(t/600)}
 function needs(t){let n=S.dirty;if(S.pop&&t>=S.pop.until){S.pop=null;n=true}if(S.scr==='idle'&&Math.floor(t/600)!==S.blink)n=true;if(host.hintActive(t)!==S.hinted){S.hinted=host.hintActive(t);n=true}
  if(S.ed&&Math.floor(t/500)!==S.edBlink){S.edBlink=Math.floor(t/500);n=true}
  const sc=cur();if(sc?.needs&&sc.needs.call(sc,t,api))n=true;if(S.call&&S.scr!=='call'&&SCR.call.needs.call(SCR.call,t,api))n=true;return n}
 function event(type,v){
  if(type==='poweroff'){
   if(S.call?.phase==='ring')decline(true);else if(S.call)hang();
   S.call=null;S.dial='';S.pop=null;S.ack=null;
   if(S.scr==='nate'&&NB)NB.exit(true);
   home();S.pop=null;
  }
  if(type==='slide'&&!v&&S.scr==='idle'&&S.dial)S.dial='';if(type==='hide'&&!S.call)stopTune();if(type==='show')syncLabel();dirty()}
 function ownsSound(id){const sc=cur();return!!(sc?.ownsSound&&sc.ownsSound(id))}
 /* ---------- NATE 브라우저(src/anycall-nate.js)에 주는 도구 ---------- */
 const kit={W,H,TOP,BOT,TITLE,R,T,grad,rr,circ,fit,wrap,fnt,clamp,ICON,host,D,now,save,charge,has,rings,allRings,ringById,playRing,stopTune,pop,ask,nowStr,
  NET,friends,placeOf,fakeNum,Editor,THEMES,allWalls,FREE_WALLS,GAMES,PRICE,EMO,status,soft,drawEditor,billTotal,edChanged,dirty,receive,
  setEditor(ed){S.ed=ed||null;afterNav();dirty()},
  leave(msg,toHome){if(toHome)home();else back();if(msg)pop(msg,2600)},
  goScreen:(scr,arg)=>go(scr,arg),
  pay(name,won){charge('info',won);D.payLog.unshift({name,won,time:nowStr()});D.payLog=D.payLog.slice(0,30);save()}};
 const NB=w.AnycallNate?.create?.(kit)||null;
 const api={W,H,data:D,state:S,get nate(){return NB},go,back,home,pop,call,receive,sendSms,unread,book,friends,rings,walls,draw,key,needs,event,save,ownsSound,onNet,billTotal,
  get photos(){return PH},get screen(){return S.scr},get dial(){return S.dial},get editor(){return S.ed},destroy(){unsub?.()}};
 syncLabel();
 return api}

w.AnycallLCD={version:'A101',THEMES,W,H,create,registerApp,apps:APPS,book:BOOK,phrases:PHRASES,Editor,composeJamo,fakeNum,placeOf};
})(window);
