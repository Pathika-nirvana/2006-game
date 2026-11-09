/* A91: 포털과 따로 노는 2000년대 초중반 홈페이지 열 곳.
   개인 홈페이지, 엽기 사이트, 엽기 플래시 극장, 공포 사이트, 프로그램 자료실, 운세, 채팅, 팬클럽, 링크 모음, 귀여운 동물 사진방.
   KidsPortal 처럼 주소(w-로 시작하는 이름)를 가진 곳으로 등록해 인터넷 창에서 열린다. 그림 파일과 소리는 쓰지 않고 CSS와 캔버스로만 그린다.
   입력 칸은 닉네임과 한 줄 글뿐이고 비밀번호나 개인정보를 받는 화면은 없다.
   A94: 다른 파일(web-more.js)이 register()로 사이트를 더할 수 있다. 포털 검색에 쓰는 search(), 소름닷컴의 긴 글(연재, 불 끄고 읽기, 추천)이 더해졌다.
   화면 글은 2006년 5월 30일 기준이다. 그 뒤에 생긴 말(병맛, 힐링 등)은 쓰지 않는다. */
(function(w){'use strict';
const D=()=>w.WebData||{};
const SITES={
 'w-hompy':{key:'hompy',domain:'skydream.freehomi.net',caption:'★☆ 하늘이의 꿈꾸는 홈페이지 ☆★',name:'하늘이의 홈페이지',types:['home','main','profile','diary','gallery','guestbook','links']},
 'w-yeopgi':{key:'yeopgi',domain:'www.yeopgi.co.kr',caption:'엽기천국 - 오늘도 엽기 충전!',name:'엽기천국',types:['home','board','post','best','bait','fish','free','quiz']},
 'w-flash':{key:'flash',domain:'www.flashjang.com',caption:'플래시짱 - 엽기 플래시 극장',name:'플래시짱',types:['home','main','play']},
 'w-sorum':{key:'sorum',domain:'www.sorum.co.kr',caption:'소름닷컴 - 한여름밤의 괴담',name:'소름닷컴',types:['home','main','story','exp','stare','dark','curse']},
 'w-jaryo':{key:'jaryo',domain:'www.jaryo-mart.net',caption:'알짜배기 자료실',name:'알짜배기 자료실',types:['home','list','item']},
 'w-fate':{key:'fate',domain:'www.unse-test.com',caption:'오늘의 운세 · 심리테스트',name:'오늘의 운세',types:['home','luck','past','pair','iq']},
 'w-chat':{key:'chat',domain:'chat.suda-bang.net',caption:'수다방 채팅',name:'수다방 채팅',types:['home','room']},
 'w-fan':{key:'fan',domain:'www.byeolbit-fan.com',caption:'별빛소녀 공식 팬클럽',name:'별빛소녀 팬클럽',types:['home','board']},
 'w-links':{key:'links',domain:'www.linkheaven.co.kr',caption:'링크천국 - 재미있는 사이트 모음',name:'링크천국',types:['home']},
 'w-cute':{key:'cute',domain:'www.cuteanimal-pic.com',caption:'귀여운 동물 사진방',name:'귀여운 동물 사진방',types:['home']}
};
const ORDER=Object.keys(SITES);
/* A94: 포털 검색의 '사이트' 칸에 쓰는 낱말. 숨은 사이트(hidden)는 검색에 나오지 않는다. */
const TAGS={'w-hompy':'개인 홈페이지 홈피 방명록 일기 다이어리 프로필 하늘이','w-yeopgi':'엽기 웃긴 유머 낚시 자유게시판 퀴즈 웃긴글 엽기사진','w-flash':'플래시 애니메이션 졸라맨 게임 똥피하기 엽기 플래시','w-sorum':'괴담 공포 귀신 무서운 이야기 무서운이야기 실화 심령 소름 공포체험 군대 수련회','w-jaryo':'자료실 프로그램 무료 다운로드 공개 프로그램 바탕화면 부수기','w-fate':'운세 심리테스트 궁합 전생 아이큐 IQ 테스트 띠 운세','w-chat':'채팅 채팅방 수다 대화방 친구','w-fan':'팬클럽 별빛소녀 가수 팬 공식 팬카페','w-links':'링크 사이트 모음 추천 사이트 재미있는 사이트','w-cute':'고양이 동물 귀여운 사진 강아지 애완동물'};
const DESC={'w-hompy':'하늘이가 직접 만든 개인 홈페이지','w-yeopgi':'세상은 넓고 엽기는 많다! 엽기 유머 모음','w-flash':'엽기 플래시와 미니 게임','w-sorum':'무서운 이야기와 귀신 체험관 (심장 약한 분 주의)','w-jaryo':'공짜 프로그램 자료실','w-fate':'오늘의 운세와 심리테스트','w-chat':'심심할 때 들어오는 채팅방','w-fan':'별빛소녀 공식 팬클럽','w-links':'재미있는 사이트가 다 모인 곳','w-cute':'귀여운 동물 사진 모음'};
const bare=d=>d.replace(/^www\./,'');
function resolveHost(host){host=String(host||'').toLowerCase();for(const id of ORDER){const d=SITES[id].domain;if(host===d||bare(host)===bare(d))return id}return null}
function route(id,url){const S=SITES[id],type=url.pathname.replace(/^\/|\/$/g,'')||'home';return{type:S.types.includes(type)?type:'home',id:url.searchParams.get('id')||'',query:url.searchParams.get('query')||''}}
function urlOf(id,r){const S=SITES[id],q=[];if(r.id)q.push('id='+encodeURIComponent(r.id));if(r.query)q.push('query='+encodeURIComponent(r.query));return 'http://'+S.domain+'/'+(r.type==='home'?'':r.type)+(q.length?'?'+q.join('&'):'')}
/* ---------- 저장 값 ---------- */
const strs=(v,max)=>Array.isArray(v)?v.filter(x=>typeof x==='string').map(x=>x.slice(0,140)).slice(-max):[];
function kstate(ctx){const s=ctx.saved;if(!s.web||typeof s.web!=='object'||Array.isArray(s.web))s.web={};const k=s.web;
 for(const n of ['gb','cm','rec'])if(!k[n]||typeof k[n]!=='object'||Array.isArray(k[n]))k[n]={};
 for(const n of ['total','fish','scared','att','best'])if(!Number.isFinite(k[n])||k[n]<0)k[n]=0;
 if(typeof k.attDay!=='string')k.attDay='';return k}
const listOf=(k,bucket,key,max)=>{k[bucket][key]=strs(k[bucket][key],max||12);return k[bucket][key]};
const pushTo=(k,bucket,key,text,max)=>{const l=listOf(k,bucket,key,max);l.push(text);k[bucket][key]=l.slice(-(max||12))};
const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
/* ---------- 정리용 목록 ---------- */
let cleanups=[];
const later=(fn,ms)=>{const t=w.setTimeout(fn,ms);cleanups.push(()=>w.clearTimeout(t));return t};
const raf=fn=>w.requestAnimationFrame?w.requestAnimationFrame(fn):w.setTimeout(()=>fn(Date.now()),16);
const caf=id=>w.cancelAnimationFrame&&w.requestAnimationFrame?w.cancelAnimationFrame(id):w.clearTimeout(id);
function loop(step){let on=true,id=0,last=0;const f=ts=>{if(!on)return;const dt=last?Math.min(.05,(ts-last)/1000):.016;last=ts;step(dt);if(on)id=raf(f)};id=raf(f);const off=()=>{on=false;caf(id)};cleanups.push(off);return off}
function stop(){const c=cleanups;cleanups=[];for(const f of c){try{f()}catch(_){}}if(w.WebGhost)w.WebGhost.stop()}
/* A94: 긴 괴담의 마지막 문단은 화면에 들어올 때 천천히 떠오른다. 관찰 기능이 없으면 잠시 뒤 그냥 보여 준다. */
function holdReveal(p){const show=()=>{p.classList.add('sr-shown')};
 if(typeof w.IntersectionObserver==='function'){try{const io=new w.IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){later(show,700);io.disconnect()}},{threshold:.6});io.observe(p);cleanups.push(()=>io.disconnect());return}catch(_){}}
 later(show,1200)}
