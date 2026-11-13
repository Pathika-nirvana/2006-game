/* A99 (2026-11-13 KST), A100 고침: 컬러링(tone) 전달. 애니콜 휴대폰: 같은 방(함께 걷기) 친구끼리 문자, 포토 메일, 전화를 주고받는다. server.js 가 불러 쓴다.
   전화: ring(걸기) → tone(받는 사람의 컬러링 알려 주기) → answer(받기) / decline(거절, 부재중) / busy(통화 중) → talk(통화 중 말 한 줄) → hang(끊기).
   서버는 같은 방 친구에게 전달만 하고 아무것도 저장하지 않는다. 글자는 꺾쇠와 제어 문자를 지우고 길이를 자른다.
   너무 자주 보내면 '조금 천천히' 안내만 돌려준다. 사진은 작게 줄인 그림 한 장(6200자 이하)만 받는다. */
'use strict';
const OPS={sms:{gap:1200,text:90},photo:{gap:4000,text:40},ring:{gap:2500},answer:{gap:150},decline:{gap:150},busy:{gap:150},hang:{gap:150},talk:{gap:450,text:70},tone:{gap:150}};
const PHOTO_RE=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const PHOTO_MAX=6200;
function line(t,max){return String(t==null?'':t).normalize('NFC').replace(/[\x00-\x1f\x7f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max)}
/* s: 보낸 사람 접속, obj: 받은 메시지, members: 같은 방 접속들, now: 지금 시각.
   돌려주는 값: [받을 접속, 보낼 메시지] 목록 */
const unreachable=s=>/^alley_d(?:[4-8]|10|11(?:_1)?|12(?:_1)?)$/.test(s.state?.scene||'');
function relay(s,obj,members,now){
  const op=String(obj&&obj.op||'').slice(0,10),rule=OPS[op];if(!rule)return[];
  const key='phone_'+op;
  if(now-(s[key]||0)<rule.gap)return[[s,{type:'phone',op:'error',for:op,message:'조금 천천히 해 주세요.',t:now}]];
  const to=members.find(x=>x.id===String(obj.to||''));
  if(!to||to===s)return[[s,{type:'phone',op:'error',for:op,message:'그 친구가 지금 방에 없어요.',to:String(obj.to||'').slice(0,20),t:now}]];
  if(!['hang','decline'].includes(op)&&(unreachable(s)||unreachable(to)))return [[s,{type:'phone',op:'error',for:op,message:'통신 신호가 없습니다.',t:now}]];
  const out={type:'phone',op,from:s.id,name:s.name,at:now};
  if(rule.text){const text=line(obj.text,rule.text);if(!text&&op!=='photo')return[];out.text=text}
  if(op==='photo'){const p=String(obj.photo||'');if(p.length>PHOTO_MAX||!PHOTO_RE.test(p))return[[s,{type:'phone',op:'error',for:op,message:'사진이 너무 커요.',t:now}]];out.photo=p}
  if(['ring','answer','decline','busy','hang','talk','tone'].includes(op))out.call=line(obj.call,16);
  if(op==='tone')out.ring=line(obj.ring,12);
  s[key]=now;
  return[[to,out],[s,{type:'phone',op:'sent',for:op,to:to.id,call:out.call||'',at:now}]];
}
module.exports={OPS,PHOTO_MAX,relay,line};
