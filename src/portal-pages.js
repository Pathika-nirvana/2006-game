/* A87 portal-pages.js : 포털 안의 기사, 게시글, 지식 답변, 상품 후기, 검색, 메일, 날씨, 오류 화면을 그리는 모듈.
   A94: 검색 결과 맨 위에 ‘사이트’ 칸(WebSites.search)을 더했다.
   xp-desktop.js가 PortalPages.create(ctx)로 불러 쓰며, 이 모듈이 없어도 기존 화면은 그대로 동작한다.
   모든 시각은 2006.05.30 16:32 이전으로 맞춘다.
   A87: 2005년 날짜(YY.MM.DD HH:MM), 기사 앞머리와 저작권 문구, 대댓글, 쪽 넘기기, 홈 화면 채움 모듈을 더했다. */
(function(w){'use strict';
const NOW='05.30 16:32';
/* 화면 맨 아래에 한 줄 들어가는 안내문. 지우고 싶으면 이 값을 빈 문자열로 바꾸면 된다. */
const DISCLAIMER='※ 이 화면은 게임 속에 만든 가상 인터넷입니다.';
const NICKS=['무명','접속중','지나가다','밤새는중','퇴근하고싶다','햇살한줌','라면끓이는중','초보네티즌','이웃주민','별빛','키보드앞','오늘도야근','눈팅족','김밥천국','딸기우유','방콕중','월급루팡','소심한A형','민트초코','졸린눈','블루문','까칠한곰','야근요정','주말만기다림','밤하늘','삼각김밥','나그네','공부하기싫어','햄버거세트','쿨한척','카페인중독','바람의아들','프로귀차니스트','늘푸른','하얀거탑','동네형','맑은하늘','안녕하세요','오렌지캬라멜','지나가는학생','컴퓨터앞','새벽두시','소주한잔','귀염둥이','감자칩','번개맨','노란우산','수요일의여자','개구쟁이','이슬비'];
const pad=n=>String(n).padStart(2,'0');
function hash(s){let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function vOf(yr,mo,d,h,mi){return((((yr-2006)*12+(mo-5))*31+d)*1440)+h*60+mi}
function parse(at){const m=/^(?:(?:(\d\d)\.)?(\d\d)\.(\d\d) )?(\d\d):(\d\d)$/.exec(at||'');let yr=2006,mo=5,d=30,h=16,mi=0;if(m){if(m[2]){mo=+m[2];d=+m[3];if(m[1])yr=2000+ +m[1]}h=+m[4];mi=+m[5]}return{yr,mo,d,h,mi,v:vOf(yr,mo,d,h,mi)}}
const NOWV=parse(NOW).v;
function fromV(v){const di=Math.floor(v/1440),mm=v-di*1440,mIdx=Math.floor((di-1)/31),d=di-mIdx*31,abs=4+mIdx,yr=2006+Math.floor(abs/12),mo=(((abs%12)+12)%12)+1;return{yr,mo,d,h:Math.floor(mm/60),mi:mm%60,v}}
const full=p=>p.yr+'.'+pad(p.mo)+'.'+pad(p.d)+' '+pad(p.h)+':'+pad(p.mi);
const short=p=>(p.yr===2006?'':pad(p.yr%100)+'.')+pad(p.mo)+'.'+pad(p.d)+' '+pad(p.h)+':'+pad(p.mi);
const listStamp=p=>(p.yr===2006&&p.mo===5&&p.d===30)?pad(p.h)+':'+pad(p.mi):(p.yr===2006?pad(p.mo)+'.'+pad(p.d):pad(p.yr%100)+'.'+pad(p.mo)+'.'+pad(p.d));
const norm=s=>String(s||'').toLowerCase().replace(/\s/g,'');
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const money=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const BRAND={naver:'NAVER',daum:'Daum',yahoo:'Yahoo! Korea'};
const BOARDLABEL={naver:'카페·블로그',daum:'카페·블로그',yahoo:'블로그'};

function create(ctx){
 const{E,B,link,box,navigate,saved,save}=ctx;
 const P=()=>ctx.portal();
 const news=w.PortalNews||{},boards=w.PortalBoards||{};
 const mailRead=new Set();
 const meta=()=>(boards.meta&&boards.meta[P()])||{cafe:'카페',cafeSub:'',kin:'지식',kinSub:'',mail:'메일',notices:[]};
 function stampOf(x){return parse(x&&x.at)}
 function order(xs){return xs.slice().sort((a,b)=>stampOf(b).v-stampOf(a).v)}
 function bylineOf(x){return x.press?x.press+(x.by?' '+x.by:''):(x.by||x.nick||'편집부')}
 function pressOf(x){return x.press||x.by||x.nick||'편집부'}
 function typeRoute(x){return x.type==='만화'?'comic':x.type==='지식iN'?'question':x.type==='카페'?'post':'article'}
 function open(x){return link(x.title,{type:typeRoute(x),id:x.comicId||x.id})}
 function commentCount(x){return (x.replies||[]).length+((saved.comments&&saved.comments[x.id])||[]).length}
 function hitsOf(x){return x.hits||(300+hash(x.id)%900)}
 function answersOf(x){return x.answers||(x.reply?[{n:'이웃답변',lv:'내공 300',pick:true,text:x.reply}]:[])}
 function paragraphs(parent,text,cls,lead){let first=true;for(const part of String(text||'').split(/\n\s*\n/)){const p=E('p',cls||'xp79-article p86-para');if(lead&&first)p.append(E('b','p87-dateline',lead+' '),E('span','',part));else p.textContent=part;first=false;parent.append(p)}}
 function pagedRows(table,nav,xs,per,drawRow){let page=0,made=[];const pages=Math.max(1,Math.ceil(xs.length/per));const draw=()=>{for(const n of made)n.remove();made=[];xs.slice(page*per,page*per+per).forEach((x,i)=>{const n=drawRow(x,page*per+i);if(n){table.append(n);made.push(n)}});nav.replaceChildren();if(pages>1){nav.append(E('small','p87-pageinfo',xs.length+'건  |  '+(page+1)+' / '+pages+' 쪽'));if(page>0)nav.append(B('◀ 이전',()=>{page--;draw()},'p87-pg'));for(let i=0;i<pages;i++)nav.append(B(String(i+1),()=>{page=i;draw()},'p87-pg'+(i===page?' on':'')));if(page<pages-1)nav.append(B('다음 ▶',()=>{page++;draw()},'p87-pg'))}};draw()}
 function adSlot(parent,product){const slot=E('div','p86-adslot');ctx.displayAd(slot,product);parent.append(slot)}
 function unread(){const list=((boards.mail||{})[P()])||[];return list.filter(m=>m.kind==='inbox'&&m.unread&&!mailRead.has(P()+m.id)).length}

 /* ---------- 공지줄, 하단 ---------- */
 function notice(page){const prof=ctx.profiles[P()];if(!prof||!prof.notice)return;const n=E('div','p86-notice');n.append(E('b','','공지'),E('span','',prof.notice.replace(/^\[[^\]]*\]\s*/,'')));page.append(n)}
 function footer(){const f=E('footer','xp79-web-footer p86-footer');const links=E('div','p86-footlinks');for(const t of ['회사소개','광고안내','제휴문의','이용약관','개인정보취급방침','청소년보호정책','고객센터'])links.append(E('span','',t));f.append(links,E('div','p86-copy','Copyright © 2006 '+BRAND[P()]+'. All Rights Reserved.'));if(DISCLAIMER)f.append(E('small','p86-disclaimer',DISCLAIMER));return f}

 /* ---------- 댓글 ---------- */
 function replyBox(parent,record,title){
  const items=[];const list=record.replies||[];const base=stampOf(record).v;const span=Math.max(0,NOWV-base);const gapMax=Math.max(3,Math.min(55,Math.floor(span/(list.length+1))));let t=base;
  list.forEach((r,i)=>{t=Math.min(NOWV,t+2+hash(record.id+i)%gapMax);const raw=typeof r==='string'?r:r.t,sub=/^ㄴ\s*/.test(raw);items.push({n:typeof r==='string'?NICKS[hash(i+'n'+record.id)%NICKS.length]:r.n,t:sub?raw.replace(/^ㄴ\s*/,''):raw,sub,at:short(fromV(t)),up:sub?0:(hash(i+'u'+record.id)%7===0?0:hash(i+'u'+record.id)%23),op:typeof r!=='string'&&r.n===record.nick,del:/^※ 운영자에 의해 삭제된/.test(raw)})});
  const mine=(saved.comments&&saved.comments[record.id])||[];
  const total=items.length+mine.length;
  const n=box(parent,(title||'네티즌 의견')+' ('+total+')','p86-replies');
  for(const it of items){if(it.del){const gone=E('div','xp79-comment p86-reply p88-deleted');gone.append(E('b','p86-nick','삭제'),E('span','p86-reply-text',it.t),E('small','p86-reply-meta',it.at));n.append(gone);continue}const row=E('div','xp79-comment p86-reply'+(it.sub?' p87-nested':''));row.append(E('b','p86-nick',(it.sub?'└ ':'')+it.n+(it.op?' (글쓴이)':'')),E('span','p86-reply-text',it.t),E('small','p86-reply-meta',it.at+(it.up?'  |  추천 '+it.up:'')));n.append(row)}
  for(const text of mine){const row=E('div','xp79-comment p86-reply');row.append(E('b','p86-nick','게스트'),E('span','p86-reply-text',text),E('small','p86-reply-meta',short(parse(NOW))));n.append(row)}
  const form=E('form','xp79-comment-form'),input=E('input');input.maxLength=100;input.placeholder='짧은 댓글을 남겨 보세요';input.setAttribute('aria-label','댓글');
  const submit=B('등록',()=>{});submit.type='submit';form.append(input,submit);
  form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim().slice(0,100);if(!text)return;saved.comments[record.id]=[...(saved.comments[record.id]||[]),text].slice(-12);save();ctx.rerender()});
  n.append(form);return n}

 /* ---------- 상품 페이지(광고) ---------- */
 function productPage(parent,record){
  const p=(news.products||{})[record.product];if(!p){parent.append(E('h2','',record.title),E('p','xp79-article',record.body));return}
  const crumb=E('div','p86-crumb');crumb.append(link('쇼핑',{type:'shopping'}),E('span','',' > '+p.category));parent.append(crumb);
  const wrap=E('div','p86-product'),pic=E('img','p86-product-pic');pic.src='assets/pc-desktop/ads/'+record.product+'.webp';pic.alt=p.name;
  const info=E('div','p86-product-info');info.append(E('h2','',p.name),E('b','p86-product-copy',p.copy));
  const avg=p.reviews.length?Math.round(p.reviews.reduce((a,b)=>a+b.star,0)/p.reviews.length*10)/10:0;
  info.append(E('div','p86-rating',stars(Math.round(avg))+'  '+avg.toFixed(1)+'  (사용기 '+p.reviews.length+'건)'));
  const price=p.specs.find(s=>s[0]==='가격');if(price){const num=/원/.test(price[1]);info.append(E('div','p86-price'+(num?'':' plain'),num?'판매가  '+price[1]:'가격  대리점과 가입 조건에 따라 다릅니다'))}
  wrap.append(pic,info);parent.append(wrap);
  parent.append(E('p','xp79-article p86-product-lead',p.lead));
  const feat=box(parent,'제품 특징','p86-features');for(const f of p.features)feat.append(E('p','','· '+f));
  const spec=box(parent,'상품 정보','p86-spec');for(const[k,v]of p.specs){const row=E('div','p86-spec-row');row.append(E('b','',k),E('span','',v));spec.append(row)}
  const rv=box(parent,'구매자 사용기 ('+p.reviews.length+')','p86-reviews');
  for(const r of p.reviews){const item=E('div','p86-review');const head=E('div','p86-review-head');head.append(E('span','p86-stars',stars(r.star)),E('span','',' '+r.title));item.append(head,E('small','p86-review-meta',r.nick+'  |  2006.'+r.at+'  |  도움이 됐어요 '+r.up));paragraphs(item,r.text,'p86-review-text');rv.append(item)}
  return replyBox(parent,record,'게스트 사용기')}

 /* ---------- 기사 ---------- */
 function hotBox(parent,limit,title){
  const xs=ctx.catalog().filter(x=>x.type==='뉴스').slice().sort((a,b)=>hitsOf(b)-hitsOf(a)).slice(0,limit||5);
  const n=box(parent,title||'이 시각 많이 본 뉴스','p87-hot');xs.forEach((x,i)=>{const row=E('div','p87-hot-line');row.append(E('b','',String(i+1)),link(x.title,{type:'article',id:x.id}),E('small','',pressOf(x)));n.append(row)});return n}
 function newsPage(parent,record){
  const prof=ctx.profiles[record.owner];
  const crumb=E('div','p86-crumb');crumb.append(link(prof.news,{type:'section',query:record.section||''}),E('span','',' > '+(record.section||'뉴스')));parent.append(crumb);
  parent.append(E('h2','p86-title',record.title));
  parent.append(E('div','p86-meta','입력 '+full(stampOf(record))+'  |  '+bylineOf(record)));
  const wrap=E('div','p87-articlebody');let size=0;
  const tools=E('div','p86-tools');
  const big=B('글자 크게',()=>{size=Math.min(1,size+1);wrap.classList.toggle('big',size>0);wrap.classList.toggle('small',size<0)},'p87-fs'),sm=B('글자 작게',()=>{size=Math.max(-1,size-1);wrap.classList.toggle('big',size>0);wrap.classList.toggle('small',size<0)},'p87-fs');
  tools.append(big,sm,B(saved.discoveries.includes(record.id)?'수첩에 담은 이야기':'수첩에 남기기',()=>{if(!saved.discoveries.includes(record.id)){saved.discoveries.push(record.id);save();w.MEMO?.add('인터넷에서 읽은 이야기 · '+record.title,record.body,0)}ctx.rerender()}));
  parent.append(tools);
  if(record.photo){const fig=E('figure','p86-photo'),im=E('img');im.src=record.photo.src;im.alt=record.photo.cap;fig.append(im,E('figcaption','',record.photo.cap));wrap.append(fig)}
  paragraphs(wrap,record.body,'xp79-article p86-para',record.press?'【'+(record.dateline||'서울')+'='+record.press+'】':'');
  if(record.press)wrap.append(E('div','p87-copyright','ⓒ '+record.press+' 무단전재 및 재배포 금지'));
  parent.append(wrap);
  const rel=(record.related||[]).map(id=>ctx.records.find(x=>x.id===id)).filter(Boolean);
  const fill=rel.length?rel:order(ctx.catalog().filter(x=>x.type==='뉴스'&&x.id!==record.id&&x.section===record.section)).slice(0,3);
  if(fill.length){const r=box(parent,'관련 기사','p86-related');for(const x of fill)r.append(link('· '+x.title,{type:'article',id:x.id}));}
  replyBox(parent,record,'네티즌 의견');
  hotBox(parent,5);
  adSlot(parent,prof.ad)}

 /* ---------- 카페, 블로그 글 ---------- */
 function postPage(parent,record){
  const m=meta();const crumb=E('div','p86-crumb');crumb.append(link(m.cafe,{type:'cafe'}),E('span','',' > '+(record.section||'전체글')));parent.append(crumb);
  parent.append(E('h2','p86-title',record.title));
  parent.append(E('div','p86-meta',(record.nick||'익명')+'  |  '+full(stampOf(record))+'  |  조회 '+money(hitsOf(record))+(record.rec?'  |  추천 '+record.rec:'')));
  paragraphs(parent,record.body);
  parent.append(link('◀ 목록으로',{type:'cafe'}));
  replyBox(parent,record,'댓글')}

 /* ---------- 지식 질문 ---------- */
 function kinPage(parent,record){
  const m=meta(),k=record.kin||{cat:'기타',pts:0};
  const crumb=E('div','p86-crumb');crumb.append(link(m.kin,{type:'knowledge'}),E('span','',' > '+k.cat));parent.append(crumb);
  const q=E('div','p86-question');q.append(E('b','p86-q','Q'),E('h2','p86-title',record.title));parent.append(q);
  parent.append(E('div','p86-meta',(record.nick||'게스트')+' 님의 질문  |  '+full(stampOf(record))+'  |  조회 '+money(hitsOf(record))+(k.pts?'  |  '+(P()==='naver'?'내공 ':'포인트 ')+k.pts:'')));
  paragraphs(parent,record.body);
  const ans=answersOf(record);
  const a=box(parent,'답변 '+ans.length+'개','p86-answers');
  if(!ans.length)a.append(E('p','xp79-answer','답변: 아직 등록된 답변이 없습니다. 이웃의 답변을 기다리고 있어요.'));
  ans.forEach((x,i)=>{const row=E('div','xp79-answer p86-answer'+(x.pick?' pick':''));row.append(E('b','p86-a','A'+(i+1)),E('strong','',x.n),E('small','',x.lv||''),x.pick?E('em','p86-pick','질문자 채택'):E('span','',''));paragraphs(row,x.text,'p86-answer-text');a.append(row)});
  replyBox(parent,{...record,replies:record.replies||[]},'의견');
  adSlot(parent,ctx.profiles[P()].ad)}

 function article(parent,r){
  const record=ctx.records.find(x=>x.id===r.id)||saved.questions.find(x=>x.id===r.id);
  if(!record||!record.owner||!ctx.profiles[record.owner])return false;
  if(record.product||record.type==='광고'){productPage(parent,record);return true}
  if(record.type==='카페')postPage(parent,record);
  else if(record.type==='지식iN'||saved.questions.some(x=>x.id===record.id))kinPage(parent,record);
  else newsPage(parent,record);
  return true}

 /* ---------- 검색 ---------- */
 function hitLine(parent,x,term){
  const hit=E('section','xp79-search-hit');
  const sub=x.type==='뉴스'?pressOf(x)+'  |  '+full(stampOf(x)):x.type==='카페'?(x.nick||'')+'  |  '+full(stampOf(x)):x.type==='지식iN'?'답변 '+answersOf(x).length+'개  |  '+(x.kin?x.kin.cat:''):'';
  hit.append(E('small','',x.type==='지식iN'?({naver:'지식iN',daum:'신지식',yahoo:'지식'})[P()]:x.type),open(x));
  const body=String(x.body||'').replace(/\s+/g,' ');const snippet=body.length>100?body.slice(0,100)+'…':body;
  const p=E('p','',snippet);hit.append(p);if(sub)hit.append(E('small','p86-hit-meta',sub));parent.append(hit)}
 function searchPage(parent,r){
  const raw=r.query||'',term=norm(raw);
  parent.append(E('h2','','“'+(raw||'전체')+'” 검색 결과'));
  const found=ctx.catalog().filter(x=>!term||norm(x.title+x.tags+x.body).includes(term));
  const ads=found.filter(x=>x.type==='광고'),rest=found.filter(x=>x.type!=='광고');
  /* A94: 2006년 포털처럼 맨 위에 ‘사이트’ 검색 결과를 보여 준다 (등록된 개인 홈페이지와 사이트) */
  const sites=raw&&w.WebSites&&w.WebSites.search?w.WebSites.search(raw):[];
  parent.append(E('p','p86-count','총 '+(rest.length+sites.length)+'건'+(raw?'  |  검색 시각 '+short(parse(NOW)):'')));
  if(sites.length){const sb=box(parent,'사이트 ('+sites.length+')','p86-group p94-sites');for(const x of sites.slice(0,5)){const line=E('div','p94-site');line.append(link(x.name,{type:'home',portal:x.id}),E('small','p94-site-url','http://'+x.domain),E('p','',x.desc));sb.append(line)}}
  if(ads.length){const sp=box(parent,'스폰서 링크','p86-sponsor');for(const x of ads.slice(0,2)){const line=E('div','p86-sponsor-line');line.append(link(x.title,{type:'article',id:x.id}),E('small','',x.body));sp.append(line)}}
  if(!rest.length){if(!sites.length){const none=E('div','p86-nohit');none.append(E('b','','‘'+raw+'’에 대한 검색결과가 없습니다.'),E('p','','· 단어의 철자가 정확한지 확인해 보세요.'),E('p','','· 검색어의 단어 수를 줄이거나, 보다 일반적인 검색어로 다시 검색해 보세요.'),E('p','','· 두 단어 이상을 입력하셨다면 띄어쓰기를 확인해 보세요.'));parent.append(none)}const alt=box(parent,'이런 검색어는 어떠세요?','p86-related-q');for(const t of ctx.profiles[P()].trend.slice(0,5))alt.append(link(t,{type:'search',query:t}));return}
  const groups=[['뉴스',x=>x.type==='뉴스'],[BOARDLABEL[P()],x=>x.type==='카페'],[meta().kin,x=>x.type==='지식iN'],['만화',x=>x.type==='만화']];
  for(const[name,test]of groups){const xs=order(rest.filter(test));if(!xs.length)continue;const g=box(parent,name+' ('+xs.length+')','p86-group');const holder=E('div','p86-group-list');g.append(holder);let shown=Math.min(4,xs.length);const draw=()=>{holder.replaceChildren();for(const x of xs.slice(0,shown))hitLine(holder,x,raw);if(shown<xs.length){holder.append(B('더 보기 ('+(xs.length-shown)+'건)',()=>{shown=xs.length;draw()},'p86-more'))}};draw()}
  const rel=box(parent,'연관 검색어','p86-related-q');for(const t of ctx.profiles[P()].trend.filter(t=>norm(t)!==term).slice(0,5))rel.append(link(t,{type:'search',query:t}))}

 /* ---------- 카페, 지식 목록 ---------- */
 function cafePage(parent,r){
  const m=meta();
  parent.append(E('div','p83-community-title',m.cafe),E('p','xp79-muted',m.cafeSub));
  parent.append(B(saved.attendance?'오늘 출석 완료 ✓':'출석 도장 찍기',()=>{saved.attendance=true;save();ctx.rerender()}));
  const posts=order(ctx.catalog().filter(x=>x.type==='카페'));
  const table=E('div','p86-table'),head=E('div','p86-row head');for(const t of ['번호','제목','글쓴이','날짜','조회'])head.append(E('span','',t));table.append(head);
  for(const[t,who,d]of m.notices){const row=E('div','p86-row notice');row.append(E('span','','공지'),E('span','p86-subject',t),E('span','',who),E('span','',d),E('span','',''));table.append(row)}
  const nav=E('div','p87-pager');
  pagedRows(table,nav,posts,12,(x,i)=>{const row=E('div','p86-row'),subject=E('span','p86-subject');subject.append(open(x));const c=commentCount(x);if(c)subject.append(E('em','p86-cmt',' ['+c+']'));row.append(E('span','',String(14820-i*7)),subject,E('span','',x.nick||''),E('span','',listStamp(stampOf(x))),E('span','',money(hitsOf(x))));return row});
  parent.append(table,nav)}
 function kinPageList(parent,r){
  const m=meta();parent.append(E('h2','',ctx.profiles[P()].knowledge),E('p','xp79-muted',m.kinSub));
  const xs=order(ctx.catalog().filter(x=>x.type==='지식iN'));
  const table=E('div','p86-table kin'),head=E('div','p86-row head');for(const t of ['분야','질문','답변','날짜'])head.append(E('span','',t));table.append(head);
  const nav=E('div','p87-pager');
  pagedRows(table,nav,xs,12,x=>{const row=E('div','p86-row'),subject=E('span','p86-subject');subject.append(open(x));row.append(E('span','',(x.kin?x.kin.cat.split(' > ').pop():'기타')),subject,E('span','',String(answersOf(x).length)),E('span','',listStamp(stampOf(x))));return row});
  parent.append(table,nav);
  for(const q of saved.questions.filter(x=>!x.owner||x.owner===P()))parent.append(link('나의 질문 · '+q.title,{type:'question',id:q.id}));
  parent.append(link('질문하기',{type:'write'}))}

 /* ---------- 섹션 ---------- */
 function sectionPage(parent,r){
  const term=r.query||'',all=ctx.catalog(),filtered=all.filter(x=>x.section===term||(x.title+x.tags).includes(term));
  parent.append(E('h2','',ctx.profiles[P()].name+' · '+(term||'전체기사')));
  const pool=order(filtered.length?filtered:all.filter(x=>x.type!=='광고'));
  const n=box(parent,'관련 기사·게시글 ('+pool.length+')','p83-module p86-sectionlist');
  const holder=E('div','p87-sec-rows'),nav=E('div','p87-pager');n.append(holder,nav);
  pagedRows(holder,nav,pool,12,x=>{const line=E('div','p86-sec-line');line.append(open(x),E('small','',x.type==='만화'?'만화':(x.type==='뉴스'?pressOf(x):x.type)+'  '+listStamp(stampOf(x))));return line});
  if(r.query==='스포츠')ctx.comicTeaser(parent,'overtime-02');
  ctx.displayAd(parent,ctx.profiles[P()].ad)}

 /* ---------- 메일 ---------- */
 function mailPage(parent,r){
  const m=meta(),all=((boards.mail||{})[P()])||[];
  parent.append(E('h2','',m.mail));
  const box0=E('div','p86-mail');parent.append(box0);let tab='inbox',openId=null;
  function draw(){
   box0.replaceChildren();
   const inbox=all.filter(x=>x.kind!=='spam'),spam=all.filter(x=>x.kind==='spam');
   const un=inbox.filter(x=>x.unread&&!mailRead.has(P()+x.id)).length;
   const tabs=E('div','p86-mail-tabs');
   tabs.append(B('받은메일함 ('+un+'/'+inbox.length+')',()=>{tab='inbox';openId=null;draw()},tab==='inbox'?'active':''),B('스팸메일함 ('+spam.length+')',()=>{tab='spam';openId=null;draw()},tab==='spam'?'active':''));box0.append(tabs);
   if(openId){const x=all.find(y=>y.id===openId);mailRead.add(P()+x.id);const d=E('div','p86-mail-view');d.append(E('h3','',x.subject),E('div','p86-meta','보낸사람 '+x.from+'  |  '+(/^\d\d:\d\d$/.test(x.at)?'2006.05.30 '+x.at:'2006.'+x.at)));paragraphs(d,x.body,'p86-mail-body');d.append(B('◀ 목록으로',()=>{openId=null;draw()}));box0.append(d);return}
   const list=E('div','p86-table mail');const rows=tab==='inbox'?inbox:spam;
   for(const x of rows){const read=mailRead.has(P()+x.id)||!x.unread;const row=E('div','p86-row'+(read?'':' unread'));const subj=E('span','p86-subject');subj.append(B(x.subject,()=>{openId=x.id;draw()},'xp79-web-link'));row.append(E('span','',read?'✉':'✉●'),E('span','p86-from',x.from),subj,E('span','',x.at));list.append(row)}
   if(!rows.length)list.append(E('p','xp79-muted','메일이 없습니다.'));box0.append(list)}
  draw()}

 /* ---------- 날씨 ---------- */
 function weatherPage(parent){
  const wd=news.weather;if(!wd)return false;
  parent.append(E('h2','','전국 날씨 · 2006년 5월 30일 (화)'),E('div','xp79-weather-big','서울 '+wd.cities[0][1]+'℃ '+wd.cities[0][3]),E('p','p86-weather-note',wd.note));
  const t=E('div','p86-table weather'),head=E('div','p86-row head');for(const x of ['지역','낮','아침','날씨','강수'])head.append(E('span','',x));t.append(head);
  for(const c of wd.cities){const row=E('div','p86-row');row.append(E('span','',c[0]),E('span','',c[1]+'℃'),E('span','',c[2]+'℃'),E('span','',c[3]),E('span','',c[4]));t.append(row)}parent.append(t);
  const week=box(parent,'주간 예보 (서울)','p86-week');for(const d of wd.week){const row=E('div','p86-week-row');row.append(E('b','',d[0]),E('span','',d[1]),E('span','',d[3]+'~'+d[2]+'℃'));week.append(row)}
  const idx=box(parent,'생활지수','p86-index');for(const[k,v]of wd.index){const row=E('div','p86-week-row');row.append(E('b','',k),E('span','',v));idx.append(row)}
  parent.append(link('디지털카메라와 나들이 이야기',{type:'search',query:'디카'}));return true}

 /* ---------- 쇼핑 ---------- */
 function shoppingPage(parent){
  const names={naver:'지식쇼핑',daum:'쇼핑하우',yahoo:'야후! 쇼핑'};
  parent.append(E('h2','',names[P()]),E('p','xp79-muted','가격은 판매처와 가입 조건에 따라 달라질 수 있습니다.'));
  const grid=E('div','p86-shop');
  for(const key of ['phone','mp3','camera']){const p=(news.products||{})[key];if(!p)continue;const b=B('',()=>navigate({type:'article',id:P()+'-ad-'+key}),'p86-shop-item'),im=E('img');im.src='assets/pc-desktop/ads/'+key+'.webp';im.alt=p.name;
   const avg=Math.round(p.reviews.reduce((a,x)=>a+x.star,0)/p.reviews.length);const price=p.specs.find(s=>s[0]==='가격');
   b.append(im,E('strong','',p.name),E('small','',p.category),E('span','p86-rating',stars(avg)+' ('+p.reviews.length+')'),E('em','',price?(/원/.test(price[1])?price[1].replace(/\s*\(.*\)/,''):'가격 문의'):''));grid.append(b)}
  parent.append(grid);
  for(const key of ['phone','mp3','camera'])ctx.displayAd(parent,key)}

 /* ---------- 오류 ---------- */
 function errorPage(parent,r){
  parent.append(E('h2','','페이지를 표시할 수 없습니다'),E('p','','찾으려는 페이지가 제거되었거나 이름이 변경되었거나 일시적으로 사용할 수 없습니다.'));
  parent.append(E('p','','다음을 시도해 보십시오.'));
  const ul=E('div','p86-error-list');for(const t of ['· 주소 표시줄에 입력한 주소의 철자가 올바른지 확인하십시오.','· 주소가 정확하다면 새로 고침 단추를 누르거나 잠시 후 다시 시도하십시오.','· 아래 링크로 포털 첫 화면에 돌아가서 필요한 메뉴를 찾아보십시오.'])ul.append(E('p','',t));parent.append(ul);
  parent.append(link('시작 페이지로',{type:'home'}),E('small','p86-error-code','HTTP 404 - 파일을 찾을 수 없음 | 인터넷 익스플로러'))}

 function render(content,r){
  if(r.type==='article'||r.type==='post'||r.type==='question')return article(content,r);
  if(r.type==='search'){searchPage(content,r);return true}
  if(r.type==='cafe'){cafePage(content,r);return true}
  if(r.type==='knowledge'){kinPageList(content,r);return true}
  if(r.type==='section'){sectionPage(content,r);return true}
  if(r.type==='mail'){mailPage(content,r);return true}
  if(r.type==='weather')return weatherPage(content);
  if(r.type==='shopping'){shoppingPage(content);return true}
  if(r.type==='unavailable'){errorPage(content,r);return true}
  return false}
 function renderMissing(content,r){errorPage(content,r)}


 /* ---------- A87 홈 화면 채움: 글자뿐인 모듈, 그림은 새로 쓰지 않는다 ---------- */
 const ZODIAC=['쥐','소','범','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
 const FORTUNE=['작은 일에 꼼꼼하게 신경 쓰면 좋은 결과가 따릅니다. 오후에 반가운 소식이 올 수 있어요.','꾸준함이 빛을 발하는 날입니다. 서두르지 말고 맡은 일을 차근차근 해 나가세요.','자신감이 넘치는 하루입니다. 다만 말이 앞서면 실수하기 쉬우니 한 번 더 생각하세요.','주변 사람과 이야기하다가 좋은 생각을 얻습니다. 약속 시간을 지키면 점수를 얻어요.','뜻밖의 기회가 찾아옵니다. 망설이기보다 가볍게 도전해 보세요.','지출이 늘기 쉬운 날입니다. 충동구매만 조심하면 저녁이 편안합니다.','활동적인 하루입니다. 가벼운 운동이나 산책이 기분 전환에 도움이 됩니다.','마음이 여려지기 쉬운 날입니다. 가까운 사람의 따뜻한 말 한마디가 힘이 됩니다.','재치가 돋보이는 날입니다. 모임에서 분위기를 살릴 수 있어요.','정리정돈을 하면 운이 트입니다. 책상이나 가방부터 정리해 보세요.','믿음직한 모습으로 신뢰를 얻는 날입니다. 친구에게 먼저 연락해 보세요.','먹는 즐거움이 큰 날이지만 과식은 금물입니다. 여유로운 저녁을 보내세요.'];
 const COLORS=['노랑','파랑','빨강','초록','보라','하양','주황','분홍','남색','갈색','회색','연두'];
 const QUIZ=[['세상에서 가장 뜨거운 바다는?','열바다'],['바나나가 웃으면?','바나나킥'],['하늘에서 가장 돈을 많이 번 새는?','억새'],['오리가 얼면?','언덕'],['왕이 넘어지면?','킹콩'],['개가 사람을 가르칠 때 쓰는 말은?','개인지도'],['세상에서 가장 빠른 닭은?','후다닭'],['오징어가 죽으면?','말랐징어'],['도둑이 가장 좋아하는 아이스크림은?','보석바'],['자동차가 놀라면?','카놀라유']];
 const ENGLISH=[['How’s it going?','요즘 어때요?'],['I’m running late.','저 좀 늦을 것 같아요.'],['Could you say that again?','다시 한 번 말씀해 주시겠어요?'],['It’s on me.','제가 낼게요.'],['Take it easy.','편하게 쉬세요.'],['I’m all ears.','잘 듣고 있어요.']];
 const CAFES={naver:[['모두의 중고장터','생활'],['스타 부대 지정 연구소','게임'],['디카 출사 모임','사진'],['직장인 월급 지키기','재테크'],['붉은 응원 본부','스포츠'],['자취생 밥상','요리']],daum:[['열혈 응원 본부','스포츠'],['영화 보는 사람들','영화'],['PC 조립 연구회','컴퓨터'],['강아지 키우는 사람들','애완'],['주말 번개 모임','취미'],['토익 800 스터디','학습']],yahoo:[['출퇴근 자전거 일기','생활'],['집밥 레시피 노트','요리'],['조립PC 견적 상담','컴퓨터'],['주말 드라이브 코스','여행'],['필름카메라 이야기','사진'],['직장인 재테크 일기','경제']]};
 const POLLS={naver:{q:'독일월드컵, 한국 대표팀의 16강 진출 가능성은?',o:['충분히 갈 수 있다','쉽지는 않을 것 같다','잘 모르겠다'],base:[1204,893,311]},daum:{q:'청소년 PC방 심야 출입, 어떻게 생각하세요?',o:['제한이 필요하다','가정에서 지도할 문제다','잘 모르겠다'],base:[1480,1102,254]},yahoo:{q:'출퇴근길 필수품은 무엇인가요?',o:['MP3 플레이어','휴대폰 게임','신문이나 책','그냥 멍하니'],base:[1730,640,512,388]}};
 const state={};
 const st=(k,init)=>(state[P()+k]??=init());
 function votes(){const o={};for(const part of String(saved.snackVote||'').split(';')){const[k,v]=part.split('=');if(k&&v!==undefined)o[k]=v}return o}
 function pollBox(parent){
  const cfg=POLLS[P()],n=box(parent,'오늘의 투표','p87-poll'),v=votes(),mine=v[P()];n.append(E('b','p87-q',cfg.q));
  if(mine===undefined){cfg.o.forEach((t,i)=>n.append(B('○ '+t,()=>{v[P()]=String(i);saved.snackVote=Object.entries(v).map(([k,x])=>k+'='+x).join(';');save();ctx.rerender()},'p87-opt')))}
  else{const base=cfg.base.slice();base[+mine]+=1;const total=base.reduce((a,b)=>a+b,0);
   cfg.o.forEach((t,i)=>{const pct=Math.round(base[i]/total*100),row=E('div','p87-res'+(i===+mine?' mine':'')),bar=E('span','p87-bar'),fill=E('i','');fill.style.width=pct+'%';bar.append(fill);row.append(E('span','p87-res-t',t+(i===+mine?' (내 선택)':'')),bar,E('small','',pct+'%'));n.append(row)});
   n.append(E('small','p87-total','참여 '+money(total)+'명  |  투표해 주셔서 감사합니다'))}
  return n}
 function fortuneBox(parent){
  const n=box(parent,'오늘의 운세','p87-fortune'),grid=E('div','p87-zodiac'),cur=ZODIAC.indexOf(saved.fortune);
  ZODIAC.forEach((z,i)=>grid.append(B(z,()=>{saved.fortune=z;save();ctx.rerender()},'p87-z'+(i===cur?' on':''))));
  n.append(E('small','p87-hint','태어난 띠를 골라 보세요'),grid);
  if(cur>=0)n.append(E('b','p87-q',ZODIAC[cur]+'띠  |  5월 30일 (화)'),E('p','p87-text',FORTUNE[cur]),E('small','p87-hint','행운의 숫자 '+((cur*7+3)%9+1)+'  |  행운의 색 '+COLORS[cur]));
  return n}
 function quizBox(parent){
  const s=st('quiz',()=>({i:hash(P())%QUIZ.length,open:false})),n=box(parent,P()==='daum'?'유머 · 넌센스 퀴즈':'넌센스 퀴즈','p87-quiz'),body=E('div','p87-quiz-body');n.append(body);
  const draw=()=>{const row=E('div','p87-btnrow');row.append(s.open?E('span','p87-a','정답  '+QUIZ[s.i][1]):B('정답 보기',()=>{s.open=true;draw()},'p87-opt'),B('다음 문제 ▶',()=>{s.i=(s.i+1)%QUIZ.length;s.open=false;draw()},'p87-opt'));body.replaceChildren(E('b','p87-q','Q. '+QUIZ[s.i][0]),row)};
  draw();return n}
 function englishBox(parent){
  const s=st('eng',()=>({i:hash(P()+'e')%ENGLISH.length})),n=box(parent,'오늘의 영어 한마디','p87-english'),body=E('div','p87-eng-body');n.append(body);
  const draw=()=>{body.replaceChildren(E('b','p87-q',ENGLISH[s.i][0]),E('p','p87-text',ENGLISH[s.i][1]),B('다음 표현 ▶',()=>{s.i=(s.i+1)%ENGLISH.length;draw()},'p87-opt'))};
  draw();return n}
 function cafeRankBox(parent){
  const n=box(parent,P()==='yahoo'?'인기 블로그 모임':'인기 카페','p87-caferank');
  CAFES[P()].slice(0,6).forEach(([name,cat],i)=>{const row=E('div','p87-rank-line');row.append(E('b','',String(i+1)),link(name,{type:'cafe'}),E('small','',cat));n.append(row)});return n}
 function kinTopBox(parent){
  const xs=ctx.catalog().filter(x=>x.type==='지식iN').slice().sort((a,b)=>hitsOf(b)-hitsOf(a)).slice(0,5),n=box(parent,ctx.profiles[P()].knowledge+' · 인기 질문','p87-kintop');
  xs.forEach(x=>{const row=E('div','p87-rank-line');row.append(link(x.title,{type:'question',id:x.id}),E('small','','답변 '+answersOf(x).length));n.append(row)});n.append(link('질문하기',{type:'write'}));return n}
 function agoraBox(parent){
  const xs=ctx.catalog().filter(x=>x.type==='카페'&&x.section==='토론').slice().sort((a,b)=>hitsOf(b)-hitsOf(a)).slice(0,5),n=box(parent,'아고라 · 지금 뜨는 토론','p87-agora2');
  xs.forEach(x=>{const row=E('div','p87-rank-line');row.append(link(x.title,{type:'post',id:x.id}),E('small','','댓글 '+commentCount(x)));n.append(row)});return n}
 function eventBox(parent){
  const n=box(parent,'이벤트 · 알림','p87-event');
  for(const x of order(ctx.catalog().filter(y=>y.section==='이벤트')))n.append(link('· '+x.title,{type:'article',id:x.id}));
  n.append(link('· 출석 도장 찍으러 가기',{type:'cafe'}),link('· 지식 질문에 답해 주세요',{type:'knowledge'}),link('· 월드컵 응원 이야기 모아 보기',{type:'search',query:'월드컵'}),link('· 오늘의 만화 읽으러 가기',{type:'comics'}));return n}
 function latestBox(parent){
  const n=box(parent,P()==='yahoo'?'블로그 · 많이 읽은 글':'카페·블로그 · 많이 읽은 글','p87-latest');
  for(const x of ctx.catalog().filter(y=>y.type==='카페').slice().sort((a,b)=>hitsOf(b)-hitsOf(a)).slice(0,8)){const row=E('div','p87-latest-line'),c=commentCount(x);row.append(E('small','p87-tag',x.section||''),open(x),E('em','p86-cmt',c?'['+c+']':''),E('span','p87-who',x.nick||''),E('small','','조회 '+money(hitsOf(x))));n.append(row)}
  n.append(link('글 더 보기',{type:'cafe'}));return n}
 function fillHome(slots){
  const{left,main,right}=slots||{},pair=(a,b)=>{const row=E('div','p87-pair');main.append(row);a(row);b(row)};
  if(main){
   pair(r=>hotBox(r,6,P()==='daum'?'네티즌이 많이 본 뉴스':'많이 본 뉴스'),kinTopBox);
   pair(cafeRankBox,eventBox);
   pair(quizBox,pollBox);
   latestBox(main)}
  if(left)fortuneBox(left);
  if(right){if(!left)fortuneBox(right);englishBox(right)}}

 return{render,renderMissing,notice,footer,order,unread,pressOf,hotBox,hitsOf,fillHome};
}
w.PortalPages={create,version:'A87'};
})(window);
