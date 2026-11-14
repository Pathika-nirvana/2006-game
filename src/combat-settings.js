/* 저장한 뒤 게임을 새로고침하면 반영된다. 단위는 체력 점수, 배율, 초. */
window.CombatSettings = {
  player: {
    health: 100, attack: 16, defense: 3, hurtInvulnerability: 0.65,
    punchSpeed: 1.5, kickSpeed: 1.4, guardSpeed: 1.3
  },
  bully: {
    health: 175, attack: 19, defense: 5,
    attackSpeed: 1.25, attackInterval: 0.82,
    guardDuration: 0.4, guardCooldown: 0.85
  },
  dashMultiplier: 1.8,
  bosses: {
    underboss: {health:820, defense:10, attack:31, speed:96, guardChance:.88, comboLimit:3, punishWindow:1.25,
      punchWindup:.22, kickWindup:.32, punchReach:38, kickReach:54, recovery:.19, interval:.32},
    boss: {health:1250, defense:14, exhaustedDefense:1, attack:35, speed:72,
      punchWindup:.55, kickWindup:.70, punchReach:42, kickReach:61, recovery:.55, interval:.8,
      chargeCost:7, bellyCost:10, punchCost:1, kickCost:2, riseCost:1,
      chargeTell:.72, chargeSpeed:760, chargeHalfWidth:6, chargeDamage:36,
      bellyTell:.70, airTime:.66, bellyRadiusX:48, bellyRadiusY:12,
      bellyDamageFraction:.80, landRecovery:1.25}
  },
  group: {rushHealth: .30, rushAttackers: 3, rushSpacing: .13, turnPause: .32, approachTimeout: 2.8},
  hitStop: 0.055,
  shake: 2.8,
  soundVolume: 0.60
};
