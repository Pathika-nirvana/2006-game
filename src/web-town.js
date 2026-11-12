/* A97 (2026-11-12 KST): 새 사이트 네 곳. web-fun.js 다음에 읽혀 WebSites.register()로 붙는다.
   우리동네 소식통: 동네 약도(누르면 가게 정보), 가게 이야기(별점과 후기, 내 후기 쓰기), 동네 게시판(분실물, 나눔, 칭찬, 질문), 은하아파트 관리사무소 알림, 동네 투표.
   동일초등학교: 학교 소개와 교가, 가정통신문, 5월 급식표(날짜를 누르면 차림표), 5학년 2반 알림장(숙제 체크), 자유게시판, 학교 앨범.
   폰꾸미기 천국: 벨소리 미리 듣기(화음), 휴대폰 배경 화면(내 그림으로 저장), 80바이트 무료 문자(답장이 온다), 특수문자 문자 그림.
   뮤직박스: 큰길 음반 가게의 인터넷 매장. 실시간 차트, 1분 미리 듣기, 가사, 새 음반 소식, 미니홈피 배경음악 담기.
   가게와 장소는 지금 지도(큰길 상가, 문구점 골목, 은하아파트, 동일초등학교, 2층 PC방, 우리슈퍼)에 있는 것이다. 사람, 노래, 가사, 주소는 모두 지어낸 것이고,
   소리는 지어낸 가락과 아주 옛날 클래식 곡(베토벤, 모차르트, 파헬벨)만 낸다. 소리는 게임의 효과음 켜기와 음량을 따른다.
   글쓴 날짜와 시각은 2006년 5월 30일 오후 4시 32분 이전이다. 입력 칸은 닉네임과 짧은 글뿐이고 전화번호나 개인정보는 받지 않는다. */
(function(w){'use strict';
const WS=w.WebSites;if(!WS||!WS.register)return;
const K=WS.kit;
const obj=(k,key)=>{if(!k[key]||typeof k[key]!=='object'||Array.isArray(k[key]))k[key]={};return k[key]};
const arr=(o,key,max)=>{if(!Array.isArray(o[key]))o[key]=[];o[key]=o[key].filter(x=>x!=null).slice(-(max||30));return o[key]};
const toast=(env,title,text)=>{const X=env.ctx.X;if(X&&X.ui&&X.ui.toast)X.ui.toast({title,text,icon:'info',ms:4200})};
const PRIVATE=/\d{2,4}[-. ]?\d{3,4}[-. ]?\d{4}|@[a-z0-9]|https?:|www\./i;
function cv(env,cls,W,H){const c=env.E('canvas',cls);c.width=W;c.height=H;const g=c.getContext?c.getContext('2d'):null;return [c,g]}
function circ(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,Math.max(.5,r),0,Math.PI*2);g.fill()}
function rect(g,x,y,w0,h0,c){g.fillStyle=c;g.fillRect(x,y,w0,h0)}
function txt(g,s,x,y,c,size,al,bold){g.fillStyle=c;g.font=(bold===false?'':'bold ')+(size||12)+'px Dotum,Gulim,sans-serif';g.textAlign=al||'center';g.fillText(String(s),x,y)}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const avg=list=>list.length?list.reduce((a,x)=>a+x,0)/list.length:0;
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};

