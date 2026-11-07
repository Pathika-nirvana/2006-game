/* 동네 태권 대전 (2006 오락실 대전 격투)
 * 독립 실행 게임 본체. 화면 320x224를 2배 해상도로 그린다.
 * 부모 게임과는 postMessage로만 대화한다. (INTEGRATION.md 참고) */
(function () {
'use strict';
const BUILD = 'v7 2026-11-07 18:50';
const W = 320, H = 224, GY = 192, SC = 2, WL = 18, WR = 302, GRAV = 0.34;
const FONT = '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans CJK KR","Noto Sans KR","Nanum Gothic",sans-serif';
const cv = document.getElementById('screen');
const c = cv.getContext('2d');
cv.width = W * SC; cv.height = H * SC;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/* ---------- 부모와 신호 ---------- */
const embedded = window.parent !== window;
function post(type, extra) {
  if (!embedded) return;
  try { window.parent.postMessage(Object.assign({ source: 'arcade-game', game: 'fighter', type }, extra || {}), '*'); } catch (e) {}
}

/* ---------- 입력 ---------- */
const down = new Set(), pressedKeys = new Set();
const MAP = [
  /* 1P: 방향키로 움직이고 왼손은 Q(풋워크) A(훼이크) S(왼발) D(오른발) */
  { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown', b: ['KeyQ', 'KeyA', 'KeyS', 'KeyD'] },
  /* 2P: IJKL로 움직이고 U O P ; 로 풋워크 훼이크 왼발 오른발 */
  { l: 'KeyJ', r: 'KeyL', u: 'KeyI', d: 'KeyK', b: ['KeyU', 'KeyO', 'KeyP', 'Semicolon'] }
];
const GAMEKEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter', 'Escape', 'Backspace', 'Tab',
  'KeyQ', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyL', 'KeyI', 'KeyK', 'KeyU', 'KeyO', 'KeyP', 'Semicolon', 'KeyM']);
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (GAMEKEYS.has(e.code)) e.preventDefault();
  if (!down.has(e.code)) pressedKeys.add(e.code);
  down.add(e.code);
  audioInit();
}, { passive: false });
addEventListener('keyup', e => { down.delete(e.code); });
addEventListener('blur', () => { down.clear(); if (!G.net && G.scene === 'fight' && G.rs === 'fight' && !G.paused) setPause(true); });
cv.addEventListener('pointerdown', () => { window.focus(); audioInit(); });

const emptyRaw = () => ({ l: false, r: false, u: false, d: false, btn: [false, false, false, false], sp: null, mv: null });
function keyRaw(maps) {
  const r = emptyRaw();
  for (const m of maps) {
    if (down.has(m.l)) r.l = true; if (down.has(m.r)) r.r = true;
    if (down.has(m.u)) r.u = true; if (down.has(m.d)) r.d = true;
    m.b.forEach((k, i) => { if (down.has(k)) r.btn[i] = true; });
  }
  return r;
}
function padRaw(i) {
  const r = emptyRaw();
  try {
    const gp = (navigator.getGamepads ? navigator.getGamepads() : [])[i];
    if (gp && gp.connected) {
      const b = n => !!(gp.buttons[n] && gp.buttons[n].pressed);
      r.l = b(14) || gp.axes[0] < -0.5; r.r = b(15) || gp.axes[0] > 0.5;
      r.u = b(12) || gp.axes[1] < -0.5; r.d = b(13) || gp.axes[1] > 0.5;
      r.btn = [2, 3, 0, 1].map(b);
    }
  } catch (e) {}
  return r;
}
function mergeRaw(a, b) {
  return { l: a.l || b.l, r: a.r || b.r, u: a.u || b.u, d: a.d || b.d, btn: a.btn.map((v, k) => v || b.btn[k]) };
}
function localRaw() { return mergeRaw(keyRaw([MAP[0]]), padRaw(0)); }
function packRaw(r) { return (r.l ? 1 : 0) | (r.r ? 2 : 0) | (r.u ? 4 : 0) | (r.d ? 8 : 0) | (r.btn[0] ? 16 : 0) | (r.btn[1] ? 32 : 0) | (r.btn[2] ? 64 : 0) | (r.btn[3] ? 128 : 0); }
function unpackRaw(b) { return { l: !!(b & 1), r: !!(b & 2), u: !!(b & 4), d: !!(b & 8), btn: [!!(b & 16), !!(b & 32), !!(b & 64), !!(b & 128)], sp: null, mv: null }; }
function getRaw(i) {
  let r;
  if (G.mode === 3) return i === 0 ? localRaw() : emptyRaw();
  if (G.mode === 2) r = keyRaw([MAP[i]]);
  else r = i === 0 ? keyRaw([MAP[0]]) : emptyRaw();
  return mergeRaw(r, padRaw(i));
}
function menuEdge(i) {
  const raw = getRaw(i), pr = G.mprev[i] || emptyRaw();
  G.mprev[i] = raw;
  const m = {
    l: raw.l && !pr.l, r: raw.r && !pr.r, u: raw.u && !pr.u, d: raw.d && !pr.d,
    ok: raw.btn.some((b, k) => b && !pr.btn[k])
  };
  if (i === 0 && (pressedKeys.has('Enter') || pressedKeys.has('Space'))) m.ok = true;
  return m;
}

/* ---------- 소리 ---------- */
let AC = null, master = null, muted = false;
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = 0.5; master.connect(AC.destination);
  } catch (e) { AC = null; }
}
function tone(f, d, type, vol, slide, delay) {
  if (!AC || muted) return;
  try {
    const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(vol || 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
  } catch (e) {}
}
function noise(d, vol, hp, delay) {
  if (!AC || muted) return;
  try {
    const n = Math.floor(AC.sampleRate * d), buf = AC.createBuffer(1, n, AC.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = AC.createBufferSource(); s.buffer = buf;
    const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 500;
    const g = AC.createGain(); g.gain.value = vol || 0.2;
    s.connect(f); f.connect(g); g.connect(master); s.start(AC.currentTime + (delay || 0));
  } catch (e) {}
}
const sfx = {
  select: () => tone(660, 0.06, 'square', 0.08),
  ok: () => { tone(523, 0.07, 'square', 0.1); tone(784, 0.12, 'square', 0.1, 0, 0.07); },
  back: () => tone(330, 0.08, 'square', 0.08, -80),
  swing: () => noise(0.07, 0.05, 2600),
  hit: () => { noise(0.09, 0.22, 900); tone(170, 0.1, 'square', 0.16, -90); },
  heavy: () => { noise(0.16, 0.32, 300); tone(110, 0.2, 'sawtooth', 0.2, -60); },
  block: () => { tone(320, 0.05, 'square', 0.1); noise(0.04, 0.1, 3000); },
  fire: () => tone(260, 0.3, 'sawtooth', 0.09, 520),
  jump: () => tone(300, 0.1, 'square', 0.05, 280),
  land: () => noise(0.05, 0.08, 200),
  bell: () => { tone(880, 0.25, 'triangle', 0.14); tone(1320, 0.3, 'triangle', 0.1, 0, 0.05); },
  ko: () => { noise(0.4, 0.3, 200); tone(220, 0.5, 'sawtooth', 0.18, -180); },
  win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'square', 0.1, 0, i * 0.12)); },
  coin: () => { tone(988, 0.07, 'square', 0.1); tone(1319, 0.2, 'square', 0.1, 0, 0.07); }
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const PAT = {
  menu: { bpm: 100, lead: [69, 0, 72, 0, 76, 0, 72, 0, 74, 0, 72, 0, 69, 0, 0, 0, 67, 0, 69, 0, 72, 0, 69, 0, 64, 0, 67, 0, 69, 0, 0, 0],
    bass: [45, 0, 0, 0, 45, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0, 43, 0, 0, 0] },
  fight: { bpm: 156, lead: [76, 76, 0, 72, 74, 0, 72, 0, 69, 0, 72, 0, 74, 0, 76, 0, 79, 79, 0, 76, 74, 0, 72, 0, 71, 0, 74, 0, 72, 0, 0, 0],
    bass: [45, 45, 45, 45, 45, 45, 45, 45, 43, 43, 43, 43, 43, 43, 43, 43, 41, 41, 41, 41, 41, 41, 41, 41, 43, 43, 43, 43, 43, 43, 43, 43] }
};
const bgm = { kind: null, step: 0, next: 0, timer: 0 };
function bgmPlay(kind) {
  if (bgm.kind === kind) return;
  bgmStop(); bgm.kind = kind; bgm.step = 0; bgm.next = 0;
  bgm.timer = setInterval(() => {
    if (!AC || muted || !bgm.kind) return;
    const p = PAT[bgm.kind], dur = 60 / p.bpm / 2;
    if (!bgm.next || bgm.next < AC.currentTime) bgm.next = AC.currentTime + 0.05;
    while (bgm.next < AC.currentTime + 0.15) {
      const s = bgm.step % 32, l = p.lead[s], b = p.bass[s], d = bgm.next - AC.currentTime;
      if (l) tone(hz(l), dur * 0.9, 'square', 0.035, 0, d);
      if (b) tone(hz(b), dur * 0.95, 'triangle', 0.07, 0, d);
      bgm.next += dur; bgm.step++;
    }
  }, 40);
}
function bgmStop() { if (bgm.timer) clearInterval(bgm.timer); bgm.timer = 0; bgm.kind = null; }

/* ---------- 자세 ---------- */
function P(hip, neck, head, fe, fh, be, bh, fk, ff, bk, bf) { return [].concat(hip, neck, head, fe, fh, be, bh, fk, ff, bk, bf); }
function mk(hip, neck, head, fe, fh, be, bh, legs) { return P(hip, neck, head, fe, fh, be, bh, legs[0], legs[1], legs[2], legs[3]); }
const GA = [[8, -33], [14, -40], [4, -35], [9, -45]];   /* 겨루기 자세의 손: 앞손은 낮게, 뒷손은 턱 앞 */
const mg = (hip, neck, head, legs) => mk(hip, neck, head, GA[0], GA[1], GA[2], GA[3], legs);
const POSE = {
  idle0: mg([0, -23], [3, -40], [5, -47], [[9, -12], [14, 0], [-5, -12], [-10, 0]]),
  idle1: mg([0, -29], [2, -46], [4, -53], [[8, -17], [13, -5], [-4, -16], [-9, -4]]),
  crouch: mk([-1, -14], [3, -29], [5, -36], [9, -23], [15, -29], [4, -26], [10, -34], [[10, -10], [10, 0], [-7, -8], [-7, 0]]),
  /* 몸통 차기 */
  frontK_s: mk([-1, -26], [1, -43], [3, -50], [7, -33], [13, -40], [3, -35], [8, -45], [[10, -32], [9, -20], [-4, -13], [-8, 0]]),
  frontK_a: mk([-3, -26], [-1, -43], [1, -50], [7, -33], [13, -40], [3, -35], [8, -45], [[11, -29], [26, -31], [-4, -13], [-7, 0]]),
  roundR_s: mk([0, -25], [0, -42], [2, -49], [6, -33], [11, -41], [2, -35], [7, -44], [[4, -13], [6, 0], [3, -30], [-7, -22]]),
  roundR_a: mk([-3, -26], [-8, -41], [-11, -47], [2, -33], [-4, -38], [-6, -38], [-12, -42], [[1, -13], [2, 0], [8, -34], [23, -39]]),
  sideK_s: mk([-1, -26], [0, -43], [1, -50], [7, -33], [13, -40], [3, -35], [8, -45], [[11, -30], [8, -18], [-4, -13], [-8, 0]]),
  sideK_a: mk([-4, -26], [-10, -39], [-13, -45], [-4, -34], [-9, -28], [-5, -36], [-11, -31], [[12, -29], [27, -33], [-4, -13], [-6, 0]]),
  backK_s: mk([-1, -24], [-3, -39], [-6, -45], [-6, -32], [-10, -28], [-8, -34], [-13, -31], [[7, -13], [10, 0], [-5, -12], [-9, 0]]),
  backK_a: mk([-2, -26], [-14, -35], [-19, -38], [-10, -30], [-18, -27], [-12, -32], [-20, -30], [[13, -29], [27, -30], [-5, -13], [-6, 0]]),
  /* 얼굴 차기 */
  frontH_s: mk([-1, -27], [-1, -44], [0, -51], [7, -34], [13, -41], [3, -36], [8, -46], [[9, -38], [7, -26], [-4, -14], [-7, 0]]),
  frontH_a: mk([-3, -29], [-8, -43], [-10, -50], [-2, -35], [-7, -30], [-4, -37], [-9, -33], [[10, -38], [21, -47], [-4, -14], [-6, 0]]),
  roundH_s: mk([0, -26], [0, -43], [2, -50], [6, -34], [11, -42], [2, -36], [7, -45], [[4, -13], [6, 0], [3, -34], [-6, -26]]),
  roundH_a: mk([-3, -29], [-10, -42], [-14, -48], [0, -36], [-6, -40], [-6, -38], [-13, -42], [[1, -14], [1, 0], [8, -40], [21, -49]]),
  sideH_s: mk([-1, -27], [0, -44], [1, -51], [7, -34], [13, -41], [3, -36], [8, -46], [[11, -38], [8, -26], [-4, -14], [-8, 0]]),
  sideH_a: mk([-4, -28], [-12, -40], [-16, -46], [-4, -35], [-9, -30], [-5, -37], [-11, -32], [[11, -37], [24, -47], [-4, -14], [-6, 0]]),
  backH_a: mk([-2, -28], [-14, -38], [-19, -42], [-10, -32], [-18, -29], [-12, -34], [-20, -32], [[12, -38], [26, -46], [-5, -14], [-6, 0]]),
  /* 맞고 막고 쓰러짐 */
  hit0: mk([-2, -27], [-5, -44], [-7, -50], [0, -38], [-4, -33], [-3, -36], [-8, -30], [[1, -14], [4, 0], [-5, -14], [-11, 0]]),
  hit1: mk([-3, -26], [-9, -42], [-12, -47], [-3, -36], [-9, -30], [-6, -34], [-13, -28], [[0, -14], [3, 0], [-6, -14], [-12, 0]]),
  block: mk([-1, -26], [0, -43], [2, -50], [8, -39], [12, -49], [6, -37], [10, -46], [[8, -13], [13, 0], [-5, -13], [-10, 0]]),
  blockC: mk([-1, -14], [3, -29], [5, -36], [9, -26], [13, -35], [5, -24], [10, -33], [[10, -10], [10, 0], [-7, -8], [-7, 0]]),
  fall: mk([-7, -24], [-14, -38], [-19, -42], [-12, -30], [-18, -26], [-10, -34], [-17, -33], [[-1, -20], [3, -8], [-8, -14], [-3, -4]]),
  down: mk([-14, -5], [-28, -6], [-35, -8], [-20, -9], [-23, -4], [-24, -5], [-29, -3], [[-4, -9], [3, -3], [-9, -7], [-1, -2]]),
  win: mk([0, -27], [0, -45], [1, -52], [6, -52], [8, -66], [-6, -52], [-8, -66], [[4, -14], [8, 0], [-4, -14], [-9, 0]]),
  dashF: mg([2, -25], [6, -41], [8, -47], [[11, -18], [14, -8], [-3, -14], [-8, -6]]),
  dashB: mg([-3, -26], [-6, -43], [-8, -49], [[3, -16], [6, -6], [-5, -14], [-9, -3]]),
  switchM: mg([0, -27], [2, -44], [4, -51], [[1, -17], [3, -7], [-1, -17], [-3, -7]]),
  guardF: mk([-1, -26], [0, -43], [2, -50], [8, -39], [12, -49], [6, -37], [10, -46], [[10, -26], [9, -18], [-5, -13], [-9, 0]]),
  feint: mg([0, -25], [3, -42], [5, -49], [[10, -26], [9, -18], [-5, -13], [-9, 0]]),
  /* 앞발로 차는 돌려차기와 찍어차기 */
  roundF_s: mk([0, -25], [1, -42], [3, -49], [6, -33], [11, -41], [2, -35], [7, -44], [[8, -30], [4, -20], [-3, -13], [-6, 0]]),
  roundF_a: mk([-2, -26], [-6, -41], [-9, -47], [3, -33], [-2, -38], [-5, -38], [-10, -42], [[9, -36], [24, -40], [-2, -13], [-3, 0]]),
  roundFH_s: mk([0, -26], [1, -43], [3, -50], [6, -34], [11, -42], [2, -36], [7, -45], [[8, -34], [4, -24], [-3, -14], [-6, 0]]),
  roundFH_a: mk([-3, -28], [-9, -42], [-13, -48], [1, -35], [-5, -40], [-6, -38], [-12, -43], [[9, -41], [22, -50], [-2, -14], [-3, 0]]),
  axe_s: mk([-1, -27], [-1, -44], [0, -51], [7, -34], [13, -41], [3, -36], [8, -46], [[7, -44], [8, -68], [-4, -14], [-7, 0]]),
  axe_a: mk([0, -26], [3, -43], [5, -50], [7, -33], [13, -40], [3, -35], [8, -45], [[10, -34], [17, -44], [-4, -13], [-7, 0]])
};
function lerpPose(a, b, t) { const o = new Array(a.length); for (let i = 0; i < a.length; i++) o[i] = a[i] + (b[i] - a[i]) * t; return o; }
/* 겨루기 스텝: 발을 끌며 통통 튀듯 움직인다 */
function walkPose(ph) {
  const s = Math.sin(ph), s2 = Math.sin(ph - 1.6), l1 = Math.max(0, Math.cos(ph)) * 4, l2 = Math.max(0, Math.cos(ph - 1.6)) * 4;
  const bob = Math.abs(Math.sin(ph)) * 3.2, ffx = 11 + 5 * s, bfx = -9 + 5 * s2;
  return mk([0, -24 - bob], [3, -41 - bob], [5, -48 - bob], [8, -32 - bob], [14, -39 - bob], [4, -34 - bob], [9, -44 - bob],
    [[ffx * 0.6 + 2, (-24 - bob - l1) / 2 - 3], [ffx, -l1], [bfx * 0.6 + 1, (-24 - bob - l2) / 2 - 3], [bfx, -l2]]);
}

