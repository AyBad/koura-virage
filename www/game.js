// =====================================================================
// Koura Virage V1 — moteur de match (PixiJS / WebGL)
// Monde logique 1280 x 720, sol à y = 560. Pas fixe de 60 images/s.
// =====================================================================
const W = 1280, H = 720, GROUND = 560;
const GOAL_D = 118, GOAL_TOP = 368, BAR = 7;          // profondeur de la cage, hauteur de la barre
const BALL_R = 19, HEAD_R = 40, BOOT_R = 22;
const G_BALL = 0.36, G_PL = 0.62;
const MATCH_TIME = 90;
const STEP = 1000 / 60;

let app = null, TEX = {}, FONT = 'Luckiest Guy';
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.random() * a.length | 0];

// ---------- démarrage de Pixi ----------
function initPixi() {
  if (app) return;
  app = new PIXI.Application({ resizeTo: window, antialias: true, backgroundColor: 0x0b1020, resolution: Math.min(2, window.devicePixelRatio || 1), autoDensity: true, powerPreference: 'high-performance' });
  document.getElementById('stage').appendChild(app.view);
  app.ticker.add(tick);
  app.ticker.stop();
  setupInput();
}

// textures générées (lueurs, particules, dégradés)
function genTex() {
  if (TEX.glow) return;
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  TEX.glow = mk(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  TEX.dot = mk(32, 32, x => { x.fillStyle = '#fff'; x.beginPath(); x.arc(16, 16, 15, 0, 7); x.fill(); });
  TEX.rect = mk(16, 10, x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 16, 10); });
  TEX.smoke = mk(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.6, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  TEX.shadow = mk(128, 32, x => { const g = x.createRadialGradient(64, 16, 0, 64, 16, 64); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.setTransform(1, 0, 0, .25, 0, 12); x.beginPath(); x.arc(64, 16, 64, 0, 7); x.fill(); });
  TEX.trail = mk(64, 8, x => { const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 8); });
  TEX.ray = mk(64, 512, x => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(24, 0); x.lineTo(40, 0); x.lineTo(64, 512); x.lineTo(0, 512); x.fill(); });
  TEX.star = mk(64, 64, x => { x.translate(32, 32); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 30, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); });
}

// ---------- chargement des images ----------
const IMG_LIST = () => {
  const a = ['img/bg/stade.webp', 'img/bg/fans.webp', 'img/eq/ba_cl.webp', 'img/ui/kick.webp', 'img/ui/lob.webp', 'img/ui/pause.webp', 'img/ui/hand.webp'];
  for (const c of CHARS) for (let i = 0; i < 4; i++) a.push('img/h/' + c.id + '_' + i + '.webp');
  for (const b of BOOTS) a.push('img/eq/' + b.id + '.webp');
  return a;
};
let LOADED = false;
async function loadAssets(onProg) {
  if (LOADED) return;
  const list = IMG_LIST();
  await PIXI.Assets.load(list, p => onProg && onProg(p));
  try { await document.fonts.load('60px "' + FONT + '"'); await document.fonts.load('30px "Lilita One"'); } catch (e) { }
  LOADED = true;
}
const T = p => PIXI.Texture.from(p);

// =====================================================================
// Entrées : joystick à gauche (bouger + sauter), tir bas / tir haut à droite
// =====================================================================
const INP = { ax: 0, up: false, jumpEdge: false, lo: false, hi: false, k: {} };
const JOY = { id: null, bx: 0, by: 0, kx: 0, ky: 0, act: false, armed: true };
const BTN = { lo: { id: null, x: 0, y: 0, r: 64, t: 0 }, hi: { id: null, x: 0, y: 0, r: 64, t: 0 }, pause: { x: 0, y: 0, r: 34 } };
let VIEW = { k: 1, w: W, ox: 0 };

function toView(e) { const r = app.view.getBoundingClientRect(); return { x: (e.clientX - r.left) / VIEW.k, y: (e.clientY - r.top) / VIEW.k }; }
function setupInput() {
  const el = app.view; el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    if (!M) return; e.preventDefault(); au();
    const p = toView(e);
    if (M.paused) return;
    if (Math.hypot(p.x - BTN.pause.x, p.y - BTN.pause.y) < BTN.pause.r + 14) { pauseMatch(); return; }
    for (const k of ['lo', 'hi']) { const b = BTN[k]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.35) { b.id = e.pointerId; INP[k] = true; b.t = 8; return; } }
    if (p.x < VIEW.w * .5 && JOY.id === null) { JOY.id = e.pointerId; JOY.bx = clamp(p.x, 110, VIEW.w * .5 - 60); JOY.by = clamp(p.y, 420, 640); JOY.kx = p.x - JOY.bx; JOY.ky = p.y - JOY.by; JOY.act = true; joyUpd(); }
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) { const p = toView(e); JOY.kx = p.x - JOY.bx; JOY.ky = p.y - JOY.by; joyUpd(); } });
  const up = e => {
    if (e.pointerId === JOY.id) { JOY.id = null; JOY.act = false; JOY.kx = JOY.ky = 0; joyUpd(); }
    for (const k of ['lo', 'hi']) if (BTN[k].id === e.pointerId) BTN[k].id = null;
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
  addEventListener('keydown', e => {
    if (!M) return; INP.k[e.code] = true;
    if (['KeyX', 'KeyJ'].includes(e.code)) { INP.lo = true; BTN.lo.t = 8; }
    if (['KeyZ', 'KeyK', 'KeyC'].includes(e.code)) { INP.hi = true; BTN.hi.t = 8; }
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) INP.jumpEdge = true;
    if (e.code === 'Escape') pauseMatch();
  });
  addEventListener('keyup', e => { INP.k[e.code] = false; });
}
function joyUpd() {
  const R = 78, d = Math.hypot(JOY.kx, JOY.ky);
  if (d > R) { JOY.kx *= R / d; JOY.ky *= R / d; }
  const nx = JOY.kx / R; INP.ax = Math.abs(nx) < .18 ? 0 : clamp((nx - Math.sign(nx) * .18) / .7, -1, 1);
  const upNow = JOY.ky < -R * .5;
  if (upNow && JOY.armed) { INP.jumpEdge = true; JOY.armed = false; }
  if (JOY.ky > -R * .25) JOY.armed = true;
  INP.up = upNow;
}
function readInput() {
  const k = INP.k; let ax = INP.ax;
  if (k.ArrowLeft || k.KeyA) ax = -1; if (k.ArrowRight || k.KeyD) ax = 1;
  const r = { ax, jump: INP.jumpEdge || INP.up, lo: INP.lo, hi: INP.hi };
  INP.jumpEdge = false; INP.lo = false; INP.hi = false;
  return r;
}

// =====================================================================
// Match
// =====================================================================
let M = null;

class Player {
  constructor(side, chId, bootId, name, ai) {
    this.side = side; this.face = side ? -1 : 1; this.ch = CH(chId); this.boot = BT(bootId); this.name = name; this.ai = ai;
    const b = this.boot.b || {}, c = this.ch;
    this.spd = (c.spd || 1) * (1 + (b.spd || 0) / 100); this.jmp = (c.jmp || 1) * (1 + (b.jmp || 0) / 100);
    this.kp = (c.kp || 1) * (1 + (b.kp || 0) / 100); this.hdp = (c.hd || 1) * (1 + (b.hd || 0) / 100);
    this.reset();
  }
  reset() {
    this.x = this.side ? W - 330 : 330; this.y = GROUND; this.vx = 0; this.vy = 0; this.px = this.x; this.py = this.y;
    this.kick = 0; this.kt = 'lo'; this.kdone = false; this.kcd = 0; this.hd = 0; this.stun = 0;
    this.an = { tilt: 0, tv: 0, s: 0, sv: 0, ho: 0, hv: 0, step: 0, t: Math.random() * 100, joy: 0 };
    this.expr = 0; this.exprT = 0; this.aiT = 0; this.aiI = { ax: 0, jump: false, lo: false, hi: false };
  }
  get onGround() { return this.y >= GROUND - .5; }
  get hx() { return this.x + this.face * 4; }
  get hy() { return this.y - 92; }
  get fx() { return this.x + this.face * 34; }
  get fy() { return this.y - 20; }
}

