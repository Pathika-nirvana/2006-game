(function (root) {
  'use strict';
  const config = root.CombatSettings;
  const files = {
    ...root.CombatSoundFiles,
    pickup: 'assets/audio/combat-pickup.wav',
    heal: 'assets/audio/combat-heal.wav'
  };
  const moveSounds = {
    punch1:'punch1', punch2:'punch2', punch3:'punch3', punch4:'punch4',
    kick1:'kick1', kick2:'kick2', kick3:'kick3', finisher:'kick3',
    guardBreaker:'axekick', elbow:'elbow', backKick:'back_kick', axeKick:'axekick',
    airPunch:'punch_fly', riseKick:'kick_fly', fallKick:'kick_fly2', launchKick:'kick_fly2',
    guard:'guard1', release:'guard2', blockImpact:'guard_success', parry:'guard_success',
    ArrowUp:'guard_success', ArrowDown:'guard_success', ArrowLeft:'guard_success', ArrowRight:'guard_success'
  };
  const previous = new Map();
  const voices = new Map();
  const themes = {back_alley:['before_the_first_blow_01','before_the_first_blow_02']};
  const music = new Audio();
  const reducedMotion = root.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reactions = new Map();
  let wave = null, comboAge = 0, comboAccent = false;
  let playlist, track = 0, stop = 0, shake = 0, combo = 0, comboTime = 0, pops = [];
  function sound(key, rate = 1) {
    const url = files[key];
    if (!url) return;
    let pool = voices.get(key);
    if (!pool) { pool = []; voices.set(key,pool); }
    let voice = pool.find(audio => audio.paused || audio.ended);
    if (!voice && pool.length < 4) { voice = new Audio(url); pool.push(voice); }
    if (!voice) return;
    voice.volume = config.soundVolume;
    voice.playbackRate = rate;
    voice.currentTime = 0;
    voice.play()?.catch(()=>{});
  }
  function varied(key, count, rate) {
    const last = previous.get(key);
    const choices = Array.from({length:count},(_,i)=>i+1).filter(i=>i!==last);
    const next = choices[Math.floor(Math.random()*choices.length)];
    previous.set(key,next);
    sound(key+next,rate);
  }
  function move(name) {
    if (moveSounds[name]) sound('base_tkd_'+moveSounds[name]);
  }
  function impact(side, type, x, y, damage, direction = 1, target = null) {
    const blocked = type==='block', broken = type==='break';
    const strong = ['heavy','down','counter','break'].includes(type);
    const confirmed = side==='npc' && damage>0 && !blocked && !broken;
    if (confirmed) {
      combo++;
      comboTime=1.65;
      comboAge=0;
      comboAccent=combo%5===0;
    } else if (side==='player' && damage>0) {
      combo=0;
      comboTime=0;
      comboAccent=false;
    }
    const accent = confirmed && comboAccent;
    if (broken || blocked) {
      varied('base_combat_deffense',3,broken?.86:1.15);
      if (broken) sound('base_combat_knockdown');
    } else {
      varied('base_combat_hit',5,strong?.85:1+Math.min(4,combo)*.035);
      varied(side==='npc'?'base_combat_hurt':'base_combat_player_hurt',3);
      if (type==='down') sound('base_combat_knockdown');
    }
    const pause = config.hitStop * (broken?1.55:blocked?.42:strong?1.65:accent?1.22:.70);
    stop=Math.max(stop,pause);
    const amplitude = config.shake * (blocked?.36:strong?1.65:accent?1.3:.72);
    if (!wave || amplitude >= wave.amplitude*(1-wave.age/wave.duration)) {
      wave={age:0,duration:strong?.21:.13,amplitude,direction};
    }
    if (target && !blocked) reactions.set(target,{age:0,direction,strong});
    const labels={block:'가드',break:'가드 붕괴',counter:'반격 −'+damage,down:'다운 '+damage};
    burst(type,x,y,labels[type]||String(damage),strong?.58:.42,'',{direction,accent});
  }
  function burst(type,x,y,label,duration,detail='',contact=null){
    pops.push({type,x,y,label,duration,life:duration,detail,contact});
    if(pops.length>18)pops.shift();
  }
  function recoil(entity) {
    if (reducedMotion?.matches) return 0;
    const r=reactions.get(entity);
    if (!r) return 0;
    const t=r.age/.14;
    return r.direction*(r.strong?5:2.5)*Math.sin(Math.PI*(.25+.75*t))*(1-t);
  }
  function contactBurst(c,pop,age,color,strong,blocked) {
    const {direction,accent}=pop.contact;
    if(age>.19)return;
    const t=age/.19, size=strong?1.55:accent?1.35:1;
    c.save();
    c.translate(pop.x,pop.y);
    c.scale(direction,1);
    c.globalAlpha*=1-t;
    if(age<.07&&!reducedMotion?.matches) {
      const core=[[12,0],[3,2],[-5,9],[-3,2],[-10,-2],[-1,-3],[5,-9],[4,-3]];
      c.fillStyle=color;
      c.beginPath();
      for(const [i,[x,y]] of core.entries()) {
        if(i)c.lineTo(x*size,y*size);else c.moveTo(x*size,y*size);
      }
      c.closePath();c.fill();
      c.fillStyle='#fff7df';c.fillRect(-2,-1,7*size,2);
    }
    const rays=strong||accent?9:5;
    for(let i=0;i<rays;i++){
      const angle=(i/(rays-1)-.5)*(blocked?2.7:2.2);
      const dx=Math.cos(angle),dy=Math.sin(angle);
      const near=(4+t*(19+i%3*5))*size,far=near+(1-t)*10*size;
      c.strokeStyle=i%2?color:'#fff0cf';c.lineWidth=i%3===0?2:1;
      c.beginPath();c.moveTo(dx*near,dy*near);c.lineTo(dx*far,dy*far);c.stroke();
    }
    c.restore();
  }
  function pickup(x,y,coins,item){
    sound('pickup');
    burst('pickup',x,y,'+'+coins+'원',1.25,item+' +1');
  }
  function heal(x,y,amount){
    sound('heal');
    burst('heal',x,y,'체력 +'+amount,.9);
  }
  music.addEventListener('ended',()=>{
    if (!playlist) return;
    track = Math.min(track+1,playlist.length-1);
    music.src = files[playlist[track]];
    syncMusic();
  });
  function syncMusic() {
    if (!playlist) return;
    const bgm = root.BGM?.state;
    music.volume = bgm?.volume ?? .35;
    if (bgm?.localEnabled === false) music.pause();
    else if (music.paused && !music.ended) music.play()?.catch(()=>{});
  }
  function battle(scene) {
    const next = themes[scene];
    if (playlist === next) return;
    music.pause(); playlist = next; track = 0;
    root.BGM?.suspend(!!next);
    if (next) { music.src = files[next[0]]; syncMusic(); }
  }
  function frame(dt) {
    shake = Math.max(0,shake-dt);
    comboAge+=dt;
    if(wave && (wave.age+=dt)>=wave.duration)wave=null;
    for(const [entity,r] of reactions)if((r.age+=dt)>=.14)reactions.delete(entity);
    comboTime = Math.max(0,comboTime-dt);
    if (!comboTime) combo = 0;
    for(const p of pops)p.life-=dt; pops=pops.filter(p=>p.life>0);
    if (!stop) return false;
    stop = Math.max(0,stop-dt);
    root.TaekwondoMotion?.freeze(dt*1000);
    return true;
  }
  function transform(c) {
    if(reducedMotion?.matches)return;
    if(wave){
      const t=wave.age/wave.duration, a=wave.amplitude*(1-t)**2;
      c.translate(wave.direction*a*Math.cos(t*9), a*.28*Math.sin(t*12));
    }
    if (!shake) return;
    const a = shake/.22 * config.shake;
    c.translate(Math.sin(performance.now()*.15)*a, Math.cos(performance.now()*.19)*a*.5);
  }
  function draw(c) {
    for (const pop of pops) {
      const age = pop.duration-pop.life;
      const reward = pop.type==='pickup'||pop.type==='heal';
      const strong = ['heavy','down','counter','break'].includes(pop.type);
      const blocked = pop.type==='block';
      const color = pop.type==='break'?'#ff9bda':pop.type==='heal' ? '#a8f8ae' : blocked ? '#bcf2ff' :
        reward ? '#ffdc74' : strong ? '#ff9a62' : '#fff1bb';
      c.save();
      c.globalAlpha=Math.min(1,pop.life*5);
      c.fillStyle=color;
      c.strokeStyle=color;
      const x=pop.x, y=pop.y-age*(reward?20:38);
      const radius=4+age*(strong?86:reward?32:56);
      if(pop.contact)contactBurst(c,pop,age,color,strong,blocked);
      if (!pop.contact && !reward && age<.18) {
        c.beginPath();
        c.arc(x,pop.y,radius,0,Math.PI*2);
        c.globalAlpha*=1-age/.18;
        c.lineWidth=blocked?1.3:strong?2:1;
        c.stroke();
        c.globalAlpha=Math.min(1,pop.life*5);
      }
      const count=pop.contact?0:strong?12:8;
      for(let i=0;i<count;i++){
        const angle=i*Math.PI*2/count;
        const px=Math.round(x+Math.cos(angle)*radius),py=Math.round(pop.y+Math.sin(angle)*radius*.67-age*11);
        const size=strong?3:2;
        c.fillRect(px,py,size,2);
        if(reward&&i%2===0)c.fillRect(px+1,py-2,1,6);
      }
      c.textAlign='center';
      c.strokeStyle='#202129';
      c.lineWidth=3;
      if(reward){
        c.font='bold 11px sans-serif';
        c.strokeText(pop.label,x,y-12);
        c.fillText(pop.label,x,y-12);
      }else{
        // Bevel, offset ink shadow and a short overshoot give damage its own silhouette.
        c.save();
        c.translate(Math.round(x),Math.round(y-12));
        const popScale=1+Math.sin(Math.min(1,age/.19)*Math.PI)*.32;
        c.scale(popScale,popScale);
        if(!blocked)c.transform(1,0,-.17,1,0,0);
        const size=pop.type==='break'?14:strong?17:blocked?9:13;
        c.font='900 '+size+'px "Arial Black", "Malgun Gothic", sans-serif';
        c.lineJoin='round';
        c.strokeStyle='#221523';
        c.lineWidth=3.5;
        c.strokeText(pop.label,0,1);
        c.fillStyle='#4a2636';
        c.fillText(pop.label,1,2);
        const bevel=c.createLinearGradient(0,-size,0,1);
        bevel.addColorStop(0,'#fffce7');
        bevel.addColorStop(.44,color);
        bevel.addColorStop(1,pop.type==='break'?'#e24ed0':blocked?'#65b1d9':strong?'#ee6a36':'#f5b94b');
        c.fillStyle=bevel;
        c.fillText(pop.label,0,0);
        c.restore();
      }
      if(pop.detail){
        c.font='bold 8px sans-serif';
        c.strokeText(pop.detail,x,y);
        c.fillText(pop.detail,x,y);
      }
      c.restore();
    }
  }
  for (const input of ['pointerdown','input']) {
    root.document?.getElementById('bgmControls')?.addEventListener(input,()=>setTimeout(syncMusic,0));
  }
  function reset() { stop=shake=combo=comboTime=0; pops=[]; wave=null; reactions.clear(); comboAge=0; comboAccent=false; battle(null); }
  root.CombatFeedback = {groundShock(x,y){sound('base_combat_knockdown');stop=Math.max(stop,.075);shake=Math.max(shake,.38);burst('heavy',x,y,'쿵!',.7);},move, impact, pickup, heal, frame, transform, draw, battle, syncMusic, reset,
    recoil, get chain(){return {hits:combo,age:comboAge,accent:comboAccent,remaining:comboTime/1.65};},
    swing:()=>varied('base_combat_swing',2), get combo(){return combo}};
})(window);
