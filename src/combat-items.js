(function (root) {
 'use strict';
 const capacity = 16;
 const stats = {
  attack: {label: '공격력', text: '공격'},
  defense: {label: '받는 피해', text: '방어'},
  speed: {label: '이동속도', text: '이속'}
 };
 const stationery = {
  zzon: {heal:26},
  cola: {attack:.25,duration:18},
  chikani: {defense:.25,duration:20},
  pill: {heal:48,seconds:1.9},
  straw: {speed:.20,duration:20},
  fish: {heal:12,attack:.15,speed:.12,duration:16}
 };
 const meals = {
  tteok: {attack:.30,duration:165},
  odeng: {defense:.20,duration:195},
  slushred: {speed:.24,duration:135},
  slushblue: {defense:.15,speed:.16,duration:150},
  skewer: {attack:.22,speed:.12,duration:150},
  fry: {attack:.18,defense:.18,duration:180},
  sundae: {defense:.30,duration:210},
  gimmari: {defense:.12,speed:.18,duration:165},
  hotdog: {attack:.32,duration:180},
  broth: {defense:.15,duration:120}
 };
 const retiredPrices = {
  cream_bread:500,triangle_rice:800,red_ginseng:600,soy_milk:600,sports_drink:500,chocolate_milk:700
 };
 function get(id) {
  return Object.hasOwn(stationery,id) ? stationery[id] : Object.hasOwn(meals,id) ? meals[id] : undefined;
 }
 function limit(id) { return Object.hasOwn(stationery,id) ? 6 : 4; }
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
   if (item[stat]) effects.set(stat,{value:item[stat], remaining:item.duration, duration:item.duration});
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
  return Array.from(effects,([stat, effect])=>({
   stat,label:stats[stat].label,
   value:(stat==='defense'?'−':'+')+Math.round(effect.value*100)+'%',
   seconds:Math.ceil(effect.remaining),
   fraction:effect.remaining/effect.duration
  }));
 }
 function cancelEating(player) {
  if (player.pose !== 'eat') return false;
  player.pose = 'stand';
  player.eatRemaining = 0;
  player.eatingItem = null;
  return true;
 }
 root.CombatItems = {
  capacity, get, limit, retiredPrices, describe, apply, tick, multiplier, status,
  cancelEating, clear:()=>effects.clear()
 };
})(window);
