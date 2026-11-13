/* A95: 미니홈피. 바탕 화면의 ‘나의 미니홈’과 포털의 ‘내 정보’가 새 창으로 연다.
   내 미니홈피: 홈(미니룸, 일촌평), 프로필, 다이어리, 사진첩(그림판에서 저장한 ‘내 그림’을 올린다), 방명록, 미니룸 꾸미기, 선물가게, 도토리.
   일촌 파도타기: 동네 사람 열두 명의 미니홈피를 돌아다니며 방명록을 남기고 일촌을 맺는다. 방명록을 남기면 답방이 온다.
   사람, 노래 제목(옛 클래식 곡 말고는 지어낸 것), 주소는 모두 지어낸 것이다. 글쓴 날짜와 시각은 2006년 5월 30일 오후 4시 32분 이전이다.
   그림 파일은 쓰지 않고 캔버스로 그린다. 기록은 saved.mini 에 남는다.
   A97 (2026-11-12 KST): 같은 방(함께 걷기)에 들어온 친구끼리 미니홈피를 실시간으로 주고받는다. 친구 홈 구경(투데이), 방명록과 주인 답글,
   일촌 신청과 수락, 일촌평, 사진 세 장, 일촌 파도타기가 서버(server_minihome.js)를 거쳐 바로 보이고 알림이 뜬다. 방이 없으면 예전처럼 혼자 논다. */
