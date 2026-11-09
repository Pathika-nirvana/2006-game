/* A95: 주니어네이버와 야후꾸러기 보강. kids-portal.js 다음에 읽힌다.
   주니어네이버: ‘그림일기’ 코너(크레파스로 그리고 쓰면 선생님이 도장을 찍어 준다), 놀이터에 ‘구구단 풍선’.
   야후꾸러기: ‘받아쓰기’ 코너(맞춤법 열 문제, 백 점이면 참 잘했어요 도장), 오락실에 ‘꾸러기 줄넘기’.
   두 사이트에 뉴스, 질문, 숙제 도우미(놀이 과학), 이야기, 퀴즈, 게시판 글을 더 싣는다.
   사람과 학교는 모두 지어낸 것이다. 글쓴 날짜와 시각은 2006년 5월 30일 오후 4시 32분 이전이다. */
(function(w){'use strict';
const KP=w.KidsPortal,KG=w.KidsGames,KD=w.KidsData;if(!KP||!KP.extend||!KD)return;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const PRIVATE=/\d{2,4}[-. ]?\d{3,4}[-. ]?\d{4}|@[a-z0-9]|https?:|www\./i;

/* ---------- 1. 새 글 ---------- */
const ADD={
 jr:{
  news:[
   {id:'jr-n7',title:'수학여행 버스 멀미, 이렇게 막아요',by:'주니어 뉴스팀',at:'05.30 11:20',hits:860,body:'6월 초에 수학여행을 떠나는 학교가 많아요. 버스를 오래 타면 속이 울렁거리는 멀미 때문에 걱정하는 친구들도 있지요.\n\n멀미를 줄이려면 버스 앞쪽 자리에 앉고, 창밖 먼 곳을 바라보는 것이 좋아요. 책을 읽거나 작은 화면을 오래 들여다보면 멀미가 더 심해질 수 있어요. 출발 전에는 배가 너무 고프지도, 너무 부르지도 않게 가볍게 먹어요.\n\n멀미약은 꼭 부모님과 상의해서 정해진 만큼만 먹어야 해요. 속이 안 좋으면 참지 말고 선생님께 바로 말씀드려요.',replies:['나 앞자리 맡아야지!','버스에서 노래 부르면 멀미 안 남 ㅋㅋ','ㄴ 그건 선생님이 싫어하실걸 ㅋㅋ']},
   {id:'jr-n8',title:'쉬는 시간, 공기놀이가 다시 인기!',by:'주니어 뉴스팀',at:'05.29 13:40',hits:640,body:'요즘 쉬는 시간마다 교실 바닥에 동그랗게 모여 앉은 친구들을 볼 수 있어요. 바로 공기놀이 때문이에요.\n\n공깃돌 다섯 개만 있으면 어디서든 할 수 있고, 한 알 집기부터 꺾기까지 단계가 있어서 점점 어려워지는 재미가 있지요. 한 학교에서는 반 대항 공기 대회를 열기로 했대요.\n\n공기놀이를 할 때는 친구 차례를 기다려 주고, 실수한 친구를 놀리지 않기로 해요. 공깃돌은 입에 넣지 않아요!',replies:['꺾기 100개 해 봤어!','공기 대회 우리 반도 하고 싶다','ㄴ 선생님께 말씀드려 봐']}],
  kin:[
   {id:'jr-k8',title:'모기는 왜 사람 피를 빨아요?',nick:'여름싫어',at:'05.29 20:15',body:'밤마다 모기 때문에 잠을 못 자요 ㅠㅠ 모기는 왜 사람 피를 빨아 먹나요? 피가 맛있나요?',answers:[{n:'과학쌤',text:'사람 피를 빠는 모기는 알을 낳으려는 암컷 모기예요. 피 속에 알을 만드는 데 필요한 영양분이 들어 있거든요. 수컷 모기는 피 대신 꽃의 꿀이나 식물의 즙을 먹어요. 모기는 우리가 내쉬는 숨과 몸의 열을 느끼고 날아와요. 잘 때 방충망을 꼭 닫아 두세요.',pick:true},{n:'지나가던형',text:'피가 맛있어서 그런 건 아니래 ㅋㅋ 나도 오늘 세 방 물림 ㅠㅠ'}]},
   {id:'jr-k9',title:'종이비행기를 멀리 날리는 방법 알려 주세요',nick:'비행기왕',at:'05.30 12:05',body:'내일 반에서 종이비행기 멀리 날리기 대회를 해요. 어떻게 접어야 멀리 가요?',answers:[{n:'공작박사',text:'날개 양쪽이 똑같은 모양이 되도록 접는 게 제일 중요해요. 앞부분을 몇 번 더 접어서 조금 무겁게 하면 바람에 덜 흔들려요. 던질 때는 위로 세게 던지지 말고 앞으로 부드럽게 밀듯이 날려 보세요. 날개 끝을 살짝 위로 올리면 더 오래 떠 있어요.',pick:true},{n:'날리기선수',text:'운동장에서 바람 등지고 던지면 진짜 멀리 가요!'}]}],
  help:[
   {id:'jr-h7',title:'숙제 도우미 · 일기 쓰기, 이렇게 하면 쉬워요',body:'일기에는 오늘 있었던 일을 전부 쓰지 않아도 돼요. 가장 기억에 남는 일 하나를 골라서 언제, 어디서, 누구와, 무엇을 했는지 써 보세요.\n\n그다음에 그때 내 기분이 어땠는지, 왜 그런 기분이 들었는지를 적으면 멋진 일기가 돼요. ‘재미있었다’ 대신 ‘웃다가 배가 아팠다’처럼 자세히 쓰면 더 좋아요. 그림일기라면 가장 기억에 남는 장면을 크게 그려요.'}],
  story:[
   {id:'jr-s7',title:'도토리 한 알의 여행',body:'산꼭대기 커다란 참나무에 작은 도토리 한 알이 매달려 있었어요. 도토리는 날마다 산 아래 마을을 내려다보며 생각했어요. ‘저 아래에는 무엇이 있을까?’\n\n바람이 세게 불던 어느 날, 도토리는 톡 하고 가지에서 떨어졌어요. 데굴데굴 굴러 내려가던 도토리를 다람쥐가 날쌔게 주웠어요. “겨울에 먹으려고 숨겨 둬야지!” 다람쥐는 도토리를 볼에 넣고 숲속을 달렸어요.\n\n그런데 다람쥐는 도토리를 땅에 묻어 두고는 그만 어디에 묻었는지 잊어버렸어요. 깜깜한 땅속에서 도토리는 조금 무서웠어요. 하지만 비가 내리고 햇볕이 땅을 데워 주자 몸속에서 무언가 꿈틀꿈틀 자라기 시작했어요.\n\n겨울 동안 땅속은 아주 조용했어요. 위에서는 눈이 소복소복 쌓였고, 옆으로는 개미들이 줄지어 지나갔어요. 개미 한 마리가 도토리에게 물었어요. “너는 여기서 뭐 하니?” 도토리가 대답했어요. “나도 잘 모르겠어. 그냥 기다리는 중이야.” 개미는 고개를 갸웃하더니 “기다리는 것도 일이지” 하고 지나갔어요.\n\n봄이 되자 도토리는 작은 새싹이 되어 땅 위로 고개를 내밀었어요. 그곳은 산 아래 마을이 훤히 보이는 언덕이었어요. 아이들이 언덕을 지나며 말했어요. “어, 여기 아기 나무가 생겼다!”\n\n여러 해가 지나 새싹은 커다란 참나무가 되었어요. 여름이면 아이들이 그늘에서 쉬어 가고, 가을이면 다람쥐들이 도토리를 주우러 왔어요. 참나무는 가지를 흔들며 속삭였어요. “꼬마 다람쥐야, 이번에도 하나쯤은 잊어버려도 괜찮아.”',replies:['다람쥐가 잊어버려서 나무가 된 거구나!','마지막 말 너무 좋아요','ㄴ 나도 도토리 심어 볼래']}],
  quiz:[
   {id:'jr-q9',q:'다음 중 곤충이 아닌 것은?',c:['나비','거미','개미'],a:1,why:'거미는 다리가 여덟 개이고 몸이 두 부분이라 곤충이 아니에요.'},
   {id:'jr-q10',q:'1년은 보통 며칠일까요?',c:['365일','300일','400일'],a:0,why:'1년은 보통 365일이고, 4년에 한 번은 366일이에요.'},
   {id:'jr-q11',q:'우리나라 국기의 이름은?',c:['무궁화','태극기','한글'],a:1,why:'우리나라 국기는 태극기예요. 가운데 태극 무늬와 네 모서리의 괘가 있어요.'},
   {id:'jr-q12',q:'물이 꽁꽁 얼면 무엇이 될까요?',c:['수증기','얼음','구름'],a:1,why:'물은 0도보다 차가워지면 얼음이 돼요.'}],
  board:[
   {id:'jr-b9',title:'수학여행 장기자랑 뭐 하지?',nick:'노래왕',at:'05.30 15:20',body:'다음 주 수학여행 장기자랑에 나가기로 했는데 뭘 할지 모르겠어요 ㅠㅠ 다들 뭐 해요?',replies:['우리 모둠은 춤 춰요 ㅋㅋ','카드 마술 어때? 멋있잖아','ㄴ 마술 좋다!','개그 하면 선생님이 제일 크게 웃어 주심 ㅋㅋ']},
   {id:'jr-b10',title:'그림일기 도장 받았어요!!',nick:'참잘했어요',at:'05.30 16:05',body:'주니어 그림일기에 올렸더니 선생님이 참 잘했어요 도장을 찍어 주셨어요 ㅋㅋ 다들 한번 해 보세요~',replies:['나도 받았다!','도장 모으는 재미 ㅋㅋ','오늘 그림 뭐 그렸어?','ㄴ 우리 집 강아지 ^^']}]},
 yk:{
  news:[
   {id:'yk-n7',title:'꾸러기 기자단이 간다: 문구점 인기 장난감 순위',by:'꾸러기 기자단',at:'05.30 10:40',hits:1120,body:'꾸러기 기자단이 동네 문구점 다섯 곳을 찾아가 요즘 가장 잘 팔리는 장난감을 알아봤어요.\n\n1위는 손바닥만 한 탱탱볼이었어요. 바닥에 던지면 천장까지 튀어 올라 쉬는 시간마다 인기래요. 2위는 줄을 감아 돌리는 팽이, 3위는 반짝이 스티커가 차지했어요. 딱지와 구슬도 여전히 꾸준히 팔린대요.\n\n문구점 아저씨는 “용돈을 한꺼번에 다 쓰지 말고, 사기 전에 꼭 필요한지 한 번 더 생각해 보라”고 말씀하셨어요.',replies:['탱탱볼 교실에서 던지다 혼남 ㅋㅋ','팽이 대결 하자!','ㄴ 내 팽이가 이김']},
   {id:'yk-n8',title:'장마 오기 전에 우산 챙기는 습관 들여요',by:'꾸러기 기자단',at:'05.29 17:30',hits:540,body:'6월 하순이 되면 비가 자주 오는 장마철이 시작돼요. 아침에는 맑다가도 오후에 갑자기 소나기가 쏟아지는 날도 많아요.\n\n일기 예보를 확인하는 습관을 들이고, 가방에 접는 우산을 하나 넣어 두면 좋아요. 비 오는 날에는 바닥이 미끄러우니 뛰지 말고, 우산 때문에 앞이 안 보이지 않게 조심해요. 천둥 번개가 칠 때는 큰 나무 아래에 서 있지 않아요.',replies:['우산 맨날 잃어버림 ㅠㅠ','이름표 붙여 놔!','ㄴ 좋은 생각']}],
  qna:[
   {id:'yk-k8',title:'하품은 왜 따라 하게 되나요?',nick:'하품대장',at:'05.30 09:50',body:'짝꿍이 하품하면 저도 모르게 하품이 나와요. 하품이 옮는 병인가요?',answers:[{n:'척척박사',text:'하품이 옮는 건 병이 아니에요. 과학자들도 정확한 까닭을 아직 연구하고 있지만, 다른 사람의 행동을 보고 따라 하게 되는 마음과 관련이 있다고 생각해요. 그래서 친한 사람의 하품일수록 더 잘 따라 한다는 이야기도 있어요. 하품이 자꾸 나온다면 피곤하다는 신호일 수 있으니 일찍 자요.',pick:true},{n:'꾸러기1호',text:'이 글 읽다가 하품했어요 ㅋㅋㅋ'}]},
   {id:'yk-k9',title:'달은 왜 모양이 바뀌어요?',nick:'달토끼',at:'05.29 21:40',body:'어제는 손톱 같은 달이었는데 며칠 지나면 동그래져요. 달이 진짜로 작아졌다 커졌다 하나요?',answers:[{n:'척척박사',text:'달의 크기는 변하지 않아요. 달은 스스로 빛을 내지 못하고 햇빛을 받아서 빛나는데, 달이 지구 둘레를 도는 동안 햇빛을 받는 부분이 우리 눈에 보이는 만큼이 날마다 달라져요. 그래서 초승달, 반달, 보름달처럼 모양이 바뀌어 보이는 거예요. 한 바퀴 도는 데 약 한 달이 걸려요.',pick:true},{n:'별사탕',text:'그래서 한 달이라는 말이 생겼대요!'}]}],
  play:[
   {id:'yk-p7',title:'놀이 과학 · 빨대로 피리 만들기',body:'준비물: 굵은 빨대, 가위. 빨대 한쪽 끝을 납작하게 누른 다음 가위로 끝을 뾰족한 세모 모양으로 잘라요. 뾰족한 쪽을 입술로 가볍게 물고 세게 불면 삐익 하는 소리가 나요.\n\n빨대를 짧게 자를수록 높은 소리가 나고, 길수록 낮은 소리가 나요. 공기가 떨리는 길이가 달라지기 때문이에요. 가위를 쓸 때는 어른과 함께 조심해서 해요.'}],
  story:[
   {id:'yk-s7',title:'비 오는 날의 노란 우산',body:'학교가 끝났는데 갑자기 비가 쏟아졌어요. 민지는 우산이 없어서 현관 앞에 우두커니 서 있었어요. 친구들은 하나둘 엄마 손을 잡고, 또는 우산을 펼치고 집으로 돌아갔어요.\n\n그때 신발장 구석에 노란 우산 하나가 보였어요. 이름표도 없는 낡은 우산이었지요. 민지는 망설이다가 우산을 펼쳤어요. 그런데 이상하게도 우산 안쪽에 작은 글씨가 적혀 있었어요. ‘필요한 사람이 쓰고, 다음 사람을 위해 돌려주세요.’\n\n민지는 노란 우산을 쓰고 빗속을 걸었어요. 웅덩이에 비친 노란색이 참 예뻤어요. 집 앞에 도착했을 때, 옆집 할머니가 처마 밑에서 비를 피하고 계셨어요. 민지는 할머니를 댁까지 모셔다드렸어요. 할머니는 “고맙다, 꼬마 아가씨” 하며 사탕 하나를 쥐여 주셨어요.\n\n집에 돌아온 민지는 젖은 우산을 현관에 펼쳐 말리며 생각했어요. ‘이 우산은 누가 처음 두고 갔을까?’ 엄마는 웃으며 말씀하셨어요. “아마 언젠가 비 오는 날, 누군가에게 우산을 빌려 썼던 사람이겠지.”\n\n다음 날 아침, 민지는 노란 우산을 잘 말려서 신발장 구석에 다시 세워 두었어요. 그리고 우산 안쪽 글씨 아래에 연필로 한 줄을 더 적었어요. ‘덕분에 할머니도 비를 안 맞으셨어요. 고마워요.’\n\n그 뒤로 비 오는 날이면 노란 우산은 늘 누군가와 함께였어요. 우산 안쪽의 글씨는 점점 늘어났고, 아무도 그 우산이 누구 것인지 묻지 않았답니다.',replies:['우리 학교에도 이런 우산 있었으면','글씨가 늘어나는 게 좋아요','ㄴ 나도 한 줄 쓰고 싶다']}],
  quiz:[
   {id:'yk-q9',q:'거꾸로 읽어도 똑같은 낱말은?',c:['기러기','고양이','바나나'],a:0,why:'기러기는 앞에서 읽어도 뒤에서 읽어도 기러기예요.'},
   {id:'yk-q10',q:'태양계에서 가장 큰 행성은?',c:['지구','목성','화성'],a:1,why:'목성이 가장 커요. 지구가 천 개도 넘게 들어갈 만큼 크대요.'},
   {id:'yk-q11',q:'한 시간은 몇 분일까요?',c:['60분','100분','30분'],a:0,why:'한 시간은 60분, 1분은 60초예요.'},
   {id:'yk-q12',q:'무지개의 가장 바깥쪽 색은?',c:['보라','빨강','초록'],a:1,why:'무지개는 바깥쪽부터 빨주노초파남보 순서예요.'}],
  board:[
   {id:'yk-b10',title:'받아쓰기 100점 맞았다!!!',nick:'맞춤법왕',at:'05.30 15:55',body:'꾸러기 받아쓰기에서 100점 받았어요 ㅋㅋ 금세랑 금새가 제일 헷갈렸는데 맞혔어요!',replies:['오 축하해!!','나는 80점 ㅠㅠ','ㄴ 나도 금새 틀림','다음엔 나도 100점!']},
   {id:'yk-b11',title:'줄넘기 몇 개까지 해 봤어?',nick:'줄넘기달인',at:'05.30 13:30',body:'체육 시간에 줄넘기 쉬지 않고 152개 했어요! 꾸러기 오락실 줄넘기도 해 봤는데 그건 더 어려움 ㅋㅋ',replies:['152개 대박','나는 50개...','ㄴ 연습하면 늘어!','이단 뛰기도 돼?']}]}
};
for(const site of Object.keys(ADD))for(const [kind,list] of Object.entries(ADD[site])){const arr=KD[site]&&KD[site][kind];if(!Array.isArray(arr))continue;for(const x of list)if(!arr.some(y=>y.id===x.id))arr.push(x)}

/* ---------- 2. 주니어 그림일기 ---------- */
const CRAYON=['#222222','#e8302a','#ff8a1a','#ffd23f','#3aa83a','#2a6ad8','#8a4ad8','#8a5a2a'];
const WEATHER=[['sun','해님 쨍쨍'],['cloud','구름 조금'],['rain','비가 주룩'],['wind','바람 솔솔']];
const STAMP_LINES=['그림이 정말 멋져요!','오늘 하루가 눈에 그려지는 것 같아요.','기분을 솔직하게 잘 썼어요.','내일은 어떤 일이 있을지 궁금하네요.','글씨도 또박또박 잘 썼어요.'];
const FRIEND_DIARY=[
 {nick:'콩콩이',title:'강아지랑 산책',wea:'sun',text:'학교 끝나고 우리 집 강아지 뭉치랑 산책을 했다. 뭉치가 비둘기를 보고 막 뛰어서 나도 같이 뛰었다. 숨이 찼지만 재미있었다.',stamp:'참 잘했어요',pic:'dog'},
 {nick:'하늘이',title:'비 오는 날',wea:'rain',text:'비가 와서 노란 우산을 썼다. 웅덩이에 장화로 첨벙첨벙 했다. 엄마한테 조금 혼났다.',stamp:'잘했어요',pic:'rain'},
 {nick:'꼬마박사',title:'과학의 날 물로켓',wea:'cloud',text:'물로켓이 학교 건물보다 높이 날아갔다. 다음에는 더 높이 날려 보고 싶다. 과학자가 되고 싶다.',stamp:'참 잘했어요',pic:'rocket'}];
function crayonPic(g,kind,W,H){g.fillStyle='#fff';g.fillRect(0,0,W,H);const line=(pts,c,lw)=>{g.strokeStyle=c;g.lineWidth=lw||3;g.lineCap='round';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke()};
 const circle=(x,y,r,c,fill)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=c;g.fill()}else{g.strokeStyle=c;g.lineWidth=3;g.stroke()}};
 line([[0,H*.78],[W,H*.78]],'#3aa83a',4);
 if(kind==='dog'){circle(W*.82,H*.18,14,'#ffd23f',true);circle(W*.35,H*.55,14,'#ffdcb8');line([[W*.35,H*.62],[W*.35,H*.76]],'#2a6ad8',4);circle(W*.6,H*.66,12,'#8a5a2a');circle(W*.68,H*.6,8,'#8a5a2a');line([[W*.4,H*.65],[W*.55,H*.64]],'#e8302a',2)}
 else if(kind==='rain'){for(let i=0;i<14;i++)line([[(i*37)%W,(i*23)%(H*.6)],[(i*37)%W-4,(i*23)%(H*.6)+10]],'#2a6ad8',2);g.fillStyle='#ffd23f';g.beginPath();g.arc(W*.5,H*.48,26,Math.PI,0);g.fill();line([[W*.5,H*.48],[W*.5,H*.74]],'#222',3);circle(W*.5,H*.58,9,'#ffdcb8')}
 else{line([[W*.5,H*.75],[W*.5,H*.2]],'#e8302a',6);g.fillStyle='#e8302a';g.beginPath();g.moveTo(W*.5,H*.1);g.lineTo(W*.45,H*.22);g.lineTo(W*.55,H*.22);g.fill();for(let i=0;i<5;i++)circle(W*.5+rnd(-10,10),H*.82+rnd(-4,4),3,'#2a6ad8',true);circle(W*.15,H*.2,10,'#ffd23f',true)}}