function newMatch(o) {
  genTex();
  M = {
    o, t: 0, time: MATCH_TIME * 60, state: 'ready', st: 170, score: [0, 0], hs: 0, slow: 0, slowAcc: 0,
    P: [new Player(0, o.me, o.boot, o.myName, 0), new Player(1, o.opp, o.oppBoot, o.oppName, o.ai)],
    b: { x: W / 2, y: 150, vx: 0, vy: 0, px: W / 2, py: 150, rot: 0, sq: 0, sqa: 0, last: -1, lastT: '', hot: 0 },
    trail: [], fx: [], shake: 0, zoom: 1, zoomT: 1, focus: { x: W / 2, y: H / 2 }, net: [0, 0], flash: 0, fanJump: 0,
    tuto: o.tuto ? { i: 0, t: 0, slow: false } : null, ev: {}, msg: null, drop: 0, paused: false, stats: { shots: 0, heads: 0 }
  };
  buildScene();
  resetKick(true);
  app.ticker.start();
  crowdSound(true);
}

// ---------- scène ----------
let S = null;
function buildScene() {
  if (S) { app.stage.removeChildren(); S.root.destroy({ children: true }); }
  const root = new PIXI.Container(), cam = new PIXI.Container(), hud = new PIXI.Container();
  root.addChild(cam, hud); app.stage.addChild(root);
  S = { root, cam, hud };
  // décor peint
  const bg = new PIXI.Sprite(T('img/bg/stade.webp')); S.bg = bg; cam.addChild(bg);
  // lueurs des projecteurs + rayons
  S.lights = new PIXI.Container(); cam.addChild(S.lights);
  S.lightPts = [[165, 80, 2.2], [1510, 80, 2.2], [40, 150, 1], [1630, 150, 1], [290, 230, .7], [1380, 230, .7], [570, 270, .55], [1100, 270, .55], [700, 350, .6], [975, 350, .6]];
  S.lightSp = S.lightPts.map(([x, y, s]) => { const g = new PIXI.Sprite(TEX.glow); g.anchor.set(.5); g.blendMode = PIXI.BLEND_MODES.ADD; g.tint = 0xfff2c8; g.base = s; S.lights.addChild(g); return g; });
  S.rays = [0, 1].map(i => { const r = new PIXI.Sprite(TEX.ray); r.anchor.set(.5, 0); r.blendMode = PIXI.BLEND_MODES.ADD; r.alpha = .22; S.lights.addChild(r); return r; });
  S.flashes = new PIXI.Container(); cam.addChild(S.flashes);
  // terrain : ombres, cages (arrière), joueurs, ballon, effets, cages (avant)
  S.shadows = new PIXI.Container(); cam.addChild(S.shadows);
  S.goalBack = [mkGoal(0, 'back'), mkGoal(1, 'back')]; cam.addChild(S.goalBack[0], S.goalBack[1]);
  S.pl = M.P.map(p => mkPlayer(p)); S.pl.forEach(v => cam.addChild(v.root));
  S.trail = new PIXI.SimpleRope(TEX.trail, Array.from({ length: 16 }, () => new PIXI.Point(W / 2, 150)), .5); S.trail.blendMode = PIXI.BLEND_MODES.ADD; cam.addChild(S.trail);
  S.ballGlow = new PIXI.Sprite(TEX.glow); S.ballGlow.anchor.set(.5); S.ballGlow.blendMode = PIXI.BLEND_MODES.ADD; cam.addChild(S.ballGlow);
  S.ballC = new PIXI.Container(); S.ball = new PIXI.Sprite(T('img/eq/ba_cl.webp')); S.ball.anchor.set(.5); S.ball.width = S.ball.height = BALL_R * 2.15; S.ballC.addChild(S.ball); cam.addChild(S.ballC);
  S.ballSh = new PIXI.Sprite(TEX.shadow); S.ballSh.anchor.set(.5); S.shadows.addChild(S.ballSh);
  S.fxL = new PIXI.Container(); cam.addChild(S.fxL);
  S.fxAdd = new PIXI.Container(); cam.addChild(S.fxAdd);
  S.goalFront = [mkGoal(0, 'front'), mkGoal(1, 'front')]; cam.addChild(S.goalFront[0], S.goalFront[1]);
  // supporters au premier plan (ils sautent pendant les buts)
  S.fans = new PIXI.Sprite(T('img/bg/fans.webp')); cam.addChild(S.fans);
  S.flashOv = new PIXI.Graphics(); root.addChildAt(S.flashOv, 1);
  buildHUD();
  layout();
}

function mkPlayer(p) {
  const root = new PIXI.Container();
  const sh = new PIXI.Sprite(TEX.shadow); sh.anchor.set(.5); S.shadows.addChild(sh);
  const aura = new PIXI.Sprite(TEX.glow); aura.anchor.set(.5); aura.blendMode = PIXI.BLEND_MODES.ADD; aura.alpha = 0; root.addChild(aura);
  const rig = new PIXI.Container(); root.addChild(rig);                 // pivot aux pieds (écrasement)
  const head = new PIXI.Container(); rig.addChild(head);
  const heads = [0, 1, 2, 3].map(i => { const s = new PIXI.Sprite(T('img/h/' + p.ch.id + '_' + i + '.webp')); s.anchor.set(.5, .86); const k = 122 / s.texture.height; s.scale.set(k * p.face, k); s.visible = i === 0; head.addChild(s); return s; });
  const bootC = new PIXI.Container(); rig.addChild(bootC);
  const boot = new PIXI.Sprite(T('img/eq/' + p.boot.id + '.webp')); boot.anchor.set(.22, .92); const bk = 104 / boot.texture.width; boot.scale.set(bk * p.face, bk); bootC.addChild(boot);
  head.y = -36;
  try { rig.filters = [new PIXI.filters.DropShadowFilter({ offset: { x: 0, y: 4 }, color: 0x000000, alpha: .35, blur: 2, quality: 2 })]; } catch (e) { }
  return { root, sh, aura, rig, head, heads, bootC, boot };
}

