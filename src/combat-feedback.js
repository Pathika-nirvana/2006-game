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
  let playlist, track = 0, stop = 0, shake = 0, combo = 0, comboTime = 0, pops = [];
  function sound(key) {
    const url = files[key];
    if (!url) return;
    let pool = voices.get(key);
    if (!pool) { pool = []; voices.set(key,pool); }
    let voice = pool.find(audio => audio.paused || audio.ended);
    if (!voice && pool.length < 4) { voice = new Audio(url); pool.push(voice); }
    if (!voice) return;
    voice.volume = config.soundVolume;
    voice.currentTime = 0;
    voice.play()?.catch(()=>{});
  }
  function varied(key, count) {
    const last = previous.get(key);
    const choices = Array.from({length:count},(_,i)=>i+1).filter(i=>i!==last);
    const next = choices[Math.floor(Math.random()*choices.length)];
    previous.set(key,next);
    sound(key+next);
  }
  function move(name) {
    if (moveSounds[name]) sound('base_tkd_'+moveSounds[name]);
  }
  function impact(side, type, x, y, damage) {
    if (type === 'break') { varied('base_combat_deffense',3); sound('base_combat_knockdown'); }
    else if (type === 'block') varied('base_combat_deffense',3);
    else {
      varied('base_combat_hit',5);
      varied(side === 'npc' ? 'base_combat_hurt' : 'base_combat_player_hurt',3);
      if (type === 'down') sound('base_combat_knockdown');
    }
    if (side === 'npc' && type !== 'block' && type !== 'break') { combo++; comboTime = 1.65; }
    else if (side === 'player' && type !== 'block') { combo = 0; comboTime = 0; }
    const strong = ['heavy','down','counter','break'].includes(type);
    stop = Math.max(stop, config.hitStop * (type === 'block' ? .52 : strong ? 1.6 : .85));
    shake = Math.max(shake, strong ? .24 : type === 'block' ? .065 : .10);
    const labels = {block:'가드',break:'가드 붕괴',counter:'반격 −'+damage,down:'다운 '+damage};
    burst(type,x,y,labels[type]||String(damage),strong?.58:.42);
  }
  function burst(type,x,y,label,duration,detail=''){
    pops.push({type,x,y,label,duration,life:duration,detail});
    if(pops.length>18)pops.shift();
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
    comboTime = Math.max(0,comboTime-dt);
    if (!comboTime) combo = 0;
    for(const p of pops)p.life-=dt; pops=pops.filter(p=>p.life>0);
    if (!stop) return false;
    stop = Math.max(0,stop-dt);
    root.TaekwondoMotion?.freeze(dt*1000);
    return true;
  }
  function transform(c) {
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
      if (!reward && age<.18) {
        c.beginPath();
        c.arc(x,pop.y,radius,0,Math.PI*2);
        c.globalAlpha*=1-age/.18;
        c.lineWidth=blocked?1.3:strong?2:1;
        c.stroke();
        c.globalAlpha=Math.min(1,pop.life*5);
      }
      const count=strong?12:8;
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
  function reset() { stop=shake=combo=comboTime=0; pops=[]; battle(null); }
  root.CombatFeedback = {groundShock(x,y){sound('base_combat_knockdown');stop=Math.max(stop,.075);shake=Math.max(shake,.38);burst('heavy',x,y,'쿵!',.7);},move, impact, pickup, heal, frame, transform, draw, battle, syncMusic, reset,
    swing:()=>varied('base_combat_swing',2), get combo(){return combo}};
})(window);