function stampOf(text){const n=String(text||'').replace(/\s/g,'').length;return n>=40?'참 잘했어요':n>=15?'잘했어요':'조금 더 길게 써 봐요'}
function diaryPage(env,c){const {E,B,k,ctx}=env;if(!Array.isArray(k.diary))k.diary=[];k.diary=k.diary.filter(x=>x&&typeof x.title==='string').slice(-6);
 const box=E('section','k-box kd-write');box.append(E('h3','','오늘의 그림일기 쓰기'));
 const meta=E('p','kd-date','2006년 5월 30일 화요일 · 날씨: ');let wea='sun';const weaBtns=[];for(const [id,label] of WEATHER){const b=B(label,()=>{wea=id;for(const x of weaBtns)x.classList.toggle('on',x===b)},'kd-wea'+(id===wea?' on':''));weaBtns.push(b);meta.append(b)}box.append(meta);
 const pad=E('canvas','kd-pad');pad.width=300;pad.height=190;pad.setAttribute('aria-label','그림일기 그림판');box.append(pad);const g=pad.getContext?pad.getContext('2d'):null;if(g){g.fillStyle='#fff';g.fillRect(0,0,300,190)}
 let col=CRAYON[0],size=5,down=false,last=null,drawn=0;const tools=E('div','kd-tools');const cBtns=[];for(const cc of CRAYON){const b=B('',()=>{col=cc;for(const x of cBtns)x.classList.toggle('on',x===b)},'kd-crayon'+(cc===col?' on':''));b.style.background=cc;b.setAttribute('aria-label','크레파스 색');cBtns.push(b);tools.append(b)}
 tools.append(B('가늘게',()=>{size=3}, 'kd-tool'),B('굵게',()=>{size=9},'kd-tool'),B('지우개',()=>{col='#ffffff'},'kd-tool'),B('다 지우기',()=>{if(g){g.fillStyle='#fff';g.fillRect(0,0,300,190)}drawn=0},'kd-tool'));box.append(tools);
 const at=e=>{const r=pad.getBoundingClientRect?pad.getBoundingClientRect():{left:0,top:0,width:300,height:190};return[(e.clientX-r.left)*300/(r.width||300),(e.clientY-r.top)*190/(r.height||190)]};
 const stroke=(a,b)=>{if(!g)return;g.strokeStyle=col;g.lineWidth=size;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();drawn++};
 pad.addEventListener('pointerdown',e=>{down=true;last=at(e);stroke(last,[last[0]+.1,last[1]+.1]);pad.setPointerCapture&&pad.setPointerCapture(e.pointerId)});pad.addEventListener('pointermove',e=>{if(!down)return;const p=at(e);stroke(last,p);last=p});pad.addEventListener('pointerup',()=>{down=false});pad.addEventListener('pointerleave',()=>{down=false});
 const title=E('input','kd-title');title.maxLength=20;title.placeholder='제목 (20자)';title.setAttribute('aria-label','일기 제목');const text=E('textarea','kd-text');text.maxLength=200;text.placeholder='오늘 있었던 일과 내 기분을 써 보세요 (200자)';text.setAttribute('aria-label','일기 내용');const warn=E('p','k-warn','');
 const sub=B('일기 올리기',()=>{const t=String(title.value||'').trim().slice(0,20),x=String(text.value||'').trim().slice(0,200);if(!t||!x){warn.textContent='제목과 내용을 모두 써 주세요.';return}if(PRIVATE.test(t+x)){warn.textContent='전화번호나 이메일, 인터넷 주소 같은 개인정보는 쓸 수 없어요.';return}if(!drawn){warn.textContent='그림도 그려 주세요! (네모 칸에 그림을 그려요)';return}
  let img='';try{img=pad.toDataURL('image/jpeg',.6)}catch(_){img=''}if(!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]{10,90000}$/.test(img))img='';
  const entry={title:t,text:x,wea,img,stamp:'',note:''};k.diary.push(entry);k.diary=k.diary.slice(-6);ctx.save();warn.textContent='선생님께 냈어요! 도장을 기다려요...';
  w.setTimeout(()=>{entry.stamp=stampOf(x);entry.note=pick(STAMP_LINES);ctx.save();if(ctx.rerender&&pad.isConnected!==false)ctx.rerender()},1200)},'k-btn kd-submit');
 box.append(title,text,warn,sub);c.append(box);
 const mine=k.diary.slice().reverse();const gal=E('section','k-box');gal.append(E('h3','','내 그림일기 ('+k.diary.length+'/6)'));if(!mine.length)gal.append(E('p','k-p','아직 쓴 그림일기가 없어요.'));
 for(const d of mine)gal.append(card(env,{nick:'나',title:d.title,wea:d.wea,text:d.text,stamp:d.stamp||'',note:d.note||'',img:d.img}));c.append(gal);
 const fr=E('section','k-box');fr.append(E('h3','','친구들의 그림일기'));for(const d of FRIEND_DIARY)fr.append(card(env,d));c.append(fr)}
