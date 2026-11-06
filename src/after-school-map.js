/* A45: authored map art, independent PNG sections and world anchors. No UI or physics changes. */
(function(root){
'use strict';
const m=root.AFTER_SCHOOL_MAP,images=new Map();let loaded=0;
const readyPromise=Promise.all(m.sections.map(s=>new Promise(resolve=>{const img=new root.Image();images.set(s.id,img);img.onload=()=>{loaded++;resolve(true)};img.onerror=()=>resolve(false);img.src=s.file})));
function draw(c,t){
 if(loaded!==m.sections.length)return false;
 c.save();c.imageSmoothingEnabled=false;
 // All art sections share one original pixel grid.
 // A46: no synthetic asphalt extension; the street camera crops below the original curb.
 for(const s of m.sections)c.drawImage(images.get(s.id),m.x+s.sourceX*m.scale,m.y,s.width*m.scale,s.height*m.scale);
 // Small steam animation over the authored tray, before people render.
 c.fillStyle='#f1e9da70';for(let i=0;i<3;i++){const rise=(t*7+i*6)%18;c.fillRect(1280+Math.sin(t+i)*2,165-rise,1,3)}
 c.restore();return true;
}
root.AfterSchoolMap={manifest:m,draw,readyPromise,get ready(){return loaded===m.sections.length}};
})(window);
