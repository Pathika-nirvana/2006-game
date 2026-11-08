/* A91: 플래시짱의 병맛 만화 세 편과 똥 피하기.
   막대 인간 만화는 캔버스에 선과 동그라미로만 그린다. 시간(초)에 따라 장면이 바뀌고 자막이 붙는다.
   그림 파일과 소리는 쓰지 않는다. */
(function(w){'use strict';
const PI2=Math.PI*2;
const line=(g,a,b,c,d)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke()};
const dot=(g,x,y,r)=>{g.beginPath();g.arc(x,y,Math.max(.5,r),0,PI2);g.fill()};
function man(g,x,y,s,o){
 o=o||{};g.strokeStyle='#111';g.fillStyle='#fff';g.lineWidth=Math.max(2,s*.08);g.lineCap='round';
 g.beginPath();g.arc(x,y-s*1.05,s*.28,0,PI2);g.fill();g.stroke();
 line(g,x,y-s*.77,x,y-s*.2);
 const a=o.arm===undefined?.4:o.arm,l=o.leg===undefined?.3:o.leg;
 line(g,x,y-s*.65,x-s*(.5+Math.sin(a)*.3),y-s*(.35+Math.cos(a)*.3));line(g,x,y-s*.65,x+s*(.5+Math.cos(a)*.3),y-s*(.35+Math.sin(a)*.3));
 line(g,x,y-s*.2,x-s*(.3+Math.sin(l)*.3),y+s*.4);line(g,x,y-s*.2,x+s*(.3+Math.cos(l)*.3),y+s*.4);
 if(o.panic){line(g,x,y-s*.65,x-s*.45,y-s*1.25);line(g,x,y-s*.65,x+s*.45,y-s*1.25)}
 g.fillStyle='#111';dot(g,x-s*.1,y-s*1.08,s*.03);dot(g,x+s*.1,y-s*1.08,s*.03)}
const sky=(g,W,H,c)=>{g.fillStyle=c||'#f4f4ef';g.fillRect(0,0,W,H);g.fillStyle='#d9d9cf';g.fillRect(0,H*.78,W,H*.22)};
const SKITS=[
 {id:'ramen',title:'졸라맨의 라면 대작전',len:14,
  subs:[[0,'(졸라맨은 배가 고팠다)'],[3,'물이 끓는다... 끓는다...'],[6,'면을 넣었다. 스프도 넣었다.'],[9,'넘친다!!! 넘친다!!!'],[12,'라면은 먹지도 못했다']],
  draw(g,W,H,t){sky(g,W,H);const s=H*.18,py=H*.7,px=W*.58;
   g.fillStyle='#777';g.fillRect(px-W*.1,py-H*.1,W*.2,H*.12);g.fillRect(px-W*.12,py-H*.1,W*.02,H*.03);g.fillRect(px+W*.1,py-H*.1,W*.02,H*.03);
   g.fillStyle='#e8c84a';if(t>6)g.fillRect(px-W*.09+((t*13)%5),py-H*.1-(Math.min(t-6,3)*H*.02),W*.18,H*.03);
   if(t>3){g.fillStyle='rgba(120,180,255,.8)';for(let i=0;i<5;i++)dot(g,px-W*.07+i*W*.035,py-H*.12-((t*40+i*17)%26),3+i%3)}
   if(t>9){const f=Math.min(1,(t-9)/3);g.fillStyle='#fffbe0';dot(g,px,py-H*.12,W*.1*f);dot(g,px-W*.1*f,py-H*.05,W*.06*f);dot(g,px+W*.1*f,py-H*.05,W*.06*f)}
   man(g,W*.25,H*.74,s,{arm:t>9?0:.4+Math.sin(t*6)*.3,leg:.3,panic:t>9&&t<12});
   if(t>=12){const k=Math.min(1,(t-12)/1.2);g.fillStyle='#ffd24a';g.beginPath();for(let i=0;i<24;i++){const a=i/24*PI2,r=(i%2?W*.1:W*.22)*k;g.lineTo(px+Math.cos(a)*r,py-H*.2+Math.sin(a)*r)}g.closePath();g.fill();g.strokeStyle='#d33';g.lineWidth=3;g.stroke();g.fillStyle='#d33';g.font='bold '+Math.round(H*.09)+'px sans-serif';g.fillText('펑!',px-H*.08,py-H*.17)}}},
 {id:'late',title:'지각 마라톤',len:12,
  subs:[[0,'지각이다 ㅠㅠ'],[4,'달팽이한테 추월당했다'],[8,'학교에 도착했다'],[10,'오늘은 일요일이었다']],
  draw(g,W,H,t){sky(g,W,H,'#eef4fa');const run=t<4?t/4:t<8?1:1,mx=t<4?W*.1+W*.3*(t/4):t<8?W*.4+W*.02*(t-4):W*.55+W*.1*Math.min(1,(t-8)/1.5);
   const sx=t<4?W*.05:t<8?W*.05+W*.9*((t-4)/4)*.65:W*.62;
   if(t>=8){g.fillStyle='#c9b79c';g.fillRect(W*.62,H*.3,W*.3,H*.48);g.fillStyle='#9a8a70';g.fillRect(W*.62,H*.26,W*.3,H*.05);g.fillStyle='#fff';g.fillRect(W*.7,H*.55,W*.08,H*.23);g.fillStyle='#d33';g.fillRect(W*.9,H*.1,W*.01,H*.2);g.fillRect(W*.9,H*.1,W*.05,H*.05);g.fillStyle='#111';g.font='bold '+Math.round(H*.05)+'px sans-serif';g.fillText('휴교',W*.74,H*.45);if(t>=10){g.fillStyle='#fff';g.fillRect(W*.1,H*.12,W*.55,H*.1);g.fillStyle='#d33';g.fillText('일요일입니다',W*.14,H*.19)}}
   const sw=Math.sin(t*14);man(g,mx,H*.74,H*.18,{arm:sw,leg:t<8?sw*1.2:.3});
   if(t>=2&&t<8){g.fillStyle='#4aa0e8';for(let i=0;i<3;i++)dot(g,mx-H*.1-i*8+(t*30%5),H*.52-i*9,2+i)}
   if(t<8){g.fillStyle='#8a6a3a';dot(g,sx+W*.1,H*.82,H*.04);g.fillStyle='#c9b79c';dot(g,sx+W*.1,H*.82,H*.025);g.strokeStyle='#111';line(g,sx+W*.1+H*.04,H*.82,sx+W*.1+H*.07,H*.76)}}},
 {id:'duck',title:'오리는 날고 싶다',len:12,
  subs:[[0,'꽥꽥 (날고 싶다)'],[4,'절벽에서 뛰었다'],[6,'중력은 냉정하다'],[9,'그래도 꿈은 크게']],
  draw(g,W,H,t){sky(g,W,H,'#e9f2e4');g.fillStyle='#8f7a55';g.fillRect(0,H*.45,W*.38,H*.55);g.fillStyle='#7bb56a';g.fillRect(0,H*.43,W*.38,H*.03);
   let x=W*.2,y=H*.43;
   if(t<4){y-=Math.abs(Math.sin(t*5))*H*.06;x=W*.15+t*W*.03}else if(t<6){const k=t-4;x=W*.28+k*W*.18;y=H*.43-Math.sin(Math.min(1,k)*1.5)*H*.1+k*k*H*.12}else{x=W*.58;y=H*.76}
   const fl=Math.sin(t*20)*H*.05;g.fillStyle='#f6d33a';dot(g,x,y-H*.06,H*.07);dot(g,x+H*.07,y-H*.12,H*.04);g.fillStyle='#f08a1e';g.beginPath();g.moveTo(x+H*.1,y-H*.13);g.lineTo(x+H*.17,y-H*.11);g.lineTo(x+H*.1,y-H*.09);g.fill();g.fillStyle='#111';dot(g,x+H*.08,y-H*.135,2);
   g.strokeStyle='#c99a1a';g.lineWidth=3;line(g,x-H*.02,y-H*.06,x-H*.1,y-H*.06-fl);line(g,x-H*.02,y-H*.06,x-H*.1,y-H*.02+fl);
   if(t>=6&&t<9){g.fillStyle='#555';g.font='bold '+Math.round(H*.05)+'px sans-serif';g.fillText('퍽',x-H*.04,y-H*.2)}
   if(t>=9){g.fillStyle='#e8a0c0';for(let i=0;i<3;i++){g.font=Math.round(H*.06)+'px sans-serif';g.fillText('♥',x+H*.06*i-H*.05,y-H*.22-i*H*.05-((t*20)%12))}}}}
];
const rng=seed=>{let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}};
function createPoop(seed){
 const R=rng(seed||5),st={x:.5,items:[],t:0,score:0,over:false,spawn:.4};
 return{st,move(nx){st.x=Math.max(.06,Math.min(.94,nx))},
  step(dt){if(st.over)return;st.t+=dt;st.score=Math.floor(st.t*10);st.spawn-=dt;
   if(st.spawn<=0){st.spawn=Math.max(.2,.75-st.t*.02);st.items.push({x:.05+R()*.9,y:-.05,v:.35+R()*.25+Math.min(.3,st.t*.01)})}
   for(const it of st.items)it.y+=it.v*dt;st.items=st.items.filter(it=>it.y<1.1);
   for(const it of st.items)if(Math.abs(it.x-st.x)<.065&&it.y>.84&&it.y<.97){st.over=true}}}}