function card(env,d){const {E}=env,n=E('article','kd-card');let pic;if(d.img){pic=E('img','kd-img');pic.src=d.img;pic.alt=d.title}else{pic=E('canvas','kd-img');pic.width=240;pic.height=152;const g=pic.getContext?pic.getContext('2d'):null;if(g)try{crayonPic(g,d.pic||'dog',240,152)}catch(_){}}
 const head=E('p','kd-head');head.append(E('b','',d.title),E('small','',' · '+d.nick+' · '+(WEATHER.find(x=>x[0]===d.wea)||WEATHER[0])[1]));n.append(head,pic,E('p','kd-body',d.text));
 if(d.stamp){const st=E('span','kd-stamp'+(d.stamp==='참 잘했어요'?' best':''),d.stamp);n.append(st);if(d.note)n.append(E('p','kd-note','선생님: '+d.note))}else n.append(E('p','kd-note','도장 기다리는 중...'));return n}

/* ---------- 3. 꾸러기 받아쓰기 ---------- */
const DICT=[
 ['오늘은 (  ) 기분이 좋다.',['왠지','웬지'],0,'‘왜인지’를 줄인 말이라서 ‘왠지’가 맞아요.'],
 ['숙제를 다 (  ).',['됐다','됬다'],0,'‘되었다’를 줄이면 ‘됐다’예요.'],
 ['비가 (  ) 그쳤다.',['금세','금새'],0,'‘금시에’가 줄어든 말이라서 ‘금세’가 맞아요.'],
 ['우산을 안 가져왔네. 이제 (  )?',['어떡해','어떻해'],0,'‘어떻게 해’를 줄이면 ‘어떡해’예요.'],
 ['오늘이 (  )이지?',['며칠','몇일'],0,'‘몇일’이라고 쓰지 않고 언제나 ‘며칠’이라고 써요.'],
 ['저녁을 먹고 (  )를 도와드렸다.',['설거지','설겆이'],0,'바른 말은 ‘설거지’예요.'],
 ['감기가 다 (  ).',['나았다','낳았다'],0,'병이 좋아지면 ‘낫다’, 아기를 태어나게 하면 ‘낳다’예요.'],
 ['내 (  )은 과학자가 되는 거야.',['바람','바램'],0,'‘바라다’에서 나온 말이라서 ‘바람’이 맞아요.'],
 ['(  ) 그렇게까지 할 필요는 없어.',['굳이','구지'],0,'소리는 [구지]로 나지만 ‘굳이’라고 써요.'],
 ['정말 (  )이야!',['오랜만','오랫만'],0,'‘오래간만’을 줄인 말이라서 ‘오랜만’이에요.'],
 ['참 (  ) 일도 다 있네.',['희한한','희안한'],0,'바른 말은 ‘희한하다’예요.'],
 ['동생이 (  ) 그런 게 아니야.',['일부러','일부로'],0,'바른 말은 ‘일부러’예요.'],
 ['연필 좀 (  ) 줄래?',['빌려','빌러'],0,'‘빌리다’라서 ‘빌려’가 맞아요.'],
 ['시험 공부를 (  ) 했다.',['열심히','열심이'],0,'‘열심히’라고 써요.'],
 ['물건값을 (  ) 달라고 했다.',['깎아','깍아'],0,'‘깎다’는 받침에 ㄲ이 들어가요.'],
 ['내 짝꿍은 키가 (  ).',['작다','적다'],0,'크기는 ‘작다’, 양이나 수는 ‘적다’예요.'],
 ['사탕이 하나밖에 (  ) 남았다.',['안','않'],0,'‘아니’를 줄인 말은 ‘안’, ‘아니하’를 줄인 말은 ‘않’이에요.'],
 ['할머니께서 방에서 (  ).',['주무신다','잔다'],0,'웃어른께는 높임말 ‘주무시다’를 써요.'],
 ['선생님, 내일 학교에 (  )?',['오세요','와요'],0,'선생님께는 높여서 ‘오세요’라고 해요.'],
 ['거기 누구 (  )?',['있어요','있어여'],0,'인터넷에서 ‘있어여’라고 많이 쓰지만 바른 말은 ‘있어요’예요.'],
 ['밥을 너무 많이 먹어서 배가 (  ).',['부르다','부루다'],0,'배가 차면 ‘배부르다’예요.'],
 ['친구와 (  )를 했다.',['약속','약쏙'],0,'소리는 [약쏙]으로 나도 ‘약속’이라고 써요.']
];
const STAMP=s=>s>=100?'참 잘했어요':s>=80?'잘했어요':s>=60?'보통이에요':'좀 더 노력해요';
function dictPage(env,c){const {E,B,k,ctx}=env;const best=Number.isFinite(k.scores.dict)?k.scores.dict:0;
 const qs=DICT.map((x,i)=>i).sort(()=>Math.random()-.5).slice(0,10);let qi=0,score=0;const wrong=[];
 const box=E('section','k-box kq-dict');c.append(E('p','k-tally','지금까지 최고 점수 '+best+'점'),box);
 const draw=()=>{box.replaceChildren();if(qi>=qs.length){const st=STAMP(score);if(score>best){k.scores.dict=score;ctx.save()}box.append(E('h3','','받아쓰기 끝! '+score+'점'),E('span','kd-stamp big'+(score>=100?' best':''),st));if(wrong.length){const l=E('div','kq-wrong');l.append(E('b','','틀린 문제 다시 보기'));for(const i of wrong){const [s,ch,a,why]=DICT[i];l.append(E('p','',s.replace('(  )','['+ch[a]+']')+' · '+why))}box.append(l)}box.append(B('다시 보기',()=>{if(ctx.rerender)ctx.rerender()},'k-btn'));return}
  const [s,ch,a]=DICT[qs[qi]];box.append(E('p','kq-no','문제 '+(qi+1)+' / 10'),E('p','kq-q',s));const row=E('div','kq-choices');const order=ch.map((x,i)=>i).sort(()=>Math.random()-.5);
  for(const i of order)row.append(B(ch[i],()=>{const ok=i===a;if(ok)score+=10;else wrong.push(qs[qi]);const res=E('p','kq-res '+(ok?'ok':'no'),(ok?'딩동댕! ':'땡! 정답은 ‘'+ch[a]+'’ · ')+DICT[qs[qi]][3]);box.append(res);for(const b of row.children)b.disabled=true;w.setTimeout(()=>{qi++;draw()},ok?700:1500)},'k-choice'));box.append(row)};
 draw();env.dict={state:()=>({qi,score,q:qs[qi]!=null?DICT[qs[qi]]:null})}}

