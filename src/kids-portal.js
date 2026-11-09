/* A89: 어린이 포털 두 곳. 주니어네이버(초록, 왼쪽 메뉴가 있는 3단)와 야후꾸러기(노랑과 보라, 위쪽 둥근 탭)를
   서로 다른 틀로 그린다. 글은 kids-data.js 에서 사이트마다 따로 가져온다. 그림 파일은 쓰지 않고 CSS로만 그린다.
   A94: 읽을거리(주니어네이버)와 꾸러기 백과(야후꾸러기) 칸을 더했다. 분야별로 골라 읽고, 글 끝에 '알고 있나요?'와 함께 읽을 글이 붙는다. */
(function(w){'use strict';
const SITES={
 jr:{name:'주니어네이버',caption:'주니어네이버',domain:'jr.naver.com',
  menu:[['home','홈'],['news','어린이 뉴스'],['qa','주니어 지식in'],['extra','숙제 도우미'],['story','동화 나라'],['read','읽을거리'],['quiz','퀴즈 왕'],['arcade','놀이터'],['board','친구 사귀기']],
  title:{news:'어린이 뉴스',qa:'주니어 지식in',extra:'숙제 도우미',story:'동화 나라',read:'읽을거리',quiz:'퀴즈 왕',arcade:'놀이터',board:'친구 사귀기'},
  kind:{news:'news',qa:'kin',extra:'help',story:'story',read:'read',quiz:'quiz',board:'board'},games:['mole','rain','memory','breakout'],
  nicks:['별사탕','콩콩이','하늘이','초코쿠키','나비야','튼튼이','다람쥐','꼬마박사']},
 yk:{name:'야후꾸러기',caption:'야후! 꾸러기',domain:'kids.yahoo.co.kr',
  menu:[['news','꾸러기 신문'],['qa','척척박사'],['extra','놀이 과학'],['story','이야기 보따리'],['read','꾸러기 백과'],['arcade','꾸러기 오락실'],['quiz','오늘의 퀴즈'],['board','꾸러기 광장']],
  title:{news:'꾸러기 신문',qa:'척척박사',extra:'놀이 과학',story:'이야기 보따리',read:'꾸러기 백과',quiz:'오늘의 퀴즈',arcade:'꾸러기 오락실',board:'꾸러기 광장'},
  kind:{news:'news',qa:'qna',extra:'play',story:'story',read:'read',quiz:'quiz',board:'board'},games:['dodge','snake','numbers','balloon'],
  nicks:['딱지왕','구슬공주','개구쟁이','방방이','토끼눈','달려라하니','냠냠이','꾸러기1호']}
};
const SECTION_OF={};for(const id of Object.keys(SITES)){SECTION_OF[id]={};for(const [sec,kind] of Object.entries(SITES[id].kind))SECTION_OF[id][kind]=sec}
const RANK_SEED={mole:[28,24,20,16,12],rain:[900,720,560,420,300],memory:[136,128,112,96,80],breakout:[450,360,280,210,120],dodge:[720,610,480,360,240],snake:[290,240,190,140,90],numbers:[560,480,420,350,280],balloon:[78,64,52,40,28]};
const GLYPH={mole:'●',rain:'ㄱ',memory:'?',breakout:'▬',dodge:'▼',snake:'~',numbers:'25',balloon:'○'};
const RULES=['내 이름, 학교, 집 주소, 전화번호는 인터넷에 쓰지 않아요.','모르는 사람이 만나자고 하거나 선물을 준다고 하면 부모님께 바로 말씀드려요.','친구에게 기분 나쁜 말을 쓰지 않아요. 내가 쓴 글도 누군가 읽는다는 것을 기억해요.','비밀번호는 친구에게도 알려 주지 않고, 컴퓨터를 쓰고 나면 꼭 로그아웃해요.','이상한 쪽지나 파일, 주소 링크는 열지 않고 어른께 보여 드려요.','게임은 30분 하면 5분은 눈을 쉬어요.'];
const PRIVATE=/\d{2,4}[-. ]?\d{3,4}[-. ]?\d{4}|@[a-z0-9]|https?:|www\./i;
let active=null;
const stop=()=>{if(active){try{active.stop()}catch(_){}active=null}};
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const D=()=>w.KidsData||{jr:{},yk:{}};
const kindName=(site,section)=>SITES[site].kind[section];
const items=(site,section)=>(D()[site]||{})[kindName(site,section)]||[];
function findItem(site,id){const data=D()[site]||{};for(const kind of Object.keys(data)){const item=(data[kind]||[]).find(x=>x.id===id);if(item)return{kind,item,section:SECTION_OF[site][kind]}}return null}
const hitsOf=item=>item.hits||120+hash(item.id)%880;
const when=item=>'2006.'+item.at;

function kstate(ctx){const s=ctx.saved;if(!s.kids||typeof s.kids!=='object'||Array.isArray(s.kids))s.kids={};const k=s.kids;for(const n of ['comments','scores','quiz'])if(!k[n]||typeof k[n]!=='object'||Array.isArray(k[n]))k[n]={};return k}
const guestComments=(k,id)=>Array.isArray(k.comments[id])?k.comments[id].filter(x=>typeof x==='string').slice(-12):[];
const bestOf=(k,id)=>Number.isFinite(k.scores[id])?k.scores[id]:0;

/* ---------- 공통 조각 ---------- */
function section(env,parent,title,more,cls){const {E}=env,n=E('section','k-box '+(cls||'')),h=E('div','k-box-head');h.append(E('h3','',title));if(more)h.append(env.B('더보기 ▶',()=>env.go(more),'k-more'));n.append(h);const body=E('div','k-box-body');n.append(body);parent.append(n);return body}
function line(env,parent,item,sec,meta){const {E}=env,row=E('div','k-line'),b=env.B(item.title,()=>env.go({type:'item',id:item.id}),'k-link');row.append(b);if(meta)row.append(E('small','',meta));parent.append(row);return row}
function paragraphs(env,parent,text,cls){for(const p of String(text).split(/\n\n+/)){if(/^■ /.test(p))parent.append(env.E('h4','k-sub',p.slice(2)));else parent.append(env.E('p',cls||'k-p',p))}}
function crumbs(env,parent,list){const {E}=env,n=E('nav','k-crumbs');n.append(env.B('홈',()=>env.go({type:'home'}),'k-crumb'));for(const [label,route] of list){n.append(E('span','','›'));if(route)n.append(env.B(label,()=>env.go(route),'k-crumb'));else n.append(E('b','',label))}parent.append(n)}
function searchForm(env,parent,cls,placeholder){const {E}=env,form=E('form','k-search '+(cls||'')),input=E('input');input.type='text';input.maxLength=20;input.placeholder=placeholder;input.setAttribute('aria-label','검색어');input.value=env.r.type==='search'?(env.r.query||''):'';const btn=env.B('검색',()=>{},'k-search-btn');btn.type='submit';form.append(input,btn);form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim().slice(0,20);if(q)env.go({type:'search',query:q})});parent.append(form)}
function nickFor(env,item,i){const pool=SITES[env.site].nicks;return pool[(hash(item.id)+i*3)%pool.length]}