/* ---------- 캐릭터 ---------- */
const CHARS = [
  { id: 0, name: '한결', title: '균형 잡힌 태권소년', hp: 100, walk: 1.25, back: 1.0, jump: 6.4, dmg: 1, pu: 0, ku: 0, sc: 1, limb: 4, tors: 9, head: 10, atk: 3, spd: 3, vit: 3,
    pal: { skin: '#f2c79b', gi: '#f6f3ea', pants: '#f6f3ea', belt1: '#c8312f', belt2: '#1c1c22', hair: '#1d1a24', shoe: '#f2c79b', trim: '#2b4a9a' } },
  { id: 1, name: '다온', title: '발이 빠른 발차기 소녀', hp: 94, walk: 1.5, back: 1.2, jump: 7.0, dmg: 0.92, pu: 0, ku: -1, sc: 1, limb: 4, tors: 8, head: 10, atk: 2, spd: 5, vit: 2, pony: true,
    pal: { skin: '#f4cfa8', gi: '#f6f3ea', pants: '#f6f3ea', belt1: '#c8312f', belt2: '#1c1c22', hair: '#5a2f1e', shoe: '#f4cfa8', trim: '#d9577f' } },
  { id: 2, name: '철웅', title: '묵직한 도장 관장님', hp: 122, walk: 1.0, back: 0.8, jump: 5.9, dmg: 1.18, pu: 1, ku: 1, sc: 1.1, limb: 5, tors: 11, head: 11, atk: 5, spd: 1, vit: 5, band: true,
    pal: { skin: '#e3b184', gi: '#2a3a5e', pants: '#2a3a5e', belt1: '#111', belt2: '#111', hair: '#8f8f98', shoe: '#e3b184', trim: '#c8312f' } }
];
const ALT = { gi: '#c9dcf5', pants: '#c9dcf5', belt1: '#2d6bd1', belt2: '#10203d', hair: '#6a3d1e' };

/* ---------- 기술표 ---------- */
/* 점수: 몸통 2, 회전 몸통 4, 얼굴 3, 회전 얼굴 5 (실제 시합 점수).
   su 준비, ac 맞는 구간, rc 회수, wr 헛방일 때 더 늘어나는 회수, bal 헛방 균형 (1 휘청, 2 넘어짐),
   open 이 기술을 쓰는 동안 비는 곳 (head 얼굴, body 옆구리와 몸통, back 등), lunge 앞으로 나가는 힘 */
function mv(o) { return Object.assign({ su: 5, ac: 3, rc: 8, dmg: 6, hs: 13, bs: 9, push: 2, kd: false, box: [8, -44, 24, 10], pose: ['frontK_s', 'frontK_a'], base: 'idle0', kind: 'k', sfx: 'swing', hstop: 5, pts: 2, head: false, spin: false, lunge: 0, wr: 0, bal: 0, open: '', strong: false, tag: '', jump: 0, knock: false, leg: '' }, o); }
const MOVES = {
  A: mv({ name: '앞발 앞차기', su: 5, ac: 3, rc: 9, dmg: 5, hs: 13, bs: 9, push: 2.2, lunge: 4, wr: 3, box: [10, -38, 28, 10], pose: ['frontK_s', 'frontK_a'] }),
  F: mv({ leg: 'f', name: '앞발 돌려차기', su: 6, ac: 3, rc: 10, dmg: 6, hs: 14, bs: 10, push: 2.6, wr: 4, open: 'head', box: [8, -44, 32, 12], pose: ['roundF_s', 'roundF_a'] }),
  S: mv({ name: '발붙여 돌려차기', su: 9, ac: 3, rc: 14, dmg: 8, hs: 16, bs: 11, push: 3, lunge: 5, wr: 6, open: 'head', box: [8, -46, 30, 12], pose: ['roundR_s', 'roundR_a'], hstop: 7 }),
  B: mv({ leg: 'r', name: '뒷발 돌려차기', su: 9, ac: 3, rc: 15, dmg: 9, hs: 16, bs: 11, push: 3, wr: 8, open: 'head', box: [8, -46, 32, 12], pose: ['roundR_s', 'roundR_a'], hstop: 7 }),
  C: mv({ name: '옆차기', su: 8, ac: 4, rc: 14, dmg: 7, hs: 15, bs: 10, push: 6, lunge: 3, wr: 7, open: 'body', box: [10, -40, 38, 10], pose: ['sideK_s', 'sideK_a'], hstop: 6 }),
  D: mv({ name: '뒤차기', su: 13, ac: 3, rc: 20, dmg: 12, hs: 20, bs: 13, push: 4, wr: 12, bal: 1, open: 'back', box: [8, -40, 36, 13], pose: ['backK_s', 'backK_a'], pts: 4, spin: true, hstop: 9 }),
  X: mv({ name: '찍어차기', su: 10, ac: 3, rc: 14, dmg: 13, hs: 18, bs: 11, push: 2, wr: 8, open: 'body', box: [6, -62, 26, 12], pose: ['axe_s', 'axe_a'], pts: 3, head: true, hstop: 9 }),
  hA: mv({ name: '얼굴 앞차기', su: 8, ac: 3, rc: 13, dmg: 12, hs: 18, bs: 11, push: 2.5, lunge: 4, wr: 5, open: 'body', box: [10, -60, 30, 16], pose: ['frontH_s', 'frontH_a'], pts: 3, head: true, hstop: 9 }),
  hF: mv({ name: '앞발 얼굴 돌려차기', su: 9, ac: 3, rc: 15, dmg: 14, hs: 19, bs: 12, push: 3, wr: 6, open: 'head', box: [8, -60, 30, 16], pose: ['roundFH_s', 'roundFH_a'], pts: 3, head: true, hstop: 10 }),
  hS: mv({ name: '발붙여 얼굴 돌려차기', su: 12, ac: 3, rc: 17, dmg: 15, hs: 20, bs: 12, push: 3, lunge: 5, wr: 9, bal: 1, open: 'head', box: [8, -60, 30, 16], pose: ['roundH_s', 'roundH_a'], pts: 3, head: true, hstop: 10 }),
  hB: mv({ name: '뒷발 얼굴 돌려차기', su: 11, ac: 3, rc: 18, dmg: 16, hs: 20, bs: 12, push: 3, wr: 8, bal: 1, open: 'head', box: [8, -60, 32, 16], pose: ['roundH_s', 'roundH_a'], pts: 3, head: true, hstop: 10 }),
  hC: mv({ name: '얼굴 옆차기', su: 11, ac: 4, rc: 17, dmg: 14, hs: 20, bs: 12, push: 5, wr: 8, open: 'body', box: [10, -60, 36, 16], pose: ['sideH_s', 'sideH_a'], pts: 3, head: true, hstop: 10 }),
  /* 나래차기: 돌려차기 직후 반대발로 이어 차는 연타 (최대 3번) */
  nB: mv({ leg: 'r', name: '나래차기', su: 4, ac: 3, rc: 12, dmg: 6, hs: 12, bs: 8, push: 2, wr: 5, open: 'head', box: [8, -46, 32, 12], pose: ['roundR_s', 'roundR_a'], hstop: 6 }),
  nF: mv({ leg: 'f', name: '나래차기', su: 4, ac: 3, rc: 12, dmg: 5, hs: 12, bs: 8, push: 2, wr: 5, open: 'head', box: [8, -44, 32, 12], pose: ['roundF_s', 'roundF_a'], hstop: 6 }),
  nhB: mv({ leg: 'r', name: '나래 얼굴차기', su: 5, ac: 3, rc: 14, dmg: 9, hs: 16, bs: 10, push: 3, wr: 7, open: 'head', box: [8, -60, 32, 16], pose: ['roundH_s', 'roundH_a'], pts: 3, head: true, hstop: 8 }),
  nhF: mv({ leg: 'f', name: '나래 얼굴차기', su: 5, ac: 3, rc: 14, dmg: 8, hs: 16, bs: 10, push: 3, wr: 7, open: 'head', box: [8, -60, 32, 16], pose: ['roundFH_s', 'roundFH_a'], pts: 3, head: true, hstop: 8 }),
  /* 풋워크(Q)로 힘을 받아 나가는 기술: 강하지만 헛치면 크게 휘청 */
  CB: mv({ name: '카운터 뒤차기', strong: true, tag: '카운터', su: 8, ac: 3, rc: 22, dmg: 18, hs: 24, bs: 14, push: 5, lunge: 7, wr: 16, bal: 1, open: 'back', knock: true, box: [8, -40, 40, 13], pose: ['backK_s', 'backK_a'], pts: 4, spin: true, hstop: 11 }),
  hCB: mv({ name: '카운터 얼굴 뒤차기', strong: true, tag: '카운터', su: 9, ac: 3, rc: 24, dmg: 24, hs: 26, bs: 15, push: 5, lunge: 7, wr: 18, bal: 1, open: 'back', box: [8, -60, 40, 16], pose: ['backK_s', 'backH_a'], pts: 5, head: true, spin: true, hstop: 12 }),
  HW: mv({ name: '회축', strong: true, tag: '회축', su: 11, ac: 3, rc: 24, dmg: 20, hs: 24, bs: 14, push: 5, lunge: 4, wr: 16, bal: 1, open: 'back', knock: true, box: [8, -46, 40, 14], pose: ['backK_s', 'backK_a'], pts: 4, spin: true, hstop: 11 }),
  hHW: mv({ name: '얼굴 회축', strong: true, tag: '회축', su: 12, ac: 3, rc: 26, dmg: 25, hs: 26, bs: 15, push: 5, lunge: 4, wr: 18, bal: 1, open: 'back', box: [8, -60, 40, 16], pose: ['backK_s', 'backH_a'], pts: 5, head: true, spin: true, hstop: 12 }),
  TK: mv({ name: '턴차기', strong: true, tag: '턴차기', su: 12, ac: 3, rc: 20, dmg: 16, hs: 22, bs: 14, push: 5, lunge: 6, wr: 14, bal: 1, open: 'back', knock: true, box: [8, -46, 38, 12], pose: ['roundR_s', 'roundR_a'], pts: 4, spin: true, hstop: 11 }),
  hTK: mv({ name: '얼굴 턴차기', strong: true, tag: '턴차기', su: 13, ac: 3, rc: 22, dmg: 22, hs: 25, bs: 15, push: 5, lunge: 6, wr: 16, bal: 1, open: 'back', box: [8, -60, 38, 16], pose: ['roundH_s', 'roundH_a'], pts: 5, head: true, spin: true, hstop: 12 }),
  Y: mv({ name: '돌진 옆차기', strong: true, tag: '돌진', su: 10, ac: 4, rc: 18, dmg: 16, hs: 22, bs: 14, push: 7, lunge: 9, jump: 2.2, wr: 14, bal: 1, open: 'body', knock: true, box: [10, -40, 42, 10], pose: ['sideK_s', 'sideK_a'], hstop: 10 }),
  hY: mv({ name: '돌진 얼굴 옆차기', strong: true, tag: '돌진', su: 11, ac: 4, rc: 20, dmg: 20, hs: 24, bs: 14, push: 6, lunge: 9, jump: 2.2, wr: 16, bal: 1, open: 'body', box: [10, -60, 42, 16], pose: ['sideH_s', 'sideH_a'], pts: 3, head: true, hstop: 12 }),
  /* 두 발 버튼을 같이 눌러 나가는 강한 기술 */
  J: mv({ name: '뛰어 옆차기', strong: true, tag: '강타', su: 12, ac: 4, rc: 18, dmg: 15, hs: 22, bs: 14, push: 7, lunge: 7, jump: 3.0, wr: 14, bal: 1, open: 'body', knock: true, box: [10, -40, 40, 10], pose: ['sideK_s', 'sideK_a'], hstop: 10 }),
  hJ: mv({ name: '뛰어 얼굴 옆차기', strong: true, tag: '강타', su: 13, ac: 4, rc: 20, dmg: 19, hs: 24, bs: 14, push: 6, lunge: 7, jump: 3.0, wr: 16, bal: 1, open: 'body', box: [10, -60, 40, 16], pose: ['sideH_s', 'sideH_a'], pts: 3, head: true, hstop: 12 }),
  T: mv({ name: '돌개차기', strong: true, tag: '강타', su: 14, ac: 3, rc: 22, dmg: 16, hs: 22, bs: 14, push: 5, lunge: 2, wr: 14, bal: 1, open: 'back', knock: true, box: [8, -46, 36, 12], pose: ['roundR_s', 'roundR_a'], pts: 4, spin: true, hstop: 11 }),
  hT: mv({ name: '돌개 얼굴 차기', strong: true, tag: '강타', su: 17, ac: 3, rc: 26, dmg: 24, hs: 26, bs: 15, push: 5, lunge: 2, wr: 18, bal: 2, open: 'back', box: [8, -60, 36, 17], pose: ['roundH_s', 'roundH_a'], pts: 5, head: true, spin: true, hstop: 13 }),
  W: mv({ name: '내려찍기', strong: true, tag: '강타', su: 12, ac: 3, rc: 20, dmg: 16, hs: 22, bs: 13, push: 3, wr: 12, open: 'body', box: [6, -64, 28, 13], pose: ['axe_s', 'axe_a'], pts: 3, head: true, hstop: 11 }),
  hD: mv({ name: '뒤후려차기', su: 16, ac: 3, rc: 24, dmg: 22, hs: 24, bs: 14, push: 4, wr: 16, bal: 2, open: 'back', box: [8, -60, 34, 17], pose: ['backK_s', 'backH_a'], pts: 5, head: true, spin: true, hstop: 12 })
};
function pickStrong(zone, up) { return zone === 0 ? (up ? 'hJ' : 'J') : zone === 1 ? (up ? 'hT' : 'T') : 'W'; }
/* 거리 구간: 0 먼 거리, 1 중간, 2 가까움 */
function zoneOf(d) { return d >= 54 ? 0 : d >= 42 ? 1 : 2; }
/* 어느 발인지(front), 방향(dv: 1 앞, -1 뒤, 0 없음), 얼굴 여부(up), 거리 구간으로 기술을 고른다 */
function pickMove(front, zone, dv, up) {
  if (front) {
    if (dv > 0) return up ? 'hC' : 'C';
    if (dv < 0 || zone === 0) return up ? 'hA' : 'A';
    if (zone === 1) return up ? 'hF' : 'F';
    return up ? 'X' : 'F';
  }
  if (dv > 0) return up ? 'hS' : 'S';
  if (dv < 0) return up ? 'hD' : 'D';
  if (zone === 0) return up ? 'hS' : 'S';
  if (zone === 1) return up ? 'hB' : 'B';
  return up ? 'hD' : 'D';
}
const KEYS4 = ['A', 'B', 'C', 'D'];

