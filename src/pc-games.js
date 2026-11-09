/* A95: PC방 온라인 게임 실행기.
   바탕 화면과 GAME STATION의 게임 아이콘을 누르면 런처가 뜬다. 패치 확인 → 로그인 → 서버 고르기 → (붐비면 대기열) → 게임 화면.
   진짜 게임을 베끼지 않고, 장르마다 우리 식으로 만든 작은 게임을 붙였다.
   전략(채널, 방 목록, 손빠르기 대결), RPG(사냥과 레벨 업, 강화), FPS(사격 훈련), 레이싱, 달리기, 물풍선 피하기, 링 밀어내기, 골프, 농구, 댄스.
   서버, 몬스터, 맵, 사람 이름은 모두 지어낸 것이다. 진행 기록은 saved.games[게임 id]에 남는다. 그림 파일과 소리는 쓰지 않는다. */
(function(w){'use strict';
const W=480,H=300,FONT='Dotum,Gulim,sans-serif';
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const won=n=>Number(n).toLocaleString('ko-KR');
const fmtTime=s=>{s=Math.max(0,s);const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(2)};
function text(g,s,x,y,col,al,size,thin){g.fillStyle=col||'#222';g.textAlign=al||'left';g.font=(thin?'':'bold ')+(size||13)+'px '+FONT;g.fillText(String(s),x,y)}
function rect(g,x,y,w0,h0,col){g.fillStyle=col;g.fillRect(x,y,w0,h0)}
function circ(g,x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,Math.max(.5,r),0,Math.PI*2);g.fill()}
function oval(g,x,y,rx,ry,col){g.fillStyle=col;g.beginPath();if(g.ellipse)g.ellipse(x,y,Math.max(.5,rx),Math.max(.5,ry),0,0,Math.PI*2);else g.arc(x,y,Math.max(.5,rx),0,Math.PI*2);g.fill()}
function seg(g,a,b,c,d,col,lw){g.strokeStyle=col;g.lineWidth=lw||2;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()}
function gauge(g,x,y,w0,h0,p,col,back){rect(g,x,y,w0,h0,back||'rgba(0,0,0,.5)');rect(g,x+1,y+1,Math.max(0,(w0-2)*clamp(p,0,1)),h0-2,col)}
function sky(g,top,bottom){const gr=g.createLinearGradient?g.createLinearGradient(0,0,0,H):null;if(gr){gr.addColorStop(0,top);gr.addColorStop(1,bottom);g.fillStyle=gr}else g.fillStyle=top;g.fillRect(0,0,W,H)}
function hudBar(g,left,right){rect(g,0,0,W,22,'rgba(0,0,0,.55)');text(g,left,8,16,'#fff');text(g,right,W-8,16,'#ffe27a','right')}
function eyes(g,x,y,gap){circ(g,x-(gap||5),y,2.4,'#111');circ(g,x+(gap||5),y,2.4,'#111')}

/* ---------- 장르와 게임별 설정 ---------- */
const GENRE={star:'rts',warcraft:'rts',diablo:'hunt',maple:'hunt',mabinogi:'hunt',lineage:'hunt',df:'hunt',wow:'hunt',sudden:'shoot',special:'shoot',gunz:'shoot',kart:'race',tales:'run',crazy:'bomb',getamped:'ring',pangya:'golf',freestyle:'hoop',audition:'dance'};
const MODE={rts:'채널 대화 · 방 참가 · 1:1 손빠르기 대결',hunt:'사냥터에서 몬스터 잡고 레벨 올리기 · 무기 강화',shoot:'30초 사격 훈련 · 헤드샷을 노려라',race:'1,000m 타임 어택 · 부스터는 아껴서',run:'동화 숲 800m 달리기 · 점프 타이밍',bomb:'물풍선 피하기 · 오래 버티기',ring:'링 밖으로 밀어내기 한판 승부',golf:'니어 핀 챌린지 5홀',hoop:'30초 슛 대결',dance:'방향키 댄스 10마디'};
const COMMON_NOTICE=['[공지] 계정을 친구에게 빌려주지 마세요. 아이템이 사라져도 복구가 어렵습니다.','[공지] 현금 거래는 사기 위험이 큽니다. 운영자는 절대 비밀번호를 묻지 않습니다.','[PC방] 이 PC방은 프리미엄 가맹점입니다. 경험치와 보상이 조금 더 붙습니다.'];
const INFO={
 star:{servers:[['아시아','혼잡'],['미국 동부','원활'],['미국 서부','원활'],['유럽','원활']],notice:['[채널] 비매너 채팅은 신고해 주세요','[대회] 동네 PC방 리그 예선 접수 중 (6월 3일 토요일)'],field:'배틀넷 채널',wait:'배틀넷에 접속하는 중...',
  rooms:[['1:1 빠른 무한 초보만 (고수 사절)','빠른 무한','1/2','duel',150],['3:3 팀플 ㄱㄱ 매너 필수','섬맵','5/6','kick'],['유즈맵 랜덤 디펜스','디펜스','7/8','full'],['1:1 래더맵 연습해요','래더','1/2','duel',210],['헌터 4:4 아는 사람만','헌터','6/8','friend'],['고수만 1:1 (APM 200 이상)','빠른 무한','1/2','duel',260],['뿌요 같이 해요 ^^','퍼즐','3/4','leave'],['2:2 동네 사람끼리','팀플','3/4','ping']],
  chat:['ㄱㄱ','1:1 하실 분~','빠무 ㄱ?','님 몇 승임?','저그 너무 세요 ㅡㅡ','방제 보고 들어오세요','디펜스 하실 분 구함','ㅎㅇ','방가방가','부대 지정 안 하면 손이 느려요','오늘 리그 결승 봄?','ㅋㅋㅋ 질럿 러시 당함','gg','매너 겜 합시다']},
 warcraft:{servers:[['아시아','혼잡'],['미국 서부','원활'],['유럽','원활']],notice:['[채널] 사용자 제작 맵은 출처를 확인하고 받으세요','[대회] 동네 PC방 팀 대항전 참가 신청'],field:'배틀넷 채널',wait:'배틀넷에 접속하는 중...',
  rooms:[['카오스 5:5 초보 환영','카오스','8/10','kick'],['1:1 휴먼 대 오크 연습','래더','1/2','duel',170],['타워 디펜스 같이 해요','디펜스','5/8','full'],['1:1 고수만 오세요','래더','1/2','duel',240],['도타 아는 사람만','도타','9/10','friend'],['RPG 맵 같이 키워요','RPG','2/4','leave'],['2:2 언데드 연습','팀플','3/4','ping'],['1:1 나엘 초보 (매너)','래더','1/2','duel',130]],
  chat:['카오스 하실 분','ㄱㄱ 빨리요','영웅 뭐 함?','아이템 순서 알려 주세요','ㅎㅇㅎㅇ','방 터졌네 ㅡㅡ','렉 걸려요','디펜스 고고','팀킬 하지 마세요','오크 너무 세다','gg wp','도타 맵 버전 뭐예요?']},
 diablo:{dark:true,deco:'tomb',ground:'#3a3228',servers:[['아시아 1','혼잡'],['아시아 2','원활'],['유럽','원활']],notice:['[래더] 새 시즌 시작 안내','[주의] 아이템 복사 버그 이용자는 계정이 정지됩니다'],field:'어두운 묘지',
  sky:['#1e1a26','#3b3328'],mobs:[['떠도는 해골','skull','#e8e2d0',30],['굶주린 박쥐','bat','#6b5a7a',26],['묘지 도깨비불','wisp','#7fd0ff',42],['저주받은 망령','wisp','#d8b2ff',60],['돌 수호자','golem','#8a6d5a',90]],money:'골드',
  chat:['카우방 같이 가실 분 ㅋㅋ','룬 팝니다','파티 초대 좀요','앵벌이 중','득템!!!!','님 렙 몇?','물약 좀 주실 분','바바 키우는 중','지옥 난이도 무섭다','템 떨어지면 줍지 마세요 ㅡㅡ']},
 maple:{deco:'tree',ground:'#6aaa3a',servers:[['새싹','포화'],['단풍','혼잡'],['하늘','원활'],['바다','원활']],notice:['[이벤트] 5월 가정의 달 사냥 이벤트 (5월 31일까지)','[점검] 6월 1일(목) 오전 정기 점검 안내'],field:'햇살 언덕',
  sky:['#9fd6ff','#7cc35a'],mobs:[['말랑 젤리','blob','#7ad36b',20],['꼬마 돼지','beast','#f2a3b3',34],['구름 양','blob','#ffffff',46],['나무 정령','golem','#a0774a',62],['장난꾸러기 도깨비','goblin','#e07b7b',85]],money:'골드',
  chat:['ㅍㅌ 구해요~ 2명','렙업 축하드려요 ^^','물약 사세요~ 싸게 팜','님 직업 뭐예요?','전직 어디서 함?','사냥터 자리 있음? ㅠㅠ','하이루 ^^','길드원 모집 (매너인)','친추해요~','렙업!!! ㅊㅋ 좀','점프 연타 중','PC방이라 경험치 잘 오른다']},
 mabinogi:{deco:'fence',ground:'#7ab04a',servers:[['양떼','혼잡'],['물레방아','원활'],['풍차','원활']],notice:['[이벤트] 음악 연주 대회 참가 신청','[안내] 생활 기술 수련 이벤트 진행 중'],field:'목장 언덕',
  sky:['#bfe6ff','#8fc270'],mobs:[['여우','beast','#e08a3a',26],['회색 늑대','beast','#8b8f99',44],['숲 거미','spider','#3d3340',38],['갈색 곰','beast','#7a5232',92],['떠도는 도깨비','goblin','#7d6bb0',70]],money:'골드',
  chat:['양털 깎으러 가요~','같이 모닥불 쬐실 분','류트 연주 들어 주세요 ♪','늑대 무서워요 ㅠㅠ','요리 수련 중','방금 곰한테 쓰러짐','ㅎㅇ 반가워요','파티 해요~']},
 lineage:{deco:'castle',ground:'#6a7a42',servers:[['붉은달','포화'],['검은숲','혼잡'],['은빛강','원활']],notice:['[공성] 이번 주 토요일 밤 공성전 안내','[주의] 강화 주문서 사기에 주의하세요'],field:'고성 앞 들판',
  sky:['#cdb98a','#7b8a52'],mobs:[['오크 전사','goblin','#6f8f3f',48],['해골 궁수','skull','#ddd6c2',42],['늪지 도마뱀','beast','#4f7d5b',62],['돌 골렘','golem','#8d8d8d',110],['검은 기사','golem','#3a3a48',140]],money:'아덴',
  chat:['혈맹원 모집합니다','공성 언제임?','+9 무기 팝니다 (진짜)','강화하다 증발함 ㅠㅠ','파티 사냥 ㄱ?','물약 공구해요','님 혈맹 어디?','오늘 사냥 잘 된다','버프 좀요','사냥터 비켜 주세요 ㅡㅡ']},
 df:{dark:true,deco:'torch',ground:'#3a3026',servers:[['카인','혼잡'],['디레지에','원활']],notice:['[업데이트] 새 던전 오픈 기념 이벤트','[안내] 피로도는 매일 아침 초기화됩니다'],field:'어둠의 숲 던전',
  sky:['#3a4a5a','#4a3a2a'],mobs:[['꼬마 고블린','goblin','#7aa64a',28],['광전사 고블린','goblin','#a35b3a',46],['그림자 박쥐','bat','#4b4060',36],['거대 멧돼지','beast','#7a4a3a',80],['석상 기사','golem','#9a9aa8',120]],money:'골드',
  chat:['파티 구해요 던전 ㄱㄱ','콤보 몇 개 나옴?','피로도 다 씀 ㅠㅠ','님 직업 뭐?','장비 강화 성공!!','같이 가요~','보스 패턴 아시는 분','ㅎㅇ']},
 wow:{deco:'tree',ground:'#3f5a32',servers:[['푸른바다','포화'],['붉은노을','혼잡'],['은빛달','원활']],notice:['[안내] 레이드 일정은 길드 게시판을 확인하세요','[주의] 계정 정보를 묻는 귓속말은 무시하세요'],field:'안개 숲',
  sky:['#7fa8c8','#3f6b3a'],mobs:[['숲 늑대','beast','#7c7f87',40],['멧돼지','beast','#8a5a3a',50],['숲 거미','spider','#4a3a4a',46],['안개 망령','wisp','#cfe8ff',72],['바위 거인','golem','#8a8070',120]],money:'골드',
  chat:['인던 파티 구합니다 탱커 구함','퀘스트 같이 하실 분','길드원 모집','님 진영 어디?','탈것 언제 사지 ㅠㅠ','버프 감사요','렙 60 찍었다!!','경매장 비싸다']},
 sudden:{servers:[['1채널','혼잡'],['2채널','원활'],['클랜 채널','원활']],notice:['[이벤트] 헤드샷 왕 이벤트 진행 중','[주의] 불법 프로그램 사용자는 영구 정지됩니다'],field:'창고 훈련장',sky:['#5d6266','#3c3a36'],
  chat:['5:5 ㄱㄱ','클랜원 구합니다','헤드 ㄷㄷ','창고맵 ㄱ?','핵 아님 ㅡㅡ','님 계급 뭐임?','팀킬 하지 마세요','ㅋㅋㅋ 칼전 ㄱ','저격 금지 방']},
 special:{servers:[['1채널','혼잡'],['2채널','원활'],['초보 채널','원활']],notice:['[이벤트] 팀 대전 승리 이벤트','[안내] 초보 채널은 낮은 계급만 들어갈 수 있습니다'],field:'사막 기지',sky:['#e8c890','#a8875a'],
  chat:['팀전 하실 분','폭파 미션 ㄱㄱ','엄호 좀요','님 계급 어디까지?','저 이병임 ㅠㅠ','진급했다!!','매너 겜 해요']},
 gunz:{servers:[['1채널','원활'],['2채널','원활']],notice:['[이벤트] 칼전 대회 참가 신청','[안내] 버그 이용은 신고해 주세요'],field:'성벽 훈련장',sky:['#7a8aa8','#4a4a5a'],
  chat:['칼전 ㄱ?','벽 타기 연습 중','ㅋㅋㅋ 날아다님','1:1 하실 분','님 무기 뭐 씀?']},
 kart:{servers:[['초보 채널','혼잡'],['자유 채널','원활'],['고수 채널','원활']],notice:['[이벤트] 타임 어택 기록 도전 이벤트','[안내] 드리프트는 방향키와 Shift를 같이!'],field:'동네 한 바퀴 코스',
  chat:['스피드전 ㄱㄱ','아이템전 하실 분','부스터 아껴요 ㅋㅋ','님 기록 몇 초?','바나나 맞았다 ㅠㅠ','1등 했다!!','팀전 고고']},
 tales:{servers:[['동화 채널','혼잡'],['자유 채널','원활']],notice:['[이벤트] 동화 숲 달리기 이벤트','[안내] 점프는 Space 키, 장애물에 걸리면 느려집니다'],field:'동화 숲 코스',
  chat:['달리기 ㄱㄱ','점프 타이밍 어렵다','1등 했당 ^^','같이 뛰어요~','님 캐릭터 귀엽다']},
 crazy:{servers:[['1채널','혼잡'],['2채널','원활'],['초보 채널','원활']],notice:['[이벤트] 물풍선 대결 이벤트','[안내] 바늘 아이템을 쓰면 물방울에서 빠져나올 수 있어요'],field:'마을 놀이터 맵',
  chat:['팀전 ㄱㄱ','바늘 좀 주세요','ㅋㅋㅋ 갇혔다','물풍선 왕 나야 나','하이루~','신발 먹었다!']},
 getamped:{servers:[['1채널','원활'],['2채널','원활']],notice:['[이벤트] 액세서리 뽑기 이벤트','[안내] 링 밖으로 밀리면 패배합니다'],field:'옥상 링',
  chat:['1:1 ㄱㄱ','콤보 연습 중','님 액세서리 멋있다','ㅋㅋ 링아웃','한 판 더!']},
 pangya:{servers:[['바람 채널','원활'],['초보 채널','원활']],notice:['[이벤트] 니어 핀 이벤트 (5월 31일까지)','[안내] 바람 방향을 보고 화살표 키로 조준하세요'],field:'푸른 섬 코스',
  chat:['같이 치실 분~','나이스 샷!','바람 장난 아님','핀 2미터 붙임 ㅋㅋ','홀인원 해 봤어요?']},
 freestyle:{servers:[['1채널','혼잡'],['2채널','원활']],notice:['[이벤트] 3점 슛 왕 이벤트','[안내] 초록 칸에서 손을 떼면 골인!'],field:'동네 길거리 코트',
  chat:['3:3 ㄱㄱ','패스 좀 해요 ㅡㅡ','덩크 멋있다','님 포지션 뭐임?','한 판 더~']},
 audition:{servers:[['1채널','포화'],['2채널','혼잡'],['커플 채널','원활']],notice:['[이벤트] 커플 댄스 이벤트','[안내] 방향키를 다 누르고 박자에 맞춰 Space!'],field:'댄스 클럽',
  chat:['퍼펙트 ㄷㄷ','커플 하실 분~','8박 어려워요 ㅠㅠ','님 옷 이쁘다','방장 노래 바꿔 주세요','ㅋㅋ 미스 났다','하이루~']}
};
const BOT_NICKS=['하늘별','짱돌123','초보입니다','동네고수','라면먹고갈래','쭈니','아이스크림','파란하늘','붉은악마','떡볶이왕','민트초코','달려라','별사탕','나는야전설','방과후','학원가기싫어'];
const RANKS=[[0,'훈련병'],[1000,'이병'],[3000,'일병'],[6000,'상병'],[10000,'병장'],[15000,'하사'],[22000,'중사'],[30000,'상사'],[40000,'원사'],[52000,'소위'],[66000,'중위'],[82000,'대위'],[100000,'소령']];
const rankOf=exp=>{let r=RANKS[0][1];for(const [n,t] of RANKS)if(exp>=n)r=t;return r};
const apmTitle=a=>a>=300?'손이 안 보임':a>=200?'프로게이머 연습생':a>=130?'고수':a>=70?'중수':'초보 (마우스 처음 잡아 봄)';

/* ---------- 캔버스 실행기: 준비 → 진행 → 끝 ---------- */
function runner(host,E,def,opt){
 opt=opt||{};const cv=E('canvas','pg-canvas');cv.width=W;cv.height=H;cv.tabIndex=0;cv.setAttribute('aria-label',(def.title||'게임')+' 화면');host.append(cv);
 const g=cv.getContext?cv.getContext('2d'):null;
 let phase='ready',raf=0,last=0,stopped=false,lines=null,score=0;
 const env={over(sc,ls){if(phase!=='play')return;phase='over';score=sc;lines=ls||null;opt.onOver&&opt.onOver(sc)},phase:()=>phase};
 const game=def.init(env);game.reset();
 const at=e=>{const r=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0,width:W,height:H};return{x:(e.clientX-r.left)*W/(r.width||W),y:(e.clientY-r.top)*H/(r.height||H)}};
 const begin=()=>{game.reset();phase='play';last=0;cv.focus&&cv.focus()};
 cv.addEventListener('pointerdown',e=>{e.preventDefault&&e.preventDefault();cv.focus&&cv.focus();if(phase!=='play'){if(!def.noClickStart||phase==='over')begin();return}const p=at(e);game.down&&game.down(p.x,p.y,e.button)});
 cv.addEventListener('pointermove',e=>{if(phase==='play'&&game.move){const p=at(e);game.move(p.x,p.y)}});
 cv.addEventListener('pointerup',e=>{if(phase==='play'&&game.up){const p=at(e);game.up(p.x,p.y)}});
 cv.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault()});
 const keyName=e=>e.key===' '||e.code==='Space'?' ':e.key;
 cv.addEventListener('keydown',e=>{const k=keyName(e);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)){e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation()}if(k==='Escape')return;if(phase!=='play'){if(k==='Enter'||k===' ')begin();return}if(e.repeat&&!def.repeatKeys)return;game.key&&game.key(k,true)});
 cv.addEventListener('keyup',e=>{if(phase==='play'&&game.key)game.key(keyName(e),false)});
 function overlay(){if(!g||phase==='play')return;rect(g,0,0,W,H,'rgba(0,0,0,.74)');text(g,def.title,W/2,92,'#ffe27a','center',24);
  const ls=phase==='over'?(lines||['끝! 점수 '+score]):def.help||[];ls.forEach((t,i)=>text(g,t,W/2,132+i*24,i===0&&phase==='over'?'#fff':'#e6eef8','center',i===0&&phase==='over'?17:13));
  text(g,phase==='over'?'화면을 클릭하면 다시 시작':'화면을 클릭하면 시작',W/2,H-34,'#9fe0ff','center',14)}
 function step(dt){if(stopped)return;if(phase==='play')game.update(dt);if(g){game.draw(g);overlay()}}
 const stop=()=>{stopped=true;if(raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(raf)};
 /* 창을 내려 두면(최소화) 게임도 멈춘다. 사냥터에서 자리를 비웠다가 죽는 일이 없게. */
 const frame=ts=>{if(stopped)return;if(cv.isConnected===false){stop();return}if(cv.offsetParent===null){last=0;raf=w.requestAnimationFrame(frame);return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;step(dt);raf=w.requestAnimationFrame(frame)};
 if(w.requestAnimationFrame)raf=w.requestAnimationFrame(frame);else step(0);
 return{stop,step,begin,phase:()=>phase,game,canvas:cv,state:()=>game.state?game.state():{},score:()=>score}}

/* ---------- 그림 조각 ---------- */
function hero(g,x0,y0,col,swing,hair,sc){if(!g.save)return;g.save();g.translate(x0,y0);g.scale(sc||1.35,sc||1.35);const x=0,y=0;rect(g,x-6,y-8,5,8,'#333');rect(g,x+1,y-8,5,8,'#333');rect(g,x-8,y-25,16,18,col||'#3a6fd8');rect(g,x-8,y-12,16,4,'#5a3a1a');circ(g,x,y-32,9,'#ffdcb8');rect(g,x-9,y-42,18,6,hair||'#4a3020');rect(g,x-9,y-40,4,8,hair||'#4a3020');circ(g,x+3,y-33,1.6,'#111');
 g.save();g.translate(x+9,y-18);g.rotate(swing?-.2:-1.1);rect(g,-1.5,-26,3,26,'#e8e8f0');rect(g,-5,-2,10,3,'#8a5a2a');g.restore();g.restore()}
function scenery(g,T,t){sky(g,T.sky[0],T.sky[1]);const dark=!!T.dark;
 if(dark){circ(g,404,62,20,'rgba(255,248,214,.9)');circ(g,396,56,20,T.sky[0])}else for(const [x,y,s] of [[60,58,1],[250,40,1.3],[400,76,.9]]){const cx=((x+t*6)%560)-40;oval(g,cx,y,28*s,11*s,'rgba(255,255,255,.85)');oval(g,cx+16*s,y-7*s,18*s,10*s,'rgba(255,255,255,.85)')}
 g.fillStyle=dark?'rgba(0,0,0,.35)':'rgba(255,255,255,.22)';g.beginPath();g.moveTo(0,262);for(let x=0;x<=W;x+=30)g.lineTo(x,196-Math.sin(x*.018)*24-(x*13%23));g.lineTo(W,262);g.closePath();g.fill();
 for(const x of [150,300,440]){const d=T.deco;if(d==='tree'){rect(g,x-4,212,8,50,'#6a4a2a');circ(g,x,204,20,'#4f9a3f');circ(g,x-12,214,14,'#5aab4a');circ(g,x+12,214,14,'#5aab4a')}
  else if(d==='tomb'){rect(g,x-12,236,24,26,'#6a6a74');circ(g,x,236,12,'#6a6a74');rect(g,x-2,230,4,16,'#3a3a44');rect(g,x-7,236,14,4,'#3a3a44')}
  else if(d==='castle'){rect(g,x-26,200,52,62,'rgba(80,70,60,.55)');for(let i=0;i<4;i++)rect(g,x-26+i*14,192,8,8,'rgba(80,70,60,.55)');rect(g,x-7,236,14,26,'rgba(30,20,10,.55)')}
  else if(d==='torch'){rect(g,x-2,214,4,48,'#5a4030');circ(g,x,210+Math.sin(t*9+x)*1.5,6,'#ffb02a');circ(g,x,208,3,'#fff3a0')}
  else if(d==='fence'){rect(g,x-30,238,60,4,'#b08050');rect(g,x-30,248,60,4,'#b08050');for(let i=0;i<4;i++)rect(g,x-28+i*18,232,5,30,'#8a6040')}}
 rect(g,0,262,W,38,T.ground||'#5a8a3a');rect(g,0,262,W,4,'rgba(255,255,255,.18)');for(let i=0;i<12;i++)rect(g,(i*43+7)%W,270+(i%3)*8,10,3,'rgba(0,0,0,.15)')}
function drawMob(g,m){const x=m.x,y=m.y+Math.sin(m.bob)*2,c=m.hit>0?'#ffffff':m.col;
 if(m.type==='blob'){oval(g,x,y-13,21,15,c);oval(g,x-6,y-19,5,3,'rgba(255,255,255,.6)');eyes(g,x,y-14,6)}
 else if(m.type==='bat'){const f=Math.sin(m.bob*3)*6;g.fillStyle=c;g.beginPath();g.moveTo(x,y-34);g.lineTo(x-26,y-40-f);g.lineTo(x-14,y-28);g.lineTo(x,y-26);g.lineTo(x+14,y-28);g.lineTo(x+26,y-40-f);g.closePath();g.fill();circ(g,x,y-31,8,c);circ(g,x-3,y-32,1.8,'#ff3b3b');circ(g,x+3,y-32,1.8,'#ff3b3b')}
 else if(m.type==='beast'){oval(g,x,y-14,22,12,c);circ(g,x+m.face*18,y-20,9,c);rect(g,x-14,y-6,5,7,c);rect(g,x+8,y-6,5,7,c);g.fillStyle=c;g.beginPath();g.moveTo(x+m.face*14,y-26);g.lineTo(x+m.face*17,y-35);g.lineTo(x+m.face*21,y-27);g.fill();circ(g,x+m.face*21,y-21,2,'#111')}
 else if(m.type==='skull'){seg(g,x,y-22,x,y-4,c,3);seg(g,x-9,y-16,x+9,y-16,c,3);seg(g,x,y-4,x-7,y+1,c,3);seg(g,x,y-4,x+7,y+1,c,3);circ(g,x,y-31,10,c);circ(g,x-4,y-32,2.6,'#111');circ(g,x+4,y-32,2.6,'#111');rect(g,x-3,y-25,6,2,'#111')}
 else if(m.type==='golem'){rect(g,x-15,y-34,30,26,c);rect(g,x-10,y-46,20,13,c);rect(g,x-22,y-32,7,18,c);rect(g,x+15,y-32,7,18,c);rect(g,x-12,y-8,9,8,c);rect(g,x+3,y-8,9,8,c);rect(g,x-6,y-42,4,3,'#ffd23f');rect(g,x+2,y-42,4,3,'#ffd23f')}
 else if(m.type==='wisp'){const a=g.globalAlpha;g.globalAlpha=.35;circ(g,x,y-26,19,c);g.globalAlpha=a;circ(g,x,y-26,11,c);eyes(g,x,y-27,4)}
 else if(m.type==='goblin'){rect(g,x-7,y-9,5,9,'#3a2a1a');rect(g,x+2,y-9,5,9,'#3a2a1a');rect(g,x-9,y-24,18,16,'#6a4a2a');circ(g,x,y-31,9,c);g.fillStyle=c;g.beginPath();g.moveTo(x-8,y-33);g.lineTo(x-17,y-38);g.lineTo(x-7,y-28);g.fill();g.beginPath();g.moveTo(x+8,y-33);g.lineTo(x+17,y-38);g.lineTo(x+7,y-28);g.fill();circ(g,x-3,y-32,1.8,'#ff3b3b');circ(g,x+3,y-32,1.8,'#ff3b3b')}
 else if(m.type==='spider'){for(let i=0;i<4;i++){seg(g,x,y-12,x-24+i*3,y-2-i*5,c,2);seg(g,x,y-12,x+24-i*3,y-2-i*5,c,2)}oval(g,x,y-14,14,10,c);circ(g,x+m.face*10,y-17,6,c);circ(g,x+m.face*12,y-18,1.5,'#ff3b3b')}
 else oval(g,x,y-13,18,13,c);
 gauge(g,x-20,y-58,40,5,m.hp/m.max,'#ff4d4d');text(g,'Lv.'+m.lv+' '+m.name,x,y-62,'#fff','center',10)}

/* ---------- 1. RPG: 사냥 ---------- */
function huntDef(T,S,api){
 const need=()=>12+S.lv*S.lv*6,atk=()=>6+S.lv*3+S.wp*4,maxHp=()=>60+S.lv*18;
 return{title:T.field+' 사냥',help:['몬스터를 클릭해서 공격하세요. 쓰러뜨리면 경험치와 '+T.money+'!','체력이 줄면 물약(숫자 1 키 또는 오른쪽 단추)','레벨이 오를수록 강한 몬스터가 나옵니다'],init(env){
  let mobs=[],fx=[],hp=0,hpMax=0,tAtk=0,spawn=0,flash=0,swing=0,clock=0;
  const mk=()=>{const top=Math.min(T.mobs.length-1,Math.floor((S.lv-1)/3)),tier=clamp(top-(Math.random()<.45?1:0),0,T.mobs.length-1),m=T.mobs[tier],lv=Math.max(1,S.lv+Math.round(rnd(-1,1))),hv=Math.round(m[3]*(1+lv*.22));return{name:m[0],type:m[1],col:m[2],lv,hp:hv,max:hv,x:rnd(240,440),y:rnd(190,262),vx:rnd(-22,22),hit:0,face:-1,bob:rnd(0,6)}};
  const float=(x,y,s,col)=>fx.push({x,y,t:1,s,col});
  function kill(m){mobs=mobs.filter(x=>x!==m);S.kills++;const ex=Math.round(m.lv*5+m.max/6),gold=Math.round(m.lv*6+rnd(0,12));S.exp+=ex;S.gold+=gold;float(m.x,m.y-50,'+'+ex+' EXP','#9fe0ff');
   if(Math.random()<.22){S.pot++;float(m.x,m.y-66,'물약 획득','#ffb3c1')}
   if(Math.random()<.07&&S.items.length<8){const it=pick(['낡은 검','가죽 모자','반짝이는 반지','튼튼한 장화','수상한 목걸이','초록 망토','은빛 방패'])+(Math.random()<.3?' (희귀)':'');S.items.push(it);float(m.x,m.y-82,'득템! '+it,'#ffd23f');api.say('system','[알림] '+it+'을(를) 얻었습니다!')}
   while(S.exp>=need()){S.exp-=need();S.lv++;hpMax=maxHp();hp=hpMax;flash=2;api.say('system','[알림] 레벨 업! Lv.'+S.lv+' 이 되었습니다.');api.cheer()}
   api.save();api.refresh()}
  return{
   reset(){mobs=[mk(),mk()];fx=[];hpMax=maxHp();hp=hpMax;tAtk=2.2;spawn=1;flash=0;swing=0},
   update(dt){clock+=dt;for(const m of mobs){m.x+=m.vx*dt;if(m.x<215||m.x>455){m.vx*=-1;m.x=clamp(m.x,215,455)}m.face=m.vx>0?1:-1;m.bob+=dt*4;if(m.hit>0)m.hit-=dt;if(Math.random()<dt*.45)m.vx=rnd(-24,24)}
    spawn-=dt;if(spawn<=0){if(mobs.length<3)mobs.push(mk());spawn=rnd(1.4,2.8)}
    tAtk-=dt;if(tAtk<=0&&mobs.length){const m=pick(mobs),d=Math.max(1,Math.round(m.lv*2.4+rnd(0,4)));hp-=d;float(84,170,'-'+d,'#ff6b6b');tAtk=rnd(1.5,2.5);if(hp<=0){hp=0;const lost=Math.floor(S.exp*.05);S.exp-=lost;S.deaths++;api.save();api.refresh();env.over(0,['사망했습니다...','경험치를 '+lost+' 잃었습니다. 물약을 꼭 챙기세요!','마을에서 다시 시작합니다'])}}
    for(const f of fx){f.t-=dt;f.y-=dt*30}fx=fx.filter(f=>f.t>0);if(flash>0)flash-=dt;if(swing>0)swing-=dt},
   down(x,y){const m=mobs.slice().reverse().find(m=>Math.abs(x-m.x)<28&&y>m.y-52&&y<m.y+8);swing=.12;if(!m)return;const crit=Math.random()<.12,d=Math.round(atk()*rnd(.85,1.15)*(crit?2:1));m.hp-=d;m.hit=.12;float(m.x,m.y-40,(crit?'크리티컬! ':'')+d,crit?'#ffd23f':'#ffffff');if(m.hp<=0)kill(m)},
   key(k,down){if(down&&k==='1')this.potion()},
   potion(){if(S.pot<=0){api.say('system','[알림] 물약이 없습니다. 상점에서 사 오세요.');return false}if(hp>=hpMax)return false;S.pot--;hp=Math.min(hpMax,hp+Math.round(hpMax*.5));float(84,150,'+HP','#7cff8a');api.save();api.refresh();return true},
   draw(g){scenery(g,T,clock);
    hero(g,84,264,'#3a6fd8',swing>0);for(const m of mobs)drawMob(g,m);
    for(const f of fx)text(g,f.s,f.x,f.y,f.col,'center',f.s.length>8?12:15);
    rect(g,0,0,W,40,'rgba(0,0,0,.55)');text(g,'Lv.'+S.lv+' '+api.name(),8,15,'#fff');gauge(g,8,21,150,8,hp/hpMax,'#ff5b5b');text(g,'HP '+Math.ceil(hp)+'/'+hpMax,162,29,'#ffd0d0','left',10);
    gauge(g,8,31,150,6,S.exp/need(),'#ffd23f');text(g,'EXP '+Math.floor(S.exp/need()*100)+'%',162,38,'#fff3b0','left',10);text(g,won(S.gold)+' '+T.money+' · 물약 '+S.pot+'개',W-8,15,'#ffe27a','right');text(g,'무기 +'+S.wp+' · 잡은 몬스터 '+won(S.kills),W-8,31,'#cfe','right',11);
    if(flash>0)text(g,'LEVEL UP!',W/2,120,flash%0.4<.2?'#ffd23f':'#fff','center',28)},
   state(){return{lv:S.lv,exp:S.exp,hp,hpMax,mobs:mobs.map(m=>({x:m.x,y:m.y-20,hp:m.hp,name:m.name})),pot:S.pot,gold:S.gold}}}}}}

/* ---------- 2. FPS: 사격 훈련 ---------- */
function shootDef(id,S,api){
 const pal={sudden:['#5d6266','#3c3a36','#8a7a5a'],special:['#e8c890','#a8875a','#a0703a'],gunz:['#7a8aa8','#4a4a5a','#6a6a7a']}[id]||['#666','#444','#876'];
 const SPOTS=[[60,236],[140,196],[236,226],[330,190],[420,238],[190,150],[300,140]];
 return{title:'사격 훈련장',help:['나타나는 적 표적을 클릭! 머리는 헤드샷 100점, 몸은 50점','하얀 표적은 아군입니다. 쏘면 감점!','총알 30발, R 키로 재장전 · 30초'],init(env){
  let tg,t,score,shots,hits,heads,ammo,reload,mx,my,fx,spawn,flash;
  const finish=()=>{const acc=shots?Math.round(hits/shots*100):0,before=rankOf(S.exp);S.exp+=Math.max(0,score);S.plays++;const isBest=score>S.best;if(isBest)S.best=score;const after=rankOf(S.exp);api.save();api.refresh();
   env.over(score,['훈련 끝! 점수 '+won(score)+(isBest?' (최고 기록!)':''),'명중률 '+acc+'% · 헤드샷 '+heads+'번',after!==before?'진급을 축하합니다! '+before+' → '+after:'현재 계급 '+after+' · 다음 진급까지 힘내세요'])};
  return{
   reset(){tg=[];t=30;score=0;shots=0;hits=0;heads=0;ammo=30;reload=0;fx=[];spawn=.4;mx=W/2;my=H/2;flash=0},
   update(dt){t-=dt;if(t<=0){t=0;finish();return}if(reload>0){reload-=dt;if(reload<=0)ammo=30}if(flash>0)flash-=dt;
    spawn-=dt;if(spawn<=0&&tg.length<3){const free=SPOTS.filter(s=>!tg.some(x=>x.s===s));const s=pick(free);tg.push({s,x:s[0],y:s[1],rise:0,life:rnd(1,1.7)-(30-t)*.012,ally:Math.random()<.13});spawn=rnd(.35,.8)}
    for(const x of tg){x.rise=Math.min(1,x.rise+dt*6);x.life-=dt}tg=tg.filter(x=>x.life>0);for(const f of fx){f.t-=dt;f.y-=dt*24}fx=fx.filter(f=>f.t>0)},
   move(x,y){mx=x;my=y},
   down(x,y){mx=x;my=y;if(reload>0)return;if(ammo<=0){reload=1.2;return}ammo--;shots++;flash=.06;
    const hit=tg.find(o=>{const top=o.y-56*o.rise;return x>o.x-13&&x<o.x+13&&y>top&&y<o.y-4});
    if(hit){const head=Math.hypot(x-hit.x,y-(hit.y-56*hit.rise+9))<9;tg=tg.filter(o=>o!==hit);if(hit.ally){score-=100;fx.push({x,y,t:.9,s:'아군 사격! -100',col:'#9fd0ff'})}else{hits++;if(head){heads++;score+=100;fx.push({x,y,t:.9,s:'헤드샷! +100',col:'#ffd23f'})}else{score+=50;fx.push({x,y,t:.8,s:'+50',col:'#fff'})}}}
    else fx.push({x,y,t:.4,s:'빗나감',col:'#ccc'});if(ammo<=0)reload=1.2},
   key(k,down){if(down&&(k==='r'||k==='R'||k==='ㄱ')&&reload<=0&&ammo<30)reload=1.2},
   draw(g){sky(g,pal[0],pal[1]);rect(g,0,244,W,56,'rgba(0,0,0,.25)');
    for(const o of tg){const top=o.y-56*o.rise;rect(g,o.x-12,top+18,24,o.y-top-18,o.ally?'#f4f4f4':'#7a1f1f');circ(g,o.x,top+9,9,o.ally?'#f4f4f4':'#7a1f1f');if(o.ally)text(g,'아군',o.x,top+40,'#2a5aa8','center',10);else{seg(g,o.x-12,top+30,o.x+12,top+30,'rgba(255,255,255,.4)',1)}}
    for(const s of SPOTS)rect(g,s[0]-22,s[1]-6,44,22,pal[2]);for(const s of SPOTS)seg(g,s[0]-22,s[1]-6,s[0]+22,s[1]+16,'rgba(0,0,0,.25)',1);
    for(const f of fx)text(g,f.s,f.x,f.y-14,f.col,'center',13);
    g.strokeStyle=flash>0?'#ffe27a':'#7cff8a';g.lineWidth=2;g.beginPath();g.arc(mx,my,10,0,Math.PI*2);g.stroke();seg(g,mx-16,my,mx-6,my,g.strokeStyle,2);seg(g,mx+6,my,mx+16,my,g.strokeStyle,2);seg(g,mx,my-16,mx,my-6,g.strokeStyle,2);seg(g,mx,my+6,mx,my+16,g.strokeStyle,2);
    hudBar(g,'점수 '+won(score)+' · 계급 '+rankOf(S.exp),'남은 시간 '+Math.ceil(t)+'초 · 총알 '+(reload>0?'재장전 중...':ammo+'/30'))},
   state(){return{t,score,ammo,reload,targets:tg.map(o=>({x:o.x,y:o.y-56*o.rise+9,ally:o.ally,rise:o.rise}))}}}}}}

/* ---------- 3. 레이싱: 타임 어택 ---------- */
function raceDef(S,api){
 const LANES=[170,240,310],LEN=1000;
 return{title:'타임 어택 1,000m',help:['← → 방향키로 차선 바꾸기 (화면 왼쪽, 오른쪽을 눌러도 돼요)','부스터 칸이 가득 차면 ↑ 또는 Space로 부스터!','기름과 고깔에 부딪히면 미끄러집니다. 라이벌 둘을 이겨라'],init(env){
  let lane,px,dist,v,gaugeV,boost,spin,obs,time,rivals,next,scroll,fx,done;
  const finish=()=>{if(done)return;done=true;const place=1+rivals.filter(r=>r.fin&&r.fin<time).length,isBest=!S.best||time<S.best;if(isBest)S.best=time;S.plays++;if(place===1)S.wins++;api.save();api.refresh();
   env.over(Math.round(time*100),[(place===1?'1등! 체커기 펄럭펄럭~':place+'등으로 들어왔습니다'),'기록 '+fmtTime(time)+(isBest?' (내 최고 기록!)':' · 최고 '+fmtTime(S.best)),'1등 횟수 '+S.wins+'번']);};
  return{
   reset(){lane=1;px=LANES[1];dist=0;v=0;gaugeV=.3;boost=0;spin=0;obs=[];time=0;rivals=[{name:pick(BOT_NICKS),col:'#e84d4d',sp:rnd(29.5,31.5),d:0,fin:0},{name:pick(BOT_NICKS),col:'#f2c230',sp:rnd(28,30.5),d:0,fin:0}];next=40;scroll=0;fx=[];done=false},
   update(dt){time+=dt;const target=spin>0?10:boost>0?48:31;v+=(target-v)*Math.min(1,dt*(spin>0?6:2.2));if(spin>0)spin-=dt;if(boost>0)boost-=dt;else gaugeV=Math.min(1,gaugeV+dt*.07);
    dist+=v*dt;scroll=(scroll+v*dt*8)%40;px+=(LANES[lane]-px)*Math.min(1,dt*12);
    for(const r of rivals){if(!r.fin){r.d+=r.sp*dt*(1+Math.sin(time*1.3+r.sp)*.05);if(r.d>=LEN)r.fin=time}}
    if(dist>=next&&next<LEN-30){const kind=Math.random()<.22?'box':Math.random()<.5?'oil':'cone';obs.push({lane:Math.floor(Math.random()*3),d:next+60,kind});next+=rnd(26,44)}
    for(const o of obs){if(!o.hit&&Math.abs(o.d-dist)<2.4&&Math.abs(LANES[o.lane]-px)<30){o.hit=true;if(o.kind==='box'){gaugeV=Math.min(1,gaugeV+.5);fx.push({s:'부스터 충전!',t:.9})}else{spin=.8;fx.push({s:o.kind==='oil'?'미끄덩!':'꽈당!',t:.9})}}}
    obs=obs.filter(o=>o.d>dist-20);for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0);if(dist>=LEN){dist=LEN;finish()}},
   key(k,down){if(!down)return;if(k==='ArrowLeft'||k==='a')lane=Math.max(0,lane-1);else if(k==='ArrowRight'||k==='d')lane=Math.min(2,lane+1);else if(k==='ArrowUp'||k===' '||k==='Shift')this.fire()},
   fire(){if(gaugeV>=1&&boost<=0){boost=1.6;gaugeV=0;fx.push({s:'부스터!!',t:.8});return true}return false},
   down(x,y){if(y>H-70&&x>W-110)return this.fire();if(x<W/2)lane=Math.max(0,lane-1);else lane=Math.min(2,lane+1)},
   draw(g){rect(g,0,0,W,H,'#5aa04a');for(let i=0;i<9;i++)circ(g,i%2?36:444,((i*45+scroll*2)%340)-20,14,'#3f7d36');rect(g,130,0,220,H,'#5a5a62');rect(g,126,0,4,H,'#fff');rect(g,350,0,4,H,'#fff');for(let y=-40+scroll;y<H;y+=40){rect(g,203,y,4,20,'#e8e8e8');rect(g,273,y,4,20,'#e8e8e8')}
    const yOf=d=>250-(d-dist)*8;for(const o of obs){if(o.hit)continue;const y=yOf(o.d),x=LANES[o.lane];if(y<-20||y>H+20)continue;if(o.kind==='box'){rect(g,x-11,y-11,22,22,'#ffd23f');text(g,'?',x,y+5,'#a05a00','center',15)}else if(o.kind==='oil')oval(g,x,y,18,8,'#1a1a1a');else{g.fillStyle='#ff7a1a';g.beginPath();g.moveTo(x,y-14);g.lineTo(x-9,y+8);g.lineTo(x+9,y+8);g.fill()}}
    for(const r of rivals){const y=yOf(r.d+6);if(y>-30&&y<H+30){rect(g,LANES[(rivals.indexOf(r)*2)%3]-10,y-16,20,30,r.col);text(g,r.name,LANES[(rivals.indexOf(r)*2)%3],y-20,'#fff','center',10)}}
    const kx=px,ky=250;if(g.save){g.save();g.translate(kx,ky);if(spin>0)g.rotate(spin*12);rect(g,-11,-16,22,32,'#2e8fc2');rect(g,-8,-10,16,10,'#bfe6ff');rect(g,-13,-14,4,9,'#222');rect(g,9,-14,4,9,'#222');rect(g,-13,6,4,9,'#222');rect(g,9,6,4,9,'#222');if(boost>0){g.fillStyle='#ffb02a';g.beginPath();g.moveTo(-6,16);g.lineTo(0,30+Math.random()*8);g.lineTo(6,16);g.fill()}g.restore()}
    hudBar(g,'남은 거리 '+Math.max(0,Math.ceil(LEN-dist))+'m · '+Math.round(v*3.6)+'km/h','기록 '+fmtTime(time));
    gauge(g,W-112,H-30,100,16,gaugeV,gaugeV>=1?'#ff6a2a':'#ffb02a');text(g,gaugeV>=1?'부스터 준비!':'부스터',W-62,H-34,'#fff','center',11);
    gauge(g,10,H-26,110,8,dist/LEN,'#2e8fc2');rivals.forEach((r,i)=>gauge(g,10,H-16+i*7,110,5,r.d/LEN,r.col));
    for(const f of fx)text(g,f.s,W/2,110,'#fff36b','center',22)},
   state(){return{lane,dist,v,gauge:gaugeV,boost,spin,time,rivals:rivals.map(r=>r.d),obs:obs.filter(o=>!o.hit).map(o=>({lane:o.lane,d:o.d,kind:o.kind}))}}}}}}

