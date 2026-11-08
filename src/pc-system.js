/* A88 pc-system.js : PC방 컴퓨터의 내 컴퓨터 창, 시스템 등록 정보, 장치 관리자, 프로그램 추가/제거, 내 네트워크 환경,
   내 문서의 Incoming 폴더와 Windows 그림 및 팩스 뷰어. A93: 그림판에서 저장한 그림이 내 그림 폴더에 보이고, 그림을 바탕 화면 배경으로 설정할 수 있다.
   xp-desktop.js의 openApp('computer')가 PCSystem.open(ctx)를 부른다. 이 파일이 없으면 이전의 간단한 내 컴퓨터 창이 열린다.
   사양 문구는 아래 specFor() 한 곳에서 정한다. 자리 번호가 홀수이면 160GB, 짝수이면 80GB 하드디스크가 달려 있다.
   Incoming 폴더는 서버의 /api/incoming 목록을 읽는다. assets/pc-desktop/incoming 에 그림 파일을 넣으면 따로 고칠 것 없이 보인다. */
(function(w){'use strict';
const VERSION='A93';
const NOW_LABEL='2006-05-30 오후 4:32';
const RESTRICT='이 작업은 컴퓨터에 적용된 제한 때문에 취소되었습니다. 시스템 관리자에게 문의하십시오.';

/* ───────── 사양 ───────── */
function seatOf(options){const n=Number(options&&options.seat);return Number.isFinite(n)&&n>0?Math.floor(n):12}
function gb(n){if(n>=100)return Math.floor(n)+'GB';return(n>=10?n.toFixed(1):n.toFixed(2))+'GB'}
function specFor(seat){
 const big=seat%2===1;
 return{
  seat,
  pcName:'PC'+String(seat).padStart(2,'0'),
  osLines:['Microsoft Windows XP','Professional','버전 2002','Service Pack 2'],
  cpu:'Intel(R) Pentium(R) 4 CPU 3.20GHz',
  ram:'512 MB of RAM',
  gpu:'NVIDIA GeForce 6600 GT',
  vram:'비디오 메모리 : 256MB',
  board:'Intel 945P',
  hdd:big?'160GB SATA HDD':'80GB SATA HDD',
  hddModel:big?'WDC WD1600JD-75HBB0':'WDC WD800JD-75MSA3',
  drives:big
   ?[{letter:'C',total:29.3,free:11.4},{letter:'D',total:119.7,free:54.8}]
   :[{letter:'C',total:24.4,free:9.82},{letter:'D',total:50.1,free:21.3}]
 };
}

/* ───────── 파일 목록 ───────── */
const KINDS={txt:'텍스트 문서',hwp:'한글 문서',jpg:'JPEG 이미지',jpeg:'JPEG 이미지',gif:'GIF 이미지',png:'PNG 이미지',bmp:'BMP 이미지',webp:'WEBP 이미지',mp3:'MP3 형식 사운드',avi:'비디오 클립',exe:'응용 프로그램',xls:'Microsoft Excel 워크시트',ppt:'Microsoft PowerPoint 프레젠테이션',zip:'압축(ZIP) 폴더',lnk:'바로 가기',ini:'구성 설정'};
const F=(n,size,date,act)=>({n,t:'file',size,date,act});
const D=(n,kids,date,act)=>({n,t:'folder',kids,date,act});
function tree(){
 const mydocs=D('내 문서',[
  D('내 그림',[F('DSC00231.jpg','1,048KB','2006-05-21 오후 3:10'),F('DSC00232.jpg','996KB','2006-05-21 오후 3:11'),F('체육대회.jpg','412KB','2006-05-27 오전 11:02'),F('증명사진.jpg','86KB','2006-04-03 오후 5:47')],'2006-05-27 오전 11:02'),
  D('내 음악',[F('좋아하는 노래 01.mp3','3,412KB','2006-05-14 오후 9:30'),F('좋아하는 노래 02.mp3','4,096KB','2006-05-14 오후 9:34'),F('bgm_test.mp3','1,870KB','2006-05-02 오후 1:15')],'2006-05-14 오후 9:34'),
  D('Incoming',[],'2006-05-30 오후 4:02','incoming'),
  D('받은 파일',[F('알집_설치.exe','6,512KB','2006-05-09 오후 6:20'),F('flash8_setup.exe','1,224KB','2006-05-09 오후 6:41'),F('시간표.xls','21KB','2006-03-02 오전 8:40')],'2006-05-09 오후 6:41'),
  F('오늘 할 일.txt','1KB','2006-05-30 오후 4:20','notepad'),
  F('중간고사 정리.hwp','28KB','2006-05-12 오후 10:05'),
  F('방학계획표.xls','19KB','2006-05-25 오후 8:12')
 ],'2006-05-30 오후 4:20');
 mydocs.path='내 문서';
 const shared=D('공유 문서',[
  D('공유 그림',[F('Sample.jpg','43KB','2004-08-04 오후 12:00')],'2004-08-04 오후 12:00'),
  D('공유 음악',[F('Beethoven\'s Symphony No. 9 (Scherzo).wma','1,226KB','2004-08-04 오후 12:00')],'2004-08-04 오후 12:00')
 ],'2004-08-04 오후 12:00');
 shared.path='공유 문서';
 const c=D('C:',[
  D('Documents and Settings',null,'2006-03-18 오전 10:20','lock'),
  D('Program Files',null,'2006-03-18 오전 10:41','lock'),
  D('WINDOWS',null,'2006-03-18 오전 10:08','lock'),
  D('게임',null,'2006-05-30 오전 9:00','games')
 ],'2006-03-18 오전 10:08');
 const d=D('D:',[
  D('다운로드',[F('dx9c_setup.exe','32,614KB','2006-05-18 오후 7:03'),F('곰플레이어_설치.exe','4,430KB','2006-05-18 오후 7:12'),F('V3_업데이트.exe','5,806KB','2006-05-29 오전 9:48')],'2006-05-29 오전 9:48'),
  D('음악',[F('bgm01.mp3','3,712KB','2006-04-11 오후 2:00'),F('bgm02.mp3','3,420KB','2006-04-11 오후 2:03'),F('bgm03.mp3','4,108KB','2006-04-11 오후 2:05'),F('bgm04.mp3','2,950KB','2006-04-11 오후 2:08')],'2006-04-11 오후 2:08'),
  D('사진',[F('DSC00101.jpg','1,102KB','2006-05-06 오후 1:22'),F('DSC00102.jpg','1,087KB','2006-05-06 오후 1:23'),F('DSC00103.jpg','1,134KB','2006-05-06 오후 1:23'),F('소풍.zip','12,408KB','2006-05-06 오후 9:30')],'2006-05-06 오후 9:30'),
  D('동영상',[F('영상001.avi','28,410KB','2006-05-20 오후 4:44'),F('영상002.avi','31,022KB','2006-05-20 오후 4:51')],'2006-05-20 오후 4:51'),
  D('게임 설치 파일',null,'2006-03-18 오후 1:05','lock')
 ],'2006-03-18 오후 1:05');
 return{mydocs,shared,c,d};
}
function decorate(node,parent){
 if(parent)node.path=(/\\$/.test(parent.path)?parent.path:parent.path+'\\')+node.n;
 if(node.kids)for(const k of node.kids)decorate(k,node);
}
function kindOf(n){
 if(n.t==='folder')return'파일 폴더';
 const m=/\.([a-z0-9]+)$/i.exec(n.n);const ext=m?m[1].toLowerCase():'';
 return KINDS[ext]||(ext?ext.toUpperCase()+' 파일':'파일');
}
function iconOf(n){
 if(n.drive)return n.drive==='E'?'dvd':'hdd';
 return n.t==='folder'?'folder':'file';
}

/* ───────── Incoming 폴더와 그림 뷰어 (A88) ───────── */
const INCOMING_URL='api/incoming';
function fakeDate(name){
 /* 파일 이름으로 정한 2006년 5월의 날짜. 같은 파일은 언제 열어도 같은 날짜가 보인다. */
 const h=hashOf(String(name));
 const day=8+(h%22),hour24=(h>>>5)%24,min=(h>>>10)%60;
 const ap=hour24<12?'오전':'오후',h12=hour24%12===0?12:hour24%12;
 const d=day===30&&(hour24>16||(hour24===16&&min>30))?29:day;
 return '2006-05-'+String(d).padStart(2,'0')+' '+ap+' '+h12+':'+String(min).padStart(2,'0');
}
function sizeLabel(bytes){
 const n=Number(bytes)||0;
 return Math.max(1,Math.round(n/1024)).toLocaleString('en-US')+'KB';
}
/* A89: 2006년에는 webp가 없었으니 게임 안에서는 jpg 또는 jpeg로 보인다(실제 파일은 그대로 webp) */
function periodName(name){
 if(!/\.webp$/i.test(name))return name;
 let h=0;for(let i=0;i<name.length;i++)h=(h*31+name.charCodeAt(i))>>>0;
 return name.replace(/\.webp$/i,h%2?'.jpeg':'.jpg');
}
function imageNodes(files,parent){
 const out=[];
 for(const f of Array.isArray(files)?files:[]){
  if(!f||typeof f.name!=='string'||!f.name||typeof f.url!=='string')continue;
  const node={n:periodName(f.name),real:f.name,t:'file',size:sizeLabel(f.size),date:fakeDate(f.name),act:'image',url:f.url,bytes:Number(f.size)||0,mtime:f.mtime};
  out.push(node);
 }
 out.sort((a,b)=>a.n.localeCompare(b.n,'ko',{numeric:true}));
 if(parent)for(const k of out)decorate(k,parent);
 return out;
}

/* 작은 대화상자 (내 컴퓨터와 그림 뷰어가 함께 쓴다) */
function dialog(E,B,host,title,text,kind){
 const veil=E('div','p87-veil'),box=E('div','p87-msg'),bar=E('div','p87-msg-bar');
 const close=()=>veil.remove();
 bar.append(E('strong','',title),B('×',close,'p87-msg-x'));
 const body=E('div','p87-msg-body');
 body.append(E('span','p87-msg-ico p87-msg-'+(kind||'stop'),kind==='info'?'i':kind==='warn'?'!':'×'),E('p','',text));
 const row=E('div','p87-btnrow');row.append(B('확인',close,'p87-btn'));
 box.append(bar,body,row);veil.append(box);host.append(veil);return veil;
}

/* A93: 그림을 바탕 화면 배경으로 설정하는 대화상자 (그림 뷰어와 폴더가 함께 쓴다) */
const wallTarget=node=>node&&node.mine?'pic:'+node.id:(node&&node.url)||'';
function openWallDialog(ctx,node,host){
 const{E,B}=ctx,sh=ctx.shell,ui=ctx.ui;
 if(!node||!node.url||!sh||!sh.wallpaperImage||!ui||!ui.dialog)return dialog(E,B,host,'바탕 화면 배경으로 설정',RESTRICT,'stop');
 let mode='fill';
 const box=E('div','p93-wall'),thumb=E('div','p93-wall-thumb'),im=E('img');im.alt='';im.src=node.url;thumb.append(im);
 const row=E('div','p93-wall-mode'),btns=[['fill','확대'],['center','가운데'],['tile','바둑판식']].map(([id,label])=>[id,B(label,()=>{mode=id;sync()},'p93-mini')]);
 row.append(E('span','','위치(P):'));for(const[,b]of btns)row.append(b);
 const sync=()=>{for(const[id,b]of btns)b.classList.toggle('on',id===mode)};sync();
 box.append(E('p','','"'+node.n+'" 그림을 바탕 화면 배경으로 설정합니다.'),thumb,row);
 return ui.dialog({title:'바탕 화면 배경으로 설정',node:box,icon:'info',buttons:[['확인',()=>{
  if(sh.wallpaperImage(wallTarget(node),node.n,mode)){if(ui.toast)ui.toast({title:'바탕 화면',text:'"'+node.n+'" 그림으로 바탕 화면 배경을 바꿨습니다.',icon:'info',ms:4500})}
  else dialog(E,B,host,'바탕 화면 배경으로 설정','이 그림은 바탕 화면 배경으로 설정할 수 없습니다.','stop')}],['취소']]});
}

/* Windows 그림 및 팩스 뷰어 */
function openViewer(ctx,list,index,opts){
 if(!ctx||!ctx.windowFor||!ctx.E||!ctx.B||!list||!list.length)return null;
 opts=opts||{};
 const{windowFor,E,B}=ctx;
 const win=windowFor('viewer','Windows 그림 및 팩스 뷰어',true);
 win.node.classList.add('p88-viewer-win');
 win.content.replaceChildren();
 let i=Math.max(0,Math.min(list.length-1,Number(index)||0)),scale=1,fit=true,rot=0,nat=null,timer=null,failed=false;
 const shell=E('div','p88-viewer');
 const menu=E('div','xp79-menu-row','파일(F)　편집(E)　보기(V)　도구(T)　도움말(H)');
 const stage=E('div','p88-stage'),holder=E('div','p88-holder'),img=E('img','p88-img');
 img.alt='';holder.append(img);stage.append(holder);
 const fail=E('p','p88-fail','');fail.hidden=true;stage.append(fail);
 const bar=E('div','p88-vbar'),stat=E('span','p88-vstat','');
 const lock=()=>dialog(E,B,win.node,'Windows 그림 및 팩스 뷰어',RESTRICT,'stop');
 const state=()=>({index:i,count:list.length,name:list[i].n,scale,fit,rot,slide:!!timer,failed,dim:nat?nat.slice():null});
 function title(){
  const name=list[i].n;
  win.caption.textContent=name+' - Windows 그림 및 팩스 뷰어';
  if(win.task)win.task.textContent=name+' - 그림 뷰어';
 }
 function apply(){
  stat.textContent=(i+1)+' / '+list.length+(nat?'　'+nat[0]+' x '+nat[1]+'　'+Math.round(scale*100)+'%':'');
  if(!nat)return;
  const rotated=rot%180!==0;
  const iw=rotated?nat[1]:nat[0],ih=rotated?nat[0]:nat[1];
  if(fit){
   const aw=Math.max(60,(stage.clientWidth||640)-28),ah=Math.max(60,(stage.clientHeight||380)-28);
   scale=Math.min(1,aw/iw,ah/ih);
  }
  const w1=Math.max(1,Math.round(nat[0]*scale)),h1=Math.max(1,Math.round(nat[1]*scale));
  holder.style.width=(rotated?h1:w1)+'px';holder.style.height=(rotated?w1:h1)+'px';
  img.style.width=w1+'px';img.style.height=h1+'px';
  img.style.transform='translate(-50%,-50%) rotate('+rot+'deg)';
  stat.textContent=(i+1)+' / '+list.length+'　'+nat[0]+' x '+nat[1]+'　'+Math.round(scale*100)+'%';
 }
 function show(n,keepView){
  i=((n%list.length)+list.length)%list.length;
  const node=list[i];
  nat=node.dim?node.dim.slice():null;failed=false;fail.hidden=true;holder.hidden=false;
  if(!keepView){fit=true;rot=0;scale=1;img.style.transform='translate(-50%,-50%) rotate(0deg)'}
  title();
  img.onload=()=>{nat=[img.naturalWidth||1,img.naturalHeight||1];node.dim=nat.slice();apply()};
  img.onerror=()=>{failed=true;nat=null;holder.hidden=true;fail.hidden=false;fail.textContent='Windows 그림 및 팩스 뷰어에서 이 그림을 표시할 수 없습니다.\n파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.\n\n'+node.n;apply()};
  img.src=node.url;
  apply();
 }
 function stop(){if(timer){w_clear(timer);timer=null}shell.classList.remove('p88-slide');slideBtn.setSub('슬라이드')}
 function startSlide(){
  stop();shell.classList.add('p88-slide');fit=true;slideBtn.setSub('중지');
  timer=w_every(()=>{
   if(win.node.isConnected===false){stop();return}
   show(i+1,false);
  },3000);
  apply();
 }
 function zoom(f){stop();fit=false;scale=Math.max(.05,Math.min(8,scale*f));apply()}
 function go(d){show(i+d,false)}
 function vbtn(glyph,label,tip,fn){
  const b=B('',fn,'p88-vbtn');b.setAttribute('aria-label',tip);b.title=tip;
  const g=E('span','p88-vg',glyph),sub=E('small','',label);b.append(g,sub);b.setSub=t=>{sub.textContent=t};return b;
 }
 const sep=()=>E('i','p88-vsep');
 const slideBtn=vbtn('▷','슬라이드','슬라이드 쇼 보기',()=>{timer?stop():startSlide()});
 const setWall=()=>{stop();openWallDialog(ctx,list[i],win.node)};
 bar.append(
  vbtn('◀','이전','이전 이미지',()=>go(-1)),vbtn('▶','다음','다음 이미지',()=>go(1)),sep(),
  vbtn('▣','맞춤','최적 크기',()=>{stop();fit=true;apply()}),vbtn('▢','실제','실제 크기',()=>{stop();fit=false;scale=1;apply()}),slideBtn,sep(),
  vbtn('＋','확대','확대',()=>zoom(1.25)),vbtn('－','축소','축소',()=>zoom(1/1.25)),
  vbtn('↻','오른쪽','시계 방향으로 회전',()=>{rot=(rot+90)%360;apply()}),vbtn('↺','왼쪽','시계 반대 방향으로 회전',()=>{rot=(rot+270)%360;apply()}),sep(),
  vbtn('▤','인쇄','이미지 인쇄',lock),vbtn('▥','저장','복사본 저장',lock),vbtn('✕','삭제','삭제',lock),vbtn('✎','편집','편집',lock),sep(),vbtn('▦','바탕화면','바탕 화면으로 설정',setWall),
  stat
 );
 shell.append(menu,stage,bar);win.content.append(shell);
 const timers=ctx.timers||{};
 function w_every(fn,ms){const f=timers.setInterval||w.setInterval;return typeof f==='function'?f(fn,ms):null}
 function w_clear(t){const f=timers.clearInterval||w.clearInterval;if(typeof f==='function')f(t)}
 stage.addEventListener('dblclick',()=>{stop();fit=!fit;if(!fit)scale=1;apply()});
 stage.addEventListener('click',()=>{if(timer)stop()});
 stage.addEventListener('contextmenu',e=>{
  if(!ctx.ui||!ctx.ui.menu)return;e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();
  const host=win.node.parentNode,r=host&&host.getBoundingClientRect?host.getBoundingClientRect():{left:0,top:0};
  ctx.ui.menu((e.clientX||60)-r.left,(e.clientY||60)-r.top,[['바탕 화면으로 설정',setWall,{bold:true}],'-',['이전 이미지',()=>go(-1)],['다음 이미지',()=>go(1)],'-',['복사본 저장',lock],['이미지 인쇄',lock]]);
 });
 if(w.ResizeObserver){try{new w.ResizeObserver(()=>{if(fit)apply()}).observe(stage)}catch(_){}}
 win.node.tabIndex=0;
 win.node.addEventListener('keydown',e=>{
  const k=e.key;let used=true;
  if(k==='ArrowRight'||k==='ArrowDown'||k==='PageDown'||k===' ')go(1);
  else if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace')go(-1);
  else if(k==='Home')show(0,false);
  else if(k==='End')show(list.length-1,false);
  else if(k==='+'||k==='=')zoom(1.25);
  else if(k==='-'||k==='_')zoom(1/1.25);
  else if(k==='0'){stop();fit=true;apply()}
  else if(k==='Enter'){timer?stop():startSlide()}
  else if(k==='b'||k==='B')setWall();
  else if(k==='Delete')lock();
  else used=false;
  if(used){e.preventDefault?.();e.stopPropagation?.()}
 });
 show(i,false);
 if(opts.slide)startSlide();
 win.node.focus?.();
 return{win,show,go,zoom,apply,stop,startSlide,state,img,stage,setWall};
}

/* ───────── 설치된 프로그램 ───────── */
function hashOf(s){let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function programList(games){
 const rows=[
  ['Adobe Flash Player 8','1.35MB','자주','2006-05-30'],
  ['ALZip','8.12MB','자주','2006-05-29'],
  ['GOM Player','6.40MB','가끔','2006-05-27'],
  ['Intel(R) Chipset Software Installation Utility','2.65MB','드물게','2006-03-18'],
  ['Microsoft .NET Framework 1.1','35.20MB','드물게','2006-03-18'],
  ['NVIDIA Drivers','62.40MB','드물게','2006-03-18'],
  ['Realtek High Definition Audio Driver','11.80MB','드물게','2006-03-18'],
  ['V3 365 클리닉','24.60MB','자주','2006-05-30'],
  ['Windows XP 서비스 팩 2','','드물게','2006-03-18']
 ].map(([name,size,freq,last])=>({name,size,freq,last}));
 for(const g of games||[]){
  const h=hashOf(g.id||g.name);const mb=120+(h%1400);
  rows.push({name:g.name,size:(mb>=1000?(mb/1000).toFixed(2)+'GB':mb+'.00MB'),freq:['자주','가끔','자주'][h%3],last:'2006-05-'+String(20+(h%11)).padStart(2,'0')});
 }
 return rows.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
}

/* ───────── 장치 목록 ───────── */
function deviceTree(spec){
 return[
  {c:'DVD/CD-ROM 드라이브',items:[{n:'DVD-ROM 드라이브',m:'(표준 CD-ROM 드라이브)',loc:'IDE 보조 채널 (마스터)'}]},
  {c:'IDE ATA/ATAPI 컨트롤러',items:[
   {n:'Intel(R) 82801G (ICH7 Family) Serial ATA Storage Controller - 27C0',m:'Intel',loc:'PCI 버스 0, 장치 31, 기능 2'},
   {n:'Intel(R) 82801GB/GR (ICH7 Family) Ultra ATA Storage Controllers - 27DF',m:'Intel',loc:'PCI 버스 0, 장치 31, 기능 1'},
   {n:'주 IDE 채널',m:'(표준 IDE ATA/ATAPI 컨트롤러)',loc:'주 IDE 채널'},
   {n:'보조 IDE 채널',m:'(표준 IDE ATA/ATAPI 컨트롤러)',loc:'보조 IDE 채널'}]},
  {c:'USB(Universal Serial Bus) 컨트롤러',items:[
   {n:'Intel(R) 82801G (ICH7 Family) USB Universal Host Controller - 27C8',m:'Intel',loc:'PCI 버스 0, 장치 29, 기능 0'},
   {n:'Intel(R) 82801G (ICH7 Family) USB2 Enhanced Host Controller - 27CC',m:'Intel',loc:'PCI 버스 0, 장치 29, 기능 7'},
   {n:'USB 루트 허브',m:'(표준 USB 허브)',loc:'USB 루트 허브'},
   {n:'USB 루트 허브',m:'(표준 USB 허브)',loc:'USB 루트 허브'}]},
  {c:'네트워크 어댑터',items:[{n:'Realtek RTL8139/810x Family Fast Ethernet NIC',m:'Realtek',loc:'PCI 버스 2, 장치 0, 기능 0'}]},
  {c:'디스크 드라이브',open:true,items:[{n:spec.hddModel,m:'(표준 디스크 드라이브)',loc:'Bus Number 0, Target Id 0, LUN 0'}]},
  {c:'디스플레이 어댑터',open:true,items:[{n:spec.gpu,m:'NVIDIA',loc:'PCI 버스 1, 장치 0, 기능 0',note:spec.vram}]},
  {c:'마우스 및 기타 포인팅 장치',items:[{n:'HID 규격 마우스',m:'Microsoft',loc:'USB 입력 장치'}]},
  {c:'모니터',items:[{n:'Plug and Play 모니터',m:'(표준 모니터 유형)',loc:'NVIDIA GeForce 6600 GT에서'}]},
  {c:'사운드, 비디오 및 게임 컨트롤러',items:[
   {n:'Realtek High Definition Audio',m:'Realtek',loc:'PCI 버스 0, 장치 27, 기능 0'},
   {n:'레거시 오디오 드라이버',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'레거시 비디오 캡처 장치',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'미디어 컨트롤 장치',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'비디오 코덱',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'오디오 코덱',m:'(표준 시스템 장치)',loc:'시스템 보드'}]},
  {c:'시스템 장치',items:[
   {n:'Intel(R) 82945G/GZ/P/PL Processor to I/O Controller - 2770',m:'Intel',loc:'PCI 버스 0, 장치 0, 기능 0',note:spec.board},
   {n:'Intel(R) 82945G/GZ/P/PL PCI Express Root Port - 2771',m:'Intel',loc:'PCI 버스 0, 장치 1, 기능 0'},
   {n:'Intel(R) 82801GB/GR (ICH7 Family) LPC Interface Controller - 27B8',m:'Intel',loc:'PCI 버스 0, 장치 31, 기능 0'},
   {n:'Intel(R) 82801 PCI Bridge - 244E',m:'Intel',loc:'PCI 버스 0, 장치 30, 기능 0'},
   {n:'Microsoft ACPI-Compliant System',m:'Microsoft',loc:'ACPI x86-based PC'},
   {n:'Plug and Play 소프트웨어 장치 열거자',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'시스템 CMOS/실시간 시계',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'시스템 스피커',m:'(표준 시스템 장치)',loc:'시스템 보드'},
   {n:'시스템 타이머',m:'(표준 시스템 장치)',loc:'시스템 보드'}]},
  {c:'키보드',items:[{n:'표준 101/102 키 또는 Microsoft Natural PS/2 키보드',m:'(표준 키보드)',loc:'i8042 키보드 및 PS/2 마우스 포트 근처'}]},
  {c:'포트(COM & LPT)',items:[{n:'ECP 프린터 포트 (LPT1)',m:'(표준 포트 유형)',loc:'LPT1'},{n:'통신 포트 (COM1)',m:'(표준 포트 유형)',loc:'COM1'}]},
  {c:'프로세서',open:true,items:[{n:spec.cpu,m:'Intel',loc:'시스템 보드'}]},
  {c:'휴먼 인터페이스 장치',items:[{n:'USB 휴먼 인터페이스 장치',m:'Microsoft',loc:'USB 입력 장치'}]}
 ];
}

/* ───────── 열기 ───────── */
function open(ctx){
 if(!ctx||!ctx.windowFor||!ctx.E||!ctx.B)return false;
 const{windowFor,E,B,openApp}=ctx;
 const listen=ctx.listen||((n,t,f)=>n.addEventListener(t,f));
 const spec=specFor(seatOf(ctx.options));
 const atDocs=ctx.start==='mydocs';
 const win=windowFor(atDocs?'mydocs':'computer',atDocs?'내 문서':'내 컴퓨터',true);
 win.content.replaceChildren();

 /* 작은 대화상자 */
 const msgbox=(host,title,text,kind)=>dialog(E,B,host,title,text,kind);
 const lock=(host,title)=>msgbox(host,title||'제한',RESTRICT,'stop');

 /* ───────── 내 컴퓨터 ───────── */
 const t=tree();
 const roots={mydocs:t.mydocs,shared:t.shared};
 t.mydocs.path='내 문서';t.shared.path='공유 문서';
 const c=t.c,d=t.d;
 c.path='C:\\';d.path='D:\\';c.drive='C';d.drive='D';
 const cs=spec.drives[0],ds=spec.drives[1];
 c.label='로컬 디스크 (C:)';d.label='로컬 디스크 (D:)';
 c.total=cs.total;c.free=cs.free;d.total=ds.total;d.free=ds.free;
 const dvd={n:'E:',label:'DVD 드라이브 (E:)',drive:'E',t:'folder',act:'notready',path:'E:\\'};
 for(const k of c.kids)decorate(k,c);for(const k of d.kids)decorate(k,d);
 for(const k of t.mydocs.kids)decorate(k,t.mydocs);for(const k of t.shared.kids)decorate(k,t.shared);

 const shell=E('div','p87-mc');
 const menu=E('div','xp79-menu-row','파일(F)　편집(E)　보기(V)　즐겨찾기(A)　도구(T)　도움말(H)');
 const tools=E('div','p87-tools');
 const backBtn=B('◀ 뒤로',()=>back(),'p87-tool'),fwdBtn=B('앞으로 ▶',()=>forward(),'p87-tool'),upBtn=B('위로',()=>up(),'p87-tool');
 const refreshBtn=B('새로 고침',()=>refresh(),'p87-tool'),viewBtn=B('보기: 자세히',()=>{incThumbs=!incThumbs;paintView();viewBtn.textContent=incThumbs?'보기: 자세히':'보기: 미리 보기'},'p87-tool');
 viewBtn.hidden=true;
 tools.append(backBtn,fwdBtn,upBtn,refreshBtn,viewBtn);
 const address=E('div','p87-address');const addrLabel=E('span','','주소(D)'),addrBox=E('div','p87-addr-box','내 컴퓨터');
 address.append(addrLabel,addrBox);
 const body=E('div','p87-body');
 const pane=E('aside','p87-pane'),view=E('section','p87-view');
 body.append(pane,view);
 shell.append(menu,tools,address,body);
 win.content.append(shell);

 let cur='root',history=['root'],hi=0,selected=null,items=[],nav=0,incThumbs=true;
 const incNode=t.mydocs.kids.find(k=>k.act==='incoming');
 const inc={status:'idle',nav:-1};
 const incList=()=>incNode.kids.filter(k=>k.act==='image');
 /* A93: 그림판이 저장한 그림은 내 그림 폴더에 진짜 파일처럼 나타난다 */
 const picFolder=t.mydocs.kids.find(k=>k.n==='내 그림');
 const picList=()=>picFolder?picFolder.kids.filter(k=>k.mine):[];
 const listFor=node=>node&&node.mine?picList():incList();
 function syncPics(){
  if(!picFolder)return;
  const sh=ctx.shell,list=sh&&sh.pics?sh.pics():[];
  picFolder.kids=picFolder.kids.filter(k=>!k.mine);
  for(const p of list){const bytes=Math.max(1,Math.round((p.url.length-23)*3/4));const nd={n:p.name,t:'file',size:sizeLabel(bytes),date:NOW_LABEL,act:'image',url:p.url,mine:true,id:p.id,dim:[p.w,p.h],bytes};decorate(nd,picFolder);picFolder.kids.push(nd)}
  if(selected&&selected.mine&&!picFolder.kids.includes(selected))selected=null;
 }
 function askDelete(node){
  const sh=ctx.shell,ui=ctx.ui;if(!node||!node.mine||!sh||!sh.picDelete)return;
  const del=()=>{sh.picDelete(node.id);selected=null;paint()};
  if(ui&&ui.dialog)ui.dialog({title:'파일 삭제 확인',text:'"'+node.n+'" 을(를) 삭제하시겠습니까?',icon:'ask',buttons:[['예',del],['아니요']]});else del();
 }
 /* 서버 없이 index.html을 직접 열었을 때: incoming/list.js (그림목록갱신.bat이 만든다)를 읽는다 */
 function listFromFile(){
  return new Promise((ok,no)=>{
   const d=w.document;if(!d||!d.createElement||!d.head||!d.head.appendChild)return no(new Error('no document'));
   const old=w.A88_INCOMING;w.A88_INCOMING=undefined;
   const sc=d.createElement('script');sc.src='assets/pc-desktop/incoming/list.js?t='+Date.now();
   sc.onload=()=>{const l=w.A88_INCOMING;if(sc.remove)sc.remove();if(!Array.isArray(l)){w.A88_INCOMING=old;return no(new Error('no list'))}ok({files:l.map(x=>({name:x.name,size:x.size||0,mtime:0,url:'assets/pc-desktop/incoming/'+encodeURIComponent(x.name)}))})};
   sc.onerror=()=>{if(sc.remove)sc.remove();no(new Error('no list.js'))};
   d.head.appendChild(sc);
  });
 }
 function loadIncoming(){
  if(inc.status==='loading')return;
  const f=ctx.fetch||w.fetch;
  if(typeof f!=='function'){inc.status='error';return}
  inc.status='loading';
  let job;
  try{job=Promise.resolve(f(INCOMING_URL,{cache:'no-cache'})).then(r=>{if(!r||!r.ok)throw new Error('incoming '+(r&&r.status));return r.json()})}
  catch(err){job=Promise.reject(err)}
  job=job.catch(err=>listFromFile()).then(j=>{
   const keep=new Map(incNode.kids.map(k=>[k.url,k]));
   const fresh=imageNodes(j&&j.files,incNode);
   incNode.kids=fresh.map(k=>{const o=keep.get(k.url);return o&&o.bytes===k.bytes&&o.mtime===k.mtime?o:k});
   if(selected&&!incNode.kids.includes(selected))selected=null;
   inc.status='ready';if(cur===incNode)paint();
  }).catch(()=>{inc.status='error';incNode.kids=[];if(cur===incNode)paint()});
  inc.job=job;
  return job;
 }
 function refresh(){nav++;if(cur===incNode){inc.nav=nav;loadIncoming()}paint()}
 function select(node){selected=node;for(const it of items)it.el.classList.toggle('p87-selected',it.node===node);paintPane()}
 function set(target,push=true){
  if(push){history=history.slice(0,hi+1);history.push(target);hi=history.length-1}
  cur=target;selected=null;nav++;paint();
 }
 function back(){if(hi>0){hi-=1;cur=history[hi];selected=null;nav++;paint()}}
 function forward(){if(hi<history.length-1){hi+=1;cur=history[hi];selected=null;nav++;paint()}}
 function up(){
  if(cur==='root')return;
  const p=parentOf(cur);set(p||'root');
 }
 function parentOf(node){
  if(node===c||node===d||node===dvd||node===t.mydocs||node===t.shared)return'root';
  for(const top of[c,d,t.mydocs,t.shared]){const found=search(top,node);if(found)return found}
  return'root';
 }
 function search(parent,node){
  if(!parent.kids)return null;
  for(const k of parent.kids){if(k===node)return parent;const r=search(k,node);if(r)return r}
  return null;
 }

 function activate(node){
  if(node.act==='lock')return lock(win.node,node.path||node.n);
  if(node.act==='games')return openApp('games');
  if(node.act==='notepad')return openApp('notepad');
  if(node.act==='image'){const list=listFor(node);return openViewer(ctx,list,list.indexOf(node))}
  if(node.act==='notready')return msgbox(win.node,'E:\\','E:\\를 사용할 수 없습니다.\n장치가 준비되어 있지 않습니다.','warn');
  if(node.kids)return set(node);
  if(node.t==='file')return lock(win.node,node.n);
 }

 function icon(kind){return E('span','p87-ico p87-ico-'+kind)}

 function detailsFor(node){
  const box=E('div','p87-card-body');
  if(node==='root'||!node){
   box.append(E('b','','내 컴퓨터'),E('span','','시스템 폴더'));
   const sum=E('div','p87-summary');
   for(const line of[spec.osLines[0]+' '+spec.osLines[1],spec.osLines[3],spec.cpu,spec.ram,spec.gpu+' ('+spec.vram.replace('비디오 메모리 : ','')+')',spec.board,spec.hdd])sum.append(E('span','',line));
   box.append(sum);return box;
  }
  if(node.drive){
   box.append(E('b','',node.label));
   if(node.drive==='E'){box.append(E('span','','CD 드라이브'));return box}
   box.append(E('span','','로컬 디스크'),E('span','','파일 시스템: NTFS'),E('span','','사용 가능 공간: '+gb(node.free)),E('span','','전체 크기: '+gb(node.total)));
   return box;
  }
  box.append(E('b','',node.n),E('span','',kindOf(node)));
  if(node.date)box.append(E('span','','수정한 날짜: '+node.date));
  if(node.t==='file'&&node.size)box.append(E('span','','크기: '+node.size));
  if(node.dim)box.append(E('span','','치수: '+node.dim[0]+' x '+node.dim[1]));
  return box;
 }

 function card(title,rows,extraClass){
  const el=E('div','p87-card'+(extraClass?' '+extraClass:''));
  el.append(E('h4','',title));
  const bodyEl=E('div','p87-card-body');
  for(const r of rows)bodyEl.append(r);
  el.append(bodyEl);return el;
 }
 const link=(label,fn,kind)=>{const b=B(label,fn,'p87-link');if(kind)b.prepend?.(icon(kind));return b};

 function paintPane(){
  pane.replaceChildren();
  const sys=cur==='root'?card('시스템 작업',[
   link('시스템 정보 보기',()=>openProps(ctx,spec)),
   link('프로그램 추가 또는 제거',()=>openPrograms(ctx,spec)),
   link('설정 변경',()=>lock(win.node,'제어판'))
  ]):null;
  const imgs=cur===incNode?incList():cur===picFolder?picList():[];
  const pics=imgs.length?card('그림 작업',[
   link('슬라이드 쇼 보기',()=>openViewer(ctx,imgs,0,{slide:true})),
   link('이미지 인쇄',()=>lock(win.node,'이미지 인쇄')),
   link('이메일로 파일 보내기',()=>lock(win.node,'이메일로 보내기')),
   link('바탕 화면 배경으로 설정',()=>openWallDialog(ctx,selected&&selected.act==='image'?selected:imgs[0],win.node))
  ]):null;
  const other=card('기타 위치',[
   cur==='root'?null:link('내 컴퓨터',()=>set('root')),
   link('내 네트워크 환경',()=>openNetwork(ctx,spec)),
   link('내 문서',()=>set(t.mydocs)),
   link('공유 문서',()=>set(t.shared)),
   link('제어판',()=>lock(win.node,'제어판'))
  ].filter(Boolean));
  const det=E('div','p87-card p87-details');det.append(E('h4','','자세한 정보'));
  const dbox=detailsFor(selected||(cur==='root'?'root':cur));
  if(selected&&(selected.kids||selected.act||selected.t==='file')){dbox.append(B('열기',()=>activate(selected),'p87-open'))}
  if(selected&&selected.mine)dbox.append(B('삭제',()=>askDelete(selected),'p87-open'));
  det.append(dbox);
  if(sys)pane.append(sys);
  if(pics)pane.append(pics);
  pane.append(other,det);
 }

 function tile(node,label,sub,barPct){
  const b=E('button','p87-tile'+(selected===node?' p87-selected':''));b.type='button';
  b.append(icon(iconOf(node)));
  const tx=E('span','p87-tile-text');tx.append(E('b','',label));
  if(sub)tx.append(E('small','',sub));
  if(barPct!==undefined){const bar=E('span','p87-bar'),fill=E('i','');fill.style.width=barPct+'%';bar.append(fill);tx.append(bar)}
  b.append(tx);
  b.addEventListener('click',()=>select(node));
  b.addEventListener('dblclick',()=>activate(node));
  b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate(node)}});
  items.push({node,el:b,cls:'p87-tile'});
  return b;
 }
 function group(title,tiles){
  const g=E('div','p87-group');g.append(E('h3','',title));
  const grid=E('div','p87-tiles');for(const x of tiles)grid.append(x);g.append(grid);return g;
 }

 function paintView(){
  view.replaceChildren();items=[];
  if(cur==='root'){
   view.append(
    group('이 컴퓨터에 저장된 파일',[tile(t.shared,'공유 문서','파일 폴더'),tile(t.mydocs,'PCBANG의 문서','파일 폴더')]),
    group('하드 디스크 드라이브',[
     tile(c,c.label,gb(c.total)+' 중 '+gb(c.free)+' 사용 가능',Math.round((1-c.free/c.total)*100)),
     tile(d,d.label,gb(d.total)+' 중 '+gb(d.free)+' 사용 가능',Math.round((1-d.free/d.total)*100))]),
    group('이동식 저장소가 있는 장치',[tile(dvd,dvd.label,'CD 드라이브')])
   );
   return;
  }
  if(cur===incNode&&inc.status==='loading'&&!incNode.kids.length){view.append(E('p','p87-empty','폴더 내용을 읽는 중입니다...'));return}
  if(cur===incNode&&inc.status==='error'){view.append(E('p','p87-empty','이 폴더의 내용을 읽을 수 없습니다. 잠시 뒤에 새로 고침을 눌러 보세요.'));return}
  if(cur===incNode&&incThumbs&&incNode.kids.length){paintThumbs();return}
  const list=E('div','p87-list');
  const head=E('div','p87-row p87-row-head');
  for(const h of['이름','크기','종류','수정한 날짜'])head.append(E('span','',h));
  list.append(head);
  const kids=cur.kids||[];
  if(!kids.length&&cur.act!=='lock')list.append(E('p','p87-empty','이 폴더는 비어 있습니다.'));
  const sorted=[...kids].sort((a,b)=>(a.t===b.t?0:a.t==='folder'?-1:1)||a.n.localeCompare(b.n,'ko'));
  for(const k of sorted){
   const row=E('button','p87-row'+(selected===k?' p87-selected':''));row.type='button';
   const nm=E('span','p87-name');nm.append(icon(iconOf(k)),E('b','',k.n));
   row.append(nm,E('span','',k.t==='file'?k.size||'':''),E('span','',kindOf(k)),E('span','',k.date||''));
   row.addEventListener('click',()=>select(k));
   row.addEventListener('dblclick',()=>activate(k));
   row.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate(k)}});
   items.push({node:k,el:row,cls:'p87-row'});
   list.append(row);
  }
  view.append(list);
 }

 function paintThumbs(){
  const grid=E('div','p88-thumbs');
  for(const k of incNode.kids){
   const b=E('button','p88-thumb'+(selected===k?' p87-selected':''));b.type='button';
   const frame=E('span','p88-thumb-frame'),im=E('img');
   im.alt='';im.loading='lazy';im.decoding='async';
   im.onload=()=>{k.dim=[im.naturalWidth||1,im.naturalHeight||1];if(selected===k)paintPane()};
   im.onerror=()=>{frame.classList.add('p88-thumb-broken')};
   im.src=k.url;frame.append(im);
   b.append(frame,E('span','p88-thumb-name',k.n));
   b.title=k.n+'\n크기: '+k.size+'\n수정한 날짜: '+k.date;
   b.addEventListener('click',()=>select(k));
   b.addEventListener('dblclick',()=>activate(k));
   b.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate(k)}});
   items.push({node:k,el:b,cls:'p88-thumb'});
   grid.append(b);
  }
  view.append(grid);
 }

 function paint(){
  addrBox.textContent=cur==='root'?'내 컴퓨터':(cur.path||cur.n);
  backBtn.disabled=hi===0;fwdBtn.disabled=hi>=history.length-1;upBtn.disabled=cur==='root';
  backBtn.classList.toggle('p87-off',hi===0);fwdBtn.classList.toggle('p87-off',hi>=history.length-1);upBtn.classList.toggle('p87-off',cur==='root');
  viewBtn.hidden=cur!==incNode;
  if(cur===incNode&&inc.nav!==nav){inc.nav=nav;loadIncoming()}
  if(cur===picFolder)syncPics();
  paintPane();paintView();
 }
 if(atDocs){cur=t.mydocs;history=[t.mydocs];hi=0}
 paint();
 return true;
}

