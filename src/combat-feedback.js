(function (root) {
  'use strict';
  const config = root.CombatSettings;
  const files = root.CombatSoundFiles;
  const moveSounds = {
    punch1:'punch1', punch2:'punch2', punch3:'punch3', punch4:'punch4',
    kick1:'kick1', kick2:'kick2', kick3:'kick3', finisher:'kick3',
    elbow:'elbow', backKick:'back_kick', axeKick:'axekick',
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
    if (type === 'block') varied('base_combat_deffense',3);
    else {
      varied('base_combat_hit',5);
      varied(side === 'npc' ? 'base_combat_hurt' : 'base_combat_player_hurt',3);
      if (type === 'down') sound('base_combat_knockdown');
    }
    if (side === 'npc' && type !== 'block') { combo++; comboTime = 1.65; }
    else if (side === 'player' && type !== 'block') { combo = 0; comboTime = 0; }
    stop = Math.max(stop, config.hitStop * (type === 'block' ? .45 : type === 'heavy' || type === 'down' ? 1.5 : .8));
    shake = Math.max(shake,type === 'down' || type === 'heavy' ? .22 : type === 'block' ? .07 : .11);
    pops.push({x,y,damage,type,life:.34}); if(pops.length>18)pops.shift();
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
    for(const pop of pops){
    c.save();
    c.globalAlpha = Math.min(1,pop.life*5);
    const x = pop.x, y = pop.y - (.34-pop.life)*42;
    c.fillStyle = pop.type === 'block' ? '#b7def0' : '#fff0b1';
    for (let i=0;i<8;i++) {
      const angle = i*Math.PI/4;
      const d = 4+(.34-pop.life)*40;
      c.fillRect(Math.round(x+Math.cos(angle)*d),Math.round(y+Math.sin(angle)*d),3,2);
    }
    c.font='bold 12px sans-serif'; c.textAlign='center';
    c.strokeStyle='#202129'; c.lineWidth=3;
    const label = pop.type === 'block' ? 'GUARD' : String(pop.damage);
    c.strokeText(label,x,y-12); c.fillText(label,x,y-12);
    c.restore();
    }
  }
  for (const input of ['pointerdown','input']) {
    root.document?.getElementById('bgmControls')?.addEventListener(input,()=>setTimeout(syncMusic,0));
  }
  function reset() { stop=shake=combo=comboTime=0; pops=[]; battle(null); }
  root.CombatFeedback = {move, impact, frame, transform, draw, battle, syncMusic, reset,
    swing:()=>varied('base_combat_swing',2), get combo(){return combo}};
})(window);
