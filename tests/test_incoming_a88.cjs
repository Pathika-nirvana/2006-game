'use strict';
/* A88 내 문서 Incoming 폴더, Windows 그림 및 팩스 뷰어, /api/incoming 시험 (진짜 서버와 함께 돌린다) */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path'),http=require('http');
const ROOT=path.join(__dirname,'..');
const INC=path.join(ROOT,'assets','pc-desktop','incoming');
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c},remove:c=>this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' '),toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);if(n.parentNode===this)this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return{scale(){}}}}
const all=n=>[n,...n.children.flatMap(c=>all(c))];
const find=(root,f)=>all(root).find(f);
const has=(root,s)=>assert.ok(root.textContent.includes(s),'text: '+s);
const hasNot=(root,s)=>assert.ok(!root.textContent.includes(s),'unexpected: '+s);
const button=(root,s)=>{const x=find(root,n=>n.tagName==='BUTTON'&&n.textContent===s);assert.ok(x,'button: '+s);return x};
const vbtn=(root,tip)=>{const x=find(root,n=>n.tagName==='BUTTON'&&n.attributes['aria-label']===tip);assert.ok(x,'viewer button: '+tip);return x};
const cls=(root,c)=>all(root).filter(n=>n.classList.contains(c));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');

function get(port,url,headers){return new Promise((res,rej)=>{http.get({host:'127.0.0.1',port,path:url,headers},r=>{const b=[];r.on('data',d=>b.push(d));r.on('end',()=>res({status:r.statusCode,headers:r.headers,body:Buffer.concat(b)}))}).on('error',rej)})}

function boot(port,fetchImpl){
 const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);
 const timers=[];
 const w={document:doc,Date,URL,encodeURIComponent,Promise,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},setInterval:(fn,ms)=>{timers.push({fn,ms,on:true});return timers.length},clearInterval:id=>{if(timers[id-1])timers[id-1].on=false},
  fetch:fetchImpl||((url,opt)=>get(port,'/'+url,opt&&opt.headers).then(r=>({ok:r.status>=200&&r.status<300,status:r.status,json:async()=>JSON.parse(r.body.toString('utf8'))})))};
 w.window=w;
 for(const f of['portal-news','portal-boards','portal-pages','pc-system'])vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/'+f+'.js'),'utf8'),w);
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/xp-desktop.js'),'utf8'),w);
 const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3550});
 return{w,root,api,timers};
}

