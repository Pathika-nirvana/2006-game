/* A59: one continuous world master, fixed common sidewalk and curb plane. */
(function(w){'use strict';
const SCALE=.8,Y=-261,WIDTH=4572,imgs={};
let ready=false;
const readyPromise=Promise.all(['master','floor','sonata','porter'].map(id=>new Promise(resolve=>{const im=imgs[id]=new w.Image();im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src='assets/maps/main-road/'+id+'.webp'}))).then(r=>ready=r.every(Boolean));
function draw(c,cam){const camera=Math.round(cam);c.save();c.imageSmoothingEnabled=false;c.fillStyle='#5b5d67';c.fillRect(0,-17,480,287);if(ready){const im=imgs.master,left=Math.max(0,camera),right=Math.min(camera+480,WIDTH);if(right>left)c.drawImage(im,left/SCALE,0,(right-left)/SCALE,im.height,left-camera,Y,right-left,im.height*SCALE);
 // A single shared paving/curb strip replaces all former joins at one fixed height.
 const tile=imgs.floor,tw=240*SCALE,ty=Math.round(578*SCALE+Y);
 for(let i=Math.floor(camera/tw);i*tw<camera+480;i++)c.drawImage(tile,Math.round(i*tw-camera),ty,tw,70*SCALE);
 // Crosswalk openings intentionally interrupt the curb; their road plane is retained.
 for(const[a,b]of [[1980,2345],[5280,5716]]){const x=Math.max(left,a*SCALE),end=Math.min(right,b*SCALE);if(end>x)c.drawImage(im,x/SCALE,578,(end-x)/SCALE,70,x-camera,ty,end-x,70*SCALE)}
 // Local drains sit in the shared curb, rather than returning old mismatched curb heights.
 for(const x of [250,1420,2710,3820,4820])if(x*SCALE>camera-60&&x*SCALE<camera+500)c.drawImage(im,1407,594,48,17,x*SCALE-camera,214,48*SCALE,17*SCALE);
 }c.restore();return true}
function hotspots(t){return[
 {type:'routeGate',x:24,r:22,to:'street',spawn:920,title:'별빛문구 옆 골목으로',txt:'익숙한 문구점 골목으로 돌아간다.',icon:'↶'},
 {type:'routeNote',x:85,r:20,title:'중앙약국',txt:'유리문 너머 약 상자와 작은 계산대가 보인다. 문 앞에는 처방전 안내판이 놓여 있다.',icon:'✚'},
 {type:'routeNote',x:198,r:21,title:'진영제과',txt:'유리 진열장에 빵이 놓여 있고, 가게 옆에 배달 상자가 쌓여 있다.',icon:'🍞'},
 {type:'routeNote',x:291,r:23,title:'김밥나라 앞',txt:'학원에 가기 전 김밥 한 줄을 먹는 아이들이 들르는 가게다.',icon:'🍙'},
 {type:'routeNote',x:403,r:22,title:'학원 건물 안내',txt:'영어·수학·피아노·태권도. 청솔수학·소리엘피아노·한빛태권도가 서로 다른 층에 있고 유리창에는 여름방학 특강 안내가 보인다.',icon:'📚'},
 {type:'routeSit',x:454,y:192,r:21,title:'정류장 벤치',txt:'시간표 옆 벤치에 잠깐 앉았다. 큰길의 차 소리가 이어진다.',icon:'🚌'},
 {type:'routeNote',x:580,r:23,title:'한빛 이동통신',txt:'작은 휴대전화 사진과 요금제 안내가 창문에 붙어 있다. 아직 폴더폰을 접고 펴던 시절이다.',icon:'☎'},
 {type:'routeNote',x:965,r:24,title:'제일서점',txt:'참고서와 학습서, 새 책들이 유리문 뒤로 보인다. 위층에는 독서실 간판이 붙어 있다.',icon:'📖'},
 {type:'routeNote',x:1070,r:22,title:'행복사진관',txt:'증명사진과 인화 안내가 붙은 작은 사진관. 진열된 사진 옆에 카메라가 놓여 있다.',icon:'📷'},
 {type:'routeNote',x:1205,r:24,title:'의원과 은행 건물',txt:'같은 건물 안에 소아과와 치과, 은행이 있다. 층마다 다른 간판이 건물의 높이를 알려 준다.',icon:'🏢'},
 {type:'routeNote',x:1520,r:22,title:'은하 비디오',txt:'창문 안쪽 진열대에 영화 케이스들이 줄지어 꽂혀 있다.',icon:'📼'},
 {type:'routeNote',x:1680,r:24,title:'영진컴퓨터',txt:'브라운관 모니터와 키보드 상자들이 가게 안에 놓여 있다. 위층 창문에는 음악학원 안내가 붙어 있다.',icon:'🖥'},
 {type:'routeNote',x:1810,r:23,title:'미선미용실',txt:'의자와 거울이 나란히 놓인 미용실. 옆에는 작은 옷수선 가게가 있다.',icon:'✂'},
 {type:'routeNote',x:2070,r:23,title:'뮤직박스',txt:'진열대에 CD와 카세트 음반들이 꽂혀 있다. 가게 앞에서 어떤 앨범을 살지 고민하던 시절이다.',icon:'♫'},
 {type:'routeNote',x:2200,r:24,title:'큰길 끝 교차로',txt:'상가가 이어진 길 끝에서 주택가로 향하는 길이 다시 갈라진다.',icon:'🚦'},
 {type:'routeNote',x:1370,r:25,title:'정진입시학원과 솔빛영어학원',txt:'3층은 정진입시학원, 2층은 솔빛영어학원이다. 계단실 옆 안내판에 층별 입주 학원과 수업 대상이 적혀 있다.',icon:'📚'},
 {type:'routeNote',x:820,r:24,title:'교차로 모퉁이',txt:'큰길과 골목이 만나는 자리. 신호등 아래로 횡단보도가 이어진다.',icon:'🚦'}
].map(a=>({...a,x:a.x*2,...(a.y===undefined?{}:{y:207+(a.y-207)*2})}))}
function traffic(t){return [['sonata',-180,440,236,180],['porter',150,2200,249,200]].map(([id,speed,offset,y,width])=>({id,speed,x:((offset+t*speed)%(WIDTH+440)+(WIDTH+440))%(WIDTH+440)-220,y,width}))}
function foreground(c,t){if(!ready)return;for(const a of traffic(t)){const im=imgs[a.id],height=a.width*im.height/im.width;c.save();c.translate(a.x,a.y);if(a.speed<0)c.scale(-1,1);c.drawImage(im,-a.width/2,-height,a.width,height);c.restore()}}
function dynamic(c,t){if(!ready)return;for(const [look,base,speed,range]of [['npc_studentA',1120,.23,190],['npc_market',2820,.17,240],['npc_studentB',3860,.19,140]]){const x=base+Math.sin(t*speed)*range;c.save();c.fillStyle='#34484232';c.beginPath();c.ellipse(x,208,8,2,0,0,7);c.fill();w.CHARART?.drawRemote?.(c,look,x,207,Math.cos(t*speed)>0?1:0,'walk','main-road-'+look);c.restore()}}
w.CommercialRoad={readyPromise,draw,hotspots,dynamic,foreground,traffic,geometry:{scale:SCALE,offsetY:Y,screenOffset:17,walkY:207,curbTop:214,curbBottom:228},width:WIDTH,get ready(){return ready}};
})(window);
