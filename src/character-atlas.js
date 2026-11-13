/* One renderer for both genders, all six outfits. Source pixels never stretch per pose. */
(function(root){
'use strict';
const manifest=root.CHARACTER_MANIFEST;
const starts=new WeakMap();
function motion(name){
 if(name.startsWith('walk')||name.startsWith('run')||name.startsWith('climb'))return 'walk';
 if(name.startsWith('sit')||name==='bench'||name==='swing')return 'sit';
 if(name.startsWith('jump'))return 'jump';
 if(name.startsWith('eat'))return 'eat';
 return 'idle';
}
function frameAt(spec,pose,elapsed){
 const a=spec.animations[pose];
 if(pose==='jump')return a.frames[Math.min(a.frames.length-1,Math.floor(elapsed/a.ms))];
 const total=a.durations?.reduce((x,y)=>x+y,0);
 if(total){let t=elapsed%total;for(let i=0;i<a.frames.length;i++){if(t<a.durations[i])return a.frames[i];t-=a.durations[i]}}
 return a.frames[Math.floor(elapsed/a.ms)%a.frames.length];
}
function valid(img,id){const s=manifest[id];return !!s&&img.naturalWidth===s.columns*s.frameWidth&&img.naturalHeight===s.rows*s.frameHeight}
function draw(c,img,id,x,foot,dir,name,now=performance.now(),actorKey="local",heldKind=null){
 if(root.TaekwondoMotion?.draw(c,id,x,foot,dir,now,actorKey))return true;
 const s=manifest[id];if(!s)return false;
 const pose=motion(name);const held=actorKey==='local'?root.SHOPS?.heldKind:heldKind;
 if(held&&root.CarryEatAtlas?.draw(c,id,x,foot,dir,pose,held,now,actorKey))return true;
 let actors=starts.get(c);if(!actors){actors=new Map();starts.set(c,actors)}
 // The caller's stable actor key is preferred; coordinates are intentionally not clocks.
 const key=actorKey;
 let clock=actors.get(key);if(!clock||clock.pose!==pose){clock={pose,at:now};actors.set(key,clock)}
 const f=frameAt(s,pose==='eat'?'idle':pose,now-clock.at),col=f%s.columns,row=Math.floor(f/s.columns);
 const scale=s.displayHeight/s.frameHeight;
 const dx=Math.round(x-s.anchor[0]*scale),dy=Math.round(foot-s.anchor[1]*scale);
 c.save();c.imageSmoothingEnabled=false;
 if(pose!=='idle'&&dir===0){c.translate(Math.round(x),0);c.scale(-1,1);c.translate(-Math.round(x),0)}
 c.drawImage(img,col*s.frameWidth,row*s.frameHeight,s.frameWidth,s.frameHeight,dx,dy,s.frameWidth*scale,s.displayHeight);
 c.restore();return true;
}
root.CharacterAtlas={draw,valid,frameAt,motion,manifest,actorKey:null};
})(typeof window!=='undefined'?window:globalThis);