// cage dessinée : poteaux blancs en tubes + filet en perspective
function mkGoal(side, part) {
  const g = new PIXI.Graphics(); g.side = side; g.part = part; drawGoal(g, 0); return g;
}
function drawGoal(g, wob) {
  g.clear(); const s = g.side, f = s ? -1 : 1, X = x => s ? W - x : x, top = GOAL_TOP, d = GOAL_D, back = -46, by = 20;
  const tube = (pts, w) => { g.lineStyle({ width: w + 6, color: 0x1a1f2b, cap: 'round', join: 'round' }); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p);
    g.lineStyle({ width: w, color: 0xf4f6fb, cap: 'round', join: 'round' }); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p);
    g.lineStyle({ width: w * .32, color: 0xffffff, alpha: .9, cap: 'round' }); g.moveTo(pts[0][0] - 2 * f, pts[0][1] - 2); for (const p of pts.slice(1)) g.lineTo(p[0] - 2 * f, p[1] - 2); };
  if (g.part === 'back') {
    // fond du filet (perspective vers l'arrière) + montants arrière
    const bx = X(back), tx = X(d), bulge = wob * 26;
    g.beginFill(0xffffff, .05); g.moveTo(bx, top - by); g.lineTo(tx, top); g.lineTo(tx, GROUND); g.lineTo(bx, GROUND - by * .4); g.endFill();
    g.lineStyle({ width: 2, color: 0xffffff, alpha: .55 });
    for (let i = 0; i <= 10; i++) { const k = i / 10, y0 = lerp(top - by, GROUND - by * .4, k), y1 = lerp(top, GROUND, k), mid = Math.sin(k * Math.PI) * bulge; g.moveTo(bx - f * mid, y0); g.quadraticCurveTo(lerp(bx, tx, .4) - f * mid * .6, lerp(y0, y1, .4), tx, y1); }
    for (let i = 0; i <= 8; i++) { const k = i / 8, x0 = lerp(bx, tx, k); g.moveTo(x0 - f * Math.sin((1 - k) * Math.PI / 2) * bulge, lerp(top - by, top, k)); g.lineTo(x0 - f * Math.sin((1 - k) * Math.PI / 2) * bulge * .5, lerp(GROUND - by * .4, GROUND, k)); }
    tube([[bx, top - by], [bx, GROUND - by * .4]], 8);
    tube([[bx, top - by], [tx, top - 2]], 8);
  } else {
    // toit du filet + poteau avant et barre transversale
    const bx = X(back), tx = X(d);
    g.lineStyle({ width: 2, color: 0xffffff, alpha: .5 });
    for (let i = 0; i <= 6; i++) { const k = i / 6; g.moveTo(lerp(bx, tx, k), lerp(top - by, top, k)); g.lineTo(lerp(bx, tx, k) + f * 10, lerp(top - by, top, k) + 12); }
    tube([[X(-60), top], [tx, top], [tx, GROUND]], 13);
    g.beginFill(0x000000, .25); g.drawEllipse(tx, GROUND + 3, 16, 4); g.endFill();
  }
}

// ---------- HUD (tableau des scores, joystick, boutons) ----------
function txt(s, size, fill, stroke, sw) {
  return new PIXI.Text(s, { fontFamily: FONT, fontSize: size, fill: fill || 0xffffff, stroke: stroke || 0x14171f, strokeThickness: sw == null ? Math.round(size * .16) : sw, lineJoin: 'round', dropShadow: true, dropShadowDistance: Math.round(size * .06), dropShadowAngle: Math.PI / 2, dropShadowColor: 0x000000, dropShadowAlpha: .5 });
}
function buildHUD() {
  const h = S.hud; h.removeChildren();
  // tableau des scores
  const sb = new PIXI.Container(); S.sb = sb; h.addChild(sb);
  const pan = new PIXI.Graphics(); pan.beginFill(0x0b1430, .92); pan.lineStyle(4, 0x14171f); pan.drawRoundedRect(-210, 8, 420, 74, 22); pan.endFill();
  pan.beginFill(0xffffff, .07); pan.lineStyle(0); pan.drawRoundedRect(-204, 12, 408, 30, 16); pan.endFill(); sb.addChild(pan);
  const tbox = new PIXI.Graphics(); tbox.beginFill(0x1d2a55); tbox.lineStyle(3, 0x14171f); tbox.drawRoundedRect(-56, 18, 112, 54, 14); tbox.endFill(); sb.addChild(tbox);
  S.tTime = txt('90', 40, 0xffffff); S.tTime.anchor.set(.5); S.tTime.y = 47; sb.addChild(S.tTime);
  S.tSc = [0, 1].map(i => { const t = txt('0', 50, 0xffd200); t.anchor.set(.5); t.x = i ? 104 : -104; t.y = 46; sb.addChild(t); return t; });
  S.hIco = [0, 1].map(i => { const c = new PIXI.Container(); const ring = new PIXI.Graphics(); ring.beginFill(i ? 0x2c6fe0 : 0xe70013); ring.lineStyle(4, 0x14171f); ring.drawCircle(0, 0, 38); ring.endFill(); c.addChild(ring);
    const m = new PIXI.Graphics(); m.beginFill(0xffffff); m.drawCircle(0, 0, 34); m.endFill(); c.addChild(m);
    const s = new PIXI.Sprite(T('img/h/' + M.P[i].ch.id + '_0.webp')); s.anchor.set(.5, .45); const k = 78 / s.texture.height; s.scale.set(k * (i ? -1 : 1), k); s.mask = m; c.addChild(s);
    c.x = i ? 250 : -250; c.y = 45; sb.addChild(c);
    const n = txt(M.P[i].name, 20, 0xffffff); n.anchor.set(.5); n.x = c.x; n.y = 98; sb.addChild(n); return c; });
  // joystick
  S.joy = new PIXI.Container(); h.addChild(S.joy);
  const base = new PIXI.Graphics(); base.beginFill(0x000000, .28); base.lineStyle(5, 0xffffff, .55); base.drawCircle(0, 0, 86); base.endFill();
  base.lineStyle(0); base.beginFill(0xffffff, .55); for (const [ax, ay, r] of [[-62, 0, 0], [62, 0, Math.PI], [0, -62, Math.PI / 2]]) { base.drawPolygon(rotPts([[-8, 0], [6, -10], [6, 10]], r, ax, ay)); } base.endFill();
  S.joy.addChild(base);
  const knob = new PIXI.Graphics(); knob.beginFill(0xff8a1a); knob.lineStyle(5, 0x14171f); knob.drawCircle(0, 0, 42); knob.endFill(); knob.beginFill(0xffd27a, .9); knob.lineStyle(0); knob.drawEllipse(-8, -14, 22, 12); knob.endFill();
  S.knob = knob; S.joy.addChild(knob);
  S.joyHint = txt('SAUTER', 16, 0xffffff); S.joyHint.anchor.set(.5); S.joyHint.y = -112; S.joyHint.alpha = .8; S.joy.addChild(S.joyHint);
  // boutons de tir
  S.bLo = mkBtn('img/ui/kick.webp', 'TIR BAS'); S.bHi = mkBtn('img/ui/lob.webp', 'TIR HAUT'); h.addChild(S.bLo, S.bHi);
  S.bPause = new PIXI.Sprite(T('img/ui/pause.webp')); S.bPause.anchor.set(.5); S.bPause.width = S.bPause.height = 62; h.addChild(S.bPause);
  // messages (GOOOL, compte à rebours)
  S.msgC = new PIXI.Container(); h.addChild(S.msgC);
  S.tuto = new PIXI.Container(); h.addChild(S.tuto);
}
function rotPts(pts, a, ox, oy) { const r = []; for (const [x, y] of pts) { r.push(ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)); } return r; }
function mkBtn(src, label) { const c = new PIXI.Container(); const s = new PIXI.Sprite(T(src)); s.anchor.set(.5); s.width = s.height = 128; c.addChild(s); const t = txt(label, 17, 0xffffff); t.anchor.set(.5); t.y = 70; c.addChild(t); c.sp = s; return c; }

function layout() {
  if (!S) return;
  const sw = app.screen.width, sh = app.screen.height, k = sh / H, vw = sw / k;
  VIEW = { k, w: vw, ox: (vw - W) / 2 };
  S.root.scale.set(k);
  // fond : couvre toute la largeur visible, le sol peint reste à la même hauteur
  const bs = Math.max(.8, (vw + 40) / 1672), bg = S.bg; bg.scale.set(bs); bg.x = W / 2 - 1672 * bs / 2; bg.y = (GROUND + 22) - 705 * bs;
  S.bgS = bs;
  S.fans.scale.set(bs); S.fans.x = bg.x; S.fans.baseY = bg.y + 700 * bs; S.fans.y = S.fans.baseY;
  S.lightSp.forEach((g, i) => { const [x, y] = S.lightPts[i]; g.x = bg.x + x * bs; g.y = bg.y + y * bs; });
  S.rays.forEach((r, i) => { const [x, y] = S.lightPts[i]; r.x = bg.x + x * bs; r.y = bg.y + y * bs + 30; r.height = 700; r.width = 260; r.rotation = i ? .55 : -.55; });
  // HUD dans l'espace écran (sans zoom)
  S.sb.x = vw / 2;
  S.joyHome = { x: 165, y: 590 };
  BTN.lo.x = vw - 290; BTN.lo.y = 596; BTN.hi.x = vw - 128; BTN.hi.y = 545; BTN.pause.x = 52; BTN.pause.y = 52;
  S.bLo.x = BTN.lo.x; S.bLo.y = BTN.lo.y; S.bHi.x = BTN.hi.x; S.bHi.y = BTN.hi.y; S.bPause.x = BTN.pause.x; S.bPause.y = BTN.pause.y;
}
addEventListener('resize', () => setTimeout(layout, 50));

