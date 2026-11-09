/* A89: 어린이 포털 안의 작은 오락(2006년 플래시 게임 느낌) 8종. 그림 파일 없이 캔버스로 직접 그린다.
   KidsGames.run(id, host, {E, best, onScore}) 로 실행하고, 돌려받은 {stop, state} 로 끝내거나 상태를 본다. */
(function(w){'use strict';
const W=480,H=320,FONT='bold 14px Dotum,Gulim,sans-serif';
const rnd=(a,b)=>a+Math.random()*(b-a);
const shuffle=(a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const WORDS=['학교','바나나','구름','딱지','떡볶이','도토리','미니홈피','피구','컵라면','단소','소풍','방학','연필','지우개','무지개','개구리','운동장','급식','숙제','일기장','문방구','자전거','수박','아이스크림','짝꿍'];
function text(g,s,x,y,color,align,font){g.fillStyle=color||'#222';g.textAlign=align||'left';g.font=font||FONT;g.fillText(s,x,y)}
function hud(g,left,right){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,W,22);text(g,left,8,16,'#fff');text(g,right,W-8,16,'#ffeb7a','right')}

const GAMES={
 mole:{title:'뿅뿅 두더지',help:'머리를 내민 두더지를 클릭해서 잡으세요. 30초 안에 몇 마리?',init(env){
  const holes=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)holes.push({x:120+c*120,y:100+r*80,t:0,hit:0});
  let score,time,next;
  return{reset(){score=0;time=30;next=.4;holes.forEach(h=>{h.t=0;h.hit=0})},
   update(dt){time-=dt;if(time<=0){env.over(score);return}next-=dt;if(next<=0){const idle=holes.filter(h=>h.t<=0&&h.hit<=0);if(idle.length)idle[Math.floor(Math.random()*idle.length)].t=rnd(.7,1.2);next=rnd(.3,.7)}for(const h of holes){if(h.t>0)h.t-=dt;if(h.hit>0)h.hit-=dt}},
   click(x,y){for(const h of holes)if(h.t>0&&Math.hypot(x-h.x,y-(h.y-14))<30){h.t=0;h.hit=.3;score++;return}},
   draw(g){g.fillStyle='#8fd16a';g.fillRect(0,0,W,H);for(const h of holes){g.fillStyle='#4b3a22';g.beginPath();g.ellipse(h.x,h.y+8,38,13,0,0,7);g.fill();if(h.t>0){g.fillStyle='#8a5a2b';g.beginPath();g.arc(h.x,h.y-14,26,0,7);g.fill();g.fillStyle='#fff';g.fillRect(h.x-12,h.y-22,8,8);g.fillRect(h.x+4,h.y-22,8,8);g.fillStyle='#000';g.fillRect(h.x-9,h.y-19,3,3);g.fillRect(h.x+7,h.y-19,3,3);g.fillStyle='#f5a0a0';g.beginPath();g.arc(h.x,h.y-7,5,0,7);g.fill()}else if(h.hit>0)text(g,'★ 뿅!',h.x,h.y-10,'#d33','center')}hud(g,'잡은 수 '+score,'남은 시간 '+Math.ceil(Math.max(0,time))+'초')},
   state(){return{score,time,active:holes.filter(h=>h.t>0).map(h=>({x:h.x,y:h.y-14}))}}}}},

 rain:{title:'산성비 타자 연습',help:'떨어지는 낱말을 아래 칸에 쓰고 엔터! 바닥에 닿으면 목숨이 줄어요.',input:true,init(env){
  let words,score,life,spawn,speed,killed;
  const make=()=>({s:WORDS[Math.floor(Math.random()*WORDS.length)],x:rnd(20,W-90),y:26,v:0});
  return{reset(){words=[];score=0;life=5;spawn=.6;speed=34;killed=0},
   update(dt){spawn-=dt;if(spawn<=0){words.push(make());spawn=Math.max(.9,2.2-killed*.04)}for(const x of words)x.y+=(speed+killed*1.2)*dt;for(const x of words.filter(x=>x.y>H-6)){life--;words.splice(words.indexOf(x),1)}if(life<=0)env.over(score)},
   submit(v){const i=words.findIndex(x=>x.s===v);if(i>=0){score+=words[i].s.length*10;killed++;words.splice(i,1);return true}return false},
   draw(g){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a3a5a');gr.addColorStop(1,'#6a8aaa');g.fillStyle=gr;g.fillRect(0,0,W,H);for(const x of words)text(g,x.s,x.x,x.y,'#fff7a8','left','bold 16px Dotum,Gulim,sans-serif');g.fillStyle='#355';g.fillRect(0,H-6,W,6);hud(g,'점수 '+score,'목숨 '+'♥'.repeat(Math.max(0,life)))},
   state(){return{score,life,words:words.map(x=>x.s)}}}}},

 memory:{title:'짝 맞추기',help:'뒤집힌 카드 두 장이 같은 그림이면 짝이 맞아요. 적게 뒤집을수록 점수가 높아요.',init(env){
  let cards,open,moves,found,lock;const SH=['●','■','▲','★','♥','◆','✚','☾'],COL=['#e44','#38c','#3a5','#e9a010','#d3a','#6a4bbb','#e66','#444'];
  const pos=i=>({x:60+(i%4)*92,y:44+Math.floor(i/4)*62});
  return{reset(){const ids=shuffle([0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7]);cards=ids.map(k=>({k,up:false,ok:false}));open=[];moves=0;found=0;lock=0},
   update(dt){if(lock>0){lock-=dt;if(lock<=0){for(const c of open)c.up=false;open=[]}}},
   click(x,y){if(lock>0)return;for(let i=0;i<16;i++){const p=pos(i),c=cards[i];if(!c.up&&!c.ok&&x>p.x&&x<p.x+80&&y>p.y&&y<p.y+54){c.up=true;open.push(c);if(open.length===2){moves++;if(open[0].k===open[1].k){open[0].ok=open[1].ok=true;open=[];found++;if(found===8)env.over(Math.max(0,200-moves*8))}else lock=.7}return}}},
   draw(g){g.fillStyle='#cfe6b8';g.fillRect(0,0,W,H);for(let i=0;i<16;i++){const p=pos(i),c=cards[i];g.fillStyle=c.up||c.ok?'#fffbe6':'#4d7fc4';g.fillRect(p.x,p.y,80,54);g.strokeStyle='#244';g.strokeRect(p.x+.5,p.y+.5,80,54);if(c.up||c.ok)text(g,SH[c.k],p.x+40,p.y+38,COL[c.k],'center','bold 30px Dotum,Gulim,sans-serif');else text(g,'?',p.x+40,p.y+36,'#cfe','center','bold 26px Dotum,Gulim,sans-serif')}hud(g,'뒤집은 횟수 '+moves,'맞춘 짝 '+found+' / 8')},
   state(){return{moves,found,cards:cards.map(c=>({k:c.k,up:c.up,ok:c.ok})),pos:cards.map((c,i)=>pos(i))}}}}},

 breakout:{title:'벽돌 깨기',help:'마우스나 좌우 방향키로 막대를 움직여 공을 받아 치세요.',init(env){
  let bricks,ball,px,lives,score,level;const PW=70;
  const build=()=>{bricks=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++)bricks.push({x:14+c*57,y:34+r*20,w:52,h:15,r,on:true})};
  const serve=()=>{ball={x:W/2,y:H-40,vx:120*(Math.random()<.5?-1:1),vy:-170-level*20}};
  return{reset(){lives=3;score=0;level=0;px=W/2;build();serve()},
   move(x){px=Math.max(PW/2,Math.min(W-PW/2,x))},
   key(k){if(k==='ArrowLeft')px=Math.max(PW/2,px-26);if(k==='ArrowRight')px=Math.min(W-PW/2,px+26)},
   update(dt){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<6){ball.x=6;ball.vx=Math.abs(ball.vx)}if(ball.x>W-6){ball.x=W-6;ball.vx=-Math.abs(ball.vx)}if(ball.y<28){ball.y=28;ball.vy=Math.abs(ball.vy)}
    if(ball.vy>0&&ball.y>H-26&&ball.y<H-14&&Math.abs(ball.x-px)<PW/2+4){ball.vy=-Math.abs(ball.vy);ball.vx=(ball.x-px)*4.5}
    for(const b of bricks)if(b.on&&ball.x>b.x&&ball.x<b.x+b.w&&ball.y>b.y&&ball.y<b.y+b.h){b.on=false;ball.vy=-ball.vy;score+=10;break}
    if(!bricks.some(b=>b.on)){level++;build();serve();score+=50}
    if(ball.y>H+8){lives--;if(lives<=0)env.over(score);else serve()}},
   draw(g){g.fillStyle='#10192e';g.fillRect(0,0,W,H);const C=['#e44','#e90','#ec3','#4b4','#38c'];for(const b of bricks)if(b.on){g.fillStyle=C[b.r];g.fillRect(b.x,b.y,b.w,b.h)}g.fillStyle='#fff';g.beginPath();g.arc(ball.x,ball.y,5,0,7);g.fill();g.fillStyle='#9cf';g.fillRect(px-PW/2,H-22,PW,8);hud(g,'점수 '+score,'공 '+'●'.repeat(Math.max(0,lives)))},
   state(){return{score,lives,px,bricks:bricks.filter(b=>b.on).length,ball:{...ball}}}}}},

 dodge:{title:'똥 피하기',help:'마우스나 좌우 방향키로 움직여서 떨어지는 똥을 피하세요. 오래 버틸수록 높은 점수!',init(env){
  let px,drops,t,spawn;
  return{reset(){px=W/2;drops=[];t=0;spawn=.3},
   move(x){px=Math.max(14,Math.min(W-14,x))},
   key(k){if(k==='ArrowLeft')px=Math.max(14,px-26);if(k==='ArrowRight')px=Math.min(W-14,px+26)},
   update(dt){t+=dt;spawn-=dt;if(spawn<=0){drops.push({x:rnd(14,W-14),y:-10,v:rnd(110,170)+t*5});spawn=Math.max(.14,.55-t*.01)}for(const o of drops)o.y+=o.v*dt;drops=drops.filter(o=>o.y<H+14);for(const o of drops)if(Math.abs(o.x-px)<18&&o.y>H-52&&o.y<H-10){env.over(Math.floor(t*10));return}},
   draw(g){g.fillStyle='#bfe3ff';g.fillRect(0,0,W,H);g.fillStyle='#7ab648';g.fillRect(0,H-12,W,12);for(const o of drops){g.fillStyle='#6b4423';g.beginPath();g.ellipse(o.x,o.y+6,12,6,0,0,7);g.fill();g.beginPath();g.ellipse(o.x,o.y,9,5,0,0,7);g.fill();g.beginPath();g.ellipse(o.x,o.y-5,5,4,0,0,7);g.fill()}g.fillStyle='#f6c89a';g.beginPath();g.arc(px,H-40,9,0,7);g.fill();g.fillStyle='#3b6fc4';g.fillRect(px-8,H-31,16,14);g.fillStyle='#222';g.fillRect(px-8,H-17,5,5);g.fillRect(px+3,H-17,5,5);hud(g,'버틴 시간 '+t.toFixed(1)+'초','점수 '+Math.floor(t*10))},
   state(){return{t,px,drops:drops.length}}}}},

 snake:{title:'지렁이 키우기',help:'방향키로 지렁이를 움직여 사과를 먹으세요. 벽이나 자기 몸에 닿으면 끝!',keys:true,init(env){
  const C=24,GW=20,GH=13;let body,dir,want,apple,step,score;
  const place=()=>{do{apple={x:Math.floor(Math.random()*GW),y:Math.floor(Math.random()*GH)}}while(body.some(b=>b.x===apple.x&&b.y===apple.y))};
  return{reset(){body=[{x:6,y:6},{x:5,y:6},{x:4,y:6}];dir={x:1,y:0};want=dir;step=0;score=0;place()},
   key(k){const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}}[k];if(m&&(m.x+dir.x!==0||m.y+dir.y!==0))want=m},
   update(dt){step+=dt;const gap=Math.max(.07,.16-score*.0006);if(step<gap)return;step=0;dir=want;const h={x:body[0].x+dir.x,y:body[0].y+dir.y};if(h.x<0||h.y<0||h.x>=GW||h.y>=GH||body.some(b=>b.x===h.x&&b.y===h.y)){env.over(score);return}body.unshift(h);if(h.x===apple.x&&h.y===apple.y){score+=10;place()}else body.pop()},
   draw(g){g.fillStyle='#e8f1c4';g.fillRect(0,0,W,H);g.fillStyle='#d8e5ad';for(let x=0;x<GW;x++)for(let y=0;y<GH;y++)if((x+y)%2)g.fillRect(x*C,y*C,C,C);g.fillStyle='#d22';g.beginPath();g.arc(apple.x*C+12,apple.y*C+12,8,0,7);g.fill();for(const [i,b] of body.entries()){g.fillStyle=i?'#d98a8a':'#c45a5a';g.fillRect(b.x*C+2,b.y*C+2,C-4,C-4)}hud(g,'점수 '+score,'길이 '+body.length)},
   state(){return{score,dir,head:{...body[0]},length:body.length,apple}}}}},

 numbers:{title:'숫자 빨리 누르기',help:'1부터 25까지 순서대로 가장 빨리 누르세요.',init(env){
  let grid,next,t;const pos=i=>({x:90+(i%5)*60,y:40+Math.floor(i/5)*56});
  return{reset(){grid=shuffle(Array.from({length:25},(_,i)=>i+1));next=1;t=0},
   update(dt){t+=dt},
   click(x,y){for(let i=0;i<25;i++){const p=pos(i);if(grid[i]===next&&x>p.x&&x<p.x+54&&y>p.y&&y<p.y+50){next++;if(next>25)env.over(Math.max(0,1000-Math.round(t*20)));return}}},
   draw(g){g.fillStyle='#fff3c8';g.fillRect(0,0,W,H);for(let i=0;i<25;i++){const p=pos(i),n=grid[i];if(n<next)continue;g.fillStyle='#ffb347';g.fillRect(p.x,p.y,54,50);g.strokeStyle='#a60';g.strokeRect(p.x+.5,p.y+.5,54,50);text(g,String(n),p.x+27,p.y+32,'#400','center','bold 22px Dotum,Gulim,sans-serif')}hud(g,'다음 숫자 '+Math.min(25,next),'걸린 시간 '+t.toFixed(1)+'초')},
   state(){return{next,t,grid:grid.slice(),pos:grid.map((n,i)=>pos(i))}}}}},

 balloon:{title:'풍선 터뜨리기',help:'올라가는 풍선을 클릭해서 터뜨리세요. 까만 폭탄 풍선은 피하세요! (30초)',init(env){
  let list,score,time,spawn;const COLS=['#e44','#38c','#3a5','#e9a010','#d3a','#6a4bbb'];
  return{reset(){list=[];score=0;time=30;spawn=.2},
   update(dt){time-=dt;if(time<=0){env.over(Math.max(0,score));return}spawn-=dt;if(spawn<=0){const bomb=Math.random()<.15,r=bomb?20:rnd(14,26);list.push({x:rnd(30,W-30),y:H+30,r,v:rnd(50,110),bomb,c:bomb?'#222':COLS[Math.floor(Math.random()*COLS.length)]});spawn=rnd(.25,.6)}for(const b of list)b.y-=b.v*dt;list=list.filter(b=>b.y>-40)},
   click(x,y){for(let i=list.length-1;i>=0;i--){const b=list[i];if(Math.hypot(x-b.x,y-b.y)<b.r+4){score+=b.bomb?-3:(b.r<19?3:1);list.splice(i,1);return}}},
   draw(g){g.fillStyle='#d7efff';g.fillRect(0,0,W,H);for(const b of list){g.strokeStyle='#666';g.beginPath();g.moveTo(b.x,b.y+b.r);g.lineTo(b.x,b.y+b.r+22);g.stroke();g.fillStyle=b.c;g.beginPath();g.ellipse(b.x,b.y,b.r*.85,b.r,0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(b.x-b.r*.3,b.y-b.r*.35,b.r*.18,b.r*.3,0,0,7);g.fill()}hud(g,'점수 '+score,'남은 시간 '+Math.ceil(Math.max(0,time))+'초')},
   state(){return{score,time,list:list.map(b=>({x:b.x,y:b.y,bomb:b.bomb}))}}}}}
};
const ORDER=['mole','rain','memory','breakout','dodge','snake','numbers','balloon'];