/* ---------- 소리: 사용자가 누른 뒤에만 만들고, 게임 효과음 설정을 따른다 ---------- */
const SY={ctx:null,nodes:[],timer:0,onEnd:null};
const audioState=()=>{const s=w.GameAudio&&w.GameAudio.state;return {on:!s||(s.enabled!==false&&s.volume>0),vol:s&&Number.isFinite(s.volume)?s.volume:.6}};
function freq(n){const m=/^([A-G])(#|b)?(\d)$/.exec(n);if(!m)return 0;const midi=(Number(m[3])+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);return 440*Math.pow(2,(midi-69)/12)}
const parseTune=s=>String(s||'').trim().split(/\s+/).filter(Boolean).map(tok=>{const [n,d]=tok.split(':');return {n,d:Number(d)>0?Number(d):1}});
const tuneBeats=s=>parseTune(s).reduce((a,x)=>a+x.d,0);
function synthStop(){if(SY.timer){w.clearTimeout(SY.timer);SY.timer=0}for(const o of SY.nodes){try{o.stop()}catch(_){}}SY.nodes=[];const f=SY.onEnd;SY.onEnd=null;if(f)try{f()}catch(_){}}
/* voices: [[가락, 파형, 크기], ...] 첫 줄이 길이를 정한다 */
function synthPlay(voices,bpm,onEnd){synthStop();const beat=60/(bpm||120),dur=tuneBeats(voices[0][0])*beat,st=audioState();
 SY.onEnd=onEnd||null;if(typeof w.setTimeout==='function')SY.timer=w.setTimeout(()=>{SY.timer=0;SY.nodes=[];const f=SY.onEnd;SY.onEnd=null;if(f)try{f()}catch(_){}},Math.round(dur*1000)+120);
 if(!st.on)return {silent:true,why:'off',dur};const C=w.AudioContext||w.webkitAudioContext;if(!C)return {silent:true,why:'none',dur};
 try{if(!SY.ctx)SY.ctx=new C();const ac=SY.ctx;if(ac.resume)ac.resume();const t0=ac.currentTime+.05;
  for(const [tune,wave,gain] of voices){let t=t0;const vol=st.vol*(gain||.16);for(const x of parseTune(tune)){const f=x.n==='R'?0:freq(x.n),len=x.d*beat;
   if(f){const o=ac.createOscillator(),g=ac.createGain();o.type=wave||'square';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.setValueAtTime(vol,t+Math.max(.02,len*.72));g.gain.linearRampToValueAtTime(0,t+len*.96);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+len);SY.nodes.push(o)}t+=len}}
  return {silent:false,dur}}catch(_){return {silent:true,why:'none',dur}}}
const silentText=res=>res.why==='off'?'효과음이 꺼져 있어서 소리가 나지 않아요. (게임 설정에서 효과음을 켜 보세요)':'이 컴퓨터에서는 소리를 낼 수 없어서 재생 화면만 움직여요.';

/* =====================================================================
   1. 우리동네 소식통
   ===================================================================== */
/* 장소: [id, 이름, 분류, 약도 칸 [x,y,w,h], 소개, 한 줄 정보, 후기 [닉네임, 날짜, 별, 글]] */
const PLACES=[
 ['pharm','중앙약국','큰길 상가',[18,10,70,40],'큰길로 나가면 제일 먼저 보이는 약국. 유리문 너머 약 상자와 작은 계산대가 보이고, 문 앞에는 처방전 안내판이 서 있다.','소화제 · 파스 · 밴드 · 처방전 · 일요일은 당번 약국 안내 참고',[['102동아줌마','05.29 19:20',5,'약사 선생님이 아이 감기약 먹는 법을 종이에 적어 주셨어요. 친절해요.'],['파스필요','05.24 10:05',4,'체육대회 다음 날 파스 사러 갔더니 동일초 학부모님이 줄 서 계셨음 ㅋㅋ']]],
 ['bakery','진영제과','큰길 상가',[96,10,70,40],'유리 진열장에 빵이 놓여 있고 가게 옆에는 배달 상자가 쌓여 있는 동네 빵집.','소보로빵 · 단팥빵 · 생크림 케이크 · 오후 4시쯤 갓 구운 빵',[['빵순이','05.30 16:10',5,'오후 4시쯤 가면 소보로빵이 따끈따끈해요. 학원 가기 전에 하나씩 ㅋㅋ'],['생일케이크','05.21 18:40',4,'생크림 케이크 미리 말하면 이름도 써 주세요. 초는 다섯 개까지 공짜래요.'],['다이어트중','05.16 20:15',3,'지나갈 때 냄새가 너무 좋아서 다이어트가 안 됨 ㅠㅠ']]],
 ['gimbap','김밥나라','큰길 상가',[174,10,70,40],'학원에 가기 전 김밥 한 줄 먹고 가는 아이들이 들르는 분식집.','김밥 한 줄 1,000원 · 라면 · 쫄면 · 돈가스',[['학원가기싫어','05.29 17:50',4,'김밥 한 줄 먹고 청솔수학 올라가면 딱 수업 시간. 단무지 많이 주세요~'],['중2민호','05.26 18:10',4,'라면에 김밥 찍어 먹으면 최고 ㅋㅋ']]],
 ['hakwon','학원 건물','학원',[252,10,96,40],'영어, 수학, 피아노, 태권도. 청솔수학, 소리엘피아노, 한빛태권도가 서로 다른 층에 있고 유리창에는 여름방학 특강 안내가 붙어 있다.','1층 한빛태권도 · 2층 소리엘피아노 · 3층 청솔수학 · 여름방학 특강 접수 중',[['태권소년','05.28 20:00',5,'한빛태권도 관장님 무섭지만 재밌어요. 이번에 노란띠 땄어요!'],['피아노싫어','05.25 19:30',3,'소리엘피아노 체르니 진도 너무 빨라요 ㅠㅠ 그래도 선생님 착하심']]],
 ['mobile','한빛 이동통신','큰길 상가',[356,10,74,40],'작은 휴대전화 사진과 요금제 안내가 창문에 붙어 있다. 폴더폰을 접고 펴던 시절의 대리점.','폴더폰 · 슬라이드폰 · 청소년 요금제 · 문자 무료 상품 안내',[['폰바꾸고싶다','05.27 15:10',4,'슬라이드폰 구경만 하고 왔어요. 엄마가 중학교 가면 사 준대요 ㅠㅠ'],['문자왕','05.20 21:40',3,'청소년 요금제 문자 몇 통 무료인지 꼭 물어보고 가입하세요!!']]],
 ['books','제일서점','큰길 상가',[438,10,70,40],'참고서와 학습지, 새 책이 유리문 뒤로 보이는 서점. 위층에는 독서실 간판이 붙어 있다.','참고서 · 동화책 · 만화잡지 · 위층 독서실',[['책벌레','05.23 16:30',5,'만화잡지 새 호 나오는 날 아침에 가면 있어요. 사장님이 비닐 안 뜯고 보면 혼내심 ㅋㅋ'],['고3준호','05.22 23:10',4,'위층 독서실 조용해서 좋아요. 대신 졸면 옆 사람이랑 눈 마주침...']]],
 ['photo','행복사진관','큰길 상가',[516,10,72,40],'증명사진과 인화 안내가 붙은 작은 사진관. 진열된 사진 옆에 카메라가 놓여 있다.','증명사진 당일 인화 · 필름 현상 · 디카 사진 인화',[['찰칵찰칵','05.28 18:20',5,'디카 사진 CD에 담아 가면 인화해 주세요. 400만 화소 사진도 선명하게 나와요!'],['증명사진','05.19 11:00',4,'사장님이 계속 웃으라고 하셔서 웃었더니 학생증 사진이 웃는 얼굴 ㅋㅋ']]],
 ['clinic','의원과 은행 건물','큰길 상가',[18,112,96,40],'같은 건물 안에 소아과와 치과, 은행이 있다. 층마다 다른 간판이 건물의 높이를 알려 준다.','1층 은행 · 2층 소아과 · 3층 치과 · 토요일 오전 진료',[['애기엄마','05.26 09:40',4,'소아과 선생님 주사 아프지 않게 놔 주세요. 토요일 오전은 사람 많아요.'],['충치무서워','05.18 17:20',3,'치과 가기 전날 밤에 양치 열 번 함... 그래도 충치 두 개 ㅠㅠ']]],
 ['academy','정진입시학원 · 솔빛영어학원','학원',[122,112,100,40],'3층은 정진입시학원, 2층은 솔빛영어학원이다. 계단실 옆 안내판에 층별 학원과 수업 대상이 적혀 있다.','중고등 내신 · 초등 영어 회화 · 방학 특강',[['영어울렁증','05.29 21:00',4,'솔빛영어 원어민 선생님이랑 말하면 아직 떨려요. 그래도 재밌어요.'],['내신대비','05.24 22:30',3,'정진입시 기말 대비반 시작했어요. 밤 10시에 끝나요...']]],
 ['video','은하 비디오','큰길 상가',[230,112,74,40],'창문 안쪽 진열대에 영화 테이프 상자가 줄지어 꽂혀 있는 비디오 대여점.','신작 1박 2일 · 구작 3박 4일 · 연체료 하루 500원 · 만화책도 빌려 줌',[['영화광','05.27 22:10',4,'신작은 금요일 저녁에 다 나가요. 미리 예약하면 빼 두세요 (전화 말고 가게에서 말하기)'],['연체대왕','05.15 13:30',2,'반납 하루 늦었는데 연체료 500원... 되감기 안 하고 반납하면 아저씨가 한숨 쉬심 ㅋㅋ']]],
 ['computer','영진컴퓨터','큰길 상가',[312,112,74,40],'브라운관 모니터와 키보드 상자가 가게 안에 놓여 있는 컴퓨터 가게. 위층 창문에는 음악학원 안내가 붙어 있다.','조립 PC · 수리 · 마우스 · 공 CD · 위층 음악학원',[['조립왕','05.29 14:50',5,'램 512MB 추가했는데 사장님이 공짜로 끼워 주셨어요. 바이러스 검사도 해 주심'],['마우스볼','05.17 16:00',4,'볼 마우스 고장 나서 갔더니 볼 꺼내서 닦아 주시고 끝 ㅋㅋㅋ']]],
 ['salon','미선미용실','큰길 상가',[394,112,74,40],'의자와 거울이 나란히 놓인 미용실. 옆에는 작은 옷 수선 가게가 있다.','학생 커트 · 파마 · 옆집 옷 수선(바지 단 줄이기)',[['앞머리','05.25 15:20',4,'앞머리만 잘라 달랬는데 눈썹 위로 올라감 ㅠㅠ 그래도 원장님 손이 빨라요'],['교복줄임','05.12 17:40',4,'옆 수선집에서 교복 바지 단 줄이면 30분이면 돼요.']]],
 ['music','뮤직박스','큰길 상가',[476,112,78,40],'진열대에 CD와 카세트테이프가 꽂혀 있는 음반 가게. 가게 앞에서 어떤 앨범을 살지 한참 고민하게 된다.','새 음반 예약 · 카세트테이프 · 공 테이프 · 포스터 증정 행사',[['분홍풍선','05.30 15:30',5,'별빛소녀 2집 예약 받아요!! 예약하면 브로마이드 줘요 ㅠㅠ 인터넷 매장도 있어요'],['테이프세대','05.21 19:00',4,'카세트테이프 아직 팔아요. 워크맨 쓰는 분들 여기로~']]],
 ['stationery','별빛문구','문구점 골목',[60,196,84,42],'동일초 앞 문방구. 학용품 진열대와 유리 진열장, 가게 앞 100원 뽑기와 오락기가 있다.','학용품 · 준비물 · 쫀쫀이 · 아폴루 · 100원 뽑기 · 동네 태권 대전 오락기',[['뽑기장인','05.30 14:20',5,'100원 뽑기에서 반지사탕 세 번 연속 나옴 ㅋㅋㅋ 오락기 동네 태권 대전 내가 1등'],['준비물','05.29 08:10',4,'아침에 준비물 깜빡하면 여기서 다 살 수 있어요. 아주머니가 기억해 두심 ㅋㅋ'],['3학년엄마','05.22 09:30',3,'학교 앞 간식은 적당히... 그래도 아이들 사랑방이에요.']]],
 ['bunsik','은하분식','문구점 골목',[150,196,74,42],'문구점 옆 길거리 주문대. 학교 끝나는 종이 울리면 줄이 문방구 앞까지 이어진다.','컵떡볶이 500원 · 어묵 꼬치 300원 · 설탕 핫도그 700원 · 슬러시 300원 · 어묵 국물 공짜',[['떡볶이요정','05.30 13:40',5,'컵떡볶이 500원에 국물까지 ㅠㅠ 김말이 하나 추가하면 완벽'],['핫도그는설탕','05.28 16:20',5,'설탕 핫도그에 케첩 지그재그로 뿌려 달라고 하세요 ㅋㅋ'],['슬러시파랑','05.26 15:50',4,'파란 슬러시 먹으면 혀가 파래져요. 하얀 종이컵이라 색이 잘 보임']]],
 ['pcroom','2층 동네 PC방','문구점 골목',[232,188,84,50],'계단을 올라가면 있는 동네 PC방. 카운터에서 번호표를 받고 자리에 앉는다. 브라운관 모니터와 새 LCD 모니터가 섞여 있다.','17인치 LCD 자리 · 컵라면 · 캔음료 · 학생 밤 10시 전 귀가',[['카트중독','05.30 15:00',5,'17번 자리 명당. 모니터가 제일 큼 ㅋㅋ 사장님 컵라면 물 정확히 선까지 부어 주심'],['12번자리','05.29 18:40',3,'12번 자리 키보드 ㅁ 키 잘 안 눌려요... 사장님이 내일 바꿔 주신대요'],['학부모','05.27 21:20',4,'사장님이 밤 10시 전에 아이들 꼭 집에 보내 주세요. 감사합니다.']]],
 ['super','우리슈퍼','문구점 골목',[324,196,70,42],'라면과 과자, 아이스크림 냉동고, 음료 냉장고가 있는 동네 슈퍼. 계산대 옆에 작은 전화기가 있다.','라면 · 과자 · 아이스크림 · 우유 · 생활용품',[['아이스크림','05.30 16:00',4,'냉동고 맨 아래 칸에 쌍쌍바 숨어 있어요 ㅋㅋ'],['라면박스','05.23 19:10',4,'라면 한 박스 사면 사장님이 집 앞까지 들어 주세요.']]],
 ['barber','중앙 이발관','골목',[18,256,74,40],'유리문 너머 의자와 흰 가운이 보인다. 텔레비전 소리가 작게 흘러나오는 오래된 이발관.','어른 커트 · 학생 커트 · 면도 · 회전 간판',[['아빠따라','05.20 10:30',4,'아빠 따라 갔다가 나도 스포츠머리 됨... 사탕 하나 주셨어요'],['단골','05.13 09:00',5,'30년 단골입니다. 면도는 여기가 최고.']]],
 ['hardware','동네 철물','골목',[100,256,74,40],'입구에 빗자루와 고무호스, 색색의 양동이가 놓인 철물점. 가게 안에서 쇠붙이 부딪치는 소리가 난다.','못 · 전구 · 고무호스 · 양동이 · 열쇠 복사',[['집수리','05.18 14:00',5,'형광등 하나 사러 갔다가 설치하는 법까지 배워 왔어요.'],['열쇠','05.11 18:30',4,'열쇠 복사 5분이면 끝나요.']]],
 ['school','동일초등학교','학교',[420,176,200,108],'하교한 아이들이 삼삼오오 골목으로 흩어지는 학교. 정문 옆 알림판에 가정통신문과 학교 안내가 붙어 있다.','정문 알림판 · 운동장 · 철봉 · 5월 31일 지방선거 투표소(강당)',[['동일초6학년','05.29 16:40',5,'운동장 철봉에서 거꾸로 매달리기 하면 하늘이 땅이 됨 ㅋㅋ'],['녹색어머니','05.26 08:30',4,'아침 횡단보도 지킴이 하면서 보니 아이들 인사를 잘해요 ^^']]],
 ['park','놀이터','골목',[232,248,88,46],'오래된 철제 그네와 뺑뺑이가 있는 놀이터. 벤치에 앉으면 하루가 천천히 지나간다.','철제 그네 · 뺑뺑이 · 벤치 · 모래밭',[['그네타기','05.30 15:40',4,'철제 그네 삐걱거리는 소리가 정겨워요. 뺑뺑이 너무 세게 돌리지 마세요 ㅋㅋ'],['동네할머니','05.24 17:00',5,'저녁 먹고 벤치에 앉아 있으면 바람이 시원해요.']]],
 ['apt','은하아파트','아파트',[18,312,402,58],'101동, 102동, 104동이 모여 있는 아파트 단지. 단지 안쪽 길로 다니면 큰길을 지나지 않아도 된다.','관리사무소 · 게시판 · 수요일 분리수거 · 단지 내 서행',[['101동주민','05.29 20:20',4,'단지 안쪽 길은 차가 천천히 다녀서 아이들 다니기 좋아요.'],['옥상노을','05.28 19:50',5,'옥상에서 보는 노을이 예뻐요. 올라갈 땐 경비 아저씨께 말씀드리기!']]]
];
const PL={};for(const p of PLACES)PL[p[0]]=p;
const MAP_LABEL={clinic:'의원 · 은행',academy:'정진 · 솔빛학원',pcroom:'2층 PC방',mobile:'한빛 이동통신'};
const TOWN_BOARD=[
 ['b1','분실물','놀이터 그네 옆에서 실내화 주머니 주웠어요','101동아줌마','05.30 16:05','오늘 오후 3시쯤 놀이터 철제 그네 옆에 하늘색 실내화 주머니가 떨어져 있었어요. 동일초 3학년 2반 이름표가 붙어 있고 실내화가 들어 있어요. 101동 경비실에 맡겨 두었으니 찾아가세요.',['아이고 우리 애 같아요 ㅠㅠ 저녁에 찾으러 갈게요','경비 아저씨 감사해요~','ㄴ 찾으셨다니 다행이에요 ^^']],
 ['b2','이웃 소식','은하아파트 6월 여름 소독 날짜 나왔어요','관리사무소','05.30 10:00','6월 2일(금)과 3일(토) 이틀 동안 단지 여름 소독을 합니다. 오전에는 101동과 102동, 오후에는 104동 순서예요. 집에 안 계시면 현관 앞 소독만 해 드립니다. 강아지 키우시는 집은 미리 말씀해 주세요.',['소독약 냄새 나면 창문 열어 두면 되죠?','ㄴ 네 한 시간쯤 환기하시면 돼요','모기 많았는데 다행이다']],
 ['b3','칭찬합니다','은하분식 아주머니 감사해요','3학년엄마','05.29 20:40','아이가 학교 끝나고 컵떡볶이를 사 먹다가 돈이 100원 모자랐대요. 아주머니가 다음에 가져오라고 그냥 주셨다고 하네요. 오늘 100원 갚으러 가니까 웃으시면서 어묵 국물까지 주셨어요. 동네에 이런 가게가 있어서 고맙습니다.',['은하분식 아주머니 진짜 착하심 ㅠㅠ','저도 외상 해 봤어요 ㅋㅋ 다음 날 꼭 갚음','훈훈하다']],
 ['b4','나눔','아이 자전거 보조 바퀴 나눔합니다 (102동)','두발자전거','05.29 18:15','아이가 이제 보조 바퀴 없이 탄다고 해서 떼어 냈어요. 16인치 자전거에 맞는 보조 바퀴 한 쌍입니다. 필요하신 분은 102동 경비실 앞에서 토요일 오전에 드릴게요. 쪽지 주세요.',['저 필요해요!! 쪽지 보냈어요','두발자전거 성공 축하해요 ㅋㅋ','ㄴ 나눔 완료되었습니다 감사합니다']],
 ['b5','질문','큰길 뮤직박스 별빛소녀 2집 예약 몇 시까지 받나요?','분홍풍선','05.29 21:30','별빛소녀 2집 예약하면 브로마이드 준다고 해서요. 학원 끝나면 밤 9시인데 그때도 문 열려 있나요? 뮤직박스 인터넷 매장에서도 예약이 되는지 궁금해요.',['밤 10시까지 해요~','인터넷 매장에서는 예약만 되고 찾는 건 가게에서!','브로마이드 선착순이래요 서두르세요']],
 ['b6','이웃 소식','수요일 분리수거, 상자는 꼭 펴서 묶어 주세요','104동총무','05.28 11:20','지난주 수요일에 상자를 그대로 쌓아 두셔서 수거장이 넘쳤어요. 상자는 테이프를 떼고 펴서 끈으로 묶어 주시고, 페트병은 뚜껑을 따로 모아 주세요. 철망 수거함 위 현수막에 종류별 안내가 있습니다.',['몰랐어요 죄송합니다 ㅠㅠ','테이프 떼는 거 은근 귀찮지만 해야죠','수고 많으십니다']],
 ['b7','분실물','문구점 골목에서 흰색 MP3 잃어버렸어요','음악소녀','05.28 17:05','어제 학원 가는 길에 별빛문구 골목에서 흰색 MP3(512MB)를 잃어버렸어요. 뒤에 하트 스티커가 붙어 있어요. 노래가 별빛소녀 노래로 꽉 차 있어요 ㅠㅠ 보신 분은 문구점 아주머니께 맡겨 주세요.',['문구점에 물어보세요! 거기 분실물 모아 두심','꼭 찾길 바라요','ㄴ 문구점에 있었대요!! 찾았습니다 ㅠㅠ 감사해요']],
 ['b8','질문','5월 31일 투표소가 어디예요?','이사온지한달','05.27 14:30','이번 지방선거 처음으로 이 동네에서 투표해요. 집으로 온 안내문을 잃어버렸는데 투표소가 어디인지 아시는 분 계세요?',['동일초등학교 강당이에요','신분증 꼭 챙겨 가세요~','투표하고 나면 진영제과 빵 사 먹기 ㅋㅋ']],
 ['b9','칭찬합니다','2층 PC방 사장님 감사합니다','중1아들맘','05.26 22:00','아들이 PC방에 갔다가 시간 가는 줄 몰랐는데 사장님이 밤 10시 되기 전에 집에 가라고 말씀해 주셨대요. 컵라면 물도 위험하다고 직접 부어 주신다니 마음이 놓여요.',['사장님 엄청 친절하심 ㅋㅋ','ㄴ 우리 형도 쫓겨남 ㅋㅋㅋ','좋은 PC방이네요']],
 ['b10','질문','동네에서 증명사진 제일 빨리 나오는 곳?','급해요','05.24 09:10','내일까지 증명사진이 필요해요. 큰길 행복사진관 말고 다른 곳도 있나요? 거기는 몇 분이면 나오나요?',['행복사진관 20분이면 나와요','사장님이 웃으라고 계속 그러심 ㅋㅋ','ㄴ 웃는 증명사진 인정']]
];
const TOWN_NOTICE=[
 ['n1','여름 소독 안내 (6월 2일 금 ~ 3일 토)','05.30','오전: 101동, 102동 · 오후: 104동\n집에 안 계신 세대는 현관 앞만 소독합니다. 애완동물이 있는 세대는 관리사무소에 미리 알려 주세요.'],
 ['n2','물탱크 청소에 따른 단수 안내','05.29','6월 8일(목) 오전 10시부터 오후 2시까지 물이 나오지 않습니다. 미리 물을 받아 두세요.'],
 ['n3','5월 31일 지방선거 투표소 안내','05.26','우리 단지 투표소는 동일초등학교 강당입니다. 오전 6시부터 오후 6시까지. 신분증을 꼭 가져가세요.'],
 ['n4','분리수거는 매주 수요일','05.22','단지 안쪽 수거장 철망 수거함에 종류별로 나누어 주세요. 상자는 펴서 묶고, 페트병은 라벨을 떼어 주세요.'],
 ['n5','단지 내 서행 부탁드립니다','05.18','단지 안쪽 길은 아이들이 다니는 길입니다. 가로등 사이 흰 현수막이 걸린 곳부터는 꼭 천천히 다녀 주세요.'],
 ['n6','놀이터 그네 점검 완료','05.15','오래된 철제 그네의 사슬과 고리를 점검하고 기름칠을 했습니다. 삐걱 소리는 조금 남아 있지만 안전에는 문제가 없습니다.']
];
const POLLS=[
 ['snack','우리 동네 최고의 간식은?',[['은하분식 컵떡볶이',128],['설탕 핫도그',97],['별빛문구 쫀쫀이',64],['파란 슬러시',51],['진영제과 소보로빵',43]]],
 ['cup','6월 13일 토고전, 어디서 볼까요?',[['집에서 가족이랑',151],['동네 호프집 단체 응원',62],['큰길 광장 거리 응원',88],['PC방에서 인터넷 중계',24]]]
];
function townState(k){const s=obj(k,'town');for(const n of ['rev','votes'])if(!s[n]||typeof s[n]!=='object'||Array.isArray(s[n]))s[n]={};arr(s,'posts',12);if(!Number.isFinite(s.visit)||s.visit<0)s.visit=0;
 for(const id of Object.keys(s.rev)){if(!PL[id]||!Array.isArray(s.rev[id])){delete s.rev[id];continue}s.rev[id]=s.rev[id].filter(x=>x&&typeof x.t==='string'&&Number.isFinite(x.s)).slice(-5)}
 for(const id of Object.keys(s.votes))if(!POLLS.some(p=>p[0]===id)||!Number.isInteger(s.votes[id]))delete s.votes[id];
 s.posts=s.posts.filter(x=>x&&typeof x.t==='string');return s}
/* 동네 약도: 2006년 동네 소식지에 실릴 법한 손그림 약도 */
function drawTown(g,sel,hover){const W=640,H=380;rect(g,0,0,W,H,'#f7f1dd');for(let i=0;i<W;i+=16)rect(g,i,0,1,H,'rgba(150,130,90,.06)');for(let i=0;i<H;i+=16)rect(g,0,i,W,1,'rgba(150,130,90,.06)');
 rect(g,0,60,W,44,'#8f939c');for(let x=6;x<W;x+=34)rect(g,x,81,18,2,'#f2f2f2');txt(g,'큰 길 (상가 거리)',150,76,'#fff',10,'left');
 rect(g,566,60,12,44,'#fff');for(let y=62;y<104;y+=6)rect(g,566,y,12,3,'#8f939c');txt(g,'교차로',606,99,'#fff',9);
 rect(g,224,104,8,200,'#c9c2ae');rect(g,0,166,420,10,'#d8d0bb');rect(g,0,300,420,8,'#d8d0bb');rect(g,404,104,12,206,'#d8d0bb');txt(g,'골목',228,184,'#6b6252',9);
 rect(g,92,54,22,5,'#2a6ad8');txt(g,'정류장',103,72,'#dfe9ff',9);
 for(const p of PLACES){const [x,y,ww,hh]=p[3],on=sel===p[0],ho=hover===p[0],cat=p[2];
  const fill=cat==='학교'?'#cfe0f7':cat==='아파트'?'#e6dccb':p[0]==='park'?'#cde8b6':cat==='학원'?'#efd9f3':cat==='문구점 골목'?'#ffe2b8':'#fff6df';
  rect(g,x,y,ww,hh,on?'#fff07a':ho?'#fffbe0':fill);g.strokeStyle=on?'#e0283a':'#7a6a52';g.lineWidth=on?2.5:1;g.strokeRect(x+.5,y+.5,ww-1,hh-1);
  if(p[0]==='school'){rect(g,x+8,y+40,ww-16,hh-50,'#d9c08a');txt(g,'운동장',x+ww/2,y+82,'#8a6a2a',10);rect(g,x+ww-40,y+48,2,18,'#666');rect(g,x+ww-22,y+48,2,18,'#666');rect(g,x+ww-40,y+48,20,2,'#666');txt(g,'철봉',x+ww-30,y+76,'#555',8,'center',false)}
  if(p[0]==='apt')for(const [i,d] of ['101동','102동','104동'].entries()){rect(g,x+16+i*120,y+10,96,24,'#d4c7ae');txt(g,d,x+64+i*120,y+27,'#5a4a32',10)}
  if(p[0]==='park'){circ(g,x+14,y+14,7,'#8bbf5a');rect(g,x+60,y+6,2,18,'#777');rect(g,x+78,y+6,2,18,'#777');rect(g,x+60,y+6,20,2,'#777');rect(g,x+66,y+18,8,2,'#a05a2a')}
  const name=MAP_LABEL[p[0]]||p[1];txt(g,name,x+ww/2,y+(p[0]==='apt'?50:p[0]==='school'?18:p[0]==='park'?hh-6:hh/2+4),on?'#c01020':'#3a3226',p[0]==='school'||p[0]==='apt'?12:10)}
 txt(g,'북 ↑',W-24,H-10,'#7a6a52',10);txt(g,'우리 동네 약도 (2006년 5월)',8,H-8,'#7a6a52',10,'left')}
function townPage(page,env){const {E,B,go,r,k,ctx}=env,s=townState(k);
 const head=E('header','tw-head');head.append(B('우리동네 소식통',()=>go({type:'home'}),'tw-logo'),E('span','tw-sub','은하아파트 · 동일초 · 큰길 상가 이웃들의 생활 정보 나눔터'),K.digits(E,23180+s.visit,6,'tw-count'));page.append(head);
 const nav=E('nav','tw-nav');for(const [type,label] of [['home','첫 화면'],['map','동네 약도'],['shop','가게 이야기'],['board','동네 게시판'],['notice','관리사무소 알림'],['vote','동네 투표']])nav.append(B(label,()=>go({type}),'tw-tab'+((r.type===type||(type==='board'&&r.type==='post'))?' on':'')));page.append(nav);
 page.append(K.marquee(E,'★ 6월 2일(금)~3일(토) 은하아파트 여름 소독 ★ 수요일은 분리수거하는 날 ★ 5월 31일 투표소: 동일초등학교 강당 ★ 큰길 뮤직박스 별빛소녀 2집 예약 접수 중 ★','tw-marq'));
 const body=E('main','tw-body');page.append(body);
 const placeCard=(p,box)=>{const mine=s.rev[p[0]]||[],all=p[6].map(x=>x[2]).concat(mine.map(x=>x.s)),a=avg(all);box.append(E('h3','',p[1]),E('p','tw-cat',p[2]+' · '+stars(Math.round(a))+' '+a.toFixed(1)+' (후기 '+all.length+'개)'),E('p','',p[4]),E('p','tw-info',p[5]))};
 if(r.type==='map'){const box=E('section','tw-box tw-mapbox');box.append(E('h3','','동네 약도 · 가게를 눌러 보세요'));const [c,g]=cv(env,'tw-map',640,380);box.append(c);const info=E('div','tw-pick');box.append(info);body.append(box);
  let sel=PL[r.id]?r.id:'',hover='';const paint=()=>{if(g)try{drawTown(g,sel,hover)}catch(_){}};
  const show=()=>{info.replaceChildren();const p=PL[sel];if(!p){info.append(E('p','tw-note','약도의 가게나 장소를 누르면 소개와 동네 사람들 후기가 여기에 나와요.'));return}placeCard(p,info);info.append(B('가게 이야기 보기 ▶',()=>go({type:'shop',id:p[0]}),'tw-btn'))};
  const at=e=>{const rr=c.getBoundingClientRect?c.getBoundingClientRect():{left:0,top:0,width:640,height:380};const x=(e.clientX-rr.left)*640/(rr.width||640),y=(e.clientY-rr.top)*380/(rr.height||380);const p=PLACES.slice().reverse().find(q=>x>=q[3][0]&&x<=q[3][0]+q[3][2]&&y>=q[3][1]&&y<=q[3][1]+q[3][3]);return p?p[0]:''};
  c.addEventListener('pointerdown',e=>{sel=at(e)||sel;paint();show()});c.addEventListener('pointermove',e=>{const h=at(e);if(h!==hover){hover=h;c.style.cursor=h?'pointer':'default';paint()}});
  const list=E('div','tw-chips');for(const p of PLACES)list.append(B(p[1],()=>{sel=p[0];paint();show()},'tw-chip'));box.append(list);paint();show();return}
 if(r.type==='shop'){const p=PL[r.id];
  if(!p){const box=E('section','tw-box');box.append(E('h3','','가게 이야기 · 동네 사람들이 직접 쓴 후기'));for(const q of PLACES){const row=B('',()=>go({type:'shop',id:q[0]}),'tw-shoprow');const all=q[6].map(x=>x[2]).concat((s.rev[q[0]]||[]).map(x=>x.s));row.append(E('b','',q[1]),E('span','',q[2]),E('em','',stars(Math.round(avg(all)))+' '+all.length));box.append(row)}body.append(box);return}
  const box=E('section','tw-box tw-shop');placeCard(p,box);box.append(B('약도에서 보기',()=>go({type:'map',id:p[0]}),'tw-btn small'));if(p[0]==='music')box.append(B('뮤직박스 인터넷 매장 가기',()=>go({type:'home'},'w-music'),'tw-btn small'));if(p[0]==='school')box.append(B('동일초등학교 홈페이지 가기',()=>go({type:'home'},'w-dongil'),'tw-btn small'));body.append(box);
  const rv=E('section','tw-box');rv.append(E('h3','','후기'));const mine=s.rev[p[0]]=Array.isArray(s.rev[p[0]])?s.rev[p[0]].filter(x=>x&&typeof x.t==='string').slice(-5):[];
  for(const x of mine.slice().reverse()){const row=E('div','tw-rev mine');row.append(E('b','',x.n),E('small','',' 방금 · '+stars(x.s)),E('p','',x.t));rv.append(row)}
  for(const [n,at,st,t] of p[6]){const row=E('div','tw-rev');row.append(E('b','',n),E('small','',' '+at+' · '+stars(st)),E('p','',t));rv.append(row)}
  const f=E('form','tw-form'),nick=K.field(E,'닉네임',10,'닉네임'),sel=E('select'),t=K.field(E,'한 줄 후기 (60자)',60,'후기');sel.setAttribute('aria-label','별점');for(let i=5;i>=1;i--){const o=E('option','',stars(i));o.value=String(i);sel.append(o)}nick.value='동네주민';const sb=B('후기 남기기',()=>{},'tw-btn');sb.type='submit';f.append(nick,sel,t,sb);
  const warn=E('p','tw-warn','');f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const text=String(t.value||'').trim().slice(0,60);if(!text)return;if(PRIVATE.test(text)){warn.textContent='전화번호나 주소 같은 개인정보는 쓸 수 없어요.';return}mine.push({n:String(nick.value||'').trim().slice(0,10)||'동네주민',s:Math.max(1,Math.min(5,Number(sel.value)||5)),t:text});s.rev[p[0]]=mine.slice(-5);ctx.save();ctx.rerender()});rv.append(f,warn);body.append(rv);return}
 if(r.type==='board'||r.type==='post'){const mine=arr(s,'posts',12);
  if(r.type==='post'){const x=TOWN_BOARD.find(b=>b[0]===r.id);if(x){const box=E('section','tw-box tw-post');box.append(E('p','tw-cat','['+x[1]+'] '+x[3]+' · '+x[4]),E('h3','',x[2]),E('p','',x[5]));const cm=E('div','tw-cms');for(const t of x[6])cm.append(E('p','tw-cm'+(t.startsWith('ㄴ')?' nest':''),t));box.append(cm,B('◀ 목록으로',()=>go({type:'board'}),'tw-btn small'));body.append(box);return}}
  const box=E('section','tw-box');box.append(E('h3','','동네 게시판 · 분실물 · 나눔 · 칭찬 · 질문'));const tbl=E('div','tw-list');
  for(const x of mine.slice().reverse()){const row=E('div','tw-row mine');row.append(E('em','','['+x.c+']'),E('b','',x.t),E('small','',x.n+' · 방금'));tbl.append(row)}
  for(const x of TOWN_BOARD){const row=B('',()=>go({type:'post',id:x[0]}),'tw-row');row.append(E('em','','['+x[1]+']'),E('b','',x[2]+' ['+x[6].length+']'),E('small','',x[3]+' · '+x[4]));tbl.append(row)}box.append(tbl);
  const f=E('form','tw-form'),cat=E('select'),t=K.field(E,'제목 (40자)',40,'제목'),nick=K.field(E,'닉네임',10,'닉네임');cat.setAttribute('aria-label','말머리');for(const c of ['분실물','나눔','칭찬합니다','질문','이웃 소식']){const o=E('option','',c);o.value=c;cat.append(o)}nick.value='동네주민';const sb=B('글쓰기',()=>{},'tw-btn');sb.type='submit';f.append(cat,nick,t,sb);const warn=E('p','tw-warn','');
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const title=String(t.value||'').trim().slice(0,40);if(!title)return;if(PRIVATE.test(title)){warn.textContent='전화번호나 주소 같은 개인정보는 쓸 수 없어요.';return}mine.push({c:cat.value||'질문',t:title,n:String(nick.value||'').trim().slice(0,10)||'동네주민'});s.posts=mine.slice(-12);ctx.save();ctx.rerender()});box.append(f,warn);body.append(box);return}
 if(r.type==='notice'){const box=E('section','tw-box tw-notice');box.append(E('h3','','은하아파트 관리사무소 알림'));for(const [id,t,at,x] of TOWN_NOTICE){const n=E('article','tw-note-card');n.append(E('b','',t),E('small','',' 2006.'+at),E('p','',x));box.append(n)}box.append(E('p','tw-note','관리사무소 근무: 평일 오전 9시 ~ 오후 6시 · 토요일 오전 9시 ~ 오후 1시'));body.append(box);return}
 if(r.type==='vote'){for(const [id,q,opts] of POLLS){const box=E('section','tw-box tw-poll');box.append(E('h3','',q));const my=s.votes[id];const total=opts.reduce((a,o,i)=>a+o[1]+(my===i?1:0),0);
   opts.forEach(([label,n],i)=>{const v=n+(my===i?1:0),pct=Math.round(v*100/Math.max(1,total));const row=E('div','tw-vrow'+(my===i?' mine':''));row.append(my==null?B(label,()=>{s.votes[id]=i;ctx.save();ctx.rerender()},'tw-vbtn'):E('b','',label+(my===i?' ✓':'')),K.bar(E,label,pct),E('span','',pct+'% ('+v+'표)'));box.append(row)});
   box.append(E('p','tw-note',my==null?'한 번만 투표할 수 있어요.':'투표해 주셔서 고마워요! 총 '+total+'표'));body.append(box)}return}
 /* 첫 화면 */
 if(!s.seen){s.seen=1;s.visit++;ctx.save()}
 const top=E('section','tw-box tw-today');top.append(E('h3','','오늘의 우리 동네 · 5월 30일 (화) 맑음 26℃'));
 for(const t of ['은하분식 오늘의 메뉴: 컵떡볶이 500원, 설탕 핫도그 700원, 파란 슬러시 300원','진영제과: 오후 4시 소보로빵 나왔어요','뮤직박스: 별빛소녀 2집 예약하면 브로마이드 증정 (선착순)','은하 비디오: 이번 주 신작 테이프 들어왔어요','내일(31일)은 지방선거일, 투표소는 동일초등학교 강당'])top.append(E('p','tw-li','· '+t));body.append(top);
 const two=E('div','tw-two');const lb=E('section','tw-box');lb.append(E('h3','','새 글 · 동네 게시판'));for(const x of TOWN_BOARD.slice(0,6))lb.append(B('['+x[1]+'] '+x[2],()=>go({type:'post',id:x[0]}),'tw-link'));
 const rb=E('section','tw-box');rb.append(E('h3','','별점 높은 가게'));const ranked=PLACES.map(p=>[p,avg(p[6].map(x=>x[2]))]).sort((a,b)=>b[1]-a[1]).slice(0,6);for(const [p,a] of ranked)rb.append(B(p[1]+'  '+stars(Math.round(a)),()=>go({type:'shop',id:p[0]}),'tw-link'));two.append(lb,rb);body.append(two);
 const mp=E('section','tw-box tw-mini');mp.append(E('h3','','동네 약도 미리 보기'));const [c,g]=cv(env,'tw-map small',640,380);if(g)try{drawTown(g,'','')}catch(_){}mp.append(c,B('크게 보기 ▶',()=>go({type:'map'}),'tw-btn'));c.addEventListener('pointerdown',()=>go({type:'map'}));body.append(mp)}

