2006 A88 패치 (내 문서 그림 보기, 우리동네 아지트, 무법지대 인터넷)
버전 0.88.0 · 2026-11-08 14:34 (한국시간)
기준 원본: 2006_A85 (A85 소스 폴더). 이전에 받은 A86, A87 패치가 이미 적용되어 있어도 되고 없어도 됩니다. 이 패치에 A86, A87 내용이 모두 들어 있습니다.

적용 방법
1. 이 압축을 풀면 나오는 파일들을 소스 폴더(index.html과 server.js가 있는 곳)에 그대로 덮어씌우세요.
   폴더 구조가 같아서 같은 이름의 파일은 새 것으로 바뀌고, 없던 파일은 새로 생깁니다.
2. server.js가 바뀌었으니 실행 중이던 서버는 껐다가 node server.js 로 다시 켜세요.
3. 확인: PC방 컴퓨터에서 바탕화면의 내 문서를 열어 Incoming 폴더의 그림을 더블클릭해 보고,
   우리동네 아지트 아이콘, 인터넷의 새 기사와 카페 글을 열어 보세요.
4. 실행용(런타임) 압축과 소스 압축을 다시 만들려면 소스 폴더에서 python3 tools/package-release.py 를 실행하세요.
   (tools 안의 목록 파일이 갱신되어 있고, Incoming 폴더의 그림은 자동으로 들어갑니다.)

그림을 더 넣는 방법
  assets/pc-desktop/incoming/ 폴더에 webp, png, jpg, gif, bmp 파일을 복사해 넣기만 하면 됩니다.
  게임 안 내 문서 > Incoming 에서 폴더를 다시 열면 보입니다. 목록이나 그림 겉모양을 따로 만들 필요가 없습니다.
  운영 서버(깃허브, 렌더)에서도 보려면 이 폴더의 그림을 깃허브에도 함께 올려야 합니다.

게임 실행에 필요한 파일
  index.html
  package.json
  server.js                (Incoming 그림 목록과 파일 캐시, 우리동네 아지트 서버)
  src/club.js              (새 파일: 우리동네 아지트 화면)
  src/club-core.js         (새 파일: 아지트 규칙. 서버와 브라우저가 같이 씁니다)
  src/club-seed.js         (새 파일: 아지트에 처음 깔리는 글과 낙서)
  src/pc-system.js         (내 컴퓨터, 내 문서, Incoming 폴더, 그림 뷰어)
  src/portal-news.js       (기사 늘림, 무법지대 소재 새 기사, 댓글)
  src/portal-boards.js     (카페 글과 지식 질문 늘림, 무법지대 소재 새 글, 댓글)
  src/portal-pages.js      (삭제된 댓글 줄 표시)
  src/portal-comics.js
  src/xp-desktop.js        (내 문서와 아지트 연결)
  assets/pc-desktop/desktop.css  (맨 끝에 A88 스타일 추가)
  assets/pc-desktop/incoming/crayon_kids.webp, crayon_cat.webp (시험용으로 보내 주신 그림 2장)

기록과 검사용 파일
  README.md, RELEASE_A86.md, RELEASE_A87.md, RELEASE_A88.md, docs/a86_research_2005_2006.md
  assets/pc-desktop/incoming/README.txt (폴더 사용 안내. 게임 안에는 안 보입니다)
  tools/runtime-files.json, tools/source-files.json, tools/package-release.py
  tests/ 안의 새 검사: test_incoming_a88, test_club_core_a88, test_club_server_a88, test_club_ui_a88, test_portal_a88
  tests/ 안의 이전 검사: test_pc_system, test_portal_a86, test_portal_a87 과 수정된 기존 검사 4개

주의
- 아지트 글은 서버 메모리에만 있습니다. 서버가 다시 켜지거나 렌더가 잠들면 사라지고, 방이 비면 6시간 뒤 지워집니다.
- 새로 그린 그림 파일은 없습니다. 시험용으로 보내 주신 그림 2장만 들어 있으며, 필요 없으면 그 두 파일만 지우면 됩니다.
- 이 패치는 운영 서버(깃허브, 렌더)에 올리는 것이 아닙니다. 받아서 적용하는 것까지만 입니다.
- 화면 맨 아래 "게임 속에 만든 가상 인터넷입니다" 한 줄은 src/portal-pages.js 맨 위의 DISCLAIMER 값을 '' 로 바꾸면 사라집니다.