/* ---------- 4. 달리기: 동화 숲 ---------- */
function runDef(S,api){
 const LEN=800,GROUND=240;
 return{title:'동화 숲 달리기 800m',help:['Space, ↑ 또는 화면 클릭으로 점프!','울타리와 상자를 넘고 웅덩이도 건너뛰세요','부딪히면 넘어져서 느려집니다'],init(env){
  let y,vy,dist,v,trip,obs,time,next,bots,fx,done;
  const finish=()=>{if(done)return;done=true;const place=1+bots.filter(b=>b.fin&&b.fin<time).length,isBest=!S.best||time<S.best;if(isBest)S.best=time;S.plays++;if(place===1)S.wins++;api.save();api.refresh();
   env.over(Math.round(time*100),[place===1?'1등! 동화 숲의 바람이 되었다':place+'등으로 들어왔어요','기록 '+fmtTime(time)+(isBest?' (내 최고 기록!)':' · 최고 '+fmtTime(S.best)),'넘어진 횟수는 비밀 ㅋㅋ'])};
  return{
   reset(){y=GROUND;vy=0;dist=0;v=0;trip=0;obs=[];time=0;next=25;bots=[{n:pick(BOT_NICKS),sp:rnd(22,24),d:0,fin:0,col:'#e84d4d'},{n:pick(BOT_NICKS),sp:rnd(21,23),d:0,fin:0,col:'#7a5ad8'}];fx=[];done=false},
   update(dt){time+=dt;const target=trip>0?6:25;v+=(target-v)*Math.min(1,dt*3);if(trip>0)trip-=dt;dist+=v*dt;vy+=1300*dt;y+=vy*dt;if(y>GROUND){y=GROUND;vy=0}
    for(const b of bots)if(!b.fin){b.d+=b.sp*dt;if(b.d>=LEN)b.fin=time}
    if(dist>=next&&next<LEN-20){obs.push({d:next+30,kind:pick(['fence','fence','box','pond'])});next+=rnd(21,33)}
    for(const o of obs){const x=110+(o.d-dist)*12;o.x=x;if(!o.hit&&x>96&&x<124){const tall=o.kind==='box'?38:o.kind==='fence'?26:4;if(GROUND-y<tall){o.hit=true;trip=.7;fx.push({s:o.kind==='pond'?'첨벙!':'꽈당!',t:.8})}}}
    obs=obs.filter(o=>o.x>-40);for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0);if(dist>=LEN){dist=LEN;finish()}},
   jump(){if(y>=GROUND-1&&trip<=0){vy=-470;return true}return false},
   key(k,down){if(down&&(k===' '||k==='ArrowUp'||k==='w'))this.jump()},
   down(){this.jump()},
   draw(g){sky(g,'#bfe6ff','#e8f6ff');for(let i=0;i<6;i++){const x=((i*110-dist*4)%660+660)%660-60;circ(g,x,180,40,'#7cc35a');rect(g,x-6,180,12,62,'#7a5232')}rect(g,0,GROUND,W,H-GROUND,'#8fd16a');rect(g,0,GROUND,W,4,'#5a9a3a');
    for(const o of obs){if(o.kind==='fence'){rect(g,o.x-12,GROUND-26,4,26,'#a0703a');rect(g,o.x+8,GROUND-26,4,26,'#a0703a');rect(g,o.x-14,GROUND-22,28,5,'#d09a5a');rect(g,o.x-14,GROUND-12,28,5,'#d09a5a')}else if(o.kind==='box'){rect(g,o.x-16,GROUND-38,32,38,'#c48a3a');seg(g,o.x-16,GROUND-38,o.x+16,GROUND,'#8a5a2a',2);seg(g,o.x+16,GROUND-38,o.x-16,GROUND,'#8a5a2a',2)}else oval(g,o.x,GROUND+4,20,5,'#4aa0e0')}
    bots.forEach((b,i)=>{const x=110+(b.d-dist)*12;if(x>-20&&x<W+20){circ(g,x,GROUND-34-i*2,8,'#ffdcb8');rect(g,x-6,GROUND-26,12,18,b.col);text(g,b.n,x,GROUND-48,'#333','center',10)}});
    const bob=trip>0?6:Math.sin(time*16)*2;circ(g,110,y-36+bob,9,'#ffdcb8');rect(g,104,y-27+bob,12,17,'#2e8fc2');rect(g,104,y-10,4,10,'#333');rect(g,112,y-10,4,10,'#333');rect(g,101,y-46+bob,18,6,'#4a3020');
    hudBar(g,'남은 거리 '+Math.max(0,Math.ceil(LEN-dist))+'m','기록 '+fmtTime(time));gauge(g,10,H-20,150,8,dist/LEN,'#2e8fc2');bots.forEach((b,i)=>gauge(g,170,H-24+i*9,120,6,b.d/LEN,b.col));for(const f of fx)text(g,f.s,W/2,110,'#ff6b6b','center',22)},
   state(){return{y,dist,v,trip,time,obs:obs.filter(o=>!o.hit).map(o=>({x:o.x,kind:o.kind}))}}}}}}