/* =====================================================================
   2. 동일초등학교
   ===================================================================== */
const DG_NOTICE=[
 ['g1','5월 31일(수) 지방선거일 휴업 안내','05.26 15:00','학부모님께\n\n5월 31일(수)은 전국동시지방선거일로 법정 공휴일입니다. 이날은 학교를 쉽니다. 우리 학교 강당은 투표소로 쓰이니 학생들은 운동장과 강당 근처에서 놀지 않도록 지도해 주시기 바랍니다.\n\n6월 1일(목)에는 평소처럼 등교합니다.'],
 ['g2','여름철 식중독 예방 및 손 씻기 지도 안내','05.29 11:30','날씨가 더워지면서 식중독이 걱정되는 때입니다. 학교에서는 급식 전 손 씻기를 지도하고 있습니다.\n\n가정에서도 외출 후와 식사 전에 비누로 30초 이상 손을 씻도록 지도해 주세요. 학교 앞에서 파는 음식은 날씨가 더울 때 쉽게 상할 수 있으니 주의해 주시기 바랍니다.\n\n※ 이 통신문을 읽으시고 아래 확인란에 도장을 찍어 보내 주세요.'],
 ['g3','방과 후 교실 2기 수강생 모집 (컴퓨터, 미술, 바둑, 영어 동화)','05.24 09:00','6월부터 방과 후 교실 2기를 시작합니다.\n\n· 컴퓨터: 한글 타자, 문서 만들기, 인터넷 예절 (컴퓨터실)\n· 미술: 만화 그리기, 찰흙 공예\n· 바둑: 처음 배우는 바둑\n· 영어 동화: 원어민 선생님과 동화 읽기\n\n신청서는 6월 2일(금)까지 담임 선생님께 내 주세요. 수강료는 과목마다 다릅니다.'],
 ['g4','학교 앞 불량 식품 구입 자제 안내','05.22 14:00','요즘 학교 앞 문구점과 가게에서 파는 값싼 과자와 사탕 가운데 원산지나 유통 기한이 표시되지 않은 것이 있습니다.\n\n아이들이 먹을거리를 살 때 포장의 표시를 확인하는 습관을 갖도록 가정에서도 함께 이야기해 주세요. 학교에서는 바른 먹을거리 교육을 하고 있습니다.'],
 ['g5','독일 월드컵 기간 늦은 밤 시청과 거리 응원 안전 지도','05.30 10:00','6월에는 독일 월드컵 경기가 늦은 밤과 새벽에 열립니다. 우리나라 첫 경기(토고전)는 6월 13일(화) 밤 10시입니다.\n\n밤늦게 경기를 볼 때는 가족과 함께 보고, 다음 날 지각하지 않도록 지도해 주세요. 거리 응원은 반드시 보호자와 함께하고 사람이 많은 곳에서는 손을 꼭 잡아 주세요.'],
 ['g6','제1회 동일 한마음 체육대회 결과','05.27 16:30','5월 25일(목) 체육대회를 무사히 마쳤습니다. 응원해 주신 학부모님께 감사드립니다.\n\n· 청백 계주: 청군 승리\n· 6학년 이어달리기: 1등 6학년 3반\n· 5학년 줄다리기: 1등 5학년 2반\n· 저학년 공 굴리기: 모두 함께 박수!\n\n사진은 학교 앨범에 올려 두었습니다.'],
 ['g7','현충일(6월 6일) 조기 게양 안내','05.30 09:30','6월 6일 현충일에는 조기를 답니다. 가정에서도 깃봉에서 깃발 폭만큼 내려 달아 주세요. 학교에서는 6월 5일(월)에 나라를 위해 희생하신 분들을 생각하는 계기 교육을 합니다.'],
 ['g8','학교 홈페이지 자유게시판 이용 약속','05.10 08:40','자유게시판은 우리 학교 학생들이 즐겁게 이야기하는 곳입니다.\n\n1. 진짜 이름, 전화번호, 집 주소는 쓰지 않습니다.\n2. 친구를 놀리거나 나쁜 말을 쓰지 않습니다.\n3. 같은 글을 여러 번 올리지 않습니다 (도배 금지).\n\n약속을 지키지 않은 글은 선생님이 지울 수 있습니다.']
];
/* 5월 급식 (평일). 5일 어린이날, 31일 지방선거는 쉰다 */
const DG_MEAL={1:'쌀밥 · 쇠고기미역국 · 돼지고기김치볶음 · 계란말이 · 배추김치 · 우유',2:'잡곡밥 · 감자국 · 닭볶음탕 · 시금치나물 · 깍두기 · 요구르트',3:'짜장덮밥 · 달걀국 · 군만두 · 단무지무침 · 배추김치 · 바나나',4:'쌀밥 · 된장찌개 · 생선가스 · 콩나물무침 · 배추김치 · 우유',
 8:'쌀밥 · 소고기뭇국 · 불고기 · 잡채 · 배추김치 · 어버이날 떡',9:'비빔밥 · 계란국 · 동그랑땡 · 열무김치 · 우유',10:'스파게티 · 옥수수수프 · 마늘빵 · 오이피클 · 오렌지주스',11:'쌀밥 · 오징어뭇국 · 닭강정 · 오이무침 · 배추김치',12:'김치볶음밥 · 유부국 · 소시지야채볶음 · 단무지 · 요구르트',
 15:'찹쌀밥 · 쇠고기미역국 · 떡갈비 · 브로콜리무침 · 배추김치 · 스승의 날 백설기',16:'쌀밥 · 순두부찌개 · 제육볶음 · 상추쌈 · 깍두기',17:'하이라이스 · 맑은 콩나물국 · 감자튀김 · 배추김치 · 우유',18:'보리밥 · 아욱국 · 고등어조림 · 무생채 · 배추김치',19:'쌀밥 · 어묵국 · 돈가스 · 양배추샐러드 · 배추김치 · 수박',
 22:'잡곡밥 · 북엇국 · 돼지갈비찜 · 숙주나물 · 배추김치',23:'볶음밥 · 짬뽕국 · 탕수육 · 단무지 · 요구르트',24:'쌀밥 · 김칫국 · 닭다리튀김 · 감자샐러드 · 깍두기',25:'체육대회 날: 유부초밥 · 미니 핫도그 · 과일 컵 · 이온 음료',26:'쌀밥 · 근대된장국 · 함박스테이크 · 마카로니샐러드 · 배추김치',
 29:'콩밥 · 콩나물국 · 오징어볶음 · 김구이 · 배추김치',30:'카레라이스 · 미소된장국 · 치킨너겟 · 깍두기 · 요구르트 · 수박'};
