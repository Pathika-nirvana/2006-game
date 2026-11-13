const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const window={Image:class{}};
for(const f of ['alley-dungeon','narrow-alley-map','back-alley-map']){
 vm.runInNewContext(fs.readFileSync('src/'+f+'.js','utf8'),{window});
}
const map=window.AlleyDungeon;
const scene=id=>'alley_'+id;
const p={onGround:true,pose:'stand',walking:0};
function enter(id,x,y){Object.assign(p,{scene:id,x,walking:0});map.enter(p,y);assert(map.walkable(id,p.x,p.y))}
const back=window.BackAlleyMap.hotspots().find(g=>g.to==='hidden_alley');
assert(back);
const entry=window.NarrowAlleyMap.hotspots().find(g=>g.to==='alley_d1');
assert(window.NarrowAlleyMap.walkable(entry.x,entry.y));
enter(entry.to,entry.spawn,entry.spawnY);
const y=p.y;
map.walk(p,0,-1,.033);assert(p.y<y);assert(map.scale(p.y)<map.scale(y));
map.walk(p,0,1,.033);assert(p.y>=y-.001);
assert.equal(map.scale(206),1.14);assert.equal(map.scale(263),1.368);
const returnGate=map.nearest(p);
assert.equal(returnGate.to,'hidden_alley');
assert(window.NarrowAlleyMap.walkable(returnGate.spawn,returnGate.spawnY));
for(const [a,b] of [['d1','d2'],['d2','d3'],['d6','d7'],['d7','d8']]){
 for(const [from,to,dir] of [[a,b,1],[b,a,-1]]){
  const {left,right,bottom}=map.limits(scene(from));
  enter(scene(from),dir===1?right-1:left+1,bottom-1);
  const next=map.walk(p,dir,0,.033);assert.equal(next.to,scene(to));
  enter(next.to,next.spawn,next.spawnY);
 }
}
for(const [a,u,y,b] of [['d1',516,207,'d1_1'],['d3',229,211,'d3_1'],['d3',887,147,'d4'],
 ['d3_1',960,249,'d3_2'],['d4',861,259,'d5'],['d5',921,256,'d6'],
 ['d8',724,249,'d10'],['d10',799,235,'d11'],['d11',784,232,'d11_1'],['d11',296,229,'d12'],['d12',292,227,'d12_1']]){
 const x=map.width(scene(a))*u/1000;
 assert(map.walkable(scene(a),x,y),a+' gate');
 enter(scene(a),x,y);
 const gate=map.nearest(p);assert.equal(gate.to,scene(b));
 enter(gate.to,gate.spawn,gate.spawnY);assert.equal(map.nearest(p).to,scene(a));
}
for(const f of fs.readdirSync('assets/maps/alley-dungeon')){
 const id=scene(f.split('.')[0]),{left,right,bottom}=map.limits(id);
 for(let x=left;x<=right;x+=5){
  assert(!map.walkable(id,x,130));
  assert(map.walkable(id,x,bottom));
  enter(id,x,200);
  for(const [h,v] of [[1,-1],[-1,-1],[1,1],[-1,0]]){
   for(let i=0;i<6;i++){
    map.walk(p,h,v,.033);assert(map.walkable(id,p.x,p.alleyDepth),f);
   }
  }
 }
}
assert(!map.walkable('alley_d1_1',45,251),'left wall at the old spawn');
assert(!map.walkable('alley_d2',170,250),'crates against the new D2 wall');
assert(!map.walkable('alley_d12',400,253),'ledge below the upper corridor');
// Follow the same ground movement as the game before checking E.
const at=(id,u)=>map.width(scene(id))*u/1000;
function climb(id,u,from,to){
 enter(scene(id),at(id,u),from);
 for(let i=0;i<200&&p.alleyDepth>to+.1;i++)map.walk(p,0,-1,.016);
 assert(p.alleyDepth<=to+.1,id+' approach');
}
enter(scene('d1'),at('d1',516),207);
const yard=map.nearest(p);
assert.equal(yard.spawn,at('d1_1',185));assert.equal(yard.spawnY,248);
climb('d1_1',159,248,165);
assert(!map.nearest(p),'the closed door at the end is not the return gate');
enter(scene('d3'),at('d3',887),217);
assert(!map.nearest(p),'E should stay hidden at the bottom of the staircase');
climb('d3',887,251,141);
const wet=map.nearest(p);
assert.equal(wet.to,scene('d4'));assert.equal(wet.spawn,at('d4',306));assert.equal(wet.spawnY,247);
enter(wet.to,wet.spawn,wet.spawnY);assert.equal(map.nearest(p).to,scene('d3'));
assert.equal(map.scale(263,scene('d3')),1.368);
assert(map.scale(147,scene('d3'))<map.scale(175,scene('d3')));
assert(map.scale(175,scene('d3'))<map.scale(206,scene('d3')));
// Arrive at D8's left seam, then walk along the foreground until E is in range.
enter(scene('d7'),map.limits(scene('d7')).right-1,260);
const approach=map.walk(p,1,0,.033);
enter(approach.to,approach.spawn,approach.spawnY);
map.walk(p,0,1,.3);
for(let i=0;i<450&&!map.nearest(p);i++)map.walk(p,1,0,.033);
const onward=map.nearest(p);assert.equal(onward.to,scene('d10'));
assert(p.alleyDepth>=249,'E is usable from the foreground path');
enter(onward.to,onward.spawn,onward.spawnY);assert.equal(map.nearest(p).to,scene('d8'));
enter(scene('d8'),at('d8',724),100);
const blocked={x:p.x,y:p.y};
for(let i=0;i<20;i++)map.walk(p,0,-1,.016);
assert.equal(p.x,blocked.x);assert.equal(p.y,blocked.y);assert(p.walking>0);
map.walk(p,0,0,.016);assert.equal(p.walking,0);
map.jump(p);assert(!p.onGround);for(let i=0;i<45;i++)map.walk(p,0,0,.016);assert(p.onGround);
assert.equal(map.signal('alley_d3_2'),'normal');assert.equal(map.signal('alley_d4'),'none');assert.equal(map.signal('alley_d10'),'dead');
const phone=require('../server_phone.js'),a={id:'a',state:{scene:'street'}},b={id:'b',state:{scene:'alley_d4'}};
assert.equal(phone.relay(a,{op:'ring',to:'b'},[a,b],100000)[0][1].op,'error');
assert.equal(phone.relay(b,{op:'sms',to:'a',text:'hi'},[a,b],100000)[0][1].op,'error');
b.state.scene='street';assert.equal(phone.relay(a,{op:'ring',to:'b'},[a,b],100000)[0][1].op,'ring');
console.log('PASS restored entrance, 16 walk boundaries, seams, branches, scale and phone relay');
