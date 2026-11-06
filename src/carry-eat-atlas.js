/* A40 complete body+hand+food PNG frames, no detached runtime food overlays. */
(function(root){
'use strict';
const images={},clocks=new Map(),spec={width:128,height:128,columns:8,rows:15,anchor:[48,124],displayHeight:56};
const ids=['boy_main_blue','boy_main_green','boy_main_dobok','girl_main_pink','girl_main_yellow','girl_main_dobok'];
for(const id of ids){const img=new root.Image();img.src='assets/characters/carry-eat/'+id+'.png';images[id]=img}
function group(kind){return kind==='tteok'?0:kind==='hotdog'?1:kind==='skewer'?2:kind==='slushred'?3:kind==='slushblue'?4:5}
function ready(id){const a=images[id];return !!a?.complete&&(a.naturalWidth||a.width)===1024&&(a.naturalHeight||a.height)===1920}
function frame(kind,pose,elapsed){const base=group(kind)*20;
 if(pose==='eat'){
  const durations=[120,150,160,190,180,150,180,120];let t=Math.max(0,elapsed),n=0;
  while(n<7&&t>=durations[n])t-=durations[n++];return base+n;
 }
 if(pose==='walk'||pose==='run'||pose==='climb')return base+8+Math.floor(elapsed/112)%8;
 if(['sit','bench','swing'].includes(pose))return base+18;
 if(pose==='jump')return base+19;
 return base+16;
}
function draw(c,id,x,foot,dir,pose,kind,now=performance.now(),actor='local'){
 if(!kind||!ready(id))return false;
 let clock=clocks.get(actor);if(!clock||clock.pose!==pose||clock.kind!==kind){clock={pose,kind,at:now};clocks.set(actor,clock)}
 const local=actor==='local'&&pose==='eat'?root.EatingMotion?.current(now):null;
 const elapsed=local?.elapsed??now-clock.at,index=frame(kind,pose,elapsed),height=root.CHARACTER_MANIFEST?.[id]?.displayHeight??spec.displayHeight,scale=height/spec.height;
 c.save();c.imageSmoothingEnabled=false;
 const front=index%20===16;
 if(!front&&dir===0){c.translate(Math.round(x),0);c.scale(-1,1);c.translate(-Math.round(x),0)}
 c.drawImage(images[id],index%8*128,(index/8|0)*128,128,128,Math.round(x-48*scale),Math.round(foot-124*scale),128*scale,height);
 c.restore();return true;
}
root.CarryEatAtlas={draw,ready,frame,group,spec,get loaded(){return Object.fromEntries(ids.map(id=>[id,ready(id)]))}};
})(typeof window!=='undefined'?window:globalThis);