function commentList(env,parent,item){
 const {E}=env,k=env.k,box=E('section','k-comments');box.append(E('h4','','친구들의 한마디'));
 let n=0;for(const [i,text] of (item.replies||[]).entries()){
  const gone=/^※ 운영자에 의해 삭제된 댓글입니다\.?$/.test(text),nested=/^ㄴ\s/.test(text),row=E('p','k-cm'+(nested?' k-nested p87-nested':'')+(gone?' k-gone p88-deleted':''));
  const named=/^([^:\s]{1,12})::\s*([\s\S]*)$/.exec(text);
  if(gone)row.textContent=text;else if(named){n++;row.classList.add('k-named');row.append(E('b','',named[1]),E('span','',named[2]))}else{n++;row.append(E('b','',nickFor(env,item,i)),E('span','',nested?text.replace(/^ㄴ\s*/,''):text))}
  box.append(row)}
 for(const text of guestComments(k,item.id)){const row=E('p','k-cm k-mine');row.append(E('b','','게스트'),E('span','',text));box.append(row)}
 const form=E('form','k-cm-form'),input=E('input'),msg=E('p','k-warn');input.type='text';input.maxLength=80;input.placeholder='예쁜 말로 한마디 남겨요';input.setAttribute('aria-label','댓글');
 const ok=env.B('등록',()=>{},'k-btn');ok.type='submit';form.append(input,ok);
 form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim().slice(0,80);if(!text)return;if(PRIVATE.test(text)){msg.textContent='전화번호나 이메일, 인터넷 주소 같은 개인정보는 쓸 수 없어요.';return}k.comments[item.id]=[...guestComments(k,item.id),text].slice(-12);env.ctx.save();env.ctx.rerender()});
 box.append(form,msg);parent.append(box)}

/* ---------- 퀴즈 ---------- */
function quizAnswered(env,q){return Number.isInteger(env.k.quiz[q.id])}
function quizBlock(env,parent,q,after){
 const {E}=env,k=env.k,card=E('section','k-quiz-card'),chosen=k.quiz[q.id],done=Number.isInteger(chosen);
 card.append(E('p','k-quiz-q',q.q));const list=E('div','k-quiz-choices');
 q.c.forEach((text,i)=>{const b=env.B((i+1)+'. '+text,()=>{if(Number.isInteger(k.quiz[q.id]))return;k.quiz[q.id]=i;env.ctx.save();env.ctx.rerender()},'k-choice'+(done?(i===q.a?' right':i===chosen?' wrong':''):''));if(done)b.disabled=true;list.append(b)});card.append(list);
 if(done){card.append(E('p','k-quiz-result '+(chosen===q.a?'ok':'no'),chosen===q.a?'딩동댕! 정답이에요.':'땡! 정답은 '+(q.a+1)+'번이에요.'),E('p','k-quiz-why',q.why))}
 if(after)after(card);parent.append(card)}
