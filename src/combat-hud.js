(function(root) {
  'use strict';
  const hud = document.createElement('div');
  hud.id = 'combatHud';
  hud.hidden = true;
  hud.innerHTML = '<div class="fight-vital"><div class="vital-title"><b>나</b><span class="vital-value"></span></div><div class="vital-track"><i></i></div></div><div class="enemy-labels"></div><strong class="fight-chain" hidden><span>COMBO</span><b></b></strong>';
  const canvas = document.getElementById('game');
  canvas.parentNode.append(hud);
  const value = hud.querySelector('.vital-value');
  const fill = hud.querySelector('.vital-track i');
  const chain = hud.querySelector('.fight-chain');
  const labels = hud.querySelector('.enemy-labels');
  const nodes = new Map();
  function paintEnemies(enemies, camera) {
    const placed = [];
    const visible = new Set();
    for (const enemy of enemies) {
      if (enemy.health <= 0 || enemy.x < camera-12 || enemy.x > camera+492) continue;
      visible.add(enemy.id);
      let node = nodes.get(enemy.id);
      if (!node) {
        node = document.createElement('div');
        node.className = 'enemy-label';
        node.innerHTML = '<b></b><i><em></em></i>';
        labels.append(node);
        nodes.set(enemy.id,node);
      }
      const width = Math.min(100,Math.max(54,canvas.clientWidth*.085));
      const minX = width/2+4, maxX = canvas.clientWidth-minX;
      const clampX = x => Math.max(minX,Math.min(maxX,x));
      const preferredX = clampX((enemy.x-camera)*canvas.clientWidth/480);
      const preferredY = Math.max(42,(enemy.y-enemy.height-6)*canvas.clientHeight/270);
      const height = 23;
      let x = preferredX, y = preferredY;
      const clear = (x,y)=>placed.every(other=>Math.abs(other.x-x)>=width+4 || Math.abs(other.y-y)>=height);
      search: for (let row=0; row<8; row++) {
        const candidateY = preferredY-row*height;
        if (candidateY < 42) break;
        for (const delta of [0,-1,1,-2,2,-3,3]) {
          const candidateX = clampX(preferredX+delta*(width+4));
          if (!clear(candidateX,candidateY)) continue;
          x = candidateX; y = candidateY; break search;
        }
      }
      placed.push({x,y});
      node.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+width+'px';
      node.querySelector('b').textContent = enemy.name;
      node.querySelector('em').style.width = 100*enemy.health/enemy.maxHealth+'%';
    }
    for (const [id,node] of nodes) if (!visible.has(id)) { node.remove(); nodes.delete(id); }
  }
  function update(scene, camera) {
    const state = root.AlleyEncounter.status;
    hud.hidden = scene !== 'back_alley' || !['fight','won','lost'].includes(state.phase);
    if (hud.hidden) { paintEnemies([], camera); return; }
    const config = root.CombatSettings;
    hud.querySelector('.fight-vital').style.opacity = state.playerHealth < config.player.health*.25 ? '.85' : '1';
    value.textContent = state.playerHealth+' / '+config.player.health;
    fill.style.width = 100*state.playerHealth/config.player.health+'%';
    paintEnemies(state.phase==='fight' ? root.AlleyEncounter.targets : [],Math.round(camera));
    const hits = root.CombatFeedback.combo;
    chain.hidden = hits < 1;
    chain.querySelector('b').textContent = hits;
  }
  root.CombatHUD = {update};
})(window);
