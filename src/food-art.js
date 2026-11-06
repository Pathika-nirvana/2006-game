/* A39 food asset adapter: one master for menu, bag, counter and held props. */
(function(root){
'use strict';
const kinds=['tteok','hotdog','skewer','slushred','slushblue','odeng','fry','sundae','gimmari','broth','tteokbite','morsel'];
const entries=Object.fromEntries(kinds.map((k,i)=>[k,{index:i}]));
const atlas=new root.Image(),pending=[];let loaded=false;
function has(kind){return kind in entries}
function bounds(kind){return root.FOOD_MANIFEST?.[kind]||null}
function paint(c,kind){const s=bounds(kind);if(!loaded||!s)return false;const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;g.drawImage(atlas,s.x,s.y,s.w,s.h,0,0,c.width,c.height);return true}
function icon(kind){const c=root.document.createElement('canvas');c.width=80;c.height=80;c.className='item-pixel';c.dataset.food=kind;if(!paint(c,kind))pending.push({c,kind});return c}
function draw(c,kind,x,y,w,h){const s=bounds(kind);if(!loaded||!s)return false;const b=s.bounds,scale=Math.min(w/b[2],h/b[3]),dw=b[2]*scale,dh=b[3]*scale;c.drawImage(atlas,s.x+b[0],s.y+b[1],b[2],b[3],Math.round(x+(w-dw)/2),Math.round(y+(h-dh)/2),dw,dh);return true}
function grip(c,kind,x,y,height,angle=0){const s=bounds(kind);if(!loaded||!s)return false;const b=s.bounds,scale=height/b[3],w=b[2]*scale,g=s.grip||[.5,.75];c.save();c.translate(x,y);if(angle)c.rotate(angle);c.drawImage(atlas,s.x+b[0],s.y+b[1],b[2],b[3],-w*g[0],-height*g[1],w,height);c.restore();return true}
function counter(c){if(!loaded)return;const x=root.A13LAYOUT?.x?.('snack');if(!Number.isFinite(x))return;draw(c,'fry',x+17,169,21,12);draw(c,'gimmari',x+46,170,18,11);draw(c,'sundae',x+74,169,20,12)}
root.FoodArt={has,icon,draw,grip,counter,get ready(){return loaded},get kinds(){return kinds.slice()}};
atlas.onload=()=>{loaded=true;for(const {c,kind} of pending)paint(c,kind);pending.length=0};
atlas.src='assets/food/snackbar-atlas.png';
})(typeof window!=='undefined'?window:globalThis);