/* ---------- 상태 ---------- */
const G = {
  scene: 'title', t: 0, mode: 1, menu: 0, sel: [0, 1], done: [false, false], ladder: [], lad: 0, stage: 0, score: 0, best: 0,
  round: 1, wins: [0, 0], timer: 60, tc: 0, rs: 'ready', rt: 0, hitstop: 0, slow: 0, shake: 0, paused: false, pauseSel: 0, conts: 0,
  msg: '', winner: -1, f: [null, null], mprev: [null, null], cheer: 0, combo: { n: 0, t: 0, side: 0 }, ctd: 9, ctf: 0, toast: '', toastT: 0,
  perfect: [true, true], mirror: false, pts: [0, 0], golden: false, notice: { s: '', t: 0 }, koSlow: false
};
try { G.best = +localStorage.getItem('taekwon.best') || 0; } catch (e) {}
let projs = [], fx = [];

function go(scene) { G.scene = scene; G.t = 0; }
function toast(s) { G.toast = s; G.toastT = 120; }

/* ---------- 전투원 ---------- */
function mkFighter(i, ch, alt, ai, level) {
  const f = {
    i, ch, sc: ch.sc, pal: Object.assign({}, ch.pal, { guard: i === 0 ? '#2f62d6' : '#d6352f', guardDk: i === 0 ? '#1d3f94' : '#8f1f1c' }), ai: ai ? { plan: [], step: null, st: 0, blockT: 0, seen: null, low: false, delay: 20, parryAt: -1 } : null, level: level || 0,
    x: 0, y: 0, vx: 0, vy: 0, face: 1, maxhp: ch.hp, hp: ch.hp, hpShow: ch.hp, state: 'idle', t: 0, move: null, moveHit: false, contact: false,
    stun: 0, invuln: 0, flash: 0, combo: 0, comboTaken: 0, hist: [], buf: null, prevRaw: emptyRaw(), inp: { up: false, down: false, fwd: false, back: false, btn: [0, 0, 0, 0], pr: [0, 0, 0, 0] },
    airUsed: false, cb: false, anim: 0, lag: 0, wins: 0, moves: {}, dashCd: 0, lead: 'L', fk: 0, faked: 0, dnLen: 40, whiff: false, dir: 0, trail: [], ghosts: [], riposte: 0, chain: 0, dashWin: 0, dashDir: 0, edge: [false, false, false, false]
  };
  for (const k in MOVES) {
    const m = Object.assign({}, MOVES[k]); m.key = k;
    if (m.kind === 'p') m.su = Math.max(2, m.su + ch.pu); else m.su = Math.max(2, m.su + ch.ku);
    f.moves[k] = m;
  }
  return f;
}
const isCrouch = f => f.state === 'crouch' || f.state === 'getup' || (f.state === 'attack' && f.move && f.move.crouch && f.y === 0) || ((f.state === 'block' || f.state === 'hit') && f.cb && f.y === 0);
function matchSeq(h, groups, win) {
  let gi = groups.length - 1;
  for (let i = h.length - 1; i >= 0 && h.length - 1 - i < win; i--) {
    if (groups[gi].indexOf(h[i]) >= 0) { gi--; if (gi < 0) return true; }
  }
  return false;
}
const SEQ = {
  qcf: [[2, 1, 3], [3, 2], [6, 9, 3]],
  dp: [[6, 9, 3], [2, 1], [3, 2]],
  dashF: [[6, 9, 3], [5, 8, 2, 1, 4, 7], [6, 9, 3]],
  dashB: [[4, 7, 1], [5, 8, 2, 3, 6, 9], [4, 7, 1]]
};
function cmd(f, name) {
  if (f.inp.sp) return f.inp.sp === name;
  return matchSeq(f.hist, SEQ[name], name === 'dp' ? 18 : 16);
}
function resolveAction(f, o, k) {
  if (f.inp.btn[2] && f.inp.btn[3]) return pickStrong(zoneOf(Math.abs(o.x - f.x)), f.inp.up);
  const front = (k === 2) === (f.lead === 'L');
  return pickMove(front, zoneOf(Math.abs(o.x - f.x)), f.inp.fwd ? 1 : f.inp.back ? -1 : 0, f.inp.up);
}
function startMove(f, key, stepDir) {
  let m = f.moves[key];
  if (stepDir !== undefined && !m.strong) {
    /* 딛는 도중에 차는 큰 동작: 더 멀리, 더 세게, 대신 헛치면 더 크게 빈다 */
    m = Object.assign({}, m, {
      name: '스텝 ' + m.name, tag: '스텝', su: m.su + 2, dmg: Math.round(m.dmg * 1.3), hs: m.hs + 3, push: m.push + 1.5, wr: m.wr + 3, hstop: m.hstop + 2,
      lunge: m.lunge + (stepDir > 0 ? 5 : stepDir === 0 ? 2 : 0), box: [m.box[0], m.box[1], m.box[2] + (stepDir < 0 ? 7 : 3), m.box[3]]
    });
  }
  if (f.riposte > 0) {
    /* 흘리기에 성공한 직후의 반격: 더 빠르고 훨씬 세다 */
    m = Object.assign({}, m, { name: '반격 ' + m.name, tag: m.tag || '반격', su: Math.max(3, m.su - 3), dmg: Math.round(m.dmg * 1.5), hs: m.hs + 4, lunge: m.lunge + 3 });
    f.riposte = 0;
  }
  f.move = m; f.state = 'attack'; f.t = 0; f.moveHit = false; f.contact = false; f.lag = 0; f.whiff = false; f.chain = 0;
  if (m.sfx) sfx[m.sfx]();
  f.vx = m.lunge ? f.face * m.lunge : 0;
  if (m.jump) { f.vy = m.jump; f.y = 0.01; }
  if (m.jump || m.lunge >= 4) spark(f.x, GY, 'dust');
  if (m.tag) fx.push({ k: 'text', x: f.x, y: GY - 84, t: 0, max: 34, s: m.tag });
}

/* ---------- 충돌 ---------- */
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function hurtbox(f) {
  const s = f.sc; let h = 56; if (isCrouch(f)) h = 34; else if (f.y > 0) h = 48;
  return { x: f.x - 11 * s, y: GY - f.y - h * s, w: 22 * s, h: h * s };
}
function hitbox(f, m) {
  const s = f.sc, b = m.box, x0 = f.face > 0 ? f.x + b[0] * s : f.x - (b[0] + b[2]) * s;
  return { x: x0, y: GY - f.y + b[1] * s, w: b[2] * s, h: b[3] * s };
}
function canBlock(def, m) {
  if (!(def.state === 'idle' || def.state === 'walk' || def.state === 'crouch' || def.state === 'block')) return false;
  return !!def.inp.back;
}
function spark(x, y, kind) { fx.push({ k: kind, x, y, t: 0, max: kind === 'block' ? 9 : kind === 'dust' ? 14 : 11 }); }
function applyHit(att, def, m, dir, pos) {
  const chainHit = att.chain > 0 && def.state === 'hit';
  if ((def.invuln > 0 && !chainHit) || ['fall', 'down', 'ko', 'getup'].indexOf(def.state) >= 0) return 'none';
  /* 훼이크 버튼(A)을 맞는 순간에 맞춰 누른 경우 */
  if (def.state === 'fake' && def.t <= 17) {
    if (def.t <= 4) {
      att.state = 'stagger'; att.t = 0; att.stun = 34; att.move = null; att.vx = -dir * 0.5; att.moveHit = true;
      def.riposte = 50; def.invuln = Math.max(def.invuln, 8); def.vx = 0;
      spark(pos.x, pos.y, 'block'); sfx.block(); G.hitstop = Math.max(G.hitstop, 9);
      fx.push({ k: 'text', x: def.x, y: GY - 76, t: 0, max: 42, s: '흘리기!' });
      G.notice = { s: '흘리기!', t: 40 };
      return 'parry';
    }
    def.hp = Math.max(1, def.hp - Math.max(1, Math.round(m.dmg * att.ch.dmg * 0.15)));
    def.vx = dir * m.push * 0.5; att.vx = -dir * 1.2;
    spark(pos.x, pos.y, 'block'); sfx.block(); G.hitstop = Math.max(G.hitstop, 3);
    fx.push({ k: 'text', x: def.x, y: GY - 66, t: 0, max: 30, s: '방어' });
    return 'block';
  }
  if (canBlock(def, m)) {
    def.state = 'block'; def.t = 0; def.stun = m.bs; def.cb = def.inp.down; def.move = null; def.vx = dir * m.push * 0.9;
    att.vx = -dir * Math.max(1, m.push * 0.35);
    spark(pos.x, pos.y, 'block'); sfx.block(); G.hitstop = Math.max(G.hitstop, 3);
    fx.push({ k: 'text', x: def.x, y: GY - 66, t: 0, max: 30, s: '막음' });
    return 'block';
  }
  /* 정타: 상대가 발을 내려고 하는 순간, 발을 거두는 순간, 다가오는 순간에 맞춘 경우 */
  const dStart = def.state === 'attack' && def.move && def.t < def.move.su;
  const dRec = def.state === 'attack' && def.move && def.t >= def.move.su + def.move.ac;
  const dStep = def.state === 'dash' && def.dir > 0;
  const dStag = def.state === 'stagger';
  const op = def.state === 'attack' && def.move ? def.move.open : '';
  const dOpen = (op === 'head' && m.head) || (op === 'body' && !m.head) || (op === 'back');
  const clean = !!(dStart || dRec || dStep || dStag || dOpen);
  const pts = m.pts + (clean ? 1 : 0);
  const ko = clean && m.head;
  let dmg = Math.max(1, Math.round(m.dmg * att.ch.dmg * (clean ? 1.7 : 1)));
  def.hp = ko ? 0 : Math.max(0, def.hp - dmg);
  G.pts[att.i] += pts; G.perfect[def.i] = false;
  def.cb = isCrouch(def) && def.y === 0;
  def.move = null; def.moveHit = false; def.flash = 3; def.t = 0; def.buf = null;
  const down = m.head || ko || def.hp <= 0 || (clean && m.spin) || m.knock;
  if (down) {
    def.state = 'fall'; def.dnLen = 40; def.vx = dir * (1.7 + m.push * 0.4); def.vy = 3.4 + (ko ? 1.2 : 0); def.y = 0.01;
  } else {
    def.state = 'hit'; def.stun = m.hs + (clean ? 8 : 0); def.vx = dir * (m.push + (clean ? 1.5 : 0));
    def.invuln = def.stun + 6;
    if (def.x < WL + 24 || def.x > WR - 24) att.vx = -dir * m.push * 0.8;
  }
  const big = clean || m.head;
  spark(pos.x, pos.y, big ? 'big' : 'hit'); (big ? sfx.heavy : sfx.hit)();
  G.hitstop = Math.max(G.hitstop, clean ? 12 : (m.hstop || 5)); G.shake = big ? 6 : 2; G.cheer = 24;
  const label = (m.strong ? '강타! ' : '') + (clean ? (dOpen ? '허점! ' : '정타! ') : '') + (m.head ? (m.spin ? '회전 얼굴' : '얼굴') : (m.spin ? '회전 몸통' : '몸통')) + ' +' + pts;
  fx.push({ k: 'text', x: def.x, y: GY - 74, t: 0, max: 55, s: label });
  if (ko) { G.notice = { s: '정타 케이오!', t: 70 }; }
  if (G.mode === 1 && att.i === 0) G.score += pts * 100 + (clean ? 300 : 0) + (m.head ? 200 : 0);
  return 'hit';
}
function resolveHits() {
  const cand = [];
  for (let i = 0; i < 2; i++) {
    const a = G.f[i], d = G.f[1 - i];
    if (a.state === 'attack' && a.move && a.move.box && !a.moveHit && a.t >= a.move.su && a.t < a.move.su + a.move.ac) {
      const hb = hitbox(a, a.move), hu = hurtbox(d);
      if (overlap(hb, hu)) {
        const ox = Math.max(hb.x, hu.x), ow = Math.min(hb.x + hb.w, hu.x + hu.w), oy = Math.max(hb.y, hu.y), oh = Math.min(hb.y + hb.h, hu.y + hu.h);
        cand.push([a, d, { x: (ox + ow) / 2, y: (oy + oh) / 2 }, a.move]);
      }
    }
  }
  for (const [a, d, pos, mvv] of cand) {
    const r = applyHit(a, d, mvv, a.face, pos);
    if (r !== 'none') { a.moveHit = true; a.contact = true; }
  }
  for (const p of projs) {
    const d = G.f[1 - p.owner];
    const hb = { x: p.x - 7, y: GY - p.y - 7, w: 14, h: 14 };
    if (overlap(hb, hurtbox(d))) {
      const m = { dmg: p.dmg, hs: p.hs, bs: p.bs, push: 2.5, type: 'mid', kd: false, special: true, hstop: 6 };
      const r = applyHit(G.f[p.owner], d, m, p.vx > 0 ? 1 : -1, { x: p.x, y: GY - p.y });
      if (r !== 'none') p.dead = true;
    }
  }
  for (let i = 0; i < projs.length; i++) for (let j = i + 1; j < projs.length; j++) {
    const a = projs[i], b = projs[j];
    if (a.owner !== b.owner && Math.abs(a.x - b.x) < 12 && Math.abs(a.y - b.y) < 12) { a.dead = b.dead = true; spark(a.x, GY - a.y, 'block'); }
  }
  projs = projs.filter(p => !p.dead);
}
function separate(a, b) {
  const st = ['down', 'ko', 'fall'];
  if (st.indexOf(a.state) >= 0 || st.indexOf(b.state) >= 0) return;
  if (Math.abs(a.y - b.y) > 30) return;
  if (a.y > 8 && b.y > 8) return;
  const dx = b.x - a.x, min = 20;
  if (Math.abs(dx) < min) {
    const push = min - Math.abs(dx), dir = dx > 0 ? 1 : dx < 0 ? -1 : (a.face > 0 ? 1 : -1);
    a.x -= dir * push / 2; b.x += dir * push / 2;
    a.x = clamp(a.x, WL, WR); b.x = clamp(b.x, WL, WR);
    const d2 = Math.abs(b.x - a.x);
    if (d2 < min) { const r = min - d2; if (a.x <= WL + 0.1) b.x += r; else if (b.x >= WR - 0.1) a.x -= r; else if (a.x >= WR - 0.1) b.x -= r; else if (b.x <= WL + 0.1) a.x += r; }
  }
}