/* ---------- 4. 새 오락 두 가지 ---------- */
const FONT='bold 14px Dotum,Gulim,sans-serif';
function t(g,s,x,y,col,al,font){g.fillStyle=col||'#222';g.textAlign=al||'left';g.font=font||FONT;g.fillText(String(s),x,y)}
function bar(g,left,right,W){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,W,22);t(g,left,8,16,'#fff');t(g,right,W-8,16,'#ffeb7a','right')}
const GUGU={title:'구구단 풍선',help:'문제의 답이 적힌 풍선을 클릭! 틀리거나 놓치면 목숨이 줄어요.',init(env){
 const W=480,H=320;let q,balloons,score,life,time,combo,pop;
 const make=()=>{const a=2+Math.floor(Math.random()*8),b=2+Math.floor(Math.random()*8),ans=a*b;const set=new Set([ans]);const cand=[ans+a,ans-a,ans+b,ans-b,(a+1)*b,a*(b+1),ans+1,ans-1].filter(x=>x>0&&x!==ans);while(set.size<3)set.add(cand[Math.floor(Math.random()*cand.length)]);const nums=[...set].sort(()=>Math.random()-.5);q={a,b,ans};balloons=nums.map((n,i)=>({n,x:110+i*130,y:H+30+i*18,v:38+score*.6,dead:false}))};
 return{reset(){score=0;life=3;time=40;combo=0;pop=[];make()},
  update(dt){time-=dt;if(time<=0||life<=0){env.over(score);return}for(const b of balloons)if(!b.dead)b.y-=b.v*dt;const right=balloons.find(b=>b.n===q.ans);if(right&&right.y<-40){life--;combo=0;pop.push({s:'놓쳤다! '+q.a+'×'+q.b+'='+q.ans,x:W/2,y:150,t:1.2});make()}for(const p of pop){p.t-=dt;p.y-=dt*20}pop=pop.filter(p=>p.t>0)},
  click(x,y){const b=balloons.find(b=>!b.dead&&Math.hypot(x-b.x,y-b.y)<32);if(!b)return;b.dead=true;if(b.n===q.ans){combo++;score+=10+Math.min(20,combo*2);pop.push({s:'딩동댕! +'+(10+Math.min(20,combo*2)),x:b.x,y:b.y,t:.8});make()}else{life--;combo=0;pop.push({s:'땡!',x:b.x,y:b.y,t:.8})}},
  draw(g){const gr=g.createLinearGradient?g.createLinearGradient(0,0,0,H):null;if(gr){gr.addColorStop(0,'#9fd6ff');gr.addColorStop(1,'#e8f8ff');g.fillStyle=gr}else g.fillStyle='#9fd6ff';g.fillRect(0,0,W,H);
   g.fillStyle='#fff';g.fillRect(W/2-90,30,180,42);t(g,q.a+' × '+q.b+' = ?',W/2,60,'#e8302a','center','bold 24px Dotum,Gulim,sans-serif');
   const cols=['#ff6a8a','#ffb02a','#5ac85a'];balloons.forEach((b,i)=>{if(b.dead)return;g.strokeStyle='#888';g.lineWidth=1;g.beginPath();g.moveTo(b.x,b.y+30);g.lineTo(b.x,b.y+60);g.stroke();g.fillStyle=cols[i%3];g.beginPath();if(g.ellipse)g.ellipse(b.x,b.y,28,32,0,0,7);else g.arc(b.x,b.y,30,0,7);g.fill();t(g,b.n,b.x,b.y+8,'#fff','center','bold 22px Dotum,Gulim,sans-serif')});
   for(const p of pop)t(g,p.s,p.x,p.y,'#e8302a','center','bold 18px Dotum,Gulim,sans-serif');bar(g,'점수 '+score+(combo>1?' · '+combo+'연속!':''),'목숨 '+'♥'.repeat(Math.max(0,life))+' · '+Math.ceil(Math.max(0,time))+'초',W)},
  state(){return{q:{...q},score,life,time,balloons:balloons.map(b=>({n:b.n,x:b.x,y:b.y,dead:b.dead}))}}}}};
