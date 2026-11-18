/* A100 애니콜 NATE: 2006년 휴대폰 무선 인터넷 (버전 A100 · 2026-11-13 KST), A124 고침 (2026-11-17 KST)
   A124: 신규 게임 두 개(쿵짝 리듬왕, 골목대장 전설)를 NATE 게임에서 받는다. 게임 설명서, 후기, 공략, 랭킹, 친구에게 선물하기.
         벨소리 선물하기(같은 방 친구에게 진짜로 감), 가요 순위 투표(100원), 이름 궁합, 사다리 타기, OX 퀴즈, 묻고 답하기,
         학교·생활(급식, 알림장, 아파트 공지, 동네 투표), 오늘의 TV, 문자 그림 받기, 유머와 소설과 심리 테스트 더, MY NATE 선물함.
   휴대폰 액정(src/anycall-lcd.js) 안에서 돌아가는 작은 무선 인터넷 브라우저.
   - 접속 화면, 데이터 통화료(0.5KB = 1패킷 = 6.5원)와 정보이용료가 따로 붙는 그 시절 요금 방식, 쪽마다 받는 데이터 크기와 '접속 중' 막대
   - 숫자로 고르는 메뉴(1~9), 0 = NATE 홈, * = 이전, # = 맨 위, 매뉴 = 옵션(홈, 즐겨찾기, 요금, 끊기), 취소 = 이전, 종료 = 접속 끊기
   - 숫자 바로가기: 대기 화면에서 번호를 누르고 NATE 버튼 (1004 싸이월드, 7979 벨소리, 2006 월드컵, 8282 채팅 ...)
   - 메뉴: 검색, 벨소리·컬러링, 게임, 폰꾸미기, 뉴스·날씨·월드컵, 만화·소설·유머, 싸이월드 모바일, 채팅·동네 소식, 지도·운세·생활, MY NATE
   - 내용은 게임 속 다른 곳과 이어진다: PC 포털 기사와 날씨(PortalNews), 종이모뎀 만화실(PortalComics),
     동네 소식통의 가게와 게시판, 뮤직박스 소식(WebTown), 같은 방 친구 미니홈피(MiniHome), 함께 걷기 방 채팅(A25NET)
   광고, 게임 이름, 소설, 유머, 운세는 모두 지어낸 것이다. */
