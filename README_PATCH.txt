2006 A94 패치 · 인터넷 디테일 보강 (읽을거리, 긴 괴담, 새 사이트, 숨은 미스터리 홈페이지)
버전 0.94.0 · 2026-11-09 16:49 (한국시간)
기준: 이미 적용한 A93 패치 위에 덮어씌우는 패치입니다. (A86부터 A93까지 순서대로 적용한 소스가 기준입니다.)

적용 방법
1. 압축을 풀어 나온 파일을 소스 폴더(index.html이 있는 곳)에 그대로 덮어씌우세요. src 폴더에 web-stories.js, web-more.js 두 파일이 새로 생깁니다.
2. node server.js 로 켜거나 index.html을 열고, 게임 안 PC방 컴퓨터로 들어가 인터넷을 여세요.
3. 브라우저에서 예전 화면이 보이면 Ctrl+F5로 새로 고침하세요. (스크립트 뒤의 캐시 번호를 A94로 바꿔 두었습니다.)

무엇을 보면 되나
- 주니어네이버 왼쪽 메뉴의 읽을거리, 야후꾸러기 위쪽 탭의 꾸러기 백과 (글 20편, 동화와 옛이야기 6편 추가)
- 소름닷컴 괴담 게시판: 길게 읽는 괴담 8편 (PC방 알바, 수련회 연재 3편, 할머니 댁, GOP, 미니홈피, 고시원), 불 끄고 읽기 단추, 연재 목록
- 즐겨찾기의 추천 사이트 또는 링크천국: 소설나라, 6학년 2반 하늘반, 이모티콘 세상, 미스터리 X파일
- 숨은 홈페이지 별이네 다락방: 링크천국 맨 아래 접속이 불안정한 곳에서 들어갈 수 있습니다. 여러 사이트에 흩어진 단서를 모아 비밀의 방을 열어 보세요. (정답은 RELEASE_A94.md 맨 아래에 접어 두었습니다)
- 네이버에서 괴담, 타임캡슐, 외계어 같은 낱말을 검색하면 맨 위에 사이트 칸이 나옵니다.

바뀐 파일 (21개)
- 새 파일: src/web-stories.js, src/web-more.js, tests/test_web_more_a94.cjs, RELEASE_A94.md
- 고친 파일: index.html, src/kids-data.js, src/kids-portal.js, src/web-data.js, src/web-sites.js, src/portal-pages.js, src/portal-boards.js, src/portal-news.js, src/xp-desktop.js, assets/pc-desktop/kids.css, assets/pc-desktop/web-sites.css, package.json, README.md, tools/runtime-files.json, tools/source-files.json, tests/test_kids_a89.cjs

참고
- 월드맵, 캐릭터 비율, 이동키, 기존 멀티플레이, 오락기 입력, 배경음악, PC 조작 중 주변 게임음 차단은 건드리지 않았습니다. 새 그림이나 소리 파일은 없습니다.
- 모든 글은 게임 속 날짜 2006년 5월 30일 오후 4시 32분 기준입니다. 그 뒤에 생긴 말(병맛, 힐링, 먹방, 고인물, 흑역사 등)은 이미 있던 글에서도 그 시절 말로 바꿨습니다.
- 홈페이지 방명록, 댓글, 추천, 출석 기록이 다시 켜면 사라지던 문제를 고쳤습니다.
- 이모티콘 복사는 브라우저가 허락할 때만 진짜 클립보드에 들어갑니다.
- 운영 서버(깃허브, Render)에는 올리지 않았습니다.
- 자세한 내용은 RELEASE_A94.md를 보세요.

되돌리는 방법
- 패치 전체를 취소하려면 A93 패치를 다시 덮어씌우고, src/web-stories.js와 src/web-more.js를 지우세요.
