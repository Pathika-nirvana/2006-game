/* A117. Sequential single-opponent encounter. All telegraphs and hit tests share geometry. */
(function(w){'use strict';
const cfg=w.CombatSettings,fx=w.CombatFeedback,scene='hidden_alley',art={};
const poses={underboss:{idle:[0,1,2],ready:[4],guard:[4],walk:[5,6,7,8],punch:[10,11,12],kick:[15,16,17],weak:[13],strong:[18],low:[20],mid:[21],down:[18,22,23],tired:[24]},boss:{idle:[0,1],ready:[2],guard:[3],walk:[5,6,7,8],punch:[10,11,12],kick:[13,14,15],weak:[16],strong:[17],low:[18],mid:[19],down:[17,24,23],chargeTell:[20],charge:[21],jumpTell:[20],air:[22],land:[23],rise:[24],tired:[4],spent:[9]}};
for(const key of ['underboss','boss']){const im=new Image();im.onload=()=>{art[key]={image:im,...w.BossFrames[key]};};im.src='assets/characters/enemies/'+key+'.webp';}
let shockwaves=[];
let actors,phase='idle',active=0,clock=0,delay=0,inv=0,lastPlayer,uiRef;
function reset(){shockwaves=[];actors=['underboss','boss'].map((kind,i)=>({kind,name:i?'거구 불량배':'다부진 슬리퍼 불량배',x:425+i*165,y:250,dir:-1,health:cfg.bosses[kind].health,maxHealth:cfg.bosses[kind].health,stamina:100,motion:'idle',age:0,cooldown:1,seen:null,guardSeen:null,guardCooldown:0,chain:0,pattern:0,hit:false,looted:false,comboHits:0,lastHitAt:-10,punishUntil:0,counterUntil:0,guardHits:0}));phase='idle';active=0;clock=delay=inv=0;}
function anim(n,m){n.motion=m;n.age=0;}
function fatigue(n){return n.kind!=='boss'?0:n.stamina<=0?3:n.stamina<=30?2:n.stamina<=60?1:0;}
function clamp(n){n.x=Math.max(52,Math.min(674,n.x));const b=w.NarrowAlleyMap.bounds(n.x);n.y=Math.max(b.top,Math.min(b.bottom,n.y));}
function move(n,x,y,dt,speed){const d=Math.hypot(x-n.x,y-n.y);if(d>.5){const step=Math.min(d,speed*dt);n.x+=(x-n.x)/d*step;n.y+=(y-n.y)/d*step;clamp(n);}}
function hurtPlayer(n,p,damage,knock,canBlock=true){
 if(inv>0||w.AlleyEncounter.status.playerHealth<=0)return;
 const pm=w.TaekwondoMotion;
 if(canBlock&&pm.defend(p,p.x-n.x,p.narrowFloorY-n.y)){
  fx.impact('player','block',p.x,p.y-45,0,n.dir);
  if(/parry|Arrow/.test(pm.motion||'')){anim(n,'strong');n.cooldown=1.25;n.punishUntil=clock+1.25;n.comboHits=0;n.telegraph=null;}
  return;
 }
 // The belly slam retains its fixed percentage damage.
 if(canBlock)damage=Math.max(1,Math.round(damage*(w.CombatItems?.multiplier('defense')||1)));
 const hp=w.AlleyEncounter.damage(damage);inv=cfg.player.hurtInvulnerability;
 if(w.CombatItems?.cancelEating(p))uiRef?.notice('피격으로 먹기가 끊겼다.');
 pm.react(hp?(knock>10?'hitHeavy':'hitMid'):'down',p);
 // Resolve knockback with the same solid floor constraints as normal movement.
 const dir=p.x<n.x?-1:1,oldDash=p.dashMultiplier;p.dashMultiplier=1;w.NarrowAlleyMap.walk(p,dir,0,knock/84);p.dashMultiplier=oldDash;p.walking=0;
 fx.impact('player',hp?(knock>10?'heavy':'hit'):'down',p.x,p.y-45,damage,n.dir);
 if(!hp){w.CombatItems?.clear();phase='lost';delay=2;fx.battle(null);uiRef?.notice('쓰러졌다. 골목 입구에서 다시 일어난다.');}
}
function takeHit(n,p){
 const pm=w.TaekwondoMotion,hit=pm.impact;if(!hit||n.seen===hit||n.health<=0||n.motion==='air')return;
 const dx=n.x-p.x,dy=n.y-p.narrowFloorY,face=p.dir===0?-1:1;
 if(Math.abs(dy)>14||dx*face< -3||Math.hypot(dx,dy)>hit.reach*w.NarrowAlleyMap.scale(p.narrowFloorY)/1.3+6)return;
 n.seen=hit;const f=fatigue(n),bc=cfg.bosses[n.kind];
 if(n.motion==='guard'&&face!==n.dir){
  if(hit.name==='guardBreaker'){anim(n,'strong');n.cooldown=1.25;n.punishUntil=clock+1.25;n.comboHits=0;n.counterUntil=0;fx.impact('npc','break',n.x,n.y-65,0,face,n);return;}
  fx.impact('npc','block',n.x,n.y-65,0,face,n);n.guardHits++;n.counterUntil=clock+1;n.cooldown=.08;n.chain=0;n.age=.25;return;
 }
 const heavy=/finisher|backKick|axeKick|punch4|launchKick/.test(hit.name);
 const defense=n.kind==='boss'?(f>=2?bc.exhaustedDefense:bc.defense):bc.defense;
 const damage=Math.max(2,Math.round(cfg.player.attack*(w.CombatItems?.multiplier('attack')||1)*(heavy?1.45:hit.name==='guardBreaker'?.72:1)-defense));
 n.health=Math.max(0,n.health-damage);fx.impact('npc',n.health?(heavy?'heavy':'hit'):'down',n.x,n.y-65,damage,face,n);
 if(!n.health){anim(n,'down');n.telegraph=null;phase='interval';delay=2.2;return;}
 // Healthy giant keeps the committed action; exhaustion strips that armour.
 if(clock-n.lastHitAt>1.2)n.comboHits=0;
 n.lastHitAt=clock;n.comboHits++;
 const counterArmour=n.kind==='underboss'&&n.counterUntil>clock&&['punch','kick'].includes(n.motion);
 if(n.kind==='underboss'&&clock>=n.punishUntil&&n.comboHits>=bc.comboLimit&&!counterArmour){
  n.comboHits=0;n.dir=p.x<n.x?-1:1;anim(n,'guard');n.cooldown=.12;n.counterUntil=clock+1.3;
  fx.impact('npc','block',n.x,n.y-65,0,face,n);return;
 }
 if((n.kind!=='boss'||f>=2)&&!counterArmour){anim(n,heavy?'strong':/^kick/.test(hit.name)?'low':'weak');n.cooldown=heavy?.48:.24;n.telegraph=null;}
}
function begin(n,kind,p){
 n.hit=false;const bc=cfg.bosses[n.kind];n.dir=p.x<n.x?-1:1;
 if(kind==='charge'){
  n.stamina=Math.max(0,n.stamina-bc.chargeCost);
  const target=n.dir>0?674:52;
  n.telegraph={type:'line',x1:Math.min(n.x,target),x2:Math.max(n.x,target),y:n.y,ry:bc.chargeHalfWidth};
  n.targetX=target;anim(n,'chargeTell');
 }else if(kind==='belly'){
  n.stamina=Math.max(0,n.stamina-bc.bellyCost);
  n.telegraph={type:'ellipse',x:p.x,y:p.narrowFloorY,rx:bc.bellyRadiusX,ry:bc.bellyRadiusY};
  n.originX=n.x;n.originY=n.y;anim(n,'jumpTell');
 }else{
  if(n.kind==='boss')n.stamina=Math.max(0,n.stamina-(kind==='kick'?bc.kickCost:bc.punchCost));
  anim(n,kind);fx.swing();
 }
}
function inside(g,x,y){return g.type==='line'?x>=g.x1&&x<=g.x2&&Math.abs(y-g.y)<=g.ry:((x-g.x)/g.rx)**2+((y-g.y)/g.ry)**2<=1;}
function ai(n,p,dt){
 const bc=cfg.bosses[n.kind],f=fatigue(n),pm=w.TaekwondoMotion;
 const dx=p.x-n.x,dy=p.narrowFloorY-n.y,d=Math.hypot(dx,dy);
 const recover=bc.recovery*(1+f*.5);
 if(['weak','strong','low','mid'].includes(n.motion)){if(n.age<(n.motion==='strong'?.45:.20))return;anim(n,'ready');}
 if(n.motion==='guard'){
  if(n.age<.36)return;
  if(n.counterUntil>clock&&d<bc.kickReach+8&&Math.abs(dy)<13){begin(n,d>bc.punchReach?'kick':'punch',p);return;}
  anim(n,'ready');
 }
 if(n.kind==='underboss'&&clock<n.punishUntil)return;
 if(n.motion==='chargeTell'){
  if(n.age>=bc.chargeTell){anim(n,'charge');fx.swing();shockwaves.push({x:n.x,y:n.y,at:clock});fx.groundShock?.(n.x,n.y);}return;
 }
 if(n.motion==='charge'){
  const old=n.x;n.x+=n.dir*bc.chargeSpeed*dt;n.x=n.dir>0?Math.min(n.x,n.targetX):Math.max(n.x,n.targetX);
  // Swept x interval avoids tunnelling past the player at low frame rates.
  const swept={...n.telegraph,x1:Math.min(old,n.x)-10,x2:Math.max(old,n.x)+10};
  if(!n.hit&&inside(swept,p.x,p.narrowFloorY)){n.hit=true;hurtPlayer(n,p,bc.chargeDamage,23,true);}
  if(n.motion==='charge'&&Math.abs(n.x-n.targetX)<1){n.telegraph=null;anim(n,f>=2?'tired':'ready');n.cooldown=recover+.35;clamp(n);shockwaves.push({x:n.x,y:n.y,at:clock});fx.groundShock?.(n.x,n.y);}return;
 }
 if(n.motion==='jumpTell'){if(n.age>=bc.bellyTell){anim(n,'air');fx.swing();}return;}
 if(n.motion==='air'){
  const t=Math.min(1,n.age/bc.airTime),g=n.telegraph;
  n.x=n.originX+(g.x-n.originX)*t;n.y=n.originY+(g.y-n.originY)*t;n.lift=95*Math.sin(Math.PI*t);
  if(t>=1){n.lift=0;anim(n,'land');n.cooldown=bc.landRecovery+f*.35;
   shockwaves.push({x:n.x,y:n.y,at:clock});fx.groundShock?.(n.x,n.y);
   if(inside(g,p.x,p.narrowFloorY))hurtPlayer(n,p,Math.round(cfg.player.health*bc.bellyDamageFraction),25,false);
   n.telegraph=null;
  }return;
 }
 if(n.motion==='land'){if(n.age>=n.cooldown){n.stamina=Math.max(0,n.stamina-bc.riseCost);anim(n,'rise');}return;}
 if(n.motion==='rise'){if(n.age>=.65+f*.25){anim(n,f>=2?'tired':'ready');n.cooldown=.5;}return;}
 if(n.motion==='punch'||n.motion==='kick'){
  const kick=n.motion==='kick',wind=(kick?bc.kickWindup:bc.punchWindup)*(1+f*.22);
  if(n.age>=wind&&!n.hit){n.hit=true;
   if(d<=(kick?bc.kickReach:bc.punchReach)&&Math.abs(dy)<=12&&dx*n.dir>=0&&p.onGround)hurtPlayer(n,p,Math.max(1,Math.round(bc.attack*(kick?1.2:1)-cfg.player.defense)),kick?13:7);
  }
  if(n.motion!=='punch'&&n.motion!=='kick')return;
  if(n.age<wind+recover)return;
  if(n.kind==='underboss'&&n.chain<(n.health<n.maxHealth*.45?2:1)&&d<bc.kickReach+5){n.chain++;begin(n,kick?'punch':'kick',p);return;}
  n.chain=0;anim(n,f===3?'spent':f>=2?'tired':'ready');n.counterUntil=0;n.cooldown=bc.interval*(1+f*.8);return;
 }
 n.dir=dx<0?-1:1;
 // No input reading without a visible windup and reaction time.
 const wind=pm.windup;if(wind!==n.watch){n.watch=wind;n.watchAt=clock;}
 if(n.kind==='underboss'&&wind&&n.guardSeen!==wind&&clock-n.watchAt>.055&&n.guardCooldown<=0&&d<65&&Math.abs(dy)<14&&p.dir!==(n.dir<0?0:1)){
  n.guardSeen=wind;if(Math.random()<bc.guardChance){anim(n,'guard');n.guardCooldown=.35;return;}
 }
 if(n.kind==='underboss'&&n.cooldown>0&&d>bc.kickReach){
  anim(n,'walk');move(n,p.x+(dx>0?-1:1)*38,p.narrowFloorY,dt,bc.speed*.7);return;
 }
 if(n.cooldown>0){if(f>=2&&n.motion!=='tired'&&n.motion!=='spent')anim(n,f===3?'spent':'tired');return;}
 if(n.kind==='boss'&&f<2){
  const pattern=n.pattern++%3;
  if(pattern===0){begin(n,'charge',p);return;}
  if(pattern===1){begin(n,'belly',p);return;}
 }
 if(d<=bc.kickReach&&Math.abs(dy)<12){begin(n,d>bc.punchReach||Math.random()<.4?'kick':'punch',p);return;}
 anim(n,f===3?'spent':'walk');move(n,p.x+(dx>0?-1:1)*(bc.punchReach-4),p.narrowFloorY,dt,bc.speed*(f===3?.28:f===2?.48:f===1?.82:1));
}
function update(dt,p,ui){
 if(p.scene!==scene)return;lastPlayer=p;uiRef=ui;clock+=dt;inv=Math.max(0,inv-dt);
 for(const n of actors){n.age+=dt;n.guardCooldown=Math.max(0,n.guardCooldown-dt);if(n.motion!=='land')n.cooldown=Math.max(0,n.cooldown-dt);}
 const n=actors[active];
 if(phase==='idle'&&p.x>260&&art.underboss&&art.boss&&w.CHARART?.selected==='girl_main_dobok'){
  phase='choice';ui.ask({name:n.name,demand:'여기부터는 그냥 못 지나간다. 어디 실력 좀 보자.',price:0,payLabel:'물러난다',fightLabel:'맞선다'},choice=>{if(phase!=='choice')return false;if(choice==='pay'){phase='idle';p.x=230;return true;}phase='fight';anim(n,'ready');fx.battle('back_alley');ui.notice('슬리퍼 불량배 · A 막기/패링 · G 가드 파괴 · Shift 대시');return true;});
 }else if(phase==='fight'){takeHit(n,p);if(phase==='fight')ai(n,p,dt);}
 else if(phase==='interval'){
  delay-=dt;if(delay<=0){if(active===0){active=1;phase='fight';anim(actors[1],'ready');actors[1].cooldown=1.5;ui.notice('거구가 나선다. 공격선을 피해서 지치게 만들자.');}else{phase='won';fx.battle(null);ui.notice('두 불량배를 제압했다. 쓰러진 상대 곁에서 E로 줍기.');}}
 }else if(phase==='lost'){delay-=dt;if(delay<=0){reset();p.x=66;w.NarrowAlleyMap.enter(p,244);w.AlleyEncounter.heal(cfg.player.health,p);pmReset();}}
}
function pmReset(){w.TaekwondoMotion.reset();}
function frame(n){const list=poses[n.kind][n.motion]||poses[n.kind].ready;
 if(n.motion==='punch'||n.motion==='kick'){const bc=cfg.bosses[n.kind],wind=(n.motion==='kick'?bc.kickWindup:bc.punchWindup)*(1+fatigue(n)*.22);return list[n.age<wind?0:n.age<wind+.13?1:2];}
 return list[['idle','walk'].includes(n.motion)?Math.floor(n.age/(n.motion==='walk'?.16:.48))%list.length:Math.min(list.length-1,Math.floor(n.age/.20))];}
function drawOne(c,n){const sheet=art[n.kind];if(!sheet)return;const a=sheet.frames[frame(n)],s=(n.kind==='boss'?103:86)/sheet.standingHeight*w.NarrowAlleyMap.scale(n.y),lift=n.lift||0;
 if(n.motion==='charge'){
  for(let i=3;i>0;i--){
   c.save();c.globalAlpha=.09*(4-i);c.translate(n.x-n.dir*i*15,n.y);c.scale(n.dir,1);
   c.drawImage(sheet.image,a.x,a.y,a.width,a.height,(a.x-a.anchorX)*s,(a.y-a.anchorY)*s,a.width*s,a.height*s);c.restore();
  }
  c.save();c.strokeStyle='#f3d9a38a';c.lineWidth=1.5;
  for(let i=0;i<5;i++){const y=n.y-12-i*12;c.beginPath();c.moveTo(n.x-n.dir*20,y);c.lineTo(n.x-n.dir*(45+i*9),y);c.stroke();}c.restore();
 }
 c.save();c.imageSmoothingEnabled=false;c.translate(n.x+(fx.recoil?.(n)||0),n.y-lift+(['tired','spent'].includes(n.motion)?Math.sin(clock*5)*(fatigue(n)+1)*.45:0));c.scale(n.dir,1);
 c.drawImage(sheet.image,a.x,a.y,a.width,a.height,(a.x-a.anchorX)*s,(a.y-a.anchorY)*s,a.width*s,a.height*s);c.restore();
 n.visualTop=n.y-lift-a.height*s;
 const f=fatigue(n);if(n.health>0&&f){c.save();c.fillStyle='#b9e9fb';for(let i=0;i<f+1;i++){const fall=(clock*(f+1)*9+i*8)%19;c.fillRect(n.x+(i%2?13:-13),n.visualTop+15+fall,1.5,3);}c.restore();}
}
function draw(c,foot,front){for(const n of [...actors].sort((a,b)=>a.y-b.y))if(foot===undefined||(front?n.y>foot:n.y<=foot))drawOne(c,n);}
function floor(c){
 shockwaves=shockwaves.filter(effect=>clock-effect.at<.55);
 for(const effect of shockwaves){
  const t=(clock-effect.at)/.55;
  c.save();c.globalAlpha=1-t;c.strokeStyle='#efd0a2';c.lineWidth=2*(1-t)+.5;
  c.beginPath();c.ellipse(effect.x,effect.y,8+t*72,3+t*16,0,0,Math.PI*2);c.stroke();
  c.fillStyle='#a88c70';
  for(let i=0;i<12;i++){const angle=i*Math.PI/6;const x=effect.x+Math.cos(angle)*t*65;const y=effect.y+Math.sin(angle)*t*15-Math.sin(t*Math.PI)*12;c.fillRect(x,y,2+i%3,2);}
  c.restore();
 }
 if(phase!=='fight')return;
 const n=actors[active],g=n.telegraph;
 if(!g)return;
 const bc=cfg.bosses[n.kind];
 const progress=Math.min(1,n.age/(g.type==='line'?bc.chargeTell:bc.bellyTell));
 c.save();
 c.shadowColor='#ff3a16';c.shadowBlur=5;
 c.strokeStyle='#ffb561';c.lineWidth=1.2;
 c.fillStyle='rgba(175,19,9,'+(.22+progress*.25)+')';
 c.beginPath();
 if(g.type==='line')c.rect(g.x1,g.y-g.ry,g.x2-g.x1,g.ry*2);
 else c.ellipse(g.x,g.y,g.rx,g.ry,0,0,Math.PI*2);
 c.fill();c.stroke();c.shadowBlur=0;
 c.save();c.clip();
 if(g.type==='line'){
  c.strokeStyle='#ffe0a3';c.lineWidth=1.4;
  const offset=(clock*65)%27;
  for(let x=g.x1-27;x<g.x2+27;x+=27){
   const center=x+offset*n.dir;
   c.beginPath();c.moveTo(center-4*n.dir,g.y-4);c.lineTo(center+3*n.dir,g.y);c.lineTo(center-4*n.dir,g.y+4);c.stroke();
  }
 }else{
  const gradient=c.createRadialGradient(g.x,g.y,0,g.x,g.y,g.rx);
  gradient.addColorStop(0,'rgba(255,188,89,.5)');gradient.addColorStop(1,'rgba(213,34,10,0)');
  c.fillStyle=gradient;c.fillRect(g.x-g.rx,g.y-g.ry,g.rx*2,g.ry*2);
 }
 c.restore();
 if(g.type==='ellipse'){
  c.strokeStyle='#ffdf9b';c.lineWidth=1.5;
  c.beginPath();c.ellipse(g.x,g.y,g.rx*(1-progress*.85),g.ry*(1-progress*.85),0,0,Math.PI*2);c.stroke();
 }
 c.restore();
}
function indicators(c,p){c.save();c.textAlign='center';c.font='bold 7px sans-serif';for(const n of actors){if(n.health>0){if(n!==actors[active]||!['fight','interval'].includes(phase))continue;const y=n.visualTop-10;if(n.kind==='underboss'&&n.counterUntil>clock){c.fillStyle='#ffcb72';c.fillText('반격',n.x,y+13);}c.fillStyle='#171a20';c.fillRect(n.x-34,y,68,5);c.fillStyle='#dbad70';c.fillRect(n.x-34,y,68,1);c.fillStyle='#da4b39';c.fillRect(n.x-33,y+1,66*n.health/n.maxHealth,3);c.fillStyle='#fff1d8';c.fillText(n.name,n.x,y-3);if(fatigue(n)>=2){c.fillStyle='#a8e7ef';c.fillText(fatigue(n)===3?'완전 탈진':'탈진 · 빈틈',n.x,y+13);}}
 else if(!n.looted){c.fillStyle='#f3c478';c.fillRect(n.x-2,n.y-5,4,4);if(lootTarget(p)===n)c.fillText('E 줍기',n.x,n.y-13);}}c.restore();}
function lootTarget(p){return p.scene===scene?actors.find(n=>!n.health&&!n.looted&&n.age>.6&&Math.hypot(n.x-p.x,n.y-p.narrowFloorY)<36):null;}
function loot(p,ui){const n=lootTarget(p);if(!n)return false;const coins=n.kind==='boss'?600:300;const receipt=w.SHOPS?.grantLoot('boss117:'+n.kind,{coins,item:'stars'});if(receipt==='full'){ui.notice('가방이 꽉 찼다. 자리를 비우고 다시 줍자.');return true;}if(!receipt)return true;n.looted=true;fx.pickup?.(n.x,n.y-15,coins,'별사탕');ui.notice(coins+'원 · 별사탕 획득');return true;}
reset();w.BossEncounter={update,draw,drawFloor:floor,drawIndicators:indicators,loot,lootTarget,reset,get choosing(){return phase==='choice'},get active(){return ['fight','interval'].includes(phase)},get status(){return{phase,index:active}},get debug(){return{actors,begin,inside,fatigue}}};
})(window);
