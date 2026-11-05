/**
 * A27 shareable web app based on the A26 multiplayer test server: HTTP static files + small RFC6455 text WebSocket subset.
 * Zero npm packages. 12-player hobby test service, not a hardened public social platform.
 * Start: node server.js
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const PLAY=require('./server_playground.js');
const { TextDecoder } = require('node:util');
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_ROOM = 12;
const MAX_CONNECTIONS = 80; // Simple bound to avoid unlimited idle sockets on hobby hosting
const MAX_FRAME = 8192;
const G = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const sessions = new Set();
const rooms = new Map();
const physicsRooms=new Map();
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8','.ico':'image/x-icon'};
const publicPaths = new Set(['/', '/index.html', '/src/', '/assets/']);
const app = http.createServer((req,res)=>{
  if(req.method!=='GET'){res.writeHead(405);res.end('GET only');return}
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
  if(pathname==='/health'){
    res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
    res.end(JSON.stringify({ok:true,rooms:rooms.size,players:sessions.size}));return;
  }
  if(!['/','/index.html'].includes(pathname)&&!pathname.startsWith('/src/')&&!pathname.startsWith('/assets/')){res.writeHead(404);res.end();return}
  const file=pathname==='/'?'/index.html':pathname;
  const full=path.resolve(ROOT,'.'+file);
  if(!full.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  fs.stat(full,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);res.end();return}
    res.writeHead(200,{'content-type':types[path.extname(full)]||'application/octet-stream','x-content-type-options':'nosniff','cache-control':'no-cache'});
    fs.createReadStream(full).pipe(res);
  });
});
function frame(payload,opcode=1){
  const body=Buffer.isBuffer(payload)?payload:Buffer.from(payload);
  if(body.length>MAX_FRAME)return null;
  let header;
  if(body.length<126)header=Buffer.from([0x80|opcode,body.length]);
  else header=Buffer.from([0x80|opcode,126,body.length>>8,body.length&255]);
  return Buffer.concat([header,body]);
}
function send(session,obj){if(!session.socket.writable)return;try{const data=frame(JSON.stringify(obj));if(data)session.socket.write(data)}catch{end(session)}}
function cast(room,msg,except=null){for(const session of rooms.get(room)||[])if(session!==except)send(session,msg)}
function publicState(s){return {id:s.id,name:s.name,scene:s.state.scene,x:s.state.x,y:s.state.y,pose:s.state.pose,dir:s.state.dir,look:s.state.look}}
function end(s){
  if(s.closed)return;s.closed=true;sessions.delete(s);
  if(s.room)PLAY.clearUser(physicsRooms.get(s.room),s.id);
  if(s.room){const group=rooms.get(s.room);group?.delete(s);if(group?.size===0){rooms.delete(s.room);physicsRooms.delete(s.room)}else cast(s.room,{type:'left',id:s.id})}
  try{s.socket.destroy()}catch{}
}
const code=/^[A-Z0-9]{4,8}$/;
const validScene=/^[a-z0-9_]{1,30}$/;
const poses=new Set(['stand','walk','jump','sit','bench','wave','eat','climb','swing']);
const looks=new Set(['boy_shaggy','boy_highlight','boy_sanggo','boy_sports','girl_pony','girl_bob','boy_taekwondo','girl_taekwondo']);
function cleanName(s){return String(s||'').normalize('NFC').replace(/[<>\x00-\x1f\x7f]/g,'').trim().slice(0,14)||'이름 없는 친구'}
function onMessage(s,obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))return;
 if(obj.type==='join'){
   if(s.room)return;
   const room=String(obj.room||'').toUpperCase();if(!code.test(room)){send(s,{type:'error',message:'방 코드는 4~8자리 영문 대문자·숫자야.'});return}
   const group=rooms.get(room)||new Set();if(group.size>=MAX_ROOM){send(s,{type:'error',message:'방 정원이 가득 찼어. (최대 12명)'});return}
   const name=cleanName(obj.name);
   // If identical display names collide, retain names: stable ids disambiguate players.
   s.room=room;s.name=name;rooms.set(room,group);
   if(!physicsRooms.has(room))physicsRooms.set(room,PLAY.createRoom());
   send(s,{type:'welcome',id:s.id,room,players:[...group].map(publicState)});
   group.add(s);send(s,{type:'playground_state',state:PLAY.snapshot(physicsRooms.get(room))});cast(room,{type:'joined',player:publicState(s)},s);
   return;
 }
 if(!s.room)return;
 if(obj.type==='playground'){
   const arena=physicsRooms.get(s.room);const people=new Map([...rooms.get(s.room)].map(p=>[p.id,p]));
   const result=PLAY.act(arena,s,obj,people);
   send(s,{type:'playground_result',action:String(obj.action||''),device:String(obj.device||''),...result});
   if(result.ok)cast(s.room,{type:'playground_state',state:PLAY.snapshot(arena)});
   return;
 }
 if(obj.type==='state'){
   const now=Date.now();if(now-s.lastState<65)return;s.lastState=now;
   if(!validScene.test(String(obj.scene||'')))return;
   const x=Number(obj.x),y=Number(obj.y);if(!Number.isFinite(x)||!Number.isFinite(y))return;
   const arena=physicsRooms.get(s.room);const occ=PLAY.occupancy(arena,s.id),flight=arena?.flights.get(s.id);
   if(obj.scene!=='street'&&(occ||flight))PLAY.clearUser(arena,s.id);
   if(!occ&&!flight){s.state={scene:obj.scene,x:Math.max(0,Math.min(20000,x)),y:Math.max(-100,Math.min(500,y)),pose:poses.has(obj.pose)?obj.pose:'stand',dir:obj.dir===0?0:1,look:looks.has(obj.look)?obj.look:'boy_shaggy'};}
   else{s.state.dir=obj.dir===0?0:1;s.state.look=looks.has(obj.look)?obj.look:'boy_shaggy'}
   cast(s.room,{type:'state',id:s.id,...s.state},s);return;
 }
 if(obj.type==='chat'){
   const now=Date.now();if(now-s.lastChat<950){send(s,{type:'error',message:'채팅은 잠깐 간격을 두고 보내 줘.'});return}
   const msg=String(obj.text||'').replace(/[\x00-\x08\x0b-\x1f\x7f]/g,'').trim().slice(0,80);
   if(!msg)return;s.lastChat=now;
   cast(s.room,{type:'chat',id:s.id,name:s.name,text:msg,scene:s.state.scene,at:now});return;
 }
}
function onData(s,chunk){
  if(s.closed)return;s.buffer=Buffer.concat([s.buffer,chunk]);
  if(s.buffer.length>32768){end(s);return}
  while(s.buffer.length>=2){
    const a=s.buffer[0],b=s.buffer[1],opcode=a&15;
    if((a&0x70)!==0 || !(a&0x80) || !(b&0x80)){end(s);return}
    let len=b&127,at=2;
    if(len===126){if(s.buffer.length<4)return;len=s.buffer.readUInt16BE(2);at=4}
    if(len===127){if(s.buffer.length<10)return;const high=s.buffer.readUInt32BE(2),low=s.buffer.readUInt32BE(6);if(high!==0||low>MAX_FRAME){end(s);return}len=low;at=10}
    if(len>MAX_FRAME){end(s);return}
    if(s.buffer.length<at+4+len)return;
    const mask=s.buffer.subarray(at,at+4);at+=4;
    const data=Buffer.from(s.buffer.subarray(at,at+len));s.buffer=s.buffer.subarray(at+len);
    for(let i=0;i<data.length;i++)data[i]^=mask[i%4];
    if(opcode===8){end(s);return}
    if(opcode===9){const pong=frame(data,10);if(pong)s.socket.write(pong);continue}
    if(opcode===10){s.lastPong=Date.now();continue}
    if(opcode!==1){end(s);return}
    try{const decoder=new TextDecoder('utf-8',{fatal:true});onMessage(s,JSON.parse(decoder.decode(data)))}catch{send(s,{type:'error',message:'잘못된 메시지 형식이야.'})}
  }
}
app.on('upgrade',(req,socket,head)=>{
  // Browser clients must connect from the same site serving this game.
  // Non-browser test clients may omit the Origin header.
  if(sessions.size>=MAX_CONNECTIONS){socket.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');return;}
  if(req.headers.origin){
    let originHost;
    try{originHost=new URL(String(req.headers.origin)).host;}catch{socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
    if(originHost!==req.headers.host){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
  }
  const target=new URL(req.url,'http://localhost');
  const key=req.headers['sec-websocket-key'];
  if(target.pathname!=='/ws'||req.headers.upgrade?.toLowerCase()!=='websocket'||req.headers['sec-websocket-version']!=='13'||typeof key!=='string'||!/^[-A-Za-z0-9+/]{22}==$/.test(key)){
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');return
  }
  const accept=crypto.createHash('sha1').update(key+G).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const s={socket,id:crypto.randomUUID().slice(0,12),name:'',room:null,buffer:Buffer.alloc(0),closed:false,lastPong:Date.now(),lastState:0,lastChat:0,state:{scene:'street',x:508,y:207,pose:'stand',dir:1,look:'boy_shaggy'}};
  sessions.add(s);socket.on('data',ch=>onData(s,ch));socket.on('close',()=>end(s));socket.on('error',()=>end(s));
  if(head.length)onData(s,head);
});
const heartbeat=setInterval(()=>{
 for(const s of sessions){if(Date.now()-s.lastPong>80000){end(s);continue}try{s.socket.write(frame(Buffer.from('ping'),9))}catch{end(s)}}
},25000);
heartbeat.unref();
let physicsNetTicks=0;
const playgroundClock=setInterval(()=>{physicsNetTicks++;
 for(const [room,arena] of physicsRooms){
  const players=new Map([...(rooms.get(room)||[])].map(p=>[p.id,p]));
  PLAY.tick(arena,players);
  if(physicsNetTicks%6===0)cast(room,{type:'playground_state',state:PLAY.snapshot(arena)});
 }
},1000/60);playgroundClock.unref();
if(require.main===module){app.listen(PORT,HOST,()=>console.log(`2006 A27: http://${HOST}:${PORT} — 최대 ${MAX_ROOM}명/방`))}
module.exports={app,rooms,sessions,physicsRooms};