const DG_OFF={5:'어린이날',31:'지방선거일'};
const DG_BOARD=[
 ['d1','오늘 급식 카레 나온다!!!','카레좋아','05.30 08:20','식단표 봤는데 오늘 카레라이스에 치킨너겟이랑 수박까지 나온대 ㅠㅠ 4교시 빨리 끝나라~ 우리 반은 4교시가 체육이라 배 엄청 고플 듯',['우리 반 1등으로 먹으러 간다 ㅋㅋ','카레에 깍두기 조합 최고','ㄴ 인정 ㅋㅋㅋ','수박 큰 거 주세요 급식 아주머니~']],
 ['d2','내일 학교 안 가는 거 맞죠?','궁금이','05.30 13:10','엄마가 내일 지방선거라서 학교 안 간다는데 진짜예요? 숙제 검사 내일 아니죠? ㅋㅋ',['가정통신문에 나와 있어 ㅋㅋ 쉬는 날!','ㄴ 대신 숙제는 목요일까지야','강당이 투표소래요']],
 ['d3','운동장 철봉 거꾸로 매달리기 1분 성공 ㅋㅋ','철봉왕','05.29 17:30','방과 후에 운동장 철봉에서 거꾸로 매달리기 1분 했어요!! 하늘이 땅처럼 보여요 ㅋㅋ 근데 내려올 때 머리가 띵함',['나는 30초가 한계 ㅠㅠ','조심해 다치지 말고!','ㄴ 철봉 밑에 모래 꼭 확인하기']],
 ['d4','방과 후 컴퓨터 교실 2기 신청했어요','타자연습','05.28 20:10','한글 타자 300타 넘는 게 목표예요. 엄마가 독수리 타법 고치래요 ㅋㅋ 같이 신청한 사람?',['저도요!! 산성비 게임 하게 해 주시면 좋겠다','300타면 엄청 빠른 거 아님?','ㄴ 우리 형은 500타 ㄷㄷ']],
 ['d5','[5학년] 줄다리기 1등 했다!!','5학년2반','05.27 18:00','체육대회 줄다리기에서 우리 반이 1등 했어요!! 선생님이 아이스크림 사 주신대요 ㅋㅋㅋ 손바닥 아직도 빨개요',['축하해~ 우리 반은 2등 ㅠㅠ','아이스크림 부럽다','ㄴ 우리 반도 사 주세요 선생님']],
 ['d6','별빛문구 100원 뽑기 기계 바뀜!!','뽑기장인','05.26 16:45','오늘 보니까 별빛문구 앞 뽑기 기계 새 걸로 바뀜. 반지사탕이랑 미니 지우개 들어 있어요. 손잡이가 더 뻑뻑해짐 ㅋㅋ',['오늘 가 봐야지','반지사탕 나오면 대박','ㄴ 학교 끝나고 바로 가면 줄 김 ㅋㅋ']],
 ['d7','학교 앞 녹색어머니회 감사합니다','6학년3반','05.24 09:20','아침마다 횡단보도에서 깃발 들어 주시는 어머니들 감사합니다! 비 오는 날에도 서 계셔서 감동했어요.',['맞아요 감사해요 ^^','우리 엄마도 다음 주 당번이래요','훈훈하다']],
 ['d8','[공지] 자유게시판 이용 약속 (선생님)','정보부장쌤','05.10 08:40','진짜 이름, 전화번호, 집 주소는 쓰지 않기! 친구 놀리는 글, 같은 글 여러 번 올리기(도배)는 선생님이 지웁니다. 서로 아껴 주는 게시판이 되었으면 좋겠어요.',['네~','알겠습니다 선생님!','도배 금지 ㅋㅋ']]
];
const DG_HOMEWORK=['수학 익힘책 64~65쪽 풀어 오기','가정통신문(식중독 예방) 부모님 확인 도장 받아 오기','국어 5단원 받아쓰기 연습 (6월 1일 시험)','실내화 빨아 오기','내일(31일)은 쉬는 날! 6월 1일(목)에 만나요'];
const DG_ALBUM=[['sports','제1회 한마음 체육대회','5월 25일 · 만국기 아래 청군 백군 응원전'],['rocket','과학의 날 물로켓 대회','4월 21일 · 제일 멀리 날아간 로켓은 운동장 끝까지!'],['flower','학교 화단의 개나리','4월 · 교화 개나리가 활짝 핀 화단'],['class','5학년 2반 교실','5월 · 학급 게시판을 새로 꾸몄어요']];
function drawAlbum(g,kind,W,H){const sky=g.createLinearGradient?g.createLinearGradient(0,0,0,H):null;if(sky){sky.addColorStop(0,'#bfe3ff');sky.addColorStop(1,'#eaf6ff');g.fillStyle=sky}else g.fillStyle='#bfe3ff';g.fillRect(0,0,W,H);
 if(kind==='sports'){rect(g,0,H*.6,W,H*.4,'#d9c08a');for(let i=0;i<14;i++){const x=i*W/13;rect(g,x,18+Math.sin(i)*3,W/16,10,['#e84d4d','#3a6fd8','#ffd23f','#5aab4a','#fff'][i%5])}g.strokeStyle='#555';g.beginPath();g.moveTo(0,20);g.quadraticCurveTo(W/2,34,W,20);g.stroke();for(let i=0;i<9;i++){const x=20+i*(W-40)/8,team=i%2;circ(g,x,H*.62,7,'#ffdcb8');rect(g,x-6,H*.62+6,12,14,team?'#3a6fd8':'#fff');rect(g,x-7,H*.62-8,14,4,team?'#3a6fd8':'#fff')}txt(g,'청군 이겨라! 백군 이겨라!',W/2,H*.9,'#5a3a10',13)}
 else if(kind==='rocket'){rect(g,0,H*.75,W,H*.25,'#d9c08a');g.strokeStyle='#fff';g.lineWidth=2;g.setLineDash&&g.setLineDash([4,4]);g.beginPath();g.moveTo(40,H*.75);g.quadraticCurveTo(W/2,-10,W-30,H*.4);g.stroke();g.setLineDash&&g.setLineDash([]);if(g.save){g.save();g.translate(W-36,H*.42);g.rotate(.9)}rect(g,-6,-18,12,30,'#e8e8f0');g.fillStyle='#e84d4d';g.beginPath();g.moveTo(-6,-18);g.lineTo(0,-28);g.lineTo(6,-18);g.fill();if(g.restore)g.restore();for(let i=0;i<6;i++)circ(g,44+i*6,H*.72-i*4,4,'rgba(120,200,255,.7)');txt(g,'물로켓 발사!',W/2,H*.92,'#5a3a10',13)}
 else if(kind==='flower'){rect(g,0,H*.62,W,H*.38,'#7a5232');for(let i=0;i<10;i++){const x=16+i*(W-32)/9;rect(g,x-1,H*.36,2,H*.3,'#5a8a2a');for(let k=0;k<6;k++)circ(g,x+Math.cos(k)*8,H*.36+Math.sin(k*1.7)*10,4,'#ffd23f')}txt(g,'교화: 개나리',W/2,H*.9,'#fff',13)}
 else{rect(g,0,0,W,H,'#e8dcc0');rect(g,W*.1,H*.12,W*.8,H*.42,'#2f5a3a');txt(g,'5학년 2반',W/2,H*.3,'#fff',15);txt(g,'서로 돕는 우리 반',W/2,H*.45,'#ffe8a0',11);for(let i=0;i<4;i++)rect(g,W*.12+i*W*.2,H*.62,W*.16,H*.2,['#ffb0c8','#b0d8ff','#c8f0a8','#ffe0a0'][i]);rect(g,0,H*.92,W,H*.08,'#a0703a')}}