/* ---------- 전투원 한 프레임 ---------- */
function startDash(f, dir) {
  f.state = 'dash'; f.t = 0; f.dir = dir; f.move = null; f.dashCd = 26;
  f.vx = (dir > 0 ? 3.4 : -3.2) * f.face; spark(f.x, GY, 'dust');
  if (dir < 0) f.invuln = Math.max(f.invuln, 6);
}
function startSwitch(f) { f.state = 'dash'; f.t = 0; f.dir = 0; f.move = null; f.dashCd = 22; f.vx = 0; }
function startFake(f, dv) {
  f.state = 'fake'; f.t = 0; f.fk = dv; f.move = null; f.buf = null; f.faked = 26;
  f.vx = dv > 0 ? f.face * 1.8 : dv < 0 ? -f.face * 1.6 : 0;
}
/* 딛기 뒤에 나가는 기술: 백스텝 뒤 뒷발은 카운터 뒤차기, 앞발은 회축 / 스텝 인 뒤 뒷발은 턴차기, 앞발은 돌진 옆차기 */
function specialKey(f, o, dir) {
  const b = f.buf;
  if (b.mv) return b.mv;
  if (f.inp.btn[2] && f.inp.btn[3]) return pickStrong(zoneOf(Math.abs(o.x - f.x)), f.inp.up);
  const front = (b.k === 2) === (f.lead === 'L'), up = f.inp.up;
  if (dir < 0) return front ? (up ? 'hHW' : 'HW') : (up ? 'hCB' : 'CB');
  return front ? (up ? 'hY' : 'Y') : (up ? 'hTK' : 'TK');
}
function penalty(f, o, txt) {
  G.pts[o.i] += 1; G.perfect[f.i] = false;
  fx.push({ k: 'text', x: f.x, y: GY - 74, t: 0, max: 55, s: txt + ' +1' });
  G.notice = { s: txt, t: 60 };
}
function stepFighter(f, o, raw) {
  const prev = f.prevRaw;
  const inp = {
    up: !!raw.u, down: !!raw.d, fwd: f.face > 0 ? !!raw.r : !!raw.l, back: f.face > 0 ? !!raw.l : !!raw.r,
    btn: raw.btn.map(Boolean), pr: raw.btn.map((b, k) => (!!b && !prev.btn[k]) || !!f.edge[k]), sp: raw.sp || null, mv: raw.mv || null
  };
  f.prevRaw = { l: raw.l, r: raw.r, u: raw.u, d: raw.d, btn: raw.btn.slice() };
  f.edge = [false, false, false, false];
  f.inp = inp;
  const pk = inp.pr[2] ? 2 : inp.pr[3] ? 3 : -1;
  if (inp.mv) f.buf = { mv: inp.mv, t: 8 };
  else if (pk >= 0) f.buf = { k: pk, t: 8 };
  else if (f.buf) { f.buf.t--; if (f.buf.t <= 0) f.buf = null; }
  if (f.invuln > 0) f.invuln--;
  if (f.flash > 0) f.flash--;
  if (f.dashCd > 0) f.dashCd--;
  if (f.faked > 0) f.faked--;
  if (f.riposte > 0) f.riposte--;
  if (f.dashWin > 0) f.dashWin--;
  f.anim++;
  const q = !inp.sp && inp.pr[0];
  const wantIn = inp.sp === 'dashF' || (q && inp.fwd);
  const wantOut = inp.sp === 'dashB' || (q && inp.back);
  const wantSw = inp.sp === 'switch' || (q && !inp.fwd && !inp.back);
  const wantFake = !!inp.pr[1];
  const kickKey = () => { const key = f.buf.mv || resolveAction(f, o, f.buf.k); f.buf = null; return key; };
  let landed = false;

  switch (f.state) {
    case 'idle': case 'walk': case 'crouch': {
      f.face = o.x >= f.x ? 1 : -1;
      inp.fwd = f.face > 0 ? !!raw.r : !!raw.l; inp.back = f.face > 0 ? !!raw.l : !!raw.r;
      /* 풋워크 버튼과 차기를 같이 누르면 딛고 나가며 차는 큰 동작 (딛기를 먼저 시작하고 차기는 이어서) */
      if (f.dashCd <= 0 && wantIn) { startDash(f, 1); break; }
      if (f.dashCd <= 0 && wantOut) { startDash(f, -1); break; }
      if (f.dashCd <= 0 && wantSw) { startSwitch(f); break; }
      if (f.buf && f.dashWin > 0 && f.dashDir !== 0) { const dd = f.dashDir; f.dashWin = 0; startMove(f, specialKey(f, o, dd)); f.buf = null; break; }
      if (f.buf) { startMove(f, kickKey()); break; }
      if (wantFake) { startFake(f, inp.fwd ? 1 : inp.back ? -1 : 0); break; }
      if (inp.down) { f.state = 'crouch'; f.vx = 0; }
      else if (inp.fwd || inp.back) { f.state = 'walk'; f.vx = (inp.fwd ? f.ch.walk : -f.ch.back) * f.face; f.t++; if (f.anim % 13 === 0) spark(f.x - f.face * 4, GY, 'dust'); }
      else { f.state = 'idle'; f.vx = 0; }
      break;
    }
    case 'dash': {
      /* 딛는 도중에는 바로 차기로 이어갈 수 있다 (빠른 발 딛기, 나래 딛기) */
      const okT = f.dir > 0 ? 4 : f.dir < 0 ? 5 : 5;
      if (f.buf && f.t >= okT) {
        const pv = f.vx, dd = f.dir;
        if (dd !== 0) { startMove(f, specialKey(f, o, dd)); f.buf = null; }
        else { startMove(f, kickKey(), dd); f.vx += pv * 0.6; }
        break;
      }
      f.t++; f.vx *= 0.93;
      if (f.dir === 0 && f.t === 5) f.lead = f.lead === 'L' ? 'R' : 'L';
      if (f.t >= (f.dir === 0 ? 10 : 13)) { f.state = 'idle'; f.vx = 0; f.dashWin = f.dir !== 0 ? 10 : 0; f.dashDir = f.dir; }
      break;
    }
    case 'fake': {
      if (f.buf && f.t >= 3) { startMove(f, kickKey()); break; }
      f.t++; f.vx *= 0.88;
      if (f.t >= 18) { f.state = 'idle'; f.vx = 0; }
      break;
    }
    case 'attack': {
      let m = f.move;
      /* 막 차기 시작한 순간 다른 발 버튼도 눌리면 강한 기술로 바뀐다 */
      if (!m.strong && f.t <= 3 && inp.btn[2] && inp.btn[3] && (inp.pr[2] || inp.pr[3])) {
        const sk = pickStrong(zoneOf(Math.abs(o.x - f.x)), inp.up), sm = f.moves[sk];
        f.move = m = sm; f.moveHit = false; f.vx = sm.lunge ? f.face * sm.lunge : 0;
        if (sm.jump) { f.vy = sm.jump; f.y = 0.01; }
        fx.push({ k: 'text', x: f.x, y: GY - 84, t: 0, max: 34, s: sm.tag });
      }
      /* 나래차기: 돌려차기를 차고 바로 반대발 버튼을 누르면 빠르게 이어 찬다 */
      if (m.leg && f.chain < 2 && f.t >= m.su && f.t <= m.su + m.ac + 5) {
        const fb = f.lead === 'L' ? 2 : 3, rb = f.lead === 'L' ? 3 : 2;
        const want = m.leg === 'f' ? (inp.pr[rb] || inp.mv === 'nB') : (inp.pr[fb] || inp.mv === 'nF');
        if (want) {
          const key = (inp.up ? 'nh' : 'n') + (m.leg === 'f' ? 'B' : 'F'), c2 = f.moves[key];
          f.move = m = c2; f.t = 0; f.moveHit = false; f.contact = false; f.whiff = false; f.chain++; f.buf = null; f.vx = f.face * 1.5;
          sfx.swing(); fx.push({ k: 'text', x: f.x, y: GY - 84, t: 0, max: 30, s: '나래' + (f.chain > 1 ? ' x' + (f.chain + 1) : '') });
        }
      }
      /* 훼이크: 발이 나가기 전에 A를 누르면 차기를 접고, 뒤로 딛으면 빠진다 */
      if (f.t < m.su - 1 && wantFake) { f.move = null; startFake(f, 0); f.t = 3; break; }
      if (f.t < m.su - 1 && f.dashCd <= 0 && wantOut) { startDash(f, -1); break; }
      f.vx *= 0.7;
      f.t++;
      if (f.t === m.su + m.ac && !f.moveHit && !f.contact) {
        f.whiff = true;
        if (m.bal === 2) {
          f.state = 'fall'; f.t = 0; f.move = null; f.vy = 2.4; f.y = 0.01; f.vx = f.face * 1.0; f.dnLen = 16;
          penalty(f, o, '넘어짐 감점'); break;
        }
        if (m.bal === 1) { f.state = 'stagger'; f.t = 0; f.move = null; f.stun = m.wr + 10; f.vx = f.face * 0.8; break; }
      }
      if (f.t >= m.su + m.ac + m.rc + (f.whiff ? m.wr : 0)) { f.state = 'idle'; f.move = null; f.vx = 0; }
      break;
    }
    case 'stagger': { f.t++; f.vx *= 0.8; if (f.t >= f.stun) { f.state = 'idle'; f.vx = 0; } break; }
    case 'hit': case 'block': {
      f.t++; f.vx *= 0.82;
      if (f.t >= f.stun) { f.state = isCrouch(f) && inp.down ? 'crouch' : 'idle'; f.vx = 0; }
      break;
    }
    case 'fall': { f.t++; break; }
    case 'down': { f.t++; if (f.hp > 0 && f.t >= f.dnLen) { f.state = 'getup'; f.t = 0; f.invuln = 20; } break; }
    case 'getup': { f.t++; if (f.t >= 14) { f.state = 'idle'; f.t = 0; } break; }
    case 'ko': case 'win': { f.t++; break; }
  }

  /* 물리 */
  if (f.y > 0 || f.vy > 0) {
    f.vy -= GRAV; f.y += f.vy;
    if (f.y <= 0) { f.y = 0; f.vy = 0; landed = true; }
  }
  f.x += f.vx;
  if (f.state === 'down' || f.state === 'ko') f.vx *= 0.85;
  f.x = clamp(f.x, WL, WR);
  if (landed) {
    spark(f.x, GY, 'dust'); sfx.land();
    if (f.state === 'fall') { f.state = f.hp <= 0 ? 'ko' : 'down'; f.t = 0; f.vx *= 0.5; G.shake = Math.max(G.shake, 3); }
  }
}

/* ---------- 컴퓨터 상대 ---------- */
function aiRaw(f, o) {
  const a = f.ai, L = f.level;
  const R0 = emptyRaw();
  const dx = o.x - f.x, dist = Math.abs(dx), fk = dx > 0 ? 'r' : 'l', bk = dx > 0 ? 'l' : 'r';
  const oAct = o.state === 'attack' && o.move;
  const oStart = oAct && o.t < o.move.su, oRec = oAct && o.t >= o.move.su + o.move.ac;
  const oDown = ['hit', 'fall', 'down', 'ko', 'getup'].indexOf(o.state) >= 0;
  const feinting = o.state === 'fake' || o.faked > 0;
  /* 막기와 피하기 */
  if (oAct && o.move !== a.seen) {
    a.seen = o.move;
    if (dist < 82 && Math.random() < [0.3, 0.5, 0.7][L]) {
      if (Math.random() < [0.2, 0.3, 0.4][L]) { a.parryAt = Math.max(0, o.move.su - 2 - Math.floor(rnd(0, [8, 5, 3][L]))); a.blockT = 0; }
      else if (Math.random() < [0.15, 0.25, 0.35][L] && f.dashCd <= 0) { a.plan = [{ sp: 'dashB', t: 12 }]; a.step = null; a.blockT = 0; }
      else { a.blockT = o.move.su + o.move.ac + 4; a.duck = !!o.move.head && Math.random() < 0.6; }
    }
  }
  if (!oAct) { a.seen = null; a.parryAt = -1; }
  if (a.parryAt >= 0 && oAct && o.t >= a.parryAt && ['idle', 'walk', 'crouch'].indexOf(f.state) >= 0) { a.parryAt = -1; const r = emptyRaw(); r.btn[1] = true; return r; }
  /* 훼이크에 낚이기 */
  if (feinting && !a.fseen) { a.fseen = true; if (dist < 90 && Math.random() < [0.25, 0.45, 0.65][L]) { a.blockT = 16; a.duck = false; a.plan = []; a.step = null; } }
  if (!feinting) a.fseen = false;
  if (a.blockT > 0 && ['idle', 'walk', 'crouch', 'block'].indexOf(f.state) >= 0) { a.blockT--; R0[bk] = true; if (a.duck) R0.d = true; return R0; }
  const free = ['idle', 'walk', 'crouch'].indexOf(f.state) >= 0;
  if (!free && f.state !== 'dash' && f.state !== 'fake') { a.step = null; return R0; }
  /* 정해 둔 동작 이어가기 */
  if (!a.step && a.plan.length) { a.step = a.plan.shift(); a.st = 0; }
  if (a.step) {
    const s = a.step, r = emptyRaw();
    if (s.fk) r[fk] = true; if (s.bk) r[bk] = true; if (s.u) r.u = true; if (s.d) r.d = true;
    if (a.st === 0 && s.sp) r.sp = s.sp;
    if (a.st === 0 && s.mv) r.mv = s.mv;
    if (a.st === 0 && s.fake) r.btn[1] = true;
    a.st++;
    if (a.st >= (s.t || 1)) { a.step = null; if (!a.plan.length) a.delay = Math.round(rnd(0.6, 1.3) * [26, 16, 8][L]); }
    return r;
  }
  if (!free) return R0;
  if (a.delay > 0) { a.delay--; return R0; }
  /* 새로운 판단 */
  const rr = Math.random(), P_ = [];
  const atk = (key, t) => ({ mv: key, t: t || 1 });
  const upq = () => L > 0 && Math.random() < [0, 0.25, 0.4][L];
  const kickAt = d => pickMove(Math.random() < 0.5, zoneOf(Math.max(20, d)), 0, upq());
  const canDash = f.dashCd <= 0;
  if (f.riposte > 0 && dist < 90) {                                                       /* 흘리기 성공 뒤 반격 */
    if (dist > 56 && canDash) P_.push({ sp: 'dashF', t: 5 }, atk(kickAt(dist - 16), 22)); else P_.push(atk(kickAt(dist), 22));
  } else if ((oRec || o.state === 'stagger') && dist < 84 && rr < [0.5, 0.75, 0.95][L]) {      /* 상대 발이 돌아오는 틈, 휘청이는 틈 */
    if (dist > 56 && canDash) P_.push({ sp: 'dashF', t: 5 }, atk(kickAt(dist - 16), 22));
    else P_.push(atk(kickAt(dist), 22));
  } else if (oStart && dist < 56 && rr < [0.1, 0.22, 0.35][L]) {                         /* 발이 나가려는 순간 끊기 */
    P_.push(atk(Math.random() < 0.5 ? 'A' : 'F', 12));
  } else if (o.state === 'dash' && o.dir > 0 && dist < 80 && rr < [0.2, 0.4, 0.6][L]) {   /* 들어오는 발 */
    P_.push(atk('A', 16));
  } else if (oDown && dist < 90) {
    P_.push({ fk: true, t: 6 });
  } else if (dist > 100) {
    if (rr < 0.35 && canDash) P_.push({ sp: 'dashF', t: 12 });
    else if (rr < 0.85) P_.push({ fk: true, t: Math.round(rnd(8, 22)) });
    else P_.push({ t: 10 });
  } else if (dist > 62) {
    if (rr < 0.25) P_.push({ fk: true, t: Math.round(rnd(4, 10)) });
    else if (rr < 0.4) P_.push({ bk: true, t: Math.round(rnd(4, 10)) });
    else if (rr < 0.6 && canDash) P_.push({ sp: 'dashF', t: 5 }, atk(kickAt(dist - 16), 22));
    else if (rr < 0.72 && L > 0) P_.push({ fake: true, t: 5 }, { sp: 'dashF', t: 5 }, atk(kickAt(dist - 16), 22));
    else if (rr < 0.8 && canDash) P_.push({ sp: 'switch', t: 10 });
    else if (rr < 0.84 && L > 0 && canDash) P_.push({ sp: 'dashF', t: 5 }, atk(Math.random() < 0.5 ? 'TK' : 'Y', 34));
    else if (rr < 0.88 && L > 0 && dist < 70) P_.push(atk(upq() ? 'hJ' : 'J', 30));
    else P_.push({ t: Math.round(rnd(6, 14)) });
  } else {
    if (rr < 0.3) P_.push(atk(kickAt(dist), 24));
    else if (rr < 0.45) P_.push(atk(Math.random() < 0.5 ? 'A' : 'F', 18), atk(kickAt(dist), 24));
    else if (rr < 0.5 && L > 0) P_.push(atk('F', 9), atk('nB', 16));
    else if (rr < 0.56 && L > 0) P_.push({ fake: true, t: 5 }, atk(kickAt(dist), 24));
    else if (rr < 0.6 && L > 0 && canDash) P_.push({ sp: 'dashB', t: 6 }, atk(L > 1 && Math.random() < 0.4 ? 'HW' : 'CB', 34));
    else if (rr < 0.64 && canDash) P_.push({ sp: 'switch', t: 7 }, atk(kickAt(dist), 24));
    else if (rr < 0.7 && L > 0) P_.push(atk(pickStrong(zoneOf(dist), upq()), 34));
    else if (rr < 0.84 && canDash) P_.push({ sp: 'dashB', t: 12 });
    else { a.blockT = 18; a.duck = false; }
  }
  a.plan = P_; a.delay = 2;
  return R0;
}

