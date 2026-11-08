'use strict';
/* A88 우리동네 아지트 규칙 엔진 시험 */
const assert=require('node:assert/strict'),path=require('path');
const Core=require(path.join(__dirname,'../src/club-core.js'));
const Seed=require(path.join(__dirname,'../src/club-seed.js'));
const T0=Date.UTC(2026,10,8,3,0,0); /* 한국 시간 2026-11-08 12:00 */
const MIN=6e4;
const call=(c,name,msg,now)=>Core.apply(c,{name},msg,now===undefined?T0:now);

/* 1. 처음 모습 */
{
 const c=Core.create(Seed,T0);
 assert.equal(c.posts.length,Seed.posts.length);
 const h=call(c,'새친구',{op:'hello'});
 assert.ok(h.ok);assert.equal(h.reply.type,'club');assert.equal(h.reply.op,'hello');
 assert.equal(h.reply.me.name,'새친구');assert.equal(h.reply.me.label,'새싹');
 assert.equal(h.reply.counts.members,Seed.members.length+1);
 assert.ok(h.reply.notice&&/공지/.test(h.reply.notice.title));
 assert.equal(h.reply.recent.length,4);
 const l=call(c,'새친구',{op:'list',page:1});
 assert.equal(l.reply.rows.length,10);assert.equal(l.reply.pages,2);assert.equal(l.reply.total,12);
 assert.ok(l.reply.rows[0].notice&&l.reply.rows[1].notice,'공지가 맨 위');
 assert.ok(!l.reply.rows[2].notice);
 assert.ok(l.reply.rows[2].id>l.reply.rows[3].id,'최근 글이 위');
 assert.equal(call(c,'새친구',{op:'list',page:2}).reply.rows.length,2);
 assert.equal(call(c,'새친구',{op:'list',page:99}).reply.page,2,'쪽 번호는 끝으로 맞춘다');
 const g=call(c,'새친구',{op:'get',id:l.reply.rows[0].id});
 assert.equal(g.reply.op,'post');assert.ok(g.reply.post.comments.length>=1);assert.equal(g.reply.post.hits,l.reply.rows[0].hits+1);
 assert.equal(call(c,'새친구',{op:'get',id:9999}).reply.op,'error');
 assert.equal(call(c,'새친구',{op:'get',id:'abc'}).reply.op,'error');
 assert.equal(call(c,'새친구',{op:'scrawl_list'}).reply.rows.length,11);
 assert.equal(call(c,'새친구',{op:'chat_log'}).reply.rows.length,9);
 assert.equal(call(c,'새친구',{op:'chat_log'}).reply.rows[0].nick,'오락실지박령');
 assert.equal(call(c,'새친구',{op:'attend_list'}).reply.rows.length,0);
 /* 시삽은 운영진 */
 assert.equal(Core.levelOf(c,'시삽_동네지기'),Core.STAFF_LV);assert.equal(Core.labelOf(Core.STAFF_LV),'운영진');
}