function quizTotals(env){const qs=items(env.site,'quiz'),got=qs.filter(q=>quizAnswered(env,q)),right=got.filter(q=>env.k.quiz[q.id]===q.a);return{total:qs.length,done:got.length,right:right.length}}
function miniQuiz(env,parent){
 const qs=items(env.site,'quiz');if(!qs.length)return;
 if(!Number.isInteger(env.r.mini)||env.r.mini<0||env.r.mini>=qs.length){const f=qs.findIndex(x=>!quizAnswered(env,x));env.r.mini=f<0?0:f}
 const q=qs[env.r.mini];
 quizBlock(env,parent,q,card=>{if(quizAnswered(env,q))card.append(env.B('다음 문제 ▶',()=>{const n=qs.findIndex((x,i)=>i>env.r.mini&&!quizAnswered(env,x));env.r.mini=n<0?0:n;env.ctx.rerender()},'k-btn'))});
 parent.append(env.B('퀴즈 더 풀기 ▶',()=>env.go({type:'quiz'}),'k-more'))}
function quizPage(env,c){
 const {E,site}=env,qs=items(site,'quiz'),t=quizTotals(env);
 const tally=E('p','k-tally','맞힌 문제 '+t.right+' / '+t.total+'  (푼 문제 '+t.done+')');c.append(tally);
 const reset=()=>{for(const q of qs)delete env.k.quiz[q.id];env.ctx.save();env.ctx.rerender()};
 if(site==='jr'){for(const [i,q] of qs.entries()){const wrap=E('div','k-quiz-wrap');wrap.append(E('b','k-quiz-no','문제 '+(i+1)));quizBlock(env,wrap,q);c.append(wrap)}}
 else{const pick=Number.parseInt(env.r.query,10),idx=Number.isInteger(pick)&&pick>=0&&pick<qs.length?pick:Math.max(0,qs.findIndex(x=>!quizAnswered(env,x)));env.r.query=String(idx);
  if(t.done===t.total){const end=E('section','k-quiz-end');end.append(E('h3','','모든 문제를 풀었어요!'),E('p','','꾸러기 박사 점수는 '+t.right+'점이에요. 틀린 문제는 다시 풀어 보세요.'));c.append(end)}
  else{const dots=E('div','k-dots');qs.forEach((q,i)=>dots.append(E('i',(i===idx?'on ':'')+(quizAnswered(env,q)?'done':''))));c.append(dots);quizBlock(env,c,qs[idx],card=>{const nextIdx=qs.findIndex((x,i)=>i>idx&&!quizAnswered(env,x));if(quizAnswered(env,qs[idx])&&nextIdx>=0)card.append(env.B('다음 문제 ▶',()=>env.go({type:'quiz',query:String(nextIdx)}),'k-btn'))})}}
 c.append(env.B('처음부터 다시 풀기',reset,'k-btn k-reset'))}

/* ---------- 목록 ---------- */
function tableList(env,c,section,cols){
 const {E}=env,list=items(env.site,section),table=E('table','k-table'),head=E('tr');for(const h of cols.map(x=>x[0]))head.append(E('th','',h));table.append(head);
 const withAnswers=cols.length>5;[...head.children].forEach((th,i)=>{const wd=(withAnswers?[42,0,92,46,100,54]:[42,0,92,100,54])[i];if(wd)th.style.width=wd+'px'});
 list.forEach((item,i)=>{const tr=E('tr'),td=E('td','k-title'),b=env.B(item.title,()=>env.go({type:'item',id:item.id}),'k-link');td.append(b);const n=(item.replies||[]).length;if(n)td.append(E('small','k-re','['+n+']'));
  tr.append(E('td','k-no',String(list.length-i)),td,E('td','',item.nick||item.by||'운영자'));if(withAnswers)tr.append(E('td','',String((item.answers||[]).length)));tr.append(E('td','',when(item).slice(5)),E('td','',String(hitsOf(item))));table.append(tr)});
 c.append(table)}
function cardList(env,c,section){
 const {E}=env,list=items(env.site,section),wrap=E('div','k-cards');
 list.forEach((item,i)=>{const card=E('article','k-card'),no=E('b','k-card-no',String(i+1));const main=E('div','k-card-main'),b=env.B(item.title,()=>env.go({type:'item',id:item.id}),'k-link');
  const meta=[item.nick||item.by,item.at?when(item):'',item.answers?'답변 '+item.answers.length:'',item.replies?'댓글 '+item.replies.length:''].filter(Boolean).join(' · ');
  main.append(b,E('small','',meta),E('p','k-excerpt',String(item.body||(item.answers&&item.answers[0].text)||'').replace(/\n+/g,' ').slice(0,64)+'…'));card.append(no,main);wrap.append(card)});
 c.append(wrap)}
function boardPage(env,c){
 const {E,site}=env,note=E('p','k-warn');
 const bar=E('div','k-board-bar');bar.append(env.B('글쓰기',()=>{note.textContent='글쓰기는 어린이 회원 인증을 마친 친구만 할 수 있어요. 지금은 글마다 댓글로 이야기해 보세요!'},'k-btn'),note);c.append(bar);
 if(site==='jr')tableList(env,c,'board',[['번호'],['제목'],['글쓴이'],['날짜'],['조회']]);else cardList(env,c,'board')}