(async()=>{
 const{app}=require(path.join(ROOT,'server.js'));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const port=server.address().port;
 const extra=['zz 테스트 03.png','ZZ_테스트_대문자.JPG'].map(n=>path.join(INC,n));
 const junk=[path.join(INC,'.hidden.png'),path.join(INC,'notes.txt')];
 try{
  /* 1. 서버 목록 */
  let r=await get(port,'/api/incoming');
  assert.equal(r.status,200);assert.match(r.headers['content-type'],/application\/json/);
  let names=JSON.parse(r.body.toString()).files.map(f=>f.name);
  assert.ok(names.includes('crayon_cat.webp')&&names.includes('crayon_kids.webp'),'테스트 그림 2장');
  assert.ok(!names.includes('README.txt'));
  const etag=r.headers.etag;assert.ok(etag);
  r=await get(port,'/api/incoming',{'if-none-match':etag});assert.equal(r.status,304);

  /* 파일을 넣으면 목록에 나타난다 (그림이 아닌 파일과 숨김 파일은 빠진다) */
  fs.writeFileSync(extra[0],PNG);fs.writeFileSync(extra[1],PNG);fs.writeFileSync(junk[0],PNG);fs.writeFileSync(junk[1],'x');
  r=await get(port,'/api/incoming');
  const files=JSON.parse(r.body.toString()).files;names=files.map(f=>f.name);
  assert.ok(names.includes('zz 테스트 03.png'),'넣은 파일이 보임');assert.ok(names.includes('ZZ_테스트_대문자.JPG'));
  assert.ok(!names.includes('.hidden.png')&&!names.includes('notes.txt'));
  assert.notEqual(r.headers.etag,etag,'목록이 바뀌면 ETag도 바뀐다');
  const f1=files.find(f=>f.name==='zz 테스트 03.png');
  assert.equal(f1.size,PNG.length);assert.ok(f1.url.includes('%20')&&!f1.url.includes(' '),'주소는 인코딩');
  /* 한글 이름 그림 받기, 대소문자 확장자 */
  let img=await get(port,'/'+f1.url);assert.equal(img.status,200);assert.equal(img.headers['content-type'],'image/png');assert.deepEqual(img.body,PNG);
  img=await get(port,'/'+files.find(f=>f.name==='ZZ_테스트_대문자.JPG').url);assert.equal(img.headers['content-type'],'image/jpeg');
  /* 같은 파일이면 다시 받지 않는다 */
  const t1=await get(port,'/'+f1.url);const t2=await get(port,'/'+f1.url,{'if-none-match':t1.headers.etag});assert.equal(t2.status,304);
  assert.equal((await get(port,'/assets/pc-desktop/incoming/crayon_cat.webp')).headers['content-type'],'image/webp');
  assert.equal((await get(port,'/api/incoming/../../server.js')).status,404);
  assert.ok([403,404].includes((await get(port,'/assets/pc-desktop/incoming/..%2f..%2fserver.js')).status));
  /* 2. 내 문서 바탕화면 아이콘은 탐색기를 연다 */
  const{root,api,w}=boot(port);
  api.openApp('mydocs');
  has(root,'내 문서');has(root,'오늘 할 일.txt');has(root,'Incoming');
  assert.ok(find(root,n=>n.classList.contains('p87-address'))?.textContent.includes('내 문서'));
  /* 3. Incoming 열기 */
  const row=find(root,n=>n.classList.contains('p87-row')&&n.textContent.includes('Incoming'));assert.ok(row);
  row.emit('dblclick');
  await sleep(250);
  has(root,'Incoming');
  const thumbs=cls(root,'p88-thumb');
  assert.equal(thumbs.length,4,'그림 4장: '+thumbs.map(t=>t.textContent));
  for(const n of['crayon_cat.webp','crayon_kids.webp','zz 테스트 03.png','ZZ_테스트_대문자.JPG'])has(root,n);
  has(root,'그림 작업');has(root,'슬라이드 쇼 보기');has(root,'바탕 화면 배경으로 설정');
  const im=find(thumbs[0],n=>n.tagName==='IMG');assert.ok(/^assets\/pc-desktop\/incoming\//.test(im.src),im.src);assert.equal(im.loading,'lazy');
  /* 선택하면 자세한 정보 */
  const catThumb=thumbs.find(t=>t.textContent.includes('crayon_cat'));
  catThumb.click();
  has(root,'WEBP 이미지');has(root,'크기: 500KB');has(root,'수정한 날짜: 2006-05-');
  const catImg=find(catThumb,n=>n.tagName==='IMG');catImg.naturalWidth=1254;catImg.naturalHeight=1254;catImg.onload();
  has(root,'치수: 1254 x 1254');
  /* 4. 자세히 보기 전환 */
  button(root,'보기: 자세히').click();
  assert.equal(cls(root,'p88-thumb').length,0);
  assert.equal(cls(root,'p87-row').length,1+4);
  button(root,'보기: 미리 보기').click();
  assert.equal(cls(root,'p88-thumb').length,4);
  /* 5. 뷰어 */
  cls(root,'p88-thumb').find(t=>t.textContent.includes('crayon_cat')).emit('dblclick');
  has(root,'crayon_cat.webp - Windows 그림 및 팩스 뷰어');
  has(root,'1 / 4');
  const viewerWin=find(root,n=>n.classList.contains('p88-viewer-win'));assert.ok(viewerWin);
  const view=find(viewerWin,n=>n.classList.contains('p88-viewer'));
  const vimg=find(view,n=>n.classList.contains('p88-img'));
  assert.ok(vimg.src.endsWith('crayon_cat.webp'));
  vimg.naturalWidth=1254;vimg.naturalHeight=1254;vimg.onload();
  has(view,'1254 x 1254');
  assert.ok(parseInt(vimg.style.width)<612,'맞춤: 창에 맞게 줄어듦 '+vimg.style.width);
  vbtn(view,'실제 크기').click();assert.equal(vimg.style.width,'1254px');has(view,'100%');
  vbtn(view,'확대').click();assert.equal(vimg.style.width,'1568px');has(view,'125%');
  vbtn(view,'축소').click();vbtn(view,'축소').click();has(view,'80%');
  vbtn(view,'최적 크기').click();assert.ok(parseInt(vimg.style.width)<612);
  vbtn(view,'시계 방향으로 회전').click();assert.ok(vimg.style.transform.includes('rotate(90deg)'));
  const holder=find(view,n=>n.classList.contains('p88-holder'));
  vbtn(view,'시계 반대 방향으로 회전').click();vbtn(view,'시계 반대 방향으로 회전').click();assert.ok(vimg.style.transform.includes('rotate(270deg)'));
  /* 이전, 다음은 끝에서 이어진다 */
  vbtn(view,'다음 이미지').click();has(root,'crayon_kids.webp - Windows 그림 및 팩스 뷰어');has(view,'2 / 4');
  assert.ok(vimg.style.transform.includes('rotate(0deg)'),'다른 그림으로 넘기면 회전은 처음으로');
  vbtn(view,'이전 이미지').click();vbtn(view,'이전 이미지').click();has(view,'4 / 4');
  vbtn(view,'다음 이미지').click();has(view,'1 / 4');
  viewerWin.emit('keydown',{key:'ArrowRight'});has(view,'2 / 4');
  viewerWin.emit('keydown',{key:'ArrowLeft'});has(view,'1 / 4');
  viewerWin.emit('keydown',{key:'End'});has(view,'4 / 4');
  viewerWin.emit('keydown',{key:'Home'});has(view,'1 / 4');
  /* 제한 안내 */
  for(const tip of['이미지 인쇄','복사본 저장','삭제','편집']){
   vbtn(view,tip).click();has(viewerWin,'제한 때문에');
   find(viewerWin,n=>n.classList.contains('p87-veil')).remove();
  }
  /* 6. 깨진 그림 */
  vimg.onerror();has(view,'표시할 수 없습니다');
 }finally{
  for(const f of[...extra,...junk])try{fs.unlinkSync(f)}catch{}
 }

 /* 7. 슬라이드 쇼, 새로 고침, 오류 상태 */
 {
  const{root,api,timers}=boot(port);
  api.openApp('mydocs');
  find(root,n=>n.classList.contains('p87-row')&&n.textContent.includes('Incoming')).emit('dblclick');await sleep(250);
  assert.equal(cls(root,'p88-thumb').length,2,'넣었던 파일을 빼면 목록에서 사라진다');
  link(root,'슬라이드 쇼 보기').click();
  const view=find(root,n=>n.classList.contains('p88-viewer'));
  assert.ok(view.classList.contains('p88-slide'));
  assert.equal(timers.filter(t=>t.on).length,1);has(view,'1 / 2');
  timers[0].fn();has(view,'2 / 2');timers[0].fn();has(view,'1 / 2');
  find(view,n=>n.classList.contains('p88-stage')).click();
  assert.equal(timers.filter(t=>t.on).length,0);assert.ok(!view.classList.contains('p88-slide'));
  /* 새로 고침 */
  const extra2=path.join(INC,'zz_refresh.png');fs.writeFileSync(extra2,PNG);
  try{button(root,'새로 고침').click();await sleep(250);assert.equal(cls(root,'p88-thumb').length,3);}finally{fs.unlinkSync(extra2)}
  button(root,'새로 고침').click();await sleep(250);assert.equal(cls(root,'p88-thumb').length,2);
 }
 {
  const{root,api}=boot(port,()=>Promise.reject(new Error('offline')));
  api.openApp('mydocs');
  find(root,n=>n.classList.contains('p87-row')&&n.textContent.includes('Incoming')).emit('dblclick');await sleep(60);
  has(root,'읽을 수 없습니다');
  const{root:r2,api:a2}=boot(port,()=>{throw new Error('sync boom')});
  a2.openApp('mydocs');find(r2,n=>n.classList.contains('p87-row')&&n.textContent.includes('Incoming')).emit('dblclick');await sleep(60);has(r2,'읽을 수 없습니다');
  const{root:r3,api:a3}=boot(port,()=>Promise.resolve({ok:true,json:async()=>({files:[]})}));
  a3.openApp('mydocs');find(r3,n=>n.classList.contains('p87-row')&&n.textContent.includes('Incoming')).emit('dblclick');await sleep(60);has(r3,'이 폴더는 비어 있습니다');
 }
 /* 8. 내 컴퓨터 경로로도 들어간다 */
 {
  const{root,api}=boot(port);
  api.openApp('computer');
  find(find(root,n=>n.classList.contains('p87-pane')),n=>n.tagName==='BUTTON'&&n.textContent==='내 문서').click();has(root,'Incoming');
  hasNot(root,'크기: undefined');
 }
 /* 9. 그림 이름이 뷰어에 안전하게 들어간다 */
 {
  const{w}=boot(port);
  const nodes=w.PCSystem.imageNodes([{name:'<b>x</b>.png',size:2048,url:'assets/pc-desktop/incoming/x.png',mtime:1},{name:'',size:1,url:'x'},null,{name:'a.png'}]);
  assert.equal(nodes.length,1);assert.equal(nodes[0].size,'2KB');assert.match(nodes[0].date,/^2006-05-\d\d (오전|오후) \d{1,2}:\d\d$/);
  assert.equal(w.PCSystem.fakeDate('a.png'),w.PCSystem.fakeDate('a.png'));
 }
 server.close();
 console.log('incoming a88 ok');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
function link(root,s){const x=find(root,n=>n.tagName==='BUTTON'&&n.textContent===s);assert.ok(x,'link: '+s);return x}
