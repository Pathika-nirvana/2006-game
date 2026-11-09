/* A94: 2006년 분위기의 새 사이트 다섯 곳. web-sites.js 다음에 읽혀 WebSites.register()로 붙는다.
   소설나라(인터넷 소설), 해솔초 6학년 2반 하늘반(학급 홈페이지), 이모티콘 세상(특수문자, 대화명 꾸미기, 외계어 번역기),
   미스터리 X파일(세계의 불가사의, UFO 목격 제보, 초능력 테스트), 별이네 다락방(숨은 미스터리 홈페이지).
   별이네 다락방은 검색과 추천 목록에 나오지 않는다. 링크천국의 ‘접속이 불안정한 곳’이나 주소창으로만 들어갈 수 있고,
   다른 사이트 곳곳에 흩어진 복선(닉네임 별지기, 바다소라, 5월 30일 4시 30분, 북극성)을 모으면 비밀의 방이 열린다.
   글쓴 날짜와 시각은 모두 2006년 5월 30일 오후 4시 32분 이전이다. 사람, 학교, 사이트는 모두 지어낸 것이다. */
(function(w){'use strict';
const WS=w.WebSites;if(!WS||!WS.register)return;
const K=WS.kit,ST=()=>w.WebStories||{};
const won=n=>Number(n).toLocaleString('ko-KR');
function seeded(env,box,list,nicks,seedKey){const {E}=env;list.forEach((t,i)=>{const m=/^([^:\s]{1,12})::\s*([\s\S]*)$/.exec(t),nest=/^ㄴ\s/.test(t);const p=E('p','ws-cm'+(nest?' wm-nest':''));p.append(E('b','wm-who','['+(m?m[1]:nicks[(K.hash(seedKey)+i*5)%nicks.length])+']'),E('span','',' '+(m?m[2]:nest?t.replace(/^ㄴ\s*/,''):t)));box.append(p)})}
function mine(env,box,key){for(const t of K.listOf(env.k,'cm',key,10))box.append(env.E('p','ws-cm mine',t))}
function toast(env,title,text){const X=env.ctx.X;if(X&&X.ui&&X.ui.toast)X.ui.toast({title,text,icon:'info',ms:4200})}
function copyText(env,text){let ok=false;try{const c=w.navigator&&w.navigator.clipboard;if(c&&c.writeText){c.writeText(text).catch(()=>{});ok=true}}catch(_){}toast(env,'이모티콘 세상',(ok?'복사했어요! ':'')+'“'+text.replace(/\n/g,' ').slice(0,24)+'” 를 Ctrl+V로 붙여 넣어 보세요.');return ok}

/* ============ 1. 소설나라 ============ */
function novelPage(page,env){
 const {E,B,go,r,k,ctx}=env,N=ST().novel;if(!N){K.site404(env,'소설을 불러오지 못했습니다.');return}
 K.sparkle(env,page);
 const head=E('header','nv-head');head.append(B('소설나라',()=>go({type:'home'}),'nv-logo'),E('span','nv-sub','♡ 우리들의 인터넷 소설 ♡'));
 const nav=E('nav','nv-nav');for(const [type,label] of [['home','홈'],['novel','오늘의 추천 소설'],['board','독자 게시판']])nav.append(B(label,()=>go({type}),'nv-tab'+((r.type===type&&!(type==='novel'&&r.id))||(type==='novel'&&r.type==='read')?' on':'')));
 page.append(head,nav,K.marquee(E,'★ 소설나라 오픈 1주년 ★ 신인 작가 대모집 중 ★ 불펌하면 신고합니다 ★ 오늘의 추천: '+N.title+' ★','nv-marq'));
 const body=E('main','nv-body');page.append(body);
 const recOf=c=>Math.round(c.hits/9)+(k.rec['nv-'+c.no]?1:0);
 if(r.type==='home'){
  const top=E('section','nv-box');top.append(E('h3','','인기 소설 TOP 10'));
  const ranked=[...N.others.slice(0,2).map((o,i)=>({o,i})),{mine:true},...N.others.slice(2).map((o,i)=>({o,i:i+2}))];
  ranked.forEach((x,i)=>{const row=E('div','nv-rank');row.append(E('b','nv-no',String(i+1)));if(x.mine){row.append(B(N.title,()=>go({type:'novel'}),'nv-link hot'),E('small','',N.author+' · '+N.status+' · 조회 '+won(N.hits)),E('em','nv-new','NEW'))}else{const [t,a,st,h]=x.o;row.append(B(t,()=>go({type:'novel',id:'o'+x.i}),'nv-link'),E('small','',a+' · '+st+' · 조회 '+won(h)))}top.append(row)});body.append(top);
  const nw=E('section','nv-box');nw.append(E('h3','','새로 올라온 회차'));for(const c of N.chapters.slice().reverse()){const row=E('div','nv-rank');row.append(B(c.no+'화. '+c.title,()=>go({type:'read',id:String(c.no)}),'nv-link'),E('small','',N.author+' · '+c.date));nw.append(row)}body.append(nw);
  const nt=E('section','nv-box');nt.append(E('h3','','공지사항'));for(const t of N.notice)nt.append(E('p','',t));body.append(nt);return}
 if(r.type==='novel'){
  if(/^o\d$/.test(r.id||'')){const o=N.others[Number(r.id.slice(1))];if(!o){K.site404(env);return}
   const box=E('section','nv-box');box.append(E('h3','',o[0]),E('p','nv-meta','작가 '+o[1]+' · '+o[2]+' · 조회 '+won(o[3])),E('p','nv-lock','※ 이 소설은 정회원만 볼 수 있습니다. 정회원 신청은 지금 받지 않습니다 ㅠㅠ'),B('◀ 소설 목록으로',()=>go({type:'home'}),'nv-btn'));body.append(box);return}
  const box=E('section','nv-box nv-work'),cover=E('div','nv-cover');cover.append(E('b','','별똥별이 떨어지면'),E('span','','☆ 우리 다시 만나 ☆'),E('small','',N.author));
  const info=E('div','nv-info');info.append(E('h2','',N.title));for(const [a,b] of [['작가',N.author],['장르',N.genre],['상태',N.status],['조회',won(N.hits)],['추천',won(N.rec)]]){const p=E('p','');p.append(E('b','',a+' '),E('span','',b));info.append(p)}info.append(E('p','nv-intro',N.intro));
  box.append(cover,info);body.append(box);
  const note=E('section','nv-box nv-note');note.append(E('h3','','작가의 말'),E('p','',N.authorNote));body.append(note);
  const list=E('section','nv-box');list.append(E('h3','','회차 목록'));for(const c of N.chapters){const row=E('div','nv-rank');row.append(B(c.no+'화. '+c.title,()=>go({type:'read',id:String(c.no)}),'nv-link'),E('small','',c.date+' · 조회 '+won(c.hits)+' · 댓글 '+c.comments.length));list.append(row)}
  list.append(E('p','nv-lock','5화. (작가 사정으로 5월 30일 이후에 올라옵니다)'));body.append(list);return}
 if(r.type==='read'){
  const c=N.chapters.find(x=>String(x.no)===String(r.id))||N.chapters[0];
  const art=E('article','nv-read');art.append(E('h2','',N.title),E('h3','',c.no+'화. '+c.title),E('small','nv-meta',N.author+' · '+c.date+' · 조회 '+won(c.hits)+' · 추천 '+recOf(c)));
  art.append(E('div','nv-text',c.text));
  const nt=E('div','nv-note');nt.append(E('b','','작가의 말'),E('p','',c.note));art.append(nt);body.append(art);
  body.append(B(k.rec['nv-'+c.no]?'추천 완료 ♥ '+recOf(c):'이 회차 추천하기 ♡ '+recOf(c),()=>{if(k.rec['nv-'+c.no])return;k.rec['nv-'+c.no]=1;ctx.save();ctx.rerender()},'nv-btn rec'));
  const i=N.chapters.indexOf(c),pg=E('div','nv-pager');if(i>0)pg.append(B('◀ '+(c.no-1)+'화',()=>go({type:'read',id:String(c.no-1)}),'nv-btn'));pg.append(B('목록',()=>go({type:'novel'}),'nv-btn'));if(i<N.chapters.length-1)pg.append(B((c.no+1)+'화 ▶',()=>go({type:'read',id:String(c.no+1)}),'nv-btn'));else pg.append(E('span','nv-lock','5화는 5월 30일 이후에...'));body.append(pg);
  const cm=E('div','nv-cm');cm.append(E('b','','댓글 '+c.comments.length+' (작가님께 힘이 되는 한마디!)'));seeded(env,cm,c.comments,['인소중독','핑크사랑','소설나라짱','눈팅족','강준♡','떡볶이','지나가다'],'nv'+c.no);mine(env,cm,'nv-'+c.no);
  cm.append(K.postForm(env,{nick:'독자',textPh:'댓글 남기기 (악플 금지)',max:60},(a,t)=>{K.pushTo(k,'cm','nv-'+c.no,'['+a+'] '+t,10);ctx.save();ctx.rerender()}));body.append(cm);return}
 if(r.type==='board'){
  const box=E('section','nv-box');box.append(E('h3','','독자 게시판'));box.append(K.postForm(env,{nick:'독자',textPh:'자유롭게 한마디 (도배 금지)',max:70,btn:'올리기'},(a,t)=>{K.pushTo(k,'gb','novel','['+a+'] '+t,10);ctx.save();ctx.rerender()}));
  for(const t of K.listOf(k,'gb','novel',10).slice().reverse())box.append(E('p','ws-cm mine',t));
  for(const [t,n,x] of N.board){const p=E('div','nv-post');p.append(E('b','',t),E('small','',' - '+n),E('p','',x));box.append(p)}body.append(box);return}
 K.site404(env)}

/* ============ 2. 해솔초 6학년 2반 하늘반 ============ */
const CLS={
 motto:'꿈을 향해 날아라! (단, 숙제는 하고 날자)',
 greet:'하늘반 친구들, 안녕하세요! 담임 정다운 선생님이에요. 우리 반 홈페이지는 우리 모두의 공간이에요. 서로 예쁜 말을 쓰고, 알림장은 꼭 확인하기! 초등학교 마지막 1년, 멋진 추억을 함께 만들어요.',
 notices:[
  ['2006.05.30 (화)',['수학 익힘책 52~53쪽 풀어 오기','실과 준비물: 앞치마, 두건 (금요일 요리 실습)','6월 1일~2일 경주 수학여행 안내문에 부모님 확인 도장 받아 오기','방과 후 운동장 놀이는 4시 30분까지만! 정리하고 집에 가요']],
  ['2006.05.29 (월)',['일기 검사 (일주일에 세 편 이상)','수학여행 용돈은 2만 원 이하로','우유 당번: 5모둠']],
  ['2006.05.26 (금)',['체육대회 이어달리기 1등 축하해요 ♡ 다들 정말 잘했어요','다음 주 학급 회의 주제: 월드컵 응원 계획','교실 화분 물 주기 당번 확인']],
  ['2006.05.24 (수)',['과학 실험 보고서 금요일까지','사이버 가정학습 이번 주 분량 마치기','내일 체육대회 연습, 체육복 꼭 챙기기']],
  ['2006.05.22 (월)',['학부모 상담 주간 안내문 전달','도서관 책 반납 (연체한 친구 4명!)']]],
 album:[['2006.05.25','체육대회 이어달리기 1등!! 하늘반 최고'],['2006.05.04','어린이날 기념 학급 레크리에이션'],['2006.04.21','과학의 날 물로켓 날리기 대회'],['2006.04.05','식목일 학교 화단에 꽃 심기'],['2006.03.02','6학년 2반 첫날 단체 사진'],['2004.05.30','(지난 사진) 소라가 올림: 4학년 때 별이랑 운동장 철봉 앞에서 타임캡슐 묻은 날']],
 board:[
  {id:'b1',title:'체육대회 우리 반 짱!!!',nick:'달리기왕',date:'05.25',hits:88,text:'이어달리기 마지막에 역전한 거 봤냐 ㅋㅋㅋ 선생님 우는 거 처음 봄',replies:['정다운쌤::선생님 안 울었어요... 눈에 먼지가 들어갔을 뿐 ㅋㅋ','ㅋㅋㅋㅋㅋ 쌤 귀여워요','바통 넘길 때 심장 터지는 줄']},
  {id:'b2',title:'수학 익힘책 몇 쪽까지예요?',nick:'숙제싫어',date:'05.30',hits:41,text:'알림장 안 적어 왔어요 ㅠㅠ 누가 알려 주세요',replies:['알림장 메뉴 보면 있잖아 ㅡㅡ','52~53쪽!','ㄴ 고마워 ㅠㅠ']},
  {id:'b3',title:'토고전 다 같이 보면 안 돼요?',nick:'붉은악마',date:'05.29',hits:63,text:'6월 13일 밤 10시라서 학교에서는 못 보겠죠...? 그럼 프랑스전 새벽 4시에 다 같이 일어나기 약속해요!!',replies:['새벽 4시에 우리 엄마가 깨워 줄까...','대~한민국 짝짝짝 짝짝','정다운쌤::다음 주 학급 회의에서 응원 계획 같이 정해 봐요 ^^']},
  {id:'b4',title:'별이 소식 아는 사람 있어??',nick:'바다소라',date:'05.29',hits:57,text:'4학년 때 우리 반이었던 별이 기억나지? 말도 없이 전학 간 애. 내일 4시 반에 별이랑 철봉 밑에 묻은 타임캡슐 열기로 했었거든. 별이 연락처 아는 사람 있으면 알려 줘 ㅠㅠ 별이 홈피도 있었는데 다락방 어쩌구였던 거 같아.',replies:['별이 기억나! 맨날 별 얘기만 하던 애','ㄴ 별이 홈피 별 사진 엄청 많았던 거 기억남','링크천국 죽은 링크 목록에 다락방이라는 홈피 있던데? 그거 아님?','정다운쌤::선생님도 4학년 때 담임 선생님께 여쭤봤는데, 별이네 연락처가 바뀌었대. 내일 소라 혼자 기다리지 않게 선생님도 운동장에 나가 볼게.']},
  {id:'b5',title:'경주 수학여행 때 방 같이 쓸 사람~',nick:'여행가자',date:'05.28',hits:72,text:'불국사 가서 단체 사진 찍자!! 방은 4명씩이래',replies:['나 나 나!!','베개 싸움 할 사람 ㅋㅋ','정다운쌤::베개 싸움은 10시까지만 ^^']},
  {id:'b6',title:'선생님 사랑해요 ♡',nick:'하늘반막내',date:'05.27',hits:49,text:'선생님 오늘 머리 자르신 거 예뻐요!! 내일 수학 시험 안 보면 더 사랑할게요 ㅋㅋ',replies:['ㅋㅋㅋㅋㅋ 대박','정다운쌤::선생님도 사랑해요. 시험은 봅니다 ^^','ㄴ ㅠㅠㅠㅠ']}]
};
function clsPage(page,env){
 const {E,B,go,r,k}=env;
 const head=E('header','cl-head'),logo=B('',()=>go({type:'home'}),'cl-logo');logo.append(E('small','','해솔초등학교'),E('b','','6학년 2반 하늘반'),E('span','','☁ ☀ ☁'));head.append(logo,E('p','cl-motto','급훈: '+CLS.motto));
 const nav=E('nav','cl-nav');for(const [type,label] of [['home','우리 반'],['notice','알림장'],['album','우리 반 사진첩'],['board','하늘반 게시판']])nav.append(B(label,()=>go({type}),'cl-tab'+(r.type===type||(type==='board'&&r.type==='post')?' on':'')));page.append(head,nav);
 const body=E('main','cl-body');page.append(body);
 const noticeBox=(parent,[date,items],cls)=>{const box=E('section','cl-box '+(cls||''));box.append(E('h3','','알림장 · '+date));const ol=E('ol','cl-list');for(const t of items)ol.append(E('li','',t));box.append(ol);parent.append(box)};
 if(r.type==='home'){
  const hello=E('section','cl-box cl-hello');hello.append(E('h3','','담임 선생님 인사말'),E('p','',CLS.greet),E('small','','- 하늘반 담임 정다운 -'));body.append(hello);
  noticeBox(body,CLS.notices[0],'today');
  const nb=E('section','cl-box');nb.append(E('h3','','하늘반 게시판 새 글'));for(const p of CLS.board.slice(0,5)){const row=E('div','cl-row');row.append(B(p.title,()=>go({type:'post',id:p.id}),'cl-link'),E('em','','['+p.replies.length+']'),E('small','',p.nick+' · '+p.date));nb.append(row)}body.append(nb);
  const vc=E('p','cl-count');vc.append(E('span','','우리 반 방문자 '),K.digits(E,3412+k.total%50,5,'sm'),E('span','','  (하늘반 31명 + 선생님 1명)'));body.append(vc,E('p','cl-foot','이 홈페이지는 하늘반 친구들과 선생님만의 공간입니다. 글쓰기는 학급 회원만 할 수 있어요.'));return}
 if(r.type==='notice'){for(const n of CLS.notices)noticeBox(body,n);return}
 if(r.type==='album'){
  const grid=E('div','cl-album');for(const [d,cap] of CLS.album){const card=E('figure','cl-photo'),x=E('div','cl-xbox');x.append(E('i','','×'));x.title='그림이 보이지 않으면 새로 고침(F5)을 눌러 주세요';card.append(x,E('figcaption','',d+'  '+cap));grid.append(card)}
  body.append(E('p','cl-note','※ 사진이 안 보이면 새로 고침을 눌러 주세요. 사진 용량이 커서 느릴 수 있어요. (선생님 디카가 너무 좋아서 그래요 ㅋㅋ)'),grid);return}
 if(r.type==='board'){
  const t=E('div','cl-table');t.append(E('b','','번호'),E('b','','제목'),E('b','','글쓴이'),E('b','','날짜'),E('b','','조회'));CLS.board.forEach((p,i)=>{t.append(E('span','',String(CLS.board.length-i)));const cell=E('span','cl-subj');cell.append(B(p.title,()=>go({type:'post',id:p.id}),'cl-link'),E('em','',' ['+p.replies.length+']'));t.append(cell,E('span','',p.nick),E('span','',p.date),E('span','',String(p.hits)))});body.append(t,E('p','cl-note','글쓰기와 댓글은 하늘반 친구들만 로그인해서 쓸 수 있어요.'));return}
 if(r.type==='post'){
  const p=CLS.board.find(x=>x.id===r.id);if(!p){K.site404(env,'지워졌거나 없는 글이에요.');return}
  const box=E('article','cl-box cl-post');box.append(E('h3','',p.title),E('small','',p.nick+' · 2006.'+p.date+' · 조회 '+p.hits),E('p','cl-text',p.text));
  const cm=E('div','cl-cm');cm.append(E('b','','댓글 '+p.replies.length));seeded(env,cm,p.replies,['하늘반친구','반장','6학년2반','짝꿍'],'cl'+p.id);box.append(cm);body.append(box,B('◀ 목록',()=>go({type:'board'}),'cl-btn'));return}
 K.site404(env)}

/* ============ 3. 이모티콘 세상 ============ */
const EMO={
 cats:[
  ['기쁨',['^^','^_^','^-^','^0^','*^^*','^^*','(^^)v','＼(^o^)／','^▽^','ㅎㅎㅎ']],
  ['슬픔',['ㅠㅠ','ㅜㅜ','ㅠ_ㅠ','T_T','T^T','ㅠ.ㅠ','OTL','orz',';ㅁ;','(;_;)']],
  ['당황 · 화남',['-_-','ㅡㅡ','-_-^','ㅡ_ㅡ;','-_-;;','=_=','@_@','O_O','ㅡ.ㅡ','┐(-_-)┌']],
  ['사랑',['♡','♥','♡_♡','♥.♥','(*♡_♡*)','♡ⓛⓞⓥⓔ♡','☆♡☆','˚♡˚','♡(^^)♡','♥사랑해♥']],
  ['인사',['(__)','(_ _)','(--)(__)','m(_ _)m','방가방가 ^^/','하이루 ^ㅡ^','안녕~ ^^)/','ㅂㅂ~','즐~','감사합니다 (_ _)']],
  ['특수문자',['★','☆','♡','♥','♪','♬','☎','♨','※','◆','◇','▶','◀','♣','☞','☜','ㆀ','∑','≒','￠']]],
 art:[['하트','  ♥♥   ♥♥\n♥♥♥♥♥♥♥\n ♥♥♥♥♥\n   ♥♥♥\n     ♥'],['토끼','(\\(\\\n( ^.^)\nO_(")(")'],['꽃','  @@@\n @@@@@\n  @@@\n   |\n  \\|/'],['물고기','<゜)))彡  <゜)))彡'],['고양이','  /\\_/\\\n ( o.o )\n  > ^ <']],
 name:[n=>'★彡 '+n+' 彡★',n=>'♡ '+n+' ♡',n=>'˚。☆ '+n+' ☆。˚',n=>'『 '+n+' 』',n=>'♪ '+n+' ♬',n=>'º°˚˚°º '+n+' º°˚˚°º',n=>'∩_∩ '+n+' ∩_∩',n=>'┗(^o^)┛ '+n,n=>'*:..｡o○ '+n+' ○o｡..:*',n=>'♥ '+n+' 사랑해 ♥']
};
const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],JONG=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
/* 그때 유행한 외계어처럼 글자를 쪼개어 바꾼다. 가→7r, 이→ㅇl, 해→ㅎH, 세→ㅅㅔ, 요→욤 */
function alien(s){let out='';for(const ch of String(s)){const c=ch.charCodeAt(0);if(c<0xAC00||c>0xD7A3){out+=ch;continue}const n=c-0xAC00,L=Math.floor(n/588),V=Math.floor((n%588)/28),T=n%28,head=L===0?'7':CHO[L],tail=JONG[T];
 if(ch==='요'){out+='욤';continue}
 if(V===0)out+=head+'r'+tail;else if(V===20)out+=head+'l'+tail;else if(V===1)out+=head+'H'+tail;else if(V===5)out+=CHO[L]+'ㅔ'+tail;else out+=ch}return out}
function circled(s){return String(s).replace(/[a-z]/gi,ch=>String.fromCharCode(0x24D0+ch.toLowerCase().charCodeAt(0)-97))}
function emoPage(page,env){
 const {E,B,go,r,ctx}=env;K.sparkle(env,page);
 const head=E('header','em-head');head.append(B('이모티콘 세상',()=>go({type:'home'}),'em-logo'),E('span','em-sub','(^^)/ 특수문자 · 대화명 꾸미기 · 외계어 번역기 ♡'));
 const nav=E('nav','em-nav');for(const [type,label] of [['home','홈'],['list','이모티콘 모음'],['name','대화명 꾸미기'],['alien','외계어 번역기']])nav.append(B(label,()=>go({type}),'em-tab'+(r.type===type?' on':'')));page.append(head,nav);
 const body=E('main','em-body');page.append(body);
 const chip=(t,big)=>B(t,()=>copyText(env,t),'em-chip'+(big?' art':''));
 const useNick=v=>{const xp=ctx.saved&&ctx.saved.xp;const nick=String(v).replace(/[<>]/g,'').slice(0,20);if(!xp||typeof xp!=='object'||!nick)return;xp.nick=nick;ctx.save();toast(env,'버디버디','대화명을 바꿨어요: '+nick)};
 if(r.type==='home'){
  body.append(E('p','em-hello','안녕하세요~ ^^/ 미니홈피, 버디버디, 문자 꾸밀 때 필요한 이모티콘이 다 있어요! 누르면 바로 복사돼요 ♡'));
  const hot=E('section','em-box');hot.append(E('h3','','오늘의 인기 이모티콘 BEST'));const row=E('div','em-chips');for(const t of ['^^','ㅠㅠ','-_-;;','♡_♡','(__)','OTL','＼(^o^)／','★彡'])row.append(chip(t));hot.append(row);body.append(hot);
  const tiles=E('div','em-tiles');for(const [type,label,desc] of [['list','이모티콘 모음','기쁨, 슬픔, 사랑, 특수문자까지'],['name','대화명 꾸미기','내 대화명을 반짝반짝하게'],['alien','외계어 번역기','ㅇrㄴ녕ㅎrㅅㅔ욤 ^^']]){const t=B('',()=>go({type}),'em-tile');t.append(E('b','',label),E('small','',desc));tiles.append(t)}body.append(tiles);
  body.append(E('p','em-tip','※ 특수문자는 한글 자음(ㅁ, ㄴ, ㅇ...)을 쓰고 한자 키를 누르면 더 많이 고를 수 있어요.'));return}
 if(r.type==='list'){
  const cats=EMO.cats.map(c=>c[0]).concat(['그림 문자']),pick=cats.includes(r.query)?r.query:cats[0];
  const tabs=E('div','em-cats');for(const c of cats)tabs.append(B(c,()=>go({type:'list',query:c}),'em-cat'+(pick===c?' on':'')));body.append(tabs);
  const box=E('section','em-box');box.append(E('h3','',pick+' 이모티콘 (누르면 복사)'));const row=E('div','em-chips');
  if(pick==='그림 문자'){for(const [n,a] of EMO.art){const card=E('div','em-artcard');card.append(E('small','',n),chip(a,true));row.append(card)}}else for(const t of EMO.cats.find(c=>c[0]===pick)[1])row.append(chip(t));
  box.append(row);body.append(box);return}
 if(r.type==='name'){
  const box=E('section','em-box');box.append(E('h3','','대화명 꾸미기'),E('p','','버디버디, 미니홈피에 쓸 대화명을 넣어 보세요. 마음에 드는 걸 누르면 복사되고, 버디버디 대화명으로 바로 바꿀 수도 있어요.'));
  const f=E('form','ws-form em-form'),inp=K.field(E,'대화명 (예: 소라)',10,'대화명'),go2=B('꾸미기',()=>{},'ws-btn');go2.type='submit';inp.value=r.query||'';f.append(inp,go2);
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const v=inp.value.trim().slice(0,10);if(v)go({type:'name',query:v})});box.append(f);body.append(box);
  const n=String(r.query||'').slice(0,10);if(n){const out=E('section','em-box');out.append(E('h3','','“'+n+'” 꾸미기 결과'));const list=EMO.name.map(fn=>fn(n));if(/[a-z]/i.test(n))list.push('♡ '+circled(n)+' ♡');list.push('☆ '+alien(n)+' ☆');
   for(const t of list){const row=E('div','em-name');row.append(E('span','em-name-t',t),B('복사',()=>copyText(env,t),'em-mini'),B('버디버디 대화명으로',()=>useNick(t),'em-mini'));out.append(row)}body.append(out)}return}
 if(r.type==='alien'){
  const box=E('section','em-box');box.append(E('h3','','외계어 번역기 ㅇrㄴ녕ㅎrㅅㅔ욤'),E('p','','평범한 말을 넣으면 요즘 유행하는 외계어로 바꿔 드려요. 선생님이나 부모님께는 쓰지 마세요 ㅋㅋ'));
  const f=E('form','ws-form em-form'),inp=K.field(E,'바꿀 말 (예: 안녕하세요)',30,'바꿀 말'),btn=B('번역하기',()=>{},'ws-btn');btn.type='submit';inp.value=r.query||'';f.append(inp,btn);
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const v=inp.value.trim().slice(0,30);if(v)go({type:'alien',query:v})});box.append(f);
  const q=String(r.query||'').slice(0,30);if(q){const t=alien(q);const res=E('div','em-name');res.append(E('span','em-name-t big',t),B('복사',()=>copyText(env,t),'em-mini'));box.append(res)}
  const ex=E('div','em-ex');ex.append(E('b','','이렇게 바뀌어요'));for(const s of ['안녕하세요','사랑해','보고 싶어','방가방가','잘 자요'])ex.append(E('p','',s+'  →  '+alien(s)));box.append(ex);body.append(box);return}
 K.site404(env)}

