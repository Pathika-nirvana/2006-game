2006_A100 덮어쓰기 패치 (버전 0.100.0, 2026-11-13 14:20 한국시간)

이 압축 파일에는 A99에서 바뀌거나 새로 생긴 파일 17개만 들어 있습니다.
A99 게임 폴더(2006_A85 폴더) 맨 위에 그대로 풀어서 덮어쓰면 A100이 됩니다.

[꼭 할 일]
- 서버 파일(server_phone.js)이 바뀌었습니다. 켜 둔 서버(node server.js)를 껐다가 다시 켜야
  친구에게 전화할 때 컬러링이 들립니다.
- 운영 서버(Render)에서 친구들과 같이 하려면 server.js와 server_phone.js가 함께 올라가 있어야 합니다.
  저는 운영 서버에 올리지 않았습니다.
- 브라우저는 새로 고침 한 번이면 됩니다(바뀐 파일마다 새 버전 표시를 달아 두었습니다).

[이번에 바뀐 것 한눈에]
- 닫혔을 때: 아래 끝이 살짝 보이는 A98 모습으로 되돌림. 양옆 뾰족하던 모서리는 둥글게 그려서 아래판과 이어지게.
  (그림 파일은 그대로, 화면에 그릴 때만)
- 카메라: 방향 버튼(또는 2 4 6 8)으로 조준, 1/3 확대, 게임 화면 위에 찍힐 범위 점선 틀.
  사진첩 → 매뉴 → '내 컴퓨터에 파일로 저장' (내려받기 폴더에 jpg 파일).
- NATE: 2006년 휴대폰 무선 인터넷. 패킷 요금(0.5KB당 6.5원)과 정보이용료, 결제 알림 문자,
  1~9 번호 메뉴, 0 메인, * 이전, 매뉴 = NATE 메뉴, 숫자 바로가기(번호 + NATE 버튼: 1004 싸이월드,
  7979 벨소리, 2006 월드컵, 8282 채팅), 검색, 벨소리, 컬러링, 게임, 테마, 배경 화면, 뉴스와 날씨,
  월드컵, 만화, 인터넷 소설, 유머, 심리 테스트, 싸이월드 모바일, NATE 채팅, 동네 지도, 운세, MY NATE.

[새 파일 3개]
src/anycall-nate.js, tests/test_anycall_a100.cjs, RELEASE_A100.md

[고친 파일 14개]
server_phone.js, src/anycall-phone.js, src/anycall-lcd.js, assets/phone/anycall-phone.css, src/xp-minihome.js,
index.html, tests/test_anycall_a98.cjs, tests/test_anycall_a99.cjs, tests/test_pc_fun_a95.cjs,
tests/test_web_town_a97.cjs, package.json, README.md, tools/runtime-files.json, tools/source-files.json

그림 파일과 소리 파일은 새로 넣거나 고치지 않았습니다.
이 안내 파일(README_PATCH.txt)은 게임에 쓰이지 않으니 지워도 됩니다.
자세한 내용은 RELEASE_A100.md를 보세요.
