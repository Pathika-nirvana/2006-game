/* 반 헬싱 : 흡혈귀전 (휴대폰 쿼터뷰 액션 롤플레잉)
   A125 (2026-11-18 KST) 판 0.125.0, A126 (2026-11-18 22:38 KST) 판 0.126.0: 사용자가 만든 그림 파일(assets/vh/) 적용, 제목 음악 mp3,
   배경 음악이 첫 순간에 멈추던 문제 고침, 새 곡(저택, 진료소, 하얀 귀부인의 방), 짧은 가락(승리, 쉼, 장신구), 잔향, 곳마다 주변 소리
   - 1897년 5월, 흡혈귀 사냥꾼 아벨 반 헬싱이 트란실바니아 비스트리차에서 소식이 끊긴 아버지를 찾아 나선다.
   - 마름모 칸 쿼터뷰 세상, 실시간 칼싸움(세 번 베기, 모아 베기, 구르기, 보조 무기, 기술), 흡혈귀 말뚝 박기,
     등불과 안개와 달빛, 파이프 오르간 같은 배경 음악, 대화와 선택, 임무(전보), 괴물 도감, 저장.
   - 이번 판은 제1장 「비스트리차의 안개」 전체. 다음 장은 다음 판에서 이어진다(설계는 RELEASE_A125.md).
   - 그림은 assets/vh/ 의 webp 아홉 장(사용자 그림, 파일은 고치지 않음)을 잘라 쓰고, 없으면 코드 안의 도트 그림으로 그린다. */
(function(w){'use strict';
const VERSION='A126',BUILD='2026-11-18';
const SAVE_KEY='2006_anycall_vh_v1';
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sgn=v=>v<0?-1:v>0?1:0;
function hash(x,y,s){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+1,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
let seed=20061118;
function rnd(){seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}
const rr2=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)%a.length];
const batchim=s=>{s=String(s);const c=s.charCodeAt(s.length-1);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28>0};
const jo=(s,a,b)=>s+(batchim(s)?a:b);
const won=n=>Math.round(n).toLocaleString('ko-KR');
/* ---------- 도트 그림 (안쪽만 그리고, 둘레 검은 테두리는 그릴 때 자동으로 붙인다) ---------- */
const PAL={k:'#0b0910',K:'#1a1722',j:'#3c3550',c:'#272c3d',C:'#3b4257',v:'#5b6582',R:'#a01f2e',r:'#681420',s:'#f0d2bc',S:'#c49a82',h:'#e6e6f2',H:'#9ea2bc',
 w:'#f2eee4',b:'#33221a',B:'#5e3e26',n:'#8a5a34',N:'#5a3a22',g:'#e8bc52',G:'#9a7428',m:'#a6b0c4',M:'#f2f6ff',y:'#ffd23a',e:'#ff3a3a',E:'#ffc8c8',t:'#f4f0e0',
 f:'#4a4a58',F:'#7a7a8a',l:'#b4b4c2',u:'#3e2450',U:'#6e4886',z:'#7d9466',Z:'#55704a',x:'#dcd6c4',X:'#a29c8a',q:'#2a2232',Q:'#4a3e54',
 o:'#e6ddf0',O:'#a99cbc',d:'#f6f2fa',D:'#c4bcd6',a:'#221622',A:'#47304a',i:'#e0607a',p:'#5e4c3e',P:'#8a7864',L:'#30283a',T:'#c03040',Y:'#8a1828',
 '1':'#2e2a20','2':'#5a4e3a','3':'#8a7a5a','4':'#c8b890','5':'#3a4a6a','6':'#6a86b0','7':'#203048','8':'#d8a038','9':'#6a2a1a'};
/* 반 헬싱: 앞쪽(오른쪽 아래를 봄) */
const H_SE=[
'.....KKKK.....',
'....KjKKKK....',
'....KjKKKK....',
'....RRRRRR....',
'.KKKKKKKKKKKK.',
'KKKKKKKKKKKKKK',
'..hhKKKKKKK...',
'..hhSsssks....',
'..hHSssssS....',
'...HSsssS.....',
'....rRRR......',
'...cRwRCc.....',
'..cCcwRCvC....',
'.cCCcwRCCvc...',
'.cCcbgbbCCvc..',
'.cCccRcCCCvc..',
'.SccccRCCCvcS.',
'..ccccRcCCvcm.',
'..cccRccCCvcM.',
'..rcccRcCCcrm.',
'...bb...bb..m.',
'...BB...BB....'];
const H_NE=[
'.....KKKK.....',
'....KKKKjK....',
'....KKKKjK....',
'....RRRRRR....',
'.KKKKKKKKKKKK.',
'KKKKKKKKKKKKKK',
'...KKKKKKKhh..',
'....hhhhhhh...',
'....hhhhhhH...',
'.....hhhhH....',
'....rRRRR.....',
'...cnnnnnnc...',
'..cCNmmmmNCc..',
'.cCCCvnvCCCvc.',
'.cCCvvnvvCCvc.',
'.cCCbbbbbCCvc.',
'.SCCCcCCCCCvS.',
'..cCCcCCCCvc..',
'..cCCcCCCCvc..',
'..rCCcCCCCcr..',
'...bb...bb....',
'...BB...BB....'];
/* 걷는 다리 두 가지, 공격 자세(팔을 앞으로), 기도 자세(두 팔을 위로) */
const LEG_SE=[['..bb.....bb...','..BB......BB..'],['....bb.bb.....','....BB..BB....']];
const LEG_NE=[['..bb.....bb...','..BB.....BB...'],['....bb..bb....','....BB..BB....']];
const ATK_SE=['...cRwRCc.....','..cCcwRCvCCSS.','.cCCcwRCCvc...','.cCcbgbbCCvc..','.cCccRcCCCvc..','.SccccRCCCvc..','..ccccRcCCvc..','..cccRccCCvc..'];
const ATK_NE=['...cnnnnnnc...','..cCNmmmmNCSS.','.cCCCvnvCCC...','.cCCvvnvvCCvc.','.cCCbbbbbCCvc.','.SCCCcCCCCCvc.','..cCCcCCCCvc..','..cCCcCCCCvc..'];
const CAST_SE=['.S.cRwRCc..S..','.ScCcwRCvCcS..','.cCCcwRCCvc...','.cCcbgbbCCvc..','.cCccRcCCCvc..','.cccccRCCCvc..','..ccccRcCCvc..','..cccRccCCvc..'];
const ROLL_SE=[
'.....KKKK.....',
'...KKKKKKKK...',
'.KKKKKKKKKKKK.',
'..hhSsKKKK....',
'.hCCcccRRcc...',
'cCCCcccRccvc..',
'cCCvvcRccCvcc.',
'cCCvcRcccCCvc.',
'.cCCRcccCCvcc.',
'.rcccccCCCvc..',
'..rccccCCcc...',
'...bbccbb.....',
'...BB..BB.....'];
const ROLL_NE=[
'.....KKKK.....',
'...KKKKKKKK...',
'.KKKKKKKKKKKK.',
'....KKKKhhh...',
'..cnnnnnnnc...',
'.cCNmmmmmNCc..',
'cCCCvvnvvCCvc.',
'cCCvvvnvvvCvc.',
'.cCCCbbbbCCc..',
'.rcCCCCCCCcr..',
'..rcCCCCCcr...',
'...bbccbb.....',
'...BB..BB.....'];
const H_DEAD=[
'.......................',
'..KKK.........hh.......',
'.KKKKK...ccCCvhSsS.....',
'KjKKKKK.cCCCCvRssk.....',
'RRRRRRRbcCcRcCCvRS.....',
'KKKKKKKbBcccRcCCvcS..mM',
'.......bBccccccccr..mM.',
'.........bb..rrr.......'];
/* 괴물들 (모두 오른쪽 아래를 본다. 왼쪽은 뒤집어 그린다) */
const S_WOLF=[[
'................FF....',
'...............FlFF...',
'F.............FFFyFF..',
'FF....FFFFFFFFFFFFFFlt',
'.FFFFFFFFFFFFFFFFFFFFF',
'..fFFFFFFFFFlFFFFFFl..',
'...ffFFFFFFFFFFFFfF...',
'...ff.ff.......fF.ff..',
'..ff...ff.....ff...ff.',
'.ff.....ff...ff.....f.'],[
'................FF....',
'...............FlFF...',
'..............FFFyFF..',
'F.....FFFFFFFFFFFFFFlt',
'FFFFFFFFFFFFFFFFFFFFFF',
'.ffFFFFFFFFFlFFFFFFl..',
'...ffFFFFFFFFFFFFfF...',
'....fff.......ffff....',
'....f.ff.....ff.ff....',
'...ff..f.....f...ff...'],[
'......................FF',
'..................FFFlFF',
'F...............FFFFFyFF',
'FFF...FFFFFFFFFFFFFFFFlt',
'.FFFFFFFFFFFFFFFFFFFFFtt',
'..ffFFFFFFFFlFFFFFFFl...',
'....ffFFFFFFFFFFFFfF....',
'..fff.............ffff..',
'.ff..................ff.']];
const S_BAT=[[
'u...........u',
'uu.........uu',
'uUu..f.f..uUu',
'uUUuffFffuUUu',
'.uUUfyfyfUUu.',
'..uufffffuu..',
'.....tft.....'],[
'.....f.f.....',
'....ffFff....',
'...ufyfyfu...',
'.uUUfffffUUu.',
'uUUuu.f.uuUUu',
'uUu..t.t..uUu',
'uu.........uu']];
const S_GHOUL=[[
'....ZZZ.....',
'...ZzzzZ....',
'...zyzyz....',
'...zzzzZ....',
'....ztZ.....',
'..QqQQQq....',
'.zQQqQQQq...',
'zZ.QQqQQqZ..',
'z..qQQqQQ.z.',
'...qQQqQQ...',
'...QqQQqQ...',
'....qQqQ....',
'....Z..Z....',
'...ZZ..ZZ...',
'...z....z...',
'..zz....zz..'],[
'....ZZZ.....',
'...ZzzzZ....',
'...zyzyz....',
'...zzzzZ....',
'....ztZ.....',
'..QqQQQq....',
'.zQQqQQQq...',
'.zZQQqQQqZ..',
'.z.qQQqQQz..',
'...qQQqQQ...',
'...QqQQqQ...',
'....qQqQ....',
'.....ZZ.....',
'....ZZZZ....',
'....z..z....',
'...zz..zz...'],[
'....ZZZ...zz',
'...ZzzzZ.zz.',
'...zyzyz.z..',
'...zzzzZzz..',
'....ztZQz...',
'..QqQQQq....',
'.zQQqQQQq...',
'zZ.QQqQQq...',
'z..qQQqQQ...',
'...qQQqQQ...',
'...QqQQqQ...',
'....qQqQ....',
'....Z..Z....',
'...ZZ..ZZ...',
'...z....z...',
'..zz....zz..']];
const S_SKEL=[[
'....xxxx....',
'...xxxxxx...',
'...xkxxkx...',
'...xxxXxx...',
'....xtxt....',
'.....xx.....',
'..xXxxxxXx..',
'.x..xXxX..x.',
'.x..xxxx..x.',
'.X..xXxX..X.',
'....xxxx....',
'.....XX.....',
'....x..x....',
'....x..x....',
'....X..X....',
'...xx..xx...'],[
'....xxxx....',
'...xxxxxx...',
'...xkxxkx...',
'...xxxXxx...',
'....xtxt....',
'.....xx.....',
'..xXxxxxXx..',
'..x.xXxX.x..',
'.x..xxxx..x.',
'....xXxX....',
'....xxxx....',
'.....XX.....',
'.....xx.....',
'....x..x....',
'...xX..Xx...',
'...x....x...'],[
'....xxxx..xx',
'...xxxxxx.xX',
'...xkxxkx.x.',
'...xxxXxx.x.',
'....xtxt.x..',
'.....xx..x..',
'..xXxxxxXx..',
'.x..xXxX....',
'.x..xxxx....',
'.X..xXxX....',
'....xxxx....',
'.....XX.....',
'....x..x....',
'....x..x....',
'....X..X....',
'...xx..xx...']];
const S_BONES=['..x...xx....','.xXx.xXXx..x','xxxxxxxXxxxX','.XxX.xx.XxX.'];
const S_VAMP=[[
'....aaaa....',
'...aaaaaa...',
'...aooooa...',
'...oeooeo...',
'...ooooOo...',
'....oiiO....',
'..aAwwwAa...',
'.aAAawAAAa..',
'oaAAAwAAAAo.',
'o.aAAaAAAa.o',
'..aAAaAAAa..',
'..aAAaAAAAa.',
'..aA.aaAAAa.',
'..YY..aaYYa.',
'..aa...aa...',
'..aa...aa...',
'.aaa...aaa..'],[
'....aaaa....',
'...aaaaaa...',
'...aooooa...',
'...oeooeo...',
'...ooooOo...',
'....oiiO....',
'..aAwwwAa...',
'.aAAawAAAa..',
'.oAAAwAAAAo.',
'.o.aAaAAa.o.',
'..aAAaAAAa..',
'..aAAaAAAAa.',
'..aAaaaAAAa.',
'..YYaaaaYYa.',
'....aa.aa...',
'...aa...aa..',
'..aaa...aaa.'],[
'....aaaa......',
'...aaaaaa...o.',
'...aooooa..oo.',
'...oeooeo.oo..',
'...ooooOooo...',
'....oiiOAo....',
'..aAwwwAa.....',
'.aAAawAAAa....',
'oaAAAwAAAA....',
'o.aAAaAAAa....',
'..aAAaAAAa....',
'..aAAaAAAAa...',
'..aA.aaAAAa...',
'..YY..aaYYa...',
'..aa...aa.....',
'..aa...aa.....',
'.aaa...aaa....'],[
'..............',
'..............',
'..............',
'..............',
'....aaaa......',
'...aaaaaa.....',
'...aooooa.....',
'...okookoo....',
'...oooooO.....',
'..aAwwwAa.....',
'.aAAawAAAa....',
'oaAAAwAAAAo...',
'..aAAaAAAa....',
'.aaAAaAAAAa...',
'aaYYaaaaYYaa..',
'aaaaa..aaaaa..',
'..............']];
const S_RAT=[['.....ppp..','pp.ppPPPp.','..ppppppyp','...p..p.tt'],['.....ppp..','..pppPPPp.','pp.pppppyp','..p..p..tt']];
const S_CROW=[['...aa...','..aAAa..','.aAyAa..','aAAAAAg.','.aAAAa..','..aaaa..','..g..g..'],['a......a','aa.aa.aa','.aAAAAa.','..aAyAag','...aAa..','........','........']];
const S_ALPHA=[[
'.....................ll.....',
'...................lFlFF....',
'F.................FFFFeFF...',
'FF.....ffffffffFFFFFFFFFlt..',
'.FF..ffFFFFFFFFFFFFFFFFFFFtt',
'..FFFFFFFFFFFFlllFFFFFFFFF..',
'...fFFFFFFFFFFFFFFFFFFFFl...',
'....ffFFFFFFFFFFFFFFFffF....',
'....fffFFFFFFFFFFFFFfff.....',
'....ff..ff.......ffF..ff....',
'...ff....ff.....ff.....ff...',
'..ff......ff...ff.......ff..',
'.fff......fff.fff.......fff.'],[
'.....................ll.....',
'...................lFlFF....',
'..................FFFFeFF...',
'F......ffffffffFFFFFFFFFlt..',
'FFF..ffFFFFFFFFFFFFFFFFFFFtt',
'..FFFFFFFFFFFFlllFFFFFFFFF..',
'...fFFFFFFFFFFFFFFFFFFFFl...',
'....ffFFFFFFFFFFFFFFFffF....',
'.....ffffFFFFFFFFFFffff.....',
'......fff.........ffff......',
'.....ff.ff.......ff..ff.....',
'....ff...ff.....ff....ff....',
'...fff...fff...fff....fff...'],[
'..............lF.l..........',
'.............lFFlF..........',
'............FFeFFF..........',
'...........FFFFFFlt.........',
'..........FFFFFFFFt.........',
'.........fFFFFFFF...........',
'F......ffFFFFFFFF...........',
'FF...ffFFFFFlllFF...........',
'.FFFFFFFFFFFFFFFF...........',
'..fFFFFFFFFFFFFFl...........',
'...ffFFFFFFFFFffF...........',
'....ff..ff....ff.ff.........',
'...fff..fff..fff.fff........']];
const S_KNIGHT=[[
'.....xxxx.......',
'....xxxxxx......',
'...mmmmmmmm.....',
'...mxkxxkxm.....',
'....xxXxx.......',
'.....xtxt.......',
'..mmmxxxxmm.....',
'.mmMmXxxXmmm....',
'mmMMmxxxxmmm.M..',
'mMRRmXxxXm.x.M..',
'mMRRmxxxxm.x.M..',
'mMgRmXxxXm.x.M..',
'mMRRm.xx...x.M..',
'.mmm..xx.....M..',
'.....x..x....m..',
'.....x..x.......',
'.....X..X.......',
'....mm..mm......',
'....mm..mm......'],[
'.....xxxx.......',
'....xxxxxx......',
'...mmmmmmmm.....',
'...mxkxxkxm.....',
'....xxXxx.......',
'.....xtxt.....M.',
'..mmmxxxxmm..M..',
'.mmMmXxxXmmmM...',
'mmMMmxxxxmmMx...',
'mMRRmXxxXmMxx...',
'mMRRmxxxxm..x...',
'mMgRmXxxXm......',
'mMRRm.xx........',
'.mmm..xx........',
'.....x..x.......',
'....x....x......',
'....X....X......',
'...mm....mm.....',
'...mm....mm.....']];
const S_LUCIA=[[
'.....hhhh.....',
'....hhhhhh....',
'...hhoooohh...',
'...hoeooeoh...',
'...hooooOoh...',
'...hhoiiOhh...',
'....hdoodh....',
'...dDddddDd...',
'..dDddddddDd..',
'.odDdddDdddDo.',
'.o.dDdddddD.o.',
'...dDddDdddD..',
'...dDddddddD..',
'..dDdddDddddD.',
'..dDddddddddD.',
'.dDdddDddddddD',
'.dDddddddDdddD',
'dDdddddddddddD',
'.D.D..D..D.D..'],[
'.....hhhh.....',
'....hhhhhh....',
'...hhoooohh...',
'...hoeooeoh...',
'...hooooOoh...',
'...hhoiiOhh...',
'....hdoodh....',
'...dDddddDd...',
'..dDddddddDd..',
'.odDdddDdddDo.',
'o..dDdddddD..o',
'...dDddDdddD..',
'...dDddddddD..',
'..dDdddDddddD.',
'.dDddddddddddD',
'.dDdddDdddddD.',
'dDdddddddDdddD',
'.dDddddddddDd.',
'..D..D..D..D..'],[
'.....hhhh.....',
'....hhhhhh....',
'...hhoooohh...',
'...hoeooeoh...',
'...hooooOoh...',
'o..hhoiiOhh..o',
'oo..hdoodh..oo',
'.oodDddddDdoo.',
'...dddddddd...',
'...dDdddDdD...',
'...dDdddddD...',
'...dDddDdddD..',
'...dDddddddD..',
'..dDdddDddddD.',
'..dDddddddddD.',
'.dDdddDddddddD',
'.dDddddddDdddD',
'dDdddddddddddD',
'.D.D..D..D.D..'],[
'..............',
'..............',
'..............',
'..............',
'.....hhhh.....',
'....hhhhhh....',
'...hhoooohh...',
'...hokookoh...',
'...hooooOoh...',
'..hhhoooOhhh..',
'..dDddddddDd..',
'.odDdddDdddDo.',
'...dDdddddD...',
'..dDddDddddDd.',
'.dDdddddddddDd',
'dDddddDdddddddD',
'dDdddddddddDdddD',
'.DDdDDdDDdDDdD..',
'...............']];
/* ---------- 그림 공장: 한 번 그린 그림은 기억해 두고 다시 붙인다 ---------- */
let MK=null;
const ART=new Map();
function mkcv(wd,ht){try{const c=MK?MK(Math.max(1,wd|0),Math.max(1,ht|0)):null;if(!c)return null;const g=c.getContext&&c.getContext('2d');if(!g)return null;return{c,g,w:wd|0,h:ht|0}}catch(_){return null}}
function cached(key,fn){if(ART.has(key))return ART.get(key);let v=null;try{v=fn()}catch(_){v=null}ART.set(key,v);return v}
const HEX={};function rgb(c){if(HEX[c])return HEX[c];const n=parseInt(c.slice(1),16);return HEX[c]=[n>>16&255,n>>8&255,n&255]}
function mix(a,b,t){const A=rgb(a),B=rgb(b);const h=v=>Math.round(v).toString(16).padStart(2,'0');return'#'+h(A[0]+(B[0]-A[0])*t)+h(A[1]+(B[1]-A[1])*t)+h(A[2]+(B[2]-A[2])*t)}
function dot(g,c,x,y,wd=1,ht=1){g.fillStyle=c;g.fillRect(x,y,wd,ht)}
/* 다각형을 점 단위로 칠한다(가장자리가 번지지 않게) */
function fillPoly(g,pts,c){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 g.fillStyle=c;for(let y=Math.floor(y0);y<Math.ceil(y1);y++){const cy=y+.5;const xs=[];for(let i=0;i<pts.length;i++){const [ax,ay]=pts[i],[bx,by]=pts[(i+1)%pts.length];if((ay<=cy&&by>cy)||(by<=cy&&ay>cy))xs.push(ax+(cy-ay)*(bx-ax)/(by-ay))}
  xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2){const a=Math.round(xs[k]),b=Math.round(xs[k+1]);if(b>a)g.fillRect(a,y,b-a,1)}}}
function line(g,x0,y0,x1,y1,c){x0|=0;y0|=0;x1|=0;y1|=0;g.fillStyle=c;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;for(let n=0;n<200;n++){g.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
/* ---------- 줄 글자 그림 → 테두리 붙은 그림 ---------- */
function padRows(rows){const wd=Math.max(...rows.map(r=>r.length));return rows.map(r=>r.padEnd(wd,'.'))}
function buildSprite(rows,o={}){rows=padRows(rows);const ht=rows.length,wd=rows[0].length;const cv=mkcv(wd+2,ht+2);if(!cv)return null;const g=cv.g,map=o.map||{},pal=o.pal||PAL;
 const on=(x,y)=>{const r=rows[y];if(!r)return false;const ch=r[x];return ch!==undefined&&ch!=='.'};
 for(let y=-1;y<=ht;y++)for(let x=-1;x<=wd;x++){let col=null;
  if(on(x,y)){let ch=rows[y][x];if(map[ch])ch=map[ch];col=ch==='k'?'#0b0910':(pal[ch]||'#ff00ff');
   if(o.mode==='white')col=ch==='k'?'#3a2a3a':'#ffffff';else if(o.mode==='sil')col='#cbb8ff';else if(o.mode==='red')col=mix(col,'#ff1830',.45);else if(o.mode==='dark')col=mix(col,'#000000',.55);else if(o.mode==='ghost')col=mix(col,'#a8c8ff',.5)}
  else if(!o.noOutline&&(on(x+1,y)||on(x-1,y)||on(x,y+1)||on(x,y-1)))col=o.mode==='sil'?'#7a60c0':o.mode==='white'?'#ffffff':'#0b0910';
  if(col){const fx=o.flip?(wd-1-x):x;dot(g,col,fx+1,y+1)}}
 return{c:cv.c,w:wd+2,h:ht+2,ax:(wd+2)/2,ay:ht+1}}
const rep=(base,at,rows)=>{const b=base.slice();rows.forEach((r,i)=>b[at+i]=r);return b};
/* 주인공 자세 모음 */
const HERO_ROWS={se_stand:H_SE,se_w1:rep(H_SE,20,LEG_SE[0]),se_w2:rep(H_SE,20,LEG_SE[1]),se_atk:rep(H_SE,11,ATK_SE),se_cast:rep(H_SE,11,CAST_SE),se_roll:ROLL_SE,
 ne_stand:H_NE,ne_w1:rep(H_NE,20,LEG_NE[0]),ne_w2:rep(H_NE,20,LEG_NE[1]),ne_atk:rep(H_NE,11,ATK_NE),ne_cast:rep(H_NE,11,ATK_NE),ne_roll:ROLL_NE,dead:H_DEAD};
const MON_ROWS={wolf:S_WOLF,bat:S_BAT,ghoul:S_GHOUL,skel:S_SKEL,vamp:S_VAMP,rat:S_RAT,crow:S_CROW,alpha:S_ALPHA,knight:S_KNIGHT,lucia:S_LUCIA,bones:[S_BONES]};
/* 색 바꾸기 (같은 그림으로 다른 괴물) */
const REMAP={spawn:{a:'q',A:'Q',Y:'q',w:'O'},guest:{},ghoulB:{z:'O',Z:'D',Q:'A',q:'a'},wolfB:{F:'f',f:'L',l:'F'},wolfW:{F:'l',f:'F',l:'w'},skelR:{x:'4',X:'3'}};
function spriteDot(set,name,idx,o={}){const key='s:'+set+':'+name+':'+(idx||0)+':'+(o.flip?1:0)+':'+(o.mode||'')+':'+(o.remap||'');
 return cached(key,()=>{let rows=null;if(set==='hero')rows=HERO_ROWS[name];else if(set==='mon'){const L=MON_ROWS[name];rows=L&&L[Math.min(L.length-1,idx||0)]}else if(set==='npc')rows=npcRows(name);else if(set==='face')rows=faceRows(name);
  if(!rows)return null;return buildSprite(rows,{flip:o.flip,mode:o.mode,map:o.remap?REMAP[o.remap]||{}:{}})})}
/* ---------- 동네 사람 (틀 하나에 색만 바꿔 여러 사람) ---------- */
const NPC_T={
 man:['....hhhh....','...hhhhhh...','...hssssh...','...sksskS...','...ssssSs...','....sSSs....','...cCCCCc...','..cCCwwCCc..','.cCCCwwCCCc.','.sCCCbbCCCs.','..CCCCCCCC..','...ppPPpp...','...pp..pp...','...pp..pp...','...pp..pp...','..bbb..bbb..'],
 hat:['...KKKKKK...','..KKKKKKKK..','.KKKKKKKKKK.','...hssssh...','...sksskS...','...ssssSs...','....sSSs....','...cCCCCc...','..cCCwwCCc..','.cCCCwwCCCc.','.sCCCbbCCCs.','..CCCCCCCC..','...ppPPpp...','...pp..pp...','...pp..pp...','...pp..pp...','..bbb..bbb..'],
 woman:['....hhhh....','...hhhhhh...','..hhssssh...','..hsksskSh..','..hssssSsh..','..h.sSSs.h..','...cCCCCc...','..cCwwwwCc..','.sCCCCCCCCs.','..cCaaaaCc..','..cCaaaaCc..','.cCCaaaaCCc.','.cCCCCCCCCc.','cCCCCCCCCCCc','cCCCCCCCCCCc','..bb....bb..'],
 scarf:['...rrrrrr...','..rRRRRRRr..','..rssssssr..','..rsksskSr..','..rssssSsr..','..rr.sSSrr..','...cCCCCc...','..cCwwwwCc..','.sCCCCCCCCs.','..cCaaaaCc..','..cCaaaaCc..','.cCCaaaaCCc.','.cCCCCCCCCc.','cCCCCCCCCCCc','cCCCCCCCCCCc','..bb....bb..'],
 child:['....hhhh....','...hhhhhh...','...hssssh...','...sksskS...','....sSSs....','...cCCCCc...','..scCwwCcs..','...cCCCCc...','...ppPPpp...','...pp..pp...','...bb..bb...'],
 robe:['....hhhh....','...hhhhhh...','...hssssh...','...sksskS...','...ssssSs...','....sSSs....','...cCwwCc...','..cCCwwCCc..','.cCCCCCCCCc.','.sCCCggCCCs.','..cCCggCCc..','..cCCggCCc..','..cCCCCCCc..','.cCCCCCCCCc.','.cCCCCCCCCc.','..bb....bb..'],
 burly:['....hhhh....','...hhhhhh...','..hssssssh..','..sksskssS..','..ssssssSs..','...sSHHSs...','..sCCCCCCs..','.ssCCCCCCss.','.sCaaaaaaCs.','.sCaaaaaaCs.','..CaaaaaaC..','..paaaaaap..','...pp..pp...','...pp..pp...','...pp..pp...','..bbb..bbb..'],
 doctor:['....hhhh....','...hhhhhh...','...hssssh...','...mkmmkm...','...ssssSs...','....sSSs....','...wwRRww...','..wwwRRwww..','.wwwwccwwww.','.swwwccwwws.','..wwwccwww..','...ppPPpp...','...pp..pp...','...pp..pp...','...pp..pp...','..bbb..bbb..'],
 old:['...rrrrrr...','..rrRRRRrr..','..rSssssSr..','..rsksskSr..','..rSssssSr..','..rrSSSSrr..','.rrRRRRRRrr.','.rRggRRggRr.','.sRRRRRRRRs.','..cCCCCCCc..','..cCaaaaCc..','.cCCaaaaCCc.','.cCCCCCCCCc.','cCCCCCCCCCCc','cCCCCCCCCCCc','..bb....bb..'],
 top:['....KKKK....','....KKKK....','....KKKK....','...KKKKKK...','..KKKKKKKK..','...hssssh...','...sksskS...','...hHHHHh...','....sSSs....','...cCCCCc...','..cCCwwCCc..','.cCCCwwCCCc.','.sCCCggCCCs.','..CCCCCCCC..','...ppPPpp...','...pp..pp...','...pp..pp...','..bbb..bbb..']};
/* 사람마다 틀과 색 (머리, 피부, 옷, 앞치마, 바지) */
const NPC_LOOK={
 marta:['scarf',{r:'R',R:'T',c:'5',C:'6',a:'w',p:'b'}],ana:['child',{h:'8',c:'R',C:'T',p:'5'}],toma:['child',{h:'n',c:'6',C:'5',p:'b'}],mihai:['child',{h:'b',c:'z',C:'Z',p:'N'}],elena:['child',{h:'g',c:'i',C:'T',p:'5'}],
 emil:['doctor',{h:'n',p:'c',b:'k'}],josef:['robe',{h:'H',c:'K',C:'c',w:'w'}],miklos:['burly',{h:'b',H:'N',c:'p',C:'P',a:'b',p:'N'}],rada:['old',{r:'U',R:'u',g:'g',c:'Y',C:'R',a:'g'}],
 ivan:['hat',{K:'N',c:'2',C:'3',w:'4',p:'1',h:'H'}],dragomir:['top',{c:'a',C:'A',w:'w',h:'H'}],guest:['top',{c:'a',C:'a',w:'w',h:'h',s:'o',S:'O',k:'e'}],gregor:['hat',{K:'2',c:'9',C:'n',w:'3',p:'N',h:'H'}],
 villager1:['man',{h:'n',c:'2',C:'3',p:'1'}],villager2:['woman',{h:'b',c:'9',C:'n',a:'4'}],villager3:['man',{h:'H',c:'5',C:'6',p:'b'}],villager4:['scarf',{r:'z',R:'Z',c:'2',C:'3',a:'4'}],
 patient:['man',{h:'H',c:'w',C:'4',p:'4',s:'o',S:'O'}],coachman:['hat',{K:'K',c:'c',C:'C',w:'R',p:'K'}],nun:['robe',{h:'K',c:'K',C:'c',w:'w'}]};
function npcRows(name){const L=NPC_LOOK[name]||NPC_LOOK.villager1;const T=NPC_T[L[0]];const map=L[1];return T.map(r=>[...r].map(ch=>map[ch]||ch).join(''))}
/* ---------- 얼굴 그림 (대화 상자) : 틀을 짜 맞춰 만든다 ---------- */
const FACE={
 abel:{skin:'s',sh:'S',hair:'h',hs:'H',eye:'k',hat:'K',hatH:'j',band:'R',col:'c',col2:'R',style:'hat'},
 abelR:{skin:'s',sh:'S',hair:'h',hs:'H',eye:'e',hat:'K',hatH:'j',band:'R',col:'c',col2:'R',style:'hat'},
 marta:{skin:'s',sh:'S',hair:'b',hs:'N',eye:'k',scarf:'R',col:'5',col2:'w',style:'scarf',cheek:1},
 ana:{skin:'s',sh:'S',hair:'8',hs:'G',eye:'k',col:'R',col2:'w',style:'braid',child:1,cheek:1},
 emil:{skin:'s',sh:'S',hair:'n',hs:'N',eye:'k',col:'w',col2:'c',style:'short',glasses:1},
 josef:{skin:'s',sh:'S',hair:'H',hs:'X',eye:'k',col:'K',col2:'w',style:'bald',beard:'H'},
 miklos:{skin:'S',sh:'n',hair:'b',hs:'N',eye:'k',col:'p',col2:'b',style:'short',beard:'b'},
 rada:{skin:'S',sh:'n',hair:'H',hs:'X',eye:'k',scarf:'U',col:'Y',col2:'g',style:'scarf',earring:1},
 ivan:{skin:'S',sh:'n',hair:'H',hs:'X',eye:'k',hat:'N',hatH:'2',band:'2',col:'2',col2:'3',style:'cap',beard:'X'},
 dragomir:{skin:'s',sh:'S',hair:'H',hs:'X',eye:'k',hat:'K',hatH:'j',band:'K',col:'a',col2:'w',style:'tophat',beard:'H'},
 guest:{skin:'o',sh:'O',hair:'K',hs:'a',eye:'e',col:'a',col2:'w',style:'slick'},
 lucia:{skin:'o',sh:'O',hair:'h',hs:'D',eye:'e',col:'d',col2:'D',style:'long',lips:1},
 gregor:{skin:'S',sh:'n',hair:'H',hs:'X',eye:'k',hat:'2',hatH:'3',band:'9',col:'9',col2:'n',style:'cap',beard:'H'},
 mina:{skin:'s',sh:'S',hair:'n',hs:'N',eye:'k',col:'5',col2:'w',style:'bun',cheek:1},
 toma:{skin:'s',sh:'S',hair:'n',hs:'N',eye:'k',col:'6',col2:'w',style:'short',child:1},
 villager:{skin:'s',sh:'S',hair:'b',hs:'N',eye:'k',col:'2',col2:'3',style:'short'},
 coachman:{skin:'S',sh:'n',hair:'K',hs:'K',eye:'k',hat:'K',hatH:'c',band:'K',col:'c',col2:'R',style:'cap',beard:'K'}};
function faceRows(name){const F=FACE[name]||FACE.villager;const W=20,H=22;const g=[];for(let y=0;y<H;y++)g.push(Array(W).fill('.'));
 const P=(x,y,c)=>{if(x>=0&&x<W&&y>=0&&y<H&&c)g[y][x]=c};const box=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)P(x,y,c)};
 const top=F.child?6:4,fl=5,fr=14,fb=top+11;
 /* 옷과 어깨 */
 box(2,fb+1,17,H-1,F.col);box(7,fb+1,12,fb+2,F.col2);box(8,fb+1,11,H-1,F.col2);if(F.style==='hat'){box(8,fb+1,11,fb+3,'R')}
 /* 얼굴 */
 box(fl,top+2,fr,fb-1,F.skin);box(fl+1,fb,fr-1,fb,F.skin);box(fr-1,top+3,fr,fb-1,F.sh);box(fl+2,fb,fr-2,fb,F.sh);
 /* 머리카락 */
 const hair=F.hair,hs=F.hs;
 if(F.style==='short'||F.style==='slick'||F.style==='braid'||F.style==='bun'||F.style==='long'){box(fl-1,top,fr+1,top+2,hair);box(fl-1,top+3,fl,top+6,hair);box(fr,top+3,fr+1,top+5,hs);if(F.style==='slick'){box(fl,top-1,fr,top-1,hair);P(fl+4,top+2,hair)}
  if(F.style==='braid'){box(fl-2,top+4,fl-1,fb+3,hair);box(fr+1,top+4,fr+2,fb+3,hair);P(fl-2,fb+4,'R');P(fr+2,fb+4,'R')}
  if(F.style==='bun'){box(fl+2,top-3,fr-2,top-1,hair)}
  if(F.style==='long'){box(fl-2,top+2,fl-1,H-2,hair);box(fr+1,top+2,fr+2,H-2,hs);box(fl-1,top-1,fr+1,top,hair)}}
 if(F.style==='bald'){box(fl,top+1,fr,top+2,F.skin);box(fl-1,top+3,fl,top+6,hair);box(fr,top+3,fr+1,top+6,hs)}
 if(F.style==='hat'||F.style==='cap'||F.style==='tophat'){box(fl-1,top+2,fl+1,top+7,hair);box(fr,top+3,fr+1,top+5,hs);
  if(F.style==='hat'){box(fl+1,top-4,fr-1,top,F.hat);box(fl+1,top-4,fl+2,top-1,F.hatH);box(fl+1,top-1,fr-1,top-1,F.band);box(1,top+1,18,top+2,F.hat);box(fl,top+3,fr,top+3,F.sh)}
  if(F.style==='cap'){box(fl,top-1,fr,top+1,F.hat);box(fl,top-1,fl+1,top,F.hatH);box(fl-1,top+2,fr+2,top+2,F.hat)}
  if(F.style==='tophat'){box(fl+1,top-6,fr-1,top,F.hat);box(fl+1,top-6,fl+2,top-1,F.hatH);box(fl-1,top+1,fr+1,top+1,F.hat)}}
 if(F.style==='scarf'){box(fl-2,top-1,fr+2,top+3,F.scarf);box(fl-2,top+4,fl-1,fb+1,F.scarf);box(fr+1,top+4,fr+2,fb+1,F.scarf);box(fl,top+2,fr,top+3,hair)}
 /* 눈, 눈썹, 입 */
 const ey=top+6;P(fl+2,ey,F.eye);P(fl+6,ey,F.eye);P(fl+2,ey-1,F.eye==='e'?'k':'k');P(fl+6,ey-1,'k');if(F.eye==='e'){P(fl+1,ey,'E');P(fl+7,ey,'E')}
 if(F.glasses){box(fl+1,ey-1,fl+3,ey+1,'m');box(fl+5,ey-1,fl+7,ey+1,'m');P(fl+2,ey,'k');P(fl+6,ey,'k');P(fl+4,ey,'m')}
 P(fl+4,ey+2,F.sh);P(fl+4,ey+3,F.sh);
 if(F.lips)box(fl+3,ey+4,fl+5,ey+4,'i');else box(fl+3,ey+4,fl+5,ey+4,F.sh);
 if(F.cheek){P(fl+1,ey+2,'i');P(fl+7,ey+2,'i')}
 if(F.beard){box(fl+1,ey+3,fr-1,fb,F.beard);box(fl+3,ey+4,fl+5,ey+4,'k')}
 if(F.earring){P(fl-1,ey+3,'g');P(fr+1,ey+3,'g')}
 return g.map(r=>r.join(''))}
/* ---------- 땅 칸 (마름모 32×16, 틈 없이 맞물림) ---------- */
const DIA=[];for(let r=0;r<16;r++){const hw=r<8?2*r+1:2*(15-r)+1;DIA.push([16-hw,16+hw-1])}
const FLOOR_COL={'.':['#57535f','#4d4955','#625e6a','#2a2830'],',':['#2b4630','#24402a','#365a38','#1a3020'],';':['#1d2c25','#18261f','#273b30','#111a15'],':':['#4a3b2e','#40322a','#584634','#30261d'],
 '_':['#5c4029','#523822','#684a2e','#2a1c12'],'=':['#5e1220','#4e0e1a','#7a1a2a','#a07a32'],'-':['#3a3641','#34303b','#433f4a','#17151b'],'+':['#7a7686','#2a2731','#8e8a9a','#4a4754'],
 '"':['#353a36','#2f342f','#3f4a3c','#16181a'],'~':['#0d1a2c','#122540','#2f5478','#09121e'],'b':['#59402a','#4a3422','#6a4c30','#0a1220'],'%':['#2c2119','#251b14','#382a1f','#1a120d'],'*':['#5c5850','#524e47','#6a665c','#2e2c29'],'w':['#57535f','#4d4955','#20283a','#2a2830']};
function floorTile(ch,vr,par){return cached('f:'+ch+':'+vr+':'+(par||0),()=>{const cv=mkcv(32,16);if(!cv)return null;const g=cv.g;const C=FLOOR_COL[ch]||FLOOR_COL['.'];
 for(let r=0;r<16;r++){const [a,b]=DIA[r];for(let c=a;c<=b;c++){const X=c+.5-16,Y=r+.5,lx=(X/16+Y/8)/2,ly=(Y/8-X/16)/2,n=hash(c+vr*37,r+vr*11,7);let col=C[0];
  switch(ch){
   case '.':case 'w':{const A=lx*3,rowi=Math.floor(A),B=ly*3+(rowi%2)*.5,fa=A-rowi,fb=B-Math.floor(B);const id=hash(rowi+vr*5,Math.floor(B),3);
    if(fa<.13||fb<.13)col=C[3];else{col=id<.33?C[0]:id<.66?C[1]:C[2];if(fa<.3&&fb<.5)col=mix(col,'#ffffff',.07);if(n<.06)col=mix(col,'#000',.25)}
    if(ch==='w'){const dx=lx-.5,dy=ly-.5;if(dx*dx+dy*dy<.12)col=dx*dx+dy*dy<.03?'#2c3a54':'#1a2236'}break}
   case ',':case ';':col=n<.12?C[2]:n<.2?C[3]:n>.93?C[1]:C[0];if(ch===','&&n>.985)col='#8a9a5a';break;
   case ':':col=n<.08?C[2]:n<.14?C[3]:n>.9?C[1]:C[0];if(n>.985)col='#7a6a58';break;
   case '_':{const p=ly*4,pi=Math.floor(p),fp=p-pi;col=fp<.1?C[3]:(hash(pi+vr,3,5)<.5?C[0]:C[1]);if(fp>.1&&n<.1)col=C[2];if(fp>.1&&hash(pi,Math.floor(lx*6),9)<.06&&n<.5)col=C[3];break}
   case '=':{col=n<.15?C[1]:C[0];const e=Math.min(lx,ly,1-lx,1-ly);if(e<.08)col=C[3];else if(e<.12)col=C[1];const dx=Math.abs(lx-.5),dy=Math.abs(ly-.5);if(dx+dy<.14)col=C[3];else if(dx+dy<.2)col=C[2];break}
   case '-':case '"':{const A=lx*2,B=ly*2,fa=A-Math.floor(A),fb=B-Math.floor(B),id=hash(Math.floor(A)+vr*3,Math.floor(B)+vr,4);col=fa<.06||fb<.06?C[3]:id<.4?C[0]:id<.75?C[1]:C[2];
    if(n<.04)col=C[3];if(ch==='"'&&hash(Math.floor(lx*5)+vr,Math.floor(ly*5),2)<.35&&n<.7)col=n<.3?'#2e4a30':'#3a5a3a';break}
   case '+':{const light=par?1:0;col=light?(n<.1?C[3]:C[2]):(n<.1?C[3]:C[1]);if(light&&hash(Math.floor(lx*8+ly*3),1,vr)<.08)col=C[0];break}
   case '~':col=n<.06?C[2]:n<.2?C[1]:C[0];if(hash(Math.floor(lx*4),Math.floor(ly*9),vr)<.12)col=C[1];break;
   case 'b':{const p=lx*5,fp=p-Math.floor(p);col=fp<.14?C[3]:(hash(Math.floor(p),1,vr)<.5?C[0]:C[1]);if(n<.08&&fp>.14)col=C[2];break}
   case '%':col=n<.15?C[2]:n<.25?C[3]:C[0];break;
   case '*':{const A=lx*2,B=ly*2+.5*(Math.floor(lx*2)%2),fa=A-Math.floor(A),fb=B-Math.floor(B);col=fa<.07||fb<.07?C[3]:(hash(Math.floor(A),Math.floor(B),vr)<.5?C[0]:C[1]);if(n<.05)col=C[2];break}}
  dot(g,col,c,r)}}
 return cv.c})}
/* ---------- 벽 덩어리 (위 마름모 + 왼쪽 면 + 오른쪽 면) ---------- */
const CUBE={
 '#':{top:'#5d5966',l:'#47434f',r:'#2f2c37',m:'#232028',tex:'brick',h:26},
 'H':{top:'#5e2a24',l:'#b4a88e',r:'#857a68',m:'#3a2416',tex:'house',h:30,roof:9},
 'R':{top:'#6a3028',l:'#b4a88e',r:'#857a68',m:'#3a2416',tex:'house',h:40,roof:19},
 'D':{top:'#5e2a24',l:'#b4a88e',r:'#857a68',m:'#3a2416',tex:'house',h:30,roof:9},
 'C':{top:'#9e9aac',l:'#87839a',r:'#5f5b70',m:'#3e3b4a',tex:'block',h:44},
 'S':{top:'#9e9aac',l:'#87839a',r:'#5f5b70',m:'#3e3b4a',tex:'block',h:76,spire:1},
 'X':{top:'#3e3a48',l:'#34303d',r:'#24212c',m:'#121016',tex:'crypt',h:30},
 'M':{top:'#6e6a78',l:'#5e5a68',r:'#403d4a',m:'#24222a',tex:'block',h:34},
 'I':{top:'#1c1418',l:'#5a3040',r:'#3e2230',m:'#2a1810',tex:'paper',h:34},
 'd':{top:'#1c1418',l:'#5a3040',r:'#3e2230',m:'#2a1810',tex:'paper',h:34},
 'L':{top:'#2a1a12',l:'#5a3a22',r:'#3e2816',m:'#1e130b',tex:'shelf',h:30},
 '|':{top:'#5a5662',l:'#45414d',r:'#2e2b36',m:'#201e26',tex:'brick',h:10},
 'F':{top:'#2a2a34',l:'#22222a',r:'#18181f',m:'#3a3a48',tex:'bars',h:16},
 'O':{top:'#2a2a34',l:'#22222a',r:'#18181f',m:'#3a3a48',tex:'gate',h:30},
 'N':{top:'#3e3a48',l:'#34303d',r:'#24212c',m:'#121016',tex:'crypt',h:30},
 'U':{top:'#2a2a34',l:'#22222a',r:'#18181f',m:'#3a3a48',tex:'gate',h:30},
 'P':{top:'#56526a',l:'#46425a',r:'#2e2b3c',m:'#1a1822',tex:'block',h:46}};
function faceStart(c){return 8+((c+1)>>1)}
function cubeDot(ch,deco,lit,ho){return cached('c:'+ch+':'+(deco||'')+':'+(lit?1:0)+':'+(ho||0),()=>{const D=CUBE[ch];if(!D)return null;const h=ho||D.h,extra=D.spire&&!ho?34:0;const cv=mkcv(32,16+h+extra);if(!cv)return null;const g=cv.g,oy=extra;
 /* 위 */
 for(let r=0;r<16;r++){const [a,b]=DIA[r];for(let c=a;c<=b;c++){let col=D.top;const n=hash(c,r,ch.charCodeAt(0));const X=c+.5-16,Y=r+.5,lx=(X/16+Y/8)/2,ly=(Y/8-X/16)/2;
  if(D.tex==='house'){const p=(lx+ly)*5;col=(p-Math.floor(p))<.22?mix(D.top,'#000',.35):D.top;if(n<.08)col=mix(D.top,'#fff',.08)}
  else if(D.tex==='crypt'||D.tex==='brick'||D.tex==='block'){col=n<.1?mix(D.top,'#000',.2):n>.92?mix(D.top,'#fff',.1):D.top;if(Math.min(lx,ly,1-lx,1-ly)<.06)col=mix(D.top,'#fff',.12)}
  else if(D.tex==='bars'||D.tex==='gate'){col=null;if(Math.abs(lx-.5)<.08||Math.abs(ly-.5)<.08)col=D.top}
  else if(D.tex==='shelf'){col=mix(D.top,'#000',.1)}
  if(col)dot(g,col,c,r+oy)}}
 /* 옆면 두 개 */
 for(const side of [0,1])for(let i=0;i<16;i++){const c=side?16+i:i,cc=side?31-c:c,y0=faceStart(cc);for(let v=0;v<h;v++){const y=y0+v;const u=side?i:i;let base=side?D.r:D.l,col=base;const n=hash(c,y,side+ch.charCodeAt(0)*3);
  switch(D.tex){
   case 'brick':{const row=Math.floor(v/5),j=(u+(row%2)*4)%8;col=(v%5===0||j===0)?D.m:(n<.12?mix(base,'#000',.15):n>.94?mix(base,'#fff',.08):base);break}
   case 'crypt':{const row=Math.floor(v/6),j=(u+(row%2)*5)%10;col=(v%6===0||j===0)?D.m:(n<.15?mix(base,'#000',.18):base);if(n>.985)col='#3a4a32';break}
   case 'block':{const row=Math.floor(v/8),j=(u+(row%2)*6)%12;col=(v%8===0||j===0)?D.m:(n<.08?mix(base,'#000',.1):base);break}
   case 'house':{const roofH=Math.min(D.roof,h-2);if(v<roofH){col=(v%3===0)?mix('#4a2018','#000',.2):((u+Math.floor(v/3))%4===0?'#3a1812':'#5a2620');if(side)col=mix(col,'#000',.25)}
    else{const vv=v-roofH;col=base;if(vv===0||vv===h-roofH-1||u===0||u===15||u===8||(vv===Math.floor((h-roofH)/2)))col=D.m;if(n<.06)col=mix(base,'#000',.12)}break}
   case 'paper':{col=base;if(v>h-10){col=v===h-10?'#1e130b':(u%4===0?'#2a1a0e':'#3a2414');if(side)col=mix(col,'#000',.2)}else if((u+v)%6===0)col=mix(base,'#e8b060',.12);if(v===2)col=mix(base,'#e8b060',.2);break}
   case 'shelf':{const row=Math.floor(v/7);col=(v%7===0||u===0||u===15)?D.m:(['#7a2028','#2a4a6a','#6a5a20','#3a5a32','#5a3a6a'][Math.floor(hash(u>>1,row,side)*5)]);if(side)col=mix(col,'#000',.3);if(v%7===6)col=D.m;break}
   case 'bars':{col=null;if(v<=1||v===h-1||u%3===1)col=v<=1?D.m:'#30303c';if(col&&side)col=mix(col,'#000',.2);break}
   case 'gate':{col=null;if(v<=1||v===h-1||v===Math.floor(h/2)||u%3===1)col=D.m;if(col&&side)col=mix(col,'#000',.25);if(ch==='U'&&(u===7||u===8)&&(v>=h/2-2&&v<=h/2+2))col='#d8b04a';break}}
  /* 꾸밈: 창문, 문, 횃불 자리, 거미줄, 색유리창 */
  if(deco&&col!==null){const dside=deco.slice(-1)==='r'?1:0,kind=deco.slice(0,-1);if(dside===side){
   if(kind==='win'&&D.tex==='house'){const vv=v-D.roof;if(u>=5&&u<=10&&vv>=5&&vv<=12){col=(u===5||u===10||vv===5||vv===12)?'#2a1a10':(u===7||vv===8)?'#2a1a10':(lit?(vv<8?'#ffd890':'#f0a850'):'#1a2030')}}
   if(kind==='door'){const top=Math.max(4,h-22);if(u>=4&&u<=11&&v>=top){const rel=v-top;col=(u===4||u===11||rel===0)?'#20140c':(u===7||u===8)?'#4a2c18':'#6a4226';if(u===10&&rel===10)col='#e8bc52';if(D.tex==='crypt'||D.tex==='block')col=(u===4||u===11||rel===0)?'#101014':'#2a2630'}}
   if(kind==='gwin'&&(D.tex==='block'||D.tex==='crypt')){const cx=7.5,top=6;if(Math.abs(u-cx)<=3.5&&v>=top&&v<=top+18){const arch=v<top+4&&Math.abs(u-cx)>(v-top)+.5;if(!arch){const k=hash(u>>1,v>>2,9);col=(Math.abs(u-cx)>3||v===top+18)?'#202028':lit?(k<.3?'#c03050':k<.6?'#3070d0':k<.8?'#e0c050':'#40a060'):'#202838'}}}
   if(kind==='web'&&u>=0&&u<=5&&v<=5&&(u===v||u===0&&v<5||v===0&&u<5||(u+v)===4))col='#8a8a96';
   if(kind==='niche'&&u>=5&&u<=10&&v>=8&&v<=15){col=(u===5||u===10||v===8)?D.m:'#0a0a0e';if(v>=12&&v<=14&&u>=6&&u<=9)col=(u===7||u===8)&&v===12?'#0a0a0e':'#d8d2c0'}
   if(kind==='banner'&&u>=5&&u<=10&&v>=3&&v<=18){col=(v===18&&(u%2))?null:(u===5||u===10)?'#5a0c18':'#8a1828';if(v===7&&u>=6&&u<=9)col='#d8b04a';if(v>=9&&v<=12&&(u===7||u===8))col='#d8b04a';if(col===null)col=base}
   if(kind==='paint'&&u>=4&&u<=11&&v>=5&&v<=15){col=(u===4||u===11||v===5||v===15)?'#b08a30':(v<9?'#3a2a40':v<12?'#c8b8a8':'#2a1a20');if(u>=6&&u<=9&&v>=7&&v<=10)col='#d8c0b0'}}}
  if(col)dot(g,col,c,y+oy)}}
 /* 첨탑 */
 if(D.spire&&!ho){fillPoly(g,[[16,1],[27,oy+8],[16,oy+14],[5,oy+8]],'#3a3646');fillPoly(g,[[16,1],[16,oy+14],[5,oy+8]],'#4e4a5c');line(g,16,0,16,oy+14,'#2a2834');dot(g,'#c8a040',15,-6+8,3,1);dot(g,'#c8a040',16,-9+8,1,7)}
 return{c:cv.c,h,extra}})}
/* ---------- 물건 그림 (발끝이 아래 가운데) ---------- */
function isoBox(g,cx,cy,ex,ey,hz,top,left,right,ol='#0b0910'){
 const P=(mx,my,z)=>[cx+(mx-my)*16,cy+(mx+my)*8-z];
 const T=[P(-ex,-ey,hz),P(ex,-ey,hz),P(ex,ey,hz),P(-ex,ey,hz)];
 fillPoly(g,[P(-ex,ey,0),P(ex,ey,0),P(ex,ey,hz),P(-ex,ey,hz)],left);fillPoly(g,[P(ex,-ey,0),P(ex,ey,0),P(ex,ey,hz),P(ex,-ey,hz)],right);fillPoly(g,T,top);
 if(ol){const E=(a,b)=>line(g,a[0],a[1],b[0],b[1],ol);E(T[0],T[1]);E(T[1],T[2]);E(T[2],T[3]);E(T[3],T[0]);E(P(-ex,ey,0),P(ex,ey,0));E(P(ex,ey,0),P(ex,-ey,0));E(P(-ex,ey,0),T[3]);E(P(ex,ey,0),T[2]);E(P(ex,-ey,0),T[1])}
 return T}
function propDot(kind,vr){return cached('p:'+kind+':'+(vr||0),()=>{const W=40,Hh=64;const cv=mkcv(W,Hh);if(!cv)return null;const g=cv.g,cx=20,by=Hh-8;let ax=cx,ay=by;const n=k=>hash(vr||0,k,kind.charCodeAt(0));
 switch(kind){
  case 'pine':{const s=.85+n(1)*.3;dot(g,'#2a1a10',cx-1,by-9,3,10);dot(g,'#3e2a1a',cx-1,by-9,1,10);const L=[[by-8,13],[by-17,11],[by-25,9],[by-32,7],[by-38,4]];
   for(const [y,hw0] of L){const hw=Math.round(hw0*s);fillPoly(g,[[cx-hw-1,y+1],[cx+hw+2,y+1],[cx+.5,y-11*s]],'#0b0910');fillPoly(g,[[cx-hw,y],[cx+hw+1,y],[cx+.5,y-10*s]],'#1b3226');fillPoly(g,[[cx-hw,y],[cx+.5,y],[cx+.5,y-10*s]],'#264536');for(let i=0;i<4;i++)dot(g,'#355a44',Math.round(cx-hw/2+i*2*n(y+i)),y-2-Math.round(n(i+y)*5),1,1)}
   dot(g,'#0b0910',cx-14,by,29,1);break}
  case 'dead':{dot(g,'#0b0910',cx-2,by-30,5,31);dot(g,'#3a302c',cx-1,by-30,3,30);dot(g,'#4e423c',cx-1,by-30,1,30);
   const br=(x,y,dx,dy,len,d)=>{let px=x,py=y;for(let i=0;i<len;i++){px+=dx;py+=dy;dot(g,'#0b0910',Math.round(px)-1,Math.round(py)-1,3,3)}px=x;py=y;for(let i=0;i<len;i++){px+=dx;py+=dy;dot(g,'#3a302c',Math.round(px),Math.round(py),1,1)}if(d>0){br(px,py,dx*.8-.4,dy-.2,Math.round(len*.6),d-1);br(px,py,dx*.8+.5,dy-.3,Math.round(len*.5),d-1)}};
   br(cx,by-22,-1,-.7,8,2);br(cx,by-26,1,-.8,7,2);br(cx,by-30,.2,-1,6,1);break}
  case 'bush':isoBox(g,cx,by,.32,.32,6,'#1f3a28','#18301f','#12261a');for(let i=0;i<9;i++)dot(g,i%2?'#2c5236':'#0f2016',cx-8+Math.round(n(i)*16),by-12+Math.round(n(i+9)*8),2,2);break;
  case 'grave':{const t=Math.floor(n(2)*3);if(t===0){fillPoly(g,[[cx-5,by],[cx+5,by],[cx+5,by-9],[cx+3,by-12],[cx-3,by-12],[cx-5,by-9]],'#0b0910');fillPoly(g,[[cx-4,by],[cx+4,by],[cx+4,by-9],[cx+2,by-11],[cx-2,by-11],[cx-4,by-9]],'#7e7a88');dot(g,'#5a5664',cx+2,by-10,2,10);dot(g,'#4a4654',cx-2,by-7,4,1);dot(g,'#4a4654',cx-1,by-5,2,1)}
   else if(t===1){dot(g,'#0b0910',cx-2,by-15,5,16);dot(g,'#0b0910',cx-5,by-12,11,4);dot(g,'#7e7a88',cx-1,by-14,3,14);dot(g,'#7e7a88',cx-4,by-11,9,2);dot(g,'#5a5664',cx+1,by-14,1,14)}
   else{fillPoly(g,[[cx-6,by],[cx+6,by],[cx+5,by-7],[cx-2,by-9],[cx-6,by-6]],'#0b0910');fillPoly(g,[[cx-5,by],[cx+5,by],[cx+4,by-6],[cx-2,by-8],[cx-5,by-5]],'#6a6674');dot(g,'#4e4a58',cx+1,by-7,1,7);dot(g,'#355a3a',cx-4,by-2,3,2)}
   dot(g,'#1a1610',cx-6,by+1,13,2);break}
  case 'statue':isoBox(g,cx,by,.25,.25,6,'#6a6674','#58546a','#3e3b4a');dot(g,'#0b0910',cx-4,by-30,9,24);dot(g,'#8e8a9a',cx-3,by-29,7,22);dot(g,'#6e6a7a',cx+1,by-29,3,22);dot(g,'#0b0910',cx-11,by-26,7,12);dot(g,'#a6a2b0',cx-10,by-25,5,10);dot(g,'#0b0910',cx+5,by-26,7,12);dot(g,'#7e7a8a',cx+6,by-25,5,10);dot(g,'#0b0910',cx-3,by-36,7,7);dot(g,'#a6a2b0',cx-2,by-35,5,5);break;
  case 'candle':dot(g,'#0b0910',cx-1,by-16,3,17);dot(g,'#2a2630',cx,by-15,1,15);dot(g,'#0b0910',cx-5,by-17,11,3);dot(g,'#3e3a48',cx-4,by-16,9,1);dot(g,'#0b0910',cx-4,by,9,2);for(const x of [cx-4,cx,cx+4]){dot(g,'#0b0910',x-1,by-22,3,6);dot(g,'#e8e0c8',x,by-21,1,4)}ay=by;break;
  case 'brazier':dot(g,'#0b0910',cx-6,by-12,13,5);dot(g,'#3a3640',cx-5,by-11,11,3);dot(g,'#5a5664',cx-5,by-11,11,1);line(g,cx-4,by-7,cx-6,by,'#0b0910');line(g,cx+4,by-7,cx+6,by,'#0b0910');line(g,cx,by-7,cx,by,'#0b0910');break;
  case 'urn':fillPoly(g,[[cx-5,by],[cx+5,by],[cx+6,by-6],[cx+3,by-11],[cx-3,by-11],[cx-6,by-6]],'#0b0910');fillPoly(g,[[cx-4,by-1],[cx+4,by-1],[cx+5,by-6],[cx+2,by-10],[cx-2,by-10],[cx-5,by-6]],'#8a5a3a');dot(g,'#6a4228',cx+1,by-10,4,9);dot(g,'#b07a50',cx-3,by-7,1,4);dot(g,'#0b0910',cx-3,by-12,7,2);break;
  case 'crate':isoBox(g,cx,by,.26,.26,11,'#8a6a40','#6a4a2a','#4e361e');line(g,cx-7,by-3,cx-1,by-7,'#3a2414');line(g,cx+1,by-1,cx+7,by-5,'#2a1a0e');break;
  case 'barrel':dot(g,'#0b0910',cx-6,by-14,13,15);dot(g,'#6a4428',cx-5,by-13,11,13);dot(g,'#4a2e1a',cx+1,by-13,4,13);dot(g,'#2a2630',cx-5,by-11,11,1);dot(g,'#2a2630',cx-5,by-4,11,1);dot(g,'#8a6038',cx-5,by-15,11,2);dot(g,'#0b0910',cx-6,by-16,13,1);break;
  case 'chest':case 'chestO':isoBox(g,cx,by,.28,.2,8,'#7a4a24','#5a3418','#3e2410');if(kind==='chest'){isoBox(g,cx,by-8,.28,.2,4,'#9a6030','#6a4220','#4a2c14');dot(g,'#e8bc52',cx-2,by-9,3,3)}else{fillPoly(g,[[cx-9,by-12],[cx+3,by-18],[cx+5,by-24],[cx-7,by-18]],'#6a4220');dot(g,'#ffe080',cx-4,by-11,8,2)}break;
  case 'coffin':isoBox(g,cx,by,.42,.18,7,'#4a2a2e','#3a1e22','#26141a');dot(g,'#c8a040',cx-1,by-12,3,1);dot(g,'#c8a040',cx,by-13,1,3);break;
  case 'coffinO':isoBox(g,cx,by,.42,.18,7,'#120a0e','#3a1e22','#26141a');line(g,cx-13,by-13,cx+3,by-21,'#0b0910');fillPoly(g,[[cx-12,by-14],[cx+4,by-22],[cx+6,by-20],[cx-10,by-12]],'#4a2a2e');break;
  case 'well':isoBox(g,cx,by,.36,.36,9,'#1a2232','#6a6674','#4a4656');dot(g,'#0b0910',cx-12,by-30,2,22);dot(g,'#0b0910',cx+11,by-30,2,22);dot(g,'#5a3a22',cx-11,by-29,1,20);dot(g,'#5a3a22',cx+11,by-29,1,20);fillPoly(g,[[cx-15,by-28],[cx,by-37],[cx+15,by-28],[cx,by-24]],'#4a2018');line(g,cx,by-27,cx,by-14,'#8a7a5a');dot(g,'#5a3a22',cx-2,by-14,4,3);break;
  case 'fountain':isoBox(g,cx,by,.42,.42,6,'#1e3450','#6a6674','#4a4656');isoBox(g,cx,by-6,.1,.1,10,'#8a8696','#6a6676','#4a4656');dot(g,'#a8c8ff',cx-1,by-22,2,5);break;
  case 'anvil':dot(g,'#0b0910',cx-4,by-5,9,6);dot(g,'#2a2a32',cx-3,by-4,7,4);dot(g,'#0b0910',cx-8,by-10,16,6);dot(g,'#4a4a56',cx-7,by-9,14,3);dot(g,'#6a6a78',cx-7,by-9,14,1);break;
  case 'forge':isoBox(g,cx,by,.4,.32,12,'#3a2a24','#5a4a44','#3e322e');dot(g,'#0b0910',cx-5,by-15,10,3);dot(g,'#ff8030',cx-4,by-14,8,1);dot(g,'#0b0910',cx+3,by-38,6,24);dot(g,'#4a3e3a',cx+4,by-37,4,22);break;
  case 'altar':isoBox(g,cx,by,.4,.24,10,'#d8d0c0','#8a8496','#5e5a6c');dot(g,'#a01f2e',cx-10,by-11,20,2);for(const x of [cx-8,cx+7]){dot(g,'#0b0910',x-1,by-21,3,10);dot(g,'#f0e8d0',x,by-20,1,8)}dot(g,'#c8a040',cx-1,by-26,3,12);dot(g,'#c8a040',cx-4,by-22,9,2);break;
  case 'bed':isoBox(g,cx,by,.42,.26,7,'#e8e0d0','#6a4428','#4a2e1a');isoBox(g,cx-9,by-3,.1,.18,3,'#ffffff','#c8c0b0','#a8a090');dot(g,'#8a2a3a',cx-2,by-9,12,3);break;
  case 'table':isoBox(g,cx,by-6,.34,.26,3,'#7a5232','#5a3a22','#3e2816');line(g,cx-9,by-6,cx-9,by,'#2a1a0e');line(g,cx+9,by-6,cx+9,by,'#2a1a0e');line(g,cx,by-1,cx,by+3,'#2a1a0e');dot(g,'#f0e8c8',cx-2,by-12,4,2);break;
  case 'pew':isoBox(g,cx,by,.44,.12,6,'#5a3a22','#4a2e1a','#3a2414');isoBox(g,cx+3,by-6,.44,.04,8,'#4a2e1a','#3a2414','#2a1a0e');break;
  case 'lamp':dot(g,'#0b0910',cx-1,by-30,3,31);dot(g,'#2a2a34',cx,by-29,1,29);dot(g,'#0b0910',cx-4,by-38,9,9);dot(g,'#ffd890',cx-3,by-37,7,7);dot(g,'#2a2a34',cx,by-37,1,7);dot(g,'#2a2a34',cx-3,by-34,7,1);dot(g,'#0b0910',cx-5,by-39,11,1);dot(g,'#0b0910',cx-3,by,7,2);break;
  case 'sign':dot(g,'#0b0910',cx-1,by-18,3,19);dot(g,'#5a3a22',cx,by-17,1,17);dot(g,'#0b0910',cx-9,by-21,19,9);dot(g,'#8a6038',cx-8,by-20,17,7);dot(g,'#5a3a22',cx-6,by-18,12,1);dot(g,'#5a3a22',cx-6,by-16,9,1);break;
  case 'wagon':isoBox(g,cx,by-6,.42,.3,16,'#6a2a5a','#8a3a2a','#5a2a3a');fillPoly(g,[[cx-14,by-22],[cx+2,by-31],[cx+16,by-23],[cx,by-14]],'#c8a040');dot(g,'#0b0910',cx-10,by-6,5,5);dot(g,'#0b0910',cx+6,by-4,5,5);dot(g,'#c8a040',cx-9,by-5,3,3);dot(g,'#c8a040',cx+7,by-3,3,3);dot(g,'#ffd890',cx-6,by-17,4,4);break;
  case 'bones':for(let i=0;i<5;i++){const x=cx-7+Math.round(n(i)*12),y=by-2-Math.round(n(i+5)*4);dot(g,'#0b0910',x-1,y-1,6,3);dot(g,'#d8d2c0',x,y,4,1)}dot(g,'#0b0910',cx-2,by-7,6,5);dot(g,'#d8d2c0',cx-1,by-6,4,3);dot(g,'#0b0910',cx,by-5,1,1);break;
  case 'hay':fillPoly(g,[[cx-11,by],[cx+11,by],[cx+8,by-9],[cx,by-13],[cx-8,by-9]],'#0b0910');fillPoly(g,[[cx-10,by-1],[cx+10,by-1],[cx+7,by-9],[cx,by-12],[cx-7,by-9]],'#b8963e');for(let i=0;i<8;i++)dot(g,'#8a6e2a',cx-7+Math.round(n(i)*14),by-9+Math.round(n(i+3)*7),2,1);break;
  case 'rock':fillPoly(g,[[cx-9,by],[cx+9,by],[cx+8,by-6],[cx+2,by-10],[cx-6,by-8]],'#0b0910');fillPoly(g,[[cx-8,by-1],[cx+8,by-1],[cx+7,by-6],[cx+2,by-9],[cx-5,by-7]],'#4e4a56');fillPoly(g,[[cx+2,by-9],[cx+7,by-6],[cx+8,by-1],[cx+2,by-1]],'#3a3642');break;
  case 'cross':dot(g,'#0b0910',cx-2,by-26,5,27);dot(g,'#0b0910',cx-8,by-21,17,5);dot(g,'#5a4e3e',cx-1,by-25,3,25);dot(g,'#5a4e3e',cx-7,by-20,15,3);dot(g,'#3a3226',cx+1,by-25,1,25);break;
  case 'lever0':case 'lever1':dot(g,'#0b0910',cx-4,by-5,9,6);dot(g,'#3a3640',cx-3,by-4,7,4);line(g,cx,by-4,kind==='lever0'?cx-6:cx+6,by-14,'#0b0910');line(g,cx+1,by-4,kind==='lever0'?cx-5:cx+7,by-14,'#8a8496');dot(g,'#a01f2e',kind==='lever0'?cx-7:cx+5,by-16,3,3);break;
  case 'trunk':isoBox(g,cx,by,.3,.2,9,'#3a3046','#2a2234','#1c1626');dot(g,'#c8a040',cx-1,by-10,3,2);break;
  case 'shelfP':isoBox(g,cx,by,.4,.12,24,'#3a2416','#5a3a22','#3e2816');for(let i=0;i<3;i++)for(let j=0;j<5;j++)dot(g,['#7a2028','#2a4a6a','#6a5a20','#3a5a32'][(i+j)%4],cx-11+j*2,by-20+i*6+Math.round(j*1),1,4);break;
  case 'organ':isoBox(g,cx,by,.44,.2,14,'#3a2416','#5a3a22','#3e2816');for(let i=0;i<7;i++){dot(g,'#0b0910',cx-12+i*4,by-38+Math.abs(3-i)*2,3,24-Math.abs(3-i)*2);dot(g,'#c8b070',cx-11+i*4,by-37+Math.abs(3-i)*2,1,22-Math.abs(3-i)*2)}break;
  case 'firepit':fillPoly(g,[[cx-9,by],[cx+9,by],[cx+7,by-4],[cx-7,by-4]],'#0b0910');for(let i=0;i<6;i++)dot(g,'#5a5664',cx-8+i*3,by-3,2,2);line(g,cx-6,by-2,cx+5,by-6,'#5a3a22');line(g,cx-5,by-6,cx+6,by-2,'#4a2e1a');break;
  case 'dummy':dot(g,'#0b0910',cx-1,by-20,3,21);dot(g,'#5a3a22',cx,by-19,1,19);dot(g,'#0b0910',cx-7,by-17,15,3);dot(g,'#5a3a22',cx-6,by-16,13,1);dot(g,'#0b0910',cx-4,by-26,9,10);dot(g,'#b8963e',cx-3,by-25,7,8);dot(g,'#8a6e2a',cx-3,by-20,7,1);dot(g,'#0b0910',cx-1,by-23,1,1);dot(g,'#0b0910',cx+2,by-23,1,1);break;
  case 'mirror':dot(g,'#0b0910',cx-5,by-24,11,25);dot(g,'#c8a040',cx-4,by-23,9,23);dot(g,'#5a6a8a',cx-3,by-22,7,19);dot(g,'#8aa0c8',cx-2,by-21,2,10);break;
  case 'cage':dot(g,'#0b0910',cx-8,by-20,17,21);dot(g,'#1a1418',cx-7,by-19,15,19);for(let i=0;i<5;i++)dot(g,'#5a5664',cx-7+i*3,by-19,1,19);dot(g,'#5a5664',cx-7,by-19,15,1);dot(g,'#5a5664',cx-7,by-1,15,1);break;
  case 'rose':for(let i=0;i<6;i++){const x=cx-8+Math.round(n(i)*16),y=by-2-Math.round(n(i+4)*6);dot(g,'#0b0910',x-1,y-1,4,4);dot(g,'#a01f2e',x,y,2,2);dot(g,'#e04050',x,y,1,1)}break;
  case 'skulls':for(let i=0;i<4;i++){const x=cx-8+i*4+(i%2),y=by-4-(i%2)*3;dot(g,'#0b0910',x-1,y-1,6,6);dot(g,'#d8d2c0',x,y,4,4);dot(g,'#0b0910',x+1,y+1,1,1);dot(g,'#0b0910',x+3,y+1,1,1)}break;
  case 'hole':fillPoly(g,[[cx-10,by-4],[cx,by-9],[cx+10,by-4],[cx,by+1]],'#0b0910');fillPoly(g,[[cx-7,by-4],[cx,by-7],[cx+7,by-4],[cx,by-1]],'#2a1d14');dot(g,'#3a2c20',cx+4,by-10,6,3);break;
  default:dot(g,'#ff00ff',cx-3,by-6,6,6)}
 return{c:cv.c,w:W,h:Hh,ax,ay}})}
/* 칸 자리: [왼쪽, 위, 너비, 높이, 발끝 x] (그림 파일의 점 좌표). 그림 파일은 고치지 않고 이 자리만 잘라 쓴다 */
const IC_HERO={'0,0':[19,8,221,431,112.6],'1,0':[310,16,226,416,431.2],'2,0':[599,19,236,412,747.2],'3,0':[861,51,364,369,1016.9],'4,0':[1204,15,272,419,1312.6],'5,0':[1483,136,264,294,1619.0],'0,1':[26,447,227,429,147.4],'1,1':[299,451,249,421,402.5],'2,1':[599,454,229,410,679.2],'3,1':[836,489,385,391,935.7],'4,1':[1190,462,291,418,1330.5],'5,1':[1479,568,268,295,1612.7]};
const IC_MOB={'0,0':[11,43,229,217,175.0],'1,0':[247,41,231,219,353.9],'2,0':[487,55,248,205,635.2],'3,0':[722,12,240,206,851.1],'4,0':[952,94,254,161,1142.2],'5,0':[1205,36,208,217,1349.5],'0,1':[18,280,221,250,115.6],'1,1':[260,281,192,250,357.2],'2,1':[480,301,247,225,571.1],'3,1':[743,272,175,263,838.0],'4,1':[970,272,178,263,1073.3],'5,1':[1194,275,246,259,1292.3],'0,2':[11,550,209,255,136.6],'1,2':[248,550,211,254,379.2],'2,2':[478,550,257,258,600.9],'3,2':[736,714,187,88,847.9],'4,2':[968,711,207,95,1093.5],'5,2':[1217,703,199,100,1319.9],'0,3':[24,826,222,243,133.9],'1,3':[250,821,224,218,336.8],'2,3':[474,931,224,127,622.5],'3,3':[716,870,246,191,839.8],'4,3':[969,939,241,120,1119.6]};
const IC_BOSS={'0,0':[15,37,418,351,338.6],'1,0':[454,3,413,409,654.5],'2,0':[908,7,367,414,1105.4],'3,0':[1342,7,417,417,1549.2],'0,1':[26,438,311,447,209.3],'1,1':[443,493,443,391,714.5],'2,1':[917,445,324,432,1049.6],'3,1':[1344,451,400,429,1555.0]};
const IC_PROP={'0,0':[30,6,226,323,142.7],'1,0':[237,14,235,315,349.5],'2,0':[457,112,201,217,551.1],'3,0':[666,52,171,277,750.1],'4,0':[855,18,222,317,977.5],'5,0':[1105,50,152,277,1181.8],'6,0':[1297,50,170,286,1382.7],'7,0':[1523,6,99,321,1572.3],'0,1':[25,387,164,222,106.8],'1,1':[220,399,180,209,306.8],'2,1':[420,390,150,211,495.0],'3,1':[591,427,190,174,702.1],'4,1':[806,378,209,232,918.8],'5,1':[1029,387,209,229,1086.0],'6,1':[1236,387,209,229,1291.5],'7,1':[1448,340,218,277,1553.2],'0,2':[5,630,216,298,112.5],'1,2':[217,657,207,274,317.0],'2,2':[419,657,204,264,526.1],'3,2':[624,704,203,217,771.4],'4,2':[840,626,212,291,945.7],'5,2':[1059,656,227,261,1142.1],'6,2':[1272,697,180,216,1357.1],'7,2':[1452,635,219,300,1536.6]};
/* 땅 칸: [왼쪽 꼭짓점 x, y, 오른쪽 꼭짓점 x, y] */
const IC_FLOOR={'0,0':[29.0,127.0,442.0,118.6],'1,0':[443.0,119.0,886.0,118.4],'2,0':[887.0,119.5,1329.0,124.8],'3,0':[1330.0,123.8,1748.0,119.4],'0,1':[22.0,343.6,442.0,335.9],'1,1':[443.0,335.5,886.0,334.5],'2,1':[887.0,339.7,1329.0,338.0],'3,1':[1330.0,338.5,1757.0,334.0],'0,2':[22.0,558.4,442.0,552.8],'1,2':[443.0,552.6,886.0,551.5],'2,2':[887.0,558.2,1329.0,555.7],'3,2':[1330.0,555.4,1757.0,551.0],'0,3':[25.0,767.7,442.0,763.9],'1,3':[443.0,763.6,886.0,764.4],'2,3':[887.0,767.7,1329.0,768.7],'3,3':[1330.0,769.3,1752.0,760.0]};
/* 벽 큰 면: [왼쪽 아래 x, y, 오른쪽 아래 x, y, 왼쪽 위 x, y] */
const IC_WALL={'0,0':[97,481,307,377,97,123],'1,0':[418,481,636,374,418,108],'2,0':[745,483,950,377,745,132],'3,0':[1064,481,1282,381,1064,81],'4,0':[1393,481,1606,374,1393,75],'0,1':[73,964,299,860,73,592],'1,1':[382,965,622,866,382,560],'2,1':[704,968,935,863,704,574],'3,1':[1026,967,1260,861,1026,572],'4,1':[1353,962,1606,836,1353,576]};
/* ---------- A126 (2026-11-18 KST) 그림 파일 ----------
   사용자가 만든 webp 그림 9장(assets/vh/)을 파일은 그대로 두고, 실행할 때 필요한 칸만 잘라 화면에 맞는 크기로 줄여 쓴다.
   - 세상 그림은 화면의 실제 점 수에 맞춰 2~3배 크기로 그린다(IM.rs, 느리면 2배로 낮춘다). 도트 그림은 그 배율로 또렷하게 키우고, 새 그림은 부드럽게 줄인다.
   - 그림 파일을 못 읽으면(파일이 없거나 시험 환경) 그 부분만 예전 도트 그림으로 그린다.
   - 설정의 「그림」에서 예전 도트 그림으로 돌아갈 수 있다(이 휴대폰에 기억). */
const IMGDIR='assets/vh/';
const SHEET={hero:'반헬싱_주인공.webp',mob:'MOBILE_반헬싱_괴물.webp',boss:'MOBILE_반헬싱_우두머리.webp',face:'MOBILE_반헬싱_얼굴.webp',floor:'MOBILE_반헬싱_땅칸.webp',
 wall:'MOBILE_반헬싱_벽.webp',prop:'MOBILE_반헬싱_물건.webp',title:'MOBILE_반헬싱_제목화면.webp',pro:'MOBILE_반헬싱_머리말.webp'};
const ART_KEY='2006_anycall_vh_art';
const IM={im:{},bad:{},rs:1,use:false,pref:null,half:{},cap:3,ema:0,slow:0};
/* 그리는 데 오래 걸리면(한 장에 14ms 넘게 계속) 배율을 한 단계 낮춘다 */
function drawCost(ms){if(!IM.use)return;IM.ema=IM.ema?IM.ema*.92+ms*.08:ms;if(IM.ema>14&&IM.rs>2){if(++IM.slow>90){IM.cap=IM.rs-1;IM.slow=0;IM.ema=0}}else IM.slow=0}
function artPref(){if(IM.pref==null){try{IM.pref=(w.localStorage&&w.localStorage.getItem(ART_KEY))||'new'}catch(_){IM.pref='new'}}return IM.pref}
function setArtPref(v){IM.pref=v;try{w.localStorage&&w.localStorage.setItem(ART_KEY,v)}catch(_){}dropHi()}
function artOn(){return artPref()!=='dot'}
function imgLoad(keys){if(!host||!host.makeImage)return;for(const k of keys||Object.keys(SHEET)){if(IM.im[k]||IM.bad[k])continue;let im=null;try{im=host.makeImage(IMGDIR+SHEET[k],()=>{dropHi()})}catch(_){im=null}
 if(!im){IM.bad[k]=1;continue}try{im.onerror=()=>{IM.bad[k]=1}}catch(_){}IM.im[k]=im}}
function imgOk(k){const im=IM.im[k];return !!(im&&!IM.bad[k]&&im.complete&&im.naturalWidth>0)}
/* 배율이 바뀌거나 새 그림이 들어오면 큰 그림 저장분을 버린다 */
function dropHi(){for(const k of [...ART.keys()])if(k.startsWith('H:'))ART.delete(k);G.wb=null}
/* 화면 실제 배율을 보고 그릴 크기를 정한다. 새 그림을 못 쓰면 1배(예전 그대로) */
function setRS(g){let a=1;try{const m=g.getTransform&&g.getTransform();if(m)a=Math.hypot(m.a,m.b)||1}catch(_){}
 IM.ds=a;const use=artOn()&&imgOk('hero');const want=use?clamp(Math.round(a),2,IM.cap):1;IM.use=use&&want>=2;if(want!==IM.rs){IM.rs=want;dropHi()}}
function hq(g){g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(_){}}
/* 그림 한 칸을 원하는 크기로 줄인다 (반씩 여러 번 줄여서 또렷하게). mode/tint 는 색 덧칠 */
const MODE_T={white:['#ffffff',.82],sil:['#cbb8ff',1,'source-in'],red:['#ff1830',.4],dark:['#000000',.62],ghost:['#a8c8ff',.45]};
const TINT={wolfB:['#000000',.4],wolfW:['#ffffff',.4],ghoulB:['#30307a',.32],skelR:['#a02818',.32],crypt:['#000000',.32],night:['#000010',.25]};
function shrink(im,sx,sy,sw,sh,W,H){let src=im;while(sw>W*2.1&&sh>H*2.1){const c2=mkcv(Math.ceil(sw/2),Math.ceil(sh/2));if(!c2)break;hq(c2.g);try{c2.g.drawImage(src,sx,sy,sw,sh,0,0,c2.w,c2.h)}catch(_){break}src=c2.c;sx=0;sy=0;sw=c2.w;sh=c2.h}return[src,sx,sy,sw,sh]}
function hiCell(sheet,box,W,H,flip,mode,tint){const key='H:'+sheet+':'+box.join(',')+':'+W+'x'+H+':'+(flip?1:0)+':'+(mode||'')+':'+(tint||'');
 return cached(key,()=>{if(!imgOk(sheet))return null;const cv=mkcv(W,H);if(!cv)return null;const g=cv.g;const [src,sx,sy,sw,sh]=shrink(IM.im[sheet],box[0],box[1],box[2],box[3],W,H);hq(g);
  if(flip){g.translate(W,0);g.scale(-1,1)}try{g.drawImage(src,sx,sy,sw,sh,0,0,W,H)}catch(_){return null}if(flip)g.setTransform(1,0,0,1,0,0);
  const L=[];if(tint&&TINT[tint])L.push(TINT[tint]);if(mode&&MODE_T[mode])L.push(MODE_T[mode]);for(const [col,a,op] of L){g.globalCompositeOperation=op||'source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(0,0,W,H)}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';return cv})}
/* 그림 칸 → 세상에 놓을 그림 (w,h 는 게임 점, 발끝이 ax,ay) */
function hiSprite(sheet,cell,k,o){const C=(sheet==='hero'?IC_HERO:sheet==='mob'?IC_MOB:sheet==='boss'?IC_BOSS:IC_PROP)[cell];if(!C)return null;
 let box=[C[0],C[1],C[2],C[3]];if(o&&o.crop){const y=Math.round(box[3]*o.crop);box=[box[0],box[1]+y,box[2],box[3]-y]}
 const RS=IM.rs,W=Math.max(2,Math.round(box[2]*k*RS)),H=Math.max(2,Math.round(box[3]*k*RS));const cv=hiCell(sheet,box,W,H,o&&o.flip,o&&o.mode,o&&o.tint);if(!cv)return null;
 const w2=W/RS,h2=H/RS;let ax=(C[4]-C[0])*k;if(o&&o.flip)ax=w2-ax;return{c:cv.c,w:w2,h:h2,ax,ay:h2*(o&&o.foot!=null?o.foot:.985),hi:1,k:RS}}
/* 주인공: 앞쪽(오른쪽 아래) 여섯, 뒤쪽(오른쪽 위) 여섯. 왼쪽을 볼 때는 좌우로 뒤집는다 */
const HERO_IMG={se_stand:'0,0',se_w1:'1,0',se_w2:'2,0',se_atk:'3,0',se_cast:'4,0',se_roll:'5,0',ne_stand:'0,1',ne_w1:'1,1',ne_w2:'2,1',ne_atk:'3,1',ne_cast:'4,1',ne_roll:'5,1'};
const HERO_K=27/431;
/* 괴물과 우두머리: [그림 파일, 칸들(걷기1, 걷기2, 공격, 쓰러짐), 게임 키, 기준 칸 높이] */
const MON_IMG={wolf:['mob',['0,0','1,0','2,0'],18],bat:['mob',['3,0','4,0','5,0'],13],ghoul:['mob',['0,1','1,1','2,1'],24],skel:['mob',['3,1','4,1','5,1'],25],
 spawn:['mob',['0,2','1,2','2,2','3,3'],26],rat:['mob',['3,2','4,2','5,2'],7],crow:['mob',['2,3','1,3','2,3'],8],bones:['mob',['4,3'],8],
 alpha:['boss',['0,0','0,0','1,0'],34],knight:['boss',['2,0','3,0'],36],guest:['boss',['0,1','0,1','1,1','m:3,3'],33],lucia:['boss',['2,1','2,1','3,1','2,1'],38]};
function monImg(name,idx,o){let key=name;if(name==='vamp')key=o.remap==='spawn'?'spawn':'guest';const D=MON_IMG[key];if(!D)return null;const sheet=D[0],L=D[1];
 let cell=L[Math.min(L.length-1,idx||0)];const ref=(sheet==='mob'?IC_MOB:IC_BOSS)[L[0]];if(!ref)return null;const k=D[2]/ref[3];let sh=sheet;
 if(cell.startsWith('m:')){sh='mob';cell=cell.slice(2)}
 const tint=o.remap&&TINT[o.remap]?o.remap:'';const kk=sh!==sheet?D[2]*.82/IC_MOB[cell][3]:k;
 return hiSprite(sh,cell,kk,{flip:o.flip,mode:o.mode,tint,foot:key==='bat'||key==='lucia'||(key==='crow'&&idx===1)?.99:.985})}
/* 물건: [칸, 게임 높이, 잘라 낼 위쪽 비율] */
const PROP_IMG={pine:['0,0',54],dead:['1,0',48],grave:['2,0',17],cross:['3,0',21],statue:['4,0',32],candle:['5,0',19],brazier:['6,0',19],brazierOff:['6,0',19,.43],lamp:['7,0',38],
 urn:['0,1',13],crate:['1,1',13],barrel:['2,1',14],chest:['3,1',11],chestO:['4,1',14],coffin:['5,1',15],coffinO:['6,1',15],well:['7,1',30],
 altar:['0,2',27],bed:['1,2',22],table:['2,2',18],pew:['3,2',16],organ:['4,2',44],wagon:['5,2',31],firepit:['6,2',15],forge:['7,2',31]};
function propImg(kind,vr){const P=PROP_IMG[kind];if(!P||!imgOk('prop'))return null;const C=IC_PROP[P[0]];const k=P[1]/C[3];const flip=(kind==='pine'||kind==='dead'||kind==='grave'||kind==='cross')&&(vr&1);
 return hiSprite('prop',P[0],k,{flip,crop:P[2]||0,foot:1})}
/* 새 sprite: 새 그림을 쓸 수 있으면 새 그림, 아니면 도트 그림 */
function sprite(set,name,idx,o={}){
 if(IM.use){let sp=null;
  if(set==='hero'&&imgOk('hero')){const cell=HERO_IMG[name];if(cell)sp=hiSprite('hero',cell,HERO_K,{flip:o.flip,mode:o.mode,foot:.965});else if(name==='dead')sp=heroDead(o)}
  else if(set==='mon'){const key=name==='vamp'?(o.remap==='spawn'?'spawn':'guest'):name;const D=MON_IMG[key];if(D&&imgOk(D[0])&&imgOk('mob'))sp=monImg(name,idx,o)}
  if(sp)return sp}
 const s=spriteDot(set,name,idx,o);return s}
/* 쓰러진 주인공: 구르기 그림을 눕혀서 어둡게 */
function heroDead(o){const base=hiSprite('hero','5,0',HERO_K,{mode:o.mode});if(!base)return null;return cached('H:hdead:'+IM.rs+':'+(o.mode||''),()=>{const W=Math.round(base.h*IM.rs),H=Math.round(base.w*IM.rs);const cv=mkcv(W,H);if(!cv)return null;const g=cv.g;hq(g);
  g.translate(W/2,H/2);g.rotate(Math.PI/2);g.drawImage(base.c,-base.w*IM.rs/2,-base.h*IM.rs/2);g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=.35;g.fillStyle='#200008';g.fillRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  return{c:cv.c,w:W/IM.rs,h:H/IM.rs,ax:W/IM.rs/2,ay:H/IM.rs-1,hi:1,k:IM.rs}})}
function propCv(kind,vr){if(IM.use){const sp=propImg(kind,vr);if(sp)return sp}return propDot(kind,vr)}
/* 대화 얼굴: 6×3 칸 */
const FACE_IMG={abel:[0,0],abelR:[1,0],marta:[2,0],ana:[3,0],toma:[4,0],emil:[5,0],josef:[0,1],miklos:[1,1],rada:[2,1],ivan:[3,1],dragomir:[4,1],guest:[5,1],
 lucia:[0,2],gregor:[1,2],mina:[2,2],villagerW:[3,2],villager:[4,2],coachman:[5,2]};
function faceImg(name,W,H){const F=FACE_IMG[name];if(!F||!imgOk('face'))return null;const im=IM.im.face,cw=im.naturalWidth/6,ch=im.naturalHeight/3;
 const box=[Math.round(F[0]*cw+5),Math.round(F[1]*ch+5),Math.round(cw-10),Math.round(ch-10)];return hiCell('face',box,W,H,false,'','')}
/* ---------- 땅 칸 ---------- */
/* 글자 → [칸들(짝수/홀수), 잘라 쓸 크기] 칸 가운데를 조금 안쪽으로 잘라 이음매를 줄인다 */
const FLOOR_IMG={'.':[['0,0'],.86],',':[['1,0'],.5,[[-.25,0],[-.1,.3],[0,-.3],[-.3,.25]]],';':[['2,0'],.45,[[0,.3],[-.24,.2],[.24,.2],[0,.42]]],':':[['3,0'],.46],'_':[['0,1'],.86],'=':[['1,1'],.86],'-':[['2,1'],.86],'"':[['3,1'],.86],'~':[['0,2'],.8],
 'b':[['1,2'],.9],'%':[['2,2'],.4],'*':[['3,2'],.86],'+':[['0,3','1,3'],.88],'w':[['0,0'],.86]};
function wallHalf(key){/* 큰 그림을 반으로 줄인 사본 (비스듬히 늘릴 때 품질을 위해) */
 if(IM.half[key])return IM.half[key];if(!imgOk(key))return null;const im=IM.im[key];const cv=mkcv(Math.ceil(im.naturalWidth/2),Math.ceil(im.naturalHeight/2));if(!cv)return null;hq(cv.g);try{cv.g.drawImage(im,0,0,cv.w,cv.h)}catch(_){return null}return IM.half[key]=cv.c}
function floorHi(ch,vr,par){const F=FLOOR_IMG[ch];if(!F||!imgOk('floor'))return null;const RS=IM.rs;const cell=F[0][F[0].length>1?(par?0:1):0];const v=vr&3;
 return cached('H:f:'+ch+':'+v+':'+(par?1:0)+':'+RS,()=>{const C=IC_FLOOR[cell];if(!C)return null;const half=wallHalf('floor');if(!half)return null;const W=32*RS,H=16*RS;const cv=mkcv(W,H);if(!cv)return null;const g=cv.g;
  /* 가운데와 반너비, 반높이 (그림 점) */
  const cx0=(C[0]+C[2])/2,cy0=(C[1]+C[3])/2,hw0=(C[2]-C[0])/2,hh0=hw0*.5;const sz=F[1];let cx=cx0,cy=cy0;
  if(sz<.8){const off=(F[2]||[[0,0],[-.18,.04],[.18,-.04],[0,.2]])[v];cx+=off[0]*hw0;cy+=off[1]*hh0}
  const hw=hw0*sz,hh=hh0*sz;const mir=(v&1)&&sz>=.8?-1:1;
  g.beginPath();g.moveTo(W/2,-.6);g.lineTo(W+.6,H/2);g.lineTo(W/2,H+.6);g.lineTo(-.6,H/2);g.closePath();g.clip();hq(g);
  const sx=mir*(W/2)/hw,sy=(H/2)/hh;g.setTransform(sx,0,0,sy,W/2-cx*sx,H/2-cy*sy);try{g.drawImage(half,0,0,half.width*2,half.height*2)}catch(_){return null}
  g.setTransform(1,0,0,1,0,0);return cv.c})}
/* 보이는 땅 칸을 큰 그림으로 덮는다 (밑에는 도트 땅이 깔려 있어 칸 사이 틈이 비지 않는다) */
function drawFloorHi(wg,m){if(!IM.use||!imgOk('floor'))return;const cx=G.cam.x-G.cam.ox,cy=G.cam.y-G.cam.oy;
 const dMin=Math.floor((cx-AX-20)/16)-1,dMax=Math.ceil((cx+(VW-AX)+20)/16)+1,sMin=Math.floor((cy-AY-10)/8)-1,sMax=Math.ceil((cy+(VH-AY)+20)/8)+1;
 for(let s2=sMin;s2<=sMax;s2++)for(let d=dMin;d<=dMax;d++){if((s2+d)&1)continue;const x=(s2+d)/2,y=(s2-d)/2;if(!inMap(m,x,y))continue;const i=y*m.w+x;if(m.cube[i]&&!m.low[i])continue;
  const t=floorHi(m.fl[i],Math.floor(hash(x,y,3)*4),(x+y)&1);if(!t)continue;const p=scr(x,y,0);try{wg.drawImage(t,p[0]-16,p[1],32,16)}catch(_){}}}
/* ---------- 벽 덩어리: 그림의 큰 면을 덩어리 두 옆면에 비스듬히 붙인다 ---------- */
/* 덩어리 글자 → 면 그림 고르기 (kind = 그 면의 꾸밈) : [칸, 가로 시작, 가로 끝, 덧칠] */
const STONE=['0,0',0,1,''],STONE_D=['0,0',0,1,'crypt'];
const CUBE_IMG={'#':()=>STONE,'|':()=>['4,1',0,1,''],'F':()=>['0,1',0,1,''],'O':()=>['1,1',0,1,''],'U':()=>['1,1',0,1,''],'L':()=>['3,1',0,1,''],
 'X':k=>k==='niche'?['4,0',0,1,'']:STONE_D,'N':k=>k==='niche'?['4,0',0,1,'']:STONE_D,
 'C':k=>k==='gwin'?['3,0',0,1,'']:STONE,'S':k=>k==='gwin'?['3,0',0,1,'']:STONE,'P':k=>k==='gwin'?['3,0',0,1,'']:STONE,'M':()=>STONE,
 'H':k=>k==='win'?['1,0',0,1,'']:['1,0',0,.36,''],'R':k=>k==='win'?['1,0',0,1,'']:['1,0',0,.36,''],'D':k=>k==='win'?['1,0',0,1,'']:['1,0',0,.36,''],
 'I':k=>k==='paint'?['2,1',0,1,'']:['2,1',.03,.27,''],'d':k=>k==='paint'?['2,1',0,1,'']:['2,1',.03,.27,'']};
/* 원래 그림의 평행사변형(왼쪽 아래 BL, 오른쪽 아래 BR, 왼쪽 위 TL)을 목적지 평행사변형에 맞추는 변환 */
function affine(sBL,sBR,sTL,dBL,dBR,dTL){const ux=sBR[0]-sBL[0],uy=sBR[1]-sBL[1],vx=sTL[0]-sBL[0],vy=sTL[1]-sBL[1],Ux=dBR[0]-dBL[0],Uy=dBR[1]-dBL[1],Vx=dTL[0]-dBL[0],Vy=dTL[1]-dBL[1];
 const det=ux*vy-vx*uy;if(Math.abs(det)<1e-6)return null;const a=(Ux*vy-Vx*uy)/det,c=(-Ux*vx+Vx*ux)/det,b=(Uy*vy-Vy*uy)/det,d=(-Uy*vx+Vy*ux)/det;
 return[a,b,c,d,dBL[0]-(a*sBL[0]+c*sBL[1]),dBL[1]-(b*sBL[0]+d*sBL[1])]}
function lerp2(p,q,t){return[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]}
/* 면 하나 그리기: side 0 왼쪽 면(거울), 1 오른쪽 면. v0..v1 은 덩어리 면의 위아래 범위(게임 점), tex 는 [칸, 가로 시작, 가로 끝, 덧칠] */
function wallFace(g,tex,side,v0,v1,oy,RS,low){const Q=IC_WALL[tex[0]];const half=wallHalf('wall');if(!Q||!half)return;
 const BL=[Q[0]/2,Q[1]/2],BR=[Q[2]/2,Q[3]/2],TL=[Q[4]/2,Q[5]/2],up=[TL[0]-BL[0],TL[1]-BL[1]];
 const nat=16*Math.abs(up[1])/Math.max(1,Math.abs(BR[0]-BL[0]));/* 이 면의 원래 높이(게임 점) */
 const hh=v1-v0;let reps=Math.max(1,Math.round(hh/(nat*1.45)));let t1=1;if(low){reps=1;t1=Math.min(1,hh/nat*1.2)}
 const sb=lerp2(BL,BR,tex[1]),se=lerp2(BL,BR,tex[2]);
 for(let r=0;r<reps;r++){const a=v0+hh*r/reps,b=v0+hh*(r+1)/reps;/* 덩어리 면에서 a(위)~b(아래) */
  const sBL=sb,sBR=se,sTL=[sb[0]+up[0]*t1,sb[1]+up[1]*t1];
  let dBL,dBR,dTL;
  if(side){dBL=[16*RS,(16+b+oy)*RS];dBR=[32*RS,(8+b+oy)*RS];dTL=[16*RS,(16+a+oy)*RS]}
  else{dBL=[16*RS,(16+b+oy)*RS];dBR=[0,(8+b+oy)*RS];dTL=[16*RS,(16+a+oy)*RS]}
  const M=affine(sBL,sBR,sTL,dBL,dBR,dTL);if(!M)continue;
  g.save();g.beginPath();g.moveTo(dBL[0],dBL[1]);g.lineTo(dBR[0],dBR[1]);g.lineTo(dBR[0],dBR[1]-(b-a)*RS);g.lineTo(dTL[0],dTL[1]);g.closePath();g.clip();
  g.clearRect(0,0,32*RS,(dBL[1]+RS*2));hq(g);g.setTransform(M[0],M[1],M[2],M[3],M[4],M[5]);try{g.drawImage(half,0,0)}catch(_){}g.setTransform(1,0,0,1,0,0);
  const sh=side?.24:0;const tn=tex[3]?TINT[tex[3]]:null;if(sh||tn){g.globalCompositeOperation='source-atop';if(tn){g.globalAlpha=tn[1];g.fillStyle=tn[0];g.fillRect(0,0,32*RS,(dBL[1]+RS*2))}if(sh){g.globalAlpha=sh;g.fillStyle='#000';g.fillRect(0,0,32*RS,(dBL[1]+RS*2))}g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.restore()}}
/* 도트 꾸밈(문, 깃발, 거미줄)을 그림 면 위에 다시 그린다 */
function decoAgain(g,base,side,kind,h,oy,RS){const fs=c=>8+((c+1)>>1);let u0,u1,a,b;
 if(kind==='door'){u0=4;u1=12;a=Math.max(4,h-22);b=h}else if(kind==='banner'){u0=5;u1=11;a=3;b=19}else if(kind==='web'){u0=0;u1=6;a=0;b=6}else return;
 const pts=side?[[16+u0,fs(15-u0)+a+oy],[16+u1,fs(15-u1)+a+oy],[16+u1,fs(15-u1)+b+oy],[16+u0,fs(15-u0)+b+oy]]:[[u0,fs(u0)+a+oy],[u1,fs(u1)+a+oy],[u1,fs(u1)+b+oy],[u0,fs(u0)+b+oy]];
 g.save();g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0]*RS,p[1]*RS):g.moveTo(p[0]*RS,p[1]*RS));g.closePath();g.clip();g.imageSmoothingEnabled=false;try{g.drawImage(base.c,0,0,32*RS,base.c.height*RS)}catch(_){}g.restore()}
function cubeCv(ch,deco,lit,ho){const base=cubeDot(ch,deco,lit,ho);if(!IM.use||!base||!CUBE_IMG[ch]||!imgOk('wall'))return base;const RS=IM.rs;
 return cached('H:c:'+ch+':'+(deco||'')+':'+(lit?1:0)+':'+(ho||0)+':'+RS,()=>{const D=CUBE[ch];const h=base.h,extra=base.extra,oy=extra;const W=32*RS,H=(16+h+extra)*RS;const cv=mkcv(W,H);if(!cv)return base;const g=cv.g;
  g.imageSmoothingEnabled=false;try{g.drawImage(base.c,0,0,W,H)}catch(_){return base}
  const dside=deco?(deco.slice(-1)==='r'?1:0):-1,dkind=deco?deco.slice(0,-1):'';const top=(D.tex==='house')?Math.min(D.roof,h-2):0;
  for(const side of [0,1]){const kind=dside===side?dkind:'';const tex=CUBE_IMG[ch](kind);if(!tex)continue;wallFace(g,tex,side,top,h,oy,RS,!!ho);if(kind)decoAgain(g,base,side,kind,h,oy,RS)}
  return{c:cv.c,h,extra,hi:1}})}
/* 덩어리 그림 놓기 (큰 그림은 게임 점 크기로 줄여서) */
function putCube(g,cu,x,y,a){if(a!=null&&a<1)g.globalAlpha=a;try{if(cu.hi){hq(g);g.drawImage(cu.c,x,y,32,16+cu.h+cu.extra);g.imageSmoothingEnabled=false}else g.drawImage(cu.c,x,y)}catch(_){}if(a!=null&&a<1)g.globalAlpha=1}
/* ---------- 장비와 물건 ---------- */
const WEAPON={
 cane:{n:'은장 지팡이칼',atk:8,reach:1.15,arc:1.2,fx:'slash',d:'은으로 감싼 지팡이 속 칼. 빠르고 가볍다. 세 번 이어 벤다.',
  combo:[{w:60,a:90,r:150,m:1,step:.16},{w:55,a:90,r:150,m:1.1,step:.16},{w:85,a:110,r:250,m:1.7,step:.3,kb:2.6}],chg:{m:2.3,r:1.55}},
 whip:{n:'사냥꾼의 사슬 채찍',atk:12,reach:2.15,arc:.42,fx:'whip',d:'은사슬을 꼬아 만든 채찍. 멀리 닿고 한 줄로 늘어선 적을 함께 때린다.',
  combo:[{w:105,a:100,r:190,m:1,step:.05},{w:95,a:100,r:190,m:1.1,step:.05},{w:130,a:120,r:300,m:1.8,step:.1,kb:2.2}],chg:{m:2.5,r:2.3}},
 axe:{n:'은 도끼',atk:17,reach:1.25,arc:1.55,fx:'heavy',d:'무덤지기 집안에 내려오는 은 도끼. 느리지만 한 번에 크게 벤다.',
  combo:[{w:150,a:110,r:260,m:1,step:.2},{w:165,a:120,r:380,m:1.9,step:.35,kb:3.4}],chg:{m:3,r:1.8}}};
const COAT={travel:{n:'여행용 외투',def:2,d:'런던에서 입고 온 낡은 외투.'},leather:{n:'사냥꾼 가죽 코트',def:5,price:180,d:'두꺼운 소가죽. 이빨과 발톱을 잘 막는다.'},
 priest:{n:'성직자 망토',def:4,mp:20,price:220,d:'축복받은 천. 성력이 20 늘어난다.'},silk:{n:'은실 코트',def:8,price:480,d:'은실을 촘촘히 박은 사냥꾼 코트.'}};
const RELIC={locket:{n:'어머니의 목걸이',d:'체력이 4분의 1 아래로 떨어지면 조금씩 회복된다.',regen:1},rosary:{n:'묵주',d:'성스러운 피해가 15% 늘어난다.',holy:.15},
 garlic:{n:'마늘 목걸이',d:'피를 빨리지 않고, 받는 피해가 5% 줄어든다.',price:150,garlic:1,dr:.05},fang:{n:'늑대 송곳니 부적',d:'치명타가 6% 늘어난다.',crit:.06},
 charm:{n:'아이들의 부적',d:'경험치를 10% 더 얻는다.',exp:.1},boots:{n:'가죽 장화',d:'구르기가 20% 멀리 간다.',price:120,roll:.2},eye:{n:'집시의 눈',d:'지도에 아직 열지 않은 상자가 보인다.',eye:1},
 iron:{n:'쇠 장갑',d:'공격이 3 늘어난다.',price:260,atk:3}};
const ITEM={herb:{n:'약초 물약',d:'체력을 60 채운다.',price:30,hp:60},tonic:{n:'강장제',d:'에밀이 만든 약. 체력을 150 채운다.',price:90,hp:150},
 wine:{n:'붉은 포도주',d:'체력 25와 성력 25를 채운다.',price:24,hp:25,mp:25},prayer:{n:'기도문',d:'성력을 모두 채운다.',price:40,mp:999},
 jerky:{n:'사냥꾼 육포',d:'체력을 30 채운다.',price:15,hp:30},chicken:{n:'통닭 구이',d:'벽 속에 숨어 있던 통닭. 왜 여기 있는지는 묻지 말자. 체력을 모두 채운다.',hp:9999},
 silver:{n:'은 조각 묶음',d:'보조 무기 탄환 10개.',price:25,silver:10},
 key:{n:'묘지 철문 열쇠',d:'무덤지기 이반의 녹슨 열쇠.',key:1},crest:{n:'드라고미르 가문 문장',d:'은으로 된 용 문장. 묘당 문에 꼭 맞는다.',key:1},
 mirror:{n:'집시의 손거울',d:'흡혈귀는 거울에 비치지 않는다.',key:1},candle:{n:'은 촛대',d:'대장장이 미클로시가 찾는 은 촛대.',key:1},
 lantern:{n:'무덤지기의 등불',d:'이반의 할아버지가 쓰던 등불.',key:1},wing:{n:'박쥐 날개',d:'의사 에밀이 약 재료로 쓴다.',key:1}};
const SUB={bow:{n:'석궁',cost:1,cd:240,d:'은 화살을 쏜다. 빠르고 곧게 날아간다.'},holy:{n:'성수',cost:3,cd:520,d:'던지면 거룩한 불길이 인다. 언데드와 흡혈귀에게 두 배.'},
 cross:{n:'십자가',cost:4,cd:700,d:'날아갔다 돌아오는 은 십자가. 가는 길의 모든 적을 벤다.'}};
const SKILL={
 combo4:{n:'네 번째 베기',tree:0,sp:1,d:'세 번 베기 뒤에 한 번 더 크게 벤다.'},
 counter:{n:'반격',tree:0,sp:1,need:'combo4',d:'완벽 회피 시간이 두 배, 반격 피해가 더 커진다.'},
 spin:{n:'회전 베기 강화',tree:0,sp:1,need:'combo4',d:'모아 베기가 더 넓고 세진다.'},
 dash:{n:'질풍 베기',tree:0,sp:2,need:'spin',act:1,mp:14,cd:600,d:'앞으로 바람처럼 내달리며 베어 버린다.'},
 silverUp:{n:'은 조각 모으기',tree:1,sp:1,d:'은 조각을 더 많이 줍고, 최대 탄환이 20 늘어난다.'},
 bolt3:{n:'세 갈래 화살',tree:1,sp:1,need:'silverUp',d:'석궁이 화살 세 대를 부채꼴로 쏜다.'},
 holyUp:{n:'성수 불길',tree:1,sp:1,need:'silverUp',d:'성수 불길이 더 넓고 오래 탄다.'},
 sign:{n:'성호 긋기',tree:2,sp:1,act:1,mp:22,cd:900,d:'성호를 그어 둘레의 적을 밀어내는 거룩한 빛.'},
 pray:{n:'기도',tree:2,sp:1,need:'sign',act:1,mp:28,cd:4000,d:'잠시 기도하여 체력을 30% 되찾는다.'},
 faith:{n:'굳은 믿음',tree:2,sp:2,need:'pray',d:'방어 3, 체력 25가 늘어난다.'}};
const TREE_NAME=['검술','사냥술','신앙'];
const TAROT={magician:{n:'I. 마법사',d:'성력 +15',mp:15,where:'안개 숲'},strength:{n:'VIII. 힘',d:'공격 +2',atk:2,where:'비스트리차 마을'},
 moon:{n:'XVIII. 달',d:'치명타 +5%',crit:.05,where:'공동묘지'},tower:{n:'XVI. 탑',d:'보조 무기 피해 +20%',sub:.2,where:'드라고미르 납골당'}};
const PAGES=['5월 2일. 비스트리차에 닿았다. 이곳 사람들은 밤마다 창문에 마늘을 건다. 묘지에서 「하얀 여자」를 보았다는 아이가 있다. 내가 쫓는 것이 백작의 신부 가운데 하나일까.',
 '5월 9일. 촌장의 딸 루치아가 물렸다. 수혈을 권했고, 젊은 의사가 제 피를 내주었다. 네 번이나. 그러나 늦었다. 그녀는 이미 「그분」의 것이 되었다. 나는 근원을 끊으러 보르고 고개로 간다.',
 '5월 20일. 고개 너머 성에 닿았다. 백작은 나를 손님으로 맞았다. 그의 눈은... 아벨, 내 아들아. 너에게 끝내 말하지 못한 것이 있다. 네 어머니에 대해. 그녀가 너를 품고 있던 그 겨울 밤에...'];
/* ---------- 괴물 ---------- */
const ENEMY={
 wolf:{n:'회색 늑대',set:'wolf',hp:38,atk:8,def:1,spd:3.5,r:.33,exp:7,gold:[1,4],ag:6,tags:['beast'],ai:'wolf',lore:'카르파티아의 늑대. 밤이면 누군가의 부름을 받고 사람을 노린다. 빙빙 돌다가 몸을 낮추면 달려든다. 구르기로 피하고 반격하라.'},
 bat:{n:'흡혈 박쥐',set:'bat',hp:18,atk:5,def:0,spd:3.1,r:.26,exp:4,gold:[0,2],ag:6,tags:['beast'],fly:1,ai:'bat',drop:['wing',.45],lore:'흡혈귀의 심부름꾼. 급강하하기 전에 끽 하고 운다. 물리면 피를 조금 빨린다.'},
 ghoul:{n:'구울',set:'ghoul',hp:72,atk:12,def:2,spd:1.45,r:.33,exp:12,gold:[2,6],ag:5,tags:['undead'],ai:'ghoul',lore:'무덤을 파헤쳐 시체를 먹는 자. 느리지만 손톱이 날카롭다. 땅속에서 기어 나온다.'},
 skel:{n:'해골 병사',set:'skel',hp:46,atk:9,def:3,spd:1.8,r:.3,exp:11,gold:[1,5],ag:6.5,tags:['undead'],ai:'skel',lore:'옛 전쟁에서 죽은 병사의 뼈. 뼈다귀를 던진다. 무너져도 다시 일어나니, 뼈 더미를 한 번 더 내려치거나 성수를 뿌려라.'},
 spawn:{n:'갓 깨어난 흡혈귀',set:'vamp',remap:'spawn',hp:96,atk:14,def:3,spd:2.7,r:.33,exp:24,gold:[3,9],ag:6.5,tags:['vampire','undead'],ai:'vamp',stake:1,lore:'물린 지 얼마 안 된 흡혈귀. 쓰러뜨린 뒤 말뚝을 박지 않으면 다시 일어난다. 쓰러진 흡혈귀 곁에서 공격 키를 누르면 말뚝을 박는다.'},
 rat:{n:'시궁쥐',set:'rat',hp:10,atk:4,def:0,spd:3.2,r:.2,exp:2,gold:[0,1],ag:5,tags:['beast'],ai:'rat',lore:'무덤과 지하에 들끓는 쥐 떼. 흡혈귀가 부리는 작은 짐승들.'},
 crow:{n:'까마귀',set:'crow',hp:12,atk:4,def:0,spd:3,r:.22,exp:3,gold:[0,2],ag:3.2,tags:['beast'],fly:1,ai:'crow',lore:'묘지의 파수꾼. 낯선 이가 다가오면 시끄럽게 울며 덤벼든다.'},
 alpha:{n:'늑대 우두머리',set:'alpha',hp:420,atk:18,def:4,spd:3.3,r:.55,exp:140,gold:[40,60],ag:9,tags:['beast'],ai:'alpha',boss:1,big:1,lore:'붉은 눈의 거대한 늑대. 울부짖어 무리를 부르고 높이 뛰어올라 덮친다. 땅에 생기는 붉은 원을 피하라.'},
 knight:{n:'뼈 기사',set:'knight',hp:520,atk:22,def:7,spd:1.5,r:.45,exp:180,gold:[50,80],ag:9,tags:['undead'],ai:'knight',boss:1,big:1,lore:'드라고미르 묘당을 지키는 기사의 뼈. 방패로 앞을 막는다. 뒤를 노리거나 모아 베기, 성수로 방패를 깨뜨려라.'},
 guest:{n:'창백한 손님 라슬로',set:'vamp',hp:560,atk:19,def:5,spd:3,r:.36,exp:200,gold:[60,90],ag:12,tags:['vampire','undead'],ai:'guest',stake:1,boss:1,lore:'백작의 사자. 사람 행세를 하며 여관에 묵고 있었다. 거울에 비치지 않는다.'},
 lucia:{n:'하얀 귀부인 루치아',set:'lucia',hp:1500,atk:23,def:6,spd:2.3,r:.42,exp:500,gold:[0,0],ag:20,tags:['vampire','undead'],ai:'lucia',stake:1,boss:1,fly:1,lore:'드라고미르 촌장의 딸. 40일 전 「병」으로 죽었다. 아이들은 그녀를 하얀 옷의 예쁜 언니라 불렀다.'}};
const BEST_ORDER=['wolf','bat','ghoul','skel','spawn','rat','crow','alpha','knight','guest','lucia'];
const DIFF={easy:{n:'쉬움',dmg:.6,hp:.8},normal:{n:'보통',dmg:1,hp:1},hard:{n:'어려움',dmg:1.4,hp:1.25}};
/* ---------- 사람 이름 ---------- */
const NAME={abel:'아벨',abelR:'아벨',marta:'마르타',ana:'아나',toma:'토마',emil:'에밀',josef:'요제프 신부',miklos:'미클로시',rada:'라다 할멈',ivan:'이반',dragomir:'드라고미르 촌장',
 guest:'창백한 손님',lucia:'루치아',gregor:'그레고르',mina:'미나',coachman:'마부',villager:'마을 사람',mihai:'미하이',elena:'엘레나',m1:'미하이 엄마',m2:'엘레나 엄마',patient:'환자'};
const FACE_OF={m1:'marta',m2:'villager',patient:'villager',mihai:'toma',elena:'ana'};
/* ---------- 미나의 전보 ---------- */
const TELE={
 t1:'아벨 씨, 무사히 닿았나요? 교수님의 마지막 전보는 비스트리차 황금 왕관 여관에서 보낸 것이었어요. 안주인을 찾아보세요. 미나.',
 t2:'아이들이 밤에 사라지는 일은 50년 전에도 그 마을에 있었대요. 그때도 「하얀 옷의 여자」 이야기가 돌았고요. 조심하세요. 미나.',
 t3:'교수님 일기를 찾았다고요? 그 글씨, 틀림없이 교수님 거예요. 「백작의 신부」라는 말... 기사회 문서고를 뒤져 볼게요. 미나.',
 t4:'흡혈귀가 사람 행세를 했다니. 거울에 비치지 않는다는 옛말이 사실이었군요. 이제 묘당 문을 열 수 있겠어요. 꼭 살아 돌아와요. 미나.',
 t5:'아벨 씨, 런던에서 교수님의 다른 전보가 발견됐어요. 「보르고 고개. 검은 마차를 타지 마라.」 다음 길은 고개 너머예요. 미나.'};
const MAP_ROWS={"village": ["TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT","....,,,,,TT,,,T,,,,,TT,,,,,T,T","T...,,,,T,,,,,,,,,,,,,,,HHHH,T","T....,,,,,,,,,,,jCCCCCC,HRRH,T","T,,...,,T,,,,,,,,CSCCCC,HRRH,T","TT,,...,,,,,TTT,,CCCCCC,HDHH,T","TT,,J...,,,TT,,,,CCCCCC,g.n,,T","TT,,,,...,,,T,T,,CCCCCC,,,,,,T","T,,HHHHH..,,,J,,g,,<,,,g,T,,,T","T,,HRRRHn...........,,,,,T,,,T","T,,HRRRD>...,,,,,,,FFFFFFFFFFT","TTTHRRRHT,...,,,J,,FB,,,,,,BFT","T,,HRRRHo,J.o....xTF,HHHHHH,FT","T,,HHHHHx,,,......,F,HRRRRH,FT","T,,:::::,,T,..W...,F,HRRRRH,FT","T,,::z::,,,,......,F,HRRRRH,FT","T,,h::::T,,,......JF,HHDHHH,FT","T,,,,,,,HHHHh......Ff,,[,,,BFT","T,HHHHH,HRRH,,,,,..F,,,.,,,,FT","T,HRRRH,HRRD]...........FFFFFT","T,HRRRD:HRRH,,,,,,,...,,,HHHHT","T,HRRRH,HHHHx,,,,,,,...,,HRRHT","T,HHHHH,,,,,,,,T,,,,,...,HRRHT","T,,::::::::,HHHHx,T,,J...HDHHT","T,,:Z:::h::,HRRHq:::::,....,,T","T,T:::e::::THRRHaTT,,,,,...,JT","TT,::::::::,HHHHo,,,,,,,,...,T","T,,:::::::::::::::::::::::...T","T,,,,,,,,,,,,,,,,,T,,T,,,,,...","TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"],"forest": [":::TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT",":::::;;Y;;;;T;;;;;;;TTT;;;Y;;TT;TT","::::::;;;;;;;;T;;;;;;;;;;;;;;;;T;T","T:::::::::;;:::::::::;T;;;;;;T;;TT","TT;:::::::::;TT;TTY;T::;;;B;;T;Y;T","T;;;::::::::T;Y;T;T;;T;;;;;;;;;;;T","TT;T;;;;:::::;T;TTTTT;;;;;;B;;;;TT","T;;TT;;;;:::::;T~~~~~~~;r;;;;T;T;T","T;;;;TTT;;::::~~~~~~~~~~;;;TT;T;;T","~~;;T;;T;TT:bb~~T;;;;T;~~~~;T;;;;T","~~~;T;T;;T~bbb;Y;;;;;;;T~~~~~T;;YT","T;~~~~~~~~~b::;T;T;;T;;T;TT~~~~~~~","T;THHHH::o;::::T;;TT;;;;Y;;;;~~~~~","T;;HRRD:::;::::::;TT;T;;;;T;T;T;;T","T;;HRRH:e::;::::::::::;;;;;;;T;;;T","T;THHHH:::T;;::::::::::T;;TTTT;T;T","TTT;;;;x::;;T;;:::::::::;;;;;;;;;T","T;TTYT;;;T;;TT;T:;TYr,:::,,rTT;;;T","T;;T;TTTTTT;;;;;:;TT,,::::,,;;;;TT","T;;T;;;T;TT;;;;;:T;;,,:::::,;;;;TT","TT;;T;;Y;;;;T;T;:;;;,,,:::::;;TTYT","TT;;YT;;T;;;;;T;:T;T,,,,:::::;TT;T","T;T;;;;;;TT;;TY:;;;T,,,,,:::::;TTT","T;;T;;T;;;T;;;:;;TT;r,,,,,::::::TT","T;;;;;;;;T;;r:;;;;T;;T;;;;T::::::T","TT;;;;T;TT;;;;Y;TTTT;;T;T;;;::::::","T;;;;;;;;T;T;T;;;;T;;;TT;;Y;T;::::","TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:::"],"cemetery": ["F::FFFFFFFFFFFFFFFFFFFFFFFFFFFFF","::::;;;;;;;;;;;;;;;;;;;;;;;;;;;F",":::::;;;;;;;;;;;;;;;;;;;;HHHHH;F","F:::::;;;;;;;;%;;;;;;Y;;%HRRRH;F","F;:::::;;g;%g;;g;;g;;g;;gHRRRH;F","F;;:::::;;%j;;;;;;;;;%;j%HHDHH;F","F;;;::::;;;;;;A;;;;;A;;;;o;:Y;YF","F;;;;:::;;;;;;;Y;;;;;;;;;Y:;;x;F","F;;;;:::;g;;g;;g;;g;;g;;g;:g;;YF","F;;;;:::;;;;;;;;;j;;;;;;;:;;;;%F","F;;;;:::;;;;;;;YY;;;;;;;:;;;;;;F","F;;;;:::;;;;;;;;;;;;%;Y:;;;;;;;F","F;;;;:::;;;;;;;;;;;%;;;:;;;;;;;F","F;;;;:::::::::::;;;;;::%;;;Y;Y;F","F;;;;:::::::::::;;:::;;;;;;;;;;F","F;;;;::::::::::::;|||||||||||||F","F;;;Y;;:;;;;;::::%|**MMMMMMM**|F","F;CCC\"C:C;;;;;:::;|**MMMMMMM**|F","F;C\"\"\"\"\":g;Yg;::::|**MMMMMMM**|F","F;Cc\"Q\"c:;;;;;::::|**MMMMMMM**|F","F;C\"\"\"\"\"C:;;j;Y:::|**MMMMMMM**|F","F;\"\"\"\"\"\"\":;;;;;:::|**MMMUMMM**|F","F;C\"\"\"\"\"Cg;;g;%:::|***********|F","F;C\"p\"p\"CY;;;A;:::|*A*c***c*A*|F","F;C\"\"\"\"\"\";;;;;;:::************|F","F;C\"CCCCCg;;g;;:::************|F","F;Y;;;;;;j;Y;;;j;;|***********|F","F;;;;;;;;;;;;;;;;;|*A*******A*|F","F;;Y;;;;;;;;;;;;;;|||||||||||||F","FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"],"crypt1": ["XXXXXXXXXXXXXXXXXXXXXXXXXXXX","XXXXXXXXXXXXXXXXXXXXXXXXXXXX","XX------cXXXXXXXXX--------XX","XXK------XXXXXXXXXc------KXX","XX--P---------------P--P--XX","XXK----------------------KXX","XX----P-------------------XX","XXK------XXXXXXXXX-------KXX","XX-------XXXXXXXXX--P--P--XX","XX-XX-XXXXXXXXXXXX-------KXX","X--X---XXXXXXXXXXX-c------XX","X--X---XXXXXXXXXXXXX---XXXXX","XXXX-----------XXXXX-v-XXXXX","XXXX---v-----l-XXXXX---XXXXX","XXXX-----------XXXXX---XXXXX","XXXX---XXXXXXXXXXXXX---XXXXX","XXXX---XXXXXXX------------XX","XXXX---XX---XXKV--------V-XX","XXXX---XX---XX--P------P--XX","XXXX---XXX-XXXK-----------XX","XX----------cX------------XX","XX-c---------X------------XX","XX-----------X--P------P--XX","XX-----------X-V--------V-XX","XX-y-------v-X------------XX","XX-----------XXXXXX-XXXXXXXX","XXXXXXXXXXXXXXXXXXX-XXXXXXXX","XXXXXXXXXXXXXXXXXXXXXXXXXXXX"],"crypt2": ["XXXXXXXXXXXXXXXXXX","XXXXXXXXXXXXXXXXXX","XXXX----------XXXX","XXX---c-K--c---XXX","XX--------------XX","XX---P------P---XX","XX---------!----XX","XX-----!--------XX","XX-c----------c-XX","XX----!---!-----XX","XX--------------XX","XX------!-------XX","XX---P------P---XX","XX--------------XX","XXX------------XXX","XXXX----------XXXX","XXXXXXXX--XXXXXXXX","XXXXXXXXXXXXXXXXXX"],"inn": ["IIIIIIIIIIIII","Is_s_______eI","I___________I","Ittttt__t___I","Io__________I","I___________I","Io__t___t___I","I___________I","I____t____tEI","I___________I","IIIIII_IIIIII"],"church": ["CCCCCCCCCCCCC","C++m++++++s+C","C+++c+Q+c+++C","C+++++++++++C","C+++++++++++C","C+ppp+++ppp+C","C+++++++++++C","C+ppp+++ppp+C","C+++++++++++C","C+ppp+++ppp+C","C+++++++++++C","C+ppp+++ppp+C","C+++++++++++C","C+++++++++++C","CCCCCC+CCCCCC"],"clinic": ["IIIIIIIIII","I____s___I","I_E____E_I","I________I","I________I","I_E____t_I","I________I","I_______oI","I________I","IIIII_IIII"],"mansion": ["IIIIIIIIIIIII","I__s__e__s__I","I___________I","I===========I","I==========LI","I===========I","I=t=======t=I","I===========I","I===========I","Ii==========I","I===========I","IIIIII=IIIIII"]};
/* ---------- 지도 글자 뜻 ---------- */
const LEG={'.':{f:'.'},',':{f:','},';':{f:';'},':':{f:':'},'_':{f:'_'},'=':{f:'='},'-':{f:'-'},'"':{f:'"'},'~':{f:'~',water:1},'b':{f:'b'},'%':{f:'%'},'*':{f:'*'},'w':{f:'w'},'+':{f:'+'},
 '>':{},'<':{},'[':{},']':{},
 '#':{cube:1},'H':{cube:1},'R':{cube:1},'D':{cube:1,door:1},'C':{cube:1},'S':{cube:1},'X':{cube:1},'M':{cube:1},'I':{cube:1},'L':{cube:1},'|':{cube:1,low:1},'F':{cube:1,see:1},'O':{cube:1},'U':{cube:1},'P':{cube:1},
 'T':{prop:'pine'},'Y':{prop:'dead'},'B':{prop:'bush',low:1},'g':{prop:'grave',low:1},'j':{prop:'cross',low:1},'A':{prop:'statue'},
 'c':{brk:'candle'},'u':{brk:'urn'},'x':{brk:'crate'},'o':{brk:'barrel'},
 'K':{prop:'coffin',low:1},'k':{prop:'coffinO',low:1},'W':{prop:'well'},'f':{prop:'fountain'},'a':{prop:'anvil',low:1},'q':{prop:'forge',light:[30,'#ff7a30',1]},
 'Q':{prop:'altar',save:'altar'},'E':{prop:'bed',low:1,save:'bed'},'t':{prop:'table',low:1},'p':{prop:'pew',low:1},'J':{prop:'lamp',light:[36,'#ffd890',.3]},'n':{prop:'sign',low:1},
 'Z':{prop:'wagon'},'h':{prop:'hay',low:1},'r':{prop:'rock',low:1},'l':{lever:1},'m':{prop:'organ'},'e':{prop:'firepit',light:[38,'#ff9a40',1],low:1,save:'fire'},'z':{dummy:1},
 'G':{prop:'cage'},'i':{prop:'mirror'},'y':{prop:'skulls',walk:1},'v':{prop:'bones',walk:1},'!':{prop:'rose',walk:1},'s':{prop:'shelfP'},'V':{brazier:1}};
/* 밝기: c 어둠 색, a 어둠 정도(0 밝음 ~ 1 캄캄) */
const AMB={dusk:{c:'#1a0c2a',a:.42,sky:['#3a1a4a','#c86a5a'],moon:0},night:{c:'#06061a',a:.6,sky:['#05050f','#1a1a3a'],moon:1},dawn:{c:'#2a1a20',a:.2,sky:['#4a6a9a','#f0b080'],moon:0},
 room:{c:'#100808',a:.3},church:{c:'#0a0814',a:.38},crypt:{c:'#030206',a:.8},deep:{c:'#08000a',a:.78}};
const villageAmb=s=>s.flags.ch1_end?AMB.dawn:s.flags.night?AMB.night:AMB.dusk;
/* ---------- 지도 ---------- */
const MAPS={
 village:{n:'비스트리차 마을',base:',',out:1,music:s=>s.flags.ch1_end?'dawn':s.flags.night?'night':'village',amb:villageAmb,fog:.16,birds:1,
  exits:[{x:8,y:10,to:'inn',tx:6,ty:9,dir:[-1,0]},{x:19,y:8,to:'church',tx:6,ty:13,dir:[0,-1]},{x:23,y:17,to:'mansion',tx:6,ty:10,dir:[0,-1]},{x:12,y:19,to:'clinic',tx:5,ty:8,dir:[-1,0]},
   {x:29,y:28,to:'forest',tx:2,ty:3,face:[1,1],edge:1,need:'tut',no:'아직 해야 할 일이 있다. 먼저 여관을 찾자.'},{x:0,y:1,edge:1,no:'보르고 고개로 가는 길. 해가 진 뒤에는 마부들도 이 길로 가지 않는다.'},
   {x:7,y:20,dir:[-1,0],no:'문이 잠겨 있다. 안에서 낮은 기도 소리가 들린다.'},{x:25,y:6,dir:[0,-1],no:'비스트리차 우체국. 「전보는 낮에만 받습니다」'},{x:26,y:24,dir:[0,-1],no:'창문마다 마늘 다발이 걸려 있다. 아무도 문을 열어 주지 않는다.'}],
  deco:{'19,7':'doorl','22,3':'gwinr','21,7':'gwinl','17,5':'gwinr','22,6':'gwinr'},
  looks:[{x:8,y:9,t:'「황금 왕관 여관」 따뜻한 수프와 침대 있음.'},{x:26,y:6,t:'「비스트리차 우체국 · 전신」'},{x:14,y:14,t:'오래된 우물. 밧줄이 끊어져 있다.',once:'well',fn:'well'}],
  npcs:[{id:'coachman',x:4,y:3,face:[1,0],when:s=>!s.flags.tut},{id:'ana',x:13,y:15,face:[1,0],when:s=>!s.flags.ch1_end},{id:'ana',x:9,y:11,face:[1,0],when:s=>!!s.flags.ch1_end},{id:'toma',x:10,y:12,face:[0,-1],when:s=>!!s.flags.ch1_end},
   {id:'miklos',x:17,y:24,face:[-1,0]},{id:'rada',x:7,y:25,face:[1,-1]},{id:'m1',x:13,y:20,face:[1,0],wander:1},{id:'m2',x:15,y:18,face:[0,1],wander:1},{id:'villager',x:11,y:14,face:[1,1],wander:1,when:s=>!s.flags.night||s.flags.ch1_end},
   {id:'mihai',x:14,y:21,face:[0,-1],when:s=>s.flags.kid_mihai>=1},{id:'elena',x:16,y:19,face:[-1,0],when:s=>s.flags.kid_elena>=1}],
  mobs:[{t:'bat',x:18,y:9,when:s=>s.flags.night&&!s.flags.ch1_end},{t:'bat',x:13,y:6,when:s=>s.flags.night&&!s.flags.ch1_end},{t:'wolf',x:25,y:26,when:s=>s.flags.night&&!s.flags.ch1_end},{t:'wolf',x:22,y:27,when:s=>s.flags.night&&!s.flags.ch1_end},{t:'guest',x:15,y:16,when:s=>s.flags.guest_reveal&&!s.flags.guest_dead,arena:'guest',idle:1}],
  items:[{id:'card_strength',x:28,y:3,what:'card:strength'}],
  trig:[{id:'arrive',x0:1,y0:1,x1:6,y1:6,when:s=>!s.flags.tut,run:'arrive'},{id:'guestFight',onLoad:1,when:s=>s.flags.guest_reveal&&!s.flags.guest_dead,run:'guestFight'},{id:'dawn',onLoad:1,when:s=>s.flags.lucia_dead&&!s.flags.ch1_end,run:'dawn'}],
  arenas:{guest:{x0:9.6,y0:9.6,x1:19.4,y1:19.4}}},
 inn:{n:'황금 왕관 여관',base:'_',music:'inn',amb:()=>AMB.room,room:1,
  exits:[{x:6,y:10,to:'village',tx:9,ty:10,face:[1,0],edge:1}],
  npcs:[{id:'marta',x:3,y:2,face:[1,1],reach:2.3},{id:'ivan',x:8,y:7,face:[-1,0],when:s=>!s.flags.q_key},{id:'guest',x:5,y:7,face:[1,1],when:s=>s.flags.night&&!s.flags.guest_reveal},{id:'toma',x:4,y:5,face:[1,0],when:s=>!!s.flags.ch1_end}]},
 church:{n:'성 니콜라오 성당',base:'+',music:'church',amb:()=>AMB.church,room:1,
  exits:[{x:6,y:14,to:'village',tx:19,ty:9,face:[0,1],edge:1}],
  deco:{'0,4':'gwinr','0,9':'gwinr','4,0':'gwinl','9,0':'gwinl','12,6':'','0,12':'gwinr'},
  looks:[{x:3,y:1,t:'파이프 오르간. 건반을 눌러 볼까?',fn:'organ'}],
  npcs:[{id:'josef',x:6,y:3,face:[1,1],reach:1.6},{id:'nun',x:9,y:4,face:[-1,0]}]},
 clinic:{n:'에밀의 진료소',base:'_',music:'clinic',amb:()=>AMB.room,room:1,
  exits:[{x:5,y:9,to:'village',tx:13,ty:19,face:[1,0],edge:1}],
  npcs:[{id:'emil',x:5,y:4,face:[1,1]},{id:'patient',x:3,y:2,face:[1,0],v:0},{id:'patient',x:3,y:5,face:[1,0],v:1},{id:'patient',x:8,y:3,face:[-1,0],v:2}]},
 mansion:{n:'드라고미르 저택',base:'=',music:'manor',amb:()=>AMB.room,room:1,
  exits:[{x:6,y:11,to:'village',tx:23,ty:18,face:[0,1],edge:1}],
  deco:{'0,4':'paintr','0,7':'paintr','5,0':'paintl','8,0':'paintl'},
  looks:[{x:0,y:4,t:'하얀 드레스를 입은 젊은 여인의 초상화. 「루치아 드라고미르, 1876 ~ 1897」'},{x:0,y:7,t:'드라고미르 가문의 문장. 은빛 용이 꼬리를 물고 있다.'},{x:1,y:9,t:'커다란 거울. 비친 내 눈이 잠깐 붉게 빛난 것 같다... 피곤한가 보다.'}],
  npcs:[{id:'dragomir',x:6,y:5,face:[1,1]}]},
 forest:{n:'안개 숲',base:';',out:1,music:'forest',amb:s=>s.flags.ch1_end?AMB.dawn:AMB.night,fog:.5,
  exits:[{x0:0,y0:0,x1:2,y1:0,to:'village',tx:28,ty:27,face:[-1,-1],edge:1},{x0:0,y0:0,x1:0,y1:2,to:'village',tx:28,ty:27,face:[-1,-1],edge:1},
   {x0:31,y0:27,x1:33,y1:27,to:'cemetery',tx:2,ty:3,face:[1,1],edge:1,need:'q_key',no:'묘지로 가는 철문이 굳게 잠겨 있다. 무덤지기 이반이 열쇠를 갖고 있다고 했다.'},{x0:33,y0:24,x1:33,y1:27,to:'cemetery',tx:2,ty:3,face:[1,1],edge:1,need:'q_key',no:'묘지로 가는 철문이 굳게 잠겨 있다. 무덤지기 이반이 열쇠를 갖고 있다고 했다.'},
   {x:7,y:13,dir:[-1,0],no:'그레고르의 오두막. 문이 잠겨 있다.'}],
  npcs:[{id:'gregor',x:8,y:15,face:[0,-1]},{id:'mihai',x:25,y:4,face:[1,1],when:s=>!s.flags.kid_mihai}],
  mobs:[{t:'wolf',x:6,y:5},{t:'wolf',x:9,y:7},{t:'bat',x:13,y:6},{t:'bat',x:15,y:13},{t:'wolf',x:21,y:4},{t:'wolf',x:22,y:6},{t:'wolf',x:23,y:4},{t:'wolf',x:17,y:16},{t:'wolf',x:19,y:14},{t:'bat',x:28,y:24},
   {t:'alpha',x:24,y:20,when:s=>!s.flags.forest_alpha,arena:'alpha',idle:1}],
  chests:[{id:'f_candle',x:9,y:16,item:'candle'},{id:'f_herb',x:27,y:6,item:'herb',n:2}],
  items:[{id:'card_magician',x:13,y:25,what:'card:magician'}],
  trig:[{id:'alpha',x0:20,y0:17,x1:27,y1:23,when:s=>!s.flags.forest_alpha,run:'alpha'}],
  arenas:{alpha:{x0:19.6,y0:16.6,x1:27.4,y1:23.4}}},
 cemetery:{n:'비스트리차 공동묘지',base:';',out:1,music:'cemetery',amb:s=>s.flags.ch1_end?AMB.dawn:AMB.night,fog:.45,rain:1,crows:1,
  exits:[{x0:1,y0:0,x1:2,y1:0,to:'forest',tx:31,ty:25,face:[-1,-1],edge:1},{x0:0,y0:1,x1:0,y1:2,to:'forest',tx:31,ty:25,face:[-1,-1],edge:1},
   {x:24,y:22,to:'crypt1',tx:5,ty:4,face:[0,1],dir:[0,-1],need:'tomb_open',lock:'tomb'},{x:27,y:6,dir:[0,-1],no:'이반의 오두막. 술 냄새가 문틈으로 새어 나온다.'}],
  deco:{'5,17':'','24,21':''},
  npcs:[{id:'ivan',x:26,y:8,face:[1,1],when:s=>!!s.flags.q_key}],
  mobs:[{t:'crow',x:12,y:5},{t:'crow',x:18,y:9},{t:'crow',x:24,y:5},{t:'ghoul',x:14,y:3,bury:1},{t:'ghoul',x:21,y:5,bury:1},{t:'ghoul',x:20,y:11,bury:1},{t:'ghoul',x:19,y:12,bury:1},
   {t:'skel',x:10,y:16},{t:'skel',x:13,y:22},{t:'skel',x:12,y:26},{t:'bat',x:8,y:10},{t:'bat',x:26,y:13},{t:'ghoul',x:14,y:23,bury:1},
   {t:'knight',x:24,y:25,when:s=>!s.flags.cem_knight,arena:'knight',idle:1}],
  chests:[{id:'c_candle',x:6,y:21,item:'candle'},{id:'c_gold',x:29,y:2,gold:60},{id:'c_wine',x:9,y:28,item:'wine',n:2}],
  items:[{id:'lantern',x:21,y:12,what:'item:lantern',when:s=>s.flags.q_key&&!s.flags.lantern_back},{id:'card_moon',x:30,y:9,what:'card:moon'}],
  trig:[{id:'knight',x0:19,y0:22,x1:29,y1:27,when:s=>!s.flags.cem_knight,run:'knight'},{id:'tomb_see',x0:21,y0:22,x1:27,y1:23,when:s=>s.flags.cem_knight&&!s.flags.saw_tomb,run:'tombSee'}],
  arenas:{knight:{x0:18.7,y0:21.7,x1:29.4,y1:27.4,gates:[[18,24],[18,25]]}}},
 crypt1:{n:'드라고미르 납골당',base:'-',music:'crypt',amb:()=>AMB.crypt,fog:.12,dust:1,
  exits:[{x:5,y:2,to:'cemetery',tx:24,ty:23,face:[0,1],stairs:'up'},{x:19,y:26,to:'crypt2',tx:8,ty:14,face:[0,-1],stairs:'down'}],
  looks:[{x:19,y:16,t:'돌판에 새긴 글: 「네 개의 불꽃이 깨어날 때 길이 열리리라. 오직 거룩한 불만이 이 화로를 깨운다.」',stone:1},{x:25,y:5,t:'관 뚜껑이 조금 열려 있다...',fn:'page2'}],
  npcs:[{id:'emil',x:6,y:4,face:[1,1],when:s=>s.flags.emil_join&&!s.flags.lucia_dead},{id:'elena',x:10,y:17,face:[1,1],when:s=>!s.flags.kid_elena}],
  mobs:[{t:'skel',x:6,y:3},{t:'skel',x:3,y:6},{t:'rat',x:5,y:22},{t:'rat',x:8,y:21},{t:'rat',x:10,y:23},{t:'rat',x:4,y:24},{t:'skel',x:5,y:14},{t:'skel',x:5,y:18},
   {t:'spawn',x:21,y:5},{t:'spawn',x:23,y:9},{t:'ghoul',x:9,y:13},{t:'spawn',x:18,y:19},{t:'spawn',x:22,y:21},{t:'skel',x:17,y:22},{t:'skel',x:22,y:19},{t:'bat',x:19,y:20},{t:'rat',x:12,y:5},{t:'rat',x:14,y:4}],
  chests:[{id:'k_cross',x:24,y:7,sub:'cross'},{id:'k_candle',x:11,y:12,item:'candle'},{id:'k_herb',x:8,y:24,item:'tonic',n:1},{id:'k_silver',x:2,y:4,item:'silver',n:2}],
  items:[{id:'chicken1',x:1,y:10,what:'item:chicken'},{id:'card_tower',x:1,y:11,what:'card:tower'}],
  special:[{k:'crack',x:2,y:9,id:'crack1'},{k:'gate',x:10,y:19,id:'cell',flag:'cell_open'},{k:'gate',x:19,y:25,id:'stair',flag:'braziers'}],
  trig:[{id:'emilJoin',x0:3,y0:3,x1:7,y1:6,when:s=>!s.flags.emil_join,run:'emilJoin'}]},
 crypt2:{n:'하얀 귀부인의 방',base:'-',music:s=>s.flags.lucia_dead?'crypt':'lament',amb:()=>AMB.deep,fog:.2,dust:1,
  exits:[{x0:8,y0:16,x1:9,y1:16,to:'crypt1',tx:19,ty:24,face:[0,-1],edge:1}],
  looks:[{x:8,y:3,t:'루치아의 관. 장미 꽃잎이 흩어져 있다.',fn:'page3'}],
  npcs:[{id:'toma',x:9,y:5,face:[1,1],sleep:1,when:s=>!s.flags.lucia_dead},{id:'emil',x:7,y:12,face:[0,-1],when:s=>s.flags.lucia_dead&&!s.flags.ch1_end}],
  mobs:[{t:'lucia',x:8,y:5,when:s=>!s.flags.lucia_dead,arena:'lucia',idle:1}],
  trig:[{id:'lucia',x0:3,y0:3,x1:14,y1:13,when:s=>!s.flags.lucia_dead,run:'lucia'}],
  arenas:{lucia:{x0:2.6,y0:2.6,x1:15.4,y1:15.2}}}};
/* 지도 사이의 길 (목표 화살표가 다른 지도로 가는 출구를 가리킬 때 쓴다) */
const MAP_LINKS={};for(const [id,m] of Object.entries(MAPS))for(const e of m.exits||[])if(e.to){(MAP_LINKS[id]=MAP_LINKS[id]||[]);if(!MAP_LINKS[id].find(l=>l.to===e.to))MAP_LINKS[id].push({to:e.to,x:e.x!=null?e.x:Math.round((e.x0+e.x1)/2),y:e.y!=null?e.y:Math.round((e.y0+e.y1)/2)})}
function routeTo(from,to){if(from===to)return null;const prev={[from]:null},q=[from];while(q.length){const c=q.shift();for(const l of MAP_LINKS[c]||[]){if(prev[l.to]!==undefined)continue;prev[l.to]={c,l};if(l.to===to){let n=to,step=null;while(prev[n]&&prev[n].c!==undefined){step=prev[n];if(step.c===from)return step.l;n=step.c}return step&&step.l}q.push(l.to)}}return null}
/* ---------- 사람들과 이야기 ----------
   대본 한 줄: ['say',누구,말] ['ask',누구,말,[[고르기,대본],..]] ['flag',이름,값] ['give',물건,수] ['take',물건,수] ['relic',이름] ['weapon',이름] ['sub',이름]
   ['gold',수] ['silver',수] ['exp',수] ['tele',전보] ['heal'] ['save'] ['shop',가게] ['wait',ms] ['fade',1|0] ['music',곡] ['sfx',소리] ['jingle',짧은 가락] ['shake',세기]
   ['run',사건] ['fn',이름] ['if',조건,대본,대본] ['quest'] ['toast',글] ['arena',이름|null] ['boss',종류] ['goto',지도,x,y,방향] ['card',큰글,작은글] ['npc',누구,'leave'|'show',x,y] */
const NPC={
 coachman:{look:'coachman',face:'coachman',talk:()=>[['say','coachman','해 떨어지기 전에 돌아가야겠수. 늑대 소리 들리면 뛰시우, 나리.']]},
 marta:{look:'marta',face:'marta',talk:s=>{const F=s.flags;
  if(!F.q_inn)return[
   ['say','marta','어서 와요, 나그네 양반. 황금 왕관 여관이에요. 해 질 녘에 마차가 들어오다니, 운이 좋았네요.'],
   ['say','abel','반 헬싱이라고 합니다. 에이브러햄 반 헬싱 교수를 찾고 있어요.'],
   ['say','marta','반 헬싱... 흰 수염의 네덜란드 박사님? 그럼요. 한 달 전에 저 위층 방에 묵으셨죠. 밤마다 마늘을 한 다발씩 사 가셨어요.'],
   ['say','marta','보르고 고개로 간다며 떠나셨는데... 그 뒤로 소식이 없어요. 아드님이시구나. 눈매가 꼭 닮았어.'],
   ['say','marta','오늘이 5월 4일, 성 게오르기우스 축일 전야인 건 알아요? 오늘 밤 자정이 지나면 세상의 온갖 나쁜 것들이 힘을 얻는대요.'],
   ['say','marta','...어머니를 생각해서라도, 이걸 목에 걸고 가요.'],
   ['relic','rosary'],
   ['say','abel','...고맙습니다. 소중히 하죠.'],
   ['say','marta','요즘 마을이 이상해요. 사람들이 하나둘 핏기 없이 시들어 가고, 밤마다 아이들이 사라져요.'],
   ['say','marta','우리 토마도... 사흘째 돌아오지 않았어요.'],
   ['say','marta','의사 에밀 선생과 요제프 신부님을 만나 봐요. 그리고 제발... 우리 토마를 찾아 줘요.'],
   ['flag','q_inn'],['quest'],['say',null,'여관 구석의 침대에서 쉬면 체력이 모두 차고 기록이 남는다.']];
  const L=[];
  if(F.ch1_end)L.push(['say','marta','토마를 데려와 줘서... 정말, 정말 고마워요. 이 여관 방은 평생 공짜예요!']);
  else if(F.night&&!F.guest_dead)L.push(['say','marta','(작은 목소리로) 저 구석 손님 말이에요... 2주째 묵는데 밥을 한 번도 안 먹어요. 낮엔 방에서 나오지도 않고.']);
  else if(F.q_ana&&!F.q_key)L.push(['say','marta','묘지 열쇠요? 무덤지기 이반이 갖고 있어요. 저기서 또 술을 퍼마시고 있네.']);
  L.push(['ask','marta','무엇을 드릴까요?',[['물건 사기',[['shop','inn']]],['이야기 듣기',[['fn','martaTalk']]],['그만',[]]]]);return L}},
 ana:{look:'ana',face:'ana',talk:s=>{const F=s.flags;
  if(F.ch1_end)return[['say','ana','오빠 찾아 줘서 고마워요! 사냥꾼 아저씨 최고!'],['say','toma','...나 그 언니 노래, 이제 안 들려. 아저씨가 쫓아냈어?']];
  if(!F.q_inn)return[['say','ana','엄마가 모르는 사람이랑 말하지 말랬어요.']];
  if(!F.q_ana)return[['say','ana','아저씨가 사냥꾼이에요? 엄마가 그랬어요. 토마 오빠 찾아 줄 거예요?'],
   ['say','ana','오빠가 그랬어요. 하얀 옷을 입은 예쁜 언니가 묘지에서 사탕을 줬대요.'],
   ['say','ana','그 언니가 밤마다 창문 밖에서 노래를 불러요. 오빠 이름을 불러요. 토마... 토마... 하고.'],
   ['say','abel','(하얀 옷의 여자... 묘지.)'],['say','ana','묘지 열쇠는 무덤지기 아저씨가 갖고 있어요. 맨날 여관에서 술 마셔요.'],
   ['flag','q_ana'],['quest'],['tele','t2']];
  return[['say','ana','토마 오빠... 무사하겠죠? 오빠는 겁쟁이라서 혼자 있으면 울어요.']]}},
 toma:{look:'toma',face:'toma',talk:s=>s.flags.lucia_dead?[['say','toma','아저씨... 그 언니 이제 안 와요? 사실 그 언니, 맨날 울었어요. 춥다고.']]:[['say',null,'토마가 깊이 잠들어 있다. 목에 작은 상처 두 개가 보인다.']]},
 emil:{look:'emil',face:'emil',talk:s=>{const F=s.flags,map=G.m&&G.m.id;
  if(map==='crypt1')return[['say','emil','상처를 보여 주세요. 의사가 할 일이죠.'],['heal'],['say',null,'에밀이 상처를 꿰매고 붕대를 감아 주었다. 체력과 성력이 모두 찼다.']];
  if(map==='crypt2')return[['say','emil','토마는 제가 업고 갈게요. 아벨 씨는... 괜찮아요? 아까 루치아한테 물렸을 때, 눈이...'],['say','abel','괜찮아. 가자.']];
  if(!F.q_emil)return[['say','emil','의사 에밀 바르가입니다. 사냥꾼이라고요? ...잘 오셨어요. 또 환자가 늘었거든요.'],
   ['say','emil','보세요. 목에 작은 구멍 두 개. 다들 피를 잃었는데, 상처는 이것뿐이에요.'],
   ['say','emil','루치아도... 제 약혼녀도 똑같이 죽었어요. 수혈을 네 번이나 했는데. 제 피까지 다 내줬는데.'],
   ['say','emil','40일 전이에요. 드라고미르 가문 묘당에 묻혔어요. 촌장님의 외동딸이었죠.'],
   ['say','abel','(수혈을 네 번... 아버지의 방식이다.)'],
   ['say','emil','부탁이 하나 있어요. 박쥐 날개 다섯 장만 구해 주시겠어요? 피를 맑게 하는 강장제를 만들 수 있어요.'],
   ['flag','q_emil'],['flag','sq_wings',1],['quest']];
  const L=[];
  if(F.sq_wings===1&&(s.inv.wing||0)>=5)L.push(['say','emil','박쥐 날개 다섯 장! 고맙습니다. 바로 달여 볼게요.'],['take','wing',5],['give','tonic',3],['flag','sq_wings',2],['say','emil','강장제예요. 이제 제 가게에서도 파니까 필요하면 오세요.'],['quest']);
  else if(F.lucia_dead)L.push(['say','emil',F.stake==='emil'?'마지막에 루치아가 웃었어요. 그거면 됐어요. 정말로.':'아벨 씨가 옳았어요. 그건 루치아가 아니었어요. 그래도... 조금만 더 슬퍼할게요.']);
  else L.push(['say','emil','환자들은 밤이 되면 창문을 열어 달라고 해요. 누가 부른대요. 절대 열면 안 된다고 했죠.']);
  L.push(['ask','emil','무엇을 도와 드릴까요?',[['치료 받기',[['heal'],['say',null,'에밀이 상처를 치료해 주었다.']]],['물건 사기',[['shop',F.sq_wings===2?'clinic2':'clinic']]],['그만',[]]]]);return L}},
 patient:{look:'patient',face:'patient',talk:(s,n)=>[['say','patient',['목이... 차가워... 창문을... 열어 줘...','하얀 여자가... 창문을 두드렸어... 아름다운 목소리로...','의사 선생 피를 받고 좀 살 것 같소. 고마운 양반이야.'][n.v||0]]]},
 josef:{look:'josef',face:'josef',talk:s=>{const F=s.flags;
  if(!F.q_josef)return[['say','josef','주님의 집에 온 것을 환영하오, 젊은이. ...반 헬싱 교수의 아들이로군. 눈빛이 꼭 닮았어.'],
   ['say','josef','교수께서 떠나기 전에 이 성수를 맡기셨지. 아들이 오거든 꼭 주라고.'],
   ['sub','holy'],['silver',10],
   ['say',null,'보조 무기 「성수」를 얻었다! (* 또는 취소 키로 던지고, 메뉴에서 바꾼다)'],
   ['say','josef','흡혈귀와 죽은 자들은 거룩한 불을 두려워하오. 은 조각만 있으면 몇 번이고 던질 수 있지.'],
   ['say','josef','그리고 기억하게. 흡혈귀는 쓰러뜨린 뒤 반드시 심장에 말뚝을 박아야 하오. 그러지 않으면 밤마다 다시 일어나지.'],
   ['flag','q_josef'],['quest']];
  const L=[];if(F.lucia_dead)L.push(['say','josef','그 아이의 영혼이 이제야 쉴 수 있겠구려. 주여, 루치아에게 영원한 안식을.']);
  L.push(['ask','josef','무엇을 원하오?',[['축복 받기',[['heal'],['say',null,'신부의 축복으로 체력과 성력이 모두 찼다.']]],['물건 사기',[['shop','church']]],['고해하기',[['fn','confess']]],['그만',[]]]]);return L}},
 nun:{look:'nun',face:'villager',talk:()=>[['say','villager','(묵주를 굴리며 기도하고 있다) ...저희를 악에서 구하소서. 저희를 악에서...']]},
 ivan:{look:'ivan',face:'ivan',talk:s=>{const F=s.flags,map=G.m&&G.m.id;
  if(map==='inn'){if(!F.q_ana)return[['say','ivan','뭐야. 술맛 떨어지게. 저리 꺼져.']];
   return[['say','ivan','묘지 열쇠? 밤에 거길 왜 가. 거긴 이제... 죽은 놈들이 얌전히 누워 있질 않아.'],['say','ivan','...좋아. 한 잔 사면 생각해 보지.'],
    ['ask','abel','(이반이 빈 잔을 흔든다)',[['포도주를 산다 (금화 10)',[['fn','buyIvan']]],['그냥 간다',[['say','ivan','흥. 빈털터리 사냥꾼이로군.']]]]]]}
  if(s.inv.lantern)return[['say','ivan','내 등불! 할아버지 거라고. 어디서 찾았어?'],['take','lantern'],['say','ivan','...고맙군. 이걸 가져가. 우리 집안에 내려오는 은 도끼야. 할아버지가 이걸로 관 뚜껑을 쪼갰다더군.'],['weapon','axe'],['flag','lantern_back'],['quest']];
  if(F.lantern_back)return[['say','ivan','도끼는 잘 쓰고 있나? 무덤이 다 파헤쳐졌어. 내 평생 이런 일은 처음이야.']];
  return[['say','ivan','등불을 묘지 어딘가에 떨어뜨렸어. 북쪽 파헤쳐진 무덤 근처였는데... 거긴 구울 놈들이 득실거려.']]}},
 miklos:{look:'miklos',face:'miklos',talk:s=>{const F=s.flags,L=[];
  if(!F.miklos_met)L.push(['say','miklos','어이, 사냥꾼 양반! 대장장이 미클로시요. 우리 집안은 3대째 은을 두드려 왔지.'],
   ['say','miklos','은 촛대 세 개만 구해 오면 할아버지가 늑대인간 잡던 은사슬 채찍을 만들어 주지! 숲이랑 묘지, 그리고 지하 어딘가에 굴러다닐 거요.'],['flag','miklos_met'],['flag','sq_silver',1],['quest']);
  if((F.sq_silver===1||!F.miklos_met)&&(s.inv.candle||0)>=3)L.push(['say','miklos','오오! 은 촛대 세 개! 잠깐만 기다리쇼.'],['take','candle',3],['sfx','anvil'],['wait',260],['sfx','anvil'],['wait',260],['sfx','anvil'],['say',null,'땅! 땅! 땅!'],['weapon','whip'],['flag','sq_silver',2],
   ['say','miklos','사냥꾼의 사슬 채찍이오! 멀리 닿으니 늑대 무리 상대로는 그만이지. 메뉴의 장비에서 바꿔 드시오.'],['quest']);
  L.push(['ask','miklos','뭘 보여 드릴까?',[['물건 사기',[['shop','smith']]],['무기 벼리기',[['fn','forge']]],['그만',[]]]]);return L}},
 rada:{look:'rada',face:'rada',talk:s=>{const F=s.flags,L=[];
  if(!F.rada_met)L.push(['say','rada','오호... 이리 오너라, 젊은이. 네게서 반쪽짜리 피 냄새가 나는구나.'],['say','abel','...반쪽짜리?'],
   ['say','rada','흐흐, 늙은이 헛소리다. 앉거라. 금화 열 닢이면 카드로 네 앞길을 읽어 주마.'],['say','rada','그리고 세상에 흩어진 타로 카드를 찾거든 가져오너라. 카드는 제 주인을 지켜 준단다.'],['flag','rada_met'],['flag','sq_tarot',1],['quest']);
  if(F.saw_tomb&&!F.q_mirror){L.push(['say','rada','달의 카드가 나왔구나. 거짓된 얼굴이 네 가까이 있다. 사람의 탈을 쓴 것이 네 곁에서 숨을 쉬는 척하고 있어.'],
   ['say','rada','이걸 가져가라. 거울은 거짓말을 하지 않지. 저것들은 거울에 비치지 않는단다.'],['give','mirror'],['flag','q_mirror'],['quest']);return L}
  if(F.ch1_end&&!F.rada_truth)L.push(['fn','radaTruth']);
  L.push(['ask','rada','무엇이 궁금하냐?',[['카드 점 (금화 10)',[['fn','tarotRead']]],['찾은 카드 보여 주기',[['fn','tarotGive']]],['물건 사기',[['shop','rada']]],['그만',[]]]]);return L}},
 dragomir:{look:'dragomir',face:'dragomir',talk:s=>{const F=s.flags;
  if(F.lucia_dead)return[['say','dragomir','...에밀에게 들었소. 내 딸을 쉬게 해 주었다고.'],['say','dragomir','고맙소. 이 늙은이가 할 말은 그것뿐이오.']];
  if(F.guest_dead)return[['say','dragomir','그 문장을 어디서...! 그렇다면 내 딸이... 정말로...'],['say','dragomir','...가시오. 가서 그 아이를 편히 쉬게 해 주시오. 이건 장례에 쓰려던 돈이오.'],['gold',150]];
  if(F.saw_tomb){const L=[['say','dragomir','묘당 문을 열어 달라고? 감히 내 딸의 잠을 깨우겠다는 거요?!'],['say','dragomir','...문장은 장례식 날 사라졌소. 누가 훔쳐 갔지. 그날 처음 보는 창백한 손님이 조문을 왔었는데...'],['flag','q_drag']];if(!F.q_mirror)L.push(['say','abel','(창백한 손님... 마을 점쟁이라면 뭔가 알지도 모른다.)']);return L}
  return[['say','dragomir','누구요? 사냥꾼? ...나가시오. 이 마을에 흡혈귀 따위는 없소.'],['say','dragomir','내 딸은 병으로 죽었소. 병으로!']]}},
 gregor:{look:'gregor',face:'gregor',talk:s=>{const F=s.flags,L=[];
  if(!F.gregor_met)L.push(['say','gregor','사람이 이 숲에 들어오다니. 난 그레고르, 늑대 사냥꾼이지.'],['say','gregor','요즘 늑대들이 미쳤어. 저 아래 빈터의 우두머리 놈은 눈이 빨개. 누가 부리는 것처럼 무리를 몰고 다니지.'],
   ['say','gregor','모닥불 곁에서 쉬어 가게. 불을 쬐면 기록도 남길 수 있어.'],['flag','gregor_met']);
  if(!F.kid_mihai)L.push(['say','gregor','아, 그리고 북동쪽 덤불에서 아이 울음소리가 들렸어. 늑대들이 그쪽에 몰려 있더군.']);
  else if(F.forest_alpha)L.push(['say','gregor','우두머리를 잡았다고? ...보름이 다가오면 늑대보다 더 큰 놈들이 나와. 두 발로 걷는 놈들 말이야. 고개 너머로 갈 거면 은을 넉넉히 챙기게.']);
  L.push(['ask','gregor','뭐가 필요한가?',[['물건 사기',[['shop','forest']]],['그만',[]]]]);return L}},
 m1:{look:'villager4',face:'marta',talk:s=>{const F=s.flags;
  if(F.kid_mihai===1)return[['say','m1','미하이! 살아서 돌아왔구나! 사냥꾼 나리, 이 은혜를 어떻게...'],['gold',100],['exp',60],['flag','kid_mihai',2],['fn','kidsDone'],['quest']];
  if(F.kid_mihai===2)return[['say','m1','미하이는 이제 해 지면 절대 밖에 안 내보낼 거예요.']];
  return[['say','m1','우리 미하이 못 보셨어요? 나무하러 안개 숲에 갔다가 돌아오질 않아요...'],['flag','sq_kids',F.sq_kids||1],['quest']]}},
 m2:{look:'villager2',face:'villager',talk:s=>{const F=s.flags;
  if(F.kid_elena===1)return[['say','m2','엘레나! 아이고, 엘레나! 어디 있었니...! 나리, 고맙습니다. 정말 고맙습니다.'],['gold',100],['exp',60],['flag','kid_elena',2],['fn','kidsDone'],['quest']];
  if(F.kid_elena===2)return[['say','m2','엘레나가 그러는데, 지하에 차가운 방이 있었대요. 거기 갇혀서 노래를 들었대요...']];
  return[['say','m2','엘레나가 없어졌어요. 밤에 자다 일어나서 맨발로 나갔대요. 묘지 쪽으로...'],['flag','sq_kids',F.sq_kids||1],['quest']]}},
 mihai:{look:'mihai',face:'toma',talk:s=>{if(G.m&&G.m.id==='forest')return[['say','mihai','흐윽... 늑대가... 늑대가 계속 빙빙 돌아요...'],['say','abel','이제 괜찮다. 마을로 돌아가렴. 엄마가 기다리셔.'],['say','mihai','...응! 고마워요, 아저씨!'],['flag','kid_mihai',1],['flag','sq_kids',s.flags.sq_kids||1],['npc','mihai','leave'],['quest']];
  return[['say','mihai','늑대가 무서웠지만 이제 안 울어요!']]}},
 elena:{look:'elena',face:'ana',talk:s=>{if(G.m&&G.m.id==='crypt1')return[['say','elena','...아저씨 누구예요? 그 언니가 보냈어요?'],['say','abel','아니. 너를 데리러 왔어. 엄마한테 가자.'],['say','elena','...응. 여기 너무 추워요.'],['flag','kid_elena',1],['flag','sq_kids',s.flags.sq_kids||1],['npc','elena','leave'],['quest']];
  return[['say','elena','이제 밤에 노래가 들려도 안 나갈 거예요.']]}},
 villager:{look:'villager1',face:'villager',talk:s=>{const F=s.flags;return[['say','villager',F.ch1_end?'해가 떴어! 정말 오랜만에 개가 짖는 소리를 들었네.':F.night?'(창문을 닫으며) 밤에는 나다니지 마시오!':pick(['밤에는 창문에 마늘을 거시오. 다들 그렇게 하오.','촌장 댁 아가씨가 죽고 나서부터 이상해졌소. 묘지에서 하얀 게 돌아다닌다는 말도 있고.','여관 마르타네 아들도 없어졌다더군. 쯧쯧.'])]]}},
 guest:{look:'guest',face:'guest',talk:s=>{const L=[['say','guest','...밤 산책이라도 나가시나, 사냥꾼 양반.'],['say','guest','이 마을 공기는 참 달콤하군. 특히 해가 진 뒤에는.']];
  if(!s.inv.mirror)return L.concat([['say','abel','(이 자... 숨을 쉬지 않는다?)']]);
  return L.concat([['ask','abel','(라다 할멈의 손거울이 주머니에서 차갑게 느껴진다)',[['손거울로 비춰 본다',[['run','guestReveal']]],['그냥 둔다',[]]]]])}}};
/* ---------- 사건 ---------- */
const EV={
 arrive:()=>[['wait',500],['say','coachman','다 왔수다, 나리. 여기가 비스트리차요.'],['say','coachman','해 떨어지기 전에 난 돌아가야겠수. 이 동네는 밤이 되면... 개들도 짖질 않거든.'],
  ['say','abel','태워 줘서 고맙소.'],['say','coachman','늑대 소리 들리면 뛰시우. 성호도 긋고. 그럼...'],['npc','coachman','leave'],['wait',700],['sfx','howl'],['wait',500],
  ['say','abel','...늑대인가. 벌써 마중을 나왔군.'],['spawn','wolf',7,7,{tag:'tut'}],['spawn','wolf',8,4,{tag:'tut'}],['music','battle'],
  ['toast','5·확인: 베기 (연속 3번)  0·통화: 구르기',4200],['watch','tut','tutDone']],
 tutDone:()=>[['music',null],['wait',400],['say','abel','후... 이 마을, 생각보다 상태가 나쁘군.'],['flag','tut'],['tele','t1'],['quest'],['toast','메뉴 키: 가방 · 장비 · 기술 · 전보 · 지도',3600]],
 alpha:()=>[['music',null],['shake',3],['sfx','howl'],['say',null,'빈터 한가운데서 붉은 눈이 번뜩인다. 늑대들이 길을 비킨다.'],['arena','alpha'],['boss','alpha'],['music','boss1']],
 alphaDead:()=>[['arena',null],['music',null],['flag','forest_alpha'],['say','abel','이놈이 무리를 부리고 있었군... 누군가 이 늑대들을 길들였다.'],['relic','fang'],['quest']],
 knight:()=>[['music',null],['arena','knight'],['sfx','clank'],['shake',2],['say',null,'묘당 앞을 지키던 갑옷이 삐걱거리며 일어선다. 투구 속에서 푸른 불이 타오른다.'],['boss','knight'],['music','boss1']],
 knightDead:()=>[['arena',null],['music',null],['flag','cem_knight'],['say','abel','드라고미르 가문 묘당... 이 안에 루치아가 잠들어 있겠지.'],['quest']],
 tombSee:()=>[['say',null,'묘당 문에 용 모양의 홈이 파여 있다. 가문의 문장을 끼워야 열릴 것 같다.'],['say','abel','문장은 촌장이 갖고 있겠지. 마을로 돌아가자.'],['flag','saw_tomb'],['flag','night'],['quest'],['toast','어느새 밤이 깊었다...',3000]],
 tomb:s=>{if(s.inv.crest)return[['say',null,'문장을 홈에 끼우자 철컥, 무거운 돌문이 안쪽으로 열렸다.'],['take','crest'],['sfx','door'],['shake',2],['flag','tomb_open'],['quest']];
  if(!s.flags.saw_tomb)return EV.tombSee(s);return[['say',null,'용 모양의 홈. 드라고미르 가문의 문장이 있어야 열린다.']]},
 guestReveal:()=>[['say',null,'거울 속에는... 빈 의자만 비친다!'],['shake',3],['sfx','reveal'],['jingle','dread'],['say','guest','...영리한 사냥꾼이군. 그 늙은 집시가 거울을 줬나?'],
  ['say','guest','하지만 밤은 우리의 것이다. 광장에서 기다리지. 도망치지 마라, 반쪽짜리!'],['flag','guest_reveal'],['fade',1],['goto','village',10,11,[1,1]]],
 guestFight:()=>[['wait',300],['say','guest','백작님의 손님이 될 영광을 주지, 사냥꾼!'],['arena','guest'],['boss','guest'],['music','boss1']],
 guestDead:()=>[['arena',null],['music',null],['say','guest','백작님... 주인님...!'],['say',null,'라슬로가 재가 되어 흩어졌다. 재 속에 은빛 문장이 남았다.'],['give','crest'],['flag','guest_dead'],['tele','t4'],['quest']],
 emilJoin:()=>[['wait',300],['say','emil','기다려요! 아벨 씨!'],['npc','emil','show',5,3],['say','emil','저도 가겠습니다. 루치아가 정말 그렇게 됐다면... 제 눈으로 봐야겠어요.'],
  ['say','abel','위험해. ...좋아. 대신 여기 입구를 지켜 줘. 다치면 내게 오고.'],['say','emil','다치면 제게 오세요. 의사가 할 일이죠.'],['flag','emil_join'],['say',null,'에밀에게 말을 걸면 언제든 치료를 받을 수 있다.']],
 lucia:()=>[['music',null],['wait',300],['say',null,'관 옆에 작은 아이가 웅크려 잠들어 있다. 토마다!'],['say','abel','토마!'],['sfx','coffin'],['jingle','dread'],['shake',3],['fn','luciaRise'],['wait',500],
  ['say','lucia','어머, 손님이네... 쉿. 토마가 자고 있어요.'],['say','lucia','이 아이는 이제 내 거예요. 밤마다 내가 노래를 불러 주거든요. 춥지 않게.'],
  ['npc','emil','show',8,14],['say','emil','루치아...! 정말... 정말 너야?'],['say','lucia','에밀. 날 데리러 왔구나. 이리 와. 이제 다시는 춥지 않게 해 줄게...'],
  ['say','abel','물러서, 에밀. 저건 루치아가 아니야.'],['say','lucia','사냥꾼... 그 늙은이를 닮았구나. 그 늙은이도 꼭 그렇게 말했지. 「저건 네 딸이 아니다」라고.'],
  ['say','lucia','그 늙은이는 고개 너머로 갔어. 백작님께. 너도 곧 보내 줄게... 내 품을 지나서!'],['arena','lucia'],['boss','lucia'],['music','boss2']],
 luciaBite:()=>[['music',null],['say','lucia','그 피... 그 피를 줘...!'],['fn','biteFx'],['say',null,'루치아의 송곳니가 목덜미에 박혔다!'],['say','lucia','으윽...?! 이... 이 피는...!'],
  ['say','lucia','너... 너는... 우리와 같은... 반쪽...!'],['say','abelR','(심장이... 뜨겁다. 피가 끓는다.)'],['fn','bloodUnlock'],['toast','혈기 각성! 피 막대가 차면 # (또는 V)를 길게 눌러라',4200],['music','boss2']],
 luciaDown:()=>[['music',null],['say','lucia','아... 아파... 에밀... 추워...'],['ask','abel','말뚝을 박아야 한다. 누가 끝낼까?',[
   ['에밀에게 말뚝을 건넨다',[['say','emil','...제가 하겠습니다. 그게 루치아를 사랑한 사람의 몫이에요.'],['say','emil','사랑해, 루치아. 이제 편히 쉬어.'],['sfx','stake'],['shake',4],['fn','luciaDust'],['say','lucia','(편안한 얼굴로) 에밀... 고마워...'],['flag','stake','emil']]],
   ['내가 끝낸다',[['say','abel','편히 쉬어라, 루치아 드라고미르.'],['sfx','stake'],['shake',4],['fn','luciaDust'],['say','lucia','반쪽짜리... 사냥꾼... 백작님이... 널... 기다리셔...'],['say','emil','......'],['flag','stake','abel']]]]],
  ['arena',null],['flag','lucia_dead'],['say',null,'루치아의 몸이 하얀 재가 되어 흩어졌다.'],['say','toma','...으음. 엄마...?'],['say','abel','토마, 집에 가자. 엄마가 기다리셔.'],
  ['say','emil','관 안에... 뭔가 있어요. 교수님 글씨 같은데요.'],['quest'],['save']],
 dawn:()=>[['fade',0],['music','dawn'],['wait',400],['say',null,'비스트리차에 해가 떠오른다. 한 달 만에 처음으로, 닭이 울었다.'],['say','marta','토마! 토마야!'],['say','toma','엄마!'],
  ['say','marta','고마워요... 정말, 정말 고마워요. 무슨 말로 갚아야 할지.'],['say','ana','오빠 바보! 울보! ...보고 싶었어.'],
  ['say','rada','...반쪽짜리 피. 이제 너도 알았겠지.'],['say','abel','알고 있었소?'],['say','rada','네 어미는 너를 밴 채로 물렸다. 그래서 너는 반은 사람이고, 반은... 흐흐. 나머지는 고개 너머 성에서 직접 들어라.'],
  ['tele','t5'],['say','abel','보르고 고개... 아버지, 조금만 기다리세요.'],['flag','ch1_end'],['flag','rada_truth'],['fn','refreshAmb'],['fn','ch1Clear'],['quest'],['save'],
  ['card','제1장 「비스트리차의 안개」 끝','다음 장 「보르고 고개」는 다음 판에서 이어집니다']]};
/* ---------- 이야기 속 작은 일들 ---------- */
const FN={
 well:s=>[['say',null,'우물 바닥에서 뭔가 반짝인다... 은 조각이다!'],['silver',5]],
 organ:()=>[['fn','playOrgan'],['say',null,'(파이프 오르간이 낮게 울린다. 단조의 선율이 성당을 가득 채운다.)']],
 page2:s=>s.pages.includes(1)?[['say',null,'텅 빈 관이다.']]:[['say',null,'관 속에서 찢어진 일기장 한 장을 찾았다!'],['fn','addPage1']],
 page3:s=>s.flags.lucia_dead?(s.pages.includes(2)?[['say',null,'장미 꽃잎만 남은 빈 관.']]:[['say',null,'관 바닥에 아버지의 일기장 한 장이 깔려 있다!'],['fn','addPage2']]):[['say',null,'관 뚜껑이 닫혀 있다. 안에서 차가운 기운이 새어 나온다.']],
 martaTalk:s=>[['say','marta',pick(['박사님은 매일 밤 창문에 마늘을 걸고 주무셨어요. 저한테도 꼭 그러라고 하셨죠.','이 마을 사람들은 고개 너머 성 이야기를 안 해요. 입에 올리면 밤에 찾아온대요.','여관 간판의 황금 왕관이요? 우리 할머니 때부터 있었어요. 영국 손님이 와서 글로 쓴 적도 있대요.'])]],
 confess:s=>[['say','josef',pick(['두려움을 부끄러워 마시오. 두려움을 아는 자만이 어둠 앞에서 오래 버티는 법이오.','교수께서도 이 자리에서 고해를 하셨지. 「나는 아내를 지키지 못했다」고. ...무슨 뜻인지 나는 묻지 않았소.','흡혈귀는 초대받지 않으면 남의 집에 들어오지 못하오. 문을 열어 준 자가 누구인지 생각해 보시오.'])]],
 kidsDone:s=>(s.flags.kid_mihai===2&&s.flags.kid_elena===2&&s.flags.sq_kids!==2)?[['say',null,'두 엄마가 아이들이 직접 만든 부적을 건네주었다.'],['relic','charm'],['flag','sq_kids',2]]:[],
 radaTruth:()=>[['say','rada','토마가 돌아왔구나. 잘했다, 반쪽짜리.'],['flag','rada_truth']]};
/* ---------- 지금 해야 할 일 ---------- */
function mainStep(s){const F=s.flags;
 if(!F.tut)return{t:'늑대를 물리치자',d:'마을 어귀에 늑대가 나타났다! 5(확인)로 베고, 0(통화)으로 굴러 피하자.',map:'village',x:7,y:6};
 if(!F.q_inn)return{t:'황금 왕관 여관',d:'여관 안주인에게 아버지의 행방을 묻자. 여관은 마을 왼쪽, 간판이 걸린 집이다.',map:'inn',x:3,y:3};
 if(!F.q_emil||!F.q_josef)return{t:'밤의 병',d:'의사 에밀(진료소)과 요제프 신부(성당)를 만나 마을의 병에 대해 듣자.'+(F.q_emil?' [에밀 ✓]':'')+(F.q_josef?' [신부 ✓]':''),map:F.q_emil?'church':'clinic',x:F.q_emil?6:5,y:F.q_emil?4:5};
 if(!F.q_ana)return{t:'아이의 증언',d:'광장 우물가의 아나에게 오빠 토마 이야기를 듣자.',map:'village',x:13,y:15};
 if(!F.q_key)return{t:'묘지 열쇠',d:'무덤지기 이반이 묘지 철문 열쇠를 갖고 있다. 여관에서 술을 마시고 있다.',map:'inn',x:8,y:7};
 if(!F.forest_alpha&&!F.saw_tomb)return{t:'안개 숲 너머',d:'남쪽 문으로 나가 안개 숲을 지나 공동묘지로 가자. 숲속 빈터를 지나야 한다.',map:'cemetery',x:6,y:6};
 if(!F.saw_tomb)return{t:'드라고미르 묘당',d:'공동묘지 동쪽 끝, 낮은 담장 안의 드라고미르 가문 묘당을 조사하자.',map:'cemetery',x:24,y:23};
 if(!F.q_mirror)return{t:'사라진 문장',d:'묘당 문은 가문 문장이 있어야 열린다. 촌장(저택)에게 묻고, 점쟁이 라다(마을 아래쪽 천막)를 찾아가 보자.',map:'village',x:7,y:25};
 if(!F.guest_dead)return{t:'거짓된 얼굴',d:'라다의 손거울로 여관 구석의 수상한 손님을 비춰 보자.',map:'inn',x:5,y:7};
 if(!F.tomb_open)return{t:'묘당 문을 열자',d:'되찾은 문장으로 공동묘지의 드라고미르 묘당 문을 열자.',map:'cemetery',x:24,y:22};
 if(!F.lucia_dead)return{t:'하얀 귀부인',d:F.braziers?'납골당 계단을 내려가 루치아의 방으로 가자.':'납골당 큰 방의 화로 네 개에 거룩한 불(성수)을 붙이면 아래로 가는 길이 열린다.',map:F.braziers?'crypt2':'crypt1',x:F.braziers?8:19,y:F.braziers?6:20};
 if(!F.ch1_end)return{t:'새벽',d:'토마를 데리고 비스트리차 마을로 돌아가자.',map:'village',x:9,y:10};
 return{t:'제1장 끝',d:'다음 장 「보르고 고개」는 다음 판에서 이어집니다. 남은 곁다리 일과 타로 카드, 괴물 도감을 채워 보자.',map:null}}
function sideList(s){const F=s.flags,L=[],c=k=>s.inv[k]||0;
 if(F.sq_silver)L.push({t:'대장장이의 은',d:F.sq_silver===2?'은사슬 채찍을 얻었다.':'은 촛대 '+c('candle')+'/3 개를 대장장이 미클로시에게.',done:F.sq_silver===2});
 if(F.sq_kids)L.push({t:'사라진 아이들',d:F.sq_kids===2?'두 아이 모두 집으로 돌아갔다.':'미하이(안개 숲) '+(F.kid_mihai?'✓':'?')+'  엘레나(묘지 쪽) '+(F.kid_elena?'✓':'?')+'. 찾은 뒤 엄마에게 알리자.',done:F.sq_kids===2});
 if(F.q_key)L.push({t:'무덤지기의 등불',d:F.lantern_back?'이반에게 등불을 돌려주고 은 도끼를 받았다.':s.inv.lantern?'등불을 찾았다. 묘지 오두막의 이반에게.':'묘지 북쪽 파헤쳐진 무덤 근처에 떨어뜨렸다고 한다.',done:!!F.lantern_back});
 if(F.sq_wings)L.push({t:'의사의 약',d:F.sq_wings===2?'강장제를 받았다. 진료소에서 살 수 있다.':'박쥐 날개 '+c('wing')+'/5 장을 의사 에밀에게.',done:F.sq_wings===2});
 if(F.sq_tarot)L.push({t:'운명의 카드',d:F.sq_tarot===2?'카드 넷을 모두 보여 주고 집시의 눈을 받았다.':'타로 카드 '+s.cards.length+'/4 (보여 준 카드 '+(s.shown||[]).length+')',done:F.sq_tarot===2});
 L.push({t:'아버지의 일기',d:'찾은 쪽 '+s.pages.length+'/3',done:s.pages.length>=3});return L}
/* ---------- 바탕 상태 ---------- */
const VW=150,VH=184,AX=75,AY=104;
let K=null,host=null;
const G={mode:'title',sel:0,s:null,m:null,hero:null,ents:[],shots:[],hz:[],fx:[],txt:[],dec:[],keys:{},kq:[],cam:{x:0,y:0,sh:0,ox:0,oy:0},
 time:0,last:0,acc:0,hitstop:0,slowT:0,slowK:1,flow:null,flowKey:'',sc:null,dlg:null,ask:null,shop:null,menu:null,fade:{a:0,v:0,cb:null},banner:null,toasts:[],
 boss:null,arena:null,watch:[],trigDone:{},awakeT:0,st:null,tele:null,card:null,noAt:0,lastExit:null,pre:null,title:{t0:0},dirty:true,frame:0};
const rand=rr2;
/* ---------- 기록 ---------- */
function newSave(diff){return{v:1,ver:VERSION,diff:diff||'normal',ch:1,map:'village',x:2.5,y:2.5,fx:1,fy:1,lv:1,exp:0,hp:102,mp:44,blood:0,gold:30,silver:12,
 wpn:'cane',wpns:['cane'],wlv:{},coat:'travel',coats:['travel'],rel:['locket',''],relics:['locket'],sub:'bow',subs:['bow'],skill:'',skills:{},sp:0,
 inv:{herb:3},flags:{},opened:{},got:{},kills:{},cards:[],shown:[],pages:[],tele:[],ex:{},play:0,deaths:0,quick:'herb',opt:{music:1,sfx:1,shake:1,arrow:1,blood:'red',vib:1}}}
function readSave(){try{const t=w.localStorage&&w.localStorage.getItem(SAVE_KEY);if(!t)return null;const s=JSON.parse(t);if(!s||s.v!==1)return null;return fixSave(s)}catch(_){return null}}
function fixSave(s){const d=newSave(s.diff);for(const k of Object.keys(d))if(s[k]===undefined)s[k]=d[k];for(const k of Object.keys(d.opt))if(s.opt[k]===undefined)s.opt[k]=d.opt[k];return s}
function writeSave(why){const s=G.s;if(!s)return false;try{if(G.hero&&G.m&&!G.m.def.noSave){s.map=G.m.id;s.x=+G.hero.x.toFixed(2);s.y=+G.hero.y.toFixed(2);s.fx=G.hero.fx;s.fy=G.hero.fy}
 if(G.pre&&why!=='manual'){s.map=G.pre.map;s.x=G.pre.x;s.y=G.pre.y}
 s.when=Date.now();w.localStorage&&w.localStorage.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(_){return false}}
function expNeed(lv){return Math.round(28*Math.pow(lv,1.55)+12*lv)}
function stats(){const s=G.s,W=WEAPON[s.wpn]||WEAPON.cane,C=COAT[s.coat]||COAT.travel,wl=s.wlv[s.wpn]||0;
 let atk=4+s.lv*1.6+W.atk+wl*2,def=s.lv*.5+C.def,hp=90+s.lv*12,mp=40+s.lv*4+(C.mp||0),crit=.05,holy=0,dr=0,ex=0,roll=0,sub=0,smax=60,regen=0,garlic=0,eye=0;
 for(const r of s.rel){const R=RELIC[r];if(!R)continue;atk+=R.atk||0;crit+=R.crit||0;holy+=R.holy||0;dr+=R.dr||0;ex+=R.exp||0;roll+=R.roll||0;regen+=R.regen||0;garlic+=R.garlic||0;eye+=R.eye||0}
 for(const c of s.cards){const T=TAROT[c];if(!T)continue;atk+=T.atk||0;mp+=T.mp||0;crit+=T.crit||0;sub+=T.sub||0}
 if(s.skills.faith){def+=3;hp+=25}if(s.skills.silverUp)smax+=20;const aw=G.awakeT>G.time;if(aw)atk*=1.5;
 return{atk,def,hp:Math.round(hp),mp:Math.round(mp),crit,holy,dr,ex,roll,sub,smax,regen,garlic,eye,aw,spd:aw?1.2:1,aspd:aw?.8:1}}
/* ---------- 지도 짓기 ---------- */
function I(m,x,y){return y*m.w+x}
function inMap(m,x,y){return x>=0&&y>=0&&x<m.w&&y<m.h}
function buildMap(id){const def=MAPS[id],rows=MAP_ROWS[id];const h=rows.length,wd=rows[0].length;
 const m={id,def,w:wd,h,fl:[],cube:[],prop:[],solid:new Uint8Array(wd*h),low:new Uint8Array(wd*h),deco:{},lights:[],floor:null,fox:0,foy:0,ex:null,litWin:false};
 const s=G.s,amb=def.amb(s);m.amb=amb;m.litWin=amb.a>.35;
 for(let y=0;y<h;y++)for(let x=0;x<wd;x++){const ch=rows[y][x],L=LEG[ch]||{},i=y*wd+x;let f=L.f||def.base;
  if(L.cube){m.cube[i]=ch;m.solid[i]=1;f=def.under||def.base;if(L.low)m.low[i]=1}
  else if(L.prop){m.prop[i]=L.prop;if(!L.walk)m.solid[i]=1;if(L.low)m.low[i]=1;if(L.light)m.lights.push({x:x+.5,y:y+.5,z:12,r:L.light[0],c:L.light[1],fl:L.light[2]||0})}
  else if(L.brk||L.lever||L.dummy||L.brazier){m.solid[i]=1;m.low[i]=L.brk&&L.brk!=='candle'?1:0}
  if(L.water)m.solid[i]=3;m.fl[i]=f}
 /* 문과 창문, 색유리창, 횃불 */
 for(let y=0;y<h;y++)for(let x=0;x<wd;x++){const i=y*wd+x,ch=m.cube[i];if(!ch)continue;const key=x+','+y;
  if(def.deco&&def.deco[key]!==undefined){m.deco[i]=def.deco[key];continue}
  const openR=inMap(m,x+1,y)&&!m.cube[I(m,x+1,y)],openL=inMap(m,x,y+1)&&!m.cube[I(m,x,y+1)];
  if(ch==='D'){m.deco[i]=openL?'doorl':'doorr';continue}
  const hs=hash(x,y,id.length);
  if(ch==='H'&&(openL||openR)&&hs<.42){m.deco[i]=(openL&&(!openR||hs<.21))?'winl':'winr';m.lights.push({x:x+(openR&&!(openL&&hs<.21)?1.05:.5),y:y+(openL&&(!openR||hs<.21)?1.05:.5),z:16,r:16,c:'#ffb050',fl:.2,win:1})}
  else if(ch==='C'&&(openL||openR)&&hs<.3)m.deco[i]=openL?'gwinl':'gwinr';
  else if(ch==='X'&&(openL||openR)&&hs<.12)m.deco[i]=(openL?'niche':'niche')+(openL?'l':'r');
  else if(ch==='X'&&(openL||openR)&&hs>.93)m.deco[i]='web'+(openL?'l':'r');
  else if(ch==='I'&&(openL||openR)&&hs<.12)m.deco[i]='banner'+(openL?'l':'r')}
 if(m.litWin===false)m.lights=m.lights.filter(l=>!l.win);
 return m}
/* 바닥은 지도마다 한 장으로 미리 구워 둔다 (그늘, 얼룩, 계단까지) */
function bakeFloor(m){const W2=(m.w+m.h)*16+32,H2=(m.w+m.h)*8+24;const cv=mkcv(W2,H2);m.fox=m.h*16+16;m.foy=8;if(!cv){m.floor=null;return}const g=cv.g;m.floor=cv.c;
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;let f=m.fl[i];const t=floorTile(f,Math.floor(hash(x,y,3)*4),(x+y)&1);const sx=m.fox+(x-y)*16-16,sy=m.foy+(x+y)*8;if(t)g.drawImage(t,sx,sy)}
 /* 벽 아래 그늘: 뒤쪽(-x,-y)에 벽이 있으면 그 가장자리를 어둡게 */
 const shade=(x,y,dx,dy)=>{const sx=m.fox+(x-y)*16,sy=m.foy+(x+y)*8;g.fillStyle='rgba(0,0,0,.28)';if(dx)fillPoly(g,[[sx,sy],[sx-16,sy+8],[sx-12,sy+10],[sx+4,sy+2]],'rgba(0,0,0,.3)');if(dy)fillPoly(g,[[sx,sy],[sx+16,sy+8],[sx+12,sy+10],[sx-4,sy+2]],'rgba(0,0,0,.3)')};
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;if(m.solid[i]===1&&m.cube[i])continue;if(m.solid[i]===3)continue;const wl=x>0&&m.cube[i-1]&&!m.low[i-1],wu=y>0&&m.cube[i-m.w]&&!m.low[i-m.w];if(wl||wu)shade(x,y,wl,wu)}
 /* 바닥 얼룩: 이끼, 낙엽, 핏자국, 금 */
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;if(m.cube[i]||m.solid[i]===3)continue;const r=hash(x,y,77);const sx=m.fox+(x-y)*16,sy=m.foy+(x+y)*8+8;
  if(m.def.base==='-'&&r<.05){dot(g,'#4a0c14',sx-3,sy-1,5,2);dot(g,'#5e1018',sx-1,sy,3,1)}
  else if(m.def.base===';'&&r<.06){dot(g,'#4a3a1a',sx-4,sy,2,1);dot(g,'#5a2a1a',sx+2,sy-2,2,1)}
  else if(r>.97){dot(g,'rgba(0,0,0,.35)',sx-5,sy,1,1);dot(g,'rgba(0,0,0,.35)',sx-4,sy+1,3,1);dot(g,'rgba(0,0,0,.35)',sx-1,sy+2,2,1)}}
 /* 계단 */
 for(const e of m.def.exits||[])if(e.stairs){const sx=m.fox+(e.x-e.y)*16,sy=m.foy+(e.x+e.y)*8;for(let k=0;k<5;k++){const c=e.stairs==='down'?mix('#3a3641','#050407',k/4):mix('#5a5664','#3a3641',k/4);fillPoly(g,[[sx-14+k*2,sy+8-k],[sx+k*2,sy+1-k+k],[sx+14-k*2+2,sy+8+k-k],[sx+k*0,sy+15-k]],c)}
  fillPoly(g,e.stairs==='down'?[[sx-6,sy+6],[sx+6,sy+4],[sx+10,sy+9],[sx-2,sy+11]]:[[sx-8,sy+8],[sx,sy+4],[sx+8,sy+8],[sx,sy+12]],e.stairs==='down'?'#030205':'#6a6676')}}
/* ---------- 지도에 들어가기 ---------- */
function enterMap(id,x,y,face){const s=G.s;const m=buildMap(id);G.m=m;bakeFloor(m);
 G.ents=[];G.shots=[];G.hz=[];G.fx=[];G.txt=[];G.dec=[];G.boss=null;G.arena=null;G.watch=G.watch.filter(wt=>wt.keep);G.trigDone={};G.flow=null;G.flowKey='';
 const nh=mkHero(x,y,face||[s.fx||1,s.fy||1]);const h=G.hero=G.hero&&G.hero.kind==='hero'?Object.assign(G.hero,nh):nh;s.map=id;
 if(!s.ex[id])s.ex[id]='0'.repeat(m.w*m.h);m.ex=s.ex[id].split('').map(Number);
 /* 부서지는 물건, 지렛대, 화로, 허수아비 */
 const rows=MAP_ROWS[id];for(let yy=0;yy<m.h;yy++)for(let xx=0;xx<m.w;xx++){const L=LEG[rows[yy][xx]];if(!L)continue;
  if(L.brk)G.ents.push(mkObj('brk',xx,yy,{art:L.brk,hp:1,light:L.brk==='candle'?{r:24,c:'#ffc070',fl:.5,z:20}:null}));
  if(L.lever)G.ents.push(mkObj('lever',xx,yy,{on:!!s.flags['lever_'+id+'_'+xx+'_'+yy]}));
  if(L.brazier){const lit=!!s.flags['bz_'+id+'_'+xx+'_'+yy]||!!s.flags.braziers;G.ents.push(mkObj('brazier',xx,yy,{lit,light:{r:30,c:'#ffd27a',fl:1,z:16}}))}
  if(L.dummy)G.ents.push(mkObj('dummy',xx,yy,{hp:9999}))}
 for(const c of m.def.chests||[])G.ents.push(mkObj('chest',c.x,c.y,{cid:c.id,open:!!s.opened[c.id],c}));
 for(const it of m.def.items||[])if(!s.got[it.id]&&(!it.when||it.when(s)))G.ents.push({kind:'pick',x:it.x+.5,y:it.y+.5,z:0,vz:0,r:.3,what:it.what,gid:it.id,t:0,keep:1});
 for(const sp of m.def.special||[]){if(sp.when&&!sp.when(s))continue;
  if(sp.k==='crack'&&!s.flags['broke_'+sp.id])G.ents.push(mkObj('crack',sp.x,sp.y,{hp:3,sid:sp.id}));
  if(sp.k==='gate'&&!s.flags[sp.flag])G.ents.push(mkObj('gate',sp.x,sp.y,{flag:sp.flag,gid:sp.id}))}
 for(const n of m.def.npcs||[])if(!n.when||n.when(s))G.ents.push(mkNpc(n));
 for(const mb of m.def.mobs||[])if(!mb.when||mb.when(s))G.ents.push(mkMob(mb.t,mb.x+.5,mb.y+.5,mb));
 G.ents.push(h);markSolids();
 G.cam.x=(h.x-h.y)*16;G.cam.y=(h.x+h.y)*8;G.banner={t:m.def.n,at:G.time};G.lastExit=tileOf(h);
 playMusic(typeof m.def.music==='function'?m.def.music(s):m.def.music);
 for(const tr of m.def.trig||[])if(tr.onLoad&&(!tr.when||tr.when(s))){G.trigDone[tr.id]=1;runScript(EV[tr.run](s))}
 G.pre={map:id,x,y};writeSave('auto');G.pre=null;}
function tileOf(e){return Math.floor(e.x)+','+Math.floor(e.y)}
function mkObj(k,x,y,o){const e={kind:k,x:x+.5,y:y+.5,z:0,r:.42,tx:x,ty:y,flash:0,t:0,...o};return e}
function markSolids(){const m=G.m;for(const e of G.ents){if(e.kind==='brk'||e.kind==='lever'||e.kind==='brazier'||e.kind==='chest'||e.kind==='crack'||e.kind==='gate'||e.kind==='dummy'){const i=I(m,e.tx,e.ty);m.solid[i]=e.gone?0:1;if(e.kind==='brk'&&e.art!=='candle'&&!e.gone)m.low[i]=1}}}
function mkHero(x,y,f){const n=Math.hypot(f[0],f[1])||1;return{kind:'hero',x,y,z:0,r:.27,fx:f[0]/n,fy:f[1]/n,st:'idle',t:0,inv:0,flash:0,kbx:0,kby:0,anim:0,flip:0,front:1,sw:null,chgT:0,chgL:0,rl:null,cd:{},hold:{},counter:0,dmgTaken:0}}
function mkNpc(n){const N=NPC[n.id]||{};return{kind:'npc',id:n.id,x:n.x+.5,y:n.y+.5,z:0,r:.3,fx:(n.face||[1,1])[0],fy:(n.face||[1,1])[1],look:N.look||n.id,face:N.face||n.id,home:{x:n.x+.5,y:n.y+.5},wander:n.wander,reach:n.reach||1.15,v:n.v,sleep:n.sleep,t:rand(0,2000),mv:null,alpha:1}}
function mkMob(type,x,y,o={}){const D=ENEMY[type],df=DIFF[G.s.diff]||DIFF.normal;const hp=Math.round(D.hp*df.hp*(o.hpK||1));
 return{kind:'mob',type,D,x,y,z:D.fly?12:0,r:D.r,hp,mhp:hp,st:o.idle?'wait':o.bury||D.ai==='ghoul'&&o.bury?'buried':'idle',t:rand(0,800),fx:1,fy:1,home:{x,y},inv:0,flash:0,kbx:0,kby:0,cd:rand(400,1400),tag:o.tag||null,arena:o.arena||null,
  boss:!!D.boss,phase:0,poise:0,alpha:o.bury?0:1,orb:rnd()<.5?1:-1,anim:rand(0,1000),hitSet:null,flags:{}}}
/* ---------- 입력 ---------- */
const DIRK={'8':[0,-1],'2':[0,1],'4':[-1,0],'6':[1,0],'7':[-1,-1],'9':[1,-1],'1':[-1,1],'3':[1,1],up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const ACT={ok:'atk','5':'atk',send:'roll','0':'roll',clr:'sub','*':'sub',nate:'skill','#':'skill',menu:'menu'};
function inputDir(){let sx=0,sy=0;for(const k in G.keys){const d=DIRK[k];if(d){sx+=d[0];sy+=d[1]}}if(!sx&&!sy)return null;
 const mx=sx+sy,my=sy-sx,n=Math.hypot(mx,my);if(n<1e-6)return null;return[mx/n,my/n]}
function actHeld(a){for(const k in G.keys)if(ACT[k]===a)return true;return false}
/* ---------- 움직임과 충돌 ---------- */
function blocks(m,tx,ty,fly){if(tx<0||ty<0||tx>=m.w||ty>=m.h)return true;const v=m.solid[ty*m.w+tx];if(!v)return false;if(fly)return v===1&&!m.low[ty*m.w+tx];return true}
function resolve(e,fly){const m=G.m,r=e.r;for(let it=0;it<3;it++){let moved=false;const x0=Math.floor(e.x-r),x1=Math.floor(e.x+r),y0=Math.floor(e.y-r),y1=Math.floor(e.y+r);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){if(!blocks(m,tx,ty,fly))continue;const cx=clamp(e.x,tx,tx+1),cy=clamp(e.y,ty,ty+1);let dx=e.x-cx,dy=e.y-cy;const d2=dx*dx+dy*dy;if(d2>=r*r)continue;
  if(d2<1e-9){const l=e.x-tx,rr=tx+1-e.x,u=e.y-ty,dd=ty+1-e.y,mn=Math.min(l,rr,u,dd);if(mn===l)e.x=tx-r;else if(mn===rr)e.x=tx+1+r;else if(mn===u)e.y=ty-r;else e.y=ty+1+r}
  else{const d=Math.sqrt(d2),p=r-d;e.x+=dx/d*p;e.y+=dy/d*p}moved=true}if(!moved)break}}
function moveEnt(e,dx,dy,fly){const n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/.18));for(let i=0;i<n;i++){e.x+=dx/n;resolve(e,fly);e.y+=dy/n;resolve(e,fly)}
 if(G.arena&&(e.kind==='hero'||e.boss||e.arenaIn)){const A=G.arena;e.x=clamp(e.x,A.x0+e.r,A.x1-e.r);e.y=clamp(e.y,A.y0+e.r,A.y1-e.r)}}
function los(ax,ay,bx,by){const m=G.m;const dx=bx-ax,dy=by-ay,n=Math.ceil(Math.hypot(dx,dy)*3);for(let i=1;i<n;i++){const x=Math.floor(ax+dx*i/n),y=Math.floor(ay+dy*i/n);if(!inMap(m,x,y))return false;const v=m.solid[y*m.w+x];if(v===1&&!m.low[y*m.w+x])return false}return true}
/* 길찾기: 주인공 칸에서 퍼져 나간 거리 지도 */
function updateFlow(){const h=G.hero,m=G.m;const key=tileOf(h);if(key===G.flowKey&&G.flow)return;G.flowKey=key;const N=m.w*m.h,D=G.flow&&G.flow.length===N?G.flow:new Int16Array(N);D.fill(-1);
 const hx=clamp(Math.floor(h.x),0,m.w-1),hy=clamp(Math.floor(h.y),0,m.h-1);const q=new Int32Array(N);let qh=0,qt=0;D[hy*m.w+hx]=0;q[qt++]=hy*m.w+hx;
 while(qh<qt){const c=q[qh++],cx=c%m.w,cy=(c/m.w)|0,cd=D[c];if(cd>40)continue;for(let k=0;k<8;k++){const dx=[1,-1,0,0,1,1,-1,-1][k],dy=[0,0,1,-1,1,-1,1,-1][k],nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=m.w||ny>=m.h)continue;const ni=ny*m.w+nx;if(D[ni]>=0||m.solid[ni])continue;
  if(dx&&dy&&(m.solid[cy*m.w+nx]||m.solid[ny*m.w+cx]))continue;D[ni]=cd+1;q[qt++]=ni}}G.flow=D}
function flowStep(e){const m=G.m,D=G.flow;if(!D)return null;const cx=Math.floor(e.x),cy=Math.floor(e.y);let best=null,bd=1e9;const cur=inMap(m,cx,cy)?D[cy*m.w+cx]:-1;
 for(let k=0;k<8;k++){const dx=[1,-1,0,0,1,1,-1,-1][k],dy=[0,0,1,-1,1,-1,1,-1][k],nx=cx+dx,ny=cy+dy;if(!inMap(m,nx,ny))continue;const d=D[ny*m.w+nx];if(d<0)continue;if(dx&&dy&&(m.solid[cy*m.w+nx]||m.solid[ny*m.w+cx]))continue;if(d<bd){bd=d;best=[nx+.5-e.x,ny+.5-e.y]}}
 if(!best||(cur>=0&&bd>=cur))return null;const n=Math.hypot(best[0],best[1])||1;return[best[0]/n,best[1]/n]}
/* ---------- 주인공 ---------- */
function setFace(h,dx,dy){const n=Math.hypot(dx,dy);if(n<1e-6)return;h.fx=dx/n;h.fy=dy/n}
function comboList(){const W=WEAPON[G.s.wpn]||WEAPON.cane;const L=W.combo.slice();if(G.s.skills.combo4)L.push({w:90,a:120,r:300,m:2.1,step:.36,kb:3.2,fin:1});return L}
function canAct(h){return h.st==='idle'||h.st==='move'}
function heroUpdate(dt){const h=G.hero,s=G.s,st=G.st,ms=dt*1000;h.t+=ms;h.anim+=ms;
 if(s.hp<=0&&h.st!=='dead'){heroDie();return}
 if(h.st==='dead'){h.t+=0;return}
 const mv=G.sc?null:inputDir();
 /* 넉백 */
 if(Math.abs(h.kbx)+Math.abs(h.kby)>.01){moveEnt(h,h.kbx*dt,h.kby*dt);const f=Math.exp(-dt*9);h.kbx*=f;h.kby*=f}
 if(!G.sc)while(G.kq.length){const ev=G.kq.shift();heroKey(ev,mv)}else G.kq.length=0;
 const W=WEAPON[s.wpn]||WEAPON.cane;
 switch(h.st){
  case 'idle':case 'move':if(mv){h.st='move';setFace(h,mv[0],mv[1]);const sp=3.25*st.spd*(G.sc?0:1);moveEnt(h,mv[0]*sp*dt,mv[1]*sp*dt);h.walk=(h.walk||0)+ms;if(Math.floor(h.walk/280)!==Math.floor((h.walk-ms)/280))stepSound()}else{h.st='idle'}break;
  case 'atk':{const sw=h.sw,c=sw.c,k=st.aspd,tw=c.w*k,ta=c.a*k,tr=c.r*k;
   if(h.t<tw+ta&&h.t+ms>=tw&&!sw.stepped){sw.stepped=1;moveEnt(h,h.fx*c.step,h.fy*c.step)}
   if(h.t>=tw&&h.t<tw+ta+ms)meleeHits(sw,c.m,W.reach+(c.fin?.25:0),c.fin?Math.PI:W.arc,c.kb||1.1,c.fin);
   if(h.t>=tw+ta+tr){if(sw.buf&&sw.i+1<comboList().length)startSwing(sw.i+1);else if(actHeld('atk')&&!sw.buf&&G.time-(h.hold.atk||G.time)>260){h.st='charge';h.t=0;h.chgL=0}else{h.st='idle';h.sw=null;h.comboEnd=G.time}}
   else if(mv&&h.t>tw+ta+tr*.5&&!sw.buf){h.st='move';h.sw=null}break}
  case 'charge':{if(mv){setFace(h,mv[0],mv[1]);moveEnt(h,mv[0]*1.1*dt,mv[1]*1.1*dt)}const L=h.t>=1000?2:h.t>=360?1:0;if(L>h.chgL){h.chgL=L;sfx(L===2?'charge2':'charge1');addFx('ring',h.x,h.y,14,{c:L===2?'#ffe070':'#c8d8ff',life:260,r0:2,r1:18})}
   if(rnd()<.5)addFx('spark',h.x+rand(-.6,.6),h.y+rand(-.6,.6),rand(4,20),{c:L===2?'#ffe070':'#d8e4ff',vz:30,life:300});
   if(!actHeld('atk')){if(h.chgL>0)startSpin(h.chgL);else{h.st='idle'}}break}
  case 'spin':{const sp=h.spin;if(!sp.done&&h.t>=40){sp.done=1;areaHit(h.x,h.y,sp.r,sp.m,{kb:3.2,breakGuard:1,heavy:1,spin:1})}if(h.t>=300){h.st='idle'}break}
  case 'roll':{const R=h.rl;const p=h.t/R.dur;const e=1-p;const sp=R.sp*(.55+e*.9);moveEnt(h,R.dx*sp*dt,R.dy*sp*dt);if(h.t>=R.dur){h.st='idle';h.cd.roll=G.time+110;h.rl=null}if(rnd()<.4)addFx('dust',h.x,h.y,1,{life:300});break}
  case 'throw':if(h.t>=150)h.st='idle';break;
  case 'cast':if(h.t>=(h.castDur||420))h.st='idle';break;
  case 'dash':{const D=h.dash;moveEnt(h,D.dx*12*dt,D.dy*12*dt);lineHits(D);addFx('after',h.x,h.y,0,{life:220});if(h.t>=240){h.st='idle';h.dash=null}break}
  case 'hurt':if(h.t>=240)h.st='idle';break;
  case 'stake':if(h.t>=520){h.st='idle'}break}
 /* 기술 키 길게 = 혈기 각성 */
 if(h.hold.skill&&!G.sc){const held=G.time-h.hold.skill;if(canAwaken()&&held>=430){h.hold.skill=0;awaken()}}
 /* 체력 회복 (어머니의 목걸이), 성력 회복 */
 if(st.regen&&s.hp>0&&s.hp<st.hp/4)s.hp=Math.min(st.hp,s.hp+3*dt);
 s.mp=Math.min(st.mp,s.mp+(st.aw?3:1.1)*dt);
 if(h.pray&&G.time<h.pray.until){s.hp=Math.min(st.hp,s.hp+h.pray.rate*dt)}
 if(st.aw&&rnd()<.35)addFx('blood',h.x+rand(-.3,.3),h.y+rand(-.3,.3),rand(4,22),{vz:20,life:420,c:'#ff2a3a'});
 if(G.arena){const A=G.arena;h.x=clamp(h.x,A.x0+h.r,A.x1-h.r);h.y=clamp(h.y,A.y0+h.r,A.y1-h.r)}}
function heroKey(ev,mv){const h=G.hero,s=G.s,a=ACT[ev.id];if(ev.up){if(a==='skill'&&h.hold.skill){const held=G.time-h.hold.skill;h.hold.skill=0;if(held<430||!canAwaken())castSkill()}return}
 if(a==='menu'){openPause();return}
 if(h.st==='dead'||h.st==='stake')return;
 if(a==='atk'){h.hold.atk=G.time;
  const tgt=findInteract();if(tgt&&(canAct(h)||h.st==='atk'&&h.t>200)){interact(tgt);return}
  if(canAct(h)){if(mv)setFace(h,mv[0],mv[1]);startSwing(0);return}
  if(h.st==='atk'&&h.sw){if(h.t>(h.sw.c.w*.5))h.sw.buf=1;return}
  if(h.st==='roll'&&h.t>h.rl.dur*.6){h.bufAtk=1}return}
 if(a==='roll'){if((canAct(h)||h.st==='atk'&&h.t>h.sw.c.w+h.sw.c.a||h.st==='charge'||h.st==='throw'||h.st==='hurt'&&h.t>120)&&!(h.cd.roll>G.time)){startRoll(mv)}return}
 if(a==='sub'){if(canAct(h)||h.st==='atk'&&h.t>h.sw.c.w+h.sw.c.a)throwSub(mv);return}
 if(a==='skill'){if(canAwaken()){h.hold.skill=G.time;return}castSkill();return}}
function startSwing(i){const h=G.hero,c=comboList()[i];if(!c)return;h.st='atk';h.t=0;h.sw={i,c,hit:new Set(),buf:0};aimAssist(h,(WEAPON[G.s.wpn]||WEAPON.cane).reach+1.2);
 sfx(G.s.wpn==='whip'?'whip':G.s.wpn==='axe'?'heavy':'swing',{p:1+i*.08});if(c.fin)G.cam.sh=Math.max(G.cam.sh,1.5)}
function startSpin(L){const h=G.hero,W=WEAPON[G.s.wpn]||WEAPON.cane,sk=G.s.skills.spin;h.st='spin';h.t=0;h.spin={r:W.chg.r+(sk?.5:0),m:W.chg.m*(L===2?1.5:1)*(sk?1.3:1),L};sfx('spin');G.cam.sh=Math.max(G.cam.sh,L===2?3:2);addFx('ring',h.x,h.y,8,{c:'#e8f0ff',life:300,r0:4,r1:h.spin.r*22})}
function aimAssist(h,range){let best=null,bd=1e9;for(const e of G.ents){if(e.kind!=='mob'||e.dead||e.st==='buried'||e.st==='wait'||e.ghost)continue;const dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy);if(d>range)continue;const dot2=(dx*h.fx+dy*h.fy)/(d||1);if(dot2<.35)continue;const sc=d-dot2;if(sc<bd){bd=sc;best=[dx,dy]}}if(best)setFace(h,best[0],best[1])}
function startRoll(mv){const h=G.hero,st=G.st;const d=mv||[h.fx,h.fy];setFace(h,d[0],d[1]);h.st='roll';h.t=0;const dist=2.25*(1+st.roll);h.rl={dx:d[0],dy:d[1],dur:330,sp:dist/.33,perfect:false};h.inv=Math.max(h.inv,G.time+290);h.sw=null;sfx('roll')}
function canAwaken(){return G.s.flags.blood&&G.s.blood>=100&&!(G.awakeT>G.time)}
function awaken(){const h=G.hero;G.awakeT=G.time+12000;G.s.blood=0;sfx('awaken');G.cam.sh=4;slowmo(.35,380);addFx('ring',h.x,h.y,10,{c:'#ff2030',life:500,r0:4,r1:60});for(let i=0;i<24;i++)addFx('blood',h.x,h.y,10,{vx:rand(-3,3),vy:rand(-3,3),vz:rand(20,60),life:600,c:'#ff2a3a'});
 floatTxt(h.x,h.y,30,'혈기 각성!','#ff4050',1);vib([30,40,80])}
/* 보조 무기 */
function throwSub(mv){const h=G.hero,s=G.s,st=G.st,S=SUB[s.sub];if(!S)return;if(h.cd.sub>G.time)return;if(s.silver<S.cost){floatTxt(h.x,h.y,26,'은 조각이 없다','#a8b0c4');sfx('deny');h.cd.sub=G.time+300;return}
 if(mv)setFace(h,mv[0],mv[1]);aimAssist(h,6);s.silver-=S.cost;h.cd.sub=G.time+S.cd;h.st='throw';h.t=0;const k=1+st.sub;
 if(s.sub==='bow'){const fan=s.skills.bolt3?[-.22,0,.22]:[0];for(const a of fan){const c=Math.cos(a),sn=Math.sin(a),dx=h.fx*c-h.fy*sn,dy=h.fx*sn+h.fy*c;G.shots.push({type:'bolt',from:'hero',x:h.x+dx*.3,y:h.y+dy*.3,z:12,vx:dx*10,vy:dy*10,r:.16,dmg:(6+st.atk*.6)*k,life:600,pierce:0,hit:new Set()})}sfx('bow')}
 else if(s.sub==='holy'){let tx=h.x+h.fx*2.6,ty=h.y+h.fy*2.6;let best=null,bd=4.2;for(const e of G.ents){if(e.kind!=='mob'||e.dead||e.st==='buried')continue;const d=Math.hypot(e.x-h.x,e.y-h.y);const dot2=((e.x-h.x)*h.fx+(e.y-h.y)*h.fy)/(d||1);if(d<bd&&dot2>.3){bd=d;best=e}}
  for(const e of G.ents)if(e.kind==='brazier'&&!e.lit){const d=Math.hypot(e.x-h.x,e.y-h.y);const dot2=((e.x-h.x)*h.fx+(e.y-h.y)*h.fy)/(d||1);if(d<3.4&&dot2>.6&&(!best||d<bd)){best=e;bd=d}}
  if(best){tx=best.x;ty=best.y}const dur=.5;G.shots.push({type:'holy',from:'hero',x:h.x,y:h.y,z:14,sx:h.x,sy:h.y,tx,ty,t:0,dur,r:.2,dmg:(3+st.atk*.25)*k,life:dur*1000+50,hit:new Set()});sfx('throw')}
 else if(s.sub==='cross'){G.shots.push({type:'cross',from:'hero',x:h.x,y:h.y,z:12,vx:h.fx*8.5,vy:h.fy*8.5,r:.32,dmg:(8+st.atk*.7)*k,life:1400,t:0,back:false,hit:new Set(),hit2:new Set()});sfx('cross')}}
/* 기술 */
function castSkill(){const h=G.hero,s=G.s,st=G.st,id=s.skill,S=SKILL[id];if(!S||!s.skills[id]){floatTxt(h.x,h.y,26,s.skill?'배우지 않은 기술':'기술을 배우자 (메뉴)','#a8b0c4');sfx('deny');return}
 if(!canAct(h)&&!(h.st==='atk'&&h.t>h.sw.c.w+h.sw.c.a))return;if((h.cd['sk_'+id]||0)>G.time){sfx('deny');return}
 if(s.mp<S.mp){floatTxt(h.x,h.y,26,'성력이 모자라다','#7aa8ff');sfx('deny');return}
 s.mp-=S.mp;h.cd['sk_'+id]=G.time+S.cd;
 if(id==='sign'){h.st='cast';h.t=0;h.castDur=380;sfx('holy');G.cam.sh=Math.max(G.cam.sh,2.5);addFx('cross',h.x,h.y,14,{life:520});addFx('ring',h.x,h.y,6,{c:'#fff4c0',life:420,r0:4,r1:52});areaHit(h.x,h.y,2.3,1,{flat:16+st.atk*1.2,holy:1,kb:4,breakGuard:1,skill:1});lightBraziers(h.x,h.y,2.3)}
 else if(id==='pray'){h.st='cast';h.t=0;h.castDur=650;h.pray={until:G.time+2500,rate:st.hp*.3/2.5};sfx('pray');for(let i=0;i<14;i++)addFx('spark',h.x+rand(-.5,.5),h.y+rand(-.5,.5),rand(0,10),{vz:rand(16,30),life:900,c:'#fff4c0'})}
 else if(id==='dash'){const mv=inputDir();if(mv)setFace(h,mv[0],mv[1]);aimAssist(h,4);h.st='dash';h.t=0;h.dash={dx:h.fx,dy:h.fy,hit:new Set(),m:1.6};h.inv=Math.max(h.inv,G.time+260);sfx('dash')}}
/* ---------- 맞히기 ---------- */
function targets(){return G.ents.filter(e=>(e.kind==='mob'&&!e.dead&&e.st!=='buried'&&!e.ghost&&e.st!=='wait'&&!(e.st==='down'))||(e.kind==='brk'&&!e.gone)||e.kind==='dummy'||(e.kind==='crack'&&!e.gone)||(e.kind==='mob'&&e.st==='bones'))}
function meleeHits(sw,m,reach,arc,kb,fin){const h=G.hero,whip=G.s.wpn==='whip'&&!fin;for(const e of targets()){if(sw.hit.has(e))continue;const dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy);let ok=false;
 if(whip){const pr=dx*h.fx+dy*h.fy,perp=Math.abs(dx*h.fy-dy*h.fx);ok=pr>-.2&&pr<=reach+e.r&&perp<=.38+e.r}else{if(d-e.r<=reach){const ang=Math.acos(clamp((dx*h.fx+dy*h.fy)/(d||1),-1,1));ok=d<.45||ang<=arc}}
 if(ok){sw.hit.add(e);hitTarget(e,G.st.atk*m,{kb,heavy:fin||m>=1.6,melee:1,dirx:dx/(d||1),diry:dy/(d||1),counter:h.counter>G.time})}}}
function areaHit(x,y,r,m,o){for(const e of targets()){const d=Math.hypot(e.x-x,e.y-y);if(d-e.r<=r)hitTarget(e,o.flat!=null?o.flat:G.st.atk*m,{...o,dirx:(e.x-x)/(d||1),diry:(e.y-y)/(d||1)})}}
function lineHits(D){const h=G.hero;for(const e of targets()){if(D.hit.has(e))continue;if(Math.hypot(e.x-h.x,e.y-h.y)<=.6+e.r){D.hit.add(e);hitTarget(e,G.st.atk*D.m,{kb:2,dirx:D.dx,diry:D.dy,melee:1})}}}
function hitTarget(e,dmg,o){if(e.kind==='brk'){breakObj(e);return}if(e.kind==='crack'){e.hp--;e.flash=G.time+90;sfx('rock');G.cam.sh=Math.max(G.cam.sh,1.5);for(let i=0;i<6;i++)addFx('debris',e.x,e.y,rand(4,24),{vx:rand(-2,2),vy:rand(-2,2),vz:rand(10,40),life:600,c:'#4a4656'});if(e.hp<=0){e.gone=1;G.s.flags['broke_'+e.sid]=1;markSolids();sfx('crumble');floatTxt(e.x,e.y,20,'벽이 무너졌다!','#e8d8b0')}return}
 if(e.kind==='dummy'){const d=Math.round(dmg);e.flash=G.time+90;e.t=0;floatTxt(e.x,e.y,26,String(d),'#fff');sfx('hit',{p:1.2});addFx('debris',e.x,e.y,22,{vx:rand(-1,1),vy:rand(-1,1),vz:rand(10,30),life:400,c:'#b8963e'});G.s.dummyHits=(G.s.dummyHits||0)+1;return}
 hurtMob(e,dmg,o)}
function breakObj(e){e.gone=1;markSolids();sfx(e.art==='candle'?'candle':'smash');const col={candle:'#c8a040',urn:'#8a5a3a',crate:'#8a6a40',barrel:'#6a4428'}[e.art]||'#888';
 for(let i=0;i<8;i++)addFx('debris',e.x,e.y,rand(2,16),{vx:rand(-2.5,2.5),vy:rand(-2.5,2.5),vz:rand(20,50),life:700,c:col});const r=rnd();
 if(e.art==='candle'){dropPick(e.x,e.y,'silver',rnd()<.3?2:1)}else if(r<.45)dropPick(e.x,e.y,'gold',Math.floor(rand(2,8)));else if(r<.6)dropPick(e.x,e.y,'silver',1);else if(r<.67)dropPick(e.x,e.y,'item:herb',1)}
function hurtMob(e,dmg,o={}){if(e.dead||e.inv>G.time&&!o.ignoreInv)return 0;const D=e.D,st=G.st,s=G.s;
 if(e.st==='bones'){if(o.holy||dmg>0){e.dead=1;e.gone=1;deathFx(e);floatTxt(e.x,e.y,20,'산산조각!','#e8e0c8');killReward(e);sfx('bones')}return 0}
 let d=dmg;const undead=D.tags.includes('undead');if(o.holy&&undead)d*=1.6*(1+st.holy);else if(o.holy)d*=1+st.holy;
 if(o.counter){d*=s.skills.counter?2.2:1.6;o.crit=true}
 if(e.guard&&!o.breakGuard&&!o.holy&&o.dirx!=null){const fd=-(o.dirx*e.fx+o.diry*e.fy);if(fd>.25){d*=.15;e.flash=G.time+60;sfx('clank');addFx('spark',e.x-o.dirx*.4,e.y-o.diry*.4,16,{vz:30,life:250,c:'#fff'});floatTxt(e.x,e.y,30,'막았다!','#c8d0e0');e.hp-=Math.max(1,Math.round(d));checkDeath(e,o);return d}}
 if(e.guard&&(o.breakGuard||o.holy)&&e.st!=='stagger'){e.guard=0;e.st='stagger';e.t=0;floatTxt(e.x,e.y,32,'방패가 깨졌다!','#ffe070');sfx('break')}
 d=Math.max(1,d*rand(.92,1.08)-D.def*.5);let crit=!!o.crit||rnd()<st.crit;if(crit)d*=1.6;d=Math.round(d);
 e.hp-=d;e.flash=G.time+90;if(o.dirx!=null&&!e.boss){const kb=(o.kb||1)*(D.big?.4:1);e.kbx=o.dirx*kb*3;e.kby=o.diry*kb*3}
 if(!e.boss&&e.st!=='down'&&e.hp>0&&(o.heavy||dmg>e.mhp*.18||D.ai!=='vamp')){if(['wind','claw','lunge'].includes(e.st)&&!o.heavy&&rnd()<.5){}else{e.st='hurt';e.t=0}}
 if(e.boss){e.poise+=d;if(e.poise>e.mhp*.12&&!['howl','summon','mist','stagger'].includes(e.st)){e.poise=0;e.st='stagger';e.t=0}}
 floatTxt(e.x,e.y,e.z+22,String(d),crit?'#ffe060':'#ffffff',crit);if(o.melee||o.shot)addFx('hitmark',e.x,e.y,(e.z||0)+12,{life:150,r1:Math.atan2(o.diry||0,o.dirx||1)});
 if(o.melee&&e.boss)G.hitstop=Math.max(G.hitstop,crit?70:45);else if(o.melee)G.hitstop=Math.max(G.hitstop,o.heavy||crit?80:50);
 sfx(o.holy?'holyhit':crit?'crit':'hit',{p:rand(.9,1.1)});if(crit)G.cam.sh=Math.max(G.cam.sh,2);
 const bc=s.opt.blood==='green'?'#3aa040':'#b0141e';for(let i=0;i<(crit?7:4);i++)addFx(D.tags.includes('undead')&&!D.tags.includes('vampire')?'debris':'blood',e.x,e.y,rand(8,20),{vx:(o.dirx||0)*rand(1,3)+rand(-1,1),vy:(o.diry||0)*rand(1,3)+rand(-1,1),vz:rand(10,40),life:500,c:D.tags.includes('undead')&&!D.tags.includes('vampire')?'#d8d2c0':bc});
 if(rnd()<.35&&!D.tags.includes('undead'))addDecal(e.x+rand(-.3,.3),e.y+rand(-.3,.3),'blood');
 if(s.flags.blood&&!st.aw)s.blood=Math.min(100,s.blood+2);if(st.aw)s.hp=Math.min(st.hp,s.hp+d*.06);
 if(G.s.opt.vib)vib(12);checkDeath(e,o);return d}
function checkDeath(e,o){if(e.hp>0||e.dead)return;const D=e.D;
 if(D.ai==='lucia'){if(e.st!=='down'){e.hp=1;e.st='down';e.t=0;G.shots=G.shots.filter(p=>p.from==='hero');runScript(EV.luciaDown(G.s))}return}
 if(D.stake&&e.st!=='down'&&!o.holyKill){e.hp=0;e.st='down';e.t=0;e.downAt=G.time;sfx('down');floatTxt(e.x,e.y,30,'말뚝을 박자!','#ff8090');return}
 if(D.ai==='skel'&&!o.holy&&!e.collapsed){e.collapsed=1;e.st='bones';e.t=0;e.hp=1;sfx('bones');for(let i=0;i<6;i++)addFx('debris',e.x,e.y,rand(4,20),{vx:rand(-2,2),vy:rand(-2,2),vz:rand(10,40),life:500,c:'#e8e0c8'});return}
 killMob(e)}
function killMob(e,staked){e.dead=1;e.gone=1;deathFx(e);killReward(e,staked);sfx(e.boss?'bossdie':'die');if(e.boss){setTimeout0(()=>jingle('victory'));G.cam.sh=5;slowmo(.3,600);if(G.boss===e)G.boss=null;const n=e.type+'Dead';if(EV[n])runScript(EV[n](G.s))}}
function deathFx(e){const D=e.D;if(D.tags.includes('vampire')){for(let i=0;i<26;i++)addFx('ash',e.x+rand(-.3,.3),e.y+rand(-.3,.3),rand(0,24),{vz:rand(10,40),vx:rand(-.5,.5),vy:rand(-.5,.5),life:rand(700,1400)})}
 else for(let i=0;i<14;i++)addFx(D.tags.includes('undead')?'debris':'blood',e.x,e.y,rand(4,18),{vx:rand(-2,2),vy:rand(-2,2),vz:rand(20,50),life:600,c:D.tags.includes('undead')?'#d8d2c0':(G.s.opt.blood==='green'?'#3aa040':'#9a1018')});
 addFx('smoke',e.x,e.y,8,{life:500})}
function killReward(e,staked){const s=G.s,st=G.st,D=e.D;s.kills[e.type]=(s.kills[e.type]||0)+1;if(s.kills[e.type]===1&&!D.boss)G.toasts.push({t:'괴물 도감: '+D.n,at:G.time,c:'#c8b0ff'});
 gainExp(D.exp*(staked?1.5:1));const g=Math.floor(rand(D.gold[0],D.gold[1]+1));if(g>0)dropPick(e.x,e.y,'gold',g);
 if(rnd()<(D.boss?1:.32)+(s.skills.silverUp?.12:0))dropPick(e.x,e.y,'silver',(D.boss?6:1)+(s.skills.silverUp?1:0));
 if(D.drop&&rnd()<D.drop[1])dropPick(e.x,e.y,'item:'+D.drop[0],1);if(rnd()<.03)dropPick(e.x,e.y,'item:herb',1);
 if(s.flags.blood&&!st.aw)s.blood=Math.min(100,s.blood+(staked?15:6));
 if(e.tag)setTimeout0(checkWatch)}
function setTimeout0(f){G.later=G.later||[];G.later.push(f)}
function gainExp(n){const s=G.s,st=G.st;n=Math.round(n*(1+(st?st.ex:0)));if(n<=0)return;s.exp+=n;let up=0;while(s.exp>=expNeed(s.lv)&&s.lv<60){s.exp-=expNeed(s.lv);s.lv++;s.sp++;up++}
 if(up){G.st=stats();s.hp=G.st.hp;s.mp=G.st.mp;const h=G.hero;floatTxt(h.x,h.y,34,'레벨 '+s.lv+'!','#ffe070',1);sfx('levelup');G.toasts.push({t:'레벨이 올랐다! 기술 점수 +'+up,at:G.time,c:'#ffe070'});for(let i=0;i<20;i++)addFx('spark',h.x,h.y,rand(0,10),{vx:rand(-1.5,1.5),vy:rand(-1.5,1.5),vz:rand(30,60),life:800,c:'#ffe070'})}}
/* 말뚝 박기 */
function stake(e){const h=G.hero;h.st='stake';h.t=0;setFace(h,e.x-h.x,e.y-h.y);sfx('stake');G.hitstop=110;G.cam.sh=4;vib([20,30,60]);
 for(let i=0;i<16;i++)addFx('blood',e.x,e.y,rand(4,16),{vx:rand(-2,2),vy:rand(-2,2),vz:rand(20,60),life:600,c:G.s.opt.blood==='green'?'#3aa040':'#c0101e'});floatTxt(e.x,e.y,30,'말뚝!','#ff5060',1);
 setTimeout0(()=>{sfx('stake2');killMob(e,true)})}
/* ---------- 주인공이 맞음 ---------- */
function hurtHero(dmg,src,o={}){const h=G.hero,s=G.s,st=G.st;if(!h||h.st==='dead'||G.sc)return false;
 if(h.inv>G.time){if(h.st==='roll'&&h.rl&&!h.rl.perfect&&h.t<(s.skills.counter?300:170)){h.rl.perfect=true;h.counter=G.time+1300;slowmo(.3,450);floatTxt(h.x,h.y,30,'완벽 회피!','#9af0ff',1);sfx('perfect')}return false}
 let d=dmg*(DIFF[s.diff]||DIFF.normal).dmg;d=d*(1-st.dr)-st.def*.6;if(st.aw)d*=.85;d=Math.max(1,Math.round(d));
 s.hp=Math.max(0,s.hp-d);h.inv=G.time+(o.long?900:650);h.flash=G.time+140;h.dmgTaken+=d;
 if(o.drain&&!st.garlic&&src&&src.hp!=null){src.hp=Math.min(src.mhp,src.hp+d);floatTxt(h.x,h.y,40,'피를 빨렸다','#ff6070')}
 if(src&&src.x!=null){const dx=h.x-src.x,dy=h.y-src.y,n=Math.hypot(dx,dy)||1;const kb=(o.kb||2.2);h.kbx=dx/n*kb*2.4;h.kby=dy/n*kb*2.4}
 if(h.st!=='charge'||d>12){h.st='hurt';h.t=0;h.sw=null}
 floatTxt(h.x,h.y,30,String(d),'#ff5050');sfx('hurt');G.cam.sh=Math.max(G.cam.sh,d>15?4:2.5);G.hitstop=Math.max(G.hitstop,60);vib(d>15?[60,30,60]:40);
 for(let i=0;i<5;i++)addFx('blood',h.x,h.y,rand(8,20),{vx:rand(-1.5,1.5),vy:rand(-1.5,1.5),vz:rand(10,30),life:450,c:s.opt.blood==='green'?'#3aa040':'#c0101e'});
 if(s.hp<=0)heroDie();return true}
function heroDie(){const h=G.hero,s=G.s;if(h.st==='dead')return;h.st='dead';h.t=0;s.deaths++;sfx('death');playMusic(null);slowmo(.35,900);G.cam.sh=5;G.deadAt=G.time;G.deadReal=G.now;G.awakeT=0}
function slowmo(k,ms){G.slowK=k;G.slowT=G.time+ms}
function vib(p){if(!G.s||G.s.opt.vib===0)return;try{host&&host.vibrate&&host.vibrate(p,'touch')}catch(_){}}
/* ---------- 줍기 ---------- */
function dropPick(x,y,what,n){if(what==='gold'){let left=n;while(left>0){const v=left>=10?5:left>=4?2:1;left-=v;G.ents.push({kind:'pick',x:x+rand(-.2,.2),y:y+rand(-.2,.2),z:6,vz:rand(30,55),vx:rand(-1.2,1.2),vy:rand(-1.2,1.2),r:.25,what:'gold',n:v,t:0})}return}
 G.ents.push({kind:'pick',x:x+rand(-.2,.2),y:y+rand(-.2,.2),z:6,vz:rand(30,55),vx:rand(-1,1),vy:rand(-1,1),r:.25,what,n,t:0})}
function pickUpdate(e,dt){const h=G.hero,ms=dt*1000;e.t+=ms;if(e.vz!=null&&(e.z>0||e.vz>0)){e.vz-=160*dt;e.z=Math.max(0,e.z+e.vz*dt);if(e.vx){moveEnt(e,e.vx*dt,e.vy*dt);e.vx*=.92;e.vy*=.92}if(e.z===0)e.vz=0}
 const dx=h.x-e.x,dy=h.y-e.y,d=Math.hypot(dx,dy);const magnet=!e.keep&&(e.what==='gold'||e.what==='silver')&&e.t>350&&d<1.7;if(magnet&&d>.05){const sp=6*dt;e.x+=dx/d*Math.min(sp,d);e.y+=dy/d*Math.min(sp,d)}
 if(d<.5&&e.t>(e.keep?0:250)&&h.st!=='dead'&&!G.sc){e.gone=1;collect(e)}
 if(!e.keep&&e.t>24000)e.gone=1}
function collect(e){const s=G.s,h=G.hero,st=G.st;const [k,id]=String(e.what).split(':');
 if(k==='gold'){s.gold+=e.n;sfx('coin');floatTxt(h.x,h.y,30,'+'+e.n+' 금화','#ffd84a')}
 else if(k==='silver'){const before=s.silver;s.silver=Math.min(st.smax,s.silver+e.n);sfx('silver');floatTxt(h.x,h.y,30,s.silver>before?'+'+(s.silver-before)+' 은':'은 가득','#d8e4ff')}
 else if(k==='item'){s.inv[id]=(s.inv[id]||0)+(e.n||1);sfx('item');const n=ITEM[id]?ITEM[id].n:id;G.toasts.push({t:n+(e.n>1?' ×'+e.n:'')+' 을(를) 얻었다',at:G.time,c:'#fff0c0'});if(id==='chicken'){s.inv.chicken--;s.hp=st.hp;floatTxt(h.x,h.y,34,'통닭! 체력 회복','#ffb070',1)}}
 else if(k==='card'){if(!s.cards.includes(id))s.cards.push(id);sfx('card');G.st=stats();G.toasts.push({t:'타로 카드 「'+TAROT[id].n+'」 '+TAROT[id].d,at:G.time,c:'#e8c8ff'});if(!s.flags.sq_tarot)s.flags.sq_tarot=1}
 if(e.gid){s.got[e.gid]=1}}
/* ---------- 효과 ---------- */
function addFx(k,x,y,z,o={}){if(G.fx.length>260)G.fx.shift();G.fx.push({k,x,y,z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,t:0,life:o.life||400,c:o.c||'#fff',r0:o.r0||0,r1:o.r1||0})}
function floatTxt(x,y,z,t,c,big){G.txt.push({x,y,z,txt:t,c,big:!!big,t:0});if(G.txt.length>24)G.txt.shift()}
function addDecal(x,y,k){G.dec.push({x,y,k,t:G.time,v:Math.floor(rnd()*3)});if(G.dec.length>34)G.dec.shift()}
function fxUpdate(dt){const ms=dt*1000;for(const f of G.fx){f.t+=ms;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.k==='ash'||f.k==='smoke'||f.k==='spark'&&f.vz>0&&f.c==='#fff4c0'){f.z+=f.vz*dt;f.vz*=.98}else if(f.k!=='ring'&&f.k!=='cross'&&f.k!=='after'&&f.k!=='hitmark'){f.vz-=150*dt;f.z+=f.vz*dt;if(f.z<0){f.z=0;f.vx*=.5;f.vy*=.5;f.vz=0;if(f.k==='blood'&&rnd()<.04)addDecal(f.x,f.y,'drop')}}}G.fx=G.fx.filter(f=>f.t<f.life);
 for(const t of G.txt)t.t+=ms;G.txt=G.txt.filter(t=>t.t<900)}
/* ---------- 괴물들의 머리 ---------- */
function hv(e){const h=G.hero;const dx=h.x-e.x,dy=h.y-e.y,d=Math.hypot(dx,dy)||1e-6;return{dx:dx/d,dy:dy/d,d}}
function sees(e){const v=hv(e);if(G.hero.st==='dead')return false;return v.d<e.D.ag&&(v.d<2||los(e.x,e.y,G.hero.x,G.hero.y))}
function goToward(e,dt,sp){const v=hv(e);let dir=[v.dx,v.dy];if(!e.D.fly&&v.d>1.2&&!los(e.x,e.y,G.hero.x,G.hero.y)){updateFlow();const f=flowStep(e);if(f)dir=f}setFace(e,dir[0],dir[1]);moveEnt(e,dir[0]*sp*dt,dir[1]*sp*dt,e.D.fly)}
function turnTo(e,dx,dy,rate,dt){const a0=Math.atan2(e.fy,e.fx),a1=Math.atan2(dy,dx);let da=a1-a0;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;const a=a0+clamp(da,-rate*dt,rate*dt);e.fx=Math.cos(a);e.fy=Math.sin(a)}
function wander(e,dt,sp,fly){if(!e.wt||e.t>e.wt){e.t=0;e.wt=rand(900,2600);const a=rand(0,Math.PI*2);const back=Math.hypot(e.home.x-e.x,e.home.y-e.y)>2.2;e.wd=back?[(e.home.x-e.x),(e.home.y-e.y)]:rnd()<.45?null:[Math.cos(a),Math.sin(a)];if(e.wd){const n=Math.hypot(e.wd[0],e.wd[1])||1;e.wd=[e.wd[0]/n,e.wd[1]/n]}}
 if(e.wd){setFace(e,e.wd[0],e.wd[1]);moveEnt(e,e.wd[0]*sp*dt,e.wd[1]*sp*dt,fly)}}
function meleeHero(e,reach,arc,dmg,o){const v=hv(e);if(v.d-G.hero.r>reach)return false;const dt2=v.dx*e.fx+v.dy*e.fy;if(Math.acos(clamp(dt2,-1,1))>arc&&v.d>.5)return false;return hurtHero(dmg,e,o)}
function spawnNear(type,x,y,o={}){const m=G.m;for(let k=0;k<12;k++){const a=rand(0,Math.PI*2),r=rand(.6,1.8);const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(!blocks(m,Math.floor(nx),Math.floor(ny),ENEMY[type].fly)){const e=mkMob(type,nx,ny,o);e.st=o.st||'chase';e.arenaIn=1;G.ents.push(e);addFx('smoke',nx,ny,6,{life:500});return e}}return null}
function mistTo(e,ang,dist){const h=G.hero,m=G.m;for(let k=0;k<8;k++){const a=ang+k*.7*(k%2?1:-1);const nx=h.x+Math.cos(a)*dist,ny=h.y+Math.sin(a)*dist;if(!blocks(m,Math.floor(nx),Math.floor(ny),e.D.fly)&&(!G.arena||(nx>G.arena.x0+.5&&nx<G.arena.x1-.5&&ny>G.arena.y0+.5&&ny<G.arena.y1-.5))){for(let i=0;i<10;i++)addFx('smoke',e.x+rand(-.3,.3),e.y+rand(-.3,.3),rand(0,20),{life:500});e.x=nx;e.y=ny;return true}}return false}
const AI={
 wolf(e,dt){const v=hv(e),D=e.D,sp=D.spd*(e.enr||1);
  switch(e.st){
   case 'idle':wander(e,dt,.9);if(sees(e)){e.st='chase';if(rnd()<.3)sfx('howl2')}break;
   case 'chase':if(v.d>2.7)goToward(e,dt,sp);else{e.st='circle';e.t=0;e.dur=rand(600,1500);e.orb=rnd()<.5?1:-1}if(v.d>D.ag*2)e.st='idle';break;
   case 'circle':{const radial=v.d-2.2,mx=-v.dy*e.orb+v.dx*radial*1.2,my=v.dx*e.orb+v.dy*radial*1.2,n=Math.hypot(mx,my)||1;moveEnt(e,mx/n*sp*.75*dt,my/n*sp*.75*dt);setFace(e,v.dx,v.dy);
    if(v.d>3.8)e.st='chase';else if(e.t>e.dur&&G.time>e.cd){e.st='wind';e.t=0;sfx('growl')}break}
   case 'wind':setFace(e,v.dx,v.dy);if(e.t>360/(e.enr||1)){e.st='lunge';e.t=0;e.ldx=v.dx;e.ldy=v.dy;e.hit1=0;sfx('bark')}break;
   case 'lunge':moveEnt(e,e.ldx*8.4*dt,e.ldy*8.4*dt);if(!e.hit1&&hv(e).d<e.r+G.hero.r+.15){e.hit1=1;hurtHero(D.atk,e)}if(e.t>270){e.st='rec';e.t=0;e.cd=G.time+rand(600,1400)}break;
   case 'rec':if(e.t>420)e.st='chase';break;default:e.st='chase'}},
 bat(e,dt){const v=hv(e),D=e.D;if(e.st!=='dive')e.z=10+Math.sin(e.anim/170)*3;
  switch(e.st){
   case 'idle':e.z=15;wander(e,dt,.7,true);if(sees(e)){e.st='fly';e.t=0;e.dur=rand(800,1700)}break;
   case 'fly':{e.ang=(e.ang==null?rand(0,6.3):e.ang)+dt*1.9*e.orb;const tx=G.hero.x+Math.cos(e.ang)*2.4,ty=G.hero.y+Math.sin(e.ang)*2.4,dx=tx-e.x,dy=ty-e.y,n=Math.hypot(dx,dy)||1;moveEnt(e,dx/n*D.spd*dt,dy/n*D.spd*dt,true);setFace(e,v.dx,v.dy);
    if(e.t>e.dur&&v.d<3.6){e.st='squeak';e.t=0;sfx('squeak')}if(v.d>D.ag*2)e.st='idle';break}
   case 'squeak':if(e.t>230){e.st='dive';e.t=0;e.ldx=v.dx;e.ldy=v.dy;e.hit1=0}break;
   case 'dive':e.z=Math.max(5,e.z-40*dt);moveEnt(e,e.ldx*7*dt,e.ldy*7*dt,true);if(!e.hit1&&hv(e).d<e.r+G.hero.r+.12){e.hit1=1;hurtHero(D.atk,e,{drain:1,kb:1})}if(e.t>380){e.st='fly';e.t=0;e.dur=rand(1000,2000)}break;
   default:e.st='fly'}},
 crow(e,dt){const v=hv(e),D=e.D;
  if(e.st==='idle'){e.z=0;if(v.d<3.2&&G.hero.st!=='dead'){e.st='fly';e.t=0;e.dives=0;sfx('caw')}return}
  e.z=Math.min(16,e.z+40*dt);
  if(e.st==='fly'){e.ang=(e.ang==null?rand(0,6.3):e.ang)+dt*2.2*e.orb;const tx=G.hero.x+Math.cos(e.ang)*2,ty=G.hero.y+Math.sin(e.ang)*2,dx=tx-e.x,dy=ty-e.y,n=Math.hypot(dx,dy)||1;moveEnt(e,dx/n*D.spd*dt,dy/n*D.spd*dt,true);setFace(e,v.dx,v.dy);if(e.t>900){e.st='dive';e.t=0;e.ldx=v.dx;e.ldy=v.dy;e.hit1=0;sfx('caw')}}
  else if(e.st==='dive'){moveEnt(e,e.ldx*6.5*dt,e.ldy*6.5*dt,true);if(!e.hit1&&hv(e).d<e.r+G.hero.r+.1){e.hit1=1;hurtHero(D.atk,e,{kb:.6})}if(e.t>360){e.dives++;e.st=e.dives>=2?'flee':'fly';e.t=0}}
  else if(e.st==='flee'){e.z+=20*dt;moveEnt(e,-v.dx*4*dt,-v.dy*4*dt,true);e.alpha=Math.max(0,1-e.t/1400);if(e.t>1400)e.gone=1}
  else e.st='fly'},
 ghoul(e,dt){const v=hv(e),D=e.D;
  switch(e.st){
   case 'buried':e.alpha=0;if(v.d<3.4&&G.hero.st!=='dead'){e.st='emerge';e.t=0;sfx('dirt')}break;
   case 'emerge':e.alpha=Math.min(1,e.t/700);if(rnd()<.5)addFx('debris',e.x+rand(-.3,.3),e.y+rand(-.3,.3),2,{vz:rand(20,40),vx:rand(-1,1),vy:rand(-1,1),life:500,c:'#3a2c20'});if(e.t>900){e.st='chase';sfx('growl2')}break;
   case 'idle':wander(e,dt,.5);if(sees(e))e.st='chase';break;
   case 'chase':if(v.d>1.05)goToward(e,dt,D.spd);else if(G.time>e.cd){e.st='wind';e.t=0;e.two=0}else setFace(e,v.dx,v.dy);if(v.d>D.ag*2)e.st='idle';break;
   case 'wind':setFace(e,v.dx,v.dy);if(e.t>400){e.st='claw';e.t=0;sfx('claw');addFx('claw',e.x+e.fx*.6,e.y+e.fy*.6,12,{life:200});meleeHero(e,1.05,1.1,D.atk)}break;
   case 'claw':if(e.t>200){if(!e.two&&hv(e).d<1.3){e.two=1;e.st='wind';e.t=210}else{e.st='rec';e.t=0;e.cd=G.time+rand(500,900)}}break;
   case 'rec':if(e.t>520)e.st='chase';break;default:e.st='chase'}},
 skel(e,dt){const v=hv(e),D=e.D;
  switch(e.st){
   case 'idle':wander(e,dt,.5);if(sees(e)){e.st='chase';e.cd=G.time+rand(500,1200)}break;
   case 'chase':{setFace(e,v.dx,v.dy);let mx=0,my=0;const see=los(e.x,e.y,G.hero.x,G.hero.y);
    if(v.d>4.2||!see){updateFlow();const f=see?[v.dx,v.dy]:(flowStep(e)||[v.dx,v.dy]);mx=f[0];my=f[1]}else if(v.d<2.1){mx=-v.dx;my=-v.dy}else{mx=-v.dy*e.orb*.6;my=v.dx*e.orb*.6}
    moveEnt(e,mx*D.spd*dt,my*D.spd*dt);if(v.d<1&&G.time>e.cd){e.st='swing';e.t=0;e.hit1=0}else if(G.time>e.cd&&v.d<6.5&&see){e.st='wind';e.t=0}if(v.d>D.ag*2)e.st='idle';break}
   case 'wind':setFace(e,v.dx,v.dy);if(e.t>380){e.st='throw';e.t=0;const h=G.hero;const tx=h.x+(h.st==='move'?h.fx*.5:0)-e.x,ty=h.y+(h.st==='move'?h.fy*.5:0)-e.y,n=Math.hypot(tx,ty)||1;
    G.shots.push({type:'bone',from:'mob',x:e.x,y:e.y,z:16,vx:tx/n*5.2,vy:ty/n*5.2,r:.22,dmg:D.atk,life:Math.min(1500,n/5.2*1000+300),t:0,src:e});sfx('throwb')}break;
   case 'throw':if(e.t>300){e.st='chase';e.cd=G.time+rand(1500,2600)}break;
   case 'swing':setFace(e,v.dx,v.dy);if(e.t>320&&!e.hit1){e.hit1=1;sfx('claw');meleeHero(e,1,1.2,D.atk)}if(e.t>620){e.st='chase';e.cd=G.time+rand(900,1500)}break;default:e.st='chase'}},
 vamp(e,dt){const v=hv(e),D=e.D;
  if(e.ghost){e.alpha=.2;if(e.t>e.ghostT){e.ghost=0;e.alpha=1;e.st='wind';e.t=140;sfx('appear')}return}
  const h=G.hero;if(h.st==='atk'&&h.sw&&e.lastSw!==h.sw&&v.d<1.9&&G.time>(e.mistCd||0)&&e.st!=='down'){e.lastSw=h.sw;if(rnd()<.32){e.ghost=1;e.t=0;e.ghostT=440;e.mistCd=G.time+3200;sfx('mist');mistTo(e,Math.atan2(e.y-h.y,e.x-h.x)+rand(1.2,2),1.6);return}}
  switch(e.st){
   case 'idle':wander(e,dt,.6);if(sees(e)){e.st='chase';sfx('hiss')}break;
   case 'chase':if(v.d>1.15){if(v.d>2.6&&v.d<4.4&&G.time>e.cd&&los(e.x,e.y,h.x,h.y)){e.st='leapW';e.t=0}else goToward(e,dt,D.spd)}else if(G.time>e.cd){e.st='wind';e.t=0;e.n=0}else setFace(e,v.dx,v.dy);if(v.d>D.ag*2)e.st='idle';break;
   case 'wind':setFace(e,v.dx,v.dy);if(e.t>300){e.st='claw';e.t=0;sfx('claw');addFx('claw',e.x+e.fx*.6,e.y+e.fy*.6,14,{life:200});meleeHero(e,1.1,1.1,D.atk)}break;
   case 'claw':if(e.t>170){e.n=(e.n||0)+1;if(e.n<2&&hv(e).d<1.4){e.st='wind';e.t=180}else{e.st='rec';e.t=0;e.cd=G.time+rand(500,1000)}}break;
   case 'leapW':setFace(e,v.dx,v.dy);if(e.t>380){e.st='leap';e.t=0;e.ldx=v.dx;e.ldy=v.dy;e.hit1=0;sfx('hiss')}break;
   case 'leap':moveEnt(e,e.ldx*7.5*dt,e.ldy*7.5*dt);e.z=Math.sin(Math.min(1,e.t/300)*Math.PI)*10;if(!e.hit1&&hv(e).d<e.r+h.r+.2){e.hit1=1;hurtHero(D.atk,e)}if(e.t>300){e.z=0;e.st='rec';e.t=0;e.cd=G.time+rand(700,1200)}break;
   case 'rec':if(e.t>450)e.st='chase';break;default:e.st='chase'}},
 rat(e,dt){const v=hv(e),D=e.D;if(e.st==='idle'){wander(e,dt,1.1);if(sees(e))e.st='chase';return}
  const zig=Math.sin(e.anim/110)*.7,dx=v.dx-v.dy*zig,dy=v.dy+v.dx*zig,n=Math.hypot(dx,dy)||1;
  if(v.d>.5){if(!los(e.x,e.y,G.hero.x,G.hero.y))goToward(e,dt,D.spd);else{setFace(e,dx,dy);moveEnt(e,dx/n*D.spd*dt,dy/n*D.spd*dt)}}
  if(v.d<e.r+G.hero.r+.14&&G.time>e.cd){hurtHero(D.atk,e,{kb:.6});e.cd=G.time+800;sfx('squeak',{p:1.5})}if(v.d>D.ag*2)e.st='idle'},
 alpha(e,dt){const v=hv(e),D=e.D,f=e.hp/e.mhp;if(e.st==='wait'){setFace(e,v.dx,v.dy);return}
  e.enr=f<.33?1.25:1;if(!e.h1&&f<.66&&!['pounce','pounceW'].includes(e.st)){e.h1=1;e.st='howl';e.t=0;e.did=0}else if(!e.h2&&f<.33&&!['pounce','pounceW'].includes(e.st)){e.h2=1;e.st='howl';e.t=0;e.did=0}
  switch(e.st){
   case 'idle':case 'chase':{if(v.d>3.2)goToward(e,dt,D.spd*e.enr);else{const mx=-v.dy*e.orb+v.dx*(v.d-2.6),my=v.dx*e.orb+v.dy*(v.d-2.6),n=Math.hypot(mx,my)||1;moveEnt(e,mx/n*D.spd*.6*dt,my/n*D.spd*.6*dt);setFace(e,v.dx,v.dy)}
    if(G.time>e.cd){if(v.d<1.9){e.st='swipeW';e.t=0;sfx('growl')}else if(v.d<6){e.st='pounceW';e.t=0;e.tx=G.hero.x;e.ty=G.hero.y;G.hz.push({type:'mark',x:e.tx,y:e.ty,r:1.15,t:0,delay:650/e.enr,vis:1,c:'#ff3040'});sfx('growl')}}break}
   case 'swipeW':setFace(e,v.dx,v.dy);if(e.t>380/e.enr){e.st='swipe';e.t=0;sfx('claw');addFx('slashM',e.x+e.fx*.8,e.y+e.fy*.8,14,{life:240,r1:Math.atan2(e.fy,e.fx)});meleeHero(e,1.75,1.4,D.atk,{kb:2.6})}break;
   case 'swipe':if(e.t>300){e.st='chase';e.cd=G.time+rand(700,1300)/e.enr}break;
   case 'pounceW':setFace(e,e.tx-e.x,e.ty-e.y);if(e.t>650/e.enr){e.st='pounce';e.t=0;e.sx=e.x;e.sy=e.y;sfx('bark')}break;
   case 'pounce':{const p=Math.min(1,e.t/450);e.x=lerp(e.sx,e.tx,p);e.y=lerp(e.sy,e.ty,p);resolve(e);e.z=Math.sin(p*Math.PI)*26;
    if(p>=1){e.z=0;e.st='rec';e.t=0;G.cam.sh=Math.max(G.cam.sh,3.5);sfx('land');addFx('ring',e.x,e.y,2,{c:'#c8b8a0',life:400,r0:4,r1:34});for(let i=0;i<10;i++)addFx('dust',e.x+rand(-.6,.6),e.y+rand(-.6,.6),2,{life:500});if(Math.hypot(G.hero.x-e.x,G.hero.y-e.y)<1.3)hurtHero(D.atk*1.2,e,{kb:3})}break}
   case 'rec':if(e.t>560){e.st='chase';e.cd=G.time+rand(500,1000)/e.enr}break;
   case 'howl':setFace(e,v.dx,v.dy);if(e.t>200&&!e.did){e.did=1;sfx('howl');G.cam.sh=Math.max(G.cam.sh,2)}if(e.t>700&&e.did===1){e.did=2;const A=G.arena||{x0:e.x-3,x1:e.x+3,y0:e.y-3,y1:e.y+3};spawnNear('wolf',A.x0+1,A.y0+1);spawnNear('wolf',A.x1-1,A.y1-1)}if(e.t>1300){e.st='chase';e.cd=G.time+600}break;
   default:e.st='chase'}},
 knight(e,dt){const v=hv(e),D=e.D,f=e.hp/e.mhp;if(e.guard===undefined)e.guard=1;if(e.st==='wait'){setFace(e,v.dx,v.dy);return}
  if(!e.summ&&f<.5&&['chase','idle'].includes(e.st)){e.summ=1;e.st='summon';e.t=0;e.did=0}
  switch(e.st){
   case 'idle':case 'chase':turnTo(e,v.dx,v.dy,2.2,dt);if(v.d>1.6){const f2=los(e.x,e.y,G.hero.x,G.hero.y)?[e.fx,e.fy]:(updateFlow(),flowStep(e)||[e.fx,e.fy]);moveEnt(e,f2[0]*D.spd*dt,f2[1]*D.spd*dt)}
    if(G.time>e.cd){if(v.d<2.1){e.st='sweepW';e.t=0;sfx('clank');G.hz.push({type:'arc',x:e.x,y:e.y,r:1.95,a:Math.atan2(e.fy,e.fx),w:1.5,t:0,delay:560,vis:1,c:'#ff3040'})}else if(v.d<6){e.st='slamW';e.t=0}}break;
   case 'sweepW':if(e.t>560){e.st='sweep';e.t=0;sfx('heavy');addFx('slashM',e.x+e.fx*.9,e.y+e.fy*.9,16,{life:260,r1:Math.atan2(e.fy,e.fx),big:1});meleeHero(e,1.95,1.5,D.atk,{kb:3})}break;
   case 'sweep':if(e.t>420){e.st='chase';e.cd=G.time+rand(900,1500)}break;
   case 'slamW':if(e.t<420)turnTo(e,v.dx,v.dy,3,dt);if(e.t>780){e.st='slam';e.t=0;sfx('slam');G.cam.sh=Math.max(G.cam.sh,3);G.shots.push({type:'wave',from:'mob',x:e.x+e.fx*.6,y:e.y+e.fy*.6,vx:e.fx*6,vy:e.fy*6,r:.45,dmg:D.atk*.9,life:950,t:0,src:e,pierce:1})}break;
   case 'slam':if(e.t>520){e.st='chase';e.cd=G.time+rand(1000,1600)}break;
   case 'summon':if(e.t>450&&!e.did){e.did=1;sfx('summon');const a=spawnNear('skel',e.x-1,e.y+1,{st:'rise'}),b=spawnNear('skel',e.x+1,e.y-1,{st:'rise'});for(const s of [a,b])if(s){s.st='rise';s.t=0}}if(e.t>1100)e.st='chase';break;
   default:e.st='chase'}},
 guest(e,dt){const v=hv(e),D=e.D,f=e.hp/e.mhp;if(e.st==='wait'){setFace(e,v.dx,v.dy);return}
  if(e.ghost){e.alpha=.15;if(e.t>e.ghostT){e.ghost=0;e.alpha=1;e.st='wind';e.t=60;e.n=0;sfx('appear')}return}
  if(!e.b1&&f<.6&&e.st==='chase'){e.b1=1;e.st='summon';e.t=0;e.did=0}else if(!e.b2&&f<.3&&e.st==='chase'){e.b2=1;e.st='summon';e.t=0;e.did=0}
  switch(e.st){
   case 'idle':case 'chase':if(v.d>1.25)goToward(e,dt,D.spd*.8);else setFace(e,v.dx,v.dy);
    if(G.time>e.cd){const r=rnd();if(v.d<1.5){e.st='wind';e.t=0;e.n=0}else if(r<.4){e.ghost=1;e.t=0;e.ghostT=380;sfx('mist');mistTo(e,Math.atan2(G.hero.fy,G.hero.fx)+Math.PI+rand(-.6,.6),1.1)}else if(r<.75&&v.d>2.2){e.st='boltW';e.t=0;sfx('hiss')}else e.cd=G.time+400}break;
   case 'wind':setFace(e,v.dx,v.dy);if(e.t>240){e.st='claw';e.t=0;sfx('claw');addFx('claw',e.x+e.fx*.6,e.y+e.fy*.6,14,{life:200});meleeHero(e,1.15,1.15,D.atk)}break;
   case 'claw':if(e.t>150){e.n=(e.n||0)+1;if(e.n<3&&hv(e).d<1.6){e.st='wind';e.t=130}else{e.st='rec';e.t=0;e.cd=G.time+rand(600,1100)}}break;
   case 'boltW':setFace(e,v.dx,v.dy);if(e.t>520){e.st='rec';e.t=0;e.cd=G.time+rand(800,1300);for(const a of [-.3,0,.3]){const c=Math.cos(a),s2=Math.sin(a),dx=v.dx*c-v.dy*s2,dy=v.dx*s2+v.dy*c;G.shots.push({type:'blood',from:'mob',x:e.x,y:e.y,z:14,vx:dx*5.5,vy:dy*5.5,r:.2,dmg:D.atk*.8,life:1500,t:0,src:e})}sfx('blood')}break;
   case 'summon':if(e.t>350&&!e.did){e.did=1;sfx('bats');for(let i=0;i<3;i++)spawnNear('bat',e.x,e.y)}if(e.t>900)e.st='chase';break;
   case 'rec':if(e.t>420)e.st='chase';break;default:e.st='chase'}},
 lucia(e,dt){const v=hv(e),D=e.D,f=e.hp/e.mhp;e.z=6+Math.sin(e.anim/420)*3;if(e.st==='wait'||e.st==='down'){setFace(e,v.dx,v.dy);return}
  if(!e.bit&&f<.3){e.bit=1;e.st='rec';e.t=0;runScript(EV.luciaBite(G.s));return}
  const sp=e.bit?1.3:1;
  if(e.ghost){e.alpha=.12;if(e.t>e.ghostT){e.ghost=0;e.alpha=1;e.st='kissW';e.t=120;sfx('appear')}return}
  switch(e.st){
   case 'idle':case 'chase':{e.ang=(e.ang==null?rand(0,6.3):e.ang)+dt*.7*e.orb;const tx=G.hero.x+Math.cos(e.ang)*2.6,ty=G.hero.y+Math.sin(e.ang)*2.6,dx=tx-e.x,dy=ty-e.y,n=Math.hypot(dx,dy)||1;moveEnt(e,dx/n*D.spd*sp*dt,dy/n*D.spd*sp*dt,true);setFace(e,v.dx,v.dy);
    if(G.time>e.cd){const bats=G.ents.filter(b=>b.kind==='mob'&&b.type==='bat'&&!b.dead).length;const L=['kiss','kiss','scream','mist'];if(bats<4)L.push('bats');if(f<.6)L.push('roses','roses','rain');const pk=pick(L);
     if(pk==='kiss'){e.st='kissW';e.t=0}else if(pk==='scream'){e.st='screamW';e.t=0;sfx('inhale')}else if(pk==='mist'){e.ghost=1;e.t=0;e.ghostT=420;sfx('mist');mistTo(e,Math.atan2(G.hero.fy,G.hero.fx)+Math.PI,1.8)}
     else if(pk==='bats'){e.st='bats';e.t=0;e.did=0}else if(pk==='roses'){e.st='roses';e.t=0;e.did=0}else{e.st='rain';e.t=0;e.did=0}}break}
   case 'kissW':setFace(e,v.dx,v.dy);moveEnt(e,-v.dx*.8*dt,-v.dy*.8*dt,true);if(e.t>520/sp){e.st='kiss';e.t=0;e.ldx=v.dx;e.ldy=v.dy;e.hit1=0;sfx('kiss')}break;
   case 'kiss':moveEnt(e,e.ldx*7.2*dt,e.ldy*7.2*dt,true);if(!e.hit1&&hv(e).d<e.r+G.hero.r+.15){e.hit1=1;hurtHero(D.atk,e,{drain:1,kb:2.4})}if(e.t>380){if(e.bit&&!e.k2){e.k2=1;e.st='kissW';e.t=260}else{e.k2=0;e.st='rec';e.t=0}}break;
   case 'screamW':setFace(e,v.dx,v.dy);if(e.t>650/sp){e.st='scream';e.t=0;sfx('scream');G.cam.sh=Math.max(G.cam.sh,3);G.hz.push({type:'ring',x:e.x,y:e.y,r:.4,v:4.3,max:6.5,dmg:D.atk*.8,t:0,src:e,c:'#f0e8ff'})}break;
   case 'scream':if(e.t>500){e.st='rec';e.t=0}break;
   case 'bats':if(e.t>300&&!e.did){e.did=1;sfx('bats');for(let i=0;i<3;i++)spawnNear('bat',e.x,e.y)}if(e.t>800){e.st='rec';e.t=0}break;
   case 'roses':if((e.t>300&&e.did===0)||(e.t>750&&e.did===1)){const off=e.did*.26;e.did++;sfx('rose');for(let i=0;i<12;i++){const a=i/12*Math.PI*2+off;G.shots.push({type:'rose',from:'mob',x:e.x,y:e.y,z:10,vx:Math.cos(a)*2.7*sp,vy:Math.sin(a)*2.7*sp,r:.2,dmg:D.atk*.65,life:2600,t:0,src:e})}}if(e.t>1100){e.st='rec';e.t=0}break;
   case 'rain':if(e.t>200&&!e.did){e.did=1;sfx('inhale');for(let i=0;i<4;i++){const a=rand(0,6.3),r=i===0?0:rand(.8,2.4);G.hz.push({type:'mark',x:G.hero.x+Math.cos(a)*r,y:G.hero.y+Math.sin(a)*r,r:.8,t:0,delay:900,dmg:D.atk*.9,c:'#c01030',src:e,rain:1})}}if(e.t>1200){e.st='rec';e.t=0}break;
   case 'rec':if(e.t>480){e.st='chase';e.cd=G.time+rand(500,1100)/sp}break;default:e.st='chase'}}};
function mobUpdate(e,dt){const ms=dt*1000,D=e.D;e.t+=ms;e.anim+=ms;
 if(Math.abs(e.kbx)+Math.abs(e.kby)>.02){moveEnt(e,e.kbx*dt,e.kby*dt,D.fly);const f=Math.exp(-dt*8);e.kbx*=f;e.kby*=f}
 if(G.hero.st==='dead'&&!['buried','bones','down'].includes(e.st)){if(e.st!=='idle'&&e.st!=='wait'){e.st='idle';e.t=0}wander(e,dt,.4,D.fly);return}
 if(e.st==='down'){if(D.ai==='lucia')return;e.z=0;if(G.time-e.downAt>3300){e.st='chase';e.hp=Math.round(e.mhp*.4);sfx('scream');floatTxt(e.x,e.y,30,'다시 일어났다!','#ff8090')}return}
 if(e.st==='bones'){if(e.t>4200){e.st='rise';e.t=0;e.hp=Math.round(e.mhp*.6);e.collapsed=0;sfx('bones')}return}
 if(e.st==='rise'){e.alpha=Math.min(1,e.t/500);if(e.t>600){e.st='chase';e.alpha=1}return}
 if(e.st==='hurt'){if(e.t>230)e.st='chase';return}
 if(e.st==='stagger'){if(e.t>(D.ai==='knight'?1300:600)){e.st='chase';if(D.ai==='knight')e.guard=1}return}
 const f=AI[D.ai];if(f)f(e,dt)}
/* 서로 겹치지 않게 */
function separate(){const L=G.ents.filter(e=>(e.kind==='mob'&&!e.dead&&e.st!=='buried'&&!e.ghost)||e.kind==='npc');const h=G.hero;
 for(let i=0;i<L.length;i++){const a=L[i];if(a.kind==='npc')continue;for(let j=i+1;j<L.length;j++){const b=L[j];if(!!a.D.fly!==!!(b.D&&b.D.fly)&&b.kind==='mob')continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),mn=a.r+b.r;if(d>0&&d<mn){const p=(mn-d)/2;if(b.kind==='npc'){a.x-=dx/d*p*2;a.y-=dy/d*p*2;resolve(a)}else{a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p;resolve(a);resolve(b)}}}
  if(a.D.fly||h.st==='dead')continue;const dx=a.x-h.x,dy=a.y-h.y,d=Math.hypot(dx,dy),mn=a.r+h.r;if(d>0&&d<mn){a.x+=dx/d*(mn-d);a.y+=dy/d*(mn-d);resolve(a)}}
 for(const n of L){if(n.kind!=='npc')continue;const dx=h.x-n.x,dy=h.y-n.y,d=Math.hypot(dx,dy),mn=n.r+h.r;if(d>0&&d<mn){h.x+=dx/d*(mn-d);h.y+=dy/d*(mn-d);resolve(h)}}}
/* 동네 사람 움직임 */
function npcUpdate(n,dt){const ms=dt*1000;n.t+=ms;const h=G.hero;const dx=h.x-n.x,dy=h.y-n.y,d=Math.hypot(dx,dy);
 if(n.leaving){n.alpha=Math.max(0,1-(G.time-n.leaving)/700);if(n.alpha<=0)n.gone=1;return}
 if(n.sleep){if(rnd()<.01)addFx('zz',n.x,n.y,18,{life:1400});return}
 if(d<2.2&&!G.sc){if(d<1.8)setFace(n,dx,dy);n.mv=null;return}
 if(n.wander){if(!n.mv&&n.t>2500){n.t=0;const a=rand(0,6.3);const tx=n.home.x+Math.cos(a)*1.4,ty=n.home.y+Math.sin(a)*1.4;n.mv=[tx,ty]}
  if(n.mv){const ddx=n.mv[0]-n.x,ddy=n.mv[1]-n.y,dd=Math.hypot(ddx,ddy);if(dd<.08||n.t>1800){n.mv=null;n.t=0}else{setFace(n,ddx,ddy);moveEnt(n,ddx/dd*1.1*dt,ddy/dd*1.1*dt);n.walking=1;return}}}n.walking=0}
/* ---------- 날아가는 것들 ---------- */
function shotUpdate(p,dt){const ms=dt*1000;p.life-=ms;p.t=(p.t||0)+ms;const m=G.m;
 if(p.type==='holy'){const k=Math.min(1,p.t/(p.dur*1000));p.x=lerp(p.sx,p.tx,k);p.y=lerp(p.sy,p.ty,k);p.z=12+Math.sin(k*Math.PI)*22-k*10;if(k>=1){p.gone=1;holyFire(p.x,p.y,p.dmg)}return}
 if(p.type==='cross'){if(!p.back&&p.t>430)p.back=true;if(p.back){const h=G.hero,dx=h.x-p.x,dy=h.y-p.y,d=Math.hypot(dx,dy)||1;p.vx=dx/d*9.5;p.vy=dy/d*9.5;if(d<.45){p.gone=1;return}}}
 p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='bone')p.z=16+Math.sin(Math.min(1,p.t/((p.life+p.t)||1))*Math.PI)*14;
 const tx=Math.floor(p.x),ty=Math.floor(p.y);if(p.type!=='cross'&&(!inMap(m,tx,ty)||(m.solid[ty*m.w+tx]===1&&!m.low[ty*m.w+tx]))){p.gone=1;addFx('spark',p.x,p.y,p.z||8,{life:200,c:'#fff'});if(p.type==='bolt')sfx('tick');return}
 if(p.from==='hero'){const set=p.back?p.hit2:p.hit;for(const e of targets()){if(set.has(e))continue;if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+p.r){set.add(e);const n=Math.hypot(p.vx,p.vy)||1;hitTarget(e,p.dmg,{holy:p.type==='cross',dirx:p.vx/n,diry:p.vy/n,kb:.9,shot:1});if(p.type==='bolt'&&!p.pierce){p.gone=1;break}}}}
 else{const h=G.hero;if(h.st!=='dead'&&Math.hypot(h.x-p.x,h.y-p.y)<h.r+p.r&&!(p.hitH)){const ok=hurtHero(p.dmg,p.src&&!p.src.dead?p.src:p,{kb:1.2});if(ok||p.type!=='wave'){if(p.type!=='wave')p.gone=1;else p.hitH=1}}}
 if(p.type==='wave'&&rnd()<.6)addFx('dust',p.x,p.y,1,{life:350});
 if(p.life<=0)p.gone=1}
function holyFire(x,y,dmg){const up=G.s.skills.holyUp;G.hz.push({type:'fire',x,y,r:up?1.25:.9,t:0,life:up?2700:1750,dmg,tick:0});sfx('glass');for(let i=0;i<10;i++)addFx('spark',x,y,4,{vx:rand(-2,2),vy:rand(-2,2),vz:rand(20,50),life:500,c:'#c8e8ff'});lightBraziers(x,y,up?1.5:1.2)}
function lightBraziers(x,y,r){const s=G.s;let n=0;for(const e of G.ents){if(e.kind!=='brazier'||e.lit)continue;if(Math.hypot(e.x-x,e.y-y)<=r+.45){e.lit=1;s.flags['bz_'+G.m.id+'_'+e.tx+'_'+e.ty]=1;n++;sfx('ignite');for(let i=0;i<10;i++)addFx('spark',e.x,e.y,14,{vz:rand(20,40),vx:rand(-.5,.5),vy:rand(-.5,.5),life:600,c:'#ffd27a'})}}
 if(n&&G.m.id==='crypt1'){const all=G.ents.filter(e=>e.kind==='brazier');const lit=all.filter(e=>e.lit).length;floatTxt(G.hero.x,G.hero.y,34,'불꽃 '+lit+'/'+all.length,'#ffd27a');if(lit===all.length&&!s.flags.braziers){s.flags.braziers=1;openGates('braziers');runScript([['shake',2],['sfx','gate'],['toast','어딘가에서 무거운 철문이 열리는 소리가 났다...',3000],['quest']])}}}
function openGates(flag){for(const e of G.ents)if(e.kind==='gate'&&e.flag===flag&&!e.gone){e.gone=1;addFx('smoke',e.x,e.y,10,{life:600})}markSolids()}
function hzUpdate(z,dt){const ms=dt*1000;z.t+=ms;const h=G.hero;
 if(z.type==='fire'){if(z.t>=z.tick){z.tick+=250;for(const e of G.ents){if(e.kind!=='mob'||e.dead||e.st==='buried')continue;if(Math.hypot(e.x-z.x,e.y-z.y)>z.r+e.r)continue;if(e.st==='down'){if(e.D.ai!=='lucia'){floatTxt(e.x,e.y,30,'정화!','#c8e8ff');killMob(e)}continue}hurtMob(e,z.dmg,{holy:1,ignoreInv:1})}
   for(const e of G.ents)if(e.kind==='brk'&&!e.gone&&Math.hypot(e.x-z.x,e.y-z.y)<z.r+.3)breakObj(e)}
  if(rnd()<.7)addFx('flame',z.x+rand(-z.r,z.r)*.7,z.y+rand(-z.r,z.r)*.7,0,{vz:rand(20,40),life:rand(300,600),c:rnd()<.5?'#c8e8ff':'#7ab0ff'});if(z.t>=z.life)z.gone=1}
 else if(z.type==='ring'){z.r+=z.v*dt;const d=Math.hypot(h.x-z.x,h.y-z.y);if(!z.hit&&Math.abs(d-z.r)<.38){if(hurtHero(z.dmg,z.src,{kb:2.6}))z.hit=1}if(z.r>=z.max)z.gone=1}
 else if(z.type==='mark'){if(z.t>=z.delay&&!z.done){z.done=1;if(!z.vis){if(Math.hypot(h.x-z.x,h.y-z.y)<z.r+h.r*.4)hurtHero(z.dmg,z.src,{kb:1});if(z.rain){sfx('splash');for(let i=0;i<8;i++)addFx('blood',z.x,z.y,30,{vx:rand(-1.5,1.5),vy:rand(-1.5,1.5),vz:rand(-20,10),life:500,c:'#c01030'})}}}if(z.t>z.delay+250)z.gone=1}
 else if(z.type==='arc'){if(z.t>z.delay)z.gone=1}}
/* ---------- 대본 돌리기 ---------- */
function runScript(steps){if(!steps||!steps.length)return;if(G.sc)G.sc.steps.splice(G.sc.i,0,...steps);else G.sc={steps:steps.slice(),i:0,wait:0};G.kq.length=0;const h=G.hero;if(h&&h.st==='charge'){h.st='idle'}}
function busyUI(){return!!(G.dlg||G.ask||G.shop||G.card||G.tele||G.fade.v)}
function scriptTick(ms){let guard=0;while(G.sc&&guard++<60){const S=G.sc;if(S.wait>0){S.wait-=ms;ms=0;if(S.wait>0)return;S.wait=0}if(busyUI())return;const st=S.steps[S.i++];if(!st){if(G.sc===S)G.sc=null;break}try{execStep(st)}catch(err){w.console&&w.console.error&&w.console.error('vh script',st[0],err)}}}
function who(k){return{name:k?NAME[k]||k:'',face:k?(FACE_OF[k]||k):null}}
function execStep(st){const s=G.s,k=st[1];
 switch(st[0]){
  case 'say':G.dlg={who:k,text:String(st[2]),t0:G.time,shown:0};sfx('talk');break;
  case 'ask':G.ask={who:k,text:String(st[2]),opts:st[3],sel:0,t0:G.time};break;
  case 'flag':s.flags[k]=st[2]===undefined?1:st[2];break;
  case 'give':s.inv[k]=(s.inv[k]||0)+(st[2]||1);sfx('item');G.toasts.push({t:(ITEM[k]?ITEM[k].n:k)+((st[2]||1)>1?' ×'+st[2]:'')+' 을(를) 얻었다',at:G.time,c:'#fff0c0'});break;
  case 'take':s.inv[k]=Math.max(0,(s.inv[k]||0)-(st[2]||1));if(!s.inv[k])delete s.inv[k];break;
  case 'relic':if(!s.relics.includes(k))s.relics.push(k);{const e=s.rel.indexOf('');if(e>=0&&!s.rel.includes(k))s.rel[e]=k}G.st=stats();jingle('relic');G.toasts.push({t:'장신구 「'+RELIC[k].n+'」 '+(s.rel.includes(k)?'(착용함)':''),at:G.time,c:'#ffd890'});break;
  case 'weapon':if(!s.wpns.includes(k))s.wpns.push(k);sfx('item');G.toasts.push({t:'무기 「'+WEAPON[k].n+'」 를 얻었다',at:G.time,c:'#ffd890'});break;
  case 'sub':if(!s.subs.includes(k))s.subs.push(k);s.sub=k;sfx('item');G.toasts.push({t:'보조 무기 「'+SUB[k].n+'」',at:G.time,c:'#ffd890'});break;
  case 'coat':if(!s.coats.includes(k))s.coats.push(k);break;
  case 'gold':s.gold=Math.max(0,s.gold+k);sfx('coin');G.toasts.push({t:(k>=0?'금화 +':'금화 ')+k,at:G.time,c:'#ffd84a'});break;
  case 'silver':s.silver=Math.min(G.st.smax,s.silver+k);sfx('silver');G.toasts.push({t:'은 조각 +'+k,at:G.time,c:'#d8e4ff'});break;
  case 'exp':gainExp(k);break;
  case 'tele':if(!s.tele.includes(k))s.tele.push(k);G.tele={id:k,at:G.time};sfx('tele');break;
  case 'heal':G.st=stats();s.hp=G.st.hp;s.mp=G.st.mp;sfx('heal');break;
  case 'save':writeSave('manual');G.toasts.push({t:'기록했다',at:G.time,c:'#c8f0c8'});jingle('rest');break;
  case 'shop':openShop(k);break;
  case 'wait':G.sc.wait=k;break;
  case 'fade':G.fade.v=k?1:-1;if(!k&&G.fade.a<=0)G.fade.v=0;break;
  case 'music':playMusic(k);break;
  case 'sfx':sfx(k);break;
  case 'jingle':jingle(k);break;/* A126 짧은 가락 (불길함 등) */
  case 'shake':G.cam.sh=Math.max(G.cam.sh,k||3);break;
  case 'run':if(EV[k])runScript(EV[k](s));break;
  case 'fn':{const f=typeof k==='function'?k:(FN[k]||ENGFN[k]);const r=f?f(s):null;if(Array.isArray(r)&&r.length)runScript(r);break}
  case 'if':runScript(k(s)?st[2]:(st[3]||[]));break;
  case 'quest':questChanged();break;
  case 'toast':G.toasts.push({t:k,at:G.time,dur:st[2]||2600,c:'#ffffff'});break;
  case 'arena':setArena(k);break;
  case 'boss':activateBoss(k);break;
  case 'goto':changeMap(k,st[2]+.5,st[3]+.5,st[4],true);break;
  case 'card':G.card={t:k,sub:st[2],at:G.time};sfx('card');break;
  case 'npc':npcCmd(k,st[2],st[3],st[4]);break;
  case 'spawn':{const e=mkMob(k,st[2]+.5,st[3]+.5,st[4]||{});e.st='chase';e.cd=G.time+600;G.ents.push(e);addFx('smoke',e.x,e.y,6,{life:500});break}
  case 'watch':G.watch.push({tag:k,run:st[2]});break}}
function npcCmd(id,cmd,x,y){if(cmd==='leave'){for(const n of G.ents)if(n.kind==='npc'&&n.id===id&&!n.leaving)n.leaving=G.time;return}
 if(cmd==='show'){if(G.ents.some(n=>n.kind==='npc'&&n.id===id&&!n.leaving))return;const n=mkNpc({id,x,y,face:[1,1]});G.ents.push(n);addFx('smoke',n.x,n.y,6,{life:400})}}
function questChanged(){const ms=mainStep(G.s);if(G.qLast!==ms.t){if(G.qLast)G.toasts.push({t:'전보: '+ms.t,at:G.time,c:'#ffe8a0'});G.qLast=ms.t;sfx('quest')}}
function setArena(id){const m=G.m;if(!id){if(G.arena&&G.arena.gates)for(const [x,y] of G.arena.gates){G.ents.forEach(e=>{if(e.kind==='gate'&&e.temp&&e.tx===x&&e.ty===y)e.gone=1});m.solid[I(m,x,y)]=0}G.arena=null;G.ents=G.ents.filter(e=>!e.gone);markSolids();return}
 const A=m.def.arenas&&m.def.arenas[id];if(!A)return;G.arena={...A,id};for(const [x,y] of A.gates||[]){G.ents.push(mkObj('gate',x,y,{temp:1}));addFx('smoke',x+.5,y+.5,6,{life:500})}markSolids();sfx('gate')}
function activateBoss(type){const e=G.ents.find(b=>b.kind==='mob'&&b.type===type&&!b.dead);if(!e)return;e.st='chase';e.cd=G.time+700;e.arenaIn=1;G.boss=e}
function checkWatch(){for(const wt of G.watch.slice()){if(!G.ents.some(e=>e.kind==='mob'&&!e.dead&&e.tag===wt.tag)){G.watch.splice(G.watch.indexOf(wt),1);runScript(EV[wt.run](G.s))}}}
/* ---------- 지도 사이 오가기 ---------- */
function changeMap(id,x,y,face,now){G.fade.v=1;G.fade.cb=()=>{enterMap(id,x,y,face);G.fade.v=-1};if(now&&G.fade.a>=1){G.fade.cb();G.fade.cb=null}sfx('door')}
function checkExits(){const h=G.hero,s=G.s,m=G.m;if(G.sc||G.fade.v||h.st==='dead')return;const tx=Math.floor(h.x),ty=Math.floor(h.y),key=tx+','+ty,mv=inputDir();
 if(G.lastExit&&G.lastExit!==key)G.lastExit=null;
 for(const ex of m.def.exits||[]){const inR=ex.x!=null?(tx===ex.x&&ty===ex.y):(tx>=ex.x0&&tx<=ex.x1&&ty>=ex.y0&&ty<=ex.y1);if(!inR)continue;
  if(ex.dir){if(!mv||mv[0]*ex.dir[0]+mv[1]*ex.dir[1]<.55)continue}else if(G.lastExit===key)continue;
  if(ex.lock&&!s.flags[ex.need]){if(G.time>G.noAt){G.noAt=G.time+1600;runScript(EV[ex.lock](s))}return}
  if((ex.need&&!s.flags[ex.need])||!ex.to){if(G.time>G.noAt){G.noAt=G.time+1800;runScript([['say',null,ex.no||'지금은 갈 수 없다.']]);if(!ex.dir){const cx=m.w/2,cy=m.h/2,dx=cx-h.x,dy=cy-h.y,n=Math.hypot(dx,dy)||1;moveEnt(h,dx/n*.45,dy/n*.45)}}return}
  if(G.arena)return;changeMap(ex.to,ex.tx+.5,ex.ty+.5,ex.face||(ex.dir?[-ex.dir[0],-ex.dir[1]]:[1,1]));return}}
function checkTriggers(){if(G.sc||G.fade.v)return;const h=G.hero,s=G.s;for(const tr of G.m.def.trig||[]){if(tr.onLoad||G.trigDone[tr.id])continue;if(tr.when&&!tr.when(s))continue;if(h.x>=tr.x0&&h.x<=tr.x1+1&&h.y>=tr.y0&&h.y<=tr.y1+1){G.trigDone[tr.id]=1;runScript(EV[tr.run](s));break}}}
/* ---------- 말 걸기, 열기, 조사하기 ---------- */
function lookSpots(){const m=G.m,h=G.hero,L=[];for(const lk of m.def.looks||[])L.push({x:lk.x+.5,y:lk.y+.5,lk});
 const rows=MAP_ROWS[m.id];const x0=Math.floor(h.x)-2,y0=Math.floor(h.y)-2;for(let y=y0;y<=y0+4;y++)for(let x=x0;x<=x0+4;x++){if(!inMap(m,x,y))continue;const L2=LEG[rows[y][x]];if(L2&&L2.save)L.push({x:x+.5,y:y+.5,save:L2.save})}return L}
function findInteract(){const h=G.hero;let best=null,bs=1e9;
 for(const e of G.ents){let reach=1.05,kind=null;
  if(e.kind==='mob'&&e.st==='down'&&e.D.stake&&e.D.ai!=='lucia'&&!e.dead){reach=1.4;kind='stake'}else if(e.kind==='npc'&&!e.leaving){reach=e.reach;kind='talk'}
  else if(e.kind==='chest'&&!e.open)kind='open';else if(e.kind==='lever'&&!e.on)kind='lever';else if(e.kind==='gate'&&!e.gone&&!e.temp)kind='gate';else continue;
  const dx=e.x-h.x,dy=e.y-h.y,d=Math.hypot(dx,dy);if(d>reach+.3)continue;const dot2=(dx*h.fx+dy*h.fy)/(d||1);if(kind!=='stake'&&d>.8&&dot2<.2)continue;const sc=d-dot2*.5-(kind==='stake'?2:0);if(sc<bs){bs=sc;best={e,kind}}}
 for(const lk of lookSpots()){const dx=lk.x-h.x,dy=lk.y-h.y,d=Math.hypot(dx,dy);if(d>1.25)continue;const dot2=(dx*h.fx+dy*h.fy)/(d||1);if(dot2<.3&&d>.8)continue;const sc=d-dot2*.5+.1;if(sc<bs){bs=sc;best={e:lk,kind:lk.save?'save':'look'}}}
 return best}
const PROMPT={stake:'말뚝!',talk:'말하기',open:'열기',lever:'당기기',gate:'살피기',save:'쉬기',look:'살피기'};
function interact(t){const h=G.hero,s=G.s,e=t.e;
 switch(t.kind){
  case 'stake':stake(e);break;
  case 'talk':{setFace(h,e.x-h.x,e.y-h.y);setFace(e,h.x-e.x,h.y-e.y);const N=NPC[e.id];if(N)runScript(N.talk(s,e));break}
  case 'open':openChest(e);break;
  case 'lever':e.on=1;s.flags['lever_'+G.m.id+'_'+e.tx+'_'+e.ty]=1;sfx('lever');G.cam.sh=1.5;if(G.m.id==='crypt1'){s.flags.cell_open=1;openGates('cell_open');runScript([['wait',300],['sfx','gate'],['toast','철컹! 어딘가의 감옥 문이 열렸다.',2600]])}break;
  case 'gate':runScript([['say',null,'녹슨 철창이 굳게 닫혀 있다. 어딘가에 여는 장치가 있을 것 같다.']]);break;
  case 'save':{const steps=[];if(G.m.id==='cemetery'&&!s.pages.includes(0))steps.push(['say',null,'제단 위에 누군가 놓고 간 수첩 한 장이 있다. 아버지의 글씨다!'],['fn','addPage0']);
   const nm=e.save==='bed'?'침대에 누워 쉴까?':e.save==='fire'?'모닥불을 쬐며 쉴까?':'제단 앞에 무릎 꿇고 기도할까?';
   steps.push(['ask',null,nm,[['쉬고 기록하기',[['fade',1],['heal'],['wait',200],['fade',0],['save'],['fn','respawnAll']]],['그만',[]]]]);runScript(steps);break}
  case 'look':{const lk=e.lk;const used=lk.once&&s.flags['look_'+lk.once];if(lk.fn&&!used)runScript((FN[lk.fn]||ENGFN[lk.fn])(s)||[]);else runScript([['say',null,lk.t]]);if(lk.once)s.flags['look_'+lk.once]=1;break}}}
function openChest(e){const s=G.s,c=e.c;e.open=1;s.opened[e.cid]=1;sfx('chest');for(let i=0;i<12;i++)addFx('spark',e.x,e.y,10,{vx:rand(-1,1),vy:rand(-1,1),vz:rand(30,60),life:700,c:'#ffe080'});
 const steps=[];if(c.item)steps.push(['give',c.item,c.n||1]);if(c.gold)steps.push(['gold',c.gold]);if(c.sub)steps.push(['sub',c.sub],['say',null,'보조 무기 「'+SUB[c.sub].n+'」! '+SUB[c.sub].d]);if(c.relic)steps.push(['relic',c.relic]);runScript(steps)}
/* 엔진 쪽 작은 일들 */
const ENGFN={
 ch1Clear:()=>{try{const D=K.D;if(D){D.games=D.games||{};D.games.vhClear=(D.games.vhClear||0)+1;K.save()}}catch(_){}return null},
 refreshAmb:s=>{const m=G.m;if(!m)return null;m.amb=m.def.amb(s);m.litWin=m.amb.a>.35;return null},
 luciaRise:()=>{const m=G.m;const i=I(m,8,3);m.prop[i]='coffinO';const e=G.ents.find(b=>b.type==='lucia');if(e){for(let k=0;k<20;k++)addFx('smoke',e.x+rand(-.5,.5),e.y+rand(-.5,.5),rand(0,20),{life:900})}return null},
 biteFx:()=>{const h=G.hero,e=G.ents.find(b=>b.type==='lucia'&&!b.dead);if(e){e.x=h.x-h.fx*.5;e.y=h.y-h.fy*.5;resolve(e)}sfx('bite');G.cam.sh=5;G.flashRed=G.time;for(let i=0;i<20;i++)addFx('blood',h.x,h.y,22,{vx:rand(-2,2),vy:rand(-2,2),vz:rand(10,40),life:700,c:'#c0101e'});vib([80,60,200]);return null},
 bloodUnlock:s=>{s.flags.blood=1;s.blood=100;G.st=stats();sfx('awaken');const e=G.ents.find(b=>b.type==='lucia'&&!b.dead);if(e){const h=G.hero,dx=e.x-h.x,dy=e.y-h.y,n=Math.hypot(dx,dy)||1;e.kbx=dx/n*9;e.kby=dy/n*9}return null},
 luciaDust:()=>{const e=G.ents.find(b=>b.type==='lucia'&&!b.dead);if(e){e.hp=0;killMob(e,true)}G.boss=null;return null},
 addPage0:s=>{if(!s.pages.includes(0))s.pages.push(0);G.tele={page:0,at:G.time};sfx('page');if(!s.tele.includes('t3')){return[['tele','t3']]}return null},
 addPage1:s=>{if(!s.pages.includes(1))s.pages.push(1);G.tele={page:1,at:G.time};sfx('page');return null},
 addPage2:s=>{if(!s.pages.includes(2))s.pages.push(2);G.tele={page:2,at:G.time};sfx('page');return null},
 playOrgan:()=>{const back=AU.cur;playMusic('toccata');AU.after=back;G.organ=G.time;return null},
 respawnAll:()=>{const m=G.m,s=G.s;for(const mb of m.def.mobs||[]){if(mb.arena||ENEMY[mb.t].boss)continue;if(mb.when&&!mb.when(s))continue;if(G.ents.some(e=>e.kind==='mob'&&e.home&&Math.abs(e.home.x-(mb.x+.5))<.01&&Math.abs(e.home.y-(mb.y+.5))<.01&&!e.dead))continue;G.ents.push(mkMob(mb.t,mb.x+.5,mb.y+.5,mb))}return null},
 buyIvan:s=>{if(s.gold<10)return[['say','ivan','돈도 없으면서. 흥.']];return[['gold',-10],['say','ivan','(꿀꺽 꿀꺽) 크으... 좋아. 가져가.'],['give','key'],['flag','q_key'],
  ['say','ivan','그리고... 내 등불을 묘지 어딘가에 떨어뜨렸어. 북쪽 파헤쳐진 무덤 근처였는데. 찾으면 갖다 줘. 우리 할아버지 거야. 난 이제 오두막으로 가 있을 거야.'],['quest']]},
 forge:s=>{const lv=s.wlv[s.wpn]||0,W=WEAPON[s.wpn];if(lv>=3)return[['say','miklos','이 「'+W.n+'」은(는) 더 벼릴 데가 없소. 최고의 물건이지!']];const cost=[120,260,520][lv];
  return[['ask','miklos','「'+W.n+'」 +'+lv+' → +'+(lv+1)+' (공격 +2). 금화 '+cost+'.',[['벼려 주시오',[['fn',s2=>{if(s2.gold<cost)return[['say','miklos','금화가 모자라오.']];s2.gold-=cost;s2.wlv[s2.wpn]=lv+1;G.st=stats();return[['sfx','anvil'],['wait',220],['sfx','anvil'],['say',null,'땅! 땅! 「'+W.n+'」 +'+(lv+1)+'!']]}]]],['그만',[]]]]]},
 tarotRead:s=>{if(s.gold<10)return[['say','rada','금화 열 닢. 공짜 점은 맞지 않는 법이지.']];s.gold-=10;const ms=mainStep(s);const card=pick(['마차','은둔자','달','별','운명의 수레바퀴','죽음','탑','태양']);
  return[['say','rada','(카드를 뒤집는다) 「'+card+'」의 카드로구나.'],['say','rada',ms.d],['say','rada',pick(['네 등 뒤의 그림자를 조심해라. 반쪽짜리 피는 양쪽 모두에게 미움받는 법.','은은 거짓말을 하지 않는다. 늘 넉넉히 지니고 다녀라.','죽음의 카드가 거꾸로 나왔다. 끝이 아니라 바뀜이란 뜻이지.'])]]},
 tarotGive:s=>{const fresh=s.cards.filter(c=>!s.shown.includes(c));if(!fresh.length)return[['say','rada',s.cards.length?'그 카드들은 이미 읽었다. 남은 카드를 찾아오너라. 넷이 모여야 운명이 보인다.':'아직 카드를 하나도 못 찾았구나. 숲, 묘지, 마을, 땅속. 카드는 늘 어두운 구석에 숨는다.']];
  const L=[];const LORE={magician:'마법사. 손에 쥔 것을 다룰 줄 아는 자. 너의 성력이 깊어질 게다.',strength:'힘. 사자의 입을 맨손으로 다무는 여인. 짐승을 누르는 힘이지.',moon:'달. 개와 늑대가 함께 울부짖는 밤. 거짓과 진실이 섞인다.',tower:'탑. 번개가 왕관을 떨어뜨린다. 무너져야 다시 세울 수 있는 법.'};
  for(const c of fresh){s.shown.push(c);L.push(['say','rada',LORE[c]||'...'])}
  if(s.shown.length>=4&&s.flags.sq_tarot!==2)L.push(['say','rada','넷이 모였구나. 이걸 가져가라. 집시의 눈이다. 숨은 것을 보게 해 줄 게다.'],['relic','eye'],['flag','sq_tarot',2],['quest']);return L}};
/* ---------- 한 걸음 ---------- */
function stepWorld(dt){const ms=dt*1000;G.time+=ms;G.st=stats();
 if(G.later&&G.later.length){const L=G.later;G.later=[];for(const f of L)try{f()}catch(_){}}
 heroUpdate(dt);
 for(const e of G.ents){if(e.gone)continue;if(e.kind==='mob'&&!e.dead)mobUpdate(e,dt);else if(e.kind==='npc')npcUpdate(e,dt);else if(e.kind==='pick')pickUpdate(e,dt);else if(e.kind==='dummy'||e.kind==='brazier'||e.kind==='lever'||e.kind==='chest'||e.kind==='gate'||e.kind==='brk'||e.kind==='crack')e.t=(e.t||0)+ms}
 for(const p of G.shots)if(!p.gone)shotUpdate(p,dt);G.shots=G.shots.filter(p=>!p.gone);
 for(const z of G.hz)if(!z.gone)hzUpdate(z,dt);G.hz=G.hz.filter(z=>!z.gone);
 separate();G.ents=G.ents.filter(e=>!e.gone);
 if(!G.sc){checkTriggers();checkExits()}if(G.watch.length&&G.frame%10===0)checkWatch();
 /* 탐험한 칸 */
 const h=G.hero,m=G.m;if(m.ex){const cx=Math.floor(h.x),cy=Math.floor(h.y);for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++)if(inMap(m,x,y)&&(x-cx)*(x-cx)+(y-cy)*(y-cy)<=20)m.ex[y*m.w+x]=1;if(G.frame%30===0)G.s.ex[m.id]=m.ex.join('')}
 G.s.play=(G.s.play||0)+ms}
function camUpdate(dt){const h=G.hero;if(!h)return;const tx=(h.x-h.y)*16+(h.fx-h.fy)*6,ty=(h.x+h.y)*8+(h.fx+h.fy)*3-h.z;const k=1-Math.exp(-dt*7);G.cam.x+=(tx-G.cam.x)*k;G.cam.y+=(ty-G.cam.y)*k;
 if(G.cam.sh>0){const a=G.s.opt.shake?G.cam.sh:0;G.cam.ox=rand(-a,a);G.cam.oy=rand(-a,a)*.7;G.cam.sh=Math.max(0,G.cam.sh-dt*14)}else{G.cam.ox=0;G.cam.oy=0}}
/* needs 에서 부른다: 고정 걸음 */
function simulate(t){if(!G.last)G.last=t;let real=t-G.last;G.last=t;if(real>250){real=0;if(G.mode==='play'&&!busyUI()&&!G.sc&&G.hero&&G.hero.st!=='dead'){openPause()}}
 real=Math.min(real,100);G.frame++;
 for(const tt of G.toasts)if(tt.at==null)tt.at=G.time;G.toasts=G.toasts.filter(tt=>G.time-tt.at<(tt.dur||2600));
 fadeTick(real);
 if(G.mode!=='play'){G.time+=real;return}
 if(G.dlg)dlgTick(real);
 if(G.menu||G.shop||G.dlg||G.ask||G.card||G.tele){fxUpdate(real/1000*.0);camUpdate(real/1000);G.time+=0;return}
 if(G.fade.v>0){G.time+=real;camUpdate(real/1000);return}
 if(G.hitstop>0){G.hitstop-=real;G.cam.sh=Math.max(G.cam.sh,.5);fxUpdate(real/1000*.25);return}
 let k=1;if(G.slowT>G.time)k=G.slowK;G.acc+=real*k;let n=0;while(G.acc>=1000/60&&n<6){G.acc-=1000/60;n++;stepWorld(1/60);if(G.mode!=='play'||G.menu||G.dlg||G.ask)break}if(n>=6)G.acc=0;
 fxUpdate(real*k/1000);camUpdate(real/1000);scriptTick(real);
 if(G.hero&&G.hero.st==='dead'&&G.now-(G.deadReal||G.now)>2300&&G.mode==='play'){G.mode='over';G.sel=0;playMusic('over')}}
function fadeTick(ms){const F=G.fade;if(F.v>0){F.a=Math.min(1,F.a+ms/220);if(F.a>=1){F.v=0;if(F.cb){const cb=F.cb;F.cb=null;cb()}}}else if(F.v<0){F.a=Math.max(0,F.a-ms/260);if(F.a<=0)F.v=0}}
/* ---------- 그리기: 세상은 150×184 판에 한 점씩 그리고, 글자만 액정에 또렷하게 ---------- */
function scr(x,y,z){return[Math.round((x-y)*16-G.cam.x+AX+G.cam.ox),Math.round((x+y)*8-(z||0)-G.cam.y+AY+G.cam.oy)]}
function blitRegion(g,src,sx,sy,sw,sh,dx,dy){if(!src)return;const W2=src.width,H2=src.height;let x0=sx,y0=sy,x1=sx+sw,y1=sy+sh;if(x0<0){dx-=x0;x0=0}if(y0<0){dy-=y0;y0=0}x1=Math.min(x1,W2);y1=Math.min(y1,H2);if(x1<=x0||y1<=y0)return;try{g.drawImage(src,x0,y0,x1-x0,y1-y0,dx,dy,x1-x0,y1-y0)}catch(_){}}
function put(g,sp,x,y,alpha){if(!sp)return;if(alpha!=null&&alpha<1){g.globalAlpha=Math.max(0,alpha)}try{if(sp.hi){hq(g);g.drawImage(sp.c,x-sp.ax,y-sp.ay,sp.w,sp.h);g.imageSmoothingEnabled=false}else g.drawImage(sp.c,Math.round(x-sp.ax),Math.round(y-sp.ay))}catch(_){}if(alpha!=null&&alpha<1)g.globalAlpha=1}
function heroFacing(e){const sdx=e.fx-e.fy,sdy=e.fx+e.fy;if(Math.abs(sdx)>.15)e.flip=sdx<0?1:0;e.front=sdy>=-.1?1:0;return e}
function drawWorld(g,t){const m=G.m;if(!m)return;const RS=IM.rs;if(!G.wb||G.wb.w!==VW*RS)G.wb=mkcv(VW*RS,VH*RS);if(!G.lb)G.lb=mkcv(Math.ceil(VW/2),Math.ceil(VH/2));const wb=G.wb;if(!wb){return}const wg=wb.g;
 wg.setTransform&&wg.setTransform(RS,0,0,RS,0,0);wg.globalAlpha=1;wg.globalCompositeOperation='source-over';wg.imageSmoothingEnabled=false;
 drawSky(wg,t);
 const fx0=Math.round(G.cam.x-AX-G.cam.ox+m.fox),fy0=Math.round(G.cam.y-AY-G.cam.oy+m.foy);blitRegion(wg,m.floor,fx0,fy0,VW,VH,0,0);drawFloorHi(wg,m);
 /* 보이는 칸 범위 */
 const cx=G.cam.x-G.cam.ox,cy=G.cam.y-G.cam.oy;const dMin=Math.floor((cx-AX-20)/16)-1,dMax=Math.ceil((cx+(VW-AX)+20)/16)+1,sMin=Math.floor((cy-AY-10)/8)-1,sMax=Math.ceil((cy+(VH-AY)+90)/8)+1;
 const D=[];const h=G.hero;const hs=scr(h.x,h.y,0);const hd=h.x+h.y;G.occ=0;
 /* 물 반짝임과 바닥 얼룩 */
 for(let s2=sMin;s2<=sMax;s2++)for(let d=dMin;d<=dMax;d++){if((s2+d)&1)continue;const x=(s2+d)/2,y=(s2-d)/2;if(!inMap(m,x,y))continue;const i=y*m.w+x;
  if(m.solid[i]===3){const p=scr(x,y,0);const k=Math.floor(t/300+hash(x,y,5)*8)%8;if(k<3)dot(wg,'#3a6a9a',p[0]-6+k*3,p[1]+6+k,3,1);continue}
  if(m.cube[i]){D.push({k:x+y+1,cube:i,x,y});continue}if(m.prop[i])D.push({k:x+y+1,prop:i,x,y})}
 for(const dc of G.dec){const p=scr(dc.x,dc.y,0);const a=Math.max(0,1-(G.time-dc.t)/26000);if(a<=0)continue;wg.globalAlpha=a*.85;const c=G.s.opt.blood==='green'?'#2a6a28':'#5e0a12';if(dc.k==='blood'){dot(wg,c,p[0]-3,p[1],6,2);dot(wg,c,p[0]-1,p[1]-1,3,1);dot(wg,c,p[0]+3,p[1]+1,1,1)}else dot(wg,c,p[0],p[1],2,1);wg.globalAlpha=1}
 /* 그림자 */
 for(const e of G.ents){if(IM.use&&e.kind==='hero')continue;if(e.gone||e.kind==='brk'||e.kind==='chest'||e.kind==='lever'||e.kind==='brazier'||e.kind==='crack'||e.kind==='gate'||e.kind==='dummy')continue;if(e.kind==='mob'&&(e.st==='buried'))continue;const p=scr(e.x,e.y,0);const r=Math.max(3,Math.round((e.r||.3)*20*(e.z>2?.7:1)));wg.globalAlpha=e.alpha!=null?e.alpha*.4:.4;wg.fillStyle='#000';for(let k=-1;k<=1;k++)wg.fillRect(p[0]-r+Math.abs(k),p[1]-1+k,r*2-Math.abs(k)*2,1);wg.globalAlpha=1}
 drawGroundFx(wg,t);
 for(const e of G.ents)if(!e.gone)D.push({k:e.x+e.y+(e.kind==='pick'?.01:0),e});
 for(const p of G.shots)D.push({k:p.x+p.y+.02,shot:p});
 D.sort((a,b)=>a.k-b.k);
 for(const it of D){
  if(it.cube!=null){const ch=m.cube[it.cube];const low=m.def.room&&(it.x===m.w-1||it.y===m.h-1);const cu=cubeCv(ch,m.deco[it.cube]||'',m.litWin,low?6:0);if(!cu)continue;const p=scr(it.x,it.y,0);let a=1;
   if(!low&&it.k>hd+.2&&cu.h>12){const top=p[1]-cu.h,bot=p[1]+16;if(hs[0]>p[0]-24&&hs[0]<p[0]+24&&hs[1]-6>top&&hs[1]-26<bot&&it.k-hd<5)a=.38}
   if(!low&&it.k>hd+.2&&!G.occ){const top=p[1]-cu.h,bot=p[1]+16;if(hs[0]>p[0]-18&&hs[0]<p[0]+18&&hs[1]-4>top&&hs[1]-24<bot)G.occ=1}
   putCube(wg,cu,p[0]-16,p[1]-cu.h-cu.extra,a);continue}
  if(it.prop!=null){const pr=m.prop[it.prop];const v=Math.floor(hash(it.x,it.y,9)*3);const sp=propCv(pr,v);const p=scr(it.x+.5,it.y+.5,0);let a=1;if(it.k>hd+.2&&(pr==='pine'||pr==='dead'||pr==='statue'||pr==='well'||pr==='wagon'||pr==='organ'||pr==='shelfP')){if(Math.abs(hs[0]-p[0])<16&&hs[1]<p[1]+4&&hs[1]>p[1]-46&&it.k-hd<3)a=.4}
   put(wg,sp,p[0],p[1]+4,a);continue}
  if(it.shot){drawShot(wg,it.shot,t);continue}
  drawEnt(wg,it.e,t)}
 if(G.occ&&h.st!=='dead'){heroFacing(h);const f=h.front?'se':'ne';put(wg,sprite('hero',h.st==='roll'?f+'_roll':f+'_stand',0,{flip:!!h.flip,mode:'sil'}),hs[0],hs[1]-(h.z||0),.55)}
 drawAirFx(wg,t);
 drawLights(wg,t);
 drawWeather(wg,t);
 /* 화면 빛깔 */
 const s=G.s,st=G.st||stats();
 if(G.awakeT>G.time){wg.globalAlpha=.14+Math.sin(t/120)*.03;wg.fillStyle='#ff1020';wg.fillRect(0,0,VW,VH);wg.globalAlpha=1}
 if(G.flashRed&&G.time-G.flashRed<600){wg.globalAlpha=(1-(G.time-G.flashRed)/600)*.55;wg.fillStyle='#ff0010';wg.fillRect(0,0,VW,VH);wg.globalAlpha=1}
 if(G.lightning&&t-G.lightning<260){wg.globalAlpha=(1-(t-G.lightning)/260)*.6;wg.fillStyle='#e8f0ff';wg.fillRect(0,0,VW,VH);wg.globalAlpha=1}
 if(s.hp>0&&s.hp<st.hp*.25)vignette(wg,'rgba(200,0,20,'+(.25+Math.sin(t/200)*.1).toFixed(3)+')');
 if(h.st==='dead'){wg.globalAlpha=Math.min(.7,(G.time-G.deadAt)/2400);wg.fillStyle='#0a0004';wg.fillRect(0,0,VW,VH);wg.globalAlpha=1}
 if(RS>1)hq(g);else g.imageSmoothingEnabled=false;try{g.drawImage(wb.c,0,0,VW,VH)}catch(_){}g.imageSmoothingEnabled=false}
function vignette(g,col){try{const gr=g.createRadialGradient(VW/2,VH/2,40,VW/2,VH/2,110);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,col);g.fillStyle=gr;g.fillRect(0,0,VW,VH)}catch(_){}}
/* 하늘: 달, 먼 산과 성, 별 */
function drawSky(g,t){const m=G.m,amb=m.amb;if(!m.def.out){g.fillStyle=m.def.base==='-'?'#030205':'#0a0608';g.fillRect(0,0,VW,VH);return}
 const sk=amb.sky||['#05050f','#1a1a3a'];try{const gr=g.createLinearGradient(0,0,0,VH);gr.addColorStop(0,sk[0]);gr.addColorStop(1,sk[1]);g.fillStyle=gr}catch(_){g.fillStyle=sk[0]}g.fillRect(0,0,VW,VH);
 const px=-G.cam.x*.04,py=-G.cam.y*.03;
 if(amb.moon){for(let i=0;i<26;i++){const x=Math.floor(hash(i,1,4)*VW*1.6+px*.5)%VW,y=Math.floor(hash(i,2,4)*70);if(x<0)continue;dot(g,hash(i,3,4)<.3?'#ffffff':'#8a8ab0',x,y,1,1)}
  const mx=Math.round(108+px*.3),my=Math.round(26+py*.3);g.fillStyle='rgba(220,220,255,.08)';for(let r=22;r>12;r-=4){g.beginPath&&g.beginPath();g.arc&&g.arc(mx,my,r,0,6.3);g.fill&&g.fill()}fillPoly(g,ring(mx,my,11),'#f2f0e0');fillPoly(g,ring(mx+3,my-1,9.5),'#f2f0e0');dot(g,'#d8d4c0',mx-4,my-2,3,2);dot(g,'#d8d4c0',mx+2,my+3,2,2);
  if(Math.floor(t/9000)%2===0){const k=(t%9000)/9000;const bx=Math.round(-20+k*(VW+40)),by=Math.round(40-Math.sin(k*6)*8);for(let i=0;i<3;i++){const ox=bx+i*9,oy=by+(i%2)*4,f=Math.floor(t/120+i)%2;dot(g,'#000',ox,oy,3,1);dot(g,'#000',ox-2,oy-(f?1:-1),2,1);dot(g,'#000',ox+3,oy-(f?1:-1),2,1)}}}
 else if(amb===AMB.dusk){const sx=Math.round(30+px*.3),sy=Math.round(70+py*.2);fillPoly(g,ring(sx,sy,14),'rgba(255,170,110,.55)');fillPoly(g,ring(sx,sy,9),'#ffc890')}
 /* 먼 산과 백작의 성 */
 const hx=Math.round(px*1.6)%300,base=Math.round(84+py);const col=amb.moon?'#0a0a18':amb===AMB.dawn?'#3a4a6a':'#2a1630';
 g.fillStyle=col;for(let x=-20;x<VW+20;x+=2){const X=x-hx;const y=base-Math.round(18+Math.sin(X/23)*8+Math.sin(X/9)*3);g.fillRect(x,y,2,VH)}
 const cxp=((Math.round(118+px*1.6))%300+300)%300-60;if(cxp>-40&&cxp<VW+20){const by=base-30;g.fillStyle=col;g.fillRect(cxp,by-14,22,20);g.fillRect(cxp+3,by-24,4,12);g.fillRect(cxp+15,by-28,5,16);g.fillRect(cxp+9,by-18,4,6);fillPoly(g,[[cxp+2,by-24],[cxp+5,by-31],[cxp+8,by-24]],col);fillPoly(g,[[cxp+14,by-28],[cxp+17.5,by-37],[cxp+21,by-28]],col);
  if(amb.moon&&Math.floor(t/700)%3)dot(g,'#ffcf60',cxp+17,by-22,1,1);if(amb.moon)dot(g,'#ffcf60',cxp+6,by-8,1,1)}}
function ring(cx,cy,r){const P=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}return P}
/* 땅에 깔리는 것: 경고 원, 성수 불길, 비명 고리 */
function drawGroundFx(g,t){for(const z of G.hz){const p=scr(z.x,z.y,0);
 if(z.type==='mark'){const k=Math.min(1,z.t/(z.delay||1));const r=z.r*16;const P=[];for(let i=0;i<20;i++){const a=i/20*Math.PI*2;P.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r*.5])}g.globalAlpha=.25+k*.35;fillPoly(g,P,z.c||'#ff3040');g.globalAlpha=1;const P2=[];for(let i=0;i<20;i++){const a=i/20*Math.PI*2;P2.push([p[0]+Math.cos(a)*r*k,p[1]+Math.sin(a)*r*.5*k])}g.globalAlpha=.4;fillPoly(g,P2,'#ffffff');g.globalAlpha=1}
 else if(z.type==='arc'){const k=Math.min(1,z.t/z.delay);const P=[[p[0],p[1]]];for(let i=0;i<=10;i++){const a=z.a-z.w+i/10*z.w*2;const mx=Math.cos(a),my=Math.sin(a);P.push([p[0]+(mx-my)*16*z.r,p[1]+(mx+my)*8*z.r])}g.globalAlpha=.2+k*.35;fillPoly(g,P,z.c);g.globalAlpha=1}
 else if(z.type==='fire'){g.globalAlpha=.35;const r=z.r*16;const P=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;P.push([p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r*.5])}fillPoly(g,P,'#4a8aff');g.globalAlpha=1}
 else if(z.type==='ring'){const r=z.r*16;g.globalAlpha=.8;for(let i=0;i<32;i++){const a=i/32*Math.PI*2;dot(g,i%2?'#ffffff':(z.c||'#e0d0ff'),Math.round(p[0]+Math.cos(a)*r),Math.round(p[1]-6+Math.sin(a)*r*.5),2,1)}g.globalAlpha=1}}}
/* ---------- 한 녀석씩 ---------- */
function drawEnt(g,e,t){const p=scr(e.x,e.y,e.z||0);
 switch(e.kind){
  case 'hero':drawHero(g,e,p,t);break;
  case 'mob':drawMob(g,e,p,t);break;
  case 'npc':{const fl=(e.fx-e.fy)<0;const sp=sprite('npc',e.look,0,{flip:fl});const bob=e.walking?(Math.floor(e.t/160)%2):(Math.floor((t+e.home.x*300)/700)%2);put(g,sp,p[0],p[1]+1-bob*.0-(e.walking?bob:0),e.alpha);
   if(!e.sleep&&!G.sc&&Math.hypot(G.hero.x-e.x,G.hero.y-e.y)<2.2&&e.alpha>.9){const q=NPC[e.id]&&questMark(e.id);if(q){dot(g,'#0b0910',p[0]-2,p[1]-34,5,7);dot(g,q,p[0]-1,p[1]-33,3,4);dot(g,q,p[0]-1,p[1]-28,3,1)}}break}
  case 'brk':{const sp=propCv(e.art,0);put(g,sp,p[0],p[1]+4,1);if(e.art==='candle'&&!(sp&&sp.hi))flames(g,p[0],p[1]-18,t,3);break}
  case 'chest':put(g,propCv(e.open?'chestO':'chest',0),p[0],p[1]+4);if(!e.open&&Math.floor(t/500)%3===0)dot(g,'#fff8c0',p[0]-4,p[1]-12,1,1);break;
  case 'lever':put(g,propCv(e.on?'lever1':'lever0',0),p[0],p[1]+4);break;
  case 'brazier':{const hs=IM.use?propImg(e.lit?'brazier':'brazierOff',0):null;if(hs){put(g,hs,p[0],p[1]+4);if(e.lit&&Math.floor(t/120)%3===0)dot(g,'#fff0b0',p[0]-1,p[1]-15,2,1);break}
   put(g,propCv('brazier',0),p[0],p[1]+4);if(e.lit)flames(g,p[0],p[1]-12,t,1,1);else if(Math.floor(t/800)%2)dot(g,'#5a3a20',p[0]-1,p[1]-11,2,1);break}
  case 'dummy':{const wob=e.flash>G.time?1:0;put(g,propCv('dummy',0),p[0]+wob,p[1]+4);break}
  case 'crack':{const cu=cubeCv('X','',false,0);if(cu)putCube(g,cu,p[0]-16,p[1]-8-cu.h);const sh=e.flash>G.time?1:0;line(g,p[0]-6+sh,p[1]-24,p[0]-1,p[1]-14,'#0a0a0e');line(g,p[0]-1,p[1]-14,p[0]-5,p[1]-6,'#0a0a0e');line(g,p[0]-1,p[1]-14,p[0]+4,p[1]-10,'#0a0a0e');if(e.hp<3)line(g,p[0]+6,p[1]-20,p[0]+2,p[1]-12,'#0a0a0e');break}
  case 'gate':{const cu=cubeCv('O','',false,0);if(cu)putCube(g,cu,p[0]-16,p[1]-8-cu.h);break}
  case 'pick':drawPick(g,e,p,t);break}}
function questMark(id){const s=G.s,F=s.flags;const yel='#ffd840',gry='#a8a8b8';
 switch(id){case 'marta':return!F.q_inn?yel:null;case 'emil':return!F.q_emil||(F.sq_wings===1&&(s.inv.wing||0)>=5)?yel:null;case 'josef':return!F.q_josef?yel:null;case 'ana':return F.q_inn&&!F.q_ana?yel:null;
  case 'ivan':return(F.q_ana&&!F.q_key)||s.inv.lantern?yel:null;case 'rada':return!F.rada_met||(F.saw_tomb&&!F.q_mirror)||s.cards.some(c=>!s.shown.includes(c))?yel:null;case 'miklos':return!F.miklos_met||(F.sq_silver===1&&(s.inv.candle||0)>=3)?yel:null;
  case 'dragomir':return F.saw_tomb&&!F.q_drag?yel:null;case 'guest':return s.inv.mirror&&!F.guest_reveal?'#ff4050':null;case 'm1':return F.kid_mihai===1||!F.sq_kids?yel:null;case 'm2':return F.kid_elena===1||!F.sq_kids?yel:null;case 'mihai':case 'elena':return G.m.id!=='village'?yel:null;case 'gregor':return!F.gregor_met?yel:null}return null}
function flames(g,x,y,t,n,big){const xs=n===3?[-4,0,4]:[0];for(const dx of xs){const f=Math.floor(t/90+dx)%3;const hgt=big?6+f:3+(f%2);dot(g,'#ff8a20',x+dx-(big?2:0),y-hgt+2,big?5:1,hgt-1);dot(g,'#ffd060',x+dx-(big?1:0),y-hgt+1+(f===1?1:0),big?3:1,Math.max(1,hgt-3));if(big)dot(g,'#fff4c0',x+dx,y-2,1,2)}}
function drawHero(g,h,p,t){const s=G.s;heroFacing(h);const f=h.front?'se':'ne';let fr=f+'_stand';const st=h.st;let dy=0,dx=0;
 if(st==='move'){const k=Math.floor((h.walk||0)/140)%4;fr=f+['_w1','_stand','_w2','_stand'][k];dy=k%2?0:-1}
 else if(st==='atk'){fr=h.t<h.sw.c.w*.6?f+'_stand':f+'_atk'}else if(st==='charge'){fr=f+'_atk';dx=Math.floor(t/40)%2?1:0}else if(st==='spin'){const k=Math.floor(h.t/50)%4;fr=(k<2?'se':'ne')+'_atk';h.flipTmp=k%2}
 else if(st==='roll')fr=f+'_roll';else if(st==='throw'||st==='stake'||st==='dash')fr=f+'_atk';else if(st==='cast')fr=h.front?'se_cast':'ne_cast';else if(st==='dead')fr='dead';else if(st==='idle')dy=Math.floor(t/650)%2?0:0;
 const flip=st==='spin'?!!h.flipTmp:!!h.flip;let mode=h.flash>G.time&&Math.floor(t/50)%2?'white':(G.awakeT>G.time?'red':'');
 if(st==='dash')for(let i=1;i<=3;i++){const q=scr(h.x-h.dash.dx*i*.35,h.y-h.dash.dy*i*.35,0);put(g,sprite('hero',fr,0,{flip,mode:'sil'}),q[0],q[1],.4-i*.1)}
 const blink=h.inv>G.time&&st!=='roll'&&st!=='dash'&&Math.floor(t/70)%2;const sp=sprite('hero',fr,0,{flip,mode});
 put(g,sp,p[0]+dx,p[1]+dy+(fr.endsWith('roll')?0:0),blink?.45:1);
 if(st==='atk'&&h.sw)drawSwing(g,h,p,t);if(st==='spin')drawSpin(g,h,p);if(st==='charge'&&h.chgL>0){const c=h.chgL===2?'#ffe070':'#c8d8ff';if(Math.floor(t/60)%2)dot(g,c,p[0]-1+Math.round(h.fx*8-h.fy*8),p[1]-14+Math.round((h.fx+h.fy)*4),3,3)}
 if(st==='stake'){const k=Math.min(1,h.t/200);dot(g,'#5a3a22',Math.round(p[0]+(h.fx-h.fy)*10),Math.round(p[1]-10+(h.fx+h.fy)*5-6*(1-k)),2,8)}}
/* 칼질 그림: 은빛 초승달, 채찍은 사슬, 도끼는 붉은 큰 원호 */
function drawSwing(g,h,p,t){const sw=h.sw,c=sw.c,W=WEAPON[G.s.wpn]||WEAPON.cane,tw=c.w*(G.st?G.st.aspd:1),ta=c.a*(G.st?G.st.aspd:1);if(h.t<tw||h.t>tw+ta+120)return;const k=clamp((h.t-tw)/ta,0,1),fade=h.t>tw+ta?1-(h.t-tw-ta)/120:1;
 const base=Math.atan2(h.fy,h.fx),dir=(sw.i%2?-1:1),cx=p[0],cy=p[1]-12;
 if(W.fx==='whip'&&!c.fin){const len=W.reach*k;const n=Math.max(2,Math.round(len*7));for(let i=0;i<=n;i++){const d=len*i/n,wob=Math.sin(i*.9+t/40)*(1-k)*.25;const mx=h.fx*d-h.fy*wob,my=h.fy*d+h.fx*wob;const x=Math.round(cx+(mx-my)*16),y=Math.round(cy+(mx+my)*8);dot(g,i%2?'#d8e0f0':'#7a8498',x,y,2,2)}const tip=[cx+(h.fx-h.fy)*16*len,cy+(h.fx+h.fy)*8*len];dot(g,'#ffffff',Math.round(tip[0])-1,Math.round(tip[1])-1,3,3);return}
 const R=(W.reach+(c.fin?.25:0))*1.05,arc=c.fin?Math.PI*.95:W.arc;const a0=base-arc*dir,a1=base+arc*dir;const steps=20,sweep=Math.floor(steps*k);const heavy=W.fx==='heavy';
 const cE=heavy?'#ffe0b0':'#ffffff',cM=heavy?'#ff9a40':'#bcd2ff',cI=heavy?'#b04a10':'#5a6cb0';
 for(let i=0;i<=sweep;i++){const lag=(sweep-i)/(steps*.85);const al=fade*(1-lag);if(al<=0)continue;const a=lerp(a0,a1,i/steps);const mx=Math.cos(a),my=Math.sin(a);const thick=heavy?.55:.42;
  for(let rr=R*(1-thick);rr<=R+.001;rr+=.055){const x=Math.round(cx+(mx-my)*16*rr),y=Math.round(cy+(mx+my)*8*rr);const q=(rr-R*(1-thick))/(R*thick);g.globalAlpha=al*(q>.82?1:q>.45?.75:.45);dot(g,q>.82?cE:q>.45?cM:cI,x,y,1,1)}
  if(i===sweep&&k<1){g.globalAlpha=fade;const x=Math.round(cx+(mx-my)*16*R),y=Math.round(cy+(mx+my)*8*R);dot(g,'#ffffff',x-1,y-1,3,3)}}g.globalAlpha=1}
function drawSpin(g,h,p){const r=h.spin.r;const k=Math.min(1,h.t/240);g.globalAlpha=1-k*.6;for(let i=0;i<40;i++){const a=i/40*Math.PI*2+k*6;const mx=Math.cos(a),my=Math.sin(a);dot(g,i%3?'#e8f0ff':'#ffffff',Math.round(p[0]+(mx-my)*16*r*(.6+k*.4)),Math.round(p[1]-10+(mx+my)*8*r*(.6+k*.4)),2,1)}g.globalAlpha=1}
const ATKST=new Set(['wind','claw','lunge','throw','swing','swipeW','swipe','pounceW','sweepW','sweep','slamW','slam','kissW','kiss','screamW','scream','boltW','leapW','leap','roses','rain','howl','summon']);
function drawMob(g,e,p,t){const D=e.D;if(e.st==='buried'){if(Math.floor(t/600+e.home.x)%3===0)dot(g,'#3a2c20',p[0]-3,p[1]-1,6,2);return}
 const fl=(e.fx-e.fy)<0;let idx=Math.floor(e.anim/(e.st==='chase'||e.st==='circle'||e.st==='fly'||e.st==='lunge'||e.st==='dive'?150:420))%2;
 if(D.set==='vamp'&&e.st==='down')idx=3;else if(D.set==='lucia'&&e.st==='down')idx=3;else if(ATKST.has(e.st)&&D.set!=='bat'&&D.set!=='rat'&&D.set!=='crow')idx=D.set==='knight'?1:2;
 if(IM.use){if(D.set==='knight'&&!ATKST.has(e.st))idx=0;if(D.set==='alpha'&&ATKST.has(e.st)&&e.st!=='howl')idx=0}
 if(D.set==='crow')idx=e.z>1?1:0;if(D.set==='alpha'&&e.st==='howl')idx=2;if(D.set==='lucia'&&(e.st==='screamW'||e.st==='scream'||e.st==='roses'||e.st==='rain'||e.st==='bats'))idx=2;
 let mode=e.flash>G.time?'white':'';if(e.st==='stagger'&&Math.floor(t/90)%2)mode='white';if(e.ghost)mode='ghost';
 if(e.st==='bones'){put(g,sprite('mon','bones',0,{flip:fl,mode}),p[0],p[1]+2);return}
 const sp=sprite('mon',D.set,idx,{flip:fl,mode,remap:D.remap});let a=e.alpha!=null?e.alpha:1;if(e.st==='down'&&Math.floor(t/150)%2)a*=.6;
 if(e.st==='emerge'||e.st==='rise'){const k=e.st==='emerge'?Math.min(1,e.t/800):Math.min(1,e.t/500);if(sp){const kk=sp.k||1,hgt=Math.max(1,Math.round(sp.h*k*kk)/kk);try{g.globalAlpha=Math.max(.3,a);if(sp.hi)hq(g);g.drawImage(sp.c,0,0,sp.w*kk,Math.max(1,Math.round(hgt*kk)),p[0]-sp.ax,p[1]-hgt,sp.w,hgt);g.imageSmoothingEnabled=false;g.globalAlpha=1}catch(_){}}return}
 const bob=sp&&sp.hi&&(D.set==='alpha'||D.set==='knight'||D.set==='lucia'||(D.set==='vamp'&&!D.remap))&&!ATKST.has(e.st)&&e.st!=='down'?Math.round(Math.sin(e.anim/(D.set==='lucia'?260:110))*(D.set==='lucia'?1.5:.8)*2)/2:0;
 put(g,sp,p[0],p[1]-bob,a);
 if(e.guard&&D.ai==='knight'&&!(sp&&sp.hi)&&e.st!=='stagger'){const q=[Math.round(p[0]+(e.fx-e.fy)*7),Math.round(p[1]-14+(e.fx+e.fy)*3.5)];dot(g,'#0b0910',q[0]-3,q[1]-5,7,11);dot(g,'#8a94a8',q[0]-2,q[1]-4,5,9);dot(g,'#a01f2e',q[0]-1,q[1]-2,3,4)}
 if(['wind','swipeW','pounceW','sweepW','slamW','kissW','screamW','boltW','leapW'].includes(e.st)&&Math.floor(t/80)%2){const top=p[1]-(sp?sp.h:20)-5;dot(g,'#0b0910',p[0]-2,top-1,4,9);dot(g,'#ff3040',p[0]-1,top,2,5);dot(g,'#ff3040',p[0]-1,top+6,2,2)}
 if(!e.boss&&e.hp<e.mhp&&e.st!=='down'&&e.st!=='bones'&&e.flash>G.time-2500){const w2=14,top=p[1]-(sp?sp.h:20)-4;dot(g,'#0b0910',p[0]-w2/2-1,top-1,w2+2,4);dot(g,'#3a0a10',p[0]-w2/2,top,w2,2);dot(g,'#e83040',p[0]-w2/2,top,Math.max(1,Math.round(w2*e.hp/e.mhp)),2)}
 if(e.st==='down'&&D.ai!=='lucia'){const k=1-(G.time-e.downAt)/3300;dot(g,'#0b0910',p[0]-8,p[1]-30,16,4);dot(g,'#ff8090',p[0]-7,p[1]-29,Math.max(1,Math.round(14*k)),2)}}
function drawPick(g,e,p,t){const bob=e.z>0?0:Math.round(Math.sin(t/250+e.x*3)*1.5);const y=p[1]-3+bob;const [k,id]=String(e.what).split(':');
 if(k==='gold'){const f=Math.floor(t/140+e.x*7)%4;const w2=[4,3,1,3][f];dot(g,'#0b0910',p[0]-w2/2-1|0,y-3,w2+2,6);dot(g,'#ffd840',p[0]-w2/2|0,y-2,w2,4);if(w2>2)dot(g,'#fff4a0',p[0]-w2/2|0,y-2,1,2)}
 else if(k==='silver'){dot(g,'#0b0910',p[0]-2,y-5,5,7);dot(g,'#c8d8ff',p[0]-1,y-4,3,5);dot(g,'#ffffff',p[0]-1,y-4,1,2);if(Math.floor(t/300)%4===0)dot(g,'#ffffff',p[0]+2,y-6,1,1)}
 else if(k==='card'){const gl=Math.floor(t/200)%2;dot(g,'#0b0910',p[0]-4,y-12,9,12);dot(g,gl?'#e8c8ff':'#c8a8f0',p[0]-3,y-11,7,10);dot(g,'#6a3a9a',p[0]-2,y-9,5,6);dot(g,'#ffe070',p[0]-1,y-7,3,2);if(gl)dot(g,'#ffffff',p[0]+4,y-14,1,1)}
 else{const col=id==='herb'?'#5ad06a':id==='tonic'?'#ff7aa0':id==='chicken'?'#d88a40':id==='wing'?'#6e4886':id==='lantern'?'#ffd060':'#e0e0e0';dot(g,'#0b0910',p[0]-3,y-8,7,8);dot(g,col,p[0]-2,y-7,5,6);dot(g,'#ffffff',p[0]-2,y-7,1,2);if(id==='lantern'&&Math.floor(t/300)%2)dot(g,'#fff4c0',p[0]-1,y-5,3,3)}}
function drawShot(g,p,t){const q=scr(p.x,p.y,p.z||10);switch(p.type){
 case 'bolt':{const n=Math.hypot(p.vx,p.vy)||1,dx=p.vx/n,dy=p.vy/n;const sx=(dx-dy)*16,sy=(dx+dy)*8;const L=Math.hypot(sx,sy)||1;line(g,q[0],q[1],Math.round(q[0]-sx/L*7),Math.round(q[1]-sy/L*7),'#c8d4e8');dot(g,'#ffffff',q[0],q[1],1,1);break}
 case 'holy':{dot(g,'#0b0910',q[0]-2,q[1]-3,5,6);dot(g,'#7ab8ff',q[0]-1,q[1]-2,3,4);dot(g,'#e8f4ff',q[0]-1,q[1]-2,1,1);break}
 case 'cross':{const f=Math.floor(t/60)%2;if(f){dot(g,'#0b0910',q[0]-4,q[1]-1,9,3);dot(g,'#0b0910',q[0]-1,q[1]-4,3,9);dot(g,'#ffd860',q[0]-3,q[1],7,1);dot(g,'#ffd860',q[0],q[1]-3,1,7)}else{line(g,q[0]-3,q[1]-3,q[0]+3,q[1]+3,'#ffd860');line(g,q[0]+3,q[1]-3,q[0]-3,q[1]+3,'#ffd860')}break}
 case 'bone':{const f=Math.floor(t/80)%2;if(f){dot(g,'#0b0910',q[0]-4,q[1]-1,9,3);dot(g,'#e8e0c8',q[0]-3,q[1],7,1)}else{dot(g,'#0b0910',q[0]-1,q[1]-4,3,9);dot(g,'#e8e0c8',q[0],q[1]-3,1,7)}break}
 case 'rose':dot(g,'#0b0910',q[0]-2,q[1]-2,5,5);dot(g,'#e02040',q[0]-1,q[1]-1,3,3);dot(g,'#ff8090',q[0]-1,q[1]-1,1,1);break;
 case 'blood':dot(g,'#5a0010',q[0]-3,q[1]-3,6,6);dot(g,'#e01030',q[0]-2,q[1]-2,4,4);dot(g,'#ff8090',q[0]-1,q[1]-2,1,1);break;
 case 'wave':for(let i=0;i<3;i++)dot(g,'#8a6a4a',q[0]-4+i*3,q[1]+8-(i%2)*2,3,2);break}}
/* 공중에 뜨는 효과 */
function drawAirFx(g,t){for(const f of G.fx){const p=scr(f.x,f.y,f.z);const k=f.t/f.life;switch(f.k){
 case 'blood':case 'debris':case 'spark':dot(g,f.c,p[0],p[1],f.k==='spark'&&k<.3?2:1,1);break;
 case 'dust':g.globalAlpha=(1-k)*.6;dot(g,'#8a8090',p[0]-1,p[1]-Math.round(k*4),2,2);g.globalAlpha=1;break;
 case 'smoke':{g.globalAlpha=(1-k)*.5;const r=Math.round(3+k*8);fillPoly(g,ring(p[0],p[1]-r,r),'#5a5468');g.globalAlpha=1;break}
 case 'ash':g.globalAlpha=1-k;dot(g,k<.5?'#c8c0b8':'#6a6260',p[0],p[1],1,1);g.globalAlpha=1;break;
 case 'flame':g.globalAlpha=1-k;dot(g,f.c,p[0],p[1],k<.4?2:1,2);g.globalAlpha=1;break;
 case 'ring':{const r=lerp(f.r0,f.r1,k);g.globalAlpha=1-k;for(let i=0;i<24;i++){const a=i/24*Math.PI*2;dot(g,f.c,Math.round(p[0]+Math.cos(a)*r),Math.round(p[1]+Math.sin(a)*r*.5),1,1)}g.globalAlpha=1;break}
 case 'cross':{g.globalAlpha=1-k;const s2=Math.round(6+k*10);dot(g,'#fff4c0',p[0]-1,p[1]-s2*2,3,s2*3);dot(g,'#fff4c0',p[0]-s2,p[1]-s2*2+s2/2|0,s2*2+1,3);g.globalAlpha=1;break}
 case 'hitmark':{g.globalAlpha=k<.3?1:1-(k-.3)/.7;const a=f.r1+Math.PI/2,ca=Math.cos(a),sa=Math.sin(a);const sx=(ca-sa)*16,sy=(ca+sa)*8,n2=Math.hypot(sx,sy)||1,ux=sx/n2,uy=sy/n2,L=Math.round(7+k*4);line(g,Math.round(p[0]-ux*L),Math.round(p[1]-uy*L),Math.round(p[0]+ux*L),Math.round(p[1]+uy*L),'#ffffff');if(k<.4)dot(g,'#ffffff',p[0]-1,p[1]-1,3,3);g.globalAlpha=1;break}
 case 'claw':g.globalAlpha=1-k;for(let i=0;i<3;i++)line(g,p[0]-5+i*3,p[1]-6,p[0]-2+i*3,p[1]+2,'#ff5060');g.globalAlpha=1;break;
 case 'slashM':{g.globalAlpha=1-k;const base=f.r1,R=f.big?30:24;for(let i=0;i<12;i++){const a=base-1.3+i/11*2.6;dot(g,i%2?'#ffffff':'#ffb0b0',Math.round(p[0]+Math.cos(a)*R*.6),Math.round(p[1]+Math.sin(a)*R*.3),2,1)}g.globalAlpha=1;break}
 case 'zz':g.globalAlpha=1-k;dot(g,'#c8d8ff',p[0]+Math.round(k*6),p[1]-Math.round(k*10),3,1);dot(g,'#c8d8ff',p[0]+Math.round(k*6)+1,p[1]-Math.round(k*10)+1,1,1);dot(g,'#c8d8ff',p[0]+Math.round(k*6),p[1]-Math.round(k*10)+2,3,1);g.globalAlpha=1;break}}}
/* ---------- 빛과 어둠 ---------- */
function drawLights(wg,t){const m=G.m,amb=m.amb;if(!amb||amb.a<=.02)return;const lb=G.lb;const L=[];const h=G.hero;
 L.push({x:h.x,y:h.y,z:14,r:m.def.out?62:52,a:.95,c:G.awakeT>G.time?'#ff3040':'#ffe0a0',ca:.07});
 for(const l of m.lights){const fl=l.fl?1+Math.sin(t/(90+l.x*7)+l.y)*.05*l.fl+Math.sin(t/37+l.x)*.03*l.fl:1;L.push({x:l.x,y:l.y,z:l.z||12,r:l.r*fl,a:.9,c:l.c,ca:.16})}
 for(const e of G.ents){if(e.gone)continue;if(e.light&&(e.kind!=='brazier'||e.lit)&&(e.kind!=='brk'||!e.gone)){const fl=1+Math.sin(t/80+e.x*5)*.06;L.push({x:e.x,y:e.y,z:e.light.z||14,r:e.light.r*fl,a:.9,c:e.light.c,ca:.18})}
  if(e.kind==='pick'&&String(e.what).startsWith('card'))L.push({x:e.x,y:e.y,z:6,r:14,a:.7,c:'#c8a8ff',ca:.2});if(e.kind==='mob'&&e.D.ai==='lucia'&&!e.dead)L.push({x:e.x,y:e.y,z:16,r:22,a:.5,c:'#e8e0ff',ca:.08})}
 for(const z of G.hz)if(z.type==='fire')L.push({x:z.x,y:z.y,z:4,r:30,a:.9,c:'#7ab0ff',ca:.22});
 for(const p of G.shots)if(p.type==='holy'||p.type==='blood'||p.type==='cross')L.push({x:p.x,y:p.y,z:p.z||10,r:12,a:.7,c:p.type==='blood'?'#ff2030':'#a8d0ff',ca:.2});
 if(!lb){wg.globalAlpha=amb.a*.8;wg.fillStyle=amb.c;wg.fillRect(0,0,VW,VH);wg.globalAlpha=1;return}
 const g=lb.g;g.globalCompositeOperation='source-over';g.clearRect(0,0,lb.w,lb.h);g.globalAlpha=amb.a;g.fillStyle=amb.c;g.fillRect(0,0,lb.w,lb.h);g.globalAlpha=1;g.globalCompositeOperation='destination-out';
 for(const l of L){const p=scr(l.x,l.y,l.z);const cx=p[0]/2,cy=p[1]/2,r=l.r/2;if(cx<-r||cy<-r||cx>lb.w+r||cy>lb.h+r)continue;try{const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,'rgba(0,0,0,'+l.a+')');gr.addColorStop(.5,'rgba(0,0,0,'+(l.a*.62).toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2)}catch(_){}}
 g.globalCompositeOperation='source-over';wg.imageSmoothingEnabled=true;try{wg.drawImage(lb.c,0,0,lb.w,lb.h,0,0,lb.w*2,lb.h*2)}catch(_){}wg.imageSmoothingEnabled=false;
 wg.globalCompositeOperation='lighter';for(const l of L){if(!l.c||!l.ca)continue;const p=scr(l.x,l.y,l.z);const r=l.r*.8;if(p[0]<-r||p[1]<-r||p[0]>VW+r||p[1]>VH+r)continue;try{const gr=wg.createRadialGradient(p[0],p[1],0,p[0],p[1],r);const A=rgb(l.c);gr.addColorStop(0,'rgba('+A[0]+','+A[1]+','+A[2]+','+l.ca+')');gr.addColorStop(1,'rgba('+A[0]+','+A[1]+','+A[2]+',0)');wg.fillStyle=gr;wg.fillRect(p[0]-r,p[1]-r,r*2,r*2)}catch(_){}}wg.globalCompositeOperation='source-over'}
/* 안개, 비, 번개, 먼지 */
function fogCv(){return cached('fog',()=>{const cv=mkcv(64,28);if(!cv)return null;try{const gr=cv.g.createRadialGradient(32,14,2,32,14,30);gr.addColorStop(0,'rgba(200,200,220,.55)');gr.addColorStop(1,'rgba(200,200,220,0)');cv.g.fillStyle=gr;cv.g.save&&cv.g.save();cv.g.scale&&cv.g.scale(1,.45);cv.g.fillRect(0,0,64,62);cv.g.restore&&cv.g.restore()}catch(_){}return cv.c})}
function drawWeather(g,t){const m=G.m;const fog=m.def.fog||0;if(fog>0){const fc=fogCv();if(fc){if(IM.rs>1)hq(g);g.globalAlpha=fog*.55;for(let i=0;i<7;i++){const sp=6+i*2.5;const x=((hash(i,1,7)*400+t/1000*sp-G.cam.x*.7)%260+260)%260-70,y=((hash(i,2,7)*260-G.cam.y*.7)%240+240)%240-40;try{g.drawImage(fc,Math.round(x),Math.round(y),110,40)}catch(_){}}g.globalAlpha=1;g.imageSmoothingEnabled=false}}
 if(m.def.rain){g.fillStyle='rgba(170,190,230,.45)';for(let i=0;i<34;i++){const x=(hash(i,3,1)*VW+t*.05*(1+i%3))%VW,y=(hash(i,4,1)*VH+t*.32*(1+(i%4)*.2))%VH;g.fillRect(Math.round(x),Math.round(y),1,4)}
  if(!G.nextBolt)G.nextBolt=G.time+rand(5000,12000);if(G.time>G.nextBolt){G.nextBolt=G.time+rand(7000,15000);G.lightning=t;setTimeout0(()=>sfx('thunder'))}}
 if(m.def.dust){for(let i=0;i<10;i++){const x=(hash(i,5,2)*VW+Math.sin(t/2000+i)*10+VW)%VW,y=(hash(i,6,2)*VH+t*.004*(i+1))%VH;g.globalAlpha=.35;dot(g,'#c8b8a0',Math.round(x),Math.round(y),1,1);g.globalAlpha=1}}}
/* ---------- 화면 장식 ---------- */
function Tx(g,s,x,y,o){K.T(g,s,x,y,o)}
function panel(g,x,y,wd,ht,a){g.fillStyle='rgba(10,6,16,'+(a||.93)+')';g.fillRect(x,y,wd,ht);g.fillStyle='#8a6a2a';g.fillRect(x,y,wd,1);g.fillRect(x,y+ht-1,wd,1);g.fillRect(x,y,1,ht);g.fillRect(x+wd-1,y,1,ht);
 g.fillStyle='#5a1420';g.fillRect(x+2,y+2,wd-4,1);g.fillRect(x+2,y+ht-3,wd-4,1);g.fillRect(x+2,y+2,1,ht-4);g.fillRect(x+wd-3,y+2,1,ht-4);
 for(const [cx,cy] of [[x,y],[x+wd-1,y],[x,y+ht-1],[x+wd-1,y+ht-1]]){g.fillStyle='#d8b04a';g.fillRect(cx-1,cy,3,1);g.fillRect(cx,cy-1,1,3)}}
function bar(g,x,y,wd,ht,k,c1,c2){g.fillStyle='#0b0910';g.fillRect(x-1,y-1,wd+2,ht+2);g.fillStyle=c2;g.fillRect(x,y,wd,ht);g.fillStyle=c1;g.fillRect(x,y,Math.max(0,Math.round(wd*clamp(k,0,1))),ht);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y,Math.max(0,Math.round(wd*clamp(k,0,1))),1)}
function subIcon(g,x,y,k){g.fillStyle='#0b0910';g.fillRect(x,y,12,12);g.fillStyle='#2a2238';g.fillRect(x+1,y+1,10,10);
 if(k==='bow'){g.fillStyle='#8a5a34';g.fillRect(x+2,y+5,8,2);g.fillStyle='#c8d4e8';g.fillRect(x+5,y+2,1,8);g.fillRect(x+6,y+3,3,1)}else if(k==='holy'){g.fillStyle='#7ab8ff';g.fillRect(x+4,y+4,4,6);g.fillStyle='#e8f4ff';g.fillRect(x+5,y+2,2,2);g.fillRect(x+4,y+5,1,2)}
 else if(k==='cross'){g.fillStyle='#ffd860';g.fillRect(x+5,y+2,2,8);g.fillRect(x+3,y+4,6,2)}}
function frameBox(g,x,y,wd,ht){g.fillStyle='#0b0910';g.fillRect(x-1,y-1,wd+2,ht+2);g.fillStyle='#b08a30';g.fillRect(x-1,y-1,wd+2,1);g.fillRect(x-1,y+ht,wd+2,1)}
/* ---------- 머리 위 표시 (체력, 은, 우두머리, 안내) ---------- */
function drawHUD(g,t){const s=G.s,st=G.st||stats(),h=G.hero;
 bar(g,4,4,58,5,s.hp/st.hp,s.hp<st.hp*.25&&Math.floor(t/250)%2?'#ff7080':'#e83040','#4a0c14');Tx(g,Math.ceil(s.hp),65,9.5,{size:7.5,bold:true,color:'#ffd8d8',shadow:'#000'});
 bar(g,4,11,44,3,s.mp/st.mp,'#4a8aff','#14204a');
 if(s.flags.blood){const full=s.blood>=100;bar(g,4,16,44,3,s.blood/100,full&&Math.floor(t/200)%2?'#ff8090':'#d01030','#2a0008');if(full)Tx(g,'각성',51,20,{size:7,bold:true,color:Math.floor(t/300)%2?'#ff8090':'#ff3040',shadow:'#000'})}
 if(G.awakeT>G.time)bar(g,4,s.flags.blood?21:16,44,2,(G.awakeT-G.time)/12000,'#ffb0c0','#300010');
 subIcon(g,VW-31,3,s.sub);Tx(g,String(s.silver),VW-17,12.5,{size:9,bold:true,color:'#e0e8ff',shadow:'#000'});
 if(G.boss&&!G.boss.dead){const b=G.boss;bar(g,12,VH-9,126,4,Math.max(0,b.hp)/b.mhp,'#c01828','#2a0408');Tx(g,b.D.n,VW/2,VH-12.5,{size:8,bold:true,color:'#f0d8d8',align:'center',shadow:'#000'})}
 if(!G.sc&&!G.menu&&h.st!=='dead'){const it=findInteract();if(it){const lab=PROMPT[it.kind]||'살피기';const yy=G.boss?VH-30:VH-14;g.fillStyle='rgba(10,6,16,.85)';const wd=lab.length*9+22;g.fillRect(VW/2-wd/2,yy-9,wd,13);g.fillStyle=it.kind==='stake'?'#ff4050':'#b08a30';g.fillRect(VW/2-wd/2,yy-9,wd,1);Tx(g,'5 '+lab,VW/2,yy+1,{size:8.5,bold:true,color:it.kind==='stake'?'#ffb0b8':'#ffe8b0',align:'center'})}}
 if(h.hold&&h.hold.skill&&canAwaken()){const k=clamp((G.time-h.hold.skill)/430,0,1);const p=scr(h.x,h.y,0);g.fillStyle='#ff3040';for(let i=0;i<20*k;i++){const a=i/20*Math.PI*2-Math.PI/2;g.fillRect(Math.round(p[0]+Math.cos(a)*12),Math.round(p[1]-12+Math.sin(a)*12),2,2)}}
 for(const tx of G.txt){const p=scr(tx.x,tx.y,tx.z);const k=tx.t/900;g.globalAlpha=k>.7?(1-k)/.3:1;Tx(g,tx.txt,p[0],p[1]-k*14,{size:tx.big?10:8.5,bold:true,color:tx.c,align:'center',shadow:'#000'});g.globalAlpha=1}
 if(G.banner){const a=(G.time-G.banner.at);if(a<2600){const k=a<400?a/400:a>2000?(2600-a)/600:1;g.globalAlpha=Math.max(0,k);Tx(g,G.banner.t,VW/2,40,{size:11,bold:true,color:'#f0e0c0',align:'center',shadow:'#2a0008'});g.fillStyle='#b08a30';g.fillRect(VW/2-40,44,80,1);g.fillStyle='#5a1420';g.fillRect(VW/2-30,46,60,1);g.globalAlpha=1}}
 let ty=s.flags.blood?32:26;for(const tt of G.toasts.slice(-3)){const a=G.time-tt.at,dur=tt.dur||2600;const k=a>dur-400?(dur-a)/400:1;g.globalAlpha=Math.max(0,Math.min(1,k));const lines=K.wrap(g,tt.t,132,8,true);const hh=lines.length*10+4;g.fillStyle='rgba(8,4,12,.82)';g.fillRect(8,ty,134,hh);lines.forEach((ln,i)=>Tx(g,ln,VW/2,ty+9+i*10,{size:8,bold:true,color:tt.c||'#fff',align:'center'}));ty+=hh+2;g.globalAlpha=1}
 if(s.opt.arrow&&!G.sc&&!G.boss)drawArrow(g,t)}
function drawArrow(g,t){const ms=mainStep(G.s);if(!ms.map)return;let tx,ty;if(ms.map===G.m.id){tx=ms.x+.5;ty=ms.y+.5}else{const l=routeTo(G.m.id,ms.map);if(!l)return;tx=l.x+.5;ty=l.y+.5}
 const h=G.hero;if(Math.hypot(tx-h.x,ty-h.y)<2.2)return;const p=scr(tx,ty,0),hp=scr(h.x,h.y,0);const dx=p[0]-hp[0],dy=p[1]-hp[1],n=Math.hypot(dx,dy)||1;const ux=dx/n,uy=dy/n;
 const inside=p[0]>10&&p[0]<VW-10&&p[1]>24&&p[1]<VH-20;let ax,ay;if(inside){ax=p[0];ay=p[1]-26+Math.sin(t/200)*2}else{const R=Math.min((VW/2-12)/Math.abs(ux||1e-6),(VH/2-22)/Math.abs(uy||1e-6));ax=VW/2+ux*R;ay=VH/2+uy*R}
 const a=inside?Math.PI/2:Math.atan2(uy,ux);const c=Math.cos(a),sn=Math.sin(a);const P=(x,y)=>[ax+x*c-y*sn,ay+x*sn+y*c];g.globalAlpha=.85;fillPoly(g,[P(6,0),P(-4,-5),P(-1,0),P(-4,5)],'#0b0910');fillPoly(g,[P(5,0),P(-3,-4),P(-1,0),P(-3,4)],Math.floor(t/400)%2?'#ffd860':'#e8b040');g.globalAlpha=1}
/* ---------- 대화 상자 ---------- */
function dlgLines(g,D,wd){if(!D.lines||D.lw!==wd){D.lines=K.wrap(g,D.text,wd,9,false);D.lw=wd;D.page=D.page||0}return D.lines}
function dlgTick(){}
function drawDialog(g,t){const D=G.dlg||G.ask;if(!D)return;const x=2,y=VH-58,wd=146,ht=56;const f=D.who?(FACE_OF[D.who]||D.who):null;panel(g,x,y,wd,ht,.95);
 if(f&&FACE[f]){const fi=IM.use?faceImg(D.who==='m2'?'villagerW':f,Math.round(22*IM.ds),Math.round(24*IM.ds)):null;frameBox(g,x+5,y+6,22,24);if(fi){try{hq(g);g.drawImage(fi.c,x+5,y+6,22,24)}catch(_){}g.imageSmoothingEnabled=false}else{const sp=sprite('face',f,0,{});if(sp)try{g.imageSmoothingEnabled=false;g.drawImage(sp.c,x+5,y+6)}catch(_){}}}
 if(D.who){const nm=NAME[D.who]||D.who;const nw=nm.length*8.5+10;g.fillStyle='#2a0c14';g.fillRect(x+4,y-10,nw,11);g.fillStyle='#b08a30';g.fillRect(x+4,y-10,nw,1);Tx(g,nm,x+9,y-1.5,{size:8,bold:true,color:'#ffe0a0'})}
 const tx=f&&FACE[f]?x+31:x+7,tw=f&&FACE[f]?wd-36:wd-14;const lines=dlgLines(g,D,tw);
 if(G.dlg){const per=3,pg=D.page||0,L=lines.slice(pg*per,pg*per+per);let left=Math.floor((G.now-D.t0)/22);const shownAll=left>=L.join('').length;D.done=shownAll;
  L.forEach((ln,i)=>{const part=left>=ln.length?ln:ln.slice(0,Math.max(0,left));left-=ln.length;Tx(g,part,tx,y+14+i*13,{size:9,color:D.who?'#f2eee4':'#d8d0f0'})});
  if(shownAll&&Math.floor(G.now/350)%2)fillPoly(g,[[x+wd-12,y+ht-10],[x+wd-6,y+ht-10],[x+wd-9,y+ht-6]],'#d8b04a');if(lines.length>per)Tx(g,(pg+1)+'/'+Math.ceil(lines.length/per),x+wd-16,y+ht-4,{size:7,color:'#8a7a6a',align:'right'})}
 else{lines.slice(0,3).forEach((ln,i)=>Tx(g,ln,tx,y+14+i*13,{size:9,color:'#f2eee4'}));const A=G.ask,n=A.opts.length;let ow=0;g.font=K.fnt(9,true);for(const o of A.opts)ow=Math.max(ow,g.measureText(o[0]).width);ow=Math.min(140,Math.ceil(ow)+22);const oh=n*14+8,ox=VW-ow-3,oy=y-oh-12;panel(g,ox,oy,ow,oh,.96);
  A.opts.forEach((o,i)=>{const yy=oy+5+i*14;if(i===A.sel){g.fillStyle='#5a1420';g.fillRect(ox+3,yy,ow-6,13);Tx(g,'▶',ox+6,yy+10,{size:8,color:'#ffd860'})}Tx(g,K.fit(g,o[0],ow-20,9,true),ox+16,yy+10,{size:9,bold:i===A.sel,color:i===A.sel?'#fff4d0':'#c8c0d0'})})}}
function dlgKey(id){const D=G.dlg;if(id==='ok'||id==='5'||id==='clr'||id==='send'||id==='0'){const lines=D.lines||[];const per=3,pg=D.page||0;const L=lines.slice(pg*per,pg*per+per).join('');if(Math.floor((G.now-D.t0)/22)<L.length){D.t0=-1e9;return}
  if((pg+1)*per<lines.length){D.page=pg+1;D.t0=G.now;sfx('talk');return}G.dlg=null;sfx('tick')}}
function askKey(id){const A=G.ask,n=A.opts.length;if(id==='up'||id==='8'||id==='left'||id==='4'){A.sel=(A.sel+n-1)%n;sfx('cursor');return}if(id==='down'||id==='2'||id==='right'||id==='6'){A.sel=(A.sel+1)%n;sfx('cursor');return}
 if(id==='ok'||id==='5'){const o=A.opts[A.sel];G.ask=null;sfx('ok');if(o&&o[1]&&o[1].length)runScript(o[1]);return}
 if(id==='clr'){const o=A.opts[n-1];G.ask=null;sfx('back');if(o&&o[1]&&o[1].length&&/그만|그냥|아니/.test(o[0]))runScript(o[1])}}
/* ---------- 전보와 일기 ---------- */
function drawTele(g,t){const T2=G.tele;if(!T2)return;g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,VW,VH);const x=8,y=26,wd=134,ht=124;
 if(T2.page!=null){g.fillStyle='#d8c8a0';g.fillRect(x,y,wd,ht);g.fillStyle='#b8a478';for(let i=0;i<9;i++)g.fillRect(x+4,y+30+i*11,wd-8,1);g.fillStyle='#8a6a40';g.fillRect(x,y,wd,1);g.fillRect(x,y+ht-1,wd,1);
  Tx(g,'아버지의 일기 '+(T2.page+1)+'/3',x+wd/2,y+14,{size:9,bold:true,color:'#4a2a10',align:'center'});const L=K.wrap(g,PAGES[T2.page],wd-14,8.5,false);L.slice(0,9).forEach((ln,i)=>Tx(g,ln,x+7,y+28+i*11,{size:8.5,color:'#3a2008'}))}
 else{g.fillStyle='#ece2c8';g.fillRect(x,y,wd,ht);g.fillStyle='#a01f2e';g.fillRect(x,y,wd,14);Tx(g,'전 보   TELEGRAM',x+wd/2,y+10,{size:8.5,bold:true,color:'#fff4e0',align:'center'});Tx(g,'런던 → 비스트리차',x+6,y+25,{size:7.5,color:'#6a5a3a'});Tx(g,'성 미카엘 기사회',x+wd-6,y+25,{size:7.5,color:'#6a5a3a',align:'right'});
  const L=K.wrap(g,TELE[T2.id]||'',wd-14,8.5,false);L.slice(0,8).forEach((ln,i)=>Tx(g,ln,x+7,y+40+i*11,{size:8.5,color:'#2a2018'}));g.strokeStyle&&(g.strokeStyle='#a01f2e')}
 if(Math.floor(G.now/400)%2)Tx(g,'5 확인',VW/2,y+ht+12,{size:8,color:'#e8d8b0',align:'center',shadow:'#000'})}
/* ---------- 장 표지 ---------- */
function drawCard(g,t){const C=G.card;const a=Math.min(1,(G.now-(C.t0||G.now))/600);if(C.t0==null)C.t0=G.now;g.globalAlpha=a;g.fillStyle='#050208';g.fillRect(0,0,VW,VH);
 g.fillStyle='#5a1420';g.fillRect(20,70,110,1);g.fillRect(20,112,110,1);g.fillStyle='#b08a30';g.fillRect(40,72,70,1);g.fillRect(40,110,70,1);
 const L=K.wrap(g,C.t,136,11,true);L.forEach((ln,i)=>Tx(g,ln,VW/2,88+i*14,{size:11,bold:true,color:'#f0e0c0',align:'center'}));const L2=K.wrap(g,C.sub||'',130,8,false);L2.forEach((ln,i)=>Tx(g,ln,VW/2,128+i*11,{size:8,color:'#b8a8c8',align:'center'}));
 if(G.now-C.t0>1500&&Math.floor(G.now/450)%2)Tx(g,'5 키를 누르세요',VW/2,VH-14,{size:8,color:'#8a7a9a',align:'center'});g.globalAlpha=1}
/* ---------- 멈춤 차림표 ---------- */
const PAUSE=[['quick','물약 쓰기'],['sub','보조 무기'],['equip','장비'],['bag','가방'],['skill','기술'],['quest','전보 (할 일)'],['map','지도'],['book','도감과 수집'],['opt','설정'],['quit','제목으로']];
function openPause(){if(G.mode!=='play'||G.sc||G.menu)return;G.menu={sub:null,sel:0,sub2:0,scroll:0};sfx('menu');G.keys={}}
function closePause(){G.menu=null;sfx('back');G.last=0}
function consumables(){const s=G.s;return Object.keys(s.inv).filter(k=>ITEM[k]&&!ITEM[k].key&&s.inv[k]>0)}
function useItem(k){const s=G.s,st=G.st||stats(),I2=ITEM[k];if(!I2||!s.inv[k])return false;if(I2.hp&&s.hp>=st.hp&&!I2.mp&&!I2.silver){G.toasts.push({t:'체력이 가득하다',at:G.time,c:'#c8c8d8'});return false}
 if(I2.mp&&!I2.hp&&s.mp>=st.mp){G.toasts.push({t:'성력이 가득하다',at:G.time,c:'#c8c8d8'});return false}
 s.inv[k]--;if(!s.inv[k])delete s.inv[k];if(I2.hp)s.hp=Math.min(st.hp,s.hp+I2.hp);if(I2.mp)s.mp=Math.min(st.mp,s.mp+I2.mp);if(I2.silver)s.silver=Math.min(st.smax,s.silver+I2.silver);sfx('heal');
 const h=G.hero;for(let i=0;i<8;i++)addFx('spark',h.x+rand(-.3,.3),h.y+rand(-.3,.3),rand(0,10),{vz:rand(15,30),life:600,c:I2.mp&&!I2.hp?'#8ab0ff':'#9af0a0'});return true}
function menuItems(){const M=G.menu,s=G.s;switch(M.sub){
 case null:return PAUSE.map(p=>({k:p[0],label:p[1],sub:p[0]==='quick'?(consumables().length?consumables().map(k=>ITEM[k].n+'×'+s.inv[k]).slice(0,1).join(''):'없음'):p[0]==='sub'?SUB[s.sub].n:p[0]==='skill'&&s.sp?'점수 '+s.sp:''}));
 case 'quick':case 'bag':{const L=consumables().map(k=>({k,label:ITEM[k].n,sub:'×'+s.inv[k],d:ITEM[k].d,use:1}));if(M.sub==='bag')for(const k of Object.keys(s.inv))if(ITEM[k]&&ITEM[k].key&&s.inv[k]>0)L.push({k,label:ITEM[k].n,sub:s.inv[k]>1?'×'+s.inv[k]:'',d:ITEM[k].d,key:1});return L}
 case 'sub':return s.subs.map(k=>({k,label:SUB[k].n,sub:'은 '+SUB[k].cost,d:SUB[k].d,on:s.sub===k}));
 case 'equip':{if(M.slot==null){const W=WEAPON[s.wpn];return[{k:'wpn',label:'무기',sub:W.n+((s.wlv[s.wpn]||0)?' +'+s.wlv[s.wpn]:''),d:W.d},{k:'coat',label:'외투',sub:COAT[s.coat].n,d:COAT[s.coat].d},{k:'r0',label:'장신구 1',sub:s.rel[0]?RELIC[s.rel[0]].n:'(비어 있음)',d:s.rel[0]?RELIC[s.rel[0]].d:''},{k:'r1',label:'장신구 2',sub:s.rel[1]?RELIC[s.rel[1]].n:'(비어 있음)',d:s.rel[1]?RELIC[s.rel[1]].d:''}]}
  if(M.slot==='wpn')return s.wpns.map(k=>({k,label:WEAPON[k].n+((s.wlv[k]||0)?' +'+s.wlv[k]:''),sub:'공격 '+(WEAPON[k].atk+(s.wlv[k]||0)*2),d:WEAPON[k].d,on:s.wpn===k}));
  if(M.slot==='coat')return s.coats.map(k=>({k,label:COAT[k].n,sub:'방어 '+COAT[k].def,d:COAT[k].d,on:s.coat===k}));
  const idx=M.slot==='r0'?0:1;return[{k:'',label:'(빼기)',sub:'',d:''}].concat(s.relics.map(k=>({k,label:RELIC[k].n,sub:s.rel[idx]===k?'착용':s.rel.includes(k)?'다른 칸':'',d:RELIC[k].d,on:s.rel[idx]===k})))}
 case 'skill':return Object.keys(SKILL).map(k=>{const S=SKILL[k],has=!!s.skills[k];return{k,label:(has?'● ':'○ ')+S.n,sub:has?(S.act?(s.skill===k?'# 쓰는 중':'고르기'):'익힘'):(S.need&&!s.skills[S.need]?'잠김':'점수 '+S.sp),d:'['+TREE_NAME[S.tree]+'] '+S.d+(S.act?' (성력 '+S.mp+')':'')+(S.need&&!has?' 먼저: '+SKILL[S.need].n:''),has}});
 case 'quest':{const ms=mainStep(s);const L=[{k:'main',label:'★ '+ms.t,d:ms.d}];for(const q of sideList(s))L.push({k:'side',label:(q.done?'✓ ':'· ')+q.t,d:q.d,dim:q.done});for(const id of s.tele.slice().reverse())L.push({k:'tele',id,label:'전보 · 미나',d:TELE[id]});return L}
 case 'book':{const L=BEST_ORDER.map(k=>{const n=s.kills[k]||0;return{k,label:n?ENEMY[k].n:'???',sub:n?n+'마리':'',d:n?ENEMY[k].lore:'아직 만나지 못했다.',mon:n?k:null}});L.push({k:'cards',label:'타로 카드 '+s.cards.length+'/4',d:Object.keys(TAROT).map(c=>(s.cards.includes(c)?TAROT[c].n+' ('+TAROT[c].d+')':'??? ('+TAROT[c].where+')')).join('  ')});
  s.pages.slice().sort().forEach(i=>L.push({k:'page',i,label:'아버지의 일기 '+(i+1)+'쪽',d:PAGES[i]}));return L}
 case 'opt':{const o=s.opt;return[{k:'music',label:'배경 음악',sub:o.music?'켬':'끔'},{k:'sfx',label:'효과음',sub:o.sfx?'켬':'끔'},{k:'shake',label:'화면 흔들림',sub:o.shake?'켬':'끔'},{k:'arrow',label:'목표 화살표',sub:o.arrow?'켬':'끔'},{k:'vib',label:'때릴 때 떨림',sub:o.vib?'켬':'끔'},{k:'blood',label:'피 색깔',sub:o.blood==='red'?'빨강':'초록 (청소년)'},{k:'diff',label:'어려움',sub:DIFF[s.diff].n},{k:'art',label:'그림',sub:artOn()?'새 그림':'도트 그림'}]}
 case 'quit':return[{k:'yes',label:'기록하고 제목으로'},{k:'no',label:'돌아가기'}]}return[]}
function menuKey(id){const M=G.menu,s=G.s,L=menuItems(),n=L.length;
 if(id==='menu'){closePause();return}
 if(M.sub==='map'){if(id==='clr'||id==='ok'||id==='5'){M.sub=null;sfx('back')}return}
 if(M.view){if(id==='clr'||id==='ok'||id==='5'){M.view=null;sfx('back')}return}
 if(id==='up'||id==='8'){if(n){M.sel=(M.sel+n-1)%n;sfx('cursor')}return}if(id==='down'||id==='2'){if(n){M.sel=(M.sel+1)%n;sfx('cursor')}return}
 if(id==='clr'||id==='left'&&M.sub!=='opt'){if(M.sub==='equip'&&M.slot!=null){M.slot=null;M.sel=M.slotSel||0;sfx('back');return}if(M.sub){M.sel=PAUSE.findIndex(p=>p[0]===M.sub);M.sub=null;sfx('back');return}closePause();return}
 if(!(id==='ok'||id==='5'||id==='right'||id==='6'))return;const it=L[M.sel];if(!it)return;sfx('ok');
 switch(M.sub){
  case null:if(it.k==='map'){M.sub='map';return}M.sub=it.k;M.sel=0;M.slot=null;return;
  case 'quick':case 'bag':if(it.use){useItem(it.k);M.sel=Math.min(M.sel,Math.max(0,menuItems().length-1))}else M.view=it;return;
  case 'sub':s.sub=it.k;G.toasts.push({t:'보조 무기: '+SUB[it.k].n,at:G.time,c:'#ffd890'});return;
  case 'equip':if(M.slot==null){M.slot=it.k;M.slotSel=M.sel;M.sel=0;return}
   if(M.slot==='wpn')s.wpn=it.k;else if(M.slot==='coat')s.coat=it.k;else{const idx=M.slot==='r0'?0:1;if(it.k&&s.rel[1-idx]===it.k)s.rel[1-idx]='';s.rel[idx]=it.k}G.st=stats();s.hp=Math.min(s.hp,G.st.hp);s.mp=Math.min(s.mp,G.st.mp);M.slot=null;M.sel=M.slotSel||0;sfx('equip');return;
  case 'skill':{const S=SKILL[it.k];if(s.skills[it.k]){if(S.act){s.skill=it.k;G.toasts.push({t:'# 기술: '+S.n,at:G.time,c:'#ffd890'})}return}
   if(S.need&&!s.skills[S.need]){G.toasts.push({t:'먼저 「'+SKILL[S.need].n+'」을(를) 익혀야 한다',at:G.time,c:'#c8c8d8'});sfx('deny');return}if(s.sp<S.sp){G.toasts.push({t:'기술 점수가 모자라다 (레벨을 올리자)',at:G.time,c:'#c8c8d8'});sfx('deny');return}
   s.sp-=S.sp;s.skills[it.k]=1;if(S.act&&!s.skill)s.skill=it.k;G.st=stats();sfx('levelup');G.toasts.push({t:'「'+S.n+'」을(를) 익혔다!',at:G.time,c:'#ffe070'});return}
  case 'quest':case 'book':M.view=it;return;
  case 'opt':{const o=s.opt;if(it.k==='blood')o.blood=o.blood==='red'?'green':'red';else if(it.k==='diff'){const D=['easy','normal','hard'];s.diff=D[(D.indexOf(s.diff)+1)%3]}else if(it.k==='art'){setArtPref(artOn()?'dot':'new');imgLoad()}else o[it.k]=o[it.k]?0:1;if(it.k==='music')playMusic(o.music?curMusic():null,true);return}
  case 'quit':if(it.k==='yes'){writeSave('manual');G.menu=null;goTitle()}else{M.sub=null;M.sel=PAUSE.length-1}return}}
function drawMenu(g,t){const M=G.menu,s=G.s,st=G.st||stats();g.fillStyle='rgba(4,2,8,.72)';g.fillRect(0,0,VW,VH);
 if(M.sub==='map'){drawMap(g,t);return}
 panel(g,3,3,144,178,.95);const title=M.sub?({quick:'물약 쓰기',sub:'보조 무기',equip:M.slot?'장비 고르기':'장비',bag:'가방',skill:'기술 (점수 '+s.sp+')',quest:'전보',book:'도감과 수집',opt:'설정',quit:'제목으로'}[M.sub]):'멈춤';
 Tx(g,title,VW/2,16,{size:10,bold:true,color:'#f0e0c0',align:'center'});g.fillStyle='#5a1420';g.fillRect(14,20,122,1);
 if(!M.sub){Tx(g,'아벨 반 헬싱',10,32,{size:8.5,bold:true,color:'#e0d8f0'});Tx(g,'레벨 '+s.lv,140,32,{size:8.5,bold:true,color:'#ffe070',align:'right'});
  bar(g,10,37,78,4,s.exp/expNeed(s.lv),'#d8b04a','#2a2010');Tx(g,'다음 '+(expNeed(s.lv)-s.exp),140,42,{size:7,color:'#a89878',align:'right'});
  Tx(g,'체력 '+Math.ceil(s.hp)+'/'+st.hp+'  성력 '+Math.floor(s.mp)+'/'+st.mp,10,52,{size:7.5,color:'#d8c8c8'});Tx(g,'공격 '+Math.round(st.atk)+'  방어 '+Math.round(st.def)+'  금화 '+won(s.gold)+'  은 '+s.silver,10,62,{size:7.5,color:'#d8c8c8'})}
 const L=menuItems();const top=M.sub?26:68,lh=M.sub==='quest'||M.sub==='book'?13:12.5,max=Math.floor((M.sub?150:112)/lh);if(M.sel<M.scroll)M.scroll=M.sel;if(M.sel>=M.scroll+max)M.scroll=M.sel-max+1;
 L.slice(M.scroll,M.scroll+max).forEach((it,j)=>{const i=j+M.scroll,yy=top+j*lh;if(i===M.sel){g.fillStyle='#4a1020';g.fillRect(7,yy,136,lh-1);Tx(g,'▶',10,yy+9,{size:7.5,color:'#ffd860'})}
  Tx(g,K.fit(g,it.label,it.sub?82:120,8.5,i===M.sel),19,yy+9,{size:8.5,bold:i===M.sel,color:it.dim?'#7a7488':it.on?'#ffe8a0':i===M.sel?'#fff4d0':'#c8c0d4'});if(it.sub)Tx(g,K.fit(g,it.sub,54,7.5,false),141,yy+9,{size:7.5,color:it.on?'#ffd860':'#9a90a8',align:'right'})});
 if(L.length>max){g.fillStyle='#5a4a6a';g.fillRect(144,top,1,max*lh);g.fillStyle='#d8b04a';g.fillRect(144,top+Math.round(M.scroll/L.length*max*lh),1,Math.max(4,Math.round(max/L.length*max*lh)))}
 const cur=L[M.sel];if(M.sub&&cur&&cur.d&&!M.view&&M.sub!=='quest'&&M.sub!=='book'){const lines=K.wrap(g,cur.d,128,7.5,false).slice(0,3);g.fillStyle='rgba(30,14,30,.95)';g.fillRect(7,VH-12-lines.length*10,136,lines.length*10+6);lines.forEach((ln,i)=>Tx(g,ln,11,VH-4-(lines.length-i)*10+2,{size:7.5,color:'#d8c8e0'}))}
 if(M.view)drawView(g,M.view);
 Tx(g,M.sub?'5 고르기 · 취소 뒤로':'5 고르기 · 메뉴 닫기',VW/2,VH-1,{size:6.5,color:'#6a6078',align:'center'})}
function drawView(g,it){panel(g,8,30,134,128,.98);let y=44;if(it.mon){const sp=sprite('mon',ENEMY[it.mon].set,0,{remap:ENEMY[it.mon].remap});if(sp){const sc=sp.hi?Math.min(2,40/Math.max(sp.w,sp.h)):sp.w>24?1:2;try{if(sp.hi)hq(g);else g.imageSmoothingEnabled=false;g.drawImage(sp.c,VW/2-sp.w*sc/2,y-6,sp.w*sc,sp.h*sc);g.imageSmoothingEnabled=false}catch(_){}y+=sp.h*sc}
  const D=ENEMY[it.mon];Tx(g,'체력 '+D.hp+'  공격 '+D.atk+'  '+(D.tags.includes('vampire')?'흡혈귀':D.tags.includes('undead')?'언데드':'짐승'),VW/2,y+4,{size:7.5,color:'#ffd860',align:'center'});y+=12}
 Tx(g,it.label.replace(/^[★·✓] /,''),VW/2,y,{size:9,bold:true,color:'#f0e0c0',align:'center'});y+=8;K.wrap(g,it.d||'',122,8,false).slice(0,Math.floor((150-y)/10)).forEach((ln,i)=>Tx(g,ln,14,y+10+i*10,{size:8,color:'#d8d0e0'}))}
/* 지도: 가 본 칸만 마름모로 */
function drawMap(g,t){const m=G.m,s=G.s;panel(g,3,3,144,178,.96);Tx(g,m.def.n,VW/2,16,{size:9.5,bold:true,color:'#f0e0c0',align:'center'});
 const sc=Math.min(130/(m.w+m.h),2.4),ox=VW/2+(m.h-m.w)*sc/2,oy=96-(m.w+m.h)*sc/4;const ms=mainStep(s);const eye=(G.st||stats()).eye;
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;if(!m.ex[i])continue;const px=ox+(x-y)*sc,py=oy+(x+y)*sc/2;const c=m.cube[i]?'#6a5a7a':m.solid[i]===3?'#24406a':m.solid[i]?'#3a5a3a':'#3a3446';g.fillStyle=c;g.fillRect(Math.round(px),Math.round(py),Math.ceil(sc),Math.ceil(sc/2)||1)}
 for(const e of G.ents){if(e.kind==='npc'){const px=ox+(e.x-e.y)*sc,py=oy+(e.x+e.y)*sc/2;dot(g,'#80e0ff',Math.round(px),Math.round(py),2,2)}if(eye&&e.kind==='chest'&&!e.open){const px=ox+(e.x-e.y)*sc,py=oy+(e.x+e.y)*sc/2;dot(g,'#ffd040',Math.round(px),Math.round(py),2,2)}}
 for(const ex of m.def.exits||[])if(ex.to){const x=ex.x!=null?ex.x:ex.x0,y=ex.y!=null?ex.y:ex.y0;if(!m.ex[y*m.w+x])continue;const px=ox+(x-y)*sc,py=oy+(x+y)*sc/2;dot(g,'#e0b060',Math.round(px)-1,Math.round(py)-1,3,3)}
 if(ms.map===m.id&&Math.floor(t/300)%2){const px=ox+(ms.x-ms.y)*sc,py=oy+(ms.x+ms.y)*sc/2;dot(g,'#ff4050',Math.round(px)-1,Math.round(py)-1,4,4)}
 const h=G.hero,px=ox+(h.x-h.y)*sc,py=oy+(h.x+h.y)*sc/2;if(Math.floor(t/200)%2)dot(g,'#ffffff',Math.round(px)-1,Math.round(py)-1,3,3);
 Tx(g,'흰 점: 나  빨강: 목표  노랑: 출구',VW/2,VH-20,{size:7,color:'#a898b8',align:'center'});Tx(g,ms.t,VW/2,VH-9,{size:8,bold:true,color:'#ffe8a0',align:'center'})}
/* ---------- 가게 ---------- */
const SHOPS={inn:{n:'황금 왕관 여관',items:['herb','wine','silver','jerky']},church:{n:'성 니콜라오 성당',items:['prayer','herb','silver']},smith:{n:'미클로시 대장간',items:['coat:leather','coat:priest','coat:silk','relic:boots','relic:iron','silver']},
 forest:{n:'그레고르의 모닥불',items:['herb','jerky','silver']},rada:{n:'라다의 천막',items:['relic:garlic','wine','prayer']},clinic:{n:'에밀의 진료소',items:['herb','wine']},clinic2:{n:'에밀의 진료소',items:['herb','tonic','wine']}};
function shopEntry(code){const [a,b]=code.split(':');const s=G.s;if(b==null){const I2=ITEM[a];return{code,n:I2.n,price:I2.price,d:I2.d,own:s.inv[a]||0,kind:'item',k:a}}if(a==='coat')return{code,n:COAT[b].n,price:COAT[b].price,d:COAT[b].d+' (방어 '+COAT[b].def+')',own:s.coats.includes(b)?1:0,kind:'coat',k:b,once:1};
 return{code,n:RELIC[b].n,price:RELIC[b].price,d:RELIC[b].d,own:s.relics.includes(b)?1:0,kind:'relic',k:b,once:1}}
function openShop(id){const S=SHOPS[id];if(!S)return;G.shop={id,sel:0,tab:0,msg:'',at:G.now};sfx('menu')}
function shopList(){const S=G.shop;if(S.tab===0)return SHOPS[S.id].items.map(shopEntry);return consumables().map(k=>({code:k,n:ITEM[k].n,price:Math.floor((ITEM[k].price||10)/2),d:ITEM[k].d,own:G.s.inv[k],kind:'sell',k}))}
function shopKey(id){const S=G.shop,s=G.s,L=shopList(),n=L.length;
 if(id==='clr'||id==='menu'){G.shop=null;sfx('back');return}if(id==='left'||id==='right'||id==='4'||id==='6'){S.tab=1-S.tab;S.sel=0;sfx('cursor');return}
 if(id==='up'||id==='8'){if(n)S.sel=(S.sel+n-1)%n;sfx('cursor');return}if(id==='down'||id==='2'){if(n)S.sel=(S.sel+1)%n;sfx('cursor');return}
 if(id!=='ok'&&id!=='5')return;const it=L[S.sel];if(!it)return;
 if(it.kind==='sell'){s.inv[it.k]--;if(!s.inv[it.k])delete s.inv[it.k];s.gold+=it.price;S.msg=it.n+' 을(를) 팔았다';S.at=G.now;sfx('coin');S.sel=Math.min(S.sel,Math.max(0,shopList().length-1));return}
 if(it.once&&it.own){S.msg='이미 가지고 있다';S.at=G.now;sfx('deny');return}if(s.gold<it.price){S.msg='금화가 모자라다';S.at=G.now;sfx('deny');return}
 s.gold-=it.price;if(it.kind==='item'){const I2=ITEM[it.k];if(I2.silver&&!s.inv.silver){}s.inv[it.k]=(s.inv[it.k]||0)+1}else if(it.kind==='coat'){s.coats.push(it.k)}else{s.relics.push(it.k);const e=s.rel.indexOf('');if(e>=0)s.rel[e]=it.k}
 G.st=stats();S.msg=it.n+' 을(를) 샀다'+(it.kind==='coat'?' (장비에서 입자)':'');S.at=G.now;sfx('coin')}
function drawShop(g,t){const S=G.shop,s=G.s;g.fillStyle='rgba(4,2,8,.7)';g.fillRect(0,0,VW,VH);panel(g,3,8,144,170,.96);Tx(g,SHOPS[S.id].n,VW/2,21,{size:9.5,bold:true,color:'#f0e0c0',align:'center'});
 ['사기','팔기'].forEach((tb,i)=>{const x=26+i*62;g.fillStyle=S.tab===i?'#5a1420':'#1e1424';g.fillRect(x,26,46,12);Tx(g,tb,x+23,35,{size:8,bold:S.tab===i,color:S.tab===i?'#ffe8b0':'#8a809a',align:'center'})});
 const L=shopList();L.forEach((it,i)=>{const y=42+i*14;if(i===S.sel){g.fillStyle='#4a1020';g.fillRect(7,y,136,13)}Tx(g,K.fit(g,it.n,80,8.5,i===S.sel),12,y+10,{size:8.5,bold:i===S.sel,color:it.once&&it.own?'#7a7488':'#e8e0f0'});Tx(g,it.once&&it.own?'가짐':won(it.price)+(S.tab===1?'':' 금'),140,y+10,{size:8,color:'#ffd860',align:'right'})});
 if(!L.length)Tx(g,S.tab===1?'팔 물건이 없다':'',VW/2,70,{size:8.5,color:'#8a809a',align:'center'});
 const cur=L[S.sel];if(cur){const lines=K.wrap(g,cur.d+(cur.kind==='item'?' (가진 것 '+cur.own+')':''),130,7.5,false).slice(0,3);lines.forEach((ln,i)=>Tx(g,ln,10,140+i*10,{size:7.5,color:'#c8b8d8'}))}
 Tx(g,'금화 '+won(s.gold),140,172,{size:8.5,bold:true,color:'#ffd860',align:'right'});if(S.msg&&G.now-S.at<1800)Tx(g,S.msg,10,172,{size:7.5,color:'#9af0a0'});else Tx(g,'좌우 바꾸기 · 취소 나가기',10,172,{size:6.8,color:'#6a6078'})}
/* ---------- 제목 화면 ---------- */
const TITLE_MENU=['새로 하기','이어 하기','조작법','끝내기'];
function drawTitleArt(g,t,dark){if(artOn()&&imgOk('title')&&titleImg(g,t,dark))return;const cv=G.tb||(G.tb=mkcv(VW,VH));const tg=cv?cv.g:g;tg.imageSmoothingEnabled=false;
 try{const gr=tg.createLinearGradient(0,0,0,VH);gr.addColorStop(0,'#05020a');gr.addColorStop(.55,'#2a0a2a');gr.addColorStop(1,'#0a0410');tg.fillStyle=gr}catch(_){tg.fillStyle='#14061a'}tg.fillRect(0,0,VW,VH);
 for(let i=0;i<40;i++){const x=Math.floor(hash(i,1,9)*VW),y=Math.floor(hash(i,2,9)*110);if(Math.floor(t/400+i)%7)dot(tg,hash(i,3,9)<.3?'#ffffff':'#8a80b0',x,y,1,1)}
 const mx=104,my=46;tg.fillStyle='rgba(255,220,220,.06)';fillPoly(tg,ring(mx,my,34),'rgba(255,200,200,.06)');fillPoly(tg,ring(mx,my,26),'rgba(255,200,200,.08)');fillPoly(tg,ring(mx,my,20),'#f4e8e0');fillPoly(tg,ring(mx+5,my-2,17),'#fbf4ec');dot(tg,'#e0d0c8',mx-8,my-4,5,3);dot(tg,'#e0d0c8',mx+4,my+6,4,3);dot(tg,'#e0d0c8',mx+8,my-8,3,2);
 const cx2=Math.round((t/90)%220)-40;tg.globalAlpha=.55;tg.fillStyle='#1a0a20';tg.fillRect(cx2,40,46,4);tg.fillRect(cx2+8,37,30,4);tg.fillRect(cx2+60,58,36,3);tg.globalAlpha=1;
 /* 절벽 위의 성 */
 const col='#0a0310';tg.fillStyle=col;fillPoly(tg,[[0,124],[30,106],[52,98],[70,100],[96,86],[118,90],[150,80],[150,184],[0,184]],col);
 tg.fillRect(78,62,30,30);tg.fillRect(74,50,8,42);tg.fillRect(104,44,9,48);tg.fillRect(89,56,8,12);fillPoly(tg,[[73,50],[78,38],[83,50]],col);fillPoly(tg,[[103,44],[108.5,28],[114,44]],col);fillPoly(tg,[[88,56],[93,47],[98,56]],col);
 for(const [wx,wy] of [[77,58],[107,52],[108,62],[84,74],[95,70]])if(Math.floor(t/900+wx)%4)dot(tg,'#ff5a30',wx,wy,1,2);
 if(Math.floor(t/4300)%3===0&&(t%4300)<180){tg.globalAlpha=.5;tg.fillStyle='#e0e8ff';tg.fillRect(0,0,VW,VH);tg.globalAlpha=1;line(tg,40,0,34,20,'#ffffff');line(tg,34,20,42,34,'#ffffff');line(tg,42,34,38,52,'#ffffff')}
 for(let i=0;i<5;i++){const k=((t/7000+i*.21)%1);const bx=Math.round(-10+k*(VW+20)),by=Math.round(30+i*9+Math.sin(k*9+i)*6),f=Math.floor(t/110+i)%2;dot(tg,'#000',bx,by,3,1);dot(tg,'#000',bx-2,by-(f?1:-1),2,1);dot(tg,'#000',bx+3,by-(f?1:-1),2,1)}
 /* 사냥꾼 뒷모습 */
 const hs=sprite('hero','ne_stand',0,{mode:'dark'});if(hs){try{tg.drawImage(hs.c,10,124,hs.w*2,hs.h*2)}catch(_){}}
 const fc=fogCv();if(fc){tg.globalAlpha=.35;for(let i=0;i<4;i++){const x=((t/60*(i+1)*.3+i*80)%260)-80;try{tg.drawImage(fc,Math.round(x),150+i*7,120,30)}catch(_){}}tg.globalAlpha=1}
 if(dark){tg.globalAlpha=dark;tg.fillStyle='#000';tg.fillRect(0,0,VW,VH);tg.globalAlpha=1}
 if(cv){g.imageSmoothingEnabled=false;try{g.drawImage(cv.c,0,0,VW,VH)}catch(_){}}}
function drawTitle(g,t){drawTitleArt(g,t,0);const nw=artOn()&&imgOk('title'),tx=nw?54:VW/2;
 Tx(g,'반 헬싱',tx+1.5,40.5,{size:24,bold:true,color:'#3a0008',align:'center'});Tx(g,'반 헬싱',tx,39,{size:24,bold:true,color:'#f4e4c4',align:'center',shadow:'#a01020'});
 g.fillStyle='#a01f2e';g.fillRect(tx-47,46,94,1);g.fillStyle='#d8b04a';g.fillRect(tx-35,48,70,1);
 Tx(g,':  흡혈귀전  :',tx,61,{size:11,bold:true,color:'#e0c070',align:'center',shadow:'#000'});Tx(g,'吸血鬼傳',tx,73,{size:8,color:'#a08aa8',align:'center'});
 if(G.mode==='title'&&G.tsub==='diff'){panel(g,54,96,90,64,.94);Tx(g,'어려움 고르기',99,108,{size:8.5,bold:true,color:'#f0e0c0',align:'center'});['쉬움','보통','어려움'].forEach((n,i)=>{const y=114+i*14;if(i===G.dsel){g.fillStyle='#5a1420';g.fillRect(58,y,82,12)}Tx(g,n,99,y+9,{size:9,bold:i===G.dsel,color:i===G.dsel?'#fff4d0':'#a898b8',align:'center'})});return}
 if(G.tsub==='help'){drawHelp(g);return}
 const has=!!readSave();const mx=nw?104:100;if(nw){g.fillStyle='rgba(6,2,12,.55)';g.fillRect(mx-41,98,82,63)}TITLE_MENU.forEach((n,i)=>{const y=102+i*15;const dim=i===1&&!has;if(i===G.sel){g.fillStyle='rgba(90,20,32,.85)';g.fillRect(mx-37,y-1,74,13);Tx(g,'†',mx-31,y+9,{size:8,color:'#ffd860'})}Tx(g,n,mx,y+9,{size:9.5,bold:i===G.sel,color:dim?'#5a5068':i===G.sel?'#fff4d0':'#c8b8d0',align:'center',shadow:'#000'})});
 if(has){const s=readSave();Tx(g,'기록: 레벨 '+s.lv+' · '+(MAPS[s.map]?MAPS[s.map].n:''),VW/2,166,{size:7,color:'#8a7898',align:'center',shadow:'#000'})}
 Tx(g,'ⓒ2006 어둠의 사냥꾼 · 애니콜 전용 · '+VERSION,VW/2,VH-4,{size:6.5,color:'#6a5878',align:'center'})}
function drawHelp(g){panel(g,4,84,142,96,.96);const L=['[걷기] 방향 키, 숫자 1~9 (8방향)','[베기] 5, 확인 (연타 3번, 꾹 = 모아 베기)','[구르기] 0, 통화 (구르는 순간 무적)','[보조 무기] *, 취소 (은 조각 사용)','[기술] #, NATE (혈기: 꾹 누르기)','[멈춤] 메뉴 키 · 쓰러진 흡혈귀 곁 5 = 말뚝','[자판] Z 베기 X 구르기 C 보조 V 기술'];L.forEach((ln,i)=>Tx(g,ln,10,98+i*12,{size:7.5,color:i===6?'#ffd860':'#d8d0e0'}))}
function titleKey(id){if(G.tsub==='help'){G.tsub=null;sfx('back');return}
 if(G.tsub==='diff'){if(id==='up'||id==='8'){G.dsel=(G.dsel+2)%3;sfx('cursor')}else if(id==='down'||id==='2'){G.dsel=(G.dsel+1)%3;sfx('cursor')}else if(id==='ok'||id==='5'){newGame(['easy','normal','hard'][G.dsel])}else if(id==='clr'){G.tsub=null;sfx('back')}return}
 const n=TITLE_MENU.length;if(id==='up'||id==='8'){G.sel=(G.sel+n-1)%n;sfx('cursor')}else if(id==='down'||id==='2'){G.sel=(G.sel+1)%n;sfx('cursor')}
 else if(id==='ok'||id==='5'){sfx('ok');if(G.sel===0){G.tsub='diff';G.dsel=1}else if(G.sel===1){const s=readSave();if(s)continueGame(s);else sfx('deny')}else if(G.sel===2)G.tsub='help';else quitGame()}else if(id==='clr')quitGame()}
/* A126 새 그림 제목 화면: 그림 위에 안개, 박쥐, 가끔 번개 */
function titleImg(g,t,dark){const ds=Math.max(1,Math.ceil(IM.ds||2));const cv=hiCell('title',[0,0,IM.im.title.naturalWidth,IM.im.title.naturalHeight],VW*ds,VH*ds,false,'','');if(!cv)return false;
 try{hq(g);g.drawImage(cv.c,0,0,VW,VH)}catch(_){return false}
 if(Math.floor(t/5200)%3===1&&(t%5200)<160){g.globalAlpha=.35*(1-(t%5200)/160);g.fillStyle='#e0e8ff';g.fillRect(0,0,VW,VH);g.globalAlpha=1}
 for(let i=0;i<5;i++){const k=((t/9000+i*.23)%1);const bx=-10+k*(VW+20),by=24+i*7+Math.sin(k*9+i)*5,f=Math.floor(t/110+i)%2;g.fillStyle='#08040c';g.fillRect(bx,by,2.4,1.2);g.fillRect(bx-2,by-(f?1:-1),2,1);g.fillRect(bx+2.4,by-(f?1:-1),2,1)}
 const fc=fogCv();if(fc){g.globalAlpha=.3;for(let i=0;i<4;i++){const x=((t/60*(i+1)*.3+i*80)%260)-80;try{g.drawImage(fc,x,148+i*8,120,30)}catch(_){}}g.globalAlpha=1}
 if(dark){g.globalAlpha=dark;g.fillStyle='#000';g.fillRect(0,0,VW,VH);g.globalAlpha=1}g.imageSmoothingEnabled=false;return true}
function proImg(i){if(!imgOk('pro'))return null;const im=IM.im.pro,cw=im.naturalWidth/4,ds=Math.max(1,Math.ceil(IM.ds||2));const ht=Math.round(VW*im.naturalHeight/cw);
 const cv=hiCell('pro',[Math.round(i*cw),0,Math.round(cw),im.naturalHeight],VW*ds,ht*ds,false,'','');return cv?{c:cv.c,h:ht}:null}
/* ---------- 머리말 ---------- */
const PRO=[{art:'london',t:'1897년 5월, 런던.\n성 미카엘 기사회 전신실에 한 통의 전보가 들어왔다.'},{art:'tele',t:'「보르고 고개 아래 비스트리차. 백작이 깨어났다. 아벨, 절대 오지 마라. 반 헬싱」'},
 {art:'abel',t:'그 전보를 끝으로 에이브러햄 반 헬싱 교수의 소식이 끊겼다.\n아들 아벨은 은 지팡이칼과 석궁을 챙겼다.'},{art:'coach',t:'열흘 뒤. 트란실바니아, 카르파티아 산맥.\n해가 지기 직전, 마차가 비스트리차에 닿는다.'}];
function drawPrologue(g,t){const P=G.pro,pg=PRO[P.i];g.fillStyle='#050208';g.fillRect(0,0,VW,VH);const a=Math.min(1,(G.now-P.t0)/500);g.globalAlpha=a;
 const pim=artOn()&&imgOk('pro')?proImg(P.i):null;if(pim){const k=Math.min(1,(G.now-P.t0)/9000),py=-Math.round(k*(pim.h-VH)*10)/10;try{hq(g);g.drawImage(pim.c,0,py,VW,pim.h)}catch(_){}g.imageSmoothingEnabled=false;
  try{const gr=g.createLinearGradient(0,96,0,150);gr.addColorStop(0,'rgba(5,2,8,0)');gr.addColorStop(1,'rgba(5,2,8,.92)');g.fillStyle=gr;g.fillRect(0,96,VW,54);g.fillStyle='rgba(5,2,8,.92)';g.fillRect(0,150,VW,VH-150)}catch(_){}}
 const cv=pim?null:(G.tb||(G.tb=mkcv(VW,VH)));if(cv){const tg=cv.g;tg.fillStyle='#050208';tg.fillRect(0,0,VW,VH);proArt(tg,pg.art,t);try{g.drawImage(cv.c,0,0,VW,110,0,8,VW,110)}catch(_){}}
 g.fillStyle='#5a1420';g.fillRect(10,120,130,1);const L=K.wrap(g,pg.t,134,8.5,false);let left=Math.floor((G.now-P.t0)/30);L.forEach((ln,i)=>{const part=left>=ln.length?ln:ln.slice(0,Math.max(0,left));left-=ln.length;Tx(g,part,8,134+i*12,{size:8.5,color:'#e8dcc8'})});
 g.globalAlpha=1;if(Math.floor(G.now/450)%2)Tx(g,'5 다음 · 취소 건너뛰기',VW/2,VH-4,{size:7,color:'#7a6a8a',align:'center'})}
function proArt(g,k,t){if(k==='london'){g.fillStyle='#1a1a2a';g.fillRect(0,0,VW,110);for(let i=0;i<6;i++){const x=i*26;g.fillStyle='#0a0a14';g.fillRect(x,50+(i%2)*10,22,60)}g.fillStyle='#0a0a14';g.fillRect(62,14,16,96);fillPoly(g,[[60,14],[70,2],[80,14]],'#0a0a14');fillPoly(g,ring(70,26,5),'#e8d890');dot(g,'#0a0a14',70,23,1,4);dot(g,'#0a0a14',70,26,3,1);
  for(let i=0;i<12;i++)if(Math.floor(t/500+i)%3)dot(g,'#ffcf60',4+i*12,60+(i*7)%40,2,2);g.globalAlpha=.25;for(let i=0;i<5;i++)fillPoly(g,ring(20+i*30,98,20),'#8a8aa0');g.globalAlpha=1}
 else if(k==='tele'){g.fillStyle='#120a14';g.fillRect(0,0,VW,110);g.fillStyle='#ece2c8';g.fillRect(16,14,118,84);g.fillStyle='#a01f2e';g.fillRect(16,14,118,12);for(let i=0;i<5;i++){g.fillStyle='#8a7a5a';g.fillRect(24,40+i*11,100-(i===4?40:0)-(i*7)%20,2)}const k2=Math.floor(t/120)%2;g.fillStyle='#2a1a10';g.fillRect(24+(Math.floor(t/60)%90),38+((Math.floor(t/5400))%5)*11,2,6*k2)}
 else if(k==='abel'){g.fillStyle='#14101e';g.fillRect(0,0,VW,110);for(let i=0;i<8;i++){g.fillStyle=i%2?'#1e1828':'#181422';g.fillRect(0,i*14,VW,14)}g.fillStyle='#2a1a10';g.fillRect(0,90,VW,20);const sp=sprite('hero','se_stand',0,{});if(sp)try{g.drawImage(sp.c,VW/2-sp.w*1.5,30,sp.w*3,sp.h*3)}catch(_){}
  fillPoly(g,[[96,60],[132,58],[132,64],[96,66]],'#5a3a22');dot(g,'#c8d4e8',100,62,30,1);line(g,104,56,104,70,'#5a3a22');dot(g,'#c8d4e8',22,50,2,40);dot(g,'#e8bc52',21,48,4,3)}
 else{try{const gr=g.createLinearGradient(0,0,0,110);gr.addColorStop(0,'#3a1a4a');gr.addColorStop(1,'#c86a5a');g.fillStyle=gr}catch(_){g.fillStyle='#5a2a4a'}g.fillRect(0,0,VW,110);fillPoly(g,ring(40,70,16),'#ffc890');
  g.fillStyle='#1a0a20';for(let x=0;x<VW;x+=2){const y=70-Math.round(20+Math.sin(x/17)*10+Math.sin(x/7)*4);g.fillRect(x,y,2,110)}g.fillStyle='#0a0410';fillPoly(g,[[0,96],[VW,84],[VW,110],[0,110]],'#0a0410');
  const cx=Math.round(30+((t/40)%40));g.fillStyle='#0a0410';g.fillRect(cx,78,26,10);g.fillRect(cx+4,72,16,7);fillPoly(g,ring(cx+5,90,4),'#000');fillPoly(g,ring(cx+21,90,4),'#000');g.fillRect(cx+26,80,12,6);g.fillRect(cx+36,76,4,8);if(Math.floor(t/400)%2)dot(g,'#ffcf60',cx+8,74,2,2)}}
function prologueKey(id){const P=G.pro;if(id==='clr'){startPlay();return}if(id==='ok'||id==='5'){const L=PRO[P.i].t.length;if((G.now-P.t0)/30<L){P.t0=-1e9;return}P.i++;sfx('page');if(P.i>=PRO.length)startPlay();else P.t0=G.now}}
/* ---------- 쓰러짐 ---------- */
function drawOver(g,t){g.fillStyle='#0a0004';g.fillRect(0,0,VW,VH);for(let i=0;i<14;i++){const x=6+i*10+(i%3),len=((t/12+i*37)%(60+i*5));g.fillStyle='#5a0010';g.fillRect(x,0,2,Math.round(len));dot(g,'#8a0018',x,Math.round(len),2,2)}
 Tx(g,'아벨은 쓰러졌다',VW/2,70,{size:13,bold:true,color:'#e8c8c8',align:'center',shadow:'#5a0010'});Tx(g,'"밤은 아직 길다..."',VW/2,88,{size:8,color:'#9a7a8a',align:'center'});
 ['마지막 기록에서 다시','제목 화면으로'].forEach((n,i)=>{const y=114+i*16;if(i===G.sel){g.fillStyle='#5a1420';g.fillRect(24,y-1,102,13)}Tx(g,n,VW/2,y+9,{size:9,bold:i===G.sel,color:i===G.sel?'#fff4d0':'#a898b8',align:'center'})})}
function overKey(id){if(id==='up'||id==='down'||id==='2'||id==='8'){G.sel=1-G.sel;sfx('cursor');return}if(id==='ok'||id==='5'){if(G.sel===0){const s=readSave();if(s)continueGame(s);else goTitle()}else goTitle()}}
/* ---------- 소리: 휴대폰 64화음 느낌의 작은 악단 (오르간, 종, 하프, 베이스, 북) ---------- */
const AU={cur:null,song:null,gain:null,sfxOut:null,nb:null,last:{},secStart:0,sec:null,idx:[],ctxRef:null};
function actx(){try{return host&&host.audioCtx?host.audioCtx():null}catch(_){return null}}
function avol(){try{return host&&host.audioVol?host.audioVol():0}catch(_){return 0}}
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function nfreq(n){const m=/^([A-G][#b]?)(-?\d)$/.exec(n);if(!m)return 0;return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12)}
function parseTrack(str){const ev=[];let t=0;for(const tok of String(str).trim().split(/\s+/)){if(!tok||tok==='|')continue;const [n,d]=tok.split(':');const du=parseFloat(d||'1');if(n!=='R')ev.push({t,d:du,f:n.split('+').map(nfreq).filter(Boolean)});t+=du}return{ev,len:t}}
/* 곡: bpm, 처음 한 번(intro)과 되풀이(loop). 트랙 = [악기, 음표, 세기] */
const SONGS={
 title:{wet:0.35,bpm:66,intro:[['organ','A5:.125 G5:.125 A5:1.25 R:.5 G5:.125 F5:.125 E5:.125 D5:.125 C#5:.75 D5:1.5 R:.75 A4:.125 G4:.125 A4:1.25 R:.5 E4:.25 F4:.25 C#4:.25 D4:2.25 R:.5',1],['organ','R:7 D2+A2:3.75',.7]],
  loop:[['organ','D5:1 F5:1 A5:1.5 G5:.5 F5:1 E5:1 D5:2 C5:1 D5:1 E5:1 F5:1 E5:1.5 D5:.5 C#5:2',.55],['pad','D3+A3:4 Bb2+F3:4 G2+D3:4 A2+E3:4',.5],['bell','D6:4 R:4 F5:4 R:2 C#6:2',.25]]},
 village:{wet:0.15,bpm:100,loop:[['lead','A4:1 C5:1 E5:1 D5:2 C5:1 B4:1 C5:1 D5:1 E5:3 F5:1 E5:1 D5:1 C5:2 B4:1 A4:1 B4:1 G#4:1 A4:3',.5],
  ['bass','A2:1 R:2 D3:1 R:2 G2:1 R:2 C3:1 R:2 F2:1 R:2 E2:1 R:2 E2:1 R:2 A2:1 R:2',.8],['harp','R:1 E3+A3:1 E3+A3:1 R:1 F3+A3:1 F3+A3:1 R:1 D3+G3:1 D3+G3:1 R:1 E3+G3:1 E3+G3:1 R:1 A2+C3:1 A2+C3:1 R:1 G#2+B2:1 G#2+B2:1 R:1 G#2+D3:1 G#2+D3:1 R:1 C3+E3:1 C3+E3:1',.45]]},
 night:{wet:0.3,bpm:66,loop:[['bell','E5:1.5 G5:.5 B5:2 A5:1 G5:1 F#5:2 E5:2 R:2 B4:1.5 D5:.5 F#5:2 E5:1 D5:1 C5:2 B4:4',.35],['pad','E2+B2:8 C2+G2:8 A1+E2:8 B1+F#2:8',.45]]},
 inn:{wet:0.12,bpm:112,loop:[['harp','D5:.5 F#5:.5 A5:1 A5:.5 B5:.5 A5:1 F#5:.5 E5:.5 D5:1 E5:2 G5:.5 F#5:.5 E5:1 C5:.5 D5:.5 E5:1 D5:.5 C5:.5 A4:1 D5:2',.5],['bass','D3:1 A2:1 D3:1 A2:1 D3:1 A2:1 C3:1 G2:1 C3:1 G2:1 C3:1 G2:1 D3:1 A2:1 D3:2',.7],['kick','D2:1 R:1 D2:1 R:1 D2:1 R:1 D2:1 R:1 D2:1 R:1 D2:1 R:1 D2:1 R:1 D2:1 R:1',.25]]},
 church:{wet:0.5,bpm:46,loop:[['organ','D4+F4+A4:2 C4+E4+G4:2 Bb3+D4+F4:2 A3+C#4+E4:2 D4+F4+A4:2 G3+Bb3+D4:2 A3+C#4+E4:2 D4+F4+A4:2',.4],['organ','D2:4 Bb1:4 D2:4 A1:2 D2:2',.45]]},
 forest:{wet:0.25,bpm:76,loop:[['harp','E4:.5 G4:.5 A4:1 R:1 B4:.5 A4:.5 G4:1 R:1 E4:.5 D4:.5 E4:2 R:1 G4:.5 A4:.5 B4:1 D5:1 B4:1 A4:3 R:1',.4],['pad','E2+B2:8 D2+A2:8 C2+G2:8 B1+F#2:8',.5],['bell','R:6 B5:.25 R:9.75 E6:.25 R:15.75',.18]]},
 cemetery:{wet:0.3,bpm:58,loop:[['organ','F4:1 E4:1 F4:1 D4:1 E4:1 C4:1 D4:2 R:2 F4:1 F4:1 G4:1 F4:1 E4:1 D4:1 E4:2 R:2',.4],['pad','D2+A2:8 D2+F2:8 Bb1+F2:8 A1+E2:8',.5],['bell','D3:4 R:4 D3:4 R:4 D3:4 R:4 A2:4 R:4',.35]]},
 crypt:{wet:0.45,bpm:50,loop:[['pad','D2+G#2:8 C#2+G2:8 D2+G#2:8 A1+D#2:8',.55],['bell','A6:.25 R:5.75 E6:.25 R:7.75 F6:.25 R:5.75 C#6:.25 R:11.75',.2],['bass','D2:.25 R:3.75 D2:.25 R:3.75 C#2:.25 R:3.75 C#2:.25 R:3.75 D2:.25 R:3.75 D2:.25 R:3.75 A1:.25 R:3.75 A1:.25 R:3.75',.6]]},
 battle:{wet:0.1,bpm:150,loop:[['lead','D5:.5 D5:.5 F5:.5 D5:.5 A5:.5 G5:.5 F5:.5 E5:.5 D5:.5 D5:.5 F5:.5 D5:.5 C6:.5 A5:.5 G5:.5 A5:.5 Bb5:.5 A5:.5 G5:.5 F5:.5 E5:.5 F5:.5 G5:.5 E5:.5 F5:1 E5:1 D5:2',.42],
  ['bass','D3:.5 D4:.5 D3:.5 D4:.5 D3:.5 D4:.5 D3:.5 D4:.5 F3:.5 F4:.5 F3:.5 F4:.5 F3:.5 F4:.5 F3:.5 F4:.5 G3:.5 G4:.5 G3:.5 G4:.5 A3:.5 A4:.5 A3:.5 A4:.5 D3:.5 D4:.5 D3:.5 D4:.5 D3:1 R:1',.6],
  ['kick','D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1 D2:1',.5],['snare','R:1 A4:1 R:1 A4:1 R:1 A4:1 R:1 A4:1 R:1 A4:1 R:1 A4:1 R:1 A4:1 R:.5 A4:.5 A4:1',.35]]},
 boss1:{wet:0.12,bpm:164,loop:[['lead','E5:.5 B4:.5 E5:.5 F#5:.5 G5:.5 F#5:.5 E5:.5 D#5:.5 E5:1 B4:1 G4:1 B4:1 C5:.5 B4:.5 A4:.5 G4:.5 F#4:.5 G4:.5 A4:.5 B4:.5 C5:1 D#5:1 F#5:1 B5:1',.42],
  ['bass','E2:.5 E3:.5 E2:.5 E3:.5 E2:.5 E3:.5 E2:.5 E3:.5 C2:.5 C3:.5 C2:.5 C3:.5 C2:.5 C3:.5 C2:.5 C3:.5 A1:.5 A2:.5 A1:.5 A2:.5 A1:.5 A2:.5 A1:.5 A2:.5 B1:.5 B2:.5 B1:.5 B2:.5 B1:.5 B2:.5 B1:.5 B2:.5',.65],
  ['kick','D2:.5 R:.5 D2:.5 D2:.5 D2:.5 R:.5 D2:.5 D2:.5 D2:.5 R:.5 D2:.5 D2:.5 D2:.5 R:.5 D2:.5 D2:.5',.5],['snare','R:1 A4:1 R:1 A4:1 R:1 A4:1 R:1 A4:.5 A4:.5',.35],['organ','E4+G4+B4:4 C4+E4+G4:4 A3+C4+E4:4 B3+D#4+F#4:4',.25]]},
 boss2:{wet:0.2,bpm:138,loop:[['lead','G5:1 D5:1 Bb4:1 G4:2 A4:1 Bb4:1 C5:1 D5:1 Eb5:3 D5:1 C5:1 Bb4:1 A4:2 D5:1 F#4:1 G4:1 A4:1 G4:3',.45],
  ['bass','G2:1 R:2 G2:1 R:2 Bb2:1 R:2 C3:1 R:2 D3:1 R:2 D3:1 R:2 D2:1 R:2 G2:1 R:2',.75],['harp','R:1 Bb3+D4:1 Bb3+D4:1 R:1 Bb3+D4:1 Bb3+D4:1 R:1 D4+G4:1 D4+G4:1 R:1 Eb4+G4:1 Eb4+G4:1 R:1 F#3+C4:1 F#3+C4:1 R:1 F#3+A3:1 F#3+A3:1 R:1 F#3+C4:1 F#3+C4:1 R:1 Bb3+D4:1 Bb3+D4:1',.4],
  ['organ','G3+Bb3+D4:6 Eb3+G3+Bb3:6 D3+F#3+A3:6 G3+Bb3+D4:6',.22]]},
 dawn:{wet:0.25,bpm:84,loop:[['harp','G4:1 B4:1 D5:1 G5:2 F#5:1 E5:1 D5:1 B4:1 C5:2 D5:1 E5:1 D5:1 B4:1 A4:2 G4:1',.45],['pad','G2+D3:4 C3+G3:4 E2+B2:4 D2+A2:4',.45],['bell','G6:4 R:4 E6:4 R:4',.15]]},
 over:{wet:0.4,bpm:48,intro:[['organ','Bb3:1 Bb3:.75 Bb3:.25 Bb3:1 Db4:.75 C4:.25 C4:.75 Bb3:.25 Bb3:.75 A3:.25 Bb3:2',.55],['organ','Bb1+F2:4 Bb1+F2:4',.45]],loop:null},
 /* A126 새 곡: 저택 왈츠, 진료소 오르골, 하얀 귀부인의 방 */
 manor:{bpm:132,wet:.25,loop:[['lead','A4:2 D5:1 F5:2 E5:1 D5:1 G4:1 Bb4:1 A4:3 F4:2 A4:1 D5:2 C5:1 Bb4:1 A4:1 G4:1 A4:3 A4:2 D5:1 F5:2 G5:1 A5:1 G5:1 F5:1 E5:3 F5:2 E5:1 D5:1 C#5:1 B4:1 C#5:1 E5:1 A4:1 D5:3',.3],
  ['bass','D2:3 D2:3 G2:3 A2:3 D2:3 Bb1:3 G1:3 A1:3 D2:3 D2:3 Bb1:3 C2:3 F2:3 G2:3 A1:3 D2:3',.7],
  ['harp','R:1 F3+A3:1 F3+A3:1 R:1 F3+A3:1 F3+A3:1 R:1 Bb3+D4:1 Bb3+D4:1 R:1 C#4+E4:1 C#4+E4:1 R:1 F3+A3:1 F3+A3:1 R:1 D3+F3:1 D3+F3:1 R:1 Bb3+D4:1 Bb3+D4:1 R:1 C#4+E4:1 C#4+E4:1 R:1 F3+A3:1 F3+A3:1 R:1 F3+A3:1 F3+A3:1 R:1 D3+F3:1 D3+F3:1 R:1 E3+G3:1 E3+G3:1 R:1 A3+C4:1 A3+C4:1 R:1 Bb3+D4:1 Bb3+D4:1 R:1 C#4+E4:1 C#4+E4:1 R:1 F3+A3:1 F3+A3:1',.32]]},
 clinic:{bpm:72,wet:.3,loop:[['bell','E5:1 G5:1 B5:1 C6:1 B5:2 G5:2 F#5:1 A5:1 C6:1 D6:1 C6:2 A5:2 E5:1 G5:1 B5:1 E6:2 D#6:1 B5:1 G5:1 F#5:1 D#5:1 B4:1 D#5:1 E5:4',.3],
  ['pad','E2+B2:8 D2+A2:8 E2+B2:8 B1+F#2:4 E2+B2:4',.38],['harp','R:2 E4:.5 R:5.5 R:2 D4:.5 R:5.5 R:2 E4:.5 R:5.5 R:2 B3:.5 R:1.5 E4:.5 R:3.5',.25]]},
 lament:{bpm:52,wet:.45,loop:[['pad','A2+E3:8 F2+C3:8 D2+A2:8 E2+B2:8',.42],['bell','R:4 E6:2 C6:2 R:4 A5:4 R:4 F5:2 E5:2 R:4 B5:4',.16],['organ','A4:4 C5:2 B4:2 A4:4 G4:4 F4:4 E4:2 F4:2 E4:8',.18]]},
 toccata:{wet:0.45,bpm:66,intro:[['organ','A5:.125 G5:.125 A5:1.25 R:.5 G5:.125 F5:.125 E5:.125 D5:.125 C#5:.75 D5:1.5 R:.75 A4:.125 G4:.125 A4:1.25 R:.5 E4:.25 F4:.25 C#4:.25 D4:2.25',1],['organ','R:7 D2+A2:3',.7]],loop:null}};
const SONG_P={};function songParts(id){if(SONG_P[id])return SONG_P[id];const S=SONGS[id];const mk=L=>L?L.map(([inst,str,v])=>({inst,v,...parseTrack(str)})):null;return SONG_P[id]={intro:mk(S.intro),loop:mk(S.loop)}}
function curMusic(){return AU.cur}
/* A126 제목 음악: 사용자가 준 「Shadow of the Organ」 mp3. 못 틀면 예전처럼 합성음 오르간 */
const TITLE_MP3='assets/vh/Shadow_of_the_Organ_main_title.mp3';
function mp3(){if(AU.mp3bad||!w.Audio)return null;if(AU.mp3)return AU.mp3;try{const a=new w.Audio();a.loop=true;a.preload='auto';a.addEventListener('error',()=>{AU.mp3bad=1;if(AU.cur==='title'&&AU.mp3on){AU.mp3on=false;playMusic('title',true)}});a.src=TITLE_MP3;AU.mp3=a;return a}catch(_){AU.mp3bad=1;return null}}
function mp3Vol(){return Math.max(0,Math.min(1,.85*avol()))}
function playMusic(id,force){if(id==='none')id=null;if(id!=='toccata')AU.after=null;if(!force&&AU.cur===id&&(AU.song||AU.mp3on||!id))return;stopMusic();AU.cur=id;if(!id)return;if(G.s&&!G.s.opt.music&&G.mode!=='title')return;const S=SONGS[id];if(!S)return;
 if(id==='title'){const a=mp3();if(a){AU.mp3on=true;try{a.currentTime=0}catch(_){}a.volume=mp3Vol();if(avol()>0){const pr=a.play();if(pr&&pr.catch)pr.catch(()=>{if(AU.cur==='title'&&AU.mp3on&&!AU.mp3.paused)return;AU.mp3wait=1})}return}}
 const c=actx();if(!c)return;
 try{AU.gain=c.createGain();AU.gain.gain.value=.3*avol();AU.gain.connect(c.destination);const v=verb(c);if(v){AU.wet=c.createGain();AU.wet.gain.value=S.wet!=null?S.wet:.2;AU.gain.connect(AU.wet);AU.wet.connect(v)}
  const P=songParts(id);/* A126 고침: 구간 이름을 곡 안에 두어야 이어서 연주된다 (A125 에서는 첫 순간에 멈췄다) */AU.song={id,S,P,sec:P.intro?'intro':'loop'};AU.sec=AU.song.sec;AU.secStart=c.currentTime+.08;AU.idx=[]}catch(_){AU.song=null}}
/* 잔향: 성당처럼 길게 울리는 방 (한 번 만들어 같이 쓴다) */
function verb(c){if(AU.verb&&AU.verbCtx===c)return AU.verb;try{const n=Math.floor(c.sampleRate*2.6),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);const att=c.sampleRate*.01;for(let i=0;i<n;i++){const t=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.8)*(i<att?i/att:1)*.6}}
 const cv=c.createConvolver();cv.buffer=b;const out=c.createGain();out.gain.value=.9;cv.connect(out);out.connect(c.destination);AU.verb=cv;AU.verbCtx=c;return cv}catch(_){AU.verb=null;return null}}
function stopAll(){stopMusic();ambStop()}
function stopMusic(){if(AU.mp3on||AU.mp3){AU.mp3on=false;AU.mp3wait=0;try{AU.mp3.pause()}catch(_){}}if(AU.wet){const wt=AU.wet;AU.wet=null;setTimeout(()=>{try{wt.disconnect()}catch(_){}},400)}if(AU.gain){try{const g=AU.gain;const c=actx();if(c){g.gain.cancelScheduledValues&&g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(g.gain.value,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+.08)}setTimeout(()=>{try{g.disconnect()}catch(_){}},150)}catch(_){}}AU.gain=null;AU.song=null}
function musicTick(){ambTick();if(AU.mp3on&&AU.mp3){const v=mp3Vol()*(Date.now()<(AU.mp3duck||0)?.3:1);try{if(v<=0){if(!AU.mp3.paused)AU.mp3.pause()}else{AU.mp3.volume=v;if(AU.mp3.paused&&Date.now()>(AU.mp3try||0)){AU.mp3try=Date.now()+700;const pr=AU.mp3.play();if(pr&&pr.catch)pr.catch(()=>{})}}}catch(_){}}
 const M=AU.song;if(!M)return;const c=actx();if(!c){AU.song=null;return}if(c.state==='suspended')return;const spb=60/M.S.bpm,ahead=c.currentTime+.3;let tracks=M.P[M.sec];if(!tracks){stopMusic();return}
 let guard=0;while(guard++<4){const len=Math.max(...tracks.map(t=>t.len));for(let k=0;k<tracks.length;k++){const tr=tracks[k];let i=AU.idx[k]||0;while(i<tr.ev.length&&AU.secStart+tr.ev[i].t*spb<ahead){const e=tr.ev[i];const at=AU.secStart+e.t*spb;if(at>=c.currentTime-.05)for(const f of e.f)note(c,tr.inst,f,at,e.d*spb,tr.v);i++}AU.idx[k]=i}
  const end=AU.secStart+len*spb;if(end<ahead){if(M.sec==='intro'&&M.P.loop){M.sec='loop';tracks=M.P.loop}else if(M.sec==='loop'){}else{AU.song=null;const nx=AU.after;AU.after=null;if(nx){AU.cur=null;setTimeout(()=>{if(!AU.song&&!AU.cur)playMusic(nx)},Math.max(0,(end-c.currentTime)*1000))}return}AU.secStart=end;AU.idx=[]}else break}
 if(!(AU.duckUntil>c.currentTime))try{AU.gain.gain.value=.3*avol()*(G.s&&G.s.opt.music===0&&G.mode!=='title'?0:1)}catch(_){}}
function note(c,inst,f,at,dur,v,o2){try{const out=o2||AU.gain;if(!out)return;const g=c.createGain();g.connect(out);const env=(a,peak,rel)=>{g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(peak,at+a);g.gain.setValueAtTime(peak,at+Math.max(a,dur-rel));g.gain.linearRampToValueAtTime(.0001,at+dur+.02)};
 const osc=(type,fr,gv,det)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(fr,at);if(det)o.detune&&o.detune.setValueAtTime(det,at);const gg=c.createGain();gg.gain.value=gv;o.connect(gg);gg.connect(g);o.start(at);o.stop(at+dur+.08);return o};
 switch(inst){
  case 'organ':env(.012,.22*v,.05);osc('square',f,.32);osc('sine',f*2,.25);osc('sine',f/2,.3);osc('triangle',f*3,.08);break;
  case 'lead':env(.01,.2*v,.04);osc('square',f,.5,4);osc('square',f,.3,-6);break;
  case 'pad':env(Math.min(.35,dur*.4),.16*v,Math.min(.4,dur*.4));osc('sawtooth',f,.22,7);osc('sawtooth',f,.22,-7);osc('sine',f/2,.35);break;
  case 'bass':env(.008,.32*v,.05);osc('triangle',f,1);break;
  case 'harp':g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(.24*v,at+.005);g.gain.exponentialRampToValueAtTime(.0005,at+Math.min(1.2,dur+.6));osc('triangle',f,1);osc('sine',f*2,.3);break;
  case 'bell':g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(.22*v,at+.004);g.gain.exponentialRampToValueAtTime(.0005,at+2.2);{const o1=osc('sine',f,1),o2=osc('sine',f*2.76,.35);o1.stop(at+2.3);o2.stop(at+2.3)}break;
  case 'kick':{g.gain.setValueAtTime(.5*v,at);g.gain.exponentialRampToValueAtTime(.001,at+.18);const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,at);o.frequency.exponentialRampToValueAtTime(40,at+.15);o.connect(g);o.start(at);o.stop(at+.2);break}
  case 'snare':{g.gain.setValueAtTime(.35*v,at);g.gain.exponentialRampToValueAtTime(.001,at+.12);const n=c.createBufferSource();n.buffer=noiseBuf(c);const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1800;n.connect(hp);hp.connect(g);n.start(at);n.stop(at+.13);break}}}catch(_){}}
function noiseBuf(c){if(AU.nb&&AU.ctxRef===c)return AU.nb;const n=Math.floor(c.sampleRate*.6);const b=c.createBuffer(1,n,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;AU.nb=b;AU.ctxRef=c;return b}
/* ---------- 효과음 ---------- */
const SFXD={
 swing:[['n',.09,.22,{bp:[1400,500]}],['t','sine',700,260,.07,.05]],whip:[['n',.12,.18,{hp:2000}],['t','sine',1800,500,.1,.08],['n',.03,.3,{hp:3000,t:.1}]],heavy:[['n',.16,.3,{bp:[700,150]}],['t','sawtooth',160,70,.15,.08]],
 hit:[['t','square',190,70,.06,.22],['n',.05,.25,{lp:2200}]],crit:[['t','square',220,80,.07,.25],['n',.06,.3,{lp:3000}],['t','sine',1500,1400,.09,.12,.02]],holyhit:[['t','sine',880,880,.12,.15],['t','sine',1320,1320,.14,.1,.02],['n',.05,.15,{hp:4000}]],
 hurt:[['t','sawtooth',320,110,.16,.22],['n',.08,.25,{lp:1500}]],roll:[['n',.17,.14,{lp:500}]],bow:[['t','square',950,280,.04,.14],['n',.03,.15,{hp:3000}]],throw:[['n',.14,.12,{bp:[300,1200]}]],
 glass:[['n',.06,.3,{hp:3500}],['t','sine',2400,2300,.2,.12],['t','sine',3150,3100,.25,.1,.03],['n',.25,.12,{bp:[800,300],t:.05}]],cross:[['t','sine',1200,900,.16,.12],['t','sine',1800,1400,.12,.06,.03]],
 charge1:[['t','sine',600,950,.1,.14]],charge2:[['t','sine',950,1700,.16,.16],['t','triangle',1900,2400,.12,.08,.04]],spin:[['n',.26,.25,{bp:[300,1600]}],['t','sine',500,900,.2,.1]],step:[['n',.025,.04,{lp:180}]],
 coin:[['t','square',988,988,.05,.1],['t','square',1319,1319,.07,.1,.05]],silver:[['t','triangle',1568,1568,.05,.12],['t','triangle',2093,2093,.08,.12,.04]],item:[['t','triangle',523,523,.06,.16],['t','triangle',659,659,.06,.16,.06],['t','triangle',784,784,.1,.16,.12]],
 levelup:[['t','square',523,523,.07,.12],['t','square',659,659,.07,.12,.07],['t','square',784,784,.07,.12,.14],['t','square',1047,1047,.07,.12,.21],['t','square',1319,1319,.2,.12,.28]],
 card:[['t','sine',1047,1047,.12,.12],['t','sine',1568,1568,.12,.12,.08],['t','sine',2093,2093,.25,.12,.16]],talk:[['t','square',700,760,.02,.05]],cursor:[['t','square',900,900,.02,.07]],ok:[['t','square',1200,1500,.05,.08]],back:[['t','square',700,500,.05,.07]],
 menu:[['t','square',600,600,.04,.07],['t','square',900,900,.05,.07,.04]],deny:[['t','square',200,180,.12,.12]],door:[['n',.12,.25,{lp:300}],['t','sawtooth',220,120,.3,.06,.05]],chest:[['t','sawtooth',180,260,.2,.06],['t','sine',1568,2093,.3,.1,.15]],
 lever:[['n',.05,.3,{bp:[1500,800]}],['t','square',300,250,.08,.12,.02]],gate:[['n',.6,.3,{lp:250}],['t','sawtooth',90,70,.5,.08]],ignite:[['n',.25,.25,{bp:[400,1500]}],['t','sine',300,600,.2,.06]],
 quest:[['t','square',1800,1800,.03,.08],['t','square',1800,1800,.03,.08,.08],['t','square',1800,1800,.06,.08,.16]],tele:[['t','square',1900,1900,.03,.08],['t','square',1900,1900,.03,.08,.07],['t','square',1900,1900,.03,.08,.14],['t','square',1900,1900,.08,.08,.24],['t','square',1900,1900,.03,.08,.4]],
 page:[['n',.18,.12,{bp:[2000,700]}]],heal:[['t','sine',523,523,.1,.12],['t','sine',784,784,.1,.12,.08],['t','sine',1047,1047,.2,.12,.16]],
 howl:[['t','sine',420,720,.5,.18],['t','sine',720,520,.7,.18,.5],['t','sine',840,1440,.5,.06],['t','sine',1440,1040,.7,.05,.5]],howl2:[['t','sine',480,700,.35,.1],['t','sine',700,560,.4,.1,.35]],
 growl:[['t','sawtooth',90,70,.28,.18],['n',.25,.1,{lp:400}]],growl2:[['t','sawtooth',70,55,.35,.2],['n',.3,.12,{lp:300}]],bark:[['n',.07,.3,{bp:[900,600]}],['t','square',320,200,.08,.15]],
 squeak:[['t','sine',3000,4200,.05,.08],['t','sine',3200,4400,.05,.07,.07]],caw:[['t','sawtooth',900,600,.12,.12],['n',.1,.1,{bp:[1200,800]}],['t','sawtooth',880,580,.12,.1,.18]],
 claw:[['n',.12,.22,{hp:2500}]],hiss:[['n',.3,.14,{hp:3000}]],dirt:[['n',.5,.2,{lp:200}]],throwb:[['n',.12,.12,{bp:[400,1200]}]],clank:[['t','square',1200,1150,.08,.12],['t','sine',2500,2400,.25,.08],['n',.04,.2,{hp:3000}]],
 break:[['t','square',1100,900,.1,.15],['n',.2,.3,{bp:[2000,400]}]],slam:[['t','sine',90,35,.25,.4],['n',.3,.3,{lp:500}]],land:[['t','sine',80,40,.2,.35],['n',.15,.2,{lp:400}]],
 summon:[['t','sawtooth',80,160,.6,.12],['n',.5,.12,{lp:600}]],mist:[['n',.4,.18,{bp:[1500,300]}]],appear:[['n',.25,.15,{bp:[300,1800]}]],kiss:[['n',.2,.2,{bp:[600,200]}],['t','sine',500,200,.2,.1]],
 scream:[['t','sawtooth',900,1400,.25,.12],['t','sawtooth',1400,700,.45,.12,.25],['n',.6,.15,{hp:2000}]],inhale:[['n',.5,.14,{bp:[300,1200]}]],rose:[['t','triangle',1760,1320,.08,.08],['t','triangle',1568,1175,.08,.08,.05]],
 bats:[['t','sine',3100,4300,.04,.06],['t','sine',2900,4100,.04,.06,.06],['t','sine',3300,4500,.04,.06,.12]],blood:[['n',.15,.25,{lp:800}],['t','sine',300,150,.12,.1]],splash:[['n',.2,.22,{lp:1200}]],
 bite:[['n',.12,.3,{lp:900}],['t','sine',220,90,.3,.2]],stake:[['t','sine',140,50,.18,.45],['n',.08,.4,{lp:1800}]],stake2:[['n',.2,.35,{bp:[1200,300]}],['t','sawtooth',300,80,.3,.15]],
 down:[['t','sine',420,180,.35,.15]],die:[['n',.15,.18,{lp:900}],['t','sine',200,90,.2,.12]],bossdie:[['n',1.2,.35,{lp:300}],['t','sawtooth',200,40,1.2,.2],['t','sine',600,100,1,.1,.2]],
 death:[['t','sawtooth',440,110,.9,.15],['t','sine',220,55,1.3,.2,.2]],awaken:[['t','sine',60,50,.12,.5],['t','sine',60,50,.12,.5,.22],['t','sawtooth',110,440,.8,.12,.3],['n',.6,.15,{bp:[300,2000],t:.3}]],
 perfect:[['t','sine',1800,2600,.15,.12],['n',.15,.12,{hp:4000}]],reveal:[['t','square',294,294,.5,.12],['t','square',415,415,.5,.1],['t','square',554,554,.5,.1],['n',.3,.15,{lp:600}]],
 anvil:[['t','square',1200,1150,.15,.15],['t','sine',1900,1850,.35,.12],['n',.04,.25,{hp:3000}]],thunder:[['n',1.8,.4,{lp:220}],['n',.3,.3,{lp:900}]],candle:[['n',.06,.2,{hp:2000}],['t','sine',2200,2000,.08,.06]],
 smash:[['n',.18,.3,{bp:[900,300]}]],rock:[['n',.1,.3,{lp:700}]],crumble:[['n',.8,.35,{lp:500}]],bones:[['n',.03,.25,{hp:2500}],['n',.03,.25,{hp:2500,t:.06}],['n',.03,.25,{hp:2500,t:.13}],['n',.03,.2,{hp:2500,t:.2}]],
 tick:[['n',.02,.12,{hp:3000}]],dash:[['n',.2,.25,{bp:[600,2200]}]],holy:[['t','sine',1047,1047,.8,.1],['t','sine',1319,1319,.8,.08],['t','sine',1568,1568,.8,.08],['n',.3,.15,{bp:[400,2500]}]],
 stepG:[['n',.05,.035,{lp:420}]],stepS:[['n',.03,.05,{bp:[1400,900]}],['t','square',180,150,.02,.025]],stepW:[['n',.04,.06,{lp:260}],['t','sine',110,80,.04,.04]],
 pray:[['t','triangle',523,523,1,.08],['t','triangle',659,659,1,.07,.1],['t','triangle',784,784,1,.07,.2]],equip:[['t','square',800,1200,.06,.1],['n',.04,.15,{hp:3000}]]};
function sfx(id,o){try{if(G.s&&!G.s.opt.sfx)return;const now2=G.now||0;if(AU.last[id]&&now2-AU.last[id]<35)return;AU.last[id]=now2;const D=SFXD[id];if(!D)return;const c=actx();
 if(!c){if(host&&host.beep&&D[0][0]==='t')host.beep([D[0][2]],Math.round(D[0][4]*1000),.05,D[0][1]==='sawtooth'?'square':D[0][1]);return}
 if(!AU.sfxOut||AU.sfxCtx!==c){AU.sfxOut=c.createGain();AU.sfxOut.connect(c.destination);AU.sfxCtx=c;const v=verb(c);if(v){AU.sfxWet=c.createGain();AU.sfxWet.gain.value=.1;AU.sfxOut.connect(AU.sfxWet);AU.sfxWet.connect(v)}}AU.sfxOut.gain.value=.55*avol();if(AU.sfxWet)AU.sfxWet.gain.value=roomVerb();const p=(o&&o.p)||1,t0=c.currentTime+.005;
 for(const d of D){if(d[0]==='t'){const [,type,f1,f2,dur,g,off]=d;const at=t0+(off||0);const osc=c.createOscillator();osc.type=type;osc.frequency.setValueAtTime(f1*p,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,f2*p),at+dur);const gg=c.createGain();gg.gain.setValueAtTime(.0001,at);gg.gain.linearRampToValueAtTime(g,at+.006);gg.gain.exponentialRampToValueAtTime(.0001,at+dur);osc.connect(gg);gg.connect(AU.sfxOut);osc.start(at);osc.stop(at+dur+.03)}
  else{const [,dur,g,f]=d;const at=t0+(f.t||0);const n=c.createBufferSource();n.buffer=noiseBuf(c);let node=n;const flt=c.createBiquadFilter();if(f.bp){flt.type='bandpass';flt.Q.value=1.2;flt.frequency.setValueAtTime(f.bp[0]*p,at);flt.frequency.exponentialRampToValueAtTime(Math.max(40,f.bp[1]*p),at+dur)}else if(f.hp){flt.type='highpass';flt.frequency.value=f.hp}else{flt.type='lowpass';flt.frequency.value=f.lp||1000}node.connect(flt);
   const gg=c.createGain();gg.gain.setValueAtTime(.0001,at);gg.gain.linearRampToValueAtTime(g,at+.005);gg.gain.exponentialRampToValueAtTime(.0001,at+dur);flt.connect(gg);gg.connect(AU.sfxOut);n.start(at,Math.random()*.3);n.stop(at+dur+.03)}}}catch(_){}}
/* A126: 발소리. 실내 바닥은 예전 그대로, 바깥은 풀밭은 사각, 돌길은 또각, 나무 다리는 쿵 */
function stepSound(){const m=G.m;if(!m)return;if(m.def.base==='_'||m.def.base==='+'||m.def.base==='-'){sfx('step');return}const h=G.hero;if(!h)return;const x=Math.floor(h.x),y=Math.floor(h.y);const f=inMap(m,x,y)?m.fl[y*m.w+x]:m.def.base;sfx(f==='.'||f==='*'||f==='w'||f==='"'?'stepS':f==='b'?'stepW':'stepG')}

/* ---------- A126 짧은 가락: 배경 음악을 잠깐 줄이고 위에 얹는다 ---------- */
const JINGLE={victory:{bpm:120,tr:[['lead','D5:.5 D5:.5 D5:.5 F5:1 A5:1 D6:2.5',.5],['organ','D4+F#4+A4:1.5 F4+A4+C5:1 A3+D4+F#4:3',.32],['bass','D3:1.5 F2:1 D2:3',.7],['bell','R:2.5 D6:3',.3]]},
 rest:{bpm:96,tr:[['harp','C5:.5 E5:.5 G5:.5 C6:2',.55],['bell','R:1.5 G6:2',.2],['pad','C3+G3:3.5',.3]]},
 relic:{bpm:140,tr:[['lead','G5:.25 C6:.25 E6:.25 G6:1.5',.45],['bell','R:.75 C7:1.5',.25],['harp','C4+E4+G4:2',.4]]},
 dread:{bpm:60,tr:[['organ','D2+G#2+D3:3',.55],['bell','D3:3',.35]]}};
function jingle(id){try{if(G.s&&!G.s.opt.sfx)return;const J=JINGLE[id];if(!J)return;const c=actx();if(!c)return;const out=c.createGain();out.gain.value=.34*avol();out.connect(c.destination);const v=verb(c);if(v){const wt=c.createGain();wt.gain.value=.3;out.connect(wt);wt.connect(v)}
 const spb=60/J.bpm,t0=c.currentTime+.04;let len=0;for(const [inst,str,vol] of J.tr){const P=parseTrack(str);len=Math.max(len,P.len);for(const e of P.ev)for(const f of e.f)note(c,inst,f,t0+e.t*spb,e.d*spb,vol,out)}
 const dur=len*spb;if(AU.gain){const gg=AU.gain.gain,base=.3*avol();try{gg.cancelScheduledValues(c.currentTime);gg.setValueAtTime(gg.value,c.currentTime);gg.linearRampToValueAtTime(base*.22,c.currentTime+.08);gg.setValueAtTime(base*.22,t0+dur);gg.linearRampToValueAtTime(base,t0+dur+.8)}catch(_){}AU.duckUntil=c.currentTime+dur+.9}
 if(AU.mp3on&&AU.mp3){try{AU.mp3.volume=mp3Vol()*.3}catch(_){}AU.mp3duck=Date.now()+dur*1000+600}
 setTimeout(()=>{try{out.disconnect()}catch(_){}},(dur+3)*1000)}catch(_){}}
/* 방마다 효과음 울림 */
function roomVerb(){const id=G.m&&G.m.id||'';return id==='church'?.32:id.startsWith('crypt')?.36:G.m&&G.m.def.room?.12:.06}
/* ---------- A126 주변 소리: 귀뚜라미, 바람, 비, 물방울, 벽난로, 성당 울림 + 가끔 부엉이, 먼 늑대, 새 ---------- */
function ambKind(){const m=G.m;if(!m||G.mode!=='play'||!G.s)return null;const id=m.id,F=G.s.flags;
 if(id==='village')return F.ch1_end?'dawn':F.night?'crickets':'wind';if(id==='forest')return F.ch1_end?'dawn':'wind';if(id==='cemetery')return'rain';if(id.startsWith('crypt'))return'deep';if(id==='church')return'hall';return'fire'}
const AMBD={crickets:{f:'bandpass',hz:4600,q:7,g:.03,lfo:17,ld:.9,ev:{owl:.05,howl:.012,bell:.006}},wind:{f:'bandpass',hz:500,q:.7,g:.06,lfo:.11,ld:.6,ev:{owl:.02,howl:.02,crow:.02}},
 rain:{f:'lowpass',hz:3000,q:.3,g:.045,lfo:.07,ld:.2,ev:{crow:.03}},deep:{f:'lowpass',hz:160,q:.5,g:.07,lfo:.05,ld:.4,ev:{drip:.25,moan:.02}},
 hall:{f:'lowpass',hz:260,q:.4,g:.03,lfo:.04,ld:.3,ev:{drip:.03}},fire:{f:'bandpass',hz:1100,q:.9,g:.018,lfo:9,ld:.85,ev:{pop:.4}},dawn:{f:'bandpass',hz:700,q:.6,g:.015,lfo:.1,ld:.4,ev:{bird:.35}}};
function ambStart(k){const c=actx();const D=AMBD[k];if(!c||!D)return;try{const n=c.createBufferSource();n.buffer=noiseBuf(c);n.loop=true;const f=c.createBiquadFilter();f.type=D.f;f.frequency.value=D.hz;f.Q.value=D.q;const g=c.createGain();g.gain.value=0;
 const lfo=c.createOscillator();lfo.frequency.value=D.lfo;const lg=c.createGain();lg.gain.value=D.g*D.ld*.5;lfo.connect(lg);lg.connect(g.gain);n.connect(f);f.connect(g);g.connect(c.destination);
 const base=D.g*(1-D.ld*.5)*avol()*2.2;g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(base,c.currentTime+1.2);n.start();lfo.start();AU.amb={k,n,lfo,g,base};AU.ambK=k}catch(_){AU.amb=null;AU.ambK=k}}
function ambStop(){const A=AU.amb;AU.amb=null;AU.ambK=null;if(!A)return;try{const c=actx();if(c){A.g.gain.cancelScheduledValues(c.currentTime);A.g.gain.setValueAtTime(A.g.gain.value,c.currentTime);A.g.gain.linearRampToValueAtTime(0,c.currentTime+.3)}setTimeout(()=>{try{A.n.stop();A.lfo.stop();A.g.disconnect()}catch(_){}},400)}catch(_){}}
function ambTick(){const want=G.s&&G.s.opt.sfx&&avol()>0?ambKind():null;if(want!==AU.ambK){ambStop();if(want)ambStart(want);AU.ambAt=G.now||0;return}if(!want)return;
 const now=G.now||0,dt=Math.min(.2,Math.max(0,(now-(AU.ambAt||now))/1000));AU.ambAt=now;const E=AMBD[want].ev;for(const k in E)if(Math.random()<E[k]*dt)ambOne(k)}
function ambOne(k){const c=actx();if(!c)return;try{const out=c.createGain();out.gain.value=.5*avol();out.connect(c.destination);const v=verb(c);if(v){const wt=c.createGain();wt.gain.value=.5;out.connect(wt);wt.connect(v)}const t0=c.currentTime+.02;
 const tone=(type,f1,f2,at,dur,gv)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f1,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),at+dur);const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(gv,at+Math.min(.08,dur*.3));g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(out);o.start(at);o.stop(at+dur+.05)};
 switch(k){
  case 'owl':tone('sine',410,380,t0,.32,.05);tone('sine',400,360,t0+.42,.5,.045);break;
  case 'howl':tone('sine',380,620,t0,.9,.022);tone('sine',620,430,t0+.9,1.2,.02);tone('sine',760,1240,t0,.9,.006);break;
  case 'crow':tone('sawtooth',820,560,t0,.14,.02);tone('sawtooth',800,540,t0+.22,.16,.018);break;
  case 'bell':for(let i=0;i<3;i++){tone('sine',147,146,t0+i*1.8,2.6,.05);tone('sine',147*2.76,147*2.7,t0+i*1.8,1.6,.015)}break;
  case 'drip':{const f=1400+Math.random()*900;tone('sine',f,f*.6,t0,.12,.06);break}
  case 'moan':tone('sawtooth',110,80,t0,1.6,.012);tone('sine',220,160,t0,1.6,.02);break;
  case 'pop':{const n=c.createBufferSource();n.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800+Math.random()*1500;const g=c.createGain();g.gain.setValueAtTime(.05,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+.05);n.connect(f);f.connect(g);g.connect(out);n.start(t0,Math.random()*.3);n.stop(t0+.06);break}
  case 'bird':{const b=2600+Math.random()*1400;for(let i=0;i<3;i++)tone('sine',b,b*1.25,t0+i*.13,.09,.025);break}}
 setTimeout(()=>{try{out.disconnect()}catch(_){}},6000)}catch(_){}}
/* ---------- 시작, 이어하기, 끝내기 ---------- */
function newGame(diff){G.s=newSave(diff);seed=(Date.now()&0xffffff)|1;G.st=stats();G.mode='prologue';G.pro={i:0,t0:G.now};G.tsub=null;sfx('ok')}
function startPlay(){G.mode='play';G.menu=null;G.sc=null;G.dlg=null;G.ask=null;G.qLast=null;G.awakeT=0;G.fade={a:1,v:-1,cb:null};const s=G.s;enterMap(s.map,s.x,s.y,[s.fx,s.fy]);G.st=stats();questChanged();G.last=0}
function continueGame(s){G.s=fixSave(s);G.st=stats();if(G.s.hp<=0)G.s.hp=G.st.hp;G.tsub=null;startPlay();sfx('ok')}
function goTitle(){G.mode='title';G.sel=readSave()?1:0;G.menu=null;G.sc=null;G.dlg=null;G.ask=null;G.shop=null;G.card=null;G.tele=null;G.tsub=null;G.m=null;G.hero=null;G.ents=[];G.fade={a:0,v:0,cb:null};playMusic('title',true)}
function quitGame(){if(G.mode==='play'&&G.s&&G.hero&&G.hero.st!=='dead')writeSave('manual');stopAll();G.keys={};try{K.back()}catch(_){}}
const ALIAS={KeyZ:'ok',KeyX:'send',KeyC:'clr',KeyV:'nate',KeyJ:'ok',KeyK:'send',KeyL:'clr',KeyI:'nate'};
let INST=null;
function create(kit){K=kit;host=kit.host;MK=(wd,ht)=>host&&host.makeCanvas?host.makeCanvas(wd,ht):null;
 const screen={
  enter(){imgLoad();G.keys={};G.kq=[];G.last=0;G.now=K.now();if(G.mode==='play'&&G.s&&G.m){if(G.hero&&G.hero.st!=='dead'&&!G.menu&&!G.sc)openPause();playMusic(typeof G.m.def.music==='function'?G.m.def.music(G.s):G.m.def.music,true)}else{goTitle()}},
  draw(g,t){G.now=t;setRS(g);const t0=w.performance?w.performance.now():0;g.save&&g.save();try{
   if(G.mode==='title')drawTitle(g,t);else if(G.mode==='prologue')drawPrologue(g,t);else if(G.mode==='over')drawOver(g,t);
   else if(G.mode==='play'&&G.m){drawWorld(g,t);drawHUD(g,t);if(G.dlg||G.ask)drawDialog(g,t);if(G.tele)drawTele(g,t);if(G.shop)drawShop(g,t);if(G.menu)drawMenu(g,t);if(G.card)drawCard(g,t)}
   if(G.fade.a>0){g.globalAlpha=G.fade.a;g.fillStyle='#000';g.fillRect(0,0,VW,VH);g.globalAlpha=1}
   if(G.lockAt&&t-G.lockAt<1600){g.fillStyle='rgba(10,6,16,.9)';g.fillRect(8,74,134,30);Tx(g,'슬라이드를 열면',VW/2,86,{size:8.5,bold:true,color:'#fff',align:'center'});Tx(g,'숫자 키로도 할 수 있어요',VW/2,98,{size:8.5,bold:true,color:'#fff',align:'center'})}
  }catch(err){w.console&&w.console.error&&w.console.error('vh draw',err)}g.restore&&g.restore();if(w.performance&&G.mode==='play')drawCost(w.performance.now()-t0)},
  needs(t){G.now=t;try{simulate(t);musicTick()}catch(err){w.console&&w.console.error&&w.console.error('vh step',err)}return true},
  key(id){G.now=G.now||K.now();const rep=!!G.keys[id];G.keys[id]=true;
   if(G.mode==='title'){titleKey(id);return true}if(G.mode==='prologue'){if(!rep)prologueKey(id);return true}if(G.mode==='over'){if(!rep)overKey(id);return true}
   if(G.mode!=='play')return true;
   if(G.card){if((id==='ok'||id==='5')&&G.now-(G.card.t0||G.now)>1200){G.card=null;sfx('ok')}return true}
   if(G.tele){if(!rep&&(id==='ok'||id==='5'||id==='clr')){G.tele=null;sfx('back')}return true}
   if(G.shop){shopKey(id);return true}if(G.menu){menuKey(id);return true}if(G.ask){askKey(id);return true}if(G.dlg){if(!rep)dlgKey(id);return true}
   if(G.fade.v||rep)return true;if(id==='menu'){if(!G.sc&&G.hero&&G.hero.st!=='dead')openPause();return true}G.kq.push({id});return true},
  event(type,v){if(type==='keyup'){if(v==='*all'){G.keys={};return}const had=G.keys[v];delete G.keys[v];if(had&&G.mode==='play'&&!G.menu&&!G.dlg&&!G.ask&&!G.shop)G.kq.push({id:v,up:true});return}
   if(type==='locked'){G.lockAt=G.now;return}
   if(type==='hide'){G.keys={};if(G.mode==='play'&&G.hero&&G.hero.st!=='dead'&&!G.sc)openPause();stopAll();return}
   if(type==='show'){if(G.mode==='play'&&G.m)playMusic(typeof G.m.def.music==='function'?G.m.def.music(G.s):G.m.def.music,true);else if(G.mode==='title')playMusic('title',true);return}
   if(type==='poweroff'){stopAll();return}},
  leave(why){G.keys={};G.kq=[];if(G.mode==='play'&&G.s&&G.hero&&G.hero.st!=='dead'&&G.m)writeSave('manual');stopAll();if(why!=='call'&&G.mode==='prologue')G.mode='title'},
  resume(){G.keys={};G.last=0;if(G.mode==='play'&&G.m){if(G.hero&&G.hero.st!=='dead'&&!G.menu&&!G.sc)openPause();playMusic(typeof G.m.def.music==='function'?G.m.def.music(G.s):G.m.def.music,true)}else playMusic('title',true)},
  ownsSound(){return true},
  repeats(id){if(G.mode==='play'&&!G.menu&&!G.shop&&!G.ask)return false;return['up','down','2','8'].includes(id)},
  keyAlias(code){return ALIAS[code]||null}};
 function preview(g,id,t,ww,hh){imgLoad(['title']);g.save&&g.save();try{const k=Math.min(ww/VW,hh/VH);g.scale(k,k);G.now=t;drawTitleArt(g,t,0);K.T(g,'반 헬싱',VW/2,42,{size:24,bold:true,color:'#f4e4c4',align:'center',shadow:'#a01020'});K.T(g,':  흡혈귀전  :',VW/2,62,{size:11,bold:true,color:'#e0c070',align:'center',shadow:'#000'})}catch(_){}g.restore&&g.restore()}
 function summary(){const D=K.D;if(D&&D.games&&D.games.vhClear)return'제1장 완료';const s=readSave();return s?'레벨 '+s.lv+' · '+(MAPS[s.map]?MAPS[s.map].n:''):'새 게임'}
 INST={preview,summary};
 return{screens:{vh:screen},preview,summary,version:VERSION,
  _test:{G,AU,SONGS,MAPS,MAP_ROWS,LEG,ENEMY,NPC,EV,FN,ENGFN,ITEM,WEAPON,SKILL,SUB,RELIC,TAROT,newSave,readSave,writeSave,fixSave,enterMap,buildMap,stepWorld,simulate,stats,hurtHero,hurtMob,killMob,runScript,mainStep,sideList,findInteract,interact,
   startSwing,inputDir,flowStep,updateFlow,los,checkExits,changeMap,openShop,shopKey,shopList,menuKey,menuItems,openPause,useItem,gainExp,expNeed,collect,dropPick,lightBraziers,setArena,activateBoss,questChanged,parseTrack,nfreq,
   routeTo,newGame,startPlay,continueGame,goTitle,mkMob,sprite,cubeCv,propCv,floorTile,faceRows,npcRows,screen,IM,imgOk,imgLoad,setArtPref,artOn,floorHi,faceImg,playMusic,stopMusic,stopAll,jingle,ambKind,actx,setSeed:v=>{seed=v|0}}}}
w.AnycallVH={version:VERSION,build:BUILD,create,preview:(g,id,t,ww,hh)=>{if(INST)INST.preview(g,id,t,ww,hh)},summary:()=>INST?INST.summary():'새 게임'};
})(window);