/* ============ 4. 미스터리 X파일 ============ */
const ZENER=['○','十','≋','□','☆'];
function xfilePage(page,env){
 const {E,B,go,r,k,ctx}=env,X=ST().xfile;if(!X){K.site404(env);return}
 const head=E('header','xf-head');head.append(B('MYSTERY X-FILE',()=>go({type:'home'}),'xf-logo'),E('span','xf-sub','믿거나 말거나. 판단은 당신의 몫입니다.'));
 const nav=E('nav','xf-nav');for(const [type,label] of [['home','미스터리 파일'],['ufo','UFO 목격 제보'],['esp','초능력 테스트']])nav.append(B(label,()=>go({type}),'xf-tab'+(r.type===type||(type==='home'&&r.type==='read')?' on':'')));page.append(head,nav);
 const body=E('main','xf-body');page.append(body);
 if(r.type==='home'){
  body.append(E('p','xf-type','> 접속 승인... 기밀 파일 '+X.articles.length+'건을 불러왔습니다._'));
  const cats=['전체',...X.cats],pick=cats.includes(r.query)?r.query:'전체',tabs=E('div','xf-cats');for(const c of cats)tabs.append(B(c,()=>go({type:'home',query:c==='전체'?'':c}),'xf-cat'+(pick===c?' on':'')));body.append(tabs);
  for(const a of X.articles.filter(a=>pick==='전체'||a.cat===pick)){const row=E('div','xf-row');row.append(E('span','xf-tag',a.cat),B(a.title,()=>go({type:'read',id:a.id}),'xf-link'),E('small','','열람 '+won(a.hits)));body.append(row)}
  const last=X.ufo[0],nb=E('section','xf-box');nb.append(E('h3','','최근 UFO 목격 제보'),B(last[1]+' · '+last[2],()=>go({type:'ufo'}),'xf-link'),E('p','',last[3].slice(0,60)+'…'));body.append(nb);return}
 if(r.type==='read'){
  const a=X.articles.find(x=>x.id===r.id);if(!a){K.site404(env,'파일이 삭제되었거나 존재하지 않습니다.');return}
  const art=E('article','xf-art');art.append(E('small','xf-tag',a.cat+' · 기밀 등급 C'),E('h2','',a.title),E('small','','열람 '+won(a.hits)));for(const p of String(a.text).split(/\n\n+/))art.append(E('p','',p));body.append(art);
  const cm=E('div','xf-cm');cm.append(E('b','','요원들의 의견'));seeded(env,cm,a.comments,['X요원','믿는사람','안믿는사람','외계인친구','미스터리헌터'],'xf'+a.id);mine(env,cm,'xf-'+a.id);
  cm.append(K.postForm(env,{nick:'요원',textPh:'의견 한 줄',max:60},(n,t)=>{K.pushTo(k,'cm','xf-'+a.id,'['+n+'] '+t,10);ctx.save();ctx.rerender()}));body.append(cm,B('◀ 파일 목록',()=>go({type:'home'}),'xf-btn'));return}
 if(r.type==='ufo'){
  body.append(E('h2','xf-h','UFO 목격 제보 게시판'),E('p','xf-note',X.notice));
  body.append(K.postForm(env,{cls:'xf-form',nick:'목격자',textPh:'언제, 어디서, 무엇을 봤나요?',max:80,btn:'제보하기'},(n,t)=>{K.pushTo(k,'gb','xfile','['+n+'] '+t,10);ctx.save();ctx.rerender()}));
  for(const t of K.listOf(k,'gb','xfile',10).slice().reverse())body.append(E('p','ws-cm mine',t+'  (신빙성 심사 중)'));
  X.ufo.forEach(([when,where,who,text,cred],i)=>{const card=E('div','xf-ufo');card.append(E('b','',when+' · '+where),E('small','','제보자 '+who+' · 신빙성 '+'★'.repeat(cred)+'☆'.repeat(5-cred)),E('p','',text));const rp=E('p','xf-rep','└ '+X.ufoReplies[(i*2+1)%X.ufoReplies.length]+'  /  '+X.ufoReplies[(i*3+2)%X.ufoReplies.length]);card.append(rp);body.append(card)});return}
 if(r.type==='esp'){
  body.append(E('h2','xf-h','초능력 테스트 (제너 카드)'),E('p','xf-note','카드 다섯 장 중 한 장이 뒤집혀 있습니다. 마음을 비우고 어떤 무늬인지 맞혀 보세요. 25번 중 5번 맞히면 보통, 그보다 훨씬 많이 맞히면... 당신은 혹시?'));
  let n=0,hit=0,last='';const card=E('div','xf-card','?'),stat=E('p','xf-type',''),row=E('div','xf-zener');
  const draw=()=>{stat.textContent='> 시도 '+n+' / 25    맞힌 수 '+hit+(last?'    '+last:'')};
  const finish=()=>{row.replaceChildren();const best=Number.isFinite(k.esp)?k.esp:0;if(hit>best){k.esp=hit;ctx.save()}
   const msg=hit>=10?'초능력자 판정! 정부 기관에서 연락이 갈 수도 있습니다... (농담입니다)':hit>=7?'감이 아주 좋은 편입니다. 오늘 로또라도...?':hit>=4?'평범한 지구인입니다. 걱정 마세요.':'오늘은 기운이 약하군요. 푹 주무세요.';
   row.append(E('p','xf-big','결과: 25번 중 '+hit+'번'),E('p','',msg),E('small','','내 최고 기록 '+Math.max(hit,best)+'번'),B('다시 하기',()=>ctx.rerender(),'xf-btn'))};
  for(const z of ZENER)row.append(B(z,()=>{if(n>=25)return;const ans=ZENER[Math.floor(Math.random()*5)];n++;card.textContent=ans;card.classList.toggle('ok',ans===z);if(ans===z){hit++;last='맞혔습니다!'}else last='땡! 정답은 '+ans;draw();if(n>=25)K.later(finish,500);else K.later(()=>{card.textContent='?';card.classList.remove('ok')},650)},'xf-z'));
  draw();body.append(card,row,stat);return}
 K.site404(env)}

