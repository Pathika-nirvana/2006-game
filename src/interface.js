/* A77: small native menus; all existing tools keep their own actions. */
(function(w){'use strict';
const doc=w.document,menus=['gameMenu','soundSettings','onlineOptions'].map(id=>doc.getElementById(id)).filter(Boolean);
function clear(){w.__GAME_DEBUG__?.clearInput()}
function closeMenus(){for(const m of menus)m.open=false}
for(const m of menus)m.addEventListener('toggle',()=>{if(m.open){clear();for(const other of menus)if(other!==m)other.open=false}});
doc.addEventListener('pointerdown',e=>{for(const m of menus)if(m.open&&!m.contains?.(e.target))m.open=false});
doc.addEventListener('focusin',e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON','SUMMARY'].includes(e.target?.tagName)||e.target?.isContentEditable)clear()});
const menu=doc.getElementById('gameMenu');menu?.addEventListener('click',e=>{if(e.target?.closest?.('button'))menu.open=false});
w.GameInterface={closeMenus,get isMenuOpen(){return menus.some(m=>m.open)}};
})(window);