function drawBadge(g){circ(g,40,40,36,'#2a6ad8');circ(g,40,40,30,'#fff');g.fillStyle='#2a6ad8';g.beginPath();g.moveTo(40,14);g.lineTo(47,32);g.lineTo(66,32);g.lineTo(51,43);g.lineTo(57,62);g.lineTo(40,50);g.lineTo(23,62);g.lineTo(29,43);g.lineTo(14,32);g.lineTo(33,32);g.fill();txt(g,'동일',40,46,'#fff',11)}
function dongilPage(page,env){const {E,B,go,r,k,ctx}=env,s=obj(k,'dongil');if(!s.hw||typeof s.hw!=='object'||Array.isArray(s.hw))s.hw={};if(!s.meal||typeof s.meal!=='object'||Array.isArray(s.meal))s.meal={};arr(s,'posts',10);
 const head=E('header','dg-head'),[bc,bg]=cv(env,'dg-badge',80,80);if(bg)try{drawBadge(bg)}catch(_){}const tt=E('div','dg-ttl');tt.append(E('b','','동일초등학교'),E('small','','바르게 · 슬기롭게 · 튼튼하게'));head.append(bc,tt,E('span','dg-motto','꿈을 키우는 즐거운 배움터'));page.append(head);
 const nav=E('nav','dg-nav');for(const [type,label] of [['home','처음으로'],['about','학교 소개'],['notice','가정통신문'],['meal','이달의 급식'],['board','자유게시판'],['album','학교 앨범']])nav.append(B(label,()=>go({type}),'dg-tab'+((r.type===type||(type==='board'&&r.type==='post'))?' on':'')));page.append(nav);
 const body=E('main','dg-body');page.append(body);
 const noticeRow=(x,box)=>{const row=B('',()=>go({type:'notice',id:x[0]}),'dg-row');row.append(E('b','',x[1]),E('small','',x[2].slice(0,5)));box.append(row)};
 if(r.type==='about'){const box=E('section','dg-box');box.append(E('h3','','학교 소개'));for(const [a,b] of [['교훈','바르게 · 슬기롭게 · 튼튼하게'],['교목','은행나무 (운동장 가의 큰 나무)'],['교화','개나리'],['개교','1988년 3월 2일 (올해 졸업생 제16회)'],['학생 수','24학급 · 812명'],['오시는 길','은하아파트 정문에서 별빛문구 골목을 지나 정문까지 걸어서 5분']]){const p=E('p','dg-kv');p.append(E('b','',a),E('span','',b));box.append(p)}body.append(box);
  const song=E('section','dg-box dg-song');song.append(E('h3','','교가'));song.append(E('pre','','1. 은행잎 푸르른 동산 위에서\n   새 꿈을 키우는 우리들\n   바르게 슬기롭게 튼튼하게\n   빛나라 빛나라 동일 어린이\n\n2. 웃음이 가득한 운동장에서\n   서로를 아끼는 마음 모아\n   내일을 여는 주인공 되어\n   힘차게 나가자 동일 어린이'),E('small','dg-note','작사 · 작곡: 개교 때 선생님들이 함께 지었습니다'));body.append(song);return}
 if(r.type==='notice'){const x=DG_NOTICE.find(n=>n[0]===r.id);if(x){const box=E('section','dg-box dg-letter');box.append(E('p','dg-note','가정통신문 · 2006.'+x[2]),E('h3','',x[1]),E('pre','',x[3]),E('p','dg-sign','동일초등학교장'),B('◀ 목록으로',()=>go({type:'notice'}),'dg-btn small'));body.append(box);return}
  const box=E('section','dg-box');box.append(E('h3','','가정통신문'));for(const n of DG_NOTICE)noticeRow(n,box);body.append(box);return}
 if(r.type==='meal'){const box=E('section','dg-box');box.append(E('h3','','2006년 5월 급식 차림표'));const cal=E('div','dg-cal');for(const d of ['월','화','수','목','금'])cal.append(E('b','',d));
  const pick=E('div','dg-mealpick');let day=Number(r.id)||30;
  const show=()=>{pick.replaceChildren();const m=DG_MEAL[day];pick.append(E('h4','','5월 '+day+'일'+(day===30?' (오늘)':'')),E('p','',m||(DG_OFF[day]?DG_OFF[day]+'이라 학교를 쉬어요':'급식이 없는 날이에요')));if(m){const rate=E('div','dg-rate');rate.append(E('span','','맛 평가: '));for(let i=1;i<=5;i++)rate.append(B(i<=(s.meal[day]||0)?'★':'☆',()=>{s.meal[day]=i;ctx.save();show();paint()},'dg-star'));pick.append(rate)}};
  const cells=[];const paint=()=>{for(const [d,b] of cells)b.className='dg-day'+(d===day?' on':'')+(d===30?' today':'')+(DG_OFF[d]?' off':'')+(s.meal[d]?' rated':'')};
  /* 2006년 5월 1일은 월요일이라 평일만 다섯 칸씩 채우면 요일이 맞는다 */
  for(let d=1;d<=31;d++){if((d-1)%7>4)continue;const b=B('',()=>{day=d;paint();show()},'dg-day');b.append(E('b','',String(d)),E('small','',DG_OFF[d]||(DG_MEAL[d]?DG_MEAL[d].split(' · ')[0]:'')));cells.push([d,b]);cal.append(b)}
  box.append(cal,pick);body.append(box);paint();show();box.append(E('p','dg-note','※ 식재료 사정에 따라 차림표가 바뀔 수 있습니다. 우유는 매일 나옵니다.'));return}
 if(r.type==='board'||r.type==='post'){const mine=s.posts;
  if(r.type==='post'){const x=DG_BOARD.find(b=>b[0]===r.id);if(x){const box=E('section','dg-box');box.append(E('h3','',x[1]),E('p','dg-note',x[2]+' · '+x[3]),E('p','dg-text',x[4]));for(const t of x[5])box.append(E('p','dg-cm'+(t.startsWith('ㄴ')?' nest':''),t));box.append(B('◀ 목록으로',()=>go({type:'board'}),'dg-btn small'));body.append(box);return}}
  const box=E('section','dg-box');box.append(E('h3','','자유게시판'),E('p','dg-rule','진짜 이름, 전화번호, 집 주소는 쓰지 않기 · 친구 놀리지 않기 · 도배 금지'));
  for(const x of mine.slice().reverse()){const row=E('div','dg-row mine');row.append(E('b','',x.t),E('small','',x.n+' · 방금'));box.append(row)}
  for(const x of DG_BOARD){const row=B('',()=>go({type:'post',id:x[0]}),'dg-row');row.append(E('b','',x[1]+' ['+x[5].length+']'),E('small','',x[2]+' · '+x[3]));box.append(row)}
  const f=E('form','dg-form'),nick=K.field(E,'별명',10,'별명'),t=K.field(E,'글 제목 (40자)',40,'글 제목');nick.value='동일어린이';const sb=B('글쓰기',()=>{},'dg-btn');sb.type='submit';f.append(nick,t,sb);const warn=E('p','dg-warn','');
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const title=String(t.value||'').trim().slice(0,40);if(!title)return;if(PRIVATE.test(title)){warn.textContent='전화번호나 주소 같은 개인정보는 쓸 수 없어요.';return}mine.push({t:title,n:String(nick.value||'').trim().slice(0,10)||'동일어린이'});s.posts=mine.slice(-10);ctx.save();ctx.rerender()});box.append(f,warn);body.append(box);return}
 if(r.type==='album'){const box=E('section','dg-box');box.append(E('h3','','학교 앨범'));const grid=E('div','dg-album');for(const [kind,t,d] of DG_ALBUM){const card=E('figure','dg-photo'),[c,g]=cv(env,'dg-pic',240,160);if(g)try{drawAlbum(g,kind,240,160)}catch(_){}card.append(c,E('figcaption','',t),E('small','',d));grid.append(card)}box.append(grid);body.append(box);return}
 /* 처음으로: 학교 소식, 오늘 급식, 알림장 */
 const two=E('div','dg-two');const nb=E('section','dg-box');nb.append(E('h3','','학교 소식'));for(const n of DG_NOTICE.slice().sort((a,b)=>a[2]<b[2]?1:-1).slice(0,5))noticeRow(n,nb);
 const mb=E('section','dg-box dg-today');mb.append(E('h3','','오늘의 급식 · 5월 30일 (화)'),E('p','',DG_MEAL[30]),B('5월 급식표 보기',()=>go({type:'meal'}),'dg-btn small'));two.append(nb,mb);body.append(two);
 const hw=E('section','dg-box dg-hw');hw.append(E('h3','','5학년 2반 알림장 · 5월 30일 (화)'));DG_HOMEWORK.forEach((t,i)=>{const row=B((s.hw[i]?'☑ ':'☐ ')+t,()=>{s.hw[i]=!s.hw[i];ctx.save();ctx.rerender()},'dg-hwrow'+(s.hw[i]?' done':''));hw.append(row)});
 const done=DG_HOMEWORK.filter((_,i)=>s.hw[i]).length;hw.append(E('p','dg-note',done===DG_HOMEWORK.length?'참 잘했어요! 숙제를 모두 끝냈어요 ☆':'다 한 숙제를 눌러서 체크해 보세요 ('+done+'/'+DG_HOMEWORK.length+')'));body.append(hw);
 const ev=E('section','dg-box');ev.append(E('h3','','학사 일정'));for(const t of ['5월 31일(수) 지방선거일 휴업','6월 1일(목) 국어 받아쓰기','6월 5일(월) 현충일 계기 교육','6월 6일(화) 현충일','6월 13일(화) 독일 월드컵 토고전 (밤 10시)'])ev.append(E('p','dg-li','· '+t));body.append(ev)}