function listPage(env,c,section){
 const {E,site}=env,S=SITES[site];
 const head=E('div','k-sec-head k-sec-'+section);head.append(E('h2','',S.title[section]),E('p','',blurb(site,section)));c.append(head);
 if(section==='quiz')return quizPage(env,c);if(section==='arcade')return arcadePage(env,c);if(section==='board')return boardPage(env,c);if(section==='read')return readList(env,c);
 if(site==='jr'&&(section==='news'||section==='qa'))return tableList(env,c,section,section==='qa'?[['번호'],['질문'],['글쓴이'],['답변'],['날짜'],['조회']]:[['번호'],['제목'],['글쓴이'],['날짜'],['조회']]);
 cardList(env,c,section)}
/* ---------- 읽을거리 (A94) ---------- */
const CAT_COLOR={'과학':'#2f86d8','동물':'#38a85a','역사':'#b0632a','세계':'#8a5bd6','우주':'#1f3a8a','우리 몸':'#e0567a','환경':'#14998a','스포츠':'#e8890c','생활':'#7a7a2a','옛이야기':'#a0522d'};
const readMins=item=>Math.max(1,Math.round(String(item.body||'').replace(/\s/g,'').length/380));
function catBadge(env,cat){const b=env.E('span','k-cat',cat||'기타');b.style.background=CAT_COLOR[cat]||'#777';return b}
function readList(env,c){
 const {E,site}=env,list=items(site,'read'),cats=['전체',...Array.from(new Set(list.map(x=>x.cat)))],pick=cats.includes(env.r.query)?env.r.query:'전체';
 const chips=E('div','k-cats');for(const cat of cats)chips.append(env.B(cat,()=>env.go({type:'read',query:cat==='전체'?'':cat}),'k-chip'+(pick===cat?' on':'')));c.append(chips);
 const shown=list.filter(x=>pick==='전체'||x.cat===pick);
 if(site==='jr'){
  const table=E('table','k-table k-readtable'),head=E('tr');for(const [h,wd] of [['분야',64],['제목',0],['읽는 시간',70],['조회',54]]){const th=E('th','',h);if(wd)th.style.width=wd+'px';head.append(th)}table.append(head);
  for(const item of shown){const tr=E('tr'),cat=E('td','k-no');cat.append(catBadge(env,item.cat));const td=E('td','k-title');td.append(env.B(item.title,()=>env.go({type:'item',id:item.id}),'k-link'));const n=(item.replies||[]).length;if(n)td.append(E('small','k-re','['+n+']'));tr.append(cat,td,E('td','','약 '+readMins(item)+'분'),E('td','',String(hitsOf(item))));table.append(tr)}
  c.append(table)}
 else{
  const grid=E('div','ky-readgrid');for(const item of shown){const card=env.B('',()=>env.go({type:'item',id:item.id}),'ky-readcard');card.style.setProperty('--cat',CAT_COLOR[item.cat]||'#777');card.append(catBadge(env,item.cat),E('b','',item.title),E('small','',String(item.body||'').replace(/\n+/g,' ').replace(/■ /g,'').slice(0,46)+'…'),E('em','','재미 '+'★'.repeat(item.fun||3)+'☆'.repeat(5-(item.fun||3))+'  ·  약 '+readMins(item)+'분'));grid.append(card)}
  c.append(grid)}
 if(!shown.length)c.append(E('p','k-p','아직 이 분야의 글이 없어요.'))}
function readExtras(env,art,item){
 const {E,site}=env;
 if(item.fact){const f=E('div','k-fact');f.append(E('b','',site==='jr'?'알고 있나요?':'꾸러기 박사의 한마디'),E('p','',item.fact));art.append(f)}
 const more=items(site,'read').filter(x=>x!==item&&x.cat===item.cat).concat(items(site,'read').filter(x=>x!==item&&x.cat!==item.cat)).slice(0,3);
 if(more.length){const box=E('div','k-related');box.append(E('b','','함께 읽어요'));for(const x of more){const row=E('div','k-line');row.append(catBadge(env,x.cat),env.B(x.title,()=>env.go({type:'item',id:x.id}),'k-link'));box.append(row)}art.append(box)}}