/* ---------- 5. 물풍선 피하기 ---------- */
function bombDef(S,api){
 const C=13,R=8,SZ=34,OX=19,OY=26,pillar=(c,r)=>c%2===1&&r%2===1;
 return{title:'물풍선 피하기',help:['방향키로 움직여서 물풍선 물줄기를 피하세요 (화면을 눌러도 한 칸씩 움직여요)','신발은 빨라지고, 바늘은 한 번 살려 줘요','오래 버틸수록 점수가 올라갑니다'],init(env){
  let pc,pr,cool,held,balls,blasts,time,spawn,items,itemT,needle,speed,fx;
  const free=(c,r)=>c>=0&&r>=0&&c<C&&r<R&&!pillar(c,r);
  function blow(b){const cells=[[b.c,b.r]];for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]])for(let i=1;i<=b.range;i++){const c=b.c+dc*i,r=b.r+dr*i;if(!free(c,r))break;cells.push([c,r])}blasts.push({cells,t:.5});for(const o of balls)if(o!==b&&o.t>.15&&cells.some(([c,r])=>c===o.c&&r===o.r))o.t=.12}
  function hitCheck(){for(const b of blasts)if(b.cells.some(([c,r])=>c===pc&&r===pr)){if(needle>0){needle--;b.cells=b.cells.filter(([c,r])=>!(c===pc&&r===pr));fx.push({s:'바늘로 탈출!',t:1});return}const sc=Math.floor(time*10);const isBest=sc>S.best;if(isBest)S.best=sc;S.plays++;api.save();api.refresh();env.over(sc,['물줄기에 갇혔다! 뿌잉','버틴 시간 '+time.toFixed(1)+'초 · 점수 '+sc+(isBest?' (최고 기록!)':''),'최고 점수 '+S.best]);return}}
  function move(dc,dr){const c=pc+dc,r=pr+dr;if(free(c,r)&&!balls.some(b=>b.c===c&&b.r===r)){pc=c;pr=r;const it=items.find(i=>i.c===c&&i.r===r);if(it){items=items.filter(i=>i!==it);if(it.k==='shoe'){speed=Math.max(.08,speed-.03);fx.push({s:'신발! 빨라졌다',t:1})}else{needle++;fx.push({s:'바늘 획득!',t:1})}}}}
  return{
   reset(){pc=0;pr=0;cool=0;held=null;balls=[];blasts=[];time=0;spawn=1;items=[];itemT=6;needle=0;speed=.16;fx=[]},
   update(dt){time+=dt;cool-=dt;if(held&&cool<=0){move(held[0],held[1]);cool=speed}
    spawn-=dt;if(spawn<=0){let c,r,n=0;do{c=Math.floor(Math.random()*C);r=Math.floor(Math.random()*R);n++}while((!free(c,r)||(c===pc&&r===pr)||balls.some(b=>b.c===c&&b.r===r))&&n<40);if(n<40)balls.push({c,r,t:2.2,range:1+Math.floor(Math.random()*Math.min(4,1+time/12))});spawn=Math.max(.32,1.25-time*.02)}
    for(const b of balls){b.t-=dt;if(b.t<=0)blow(b)}balls=balls.filter(b=>b.t>0);for(const b of blasts)b.t-=dt;blasts=blasts.filter(b=>b.t>0);
    itemT-=dt;if(itemT<=0){let c,r;do{c=Math.floor(Math.random()*C);r=Math.floor(Math.random()*R)}while(!free(c,r));items.push({c,r,k:Math.random()<.5?'shoe':'needle'});itemT=rnd(7,11)}
    for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0);hitCheck()},
   key(k,down){const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];if(!d)return;if(down){if(!held||held[0]!==d[0]||held[1]!==d[1]){move(d[0],d[1]);cool=speed}held=d}else if(held&&held[0]===d[0]&&held[1]===d[1])held=null},
   down(x,y){const c=Math.floor((x-OX)/SZ),r=Math.floor((y-OY)/SZ),dc=c-pc,dr=r-pr;if(!dc&&!dr)return;if(Math.abs(dc)>=Math.abs(dr))move(Math.sign(dc),0);else move(0,Math.sign(dr))},
   draw(g){rect(g,0,0,W,H,'#7cc0e8');for(let c=0;c<C;c++)for(let r=0;r<R;r++){const x=OX+c*SZ,y=OY+r*SZ;rect(g,x,y,SZ-1,SZ-1,(c+r)%2?'#bfe3a0':'#b2da92');if(pillar(c,r)){rect(g,x+2,y+2,SZ-5,SZ-5,'#b36b3a');rect(g,x+2,y+2,SZ-5,6,'#d08a5a')}}
    for(const it of items){const x=OX+it.c*SZ+SZ/2,y=OY+it.r*SZ+SZ/2;circ(g,x,y,12,'#fff');text(g,it.k==='shoe'?'신발':'바늘',x,y+4,'#a04ad8','center',10)}
    for(const b of blasts)for(const [c,r] of b.cells)rect(g,OX+c*SZ+3,OY+r*SZ+3,SZ-7,SZ-7,'rgba(70,160,255,.75)');
    for(const b of balls){const x=OX+b.c*SZ+SZ/2,y=OY+b.r*SZ+SZ/2,s=1+Math.sin(b.t*14)*.08;circ(g,x,y,13*s,'#3a8ef0');circ(g,x-4,y-5,4,'rgba(255,255,255,.7)');text(g,b.t.toFixed(1),x,y+4,'#fff','center',10)}
    const x=OX+pc*SZ+SZ/2,y=OY+pr*SZ+SZ/2;circ(g,x,y-2,12,'#ffdcb8');rect(g,x-9,y-15,18,6,'#e84d4d');eyes(g,x,y-2,4);
    hudBar(g,'버틴 시간 '+time.toFixed(1)+'초','바늘 '+needle+'개 · 최고 '+S.best);for(const f of fx)text(g,f.s,W/2,150,'#fff36b','center',20)},
   state(){return{pc,pr,time,balls:balls.map(b=>({c:b.c,r:b.r,t:b.t})),blasts:blasts.length,needle,items:items.length}}}}}}

