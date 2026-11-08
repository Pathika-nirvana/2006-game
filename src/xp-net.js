/* A90: 2006년 인터넷의 골칫거리 모음. 바이러스 도우미, 마당공유, 노란 설치 알림줄(ActiveX), 팝업 광고, 끼워 붙는 도구 모음.
   모두 이 게임 안에서만 돌아가는 장난이고 실제로 파일을 받거나 컴퓨터를 건드리지 않는다. 입력 칸으로 개인정보를 받는 화면은 없다. */
(function(w){'use strict';
const FILES=[
 {id:'f1',name:'졸업앨범_스캔본.zip',mb:18.4,risky:false,note:'동네 졸업앨범을 스캔한 그림 묶음'},
 {id:'f2',name:'우리동네_축제_사진모음.zip',mb:32.1,risky:false,note:'작년 동네 축제 사진'},
 {id:'f3',name:'고양이_동영상_모음.wmv',mb:41,risky:false,note:'골목 고양이를 찍은 동영상'},
 {id:'f4',name:'수학_숙제_정리본.hwp',mb:.3,risky:false,note:'수학 개념 정리 문서'},
 {id:'f5',name:'타자연습_문장모음.txt',mb:.1,risky:false,note:'타자 연습용 문장'},
 {id:'f6',name:'공짜_고급게임_최신버전.exe',mb:2.4,risky:true,note:'설명 없음'},
 {id:'f7',name:'윈도우_속도_2배_프로그램.exe',mb:1.1,risky:true,note:'설명 없음'},
 {id:'f8',name:'당신께_온_쪽지_확인.scr',mb:.8,risky:true,note:'설명 없음'},
 {id:'f9',name:'아이템_무한복사_프로그램.exe',mb:.9,risky:true,note:'설명 없음'},
 {id:'f10',name:'PC방_시간_공짜로_쓰는법.exe',mb:1.5,risky:true,note:'설명 없음'}];
const SCAN_FILES=['C:\\Windows\\system32\\kernel32.dll','C:\\Windows\\system32\\drivers\\etc\\hosts','C:\\Program Files\\Internet Explorer\\iexplore.exe','C:\\Windows\\explorer.exe','C:\\Documents and Settings\\Guest\\Cookies','C:\\Program Files\\GameStation\\launcher.exe','C:\\Windows\\Temp\\setup.tmp','C:\\Documents and Settings\\Guest\\내 문서\\Incoming'];
const BARS=['쇼핑나비 툴바','오늘의 운세 툴바','검색 도우미 툴바'];
const ADS=[
 {title:'축하합니다!',big:'100만 번째 방문자',text:'지금 바로 확인하면 최신 가전제품을 드립니다!',btn:'당첨 확인',fake:'확인 결과 당신은 1,000,000번째가 아니라 1,000,001번째 방문자였습니다. 상품은 정확히 한 분께만 드리기 때문에 없던 일이 되었습니다.'},
 {title:'무료 이벤트',big:'벨소리 100곡 공짜',text:'지금 신청하면 컬러링까지 공짜! (단, 첫 달만)',btn:'지금 신청',fake:'신청이 완료되었습니다. 벨소리 100곡은 한 곡씩 천천히 도착합니다. 첫 곡은 다음 달 요금 명세서와 함께 옵니다.'},
 {title:'운세 상담',big:'올해 내 연애운은?',text:'클릭 한 번으로 알아보는 오늘의 운세!',btn:'운세 보기',fake:'결과: 올해 연애운은 대박입니다. 누가 눌러도 똑같이 대박이 나옵니다.'},
 {title:'캐릭터 아이템',big:'무료 증정 이벤트',text:'레어 아이템을 무료로 나눠 드립니다! 지금 접속하세요!',btn:'받으러 가기',fake:'접속하신 곳은 아이템 사이트가 아니라 광고 사이트였습니다. 아이템은 없습니다. 대신 이 창은 무료입니다.'},
 {title:'경고!',big:'바이러스 37개 발견!',text:'당신의 컴퓨터가 위험합니다! 지금 바로 검사하세요!',btn:'지금 검사',fake:'바이러스 37개가 어디에 있는지는 알려 드리지 않습니다. 진짜 검사는 바이러스 도우미로 하세요.',opens:'antivirus'}];
const SPEED=mb=>Math.max(6,Math.min(40,Math.round(mb/2.2)));
function attach(X){
 const {E,B,listen,save,saved}=X;const S=w.XPShell?w.XPShell.xs(X):(saved.xp=saved.xp||{});if(typeof S.realtime!=='boolean')S.realtime=true;
 const toast=o=>X.ui&&X.ui.toast(o);const refs={};let alive=true,navCount=0,adNo=0,infTicks=0,blocked=0,notified=false;
 const files=FILES.map(f=>({...f,state:'idle',p:0,dur:SPEED(f.mb)}));
 const av={phase:'idle',p:0,win:null,bar:null,txt:null,res:null,rt:null,ver:'2006.05.28.01',last:'아직 검사하지 않았습니다'};
 const ie={ui:null,extra:null,notice:null};let p2pWin=null,p2pBox=null,p2pQuery='';
 const clock=()=>X.clockEl.textContent;
 const small=(win,wid,hei,l,t)=>{win.node.classList.add('xp-small');win.node.style.width=wid;win.node.style.height=hei;win.node.style.left=l;win.node.style.top=t};
 /* ---- 감염 ---- */
 function infect(){if(S.infected)return false;S.infected=true;infTicks=0;save();toast({title:'컴퓨터가 이상합니다',text:'파일을 받은 뒤부터 컴퓨터가 느려졌습니다. 바이러스 도우미로 검사해 보세요.',icon:'warn',ms:12000,onClick:()=>X.openApp('antivirus')});return true}
 /* ---- 인터넷 창 덧붙임 ---- */
 const ieOpen=()=>ie.ui&&X.windows.get('browser')===ie.ui.win;
 function noticeKind(){return ie.notice&&ie.notice.kind}
 function rebuild(){if(!ieOpen())return;const ui=ie.ui;if(ie.extra)ie.extra.remove();const box=E('div','xp-ie-extra');let rows=0;
  for(let i=0;i<S.bars;i++){const t=E('div','xp-ie-tb');t.append(E('b','',BARS[i]),E('span','','검색'),E('span','','이벤트'),E('span','','바로가기'));box.append(t);rows++}
  if(ie.notice){const kind=ie.notice.kind;const n=B(kind==='activex'?'이 사이트에서 "무료 바탕화면 도우미" 프로그램을 설치하려고 합니다. 여기를 눌러 옵션을 보세요.':'팝업이 차단되었습니다 ('+blocked+'건). 허용하려면 여기를 누르세요.',kind==='activex'?askActiveX:allowBlocked,'xp-ie-bar');n.setAttribute('aria-label',kind==='activex'?'프로그램 설치 알림':'차단된 팝업 알림');box.append(n);rows++}
  ie.extra=box;ui.win.content.insertBefore(box,ui.page);ui.page.style.height='calc(100% - '+(136+rows*(rows?24:0))+'px)'}
 function popupBtn(){if(!ieOpen())return;const ui=ie.ui;if(ie.pb)ie.pb.remove();const b=B('팝업 차단: '+(S.popupBlock?'켬':'끔'),()=>{S.popupBlock=!S.popupBlock;save();popupBtn();toast({title:'팝업 차단',text:S.popupBlock?'이제 팝업 광고를 막습니다.':'팝업 차단이 꺼졌습니다. 광고가 뜰 수 있습니다.',icon:'info',ms:3500})},'xp-ie-pb');b.setAttribute('aria-label','팝업 차단 켜고 끄기');ie.pb=b;(ui.tools||ui.status).append(b)}
 function askActiveX(){if(!X.ui)return;const box=E('div');box.append(E('p','','이 소프트웨어를 설치하시겠습니까?'),E('p','xp-note','이름: 무료 바탕화면 도우미'),E('p','xp-note','게시자: 확인할 수 없음'),E('p','xp-note','인터넷의 파일은 유용할 수 있지만, 이 파일 형식은 컴퓨터에 문제를 일으킬 수 있습니다. 신뢰할 수 있는 게시자의 소프트웨어만 설치하십시오.'));
  X.ui.dialog({title:'보안 경고',node:box,icon:'warn',buttons:[['설치(I)',installActiveX],['설치 안 함(D)',()=>{ie.notice=null;rebuild()},'xp-default']]})}
 function installActiveX(){ie.notice=null;if(S.bars<3){S.bars++;save();toast({title:'프로그램 설치',text:'"무료 바탕화면 도우미"가 설치되었습니다. 인터넷 창에 새 도구 모음이 생겼습니다.',icon:'info',ms:7000})}if(!S.realtime)infect();rebuild()}
 function allowBlocked(){blocked=0;ie.notice=null;rebuild();openPopup(true)}
 /* ---- 팝업 광고 ---- */
 const popups=()=>[...X.windows.keys()].filter(k=>k.startsWith('popup-'));
 function openPopup(force){if(!force&&S.popupBlock){blocked++;if(ieOpen()&&noticeKind()!=='activex'){ie.notice={kind:'popup'};rebuild()}return false}if(popups().length>=3)return false;
  const ad=ADS[adNo%ADS.length],id='popup-'+(++adNo);const win=X.windowFor(id,'광고 - Microsoft Internet Explorer');small(win,'min(330px,92%)','min(250px,80%)',(8+adNo*7%40)+'%',(12+adNo*5%30)+'%');win.content.replaceChildren();
  const box=E('div','xp-ad');box.append(E('b','xp-ad-t',ad.title),E('strong','xp-ad-big',ad.big),E('p','',ad.text),B(ad.btn,()=>{if(!X.ui)return;X.ui.dialog({title:'광고 안내',text:ad.fake,icon:'info',buttons:ad.opens?[['바이러스 도우미 열기',()=>X.openApp(ad.opens)],['닫기',()=>X.closeWin(id)]]:[['닫기',()=>X.closeWin(id)]]})},'xp-ad-btn'),B('닫기',()=>X.closeWin(id),'xp-ad-close'));win.content.append(box);return true}
 /* ---- 바이러스 도우미 ---- */
 function avDraw(){if(!av.win||X.windows.get('antivirus')!==av.win)return;const win=av.win;win.content.replaceChildren();const wrap=E('div','xp-av'),head=E('div','xp-av-head');head.append(E('i','xp-av-shield'),E('div','',''));head.lastElementChild.append(E('b','','바이러스 도우미 2006'),E('span','',S.infected||S.bars?'위험 요소가 있을 수 있습니다':'컴퓨터가 안전합니다'));
  const info=E('div','xp-av-info');av.rt=B('실시간 감시: '+(S.realtime?'켬':'끔'),()=>{S.realtime=!S.realtime;save();if(!S.realtime)toast({title:'바이러스 도우미',text:'실시간 감시가 꺼졌습니다. 컴퓨터가 위험할 수 있습니다.',icon:'warn',ms:6000});avDraw()},'xp-mini'+(S.realtime?' on':''));
  info.append(E('p','','엔진 버전: '+av.ver),E('p','','마지막 검사: '+av.last),av.rt);
  av.bar=E('div','xp-av-bar');const fill=E('i');fill.style.width=(av.phase==='idle'?0:Math.min(100,av.p/(av.phase==='scan'?10:6)*100))+'%';av.bar.append(fill);av.fill=fill;av.txt=E('p','xp-note',av.phase==='scan'?'검사 중: '+SCAN_FILES[av.p%SCAN_FILES.length]:av.phase==='update'?'엔진을 내려받는 중입니다...':'');av.res=E('p','xp-av-res',av.result||'');
  const row=E('div','xp-row');row.append(B('검사 시작',startScan,'xp-dialog-btn'),B('엔진 업데이트',startUpdate,'xp-dialog-btn'));
  wrap.append(head,info,av.bar,av.txt,av.res,row);win.content.append(wrap)}
 function startScan(){if(av.phase!=='idle')return;av.phase='scan';av.p=0;av.result='';avDraw()}
 function startUpdate(){if(av.phase!=='idle')return;av.phase='update';av.p=0;av.result='';avDraw()}
 function avTick(){if(av.phase==='idle')return;if(!av.win||X.windows.get('antivirus')!==av.win){av.phase='idle';return}av.p++;const total=av.phase==='scan'?10:6;
  if(av.p>=total){if(av.phase==='scan'){const found=(S.infected?1:0)+S.bars;av.last=clock();if(found){S.infected=false;S.bars=0;save();av.result='검사 완료: 위험 요소 '+found+'개를 찾아 치료했습니다.';toast({title:'바이러스 도우미',text:'위험 요소 '+found+'개를 치료했습니다.',icon:'shield',ms:6000});rebuild()}else av.result='검사 완료: 위험 요소가 없습니다.'}else{av.ver='2006.05.30.02';av.result='엔진을 2006.05.30.02 버전으로 업데이트했습니다.'}av.phase='idle';av.p=0;avDraw();return}
  if(av.fill)av.fill.style.width=Math.min(100,av.p/total*100)+'%';if(av.txt)av.txt.textContent=av.phase==='scan'?'검사 중: '+SCAN_FILES[av.p%SCAN_FILES.length]:'엔진을 내려받는 중입니다... '+Math.round(av.p/total*100)+'%'}
 function openAV(){const had=X.windows.get('antivirus');const win=X.windowFor('antivirus','바이러스 도우미 2006');if(had&&av.win===win){avDraw();return win}av.win=win;small(win,'min(400px,96%)','min(420px,94%)','20%','8%');avDraw();return win}
 /* ---- 마당공유 ---- */
 const active=()=>files.filter(f=>f.state==='down').length;
 function download(f){if(f.state==='down'||f.state==='done')return false;if(active()>=3){toast({title:'마당공유',text:'동시에 받을 수 있는 파일은 3개까지입니다.',icon:'warn',ms:4000});return false}f.state='down';f.p=0;p2pDraw();return true}
 function finish(f){f.p=100;if(f.risky){if(S.realtime){f.state='blocked';toast({title:'바이러스 도우미',text:'위험한 파일을 차단했습니다: '+f.name,icon:'shield',ms:8000,onClick:()=>X.openApp('antivirus')})}else{f.state='done';toast({title:'마당공유',text:'받기 완료: '+f.name,icon:'info',ms:4000});infect()}}else{f.state='done';toast({title:'마당공유',text:'받기 완료: '+f.name,icon:'info',ms:4500})}p2pDraw()}
 function p2pDraw(){if(!p2pWin||X.windows.get('p2p')!==p2pWin||!p2pBox)return;p2pBox.replaceChildren();for(const k of Object.keys(refs))delete refs[k];const q=p2pQuery.trim();const list=files.filter(f=>!q||f.name.includes(q));
  const head=E('div','xp-p2p-row head');head.append(E('span','','파일 이름'),E('span','','크기'),E('span','','상태'));p2pBox.append(head);
  if(!list.length)p2pBox.append(E('p','xp-empty','검색 결과가 없습니다.'));
  for(const f of list){const row=E('div','xp-p2p-row'+(f.risky?' risky':''));row.dataset&&(row.dataset.file=f.id);const nm=E('span','nm');nm.append(E('b','',f.name),E('small','',f.note));let st;
   if(f.state==='idle')st=B('받기',()=>download(f),'xp-mini');else if(f.state==='down'){st=E('span','xp-p2p-pg');const bar=E('i'),pct=E('em','',Math.round(f.p)+'%');bar.style.width=Math.round(f.p)+'%';st.append(bar,pct);refs[f.id]={bar,pct}}else if(f.state==='blocked')st=E('span','xp-p2p-bad','차단됨');else st=E('span','xp-p2p-ok','완료');
   row.append(nm,E('span','',f.mb>=1?f.mb.toFixed(1)+'MB':Math.round(f.mb*1000)+'KB'),st);p2pBox.append(row)}}
 function p2pProgress(){if(!p2pWin||X.windows.get('p2p')!==p2pWin||!p2pBox)return;for(const f of files){const r=refs[f.id];if(f.state==='down'&&r&&r.bar){r.bar.style.width=Math.round(f.p)+'%';r.pct.textContent=Math.round(f.p)+'%'}}}
 function openP2P(){const had=X.windows.get('p2p');const win=X.windowFor('p2p','마당공유 - 우리동네 파일 나눔',true);if(had&&p2pWin===win&&p2pBox)return win;p2pWin=win;win.content.replaceChildren();
  const wrap=E('div','xp-p2p'),form=E('form','xp-p2p-form'),input=E('input');input.type='text';input.maxLength=20;input.setAttribute('aria-label','파일 검색어');input.placeholder='찾을 파일 이름';form.append(input,B('검색',()=>{},'xp-mini'));form.lastElementChild.type='submit';form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();p2pQuery=input.value;p2pDraw()});
  p2pBox=E('div','xp-p2p-list');wrap.append(E('p','xp-p2p-warn','※ 이름이 그럴듯한 exe, scr 파일은 일단 의심하세요. 열었다가 바탕화면에 이상한 것이 생겨도 마당공유는 모릅니다 ^^;'),form,p2pBox);win.content.append(wrap);p2pQuery='';p2pDraw();return win}
 /* ---- 시간 ---- */
 function tick(){if(!alive)return;avTick();let any=false;for(const f of files)if(f.state==='down'){f.p+=100/f.dur;any=true;if(f.p>=100)finish(f)}if(any)p2pProgress();
  if(S.infected){infTicks++;if(infTicks%40===0)openPopup(false)}}
 function onNavigate(){navCount++;if(!ieOpen())return;
  if(navCount%4===0||(S.infected&&navCount%2===0))openPopup(false);
  if((navCount===3||(navCount>3&&(navCount-3)%6===0))&&S.bars<3&&noticeKind()!=='activex'){ie.notice={kind:'activex'};rebuild()}}
 function ieHook(ui){ie.ui=ui;ie.extra=null;ie.pb=null;popupBtn();if(S.bars||ie.notice)rebuild()}
 const OPEN={antivirus:openAV,p2p:openP2P};
 return{ids:['antivirus','p2p'],has:id=>!!OPEN[id],open:id=>OPEN[id]&&OPEN[id](),tick,ie:ieHook,onNavigate,refreshBars:rebuild,
  reset(){av.phase='idle';av.win=null;p2pWin=null;p2pBox=null;ie.ui=null;ie.extra=null;ie.notice=null;ie.pb=null;navCount=0;for(const f of files){f.state='idle';f.p=0}},destroy(){alive=false},
  popup:openPopup,infect,download:id=>{const f=files.find(x=>x.id===id);return f?download(f):false},scan:startScan,
  state:()=>({infected:S.infected,bars:S.bars,realtime:S.realtime,popupBlock:S.popupBlock,popups:popups().length,notice:noticeKind()||'',navCount,blocked,av:av.phase,files:files.map(f=>f.state+':'+Math.round(f.p))})}}
w.XPNet={attach,FILES,ADS,BARS,SPEED};
})(window);
