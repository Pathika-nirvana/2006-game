/* A112: six actors, independent animation/hit state, shared encounter and attack slots. */
(function(root){
'use strict';
const cfg=root.CombatSettings, fx=root.CombatFeedback, atlas={};
const legacy={idle:['idle',[0,1,2],.34],walk:['idle',[6,7,8,9],.12],ready:['idle',[6],.2],guard:['fight',[3],.2],punch:['fight',[3,4,5],.12],kick:['fight',[0,1,2],.13],weak:['fight',[8],.2],strong:['fight',[7],.25],low:['fight',[8],.25],mid:['fight',[7],.25],down:['down',[0,1,2],.18]};
const frames={idle:[0,1,2],ready:[3],guard:[12],walk:[4,5,6,7],punch:[8,9,10],weak:[11],kick:[12,13,14],strong:[15],low:[16],mid:[17],down:[15,18,19]};
for(const [name,height] of [['idle',375],['fight',349],['down',495]]){
 const im=new Image(); im.onload=()=>{atlas[name]={image:im,frames:root.CombatFrames['bully-'+name].flat(),scale:82/height};}; im.src='assets/characters/combat/bully-'+name+'.webp';
}
// Profiles are independent of the sprite sheet. Many encounters can reuse the same three roles.
const profiles = {
 counter: {guardChance:.84, reaction:.06, counterWindow:.90, distance:24, minRange:0, reach:34, speed:64},
 kicker: {guardChance:.29, reaction:.10, counterWindow:.36, distance:40, minRange:23, reach:47, speed:65},
 flanker: {guardChance:.44, reaction:.085, counterWindow:.46, distance:25, minRange:0, reach:36, speed:77}
};
const defs = [
 {id:'original',skin:'original',name:'불량학생',x:680,y:252,rate:1,attack:1,role:'counter'},
 {id:'boy1',skin:'boy1',name:'건들거리는 학생',x:610,y:244,rate:1.04,attack:1,role:'kicker'},
 {id:'boy2',skin:'boy2',name:'말없는 학생',x:558,y:257,rate:.91,attack:.92,role:'counter'},
 {id:'boy3',skin:'boy3',name:'셔츠 차림 학생',x:642,y:261,rate:.94,attack:1.13,bonusHealth:20,role:'kicker'},
 {id:'girl1',skin:'girl1',name:'머리핀 학생',x:506,y:244,rate:1.13,attack:.88,role:'flanker'},
 {id:'girl2',skin:'girl2',name:'곱슬머리 학생',x:470,y:258,rate:1.02,attack:.96,role:'flanker'}
];
for(const skin of new Set(defs.map(d=>d.skin).filter(skin=>skin!=='original'))){
 const im=new Image();
 im.onload=()=>{atlas[skin]={image:im,frames:root.EnemyFrames[skin].frames,scale:82/root.EnemyFrames[skin].standingHeight};};
 im.src='assets/characters/enemies/'+skin+'.webp';
}
let npcs=[],phase,playerHealth,timer,attackGate,rushGate,turn,turnDeadline,invulnerable,lastPlayer,dialogueTarget;
let encounterId;
function animate(n,m){if(n.motion!==m){n.motion=m;n.age=0;}}
function reset(restoreHealth=true){encounterId='alley-'+Date.now()+'-'+Math.random().toString(36).slice(2);npcs=defs.map((d,i)=>({...d,health:Math.max(cfg.player.health+1,cfg.bully.health+(d.bonusHealth||0)),maxHealth:Math.max(cfg.player.health+1,cfg.bully.health+(d.bonusHealth||0)),dir:-1,motion:'idle',age:i*.17,cooldown:.5+i*.13,guardCooldown:0,seen:null,strikes:0,turns:0,observed:null,observedAt:0,guardRead:null,hitsTaken:0,counterUntil:0,counterAttack:false,brokenUntil:0,looted:false,loot:{coins:50+Math.floor(Math.random()*4)*50,item:i%2?"ring":"stars"}})); phase='idle';if(restoreHealth)playerHealth=cfg.player.health;timer=0;attackGate=0;rushGate=0;turn=null;turnDeadline=0;invulnerable=0;dialogueTarget=null;fx.reset();}
function clamp(n){n.x=Math.max(24,Math.min(696,n.x));const b=root.BackAlleyMap.bounds(n.x);n.y=Math.max(b.top,Math.min(b.bottom,n.y));}
function move(n,x,y,dt,speed){const dx=x-n.x,dy=y-n.y,d=Math.hypot(dx,dy);if(d<1)return;const s=Math.min(d,speed*dt);n.x+=dx/d*s;n.y+=dy/d*s;clamp(n);}
function ready(n){return n.skin==='original'?atlas.idle&&atlas.fight&&atlas.down:atlas[n.skin];}
function attacking(n){
 return n.motion==='punch'||n.motion==='kick';
}
function rushing(n){
 return n.health>0&&n.health<=n.maxHealth*cfg.group.rushHealth;
}
function available(n){
 return ready(n)&&n.health>0&&timer>=n.brokenUntil&&['ready','walk'].includes(n.motion);
}
function chooseTurn(player){
 if(turn){
  if(turn.health>0&&!rushing(turn)&&(attacking(turn)||timer<turnDeadline))return;
  turn=null;
  attackGate=Math.max(attackGate,cfg.group.turnPause);
 }
 if(attackGate>0||npcs.some(n=>n.health>0&&!rushing(n)&&attacking(n)))return;
 const candidates=npcs.filter(n=>available(n)&&!rushing(n)&&n.cooldown===0);
 candidates.sort((a,b)=>Number(b.counterUntil>timer)-Number(a.counterUntil>timer)||
  a.turns-b.turns||Math.hypot(a.x-player.x,a.y-player.alleyFloorY)-Math.hypot(b.x-player.x,b.y-player.alleyFloorY));
 turn=candidates[0]||null;
 if(turn){turn.turns++;turnDeadline=timer+cfg.group.approachTimeout;}
}
function holdFormation(n,p,dt){
 const index=npcs.indexOf(n);
 const side=index%2===0?1:-1;
 const rank=Math.floor(index/2);
 const distance=70+rank*33;
 let targetX=p.x+side*distance;
 if(targetX<24||targetX>696)targetX=p.x-side*(distance+16);
 const bounds=root.BackAlleyMap.bounds(Math.max(24,Math.min(696,targetX)));
 const targetY=Math.max(bounds.top,Math.min(bounds.bottom,p.alleyFloorY+(index%2===0?-17:7)));
 if(Math.hypot(targetX-n.x,targetY-n.y)>5){
  animate(n,'walk');
  move(n,targetX,targetY,dt,52*n.rate);
 }else animate(n,'ready');
}
function update(dt,p,ui){
 if(p.scene!=='back_alley')return;lastPlayer=p;timer+=dt;attackGate=Math.max(0,attackGate-dt);invulnerable=Math.max(0,invulnerable-dt);rushGate=Math.max(0,rushGate-dt);
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
    else{phase='fight';attackGate=.6;fx.battle('back_alley');ui.notice('S 정권 · D 발차기 · A 막기 · G 가드 브레이크');for(const a of npcs)animate(a,'ready');}return true;
   });
  }
 }else if(phase==='fight'){
  chooseTurn(p);
  for(const n of npcs){
   if(!ready(n)||n.health<=0)continue;
   const profile=profiles[n.role];
   const rush=rushing(n);
   if(rush&&!n.rushAnnounced){n.rushAnnounced=true;n.cooldown=0;n.counterUntil=0;}
   const dx=p.x-n.x,dy=p.alleyFloorY-n.y,d=Math.hypot(dx,dy);
   if(!['punch','kick','weak','strong','low','mid','down'].includes(n.motion)&&Math.abs(dx)>1)n.dir=Math.sign(dx);
   const windup=pm?.windup;
   const face=p.dir===0?-1:1;
   const facingEachOther=dx*face<0&&dx*n.dir>0;
   if(n.observed!==windup){n.observed=windup;n.observedAt=timer;}
   if(!rush&&windup&&n.guardRead!==windup&&timer-n.observedAt>=profile.reaction&&
      timer>=n.brokenUntil&&!n.guardCooldown&&['ready','walk'].includes(n.motion)&&facingEachOther&&Math.abs(dy)<=15&&
      d<=windup.reach*root.BackAlleyMap.scale(p.alleyFloorY)/1.3+8){
    n.guardRead=windup;
    if((n.role==='counter'&&n.hitsTaken>=2)||Math.random()<profile.guardChance){
     animate(n,'guard');
     n.guardCooldown=cfg.bully.guardCooldown;
    }
   }
   if(impact&&n.seen!==impact){
    if(d<=impact.reach*root.BackAlleyMap.scale(p.alleyFloorY)/1.3+3&&Math.abs(dy)<=15&&dx*face<=3){
     n.seen=impact;
     if(n.motion==='guard'&&dx*n.dir>=0&&impact.name==='guardBreaker'){
      n.brokenUntil=timer+.80;
      n.cooldown=.80;
      n.counterUntil=0;
      n.counterAttack=false;
      n.guardCooldown=0;
      n.hitsTaken=0;
      animate(n,'strong');
      fx.impact('npc','break',n.x,n.y-44,0,face,n);
     }else if(n.motion==='guard'&&dx*n.dir>=0){
      fx.impact('npc','block',n.x,n.y-44,0,face,n);
      n.cooldown=.12;
      n.counterUntil=timer+profile.counterWindow;
      n.hitsTaken=0;
      n.age=cfg.bully.guardDuration-.13;
      n.x+=face*2;
      clamp(n);
     }
     else{
      const heavy=/finisher|backKick|axeKick|punch4|launchKick/.test(impact.name);
      const damage=Math.max(1,Math.round(cfg.player.attack*(root.CombatItems?.multiplier('attack')||1)*(heavy?1.45:impact.name==='guardBreaker'?.72:1)-cfg.bully.defense));n.health=Math.max(0,n.health-damage);
      fx.impact('npc',n.health?(heavy?'heavy':'hit'):'down',n.x,n.y-44,damage,face,n);
      n.x+=face*(heavy?8:3);clamp(n);animate(n,n.health?(heavy?'strong':/^kick/.test(impact.name)?'low':/punch[13]/.test(impact.name)?'weak':'mid'):'down');
      n.hitsTaken++;n.counterUntil=0;n.counterAttack=false;n.cooldown=heavy?.55:.25;
     }
    }
   }
   if(n.health<=0||timer<n.brokenUntil)continue;
   if(['weak','strong','low','mid'].includes(n.motion)){if(n.age<(n.motion==='strong'?.32:.16))continue;animate(n,'ready');}
   if(n.motion==='guard'){if(n.age<cfg.bully.guardDuration)continue;animate(n,'ready');}
   if(n.motion==='punch'||n.motion==='kick'){
    const windup=(n.motion==='punch'?.18:.23)/cfg.bully.attackSpeed/n.rate;
    if(n.age>=windup&&n.age-dt<windup&&d<=attackReach(n)&&Math.abs(dy)<14&&dx*n.dir>=0&&p.onGround&&!invulnerable){
     if(pm?.defend(p,dx,dy)){fx.impact('player','block',p.x,p.y-38,0,n.dir);n.cooldown=.55;}
     else{const damage=Math.max(1,Math.round((cfg.bully.attack*n.attack-cfg.player.defense)*(root.CombatItems?.multiplier('defense')||1)));playerHealth=Math.max(0,playerHealth-damage);invulnerable=cfg.player.hurtInvulnerability;
      if(root.CombatItems?.cancelEating(p))ui.notice('피격으로 먹기가 끊겼다.');
      fx.impact('player',playerHealth?(n.counterAttack?'counter':'hit'):'down',p.x,p.y-40,damage,n.dir);pm?.react(playerHealth?(n.motion==='kick'?'hitLow':'hitMid'):'down',p);
      if(!playerHealth){root.CombatItems?.clear();phase='lost';timer=0;fx.battle(null);ui.notice('쓰러졌다. 골목 입구로 물러난다.');break;}
     }
    }
    if(n.age<windup+.25/cfg.bully.attackSpeed)continue;
    animate(n,'ready');
    n.counterAttack=false;
    if(turn===n){turn=null;attackGate=cfg.group.turnPause;}
    continue;
   }
   const side=n.x<p.x?-1:1;
   if(rush){
    const activeRush=npcs.filter(a=>rushing(a)&&attacking(a)).length;
    if(d<=profile.reach&&Math.abs(dy)<12&&n.cooldown===0&&rushGate===0&&activeRush<cfg.group.rushAttackers){
     animate(n,d>28||n.role==='kicker'?'kick':'punch');
     n.cooldown=.52+Math.random()*.20;
     rushGate=cfg.group.rushSpacing;
     fx.swing();
    }else{
     const lane=(npcs.indexOf(n)%3-1)*6;
     const targetX=p.x+side*(n.role==='kicker'?31:22);
     const targetY=p.alleyFloorY+lane;
     if(Math.hypot(targetX-n.x,targetY-n.y)>4){
      animate(n,'walk');
      move(n,targetX,targetY,dt,(profile.speed+13)*n.rate);
     }else animate(n,'ready');
    }
    continue;
   }
   if(turn!==n){
    holdFormation(n,p,dt);
    continue;
   }
   if(n.counterUntil>timer&&d<=profile.reach&&Math.abs(dy)<12&&!attackGate&&n.cooldown===0){
    animate(n,n.role==='kicker'||d>27?'kick':'punch');
    n.counterUntil=0;
    n.counterAttack=true;
    n.cooldown=cfg.bully.attackInterval;
    fx.swing();
    continue;
   }
   const index=npcs.indexOf(n);
   const flank=n.role==='flanker'?-face:side;
   const aligned=Math.abs(dy)<12;
   const onFlank=side===flank;
   const nearWall=p.x+flank*profile.distance<24||p.x+flank*profile.distance>696;
   if(aligned&&n.cooldown===0&&d>=profile.minRange&&d<=profile.reach&&!attackGate&&
      (n.role!=='flanker'||onFlank||nearWall)){
    n.counterAttack=false;
    animate(n,n.role==='kicker'||d>29?'kick':'punch');
    n.strikes++;
    n.cooldown=cfg.bully.attackInterval+.08+Math.random()*.16;
    fx.swing();
   }else{
    const preferred=profile.distance;
    const laneOffset=index%2?16:-16;
    const targetSide=nearWall?side:flank;
    let tx=p.x+targetSide*preferred;
    let ty=p.alleyFloorY;
    // Flankers take a parallel lane before crossing the player's position.
    if(side!==targetSide){
     const bounds=root.BackAlleyMap.bounds(n.x);
     const lane=p.alleyFloorY+laneOffset;
     ty=lane>=bounds.top&&lane<=bounds.bottom?lane:p.alleyFloorY-laneOffset;
     if(Math.abs(n.y-p.alleyFloorY)<11&&Math.abs(n.x-p.x)<48)tx=n.x;
    }
    if(Math.hypot(tx-n.x,ty-n.y)>4){
     animate(n,'walk');
     move(n,tx,ty,dt,profile.speed*n.rate);
    }else animate(n,'ready');
   }
  }
  // Avoid silhouettes piling up without letting bodies push into walls.
  for(let i=0;i<npcs.length;i++)for(let j=i+1;j<npcs.length;j++){const a=npcs[i],b=npcs[j];if(!a.health||!b.health)continue;const dx=b.x-a.x,dy=b.y-a.y;if(Math.abs(dx)<15&&Math.abs(dy)<9){const s=dx>=0?1:-1;a.x-=s*18*dt;b.x+=s*18*dt;clamp(a);clamp(b);}}
  if(phase==='fight'&&npcs.every(n=>n.health<=0)){phase='won';fx.battle(null);ui.notice('골목이 조용해졌다.');}
 }else if(phase==='lost'&&timer>1.85){p.x=52;root.BackAlleyMap.enter(p,255);pm?.reset();reset();}
}
function attackReach(n){
 return n.motion==='kick'?profiles[n.role].reach:Math.min(30,profiles[n.role].reach);
}
function drawOne(c,n){
 if(!ready(n))return;
 let source,list,delay;
 if(n.skin==='original'){const a=legacy[n.motion]||legacy.ready;source=atlas[a[0]];list=a[1];delay=a[2];}
 else{source=atlas[n.skin];list=frames[n.motion]||frames.ready;if(n.skin==='boy3'&&n.motion==='punch')list=[8,10,9];if(n.skin==='boy3'&&n.motion==='kick')list=[12,14,13];delay=n.motion==='walk'?.13/n.rate:n.motion==='idle'?.48:n.motion==='down'?.16:.12;}
 let index;
 if(['punch','kick'].includes(n.motion)){const windup=(n.motion==='punch'?.18:.23)/cfg.bully.attackSpeed/n.rate;index=n.age<windup?0:n.age<windup+.09?1:2;}
 else index=['walk','idle'].includes(n.motion)?Math.floor(n.age/delay)%list.length:Math.min(list.length-1,Math.floor(n.age/delay));
 const f=source.frames[list[index]];if(!f)return;const s=source.scale*root.BackAlleyMap.scale(n.y);
 n.visualTop=Math.round(n.y)+(f.y-f.anchorY)*s;
 n.visualX=Math.round(n.x)+((f.x-f.anchorX)+f.width/2)*s*n.dir;
 c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(n.x+(fx.recoil?.(n)||0)),Math.round(n.y));c.scale(n.dir,1);
 c.drawImage(source.image,f.x,f.y,f.width,f.height,(f.x-f.anchorX)*s,(f.y-f.anchorY)*s,f.width*s,f.height*s);c.restore();
}
function draw(c,foot,front){for(const n of [...npcs].sort((a,b)=>a.y-b.y))if(foot===undefined||(front?n.y>foot:n.y<=foot))drawOne(c,n);}