/* ---------- 6. 링 밀어내기 ---------- */
function ringDef(S,api){
 return{title:'링 밀어내기',help:['← → 를 번갈아 빠르게 눌러서 상대를 밀어내세요 (화면 왼쪽, 오른쪽을 번갈아 눌러도 돼요)','같은 쪽만 누르면 힘이 안 들어가요!','기합 칸이 차면 Space로 필살기 날아차기'],init(env){
  let p,lastKey,power,time,foe,fx,shake,done;
  const end=win=>{if(done)return;done=true;if(win){S.wins++;S.streak++;if(S.streak>S.best)S.best=S.streak}else{S.loss++;S.streak=0}api.save();api.refresh();
   env.over(win?S.streak:0,[win?'링 아웃! 승리!':'링 밖으로 밀려났다... 패배',(win?'연승 '+S.streak+'번째':'상대: '+foe.n+' (힘 '+foe.lv+')')+' · 최다 연승 '+S.best,'전적 '+S.wins+'승 '+S.loss+'패'])};
  const tap=side=>{if(side===lastKey){fx.push({s:'번갈아!',t:.4});return}lastKey=side;p+=.045;power=Math.min(1,power+.07);shake=.08};
  return{
   reset(){p=0;lastKey='';power=0;time=20;foe={n:pick(BOT_NICKS),lv:Math.min(9,1+S.streak),rate:.11+Math.min(9,S.streak)*.022};fx=[];shake=0;done=false},
   update(dt){time-=dt;p-=foe.rate*dt*(1+Math.sin(time*3)*.4);if(shake>0)shake-=dt;for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0);if(p>=1)end(true);else if(p<=-1)end(false);else if(time<=0)end(p>0)},
   key(k,down){if(!down)return;if(k==='ArrowLeft'||k==='a')tap('L');else if(k==='ArrowRight'||k==='d')tap('R');else if(k===' ')this.special()},
   special(){if(power<1)return false;power=0;p+=.32;fx.push({s:'필살! 날아차기!!',t:1});return true},
   down(x,y){if(y<60&&power>=1)return this.special();tap(x<W/2?'L':'R')},
   draw(g){sky(g,'#ffcf9a','#ff9a6a');rect(g,0,220,W,80,'#6a5a7a');rect(g,50,212,380,10,'#e8e8e8');rect(g,50,222,380,6,'#b0b0c0');rect(g,48,170,4,52,'#ddd');rect(g,428,170,4,52,'#ddd');seg(g,50,182,430,182,'#ff5a5a',2);
    const mid=240+p*150,sx=shake>0?Math.random()*3:0;
    circ(g,mid-24+sx,170,11,'#ffdcb8');rect(g,mid-34+sx,181,20,26,'#2e8fc2');rect(g,mid-14,186,16,6,'#2e8fc2');rect(g,mid-32,207,6,8,'#333');rect(g,mid-22,207,6,8,'#333');
    circ(g,mid+24,170,11,'#f2c8a0');rect(g,mid+14,181,20,26,'#e84d4d');rect(g,mid-2,186,16,6,'#e84d4d');rect(g,mid+16,207,6,8,'#333');rect(g,mid+26,207,6,8,'#333');text(g,foe.n,mid+24,152,'#fff','center',11);text(g,'나',mid-24,152,'#fff','center',11);
    hudBar(g,'남은 시간 '+Math.ceil(Math.max(0,time))+'초 · 연승 '+S.streak,'상대 힘 '+foe.lv);gauge(g,10,30,140,12,power,power>=1?'#ff4a4a':'#ffb02a');text(g,power>=1?'필살기 준비! (Space)':'기합',156,40,'#fff','left',11);
    gauge(g,140,270,200,10,(p+1)/2,'#2e8fc2','#e84d4d');for(const f of fx)text(g,f.s,W/2,110,'#fff36b','center',20)},
   state(){return{p,power,time,foe:foe.rate}}}}}}