const reduced=()=>{try{return !!(w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(_){return false}};
/* ---------- 공통 조각 ---------- */
function ie(env,text,icon){const X=env.ctx.X;if(X&&X.ui)X.ui.dialog({title:'Microsoft Internet Explorer',text,icon:icon||'warn'});return !!(X&&X.ui)}
function trap(env,o){
 const g=w.WebGhost,X=env.ctx.X;if(g&&g.active&&g.active())return null;env.k.scared++;env.ctx.save();
 const done=()=>{if(o.after)o.after()};
 const made=X&&g?g.scare({desk:X.desk,E:env.E,B:env.B,X},{kind:o.kind,text:o.text,seed:o.seed,hold:o.hold,after:()=>{if(o.popups&&g.popups)g.popups({X,E:env.E},3);done()}}):null;
 if(!made)done();return made||true}
const marquee=(E,text,cls)=>{const m=E('div','ws-marquee '+(cls||'')),s=E('span','',text);m.append(s);return m};
function digits(E,n,len,cls){const d=E('span','ws-digits '+(cls||''));for(const c of String(n).padStart(len,'0'))d.append(E('i','',c));return d}
function field(E,ph,max,label){const i=E('input');i.type='text';i.maxLength=max;i.placeholder=ph;i.setAttribute('aria-label',label||ph);return i}
function postForm(env,opts,onSubmit){const {E,B}=env,f=E('form','ws-form '+(opts.cls||'')),nick=field(E,opts.nickPh||'이름',10,'이름'),txt=field(E,opts.textPh||'한 줄 남기기',opts.max||80,'내용');nick.value=opts.nick||'';const btn=B(opts.btn||'등록',()=>{},'ws-btn');btn.type='submit';f.append(nick,txt,btn);
 f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const a=nick.value.trim().slice(0,10)||opts.nick||'손님',b=txt.value.trim().slice(0,opts.max||80);if(!b)return;onSubmit(a,b)});return f}
function commentList(env,box,key,seed,nicks){const {E,k}=env;for(const [i,t] of (seed||[]).entries())box.append(E('p','ws-cm','['+nicks[i%nicks.length]+'] '+t));for(const t of listOf(k,'cm',key,10))box.append(E('p','ws-cm mine',t))}
function bar(E,label,pct){const b=E('div','ws-bar'),i=E('i');i.style.width=pct+'%';b.append(i);return b}
function stars(n){return '★'.repeat(n)+'☆'.repeat(5-n)}
function sparkle(env,page){
 if(reduced())return;const {E}=env;let alive=0;
 const on=e=>{if(alive>12)return;const r=page.getBoundingClientRect?page.getBoundingClientRect():{left:0,top:0},s=E('i','ws-spark','★');s.style.left=((e.clientX||0)-r.left)+'px';s.style.top=((e.clientY||0)-r.top)+'px';page.append(s);alive++;later(()=>{s.remove();alive--},650)};
 page.addEventListener('pointermove',on)}
function site404(env,text){const {E,B,go}=env;env.page.append(E('h2','','페이지를 찾을 수 없습니다'),E('p','',text||'이 주소에는 아무것도 없습니다.'),B('처음으로',()=>go({type:'home'}),'ws-btn'))}
/* ============ 1. 하늘이의 홈페이지 ============ */
const PAGE={};
PAGE.hompy=function(page,env){
 const {E,B,go,r,k,ctx}=env,d=D().hompy;
 page.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault();ie(env,'마우스 오른쪽 버튼은 사용할 수 없습니다. (퍼가기 금지 ^^)')});
 sparkle(env,page);
 if(r.type==='home'){
  const sp=E('div','hp-splash'),b=E('div','hp-load'),fill=E('i');b.append(fill);fill.style.width='100%';
  sp.append(E('div','hp-stars','★ ☆ ★ ☆ ★ ☆ ★ ☆ ★'),E('h1','hp-welcome','Welcome to my Homepage'),E('p','hp-sub','~ 하늘이의 꿈꾸는 홈페이지에 오신 것을 환영합니다 ~'),b,E('small','','Loading... 100%'),B('≫ ENTER ≪',()=>go({type:'main'}),'hp-enter'),E('p','hp-best','Best view : Internet Explorer 6.0 / 해상도 1024 * 768 / 소리를 켜 주세요 ♪'));
  page.append(sp);return}
 if(!r.seen){r.seen=true;if(r.type==='main'){k.total++;ctx.save()}}
 const frame=E('div','hp-frame'),head=E('header','hp-head'),side=E('nav','hp-side'),main=E('main','hp-main');
 head.append(E('h1','hp-logo','★☆ 하늘이의 꿈꾸는 홈페이지 ☆★'),marquee(E,d.marquee,'hp-marq'));
 for(const [type,label] of [['main','HOME'],['profile','프로필'],['diary','다이어리'],['gallery','사진첩'],['guestbook','방명록'],['links','링크']])side.append(B('· '+label,()=>go({type}),'hp-menu'+(r.type===type?' on':'')));
 const bgm=E('div','hp-bgm'),eq=E('span','hp-eq');for(let i=0;i<5;i++)eq.append(E('i'));let playing=true;eq.classList.add('on');
 const tog=B('■ 정지',()=>{playing=!playing;eq.classList.toggle('on',playing);tog.textContent=playing?'■ 정지':'▶ 재생'},'hp-bgm-btn');bgm.append(E('b','','♪ BGM'),E('span','',d.bgm),eq,tog);side.append(bgm);
 const cnt=E('div','hp-count');cnt.append(E('span','','TODAY '),digits(E,14+k.total%9,3,'sm'),E('span','',' TOTAL '),digits(E,2412+k.total,6));side.append(cnt);
 if(r.type==='main'){
  main.append(E('h2','hp-h','♡ 하늘이의 홈피에 오신 것을 환영합니다 ♡'),E('p','hp-p','안녕하세요~ 하늘이예요 ^^ 이곳은 제가 직접 만든 홈페이지랍니다. 부족하지만 구경 많이 하시고 방명록에 흔적 꼭 남겨 주세요!'));
  const nw=E('div','hp-news');nw.append(E('h3','','☆ 업데이트 소식 ☆'));for(const [i,t] of d.news.entries()){const p=E('p','',t);if(i===0)p.append(E('em','hp-new',' NEW'));nw.append(p)}main.append(nw);
  const tip=E('div','hp-tip');tip.append(E('b','','오늘의 한마디'),E('span','','"컴퓨터는 켜 놓고 보는 게 아니라 켜 놓고 딴짓하는 겁니다"'));main.append(tip)}
 else if(r.type==='profile'){
  main.append(E('h2','hp-h','♡ Profile ♡'));const ph=E('div','hp-photo');ph.append(E('span','','사진 준비중입니다 ^^;;'));main.append(ph);
  const t=E('table','hp-table');for(const [a,b2] of d.profile){const tr=E('tr');tr.append(E('th','',a),E('td','',b2));t.append(tr)}main.append(t)}
 else if(r.type==='diary'){
  main.append(E('h2','hp-h','♡ Diary ♡'));for(const [dt,tx] of d.diary){const e=E('article','hp-diary');e.append(E('b','',dt),E('p','',tx));main.append(e)}}
 else if(r.type==='gallery'){
  const c=E('div','hp-construct');c.append(E('b','','공 사 중'),E('span','','사진첩은 열심히 준비하고 있습니다. 조금만 기다려 주세요 ㅠㅠ'));main.append(E('h2','hp-h','♡ Gallery ♡'),c,E('p','hp-p','(스캐너를 빌려야 해서 언제 열릴지는 모릅니다)'))}
 else if(r.type==='guestbook'){
  main.append(E('h2','hp-h','♡ Guest Book ♡'));
  main.append(postForm(env,{cls:'hp-form',nick:'',nickPh:'이름',textPh:'다녀간 흔적을 남겨 주세요',max:80,btn:'남기기'},(a,b2)=>{pushTo(k,'gb','hompy','['+a+'] '+b2,12);ctx.save();ctx.rerender()}));
  const mine=listOf(k,'gb','hompy',12).slice().reverse();for(const t of mine){const p=E('p','hp-gb mine',t);main.append(p)}
  for(const [n,t] of d.guest)main.append(E('p','hp-gb','['+n+'] '+t))}
 else if(r.type==='links'){
  main.append(E('h2','hp-h','♡ Link ♡'));const ul=E('div','hp-links');for(const [n,id,desc] of d.friends){const row=E('div','hp-link');row.append(B(n,()=>go({type:'home'},id),'hp-a'),E('small','',' - '+desc));ul.append(row)}main.append(ul);
  const trapBox=E('div','hp-trapbox');trapBox.append(B('★ 절대 클릭하지 마세요 ★',()=>trap(env,{kind:'half',text:'클릭하지 말라고 했는데...',after:()=>{trapBox.append(E('p','hp-oops','클릭하지 말라고 했는데 클릭하셨네요 ㅠㅠ 책임 못 집니다.'))}}),'hp-trap'));main.append(trapBox,E('p','hp-p','배너 교환 환영합니다 ^^ 방명록에 남겨 주세요.'))}
 else site404(env);
 frame.append(head,side,main);page.append(frame,E('footer','hp-foot','Copyright ⓒ 2006 SKY DREAM. All rights reserved. 무단 복제를 금지합니다 (는 농담이고 퍼가시려면 말씀해 주세요)'))};
