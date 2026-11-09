/* A95: 직접 해 볼 수 있는 사이트 네 곳. web-sites.js 다음에 읽혀 WebSites.register()로 붙는다.
   뽀글뽀글 펫 키우기(사이버 펫: 밥, 놀이, 목욕, 잠, 알에서 어른까지), 두근두근 경매(진짜 시간으로 흐르는 경매, 막판 입찰, 낙찰과 배송),
   말놀이 천국(끝말잇기 봇, 삼행시, OX 퀴즈 서바이벌), 뽀샤시 사진관(내 그림을 뽀샤시하게 꾸며 내 그림으로 저장).
   사람, 가게, 주소, 상품은 모두 지어낸 것이다. 글쓴 날짜와 시각은 2006년 5월 30일 오후 4시 32분 이전이다. */
(function(w){'use strict';
const WS=w.WebSites;if(!WS||!WS.register)return;
const K=WS.kit;
const won=n=>Number(n).toLocaleString('ko-KR');
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const obj=(k,key)=>{if(!k[key]||typeof k[key]!=='object'||Array.isArray(k[key]))k[key]={};return k[key]};
const toast=(env,title,text)=>{const X=env.ctx.X;if(X&&X.ui&&X.ui.toast)X.ui.toast({title,text,icon:'info',ms:4200})};
function cv(env,cls,W,H){const c=env.E('canvas',cls);c.width=W;c.height=H;const g=c.getContext?c.getContext('2d'):null;return [c,g]}
function circ(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(x,y,Math.max(.5,r),0,Math.PI*2);g.fill()}
function rect(g,x,y,w0,h0,c){g.fillStyle=c;g.fillRect(x,y,w0,h0)}
function txt(g,s,x,y,c,size,al){g.fillStyle=c;g.font='bold '+(size||12)+'px Dotum,Gulim,sans-serif';g.textAlign=al||'center';g.fillText(String(s),x,y)}

/* ============ 1. 뽀글뽀글 펫 키우기 ============ */
const PET_KINDS={dog:['강아지','멍멍','#e8c48a'],cat:['고양이','야옹','#f2b46a'],ham:['햄스터','찍찍','#f4d8a8'],chick:['병아리','삐약','#ffe04a']};
const PET_STAGE=[[0,'알'],[1,'아기'],[15,'어린이'],[40,'어른']];
const PET_SHOP=[['ribbon','분홍 리본',3],['hat','밀짚모자',5],['glasses','동그란 안경',4],['crown','반짝 왕관',12],['scarf','빨간 목도리',4]];
const PET_BOARD=[
 ['우리 콩이 드디어 어른 됐어요!!','콩이엄마','05.30 15:40','밥 주고 씻기고 놀아 주기를 매일 했더니 어른이 됐어요 ㅠㅠ 감동... 왕관도 사 줬어요 ^^',['축하해요~ 우리 애는 아직 어린이 ㅠㅠ','왕관 비싼데 부럽다']],
 ['학교 갔다 오니까 펫이 삐져 있어요 ㅠㅠ','초코우유','05.30 14:05','배고픔이 0이 돼서 삐졌어요... 밥 줬더니 다시 웃어요. 아침에 밥 주고 가세요 여러분!!',['저도 그랬어요 ㅋㅋ','학교에서 몰래 PC방 가서 밥 줌 ㅋㅋ']],
 ['햄스터 vs 병아리 뭐가 더 귀여워요?','고민중','05.29 21:30','둘 다 키우고 싶은데 한 마리만 돼요 ㅠㅠ 추천해 주세요',['햄스터 찍찍 소리 귀여움','병아리 삐약 짱']],
 ['목욕시키면 싫어해요 ㅋㅋ','뽀글뽀글','05.28 19:10','씻기면 행복이 조금 줄어요 ㅋㅋㅋ 진짜 동물 같음',['ㅋㅋㅋ 우리 강아지도']]
];
function petState(k){const p=obj(k,'pet');const now=Date.now();
 for(const n of ['care','points','hug','warm'])if(!Number.isFinite(p[n])||p[n]<0)p[n]=0;for(const n of ['hunger','happy','clean','energy'])if(!Number.isFinite(p[n]))p[n]=80;
 if(!Array.isArray(p.items))p.items=[];p.items=p.items.filter(x=>PET_SHOP.some(s=>s[0]===x));if(typeof p.wear!=='string')p.wear='';
 if(!Number.isFinite(p.last)||p.last>now)p.last=now;const mins=Math.min(480,(now-p.last)/60000);
 if(p.kind&&p.stage!=='egg'&&mins>0){const sl=!!p.sleep;p.hunger-=mins*4;p.happy-=mins*3;p.clean-=mins*2;p.energy+=sl?mins*8:-mins*2;for(const n of ['hunger','happy','clean','energy'])p[n]=clamp(p[n],0,100)}
 p.last=now;return p}
function petStage(p){if(!p.kind)return '';if(p.stage==='egg')return '알';let s='아기';for(const [n,t] of PET_STAGE)if(n>0&&p.care>=n)s=t;return s}
function drawPet(g,p,t){const W=300,H=200;const sky=g.createLinearGradient?g.createLinearGradient(0,0,0,H):null;if(sky){sky.addColorStop(0,p.sleep?'#1c2a5a':'#bfe6ff');sky.addColorStop(1,p.sleep?'#3a4a7a':'#f2fbff');g.fillStyle=sky}else g.fillStyle='#bfe6ff';g.fillRect(0,0,W,H);
 rect(g,0,150,W,50,p.sleep?'#3a4a3a':'#8fd16a');if(p.sleep)for(let i=0;i<14;i++)rect(g,(i*53)%W,(i*31)%120,2,2,'#fff8c8');
 const st=petStage(p),cx=150,cy=128;
 if(st==='알'){const wob=Math.sin(t*6)*(p.warm>0?.12:.04);if(g.save){g.save();g.translate(cx,cy+20);g.rotate(wob)}g.fillStyle='#fff8e8';g.beginPath();if(g.ellipse)g.ellipse(0,-30,26,34,0,0,7);else g.arc(0,-30,28,0,7);g.fill();for(let i=0;i<4;i++)circ(g,-12+i*8,-36+(i%2)*14,4,PET_KINDS[p.kind][2]);if(p.warm>=3){g.strokeStyle='#8a6a4a';g.lineWidth=2;g.beginPath();g.moveTo(-14,-40);g.lineTo(-6,-32);g.lineTo(2,-42);g.lineTo(10,-30);g.stroke()}if(g.restore)g.restore();txt(g,'알을 쓰다듬어 따뜻하게 해 주세요 ('+p.warm+'/5)',cx,24,'#335',12);return}
 const s=st==='아기'?.75:st==='어린이'?.95:1.15,col=PET_KINDS[p.kind][2],sad=p.hunger<20||p.happy<20||p.clean<20,bob=p.sleep?0:Math.sin(t*4)*3;
 if(g.save){g.save();g.translate(cx,cy+bob);g.scale(s,s)}
 circ(g,0,0,30,col);circ(g,0,-34,24,col);
 if(p.kind==='dog'){g.fillStyle='#a07040';g.beginPath();if(g.ellipse){g.ellipse(-22,-38,8,16,.4,0,7);g.fill();g.beginPath();g.ellipse(22,-38,8,16,-.4,0,7)}g.fill()}
 else if(p.kind==='cat'){g.fillStyle=col;g.beginPath();g.moveTo(-20,-46);g.lineTo(-22,-66);g.lineTo(-6,-54);g.fill();g.beginPath();g.moveTo(20,-46);g.lineTo(22,-66);g.lineTo(6,-54);g.fill()}
 else if(p.kind==='ham'){circ(g,-18,-54,8,'#e8b88a');circ(g,18,-54,8,'#e8b88a');circ(g,-16,-26,7,'#fff0d8');circ(g,16,-26,7,'#fff0d8')}
 else{g.fillStyle='#ff9a2a';g.beginPath();g.moveTo(-6,-30);g.lineTo(6,-30);g.lineTo(0,-22);g.fill();rect(g,-2,-60,4,8,col)}
 if(p.sleep){rect(g,-12,-38,8,2,'#333');rect(g,4,-38,8,2,'#333')}else if(sad){rect(g,-12,-40,8,2,'#333');rect(g,4,-40,8,2,'#333');circ(g,-12,-30,2,'#7ad0ff')}else{circ(g,-8,-38,3.2,'#222');circ(g,8,-38,3.2,'#222');circ(g,-7,-39,1,'#fff');circ(g,9,-39,1,'#fff')}
 if(p.kind!=='chick'){circ(g,0,-28,2.4,'#7a4a3a')}circ(g,-16,-28,3.5,'rgba(255,120,140,.4)');circ(g,16,-28,3.5,'rgba(255,120,140,.4)');rect(g,-14,24,8,8,col);rect(g,6,24,8,8,col);
 const wear=p.wear;if(wear==='ribbon'){circ(g,-10,-58,6,'#ff6aa8');circ(g,2,-58,6,'#ff6aa8');circ(g,-4,-58,3,'#ff3a88')}else if(wear==='hat'){rect(g,-26,-56,52,6,'#e8c86a');rect(g,-14,-70,28,15,'#e8c86a');rect(g,-14,-60,28,4,'#e84d4d')}else if(wear==='glasses'){g.strokeStyle='#333';g.lineWidth=2;g.beginPath();g.arc(-9,-38,7,0,7);g.stroke();g.beginPath();g.arc(9,-38,7,0,7);g.stroke()}else if(wear==='crown'){g.fillStyle='#ffd23f';g.beginPath();g.moveTo(-16,-54);g.lineTo(-16,-70);g.lineTo(-8,-60);g.lineTo(0,-72);g.lineTo(8,-60);g.lineTo(16,-70);g.lineTo(16,-54);g.fill()}else if(wear==='scarf'){rect(g,-22,-14,44,8,'#e84d4d');rect(g,10,-10,8,18,'#e84d4d')}
 if(g.restore)g.restore();if(p.sleep)txt(g,'Z z z',cx+44,cy-56,'#fff',16);if(p.clean<30&&!p.sleep)for(let i=0;i<3;i++)circ(g,cx-30+i*30,cy-70+Math.sin(t*3+i)*4,2,'#7a6a3a')}
function petPage(page,env){const {E,B,go,r,k,ctx}=env,p=petState(k);ctx.save();
 const head=E('header','pt-head');head.append(B('뽀글뽀글 펫 키우기',()=>go({type:'home'}),'pt-logo'),E('span','pt-sub','♡ 나만의 사이버 펫 ♡ 지금 펫 '+won(18240+K.hash(String(k.total))%300)+'마리가 자라는 중'));page.append(head);
 const nav=E('nav','pt-nav');for(const [type,label] of [['home','펫 소개'],['room','내 펫 방'],['shop','펫 꾸미기'],['board','펫 자랑']])nav.append(B(label,()=>go({type}),'pt-tab'+(r.type===type?' on':'')));page.append(nav);
 const body=E('main','pt-body');page.append(body);
 if(r.type==='home'||r.type==='adopt'){const intro=E('section','pt-box');intro.append(E('h3','','펫을 키워 보세요!'),E('p','','밥을 주고, 놀아 주고, 씻기고, 재워 주세요. 정성을 쏟을수록 알에서 아기, 어린이, 어른으로 자라요. 오래 돌보지 않으면 배고프고 심심해서 삐질 수 있어요.'));body.append(intro);
  if(p.kind){body.append(E('p','pt-note','이미 '+PET_KINDS[p.kind][0]+' ‘'+p.name+'’을(를) 키우고 있어요.'),B('내 펫 방으로 가기 ▶',()=>go({type:'room'}),'pt-btn big'));return}
  const box=E('section','pt-box');box.append(E('h3','','어떤 펫을 키울까요?'));const nm=K.field(E,'펫 이름 (6자)',6,'펫 이름');nm.value='뽀글이';box.append(nm);const row=E('div','pt-kinds');
  for(const [id,[name,sound,col]] of Object.entries(PET_KINDS)){const b=B('',()=>{p.kind=id;p.name=String(nm.value||'').trim().slice(0,6)||'뽀글이';p.stage='egg';p.warm=0;p.care=0;p.hunger=80;p.happy=80;p.clean=90;p.energy=90;p.sleep=false;p.last=Date.now();ctx.save();go({type:'room'})},'pt-kind');const [c,g]=cv(env,'pt-kcv',90,80);if(g)try{rect(g,0,0,90,80,'#f4fbff');circ(g,45,50,20,col);circ(g,45,26,16,col);circ(g,39,24,2.5,'#222');circ(g,51,24,2.5,'#222')}catch(_){}b.append(c,E('b','',name),E('small','',sound+'!'));row.append(b)}
  box.append(row);body.append(box);return}
 if(!p.kind){body.append(E('p','pt-note','아직 펫이 없어요. 먼저 펫을 골라 주세요.'),B('펫 고르러 가기',()=>go({type:'home'}),'pt-btn big'));return}
 if(r.type==='room'){const st=petStage(p);const box=E('section','pt-box pt-room');box.append(E('h3','',p.name+' · '+PET_KINDS[p.kind][0]+' · '+st+(p.sleep?' (쿨쿨 자는 중)':'')));
  const [c,g]=cv(env,'pt-canvas',300,200);box.append(c);const say=E('p','pt-say','');box.append(say);
  const msg=()=>p.sleep?'쿨쿨... (자는 중이에요)':st==='알'?'(알이 꿈틀꿈틀...)':p.hunger<20?'배고파요 ㅠㅠ '+PET_KINDS[p.kind][1]:p.clean<20?'몸이 근질근질해요...':p.happy<20?'심심해요... 놀아 주세요':p.energy<20?'졸려요...':pick([PET_KINDS[p.kind][1]+'! 기분 좋아요 ^^','오늘도 고마워요 ♡','같이 놀자~ '+PET_KINDS[p.kind][1]]);
  say.textContent=msg();let t=0,fx=[];
  if(g){const stop=K.loop(dt=>{t+=dt;try{drawPet(g,p,t);for(const f of fx){f.t-=dt;f.y-=dt*30;txt(g,f.s,f.x,f.y,'#ff3a88',16)}fx=fx.filter(f=>f.t>0)}catch(_){stop()}})}
  c.addEventListener('pointerdown',()=>{if(st==='알'){p.warm++;fx.push({s:'♡',x:150+rnd(-30,30),y:90,t:1});if(p.warm>=5){p.stage='baby';p.care=Math.max(1,p.care);toast(env,'뽀글뽀글 펫','알이 깨졌어요! ‘'+p.name+'’이(가) 태어났어요 '+PET_KINDS[p.kind][1]+'!');ctx.save();ctx.rerender();return}ctx.save();return}if(p.sleep)return;p.hug++;if(p.hug%3===0)p.happy=Math.min(100,p.happy+3);fx.push({s:'♡',x:150+rnd(-30,30),y:90,t:1});ctx.save()});
  const bars=E('div','pt-bars');for(const [n,label,col] of [['hunger','배부름','#ff9a3a'],['happy','행복','#ff6aa8'],['clean','깨끗함','#4ab0ff'],['energy','기운','#5ac85a']]){const row=E('div','pt-bar');row.append(E('b','',label),K.bar(E,label,Math.round(p[n])),E('span','',Math.round(p[n])+'%'));row.children[1].firstChild&&(row.children[1].firstChild.style.background=col);bars.append(row)}box.append(bars);
  const acts=E('div','pt-acts');const act=(label,fn)=>acts.append(B(label,()=>{if(st==='알'){toast(env,'뽀글뽀글 펫','아직 알이에요. 알을 쓰다듬어 주세요!');return}if(p.sleep&&label!=='깨우기'){toast(env,'뽀글뽀글 펫','쉿! 자고 있어요. 먼저 깨워 주세요.');return}const res=fn();if(res){p.care++;p.points++;}ctx.save();ctx.rerender()},'pt-btn'));
  act('밥 주기',()=>{if(p.hunger>=95){toast(env,p.name,'배불러서 못 먹겠어요 '+PET_KINDS[p.kind][1]);return false}p.hunger=Math.min(100,p.hunger+28);return true});
  act('놀아 주기',()=>{if(p.energy<15){toast(env,p.name,'너무 피곤해서 못 놀겠어요...');return false}p.happy=Math.min(100,p.happy+22);p.energy=Math.max(0,p.energy-12);p.hunger=Math.max(0,p.hunger-5);return true});
  act('씻기기',()=>{if(p.clean>=95){toast(env,p.name,'이미 반짝반짝해요!');return false}p.clean=100;p.happy=Math.max(0,p.happy-6);toast(env,p.name,'뽀득뽀득! (목욕은 싫어요 ㅠㅠ)');return true});
  act(p.sleep?'깨우기':'재우기',()=>{p.sleep=!p.sleep;return false});
  box.append(acts,E('p','pt-note','정성 점수 '+p.care+' · 펫 포인트 '+p.points+' · 다음 단계까지 '+(st==='아기'?15-p.care:st==='어린이'?40-p.care:0)+'점'+(st==='어른'?' (다 자랐어요!)':'')));
  body.append(box);
  body.append(B('펫과 헤어지기 (처음부터)',()=>{const X=ctx.X;const doIt=()=>{k.pet={};ctx.save();go({type:'home'})};if(X&&X.ui&&X.ui.dialog)X.ui.dialog({title:'뽀글뽀글 펫',icon:'warn',text:'정말 ‘'+p.name+'’와(과) 헤어질까요? 다시 되돌릴 수 없어요.',buttons:[['헤어지기',doIt],['취소']]});else doIt()},'pt-btn small'));return}
 if(r.type==='shop'){const box=E('section','pt-box');box.append(E('h3','','펫 꾸미기 (펫 포인트 '+p.points+'점)'),E('p','pt-note','펫을 돌볼 때마다 펫 포인트가 1점씩 쌓여요.'));
  for(const [id,name,price] of PET_SHOP){const own=p.items.includes(id);const row=E('div','pt-item');row.append(E('b','',name),E('span','',price+'점'));
   if(own)row.append(B(p.wear===id?'벗기기':'입히기',()=>{p.wear=p.wear===id?'':id;ctx.save();ctx.rerender()},'pt-btn small'));else row.append(B('사기',()=>{if(p.points<price){toast(env,'펫 꾸미기','펫 포인트가 '+(price-p.points)+'점 모자라요.');return}p.points-=price;p.items.push(id);p.wear=id;ctx.save();ctx.rerender()},'pt-btn small'));box.append(row)}body.append(box);return}
 if(r.type==='board'){const box=E('section','pt-box');box.append(E('h3','','펫 자랑 게시판'));
  const mine=K.listOf(k,'gb','pet',8);box.append(B('내 펫 자랑하기',()=>{const st=petStage(p);K.pushTo(k,'gb','pet','['+p.name+'] '+PET_KINDS[p.kind][0]+' · '+st+' · 정성 '+p.care+'점'+(p.wear?' · '+PET_SHOP.find(x=>x[0]===p.wear)[1]+' 착용':''),8);ctx.save();ctx.rerender()},'pt-btn'));
  for(const t of mine.slice().reverse()){const post=E('div','pt-post mine');post.append(E('b','',t),E('small','',' - '+String((ctx.X&&ctx.X.saved&&ctx.X.saved.xp&&ctx.X.saved.xp.nick)||'게스트')+' · 방금'),E('p','pt-cm',pick(['귀여워요 ㅠㅠ','우와 잘 키우셨다','저도 그거 키워요!'])));box.append(post)}
  for(const [t,n,d,x,cms] of PET_BOARD){const post=E('div','pt-post');post.append(E('b','',t),E('small','',' - '+n+' · '+d),E('p','',x));for(const c of cms)post.append(E('p','pt-cm','ㄴ '+c));box.append(post)}body.append(box);return}
 K.site404(env)}

/* ============ 2. 두근두근 경매 ============ */
const AUC_POOL=[
 ['mp3','MP3 플레이어 512MB (거의 새것)','이어폰 새것 포함. 화면 기스 하나 없어요. 노래 120곡 들어감.',30000,1000,'device'],
 ['phone','슬라이드폰 공기계 (액정 기스 조금)','배터리 두 개, 충전기 포함. 카메라 130만 화소.',45000,1000,'phone'],
 ['camera','디지털카메라 400만 화소','메모리 카드 256MB 포함. 소풍 때 딱이에요.',80000,2000,'camera'],
 ['gamecd','게임 CD 정품 (박스, 설명서 있음)','CD 기스 없음. 시디키 스티커 그대로.',8000,500,'disc'],
 ['petgame','옛날 휴대용 펫 게임기 (작동 잘 됨)','초등학교 때 키우던 그것. 건전지 새로 넣었어요.',5000,500,'device'],
 ['minicar','미니카 (모터 튜닝, 배터리 포함)','코너에서 안 날아가게 롤러 달았음. 문방구 대회 3등.',6000,500,'car'],
 ['poster','별빛소녀 브로마이드 (멤버 사인)','공개방송 때 받은 사인. 접힌 자국 없어요!',3000,300,'poster'],
 ['ddakji','딱지 한 상자 (300장)','동네 딱지왕이 은퇴하면서 내놓습니다. 왕딱지 5장 포함.',2000,200,'box'],
 ['chair','투명 의자 (보이지 않음)','보이지 않지만 분명히 있습니다. 앉으셔도 됩니다. 아마도.',1000,100,'none'],
 ['bike','중고 자전거 (기어 7단)','바구니 있음. 브레이크 잘 들어요. 직접 가져가셔야 해요.',25000,1000,'bike'],
 ['pctime','PC방 30시간 이용권','동네 2층 PC방 회원 카드. 남은 시간 30시간.',9000,500,'card'],
 ['gacha','문방구 뽑기 경품 전부 (한 봉지)','뽑기 기계에서 나온 반지, 팽이, 스티커 잔뜩.',4000,200,'box'],
 ['monitor','CRT 모니터 17인치 (무거움 주의)','LCD로 바꿔서 팝니다. 화면 아주 밝아요. 혼자 못 들어요.',15000,1000,'monitor'],
 ['pager','삐삐 (추억용, 전원 안 들어옴)','8282 보내던 그 시절... 장식용으로 추천.',1000,100,'device'],
 ['cassette','카세트 플레이어 (테이프 3개 포함)','오토 리버스 됨. 영어 듣기 테이프도 드려요.',7000,500,'device'],
 ['shirt','빨간 응원 티셔츠 (새것)','월드컵 응원 준비! 사이즈 L, 한 번도 안 입음.',6000,500,'shirt'],
 ['medal','운동회 1등 메달 (진짜 금 아님)','달리기 1등 메달. 금색 칠이 조금 벗겨짐.',300,100,'medal'],
 ['pens','사인펜 16색 (빨강 없음)','빨강만 다 써서 15색입니다. 이름 스티커 붙어 있어요.',500,100,'pens']
];
const AUC_BOTS=['딱지왕','경매고수','막판입찰','짠돌이','눈팅족','초보입니다','중고나라','알뜰살뜰','엄마몰래','용돈부자'];
const DELIVERY=['결제 확인 중','배송 준비 중','택배 출발!','배송 완료'];
function aucState(k){const a=obj(k,'auc');const now=Date.now();if(!Number.isFinite(a.money)||a.money<0)a.money=50000;if(!Number.isFinite(a.round)||a.round<0)a.round=0;if(!Array.isArray(a.won))a.won=[];a.won=a.won.filter(x=>x&&typeof x.name==='string').slice(-30);
 if(!Array.isArray(a.items)||!a.items.length||a.items.every(x=>x.done)){a.round++;const start=(a.round*5)%AUC_POOL.length;a.items=[];for(let i=0;i<8;i++){const src=AUC_POOL[(start+i*2+(a.round%2))%AUC_POOL.length];a.items.push({id:src[0]+'-'+a.round,src:src[0],price:src[3],bids:0,top:'',end:now+(150+i*75+Math.floor(Math.random()*40))*1000,cap:Math.round(src[3]*rnd(1.5,2.6)/src[4])*src[4],done:false,mine:false})}}
 for(const it of a.items){if(!it.done&&now>=it.end){it.done=true;if(it.top==='나'){a.won.push({name:(AUC_POOL.find(x=>x[0]===it.src)||[0,'?'])[1],src:it.src,price:it.price,at:now});it.mine=true;}else if(it.top&&it.mine===false&&it.myBid){a.money+=it.myBid;it.myBid=0}}}
 return a}
const aucSrc=it=>AUC_POOL.find(x=>x[0]===it.src)||AUC_POOL[0];
function aucArt(g,kind,W,H){rect(g,0,0,W,H,'#f4f6fa');const cx=W/2,cy=H/2;
 if(kind==='device'){rect(g,cx-18,cy-26,36,52,'#5a6a8a');rect(g,cx-13,cy-20,26,18,'#bfe6ff');circ(g,cx,cy+12,7,'#cfd6e4')}
 else if(kind==='phone'){rect(g,cx-14,cy-30,28,58,'#2a2a34');rect(g,cx-10,cy-24,20,24,'#7ad0ff');for(let i=0;i<3;i++)rect(g,cx-9+i*7,cy+6,5,4,'#888')}
 else if(kind==='camera'){rect(g,cx-28,cy-16,56,34,'#c8ccd4');circ(g,cx,cy+1,12,'#333');circ(g,cx,cy+1,7,'#5a7aa8');rect(g,cx+14,cy-22,10,6,'#888')}
 else if(kind==='disc'){circ(g,cx,cy,26,'#d8dce8');circ(g,cx,cy,22,'#bfe6ff');circ(g,cx,cy,6,'#f4f6fa');circ(g,cx-8,cy-8,4,'rgba(255,255,255,.7)')}
 else if(kind==='car'){rect(g,cx-30,cy-6,60,16,'#e84d4d');rect(g,cx-16,cy-16,30,12,'#e84d4d');circ(g,cx-18,cy+12,7,'#222');circ(g,cx+18,cy+12,7,'#222')}
 else if(kind==='poster'){rect(g,cx-22,cy-30,44,60,'#ff9ac0');circ(g,cx,cy-6,10,'#ffdcb8');rect(g,cx-10,cy-17,20,5,'#3a2418');txt(g,'사인',cx,cy+22,'#fff',10)}
 else if(kind==='box'){rect(g,cx-26,cy-18,52,38,'#c89a5a');rect(g,cx-26,cy-18,52,6,'#a07040');txt(g,'잔뜩',cx,cy+8,'#5a3a1a',11)}
 else if(kind==='bike'){g.strokeStyle='#333';g.lineWidth=3;g.beginPath();g.arc(cx-20,cy+10,13,0,7);g.stroke();g.beginPath();g.arc(cx+20,cy+10,13,0,7);g.stroke();g.beginPath();g.moveTo(cx-20,cy+10);g.lineTo(cx-4,cy-10);g.lineTo(cx+20,cy+10);g.lineTo(cx,cy+10);g.lineTo(cx-4,cy-10);g.stroke()}
 else if(kind==='card'){rect(g,cx-28,cy-18,56,36,'#2a5ab8');rect(g,cx-28,cy-10,56,6,'#ffd23f');txt(g,'PC방',cx,cy+12,'#fff',10)}
 else if(kind==='monitor'){rect(g,cx-26,cy-26,52,42,'#e8e4d8');rect(g,cx-20,cy-20,40,30,'#3a6fd8');rect(g,cx-8,cy+16,16,8,'#d8d4c8')}
 else if(kind==='shirt'){g.fillStyle='#e84d4d';g.beginPath();g.moveTo(cx-14,cy-24);g.lineTo(cx-32,cy-12);g.lineTo(cx-24,cy-2);g.lineTo(cx-18,cy-6);g.lineTo(cx-18,cy+26);g.lineTo(cx+18,cy+26);g.lineTo(cx+18,cy-6);g.lineTo(cx+24,cy-2);g.lineTo(cx+32,cy-12);g.lineTo(cx+14,cy-24);g.fill()}
 else if(kind==='medal'){rect(g,cx-4,cy-30,8,22,'#3a6fd8');circ(g,cx,cy+4,16,'#ffd23f');txt(g,'1',cx,cy+9,'#a07000',14)}
 else if(kind==='pens'){for(let i=0;i<8;i++)rect(g,cx-28+i*7,cy-24,5,48,['#ff9a2a','#ffd23f','#5ac85a','#3a6fd8','#a05ab0','#333','#ff6aa8','#7ad0ff'][i])}
 else{g.strokeStyle='#ccd';g.setLineDash&&g.setLineDash([4,4]);g.strokeRect&&g.strokeRect(cx-24,cy-24,48,48);g.setLineDash&&g.setLineDash([]);txt(g,'(투명)',cx,cy+4,'#aab',11)}}
function aucPage(page,env){const {E,B,go,r,k,ctx}=env,a=aucState(k);ctx.save();
 const head=E('header','au-head');head.append(B('두근두근 경매',()=>go({type:'home'}),'au-logo'),E('span','au-sub','싸게 사고 기분 좋게! 지금 '+won(3200+K.hash(String(k.total))%90)+'명 입찰 중'),E('b','au-money','내 경매 포인트 '+won(a.money)+'P'));page.append(head);
 const nav=E('nav','au-nav');for(const [type,label] of [['home','진행 중인 경매'],['my','나의 경매']])nav.append(B(label,()=>go({type}),'au-tab'+(r.type===type?' on':'')));page.append(nav,K.marquee(E,'★ 회원님 안전 거래 안내: 판매자와 직접 돈을 주고받지 마세요 ★ 막판 입찰에 주의하세요 ★ 낙찰 후 취소는 신용도가 떨어집니다 ★','au-marq'));
 const body=E('main','au-body');page.append(body);
 const left=it=>Math.max(0,Math.ceil((it.end-Date.now())/1000));const fmt=s=>s<=0?'경매 끝':Math.floor(s/60)+'분 '+String(s%60).padStart(2,'0')+'초';
 const bid=it=>{const src=aucSrc(it);if(it.done){toast(env,'두근두근 경매','이미 끝난 경매예요.');return false}if(it.top==='나'){toast(env,'두근두근 경매','이미 최고 입찰자예요!');return false}const next=it.bids?it.price+src[4]:it.price;if(a.money<next){toast(env,'두근두근 경매','경매 포인트가 모자라요.');return false}
  if(it.myBid)a.money+=it.myBid;a.money-=next;it.myBid=next;it.price=next;it.bids++;it.top='나';it.mine=false;ctx.save();toast(env,'두근두근 경매','‘'+src[1]+'’에 '+won(next)+'P 입찰! 지금 최고 입찰자예요.');return true};
 const botTurn=(it,late)=>{if(it.done||it.top!=='나'&&it.top)return false;const src=aucSrc(it),next=it.price+src[4];if(next>it.cap)return false;if(Math.random()>(late?.55:.18))return false;if(it.myBid&&it.top==='나'){a.money+=it.myBid;it.myBid=0}it.price=next;it.bids++;it.top=pick(AUC_BOTS);ctx.save();return true};
 if(r.type==='home'){const grid=E('div','au-grid');const cards=[];
  for(const it of a.items){const src=aucSrc(it);const card=E('div','au-card'+(it.done?' done':'')+(it.top==='나'?' me':''));const [c,g]=cv(env,'au-img',120,90);if(g)try{aucArt(g,src[5],120,90)}catch(_){}
   const price=E('b','au-price',''),time=E('span','au-time',''),who=E('small','au-top','');card.append(c,B(src[1],()=>go({type:'item',id:it.id}),'au-link'),price,time,who);
   const btn=B('',()=>{bid(it);paint()},'au-btn');card.append(btn);grid.append(card);cards.push({it,price,time,who,btn,card})}
  body.append(E('p','au-note','경매는 진짜 시간으로 흘러가요. 시간이 끝났을 때 최고 입찰자가 낙찰! 다른 사람이 더 높게 부르면 내 포인트는 돌려받아요.'),grid);
  const paint=()=>{for(const x of cards){const src=aucSrc(x.it),s=left(x.it);x.price.textContent='현재가 '+won(x.it.price)+'P · 입찰 '+x.it.bids+'번';x.time.textContent=fmt(s);x.time.classList.toggle('hot',s>0&&s<=30);x.who.textContent=x.it.top?'최고 입찰: '+(x.it.top==='나'?'나!':x.it.top):'아직 입찰 없음';x.btn.textContent=x.it.done?(x.it.top==='나'?'낙찰 성공!':'경매 끝'):x.it.top==='나'?'최고 입찰 중':(x.it.bids?won(x.it.price+src[4]):won(x.it.price))+'P 입찰';x.btn.disabled=x.it.done||x.it.top==='나';x.card.classList.toggle('me',x.it.top==='나')}};
  paint();let acc=0;K.loop(dt=>{acc+=dt;if(acc<1)return;acc=0;let changed=false;for(const it of a.items){if(it.done)continue;const s=left(it);if(s<=0){aucState(k);changed=true;continue}if(botTurn(it,s<=20))changed=true}if(changed)ctx.save();paint();if(a.items.every(x=>x.done)){toast(env,'두근두근 경매','이번 회차 경매가 모두 끝났어요. 새 물건이 올라왔어요!');ctx.rerender()}});
  env.aucBid=bid;env.aucBot=botTurn;return}
 if(r.type==='item'){const it=a.items.find(x=>x.id===r.id);if(!it){K.site404(env,'이미 끝났거나 없는 경매예요.');return}const src=aucSrc(it);const box=E('section','au-box au-detail');const [c,g]=cv(env,'au-big',240,180);if(g)try{aucArt(g,src[5],240,180)}catch(_){}
  const info=E('div','au-info');info.append(E('h2','',src[1]),E('p','',src[2]),E('p','','시작가 '+won(src[3])+'P · 입찰 단위 '+won(src[4])+'P'),E('p','','판매자: '+AUC_BOTS[K.hash(src[0])%AUC_BOTS.length]+' (신용도 '+'★'.repeat(3+K.hash(src[0])%3)+')'));const st=E('p','au-price','현재가 '+won(it.price)+'P · '+(it.top?'최고 입찰: '+it.top:'입찰 없음'));info.append(st,B(it.top==='나'?'최고 입찰 중':'입찰하기',()=>{if(bid(it))ctx.rerender()},'au-btn big'),B('◀ 목록으로',()=>go({type:'home'}),'au-btn'));box.append(c,info);body.append(box);
  const rv=E('section','au-box');rv.append(E('h3','','이 판매자 구매 후기'));for(const t of [pick(['물건 좋아요 ^^ 빠른 배송 감사합니다','설명이랑 똑같아요! 추천','포장이 꼼꼼해요']),src[0]==='chair'?'의자가 안 보여서 반품하려고 했는데 판매자분이 원래 안 보인다고 하네요... 인정합니다':'좋은 거래 감사합니다~'])rv.append(E('p','au-cm','ㄴ '+t));body.append(rv);return}
 if(r.type==='my'){const box=E('section','au-box');box.append(E('h3','','나의 낙찰 목록'));if(!a.won.length)box.append(E('p','au-note','아직 낙찰받은 물건이 없어요. 막판 입찰을 조심하세요!'));
  for(const x of a.won.slice().reverse()){const mins=(Date.now()-x.at)/60000,step=Math.min(3,Math.floor(mins/1.5));const row=E('div','au-row');row.append(E('b','',x.name),E('span','',won(x.price)+'P'),E('em','au-ship',DELIVERY[step]));if(step===3&&x.src==='chair')row.append(E('small','','상자가 비어 있다... 아니, 의자가 투명한 거다!'));box.append(row)}
  box.append(E('p','au-note','남은 경매 포인트 '+won(a.money)+'P · 이번이 '+a.round+'번째 경매 회차예요.'));body.append(box);return}
 K.site404(env)}

/* ============ 3. 말놀이 천국 ============ */
const WORDS=('가방 가위 가족 가수 가을 가지 가게 감자 감기 감나무 강아지 개구리 개나리 개미 개울 개학 거울 거미 건물 겨울 경찰 계단 고구마 고래 고양이 고추 고무줄 고향 고드름 고기 고슴도치 공원 공책 공룡 공기 공주 공항 공부 과자 교실 구름 구두 구슬 구멍 구급차 구경 구석 국수 국자 국어 국기 군인 궁전 그네 그림 그림자 그릇 그물 기차 기린 기름 기계 기분 기억 기타 기러기 기침 기와 기자 기둥 김밥 김치 김장 꽃병 꽃게 꽃밭 꽃잎 꿀벌 끼니 '+
'나무 나비 나팔꽃 나그네 나라 낙타 날개 날씨 날짜 남자 남극 남산 낭떠러지 내일 내복 냄비 냉장고 네모 노래 노트 노을 놀이터 농구 농부 농장 누나 누룽지 눈물 눈사람 느티나무 '+
'다리 다람쥐 다리미 다락방 달걀 달력 달팽이 달리기 당근 대문 대나무 대추 도로 도서관 도시락 도토리 도마뱀 도깨비 도장 도넛 돌고래 동물 동생 동화책 두부 두더지 두꺼비 두루미 둘레 드럼 드라마 등대 등산 딸기 떡볶이 '+
'라면 라디오 레몬 로봇 리본 마을 마차 마늘 마루 마술 마당 마녀 만두 망치 매미 머리 메뚜기 메달 메아리 모자 모래 모기 모래성 모니터 모험 목도리 무지개 무릎 무궁화 무대 무게 문어 문방구 물감 물개 물고기 물병 물총 물방울 미끄럼틀 미소 미술 미역 미로 미니홈피 밀가루 '+
'바다 바람 바지 바나나 바위 바구니 바이올린 바늘 박쥐 박수 박물관 반지 반찬 반달 반장 반딧불이 발가락 밤나무 밤하늘 밤송이 방석 방울 방학 방귀 방패 방송 배추 버스 버섯 버터 벌레 베개 별빛 병원 보물 볼펜 봉투 봉숭아 부엌 북극곰 불꽃 불고기 불빛 불가사리 비행기 비누 비둘기 비밀 비빔밥 비옷 빵집 '+
'사과 사자 사진 사탕 사슴 사다리 사랑 사막 사전 사촌 산타 산책 산딸기 상자 상추 상어 상처 새우 생일 생선 생쥐 선물 선생님 선풍기 선인장 설탕 소금 소나기 손수건 손가락 손톱 손님 송아지 수박 수건 수영 수첩 수학 수염 수레 수달 수저 숙제 숟가락 술래 술래잡기 스케치북 스키 시계 시장 시소 시금치 시골 시험 시냇물 신발 실내화 실뜨기 '+
'아기 아빠 아침 아파트 아이스크림 아저씨 악어 안경 야구 양말 어린이 엄마 여름 여우 여행 여왕 역사 연필 연못 연극 열쇠 오리 오이 요리 요정 요요 용돈 용기 용수철 우산 우유 우체국 우주 우표 우물 운동장 운동화 울타리 원숭이 원피스 월드컵 월요일 유리 유치원 유령 의자 이불 이름 이마 이사 이웃 이야기 이빨 이슬 인형 인사 인어 인절미 일기 일기장 일요일 임금님 '+
'자동차 자전거 자석 자두 자루 자리 자연 자장가 장갑 장미 장난감 장마 장구 장화 재채기 전화 전기 전철 전봇대 접시 젓가락 정원 정글 제기 제비 제주도 종이 주먹 주사위 주머니 주전자 주스 지구 지도 지갑 지렁이 지우개 지하철 지붕 지팡이 지네 짜장면 짝꿍 '+
'차표 참외 창문 책상 책가방 천둥 철봉 철새 초콜릿 추석 축구 축제 치약 치마 치즈 치과 친구 칠판 카메라 컴퓨터 컵라면 코끼리 콩나물 크레파스 크리스마스 키위 키다리 '+
'타조 탕수육 태극기 택시 터널 토끼 토마토 통조림 트럭 파도 파리 파티 팽이 편지 포도 표정 풍선 피아노 피자 피리 피구 필통 '+
'하늘 학교 학원 학생 한글 할머니 할아버지 해바라기 햄버거 형제 호랑이 호박 호수 호두 호루라기 호떡 홈런 화분 화가 화장실 화살 화요일 휴지 흙탕물').split(' ');
const WSET=new Set(WORDS);
function syl(c){const n=c.charCodeAt(0)-0xAC00;if(n<0||n>11171)return null;return{L:Math.floor(n/588),V:Math.floor(n%588/28),T:n%28}}
const mk=(L,V,T)=>String.fromCharCode(0xAC00+(L*21+V)*28+T);
function heads(ch){const s=syl(ch);if(!s)return [ch];const out=[ch];const iy=[2,6,7,12,17,20],ln=[0,1,8,11,13,18];if(s.L===5){if(iy.includes(s.V))out.push(mk(11,s.V,s.T));else if(ln.includes(s.V))out.push(mk(2,s.V,s.T))}else if(s.L===2&&iy.includes(s.V))out.push(mk(11,s.V,s.T));return out}
const lastOf=wd=>wd[wd.length-1];
function nextWords(ch,used){const hs=heads(ch);return WORDS.filter(x=>hs.includes(x[0])&&!used.includes(x))}
const isHangul=s=>/^[가-힣]{2,6}$/.test(s);
const POEM_TOPICS=['떡볶이','컵라면','도시락','운동장','문방구','별사탕','소나기','월드컵','미니홈','방과후','여름밤','짝꿍들'];
const POEM_SEED=[
 ['떡볶이','떡볶이 먹으러 가자','볶음밥도 먹자','이 돈은 누가 내?','분식왕',212],
 ['컵라면','컵라면 하나 시켰는데','라면이 불었다','면발이 우동이 됐다','PC방죽돌이',187],
 ['운동장','운동장에서 축구 하다가','동네 형들이 와서','장소를 빼앗겼다 ㅠㅠ','축구소년',140],
 ['문방구','문방구 아저씨','방금 그 뽑기','구라죠? (꽝만 나옴)','뽑기장인',166],
 ['도시락','도시락 반찬 뭐야?','시금치랑 멸치','락(樂)이 없다...','편식왕',98],
 ['월드컵','월요일부터 응원 연습','드디어 6월 13일','컵라면 먹으면서 토고전 본다!','붉은악마',231]
];
const OX_POOL=[
 ['독일 월드컵은 6월 9일에 막을 올린다.',true,'2006 독일 월드컵은 6월 9일에 개막해요.'],
 ['우리나라의 월드컵 첫 경기 상대는 토고다.',true,'6월 13일 밤 10시, 토고와 첫 경기를 해요.'],
 ['고래는 물고기다.',false,'고래는 새끼를 낳아 젖을 먹이는 포유류예요.'],
 ['펭귄은 새다.',true,'날지는 못하지만 펭귄은 새예요.'],
 ['거미는 곤충이다.',false,'거미는 다리가 여덟 개라서 곤충이 아니에요.'],
 ['개미의 다리는 여섯 개다.',true,'곤충은 다리가 여섯 개예요.'],
 ['번개가 번쩍한 뒤 천둥이 늦게 들리는 건 빛이 소리보다 빨라서다.',true,'빛은 거의 바로 오고 소리는 1초에 약 340미터씩 와요.'],
 ['한글날은 10월 9일이다.',true,'한글날은 10월 9일이에요.'],
 ['명왕성은 태양계의 아홉 번째 행성이다.',true,'지금 교과서에서는 수금지화목토천해명, 아홉 행성이라고 배워요.'],
 ['지구에서 가장 가까운 별은 북극성이다.',false,'지구에서 가장 가까운 별은 태양이에요.'],
 ['남극에는 북극곰이 산다.',false,'북극곰은 북극에만 살아요. 남극에는 펭귄이 살아요.'],
 ['물은 1기압에서 100도에 끓는다.',true,'보통 기압에서 물은 100도에 끓어요.'],
 ['축구는 전반과 후반이 각각 45분이다.',true,'추가 시간을 빼면 전반 45분, 후반 45분이에요.'],
 ['올림픽은 2년마다 열린다.',false,'올림픽은 4년마다 열려요.'],
 ['우리 몸에서 가장 큰 뼈는 넓적다리뼈다.',true,'허벅지에 있는 넓적다리뼈가 가장 커요.'],
 ['무지개는 보통 일곱 빛깔이라고 말한다.',true,'빨주노초파남보, 일곱 빛깔이에요.'],
 ['참새는 날지 못한다.',false,'참새는 잘 날아요. 짹짹!'],
 ['우리나라 국보 1호는 숭례문이다.',true,'숭례문(남대문)이 국보 1호예요.'],
 ['박쥐는 새다.',false,'박쥐는 날 수 있는 포유류예요.'],
 ['토끼는 귀로 소리를 듣는다.',true,'긴 귀로 소리를 아주 잘 들어요.']
];
function wordPage(page,env){const {E,B,go,r,k,ctx}=env,s=obj(k,'word');for(const n of ['win','lose','best','oxWin','oxPlay'])if(!Number.isFinite(s[n])||s[n]<0)s[n]=0;if(!Array.isArray(s.poems))s.poems=[];s.poems=s.poems.filter(x=>Array.isArray(x)&&x.length===4).slice(-8);
 const head=E('header','wd-head');head.append(B('말놀이 천국',()=>go({type:'home'}),'wd-logo'),E('span','wd-sub','끝말잇기 · 삼행시 · OX 퀴즈 서바이벌'));page.append(head);
 const nav=E('nav','wd-nav');for(const [type,label] of [['home','놀이터 입구'],['chain','끝말잇기'],['poem','삼행시 짓기'],['ox','OX 서바이벌']])nav.append(B(label,()=>go({type}),'wd-tab'+(r.type===type?' on':'')));page.append(nav);
 const body=E('main','wd-body');page.append(body);
 if(r.type==='home'){const box=E('section','wd-box');box.append(E('h3','','오늘의 말놀이 기록'),E('p','','끝말잇기 '+s.win+'승 '+s.lose+'패 · 가장 길게 이은 판 '+s.best+'단어'),E('p','','OX 서바이벌 '+s.oxPlay+'판 중 최후의 생존 '+s.oxWin+'번'),E('p','','내가 지은 삼행시 '+s.poems.length+'편'));body.append(box);
  for(const [type,t,d] of [['chain','끝말잇기 봇과 한판!','끝말봇은 사전에 있는 말 '+WORDS.length+'개를 알고 있어요. 한방 단어 조심!'],['poem','삼행시 짓기','오늘의 주제어로 삼행시를 지어 보세요. 다른 사람들이 추천해 줘요.'],['ox','OX 퀴즈 서바이벌','100명이 함께 시작! 틀리면 탈락, 마지막까지 살아남아라!']]){const b=B('',()=>go({type}),'wd-card');b.append(E('b','',t),E('small','',d));body.append(b)}return}
 if(r.type==='chain'){const box=E('section','wd-box wd-chain');box.append(E('h3','','끝말잇기 · 끝말봇과 대결 (지금 '+s.win+'승 '+s.lose+'패)'));const log=E('div','wd-log'),info=E('p','wd-info',''),form=E('form','wd-form'),inp=K.field(E,'낱말을 쓰고 엔터 (한글 2~6글자)',6,'끝말잇기 낱말');const sb=B('내기',()=>{},'wd-btn');sb.type='submit';form.append(inp,sb);box.append(log,info,form);body.append(box);
  const used=[];let turn=0,timeLeft=20,over=false,need='';const say=(who,t,cls)=>{const p=E('p','wd-line '+(cls||''));p.append(E('b','',who+' : '),E('span','',t));log.append(p);while(log.children.length>40)log.children[0].remove();log.scrollTop=1e6};
  const end=(win,why)=>{if(over)return;over=true;inp.disabled=true;if(win)s.win++;else s.lose++;s.best=Math.max(s.best,used.length);ctx.save();say('알림',why,'sys');info.textContent=(win?'이겼다! ':'졌다... ')+'이번 판 '+used.length+'단어 · '+s.win+'승 '+s.lose+'패';box.append(B('한 판 더!',()=>ctx.rerender(),'wd-btn'));};
  const botMove=last=>{const cand=nextWords(lastOf(last),used);if(!cand.length){end(true,'끝말봇: 으아... ‘'+heads(lastOf(last)).join('/')+'’(으)로 시작하는 말이 생각 안 나요. 졌다 ㅠㅠ');return}
   const killers=cand.filter(x=>!nextWords(lastOf(x),[...used,x]).length);const wd=turn>=6&&killers.length&&Math.random()<.5?pick(killers):pick(cand);used.push(wd);say('끝말봇',wd+(killers.includes(wd)?'  (한방 단어다 ㅋㅋ)':''),'bot');need=lastOf(wd);timeLeft=20;turn++;info.textContent='‘'+heads(need).join(' 또는 ')+'’(으)로 시작하는 말! 남은 시간 '+timeLeft+'초'};
  form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();if(over)return;const v=String(inp.value||'').trim();inp.value='';if(!v)return;
   if(!isHangul(v)){say('알림','한글 2~6글자 낱말만 낼 수 있어요.','sys');return}
   if(!heads(need).includes(v[0])){say('알림','‘'+heads(need).join(' 또는 ')+'’(으)로 시작해야 해요!','sys');return}
   if(used.includes(v)){say('알림','이미 나온 말이에요!','sys');return}
   used.push(v);say('나',v+(WSET.has(v)?'':'  (사전에 없지만 인정!)'),'me');turn++;
   if(!nextWords(lastOf(v),used).length){end(true,'끝말봇: 헉 ‘'+lastOf(v)+'’?! 한방 단어잖아... 졌다 ㅠㅠ');return}
   K.later(()=>{if(!over)botMove(v)},700)});
  K.loop(dt=>{if(over||!need)return;timeLeft-=dt;const tl=Math.ceil(timeLeft);if(tl<=0){end(false,'시간 초과! 20초 안에 말을 내야 해요.');return}info.textContent='‘'+heads(need).join(' 또는 ')+'’(으)로 시작하는 말! 남은 시간 '+tl+'초'});
  const first=pick(WORDS.filter(x=>nextWords(lastOf(x),[x]).length>3));used.push(first);need=lastOf(first);say('알림','끝말봇이 먼저 시작합니다. 같은 말은 두 번 쓸 수 없고, 두음 법칙(력→역, 리→이)도 돼요.','sys');say('끝말봇',first,'bot');
  env.chain={say:v=>{inp.value=v;form.emit?form.emit('submit'):0},state:()=>({used:used.slice(),need,over,turn,timeLeft}),tick:sec=>{timeLeft-=sec}};return}
 if(r.type==='poem'){const topic=POEM_TOPICS[(K.hash(String(k.total))+s.poems.length)%POEM_TOPICS.length];const box=E('section','wd-box');box.append(E('h3','','오늘의 삼행시 주제: ‘'+topic+'’'));const form=E('form','wd-poem'),ins=[];
  for(const ch of topic.slice(0,3)){const row=E('label','wd-pl');const i=K.field(E,ch+'(으)로 시작하는 한 줄',30,ch+' 줄');row.append(E('b','',ch),i);ins.push(i);form.append(row)}const sb=B('삼행시 올리기',()=>{},'wd-btn');sb.type='submit';form.append(sb);box.append(form);body.append(box);
  form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();const ls=ins.map(i=>String(i.value||'').trim().slice(0,30));if(ls.some(x=>!x)){toast(env,'말놀이 천국','세 줄을 모두 써 주세요!');return}s.poems.push([topic,...ls]);s.poems=s.poems.slice(-8);ctx.save();toast(env,'말놀이 천국','삼행시를 올렸어요! 사람들 반응을 보세요.');ctx.rerender()});
  const fame=E('section','wd-box');fame.append(E('h3','','명예의 전당'));
  for(const p of s.poems.slice().reverse()){const card=E('div','wd-pcard mine');card.append(E('small','','주제: '+p[0]+' · 나 · 방금'));p[0].slice(0,3).split('').forEach((ch,i)=>card.append(E('p','',ch+' : '+p[i+1])));card.append(E('p','wd-cm','ㄴ '+pick(['ㅋㅋㅋㅋㅋ 대박','추천 꾹 누르고 갑니다','마지막 줄에서 빵 터짐 ㅋㅋ','오 센스 있다','이거 퍼가도 돼요?'])));fame.append(card)}
  for(const [t,a1,a2,a3,who,rec] of POEM_SEED){const card=E('div','wd-pcard');card.append(E('small','','주제: '+t+' · '+who+' · 추천 '+rec));t.split('').forEach((ch,i)=>card.append(E('p','',ch+' : '+[a1,a2,a3][i])));fame.append(card)}body.append(fame);return}
 if(r.type==='ox'){const box=E('section','wd-box wd-ox');body.append(box);const qs=OX_POOL.slice().sort(()=>Math.random()-.5).slice(0,10);let qi=0,alive=100,out=false,locked=false,timeLeft=10;
  const head2=E('div','wd-oxhead'),q=E('p','wd-q',''),btns=E('div','wd-oxbtns'),res=E('p','wd-res',''),timer=E('p','wd-timer','');head2.append(E('b','',''),E('span',''));box.append(E('h3','','OX 퀴즈 서바이벌 (100명 참가)'),head2,q,timer,btns,res);
  const paint=()=>{head2.children[0].textContent='문제 '+(qi+1)+'/10';head2.children[1].textContent='  남은 사람 '+alive+'명';q.textContent=qs[qi][0];timer.textContent='남은 시간 '+Math.max(0,Math.ceil(timeLeft))+'초'};
  const answer=v=>{if(locked||out)return;locked=true;const [t,ans,why]=qs[qi];const ok=v===ans;const drop=Math.max(1,Math.round(alive*rnd(.2,.45)));alive=Math.max(ok?1:0,alive-drop);res.textContent=(v===null?'시간 초과! ':ok?'정답! ':'땡! ')+'정답은 '+(ans?'O':'X')+' · '+why+' (이번 문제에서 '+drop+'명 탈락)';
   if(!ok){out=true;s.oxPlay++;ctx.save();res.textContent+=' · 탈락했어요. 최종 순위 '+(alive+1)+'등';btns.replaceChildren(B('다시 도전',()=>ctx.rerender(),'wd-btn'));return}
   if(qi>=qs.length-1){out=true;s.oxPlay++;s.oxWin++;ctx.save();res.textContent+=' · 최후의 '+alive+'인에 들었어요! 축하합니다!!';btns.replaceChildren(B('다시 도전',()=>ctx.rerender(),'wd-btn'));return}
   K.later(()=>{qi++;locked=false;timeLeft=10;res.textContent='';paint()},1600)};
  btns.append(B('O',()=>answer(true),'wd-o'),B('X',()=>answer(false),'wd-x'));paint();
  K.loop(dt=>{if(locked||out)return;timeLeft-=dt;if(timeLeft<=0){timeLeft=0;answer(null)}timer.textContent='남은 시간 '+Math.max(0,Math.ceil(timeLeft))+'초'});
  env.ox={answer,state:()=>({qi,alive,out,locked,q:qs[qi]})};return}
 K.site404(env)}

