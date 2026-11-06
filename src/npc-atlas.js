/* A41 foreground resident renderer; original actor paths and interactions stay in the game core. */
(function(root){
'use strict';const manifest=root.NPC_MANIFEST;
function valid(img,id){const s=manifest[id];return !!s&&img.naturalWidth===s.columns*s.frameWidth&&img.naturalHeight===s.rows*s.frameHeight}
function choose(index,now=performance.now()){
 if(index<2){const t=now%3200;return t<1200?0:t<2200?1:t<2340?2:3}
 if(index>=2&&index<=9)return 4+index-2;
 if(index===10||index===11)return 21+index-10;
 if(index===12||index===13)return index;
 if(index>=14&&index<=16)return index;
 if(index>=24&&index<=27)return 17+index-24;
 if(index>=17&&index<=19)return 17+(Math.floor(now/260)%4);
 if(index>=20&&index<=23)return 4+(Math.floor(now/112)%8);
 return 23;
}
function draw(c,img,id,x,foot,dir,index,now=performance.now()){
 const s=manifest[id];if(!s||!valid(img,id))return false;
 const f=choose(index,now),scale=s.displayHeight/s.frameHeight,dx=Math.round(x-s.anchor[0]*scale),dy=Math.round(foot-s.anchor[1]*scale);
 const front=f<4||(f>=14&&f<=16);c.save();c.imageSmoothingEnabled=false;
 if(!front&&dir===0){c.translate(Math.round(x),0);c.scale(-1,1);c.translate(-Math.round(x),0)}
 c.drawImage(img,f%s.columns*s.frameWidth,(f/s.columns|0)*s.frameHeight,s.frameWidth,s.frameHeight,dx,dy,s.frameWidth*scale,s.displayHeight);c.restore();return true;
}
root.NPCAtlas={manifest,valid,choose,draw};
})(typeof window!=='undefined'?window:globalThis);