/* ───────── 시스템 등록 정보 ───────── */
function openProps(ctx,spec){
 const{windowFor,E,B}=ctx;
 const win=windowFor('sysprops','시스템 등록 정보');
 win.node.classList.add('p87-dialog');
 win.caption.textContent='시스템 등록 정보';
 win.content.replaceChildren();
 const tabs=['일반','컴퓨터 이름','하드웨어','고급','시스템 복원','자동 업데이트','원격'];
 const shell=E('div','p87-props');
 const tabRow=E('div','p87-tabs');
 const page=E('div','p87-page');
 const foot=E('div','p87-btnrow p87-props-foot');
 const noop=(host,title)=>{const veil=E('div','p87-veil'),box=E('div','p87-msg'),bar=E('div','p87-msg-bar');const close=()=>veil.remove();bar.append(E('strong','',title||'시스템 등록 정보'),B('×',close,'p87-msg-x'));const bd=E('div','p87-msg-body');bd.append(E('span','p87-msg-ico p87-msg-stop','×'),E('p','',RESTRICT));const row=E('div','p87-btnrow');row.append(B('확인',close,'p87-btn'));box.append(bar,bd,row);veil.append(box);host.append(veil)};
 const restrict=title=>noop(win.node,title);
 const kv=(label,lines)=>{const g=E('div','p87-kv');g.append(E('b','',label));for(const l of lines)g.append(E('span','',l));return g};
 const line=(txt)=>E('p','p87-note',txt);
 const group=(title,nodes)=>{const g=E('fieldset','p87-fs');g.append(E('legend','',title));for(const n of nodes)g.append(n);return g};
 const btn=(label,fn)=>B(label,fn||(()=>restrict()),'p87-btn');

 const builders={
  '일반':()=>{
   const el=E('div','p87-general');
   const logo=E('div','p87-xplogo'),flag=E('span','p87-flag');
   for(const k of['r','g','b','y'])flag.append(E('i','p87-flag-'+k));
   const words=E('span','p87-logo-words');words.append(E('small','','Microsoft'),E('strong','','Windows xp'),E('em','','Professional'));
   logo.append(flag,words);
   el.append(logo);
   const info=E('div','p87-info');
   info.append(kv('시스템:',spec.osLines),kv('등록 대상:',['PCBANG','PCBANG','76487-OEM-0030618-52473']));
   const wide=kv('컴퓨터:',[spec.cpu,spec.ram]);wide.classList.add('p87-kv-wide');info.append(wide);
   info.append(kv('그래픽:',[spec.gpu,spec.vram]),kv('메인보드:',[spec.board]));
   const disk=kv('하드디스크:',[spec.hdd]);disk.classList.add('p87-kv-wide');info.append(disk);
   el.append(info);
   el.append(E('p','p87-seat','PC방 '+spec.seat+'번 자리 · 컴퓨터 이름 '+spec.pcName.toLowerCase()));
   return el;
  },
  '컴퓨터 이름':()=>{
   const el=E('div','p87-name-tab');
   el.append(line('Windows는 다음 정보를 사용하여 네트워크에서 컴퓨터를 식별합니다.'));
   const desc=E('label','p87-field');desc.append(E('span','','컴퓨터 설명(D):'));const inp=E('input','p87-input');inp.value='PC방 '+spec.seat+'번 자리';inp.readOnly=true;desc.append(inp);el.append(desc);
   el.append(line('예: "Kitchen Computer" 또는 "Mary\'s Computer".'));
   el.append(kv('전체 컴퓨터 이름:',[spec.pcName.toLowerCase()+'.']));
   el.append(kv('작업 그룹:',['WORKGROUP']));
   el.append(line('마법사를 사용하여 도메인에 가입하거나 로컬 사용자 계정을 만들려면 [네트워크 ID]를 누르십시오.'));
   const row=E('div','p87-btnrow');row.append(btn('네트워크 ID(N)'));
   el.append(row);
   el.append(line('이 컴퓨터의 이름을 바꾸거나 도메인 또는 작업 그룹에 가입하려면 [변경]을 누르십시오.'));
   const row2=E('div','p87-btnrow');row2.append(btn('변경(C)'));el.append(row2);
   return el;
  },
  '하드웨어':()=>{
   const el=E('div','p87-hw');
   el.append(group('하드웨어 마법사',[line('하드웨어 추가 마법사를 사용하면 하드웨어를 설치, 제거, 해결 및 업그레이드할 수 있습니다.'),(()=>{const r=E('div','p87-btnrow');r.append(btn('하드웨어 마법사(H)'));return r})()]));
   el.append(group('장치 관리자',[line('장치 관리자는 컴퓨터에 설치된 모든 하드웨어 장치를 보여 줍니다. 장치 관리자를 사용하여 각 장치의 등록 정보를 변경할 수 있습니다.'),(()=>{const r=E('div','p87-btnrow');r.append(btn('장치 관리자(D)',()=>openDevices(ctx,spec)));return r})()]));
   el.append(group('드라이버',[line('드라이버 서명을 사용하면 설치된 드라이버가 Windows와 호환되는지 확인할 수 있습니다. Windows Update를 사용하면 드라이버를 위해 Windows Update에 연결하는 방법을 설정할 수 있습니다.'),(()=>{const r=E('div','p87-btnrow');r.append(btn('드라이버 서명(S)'),btn('Windows Update(W)'));return r})()]));
   el.append(group('하드웨어 프로필',[line('하드웨어 프로필을 사용하면 서로 다른 하드웨어 구성을 설정하고 저장할 수 있습니다.'),(()=>{const r=E('div','p87-btnrow');r.append(btn('하드웨어 프로필(P)'));return r})()]));
   return el;
  },
  '고급':()=>{
   const el=E('div','p87-adv');
   el.append(line('대부분의 설정을 바꾸려면 관리자로 로그온해야 합니다.'));
   el.append(group('성능',[line('시각 효과, 프로세서 일정, 메모리 사용 및 가상 메모리'),(()=>{const r=E('div','p87-btnrow');r.append(btn('설정(S)'));return r})()]));
   el.append(group('사용자 프로필',[line('로그온할 때 사용되는 바탕 화면 설정'),(()=>{const r=E('div','p87-btnrow');r.append(btn('설정(E)'));return r})()]));
   el.append(group('시작 및 복구',[line('시스템 시작, 시스템 오류 및 디버깅 정보'),(()=>{const r=E('div','p87-btnrow');r.append(btn('설정(T)'));return r})()]));
   const r=E('div','p87-btnrow');r.append(btn('환경 변수(N)'),btn('오류 보고(R)'));el.append(r);
   return el;
  },
  '시스템 복원':()=>{
   const el=E('div','p87-restore');
   el.append(line('시스템 복원을 사용하면 컴퓨터에 문제가 생겼을 때 이전 상태로 되돌릴 수 있습니다.'));
   const chk=E('label','p87-check');const box=E('input','');box.type='checkbox';box.disabled=true;chk.append(box,E('span','','시스템 복원 끄기(T)'));el.append(chk);
   el.append(kv('사용 가능한 드라이브:',['드라이브　　　　　　상태','C: [로컬 디스크 (C:)]　　감시 중','D: [로컬 디스크 (D:)]　　감시 중']));
   return el;
  },
  '자동 업데이트':()=>{
   const el=E('div','p87-auto');
   el.append(line('Windows에서 컴퓨터에 필요한 업데이트를 찾아 설치하도록 할 수 있습니다.'));
   const opts=['자동(권장)(A): 컴퓨터에 업데이트를 자동으로 다운로드하여 설치합니다. 매일 오전 3:00','업데이트를 다운로드하지만 설치 시기는 직접 선택(D)','업데이트를 확인하지만 다운로드 및 설치 여부는 직접 선택(N)','자동 업데이트 끄기(T)'];
   opts.forEach((o,i)=>{const lab=E('label','p87-check');const r=E('input','');r.type='radio';r.name='au';r.checked=i===0;r.disabled=true;lab.append(r,E('span','',o));el.append(lab)});
   el.append(line('이 설정은 관리자만 바꿀 수 있습니다.'));
   return el;
  },
  '원격':()=>{
   const el=E('div','p87-remote');
   el.append(group('원격 지원',[(()=>{const lab=E('label','p87-check');const b=E('input','');b.type='checkbox';b.disabled=true;lab.append(b,E('span','','이 컴퓨터에서 원격 지원 초대장을 보낼 수 있음(R)'));return lab})()]));
   el.append(group('원격 데스크톱',[(()=>{const lab=E('label','p87-check');const b=E('input','');b.type='checkbox';b.disabled=true;lab.append(b,E('span','','사용자가 이 컴퓨터에 원격으로 연결할 수 있도록 허용(U)'));return lab})()]));
   return el;
  }
 };
 let activeTab='일반';
 const tabButtons=new Map();
 function show(name){
  activeTab=name;page.replaceChildren(builders[name]());
  for(const[k,b]of tabButtons)b.classList.toggle('p87-tab-on',k===name);
 }
 for(const name of tabs){const b=B(name,()=>show(name),'p87-tab');tabButtons.set(name,b);tabRow.append(b)}
 const close=()=>ctx.closeWin?ctx.closeWin('sysprops'):win.node.remove();
 foot.append(B('확인',close,'p87-btn'),B('취소',close,'p87-btn'),(()=>{const b=B('적용(A)',()=>{},'p87-btn p87-off');b.disabled=true;return b})());
 shell.append(tabRow,page,foot);
 win.content.append(shell);
 show('일반');
 return win;
}