/* ---------- 그리기: 인물 ---------- */
function seg(a, b, w, col) {
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))));
  c.fillStyle = col; w = Math.max(1, Math.round(w));
  for (let i = 0; i <= n; i++) c.fillRect(Math.round(a[0] + dx * i / n - w / 2), Math.round(a[1] + dy * i / n - w / 2), w, w);
}
function drawFigure(px, py, face, pose, ch, pal, sc, flash, anim) {
  const J = i => [px + face * pose[i] * sc, py + pose[i + 1] * sc];
  const hip = J(0), neck = J(2), head = J(4), fe = J(6), fh = J(8), be = J(10), bh = J(12), fk = J(14), ff = J(16), bk = J(18), bf = J(20);
  const sh = [neck[0], neck[1] + 3 * sc];
  const lw = ch.limb * sc, tw = ch.tors * sc, hs = Math.round(ch.head * sc);
  const OUT = '#16121c', white = '#ffffff';
  const gd = pal.guard || '#2f62d6', gdd = pal.guardDk || '#1d3f94';
  const col = k => flash ? white : pal[k], G1 = flash ? white : gd, G2 = flash ? white : gdd;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  /* 그림자 */
  const ga0 = c.globalAlpha; c.globalAlpha = ga0 * 0.28; R(px - 14 * sc, GY - 1, 28 * sc, 3, '#000'); c.globalAlpha = ga0;
  /* 윤곽 */
  seg(sh, be, lw + 2, OUT); seg(be, bh, lw + 1, OUT);
  seg(hip, bk, lw + 3, OUT); seg(bk, bf, lw + 2, OUT);
  seg(hip, neck, tw + 4, OUT);
  seg(hip, fk, lw + 3, OUT); seg(fk, ff, lw + 2, OUT);
  c.fillStyle = OUT; c.fillRect(Math.round(head[0] - hs / 2 - 1), Math.round(head[1] - hs / 2 - 1), hs + 2, hs + 2);
  seg(sh, fe, lw + 2, OUT); seg(fe, fh, lw + 1, OUT);
  c.fillStyle = OUT;
  const footRect = p => { const x0 = face > 0 ? p[0] - 2 * sc : p[0] - 5 * sc; c.fillRect(Math.round(x0 - 1), Math.round(p[1] - 3 * sc - 1), Math.round(7 * sc + 2), Math.round(4 * sc + 2)); };
  footRect(bf); footRect(ff);
  /* 채우기: 도복 위에 보호대(호구, 팔, 정강이, 발등, 헤드기어) */
  const arm = (e, h) => {
    seg(sh, e, lw, col('gi')); seg(e, h, lw - 1, col('skin')); seg(mix(e, h, 0.3), h, lw, G1);
    c.fillStyle = G2; c.fillRect(Math.round(h[0] - lw / 2 - 1), Math.round(h[1] - lw / 2 - 1), Math.round(lw + 1), Math.round(lw + 1));
  };
  const leg = (k, f2) => { seg(hip, k, lw + 1, col('pants')); seg(k, f2, lw, col('pants')); seg(mix(k, f2, 0.3), mix(k, f2, 0.88), lw, G1); };
  const shoe = p => { c.fillStyle = G2; const x0 = face > 0 ? p[0] - 2 * sc : p[0] - 5 * sc; c.fillRect(Math.round(x0), Math.round(p[1] - 3 * sc), Math.round(7 * sc), Math.round(3 * sc)); };
  arm(be, bh);
  leg(bk, bf); shoe(bf);
  seg(hip, neck, tw, col('gi'));
  const bw = Math.round(tw + 2), bx = Math.round(hip[0] - bw / 2), by = Math.round(hip[1] - 2 * sc);
  c.fillStyle = col('belt1'); c.fillRect(bx, by, Math.round(bw / 2), Math.round(3 * sc));
  c.fillStyle = col('belt2'); c.fillRect(bx + Math.round(bw / 2), by, bw - Math.round(bw / 2), Math.round(3 * sc));
  const g0 = mix(hip, neck, 0.2), g1 = mix(hip, neck, 0.93);
  seg(g0, g1, tw + 2, G1); seg(g0, g1, 1, G2);
  leg(fk, ff); shoe(ff);
  /* 머리와 헤드기어 */
  const hx = Math.round(head[0] - hs / 2), hy = Math.round(head[1] - hs / 2), gh = Math.round(hs * 0.45);
  c.fillStyle = col('skin'); c.fillRect(hx, hy, hs, hs);
  c.fillStyle = G1; c.fillRect(hx, hy, hs, gh);
  const back = face > 0 ? hx : hx + hs - 3;
  c.fillRect(back, hy, 3, Math.round(hs * 0.95));
  c.fillStyle = G2; c.fillRect(hx, hy + gh - 1, hs, 1);
  if (ch.pony) { const sw = Math.sin(anim / 6) * 2, bx2 = face > 0 ? hx : hx + hs; seg([bx2 - face * 1, hy + 2], [bx2 - face * (5 + sw), head[1] + 3], 3, col('hair')); }
  if (!flash) {
    c.fillStyle = '#1a1620';
    c.fillRect(Math.round(head[0] + face * hs * 0.22 - (face < 0 ? 1 : 0)), Math.round(head[1] + 0.5), 2, 2);
    c.fillStyle = '#b8665a'; c.fillRect(Math.round(head[0] + face * hs * 0.25 - (face < 0 ? 1 : 0)), Math.round(head[1] + hs * 0.3), 3, 1);
  }
  arm(fe, fh);
}
function curPose(f) {
  switch (f.state) {
    case 'idle': { const bn = Math.abs(Math.sin(f.anim * 0.16)); return lerpPose(POSE.idle0, POSE.idle1, bn * bn * (3 - 2 * bn)); }
    case 'walk': return walkPose(f.anim * 0.5 * (f.vx * f.face >= 0 ? 1 : -1));
    case 'crouch': return POSE.crouch;
    case 'dash': return f.dir > 0 ? POSE.dashF : f.dir < 0 ? POSE.dashB : lerpPose(POSE.idle0, POSE.switchM, Math.sin(Math.min(1, f.t / 10) * Math.PI));
    case 'fake': {
      const w = Math.sin(Math.min(1, f.t / 18) * Math.PI);
      return f.fk > 0 ? lerpPose(POSE.idle0, POSE.crouch, w * 0.85) : f.fk < 0 ? lerpPose(POSE.idle0, POSE.dashB, w) : lerpPose(POSE.idle0, POSE.guardF, Math.min(1, w * 1.4));
    }
    case 'stagger': return lerpPose(POSE.hit1, POSE.idle0, clamp(f.t / Math.max(1, f.stun), 0, 1));
    case 'hit': return f.t < f.stun * 0.5 ? POSE.hit1 : POSE.hit0;
    case 'block': return f.cb ? POSE.blockC : POSE.block;
    case 'fall': return POSE.fall;
    case 'down': case 'ko': return POSE.down;
    case 'getup': return lerpPose(POSE.crouch, POSE.idle0, f.t / 14);
    case 'win': return lerpPose(POSE.idle0, POSE.win, Math.min(1, f.t / 12));
    case 'attack': {
      const m = f.move, t = f.t, ph = t < m.su ? 0 : t < m.su + m.ac ? 1 : 2;
      const base = POSE[m.base], s = POSE[m.pose[0]], a = POSE[m.pose[1]];
      if (ph === 0) { const u = clamp((t + 1) / Math.max(1, m.su), 0, 1); return lerpPose(base, s, 1 - Math.pow(1 - u, 2.2)); }
      if (ph === 1) { const u = clamp((t - m.su + 1) / 1.4, 0, 1); return lerpPose(s, a, 1 - Math.pow(1 - u, 3)); }
      const u = clamp((t - m.su - m.ac) / Math.max(1, m.rc + (f.whiff ? m.wr : 0)), 0, 1);
      if (u < 0.3) return lerpPose(a, s, u / 0.3);
      const w = (u - 0.3) / 0.7; return lerpPose(s, base, w * w * (3 - 2 * w));
    }
  }
  return POSE.idle0;
}
function visualUpdate(f) {
  const m = f.move;
  if (f.state === 'attack' && m && f.t >= m.su - 2 && f.t < m.su + m.ac + 5) {
    const p = curPose(f), b0 = POSE.idle0;
    const d1 = Math.abs(p[16] - b0[16]) + Math.abs(p[17] - b0[17]), d2 = Math.abs(p[20] - b0[20]) + Math.abs(p[21] - b0[21]), j = d1 >= d2 ? 16 : 20;
    f.trail.push([f.x + f.face * p[j] * f.sc, GY - f.y + p[j + 1] * f.sc]);
    if (f.trail.length > 6) f.trail.shift();
  } else if (f.trail.length) f.trail.shift();
  const fast = (f.state === 'dash' && f.dir !== 0 && f.t < 9) || (f.state === 'attack' && m && (m.lunge >= 4 || m.jump) && f.t < m.su + m.ac);
  if (fast && f.anim % 2 === 0) f.ghosts.push({ x: f.x, y: GY - f.y, face: f.face, pose: curPose(f), life: 7 });
  for (const g of f.ghosts) g.life--;
  f.ghosts = f.ghosts.filter(g => g.life > 0);
}
function renderFighter(f) {
  for (const g of f.ghosts) { c.globalAlpha = 0.3 * g.life / 7; drawFigure(g.x, g.y, g.face, g.pose, f.ch, f.pal, f.sc, true, 0); }
  c.globalAlpha = 1;
  if (Math.abs(f.vx) > 2.2 && f.state !== 'hit' && f.state !== 'fall') {
    const dr = f.vx > 0 ? 1 : -1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = 0.45 - k * 0.1; R(f.x - dr * (16 + k * 7) - (dr > 0 ? 12 : 0), GY - 14 - k * 15 - (f.anim * 3 % 5), 12, 1, '#ffffff'); }
    c.globalAlpha = 1;
  }
  const bn = f.state === 'idle' ? Math.abs(Math.sin(f.anim * 0.16)) : 0;
  const hop = f.state === 'idle' ? bn * 2.5 : f.state === 'dash' ? Math.sin(Math.min(1, f.t / (f.dir === 0 ? 10 : 13)) * Math.PI) * (f.dir === 0 ? 4 : 7) : 0;
  const wob = f.state === 'stagger' ? Math.sin(f.t * 0.9) * 1.6 : 0;
  drawFigure(f.x + wob, GY - f.y - hop, f.face, curPose(f), f.ch, f.pal, f.sc, f.flash > 0, f.anim);
  const tr = f.trail;
  for (let i = 1; i < tr.length; i++) {
    const u = i / tr.length; c.globalAlpha = 0.15 + 0.65 * u;
    seg(tr[i - 1], tr[i], 1 + Math.round(u * 3), u > 0.6 ? '#ffffff' : '#bfe4ff');
  }
  c.globalAlpha = 1;
}