/* 2. 글, 댓글, 추천, 삭제 */
{
 const c=Core.create(Seed,T0);
 let r=call(c,'민수',{op:'post',title:'  안녕<b>하세요</b>  ',body:'첫 글이에요\r\n방가방가 ㅎㅎ\u0007'});
 assert.ok(r.ok);assert.equal(r.reply.op,'post');assert.equal(r.reply.flash,'글이 등록되었습니다.');
 assert.equal(r.reply.post.title,'안녕 b 하세요 /b');assert.ok(!/[<>\u0007\r]/.test(r.reply.post.body));
 assert.equal(r.push[0].msg.op,'dirty');assert.equal(r.push[0].skipSelf,true);
 const id=r.reply.post.id;
 assert.equal(call(c,'민수',{op:'post',title:'  안녕<b>하세요</b>  ',body:'또'}).reply.op,'error','같은 제목을 연달아 올리면 도배');
 assert.match(call(c,'민수',{op:'post',title:'',body:'내용'}).reply.message,/제목/);
 assert.match(call(c,'민수',{op:'post',title:'제목',body:'  '}).reply.message,/내용/);
 /* 길이 제한 */
 const long=call(c,'민수',{op:'post',title:'ㅋ'.repeat(100),body:'가'.repeat(2000)+'\n'.repeat(5)+'끝'});
 assert.equal(long.reply.post.title.length,Core.LIM.title);assert.ok(long.reply.post.body.length<=Core.LIM.body);
 /* 댓글 */
 r=call(c,'수진',{op:'comment',id,text:'방가방가 ^^'},T0+MIN);
 assert.equal(r.reply.post.comments.length,1);assert.equal(r.reply.post.comments[0].nick,'수진');
 assert.equal(call(c,'수진',{op:'comment',id,text:'방가방가 ^^'},T0+MIN+1000).reply.op,'error','같은 댓글 도배');
 assert.equal(call(c,'수진',{op:'comment',id,text:'방가방가 ^^'},T0+2*MIN).reply.op,'post','30초가 지나면 다시 가능');
 assert.equal(call(c,'수진',{op:'comment',id,text:''}).reply.op,'error');
 assert.equal(call(c,'수진',{op:'comment',id:12345,text:'a'}).reply.op,'error');
 /* 댓글은 20개까지만 남는다 */
 for(let i=0;i<30;i++)call(c,'수진',{op:'comment',id,text:'리플 '+i},T0+(5+i)*MIN);
 assert.equal(call(c,'수진',{op:'get',id}).reply.post.comments.length,Core.LIM.comments);
 /* 추천 */
 assert.equal(call(c,'민수',{op:'rec',id}).reply.message,'내가 쓴 글은 추천할 수 없어요.');
 r=call(c,'수진',{op:'rec',id});assert.equal(r.reply.post.rec,1);assert.equal(r.reply.post.recd,true);
 assert.equal(call(c,'수진',{op:'rec',id}).reply.message,'이미 추천한 글입니다.');
 /* 삭제는 본인만 */
 assert.equal(call(c,'수진',{op:'del',id}).reply.op,'error');
 const noticeId=call(c,'민수',{op:'list'}).reply.rows[0].id;
 assert.equal(call(c,'민수',{op:'del',id:noticeId}).reply.op,'error','공지는 지울 수 없다');
 assert.equal(call(c,'민수',{op:'del',id}).reply.op,'deleted');
 assert.equal(call(c,'민수',{op:'get',id}).reply.op,'error');
 /* 오래된 글부터 사라진다 */
 const c2=Core.create(Seed,T0);
 for(let i=0;i<80;i++)call(c2,'글쟁이',{op:'post',title:'글 '+i,body:'내용'},T0+i*1000);
 assert.equal(c2.posts.length,Core.LIM.posts);
 assert.equal(c2.posts.filter(p=>p.notice).length,2,'공지는 남는다');
}

/* 3. 이름 사칭과 이상한 이름 */
{
 const c=Core.create(Seed,T0);
 for(const bad of['운영자','시삽_동네지기','부시삽_은지','Admin','시스템점검'])
  assert.equal(call(c,bad,{op:'post',title:'제목',body:'내용'}).reply.op,'error',bad);
 assert.equal(call(c,'운영자',{op:'list'}).reply.op,'list','읽기는 된다');
 for(const odd of['__proto__','constructor','toString','hasOwnProperty','~x']){
  assert.ok(call(c,odd,{op:'hello'}).ok);
  assert.equal(call(c,odd,{op:'post',title:'t'+odd,body:'b'}).reply.op,'post');
  assert.equal(call(c,odd,{op:'scrawl',text:'낙서'}).reply.op,'scrawl_list');
  assert.equal(call(c,odd,{op:'inbox'}).reply.op,'inbox');
  assert.equal(call(c,odd,{op:'note',to:'쪼꼬미',text:'hi'}).reply.op,'note_ok');
 }
 assert.equal(({}).posts,undefined);assert.equal(Object.prototype.last,undefined);assert.equal(Object.prototype.visits,undefined);
 assert.equal(call(c,'쪼꼬미',{op:'note',to:'constructor2',text:'a'}).reply.op,'error');
 assert.equal(call(c,'새친구',{op:'note',to:'__proto__x',text:'a'}).reply.op,'error');
 /* 빈 이름 */
 assert.equal(call(c,'',{op:'hello'}).reply.me.name,'이름 없는 친구');
}