/* ───────── 장치 관리자 ───────── */
function openDevices(ctx,spec){
 const{windowFor,E,B}=ctx;
 const win=windowFor('devmgr','장치 관리자');
 win.node.classList.add('p87-tall');
 win.content.replaceChildren();
 const shell=E('div','p87-dev');
 shell.append(E('div','xp79-menu-row','파일(F)　동작(A)　보기(V)　도움말(H)'));
 const treeBox=E('div','p87-devtree');
 shell.append(treeBox);win.content.append(shell);
 const cats=deviceTree(spec);
 const openState=new Map(cats.map(c=>[c.c,!!c.open]));
 function props(dev,cat){
  const veil=E('div','p87-veil'),box=E('div','p87-msg p87-devprop'),bar=E('div','p87-msg-bar');
  const close=()=>veil.remove();
  bar.append(E('strong','',dev.n+' 등록 정보'),B('×',close,'p87-msg-x'));
  const bd=E('div','p87-devprop-body');
  const tabs=E('div','p87-tabs');tabs.append(B('일반',()=>{},'p87-tab p87-tab-on'));
  bd.append(tabs);
  const rows=E('div','p87-devrows');
  for(const[a,b]of[['장치 유형:',cat],['제조업체:',dev.m],['위치:',dev.loc]]){const r=E('div','p87-devrow');r.append(E('b','',a),E('span','',b));rows.append(r)}
  if(dev.note){const r=E('div','p87-devrow');r.append(E('b','','사양:'),E('span','',dev.note));rows.append(r)}
  bd.append(rows);
  const st=E('fieldset','p87-fs');st.append(E('legend','','장치 상태'),E('p','','이 장치는 올바르게 작동하고 있습니다.'));bd.append(st);
  const row=E('div','p87-btnrow');row.append(B('확인',close,'p87-btn'));bd.append(row);
  box.append(bar,bd);veil.append(box);win.node.append(veil);
 }
 function paint(){
  treeBox.replaceChildren();
  const rootRow=E('div','p87-node p87-node-root');rootRow.append(E('span','p87-ico p87-ico-pc'),E('b','',spec.pcName));
  treeBox.append(rootRow);
  for(const cat of cats){
   const isOpen=openState.get(cat.c);
   const row=B((isOpen?'-':'+')+'  '+cat.c,()=>{openState.set(cat.c,!openState.get(cat.c));paint()},'p87-node p87-node-cat');
   treeBox.append(row);
   if(isOpen)for(const dev of cat.items){
    const dr=B(dev.n,()=>{},'p87-node p87-node-dev');
    dr.addEventListener('dblclick',()=>props(dev,cat.c));
    dr.addEventListener('click',()=>{for(const x of treeBox.children)x.classList?.remove('p87-selected');dr.classList.add('p87-selected')});
    treeBox.append(dr);
   }
  }
 }
 paint();
 treeBox.append(E('p','p87-hint','장치를 두 번 누르면 등록 정보가 열립니다.'));
 return win;
}