/* =====================================================================
   3. 폰꾸미기 천국
   ===================================================================== */
/* 벨소리: [id, 제목, 부른 이, 화음, 빠르기, 가락(높은 소리), 반주(낮은 소리), 받은 수] */
const RINGS=[
 ['r1','반짝반짝 첫사랑','별빛소녀','64화음',132,'E5:0.5 E5:0.5 G5:0.5 E5:0.5 D5:1 C5:1 D5:0.5 E5:0.5 G5:0.5 A5:0.5 G5:2 A5:0.5 A5:0.5 C6:0.5 A5:0.5 G5:1 E5:1 D5:0.5 E5:0.5 D5:0.5 C5:0.5 D5:2','C3:2 A2:2 F2:2 G2:2 C3:2 A2:2 F2:2 G2:2',48210],
 ['r2','우산 속 두 사람','한여름 밴드','40화음',96,'A4:1 C5:0.5 D5:0.5 E5:1.5 D5:0.5 C5:1 B4:1 A4:2 G4:1 A4:0.5 B4:0.5 C5:1.5 B4:0.5 A4:1 G4:1 E4:2','A2:4 F2:4 C3:4 E2:4',31877],
 ['r3','새벽 두 시 라디오','미드나잇','40화음',80,'G4:1.5 A4:0.5 B4:1 D5:1 C5:1.5 B4:0.5 A4:2 E4:1 F#4:1 G4:1 A4:1 B4:3 R:1','G2:4 E2:4 C3:4 D3:4',22105],
 ['r4','엘리제를 위하여','베토벤 (클래식)','16화음',120,'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5 R:0.5 C4:0.5 E4:0.5 A4:0.5 B4:1.5 R:0.5 E4:0.5 G#4:0.5 B4:0.5 C5:1.5','A2:3 E2:3 A2:2',40552],
 ['r5','캐논 변주곡','파헬벨 (클래식)','64화음',72,'F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2','D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2',36920],
 ['r6','터키 행진곡','모차르트 (클래식)','16화음',132,'B4:0.25 A4:0.25 G#4:0.25 A4:0.25 C5:1 D5:0.25 C5:0.25 B4:0.25 C5:0.25 E5:1 F5:0.25 E5:0.25 D#5:0.25 E5:0.25 B5:0.25 A5:0.25 G#5:0.25 A5:0.25 B5:0.25 A5:0.25 G#5:0.25 A5:0.25 C6:2','A2:1 E3:1 A2:1 E3:1 A2:1 E3:1 A2:1',18304],
 ['r7','반짝반짝 작은 별','동요 (외국 곡)','16화음',116,'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2','C3:2 F3:2 C3:2 G2:2 F2:2 C3:2 G2:2 C3:2',15230],
 ['r8','붉은 함성 응원가','응원단 밴드','40화음',128,'G4:1.5 G4:0.5 C5:1 C5:1 R:1 C5:0.5 C5:0.5 C5:0.5 C5:0.5 C5:1 G4:1.5 G4:0.5 E5:1 D5:1 C5:2','C3:1 G2:1 C3:1 G2:1 C3:1 G2:1 C3:1 G2:1 C3:4',51990],
 ['r9','문자 왔숑','효과음','16화음',120,'E6:0.25 G6:0.25 C7:0.5 R:0.5 E6:0.25 G6:0.25 C7:0.5','C4:2',63412],
 ['r10','전화 받아라~','효과음','16화음',150,'A5:0.5 E5:0.5 A5:0.5 E5:0.5 A5:0.5 E5:0.5 R:1 A5:0.5 E5:0.5 A5:0.5 E5:0.5 A5:0.5 E5:0.5','A3:4 A3:3',27711]
];
const PHONE_WALLS=[['cat','별밤 고양이'],['heart','하트 뿅뿅'],['cup','태극 응원'],['sea','바다와 갈매기'],['cherry','벚꽃 길'],['chick','삐약 병아리'],['rocket','우주 로켓'],['bear','체크 무늬 곰']];
function drawWall(g,kind,W,H){const sx=W/120,sy=H/160;if(g.save){g.save();g.scale(sx,sy)}const grad=(a,b)=>{const gr=g.createLinearGradient?g.createLinearGradient(0,0,0,160):null;if(gr){gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr}else g.fillStyle=a;g.fillRect(0,0,120,160)};
 switch(kind){
  case 'cat':grad('#0a1440','#28407a');for(let i=0;i<24;i++)rect(g,(i*37)%120,(i*53)%100,2,2,'#fff6c8');circ(g,92,22,10,'#fff2a8');circ(g,96,19,9,'#1a2a5a');circ(g,60,128,24,'#222');circ(g,60,96,16,'#222');g.fillStyle='#222';g.beginPath();g.moveTo(46,88);g.lineTo(44,72);g.lineTo(56,84);g.fill();g.beginPath();g.moveTo(74,88);g.lineTo(76,72);g.lineTo(64,84);g.fill();circ(g,54,95,2.5,'#ffd23f');circ(g,66,95,2.5,'#ffd23f');rect(g,80,138,26,5,'#222');break;
  case 'heart':grad('#ffd6e8','#ff9cc8');for(let i=0;i<9;i++){const x=14+(i%3)*44,y=24+Math.floor(i/3)*48,s=i%2?8:12;circ(g,x-s/2,y,s/2+1,'#ff4f9a');circ(g,x+s/2,y,s/2+1,'#ff4f9a');g.fillStyle='#ff4f9a';g.beginPath();g.moveTo(x-s-1,y+1);g.lineTo(x,y+s+4);g.lineTo(x+s+1,y+1);g.fill()}txt(g,'♡ 사랑해 ♡',60,152,'#fff',11);break;
  case 'cup':grad('#ffffff','#f4f4f4');circ(g,60,70,30,'#e8302a');g.fillStyle='#2a4ad8';g.beginPath();g.arc(60,70,30,0,Math.PI);g.fill();circ(g,45,70,15,'#e8302a');circ(g,75,70,15,'#2a4ad8');for(const [x,y] of [[16,22],[96,22],[16,118],[96,118]]){rect(g,x,y,10,3,'#111');rect(g,x,y+5,10,3,'#111');rect(g,x,y+10,10,3,'#111')}txt(g,'대~한민국!',60,140,'#e8302a',13);break;
  case 'sea':grad('#7ac8ff','#bfe8ff');rect(g,0,96,120,64,'#2a7ad8');for(let i=0;i<6;i++)rect(g,(i*29)%110,104+i*8,16,2,'#bfe6ff');circ(g,24,30,12,'#fff2a8');for(const [x,y] of [[60,40],[84,56],[40,64]]){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(x-8,y);g.quadraticCurveTo(x-4,y-5,x,y);g.quadraticCurveTo(x+4,y-5,x+8,y);g.stroke()}break;
  case 'cherry':grad('#e8f4ff','#fff0f6');rect(g,52,60,8,100,'#7a4a2a');for(let i=0;i<30;i++)circ(g,20+(i*41)%84,20+(i*23)%60,5,i%3?'#ffc8dc':'#ffb0cc');for(let i=0;i<10;i++)circ(g,(i*31)%120,100+(i*17)%56,2,'#ffb0cc');break;
  case 'chick':grad('#e8ffd8','#c8f0a8');rect(g,0,120,120,40,'#8fd16a');circ(g,60,100,26,'#ffe04a');circ(g,60,68,18,'#ffe04a');circ(g,54,66,2.5,'#222');circ(g,66,66,2.5,'#222');g.fillStyle='#ff8a1a';g.beginPath();g.moveTo(56,72);g.lineTo(64,72);g.lineTo(60,78);g.fill();txt(g,'삐약!',60,30,'#5a8a2a',14);break;
  case 'rocket':grad('#05051a','#1a1a4a');for(let i=0;i<30;i++)rect(g,(i*47)%120,(i*29)%160,1.5,1.5,'#fff');circ(g,26,130,16,'#5a8ad8');rect(g,52,40,16,60,'#e8e8f0');g.fillStyle='#e84d4d';g.beginPath();g.moveTo(52,40);g.lineTo(60,22);g.lineTo(68,40);g.fill();circ(g,60,58,5,'#7ad0ff');rect(g,46,86,8,16,'#e84d4d');rect(g,66,86,8,16,'#e84d4d');circ(g,60,108,6,'#ffb02a');circ(g,60,116,4,'#ffe04a');break;
  default:grad('#fff6e0','#ffe8c0');for(let x=0;x<120;x+=20)rect(g,x,0,10,160,'rgba(255,170,90,.18)');for(let y=0;y<160;y+=20)rect(g,0,y,120,10,'rgba(255,170,90,.18)');circ(g,60,92,30,'#b07a44');circ(g,60,58,22,'#b07a44');circ(g,42,40,8,'#b07a44');circ(g,78,40,8,'#b07a44');circ(g,60,64,8,'#e8c89a');circ(g,53,54,2.5,'#222');circ(g,67,54,2.5,'#222');circ(g,60,62,2.5,'#222')}
 if(g.restore)g.restore()}
const CONTACTS=[['mom','엄마',[[/학원|공부|숙제/,'학원 끝나면 바로 와~ 저녁은 김치찌개'],[/PC방|피방|게임|카트/,'PC방 그만하고 6시까지 들어와!!'],[/사랑|♡|♥/,'엄마도 사랑해 ♡ 근데 숙제는?'],[/배고|밥|떡볶이/,'군것질 조금만 하고 밥 먹어~']],'응 알았어~ 일찍 들어와'],
 ['minho','단짝 민호',[[/PC방|피방|게임|카트/,'ㅇㅇ 지금 감 ㅋㅋ 17번 자리 맡아 놔'],[/떡볶이|분식|핫도그/,'은하분식 ㄱㄱ 내가 핫도그 쏨'],[/숙제|공부/,'숙제 뭐였지 ㅋㅋ 알림장 사진 찍어 보내 줘'],[/ㅋ/,'ㅋㅋㅋㅋ']],'ㅋㅋ 뭐함?'],
 ['teacher','학원 쌤',[[/숙제|시험/,'오늘 숙제 꼭 해 오세요 ^^ 질문은 학원에서~'],[/늦|못 가|아파/,'알겠어요. 다음 시간에 보충해요. 몸조리 잘해요']],'네~ 오늘 수업 늦지 마세요 ^^'],
 ['bro','우리 형',[[/돈|용돈|빌려/,'형도 없다 ㅡㅡ'],[/게임|PC방/,'엄마한테 이른다 ㅋㅋ']],'왜 ㅡㅡ 형 바쁨']];