(function(w){'use strict';
const TODAY='2006.05.30 (화)';
const MOODS=[['행복','^^'],['기쁨','\\(^o^)/'],['설렘','♡_♡'],['신남','ㅋㅋ'],['두근두근','>ㅅ<'],['뿌듯','v(^^)v'],['피곤','=_='],['졸림','-_-zZ'],['배고픔','@_@'],['우울','ㅠㅠ'],['바쁨',';;'],['심심','ㅡㅡ']];
const moodFace=m=>{const x=MOODS.find(a=>a[0]===m);return x?x[0]+' '+x[1]:m};
/* 동네 사람들. ilchon: 이 사람의 일촌 [id, 일촌명]. says: 이 사람 홈에 적힌 일촌평 [쓴 사람 id, 일촌명, 글]. guest: [쓴 사람, 날짜, 글, 주인 답글]. */
const FRIENDS=[
{id:'sujin',name:'김수진',sex:'♀',info:'중학교 2학년',title:'★ 수진이의 반짝반짝 방 ★',intro:'별빛소녀 다솜 언니 ♡ 영원히\n수학 학원 가기 싫어 ㅠㅠ\n일촌 신청 환영~ 답방 꼭 할게요 ^^',mood:'설렘',today:31,total:5280,cover:'stage',skin:'pink',bgm:'별빛소녀 - 반짝반짝 첫사랑',
 look:{hair:'#3a2418',shirt:'#ff7ab0',style:'long'},room:{wall:'pink',floor:'wood',slots:{W0:'window',W1:'poster',F0:'bed',F2:'teddy',F3:'desk',F4:'plant'}},
 diary:[['2006.05.30 (화)','맑음','공개방송 방청 응모 당첨됐다!!!!! 6월 3일 토요일 동네 문화회관 ㅠㅠ 다솜 언니를 진짜로 보는 거야?! 엄마한테는 아직 비밀 ㅋㅋ'],['2006.05.27 (토)','흐림','민호랑 PC방 갔는데 걔는 카트만 하고 나는 미니홈피만 꾸몄다 ㅋㅋ 도토리 다 써서 BGM 한 곡 남음 ㅠㅠ'],['2006.05.22 (월)','비','수학 학원 쪽지 시험 망함... 우울해서 BGM을 슬픈 노래로 바꿈 ㅠㅠ']],
 photos:[['stage','별빛소녀 음악 방송 사전 녹화 (멀리서 찍음 ㅠㅠ)','2006.05.13',['민호::야 잘 안 보인다 ㅋㅋ','지은언니::오 부럽다~','퍼가요~♡']],['food','학원 끝나고 컵떡볶이 ♡','2006.05.25',['민호::나도 사 줘','할머니::우리수진이맛잇게먹엇니']],['selca','얼짱 각도 연습 중 ㅋㅋ (V)','2006.05.29',['민호::얼짱 각도 실패 ㅋㅋㅋ','하늘언니::귀엽다 ^^']]],
 guest:[['민호','2006.05.30 15:12','야 내일 영어 숙제 뭐냐 ㅋㅋ 알려 주라','알림장 좀 써라 ㅡㅡ 32쪽'],['분홍풍선','2006.05.29 22:40','별빛소녀 팬이시죠?! 저도요 ♡ 일촌해요~','네네 신청할게요 ^^'],['할머니','2006.05.28 19:05','수진아할머니다밥잘먹고다녀라','할머니 ㅋㅋㅋ 띄어쓰기 해야 돼요 ♡'],['지나가던사람','2006.05.26 11:30','투데이 올려 드리고 가요~ 놀러 오세요','']],
 says:[['minho','동네친구','수진아 PC방 ㄱ?'],['jieun','언니동생','우리 수진이 공부도 열심히 하자 ^^']],
 ilchon:[['minho','동네친구'],['jieun','언니동생'],['grandma','할머니♡'],['haneul','별빛소녀 팬'],['nabi','냥냥']],
 accept:'동네친구',toMe:'방가방가~ 미니홈피 이쁘다 ^^ 자주 놀러 갈게!',replies:['ㅋㅋ 반가워요 ^^ 자주 놀러 오세요~','방명록 고마워요 ♡ 답방 갈게요!','오 누구지?? ㅋㅋ 반가워요'],visit:['답방 왔어요~ 미니홈피 귀엽다 ^^','투데이 올려 주고 가요 ♡ 일촌평도 써 줘!'],cm:['ㅋㅋㅋ 공감','오 대박','퍼가요~♡']},
{id:'minho',name:'박민호',sex:'♂',info:'중학교 2학년',title:'ㅁㅎ의 게임 연구소',intro:'카트 기록 단축 중\n스타는 테란\n공부는 내일부터 -_-',mood:'배고픔',today:12,total:2311,cover:'pc',skin:'green',bgm:'한여름 밴드 - 질주',
 look:{hair:'#1e1a16',shirt:'#3a7ad8',style:'short'},room:{wall:'check',floor:'tile',slots:{W1:'clock',W2:'frame',F0:'tv',F1:'desk',F3:'shelf',F4:'ball'}},
 diary:[['2006.05.30 (화)','맑음','학교 끝나고 바로 PC방 옴. 카트 타임 어택 기록 깼다!!! 근데 사장님이 학원 안 가냐고 물어봄 ㄷㄷ 엄마랑 아는 사이임'],['2006.05.26 (금)','맑음','형 휴가 나왔다. 형이 스타 1:1 하자고 해서 했는데 짐 ㅡㅡ 군대에서 연습했나 봄'],['2006.05.20 (토)','흐림','수진이가 미니홈피 BGM 추천해 달래서 해 줬더니 구리다고 함. 다시는 추천 안 함']],
 photos:[['pc','PC방 명당 자리. 모니터가 제일 큼','2006.05.30',['수진::또 PC방이냐 ㅋㅋ','태현형::공부해라','PC방사장님::컵라면 다 드셨으면 치워 주세요 ^^']],['trophy','카트 타임 어택 개인 최고 기록!!','2006.05.28',['수진::이게 뭔데 ㅋㅋ','준호형::오 꽤 하네']]],
 guest:[['수진','2006.05.30 15:20','숙제 32쪽이라고 ㅡㅡ 알림장 좀 써라',''],['태현형','2006.05.29 23:10','민호야 형 복귀하기 전에 한 판 더 하자 ㅋㅋ 이번엔 안 봐줌','콜!! 이번엔 내가 이김'],['초보입니다','2006.05.27 17:45','카트 같이 하실래요? 친추해요~','ㅇㅋ'],['준호형','2006.05.24 01:30','고3은 웁니다... 너는 지금 놀아라','형 힘내요 ㅋㅋ']],
 says:[['sujin','동네친구','민호야 게임 좀 그만 ㅋㅋ'],['taehyun','형제','동생아 공부도 좀 해라. 충성!']],
 ilchon:[['sujin','동네친구'],['taehyun','형제'],['junho','동네형'],['boss','단골손님'],['dalli','동네동생']],
 accept:'겜친구',toMe:'ㅋㅋ 일촌 ㄳ 카트 같이 하자',replies:['ㅇㅇ 반가워 ㅋㅋ','카트 같이 하자~','방명록 ㄳ ㅋㅋ'],visit:['답방 ㅋㅋ 홈피 깔끔하네','게임 같이 하자 ㅋㅋ PC방으로 와'],cm:['ㅋㅋㅋㅋ','오 ㄷㄷ','ㄳ']},
{id:'haneul',name:'하늘',sex:'♀',info:'대학교 1학년 (06학번)',title:'하늘이의 구름 위 일기장',intro:'06학번 새내기 ^^\n개인 홈페이지도 해요 (하늘이의 꿈꾸는 홈페이지)\n별빛소녀 언니들 사랑해요',mood:'피곤',today:18,total:3402,cover:'sky',skin:'sky',bgm:'오르골 - 반짝반짝 작은 별',homepage:true,
 look:{hair:'#5a3a22',shirt:'#9fd0ff',style:'long'},room:{wall:'sky',floor:'wood',slots:{W0:'window',W2:'frame',F0:'sofa',F2:'desk',F3:'teddy',F4:'plant'}},
 diary:[['2006.05.29 (월)','비','오늘 우산 사건은 홈페이지 일기에도 썼다 ㅋㅋ 미니홈피랑 홈페이지 둘 다 하니까 바쁘다'],['2006.05.25 (목)','맑음','과제 하다가 미니홈피 스킨만 바꿈. 과제는 그대로...']],
 photos:[['sky','학교 옥상에서 본 노을','2006.05.24',['지은선배::새내기 사진 잘 찍네~','퍼가요~♡']],['cake','동아리 선배 생일 파티!','2006.05.18',['지은선배::케이크 맛있었지 ^^']]],
 guest:[['별사탕','2006.05.30 12:20','하늘님 홈페이지 보고 미니홈피도 왔어요 ^^',''],['지은선배','2006.05.28 20:00','새내기 MT 사진 올려라~ 선배 명령이다 ㅋㅋ','넵 선배님 ㅠㅠ 조만간!!']],
 says:[['jieun','과선배','새내기 하늘이 화이팅!'],['sujin','별빛소녀 팬','언니 BGM 공유해 주세요~']],
 ilchon:[['jieun','과선배'],['sujin','별빛소녀 팬']],
 accept:'인터넷친구',toMe:'일촌 고마워요 ^^ 홈페이지에도 놀러 와요 ☆',replies:['방가방가 ^^ 놀러 와 줘서 고마워요','홈페이지에도 놀러 오세요~ ☆'],visit:['답방 왔어요 ^^ 미니룸 예쁘다~','투데이 하나 올리고 가요 ☆'],cm:['ㅎㅎ 귀여워요','오 저도 그래요 ^^']},
{id:'sora',name:'바다소라',sex:'♀',info:'해솔초등학교 6학년',title:'바다소라의 조개껍데기 ☆',intro:'약속은 지키라고 있는 거야\n북극성처럼 늘 같은 자리 ☆\n인터넷 소설 연재 중 (소설나라)',mood:'두근두근',today:9,total:1530,cover:'capsule',skin:'star',bgm:'피아노 소품 - 캐논 변주곡 (파헬벨)',away:'지금은 자리에 없어요 (철봉 앞 ☆)',
 look:{hair:'#2a1a12',shirt:'#ffd23f',style:'pony'},room:{wall:'night',floor:'wood',slots:{W0:'window',W2:'clock',F1:'scope',F2:'desk',F3:'shelf'}},
 diary:[['2006.05.30 (화)','맑음','오늘이다. 4시 반. 철봉 앞. 숟가락도 챙겼다 ㅋㅋ (삽은 무거우니까)'],['2006.05.29 (월)','맑음','하늘반 게시판에 별이 소식 물어봤는데 아무도 모른다. 별이 홈피 이름이 다락방 어쩌구였는데... 링크천국에서 본 것 같기도 하고.'],['2006.05.14 (일)','비','소설나라에 3화 올렸다. 주인공 이름은 비밀인데 다들 눈치챈 것 같다 ㅋㅋ']],
 photos:[['capsule','(옛날 사진) 4학년 때 별이랑. 운동장 철봉 앞','2004.05.30',['달리기왕::이거 우리 학교 철봉이다!','정다운쌤::그 약속 꼭 지켜지길 바랄게 ^^']],['night','우리 집 창문에서 찍은 북쪽 하늘 (북극성 찾았다!)','2006.05.20',['달리기왕::별 하나밖에 안 보이는데? ㅋㅋ','ㄴ 그게 북극성이야 바보야']]],
 guest:[['달리기왕','2006.05.30 14:50','소라야 4시 반에 철봉 간다며? 나도 구경 가도 됨? ㅋㅋ','안 돼 ㅡㅡ 우리 둘만의 약속이야'],['핑크사랑','2006.05.28 21:30','소설 4화 언제 올라와요?? 강준이 너무 멋있어요 ㅠㅠ','5화는 5월 30일 이후에 올라가요 ^^'],['정다운쌤','2006.05.25 18:00','소라야 체육대회 응원 최고였어! 목은 괜찮니?','쌤 목 쉬었어요 ㅋㅋ']],
 says:[['dalli','짝꿍','소라야 내일 수학 숙제 보여 줘 ㅋㅋ'],['teacher','하늘반 쌤','우리 소라 글 솜씨 최고!']],
 ilchon:[['dalli','짝꿍'],['teacher','하늘반 쌤']],
 accept:'친구',toMe:'일촌 고마워요 ☆ 북극성 찾아본 적 있어요?',replies:['고마워요 ^^ 혹시... 별이 아니죠? ㅋㅋ 아니구나','방명록 고마워요! 소설나라에도 놀러 와요 ☆'],visit:['답방 왔어요 ☆ 오늘 저 약속 있어요 ㅋㅋ'],cm:['☆ 예쁘다','ㅋㅋㅋ 귀여워요']},
{id:'dalli',name:'강우진',nick:'달리기왕',sex:'♂',info:'해솔초등학교 6학년',title:'달리기왕의 미니홈피 (1등만 기억한다)',intro:'체육대회 이어달리기 마지막 주자\n축구 국가대표 될 거임\n대~한민국!',mood:'신남',today:7,total:988,cover:'track',skin:'green',bgm:'응원 연주곡 - 대한민국 짝짝짝',
 look:{hair:'#1a1410',shirt:'#e84d4d',style:'short'},room:{wall:'sky',floor:'mat',slots:{W1:'flag',F0:'bed',F2:'ball',F3:'desk'}},
 diary:[['2006.05.29 (월)','맑음','토고전 6월 13일 밤 10시!! 엄마가 같이 보자고 함 아싸'],['2006.05.25 (목)','맑음','체육대회 이어달리기 역전승!!! 내가 마지막에 두 명 제침 ㅋㅋㅋ 쌤이 울었다 (쌤은 아니라고 함)']],
 photos:[['track','체육대회 이어달리기 1등 깃발!','2006.05.25',['정다운쌤::우리 반 최고! (눈에 먼지가...)','바다소라::너 진짜 빨랐어 ㅋㅋ']],['ball','축구공에 사인 받음 (가짜 ㅋㅋ 내가 씀)','2006.05.21',['바다소라::ㅋㅋㅋ 사기꾼']]],
 guest:[['바다소라','2006.05.30 13:00','철봉 오지 마 ㅡㅡ',''],['붉은악마','2006.05.29 20:10','토고전 새벽 아니고 밤 10시래 ㅋㅋ 다 같이 보자','ㅇㅋ 치킨 사 와']],
 says:[['sora','짝꿍','달리기만 빠르고 숙제는 느림 ㅋㅋ'],['teacher','하늘반 쌤','우진아 이어달리기 멋졌어!']],
 ilchon:[['sora','짝꿍'],['teacher','하늘반 쌤'],['minho','동네형']],
 accept:'친구',toMe:'일촌 ㄳ ㅋㅋ 축구 좋아함?',replies:['ㅇㅇ 방가 ㅋㅋ','달리기 시합 할래? ㅋㅋ'],visit:['답방 ㅋㅋ 너도 축구 좋아해?'],cm:['ㅋㅋㅋ','오~']},
{id:'teacher',name:'정다운',sex:'♀',info:'해솔초등학교 6학년 2반 담임',title:'정다운 쌤의 하늘반 일기',intro:'하늘반 31명 + 정다운 쌤\n꿈을 향해 날아라! (숙제는 하고 날자)\n※ 방명록에 숙제 물어보기 금지 ^^',mood:'뿌듯',today:15,total:2690,cover:'class',skin:'paper',bgm:'클래식 - 엘리제를 위하여 (베토벤)',
 look:{hair:'#2a1a12',shirt:'#9ad08a',style:'bob'},room:{wall:'paper',floor:'wood',slots:{W1:'clock',W2:'frame',F2:'desk',F3:'shelf',F4:'plant'}},
 diary:[['2006.05.30 (화)','맑음','수학여행 안내문 도장 아직 안 받아 온 친구 5명. 내일은 꼭! 그리고 4시 반까지만 운동장에서 놀기로 약속했는데 잘 지켜지려나 ^^'],['2006.05.25 (목)','맑음','체육대회 이어달리기. 우리 반이 역전했다. 울지 않았다. 정말이다.']],
 photos:[['class','6학년 2반 첫날 칠판','2006.03.02',['달리기왕::쌤 글씨 예뻐요','바다소라::벌써 석 달 됐다 ㅠㅠ']]],
 guest:[['하늘반막내','2006.05.30 10:20','쌤 사랑해요 ♡ 오늘 숙제 없죠?','수학 익힘책 52~53쪽 ^^'],['학부모','2006.05.27 21:00','선생님 체육대회 수고 많으셨어요. 아이가 너무 좋아했어요.','감사합니다 어머님 ^^']],
 says:[['sora','제자','쌤 수학여행 때 장기자랑 해요!'],['dalli','제자','쌤 이어달리기 때 우셨죠 ㅋㅋ']],
 ilchon:[['sora','제자'],['dalli','제자']],
 accept:'이웃',toMe:'반가워요 ^^ 숙제는 하고 놀기!',replies:['반가워요 ^^ 좋은 하루 보내세요','방명록 고마워요~ 숙제는 하고 놀기!'],visit:['정다운 쌤이에요 ^^ 미니홈피 잘 꾸몄네요!'],cm:['참 잘했어요 ^^','좋은 글이네요~']},
{id:'junho',name:'최준호',sex:'♂',info:'고등학교 3학년',title:'수능 D-170 (나는 할 수 있다)',intro:'수능까지 D-170\n미니홈피는 수능 끝나고...\n라고 쓰고 매일 들어옴',mood:'우울',today:4,total:1204,cover:'book',skin:'paper',bgm:'미드나잇 - 새벽 두 시 라디오',
 look:{hair:'#141414',shirt:'#5a5a6a',style:'short'},room:{wall:'paper',floor:'tile',slots:{W0:'dday',W1:'clock',F2:'desk',F3:'shelf'}},
 diary:[['2006.05.30 (화)','흐림','모의고사 성적표 나옴. 미니홈피 BGM을 슬픈 노래로 바꿨다. 이것이 고3의 일상.'],['2006.05.23 (화)','맑음','독서실에서 졸다가 침 흘림. 옆자리 사람이랑 눈 마주침. 내일부터 다른 독서실 간다.']],
 photos:[['book','독서실 내 자리. 이 책 다 보면 대학 감?','2006.05.21',['민호::형 화이팅 ㅋㅋ','태현::준호야 군대는 늦게 와라 ㅋㅋ']]],
 guest:[['민호','2006.05.29 18:30','형 PC방 한 판만 ㅋㅋ','저리 가라 ㅋㅋ 수능 끝나고'],['엄마','2006.05.28 23:50','준호야 미니홈피 할 시간에 공부해라','네...']],
 says:[['minho','동네동생','형 힘내요!'],['taehyun','선배','준호야 대학 가서 보자']],
 ilchon:[['minho','동네동생'],['taehyun','선배']],
 accept:'동생',toMe:'고3이라 짧게... 일촌 고마워',replies:['고3이라 짧게... 고마워','수능 끝나면 놀자 ㅠㅠ'],visit:['고3이지만 답방은 한다... 공부하러 간다'],cm:['부럽다...','공부해라 ㅋㅋ']},
{id:'taehyun',name:'박태현',sex:'♂',info:'육군 상병 (휴가 중)',title:'충성! 상병 박태현 (휴가 중)',intro:'군인입니다 (휴가 5/26 ~ 6/3)\n전역까지 남은 날은 묻지 마세요\n민호야 공부해라',mood:'행복',today:22,total:3013,cover:'army',skin:'green',bgm:'한여름 밴드 - 우산 속 두 사람',
 look:{hair:'#141414',shirt:'#5a7a3a',style:'buzz'},room:{wall:'check',floor:'mat',slots:{W1:'flag',W2:'clock',F0:'bed',F3:'tv'}},
 diary:[['2006.05.29 (월)','맑음','휴가 나와서 제일 먼저 한 것: PC방. 미니홈피 들어오니까 방명록에 충성이 50개 ㅋㅋ'],['2006.05.26 (금)','맑음','휴가 첫날. 엄마 김치찌개 먹고 울 뻔했다. 민호는 스타로 이겨 줬다 (봐준 거임)']],
 photos:[['army','부대 앞 (사진 찍어도 되는 곳)','2006.04.10',['민호::형 머리 ㅋㅋㅋ','준호::멋있어요 형']],['food','휴가 첫날 엄마 김치찌개','2006.05.26',['민호::나도 먹었음 ㅋㅋ']]],
 guest:[['군대동기','2006.05.30 09:00','충성! 휴가 잘 보내라 ㅋㅋ 복귀하면 보자','충성! 복귀 안 하고 싶다'],['민호','2006.05.29 22:00','형 오늘 한 판 더 ㄱ?','콜 이번엔 안 봐줌']],
 says:[['minho','형제','형 휴가 끝나지 마 ㅠㅠ'],['junho','후배','충성! 휴가 즐기세요']],
 ilchon:[['minho','형제'],['junho','후배']],
 accept:'충성',toMe:'충성! 일촌 감사합니다 ^^',replies:['충성! 방명록 감사합니다 ^^','휴가 중이라 답이 늦어요 ㅋㅋ'],visit:['충성! 답방 왔습니다 ^^'],cm:['충성!','ㅋㅋ 좋다']},
{id:'jieun',name:'윤지은',sex:'♀',info:'대학교 2학년',title:'지은이의 찰칵찰칵 디카 앨범',intro:'디카 생겼다 ♡ 사진 찍는 게 취미\n우리 집 고양이 나비도 미니홈피 있음 ㅋㅋ\n과제는... 내일',mood:'행복',today:26,total:6120,cover:'flower',skin:'sky',bgm:'피아노 소품 - 캐논 변주곡 (파헬벨)',
 look:{hair:'#6a3a1a',shirt:'#fff3a0',style:'long'},room:{wall:'sky',floor:'wood',slots:{W0:'window',W2:'frame',F0:'sofa',F2:'plant',F4:'fish'}},
 diary:[['2006.05.28 (일)','맑음','디카 들고 동네 한 바퀴. 은하아파트 옥상에서 노을 찍었다. 경비 아저씨한테 혼날 뻔'],['2006.05.21 (일)','흐림','나비가 내 노트북 키보드 위에서 잠. 과제 파일에 ㅋㅋㅋㅋㅋ 300줄 입력됨']],
 photos:[['flower','동네 화단 장미','2006.05.27',['하늘::선배 사진 진짜 잘 찍어요!','퍼가요~♡']],['cat','나비 낮잠','2006.05.21',['수진::나비 너무 귀여워요 ㅠㅠ','나비::냥']],['sky','은하아파트 옥상에서 본 노을','2006.05.28',['하늘::와 예쁘다','민호::ㅋㅋ 옥상 올라가도 됨?']]],
 guest:[['하늘','2006.05.29 23:00','선배 디카 몇 화소예요? 저도 사고 싶어요 ㅠㅠ','400만 화소 ㅋㅋ 용돈 모아서 샀지'],['수진','2006.05.26 17:00','언니 나비 사진 더 올려 주세요 ㅠㅠ','ㅋㅋ 나비 미니홈피 가 봐']],
 says:[['haneul','과후배','선배 사진 강의 해 주세요!'],['nabi','주인님','냥냥 (밥 줘)']],
 ilchon:[['haneul','과후배'],['sujin','언니동생'],['nabi','주인님']],
 accept:'사진친구',toMe:'일촌 고마워요 ^^ 사진 많이 올려요~',replies:['고마워요 ^^ 사진 구경 많이 하세요','반가워요~ 사진 퍼가실 때는 말씀해 주세요!'],visit:['답방 왔어요 ^^ 사진첩 구경하고 가요~'],cm:['오 예쁘다 ^^','퍼가요~♡']},
{id:'nabi',name:'나비',sex:'♀',info:'고양이 (주인: 지은)',title:'냥냥 나비네 집 (주인: 지은)',intro:'나는 고양이다. 이름은 나비.\n좋아하는 것: 참치캔, 키보드 위\n싫어하는 것: 목욕, 청소기',mood:'졸림',today:40,total:7777,cover:'cat',skin:'pink',bgm:'오르골 - 반짝반짝 작은 별',cat:true,
 look:{hair:'#f2b46a',shirt:'#f2b46a',style:'cat'},room:{wall:'pink',floor:'mat',slots:{W0:'window',F1:'basket',F3:'fish'}},
 diary:[['2006.05.30 (화)','맑음','오늘도 창가에서 잤다. 주인은 과제한다고 바쁘다. 키보드 위에 누워 주었다. 고마워하는 것 같다.'],['2006.05.24 (수)','비','비가 와서 밖에 못 나갔다. 청소기가 나를 공격했다. 냥.']],
 photos:[['cat','오늘의 나 (식빵 자세)','2006.05.30',['지은::우리 나비 귀여워 ㅠㅠ','수진::식빵 ㅋㅋㅋ']]],
 guest:[['수진','2006.05.30 16:00','나비야 안녕 ㅋㅋ 언니가 참치캔 사 갈게','냥 (주인 대신 씀)'],['길고양이','2006.05.28 03:00','냐옹 (밤에 놀자)','']],
 says:[['jieun','주인님','나비야 그만 자 ㅋㅋ']],
 ilchon:[['jieun','주인님'],['sujin','냥냥']],
 accept:'냥',toMe:'냥 (일촌 고맙다냥)',replies:['냥 (주인이 대신 씀 ^^)','냐옹~ 놀러 와 줘서 고맙다냥'],visit:['냥냥 (나비가 다녀감)'],cm:['냥','냐옹']},
{id:'boss',name:'오정수',sex:'♂',info:'동네 PC방 사장',title:'동네 PC방 사장의 미니홈피',intro:'2층 동네 PC방 사장입니다\n컵라면 물은 정확히 선까지\n학생들은 10시 전에 집에 가세요 ^^',mood:'바쁨',today:19,total:4404,cover:'pc',skin:'paper',bgm:'라디오 - 오후의 음악 편지',
 look:{hair:'#2a2a2a',shirt:'#e8e8e8',style:'short'},room:{wall:'check',floor:'tile',slots:{W1:'clock',F1:'desk',F2:'desk',F3:'fridge',F4:'plant'}},
 diary:[['2006.05.30 (화)','맑음','오후 4시. 학생들 몰려오기 시작. {seat}번 자리 손님은 오늘도 미니홈피 꾸미는 중인 듯 ^^'],['2006.05.27 (토)','흐림','월드컵 때 PC방에서 단체 응원 할까 고민 중. 프로젝터를 빌려야 하나.'],['2006.05.20 (토)','맑음','컵라면 하루에 47개 팔았다. 신기록. 물 붓다가 하루가 갔다.']],
 photos:[['pc','PC방 새 모니터랑 본체','2006.05.10',['민호::사장님 의자도 바꿔 주세요','PC방사장님::의자는 다음 달에...']],['ramen','오늘의 인기 메뉴','2006.05.20',['수진::사장님 떡볶이도 팔아 주세요!']]],
 guest:[['민호','2006.05.30 15:40','사장님 제 자리 키보드 ㅁ 키가 잘 안 눌려요','내일 바꿔 줄게 ^^'],['동네 아주머니','2006.05.29 20:30','우리 아들 거기 있으면 집에 보내 주세요','네 어머님 ^^;']],
 says:[['minho','단골손님','사장님 컵라면 서비스 ㄳ']],
 ilchon:[['minho','단골손님']],
 accept:'단골손님',toMe:'단골 손님 반가워요 ^^ 컵라면은 카운터에서!',replies:['감사합니다 ^^ 또 오세요~','PC방 공지: 컵라면 물은 사장이 부어 드립니다 ^^'],visit:['PC방 사장입니다 ^^ 오늘도 즐거운 시간 되세요'],cm:['^^','좋네요~']},
{id:'grandma',name:'이순자',sex:'♀',info:'수진이 할머니',title:'순자할머니미니홈피',intro:'손녀수진이가만들어주엇다\n띄어쓰기는어려워\n다들건강하거라',mood:'행복',today:3,total:58,cover:'garden',skin:'pink',bgm:'트로트 메들리 (연주)',
 look:{hair:'#d8d8d8',shirt:'#a05ab0',style:'perm'},room:{wall:'paper',floor:'mat',slots:{W2:'frame',F0:'tv',F2:'plant',F4:'plant'}},
 diary:[['2006.05.30 (화)','맑음','오늘은수진이가컴퓨터를가르쳐주엇다마우스가자꾸도망간다'],['2006.05.26 (금)','흐림','텃밭에상추가많이자랏다수진이엄마한테보내야겟다']],
 photos:[['garden','우리집텃밭상추','2006.05.26',['수진::할머니 상추 맛있어요 ♡','지은::와 싱싱하다']]],
 guest:[['수진','2006.05.30 16:10','할머니 띄어쓰기는 스페이스바 누르면 돼요 ㅋㅋ','스페이스바가어디잇니'],['수진','2006.05.28 19:30','할머니 미니홈피 개설 축하해요 ♡','고맙다우리강아지']],
 says:[['sujin','손녀','할머니 사랑해요 ♡']],
 ilchon:[['sujin','손녀']],
 accept:'손주친구',toMe:'반갑다밥은먹엇니',replies:['고맙구나밥은먹엇니','우리수진이친구구나반갑다'],visit:['할머니다놀러왓다'],cm:['좋구나','장하다']}
];
const FR={};for(const f of FRIENDS)FR[f.id]=f;
const ART='assets/pc-desktop/minihome/';
const NPC_ART={
 sujin:{profile:'sujin-selca',album:['selca','food','stage']},
 minho:{album:['pc','trophy']},haneul:{album:['sky','cake']},
 dalli:{album:['ball','track']},junho:{album:['book']},taehyun:{album:['army','food']},
 jieun:{album:['flower','cat','sky']},nabi:{profile:'nabi-cat',album:['cat']},
 boss:{album:['pc','ramen']},grandma:{album:['garden']}
};
const artUrl=id=>ART+id+'.webp';
/* 선물가게. slot: floor(바닥) | wall(벽) | wallpaper | flooring | bgm | skin */
const SHOP=[
 ['bed','포근한 침대','floor',6],['desk','책상과 컴퓨터','floor',8],['sofa','푹신한 소파','floor',5],['shelf','책장','floor',4],['tv','텔레비전','floor',7],['plant','화분','floor',2],['teddy','곰 인형','floor',3],['guitar','통기타','floor',4],['fish','어항','floor',5],['piano','피아노','floor',10],['scope','망원경','floor',6],['ball','축구공','floor',2],['basket','고양이 바구니','floor',3],['fridge','작은 냉장고','floor',4],
 ['window','창문','wall',2],['poster','별빛소녀 브로마이드','wall',3],['clock','벽시계','wall',2],['frame','풍경 액자','wall',2],['flag','응원 태극기','wall',3],['dday','D-day 달력','wall',1],
 ['wp-sky','하늘색 벽지','wallpaper',3],['wp-pink','분홍 꽃무늬 벽지','wallpaper',3],['wp-check','체크무늬 벽지','wallpaper',3],['wp-night','별밤 벽지','wallpaper',4],['wp-paper','미색 벽지','wallpaper',2],
 ['fl-wood','나무 마루','flooring',2],['fl-tile','하늘 타일','flooring',2],['fl-mat','꽃무늬 장판','flooring',2],
 ['bgm-1','별빛소녀 - 반짝반짝 첫사랑','bgm',3],['bgm-2','한여름 밴드 - 우산 속 두 사람','bgm',3],['bgm-3','미드나잇 - 새벽 두 시 라디오','bgm',3],['bgm-4','피아노 소품 - 캐논 변주곡 (파헬벨)','bgm',3],['bgm-5','오르골 - 반짝반짝 작은 별','bgm',2],
 ['sk-pink','분홍 하트 스킨','skin',4],['sk-star','별밤 스킨','skin',4],['sk-green','초록 체크 스킨','skin',4],['sk-paper','공책 스킨','skin',3]
].map(([id,name,slot,price])=>({id,name,slot,price}));
const ITEM={};for(const it of SHOP)ITEM[it.id]=it;
const SLOTS={W0:[66,48],W1:[180,40],W2:[294,48],F0:[64,182],F1:[134,194],F2:[206,180],F3:[280,194],F4:[330,168]};
const WALL={sky:['#cfe8ff','#b8dcff'],pink:['#ffe0ec','#ffc8dc'],check:['#eef4e0','#d8e8c0'],night:['#1c2a5a','#2a3a72'],paper:['#fbf3dc','#efe2bc']};
const FLOOR={wood:['#c8955a','#b07a44'],tile:['#d8ecf8','#b8d8ec'],mat:['#f0d8a0','#e0c080']};
const SKIN={sky:'#9cc3e6',pink:'#f5b7cf',star:'#27346a',green:'#9ccf8e',paper:'#e8dcc0'};
const COVER_LABEL={stage:'공연 무대',sky:'노을',sea:'바다',night:'밤하늘',flower:'꽃',cat:'고양이',pc:'PC방',book:'책상',cake:'케이크',food:'떡볶이',class:'칠판',garden:'텃밭',capsule:'철봉',track:'운동장',army:'부대 앞',trophy:'기록',selca:'셀카',ball:'축구공',ramen:'컵라면'};

/* ---------- 그리기 ---------- */
function circ(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,Math.max(.5,r),0,Math.PI*2);g.fill()}
function rect(g,x,y,w0,h0,c){g.fillStyle=c;g.fillRect(x,y,w0,h0)}
function txt(g,s,x,y,c,size,al){g.fillStyle=c;g.font='bold '+(size||11)+'px Dotum,Gulim,sans-serif';g.textAlign=al||'center';g.fillText(s,x,y)}
/* Keep the saved item IDs and their existing placement anchors. */
const SIZE={
 bed:[88,63],desk:[78,70],sofa:[86,56],shelf:[53,72],tv:[58,58],plant:[40,52],
 teddy:[39,40],guitar:[40,56],fish:[55,49],piano:[73,63],scope:[52,59],
 ball:[24,24],basket:[48,39],fridge:[43,60],window:[72,60],poster:[50,54],
 clock:[34,34],frame:[52,43],flag:[54,42],dday:[40,50]
};
const roomArt=new Map();
function art(id){
 if(!w.Image)return null;
 if(!roomArt.has(id)){const im=new w.Image();im.src=artUrl(id);roomArt.set(id,im)}
 return roomArt.get(id);
}
function drawItem(g,id,x,y,maxW=Infinity,maxH=Infinity){
 const size=SIZE[id];if(!size)return;
 const im=art(id);if(!im?.complete||!im.naturalWidth)return;
 const scale=Math.min(size[0]/im.naturalWidth,size[1]/im.naturalHeight,maxW/im.naturalWidth,maxH/im.naturalHeight);
 const width=Math.round(im.naturalWidth*scale),height=Math.round(im.naturalHeight*scale);
 g.drawImage(im,Math.round(x-width/2),Math.round(y-height*(ITEM[id].slot==='wall'?.5:1)),width,height);
}
function redrawWhenReady(canvas,ids,draw){
 draw();
 for(const id of new Set(ids)){
  const im=art(id);
  if(im&&!im.complete)im.addEventListener('load',()=>{if(canvas.isConnected)draw()},{once:true});
 }
}
function paintSurface(g,id,x,y,width,height,fallback){
 rect(g,x,y,width,height,fallback);
 const im=art(id);if(!im?.complete||!im.naturalWidth)return;
 if(id.startsWith('fl-')){g.drawImage(im,x,y,width,height);return}
 const tile=g.createPattern(im,'repeat');if(!tile)return;
 g.save();g.translate(x,y);g.scale(.4,.4);g.fillStyle=tile;g.fillRect(0,0,width/.4,height/.4);g.restore();
}
function drawRoom(g,room,me){
 const wall=WALL[room.wall]?room.wall:'sky',floor=FLOOR[room.floor]?room.floor:'wood',slots=room.slots||{};
 redrawWhenReady(g.canvas,['wp-'+wall,'fl-'+floor,...Object.values(slots).filter(id=>SIZE[id])],()=>{
  g.imageSmoothingEnabled=true;
  paintSurface(g,'wp-'+wall,0,0,360,130,WALL[wall][0]);
  paintSurface(g,'fl-'+floor,0,130,360,80,FLOOR[floor][0]);
  rect(g,0,126,360,5,'rgba(0,0,0,.18)');
  const order=['W0','W1','W2','F4','F2','F0','F1','F3'];
  for(const k of order)if(slots[k]&&SIZE[slots[k]])drawItem(g,slots[k],...SLOTS[k]);
  if(me?.draw)me.draw(g);
 });
}
function chibi(g,x,y,look,s){s=s||1;if(g.save){g.save();g.translate(x,y);g.scale(s,s)}const L=look||{};
 if(L.style==='cat'){circ(g,0,-14,13,L.hair);circ(g,0,-32,12,L.hair);g.fillStyle=L.hair;g.beginPath();g.moveTo(-10,-40);g.lineTo(-12,-52);g.lineTo(-3,-43);g.fill();g.beginPath();g.moveTo(10,-40);g.lineTo(12,-52);g.lineTo(3,-43);g.fill();circ(g,-4,-33,1.8,'#111');circ(g,4,-33,1.8,'#111');rect(g,12,-12,14,4,L.hair)}
 else{rect(g,-6,-10,5,10,'#333');rect(g,1,-10,5,10,'#333');rect(g,-9,-26,18,17,L.shirt||'#3a7ad8');circ(g,0,-36,13,'#ffdcb8');
  const h=L.hair||'#3a2418';if(L.style==='long'){rect(g,-14,-46,28,9,h);rect(g,-15,-42,6,20,h);rect(g,9,-42,6,20,h)}else if(L.style==='pony'){rect(g,-14,-47,28,9,h);circ(g,14,-40,6,h);rect(g,15,-38,4,14,h)}else if(L.style==='bob'){rect(g,-15,-47,30,10,h);rect(g,-15,-40,6,12,h);rect(g,9,-40,6,12,h)}else if(L.style==='perm'){for(const [a,b] of [[-10,-46],[0,-50],[10,-46],[-13,-38],[13,-38]])circ(g,a,b,6,h)}else if(L.style==='buzz'){rect(g,-13,-48,26,5,h)}else{rect(g,-14,-48,28,8,h);rect(g,-14,-42,5,6,h)}
  circ(g,-4,-35,1.8,'#111');circ(g,4,-35,1.8,'#111');rect(g,-3,-29,6,1.5,'#c05050');circ(g,-8,-31,2.4,'rgba(255,120,120,.35)');circ(g,8,-31,2.4,'rgba(255,120,120,.35)')}
 if(g.restore)g.restore()}
function scene(g,type,W0,H0,seed){seed=seed||1;const R=n=>{seed=(seed*16807)%2147483647;return (seed%1000)/1000*n};
 const grad=(a,b)=>{const gr=g.createLinearGradient?g.createLinearGradient(0,0,0,H0):null;if(gr){gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr}else g.fillStyle=a;g.fillRect(0,0,W0,H0)};
 const cx=W0/2,cy=H0/2;
 switch(type){
  case 'stage':grad('#1a0a2a','#4a1a4a');for(let i=0;i<5;i++){g.globalAlpha=.35;g.fillStyle=['#ff4ad8','#4ad8ff','#ffe24a'][i%3];g.beginPath();g.moveTo(10+i*W0/5,0);g.lineTo(i*W0/5-10,H0*.75);g.lineTo(i*W0/5+40,H0*.75);g.fill();g.globalAlpha=1}rect(g,0,H0*.75,W0,H0*.25,'#2a1a2a');for(let i=0;i<4;i++)circ(g,W0*.3+i*W0*.13,H0*.6,5,'#ffdcb8');for(let i=0;i<14;i++)circ(g,R(W0),H0*.92,6,'#111');break;
  case 'sky':grad('#ff9a5a','#ffd8a0');circ(g,W0*.7,H0*.62,H0*.16,'#fff2b0');rect(g,0,H0*.72,W0,H0*.28,'#5a4a6a');for(let i=0;i<6;i++)rect(g,i*W0/6+4,H0*.62-R(H0*.2),W0/8,H0,'#4a3a5a');break;
  case 'sea':grad('#7ac8ff','#3a8ad8');rect(g,0,H0*.55,W0,H0*.45,'#2a6ab8');for(let i=0;i<6;i++)rect(g,R(W0),H0*.6+R(H0*.3),18,2,'#bfe6ff');rect(g,0,H0*.85,W0,H0*.15,'#f0d8a0');break;
  case 'night':grad('#030818','#14244a');for(let i=0;i<40;i++)rect(g,R(W0),R(H0*.8),1.5,1.5,'#fff');circ(g,W0*.5,H0*.2,2.6,'#fff6c8');rect(g,0,H0*.82,W0,H0*.18,'#0a0a14');break;
  case 'flower':grad('#bfe6ff','#e8f8ff');rect(g,0,H0*.6,W0,H0*.4,'#5aab4a');for(let i=0;i<7;i++){const x=12+i*(W0-24)/6,y=H0*.55+R(H0*.2);rect(g,x-1,y,2,H0*.3,'#3a7a2a');for(let k=0;k<5;k++)circ(g,x+Math.cos(k*1.26)*6,y+Math.sin(k*1.26)*6,5,'#ff5a7a');circ(g,x,y,3,'#ffd23f')}break;
  case 'cat':grad('#ffe8c8','#ffd0a0');rect(g,0,H0*.7,W0,H0*.3,'#c89a6a');circ(g,cx,H0*.62,H0*.22,'#f2b46a');circ(g,cx,H0*.38,H0*.17,'#f2b46a');g.fillStyle='#f2b46a';g.beginPath();g.moveTo(cx-H0*.14,H0*.28);g.lineTo(cx-H0*.17,H0*.1);g.lineTo(cx-H0*.03,H0*.24);g.fill();g.beginPath();g.moveTo(cx+H0*.14,H0*.28);g.lineTo(cx+H0*.17,H0*.1);g.lineTo(cx+H0*.03,H0*.24);g.fill();rect(g,cx-9,H0*.38,6,2,'#111');rect(g,cx+3,H0*.38,6,2,'#111');circ(g,cx,H0*.44,2,'#d05a5a');break;
  case 'pc':grad('#2a2a3a','#4a4a5a');for(let i=0;i<4;i++){const x=8+i*(W0-16)/4;rect(g,x,H0*.3,(W0-16)/4-8,H0*.32,'#ddd');rect(g,x+3,H0*.33,(W0-16)/4-14,H0*.24,['#3a6fd8','#5aab4a','#d85a5a','#e8a83a'][i]);rect(g,x,H0*.7,(W0-16)/4-8,4,'#888')}txt(g,'PC방',cx,H0*.18,'#ffd23f',13);break;
  case 'book':grad('#5a4a3a','#3a2a1a');rect(g,W0*.1,H0*.55,W0*.8,H0*.35,'#a0703a');for(let i=0;i<6;i++)rect(g,W0*.15+i*W0*.11,H0*.3-R(8),W0*.09,H0*.26,['#e84d4d','#3a6fd8','#ffd23f','#5aab4a','#a05ab0','#fff'][i]);circ(g,W0*.82,H0*.2,8,'#fff3a0');break;
  case 'cake':grad('#ffe0ec','#ffc8dc');rect(g,cx-30,H0*.5,60,H0*.3,'#fff');rect(g,cx-30,H0*.5,60,6,'#ff9ac0');for(let i=0;i<5;i++){rect(g,cx-20+i*10,H0*.38,3,12,'#7ad0ff');circ(g,cx-18.5+i*10,H0*.35,3,'#ffb02a')}break;
  case 'food':grad('#fff3e0','#ffd8b0');circ(g,cx,H0*.6,H0*.28,'#fff');circ(g,cx,H0*.6,H0*.22,'#e8402a');for(let i=0;i<8;i++)rect(g,cx-20+R(34),H0*.48+R(H0*.2),14,6,'#ffe0c8');break;
  case 'ramen':grad('#e8f0ff','#c8d8f0');rect(g,cx-26,H0*.35,52,H0*.5,'#fff');rect(g,cx-26,H0*.35,52,10,'#e84d4d');txt(g,'라면',cx,H0*.68,'#e84d4d',13);for(let i=0;i<3;i++){g.globalAlpha=.5;circ(g,cx-10+i*10,H0*.25-i*4,6,'#fff');g.globalAlpha=1}break;
  case 'class':grad('#e8e0c8','#d8ccaa');rect(g,W0*.08,H0*.12,W0*.84,H0*.6,'#2f5a3a');txt(g,'6학년 2반',cx,H0*.36,'#fff',14);txt(g,'꿈을 향해 날아라!',cx,H0*.56,'#ffe8a0',11);rect(g,W0*.08,H0*.72,W0*.84,5,'#a0703a');break;
  case 'garden':grad('#cfe8ff','#e8f8ff');rect(g,0,H0*.55,W0,H0*.45,'#7a5232');for(let r=0;r<2;r++)for(let i=0;i<6;i++)circ(g,14+i*(W0-28)/5,H0*.66+r*H0*.17,8,'#6ac84a');break;
  case 'capsule':grad('#ffd9a0','#ffefc8');rect(g,0,H0*.7,W0,H0*.3,'#d8b880');rect(g,W0*.3,H0*.3,4,H0*.4,'#888');rect(g,W0*.66,H0*.3,4,H0*.4,'#888');rect(g,W0*.3,H0*.3,W0*.36+4,4,'#aaa');circ(g,W0*.42,H0*.62,7,'#ffdcb8');circ(g,W0*.56,H0*.62,7,'#ffdcb8');rect(g,W0*.4,H0*.66,8,14,'#ffd23f');rect(g,W0*.54,H0*.66,8,14,'#7ad0ff');txt(g,'2004.05.30',W0*.82,H0*.95,'#a05a00',9);break;
  case 'track':grad('#9fd6ff','#d8f0ff');rect(g,0,H0*.5,W0,H0*.5,'#d0603a');for(let i=0;i<4;i++)rect(g,0,H0*.58+i*H0*.1,W0,2,'#fff');rect(g,W0*.7,H0*.15,3,H0*.4,'#888');rect(g,W0*.7+3,H0*.15,26,16,'#e84d4d');txt(g,'1',W0*.7+16,H0*.15+12,'#fff',11);break;
  case 'army':grad('#cfe8c8','#9fc890');rect(g,0,H0*.6,W0,H0*.4,'#5a7a3a');rect(g,W0*.2,H0*.35,W0*.6,H0*.3,'#c8c0a0');rect(g,W0*.45,H0*.47,W0*.1,H0*.18,'#5a4a3a');rect(g,W0*.85,H0*.1,2,H0*.5,'#888');rect(g,W0*.85+2,H0*.1,20,13,'#fff');circ(g,W0*.85+12,H0*.1+6.5,3.5,'#e84d4d');break;
  case 'trophy':grad('#2a3a5a','#0a1a2a');rect(g,cx-14,H0*.25,28,H0*.3,'#ffd23f');rect(g,cx-4,H0*.55,8,H0*.15,'#ffd23f');rect(g,cx-14,H0*.7,28,6,'#c8a020');txt(g,'BEST',cx,H0*.9,'#7ad0ff',11);break;
  case 'selca':grad('#ffe8f4','#fff');g.globalAlpha=.5;circ(g,cx,cy,H0*.6,'#fff');g.globalAlpha=1;circ(g,cx,H0*.55,H0*.25,'#ffdcb8');rect(g,cx-H0*.27,H0*.25,H0*.54,H0*.14,'#3a2418');rect(g,cx-H0*.28,H0*.3,H0*.1,H0*.4,'#3a2418');rect(g,cx+H0*.18,H0*.3,H0*.1,H0*.4,'#3a2418');circ(g,cx-8,H0*.55,2.5,'#111');circ(g,cx+8,H0*.55,2.5,'#111');txt(g,'V',cx+H0*.36,H0*.8,'#ff6ab0',16);break;
  case 'ball':grad('#9fd6ff','#e8f8ff');rect(g,0,H0*.65,W0,H0*.35,'#5aab4a');circ(g,cx,H0*.55,H0*.2,'#fff');circ(g,cx,H0*.55,H0*.07,'#222');txt(g,'싸인',cx+H0*.22,H0*.4,'#e84d4d',10);break;
  default:grad('#ddd','#bbb')}}

/* ---------- A97: 같은 방 친구와 미니홈피 실시간 연동 ----------
   함께 걷기 방에 들어오면 내 미니홈피(제목, 대문 글, 기분, 미니룸, 스킨, 배경음악 이름, 다이어리 세 개, 사진첩 사진 세 장을 작게 줄인 것)를 서버에 올린다.
   같은 방 친구는 내 미니홈피를 구경하고(투데이가 오른다) 방명록, 일촌 신청, 일촌평을 남길 수 있고, 나는 그 자리에서 알림을 받는다.
   PC를 켜지 않았을 때 온 알림은 함께 걷기 채팅 기록에 한 줄 남는다. 서버 규칙은 server_minihome.js에 있다.
   주인 확인용 비밀 열쇠는 이 브라우저에만 따로 저장한다(2006_mini_uid_v1). 남에게는 열쇠를 바꾼 홈 번호만 보인다. */
const UID_KEY='2006_mini_uid_v1',SAVE_KEY='2006_xp_desktop_v1';
const MN={active:null,src:null,subscribed:false,tries:0,uid:'',list:[],me:null,homes:{},gb:{},ph:{},jobs:null,last:'',q:{read:[],visit:[],pub:[],write:[]},qt:{read:0,visit:0,pub:0,write:0}};
const QGAP={read:140,visit:330,pub:640,write:780};
const mnet=()=>w.A25NET;
const mready=()=>{const n=mnet();return !!(n&&n.state&&n.state.ready)};
const byteLen=s=>{let n=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);n+=c<128?1:c<2048?2:(c>=55296&&c<=56319?(i++,4):3)}return n};
const IMG_RE=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
function randUid(){const abc='abcdefghijklmnopqrstuvwxyz0123456789';let out='';try{if(w.crypto&&w.crypto.getRandomValues){const a=new Uint8Array(20);w.crypto.getRandomValues(a);for(const x of a)out+=abc[x%36];return out}}catch(_){}for(let i=0;i<20;i++)out+=abc[Math.floor(Math.random()*36)];return out}
function myUid(){if(MN.uid)return MN.uid;let u='';try{u=w.localStorage.getItem(UID_KEY)||''}catch(_){}if(!/^[a-z0-9]{16,32}$/.test(u)){u=randUid();try{w.localStorage.setItem(UID_KEY,u)}catch(_){}}MN.uid=u;return u}
/* 서버는 같은 종류의 요청을 너무 촘촘하게 받지 않으므로 종류마다 줄을 세워 조금씩 간격을 두고 보낸다 */
function mq(kind,o){if(!mready())return false;const msg=Object.assign({type:'mini'},o);if(byteLen(JSON.stringify(msg))>8000)return false;MN.q[kind].push(msg);mpump(kind);return true}
function mpump(kind){if(MN.qt[kind])return;const msg=MN.q[kind].shift();if(!msg)return;if(mready())try{mnet().send(msg)}catch(_){}
 if(typeof w.setTimeout==='function')MN.qt[kind]=w.setTimeout(()=>{MN.qt[kind]=0;mpump(kind)},QGAP[kind]);else mpump(kind)}
