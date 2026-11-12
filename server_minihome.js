/* A97 (2026-11-12 KST) 미니홈피 실시간 연동. server.js가 불러 쓴다.
   같은 방(함께 걷기)에 들어온 친구들의 미니홈피를 방마다 서버 메모리에 둔다. 방이 비면 6시간 뒤에 server.js가 지운다(우리동네 아지트와 같다).
   주인 확인: 브라우저가 처음 한 번 만든 비밀 열쇠(uid)를 sha1로 바꾼 홈 번호(hid)만 남에게 보인다. 열쇠를 보낸 접속만 그 홈의 주인이 된다.
   크기: 웹소켓 한 번에 8KB를 넘지 않도록 글 길이와 목록 수를 자르고, 사진은 작게 줄인 그림 한 장이 5600자를 넘지 않게 받는다(한 사람당 세 장).
   글자는 화면에서 글자 그대로만 보이고(태그로 읽히지 않음), 서버도 꺾쇠와 제어 문자를 지운다. */
'use strict';
const crypto=require('node:crypto');
const LIM={homes:16,guest:40,says:16,ilchon:24,asks:12,visitors:200,diary:3,photos:3,photo:5600,page:8,budget:7600};
const GAP={read:60,visit:250,pub:450,write:700};
const KIND={pub:'pub',photo:'pub',list:'read',get:'read',gb:'read',ph:'read',visit:'visit',gbw:'write',gbr:'write',gbd:'write',say:'write',ask:'write',ans:'write',cut:'write'};
const MOODS=new Set(['행복','기쁨','설렘','신남','두근두근','뿌듯','피곤','졸림','배고픔','우울','바쁨','심심']);
const WALLS=new Set(['sky','pink','check','night','paper']),FLOORS=new Set(['wood','tile','mat']),SKINS=new Set(['sky','pink','star','green','paper']);
const ITEMS=new Set(['bed','desk','sofa','shelf','tv','plant','teddy','guitar','fish','piano','scope','ball','basket','fridge','window','poster','clock','frame','flag','dday']);
const SLOTS=new Set(['W0','W1','W2','F0','F1','F2','F3','F4']);
const WEATHER=new Set(['맑음','흐림','비','바람']);
const PHOTO_RE=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

