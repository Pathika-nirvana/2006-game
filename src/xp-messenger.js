/* A90: 메신저. A92: 이름을 버디버디로 바꾸고 사용자가 준 아이콘(assets/pc-desktop/icons/buddy.webp)을 쓴다. 2006년 메신저 분위기를 낸 가짜 친구 목록과 대화창.
   모든 친구는 이 게임용으로 지어낸 인물이고 답장은 정해 둔 말 중에서 고른다. 실제 사람과 연결되지 않는다. */
(function(w){'use strict';
const STATUS=[['online','온라인'],['away','자리 비움'],['busy','다른 용무 중'],['hidden','오프라인 표시']];
const BUDDIES=[
 {id:'sonagi',nick:'하늘색소나기',group:'친구',msg:'오늘 날씨 완전 좋다 ㅎㅎ',loginAt:0,
  greet:['어 왔네? ㅎㅎ 방가방가~','ㅎㅇㅎㅇ 오랜만이다 ^^','헉 접속했네 ㅋㅋ 뭐해?'],
  rules:[[/pc방|피씨방|여기/i,['나도 지금 PC방인데 ㅋㅋ 옆자리 아저씨 컵라면 냄새 장난 아님','PC방 오면 시간 가는 줄 몰라 ㅠㅠ 벌써 한 시간 지났어']],
   [/게임|서든|카트|스타|메이플|던파|바람|오디션|프리|겟앰|ㄱㄱ/,['요즘 카트라이더 하는데 드리프트가 안 돼 ㅠㅠ 알려줄 사람?','나는 메이플 하는데 레벨업이 너무 힘들다 ㅋㅋ']],
   [/숙제|시험|공부|학원/,['숙제는 내일 아침에 하는 거야 ㅋㅋ','시험 얘기하지 마 ㅠㅠ 갑자기 우울해짐']],
   [/배고|라면|밥|먹|콜라/,['편의점 가서 컵라면 하나 먹고 올까 ㅋㅋ','삼각김밥에 콜라가 진리지 ㅎㅎ']],
   [/사진|미니홈피|방명록|싸이/,['미니홈피 배경음악 바꿨어 한번 놀러와 ㅎㅎ','사진첩에 사진 올렸으니까 방명록 남기고 가~']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['ㅂㅂ~ 내일 또 접속해 ^^','응 잘가 ㅎㅎ 조심히 가~']],
   [/ㅋㅋ|ㅎㅎ/,['ㅋㅋㅋㅋㅋ 웃기냐 ㅋㅋ','ㅎㅎㅎ 나도 웃겨 ㅋㅋ']]],
  generic:['ㅇㅇ 맞아 ㅋㅋ','그렇구나 ㅎㅎ','헐 진짜?','음.. 잘 모르겠다 ㅠㅠ','ㅋㅋ 그래서?','아 그래? 몰랐네']},
 {id:'byeol',nick:'★별빛요정★',group:'친구',msg:'♪ 노래 듣는 중~',loginAt:150,
  greet:['어머 안녕 ㅎㅎ 반가워~','ㅎㅇ~ 나 지금 막 들어왔어 ^^'],
  rules:[[/노래|음악|가수|벨소리|컬러링/,['요즘 벨소리 새로 받았는데 진짜 좋아 ㅎㅎ 컬러링도 바꿨어','음악 들으면서 미니홈피 꾸미면 시간 잘 가 ^^']],
   [/사진|미니홈피|방명록|꾸미/,['배경 바꾸고 있는데 어떤 색이 예쁠까? 파란색? 분홍색?','방명록에 글 남겨 줘~ 답글 달아줄게 ㅎㅎ']],
   [/숙제|시험|공부/,['나 어제 밤새워서 졸려 ㅠㅠ','공부하다가 메신저 켜면 안 되는데 ㅋㅋ']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['응~ 잘가 ㅎㅎ 내일 보자','ㅂㅂ~ 안녕~']]],
  generic:['ㅎㅎ 그래그래~','오오 신기하다 ㅎㅎ','ㅠㅠ 나도 그래','진짜? 대박 ㅋㅋ','음~ 그렇구나','ㅋㅋ 너 웃긴다']},
 {id:'minsu',nick:'☆지존민수☆',group:'친구',msg:'서든 한판 ㄱㄱ',loginAt:0,
  greet:['오 왔냐 ㅋㅋ 한판 ㄱㄱ?','ㅎㅇ 지금 방 만들까?'],
  rules:[[/게임|서든|카트|스타|메이플|던파|바람|오디션|프리|겟앰|ㄱㄱ|한판/,['ㄱㄱ 지금 방 만들게 ㅋㅋ','나 오늘 컨디션 최고야 ㅋㅋ 다 이긴다','스타는 저그가 최고지 ㅋㅋ 아니면 말고']],
   [/숙제|시험|공부/,['숙제? 그게 뭐야 먹는 거야? ㅋㅋ','시험은 시험일 뿐이야 일단 게임부터 하자']],
   [/컴퓨터|느려|렉|핑/,['여기 PC방 컴퓨터 좀 느리지 않냐? 핑이 높아','렉 걸리면 작업 관리자 켜서 봐봐 이상한 거 돌고 있을 수도 있어']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['ㅇㅋ ㅂㅂ 내일은 같이 하자','가냐? 알았다 ㅋㅋ']]],
  generic:['ㅇㅇ','ㅋㅋㅋ 인정','근데 그거보다 게임 안 할래?','ㄴㄴ 그건 아니지 ㅋㅋ','ㅇㅋㅇㅋ']},
 {id:'bando',nick:'우리반반장',group:'학교',msg:'내일 수행평가 있음 ㅠ',loginAt:400,
  greet:['안녕~ 내일 수행평가 준비했어?','어 접속했네. 숙제 한 거 확인했지?'],
  rules:[[/숙제|시험|수행|공부|학원/,['내일 수행평가는 모둠별로 발표래. 자료 모아 와야 해','숙제 범위는 교과서 62쪽부터 65쪽까지야. 잊지 마!']],
   [/게임|pc방|피씨방/i,['너 또 PC방이야? 그러다 시험 망한다 ㅋㅋ','게임은 숙제 끝내고 해야지~']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['응 안녕~ 내일 학교에서 봐','잘가! 숙제 꼭 해!']]],
  generic:['그래? 알겠어.','응응 맞아.','음 그건 선생님께 여쭤보자','ㅎㅎ 그렇구나']},
 {id:'zzak',nick:'짝꿍',group:'학교',msg:'자리 바꿨다 ㅎㅎ',loginAt:700,
  greet:['야 너 접속했네 ㅋㅋ','어? 너 지금 어디야?'],
  rules:[[/자리|짝|반|학교/,['이번에 자리 바꿨는데 앞자리라서 졸지도 못해 ㅠㅠ','우리 반 급식 오늘 맛있었어 ㅎㅎ']],
   [/ㅋㅋ|ㅎㅎ/,['ㅋㅋㅋ 너도 웃냐','ㅎㅎ 나도 웃겨']]],
  generic:['ㅇㅇ ㅋㅋ','그럼그럼','야 그건 좀 아니지 ㅋㅋ','ㅎㅎ 몰라 ㅋㅋ']},
 {id:'jeongmo',nick:'정모지기',group:'동호회',msg:'이번 주 토요일 정모 공지 확인!',loginAt:0,
  greet:['어서 오세요~ 정모 공지는 보셨나요? ^^','안녕하세요! 동네 카페 정모지기예요'],
  rules:[[/정모|카페|공지|모임|동호회/,['이번 주 토요일 오후 3시에 동네 놀이터 앞에서 모여요. 자세한 건 카페 공지에 있어요','정모에 오시면 간식을 나눠 드려요 ㅎㅎ 부담 없이 오세요']],
   [/가입|회원|등업/,['카페 가입은 누구나 가능해요. 출석 도장도 꼭 찍어 주세요 ^^']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['네 안녕히 가세요~ 정모에서 봬요','조심히 가세요 ^^']]],
  generic:['네 맞아요 ^^','그렇군요 ㅎㅎ','카페 게시판에도 남겨 주세요~','좋은 의견이에요!']},
 {id:'arcade',nick:'오락실사장',group:'동호회',msg:'동전 바꿔줌',loginAt:null,greet:[],rules:[],generic:[]},
 {id:'dosa',nick:'컴퓨터도사',group:'동호회',msg:'컴퓨터 고장나면 물어보세요',loginAt:240,
  greet:['안녕하세요. 컴퓨터 때문에 불편한 건 없나요?','반갑습니다. 컴퓨터 질문은 언제든 환영이에요'],
  rules:[[/바이러스|백신|감염|악성/,['이상한 파일을 받았다면 열기 전에 백신으로 먼저 검사하세요. 바이러스 도우미를 켜 두는 게 좋아요','백신은 실시간 감시를 꺼 두면 소용이 없어요. 꼭 켜 두세요']],
   [/느려|렉|버벅|이상|멈춰|안 돼|안돼/,['컴퓨터가 느려지면 작업표시줄을 오른쪽 단추로 눌러서 작업 관리자를 열어 보세요. 모르는 프로세스가 돌고 있을 수 있어요','한꺼번에 프로그램을 너무 많이 켜면 느려져요. 안 쓰는 창은 닫아 주세요']],
   [/팝업|광고|툴바|엑티브|activex|액티브/i,['모르는 사이트가 설치를 권하면 일단 설치 안 함을 누르세요. 공짜라고 해서 다 좋은 건 아니에요','팝업이 너무 많이 뜨면 인터넷 창의 팝업 차단 단추를 켜 보세요']],
   [/자료실|부수|스트레스|깔|설치/,['재미있는 프로그램은 인터넷 자료실에서 받을 수 있어요. 링크천국에서 알짜배기 자료실을 찾아보세요','바탕화면 부수기 같은 스트레스 풀이 프로그램도 자료실에 올라와 있어요. 받은 뒤에 설치까지 해야 쓸 수 있어요']],
   [/공유|마당|다운|받/,['공유 프로그램에서 받은 파일 중에 exe 파일은 특히 조심하세요. 이름이 그럴듯해도 바이러스인 경우가 많아요','받기만 하고 올려 주지 않으면 다른 사람 속도가 안 나와요. 다 받았으면 한동안 켜 두는 게 매너랍니다']],
   [/바이|ㅂㅂ|잘가|이만|간다/,['네 안녕히 가세요. 컴퓨터 조심해서 쓰세요~']]],
  generic:['그건 컴퓨터를 껐다 켜 보면 해결되는 경우가 많아요','네 맞아요. 천천히 해 보세요','더 궁금한 게 있으면 말씀하세요 ^^']}
];
const EVENTS=[{at:90,type:'msg',id:'sonagi',text:'야 접속했네? 나 지금 PC방인데 같이 게임하자 ㅋㅋ'},{at:150,type:'login',id:'byeol'},{at:240,type:'login',id:'dosa'},{at:330,type:'msg',id:'dosa',text:'혹시 인터넷 창 위에 노란 줄이 뜨면 함부로 설치하지 마세요. 공짜 프로그램이라고 하면서 광고 막대를 붙이는 경우가 많아요'},{at:400,type:'login',id:'bando'},{at:600,type:'msg',id:'jeongmo',text:'이번 주 토요일 정모 있어요! 시간 되시면 카페 공지 확인해 주세요 ^^'},{at:700,type:'login',id:'zzak'}];
const EMO=['^^',';;','ㅠㅠ','ㅋㅋㅋ','-_-','♥'];
const pick=(list,n)=>list[n%list.length];
function replyFor(b,text,n){const t=String(text||'');for(const [re,list] of b.rules||[])if(re.test(t))return pick(list,n);return b.generic&&b.generic.length?pick(b.generic,n):''}
/* A96: 같은 방 친구와 진짜로 대화하기. 함께 걷기 방에 들어와 있으면 서버(server.js의 buddy 메시지)를 통해
   PC를 켠 친구끼리 1:1 대화와 흔들기를 주고받고, ‘우리 방 전체 대화’는 동네 채팅과 같은 통로를 쓴다.
   PC를 끈 상태에서 받은 말은 함께 걷기 채팅 기록에 한 줄 남기고, 다음에 버디버디를 열면 대화창에 들어간다. */
const NET={active:null,pending:[],subscribed:false,tries:0};
const net=()=>w.A25NET;
const netReady=()=>{const n=net();return !!(n&&n.state&&n.state.ready)};
function worldLog(m){try{const log=w.document&&w.document.getElementById&&w.document.getElementById('a25Log');if(!log)return;const row=w.document.createElement('div');row.className='a25-line chat';const b=w.document.createElement('strong');b.textContent='[버디버디] '+(m.nick||m.name||'친구');const sp=w.document.createElement('span');sp.textContent=m.op==='nudge'?'(창을 흔들었어요)':m.text;row.append(b,sp);log.append(row);log.scrollTop=log.scrollHeight}catch(_){}}
function ensureNet(){if(NET.subscribed)return true;const n=net();if(!n||typeof n.subscribe!=='function')return false;NET.subscribed=true;
 n.subscribe(m=>{if(!m||typeof m!=='object')return;if(NET.active){NET.active(m);return}if(m.type==='buddy'&&(m.op==='say'||m.op==='nudge')){NET.pending.push(m);if(NET.pending.length>40)NET.pending.shift();worldLog(m)}});return true}
(function waitNet(){if(ensureNet()||NET.tries++>40)return;if(typeof w.setTimeout==='function')w.setTimeout(waitNet,1500)})();
function attach(X){
 const {E,B,listen,save,saved}=X;const S=w.XPShell?w.XPShell.xs(X):(saved.xp=saved.xp||{});if(typeof S.nick!=='string')S.nick='';if(!STATUS.some(s=>s[0]===S.status))S.status='online';
 const toast=o=>X.ui&&X.ui.toast(o);const initial=X.remaining();const timers=[];let alive=true,boot=false,list=null,listWin=null;const done=new Set();
 const later=(fn,ms)=>{const t=w.setTimeout(()=>{if(alive)fn()},ms);timers.push(t);return t};
 const bd=BUDDIES.map(b=>({...b,online:b.loginAt===0,log:[],unread:0,n:0,nudges:0,typing:false}));const byId=id=>bd.find(b=>b.id===id);
 const ROOMID='net-room';let pcList=[],heart=null;
 const roomName=()=>{try{const el=netReady()&&w.document&&w.document.getElementById&&w.document.getElementById('a25Name');return el&&el.value?String(el.value).trim().slice(0,14):''}catch(_){return ''}};
 const myNick=()=>S.nick||roomName()||'동네 친구';
 const hidden=()=>S.status==='hidden';
 const chatId=id=>'chat-'+id;
 /* ---- 대화 ---- */
 const line=(b,who,text,cls)=>{const rec={who,text,cls:cls||''};b.log.push(rec);if(b.log.length>80)b.log.shift();const win=X.windows.get(chatId(b.id));if(win&&win.logBox)addLine(win.logBox,rec)};
 function addLine(box,rec){const p=E('p',rec.cls||(rec.who==='me'?'me':'them'));if(rec.cls==='sys')p.textContent=rec.text;else{p.append(E('b','',rec.who==='me'?myNick():rec.who),E('span','',' : '+rec.text))}box.append(p);if(box.scrollTop!==undefined)box.scrollTop=box.scrollHeight}
 function openChat(id){const b=byId(id);if(!b)return null;const had=X.windows.get(chatId(id));const win=X.windowFor(chatId(id),b.nick+' 님과의 대화');if(had&&win.logBox){b.unread=0;renderList();return win}
  win.node.classList.add('xp-small');win.node.style.width='min(350px,96%)';win.node.style.height='min(410px,92%)';win.node.style.left=(34+bd.indexOf(b)%4*4)+'%';win.node.style.top=(8+bd.indexOf(b)%4*3)+'%';win.content.replaceChildren();
  const wrap=E('div','xp-chat'),logBox=E('div','xp-chat-log');logBox.setAttribute('role','log');logBox.setAttribute('aria-live','polite');win.logBox=logBox;
  const bar=E('div','xp-chat-bar');bar.append(B('흔들기',()=>nudge(b),'xp-mini'));for(const e of EMO)bar.append(B(e,()=>{input.value=(input.value+e).slice(0,100);input.focus&&input.focus()},'xp-mini emo'));
  const form=E('form','xp-chat-form'),input=E('input','xp-chat-input');input.type='text';input.maxLength=100;input.autocomplete='off';input.setAttribute('aria-label',b.nick+' 님에게 보낼 말');form.append(input,B('전송',()=>{},'xp-dialog-btn'));form.lastElementChild.type='submit';
  form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const t=input.value.trim();if(!t)return;input.value='';send(b,t)});
  wrap.append(E('p','xp-chat-head',b.nick+(b.online?'':' (오프라인)')+'  '+b.msg),logBox,bar,form);win.content.append(wrap);
  if(!b.log.length)line(b,'',b.real?(b.id===ROOMID?(b.online?'우리 방 전체 대화예요. 여기 쓴 말은 동네 채팅으로 방 사람 모두에게 보이고, 내 캐릭터 머리 위에도 말풍선이 떠요.':'함께 걷기 방에 들어가면 쓸 수 있어요.'):(b.online?'같은 방 친구 '+b.nick+' 님과 대화를 시작했습니다. (진짜 친구예요)':'상대가 방에 없어요.')):b.online?'대화를 시작했습니다. ('+X.clockEl.textContent+')':'상대방이 오프라인입니다. 남긴 말은 다음 접속 때 전달됩니다.','sys');else for(const r of b.log)addLine(logBox,r);
  b.unread=0;renderList();input.focus&&input.focus();return win}
 function send(b,text){if(b.real)return netSay(b,text);line(b,'me',text);if(!b.online||!b.generic.length)return;respond(b,text)}
 /* ---- 같은 방 친구 (A96) ---- */
 function realBuddy(peerId,name,nick){const id=peerId===ROOMID?ROOMID:'net-'+peerId;let b=byId(id);if(!b){b={id,peer:peerId,nick:nick||name,name,group:'같은 방 친구',msg:'',online:true,real:true,log:[],unread:0,n:0,nudges:0,typing:false,generic:[],greet:[],rules:[]};bd.unshift(b)}else{if(nick)b.nick=nick;if(name)b.name=name}return b}
 function syncPeers(){const n=net();const ready=netReady();const peers=ready&&n.peers?n.peers:[];const pcs=new Map(pcList.map(x=>[x.id,x]));const myId=ready?n.state.id:null;
  const room=byId(ROOMID)||realBuddy(ROOMID,'우리 방 전체 대화','우리 방 전체 대화');room.online=ready;room.msg=ready?'방 사람 모두가 보는 동네 채팅 ('+(peers.length+1)+'명)':'함께 걷기 방에 들어가면 열려요';
  const seen=new Set([ROOMID]);for(const p of peers){if(p.id===myId)continue;const pc=pcs.get(p.id);const b=realBuddy(p.id,p.name,pc?pc.nick:p.name);b.online=true;b.pc=!!pc;b.msg=pc?'PC방 컴퓨터로 버디버디 접속 중':'동네에 있음 (버디버디 꺼짐, 보내면 동네 채팅 기록에 떠요)';seen.add(b.id)}
  for(const p of pcList){if(p.id===myId||seen.has('net-'+p.id))continue;const b=realBuddy(p.id,p.name,p.nick);b.online=true;b.pc=true;b.msg='PC방 컴퓨터로 버디버디 접속 중';seen.add(b.id)}
  for(const b of bd)if(b.real&&!seen.has(b.id)){b.online=false;b.pc=false;b.msg='방에서 나감'}
  renderList()}
 function netSay(b,text){if(!netReady()){line(b,'','함께 걷기 방에 들어가 있지 않아서 보낼 수 없어요.','sys');return false}
  if(b.id===ROOMID){net().send({type:'chat',text:String(text).slice(0,80)});return true}
  if(!b.online){line(b,'',b.nick+' 님이 방에 없어서 보낼 수 없어요.','sys');return false}
  net().send({type:'buddy',op:'say',to:b.peer,text:String(text).slice(0,100)});return true}
 function heartbeat(){if(!alive)return;if(!netReady())return;const n=net();if(hidden())n.send({type:'buddy',op:'off'});else n.send({type:'buddy',op:'on',nick:S.nick||''})}
 function fromNet(m){if(!alive)return;
  if(m.type==='welcome'){later(()=>{heartbeat();syncPeers()},300);return}
  if(m.type==='network_close'){pcList=[];syncPeers();return}
  if(m.type==='state'||m.type==='joined'||m.type==='left'){if(m.type!=='state'||!byId('net-'+m.id))syncPeers();return}
  if(m.type==='chat'){const room=byId(ROOMID)||realBuddy(ROOMID,'우리 방 전체 대화','우리 방 전체 대화');const mine=netReady()&&m.id===net().state.id;line(room,mine?'me':String(m.name||'친구'),String(m.text||''));if(!mine&&!X.windows.get(chatId(ROOMID))){room.unread++;renderList()}return}
  if(m.type!=='buddy')return;
  if(m.op==='who'){pcList=Array.isArray(m.list)?m.list.filter(x=>x&&typeof x.id==='string'):[];syncPeers();return}
  if(m.op==='error'){const b=m.to?byId('net-'+m.to):null;toast({title:'버디버디',text:String(m.message||'보내지 못했어요.'),icon:'warn',ms:4000});if(b)line(b,'',String(m.message||'보내지 못했어요.'),'sys');return}
  if(m.op==='sent'){const b=realBuddy(m.to,'',null);line(b,'me',String(m.text||''));if(!m.toPc)line(b,'','(상대가 PC를 켜고 있지 않아서 동네 채팅 기록에 떠요)','sys');return}
  if(m.op==='nudged'){const b=realBuddy(m.to,'',null);line(b,'','내가 창을 흔들었습니다.','sys');const win=X.windows.get(chatId(b.id));if(win)shake(win);return}
  if(m.op==='say'||m.op==='nudge'){const b=realBuddy(m.from,m.name,m.nick);b.online=true;if(m.op==='say')line(b,b.nick,String(m.text||''));else line(b,'',b.nick+' 님이 창을 흔들었습니다.','sys');
   const win=X.windows.get(chatId(b.id));if(win){if(m.op==='nudge')shake(win)}else{b.unread++;toast({title:b.nick+' (같은 방 친구)',text:m.op==='nudge'?'창을 흔들었습니다!':String(m.text||'').slice(0,46),icon:'msg',ms:9000,onClick:()=>{const x=openChat(b.id);if(x&&m.op==='nudge')shake(x)}})}renderList()}}
 NET.active=fromNet;ensureNet();
 for(const m of NET.pending.splice(0))fromNet(m);
 function respond(b,text){if(b.typing)return;b.typing=true;const win=X.windows.get(chatId(b.id));let tip=null;const hello=/안녕|하이|방가|ㅎㅇ|반갑|^hi$/i.test(text);const delay=900+((b.n*353)%1100);
  if(win&&win.logBox){tip=E('p','sys typing',b.nick+' 님이 입력 중입니다...');win.logBox.append(tip)}
  later(()=>{b.typing=false;if(tip)tip.remove();const r=hello&&!b.said?pick(b.greet,b.n):replyFor(b,text,b.n);b.said=true;b.n++;line(b,b.nick,r);if(!X.windows.get(chatId(b.id))){b.unread++;toast({title:b.nick,text:r,icon:'msg',onClick:()=>openChat(b.id)});renderList()}},delay)}
 function nudge(b){if(b.real){if(b.id===ROOMID){toast({title:'버디버디',text:'전체 대화에서는 흔들 수 없어요.',icon:'info',ms:3000});return}if(netReady()&&b.online)net().send({type:'buddy',op:'nudge',to:b.peer});else line(b,'','상대가 방에 없어요.','sys');return}const win=X.windows.get(chatId(b.id));if(!win)return;line(b,'','내가 창을 흔들었습니다.','sys');shake(win);b.nudges++;if(b.online&&b.generic.length)later(()=>{line(b,b.nick,b.nudges%3===0?'앗 깜짝이야 ㅋㅋ 나도 흔들어 줄게!':'ㅋㅋ 왜 흔들어 ㅎㅎ');if(b.nudges%3===0){line(b,'',b.nick+' 님이 창을 흔들었습니다.','sys');const x=X.windows.get(chatId(b.id));if(x)shake(x)}},1000)}
 function shake(win){win.node.classList.remove('xp-shake');void(win.node.offsetWidth);win.node.classList.add('xp-shake');later(()=>win.node.classList.remove('xp-shake'),700)}
 /* ---- 친구 목록 ---- */
 const collapsed=new Set();
 function renderList(){if(!list||X.windows.get('messenger')!==listWin)return;list.replaceChildren();const groups=['같은 방 친구','친구','학교','동호회'];
  for(const g of groups){const members=bd.filter(b=>b.group===g).sort((a,b)=>(b.online-a.online)),on=members.filter(b=>b.online).length;const head=B((collapsed.has(g)?'▶ ':'▼ ')+g+' ('+on+'/'+members.length+')',()=>{collapsed.has(g)?collapsed.delete(g):collapsed.add(g);renderList()},'xp-msn-group');list.append(head);
   if(!collapsed.has(g))for(const b of members){const row=B('',()=>openChat(b.id),'xp-msn-buddy'+(b.online?'':' off')+(b.real?' real':''));row.dataset&&(row.dataset.buddy=b.id);row.append(E('i','dot '+(b.online?(b.id==='bando'||(b.real&&b.id!==ROOMID&&!b.pc)?'busy':'on'):'off')),E('span','nick',b.nick+(b.real&&b.name&&b.name!==b.nick&&b.id!==ROOMID?' ('+b.name+')':'')+(b.unread?' ('+b.unread+')':'')),E('small','msg',b.online||b.real?b.msg:'오프라인'));list.append(row)}
   if(g==='같은 방 친구'&&!collapsed.has(g)&&!netReady())list.append(E('p','xp-msn-hint','동네에서 ‘함께 걷기’ 방에 들어가면, 같은 방 친구와 여기서 진짜로 대화할 수 있어요.'))}
  if(me.nick)me.nick.textContent=myNick();if(me.stat)me.stat.textContent='상태: '+STATUS.find(s=>s[0]===S.status)[1]}
 const me={nick:null,stat:null};
 function renameMe(){if(!X.ui)return;const box=E('div'),input=E('input','xp-rename');input.type='text';input.maxLength=20;input.value=myNick();input.setAttribute('aria-label','내 대화명');box.append(E('p','','내 대화명을 입력하세요. 친구들에게 보입니다.'),input);
  const ok=()=>{const v=input.value.replace(/[<>]/g,'').trim().slice(0,20);if(!v)return;S.nick=v;save();renderList();heartbeat()};const dlg=X.ui.dialog({title:'대화명 변경',node:box,icon:'info',buttons:[['확인',ok],['취소']]});input.addEventListener('keydown',e=>{if(e.stopPropagation)e.stopPropagation();if(e.key==='Enter'){ok();dlg.close()}});input.focus&&input.focus()}
 function cycleStatus(){const i=STATUS.findIndex(s=>s[0]===S.status);S.status=STATUS[(i+1)%STATUS.length][0];save();renderList();heartbeat();if(S.status==='hidden')toast({title:'버디버디',text:'오프라인으로 표시됩니다. 친구들의 먼저 오는 말이 오지 않습니다.',icon:'info',ms:4500})}
 function buddyIco(cls){const im=E('img',cls);im.src='assets/pc-desktop/icons/buddy.webp?v=A92';im.alt='';im.draggable=false;return im}
 function openList(){const had=X.windows.get('messenger');const win=X.windowFor('messenger','버디버디');if(had&&listWin===win&&list)return win;listWin=win;win.node.classList.add('xp-small');win.node.style.width='min(300px,96%)';win.node.style.height='min(520px,94%)';win.node.style.left='58%';win.node.style.top='10%';win.content.replaceChildren();
  const wrap=E('div','xp-msn'),head=E('div','xp-msn-me');me.nick=E('b','',myNick());me.stat=B('상태: '+STATUS.find(s=>s[0]===S.status)[1],cycleStatus,'xp-mini');head.append(buddyIco('xp-buddy-ico'),E('i','dot on'),me.nick,B('대화명 변경',renameMe,'xp-mini'),me.stat);list=E('div','xp-msn-list');
  const load=E('div','xp-msn-load');load.append(buddyIco('xp-buddy-big'),E('p','','버디버디에 로그인하는 중...'),E('span','xp-bar'));wrap.append(head,load,list,E('p','xp-note','‘같은 방 친구’는 함께 걷기 방에 같이 들어온 진짜 친구예요. 나머지 친구들은 이 게임 안의 가상 인물입니다. 이름을 누르면 대화창이 열립니다.'));win.content.append(wrap);
  if(boot){load.remove();renderList()}else{list.hidden=true;later(()=>{load.remove();list.hidden=false;boot=true;renderList();const on=bd.filter(b=>b.online).length;toast({title:'버디버디',text:'로그인했습니다. 친구 '+on+'명이 접속 중입니다.',icon:'msg',ms:5000,onClick:()=>X.openApp('messenger')})},1200)}return win}
 /* ---- 시간이 흐르며 일어나는 일 ---- */
 function tick(rem){if(hidden())return;const el=initial-rem;for(const ev of EVENTS){const key=ev.at+ev.type+ev.id;if(done.has(key)||el<ev.at)continue;done.add(key);const b=byId(ev.id);if(!b)continue;
  if(ev.type==='login'){b.online=true;toast({title:'버디버디',text:b.nick+' 님이 접속했습니다.',icon:'msg',ms:6000,onClick:()=>openChat(b.id)});renderList()}
  else{if(!b.online){b.online=true}b.said=true;line(b,b.nick,ev.text);const open=X.windows.get(chatId(b.id));if(!open){b.unread++;toast({title:b.nick,text:ev.text.length>46?ev.text.slice(0,46)+'...':ev.text,icon:'msg',ms:9000,onClick:()=>openChat(b.id)})}renderList()}}}
 const api={ids:['messenger'],has:id=>id==='messenger',open:()=>openList(),openChat,tick,
  reset(){boot=false;list=null;listWin=null;for(const b of bd){b.log=[];b.unread=0;b.typing=false;b.online=b.loginAt===0;b.said=false;b.nudges=0}done.clear();syncPeers()},
  destroy(){if(netReady())try{net().send({type:'buddy',op:'off'})}catch(_){}if(heart&&w.clearInterval)w.clearInterval(heart);heart=null;if(NET.active===fromNet)NET.active=null;alive=false;for(const t of timers)w.clearTimeout(t)},
  net:{sync:syncPeers,receive:fromNet,beat:heartbeat},
  send:(id,text)=>{const b=byId(id);if(b)send(b,text)},nudge:id=>{const b=byId(id);if(b)nudge(b)},
  state:()=>({buddies:bd.map(b=>({id:b.id,online:b.online,unread:b.unread,log:b.log.length,real:!!b.real,pc:!!b.pc})),status:S.status,nick:myNick(),done:done.size})};
 heartbeat();syncPeers();if(typeof w.setInterval==='function')heart=w.setInterval(()=>{if(alive)heartbeat()},20000);
 return api}
w.XPMessenger={attach,BUDDIES,EVENTS,STATUS,EMO,replyFor,pick};
})(window);