function readSaved(){try{const raw=w.localStorage&&w.localStorage.getItem(SAVE_KEY);const s=raw?JSON.parse(raw):null;if(!s||typeof s!=='object')return null;return {m:s.mini&&typeof s.mini==='object'&&!Array.isArray(s.mini)?s.mini:{},pics:s.xp&&Array.isArray(s.xp.pics)?s.xp.pics:[]}}catch(_){return null}}
function pubPayload(m){const room=m.room&&typeof m.room==='object'?m.room:{},today=Number.isFinite(m.today)?m.today:3,bgm=m.bgm&&ITEM[m.bgm]?ITEM[m.bgm].name:'';
 return {op:'pub',uid:myUid(),prof:{title:String(m.title||''),intro:String(m.intro||''),mood:String(m.mood||'행복'),bgm,skin:String(m.skin||'sky'),wall:String(room.wall||'sky'),floor:String(room.floor||'wood'),slots:room.slots&&typeof room.slots==='object'?room.slots:{},base:2006+today,today0:today},
  diary:(Array.isArray(m.diary)?m.diary:[]).slice(-3).map(d=>({d:String(d&&d.d||TODAY),w:String(d&&d.w||'맑음'),t:String(d&&d.t||'').slice(0,300)}))}}
/* 사진첩 최근 세 장. 칸 0이 가장 최근 사진이다. sig로 이미 올린 사진인지 알아본다 */
function photoJobs(m,pics){const list=(Array.isArray(m.photos)?m.photos:[]).slice(-3).reverse(),jobs=[];
 for(let i=0;i<3;i++){const p=list[i],pic=p&&pics.find(x=>x&&x.id===p.pic);jobs.push(pic?{i,sig:String(p.pic+'|'+(p.cap||'')).slice(0,40),url:pic.url,cap:String(p.cap||'').slice(0,40)}:{i,sig:'',url:'',cap:''})}return jobs}
