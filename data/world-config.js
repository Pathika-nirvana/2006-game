window.WorldConfig = {
  "version": 1,
  "settings": {
    "player": {
      "health": 100,
      "attack": 16,
      "defense": 3,
      "hurtInvulnerability": 0.65,
      "punchSpeed": 1.5,
      "kickSpeed": 1.4,
      "guardSpeed": 1.3,
      "size": 1,
      "moveSpeed": 1
    },
    "bully": {
      "health": 175,
      "attack": 19,
      "defense": 5,
      "attackSpeed": 1.25,
      "attackInterval": 0.82,
      "guardDuration": 0.4,
      "guardCooldown": 0.85
    },
    "dashMultiplier": 1.8,
    "bosses": {
      "underboss": {
        "health": 820,
        "defense": 10,
        "attack": 31,
        "speed": 96,
        "guardChance": 0.88,
        "comboLimit": 3,
        "punishWindow": 1.25,
        "punchWindup": 0.22,
        "kickWindup": 0.32,
        "punchReach": 38,
        "kickReach": 54,
        "recovery": 0.19,
        "interval": 0.32
      },
      "boss": {
        "health": 1250,
        "defense": 14,
        "exhaustedDefense": 1,
        "attack": 35,
        "speed": 72,
        "punchWindup": 0.55,
        "kickWindup": 0.7,
        "punchReach": 42,
        "kickReach": 61,
        "recovery": 0.55,
        "interval": 0.8,
        "chargeCost": 7,
        "bellyCost": 10,
        "punchCost": 1,
        "kickCost": 2,
        "riseCost": 1,
        "chargeTell": 0.72,
        "chargeSpeed": 760,
        "chargeHalfWidth": 6,
        "chargeDamage": 36,
        "bellyTell": 0.7,
        "airTime": 0.66,
        "bellyRadiusX": 48,
        "bellyRadiusY": 12,
        "bellyDamageFraction": 0.8,
        "landRecovery": 1.25
      }
    },
    "group": {
      "rushHealth": 0.3,
      "rushAttackers": 3,
      "rushSpacing": 0.13,
      "turnPause": 0.32,
      "approachTimeout": 2.8
    },
    "hitStop": 0.055,
    "shake": 2.8,
    "soundVolume": 0.6
  },
  "enemies": [
    {
      "id": "original",
      "skin": "original",
      "name": "민수 · 골목 문지기",
      "x": 680,
      "y": 252,
      "rate": 1,
      "attack": 1,
      "role": "counter",
      "scene": "back_alley",
      "size": 1,
      "health": 175,
      "defense": 5,
      "attackPower": 19,
      "speed": 1,
      "lines": [
        "문방구 아주머니 나오면 담배 내려. 알았지?",
        "뒷골목은 진태 형 구역이야. 괜히 가지 마.",
        "돈 걷는 건 나만 시키냐. 너희도 좀 해."
      ],
      "demand": "잠깐. 그냥 보내면 뒤에서 또 붙잡혀. 백 원만 빌려 줘. 갚는 건… 나중에."
    },
    {
      "id": "boy1",
      "skin": "boy1",
      "name": "재욱 · 축구부 탈락생",
      "x": 610,
      "y": 244,
      "rate": 1.04,
      "attack": 1,
      "role": "kicker",
      "scene": "back_alley",
      "size": 1,
      "health": 175,
      "defense": 5,
      "attackPower": 19,
      "speed": 1,
      "lines": [
        "공 가져오랬더니 또 빈손이냐?",
        "저 폐교 담 넘으면 공 세 개는 나온다니까.",
        "지난번엔 네가 무섭다고 먼저 뛰었잖아."
      ],
      "demand": "공 살 돈 모으는 중이야. 너도 백 원 보태. 싫어? 그럼 다른 걸로 내든가."
    },
    {
      "id": "boy2",
      "skin": "boy2",
      "name": "성호 · 눈치 보는 친구",
      "x": 558,
      "y": 257,
      "rate": 0.91,
      "attack": 0.92,
      "role": "counter",
      "scene": "back_alley",
      "size": 1,
      "health": 175,
      "defense": 5,
      "attackPower": 17.48,
      "speed": 1,
      "lines": [
        "…그 골목, 어제는 계단이 하나 더 있었어.",
        "진태 형한테도 말했는데 안 믿더라.",
        "난 해 지기 전엔 갈 거야."
      ],
      "demand": "…미안. 그냥 보내면 내가 혼나. 백 원만 주고 가면 안 되냐."
    },
    {
      "id": "boy3",
      "skin": "boy3",
      "name": "기범 · 허세쟁이",
      "x": 642,
      "y": 261,
      "rate": 0.94,
      "attack": 1.13,
      "bonusHealth": 20,
      "role": "kicker",
      "scene": "back_alley",
      "size": 1,
      "health": 195,
      "defense": 5,
      "attackPower": 21.47,
      "speed": 1,
      "lines": [
        "형들이 나만 보면 같이 다니자고 그래.",
        "내가 무서워서 안 가는 게 아니라, 귀찮아서.",
        "야, 방금 뒤에서 누가 부르지 않았냐?"
      ],
      "demand": "여기 지나가는 애들은 다 나 알아. 너도 인사값 정도는 내야지?"
    },
    {
      "id": "girl1",
      "skin": "girl1",
      "name": "유진 · 소문통",
      "x": 506,
      "y": 244,
      "rate": 1.13,
      "attack": 0.88,
      "role": "flanker",
      "scene": "back_alley",
      "size": 1,
      "health": 175,
      "defense": 5,
      "attackPower": 16.72,
      "speed": 1,
      "lines": [
        "기범아. 너 어제 큰형 보고 존댓말 했잖아.",
        "폐교 시계가 네 시 삼십이 분에 멈췄대.",
        "민수 너, 동생 문방구에서 기다린다던데?"
      ],
      "demand": "남들 쳐다보지 말고. 네 얘기 하는 거야. 백 원이면 조용히 지나가."
    },
    {
      "id": "girl2",
      "skin": "girl2",
      "name": "혜리 · 구경꾼",
      "x": 470,
      "y": 258,
      "rate": 1.02,
      "attack": 0.96,
      "role": "flanker",
      "scene": "back_alley",
      "size": 1,
      "health": 175,
      "defense": 5,
      "attackPower": 18.24,
      "speed": 1,
      "lines": [
        "집에 간다던 애가 또 여기 있네.",
        "그만 놀려. 성호 진짜 표정 안 좋아.",
        "누가 오면 비켜 줘. 길 막고 뭐 하냐."
      ],
      "demand": "길은 비켜 줄게. 대신 민수한테 백 원은 줘. 귀찮게 굴기 시작하면 끝도 없거든."
    }
  ],
  "bosses": [
    {
      "kind": "underboss",
      "name": "진태 · 슬리퍼",
      "scene": "hidden_alley",
      "x": 425,
      "y": 250,
      "size": 1,
      "lines": [
        "동철 형. 애들 돈 걷는 거, 아주머니 귀에 들어갔어.",
        "여기서 끝내. 담 넘어가면 나도 못 데려와.",
        "슬리퍼라고 얕보지 마. 발은 멀쩡하니까."
      ],
      "demand": "민수한테 얘기 들었다. 걔들 이겼다고 이 골목까지 네 길인 줄 아냐? 나부터 넘어 봐."
    },
    {
      "kind": "boss",
      "name": "동철 · 큰형",
      "scene": "hidden_alley",
      "x": 590,
      "y": 250,
      "size": 1,
      "lines": [
        "진태야, 말 길게 하지 마. 숨차게.",
        "너도 들었냐? 학교 쪽에서 종 치는 거.",
        "문 닫은 학교에서 누가 출석을 부르냐."
      ],
      "demand": "진태가 물러났다고 나까지 비킬 줄 알았냐. 피할 수 있으면 피해 봐."
    }
  ],
  "lore": [
    {
      "scene": "alley_d1",
      "x": 300,
      "y": 250,
      "title": "젖은 학원 전단",
      "text": "영어·수학 단과반. 뒷면에 볼펜 글씨가 있다. “성호야, 뒤로 돌아오지 말고 큰길로 와. 또 늦으면 네 자리 없어.”",
      "effect": "note"
    },
    {
      "scene": "alley_d3",
      "x": 450,
      "y": 250,
      "title": "담벼락의 분필 화살표",
      "text": "흰 화살표 위에 다른 방향의 화살표가 겹쳐 있다. “비 오면 지워진다. 대문 색깔로 외워.” 누군가 돌아갈 길을 표시했던 걸까.",
      "effect": "chalk"
    },
    {
      "scene": "alley_d4",
      "x": 355,
      "y": 250,
      "title": "끊어진 전화선",
      "text": "“수신은 됨.” 메모가 붙어 있다. 수화기를 들자 바람 소리만 난다. 그 뒤에서 누군가 성호의 이름을 불렀다.",
      "effect": "whisper"
    },
    {
      "scene": "alley_d6",
      "x": 400,
      "y": 250,
      "title": "철거 통지서",
      "text": "철거 예정일은 2006년 8월 32일. 숫자를 긁자 아래에서 똑같은 날짜가 또 나타난다.",
      "effect": "whisper"
    },
    {
      "scene": "alley_d8",
      "x": 380,
      "y": 250,
      "title": "구겨진 출석부 조각",
      "text": "이름 칸에는 진태와 동철. 출결 칸에는 같은 문장만 반복된다. “아직 돌아오지 않음.” 오른쪽 담 너머에서 종이 울렸다.",
      "effect": "note"
    },
    {
      "scene": "alley_d10",
      "x": 420,
      "y": 250,
      "title": "고장 난 교문 초인종",
      "text": "전선이 끊어져 있는데 눌린다. 한 번 울리면 복도 끝에서, 두 번 울리면 교실 안에서, 세 번 울리면 바로 뒤에서 소리가 난다고 누군가 적어 놓았다.",
      "effect": "bell"
    },
    {
      "scene": "alley_d11_1",
      "x": 360,
      "y": 250,
      "title": "뒤집힌 이름표",
      "text": "이름표를 뒤집었다. 방금까지 비어 있던 칠판에 “한 명 결석”이 보인다. 누군가 복도에서 의자를 끈다.",
      "effect": "attendance"
    }
  ]
};
