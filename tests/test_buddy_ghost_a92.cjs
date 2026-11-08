'use strict';
/* A92: 버디버디 이름과 아이콘, 사용자가 그려 온 귀신 그림 여섯 장, 점프 소리 뒤 흐느끼는 소리를 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):k==='getImageData'?(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4).fill(255),width:w,height:h}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}}
const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);let fetches=0,logouts=0;
const fast=(fn,ms)=>setTimeout(fn,Math.min(ms||0,15));
const w={document:doc,Date,URL,encodeURIComponent,Math,Number,Uint8Array,Uint8ClampedArray,Array,Object,String,JSON,Set,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{fetches++;throw Error('external browsing forbidden')},setTimeout:fast,clearTimeout,setInterval,clearInterval};w.window=w;
const src=f=>fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8');
for(const f of ['portal-news','portal-boards','portal-pages','portal-comics','kids-data','kids-games','kids-portal','desk-smash','xp-shell','xp-setup','xp-apps','xp-messenger','xp-net','web-data','web-ghost','web-flash','web-sites','xp-desktop'])vm.runInNewContext(src(f),w);
const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=(c,n=root)=>all(n).filter(n=>n.classList.contains(c)),button=(s,n=root)=>{const x=find(n=>n.tagName==='BUTTON'&&n.textContent===s,n);assert.ok(x,'button: '+s);return x},has=(s,n=root)=>all(n).some(x=>x.textContent&&x.textContent.includes(s)&&x.children.length===0);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const json=x=>JSON.stringify(x);
const crypto=require('node:crypto');
const sleep=wait,root_=path.join(__dirname,'..');
const rx=(re,n=root)=>find(x=>x.tagName==='BUTTON'&&re.test(x.textContent),n);
const md5=f=>crypto.createHash('md5').update(fs.readFileSync(path.join(root_,f))).digest('hex');
/* 가짜 그림판: 부른 일을 기록한다 */
const recCtx=()=>{const calls=[];const g=new Proxy({},{get:(t,k)=>k==='calls'?calls:k==='createLinearGradient'||k==='createRadialGradient'?()=>({addColorStop(){}}):(k in t?t[k]:(...a)=>{calls.push([String(k),...a])}),set:(t,k,v)=>{t[k]=v;return true}});return g};
const only=(g,name)=>g.calls.filter(c=>c[0]===name);
/* 가짜 소리 관리자: 부른 일을 기록한다 */
function fakeAudio(){const log=[],ends={},stops=[];return{log,ends,stops,registerClip(id,url){log.push(['reg',id,url])},playCue(id,gain,onEnd){log.push(['play',id,gain]);ends[id]=onEnd;let on=true;const stop=()=>{if(on){on=false;stops.push(id)}};return stop}}}
/* 같은 코드를 따로 한 번 더 읽어서 서로 다른 그림 상태를 시험한다 */
function ghostWorld(extra){const world={document:doc,console,Math,Date,setTimeout:fast,clearTimeout,Array,Object,String,Number,JSON,Promise,...extra};world.window=world;vm.runInNewContext(fs.readFileSync(path.join(root_,'src/web-ghost.js'),'utf8'),world);return world}
(async()=>{
/* 1. 올려 주신 파일이 원본 그대로 들어 있는지 */
const HASH={'assets/pc-desktop/icons/buddy.webp':'d4ec79b987769748b877227e2790128b','assets/pc-desktop/ghost/ghost-sheet.webp':'15487baf88b0cb6e22a147416ba7fd32','assets/pc-desktop/ghost/jump1.mp3':'1dfe5bf0dd59727fbc6f214a4aaf971f','assets/pc-desktop/ghost/sob-child-1.mp3':'87abbb8b0557645c8b9582a31ca32450','assets/pc-desktop/ghost/sob-child-2.mp3':'14ac4ff477bcee5ba4cb968a3fa36767','assets/pc-desktop/ghost/sob-child-3.mp3':'9c4fc05faba6a6c083b6812d0b71a90a','assets/pc-desktop/ghost/sob-female-1.mp3':'d42f1968d81511a717760895210eb495','assets/pc-desktop/ghost/sob-female-2.mp3':'a16ca201de062a70a75d6a5a20c99918','assets/pc-desktop/ghost/sob-female-3.mp3':'384e1462f5128ac9fd9bd973b885f1ff'};
for(const [f,h] of Object.entries(HASH))assert.equal(md5(f),h,f+' 은 올려 주신 원본과 같아야 함');
const dims=f=>{const b=fs.readFileSync(path.join(root_,f));assert.equal(b.toString('latin1',0,4),'RIFF');assert.equal(b.toString('latin1',8,12),'WEBP');const k=b.toString('latin1',12,16);if(k==='VP8X')return{w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3),alpha:!!(b[20]&0x10)};if(k==='VP8L'){const v=b.readUInt32LE(21);return{w:1+(v&0x3fff),h:1+((v>>14)&0x3fff),alpha:!!((v>>28)&1)}}return{w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff,alpha:false}};
const ic=dims('assets/pc-desktop/icons/buddy.webp');assert.ok(ic.alpha,'버디버디 아이콘은 투명 배경');assert.equal(ic.w,1375);assert.equal(ic.h,1144);
const sh=dims('assets/pc-desktop/ghost/ghost-sheet.webp');assert.equal(sh.w,1500);assert.equal(sh.h,1049);
const WG0=ghostWorld({}).WebGhost;assert.equal(WG0.KINDS.length,6);assert.equal(WG0.RECTS.length,6);
const bars={x:[[498,502],[999,1004]],y:[[520,526]]};
for(const [x,y,ww,hh] of WG0.RECTS){assert.ok(x>=0&&y>=0&&x+ww<=sh.w&&y+hh<=sh.h,'칸이 그림 안에 있음');for(const [a,b] of bars.x)assert.ok(x+ww<=a||x>=b,'세로 구분선을 넘지 않음');for(const [a,b] of bars.y)assert.ok(y+hh<=a||y>=b,'가로 구분선을 넘지 않음')}
for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){const a=WG0.RECTS[i],b=WG0.RECTS[j];assert.ok(a[0]+a[2]<=b[0]||b[0]+b[2]<=a[0]||a[1]+a[3]<=b[1]||b[1]+b[3]<=a[1],'칸끼리 겹치지 않음')}
/* 2. 그림: 불러오는 중에는 검은 화면, 다 불러오면 원본의 해당 칸을 비율대로 */
{let made=null;class Img{constructor(){made=this}set src(v){this._src=v;this.url=v}}
 const world=ghostWorld({Image:Img}),WG=world.WebGhost;WG.preload();assert.equal(WG.sheetState(),'loading');assert.ok(/ghost-sheet\.webp/.test(made.url));
 const g=recCtx();WG.face(g,1000,600,'scream',1);assert.equal(only(g,'drawImage').length,0,'아직 못 불러왔으면 그리지 않음');assert.ok(only(g,'fillRect').length>=1);
 made.onload();assert.equal(WG.sheetState(),'ready');const d=only(g,'drawImage');assert.equal(d.length,1,'불러오면 기다리던 그림이 그려짐');
 for(const [i,k] of WG.KINDS.entries()){const g2=recCtx();WG.face(g2,1000,600,k,1);const c=only(g2,'drawImage')[0];assert.ok(c,k);assert.equal(json(c.slice(2,6)),json(WG.RECTS[i]),k+' 는 '+i+'번째 칸');const [,,,,,,dx,dy,dw,dh]=c;assert.ok(dx>=0&&dy>=0&&dx+dw<=1000.001&&dy+dh<=600.001,'화면 안에 들어감');assert.ok(Math.abs(dw/dh-WG.RECTS[i][2]/WG.RECTS[i][3])<.01,'비율 유지');assert.ok(Math.abs(dh-600)<.01||Math.abs(dw-1000)<.01,'가능한 한 크게')}
 const g3=recCtx();WG.face(g3,250,200,'nope',1);assert.equal(only(g3,'drawImage').length,0,'모르는 종류는 코드로 그린 얼굴')}
{let made=null;class Img{constructor(){made=this}set src(v){}}const WG=ghostWorld({Image:Img}).WebGhost;WG.preload();const g=recCtx();WG.face(g,300,200,'blood',3);made.onerror();assert.equal(WG.sheetState(),'fail');assert.equal(only(g,'drawImage').length,0,'그림을 못 불러오면 예전 코드 그림이 나옴');assert.ok(g.calls.length>30,'코드 그림이 그려짐')}
{const WG=ghostWorld({}).WebGhost;WG.preload();assert.equal(WG.sheetState(),'fail');const g=recCtx();WG.face(g,300,200,'grin',3);assert.ok(g.calls.length>30)}
/* 3. 소리: 점프 소리가 끝난 뒤에 얼굴에 맞는 흐느끼는 소리 */
for(const [kind,group] of [['half','child'],['child','child'],['cracked','child'],['scream','female'],['blood','female'],['grin','female']]){
 const A=fakeAudio(),world=ghostWorld({GameAudio:A}),WG=world.WebGhost;const host=new Node('div');host.clientWidth=900;host.clientHeight=600;
 const mk=(t,c,x)=>{const n=new Node(t);n.className=c||'';if(x!==undefined)n.textContent=x;return n},btn=(l,f,c)=>{const b=mk('button',c,l);b.addEventListener('click',f);return b};
 const made=WG.scare({desk:host,E:mk,B:btn},{kind,text:'t',hold:5});assert.ok(made);
 assert.equal(A.log.filter(e=>e[0]==='reg').length,7,'소리 일곱 개 등록');assert.ok(A.log.some(e=>e[0]==='reg'&&e[1]==='scare-jump'&&/jump1\.mp3/.test(e[2])));
 const plays=()=>A.log.filter(e=>e[0]==='play');assert.equal(plays().length,1);assert.equal(plays()[0][1],'scare-jump','처음에는 점프 소리만');assert.equal(typeof A.ends['scare-jump'],'function');
 assert.equal(WG.sounding(),true);A.ends['scare-jump']();assert.equal(plays().length,2,'점프 소리가 끝나면 흐느낌');assert.ok(plays()[1][1].startsWith('scare-sob-'+group+'-'),kind+' 는 '+group+' 흐느낌');assert.ok(plays()[1][2]>0&&plays()[1][2]<=1);
 made.close();await sleep(20);WG.stop();assert.equal(WG.sounding(),false);assert.ok(A.stops.includes(plays()[1][1]),'멈추면 흐느낌도 멈춤')}
{const A=fakeAudio(),WG=ghostWorld({GameAudio:A}).WebGhost;const host=new Node('div');const mk=(t,c,x)=>{const n=new Node(t);n.className=c||'';return n},btn=(l,f,c)=>{const b=mk('button',c);b.addEventListener('click',f);return b};
 WG.scare({desk:host,E:mk,B:btn},{kind:'scream',hold:5});WG.stop();assert.deepEqual(A.stops,['scare-jump'],'점프 소리 도중에 멈추면 흐느낌은 시작도 안 함');A.ends['scare-jump']&&A.ends['scare-jump']();assert.equal(A.log.filter(e=>e[0]==='play').length,1,'멈춘 뒤에는 이어지지 않음');
 const seen=new Set();for(let i=0;i<40;i++){const A2=fakeAudio(),W2=ghostWorld({GameAudio:A2}).WebGhost;W2.scare({desk:new Node('div'),E:mk,B:btn},{kind:'grin',hold:5});A2.ends['scare-jump']();seen.add(A2.log.filter(e=>e[0]==='play')[1][1])}assert.ok(seen.size>=2,'흐느낌이 늘 같지는 않음')}
{const WG=ghostWorld({}).WebGhost;const host=new Node('div');const mk=(t,c)=>{const n=new Node(t);n.className=c||'';return n},btn=(l,f,c)=>{const b=mk('button',c);b.addEventListener('click',f);return b};assert.ok(WG.scare({desk:host,E:mk,B:btn},{kind:'child',hold:5}),'소리 관리자가 없어도 얼굴은 나옴');WG.stop()}
/* 4. 바탕화면 안에서: 이름과 아이콘, 소리 연결 */
const A=fakeAudio();w.GameAudio=A;
const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});
const sc=find(n=>n.classList.contains('xp79-shortcut')&&n.attributes['aria-label']==='버디버디');assert.ok(sc,'바탕화면에 버디버디');assert.ok(!find(n=>n.classList.contains('xp79-shortcut')&&/딩동/.test(n.textContent)),'딩동 이름이 없음');
const im=sc.children.find(c=>c.tagName==='IMG');assert.ok(/icons\/buddy\.webp/.test(im.src),'바탕화면 아이콘은 올려 주신 webp');
assert.ok(find(n=>n.classList.contains('xp-tray-btn')&&n.classList.contains('msg')&&n.attributes['aria-label']==='버디버디'),'작업표시줄 오른쪽 아이콘 이름');
click_start: {const start=rx(/시작/);start.click();const all1=rx(/모든 프로그램/);all1&&all1.click();}
assert.ok(find(n=>n.classList.contains('xp-ap-item')&&n.textContent.includes('버디버디')),'모든 프로그램에 버디버디');const apIco=find(n=>n.classList.contains('xp-ap-ico'));assert.ok(apIco&&/buddy\.webp/.test(apIco.src),'모든 프로그램 항목에 아이콘');
api.openApp('messenger');assert.ok(has('버디버디에 로그인하는 중'));assert.ok(find(n=>n.classList.contains('xp-buddy-big')&&/buddy\.webp/.test(n.src)),'로그인 화면 큰 아이콘');assert.ok(find(n=>n.classList.contains('xp-buddy-ico')&&/buddy\.webp/.test(n.src)),'친구 목록 위쪽 작은 아이콘');
await sleep(60);assert.ok(all().filter(n=>n.classList.contains('xp-msn-buddy')).length>=8,'친구 목록');assert.ok(/toast\(\{title:'버디버디'/.test(fs.readFileSync(path.join(root_,'src/xp-messenger.js'),'utf8')),'풍선 제목은 버디버디');
/* 소리가 사이트와 같이 움직이는지 */
api.openApp('browser');api.navigate({type:'story',portal:'w-sorum',id:'s1'});rx(/마지막 줄 보기/).click();
assert.equal(A.log.filter(e=>e[0]==='play'&&e[1]==='scare-jump').length,1,'놀라는 순간 점프 소리');
await sleep(60);find(n=>n.classList.contains('ws-scare')).emit('keydown',{code:'Enter'});assert.equal(A.stops.length,0,'화면을 닫아도 소리는 이어짐');
A.ends['scare-jump']();assert.ok(A.log.some(e=>e[0]==='play'&&e[1].startsWith('scare-sob-female-')),'비명 얼굴은 여자 흐느낌');
api.navigate({type:'main',portal:'w-sorum'});assert.ok(A.stops.some(s=>s.startsWith('scare-sob-')),'다른 쪽으로 가면 소리가 멈춤');
A.stops.length=0;api.navigate({type:'story',portal:'w-sorum',id:'s1'});rx(/마지막 줄 보기/).click();await sleep(60);find(n=>n.classList.contains('ws-scare')).emit('keydown',{code:'Space'});
w.WebSites.stop();assert.ok(A.stops.includes('scare-jump'),'사이트를 닫으면 소리도 멈춤');
/* 5. 옛 이름이 남지 않았는지 */
for(const f of ['src/xp-messenger.js','src/xp-desktop.js','src/xp-shell.js','assets/pc-desktop/xp-extras.css','package.json','src/web-ghost.js','src/web-sites.js'])assert.ok(!fs.readFileSync(path.join(root_,f),'utf8').replace(/딩동댕/g,'').includes('딩동'),f+' 에 옛 이름');
assert.ok(!/nateon/.test(fs.readFileSync(path.join(root_,'src/xp-shell.js'),'utf8')),'옛 프로그램 이름');
assert.ok(!fs.readFileSync(path.join(__dirname,'test_buddy_ghost_a92.cjs'),'utf8').includes(String.fromCharCode(0x2014)),'시험 파일에 줄표');
assert.equal(fetches,0);api.destroy();
console.log('PASS A92 buddy rename and icon places, user ghost sheet (6 panels, original bytes, fallback), jump then sob sounds by face, stop on leave, world audio end callback');
})().catch(e=>{console.error(e);process.exit(1)});