function shrink(url,cb){try{if(!w.Image||!w.document||!w.document.createElement||typeof url!=='string'||!url){cb('');return}const im=new w.Image();
 im.onload=()=>{try{const W0=im.naturalWidth||im.width||160,H0=im.naturalHeight||im.height||120;for(const [mx,q] of [[160,.62],[136,.56],[112,.5],[96,.45],[80,.4]]){const sc=Math.min(1,mx/Math.max(W0,H0)),cw=Math.max(1,Math.round(W0*sc)),ch=Math.max(1,Math.round(H0*sc));const cv=w.document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cw,ch);g.drawImage(im,0,0,cw,ch);const d=cv.toDataURL('image/jpeg',q);if(typeof d==='string'&&d.length<=5600&&IMG_RE.test(d)){cb(d);return}}cb('')}catch(_){cb('')}};
 im.onerror=()=>cb('');im.src=url}catch(_){cb('')}}
function publish(force){if(!mready())return false;const src=(MN.src?MN.src():readSaved())||{m:{},pics:[]};const p=pubPayload(src.m||{}),key=JSON.stringify(p);MN.jobs=photoJobs(src.m||{},src.pics||[]);
 if(!force&&key===MN.last){syncPhotos();return true}MN.last=key;mq('pub',p);return true}
function syncPhotos(){const me=MN.me,jobs=MN.jobs;if(!me||!jobs)return;MN.jobs=null;for(const j of jobs){const have=(Array.isArray(me.ph)&&me.ph[j.i])||'';if(have===j.sig)continue;
 if(!j.sig){mq('pub',{op:'photo',i:j.i,data:''});continue}shrink(j.url,data=>{if(data)mq('pub',{op:'photo',i:j.i,data,cap:j.cap,sig:j.sig})})}}
const NOTE={visit:n=>n.n+'님이 내 미니홈피에 놀러 왔어요! (TODAY +1)',gb:n=>n.n+'님이 내 방명록에 글을 남겼어요: '+n.t,say:n=>n.n+'님이 내 미니홈피에 일촌평을 남겼어요: '+n.t,
 ask:n=>n.n+'님이 일촌을 신청했어요 (일촌명: '+n.nick+'). 미니홈피 첫 화면에서 수락할 수 있어요.',ilchon:n=>n.n+'님과 일촌이 되었어요! (일촌명: '+n.nick+')',gbrep:n=>n.n+'님이 내 방명록 글에 답글을 달았어요: '+n.t};