/* ============ 2. 엽기천국 ============ */
PAGE.yeopgi=function(page,env){
 const {E,B,go,r,k,ctx}=env,d=D().yeopgi,NICKS=['웃음벨','뒹굴이','지나가던','구경꾼','추천맨','잠수함'];
 const head=E('header','yg-head'),logo=B('엽기천국',()=>go({type:'home'}),'yg-logo');head.append(logo,E('span','yg-slogan','세상은 넓고 엽기는 많다!'));
 const nav=E('nav','yg-nav');for(const [type,label] of [['board','오늘의엽기'],['best','베스트'],['bait','낚시터'],['free','자유게시판'],['quiz','엽기퀴즈']])nav.append(B(label,()=>go({type}),'yg-tab'+(r.type===type?' on':'')));
 page.append(head,nav,marquee(E,'★ 오늘의 엽기 TOP5 ★ '+d.posts.slice().sort((a,b)=>b.rec-a.rec).slice(0,5).map(p=>p.title).join(' ★ '),'yg-marq'));
 const body=E('main','yg-body');page.append(body);
 const rec=p=>p.rec+(k.rec[p.id]?1:0);
 const row=(p,i)=>{const li=E('div','yg-row'),a=B('['+p.tag+'] '+p.title,()=>go({type:'post',id:p.id}),'yg-link');li.append(E('b','yg-no',String(i+1)),a,E('small','',p.nick+' · 조회 '+p.hits.toLocaleString('ko-KR')+' · 추천 '+rec(p)));return li};
 if(r.type==='home'){
  const top=E('section','yg-box');top.append(E('h3','','오늘의 엽기 TOP5'));d.posts.slice().sort((a,b)=>rec(b)-rec(a)).slice(0,5).forEach((p,i)=>top.append(row(p,i)));body.append(top);
  const bt=E('section','yg-box');bt.append(E('h3','','낚시터 인기글'));for(const [i,b] of d.bait.slice(0,4).entries())bt.append(B('· '+b[0],()=>go({type:'bait'}),'yg-link'));body.append(bt,E('p','yg-note','※ 엽기천국은 웃음을 드리는 사이트입니다. 퍼가기는 출처만 밝히면 환영합니다. 방문자 '+(920410+k.fish*3+k.total).toLocaleString('ko-KR')+'명'))}
 else if(r.type==='board'||r.type==='best'){
  const box=E('section','yg-box');box.append(E('h3','',r.type==='board'?'오늘의 엽기':'베스트 엽기'));const list=r.type==='board'?d.posts:d.posts.slice().sort((a,b)=>rec(b)-rec(a));list.forEach((p,i)=>box.append(row(p,i)));body.append(box)}
 else if(r.type==='post'){
  const p=d.posts.find(x=>x.id===r.id);if(!p){site404(env);return}
  const box=E('section','yg-box');box.append(E('h3','','['+p.tag+'] '+p.title),E('small','yg-meta',p.nick+' · 2006.05.'+(10+hash(p.id)%19)+' · 조회 '+p.hits.toLocaleString('ko-KR')),E('p','yg-text',p.body));
  const vote=B(k.rec[p.id]?'추천 완료 ('+rec(p)+')':'추천 ('+rec(p)+')',()=>{if(k.rec[p.id])return;k.rec[p.id]=1;ctx.save();ctx.rerender()},'yg-vote');box.append(vote);
  const cm=E('div','yg-cm');cm.append(E('b','','댓글'));commentList(env,cm,'yg-'+p.id,p.replies,NICKS);cm.append(postForm(env,{nick:'손님',textPh:'댓글 한 줄',max:60},(a,t)=>{pushTo(k,'cm','yg-'+p.id,a+': '+t,10);ctx.save();ctx.rerender()}));box.append(cm);body.append(box)}
 else if(r.type==='bait'){
  const box=E('section','yg-box');box.append(E('h3','','낚시터 (클릭하면 낚입니다)'));
  d.bait.forEach((b,i)=>box.append(B('· '+b[0],()=>{if(b[1]==='TRAP'){trap(env,{kind:'blood',text:'정답: 뒤에 있습니다',after:()=>{box.append(E('p','yg-note','정답률 3%라고 했잖아요 ㅋㅋㅋ'))}});return}go({type:'fish',id:String(i)})},'yg-link bait')));body.append(box)}
 else if(r.type==='fish'){
  const b=d.bait[Number(r.id)];if(!b||b[1]==='TRAP'){site404(env);return}
  if(!r.seen){r.seen=true;k.fish++;ctx.save()}
  const box=E('section','yg-box fish');box.append(E('h3','','낚였습니다 ㅋㅋㅋㅋ'),E('p','yg-text',b[0]),E('p','yg-fish',b[1]),E('p','yg-note','당신은 낚시 피해자 '+(3000+k.fish).toLocaleString('ko-KR')+'호입니다.'),B('복수하러 가기',()=>go({type:'bait'}),'yg-vote'));body.append(box)}
 else if(r.type==='free'){
  const box=E('section','yg-box');box.append(E('h3','','자유게시판'));for(const [t,n,x] of d.free){const li=E('div','yg-free');li.append(E('b','',t),E('small','',' - '+n),E('p','',x));box.append(li)}
  const mine=listOf(k,'cm','yg-free',10).slice().reverse();for(const t of mine){const li=E('div','yg-free mine');li.append(E('p','',t));box.append(li)}
  box.append(postForm(env,{nick:'손님',textPh:'한마디 남기기 (도배 금지)',max:70},(a,t)=>{pushTo(k,'cm','yg-free',a+': '+t,10);ctx.save();ctx.rerender()}));body.append(box)}
 else if(r.type==='quiz'){
  let idx=0,score=0;const box=E('section','yg-box quiz');body.append(box);
  const draw=()=>{box.replaceChildren();box.append(E('h3','','엽기퀴즈'));
   if(idx>=d.quiz.length){const pc=Math.round(score/d.quiz.length*100);box.append(E('p','yg-fish','당신의 엽기 지수는 '+pc+'% 입니다.'),E('p','yg-text',pc>=80?'엽기 박사! 인터넷 폐인이 되실 소질이 충분합니다.':pc>=40?'평범한 엽기 지망생입니다. 더 웃으셔야 합니다.':'엽기와는 거리가 먼 분입니다. 오늘은 일찍 주무세요.'),B('다시 풀기',()=>{idx=0;score=0;draw()},'yg-vote'));return}
   const [q,ch,ans]=d.quiz[idx];box.append(E('p','yg-text',(idx+1)+'/'+d.quiz.length+'  '+q));const res=E('p','yg-fish','');
   ch.forEach((c,i)=>box.append(B(c,()=>{if(res.textContent)return;const ok=i===ans;if(ok)score++;res.textContent=ok?'정답! ㅋㅋㅋ':'땡! 정답은 "'+ch[ans]+'" 입니다 ㅋㅋ';box.append(B(idx+1>=d.quiz.length?'결과 보기':'다음 문제',()=>{idx++;draw()},'yg-vote'))},'yg-choice')));box.append(res)};
  draw()}
 else site404(env)};