function blurb(site,section){return({jr:{read:'궁금했던 이야기를 분야별로 골라 읽어요. 과학, 동물, 역사, 세계, 우주 이야기가 가득해요.',news:'어린이 기자가 전하는 이번 주 소식이에요.',qa:'궁금한 것을 물어보면 친구와 선생님이 답해 줘요.',extra:'숙제가 막힐 때 힌트를 얻어 가요.',story:'잠자리에서 읽기 좋은 짧은 이야기예요.',quiz:'퀴즈를 풀고 똑똑이 점수를 올려요.',arcade:'쉬는 시간에 즐기는 작은 오락이에요.',board:'친구들과 이야기를 나누는 곳이에요. 예쁜 말을 써요.'},yk:{read:'알쏭달쏭 궁금했던 것들, 꾸러기 백과에서 시원하게 알려 줄게요!',news:'꾸러기 기자단이 직접 취재한 소식이에요.',qa:'뭐든지 아는 척척박사가 알려 줘요.',extra:'집에서 쉽게 해 보는 재미있는 과학 놀이예요.',story:'옛이야기와 새 이야기를 모았어요.',quiz:'하루에 한 문제, 꾸러기 박사에 도전해요.',arcade:'꾸러기 친구들이 가장 좋아하는 오락 모음이에요.',board:'꾸러기 친구들의 이야기 마당이에요. 서로 존중해요.'}})[site][section]||''}

/* ---------- 글 읽기 ---------- */
function itemPage(env,c){
 const {E,site}=env,f=findItem(site,env.r.id);
 if(!f||f.kind==='quiz')return missing(env,c);
 const S=SITES[site],item=f.item,list=D()[site][f.kind];
 crumbs(env,c,[[S.title[f.section],{type:f.section}],[item.title.length>22?item.title.slice(0,22)+'…':item.title,null]]);
 const art=E('article','k-article k-'+f.kind),head=E('header','k-article-head');
 if(f.kind==='read')head.append(catBadge(env,item.cat));head.append(E('h2','',item.title),E('p','k-meta',[item.nick||item.by||(site==='jr'?'주니어 선생님':'꾸러기 선생님'),item.at?when(item):'',item.at?'조회 '+hitsOf(item):'',f.kind==='read'?'읽는 시간 약 '+readMins(item)+'분':''].filter(Boolean).join('  |  ')));art.append(head);
 if(item.answers){const q=E('div','k-q');q.append(E('b','k-qa','Q'));const qb=E('div');paragraphs(env,qb,item.body,'k-p');q.append(qb);art.append(q);
  item.answers.forEach(a=>{const row=E('div','k-a'+(a.pick?' pick':''));row.append(E('b','k-qa','A'));const ab=E('div');ab.append(E('strong','',a.n+(a.pick?'  (채택된 답변)':'')));paragraphs(env,ab,a.text,'k-p');row.append(ab);art.append(row)})}
 else paragraphs(env,art,item.body,'k-p');
 if(f.kind==='help'||f.kind==='play')art.append(E('p','k-tip','어른께 도움을 받아 안전하게 해 보세요.'));
 if(f.kind==='read')readExtras(env,art,item);
 c.append(art);commentList(env,c,item);
 const i=list.indexOf(item),nav=E('div','k-pager');
 if(i>0)nav.append(env.B('◀ 이전 글',()=>env.go({type:'item',id:list[i-1].id}),'k-btn'));nav.append(env.B('목록',()=>env.go({type:f.section}),'k-btn'));if(i<list.length-1)nav.append(env.B('다음 글 ▶',()=>env.go({type:'item',id:list[i+1].id}),'k-btn'));c.append(nav)}

/* ---------- 놀이터와 게임 ---------- */
function gameCard(env,parent,id,cls){const {E}=env,g=(w.KidsGames&&w.KidsGames.list||[]).find(x=>x.id===id);if(!g)return;
 const b=env.B('',()=>env.go({type:'game',id}),'k-game '+(cls||'')),tile=E('span','k-game-tile',GLYPH[id]||'?');b.append(tile,E('b','',g.title),E('small','','내 최고 '+bestOf(env.k,id)));b.title=g.help;parent.append(b);return b}
function arcadePage(env,c){const {E,site}=env,grid=E('div','k-games');for(const id of SITES[site].games)gameCard(env,grid,id);c.append(grid,E('p','k-tip','화면을 클릭하면 시작해요. 눈이 아프면 쉬었다가 다시 해요.'))}
function rankTable(env,parent,id){
 const {E,site}=env,seed=RANK_SEED[id]||[100,80,60,40,20],pool=SITES[site].nicks,rows=seed.map((s,i)=>({n:pool[(hash(id)+i)%pool.length],s,me:false}));
 const best=bestOf(env.k,id);if(best>0)rows.push({n:'게스트',s:best,me:true});rows.sort((a,b)=>b.s-a.s);
 const t=E('table','k-table k-rank');const h=E('tr');for(const x of ['순위','이름','점수'])h.append(E('th','',x));t.append(h);
 rows.slice(0,6).forEach((r,i)=>{const tr=E('tr',r.me?'me':'');tr.append(E('td','k-no',String(i+1)),E('td','',r.n),E('td','',String(r.s)));t.append(tr)});parent.append(t)}