/* ---------- 그리기: 무대 ---------- */
const stageCache = [];
function makeStage(idx) {
  const off = document.createElement('canvas'); off.width = W * SC; off.height = H * SC;
  const prev = c; // 임시로 그리기 대상 교체
  const oc = off.getContext('2d'); oc.scale(SC, SC); oc.imageSmoothingEnabled = false;
  return { off, oc };
}
const STAGES = [{ name: '새싹 태권도장' }, { name: '아파트 옥상' }];
function paintStage(idx) {
  const rect = (x, y, w, h, col) => { ctx2.fillStyle = col; ctx2.fillRect(x, y, w, h); };
  let ctx2;
  const off = document.createElement('canvas'); off.width = W * SC; off.height = H * SC;
  ctx2 = off.getContext('2d'); ctx2.scale(SC, SC);
  if (idx === 0) {
    rect(0, 0, W, 152, '#dcc79e');
    for (let x = 0; x < W; x += 20) rect(x, 18, 1, 94, '#c9b184');
    rect(0, 0, W, 18, '#8a6a45'); rect(0, 18, W, 2, '#5f4529');
    rect(0, 112, W, 40, '#9b7248'); for (let x = 0; x < W; x += 16) rect(x, 112, 1, 40, '#84613c');
    rect(0, 110, W, 3, '#5f4529');
    /* 창문 빛 */
    for (const wx of [18, 262]) { rect(wx, 30, 40, 48, '#6e5434'); rect(wx + 3, 33, 34, 42, '#cfe6f4'); rect(wx + 19, 33, 2, 42, '#6e5434'); rect(wx + 3, 53, 34, 2, '#6e5434'); rect(wx + 3, 33, 34, 8, '#e8f4fa'); }
    /* 태극기 */
    rect(124, 26, 72, 48, '#5f4529'); rect(126, 28, 68, 44, '#f4f1e8');
    ctx2.fillStyle = '#c8312f'; ctx2.beginPath(); ctx2.arc(160, 50, 11, Math.PI, 0); ctx2.fill();
    ctx2.fillStyle = '#2b4a9a'; ctx2.beginPath(); ctx2.arc(160, 50, 11, 0, Math.PI); ctx2.fill();
    ctx2.fillStyle = '#c8312f'; ctx2.beginPath(); ctx2.arc(155.5, 50, 5.5, Math.PI, 0); ctx2.fill();
    ctx2.fillStyle = '#2b4a9a'; ctx2.beginPath(); ctx2.arc(164.5, 50, 5.5, 0, Math.PI); ctx2.fill();
    const tri = (x, y, lines) => { lines.forEach((b, i) => { if (b) rect(x, y + i * 4, 10, 2, '#1c1c22'); else { rect(x, y + i * 4, 4, 2, '#1c1c22'); rect(x + 6, y + i * 4, 4, 2, '#1c1c22'); } }); };
    tri(131, 32, [1, 1, 1]); tri(179, 32, [0, 0, 0]); tri(131, 56, [1, 0, 1]); tri(179, 56, [0, 1, 0]);
    /* 현판 */
    rect(120, 82, 80, 15, '#2a1c10'); rect(122, 84, 76, 11, '#4a3320');
    ctx2.font = '700 9px ' + FONT; ctx2.textAlign = 'center'; ctx2.fillStyle = '#f0d9a0'; ctx2.fillText('새싹 태권도장', 160, 93);
    /* 걸린 띠 */
    ['#f4f1e8', '#e8c840', '#4a9a4a', '#2b4a9a', '#c8312f', '#1c1c22'].forEach((cl, i) => { rect(70 + i * 7, 78, 5, 24, cl); rect(70 + i * 7, 76, 5, 2, '#5f4529'); });
    rect(66, 74, 48, 3, '#5f4529');
    /* 바닥 매트 */
    const rows = [[152, 12], [164, 14], [178, 16], [194, 16], [210, 14]];
    rows.forEach(([y, h], r) => {
      const tw2 = 30 + r * 4;
      for (let x = -((r % 2) * tw2 / 2); x < W; x += tw2) {
        const k = Math.round((x + (r % 2) * tw2 / 2) / tw2 + r);
        rect(x, y, tw2, h, k % 2 ? '#b5353b' : '#2c4c9c');
        rect(x, y, tw2, 1, 'rgba(255,255,255,.18)'); rect(x, y + h - 1, tw2, 1, 'rgba(0,0,0,.25)'); rect(x, y, 1, h, 'rgba(0,0,0,.25)');
      }
    });
    rect(0, 150, W, 2, '#3b2a18');
  } else {
    const bands = ['#2b2d63', '#3e3577', '#58407f', '#7a4a82', '#a85a80', '#d67a6e', '#f0a56b', '#f7c882'];
    bands.forEach((cl, i) => rect(0, i * 16, W, 16, cl));
    rect(240, 104, 40, 16, '#fbe2a0'); ctx2.fillStyle = '#fbe2a0'; ctx2.beginPath(); ctx2.arc(260, 118, 20, Math.PI, 0); ctx2.fill();
    const bld = (x, w, top, col, win) => {
      rect(x, top, w, 150 - top, col);
      for (let yy = top + 6; yy < 140; yy += 9) for (let xx = x + 4; xx < x + w - 5; xx += 9) { const on = ((xx * 7 + yy * 13) % 5) < 2; rect(xx, yy, 4, 5, on ? win : 'rgba(0,0,0,.25)'); }
    };
    bld(-4, 58, 56, '#2a2540', '#f6d88a'); bld(56, 44, 80, '#322a4a', '#f6d88a'); bld(104, 64, 46, '#2a2540', '#f6d88a');
    bld(172, 50, 70, '#322a4a', '#f6d88a'); bld(226, 40, 90, '#2a2540', '#f6d88a'); bld(270, 56, 60, '#322a4a', '#f6d88a');
    /* 물탱크와 안테나 */
    rect(136, 36, 18, 10, '#4a4a58'); rect(138, 46, 2, 4, '#4a4a58'); rect(150, 46, 2, 4, '#4a4a58');
    rect(86, 62, 1, 18, '#555'); rect(82, 66, 9, 1, '#555'); rect(84, 70, 5, 1, '#555');
    /* 난간 */
    rect(0, 140, W, 14, '#1e1a2c');
    for (let x = 0; x < W; x += 10) rect(x, 136, 2, 18, '#6b6b78');
    rect(0, 136, W, 2, '#7a7a88'); rect(0, 146, W, 1, '#7a7a88');
    /* 바닥: 녹색 방수 도장 */
    rect(0, 152, W, 72, '#4f8062');
    for (let y = 152; y < 224; y += 12) rect(0, y, W, 1, 'rgba(0,0,0,.18)');
    for (let x = 0; x < W; x += 52) rect(x, 152, 1, 72, 'rgba(0,0,0,.14)');
    rect(0, 152, W, 3, '#35604a');
    rect(30, 176, 18, 30, '#7a9a82'); rect(270, 190, 26, 18, '#7a9a82');
    ctx2.globalAlpha = 0.25; rect(0, 152, W, 72, '#f7c882'); ctx2.globalAlpha = 1;
  }
  return off;
}
function drawStage(idx) {
  if (!stageCache[idx]) stageCache[idx] = paintStage(idx);
  c.drawImage(stageCache[idx], 0, 0, W, H);
}
const KIDS = [];
for (let i = 0; i < 7; i++) KIDS.push({ x: 20 + i * 44 + rnd(-6, 6), ph: rnd(0, 6), col: pick(['#f6f3ea', '#e8c840', '#6aa0d8', '#e07a8a']), hair: pick(['#1d1a24', '#4a2a1e', '#2a2a30']) });
function drawSpectators(idx) {
  if (idx !== 0) return;
  for (const k of KIDS) {
    const hop = G.cheer > 0 ? Math.abs(Math.sin(G.t / 3 + k.ph)) * 5 : Math.sin(G.t / 30 + k.ph) * 0.8;
    const x = Math.round(k.x), y = Math.round(150 - hop);
    R(x - 5, y - 14, 10, 14, '#16121c'); R(x - 4, y - 13, 8, 12, k.col); R(x - 4, y - 7, 8, 2, '#c8312f');
    R(x - 5, y - 24, 10, 10, '#16121c'); R(x - 4, y - 23, 8, 8, '#f2c79b'); R(x - 4, y - 23, 8, 3, k.hair);
    if (G.cheer > 0) { R(x - 8, y - 20 - 2, 3, 6, '#f2c79b'); R(x + 5, y - 22, 3, 6, '#f2c79b'); }
  }
}

/* ---------- 그리기: 도구 ---------- */
function txt(s, x, y, size, col, align, stroke, weight) {
  c.font = (weight || 800) + ' ' + size + 'px ' + FONT; c.textAlign = align || 'center'; c.textBaseline = 'alphabetic';
  if (stroke) { c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = stroke; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y);
}
function drawFx() {
  for (const e of fx) {
    const k = e.t / e.max;
    if (e.k === 'hit' || e.k === 'big') {
      const r = (e.k === 'big' ? 4 : 2.5) + e.t * 1.6, s = Math.max(1, Math.round((e.k === 'big' ? 6 : 4) * (1 - k)));
      for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4; R(e.x + Math.cos(ang) * r - s / 2, e.y + Math.sin(ang) * r - s / 2, s, s, a % 2 ? '#fff6c0' : '#ffb830'); }
      if (e.t < 4) R(e.x - 3, e.y - 3, 6, 6, '#fff');
    } else if (e.k === 'block') {
      const r = 3 + e.t * 1.2; for (let a = 0; a < 6; a++) { const ang = a * Math.PI / 3 + 0.3; R(e.x + Math.cos(ang) * r - 1, e.y + Math.sin(ang) * r - 1, 3, 3, '#bfe4ff'); }
    } else if (e.k === 'dust') {
      c.globalAlpha = 1 - k; for (let a = -1; a <= 1; a += 2) { R(e.x + a * (3 + e.t * 1.2) - 2, GY - 3 - e.t * 0.3, 4, 3, '#d8d0c0'); } c.globalAlpha = 1;
    } else if (e.k === 'text') {
      c.globalAlpha = 1 - k * k; txt(e.s, e.x, e.y - e.t * 0.5, 11, '#ffe45a', 'center', '#7a1a10'); c.globalAlpha = 1;
    }
  }
  for (const p of projs) {
    const x = Math.round(p.x), y = Math.round(GY - p.y), d = p.vx > 0 ? -1 : 1;
    for (let i = 1; i <= 3; i++) { c.globalAlpha = 0.5 / i; R(x + d * i * 5 - 4, y - 4, 8, 8, '#7ac0ff'); }
    c.globalAlpha = 1; R(x - 7, y - 7, 14, 14, '#2a5aa0'); R(x - 5, y - 5, 10, 10, '#8fd0ff'); R(x - 3, y - 3, 6, 6, '#ffffff');
  }
}
function hpBar(f, x, right) {
  const w = 120, h = 9;
  R(x - 2, 10, w + 4, h + 4, '#16121c'); R(x, 12, w, h, '#4a1a1a');
  const sh = clamp(f.hpShow / f.maxhp, 0, 1) * w, cur = clamp(f.hp / f.maxhp, 0, 1) * w;
  const fillTo = (v, col) => { if (right) R(x + w - v, 12, v, h, col); else R(x, 12, v, h, col); };
  fillTo(sh, '#e8503a'); fillTo(cur, cur / w < 0.28 ? '#ff6a3a' : '#f2d23a');
  R(right ? x + w - cur : x, 12, cur, 2, 'rgba(255,255,255,.4)');
  txt((f.i === 0 ? '청 ' : '홍 ') + f.ch.name, right ? x + w : x, 32, 10, f.i === 0 ? '#a8c4ff' : '#ffb4ac', right ? 'right' : 'left', '#16121c');
  for (let i = 0; i < 2; i++) {
    const on = f.wins > i, px = right ? x + 8 + i * 9 : x + w - 12 - i * 9;
    R(px, 25, 7, 7, '#16121c'); R(px + 1, 26, 5, 5, on ? '#ffd23a' : '#3a2a3a');
  }
}
function drawHUD() {
  const [a, b] = G.f;
  hpBar(a, 14, false); hpBar(b, 186, true);
  R(144, 8, 32, 24, '#16121c'); R(146, 10, 28, 20, '#2a2038');
  txt(String(Math.max(0, G.timer)).padStart(2, '0'), 160, 28, 17, G.timer <= 10 ? '#ff6a5a' : '#ffe45a', 'center', null, 900);
  if (G.golden) txt('골든 포인트', 160, 44, 8, '#ffe45a', 'center', '#16121c');
  [[14, '#2f62d6', 0], [278, '#d6352f', 1]].forEach(([x, cl, i]) => {
    R(x, 36, 28, 22, '#16121c'); R(x + 2, 38, 24, 18, cl);
    txt(String(G.pts[i]), x + 14, 54, 15, '#fff', 'center', null, 900);
  });
  txt(a.lead === 'L' ? '왼발 앞' : '오른발 앞', 46, 42, 7, '#a8c4ff', 'left', '#16121c');
  txt(b.lead === 'L' ? '왼발 앞' : '오른발 앞', 274, 42, 7, '#ffb4ac', 'right', '#16121c');
  if (G.mode === 1) txt('기록 ' + String(G.score).padStart(7, '0'), 8, 216, 9, '#fff', 'left', '#16121c');
  if (G.mode === 1) txt('최고 ' + String(Math.max(G.best, G.score)).padStart(7, '0'), 312, 216, 9, '#ffe45a', 'right', '#16121c');
}
function banner() {
  if (G.rs === 'ready') {
    if (G.rt < 50) txt(G.round + '라운드', 160, 100, 26, '#fff', 'center', '#16121c', 900);
    else if (G.rt < 90) txt('경례', 160, 104, 26, '#fff', 'center', '#16121c', 900);
    else if (G.rt < 125) txt('준비', 160, 104, 26, '#fff', 'center', '#16121c', 900);
    else { const s = 1 + (150 - G.rt) / 40; txt('시작!', 160, 104, Math.round(30 * Math.min(1.6, s)), '#ffe45a', 'center', '#7a1a10', 900); }
  } else if (G.rs === 'ko') {
    if (G.rt > 6) txt(G.msg, 160, 100, 26, '#ff6a5a', 'center', '#16121c', 900);
    if (G.rt > 60) txt(G.winner >= 0 ? (G.winner === 0 ? '청 ' : '홍 ') + G.f[G.winner].ch.name + ' 승리' : '승부를 가리지 못했습니다', 160, 128, 14, '#fff', 'center', '#16121c');
  }
  if (G.notice.t > 0 && G.rs !== 'ready') { c.globalAlpha = Math.min(1, G.notice.t / 20); txt(G.notice.s, 160, 76, 16, '#ffe45a', 'center', '#7a1a10', 900); c.globalAlpha = 1; }
}

