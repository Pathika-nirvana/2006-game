(function (root) {
 'use strict';
 const capacity = 8;
 const stats = {
  attack: {label: '공격력', text: '공격'},
  defense: {label: '받는 피해', text: '방어'},
  speed: {label: '이동속도', text: '이속'}
 };
 // Values are game balance only. Durations use active gameplay seconds.
 const catalog = [
  {id:'cream_bread', name:'크림빵', price:500, heal:26, limit:3, seconds:1.25, color:'#ca833d', wrap:'bread'},
  {id:'triangle_rice', name:'참치마요 삼각김밥', price:800, heal:48, limit:2, seconds:1.9, color:'#526c50', wrap:'rice'},
  {id:'red_ginseng', name:'홍삼 음료', price:600, attack:.25, duration:18, limit:2, seconds:1.25, color:'#ad4c40', wrap:'bottle'},
  {id:'soy_milk', name:'검은콩 두유', price:600, defense:.25, duration:20, limit:2, seconds:1.25, color:'#8c7452', wrap:'carton'},
  {id:'sports_drink', name:'이온음료', price:500, speed:.20, duration:20, limit:2, seconds:1.25, color:'#408799', wrap:'bottle'},
  {id:'chocolate_milk', name:'초코우유', price:700, heal:12, attack:.15, speed:.12, duration:16, limit:2, seconds:1.35, color:'#774938', wrap:'carton'}
 ].map(item => Object.freeze({...item,kind:item.id,line:item.name+'을 먹었다.'}));
 const items = new Map(catalog.map(item => [item.id,item]));
 const effects = new Map();

 function describe(item) {
  const pieces = item.heal ? ['체력 +'+item.heal] : [];
  for (const [stat, info] of Object.entries(stats)) {
   if (item[stat]) pieces.push(info.label+(stat==='defense'?' −':' +')+Math.round(item[stat]*100)+'% ('+item.duration+'초)');
  }
  return pieces.join(' · ');
 }
 function apply(item, player) {
  const healed = item.heal ? root.AlleyEncounter?.heal(item.heal, player) || 0 : 0;
  for (const stat of Object.keys(stats)) {
   if (item[stat]) effects.set(stat,{value:item[stat], remaining:item.duration});
  }
  const notes = [];
  if (healed) notes.push('체력 +'+healed);
  else if(item.heal) notes.push('체력 최대');
  for (const [stat, info] of Object.entries(stats)) {
   if(item[stat]) notes.push(info.text+' '+item.duration+'초');
  }
  return notes.length ? ' · '+notes.join(' · ') : '';
 }
 function tick(dt) {
  for (const [stat, effect] of effects) {
   effect.remaining -= dt;
   if (effect.remaining <= 0) effects.delete(stat);
  }
 }
 function multiplier(stat) {
  const value = effects.get(stat)?.value || 0;
  return stat === 'defense' ? 1-value : 1+value;
 }
 function status() {
  return Array.from(effects,([stat, effect])=>stats[stat].text+' '+Math.ceil(effect.remaining)+'초').join(' · ');
 }
 function cancelEating(player) {
  if (player.pose !== 'eat') return false;
  player.pose = 'stand';
  player.eatRemaining = 0;
  player.eatingItem = null;
  return true;
 }
 root.CombatItems = {
  catalog, capacity, get:id=>items.get(id), describe, apply, tick, multiplier, status,
  cancelEating, clear:()=>effects.clear()
 };
})(window);
