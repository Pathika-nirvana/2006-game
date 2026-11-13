/* Wet alleys behind the stationery shop. Rear walk limits follow each illustration. */
(function(w){'use strict';
// Rear edge: [horizontal thousandths of art width, foot Y in the 270px scene].
const rooms={
 d1:['빗물 고인 첫 골목',630,263,55,944,[[55,229],[115,227],[320,228],[440,224],[475,219],[495,199],[535,199],[557,225],[600,228],[682,224],[854,221],[944,224]]],
 d1_1:['장독대 뒤 막다른 뜰',810,263,111,900,[[111,260],[116,230],[122,198],[139,171],[148,162],[172,162],[185,182],[190,199],[201,218],[219,230],[277,232],[313,235],[460,234],[522,225],[645,226],[720,231],[775,241],[850,242],[900,255]]],
 d2:['함석 지붕 아래 골목',630,267,116,927,[[116,262],[176,262],[207,263],[318,259],[400,245],[494,239],[536,236],[563,245],[615,247],[653,257],[761,258],[869,261],[927,259]]],
 d3:['처마 밑 두 갈래',630,263,15,958,[[15,256],[95,252],[173,247],[207,219],[225,190],[246,200],[271,232],[333,239],[390,245],[565,237],[685,227],[743,228],[810,197],[835,172],[857,154],[878,141],[895,140],[909,153],[926,177],[945,218],[958,251]]],
 d3_1:['희미한 전등 아래',810,263,14,986,[[14,243],[82,240],[139,229],[238,229],[276,237],[443,238],[488,228],[618,228],[671,235],[767,229],[922,229],[986,235]]],
 d3_2:['닫힌 뒷마당',810,263,214,813,[[214,262],[250,254],[275,238],[325,227],[364,222],[435,222],[495,226],[607,224],[692,230],[737,234],[776,252],[813,262]]],
 d4:['젖은 계단 너머',810,266,227,896,[[227,263],[252,250],[279,247],[307,240],[330,239],[409,224],[454,203],[497,192],[534,200],[578,224],[647,242],[735,246],[820,248],[896,264]]],
 d5:['빈 가게 옆 굽잇길',810,264,51,949,[[51,252],[128,242],[209,231],[333,240],[484,241],[586,234],[660,228],[712,210],[752,196],[781,212],[824,235],[901,247],[949,252]]],
 d6:['낙서 담벼락',810,263,14,986,[[14,234],[97,232],[162,234],[287,235],[330,228],[536,230],[615,233],[759,238],[860,231],[986,232]]],
 d7:['녹슨 대문 골목',810,263,14,986,[[14,238],[154,240],[220,238],[304,229],[386,238],[509,231],[595,234],[632,222],[676,211],[709,224],[763,235],[936,235],[986,240]]],
 d8:['무너진 담 너머',810,263,14,986,[[14,244],[125,244],[222,240],[316,238],[425,244],[526,238],[607,235],[656,229],[677,220],[697,208],[726,205],[747,214],[775,232],[879,241],[986,247]]],
 d10:['폐교 앞마당',810,264,14,986,[[14,247],[134,250],[235,243],[338,241],[480,236],[595,233],[666,232],[730,230],[867,230],[919,238],[986,245]]],
 d11:['폐교 1층 현관',810,263,70,979,[[70,251],[116,237],[201,230],[253,221],[319,221],[389,236],[481,239],[565,234],[706,231],[795,224],[834,232],[924,235],[979,245]]],
 d11_1:['먼지 쌓인 1층 교실',810,263,92,912,[[92,251],[156,239],[266,229],[340,233],[463,236],[569,232],[708,230],[801,240],[871,244],[912,256]]],
 d12:['폐교 2층 복도',810,246,167,981,[[167,244],[190,228],[261,218],[326,220],[406,222],[467,225],[530,222],[644,220],[737,224],[814,226],[891,229],[981,232]]],
 d12_1:['2학년 1반 교실',810,263,90,968,[[90,244],[161,238],[273,234],[363,235],[483,241],[602,238],[724,233],[816,241],[895,240],[968,252]]]
};
const id=key=>'alley_'+key;
const key=scene=>typeof scene==='string'&&scene.startsWith('alley_')?scene.slice(6):'';
const room=scene=>Object.hasOwn(rooms,key(scene))?rooms[key(scene)]:null;
const width=scene=>room(scene)?.[1]||0;
const title=scene=>room(scene)?.[0]||'';
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const at=(name,u)=>rooms[name][1]*u/1000;
function limits(scene){
 const [,size,bottom,left,right]=room(scene);
 return {bottom,left:size*left/1000,right:size*right/1000};
}
function top(scene,x){
 const [,size,,,,edge]=room(scene),u=x/size*1000;
 if(u<=edge[0][0])return edge[0][1];
 for(let i=1;i<edge.length;i++){
  const [rx,ry]=edge[i],[lx,ly]=edge[i-1];
  if(u<=rx)return ly+(ry-ly)*(u-lx)/(rx-lx);
 }
 return edge.at(-1)[1];
}
function walkable(scene,x,y){
 const {left,right,bottom}=limits(scene);
 return x>=left&&x<=right&&y>=top(scene,x)&&y<=bottom;
}
const gates=Object.fromEntries(Object.keys(rooms).map(name=>[name,[]]));
function link(a,b,au,bu,{edge=false,ay=249,by=249,ar=19,br=19}={}){
 for(const [from,to,u,other,y,otherY,dir,r] of [[a,b,au,bu,ay,by,1,ar],[b,a,bu,au,by,ay,-1,br]]){
  const x=at(from,u),dest=at(to,other),destScene=id(to);
  const spawn=edge?dest+dir*10:dest;
  gates[from].push({type:'routeGate',to:destScene,x,y,r,spawn,
   spawnY:Math.max(otherY,top(destScene,spawn)),title:rooms[to][0],edge:edge?dir:0});
 }
}
function seam(a,b,ay=253,by=253){link(a,b,rooms[a][4],rooms[b][3],{edge:true,ay,by})}
// Front-ground seams remain automatic. Passages blocked at the side use an explicit turn.
seam('d1','d2',251,265);seam('d2','d3',264,258);
link('d1','d1_1',516,185,{ay:207,by:248});
link('d3','d3_1',229,46,{ay:211,by:248});
link('d3_1','d3_2',960,275,{ay:249,by:250});
link('d3','d4',887,306,{ay:147,by:247,ar:13});
link('d4','d5',861,86,{ay:259,by:254});
link('d5','d6',921,48,{ay:256,by:250});
for(const [a,b] of [['d6','d7'],['d7','d8']])seam(a,b);
link('d8','d10',968,59,{ay:252,by:254,ar:22});
link('d10','d11',799,121,{ay:235,by:244});
link('d11','d11_1',784,122,{ay:232,by:249});
link('d11','d12',296,185,{ay:229,by:241});
link('d12','d12_1',292,114,{ay:227,by:248});
gates.d1.push({type:'routeGate',x:at('d1',92),y:249,r:24,to:'hidden_alley',spawn:661,spawnY:252,title:'주택 사이 좁은 뒷골목으로'});
const images=new Map();
function load(scene){
 const name=key(scene);if(!room(scene)||images.has(name))return;
 const im=new w.Image();images.set(name,im);im.src='assets/maps/alley-dungeon/'+name+'.webp'+(name==='d2'?'?v=A103':'');
}
function enter(p,y){
 const {left,right,bottom}=limits(p.scene);
 p.x=clamp(p.x,left,right);
 p.alleyDepth=clamp(y??248,top(p.scene,p.x),bottom);
 p.alleyLift=0;p.alleySpeed=0;p.y=p.alleyDepth;p.onGround=true;
 load(p.scene);for(const gate of gates[key(p.scene)])load(gate.to);
}
function nearest(p){
 if(!p.onGround)return null;
 let best=null,distance=Infinity;
 for(const gate of gates[key(p.scene)]){
  if(gate.edge)continue;
  const d=Math.hypot(p.x-gate.x,1.55*(p.alleyDepth-gate.y));
  if(d<gate.r&&d<distance){best=gate;distance=d}
 }
 return best;
}
function walk(p,h,v,dt){
 const n=Math.hypot(h,v)||1,scene=p.scene,{left,right,bottom}=limits(scene);
 const distance=Math.max(Math.abs(h)*94,Math.abs(v)*68)*dt;
 const steps=Math.max(1,Math.ceil(distance/2));
 for(let i=0;i<steps;i++){
  const x=clamp(p.x+h/n*94*dt/steps,left,right);
  if(walkable(scene,x,p.alleyDepth))p.x=x;
  p.alleyDepth=clamp(p.alleyDepth+v/n*68*dt/steps,top(scene,p.x),bottom);
 }
 if(h)p.dir=h>0?1:0;
 p.walking=h||v?p.walking+dt*11:0;
 if(p.alleyLift||p.alleySpeed){
  p.alleySpeed-=510*dt;p.alleyLift=Math.max(0,p.alleyLift+p.alleySpeed*dt);
  if(!p.alleyLift){p.alleySpeed=0;p.onGround=true;p.pose='stand'}
 }
 p.y=p.alleyDepth-p.alleyLift;
 if(h&&p.onGround){
  return gates[key(scene)].find(g=>g.edge===h&&Math.abs(p.alleyDepth-g.y)<=13&&(h<0?p.x<=left:p.x>=right));
 }
}
function jump(p){
 if(!p.onGround||p.pose==='eat')return;
 p.onGround=false;p.pose='jump';p.alleyLift=.01;p.alleySpeed=160;
}
const scale=(y,scene)=>{
 const bottom=room(scene)?.[2]??263;
 const base=1.14+(1.368-1.14)*clamp((y-(bottom-57))/57,0,1);
 // The right stair in D3 continues into the distance beyond the normal alley floor.
 if(scene!=='alley_d3')return base;
 return base-.32*clamp((206-y)/59,0,1);
};
function draw(c,scene,cam){
 c.fillStyle='#373631';c.fillRect(0,0,480,270);
 const im=images.get(key(scene));
 if(im?.complete&&im.naturalWidth)c.drawImage(im,-Math.round(cam),0,width(scene),270);
}
function render(c,p,t){
 const peers=(w.A25NET?.drawPeers||[]).filter(a=>a.scene===p.scene);
 const actors=[...peers.map(a=>({...a,depth:clamp(a.depth??a.y,top(p.scene,a.x),limits(p.scene).bottom)})),{...p,self:true,depth:p.alleyDepth}];
 actors.sort((a,b)=>a.depth-b.depth);
 for(const a of actors){
  const s=scale(a.depth,p.scene);c.save();c.fillStyle='#1b1d1b50';c.beginPath();c.ellipse(a.x,a.depth,9*s,1.8*s,0,0,Math.PI*2);c.fill();
  c.translate(Math.round(a.x),Math.round(a.y));c.scale(s,s);
  if(a.self){w.WORLD.drawKid(c,0,0,a.dir,a.walking,a.shirt,false,false,a.pose);w.SHOPS.renderHeld(c,0,0,a.dir,a.pose,t)}
  else w.CHARART?.drawRemote(c,a.look,0,0,a.dir,a.pose,'dungeon-'+a.id,a.held);
  c.restore();
  if(!a.self){
   c.save();c.textAlign='center';c.font='bold 9px sans-serif';c.fillStyle='#fff1d9';
   c.fillText(a.name||'친구',a.x,a.y-51*s-8);
   if(a.bubble&&performance.now()<a.bubbleUntil)c.fillText(a.bubble.slice(0,24),a.x,a.y-51*s-22);
   c.restore();
  }
 }
}
const signal=scene=>/^alley_d(?:10|11(?:_1)?|12(?:_1)?)$/.test(scene)?'dead':/^alley_d[4-8]$/.test(scene)?'none':'normal';
w.AlleyDungeon={ENTRY:id('d1'),width,title,limits,walkable,enter,nearest,walk,jump,scale,draw,render,signal};
})(window);