/* ───────── 프로그램 추가/제거 ───────── */
function openPrograms(ctx,spec){
 const{windowFor,E,B}=ctx;
 const win=windowFor('addremove','프로그램 추가/제거');
 win.content.replaceChildren();
 const shell=E('div','p87-prog');
 const side=E('div','p87-prog-side');
 for(const[label,on]of[['설치된 프로그램 변경 또는 제거',true],['새 프로그램 추가',false],['Windows 구성 요소 추가/제거',false],['프로그램 액세스 및 기본값 설정',false]])side.append(B(label,()=>{if(!on)msg()},'p87-prog-tab'+(on?' p87-tab-on':'')));
 const main=E('div','p87-prog-main');
 const msg=()=>{const veil=E('div','p87-veil'),box=E('div','p87-msg'),bar=E('div','p87-msg-bar');const close=()=>veil.remove();bar.append(E('strong','','프로그램 추가/제거'),B('×',close,'p87-msg-x'));const bd=E('div','p87-msg-body');bd.append(E('span','p87-msg-ico p87-msg-stop','×'),E('p','',RESTRICT));const row=E('div','p87-btnrow');row.append(B('확인',close,'p87-btn'));box.append(bar,bd,row);veil.append(box);win.node.append(veil)};
 const head=E('div','p87-prog-head');head.append(E('span','','현재 설치된 프로그램:'),E('span','','정렬 기준(S): 이름'));
 const list=E('div','p87-prog-list');
 let sel=null;
 const rows=programList(ctx.games);
 const detail=E('div','p87-prog-detail');
 function paint(){
  list.replaceChildren();detail.replaceChildren();
  for(const r of rows){
   const b=E('button','p87-prog-row'+(sel===r?' p87-selected':''));b.type='button';
   const nm=E('span','p87-prog-name');nm.append(E('i','p87-prog-ico'),E('b','',r.name));
   b.append(nm);
   b.addEventListener('click',()=>{sel=r;paint()});
   list.append(b);
  }
  if(sel){
   detail.append(E('b','',sel.name));
   const g=E('div','p87-prog-meta');
   if(sel.size)g.append(E('span','','크기　　　'+sel.size));
   g.append(E('span','','사용 빈도　'+sel.freq),E('span','','마지막으로 사용한 날짜　'+sel.last));
   detail.append(g);
   detail.append(B('제거',msg,'p87-btn'));
  }else detail.append(E('span','p87-hint','프로그램을 선택하면 자세한 정보가 보입니다.'));
 }
 paint();
 main.append(head,list,detail);
 shell.append(side,main);win.content.append(shell);
 return win;
}