const SMS_ART=[['생일 축하','┏━━━━━━┓\n┃생일 축하해♡┃\n┗━━━━━━┛'],['하트 뿅뿅','♡♥♡♥♡♥\n 사랑해요 ^^\n♥♡♥♡♥♡'],['토끼','(\\_/)\n(=\'.\'=)\n(")_(")'],['응원','★ 대~한민국 ★\n짝짝 짝 짝짝!'],['비 오는 날','☂ 비 와요 ☂\n우산 꼭 챙겨~'],['잘 자','☆。.:*・゜\n 잘 자 좋은 꿈 ☾\n゜・*:.。☆'],['시험 화이팅','시험 화이팅!!\n(^o^)/ 아자아자'],['미안해','(._.) 미안해...\n화 풀어 줘 ㅠㅠ']];
/* 문자 바이트: 한글과 특수문자는 2바이트, 영문 숫자 공백은 1바이트 */
const smsBytes=s=>{let n=0;for(const ch of String(s||''))n+=ch.charCodeAt(0)<128?1:2;return n};
function phoneFrame(env,screen){const {E}=env,ph=E('div','pn-phone'),top=E('div','pn-top'),scr=E('div','pn-screen'),keys=E('div','pn-keys');top.append(E('i','pn-ear'),E('small','pn-brand','FOLDER'));scr.append(screen);for(const k of ['1','2','3','4','5','6','7','8','9','*','0','#'])keys.append(E('i','',k));ph.append(top,scr,keys);return ph}
function phonePage(page,env){const {E,B,go,r,k,ctx}=env,s=obj(k,'phone');if(!s.got||typeof s.got!=='object'||Array.isArray(s.got))s.got={};arr(s,'log',20);if(s.day!==dayKey()){s.day=dayKey();s.sent=0}if(!Number.isFinite(s.sent))s.sent=0;
 const head=E('header','pn-head');head.append(B('폰꾸미기 천국',()=>go({type:'home'}),'pn-logo'),E('span','pn-sub','벨소리 · 배경 화면 · 문자 꾸미기 · 오늘 무료 문자 '+Math.max(0,5-s.sent)+'통 남음'));page.append(head);
 const nav=E('nav','pn-nav');for(const [type,label] of [['home','첫 화면'],['bell','벨소리'],['wall','배경 화면'],['sms','무료 문자'],['art','문자 그림']])nav.append(B(label,()=>go({type}),'pn-tab'+(r.type===type?' on':'')));page.append(nav);
 const body=E('main','pn-body');page.append(body);K.cleanup(synthStop);
 const play=(ring,btn)=>{const res=synthPlay([[ring[5],'square',.15],[ring[6],'triangle',.2]],ring[4],()=>{if(btn)btn.textContent='▶ 미리 듣기'});if(btn)btn.textContent='■ 듣는 중...';if(res.silent)toast(env,'폰꾸미기 천국',silentText(res));return res};
 const ringRow=(ring,box,rank)=>{const row=E('div','pn-ring');const pb=B('▶ 미리 듣기',()=>{if(pb.textContent.startsWith('■')){synthStop();pb.textContent='▶ 미리 듣기';return}play(ring,pb)},'pn-btn small');
  row.append(E('b','pn-rank',rank?String(rank):'♪'),E('span','',ring[1]),E('small','',ring[2]+' · '+ring[3]+' · '+(ring[7]+(s.got[ring[0]]?1:0)).toLocaleString('ko-KR')+'명 받음'),pb,B(s.got[ring[0]]?'받음 ✓':'내 폰에 받기',()=>{const X=ctx.X;if(X&&X.ui&&X.ui.dialog)X.ui.dialog({title:'벨소리 받기',icon:'warn',text:'‘'+ring[1]+'’ ('+ring[3]+')\n\n벨소리를 받으려면 휴대폰 인증과 정보이용료 700원이 필요해요.\nPC방 컴퓨터에서는 휴대폰 결제를 할 수 없어요. 부모님 허락 없이 결제하지 마세요!\n\n(대신 미리 듣기는 마음껏 할 수 있어요)'});s.got[ring[0]]=1;ctx.save()},'pn-btn small ghost'));box.append(row)};
 if(r.type==='bell'){const box=E('section','pn-box');box.append(E('h3','','벨소리 순위'));RINGS.slice().sort((a,b)=>b[7]-a[7]).forEach((x,i)=>ringRow(x,box,i+1));box.append(E('p','pn-note','16화음, 40화음, 64화음은 휴대폰이 한 번에 낼 수 있는 소리 수예요. 화음이 많을수록 소리가 풍성해요.'));body.append(box);return}
 if(r.type==='wall'){const box=E('section','pn-box pn-walls');box.append(E('h3','','휴대폰 배경 화면'));let cur=PHONE_WALLS.some(x=>x[0]===r.id)?r.id:'cat';const [big,bg]=cv(env,'pn-wallbig',120,160);const paint=()=>{if(bg)try{drawWall(bg,cur,120,160)}catch(_){}};
  const grid=E('div','pn-wgrid');for(const [id,name] of PHONE_WALLS){const b=B('',()=>{cur=id;paint();cap.textContent=name},'pn-wthumb');const [c,g]=cv(env,'pn-wcv',60,80);if(g)try{drawWall(g,id,60,80)}catch(_){}b.append(c,E('small','',name));grid.append(b)}
  const cap=E('p','pn-cap',(PHONE_WALLS.find(x=>x[0]===cur)||PHONE_WALLS[0])[1]);const side=E('div','pn-wside');side.append(phoneFrame(env,big),cap,B('내 그림으로 저장',()=>{const X=ctx.X;if(!X||!X.shell||!X.shell.picSave){toast(env,'폰꾸미기 천국','저장할 수 없어요.');return}const [c2,g2]=cv(env,'',240,320);let url='';if(g2)try{drawWall(g2,cur,240,320);url=c2.toDataURL('image/png')}catch(_){url=''}
   const res=X.shell.picSave('폰 배경 - '+(PHONE_WALLS.find(x=>x[0]===cur)||PHONE_WALLS[0])[1]+'.png',url,240,320);toast(env,'폰꾸미기 천국',res&&res.ok?'‘내 그림’에 저장했어요! 바탕 화면이나 미니홈피 사진첩에 쓸 수 있어요.':res&&res.why==='full'?'내 그림이 꽉 찼어요. 몇 개를 지워 주세요.':'저장하지 못했어요.')},'pn-btn'));
  box.append(side,grid);body.append(box);paint();return}
 if(r.type==='sms'){const box=E('section','pn-box pn-sms');box.append(E('h3','','무료 문자 보내기 (하루 5통)'));let to=CONTACTS.some(c=>c[0]===r.id)?r.id:'minho';const screen=E('div','pn-lcd');const ph=phoneFrame(env,screen);
  const who=E('div','pn-who');for(const [id,name] of CONTACTS)who.append(B(name,()=>{to=id;for(const x of who.children)x.classList.toggle('on',x.textContent===name);draw()},'pn-chip'+(id===to?' on':'')));
  const ta=E('textarea','pn-text');ta.maxLength=80;ta.placeholder='보낼 말 (80바이트까지, 한글은 2바이트)';ta.setAttribute('aria-label','문자 내용');if(typeof r.query==='string'&&r.query)ta.value=r.query.slice(0,80);const meter=E('p','pn-meter','');
  const emo=E('div','pn-emo');for(const e of ['^^','ㅋㅋ','ㅠㅠ','♡','☆','(^o^)/','-_-;'])emo.append(B(e,()=>{ta.value=(ta.value+e);upd()},'pn-chip small'));
  const log=arr(s,'log',20);
  const draw=()=>{screen.replaceChildren();const nm=(CONTACTS.find(c=>c[0]===to)||CONTACTS[0])[1];screen.append(E('b','pn-lcdtop','▶ '+nm));for(const m of log.filter(x=>x.to===to).slice(-4))screen.append(E('p','pn-bubble '+(m.me?'me':'you'),m.t))};
  const upd=()=>{const n=smsBytes(ta.value);meter.textContent=n+' / 80 바이트'+(n>80?' (너무 길어요!)':'');meter.classList.toggle('over',n>80)};ta.addEventListener('input',upd);
  const send=B('보내기',()=>{const t=String(ta.value||'').replace(/\s+$/,'');if(!t.trim())return;if(smsBytes(t)>80){toast(env,'무료 문자','80바이트가 넘어서 보낼 수 없어요. 조금 줄여 주세요.');return}if(PRIVATE.test(t)){toast(env,'무료 문자','전화번호나 주소 같은 개인정보는 보내지 않아요.');return}if(s.sent>=5){toast(env,'무료 문자','오늘 무료 문자 5통을 다 썼어요. 내일 또 보내 주세요!');return}
   const c=CONTACTS.find(x=>x[0]===to)||CONTACTS[0];s.sent++;log.push({to,me:1,t});s.log=log.slice(-20);ctx.save();ta.value='';upd();draw();toast(env,'무료 문자','‘'+c[1]+'’에게 문자를 보냈어요. (오늘 '+Math.max(0,5-s.sent)+'통 남음)');
   const reply=(c[2].find(([re])=>re.test(t))||[null,c[3]])[1];K.later(()=>{log.push({to,me:0,t:reply});s.log=log.slice(-20);ctx.save();draw();synthPlay([[RINGS[8][5],'square',.12]],120);toast(env,'문자 왔숑~',c[1]+': '+reply)},2400)},'pn-btn');
  const side=E('div','pn-smsside');side.append(E('p','pn-note','받는 사람'),who,ta,meter,emo,send,E('p','pn-note','※ 이 사이트는 전화번호를 받지 않아요. 주소록에 있는 사람에게만 보낼 수 있어요.'));box.append(ph,side);body.append(box);upd();draw();return}
 if(r.type==='art'){const box=E('section','pn-box');box.append(E('h3','','특수문자 문자 그림'));const grid=E('div','pn-arts');for(const [name,art] of SMS_ART){const card=E('figure','pn-art');card.append(E('pre','',art),E('figcaption','',name+' · '+smsBytes(art)+'바이트'),B('문자에 넣기',()=>go({type:'sms',query:art}),'pn-btn small'));grid.append(card)}box.append(grid);body.append(box);return}
 /* 첫 화면 */
 const top=E('section','pn-box pn-hero');const [c,g]=cv(env,'pn-herocv',120,160);if(g)try{drawWall(g,'cup',120,160)}catch(_){}top.append(phoneFrame(env,c));const hi=E('div','pn-heroside');hi.append(E('h3','','6월은 월드컵! 응원 벨소리 받으세요'),E('p','','‘붉은 함성 응원가’ 40화음 벨소리와 태극 응원 배경 화면이 새로 들어왔어요. 친구에게 응원 문자 그림도 보내 보세요!'),B('▶ 응원가 미리 듣기',()=>play(RINGS[7]),'pn-btn'),B('무료 문자 보내러 가기',()=>go({type:'sms'}),'pn-btn ghost'));top.append(hi);body.append(top);
 const box=E('section','pn-box');box.append(E('h3','','실시간 인기 벨소리 TOP 5'));RINGS.slice().sort((a,b)=>b[7]-a[7]).slice(0,5).forEach((x,i)=>ringRow(x,box,i+1));body.append(box)}

/* =====================================================================
   4. 뮤직박스
   ===================================================================== */
/* 노래: [id, 제목, 부른 이, 음반, 등락, 빠르기, 가락, 반주, 가사(없으면 '')] */
const SONGS=[
 ['s1','반짝반짝 첫사랑','별빛소녀','1집 반짝반짝','▲2',132,RINGS[0][5],RINGS[0][6],'창문 너머 반짝이는 별 하나\n너를 닮아 자꾸만 눈이 가\n두근두근 말 못 한 내 마음\n오늘은 꼭 전해 볼래\n\n반짝반짝 첫사랑\n너에게만 보이는 빛\n반짝반짝 첫사랑\n내 맘 들리니 랄라라'],
 ['s2','우산 속 두 사람','한여름 밴드','2집 우산','-',96,RINGS[1][5],RINGS[1][6],'비가 오면 생각나\n작은 우산 하나에\n어깨가 젖는 줄도 모르고\n웃던 너와 나\n\n우산 속 두 사람\n빗소리만 크게 들려\n한 걸음만 더 가까이\n비야 그치지 마'],
 ['s3','질주','한여름 밴드','2집 우산','▲5',150,'E5:0.5 E5:0.5 R:0.5 E5:0.5 G5:0.5 E5:0.5 D5:0.5 C5:0.5 D5:0.5 D5:0.5 R:0.5 D5:0.5 F5:0.5 D5:0.5 C5:0.5 B4:0.5 E5:0.5 E5:0.5 R:0.5 E5:0.5 G5:0.5 A5:0.5 B5:0.5 C6:0.5 B5:1 G5:1 E5:2','E2:0.5 E3:0.5 E2:0.5 E3:0.5 E2:0.5 E3:0.5 E2:0.5 E3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5 D2:0.5 D3:0.5 C2:0.5 C3:0.5 C2:0.5 C3:0.5 C2:0.5 C3:0.5 C2:0.5 C3:0.5 B1:4',''],
 ['s4','새벽 두 시 라디오','미드나잇','새벽 라디오','▼2',80,RINGS[2][5],RINGS[2][6],'잠 못 드는 밤 라디오를 켜면\n낮은 목소리가 나를 불러\n오늘 하루 수고했다고\n괜찮다고 말해 줘\n\n새벽 두 시 라디오\n사연 하나 보낼게요\n이름은 비밀로 해 주세요\n내 마음만 전해 줘요'],
 ['s5','여름별 (선공개)','별빛소녀','2집 여름별','NEW',126,'C5:0.5 D5:0.5 E5:1 G5:1 E5:0.5 D5:0.5 C5:1 A4:1 C5:0.5 D5:0.5 E5:1 D5:1 C5:2 E5:0.5 F5:0.5 G5:1 C6:1 B5:0.5 A5:0.5 G5:1 E5:1 F5:0.5 E5:0.5 D5:1 G5:1 C5:2','C3:2 A2:2 F2:2 G2:2 C3:2 A2:2 F2:2 G2:2',''],
 ['s6','편지','김하윤','1집 편지','▲1',84,'E4:1 G4:1 C5:1.5 B4:0.5 A4:1 G4:1 F4:2 D4:1 F4:1 B4:1.5 A4:0.5 G4:2 R:1','C3:4 F2:4 G2:4 C3:3',''],
 ['s7','붉은 함성','응원단 밴드','월드컵 응원 앨범','▲8',128,RINGS[7][5],RINGS[7][6],''],
 ['s8','오후의 음악 편지','라디오 오케스트라','연주곡 모음','-',100,'C5:1 E5:1 G5:1 F5:2 E5:1 D5:1 F5:1 A5:1 G5:3 E5:1 G5:1 C6:1 B5:2 A5:1 G5:3','C3:3 F2:3 G2:3 C3:3 C3:3 G2:3',''],
 ['s9','너에게 쓰는 일기','소년시대','1집 소년시대','▼1',112,'D5:0.5 E5:0.5 F#5:1 A5:1 F#5:0.5 E5:0.5 D5:1 B4:1 D5:0.5 E5:0.5 F#5:1 E5:1 D5:2','D3:2 B2:2 G2:2 A2:2',''],
 ['s10','캐논 변주곡 (피아노)','파헬벨 (클래식)','피아노 소품집','-',72,RINGS[4][5],RINGS[4][6],'']
];
/* 미니홈피 선물가게의 배경음악과 이름이 같은 노래는 ‘미니홈피 배경음악 담기’를 할 수 있다 */
const BGM_OF={s1:'bgm-1',s2:'bgm-2',s4:'bgm-3',s10:'bgm-4'};
const MB_NEWS=[['별빛소녀 2집 「여름별」 6월 9일 발매!','05.30 11:00','큰길 뮤직박스 매장과 인터넷 매장에서 예약을 받습니다. 예약하신 분께 브로마이드를 드려요(선착순). 타이틀곡 ‘여름별’ 1분 미리 듣기가 공개되었습니다.'],['한여름 밴드 여름 전국 공연 일정 발표','05.27 14:00','7월 부산을 시작으로 여덟 도시를 돕니다. 표 예매는 6월 중순에 시작합니다. ‘질주’가 차트를 다섯 계단이나 올랐어요.'],['월드컵 응원 앨범 판매 1위','05.25 10:30','6월 독일 월드컵을 앞두고 응원 앨범이 날개 돋친 듯 팔리고 있어요. 붉은 티셔츠와 함께 사면 공 테이프 하나를 덤으로 드립니다.'],['뮤직박스 매장 안내','05.20 09:00','큰길 상가 뮤직박스. 오전 10시 ~ 밤 10시. CD, 카세트테이프, 공 테이프, 포스터를 팝니다. 카세트테이프에 원하는 노래를 녹음해 드리지는 않아요.']];
function drawJacket(g,id,W,H){const pal={s1:['#ff8ac0','#ffe0ef','#fff'],s2:['#3a6fb0','#bcd8f0','#fff'],s3:['#e8402a','#ffd23f','#111'],s4:['#1a1a3a','#6a6ab0','#fff6c8'],s5:['#2a7ad8','#ffe04a','#fff'],s6:['#c8a070','#f8ecd8','#5a3a1a'],s7:['#e8302a','#ffffff','#2a4ad8'],s8:['#5a8a5a','#e8f0d8','#fff'],s9:['#7a4ab0','#e8d8ff','#fff'],s10:['#2a2a2a','#d8c8a0','#fff']}[id]||['#888','#ccc','#fff'];
 const gr=g.createLinearGradient?g.createLinearGradient(0,0,W,H):null;if(gr){gr.addColorStop(0,pal[0]);gr.addColorStop(1,pal[1]);g.fillStyle=gr}else g.fillStyle=pal[0];g.fillRect(0,0,W,H);
 const s=SONGS.find(x=>x[0]===id);for(let i=0;i<6;i++)circ(g,(i*37+K.hash(id)%30)%W,(i*53)%H,6+i*2,'rgba(255,255,255,.18)');circ(g,W*.72,H*.36,W*.18,'rgba(0,0,0,.15)');circ(g,W*.72,H*.36,W*.05,pal[2]);
 txt(g,s?s[2]:'',8,H-24,pal[2],Math.round(W/10),'left');txt(g,s?s[3]:'',8,H-8,pal[2],Math.round(W/14),'left',false)}