const bytes=o=>Buffer.byteLength(JSON.stringify(o));
function line(s,max){return String(s==null?'':s).normalize('NFC').replace(/[\x00-\x1f\x7f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
function para(s,max){const t=String(s==null?'':s).normalize('NFC').replace(/\r\n?/g,'\n').replace(/[\x00-\x09\x0b-\x1f\x7f<>]/g,'');return t.split('\n').map(x=>x.replace(/[ \t]+$/,'')).slice(0,8).join('\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,max)}
const int=(v,a,b)=>{const n=Math.floor(Number(v));return Number.isFinite(n)?Math.max(a,Math.min(b,n)):a};
const nameOf=s=>line(s,14)||'이름 없는 친구';
function hidOf(uid){const u=String(uid||'');if(!/^[a-z0-9]{16,32}$/.test(u))return '';return crypto.createHash('sha1').update('mini|'+u).digest('hex').slice(0,12)}
const okHid=h=>typeof h==='string'&&/^[0-9a-f]{12}$/.test(h);

function createRoom(now){return {homes:new Map(),expires:0,touched:now}}
function newHome(hid,now){return {hid,name:'',look:'',prof:cleanProf({}),diary:[],photos:[null,null,null],guest:[],says:{},ilchon:{},asks:{},visitors:new Set(),today:0,v:1,seq:0,touched:now}}
function cleanProf(p){p=p&&typeof p==='object'&&!Array.isArray(p)?p:{};const sl=p.slots&&typeof p.slots==='object'&&!Array.isArray(p.slots)?p.slots:{},slots={};
 for(const k of Object.keys(sl).slice(0,12))if(SLOTS.has(k)&&ITEMS.has(String(sl[k])))slots[k]=String(sl[k]);
 return {title:line(p.title,30),intro:para(p.intro,120),mood:MOODS.has(p.mood)?p.mood:'행복',bgm:line(p.bgm,40),skin:SKINS.has(p.skin)?p.skin:'sky',wall:WALLS.has(p.wall)?p.wall:'sky',floor:FLOORS.has(p.floor)?p.floor:'wood',slots,base:int(p.base,0,99999),today0:int(p.today0,0,9999)}}
function cleanDiary(list){return (Array.isArray(list)?list:[]).slice(-LIM.diary).map(x=>x&&typeof x==='object'?{d:line(x.d,20)||'2006.05.30 (화)',w:WEATHER.has(x.w)?x.w:'맑음',t:para(x.t,300)}:null).filter(x=>x&&x.t)}
/* 목록에서 지울 때: 주인이 방에 없는 홈 가운데 가장 오래 손대지 않은 것 */
function evict(room,online){let old=null;for(const h of room.homes.values())if(!online.has(h.hid)&&(!old||h.touched<old.touched))old=h;if(!old)return false;room.homes.delete(old.hid);for(const h of room.homes.values()){delete h.ilchon[old.hid];delete h.says[old.hid];delete h.asks[old.hid]}return true}
const err=(op,message)=>({reply:{op:'error',for:op,message}});
/* 글을 8KB 안에 담는다: 뒤쪽(오래된) 것부터 줄인다 */
function fit(o,keys){for(const k of keys){while(bytes(o)>LIM.budget&&Array.isArray(o[k])&&o[k].length)o[k].pop()}return o}
const partner=(room,hid)=>room.homes.get(hid);
function ilchonList(room,h,online){return Object.entries(h.ilchon).filter(([id])=>partner(room,id)).map(([id,nick])=>({hid:id,n:partner(room,id).name,nick,on:online.has(id)})).slice(0,LIM.ilchon)}
function saysList(room,h){return Object.entries(h.says).filter(([id])=>partner(room,id)&&h.ilchon[id]).map(([id,x])=>({hid:id,n:partner(room,id).name,nick:h.ilchon[id],t:x.t,at:x.at})).sort((a,b)=>b.at-a.at)}
const counts=h=>({today:h.prof.today0+h.today,total:h.prof.base+h.today});
function meMsg(room,h,online,note){const o={op:'me',hid:h.hid,n:h.name,...counts(h),real:h.today,v:h.v,gbn:h.guest.length,ph:h.photos.map(p=>p?p.sig:''),asks:Object.entries(h.asks).filter(([id])=>partner(room,id)).map(([id,a])=>({hid:id,n:partner(room,id).name,nick:a.nick,at:a.at})),ilchon:ilchonList(room,h,online),says:saysList(room,h)};if(note)o.note=note;return fit(o,['says','asks','ilchon'])}
function rowOf(h,online){const on=online.get(h.hid);return {hid:h.hid,n:h.name,title:h.prof.title,mood:h.prof.mood,...counts(h),on:!!on,pc:!!(on&&on.pc),id:on?on.id:'',v:h.v,np:h.photos.filter(Boolean).length,look:(on&&on.look)||h.look}}
function listMsg(room,online){const rows=[...room.homes.values()].map(h=>rowOf(h,online)).sort((a,b)=>(b.on-a.on)||a.n.localeCompare(b.n,'ko'));return fit({op:'list',list:rows},['list'])}
function homeMsg(room,h,actor,online){const mine=actor.hid?room.homes.get(actor.hid):null,on=online.get(h.hid);
 const o={op:'home',hid:h.hid,n:h.name,look:(on&&on.look)||h.look,on:!!on,pc:!!(on&&on.pc),id:on?on.id:'',prof:h.prof,...counts(h),v:h.v,gbn:h.guest.length,
  photos:h.photos.map((p,i)=>p?{i,cap:p.cap,sig:p.sig}:null),ilchon:ilchonList(room,h,online),says:saysList(room,h),diary:h.diary.slice().reverse(),
  rel:{nick:actor.hid?h.ilchon[actor.hid]||'':'',asked:!!(actor.hid&&h.asks[actor.hid]),askedMe:!!(mine&&mine.asks[h.hid]),me:actor.hid===h.hid}};
 return fit(o,['says','diary','ilchon'])}
function gbMsg(h,actor,page){const total=h.guest.length,pages=Math.max(1,Math.ceil(total/LIM.page)),p=int(page,1,pages),list=h.guest.slice().reverse().slice((p-1)*LIM.page,p*LIM.page).map(e=>({id:e.id,n:e.n,from:e.from,t:e.t,at:e.at,r:e.r,rat:e.rat,mine:!!(actor.hid&&e.from===actor.hid)}));return fit({op:'gb',hid:h.hid,page:p,pages,total,v:h.v,own:actor.hid===h.hid,list},['list'])}
const touch=(h,now)=>{h.v++;h.touched=now};

/* actor: {id, name, look, hid(이 접속이 주인인 홈, 없으면 '')} · online: Map(hid -> {pc, id, look}) 주인이 지금 방에 있는 홈 */
function apply(room,actor,obj,now,online){
 const op=String(obj&&obj.op||'').slice(0,10);online=online||new Map();room.touched=now;
 const target=()=>{const hid=String(obj.hid||'');return okHid(hid)?room.homes.get(hid):null};
 const mineHome=()=>actor.hid?room.homes.get(actor.hid):null;
 switch(op){
 case 'pub':{const hid=hidOf(obj.uid);if(!hid)return err(op,'미니홈피 열쇠가 이상해요. 새로 고침해 주세요.');
  let h=room.homes.get(hid);
  if(!h){if(room.homes.size>=LIM.homes&&!evict(room,online))return err(op,'이 방의 미니홈피가 꽉 찼어요.');h=newHome(hid,now);room.homes.set(hid,h)}
  h.name=nameOf(actor.name);h.look=String(actor.look||'');h.prof=cleanProf(obj.prof);h.diary=cleanDiary(obj.diary);touch(h,now);
  return {bind:hid,reply:meMsg(room,h,online),list:true}}
 case 'photo':{const h=mineHome();if(!h)return err(op,'먼저 내 미니홈피를 열어 주세요.');const i=int(obj.i,0,LIM.photos-1),data=String(obj.data||'');
  if(!data)h.photos[i]=null;
  else{if(data.length>LIM.photo||!PHOTO_RE.test(data))return err(op,'사진이 너무 커서 올리지 못했어요.');h.photos[i]={cap:line(obj.cap,40),sig:line(obj.sig,40),data,at:now}}
  touch(h,now);return {reply:{op:'photook',i,sig:h.photos[i]?h.photos[i].sig:''},list:true}}
 case 'list':return {reply:listMsg(room,online)};
 case 'get':{const h=target();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};return {reply:homeMsg(room,h,actor,online)}}
 case 'gb':{const h=target();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};return {reply:gbMsg(h,actor,obj.page)}}
 case 'ph':{const h=target();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};const i=int(obj.i,0,LIM.photos-1),p=h.photos[i];return {reply:{op:'ph',hid:h.hid,i,data:p?p.data:'',cap:p?p.cap:'',sig:p?p.sig:''}}}
 case 'visit':{const h=target();if(!h||h.hid===actor.hid)return {};const key=actor.hid||('s:'+actor.id);if(h.visitors.has(key))return {};
  if(h.visitors.size>=LIM.visitors)h.visitors.delete(h.visitors.values().next().value);h.visitors.add(key);h.today++;touch(h,now);
  return {push:[{hid:h.hid,msg:meMsg(room,h,online,{k:'visit',n:nameOf(actor.name),hid:actor.hid||''})}],list:true}}
 case 'gbw':{const h=target();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};const t=line(obj.t,100);if(!t)return {};
  const e={id:++h.seq,from:actor.hid||'',n:nameOf(actor.name),t,at:now,r:'',rat:0};h.guest.push(e);while(h.guest.length>LIM.guest)h.guest.shift();touch(h,now);
  const out={reply:gbMsg(h,actor,1),list:true};if(h.hid!==actor.hid)out.push=[{hid:h.hid,msg:meMsg(room,h,online,{k:'gb',n:e.n,t,hid:e.from})}];return out}
 case 'gbr':{const h=mineHome();if(!h)return err(op,'내 미니홈피에서만 답글을 달 수 있어요.');const e=h.guest.find(x=>x.id===int(obj.id,0,1e9));if(!e)return {reply:gbMsg(h,actor,obj.page)};
  e.r=line(obj.r,60);e.rat=e.r?now:0;touch(h,now);const out={reply:gbMsg(h,actor,obj.page),list:true};
  if(e.r&&e.from&&e.from!==h.hid)out.push=[{hid:e.from,msg:{op:'note',k:'gbrep',hid:h.hid,n:h.name,t:e.r}}];return out}
 case 'gbd':{const h=target();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};const id=int(obj.id,0,1e9),at=h.guest.findIndex(x=>x.id===id);
  if(at<0)return {reply:gbMsg(h,actor,obj.page)};const e=h.guest[at];if(!(actor.hid&&(actor.hid===h.hid||actor.hid===e.from)))return err(op,'내가 쓴 글이나 내 방명록 글만 지울 수 있어요.');
  h.guest.splice(at,1);touch(h,now);return {reply:gbMsg(h,actor,obj.page),list:true}}
 case 'say':{const h=target(),me=mineHome();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};if(!me||!h.ilchon[me.hid])return err(op,'일촌만 일촌평을 쓸 수 있어요.');
  const t=line(obj.t,40);if(t){h.says[me.hid]={t,at:now};const keys=Object.keys(h.says);if(keys.length>LIM.says){keys.sort((a,b)=>h.says[a].at-h.says[b].at);delete h.says[keys[0]]}}else delete h.says[me.hid];
  touch(h,now);const out={reply:homeMsg(room,h,actor,online),list:true};if(t)out.push=[{hid:h.hid,msg:meMsg(room,h,online,{k:'say',n:me.name,t,hid:me.hid})}];return out}
 case 'ask':{const h=target(),me=mineHome();if(!h)return {reply:{op:'gone',hid:line(obj.hid,12)}};if(!me)return err(op,'먼저 내 미니홈피를 열어 주세요.');if(h===me)return {};
  if(h.ilchon[me.hid])return err(op,'벌써 일촌이에요.');
  if(me.asks[h.hid]){/* 서로 신청했으면 바로 일촌 */const nick=line(obj.nick,8)||me.asks[h.hid].nick;delete me.asks[h.hid];me.ilchon[h.hid]=nick;h.ilchon[me.hid]=nick;touch(h,now);touch(me,now);
   return {reply:meMsg(room,me,online,{k:'ilchon',n:h.name,nick,hid:h.hid}),push:[{hid:h.hid,msg:meMsg(room,h,online,{k:'ilchon',n:me.name,nick,hid:me.hid})}],list:true}}
  const nick=line(obj.nick,8)||'친구';h.asks[me.hid]={nick,at:now};const keys=Object.keys(h.asks);if(keys.length>LIM.asks){keys.sort((a,b)=>h.asks[a].at-h.asks[b].at);delete h.asks[keys[0]]}
  touch(h,now);return {reply:{op:'askok',hid:h.hid,nick},push:[{hid:h.hid,msg:meMsg(room,h,online,{k:'ask',n:me.name,nick,hid:me.hid})}],list:true}}
 case 'ans':{const me=mineHome();if(!me)return err(op,'먼저 내 미니홈피를 열어 주세요.');const from=String(obj.from||''),a=okHid(from)?me.asks[from]:null;if(!a)return {reply:meMsg(room,me,online)};
  delete me.asks[from];const other=room.homes.get(from);touch(me,now);
  if(!obj.ok||!other)return {reply:meMsg(room,me,online),list:true};
  if(Object.keys(me.ilchon).length>=LIM.ilchon||Object.keys(other.ilchon).length>=LIM.ilchon)return err(op,'일촌이 너무 많아요.');
  const nick=line(obj.nick,8)||a.nick;me.ilchon[from]=nick;other.ilchon[me.hid]=nick;touch(other,now);
  return {reply:meMsg(room,me,online,{k:'ilchon',n:other.name,nick,hid:from}),push:[{hid:from,msg:meMsg(room,other,online,{k:'ilchon',n:me.name,nick,hid:me.hid})}],list:true}}
 case 'cut':{const me=mineHome(),h=target();if(!me||!h||!me.ilchon[h.hid])return {};delete me.ilchon[h.hid];delete h.ilchon[me.hid];delete me.says[h.hid];delete h.says[me.hid];touch(me,now);touch(h,now);
  return {reply:meMsg(room,me,online),push:[{hid:h.hid,msg:meMsg(room,h,online)}],list:true}}
 }
 return {};
}
const kindOf=op=>KIND[String(op||'')]||'';
module.exports={LIM,GAP,KIND,kindOf,hidOf,createRoom,apply,listMsg,meMsg,bytes,line,para,version:'A97'};