/* ============ 5. 별이네 다락방 (숨은 미스터리 홈페이지) ============ */
const STAR={
 bgm:'별 헤는 밤.mid',
 news:[['2004.06.17','다락방 문 닫아요. 안녕.'],['2004.06.12','별 사진첩에 북두칠성 사진 올렸어요!'],['2004.05.30','★타임캡슐★ 일기 썼어요 (소라만 봐!)'],['2004.05.16','별이는요 에 30문 30답 올렸어요'],['2004.05.02','다락방 문 열었어요! 방명록 1등은 소라 ♡']],
 qa:[['이름은?','한별. 다들 별이라고 불러요 ^^'],['학년은?','4학년 2반 (2004년)'],['생일은?','8월 12일! 별똥별이 제일 많이 떨어지는 날이래요'],['가장 친한 친구는?','바다소라. 우리는 단짝 ♡'],['보물 1호는?','아빠가 사 준 망원경'],['좋아하는 곳은?','우리 집 다락방. 창문으로 별이 보여요'],['좋아하는 음식은?','소라랑 먹는 떡볶이'],['제일 좋아하는 별은?','비밀! 힌트: 늘 같은 자리에 있는 별'],['싫어하는 것은?','구름 낀 밤, 그리고 이사'],['장래 희망은?','천문학자. 새 별을 찾으면 소라 이름 붙여 줄 거예요'],['요즘 걱정은?','엄마 아빠가 밤에 작은 소리로 이야기하는 거'],['마지막으로 한마디!','다락방에 놀러 와 줘서 고마워요 ☆']],
 diaryNew:[['2006.05.29 (월) 맑음','내일이다. 2년 동안 하루도 안 잊었어. 다락방 문은 열어 둘게.'],['2006.05.21 (일) 흐림','오늘도 아무도 안 왔다. 투데이는 또 1. 오늘도 나 혼자.'],['2006.05.14 (일) 비','다락방 먼지를 닦았다. 2년 만이다. 방명록에 소라 글이 있었다. 눈물 날 뻔했다.']],
 diary:[
  ['2004.06.17 (목) 비','내일 이사 간다. 아빠 가게가 문을 닫아서 시골 할머니 집으로 간대. 소라한테는 말 못 했다. 말하면 울 것 같아서. 비밀의 방에 편지를 남겨 둔다. 소라야, 비밀의 방 열쇠는 너는 알 거야.'],
  ['2004.06.12 (토) 맑음','다락방 창문으로 북두칠성을 찍었다! 별 사진첩에 올렸다. 국자 끝 두 별을 이어서 다섯 번 가면... 그건 비밀 ㅋㅋ 사진 속에서 찾아봐.'],
  ['2004.06.06 (일) 흐림','요즘 엄마 아빠가 밤마다 작은 소리로 이야기한다. 나는 다락방에 올라와서 이어폰을 꽂는다. 별은 시끄럽지 않아서 좋다.'],
  ['2004.05.30 (일) 맑음','소라랑 학교 운동장 철봉 밑에 타임캡슐을 묻었다! 유리병에 편지랑 스티커 사진이랑 별사탕을 넣었다. 삽이 없어서 숟가락으로 팠다 ㅋㅋ 2년 뒤 오늘, 5월 30일 오후 4시 30분에 같이 열기로 새끼손가락 걸고 도장 찍고 복사까지 했다. 북극성한테도 맹세했다. 북극성은 늘 같은 자리에 있으니까 약속 지킴이로 딱이다.'],
  ['2004.05.15 (토) 맑음','스승의 날. 별 모양 편지지로 선생님께 편지를 썼다. 선생님이 별이는 글씨도 별처럼 반짝인다고 하셨다 ^^'],
  ['2004.05.02 (일) 맑음','홈페이지를 만들었다! 이름은 별이네 다락방. 무료 계정이라 주소가 길다 ㅠㅠ 소라가 1등으로 방명록 써 줬다.'],
  ['2004.04.11 (일) 맑음','아빠가 망원경을 사 주셨다!!! 토성 고리를 봤다. 진짜로 고리가 있다. 소라한테 전화해서 소리 질렀다 ㅋㅋ']],
 guest:[
  ['2006.05.29 23:58','★','알아볼 수 있어. 소라는 웃을 때 눈이 없어지잖아.'],
  ['2006.05.28 21:10','바다소라','별아 이틀 남았어. 나 6학년 됐다. 키도 컸어. 너 나 못 알아보면 어떡하지?'],
  ['2006.03.18 02:00','소름매니아','이 홈피 밤마다 투데이가 혼자 올라간다던데 진짜네요 ㄷㄷ 주인 계세요?'],
  ['2005.11.02 14:20','지나가던사람','여기 주인 없어요? 카운터 이상하게 올라가네...'],
  ['2005.05.30 16:30','바다소라','1년 남았다. 철봉 아직 그대로 있어. 매일 지나가면서 확인해 ㅋㅋ'],
  ['2004.12.24 20:00','바다소라','메리 크리스마스 별아. 다락방은 아직 그대로네.'],
  ['2004.07.02 19:45','바다소라','별아 보고 싶어'],
  ['2004.06.19 18:30','바다소라','별아 어디 갔어? 왜 말도 없이 이사 갔어? 전화번호도 바뀌었던데 ㅠㅠ 이거 보면 꼭 연락해'],
  ['2004.05.30 18:05','바다소라','오늘 묻은 거 절대 먼저 파면 안 됨!! ㅋㅋ 2년 뒤에 보자 ☆'],
  ['2004.05.03 17:12','같은반친구','별 홈피 방가방가~ 별 사진 예쁘다 ^^'],
  ['2004.05.02 21:40','바다소라','별아 1등!! 홈피 예쁘다 ♡ 우리 다락방 또 놀러 가도 돼?']],
 after:[['2006.05.30 16:33','★','늦어서 미안. 버스가 막혔어. 지금 교문 앞이야. 떡볶이는 내가 살게.'],['2006.05.30 16:31','바다소라','별아!!!!! 진짜 오는 거지?? 철봉 앞이야. 유리병 꺼냈어. 같이 열자 ㅠㅠㅠ']],
 letter:['소라야, 이 문까지 열었구나. 역시 너는 내 단짝이야.','라면 끓여서 다락방에서 별 보던 거 기억나? 나는 그때가 제일 좋았어.','야, 근데 나 내일 이사 가. 아빠 가게가 문을 닫아서 시골 할머니 집으로 간대. 얼굴 보고 말하면 울 것 같아서 말 못 했어. 미안해.','고마웠어. 전학 온 첫날 나한테 먼저 말 걸어 준 것도, 무거운 망원경 같이 들어 준 것도.','마지막으로 약속 하나만 다시 하자. 2006년 5월 30일 오후 4시 30분, 철봉 앞에서 타임캡슐 같이 열기. 내가 꼭 갈게.','워낙 길치라서 조금 늦을 수도 있지만, 북극성처럼 늘 같은 자리에 있을게. 너도 거기 있어 줘.'],
 ps:'2년 동안 이 다락방에 아무도 안 와서 혼자 매일 밤 들어왔어. 투데이가 혼자 올라간다고 소문났다던데, 그거 나야 ㅋㅋ 놀랐지? 할머니 집 근처 읍내 PC방에서 들어왔어. 이제 진짜 내일이야. 첫차 타고 갈게.',
 last:'지금 이 편지를 읽는 사람이 소라가 아니라도 괜찮아. 2년 동안 비밀의 방까지 온 사람은 네가 처음이야. 와 줘서 고마워. 혹시 소라를 만나면 전해 줘. 별이가 오고 있다고.',
 source:['<html>','<head>','<title>☆ 별이네 다락방 ☆</title>','<!-- 만든 날: 2004.05.02 / 만든 사람: 한별 (4학년 2반) -->','<!-- 다시 연 날: 2006.05.29 -->','<bgsound src="byeol.mid" loop="-1">','</head>','<body bgcolor="#0b1530" text="#fff6c8">','<!-- 비밀의 방 열쇠는 두 개. 하나는 하늘에 있고, 하나는 달력에 있다. -->','<!-- 하늘에 있는 열쇠: 다른 별은 다 움직여도 그 별은 움직이지 않는다. -->','<!-- 달력에 있는 열쇠: 일기는 처음부터 읽을 것. 우리가 땅을 판 날. -->','<!-- 소라야, 별이네 다락방 소개에 흰 글씨로 숨겨 둔 게 있어. 긁어 봐. -->','<script>/* 오른쪽 클릭 금지 */</script>','</body>','</html>']
};
const POLARIS={x:260,y:30},DIPPER=[[300,170],[308,198],[268,214],[258,184],[222,178],[192,186],[160,206]];
function starState(k){if(!k.star||typeof k.star!=='object'||Array.isArray(k.star))k.star={};const s=k.star;for(const n of ['visits','door1','door2','wrong','done','polaris','saved'])if(!Number.isFinite(s[n])||s[n]<0)s[n]=0;return s}
function nightSky(g,W,H){
 const grd=g.createLinearGradient?g.createLinearGradient(0,0,0,H):null;if(grd){grd.addColorStop(0,'#030818');grd.addColorStop(1,'#14244a');g.fillStyle=grd}else g.fillStyle='#071030';g.fillRect(0,0,W,H);
 let seed=20040612;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296};
 for(let i=0;i<90;i++){const x=rnd()*W,y=rnd()*H,r=rnd()*1.1+.3;g.fillStyle='rgba(255,255,255,'+(.25+rnd()*.45).toFixed(2)+')';g.fillRect(x,y,r,r)}
 const dot=(x,y,r,col)=>{g.fillStyle=col;g.beginPath&&g.beginPath();if(g.arc){g.arc(x,y,r,0,Math.PI*2);g.fill()}else g.fillRect(x-r,y-r,r*2,r*2)};
 for(const [x,y] of DIPPER)dot(x,y,2.6,'#fffbe6');
 dot(POLARIS.x,POLARIS.y,2.1,'#fff6c8');
 g.fillStyle='rgba(25,18,10,.9)';g.fillRect(0,0,W,6);g.fillRect(0,H-6,W,6);g.fillRect(0,0,6,H);g.fillRect(W-6,0,6,H);g.fillRect(W/2-3,0,6,H);g.fillRect(0,H/2-3,W,6)}
