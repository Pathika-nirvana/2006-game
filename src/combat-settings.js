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
  group: {rushHealth: .30, rushAttackers: 3, rushSpacing: .13, turnPause: .32, approachTimeout: 2.8},
  hitStop: 0.055,
  shake: 2.8,
  soundVolume: 0.60
};
