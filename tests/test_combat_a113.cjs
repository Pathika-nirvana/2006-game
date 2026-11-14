const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const {createCanvas,Image}=require('@napi-rs/canvas');const base=path.resolve(__dirname,'..');let now=0;const pending=[];
class Img extends Image{set src(s){super.src=fs.readFileSync(path.join(base,s.split('?')[0]));}get src(){return super.src}}
const events=[];const c={window:null,Image:Img,performance:{now:()=>now},console,Math,addEventListener(){},CombatFeedback:{reset(){},battle(s){events.push(['music',s])},move(){},impact(...x){events.push(x)},swing(){}},CHARART:{selected:'girl_main_dobok'}};c.window=c;vm.createContext(c);
for(const f of ['combat-settings','combat-frames','enemy-frames','back-alley-map','taekwondo-motion','alley-encounter'])vm.runInContext(fs.readFileSync(base+'/src/'+f+'.js','utf8'),c);
fs.mkdirSync('evidence',{recursive:true});
(async()=>{await new Promise(r=>setTimeout(r,200));assert.equal(c.AlleyEncounter.targets.length,6,'six ready sprites');
const p={scene:'back_alley',x:450,y:257,alleyFloorY:257,onGround:true,pose:'stand',dir:1,walking:0};let choose;const ui={ask(d,fn){choose=fn},pay(){return true},notice(){}};
function tick(n=1){for(let i=0;i<n;i++){now+=16;c.TaekwondoMotion.update(p,true,now);c.AlleyEncounter.update(.016,p,ui);}}
tick(70);assert.equal(c.AlleyEncounter.status.phase,'choice');assert(choose('refuse'));assert.equal(c.AlleyEncounter.status.phase,'fight');
function key(code,up=false){let e={code,repeat:false,preventDefault(){}};if(up)c.TaekwondoMotion.keyUp(e);else c.TaekwondoMotion.keyDown(e,p,true);}
// Frozen-pose regression independent of enemy interruptions.
c.AlleyEncounter.reset();key('KeyS');for(let i=0;i<50;i++){now+=16;c.TaekwondoMotion.update(p,true,now)}assert.equal(c.TaekwondoMotion.motion,'punch1');assert.equal(c.TaekwondoMotion.impact,null);key('KeyS',true);assert.equal(c.TaekwondoMotion.motion,null);
key('KeyS');now+=70;c.TaekwondoMotion.update(p,true,now);key('KeyS',true);key('KeyS');key('KeyS',true);now+=225;c.TaekwondoMotion.update(p,true,now);assert.equal(c.TaekwondoMotion.motion,'punch2','cancel after contact chains punch2');
c.TaekwondoMotion.reset();tick(80);choose('refuse');
// Strike each opponent once, sustained contact cannot multiply damage.
for(const a of c.AlleyEncounter.debug.npcs){a.cooldown=100;a.guardCooldown=100;}const n=c.AlleyEncounter.debug.npcs[4];const before=n.health;p.x=n.x-15;p.alleyFloorY=n.y;p.y=n.y;p.dir=1;key('KeyS');tick(14);const hp=n.health;assert(hp<before,'strike damaged enemy');tick(1);assert.equal(n.health,hp,'same impact cannot hit twice');
for(let i=0;i<200;i++)tick();assert(c.AlleyEncounter.status.playerHealth>=0);for(const n of c.AlleyEncounter.targets){const b=c.BackAlleyMap.bounds(n.x);assert(n.y>=b.top&&n.y<=b.bottom);assert(n.x>=24&&n.x<=696);}
// Real atlas render on actual map; inspect idle and all requested poses.
const canvas=createCanvas(1440,540),ctx=canvas.getContext('2d');ctx.scale(2,2);c.AlleyEncounter.reset();c.BackAlleyMap.draw(ctx,240);ctx.translate(-240,0);c.AlleyEncounter.draw(ctx);fs.writeFileSync('evidence/a113-roster.png',canvas.toBuffer('image/png'));
for(const [motion,num] of [['walk',4],['punch',3],['kick',3],['weak',1],['strong',1],['low',1],['mid',1],['down',3]]){
 for(const n of c.AlleyEncounter.debug.npcs)n.motion=motion;
 for(let frame=0;frame<num;frame++){for(const n of c.AlleyEncounter.debug.npcs)n.age=frame*.18;ctx.setTransform(2,0,0,2,0,0);c.BackAlleyMap.draw(ctx,240);ctx.translate(-240,0);c.AlleyEncounter.draw(ctx);fs.writeFileSync('evidence/a113-'+motion+'-'+frame+'.png',canvas.toBuffer('image/png'));}
}
// Dead bodies: nearby + grounded + settled, award exactly once.
const corpse=c.AlleyEncounter.debug.npcs[1];corpse.health=0;corpse.motion='down';corpse.age=1;p.x=corpse.x;p.alleyFloorY=corpse.y;p.onGround=true;let awards=0;
c.SHOPS={grantLoot(){awards++;return true}};
assert(c.AlleyEncounter.loot(p,ui));assert(!c.AlleyEncounter.loot(p,ui));assert.equal(awards,1);
// Simulate actual tactical behavior against a stationary player.
c.AlleyEncounter.reset();p.x=450;p.alleyFloorY=257;c.TaekwondoMotion.reset();tick(80);choose('refuse');
let moved=false,attacked=false,max=0;for(let i=0;i<600;i++){tick();const ns=c.AlleyEncounter.debug.npcs;max=Math.max(max,ns.filter(n=>['punch','kick'].includes(n.motion)).length);if(ns.some(n=>n.motion==='walk'))moved=true;if(c.AlleyEncounter.status.playerHealth<100)attacked=true;}
assert(moved&&attacked,'AI closes range and attacks');assert(max<=2,'at most two simultaneous attackers');
console.log('PASS A113 loot + tactical AI + concurrency; ');
console.log('PASS: 6 assets, approach/choice/fight, held-last-frame/release, buffered cancel, hit dedup, health/bounds, all motion render paths.');})();
