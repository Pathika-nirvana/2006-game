/* A124 애니콜 휴대폰 게임 (버전 A124 · 2026-11-17 KST)
   NATE 게임에서 받아서 휴대폰 게임 메뉴에서 하는 진짜 게임 두 개. 액정 화면(src/anycall-lcd.js)이 화면으로 붙인다.
   - 쿵짝 리듬왕: 떨어지는 음표를 줄마다 숫자 키로 맞히는 리듬 게임. 곡은 PC 뮤직박스 인기곡과 리듬왕 전용 곡(지어낸 곡).
     음표를 맞히면 그 음이 나고(키 소리), 반주와 북소리는 박자에 맞춰 미리 걸어 둔다. 쉬움 · 보통 · 어려움, 피버, 속도와 박자 맞추기.
   - 골목대장 전설: 은하 마을, 뒷산, 폐교를 지나 도깨비 대장에게서 황금 딱지를 되찾는 롤플레잉. 레벨, 기술, 가게, 상자, 저장.
   그림은 모두 이 파일 안의 16×16 도트 그림(글자 한 칸이 점 하나)과 코드로 그린 땅 칸이다. 따로 받은 그림 파일은 쓰지 않는다. */
(function(w){'use strict';
const VERSION='A124';
/* ---------- 도트 그림 (글자 하나가 점 하나, '.' 은 빈칸) ---------- */
const PAL={"k":"#1b1b26","s":"#f5cfa6","S":"#d9a37a","h":"#3b2618","H":"#6a4426","r":"#e23b2e","R":"#9e2219","b":"#3a6fd0","B":"#1e3c7a","y":"#ffd54a","Y":"#d69a12","w":"#ffffff","e":"#c9ced8","E":"#7c8494","g":"#5cbf4a","G":"#2f7d2a","n":"#a8703c","N":"#6b4322","p":"#ff8fb4","P":"#d0507a","o":"#ff9a3a","O":"#c4621a","u":"#9fd6ff","U":"#4a8ad0","v":"#9a6ae0","V":"#55308f","c":"#fff1c4","m":"#3a3a48","l":"#a6e070","x":"#ff5a5a","z":"#e6e9f0"};
const SPR={
 hero_d0:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssSSsssk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","..ksrrrrrrrrsk..","...kkbbbbbbkk...","....kbbkkbbk....","....kwwk.kwwk...","....kkk...kkk..."],
 hero_d1:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssSSsssk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","..kkrrrrrrrrsk..","...kkbbbbbbkk...","....kbbk.kbbk...","...kwwk...kwwk..","...kkk.....kkk.."],
 hero_u0:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kyyyyyyyyk...","...khhhhhhhhk...","...khhhhhhhhk...","...kshhhhhhsk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","..ksrrrrrrrrsk..","...kkbbbbbbkk...","....kbbkkbbk....","....kwwk.kwwk...","....kkk...kkk..."],
 hero_u1:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kyyyyyyyyk...","...khhhhhhhhk...","...khhhhhhhhk...","...kshhhhhhsk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","..ksrrrrrrrrkk..","...kkbbbbbbkk...","...kbbk.kbbk....","..kwwk...kwwk...","..kkk.....kkk..."],
 hero_r0:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYYYk.","...khhssssskk...","...khhsssksk....","...khssssSSk....","....kssssssk....","....kkrrrrkk....","....ksrrrrrk....","....ksrrrrrk....","....kkbbbbkk....",".....kbbbbk.....",".....kwwwwk.....",".....kkkkkk....."],
 hero_r1:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYYYk.","...khhssssskk...","...khhsssksk....","...khssssSSk....","....kssssssk....","....kkrrrrkk....","...ksrrrrrrsk...","....krrrrrrk....","....kkbbbbkk....","...kbbk..kbbk...","..kwwk....kwwk..","..kkk......kkk.."],
 mom:["................","....kkkkkkkk....","...khhhhhhhhk...","..khhHhhHhhHhk..","..khhssssssshk..","..khskssssksk...","...kssssssssk...","...ksssPPsssk...","....kssssssk....","...kppwwwwppk...","..kspwwwwwwpsk..","..kspwwwwwwpsk..","...kpwwwwwwpk...","....kppppppk....","....kssk.kssk...","....kkk...kkk..."],
 shop:["................",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","...khsssssshk...","...kkkkskkkkk...","...kkwkskwkks...","...kssssssssk...","....ksSSSSsk....","...kkewwwwekk...","..ksnewwwwensk..","..ksnewwwwensk..","...knnnnnnnnk...","....kEEkkEEk....","....kNNk.kNNk...","....kkk...kkk..."],
 aunt:["................","....kkkkkkkk....","...kxxxxxxxxk...","..kxxwxxxxwxxk..","..khssssssssk...","..khskssssksk...","...kssssssssk...","...kssxxxxssk...","....kssssssk....","...kooowwoook...","..ksowwwwwwosk..","..ksowwwwwwosk..","...kowwwwwwok...","....kooooook....","....kssk.kssk...","....kkk...kkk..."],
 girl:["................","..kk.kkkkkk.kk..",".khhkhhhhhhkhhk.",".khhhhhhhhhhhhk.","..khhssssssshk..","...kskssssksk...","...ksssssssskk..","...ksssPPsssk...","....kssssssk....","...kkppppppkk...","..kspppppppppsk.","..kspppppppppsk.","...kpppppppppk..","....kkkkkkkkk...","....kssk.kssk...","....kkk...kkk..."],
 grandpa:["................",".....kkkkkk.....","....kzzzzzzk....","...kzzzzzzzzk...","...kzsssssszk...","...kskssssksk...","...kssssssssk...","...kszzzzzzsk...","....kszzzzsk....","...kkGGGGGGkk..n","..ksGGGGGGGGskn.","..ksGGGGGGGGsn..","...kkEEEEEEkkn..","....kEEkkEEkn...","....kNNk.kNNn...","....kkk...kkk..."],
 kid:["................","................",".....kkkkkk.....","....khhhhhhk....","...khhhhhhhhk...","...khsssssshk...","...kskssssksk...","...ksssssssskk..","....ksswwssk....","....kkuuuukk....","...ksuuuuuusk...","...ksuuuuuusk...","....kkbbbbkk....","....kbbkkbbk....","....kwwk.kwwk...","....kkk...kkk..."],
 m_slime:["................","................","................",".......kk.......","......kppk......",".....kppppk.....","....kpwppppk....","...kpwwppppPk...","...kppkppkpPk...","..kpppkppkppPk..","..kppppppppppk..","..kpppPPPPpppk..",".kppppppppppPPk.",".kPPppppppppPPk.","..kkPPPPPPPPkk..","....kkkkkkkk...."],
 m_mosq:["................","..uu........uu..",".uwwu......uwwu.",".uwwwu....uwwwu.","..uwwwukkuwwwu..","...uuukEEkuuu...","......kEEk......","....kkkEEkkk....","...kxkEEEEkxk...","...kkkEEEEkkk...",".....kEmEEk.....",".....kEEmEk.....","......kEEk......","......kmmk......","....kk.kk.kk....","...k...k...k...."],
 m_cat:["................","..kk........kk..","..kok......kok..","..kook....kook..","..kooookkooook..","..koooooooooook.",".koykkooookykok.",".kooykooooykook.",".kooooopppooook.","..koooowwooook..","..kkooooooookk..","...kowwwwwwok...","...kowwwwwwok...","..koooowwoooook.","..kook.kk.kookk.","..kkk......kkk.."],
 m_crow:["................","......kkkk......",".....kmmmmk.....","....kmmmmmmk....","....kmwkmmmkk...","....kmmmmmmyyk..","....kmmmmmmyk...","...kmmmmmmmk....","..kmmmmmmmmmk...",".kmmEmmmmmmmmk..","kmmEmmmmmmmmmmk.","kmEmmmmmmmmmEmk.",".kkmmmmmmmmEmk..","...kkmmmmmmkk...",".....kykkyk.....","....kyk..kyk...."],
 m_ghost:["................",".....kkkkkk.....","....kwwwwwwk....","...kwwwwwwwwk...","..kwwwwwwwwwwk..","..kwwkkwwkkwwk..","..kwwkkwwkkwwk..","..kwwwwwwwwwwk..","..kwwwwkkwwwwk..","..kwwwkwwkwwwkkk","..kwwwwwwwwwwkek","..kwwwwwwwwwwkek","..kwwwwwwwwwwkkk","..kwkwwkwwkwwk..","..kk.kk.kk.kkk..","................"],
 m_shadow:["....k......k....","...kyk....kyk...","...kyk....kyk...","....kvvvvvvk....","...kvvvvvvvvk...","..kvvvvvvvvvvk..","..kvwykvvwykvk..","..kvvvvvvvvvvk.n","..kvvkwwwwkvvkn.","...kvvvvvvvvkNn.","..kVvvvvvvvvVkn.",".kVVvvvvvvvvVVk.",".kVkvvvvvvvvkVk.","...kvvvkkvvvk...","...kVVk..kVVk...","...kkk....kkk..."],
 m_skel:["................",".....kkkkkk.....","....kzzzzzzk....","...kzzzzzzzzk...","...kzkkzzkkzk...","...kzkkzzkkzk...","...kzzzkkzzzk...","....kzkzkzkk....",".....kkkkkk.....","..kkkzkzzkzkkk..",".kz.kzzzzzzk.zk.",".kz.kzkzzkzk.zk.","....kzzzzzzk....",".....kzkkzk.....","....kzk..kzk....","....kkk..kkk...."],
 m_king:["..k..........k..",".kyk........kyk.",".kyyk......kyyk.","..kyykkkkkkyyk..","...kxxxxxxxxk...","..kxxxxxxxxxxk..",".kxxwkkxxwkkxxk.",".kxxwkkxxwkkxxk.",".kxxxxxxxxxxxxk.",".kxxkwkwkwkwxxk.",".kxxkkkkkkkkxxk.","..kxxxxxxxxxxkk.",".kRRxxxxxxxxRRkn","kRRkxxxxxxxxkRRn","kxk.kRRRRRRk.knk","kk..kkk..kkk..k."],
 dance0:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssSSsssk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","..ksrrrrrrrrsk..","...kkbbbbbbkk...","....kbbkkbbk....","....kwwk.kwwk...","....kkk...kkk..."],
 dance1:["..ks........sk..","..kskkkkkkkksk..","...kyyyyyyyyk...","..kyyyyyyyyyyk..","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssPPsssk...","....kssssssk....","...kkrrrrrrkk...","....krrrrrrk....","....krrrrrrk....","...kkbbbbbbkk...","...kbbk..kbbk...","..kwwk....kwwk..","..kkk......kkk.."],
 dance2:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssPPsssk...",".ks.kssssssk....","..kskrrrrrrkk...","...kkrrrrrrrsk..","....krrrrrrrsk..","...kkbbbbbbkk...","...kbbk.kbbk....","..kwwk..kwwk....","..kkk...kkk....."],
 dance3:["................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...kskssssksk...","...ksssPPsssk...","....kssssssk.sk.","...kkrrrrrrksk..","..ksrrrrrrrkk...","..ksrrrrrrrk....","...kkbbbbbbkk...","....kbbk.kbbk...","....kwwk..kwwk..","....kkk...kkk..."],
 dance_sad:["................","................",".....kkkkkk.....","....kyyyyyyk....","...kyyyyyyyyk...","...kYYYYYYYYk...","...khsssssshk...","...ksksssksk....","...kssskksssk...","....kssssssk....","...kkrrrrrrkk...","..ksrrrrrrrrsk..","...kkbbbbbbkk...","....kbbkkbbk....","....kwwk.kwwk...","....kkk...kkk..."]
};
/* ---------- 음 높이 ---------- */
const parseTune=s=>String(s||'').trim().split(/\s+/).filter(Boolean).map(tok=>{const [n,d]=tok.split(':');return{n,d:Number(d)>0?Number(d):1}});
function midiOf(n){const m=/^([A-G])(#|b)?(\d)$/.exec(String(n||''));if(!m)return null;return(Number(m[3])+1)*12+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)}
const hz=m=>440*Math.pow(2,(m-69)/12);
/* 받침에 따라 조사 고르기: jo('들고양이','이','가') → '들고양이가'. 숫자로 끝나면 숫자 읽는 소리로 */
const josa=(w,a,b)=>{const s=String(w||''),ch=s.charAt(s.length-1),c=ch.charCodeAt(0)-0xAC00;if(c>=0&&c<=11171)return(c%28)?a:b;if(/[0-9]/.test(ch))return'013678'.includes(ch)?a:b;return a};
const jo=(w,a,b)=>String(w||'')+josa(w,a,b);
/* 리듬 게임 전용 곡 두 개 (지어낸 곡). 나머지는 PC 뮤직박스 인기곡(WebTown.SONGS)을 그대로 쓴다 */
const ORIG=[
 {id:'x1',title:'쿵짝 리듬왕 테마',artist:'리듬왕 밴드',bpm:128,mel:'C5:0.5 C5:0.5 G5:1 E5:0.5 G5:0.5 A5:1 G5:0.5 E5:0.5 C5:0.5 D5:0.5 E5:2 F5:0.5 F5:0.5 A5:1 G5:0.5 E5:0.5 D5:1 E5:0.5 D5:0.5 C5:0.5 D5:0.5 C5:2',bass:'C3:2 C3:2 F2:2 G2:2 F2:2 G2:2 C3:4'},
 {id:'x2',title:'떡볶이 펑크',artist:'은하분식 밴드',bpm:116,mel:'E5:0.5 R:0.5 E5:0.5 G5:0.5 R:0.5 E5:0.5 D5:1 C5:0.5 R:0.5 C5:0.5 D5:0.5 E5:1 D5:1 E5:0.5 R:0.5 E5:0.5 G5:0.5 A5:1 G5:0.5 E5:0.5 D5:0.5 C5:0.5 D5:1 C5:2',bass:'A2:1 A2:1 A2:1 A2:1 F2:1 F2:1 G2:1 G2:1 A2:1 A2:1 A2:1 A2:1 F2:1 G2:1 C3:2'}];
/* ---------- 골목대장 전설 데이터 ---------- */
const heroBase=lv=>({hp:30+(lv-1)*8,mp:10+(lv-1)*3,atk:8+(lv-1)*2,def:4+Math.floor((lv-1)*1.5),spd:6+(lv-1)});
const expNeed=lv=>8+lv*lv*3;
const ITEMS={skewer:{n:'떡꼬치',hp:30,price:30},cup:{n:'컵떡볶이',hp:80,price:80},slushB:{n:'파란 슬러시',mp:15,price:60},slushR:{n:'빨간 슬러시',mp:40,price:150},hotdog:{n:'설탕 핫도그',hp:999,price:200},
 ddakji:{n:'딱지',dmg:30,price:40},marble:{n:'왕구슬',key:true},key:{n:'과학실 열쇠',key:true},goldDdakji:{n:'황금 딱지',key:true}};
const WEAPONS=[{id:'ruler',n:'30cm 자',atk:3,price:50},{id:'recorder',n:'리코더',atk:7,price:180},{id:'saber',n:'장난감 광선검',atk:12,price:420}];
const ARMORS=[{id:'gym',n:'체육복',def:3,price:60},{id:'bag',n:'책가방 방패',def:6,price:200},{id:'raincoat',n:'노란 우비',def:10,price:450}];
const SKILLS=[{id:'ddak',n:'딱지치기',lv:1,mp:2,mul:1.5},{id:'cheer',n:'응원가',lv:3,mp:3,heal:true},{id:'marble',n:'구슬 폭탄',lv:5,mp:5,mul:2.2,pierce:.5},{id:'rubber',n:'고무줄 묶기',lv:7,mp:7,mul:1.2,stun:true},{id:'punch',n:'골목대장 펀치',lv:9,mp:10,mul:3}];
const MON={slime:{n:'껌딱지 슬라임',hp:14,atk:6,def:2,spd:3,exp:6,gold:8,spr:'m_slime',drop:['skewer',.15]},mosq:{n:'왕모기',hp:18,atk:8,def:2,spd:9,exp:8,gold:10,spr:'m_mosq'},
 cat:{n:'들고양이',hp:26,atk:11,def:4,spd:7,exp:12,gold:15,spr:'m_cat',drop:['skewer',.2]},crow:{n:'까마귀',hp:30,atk:13,def:5,spd:10,exp:16,gold:18,spr:'m_crow'},
 ghost:{n:'분필 유령',hp:42,atk:15,def:8,spd:6,exp:22,gold:24,spr:'m_ghost',drop:['slushB',.2]},shadow:{n:'그림자 도깨비',hp:58,atk:18,def:10,spd:8,exp:32,gold:35,spr:'m_shadow',drop:['cup',.2]},
 skel:{n:'과학실 해골 모형',hp:130,atk:19,def:9,spd:7,exp:80,gold:100,spr:'m_skel',boss:true},king:{n:'도깨비 대장',hp:230,atk:26,def:13,spd:9,exp:0,gold:0,spr:'m_king',boss:true,big:true}};
const SHOPS={mungu:{name:'별빛문구',owner:'문방구 아저씨',face:'shop',greet:['어서 와라~ 오늘은 뭐 사러 왔니?','(무기와 옷은 사면 바로 쓴다)'],bye:['또 와라~ 딱지 새로 들어온다!'],list:[['w','ruler'],['w','recorder'],['w','saber'],['a','gym'],['a','bag'],['a','raincoat'],['i','ddakji']]},
 bunsik:{name:'은하분식',owner:'분식집 이모',face:'aunt',greet:['배고프지? 골라 봐~ 국물은 서비스!'],bye:['조심히 다녀와~ 배고프면 또 와!'],list:[['i','skewer'],['i','cup'],['i','slushB'],['i','slushR'],['i','hotdog']]}};
const BLOCK=new Set(['#','~','=','R','H','D','S','C','c','L','K','B','T','I','W']);
const OBJ=new Set(['#','B','=','S','C','c','T','I']);
const MAPS={
 town:{name:'은하 마을',music:'town',battle:'field',ground:'.',void:'#2f7d2a',rows:['######::############','#.,..::::......,...#','#RRRR.::.RRRRR.....#','#HHDH.::.HHDHH..,..#','#.S...::.....S.....#','#:::::::::::::::::.#','#:..,...:.......:..#','#:.RRRR.:..~~~~.:..#','#:.HDHH.:..~~~~.:..#','#:......:.......:.,#','#::::::::::::::::..#','#.,....=====....,..#','#...,..........,...#','#..................#','####################'],
  events:{'3,3':{t:'home'},'11,3':{t:'shop',shop:'mungu'},'4,8':{t:'shop',shop:'bunsik'},'2,4':{t:'sign',text:'← 우리 집 (엄마에게 말 걸면 힘이 다 차고 저장)\n↑ 위쪽 길: 뒷산'},'13,4':{t:'sign',text:'별빛문구 · 무기와 옷, 딱지\n은하분식은 연못 왼쪽!'}},
  exits:[{x:6,y:0,to:'forest',tx:8,ty:16,dir:'u'},{x:7,y:0,to:'forest',tx:9,ty:16,dir:'u'}],
  npcs:[{id:'girl',spr:'girl',name:'지혜',x:9,y:9,wander:2,say:s=>s.flags.ending?['우와, 진짜 황금 딱지 찾아왔어? 대박!!']:['도깨비 진짜 있대! 뒷산 풀숲에서 껌딱지 슬라임 봤어 ㅠㅠ','분식집 컵떡볶이 먹으면 힘이 쑥쑥 나~']},
   {id:'grandpa',spr:'grandpa',name:'할아버지',x:10,y:6,wander:1,say:['허허, 옛날엔 우리도 도깨비랑 씨름을 했지.','폐교 과학실의 해골이 열쇠를 갖고 있다더구나.','레벨 4쯤 되면 폐교에 가 보거라.']}]},
 forest:{name:'뒷산 숲길',music:'field',battle:'field',ground:'.',void:'#2f7d2a',rows:['########::########','#....,..::..,...C#','#.BB....::....BB.#','#.B...:::::....B.#','#....::...::.....#','#.,..:..C..::..,.#','##...:.......:...#','#....::.....::...#','#.~~..:::::::....#','#.~~.....:.....,.#','#........:...BB..#','#..,..BB.::......#','#.......:.:...,..#','#.S....::..:.....#','#......:....::...#','#..,...::....:...#','#.......::.......#','########::########'],
  enc:{rate:12,list:[['slime',5],['mosq',4],['cat',3],['crow',1]]},safe:(x,y)=>y>=15,
  events:{'8,5':{t:'chest',id:'f_marble',item:'marble'},'16,1':{t:'chest',id:'f_c2',item:'cup',n:2},'2,13':{t:'sign',text:'↑ 폐교 (도깨비 조심!)\n↓ 은하 마을'}},
  exits:[{x:8,y:17,to:'town',tx:6,ty:1,dir:'d'},{x:9,y:17,to:'town',tx:7,ty:1,dir:'d'},{x:8,y:0,to:'school',tx:8,ty:10,dir:'u'},{x:9,y:0,to:'school',tx:9,ty:10,dir:'u'}],
  npcs:[{id:'kid',spr:'kid',name:'꼬마',x:14,y:9,say:s=>s.flags.kidDone?['구슬 찾아 줘서 고마워! 최고!']:s.items.marble?['우와! 내 왕구슬이다!!']:['내 왕구슬 잃어버렸어 ㅠㅠ','위쪽 풀숲 상자에 들어간 것 같아...'],
   give:{flag:'kidDone',need:'marble',gold:120,item:'slushR',text:['고마워! 이거 엄마가 준 용돈이랑 슬러시야. 가져!','(120원과 빨간 슬러시를 받았다!)']}}]},
 school:{name:'폐교 1층',music:'field',battle:'school',ground:'F',void:'#2a2420',rows:['LLLLLLLLLLLLLLLLLL','LUFFLFFFFFLFFFFFFL','LFFFLFTTTFLFFFFFFL','LFFFLFFFFFLFFTTFFL','LLKLLLLFLLLLLLFLLL','LFFFFFFFFFFFFFFFFL','LFFFFFFFFFFFFFFFFL','LLLLFLLLLLLLFLLLLL','LFFFFFFLFFFFFFFCFL','LFTTFFFLFFTTFFFFFL','LFFFFCFLFFFFFFFFFL','LLLLLLLLggLLLLLLLL'],
  enc:{rate:11,list:[['crow',3],['ghost',4],['shadow',3]]},safe:(x,y)=>x<=3&&y<=3||y>=10&&x>=8&&x<=9,
  events:{'2,4':{t:'lock',flag:'stairOpen',key:'key',text:'문이 잠겨 있다. 과학실 열쇠가 필요해.',okText:'과학실 열쇠로 문을 열었다! (철컥)',openAs:'F'},'1,1':{t:'stairs',to:'roof',tx:1,ty:7,dir:'r'},
   '5,10':{t:'chest',id:'s_c1',item:'cup',n:2},'15,8':{t:'chest',id:'s_c2',item:'slushR',gold:150}},
  exits:[{x:8,y:11,to:'forest',tx:8,ty:1,dir:'d'},{x:9,y:11,to:'forest',tx:9,ty:1,dir:'d'}],
  npcs:[{id:'skel',spr:'m_skel',name:'해골 모형',x:13,y:2,bob:1,flagGone:'skel',say:['딸깍딸깍... 누가 감히 과학실에 들어왔느냐!','열쇠를 원한다면 나를 이겨 보아라!'],battle:{mon:'skel',flag:'skel',after:s=>{s.items.key=1},win:['과학실 해골 모형이 와르르 무너졌다!','과학실 열쇠를 얻었다! (왼쪽 위 잠긴 문)']}}]},
 roof:{name:'폐교 옥상',music:'boss',battle:'roof',ground:'o',void:'#3a1a4a',rows:['IIIIIIIIIIII','IooooooooooI','IooooooooooI','IooooooooooI','IooooooooooI','IooooooooooI','IooooooooooI','IooooooooooI','IVoooooooooI','IIIIIIIIIIII'],
  hide:(x,y,s)=>x===5&&y===2&&s.flags.king?(s.flags.gold?'c':'C'):null,
  events:{'1,8':{t:'stairs',to:'school',tx:1,ty:2,dir:'d'},'5,2':{t:'chest',id:'gold',item:'goldDdakji',need:'king',after:s=>INST?.ending?.()}},
  npcs:[{id:'king',spr:'m_king',name:'도깨비 대장',x:5,y:2,big:2,bob:1,flagGone:'king',say:['하하하! 황금 딱지는 이제 내 거다!','꼬맹이가 여기까지 오다니 제법이구나. 덤벼라!'],
   battle:{mon:'king',flag:'king',win:['도깨비 대장: 으아악! 졌다, 졌어!','도깨비 대장: 황금 딱지는 돌려주마... 그 상자 안에 있다.']}}]}};
const TUNES={title:[110,'E5:1 G5:0.5 A5:0.5 C6:1 A5:1 G5:1 E5:0.5 D5:0.5 E5:2 C5:1 D5:0.5 E5:0.5 G5:1 E5:1 D5:1 C5:0.5 D5:0.5 C5:2','C3:2 A2:2 F2:2 G2:2 C3:2 A2:2 G2:2 C3:2'],
 town:[120,'C5:1 E5:0.5 G5:0.5 A5:1 G5:1 E5:1 D5:0.5 E5:0.5 C5:2 D5:1 E5:0.5 F5:0.5 G5:1 E5:1 D5:1 C5:0.5 D5:0.5 C5:2','C3:2 A2:2 F2:2 G2:2 C3:2 A2:2 G2:2 C3:2'],
 field:[132,'E5:0.5 G5:0.5 A5:1 G5:0.5 E5:0.5 D5:1 E5:0.5 G5:0.5 C6:1 B5:0.5 A5:0.5 G5:2 A5:0.5 G5:0.5 E5:1 D5:0.5 C5:0.5 D5:1 E5:0.5 D5:0.5 C5:2','A2:2 F2:2 C3:2 G2:2 A2:2 F2:2 G2:2 C3:2'],
 battle:[160,'A4:0.5 A4:0.5 C5:0.5 A4:0.5 D5:0.5 A4:0.5 E5:1 A4:0.5 A4:0.5 C5:0.5 A4:0.5 G4:0.5 A4:0.5 E4:1 A4:0.5 C5:0.5 E5:0.5 A5:0.5 G5:0.5 E5:0.5 D5:1 C5:0.5 B4:0.5 A4:2','A2:1 A2:1 A2:1 A2:1 F2:1 F2:1 G2:1 G2:1 A2:1 A2:1 A2:1 A2:1 F2:1 G2:1 A2:2'],
 boss:[150,'E4:0.5 F4:0.5 E4:0.5 D#4:0.5 E4:1 B4:1 C5:0.5 B4:0.5 A4:0.5 G#4:0.5 A4:1 E4:1 E4:0.5 F4:0.5 G#4:0.5 A4:0.5 B4:1 E5:1 D5:0.5 C5:0.5 B4:0.5 G#4:0.5 A4:2','E2:1 E2:1 E2:1 E2:1 A2:1 A2:1 A2:1 A2:1 E2:1 E2:1 E2:1 E2:1 B2:1 B2:1 E2:2'],
 ending:[96,'C5:1 E5:0.5 G5:0.5 A5:1 G5:1 E5:1 D5:0.5 E5:0.5 C5:2 D5:1 E5:0.5 F5:0.5 G5:1 E5:1 D5:1 C5:0.5 D5:0.5 C5:3','C3:2 A2:2 F2:2 G2:2 C3:2 A2:2 G2:2 C3:3']};
const STORY='[골목대장 전설]\n\n2006년 5월 30일 오후 4시 32분.\n동네 아이들의 보물 ‘황금 딱지’가 사라졌다!\n\n범인은 뒷산 너머 폐교에 산다는 도깨비 대장.\n\n떡꼬치 두 개를 챙긴 골목대장이 길을 나선다.\n\n2 4 6 8 걷기 · 5 조사 · 매뉴 메뉴\n싸움: 1 공격 2 기술 3 가방 4 도망';
let INST=null;

function create(K){
 const {W,H,TOP,BOT,R,T,grad,rr,circ,wrap,clamp,host,D,now,save,pop,ask,status,soft,title,body,back}=K;
 if(!D.games||typeof D.games!=='object')D.games={};
 const SCREENS={};
 /* ---------- 도트 그림 그리기 (한 번 만든 그림은 기억해 두고 붙인다) ---------- */
 const SC=new Map();
 function sprite(key,flip){const id=key+(flip?'~':'');if(SC.has(id))return SC.get(id);const m=SPR[key];let cv=null;
  try{if(m&&host.makeCanvas){cv=host.makeCanvas(16,16);const x=cv.getContext&&cv.getContext('2d');if(x){for(let r=0;r<16;r++)for(let c=0;c<16;c++){const ch=m[r][flip?15-c:c];if(ch==='.'||ch===' '||!PAL[ch])continue;x.fillStyle=PAL[ch];x.fillRect(c,r,1,1)}}else cv=null}}catch(_){cv=null}
  SC.set(id,cv);return cv}
 function blit(g,cv,x,y,wd,ht){const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=false;try{g.drawImage(cv,Math.round(x),Math.round(y),wd,ht)}catch(_){}g.imageSmoothingEnabled=sm}
 function spr(g,key,x,y,s=1,flip=false,alpha=1){const cv=sprite(key,flip);if(alpha<1)g.globalAlpha=alpha;
  if(cv)blit(g,cv,x,y,16*s,16*s);else{const m=SPR[key];if(m)for(let r=0;r<16;r++)for(let c=0;c<16;c++){const ch=m[r][flip?15-c:c];if(ch==='.'||!PAL[ch])continue;g.fillStyle=PAL[ch];g.fillRect(x+c*s,y+r*s,s,s)}}
  if(alpha<1)g.globalAlpha=1}
 /* 땅과 물건 칸 (16×16) */
 const TC=new Map();
 function paintTile(x,ch){const P=(c,a,b,w2,h2)=>{x.fillStyle=c;x.fillRect(a,b,w2,h2)};
  const grass=()=>{P('#6cc04a',0,0,16,16);for(const [a,b] of [[2,3],[9,1],[13,6],[5,10],[11,12],[1,14],[7,6]])P('#4f9e36',a,b,1,2);for(const [a,b] of [[4,5],[12,9],[8,14]])P('#8ad66a',a,b,1,1)};
  switch(ch){
   case '.':grass();break;
   case ',':grass();for(const [a,b,c] of [[3,4,'#ff5a5a'],[11,9,'#ffd54a'],[6,12,'#ffffff']]){P(c,a,b,2,2);P('#ffd54a',a,b,1,1)}break;
   case ':':P('#d9b67a',0,0,16,16);for(const [a,b] of [[3,2],[11,5],[6,9],[13,13],[2,12]])P('#c49a5a',a,b,2,1);for(const [a,b] of [[8,3],[4,7],[10,11]])P('#e8cc96',a,b,1,1);break;
   case '~':P('#3a8ad8',0,0,16,16);P('#7ac0ff',2,4,5,1);P('#7ac0ff',9,9,5,1);P('#5aa0e8',4,13,6,1);break;
   case 'R':P('#c8402e',0,0,16,16);for(const r of [0,4,8,12]){P('#8a2a1e',0,r+3,16,1);P('#8a2a1e',(r/4%2)*4+2,r,1,3);P('#8a2a1e',(r/4%2)*4+10,r,1,3)}P('#e86a52',0,0,16,1);break;
   case 'H':P('#f0deb0',0,0,16,16);P('#d8c090',0,15,16,1);P('#6b4322',4,4,8,7);P('#9fd6ff',5,5,6,5);P('#6b4322',7,5,1,5);P('#6b4322',5,7,6,1);break;
   case 'D':P('#f0deb0',0,0,16,16);P('#6b4322',3,2,10,14);P('#a8703c',4,3,8,13);P('#8a5a2a',5,5,6,4);P('#ffd54a',10,9,1,2);break;
   case 'L':P('#d8ccb0',0,0,16,16);P('#c8bca0',0,6,16,1);P('#9a8868',0,12,16,4);P('#b8a888',0,12,16,1);break;
   case 'F':P('#c8935a',0,0,16,16);for(const r of [3,7,11,15])P('#a87440',0,r,16,1);for(const [a,b] of [[5,0],[11,4],[3,8],[9,12]])P('#a87440',a,b,1,3);break;
   case 'o':P('#b8bcc4',0,0,16,16);P('#9a9ea8',3,5,4,1);P('#9a9ea8',10,11,3,1);P('#a8acb4',0,15,16,1);break;
   case 'U':case 'V':P('#9aa0aa',0,0,16,16);for(const r of [3,7,11,15])P('#6a707a',0,r,16,1);if(ch==='U'){P('#fff',7,1,2,1);P('#fff',6,2,4,1)}else{P('#fff',6,13,4,1);P('#fff',7,14,2,1)}break;
   case 'K':P('#d8ccb0',0,0,16,16);P('#6b4322',1,0,14,16);P('#a8703c',2,1,12,15);P('#ffd54a',7,7,3,4);P('#1b1b26',8,8,1,2);break;
   case 'g':P('#c8935a',0,0,16,16);P('#6b4322',1,0,14,16);P('#ffe8a0',2,0,12,16);P('#fff6d0',4,0,8,16);break;
   case '#':P('#6b4322',6,10,4,6);P('#2f7d2a',1,2,14,8);P('#2f7d2a',3,0,10,12);P('#4fa83a',3,2,5,3);P('#4fa83a',9,4,3,2);P('#245f20',1,9,14,1);break;
   case 'B':P('#3f8f32',1,3,14,12);P('#2f7d2a',1,11,14,4);P('#5cbf4a',3,5,4,2);P('#5cbf4a',9,7,3,2);break;
   case '=':P('#a8703c',0,5,16,2);P('#a8703c',0,10,16,2);P('#6b4322',2,3,2,11);P('#6b4322',10,3,2,11);break;
   case 'I':P('#5a5f6a',0,4,16,2);P('#5a5f6a',0,11,16,2);for(const a of [1,5,9,13])P('#7c8494',a,4,1,9);break;
   case 'S':P('#6b4322',7,9,2,7);P('#d8a860',2,3,12,7);P('#6b4322',2,3,12,1);P('#6b4322',2,9,12,1);P('#8a6a4a',4,5,8,1);P('#8a6a4a',4,7,6,1);break;
   case 'C':P('#6b4322',2,5,12,10);P('#a8703c',3,6,10,8);P('#c8904c',2,4,12,4);P('#6b4322',2,8,12,1);P('#ffd54a',7,7,2,3);break;
   case 'c':P('#6b4322',2,7,12,8);P('#3a2414',3,8,10,3);P('#a8703c',3,11,10,3);P('#c8904c',2,2,12,4);break;
   case 'T':P('#b88a4a',1,4,14,9);P('#d8aa6a',1,4,14,3);P('#6b4322',2,13,2,3);P('#6b4322',12,13,2,3);break;
   default:P('#1a1a24',0,0,16,16)}}
 function tileCv(ch){if(TC.has(ch))return TC.get(ch);let cv=null;try{if(host.makeCanvas){cv=host.makeCanvas(16,16);const x=cv.getContext&&cv.getContext('2d');if(x)paintTile(x,ch);else cv=null}}catch(_){cv=null}TC.set(ch,cv);return cv}
 function tileDraw(g,ch,x,y,t,ground){const gr=ground||(RP.s?MAPS[RP.s.map].ground:'.');if(OBJ.has(ch)){const b=tileCv(gr);if(b)blit(g,b,x,y,16,16)}const cv=tileCv(ch);if(cv)blit(g,cv,x,y,16,16);else R(g,x,y,16,16,BLOCK.has(ch)?'#355a2a':'#6cc04a');if(ch==='~'&&Math.floor(t/600)%2)R(g,x+3,y+7,6,1,'rgba(255,255,255,.35)')}

 /* =====================================================================
    쿵짝 리듬왕: 떨어지는 음표가 아래 선에 닿을 때 그 줄의 키를 누른다.
    소리판(AudioContext)의 시계로 음악과 음표를 맞춘다. 소리가 꺼져 있으면 화면 시계로만 움직인다.
    ===================================================================== */
 const LANE_KEYS=[['1','4','7','*','left'],['2','5','8','0','ok','nate'],['3','6','9','#','right']];
 const LANE_OF={};LANE_KEYS.forEach((ks,i)=>ks.forEach(k=>{LANE_OF[k]=i}));
 const LANE_COL=[['#ff6a5a','#c8302a'],['#ffd34a','#d69a12'],['#5ab0ff','#2a6ad0']];
 const WIN={p:.05,g:.095,d:.14};
 const DIFF=['쉬움','보통','어려움'];
 const JUDGE_Y=150,FALL_TOP=28,LX=34,LW=28;
 const SPEEDS=[1,1.5,2,2.5];
 const RS=()=>{D.games.rhythm=D.games.rhythm&&typeof D.games.rhythm==='object'?D.games.rhythm:{};const r=D.games.rhythm;r.best=r.best&&typeof r.best==='object'?r.best:{};if(!Number.isFinite(r.speed))r.speed=1;if(!Number.isFinite(r.offset))r.offset=0;return r};
 const RG={mode:'title',sel:0,diff:1,song:null,chart:null,actx:null,t0:0,t0p:0,lat:0,nodes:[],master:null,noise:null,pausedAt:0,score:0,combo:0,maxCombo:0,life:100,fever:false,cnt:{p:0,g:0,d:0,m:0},
  fx:[],judge:null,result:null,optSel:0,preview:0,bgm:false,pauseSel:0,lastBeat:-1,dance:0,failed:false};
 function rhythmSongs(){const S=(w.WebTown?.SONGS||[]).map(s=>({id:s[0],title:s[1],artist:s[2],bpm:s[5],mel:s[6],bass:s[7]}));return[...ORIG.map(o=>({...o})),...S].filter(s=>s.mel&&s.bpm)}
 function songTime(){if(RG.actx)return RG.actx.currentTime-RG.lat-RG.t0;return(now()-RG.t0p)/1000}
 function stopAudio(){for(const o of RG.nodes){try{o.stop()}catch(_){}}RG.nodes=[];if(RG.bgm){try{w.BGM?.suspend?.(false)}catch(_){}RG.bgm=false}}
 function tone(at,f,dur,type,gain){const c=RG.actx;if(!c||!f)return;try{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;const v=Math.max(.0001,gain);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(v,at+.008);g.gain.setValueAtTime(v,at+Math.max(.02,dur*.7));g.gain.linearRampToValueAtTime(0,at+dur*.96);o.connect(g);g.connect(RG.master);o.start(at);o.stop(at+dur+.02);RG.nodes.push(o)}catch(_){}}
 function drum(at,kind){const c=RG.actx;if(!c)return;try{
   if(kind==='k'){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(150,at);o.frequency.exponentialRampToValueAtTime(42,at+.12);g.gain.setValueAtTime(.32,at);g.gain.exponentialRampToValueAtTime(.001,at+.16);o.connect(g);g.connect(RG.master);o.start(at);o.stop(at+.18);RG.nodes.push(o);return}
   if(!RG.noise){const len=Math.floor(c.sampleRate*.2),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let s=7;for(let i=0;i<len;i++){s=(s*16807)%2147483647;d[i]=(s/2147483647)*2-1}RG.noise=b}
   const n=c.createBufferSource(),g=c.createGain();n.buffer=RG.noise;const dur=kind==='s'?.09:.03,v=kind==='s'?.16:.05;g.gain.setValueAtTime(v,at);g.gain.exponentialRampToValueAtTime(.001,at+dur);
   let tail=g;if(c.createBiquadFilter){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=kind==='s'?1200:6000;n.connect(f);f.connect(g)}else n.connect(g);tail.connect(RG.master);n.start(at);n.stop(at+dur+.01);RG.nodes.push(n)}catch(_){}}
 /* 곡 → 음표: 가락의 높낮이를 따라 왼쪽 가운데 오른쪽 줄을 정한다. 쉬움은 박자마다, 어려움은 모든 음과 두 줄 동시 */
 function laneStep(prev,pm,m,i){if(m>pm)return prev<2?prev+1:1;if(m<pm)return prev>0?prev-1:1;return prev===1?(i%2?0:2):1}
 function buildChart(song,diff){const beat=60/song.bpm,mel=parseTune(song.mel),bass=parseTune(song.bass);const loopBeats=mel.reduce((a,x)=>a+x.d,0)||8,loopSec=loopBeats*beat;
  const loops=clamp(Math.round(34/loopSec),2,5),intro=4,notes=[],bg=[],drums=[],bassEv=[];
  const base=[];let pl=1,pm=null,k=0;for(const x of mel){const m=x.n==='R'?null:midiOf(x.n);if(m==null){base.push(null);continue}const l=pm==null?1:laneStep(pl,pm,m,k++);base.push(l);pl=l;pm=m}
  const minGap=[1,.5,.25][diff],minMs=[.38,.19,.12][diff];let last=-99;
  for(let L=0;L<loops;L++){let b=intro+L*loopBeats;const up=L===loops-1&&loops>=3?12:0;
   mel.forEach((x,i)=>{const m=x.n==='R'?null:midiOf(x.n);if(m!=null){const t=b*beat,f=hz(m+up),d=x.d*beat,lane=L%2?2-base[i]:base[i];
     const onBeat=Math.abs(b-Math.round(b))<1e-6,ok=(diff>0||onBeat)&&b-last>=minGap-1e-6&&(b-last)*beat>=minMs-1e-6;
     if(ok){notes.push({t,lane,f,d});last=b;if(diff===2&&x.d>=1.5&&L>=1)notes.push({t,lane:(lane+1+(i%2))%3,f:f/2,d})}else bg.push({t,f,d})}
    b+=x.d});}
  const total=intro+loops*loopBeats;for(let b=0;b<total;b++){drums.push({t:b*beat,k:b%2?'s':'k'});drums.push({t:(b+.5)*beat,k:'h'})}
  const bassBeats=bass.reduce((a,x)=>a+x.d,0)||4;for(let b0=intro;b0<total;b0+=bassBeats){let b=b0;for(const x of bass){const m=x.n==='R'?null:midiOf(x.n);if(m!=null&&b<total)bassEv.push({t:b*beat,f:hz(m),d:Math.min(x.d,total-b)*beat});b+=x.d}}
  notes.sort((a,b)=>a.t-b.t||a.lane-b.lane);notes.forEach((n,i)=>{n.i=i;n.j=null});
  return{notes,bg,drums,bass:bassEv,beat,intro,loops,end:total*beat+1.4,lenSec:total*beat}}
 /* 소리판 시각 X 에 걸어 둔 소리는 X+지연(lat) 에 들린다. 곡 위치 p 의 소리는 t0+p 에 걸면 화면(songTime)과 같이 들린다 */
 function schedule(from){const c=RG.actx;if(!c)return;const ch=RG.chart,t0=RG.t0;
  for(const e of ch.bg)if(e.t>=from)tone(t0+e.t,e.f,Math.min(e.d,.6),'square',.045);
  for(const e of ch.bass)if(e.t>=from)tone(t0+e.t,e.f,Math.min(e.d,.9),'triangle',.09);
  for(const e of ch.drums)if(e.t>=from)drum(t0+e.t,e.k)}
 function startSong(fromPause){const ch=RG.chart;if(!ch)return;stopAudio();const c=host.audioCtx?.()||null;RG.actx=c;
  if(c){try{RG.master=c.createGain();RG.master.gain.value=Math.max(.05,host.audioVol?.()||.6);RG.master.connect(c.destination)}catch(_){RG.actx=null}}
  const lead=fromPause?1.6:1.2,pos=fromPause?Math.max(-lead,RG.pausedAt-1.5):-lead;
  if(RG.actx){RG.lat=clamp(Number(c.outputLatency||c.baseLatency||0),0,.3);RG.t0=c.currentTime-RG.lat-pos;schedule(Math.max(0,pos))}
  RG.t0p=now()-pos*1000;
  if(w.BGM?.suspend&&!RG.bgm){try{w.BGM.suspend(true);RG.bgm=true}catch(_){}}
  RG.mode='play';RG.judge=null}
 function newPlay(){const s=RG.song;RG.chart=buildChart(s,RG.diff);Object.assign(RG,{score:0,combo:0,maxCombo:0,life:100,fever:false,cnt:{p:0,g:0,d:0,m:0},fx:[],judge:null,result:null,pausedAt:0,lastBeat:-1,failed:false});startSong(false)}
 function judgeNote(n,dt){const a=Math.abs(dt),k=a<=WIN.p?'p':a<=WIN.g?'g':'d';n.j=k;RG.cnt[k]++;RG.combo++;RG.maxCombo=Math.max(RG.maxCombo,RG.combo);RG.fever=RG.combo>=30;
  const N=RG.chart.notes.length||1,mul={p:1,g:.7,d:.4}[k];RG.score+=Math.round(100000/N*mul*(RG.fever?1.5:1));RG.life=clamp(RG.life+({p:1.2,g:.6,d:-2}[k]),0,100);
  RG.judge={k,at:now(),lane:n.lane};RG.fx.push({lane:n.lane,at:now(),k});if(RG.fx.length>8)RG.fx.shift();
  if(RG.actx){try{tone(RG.actx.currentTime+.005,n.f,Math.min(.45,n.d),'square',.075)}catch(_){}}else host.beep([n.f],Math.round(Math.min(.3,n.d)*1000),.05,'square');
  host.vibrate?.(k==='p'?12:8,'touch')}
 function missNote(n){n.j='m';RG.cnt.m++;RG.combo=0;RG.fever=false;RG.life=clamp(RG.life-(RG.diff===0?5:8),0,100);RG.judge={k:'m',at:now(),lane:n.lane};if(RG.life<=0&&!RG.failed){RG.failed=true;finish(true)}}
 function laneHit(lane){const t=songTime()-(RS().offset||0)/1000;let best=null;for(const n of RG.chart.notes){if(n.j||n.lane!==lane)continue;const dt=t-n.t;if(dt<-WIN.d)break;if(Math.abs(dt)<=WIN.d){if(!best||Math.abs(dt)<Math.abs(t-best.t))best=n}}
  if(best)judgeNote(best,t-best.t);else RG.fx.push({lane,at:now(),k:'tap'})}
 function grade(acc){return acc>=.95?'S':acc>=.85?'A':acc>=.7?'B':acc>=.5?'C':'D'}
 function finish(failed){stopAudio();const c=RG.cnt,N=RG.chart.notes.length||1,acc=(c.p+c.g*.7+c.d*.4)/N,gr=failed?'F':grade(acc),key=RG.song.id+':'+RG.diff,r=RS(),old=r.best[key];
  const rec=!failed&&(!old||RG.score>old.score);if(rec)r.best[key]={score:RG.score,grade:gr,combo:RG.maxCombo};if(!failed&&RG.score>(D.games.rhythmBest||0))D.games.rhythmBest=RG.score;save();
  RG.result={score:RG.score,grade:gr,acc,cnt:{...c},maxCombo:RG.maxCombo,rec,failed,N};RG.mode='result';
  if(!failed)[523,659,784,1047].forEach((f,i)=>host.beep([f],150,.05,'square',i*.12));else[392,330,262].forEach((f,i)=>host.beep([f],220,.05,'square',i*.2));host.vibrate?.(failed?[80,60,80]:[40,40,40,40,120],'touch')}
 const hardOpen=s=>{const b=RS().best[s.id+':1'];return!!(b&&['S','A','B'].includes(b.grade))};
 function drawLanesBg(g,t,songT){const beat=RG.chart?RG.chart.beat:.5,ph=songT>0?(songT/beat)%1:0,pulse=Math.max(0,1-ph*3);
  g.fillStyle=grad(g,TOP,H-BOT,RG.fever?'#3a1060':'#101a3a','#05070f');g.fillRect(0,TOP,W,H-BOT-TOP);
  if(RG.fever){for(let i=0;i<6;i++){g.fillStyle='hsla('+((t/8+i*60)%360)+',90%,60%,.10)';g.fillRect(0,TOP+((t/12+i*28)%150),W,10)}}
  for(let i=0;i<3;i++){const x=LX+i*LW;g.fillStyle=i%2?'rgba(255,255,255,.06)':'rgba(255,255,255,.035)';g.fillRect(x,FALL_TOP,LW,JUDGE_Y-FALL_TOP+12);R(g,x,FALL_TOP,.6,JUDGE_Y-FALL_TOP+12,'rgba(160,190,255,.25)')}
  R(g,LX+3*LW,FALL_TOP,.6,JUDGE_Y-FALL_TOP+12,'rgba(160,190,255,.25)');
  R(g,LX-2,JUDGE_Y-1,LW*3+4,3,'rgba(255,255,255,'+(.55+pulse*.45).toFixed(2)+')');}
 function drawNote(g,x,y,lane,dbl){const c=LANE_COL[lane];g.fillStyle=c[1];rr(g,x+2,y-3,LW-4,7,2.5);g.fill();g.fillStyle=c[0];rr(g,x+2,y-3,LW-4,5,2.5);g.fill();R(g,x+5,y-2.2,LW-10,1.2,'rgba(255,255,255,.75)');if(dbl){g.strokeStyle='#fff';g.lineWidth=.8;rr(g,x+1.5,y-3.5,LW-3,8,3);g.stroke()}}
 function drawPlay(g,t){const ch=RG.chart,st=RG.mode==='pause'?RG.pausedAt:songTime(),sp=110*SPEEDS[RS().speed|0]||110;drawLanesBg(g,t,st);status(g);
  R(g,0,TOP,W,15,'rgba(0,0,0,.55)');T(g,RG.song.title,4,TOP+11,{size:8.5,bold:true,color:'#fff',max:84});T(g,String(RG.score).padStart(6,'0'),W-4,TOP+11,{size:9.5,bold:true,color:RG.fever?'#ff9af0':'#ffd27a',align:'right'});
  /* 음표 */
  const same={};for(const n of ch.notes){if(n.j)continue;const y=JUDGE_Y-(n.t-st)*sp;if(y<FALL_TOP-6)break;if(y>JUDGE_Y+14)continue;const kk=n.t.toFixed(3);same[kk]=(same[kk]||0)+1}
  for(const n of ch.notes){if(n.j)continue;const y=JUDGE_Y-(n.t-st)*sp;if(y<FALL_TOP-6)break;if(y>JUDGE_Y+14)continue;drawNote(g,LX+n.lane*LW,y,n.lane,same[n.t.toFixed(3)]>1)}
  /* 맞힌 효과 */
  for(const f of RG.fx){const a=1-(t-f.at)/260;if(a<=0)continue;const x=LX+f.lane*LW+LW/2;if(f.k==='tap'){R(g,x-LW/2+1,JUDGE_Y-8,LW-2,10,'rgba(255,255,255,'+(a*.18).toFixed(2)+')');continue}
   g.strokeStyle='rgba(255,255,255,'+a.toFixed(2)+')';g.lineWidth=1.5;g.beginPath();g.arc(x,JUDGE_Y,6+(1-a)*10,0,Math.PI*2);g.stroke();circ(g,x,JUDGE_Y,4*a,LANE_COL[f.lane][0])}
  /* 판정과 콤보 */
  if(RG.judge&&t-RG.judge.at<520){const J={p:['PERFECT','#7dfcff'],g:['GREAT','#7dff8a'],d:['GOOD','#ffd27a'],m:['MISS','#ff6a5a']}[RG.judge.k],s=1+Math.max(0,.3-(t-RG.judge.at)/600);
   T(g,J[0],LX+LW*1.5,104,{size:Math.round(11*s),bold:true,color:J[1],align:'center',shadow:'#000'});if(RG.combo>1)T(g,RG.combo+' COMBO',LX+LW*1.5,118,{size:9,bold:true,color:'#fff',align:'center',shadow:'#000'})}
  else if(RG.combo>=5)T(g,RG.combo,LX+LW*1.5,116,{size:14,bold:true,color:'rgba(255,255,255,.35)',align:'center'});
  if(RG.fever)T(g,'FEVER ×1.5',LX+LW*1.5,FALL_TOP+10,{size:9,bold:true,color:'hsl('+((t/4)%360)+',95%,70%)',align:'center',shadow:'#000'});
  /* 춤추는 아이와 생명 막대 */
  const beatN=st>0?Math.floor(st/ch.beat):-1,sad=RG.judge&&RG.judge.k==='m'&&t-RG.judge.at<500;spr(g,sad?'dance_sad':'dance'+(beatN<0?0:1+beatN%3),1,96,2,beatN%2===1&&!sad);
  T(g,'♪',8+Math.sin(t/200)*3,90,{size:9,color:'#ffd27a'});
  const lh=88*RG.life/100;R(g,W-10,44,6,88,'#2a2f45');R(g,W-10,44+88-lh,6,lh,RG.life>30?'#5aff8a':'#ff5a5a');T(g,'♥',W-7,141,{size:8,color:'#ff7a9a',align:'center'});
  /* 처음 네 박: 하나 둘 셋 넷 */
  if(st<ch.intro*ch.beat&&st>-1.2){const n=st<0?0:Math.floor(st/ch.beat)+1;if(n>0)T(g,['','하나','둘','셋','넷'][n]||'',LX+LW*1.5,80,{size:16,bold:true,color:'rgba(255,255,255,.85)',align:'center',shadow:'#000'});else T(g,'준비!',LX+LW*1.5,80,{size:14,bold:true,color:'#ffd27a',align:'center',shadow:'#000'})}
  /* 키 안내 */
  ['1 4 7','2 5 8','3 6 9'].forEach((s,i)=>T(g,s,LX+i*LW+LW/2,JUDGE_Y+12,{size:6.5,color:'rgba(220,230,255,.65)',align:'center'}));
  if(RG.mode==='pause'){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(0,TOP,W,H-TOP-BOT);T(g,'잠깐 멈춤',W/2,62,{size:13,bold:true,color:'#fff',align:'center'});
   ['계속하기','처음부터','곡 고르기'].forEach((s,i)=>{const y=82+i*17,on=i===RG.pauseSel;if(on){g.fillStyle='#ff9a3a';rr(g,30,y-11,W-60,15,4);g.fill()}T(g,(i+1)+'. '+s,W/2,y,{size:10,bold:on,color:'#fff',align:'center'})})}
  soft(g,'',RG.mode==='pause'?'고르기':'',RG.mode==='pause'?'':'멈춤')}
 function drawTitle(g,t){g.fillStyle=grad(g,TOP,H,'#2a0a5a','#0a0420');g.fillRect(0,TOP,W,H-TOP);status(g);
  for(let i=0;i<14;i++){const x=(i*37+t/30)%W,y=TOP+10+(i*29)%110;circ(g,x,y,.9,'rgba(255,255,255,.6)')}
  for(let i=0;i<7;i++){const hh=8+Math.abs(Math.sin(t/180+i))*30;g.fillStyle='hsla('+(i*50)+',90%,60%,.55)';g.fillRect(10+i*19,TOP+110-hh,12,hh)}
  T(g,'쿵짝',W/2,TOP+44,{size:24,bold:true,color:'#ffd34a',align:'center',shadow:'#c8302a'});T(g,'리듬왕',W/2,TOP+70,{size:22,bold:true,color:'#fff',align:'center',shadow:'#5a2ab0'});
  T(g,'64화음 리듬 액션',W/2,TOP+84,{size:8,color:'#cdb8ff',align:'center'});spr(g,'dance'+(1+Math.floor(t/400)%3),W/2-16,TOP+112,2);
  if(Math.floor(t/500)%2===0)T(g,'확인 버튼을 누르세요',W/2,H-BOT-6,{size:9,bold:true,color:'#fff',align:'center'});soft(g,'옵션','시작','')}
 function drawSelect(g,t){const L=rhythmSongs();RG.sel=clamp(RG.sel,0,Math.max(0,L.length-1));const s=L[RG.sel];status(g);title(g,'곡 고르기',DIFF[RG.diff]);body(g,'#140c2a');
  const n=6,first=clamp(RG.sel-2,0,Math.max(0,L.length-n));for(let i=first;i<Math.min(L.length,first+n);i++){const y=TOP+16+(i-first)*17,on=i===RG.sel,b=RS().best[L[i].id+':'+RG.diff];
   if(on){g.fillStyle=grad(g,y,y+17,'#ff9a3a','#e8620a');g.fillRect(0,y,W,17)}else R(g,0,y,W,17,i%2?'#1c1238':'#22164a');
   T(g,L[i].title,5,y+12,{size:9.5,bold:on,color:'#fff',max:W-40});T(g,b?b.grade:'-',W-6,y+12.5,{size:10,bold:true,color:b?({S:'#7dfcff',A:'#7dff8a',B:'#ffd27a',C:'#ffb0a0',D:'#c0c0c0'}[b.grade]||'#fff'):'#6a5a8a',align:'right'})}
  const yb=TOP+16+n*17;R(g,0,yb,W,H-BOT-yb,'#0a0618');if(s){const b=RS().best[s.id+':'+RG.diff],lock=RG.diff===2&&!hardOpen(s);T(g,s.artist+' · BPM '+s.bpm,5,yb+10,{size:8,color:'#cdb8ff',max:W-10});
   T(g,lock?'어려움: 보통을 B 이상으로 깨면 열려요':b?'최고 '+b.score.toLocaleString('ko-KR')+' · '+b.combo+'콤보':'아직 기록 없음',5,yb+21,{size:8,color:lock?'#ff9a8a':'#fff',max:W-10})}
  soft(g,'옵션','시작','◀▶ 난이도')}
 function drawOpt(g){status(g);title(g,'옵션');body(g,'#140c2a');const r=RS();const rows=[['떨어지는 속도','×'+SPEEDS[r.speed|0]],['박자 맞추기',(r.offset>0?'+':'')+r.offset+'ms'],['기록 지우기','']];
  rows.forEach((x,i)=>{const y=TOP+30+i*20,on=i===RG.optSel;if(on)R(g,0,y-13,W,18,'#ff9a3a');T(g,x[0],8,y,{size:10,bold:on,color:'#fff'});T(g,x[1],W-8,y,{size:10,bold:true,color:'#ffd27a',align:'right'})});
  ['◀ ▶ 로 바꾸기','박자 맞추기: 음표보다 늦게 들리면 +','소리가 빠르면 - 쪽으로 (10ms씩)'].forEach((s,i)=>T(g,s,W/2,TOP+108+i*12,{size:7.5,color:'#cdb8ff',align:'center'}));soft(g,'','','')}
 function drawResult(g,t){const r=RG.result;status(g);g.fillStyle=grad(g,TOP,H,r.failed?'#3a0a0a':'#0a2a4a','#05070f');g.fillRect(0,TOP,W,H-TOP);
  T(g,r.failed?'공연 실패...':'CLEAR!',W/2,TOP+20,{size:12,bold:true,color:r.failed?'#ff8a7a':'#7dff8a',align:'center'});
  const gc={S:'#7dfcff',A:'#7dff8a',B:'#ffd27a',C:'#ffb0a0',D:'#c0c0c0',F:'#ff6a5a'}[r.grade];T(g,r.grade,36,TOP+64,{size:40,bold:true,color:gc,align:'center',shadow:'#000'});
  T(g,RG.song.title,W/2+22,TOP+38,{size:8.5,bold:true,color:'#fff',align:'center',max:84});T(g,DIFF[RG.diff],W/2+22,TOP+50,{size:8,color:'#cdb8ff',align:'center'});
  T(g,r.score.toLocaleString('ko-KR')+'점',W/2+22,TOP+66,{size:12,bold:true,color:'#ffd27a',align:'center'});if(r.rec&&Math.floor(t/400)%2===0)T(g,'★ 신기록 ★',W/2+22,TOP+80,{size:9,bold:true,color:'#ff9af0',align:'center'});
  [['PERFECT',r.cnt.p,'#7dfcff'],['GREAT',r.cnt.g,'#7dff8a'],['GOOD',r.cnt.d,'#ffd27a'],['MISS',r.cnt.m,'#ff6a5a'],['MAX COMBO',r.maxCombo,'#fff']].forEach(([a,v,c],i)=>{const y=TOP+98+i*11;T(g,a,24,y,{size:8.5,bold:true,color:c});T(g,String(v),W-24,y,{size:8.5,bold:true,color:'#fff',align:'right'})});
  soft(g,'다시','곡 고르기','')}
 SCREENS.rhythm={enter(){RG.mode='title';stopAudio()},
  draw(g,t){if(RG.mode==='title')drawTitle(g,t);else if(RG.mode==='select')drawSelect(g,t);else if(RG.mode==='opt')drawOpt(g);else if(RG.mode==='result')drawResult(g,t);else drawPlay(g,t)},
  needs(t){if(RG.mode==='play'){const st=songTime(),tt=st-(RS().offset||0)/1000;for(const n of RG.chart.notes){if(RG.mode!=='play')break;if(n.j)continue;if(n.t>tt)break;if(tt-n.t>WIN.d)missNote(n)}
    if(RG.mode==='play'&&st>=RG.chart.end)finish(false);return true}
   if(RG.mode==='select'&&RG.preview&&t>=RG.preview){RG.preview=0;const s=rhythmSongs()[RG.sel];if(s)host.playTune?.(['rg:'+s.id,s.title,s.artist,'64화음',s.bpm,s.mel,s.bass||'R:1',0])}
   return RG.mode==='title'||RG.mode==='result'||RG.mode==='pause'},
  ownsSound(id){return(RG.mode==='play'||RG.mode==='pause')&&id!=='end'},
  key(id){const L=rhythmSongs();
   if(RG.mode==='title'){if(id==='ok'||id==='nate'||id==='5'){RG.mode='select';RG.preview=now()+600}else if(id==='menu'){RG.mode='opt';RG.optSel=0}else if(id==='clr')back();return true}
   if(RG.mode==='opt'){const r=RS();if(id==='up')RG.optSel=(RG.optSel+2)%3;else if(id==='down')RG.optSel=(RG.optSel+1)%3;else if(id==='left'||id==='right'){const d=id==='left'?-1:1;if(RG.optSel===0)r.speed=clamp((r.speed|0)+d,0,SPEEDS.length-1);else if(RG.optSel===1)r.offset=clamp((r.offset||0)+d*10,-200,200);save()}
    else if((id==='ok'||id==='nate')&&RG.optSel===2)ask('리듬왕 기록을 다 지울까요?',()=>{r.best={};D.games.rhythmBest=0;save();pop('기록을 지웠어요')});else if(id==='clr'||id==='menu')RG.mode=RG.song?'select':'title';return true}
   if(RG.mode==='select'){const n=L.length;if(id==='up'||id==='2'){RG.sel=(RG.sel-1+n)%n;host.stopTune?.();RG.preview=now()+600}else if(id==='down'||id==='8'){RG.sel=(RG.sel+1)%n;host.stopTune?.();RG.preview=now()+600}
    else if(id==='left'||id==='4')RG.diff=(RG.diff+2)%3;else if(id==='right'||id==='6')RG.diff=(RG.diff+1)%3;else if(id==='menu')RG.mode='opt';else if(id==='clr'){host.stopTune?.();RG.mode='title'}
    else if(id==='ok'||id==='nate'||id==='5'){const s=L[RG.sel];if(!s)return true;if(RG.diff===2&&!hardOpen(s)){pop('어려움은 보통을\nB 이상으로 깨면 열려요',1600);return true}host.stopTune?.();RG.preview=0;RG.song=s;newPlay()}return true}
   if(RG.mode==='result'){if(id==='ok'||id==='nate'||id==='clr'){RG.mode='select';RG.preview=now()+800}else if(id==='menu'||id==='*')newPlay();return true}
   if(RG.mode==='pause'){if(id==='up')RG.pauseSel=(RG.pauseSel+2)%3;else if(id==='down')RG.pauseSel=(RG.pauseSel+1)%3;else if(/^[1-3]$/.test(id)){RG.pauseSel=+id-1;pauseAct()}else if(id==='ok'||id==='nate')pauseAct();else if(id==='clr'){RG.pauseSel=0;pauseAct()}return true}
   if(RG.mode==='play'){if(id==='clr'||id==='menu'){pauseNow();return true}const lane=LANE_OF[id];if(lane!=null)laneHit(lane);return true}
   return true},
  leave(why){if(RG.mode==='play')pauseNow();if(why!=='call'){stopAudio();host.stopTune?.();if(RG.mode==='pause'||RG.mode==='play')RG.mode='select'}else stopAudio()},
  resume(){},
  event(type){if((type==='hide'||type==='poweroff')&&RG.mode==='play')pauseNow()}};
 function pauseNow(){if(RG.mode!=='play')return;RG.pausedAt=songTime();stopAudio();RG.mode='pause';RG.pauseSel=0}
 function pauseAct(){const s=RG.pauseSel;if(s===0)startSong(true);else if(s===1)newPlay();else{stopAudio();RG.mode='select';RG.preview=now()+600}}


 /* =====================================================================
    골목대장 전설: 은하 마을 → 뒷산 → 폐교 1층 → 옥상. 칸(16픽셀)을 한 칸씩 걷고, 풀숲과 폐교에서는 몬스터가 나온다.
    싸움은 차례대로 (1 공격 2 기술 3 가방 4 도망). 집에서 엄마에게 말을 걸면 힘이 다 차고 저장된다.
    ===================================================================== */
 const SAVE_KEY='2006_anycall_rpg_v1',TS=16,VIEW_Y=TOP,VIEW_H=H-BOT-TOP;
 const RP={mode:'title',sel:0,s:null,mv:null,next:null,talk:null,menu:null,shop:null,bt:null,flash:0,mapNameAt:0,ed:null,music:{want:null,cur:null},npcs:[],t0:0,endT:0,goT:0,lastStep:0};
 const loadSave=()=>{try{const s=JSON.parse(w.localStorage?.getItem(SAVE_KEY)||'null');return s&&s.v===1&&MAPS[s.map]?s:null}catch(_){return null}};
 function writeSave(){const s=RP.s;if(!s)return false;try{s.playMs=(s.playMs||0)+(now()-(RP.t0||now()));RP.t0=now();w.localStorage?.setItem(SAVE_KEY,JSON.stringify(s));return true}catch(_){return false}}
 function newSave(name){return{v:1,name:name||'골목대장',lv:1,exp:0,hp:30,mp:10,gold:60,items:{skewer:2},weapon:null,armor:null,map:'town',x:7,y:6,dir:'d',flags:{},playMs:0,battles:0}}
 const stat=s=>{const b=heroBase(s.lv),wp=WEAPONS.find(x=>x.id===s.weapon),ar=ARMORS.find(x=>x.id===s.armor);return{...b,atk:b.atk+(wp?wp.atk:0),def:b.def+(ar?ar.def:0)}};
 /* ---------- 음악 (WebTown 신시사이저, 끝나면 다시) ---------- */
 function music(id){const M=RP.music;if(M.want===id&&M.cur===id)return;M.want=id;if(!id){M.cur=null;host.stopTune?.();return}const tune=TUNES[id];if(!tune){M.cur=null;return}M.cur=id;
  const play=()=>{if(M.want!==id)return;const r=host.playTune?.(['rpg:'+id,id,'골목대장 전설','16화음',tune[0],tune[1],tune[2],0],()=>{if(M.want===id&&tune[3]!==false)setTimeout(play,60);else if(M.want===id)M.cur=null});if(r&&r.silent)M.silent=true};play()}
 function jingle(notes,gap=.1,type='square'){notes.forEach((f,i)=>host.beep([f],Math.round(gap*1000*1.2),.05,type,i*gap))}
 /* ---------- 지도 ---------- */
 const map=()=>MAPS[RP.s.map];
 const tileRaw=(m,x,y)=>y<0||y>=m.rows.length||x<0||x>=m.rows[0].length?'#':m.rows[y][x];
 const tileAt=(m,x,y)=>{const h=m.hide&&RP.s?m.hide(x,y,RP.s):null;return h||tileRaw(m,x,y)};
 function isOpenDoor(m,x,y){const e=m.events?.[x+','+y];return e&&e.t==='lock'&&RP.s.flags[e.flag]}
 function blocked(x,y){const m=map(),ch=tileAt(m,x,y);if(isOpenDoor(m,x,y))return false;if(BLOCK.has(ch))return true;if(RP.npcs.some(n=>!n.gone&&n.x===x&&n.y===y))return true;return false}
 function enterMap(id,x,y,dir){const s=RP.s;s.map=id;s.x=x;s.y=y;if(dir)s.dir=dir;RP.mv=null;RP.next=null;const m=MAPS[id];
  RP.npcs=(m.npcs||[]).filter(n=>!(n.flagGone&&s.flags[n.flagGone])&&!(n.need&&!s.flags[n.need])).map(n=>({...n,ox:n.x,oy:n.y,dir:'d',moveAt:now()+1500+Math.random()*2000}));RP.mapNameAt=now();RP.encN=0;music(m.music);writeSave()}
 const DIRS={d:[0,1],u:[0,-1],l:[-1,0],r:[1,0]};
 const KEY_DIR={up:'u','2':'u',down:'d','8':'d',left:'l','4':'l',right:'r','6':'r'};
 function tryMove(dir){const s=RP.s;s.dir=dir;const [dx,dy]=DIRS[dir],nx=s.x+dx,ny=s.y+dy,m=map();
  if(blocked(nx,ny)){const e=m.events?.[nx+','+ny];if(e&&(e.t==='door'||e.t==='home'||e.t==='shop'||e.t==='lock'||e.t==='sign'||e.t==='chest'))runEvent(e,nx,ny);else if(now()-RP.lastBump>300){RP.lastBump=now();host.beep([180],40,.04,'square')}return false}
  RP.mv={fx:s.x,fy:s.y,tx:nx,ty:ny,t0:now(),dur:150};s.x=nx;s.y=ny;return true}
 function arrived(){const s=RP.s,m=map();RP.lastStep=now();
  const ex=(m.exits||[]).find(e=>e.x===s.x&&e.y===s.y);if(ex){RP.flash=now();enterMap(ex.to,ex.tx,ex.ty,ex.dir);return}
  const e=m.events?.[s.x+','+s.y];if(e&&e.t==='stairs'){RP.flash=now();enterMap(e.to,e.tx,e.ty,e.dir);return}
  if(m.enc&&!(m.safe&&m.safe(s.x,s.y))){RP.encN=(RP.encN||0)+1;if(RP.encN>=5&&Math.random()<1/m.enc.rate){RP.encN=0;const tot=m.enc.list.reduce((a,x)=>a+x[1],0);let r=Math.random()*tot,id=m.enc.list[0][0];for(const [k,wt] of m.enc.list){if((r-=wt)<0){id=k;break}}startBattle(id)}}}
 /* ---------- 이벤트: 집, 가게, 팻말, 상자, 잠긴 문 ---------- */
 function say(name,pages,done,face){RP.talk={name,pages:Array.isArray(pages)?pages:[pages],i:0,done:done||null,at:now(),face:face||null};voiceBlip()}
 function voiceBlip(){host.beep([300+Math.random()*60],40,.025,'triangle')}
 function runEvent(e,x,y){const s=RP.s;if(e.need&&!s.flags[e.need])return;
  if(e.t==='home'){say('엄마',[s.flags.ending?'우리 골목대장 왔네! 황금 딱지 찾아 줘서 동네가 시끌시끌하다 ^^':'아이고, 얼굴이 이게 뭐니. 떡볶이 먹고 푹 쉬어라.','(힘이 모두 찼다! 저장했다.)'],()=>{const st=stat(s);s.hp=st.hp;s.mp=st.mp;writeSave();jingle([523,659,784,1047],.1,'triangle')},'mom');return}
  if(e.t==='shop'){const sh=SHOPS[e.shop];say(sh.owner,sh.greet,()=>{RP.shop={id:e.shop,sel:0};RP.mode='shop'},sh.face);return}
  if(e.t==='sign'){say('팻말',e.text);return}
  if(e.t==='chest'){if(s.flags[e.id]){say('',['빈 상자다.']);return}s.flags[e.id]=1;if(e.gold)s.gold+=e.gold;if(e.item)s.items[e.item]=(s.items[e.item]||0)+(e.n||1);
   const got=[e.item?ITEMS[e.item].n+(e.n>1?' '+e.n+'개':''):'',e.gold?e.gold+'원':''].filter(Boolean).join(', ');jingle([784,988,1175],.08);say('',['상자를 열었다!',jo(got,'을','를')+' 얻었다!'],()=>{if(e.after)e.after(s)});writeSave();return}
  if(e.t==='lock'){if(s.flags[e.flag])return;if(s.items[e.key]){s.flags[e.flag]=1;jingle([660,880],.08);say('',[e.okText]);writeSave()}else say('',[e.text]);return}}
 function talkTo(n){const s=RP.s;n.dir={d:'u',u:'d',l:'r',r:'l'}[s.dir];const lines=typeof n.say==='function'?n.say(s):n.say;
  say(n.name,lines,()=>{if(n.battle&&!s.flags[n.battle.flag])startBattle(n.battle.mon,n);else if(n.give&&!s.flags[n.give.flag]&&(!n.give.need||s.items[n.give.need])){if(n.give.need){s.items[n.give.need]--;if(s.items[n.give.need]<=0)delete s.items[n.give.need]}s.flags[n.give.flag]=1;if(n.give.gold)s.gold+=n.give.gold;if(n.give.item)s.items[n.give.item]=(s.items[n.give.item]||0)+(n.give.n||1);jingle([784,988,1175,1568],.08);say(n.name,n.give.text,null,n.spr);writeSave()}},n.spr)}
 function act(){const s=RP.s,[dx,dy]=DIRS[s.dir],x=s.x+dx,y=s.y+dy,n=RP.npcs.find(q=>!q.gone&&q.x===x&&q.y===y);if(n){talkTo(n);return}const e=map().events?.[x+','+y];if(e&&e.t!=='stairs')runEvent(e,x,y)}
 /* ---------- 싸움 ---------- */
 function startBattle(id,npc){const mon=MON[id],s=RP.s;if(!mon)return;s.battles=(s.battles||0)+1;
  RP.bt={id,mon,hp:mon.hp,max:mon.hp,npc:npc||null,phase:'msg',q:[{t:jo(mon.n,'이','가')+' 나타났다!'}],cur:null,sel:0,sub:null,shake:0,hurt:0,stun:false,healed:false,nums:[],t0:now()};
  RP.mode='battle';RP.flash=now();music(mon.boss?'boss':'battle');host.vibrate?.([30,40,30],'touch');nextMsg()}
 function nextMsg(){const B=RP.bt;if(!B)return;const m=B.q.shift();if(!m){B.cur=null;if(B.end)return endBattle(B.end);B.phase='cmd';B.sub=null;return}B.cur=m;B.curAt=now();B.phase='msg';try{m.fx?.()}catch(_){}}
 function dmgCalc(atk,def,mul=1,pierce=0){const d=(atk*1.2-def*.6*(1-pierce))*mul*(.85+Math.random()*.3);return Math.max(1,Math.round(d))}
 function heroAct(a){const B=RP.bt,s=RP.s,st=stat(s),mon=B.mon,q=[];
  if(a.t==='atk'){const crit=Math.random()<1/16,d=dmgCalc(st.atk,mon.def,crit?1.8:1);q.push({t:s.name+'의 공격!'},{t:(crit?'필살! ':'')+mon.n+'에게 '+d+'의 피해!',fx:()=>{B.hp=Math.max(0,B.hp-d);B.shake=now();B.nums.push({v:d,at:now(),e:1});host.beep([crit?1400:900],60,.05,'square');host.vibrate?.(crit?30:15,'touch')}})}
  else if(a.t==='skill'){const k=a.k;s.mp-=k.mp;q.push({t:s.name+'의 '+k.n+'!'});
   if(k.heal){const v=20+s.lv*4;q.push({t:'HP가 '+v+' 회복됐다!',fx:()=>{s.hp=Math.min(stat(s).hp,s.hp+v);jingle([784,1047],.08,'triangle')}})}
   else{const d=dmgCalc(st.atk,mon.def,k.mul,k.pierce||0);q.push({t:mon.n+'에게 '+d+'의 피해!',fx:()=>{B.hp=Math.max(0,B.hp-d);B.shake=now();B.nums.push({v:d,at:now(),e:1});host.beep([1200,1600],70,.05,'square');host.vibrate?.(25,'touch')}});
    if(k.stun&&!mon.boss)q.push({t:jo(mon.n,'은','는')+' 고무줄에 묶여 움직이지 못한다!',fx:()=>{B.stun=true}});else if(k.stun)q.push({t:'하지만 '+jo(mon.n,'은','는')+' 너무 세다!'})}}
  else if(a.t==='item'){const it=ITEMS[a.k];s.items[a.k]--;if(s.items[a.k]<=0)delete s.items[a.k];q.push({t:jo(s.name,'은','는')+' '+jo(it.n,'을','를')+' 먹었다!'});
   if(it.dmg)q[0].t=jo(s.name,'은','는')+' '+jo(it.n,'을','를')+' 힘껏 내리쳤다!',q.push({t:mon.n+'에게 '+it.dmg+'의 피해!',fx:()=>{B.hp=Math.max(0,B.hp-it.dmg);B.shake=now();B.nums.push({v:it.dmg,at:now(),e:1})}});
   else{if(it.hp)q.push({t:'HP가 회복됐다!',fx:()=>{s.hp=Math.min(stat(s).hp,s.hp+it.hp)}});if(it.mp)q.push({t:'MP가 회복됐다!',fx:()=>{s.mp=Math.min(stat(s).mp,s.mp+it.mp)}})}}
  else if(a.t==='run'){if(mon.boss){q.push({t:'도망칠 수 없다!'})}else{const ok=Math.random()<clamp(.55+(st.spd-mon.spd)*.05,.2,.95);q.push({t:jo(s.name,'은','는')+' 도망쳤다...'});if(ok){q[0].fx=()=>{};B.ran=true}else q[0].t='도망치려 했지만 막혔다!'}}
  return q}
 function monAct(){const B=RP.bt,s=RP.s,st=stat(s),mon=B.mon,q=[];if(B.stun){B.stun=false;q.push({t:jo(mon.n,'은','는')+' 꼼짝 못 한다!'});return q}
  let mul=1,name='공격';const r=Math.random();
  if(B.id==='king'){if(B.hp<B.max/2&&!B.healed){B.healed=true;q.push({t:mon.n+': 뚝딱! 뚝딱!'},{t:mon.n+'의 HP가 60 회복됐다!',fx:()=>{B.hp=Math.min(B.max,B.hp+60);host.beep([300,450],200,.05,'square')}});return q}
   if(r<.3){mul=1.5;name='방망이 휘두르기'}else if(r<.55){mul=.8;name='도깨비불';q.push({t:mon.n+'의 도깨비불!'},{t:'MP가 4 줄었다!',fx:()=>{s.mp=Math.max(0,s.mp-4)}})}}
  else if(B.id==='skel'&&r<.3){mul=1.4;name='뼈다귀 던지기'}
  const crit=Math.random()<1/24,d=dmgCalc(mon.atk,st.def,mul*(crit?1.5:1));if(name!=='도깨비불')q.push({t:mon.n+'의 '+name+'!'});
  q.push({t:(crit?'아야! ':'')+jo(s.name,'은','는')+' '+d+'의 피해를 입었다!',fx:()=>{s.hp=Math.max(0,s.hp-d);B.hurt=now();B.nums.push({v:d,at:now(),e:0});host.beep([140],120,.06,'square');host.vibrate?.(d>=15?[60,30,60]:45,'touch')}});return q}
 function doRound(a){const B=RP.bt,s=RP.s,st=stat(s),mon=B.mon;B.sub=null;const heroFirst=a.t==='item'||a.t==='run'||st.spd+Math.random()*4>=mon.spd+Math.random()*4;
  const q=[],add=list=>{for(const m of list)q.push(m)};
  /* 순서대로 쌓되, 앞 행동으로 끝나면 뒤 행동은 하지 않는다 */
  const hq=heroAct(a),mq=()=>monAct();
  if(heroFirst){add(hq);q.push({chk:1})}else{add(mq());q.push({chk:1});add(hq);q.push({chk:1})}
  if(heroFirst)q.push({later:1});B.q=q;B.pendingMon=heroFirst;B.phase='msg';nextMsgChecked()}
 function nextMsgChecked(){const B=RP.bt,s=RP.s;for(;;){const m=B.q[0];if(!m)break;if(m.chk||m.later){B.q.shift();if(B.ran){B.q=[];B.end='run';break}if(B.hp<=0){B.q=[];winMsgs();break}if(s.hp<=0){B.q=[];B.q.push({t:'눈앞이 캄캄해졌다...',fx:()=>{music(null);jingle([392,330,262,196],.22,'triangle')}});B.end='lose';break}
    if(m.later){for(const x of monAct())B.q.push(x);B.q.push({chk:1})}continue}break}
  if(!B.q.length){if(B.ran){B.end='run'}else if(B.hp<=0&&!B.won){winMsgs()}else if(s.hp<=0&&B.end!=='lose'){B.q.push({t:'눈앞이 캄캄해졌다...'});B.end='lose'}}
  nextMsg()}
 function winMsgs(){const B=RP.bt,s=RP.s,mon=B.mon;B.won=true;B.end='win';B.q.push({t:jo(mon.n,'을','를')+' 물리쳤다!',fx:()=>{music(null);jingle([784,1047,1319,1568],.09)}});
  if(mon.exp||mon.gold)B.q.push({t:'경험치 '+mon.exp+', '+mon.gold+'원을 얻었다!',fx:()=>{s.exp+=mon.exp;s.gold+=mon.gold}});
  if(mon.drop&&Math.random()<mon.drop[1])B.q.push({t:jo(ITEMS[mon.drop[0]].n,'을','를')+' 주웠다!',fx:()=>{s.items[mon.drop[0]]=(s.items[mon.drop[0]]||0)+1}});
  B.q.push({lvchk:1,t:'',fx:()=>{levelUps()}})}
 function levelUps(){const B=RP.bt,s=RP.s;const ups=[];while(s.lv<20&&s.exp>=expNeed(s.lv)){s.exp-=expNeed(s.lv);s.lv++;ups.push(s.lv)}
  if(!ups.length){B.cur={t:''};nextMsg();return}const st=stat(s);s.hp=st.hp;s.mp=st.mp;
  B.q.unshift(...ups.flatMap(lv=>[{t:'레벨 업! 이제 레벨 '+lv+'. 힘이 모두 찼다!',fx:()=>{jingle([523,659,784,1047],.08,'triangle');host.vibrate?.([30,40,30],'touch')}},...SKILLS.filter(k=>k.lv===lv).map(k=>({t:'새 기술 ‘'+k.n+'’'+josa(k.n,'을','를')+' 배웠다!'}))]));nextMsg()}
 function endBattle(how){const B=RP.bt,s=RP.s;RP.bt=null;
  if(how==='lose'){RP.mode='gameover';RP.goT=now();return}
  RP.mode='map';music(map().music);
  if(how==='win'&&B.npc){const n=B.npc;s.flags[n.battle.flag]=1;n.gone=true;if(n.battle.after)n.battle.after(s);if(n.battle.win)say(n.name,n.battle.win,null,n.spr)}writeSave()}
 function respawn(){const s=RP.s,st=stat(s);s.gold=Math.floor(s.gold/2);s.hp=st.hp;s.mp=st.mp;enterMap('town',3,4,'d');RP.mode='map';say('엄마',['정신이 드니? 동네 아저씨가 업고 왔더라.','(돈이 반으로 줄었다. 힘은 모두 찼다.)'],null,'mom')}
 /* ---------- 그리기 ---------- */
 function drawMap(g,t){const s=RP.s,m=map(),cols=m.rows[0].length,rows=m.rows.length;let px=s.x*TS,py=s.y*TS;
  if(RP.mv){const k=clamp((t-RP.mv.t0)/RP.mv.dur,0,1);px=(RP.mv.fx+(RP.mv.tx-RP.mv.fx)*k)*TS;py=(RP.mv.fy+(RP.mv.ty-RP.mv.fy)*k)*TS}
  const cx=clamp(px+8-W/2,0,Math.max(0,cols*TS-W)),cy=clamp(py+8-VIEW_H/2,0,Math.max(0,rows*TS-VIEW_H));
  g.save();g.beginPath();g.rect(0,VIEW_Y,W,VIEW_H);g.clip();R(g,0,VIEW_Y,W,VIEW_H,m.void||'#1a1a24');
  const x0=Math.floor(cx/TS),y0=Math.floor(cy/TS);for(let y=y0;y<=y0+Math.ceil(VIEW_H/TS)+1&&y<rows;y++)for(let x=x0;x<=x0+Math.ceil(W/TS)+1&&x<cols;x++){let ch=tileAt(m,x,y);
   const e=m.events?.[x+','+y];if(e&&e.t==='chest'&&s.flags[e.id])ch='c';if(isOpenDoor(m,x,y))ch=e.openAs||'F';tileDraw(g,ch,x*TS-cx,VIEW_Y+y*TS-cy,t)}
  const ents=[...RP.npcs.filter(n=>!n.gone).map(n=>({y:n.y*TS,draw:()=>{const big=n.big||1;spr(g,n.spr,n.x*TS-cx-(big-1)*8,VIEW_Y+n.y*TS-cy-(big-1)*16+(n.bob?Math.sin(t/300)*1.5:0),big,n.dir==='l')}})),
   {y:py,draw:()=>{const walking=RP.mv&&t-RP.mv.t0<RP.mv.dur,f=walking?(Math.floor((t-RP.mv.t0)/75)%2):0,d=s.dir,key=d==='d'?'hero_d':d==='u'?'hero_u':'hero_r';spr(g,key+f,px-cx,VIEW_Y+py-cy-(walking&&f?1:0),1,d==='l')}}];
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());g.restore();
  /* 위쪽 상태 막대 */
  const st=stat(s);g.fillStyle='rgba(10,14,30,.72)';rr(g,2,VIEW_Y+2,68,13,3);g.fill();T(g,'Lv'+s.lv+' HP '+s.hp+'/'+st.hp,5,VIEW_Y+11.5,{size:7.5,bold:true,color:s.hp<st.hp/4?'#ff8a7a':'#fff',max:64});
  g.fillStyle='rgba(10,14,30,.72)';rr(g,W-46,VIEW_Y+2,44,13,3);g.fill();T(g,s.gold+'원',W-5,VIEW_Y+11.5,{size:7.5,bold:true,color:'#ffd27a',align:'right'});
  if(t-RP.mapNameAt<2200){const a=Math.min(1,(2200-(t-RP.mapNameAt))/500);g.globalAlpha=a;g.fillStyle='rgba(0,0,0,.65)';rr(g,W/2-40,VIEW_Y+24,80,16,4);g.fill();T(g,m.name,W/2,VIEW_Y+35.5,{size:9.5,bold:true,color:'#fff',align:'center'});g.globalAlpha=1}
  if(t-RP.flash<350){g.fillStyle='rgba(255,255,255,'+(1-(t-RP.flash)/350).toFixed(2)+')';g.fillRect(0,VIEW_Y,W,VIEW_H)}}
 function drawTalk(g,t){const k=RP.talk;if(!k)return;const page=k.pages[k.i]||'',lines=wrap(g,page,W-14,9,false).slice(0,4),hh=Math.max(34,lines.length*11+12),y=H-BOT-hh-2;
  g.fillStyle='rgba(10,14,40,.92)';rr(g,3,y,W-6,hh,4);g.fill();g.strokeStyle='#fff';g.lineWidth=1;g.stroke();
  if(k.face&&SPR[k.face]){const fx=W-42,fy=y-37;g.fillStyle='rgba(10,14,40,.92)';rr(g,fx,fy,36,36,4);g.fill();g.strokeStyle='#fff';g.lineWidth=1;g.stroke();spr(g,k.face,fx+2,fy+2,2)}
  if(k.name){g.fillStyle='#ff9a3a';rr(g,8,y-8,Math.min(70,k.name.length*9+10),11,3);g.fill();T(g,k.name,13,y+.5,{size:8,bold:true,color:'#fff'})}
  const shown=Math.floor((t-k.at)/28);let left=shown;lines.forEach((l,i)=>{const part=l.slice(0,Math.max(0,left));left-=l.length;T(g,part,9,y+13+i*11,{size:9,color:'#fff'})});
  if(shown>=page.length&&Math.floor(t/400)%2===0)T(g,'▼',W-11,y+hh-4,{size:7,color:'#ffd27a'})}
 function drawList(g,titleText,items,sel,sub){const n=items.length,hh=Math.min(VIEW_H-8,n*14+18),y=VIEW_Y+(VIEW_H-hh)/2;g.fillStyle='rgba(8,12,34,.94)';rr(g,8,y,W-16,hh,4);g.fill();g.strokeStyle='#ffd27a';g.lineWidth=1;g.stroke();
  T(g,titleText,W/2,y+11,{size:8.5,bold:true,color:'#ffd27a',align:'center'});const vis=Math.floor((hh-16)/14),first=clamp(sel-vis+1,0,Math.max(0,n-vis));
  for(let i=first;i<Math.min(n,first+vis);i++){const yy=y+15+(i-first)*14,on=i===sel,it=items[i];if(on)R(g,10,yy,W-20,13,'#3a4a9a');T(g,(i<9?(i+1)+'. ':'')+it.label,14,yy+10,{size:8.5,bold:on,color:it.dim?'#8a94a8':'#fff',max:W-(it.sub?60:30)});if(it.sub)T(g,it.sub,W-13,yy+10,{size:7.5,color:'#ffd27a',align:'right'})}
  if(sub)T(g,sub,W/2,y+hh-3,{size:7,color:'#cfd8e8',align:'center'})}
 const battleBg=(g,kind)=>{if(kind==='school'){g.fillStyle=grad(g,VIEW_Y,VIEW_Y+92,'#c8b48a','#8a7a5a');g.fillRect(0,VIEW_Y,W,92);R(g,14,VIEW_Y+10,W-28,34,'#2f5a3a');R(g,14,VIEW_Y+10,W-28,2,'#8a6a4a');T(g,'자습',W/2,VIEW_Y+30,{size:9,color:'rgba(255,255,255,.6)',align:'center'});R(g,0,VIEW_Y+78,W,14,'#a87440')}
  else if(kind==='roof'){g.fillStyle=grad(g,VIEW_Y,VIEW_Y+92,'#ff8a5a','#3a1a4a');g.fillRect(0,VIEW_Y,W,92);circ(g,W-28,VIEW_Y+22,10,'#fff2c0');for(let i=0;i<W;i+=10)R(g,i,VIEW_Y+70,2,14,'#5a5f6a');R(g,0,VIEW_Y+70,W,2,'#5a5f6a');R(g,0,VIEW_Y+84,W,8,'#9aa0aa')}
  else{g.fillStyle=grad(g,VIEW_Y,VIEW_Y+92,'#8ad0ff','#d8f0ff');g.fillRect(0,VIEW_Y,W,92);for(let i=0;i<6;i++){circ(g,10+i*27,VIEW_Y+62,15,'#3f8f32');circ(g,22+i*27,VIEW_Y+58,12,'#4fa83a')}R(g,0,VIEW_Y+72,W,20,'#6cc04a')}};
 function drawBattle(g,t){const B=RP.bt,s=RP.s,st=stat(s),mon=B.mon;const hurt=t-B.hurt<300?Math.sin(t/20)*2:0;g.save();g.translate(hurt,0);battleBg(g,map().battle||'field');
  const sc=mon.big?4:3,size=16*sc,shake=t-B.shake<300?Math.sin(t/18)*3:0,blink=t-B.shake<300&&Math.floor(t/60)%2===0,bob=Math.sin(t/260)*1.5;
  if(B.hp>0||B.cur&&B.end==='win'&&!B.won)spr(g,mon.spr,W/2-size/2+shake,VIEW_Y+78-size+bob,sc,false,blink?.35:1);
  for(const n of B.nums){const a=(t-n.at)/800;if(a>1)continue;T(g,String(n.v),n.e?W/2+10:W/2,n.e?VIEW_Y+40-a*16:VIEW_Y+112-a*10,{size:12,bold:true,color:n.e?'#fff':'#ff6a5a',align:'center',shadow:'#000'})}
  g.fillStyle='rgba(0,0,0,.5)';rr(g,4,VIEW_Y+3,W-8,13,3);g.fill();T(g,mon.n,8,VIEW_Y+12.5,{size:8.5,bold:true,color:'#fff',max:70});R(g,W-62,VIEW_Y+7,56,5,'#3a1a1a');R(g,W-62,VIEW_Y+7,56*B.hp/B.max,5,B.hp>B.max/3?'#ff5a4a':'#ffb34a');
  g.restore();
  const y0=VIEW_Y+93;R(g,0,y0,W,H-BOT-y0,'#0a1030');R(g,0,y0,W,1,'#ffd27a');T(g,s.name+' Lv'+s.lv,5,y0+10,{size:8.5,bold:true,color:'#fff',max:70});
  T(g,'HP '+s.hp+'/'+st.hp,W-5,y0+10,{size:8.5,bold:true,color:s.hp<st.hp/4?'#ff8a7a':'#7dff8a',align:'right'});T(g,'MP '+s.mp+'/'+st.mp,W-5,y0+20,{size:8,color:'#9fc0ff',align:'right'});
  if(B.phase==='msg'&&B.cur){wrap(g,B.cur.t||'',W-12,9,false).slice(0,3).forEach((l,i)=>T(g,l,6,y0+32+i*11,{size:9,color:'#fff'}))}
  else if(B.phase==='cmd'&&!B.sub){['공격','기술','가방','도망'].forEach((c,i)=>{const x=6+(i%2)*72,y=y0+28+Math.floor(i/2)*16,on=i===B.sel;if(on){g.fillStyle='#ff9a3a';rr(g,x-2,y-10,68,14,3);g.fill()}T(g,(i+1)+'. '+c,x+2,y,{size:9.5,bold:on,color:'#fff'})})}
  if(B.sub){const L=B.sub.items;drawList(g,B.sub.title,L,B.sub.sel,'확인: 고르기 · 취소: 돌아가기')}
  if(t-B.t0<380){g.fillStyle='rgba(255,255,255,'+(1-(t-B.t0)/380).toFixed(2)+')';g.fillRect(0,VIEW_Y,W,VIEW_H)}}
 function drawRpgTitle(g,t){g.fillStyle=grad(g,TOP,H,'#0a1a4a','#2a3a7a');g.fillRect(0,TOP,W,H-TOP);status(g);for(let i=0;i<18;i++){const x=(i*41)%W,y=TOP+6+(i*23)%70;if(Math.floor(t/300+i)%5)circ(g,x,y,.8,'#fff')}
  circ(g,W-26,TOP+22,9,'#fff2c0');circ(g,W-22,TOP+19,8,'#0f1f55');
  for(let i=0;i<6;i++){const x=i*27-4,hh=22+(i*13)%16;R(g,x,TOP+96-hh,24,hh+20,'#141a3a');R(g,x+5,TOP+102-hh,4,4,(Math.floor(t/700)+i)%3?'#ffd27a':'#3a3a5a')}R(g,0,TOP+112,W,H-BOT-TOP-112,'#2a2a3a');
  T(g,'골목대장',W/2,TOP+46,{size:20,bold:true,color:'#ffd34a',align:'center',shadow:'#a8302a'});T(g,'전 설',W/2,TOP+68,{size:17,bold:true,color:'#fff',align:'center',shadow:'#000'});
  T(g,'- 황금 딱지를 찾아라 -',W/2,TOP+82,{size:7.5,color:'#cfe0ff',align:'center'});spr(g,'hero_d'+(Math.floor(t/400)%2),W/2-16,TOP+92,2);
  const save0=loadSave(),L=['새로 하기','이어 하기','이야기 보기'];L.forEach((x,i)=>{const y=TOP+138+i*0,on=i===RP.sel;if(on)T(g,'▶ '+x+(i===1&&!save0?' (기록 없음)':''),W/2,TOP+140,{size:9.5,bold:true,color:'#fff',align:'center',shadow:'#000'})});
  T(g,'◀ ▶ 고르기 · 확인 시작',W/2,TOP+152,{size:7,color:'#cfd8e8',align:'center'});soft(g,'','확인','')}
 function drawEnding(g,t){const el=(t-RP.endT)/1000;g.fillStyle=grad(g,TOP,H,'#ffcf7a','#ff7a5a');g.fillRect(0,TOP,W,H-TOP);status(g);
  const L=['황금 딱지를 되찾았다!','','동네 아이들이 골목으로','우르르 몰려나왔다.','','“골목대장 만세!”','','도깨비 대장은 다시는','장난치지 않겠다고 약속했다.','','그리고 그날 저녁,','엄마는 떡볶이를 해 주셨다.','','- THE END -','',RP.s.name+' · Lv'+RP.s.lv,'싸움 '+(RP.s.battles||0)+'번','','고마워요!'];
  const y0=H-BOT-el*16;L.forEach((l,i)=>{const y=y0+i*13;if(y>TOP+6&&y<H-BOT-2)T(g,l,W/2,y,{size:i===13?11:9,bold:i===0||i===13,color:'#3a1a0a',align:'center'})});spr(g,'hero_d'+(Math.floor(t/300)%2),W/2-16,TOP+18,2);soft(g,'','타이틀로','')}
 function rpgTick(t){const s=RP.s;if(!s)return;if(RP.mv&&t-RP.mv.t0>=RP.mv.dur){RP.mv=null;arrived();if(RP.mode!=='map')return;if(RP.next){const d=RP.next;RP.next=null;if(!RP.talk)tryMove(d)}}
  if(RP.mode==='map'&&!RP.talk&&!RP.mv)for(const n of RP.npcs){if(n.gone||!n.wander||t<n.moveAt)continue;n.moveAt=t+1800+Math.random()*2400;const ds=Object.keys(DIRS),d=ds[Math.floor(Math.random()*4)],[dx,dy]=DIRS[d],nx=n.x+dx,ny=n.y+dy;n.dir=d;
   if(Math.abs(nx-n.ox)<=n.wander&&Math.abs(ny-n.oy)<=n.wander&&!BLOCK.has(tileAt(map(),nx,ny))&&!(nx===s.x&&ny===s.y)&&!RP.npcs.some(q=>q!==n&&q.x===nx&&q.y===ny)&&!map().events?.[nx+','+ny]&&!(map().exits||[]).some(e=>e.x===nx&&e.y===ny)){n.x=nx;n.y=ny}}}
 SCREENS.rpg={enter(){RP.mode='title';RP.sel=loadSave()?1:0;RP.talk=null;music('title')},
  typing(){return RP.mode==='name'?'용사 이름 (네 글자까지) · Enter':null},
  repeats(id){return RP.mode==='map'&&!!KEY_DIR[id]&&!RP.talk},
  draw(g,t){if(RP.mode==='title'){drawRpgTitle(g,t);return}if(RP.mode==='story'){status(g);body(g,'#0a1030');wrap(g,STORY,W-14,9,false).forEach((l,i)=>T(g,l,7,TOP+16+i*11.5,{size:9,color:'#fff'}));soft(g,'','확인','');return}
   if(RP.mode==='name'){status(g);title(g,'용사 이름 정하기');body(g,'#0a1030');spr(g,'hero_d0',W/2-16,TOP+24,2);K.drawEditor(g,RP.ed,TOP+64,TOP+104,t,'이름 (네 글자까지)');T(g,'숫자판(천지인)이나 자판으로 써요',W/2,TOP+118,{size:7.5,color:'#cfd8e8',align:'center'});T(g,'비워 두면 ‘골목대장’',W/2,TOP+130,{size:7.5,color:'#cfd8e8',align:'center'});soft(g,RP.ed.modeName(),'정하기','');return}
   if(RP.mode==='ending'){drawEnding(g,t);return}
   if(RP.mode==='gameover'){status(g);R(g,0,TOP,W,H-TOP,'#000');T(g,'눈앞이 캄캄해졌다...',W/2,H/2-6,{size:11,bold:true,color:'#ff8a7a',align:'center'});if(t-RP.goT>1200)T(g,'확인을 누르세요',W/2,H/2+14,{size:8.5,color:'#fff',align:'center'});soft(g,'','확인','');return}
   status(g);if(RP.mode==='battle'&&RP.bt){drawBattle(g,t);soft(g,'','확인','');return}
   drawMap(g,t);drawTalk(g,t);
   if(RP.mode==='menu')drawList(g,'메뉴',RP.menu.items,RP.menu.sel);
   if(RP.mode==='shop'){const sh=SHOPS[RP.shop.id];drawList(g,sh.name+' (내 돈 '+RP.s.gold+'원)',shopItems(),RP.shop.sel,'확인: 사기 · 취소: 나가기')}
   if(RP.mode==='status')drawStatus(g);
   soft(g,RP.mode==='map'&&!RP.talk?'메뉴':'',RP.talk?'다음':RP.mode==='map'?'조사':'확인',RP.mode==='map'&&!RP.talk?'나가기':'')},
  needs(t){if(RP.mode==='map'||RP.mode==='shop'||RP.mode==='menu')rpgTick(t);if(RP.mode==='battle'&&RP.bt){const B=RP.bt;if(B.phase==='msg'&&B.cur&&t-B.curAt>(B.cur.t?1100:10))advanceBattle()}return true},
  ownsSound(id){return RP.mode==='map'&&!!KEY_DIR[id]},
  key(id){const s=RP.s;
   if(RP.mode==='title'){if(id==='left'||id==='up'||id==='4'||id==='2')RP.sel=(RP.sel+2)%3;else if(id==='right'||id==='down'||id==='6'||id==='8')RP.sel=(RP.sel+1)%3;else if(/^[1-3]$/.test(id)){RP.sel=+id-1;titleGo()}else if(id==='ok'||id==='nate'||id==='5')titleGo();else if(id==='clr'){music(null);back()}return true}
   if(RP.mode==='story'){if(id==='ok'||id==='nate'||id==='clr'||id==='5')RP.mode='title';return true}
   if(RP.mode==='name'){const ed=RP.ed;if(id==='ok'||id==='send'){finishName();return true}if(id==='menu'){ed.nextMode();return true}if(id==='clr'&&!ed.tokens.length){K.setEditor(null);RP.mode='title';return true}if(ed.key(id))K.edChanged();return true}
   if(RP.mode==='gameover'){if(now()-RP.goT>1200&&(id==='ok'||id==='nate'||id==='5'))respawn();return true}
   if(RP.mode==='ending'){if(now()-RP.endT>2500&&(id==='ok'||id==='nate'||id==='5'||id==='clr')){RP.mode='title';RP.sel=1;music('title')}return true}
   if(RP.talk){if(id==='ok'||id==='nate'||id==='5'||id==='clr'||id==='send'){const k=RP.talk,page=k.pages[k.i]||'';if(now()-k.at<page.length*28){k.at=-1e9;return true}k.i++;k.at=now();if(k.i>=k.pages.length){RP.talk=null;k.done?.()}else voiceBlip()}return true}
   if(RP.mode==='battle')return battleKey(id);
   if(RP.mode==='menu')return menuKey(id);
   if(RP.mode==='shop')return shopKey(id);
   if(RP.mode==='status'){RP.mode='map';return true}
   if(RP.mode==='map'){const d=KEY_DIR[id];if(d){if(RP.mv){RP.next=d;return true}tryMove(d);return true}
    if(id==='ok'||id==='nate'||id==='5'){act();return true}if(id==='menu'||id==='0'){openMenu();return true}
    if(id==='clr'){ask('저장하고 그만할까요?',()=>{writeSave();music(null);back()});return true}return true}
   return true},
  leave(why){if(why==='call'){music(null);return}if(RP.s&&RP.mode!=='title'&&RP.mode!=='ending'&&RP.mode!=='gameover'&&RP.mode!=='name')writeSave();music(null);if(RP.mode==='name'){K.setEditor(null)}},
  resume(){if(RP.mode==='battle'&&RP.bt)music(RP.bt.mon.boss?'boss':'battle');else if(RP.s&&RP.mode!=='title')music(map().music);else music('title')}};
 function titleGo(){const sv=loadSave();if(RP.sel===0){if(sv)ask('처음부터 할까요?\n(전에 하던 기록은 지워져요)',()=>startName());else startName()}else if(RP.sel===1){if(!sv){pop('이어 할 기록이 없어요');return}RP.s=sv;RP.t0=now();RP.mode='map';enterMap(sv.map,sv.x,sv.y,sv.dir);pop(sv.name+' 다시 출발!',1000)}else RP.mode='story'}
 function startName(){RP.mode='name';RP.ed=K.Editor({max:8,now});K.setEditor(RP.ed)}
 function finishName(){const nm=(RP.ed.text().trim()||'골목대장').slice(0,4);K.setEditor(null);RP.ed=null;RP.s=newSave(nm);RP.t0=now();RP.mode='map';enterMap('town',7,6,'d');
  say('엄마',[jo(nm,'아','야')+', 큰일 났다! 도깨비가 동네 아이들 보물 ‘황금 딱지’를 훔쳐 갔대.','뒷산 너머 폐교로 도망갔다더라. 떡꼬치 두 개 챙겨 가라. 조심하고!','(위쪽 길로 나가면 뒷산이에요. 2 4 6 8로 걷고, 5로 말을 걸어요.)'],null,'mom')}
 function advanceBattle(){const B=RP.bt;if(!B)return;if(B.q.length&&(B.q[0].chk||B.q[0].later))nextMsgChecked();else nextMsg()}
 function battleKey(id){const B=RP.bt,s=RP.s;if(!B)return true;
  if(B.phase==='msg'){if(id==='ok'||id==='nate'||id==='5'||id==='send')advanceBattle();return true}
  if(B.sub){const L=B.sub.items,n=L.length;if(id==='up')B.sub.sel=(B.sub.sel-1+n)%n;else if(id==='down')B.sub.sel=(B.sub.sel+1)%n;else if(id==='clr'||id==='left')B.sub=null;
   else{const i=/^[1-9]$/.test(id)?+id-1:(id==='ok'||id==='nate'||id==='5')?B.sub.sel:-1;const it=L[i];if(it&&!it.dim){B.sub.sel=i;doRound(it.a)}else if(it&&it.dim)pop(it.why||'쓸 수 없어요',900)}return true}
  if(id==='up'||id==='down')B.sel=(B.sel+2)%4;else if(id==='left'||id==='right')B.sel=B.sel%2?B.sel-1:B.sel+1;
  else{const i=/^[1-4]$/.test(id)?+id-1:(id==='ok'||id==='nate'||id==='5')?B.sel:-1;if(i<0)return true;B.sel=i;
   if(i===0)doRound({t:'atk'});else if(i===1){const L=SKILLS.filter(k=>k.lv<=s.lv).map(k=>({label:k.n,sub:'MP '+k.mp,dim:s.mp<k.mp,why:'MP가 모자라요',a:{t:'skill',k}}));if(!L.length)pop('아직 배운 기술이 없어요');else B.sub={title:'기술',items:L,sel:0}}
   else if(i===2){const L=Object.keys(s.items).filter(k=>ITEMS[k]&&!ITEMS[k].key&&s.items[k]>0).map(k=>({label:ITEMS[k].n,sub:'×'+s.items[k],a:{t:'item',k}}));if(!L.length)pop('가방이 비었어요');else B.sub={title:'가방',items:L,sel:0}}
   else doRound({t:'run'})}return true}
 function openMenu(){RP.mode='menu';RP.menu={sel:0,items:[{label:'상태 보기'},{label:'가방'},{label:'기술 (응원가)'},{label:'저장하기'},{label:'음악 '+(RP.musicOff?'켜기':'끄기')},{label:'그만하기'}]}}
 function menuKey(id){const M=RP.menu,s=RP.s;if(M.list){const L=M.list,n=L.length;if(id==='up')M.lsel=(M.lsel-1+n)%n;else if(id==='down')M.lsel=(M.lsel+1)%n;else if(id==='clr'){M.list=null;M.items=M.prev;return true}
   else if(id==='ok'||id==='nate'||id==='5'||/^[1-9]$/.test(id)){const i=/^[1-9]$/.test(id)?+id-1:M.lsel,it=L[i];if(it)it.use()}return true}
  const n=M.items.length;if(id==='up')M.sel=(M.sel-1+n)%n;else if(id==='down')M.sel=(M.sel+1)%n;else if(id==='clr'||id==='menu')RP.mode='map';
  else if(id==='ok'||id==='nate'||id==='5'||/^[1-6]$/.test(id)){const i=/^[1-6]$/.test(id)?+id-1:M.sel;M.sel=i;
   if(i===0)RP.mode='status';
   else if(i===1){const L=Object.keys(s.items).filter(k=>ITEMS[k]&&s.items[k]>0).map(k=>({label:ITEMS[k].n+(ITEMS[k].key?' (중요)':' ×'+s.items[k]),use:()=>{const it=ITEMS[k],st=stat(s);if(it.key){pop('중요한 물건이에요',1000);return}if(it.dmg){pop('싸울 때 쓰는 물건이에요',1000);return}if(it.hp&&s.hp>=st.hp&&!it.mp||it.mp&&s.mp>=st.mp&&!it.hp){pop('지금은 배부르대요 ㅋㅋ',1000);return}
     s.items[k]--;if(s.items[k]<=0)delete s.items[k];if(it.hp)s.hp=Math.min(st.hp,s.hp+it.hp);if(it.mp)s.mp=Math.min(st.mp,s.mp+it.mp);jingle([784,1047],.08,'triangle');RP.mode='map';pop(it.n+' 냠냠!',900)}}));if(!L.length)pop('가방이 비었어요');else{M.prev=M.items;M.list=L;M.lsel=0;M.items=L}}
   else if(i===2){if(s.lv<3){pop('레벨 3에 배워요',1000);return true}if(s.mp<3){pop('MP가 모자라요',1000);return true}s.mp-=3;s.hp=Math.min(stat(s).hp,s.hp+20+s.lv*4);jingle([784,1047],.08,'triangle');RP.mode='map';pop('응원가! HP 회복',1000)}
   else if(i===3){pop(writeSave()?'저장했어요':'저장하지 못했어요',1000);RP.mode='map'}
   else if(i===4){RP.musicOff=!RP.musicOff;if(RP.musicOff)music(null);else music(map().music);RP.mode='map'}
   else ask('저장하고 그만할까요?',()=>{writeSave();music(null);back()})}return true}
 function shopItems(){const sh=SHOPS[RP.shop.id],s=RP.s;return sh.list.map(([k,id])=>{const o=k==='w'?WEAPONS.find(x=>x.id===id):k==='a'?ARMORS.find(x=>x.id===id):ITEMS[id];const own=k==='w'?s.weapon===id:k==='a'?s.armor===id:false;
   return{label:o.n+(k==='w'?' (공격 +'+o.atk+')':k==='a'?' (방어 +'+o.def+')':''),sub:own?'장착 중':o.price+'원',dim:own||s.gold<o.price,k,id,o}})}
 function shopKey(id){const L=shopItems(),n=L.length,S2=RP.shop,s=RP.s;if(id==='up')S2.sel=(S2.sel-1+n)%n;else if(id==='down')S2.sel=(S2.sel+1)%n;else if(id==='clr'||id==='menu'){RP.mode='map';say(SHOPS[S2.id].owner,SHOPS[S2.id].bye,null,SHOPS[S2.id].face)}
  else if(id==='ok'||id==='nate'||id==='5'||/^[1-9]$/.test(id)){const i=/^[1-9]$/.test(id)?+id-1:S2.sel,it=L[i];if(!it)return true;S2.sel=i;if(it.sub==='장착 중'){pop('이미 쓰고 있어요',900);return true}if(s.gold<it.o.price){pop('돈이 모자라요 ㅠㅠ',900);return true}
   s.gold-=it.o.price;if(it.k==='w')s.weapon=it.id;else if(it.k==='a')s.armor=it.id;else s.items[it.id]=(s.items[it.id]||0)+1;jingle([988,1319],.07);pop(it.o.n+(it.k==='i'?' 샀어요!':' 장착!'),900);writeSave()}return true}
 function drawStatus(g){const s=RP.s,st=stat(s),wp=WEAPONS.find(x=>x.id===s.weapon),ar=ARMORS.find(x=>x.id===s.armor);g.fillStyle='rgba(8,12,34,.95)';rr(g,6,VIEW_Y+6,W-12,VIEW_H-12,4);g.fill();g.strokeStyle='#ffd27a';g.lineWidth=1;g.stroke();
  spr(g,'hero_d0',12,VIEW_Y+12,2);T(g,s.name,48,VIEW_Y+24,{size:11,bold:true,color:'#fff',max:W-56});T(g,'레벨 '+s.lv+' · 다음까지 '+(expNeed(s.lv)-s.exp),48,VIEW_Y+38,{size:8,color:'#ffd27a',max:W-56});
  [['HP',s.hp+' / '+st.hp],['MP',s.mp+' / '+st.mp],['공격',st.atk+(wp?'  ('+wp.n+')':'')],['방어',st.def+(ar?'  ('+ar.n+')':'')],['민첩',st.spd],['돈',s.gold+'원'],['싸움',(s.battles||0)+'번']].forEach(([a,v],i)=>{const y=VIEW_Y+60+i*12;T(g,a,14,y,{size:8.5,bold:true,color:'#9fc0ff'});T(g,String(v),46,y,{size:8.5,color:'#fff',max:W-56})})}


 function startEnding(){const s=RP.s;if(!s)return;s.flags.ending=1;D.games.rpgClears=(D.games.rpgClears||0)+1;const ms=(s.playMs||0)+(now()-(RP.t0||now()));if(!D.games.rpgBestMs||ms<D.games.rpgBestMs)D.games.rpgBestMs=ms;save();writeSave();
  RP.mode='ending';RP.endT=now();music('ending');host.vibrate?.([60,60,60,60,200],'touch')}
 /* NATE 게임 소개 쪽에 붙는 작은 게임 화면 */
 function preview(g,id,t,ww,hh){g.save();g.scale(ww/W,hh/H);g.translate(0,-TOP);
  if(id==='rhythm'){g.fillStyle=grad(g,TOP,H,'#101a3a','#05070f');g.fillRect(0,TOP,W,H-TOP);for(let i=0;i<3;i++){R(g,LX+i*LW,FALL_TOP,LW,JUDGE_Y-FALL_TOP,i%2?'rgba(255,255,255,.07)':'rgba(255,255,255,.035)')}R(g,LX-2,JUDGE_Y-1,LW*3+4,3,'#fff');
   for(let k=0;k<7;k++){const lane=(k*2+1)%3,y=FALL_TOP+((t/9+k*31)%(JUDGE_Y-FALL_TOP));drawNote(g,LX+lane*LW,y,lane,false)}spr(g,'dance'+(1+Math.floor(t/400)%3),1,96,2);T(g,'PERFECT',LX+LW*1.5,104,{size:12,bold:true,color:'#7dfcff',align:'center',shadow:'#000'});T(g,'12 COMBO',LX+LW*1.5,118,{size:9,bold:true,color:'#fff',align:'center'})}
  else{const rows=MAPS.town.rows;for(let y=0;y<10;y++)for(let x=0;x<10;x++)tileDraw(g,rows[y+2][x+4],x*16-6,TOP+y*16,t,'.');spr(g,'hero_d'+(Math.floor(t/400)%2),3*16-6+16,TOP+3*16+16,1);spr(g,'girl',6*16-6,TOP+7*16,1);
   g.fillStyle='rgba(10,14,40,.92)';rr(g,3,H-58,W-6,40,4);g.fill();T(g,'도깨비가 황금 딱지를',9,H-42,{size:10,color:'#fff'});T(g,'훔쳐 갔대!',9,H-28,{size:10,color:'#fff'});spr(g,'m_king',W-44,TOP+8,2)}
  g.restore()}
 function summary(id){if(id==='rhythm'){const b=D.games.rhythmBest||0;return b?'최고 '+b.toLocaleString('ko-KR'):'새 게임'}if(id==='rpg'){const sv=(()=>{try{return JSON.parse(w.localStorage?.getItem(SAVE_KEY)||'null')}catch(_){return null}})();return D.games.rpgClears?'엔딩 '+D.games.rpgClears+'번':sv?'Lv'+sv.lv:'새 게임'}return null}
 INST={preview,ending:startEnding};
 return{screens:SCREENS,summary,preview,_test:{RG,RP,buildChart,rhythmSongs,songTime,laneHit,judgeNote,finish,MAPS,MON,ITEMS,SKILLS,stat,startBattle,doRound,advanceBattle,enterMap,tryMove,writeSave,loadSave,newSave,expNeed,heroBase,shopItems,startEnding,sprite,tileCv,LANE_OF,WIN}}}

w.AnycallGames={version:VERSION,create,SPR,PAL,MAPS,MON,ITEMS,ORIG,parseTune,midiOf,expNeed,heroBase,
 preview(g,id,t,ww,hh){if(INST)INST.preview(g,id,t,ww,hh)}};
})(window);
