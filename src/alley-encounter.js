/* A112: six actors, independent animation/hit state, shared encounter and attack slots. */
(function(root){
'use strict';
const cfg=root.CombatSettings, fx=root.CombatFeedback, atlas={};
const legacy={idle:['idle',[0,1,2],.34],walk:['idle',[6,7,8,9],.12],ready:['idle',[6],.2],guard:['fight',[3],.2],punch:['fight',[3,4,5],.12],kick:['fight',[0,1,2],.13],weak:['fight',[8],.2],strong:['fight',[7],.25],low:['fight',[8],.25],mid:['fight',[7],.25],down:['down',[0,1,2],.18]};
const frames={idle:[0,1,2],ready:[3],guard:[12],walk:[4,5,6,7],punch:[8,9,10],weak:[11],kick:[12,13,14],strong:[15],low:[16],mid:[17],down:[15,18,19]};
for(const [name,height] of [['idle',375],['fight',349],['down',495]]){
 const im=new Image(); im.onload=()=>{atlas[name]={image:im,frames:root.CombatFrames['bully-'+name].flat(),scale:82/height};}; im.src='assets/characters/combat/bully-'+name+'.webp';
}
const defs=[
 {id:'original',name:'불량학생',x:680,y:252,rate:1,attack:1,style:'기존 쭈그려 흡연'},
 {id:'boy1',name:'건들거리는 학생',x:610,y:244,rate:1.04,attack:1,style:'훅 · 밟아차기'},
 {id:'boy2',name:'말없는 학생',x:558,y:257,rate:.91,attack:.92,style:'손등치기 · 무릎'},
 {id:'boy3',name:'셔츠 차림 학생',x:642,y:261,rate:.94,attack:1.13,style:'정권 · 밀어차기'},
 {id:'girl1',name:'머리핀 학생',x:506,y:244,rate:1.13,attack:.88,style:'따귀 · 정강이차기'},
 {id:'girl2',name:'곱슬머리 학생',x:470,y:258,rate:1.02,attack:.96,style:'내려치기 · 옆차기'}
];
for(const d of defs.slice(1)){
 const im=new Image(); im.onload=()=>{atlas[d.id]={image:im,frames:root.EnemyFrames[d.id].frames,scale:82/root.EnemyFrames[d.id].standingHeight};};
 im.src='assets/characters/enemies/'+d.id+'.webp';
}
let npcs=[],phase,playerHealth,timer,attackGate,invulnerable,lastPlayer,dialogueTarget;
function animate(n,m){if(n.motion!==m){n.motion=m;n.age=0;}}
function reset(){npcs=defs.map((d,i)=>({...d,health:Math.max(cfg.player.health+1,cfg.bully.health+(i===3?20:0)),maxHealth:Math.max(cfg.player.health+1,cfg.bully.health+(i===3?20:0)),dir:-1,motion:'idle',age:i*.17,cooldown:.5+i*.13,guardCooldown:0,seen:null,strikes:0})); phase='idle';playerHealth=cfg.player.health;timer=0;attackGate=0;invulnerable=0;dialogueTarget=null;fx.reset();}
function clamp(n){n.x=Math.max(24,Math.min(696,n.x));const b=root.BackAlleyMap.bounds(n.x);n.y=Math.max(b.top,Math.min(b.bottom,n.y));}
function move(n,x,y,dt,speed){const dx=x-n.x,dy=y-n.y,d=Math.hypot(dx,dy);if(d<1)return;const s=Math.min(d,speed*dt);n.x+=dx/d*s;n.y+=dy/d*s;clamp(n);}
function ready(n){return n.id==='original'?atlas.idle&&atlas.fight&&atlas.down:atlas[n.id];}
function update(dt,p,ui){
 if(p.scene!=='back_alley')return;lastPlayer=p;timer+=dt;attackGate=Math.max(0,attackGate-dt);invulnerable=Math.max(0,invulnerable-dt);
 const pm=root.TaekwondoMotion,impact=pm?.impact;
 for(const n of npcs){n.age+=dt;n.cooldown=Math.max(0,n.cooldown-dt);n.guardCooldown=Math.max(0,n.guardCooldown-dt);}
 if(phase==='idle'){
  const n=npcs.filter(ready).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.alleyFloorY)-Math.hypot(b.x-p.x,b.y-p.alleyFloorY))[0];
  if(n&&Math.hypot(n.x-p.x,n.y-p.alleyFloorY)<76){dialogueTarget=n;phase='approach';animate(n,'walk');}
 }else if(phase==='approach'){
  const n=dialogueTarget;n.dir=p.x<n.x?-1:1;move(n,p.x+26*n.dir*-1,p.alleyFloorY,dt,55);
  if(Math.abs(n.x-p.x)<32&&Math.abs(n.y-p.alleyFloorY)<12&&p.onGround){
   phase='choice';animate(n,'ready');ui.ask({name:n.name,demand:'야, 잠깐. 그냥 지나가려고? 100원만 내놓고 가.',price:100},choice=>{
    if(phase!=='choice')return false;
    if(choice==='pay'){if(!ui.pay(100))return false;phase='paid';for(const a of npcs)animate(a,'idle');ui.notice('100원을 건넸다. 길을 비켜준다.');}
    else{phase='fight';attackGate=.6;fx.battle('back_alley');ui.notice('S 정권 · D 발차기 · A 막기');for(const a of npcs)animate(a,'ready');}return true;
   });
  }
 }else if(phase==='fight'){
  for(const n of npcs){
   if(!ready(n)||n.health<=0)continue;
   let dx=p.x-n.x,dy=p.alleyFloorY-n.y,d=Math.hypot(dx,dy);
   if(!['punch','kick','weak','strong','low','mid','down'].includes(n.motion)&&Math.abs(dx)>1)n.dir=Math.sign(dx);
   if(impact&&n.seen!==impact){
    const face=p.dir===0?-1:1;
    if(d<=impact.reach*root.BackAlleyMap.scale(p.alleyFloorY)/1.3+3&&Math.abs(dy)<=15&&dx*face<=3){
     n.seen=impact;
     if(n.motion==='guard'&&dx*n.dir>=0){fx.impact('npc','block',n.x,n.y-44,0);n.x+=face*2;clamp(n);}
     else{
      const heavy=/finisher|backKick|axeKick|punch4|launchKick/.test(impact.name);
      const damage=Math.max(1,Math.round(cfg.player.attack*(heavy?1.45:1)-cfg.bully.defense));n.health=Math.max(0,n.health-damage);
      fx.impact('npc',n.health?(heavy?'heavy':'hit'):'down',n.x,n.y-44,damage);
      n.x+=face*(heavy?8:3);clamp(n);animate(n,n.health?(heavy?'strong':/^kick/.test(impact.name)?'low':/punch[13]/.test(impact.name)?'weak':'mid'):'down');
      n.cooldown=heavy?.65:.33;
     }
    }
   }
   if(n.health<=0)continue;
   if(['weak','strong','low','mid'].includes(n.motion)){if(n.age<(n.motion==='strong'?.36:.20))continue;animate(n,'ready');}
   if(n.motion==='guard'){if(n.age<cfg.bully.guardDuration)continue;animate(n,'ready');}
   if(n.motion==='punch'||n.motion==='kick'){
    const windup=(n.motion==='punch'?.18:.23)/cfg.bully.attackSpeed/n.rate;
    if(n.age>=windup&&n.age-dt<windup&&d<38&&Math.abs(dy)<14&&dx*n.dir>=0&&p.onGround&&!invulnerable){
     if(pm?.defend(p,dx,dy)){fx.impact('player','block',p.x,p.y-38,0);n.cooldown=.55;}
     else{const damage=Math.max(1,Math.round(cfg.bully.attack*n.attack-cfg.player.defense));playerHealth=Math.max(0,playerHealth-damage);invulnerable=cfg.player.hurtInvulnerability;
      fx.impact('player',playerHealth?'hit':'down',p.x,p.y-40,damage);pm?.react(playerHealth?(n.motion==='kick'?'hitLow':'hitMid'):'down',p);
      if(!playerHealth){phase='lost';timer=0;fx.battle(null);ui.notice('쓰러졌다. 골목 입구로 물러난다.');break;}
     }
    }
    if(n.age<windup+.25/cfg.bully.attackSpeed)continue;animate(n,'ready');
   }
   const threat=/punch|kick|elbow|Kick|finisher/.test(pm?.motion||'');
   if(threat&&!impact&&d<43&&!n.guardCooldown&&n.motion==='ready'){
    n.guardCooldown=cfg.bully.guardCooldown;if(Math.random()<cfg.bully.guardChance){animate(n,'guard');continue;}
   }
   const attacking=npcs.filter(a=>['punch','kick'].includes(a.motion)&&a.health>0).length;
   if(d<34&&Math.abs(dy)<12&&!n.cooldown&&!attackGate&&attacking<cfg.group.maxAttackers){animate(n,n.strikes++%2?'kick':'punch');n.cooldown=cfg.bully.attackInterval+.15;attackGate=cfg.group.attackSpacing;fx.swing();}
   else if(d>30||Math.abs(dy)>11){
    const index=npcs.indexOf(n),side=(index%2?1:-1),offset=attacking>=cfg.group.maxAttackers?55:25;
    animate(n,'walk');move(n,p.x+side*offset,p.alleyFloorY+(index%3-1)*7,dt,60*n.rate);
   }else animate(n,'ready');
  }
  // Avoid silhouettes piling up without letting bodies push into walls.
  for(let i=0;i<npcs.length;i++)for(let j=i+1;j<npcs.length;j++){const a=npcs[i],b=npcs[j];if(!a.health||!b.health)continue;const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)<15&&Math.abs(dy)<9){const s=dx>=0?1:-1;a.x-=s*18*dt;b.x+=s*18*dt;clamp(a);clamp(b);}}
  if(phase==='fight'&&npcs.every(n=>n.health<=0)){phase='won';fx.battle(null);ui.notice('골목이 조용해졌다.');}
 }else if(phase==='lost'&&timer>1.85){p.x=52;root.BackAlleyMap.enter(p,255);pm?.reset();reset();}
}
function drawOne(c,n){
 if(!ready(n))return;
 let source,list,delay;
 if(n.id==='original'){const a=legacy[n.motion]||legacy.ready;source=atlas[a[0]];list=a[1];delay=a[2];}
 else{source=atlas[n.id];list=frames[n.motion]||frames.ready;if(n.id==='boy3'&&n.motion==='punch')list=[8,10,9];if(n.id==='boy3'&&n.motion==='kick')list=[12,14,13];delay=n.motion==='walk'?.13/n.rate:n.motion==='idle'?.48:n.motion==='down'?.16:.12;}
 let index;
 if(['punch','kick'].includes(n.motion)){const windup=(n.motion==='punch'?.18:.23)/cfg.bully.attackSpeed/n.rate;index=n.age<windup?0:n.age<windup+.09?1:2;}
 else index=['walk','idle'].includes(n.motion)?Math.floor(n.age/delay)%list.length:Math.min(list.length-1,Math.floor(n.age/delay));
 const f=source.frames[list[index]];if(!f)return;const s=source.scale*root.BackAlleyMap.scale(n.y);
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(n.x),Math.round(n.y));c.scale(n.dir,1);
 c.drawImage(source.image,f.x,f.y,f.width,f.height,(f.x-f.anchorX)*s,(f.y-f.anchorY)*s,f.width*s,f.height*s);c.restore();
}
function draw(c,foot,front){for(const n of [...npcs].sort((a,b)=>a.y-b.y))if(foot===undefined||(front?n.y>foot:n.y<=foot))drawOne(c,n);}
reset();root.AlleyEncounter={reset,update,draw,get choosing(){return phase==='choice'},get targets(){return npcs.filter(ready).map(n=>({...n,height:82*root.BackAlleyMap.scale(n.y)}))},get status(){return{phase,playerHealth,...npcs[0]}},get debug(){return{npcs,phase}}};
})(window);
