/* A91: 프로그램 받기와 설치 마법사.
   인터넷 자료실에서 프로그램을 받으면 서버 대기, 파일 다운로드 보안 경고, 파일이 날아가는 다운로드 창, 바탕화면에 생긴 설치 파일,
   설치 마법사, 시작 메뉴와 바탕화면 바로가기 순서로 이어진다. 지금은 바탕화면 부수기 하나만 받을 수 있다.
   모두 이 게임 안에서만 도는 흉내이고 실제로 파일을 받거나 컴퓨터에 설치하지 않는다. 그림 파일과 소리는 쓰지 않는다. */
(function(w){'use strict';
const PROGRAMS={
 smash:{app:'desksmash',name:'바탕화면 부수기',ver:'1.0',file:'DeskBreaker_setup.exe',host:'www.jaryo-mart.net',mb:1.4,need:'1.9MB',color:'#c0392b',mark:'쾅',dir:'C:\\Program Files\\DeskBreaker',
  license:['바탕화면 부수기 사용권 계약','','제1조 이 프로그램은 컴퓨터 화면을 때려 부수는 기분을 내는 스트레스 해소용 장난감입니다.','제2조 화면은 진짜로 부서지지 않습니다. 진짜 모니터를 때리면 모니터 값은 본인이 물어야 합니다.','제3조 제작자는 이 프로그램을 쓰다가 생긴 후련함, 허탈함, 옆자리 사람의 놀란 표정에 대해 책임지지 않습니다.','제4조 이 프로그램을 무단으로 퍼 나르시는 것은 환영합니다. 단, 제작자 이름은 지우지 마세요.','제5조 동의하지 않으면 설치할 수 없습니다. 동의하지 않는 분은 그냥 바탕화면을 참고 보세요.'],
  files:['deskbreaker.exe','hammer.dat','crack01.dll','crack02.dll','soot.bmp','readme.txt'],
  steps:['파일 복사 중: ','파일 복사 중: ','파일 복사 중: ','파일 복사 중: ','레지스트리에 등록하는 중...','시작 메뉴 바로가기를 만드는 중...']}
};
const KB=n=>Math.round(n).toLocaleString('ko-KR')+'KB';
function attach(X){
 const {E,B,save,saved}=X;
 const S=w.XPShell?w.XPShell.xs(X):(saved.xp=saved.xp&&typeof saved.xp==='object'&&!Array.isArray(saved.xp)?saved.xp:{});
 for(const k of ['smash','setupFile'])if(typeof S[k]!=='boolean')S[k]=false;
 const timers=[];let alive=true,token=0,dl=null,wiz=null,queue=null;const nodes={setup:null,app:null,start:null};
 const later=(fn,ms)=>{const t=w.setTimeout(()=>{if(alive)fn()},ms);timers.push(t);return t};
 const toast=o=>X.ui&&X.ui.toast(o);
 const menuAt=(e,items)=>{if(!X.ui)return;e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();const r=X.desk.getBoundingClientRect?X.desk.getBoundingClientRect():{left:0,top:0};X.ui.menu((e.clientX||40)-r.left,(e.clientY||40)-r.top,items)};
 const small=(win,wd,ht,l,t)=>{win.node.classList.add('xp-small');win.node.style.width=wd;win.node.style.height=ht;win.node.style.left=l;win.node.style.top=t};
 const live=(id,win)=>alive&&X.windows.get(id)===win;
 /* ---- 바탕화면 바로가기와 시작 메뉴 ---- */
 function refresh(){
  const p=PROGRAMS.smash;
  if(S.setupFile&&!nodes.setup){const b=X.shortcut('setup',p.file,()=>runInstaller('smash'),'#2c6fb7','설치');
   if(b){b.classList.add('xp-useritem','xp-setupfile');b.addEventListener('contextmenu',e=>menuAt(e,[['열기(O)',()=>runInstaller('smash'),{bold:true}],'-',['삭제(D)',()=>{if(X.ui)X.ui.dialog({title:'파일 삭제 확인',text:'"'+p.file+'" 파일을 삭제하시겠습니까?',icon:'ask',buttons:[['예',()=>{S.setupFile=false;save();refresh()}],['아니요']]})}]]))}nodes.setup=b}
  else if(!S.setupFile&&nodes.setup){nodes.setup.remove();nodes.setup=null}
  if(S.smash&&!nodes.app){const b=X.shortcut('smash',p.name,()=>X.openApp(p.app),p.color,p.mark);
   if(b){b.classList.add('xp-useritem');b.addEventListener('contextmenu',e=>menuAt(e,[['열기(O)',()=>X.openApp(p.app),{bold:true}],'-',['프로그램 제거(U)',()=>uninstall('smash')]]))}nodes.app=b}
  else if(!S.smash&&nodes.app){nodes.app.remove();nodes.app=null}
  if(S.smash&&!nodes.start){const btn=B(p.name,()=>{X.startMenu.hidden=true;X.openApp(p.app)});const kids=Array.from(X.startMenu.children),ap=kids.find(c=>c.classList&&c.classList.contains('xp-ap-btn'))||kids[kids.length-1]||null;X.startMenu.insertBefore(btn,ap);nodes.start=btn}
  else if(!S.smash&&nodes.start){nodes.start.remove();nodes.start=null}
  if(X.shell&&X.shell.buildFly)X.shell.buildFly()}
 function uninstall(id){const p=PROGRAMS[id];if(!X.ui||!p)return;X.ui.dialog({title:'프로그램 제거',text:'"'+p.name+'" 을(를) 컴퓨터에서 제거하시겠습니까?',icon:'ask',buttons:[['예',()=>{S.smash=false;save();X.closeWin('desksmash');if(w.DeskSmash)w.DeskSmash.close();refresh();toast({title:'프로그램 제거',text:p.name+'이(가) 제거되었습니다.',icon:'info',ms:4000})}],['아니요']]})}
 /* ---- 받기: 서버 대기, 보안 경고, 다운로드 창 ---- */
 function download(id,o){
  const p=PROGRAMS[id];if(!p||!X.ui)return false;
  if(dl||queue){toast({title:'파일 다운로드',text:'이미 다운로드가 진행 중입니다.',icon:'warn',ms:3500});return false}
  const my=++token;let left=6;
  const box=E('div','xp-queue-box'),msg=E('p','','현재 다운로드 서버에 접속자가 많아 대기 중입니다.'),pos=E('p','xp-queue-pos',''),bar=E('div','xp-prog'),fill=E('i');bar.append(fill);
  box.append(msg,pos,bar,E('small','xp-note','잠시만 기다려 주세요. 이 창을 닫으면 대기가 취소됩니다.'));
  const show=()=>{pos.textContent='대기 순번: '+left+'번째 · 예상 대기 시간 00:'+String(left*1+2).padStart(2,'0');fill.style.width=Math.round((6-left)/6*100)+'%'};show();
  const cancel=()=>{if(queue&&queue.my===my)queue=null};
  queue={my,dlg:X.ui.dialog({title:'다운로드 대기 - '+p.file,node:box,icon:'info',buttons:[['취소',cancel]],onCancel:cancel})};
  const step=()=>{if(!queue||queue.my!==my)return;left--;if(left>0){show();later(step,650);return}
   const q=queue;queue=null;q.dlg.close();ask(p,id,o||{})};
  later(step,900);return true}
 function ask(p,id,o){
  const box=E('div','xp-dlask');box.append(E('p','','이 파일을 열거나 저장하시겠습니까?'));
  const info=E('div','xp-dlask-info');for(const t of ['이름: '+p.file,'종류: 응용 프로그램, '+p.mb.toFixed(2)+'MB','보낸 사람: '+p.host])info.append(E('p','',t));box.append(info,E('small','xp-note','인터넷의 파일은 유용하지만 일부 파일은 컴퓨터에 해를 끼칠 수도 있습니다. 보낸 사람을 신뢰하지 않으면 이 소프트웨어를 열거나 저장하지 마십시오.'));
  X.ui.dialog({title:'파일 다운로드 - 보안 경고',node:box,icon:'warn',buttons:[['열기(O)',()=>transfer(p,id,'open')],['저장(S)',()=>transfer(p,id,'save')],['취소']]})}
 function transfer(p,id,mode){
  const key='dl-'+id,my=++token;const win=X.windowFor(key,p.file+' 다운로드 중');small(win,'min(420px,96%)','min(300px,92%)','12%','10%');
  const total=p.mb*1024;let got=0,closeAfter=false,finished=false;dl={my,key};
  const head=E('p','xp-dl-head','다운로드 중...'),fly=E('div','xp-fly'),name=E('p','xp-dl-name',p.file+' - '+p.host),bar=E('div','xp-prog'),fill=E('i'),info=E('p','xp-dl-info',''),speed=E('p','xp-dl-speed',''),foot=E('div','xp-dialog-foot');bar.append(fill);
  fly.append(E('b','xp-fly-from'),E('i','sheet s1'),E('i','sheet s2'),E('i','sheet s3'),E('b','xp-fly-to'));
  const lab=E('label','xp-dl-check'),chk=E('input');chk.type='checkbox';chk.addEventListener('change',()=>{closeAfter=!!chk.checked});lab.append(chk,E('span','','다운로드가 완료되면 이 대화 상자 닫기(C)'));
  const btnOpen=B('열기(O)',()=>{if(finished)finish('open')},'xp-dialog-btn'),btnDir=B('폴더 열기',()=>{if(finished)toast({title:'다운로드',text:'파일은 바탕 화면에 저장되어 있습니다.',icon:'info',ms:3500})},'xp-dialog-btn'),btnCancel=B('취소',()=>cancelFn(),'xp-dialog-btn');let cancelFn=()=>{};
  btnOpen.disabled=true;btnDir.disabled=true;foot.append(btnOpen,btnDir,btnCancel);
  win.content.replaceChildren(head,fly,name,bar,info,speed,lab,foot);
  cancelFn=()=>{if(!dl||dl.my!==my)return;dl=null;token++;X.closeWin(key);toast({title:'파일 다운로드',text:'다운로드를 취소했습니다.',icon:'info',ms:3500})};
  const finish=how=>{
   if(how==='open'){dl=null;X.closeWin(key);runInstaller(id);return}
   dl=null;S.setupFile=true;save();refresh();
   if(closeAfter){X.closeWin(key);toast({title:'다운로드 완료',text:p.file+' 파일이 바탕 화면에 저장되었습니다.',icon:'info',ms:6000,onClick:()=>runInstaller(id)});return}
   toast({title:'다운로드 완료',text:p.file+' 파일이 바탕 화면에 저장되었습니다.',icon:'info',ms:6000})};
  const step=()=>{
   if(!dl||dl.my!==my)return;if(!live(key,win)){dl=null;token++;toast({title:'파일 다운로드',text:'다운로드를 취소했습니다.',icon:'info',ms:3500});return}
   const rate=150+Math.round(60*Math.sin(got/170)+20*Math.sin(got/37));got=Math.min(total,got+rate*.16);const pc=Math.floor(got/total*100);
   fill.style.width=pc+'%';head.textContent=pc>=100?'다운로드 완료':'다운로드 중... '+pc+'%';
   info.textContent=KB(got)+' / '+KB(total)+' 받음';const rest=Math.max(0,Math.ceil((total-got)/rate));speed.textContent='전송 속도: '+rate+'KB/초 · 남은 시간: 00:'+String(rest).padStart(2,'0')+(mode==='open'?' · 받은 뒤 바로 실행':'');
   if(got<total){later(step,160);return}
   finished=true;fly.classList.add('done');
   if(mode==='open'){finish('open');return}
   btnOpen.disabled=false;btnDir.disabled=false;btnCancel.textContent='닫기(C)';cancelFn=()=>X.closeWin(key);finish('save')};
  later(step,160);return win}
 /* ---- 설치 마법사 ---- */
 function runInstaller(id){
  const p=PROGRAMS[id];if(!p||!X.ui)return null;const key='setup-'+id;
  const win=X.windowFor(key,p.name+' '+p.ver+' 설치');small(win,'min(500px,98%)','min(380px,94%)','14%','8%');
  const my=++token;let step=0,agree=false,pct=0,runNow=true;wiz={my,step:0};
  const alive2=()=>wiz&&wiz.my===my&&live(key,win);
  const quit=()=>{if(wiz&&wiz.my===my)wiz=null;token++;X.closeWin(key)};
  const askQuit=()=>X.ui.dialog({title:'설치',text:'아직 설치가 끝나지 않았습니다. 지금 종료하면 프로그램이 설치되지 않습니다. 정말 종료하시겠습니까?',icon:'ask',buttons:[['예',quit],['아니요']]});
  function draw(){
   if(!alive2())return;wiz.step=step;
   const side=E('div','xp-wiz-side'),main=E('div','xp-wiz-main'),foot=E('div','xp-wiz-foot');side.append(E('b','','설치'),E('span','',p.name),E('small','','Ver '+p.ver));
   const nav=(back,next,nextLabel,cancelOk)=>{const bb=B('< 이전(B)',()=>{step--;draw()},'xp-dialog-btn'),nb=B(nextLabel||'다음(N) >',next,'xp-dialog-btn'),cb=B('취소',()=>askQuit(),'xp-dialog-btn');bb.disabled=!back;nb.disabled=!next;cb.disabled=cancelOk===false;foot.append(bb,nb,cb);return {bb,nb,cb}};
   if(step===0){main.append(E('h3','',p.name+' 설치 마법사'),E('p','',p.name+' '+p.ver+' 설치 마법사에 오신 것을 환영합니다.'),E('p','','이 마법사는 컴퓨터에 '+p.name+' 을(를) 설치합니다. 계속하기 전에 실행 중인 다른 프로그램을 모두 닫으시기 바랍니다.'),E('p','xp-note','계속하려면 [다음]을 누르십시오.'));nav(false,()=>{step=1;draw()})}
   else if(step===1){const ta=E('textarea','xp-wiz-license');ta.readOnly=true;ta.value=p.license.join('\n');ta.setAttribute('aria-label','사용권 계약');const r1=E('label','xp-wiz-radio'),i1=E('input'),r2=E('label','xp-wiz-radio'),i2=E('input');i1.type='radio';i2.type='radio';i1.name=i2.name='agree';i1.checked=agree;i2.checked=!agree;
    main.append(E('h3','','사용권 계약'),E('p','','다음 계약 내용을 주의 깊게 읽어 보십시오.'),ta);r1.append(i1,E('span','','계약에 동의합니다(A)'));r2.append(i2,E('span','','동의하지 않습니다(D)'));main.append(r1,r2);const n=nav(true,()=>{step=2;draw()});n.nb.disabled=!agree;
    i1.addEventListener('change',()=>{agree=true;n.nb.disabled=false});i2.addEventListener('change',()=>{agree=false;n.nb.disabled=true})}
   else if(step===2){const dir=E('input','xp-wiz-path');dir.type='text';dir.value=p.dir;dir.readOnly=true;dir.setAttribute('aria-label','설치 위치');main.append(E('h3','','설치 위치 선택'),E('p','',p.name+' 을(를) 설치할 폴더입니다.'),dir,E('p','','필요한 디스크 공간: '+p.need),E('p','','사용 가능한 디스크 공간: 8.4GB'),E('p','xp-note','설치를 시작하려면 [설치]를 누르십시오.'));nav(true,()=>{step=3;pct=0;draw();copy()},'설치(I)')}
   else if(step===3){const bar=E('div','xp-prog'),fill=E('i'),line=E('p','xp-wiz-line','');bar.append(fill);fill.style.width=pct+'%';draw.fill=fill;draw.line=line;main.append(E('h3','','설치 중'),E('p','','잠시 기다려 주십시오. '+p.name+' 을(를) 설치하고 있습니다.'),bar,line);nav(false,null,'설치 중...')}
   else{const cb=E('label','xp-wiz-radio'),ck=E('input');ck.type='checkbox';ck.checked=runNow;ck.addEventListener('change',()=>{runNow=!!ck.checked});cb.append(ck,E('span','',p.name+' 지금 실행(R)'));main.append(E('h3','',p.name+' 설치 마법사를 마칩니다'),E('p','',p.name+' 설치를 완료했습니다. 바탕 화면과 시작 메뉴에서 실행할 수 있습니다.'),cb,E('p','xp-note','[마침]을 눌러 마법사를 닫으십시오.'));const n=nav(false,()=>{const go=runNow;wiz=null;token++;X.closeWin(key);if(go)X.openApp(p.app)},'마침');n.cb.disabled=true}
   const wz=E('div','xp-wiz');wz.append(side,main);win.content.replaceChildren(wz,foot)}
  function copy(){
   const names=p.files,msgs=p.steps;let i=0;
   const go=()=>{if(!alive2()||step!==3)return;pct=Math.min(100,pct+(pct<70?9:pct<73?1:8));if(draw.fill)draw.fill.style.width=pct+'%';
    const k=Math.min(msgs.length-1,Math.floor(pct/100*msgs.length));if(draw.line)draw.line.textContent=msgs[k]+(k<4?p.dir+'\\'+names[Math.min(names.length-1,k)]:'');
    if(pct>=100){S.smash=true;save();refresh();step=4;draw();toast({title:'새 프로그램 설치',text:p.name+'이(가) 설치되었습니다. 바탕 화면의 바로가기를 확인하세요.',icon:'info',ms:6000});return}
    later(go,pct>=70&&pct<73?1300:420);i++};
   later(go,500)}
  draw();return win}
 const api={ids:['setup-smash'],has:id=>id==='setup-smash',open:id=>id==='setup-smash'&&runInstaller('smash'),download,runInstaller,uninstall,refresh,programs:PROGRAMS,
  state:()=>({setupFile:S.setupFile,smash:S.smash,downloading:!!dl,queueing:!!queue,wizard:wiz?wiz.step:-1}),
  reset(){token++;dl=null;wiz=null;if(queue){try{queue.dlg.close()}catch(_){}queue=null}},
  destroy(){alive=false;token++;for(const t of timers)w.clearTimeout(t)}};
 X.setup=api;refresh();return api}
w.XPSetup={attach,PROGRAMS};
})(window);
