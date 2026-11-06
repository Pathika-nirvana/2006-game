/* A40 semantic eating clock. All food/body/mouth pixels live in authored PNG frames. */
(function(root){
'use strict';const duration=1250;
const profiles=Object.freeze({tteok:{label:'컵떡볶이'},hotdog:{label:'핫도그'},skewer:{label:'떡꼬치'},slush:{label:'슬러시'},generic:{label:'공통 한 입'}});
function classify(k){return k==='tteok'?'tteok':k==='hotdog'?'hotdog':k==='skewer'?'skewer':k==='slushred'||k==='slushblue'?'slush':'generic'}
function sample(kind,elapsed){return {kind,profile:classify(kind),elapsed:Math.max(0,elapsed),frame:root.CarryEatAtlas?.frame(kind,'eat',elapsed)??0}}
let active=null;function start(kind,now=performance.now()){active={kind,at:now};return sample(kind,0)}function current(now=performance.now()){return active?sample(active.kind,now-active.at):null}
root.EatingMotion={duration,profiles,classify,sample,start,current,get ready(){return !!root.CarryEatAtlas?.ready(root.CHARART?.selected||'boy_main_blue')}};
})(typeof window!=='undefined'?window:globalThis);