function starPage(page,env){
 const {E,B,go,r,k,ctx}=env,st=starState(k),X=ctx.X;
 const showSource=()=>{if(!X||!X.ui||!X.ui.dialog)return;const pre=E('pre','st-src',STAR.source.join('\n'));X.ui.dialog({title:'byeol-attic.freehomi.net - 메모장',node:pre,icon:'info',buttons:[['닫기']]})};
 page.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();if(!X||!X.ui||!X.ui.menu){K.ie(env,'마우스 오른쪽 버튼은 사용할 수 없습니다. 별이 허락 없이 퍼 가면 안 돼요!');return}
  const d=X.desk&&X.desk.getBoundingClientRect?X.desk.getBoundingClientRect():{left:0,top:0};X.ui.menu((e.clientX||80)-d.left,(e.clientY||80)-d.top,[['소스 보기(V)',showSource,{bold:true}],['새로 고침(F)',()=>ctx.rerender()],'-',['속성(R)',()=>K.ie(env,'주소: http://byeol-attic.freehomi.net/  ·  만든 날짜: 2004년 5월 2일  ·  수정한 날짜: 2006년 5월 29일','info')]])});
 K.sparkle(env,page);
 const total=1129+st.visits;
 if(r.type==='home'){
  const sp=E('div','st-splash');sp.append(E('div','st-twinkle','☆ ★ ☆ ★ ☆'),E('h1','st-title','별이네 다락방'),E('p','st-welcome','어서 와. 여기는 별이의 비밀 다락방이야.'),E('p','st-update','LAST UPDATE 2004.06.17'));
  const cnt=E('p','st-count');cnt.append(E('span','','TODAY '),K.digits(E,1,3,'sm'),E('span','','  TOTAL '),K.digits(E,total,6));sp.append(cnt,B('▲ 사다리 타고 다락방으로 올라가기',()=>go({type:'main'}),'st-enter'),E('small','st-best','Best view: 1024*768 · BGM: '+STAR.bgm+' · 오른쪽 클릭 금지'));page.append(sp);return}
 if(r.type==='main'&&!r.seen){r.seen=true;st.visits++;ctx.save()}
 const frame=E('div','st-frame'),side=E('nav','st-side'),main=E('main','st-main');
 side.append(E('b','st-side-title','☆ 별이네 다락방 ☆'));
 for(const [type,label] of [['main','다락방 소개'],['about','별이는요'],['diary','별 일기'],['album','별 사진첩'],['guest','방명록'],['room',st.done?'비밀의 방 (열림)':'비밀의 방 (잠김)']])side.append(B('· '+label,()=>go({type}),'st-menu'+(r.type===type?' on':'')+(type==='room'?' lock':'')));
 const bgm=E('div','st-bgm'),eq=E('span','hp-eq on');for(let i=0;i<5;i++)eq.append(E('i'));bgm.append(E('b','','♪ '),E('span','',STAR.bgm),eq);side.append(bgm);
 const cnt=E('div','st-cnt');cnt.append(E('span','','TODAY '),K.digits(E,1,3,'sm'),E('br'),E('span','','TOTAL '),K.digits(E,total,6,'sm'));side.append(cnt);
 frame.append(side,main);page.append(frame,E('footer','st-foot','Copyright ⓒ 2004 별이네 다락방. 만든 사람: 별이 (4학년 2반)'));
 if(r.type==='main'){
  main.append(E('h2','st-h','☆ 별이네 다락방에 온 걸 환영해 ☆'),E('p','st-p','안녕! 나는 별이야. 우리 집 다락방에는 작은 창문이 있는데, 밤이 되면 거기로 별이 엄청 많이 보여. 이 홈페이지는 그 다락방을 옮겨 놓은 곳이야. 신발 벗고 들어와 ^^'));
  const nw=E('div','st-news');nw.append(E('h3','','☆ 다락방 소식 ☆'));if(st.done){const p=E('p','st-new2','2006.05.30  문이 열렸어요. 와 줘서 고마워요.');nw.append(p)}
  const fresh=E('p','st-new','2006.05.29  문을 다시 열었어. 내일이야.');fresh.append(E('em','',' NEW'));nw.append(fresh);for(const [d,t] of STAR.news)nw.append(E('p','',d+'  '+t));main.append(nw);return}
 if(r.type==='about'){
  main.append(E('h2','st-h','☆ 별이는요 · 30문 30답 (12개만 했어요 ㅋㅋ) ☆'));const t=E('table','st-table');for(const [q,a] of STAR.qa){const tr=E('tr');tr.append(E('th','',q),E('td','',a));t.append(tr)}main.append(t);
  const hid=E('div','st-hidebox'),txt=E('p','st-hidden','첫 번째 열쇠는 내가 제일 좋아하는 별의 이름. 두 번째 열쇠는 소라랑 다시 만나기로 한 날 (숫자 네 자리). 둘 다 알면 비밀의 방 문이 열려.');
  txt.title='';hid.addEventListener('dblclick',()=>hid.classList.toggle('peek'));hid.append(txt);main.append(E('p','st-hint','↓ 아래 빈칸에 뭐가 있을까? 마우스로 쭉 긁어 봐 ^^ (두 번 누르면 살짝 보여)'),hid);return}
 if(r.type==='diary'){
  main.append(E('h2','st-h','☆ 별 일기 ☆'));
  for(const [d,t] of STAR.diaryNew){const e=E('article','st-diary new');e.append(E('b','',d),E('p','',t));main.append(e)}
  main.append(E('p','st-gap','· · · 2년 동안 아무것도 쓰지 않았다 · · ·'));
  for(const [d,t] of STAR.diary){const e=E('article','st-diary');e.append(E('b','',d),E('p','',t));main.append(e)}
  main.append(E('p','st-hint','일기는 아래에서부터 위로 읽으면 순서대로예요.'));return}
 if(r.type==='album'){
  main.append(E('h2','st-h','☆ 별 사진첩 ☆'),E('p','st-p','2004.06.12 다락방 창문으로 찍은 북두칠성. 디카가 아니라 아빠 필름 카메라로 찍어서 스캔했어요. 이 사진 속에 내가 제일 좋아하는 별이 있어. 찾아서 눌러 봐!'));
  const cv=E('canvas','st-sky');cv.width=400;cv.height=260;const g=cv.getContext?cv.getContext('2d'):null;if(g){try{nightSky(g,400,260)}catch(_){}}
  const out=E('p','st-found',st.polaris?'★ 찾았구나! 그 별이 북극성이야. 내가 제일 좋아하는 별. 늘 같은 자리에 있는 별.':'');let miss=0;
  cv.addEventListener('click',e=>{const rc=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0,width:400,height:260};const x=((e.clientX||0)-rc.left)*400/Math.max(1,rc.width||400),y=((e.clientY||0)-rc.top)*260/Math.max(1,rc.height||260);
   if(Math.hypot(x-POLARIS.x,y-POLARIS.y)<=16){if(!st.polaris){st.polaris=1;ctx.save()}ctx.rerender();return}
   miss++;out.textContent=DIPPER.some(([a,b])=>Math.hypot(x-a,y-b)<=12)?'그건 북두칠성 별이야. 국자 끝 두 별을 이어서 그 길이만큼 다섯 번 가 봐!':miss>2?'힌트: 국자에서 물 담는 쪽 끝 두 별을 이으면 위쪽을 가리켜.':'거기는 그냥 별이야 ^^'});
  main.append(cv,out);
  if(st.polaris){const sh=X&&X.shell,keep=E('div','st-keep');
   keep.append(B(st.saved?'내 그림 폴더에 저장됨 ✔':'이 사진을 내 그림으로 저장',()=>{if(!sh||!sh.picSave||!cv.toDataURL)return;let url='';try{url=cv.toDataURL('image/png')}catch(_){}const res=url?sh.picSave('별이네 북두칠성.png',url,400,260):{ok:false};if(res.ok){st.saved=1;ctx.save();toast(env,'별이네 다락방','내 문서의 내 그림 폴더에 ‘별이네 북두칠성.png’를 저장했어요.');ctx.rerender()}else K.ie(env,'저장하지 못했습니다. 내 그림 폴더가 가득 찼는지 확인해 주세요.')},'st-btn'),
    B('바탕 화면으로 설정',()=>{if(!sh||!sh.picSave||!sh.wallpaperImage||!cv.toDataURL)return;let url='';try{url=cv.toDataURL('image/png')}catch(_){}const res=url?sh.picSave('별이네 북두칠성.png',url,400,260):{ok:false};if(res.ok&&sh.wallpaperImage('pic:'+res.pic.id,res.pic.name,'fill')){st.saved=1;ctx.save();toast(env,'바탕 화면','별이네 북두칠성으로 바탕 화면을 바꿨어요.')}},'st-btn'));
   main.append(keep)}
  const grid=E('div','st-xgrid');for(const cap of ['토성 고리 (흔들려서 망함 ㅠㅠ)','소라랑 철봉 앞에서 (2004.05.30)','다락방 창문','망원경이랑 나']){const f=E('figure','st-xphoto'),x=E('div','cl-xbox');x.append(E('i','','×'));f.append(x,E('figcaption','',cap));grid.append(f)}main.append(grid);return}
 if(r.type==='guest'){
  main.append(E('h2','st-h','☆ 방명록 ☆'));
  main.append(K.postForm(env,{cls:'st-form',nick:'',nickPh:'이름',textPh:'다락방에 흔적 남기기',max:80,btn:'남기기'},(a,b)=>{K.pushTo(k,'gb','star','['+a+'] '+b,12);ctx.save();ctx.rerender()}));
  for(const t of K.listOf(k,'gb','star',12).slice().reverse())main.append(E('p','st-gb mine',t+'  (2006.05.30)'));
  const list=(st.done?STAR.after:[]).concat(STAR.guest);for(const [d,n,t] of list){const p=E('div','st-gb'+(n==='★'?' owner':'')+(d.startsWith('2006.05.30')?' fresh':''));p.append(E('b','',n),E('small','',' '+d),E('p','',t));main.append(p)}return}
 if(r.type==='room'){
  main.append(E('h2','st-h','☆ 비밀의 방 ☆'));
  const norm=s=>String(s||'').toLowerCase().replace(/[\s.,!?~☆★'"]/g,'');
  const door=(q,check,hints,onOk)=>{let tries=0;const box=E('div','st-door'),msg=E('p','st-msg','');box.append(E('p','st-q',q));const f=E('form','ws-form st-form'),inp=K.field(E,'열쇠를 넣으세요',16,'열쇠'),btn=B('문 열기',()=>{},'st-btn');btn.type='submit';f.append(inp,btn);
   f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const v=inp.value;if(!norm(v))return;if(check(norm(v))){onOk();ctx.save();ctx.rerender();return}st.wrong++;tries++;ctx.save();msg.textContent=hints[Math.min(hints.length-1,Math.floor((tries-1)/2))];inp.value=''});
   box.append(f,msg);main.append(box)};
  if(!st.door1){main.append(E('p','st-p','문이 굳게 잠겨 있다. 문에 작은 글씨가 쓰여 있다. “소라만 열 수 있음 (소라 아니면 들어오지 마!!)”'));
   door('첫 번째 문: 내가 제일 좋아하는 별의 이름은?',v=>['북극성','폴라리스','polaris','북극별'].includes(v),['땡! 다시 생각해 봐.','힌트: 별이는요 에 써 놨어. 늘 같은 자리에 있는 별.','힌트: 길을 잃으면 찾는 별. 북쪽에 있어.'],()=>{st.door1=1});return}
  if(!st.door2){main.append(E('p','st-p st-open1','철컥. 첫 번째 문이 열렸다. 그 안에 문이 하나 더 있다. 이번 문에는 숫자 자물쇠가 달려 있다.'));
   door('두 번째 문: 소라랑 다시 만나기로 한 날은? (숫자 네 자리)',v=>{const dg=v.replace(/\D/g,'');return dg==='0530'||dg==='530'||dg==='20060530'},['땡! 다시 생각해 봐.','힌트: 별 일기를 처음부터 읽어 봐.','힌트: 우리가 타임캡슐을 묻은 날이랑 같은 날이야. 월과 일, 네 자리.'],()=>{st.door2=1;st.done=1});return}
  const letter=E('div','st-letter');letter.append(E('p','st-date','2004년 6월 17일, 다락방에서'));const lines=E('div','st-lines');for(const l of STAR.letter){const p=E('p','');p.append(E('b','st-first',l.slice(0,1)),E('span','',l.slice(1)));lines.append(p)}letter.append(lines,E('p','st-sign','- 별이가 -'),E('p','st-ps0','P.S. 첫 글자만 세로로 읽어 봐 ㅋㅋ'));
  const tog=B('세로로 읽기',()=>{letter.classList.toggle('vert');tog.textContent=letter.classList.contains('vert')?'다시 보통으로':'세로로 읽기'},'st-btn');letter.append(tog);
  const ps=E('div','st-ps');ps.append(E('b','','2006년 5월 29일에 덧붙임'),E('p','',STAR.ps));letter.append(ps,E('p','st-lastline',STAR.last));
  main.append(E('p','st-p st-open1','철컥. 두 번째 문이 열렸다. 다락방 구석에 편지 한 통과 작은 망원경이 놓여 있다.'),letter);
  const done=E('div','st-done');done.append(E('b','','★ 별이네 다락방의 비밀을 모두 풀었습니다 ★'),E('small','','틀린 열쇠 '+st.wrong+'번 · 방명록에 새 글이 올라왔어요'),B('방명록 보러 가기',()=>go({type:'guest'}),'st-btn'));main.append(done);return}
 K.site404(env)}