function noteOf(m){const n=m.op==='note'?m:m.note;return n&&NOTE[n.k]?{k:n.k,n:String(n.n||'친구').slice(0,14),t:String(n.t||'').slice(0,100),nick:String(n.nick||'').slice(0,8),hid:typeof n.hid==='string'?n.hid:''}:null}
const noteText=m=>{const n=noteOf(m);return n?NOTE[n.k](n):''};
function mWorldLog(text){try{const d=w.document,log=d&&d.getElementById&&d.getElementById('a25Log');if(!log)return;const row=d.createElement('div');row.className='a25-line chat';const b=d.createElement('strong');b.textContent='[미니홈피]';const sp=d.createElement('span');sp.textContent=' '+text;row.append(b,sp);log.append(row);log.scrollTop=log.scrollHeight}catch(_){}}
function mReset(){MN.me=null;MN.list=[];MN.homes={};MN.gb={};MN.ph={};MN.last='';MN.jobs=null;for(const k of Object.keys(MN.q))MN.q[k].length=0}
function mReceive(m){if(!m||typeof m!=='object')return;
 if(m.type==='welcome'){mReset();if(typeof w.setTimeout==='function')w.setTimeout(()=>publish(true),450)}
 else if(m.type==='network_close')mReset();
 else if(m.type==='mini'){
  if(m.op==='list'&&Array.isArray(m.list))MN.list=m.list.filter(r=>r&&typeof r.hid==='string');
  else if(m.op==='me'&&typeof m.hid==='string'){MN.me=m;syncPhotos()}
  else if(m.op==='home'&&typeof m.hid==='string')MN.homes[m.hid]=m;
  else if(m.op==='gb'&&typeof m.hid==='string')MN.gb[m.hid]=m;
  else if(m.op==='ph'&&typeof m.hid==='string')MN.ph[m.hid+':'+m.i]={data:typeof m.data==='string'&&IMG_RE.test(m.data)?m.data:'',sig:String(m.sig||''),cap:String(m.cap||'')};
  else if(m.op==='gone'){delete MN.homes[m.hid];delete MN.gb[m.hid]}
  if(!MN.active){const t=noteText(m);if(t)mWorldLog(t)}}
 if(MN.active)MN.active(m)}
function mEnsure(){if(MN.subscribed)return true;const n=mnet();if(!n||typeof n.subscribe!=='function')return false;MN.subscribed=true;n.subscribe(mReceive);if(mready()&&!MN.active&&typeof w.setTimeout==='function')w.setTimeout(()=>{if(!MN.me)publish(true)},300);return true}
(function waitMini(){if(mEnsure()||MN.tries++>40)return;if(typeof w.setTimeout==='function')w.setTimeout(waitMini,1500)})();
/* 같은 방 친구가 지금 어디 있는지(접속 번호로 함께 걷기 친구 목록에서 찾는다) */
function whereOf(row){if(!row||!row.on)return '지금은 방에 없어요';const n=mnet(),p=n&&Array.isArray(n.peers)?n.peers.find(x=>x&&x.id===row.id):null;const scene=p?p.scene:row.pc?'pcroom':'';return scene==='pcroom'?'PC방에서 접속 중':'동네에 있어요'}
const ago=at=>{const m=Math.floor((Date.now()-Number(at||0))/6e4);if(!(m>=1))return '방금 전';if(m<60)return m+'분 전';const h=Math.floor(m/60);return h<24?h+'시간 전':Math.floor(h/24)+'일 전'};

