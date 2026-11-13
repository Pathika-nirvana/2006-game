2006_A98 덮어쓰기 패치 (버전 0.98.0, 2026-11-13 12:42 한국시간)

이 압축 파일에는 A97에서 바뀌거나 새로 생긴 파일 16개만 들어 있습니다.
A97 게임 폴더(2006_A85 폴더) 맨 위에 그대로 풀어서 덮어쓰면 A98이 됩니다.

[꼭 할 일]
- 서버 파일은 바뀌지 않았습니다. 서버를 다시 켤 필요가 없습니다.
- 브라우저는 새로 고침 한 번이면 됩니다(바뀐 파일마다 새 버전 표시를 달아 두었습니다).
- 운영 서버(Render)에는 올리지 않았습니다.

[휴대폰 쓰는 법 한눈에]
- 꺼내기: 메뉴판의 '휴대폰' 탭, 또는 N 키, 또는 가방(I) 맨 앞의 '기본형 애니콜'.
- 열고 닫기: 휴대폰 몸통(액정 근처)을 한 번 누르기. 전체화면에서는 스페이스도 됩니다.
- 숫자판: 슬라이드가 다 열렸을 때만 눌립니다. 누를 때마다 버튼마다 다른 높이의 소리.
- 간편모드: 게임 위에 떠 있어서 걸으면서 켜 둘 수 있음. 끌어서 옮기고, 아래 막대의 - + 나
  오른쪽 끝 손잡이로 크기 조절.
- 전체화면: 테두리를 두 번 누르거나 아래 막대에서 '전체화면'. 다시 두 번 누르면 간편모드.

[그림 파일]
보내 주신 휴대폰 그림 두 장은 고치지 않고 그대로(한 글자도 다르지 않게) 넣었습니다.
  assets/phone/anycall_front_moving.png  (윗판, 움직임)
  assets/phone/anycall_back_fixed.png    (아래판, 고정)
미리보기 두 장은 맞춰 보기용 참고 그림으로 art/phone 폴더에 넣었습니다.

[새 파일 9개]
src/anycall-phone.js, src/anycall-lcd.js, assets/phone/anycall-phone.css,
assets/phone/anycall_front_moving.png, assets/phone/anycall_back_fixed.png,
art/phone/anycall_preview_closed.png, art/phone/anycall_preview_open.png,
tests/test_anycall_a98.cjs, RELEASE_A98.md

[고친 파일 7개]
index.html, src/web-town.js, tests/test_web_town_a97.cjs,
package.json, README.md, tools/runtime-files.json, tools/source-files.json

이 안내 파일(README_PATCH.txt)은 게임에 쓰이지 않으니 지워도 됩니다.
자세한 내용은 RELEASE_A98.md를 보세요.
