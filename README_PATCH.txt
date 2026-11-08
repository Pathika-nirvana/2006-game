2006 A92 패치 · 딩동 메신저를 버디버디로 · 직접 그린 귀신 얼굴 · 공포 효과음
버전 0.92.0 · 2026-11-08 18:46 (한국시간)
기준: 이미 적용한 A91 패치 위에 덮어씌우는 패치입니다. (A86, A87, A88, A88.1, A89, A90, A91을 순서대로 적용한 소스가 기준입니다.)

적용 방법
1. 압축을 풀어 나온 파일을 소스 폴더(index.html이 있는 곳)에 그대로 덮어씌우세요. assets/pc-desktop 아래에 ghost 폴더가 새로 생깁니다.
2. node server.js 로 켜서 게임을 시작하고, PC방 컴퓨터로 들어가세요. 소리를 들으려면 서버로 켜는 쪽이 확실합니다.
3. 브라우저에서 예전 화면이 보이면 Ctrl+F5로 새로 고침하세요. (스크립트 뒤의 캐시 번호를 A92로 바꿔 두었습니다.)

무엇을 보면 되나
- 바탕화면의 딩동 메신저가 버디버디로 바뀌고 날개 신발 그림이 보입니다. 시작 메뉴, 오른쪽 아래 알림 영역, 접속 알림 풍선, 로그인 화면에도 같은 그림이 나옵니다.
- 인터넷(IE)에서 www.sorum.co.kr 의 괴담 마지막 줄이나 귀신 체험관, www.cuteanimal-pic.com 의 네 번째 사진으로 가면 귀신 얼굴이 직접 그리신 그림으로 나옵니다.
- 귀신이 나타나는 순간 점프 스퀘어 소리(jump1)가 나고, 그 소리가 끝나면 얼굴에 맞는 흐느낌이 이어집니다. 아이 목소리는 반쪽 얼굴, 눈 큰 아이, 금 간 얼굴이고, 여자 목소리는 비명 여자, 피눈물 여자, 웃는 얼굴입니다.
- 귀신 화면을 먼저 닫아도 소리는 끝까지 이어집니다. 게임의 효과음을 끄거나, 다른 사이트로 옮기거나, 인터넷 창을 닫으면 소리가 바로 멈춥니다.

바뀐 파일 (27개)
- 새 파일: assets/pc-desktop/icons/buddy.webp, assets/pc-desktop/ghost/ghost-sheet.webp, assets/pc-desktop/ghost/jump1.mp3, assets/pc-desktop/ghost/sob-child-1~3.mp3, assets/pc-desktop/ghost/sob-female-1~3.mp3, tests/test_buddy_ghost_a92.cjs, RELEASE_A92.md
- 고친 파일: index.html, src/web-ghost.js, src/web-sites.js, src/world-audio.js, src/xp-desktop.js, src/xp-messenger.js, src/xp-shell.js, assets/pc-desktop/xp-extras.css, package.json, README.md, tools/runtime-files.json, tools/source-files.json, tests/test_web_sites_a91.cjs, tests/test_world_audio.cjs, tests/test_xp_extras_a90.cjs

참고
- 월드맵, 캐릭터 비율, 이동키, 기존 멀티플레이, 오락기 입력, 배경음악, PC 조작 중 주변 게임음 차단은 건드리지 않았습니다.
- 올려 주신 그림 파일(날개 신발, 귀신 여섯 칸)은 한 글자도 고치지 않았습니다. 화면에 보여 줄 때 크기와 칸만 골라 쓰는 방식입니다.
- 귀신 그림이 늦게 오거나 못 읽으면 A91의 코드로 그린 귀신 얼굴이 대신 나옵니다.
- 올려 주신 흐느낌 파일은 이름만 짧게 바꿔 넣었습니다. 대응표는 RELEASE_A92.md에 있습니다. 소리 내용은 그대로입니다.
- 새로 늘어난 파일은 합쳐서 약 1.3MB입니다.
- 실제 스피커로 들었을 때의 소리 크기와 느낌은 확인하지 못했습니다. 크기가 맞지 않으면 알려 주세요.
- 운영 서버(깃허브, Render)에는 올리지 않았습니다.
- 자세한 내용은 RELEASE_A92.md를 보세요.

되돌리는 방법
- 귀신 소리만 빼려면 src/web-ghost.js에서 playScare(kind) 호출 한 줄을 지우세요.
- 귀신 그림만 예전 코드 그림으로 되돌리려면 assets/pc-desktop/ghost/ghost-sheet.webp 파일을 지우세요. (그림이 없으면 자동으로 코드 그림이 나옵니다.)
- 패치 전체를 취소하려면 A91 패치를 다시 덮어씌우세요. (ghost 폴더와 buddy.webp는 지워도 됩니다.)