// =====================================================================
// Physique
// =====================================================================
function resetKick(first) {
  M.P.forEach(p => p.reset());
  const b = M.b; b.x = W / 2; b.y = 52; b.vx = rnd(-.6, .6); b.vy = 0; b.px = b.x; b.py = b.y; b.last = -1; b.hot = 0; b.sq = 0;
  M.trail.length = 0; M.drop = first ? 0 : 50; M.celeb = null;
}

function stepPlayer(p, I) {
  if (p.kcd > 0) p.kcd--; if (p.kick > 0) p.kick--; if (p.hd > 0) p.hd--; if (p.stun > 0) p.stun--;
  const can = (M.state === 'play') && p.stun <= 0;
  const sp = 4.3 * p.spd, ax = can ? I.ax : 0;
  p.vx += (ax * sp - p.vx) * (p.onGround ? .22 : .1);
  if (can && I.jump && p.onGround) { p.vy = -14.2 * p.jmp; p.an.sv += .1; p.an.s = -.18; sfx('jump'); puff(p.x, GROUND, 6); if (p.side === 0) M.ev.jump = 1; }
  if (can && (I.lo || I.hi) && p.kcd <= 0) { tryKick(p, I.hi ? 'hi' : 'lo'); }
  const air = !p.onGround, fall = p.vy;
  p.vy += G_PL; p.x += p.vx; p.y += p.vy;
  if (p.y > GROUND) { p.y = GROUND; p.vy = 0; if (air && fall > 3) { p.an.sv -= Math.min(.12, fall * .009); p.an.hv += fall * .6; puff(p.x, GROUND, 8); } }
  p.x = clamp(p.x, GOAL_D - 30, W - GOAL_D + 30);
  // ne pas passer à travers la barre transversale
  if ((p.x < GOAL_D + 20 || p.x > W - GOAL_D - 20) && p.hy - HEAD_R < GOAL_TOP + 6 && p.y > GOAL_TOP) { if (p.vy < 0) p.vy = 0; p.y = Math.max(p.y, GOAL_TOP + HEAD_R + 92 + 6); }
  if (p.onGround && Math.abs(p.vx) > 2.6 && M.t % 8 === 0) puff(p.x - p.face * 18, GROUND, 1);
  if (p.side === 0 && Math.abs(p.x - 330) > 80) M.ev.move = 1;
}

function tryKick(p, type) {
  const b = M.b; p.kcd = 16; p.kt = type;
  // tête : ballon à hauteur de la tête
  if (Math.hypot(b.x - p.hx - p.face * 10, b.y - p.hy) < HEAD_R + BALL_R + 20 && b.y < p.y - 58) { header(p); return; }
  p.kick = 16; p.kdone = false; sfx('swish');
}
function header(p) {
  const b = M.b; p.hd = 14; const k = p.hdp;
  if (p.kt === 'hi') aimLob(p, b, .85); else { b.vx = p.face * 10.5 * k; b.vy = Math.min(b.vy, -4.5); }
  b.last = p.side; b.lastT = 'head'; b.sq = .4; b.sqa = Math.atan2(b.vy, b.vx);
  impact(b.x, b.y, 4, .7); sfx('head'); if (p.side === 0) { M.ev.head = 1; M.stats.heads++; }
}
// tir haut précis : trajectoire calculée pour retomber sous la barre adverse
function aimLob(p, b, pw) {
  const tx = p.face > 0 ? W - GOAL_D * .45 : GOAL_D * .45, ty = GOAL_TOP + 58;
  const dx = tx - b.x, dy = ty - b.y, T = clamp(Math.abs(dx) / (10.5 * (pw || 1)), 30, 78);
  let vx = dx / T, vy = (dy - .5 * G_BALL * T * T) / T;
  const err = (1.25 - Math.min(1.2, p.kp)) * .05 + Math.abs(dx) / 1000 * .03; vx *= 1 + rnd(-err, err);
  b.vx = vx; b.vy = Math.max(vy, -20);
}
function shoot(p, b) {
  const k = p.kp;
  if (p.kt === 'hi') aimLob(p, b, 1);
  else { b.vx = p.face * 14 * k; b.vy = -3.4 - Math.max(0, (GROUND - 30 - b.y)) * .01; }
  b.last = p.side; b.lastT = p.kt; b.hot = p.kt === 'lo' ? 26 : 0; b.sq = .5; b.sqa = Math.atan2(b.vy, b.vx);
  impact(b.x, b.y, 5, 1); sfx('kick'); if (p.side === 0) { M.ev[p.kt] = 1; M.stats.shots++; }
}
function impact(x, y, hs, power) {
  M.hs = Math.max(M.hs, hs); M.shake = Math.max(M.shake, 6 * power);
  ring(x, y, power); sparks(x, y, 10 * power, 0xfff3b0);
}

function circBounce(b, cx, cy, r, pvx, pvy, e) {
  const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), m = r + BALL_R;
  if (d >= m || d === 0) return false;
  const nx = dx / d, ny = dy / d; b.x = cx + nx * m; b.y = cy + ny * m;
  const rvx = b.vx - pvx, rvy = b.vy - pvy, vn = rvx * nx + rvy * ny;
  if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; b.vx += pvx * .35; b.vy += pvy * .3; }
  return true;
}
function barBounce(b, x1, x2, y) {
  const cx = clamp(b.x, x1, x2), dx = b.x - cx, dy = b.y - y, d = Math.hypot(dx, dy), m = BALL_R + BAR;
  if (d < m && d > 0) { const nx = dx / d, ny = dy / d; b.x = cx + nx * m; b.y = y + ny * m; const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; if (Math.abs(vn) > 4) { sfx('post'); M.shake = Math.max(M.shake, 4); } } }
}

function stepBall() {
  const b = M.b;
  if (M.drop > 0) { M.drop--; if (M.drop > 0) { b.vx = 0; b.vy = 0; return; } }
  b.vy += G_BALL; b.vx *= .996; if (b.hot > 0) b.hot--;
  const sp = Math.hypot(b.vx, b.vy), mx = 17; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; }
  const touched = [false, false];
  for (let s = 0; s < 3; s++) {
    b.x += b.vx / 3; b.y += b.vy / 3;
    if (b.y > GROUND - BALL_R) { b.y = GROUND - BALL_R; if (b.vy > 0) { if (b.vy > 5) { b.sq = Math.min(.35, b.vy * .03); b.sqa = Math.PI / 2; sfx('bounce', Math.min(1, b.vy / 12)); } b.vy *= -.6; if (Math.abs(b.vy) < 1.3) b.vy = 0; } b.vx *= .985; }
    if (b.y < 30) { b.y = 30; b.vy = Math.abs(b.vy) * .5; }
    if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * .5; } if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * .5; }
    barBounce(b, -60, GOAL_D, GOAL_TOP); barBounce(b, W - GOAL_D, W + 60, GOAL_TOP);
    for (const p of M.P) {
      const h1 = circBounce(b, p.hx, p.hy, HEAD_R, p.vx, p.vy, .55), h2 = circBounce(b, p.x + p.face * 14, p.y - 22, BOOT_R, p.vx, p.vy, .3);
      if (h1 || h2) { touched[p.side] = true; if (Math.hypot(b.vx, b.vy) > 5 && s === 0) { sfx('bump'); b.sq = Math.max(b.sq, .25); b.sqa = Math.atan2(b.vy, b.vx); if (h1) p.an.hv -= 5; } b.last = p.side; b.lastT = h1 ? 'head' : 'body'; }
      if (p.kick > 0 && !p.kdone && p.kick < 14) { if (Math.hypot(b.x - p.fx, b.y - p.fy) < BALL_R + 46) { p.kdone = true; shoot(p, b); } }
    }
  }
  // ballon coincé entre les deux joueurs : il saute
  if (touched[0] && touched[1]) { b.vy = -9; b.vx *= .2; }
  // but
  if (b.x < GOAL_D - 14 && b.y > GOAL_TOP + BAR) goal(1);
  else if (b.x > W - GOAL_D + 14 && b.y > GOAL_TOP + BAR) goal(0);
  // ballon posé sur la barre
  if ((b.x < GOAL_D + 10 || b.x > W - GOAL_D - 10) && b.y < GOAL_TOP && Math.abs(b.vy) < .8 && Math.abs(b.vx) < .6) { b.vx = b.x < W / 2 ? 3 : -3; b.vy = -4; }
  if (b.y < GROUND - BALL_R - 1 || Math.abs(b.vx) > .2) b.rot += b.vx * .045;
  // ballon immobile trop longtemps (posé sur une tête, coincé) : petite relance
  if (Math.abs(b.vx) < .3 && Math.abs(b.vy) < .6) { b.idle = (b.idle || 0) + 1; if (b.idle > 150) { b.vy = -8; b.vx = rnd(-3, 3); b.idle = 0; } } else b.idle = 0;
}