function gamePage(env,c){
 const {E,site}=env,S=SITES[site],id=env.r.id;
 if(!w.KidsGames||!w.KidsGames.has(id))return missing(env,c);
 const def=w.KidsGames.list.find(x=>x.id===id);
 crumbs(env,c,[[S.title.arcade,{type:'arcade'}],[def.title,null]]);
 const head=E('div','k-sec-head k-sec-arcade');head.append(E('h2','',def.title),E('p','',def.help));c.append(head);
 const host=E('div','k-stage'),score=E('p','k-score','내 최고 점수 '+bestOf(env.k,id));
 c.append(host,score);
 active=w.KidsGames.run(id,host,{E,best:bestOf(env.k,id),onScore:(gid,s,isNew)=>{if(isNew){env.k.scores[gid]=s;env.ctx.save()}score.textContent=(isNew?'새 기록! ':'')+'내 최고 점수 '+bestOf(env.k,gid)}});
 const side=E('div','k-rank');side.append(E('h3','','오늘의 랭킹'));rankTable(env,side,id);c.append(side);
 const more=E('div','k-more-games');more.append(E('b','','다른 오락'));for(const g of S.games)if(g!==id)more.append(env.B((w.KidsGames.list.find(x=>x.id===g)||{}).title||g,()=>env.go({type:'game',id:g}),'k-link'));c.append(more);
 c.append(E('p','k-tip','게임은 30분 하면 5분은 눈을 쉬어요.'))}

/* ---------- 검색 ---------- */
function search(site,q){const term=String(q||'').toLowerCase().replace(/\s/g,'');if(!term)return[];const data=D()[site]||{},found=[];for(const kind of Object.keys(data)){if(kind==='quiz')continue;for(const item of data[kind]){const hay=(item.title+(item.body||'')+(item.answers||[]).map(a=>a.text).join('')).toLowerCase().replace(/\s/g,'');if(hay.includes(term))found.push({item,section:SECTION_OF[site][kind]})}}return found}
function searchPage(env,c){
 const {E,site}=env,q=env.r.query||'',found=search(site,q),head=E('div','k-sec-head');head.append(E('h2','','“'+q+'” 검색 결과'),E('p','',found.length+'개의 글을 찾았어요.'));c.append(head);
 for(const {item,section} of found){const row=E('div','k-hit');row.append(env.B(item.title,()=>env.go({type:'item',id:item.id}),'k-link'),E('small','',SITES[site].title[section]),E('p','k-excerpt',String(item.body||(item.answers&&item.answers[0].text)||'').replace(/\n+/g,' ').slice(0,70)+'…'));c.append(row)}
 if(!found.length)c.append(E('p','k-p','찾는 글이 없어요. 다른 낱말로 다시 검색해 보세요.'))}
function safetyPage(env,c){const {E}=env,head=E('div','k-sec-head');head.append(E('h2','','어린이 안전 이용 수칙'),E('p','','인터넷에서도 지켜야 할 약속이 있어요.'));c.append(head);const ol=E('ol','k-rules');for(const r of RULES)ol.append(E('li','',r));c.append(ol)}
function missing(env,c){const {E}=env;c.append(E('h2','','페이지를 찾을 수 없어요'),E('p','k-p','주소가 바뀌었거나 없어진 글이에요.'),env.B('처음 화면으로',()=>env.go({type:'home'}),'k-btn'))}

function content(env,c){
 const t=env.r.type;
 if(t==='home')return env.site==='jr'?homeJr(env,c):homeYk(env,c);
 if(['news','qa','extra','story','read','quiz','arcade','board'].includes(t))return listPage(env,c,t);
 if(t==='item')return itemPage(env,c);if(t==='game')return gamePage(env,c);if(t==='search')return searchPage(env,c);if(t==='safety')return safetyPage(env,c);
 const ex=EXTRA[env.site+':'+t];if(ex){const head=env.E('div','k-sec-head k-sec-'+t);head.append(env.E('h2','',SITES[env.site].title[t]||t),env.E('p','',ex.blurb||''));c.append(head);return ex.fn(env,c)}
 return missing(env,c)}
/* A95: 다른 파일에서 코너를 더 붙일 수 있다. KidsPortal.extend(site, type, label, render, blurb) */
const EXTRA={},TYPES=['home','news','qa','extra','story','read','quiz','arcade','board','item','game','search','safety'];
function extend(site,type,label,fn,blurb){if(!SITES[site]||!/^[a-z]{2,12}$/.test(type)||typeof fn!=='function'||TYPES.includes(type)&&!EXTRA[site+':'+type])return false;EXTRA[site+':'+type]={fn,blurb:blurb||''};if(!SITES[site].menu.some(m=>m[0]===type))SITES[site].menu.push([type,label]);SITES[site].title[type]=label;if(!TYPES.includes(type))TYPES.push(type);return true}