const ROPE={title:'꾸러기 줄넘기',help:'줄이 발밑에 올 때 클릭하거나 Space를 눌러 폴짝! 걸리면 끝나요.',init(env){
 const W=480,H=320,FOOT=250;let ang,speed,count,air,vy,y,best,fail,msg;
 const jump=()=>{if(air)return;air=true;vy=-300};
 return{reset(){ang=-Math.PI*1.3;speed=3.1;count=0;air=false;vy=0;y=0;fail=false;msg='줄이 발밑에 올 때 점프!'},
  update(dt){const prev=ang;ang+=speed*dt;if(air){vy+=900*dt;y+=vy*dt;if(y>=0){y=0;vy=0;air=false}}
   const PI=Math.PI,crossed=Math.floor((prev-PI/2)/(2*PI))!==Math.floor((ang-PI/2)/(2*PI));if(crossed){if(y<-10){count++;speed=Math.min(6.5,speed+.07);msg=count%10===0?count+'개!!':''}else{fail=true;env.over(count)}}},
  click(){jump()},key(k){if(k===' '||k==='ArrowUp'||k==='Enter')jump()},
  draw(g){g.fillStyle='#ffe8c8';g.fillRect(0,0,W,H);g.fillStyle='#d8b880';g.fillRect(0,FOOT,W,H-FOOT);
   const cx=W/2,top=FOOT-110,rx=120,ry=70,ry2=Math.sin(ang)*ry;const ropeY=FOOT-55+ry2;
   const front=Math.cos(ang)<0;const rope=()=>{g.strokeStyle='#e8302a';g.lineWidth=4;g.beginPath();g.moveTo(cx-rx,FOOT-60);g.quadraticCurveTo?g.quadraticCurveTo(cx,ropeY+ry2*.6,cx+rx,FOOT-60):g.lineTo(cx+rx,FOOT-60);g.stroke()};
   if(!front)rope();const by=FOOT+y;g.fillStyle='#ffdcb8';g.beginPath();g.arc(cx,by-62,13,0,7);g.fill();g.fillStyle='#2a6ad8';g.fillRect(cx-10,by-49,20,26);g.fillStyle='#333';g.fillRect(cx-9,by-23,6,23);g.fillRect(cx+3,by-23,6,23);g.fillStyle='#4a3020';g.fillRect(cx-13,by-76,26,7);
   g.strokeStyle='#ffdcb8';g.lineWidth=5;g.beginPath();g.moveTo(cx-10,by-44);g.lineTo(cx-rx,FOOT-60);g.moveTo(cx+10,by-44);g.lineTo(cx+rx,FOOT-60);g.stroke();if(front)rope();
   t(g,String(count),cx,top-10,'#e8302a','center','bold 40px Dotum,Gulim,sans-serif');if(msg)t(g,msg,cx,top+20,'#ff8a1a','center','bold 20px Dotum,Gulim,sans-serif');bar(g,'넘은 개수 '+count,'속도 '+speed.toFixed(1),W)},
  state(){return{ang,speed,count,air,y}}}}};
if(KG&&KG.register){KG.register('gugu',GUGU);KG.register('rope',ROPE)}
const S=KP.sites;if(S.jr&&!S.jr.games.includes('gugu'))S.jr.games.push('gugu');if(S.yk&&!S.yk.games.includes('rope'))S.yk.games.push('rope');
KP.extend('jr','diary','그림일기',diaryPage,'크레파스로 그림을 그리고 오늘 있었던 일을 써요. 선생님이 도장을 찍어 주세요!');
KP.extend('yk','dict','받아쓰기',dictPage,'헷갈리는 맞춤법 열 문제! 백 점을 맞으면 참 잘했어요 도장을 받아요.');
w.KidsMore={ADD,DICT,FRIEND_DIARY,STAMP,stampOf,GUGU,ROPE,version:'A95'};
})(window);
