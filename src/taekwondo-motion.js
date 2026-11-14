/* A106 first playable motion set: girl dobok punches and body block. */
(function (root) {
  'use strict';
  const sheets = {};
  const sequences = {
    punch1: {sheet: 'punch', row: 0, frames: [0, 1, 2, 3, 4], times: [65, 65, 55, 100, 120]},
    punch2: {sheet: 'punch', row: 1, frames: [0, 1, 2, 3, 4], times: [65, 65, 55, 100, 120]},
    guard: {sheet: 'guard', row: 0, frames: [0, 1, 2], times: [65, 65, 100]},
    kick1: {sheet: 'kick', row: 0, frames: [0, 1, 2, 3, 4], times: [65, 65, 60, 100, 120]},
    kick2: {sheet: 'kick', row: 1, frames: [0, 1, 2, 3, 4, 5, 6], times: [55, 55, 55, 55, 100, 55, 90]},
    kick3: {sheet: 'kick', row: 2, frames: [0, 1, 2, 3, 4, 5, 6], times: [55, 55, 55, 55, 100, 55, 90]},
    hit: {sheet: 'hit', row: 1, frames: [1, 2, 3], times: [85, 120, 85]},
    down: {sheet: 'player-down', row: 0, frames: [0, 1, 2, 3], times: [130, 150, 160, 1000]},
    release: {sheet: 'guard', row: 0, frames: [3, 4], times: [65, 65]}
  };
  function add(name, sheet, row, frames, strike = -1, reach = 0) {
    sequences[name] = {sheet, row, frames, times: frames.map((_, i) => i === strike ? 100 : 62), strike, reach};
  }
  add('punch3','hands',0,[0,1,2,3,4],3,34);
  add('punch4','hands',1,[0,1,2,3,4,5,6],5,37);
  add('finisher','hands',2,[0,1,2,3,4,5,6,7],5,43);
  add('elbow','heavy',0,[0,1,2,3,4,5],3,29);
  add('backKick','heavy',1,[0,1,2,3,4,5,6,7],5,44);
  add('axeKick','heavy',2,[0,1,2,3,4,5,6,7],5,41);
  add('guardBreaker','heavy',2,[0,1,2,3,4,5,6,7],5,37);
  sequences.guardBreaker.times=[65,75,85,80,70,85,110,175];
  add('airPunch','air',0,[0,1,2,3],2,34);
  add('riseKick','air',1,[0,1,3,4,5],2,43);
  add('fallKick','air',2,[0,1,3,4,5],2,41);
  add('launchKick','air',3,[0,1,2,3,4,5],3,43);
  add('blockImpact','guard',1,[0,1,2]);
  add('parry','guard',2,[0,1,2,3,4]);
  add('guardBreak','guard',3,[0,1,2,3,4,5]);
  add('hitHigh','hit',0,[0,1,2,3]);
  add('hitMid','hit',1,[0,1,2,3]);
  add('hitLow','hit',2,[0,1,2,3]);
  add('hitHeavy','hit',3,[0,1,2,3]);
  add('getUp','player-down',1,[0,1,2,3,4]);
  ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach((key,row) =>
    add(key,'evade',row,[0,1,2,3,4]));
  for (const [key,strike,reach] of [['punch1',3,33],['punch2',3,33],
    ['kick1',3,42],['kick2',4,42],['kick3',4,42]]) {
    Object.assign(sequences[key],{strike,reach});
  }
  const speed = root.CombatSettings.player;
  for (const [name, sequence] of Object.entries(sequences)) {
    const rate = /^(guard|release|blockImpact|parry|Arrow)/.test(name) ? speed.guardSpeed
      : /^(kick|finisher|riseKick|fallKick|launchKick|backKick|axeKick)/.test(name) ? speed.kickSpeed
      : /^(punch|airPunch|elbow)/.test(name) ? speed.punchSpeed : 1;
    sequence.times = sequence.times.map(ms => ms / Math.max(.1,rate));
  }
  const follow = {
    punch1:{KeyS:'punch2',KeyD:'kick1'}, punch2:{KeyS:'punch3',KeyD:'kick1'},
    punch3:{KeyS:'punch4',KeyD:'kick1'}, punch4:{KeyD:'finisher'},
    kick1:{KeyD:'kick2',KeyS:'punch1'}, kick2:{KeyD:'kick3',KeyS:'punch1'},
    kick3:{KeyS:'punch1'}
  };
  const chords = {'KeyA+KeyS':'elbow','KeyA+KeyD':'backKick','KeyD+KeyS':'axeKick'};
  const keys = new Map();
  const queue = [];
  let pending = null;
  let guardAt = -Infinity;
  let guardDirection;
  let lastJump = -Infinity;
  let airUsed = false;
  let state = null;
  let guardHeld = false;
  let actor = null;
  let scene = null;

  function load(name) {
    const image = new Image();
    const cells = root.CombatFrames[name];
    image.onload = () => {
      const height = name === 'player-down'
        ? cells[1][4].height
        : Math.max(...cells[0].filter(Boolean).map(cell => cell.height));
      sheets[name] = {image, cells, scale: 51 / height};
    };
    image.src = 'assets/characters/combat/' + name + '.webp?v=A108';
  }
  load('punch');
  load('guard');
  load('kick');
  load('hit');
  load('player-down');
  for (const name of ['hands','heavy','air','evade']) load(name);

  function reset() {
    state = null; guardHeld = false; pending = null; queue.length = 0; keys.clear(); guardAt = -Infinity;
  }
  function start(name, now, holdKey) {
    if (!sheets[sequences[name].sheet]) return;
    state = {name, at: now, reach: sequences[name].reach,holdKey,held:false};
    root.CombatFeedback?.move(name);
  }
  function eligible(player) {
    return root.CHARART?.selected === 'girl_main_dobok' &&
      !['eat', 'sit', 'bench', 'swing', 'climb'].includes(player.pose) && !player.playground;
  }
  function jump(player) {
    if (!eligible(player) || player.onGround) return;
    if (state?.held) state = null;
    lastJump = performance.now(); airUsed = false;
    if (pending?.code === 'KeyD' && lastJump - pending.at <= 65) {
      pending = null; queue.length = 0; airUsed = true; start('launchKick', lastJump, 'KeyD');
    }
  }
  function attack(code, now, player) {
    if (!player.onGround) {
      if (airUsed) return;
      airUsed = true;
      const rising = (player.alleyVelocity || -player.vy) > 0;
      start(code === 'KeyS' ? 'airPunch' : now - lastJump <= 110
        ? 'launchKick' : rising ? 'riseKick' : 'fallKick', now, code);
      return;
    }
    if (!state || ['guard','release'].includes(state.name)) {
      start(code === 'KeyS' ? 'punch1' : 'kick1', now, code);
    } else if (follow[state.name] && queue.length < 4) {
      queue.push(code);
    }
  }
  function keyDown(event, player, allowed, directions = new Set()) {
    const code = event.code;
    if (allowed && state?.held && code.startsWith('Arrow')) state = null;
    if (!['KeyS','KeyD','KeyA','KeyG'].includes(code) || !allowed || !eligible(player)) return false;
    if(code==='KeyG'&&(player.scene!=='back_alley'||root.AlleyEncounter?.status.phase!=='fight'))return false;
    event.preventDefault();
    if (event.repeat) return true;
    actor = player; scene = player.scene;
    const now = performance.now();
    if (['down','getUp','hitHigh','hitMid','hitLow','hitHeavy','guardBreak'].includes(state?.name)) return true;
    if(code==='KeyG'){
      if(player.onGround&&!pending&&(!state||state.held||state.name==='guard'||state.name==='release')){
        guardHeld=false;
        queue.length=0;
        start('guardBreaker',now);
      }
      return true;
    }
    if (pending && now - pending.at > 65) {
      attack(pending.code, now, player); pending = null;
    }
    const other = [...keys].find(([key,at]) => key !== code && now - at <= 65);
    keys.set(code,now);
    if (other && player.onGround && (!state || ['guard','release'].includes(state.name))) {
      const move = chords[[code,other[0]].sort().join('+')];
      if (move) {
        pending = null; queue.length = 0; start(move, now, code === 'KeyA' ? other[0] : code); return true;
      }
    }
    if (state?.held) state = null;
    if (code === 'KeyA') {
      if (player.onGround) {
        guardHeld = true; guardAt = now;
        guardDirection = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].find(key => directions.has(key));
        if (!state || state.name === 'release') start('guard', now);
      }
    } else if (!player.onGround || state && !['guard','release'].includes(state.name)) {
      attack(code, now, player);
    } else {
      if (pending) attack(pending.code,now,player);
      pending = {code,at:now};
    }
    return true;
  }
  function keyUp(event) {
    keys.delete(event.code);
    if (state?.held && state.holdKey === event.code) {
      state = null;
      if (guardHeld && actor?.onGround) start('guard', performance.now());
    }
    if (event.code !== 'KeyA') return;
    guardHeld = false;
    if (state?.name === 'guard') start('release', performance.now());
  }
  function defend(player, dx, dy) {
    if (state?.name !== 'guard' || !guardHeld || (player.dir === 0 ? -1 : 1) * dx > 0) return false;
    const now = performance.now();
    if (now - guardAt <= 160) {
      if (guardDirection) {
        const horizontal = guardDirection === 'ArrowLeft' ? -1 : guardDirection === 'ArrowRight' ? 1 : 0;
        const vertical = guardDirection === 'ArrowUp' ? -1 : guardDirection === 'ArrowDown' ? 1 : 0;
        const direction = player.dir;
        root.BackAlleyMap.walk(player,horizontal,vertical,.14);
        player.dir = direction;
        start(guardDirection, now);
      } else start('parry', now);
    } else start('blockImpact', now);
    return true;
  }
  function update(player, allowed, now = performance.now()) {
    if (!allowed || !eligible(player) || (scene && player.scene !== scene)) { reset(); return; }
    if (player.onGround) airUsed = false;
    if (pending && now - pending.at >= 65) {
      const code = pending.code; pending = null; attack(code, now, player);
    }
    if (!state) return;
    const duration = sequences[state.name].times.reduce((sum, time) => sum + time, 0);
    // Chain after contact rather than waiting through every recovery pose.
    const seq=sequences[state.name];
    const cancelAt=seq.strike>=0 ? seq.times.slice(0,seq.strike+1).reduce((a,b)=>a+b,0)+25 : duration;
    if(queue.length && now-state.at>=cancelAt && player.onGround){
      const next=follow[state.name]?.[queue[0]];
      if(next){const code=queue.shift();start(next,now,code);return;}
    }
    if (now - state.at < duration) return;
    const input = queue.shift();
    const next = follow[state.name]?.[input];
    if (next && player.onGround) { start(next, now, input); return; }
    queue.length = 0;
    if (state.holdKey && keys.has(state.holdKey)) { state.held = true; return; }
    if (state.name === 'down') { start('getUp', now); return; }
    if (guardHeld && player.onGround) {
      if (state.name !== 'guard') start('guard', now);
    } else state = null;
  }
  function draw(context, id, x, foot, direction, now, actorKey) {
    if (actorKey !== 'local' || id !== 'girl_main_dobok' || !state || !actor) return false;
    const sequence = sequences[state.name];
    const sheet = sheets[sequence.sheet];
    if (!sheet) return false;
    let elapsed = now - state.at;
    let index = 0;
    while (index < sequence.times.length - 1 && elapsed >= sequence.times[index]) {
      elapsed -= sequence.times[index++];
    }
    const cell = sheet.cells[sequence.row][sequence.frames[index]];
    if (!cell) return false;
    context.save();
    context.imageSmoothingEnabled = false;
    context.translate(x, foot);
    if (direction === 0) context.scale(-1, 1);
    context.drawImage(sheet.image, cell.x, cell.y, cell.width, cell.height,
      (cell.x - cell.anchorX) * sheet.scale, (cell.y - cell.anchorY) * sheet.scale,
      cell.width * sheet.scale, cell.height * sheet.scale);
    context.restore();
    return true;
  }
  function react(name, player) {
    reset();
    actor = player; scene = player.scene;
    start(name, performance.now());
  }
  root.TaekwondoMotion = {react, jump, defend, freeze(ms) { if (state) state.at += ms; }, get windup() {
    if (!state || state.held) return null;
    const {strike,times} = sequences[state.name];
    if (!(strike >= 0)) return null;
    const contact = times.slice(0,strike).reduce((sum,time)=>sum+time,0);
    return performance.now()-state.at < contact ? state : null;
  }, get impact() {
    if (!state || state.held) return null;
    const {strike,times} = sequences[state.name];
    if (!(strike >= 0)) return null;
    const start = times.slice(0,strike).reduce((sum,time) => sum+time,0);
    const elapsed = performance.now() - state.at;
    return elapsed >= start && elapsed < start + times[strike] ? state : null;
  }, keyDown, keyUp, update, draw, reset,
    get active() { return !!state; }, get motion() { return state?.name || null; }};
  root.addEventListener('blur', reset);
  root.addEventListener('arcade-focus-change', reset);
})(window);