/* ---------- 7. 골프: 니어 핀 ---------- */
function golfDef(S,api){
 const HOLES=5,MAXY=260;
 return{title:'니어 핀 챌린지',help:['① 클릭하면 힘 막대가 움직여요 ② 원하는 힘에서 클릭','③ 돌아오는 막대가 가운데 임팩트 칸에 올 때 클릭','바람을 보고 ← → 키로 조준을 옮기세요 · 5홀 핀까지 거리 합계가 적을수록 좋아요'],noClickStart:false,init(env){
  let hole,dist,wind,aim,stage,bar,dir,power,acc,fly,total,res,log;
  const newHole=()=>{dist=Math.round(rnd(130,245));wind=Math.round(rnd(-5,5));aim=0;stage='aim';bar=0;dir=1;power=0;acc=0;fly=0;res=null};
  const shoot=()=>{const shot=power*MAXY,lat=acc*70+wind*power*2.2-aim*1.4,lon=shot-dist,d=Math.sqrt(lat*lat+lon*lon);res={d:Math.round(d*10)/10,lat,lon,perfect:Math.abs(acc)<.035};stage='fly';fly=0;
   log.push(res.d);total+=res.d};
  const finish=()=>{const sc=Math.round(total*10)/10,isBest=!S.best||sc<S.best;if(isBest)S.best=sc;S.plays++;api.save();api.refresh();env.over(Math.round(sc*10),['5홀 합계: 핀까지 '+sc+'y'+(isBest?' (내 최고 기록!)':''),'홀마다 '+log.map(x=>x+'y').join(' · '),'최고 기록 '+S.best+'y'])};
  return{
   reset(){hole=1;total=0;log=[];newHole()},
   update(dt){if(stage==='power'){bar+=dir*dt*1.05;if(bar>=1){bar=1;dir=-1}if(bar<=0&&dir<0){bar=0;dir=1}}
    else if(stage==='acc'){bar-=dt*1.25;if(bar<-.25){acc=-.25;shoot()}}
    else if(stage==='fly'){fly+=dt*.9;if(fly>=1){fly=1;stage='result';this.wait=1.3}}
    else if(stage==='result'){this.wait-=dt;if(this.wait<=0){if(hole>=HOLES){stage='end';finish()}else{hole++;newHole()}}}},
   click(){if(stage==='aim'){stage='power';bar=0;dir=1}else if(stage==='power'){power=bar;stage='acc'}else if(stage==='acc'){acc=bar;shoot()}},
   down(){this.click()},
   key(k,down){if(!down)return;if(stage==='aim'&&k==='ArrowLeft')aim=Math.max(-10,aim-1);else if(stage==='aim'&&k==='ArrowRight')aim=Math.min(10,aim+1);else if(k===' ')this.click()},
   draw(g){rect(g,0,0,W,H,'#4aa0e0');oval(g,240,170,190,120,'#5aba5a');oval(g,240,60,60,34,'#7ad86a');rect(g,236,30,2,30,'#fff');g.fillStyle='#ff4a4a';g.beginPath();g.moveTo(238,30);g.lineTo(254,36);g.lineTo(238,42);g.fill();circ(g,237,60,3,'#222');rect(g,226,262,24,8,'#e8d8a8');
    const by=262-(stage==='fly'||stage==='result'?((res.lon+dist)/dist)*202*Math.min(1,fly):0),bx=237+(stage==='fly'||stage==='result'?(-res.lat)*1.5*Math.min(1,fly):0),hgt=stage==='fly'?Math.sin(fly*Math.PI)*36:0;
    if(stage!=='aim'&&stage!=='power'&&stage!=='acc'){circ(g,bx,by,4,'rgba(0,0,0,.25)');circ(g,bx,by-hgt,4,'#fff')}else{circ(g,237,262,4,'#fff');seg(g,237,262,237+aim*6,226,'rgba(255,255,255,.7)',2)}
    hudBar(g,'홀 '+hole+'/'+HOLES+' · 핀까지 '+dist+'y','바람 '+(wind===0?'없음':(wind<0?'← ':'→ ')+Math.abs(wind)+'m/s')+' · 합계 '+(Math.round(total*10)/10)+'y');
    const xv=v=>30+(clamp(v,-.25,1)+.25)/1.25*420;rect(g,30,268,420,18,'rgba(0,0,0,.45)');rect(g,xv(0)-6,268,12,18,'#ffd23f');text(g,'임팩트',xv(0),298,'#fff','center',10);
    if(stage==='power'||stage==='acc'){const pv=stage==='power'?bar:power;rect(g,xv(0),268,xv(pv)-xv(0),18,'rgba(255,120,40,.7)');rect(g,xv(bar)-2,264,4,26,'#fff')}
    text(g,stage==='aim'?'클릭해서 샷 시작! (← → 조준 '+(aim>0?'+':'')+aim+')':stage==='power'?'힘을 정하세요':stage==='acc'?'임팩트 칸에서 클릭!':stage==='result'?(res.d<1?'홀인원!!!':res.perfect?'팡야! 핀까지 '+res.d+'y':'핀까지 '+res.d+'y'):'',W/2,256,'#fff','center',14)},
   state(){return{hole,stage,bar,dist,wind,aim,total,res}}}}}}