/* ---------- 장면: 제목과 선택 ---------- */
const TITLE_ITEMS = ['1인 도전', '2인 대전', '조작법', '나가기'];
function tickTitle(ME) {
  const m = ME[0];
  if (G.menu === 10) { if (m.ok || m.u || m.d || pressedKeys.has('Escape')) { G.menu = 2; sfx.back(); } return; }
  if (m.u) { G.menu = (G.menu + 3) % 4; sfx.select(); }
  if (m.d) { G.menu = (G.menu + 1) % 4; sfx.select(); }
  if (m.ok) {
    sfx.ok();
    if (G.menu === 0 || G.menu === 1) { G.mode = G.menu + 1; G.done = [false, false]; go('select'); }
    else if (G.menu === 2) G.menu = 10;
    else { post('exit', { score: G.best }); if (!embedded) toast('오락기 안에서 쓰는 메뉴예요'); }
  }
}
function drawTitle() {
  drawStage(0); R(0, 0, W, H, 'rgba(10,6,20,.62)');
  const bob = Math.sin(G.t / 30) * 2;
  txt('2006', 160, 56 + bob, 14, '#9fd0ff', 'center', '#16121c', 900);
  txt('동네 태권 대전', 160, 90 + bob, 32, '#ffe45a', 'center', '#7a1a10', 900);
  txt('도장 겨루기 한판!', 160, 108, 10, '#fff', 'center', '#16121c');
  if (G.menu === 10) {
    R(14, 116, 292, 98, 'rgba(10,6,20,.9)');
    const L1 = [['이동', '←→ 이동   뒤로 누르면 막기   ↓ 숙이기'], ['발차기', 'S 왼발  D 오른발 (거리별 기술)  ↑ 얼굴'], ['풋워크', 'Q+← 백스텝  Q+→ 스텝 인  Q 스위치'], ['반격', '백스텝 뒤 뒷발 카운터 뒤차기, 앞발 회축'], ['돌진', '스텝 인 뒤 뒷발 턴차기, 앞발 옆차기'], ['연타', '앞발 돌려차기 뒤 반대발 = 나래차기'], ['훼이크', 'A 훼이크, 공격 직전에 누르면 흘리기'], ['강타', 'S 와 D 를 같이 누르면 강한 기술']];
    L1.forEach((r, i) => { txt(r[0], 22, 127 + i * 11, 8, '#ffe45a', 'left'); txt(r[1], 62, 127 + i * 11, 8, '#fff', 'left'); });
  } else {
    TITLE_ITEMS.forEach((s, i) => {
      const on = G.menu === i, y = 138 + i * 18;
      if (on) { R(110, y - 12, 100, 16, 'rgba(255,228,90,.25)'); txt('▶', 118, y, 11, '#ffe45a', 'left'); }
      txt(s, 160, y, 12, on ? '#ffe45a' : '#fff', 'center', '#16121c');
    });
  }
  if (Math.floor(G.t / 30) % 2 === 0 && G.menu !== 10) txt('버튼을 눌러 선택', 160, 214, 8, '#c8c0d8', 'center');
  txt(BUILD, 316, 221, 6, '#8b7fa0', 'right');
  if (G.best > 0) txt('최고 점수 ' + String(G.best).padStart(7, '0'), 160, 124, 9, '#ffe45a', 'center', '#16121c');
}
function tickSelect(ME) {
  const n = G.mode === 2 ? 2 : 1;
  if (G.mode === 3 && G.done[0] && !G.net.sent) { G.net.sent = true; netSend({ k: 'pick', ch: G.sel[0] }); }
  for (let i = 0; i < n; i++) {
    const m = ME[i];
    if (G.done[i]) continue;
    if (m.l) { G.sel[i] = (G.sel[i] + 2) % 3; sfx.select(); }
    if (m.r) { G.sel[i] = (G.sel[i] + 1) % 3; sfx.select(); }
    if (m.ok) { G.done[i] = true; sfx.ok(); }
  }
  if (G.done.slice(0, n).every(Boolean) && !G.starting && (G.mode !== 3 || G.net.rp >= 0)) { G.starting = 30; }
  if (G.starting) { G.starting--; if (G.starting <= 0) { G.starting = 0; startRun(); } }
}
function drawSelect() {
  drawStage(0); R(0, 0, W, H, 'rgba(10,6,20,.7)');
  txt('캐릭터를 고르세요', 160, 30, 16, '#ffe45a', 'center', '#16121c', 900);
  const xs = [58, 160, 262];
  CHARS.forEach((ch, i) => {
    const x = xs[i];
    R(x - 46, 42, 92, 130, '#16121c'); R(x - 44, 44, 88, 126, '#2a2038');
    const pose = lerpPose(POSE.idle0, POSE.idle1, (Math.sin(G.t / 18 + i) + 1) / 2);
    c.save(); c.beginPath(); c.rect(x - 44, 44, 88, 126); c.clip();
    c.translate(x, 0);
    const sc2 = ch.sc * 1.0;
    drawFigureAt(0, 132, pose, ch, ch.pal, sc2);
    c.restore();
    txt(ch.name, x, 150, 12, '#fff', 'center', '#16121c');
    txt(ch.title, x, 163, 7, '#c8c0d8', 'center');
    [['공격', ch.atk], ['속도', ch.spd], ['체력', ch.vit]].forEach((s, j) => {
      const y = 188 + j * 9; txt(s[0], x - 40, y, 7, '#fff', 'left');
      for (let k = 0; k < 5; k++) R(x - 16 + k * 11, y - 6, 9, 6, k < s[1] ? '#ffd23a' : '#3a2a3a');
    });
  });
  const n = G.mode === 2 ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const x = xs[G.sel[i]], col = i === 0 ? '#ff5a4a' : '#4a9aff', yy = 44 + (i ? 0 : 0);
    const blink = G.done[i] || Math.floor(G.t / 8) % 2 === 0;
    if (blink) { for (let t = 0; t < 3; t++) { c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(x - 47 + (i ? 3 : 0), 41 + (i ? 3 : 0), 94 - (i ? 6 : 0), 132 - (i ? 6 : 0)); break; } }
    R(x - 46 + (i ? 52 : 0), 33, 40, 9, col); txt((i + 1) + 'P' + (G.done[i] ? ' 결정' : ''), x - 26 + (i ? 52 : 0), 41, 8, '#fff', 'center');
  }
  if (G.net && G.done[0] && G.net.rp < 0) txt('상대를 기다리는 중...', 160, 206, 9, '#ffe45a', 'center', '#16121c');
  txt('← → 고르기   아무 공격 버튼으로 결정   Esc 뒤로', 160, 218, 8, '#c8c0d8', 'center');
}
function drawFigureAt(x, y, pose, ch, pal, sc) {
  const pf = c;
  drawFigure(x, y, 1, pose, ch, pal, sc, false, G.t);
}