/* ---------- 주니어네이버 ---------- */
function mascot(E){const m=E('span','kj-mascot');m.setAttribute('aria-hidden','true');m.append(E('i','leaf'),E('i','eye l'),E('i','eye r'),E('i','mouth'));return m}
function homeJr(env,c){
 const {E,site}=env,news=items(site,'news'),top=section(env,c,'오늘의 어린이 뉴스',{type:'news'},'kj-news');
 const hl=E('div','kj-headline'),b=env.B(news[0].title,()=>env.go({type:'item',id:news[0].id}),'k-link big');hl.append(b,E('p','k-excerpt',news[0].body.replace(/\n+/g,' ').slice(0,86)+'…'));top.append(hl);
 for(const x of news.slice(1,5))line(env,top,x,'news',x.at);
 const two=E('div','kj-two');c.append(two);
 const kin=section(env,two,'주니어 지식in',{type:'qa'});for(const x of items(site,'qa').slice(0,5))line(env,kin,x,'qa','답변 '+x.answers.length);
 const help=section(env,two,'숙제 도우미',{type:'extra'});for(const x of items(site,'extra').slice(0,5))line(env,help,x,'extra');
 const st=items(site,'story')[0],story=section(env,c,'동화 나라',{type:'story'},'kj-story');story.append(env.B(st.title,()=>env.go({type:'item',id:st.id}),'k-link big'),E('p','k-excerpt',st.body.replace(/\n+/g,' ').slice(0,90)+'…'));
 const rd=items(site,'read');if(rd.length){const rbox=section(env,c,'오늘의 읽을거리',{type:'read'},'kj-read');for(const x of rd.slice(0,5)){const row=line(env,rbox,x,'read','약 '+readMins(x)+'분');row.insertBefore(catBadge(env,x.cat),row.firstChild)}}
 const bd=section(env,c,'친구 사귀기 · 새 글',{type:'board'},'kj-board');for(const x of items(site,'board').slice(0,5))line(env,bd,x,'board',x.nick+' · '+x.at)}
function sideJr(env,aside){
 const {E,site}=env,q=section(env,aside,'오늘의 퀴즈',{type:'quiz'},'kj-quiz');miniQuiz(env,q);
 const g=section(env,aside,'인기 오락',{type:'arcade'},'kj-hot');SITES[site].games.forEach((id,i)=>{const row=E('div','k-line'),b=env.B((i+1)+'. '+(w.KidsGames?w.KidsGames.title(id):id),()=>env.go({type:'game',id}),'k-link');row.append(b);g.append(row)});
 const n=section(env,aside,'공지사항',null,'kj-notice');for(const [t,route] of [['안전 이용 수칙을 꼭 읽어요',{type:'safety'}],['개인정보는 친구에게도 비밀',{type:'safety'}],['월드컵 응원 그림 모집',{type:'item',id:'jr-n1'}]]){const row=E('div','k-line');row.append(env.B('[공지] '+t,()=>env.go(route),'k-link'));n.append(row)}}
function renderJr(page,env){
 const {E}=env,top=E('div','kj-top');top.append(E('span','','2006.05.30 (화)'),env.B('NAVER',()=>env.ctx.navigate({type:'home',portal:'naver'}),'k-crumb'),env.B('시작페이지',()=>env.go({type:'home'}),'k-crumb'),env.B('안전 수칙',()=>env.go({type:'safety'}),'k-crumb'),E('span','kj-guest','PC방 게스트님'));
 const head=E('header','kj-head'),logo=env.B('',()=>env.go({type:'home'}),'kj-logo');logo.append(mascot(E),E('b','','주니어네이버'),E('small','','안전하고 즐거운 어린이 인터넷'));head.append(logo);searchForm(env,head,'kj-searchbox','궁금한 것을 입력해 보세요');page.append(top,head);
 const body=E('div','kj-body'),left=E('nav','kj-left'),main=E('main','kj-main'),isHome=env.r.type==='home';
 left.append(E('h3','','주니어 메뉴'));for(const [type,label] of SITES.jr.menu){const b=env.B(label,()=>env.go({type}),'kj-menu'+((env.r.type===type)?' on':''));left.append(b)}
 const rules=E('div','kj-rules');rules.append(E('b','','안전 수칙'),E('p','','이름, 주소, 전화번호는 비밀!'),env.B('자세히 보기',()=>env.go({type:'safety'}),'k-more'));left.append(rules);
 body.append(left,main);if(isHome){const aside=E('aside','kj-right');sideJr(env,aside);body.append(aside)}else body.classList.add('two');
 content(env,main);page.append(body);
 const foot=E('footer','kj-foot');foot.append(E('p','','주니어네이버는 만 14세 미만 어린이가 안전하게 쓰는 공간입니다. 부모님과 선생님의 관심이 필요해요.'),E('small','','Copyright © 2006 JUNIOR PORTAL. All Rights Reserved.'));page.append(foot)}