function run(id,host,opt){
 const def=GAMES[id];if(!def)return null;opt=opt||{};const E=opt.E||((t,c,x)=>{const n=w.document.createElement(t);if(c)n.className=c;if(x!==undefined)n.textContent=x;return n});
 const cv=E('canvas','kg-canvas');cv.width=W;cv.height=H;cv.tabIndex=0;cv.setAttribute('aria-label',def.title+' 게임 화면');host.append(cv);
 const g=cv.getContext?cv.getContext('2d'):null;
 if(!g){host.append(E('p','kg-note','이 화면에서는 게임을 실행할 수 없습니다.'));return{stop(){},state(){return{}},phase:()=>'none'}}
 let phase='ready',last=0,raf=0,stopped=false,best=opt.best||0,result=0,input=null;
 const env={over(score){if(phase!=='play')return;phase='over';result=score;let isNew=false;if(score>best){best=score;isNew=true}if(opt.onScore)opt.onScore(id,score,isNew);if(input)input.disabled=true}};
 const game=def.init(env);game.reset();
 if(def.input){input=E('input','kg-input');input.type='text';input.maxLength=12;input.placeholder='낱말을 쓰고 엔터';input.setAttribute('aria-label','낱말 입력');input.disabled=true;
  input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){if(phase==='play'&&game.submit(input.value.trim()))input.value='';else input.value='';e.preventDefault()}});host.append(input)}
 const at=e=>{const r=cv.getBoundingClientRect?cv.getBoundingClientRect():{left:0,top:0,width:W,height:H};const sx=W/(r.width||W),sy=H/(r.height||H);return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy}};
 const begin=()=>{game.reset();phase='play';last=0;if(input){input.disabled=false;input.value='';input.focus&&input.focus()}else cv.focus&&cv.focus()};
 cv.addEventListener('pointerdown',e=>{if(e.preventDefault)e.preventDefault();if(phase!=='play')return begin();const p=at(e);if(game.click)game.click(p.x,p.y)});
 cv.addEventListener('pointermove',e=>{if(phase==='play'&&game.move)game.move(at(e).x)});
 cv.addEventListener('keydown',e=>{const k=e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(k)){e.preventDefault();e.stopPropagation()}if(phase!=='play'){if(k==='Enter'||k===' ')begin();return}if(game.key)game.key(k)});
 const stop=()=>{if(stopped)return;stopped=true;if(raf&&w.cancelAnimationFrame)w.cancelAnimationFrame(raf)};
 const frame=ts=>{if(stopped)return;if(host.isConnected===false){stop();return}const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;if(phase==='play')game.update(dt);game.draw(g);
  if(phase!=='play'){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,H);text(g,def.title,W/2,110,'#ffeb7a','center','bold 28px Dotum,Gulim,sans-serif');
   if(phase==='over'){text(g,'게임 끝! 점수 '+result,W/2,160,'#fff','center','bold 20px Dotum,Gulim,sans-serif');text(g,'내 최고 점수 '+best,W/2,188,'#cfe','center');text(g,'화면을 클릭하면 다시 시작',W/2,230,'#fff','center')}
   else{text(g,def.help,W/2,160,'#fff','center');text(g,'내 최고 점수 '+best,W/2,188,'#cfe','center');text(g,'화면을 클릭하면 시작',W/2,230,'#fff','center')}}
  last=ts;raf=w.requestAnimationFrame?w.requestAnimationFrame(frame):0};
 if(w.requestAnimationFrame)raf=w.requestAnimationFrame(frame);else{try{game.draw(g)}catch(_){}}
 return{stop,state:()=>game.state(),phase:()=>phase,begin,result:()=>result,best:()=>best,game};
}
/* A95: 다른 파일에서 오락을 더 붙일 수 있다. KidsGames.register(id, {title, help, init}) */
const list=ORDER.map(id=>({id,title:GAMES[id].title,help:GAMES[id].help}));
function register(id,def){if(!/^[a-z][a-z0-9]{1,15}$/.test(id)||GAMES[id]||!def||typeof def.init!=='function')return false;GAMES[id]=def;ORDER.push(id);list.push({id,title:def.title,help:def.help});return true}
w.KidsGames={list,run,register,has:id=>!!GAMES[id],title:id=>GAMES[id]?GAMES[id].title:'',W,H,text,hud};
})(window);
