/* A90: PC방 컴퓨터 바탕화면의 2006년 기믹 모음. A93: 내 그림 저장 목록(pics)과 그림 파일 바탕 화면(wallImg)이 더해졌다.
   알림 풍선, 대화 상자, 우클릭 메뉴, 트레이, 흐르는 시계와 달력, 새 폴더와 휴지통, 화면 등록 정보와 화면보호기,
   작업 관리자와 블루스크린, 컴퓨터 끄기. 그림 파일과 소리는 쓰지 않고 색과 도형으로만 그린다. */
(function(w){'use strict';
const WD=['일','월','화','수','목','금','토'];
const DEF=()=>({wallpaper:'bliss',saver:'stars',saverMin:5,items:[],trash:[],popupBlock:false,realtime:true,bars:0,infected:false,smash:false,setupFile:false,nick:'',status:'online',bestMine:{},bestType:0,paint:'',pics:[],wallImg:{url:'',name:'',mode:'fill'}});
const WALL={bliss:['Bliss (기본 배경)',''],blue:['파란 바탕','#3a6ea5'],teal:['청록 바탕','#008080'],black:['검은 바탕','#000'],check:['체크 무늬','repeating-conic-gradient(#8fa0b8 0% 25%,#c8d2e0 0% 50%) 0 0/36px 36px'],paint:['내가 그린 그림 (그림판)',''],image:['그림 파일','']};
const SAVERS=[['none','(없음)'],['stars','별 날기'],['text','떠다니는 글자'],['bubbles','거품']];
const PROCS=[['System Idle Process',0,'idle'],['System',236,'crit'],['smss.exe',388,'crit'],['csrss.exe',4112,'crit'],['winlogon.exe',3568,'crit'],['services.exe',2960,'crit'],['lsass.exe',1240,'crit'],['svchost.exe',4888,'svc'],['svchost.exe',3412,'svc'],['explorer.exe',17640,'shell'],['ctfmon.exe',2760,'svc']];
const APPPROC={browser:['iexplore.exe',12480],minesweeper:['winmine.exe',3260],paint:['mspaint.exe',6120],calc:['calc.exe',2480],typing:['hantyping.exe',4380],messenger:['buddybuddy.exe',9840],notepad:['notepad.exe',2800],games:['gamestation.exe',7120],club:['iexplore.exe',9020],antivirus:['vdoumi.exe',8240],p2p:['madang.exe',7740],taskmgr:['taskmgr.exe',3640],display:['rundll32.exe',2200],'dl-smash':['iexplore.exe',11800],'setup-smash':['setup.exe',3120]};
const up=(n,c)=>{for(;n;n=n.parentNode)if(n.classList&&n.classList.contains(c))return n;return null};
const inside=(a,b)=>{for(;b;b=b.parentNode)if(b===a)return true;return false};
/* A93: 내 그림(그림판에서 저장한 파일)과 그림 배경. 크기와 모양을 엄격하게 거른다. */
const PIC_RE=/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]{20,300000}$/,SRV_RE=/^assets\/pc-desktop\/incoming\/[A-Za-z0-9%._~*'()!-]{1,300}$/,PIC_MAX=12,PIC_TOTAL=1500000,WMODES=['fill','center','tile'];
const fileName=n=>{const v=String(n==null?'':n).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,40);return v||'그림.png'};
const dim=(n,d)=>{n=Number(n);return Number.isFinite(n)&&n>=1&&n<=4096?Math.round(n):d};
function cleanPics(a){const out=[],ids=new Set();let tot=0;for(const p of Array.isArray(a)?a:[]){if(!p||typeof p.id!=='string'||!/^[a-z0-9]{1,24}$/.test(p.id)||ids.has(p.id)||typeof p.url!=='string'||!PIC_RE.test(p.url))continue;if(out.length>=PIC_MAX||tot+p.url.length>PIC_TOTAL)break;ids.add(p.id);tot+=p.url.length;out.push({id:p.id,name:fileName(p.name),url:p.url,w:dim(p.w,480),h:dim(p.h,320)})}return out}
function cleanWall(v,pics){v=v&&typeof v==='object'&&!Array.isArray(v)?v:{};const mode=WMODES.includes(v.mode)?v.mode:'fill',url=typeof v.url==='string'?v.url:'';const ok=SRV_RE.test(url)||(/^pic:[a-z0-9]{1,24}$/.test(url)&&pics.some(p=>'pic:'+p.id===url));return ok?{url,name:fileName(v.name).slice(0,40),mode}:{url:'',name:'',mode}}
function xs(X){const s=X.saved;if(!s.xp||typeof s.xp!=='object'||Array.isArray(s.xp))s.xp={};const x=s.xp,def=DEF();for(const k of Object.keys(def)){const v=def[k];if(Array.isArray(v)?!Array.isArray(x[k]):(v&&typeof v==='object')?!(x[k]&&typeof x[k]==='object'&&!Array.isArray(x[k])):typeof x[k]!==typeof v)x[k]=v}
 x.items=x.items.filter(i=>i&&typeof i.id==='string'&&['folder','text'].includes(i.kind)&&typeof i.name==='string').slice(0,12).map(i=>({id:i.id,kind:i.kind,name:i.name.slice(0,24),text:typeof i.text==='string'?i.text.slice(0,2000):''}));
 x.trash=x.trash.filter(i=>i&&typeof i.id==='string'&&typeof i.name==='string').slice(0,24);delete x.orders;x.saverMin=[1,2,5,10,15].includes(x.saverMin)?x.saverMin:5;x.bars=Math.max(0,Math.min(3,x.bars|0));
 if(!SAVERS.some(s=>s[0]===x.saver))x.saver='stars';if(!WALL[x.wallpaper])x.wallpaper='bliss';if(typeof x.paint!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/=]{20,400000}$/.test(x.paint))x.paint='';x.pics=cleanPics(x.pics);x.wallImg=cleanWall(x.wallImg,x.pics);if(x.wallpaper==='image'&&!x.wallImg.url)x.wallpaper='bliss';return x}

