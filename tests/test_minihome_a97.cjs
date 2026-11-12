'use strict';
/* A97 (2026-11-12 KST) 미니홈피 실시간 연동: 진짜 서버와 웹소켓 접속 여러 개로
   내 홈 올리기, 목록, 구경(투데이), 방명록과 답글, 일촌 신청과 수락, 일촌평, 사진, 방 사이 분리, 크기와 속도 제한, 주인 확인을 검사한다.
   그 다음 가짜 네트워크로 미니홈피 화면(같은 방 친구 목록, 친구 홈, 알림)을 검사한다. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const J=x=>JSON.stringify(x);
(async()=>{
 const MINI=require(path.join(__dirname,'../server_minihome.js'));
 const srv=require(path.join(__dirname,'../server.js'));
 const server=srv.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const URL='ws://127.0.0.1:'+server.address().port+'/ws';
 const peers=[];
 async function peer(room,name){
  const ws=new WebSocket(URL),p={ws,name,msgs:[]};
  ws.addEventListener('message',e=>p.msgs.push(JSON.parse(e.data)));
  await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});
  ws.send(J({type:'join',room,name}));const wel=await until(p,m=>m.type==='welcome');p.id=wel.id;peers.push(p);return p;
 }
 async function until(p,f,ms=2500,from=0){const t0=Date.now();for(;;){const m=p.msgs.slice(from).find(f);if(m)return m;if(Date.now()-t0>ms)throw new Error('시간 초과 '+p.name+' '+f.toString().slice(0,120)+' 받은 것 '+J(p.msgs.slice(from).slice(-6)).slice(0,900));await sleep(15)}}
 const mini=(p,o)=>p.ws.send(J({type:'mini',...o}));
 const mark=p=>p.msgs.length;
 const quiet=async(p,at,f,ms=300)=>{await sleep(ms);assert.ok(!p.msgs.slice(at).some(f),'받으면 안 되는 메시지 '+p.name+' '+J(p.msgs.slice(at).filter(f)).slice(0,300))};
 const W=()=>sleep(760);
 const prof=(title,extra)=>({title,intro:'안녕하세요\n놀러 오세요',mood:'신남',bgm:'별빛소녀 - 반짝반짝 첫사랑',skin:'pink',wall:'night',floor:'tile',slots:{W0:'window',F2:'desk',F9:'bed',W1:'<script>'},base:2010,today0:4,...extra});
 try{
  const A=await peer('MINI1','민수'),B=await peer('MINI1','수진'),C=await peer('MINI2','타방');
  const uA='a'.repeat(10)+'minsoo0001',uB='b'.repeat(10)+'sujin00002',uC='c'.repeat(10)+'tabang0003';
  /* 1. 내 홈 올리기: 주인 번호(hid)는 열쇠에서 나오고 열쇠는 보이지 않는다 */
  let a0=mark(A),b0=mark(B);
  mini(A,{op:'pub',uid:uA,prof:prof('♡ 민수 방 ♡'),diary:[{d:'2006.05.30 (화)',w:'비',t:'오늘 PC방 왔다'},{d:'x',w:'눈',t:'<b>굵게</b>'}]});
  const meA=await until(A,m=>m.type==='mini'&&m.op==='me',2500,a0);
  assert.equal(meA.hid,MINI.hidOf(uA));assert.ok(/^[0-9a-f]{12}$/.test(meA.hid));assert.ok(!J(meA).includes(uA),'열쇠는 다시 보내지 않는다');
  assert.equal(meA.today,4);assert.equal(meA.total,2010);assert.equal(meA.n,'민수');
  const listB=await until(B,m=>m.type==='mini'&&m.op==='list'&&m.list.length===1,2500,b0);
  assert.equal(listB.list[0].hid,meA.hid);assert.equal(listB.list[0].title,'♡ 민수 방 ♡');assert.equal(listB.list[0].on,true);assert.equal(listB.list[0].id,A.id,'주인의 접속 번호로 지금 있는 곳을 알 수 있다');
  assert.ok(!J(listB).includes(uA));
  await sleep(500);mini(B,{op:'pub',uid:uB,prof:prof('수진이 반짝반짝',{mood:'없는기분',skin:'rainbow'}),diary:[]});
  const meB=await until(B,m=>m.type==='mini'&&m.op==='me',2500,b0);
  /* 2. 다른 방에서는 안 보인다 */
  await sleep(200);let c0=mark(C);mini(C,{op:'list'});const lc=await until(C,m=>m.type==='mini'&&m.op==='list',2500,c0);assert.equal(lc.list.length,0,'방 사이는 나뉜다');
  /* 3. 친구 홈 구경: 깨끗한 글, 투데이 +1(한 사람은 한 번만), 주인에게 알림 */
  a0=mark(A);b0=mark(B);mini(B,{op:'get',hid:meA.hid});
  const homeA=await until(B,m=>m.type==='mini'&&m.op==='home',2500,b0);
  assert.equal(homeA.prof.title,'♡ 민수 방 ♡');assert.equal(homeA.prof.wall,'night');assert.deepEqual(Object.keys(homeA.prof.slots).sort(),['F2','W0'],'없는 자리와 이상한 물건은 지운다');
  assert.equal(homeA.diary.length,2);assert.ok(!J(homeA).includes('<b>'),'꺾쇠 없음');assert.equal(homeA.diary[0].w,'맑음','모르는 날씨는 맑음');
  assert.equal(homeA.rel.nick,'');assert.equal(homeA.rel.me,false);
  mini(B,{op:'visit',hid:meA.hid});
  const v1=await until(A,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='visit',2500,a0);assert.equal(v1.note.n,'수진');assert.equal(v1.today,5);assert.equal(v1.real,1);
  await sleep(300);a0=mark(A);mini(B,{op:'visit',hid:meA.hid});await quiet(A,a0,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='visit');
  /* 4. 방명록: 쓰면 주인에게 바로 알림, 주인이 답글을 달면 쓴 사람에게 알림 */
  a0=mark(A);b0=mark(B);mini(B,{op:'gbw',hid:meA.hid,t:'민수야 놀러 왔어 ㅋㅋ <img src=x>'});
  const gb1=await until(B,m=>m.type==='mini'&&m.op==='gb',2500,b0);assert.equal(gb1.list[0].n,'수진');assert.equal(gb1.list[0].mine,true);assert.ok(!gb1.list[0].t.includes('<'));
  const n1=await until(A,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='gb',2500,a0);assert.ok(n1.note.t.startsWith('민수야 놀러 왔어'));assert.equal(n1.gbn,1);
  await W();a0=mark(A);b0=mark(B);mini(A,{op:'gbr',id:gb1.list[0].id,r:'ㅋㅋ 반가워 수진아'});
  const gb2=await until(A,m=>m.type==='mini'&&m.op==='gb',2500,a0);assert.equal(gb2.list[0].r,'ㅋㅋ 반가워 수진아');assert.equal(gb2.own,true);
  const rep=await until(B,m=>m.type==='mini'&&m.op==='note'&&m.k==='gbrep',2500,b0);assert.equal(rep.n,'민수');assert.equal(rep.t,'ㅋㅋ 반가워 수진아');
  /* 남의 방명록 글에 답글은 못 단다 (B의 홈에는 그 글이 없다) */
  await W();b0=mark(B);mini(B,{op:'gbr',id:gb1.list[0].id,r:'가짜 답글'});const gbB=await until(B,m=>m.type==='mini'&&m.op==='gb',2500,b0);assert.equal(gbB.hid,meB.hid);assert.equal(gbB.total,0);
  /* 5. 속도 제한 */
  await W();b0=mark(B);mini(B,{op:'gbw',hid:meA.hid,t:'하나'});mini(B,{op:'gbw',hid:meA.hid,t:'둘'});
  const slow=await until(B,m=>m.type==='mini'&&m.op==='error'&&m.for==='gbw',2500,b0);assert.ok(slow.message.includes('천천히'));
  /* 6. 일촌평은 일촌만 */
  await W();b0=mark(B);mini(B,{op:'say',hid:meA.hid,t:'민수 최고'});const e1=await until(B,m=>m.type==='mini'&&m.op==='error'&&m.for==='say',2500,b0);assert.ok(e1.message.includes('일촌만'));
  /* 7. 일촌 신청과 수락 */
  await W();a0=mark(A);b0=mark(B);mini(B,{op:'ask',hid:meA.hid,nick:'동네친구'});
  await until(B,m=>m.type==='mini'&&m.op==='askok',2500,b0);
  const ask=await until(A,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='ask',2500,a0);assert.equal(ask.asks[0].hid,meB.hid);assert.equal(ask.asks[0].n,'수진');assert.equal(ask.asks[0].nick,'동네친구');
  mini(B,{op:'get',hid:meA.hid});const asked=await until(B,m=>m.type==='mini'&&m.op==='home'&&m.rel.asked,2500,b0);assert.equal(asked.rel.nick,'');
  await W();a0=mark(A);b0=mark(B);mini(A,{op:'ans',from:meB.hid,ok:true,nick:'단짝'});
  const acc=await until(A,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='ilchon',2500,a0);assert.equal(acc.ilchon[0].hid,meB.hid);assert.equal(acc.ilchon[0].nick,'단짝');assert.equal(acc.asks.length,0);
  const got=await until(B,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='ilchon',2500,b0);assert.equal(got.note.n,'민수');assert.equal(got.ilchon[0].hid,meA.hid);assert.equal(got.ilchon[0].on,true);
  /* 일촌평 */
  await W();a0=mark(A);b0=mark(B);mini(B,{op:'say',hid:meA.hid,t:'민수야 PC방 ㄱ?'});
  const said=await until(B,m=>m.type==='mini'&&m.op==='home',2500,b0);assert.equal(said.says[0].t,'민수야 PC방 ㄱ?');assert.equal(said.says[0].nick,'단짝');assert.equal(said.rel.nick,'단짝');
  const sayNote=await until(A,m=>m.type==='mini'&&m.op==='me'&&m.note&&m.note.k==='say',2500,a0);assert.equal(sayNote.says[0].n,'수진');
  /* 서로 신청하면 바로 일촌 (C는 다른 방이라 못 한다) */
  /* 8. 사진: 크기 제한, 모양 검사, 주인만 */
  await W();a0=mark(A);const tiny='data:image/jpeg;base64,'+Buffer.alloc(120,7).toString('base64');
  mini(A,{op:'photo',i:0,data:tiny,cap:'PC방 17번 자리',sig:'p1|PC방'});await until(A,m=>m.type==='mini'&&m.op==='photook'&&m.sig==='p1|PC방',2500,a0);
  await sleep(500);a0=mark(A);mini(A,{op:'photo',i:1,data:'data:image/jpeg;base64,'+'A'.repeat(5700),cap:'큼'});const big=await until(A,m=>m.type==='mini'&&m.op==='error'&&m.for==='photo',2500,a0);assert.ok(big.message.includes('커서'));
  await sleep(500);a0=mark(A);mini(A,{op:'photo',i:1,data:'javascript:alert(1)',cap:'나쁜'});await until(A,m=>m.type==='mini'&&m.op==='error'&&m.for==='photo',2500,a0);
  await sleep(500);c0=mark(C);mini(C,{op:'photo',i:0,data:tiny});await until(C,m=>m.type==='mini'&&m.op==='error'&&m.for==='photo',2500,c0);
  b0=mark(B);mini(B,{op:'ph',hid:meA.hid,i:0});const ph=await until(B,m=>m.type==='mini'&&m.op==='ph',2500,b0);assert.equal(ph.data,tiny);assert.equal(ph.cap,'PC방 17번 자리');
  await sleep(120);mini(B,{op:'get',hid:meA.hid});const withPh=await until(B,m=>m.type==='mini'&&m.op==='home'&&m.photos[0],2500,b0);assert.equal(withPh.photos[0].sig,'p1|PC방');assert.ok(!('data' in withPh.photos[0]),'홈 정보에는 사진 내용을 싣지 않는다');
  /* 9. 주인 확인: 열쇠 없이 남의 홈을 고칠 수 없고, 남의 방명록 글은 못 지운다 */
  const D=await peer('MINI1','가짜민수');let d0=mark(D);
  mini(D,{op:'gbd',hid:meA.hid,id:gb1.list[0].id});const de=await until(D,m=>m.type==='mini'&&m.op==='error'&&m.for==='gbd',2500,d0);assert.ok(de.message.includes('지울 수'));
  mini(D,{op:'pub',uid:'short',prof:{}});await until(D,m=>m.type==='mini'&&m.op==='error'&&m.for==='pub',2500,d0);
  /* 쓴 사람은 자기 글을 지울 수 있다 */
  await W();b0=mark(B);mini(B,{op:'gbd',hid:meA.hid,id:gb1.list[0].id});const gone=await until(B,m=>m.type==='mini'&&m.op==='gb',2500,b0);assert.ok(!gone.list.some(x=>x.id===gb1.list[0].id));
  /* 10. 크기: 긴 글을 많이 써도 한 번에 보내는 글은 8KB를 넘지 않는다 */
  const room=srv.minis.get('MINI1'),hA=room.homes.get(meA.hid);
  for(let i=0;i<60;i++)hA.guest.push({id:1000+i,from:'',n:'가'.repeat(14),t:'긴글'.repeat(50),at:Date.now(),r:'답'.repeat(60),rat:1});while(hA.guest.length>MINI.LIM.guest)hA.guest.shift();
  for(let i=0;i<20;i++){const fake='f'+String(i).padStart(11,'0');room.homes.set(fake,{hid:fake,name:'친구'.repeat(7),look:'',prof:{title:'제목'.repeat(15),intro:'',mood:'행복',bgm:'',skin:'sky',wall:'sky',floor:'wood',slots:{},base:0,today0:0},diary:[],photos:[null,null,null],guest:[],says:{},ilchon:{},asks:{},visitors:new Set(),today:0,v:1,seq:0,touched:0});hA.ilchon[fake]='친구친구친구친구';hA.says[fake]={t:'일촌평'.repeat(13),at:i};hA.asks[fake]={nick:'신청신청신청신청',at:i}}
  hA.diary=[0,1,2].map(i=>({d:'2006.05.30 (화)',w:'맑음',t:'일기'.repeat(150)}));
  for(const o of [MINI.meMsg(room,hA,new Map()),MINI.listMsg(room,new Map())])assert.ok(MINI.bytes(o)<=7600,'크기 '+o.op+' '+MINI.bytes(o));
  b0=mark(B);mini(B,{op:'get',hid:meA.hid});const huge=await until(B,m=>m.type==='mini'&&m.op==='home'&&m.v===hA.v,2500,b0);assert.ok(Buffer.byteLength(J(huge))<8192);
  await sleep(120);mini(B,{op:'gb',hid:meA.hid,page:1});const hg=await until(B,m=>m.type==='mini'&&m.op==='gb'&&m.total===MINI.LIM.guest,2500,b0);assert.ok(Buffer.byteLength(J(hg))<8192&&hg.list.length>=4);
  for(let i=0;i<20;i++)room.homes.delete('f'+String(i).padStart(11,'0'));
  /* 11. 다시 접속해도(같은 열쇠) 내 홈과 방명록은 그대로, 나가면 목록에 꺼짐으로 보인다 */
  b0=mark(B);A.ws.close();const off=await until(B,m=>m.type==='mini'&&m.op==='list'&&m.list.some(r=>r.hid===meA.hid&&!r.on),2500,b0);assert.ok(off);
  const A2=await peer('MINI1','민수');let a2=mark(A2);mini(A2,{op:'pub',uid:uA,prof:prof('♡ 민수 방 ♡'),diary:[]});const back=await until(A2,m=>m.type==='mini'&&m.op==='me',2500,a2);
  assert.equal(back.hid,meA.hid);assert.ok(back.gbn>=4);assert.equal(back.ilchon.find(x=>x.hid===meB.hid).nick,'단짝');
  /* 일촌 끊기 */
  await W();b0=mark(B);mini(A2,{op:'cut',hid:meB.hid});const cut=await until(B,m=>m.type==='mini'&&m.op==='me'&&!m.ilchon.some(x=>x.hid===meA.hid),2500,b0);assert.ok(cut);
  /* 12. 방이 비면 6시간 뒤에 지울 표시 */
  for(const p of [A2,B,D])p.ws.close();await sleep(300);assert.ok(srv.minis.get('MINI1').expires>Date.now()+5*3600*1000,'빈 방은 6시간 뒤에 지운다');
  /* 13. 기존 채팅, 아지트, 버디버디는 그대로 */
  c0=mark(C);C.ws.send(J({type:'chat',text:'동네 채팅'}));await until(C,m=>m.type==='chat'&&m.text==='동네 채팅',2500,c0);
  C.ws.send(J({type:'club',op:'enter'}));await until(C,m=>m.type==='club'&&m.op==='hello',2500,c0);
 }finally{for(const p of peers)try{p.ws.close()}catch(_){}server.close()}

 /* 14. 미니홈피 화면: 가짜 네트워크로 같은 방 친구 목록, 친구 홈, 일촌 신청과 수락, 방명록, 사진, 알림을 확인한다 */
 const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
 class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.dataset={};this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,f)=>{const s=f===undefined?!this.classList.contains(c):f;s?this.classList.add(c):this.classList.remove(c);return s}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...ns){for(const n of ns){n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...ns){this.children.unshift(...ns)}insertBefore(n,b){const i=this.children.indexOf(b);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...ns){this.children=[];this._text='';this.append(...ns)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}getAttribute(k){return this.attributes[k]}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(){}emit(k,e={}){for(const fn of [...this.listeners[k]||[]])fn({target:this,preventDefault(){},stopPropagation(){},...e})}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}getBoundingClientRect(){return{left:0,top:0,width:480,height:300}}}
 const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);const a25Log=new Node('div');doc.getElementById=id=>id==='a25Log'?a25Log:null;
 const subs=new Set(),out=[];let ready=true;
 const A25NET={subscribe(fn){subs.add(fn);return()=>subs.delete(fn)},send(o){out.push(JSON.parse(J(o)))},get state(){return{ready,id:'me1',room:'MINIUI'}},get peers(){return [{id:'p2',name:'영희',scene:'pcroom'},{id:'p3',name:'민수',scene:'street'}]}};
 const emit=m=>{for(const f of [...subs])f(m)};
 const w={document:doc,Date,Math,Number,Array,Object,String,JSON,Set,Map,Promise,console,localStorage:{getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v))},matchMedia:()=>({matches:false}),setTimeout:(f,ms)=>setTimeout(f,Math.min(ms||0,5)),clearTimeout,setInterval:()=>0,clearInterval(){},A25NET};w.window=w;
 for(const f of ['xp-shell','xp-messenger','pc-games','xp-minihome','pc-mail','xp-desktop'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
 const all=(n=root)=>[n,...n.children.flatMap(c=>all(c))],find=(f,n=root)=>all(n).find(f),cls=c=>all().filter(n=>n.classList.contains(c));
 const btn=(t,n=root)=>{const b=all(n).filter(x=>x.tagName==='BUTTON'&&x.textContent.trim()===t).at(-1);assert.ok(b,'버튼 '+t);return b};
 const sent=op=>out.filter(o=>o.type==='mini'&&o.op===op);
 const mh=()=>cls('mh-root')[0];
 /* 방에 들어가기 전에 온 알림은 함께 걷기 채팅 기록에 남는다 */
 emit({type:'mini',op:'note',k:'gbrep',hid:'bbbbbbbbbbbb',n:'영희',t:'고마워 ㅋㅋ'});assert.ok(a25Log.textContent.includes('[미니홈피]')&&a25Log.textContent.includes('영희님이 내 방명록 글에 답글'),'PC를 켜기 전 알림');
 const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});const M=api.modules.mini;await sleep(40);
 const pub=sent('pub')[0];assert.ok(pub,'PC를 켜면 내 미니홈피를 올린다');assert.ok(/^[a-z0-9]{20}$/.test(pub.uid));assert.equal(memory.get('2006_mini_uid_v1'),pub.uid,'열쇠는 따로 저장');
 assert.equal(pub.prof.base,2009);assert.equal(pub.prof.today0,3);assert.ok(Array.isArray(pub.diary));
 const ME='aaaaaaaaaaaa',YH='bbbbbbbbbbbb';
 emit({type:'mini',op:'me',hid:ME,n:'철수',today:3,total:2009,real:0,v:1,gbn:0,ph:['','',''],asks:[],ilchon:[],says:[]});
 emit({type:'mini',op:'list',list:[{hid:ME,n:'철수',title:'',mood:'행복',today:3,total:2009,on:true,pc:true,id:'me1',v:1,np:0},{hid:YH,n:'영희',title:'<img src=x onerror=alert(1)> 영희 방',mood:'신남',today:7,total:2013,on:true,pc:true,id:'p2',v:3,np:1}]});
 M.open();assert.ok(mh().textContent.includes('우리 방 친구 미니홈피'),'같은 방 친구 칸');
 {const left=cls('mh-left-live')[0];assert.ok(left&&left.textContent.includes('같은 방 친구 1명')&&left.textContent.includes('● 영희'),'왼쪽 목록: 들어오자마자 보이는 같은 방 친구')}
 const row=cls('mh-live-row')[0];assert.ok(row&&row.textContent.includes('영희')&&row.textContent.includes('PC방에서 접속 중')&&row.textContent.includes('TODAY 7'),'친구 줄: '+(row&&row.textContent));
 assert.ok(!cls('mh-live-row').some(r=>r.textContent.includes('철수')),'나는 목록에 없다');
 assert.ok(row.textContent.includes('<img src=x onerror=alert(1)>')&&!all(mh()).some(n=>n.tagName==='IMG'),'제목은 글자 그대로');
 const wave=find(n=>n.tagName==='SELECT'&&n.classList.contains('mh-wave'));assert.ok(all(wave).some(n=>n.tagName==='OPTION'&&n.value==='r:'+YH),'파도타기에 같은 방 친구');
 /* 친구 홈 열기: 정보 요청과 방문 표시, 처음 방문 도토리 */
 out.length=0;const dot0=M.state().dotori;row.click();await sleep(40);
 assert.ok(sent('get').some(o=>o.hid===YH)&&sent('visit').some(o=>o.hid===YH),'구경 요청 '+J(out));assert.equal(M.state().dotori,dot0+1,'첫 방문 도토리');
 assert.ok(mh().textContent.includes('여는 중'),'불러오는 중 화면');
 const home={type:'mini',op:'home',hid:YH,n:'영희',look:'girl_main_pink',on:true,pc:true,id:'p2',prof:{title:'영희의 반짝 방',intro:'안녕 ^^',mood:'신남',bgm:'별빛소녀 - 반짝반짝 첫사랑',skin:'pink',wall:'night',floor:'tile',slots:{F2:'desk'},base:2010,today0:4},today:8,total:2014,v:4,gbn:1,photos:[{i:0,cap:'PC방 17번 자리',sig:'s1'},null,null],ilchon:[{hid:ME,n:'철수',nick:'친구',on:true}],says:[],diary:[{d:'2006.05.30 (화)',w:'비',t:'우산 놓고 왔다'}],rel:{nick:'',asked:false,askedMe:false,me:false}};
 emit(home);let t=mh().textContent;
 assert.ok(t.includes('영희의 반짝 방')&&t.includes('같은 방 친구 · 실시간')&&t.includes('TODAY 8')&&t.includes('PC방에서 접속 중')&&t.includes('별빛소녀 - 반짝반짝 첫사랑'),'친구 홈 화면');
 assert.ok(mh().classList.contains('mh-skin-pink'),'친구 스킨');assert.ok(t.includes('일촌이 아니에요'));
 /* 일촌 신청 */
 out.length=0;btn('일촌 신청').click();const dlgInput=find(n=>n.tagName==='INPUT'&&n.attributes['aria-label']==='일촌명');dlgInput.value='단짝';btn('신청').click();await sleep(40);
 assert.equal(J(sent('ask')[0]),J({type:'mini',op:'ask',hid:YH,nick:'단짝'}));
 emit({type:'mini',op:'askok',hid:YH,nick:'단짝'});assert.ok(api.modules.shell.toasts().some(x=>x.includes('일촌 신청을 보냈어요')));
 emit({...home,v:5,rel:{nick:'',asked:true,askedMe:false,me:false}});assert.ok(mh().textContent.includes('일촌 신청 중'));
 /* 다이어리, 사진첩 */
 btn('다이어리').click();assert.ok(mh().textContent.includes('우산 놓고 왔다'));
 out.length=0;btn('사진첩').click();await sleep(30);assert.ok(sent('ph').some(o=>o.hid===YH&&o.i===0),'사진 받기');
 emit({type:'mini',op:'ph',hid:YH,i:0,data:'data:image/jpeg;base64,AAAA',cap:'PC방 17번 자리',sig:'s1'});const img=find(n=>n.tagName==='IMG',mh());assert.ok(img&&img.src==='data:image/jpeg;base64,AAAA','사진이 보인다');
 emit({type:'mini',op:'ph',hid:YH,i:0,data:'javascript:alert(1)',cap:'x',sig:'s1'});assert.ok(!find(n=>n.tagName==='IMG'&&String(n.src).startsWith('javascript')),'이상한 사진 주소는 쓰지 않는다');
 /* 방명록 쓰기 */
 out.length=0;btn('방명록').click();await sleep(30);assert.ok(sent('gb').some(o=>o.hid===YH));
 emit({type:'mini',op:'gb',hid:YH,page:1,pages:1,total:1,v:5,own:false,list:[{id:1,n:'민수',from:'cccccccccccc',t:'영희야 안녕',at:Date.now()-120000,r:'민수 안녕 ^^',rat:Date.now(),mine:false}]});
 t=mh().textContent;assert.ok(t.includes('영희야 안녕')&&t.includes('2분 전')&&t.includes('ㄴ 영희: 민수 안녕 ^^'),'친구 방명록 '+t.slice(0,200));
 const gbIn=find(n=>n.tagName==='INPUT'&&n.attributes['aria-label']==='방명록');gbIn.value='놀러 왔어 ㅋㅋ';out.length=0;gbIn.parentNode.emit('submit');await sleep(30);
 assert.equal(J(sent('gbw')[0]),J({type:'mini',op:'gbw',hid:YH,t:'놀러 왔어 ㅋㅋ'}));assert.equal(gbIn.value,'','쓴 칸은 비운다');
 /* 친구가 내 미니홈피에 와서 남긴 소식: 알림, 일촌 신청 받기, 수락 */
 btn('◀ 내 미니홈피로').click();
 emit({type:'mini',op:'me',hid:ME,n:'철수',today:4,total:2010,real:1,v:2,gbn:1,ph:['','',''],asks:[{hid:YH,n:'영희',nick:'단짝',at:Date.now()}],ilchon:[],says:[],note:{k:'ask',n:'영희',nick:'단짝',hid:YH}});
 assert.ok(api.modules.shell.toasts().some(x=>x.includes('영희님이 일촌을 신청했어요')),'일촌 신청 알림');
 out.length=0;btn('수락').click();await sleep(30);assert.equal(J(sent('ans')[0]),J({type:'mini',op:'ans',from:YH,ok:true,nick:'단짝'}),'바로 수락');
 for(const d of all().filter(n=>n.classList.contains('xp-modal')))d.remove();
 emit({type:'mini',op:'me',hid:ME,n:'철수',today:4,total:2010,real:1,v:3,gbn:1,ph:['','',''],asks:[],ilchon:[{hid:YH,n:'영희',nick:'단짝',on:true}],says:[{hid:YH,n:'영희',nick:'단짝',t:'철수 반가워!',at:Date.now()}],note:{k:'ilchon',n:'영희',nick:'단짝',hid:YH}});
 t=mh().textContent;assert.ok(t.includes('TODAY 4')&&t.includes('(단짝) 영희')&&t.includes('철수 반가워!'),'내 홈: 투데이와 일촌평 '+t.slice(0,160));
 assert.ok(all(find(n=>n.tagName==='SELECT'&&n.classList.contains('mh-wave'))).some(n=>n.tagName==='OPTGROUP'&&n.label==='같은 방 일촌'),'파도타기 같은 방 일촌');
 assert.ok(M.state().rewards['ilchon-r-'+YH],'일촌 도토리');
 /* 내 방명록: 친구 글에 답글, 지우기 */
 out.length=0;btn('방명록').click();await sleep(30);assert.ok(sent('gb').some(o=>o.hid===ME),'내 방명록 받기');
 emit({type:'mini',op:'gb',hid:ME,page:1,pages:1,total:1,v:3,own:true,list:[{id:7,n:'영희',from:YH,t:'철수야 PC방 ㄱ?',at:Date.now(),r:'',rat:0,mine:false}]});
 assert.ok(mh().textContent.includes('철수야 PC방 ㄱ?'));const rin=find(n=>n.tagName==='INPUT'&&n.attributes['aria-label']==='답글');rin.value='ㄱㄱ 지금 감';out.length=0;rin.parentNode.emit('submit');await sleep(30);
 assert.equal(J(sent('gbr')[0]),J({type:'mini',op:'gbr',id:7,r:'ㄱㄱ 지금 감',page:1}));
 out.length=0;btn('삭제').click();btn('지우기').click();await sleep(30);assert.equal(J(sent('gbd')[0]),J({type:'mini',op:'gbd',hid:ME,id:7,page:1}));
 /* 구경 알림 */
 emit({type:'mini',op:'me',hid:ME,n:'철수',today:5,total:2011,real:2,v:4,gbn:1,ph:['','',''],asks:[],ilchon:[{hid:YH,n:'영희',nick:'단짝',on:true}],says:[],note:{k:'visit',n:'민수',hid:'cccccccccccc'}});
 assert.ok(api.modules.shell.toasts().some(x=>x.includes('민수님이 내 미니홈피에 놀러 왔어요')));
 /* 내 미니홈피를 고치면 잠시 뒤 다시 올린다 (같은 내용이면 보내지 않는다) */
 out.length=0;btn('프로필').click();const ti=find(n=>n.tagName==='INPUT'&&n.attributes['aria-label']==='미니홈피 제목');ti.value='★ 철수 방 ★';find(n=>n.tagName==='FORM'&&n.classList.contains('mh-profile')).emit('submit');await sleep(60);
 assert.equal(sent('pub').length,1,'고친 뒤 한 번 올림');assert.equal(sent('pub')[0].prof.title,'★ 철수 방 ★');
 out.length=0;M.live.publish();await sleep(30);assert.equal(sent('pub').length,1,'직접 올리기');
 /* 방에서 나오면 실시간 칸은 안내로 바뀌고 친구 홈은 닫힌다 */
 ready=false;emit({type:'network_close'});btn('홈').click();assert.ok(mh().textContent.includes('함께 걷기 방에 들어가면'),'방 밖 안내');
 out.length=0;M.go('r:'+YH,'home');await sleep(20);assert.equal(sent('get').length,0,'방 밖에서는 보내지 않는다');assert.ok(!mh().textContent.includes('같은 방 친구 · 실시간'));
 api.destroy();
 /* 15. 시대, 글쓰기 규칙 */
 for(const f of ['server_minihome.js','src/xp-minihome.js']){const body=fs.readFileSync(path.join(__dirname,'..',f),'utf8');assert.ok(!body.includes(String.fromCharCode(0x2014)),'줄표 '+f);for(const b of ['카톡','스마트폰','인스타','페이스북','유튜브'])assert.ok(!body.includes(b),b+' '+f)}
 console.log('A97 minihome live sync tests passed (server and screen)');
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