/* 4. 한줄낙서 */
{
 const c=Core.create(Seed,T0);
 let r=call(c,'민수',{op:'scrawl',text:'  오늘 급식 맛있다 ㅋㅋ  '});
 assert.equal(r.reply.rows[0].text,'오늘 급식 맛있다 ㅋㅋ');assert.equal(r.reply.rows[0].nick,'민수');assert.equal(r.push[0].msg.what,'scrawl');
 assert.equal(call(c,'민수',{op:'scrawl',text:'오늘 급식 맛있다 ㅋㅋ'},T0+1000).reply.op,'error');
 assert.equal(call(c,'민수',{op:'scrawl',text:''}).reply.op,'error');
 assert.ok(call(c,'민수',{op:'scrawl',text:'ㅋ'.repeat(200)},T0+2000).reply.rows[0].text.length<=Core.LIM.scrawl);
 for(let i=0;i<80;i++)call(c,'낙서왕',{op:'scrawl',text:'낙서 '+i},T0+(10+i)*1000);
 assert.equal(c.scrawl.length,Core.LIM.scrawls);
 assert.equal(call(c,'낙서왕',{op:'scrawl_list'}).reply.rows.length,24);
}

/* 5. 출석부 */
{
 const c=Core.create(Seed,T0);
 let r=call(c,'민수',{op:'attend',text:'1등 ㅋㅋ'});
 assert.equal(r.reply.flash,'오늘의 출석 1등입니다!');assert.equal(r.reply.rows[0].n,1);assert.equal(r.reply.mine,true);
 r=call(c,'수진',{op:'attend'},T0+MIN);assert.equal(r.reply.rows.length,2);assert.equal(r.reply.rows[1].text,'출석합니다~');assert.notEqual(r.reply.flash,'오늘의 출석 1등입니다!');
 assert.equal(call(c,'수진',{op:'attend'},T0+2*MIN).reply.op,'error','하루 한 번');
 assert.equal(call(c,'민수',{op:'hello'},T0+3*MIN).reply.attended,true);
 /* 한국 시간으로 날짜가 바뀌면 다시 출석할 수 있다 */
 const next=Date.UTC(2026,10,8,15,5,0); /* 한국 시간 11-09 00:05 */
 assert.equal(call(c,'민수',{op:'attend_list'},next).reply.rows.length,0);
 assert.equal(call(c,'민수',{op:'hello'},next).reply.attended,false);
 assert.equal(call(c,'민수',{op:'attend'},next).reply.flash,'오늘의 출석 1등입니다!');
 assert.equal(Core.dayKey(Date.UTC(2026,10,8,14,59,59)),'2026-11-08');assert.equal(Core.dayKey(Date.UTC(2026,10,8,15,0,0)),'2026-11-09');
}

/* 6. 채팅 */
{
 const c=Core.create(Seed,T0);
 const r=call(c,'민수',{op:'chat',text:'  ㅎㅇㅎㅇ <script> '});
 assert.equal(r.reply,null);assert.equal(r.push.length,1);assert.equal(r.push[0].scope,'club');assert.equal(r.push[0].skipSelf,false);
 assert.equal(r.push[0].msg.op,'chat');assert.equal(r.push[0].msg.row.text,'ㅎㅇㅎㅇ script');assert.equal(r.push[0].msg.row.nick,'민수');
 assert.equal(call(c,'민수',{op:'chat',text:'   '}).ok,false);
 assert.equal(call(c,'시삽_동네지기',{op:'chat',text:'hi'}).reply.op,'error');
 for(let i=0;i<100;i++)call(c,'수다쟁이',{op:'chat',text:'줄 '+i});
 assert.equal(c.chat.length,Core.LIM.chats);
 const log=call(c,'민수',{op:'chat_log'}).reply.rows;assert.equal(log.length,20);assert.equal(log.at(-1).text,'줄 99');
}

