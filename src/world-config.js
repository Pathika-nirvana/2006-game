(()=>{'use strict';const cfg=window.WorldConfig;if(!cfg||cfg.version!==1)return;
const merge=(target,source)=>{for(const k of Object.keys(target)){if(!Object.hasOwn(source||{},k))continue;const v=source[k];if(typeof target[k]==='object')merge(target[k],v);else if(typeof v==='number'&&Number.isFinite(v)&&v>=0)target[k]=v;}};merge(window.CombatSettings,cfg.settings);
/* Keep foot anchors while scaling authored player frames (all clothing). */
const original=window.WORLD?.drawKid;if(original)window.WORLD.drawKid=function(c,x,y,...args){const s=args[3]?1:(window.CombatSettings.player.size||1);c.save();c.translate(x,y);c.scale(s,s);original.call(this,c,0,0,...args);c.restore();};
})();

(()=>{const orig=window.CHARART?.drawRemote;if(orig)window.CHARART.drawRemote=function(c,id,x,y,...args){const z=id.startsWith('npc_')?1:window.CombatSettings.player.size||1;c.save();c.translate(x,y);c.scale(z,z);const ok=orig.call(this,c,id,0,0,...args);c.restore();return ok;};})();