function goal(side) {
  if (M.state !== 'play') return;
  M.score[side]++; M.state = 'goal'; M.st = 190; M.hs = 9; M.slow = 70;
  const gx = side ? 60 : W - 60; M.focus = { x: gx, y: GOAL_TOP + 90 }; M.zoomT = 1.28; M.net[1 - side] = 1; M.flash = .75; M.fanJump = 150; M.shake = 14;
  M.celeb = { side }; M.P[side].an.joy = 1;
  const type = M.b.lastT === 'head' ? 'TÊTE !' : M.b.lastT === 'hi' ? 'LOB !' : 'GOOOL !';
  showMsg(type, side === 0 ? 0xffd200 : 0xff5a5a, 'goal');
  const cols = [0xe70013, 0xffffff, 0xffd200, 0x2c6fe0];
  for (let i = 0; i < 140; i++) confetti(gx + (side ? 30 : -30), GOAL_TOP + 60, cols);
  sfx('goal'); crowdRoar(); vib(120);
  if (M.tuto) M.ev.goal = 1;
  bumpScore(side);
}

// =====================================================================
// IA
// =====================================================================
function stepAI(p) {
  const b = M.b, d = p.ai, att = p.face, o = M.P[1 - p.side];
  p.aiT--;
  if (p.aiT <= 0) {
    p.aiT = Math.round(lerp(13, 4, d) + rnd(0, 4));
    const I = { ax: 0, jump: false, lo: false, hi: false };
    // anticipe où le ballon sera
    const tl = clamp((GROUND - 40 - b.y) / 10, 0, 40), px = clamp(b.x + b.vx * tl * .6, 40, W - 40);
    const myGoal = p.side ? W - 60 : 60, danger = (px - myGoal) * -att < 0 ? 0 : 1;
    let tx;
    const behind = px - att * 48;
    if ((b.x - p.x) * att < -10) tx = px - att * 70;          // ballon derrière : se replacer
    else tx = behind;
    if (Math.abs(b.x - myGoal) < 380 && (b.vx * att < -2)) tx = lerp(myGoal + att * 130, px, .5); // défendre
    // lob qui arrive vers ma cage : je reviens sous la barre et je saute pour le repousser
    const toMe = b.vx * att < -2.5 && b.y < GROUND - 140, land = b.x + b.vx * Math.max(0, (-b.vy + Math.sqrt(Math.max(0, b.vy * b.vy + 2 * G_BALL * (GROUND - 110 - b.y)))) / G_BALL);
    if (toMe && Math.abs(land - myGoal) < 320 && Math.random() < .45 + d * .5) { tx = myGoal + att * (GOAL_D + 55); p.keep = 1; } else p.keep = 0;
    const dx = tx - p.x; I.ax = Math.abs(dx) < 10 ? 0 : clamp(dx / 60, -1, 1) * (.8 + .25 * d);
    // saute pour les ballons hauts
    if (Math.abs(b.x - p.x) < 110 && b.y < p.y - 125 && b.y > p.y - 300 && b.vy > -3 && Math.random() < .35 + d * .5) I.jump = true;
    if (p.keep && Math.abs(b.x - p.x) < 170 && b.y < p.y - 120 && b.y > p.y - 330 && Math.random() < .5 + d * .45) I.jump = true;
    // frappe
    const nearFoot = Math.hypot(b.x - p.fx, b.y - p.fy) < 70, nearHead = Math.hypot(b.x - p.hx, b.y - p.hy) < HEAD_R + BALL_R + 24 && b.y < p.y - 58;
    if ((nearFoot || nearHead) && (b.x - p.x) * att > -10 && Math.random() < .55 + d * .4) { const far = Math.abs((p.side ? GOAL_D : W - GOAL_D) - b.x) > 480; if (far && Math.random() < .45) I.hi = true; else I.lo = true; }
    p.aiI = I;
  } else { p.aiI.jump = false; p.aiI.lo = false; p.aiI.hi = false; }
  return p.aiI;
}

// =====================================================================
// Animation (ressorts) et rendu
// =====================================================================
function animPlayer(p) {
  const a = p.an, b = M.b; a.t++;
  const look = clamp((b.x - p.x) * p.face / 300, -1, 1), hd = p.hd > 0 ? Math.sin(p.hd / 14 * Math.PI) : 0;
  const kk = p.kick > 0 ? Math.sin((1 - p.kick / 16) * Math.PI) : 0;
  let tgt = clamp(-p.vx * .05 * p.face, -.3, .3) + look * .07 + hd * .45 - kk * .22 + (p.stun > 0 ? Math.sin(a.t * .5) * .3 : 0);
  if (M.state === 'goal' && M.celeb) tgt += M.celeb.side === p.side ? Math.sin(a.t * .22) * .2 : .14;
  a.tv += (tgt - a.tilt) * .2; a.tv *= .7; a.tilt += a.tv;
  a.sv += -a.s * .3; a.sv *= .74; a.s += a.sv; if (!p.onGround) a.s += (clamp(-p.vy * .012, -.08, .14) - a.s) * .12;
  a.hv += (clamp(p.vy * 1.1, -12, 12) - a.ho) * .22; a.hv *= .72; a.ho += a.hv * .3;
  if (p.onGround && Math.abs(p.vx) > .6) a.step += Math.abs(p.vx) * .07; else a.step += (Math.round(a.step / Math.PI) * Math.PI - a.step) * .2;
  // expression : 0 neutre, 1 cri, 2 sonné, 3 joie
  let e = 0;
  if (M.state === 'goal' && M.celeb) e = M.celeb.side === p.side ? 3 : 2;
  else if (p.stun > 0) e = 2; else if (p.kick > 0 || p.hd > 0 || !p.onGround) e = 1;
  if (e !== p.expr) { if (e === 1 || p.exprT <= 0) { p.expr = e; p.exprT = 10; } }
  if (p.exprT > 0) p.exprT--;
  // célébration : petits sauts
  if (M.state === 'goal' && M.celeb && M.celeb.side === p.side && p.onGround && a.t % 30 === 0) { p.vy = -9; a.s = -.15; }
}

