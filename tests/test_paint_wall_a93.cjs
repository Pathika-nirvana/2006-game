'use strict';
/* A93: 그림판 저장(내 문서의 내 그림 폴더), 그림 뷰어와 폴더의 바탕 화면 배경 설정, 화면 등록 정보의 그림 배경을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
let shot=0;
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...nodes){for(const n of nodes){n.parentNode=this}this.children.unshift(...nodes)}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.clicks=(this.clicks||0)+1;this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}getBoundingClientRect(){return{left:0,top:0,width:480,height:320}}
 toDataURL(type){shot++;return 'data:'+(type||'image/png')+';base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB'+String(shot).padStart(6,'A')}}
const memory=new Map(),doc=new Node('document'),root=new Node('main'),anchors=[];
doc.body=new Node('body');
doc.createElement=t=>{const n=new Node(t);if(t==='a')anchors.push(n);return n};
class FakeImage{constructor(){this.naturalWidth=480;this.naturalHeight=320}set src(v){this._src=v;setTimeout(()=>{if(/missing/.test(v)){this.onerror&&this.onerror()}else this.onload&&this.onload()},0)}get src(){return this._src}}
const fast=(fn,ms)=>setTimeout(fn,Math.min(ms||0,15));
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Promise,console,Image:FakeImage,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('external browsing forbidden')},setTimeout:fast,clearTimeout,setInterval,clearInterval};w.window=w;
const src=f=>fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8');
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','web-data','web-ghost','web-flash','web-sites','pc-system','xp-desktop'])vm.runInNewContext(src(f),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x},has=(s,n=root)=>all(n).some(x=>x.textContent&&x.textContent.includes(s)&&x.children.length===0);
const textHas=(s,n=root)=>n.textContent.includes(s);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const dlgs=()=>cls('xp-dialog');
const closeDialogs=()=>{for(const d of cls('xp-modal'))d.remove()};

(async()=>{
/* 1. 저장된 상태 거르기 */
const OK='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
const x1=w.XPShell.xs({saved:{xp:{pics:[{id:'a1',name:'정상.png',url:OK,w:480,h:320},{id:'a1',name:'같은번호.png',url:OK},{id:'b<',name:'나쁜번호',url:OK},{id:'c1',name:'나쁜주소',url:'javascript:alert(1)'},{id:'d1',name:'큰 그림',url:'data:image/png;base64,'+'A'.repeat(300001)},{id:'e1',name:'a/b\\c:d.png',url:OK}],wallImg:{url:'pic:a1',name:'정상.png',mode:'tile'},wallpaper:'image'}}});
assert.equal(x1.pics.length,2,'정상 그림만 남음');assert.equal(x1.pics[1].name,'abcd.png','이름의 금지 글자 제거');assert.equal(x1.wallImg.mode,'tile');assert.equal(x1.wallpaper,'image');
const x2=w.XPShell.xs({saved:{xp:{pics:[],wallImg:{url:'pic:zz',name:'없는그림',mode:'fill'},wallpaper:'image'}}});assert.equal(x2.wallImg.url,'','없는 그림을 가리키면 지움');assert.equal(x2.wallpaper,'bliss','그림 없으면 기본 배경');
const x3=w.XPShell.xs({saved:{xp:{wallImg:{url:'http://evil.example/x.png',name:'x',mode:'weird'},wallpaper:'image'}}});assert.equal(x3.wallImg.url,'','바깥 주소는 거부');assert.equal(x3.wallImg.mode,'fill');
const x4=w.XPShell.xs({saved:{xp:{wallImg:{url:'assets/pc-desktop/incoming/../../server.js',name:'x',mode:'fill'},wallpaper:'image'}}});assert.equal(x4.wallImg.url,'','상위 폴더 주소는 거부');
const many=Array.from({length:20},(_,i)=>({id:'m'+i,name:'m'+i+'.png',url:OK}));assert.equal(w.XPShell.xs({saved:{xp:{pics:many}}}).pics.length,12,'12개까지');
const x5=w.XPShell.xs({saved:{xp:{pics:[{id:'big1',name:'a.png',url:'data:image/png;base64,'+'A'.repeat(290000)},{id:'big2',name:'b.png',url:'data:image/png;base64,'+'A'.repeat(290000)},{id:'big3',name:'c.png',url:'data:image/png;base64,'+'A'.repeat(290000)},{id:'big4',name:'d.png',url:'data:image/png;base64,'+'A'.repeat(290000)},{id:'big5',name:'e.png',url:'data:image/png;base64,'+'A'.repeat(290000)},{id:'big6',name:'f.png',url:'data:image/png;base64,'+'A'.repeat(290000)}]}}});assert.equal(x5.pics.length,5,'합계 150만 글자까지');
/* 2. 옛 그림판 저장본은 내 그림으로 옮김 */
memory.set('2006_xp_desktop_v1',JSON.stringify({xp:{paint:OK,wallpaper:'paint'}}));
let api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600});
const desk=find(n=>n.classList.contains('xp79-desktop')),SH=api.modules.shell;
assert.equal(SH.state().pics[0],'이전 그림.png','옛 저장본이 내 그림으로 옮겨짐');assert.equal(SH.state().wallpaper,'image');assert.equal(SH.state().wallImg.url,'pic:p0old');assert.ok(desk.style.background.includes('url("'+OK),'옛 배경 그림이 그대로 보임');
for(const p of SH.pics())SH.picDelete(p.id);assert.equal(SH.state().wallpaper,'bliss','배경으로 쓰던 그림을 지우면 기본 배경');assert.equal(desk.style.background,'');
/* 3. 그림판 저장 */
api.openApp('paint');const ap=api.modules.apps;
assert.equal(ap.paint.state().file,'');
button('다른 이름으로 저장');
button('저장').click();
let d=dlgs();assert.equal(d.length,1,'이름이 없으면 저장 창이 뜸');assert.ok(textHas('다른 이름으로 저장',d[0]));assert.ok(textHas('내 문서\\내 그림',d[0]));assert.ok(textHas('PNG (*.png)',d[0])&&textHas('JPEG (*.jpg)',d[0]));
const input=find(n=>n.classList.contains('xp-rename'),d[0]);assert.equal(input.value,'그림1','기본 이름');
input.value='체육대회 낙서';button('저장(S)',d[0]).click();
assert.equal(SH.state().pics.join(),'체육대회 낙서.png');assert.equal(ap.paint.state().file,'체육대회 낙서.png');
assert.ok(textHas('체육대회 낙서.png - 그림판',find(n=>n.classList.contains('xp79-window')&&textHas('그림판',n))||root),'창 제목이 파일 이름으로 바뀜');
assert.ok(SH.toasts().some(t=>t.includes('내 그림 폴더에 저장했습니다')),'저장 알림');
const stored=SH.pics()[0];assert.ok(/^data:image\/png;base64,/.test(stored.url));assert.equal(stored.w,480);assert.equal(stored.h,320);
button('저장').click();assert.equal(dlgs().length,0,'이름이 있으면 바로 저장');assert.equal(SH.state().pics.length,1,'같은 이름은 덮어씀');
assert.equal(anchors.length,0,'기본은 진짜 내려받기 안 함');
/* 다른 이름: 이미 있는 이름이면 확인 */
button('다른 이름으로 저장').click();d=dlgs();assert.equal(d.length,1);const in2=find(n=>n.classList.contains('xp-rename'),d[0]);assert.equal(in2.value,'체육대회 낙서','현재 이름이 기본값');
in2.value='새 그림';button('JPEG (*.jpg)',d[0]).click();button('☐ 진짜 내 컴퓨터에도 내려받기',d[0]).click();assert.ok(find(n=>n.tagName==='BUTTON'&&n.textContent.startsWith('☑'),d[0]),'내려받기 선택 표시');
button('저장(S)',d[0]).click();
assert.equal(SH.state().pics.join(),'체육대회 낙서.png,새 그림.jpg');assert.ok(/^data:image\/jpeg;base64,/.test(SH.pics()[1].url),'JPG는 JPEG로 저장');
assert.equal(anchors.length,1,'진짜 내려받기 단추 한 번');assert.equal(anchors[0].download,'새 그림.jpg');assert.ok(anchors[0].href.startsWith('data:image/jpeg'));assert.ok(anchors[0].clicks>=1);
assert.equal(ap.paint.state().fmt,'jpg');
button('다른 이름으로 저장').click();d=dlgs();const in3=find(n=>n.classList.contains('xp-rename'),d[0]);in3.value='체육대회 낙서.png';button('저장(S)',d[0]).click();
d=dlgs();assert.equal(d.length,1,'이미 있는 이름은 확인을 물음');assert.ok(textHas('이미 있습니다',d[0]));button('아니요',d[0]).click();assert.equal(SH.state().pics.length,2,'아니요면 저장하지 않음');
closeDialogs();
button('다른 이름으로 저장').click();d=dlgs();const in4=find(n=>n.classList.contains('xp-rename'),d[0]);in4.value='   ';button('저장(S)',d[0]).click();assert.ok(SH.toasts().some(t=>t.includes('파일 이름을 입력')),'빈 이름은 안내');closeDialogs();
button('다른 이름으로 저장').click();d=dlgs();const in5=find(n=>n.classList.contains('xp-rename'),d[0]);in5.value='연습.jpeg';button('저장(S)',d[0]).click();assert.ok(SH.state().pics.includes('연습.jpg'),'확장자를 직접 쓰면 그 형식');
/* 새로 만들기는 파일 이름을 비움 */
button('새로 만들기').click();assert.equal(ap.paint.state().file,'');
/* 불러오기 */
button('불러오기').click();d=dlgs();assert.equal(d.length,1);assert.ok(textHas('체육대회 낙서.png',d[0])&&textHas('새 그림.jpg',d[0]),'저장한 그림 목록');
const pick=find(n=>n.tagName==='BUTTON'&&n.textContent.startsWith('체육대회 낙서.png'),d[0]);pick.click();await wait(30);assert.equal(ap.paint.state().file,'체육대회 낙서.png','불러온 그림의 이름');closeDialogs();
/* 4. 한도 */
for(const p of SH.pics())SH.picDelete(p.id);
for(let i=0;i<12;i++)assert.equal(SH.picSave('채움'+i+'.png',OK).ok,true);
assert.equal(SH.picSave('열세번째.png',OK).why,'full','12개가 가득 차면 거부');assert.equal(SH.picSave('채움0.png',OK).replaced,true,'같은 이름은 가득 차도 덮어씀');
assert.equal(SH.picSave('x.png','data:image/gif;base64,AAAAAAAAAAAAAAAAAAAAAAAA').why,'big','png와 jpeg만');
button('다른 이름으로 저장').click();d=dlgs();find(n=>n.classList.contains('xp-rename'),d[0]).value='또하나';button('저장(S)',d[0]).click();assert.ok(SH.toasts().some(t=>t.includes('가득 찼습니다')),'가득 참 안내');assert.equal(SH.state().pics.length,12);closeDialogs();
for(const p of SH.pics())SH.picDelete(p.id);
/* 5. 그림판에서 배경 화면으로 */
button('새로 만들기').click();button('배경 화면으로').click();d=dlgs();assert.equal(d.length,1,'저장 전이면 이름을 먼저 물음');find(n=>n.classList.contains('xp-rename'),d[0]).value='배경그림';button('저장(S)',d[0]).click();
const wp=SH.pics().find(p=>p.name==='배경그림.png');assert.ok(wp);assert.equal(SH.state().wallpaper,'image');assert.equal(SH.state().wallImg.url,'pic:'+wp.id);assert.equal(SH.state().wallImg.mode,'fill');
assert.ok(desk.style.background.includes('url("data:image/png')&&desk.style.background.includes('cover'),'확대로 깔림');
assert.ok(SH.toasts().some(t=>t.includes('바탕 화면으로 설정했습니다')));
/* 6. 화면 등록 정보 */
api.openApp('display');assert.ok(has('(그림) 배경그림.png'),'그림 배경이 목록에 나옴');assert.ok(has('위치(P):'));assert.ok(has('찾아보기(B)...'));
assert.ok(!all().some(n=>n.tagName==='BUTTON'&&n.textContent.includes('내가 그린 그림')),'옛 항목은 숨김');
button('가운데').click();button('적용(A)').click();assert.equal(SH.state().wallImg.mode,'center');assert.ok(desk.style.background.includes('no-repeat')&&desk.style.background.includes('auto'),'가운데로 바뀜');
button('바둑판식').click();button('적용(A)').click();assert.equal(SH.state().wallImg.mode,'tile');assert.ok(desk.style.background.includes('repeat')&&!desk.style.background.includes('no-repeat'));
button('파란 바탕').click();button('적용(A)').click();assert.equal(SH.state().wallpaper,'blue');assert.equal(desk.style.background,'#3a6ea5');assert.equal(SH.state().wallImg.url,'pic:'+wp.id,'다른 배경을 골라도 그림 항목은 남음');
button('확인').click();
api.openApp('display');button('(그림) 배경그림.png').click();button('확인').click();assert.equal(SH.state().wallpaper,'image','다시 그림을 고를 수 있음');
/* 7. Incoming 그림 주소 */
assert.equal(SH.wallpaperImage('assets/pc-desktop/incoming/a%20b.webp','a b.jpg','center'),true);assert.equal(SH.state().wallImg.url,'assets/pc-desktop/incoming/a%20b.webp');assert.ok(desk.style.background.includes('url("assets/pc-desktop/incoming/a%20b.webp")'));
for(const bad of ['http://evil.example/x.png','javascript:alert(1)','assets/pc-desktop/incoming/../x.png','pic:없는번호','//evil/x','assets/other/x.png','assets/pc-desktop/incoming/a"b.png'])assert.equal(SH.wallpaperImage(bad,'x','fill'),false,'거부: '+bad);
assert.equal(SH.state().wallImg.url,'assets/pc-desktop/incoming/a%20b.webp','거부되면 배경은 그대로');
/* 파일이 없으면 기본 배경으로 되돌림 */
assert.equal(SH.wallpaperImage('assets/pc-desktop/incoming/missing.webp','없는 그림.jpg','fill'),true);await wait(40);assert.equal(SH.state().wallpaper,'bliss','읽지 못하면 기본 배경으로');assert.ok(SH.log().some(t=>t.includes('읽을 수 없어')));
/* 8. 내 문서의 내 그림 폴더 */
SH.wallpaperImage('pic:'+wp.id,wp.name,'fill');
api.openApp('mydocs');
const row=find(n=>n.classList.contains('p87-row')&&n.textContent.includes('내 그림'));assert.ok(row);row.emit('dblclick');
const folderView=()=>find(n=>n.classList.contains('p87-view'));assert.ok(has('배경그림.png',folderView()),'저장한 그림이 폴더에 보임');assert.ok(has('DSC00231.jpg',folderView()),'옛 가짜 파일도 그대로');assert.ok(textHas('PNG 이미지',folderView()));
assert.ok(has('그림 작업')&&has('바탕 화면 배경으로 설정'),'내 그림 폴더에도 그림 작업 칸');
const prow=find(n=>n.classList.contains('p87-row')&&n.textContent.includes('배경그림.png'));prow.emit('click');assert.ok(button('삭제',find(n=>n.classList.contains('p87-details'))),'선택하면 삭제 단추');assert.ok(has('치수: 480 x 320'));
/* 폴더의 '바탕 화면 배경으로 설정' */
const wlink=find(n=>n.classList.contains('p87-link')&&n.textContent.includes('바탕 화면 배경으로 설정'));wlink.click();d=dlgs();assert.equal(d.length,1);assert.ok(textHas('바탕 화면 배경으로 설정',d[0])&&textHas('"배경그림.png"',d[0]));button('바둑판식',d[0]).click();button('확인',d[0]).click();
assert.equal(SH.state().wallImg.mode,'tile');assert.equal(SH.state().wallImg.url,'pic:'+wp.id);closeDialogs();
/* 그림 뷰어에서 */
prow.emit('dblclick');const vwin=find(n=>n.classList.contains('p88-viewer-win'));assert.ok(vwin,'그림 뷰어가 열림');
const vbtn=tip=>find(n=>n.tagName==='BUTTON'&&n.attributes['aria-label']===tip,vwin);assert.ok(vbtn('바탕 화면으로 설정'),'뷰어에 바탕 화면 단추');
vbtn('바탕 화면으로 설정').click();d=dlgs();assert.equal(d.length,1);assert.ok(textHas('"배경그림.png"',d[0]));button('가운데',d[0]).click();button('확인',d[0]).click();assert.equal(SH.state().wallImg.mode,'center','뷰어에서 설정');assert.ok(SH.toasts().some(t=>t.includes('바탕 화면 배경을 바꿨습니다')));closeDialogs();
vbtn('바탕 화면으로 설정').click();d=dlgs();button('취소',d[0]).click();assert.equal(SH.state().wallImg.mode,'center','취소하면 그대로');closeDialogs();
vwin.emit('keydown',{key:'b'});assert.equal(dlgs().length,1,'B 키로도 열림');closeDialogs();
const stage=find(n=>n.classList.contains('p88-stage'),vwin);stage.emit('contextmenu',{clientX:70,clientY:80});const menu=find(n=>n.classList.contains('xp-menu'));assert.ok(menu,'오른쪽 단추 메뉴');assert.ok(textHas('바탕 화면으로 설정',menu)&&textHas('복사본 저장',menu));
button('바탕 화면으로 설정',menu).click();assert.equal(dlgs().length,1,'메뉴에서도 열림');closeDialogs();
/* 뷰어의 다른 단추는 예전처럼 제한 */
for(const tip of ['이미지 인쇄','복사본 저장','삭제','편집']){vbtn(tip).click();assert.ok(textHas('제한 때문에',vwin));find(n=>n.classList.contains('p87-veil'),vwin).remove()}
/* 삭제 */
api.closeWin&&api.closeWin('viewer');
const prow2=find(n=>n.classList.contains('p87-row')&&n.textContent.includes('배경그림.png'));prow2.emit('click');button('삭제',find(n=>n.classList.contains('p87-details'))).click();d=dlgs();assert.ok(textHas('삭제하시겠습니까',d[0]));button('아니요',d[0]).click();assert.equal(SH.state().pics.length,1,'아니요면 그대로');
find(n=>n.classList.contains('p87-row')&&n.textContent.includes('배경그림.png')).emit('click');button('삭제',find(n=>n.classList.contains('p87-details'))).click();button('예',dlgs()[0]).click();
assert.equal(SH.state().pics.length,0,'삭제됨');assert.ok(!has('배경그림.png',folderView()),'폴더에서도 사라짐');assert.equal(SH.state().wallpaper,'bliss','배경으로 쓰던 그림을 지우면 기본 배경');
/* 9. 다시 켜도 남음 */
SH.picSave('남는그림.png',OK);SH.wallpaperImage('pic:'+SH.pics()[0].id,'남는그림.png','tile');
api.destroy();api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600});const SH2=api.modules.shell;const desk2=find(n=>n.classList.contains('xp79-desktop'));
assert.equal(SH2.state().pics.join(),'남는그림.png');assert.equal(SH2.state().wallpaper,'image');assert.equal(SH2.state().wallImg.mode,'tile');assert.ok(desk2.style.background.includes('url("data:image/png'),'다시 켜도 배경 그림');
/* 10. 모듈이 없어도 내 컴퓨터는 열림 (shell 없이) */
const saved=JSON.parse(memory.get('2006_xp_desktop_v1')).xp;assert.equal(saved.pics.length,1);assert.equal(saved.paint,'','옛 저장 칸은 비움');
api.destroy();
console.log('PASS A93 paint save to 내 그림, save-as dialog/formats/overwrite/limits/real download option, wallpaper from paint/folder/viewer/menu/key, display properties modes, safe urls, persistence');
})().catch(e=>{console.error(e);process.exit(1)});