/* ============ 4. 뽀샤시 사진관 ============ */
const STICKERS=['♡','★','V','얼짱','♪','☆','^^','짱'];
const FRAMES=[['','틀 없음'],['heart','하트 틀'],['star','별 틀'],['film','필름 틀'],['lace','레이스 틀']];
function photoPage(page,env){const {E,B,go,r,k,ctx}=env,X=ctx.X;const s=obj(k,'photo');if(!Number.isFinite(s.saved)||s.saved<0)s.saved=0;
 const head=E('header','ph-head');head.append(B('뽀샤시 사진관',()=>go({type:'home'}),'ph-logo'),E('span','ph-sub','✿ 얼짱 각도와 뽀샤시 효과로 최고의 한 장을! ✿'));page.append(head);
 const nav=E('nav','ph-nav');for(const [type,label] of [['home','사진관 안내'],['studio','사진 꾸미기']])nav.append(B(label,()=>go({type}),'ph-tab'+(r.type===type?' on':'')));page.append(nav);
 const body=E('main','ph-body');page.append(body);
 if(r.type==='home'){const box=E('section','ph-box');box.append(E('h3','','이렇게 써요'));for(const t of ['① 그림판에서 그린 ‘내 그림’이나 기본 모델(내 캐릭터)을 고르세요.','② 뽀샤시, 흑백, 옛날 사진 효과를 골라 보세요.','③ 틀과 스티커, 글씨로 꾸미세요. 사진을 누르면 스티커가 붙어요.','④ ‘내 그림으로 저장’을 누르면 바탕 화면 배경이나 미니홈피 대문 사진으로 쓸 수 있어요.'])box.append(E('p','',t));box.append(E('p','ph-note','지금까지 이 사진관에서 꾸민 사진 '+s.saved+'장'));body.append(box,B('사진 꾸미러 가기 ▶',()=>go({type:'studio'}),'ph-btn big'));return}
 if(r.type!=='studio'){K.site404(env);return}
 const pics=X&&X.shell&&X.shell.pics?X.shell.pics():[];const st={src:'',fx:'soft',frame:'heart',sticker:'♡',text:'',stamps:[],tilt:false};
 const box=E('section','ph-box ph-studio');const [c,g]=cv(env,'ph-canvas',320,240);const side=E('div','ph-side');box.append(c,side);body.append(box);
 let img=null;const loadSrc=()=>{img=null;if(st.src&&w.Image){const p=pics.find(x=>x.id===st.src);if(p){const im=new w.Image();im.onload=()=>{img=im;draw()};im.src=p.url}}draw()};
 const model=gg=>{const gr=gg.createLinearGradient?gg.createLinearGradient(0,0,0,240):null;if(gr){gr.addColorStop(0,'#ffe0f0');gr.addColorStop(1,'#e0f0ff');gg.fillStyle=gr}else gg.fillStyle='#ffe0f0';gg.fillRect(0,0,320,240);if(w.CHARART&&w.CHARART.drawRemote){gg.save();gg.translate(160,226);gg.scale(3.4,3.4);w.CHARART.drawRemote(gg,w.CHARART.selected,0,0,1,'stand','ph-model');gg.restore()}else{circ(gg,160,110,46,'#ffdcb8');rect(gg,118,150,84,80,'#ff9ac0')}};
 function draw(){if(!g)return;try{g.save();g.clearRect&&g.clearRect(0,0,320,240);if(st.tilt){g.translate(160,120);g.rotate(-.12);g.scale(1.14,1.14);g.translate(-160,-120)}
   const base=gg=>{if(img)gg.drawImage(img,0,0,320,240);else model(gg)};
   if(st.fx==='mono'||st.fx==='old'){g.filter=st.fx==='mono'?'grayscale(1) contrast(1.1)':'sepia(.85) contrast(.95)';base(g);g.filter='none'}else base(g);
   if(st.fx==='soft'){g.globalAlpha=.55;g.filter='blur(5px) brightness(1.3)';base(g);g.filter='none';g.globalAlpha=1;const vg=g.createRadialGradient?g.createRadialGradient(160,120,60,160,120,200):null;if(vg){vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(255,255,255,.75)');g.fillStyle=vg;g.fillRect(0,0,320,240)}}
   if(st.fx==='old'){g.fillStyle='rgba(120,80,30,.12)';g.fillRect(0,0,320,240);for(let i=0;i<30;i++)rect(g,(i*97)%320,(i*53)%240,1,(i%5)+2,'rgba(60,40,20,.35)')}
   g.restore();
   if(st.frame==='heart'){g.fillStyle='rgba(255,120,170,.85)';for(let i=0;i<16;i++){const x=i*21+6,yb=i%2?8:4;heart(g,x,yb,7);heart(g,x,240-yb,7)}for(let i=0;i<11;i++){heart(g,6,i*22+10,7);heart(g,314,i*22+10,7)}}
   else if(st.frame==='star'){for(let i=0;i<16;i++){txt(g,'★',i*21+8,16,'#ffd23f',16);txt(g,'★',i*21+8,236,'#ffd23f',16)}}
   else if(st.frame==='film'){rect(g,0,0,320,22,'#111');rect(g,0,218,320,22,'#111');for(let i=0;i<16;i++){rect(g,i*20+5,6,10,10,'#eee');rect(g,i*20+5,224,10,10,'#eee')}}
   else if(st.frame==='lace'){for(let i=0;i<20;i++){circ(g,i*17,0,10,'#fff');circ(g,i*17,240,10,'#fff')}for(let i=0;i<15;i++){circ(g,0,i*17,10,'#fff');circ(g,320,i*17,10,'#fff')}}
   for(const [sx,sy,t] of st.stamps)txt(g,t,sx,sy,t==='V'?'#ff4aa0':t==='얼짱'?'#ff2a6a':'#ff6ab0',t.length>1?20:26);
   if(st.text){g.font='bold 22px Dotum,Gulim,sans-serif';g.textAlign='center';g.lineWidth=5;g.strokeStyle='#fff';g.strokeText&&g.strokeText(st.text,160,206);g.fillStyle='#ff3a88';g.fillText(st.text,160,206)}
   txt(g,'2006.05.30',282,232,'rgba(255,140,40,.9)',11)}catch(_){}}
 function heart(gg,x,y,r0){gg.beginPath();gg.arc(x-r0/2,y,r0/2,Math.PI,0);gg.arc(x+r0/2,y,r0/2,Math.PI,0);gg.lineTo(x,y+r0);gg.closePath();gg.fill()}
 c.addEventListener('pointerdown',e=>{const rr=c.getBoundingClientRect?c.getBoundingClientRect():{left:0,top:0,width:320,height:240};const x=(e.clientX-rr.left)*320/(rr.width||320),y=(e.clientY-rr.top)*240/(rr.height||240);if(st.stamps.length>=20)st.stamps.shift();st.stamps.push([x,y+8,st.sticker]);draw()});

 const srcs=[['','기본 모델 (내 캐릭터)'],...pics.map(p=>[p.id,'내 그림: '+p.name])];
 const mkGroup=(label,list,key)=>{const gbox=E('div','ph-group');gbox.append(E('b','',label));const btns=[];for(const [v,t] of list){const b=B(t,()=>{st[key]=v;for(const x of btns)x.classList.toggle('on',x===b);if(key==='src')loadSrc();else draw()},'ph-chip'+(st[key]===v?' on':''));btns.push(b);gbox.append(b)}side.append(gbox)};
 mkGroup('사진 고르기',srcs,'src');if(!pics.length)side.append(E('p','ph-note','그림판에서 그림을 저장하면 그 그림도 꾸밀 수 있어요.'));
 mkGroup('효과',[['soft','뽀샤시'],['none','그대로'],['mono','흑백'],['old','옛날 사진']],'fx');mkGroup('틀',FRAMES,'frame');mkGroup('스티커 (사진을 누르세요)',STICKERS.map(x=>[x,x]),'sticker');
 const ttl=K.field(E,'글씨 넣기 (12자)',12,'사진 글씨');ttl.addEventListener('input',()=>{st.text=String(ttl.value||'').slice(0,12);draw()});const tg=E('div','ph-group');tg.append(E('b','','글씨'),ttl);side.append(tg);
 const tools=E('div','ph-group');tools.append(B('얼짱 각도 (기울이기)',()=>{st.tilt=!st.tilt;draw()},'ph-chip'),B('스티커 다 지우기',()=>{st.stamps=[];draw()},'ph-chip'));side.append(tools);
 const save=B('내 그림으로 저장',()=>{if(!X||!X.shell||!X.shell.picSave){toast(env,'뽀샤시 사진관','저장할 수 없어요.');return}let url='';try{url=c.toDataURL('image/jpeg',.86)}catch(_){url=''}if(!/^data:image\/jpeg/.test(url))try{url=c.toDataURL('image/png')}catch(_){}
  const res=X.shell.picSave('뽀샤시 사진 '+(s.saved+1)+'.jpg',url,320,240);if(res&&res.ok){s.saved++;ctx.save();toast(env,'뽀샤시 사진관','‘내 그림’에 저장했어요! 미니홈피 대문 사진이나 바탕 화면으로 쓸 수 있어요.')}else toast(env,'뽀샤시 사진관',res&&res.why==='full'?'내 그림이 꽉 찼어요. 몇 개를 지워 주세요.':'저장하지 못했어요.')},'ph-btn big');side.append(save);
 env.studio={st,draw,save:()=>save.click()};loadSrc()}

WS.register('w-pet',{key:'pet',domain:'www.poggle-pet.co.kr',caption:'뽀글뽀글 펫 키우기 - 나만의 사이버 펫',name:'뽀글뽀글 펫 키우기',types:['home','adopt','room','shop','board'],linkCat:'재미있는 곳',desc:'알에서부터 키우는 나만의 사이버 펫',star:5,tags:'사이버 펫 펫 키우기 다마고치 강아지 고양이 햄스터 병아리 애완동물 뽀글뽀글 키우기',fav:true,isNew:true},petPage);
WS.register('w-auction',{key:'auction',domain:'www.dugeun-auction.co.kr',caption:'두근두근 경매 - 싸게 사고 기분 좋게',name:'두근두근 경매',types:['home','item','my'],linkCat:'재미있는 곳',desc:'진짜 시간으로 흐르는 경매. 막판 입찰 조심!',star:4,tags:'경매 중고 쇼핑 입찰 낙찰 중고장터 MP3 디카 자전거 두근두근',fav:true,isNew:true},aucPage);
WS.register('w-word',{key:'word',domain:'www.malnori-heaven.com',caption:'말놀이 천국 - 끝말잇기 · 삼행시 · OX 퀴즈',name:'말놀이 천국',types:['home','chain','poem','ox'],linkCat:'재미있는 곳',desc:'끝말잇기 봇과 한판, 삼행시, OX 퀴즈 서바이벌',star:5,tags:'끝말잇기 삼행시 OX 퀴즈 말놀이 낱말 놀이 단어 게임 서바이벌',fav:true,isNew:true},wordPage);
WS.register('w-photo',{key:'photo',domain:'www.bbosyasi-studio.com',caption:'뽀샤시 사진관 - 얼짱 사진 꾸미기',name:'뽀샤시 사진관',types:['home','studio'],linkCat:'재미있는 곳',desc:'뽀샤시 효과, 틀, 스티커로 사진 꾸미기',star:4,tags:'뽀샤시 얼짱 사진 꾸미기 스티커 사진 포토 프레임 셀카 보정',fav:true,isNew:true},photoPage);
w.WebFun={WORDS,heads,nextWords,OX_POOL,POEM_TOPICS,AUC_POOL,PET_KINDS,PET_SHOP,petState,petStage,aucState,version:'A95'};
})(window);