/* ---------- 야후꾸러기 ---------- */
const TILE_COLORS=['#ff6b4a','#e8890c','#38a85a','#2f86d8'];
const YK_COLORS=['#ff7a59','#ffb400','#4ec36a','#2f9be8','#8a5bd6','#e65aa8','#14b8a6'];
function homeYk(env,c){
 const {E,site}=env,hero=E('section','ky-hero'),left=E('div','ky-hero-l');left.append(E('h2','','오늘은 뭐하고 놀까?'),E('p','','클릭 한 번이면 오락 시작! 점수가 높으면 랭킹에 이름이 올라가요.'));
 const tiles=E('div','ky-tiles');SITES[site].games.forEach((id,i)=>{const b=gameCard(env,tiles,id,'ky-tile');if(b)b.style.background=TILE_COLORS[i%TILE_COLORS.length]});left.append(tiles);
 const right=E('div','ky-hero-r'),qb=section(env,right,'오늘의 퀴즈',{type:'quiz'},'ky-quizbox');miniQuiz(env,qb);hero.append(left,right);c.append(hero);
 const cols=E('div','ky-cols3');c.append(cols);
 const news=section(env,cols,'꾸러기 신문',{type:'news'},'ky-news');items(site,'news').slice(0,5).forEach((x,i)=>{const row=line(env,news,x,'news');row.insertBefore(E('b','ky-num',String(i+1)),row.firstChild)});
 const qa=section(env,cols,'척척박사',{type:'qa'},'ky-qa');for(const x of items(site,'qa').slice(0,5))line(env,qa,x,'qa','답변 '+x.answers.length);
 const play=section(env,cols,'놀이 과학',{type:'extra'},'ky-play');for(const x of items(site,'extra').slice(0,5))line(env,play,x,'extra');
 const cols2=E('div','ky-cols2');c.append(cols2);
 const st=items(site,'story')[0],story=section(env,cols2,'이야기 보따리',{type:'story'},'ky-story');story.append(env.B(st.title,()=>env.go({type:'item',id:st.id}),'k-link big'),E('p','k-excerpt',st.body.replace(/\n+/g,' ').slice(0,90)+'…'));
 const bd=section(env,cols2,'꾸러기 광장',{type:'board'},'ky-board');for(const x of items(site,'board').slice(0,5))line(env,bd,x,'board',x.nick);
 const rd=items(site,'read');if(rd.length){const rbox=section(env,c,'꾸러기 백과 · 오늘은 이게 궁금해!',{type:'read'},'ky-readbox'),grid=E('div','ky-readgrid mini');for(const x of rd.slice(0,4)){const card=env.B('',()=>env.go({type:'item',id:x.id}),'ky-readcard');card.style.setProperty('--cat',CAT_COLOR[x.cat]||'#777');card.append(catBadge(env,x.cat),E('b','',x.title));grid.append(card)}rbox.append(grid)}}
function renderYk(page,env){
 const {E}=env,head=E('header','ky-head'),logo=env.B('',()=>env.go({type:'home'}),'ky-logo');
 const word=E('span','ky-word');[['Y','#d6197c'],['A','#f58a1f'],['H','#2f9be8'],['O','#4ec36a'],['O','#8a5bd6'],['!','#d6197c']].forEach(([ch,col])=>{const s=E('i','',ch);s.style.color=col;word.append(s)});
 const face=E('span','ky-face');face.setAttribute('aria-hidden','true');face.append(E('i','tuft'),E('i','eye l'),E('i','eye r'),E('i','mouth'));logo.append(face,word,E('b','','꾸러기'));head.append(logo);
 const right=E('div','ky-head-r');searchForm(env,right,'ky-searchbox','꾸러기 검색');const util=E('div','ky-util');util.append(env.B('Yahoo! 코리아',()=>env.ctx.navigate({type:'home',portal:'yahoo'}),'k-crumb'),env.B('안전 수칙',()=>env.go({type:'safety'}),'k-crumb'),E('span','','꾸러기 친구 (PC방 게스트)'));right.append(util);head.append(right);page.append(head);
 const tabs=E('nav','ky-tabs');SITES.yk.menu.forEach(([type,label],i)=>{const b=env.B(label,()=>env.go({type}),'ky-tab'+(env.r.type===type?' on':''));b.style.setProperty('--tab',YK_COLORS[i%YK_COLORS.length]);tabs.append(b)});page.append(tabs);
 const main=E('main','ky-main');content(env,main);page.append(main);
 const foot=E('footer','ky-foot');foot.append(E('p','','부모님께: 야후꾸러기는 어린이를 위한 공간이에요. 자녀가 개인정보를 쓰지 않도록 함께 이야기해 주세요.'),E('small','','Copyright © 2006 KIDS PORTAL. All Rights Reserved.'));page.append(foot)}

function render(page,r,ctx){
 const site=ctx.portal();if(!SITES[site])return false;stop();
 page.classList.add('kids-site',site==='jr'?'kj':'ky');
 const env={ctx,site,S:SITES[site],r,k:kstate(ctx),E:ctx.E,B:ctx.B,go:route=>ctx.navigate({...route,portal:site})};
 if(site==='jr')renderJr(page,env);else renderYk(page,env);
 return true}
function resolveHost(host){host=String(host||'').toLowerCase();if(/(^|\.)kids\.yahoo\.(co\.kr|com)$/.test(host))return 'yk';if(/(^|\.)jr\.naver\.com$/.test(host)||/(^|\.)junior\.naver\.com$/.test(host))return 'jr';return null}
w.KidsPortal={owns:id=>!!SITES[id],caption:id=>SITES[id]?SITES[id].caption:'',domain:id=>SITES[id]?SITES[id].domain:'',resolveHost,types:TYPES,extend,kstate,render,stop,search,findItem,items,sites:SITES,rules:RULES,rankSeed:RANK_SEED,active:()=>active};
})(window);