/* ---------- 8. 농구: 30초 슛 ---------- */
function hoopDef(S,api){
 return{title:'30초 슛 대결',help:['마우스를 누르고 있으면 힘 막대가 올라가요 (Space를 꾹 눌러도 돼요)','초록 칸에서 손을 떼면 골인! 가운데 진한 칸은 클린슛','넣을수록 초록 칸이 좁아집니다'],init(env){
  let time,score,streak,charging,pw,dir,ball,zone,fx,made,shots;
  const finish=()=>{const isBest=score>S.best;if(isBest)S.best=score;S.plays++;api.save();api.refresh();env.over(score,['30초 끝! '+score+'점'+(isBest?' (최고 기록!)':''),shots+'번 던져서 '+made+'번 성공','최고 점수 '+S.best])};
  const release=()=>{if(!charging)return;charging=false;shots++;const c=(zone[0]+zone[1])/2,half=(zone[1]-zone[0])/2,off=Math.abs(pw-c);let kind=off<=half*.35?'clean':off<=half?'in':off<=half+.06?'rim':'miss';ball={t:0,kind,p:pw};};
  return{
   reset(){time=30;score=0;streak=0;charging=false;pw=0;dir=1;ball=null;zone=[.58,.78];fx=[];made=0;shots=0},
   update(dt){time-=dt;if(time<=0&&!ball){time=0;finish();return}if(charging){pw+=dir*dt*1.15;if(pw>=1){pw=1;dir=-1}if(pw<=0){pw=0;dir=1}}
    if(ball){ball.t+=dt*1.5;if(ball.t>=1){const k=ball.kind;if(k==='clean'||k==='in'){const pts=k==='clean'?3:2;score+=pts;made++;streak++;fx.push({s:k==='clean'?'클린슛! +3':'골인! +2',t:1});const wd=Math.max(.07,(zone[1]-zone[0])*.92),c=rnd(.35+wd/2,.9-wd/2);zone=[c-wd/2,c+wd/2]}else{streak=0;fx.push({s:k==='rim'?'림 맞고 튕김 ㅠㅠ':'에어볼...',t:1})}ball=null;pw=0;dir=1}}
    for(const f of fx)f.t-=dt;fx=fx.filter(f=>f.t>0)},
   down(){if(!ball&&!charging&&time>0){charging=true;pw=0;dir=1}},
   up(){release()},
   key(k,down){if(k!==' ')return;if(down)this.down();else release()},
   draw(g){rect(g,0,0,W,H,'#d8885a');rect(g,0,210,W,90,'#b8683a');seg(g,0,210,W,210,'#fff',2);g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(390,210,120,Math.PI,Math.PI*1.5);g.stroke();
    rect(g,420,40,8,170,'#666');rect(g,380,40,60,44,'#fff');rect(g,396,60,28,18,'rgba(0,0,0,0)');g.strokeStyle='#e84d4d';g.strokeRect&&g.strokeRect(398,58,24,18);rect(g,372,84,40,4,'#ff6a2a');for(let i=0;i<5;i++)seg(g,374+i*9,88,378+i*7,104,'#fff',1);
    circ(g,90,198,10,'#ffdcb8');rect(g,82,208,16,26,'#2e8fc2');
    if(ball){const t=ball.t,ex=ball.kind==='miss'?(ball.p<.5?300:440):ball.kind==='rim'?396:392,ey=ball.kind==='miss'?150:86,x=104+(ex-104)*t,y=190+(ey-190)*t-Math.sin(t*Math.PI)*(80+ball.p*60);circ(g,x,y,9,'#ff7a1a');seg(g,x-9,y,x+9,y,'#7a3a0a',1)}else circ(g,104,190,9,'#ff7a1a');
    rect(g,20,40,22,160,'rgba(0,0,0,.45)');rect(g,22,40+160*(1-zone[1]),18,160*(zone[1]-zone[0]),'#5ad85a');const c=(zone[0]+zone[1])/2,hf=(zone[1]-zone[0])/2*.35;rect(g,22,40+160*(1-(c+hf)),18,160*hf*2,'#1f9a3a');rect(g,16,40+160*(1-pw)-2,30,4,'#fff');
    hudBar(g,'점수 '+score+' · 연속 '+streak,'남은 시간 '+Math.ceil(time)+'초');for(const f of fx)text(g,f.s,W/2,130,'#fff36b','center',22);if(charging)text(g,'손을 떼면 슛!',150,250,'#fff','left',13)},
   state(){return{time,score,charging,pw,zone,ball:ball?{...ball}:null}}}}}}

