/* A67: ordered, extensible stationery stock and faithful package art. */
(function(root){
'use strict';
const catalog=[
{id:'zzon',name:'추억의 쫀쫀이',price:100,kind:'zzon',detail:'방과 후 문구점 맥반석 위에서 노릇노릇 구워질 때 가장 달콤하고 쫄깃한 우리들의 단골 간식.',line:'달콤하고 쫄깃한 쫀쫀이를 먹었다.'},
{id:'cola',name:'콜라맛 제리',price:100,kind:'cola',detail:'단돈 100원으로 즐기는 짜릿한 탄산의 맛, 한 입 물면 입안 가득 달콤하고 끈적한 콜라 향이 퍼집니다.',line:'입안에 달콤한 콜라 향이 남았다.'},
{id:'chikani',name:'치카니',price:100,kind:'chikani',detail:'손가락에 짭조름한 주황색 시즈닝을 잔뜩 묻혀가며 바삭하게 베어 물던 중독성 강한 치킨 맛 과자.',line:'손가락에 주황색 시즈닝이 묻었다.'},
{id:'pill',name:'알약캔디',price:100,kind:'pill',detail:'알약처럼 톡톡 까먹는 재미가 있는 간식으로, 입안에 넣자마자 새콤달콤한 비타민 향이 부드럽게 녹아내립니다.은근슬쩍 진짜 약을 먹는 척 친구에게 장난치기 딱 좋습니다.',line:'톡 까먹은 캔디가 새콤달콤하게 녹았다.'},
{id:'straw',name:'아폴루',price:100,kind:'straw',detail:'빨대 속에 든 새콤달콤한 과육을 앞니로 쏙쏙 빼먹는 재미가 있지만, 가끔 내용물이 깔끔하게 나오지 않아 애를 먹기도 하는 단골 간식.',line:'빨대 속 달콤한 내용물을 쏙 빼먹었다.'},
{id:'fish',name:'월드컵 어포',price:100,kind:'fish',detail:'문구점 앞 와플기나 토스터기에 노릇노릇 구워질 때 풍기는 냄새가 일품이며, 바삭하게 찢어 먹을 때 가장 고소한 쥐포 간식.',line:'고소한 어포를 바삭하게 찢어 먹었다.'}
];
const images={},pending=[];let resolveReady;const readyPromise=new Promise(r=>resolveReady=r);let count=0;
function has(kind){return catalog.some(i=>i.kind===kind)}
function paint(canvas,kind){const im=images[kind];if(!im?.complete||!im.width)return false;canvas.width=im.width;canvas.height=im.height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(im,0,0);return true}
function icon(kind){const c=root.document.createElement('canvas');c.width=384;c.height=384;c.className='item-pixel stationery-product';c.dataset.product=kind;c.setAttribute('role','img');c.setAttribute('aria-label',catalog.find(i=>i.kind===kind)?.name||kind);if(!paint(c,kind))pending.push({c,kind});return c}
root.StationeryProducts={catalog,has,icon,readyPromise,get ready(){return count===catalog.length}};
for(const item of catalog){const im=new root.Image();images[item.kind]=im;im.onload=()=>{count++;for(let i=pending.length-1;i>=0;i--)if(pending[i].kind===item.kind){paint(pending[i].c,item.kind);pending.splice(i,1)}if(count===catalog.length)resolveReady()};im.src='assets/stationery/'+item.kind+'.webp'}
})(window);