/* ============ 3. 플래시짱 ============ */
PAGE.flash=function(page,env){
 const {E,B,go,r,k,ctx}=env,d=D().flash,F=w.WebFlash;
 const head=E('header','fl-head');head.append(B('FLASH JANG',()=>go({type:'home'}),'fl-logo'),E('span','fl-sub','엽기 플래시 극장'));page.append(head);
 if(r.type==='home'){
  const box=E('div','fl-intro'),barx=E('div','ws-bar fl-bar'),fill=E('i'),txt=E('p','fl-loading',d.loading[0]);barx.append(fill);
  const enter=B('ENTER ▶',()=>go({type:'main'}),'fl-enter');enter.hidden=true;
  box.append(E('h1','fl-title','플래시짱'),txt,barx,B('SKIP INTRO >>',()=>go({type:'main'}),'fl-skip'),enter,E('small','fl-tip','※ 이 사이트는 플래시 플레이어가 설치되어 있어야 제대로 보입니다. (이미 설치되어 있습니다)'));page.append(box);
  let i=0;const step=()=>{i++;txt.textContent=d.loading[Math.min(i,d.loading.length-1)];fill.style.width=Math.min(100,Math.round(i/(d.loading.length-1)*100))+'%';if(i<d.loading.length-1)later(step,i>=3&&i<6?900:420);else enter.hidden=false};later(step,420);return}
 if(r.type==='main'){
  const grid=E('div','fl-grid');for(const it of d.list){const c=E('div','fl-card'),th=B('',()=>go({type:'play',id:it.id}),'fl-thumb '+it.id);th.append(E('b','',it.kind==='game'?'GAME':'FLASH'),E('span','',it.title));c.append(th,E('small','',it.by+' · 조회 '+it.hits.toLocaleString('ko-KR')),E('small','fl-star',stars(Math.round(it.star))+' '+it.star.toFixed(1)));grid.append(c)}
  page.append(E('h2','fl-h','최신 작품'),grid,E('p','fl-note','※ 작품 감상 후 댓글 남기기는 필수입니다. 안 남기면 졸라맨이 찾아갑니다.'));return}
 if(r.type==='play'){
  const it=d.list.find(x=>x.id===r.id);if(!it){site404(env);return}
  const cv=E('canvas','fl-canvas'),sub=E('p','fl-sub-line',''),controls=E('div','fl-ctl'),prog=E('div','ws-bar fl-prog'),pi=E('i');prog.append(pi);
  page.append(E('h2','fl-h',it.title),E('p','fl-desc',it.desc));
  if(it.kind==='skit'){
   const sk=F.SKITS.find(s=>s.id===it.id);cv.width=480;cv.height=300;const g=cv.getContext?cv.getContext('2d'):null;let t=0,play=true,subNow=-1;
   const draw=()=>{if(g)sk.draw(g,cv.width,cv.height,t);let si=0;for(let i=0;i<sk.subs.length;i++)if(t>=sk.subs[i][0])si=i;if(si!==subNow){subNow=si;sub.textContent=sk.subs[si][1]}pi.style.width=Math.round(t/sk.len*100)+'%'};
   const next=d.list.filter(x=>x.kind==='skit'),nxt=next[(next.findIndex(x=>x.id===it.id)+1)%next.length];
   const replay=B('◀◀ 처음부터',()=>{t=0;play=true;subNow=-1;draw()},'fl-btn'),pp=B('■ 정지',()=>{play=!play;pp.textContent=play?'■ 정지':'▶ 재생'},'fl-btn');controls.append(pp,replay,B('다음 작품 ▶',()=>go({type:'play',id:nxt.id}),'fl-btn'));
   page.append(cv,sub,prog,controls);draw();
   loop(dt=>{if(!play)return;t+=dt;if(t>=sk.len){t=sk.len;play=false;pp.textContent='▶ 재생';sub.textContent=sk.subs[sk.subs.length-1][1]+'  (끝)'}draw()})}
  else{
   const game=F.createPoop(Date.now()&0xffff);cv.width=320;cv.height=400;cv.tabIndex=0;cv.setAttribute('aria-label','똥 피하기 게임 화면');const g=cv.getContext?cv.getContext('2d'):null;let started=false,dir=0,wrote=false;
   const begin=()=>{if(!started||game.st.over){const seed=(Date.now()&0xffff)+1,fresh=F.createPoop(seed);game.st.x=fresh.st.x;game.st.items=fresh.st.items;game.st.t=0;game.st.score=0;game.st.over=false;game.st.spawn=.4;started=true;wrote=false}};
   cv.addEventListener('keydown',e=>{const kk=e.code||e.key;if(['ArrowLeft','ArrowRight','KeyA','KeyD','Enter','Space'].includes(kk)){e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation()}if(kk==='ArrowLeft'||kk==='KeyA')dir=-1;else if(kk==='ArrowRight'||kk==='KeyD')dir=1;else if(kk==='Enter'||kk==='Space')begin()});
   cv.addEventListener('keyup',e=>{const kk=e.code||e.key;if((kk==='ArrowLeft'||kk==='KeyA')&&dir<0)dir=0;if((kk==='ArrowRight'||kk==='KeyD')&&dir>0)dir=0});
   cv.addEventListener('pointermove',e=>{const rc=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,width:320};if(started&&!game.st.over)game.move(((e.clientX||0)-rc.left)/Math.max(1,rc.width))});
   cv.addEventListener('pointerdown',()=>{begin();cv.focus&&cv.focus()});
   const best=E('p','fl-desc','');const show=()=>{best.textContent='내 최고 점수: '+k.best};show();
   page.append(cv,best,E('p','fl-note','방향키 또는 마우스로 움직이세요. Enter 또는 화면을 눌러 시작합니다.'));cv.focus&&cv.focus();
   loop(dt=>{if(started&&!game.st.over){if(dir)game.move(game.st.x+dir*dt*.9);game.step(dt)}
    if(game.st.over&&!wrote){wrote=true;if(game.st.score>k.best){k.best=game.st.score;ctx.save();show()}}
    if(g){F.drawPoop(g,cv.width,cv.height,game.st);if(!started){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(0,cv.height*.35,cv.width,cv.height*.2);g.fillStyle='#fff';g.font='bold 20px sans-serif';g.fillText('Enter 또는 클릭하면 시작',30,cv.height*.46)}}});
   env.poop=game}
  const cm=E('div','fl-cm');cm.append(E('b','','감상평'));for(const [i,t] of it.comments.entries())cm.append(E('p','ws-cm','['+['막대기팬','지나가다','ㅋㅋ'][i%3]+'] '+t));for(const t of listOf(k,'cm','fl-'+it.id,8))cm.append(E('p','ws-cm mine',t));cm.append(postForm(env,{nick:'손님',textPh:'감상평 한 줄',max:60},(a,t)=>{pushTo(k,'cm','fl-'+it.id,'['+a+'] '+t,8);ctx.save();ctx.rerender()}));page.append(cm);return}
 site404(env)};