/* ---------- 9. 댄스: 방향키 ---------- */
const ARR={ArrowLeft:'←',ArrowUp:'↑',ArrowRight:'→',ArrowDown:'↓'};
function danceDef(S,api){
 const ROUNDS=10,ZONE=[.86,.98];
 return{title:'방향키 댄스',help:['화면의 화살표를 방향키로 차례대로 누르세요 (틀리면 처음부터)','다 누른 다음, 막대가 노란 칸에 올 때 Space!','PERFECT를 이어 가면 콤보 점수가 쑥쑥'],repeatKeys:false,init(env){
  let round,seq,idx,t,period,score,combo,maxCombo,judge,wait,wrong,counts,pose;
  const newRound=()=>{const n=Math.min(9,4+Math.floor((round-1)/2));seq=Array.from({length:n},()=>pick(Object.keys(ARR)));idx=0;t=0;period=Math.max(1.6,2.7-round*.09);wait=0;wrong=0};
  const decide=kind=>{judge={k:kind,t:.7};counts[kind]=(counts[kind]||0)+1;const base={PERFECT:300,GREAT:200,COOL:120,BAD:40,MISS:0}[kind];if(kind==='PERFECT'||kind==='GREAT'){combo++;maxCombo=Math.max(maxCombo,combo)}else combo=0;score+=Math.round(base*(1+Math.min(10,combo)*.1));pose=kind==='MISS'||kind==='BAD'?0:1+Math.floor(Math.random()*3);wait=.7};
  const finish=()=>{const grade=score>=3600?'S':score>=2600?'A':score>=1600?'B':'C',isBest=score>S.best;if(isBest)S.best=score;S.plays++;api.save();api.refresh();env.over(score,['노래 끝! '+won(score)+'점 · '+grade+' 등급'+(isBest?' (최고 기록!)':''),'PERFECT '+(counts.PERFECT||0)+' · GREAT '+(counts.GREAT||0)+' · MISS '+(counts.MISS||0),'최대 콤보 '+maxCombo+' · 최고 점수 '+won(S.best)])};
  return{
   reset(){round=1;score=0;combo=0;maxCombo=0;judge=null;counts={};pose=0;newRound()},
   update(dt){if(judge){judge.t-=dt;if(judge.t<=0)judge=null}if(wrong>0)wrong-=dt;
    if(wait>0){wait-=dt;if(wait<=0){if(round>=ROUNDS){finish();return}round++;newRound()}return}
    t+=dt/period;if(t>=1){decide('MISS')}},
   press(k){if(wait>0)return;if(!ARR[k])return;if(idx>=seq.length)return;if(seq[idx]===k)idx++;else{idx=0;wrong=.3}},
   hit(){if(wait>0)return;if(idx<seq.length){decide(t>ZONE[0]?'MISS':'BAD');return}const d=Math.abs(t-.92);decide(d<.025?'PERFECT':d<.05?'GREAT':d<.08?'COOL':'BAD')},
   key(k,down){if(!down)return;if(k===' ')this.hit();else this.press(k)},
   down(x,y){if(y>H-60){const i=Math.floor(x/(W/5));const keys=['ArrowLeft','ArrowUp','ArrowDown','ArrowRight'];if(i<4)this.press(keys[i]);else this.hit()}},
   draw(g){sky(g,'#2a0f3a','#6a2a6a');for(let i=0;i<7;i++){g.globalAlpha=.25;circ(g,40+i*70,40+(i%2)*20,30+Math.sin(t*6+i)*6,['#ff4ad8','#4ad8ff','#ffe24a'][i%3]);g.globalAlpha=1}
    const dancer=(x,col,ps)=>{const arm=[[-.6,.6],[-1.6,1.6],[-1.6,.2],[.4,1.6]][ps]||[-.6,.6];circ(g,x,118,11,'#ffdcb8');rect(g,x-8,130,16,28,col);seg(g,x-6,136,x-6-Math.cos(arm[0])*18,136-Math.sin(-arm[0])*18,col,4);seg(g,x+6,136,x+6+Math.cos(arm[1])*18,136-Math.sin(arm[1])*18,col,4);seg(g,x-4,158,x-8-(ps%2)*6,180,'#333',4);seg(g,x+4,158,x+8+(ps%2)*6,180,'#333',4)};
    dancer(170,'#ff6ab0',pose);dancer(310,'#4ab0ff',pose?(pose%3)+1:0);rect(g,100,182,280,6,'rgba(255,255,255,.3)');
    const n=seq.length,sw=36,sx=W/2-n*sw/2;seq.forEach((a,i)=>{rect(g,sx+i*sw+2,196,sw-4,30,i<idx?'#ffd23f':wrong>0?'#a03a3a':'rgba(255,255,255,.18)');text(g,ARR[a],sx+i*sw+sw/2,218,i<idx?'#5a2a00':'#fff','center',20)});
    rect(g,60,236,360,12,'rgba(255,255,255,.2)');rect(g,60+360*ZONE[0],234,360*(ZONE[1]-ZONE[0]),16,'#ffd23f');rect(g,60+360*Math.min(1,t)-2,230,4,24,'#fff');
    rect(g,0,H-46,W,46,'rgba(0,0,0,.35)');['←','↑','↓','→','Space'].forEach((s,i)=>text(g,s,i*(W/5)+W/10,H-18,'#fff','center',i<4?18:13));
    hudBar(g,'마디 '+round+'/'+ROUNDS+' · 콤보 '+combo,'점수 '+won(score));if(judge)text(g,judge.k+(combo>1&&(judge.k==='PERFECT'||judge.k==='GREAT')?' x'+combo:''),W/2,86,{PERFECT:'#ffe24a',GREAT:'#7cff8a',COOL:'#7ad0ff',BAD:'#ffb0b0',MISS:'#ff5a5a'}[judge.k],'center',26)},
   state(){return{round,seq:seq.slice(),idx,t,score,combo,judge:judge?judge.k:null,wait}}}}}}

/* ---------- 10. 전략: 손빠르기 대결 ---------- */
function apmDef(S,api,foe){
 return{title:foe?'1:1 손빠르기 대결':'APM 측정기',help:foe?['상대 '+foe.n+'님과 15초 동안 손빠르기 대결!','화면을 클릭하거나 아무 키나 빠르게 누르세요','APM(1분에 몇 번 움직이는지)이 높은 쪽이 이깁니다']:['15초 동안 화면을 클릭하거나 키를 빠르게 누르세요','1분에 몇 번 움직이는지(APM)를 재 드립니다','고수는 부대 지정 키를 쉬지 않고 누릅니다'],init(env){
  let time,count,sparks,keys;
  const finish=()=>{const apm=count*4,isBest=apm>S.apm;if(isBest)S.apm=apm;let line;if(foe){const win=apm>foe.apm;if(win)S.w++;else S.l++;line=win?'승리! 상대 APM '+foe.apm+' · 전적 '+S.w+'승 '+S.l+'패':'패배... 상대 APM '+foe.apm+' · 전적 '+S.w+'승 '+S.l+'패';api.say(foe.n,win?'gg 손 빠르시네요 ㄷㄷ':'ㅋㅋ gg 연습 더 하고 오세요~')}else line='등급: '+apmTitle(apm);api.save();api.refresh();
   env.over(apm,['당신의 APM은 '+apm+(isBest?' (최고 기록!)':''),line,'최고 APM '+S.apm+' · '+apmTitle(S.apm)])};
  return{
   reset(){time=15;count=0;sparks=[];keys=0},
   update(dt){time-=dt;for(const s of sparks)s.t-=dt;sparks=sparks.filter(s=>s.t>0);if(time<=0){time=0;finish()}},
   act(x,y){count++;sparks.push({x:x==null?rnd(40,440):x,y:y==null?rnd(60,260):y,t:.4})},
   down(x,y){this.act(x,y)},
   key(k,down){if(down&&k!=='Escape'){keys++;this.act()}},
   draw(g){rect(g,0,0,W,H,'#0d1a2a');for(let i=0;i<40;i++)rect(g,(i*53)%W,(i*97)%H,2,2,'rgba(140,200,255,.25)');for(const s of sparks){circ(g,s.x,s.y,14*(1-s.t/.4)+4,'rgba(124,255,138,'+(s.t*2).toFixed(2)+')')}
    text(g,String(count*4),W/2,170,'#7cff8a','center',54);text(g,'현재 APM (손 움직임 '+count+'번)',W/2,200,'#9fe0ff','center',14);if(foe)text(g,'상대 '+foe.n+' 님 열심히 누르는 중...',W/2,236,'#ffb0b0','center',13);hudBar(g,foe?'1:1 대결 · 상대 '+foe.n:'APM 측정기','남은 시간 '+Math.ceil(time)+'초')},
   state(){return{time,count,apm:count*4}}}}}}

