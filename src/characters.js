/* BEGIN src/15_characters.js */
/* ART A31 - smoother 8-step, source-textured Korean student motion atlases, 24 poses each.
   A30 uses A29 character identities and existing multiplayer look serialization.
   ART A28 - original replaceable transparent PNG sprites. Existing shop, world and network unchanged. */
(function(){
'use strict';
const sources={"npc_shopkeeper": "assets/characters/npc/npc_shopkeeper.png", "npc_snack": "assets/characters/npc/npc_snack.png", "npc_guard": "assets/characters/npc/npc_guard.png", "npc_neighbor": "assets/characters/npc/npc_neighbor.png", "npc_market": "assets/characters/npc/npc_market.png", "npc_grandma": "assets/characters/npc/npc_grandma.png", "npc_office": "assets/characters/npc/npc_office.png", "npc_maintenance": "assets/characters/npc/npc_maintenance.png", "npc_studentA": "assets/characters/npc/npc_studentA.png", "npc_studentB": "assets/characters/npc/npc_studentB.png", "npc_hakwondo": "assets/characters/npc/npc_hakwondo.png", "npc_delivery": "assets/characters/npc/npc_delivery.png", "npc_worker": "assets/characters/npc/npc_worker.png", "npc_neighbor2": "assets/characters/npc/npc_neighbor2.png", "boy_main_blue": "assets/characters/boy_main_blue.png", "boy_main_green": "assets/characters/boy_main_green.png", "boy_main_dobok": "assets/characters/boy_main_dobok.png", "girl_main_pink": "assets/characters/girl_main_pink.png", "girl_main_yellow": "assets/characters/girl_main_yellow.png", "girl_main_dobok": "assets/characters/girl_main_dobok.png"};

/* A29: game-ready sprites extracted from the approved 12-student original art board. */
const A29_HIGH_RES_SOURCES={};
Object.assign(sources,A29_HIGH_RES_SOURCES);
const specs=[{"id":"boy_main_blue","name":"남학생 · 파란 운동점퍼","gender":"boy","hair":"highlight","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":false},{"id":"boy_main_green","name":"남학생 · 초록 후드","gender":"boy","hair":"highlight","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":false},{"id":"boy_main_dobok","name":"남학생 · 태권도 품띠","gender":"boy","hair":"highlight","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":true},{"id":"girl_main_pink","name":"여학생 · 분홍 후드","gender":"girl","hair":"bob","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":false},{"id":"girl_main_yellow","name":"여학생 · 노란 운동점퍼","gender":"girl","hair":"bob","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":false},{"id":"girl_main_dobok","name":"여학생 · 태권도 품띠","gender":"girl","hair":"bob","top":"#456ba7","bottom":"#9f876b","bag":"#40516b","dobok":true},{"id":"npc_shopkeeper","name":"문방구 아주머니","gender":"adult","hair":"bob","top":"#916e82","bottom":"#655961","body":"adult"},{"id":"npc_snack","name":"분식집 아주머니","gender":"adult","hair":"bun","top":"#ae614f","bottom":"#6f5c59","body":"adult"},{"id":"npc_guard","name":"아파트 경비 아저씨","gender":"adult","hair":"short","top":"#657d72","bottom":"#4d5b5f","body":"adult"},{"id":"npc_neighbor","name":"빨래 걷는 이웃","gender":"adult","hair":"short","top":"#a3836c","bottom":"#6b6b80","body":"adult"},{"id":"npc_market","name":"장바구니 든 주민","gender":"adult","hair":"perm","top":"#957f9e","bottom":"#645c78","body":"adult"},{"id":"npc_grandma","name":"동네 할머니","gender":"adult","hair":"bun","top":"#87766a","bottom":"#5a5f63","body":"adult"},{"id":"npc_office","name":"퇴근하는 회사원","gender":"adult","hair":"sanggo","top":"#647183","bottom":"#393e53","bag":"#6b574e","body":"adult"},{"id":"npc_maintenance","name":"동네 수리공","gender":"adult","hair":"buzz","top":"#7b876e","bottom":"#4f5b58","body":"adult"},{"id":"npc_studentA","name":"하굣길 남학생","gender":"boy","hair":"buzz","top":"#6c8ba8","bottom":"#626c88","bag":"#a47658"},{"id":"npc_studentB","name":"하굣길 여학생","gender":"girl","hair":"pony","top":"#d09a70","bottom":"#5e668d","bag":"#ad6869"},{"id":"npc_hakwondo","name":"태권도 학원 가는 아이","gender":"boy","hair":"short","top":"#eeeeec","bottom":"#eeeeec","dobok":true},{"id":"npc_delivery","name":"동네 배달 직원","gender":"adult","hair":"short","top":"#457d9b","bottom":"#526071","body":"adult"},{"id":"npc_worker","name":"공사 마치고 돌아가는 인부","gender":"adult","hair":"short","top":"#a48456","bottom":"#5d6264","body":"adult"},{"id":"npc_neighbor2","name":"복도에서 인사하는 이웃","gender":"adult","hair":"perm","top":"#7a9b8b","bottom":"#595766","body":"adult"}];
const frames=["idle0","idle1","walk0","walk1","walk2","walk3","walk4","walk5","walk6","walk7","jump0","jump1","sit0","sit1","wave0","wave1","wave2","eat0","eat1","eat2","climb0","climb1","run0","run1"];
const playing=["boy_main_blue","boy_main_green","boy_main_dobok","girl_main_pink","girl_main_yellow","girl_main_dobok"];
const nmap=new Map(specs.map(x=>[x.id,x]));
const imgs={};
for(const [id,uri] of Object.entries(sources)){
  const img=new Image();img.decoding='async';img.src=uri;imgs[id]=img;
}
const A29_HD=new Set(["boy_main_blue", "boy_main_green", "boy_main_dobok", "girl_main_pink", "girl_main_yellow", "girl_main_dobok"]);
const A29_NPC_ALIAS={};
const savedKey='2006_a36_character';
let selected='boy_main_blue';try{let x=localStorage.getItem(savedKey);if(playing.includes(x))selected=x;}catch(_){}
let editorOpen=false,activeGender='boy';
const panel=document.getElementById('charEditor');
const selectList=document.getElementById('charVariants'),preview=document.getElementById('charPreview'),label=document.getElementById('charChoice');
const pc=preview?.getContext('2d');if(pc)pc.imageSmoothingEnabled=false;
function ready(id){return Boolean(imgs[id]?.complete && imgs[id].naturalWidth>0 && (playing.includes(id)?window.CharacterAtlas?.valid(imgs[id],id):window.NPCAtlas?.valid(imgs[id],id)))}
function poseIndex(p,phase){
 const now=performance.now();
 let name='idle'+(Math.floor(now/950)%2);
 if(p==='climb')name='climb'+(Math.floor(now/230)%2);
 else if(p==='jump')name='jump'+(Math.floor(now/210)%2);
 else if(['sit','bench','swing'].includes(p))name='sit'+(Math.floor(now/690)%2);
 else if(p==='wave')name='wave'+(Math.floor(now/180)%3);
 else if(p==='eat')name='eat'+(Math.floor(now/260)%3);
 else if(p==='run')name='run'+(Math.floor(now/95)%2);
 else if(p==='walk'||Math.abs(phase||0)>0.1)name='walk'+(Math.floor(now/112)%8);
 if(p==='work')return 24+Math.floor(now/300)%4;
 return Math.max(0,frames.indexOf(name));
}
// Separate player/resident manifests; existing actor roles, paths and interaction hooks remain.
function drawFrame(c,id,x,foot,dir,idx,adult=false,actorKey="local",heldKind=null){
 id=A29_NPC_ALIAS[id]||id;
 if(!ready(id))return false;
 if(playing.includes(id))return window.CharacterAtlas.draw(c,imgs[id],id,x,foot,dir,frames[idx]||'idle0',performance.now(),actorKey,heldKind);
 return window.NPCAtlas?.draw(c,imgs[id],id,x,foot,dir,idx)||false;
}
function drawPlayer(c,x,foot,dir,phase,shirt,npc,sitting,pose){
 let id=npc?'npc_studentA':selected;
 return drawFrame(c,id,x,foot,dir,poseIndex(pose==='eat'?'eat':sitting?'sit':pose,phase));
}
const routineMap={
 afterSchool:'npc_studentA',schoolGate:'npc_studentB',neighborLaundry:'npc_neighbor',marketBag:'npc_market',
 playChild:'npc_hakwondo',courtyardWorker:'npc_neighbor',hallResident:'npc_neighbor2',caretaker:'npc_guard',roofNeighbor:'npc_grandma'
};
function drawRoutine(c,a,t){
 let id=routineMap[a.id];if(!id)return false;
 let pose=(a.current==='walk'?'walk':a.current==='write'?'work':a.current==='bagAdjust'?'work':
 ['hang','gather','sweep','carry','bagAdjust'].includes(a.current)?'work':a.current==='wave'?'wave':'idle');
 let index=poseIndex(pose,pose==='walk'?1:0);if(a.current==='write')index=26+Math.floor(performance.now()/320)%2;if(a.current==='sweep')index=24+Math.floor(performance.now()/320)%2;
 const result=drawFrame(c,id,a.x,206,a.face,index,!['npc_studentA','npc_studentB','npc_hakwondo'].includes(id));
 if(result && a.current==='umbrella'){
   c.save();c.strokeStyle='#6b5a50';c.lineWidth=2;c.beginPath();c.moveTo(a.x+7,167);c.lineTo(a.x+7,131);c.stroke();c.fillStyle='#697f7e';c.beginPath();c.arc(a.x+7,131,19,Math.PI,Math.PI*2);c.fill();c.restore();
 }
 if(result&&a.greetingUntil>t){const top=206-(window.NPC_MANIFEST?.[id]?.kind==='child'?68:78);c.save();c.fillStyle='#f2e9d5';c.fillRect(a.x-13,top-12,28,12);c.fillStyle='#536862';c.font='8px sans-serif';c.fillText('안녕',a.x-9,top-3);c.restore()}
 return result;
}
const ambient=[
 {id:'npc_studentA',x:915,range:42,speed:.26,active:[0,1]},
 {id:'npc_studentB',x:1255,range:30,speed:.16,active:[0,1]},
 {id:'npc_delivery',x:1835,range:32,speed:.18,active:[0,1,2]},
 {id:'npc_maintenance',x:2120,range:25,speed:.21,active:[0,1]},
 {id:'npc_office',x:2455,range:31,speed:.12,active:[1,2]},
 {id:'npc_grandma',x:3040,range:19,speed:.07,active:[0,1]},
 {id:'npc_worker',x:3630,range:35,speed:.15,active:[1,2]},
 {id:'npc_hakwondo',x:3835,range:26,speed:.17,active:[0,1]},
];
function drawAmbient(c,scene,t){
 // Period-appropriate shopkeepers: plain casual clothes, apron; no chef's toque or fantasy costume.
 if(scene==='stationery'){if(window.StationeryInterior?.ready)return;
  drawFrame(c,'npc_shopkeeper',580,201,1,poseIndex(Math.floor(t/5)%2?'work':'idle',0),true);
  return;
 }
 if(scene==='pcroom'){if(window.PcRoomMap?.ready)return;
  drawFrame(c,'npc_office',709,202,1,poseIndex('idle',0),true);
  return;
 }
 if(scene!=='street')return;
 // Street snack counter is outdoors; vendor stands behind the counter.
 const counter=window.A13LAYOUT?.x?.('snack');
 if(Number.isFinite(counter)){const v=window.AfterSchoolMap?.ready?window.AfterSchoolMap.manifest.vendor:{x:counter+80,foot:207,clip:[counter+40,125,90,56]};c.save();c.beginPath();c.rect(...v.clip);c.clip();drawFrame(c,'npc_snack',v.x,v.foot,1,poseIndex(Math.floor(t/6)%2?'work':'idle',0),true);c.restore()}
 const phase=window.__GAME_DEBUG__?.status?.phase ?? 0;
 for(const [i,a] of ambient.entries()){
  if(!a.active.includes(phase))continue;
  const v=Math.sin(t*a.speed+i*1.9),xx=a.x+a.range*v;
  const dir=Math.cos(t*a.speed+i*1.9)<0?0:1;
  const adult=!['npc_studentA','npc_studentB','npc_hakwondo'].includes(a.id);
  const moving=Math.abs(Math.cos(t*a.speed+i*1.9))>.18;
  drawFrame(c,a.id,xx,206,dir,poseIndex(moving?'walk':'work',moving?1:0),adult);
 }
}
const oldKid=window.WORLD.drawKid;
window.WORLD.drawKid=function(...args){if(!drawPlayer(...args))oldKid(...args)};
function choose(id){
 if(!playing.includes(id))return false;
 selected=id;activeGender=id.startsWith('girl_')?'girl':'boy';try{localStorage.setItem(savedKey,id)}catch(_){};repaint();return true;
}
function repaint(){
 if(!panel||!editorOpen)return;
 selectList.innerHTML='';
 const ids=playing.filter(id=>id.startsWith(activeGender+'_main_'));
 for(const id of ids){
  const item=nmap.get(id),btn=document.createElement('button');btn.type='button';btn.className=(id===selected?'active':'');
  const icon=document.createElement('canvas');icon.width=48;icon.height=64;icon.style.width='31px';icon.style.height='40px';icon.style.imageRendering='pixelated';
  if(ready(id))icon.getContext('2d').drawImage(imgs[id],0,0,96,128,0,0,48,64);
  btn.append(icon,document.createTextNode(item.name));btn.addEventListener('click',()=>choose(id));selectList.append(btn);
 }
 const m=nmap.get(selected);label.textContent=m?.name||selected;
 pc.clearRect(0,0,48,64);if(ready(selected))pc.drawImage(imgs[selected],0,0,96,128,0,0,48,64);
 for(const btn of panel.querySelectorAll('[data-a36-gender]'))btn.classList.toggle('active',btn.dataset.a36Gender===activeGender);
}
if(panel){
 const toolrow=document.createElement('div');toolrow.className='a28-tabs';
 const label=document.createElement('strong');label.textContent='캐릭터는 남학생·여학생 각 1명';label.style.marginRight='8px';toolrow.append(label);
 for(const [id,name] of [['boy','남학생'],['girl','여학생']]){
  const b=document.createElement('button');b.type='button';b.textContent=name;b.dataset.a36Gender=id;
  b.addEventListener('click',()=>{activeGender=id;repaint()});toolrow.append(b);
 }
 const hint=document.createElement('small');hint.textContent=' · 복장 선택: 사복 2벌 + 태권도복 1벌';toolrow.append(hint);
 const bd=panel.querySelector('.char-body');bd?.parentNode.insertBefore(toolrow,bd);
}
Object.values(imgs).forEach(img=>img.addEventListener('load',()=>{if(editorOpen)repaint()}));
const open=()=>{editorOpen=true;activeGender=selected.startsWith('girl_')?'girl':'boy';panel.classList.remove('hidden');repaint();document.getElementById('charClose').focus()};
const close=()=>{editorOpen=false;panel.classList.add('hidden')};
document.getElementById('charBtn').addEventListener('click',open);
document.getElementById('charClose').addEventListener('click',close);
panel.addEventListener('pointerdown',e=>{if(e.target===panel)close()});
window.addEventListener('keydown',e=>{
 if(editorOpen){if(e.code==='Escape'||e.code==='KeyV'){e.stopImmediatePropagation();e.preventDefault();close()}
 else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE','KeyC','KeyR'].includes(e.code)){e.stopImmediatePropagation();e.preventDefault()}}
 else if(e.code==='KeyB'||e.code==='KeyV'){e.stopImmediatePropagation();e.preventDefault();open()}
},true);
window.CHARART={
 drawPlayer,drawRoutine,drawAmbient,drawNPC(c,id,x,foot,dir=1,pose='idle'){return drawFrame(c,id,x,foot,dir,poseIndex(pose,pose==='walk'?1:0))},
 drawRemote(c,id,x,y,dir,pose,actorKey="remote",heldKind=null){return drawFrame(c,ready(id)?id:'boy_main_blue',x,y,dir,poseIndex(pose,pose==='walk'?1:0),id.startsWith('npc_'),actorKey,heldKind)},
 get selected(){return selected},setSelected:choose,
 characterStyle:'A43-unified', 
 get spritesLoaded(){return Object.fromEntries(Object.keys(imgs).map(id=>[id,ready(id)]))},
 sheet(id){return imgs[id]||null}, get frames(){return frames.slice()}, get playable(){return playing.slice()}, get highDensityIds(){return [...A29_HD]}, get npcTypes(){return specs.filter(x=>x.id.startsWith('npc_')).map(x=>x.id)}
};
})();

/* END src/15_characters.js */
