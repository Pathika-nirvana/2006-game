2006_A126 덮어쓰기 패치 (버전 0.126.0, 2026-11-18 22:38 한국시간)

이 압축 파일에는 A125에서 바뀌거나 새로 생긴 파일 33개만 들어 있습니다.
A125 게임 폴더(index.html이 있는 곳) 맨 위에 그대로 풀어서 덮어쓰면 A126이 됩니다.

[꼭 할 일]
- 서버 파일이 바뀌었습니다(server.js 고침, server_arcade.js 새로 생김). 켜 둔 서버를 껐다가 다시 켜 주세요.
  그래야 문방구 오락기 「동네 태권 대전」 온라인 2인 대전이 됩니다. 브라우저는 새로 고침 한 번.
- 운영 서버(Render)에는 올리지 않았습니다. 친구들과 같이 하려면 바뀐 파일을 운영 서버에도 올려 주세요.
  서버 파일 두 개와 새 폴더 assets/vh(그림 아홉 장과 제목 음악)도 꼭 같이 올려야 합니다.
- index.html을 파일로 바로 열어서 혼자 할 때도 반 헬싱 그림과 음악, 큰 액정, 신맞고는 그대로 됩니다.
  온라인 대전만 서버가 있어야 합니다.

[이번에 바뀐 것 한눈에]
- 동네 태권 대전 온라인 2인 대전: 지금까지는 두 오락기를 이어 주는 일을 서버가 하지 않아서 「상대를 찾는 중」에서 멈췄습니다.
  이제 같은 방 친구 둘이 각자 문구점 오락기에서 「온라인 대전 · 100원」을 누르면 바로 붙습니다.
  먼저 누른 사람이 기다리고, 같은 방 사람들에게 「○○ 님이 문구점 오락기에서 태권 대전 상대를 기다려요.」 알림이 갑니다.
  두 사람 모두 방향키 이동, Q 풋워크, A 훼이크, S 왼발, D 오른발.
- 반 헬싱 : 흡혈귀전: 보내 주신 webp 그림 아홉 장(주인공, 괴물, 우두머리, 얼굴, 땅, 벽, 물건, 제목 화면, 머리말)을 그대로 넣었습니다.
  그림 파일은 고치지 않았고, 게임이 실행될 때 필요한 칸만 잘라서 씁니다. 설정 → 「그림」에서 예전 도트 그림으로도 바꿀 수 있습니다.
  보내 주신 mp3는 제목 화면 음악입니다(파일 그대로). A125에서 배경 음악이 첫 순간에 멈추던 문제도 고쳤습니다.
  새 곡 셋(저택 왈츠, 진료소 오르골, 하얀 귀부인의 방), 짧은 가락 넷(승리, 쉼, 장신구, 불길함), 곳마다 주변 소리 일곱 가지,
  바깥 발소리, 방마다 다른 울림을 더했습니다. 마을 사람들의 몸 그림만 아직 예전 도트입니다(받은 그림에 그 칸이 없어서).
- 휴대폰 큰 액정: 컴퓨터 전체화면에서 아래 막대의 「액정 크기」 → 액정 크게 / 액정 화면 가득.
  휴대폰 몸통 없이 액정만 크게 보이고, 아래판(숫자판)은 열린 것으로 쳐서 키보드 숫자와 넘패드로 누릅니다(* 는 *, # 은 /).
  휴대전화로 접속했을 때는 예전 그대로입니다.
- 새 휴대폰 게임 「모바일 신맞고」: NATE → 게임 → 신규 게임(바로가기 3535)에서 3,000원. 컴퓨터와 둘이 치는 맞고.
  상대 셋(옆집 할머니, 복덕방 김 사장, 전설의 꾼 박 씨), 게임 머니 5만 원으로 시작.
  패를 낼 때, 뒤집을 때, 먹을 때 소리와 진동과 흔들림, 광 · 홍단 · 청단 · 초단 · 고도리 · 쪽 · 뻑 · 따닥 · 싹쓸이 · 폭탄 · 흔들기 · 총통 · 고 · 스톱마다
  큰 글씨와 그림 연출. 화투 그림은 코드로 그렸습니다.
- 더 예쁜 화투 그림을 원하시면 A126_신맞고_그림_요청문.txt를 챗지피티에 붙여 넣어 만들어 주세요. 반 헬싱 마을 사람 그림 요청문도 같이 있습니다.
- 자세한 내용은 RELEASE_A126.md.

[새 파일 18개]
server_arcade.js, src/anycall-gostop.js,
assets/vh/반헬싱_주인공.webp, assets/vh/MOBILE_반헬싱_괴물.webp, assets/vh/MOBILE_반헬싱_우두머리.webp, assets/vh/MOBILE_반헬싱_얼굴.webp,
assets/vh/MOBILE_반헬싱_땅칸.webp, assets/vh/MOBILE_반헬싱_벽.webp, assets/vh/MOBILE_반헬싱_물건.webp, assets/vh/MOBILE_반헬싱_제목화면.webp,
assets/vh/MOBILE_반헬싱_머리말.webp, assets/vh/Shadow_of_the_Organ_main_title.mp3,
tests/test_arcade_duel_a126.cjs, tests/test_anycall_vh_a126.cjs, tests/test_anycall_gostop_a126.cjs, tests/test_anycall_big_a126.cjs,
RELEASE_A126.md, A126_신맞고_그림_요청문.txt

[고친 파일 15개]
server.js, index.html, assets/games/fighter/fighter.js, src/anycall-vh.js, src/anycall-phone.js, src/anycall-lcd.js, src/anycall-nate.js,
assets/phone/anycall-phone.css, tests/test_anycall_vh_a125.cjs, tests/test_anycall_a100.cjs,
package.json, README.md, README_PATCH.txt, tools/runtime-files.json, tools/source-files.json