/* ============ 4. 소름닷컴 ============ */
const STORY_TRAP={s1:['click','scream','마지막 줄을 읽으셨군요'],s3:['time','child','뒤를 보세요'],s6:['click','grin','발자국은 당신 앞에서 멈췄습니다']};
const SR_CATS=[['','전체 글'],['real','실화 괴담'],['serial','연재'],['short','짧은 괴담']];
const srCat=st=>st.cat||'short';
const srDate=st=>st.date||('05.'+String(10+hash(st.id)%18).padStart(2,'0')+' '+String(hash(st.id+'h')%24).padStart(2,'0')+':'+String(hash(st.id+'m')%60).padStart(2,'0'));
const srLong=st=>String(st.text||'').length>1500;
const srMins=st=>Math.max(1,Math.round(String(st.text||'').replace(/\s/g,'').length/450));
const srTitle=st=>(st.tag?'['+st.tag+'] ':'')+st.title+(st.parts?' ('+st.part+'/'+st.parts+')':'');
PAGE.sorum=function(page,env){
 const {E,B,go,r,k,ctx}=env,d=D().sorum;
 const logo=B('소름',()=>go({type:'main'}),'sr-logo');logo.append(E('small','','.com'));
 if(r.type==='home'){
  const gate=E('div','sr-gate');gate.append(E('h1','sr-title','소름닷컴'),E('p','sr-sub','한여름밤의 괴담'));for(const t of d.gate)gate.append(E('p','sr-warn',t));
  gate.append(B('입장하기 (각오가 되신 분만)',()=>go({type:'main'}),'sr-enter'),B('나가기',()=>go({type:'home'},'w-links'),'sr-leave'),E('small','sr-count',d.visitors.join(' · ')));page.append(gate);return}
 if(k.srNight===1)page.classList.add('sr-night');
 const head=E('header','sr-head');head.append(logo,E('span','sr-tag','이 사이트에는 귀신이 삽니다'));
 const nav=E('nav','sr-nav');for(const [type,label] of [['main','괴담 게시판'],['exp','귀신 체험관']])nav.append(B(label,()=>go({type}),'sr-tab'+(r.type===type||(type==='main'&&r.type==='story')?' on':'')));page.append(head,nav);
 const body=E('main','sr-body');page.append(body);
 const recOf=st=>(st.rec||Math.round(st.hits/180))+(k.rec['sr-'+st.id]?1:0);
 if(r.type==='main'){
  const cat=SR_CATS.some(c=>c[0]===r.query)?r.query:'';
  const tabs=E('div','sr-cats');for(const [id,label] of SR_CATS)tabs.append(B(label,()=>go({type:'main',query:id}),'sr-cat'+(cat===id?' on':'')));body.append(tabs);
  if(!cat){const best=E('section','sr-best');best.append(E('b','','★ 이번 주 베스트 (조회순)'));d.stories.slice().sort((a,b)=>b.hits-a.hits).slice(0,5).forEach((st,i)=>{const row=E('div','sr-best-row');row.append(E('i','',String(i+1)),B(srTitle(st),()=>go({type:'story',id:st.id}),'sr-link'),E('small','','조회 '+st.hits.toLocaleString('ko-KR')));best.append(row)});body.append(best)}
  body.append(E('h2','sr-h',cat?SR_CATS.find(c=>c[0]===cat)[1]:'무서운 이야기 게시판'));
  const list=E('div','sr-list'),rows=d.stories.filter(st=>!cat||srCat(st)===cat).slice().sort((a,b)=>srDate(b).localeCompare(srDate(a))||(a.part||0)-(b.part||0));
  const total=rows.length;
  rows.forEach((st,i)=>{const row=E('div','sr-row');row.append(E('span','sr-no',String(1400+total-i)));const t=B(srTitle(st),()=>go({type:'story',id:st.id}),'sr-link');row.append(t);if(st.comments.length)row.append(E('em','sr-cmn','['+st.comments.length+']'));if(srDate(st)>='05.28')row.append(E('b','sr-new','NEW'));if(srLong(st))row.append(E('span','sr-scroll','스크롤 압박'));row.append(E('small','',st.nick+' · '+srDate(st).slice(0,5)+' · 조회 '+st.hits.toLocaleString('ko-KR')+' · 추천 '+recOf(st)));list.append(row)});
  body.append(list,E('p','sr-foot-note','※ 불을 끄고 혼자 보세요. 읽다가 뒤를 돌아보는 것은 자유입니다. 퍼가실 때는 출처를 꼭 밝혀 주세요.'))}
 else if(r.type==='story'){
  const st=d.stories.find(x=>x.id===r.id);if(!st){site404(env);return}
  const tr=STORY_TRAP[st.id]||(Array.isArray(st.trap)?st.trap:null);const art=E('article','sr-story'+(srLong(st)?' long':''));
  art.append(E('h2','sr-h',srTitle(st)),E('small','sr-meta',st.nick+' · 2006.'+srDate(st)+' · 조회 '+st.hits.toLocaleString('ko-KR')+' · 추천 '+recOf(st)));
  const tools=E('div','sr-tools');if(srLong(st))tools.append(E('span','sr-scroll','※ 스크롤 압박 주의 · 읽는 데 약 '+srMins(st)+'분'));
  tools.append(B(k.srNight===1?'☀ 불 켜고 읽기':'● 불 끄고 읽기',()=>{k.srNight=k.srNight===1?0:1;ctx.save();ctx.rerender()},'sr-night-btn'));art.append(tools);
  const series=st.series?d.stories.filter(x=>x.series===st.series).sort((a,b)=>a.part-b.part):[];
  const seriesBar=()=>{const bar=E('div','sr-series');bar.append(E('b','','연재 목록'));for(const x of series)bar.append(B(x.part+'편',()=>go({type:'story',id:x.id}),'sr-part'+(x===st?' on':'')));return bar};
  if(series.length>1)art.append(seriesBar());
  const paras=String(st.text).split(/\n\n+/);
  paras.forEach((tx,i)=>{const p=E('p','sr-text sr-para',tx);if(st.slowEnd&&i===paras.length-1){p.classList.add('sr-hold');holdReveal(p)}art.append(p)});
  if(st.note){const n=E('div','sr-note');n.append(E('b','','글쓴이의 말'),E('p','',st.note));art.append(n)}
  body.append(art);
  const vote=B(k.rec['sr-'+st.id]?'추천 완료 ('+recOf(st)+')':'추천하기 ('+recOf(st)+')',()=>{if(k.rec['sr-'+st.id])return;k.rec['sr-'+st.id]=1;ctx.save();ctx.rerender()},'sr-vote');body.append(vote);
  if(series.length>1){const at=series.indexOf(st),pager=E('div','sr-pager');if(at>0)pager.append(B('◀ 이전 편',()=>go({type:'story',id:series[at-1].id}),'sr-leave'));if(at<series.length-1)pager.append(B('다음 편 보기 ▶',()=>go({type:'story',id:series[at+1].id}),'sr-enter'));else pager.append(E('span','sr-end','(완결)'));body.append(pager)}
  if(tr&&tr[0]==='click'){const out=E('p','sr-oops','');art.append(B('...그래서 어떻게 됐나요? (마지막 줄 보기)',()=>trap(env,{kind:tr[1],text:tr[2],after:()=>{out.textContent='마지막 줄은 보지 않는 편이 좋았습니다.'}}),'sr-last'),out)}
  if(tr&&tr[0]==='time'){const fire=()=>{trap(env,{kind:tr[1],text:tr[2]})};later(fire,tr[3]||9000)}
  const nicks=['소름','공포매니아','밤손님','무서워요','새벽두시','불켜놓음','자작아님?','지나가다'];
  const cm=E('div','sr-cm');cm.append(E('b','','댓글 '+st.comments.length));
  st.comments.forEach((t,i)=>{const named=/^([^:\s]{1,12})::\s*([\s\S]*)$/.exec(t),nest=/^ㄴ\s/.test(t);const p=E('p','ws-cm'+(nest?' sr-nest':''));const who=named?named[1]:nicks[(hash(st.id)+i*3)%nicks.length];p.append(E('b','sr-who','['+who+']'),E('span','',' '+(named?named[2]:nest?t.replace(/^ㄴ\s*/,''):t)));cm.append(p)});
  for(const t of listOf(k,'cm','sr-'+st.id,10))cm.append(E('p','ws-cm mine',t));
  cm.append(postForm(env,{nick:'손님',textPh:'댓글 (무서우면 불을 켜세요)',max:60},(a,t)=>{pushTo(k,'cm','sr-'+st.id,a+': '+t,10);ctx.save();ctx.rerender()}));body.append(cm,B('◀ 목록으로',()=>go({type:'main'}),'sr-leave'))}
 else if(r.type==='exp'){
  body.append(E('h2','sr-h','귀신 체험관'));for(const [name,desc,type] of d.fear){const row=E('div','sr-row');row.append(B(name,()=>go({type}),'sr-link'),E('small','',desc));body.append(row)}}
 else if(r.type==='stare'){
  body.append(E('h2','sr-h','심령 사진 감상실'),E('p','sr-text','아래 사진을 10초 동안 집중해서 보세요. 사진 속에서 이상한 곳을 찾으면 됩니다.'));
  const cv=E('canvas','sr-room');cv.width=360;cv.height=240;const g=cv.getContext?cv.getContext('2d'):null;
  if(g){g.fillStyle='#262320';g.fillRect(0,0,360,240);g.fillStyle='#3a342e';g.fillRect(0,170,360,70);g.fillStyle='#171512';g.fillRect(30,40,90,100);g.fillStyle='#41536b';g.fillRect(38,48,74,84);g.fillStyle='#5b4c3c';g.fillRect(150,95,120,80);g.fillStyle='#8c8272';g.fillRect(156,100,108,26);g.fillStyle='#2e2822';g.fillRect(290,30,50,150);g.fillStyle='#000';g.fillRect(313,40,4,130);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,360,240)}
  const clock=E('p','sr-count-down','10'),out=E('p','sr-oops','');let n=10,done=false;
  const fire=(kind,text)=>{if(done)return;done=true;trap(env,{kind,text,after:()=>{out.textContent='옷장 문틈에서 누군가 보고 있었습니다.'}})};
  const tick=()=>{if(done)return;n--;clock.textContent=String(Math.max(0,n));if(n<=0)fire('half','찾았다');else later(tick,1000)};later(tick,1000);
  body.append(cv,clock,B('찾았다!',()=>fire('cracked','정답입니다'),'sr-enter'),out)}
 else if(r.type==='dark'){
  body.append(E('h2','sr-h','어두운 방 탈출'),E('p','sr-text','손전등 대신 마우스로 어둠 속을 비춰 열쇠, 인형, 사진을 찾으세요. 모두 찾으면 문이 열립니다.'));
  const room=E('div','sr-dark'),shade=E('div','sr-shade'),found=E('p','sr-count-down','찾은 물건 0/3');let n=0,hit=false;
  const set=(x,y)=>{shade.style.setProperty('--x',x+'px');shade.style.setProperty('--y',y+'px')};set(120,90);
  room.addEventListener('pointermove',e=>{const rc=room.getBoundingClientRect?room.getBoundingClientRect():{left:0,top:0};set((e.clientX||0)-rc.left,(e.clientY||0)-rc.top)});
  for(const [id,name,x,y] of [['key','열쇠',72,60],['doll','인형',22,35],['photo','사진',48,78]]){const it=B(name,()=>{if(it.disabled)return;it.disabled=true;it.classList.add('got');n++;found.textContent='찾은 물건 '+n+'/3';if(n>=3&&!hit){hit=true;trap(env,{kind:'blood',text:'문은 열리지 않습니다',popups:false,after:()=>{found.textContent='문이 열렸습니다. 하지만 나갈 수 없습니다.'}})}},'sr-item '+id);it.style.left=x+'%';it.style.top=y+'%';room.append(it)}
  room.append(shade);const hint=B('힌트 (잠깐 밝히기)',()=>{shade.classList.add('lit');later(()=>shade.classList.remove('lit'),1600)},'sr-leave');body.append(room,found,hint)}
 else if(r.type==='curse'){
  body.append(E('h2','sr-h','저주의 편지'));const box=E('div','sr-curse');body.append(box);let i=0,done=false;
  const clock=E('p','sr-count-down','');
  const show=()=>{box.append(E('p','sr-text',d.curse[i]));i++;if(i<d.curse.length)later(show,1500);else countdown(10)};
  const countdown=n=>{clock.textContent='뒤를 돌아보지 마세요... '+n;if(n<=0){if(!done){done=true;trap(env,{kind:'grin',text:'뒤에 있었습니다',popups:true})}return}later(()=>countdown(n-1),1000)};
  body.append(clock,B('10명에게 전달하기',()=>ie(env,'메신저 친구 8명에게 전달했습니다. 2명이 모자랍니다.','warn'),'sr-leave'));later(show,600)}
 else site404(env)};