/* ---------- 등록 ---------- */
WS.register('w-novel',{key:'novel',domain:'www.soseolnara.com',caption:'소설나라 - 우리들의 인터넷 소설',name:'소설나라',types:['home','novel','read','board'],linkCat:'읽을거리',desc:'요즘 제일 인기 있는 인터넷 소설 연재',star:5,tags:'인터넷 소설 인소 연재 소설 로맨스 얼짱 소설나라 별똥별 강준 소은',fav:true,isNew:true},novelPage);
WS.register('w-class',{key:'cls',domain:'sky62.classnet.co.kr',caption:'해솔초등학교 6학년 2반 하늘반',name:'6학년 2반 하늘반',types:['home','notice','album','board','post'],linkCat:'내 홈페이지',desc:'해솔초 6학년 2반 학급 홈페이지',star:3,tags:'학급 홈페이지 초등학교 6학년 하늘반 해솔초 알림장 우리 반 타임캡슐 수학여행',fav:true,isNew:true},clsPage);
WS.register('w-emo',{key:'emo',domain:'www.emoticon-world.co.kr',caption:'이모티콘 세상 - 특수문자 · 대화명 꾸미기',name:'이모티콘 세상',types:['home','list','name','alien'],linkCat:'재미있는 곳',desc:'이모티콘, 대화명 꾸미기, 외계어 번역기',star:5,tags:'이모티콘 특수문자 대화명 꾸미기 외계어 번역기 하트 미니홈피 버디버디 메신저 꾸미기',fav:true,isNew:true},emoPage);
WS.register('w-xfile',{key:'xfile',domain:'www.mystery-xfile.com',caption:'미스터리 X파일 - 세계의 불가사의와 UFO',name:'미스터리 X파일',types:['home','read','ufo','esp'],linkCat:'신기한 곳',desc:'세계의 불가사의, UFO 목격 제보, 초능력 테스트',star:4,tags:'미스터리 UFO 외계인 불가사의 버뮤다 네스호 네시 미스터리 서클 모아이 초능력 X파일 괴생명체 퉁구스카 로즈웰',fav:true,isNew:true},xfilePage);
WS.register('w-star',{key:'star',domain:'byeol-attic.freehomi.net',caption:'☆ 별이네 다락방 ☆',name:'별이네 다락방',types:['home','main','about','diary','album','guest','room'],hidden:true,deadLink:'별이네 다락방 (2004년 이후 업데이트 없음)'},starPage);
w.WebMore={alien,circled,STAR,CLS,EMO,POLARIS,DIPPER,starState,version:'A94'};
})(window);
