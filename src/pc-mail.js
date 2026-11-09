/* A95: 받은 편지함. 포털의 ‘메일’과 바탕 화면의 ‘받은 쪽지’가 여는 화면을 진짜 메일함처럼 바꾼다.
   받은편지함 · 보낸편지함 · 스팸편지함 · 휴지통, 읽음 표시, 답장과 전달, 메일 쓰기, 답장 도착.
   행운의 편지(일곱 명에게 전달?), 광고 메일과 수신 거부, 운영자 사칭 메일(비밀번호를 묻는 사기), 인터넷 엽서, 잘못 온 메일과 반송.
   사람과 주소는 모두 지어낸 것이다. 날짜와 시각은 2006년 5월 30일 오후 4시 32분 이전이다. 기록은 saved.mail 에 남는다. */
(function(w){'use strict';
const INBOX=[
 {id:'m-mom',from:'엄마',addr:'mom@dongne-mail.net',at:'05/30 15:58',subj:'학원 끝나면 바로 와라',size:'1KB',body:'학원 끝나면 PC방 들르지 말고 바로 와라.\n냉장고에 수박 썰어 놨다.\n\n저녁은 김치볶음밥.\n\n- 엄마가\n\n추신. 엄마도 이제 메일 쓸 줄 안다 ^^'},
 {id:'m-luck',from:'수진',addr:'sujin_star@dongne-mail.net',at:'05/30 14:21',subj:'[펌] 행운의 편지 (꼭 끝까지 읽어!!)',size:'3KB',luck:true,body:'이 편지는 아주 먼 나라에서 시작되어 지구를 몇 바퀴나 돌았다고 합니다.\n이 편지를 받은 사람은 일주일 안에 일곱 명에게 똑같이 보내야 합니다.\n\n보낸 사람은 시험에서 백 점을 맞았고, 잃어버린 지우개도 찾았다고 합니다.\n무시한 어떤 학생은 다음 날 급식에 좋아하는 반찬이 안 나왔다고 합니다.\n\n믿거나 말거나... 하지만 혹시 모르니까 보내 주세요.\n\n(수진: 나도 받아서 보내는 거야 ㅠㅠ 미안 ㅋㅋ)'},
 {id:'m-ad1',from:'★대박이벤트★',addr:'event@free-gamemoney.biz',at:'05/30 13:05',subj:'(광고) 회원 가입만 해도 게임머니 100만 원 증정!!!',size:'12KB',ad:true,body:'★☆★ 지금 가입하면 게임머니 100만 원 즉시 지급 ★☆★\n\n이름, 주민등록번호, 휴대폰 번호만 입력하세요!\n선착순 100명! 서두르세요!!\n\n※ 수신을 원하지 않으시면 아래 수신 거부를 눌러 주세요.'},
 {id:'m-phish',from:'[운영자] 게임 고객센터',addr:'gm-center@game-help.biz',at:'05/30 12:40',subj:'[중요] 계정 확인 요청 (24시간 안에 답장하지 않으면 정지)',size:'2KB',phish:true,body:'안녕하세요 고객님. 게임 운영자입니다.\n\n고객님의 계정에서 이상한 접속이 확인되었습니다.\n계정 보호를 위해 아이디와 비밀번호를 이 메일에 답장으로 보내 주세요.\n\n24시간 안에 답장하지 않으면 계정이 영구 정지됩니다.\n\n- 운영자 드림'},
 {id:'m-card',from:'하늘',addr:'skydream@dongne-mail.net',at:'05/30 11:15',subj:'☆★ 인터넷 엽서가 도착했습니다 ★☆',size:'48KB',card:true,body:'하늘님이 보낸 플래시 엽서입니다.\n아래 ‘엽서 열어 보기’를 눌러 보세요.'},
 {id:'m-minho',from:'민호',addr:'kart_minho@dongne-mail.net',at:'05/30 10:02',subj:'야 오늘 PC방 ㄱ?',size:'1KB',body:'학교 끝나고 PC방 ㄱㄱ\n카트 타임 어택 기록 깼다 ㅋㅋ 구경 와라\n\n그리고 내일 영어 숙제 뭐냐... 알림장 안 씀'},
 {id:'m-mini',from:'미니홈피 알림',addr:'notice@minihome-mail.net',at:'05/30 09:30',subj:'[미니홈피] 새 일촌평과 방명록이 있어요',size:'2KB',mini:true,body:'회원님의 미니홈피에 새 소식이 있어요!\n\n· 일촌평 1개\n· 방명록 확인하기\n\n파도타기로 친구들 미니홈피에도 놀러 가 보세요.'},
 {id:'m-star',from:'별지기',addr:'byeoljigi@freemail-attic.net',at:'05/29 23:58',subj:'(제목 없음)',size:'1KB',wrong:true,body:'소라야.\n\n내일이야. 4시 반, 철봉 앞.\n늦어도 기다려 줘. 다락방 창문은 열어 뒀어.\n\n- 별\n\n(받는 사람 주소를 잘못 쓴 것 같은 메일이다.)'},
 {id:'m-cafe',from:'카페 운영진',addr:'staff@dongne-cafe.net',at:'05/29 21:00',subj:'[공지] 이번 주 정모 안내',size:'4KB',body:'이번 주 정모 공지 확인 바랍니다.\n회비 내역은 게시판에 올렸습니다.\n\n장소: 은하분식 앞 (토요일 오후 3시)\n준비물: 웃는 얼굴 ^^'},
 {id:'m-photo',from:'사진동호회',addr:'photo@dongne-cafe.net',at:'05/28 22:10',subj:'출사 원본 파일 올렸습니다',size:'2KB',body:'출사 원본 파일 올렸습니다.\n얼굴이 나온 사진은 외부로 퍼가지 말아 주세요.\n\n다음 출사: 은하아파트 옥상 노을 (관리실 허락받음)'},
 {id:'m-ad2',from:'여름특가',addr:'sale@summer-shop.biz',at:'05/28 08:00',subj:'(광고) ★슬라이드폰 공짜폰★ 지금 바꾸세요',size:'9KB',ad:true,body:'번호 이동하면 슬라이드폰이 공짜!!\n※ 가입 조건과 요금제는 꼭 확인하세요 (작은 글씨 주의)\n\n수신 거부는 아래 버튼을 눌러 주세요.'},
 {id:'m-safe',from:'알림',addr:'notice@dongne-mail.net',at:'05/27 09:00',subj:'첨부파일을 열기 전에 확인하세요',size:'1KB',body:'첨부파일을 실행하기 전에 보낸 사람과 파일 종류를 확인하세요.\n모르는 사람이 보낸 .exe 파일은 열지 마세요.'}
];
const CONTACTS=[['sujin','수진','sujin_star@dongne-mail.net'],['minho','민호','kart_minho@dongne-mail.net'],['haneul','하늘','skydream@dongne-mail.net'],['jieun','지은 언니','jieun_cam@dongne-mail.net'],['junho','준호 형','d170@dongne-mail.net'],['taehyun','태현 형','chungsung@dongne-mail.net'],['boss','PC방 사장님','pcbang2f@dongne-mail.net'],['teacher','정다운 선생님','haneulban@dongne-mail.net'],['mom','엄마','mom@dongne-mail.net'],['sora','바다소라','seashell@dongne-mail.net']];
const REPLY={sujin:['ㅋㅋ 메일 고마워!! 행운의 편지는 미안 ㅠㅠ 나도 받아서 보낸 거야','오~ 메일 잘 받았어 ^^ 미니홈피에도 놀러 와!'],minho:['ㅇㅋ ㅋㅋ PC방에서 보자','ㅋㅋㅋ 메일은 처음 받아 봄 ㄳ'],haneul:['메일 고마워요 ^^ 홈페이지 방명록에도 놀러 와요 ☆','반가워요~ 좋은 하루 보내요!'],jieun:['메일 고마워요 ^^ 디카 사진 보내 줄게요~','ㅎㅎ 잘 받았어요!'],junho:['고3이라 짧게... 메일 고마워','공부하러 간다... 잘 지내라'],taehyun:['충성! 메일 잘 받았다 ㅋㅋ','휴가 중이라 메일 확인이 빠르다 ㅋㅋ 고마워'],boss:['PC방 사장입니다 ^^ 메일 감사합니다. 컵라면은 카운터에서!','감사합니다 ^^ 오늘도 즐거운 시간 보내세요'],teacher:['메일 고마워요 ^^ 숙제는 하고 놀기!','반가워요~ 좋은 하루 보내세요!'],mom:['알았다. 일찍 들어와라 ^^ - 엄마','메일 잘 받았다. 수박 먹으러 빨리 와 - 엄마']};
function attach(X){
 const {E,B}=X;let alive=true;const timers=new Set();
 const later=(fn,ms)=>{const id=w.setTimeout(()=>{timers.delete(id);if(alive)fn()},ms);timers.add(id);return id};
 const view={box:'inbox',id:null,compose:null};let ctxNow=null,portalNow='naver',pmail=[];
 const DOM={naver:'naver.com',daum:'hanmail.net',yahoo:'yahoo.co.kr'};
 const conv=(list,portal)=>(list||[]).filter(x=>x&&x.id&&x.subject).map(x=>({id:'p-'+portal+'-'+x.id,from:String(x.from||'알림'),addr:'webmaster@'+(DOM[portal]||'naver.com'),at:/^\d\d:\d\d$/.test(x.at||'')?'05/30 '+x.at:String(x.at||'05/30'),subj:x.subject,body:String(x.body||''),size:'2KB',portalSpam:x.kind==='spam',preRead:!x.unread,portal:true}));
 function S(){const s=X.saved;if(!s.mail||typeof s.mail!=='object'||Array.isArray(s.mail))s.mail={};const m=s.mail;for(const k of ['read','del','spam','gone','unspam'])if(!m[k]||typeof m[k]!=='object'||Array.isArray(m[k]))m[k]={};for(const k of ['sent','got'])if(!Array.isArray(m[k]))m[k]=[];if(!Number.isFinite(m.fwd)||m.fwd<0)m.fwd=0;return m}
 const toast=(t,x)=>{X.ui&&X.ui.toast&&X.ui.toast({title:t,text:x,icon:'info',ms:4200})};
 const nick=()=>String((X.saved.xp&&X.saved.xp.nick)||'게스트').slice(0,12);
 function all(list,portal){const m=S();const got=m.got.filter(x=>x&&typeof x.id==='string');return [...got,...INBOX,...conv(list||pmail,portal||portalNow)].filter(x=>!m.gone[x.id]).sort((a,b)=>a.at<b.at?1:a.at>b.at?-1:0)}
 function boxOf(x){const m=S();if(m.del[x.id])return 'trash';if(m.spam[x.id])return 'spam';if(x.portalSpam&&!m.unspam[x.id])return 'spam';return 'inbox'}
 const isRead=x=>!!(S().read[x.id]||x.preRead);
 const unread=(portal,list)=>all(list,portal).filter(x=>boxOf(x)==='inbox'&&!isRead(x)).length;
 function rerender(){if(ctxNow&&ctxNow.rerender)ctxNow.rerender()}
 function render(parent,ctx){ctxNow=ctx||ctxNow;if(ctx&&ctx.portal)portalNow=ctx.portal;if(ctx&&Array.isArray(ctx.portalMail))pmail=ctx.portalMail;const m=S();const root=E('div','ml-root');parent.append(root);
  const head=E('div','ml-head');head.append(E('b','ml-logo',{naver:'네이버 메일',daum:'한메일',yahoo:'야후! 메일'}[portalNow]||'메일'),E('span','',nick()+'@'+(DOM[portalNow]||'dongne-mail.net')),B('메일 쓰기',()=>{view.compose={to:'',subj:'',body:''};view.id=null;rerender()},'ml-btn strong'));root.append(head);
  const layout=E('div','ml-layout'),side=E('aside','ml-side'),main=E('main','ml-main');layout.append(side,main);root.append(layout);
  const cnt=b=>b==='sent'?m.sent.length:all().filter(x=>boxOf(x)===b).length;
  for(const [b,label] of [['inbox','받은편지함'],['sent','보낸편지함'],['spam','스팸편지함'],['trash','휴지통']])side.append(B(label+' ('+(b==='inbox'?unread(portalNow,pmail)+'/':'')+cnt(b)+')',()=>{view.box=b;view.id=null;view.compose=null;rerender()},'ml-folder'+(view.box===b&&!view.compose?' on':'')));
  side.append(E('p','ml-quota','메일함 용량 2.4MB / 10MB'),E('div','ml-qbar'));
  if(view.compose)return compose(main);
  if(view.id){const x=all().find(y=>y.id===view.id)||(view.box==='sent'?m.sent.find(y=>y.id===view.id):null);if(x)return read(main,x);view.id=null}
  if(view.box==='sent'){main.append(E('h3','ml-h','보낸편지함'));if(!m.sent.length)main.append(E('p','ml-empty','보낸 메일이 없어요.'));for(const x of m.sent.slice().reverse()){const row=B('',()=>{view.id=x.id;rerender()},'ml-row read');row.append(E('span','ml-from','받는 사람: '+x.toName),E('span','ml-subj',x.subj),E('span','ml-at',x.at));main.append(row)}return}
  const list=all().filter(x=>boxOf(x)===view.box);main.append(E('h3','ml-h',{inbox:'받은편지함',spam:'스팸편지함',trash:'휴지통'}[view.box]+' · 안 읽은 메일 '+list.filter(x=>!isRead(x)).length+'통'));
  if(view.box==='trash'&&list.length)main.append(B('휴지통 비우기',()=>{for(const x of list)m.gone[x.id]=1;X.save();rerender()},'ml-btn'));
  if(!list.length)main.append(E('p','ml-empty',view.box==='spam'?'스팸 메일이 없어요. 깨끗해요!':'메일이 없어요.'));
  for(const x of list){const row=B('',()=>{view.id=x.id;m.read[x.id]=1;X.save();rerender()},'ml-row'+(isRead(x)?' read':''));row.append(E('span','ml-from',x.from),E('span','ml-subj',x.subj),E('span','ml-at',x.at),E('span','ml-size',x.size||'1KB'));main.append(row)}}
 function read(main,x){const m=S();const art=E('article','ml-read');art.append(E('h3','ml-h',x.subj));const meta=E('p','ml-meta');meta.append(E('b','',x.toName?'받는 사람 ':'보낸 사람 '),E('span','',x.toName?x.toName+' <'+x.to+'>':x.from+' <'+x.addr+'>'),E('b','','  날짜 '),E('span','','2006/'+x.at));art.append(meta,E('div','ml-body',x.body));
  if(x.card){const card=E('div','ml-card');const btn=B('엽서 열어 보기',()=>{card.classList.add('open');btn.remove()},'ml-btn strong');card.append(E('div','ml-card-in','☆ 오늘도 반짝반짝 ☆\n\nPC방 친구에게.\n좋은 일만 가득하길!\n\n- 하늘 -'),btn);for(let i=0;i<12;i++){const s=E('i','ml-star','★');s.style.left=(i*8+3)+'%';s.style.animationDelay=(i%5)*.4+'s';card.append(s)}art.append(card)}
  const tools=E('div','ml-tools');
  if(!x.toName){tools.append(B('답장',()=>reply(x),'ml-btn'),B('전달',()=>forward(x),'ml-btn'));
   if(boxOf(x)==='trash')tools.append(B('되살리기',()=>{delete m.del[x.id];X.save();view.id=null;rerender()},'ml-btn'));else tools.append(B('삭제',()=>del(x),'ml-btn'));
   if(boxOf(x)==='spam'&&!x.ad&&!x.phish)tools.append(B('스팸 아님',()=>{delete m.spam[x.id];m.unspam[x.id]=1;X.save();view.id=null;rerender()},'ml-btn'));
   if(x.ad&&boxOf(x)!=='spam')tools.append(B('수신 거부',()=>refuse(x),'ml-btn'));
   if(boxOf(x)!=='spam'&&(x.ad||x.phish))tools.append(B('스팸 신고',()=>{m.spam[x.id]=1;X.save();toast('메일','스팸편지함으로 옮겼어요.');view.id=null;rerender()},'ml-btn'));
   if(x.mini&&X.openApp)tools.append(B('미니홈피 열기',()=>X.openApp('minihome'),'ml-btn strong'))}
  tools.append(B('목록',()=>{view.id=null;rerender()},'ml-btn'));art.append(tools);main.append(art)}
 function del(x){const m=S();if(x.luck&&!m.del[x.id])toast('행운의 편지','행운의 편지를 지웠다... 오늘 급식은 괜찮겠지?');m.del[x.id]=1;X.save();view.id=null;rerender()}
 function refuse(x){const m=S();m.spam[x.id]=1;X.save();toast('수신 거부','수신 거부를 신청했어요. ...그런데 광고 메일이 한 통 더 왔다?!');
  later(()=>{const id='g-ad-'+m.got.length;m.got.push({id,from:'★대박이벤트★',addr:'event2@free-gamemoney.biz',at:'05/30 16:32',subj:'(광고) 수신 거부 감사 이벤트!! 게임머니 200만 원!!',size:'14KB',ad:true,body:'수신 거부해 주셔서 감사합니다!\n감사의 뜻으로 광고 메일을 더 보내 드립니다 ^^\n\n(이런 메일은 스팸 신고를 누르세요.)'});X.save();rerender()},900);view.id=null;rerender()}
 function reply(x){if(x.phish){X.ui&&X.ui.dialog&&X.ui.dialog({title:'잠깐만요!',icon:'warn',text:'운영자는 절대로 메일로 비밀번호를 묻지 않아요.\n이 메일은 계정을 훔치려는 사기 메일이에요!\n\n스팸편지함으로 옮길게요.'});const m=S();m.spam[x.id]=1;X.save();view.id=null;rerender();return}
  if(x.ad){toast('메일','광고 메일에는 답장하지 않는 게 좋아요.');return}
  view.compose={to:x.addr,subj:'Re: '+x.subj,body:'\n\n-----원래 메일-----\n'+x.body.slice(0,120),forward:false};view.id=null;rerender()}
 function forward(x){view.compose={to:'',subj:'Fw: '+x.subj,body:x.body,luck:!!x.luck};view.id=null;rerender()}
 function compose(main){const c=view.compose,f=E('form','ml-compose'),to=E('input'),pick=E('select'),subj=E('input'),body=E('textarea');
  to.value=c.to||'';to.maxLength=60;to.placeholder='받는 사람 메일 주소';to.setAttribute('aria-label','받는 사람');subj.value=c.subj||'';subj.maxLength=60;subj.placeholder='제목';subj.setAttribute('aria-label','제목');body.value=c.body||'';body.maxLength=800;body.setAttribute('aria-label','내용');
  const o0=E('option','','주소록에서 고르기');o0.value='';pick.append(o0);for(const [id,name,addr] of CONTACTS){const o=E('option','',name+' <'+addr+'>');o.value=addr;pick.append(o)}pick.setAttribute('aria-label','주소록');pick.addEventListener('change',()=>{if(pick.value)to.value=pick.value});
  const sb=B('보내기',()=>{},'ml-btn strong');sb.type='submit';const cancel=B('취소',()=>{view.compose=null;rerender()},'ml-btn');
  const row=(l,n)=>{const p=E('label','ml-field');p.append(E('b','',l),n);return p};
  f.append(E('h3','ml-h',c.luck?'행운의 편지 전달하기 (일곱 명?!)':'메일 쓰기'),row('받는 사람',to),row('주소록',pick),row('제목',subj),body,sb,cancel);
  if(c.luck)f.append(B('주소록 일곱 명에게 한꺼번에 보내기',()=>sendLuck(subj.value,body.value),'ml-btn'));
  f.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();send(String(to.value||'').trim(),String(subj.value||'').trim()||'(제목 없음)',String(body.value||'').trim())});main.append(f)}
 function send(addr,subj,body){const m=S();if(!addr){toast('메일','받는 사람 주소를 적어 주세요.');return false}
  const ct=CONTACTS.find(x=>x[2]===addr.toLowerCase());const id='s'+(m.sent.length+1)+'-'+Date.now().toString(36);m.sent.push({id,to:addr,toName:ct?ct[1]:addr,subj:subj.slice(0,60),body:body.slice(0,800),at:'05/30 16:32'});m.sent=m.sent.slice(-20);X.save();view.compose=null;view.box='sent';view.id=null;toast('메일','메일을 보냈어요.');rerender();
  const arrive=x=>{m.got.push(x);m.got=m.got.slice(-20);X.save();toast('새 메일','새 메일이 도착했습니다: '+x.subj);rerender()};
  const known=!ct&&!/byeoljigi@/.test(addr)&&all().find(x=>x.addr===addr.toLowerCase()&&!x.ad&&!x.phish&&!x.wrong&&!/mailer-daemon/.test(x.addr));
  if(known){later(()=>arrive({id:'g-auto-'+m.got.length+'-'+id,from:known.from,addr:known.addr,at:'05/30 16:32',subj:'[자동 응답] '+subj.slice(0,40),size:'1KB',body:'메일 잘 받았습니다.\n확인한 뒤 답장드리겠습니다. 감사합니다 ^^\n\n- '+known.from+' (자동 응답)'}),2000);return true}
  if(ct&&ct[0]==='sora'){toast('메일','바다소라님은 지금 컴퓨터 앞에 없는 것 같아요. 답장은 나중에 오려나?');return true}
  if(!ct||/byeoljigi@/.test(addr)){later(()=>arrive({id:'g-bounce-'+m.got.length+'-'+id,from:'메일 관리자',addr:'mailer-daemon@dongne-mail.net',at:'05/30 16:32',subj:'[반송] 메일을 보내지 못했습니다',size:'2KB',body:'보내신 메일이 아래 주소에 전달되지 못했습니다.\n\n받는 사람: '+addr+'\n이유: '+(/byeoljigi@/.test(addr)?'받는 사람의 메일함이 가득 찼습니다. (아주 오랫동안 비우지 않은 메일함이에요)':'존재하지 않는 주소입니다.')+'\n\n주소를 다시 확인해 주세요.\n\n- 메일 관리자'}),1600);return true}
  const pool=REPLY[ct[0]]||['메일 잘 받았어요 ^^'];later(()=>arrive({id:'g-'+ct[0]+'-'+m.got.length+'-'+id,from:ct[1],addr:ct[2],at:'05/30 16:32',subj:'Re: '+subj.slice(0,50),size:'1KB',body:pool[(subj.length+body.length)%pool.length]}),2400);return true}
 function sendLuck(subj,body){const m=S();const targets=CONTACTS.filter(x=>x[0]!=='sora').slice(0,7);for(const [id,name,addr] of targets)m.sent.push({id:'s-luck-'+id+'-'+m.sent.length,to:addr,toName:name,subj:subj||'Fw: 행운의 편지',body:String(body||'').slice(0,800),at:'05/30 16:32'});m.sent=m.sent.slice(-20);m.fwd++;X.save();view.compose=null;view.box='sent';rerender();toast('행운의 편지','일곱 명에게 보냈다! 이제 행운이... 오려나?');
  later(()=>{m.got.push({id:'g-luck-'+m.got.length,from:'민호',addr:'kart_minho@dongne-mail.net',at:'05/30 16:32',subj:'Re: 행운의 편지',size:'1KB',body:'야 ㅡㅡ 이런 거 보내지 마라 ㅋㅋㅋ\n나도 일곱 명한테 보내야 되잖아'});m.got.push({id:'g-luck2-'+m.got.length,from:'엄마',addr:'mom@dongne-mail.net',at:'05/30 16:32',subj:'Re: 행운의 편지',size:'1KB',body:'이런 건 안 믿어도 된다.\n대신 숙제는 믿고 해라 ^^ - 엄마'});X.save();toast('새 메일','답장이 두 통 왔어요.');rerender()},2200)}
 return{ids:[],has:()=>false,render,unread,send,state:()=>({...S(),view:{...view}}),reset(){view.box='inbox';view.id=null;view.compose=null},destroy(){alive=false;for(const t of timers)w.clearTimeout(t);timers.clear()}}}
w.PCMail={attach,INBOX,CONTACTS,version:'A95'};
})(window);
