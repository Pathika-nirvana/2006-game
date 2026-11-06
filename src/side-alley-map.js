(function(w){'use strict';const ids=['west','east','join'],imgs={};let ready=false;const readyPromise=Promise.all(ids.map(id=>new Promise(resolve=>{const im=new w.Image();imgs[id]=im;im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src='assets/maps/side-alley/'+id+'.webp'}))).then(r=>ready=r.every(Boolean));
function draw(c,cam){if(!ready)return false;c.save();c.imageSmoothingEnabled=false;c.drawImage(imgs.west,-Math.round(cam),-63,1774/3,887/3);c.drawImage(imgs.east,458-Math.round(cam),-63,2174/3,887/3);c.drawImage(imgs.join,1000/3-Math.round(cam),-63,400,887/3);c.restore();return true}
w.SideAlleyMap={readyPromise,draw,get ready(){return ready}};
})(window);
