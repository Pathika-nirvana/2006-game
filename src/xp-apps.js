/* A90: PC방 컴퓨터의 기본 프로그램 네 가지. 지뢰 찾기, 그림판, 타자 연습, 계산기.
   그림 파일은 쓰지 않고 색과 글자, 캔버스로만 그린다. 규칙 계산은 화면과 따로 두어 시험할 수 있게 했다. */
(function(w){'use strict';
/* ---------- 지뢰 찾기 규칙 ---------- */
const LEVELS={easy:{name:'초급',rows:9,cols:9,mines:10},mid:{name:'중급',rows:16,cols:16,mines:40}};
function rng(seed){let a=(seed>>>0)||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296}}
function createGame(rows,cols,mines,seed){
 const n=rows*cols,cells=Array.from({length:n},()=>({mine:false,open:false,flag:false,n:0,wrong:false}));
 const near=i=>{const r=Math.floor(i/cols),c=i%cols,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&rr<rows&&cc>=0&&cc<cols)out.push(rr*cols+cc)}return out};
 const g={rows,cols,mines,cells,state:'ready',flags:0,opened:0,boom:-1,near,
  place(first){const safe=new Set([first]);if(n-9>=mines)for(const j of near(first))safe.add(j);const pool=[];for(let i=0;i<n;i++)if(!safe.has(i))pool.push(i);const rand=rng(seed===undefined?1:seed);for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}for(const i of pool.slice(0,mines))cells[i].mine=true;for(let i=0;i<n;i++)cells[i].n=near(i).filter(j=>cells[j].mine).length},
  reveal(i){if(g.state==='won'||g.state==='lost')return false;const c=cells[i];if(!c||c.open||c.flag)return false;if(g.state==='ready'){g.place(i);g.state='play'}
   if(c.mine){g.state='lost';g.boom=i;for(const x of cells)if(x.flag&&!x.mine)x.wrong=true;return true}
   const stack=[i];while(stack.length){const k=stack.pop(),x=cells[k];if(x.open||x.flag)continue;x.open=true;g.opened++;if(x.n===0)for(const j of near(k))if(!cells[j].open&&!cells[j].flag)stack.push(j)}
   if(g.opened===n-mines){g.state='won';for(const x of cells)if(x.mine&&!x.flag){x.flag=true;g.flags++}}return true},
  flag(i){if(g.state==='won'||g.state==='lost')return false;const c=cells[i];if(!c||c.open)return false;c.flag=!c.flag;g.flags+=c.flag?1:-1;return true},
  chord(i){if(g.state!=='play')return false;const c=cells[i];if(!c||!c.open||c.n===0)return false;const ns=near(i);if(ns.filter(j=>cells[j].flag).length!==c.n)return false;for(const j of ns)if(!cells[j].flag&&!cells[j].open)g.reveal(j);return true},
  left(){return mines-g.flags}};
 return g}
/* ---------- 그림판 계산 ---------- */
const PALETTE=['#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#4000ff','#804000','#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80','#80ffff','#8080ff','#ff0080','#ff8040'];
const hexRgba=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16),255];
function floodFill(img,x,y,rgba){const {data,width:W,height:H}=img;x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return 0;const at=(px,py)=>(py*W+px)*4,s=at(x,y);const t=[data[s],data[s+1],data[s+2],data[s+3]];if(t[0]===rgba[0]&&t[1]===rgba[1]&&t[2]===rgba[2]&&t[3]===rgba[3])return 0;
 const same=p=>data[p]===t[0]&&data[p+1]===t[1]&&data[p+2]===t[2]&&data[p+3]===t[3];let count=0;const stack=[[x,y]];
 while(stack.length){let [px,py]=stack.pop();while(px>0&&same(at(px-1,py)))px--;let up=false,down=false;while(px<W&&same(at(px,py))){const p=at(px,py);data[p]=rgba[0];data[p+1]=rgba[1];data[p+2]=rgba[2];data[p+3]=rgba[3];count++;if(py>0){const u=same(at(px,py-1));if(u&&!up)stack.push([px,py-1]);up=u}if(py<H-1){const d=same(at(px,py+1));if(d&&!down)stack.push([px,py+1]);down=d}px++}}
 return count}