/* ---------- 미니홈피 창 ---------- */
function attach(X){
 const {E,B}=X;let alive=true,win=null;const timers=new Set(),seen=new Set();
 const later=(fn,ms)=>{const id=w.setTimeout(()=>{timers.delete(id);if(alive)fn()},ms);timers.add(id);return id};
 const view={who:'me',tab:'home',sel:null};
 /* A97: 같은 방 친구 미니홈피. view.who가 'r:홈번호'이면 진짜 친구의 홈이다 */
 const seenReal=new Set();let pubTimer=0;
 const isReal=who=>typeof who==='string'&&who.slice(0,2)==='r:';
 const realHid=()=>isReal(view.who)?view.who.slice(2):'';
 const myHid=()=>(MN.me&&MN.me.hid)||'';
 const liveRow=hid=>MN.list.find(r=>r.hid===hid);
 const liveFriends=()=>MN.list.filter(r=>r.hid!==myHid());
 function changed(){if(!mready())return;if(pubTimer)w.clearTimeout(pubTimer);pubTimer=later(()=>{pubTimer=0;publish(false)},900)}
 const save=()=>{X.save();changed()};
 function S(){const s=X.saved;if(!s.mini||typeof s.mini!=='object'||Array.isArray(s.mini))s.mini={};const m=s.mini;
  const num=(k,v)=>{if(!Number.isFinite(m[k])||m[k]<0)m[k]=v};num('dotori',10);num('today',3);num('earned',0);
  for(const k of ['items','diary','photos','gbMine'])if(!Array.isArray(m[k]))m[k]=[];
  for(const k of ['ilchon','visited','gbTo','says','rewards','pending'])if(!m[k]||typeof m[k]!=='object'||Array.isArray(m[k]))m[k]={};
  if(!m.room||typeof m.room!=='object'||Array.isArray(m.room))m.room={wall:'sky',floor:'wood',slots:{F2:'desk',W0:'window'}};if(!m.room.slots||typeof m.room.slots!=='object')m.room.slots={};
  for(const k of Object.keys(m.room.slots))if(!SLOTS[k]||!(ITEM[m.room.slots[k]]||['desk','window'].includes(m.room.slots[k])))delete m.room.slots[k];
  if(!m.ilchon.sujin&&!m.rewards.start){m.ilchon.sujin='동네친구';m.rewards.start=1}
  if(typeof m.title!=='string')m.title='';if(typeof m.intro!=='string')m.intro='';if(typeof m.mood!=='string')m.mood='행복';if(typeof m.bgm!=='string')m.bgm='';if(typeof m.skin!=='string')m.skin='sky';
  m.items=m.items.filter(id=>ITEM[id]);for(const id of ['desk','window','wp-sky','fl-wood'])if(!m.items.includes(id))m.items.push(id);
  return m}
 /* 이름: PC에서 정한 별명이 없으면 함께 걷기에서 쓰는 이름(같은 방 친구들이 보는 이름) */
 const roomName=()=>{try{const el=w.document&&w.document.getElementById&&w.document.getElementById('a25Name');const v=el&&String(el.value||'').trim();if(v)return v;return String((w.localStorage&&w.localStorage.getItem('2006_a25_name'))||'').trim()}catch(_){return ''}};
 const nick=()=>String((X.saved.xp&&X.saved.xp.nick)||(MN.me&&mready()&&MN.me.n)||roomName()||'게스트').slice(0,12);
 const toast=(title,text)=>{X.ui&&X.ui.toast&&X.ui.toast({title,text,icon:'info',ms:4200})};
 function give(n,why,flag){const m=S();if(flag){if(m.rewards[flag])return false;m.rewards[flag]=1}m.dotori+=n;m.earned+=n;X.save();toast('도토리 +'+n,why+' (지금 '+m.dotori+'개)');return true}
 function open(){win=X.windowFor('minihome','미니홈피');if(!win.node.classList.contains('mh-win')){win.node.classList.add('mh-win');win.node.style.width='min(880px,97%)';win.node.style.height='min(640px,97%)';win.node.style.left='2%';win.node.style.top='1%'}render();return win}
 function go(who,tab){view.who=who||'me';view.tab=tab||'home';view.sel=null;
  if(isReal(view.who)){const hid=realHid();if(hid===myHid()){view.who='me';return render()}mq('read',{op:'get',hid});if(view.tab==='guest')mq('read',{op:'gb',hid,page:1});
   if(!seenReal.has(hid)){seenReal.add(hid);mq('visit',{op:'visit',hid});const r=liveRow(hid);give(1,(r?r.n:'같은 방 친구')+'님 미니홈피 첫 방문 (같은 방 친구)','visit-r-'+hid)}return render()}
  if(view.who==='me'&&view.tab==='guest'&&myHid())mq('read',{op:'gb',hid:myHid(),page:1});
  if(view.who!=='me'){const m=S(),f=FR[view.who];if(f&&!seen.has(f.id)){seen.add(f.id);m.visited[f.id]=(m.visited[f.id]||0)+1;X.save();if(!m.rewards['visit-'+f.id])give(1,f.name+'님 미니홈피 첫 방문 (파도타기)','visit-'+f.id)}}render()}
 const ownerName=()=>view.who==='me'?nick():FR[view.who].name;
 function render(){if(!win||!X.windows.get('minihome'))return;if(isReal(view.who))return renderReal();const m=S(),me=view.who==='me',f=me?null:FR[view.who];if(!me&&!f){view.who='me';return render()}
  const skin=me?(m.skin||'sky'):f.skin;win.caption.textContent=(me?'♡ '+nick()+'님의 미니홈피 ♡':f.name+'님의 미니홈피')+' - Microsoft Internet Explorer';
  const c=win.content;c.replaceChildren();const root=E('div','mh-root mh-skin-'+skin);c.append(root);
  const top=E('div','mh-top'),cnt=E('span','mh-count');const real=me&&MN.me&&mready()?Number(MN.me.real)||0:0,today=me?m.today+real:f.today+(seen.has(f.id)?1:0),total=me?2006+m.today+real:f.total+(m.visited[f.id]||0);cnt.append(E('b','','TODAY '),E('span','',String(today)),E('b','',' | TOTAL '),E('span','',total.toLocaleString('ko-KR')));
  top.append(cnt,E('strong','mh-title',me?(m.title||'♡ '+nick()+'님의 미니홈피 ♡'):f.title));root.append(top);
  const book=E('div','mh-book'),left=E('aside','mh-left'),main=E('main','mh-main'),tabs=E('nav','mh-tabs');book.append(left,main,tabs);root.append(book);
  /* 왼쪽: 대문 사진과 프로필 */
  const artSet=f&&NPC_ART[f.id],profile=artSet&&(artSet.profile||(artSet.album.includes(f.cover)&&f.id+'-'+f.cover));
  if(profile)left.append(artImage(profile,'mh-cover mh-npc-cover',f.name+'의 프로필 사진'));
  else{
  const cov=E('canvas','mh-cover');cov.width=170;cov.height=130;left.append(cov);const g=cov.getContext&&cov.getContext('2d');
  if(g){try{if(me){const pic=m.cover&&X.shell&&X.shell.pics?X.shell.pics().find(p=>p.id===m.cover):null;if(pic&&w.Image){const im=new w.Image();im.onload=()=>{g.drawImage(im,0,0,170,130)};im.src=pic.url;rect(g,0,0,170,130,'#eee')}else{scene(g,'sky',170,130,7);if(w.CHARART&&w.CHARART.drawRemote){g.save();g.translate(85,124);g.scale(1.8,1.8);w.CHARART.drawRemote(g,w.CHARART.selected,0,0,1,'stand','mh-cover');g.restore()}}}else{scene(g,f.cover,170,130,f.id.length*97);}}catch(_){}}
  }
  left.append(E('p','mh-intro',me?(m.intro||'안녕하세요 ^^\n미니홈피 꾸미는 중이에요!\n일촌 신청 환영~'):f.intro));
  const mood=E('p','mh-mood','오늘의 기분: '+moodFace(me?m.mood:f.mood));left.append(mood);
  const nm=E('p','mh-name');nm.append(E('b','',me?nick():f.name+(f.nick?' ('+f.nick+')':'')),E('span','',me?' ♡':' '+f.sex),E('small','',me?'동네 PC방에서 접속 중':f.info));left.append(nm);
  if(!me){const st=E('p','mh-rel',m.ilchon[f.id]?'★ 나와 일촌 (일촌명: '+m.ilchon[f.id]+')':m.pending[f.id]?'일촌 신청 중...':'일촌이 아니에요');left.append(st);
   if(f.away)left.append(E('p','mh-away',f.away));
   if(!m.ilchon[f.id]&&!m.pending[f.id])left.append(B('일촌 신청',()=>askIlchon(f),'mh-btn'));}
  const wave=E('select','mh-wave');wave.setAttribute('aria-label','일촌 파도타기');const first=E('option','','일촌 파도타기 ▼');first.value='';wave.append(first);
  const list=me?Object.entries(m.ilchon).filter(([id])=>FR[id]).map(([id,n])=>[id,n]):f.ilchon.filter(([id])=>FR[id]);
  if(me)waveLive(wave);
  for(const [id,n] of list){const o=E('option','',FR[id].name+' ('+n+')');o.value=id;wave.append(o)}if(!me){const o=E('option','','◀ 내 미니홈피로');o.value='me';wave.append(o)}
  wave.addEventListener('change',()=>{const v=wave.value;if(v)go(v,'home')});left.append(wave);
  if(!me)left.append(B('◀ 내 미니홈피로',()=>go('me','home'),'mh-btn small'));
  if(me)leftLive(left);
  if(!me&&f.homepage&&X.navigate)left.append(B('개인 홈페이지 가기',()=>X.navigate({type:'home',portal:'w-hompy'}),'mh-btn small'));
  /* 오른쪽 메뉴 */
  const T=me?[['home','홈'],['profile','프로필'],['diary','다이어리'],['photo','사진첩'],['guest','방명록'],['room','미니룸'],['shop','선물가게']]:[['home','홈'],['profile','프로필'],['diary','다이어리'],['photo','사진첩'],['guest','방명록']];
  for(const [id,label] of T)tabs.append(B(label,()=>{view.tab=id;view.sel=null;if(me&&id==='guest'&&myHid())mq('read',{op:'gb',hid:myHid(),page:1});render()},'mh-tab'+(view.tab===id?' on':'')));
  /* BGM */
  const bgm=me?(m.bgm&&ITEM[m.bgm]?ITEM[m.bgm].name:''):f.bgm;const bar=E('div','mh-bgm');bar.append(E('b','','♬ BGM'),E('span','',bgm?bgm:'배경음악이 없어요 (선물가게에서 고를 수 있어요)'),E('i','mh-eq'));root.append(bar);
  if(me){const dot=E('div','mh-dotori');dot.append(E('b','','내 도토리 '+m.dotori+'개'),B('도토리 충전',()=>X.ui&&X.ui.dialog?X.ui.dialog({title:'도토리 충전',icon:'warn',text:'휴대폰 결제는 부모님 동의가 필요해요. PC방에서는 결제할 수 없어요 ㅠㅠ\n\n도토리는 파도타기로 처음 놀러 간 집(+1), 일촌 맺기(+2), 방명록 남기기(+1), 다이어리 쓰기(+1), 사진 올리기(+2)로 모을 수 있어요.'}):0,'mh-btn small'));root.append(dot)}
  const tab=me&&['room','shop'].includes(view.tab)?view.tab:view.tab;
  if(tab==='home')homeTab(main,m,f);else if(tab==='profile')profileTab(main,m,f);else if(tab==='diary')diaryTab(main,m,f);else if(tab==='photo')photoTab(main,m,f);else if(tab==='guest')guestTab(main,m,f);else if(tab==='room'&&me)roomTab(main,m);else if(tab==='shop'&&me)shopTab(main,m);else homeTab(main,m,f)}
 function artImage(id,cls,alt){
  const im=E('img',cls);im.src=artUrl(id);im.alt=alt;im.decoding='async';return im;
 }
 function roomCanvas(parent,room,me){const cv=E('canvas','mh-room');cv.width=360;cv.height=210;parent.append(cv);const g=cv.getContext&&cv.getContext('2d');if(!g)return cv;
  try{drawRoom(g,room,{draw(g){if(me){if(w.CHARART&&w.CHARART.drawRemote){g.save();g.translate(178,204);g.scale(1.25,1.25);w.CHARART.drawRemote(g,w.CHARART.selected,0,0,1,'stand','mh-room');g.restore()}else chibi(g,178,204,{hair:'#3a2418',shirt:'#3a7ad8'})}else if(room.look)chibi(g,178,204,room.look,1.1)}})}catch(_){}return cv}
 function homeTab(main,m,f){const me=!f;main.append(E('h3','mh-h','미니룸'));
  if(me)roomCanvas(main,{...m.room,night:m.room.wall==='night'},true);else if(NPC_ART[f.id])main.append(artImage(f.id+'-room','mh-room mh-npc-room',f.name+'의 미니룸'));else roomCanvas(main,{...f.room,look:f.look},false);
  const news=E('section','mh-box');news.append(E('h4','','최근 소식'));
  if(me){const d=m.diary[m.diary.length-1],p=m.photos[m.photos.length-1];news.append(E('p','','다이어리 '+m.diary.length+'개 · 사진 '+m.photos.length+'장 · 방명록 '+((X.saved.guestbook||[]).length+m.gbMine.length+(MN.me&&mready()?Number(MN.me.gbn)||0:0))+'개'));if(d)news.append(E('p','mh-muted','최근 다이어리: '+d.t.slice(0,30)));if(p)news.append(E('p','mh-muted','최근 사진: '+p.cap));if(!d&&!p)news.append(E('p','mh-muted','아직 글이 없어요. 다이어리를 써 보세요!'))}
  else{news.append(E('p','','다이어리 '+f.diary.length+'개 · 사진 '+f.photos.length+'장 · 방명록 '+(f.guest.length+(m.gbTo[f.id]||[]).length)+'개'),E('p','mh-muted','최근 다이어리: '+f.diary[0][2].slice(0,34)+'...'))}
  main.append(news);
  if(me)liveBoxes(main);
  const says=E('section','mh-box mh-says');says.append(E('h4','','일촌평'));
  if(me){const live=MN.me&&mready()?MN.me.says||[]:[];for(const x of live)says.append(sayLine(x.n,x.nick,x.t,false,ago(x.at)));const ids=Object.keys(m.ilchon).filter(id=>FR[id]);for(const id of ids)says.append(sayLine(FR[id].name,m.ilchon[id],FR[id].toMe));if(!ids.length&&!live.length)says.append(E('p','mh-muted','일촌을 맺으면 일촌평이 달려요.'))}
  else{for(const [id,n,t] of f.says)says.append(sayLine(FR[id]?FR[id].name:id,n,t));const mine=m.says[f.id];if(mine)says.append(sayLine(nick(),m.ilchon[f.id]||'방문자',mine,true));
   if(m.ilchon[f.id]){const fm=E('form','mh-form'),inp=E('input');inp.maxLength=40;inp.placeholder='일촌평 한 줄 (40자)';inp.setAttribute('aria-label','일촌평');const sb=B('남기기',()=>{},'mh-btn small');sb.type='submit';fm.append(inp,sb);fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(inp.value||'').trim().slice(0,40);if(!t)return;m.says[f.id]=t;X.save();render()});says.append(fm)}else says.append(E('p','mh-muted','일촌만 일촌평을 쓸 수 있어요.'))}
  main.append(says)}
 function sayLine(name,ilchon,text,mine,when){const p=E('p','mh-say'+(mine?' mine':'')+(when?' live':''));p.append(E('b','','('+ilchon+') '+name),E('span','',' : '+text));if(when)p.append(E('small','mh-ago',' '+when));return p}
 function profileTab(main,m,f){const me=!f;main.append(E('h3','mh-h','프로필'));
  if(!me){const box=E('section','mh-box');for(const [a,b] of [['이름',f.name+(f.nick?' ('+f.nick+')':'')],['소개',f.info],['기분',moodFace(f.mood)],['배경음악',f.bgm],['일촌',f.ilchon.length+'명']]){const p=E('p','');p.append(E('b','',a+' '),E('span','',b));box.append(p)}box.append(E('p','mh-intro',f.intro));main.append(box);return}
  const box=E('form','mh-box mh-profile'),title=E('input'),intro=E('textarea'),mood=E('select'),cover=E('select');
  title.maxLength=30;title.value=m.title;title.placeholder='미니홈피 제목 (예: ♡ 나의 작은 방 ♡)';title.setAttribute('aria-label','미니홈피 제목');intro.maxLength=120;intro.value=m.intro;intro.placeholder='대문 글 (세 줄 정도)';intro.setAttribute('aria-label','대문 글');
  for(const [x,y] of MOODS){const o=E('option','',x+' '+y);o.value=x;o.selected=x===m.mood;mood.append(o)}mood.value=m.mood;mood.setAttribute('aria-label','오늘의 기분');
  const pics=X.shell&&X.shell.pics?X.shell.pics():[];const o0=E('option','','내 캐릭터 (기본)');o0.value='';cover.append(o0);for(const p of pics){const o=E('option','','내 그림: '+p.name);o.value=p.id;o.selected=p.id===m.cover;cover.append(o)}cover.value=m.cover||'';cover.setAttribute('aria-label','대문 사진');
  const lab=(t,n)=>{const l=E('label','mh-field');l.append(E('b','',t),n);return l};
  const sb=B('저장',()=>{},'mh-btn');sb.type='submit';box.append(lab('제목',title),lab('대문 글',intro),lab('기분',mood),lab('대문 사진',cover),E('p','mh-muted',pics.length?'대문 사진은 그림판에서 저장한 ‘내 그림’ 중에서 고를 수 있어요.':'그림판에서 그림을 저장하면 대문 사진으로 쓸 수 있어요.'),sb);
  box.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();m.title=String(title.value||'').trim().slice(0,30);m.intro=String(intro.value||'').trim().slice(0,120);m.mood=MOODS.some(x=>x[0]===mood.value)?mood.value:'행복';m.cover=pics.some(p=>p.id===cover.value)?cover.value:'';save();toast('미니홈피','프로필을 저장했어요.');render()});main.append(box)}
 function friendComment(list,cb,delay){const m=S(),ids=Object.keys(m.ilchon).filter(id=>FR[id]&&id!=='sora');const id=ids.length?ids[Math.floor(Math.random()*ids.length)]:'sujin';const f=FR[id];later(()=>{cb(f.name+'::'+f.cm[Math.floor(Math.random()*f.cm.length)]);X.save();render()},delay||1500)}
 function cmList(box,list){for(const t of list){const mm=/^([^:]{1,12})::(.*)$/.exec(t);const p=E('p','mh-cm'+(/^ㄴ/.test(t)?' nest':''));if(mm)p.append(E('b','',mm[1]),E('span','',' '+mm[2]));else p.append(E('span','',t));box.append(p)}}
 function diaryTab(main,m,f){const me=!f;main.append(E('h3','mh-h','다이어리'));
  const cal=E('div','mh-cal');cal.append(E('b','','2006년 5월'));for(let d=1;d<=31;d++){const has=me?(d===30&&m.diary.length):f.diary.some(x=>x[0].startsWith('2006.05.'+String(d).padStart(2,'0')));cal.append(E('span',(d===30?'today ':'')+(has?'has':''),String(d)))}main.append(cal);
  if(me){const fm=E('form','mh-box mh-write'),wea=E('select'),ta=E('textarea');for(const x of ['맑음','흐림','비','바람'])wea.append(Object.assign(E('option','',x),{value:x}));wea.setAttribute('aria-label','날씨');ta.maxLength=300;ta.placeholder='오늘 있었던 일을 적어 보세요 (300자)';ta.setAttribute('aria-label','다이어리');const sb=B('다이어리 쓰기',()=>{},'mh-btn');sb.type='submit';const head=E('p','');head.append(E('b','',TODAY+' '),wea);fm.append(head,ta,sb);
   fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(ta.value||'').trim().slice(0,300);if(!t)return;const entry={d:TODAY,w:wea.value||'맑음',t,cm:[]};m.diary=[...m.diary,entry].slice(-12);save();if(m.diary.length<=5)give(1,'다이어리 쓰기','diary-'+m.diary.length);friendComment(entry.cm,x=>entry.cm.push(x));render()});main.append(fm);
   for(const d of m.diary.slice().reverse()){const box=E('article','mh-box mh-entry');box.append(E('small','',d.d+' · 날씨 '+d.w),E('p','',d.t));const cm=E('div','mh-cms');cmList(cm,d.cm||[]);box.append(cm);main.append(box)}
   if(!m.diary.length)main.append(E('p','mh-muted','아직 다이어리가 없어요.'));return}
  for(const [d,wea,t] of f.diary){const box=E('article','mh-box mh-entry');box.append(E('small','',d+' · 날씨 '+wea),E('p','',t.replace('{seat}',String((X.options&&X.options.seat)||12))));main.append(box)}}
 function photoTab(main,m,f){const me=!f;main.append(E('h3','mh-h','사진첩'));
  if(me){const pics=X.shell&&X.shell.pics?X.shell.pics():[];const fm=E('form','mh-box mh-write'),sel=E('select'),cap=E('input');sel.setAttribute('aria-label','올릴 그림');for(const p of pics){const o=E('option','',p.name);o.value=p.id;sel.append(o)}cap.maxLength=40;cap.placeholder='사진 설명 (40자)';cap.setAttribute('aria-label','사진 설명');const sb=B('사진 올리기',()=>{},'mh-btn');sb.type='submit';
   if(pics.length){fm.append(E('p','mh-muted','그림판에서 저장한 ‘내 그림’을 사진첩에 올릴 수 있어요.'),sel,cap,sb);fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const pic=pics.find(p=>p.id===sel.value);if(!pic)return;const entry={pic:pic.id,cap:String(cap.value||'').trim().slice(0,40)||pic.name,cm:[]};m.photos=[...m.photos,entry].slice(-12);save();if(m.photos.length<=3)give(2,'사진 올리기','photo-'+m.photos.length);friendComment(entry.cm,x=>entry.cm.push(x),1800);render()})}
   else fm.append(E('p','mh-muted','올릴 그림이 없어요. 시작 메뉴의 그림판에서 그림을 그리고 ‘저장’하면 여기에 올릴 수 있어요.'),B('그림판 열기',()=>X.openApp('paint'),'mh-btn small'));main.append(fm);
   const grid=E('div','mh-photos');for(const p of m.photos.slice().reverse()){const card=E('figure','mh-photo');const pic=pics.find(x=>x.id===p.pic);if(pic){const im=E('img');im.src=pic.url;im.alt=p.cap;card.append(im)}else card.append(E('div','mh-xbox','×'));card.append(E('figcaption','',p.cap));const cm=E('div','mh-cms');cmList(cm,p.cm||[]);card.append(cm);grid.append(card)}main.append(grid);return}
  const grid=E('div','mh-photos'),art=NPC_ART[f.id],photos=art?art.album.map(id=>f.photos.find(p=>p[0]===id)).filter(Boolean):f.photos;
  photos.forEach(([type,cap,date,cms],i)=>{
   const card=E('figure','mh-photo');
   if(art)card.append(artImage(f.id+'-'+type,'mh-npc-photo',cap));
   else{const cv=E('canvas');cv.width=200;cv.height=140;const g=cv.getContext?.('2d');if(g)scene(g,type,200,140,i*31+f.id.length*7);card.append(cv)}
   card.append(E('figcaption','',cap),E('small','',date));
   const cm=E('div','mh-cms');cmList(cm,cms);card.append(cm);grid.append(card);
  });main.append(grid)}

 function guestTab(main,m,f){const me=!f;main.append(E('h3','mh-h','방명록'));
  const fm=E('form','mh-box mh-write'),ta=E('input');ta.maxLength=100;ta.placeholder=me?'다녀간 흔적 한 줄 (100자)':'방명록 남기기 (100자)';ta.setAttribute('aria-label','방명록');const sb=B('남기기',()=>{},'mh-btn');sb.type='submit';fm.append(ta,sb);main.append(fm);
  fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(ta.value||'').trim().slice(0,100);if(!t)return;
   if(me){X.saved.guestbook=[...(X.saved.guestbook||[]),t].slice(-15);X.save();render();return}
   const list=m.gbTo[f.id]=Array.isArray(m.gbTo[f.id])?m.gbTo[f.id]:[];const entry={t,r:''};list.push(entry);m.gbTo[f.id]=list.slice(-8);X.save();give(1,f.name+'님께 방명록 남기기','gb-'+f.id);
   if(!f.away){later(()=>{entry.r=f.replies[(list.length-1)%f.replies.length];X.save();render()},1400);later(()=>{m.gbMine=[...m.gbMine,{who:f.name,t:f.visit[Math.floor(Math.random()*f.visit.length)],at:'2006.05.30 16:3'+Math.min(2,Math.floor(Math.random()*3))}].slice(-20);m.today+=1;save();toast('미니홈피','답방! '+f.name+'님이 내 방명록에 글을 남겼어요.')},3200)}
   render()});
  if(me){const live=liveGuest(main,myHid(),true);const items=[...m.gbMine.map(x=>({who:x.who,at:x.at,t:x.t})).reverse(),...(X.saved.guestbook||[]).slice().reverse().map(t=>({who:nick(),at:'2006.05.30',t}))];for(const x of items){const p=E('div','mh-gb');p.append(E('b','',x.who),E('small','',' '+x.at),E('p','',x.t));main.append(p)}if(!items.length&&!live)main.append(E('p','mh-muted','아직 방명록이 없어요. 친구 미니홈피에 방명록을 남기면 답방이 와요!'));return}
  for(const x of (m.gbTo[f.id]||[]).slice().reverse()){const p=E('div','mh-gb mine');p.append(E('b','',nick()),E('small','',' 2006.05.30 16:32'),E('p','',x.t));if(x.r)p.append(E('p','mh-reply','ㄴ '+f.name+': '+x.r));else if(f.away)p.append(E('p','mh-reply muted','ㄴ (주인이 아직 답글을 달지 않았어요)'));main.append(p)}
  for(const [who,at,t,r] of f.guest){const p=E('div','mh-gb');p.append(E('b','',who),E('small','',' '+at),E('p','',t));if(r)p.append(E('p','mh-reply','ㄴ '+f.name+': '+r));main.append(p)}}
 function askIlchon(f){const m=S();const ask=name=>{name=String(name||'').trim().slice(0,8)||'친구';m.pending[f.id]=name;X.save();render();
   if(f.away){toast('일촌 신청','일촌 신청을 보냈어요. '+f.name+'님이 접속하면 확인할 거예요.');return}
   later(()=>{delete m.pending[f.id];m.ilchon[f.id]=f.accept||name;X.save();give(2,f.name+'님과 일촌이 되었어요 (일촌명: '+(f.accept||name)+')','ilchon-'+f.id);render()},2600)};
  if(X.ui&&X.ui.dialog){const inp=E('input');inp.maxLength=8;inp.value='친구';inp.setAttribute('aria-label','일촌명');const box=E('div','mh-ask');box.append(E('p','',f.name+'님께 일촌을 신청할까요? 서로 부를 일촌명을 적어 주세요.'),inp);X.ui.dialog({title:'일촌 신청',node:box,buttons:[['신청',()=>ask(inp.value)],['취소']]})}else ask('친구')}
 /* ---------- A97: 같은 방 친구 미니홈피 ---------- */
 const phAsked=new Map();
 function drawLook(g,look,x,y,s,id){if(w.CHARART&&w.CHARART.drawRemote&&look){g.save();g.translate(x,y);g.scale(s,s);w.CHARART.drawRemote(g,look,0,0,1,'stand',id);g.restore()}else chibi(g,x,y,{hair:'#3a2418',shirt:'#3a7ad8'},s*.7)}
 function liveBoxes(main){const box=E('section','mh-box mh-live');box.append(E('h4','','♥ 우리 방 친구 미니홈피 (실시간)'));
  if(!mready()){box.append(E('p','mh-muted','함께 걷기 방에 들어가면 같은 방 친구들의 미니홈피가 여기에 떠요. 서로 놀러 가서 방명록과 일촌평을 남기고 일촌도 맺을 수 있어요.'));main.append(box);return}
  const asks=MN.me&&Array.isArray(MN.me.asks)?MN.me.asks:[];
  if(asks.length){const ab=E('div','mh-asks');ab.append(E('b','','일촌 신청이 왔어요!'));for(const a of asks){const row=E('p','mh-ask-row');row.append(E('span','',a.n+'님 (일촌명: '+a.nick+')'),B('수락',()=>answerAsk(a,true),'mh-btn small'),B('거절',()=>answerAsk(a,false),'mh-btn small'));ab.append(row)}box.append(ab)}
  const rows=liveFriends();
  if(!MN.me)box.append(E('p','mh-muted','내 미니홈피를 같은 방에 여는 중이에요...'));
  else if(!rows.length)box.append(E('p','mh-muted','아직 같은 방에 미니홈피를 연 친구가 없어요. 친구가 방에 들어오면 바로 여기에 떠요.'));
  for(const r of rows){const il=MN.me&&(MN.me.ilchon||[]).find(x=>x.hid===r.hid);const row=B('',()=>go('r:'+r.hid,'home'),'mh-live-row'+(r.on?' on':''));row.append(E('b','',r.n+(il?' ★':'')),E('span','',r.title||'♡ '+r.n+'님의 미니홈피 ♡'),E('small','',(r.on?'● ':'○ ')+whereOf(r)+' · TODAY '+r.today));box.append(row)}
  main.append(box)}
 function leftLive(left){if(!mready())return;const rows=liveFriends(),asks=MN.me&&Array.isArray(MN.me.asks)?MN.me.asks:[];const box=E('div','mh-left-live');box.append(E('b','','♥ 같은 방 친구 '+rows.length+'명'));
  if(asks.length)box.append(B('일촌 신청 '+asks.length+'건 왔어요!',()=>{view.tab='home';render();try{const el=win.content.querySelector&&win.content.querySelector('.mh-live');if(el&&el.scrollIntoView)el.scrollIntoView({block:'nearest'})}catch(_){}},'mh-chip mh-ask-chip'));
  for(const r of rows.slice(0,8))box.append(B((r.on?'● ':'○ ')+r.n,()=>go('r:'+r.hid,'home'),'mh-chip mh-live-chip'+(r.on?' on':'')));
  if(!rows.length)box.append(E('small','mh-muted','친구가 방에 들어오면 여기에 떠요'));left.append(box)}
 function waveLive(wave){if(!mready())return;const il=MN.me&&Array.isArray(MN.me.ilchon)?MN.me.ilchon:[],ids=new Set(il.map(x=>x.hid));
  const add=(label,rows)=>{if(!rows.length)return;const g=E('optgroup');g.label=label;for(const [hid,text] of rows){const o=E('option','',text);o.value='r:'+hid;g.append(o)}wave.append(g)};
  add('같은 방 일촌',il.map(x=>[x.hid,x.n+' ('+x.nick+')'+(x.on?' ●':'')]));add('같은 방 친구 (실시간)',liveFriends().filter(r=>!ids.has(r.hid)).map(r=>[r.hid,r.n+(r.on?' ●':'')]))}
 function liveGuest(main,hid,own){if(!mready()||!hid)return 0;const g=MN.gb[hid];
  if(!g){main.append(E('p','mh-muted','같은 방 친구들이 남긴 방명록을 불러오는 중...'));return 0}
  const owner=own?(MN.me&&MN.me.n)||nick():(MN.homes[hid]&&MN.homes[hid].n)||'주인';
  for(const x of g.list){const p=E('div','mh-gb live'+(x.mine?' mine':''));p.append(E('b','',x.n),E('small','',' '+ago(x.at)+(x.from?' · 같은 방 친구':'')),E('p','',x.t));
   if(x.r)p.append(E('p','mh-reply','ㄴ '+owner+': '+x.r));
   const tools=E('div','mh-gb-tools');
   if(own){const fm=E('form','mh-form mh-rform'),inp=E('input');inp.maxLength=60;inp.placeholder=x.r?'답글 고치기 (60자)':'답글 달기 (60자)';inp.setAttribute('aria-label','답글');inp.setAttribute('data-keep','r'+x.id);const sb=B(x.r?'고치기':'답글',()=>{},'mh-btn small');sb.type='submit';fm.append(inp,sb);
    fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(inp.value||'').trim().slice(0,60);if(!t)return;inp.value='';mq('write',{op:'gbr',id:x.id,r:t,page:g.page})});tools.append(fm)}
   if(own||x.mine)tools.append(B('삭제',()=>confirmDel(hid,x,g.page),'mh-btn small'));
   if(tools.children.length)p.append(tools);main.append(p)}
  if(g.pages>1){const pg=E('div','mh-pager');for(let i=1;i<=g.pages;i++)pg.append(B(String(i),()=>mq('read',{op:'gb',hid,page:i}),'mh-chip'+(i===g.page?' on':'')));main.append(pg)}
  return g.list.length}
 function confirmDel(hid,x,page){const del=()=>mq('write',{op:'gbd',hid,id:x.id,page});if(X.ui&&X.ui.dialog)X.ui.dialog({title:'방명록 지우기',icon:'warn',text:'‘'+String(x.t).slice(0,30)+'’ 글을 지울까요?',buttons:[['지우기',del],['취소']]});else del()}
 function answerAsk(a,ok,direct){if(!ok){mq('write',{op:'ans',from:a.hid,ok:false});toast('일촌 신청',a.n+'님의 일촌 신청을 거절했어요.');return}
  const done=nk=>mq('write',{op:'ans',from:a.hid,ok:true,nick:String(nk||'').trim().slice(0,8)||a.nick});
  if(!direct&&X.ui&&X.ui.dialog){const inp=E('input');inp.maxLength=8;inp.value=a.nick;inp.setAttribute('aria-label','일촌명');const box=E('div','mh-ask');box.append(E('p','',a.n+'님의 일촌 신청을 받을까요? 서로 부를 일촌명을 고칠 수 있어요.'),inp);X.ui.dialog({title:'일촌 수락',node:box,buttons:[['수락',()=>done(inp.value)],['취소']]})}else done(a.nick)}
 function offerAsk(n){if(!n.hid||!win||!X.windows.get('minihome')||!X.ui||!X.ui.dialog)return;const a={hid:n.hid,n:n.n,nick:n.nick};
  X.ui.dialog({title:'일촌 신청',icon:'info',text:n.n+'님이 일촌을 신청했어요. (일촌명: '+n.nick+')\n지금 받을까요?',buttons:[['수락',()=>answerAsk(a,true,true)],['나중에'],['거절',()=>answerAsk(a,false)]]})}
 function askReal(h){const ask=nk=>{nk=String(nk||'').trim().slice(0,8)||'친구';mq('write',{op:'ask',hid:h.hid,nick:nk})};
  if(X.ui&&X.ui.dialog){const inp=E('input');inp.maxLength=8;inp.value='친구';inp.setAttribute('aria-label','일촌명');const box=E('div','mh-ask');box.append(E('p','',h.n+'님께 일촌을 신청할까요? 서로 부를 일촌명을 적어 주세요. 친구가 수락하면 일촌이 돼요.'),inp);X.ui.dialog({title:'일촌 신청',node:box,buttons:[['신청',()=>ask(inp.value)],['취소']]})}else ask('친구')}
 function cutReal(h){const cut=()=>mq('write',{op:'cut',hid:h.hid});if(X.ui&&X.ui.dialog)X.ui.dialog({title:'일촌 끊기',icon:'warn',text:h.n+'님과 일촌을 끊을까요? 서로 남긴 일촌평도 사라져요.',buttons:[['끊기',cut],['취소']]});else cut()}
 function needPhotos(h){for(const p of h.photos||[]){if(!p)continue;const key=h.hid+':'+p.i,c=MN.ph[key];if((!c||c.sig!==p.sig)&&phAsked.get(key)!==p.sig){phAsked.set(key,p.sig);mq('read',{op:'ph',hid:h.hid,i:p.i})}}}
 function renderReal(){const hid=realHid(),h=MN.homes[hid],row=liveRow(hid),c=win.content;
  if(!mready()){view.who='me';view.tab='home';return render()}
  c.replaceChildren();
  if(!h){const root=E('div','mh-root mh-real mh-skin-sky');root.append(E('p','mh-loading','♡ '+(row?row.n:'친구')+'님의 미니홈피를 여는 중이에요...'),B('◀ 내 미니홈피로',()=>go('me','home'),'mh-btn small'));c.append(root);win.caption.textContent=(row?row.n:'친구')+'님의 미니홈피 - Microsoft Internet Explorer';return}
  const P=h.prof||{},skin=SKIN[P.skin]?P.skin:'sky';win.caption.textContent=h.n+'님의 미니홈피 (같은 방 친구) - Microsoft Internet Explorer';
  const root=E('div','mh-root mh-real mh-skin-'+skin);c.append(root);
  const top=E('div','mh-top'),cnt=E('span','mh-count');cnt.append(E('b','','TODAY '),E('span','',String(h.today)),E('b','',' | TOTAL '),E('span','',Number(h.total||0).toLocaleString('ko-KR')));
  top.append(cnt,E('strong','mh-title',P.title||'♡ '+h.n+'님의 미니홈피 ♡'),E('em','mh-livebadge','같은 방 친구 · 실시간'));root.append(top);
  const book=E('div','mh-book'),left=E('aside','mh-left'),main=E('main','mh-main'),tabs=E('nav','mh-tabs');book.append(left,main,tabs);root.append(book);
  const cov=E('canvas','mh-cover');cov.width=170;cov.height=130;left.append(cov);const g=cov.getContext&&cov.getContext('2d');
  if(g){try{scene(g,P.wall==='night'?'night':'sky',170,130,hid.length*13+7);drawLook(g,h.look,85,124,1.8,'mh-rcover-'+hid)}catch(_){}}
  left.append(E('p','mh-intro',P.intro||'안녕하세요 ^^\n미니홈피 꾸미는 중이에요!'),E('p','mh-mood','오늘의 기분: '+moodFace(P.mood||'행복')));
  const nm=E('p','mh-name');nm.append(E('b','',h.n),E('span','',' ♡'),E('small','',(h.on?'● ':'○ ')+whereOf(h)));left.append(nm);
  const rel=h.rel||{};
  if(rel.nick)left.append(E('p','mh-rel','★ 나와 일촌 (일촌명: '+rel.nick+')'));
  else if(rel.asked)left.append(E('p','mh-rel','일촌 신청 중... (친구가 수락하면 일촌이 돼요)'));
  else if(rel.askedMe){left.append(E('p','mh-rel','이 친구가 나에게 일촌을 신청했어요!'));const a=((MN.me&&MN.me.asks)||[]).find(x=>x.hid===hid);if(a)left.append(B('일촌 수락',()=>answerAsk(a,true),'mh-btn'))}
  else{left.append(E('p','mh-rel','일촌이 아니에요'),B('일촌 신청',()=>askReal(h),'mh-btn'))}
  const wave=E('select','mh-wave');wave.setAttribute('aria-label','일촌 파도타기');const first=E('option','','일촌 파도타기 ▼');first.value='';wave.append(first);
  for(const x of h.ilchon||[]){if(x.hid===myHid())continue;const o=E('option','',x.n+' ('+x.nick+')'+(x.on?' ●':''));o.value='r:'+x.hid;wave.append(o)}
  const back=E('option','','◀ 내 미니홈피로');back.value='me';wave.append(back);wave.addEventListener('change',()=>{const v=wave.value;if(v)go(v,'home')});left.append(wave);
  left.append(B('◀ 내 미니홈피로',()=>go('me','home'),'mh-btn small'));if(rel.nick)left.append(B('일촌 끊기',()=>cutReal(h),'mh-btn small mh-cut'));
  for(const [id,label] of [['home','홈'],['profile','프로필'],['diary','다이어리'],['photo','사진첩'],['guest','방명록']])tabs.append(B(label,()=>{view.tab=id;view.sel=null;if(id==='guest')mq('read',{op:'gb',hid,page:1});render()},'mh-tab'+(view.tab===id?' on':'')));
  const bar=E('div','mh-bgm');bar.append(E('b','','♬ BGM'),E('span','',P.bgm||'배경음악이 없어요'),E('i','mh-eq'));root.append(bar);
  if(view.tab==='profile')realProfile(main,h);else if(view.tab==='diary')realDiary(main,h);else if(view.tab==='photo')realPhotos(main,h);else if(view.tab==='guest')realGuest(main,h);else realHome(main,h)}
 function realHome(main,h){const P=h.prof||{};main.append(E('h3','mh-h','미니룸'));
  const cv=E('canvas','mh-room');cv.width=360;cv.height=210;main.append(cv);const g=cv.getContext&&cv.getContext('2d');
  if(g){try{drawRoom(g,{wall:P.wall,floor:P.floor,slots:P.slots||{},night:P.wall==='night'},{draw(g){drawLook(g,h.look,178,204,1.25,'mh-rroom-'+h.hid)}})}catch(_){}}
  const news=E('section','mh-box');news.append(E('h4','','최근 소식'),E('p','','다이어리 '+(h.diary||[]).length+'개 · 사진 '+(h.photos||[]).filter(Boolean).length+'장 · 방명록 '+(h.gbn||0)+'개'));
  const d=(h.diary||[])[0];if(d)news.append(E('p','mh-muted','최근 다이어리: '+d.t.slice(0,34)+(d.t.length>34?'...':'')));main.append(news);
  const says=E('section','mh-box mh-says');says.append(E('h4','','일촌평'));for(const x of h.says||[])says.append(sayLine(x.n,x.nick,x.t,x.hid===myHid(),ago(x.at)));if(!(h.says||[]).length)says.append(E('p','mh-muted','아직 일촌평이 없어요.'));
  if(h.rel&&h.rel.nick){const fm=E('form','mh-form'),inp=E('input');inp.maxLength=40;inp.placeholder='일촌평 한 줄 (40자)';inp.setAttribute('aria-label','일촌평');const sb=B('남기기',()=>{},'mh-btn small');sb.type='submit';fm.append(inp,sb);
   fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(inp.value||'').trim().slice(0,40);if(!t)return;inp.value='';mq('write',{op:'say',hid:h.hid,t})});says.append(fm)}
  else says.append(E('p','mh-muted','일촌만 일촌평을 쓸 수 있어요.'));main.append(says)}
 function realProfile(main,h){const P=h.prof||{};main.append(E('h3','mh-h','프로필'));const box=E('section','mh-box');
  for(const [a,b] of [['이름',h.n+' (같은 방 친구)'],['지금',h.on?whereOf(h):'방에 없어요'],['기분',moodFace(P.mood||'행복')],['배경음악',P.bgm||'없음'],['일촌',(h.ilchon||[]).length+'명']]){const p=E('p','');p.append(E('b','',a+' '),E('span','',b));box.append(p)}
  box.append(E('p','mh-intro',P.intro||''));main.append(box)}
 function realDiary(main,h){main.append(E('h3','mh-h','다이어리'));const list=h.diary||[];for(const d of list){const box=E('article','mh-box mh-entry');box.append(E('small','',d.d+' · 날씨 '+d.w),E('p','',d.t));main.append(box)}if(!list.length)main.append(E('p','mh-muted','아직 다이어리가 없어요.'))}
 function realPhotos(main,h){main.append(E('h3','mh-h','사진첩'));const grid=E('div','mh-photos');let n=0;
  for(const p of h.photos||[]){if(!p)continue;n++;const card=E('figure','mh-photo'),c=MN.ph[h.hid+':'+p.i];if(c&&c.sig===p.sig&&c.data){const im=E('img');im.src=c.data;im.alt=p.cap||'사진';card.append(im)}else card.append(E('div','mh-xbox','…'));card.append(E('figcaption','',p.cap||'(설명 없음)'));grid.append(card)}
  main.append(grid);if(!n)main.append(E('p','mh-muted','아직 올린 사진이 없어요.'));needPhotos(h)}
 function realGuest(main,h){main.append(E('h3','mh-h','방명록'));const fm=E('form','mh-box mh-write'),ta=E('input');ta.maxLength=100;ta.placeholder='방명록 남기기 (100자) · 친구에게 바로 보여요';ta.setAttribute('aria-label','방명록');const sb=B('남기기',()=>{},'mh-btn');sb.type='submit';fm.append(ta,sb);main.append(fm);
  fm.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=String(ta.value||'').trim().slice(0,100);if(!t)return;ta.value='';if(mq('write',{op:'gbw',hid:h.hid,t}))give(1,h.n+'님께 방명록 남기기 (같은 방 친구)','gb-r-'+h.hid)});
  const n=liveGuest(main,h.hid,false);if(!n&&MN.gb[h.hid])main.append(E('p','mh-muted','아직 방명록이 없어요. 첫 글을 남겨 보세요!'))}
 /* 서버에서 온 소식. 고쳐 쓰던 칸의 글과 커서는 다시 그려도 남긴다 */
 function rerender(){if(!win||!X.windows.get('minihome'))return;
  if(view.who==='me'&&['profile','diary','photo','room','shop'].includes(view.tab)){countNow();return}
  const c=win.content,keep=[];let focus='',scroll=0;const fields=()=>c.querySelectorAll?[...c.querySelectorAll('input,textarea')]:[];const keyOf=el=>el.getAttribute('data-keep')||el.getAttribute('aria-label')||'';
  try{for(const el of fields()){const k=keyOf(el);if(k&&el.value)keep.push([k,el.value]);if(w.document&&w.document.activeElement===el)focus=k}const mm=c.querySelector&&c.querySelector('.mh-main');scroll=mm?mm.scrollTop:0}catch(_){}
  render();
  try{const now=fields();for(const [k,v] of keep){const el=now.find(x=>keyOf(x)===k&&!x.value);if(el)el.value=v}if(focus){const el=now.find(x=>keyOf(x)===focus);if(el&&el.focus){el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(_){}}}const mm=c.querySelector&&c.querySelector('.mh-main');if(mm)mm.scrollTop=scroll}catch(_){}}
 function countNow(){const cnt=win&&win.content&&win.content.querySelector?win.content.querySelector('.mh-count'):null;if(!cnt||view.who!=='me')return;const m=S(),real=MN.me&&mready()?Number(MN.me.real)||0:0;cnt.replaceChildren(E('b','','TODAY '),E('span','',String(m.today+real)),E('b','',' | TOTAL '),E('span','',(2006+m.today+real).toLocaleString('ko-KR')))}
 function onMini(m){if(!alive)return;
  if(m.type==='welcome'){later(rerender,900);return}
  if(m.type==='network_close'){if(isReal(view.who)){view.who='me';view.tab='home'}rerender();return}
  if(m.type!=='mini')return;const hid=realHid();
  switch(m.op){
   case 'list':{if(hid){const r=liveRow(hid),h=MN.homes[hid];if(r&&h&&h.v!==r.v){mq('read',{op:'get',hid});if(view.tab==='guest')mq('read',{op:'gb',hid,page:(MN.gb[hid]&&MN.gb[hid].page)||1})}}rerender();break}
   case 'me':{const n=noteOf(m);if(n){toast('미니홈피',NOTE[n.k](n));if(n.k==='ilchon'&&n.hid)give(2,n.n+'님과 일촌이 되었어요 (같은 방 친구)','ilchon-r-'+n.hid);if(n.k==='ask')offerAsk(n)}
    if(view.who==='me'&&view.tab==='guest'){const g=MN.gb[m.hid];if(!g||g.v!==m.v)mq('read',{op:'gb',hid:m.hid,page:(g&&g.page)||1})}
    if(hid&&n&&n.hid===hid)mq('read',{op:'get',hid});rerender();break}
   case 'note':{const n=noteOf(m);if(n)toast('미니홈피',NOTE[n.k](n));if(hid&&hid===m.hid&&view.tab==='guest')mq('read',{op:'gb',hid,page:1});break}
   case 'home':case 'gb':case 'ph':rerender();break;
   case 'askok':toast('일촌 신청','일촌 신청을 보냈어요. 친구가 수락하면 일촌이 돼요.');if(hid)mq('read',{op:'get',hid});break;
   case 'gone':if(hid&&hid===m.hid){toast('미니홈피','친구의 미니홈피를 찾을 수 없어요.');view.who='me';view.tab='home'}rerender();break;
   case 'error':toast('미니홈피',String(m.message||'잠시 뒤에 다시 해 주세요.').slice(0,60));break}}
 function roomTab(main,m){main.append(E('h3','mh-h','미니룸 꾸미기'));const cv=roomCanvas(main,{...m.room,night:m.room.wall==='night'},true);
  const help=E('p','mh-muted',view.sel?'‘'+ITEM[view.sel].name+'’을(를) 놓을 자리를 고르세요 (방 그림을 눌러도 돼요).':'가진 물건을 고른 다음 놓을 자리를 누르세요. 물건은 선물가게에서 도토리로 살 수 있어요.');main.append(help);
  const place=slot=>{const it=view.sel&&ITEM[view.sel];if(!it)return;const isWall=slot[0]==='W';if((it.slot==='wall')!==isWall){toast('미니룸',it.slot==='wall'?'벽에 거는 물건이에요.':'바닥에 놓는 물건이에요.');return}for(const k of Object.keys(m.room.slots))if(m.room.slots[k]===it.id&&k!==slot)delete m.room.slots[k];m.room.slots[slot]=it.id;view.sel=null;save();render()};
  cv.addEventListener('pointerdown',e=>{if(!view.sel)return;const r=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0,width:360,height:210};const x=(e.clientX-r.left)*360/(r.width||360),y=(e.clientY-r.top)*210/(r.height||210);const it=ITEM[view.sel];let best=null,bd=1e9;for(const [k,[sx,sy]] of Object.entries(SLOTS)){if((k[0]==='W')!==(it.slot==='wall'))continue;const d=Math.hypot(x-sx,y-sy);if(d<bd){bd=d;best=k}}if(best)place(best)});
  const slots=E('div','mh-slots');for(const k of Object.keys(SLOTS)){const cur=m.room.slots[k];slots.append(B((k[0]==='W'?'벽 ':'바닥 ')+(Number(k[1])+1)+': '+(cur?ITEM[cur]?ITEM[cur].name:cur:'비어 있음'),()=>{if(view.sel)place(k);else if(cur){delete m.room.slots[k];save();render()}},'mh-slot'+(cur?' full':'')))}main.append(slots,E('p','mh-muted','물건이 놓인 자리를 그냥 누르면 물건을 치워요.'));
  const mine=E('div','mh-own');mine.append(E('b','','내 물건'));for(const id of m.items){const it=ITEM[id];if(!it||!['floor','wall'].includes(it.slot))continue;mine.append(B(it.name,()=>{view.sel=view.sel===id?null:id;render()},'mh-chip'+(view.sel===id?' on':'')))}main.append(mine);
  const deco=E('div','mh-own');deco.append(E('b','','벽지 · 바닥 · 스킨 · BGM'));for(const id of m.items){const it=ITEM[id];if(!it||!['wallpaper','flooring','skin','bgm'].includes(it.slot))continue;const on=(it.slot==='wallpaper'&&m.room.wall===id.slice(3))||(it.slot==='flooring'&&m.room.floor===id.slice(3))||(it.slot==='skin'&&m.skin===id.slice(3))||(it.slot==='bgm'&&m.bgm===id);deco.append(B(it.name+(on?' ✓':''),()=>apply(it),'mh-chip'+(on?' on':'')))}
  if(m.skin!=='sky')deco.append(B('기본 스킨으로',()=>{m.skin='sky';save();render()},'mh-chip'));main.append(deco)}
 function apply(it){const m=S();if(it.slot==='wallpaper')m.room.wall=it.id.slice(3);else if(it.slot==='flooring')m.room.floor=it.id.slice(3);else if(it.slot==='skin')m.skin=it.id.slice(3);else if(it.slot==='bgm')m.bgm=m.bgm===it.id?'':it.id;save();render()}
 function buy(it){const m=S();if(m.items.includes(it.id))return false;if(m.dotori<it.price){toast('선물가게','도토리가 '+(it.price-m.dotori)+'개 모자라요.');return false}m.dotori-=it.price;m.items.push(it.id);X.save();toast('선물가게','‘'+it.name+'’을(를) 샀어요! (남은 도토리 '+m.dotori+'개)');if(['wallpaper','flooring','skin','bgm'].includes(it.slot))apply(it);else render();return true}
 function shopTab(main,m){main.append(E('h3','mh-h','선물가게'));main.append(E('p','mh-muted','도토리로 미니룸 물건, 벽지, 스킨, 배경음악을 살 수 있어요. 산 물건은 ‘미니룸’에서 놓아 보세요.'));
  for(const [slot,label] of [['floor','가구 · 소품'],['wall','벽 장식'],['wallpaper','벽지'],['flooring','바닥'],['skin','미니홈피 스킨'],['bgm','배경음악']]){const box=E('section','mh-box mh-shop');box.append(E('h4','',label));for(const it of SHOP.filter(x=>x.slot===slot)){const own=m.items.includes(it.id);const row=E('div','mh-item');if(slot!=='bgm')row.append(artImage(it.id,'mh-thumb',it.name));
   row.append(E('b','',it.name),E('span','mh-price','도토리 '+it.price+'개'),own?E('em','','보유 중'):B('사기',()=>buy(it),'mh-btn small'));box.append(row)}main.append(box)}}
 const api={ids:['minihome'],has:id=>id==='minihome',open,go,state:()=>({...S(),view:{...view}}),
  buy:id=>ITEM[id]?buy(ITEM[id]):false,
  reset(){view.who='me';view.tab='home';view.sel=null;seen.clear();seenReal.clear();phAsked.clear()},destroy(){alive=false;for(const t of timers)w.clearTimeout(t);timers.clear();if(MN.active===onMini){MN.active=null;MN.src=null}},
  live:{list:()=>MN.list.map(r=>({...r})),me:()=>MN.me,home:hid=>MN.homes[hid]||null,guest:hid=>MN.gb[hid]||null,receive:mReceive,publish:()=>publish(true),uid:()=>myUid(),payload:()=>pubPayload(S()),photos:()=>photoJobs(S(),X.shell&&X.shell.pics?X.shell.pics():[])}};
 MN.src=()=>({m:S(),pics:X.shell&&X.shell.pics?X.shell.pics():[]});MN.active=onMini;mEnsure();if(mready())publish(true);
 return api}
/* A100: 휴대폰 NATE의 싸이월드 모바일이 같은 줄 세우기로 방명록 읽기, 쓰기, 놀러 가기를 보낼 수 있게 send 를 내보낸다 */
w.MiniHome={attach,FRIENDS,SHOP,SLOTS,MOODS,drawItem,drawRoom,scene,chibi,live:MN,pubPayload,photoJobs,send:(kind,o)=>(mEnsure(),['read','visit','write'].includes(kind)&&o&&typeof o==='object'?mq(kind,o):false),version:'A97'};
})(window);
