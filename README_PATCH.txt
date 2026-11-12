2006_A97 덮어쓰기 패치 (버전 0.97.0, 2026-11-12 19:08 한국시간)

이 압축 파일에는 A96에서 바뀌거나 새로 생긴 파일 20개만 들어 있습니다.
A96 게임 폴더(2006_A85 폴더) 맨 위에 그대로 풀어서 덮어쓰면 A97이 됩니다.

[꼭 할 일]
- 서버 파일이 바뀌었습니다(server.js 고침, server_minihome.js 새로 생김).
  켜 둔 서버(node server.js)를 껐다가 다시 켜야 미니홈피 실시간 연동이 됩니다.
- 운영 서버(Render)에서 친구들과 같이 하려면 이 두 서버 파일이 함께 올라가야 합니다.
  저는 운영 서버에 올리지 않았습니다.
- 브라우저는 새로 고침 한 번이면 됩니다(바뀐 파일마다 새 버전 표시를 달아 두었습니다).

[제가 정해 둔 것] (앞서 여쭤본 두 가지는 제가 권한 대로 정했습니다)
- 미니홈피 사진: 사진첩 최근 세 장을 작게 줄여서(가로세로 160칸 안쪽) 올립니다.
- 기록 보관: 우리동네 아지트처럼 서버 메모리에만 두고, 방에 아무도 없게 된 뒤 6시간이 지나면
  (또는 서버를 다시 켜면) 지워집니다. 내 브라우저에 있는 미니홈피 원래 내용은 그대로 남아서
  방에 다시 들어가면 다시 올라갑니다.

[새 파일 7개]
server_minihome.js, src/web-town.js, src/kids-extra.js, assets/pc-desktop/web-town.css,
tests/test_minihome_a97.cjs, tests/test_web_town_a97.cjs, RELEASE_A97.md

[고친 파일 13개]
server.js, src/xp-minihome.js, src/portal-boards.js, src/kids-data.js, src/kids-more.js,
assets/pc-desktop/pc-fun.css, index.html, tests/test_pc_fun_a95.cjs, tests/test_buddy_mobile_a96.cjs,
package.json, README.md, tools/runtime-files.json, tools/source-files.json

그림 파일과 소리 파일은 새로 넣거나 고치지 않았습니다.
자세한 내용은 RELEASE_A97.md를 보세요.