/* ============ 5. 알짜배기 자료실 ============ */
PAGE.jaryo=function(page,env){
 const {E,B,go,r,ctx}=env,d=D().jaryo,X=ctx.X;
 const head=E('header','jm-head');head.append(B('알짜배기 자료실',()=>go({type:'home'}),'jm-logo'),E('span','jm-sub','공짜 프로그램이 한가득'));
 const cats=['전체',...Array.from(new Set(d.items.map(i=>i.cat)))],nav=E('nav','jm-nav');
 for(const c of cats)nav.append(B(c,()=>go({type:'list',query:c==='전체'?'':c}),'jm-tab'+(r.type==='list'&&(r.query||'전체')===c?' on':'')));
 page.append(head,marquee(E,d.notice.join('   '),'jm-marq'),nav);const body=E('main','jm-body');page.append(body);
 const row=it=>{const tr=E('div','jm-row');tr.append(E('span','jm-cat',it.cat),B(it.title,()=>go({type:'item',id:it.id}),'jm-link'),E('small','',it.mb+'MB · '+it.date+' · 다운 '+it.down.toLocaleString('ko-KR')));return tr};
 if(r.type==='home'){
  const hot=d.items[0];const box=E('section','jm-hot');box.append(E('b','','오늘의 추천 자료'),B(hot.title,()=>go({type:'item',id:hot.id}),'jm-link big'),E('p','',hot.desc.split('\n')[0]));body.append(box);
  const nw=E('section','jm-box');nw.append(E('h3','','새로 올라온 자료'));for(const it of d.items.slice(0,6))nw.append(row(it));body.append(nw);
  const pop=E('section','jm-box');pop.append(E('h3','','다운로드 순위'));d.items.slice().sort((a,b)=>b.down-a.down).slice(0,5).forEach((it,i)=>{const tr=row(it);tr.insertBefore(E('b','jm-no',String(i+1)),tr.firstChild);pop.append(tr)});body.append(pop)}
 else if(r.type==='list'){
  const box=E('section','jm-box');box.append(E('h3','',(r.query||'전체')+' 자료'));for(const it of d.items.filter(i=>!r.query||i.cat===r.query))box.append(row(it));body.append(box)}
 else if(r.type==='item'){
  const it=d.items.find(x=>x.id===r.id);if(!it){site404(env);return}
  const box=E('section','jm-box');box.append(E('h3','',it.title),E('small','jm-meta','분류 '+it.cat+' · 용량 '+it.mb+'MB · 올린 사람 '+it.by+' · 등록 '+it.date+' · 다운로드 '+it.down.toLocaleString('ko-KR')),E('p','jm-text',it.desc));
  if(it.id==='smash'){const shot=E('div','jm-shot');shot.append(E('span','crack c1'),E('span','crack c2'),E('span','crack c3'),E('b','','화면 미리보기'));box.append(shot)}
  const st=X&&X.setup?X.setup.state():null;if(st&&it.id==='smash'){box.append(E('p','jm-state',st.smash?'이미 설치되어 있습니다. 다시 받으셔도 됩니다.':st.setupFile?'설치 파일이 바탕 화면에 있습니다. 더블클릭해서 설치하세요.':'아직 설치하지 않았습니다.'))}
  box.append(B('▼ 다운로드',()=>{if(it.id==='smash'&&X&&X.setup){X.setup.download('smash',{});return}ie(env,d.gone,'warn')},'jm-down'));
  const cm=E('div','jm-cm');cm.append(E('b','','사용 후기'));for(const [i,t] of it.comments.entries())cm.append(E('p','ws-cm','['+['알짜팬','지나가다','ㅋㅋ'][i%3]+'] '+t));box.append(cm);body.append(box)}
 else site404(env)};
