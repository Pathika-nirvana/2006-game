'use strict';
/* A96: 버디버디 같은 방 친구 대화(진짜 서버와 웹소켓 여러 개), 버디버디 화면 연결, 폰 터치 단추(먹기, 가방), 폰 화면 규칙을 검사한다. */
const assert=require('node:assert/strict'),path=require('path'),fs=require('fs'),vm=require('vm');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const srv=require(path.join(__dirname,'../server.js'));
 const server=srv.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const port=server.address().port,URL='ws://127.0.0.1:'+port+'/ws';const peers=[];
 async function peer(room,name){const ws=new WebSocket(URL),p={ws,name,msgs:[]};ws.addEventListener('message',e=>p.msgs.push(JSON.parse(e.data)));
  await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true})});ws.send(JSON.stringify({type:'join',room,name}));
  const w=await until(p,m=>m.type==='welcome');p.id=w.id;peers.push(p);return p}
 async function until(p,f,ms=2500,from=0){const t0=Date.now();for(;;){const m=p.msgs.slice(from).find(f);if(m)return m;if(Date.now()-t0>ms)throw new Error('시간 초과 '+p.name+' '+f.toString().slice(0,100));await sleep(15)}}
 const buddy=(p,o)=>p.ws.send(JSON.stringify({type:'buddy',...o}));const mark=p=>p.msgs.length;
 const quiet=async(p,at,f,ms=300)=>{await sleep(ms);assert.ok(!p.msgs.slice(at).some(f),'받으면 안 되는 메시지 '+p.name)};
 try{
  const A=await peer('BUDDY1','철수'),B=await peer('BUDDY1','영희'),C=await peer('BUDDY2','다른방');
  /* 1. PC를 켜면 접속자 목록에 오른다 (대화명이 없으면 방 이름) */
  buddy(A,{op:'on',nick:''});let who=await until(B,m=>m.type==='buddy'&&m.op==='who'&&m.list.length===1);assert.equal(who.list[0].nick,'철수');assert.equal(who.list[0].id,A.id);
  buddy(B,{op:'on',nick:'영희♡'});who=await until(A,m=>m.type==='buddy'&&m.op==='who'&&m.list.length===2);assert.ok(who.list.some(x=>x.nick==='영희♡'));
  await quiet(C,0,m=>m.type==='buddy');
  /* 2. 1:1 대화는 받는 사람에게만, 보낸 사람은 확인을 받는다 */
  let a0=mark(A),c0=mark(C);buddy(A,{op:'say',to:B.id,text:'  영희야 대화된다 \u0007 '});
  const got=await until(B,m=>m.type==='buddy'&&m.op==='say');assert.equal(got.text,'영희야 대화된다');assert.equal(got.from,A.id);assert.equal(got.nick,'철수');
  const sent=await until(A,m=>m.type==='buddy'&&m.op==='sent',2500,a0);assert.equal(sent.to,B.id);assert.equal(sent.toPc,true);await quiet(C,c0,m=>m.type==='buddy');
  /* 3. 너무 빨리 보내면 거절, 다른 방 사람에게는 못 보냄, 긴 글은 자름 */
  a0=mark(A);buddy(A,{op:'say',to:B.id,text:'또'});await until(A,m=>m.type==='buddy'&&m.op==='error',2500,a0);
  await sleep(400);a0=mark(A);buddy(A,{op:'say',to:C.id,text:'안녕'});const er=await until(A,m=>m.type==='buddy'&&m.op==='error',2500,a0);assert.match(er.message,/방에 없어요/);
  await sleep(400);let b0=mark(B);buddy(A,{op:'say',to:B.id,text:'가'.repeat(300)});const long=await until(B,m=>m.type==='buddy'&&m.op==='say',2500,b0);assert.equal(long.text.length,100);
  /* 4. 흔들기 */
  b0=mark(B);buddy(A,{op:'nudge',to:B.id});await until(B,m=>m.type==='buddy'&&m.op==='nudge',2500,b0);
  /* 5. PC를 끄면(꺼짐) 목록에서 빠지고, 꺼진 친구에게 보내면 toPc=false */
  a0=mark(A);buddy(B,{op:'off'});await until(A,m=>m.type==='buddy'&&m.op==='who'&&m.list.length===1,2500,a0);
  await sleep(400);a0=mark(A);buddy(A,{op:'say',to:B.id,text:'PC 껐어?'});const s2=await until(A,m=>m.type==='buddy'&&m.op==='sent',2500,a0);assert.equal(s2.toPc,false);
  /* 6. 방을 나가면 목록이 다시 간다 */
  buddy(B,{op:'on'});await until(A,m=>m.type==='buddy'&&m.op==='who'&&m.list.length===2,2500,mark(A)-0);a0=mark(A);B.ws.close();await until(A,m=>m.type==='buddy'&&m.op==='who'&&m.list.length===1,2500,a0);
  /* 7. 기존 채팅과 아지트는 그대로 */
  a0=mark(A);A.ws.send(JSON.stringify({type:'chat',text:'동네 채팅'}));await until(A,m=>m.type==='chat'&&m.text==='동네 채팅',2500,a0);
 }finally{for(const p of peers)try{p.ws.close()}catch(_){}server.close()}

 /* 8. 버디버디 화면: 가짜 네트워크로 같은 방 친구, 1:1 대화, 전체 대화, 흔들기, 꺼져 있을 때 받은 말 */
 const fakeCtx=()=>new Proxy({},{get:(t,k)=>k==='createLinearGradient'?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
 class Node{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.style={setProperty(){}};this.attributes={};this.className='';this._text='';this.value='';this.hidden=false;this.dataset={};this.classList={contains:c=>this.className.split(/\s+/).includes(c),add:(...cs)=>{for(const c of cs)if(!this.classList.contains(c))this.className+=' '+c},remove:(...cs)=>{this.className=this.className.split(/\s+/).filter(x=>!cs.includes(x)).join(' ')},toggle:(c,f)=>{const s=f===undefined?!this.classList.contains(c):f;s?this.classList.add(c):this.classList.remove(c);return s}}}set textContent(s){this._text=String(s);this.children=[]}get textContent(){return this._text+this.children.map(x=>x.textContent).join('')}append(...ns){for(const n of ns){n.parentNode=this;this.children.push(n)}}appendChild(n){this.append(n);return n}prepend(...ns){this.children.unshift(...ns)}insertBefore(n,b){const i=this.children.indexOf(b);this.children.splice(i<0?this.children.length:i,0,n)}replaceChildren(...ns){this.children=[];this._text='';this.append(...ns)}get firstChild(){return this.children[0]}get lastElementChild(){return this.children.at(-1)}setAttribute(k,v){this.attributes[k]=v}addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}removeEventListener(){}emit(k,e={}){for(const fn of [...this.listeners[k]||[]])fn({target:this,preventDefault(){},stopPropagation(){},...e})}click(){this.emit('click')}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this)}getContext(){return fakeCtx()}focus(){}getBoundingClientRect(){return{left:0,top:0,width:480,height:300}}}
 const memory=new Map(),doc=new Node('document'),root=new Node('main');doc.createElement=t=>new Node(t);const a25Log=new Node('div');a25Log.id='a25Log';const nameEl=new Node('input');nameEl.value='철수';doc.getElementById=id=>id==='a25Log'?a25Log:id==='a25Name'?nameEl:null;
 const subs=new Set(),sentOut=[];let ready=true;
 const A25NET={subscribe(fn){subs.add(fn);return()=>subs.delete(fn)},send(o){sentOut.push(o)},get state(){return{ready,id:'me1',room:'BUDDY1'}},get peers(){return [{id:'p2',name:'영희',scene:'pcroom'},{id:'p3',name:'민수',scene:'street'}]}};
 const emit=m=>{for(const f of [...subs])f(m)};
 const w={document:doc,Date,Math,Number,Array,Object,String,JSON,Set,Map,Promise,console,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},matchMedia:()=>({matches:false}),setTimeout:(f,ms)=>setTimeout(f,Math.min(ms||0,10)),clearTimeout,setInterval:()=>0,clearInterval(){},A25NET};w.window=w;
 for(const f of ['xp-shell','xp-messenger','pc-games','xp-minihome','pc-mail','xp-desktop'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/'+f+'.js'),'utf8'),w);
 /* PC를 켜기 전에 받은 말은 동네 채팅 기록에 남고, 나중에 대화창으로 들어간다 */
 emit({type:'buddy',op:'say',from:'p2',name:'영희',nick:'영희♡',text:'PC 켰어?',at:1});assert.ok(a25Log.textContent.includes('[버디버디] 영희♡')&&a25Log.textContent.includes('PC 켰어?'));
 const api=w.XPDesktop.mount(root,{boot:false,seat:12,remaining:3600,onLogout(){}});const msn=api.modules.msn;
 assert.ok(sentOut.some(o=>o.type==='buddy'&&o.op==='on'),'PC를 켜면 접속 알림');
 emit({type:'buddy',op:'who',list:[{id:'p2',name:'영희',nick:'영희♡'},{id:'me1',name:'철수',nick:'철수'}]});
 let st=msn.state().buddies.filter(b=>b.real);const y=st.find(b=>b.id==='net-p2'),m3=st.find(b=>b.id==='net-p3'),room=st.find(b=>b.id==='net-room');
 assert.ok(y&&y.pc&&y.unread===1&&y.log===1,'PC를 켠 영희, 미리 받은 말 1개');assert.ok(m3&&!m3.pc&&m3.online,'동네에 있는 민수');assert.ok(room&&room.online,'전체 대화');assert.ok(!st.some(b=>b.id==='net-me1'),'나는 목록에 없음');
 msn.open();await sleep(30);const J=x=>JSON.stringify(x);const find=(f,n=root)=>{if(f(n))return n;for(const c of n.children){const r=find(f,c);if(r)return r}return null};
 assert.ok(find(n=>n.classList.contains('xp-msn-group')&&n.textContent.includes('같은 방 친구')),'같은 방 친구 묶음');
 msn.openChat('net-p2');msn.send('net-p2','안녕 영희');assert.equal(J(sentOut.at(-1)),J({type:'buddy',op:'say',to:'p2',text:'안녕 영희'}));
 emit({type:'buddy',op:'sent',to:'p2',text:'안녕 영희',toPc:true,at:2});assert.ok(find(n=>n.classList.contains('xp-chat-log')).textContent.includes('철수 : 안녕 영희'),'내 말은 방 이름으로');
 msn.nudge('net-p2');assert.equal(sentOut.at(-1).op,'nudge');
 emit({type:'buddy',op:'nudge',from:'p2',name:'영희',nick:'영희♡',at:3});assert.ok(find(n=>n.classList.contains('xp-chat-log')).textContent.includes('영희♡ 님이 창을 흔들었습니다'));
 msn.send('net-room','다들 안녕');assert.equal(J(sentOut.at(-1)),J({type:'chat',text:'다들 안녕'}));
 emit({type:'chat',id:'p3',name:'민수',text:'ㅎㅇ',scene:'street'});assert.equal(msn.state().buddies.find(b=>b.id==='net-room').log,1);
 emit({type:'buddy',op:'error',message:'조금 천천히 보내 주세요.',to:'p2'});
 /* 방을 나가면 */
 ready=false;emit({type:'network_close'});st=msn.state().buddies.filter(b=>b.real);assert.ok(!st.find(b=>b.id==='net-p2').online&&!st.find(b=>b.id==='net-room').online);
 msn.send('net-p2','여보세요');assert.notEqual(J(sentOut.at(-1)),J({type:'buddy',op:'say',to:'p2',text:'여보세요'}));
 api.destroy();

 /* 9. 폰 화면: 먹기, 가방 터치 단추와 PC 창 규칙 */
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(/<button data-key="KeyF" class="t-eat" hidden>먹기<\/button><button data-key="KeyI" class="t-bag">가방<\/button>/.test(html),'먹기, 가방 단추');
 assert.ok(html.includes("eat.hidden=!on")&&html.includes('window.SHOPS&&window.SHOPS.held'),'음식을 들 때만 먹기 단추');
 assert.ok(html.includes('src/xp-messenger.js?v=A96')&&html.includes('pc-fun.css?v=A96'),'캐시 번호');
 const css=fs.readFileSync(path.join(__dirname,'../assets/pc-desktop/pc-fun.css'),'utf8');assert.ok(/@media \(max-width:760px\),\(max-height:520px\)\{[\s\S]*\.xp79-window-content\{overflow:auto!important/.test(css),'폰에서 창 안 스크롤');
 {const sv=fs.readFileSync(path.join(__dirname,'../server.js'),'utf8');const a=sv.indexOf('/* A96'),b=sv.indexOf('function buddyMessage');assert.ok(a>0&&!sv.slice(a,b+2000).includes(String.fromCharCode(0x2014)),'줄표 server')}
 for(const f of ['src/xp-messenger.js','assets/pc-desktop/pc-fun.css'])assert.ok(!fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes(String.fromCharCode(0x2014)),'줄표 '+f);
 console.log('A96 buddy and mobile tests passed');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
