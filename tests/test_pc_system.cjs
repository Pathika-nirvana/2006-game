'use strict';
/* A87 내 컴퓨터, 시스템 등록 정보, 장치 관리자, 프로그램 추가/제거, 내 네트워크 환경 시험 */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:c=>{if(!this.classList.contains(c))this.className+=' '+c},remove:c=>this.className=this.className.split(/\s+/).filter(x=>x!==c).join(' '),toggle:(c,force)=>{const set=force===undefined?!this.classList.contains(c):force;set?this.classList.add(c):this.classList.remove(c);return set}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...nodes){for(const n of nodes){n.parentNode=this;this.children.push(n)}}insertBefore(n,b){n.parentNode=this;const i=this.children.indexOf(b);if(n.parentNode===this)this.children=this.children.filter(x=>x!==n);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...nodes){this.children=[];this._text='';this.append(...nodes)}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn)}emit(k,e={}){const event={target:this,preventDefault(){},stopPropagation(){},...e};for(const fn of [...this.listeners[k]||[]])fn(event)}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return{scale(){}}}}
function boot(seat){
 const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);
 const w={document:doc,Date,URL,encodeURIComponent,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('external browsing forbidden')}};w.window=w;
 for(const f of['portal-news','portal-boards','portal-pages','pc-system'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/xp-desktop.js'),'utf8'),w);
 const api=w.XPDesktop.mount(root,{boot:false,seat,remaining:3550});
 return{w,root,api};
}
const all=(n)=>[n,...n.children.flatMap(c=>all(c))];
const find=(root,f)=>all(root).find(f);
const button=(root,s)=>{const x=find(root,n=>n.tagName==='BUTTON'&&n.textContent===s);assert.ok(x,'button: '+s);return x};
const has=(root,s)=>assert.ok(root.textContent.includes(s),'text: '+s);
const hasNot=(root,s)=>assert.ok(!root.textContent.includes(s),'unexpected: '+s);
const veils=root=>all(root).filter(n=>n.classList.contains('p87-veil'));

/* 1. 자리 17번: 160GB */
{
 const{root,api}=boot(17);
 assert.ok(api.openApp);
 api.openApp('computer');
 has(root,'시스템 작업');has(root,'시스템 정보 보기');has(root,'프로그램 추가 또는 제거');has(root,'설정 변경');
 has(root,'기타 위치');has(root,'내 네트워크 환경');has(root,'자세한 정보');
 has(root,'하드 디스크 드라이브');has(root,'로컬 디스크 (C:)');has(root,'로컬 디스크 (D:)');has(root,'DVD 드라이브 (E:)');
 has(root,'Intel(R) Pentium(R) 4 CPU 3.20GHz');has(root,'160GB SATA HDD');

 /* 드라이브 선택 시 자세한 정보 */
 const tiles=all(root).filter(n=>n.classList.contains('p87-tile'));
 assert.equal(tiles.length,5);
 const cTile=tiles.find(n=>n.textContent.includes('로컬 디스크 (C:)'));
 cTile.click();
 has(root,'파일 시스템: NTFS');has(root,'전체 크기: 29.3GB');has(root,'사용 가능 공간: 11.4GB');
 /* D: 열기 */
 const dTile=tiles.find(n=>n.textContent.includes('로컬 디스크 (D:)'));
 dTile.emit('dblclick');
 has(root,'D:\\');has(root,'다운로드');has(root,'동영상');
 /* 폴더 안 */
 const folder=all(root).find(n=>n.classList.contains('p87-row')&&n.textContent.includes('다운로드'));
 folder.emit('dblclick');
 has(root,'dx9c_setup.exe');has(root,'응용 프로그램');
 /* 파일 실행은 PC방 제한 */
 const file=all(root).find(n=>n.classList.contains('p87-row')&&n.textContent.includes('dx9c_setup.exe'));
 file.emit('dblclick');
 assert.equal(veils(root).length,1);
 has(root,'제한 때문에');
 button(root,'확인').click();
 assert.equal(veils(root).length,0);
 /* 뒤로, 위로 */
 button(root,'위로').click();
 has(root,'D:\\');
 button(root,'◀ 뒤로').click();
 button(root,'위로').click();
 button(root,'위로').click();
 has(root,'DVD 드라이브 (E:)');
 /* E: 는 디스크가 없다 */
 const e=all(root).find(n=>n.classList.contains('p87-tile')&&n.textContent.includes('DVD'));
 e.emit('dblclick');
 has(root,'장치가 준비되어 있지 않습니다');
 button(root,'확인').click();
 /* C: 의 게임 폴더는 설치된 게임 */
 all(root).find(n=>n.classList.contains('p87-tile')&&n.textContent.includes('로컬 디스크 (C:)')).emit('dblclick');
 has(root,'Documents and Settings');has(root,'WINDOWS');
 all(root).find(n=>n.classList.contains('p87-row')&&n.textContent.includes('Program Files')).emit('dblclick');
 has(root,'제한 때문에');button(root,'확인').click();
 all(root).find(n=>n.classList.contains('p87-row')&&n.textContent.includes('게임')).emit('dblclick');
 assert.equal(api.state.active,'launcher'.length?api.state.active:'');
 has(root,'GAME STATION');
 /* 내 문서 */
 api.openApp('computer');
 button(find(root,n=>n.classList.contains('xp79-window')&&n.attributes['aria-label']==='내 컴퓨터'),'내 문서').click();
 has(root,'오늘 할 일.txt');has(root,'내 그림');has(root,'한글 문서');
 all(root).find(n=>n.classList.contains('p87-row')&&n.textContent.includes('오늘 할 일.txt')).emit('dblclick');
 has(root,'오늘 할 일.txt - 메모장');
}

/* 2. 시스템 등록 정보: 지정한 문구 그대로 */
{
 const{root,api}=boot(17);
 api.openApp('computer');
 button(root,'시스템 정보 보기').click();
 const props=find(root,n=>n.classList.contains('p87-props'));
 assert.ok(props,'시스템 등록 정보 창');
 const t=props.textContent;
 for(const s of['시스템:','Microsoft Windows XP','Professional','버전 2002','Service Pack 2','컴퓨터:','Intel(R) Pentium(R) 4 CPU 3.20GHz','512 MB of RAM','그래픽:','NVIDIA GeForce 6600 GT','비디오 메모리 : 256MB','메인보드:','Intel 945P','하드디스크:','160GB SATA HDD'])assert.ok(t.includes(s),'일반 탭: '+s);
 assert.ok(!t.includes('80GB SATA HDD'));
 /* 순서 */
 const order=['시스템:','컴퓨터:','그래픽:','메인보드:','하드디스크:'].map(s=>t.indexOf(s));
 assert.deepEqual([...order].sort((a,b)=>a-b),order);
 for(const tab of['컴퓨터 이름','하드웨어','고급','시스템 복원','자동 업데이트','원격','일반']){button(props,tab).click();assert.ok(find(root,n=>n.classList.contains('p87-page')).textContent.length>20,tab)}
 button(props,'컴퓨터 이름').click();has(root,'pc17.');has(root,'WORKGROUP');
 button(props,'고급').click();button(props,'설정(S)').click();has(root,'제한 때문에');button(veils(root)[0],'확인').click();
 /* 장치 관리자 */
 button(props,'하드웨어').click();button(props,'장치 관리자(D)').click();
 const dev=find(root,n=>n.classList.contains('p87-devtree'));
 assert.ok(dev);
 for(const s of['PC17','디스크 드라이브','WDC WD1600JD','디스플레이 어댑터','NVIDIA GeForce 6600 GT','프로세서','Intel(R) Pentium(R) 4 CPU 3.20GHz'])assert.ok(dev.textContent.includes(s),'장치 관리자: '+s);
 button(root,'+  시스템 장치').click();
 assert.ok(find(root,n=>n.classList.contains('p87-devtree')).textContent.includes('82945G/GZ/P/PL'));
 const gpu=find(root,n=>n.classList.contains('p87-node-dev')&&n.textContent==='NVIDIA GeForce 6600 GT');
 gpu.emit('dblclick');
 has(root,'NVIDIA GeForce 6600 GT 등록 정보');has(root,'이 장치는 올바르게 작동하고 있습니다.');has(root,'비디오 메모리 : 256MB');
 button(veils(root)[0],'확인').click();assert.equal(veils(root).length,0);
 /* 확인 버튼으로 등록 정보 창을 닫는다 */
 const before=all(root).filter(n=>n.classList.contains('p87-props')).length;
 button(find(root,n=>n.classList.contains('p87-props')),'확인').click();
 assert.equal(all(root).filter(n=>n.classList.contains('p87-props')).length,before-1);
}

/* 3. 자리 12번: 80GB */
{
 const{root,api}=boot(12);
 api.openApp('computer');
 has(root,'80GB SATA HDD');hasNot(root,'160GB');
 button(root,'시스템 정보 보기').click();
 const t=find(root,n=>n.classList.contains('p87-props')).textContent;
 assert.ok(t.includes('80GB SATA HDD'));assert.ok(!t.includes('160GB'));
 assert.ok(t.includes('pc12'));
}

/* 4. 프로그램 추가/제거, 내 네트워크 환경 */
{
 const{root,api}=boot(12);
 api.openApp('computer');
 button(root,'프로그램 추가 또는 제거').click();
 const prog=find(root,n=>n.classList.contains('p87-prog'));
 assert.ok(prog);
 for(const s of['Adobe Flash Player 8','ALZip','NVIDIA Drivers','서든어택'])assert.ok(prog.textContent.includes(s),'프로그램: '+s);
 find(root,n=>n.classList.contains('p87-prog-row')&&n.textContent==='ALZip').click();
 has(root,'사용 빈도');
 button(root,'제거').click();has(root,'제한 때문에');button(root,'확인').click();
 button(find(root,n=>n.classList.contains('xp79-window')&&n.attributes['aria-label']==='내 컴퓨터'),'내 네트워크 환경').click();
 const net=find(root,n=>n.classList.contains('p87-net'));
 assert.ok(net);
 assert.ok(net.textContent.includes('PC12 (이 컴퓨터)'));assert.ok(net.textContent.includes('SERVER'));
 find(root,n=>n.classList.contains('p87-netitem')&&n.textContent.startsWith('PC03')).emit('dblclick');
 has(root,'\\\\PC03에 액세스할 수 없습니다');
}

/* 5. 이 모듈이 없어도 이전 내 컴퓨터가 열린다 */
{
 const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);
 const w={document:doc,Date,URL,encodeURIComponent,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),MEMO:{add(){}},fetch:()=>{throw Error('x')}};w.window=w;
 for(const f of['portal-news','portal-boards','portal-pages'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/xp-desktop.js'),'utf8'),w);
 const api=w.XPDesktop.mount(root,{boot:false,seat:12});
 api.openApp('computer');
 has(root,'하드 디스크 드라이브');
}

/* 6. 사양 값 */
{
 const w={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/pc-system.js'),'utf8'),Object.assign(w,{window:w}));
 const a=w.PCSystem.specFor(12),b=w.PCSystem.specFor(17);
 assert.equal(a.hdd,'80GB SATA HDD');assert.equal(b.hdd,'160GB SATA HDD');
 for(const s of[a,b]){
  assert.deepEqual(Array.from(s.osLines),['Microsoft Windows XP','Professional','버전 2002','Service Pack 2']);
  assert.equal(s.cpu,'Intel(R) Pentium(R) 4 CPU 3.20GHz');assert.equal(s.ram,'512 MB of RAM');
  assert.equal(s.gpu,'NVIDIA GeForce 6600 GT');assert.equal(s.vram,'비디오 메모리 : 256MB');assert.equal(s.board,'Intel 945P');
  const sum=s.drives.reduce((x,y)=>x+y.total,0);
  assert.ok(Math.abs(sum-(s.hdd.startsWith('160')?149:74.5))<0.2,'파티션 합계 '+sum);
  for(const dr of s.drives)assert.ok(dr.free<dr.total);
 }
 assert.equal(w.PCSystem.gb(9.82),'9.82GB');assert.equal(w.PCSystem.gb(119.7),'119GB');assert.equal(w.PCSystem.gb(24.4),'24.4GB');
}
console.log('pc system ok');