/* ───────── 내 네트워크 환경 ───────── */
function openNetwork(ctx,spec){
 const{windowFor,E,B}=ctx;
 const win=windowFor('network','내 네트워크 환경');
 win.content.replaceChildren();
 const shell=E('div','p87-net');
 shell.append(E('div','xp79-menu-row','파일(F)　편집(E)　보기(V)　즐겨찾기(A)　도구(T)　도움말(H)'));
 const addr=E('div','p87-address');addr.append(E('span','','주소(D)'),E('div','p87-addr-box','WORKGROUP'));
 shell.append(addr);
 const grid=E('div','p87-netgrid');
 const names=[];for(let i=1;i<=20;i++)names.push('PC'+String(i).padStart(2,'0'));
 names.push('SERVER');
 for(const n of names){
  const b=B('',()=>{},'p87-netitem');b.append(E('span','p87-ico p87-ico-pc'),E('span','',n===spec.pcName?n+' (이 컴퓨터)':n));
  b.addEventListener('dblclick',()=>{
   const veil=E('div','p87-veil'),box=E('div','p87-msg'),bar=E('div','p87-msg-bar');const close=()=>veil.remove();
   bar.append(E('strong','','\\\\'+n),B('×',close,'p87-msg-x'));
   const bd=E('div','p87-msg-body');
   bd.append(E('span','p87-msg-ico p87-msg-stop','×'),E('p','',n===spec.pcName?'이 컴퓨터의 공유 폴더가 없습니다.':'\\\\'+n+'에 액세스할 수 없습니다. 이 네트워크 리소스를 사용할 권한이 없을 수 있습니다. 권한이 있는지 네트워크 관리자에게 문의하십시오.'));
   const row=E('div','p87-btnrow');row.append(B('확인',close,'p87-btn'));box.append(bar,bd,row);veil.append(box);win.node.append(veil);
  });
  grid.append(b);
 }
 shell.append(grid,E('p','p87-hint','컴퓨터를 두 번 누르면 공유 폴더에 연결합니다.'));
 win.content.append(shell);
 return win;
}

w.PCSystem={version:VERSION,specFor,seatOf,open,openViewer,openWallDialog,openProps,openDevices,openPrograms,openNetwork,programList,deviceTree,gb,NOW_LABEL,fakeDate,sizeLabel,imageNodes};
})(window);