(function(w){'use strict';
const PKT_KB=.5,PKT_WON=6.5;
const CODES={'1004':['cy','싸이월드 모바일'],'7979':['ring','벨소리·컬러링'],'2006':['wc','월드컵 특집'],'8282':['chat','NATE 채팅'],'5353':['game','게임'],'0530':['luck','오늘의 운세'],'4989':['news','뉴스'],'7700':['comics','모바일 만화'],'1111':['search','NATE 검색'],
 '3535':['newGames','신규 게임'],'4949':['quiz','OX 퀴즈'],'0909':['tv','오늘의 TV'],'2580':['match','이름 궁합']};
const ADS=['[이벤트] 월드컵 응원가 벨소리 공짜!','[신규] 64화음 리듬 게임 쿵짝 리듬왕','[신규] RPG 골목대장 전설 출시!','[인기] 싸이월드 모바일로 방명록 확인','[알림] 데이터 통화료 0.5KB당 6.5원','[운세] 오늘 나의 띠별 운세는?','[선물] 친구에게 벨소리 선물하기'];
const CATALOG=[
 {id:'rhythm',name:'쿵짝 리듬왕',genre:'리듬',price:3000,kb:290,play:true,big:true,isNew:true,pop:58120,desc:'떨어지는 음표에 맞춰 숫자 키를 누르는 64화음 리듬 게임! 뮤직박스 인기곡과 클래식 열두 곡, 세 가지 난이도. 콤보를 이어 피버를 터뜨려 보세요.',
  how:'[조작]\n왼쪽 줄: 1 4 7 * 또는 ◀\n가운데 줄: 2 5 8 0 또는 확인\n오른쪽 줄: 3 6 9 # 또는 ▶\n취소: 잠깐 멈춤\n\n음표가 아래 선에 닿을 때 누르면 PERFECT!\n콤보 30이 넘으면 피버 (점수 두 배)\n어려움은 보통을 B 이상으로 깨면 열려요.\n옵션에서 떨어지는 속도와 박자 맞추기를 바꿀 수 있어요.',
  tips:'1. 소리를 켜고 하세요. 음표를 맞히면 그 음이 나요.\n2. 화면보다 소리를 믿으세요!\n3. 박자가 어긋나면 옵션의 ‘박자 맞추기’에서 조금씩 당기거나 미세요.\n4. 속도를 빠르게 하면 음표 사이가 넓어져서 오히려 쉬워요.',
  reviews:[['리듬천재','★★★★★','폰으로 이런 게 되다니 ㄷㄷ 질주 어려움 S 찍음'],['은하아파트짱','★★★★','엄지 아파요 ㅋㅋ 근데 계속 하게 됨'],['동일초4학년','★★★★★','터키 행진곡 어려워요 ㅠㅠ'],['별빛소녀팬','★★★★★','반짝반짝 첫사랑 있어서 받음 ♡']]},
 {id:'rpg',name:'골목대장 전설',genre:'롤플레잉',price:3500,kb:480,play:true,big:true,isNew:true,pop:44210,desc:'도깨비가 동네 아이들의 보물 ‘황금 딱지’를 훔쳐 갔다! 골목대장이 되어 은하 마을, 뒷산, 폐교를 지나 도깨비 대장을 혼내 주는 롤플레잉. 떡꼬치와 슬러시로 힘을 내자!',
  how:'[조작]\n2 4 6 8 또는 방향 버튼: 걷기 (누르고 있으면 계속)\n5 또는 확인: 말 걸기, 조사하기\n매뉴: 상태, 가방, 저장\n싸움: 숫자로 명령 (1 공격 2 기술 3 가방 4 도망)\n\n집에서 엄마에게 말을 걸면 힘이 다 차고 저장돼요.\n문방구에서 무기와 옷, 분식집에서 먹을 것을 사요.',
  tips:'1. 뒷산에서 레벨 4까지 올리고 폐교에 가세요.\n2. 문방구 리코더(공격 +7)는 꼭 사세요!\n3. 과학실 해골 모형을 이기면 2층 열쇠를 얻어요.\n4. 도깨비 대장은 피가 반쯤 남으면 ‘뚝딱!’으로 한 번 회복해요. 컵떡볶이를 넉넉히!',
  reviews:[['골목대장','★★★★★','엔딩 봄 ㅠㅠ 도깨비 대장 진짜 셈'],['떡꼬치러버','★★★★','떡꼬치로 피 채우는 거 너무 웃김 ㅋㅋ'],['민호친구','★★★★★','리코더로 때리는 게 제일 웃김'],['초딩고수','★★★','저장 자주 하세요. 폐교에서 죽음 ㅠ']]},
 {id:'run',name:'점프 달리기',genre:'액션',price:2000,kb:180,play:true,pop:41230,desc:'쓰레기통과 강아지를 뛰어넘으며 달리는 한 손가락 게임. 5번이나 위 버튼으로 점프!'},
 {id:'ball',name:'숫자 야구',genre:'두뇌',price:2000,kb:90,play:true,pop:28890,desc:'1부터 9까지 서로 다른 세 숫자를 열 번 안에 맞혀 보세요. 스트라이크와 볼로 힌트를 줍니다.'},
 {id:'g3',name:'미니게임 나라 2',genre:'미니게임',price:2500,kb:320,pop:52110,desc:'줄넘기, 양궁, 장애물 달리기 등 미니게임 열두 가지. 친구 점수와 겨뤄 보세요.'},
 {id:'g4',name:'붕붕 카트 모바일',genre:'레이싱',price:3000,kb:450,pop:47320,desc:'드리프트로 코너를 도는 카트 레이싱. 새 트랙 ‘은하아파트 한 바퀴’ 추가!'},
 {id:'g5',name:'삼국 영웅전',genre:'롤플레잉',price:3000,kb:620,pop:21800,desc:'영웅 셋을 모아 천하를 통일하는 롤플레잉. 엔딩까지 약 20시간.'},
 {id:'g6',name:'고스톱 한판',genre:'보드',price:2000,kb:210,pop:39470,desc:'컴퓨터와 맞고 한판. 엄마 아빠가 더 좋아하는 그 게임.'},
 {id:'g7',name:'프로야구 2006',genre:'스포츠',price:3000,kb:380,pop:33650,desc:'여덟 구단과 2006년 선수 명단이 들어간 야구 게임. 홈런 더비 모드 포함.'},
 {id:'g8',name:'블록 쌓기 퍼즐',genre:'퍼즐',price:1500,kb:120,pop:26120,desc:'떨어지는 블록을 돌려 한 줄을 채우면 사라지는 퍼즐.'}];
const EMO_CATS=[['웃음',['^^','^_^','*^^*','^o^','^.^','ㅋㅋㅋ','ㅎㅎㅎ','(^▽^)']],['슬픔',['ㅠㅠ','ㅜ_ㅜ','T_T','ㅠ.ㅠ','(ㅠ_ㅠ)']],['당황',['-_-;','ㅡㅡ;','ㄱ-','=_=','-_-a',';;;']],['사랑',['♡','♥','♡.♡','*♥o♥*','(*^^*)♡']],['인사',['m(_ _)m','(^^)/','^^v','^^b','안냥~']],['특수문자',['★','☆','♪','♬','▶','◀','※','☎','☞']],['응원',['대~한민국!','짝짝짝 짝짝','오 필승 코리아','파이팅!!']]];
const NOVEL={title:'그 애는 날라리였다 ^-^',by:'별빛소녀♡',chapters:[
 ['1화. 전학생','“야, 너 이름 뭐냐?” -_-\n\n전학 온 첫날, 교실 맨 뒷자리 그 애가 말을 걸었다.\n염색한 갈색 머리에 이어폰 한 쪽.\n\n나는 대답 대신 고개를 돌렸다. 흥 ㅡㅡ+\n\n근데... 왜 심장이 쿵쾅거리는 거지?? ㅠ_ㅠ'],
 ['2화. 우산','비가 왔다. 우산이 없었다. 우울 ㅠㅠ\n\n“야.” 그 애였다.\n“이거 써. 난 뛰어가면 돼 ^-^”\n\n노란 우산을 내 손에 쥐여 주고 빗속으로 달려가는 그 애.\n\n바보... 감기 걸리면 어쩌려고 ...///'],
 ['3화. 문자','밤 11시. 띠링♪ 문자가 왔다.\n\n[모르는 번호] 우산 잘 썼냐 ㅋ\n\n...!!! 내 번호 어떻게 알았지??\n\n답장을 쓰고 지우고 또 쓰고... 알 다 깨지겠다 ㅠㅠ\n\n“응 고마워 ^^” 전송.\n\n(다음 화에 계속... 댓글 많으면 빨리 올릴게요 ♡)'],
 ['4화. 짝꿍','선생님이 자리를 바꿨다.\n하필... 그 애랑 짝꿍 -_-;;\n\n“지우개 좀.”\n말없이 지우개를 반으로 잘라 줬다.\n\n“...너 글씨 이쁘다 ^^”\n\n얼굴이 빨개졌다. 들켰나?? ㅠ_ㅠ\n\n(반 애들이 다 쳐다본다... 망했다 ㅋㅋ)'],
 ['5화. 소문','다음 날 반에 소문이 쫙 퍼졌다.\n“야, 너 걔랑 사귀냐??”\n\n아니거든!! ㅡㅡ+\n\n그 애가 웃으면서 말했다.\n“아니라는데? ㅋㅋ”\n\n...근데 왜 서운하지? ㅠㅠ\n나 진짜 이상해...'],
 ['6화. 노란 우산','노란 우산을 돌려주러 갔다.\n“우산 고마웠어.”\n\n“그거 너 가져. 대신...”\n“대신?”\n\n“내일 떡볶이 사 줘 ^^”\n\n은하분식 컵떡볶이 두 개.\n처음으로 같이 걸은 집에 가는 길 ♡\n\n(1부 끝! 2부는 방학 끝나고 연재할게요. 댓글 꼭 남겨 주세요 ^-^)']]};
const HUMOR=[
 ['세상에서 가장 뜨거운 과일은?','천도복숭아 (천 도!)'],['오리가 얼면?','언덕 (언 덕! 오리는 덕)'],['왕이 넘어지면?','킹콩'],['세상에서 가장 가난한 왕은?','최저임금'],
 ['사오정 시리즈 1','선생님: 사오정, 숙제 해 왔니?\n사오정: 아니요, 아직 저녁 안 먹었는데요.\n선생님: ...그래, 많이 먹어라.'],
 ['사오정 시리즈 2','저팔계: 오정아, 우리 PC방 가자!\n사오정: 뭐? 피시방에서 생선 굽는다고?\n손오공: ...그냥 가자.'],
 ['엽기 문자 모음','엄마: 아들 뭐해?\n나: 공부 중\n엄마: 그럼 지금 PC방에서 공부하는 거니? 옆자리 아줌마가 엄마 친구야.\n나: ...'],
 ['소가 웃으면?','우하하 (소 우 + 하하!)'],['세상에서 가장 빠른 닭은?','후다닥 (후다 + 닭!)'],['아몬드가 죽으면?','다이아몬드 (다이 + 아몬드)'],
 ['사오정 시리즈 3','손오공: 오정아, 시험 몇 점 맞았어?\n사오정: 응! 오늘 점심 진짜 맛있었어!\n손오공: ...그래, 다행이다.'],
 ['엽기 문자 모음 2','나: 엄마 나 오늘 시험 100점!!\n엄마: 정말? 몇 과목 합쳐서?\n나: ...']];
const PSY={title:'나는 어떤 친구일까?',qs:[['쉬는 시간에 나는?',['친구들이랑 수다','혼자 만화책','운동장으로 뛰어나감']],['친구가 울고 있다면?',['같이 운다','웃긴 얘기를 한다','조용히 휴지를 준다']],['용돈이 생기면?',['떡볶이 쏜다','저금한다','게임 아이템!']]],
 res:[['분위기 메이커형','어디서든 반 분위기를 띄우는 웃음 담당! 친구들이 너만 기다려 ^^'],['든든한 짝꿍형','말은 적어도 늘 옆에 있어 주는 사람. 진짜 친구는 너 같은 사람 ♡'],['자유로운 탐험가형','하고 싶은 건 꼭 해 보는 모험가! 가끔은 친구들 얘기도 들어 줘요 ㅋㅋ']]};
const PSY2={title:'나는 어떤 동물 친구일까?',qs:[['놀이터에 가면 제일 먼저?',['그네로 달려감','모래 놀이','친구부터 찾음']],['비 오는 날 나는?',['집에서 낮잠','창밖 구경','우산 쓰고 첨벙첨벙']],['새 학기 첫날 나는?',['먼저 말 검','눈치 보다가 웃음','조용히 관찰']]],
 res:[['강아지형','에너지 넘치는 반가운 친구! 어디서든 꼬리 흔들며 달려가요 ^^'],['고양이형','조용하지만 속 깊은 친구. 마음을 열면 누구보다 다정해요 ♡'],['다람쥐형','호기심 대장! 이것저것 모으고 구경하는 걸 좋아해요 ㅋㅋ']]};
const ZODIAC=[['쥐띠','작은 부탁 하나가 큰 칭찬으로 돌아오는 날.'],['소띠','묵묵히 한 숙제가 빛을 봐요. 받아쓰기 운 상승!'],['호랑이띠','친구와 사소한 말다툼 조심. 먼저 문자 한 통 ^^'],['토끼띠','뜻밖의 군것질 행운! 분식집에서 덤을 받을지도.'],
 ['용띠','새 물건을 사고 싶어지는 날. 용돈은 아껴 두세요.'],['뱀띠','조용히 지내면 저녁에 좋은 소식이 와요.'],['말띠','몸을 움직이면 운이 트여요. 놀이터로 고고!'],['양띠','엄마 말씀을 잘 들으면 맛있는 저녁이 기다려요.'],
 ['원숭이띠','장난이 지나치면 혼나요 -_-; 적당히!'],['닭띠','일찍 일어나는 새가 벌레를 잡듯, 오늘은 부지런히!'],['개띠','2006년은 개띠 해! 무엇을 해도 술술 풀려요 ★'],['돼지띠','먹을 복 터진 날. 그래도 양치는 꼭 하세요.']];
const PLACE_PIN={school:['동일초등학교'],bunsik:['은하분식','담장길'],stationery:['문방구','별빛문구'],pcroom:['PC방'],super:['우리슈퍼','슈퍼'],apt:['아파트'],park:['놀이터'],barber:['주택가','샛길','뒷골목','마당','골목'],hakwon:['큰길','상가']};
const SCENE_PIN={pcroom:'pcroom',stationery:'stationery',supermarket:'super',playground:'park',apartment_path:'apt',lobby:'apt',hall:'apt',rooftop:'apt',main_road:'hakwon',courtyard:'barber',side_alley:'barber',hidden_alley:'barber',back_alley:'barber'};

/* A124: 이름 궁합 획수표와 OX 퀴즈 문제 (화면 없이도 쓰는 것) */
const STK={'ㄱ':2,'ㄲ':4,'ㄴ':2,'ㄷ':3,'ㄸ':6,'ㄹ':5,'ㅁ':4,'ㅂ':4,'ㅃ':8,'ㅅ':2,'ㅆ':4,'ㅇ':1,'ㅈ':3,'ㅉ':6,'ㅊ':4,'ㅋ':3,'ㅌ':4,'ㅍ':4,'ㅎ':3,
 'ㅏ':2,'ㅐ':3,'ㅑ':3,'ㅒ':4,'ㅓ':2,'ㅔ':3,'ㅕ':3,'ㅖ':4,'ㅗ':2,'ㅘ':4,'ㅙ':5,'ㅚ':3,'ㅛ':3,'ㅜ':2,'ㅝ':4,'ㅞ':5,'ㅟ':3,'ㅠ':3,'ㅡ':1,'ㅢ':2,'ㅣ':1,
 'ㄳ':4,'ㄵ':5,'ㄶ':5,'ㄺ':7,'ㄻ':9,'ㄼ':9,'ㄽ':7,'ㄾ':9,'ㄿ':9,'ㅀ':8,'ㅄ':6};
const CHO_='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',JUNG_='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',JONG_=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function strokes(ch){const c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return null;const j=c%28,v=Math.floor(c/28)%21,i=Math.floor(c/588);return STK[CHO_[i]]+STK[JUNG_[v]]+(j?STK[JONG_[j]]:0)}
function matchScore(a,b){const A=Array.from(a),Bn=Array.from(b),seq=[];for(let i=0;i<Math.max(A.length,Bn.length);i++){if(i<A.length)seq.push(A[i]);if(i<Bn.length)seq.push(Bn[i])}
 let x=seq.map(strokes);if(x.some(v=>v==null))return null;x=x.map(v=>v%10);const rows=[x.slice()];while(x.length>2){const y=[];for(let i=0;i+1<x.length;i++)y.push((x[i]+x[i+1])%10);x=y;rows.push(x.slice())}
 if(x.length<2)x=[0,x[0]||0];return{pct:x[0]*10+x[1],rows,seq}}
const OX=[['2006 독일 월드컵에서 대한민국은 G조다.',1],['독일 월드컵 개막 경기는 6월 9일에 열린다.',1],['우리나라 첫 경기 상대는 프랑스다.',0],['2002 월드컵은 한국과 일본이 함께 열었다.',1],
 ['한글을 만든 임금은 세종대왕이다.',1],['지구에서 가장 넓은 바다는 대서양이다.',0],['물은 1기압에서 100도에 끓는다.',1],['펭귄은 북극에 산다.',0],['거미는 곤충이다.',0],['무지개는 흔히 일곱 빛깔이라고 한다.',1],['태극기 가운데 원은 빨강과 파랑이다.',1],['1년은 보통 365일이다.',1]];
function create(K){
 const {W,H,TOP,BOT,R,T,grad,rr,circ,fit,wrap,fnt,clamp,host,D}=K;
 const now=()=>K.now();
 const B={cur:null,stack:[],sel:0,scroll:0,load:null,splash:null,dl:null,opts:null,ed:null,kb:0,pkts:0,won:0,info:0,t0:0,hist:[],chat:[],chatSub:false,visited:new Set(),tick:-1,code:null};
 const Y0=TOP+27,Y1=H-BOT;
 const WT=()=>w.WebTown||{},PN=()=>w.PortalNews||{},PC=()=>w.PortalComics||{},MH=()=>w.MiniHome||null;
 const RINGS=()=>K.allRings().filter(r=>!String(r[0]).startsWith('mel:'));
 const genreOf=r=>/클래식/.test(r[2])?'클래식':/동요/.test(r[2])?'동요':/효과음/.test(r[2])?'효과음':'가요';
 const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
 /* 그 시절 안내 문자: 정보이용료가 붙으면 결제 알림, 한 번 접속에 데이터 요금이 1,000원을 넘으면 요금 알림 */
 function dataCharge(kb){B.kb+=kb;const p=Math.ceil(kb/PKT_KB);B.pkts+=p;const c=p*PKT_WON;B.won+=c;K.charge('data',Math.round(c));
  if(B.won>=1000&&!B.warned){B.warned=true;setTimeout(()=>K.receive({from:'NATE 알림',text:'[NATE] 이번 무선인터넷 데이터 통화료가 1,000원을 넘었습니다. 오래 접속하면 요금이 많이 나올 수 있어요.'}),1800)}}
 function pay(name,price){if(!price)return;B.info+=price;K.pay(name,price);setTimeout(()=>K.receive({from:'NATE 알림',text:'[NATE] '+name+' 정보이용료 '+won(price)+'이(가) 휴대폰 요금에 함께 청구됩니다.'}),2200)}

 /* ---------- 쪽 만들기 ---------- */
 const P={};
 const it=(label,go,o={})=>({label,go,...o});
 P.home=()=>({title:'메인',kb:3.4,crumb:'NATE 홈',banner:true,items:()=>[
  it('검색어를 입력하세요',['search'],{num:'',search:true}),
  it('벨소리·컬러링',['ring']),it('게임',['game']),it('폰꾸미기',['deco']),it('뉴스·날씨·월드컵',['news']),it('만화·소설·유머',['fun']),
  it('싸이월드 모바일',['cy']),it('채팅·동네 소식',['comm']),it('지도·운세·생활',['life']),it('MY NATE (요금·즐겨찾기)',['my']),
  it('▶ 월드컵 응원가 벨소리 공짜!',['event'],{num:'',hot:true}),it('★ 신규 게임: 쿵짝 리듬왕 · 골목대장 전설',['newGames'],{num:'',hot:true})]});
 /* 검색 */
 P.search=()=>({title:'NATE 검색',kb:1.6,crumb:'검색',input:{ph:'검색어를 쓰고 Enter (숫자판도 돼요)',max:40,submit:q=>{if(q.trim())nav('results',q.trim(),{kb:2.4})}},
  text:'찾고 싶은 말을 써 보세요.\n인기 검색어',items:()=>['월드컵','벨소리','싸이월드','주몽','꼭짓점 댄스','운세','은하분식','게임','날씨','만화'].map(q=>it(q,['results',q]))});
 let IDX=null;
 function index(){if(IDX)return IDX;const L=[];const add=(t,k,go)=>L.push({t,k:(t+' '+k).toLowerCase(),go});
  for(const [t,k,id] of [['벨소리','벨소리 다운로드 화음 음악','ring'],['컬러링','컬러링 통화연결음','color'],['게임','게임 다운로드 모바일게임','game'],['배경 화면','배경화면 폰꾸미기 바탕','walls'],['이모티콘','이모티콘 특수문자 문자','emo'],['메뉴 테마','테마 색 꾸미기','theme'],
   ['뉴스','뉴스 속보 기사','news'],['날씨','날씨 기온 비 우산','weather'],['월드컵 특집','월드컵 독일 토고 프랑스 스위스 응원 국가대표 축구','wc'],['연예 소식','연예 가수 앨범 별빛소녀 음악','ent'],['모바일 만화','만화 웹툰 카툰 종이모뎀','comics'],['인터넷 소설','소설 하이틴 연재 날라리','novel'],
   ['유머','유머 웃긴 엽기 퀴즈 사오정','humor'],['심리 테스트','심리 테스트 친구','psy'],['싸이월드 모바일','싸이 싸이월드 미니홈피 방명록 일촌 파도타기','cy'],['NATE 채팅','채팅 대화방 친구','chat'],['동네 게시판','게시판 분실물 나눔 칭찬','board'],
   ['동네 가게','가게 맛집 분식 약국 빵집','shops'],['동네 지도','지도 길찾기 위치 약도','map'],['오늘의 운세','운세 띠 오늘','luck'],['마을버스','버스 시간표 교통','bus'],['이번 접속 요금','요금 데이터 패킷 정보이용료','session'],['숫자 바로가기','바로가기 번호','codes'],
   ['신규 게임','신규 새 게임 리듬 롤플레잉 rpg 쿵짝 리듬왕 골목대장 전설','newGames'],['가요 순위 투표','투표 가요 순위 노래 1위','vote'],['이름 궁합','궁합 이름 사랑 짝꿍','match'],['사다리 타기','사다리 내기 쏘기','ladder'],
   ['OX 퀴즈','퀴즈 ox 상식 퀴즈왕','quiz'],['묻고 답하기','질문 답변 지식','qna'],['급식','급식 점심 학교 밥','meal'],['알림장','알림장 숙제 준비물','school'],['오늘의 TV','tv 티비 편성표 드라마 주몽 만화','tv'],
   ['문자 그림','문자 그림 특수문자 꾸미기','arts'],['동네 투표','투표 설문 간식','polls'],['아파트 공지','공지 관리 사무소 소독 단수','notice'],['선물함','선물 선물함','gifts']])add(t,k,[id]);
  for(const r of (PN().records||[]).filter(x=>x.type==='뉴스'))add(r.title,(r.tags||'')+' '+r.section,['article',r]);
  for(const r of RINGS())add('벨소리 '+r[1],r[2]+' '+genreOf(r),['ringItem',r]);
  for(const g of CATALOG)add('게임 '+g.name,g.genre,['gameItem',g]);
  for(const p of (WT().PLACES||[]))add(p[1],p[2]+' '+(p[5]||''),['shop',p]);
  for(const s of (PC().series||[]))add('만화 '+s.title,s.genre+' '+s.subtitle,['comicEp',s]);
  return IDX=L}
 P.results=q=>{const toks=String(q).toLowerCase().split(/\s+/).filter(Boolean),hits=index().filter(e=>toks.every(t=>e.k.includes(t))).slice(0,15);
  return{title:'검색 결과',kb:2.4,crumb:'검색: '+q,text:hits.length?'“'+q+'” 검색 결과 '+hits.length+'건':'“'+q+'”에 대한 검색 결과가 없어요.\n다른 말로 찾아보세요.',items:()=>hits.map(h=>it(h.t,h.go,{num:''}))}};
 /* 벨소리 · 컬러링 */
 P.ring=()=>({title:'벨소리·컬러링',kb:2.8,crumb:'홈 > 벨소리',text:(()=>{const top=RINGS().slice().sort((a,b)=>b[7]-a[7])[0];return top?'이번 주 1위: '+top[1]+' ('+top[2]+')':''})(),
  items:()=>[it('실시간 인기 벨소리 TOP',['ringTop']),it('장르별 벨소리',['ringGenre']),it('컬러링 (통화 연결음)',['color']),it('내 벨소리함',['myRings']),it('16화음? 64화음? 화음 이야기',['chord']),it('이번 주 가요 순위 투표 (100원)',['vote'])]});
 const ringRow=r=>it(r[1],['ringItem',r],{sub:K.has(r[0])?'받음':'700원'});
 P.ringTop=()=>({title:'인기 벨소리',kb:3.1,crumb:'벨소리 > TOP',items:()=>RINGS().slice().sort((a,b)=>b[7]-a[7]).map(r=>ringRow(r))});
 P.ringGenre=()=>({title:'장르별',kb:1.8,crumb:'벨소리 > 장르',items:()=>['가요','클래식','동요','효과음'].map(gn=>it(gn+' ('+RINGS().filter(r=>genreOf(r)===gn).length+'곡)',['ringList',gn]))});
 P.ringList=gn=>({title:gn,kb:2.6,crumb:'장르 > '+gn,items:()=>RINGS().filter(r=>genreOf(r)===gn).map(r=>ringRow(r))});
 P.ringItem=r=>({title:'벨소리',kb:2.2,crumb:'벨소리 > '+r[1],text:r[1]+'\n'+r[2]+' · '+r[3]+'\n'+Number(r[7]||0).toLocaleString('ko-KR')+'명이 받았어요\n정보이용료 700원 (데이터 약 24KB 별도)',
  items:()=>[it('미리 듣기 (약 2KB)',null,{act:()=>{dataCharge(2);K.playRing(r)}}),
   it(K.has(r[0])?'이미 받은 벨소리예요':'내 폰에 받기',null,{act:()=>{if(K.has(r[0])){K.pop('벨소리 메뉴에서\n벨소리로 정할 수 있어요');return}buy(r[1],K.PRICE.ring,24,()=>{D.got[r[0]]=1;K.save()})}}),
   it('컬러링으로 정하기',['colorSet',r]),it('친구에게 선물하기 (700원)',['giftTo',{item:r[0],name:'벨소리 '+r[1],price:K.PRICE.ring}])]});
 P.color=()=>({title:'컬러링',kb:2.4,crumb:'벨소리 > 컬러링',text:'컬러링은 친구가 나에게 전화할 때 ‘뚜르르’ 대신 들리는 노래예요.\n(같은 방 친구가 걸면 진짜로 들려요)\n\n지금 내 컬러링: '+(D.coloring?(K.ringById(D.coloring)||[0,'없음'])[1]:'없음 (기본 연결음)'),
  items:()=>[...RINGS().slice(0,10).map(r=>it(r[1],['colorSet',r],{num:'',sub:D.coloring===r[0]?'지금':'300원'})),it('컬러링 끄기',null,{num:'',act:()=>{D.coloring=null;K.save();K.pop('기본 연결음으로 바꿨어요');refresh()}})]});
 P.colorSet=r=>({title:'컬러링 정하기',kb:1.6,crumb:'컬러링 > '+r[1],text:'‘'+r[1]+'’을(를) 내 컬러링으로 정할까요?\n정보이용료 300원 (곡 하나)',
  items:()=>[it('미리 듣기',null,{act:()=>{dataCharge(2);K.playRing(r)}}),it('컬러링으로 정하기',null,{act:()=>{if(D.coloring===r[0]){K.pop('이미 내 컬러링이에요');return}K.ask('컬러링 정보이용료 300원\n정할까요?',()=>{pay('컬러링 '+r[1],K.PRICE.color);D.coloring=r[0];K.save();K.stopTune();K.pop('컬러링을 바꿨어요 ♪\n친구가 걸면 이 노래가 나와요',2200)})}})]});
 P.myRings=()=>({title:'내 벨소리함',kb:1.4,crumb:'벨소리 > 내 벨소리함',items:()=>K.rings().map(r=>it(r[1],null,{num:'',sub:D.ring===r[0]?'지금':'',act:()=>{D.ring=r[0];K.save();K.pop('‘'+r[1]+'’\n벨소리로 정했어요');refresh()}}))});
 P.chord=()=>({title:'화음 이야기',kb:1.2,crumb:'벨소리 > 화음',text:'16화음, 40화음, 64화음은 휴대폰이 한 번에 낼 수 있는 소리의 수예요.\n\n화음이 많을수록 악기 소리가 겹쳐서 진짜 노래처럼 풍성하게 들려요. 요즘은 MP3 벨소리까지 나왔다니 대단하죠?\n\n우리 애니콜은 64화음까지 됩니다 ^^'});
 /* 게임 */
 P.game=()=>({title:'게임',kb:3,crumb:'홈 > 게임',text:'[신규] 쿵짝 리듬왕 · 골목대장 전설\n애니콜 SCH-A99 완벽 지원!',items:()=>[it('★ 신규 게임',['newGames']),it('인기 게임 TOP 10',['gameTop']),it('게임 랭킹',['gameRank']),it('내 게임함으로 가기 (접속 끊음)',null,{act:()=>{exit(false);K.goScreen('games')}})]});
 P.newGames=()=>({title:'신규 게임',kb:3.2,crumb:'게임 > 신규',text:'이번 주 NATE가 고른 새 게임!\n(정보이용료와 별도로 게임 크기만큼 데이터 통화료가 나와요)',items:()=>CATALOG.filter(g=>g.isNew).map(g=>it(g.name,['gameItem',g],{sub:K.has(g.id)?'받음':g.genre}))});
 P.gameTop=()=>({title:'인기 게임',kb:3.6,crumb:'게임 > TOP',items:()=>CATALOG.slice().sort((a,b)=>b.pop-a.pop).map(g=>it(g.name,['gameItem',g],{sub:K.has(g.id)?'받음':g.genre}))});
 P.gameItem=g=>({title:g.name,kb:g.big?4.8:2.6,crumb:'게임 > '+g.name,text:g.name+' ('+g.genre+')\n'+g.desc+'\n\n정보이용료 '+won(g.price)+'\n용량 '+g.kb+'KB (데이터 통화료 약 '+won(Math.ceil(g.kb/PKT_KB)*PKT_WON)+' 별도)\n지원 기종: '+(g.play?'애니콜 SCH-A99 지원':'일부 컬러 기종만'),
  draw:g.big?(gg,t,top)=>{const pv=w.AnycallGames?.preview;if(!pv)return 0;const ww=72,hh=88,x0=(W-ww)/2;gg.save();gg.beginPath();gg.rect(x0,top+2,ww,hh);gg.clip();gg.translate(x0,top+2);try{pv(gg,g.id,t,ww,hh)}catch(_){}gg.restore();gg.strokeStyle='#333';gg.lineWidth=.8;gg.strokeRect(x0,top+2,ww,hh);T(gg,'게임 화면',W/2,top+hh+11,{size:7.5,color:'#8a6a4a',align:'center'});return hh+15}:null,
  items:()=>[it(K.has(g.id)?(g.big?'게임 시작하기 (접속 끊음)':'이미 받은 게임이에요'):'게임 받기',null,{act:()=>{if(K.has(g.id)){if(g.big){exit(false);K.goScreen(g.id);return}K.pop('게임 메뉴에서 할 수 있어요');return}if(!g.play){K.pop('이 휴대폰(SCH-A99)은\n지원하지 않는 게임이에요\n(용량이 큰 게임)',2600);return}buy(g.name,g.price,g.kb,()=>{D.got[g.id]=1;K.save();if(g.big)setTimeout(()=>K.ask('‘'+g.name+'’ 받기 완료!\n지금 해 볼까요? (접속 끊음)',()=>{exit(false);K.goScreen(g.id)}),1700)})}}),
   ...(g.big?[it('게임 설명서 (조작법)',['plain',{title:'설명서',crumb:g.name+' > 설명서',kb:1.6,text:g.how}]),it('게임 후기 ('+g.reviews.length+')',['plain',{title:'후기',crumb:g.name+' > 후기',kb:1.8,text:g.reviews.map(r=>r[0]+'  '+r[1]+'\n'+r[2]).join('\n\n')}]),it('공략 · 비법',['plain',{title:'공략',crumb:g.name+' > 공략',kb:1.4,text:g.tips}]),it('친구에게 선물하기 ('+won(g.price)+')',['giftTo',{item:g.id,name:'게임 '+g.name,price:g.price}])]:[])]});
 P.gameRank=()=>({title:'게임 랭킹',kb:2,crumb:'게임 > 랭킹',text:(()=>{const b=D.best||{};const row=(n,me,list)=>n+'\n'+list.map((x,i)=>(i+1)+'. '+x[0]+' '+x[1]).join('\n');const mole=[['두더지킹',41],['은하아파트짱',35],['나 (내 기록)',b.mole||0],['초딩고수',28]].sort((a,b)=>b[1]-a[1]);const run=[['점프의신',312],['나 (내 기록)',b.run||0],['동일초달리기',210],['강아지무서워',150]].sort((a,b)=>b[1]-a[1]);
   const gs=D.games||{},rh=[['리듬의신',982400],['나 (내 기록)',gs.rhythmBest||0],['피버타임',711300],['박자왕',540200]].sort((a,b)=>b[1]-a[1]),rp=[['골목대장',3],['나 (내 기록)',gs.rpgClears||0],['도깨비잡이',2],['떡꼬치러버',1]].sort((a,b)=>b[1]-a[1]);
   return row('[쿵짝 리듬왕] (최고 점수)',0,rh)+'\n\n'+row('[골목대장 전설] (엔딩 횟수)',0,rp)+'\n\n'+row('[두더지 잡기]',0,mole)+'\n\n'+row('[점프 달리기] (m)',0,run)})()});
 /* 폰꾸미기 */
 P.deco=()=>({title:'폰꾸미기',kb:2.6,crumb:'홈 > 폰꾸미기',items:()=>[it('배경 화면',['walls']),it('이모티콘·특수문자',['emo']),it('메뉴 색 테마',['theme']),it('문자 그림 받기 (공짜)',['arts'])]});
 P.arts=()=>({title:'문자 그림',kb:2.4,crumb:'폰꾸미기 > 문자 그림',text:'고르면 문자 쓰기 ‘보관함’에 들어가요. 여러 줄 그림 문자!',items:()=>(WT().SMS_ART||[]).map(a=>it(a[0],['artItem',a],{num:'',sub:D.emoBox.includes(a[1])?'보관함':''}))});
 P.artItem=a=>({title:a[0],kb:1,crumb:'문자 그림 > '+a[0],text:a[1]+'\n\n('+K.smsBytes(a[1])+'바이트)',items:()=>[it(D.emoBox.includes(a[1])?'이미 보관함에 있어요':'보관함에 넣기',null,{act:()=>{if(!D.emoBox.includes(a[1])){D.emoBox.unshift(a[1]);D.emoBox=D.emoBox.slice(0,20);K.save()}K.pop('문자 쓰기 → 이모티콘\n‘보관함’에 넣었어요',1500);refresh()}})]});
 P.walls=()=>({title:'배경 화면',kb:3.2,crumb:'폰꾸미기 > 배경',items:()=>K.allWalls().map(x=>it(x[1],['wallItem',x],{num:'',sub:owned(x[0])?'받음':'500원'}))});
 const owned=id=>K.FREE_WALLS.includes(id)||!!D.got['w:'+id];
 P.wallItem=x=>({title:x[1],kb:6.4,crumb:'배경 > '+x[1],preview:x[0],items:()=>[it(owned(x[0])?'배경 화면으로 정하기':'받기 (500원)',null,{act:()=>{if(owned(x[0])){D.wall=x[0];K.save();K.pop('배경 화면으로 정했어요');return}buy('배경 화면 '+x[1],K.PRICE.wall,30,()=>{D.got['w:'+x[0]]=1;D.wall=x[0];K.save()})}})],
  draw(g,t,top){g.save();g.beginPath();g.rect(10,top+2,W-20,92);g.clip();g.translate(10,top+2);try{WT().drawWall?WT().drawWall(g,x[0],W-20,92):R(g,0,0,W-20,92,'#7ac8ff')}catch(_){}g.restore();g.strokeStyle='#333';g.lineWidth=1;g.strokeRect(10,top+2,W-20,92);return 96}});
 P.emo=()=>({title:'이모티콘',kb:2,crumb:'폰꾸미기 > 이모티콘',text:'고르면 문자 쓰기의 ‘이모티콘 보관함’에 들어가요. (공짜)',items:()=>EMO_CATS.map(c=>it(c[0]+'  '+c[1][0],['emoCat',c]))});
 P.emoCat=c=>({title:c[0],kb:1.4,crumb:'이모티콘 > '+c[0],items:()=>c[1].map(e=>it(e,null,{num:'',sub:D.emoBox.includes(e)?'보관함':'',act:()=>{if(!D.emoBox.includes(e)){D.emoBox.unshift(e);D.emoBox=D.emoBox.slice(0,20);K.save()}K.pop('‘'+e+'’\n보관함에 넣었어요',1100);refresh()}}))});
 P.theme=()=>({title:'메뉴 색 테마',kb:2.2,crumb:'폰꾸미기 > 테마',items:()=>Object.entries(K.THEMES).map(([id,th])=>it(th.name,null,{num:'',sub:D.theme===id?'지금':id==='blue'||D.got['t:'+id]?'받음':'1,000원',
  act:()=>{if(id==='blue'||D.got['t:'+id]){D.theme=id;K.save();K.pop('테마를 바꿨어요');refresh();return}buy('테마 '+th.name,K.PRICE.theme,12,()=>{D.got['t:'+id]=1;D.theme=id;K.save()})}}))});
 /* 뉴스 · 날씨 · 월드컵 */
 const NEWS_SECS=['주요뉴스','속보','스포츠','문화·연예','생활·문화','IT·과학','경제·생활','네티즌이 뽑은 뉴스'];
 const recs=sec=>(PN().records||[]).filter(r=>r.type==='뉴스'&&r.section===sec);
 P.news=()=>({title:'뉴스·날씨',kb:3.2,crumb:'홈 > 뉴스',text:(()=>{const r=recs('주요뉴스')[0];return r?'[헤드라인] '+r.title:''})(),items:()=>[it('날씨',['weather']),it('독일 월드컵 특집',['wc']),...NEWS_SECS.filter(s=>recs(s).length).map(s=>it(s+' ('+recs(s).length+')',['newsSec',s],{num:''})),it('뮤직 · 연예 소식',['ent'],{num:''}),it('오늘의 TV 편성표',['tv'],{num:''}),it('가요 순위 투표 (100원)',['vote'],{num:''})]});
 P.newsSec=s=>({title:s,kb:2.8,crumb:'뉴스 > '+s,items:()=>recs(s).map(r=>it(r.title,['article',r],{num:'',sub:r.at}))});
 const clean=s=>String(s||'').replace(/<[^>]*>/g,'');
 P.article=r=>({title:r.section||'뉴스',kb:1.5+String(r.body||'').length/500,crumb:'뉴스 > '+(r.section||''),text:'■ '+r.title+'\n'+(r.press||'')+' '+(r.by||'')+' · 05.30 '+(r.at||'')+'\n\n'+clean(r.body),
  items:()=>{const L=recs(r.section),i=L.indexOf(r),nx=L[i+1];return[...(nx?[it('다음 기사',['article',nx])]:[]),it('목록으로',null,{act:back})]}});
 P.weather=()=>({title:'날씨',kb:2.4,crumb:'뉴스 > 날씨',text:(()=>{const wx=PN().weather||{},p=host.place();let s='우리 동네 지금: '+p.weather+' ('+p.time+')\n\n[오늘 전국]\n';for(const c of (wx.cities||[]))s+=c[0]+' '+c[1]+'°/'+c[2]+'° '+c[3]+' 비 '+c[4]+'\n';
   s+='\n[주간 날씨]\n';for(const d of (wx.week||[]))s+=d[0]+' '+d[1]+' '+d[2]+'°/'+d[3]+'°\n';if(wx.index)s+='\n[생활 지수]\n'+wx.index.map(x=>x[0]+' '+x[1]).join(' · ')+'\n';if(wx.note)s+='\n'+wx.note;return s})()});
 P.wc=()=>({title:'독일 월드컵',kb:3.4,crumb:'뉴스 > 월드컵',text:'2006 독일 월드컵 개막 D-10!\n개막: 6월 9일 (한국 시간 10일 새벽)\n\n[대한민국 G조]\n토고 · 프랑스 · 스위스\n\n[조별 경기 (한국 시간)]\n6월 13일(화) 밤 10시 토고전 · 프랑크푸르트\n6월 19일(월) 새벽 4시 프랑스전 · 라이프치히\n6월 24일(토) 새벽 4시 스위스전 · 하노버\n\n[평가전]\n6월 1일 노르웨이 · 6월 4일 가나\n\n붉은 옷 입고 다 같이 대~한민국!',
  items:()=>[it('응원가 벨소리 공짜로 받기',['event']),it('응원 문자 이모티콘 받기',['emoCat',EMO_CATS[6]])]});
 P.ent=()=>({title:'뮤직·연예',kb:2.6,crumb:'뉴스 > 연예',items:()=>[...(WT().MB_NEWS||[]).map(n=>it(n[0],['plain',{title:'연예 소식',crumb:'연예',text:'■ '+n[0]+'\n'+n[1]+'\n\n'+n[2]}],{num:'',sub:String(n[1]).slice(0,5)})),...recs('문화·연예').map(r=>it(r.title,['article',r],{num:''}))]});
 P.plain=o=>({title:o.title,kb:o.kb||1.4,crumb:o.crumb||'',text:o.text,items:o.items?()=>o.items:undefined});
 /* 만화 · 소설 · 유머 */
 P.fun=()=>({title:'만화·소설·유머',kb:2.6,crumb:'홈 > 재미',items:()=>[it('모바일 만화 (종이모뎀 만화실)',['comics']),it('인터넷 소설: '+NOVEL.title,['novel']),it('엽기 유머·퀴즈',['humor']),it('심리 테스트',['psy']),it('이름 궁합',['match']),it('사다리 타기',['ladder']),it('NATE OX 퀴즈',['quiz']),it('묻고 답하기',['qna'])]});
 P.comics=()=>({title:'모바일 만화',kb:2.4,crumb:'재미 > 만화',text:'한 컷씩 넘겨 보는 모바일 만화. 컷마다 데이터 약 7KB',items:()=>(PC().series||[]).map(s=>it(s.title,['comicEp',s],{sub:s.genre?String(s.genre).split(/[ ·]/)[0]:''}))});
 P.comicEp=s=>({title:s.title,kb:2.2,crumb:'만화 > '+s.title,text:s.subtitle||'',items:()=>(PC().episodes||[]).filter(e=>e.series===s.id).map(e=>it((e.no?e.no+'화 ':'')+e.title,['comicView',{ep:e,i:0}],{num:''}))});
 const IMG=new Map();
 const img=src=>{if(!src||!host.makeImage)return null;if(!IMG.has(src))IMG.set(src,host.makeImage(src,()=>K.dirty()));const im=IMG.get(src);return im&&im.complete&&im.naturalWidth?im:null};
 P.comicView=o=>{const e=o.ep,n=(e.panels||[]).length,last=o.i>=n;return{title:e.title,kb:last?1.2:7,crumb:(o.i<n?(o.i+1)+'/'+n+'컷':'댓글'),
  text:last?'[댓글]\n'+(e.readers||[]).join('\n'):(e.panels[o.i].dialogue||[]).map(d=>d[0]+': '+d[1]).join('\n'),
  draw:last?null:(g,t,top)=>{const p=e.panels[o.i],im=img(p.src),hh=72,ww=Math.min(W-8,hh*(p.artRatio||1.45)),x0=(W-ww)/2;if(im){g.drawImage(im,x0,top+2,ww,hh)}else{R(g,x0,top+2,ww,hh,'#eee');T(g,'그림 받는 중...',W/2,top+hh/2+4,{size:9,color:'#888',align:'center'})}g.strokeStyle='#333';g.lineWidth=.6;g.strokeRect(x0,top+2,ww,hh);return hh+5},
  items:()=>[...(o.i<n?[it(o.i+1<n?'다음 컷 ▶':'댓글 보기 ▶',['comicView',{ep:e,i:o.i+1}])]:[]),it('목록으로',null,{act:()=>{while(B.stack.length&&B.cur&&B.cur.kind==='comic')back()}})],kind:'comic'}};
 P.novel=()=>({title:'인터넷 소설',kb:1.8,crumb:'재미 > 소설',text:NOVEL.title+'\n글쓴이: '+NOVEL.by+'\n조회 128,402 · 추천 9,821',items:()=>NOVEL.chapters.map((c,i)=>it(c[0],['novelCh',i]))});
 P.novelCh=i=>({title:NOVEL.chapters[i][0],kb:2.2,crumb:'소설 > '+(i+1)+'화',text:NOVEL.chapters[i][1],items:()=>[...(i+1<NOVEL.chapters.length?[it('다음 화 ▶',['novelCh',i+1])]:[]),it('목록으로',null,{act:back})]});
 P.humor=()=>({title:'엽기 유머',kb:1.8,crumb:'재미 > 유머',items:()=>HUMOR.map((h,i)=>it(h[0],['joke',i]))});
 P.joke=i=>{const h=HUMOR[i],quiz=/\?$/.test(h[0]);return{title:'유머',kb:1.2,crumb:'유머 > '+(i+1),text:quiz?'Q. '+h[0]+'\n\n(5번이나 ‘정답 보기’)':h[1],items:()=>[...(quiz?[it('정답 보기',null,{act:()=>{B.cur.text='Q. '+h[0]+'\n\nA. '+h[1]+'\n\nㅋㅋㅋ';refresh()}})]:[]),...(i+1<HUMOR.length?[it('다음 유머 ▶',['joke',i+1])]:[])]}};
 P.psy=()=>({title:'심리 테스트',kb:1.6,crumb:'재미 > 심리',text:'세 문제만 답해 보세요!',items:()=>[it(PSY.title,['psyQ',{i:0,s:[0,0,0]}]),it(PSY2.title,['psyQ',{i:0,s:[0,0,0],t:2}])]});
 P.psyQ=o=>{const T2=o.t===2?PSY2:PSY;if(o.i>=T2.qs.length){const k=o.s.indexOf(Math.max(...o.s));const r=T2.res[k];return{title:'결과',kb:1.2,crumb:'심리 > 결과',text:'당신은... 『'+r[0]+'』\n\n'+r[1],items:()=>[it('다시 하기',['psyQ',{i:0,s:[0,0,0],t:o.t}])]}}
  const q=T2.qs[o.i];return{title:'질문 '+(o.i+1),kb:.8,crumb:'심리 > '+(o.i+1)+'/'+T2.qs.length,text:'Q'+(o.i+1)+'. '+q[0],items:()=>q[1].map((a,j)=>it(a,['psyQ',{i:o.i+1,s:o.s.map((v,x)=>x===j?v+1:v),t:o.t}]))}};
 /* 싸이월드 모바일 (같은 방 친구 미니홈피와 실시간 연결) */
 const live=()=>MH()?.live||null;
 const rows=()=>(live()?.list||[]);
 const meHid=()=>live()?.me?.hid||'';
 P.cy=()=>({title:'싸이월드 모바일',kb:3,crumb:'홈 > 싸이월드',text:K.NET.ready()?(rows().length?'같은 방 미니홈피 '+rows().length+'개 · 파도타기 해 볼까요?':'미니홈피를 불러오는 중이에요.\n잠시 뒤 다시 들어와 보세요.'):'함께 걷기 방에 들어가면 같은 방 친구들의 미니홈피에 놀러 갈 수 있어요.\n(방 밖에서는 구경만 할 수 없어요)',
  items:()=>{const L=rows(),me=meHid(),mine=L.find(r=>r.hid===me);return[...(mine?[it('내 미니홈피 · TODAY '+(mine.today||0),['cyHome',mine])]:[]),...L.filter(r=>r.hid!==me).map(r=>it((r.on?'● ':'○ ')+(r.title||r.n+'의 미니홈피'),['cyHome',r],{num:'',sub:r.n})),...(L.length>1?[it('파도타기 (아무 데나)',null,{num:'',act:()=>{const o=L.filter(r=>r.hid!==me);if(o.length)nav('cyHome',o[Math.floor(Math.random()*o.length)])}})]:[])]}});
 P.cyHome=r0=>{const r=()=>rows().find(x=>x.hid===r0.hid)||r0,me=r0.hid===meHid();return{title:me?'내 미니홈피':r0.n+'의 미니홈피',kb:4.2,crumb:'싸이 > '+r0.n,
  onShow(){if(!me&&!B.visited.has(r0.hid)&&MH()?.send){B.visited.add(r0.hid);MH().send('visit',{op:'visit',hid:r0.hid});K.pop(r0.n+'님 미니홈피에\n놀러 왔어요 (TODAY +1)',1600)}},
  text:(()=>{const x=r();return(x.title||'')+'\n\n오늘의 기분: '+(x.mood||'보통')+'\nTODAY '+(x.today||0)+' · TOTAL '+(x.total||0)+'\n사진 '+(x.np||0)+'장 (사진은 PC에서 봐요)\n'+(x.on?(x.pc?'지금 PC방에서 접속 중':'지금 동네에 있어요'):'지금은 방에 없어요')})(),
  items:()=>[it('방명록 보기',['cyGb',r0]),...(me?[]:[it('방명록 쓰기',['cyWrite',r0])])]}};
 P.cyGb=r0=>({title:'방명록',kb:3.6,crumb:r0.n+' > 방명록',onShow(){B.gbWait=r0.hid;if(MH()?.send)MH().send('read',{op:'gb',hid:r0.hid,page:1})},
  text:'',live:()=>{const gb=live()?.gb?.[r0.hid];if(!gb)return MH()?.send&&K.NET.ready()?'방명록 불러오는 중...':'방에 들어가 있어야 볼 수 있어요';if(!gb.list?.length)return'아직 방명록이 없어요. 첫 글을 남겨 보세요!';
   return'방명록 '+gb.total+'개\n\n'+gb.list.map(e=>'['+e.n+'] '+e.t+(e.r?'\n  └ 주인 답글: '+e.r:'')).join('\n\n')},
  items:()=>r0.hid!==meHid()?[it('방명록 쓰기',['cyWrite',r0])]:[]});
 P.cyWrite=r0=>({title:'방명록 쓰기',kb:1.2,crumb:r0.n+' > 쓰기',text:r0.n+'님 방명록에 남길 말 (100자까지)',input:{ph:'방명록 쓰기 · Enter 남기기',max:200,submit:t=>{t=t.trim();if(!t)return;if(!MH()?.send||!K.NET.ready()){K.pop('방에 들어가 있어야\n남길 수 있어요');return}
   const ok=MH().send('write',{op:'gbw',hid:r0.hid,t:t.slice(0,100)});dataCharge(.8);back();K.pop(ok?'방명록을 남겼어요 ^^':'남기지 못했어요',1600);if(ok&&B.cur?.onShow)setTimeout(()=>B.cur?.onShow?.(),700)}}});
 /* 채팅 · 동네 소식 */
 P.comm=()=>({title:'채팅·동네 소식',kb:2.4,crumb:'홈 > 커뮤니티',items:()=>[it('NATE 채팅 (함께 걷기 방)',['chat']),it('동네 게시판',['board']),it('우리 동네 가게',['shops']),it('동네 투표 결과',['polls']),it('아파트 관리 사무소 공지',['notice'])]});
 function chatSeed(){if(B.chatSub)return;B.chatSub=true;try{const d=w.document,lines=d?.querySelectorAll?.('#a25Log .a25-line');for(const l of Array.from(lines||[]).slice(-8)){const n=l.querySelector('strong')?.textContent||'',t=l.querySelector('span')?.textContent||'';if(n&&t)B.chat.push({n,t:t.trim()})}}catch(_){}
  w.A25NET?.subscribe?.(m=>{if(m&&m.type==='chat'){B.chat.push({n:m.name||'친구',t:String(m.text||''),me:m.id===w.A25NET?.state?.id});B.chat=B.chat.slice(-30);if(B.cur?.kind==='chat')K.dirty()}})}
 P.chat=()=>({title:'NATE 채팅',kb:2,crumb:'커뮤니티 > 채팅',kind:'chat',onShow:chatSeed,input:{ph:'채팅 쓰기 · Enter 보내기',max:120,submit:t=>{t=t.trim();if(!t)return;if(!K.NET.ready()){K.pop('함께 걷기 방에\n들어가야 해요');return}w.A25NET.send({type:'chat',text:('[폰] '+t).slice(0,80)});dataCharge(.5);B.ed.clear();K.edChanged()}},
  live:()=>K.NET.ready()?(B.chat.length?B.chat.slice(-7).map(c=>(c.me?'나':c.n)+': '+c.t).join('\n'):'같은 방 친구들과 이야기해 보세요.\n(방 채팅창에도 똑같이 나와요)'):'함께 걷기 방에 들어가면 같은 방 친구들과 채팅할 수 있어요.'});
 P.board=()=>({title:'동네 게시판',kb:2.8,crumb:'커뮤니티 > 게시판',items:()=>(WT().TOWN_BOARD||[]).map(b=>it('['+b[1]+'] '+b[2],['plain',{title:'동네 게시판',crumb:'게시판 > '+b[1],kb:1.6,text:'■ '+b[2]+'\n'+b[3]+' · '+b[4]+'\n\n'+b[5]}],{num:''}))});
 P.shops=()=>({title:'우리 동네 가게',kb:2.8,crumb:'커뮤니티 > 가게',items:()=>(WT().PLACES||[]).map(p=>it(p[1],['shop',p],{num:'',sub:String(p[2]).split(' ')[0]}))});
 P.shop=p=>({title:p[1],kb:2.2,crumb:'가게 > '+p[1],text:'■ '+p[1]+' ('+p[2]+')\n'+p[4]+'\n\n'+(p[5]||'')+(Array.isArray(p[6])&&p[6].length?'\n\n[후기]\n'+p[6].map(v=>v[0]+' '+'★'.repeat(v[2]||0)+'\n'+v[3]).join('\n\n'):'')});
 /* 지도 · 운세 · 생활 */
 P.life=()=>({title:'지도·운세·생활',kb:2.4,crumb:'홈 > 생활',items:()=>[it('동네 지도 (내 위치)',['map']),it('띠별 오늘의 운세',['luck']),it('6번 마을버스 시간표',['bus']),it('숫자 바로가기 번호',['codes']),it('학교·생활 (급식, 알림장)',['school']),it('오늘의 TV',['tv'])]});
 function pinOf(p){if(!p)return null;const id=SCENE_PIN[p.scene]||(p.playground?'park':null);if(id)return id;const area=host.place().area;for(const [pid,keys] of Object.entries(PLACE_PIN))if(keys.some(k=>area.includes(k)))return pid;return'school'}
 function pinXY(id){const pl=(WT().PLACES||[]).find(q=>q[0]===id);if(!pl)return[320,190];const r=pl[3];return[r[0]+r[2]/2,r[1]+r[3]/2]}
 P.map=()=>({title:'동네 지도',kb:9.6,crumb:'생활 > 지도',kind:'map',zoom:0,text:'',items:()=>[],
  draw(g,t,top){const z=this.zoom?2:1,mw=640,mh=380,vw=W-4,vh=Math.min(Y1-top-26,104),s=vw/mw*z;const me=pinXY(pinOf(host.me?.()||{scene:host.scene?.()}));
   let ox=0,oy=0;if(z>1){ox=clamp(me[0]-vw/s/2,0,mw-vw/s);oy=clamp(me[1]-vh/s/2,0,mh-vh/s)}
   g.save();g.beginPath();g.rect(2,top,vw,vh);g.clip();g.translate(2,top);g.scale(s,s);g.translate(-ox,-oy);try{WT().drawTown?WT().drawTown(g,null,null):R(g,0,0,mw,mh,'#f7f1dd')}catch(_){R(g,0,0,mw,mh,'#f7f1dd')}g.restore();
   const pin=(x,y,c,lab)=>{const px=2+(x-ox)*s,py=top+(y-oy)*s;if(px<2||px>W-2||py<top||py>top+vh)return;g.fillStyle=c;g.beginPath();g.arc(px,py-4,3.6,Math.PI,0);g.lineTo(px,py+2);g.closePath();g.fill();circ(g,px,py-4,1.4,'#fff');if(lab)T(g,lab,px,py-9,{size:7.5,bold:true,color:c,align:'center',shadow:'#fff'})};
   for(const f of K.friends()){const q=pinXY(pinOf(f.p));pin(q[0]+8,q[1]+4,'#2b8a3a',f.n)}
   pin(me[0],me[1],'#e8402a','나');g.strokeStyle='#666';g.lineWidth=.8;g.strokeRect(2,top,vw,vh);
   T(g,'지금: '+host.place().area,4,top+vh+11,{size:8.5,bold:true,color:'#1d2633',max:W-8});T(g,'5 확대/전체 · 빨강=나 · 초록=친구',4,top+vh+22,{size:7.5,color:'#6b778a'});return vh+24},
  key(id){if(id==='5'||id==='ok'||id==='nate'){this.zoom=this.zoom?0:1;dataCharge(4.8);return true}return false}});
 P.luck=()=>({title:'띠별 운세',kb:2.2,crumb:'생활 > 운세',text:'2006년은 병술년, 개띠 해!',items:()=>ZODIAC.map((z,i)=>it(z[0],['plain',{title:'오늘의 운세',crumb:'운세 > '+z[0],kb:1.2,text:'['+z[0]+'] 2006년 5월 30일 (화)\n\n'+z[1]+'\n\n행운의 숫자: '+((i*7+3)%9+1)+'\n행운의 색: '+['빨강','노랑','파랑','초록','보라','주황'][i%6]}],{num:''}))});
 P.bus=()=>({title:'6번 마을버스',kb:1.4,crumb:'생활 > 버스',text:'은하아파트 ↔ 동일초등학교 ↔ 큰길 상가 ↔ 지하철역\n\n첫차 06:10 · 막차 23:20\n12분마다 (출퇴근 시간 8분)\n\n지금 오후 '+host.clock().hh+':'+host.clock().mm+'\n다음 버스: 동일초 앞 약 '+((60-Number(host.clock().m))%12||12)+'분 뒤\n\n요금 (교통카드): 어른 600원 · 학생 450원 · 어린이 300원'});
 P.codes=()=>({title:'숫자 바로가기',kb:1.2,crumb:'생활 > 바로가기',text:'대기 화면에서 번호를 누르고 NATE 버튼을 누르면 바로 들어가요.\n\n'+Object.entries(CODES).map(([k,v])=>k+'  '+v[1]).join('\n')});
 /* MY NATE */
 P.my=()=>({title:'MY NATE',kb:2.2,crumb:'홈 > MY NATE',items:()=>[it('이번 접속 요금',['session']),it('이번 달 휴대폰 요금',['bill']),it('정보이용료 내역',['pay']),it('즐겨찾기 ('+D.bm.length+')',['bm']),it('최근 본 쪽',['hist']),it('무선 인터넷 이용 안내',['guide']),it('선물함 ('+(D.gifts||[]).length+')',['gifts'])]});
 P.session=()=>({title:'이번 접속 요금',kb:1,crumb:'MY > 접속 요금',text:'접속한 지 '+Math.max(1,Math.round((now()-B.t0)/60000))+'분\n받은 데이터 '+B.kb.toFixed(1)+'KB\n= '+B.pkts+'패킷 (0.5KB = 1패킷)\n데이터 통화료 '+won(B.won)+'\n정보이용료 '+won(B.info)+'\n\n※ 데이터 통화료는 0.5KB당 6.5원이에요.\n게임 하나만 받아도 수천 원이 나올 수 있어요!'});
 P.bill=()=>({title:'이번 달 요금',kb:1.2,crumb:'MY > 요금',text:(()=>{const b=D.bill;return'문자 '+b.sms+'건\n통화 '+b.sec+'초\nNATE 데이터 '+won(b.data)+'\n정보이용료 '+won(b.info)+'\n\n합계 '+won(K.billTotal())+'\n\n'+(K.billTotal()>=10000?'※ 만 원이 넘었어요! 엄마한테 혼날지도 ㅠㅠ':'※ 만 원이 넘으면 엄마한테 문자가 와요')})()});
 P.pay=()=>({title:'정보이용료 내역',kb:1.2,crumb:'MY > 내역',text:D.payLog.length?D.payLog.map(x=>x.time+' '+x.name+' '+won(x.won)).join('\n'):'아직 정보이용료가 없어요.'});
 P.bm=()=>({title:'즐겨찾기',kb:.8,crumb:'MY > 즐겨찾기',text:D.bm.length?'':'매뉴 버튼 → ‘즐겨찾기에 추가’로 넣을 수 있어요.',items:()=>D.bm.map(b=>it(b.t,[b.id],{num:''}))});
 P.hist=()=>({title:'최근 본 쪽',kb:.8,crumb:'MY > 최근',items:()=>B.hist.slice(0,12).map(h=>it(h.t,[h.id,h.arg],{num:''}))});
 P.guide=()=>({title:'이용 안내',kb:1.2,crumb:'MY > 안내',text:'[NATE 버튼 조작]\n1~9 메뉴 고르기 · 0 NATE 홈\n* 이전 쪽 · # 맨 위\n매뉴: 홈, 즐겨찾기, 요금, 접속 끊기\n취소: 이전 · 종료: 접속 끊기\n◀ ▶ 긴 글 앞뒤로 넘기기\n\n[요금]\n데이터 통화료: 0.5KB당 6.5원\n정보이용료: 벨소리 700원, 게임 1,500~3,000원 등 따로\n\n[숫자 바로가기]\n대기 화면에서 번호 + NATE'});
 P.event=()=>({title:'이벤트',kb:3.8,crumb:'홈 > 이벤트',text:'★ 월드컵 응원가 벨소리 공짜! ★\n‘붉은 함성 응원가’ (40화음)\n정보이용료 0원 (데이터 통화료만)\n\n6월 30일까지',items:()=>[it(K.has('r8')?'이미 받았어요':'공짜로 받기',null,{act:()=>{if(K.has('r8')){K.pop('벨소리 메뉴에서\n정할 수 있어요');return}buy('붉은 함성 응원가',0,24,()=>{D.got.r8=1;K.save()})}}),it('미리 듣기',null,{act:()=>{const r=K.ringById('r8');if(r){dataCharge(2);K.playRing(r)}}})]});

 /* ---------- A124: 더 채운 쪽들 ---------- */
 /* 친구에게 선물하기: 같은 방 친구에게 진짜로 간다. 서버가 받았다고 하면 그때 정보이용료가 나간다 */
 P.giftTo=o=>({title:'선물하기',kb:1.6,crumb:'선물 > '+o.name,text:'‘'+o.name+'’을(를) 선물할 친구를 골라요.\n정보이용료 '+won(o.price)+' (보내는 사람이 내요)\n'+(K.NET.ready()?(K.friends().length?'':'\n같은 방에 친구가 없어요.'):'\n함께 걷기 방에 들어가야 보낼 수 있어요.'),
  items:()=>K.friends().map(f=>it(f.n,null,{num:'',sub:'같은 방',act:()=>K.ask('‘'+o.name+'’을(를)\n'+f.n+'에게 선물할까요?\n정보이용료 '+won(o.price),()=>{if(!K.gift(f,o.item,'선물이야 ^^')){K.pop('보내지 못했어요');return}B.giftWait={...o,to:f.n,t0:now()};K.pop('선물 보내는 중...',1200)})}))});
 /* 가요 순위 투표 (정보이용료 100원) */
 const VOTE_BASE=id=>{let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return 800+h%2400};
 const votes=()=>{D.nateVote=D.nateVote&&typeof D.nateVote==='object'?D.nateVote:{};return D.nateVote};
 P.vote=()=>({title:'가요 순위 투표',kb:2.2,crumb:'벨소리 > 투표',text:'이번 주 1위는 누구? 한 번 투표할 때마다 정보이용료 100원이 나와요.',items:()=>(WT().SONGS||[]).slice(0,8).map(sg=>it(sg[1]+' - '+sg[2],null,{num:'',sub:(VOTE_BASE(sg[0])+(votes()[sg[0]]||0)).toLocaleString('ko-KR')+'표',act:()=>K.ask('‘'+sg[1]+'’에 투표할까요?\n정보이용료 100원',()=>{pay('가요 순위 투표',100);votes()[sg[0]]=(votes()[sg[0]]||0)+1;K.save();nav('voteRes',null,{kb:1.4})})}))});
 P.voteRes=()=>({title:'투표 결과',kb:1.4,crumb:'투표 > 결과',text:'투표해 주셔서 감사합니다! 지금 순위',items:()=>[],
  draw(g,t,top){const L=(WT().SONGS||[]).slice(0,8).map(sg=>[sg[1],VOTE_BASE(sg[0])+(votes()[sg[0]]||0)]).sort((a,b)=>b[1]-a[1]),mx=L[0]?L[0][1]:1;
   L.slice(0,6).forEach(([n,v],i)=>{const y=top+i*15;T(g,(i+1)+'. '+n,4,y+9,{size:8.5,bold:i===0,color:'#1d2633',max:64});R(g,70,y+2,(W-110)*v/mx,8,i===0?'#ff7a12':'#ffb36a');T(g,v.toLocaleString('ko-KR'),W-3,y+9.5,{size:7.5,color:'#8a5a2a',align:'right'})});return 6*15+2}});
 /* 이름 궁합: 두 이름의 획수를 번갈아 쓰고 이웃끼리 더해 두 자리가 될 때까지 (그 시절 쪽지 놀이) */
 P.match=()=>({title:'이름 궁합',kb:1.8,crumb:'재미 > 이름 궁합',text:'두 사람 이름을 띄어 써 보세요.\n(예: 김철수 이영희)\n획수로 보는 그 시절 이름 궁합!',
  input:{ph:'이름 두 개를 띄어 쓰고 Enter',max:30,submit:q=>{const ns=String(q).trim().split(/\s+/).filter(Boolean);if(ns.length<2){K.pop('이름 두 개를\n띄어 써 주세요');return}
   const r=matchScore(ns[0],ns[1]);if(!r){K.pop('한글 이름만\n볼 수 있어요');return}nav('matchRes',{a:ns[0],b:ns[1],r},{kb:1.2})}}});
 P.matchRes=o=>{const p=o.r.pct,msg=p>=90?'천생연분 ♡ 둘이 꼭 붙어 다녀요!':p>=70?'아주 잘 맞아요 ^^':p>=50?'나쁘지 않아요~ 더 친해져 봐요':p>=30?'노력이 필요해요 ㅋㅋ':'...그냥 좋은 친구로 지내요 ㅠㅠ';
  return{title:'궁합 결과',kb:1.2,crumb:'이름 궁합 > 결과',text:o.a+' ♡ '+o.b+'\n\n'+o.r.rows.map(r=>r.join(' ')).join('\n')+'\n\n궁합 '+p+'%\n'+msg,items:()=>[it('다른 이름으로 보기',null,{act:back})]}};
 /* 사다리 타기: 1~4 번을 누르면 그 줄을 따라 내려간다 */
 P.ladder=()=>{const names=['나',...K.friends().map(f=>f.n),'민호','형','영수'].slice(0,4),res=['떡볶이 쏘기','꽝','아이스크림 쏘기','꽝'].sort(()=>Math.random()-.5),rungs=[];
  for(let r=0;r<6;r++){const c=Math.floor(Math.random()*3);if(!rungs.some(x=>x.r===r&&Math.abs(x.c-c)<=1))rungs.push({r,c});const c2=(c+2)%3;if(Math.random()<.5&&!rungs.some(x=>x.r===r&&Math.abs(x.c-c2)<=1))rungs.push({r,c:c2})}
  const path=s=>{let c=s;const pts=[[c,-1]];for(let r=0;r<6;r++){const L=rungs.find(x=>x.r===r&&x.c===c-1),Rg=rungs.find(x=>x.r===r&&x.c===c);pts.push([c,r]);if(L)c--;else if(Rg)c++;pts.push([c,r])}pts.push([c,6]);return{end:c,pts}};
  return{title:'사다리 타기',kb:2,crumb:'재미 > 사다리',text:'1~4번을 누르면 사다리를 타요. 누가 쏠까? ㅋㅋ',kind:'ladder',run:null,items:()=>[],
   draw(g,t,top){const x0=18,dx=(W-36)/3,y0=top+12,hh=66,yr=r=>y0+6+r*(hh-12)/5;names.forEach((n,i)=>T(g,(i+1)+'.'+n,x0+i*dx,top+8,{size:7.5,bold:true,color:'#1d2633',align:'center',max:dx}));
    g.strokeStyle='#8a6a4a';g.lineWidth=1.2;for(let i=0;i<4;i++){g.beginPath();g.moveTo(x0+i*dx,y0);g.lineTo(x0+i*dx,y0+hh);g.stroke()}for(const q of rungs){g.beginPath();g.moveTo(x0+q.c*dx,yr(q.r));g.lineTo(x0+(q.c+1)*dx,yr(q.r));g.stroke()}
    const shown=this.run?res:res.map(()=>'?');shown.forEach((r,i)=>T(g,r,x0+i*dx,y0+hh+10,{size:7,bold:true,color:r==='꽝'?'#8a94a8':'#e8402a',align:'center',max:dx+4}));
    if(this.run){const P2=path(this.run.s),k=clamp((t-this.run.t0)/1600,0,1),n=Math.floor(k*(P2.pts.length-1));g.strokeStyle='#ff3a2a';g.lineWidth=2;g.beginPath();P2.pts.slice(0,n+1).forEach(([c,r],i)=>{const x=x0+c*dx,y=r<0?y0:r>=6?y0+hh:yr(r);if(i)g.lineTo(x,y);else g.moveTo(x,y)});g.stroke();
     if(k>=1)T(g,names[this.run.s]+' → '+res[P2.end]+'!',W/2,y0+hh+22,{size:9,bold:true,color:'#c0501a',align:'center'})}return hh+40},
   key(id){if(/^[1-4]$/.test(id)&&+id<=names.length){this.run={s:+id-1,t0:now()};dataCharge(.3);K.dirty();return true}return false}}};
 /* NATE OX 퀴즈: 다섯 문제 */
 P.quiz=()=>({title:'OX 퀴즈',kb:1.6,crumb:'재미 > 퀴즈',text:'NATE OX 퀴즈! 다섯 문제를 맞혀 보세요.\n다 맞히면 퀴즈왕 ★',items:()=>[it('시작하기',null,{act:()=>{const pick=OX.map((q,i)=>i).sort(()=>Math.random()-.5).slice(0,5);nav('quizQ',{pick,i:0,score:0},{kb:.8})}})]});
 P.quizQ=o=>{if(o.i>=o.pick.length){const s=o.score;return{title:'퀴즈 결과',kb:1,crumb:'퀴즈 > 결과',text:'5문제 중 '+s+'문제 맞혔어요!\n'+(s===5?'★ 퀴즈왕 ★ 대단해요!':s>=3?'잘했어요 ^^':'다음엔 더 잘할 수 있어요 ㅋㅋ'),items:()=>[it('다시 하기',['quiz'])]}}
  const q=OX[o.pick[o.i]];return{title:'퀴즈 '+(o.i+1)+'/5',kb:.8,crumb:'퀴즈 > '+(o.i+1),text:'Q'+(o.i+1)+'. '+q[0],items:()=>[it('O (맞다)',null,{act:()=>ans(1)}),it('X (틀리다)',null,{act:()=>ans(0)})]};
  function ans(v){const ok=v===q[1];K.pop(ok?'딩동댕! 정답 ^^':'땡! 정답은 '+(q[1]?'O':'X'),1100);nav('quizQ',{pick:o.pick,i:o.i+1,score:o.score+(ok?1:0)},{kb:.8,push:false})}};
 const QNA=[['키 크는 법 알려 주세요 ㅠㅠ','동일초4학년','우유 많이 마시고 일찍 자요! 줄넘기도 좋아요. (답변 채택)'],['문자 80바이트 넘으면 어떻게 돼요?','문자왕','두 통으로 나뉘어 가서 문자 요금도 두 번 나와요!'],
  ['NATE 접속하면 요금 많이 나와요?','궁금이','0.5KB에 6.5원이라 게임 하나 받으면 몇천 원이에요. 엄마한테 혼남 주의 ㅋㅋ'],['월드컵 토고전 몇 시예요?','붉은악마','6월 13일 밤 10시요! 대~한민국'],
  ['컵떡볶이 제일 맛있는 집?','떡볶이러버','동일초 앞 은하분식이요. 국물이 끝내줘요 ^^'],['리코더 잘 부는 법?','음악시간싫어','구멍을 손가락 배로 꼭 막고 살살 부세요. 세게 불면 삑 소리 나요 ㅋㅋ']];
 P.qna=()=>({title:'묻고 답하기',kb:2,crumb:'재미 > 묻고 답하기',items:()=>QNA.map(q=>it('Q. '+q[0],['plain',{title:'묻고 답하기',crumb:'묻고 답하기',kb:1,text:'Q. '+q[0]+'\n(질문: '+q[1]+')\n\nA. '+q[2]}],{num:''}))});
 /* 학교·생활: 급식, 알림장, 학교 소식, 아파트 공지, 동네 투표 (PC 동일초 누리집, 동네 소식통과 같은 내용) */
 P.school=()=>({title:'학교·생활',kb:2.2,crumb:'생활 > 학교',items:()=>[it('이번 주 급식',['meal']),it('알림장 (숙제)',['plain',{title:'알림장',crumb:'학교 > 알림장',kb:1,text:'[동일초 4학년 알림장 5월 30일]\n\n'+(WT().DG_HOMEWORK||[]).map((h,i)=>(i+1)+'. '+h).join('\n')}]),it('학교 소식',['schoolNews'])]});
 P.meal=()=>({title:'급식',kb:1.2,crumb:'학교 > 급식',text:(()=>{const M=WT().DG_MEAL||{};return'[동일초 급식]\n\n5월 29일 (월)\n'+(M[29]||'')+'\n\n5월 30일 (화) 오늘\n'+(M[30]||'')+'\n\n5월 31일 (수)\n지방선거일이라 쉬어요'})()});
 P.schoolNews=()=>({title:'학교 소식',kb:2,crumb:'학교 > 소식',items:()=>(WT().DG_NOTICE||[]).map(n=>it(n[1],['plain',{title:'학교 소식',crumb:'학교 소식',kb:1.6,text:'■ '+n[1]+'\n'+n[2]+'\n\n'+n[3]}],{num:''}))});
 P.notice=()=>({title:'관리 사무소',kb:1.8,crumb:'커뮤니티 > 공지',items:()=>(WT().TOWN_NOTICE||[]).map(n=>it(n[1],['plain',{title:'아파트 공지',crumb:'공지',kb:1.2,text:'■ '+n[1]+'\n'+n[2]+'\n\n'+n[3]}],{num:''}))});
 P.polls=()=>({title:'동네 투표',kb:1.6,crumb:'커뮤니티 > 투표',text:(WT().POLLS||[]).map(pl=>{const tot=pl[2].reduce((a,x)=>a+x[1],0)||1;return'■ '+pl[1]+'\n'+pl[2].map(x=>x[0]+' '+Math.round(x[1]*100/tot)+'%').join('\n')}).join('\n\n')+'\n\n(투표는 PC 동네 소식통에서 해요)'});
 P.tv=()=>({title:'오늘의 TV',kb:1.6,crumb:'생활 > TV',text:'[5월 30일 화요일 저녁]\n\n17:00 만화 ‘꼬마 공룡 초록이’\n17:30 퀴즈! 동네 대탐험\n18:00 어린이 뉴스 세상\n19:00 저녁 뉴스\n19:30 가요 순위 열전 (재방송)\n20:20 일일 드라마 ‘우리 집 막내’\n21:00 9시 뉴스\n21:55 월화 드라마 ‘주몽’\n23:00 월드컵 특집 ‘가자! 독일로’\n\n※ DMB로도 볼 수 있어요 (휴대폰 메뉴 → DMB)'});
 P.gifts=()=>({title:'선물함',kb:1,crumb:'MY > 선물함',text:(D.gifts||[]).length?D.gifts.map(x=>x.time+' '+x.from+' → '+x.name).join('\n'):'아직 받은 선물이 없어요.\n같은 방 친구가 벨소리나 게임을 선물하면 여기에 남아요.'});

 /* ---------- 받기 (정보이용료 + 데이터) ---------- */
 function buy(name,price,kb,done){K.ask('‘'+name+'’\n정보이용료 '+(price?won(price):'없음 (공짜)')+'\n데이터 약 '+kb+'KB (약 '+won(Math.ceil(kb/PKT_KB)*PKT_WON)+') 별도\n받을까요?',()=>{K.stopTune();B.dl={name,price,kb,done,t0:now(),dur:Math.min(4200,700+kb*9)};K.dirty()})}
 function finishDl(){const d=B.dl;B.dl=null;dataCharge(d.kb);pay(d.name,d.price);try{d.done()}catch(_){}K.pop('‘'+d.name+'’\n받기 완료!',1600);refresh()}

 /* ---------- 이동 ---------- */
 function make(id,arg){const f=P[id];if(!f)return null;const pg=f(arg);pg.id=id;pg.arg=arg;return pg}
 /* 실내(PC방, 슈퍼, 문구점, 아파트 안)에서는 가끔 접속이 끊긴다. 받은 만큼은 요금이 나온다 */
 const INDOOR=new Set(['pcroom','stationery','supermarket','lobby','hall']);
 function nav(id,arg,o={}){let pg=make(id,arg);if(!pg)return;let kb=o.kb??pg.kb??2;
  if(INDOOR.has(host.scene?.())&&id!=='home'&&Math.random()<(o.failRate??.15)){const real=[id,arg];pg={id:'fail',title:'접속 오류',kb:.4,crumb:'오류',text:'통신 상태가 좋지 않아 쪽을 불러오지 못했어요.\n(실내라 전파가 약해요)\n\n받다 만 데이터에도 요금이 나와요 ㅠㅠ',items:()=>[it('다시 시도',null,{act:()=>{back();nav(real[0],real[1],{failRate:0})}}),it('이전으로',null,{act:back})]};dataCharge(Math.min(kb*.3,3));kb=.4}B.load={pg,kb,t0:now(),dur:Math.min(2200,420+kb*120),push:o.push!==false};B.opts=null;K.dirty()}
 function show(pg,push){if(push&&B.cur)B.stack.push({pg:B.cur,sel:B.sel,scroll:B.scroll,ed:B.ed});B.cur=pg;const n=items().length,long=String(pg.text||'').length>110||pg.kind==='comic'&&false;B.sel=n&&!long?0:-1;B.scroll=0;B.ed=pg.input?K.Editor({max:pg.input.max||80,now}):null;K.setEditor(B.ed);
  B.hist=[{t:pg.title,id:pg.id,arg:pg.arg},...B.hist.filter(h=>!(h.id===pg.id&&h.arg===pg.arg))].slice(0,20);pg.onShow?.();K.dirty()}
 function back(){if(B.load){B.load=null;if(!B.cur)exit(false);K.dirty();return}if(!B.stack.length){exit(false);return}const p=B.stack.pop();B.cur=p.pg;B.sel=p.sel;B.scroll=p.scroll;B.ed=p.ed;K.setEditor(B.ed);K.dirty()}
 function refresh(){const n=items().length;if(B.sel>=n)B.sel=n-1;K.dirty()}
 /* 번호: 검색 칸과 광고 줄만 번호가 없고, 나머지는 위에서부터 1~9 */
 function numOf(L,i){const x=L[i];if(!x||x.search||x.hot)return'';let k=0;for(let j=0;j<=i;j++)if(!L[j].search&&!L[j].hot)k++;return k<=9?String(k):''}
 function items(){const pg=B.cur;if(!pg||!pg.items)return[];try{return pg.items()}catch(_){return[]}}
 function summary(){return'NATE 접속 끊음\n데이터 '+B.kb.toFixed(1)+'KB ('+B.pkts+'패킷)\n데이터 통화료 '+won(B.won)+(B.info?'\n정보이용료 '+won(B.info):'')}
 function exit(toHome){const had=B.cur||B.load||B.splash;const msg=had&&(B.kb||B.info)?summary():null;B.cur=null;B.stack=[];B.load=null;B.splash=null;B.dl=null;B.opts=null;B.ed=null;K.stopTune();K.setEditor(null);K.leave(msg,toHome)}
 function open(code){if(host.signal&&host.signal!=='normal'){K.leave('통신 신호가 없습니다',true);return}Object.assign(B,{cur:null,stack:[],sel:0,scroll:0,load:null,dl:null,opts:null,ed:null,kb:0,pkts:0,won:0,info:0,t0:now(),hist:[],code:null,warned:false});
  const gm=/^game:([a-z0-9]+)$/.exec(String(code||'')),gi=gm&&CATALOG.find(g=>g.id===gm[1]);
  if(code&&!CODES[code]&&!gi){K.pop(code+'번은 없는 바로가기예요',1600)}B.code=gi?['gameItem',gi]:CODES[code]?[CODES[code][0]]:null;B.splash={t0:now()};K.setEditor(null);K.dirty()}
 function typing(){return B.ed&&B.cur?.input?B.cur.input.ph:null}

 /* ---------- 그리기 ---------- */
 function header(g){const pg=B.cur;g.fillStyle=grad(g,TOP,TOP+16,'#ff9a3a','#e8620a');g.fillRect(0,TOP,W,16);T(g,'NATE',4,TOP+12,{size:11,bold:true,color:'#fff'});
  T(g,pg?pg.title:'',W-4,TOP+12,{size:9.5,bold:true,color:'#fff',align:'right',max:W-46});R(g,0,TOP+16,W,11,'#fff1e0');R(g,0,TOP+26.5,W,.5,'#f0c090');
  T(g,pg?pg.crumb||'':'',3,TOP+24.5,{size:7.5,color:'#8a5a2a',max:W-58});T(g,B.kb.toFixed(1)+'KB '+won(B.won),W-3,TOP+24.5,{size:7.5,bold:true,color:'#c0501a',align:'right'})}
 function rowsOf(g,pg,t){const R0=[];let y=0;const text=pg.live?pg.live():pg.text;if(pg.banner){R0.push({k:'banner',y,h:12});y+=13}
  if(text)for(const l of wrap(g,text,W-8,9.5,false)){R0.push({k:'t',text:l,y,h:12});y+=12}
  if(text)y+=3;const L=items();L.forEach((x,i)=>{R0.push({k:'i',i,x,y,h:15});y+=15});return{rows:R0,total:y}}
 function draw(g,t){K.status(g);R(g,0,TOP,W,H-TOP,'#ffffff');
  if(B.splash){const p=clamp((t-B.splash.t0)/1300,0,1);g.fillStyle=grad(g,TOP,H,'#fff6ea','#ffd9b0');g.fillRect(0,TOP,W,H-TOP);circ(g,W/2,64,20,'#ff7a12');T(g,'N',W/2,72,{size:22,bold:true,color:'#fff',align:'center'});
   T(g,'NATE',W/2,104,{size:15,bold:true,color:'#e8620a',align:'center'});T(g,'무선 인터넷에 접속합니다',W/2,120,{size:9,color:'#7a4a12',align:'center'});T(g,'데이터 통화료 0.5KB당 6.5원',W/2,132,{size:8,color:'#a06a3a',align:'center'});
   R(g,24,142,W-48,5,'#f0d0b0');R(g,24,142,(W-48)*p,5,'#ff7a12');K.soft(g,'','','취소');return}
  header(g);const pg=B.cur;
  if(pg){g.save();g.beginPath();g.rect(0,Y0,W,Y1-Y0);g.clip();let top=Y0;const edH=B.ed?34:0,avail=Y1-Y0-edH-(B.load||B.dl?12:0);
   if(pg.draw){const used=pg.draw.call(pg,g,t,top)||0;top+=used}
   const {rows,total}=rowsOf(g,pg,t);const viewH=avail-(top-Y0);const sel=rows.find(r=>r.k==='i'&&r.i===B.sel);
   let off=0;if(sel){off=Math.max(0,sel.y+sel.h-viewH);if(B.sel>=0&&B.scroll>off&&B.scroll<=sel.y)off=B.scroll}else off=clamp(B.scroll*12,0,Math.max(0,total-viewH));B.maxScroll=Math.max(0,Math.ceil((total-viewH)/12));B.viewLines=Math.max(1,Math.floor(viewH/12));
   g.save();g.beginPath();g.rect(0,top,W,Math.max(0,viewH));g.clip();
   for(const r of rows){const y=top+r.y-off;if(y+r.h<top||y>top+viewH)continue;
    if(r.k==='banner'){const ad=ADS[Math.floor(t/2600)%ADS.length];R(g,2,y,W-4,12,'#fff4d8');T(g,ad,W/2,y+9,{size:8,bold:true,color:'#c0501a',align:'center',max:W-8})}
    else if(r.k==='t')T(g,r.text,4,y+9.5,{size:9.5,color:'#1d2633'});
    else{const x=r.x,on=r.i===B.sel,num=numOf(items(),r.i);if(on){R(g,0,y,W,r.h,'#ffe2c4');R(g,0,y,2.5,r.h,'#ff7a12')}else if(r.i%2)R(g,0,y,W,r.h,'#fafafa');R(g,0,y+r.h-.5,W,.5,'#f0e0d0');
     let lx=4;if(x.search){g.strokeStyle='#ff9a3a';g.lineWidth=1;g.strokeRect(3,y+2,W-36,r.h-4);R(g,W-31,y+2,28,r.h-4,'#ff7a12');T(g,'검색',W-17,y+10.5,{size:8.5,bold:true,color:'#fff',align:'center'});T(g,x.label,7,y+10.5,{size:8.5,color:'#9a9a9a'});continue}
     if(num){R(g,lx-1,y+3,9,9,on?'#e8620a':'#ff9a3a');T(g,num,lx+3.5,y+10.5,{size:7.5,bold:true,color:'#fff',align:'center'});lx+=12}
     g.font=fnt(8);const sw=x.sub?Math.min(48,g.measureText(x.sub).width+6):3;T(g,fit(g,x.label,W-lx-sw,9.5,on||x.hot),lx,y+10.5,{size:9.5,bold:on||x.hot,color:x.hot?'#d0401a':'#16202e'});if(x.sub)T(g,x.sub,W-3,y+10.5,{size:8,color:'#8a6a4a',align:'right'})}}
   g.restore();
   if(total>viewH){const th=Math.max(8,viewH*viewH/total),ty=top+(viewH-th)*off/Math.max(1,total-viewH);R(g,W-2,top,2,viewH,'#f0e0d0');R(g,W-2,ty,2,th,'#ff9a3a')}
   g.restore();if(B.ed)K.drawEditor(g,B.ed,Y1-edH,Y1,t,pg.title)}
  if(B.load||B.dl){const L=B.load||B.dl,p=clamp((t-L.t0)/L.dur,0,1),y=Y1-12;R(g,0,y,W,12,'#3a2a1a');R(g,0,y,W*p,12,'#e8620a');
   T(g,(B.dl?'받는 중 ':'접속 중 ')+(L.kb*p).toFixed(1)+'/'+L.kb.toFixed(1)+'KB',W/2,y+9,{size:8,bold:true,color:'#fff',align:'center'})}
  if(B.opts){const o=B.opts,hh=o.items.length*14+16,y=(H-hh)/2;g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W,H);g.fillStyle='#fff';rr(g,14,y,W-28,hh,4);g.fill();g.strokeStyle='#e8620a';g.lineWidth=1.4;g.stroke();
   T(g,'NATE 메뉴',W/2,y+11,{size:9,bold:true,color:'#e8620a',align:'center'});o.items.forEach((x,i)=>{const yy=y+15+i*14;if(i===o.sel)R(g,16,yy,W-32,13,'#ffe2c4');T(g,(i+1)+'. '+x[0],20,yy+10,{size:9,color:'#1d2633'})})}
  const soft=B.ed?[B.ed.modeName(),'보내기','이전']:['메뉴','선택','이전'];K.soft(g,...soft)}

 /* ---------- 누르기 ---------- */
 function act(x){if(!x)return;if(x.act){x.act();return}if(x.go)nav(x.go[0],x.go[1])}
 function key(id){if(B.splash){if(id==='clr')exit(false);return true}
  if(B.load||B.dl){if(id==='clr'){if(B.dl){B.dl=null;K.pop('받기를 그만뒀어요',1000)}else back()}return true}
  if(!B.cur)return true;
  if(B.opts){const o=B.opts,n=o.items.length;if(id==='up')o.sel=(o.sel-1+n)%n;else if(id==='down')o.sel=(o.sel+1)%n;else if(id==='ok'||id==='nate'){const f=o.items[o.sel][1];B.opts=null;f()}else if(/^[1-9]$/.test(id)&&+id<=n){const f=o.items[+id-1][1];B.opts=null;f()}else if(id==='clr'||id==='menu')B.opts=null;K.dirty();return true}
  const pg=B.cur;if(pg.key&&pg.key(id))return true;const L=items(),n=L.length;
  if(B.ed){const ed=B.ed;if(id==='ok'||id==='send'){pg.input.submit(ed.text());K.dirty();return true}if(id==='menu'){ed.nextMode();K.dirty();return true}if(id==='clr'&&!ed.tokens.length){back();return true}
   if(id==='up'||id==='down'){if(n){B.sel=clamp(B.sel+(id==='up'?-1:1),0,n-1)}return true}if(id==='nate'&&n){act(L[B.sel]);return true}if(ed.key(id))K.edChanged();K.dirty();return true}
  if(id==='up'){if(B.sel>0)B.sel--;else if(B.sel===0){if(pg.text||pg.live||pg.draw)B.sel=-1}else B.scroll=Math.max(0,B.scroll-1);K.dirty();return true}
  if(id==='down'){if(B.sel<0){if(B.scroll<(B.maxScroll||0))B.scroll++;else if(n)B.sel=0}else if(B.sel<n-1)B.sel++;K.dirty();return true}
  if(id==='left'){B.scroll=Math.max(0,B.scroll-(B.viewLines||8));if(B.scroll>0||!n)B.sel=-1;K.dirty();return true}
  if(id==='right'){B.scroll=Math.min(B.maxScroll||0,B.scroll+(B.viewLines||8));B.sel=-1;if(B.scroll>=(B.maxScroll||0)&&n)B.sel=0;K.dirty();return true}
  if(id==='ok'||id==='nate'){if(B.sel>=0)act(L[B.sel]);else if(n){B.sel=0;K.dirty()}return true}
  if(/^[1-9]$/.test(id)){const i=L.findIndex((q,j)=>numOf(L,j)===id);if(i>=0){B.sel=i;act(L[i])}return true}
  if(id==='0'){B.stack=[];nav('home',null,{push:false});return true}
  if(id==='*'||id==='clr'){back();return true}
  if(id==='#'){B.sel=n?0:-1;B.scroll=0;K.dirty();return true}
  if(id==='menu'){B.opts={sel:0,items:[['NATE 홈',()=>{B.stack=[];nav('home',null,{push:false})}],['즐겨찾기에 추가',()=>{const pg2=B.cur;if(pg2.arg!=null&&typeof pg2.arg!=='string'){K.pop('이 쪽은 즐겨찾기에\n넣을 수 없어요');return}if(D.bm.some(b=>b.id===pg2.id)){K.pop('이미 즐겨찾기에 있어요');return}D.bm.unshift({id:pg2.id,t:pg2.title});D.bm=D.bm.slice(0,10);K.save();K.pop('즐겨찾기에 넣었어요',1100)}],['이번 접속 요금',()=>nav('session')],['접속 끊기',()=>exit(false)]]};K.dirty();return true}
  return true}
 function needs(t){let n=false;
  if(B.splash&&t-B.splash.t0>=1300){B.splash=null;show(make('home'),false);dataCharge(3.4);if(B.code)nav(B.code[0],B.code[1]);n=true}
  if(B.giftWait){const g=B.giftWait,a=K.giftAck;if(a&&a.ok){B.giftWait=null;pay(g.name+' 선물',g.price);K.pop('‘'+g.name+'’\n'+g.to+'에게 선물했어요 ♡',1800);n=true}else if(a&&!a.ok||t-g.t0>6000){B.giftWait=null;K.pop((a&&a.msg)||'선물을 보내지 못했어요',1800);n=true}}
  if(B.load){if(t-B.load.t0>=B.load.dur){const L=B.load;B.load=null;dataCharge(L.kb);show(L.pg,L.push)}n=true}
  if(B.dl){if(t-B.dl.t0>=B.dl.dur)finishDl();n=true}
  if(B.splash)n=true;const tk=Math.floor(t/400);if(tk!==B.tick){B.tick=tk;if(B.cur&&(B.cur.banner||B.cur.live||B.cur.kind==='comic'))n=true}
  return n}
 function ownsSound(){return false}
 return{open,draw,key,needs,typing,exit,ownsSound,nav,back,get state(){return B},pages:P,CODES,CATALOG,index}}
w.AnycallNate={version:'A124',create,CODES,CATALOG,OX,matchScore,strokes};
})(window);