/* 7. 쪽지 */
{
 const c=Core.create(Seed,T0);
 call(c,'민수',{op:'hello'});call(c,'수진',{op:'hello'});
 let r=call(c,'민수',{op:'note',to:'수진',text:'  오늘 같이 갈래? '});
 assert.equal(r.reply.op,'note_ok');assert.equal(r.push[0].scope,'to');assert.equal(r.push[0].to,'수진');assert.equal(r.push[0].msg.op,'note_new');
 assert.equal(call(c,'수진',{op:'hello'}).reply.unread,1);
 r=call(c,'수진',{op:'inbox'});assert.equal(r.reply.rows.length,1);assert.equal(r.reply.rows[0].from,'민수');assert.equal(r.reply.rows[0].text,'오늘 같이 갈래?');assert.equal(r.reply.rows[0].read,false);
 assert.equal(call(c,'수진',{op:'inbox'}).reply.rows[0].read,true,'한 번 읽으면 읽음');
 assert.equal(call(c,'수진',{op:'hello'}).reply.unread,0);
 assert.equal(call(c,'민수',{op:'note',to:'민수',text:'a'}).reply.op,'error');
 assert.equal(call(c,'민수',{op:'note',to:'없는사람',text:'a'}).reply.op,'error');
 assert.equal(call(c,'민수',{op:'note',to:'수진',text:''}).reply.op,'error');
 assert.equal(call(c,'민수',{op:'note',to:'',text:'a'}).reply.op,'error');
 for(let i=0;i<20;i++)call(c,'민수',{op:'note',to:'수진',text:'쪽지 '+i});
 assert.equal(call(c,'수진',{op:'inbox'}).reply.rows.length,Core.LIM.box);
 /* 가상 회원은 자동 답장 */
 r=call(c,'민수',{op:'note',to:'쪼꼬미',text:'안녕!'},T0+9*MIN);
 assert.equal(r.reply.op,'note_ok');assert.equal(r.push[0].to,'민수');assert.ok(r.push[0].delayMs>0);
 const box=call(c,'민수',{op:'inbox'},T0+10*MIN).reply.rows;
 assert.equal(box[0].from,'쪼꼬미');assert.ok(box[0].text.length>5);
 assert.equal(call(c,'민수',{op:'members'}).reply.rows[0].lv,Core.STAFF_LV);
}

/* 8. 등급 */
{
 const c=Core.create(Seed,T0);
 call(c,'열심히',{op:'hello'});assert.equal(Core.levelOf(c,'열심히'),0);
 for(let i=0;i<4;i++)call(c,'열심히',{op:'post',title:'글'+i,body:'내용'},T0+i*MIN*2);
 assert.ok(Core.levelOf(c,'열심히')>=1,'글 4개면 준회원');
 for(let i=0;i<30;i++)call(c,'열심히',{op:'comment',id:c.posts.at(-1).id,text:'리플'+i},T0+(20+i)*MIN);
 assert.ok(Core.levelOf(c,'열심히')>=2);
 assert.equal(call(c,'열심히',{op:'hello'}).reply.me.label,Core.labelOf(Core.levelOf(c,'열심히')));
 assert.equal(call(c,'열심히',{op:'list'}).reply.rows.find(r=>r.nick==='열심히').lv,Core.levelOf(c,'열심히'));
}

