/* 저장한 뒤 게임을 새로고침하면 반영된다. 단위는 체력 점수, 배율, 초. */
window.CombatSettings = {
  player: {
    health: 100, attack: 16, defense: 3, hurtInvulnerability: 0.65,
    punchSpeed: 1.5, kickSpeed: 1.4, guardSpeed: 1.3
  },
  bully: {
    health: 155, attack: 19, defense: 4,
    attackSpeed: 1.25, attackInterval: 0.82,
    guardChance: 0.38, guardDuration: 0.48, guardCooldown: 1.35
  },
  group: {maxAttackers: 2, attackSpacing: 0.48},
  hitStop: 0.055,
  shake: 2.8,
  soundVolume: 0.60
};