function renderPlayer(p, v, al) {
  const a = p.an, x = lerp(p.px, p.x, al), y = lerp(p.py, p.y, al);
  const air = clamp((GROUND - y) / 160, 0, 1);
  v.sh.x = x; v.sh.y = GROUND + 4; v.sh.width = (110 - air * 40) * (1 - a.s * .6); v.sh.height = 22 - air * 8; v.sh.alpha = .8 - air * .4;
  const run = p.onGround ? Math.abs(Math.sin(a.step)) * 5 : 0;
  v.root.x = x; v.root.y = y - run;
  v.rig.scale.set(1 - a.s * .75, 1 + a.s);
  // chaussure : élan puis frappe
  const kp = p.kick > 0 ? 1 - p.kick / 16 : 0;
  const kick = p.kick > 0 ? (kp < .25 ? -kp / .25 * .55 : Math.sin(((kp - .25) / .75) * Math.PI) * (p.kt === 'hi' ? 1.25 : .85)) : 0;
  const stepRot = p.onGround ? Math.sin(a.step * 2) * .09 : clamp(-p.vy * .01, -.12, .12);
  v.bootC.rotation = -(kick + stepRot) * p.face; v.bootC.x = p.face * (kick > 0 ? kick * 14 : kick * 8);
  // tête
  const hd = p.hd > 0 ? Math.sin(p.hd / 14 * Math.PI) : 0, br = 1 + Math.sin(a.t * .07 + p.side * 2) * .02;
  v.head.x = p.face * hd * 16; v.head.y = -36 - a.ho * .6 + (hd * 6);
  v.head.rotation = a.tilt * p.face; v.head.scale.set(br, 2 - br);
  v.heads.forEach((s, i) => s.visible = i === p.expr);
  // aura des tirs puissants / célébration
  const glow = p.kick > 0 && p.kt === 'hi' ? .5 : (M.celeb && M.celeb.side === p.side ? .35 + .2 * Math.sin(a.t * .2) : 0);
  v.aura.alpha += (glow - v.aura.alpha) * .2; v.aura.tint = M.celeb && M.celeb.side === p.side ? 0xffd200 : 0x9fe6ff; v.aura.width = v.aura.height = 240; v.aura.y = -90;
}

function render(al) {
  const now = performance.now(), b = M.b;
  // caméra : zoom sur les buts, léger suivi du ballon, tremblement
  M.zoom += (M.zoomT - M.zoom) * .08;
  const zk = clamp((M.zoom - 1) / .28, 0, 1), follow = W / 2 + clamp((b.x - W / 2) * .06, -30, 30);
  let fx = lerp(follow, M.focus.x, zk), fy = lerp(H / 2, M.focus.y, zk); const sh = M.shake > .4 ? M.shake : 0;
  { const hw = VIEW.w / 2 / M.zoom, hh = H / 2 / M.zoom, bl = S.bg.x, br = S.bg.x + 1672 * S.bgS, bt = S.bg.y, bb = S.bg.y + 941 * S.bgS; fx = clamp(fx, bl + hw, Math.max(bl + hw, br - hw)); fy = clamp(fy, bt + hh, Math.max(bt + hh, Math.min(bb, H + 40) - hh)); }
  S.cam.pivot.set(fx, fy); S.cam.scale.set(M.zoom); S.cam.x = VIEW.w / 2 + rnd(-sh, sh) + (fx - W / 2) * (1 - zk) * 0; S.cam.y = H / 2 + rnd(-sh, sh) * .6;
  // décor vivant : projecteurs qui scintillent, rayons qui balaient, flashs de photographes
  S.lightSp.forEach((g, i) => { const base = g.base; const f = .85 + .15 * Math.sin(now * .004 + i * 1.7) + (M.state === 'goal' ? .25 * Math.sin(now * .03 + i) : 0); g.scale.set(base * f * S.bgS * 1.6); g.alpha = .55 + .2 * Math.sin(now * .002 + i); });
  S.rays.forEach((r, i) => { r.rotation = (i ? .5 : -.5) + Math.sin(now * .0004 + i * 2) * .25; r.alpha = .14 + .06 * Math.sin(now * .001 + i); });
  if (Math.random() < (M.state === 'goal' ? .5 : .06)) { const f = new PIXI.Sprite(TEX.glow); f.anchor.set(.5); f.blendMode = PIXI.BLEND_MODES.ADD; f.x = S.bg.x + rnd(60, 1610) * S.bgS; f.y = S.bg.y + rnd(290, 500) * S.bgS; f.scale.set(rnd(.15, .35)); f.life = 8; S.flashes.addChild(f); }
  for (const f of S.flashes.children.slice()) { f.life--; f.alpha = f.life / 8; if (f.life <= 0) { S.flashes.removeChild(f); f.destroy(); } }
  // supporters du premier plan
  const fj = M.fanJump > 0 ? Math.abs(Math.sin(now * .016)) * 16 : Math.abs(Math.sin(now * .003)) * 2;
  S.fans.y = S.fans.baseY - fj;
  // filets
  for (let s = 0; s < 2; s++) { if (M.net[s] > .01) { drawGoal(S.goalBack[s], Math.sin(now * .03) * M.net[s]); } else if (M.net[s] !== 0) { M.net[s] = 0; drawGoal(S.goalBack[s], 0); } }
  // joueurs
  M.P.forEach((p, i) => renderPlayer(p, S.pl[i], al));
  // ballon : écrasement, rotation, traînée, lueur
  const bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al), spd = Math.hypot(b.vx, b.vy);
  S.ballC.x = bx; S.ballC.y = by; S.ball.rotation = b.rot;
  const sq = clamp(b.sq + Math.max(0, spd - 12) * .012, 0, .45); S.ballC.rotation = b.sqa; S.ballC.scale.set(1 + sq, 1 - sq * .7); S.ball.rotation = b.rot - b.sqa;
  S.ballSh.x = bx; S.ballSh.y = GROUND + 4; const ah = clamp(1 - (GROUND - by) / 420, .3, 1); S.ballSh.width = 54 * ah; S.ballSh.height = 12 * ah; S.ballSh.alpha = .7 * ah;
  const hot = b.hot > 0 || spd > 13; S.ballGlow.x = bx; S.ballGlow.y = by; S.ballGlow.alpha += ((hot ? .7 : 0) - S.ballGlow.alpha) * .2; S.ballGlow.width = S.ballGlow.height = 120; S.ballGlow.tint = b.lastT === 'hi' ? 0x9fe6ff : 0xffb347;
  if (M.drop > 0) { S.ballGlow.alpha = .9; S.ballGlow.tint = 0xfff6c0; S.ballGlow.width = S.ballGlow.height = 150 + Math.sin(now * .02) * 20; }
  M.trail.unshift([bx, by, spd]); if (M.trail.length > 16) M.trail.pop();
  const pts = S.trail.geometry.points; for (let i = 0; i < pts.length; i++) { const t = M.trail[Math.min(i, M.trail.length - 1)] || [bx, by]; pts[i].x = t[0]; pts[i].y = t[1]; }
  S.trail.alpha = clamp((spd - 6) / 8, 0, .85); S.trail.tint = b.lastT === 'hi' ? 0xbff0ff : b.hot > 0 ? 0xffc06a : 0xffffff;
  // flash blanc
  S.flashOv.clear(); if (M.flash > .01) { S.flashOv.beginFill(0xffffff, M.flash); S.flashOv.drawRect(-10, -10, VIEW.w + 20, H + 20); S.flashOv.endFill(); }
  renderFx();
  renderHUD(now);
}

