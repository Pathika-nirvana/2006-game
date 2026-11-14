(function(root) {
  'use strict';
  const hud = document.createElement('div');
  hud.id = 'combatHud';
  hud.hidden = true;
  hud.innerHTML = '<div class="fight-vital"><div class="vital-title"><b>나</b><span class="vital-value"></span></div><div class="vital-track"><i></i></div></div><div class="enemy-labels"></div><strong class="fight-chain" hidden><span>COMBO</span><b></b><i class="chain-timer" aria-hidden="true"></i></strong>';
  const canvas = document.getElementById('game');
  canvas.parentNode.append(hud);
  const value = hud.querySelector('.vital-value');
  const fill = hud.querySelector('.vital-track i');
  const chain = hud.querySelector('.fight-chain');
  const chainCount=chain.querySelector('b');
  const quick=document.getElementById('quickFoodHud');
  const quickName=quick.querySelector('b');
  const quickCount=quick.querySelector('strong');
  const reducedMotion=root.matchMedia?.('(prefers-reduced-motion: reduce)');
  function update(scene) {
    const state = root.AlleyEncounter.status;
    const config = root.CombatSettings;
    const inFight = (scene === 'back_alley' && ['fight','won','lost'].includes(state.phase)) || (scene==='hidden_alley' && ['fight','interval','won','lost'].includes(root.BossEncounter?.status.phase));
    const food = inFight ? root.SHOPS.quickFood() : null;
    quick.hidden = !food;
    if(food){
      quickName.textContent=food.name;
      quickCount.textContent='×'+food.count;
      quick.title=food.bites>1?food.bites+'입 남음':'한 입에 먹기';
    }
    hud.hidden = !inFight && state.playerHealth >= config.player.health;
    if (hud.hidden) return;
    hud.querySelector('.fight-vital').style.opacity = state.playerHealth < config.player.health*.25 ? '.85' : '1';
    value.textContent = state.playerHealth+' / '+config.player.health;
    fill.style.width = 100*state.playerHealth/config.player.health+'%';
    const combo = root.CombatFeedback.chain;
    chain.hidden = !inFight || combo.hits < 1;
    if (chain.hidden) return;
    chainCount.textContent = combo.hits;
    const pulse = reducedMotion?.matches ? 0 : Math.max(0,1-combo.age/.22)**2;
    chain.style.setProperty('--chain-scale',1+pulse*(combo.accent?.45:.28));
    chain.style.setProperty('--chain-lift',-pulse*5+'px');
    chain.style.setProperty('--chain-life',100*combo.remaining+'%');
    chain.classList.toggle('chain-accent',combo.accent);
  }
  const buffs = document.getElementById('buffStatus');
  const buffRows = new Map();
  const icons = {attack:'▲',defense:'◆',speed:'»'};
  function updateBuffs() {
    const active = root.CombatItems.status();
    buffs.hidden = active.length === 0;
    for (const [stat, row] of buffRows) {
      if (!active.some(effect => effect.stat === stat)) {
        row.remove();
        buffRows.delete(stat);
      }
    }
    for (const effect of active) {
      let row = buffRows.get(effect.stat);
      if (!row) {
        row = document.createElement('div');
        row.className = 'buff-row buff-'+effect.stat;
        row.innerHTML = '<span class="buff-icon" aria-hidden="true"></span><span class="buff-name"></span><b class="buff-value"></b><span class="buff-time"></span><i class="buff-track" aria-hidden="true"></i>';
        row.querySelector('.buff-icon').textContent = icons[effect.stat];
        row.querySelector('.buff-name').textContent = effect.label;
        buffs.append(row);
        buffRows.set(effect.stat, row);
      }
      row.querySelector('.buff-value').textContent = effect.value;
      row.querySelector('.buff-time').textContent = effect.seconds+'초';
      row.style.setProperty('--buff-remaining',100*effect.fraction+'%');
    }
  }
  root.CombatHUD = {update,updateBuffs};
})(window);