/* 9. 응답 크기 (한 번에 8192바이트를 넘으면 서버가 버린다) */
{
 const c=Core.create(Seed,T0);
 const r=call(c,'긴글',{op:'post',title:'ㅋ'.repeat(30),body:('가나다라마바사아자차'.repeat(4)+'\n').repeat(12)});
 const id=r.reply.post.id;
 for(let i=0;i<30;i++)call(c,'닉네임열네글자라서길다'+(i%3),{op:'comment',id,text:'가'.repeat(50)+i},T0+(i+1)*MIN);
 const g=call(c,'긴글',{op:'get',id}).reply;
 assert.ok(Core.bytes(g)<=8192,'post '+Core.bytes(g));assert.ok(Core.bytes(g)<=Core.LIM.replyBytes);
 for(let i=0;i<40;i++)call(c,'닉네임열네글자라서길다'+(i%7),{op:'chat',text:'나'.repeat(50)});
 assert.ok(Core.bytes(call(c,'x',{op:'chat_log'}).reply)<=Core.LIM.replyBytes);
 for(let i=0;i<40;i++)call(c,'닉네임열네글자라서길다'+(i%7),{op:'scrawl',text:'다'.repeat(39)+i},T0+i*MIN*2);
 assert.ok(Core.bytes(call(c,'x',{op:'scrawl_list'}).reply)<=Core.LIM.replyBytes);
 for(let i=0;i<50;i++)call(c,'닉네임열네글자라서길다'+i,{op:'post',title:'ㅎ'.repeat(30)+i,body:'내용'},T0+i*MIN*3);
 assert.ok(Core.bytes(call(c,'x',{op:'list'}).reply)<=Core.LIM.replyBytes);
 for(let i=0;i<30;i++)call(c,'닉네임열네글자라서길다'+i,{op:'attend',text:'ㅎ'.repeat(24)},T0+i*MIN);
 assert.ok(Core.bytes(call(c,'x',{op:'attend_list'}).reply)<=Core.LIM.replyBytes);
}

/* 10. 시간 문구, 저장과 불러오기 */
{
 assert.equal(Core.when(T0,T0+10*1000),'방금 전');assert.equal(Core.when(T0,T0+5*MIN),'5분 전');
 assert.equal(Core.when(T0,T0+3*60*MIN),'오늘 12:00');assert.equal(Core.when(T0,T0+30*60*MIN),'어제 12:00');
 assert.equal(Core.when(T0,T0+4*24*60*MIN),'4일 전');assert.equal(Core.when(T0,T0+15*24*60*MIN),'2주 전');assert.equal(Core.when(T0,T0+90*24*60*MIN),'오래 전');
 const c=Core.create(Seed,T0);call(c,'민수',{op:'post',title:'저장',body:'테스트'});
 const back=Core.revive(JSON.stringify(c),Seed,T0+MIN);
 assert.equal(back.posts.length,c.posts.length);assert.equal(back.posts.at(-1).title,'저장');
 assert.equal(Core.apply(back,{name:'민수'},{op:'list'},T0).reply.total,c.posts.length);
 for(const bad of['', 'null','{"v":2}','[1,2]','{"v":1,"posts":"x"}','not json',null,undefined,{v:1,posts:[1],scrawl:[],chat:[],members:{},notes:{},attend:{rows:[]},nextId:1}]){
  const f=Core.revive(bad,Seed,T0);assert.equal(f.posts.length,bad&&bad.posts?0:Seed.posts.length,'잘못된 저장값: '+JSON.stringify(bad));
 }
 assert.equal(Core.apply(c,{name:'a'},{op:'???'},T0).reply.op,'error');
 assert.equal(Core.apply(c,{name:'a'},{},T0).reply.op,'error');
 assert.equal(Core.apply(c,null,{op:'list'},T0).reply.op,'list');
}

/* 11. 처음 글의 말투와 금지어 */
{
 const banned=['스마트폰','트위터','페이스북','카카오톡','유튜브','아이폰','갤럭시','인스타','LTE','4G','5G','넷플릭스','코로나','—'];
 const text=JSON.stringify(Seed);
 for(const b of banned)assert.ok(!text.includes(b),'금지어: '+b);
 assert.ok(!/\bAI\b/.test(text));
 for(const t of['ㅋㅋ','ㅎㅎ','ㅠㅠ','ㅡㅡ','^^','방가','눈팅','불펌','낚시','도배','사칭','리플','퍼가','출첵','ㄱㄱ','등업','잠수','내공'])assert.ok(text.includes(t),'말투: '+t);
 for(const p of Seed.posts){assert.ok(p.title.length<=Core.LIM.title+12);for(const x of p.comments)assert.ok(x.text.length<=Core.LIM.comment+40)}
}
console.log('club core a88 ok');