function linePoints(x0,y0,x1,y1){x0|=0;y0|=0;x1|=0;y1|=0;const out=[],dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy,x=x0,y=y0;for(;;){out.push([x,y]);if(x===x1&&y===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x+=sx}if(e2<=dx){err+=dx;y+=sy}}return out}
/* ---------- 타자 연습 계산 ---------- */
const CHO=[1,2,1,1,2,1,1,1,2,1,2,1,1,2,1,1,1,1,1],JUNG=[1,1,1,2,1,1,1,2,1,2,2,2,1,1,2,2,2,1,1,2,1],JONG=[0,1,2,2,1,2,2,1,1,2,2,2,2,2,2,2,1,1,2,1,2,1,1,1,1,1,1,1];
function strokes(str){let n=0;for(const ch of String(str)){const c=ch.codePointAt(0);if(c>=0xAC00&&c<=0xD7A3){const k=c-0xAC00;n+=CHO[Math.floor(k/588)]+JUNG[Math.floor(k%588/28)]+JONG[k%28]}else if(c>=0x3131&&c<=0x3163)n+=1;else n+=(ch>='A'&&ch<='Z')?2:1}return n}
function lev(a,b){a=Array.from(a);b=Array.from(b);const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=Array.from({length:n+1},(_,i)=>i);for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[n]}
const GRADES=[[150,'병아리 타자'],[250,'초보 타자'],[350,'중급 타자'],[450,'고수 타자'],[Infinity,'타자 왕']];
const gradeOf=cpm=>GRADES.find(g=>cpm<g[0])[1];
function summarize(rounds){let st=0,ms=0,tl=0,dist=0;for(const r of rounds){st+=strokes(r.typed);ms+=Math.max(1,r.ms);tl+=Array.from(r.target).length;dist+=Math.min(lev(r.target,r.typed),Array.from(r.target).length)}const acc=tl?Math.max(0,Math.round((1-dist/tl)*1000)/10):0,cpm=Math.min(1200,Math.round(st/(ms/60000)*(acc/100)));return{cpm,acc,ms,strokes:st,grade:gradeOf(cpm)}}
const SENTENCES=['가는 말이 고우면 오는 말이 곱다.','낮말은 새가 듣고 밤말은 쥐가 듣는다.','백지장도 맞들면 낫다.','호랑이도 제 말 하면 온다.','세 살 버릇 여든까지 간다.','티끌 모아 태산이다.','아는 길도 물어 가라.','시작이 반이다.','원숭이도 나무에서 떨어진다.','소 잃고 외양간 고친다.','될성부른 나무는 떡잎부터 알아본다.','오늘은 방과 후에 동네 PC방에서 친구들과 만나기로 했다.','컵라면 하나에 콜라 한 잔이면 한 시간쯤은 거뜬하다.','미니홈피에 올릴 사진을 고르다 보니 어느새 저녁이 되었다.','주말에는 동네 카페 정모에 나가서 이웃들을 만나기로 했다.','메신저 대화명을 바꿨더니 친구들이 한마디씩 남겼다.','사장님이 컵라면을 가져다 주셔서 고마운 마음이 들었다.'];
/* ---------- 계산기 계산 ---------- */
function calcNew(){return{disp:'0',acc:null,op:null,fresh:true,pend:false,mem:0,err:'',last:null}}
const fmtNum=x=>{if(!Number.isFinite(x))return null;let s=String(Number(x.toPrecision(12)));if(/e/i.test(s))s=Number(x.toPrecision(12)).toExponential().replace('e+','e');return s};
const apply=(op,a,b)=>op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:op==='/'?(b===0?NaN:a/b):b;
function calcPress(c,k){
 if(c.err&&k!=='c')return c;const cur=parseFloat(c.disp),fail=m=>{c.err=m;c.disp=m;c.acc=null;c.op=null;c.fresh=true;return c};
 if(/^[0-9]$/.test(k)){c.pend=false;if(c.fresh){c.disp=k;c.fresh=false}else if(c.disp.replace(/[-.]/g,'').length<16)c.disp=c.disp==='0'?k:c.disp+k;return c}
 if(k==='.'){c.pend=false;if(c.fresh){c.disp='0.';c.fresh=false}else if(!c.disp.includes('.'))c.disp+='.';return c}
 if('+-*/'.includes(k)&&k.length===1){if(c.op!==null&&!c.pend){const r=apply(c.op,c.acc,cur);if(!Number.isFinite(r))return fail('0으로 나눌 수 없습니다');c.acc=r;c.disp=fmtNum(r)}else if(c.op===null)c.acc=cur;c.op=k;c.fresh=true;c.pend=true;c.last=null;return c}
 if(k==='='){if(c.op!==null){const b=c.pend?c.acc:cur,r=apply(c.op,c.acc,b);if(!Number.isFinite(r))return fail('0으로 나눌 수 없습니다');c.last={op:c.op,b};c.disp=fmtNum(r);c.acc=null;c.op=null;c.fresh=true;c.pend=false}else if(c.last){const r=apply(c.last.op,cur,c.last.b);if(!Number.isFinite(r))return fail('0으로 나눌 수 없습니다');c.disp=fmtNum(r);c.fresh=true}return c}
 if(k==='neg'){c.pend=false;if(cur!==0)c.disp=c.disp[0]==='-'?c.disp.slice(1):'-'+c.disp;return c}
 if(k==='sqrt'){c.pend=false;if(cur<0)return fail('잘못된 입력입니다');c.disp=fmtNum(Math.sqrt(cur));c.fresh=true;return c}
 if(k==='pct'){c.pend=false;c.disp=c.acc!==null?fmtNum(c.acc*cur/100):'0';c.fresh=true;return c}
 if(k==='inv'){c.pend=false;if(cur===0)return fail('0으로 나눌 수 없습니다');c.disp=fmtNum(1/cur);c.fresh=true;return c}
 if(k==='back'){if(!c.fresh){c.disp=c.disp.length>1&&!(c.disp.length===2&&c.disp[0]==='-')?c.disp.slice(0,-1):'0'}return c}
 if(k==='ce'){c.disp='0';c.fresh=true;c.pend=false;return c}
 if(k==='c'){const m=c.mem;Object.assign(c,calcNew());c.mem=m;return c}
 if(k==='mc'){c.mem=0;return c}
 if(k==='mr'){c.pend=false;c.disp=fmtNum(c.mem);c.fresh=true;return c}
 if(k==='ms'){c.mem=cur;c.fresh=true;return c}
 if(k==='m+'){c.mem+=cur;c.fresh=true;return c}
 return c}