/* ============ 6. 오늘의 운세 ============ */
PAGE.fate=function(page,env){
 const {E,B,go,r}=env,d=D().fate;
 const head=E('header','ft-head');head.append(B('오늘의 운세',()=>go({type:'home'}),'ft-logo'),E('span','','심리테스트와 운세'));page.append(head);const body=E('main','ft-body');page.append(body);
 const result=E('div','ft-result');
 if(r.type==='home'){
  body.append(E('h2','ft-h','무엇이 궁금하세요?'));const grid=E('div','ft-grid');for(const [type,label,desc] of [['luck','오늘의 운세','생일로 보는 하루'],['past','나의 전생은?','이름으로 알아보기'],['pair','이름 궁합','두 사람의 궁합'],['iq','초간단 IQ 테스트','세 문제만 풀어 보세요']])grid.append(B(label,()=>go({type}),'ft-card'),E('small','ft-desc',desc));body.append(grid)}
 else if(r.type==='luck'){
  const m=E('select'),dd=E('select'),bt=E('select');for(let i=1;i<=12;i++){const o=E('option','',i+'월');o.value=String(i);m.append(o)}for(let i=1;i<=31;i++){const o=E('option','',i+'일');o.value=String(i);dd.append(o)}for(const t of ['A','B','O','AB']){const o=E('option','',t+'형');o.value=t;bt.append(o)}
  m.setAttribute('aria-label','태어난 달');dd.setAttribute('aria-label','태어난 날');bt.setAttribute('aria-label','혈액형');
  body.append(E('h2','ft-h','오늘의 운세 (2006년 5월 30일)'),m,dd,bt,B('운세 보기',()=>{const n=hash(m.value+'-'+dd.value);result.replaceChildren(E('p','ft-big',d.luck[n%d.luck.length]),E('p','',d.blood[bt.value]),E('small','ft-desc','※ 이 운세는 재미로만 보세요. 누가 눌러도 비슷하게 나옵니다.'))},'ft-btn'),result)}
 else if(r.type==='past'){
  const nm=field(E,'이름을 입력하세요',10,'이름');body.append(E('h2','ft-h','나의 전생은?'),nm,B('전생 보기',()=>{const t=nm.value.trim();if(!t)return;result.replaceChildren(E('p','ft-big',t+' 님의 전생은'),E('p','',d.past[hash(t)%d.past.length]))},'ft-btn'),result)}
 else if(r.type==='pair'){
  const a=field(E,'내 이름',10,'내 이름'),b=field(E,'상대 이름',10,'상대 이름');body.append(E('h2','ft-h','이름 궁합'),a,b,B('궁합 보기',()=>{const x=a.value.trim(),y=b.value.trim();if(!x||!y)return;const n=hash([x,y].sort().join('&')),pc=50+n%51;result.replaceChildren(E('p','ft-big',x+' ♥ '+y+' = '+pc+'%'),bar(E,'',pc),E('p','',d.pair[n%d.pair.length]))},'ft-btn'),result)}
 else if(r.type==='iq'){
  let i=0,sum=0;body.append(E('h2','ft-h','초간단 IQ 테스트'));const box=E('div','ft-quiz');body.append(box,result);
  const draw=()=>{box.replaceChildren();if(i>=d.iq.length){const n=100+sum*37%80;result.replaceChildren(E('p','ft-big','당신의 IQ는 '+n+' 입니다'),E('p','',n>=140?'천재입니다. 자세히 보면 이 테스트를 만든 사람은 더 천재입니다.':'평범한 천재입니다. 아주 평범합니다. (특별한 뜻은 없습니다)'),B('다시 하기',()=>{i=0;sum=0;result.replaceChildren();draw()},'ft-btn'));return}
   const [q,ch]=d.iq[i];box.append(E('p','ft-q',(i+1)+'. '+q));ch.forEach((c,j)=>box.append(B(c,()=>{sum+=j+1;i++;draw()},'ft-choice')))};draw()}
 else site404(env)};
/* ============ 7. 수다방 채팅 ============ */
PAGE.chat=function(page,env){
 const {E,B,go,r,k}=env,d=D().chat;
 const head=E('header','ch-head');head.append(B('수다방',()=>go({type:'home'}),'ch-logo'),E('span','','대화방 목록 / 지금 접속 '+(1200+k.total%40)+'명'));page.append(head);
 if(r.type==='home'){
  const t=E('div','ch-rooms');t.append(E('b','ch-hd','번호'),E('b','ch-hd','방 제목'),E('b','ch-hd','인원'),E('b','ch-hd','방장'));d.rooms.forEach((rm,i)=>{t.append(E('span','',String(i+1)),B(rm[0],()=>go({type:'room',id:String(i)}),'ch-link'),E('span','',rm[1]+'명'),E('span','',rm[2]))});page.append(t,E('p','ch-note','※ 도배, 욕설, 광고는 강제퇴장 사유입니다. 방장의 권한이 막강하니 예의를 지켜 주세요.'));return}
 if(r.type==='room'){
  const rm=d.rooms[Number(r.id)];if(!rm){site404(env);return}
  const log=E('div','ch-log'),form=E('form','ch-form'),inp=field(E,'대화 내용을 입력하세요',60,'대화 내용'),send=B('보내기',()=>{},'ws-btn');send.type='submit';form.append(inp,send);
  const me='손님'+(100+hash(String(k.total)+r.id)%900);page.append(E('h2','ch-title',rm[0]+'  (방장 '+rm[2]+')'),log,form,B('나가기',()=>go({type:'home'}),'ws-btn'));
  const add=(cls,text)=>{log.append(E('p','ch-line '+cls,text));while(log.children.length>60)log.children[0].remove?.();log.scrollTop=log.scrollHeight};
  add('sys',d.system[0]);add('sys','[알림] '+me+'님이 입장하셨습니다.');
  let bi=hash(r.id),last='',rep=0,alive=true;cleanups.push(()=>{alive=false});
  const talk=()=>{if(!alive)return;const nick=d.nicks[bi%d.nicks.length],line=d.lines[(bi*7+3)%d.lines.length];bi++;add('',nick+' : '+line);if(log.children.length<50)later(talk,2600)};later(talk,1200);
  form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=inp.value.trim().slice(0,60);if(!t)return;inp.value='';
   if(t===last)rep++;else{rep=0;last=t}
   add('me',me+' : '+t);
   if(rep>=2){later(()=>{add('sys','[알림] '+rm[2]+'님이 '+me+'님을 도배로 강제퇴장 시켰습니다.');later(()=>go({type:'home'}),900)},400);return}
   later(()=>{const nick=d.nicks[(bi+2)%d.nicks.length];add('',nick+' : '+d.replies[(hash(t)+bi)%d.replies.length]);bi++},1100)});
  return}
 site404(env)};
/* ============ 8. 별빛소녀 팬클럽 ============ */
PAGE.fan=function(page,env){
 const {E,B,go,r,k,ctx}=env,d=D().fan;
 sparkle(env,page);
 const head=E('header','fn-head');head.append(B('별빛소녀',()=>go({type:'home'}),'fn-logo'),E('span','','공식 팬클럽 ♥ 회원 '+(12480+k.att).toLocaleString('ko-KR')+'명'));page.append(head);
 const today=new Date().toDateString();
 const nav=E('nav','fn-nav');for(const [type,label] of [['home','HOME'],['board','팬 게시판']])nav.append(B(label,()=>go({type}),'fn-tab'+(r.type===type?' on':'')));page.append(nav);const body=E('main','fn-body');page.append(body);
 if(r.type==='home'){
  const mem=E('section','fn-box');mem.append(E('h3','','MEMBER'));for(const [n,role] of d.members){const c=E('div','fn-mem');c.append(E('b','fn-face',n.slice(0,1)),E('span','',n),E('small','',role));mem.append(c)}body.append(mem);
  const nt=E('section','fn-box');nt.append(E('h3','','공지사항'));for(const t of d.notice)nt.append(E('p','',t));body.append(nt);
  const sc=E('section','fn-box');sc.append(E('h3','','SCHEDULE'));for(const [dt,t] of d.schedule)sc.append(E('p','',dt+'  '+t));body.append(sc);
  const at=E('section','fn-box');at.append(E('h3','','출석 체크'));const msg=E('p','',k.attDay===today?'오늘 출석 완료 ♥ (누적 '+k.att+'일)':'오늘의 출석 도장을 찍어 주세요.');at.append(msg,B(k.attDay===today?'출석 완료':'출석 도장 쾅!',()=>{if(k.attDay===today)return;k.attDay=today;k.att++;ctx.save();ctx.rerender()},'fn-btn'));body.append(at)}
 else if(r.type==='board'){
  const box=E('section','fn-box');box.append(E('h3','','팬 게시판'));box.append(postForm(env,{nick:'분홍풍선',textPh:'응원 한마디 남기기',max:70,btn:'응원하기'},(a,t)=>{pushTo(k,'gb','fan',a+': '+t,10);ctx.save();ctx.rerender()}));
  for(const t of listOf(k,'gb','fan',10).slice().reverse())box.append(E('p','fn-post mine',t));
  for(const [t,n,x] of d.posts){const p=E('div','fn-post');p.append(E('b','',t),E('small','',' - '+n),E('p','',x));box.append(p)}body.append(box)}
 else site404(env)};
