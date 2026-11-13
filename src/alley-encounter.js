/* Local encounter. Each definition supplies its spawn, dialogue and combat tuning. */
(function (root) {
  'use strict';
  const definition = {
    scene: 'back_alley', x: 680, y: 252, name: '불량학생',
    demand: '야, 잠깐 와 봐. 동전 100원만 줘 봐.', price: 100, health: 5
  };
  const atlas = {};
  const animations = {
    idle: ['fight', [5], .34], beckon: ['idle', [3, 4, 5], .25],
    walk: ['idle', [6, 7, 8, 9], .105], ready: ['fight', [5], .2],
    kick: ['fight', [0, 1, 2], .18], punch: ['fight', [3, 4, 5], .18],
    hit: ['fight', [8, 7, 5], .105], down: ['down', [0, 1, 2], .18]
  };
  function load(name, standingHeight) {
    const image = new Image();
    const frames = root.CombatFrames['bully-' + name].flat();
    image.onload = () => { atlas[name] = {image, frames, scale: 82 / standingHeight}; };
    image.src = 'assets/characters/combat/bully-' + name + '.webp?v=A108';
  }
  load('idle', 375);
  load('fight', 349);
  load('down', 495);
  const npc = {};
  let phase, motion, age, cooldown, playerHealth, strikes, attackLanded;
  function animate(name) {
    if (motion !== name) { motion = name; age = 0; }
  }
  function reset() {
    Object.assign(npc, {x: definition.x, y: definition.y, dir: -1, health: definition.health});
    phase = 'idle'; motion = 'idle'; age = 0; cooldown = 0;
    playerHealth = 5; strikes = 0; attackLanded = false;
  }
  reset();
  function approach(player, dt, speed) {
    const dx = player.x - npc.x;
    const dy = player.alleyFloorY - npc.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 18 && Math.abs(dy) <= 10) return;
    const step = Math.min(distance, speed * dt);
    npc.x = Math.max(18, Math.min(702, npc.x + dx / distance * step));
    const {top, bottom} = root.BackAlleyMap.bounds(npc.x);
    npc.y = Math.max(top, Math.min(bottom, npc.y + dy / distance * step));
  }
  function update(dt, player, ui) {
    if (player.scene !== definition.scene || !atlas.idle || !atlas.fight || !atlas.down) return;
    age += dt;
    cooldown = Math.max(0, cooldown - dt);
    const dx = player.x - npc.x;
    const dy = player.alleyFloorY - npc.y;
    const distance = Math.hypot(dx, dy);
    if (!['down','kick','punch','hit'].includes(motion) && Math.abs(dx) > 2) npc.dir = Math.sign(dx);
    if (phase === 'idle' && distance < 124) {
      phase = 'beckon'; animate('beckon');
    } else if (phase === 'beckon' && age >= .75) {
      phase = 'approach'; animate('walk');
    } else if (phase === 'approach') {
      if (distance > 210) { reset(); return; }
      approach(player, dt, 64);
      if (distance <= 27 && Math.abs(dy) <= 11 && player.onGround) {
        phase = 'choice'; animate('beckon');
        ui.ask(definition, choose);
      }
    } else if (phase === 'fight') {
      const playerMotion = root.TaekwondoMotion;
      if (playerMotion?.impact && playerMotion.impact !== attackLanded) {
        attackLanded = playerMotion.impact;
        const facing = player.dir === 0 ? -1 : 1;
        if (distance <= playerMotion.impact.reach * root.BackAlleyMap.scale(player.alleyFloorY) / 1.3 &&
            Math.abs(dy) <= 13 && dx * facing <= 0) {
          npc.health--;
          if (npc.health <= 0) {
            phase = 'won'; animate('down');
            ui.notice('불량학생이 쓰러졌다.');
            return;
          }
          animate('hit'); cooldown = .45;
        }
      }
      if (motion === 'hit' && age < .32) return;
      if (motion === 'kick' || motion === 'punch') {
        if (age >= .18 && age - dt < .18 && dx * npc.dir >= 0 &&
            distance <= 36 && Math.abs(dy) <= 12 && player.onGround) {
          if (playerMotion?.defend(player, dx, dy)) ui.notice('받아냈다!');
          else {
            playerHealth--;
            playerMotion?.react(playerHealth ? (motion === 'kick' ? 'hitLow' : 'hitMid') : 'down', player);
            if (!playerHealth) { phase = 'lost'; animate('ready'); ui.notice('쓰러졌다. 골목 입구로 물러난다.'); return; }
          }
        }
        if (age < .54) return;
        animate('ready');
      }
      if (distance > 27 || Math.abs(dy) > 10) {
        animate('walk'); approach(player, dt, 74);
      } else if (!cooldown) {
        animate(strikes++ % 2 ? 'kick' : 'punch'); cooldown = 1.05;
      } else animate('ready');
    } else if (phase === 'lost' && age > 1.85) {
      player.x = 52; root.BackAlleyMap.enter(player, 255);
      root.TaekwondoMotion?.reset();
      reset();
    }
    function choose(choice) {
      if (phase !== 'choice') return false;
      if (choice === 'pay') {
        if (!ui.pay(definition.price)) return false;
        phase = 'paid'; animate('idle');
        ui.notice('100원을 건넸다. 불량학생이 물러났다.');
      } else {
        phase = 'fight'; animate('ready'); cooldown = .55;
        ui.notice(root.CHARART?.selected === 'girl_main_dobok' ?
          '전투 시작 · S 정권 · D 발차기 · A 막기' : '전투 시작 · 공격하려면 여학생 태권도복을 선택해야 한다.');
      }
      return true;
    }
  }
  function draw(c) {
    const [sheet, frames, delay] = animations[motion];
    const source = atlas[sheet];
    if (!source) return;
    const elapsed = Math.floor(age / delay);
    const looping = ['idle','walk','beckon'].includes(motion);
    const index = looping ? elapsed % frames.length : Math.min(elapsed, frames.length-1);
    const frame = source.frames[frames[index]];
    if (!frame) return;
    const scale = source.scale * root.BackAlleyMap.scale(npc.y);
    c.save();
    c.imageSmoothingEnabled = false;
    c.translate(Math.round(npc.x), Math.round(npc.y)); c.scale(npc.dir, 1);
    c.drawImage(source.image, frame.x, frame.y, frame.width, frame.height,
      (frame.x - frame.anchorX) * scale, (frame.y - frame.anchorY) * scale,
      frame.width * scale, frame.height * scale);
    c.restore();
  }
  root.AlleyEncounter = {reset, update, draw, get choosing(){return phase === 'choice';},
    get status(){return {phase, motion, playerHealth, ...npc};}};
})(window);