const CALC_KEYS=[['mc','MC'],['7','7'],['8','8'],['9','9'],['/','/'],['sqrt','sqrt'],['mr','MR'],['4','4'],['5','5'],['6','6'],['*','*'],['pct','%'],['ms','MS'],['1','1'],['2','2'],['3','3'],['-','-'],['inv','1/x'],['m+','M+'],['0','0'],['neg','+/-'],['.','.'],['+','+'],['=','=']];

function attach(X){
 const {E,B,listen,save}=X;const S=w.XPShell?w.XPShell.xs(X):(X.saved.xp=X.saved.xp||{});S.bestMine=S.bestMine&&typeof S.bestMine==='object'?S.bestMine:{};
 const toast=o=>{if(X.ui)X.ui.toast(o)};let alive=true;
 const fit=(win,wid,hei,l,t)=>{win.node.classList.add('xp-small');win.node.style.width=wid;win.node.style.height=hei;if(l)win.node.style.left=l;if(t)win.node.style.top=t};
 const lcd=n=>String(Math.max(-99,Math.min(999,n|0))).replace(/^(-?)(\d+)$/,(m,s,d)=>s+d.padStart(3-s.length,'0'));
 /* ---- 지뢰 찾기 ---- */
 const ms={level:'easy',game:null,secs:0,flagMode:false,win:null,cells:[],face:null,left:null,time:null,board:null,best:null};
 function msNew(level){if(level)ms.level=level;const L=LEVELS[ms.level];ms.game=createGame(L.rows,L.cols,L.mines,(Date.now()^(Math.random()*1e9))>>>0);ms.secs=0;if(ms.win&&X.windows.get('minesweeper')===ms.win)msBuild()}
 function msFace(){const s=ms.game.state;return s==='won'?'B)':s==='lost'?'X(':':)'}
 function msPaint(i){const c=ms.game.cells[i],b=ms.cells[i],g=ms.game;let cls='xp-ms-cell',txt='';
  if(c.open){cls+=' open'+(c.n?' n'+c.n:'');txt=c.n?String(c.n):''}
  else if(g.state==='lost'&&c.mine&&!c.flag){cls+=' open mine'+(i===g.boom?' boom':'');txt='●'}
  else if(c.flag){cls+=' flag'+(c.wrong?' wrong':'');txt=c.wrong?'×':'▶'}
  if(b.className!==cls)b.className=cls;if(b.textContent!==txt)b.textContent=txt;b.setAttribute('aria-label',(c.open?(c.n?c.n+'칸 근처 지뢰':'빈 칸'):c.flag?'깃발':'닫힌 칸')+' '+(Math.floor(i/g.cols)+1)+'행 '+(i%g.cols+1)+'열')}
 function msRefresh(){const g=ms.game;for(let i=0;i<g.cells.length;i++)msPaint(i);ms.left.textContent=lcd(g.left());ms.time.textContent=lcd(ms.secs);ms.face.textContent=msFace();ms.win.caption.textContent='지뢰 찾기';
  if(g.state==='won'&&!ms.counted){ms.counted=true;const best=S.bestMine[ms.level];if(!(best>0)||ms.secs<best){S.bestMine[ms.level]=Math.max(1,ms.secs);save();toast({title:'지뢰 찾기',text:LEVELS[ms.level].name+' 최고 기록 '+Math.max(1,ms.secs)+'초!',icon:'msg'})}else toast({title:'지뢰 찾기',text:'성공! '+ms.secs+'초 걸렸습니다.',icon:'msg',ms:4000});msBest()}}
 function msBest(){if(ms.best)ms.best.textContent='최고 기록  초급 '+(S.bestMine.easy>0?S.bestMine.easy+'초':'-')+'  중급 '+(S.bestMine.mid>0?S.bestMine.mid+'초':'-')}
 function msAct(i,flag){const g=ms.game;if(g.state==='won'||g.state==='lost')return;if(flag||ms.flagMode)g.flag(i);else{const c=g.cells[i];if(c.open&&c.n>0)g.chord(i);else g.reveal(i)}msRefresh()}
 function msBuild(){
  const win=ms.win;ms.counted=false;const g=ms.game,L=LEVELS[ms.level];win.content.replaceChildren();
  const wrap=E('div','xp-ms'),bar=E('div','xp-ms-bar');for(const [k,v] of Object.entries(LEVELS))bar.append(B(v.name,()=>msNew(k),'xp-mini'+(ms.level===k?' on':'')));bar.append(B('새 게임',()=>msNew(),'xp-mini'),B(ms.flagMode?'깃발 모드 켬':'깃발 모드',()=>{ms.flagMode=!ms.flagMode;msBuild()},'xp-mini'+(ms.flagMode?' on':'')));
  const head=E('div','xp-ms-head');ms.left=E('span','xp-ms-lcd');ms.time=E('span','xp-ms-lcd');ms.face=B(':)',()=>msNew(),'xp-ms-face');ms.face.setAttribute('aria-label','새 게임');head.append(ms.left,ms.face,ms.time);
  const board=E('div','xp-ms-board');board.style.gridTemplateColumns='repeat('+g.cols+',var(--c,22px))';ms.board=board;ms.cells=[];
  for(let i=0;i<g.rows*g.cols;i++){const b=B('',()=>msAct(i,false),'xp-ms-cell');b.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault();msAct(i,true)});b.addEventListener('keydown',e=>{if(e.key==='f'||e.key==='F'){e.preventDefault&&e.preventDefault();msAct(i,true)}});ms.cells.push(b);board.append(b)}
  ms.best=E('p','xp-note','');wrap.append(bar,head,board,ms.best,E('p','xp-note','왼쪽 단추로 열고, 오른쪽 단추(또는 F 키)로 깃발을 꽂습니다. 숫자를 누르면 주변 깃발이 맞을 때 한꺼번에 열립니다.'));win.content.append(wrap);fit(win,L.cols>9?'min(430px,96%)':'min(330px,96%)',L.cols>9?'min(600px,96%)':'min(470px,96%)');msBest();msRefresh()}
 function openMines(){const had=X.windows.get('minesweeper');const win=X.windowFor('minesweeper','지뢰 찾기');if(had&&ms.win===win&&ms.game)return win;ms.win=win;if(!ms.game||ms.game.state!=='play')msNew();else msBuild();return win}
 /* ---- 그림판 ---- */
 const pt={tool:'pencil',size:3,fg:'#000000',bg:'#ffffff',cv:null,g:null,undo:[],win:null,snap:null,from:null,drawing:false,last:null,dirty:false};
 const CW=480,CH=320;
 function ptCtx(){return pt.g}
 function ptPush(){try{pt.undo.push(pt.g.getImageData(0,0,CW,CH));if(pt.undo.length>12)pt.undo.shift()}catch(_){}}
 function ptXY(e){const r=pt.cv.getBoundingClientRect?pt.cv.getBoundingClientRect():{left:0,top:0,width:CW,height:CH};return[Math.round((e.clientX-r.left)*CW/(r.width||CW)),Math.round((e.clientY-r.top)*CH/(r.height||CH))]}
 function ptStroke(a,b){const g=pt.g;if(pt.tool==='pencil'){g.fillStyle=pt.fg;for(const [x,y] of linePoints(a[0],a[1],b[0],b[1]))g.fillRect(x,y,1,1);return}
  g.lineCap='round';g.lineJoin='round';g.strokeStyle=pt.tool==='eraser'?pt.bg:pt.fg;g.lineWidth=pt.tool==='eraser'?pt.size*3+2:pt.size;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
 function ptSpray(p){const g=pt.g,r=pt.size*3+4;g.fillStyle=pt.fg;for(let i=0;i<14;i++){const a=Math.random()*6.283,d=Math.sqrt(Math.random())*r;g.fillRect(Math.round(p[0]+Math.cos(a)*d),Math.round(p[1]+Math.sin(a)*d),1,1)}}
 function ptShape(a,b){const g=pt.g;g.putImageData(pt.snap,0,0);g.strokeStyle=pt.fg;g.lineWidth=pt.size;g.lineCap='round';g.beginPath();
  if(pt.tool==='line'){g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1])}else if(pt.tool==='rect'){g.rect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))}else{g.ellipse((a[0]+b[0])/2,(a[1]+b[1])/2,Math.max(1,Math.abs(b[0]-a[0])/2),Math.max(1,Math.abs(b[1]-a[1])/2),0,0,6.2832)}g.stroke()}
 function ptDown(e){if(!pt.g)return;e.preventDefault&&e.preventDefault();pt.cv.setPointerCapture&&pt.cv.setPointerCapture(e.pointerId);const p=ptXY(e);const right=e.button===2;ptPush();pt.dirty=true;
  if(pt.tool==='fill'){try{const img=pt.g.getImageData(0,0,CW,CH);floodFill(img,p[0],p[1],hexRgba(right?pt.bg:pt.fg));pt.g.putImageData(img,0,0)}catch(_){}return}
  pt.drawing=true;pt.last=p;pt.from=p;if(['line','rect','ellipse'].includes(pt.tool))pt.snap=pt.g.getImageData(0,0,CW,CH);else if(pt.tool==='spray')ptSpray(p);else ptStroke(p,p)}
 function ptMove(e){if(!pt.drawing)return;const p=ptXY(e);if(['line','rect','ellipse'].includes(pt.tool))ptShape(pt.from,p);else if(pt.tool==='spray'){ptSpray(p)}else{ptStroke(pt.last,p);pt.last=p}}
 function ptUp(e){if(!pt.drawing)return;pt.drawing=false;if(['line','rect','ellipse'].includes(pt.tool))ptShape(pt.from,ptXY(e));pt.snap=null}
 function ptClear(){if(!pt.g)return;ptPush();pt.g.fillStyle=pt.bg;pt.g.fillRect(0,0,CW,CH);pt.dirty=false}
 function ptSave(){try{const url=pt.cv.toDataURL('image/png');if(!/^data:image\/png;base64,[A-Za-z0-9+/=]{20,400000}$/.test(url)){toast({title:'그림판',text:'그림이 너무 커서 저장하지 못했습니다. 색을 줄여 보세요.',icon:'warn'});return false}S.paint=url;save();pt.dirty=false;toast({title:'그림판',text:'그림을 저장했습니다. 다음에 열 때 불러올 수 있습니다.',icon:'info',ms:4000});return true}catch(_){toast({title:'그림판',text:'그림을 저장하지 못했습니다.',icon:'warn'});return false}}
 function ptLoad(){if(!S.paint||!pt.g){toast({title:'그림판',text:'저장된 그림이 없습니다.',icon:'warn',ms:3500});return}const im=new w.Image();im.onload=()=>{if(!alive||!pt.g)return;ptPush();pt.g.drawImage(im,0,0,CW,CH)};im.src=S.paint}
 function openPaint(){
  const had=X.windows.get('paint');const win=X.windowFor('paint','제목 없음 - 그림판',true);if(had&&pt.win===win)return win;pt.win=win;win.node.style.left='4%';win.node.style.top='3%';win.content.replaceChildren();pt.undo=[];
  const wrap=E('div','xp-pt'),menu=E('div','xp79-menu-row xp-pt-menu');
  const cv=E('canvas','xp-pt-cv');cv.width=CW;cv.height=CH;cv.setAttribute('aria-label','그림 그리는 곳');cv.style.touchAction='none';pt.cv=cv;pt.g=cv.getContext?cv.getContext('2d'):null;
  menu.append(B('새로 만들기',ptClear,'xp-mini'),B('불러오기',ptLoad,'xp-mini'),B('저장',ptSave,'xp-mini'),B('실행 취소',()=>{const u=pt.undo.pop();if(u&&pt.g)pt.g.putImageData(u,0,0)},'xp-mini'),B('배경 화면으로',()=>{if(ptSave()&&X.shell){X.shell.wallpaper('paint');toast({title:'그림판',text:'저장한 그림을 바탕 화면으로 설정했습니다.',icon:'info',ms:4000})}},'xp-mini'));
  const side=E('div','xp-pt-side'),tools=[['pencil','연필'],['brush','붓'],['eraser','지우개'],['fill','채우기'],['spray','스프레이'],['line','선'],['rect','사각형'],['ellipse','원']];
  const toolBtns=tools.map(([id,label])=>{const b=B(label,()=>{pt.tool=id;sync()},'xp-mini xp-pt-tool');b.dataset&&(b.dataset.tool=id);return[id,b]});for(const [,b] of toolBtns)side.append(b);
  const sizes=E('div','xp-pt-sizes'),sizeBtns=[1,3,6,10].map(n=>{const b=B(n+'px',()=>{pt.size=n;sync()},'xp-mini');return[n,b]});for(const [,b] of sizeBtns)sizes.append(b);side.append(sizes);
  const pal=E('div','xp-pt-pal'),cur=E('div','xp-pt-cur'),fgSw=E('i','xp-pt-fg'),bgSw=E('i','xp-pt-bg');cur.append(bgSw,fgSw);
  for(const c of PALETTE){const b=B('',()=>{pt.fg=c;sync()},'xp-pt-color');b.style.background=c;b.setAttribute('aria-label','색 '+c);b.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault();pt.bg=c;sync()});pal.append(b)}
  const sync=()=>{for(const [id,b] of toolBtns)b.classList.toggle('on',pt.tool===id);for(const [n,b] of sizeBtns)b.classList.toggle('on',pt.size===n);fgSw.style.background=pt.fg;bgSw.style.background=pt.bg};
  const stage=E('div','xp-pt-stage');stage.append(cv);const bottom=E('div','xp-pt-bottom');bottom.append(cur,pal,E('small','','왼쪽 단추: 앞색, 오른쪽 단추: 뒷색'));
  wrap.append(menu,side,stage,bottom);win.content.append(wrap);
  if(pt.g){pt.g.fillStyle=pt.bg;pt.g.fillRect(0,0,CW,CH);pt.g.imageSmoothingEnabled=false}
  cv.addEventListener('pointerdown',ptDown);cv.addEventListener('pointermove',ptMove);cv.addEventListener('pointerup',ptUp);cv.addEventListener('pointercancel',ptUp);cv.addEventListener('contextmenu',e=>{e.preventDefault&&e.preventDefault()});sync();return win}
 /* ---- 타자 연습 ---- */
 const ty={win:null,round:0,list:[],rounds:[],start:0,target:'',phase:'ready',input:null,box:null};
 function tyPick(){const pool=SENTENCES.slice();const out=[];for(let i=0;i<5;i++){out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0])}return out}
 function tyRender(){const t=Array.from(ty.target),v=Array.from(ty.input.value);ty.box.replaceChildren();t.forEach((ch,i)=>{const s=E('span',i<v.length?(v[i]===ch?'ok':'bad'):'',ch);ty.box.append(s)})}
 function tySubmit(){if(ty.phase!=='play')return;const typed=ty.input.value.trim();if(!typed)return;const ms_=Math.max(300,Date.now()-(ty.start||Date.now()-1000));ty.rounds.push({target:ty.target,typed,ms:ms_});ty.round++;if(ty.round>=ty.list.length)return tyResult();tyNext()}
 function tyNext(){ty.target=ty.list[ty.round];ty.input.value='';ty.start=0;tyRender();ty.prog.textContent='문장 '+(ty.round+1)+' / '+ty.list.length;ty.input.focus&&ty.input.focus()}
 function tyBegin(){ty.phase='play';ty.round=0;ty.rounds=[];ty.list=tyPick();const win=ty.win;win.content.replaceChildren();
  const wrap=E('div','xp-ty');ty.prog=E('p','xp-ty-prog','');ty.box=E('p','xp-ty-target');ty.box.setAttribute('aria-label','따라 칠 문장');ty.input=E('input','xp-ty-input');ty.input.type='text';ty.input.maxLength=80;ty.input.autocomplete='off';ty.input.setAttribute('aria-label','타자 연습 입력');
  const form=E('form','xp-ty-form');form.append(ty.input,B('입력',()=>{},'xp-mini'));form.lastElementChild.type='submit';form.addEventListener('submit',e=>{e.preventDefault&&e.preventDefault();tySubmit()});
  ty.input.addEventListener('input',()=>{if(!ty.start&&ty.input.value)ty.start=Date.now();tyRender()});ty.input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault&&e.preventDefault();w.setTimeout(()=>{if(alive)tySubmit()},0)}});
  wrap.append(ty.prog,ty.box,form,E('p','xp-note','문장을 똑같이 치고 엔터를 누르세요. 다섯 문장을 마치면 타수와 정확도가 나옵니다.'));win.content.append(wrap);tyNext()}
 function tyResult(){ty.phase='done';const r=summarize(ty.rounds),win=ty.win;win.content.replaceChildren();const prev=S.bestType|0;const rec=r.cpm>prev;if(rec){S.bestType=r.cpm;save()}
  const wrap=E('div','xp-ty');wrap.append(E('h3','','연습 결과'),E('p','xp-ty-big',r.cpm+' 타/분'),E('p','','정확도 '+r.acc+'%  ·  걸린 시간 '+(r.ms/1000).toFixed(1)+'초'),E('p','xp-ty-grade',r.grade),E('p','xp-note',rec?'최고 기록을 새로 세웠습니다!':'내 최고 기록: '+(S.bestType|0)+' 타/분'));
  const row=E('div','xp-row');row.append(B('다시 하기',tyBegin,'xp-dialog-btn'),B('닫기',()=>X.closeWin('typing'),'xp-dialog-btn'));wrap.append(row);win.content.append(wrap);ty.last=r}
 function openTyping(){const had=X.windows.get('typing');const win=X.windowFor('typing','타자 연습');if(had&&ty.win===win)return win;ty.win=win;fit(win,'min(480px,96%)','min(360px,92%)','16%','10%');
  win.content.replaceChildren();const wrap=E('div','xp-ty');wrap.append(E('h3','','타자 연습 · 짧은 글 연습'),E('p','','화면에 나오는 문장을 보고 똑같이 쳐 보세요. 문장은 다섯 개이고 빨리, 정확하게 칠수록 높은 등급을 받습니다.'),E('p','xp-note','내 최고 기록: '+(S.bestType|0)+' 타/분'),B('시작하기',tyBegin,'xp-dialog-btn'));win.content.append(wrap);return win}
 /* ---- 계산기 ---- */
 const cal={c:calcNew(),win:null,screen:null,mem:null};
 function calShow(){if(!cal.screen)return;cal.screen.textContent=cal.c.disp;cal.mem.textContent=cal.c.mem?'M':''}
 function calKey(k){calcPress(cal.c,k);calShow()}
 function openCalc(){const had=X.windows.get('calc');const win=X.windowFor('calc','계산기');if(had&&cal.win===win)return win;cal.win=win;fit(win,'min(300px,96%)','min(380px,94%)','38%','8%');win.content.replaceChildren();cal.c=calcNew();
  const wrap=E('div','xp-calc');wrap.tabIndex=0;cal.screen=E('div','xp-calc-screen','0');cal.screen.setAttribute('role','status');cal.mem=E('span','xp-calc-mem','');const top=E('div','xp-calc-top');top.append(cal.mem,B('←',()=>calKey('back'),'xp-calc-key red'),B('CE',()=>calKey('ce'),'xp-calc-key red'),B('C',()=>calKey('c'),'xp-calc-key red'));
  const pad=E('div','xp-calc-pad');for(const [k,label] of CALC_KEYS){pad.append(B(label,()=>calKey(k),'xp-calc-key'+('/*-+='.includes(k)||k==='sqrt'||k==='pct'||k==='inv'?' op':'')+(k.startsWith('m')?' mem':'')))}
  wrap.append(cal.screen,top,pad);win.content.append(wrap);
  const MAP={'Enter':'=','=':'=','Backspace':'back','Delete':'ce','Escape':null,'c':'c','C':'c',',':'.','.':'.','+':'+','-':'-','*':'*','/':'/','%':'pct'};
  wrap.addEventListener('keydown',e=>{const k=e.key;if(/^[0-9]$/.test(k)){e.preventDefault&&e.preventDefault();calKey(k);return}const m=MAP[k];if(m){e.preventDefault&&e.preventDefault();e.stopPropagation&&e.stopPropagation();calKey(m)}});
  calShow();wrap.focus&&wrap.focus();return win}
 /* ---- 공통 ---- */
 const OPEN={minesweeper:openMines,paint:openPaint,typing:openTyping,calc:openCalc};
 function tick(){if(!alive)return;if(ms.game&&ms.game.state==='play'&&X.windows.get('minesweeper')===ms.win&&ms.secs<999){ms.secs++;if(ms.time)ms.time.textContent=lcd(ms.secs)}}
 const api={ids:Object.keys(OPEN),has:id=>!!OPEN[id],open:id=>OPEN[id]&&OPEN[id](),tick,
  reset(){ms.game=null;ms.win=null;pt.win=null;pt.g=null;pt.cv=null;ty.win=null;cal.win=null;cal.screen=null},destroy(){alive=false},
  mines:{game:()=>ms.game,act:msAct,newGame:msNew,state:()=>({level:ms.level,secs:ms.secs,state:ms.game&&ms.game.state,flags:ms.game&&ms.game.flags,opened:ms.game&&ms.game.opened,left:ms.game&&ms.game.left(),flagMode:ms.flagMode})},
  paint:{state:()=>({tool:pt.tool,size:pt.size,fg:pt.fg,bg:pt.bg,undo:pt.undo.length,canvas:!!pt.g}),save:ptSave},
  typing:{state:()=>({phase:ty.phase,round:ty.round,target:ty.target,rounds:ty.rounds.length,last:ty.last||null}),submit:tySubmit},
  calc:{state:()=>({disp:cal.c.disp,mem:cal.c.mem,err:cal.c.err}),press:calKey}};
 return api}
w.XPApps={attach,ids:['minesweeper','paint','typing','calc'],has:id=>['minesweeper','paint','typing','calc'].includes(id),LEVELS,createGame,rng,PALETTE,floodFill,linePoints,hexRgba,strokes,lev,summarize,gradeOf,SENTENCES,calcNew,calcPress,fmtNum};
})(window);