/* ============ 9. 링크천국 ============ */
PAGE.links=function(page,env){
 const {E,B,go}=env,d=D().links;
 const head=E('header','lk-head');head.append(B('링크천국',()=>go({type:'home'}),'lk-logo'),E('span','','재미있는 사이트가 모여 있는 곳'));page.append(head,marquee(E,'★ 신규 등록 사이트 접수중 ★ 서로 링크 걸어요 ★ 오늘의 추천: 엽기천국 ★','lk-marq'));
 const body=E('main','lk-body');page.append(body);
 const cats=d.cats.map(([cat,list])=>[cat,list.slice()]);
 for(const id of ORDER){const S=SITES[id];if(!S.linkCat||S.hidden)continue;let c=cats.find(x=>x[0]===S.linkCat);if(!c){c=[S.linkCat,[]];cats.push(c)}c[1].push([id,S.name,S.desc||'',S.star||4])}
 for(const [cat,list] of cats){const box=E('section','lk-box');box.append(E('h3','',cat));for(const [id,name,desc,star] of list){const row=E('div','lk-row');row.append(B(name,()=>go({type:'home'},id),'lk-link'),E('small','',' '+desc),E('em','lk-star',stars(star)),E('small','lk-url',SITES[id]?SITES[id].domain:''));if(SITES[id]&&SITES[id].isNew)row.append(E('b','lk-new','NEW'));box.append(row)}body.append(box)}
 const dead=E('section','lk-box');dead.append(E('h3','','접속이 불안정한 곳'));for(const [dom,name] of d.dead)dead.append(B(name,()=>go({type:'unavailable',query:'http://'+dom},'naver'),'lk-link dead'));
 for(const id of ORDER){const S=SITES[id];if(!S.deadLink)continue;const b=B(S.deadLink,()=>{if(b.disabled)return;b.disabled=true;let n=0;const tick=()=>{n++;b.textContent=S.deadLink+'  ...연결 시도 중 ('+n+'/3)';if(n<3)later(tick,450);else later(()=>go({type:'home'},id),450)};tick()},'lk-link dead revive');dead.append(b)}
 body.append(dead);
 const rnd=B('두근두근 랜덤 사이트로 이동!',()=>{const list=ORDER.filter(x=>x!=='w-links'&&!SITES[x].hidden),pick=list[Math.floor(Math.random()*list.length)];go({type:'home'},pick)},'lk-random');body.append(rnd);
 const tips=E('section','lk-box');tips.append(E('h3','','이용 안내'));for(const t of d.tips)tips.append(E('p','',t));body.append(tips)};
/* ============ 10. 귀여운 동물 사진방 ============ */
PAGE.cute=function(page,env){
 const {E,B,go,r}=env,d=D().cute,G=w.WebGhost;
 const head=E('header','ct-head');head.append(B('귀여운 동물 사진방',()=>go({type:'home'}),'ct-logo'),E('span','','보기만 해도 기분이 좋아지는 곳 ♡'));page.append(head);
 let i=Math.max(0,Math.min(3,parseInt(r.id,10)||0));
 const cv=E('canvas','ct-photo');cv.width=360;cv.height=260;const g=cv.getContext?cv.getContext('2d'):null;if(g&&G&&i<3){try{G.kitten(g,360,260,i)}catch(_){}}
 const cap=E('p','ct-cap',d.slides[i]),no=E('p','ct-no',(i+1)+' / 4');
 page.append(cv,cap,no);
 if(i<3){page.append(B('다음 사진 ▶',()=>go({type:'home',id:String(i+1)}),'ct-next'))}
 else{
  if(g){g.fillStyle='#fdf2f6';g.fillRect(0,0,360,260)}
  const out=E('p','ct-end','');page.append(out);
  later(()=>{trap(env,{kind:'child',text:'귀엽죠?',after:()=>{out.textContent='...사진이 사라졌습니다. 처음부터 다시 보세요.';page.append(B('처음으로',()=>go({type:'home'}),'ct-next'))}})},500)}};
/* ---------- 공개 ---------- */
function render(page,r,ctx){
 const site=ctx.portal(),S=SITES[site];if(!S)return false;stop();
 page.classList.add('web-site','ws-'+S.key);
 if(w.WebGhost&&w.WebGhost.preload&&['hompy','yeopgi','sorum','cute'].includes(S.key))w.WebGhost.preload();
 const env={ctx,E:ctx.E,B:ctx.B,site,key:S.key,r,k:kstate(ctx),page,go:(rt,to)=>ctx.navigate({...rt,portal:to||site})};
 const fn=PAGE[S.key];if(!fn)return false;fn(page,env);return true}
const favorites=go=>{const base=[['링크천국',()=>go('w-links'),{bold:true}],'-',['알짜배기 자료실',()=>go('w-jaryo')],['엽기천국',()=>go('w-yeopgi')],['플래시짱',()=>go('w-flash')],['하늘이의 홈페이지',()=>go('w-hompy')],['오늘의 운세',()=>go('w-fate')],['수다방 채팅',()=>go('w-chat')],['별빛소녀 팬클럽',()=>go('w-fan')]];
 const more=ORDER.filter(id=>SITES[id].fav&&!SITES[id].hidden).map(id=>[SITES[id].name,()=>go(id)]);return more.length?base.concat(['-'],more):base};
/* A94: 다른 파일에서 사이트를 더한다. def: {key,domain,caption,name,types,linkCat,desc,star,tags,fav,hidden,deadLink,isNew} */
function register(id,def,fn){if(!/^w-[a-z0-9]+$/.test(id)||!def||!def.key||typeof fn!=='function')return false;if(!SITES[id])ORDER.push(id);SITES[id]=def;PAGE[def.key]=fn;if(def.tags)TAGS[id]=def.tags;if(def.desc)DESC[id]=def.desc;return true}
/* A94: 포털 검색의 '사이트' 칸 */
function search(q){const term=String(q||'').toLowerCase().replace(/\s/g,'');if(!term)return[];const out=[];for(const id of ORDER){const S=SITES[id];if(S.hidden)continue;const hay=(S.name+S.caption+S.domain+(TAGS[id]||'')).toLowerCase().replace(/\s/g,'');if(hay.includes(term)||(term.length>=2&&(TAGS[id]||'').split(/\s+/).some(t=>t&&term.includes(t.toLowerCase()))))out.push({id,name:S.name,domain:S.domain,desc:DESC[id]||S.caption})}return out}
w.WebSites={owns:id=>!!SITES[id],caption:id=>SITES[id]?SITES[id].caption:'',domain:id=>SITES[id]?SITES[id].domain:'',resolveHost,route,url:urlOf,render,stop,favorites,sites:SITES,order:ORDER,pages:PAGE,strs,trapKinds:STORY_TRAP,register,search,
 kit:{marquee,digits,field,postForm,commentList,bar,stars,sparkle,site404,ie,trap,later,loop,listOf,pushTo,hash,reduced,holdReveal,cleanup:f=>{cleanups.push(f)}}};
})(window);
