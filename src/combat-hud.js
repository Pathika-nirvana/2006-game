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
  function update(scene) {
    const state = root.AlleyEncounter.status;
    const config = root.CombatSettings;
    const inFight = scene === 'back_alley' && ['fight','won','lost'].includes(state.phase);
    hud.hidden = !inFight && state.playerHealth >= config.player.health;
    if (hud.hidden) return;
    hud.querySelector('.fight-vital').style.opacity = state.playerHealth < config.player.health*.25 ? '.85' : '1';
    value.textContent = state.playerHealth+' / '+config.player.health;
    fill.style.width = 100*state.playerHealth/config.player.health+'%';
    const hits = root.CombatFeedback.combo;
    chain.hidden = !inFight || hits < 1;
    chain.querySelector('b').textContent = hits;
  }
  root.CombatHUD = {update};
})(window);
