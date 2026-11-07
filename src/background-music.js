/* A68: two original MP3 files, local volume/opt-out and shared room transport. */
(function(w){
'use strict';
const durations=[95.6865,205.035083],cycle=durations[0]+durations[1];
const audio=w.document.createElement('audio');if(typeof audio.play!=='function')return;audio.preload='metadata';audio.id='backgroundMusic';audio.setAttribute('aria-hidden','true');w.document.body.append(audio);
let localEnabled=true,volume=.35,started=false,room=false,state={enabled:true,position:0,updatedAt:Date.now()},offset=0,current=-1,blocked=false,loading=false,hasPlayed=false;
try{const pref=JSON.parse(w.localStorage.getItem('2006_bgm_settings')||'null');if(pref){localEnabled=pref.enabled!==false;if(Number.isFinite(pref.volume))volume=Math.max(0,Math.min(1,pref.volume))}}catch(_){}
const controls=w.document.createElement('div');controls.className='bgm-controls';controls.id='bgmControls';
function el(tag,id,text){const x=w.document.createElement(tag);x.id=id;if(text)x.textContent=text;controls.append(x);return x}
const toggle=el('button','bgmToggle'),label=el('label','bgmVolumeLabel','BGM 음량 '),slider=w.document.createElement('input');slider.type='range';slider.id='bgmVolume';slider.min='0';slider.max='100';slider.step='1';slider.value=String(Math.round(volume*100));slider.setAttribute('aria-label','BGM 음량');label.append(slider);const amount=el('span','bgmVolumeValue');const shared=el('button','bgmRoomToggle');const status=el('span','bgmStatus');const restart=el('button','bgmRestart','처음부터'),next=el('button','bgmNext','다음 곡');restart.type=next.type='button';for(const b of [toggle,shared])b.type='button';
const soundOptions=w.document.getElementById?.('soundOptions'),toolbar=w.document.querySelector('.game-toolbar');if(soundOptions)soundOptions.append(controls);else if(toolbar?.parentNode)toolbar.parentNode.insertBefore(controls,toolbar.nextSibling);else w.document.body.append(controls);
function save(){try{w.localStorage.setItem('2006_bgm_settings',JSON.stringify({enabled:localEnabled,volume}))}catch(_){}}
function position(){return ((state.position+(state.enabled?(Date.now()+offset-state.updatedAt)/1000:0))%cycle+cycle)%cycle}
function target(){let p=position();return p<durations[0]-1e-6?{track:0,time:p}:{track:1,time:Math.max(0,p-durations[0])}}
function ui(){toggle.textContent=localEnabled?'내 BGM 끄기':'내 BGM 켜기';toggle.setAttribute('aria-pressed',String(localEnabled));shared.textContent=state.enabled?'방 전체 BGM 끄기':'방 전체 BGM 켜기';shared.disabled=!room;amount.textContent=Math.round(volume*100)+'%';status.textContent=blocked?'첫 클릭이나 키 입력으로 음악 시작':!localEnabled?'내 BGM 꺼짐':room&&!state.enabled?'방 BGM 정지':started?'BGM '+(current+1)+' / 2 · 반복':'입장하면 BGM 시작';}
function sync(){
 audio.volume=volume;audio.muted=!localEnabled;
 if(!started||!localEnabled||!state.enabled){audio.pause();ui();return}
 const t=target();if(current!==t.track){current=t.track;loading=true;audio.src='assets/music/'+(current+1)+'.mp3';audio.load()}
 if(!loading&&Math.abs((Number(audio.currentTime)||0)-t.time)>.9){try{audio.currentTime=t.time}catch(_){}}
 if(audio.paused){const p=audio.play();if(p?.then)p.then(()=>{hasPlayed=true;blocked=false;ui()}).catch(()=>{blocked=true;ui()})}ui();
}
function start(){if(blocked&&!hasPlayed&&!room){state={enabled:true,position:0,updatedAt:Date.now()};offset=0}if(!started){started=true;if(!room){state={enabled:true,position:0,updatedAt:Date.now()};offset=0}}blocked=false;sync()}
function receive(m){if(!m||typeof m.enabled!=='boolean'||!Number.isFinite(m.position)||!Number.isFinite(m.updatedAt)||!Number.isFinite(m.serverTime))return;room=true;offset=m.serverTime-Date.now();state={enabled:m.enabled,position:m.position,updatedAt:m.updatedAt};sync()}
function setEnabled(value){localEnabled=!!value;save();if(localEnabled)start();else sync()}
function setVolume(value){if(!Number.isFinite(value))return;volume=Math.max(0,Math.min(1,value));slider.value=String(Math.round(volume*100));save();sync()}
function setRoomEnabled(enabled){if(room&&w.A25NET?.state.ready)w.A25NET.send({type:'music',enabled:!!enabled})}
function transport(action){if(room&&w.A25NET?.state.ready){w.A25NET.send({type:'music',action});return}const t=target().track;state={enabled:state.enabled,position:action==='restart'?(t?durations[0]:0):(t?0:durations[0]),updatedAt:Date.now()};sync()}
restart.addEventListener('click',()=>transport('restart'));next.addEventListener('click',()=>transport('next'));
function leave(){if(!room)return;const p=position();room=false;offset=0;state={enabled:true,position:p,updatedAt:Date.now()};sync()}
toggle.addEventListener('click',()=>{if(blocked&&localEnabled)start();else setEnabled(!localEnabled)});slider.addEventListener('input',()=>setVolume(Number(slider.value)/100));shared.addEventListener('click',()=>setRoomEnabled(!state.enabled));
for(const x of [toggle,slider,shared,restart,next]){for(const type of ['keydown','keyup'])x.addEventListener(type,e=>e.stopPropagation());}
audio.addEventListener('loadedmetadata',()=>{loading=false;const t=target();try{audio.currentTime=Math.min(t.time,Number.isFinite(audio.duration)?Math.max(0,audio.duration-.01):t.time)}catch(_){}sync()});
audio.addEventListener('ended',()=>{if(!state.enabled)return;if(!room){const next=(current+1)%2;state={enabled:true,position:next===0?0:durations[0],updatedAt:Date.now()}}current=-1;sync()});
audio.addEventListener('error',()=>{loading=false;blocked=true;status.textContent='BGM 파일을 불러오지 못했어. 다시 재생해 줘.'});
w.A25NET?.subscribe(msg=>{if(msg.type==='welcome'||msg.type==='music')receive(msg.music);if(msg.type==='network_close')leave()});
w.setInterval(()=>{if(started&&room)sync()},5000);
w.BGM={transport,start,setEnabled,setVolume,setRoomEnabled,receive,leave,target,get audio(){return audio},get state(){return{started,localEnabled,volume,room,sharedEnabled:state.enabled,track:current,position:position(),blocked}}};ui();
function retryOnGesture(){if(localEnabled&&state.enabled&&(!started||blocked||audio.paused))start()}
w.addEventListener?.('pointerdown',retryOnGesture,{capture:true});w.addEventListener?.('keydown',retryOnGesture,{capture:true});if(localEnabled)start();
})(window);