const IDS=['display','taskmgr','network','calendar','trash','folder-item','text-item'];
let X=null,S=null,UI=null;

function attach(ctx){
 X=ctx;S=xs(X);const {E,B,listen,desk,taskbar}=X;
 /* A93: 예전 그림판이 한 장만 따로 저장해 둔 그림을 내 그림 목록으로 옮긴다 */
 if(S.paint&&S.paint.length<=300000&&S.pics.length<PIC_MAX&&!S.pics.some(p=>p.url===S.paint)){S.pics.push({id:'p0old',name:'이전 그림.png',url:S.paint,w:480,h:320});S.paint='';if(S.wallpaper==='paint'){S.wallImg={url:'pic:p0old',name:'이전 그림.png',mode:'fill'};S.wallpaper='image'}}
 const timers=[],flags={},log=[];let toastBox=null,menuNode=null,modals=[],saverNode=null,saverStop=null,lastAct=Date.now(),bsodNode=null,standby=null,hiddenShell=false,userNodes=[],itemNo=0;
 const later=(fn,ms)=>{const t=w.setTimeout(()=>{if(alive)fn()},ms);timers.push(t);return t};let alive=true;
 const initial=X.remaining();
 /* ---- 알림 풍선 ---- */
 toastBox=E('div','xp-toasts');toastBox.setAttribute('aria-live','polite');desk.append(toastBox);
 function toast(o){
  const n=E('div','xp-toast'+(o.kind?' '+o.kind:'')),head=E('div','xp-toast-head');let dead=false;
  const kill=()=>{if(dead)return;dead=true;n.remove()};
  head.append(E('i','xp-toast-ico '+(o.icon||'info')),E('b','',o.title||''),B('×',kill,'xp-toast-x'));n.append(head,E('p','xp-toast-body',o.text||''));
  if(o.onClick){n.classList.add('click');n.addEventListener('click',e=>{if(e.target&&e.target.classList&&e.target.classList.contains('xp-toast-x'))return;kill();o.onClick()})}
  toastBox.append(n);while(toastBox.children.length>3)toastBox.children[0].remove();log.push((o.title||'')+' | '+(o.text||''));if(log.length>60)log.shift();
  if(o.ms!==0)later(kill,o.ms||7000);return n}
 /* ---- 대화 상자 ---- */
 function dialog(o){
  const ov=E('div','xp-modal'),box=E('section','xp-dialog'),bar=E('div','xp-dialog-bar'),body=E('div','xp-dialog-body'),foot=E('div','xp-dialog-foot');let dead=false;
  const close=()=>{if(dead)return;dead=true;ov.remove();modals=modals.filter(m=>m!==api)};
  const api={close,node:ov,cancel:()=>{close();o.onCancel&&o.onCancel()}};
  box.setAttribute('role','alertdialog');box.setAttribute('aria-label',o.title||'알림');bar.append(E('strong','',o.title||''),B('×',api.cancel,'xp-dialog-x'));
  body.append(E('i','xp-dialog-ico '+(o.icon||'info')),o.node||E('p','',o.text||''));
  for(const [label,fn,cls] of o.buttons||[['확인']])foot.append(B(label,()=>{close();fn&&fn()},'xp-dialog-btn'+(cls?' '+cls:'')));
  box.append(bar,body,foot);ov.append(box);ov.addEventListener('pointerdown',e=>{if(e.stopPropagation)e.stopPropagation()});desk.append(ov);modals.push(api);return api}
 /* ---- 우클릭 메뉴 ---- */
 function closeMenu(){if(menuNode){menuNode.remove();menuNode=null}}
 function menu(x,y,items){
  closeMenu();const m=E('div','xp-menu');
  const build=(host,list)=>{for(const it of list){if(it==='-'){host.append(E('hr'));continue}const [label,fn,o]=it;
   if(o&&o.sub){const g=E('div','xp-menu-group'),sub=E('div','xp-menu-sub');sub.hidden=true;const b=B(label+'  ▶',()=>{sub.hidden=!sub.hidden},'xp-menu-item');g.append(b,sub);build(sub,o.sub);host.append(g);continue}
   const b=B(label,()=>{closeMenu();fn&&fn()},'xp-menu-item');if(o&&o.disabled)b.disabled=true;if(o&&o.bold)b.classList.add('bold');host.append(b)}};
  build(m,items);const W=desk.clientWidth||900,H=desk.clientHeight||600;m.style.left=Math.max(0,Math.min(x,W-180))+'px';m.style.top=Math.max(0,Math.min(y,H-(items.length*24+16)))+'px';desk.append(m);menuNode=m;return m}
 const down=e=>{lastAct=Date.now();if(menuNode&&!inside(menuNode,e.target))closeMenu()};listen(desk,'pointerdown',down);
 listen(desk,'pointermove',()=>{lastAct=Date.now()});
 const kd=e=>{lastAct=Date.now();const hit=bsodNode||saverNode||standby;if(!hit)return;e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();if(bsodNode)later(()=>api.bsodGo&&api.bsodGo(),0);else if(saverNode)stopSaver();else if(standby)api.wake&&api.wake()};desk.addEventListener('keydown',kd,true);
 /* ---- 트레이와 시계 ---- */
 const tray=E('div','xp-tray'),clock=X.clockEl;
 const trayBtn=(cls,label,run)=>{const b=B('',run,'xp-tray-btn '+cls);b.title=label;b.setAttribute('aria-label',label);tray.append(b);return b};
 const trayMsg=trayBtn('msg','버디버디',()=>X.openApp('messenger')),trayNet=trayBtn('net','네트워크 연결됨',()=>X.openApp('network')),trayAv=trayBtn('av','바이러스 도우미',()=>X.openApp('antivirus'));
 taskbar.insertBefore(tray,clock);
 const fakeMin=rem=>{const el=Math.max(0,initial-rem);return 16*60+32+Math.floor(el/60)};
 const clockText=rem=>{const t=fakeMin(rem),h24=Math.floor(t/60)%24,m=t%60;return (h24>=12?'오후 ':'오전 ')+(h24%12||12)+':'+String(m).padStart(2,'0')};
 clock.setAttribute('role','button');clock.tabIndex=0;clock.title='2006년 5월 30일 화요일';listen(clock,'click',()=>X.openApp('calendar'));listen(clock,'keydown',e=>{if(e.key==='Enter')X.openApp('calendar')});
 /* ---- 바탕화면 배경 ---- */
 /* A93: 그림 파일 배경. 내 그림은 'pic:번호'로 가리키고, Incoming 그림은 주소로 가리킨다. */
 const picUrl=id=>{const p=S.pics.find(q=>q.id===id);return p?p.url:''};
 function wallUrl(img){if(!img||typeof img.url!=='string')return '';if(img.url.slice(0,4)==='pic:')return picUrl(img.url.slice(4));return SRV_RE.test(img.url)?img.url:''}
 function wallCss(img,mini){const u=wallUrl(img);if(!u)return '';const q='url("'+u+'")';return img.mode==='tile'?q+(mini?' 0 0/30px auto repeat':' 0 0/auto repeat'):img.mode==='center'?'#3a6ea5 '+q+(mini?' center/contain no-repeat':' center/auto no-repeat'):'#000 '+q+' center/cover no-repeat'}
 function wallpaper(name){if(!WALL[name])name='bliss';if(name==='paint'&&!S.paint)name='bliss';if(name==='image'&&!wallCss(S.wallImg))name='bliss';S.wallpaper=name;desk.style.background=name==='bliss'?'':name==='paint'?'url('+S.paint+') center/cover':name==='image'?wallCss(S.wallImg):WALL[name][1];X.save()}
 function probeWall(img){if(!w.Image)return;try{const im=new w.Image();im.onerror=()=>{if(S.wallImg!==img||S.wallpaper!=='image')return;wallpaper('bliss');toast({title:'바탕 화면',text:'그림 파일을 읽을 수 없어 기본 배경으로 되돌렸습니다.',icon:'warn',ms:4500})};im.src=wallUrl(img)}catch(_){}}
 function wallImage(url,name,mode){const img={url:String(url||''),name:fileName(name).slice(0,40),mode:WMODES.includes(mode)?mode:'fill'};if(!wallCss(img))return false;S.wallImg=img;wallpaper('image');probeWall(img);return true}
 /* A93: 그림판이 저장한 그림(내 문서 안의 내 그림 폴더에 보인다) */
 function picSave(name,url,w0,h0){const nm=fileName(name);if(typeof url!=='string'||!PIC_RE.test(url))return{ok:false,why:'big'};
  const at=S.pics.findIndex(p=>p.name===nm);if(at<0&&S.pics.length>=PIC_MAX)return{ok:false,why:'full'};
  if(S.pics.reduce((a,p,i)=>a+(i===at?0:p.url.length),0)+url.length>PIC_TOTAL)return{ok:false,why:'space'};
  const pic={id:at>=0?S.pics[at].id:'p'+Date.now().toString(36)+(++itemNo),name:nm,url,w:dim(w0,480),h:dim(h0,320)};
  if(at>=0)S.pics[at]=pic;else S.pics.push(pic);X.save();if(S.wallpaper==='image'&&S.wallImg.url==='pic:'+pic.id)wallpaper('image');return{ok:true,pic:{...pic},replaced:at>=0}}
 function picDelete(id){const at=S.pics.findIndex(p=>p.id===id);if(at<0)return false;S.pics.splice(at,1);if(S.wallImg.url==='pic:'+id){S.wallImg={url:'',name:'',mode:S.wallImg.mode};if(S.wallpaper==='image')wallpaper('bliss')}X.save();return true}
 const picList=()=>S.pics.map(p=>({...p}));
 /* ---- 새 폴더와 휴지통 ---- */
 function uniqueName(base,ext){const names=S.items.map(i=>i.name);if(!names.includes(base+ext))return base+ext;for(let n=2;n<30;n++)if(!names.includes(base+' ('+n+')'+ext))return base+' ('+n+')'+ext;return base+' ('+Date.now()%1000+')'+ext}
 function renderItems(){
  for(const n of userNodes)n.remove();userNodes=[];
  for(const it of S.items){const b=X.shortcut(it.kind==='folder'?'folder':'note',it.name,()=>openItem(it));if(!b)continue;b.classList.add('xp-useritem');b.setAttribute('data-item',it.id);
   b.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();{const r=desk.getBoundingClientRect?desk.getBoundingClientRect():{left:0,top:0};menu((e.clientX||40)-r.left,(e.clientY||40)-r.top,[['열기',()=>openItem(it),{bold:true}],'-',['이름 바꾸기',()=>rename(it)],['삭제',()=>remove(it)]])}});userNodes.push(b)}}
 function addItem(kind){if(S.items.length>=12){toast({title:'바탕 화면',text:'바탕 화면에 만들 수 있는 항목은 12개까지입니다.',icon:'warn'});return null}
  const it={id:'u'+Date.now().toString(36)+(++itemNo),kind,name:kind==='folder'?uniqueName('새 폴더',''):uniqueName('새 텍스트 문서','.txt'),text:''};S.items.push(it);X.save();renderItems();rename(it);return it}
 function rename(it){const input=E('input','xp-rename');input.type='text';input.maxLength=24;input.value=it.name;input.setAttribute('aria-label','새 이름');const box=E('div');box.append(E('p','','새 이름을 입력하세요.'),input);
  const ok=()=>{const v=input.value.replace(/[\\/:*?"<>|]/g,'').trim().slice(0,24);if(!v)return;it.name=v;X.save();renderItems()};
  const dlg=dialog({title:'이름 바꾸기',node:box,icon:'info',buttons:[['확인',ok],['취소']]});input.addEventListener('keydown',e=>{if(e.stopPropagation)e.stopPropagation();if(e.key==='Enter'){ok();dlg.close()}});input.focus&&input.focus();return dlg}
 function remove(it){S.items=S.items.filter(i=>i!==it);S.trash=[it,...S.trash].slice(0,24);X.save();renderItems();X.closeWin('item-'+it.id);toast({title:'휴지통',text:'"'+it.name+'" 을(를) 휴지통으로 옮겼습니다.',icon:'info',ms:3500})}
 function openItem(it){
  const win=X.windowFor('item-'+it.id,it.name+(it.kind==='text'?' - 메모장':''));win.caption.textContent=it.name+(it.kind==='text'?' - 메모장':'');win.content.replaceChildren();
  if(it.kind==='folder'){win.content.append(E('div','xp79-menu-row','파일(F)　편집(E)　보기(V)　즐겨찾기(A)　도구(T)　도움말(H)'),E('p','xp-empty','이 폴더는 비어 있습니다.'));return}
  const ta=E('textarea','xp79-notepad');ta.value=it.text;ta.maxLength=2000;ta.setAttribute('aria-label',it.name+' 내용');const st=E('p','xp79-muted','');
  win.content.append(E('div','xp79-menu-row','파일(F)　편집(E)　서식(O)　보기(V)　도움말(H)'),ta,B('저장',()=>{it.text=ta.value.slice(0,2000);X.save();st.textContent=it.name+' 저장됨'}),st)}
 function trashWin(){
  const win=X.windowFor('trash','휴지통');win.content.replaceChildren();
  const draw=()=>{win.content.replaceChildren(E('div','xp79-menu-row','파일(F)　편집(E)　보기(V)　즐겨찾기(A)　도구(T)　도움말(H)'));
   if(!S.trash.length){win.content.append(E('p','xp-empty','휴지통이 비어 있습니다.'));return}
   const list=E('div','xp-trash-list');for(const it of S.trash){const row=E('div','xp-trash-row');row.append(E('span','',(it.kind==='folder'?'[폴더] ':'[문서] ')+it.name),B('복원',()=>{if(S.items.length>=12)return toast({title:'휴지통',text:'바탕 화면이 가득 차서 복원할 수 없습니다.',icon:'warn'});S.trash=S.trash.filter(i=>i!==it);S.items.push({id:it.id,kind:it.kind,name:it.name,text:it.text||''});X.save();renderItems();draw()},'xp-mini'));list.append(row)}
   win.content.append(list,B('휴지통 비우기',()=>{dialog({title:'파일 삭제 확인',text:'휴지통의 항목 '+S.trash.length+'개를 모두 삭제하시겠습니까?',icon:'ask',buttons:[['예',()=>{S.trash=[];X.save();draw()}],['아니요']]})},'xp-mini wide'))};
  draw()}
 /* ---- 화면 등록 정보 ---- */
 function displayWin(){
  const win=X.windowFor('display','화면 등록 정보');win.node.classList.add('xp-small');win.node.style.width='min(420px,94%)';win.node.style.height='min(470px,92%)';win.node.style.left='6%';win.node.style.top='4%';win.content.replaceChildren();
  let tab='bg',wall=S.wallpaper==='paint'?'bliss':S.wallpaper,saver=S.saver,mins=S.saverMin,mode=S.wallImg.mode;const draw=()=>{
   win.content.replaceChildren();const tabs=E('div','xp-tabs');for(const [id,label] of [['bg','배경 화면'],['ss','화면 보호기']])tabs.append(B(label,()=>{tab=id;draw()},'xp-tab'+(tab===id?' on':'')));win.content.append(tabs);
   const pane=E('div','xp-pane');
   if(tab==='bg'){const mon=E('div','xp-monitor'),scr=E('div','xp-monitor-screen');scr.style.background=wall==='bliss'?'#5594ce url(assets/pc-desktop/hill.webp) center/cover':wall==='image'?(wallCss({url:S.wallImg.url,mode},true)||'#5594ce'):(WALL[wall]||WALL.blue)[1];mon.append(scr);pane.append(mon,E('b','','배경 화면(K):'));
    const list=E('div','xp-list');for(const [id,[label]] of Object.entries(WALL)){if(id==='paint')continue;if(id==='image'&&!wallCss(S.wallImg))continue;const b=B(id==='image'?'(그림) '+S.wallImg.name:label,()=>{wall=id;draw()},'xp-opt'+(wall===id?' on':''));list.append(b)}pane.append(list);
    if(wall==='image'){const row=E('div','xp-row xp-wallmode');row.append(E('span','','위치(P):'));for(const [id,label] of [['fill','확대'],['center','가운데'],['tile','바둑판식']])row.append(B(label,()=>{mode=id;draw()},'xp-mini'+(mode===id?' on':'')));pane.append(row)}
    pane.append(B('찾아보기(B)...',()=>X.openApp('mydocs'),'xp-mini wide'))}
   else{const mon=E('div','xp-monitor'),scr=E('div','xp-monitor-screen saver');scr.append(E('span','',saver==='none'?'':saver==='stars'?'✦ ✧ ✦':saver==='text'?'Windows XP':'○ ◦ ○'));mon.append(scr);pane.append(mon,E('b','','화면 보호기(S):'));
    const list=E('div','xp-list');for(const [id,label] of SAVERS)list.append(B(label,()=>{saver=id;draw()},'xp-opt'+(saver===id?' on':'')));pane.append(list);
    const row=E('div','xp-row');row.append(E('span','','대기(W):'));for(const m of [1,2,5,10,15])row.append(B(m+'분',()=>{mins=m;draw()},'xp-mini'+(mins===m?' on':'')));pane.append(row,B('미리 보기(V)',()=>{if(saver!=='none')startSaver(saver,true)},'xp-mini wide'))}
   win.content.append(pane);
   const foot=E('div','xp-dialog-foot');const apply=()=>{if(wall==='image')S.wallImg={...S.wallImg,mode};wallpaper(wall);S.saver=saver;S.saverMin=mins;X.save()};foot.append(B('확인',()=>{apply();X.closeWin('display')},'xp-dialog-btn'),B('취소',()=>X.closeWin('display'),'xp-dialog-btn'),B('적용(A)',apply,'xp-dialog-btn'));win.content.append(foot)};
  draw()}
 /* ---- 화면 보호기 ---- */
 function stopSaver(){if(saverStop){saverStop();saverStop=null}if(saverNode){saverNode.remove();saverNode=null}lastAct=Date.now()}
 function startSaver(kind,preview){
  if(saverNode||bsodNode||!kind||kind==='none')return false;const ov=E('div','xp-saver'),cv=E('canvas','xp-saver-cv');ov.setAttribute('aria-label','화면 보호기');
  const W=Math.max(320,desk.clientWidth||900),H=Math.max(240,desk.clientHeight||600);cv.width=W;cv.height=H;ov.append(cv);if(preview)ov.append(E('p','xp-saver-tip','마우스를 움직이거나 키를 누르면 돌아갑니다.'));desk.append(ov);saverNode=ov;
  let sx=null,sy=null;const end=()=>stopSaver();ov.addEventListener('pointerdown',end);ov.addEventListener('pointermove',e=>{if(sx===null){sx=e.clientX;sy=e.clientY;return}if(Math.abs(e.clientX-sx)+Math.abs(e.clientY-sy)>6)end()});
  const g=cv.getContext?cv.getContext('2d'):null;let raf=0,on=true;saverStop=()=>{on=false;if(raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(raf)};if(!g||!w.requestAnimationFrame)return true;
  const stars=Array.from({length:150},()=>({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()}));const bubbles=Array.from({length:26},()=>({x:Math.random()*W,y:Math.random()*H,r:8+Math.random()*30,v:20+Math.random()*50}));
  const tx={x:60,y:80,vx:110,vy:80,c:0};let last=0;const COL=['#ffcf3a','#6ee27a','#6cb6ff','#ff7b7b','#d59bff'];
  const frame=ts=>{if(!on)return;const dt=last?Math.min(.05,(ts-last)/1000):.016;last=ts;g.fillStyle='#000';g.fillRect(0,0,W,H);
   if(kind==='stars'){for(const s of stars){s.z-=dt*.35;if(s.z<=.02){s.x=Math.random()*2-1;s.y=Math.random()*2-1;s.z=1}const px=W/2+s.x/s.z*W*.22,py=H/2+s.y/s.z*W*.22,r=Math.max(.6,(1-s.z)*3);g.fillStyle='rgba(255,255,255,'+(1-s.z*.6)+')';g.beginPath();g.arc(px,py,r,0,7);g.fill()}}
   else if(kind==='text'){g.font='bold 46px Georgia,serif';const wd=g.measureText?g.measureText('Windows XP').width:300;tx.x+=tx.vx*dt;tx.y+=tx.vy*dt;if(tx.x<0||tx.x+wd>W){tx.vx=-tx.vx;tx.c++}if(tx.y<46||tx.y>H-10){tx.vy=-tx.vy;tx.c++}tx.x=Math.max(0,Math.min(W-wd,tx.x));tx.y=Math.max(46,Math.min(H-10,tx.y));g.fillStyle=COL[tx.c%COL.length];g.fillText('Windows XP',tx.x,tx.y)}
   else{for(const b of bubbles){b.y-=b.v*dt;if(b.y<-b.r){b.y=H+b.r;b.x=Math.random()*W}g.strokeStyle='rgba(150,210,255,.8)';g.lineWidth=2;g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.stroke();g.fillStyle='rgba(150,210,255,.12)';g.fill()}}
   raf=w.requestAnimationFrame(frame)};raf=w.requestAnimationFrame(frame);return true}
 const idle=w.setInterval(()=>{if(!alive||saverNode||bsodNode||standby||S.saver==='none'||X.booting())return;if(Date.now()-lastAct>=S.saverMin*60000)startSaver(S.saver)},2000);timers.push(idle);
 /* ---- 블루스크린과 다시 시작 ---- */
 function bsod(){
  if(bsodNode)return;stopSaver();closeMenu();for(const m of [...modals])m.close();const n=E('div','xp-bsod');n.tabIndex=0;n.setAttribute('role','alert');
  n.append(E('p','','Windows'),E('p','','시스템에 심각한 문제가 발생해 컴퓨터를 보호하려고 Windows를 종료했습니다.'),E('p','','이 화면이 처음 나타났다면 컴퓨터를 다시 시작하세요. 같은 화면이 계속 나타나면 최근에 설치한 프로그램을 지우거나 하드웨어 제조사에 문의하세요.'),E('p','','기술 정보:'),E('p','','*** STOP: 0x000000F4 (0x00000003, 0x86F4A7C0, 0x86F4A92C, 0x805D1E5A)'),E('p','','아무 키나 누르면 컴퓨터를 다시 시작합니다.'));
  desk.append(n);bsodNode=n;const go=()=>{if(!bsodNode)return;bsodNode.remove();bsodNode=null;X.restart()};n.addEventListener('pointerdown',()=>later(go,0));n.addEventListener('keydown',()=>later(go,0));n.focus&&n.focus();api.bsodGo=go}
 function standbyMode(){const n=E('div','xp-standby');n.append(E('p','','대기 모드'),E('small','','마우스를 움직이거나 키를 누르면 돌아옵니다.'));desk.append(n);standby=n;const t0=Date.now();const wake=()=>{if(Date.now()-t0<700)return;n.remove();standby=null};n.addEventListener('pointerdown',wake);n.addEventListener('pointermove',wake);api.wake=()=>{n.remove();standby=null}}
 function shutdownDialog(){
  const box=E('div','xp-shutbox');box.append(E('p','','컴퓨터를 어떻게 하시겠습니까?'));const row=E('div','xp-shutrow');
  const dlg=dialog({title:'컴퓨터 끄기',node:box,icon:'power',buttons:[['취소']]});
  for(const [label,fn] of [['대기 모드',()=>{dlg.close();standbyMode()}],['끄기',()=>{dlg.close();shutdown()}],['다시 시작',()=>{dlg.close();X.restart()}]])row.append(B(label,fn,'xp-power'));box.append(row);return dlg}
 function shutdown(){const n=E('div','xp-shutdown');n.append(E('p','','Windows를 종료하는 중입니다...'));desk.append(n);later(()=>{n.remove();X.options.onLogout&&X.options.onLogout()},1800)}
 /* ---- 작업 관리자 ---- */
 function taskWin(){
  const win=X.windowFor('taskmgr','Windows 작업 관리자');win.node.classList.add('xp-small');win.node.style.width='min(460px,96%)';win.node.style.height='min(430px,92%)';win.node.style.left='8%';win.node.style.top='5%';
  let tab='app',sel=-1,cpu=[];const draw=()=>{
   win.content.replaceChildren();const tabs=E('div','xp-tabs');for(const [id,label] of [['app','응용 프로그램'],['proc','프로세스'],['perf','성능']])tabs.append(B(label,()=>{tab=id;sel=-1;draw()},'xp-tab'+(tab===id?' on':'')));win.content.append(tabs);const pane=E('div','xp-pane tm');
   if(tab==='app'){const rows=[...X.windows.values()].filter(x=>x.id!=='taskmgr');const list=E('div','xp-table');{const h=E('div','xp-tr head');h.append(E('span','','작업'),E('span','','상태'));list.append(h)}rows.forEach((x,i)=>{const tr=B('',()=>{sel=i;draw()},'xp-tr'+(sel===i?' on':''));tr.append(E('span','',x.caption.textContent),E('span','','실행 중'));list.append(tr)});if(!rows.length)list.append(E('p','xp-empty','실행 중인 응용 프로그램이 없습니다.'));pane.append(list);
    const foot=E('div','xp-row');foot.append(B('작업 끝내기(E)',()=>{const x=rows[sel];if(x){X.closeWin(x.id);sel=-1;draw()}},'xp-mini'),B('전환(S)',()=>{const x=rows[sel];if(x)X.focusWin(x)},'xp-mini'));pane.append(foot)}
   else if(tab==='proc'){const procs=processes();const list=E('div','xp-table');{const h=E('div','xp-tr head');h.append(E('span','','이미지 이름'),E('span','','메모리 사용'));list.append(h)}procs.forEach((p,i)=>{const tr=B('',()=>{sel=i;draw()},'xp-tr'+(sel===i?' on':'')+(p.bad?' bad':''));tr.append(E('span','',p.name),E('span','',p.mem.toLocaleString('ko-KR')+' K'));list.append(tr)});pane.append(list);
    pane.append(B('프로세스 끝내기(E)',()=>{const p=procs[sel];if(p)endProcess(p,draw)},'xp-mini wide'));pane.append(E('p','xp-note','프로세스 수: '+procs.length))}
   else{const cur=Math.min(96,8+X.windows.size*7+Math.floor(Math.random()*9)+(S.infected?25:0)+S.bars*4);cpu.push(cur);if(cpu.length>40)cpu.shift();const g=E('div','xp-graph');for(const v of cpu){const bar=E('i');bar.style.height=v+'%';g.append(bar)}pane.append(E('b','','CPU 사용'),E('p','xp-big',cur+'%'),g,E('p','xp-note','메모리 사용: '+(180+X.windows.size*22+(S.infected?60:0)+S.bars*18)+' MB / 512 MB'))}
   win.content.append(pane)};
  taskWin.refresh=()=>{if(tab==='perf'&&X.windows.get('taskmgr')===win)draw()};draw();return win}
 function processes(){
  const list=PROCS.map(([name,mem,kind])=>({name,mem,kind}));const open=new Set([...X.windows.keys()]);
  for(const [id,[name,mem]] of Object.entries(APPPROC))if(open.has(id)&&!list.some(p=>p.name===name&&p.app===id))list.push({name,mem,kind:'app',app:id});
  for(let i=0;i<S.bars;i++)list.push({name:['tbhelper.exe','fortune_bar.exe','shopnavi.exe'][i],mem:3200+i*900,kind:'bar'});
  if(S.infected)list.push({name:'svch0st.exe',mem:6240,kind:'virus',bad:true});
  for(const p of list)p.mem=p.mem+(p.kind==='idle'?96:0);return list}
 function endProcess(p,redraw){
  if(p.kind==='app'){X.closeWin(p.app);return redraw()}
  if(p.kind==='virus'){S.infected=false;X.save();toast({title:'작업 관리자',text:'svch0st.exe 프로세스를 끝냈습니다. 하지만 다시 나타날 수 있으니 백신으로 검사하세요.',icon:'warn'});return redraw()}
  if(p.kind==='bar'){S.bars=Math.max(0,S.bars-1);X.save();X.net&&X.net.refreshBars&&X.net.refreshBars();return redraw()}
  if(p.kind==='shell'){explorerCrash();return}
  if(p.kind==='idle'||p.name==='ctfmon.exe'){toast({title:'작업 관리자',text:'이 프로세스는 끝낼 수 없습니다.',icon:'warn'});return}
  if(p.kind==='svc'){return dialog({title:'작업 관리자 경고',text:'이 프로세스를 끝내면 시스템이 불안정해질 수 있습니다. 정말 끝내시겠습니까?',icon:'warn',buttons:[['예',()=>bsod()],['아니요']]})}
  dialog({title:'작업 관리자 경고',text:'"'+p.name+'" 은(는) 시스템 핵심 프로세스입니다. 끝내면 데이터를 잃거나 Windows가 종료될 수 있습니다. 정말 끝내시겠습니까?',icon:'warn',buttons:[['예',()=>bsod()],['아니요']]})}
 function explorerCrash(){if(hiddenShell)return;hiddenShell=true;const hide=[X.iconGrid,taskbar,X.manager];for(const n of hide)n.classList.add('xp-gone');later(()=>{for(const n of hide)n.classList.remove('xp-gone');hiddenShell=false;toast({title:'Windows 탐색기',text:'탐색기가 다시 시작되었습니다.',icon:'info'})},2600)}
 /* ---- 달력, 네트워크 ---- */
 function calendarWin(){
  const win=X.windowFor('calendar','날짜 및 시간 등록 정보');win.node.classList.add('xp-small');win.node.style.width='min(330px,92%)';win.node.style.height='min(330px,92%)';win.node.style.left='30%';win.node.style.top='22%';win.content.replaceChildren();
  const grid=E('div','xp-cal'),head=E('p','xp-cal-head','2006년 5월');for(const d of WD)grid.append(E('b','',d));for(let i=0;i<1;i++)grid.append(E('span',''));for(let day=1;day<=31;day++)grid.append(E('span',day===30?'today':'',day));
  const time=E('p','xp-cal-time','');win.content.append(E('div','xp-cal-wrap'));win.content.lastElementChild.append(head,grid,time);calendarWin.time=time;tickClock(X.remaining());return win}
 let netWin=null;const net={sent:1204,recv:3891};
 function networkWin(){
  const win=X.windowFor('network','로컬 영역 연결 상태');win.node.classList.add('xp-small');win.node.style.width='min(320px,92%)';win.node.style.height='min(300px,92%)';win.node.style.left='34%';win.node.style.top='20%';win.content.replaceChildren();
  const box=E('div','xp-net');box.append(E('p','xp-net-state','상태: 연결됨'),E('p','','기간: 00:'+String(Math.floor((initial-X.remaining())/60)).padStart(2,'0')+':'+String((initial-X.remaining())%60).padStart(2,'0')),E('p','','속도: 100.0 Mbps'));const t=E('p','xp-net-pk','');box.append(E('b','','활동'),t);win.content.append(box);netWin={win,t};netTick();return win}
 const netTick=()=>{if(!netWin||X.windows.get('network')!==netWin.win)return;net.sent+=3+Math.floor(Math.random()*40);net.recv+=8+Math.floor(Math.random()*120);netWin.t.textContent='보냄: '+net.sent.toLocaleString('ko-KR')+' 패킷　받음: '+net.recv.toLocaleString('ko-KR')+' 패킷'};
 /* ---- 시작 메뉴 ---- */
 const startMenu=X.startMenu,fly=E('div','xp-allprog');fly.hidden=true;
 const GROUPS=()=>[['보조프로그램',[['그림판','paint'],['계산기','calc'],['메모장','notepad'],['타자 연습','typing'],['작업 관리자','taskmgr']]],['게임',[['지뢰찾기','minesweeper'],['게임 모음','games'],...(S.smash?[['바탕화면 부수기','desksmash']]:[])]],['인터넷',[['Internet Explorer','browser'],['버디버디','messenger'],['마당공유','p2p']]],['시스템 도구',[['바이러스 도우미','antivirus'],['화면 등록 정보','display'],['네트워크 상태','network']]]];
 function buildFly(){fly.replaceChildren();for(const [g,list] of GROUPS()){fly.append(E('b','xp-ap-head',g));for(const [label,id] of list){const it=B(label,()=>{startMenu.hidden=true;fly.hidden=true;X.openApp(id)},'xp-ap-item');if(id==='messenger'){const im=E('img','xp-ap-ico');im.src='assets/pc-desktop/icons/buddy.webp?v=A92';im.alt='';im.draggable=false;it.insertBefore(im,it.firstChild)}fly.append(it)}}}
 buildFly();
 const apBtn=B('모든 프로그램 ▶',()=>{fly.hidden=!fly.hidden},'xp-ap-btn');const last=startMenu.children[startMenu.children.length-1];startMenu.insertBefore(apBtn,last);startMenu.insertBefore(fly,last);startMenu.append(B('컴퓨터 끄기...',()=>{startMenu.hidden=true;fly.hidden=true;shutdownDialog()},'xp-ap-btn'));
 /* ---- 우클릭 ---- */
 listen(desk,'contextmenu',e=>{
  if(up(e.target,'xp79-window')||up(e.target,'xp79-start-menu')||up(e.target,'xp-modal')||up(e.target,'xp-saver')||up(e.target,'xp-bsod')||up(e.target,'ds-layer'))return;
  if(up(e.target,'xp-useritem'))return;const r=desk.getBoundingClientRect?desk.getBoundingClientRect():{left:0,top:0},x=(e.clientX||40)-r.left,y=(e.clientY||40)-r.top;
  if(up(e.target,'xp79-taskbar')){e.preventDefault&&e.preventDefault();menu(x,Math.max(0,y-70),[['바탕 화면 보기(D)',()=>{for(const win of X.windows.values())win.node.hidden=true}],'-',['작업 관리자(K)',()=>X.openApp('taskmgr'),{bold:true}]]);return}
  if(up(e.target,'xp79-manager'))return;
  e.preventDefault&&e.preventDefault();menu(x,y,[['새로 고침(E)',()=>{X.iconGrid.classList.add('xp-gone');later(()=>X.iconGrid.classList.remove('xp-gone'),180)}],'-',['새로 만들기(W)',null,{sub:[['폴더(F)',()=>addItem('folder')],['텍스트 문서',()=>addItem('text')]]}],'-',...(S.smash?[['바탕화면 부수기',()=>X.openApp('desksmash')]]:[]),['화면 등록 정보(R)',()=>X.openApp('display'),{bold:true}]])});
 renderItems();wallpaper(S.wallpaper);if(S.wallpaper==='image')probeWall(S.wallImg);
 /* ---- 시각에 맞춰 일어나는 일 ---- */
 function tickClock(rem){const text=clockText(rem);if(clock.textContent!==text)clock.textContent=text;if(calendarWin.time&&X.windows.get('calendar')){const el=Math.max(0,initial-rem),sec=el%60,m=fakeMin(rem),h=Math.floor(m/60)%24;calendarWin.time.textContent=(h>=12?'오후 ':'오전 ')+(h%12||12)+':'+String(m%60).padStart(2,'0')+':'+String(sec).padStart(2,'0')}}
 function tick(rem){
  tickClock(rem);netTick();trayAv.classList.toggle('bad',!!S.infected);if(X.windows.get('taskmgr')&&taskWin.refresh&&Math.floor(initial-rem)%2===0)taskWin.refresh();
  const el=initial-rem;
  if(rem<=600&&rem>0&&!flags.t10){flags.t10=1;toast({title:'PC방 이용 시간',text:'남은 시간이 10분입니다. 시간을 더 쓰시려면 카운터에서 충전하세요.',icon:'warn',ms:9000})}
  if(rem<=300&&rem>0&&!flags.t5){flags.t5=1;toast({title:'PC방 이용 시간',text:'남은 시간이 5분입니다. 하던 일을 저장해 주세요.',icon:'warn',ms:9000})}
  if(el>=150&&!flags.upd&&initial>600){flags.upd=1;toast({title:'자동 업데이트',text:'컴퓨터를 보호하려면 중요 업데이트를 설치해야 합니다. 여기를 눌러 확인하세요.',icon:'shield',ms:12000,onClick:()=>dialog({title:'자동 업데이트',text:'업데이트를 설치한 뒤 컴퓨터를 다시 시작해야 합니다. 지금 설치하시겠습니까?',icon:'ask',buttons:[['지금 설치',()=>toast({title:'PC방 컴퓨터',text:'이 컴퓨터는 사장님이 관리합니다. 설치는 PC방이 문을 닫은 뒤에 진행됩니다.',icon:'info',ms:8000})],['나중에']]})})}
 }
 function onKey(k,e){
  lastAct=Date.now();
  if(bsodNode){e&&e.preventDefault&&e.preventDefault();api.bsodGo();return true}
  if(saverNode){e&&e.preventDefault&&e.preventDefault();stopSaver();return true}
  if(standby){e&&e.preventDefault&&e.preventDefault();api.wake();return true}
  if(k==='Escape'){if(menuNode){closeMenu();return true}if(modals.length){modals[modals.length-1].cancel();return true}}
  return false}
 /* ---- 목록 ---- */
 const OPEN={display:displayWin,taskmgr:taskWin,network:networkWin,calendar:calendarWin,trash:trashWin};
 const api={ids:['display','taskmgr','network','calendar','trash'],has:id=>!!OPEN[id],open:id=>OPEN[id]&&OPEN[id](),tick,onKey,toast,dialog,menu,closeMenu,bsod,startSaver,stopSaver,wallpaper,wallpaperImage:wallImage,pics:picList,picSave,picDelete,addItem,renderItems,shutdownDialog,standbyMode,processes,endProcess,explorerCrash,buildFly,
  toasts:()=>Array.from(toastBox.children).map(c=>c.textContent),log:()=>log.slice(),state:()=>({wallpaper:S.wallpaper,wallImg:S.wallImg.url?{...S.wallImg}:null,pics:S.pics.map(p=>p.name),saver:S.saver,saverMin:S.saverMin,items:S.items.map(i=>i.name),trash:S.trash.map(i=>i.name),saverOn:!!saverNode,bsod:!!bsodNode,standby:!!standby,menu:!!menuNode,modals:modals.length,clock:clock.textContent,smash:S.smash,setupFile:S.setupFile}),
  reset(){closeMenu();for(const m of [...modals])m.close();Array.from(toastBox.children).forEach(c=>c.remove());stopSaver();if(standby){standby.remove();standby=null}hiddenShell=false;for(const n of [X.iconGrid,taskbar,X.manager])n.classList.remove('xp-gone')},destroy(){alive=false;for(const t of timers){w.clearTimeout(t);w.clearInterval(t)}stopSaver()}};
 UI={toast,dialog,menu};X.ui=UI;X.shell=api;tickClock(X.remaining());
 return api}
w.XPShell={attach,ids:['display','taskmgr','network','calendar','trash'],has:id=>['display','taskmgr','network','calendar','trash'].includes(id),xs,WALL,SAVERS};
})(window);