function drawPoop(g,W,H,st){
 g.fillStyle='#bfe3f5';g.fillRect(0,0,W,H);g.fillStyle='#8fcf6a';g.fillRect(0,H*.95,W,H*.05);
 for(const it of st.items){const x=it.x*W,y=it.y*H;g.fillStyle='#7a4a1c';dot(g,x,y+6,12);dot(g,x,y-2,9);dot(g,x,y-9,6);g.fillStyle='#fff';dot(g,x-4,y-1,2);dot(g,x+4,y-1,2)}
 const px=st.x*W,py=H*.93;man(g,px,py,H*.1,{arm:st.over?0:.4+Math.sin(st.t*12)*.4,leg:.3+Math.sin(st.t*12)*.4,panic:st.over});
 g.fillStyle='#111';g.font='bold 16px sans-serif';g.fillText('점수 '+st.score,10,22);
 if(st.over){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,H*.3,W,H*.3);g.fillStyle='#fff';g.font='bold 26px sans-serif';g.fillText('똥 맞았다 ㅠㅠ',W*.2,H*.43);g.font='15px sans-serif';g.fillText('Enter 또는 화면을 눌러 다시 하기',W*.12,H*.52)}}
const api={SKITS,createPoop,drawPoop,man,rng};
w.WebFlash=api;
})(window);