function lootTarget(p){if(p.scene!=='back_alley'||!p.onGround||phase==='lost')return null;return npcs.filter(n=>n.health<=0&&!n.looted&&n.age>.5&&Math.hypot(n.x-p.x,n.y-p.alleyFloorY)<34).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.alleyFloorY)-Math.hypot(b.x-p.x,b.y-p.alleyFloorY))[0]||null;}
function loot(p,ui){const n=lootTarget(p);if(!n)return false;
 const receipt=root.SHOPS?.grantLoot(encounterId+':'+n.id,n.loot);
 if(receipt==='full'){ui.notice('가방이 꽉 찼다. 자리를 비우고 다시 줍자.');return true;}
 if(!receipt){ui.notice('획득 내역을 저장하지 못했다. 다시 시도해 줘.');return true;}
 n.looted=true;fx.pickup?.(n.x,n.y-12,n.loot.coins,n.loot.item==='ring'?'반지사탕':'별사탕');ui.notice(n.name+'에게서 '+n.loot.coins+'원 · '+(n.loot.item==='ring'?'반지사탕':'별사탕')+' 1개 획득');return true;
}
function drawIndicators(c,p){
 c.save();c.textAlign='center';c.font='bold 6px sans-serif';
 for(const n of npcs){
  if(n.health>0&&phase==='fight'&&Number.isFinite(n.visualTop)){
   const x=Math.round(n.visualX),y=Math.round(n.visualTop)-7;
   c.fillStyle='#171a20';c.fillRect(x-15,y,30,4);c.fillStyle='#d9c8a7';c.fillRect(x-15,y,30,1);
   c.fillStyle='#e65e48';c.fillRect(x-14,y+1,28*n.health/n.maxHealth,2);
   if(timer<n.brokenUntil){
    const pulse=.5+.5*Math.sin(timer*20);
    c.fillStyle=pulse>.5?'#fff4a2':'#f292dd';c.fillText('가드 붕괴',x,y-3);
   }else if(n.counterAttack&&['punch','kick'].includes(n.motion)&&n.age<.16){
    c.fillStyle='#ffc26d';c.fillText('반격',x,y-3);
   }else if(n.motion==='guard'){
    c.fillStyle='#a8e8ff';c.fillText('가드',x,y-3);
   }else if(rushing(n)){
    c.fillStyle='#ff9d75';c.fillText('돌격',x,y-3);
   }
  }else if(n.health<=0&&!n.looted&&n.age>.5){
   c.fillStyle='#ebc271';c.fillRect(n.x-2,n.y-4,4,3);
   if(lootTarget(p)===n){c.fillStyle='#181d23';c.fillRect(n.x-25,n.y-17,50,10);c.fillStyle='#fff1c4';c.fillText('E  줍기',n.x,n.y-10);}
  }
 }c.restore();
}

function heal(amount,p){
 if(phase==='lost'||!Number.isFinite(amount)||amount<=0)return 0;
 const gained=Math.min(cfg.player.health-playerHealth,amount);
 if(gained>0){playerHealth+=gained;fx.heal?.(p.x,p.y-40,gained);}
 return gained;
}
reset();root.AlleyEncounter={damage(amount){playerHealth=Math.max(0,playerHealth-Math.max(0,amount));return playerHealth;},reset,heal,update,draw,drawIndicators,loot,lootTarget,get choosing(){return phase==='choice'},get targets(){return npcs.filter(ready).map(n=>({...n,height:82*root.BackAlleyMap.scale(n.y)}))},get status(){return{phase,playerHealth,...npcs[0]}},get debug(){return{npcs,phase}}};
})(window);