/* ---------- 실행기 창 ---------- */
function attach(X){
 const {E,B}=X;let alive=true;const timers=new Set(),runs=new Map(),patched=new Set();
 const later=(fn,ms)=>{const id=w.setTimeout(()=>{timers.delete(id);if(alive)fn()},ms);timers.add(id);return id};
 const store=()=>{const s=X.saved;if(!s.games||typeof s.games!=='object'||Array.isArray(s.games))s.games={};return s.games};
 const nick=()=>{const x=X.saved.xp&&X.saved.xp.nick;return String(x||'동네친구').slice(0,12)};
 const listOf=()=>X.gameList||[];
 function stateOf(id){const all=store();let S=all[id];if(!S||typeof S!=='object'||Array.isArray(S))S=all[id]={};const g=GENRE[id];const num=(k,v)=>{if(!Number.isFinite(S[k])||S[k]<0)S[k]=v};
  num('plays',0);if(g==='hunt'){num('lv',1);if(S.lv<1)S.lv=1;num('exp',0);num('gold',0);num('pot',5);num('wp',0);num('kills',0);num('deaths',0);if(!Array.isArray(S.items))S.items=[];S.items=S.items.filter(x=>typeof x==='string').slice(0,8)}
  else if(g==='shoot'){num('exp',0);num('best',0)}else if(g==='race'||g==='run'){num('best',0);num('wins',0)}else if(g==='ring'){num('wins',0);num('loss',0);num('streak',0);num('best',0)}else if(g==='golf'){num('best',0)}else if(g==='rts'){num('w',0);num('l',0);num('apm',0)}else num('best',0);
  return S}
 function summary(id){const S=stateOf(id),g=GENRE[id];if(g==='hunt')return 'Lv.'+S.lv+' · 무기 +'+S.wp+' · '+won(S.gold)+' '+(INFO[id].money||'골드');if(g==='shoot')return '계급 '+rankOf(S.exp)+' · 최고 '+won(S.best)+'점';if(g==='race'||g==='run')return S.best?'최고 기록 '+fmtTime(S.best)+' · 1등 '+S.wins+'번':'아직 기록 없음';if(g==='ring')return '전적 '+S.wins+'승 '+S.loss+'패 · 최다 연승 '+S.best;if(g==='golf')return S.best?'최고 기록 핀까지 '+S.best+'y':'아직 기록 없음';if(g==='rts')return '전적 '+S.w+'승 '+S.l+'패 · 최고 APM '+S.apm;return S.best?'최고 점수 '+won(S.best):'아직 기록 없음'}
 function stopRun(id){const r=runs.get(id);if(r){try{r.stop()}catch(_){}runs.delete(id)}}
 function open(appId){const id=String(appId).replace(/^game-/,'');const g=listOf().find(x=>x.id===id);if(!g||!GENRE[id])return false;
  X.saved.recent=[id,...(X.saved.recent||[]).filter(x=>x!==id)].slice(0,6);X.save();
  const win=X.windowFor('game-'+id,g.name,true);win.caption.textContent=g.name+' · 실행기';stopRun(id);launcherView(win,g);return true}
 function shell(win,g){const c=win.content;c.replaceChildren();const root=E('div','pg-root');root.style.setProperty('--pg',g.color);c.append(root);return root}
 function head(root,g,sub){const h=E('header','pg-head'),mark=E('b','pg-mark',g.mark),t=E('div','pg-title');t.append(E('strong','',g.name),E('small','',sub||g.category+' · '+MODE[GENRE[g.id]]));h.append(mark,t,E('span','pg-pcbang','PC방 프리미엄'));root.append(h);return h}
 function launcherView(win,g){const id=g.id,I=INFO[id],root=shell(win,g);head(root,g);
  const body=E('div','pg-body'),left=E('section','pg-news'),right=E('aside','pg-me');body.append(left,right);root.append(body);
  left.append(E('h3','','새 소식'));for(const t of [...I.notice,...COMMON_NOTICE.slice(0,2)])left.append(E('p','pg-notice',t));left.append(E('p','pg-desc',g.description));
  right.append(E('h3','','내 기록'),E('p','pg-sum',summary(id)),E('p','pg-muted','아이디: '+nick()));
  const fav=X.saved.favorites||[];right.append(B(fav.includes(id)?'즐겨찾기 해제':'즐겨찾기에 추가',()=>{X.saved.favorites=fav.includes(id)?fav.filter(x=>x!==id):[...fav,id];X.save();launcherView(win,g)},'pg-btn small'));
  if(X.navigate)right.append(B('공략 글 찾아보기',()=>X.navigate({type:'search',portal:'naver',query:g.name}),'pg-btn small'));
  const st=E('div','pg-patch'),label=E('p','pg-status',''),barBox=E('div','pg-bar'),fill=E('i');barBox.append(fill);st.append(label,barBox);root.append(st);
  const go=B('게임 시작',()=>loginView(win,g),'pg-start');go.disabled=true;root.append(go);
  if(patched.has(id)){label.textContent='최신 버전입니다. 게임을 시작하세요!';fill.style.width='100%';go.disabled=false;return}
  const total=24+(id.length*7)%40;let n=0;label.textContent=I.wait||'패치 정보를 확인하는 중...';
  const tick=()=>{if(!win.node.isConnected&&win.node.isConnected!==undefined)return;n=Math.min(total,n+3+Math.floor(Math.random()*5));fill.style.width=Math.round(n/total*100)+'%';label.textContent=n<total?'업데이트 파일 받는 중 ('+n+'/'+total+') · '+(380+Math.floor(Math.random()*240))+'KB/s':'패치 완료! 게임을 시작하세요.';if(n<total)later(tick,120);else{patched.add(id);go.disabled=false}};later(tick,200)}
 function loginView(win,g){const root=shell(win,g);head(root,g,'로그인');const f=E('form','pg-login'),idIn=E('input'),pw=E('input');idIn.value=nick();idIn.maxLength=12;idIn.setAttribute('aria-label','아이디');pw.type='password';pw.value='12345678';pw.maxLength=12;pw.setAttribute('aria-label','비밀번호');
  const msg=E('p','pg-muted','보안 프로그램이 키보드를 보호하고 있습니다.');const sub=B('로그인',()=>{},'pg-start');sub.type='submit';
  const l1=E('label','','아이디 '),l2=E('label','','비밀번호 ');l1.append(idIn);l2.append(pw);f.append(l1,l2,sub,msg);root.append(f);
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const v=String(idIn.value||'').trim();if(!v){msg.textContent='아이디를 입력하세요.';return}if(!pw.value){msg.textContent='비밀번호를 입력하세요.';return}
   msg.textContent='로그인 중...';sub.disabled=true;later(()=>serverView(win,g),260)})}
 function serverView(win,g){const I=INFO[g.id],root=shell(win,g);head(root,g,'서버 선택');const list=E('div','pg-servers');
  for(const [name,load] of I.servers){const b=B('',()=>{if(load==='포화')queueView(win,g,name);else enter(win,g,name)},'pg-server '+({원활:'ok',혼잡:'busy',포화:'full'}[load]||'ok'));b.append(E('b','',name),E('span','',load));list.append(b)}
  root.append(E('p','pg-muted','접속할 서버를 고르세요. 포화 서버는 기다려야 합니다.'),list,B('◀ 처음으로',()=>launcherView(win,g),'pg-btn small'))}
 function queueView(win,g,server){const root=shell(win,g);head(root,g,server+' 서버 · 접속 대기');let n=900+Math.floor(Math.random()*600);const big=E('p','pg-queue',''),note=E('p','pg-muted','접속자가 많아 대기 중입니다. 창을 닫으면 순서가 사라집니다.');root.append(big,note,B('다른 서버 고르기',()=>serverView(win,g),'pg-btn small'));
  const tick=()=>{if(!root.isConnected&&root.isConnected!==undefined)return;n=Math.max(0,n-180-Math.floor(Math.random()*160));big.textContent='대기 순서 '+won(n)+'번';if(n>300&&n<700)note.textContent='PC방 프리미엄 혜택으로 순서를 앞당기는 중!';if(n<=0)enter(win,g,server);else later(tick,160)};tick()}
 function enter(win,g,server){const id=g.id,genre=GENRE[id],I=INFO[id],S=stateOf(id),root=shell(win,g);stopRun(id);S.plays=S.plays||0;
  const bar=E('div','pg-gamebar');bar.append(E('b','',g.name),E('span','',server+' 서버 · '+nick()),B('게임 종료',()=>{stopRun(id);launcherView(win,g)},'pg-btn small'));root.append(bar);
  const wrap=E('div','pg-play'),stage=E('div','pg-stage'),side=E('aside','pg-side');wrap.append(stage,side);root.append(wrap);
  const chat=E('div','pg-chat'),log=E('div','pg-log');chat.append(E('b','','채팅'),log);const form=E('form','pg-say'),inp=E('input');inp.maxLength=40;inp.placeholder='채팅 입력 후 엔터';inp.setAttribute('aria-label','게임 채팅');const send=B('보내기',()=>{},'pg-btn small');send.type='submit';form.append(inp,send);chat.append(form);
  const say=(who,t)=>{const p=E('p','pg-line'+(who==='system'?' sys':who===nick()?' me':''),who==='system'?t:who+' : '+t);log.append(p);while(log.children.length>40)log.children[0].remove();log.scrollTop=1e6};
  let bi=Math.floor(Math.random()*50);const chatter=()=>{if(!root.isConnected&&root.isConnected!==undefined)return;say(BOT_NICKS[bi%BOT_NICKS.length],I.chat[(bi*7)%I.chat.length]);bi++;later(chatter,rnd(3500,7000))};later(chatter,900);
  form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(inp.value||'').trim().slice(0,40);if(!t)return;inp.value='';say(nick(),t);later(()=>say(BOT_NICKS[(bi+3)%BOT_NICKS.length],pick(['ㅋㅋㅋ','ㅇㅇ','ㅎㅇ','님 몇 살?','ㄱㄱ','ㄴㄴ','오 ㅋㅋ','반가워요 ^^','?','ㅡㅡ;'])),900)});
  say('system','[알림] '+server+' 서버에 접속했습니다. PC방 혜택이 적용됩니다.');
  const info=E('div','pg-info');const refresh=()=>{info.textContent=summary(id)};
  const api={save:()=>X.save(),refresh:()=>refresh(),say,name:nick,cheer:()=>later(()=>say(pick(BOT_NICKS),pick(['ㅊㅋㅊㅋ','렙업 축하해요!','오 축하드려요 ^^','ㅊㅋ'])),700)};
  side.append(E('h4','',I.field),info);refresh();
  if(genre==='rts'){rtsView(win,g,S,stage,side,api,server);side.append(chat);return}
  const def=genre==='hunt'?huntDef(I,S,api):genre==='shoot'?shootDef(id,S,api):genre==='race'?raceDef(S,api):genre==='run'?runDef(S,api):genre==='bomb'?bombDef(S,api):genre==='ring'?ringDef(S,api):genre==='golf'?golfDef(S,api):genre==='hoop'?hoopDef(S,api):danceDef(S,api);
  const run=runner(stage,E,def,{onOver:()=>{X.save();api.refresh()}});runs.set(id,run);
  if(genre==='hunt'){const shop=E('div','pg-shop');const pot=B('물약 먹기 (1)',()=>{run.game.potion()},'pg-btn');const buy=B('',()=>{const cost=30;if(S.gold<cost){say('system','[상점] '+(I.money||'골드')+'가 모자랍니다.');return}S.gold-=cost;S.pot+=5;X.save();say('system','[상점] 물약 5개를 샀습니다.');paint()},'pg-btn');
   const up=B('',()=>{const cost=60*(S.wp+1);if(S.gold<cost){say('system','[대장간] 강화 비용 '+won(cost)+' '+(I.money||'골드')+'가 모자랍니다.');return}S.gold-=cost;const rate=Math.max(.2,.95-S.wp*.09),ok=Math.random()<rate;if(ok){S.wp++;say('system','[대장간] 강화 성공! 무기 +'+S.wp)}else if(S.wp>=6){say('system','[대장간] 강화 실패... 무기가 증발했습니다 ㅠㅠ 기본 무기 +0으로 돌아갑니다.');S.wp=0}else say('system','[대장간] 강화 실패 ㅠㅠ (무기는 무사합니다)');X.save();paint()},'pg-btn');
   const inv=E('div','pg-inv');const paint=()=>{pot.textContent='물약 먹기 (1) · '+S.pot+'개';buy.textContent='물약 5개 사기 (30 '+(I.money||'골드')+')';up.textContent='무기 강화 +'+S.wp+' → +'+(S.wp+1)+' ('+won(60*(S.wp+1))+')'+(S.wp>=6?' 실패하면 증발!':'');inv.replaceChildren(E('b','','가방 ('+S.items.length+'/8)'));for(const it of S.items)inv.append(E('span','pg-item',it));if(!S.items.length)inv.append(E('span','pg-muted','아직 득템한 장비가 없어요'));refresh()};
   api.refresh=paint;shop.append(pot,buy,up);side.append(shop,inv);paint()}
  if(genre==='dance'){const pad=E('div','pg-pad');for(const [k,l] of [['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→']])pad.append(B(l,()=>{if(run.phase()==='play')run.game.press(k)},'pg-btn'));pad.append(B('치기 (Space)',()=>{if(run.phase()==='play')run.game.hit()},'pg-btn'));stage.append(pad)}
  side.append(chat)}
 function rtsView(win,g,S,stage,side,api,server){const I=INFO[g.id];const box=E('div','pg-rts');stage.append(box);
  function lobby(){stopRun(g.id);box.replaceChildren();const t=E('div','pg-rooms');t.append(E('b','','번호'),E('b','','방 제목'),E('b','','맵'),E('b','','인원'),E('b',''));
   I.rooms.forEach((rm,i)=>{t.append(E('span','',String(i+1)),E('span','pg-rt',rm[0]),E('span','',rm[1]),E('span','',rm[2]));t.append(B('참가',()=>join(i),'pg-btn small'))});
   box.append(E('h4','','게임 방 목록 · '+server),t,B('APM 측정기 (혼자 연습)',()=>apm(null),'pg-btn'))}
  function join(i){const rm=I.rooms[i];box.replaceChildren();const p=E('p','pg-queue','"'+rm[0]+'" 방에 들어가는 중...');box.append(p);
   later(()=>{const kind=rm[3];if(kind==='duel'){const foe={n:pick(BOT_NICKS),apm:Math.round(rm[4]*rnd(.8,1.15))};api.say(foe.n,pick(['ㅎㅇ','ㄱㄱ','하이요 ^^','손 풀고 오셨죠? ㅋㅋ']));apm(foe);return}
    const msg={kick:'방장이 당신을 내보냈습니다. (ㅈㅅ 아는 사람끼리 해요)',full:'방이 꽉 찼습니다.',friend:'"아는 사람만" 방입니다. 방장이 비밀번호를 걸었습니다.',ping:'핑이 높다고 방장이 내보냈습니다 ㅠㅠ (PC방 인터넷은 빠른데...)',leave:'게임이 시작되자마자 상대가 나갔습니다. 승리! (전적 1승 추가)'}[kind]||'방이 사라졌습니다.';
    if(kind==='leave'){S.w++;X.save();api.refresh()}p.textContent=msg;box.append(B('◀ 방 목록으로',lobby,'pg-btn'))},420)}
  function apm(foe){box.replaceChildren();const run=runner(box,E,apmDef(S,api,foe),{onOver:()=>{X.save();api.refresh()}});runs.set(g.id,run);box.append(B('◀ 방 목록으로',lobby,'pg-btn small'))}
  lobby();api.lobby=lobby;api.join=join}
 const api={ids:[],has:id=>typeof id==='string'&&/^game-/.test(id)&&!!GENRE[id.slice(5)],open,
  run:id=>runs.get(id)||null,state:id=>stateOf(id),summary,
  reset(){for(const id of [...runs.keys()])stopRun(id);patched.clear()},destroy(){alive=false;for(const id of [...runs.keys()])stopRun(id);for(const t of timers)w.clearTimeout(t);timers.clear()}};
 return api}
w.PCGames={attach,GENRE,INFO,MODE,RANKS,rankOf,apmTitle,fmtTime,runner,defs:{huntDef,shootDef,raceDef,runDef,bombDef,ringDef,golfDef,hoopDef,danceDef,apmDef},version:'A95'};
})(window);
