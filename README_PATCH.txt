2006 A88.1 패치 (서버 없이 index.html을 열어도 Incoming 그림이 보이게 함)
버전 0.88.1 · 2026-11-08 14:49 (한국시간)
기준: 이미 적용한 A88 패치 위에 덮어씌우는 작은 패치입니다.

적용 방법
1. 압축을 풀어 나온 파일을 소스 폴더(index.html이 있는 곳)에 그대로 덮어씌우세요.
2. 그림을 assets/pc-desktop/incoming 폴더에 넣고, 소스 폴더의 "그림목록갱신.bat"을 더블클릭하세요.
   (검은 창에 "그림 ?장을 목록에 넣었습니다"가 나오면 끝입니다. 아무 키나 눌러 닫으세요.)
3. index.html을 열고 내 문서의 Incoming 폴더를 열면 그림이 보입니다.

참고
- 서버(node server.js)로 켤 때는 그림목록갱신.bat이 필요 없고, 폴더를 다시 열기만 하면 보입니다.
- 그림을 넣거나 뺀 뒤에는 서버 없이 쓸 때만 그림목록갱신.bat을 다시 눌러 주세요.
- 윈도우 기본 기능(파워셸)만 쓰므로 따로 설치할 것은 없습니다.
- 바뀐 파일: src/pc-system.js, 그림목록갱신.bat(새), assets/pc-desktop/incoming/list.js(새), package.json, README.md, RELEASE_A88.md, tools/ 목록 2개