// ---------- particules ----------
function addFx(o) { M.fx.push(o); (o.add ? S.fxAdd : S.fxL).addChild(o.sp); }
function puff(x, y, n) { for (let i = 0; i < n; i++) { const sp = new PIXI.Sprite(TEX.smoke); sp.anchor.set(.5); sp.tint = 0xe8dcc0; sp.alpha = .6; const s = rnd(.25, .5); sp.scale.set(s); addFx({ sp, x: x + rnd(-24, 24), y: y - 4, vx: rnd(-1.4, 1.4), vy: rnd(-1.6, -.3), l: 30, ml: 30, g: -.01, grow: .012 }); } }
function sparks(x, y, n, col) { for (let i = 0; i < n; i++) { const sp = new PIXI.Sprite(TEX.dot); sp.anchor.set(.5); sp.tint = col; const a = rnd(0, 6.28), v = rnd(3, 9); sp.scale.set(rnd(.15, .3)); addFx({ sp, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 22, ml: 22, g: .15, add: 1 }); } }
function ring(x, y, p) { const g = new PIXI.Graphics(); addFx({ sp: g, x, y, vx: 0, vy: 0, l: 16, ml: 16, ring: 1, p, add: 1 }); const st = new PIXI.Sprite(TEX.star); st.anchor.set(.5); st.tint = 0xfff6a0; addFx({ sp: st, x, y, vx: 0, vy: 0, l: 10, ml: 10, star: 1, add: 1 }); }
function confetti(x, y, cols) { const sp = new PIXI.Sprite(TEX.rect); sp.anchor.set(.5); sp.tint = pick(cols); const a = rnd(-Math.PI * .95, -Math.PI * .05); const v = rnd(6, 17); addFx({ sp, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: rnd(110, 170), ml: 170, g: .22, conf: 1, rot: rnd(0, 6), vr: rnd(-.3, .3) }); }
function renderFx() {
  for (const f of M.fx) {
    const s = f.sp, k = f.l / f.ml; s.x = f.x; s.y = f.y;
    if (f.ring) { s.clear(); s.lineStyle(8 * k + 1, 0xffffff, k); s.drawCircle(0, 0, BALL_R + (1 - k) * 70 * f.p); }
    else if (f.star) { s.scale.set(.6 + (1 - k) * 1.2); s.alpha = k; s.rotation += .1; }
    else if (f.conf) { s.rotation = f.rot; s.scale.set(1, Math.abs(Math.sin(f.rot * 2)) * .9 + .1); s.alpha = Math.min(1, f.l / 30); }
    else { s.alpha = (f.add ? 1 : .6) * k; if (f.grow) s.scale.set(s.scale.x + f.grow); }
  }
}
function stepFx() {
  for (const f of M.fx) { f.x += f.vx; f.y += f.vy; f.vy += f.g || 0; if (f.conf) { f.vx *= .985; f.vy = Math.min(f.vy, 3.2); f.rot += f.vr; } f.l--; }
  const dead = M.fx.filter(f => f.l <= 0); for (const f of dead) { f.sp.parent && f.sp.parent.removeChild(f.sp); f.sp.destroy(); }
  M.fx = M.fx.filter(f => f.l > 0);
  // confettis d'ambiance qui tombent doucement
  if (Math.random() < .08) { const sp = new PIXI.Sprite(TEX.rect); sp.anchor.set(.5); sp.tint = pick([0xe70013, 0xffffff, 0xffd200]); sp.scale.set(.7); addFx({ sp, x: rnd(-100, W + 100), y: -10, vx: rnd(-.5, .5), vy: rnd(.6, 1.2), l: 600, ml: 600, g: 0, conf: 1, rot: rnd(0, 6), vr: rnd(-.08, .08) }); }
}

// ---------- HUD ----------
let LASTSEC = -1;
function bumpScore(side) { const t = S.tSc[side]; t.text = String(M.score[side]); t.pop = 1; }
function renderHUD(now) {
  const sec = Math.ceil(M.time / 60); if (sec !== LASTSEC) { LASTSEC = sec; S.tTime.text = M.tuto ? '∞' : String(Math.max(0, sec)); S.tTime.style.fill = sec <= 10 && !M.tuto ? 0xff5a5a : 0xffffff; if (sec <= 5 && sec > 0 && M.state === 'play' && !M.tuto) sfx('tick'); }
  S.tTime.scale.set(sec <= 10 && !M.tuto ? 1 + .12 * Math.abs(Math.sin(now * .006)) : 1);
  S.tSc.forEach(t => { t.pop = (t.pop || 0) * .9; t.scale.set(1 + t.pop * .8); });
  S.hIco.forEach((c, i) => { c.rotation = M.celeb && M.celeb.side === i ? Math.sin(now * .015) * .15 : 0; });
  // joystick
  const show = !M.P[0].ai;
  S.joy.visible = show; S.bLo.visible = S.bHi.visible = show;
  if (JOY.act) { S.joy.x = JOY.bx; S.joy.y = JOY.by; S.knob.x = JOY.kx; S.knob.y = JOY.ky; S.joy.alpha = 1; }
  else { S.joy.x += (S.joyHome.x - S.joy.x) * .3; S.joy.y += (S.joyHome.y - S.joy.y) * .3; S.knob.x *= .6; S.knob.y *= .6; S.joy.alpha = .75; }
  S.joyHint.alpha = JOY.ky < -40 ? 1 : .55; S.joyHint.scale.set(JOY.ky < -40 ? 1.15 : 1);
  for (const [k, c] of [['lo', S.bLo], ['hi', S.bHi]]) { const b = BTN[k]; if (b.t > 0) b.t--; const pr = b.id !== null || b.t > 0; c.scale.set(pr ? .88 : 1 + .03 * Math.sin(now * .004 + (k === 'hi' ? 1 : 0))); c.alpha = M.state === 'play' ? 1 : .6; }
  // message
  const m = M.msg; S.msgC.removeChildren();
  if (m) {
    m.t++; const c = new PIXI.Container(); S.msgC.addChild(c); c.x = VIEW.w / 2; c.y = 300;
    if (m.kind === 'goal') {
      const k = clamp(m.t / 14, 0, 1), e = 1 - Math.pow(1 - k, 3), out = clamp((m.t - 95) / 20, 0, 1);
      c.x = VIEW.w / 2 + (1 - e) * VIEW.w * .8 - out * VIEW.w; c.rotation = -.06;
      const rays = new PIXI.Graphics(); rays.beginFill(0xffd200, .18); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + m.t * .02; rays.drawPolygon([0, 0, Math.cos(a - .12) * 520, Math.sin(a - .12) * 520, Math.cos(a + .12) * 520, Math.sin(a + .12) * 520]); } rays.endFill(); rays.blendMode = PIXI.BLEND_MODES.ADD; c.addChild(rays);
      const t = m.tx; t.scale.set(1 + .06 * Math.sin(m.t * .3)); c.addChild(t);
      for (let i = 0; i < 6; i++) { const l = new PIXI.Graphics(); l.beginFill(0xffffff, .7 * (1 - e)); l.drawRect(-700 - i * 40, -80 + i * 30, 300 + i * 30, 6); l.endFill(); c.addChild(l); }
    } else {
      const k = clamp(m.t / 10, 0, 1), sc = m.kind === 'count' ? 1.9 - k * .9 : .5 + k * .6; c.scale.set(sc); c.alpha = Math.min(1, (m.d - m.t) / 10);
      c.addChild(m.tx);
    }
    if (m.t >= m.d) { M.msg = null; }
  }
  renderTuto(now);
}
function showMsg(s, col, kind) {
  const size = kind === 'goal' ? 150 : kind === 'count' ? 170 : 90;
  const tx = new PIXI.Text(s, { fontFamily: FONT, fontSize: size, fill: [0xfffbe0, col || 0xffd200], fillGradientStops: [.15, .75], stroke: 0x14171f, strokeThickness: Math.round(size * .14), lineJoin: 'round', dropShadow: true, dropShadowDistance: Math.round(size * .08), dropShadowAngle: Math.PI / 2, dropShadowColor: 0x6b2a00, dropShadowAlpha: 1, padding: 30 });
  tx.anchor.set(.5);
  M.msg = { tx, t: 0, d: kind === 'goal' ? 120 : kind === 'count' ? 40 : 60, kind };
}