function musicPage(page,env){const {E,B,go,r,k,ctx}=env,s=obj(k,'music');if(!s.like||typeof s.like!=='object'||Array.isArray(s.like))s.like={};if(!Number.isFinite(s.plays)||s.plays<0)s.plays=0;K.cleanup(synthStop);
 const head=E('header','mb-head');head.append(B('♪ 뮤직박스',()=>go({type:'home'}),'mb-logo'),E('span','mb-sub','큰길 상가 뮤직박스의 인터넷 매장 · 음악이 있는 곳'));page.append(head);
 const nav=E('nav','mb-nav');for(const [type,label] of [['home','첫 화면'],['chart','실시간 차트'],['album','새 음반'],['lyrics','가사 보기']])nav.append(B(label,()=>go({type}),'mb-tab'+(r.type===type?' on':'')));page.append(nav);
 /* 플레이어: 다시 그리지 않고 제자리에서 바뀐다 */
 const player=E('div','mb-player'),[eq,eg]=cv(env,'mb-eq',120,36),now=E('b','mb-now','지금 듣는 곡: 없음'),bar=E('div','mb-prog'),fill=E('i');bar.append(fill);const stopB=B('■ 정지',()=>{synthStop();state.id='';now.textContent='지금 듣는 곡: 없음';fill.style.width='0%'},'mb-btn small');player.append(eq,now,bar,stopB);page.append(player);
 const state={id:'',t0:0,dur:0};
 if(eg){const stop=K.loop(()=>{try{rect(eg,0,0,120,36,'#0d1a10');const on=!!state.id,el=on?(Date.now()-state.t0)/1000:0;for(let i=0;i<12;i++){const h=on?6+Math.abs(Math.sin(el*(3+i*.7)+i))*26:3;rect(eg,4+i*9.6,34-h,7,h,i%3===2?'#ffd23f':'#5ae07a')}if(on){const p=Math.min(1,el/Math.max(.1,state.dur));fill.style.width=Math.round(p*100)+'%';if(p>=1){state.id='';now.textContent='지금 듣는 곡: 없음'}}}catch(_){stop()}})}
 const listen=song=>{s.plays++;ctx.save();const res=synthPlay([[song[6],'square',.13],[song[7],'triangle',.22]],song[5]);state.id=song[0];state.t0=Date.now();state.dur=res.dur;now.textContent='♪ '+song[1]+' - '+song[2]+' (1분 미리 듣기)';fill.style.width='0%';if(res.silent)toast(env,'뮤직박스',silentText(res))};
 const body=E('main','mb-body');page.append(body);
 const songRow=(song,box,rank)=>{const row=E('div','mb-row');const [jc,jg]=cv(env,'mb-jacket',40,40);if(jg)try{drawJacket(jg,song[0],40,40)}catch(_){}
  const info=E('div','mb-info'),acts=E('div','mb-acts');info.append(E('span','mb-title',song[1]),E('small','',song[2]+' · '+song[3]));
  row.append(E('b','mb-rank',String(rank)),E('em','mb-delta'+(song[4].startsWith('▲')?' up':song[4].startsWith('▼')?' down':song[4]==='NEW'?' new':''),song[4]),jc,info,acts);
  acts.append(B('▶ 듣기',()=>listen(song),'mb-btn small'),B((s.like[song[0]]?'♥ ':'♡ ')+(128+K.hash(song[1])%400+(s.like[song[0]]?1:0)),()=>{s.like[song[0]]=!s.like[song[0]];ctx.save();ctx.rerender()},'mb-btn small ghost'));
  if(song[8])acts.append(B('가사',()=>go({type:'lyrics',id:song[0]}),'mb-btn small ghost'));
  if(BGM_OF[song[0]])acts.append(B('미니홈피 배경음악 담기',()=>{const X=ctx.X;if(!X||!X.mini||!X.mini.buy){toast(env,'뮤직박스','미니홈피를 열 수 없어요.');return}const st=X.mini.state?X.mini.state():null;if(st&&Array.isArray(st.items)&&st.items.includes(BGM_OF[song[0]])){toast(env,'뮤직박스','이미 미니홈피에 담은 노래예요. 미니홈피 미니룸에서 골라 틀어 보세요!');return}X.mini.buy(BGM_OF[song[0]])},'mb-btn small bgm'));
  box.append(row)};
 if(r.type==='chart'){const box=E('section','mb-box');box.append(E('h3','','뮤직박스 실시간 차트 TOP 10 · 5월 30일 오후 4시 기준'));SONGS.forEach((x,i)=>songRow(x,box,i+1));box.append(E('p','mb-note','미리 듣기는 1분까지만 들을 수 있어요. 전곡은 매장에서 음반을 사세요!'));body.append(box);return}
 if(r.type==='album'){const box=E('section','mb-box');box.append(E('h3','','새 음반 · 추천 음반'));const grid=E('div','mb-albums');for(const id of ['s5','s2','s4','s7','s6','s9']){const song=SONGS.find(x=>x[0]===id);const card=E('figure','mb-album'),[c,g]=cv(env,'mb-cover',150,150);if(g)try{drawJacket(g,id,150,150)}catch(_){}card.append(c,E('figcaption','',song[2]+' · '+song[3]),B('▶ '+song[1],()=>listen(song),'mb-btn small'));grid.append(card)}box.append(grid);body.append(box);
  const nb=E('section','mb-box');nb.append(E('h3','','음반 소식'));for(const [t,at,x] of MB_NEWS){const a=E('article','mb-news');a.append(E('b','',t),E('small','',' '+at),E('p','',x));nb.append(a)}body.append(nb);return}
 if(r.type==='lyrics'){const withLyrics=SONGS.filter(x=>x[8]);const song=withLyrics.find(x=>x[0]===r.id)||withLyrics[0];const box=E('section','mb-box mb-lyrics');const pick=E('div','mb-chips');for(const x of withLyrics)pick.append(B(x[1],()=>go({type:'lyrics',id:x[0]}),'mb-chip'+(x===song?' on':'')));box.append(pick,E('h3','',song[1]+' - '+song[2]),E('pre','',song[8]),B('▶ 들으면서 보기',()=>listen(song),'mb-btn'));body.append(box);return}
 /* 첫 화면 */
 const hero=E('section','mb-box mb-hero');const [hc,hg]=cv(env,'mb-herocv',150,150);if(hg)try{drawJacket(hg,'s5',150,150)}catch(_){}const hs=E('div','');hs.append(E('h3','','별빛소녀 2집 「여름별」 6월 9일 발매'),E('p','',MB_NEWS[0][2]),B('▶ 여름별 미리 듣기',()=>listen(SONGS[4]),'mb-btn'),B('큰길 뮤직박스 매장 후기 보기',()=>go({type:'shop',id:'music'},'w-town'),'mb-btn ghost'));hero.append(hc,hs);body.append(hero);
 const box=E('section','mb-box');box.append(E('h3','','실시간 차트 TOP 5'));SONGS.slice(0,5).forEach((x,i)=>songRow(x,box,i+1));box.append(B('TOP 10 전체 보기 ▶',()=>go({type:'chart'}),'mb-btn ghost'));body.append(box);
 body.append(E('p','mb-note','지금까지 미리 듣기 '+s.plays+'번 · 미니홈피 배경음악 담기는 미니홈피 도토리를 써요.'))}

WS.register('w-town',{key:'town',domain:'www.uridongne.co.kr',caption:'우리동네 소식통 - 은하아파트 · 동일초 · 큰길 상가 이야기',name:'우리동네 소식통',types:['home','map','shop','board','post','notice','vote'],linkCat:'우리 동네',desc:'동네 약도, 가게 후기, 분실물과 나눔 게시판',star:4,tags:'우리 동네 동네 소식 은하아파트 동일초 큰길 상가 약도 지도 가게 후기 분실물 나눔 관리사무소 은하분식 별빛문구 PC방 우리슈퍼',fav:true,isNew:true},townPage);
WS.register('w-dongil',{key:'dongil',domain:'www.dongil.es.kr',caption:'동일초등학교 - 꿈을 키우는 즐거운 배움터',name:'동일초등학교',types:['home','about','notice','meal','board','post','album'],linkCat:'우리 동네',desc:'가정통신문, 5월 급식표, 알림장, 자유게시판',star:3,tags:'동일초 동일초등학교 학교 홈페이지 급식 급식표 식단 가정통신문 알림장 숙제 교가 체육대회',fav:true,isNew:true},dongilPage);
WS.register('w-phone',{key:'phone',domain:'www.phonedeco.co.kr',caption:'폰꾸미기 천국 - 벨소리 · 배경 화면 · 문자 꾸미기',name:'폰꾸미기 천국',types:['home','bell','wall','sms','art'],linkCat:'재미있는 곳',desc:'64화음 벨소리 미리 듣기, 배경 화면, 무료 문자',star:5,tags:'벨소리 화음 배경화면 배경 화면 휴대폰 핸드폰 폰꾸미기 문자 무료 문자 특수문자 문자 그림 폴더폰',fav:true,isNew:true},phonePage);
WS.register('w-music',{key:'music',domain:'www.musicbox.co.kr',caption:'뮤직박스 - 음악이 있는 곳',name:'뮤직박스',types:['home','chart','album','lyrics'],linkCat:'재미있는 곳',desc:'실시간 음악 차트와 1분 미리 듣기, 가사',star:4,tags:'음악 노래 차트 가요 미리듣기 미리 듣기 가사 음반 앨범 CD 카세트 뮤직박스 별빛소녀 한여름 밴드 배경음악 BGM',fav:true,isNew:true},musicPage);
w.WebTown={PLACES,TOWN_BOARD,TOWN_NOTICE,POLLS,DG_NOTICE,DG_MEAL,DG_OFF,DG_BOARD,DG_HOMEWORK,RINGS,PHONE_WALLS,CONTACTS,SMS_ART,SONGS,BGM_OF,MB_NEWS,smsBytes,parseTune,tuneBeats,freq,synthPlay,synthStop,drawTown,version:'A97'};
})(window);