/* ---------- 온라인 대전 ---------- */
/* 부모 게임이 두 사람 사이에서 메시지를 전달해 줍니다. 서로 입력만 주고받고, 양쪽이 똑같이 계산합니다. */
function netSend(msg) { post('net-send', { msg }); }
function hashState() {
  let h = 2166136261 >>> 0;
  const str = G.f.map(f => [Math.round(f.x * 100), Math.round(f.y * 100), f.hp, f.state, f.t, f.invuln, f.lead, f.riposte, f.chain].join(',')).join('|') + '|' + G.pts.join(',') + '|' + G.timer + '|' + G.rs + '|' + G.rt;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function netStart(d) {
  G.mode = 3; G.paused = false;
  G.net = { side: d.side ? 1 : 0, seed: d.seed | 0, delay: Math.max(1, Math.min(12, d.delay || 4)), mid: 0, loc: {}, remM: {}, nf: 0, rp: -1, sent: false, again: false, againR: false, waiting: false, cur: [emptyRaw(), emptyRaw()], myh: {}, remh: {} };
  G.sel = [0, 1]; G.done = [false, false]; G.starting = 0; G.mprev = [null, null];
  go('select'); bgmPlay('menu');
}
function netLeave(notify) {
  if (G.net && notify) netSend({ k: 'leave' });
  G.net = null; G.mode = 1; G.starting = 0; bgmStop(); go('title'); G.menu = 0;
  post('net-end', {});
}
function startNetMatch() {
  const N = G.net;
  const picks = []; picks[N.side] = G.sel[0]; picks[1 - N.side] = N.rp; N.rp = -1;
  G.stage = N.seed % 2;
  G.f = [mkFighter(0, CHARS[picks[0]], false, false, 0), mkFighter(1, CHARS[picks[1]], false, false, 0)];
  G.wins = [0, 0]; G.round = 1; G.perfect = [true, true]; G.mprev = [null, null]; G.score = 0;
  N.mid++; N.nf = 0; N.loc = {}; N.myh = {}; N.remh = {}; N.sent = false; N.again = false; N.againR = false;
  const rem = N.remM[N.mid] || (N.remM[N.mid] = {});
  for (let f = 0; f < N.delay; f++) { N.loc[f] = 0; rem[f] = 0; }
  go('intro'); sfx.coin(); bgmPlay('menu');
}
function netRecv(msg) {
  const N = G.net; if (!N || !msg) return;
  if (msg.k === 'pick') N.rp = msg.ch | 0;
  else if (msg.k === 'in') { (N.remM[msg.m] || (N.remM[msg.m] = {}))[msg.f] = msg.b; }
  else if (msg.k === 'hash') {
    const key = msg.m + ':' + msg.f;
    if (key in N.myh) { if (N.myh[key] !== msg.h) { toast('동기가 어긋났습니다'); post('net-desync', { frame: msg.f }); } delete N.myh[key]; }
    else N.remh[key] = msg.h;
  }
  else if (msg.k === 'again') N.againR = true;
  else if (msg.k === 'leave') { toast('상대가 나갔습니다'); netLeave(false); post('exit', { score: G.best }); }
}
/* 싸움 장면의 한 프레임을 계산하기 전에 호출: 양쪽 입력이 다 모이면 true */
function netGate() {
  const N = G.net, want = N.nf + N.delay;
  if (!(want in N.loc)) { const b = packRaw(localRaw()); N.loc[want] = b; netSend({ k: 'in', m: N.mid, f: want, b }); }
  const rem = N.remM[N.mid] || (N.remM[N.mid] = {});
  if (!(N.nf in N.loc) || !(N.nf in rem)) { N.waiting = true; return false; }
  N.waiting = false;
  const mine = unpackRaw(N.loc[N.nf]), theirs = unpackRaw(rem[N.nf]);
  N.cur = N.side === 0 ? [mine, theirs] : [theirs, mine];
  delete N.loc[N.nf]; delete rem[N.nf];
  if (N.nf > 0 && N.nf % 60 === 0) {
    const h = hashState(), key = N.mid + ':' + N.nf;
    netSend({ k: 'hash', m: N.mid, f: N.nf, h });
    if (key in N.remh) { if (N.remh[key] !== h) { toast('동기가 어긋났습니다'); post('net-desync', { frame: N.nf }); } delete N.remh[key]; }
    else N.myh[key] = h;
  }
  N.nf++;
  return true;
}

/* ---------- 진행 ---------- */
function startRun() {
  if (G.mode === 3) { G.starting = 0; startNetMatch(); return; }
  G.starting = 0; G.score = 0; G.conts = 0; G.lad = 0; G.mirror = false;
  if (G.mode === 1) {
    const me = G.sel[0], o1 = (me + 1) % 3, o2 = (me + 2) % 3;
    G.ladder = [{ ch: o1, lvl: 0, stage: 0, alt: false }, { ch: o2, lvl: 1, stage: 1, alt: false }, { ch: me, lvl: 2, stage: 0, alt: true }];
  } else G.ladder = [{ ch: G.sel[1], lvl: 0, stage: Math.random() < 0.5 ? 0 : 1, alt: G.sel[1] === G.sel[0] }];
  beginMatch();
}
function beginMatch() {
  const o = G.ladder[G.lad];
  G.stage = o.stage;
  const a = mkFighter(0, CHARS[G.sel[0]], false, false, 0);
  const b = mkFighter(1, CHARS[o.ch], o.alt, G.mode === 1, o.lvl);
  G.f = [a, b]; G.wins = [0, 0]; G.round = 1; G.perfect = [true, true];
  G.mprev = [null, null];
  go('intro'); sfx.coin(); bgmPlay('menu');
}
function newRound() {
  const [a, b] = G.f;
  for (const f of G.f) {
    f.lead = 'L'; f.fk = 0; f.faked = 0; f.whiff = false; f.dnLen = 40; f.riposte = 0; f.chain = 0; f.dashWin = 0; f.edge = [false, false, false, false];
    f.hp = f.maxhp; f.hpShow = f.maxhp; f.state = 'idle'; f.t = 0; f.move = null; f.vx = 0; f.vy = 0; f.y = 0; f.invuln = 0; f.stun = 0; f.flash = 0;
    f.hist = []; f.buf = null; f.dashCd = 0;
    if (f.ai) { f.ai.plan = []; f.ai.step = null; f.ai.blockT = 0; f.ai.delay = 30; }
  }
  a.x = 110; a.face = 1; b.x = 210; b.face = -1;
  projs = []; fx = []; G.timer = 60; G.tc = 0; G.winner = -1; G.perfect = [true, true];
  G.pts = [0, 0]; G.golden = false; G.notice = { s: '', t: 0 };
  G.hitstop = 0; G.slow = 0;
}
function endRound(kind) {
  const [a, b] = G.f; let w = -1;
  if (kind === 'ko') w = a.hp <= 0 && b.hp <= 0 ? -1 : a.hp <= 0 ? 1 : 0;
  else if (G.pts[0] !== G.pts[1]) w = G.pts[0] > G.pts[1] ? 0 : 1;
  else { const ra = a.hp / a.maxhp, rb = b.hp / b.maxhp; w = ra > rb ? 0 : rb > ra ? 1 : -1; }
  G.rs = 'ko'; G.rt = 0; G.slow = 0; G.winner = w; G.koSlow = kind === 'ko';
  G.msg = kind === 'ko' ? '케이오!' : kind === 'gap' ? '점수차 승!' : kind === 'golden' ? '골든 포인트!' : (w < 0 ? '무승부' : '그만!');
  if (w >= 0) {
    G.f[w].wins++; G.wins[w]++;
    if (G.mode === 1 && w === 0) { G.score += 1000 + G.timer * 10 + (G.perfect[0] ? 3000 : 0); if (G.perfect[0]) toast('한 점도 내주지 않은 승리!'); }
    if (kind === 'ko') sfx.ko(); else sfx.win();
  }
  G.cheer = 60;
}
function matchEnd() {
  const w = G.wins[0] >= 2 ? 0 : 1;
  if (G.mode === 2 || G.mode === 3) { G.winner = w; go('result2'); sfx.win(); bgmStop(); if (G.net) post('net-result', { winnerSide: w, youWon: w === G.net.side }); return; }
  if (w === 0) {
    G.score += 3000; sfx.win();
    if (G.lad + 1 < G.ladder.length) { G.lad++; beginMatch(); }
    else { saveBest(); post('score', { score: G.score, cleared: true }); go('ending'); bgmPlay('menu'); }
  } else { G.ctd = 9; G.ctf = 0; go('continue'); bgmStop(); }
}
function saveBest() {
  if (G.score > G.best) { G.best = G.score; try { localStorage.setItem('taekwon.best', String(G.best)); } catch (e) {} }
}
function setPause(v) { G.paused = v; G.pauseSel = 0; if (v) sfx.back(); post('state', { paused: v }); }

function tickIntro() {
  if (G.t === 1) { G.f[0].x = 110; G.f[1].x = 210; }
  if (G.t >= 150 || (G.t > 40 && (pressedKeys.has('Enter') || pressedKeys.has('Space')))) { go('fight'); G.rs = 'ready'; G.rt = 0; newRound(); bgmPlay('fight'); }
}
function drawIntro() {
  const o = G.ladder[G.lad], t = G.t;
  drawStage(G.stage); R(0, 0, W, H, 'rgba(10,6,20,.6)');
  const k = Math.min(1, t / 20), e = 1 - Math.pow(1 - k, 3);
  const [a, b] = G.f;
  drawFigure(lerp(-60, 90, e), 176, 1, lerpPose(POSE.idle0, POSE.idle1, (Math.sin(t / 10) + 1) / 2), a.ch, a.pal, a.sc * 1.6, false, t);
  drawFigure(lerp(380, 230, e), 176, -1, lerpPose(POSE.idle0, POSE.idle1, (Math.sin(t / 10 + 1) + 1) / 2), b.ch, b.pal, b.sc * 1.6, false, t);
  txt('VS', 160, 100, 36, '#ffe45a', 'center', '#7a1a10', 900);
  txt(a.ch.name, 70, 36, 18, '#fff', 'center', '#16121c', 900); txt(b.ch.name, 250, 36, 18, '#fff', 'center', '#16121c', 900);
  txt(G.mode === 1 ? (G.lad + 1) + '번째 상대 / ' + G.ladder.length : '2인 대전', 160, 18, 9, '#c8c0d8', 'center');
  txt(STAGES[G.stage].name, 160, 214, 9, '#fff', 'center', '#16121c');
}

/* ---------- 전투 장면 ---------- */
function tickFight() {
  const [a, b] = G.f;
  if (!G.net && (pressedKeys.has('Escape') || (pressedKeys.has('Enter') && G.rs === 'fight'))) { setPause(!G.paused); }
  if (G.paused) {
    if (pressedKeys.has('ArrowUp') || pressedKeys.has('ArrowDown')) { G.pauseSel ^= 1; sfx.select(); }
    if (pressedKeys.has('Space') || pressedKeys.has('KeyQ') || pressedKeys.has('KeyS') || pressedKeys.has('KeyD')) {
      if (G.pauseSel === 0) setPause(false); else { G.paused = false; bgmStop(); go('title'); G.menu = 0; }
    }
    return;
  }
  if (G.net && !netGate()) return;
  G.rt++;
  if (G.cheer > 0) G.cheer--;
  if (G.notice.t > 0) G.notice.t--;
  if (G.shake > 0) G.shake *= 0.82; if (G.shake < 0.3) G.shake = 0;
  for (const f of G.f) f.hpShow = f.hpShow > f.hp ? Math.max(f.hp, f.hpShow - 0.5) : f.hp;
  if (G.rs === 'ready') {
    if (G.rt === 1) newRound();
    if (G.rt === 125) sfx.bell();
    a.anim++; b.anim++;
    if (G.rt >= 150) { G.rs = 'fight'; G.rt = 0; }
    return;
  }
  if (G.hitstop > 0) {
    G.hitstop--;
    /* 타격으로 화면이 멈춘 동안 누른 버튼도 놓치지 않게 기억해 둔다 */
    const rr2 = G.net ? G.net.cur : [getRaw(0), getRaw(1)];
    for (let i = 0; i < 2; i++) { const f = G.f[i]; if (f && !f.ai) rr2[i].btn.forEach((bt, k) => { if (bt && !f.prevRaw.btn[k]) f.edge[k] = true; }); }
    return;
  }
  if (G.rs === 'ko' && G.koSlow) {
    G.slow++;
    if (G.slow % 2 === 1 && G.rt < 70) return;
  }
  const inFight = G.rs === 'fight';
  let ra = emptyRaw(), rb = emptyRaw();
  if (inFight) {
    if (G.net) { ra = G.net.cur[0]; rb = G.net.cur[1]; }
    else { ra = getRaw(0); rb = b.ai ? aiRaw(b, a) : getRaw(1); }
  } else if (G.winner >= 0) {
    const w = G.f[G.winner];
    if (G.rt > 50 && w.state === 'idle') { w.state = 'win'; w.t = 0; }
  }
  const order = (G.rt & 1) ? [a, b] : [b, a];
  for (const f of order) stepFighter(f, f === a ? b : a, f === a ? ra : rb);
  for (const f of G.f) visualUpdate(f);
  for (const p of projs) { p.x += p.vx; p.t++; if (p.x < -10 || p.x > W + 10 || p.t > 240) p.dead = true; }
  if (inFight) resolveHits();
  separate(a, b);
  for (const e of fx) e.t++;
  fx = fx.filter(e => e.t < e.max);
  if (inFight) {
    G.tc++; if (G.tc >= 60) { G.tc = 0; G.timer--; }
    if (a.hp <= 0 || b.hp <= 0) endRound('ko');
    else if (Math.abs(G.pts[0] - G.pts[1]) >= 12) endRound('gap');
    else if (G.golden && G.pts[0] !== G.pts[1]) endRound('golden');
    else if (G.timer <= 0) {
      if (G.pts[0] === G.pts[1] && !G.golden) { G.golden = true; G.timer = 30; G.tc = 0; G.notice = { s: '골든 포인트!', t: 100 }; sfx.bell(); }
      else endRound('time');
    }
  } else if (G.rt >= 170) {
    if (G.wins[0] >= 2 || G.wins[1] >= 2) matchEnd();
    else if (G.round >= 5) { G.wins = [G.wins[0] >= G.wins[1] ? 2 : 0, G.wins[1] > G.wins[0] ? 2 : 0]; matchEnd(); }
    else { G.round++; G.rs = 'ready'; G.rt = 0; newRound(); }
  }
}
function drawFight() {
  const [a, b] = G.f;
  c.save();
  if (G.shake > 0) c.translate(Math.round(rnd(-G.shake, G.shake) / 2) * 1, Math.round(rnd(-G.shake, G.shake) / 3));
  drawStage(G.stage); drawSpectators(G.stage);
  const back = a.state === 'attack' ? b : a, front = back === a ? b : a;
  renderFighter(back); renderFighter(front);
  drawFx();
  c.restore();
  if (G.rs === 'ko' && G.rt < 6) { c.globalAlpha = 0.6 * (1 - G.rt / 6); R(0, 0, W, H, '#fff'); c.globalAlpha = 1; }
  drawHUD(); banner();
  if (G.paused) {
    R(0, 0, W, H, 'rgba(10,6,20,.7)');
    txt('일시정지', 160, 90, 20, '#ffe45a', 'center', '#16121c', 900);
    ['계속하기', '그만하고 처음으로'].forEach((s, i) => {
      const on = G.pauseSel === i; txt((on ? '▶ ' : '') + s, 160, 122 + i * 20, 12, on ? '#ffe45a' : '#fff', 'center', '#16121c');
    });
  }
}

/* ---------- 결과 장면 ---------- */
function tickContinue(ME) {
  G.ctf++;
  if (G.ctf >= 60) { G.ctf = 0; G.ctd--; if (G.ctd >= 0) sfx.select(); }
  if (ME[0].ok) { sfx.coin(); G.conts++; G.score = Math.max(0, G.score - 1000); beginMatch(); return; }
  if (G.ctd < 0) { saveBest(); post('score', { score: G.score, cleared: false }); go('over'); }
}
function drawContinue() {
  drawStage(G.stage); R(0, 0, W, H, 'rgba(10,6,20,.8)');
  txt('졌습니다', 160, 70, 24, '#ff6a5a', 'center', '#16121c', 900);
  txt('계속하시겠습니까?', 160, 100, 13, '#fff', 'center', '#16121c');
  txt(String(Math.max(0, G.ctd)), 160, 160, 44, '#ffe45a', 'center', '#7a1a10', 900);
  txt('아무 버튼이나 누르면 이어서 도전 (점수 -1000)', 160, 200, 9, '#c8c0d8', 'center');
}
function tickOver(ME) { if (G.t > 30 && ME[0].ok) { go('title'); G.menu = 0; bgmStop(); sfx.back(); } }
function drawOver() {
  R(0, 0, W, H, '#0a0614');
  txt('게임 끝', 160, 90, 28, '#ff6a5a', 'center', '#16121c', 900);
  txt('점수 ' + String(G.score).padStart(7, '0'), 160, 124, 14, '#fff', 'center');
  txt('최고 ' + String(G.best).padStart(7, '0'), 160, 144, 11, '#ffe45a', 'center');
  if (Math.floor(G.t / 30) % 2 === 0) txt('버튼을 누르세요', 160, 196, 9, '#c8c0d8', 'center');
}
function tickEnding(ME) { if (G.t > 60 && ME[0].ok) { go('title'); G.menu = 0; bgmStop(); sfx.back(); } }
const CONF = []; for (let i = 0; i < 60; i++) CONF.push({ x: rnd(0, W), y: rnd(-224, 0), v: rnd(0.6, 1.8), col: pick(['#ffe45a', '#ff6a5a', '#6ac0ff', '#8aff9a', '#fff']), p: rnd(0, 6) });
function drawEnding() {
  drawStage(0); R(0, 0, W, H, 'rgba(10,6,20,.7)');
  for (const q of CONF) { q.y += q.v; if (q.y > H) { q.y = -4; q.x = rnd(0, W); } R(q.x + Math.sin(G.t / 15 + q.p) * 6, q.y, 4, 4, q.col); }
  const ch = G.f[0];
  drawFigure(160, 150, 1, lerpPose(POSE.idle0, POSE.win, (Math.sin(G.t / 10) + 1) / 2), ch.ch, ch.pal, ch.sc * 1.6, false, G.t);
  txt('동네 최강자 등극!', 160, 50, 22, '#ffe45a', 'center', '#7a1a10', 900);
  txt(ch.ch.name + '의 도전 성공', 160, 72, 12, '#fff', 'center', '#16121c');
  txt('점수 ' + String(G.score).padStart(7, '0') + (G.score >= G.best ? '  최고 기록!' : ''), 160, 190, 12, '#fff', 'center', '#16121c');
  if (Math.floor(G.t / 30) % 2 === 0 && G.t > 60) txt('버튼을 누르세요', 160, 212, 9, '#c8c0d8', 'center');
}
function tickResult2(ME) {
  if (G.net) {
    const N = G.net;
    if (G.t > 40 && ME[0].ok && !N.again) { N.again = true; netSend({ k: 'again' }); sfx.ok(); }
    if (N.again && N.againR) { N.again = false; N.againR = false; N.sent = false; G.done = [false, false]; go('select'); }
    return;
  }
  if (G.t > 40 && (ME[0].ok || ME[1].ok)) { go('select'); G.done = [false, false]; sfx.ok(); }
}
function drawResult2() {
  drawStage(G.stage); R(0, 0, W, H, 'rgba(10,6,20,.65)');
  const w = G.f[G.winner];
  drawFigure(160, 160, 1, lerpPose(POSE.idle0, POSE.win, (Math.sin(G.t / 10) + 1) / 2), w.ch, w.pal, w.sc * 1.6, false, G.t);
  txt(G.net ? (G.winner === G.net.side ? '승리!' : '패배') : (G.winner + 1) + 'P ' + w.ch.name + ' 승리!', 160, 56, 22, '#ffe45a', 'center', '#7a1a10', 900);
  if (G.net && G.net.again) txt('상대를 기다리는 중...', 160, 210, 9, '#ffe45a', 'center');
  else if (Math.floor(G.t / 30) % 2 === 0 && G.t > 40) txt(G.net ? '버튼을 누르면 한 판 더 (Esc 나가기)' : '버튼을 누르면 다시 고르기', 160, 210, 9, '#c8c0d8', 'center');
}

/* ---------- 메인 루프 ---------- */
function tick() {
  G.t++;
  const ME = [menuEdge(0), menuEdge(1)];
  if (G.toastT > 0) G.toastT--;
  if (pressedKeys.has('KeyM')) { muted = !muted; if (muted) bgmStop(); toast(muted ? '소리 끔' : '소리 켬'); }
  /* Esc 처리 */
  if (G.net && (pressedKeys.has('Escape') || pressedKeys.has('Backspace')) && (G.scene === 'select' || G.scene === 'intro' || G.scene === 'result2')) { netLeave(true); post('exit', { score: G.best }); pressedKeys.clear(); return; }
  if (pressedKeys.has('Escape') || pressedKeys.has('Backspace')) {
    if (G.net) { /* 온라인 싸움 중에는 무시 */ }
    else if (G.scene === 'title') { if (G.menu === 10) { G.menu = 2; sfx.back(); } else post('exit', { score: G.best }); }
    else if (G.scene === 'select') { go('title'); G.menu = G.mode - 1; G.starting = 0; sfx.back(); }
    else if (G.scene === 'intro' || G.scene === 'continue' || G.scene === 'over' || G.scene === 'ending' || G.scene === 'result2') { bgmStop(); go('title'); G.menu = 0; sfx.back(); }
  }
  switch (G.scene) {
    case 'title': if (G.t === 1 || !bgm.kind) bgmPlay('menu'); tickTitle(ME); break;
    case 'select': tickSelect(ME); break;
    case 'intro': tickIntro(); break;
    case 'fight': tickFight(); break;
    case 'continue': tickContinue(ME); break;
    case 'over': tickOver(ME); break;
    case 'ending': tickEnding(ME); break;
    case 'result2': tickResult2(ME); break;
  }
  pressedKeys.clear();
}
function render() {
  c.setTransform(SC, 0, 0, SC, 0, 0);
  c.imageSmoothingEnabled = false;
  switch (G.scene) {
    case 'title': drawTitle(); break;
    case 'select': drawSelect(); break;
    case 'intro': drawIntro(); break;
    case 'fight': drawFight(); break;
    case 'continue': drawContinue(); break;
    case 'over': drawOver(); break;
    case 'ending': drawEnding(); break;
    case 'result2': drawResult2(); break;
  }
  if (G.net && G.scene === 'fight' && G.net.waiting) txt('연결 대기 중...', 160, 90, 10, '#ffe45a', 'center', '#16121c');
  if (G.net && G.scene === 'fight' && G.rs === 'ready' && G.rt < 90) { const me = G.f[G.net.side]; txt('▼ 나', me.x, GY - 74 * me.sc, 9, '#ffe45a', 'center', '#16121c'); }
  if (G.toastT > 0) { R(80, 196, 160, 16, 'rgba(0,0,0,.7)'); txt(G.toast, 160, 208, 9, '#fff', 'center'); }
  if (typeof window.__onFrame === 'function') window.__onFrame(G);
}
let last = 0, acc = 0, running = true;
function loop(now) {
  if (!running) { requestAnimationFrame(loop); last = now; return; }
  if (!last) last = now;
  acc += Math.min(100, now - last); last = now;
  let n = 0;
  while (acc >= 1000 / 60 && n < 5) { tick(); acc -= 1000 / 60; n++; }
  if (n === 5) acc = 0;
  render();
  requestAnimationFrame(loop);
}

/* ---------- 부모 게임과 대화 ---------- */
addEventListener('message', e => {
  const d = e.data; if (!d || d.source !== 'arcade-host') return;
  if (d.type === 'pause') { if (G.scene === 'fight' && !G.paused && G.rs === 'fight') setPause(true); running = false; }
  else if (d.type === 'resume') { running = true; window.focus(); }
  else if (d.type === 'mute') { muted = true; bgmStop(); }
  else if (d.type === 'unmute') { muted = false; }
  else if (d.type === 'focus') window.focus();
  else if (d.type === 'reset') { bgmStop(); G.net = null; G.mode = 1; go('title'); G.menu = 0; running = true; }
  else if (d.type === 'net-start') { running = true; netStart(d); window.focus(); }
  else if (d.type === 'net-msg') netRecv(d.msg);
  else if (d.type === 'net-leave') { if (G.net) { toast('상대가 나갔습니다'); netLeave(false); post('exit', { score: G.best }); } }
});
window.TaekwonFighter = {
  version: BUILD,
  pause() { running = false; }, resume() { running = true; window.focus(); },
  mute(v) { muted = !!v; if (muted) bgmStop(); },
  keyState() { return { down: Array.from(down), maps: MAP }; }
};
window.__fighter = { G, get fighters() { return G.f; }, get projs() { return projs; }, MAP, down, pressedKeys, startMove, mkFighter, tick, CHARS, POSE, MOVES, drawFigure, ctx: c, hitbox, hurtbox, render, hashState, get net() { return G.net; } };
requestAnimationFrame(loop);
post('ready', { best: G.best, version: BUILD });
})();