// =====================================================================
// Démo guidée (premier lancement)
// =====================================================================
const TUTO = [
  { t: 'Glisse le joystick pour bouger', k: 'move', btn: 'joyx' },
  { t: 'Pousse le joystick vers le haut : saute !', k: 'jump', btn: 'joyup' },
  { t: 'TIR BAS : frappe le ballon !', k: 'lo', btn: 'lo', ball: 'front' },
  { t: 'TIR HAUT : un lob précis vers la cage', k: 'hi', btn: 'hi', ball: 'front' },
  { t: 'À toi ! Marque un but', k: 'goal', btn: null, ball: 'front' }];
function tutoStep() {
  const T = M.tuto, st = TUTO[T.i]; if (!st) return; T.t++; const p = M.P[0], b = M.b, o = M.P[1];
  if (T.t === 1) { M.ev[st.k] = 0; if (st.ball === 'front') { b.x = p.x + 150; b.y = GROUND - 130; b.vx = -1; b.vy = 0; b.px = b.x; b.py = b.y; } }
  if (T.i < 4) { o.x += (W - 220 - o.x) * .1; o.vx = 0; }
  T.slow = (st.k === 'lo' || st.k === 'hi') && Math.hypot(b.x - p.fx, b.y - p.fy) < 90;
  if (st.ball && st.k !== 'goal' && T.t > 140 && b.y >= GROUND - BALL_R - 1 && Math.abs(b.vx) < .5) T.t = 0;
  if (M.ev[st.k] && T.t > 10) { T.i++; T.t = 0; sfx('coin'); if (TUTO[T.i]) showMsg(T.i === 4 ? 'BRAVO !' : 'BIEN !', 0x7dff2c, 'small'); else endTuto(); }
}
function renderTuto(now) {
  S.tuto.removeChildren(); const T = M.tuto; if (!T) return; const st = TUTO[T.i]; if (!st) return;
  const bar = new PIXI.Container(); bar.x = VIEW.w / 2; bar.y = 150; S.tuto.addChild(bar);
  const bg = new PIXI.Graphics(); bg.beginFill(0x0b1a3a, .88); bg.lineStyle(4, 0xffd200); bg.drawRoundedRect(-330, -34, 660, 68, 34); bg.endFill(); bar.addChild(bg);
  const t = txt(st.t, 28, 0xffffff); t.anchor.set(.5); bar.addChild(t);
  for (let i = 0; i < TUTO.length; i++) { const d = new PIXI.Graphics(); d.beginFill(i < T.i ? 0x7dff2c : i === T.i ? 0xffd200 : 0x55607a); d.drawCircle(-48 + i * 24, 52, 7); d.endFill(); bar.addChild(d); }
  if (!st.btn) return;
  let hx, hy, drag = 0;
  if (st.btn === 'lo') { hx = BTN.lo.x; hy = BTN.lo.y; } else if (st.btn === 'hi') { hx = BTN.hi.x; hy = BTN.hi.y; }
  else { hx = S.joyHome.x; hy = S.joyHome.y; drag = 1; }
  const show = st.btn.startsWith('joy') || T.slow;
  if (!show) return;
  const hand = new PIXI.Sprite(T_('img/ui/hand.webp')); hand.width = 80; hand.height = 124; const ph = (now % 1200) / 1200;
  if (st.btn === 'joyx') { hand.x = hx - 10 + Math.sin(ph * Math.PI * 2) * 60; hand.y = hy - 6; }
  else if (st.btn === 'joyup') { hand.x = hx - 10; hand.y = hy - 6 - Math.sin(ph * Math.PI) * 70; }
  else { hand.x = hx - 12; hand.y = hy - 4 + Math.abs(Math.sin(now * .01)) * 14; const r = new PIXI.Graphics(); r.lineStyle(6, 0xffd200, .6 + .4 * Math.sin(now * .012)); r.drawCircle(hx, hy, 76 + Math.sin(now * .012) * 6); S.tuto.addChild(r); }
  S.tuto.addChild(hand);
}
const T_ = T;

// =====================================================================
// Boucle
// =====================================================================
let acc = 0, last = 0;
function tick() {
  if (!M) return;
  const now = performance.now(); let dt = now - last; last = now; if (!(dt > 0) || dt > 250) dt = STEP;
  if (!M.paused) {
    acc += dt; let n = 0;
    while (acc >= STEP && n < 5) {
      acc -= STEP; n++;
      // ralentis : buts, démo
      const slowF = M.tuto && M.tuto.slow ? 4 : M.slow > 0 ? 3 : 1;
      if (M.slow > 0) M.slow--;
      M.slowAcc++; if (M.slowAcc % slowF) { continue; }
      for (const o of [M.P[0], M.P[1], M.b]) { o.px = o.x; o.py = o.y; }
      step();
      if (!M) return;
    }
    if (n === 5) acc = 0;
  }
  render(clamp(acc / STEP, 0, 1));
}
function step() {
  M.t++;
  if (M.hs > 0) { M.hs--; stepFx(); return; }
  if (M.state === 'ready') {
    M.st--;
    if (!M.tuto && (M.st === 150 || M.st === 105 || M.st === 60)) { showMsg(M.st === 150 ? '3' : M.st === 105 ? '2' : '1', M.st === 60 ? 0xff5a3c : 0xffd200, 'count'); sfx('beep'); }
    if (M.st <= (M.tuto ? 150 : 15)) { M.state = 'play'; if (!M.tuto) { showMsg('GO !', 0x7dff2c, 'count'); sfx('whistle'); } }
  } else if (M.state === 'goal') {
    M.st--; if (M.st === 60) { M.zoomT = 1; }
    if (M.st <= 0) { if (M.time <= 0 && !M.tuto) { endMatch(); return; } resetKick(false); M.state = 'ready'; M.st = 125; }
  } else if (M.state === 'play') {
    if (M.tuto) tutoStep(); else { M.time--; if (M.time <= 0 && M.b.y > GOAL_TOP - 200) { endMatch(); return; } }
    if (!M) return;
  }
  const I0 = M.P[0].ai ? stepAI(M.P[0]) : readInput(), I1 = (M.tuto && M.tuto.i < 4) ? { ax: 0 } : stepAI(M.P[1]);
  stepPlayer(M.P[0], I0); stepPlayer(M.P[1], I1);
  // les joueurs ne se traversent pas
  const a = M.P[0], c = M.P[1], dx = c.x - a.x, min = 74; if (Math.abs(dx) < min && Math.abs(a.y - c.y) < 90) { const push = (min - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1); a.x -= push; c.x += push; }
  animPlayer(a); animPlayer(c);
  if (M.state === 'play' || M.state === 'goal') stepBall(); else { M.b.vy += .3; M.b.y = Math.min(M.b.y + M.b.vy, 150); if (M.b.y >= 150) { if (M.b.vy > 3) { M.b.sq = .3; M.b.sqa = Math.PI / 2; } M.b.vy = M.b.vy > 3 ? -M.b.vy * .35 : 0; } }
  M.b.sq *= .82; M.shake *= .86; M.flash *= .9; M.net[0] *= .97; M.net[1] *= .97; if (M.fanJump > 0) M.fanJump--;
  stepFx();
}

function pauseMatch() { if (!M || M.state === 'end' || M.paused) return; M.paused = true; JOY.id = null; JOY.act = false; INP.ax = 0; onPause(); }
function resumeMatch() { if (!M) return; M.paused = false; last = performance.now(); }
function quitMatch() { crowdSound(false); M = null; app.ticker.stop(); app.stage.removeChildren(); S = null; }
function endMatch() {
  const r = { score: M.score.slice(), o: M.o, stats: M.stats }; M.state = 'end'; sfx('whistle3'); crowdSound(false);
  setTimeout(() => { quitMatch(); onMatchEnd(r); }, 900);
}
function endTuto() { const o = M.o; setTimeout(() => { quitMatch(); onTutoEnd(o); }, 1400); }
