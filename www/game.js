// =====================================================================
// Koura Virage — moteur de match (PixiJS / WebGL)
// Monde 1280 x 720 : tribunes peintes en haut, pelouse vue de côté,
// bande de commandes en bas (comme Head Ball 2, les boutons ne cachent pas le terrain).
// =====================================================================
const W = 1280, H = 720, BAND = 596, PITCH_TOP = 436, GROUND = 548;
const GOAL_D = 104, GOAL_TOP = 352, GDX = 16, GDY = -26;   // bouche de la cage, perspective
const BALL_R = 17, HEAD_R = 36, HEAD_H = 108, BOOT_W = 92, HEAD_Y = -44;
const G_BALL = 0.34, G_PL = 0.66;
const MATCH_TIME = 60;
const STEP = 1000 / 60;

let app = null, TEX = {}, FONT = 'Luckiest Guy';
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[Math.random() * a.length | 0];
const T = p => PIXI.Texture.from(p);

function initPixi() {
  if (app) return;
  app = new PIXI.Application({ resizeTo: window, antialias: true, backgroundColor: 0x0b1020, resolution: Math.min(2, window.devicePixelRatio || 1), autoDensity: true, powerPreference: 'high-performance' });
  document.getElementById('stage').appendChild(app.view);
  app.ticker.add(tick); app.ticker.stop();
  setupInput();
}
function genTex() {
  if (TEX.glow) return;
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  TEX.glow = mk(128, 128, x => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  TEX.dot = mk(32, 32, x => { x.fillStyle = '#fff'; x.beginPath(); x.arc(16, 16, 15, 0, 7); x.fill(); });
  TEX.rect = mk(16, 10, x => { x.fillStyle = '#fff'; x.fillRect(0, 0, 16, 10); });
  TEX.smoke = mk(64, 64, x => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.6, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  TEX.shadow = mk(128, 32, x => { const g = x.createRadialGradient(64, 16, 0, 64, 16, 64); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.setTransform(1, 0, 0, .25, 0, 12); x.beginPath(); x.arc(64, 16, 64, 0, 7); x.fill(); });
  TEX.trail = mk(64, 8, x => { const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 8); });
  TEX.ray = mk(64, 512, x => { const g = x.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(24, 0); x.lineTo(40, 0); x.lineTo(64, 512); x.lineTo(0, 512); x.fill(); });
  TEX.star = mk(64, 64, x => { x.translate(32, 32); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 30, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); });
  TEX.band = mk(8, 128, x => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#2a3552'); g.addColorStop(.08, '#1a2238'); g.addColorStop(1, '#0c1120'); x.fillStyle = g; x.fillRect(0, 0, 8, 128); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, 0, 8, 3); });
}
const IMG_LIST = () => {
  const a = ['img/ui/kick.webp', 'img/ui/lob.webp', 'img/ui/pause.webp', 'img/ui/hand.webp', 'img/fx/fire.webp', 'img/fx/honey.webp', 'img/fx/ice.webp', 'img/fx/sandal.webp', 'img/fx/stars.webp', 'img/fx/tornado.webp'];
  for (const v of VENUES) a.push(v.img);
  for (const c of CHARS) for (let i = 0; i < 4; i++) a.push('img/h/' + c.id + '_' + i + '.webp');
  for (const b of BOOTS) a.push('img/eq/' + b.id + '.webp');
  for (const x of ACC) if (x.kind) a.push('img/eq/' + x.id + '.webp');
  for (const p of POWERS) a.push('img/pw/' + p.id + '.webp');
  for (let i = 0; i < 16; i++) a.push('img/cr/' + i + '.webp');
  return a;
};
let LOADED = false;
async function loadAssets(onProg) {
  if (LOADED) return;
  await PIXI.Assets.load(IMG_LIST(), p => onProg && onProg(p));
  try { await document.fonts.load('60px "' + FONT + '"'); await document.fonts.load('30px "Lilita One"'); } catch (e) { }
  LOADED = true;
}

// =====================================================================
// Entrées : joystick (bouger + pousser vers le haut pour sauter), TIR BAS, TIR HAUT, POUVOIR
// =====================================================================
const INP = { ax: 0, up: false, jumpEdge: false, lo: false, hi: false, pw: false, k: {} };
const JOY = { id: null, bx: 0, by: 0, kx: 0, ky: 0, act: false, armed: true, R: 54 };
const BTN = { lo: { id: null, x: 0, y: 0, r: 48, t: 0 }, hi: { id: null, x: 0, y: 0, r: 48, t: 0 }, pw: { id: null, x: 0, y: 0, r: 50, t: 0 }, pause: { x: 0, y: 0, r: 30 } };
let VIEW = { k: 1, w: W, ox: 0 };
function toView(e) { const r = app.view.getBoundingClientRect(); return { x: (e.clientX - r.left) / VIEW.k, y: (e.clientY - r.top) / VIEW.k }; }
function setupInput() {
  const el = app.view; el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => {
    if (!M) return; e.preventDefault(); au(); if (M.paused) return;
    const p = toView(e);
    if (Math.hypot(p.x - BTN.pause.x, p.y - BTN.pause.y) < BTN.pause.r + 16) { pauseMatch(); return; }
    for (const k of ['lo', 'hi', 'pw']) { const b = BTN[k]; if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.45) { b.id = e.pointerId; INP[k] = true; b.t = 8; return; } }
    if (p.x < VIEW.w * .5 && JOY.id === null) { JOY.id = e.pointerId; JOY.bx = clamp(p.x, 80, VIEW.w * .4); JOY.by = (BAND + H) / 2; JOY.kx = p.x - JOY.bx; JOY.ky = p.y - JOY.by; JOY.act = true; joyUpd(); }
  });
  el.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) { const p = toView(e); JOY.kx = p.x - JOY.bx; JOY.ky = p.y - JOY.by; joyUpd(); } });
  const up = e => { if (e.pointerId === JOY.id) { JOY.id = null; JOY.act = false; JOY.kx = JOY.ky = 0; joyUpd(); } for (const k of ['lo', 'hi', 'pw']) if (BTN[k].id === e.pointerId) BTN[k].id = null; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', up);
  addEventListener('keydown', e => {
    if (!M) return; INP.k[e.code] = true;
    if (['KeyX', 'KeyJ'].includes(e.code)) { INP.lo = true; BTN.lo.t = 8; }
    if (['KeyZ', 'KeyK', 'KeyC'].includes(e.code)) { INP.hi = true; BTN.hi.t = 8; }
    if (['KeyV', 'KeyL'].includes(e.code)) { INP.pw = true; BTN.pw.t = 8; }
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) INP.jumpEdge = true;
    if (e.code === 'Escape') pauseMatch();
  });
  addEventListener('keyup', e => { INP.k[e.code] = false; });
}
function joyUpd() {
  const R = JOY.R, d = Math.hypot(JOY.kx, JOY.ky);
  if (d > R) { JOY.kx *= R / d; JOY.ky *= R / d; }
  const nx = JOY.kx / R; INP.ax = Math.abs(nx) < .16 ? 0 : clamp((nx - Math.sign(nx) * .16) / .6, -1, 1);
  const upNow = JOY.ky < -R * .45;
  if (upNow && JOY.armed) { INP.jumpEdge = true; JOY.armed = false; }
  if (JOY.ky > -R * .2) JOY.armed = true;
  INP.up = upNow;
}
function readInput() {
  const k = INP.k; let ax = INP.ax;
  if (k.ArrowLeft || k.KeyA) ax = -1; if (k.ArrowRight || k.KeyD) ax = 1;
  const r = { ax, jump: INP.jumpEdge || INP.up, lo: INP.lo, hi: INP.hi, pw: INP.pw };
  INP.jumpEdge = INP.lo = INP.hi = INP.pw = false; return r;
}

// =====================================================================
// Joueurs et match
// =====================================================================
let M = null;
class Player {
  constructor(side, o) {
    this.side = side; this.face = side ? -1 : 1; this.ch = CH(o.ch); this.boot = BT(o.boot); this.name = o.name; this.ai = o.ai || 0;
    this.club = CL(o.club); this.gear = o.gear || {}; this.evo = o.evo || 1; this.power = o.power || 'harissa';
    const bon = { spd: 0, jmp: 0, kp: 0, hd: 0 }; const add = b => { for (const k in b || {}) bon[k] += b[k]; };
    const lv = o.lv || {}; add(lvB(this.boot.b, lv[this.boot.id])); for (const s in this.gear) { const a = AC_(this.gear[s]); if (a) add(lvB(a.b, lv[a.id])); }
    this.pwf = PWF(lv[o.power || 'harissa']);
    const e = 1 + EVO_B[this.evo - 1] / 100, c = this.ch;
    this.spd = (c.spd || 1) * (1 + bon.spd / 100) * e; this.jmp = (c.jmp || 1) * (1 + bon.jmp / 100) * Math.sqrt(e);
    this.kp = (c.kp || 1) * (1 + bon.kp / 100) * e; this.hdp = (c.hd || 1) * (1 + bon.hd / 100) * e;
    this.pw = 0; this.fireNext = 0; this.frz = 0; this.glue = 0; this.big = 0; this.aiPw = rnd(60, 240);
    this.reset();
  }
  reset() {
    this.x = this.side ? W - 300 : 300; this.y = GROUND; this.vx = 0; this.vy = 0; this.px = this.x; this.py = this.y;
    this.kick = 0; this.kt = 'lo'; this.kdone = false; this.kcd = 0; this.hd = 0; this.stun = 0; this.frz = 0; this.glue = 0;
    this.an = { tilt: 0, tv: 0, s: 0, sv: 0, ho: 0, hv: 0, step: 0, t: Math.random() * 100 };
    this.expr = 0; this.exprT = 0; this.aiT = 0; this.aiI = { ax: 0 };
  }
  get onGround() { return this.y >= GROUND - .5; }
  get hr() { return HEAD_R * (this.big > 0 ? 1.45 : 1); }
  get hx() { return this.x + this.face * 3; }
  get hy() { return this.y - 84 - (this.big > 0 ? 18 : 0); }
  get fx() { return this.x + this.face * 34; }
  get fy() { return this.y - 16; }
  get locked() { return this.stun > 0 || this.frz > 0; }
}
const gtop = s => GOAL_TOP - (M && M.bigGoal[s] > 0 ? 70 : 0);

function newMatch(o) {
  genTex();
  M = {
    o, t: 0, time: MATCH_TIME * 60, state: 'ready', st: 170, score: [0, 0], hs: 0, slow: 0, slowAcc: 0,
    P: [new Player(0, o.me), new Player(1, o.op)], venue: VENUES.find(v => v.id === o.venue) || VENUES[0],
    b: { x: W / 2, y: GROUND - 250, vx: 0, vy: 0, px: W / 2, py: GROUND - 250, rot: 0, sq: 0, sqa: 0, last: -1, lastT: '', hot: 0, fire: 0, idle: 0 },
    trail: [], fx: [], proj: [], shake: 0, net: [0, 0], flash: 0, bigGoal: [0, 0], card: null,
    tuto: o.tuto ? { i: 0, t: 0, slow: false } : null, ev: {}, msg: null, paused: false, stats: { shots: 0, heads: 0, pw: 0, hg: 0 }
  };
  buildScene(); kickoff(-1); app.ticker.start(); crowdSound(true);
}

// ---------- scène ----------
let S = null;
function buildScene() {
  if (S) { app.stage.removeChildren(); S.root.destroy({ children: true }); }
  const root = new PIXI.Container(), cam = new PIXI.Container(), hud = new PIXI.Container();
  root.addChild(cam, hud); app.stage.addChild(root); S = { root, cam, hud };
  const V = M.venue;
  S.bg = new PIXI.Sprite(T(V.img)); cam.addChild(S.bg);
  S.lights = new PIXI.Container(); cam.addChild(S.lights);
  S.lightPts = V.id === 'stade' ? [[165, 80, 2.2], [1510, 80, 2.2], [40, 150, 1], [1630, 150, 1], [290, 230, .7], [1380, 230, .7], [570, 270, .55], [1100, 270, .55], [700, 350, .6], [975, 350, .6]] : V.id === 'plage' ? [[1450, 90, 2.4]] : [[300, 120, .8], [1250, 160, .8]];
  S.lightSp = S.lightPts.map(([x, y, s]) => { const g = new PIXI.Sprite(TEX.glow); g.anchor.set(.5); g.blendMode = PIXI.BLEND_MODES.ADD; g.tint = 0xfff2c8; g.base = s; S.lights.addChild(g); return g; });
  S.rays = (V.id === 'stade' ? [0, 1] : []).map(i => { const r = new PIXI.Sprite(TEX.ray); r.anchor.set(.5, 0); r.blendMode = PIXI.BLEND_MODES.ADD; r.alpha = .2; S.lights.addChild(r); return r; });
  S.flashes = new PIXI.Container(); cam.addChild(S.flashes);
  S.pitch = new PIXI.Graphics(); cam.addChild(S.pitch);
  S.shadows = new PIXI.Container(); cam.addChild(S.shadows);
  S.goalBack = [new PIXI.Graphics(), new PIXI.Graphics()]; cam.addChild(...S.goalBack);
  S.under = new PIXI.Container(); cam.addChild(S.under);
  S.pl = M.P.map(p => mkPlayer(p)); S.pl.forEach(v => cam.addChild(v.root));
  S.trail = new PIXI.SimpleRope(TEX.trail, Array.from({ length: 16 }, () => new PIXI.Point(W / 2, 150)), .5); S.trail.blendMode = PIXI.BLEND_MODES.ADD; cam.addChild(S.trail);
  S.ballGlow = new PIXI.Sprite(TEX.glow); S.ballGlow.anchor.set(.5); S.ballGlow.blendMode = PIXI.BLEND_MODES.ADD; cam.addChild(S.ballGlow);
  S.fire = new PIXI.Sprite(T('img/fx/fire.webp')); S.fire.anchor.set(.82, .5); S.fire.visible = false; cam.addChild(S.fire);
  S.ballC = new PIXI.Container(); const bid = AC_(M.P[0].gear.ball) ? M.P[0].gear.ball : 'ba_cl';
  S.ball = new PIXI.Sprite(T('img/eq/' + bid + '.webp')); S.ball.anchor.set(.5); S.ball.width = S.ball.height = BALL_R * 2.2; S.ballC.addChild(S.ball); cam.addChild(S.ballC);
  S.ballSh = new PIXI.Sprite(TEX.shadow); S.ballSh.anchor.set(.5); S.shadows.addChild(S.ballSh);
  S.projL = new PIXI.Container(); cam.addChild(S.projL);
  S.fxL = new PIXI.Container(); cam.addChild(S.fxL); S.fxAdd = new PIXI.Container(); cam.addChild(S.fxAdd);
  S.goalFront = [new PIXI.Graphics(), new PIXI.Graphics()]; cam.addChild(...S.goalFront);
  S.flashOv = new PIXI.Graphics(); root.addChildAt(S.flashOv, 1);
  buildHUD(); layout(); drawGoals();
}

function mkPlayer(p) {
  const root = new PIXI.Container();
  const sh = new PIXI.Sprite(TEX.shadow); sh.anchor.set(.5); S.shadows.addChild(sh);
  const aura = new PIXI.Sprite(TEX.glow); aura.anchor.set(.5); aura.blendMode = PIXI.BLEND_MODES.ADD; aura.alpha = 0; root.addChild(aura);
  const rig = new PIXI.Container(); root.addChild(rig);
  // chaussure (les images regardent vers la gauche : on les retourne pour qu'elles pointent vers l'adversaire)
  const bootC = new PIXI.Container(); rig.addChild(bootC);
  const boot = new PIXI.Sprite(T('img/eq/' + p.boot.id + '.webp')); boot.anchor.set(.5, .93); const bk = BOOT_W / boot.texture.width; boot.scale.set(-bk * p.face, bk); boot.x = p.face * 22; bootC.addChild(boot);
  // tête (4 expressions) + accessoires placés selon le visage de chaque personnage
  const head = new PIXI.Container(); rig.addChild(head); head.y = HEAD_Y;
  const G = HGEO(p.ch.id), Hh = HEAD_H, X = v => (v - .5 * G.w) * Hh * p.face, Y = v => (v - .86) * Hh;
  const faceC = new PIXI.Container(); head.addChild(faceC);
  const heads = [0, 1, 2, 3].map(i => { const s = new PIXI.Sprite(T('img/h/' + p.ch.id + '_' + i + '.webp')); s.anchor.set(.5, .86); const k = Hh / s.texture.height; s.scale.set(k * p.face, k); s.visible = i === 0; faceC.addChild(s); return s; });
  const g = p.gear, has = id => id && AC_(id) && AC_(id).kind, tint = [...heads];
  if (has(g.scarf)) { const s = new PIXI.Sprite(T('img/eq/' + g.scarf + '.webp')); s.anchor.set(.5); const k = .74 * Hh / s.texture.width; s.scale.set(k * p.face, k); s.x = X(G.nx); s.y = Y(.9); head.addChild(s); tint.push(s); }
  if (has(g.glasses)) { const s = new PIXI.Sprite(T('img/eq/' + g.glasses + '.webp')); s.anchor.set(.5); const k = (GLW[g.glasses] || .5) * Hh / s.texture.width; s.scale.set(k * p.face, k); s.x = X(G.ex); s.y = Y(G.ey); head.addChild(s); tint.push(s); }
  if (has(g.hat)) {
    const hg = HATG[g.hat] || { w: 1.2, ax: .5, ay: .8 }, cut = g.hat === 'h_laurier' && !G.hg ? 0 : G.cut;
    if (cut) { const m = new PIXI.Graphics(); m.beginFill(0xffffff); m.drawRect(-Hh * 1.5, Y(cut), Hh * 3, Hh * 1.5); m.endFill(); head.addChild(m); faceC.mask = m; }   // le chapeau remplace la chéchia / le casque
    const s = new PIXI.Sprite(T('img/eq/' + g.hat + '.webp')); s.anchor.set(hg.ax, hg.ay); const k = hg.w * G.hw * Hh / s.texture.width; s.scale.set(k * p.face * (hg.flip ? -1 : 1), k); s.x = X(G.cx); s.y = Y(G.cut); head.addChild(s); tint.push(s);
  }
  const ice = new PIXI.Sprite(T('img/fx/ice.webp')); ice.anchor.set(.5, .8); ice.width = 130; ice.height = 120; ice.alpha = 0; rig.addChild(ice);
  const honey = new PIXI.Sprite(T('img/fx/honey.webp')); honey.anchor.set(.5, .6); honey.width = 130; honey.height = 50; honey.alpha = 0; S.under.addChild(honey);
  try { rig.filters = [new PIXI.filters.DropShadowFilter({ offset: { x: 0, y: 3 }, color: 0x000000, alpha: .35, blur: 2, quality: 2 })]; } catch (e) { }
  return { root, sh, aura, rig, head, heads, bootC, boot, ice, honey, tint };
}

// pelouse vue de côté avec bandes, lignes et terre usée (comme Head Ball)
function drawPitch() {
  const g = S.pitch, V = M.venue, x0 = -VIEW.ox - 40, x1 = W + VIEW.ox + 40, top = PITCH_TOP, bot = BAND + 4, cx = W / 2;
  g.clear();
  g.beginFill(V.grass[0]); g.drawRect(x0, top, x1 - x0, bot - top); g.endFill();
  const sw = 96, pt = x => cx + (x - cx) * .9;
  for (let x = cx - sw * 20; x < x1 + sw; x += sw * 2) { g.beginFill(V.grass[1]); g.drawPolygon([pt(x), top, pt(x + sw), top, x + sw, bot, x, bot]); g.endFill(); }
  g.beginFill(0x000000, .16); g.drawRect(x0, top, x1 - x0, 10); g.endFill(); g.beginFill(0x000000, .08); g.drawRect(x0, top + 10, x1 - x0, 14); g.endFill();
  g.beginFill(0x000000, .12); g.drawRect(x0, bot - 26, x1 - x0, 26); g.endFill();
  const L = V.line, yb = top + 14, yf = bot - 16;
  g.lineStyle({ width: 4, color: L, alpha: .85 });
  g.moveTo(x0, yb); g.lineTo(x1, yb); g.moveTo(x0, yf); g.lineTo(x1, yf);
  g.moveTo(pt(cx), yb); g.lineTo(cx, yf);
  g.drawEllipse(cx, (yb + yf) / 2 + 2, 150, 40);
  for (const s of [0, 1]) { const X = x => s ? W - x : x; g.drawPolygon([X(pt(GOAL_D + 6)), yb, X(pt(GOAL_D + 170)), yb, X(GOAL_D + 200), yf, X(GOAL_D + 6), yf]); }
  g.lineStyle(0);
  const mud = V.id === 'stade' ? 0x8a5a2b : V.id === 'plage' ? 0xc9a56a : 0x8f7c62;
  for (const [x, y, rx, ry] of [[GOAL_D + 60, GROUND + 4, 90, 18], [W - GOAL_D - 60, GROUND + 4, 90, 18], [cx, GROUND + 2, 70, 14], [GOAL_D + 210, GROUND + 20, 50, 10], [W - GOAL_D - 230, GROUND - 30, 44, 8]]) { g.beginFill(mud, .5); g.drawEllipse(x, y, rx, ry); g.endFill(); g.beginFill(mud, .35); g.drawEllipse(x + rx * .3, y - 2, rx * .5, ry * .6); g.endFill(); }
}

// cages blanches en tubes, en perspective (bouche tournée vers le centre du terrain)
function drawGoals() { for (const s of [0, 1]) { drawGoal(S.goalBack[s], s, 'back', M.net[s]); drawGoal(S.goalFront[s], s, 'front', M.net[s]); } }
function drawGoal(g, s, part, wob) {
  g.clear(); const X = x => s ? W - x : x, top = gtop(s), d = GOAL_D, bk = -40, G = GROUND + 4, dx = s ? -GDX : GDX, w = Math.sin(performance.now() * .03) * wob * 18;
  const FN = [X(d), top], FNb = [X(d), G], BN = [X(bk), top + 6], BNb = [X(bk), G], FF = [X(d) + dx, top + GDY], FFb = [X(d) + dx, G + GDY], BF = [X(bk) + dx, top + 6 + GDY], BFb = [X(bk) + dx, G + GDY];
  const tube = (pts, wd) => { const run = (wd2, col, a, oy) => { g.lineStyle({ width: wd2, color: col, alpha: a, cap: 'round', join: 'round' }); g.moveTo(pts[0][0], pts[0][1] + oy); for (const p of pts.slice(1)) g.lineTo(p[0], p[1] + oy); }; run(wd + 5, 0x1a1f2b, 1, 0); run(wd, 0xeef1f7, 1, 0); run(wd * .35, 0xffffff, .95, -wd * .18); };
  const net = (a, b, c, d2, nu, nv, al) => { g.lineStyle({ width: 1.6, color: 0xffffff, alpha: al }); for (let i = 0; i <= nu; i++) { const k = i / nu, p = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], q = [lerp(d2[0], c[0], k), lerp(d2[1], c[1], k)], bu = Math.sin(k * Math.PI) * w; g.moveTo(p[0], p[1]); g.quadraticCurveTo((p[0] + q[0]) / 2 - (s ? -bu : bu), (p[1] + q[1]) / 2, q[0], q[1]); } for (let j = 0; j <= nv; j++) { const k = j / nv, p = [lerp(a[0], d2[0], k), lerp(a[1], d2[1], k)], q = [lerp(b[0], c[0], k), lerp(b[1], c[1], k)]; g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } };
  if (part === 'back') {
    g.beginFill(0xffffff, .06); g.drawPolygon([...BF, ...BFb, ...BNb, ...BN]); g.endFill();
    net(BF, FF, FFb, BFb, 8, 10, .45);
    net(BN, BF, BFb, BNb, 3, 10, .55);
    tube([BFb, BF, FF, FFb], 9);
    tube([BNb, BN], 9); tube([BN, BF], 8); g.lineStyle(0); g.beginFill(0x000000, .2); g.drawPolygon([...FNb, ...BNb, ...BFb, ...FFb]); g.endFill();
  } else {
    net(BN, FN, FNb, BNb, 8, 10, .5);
    net(BN, FN, FF, BF, 8, 3, .45);
    tube([BN, FN], 10); tube([FN, FF], 10); tube([FNb, FN], 12);
    g.lineStyle(0); g.beginFill(0x000000, .25); g.drawEllipse(FNb[0], FNb[1] + 2, 14, 4); g.endFill();
    if (M.bigGoal[s] > 0) { g.lineStyle({ width: 4, color: 0xffd200, alpha: .6 + .4 * Math.sin(performance.now() * .01) }); g.drawRoundedRect(Math.min(X(d), X(bk)) - 6, top - 34, Math.abs(d - bk) + 12, G - top + 40, 14); }
  }
}

// ---------- HUD ----------
function txt(s, size, fill, stroke, sw) { return new PIXI.Text(s, { fontFamily: FONT, fontSize: size, fill: fill || 0xffffff, stroke: stroke || 0x14171f, strokeThickness: sw == null ? Math.round(size * .16) : sw, lineJoin: 'round', dropShadow: true, dropShadowDistance: Math.round(size * .06), dropShadowAngle: Math.PI / 2, dropShadowColor: 0x000000, dropShadowAlpha: .5 }); }
function buildHUD() {
  const h = S.hud; h.removeChildren();
  S.band = new PIXI.TilingSprite(TEX.band, 100, H - BAND); S.band.y = BAND; S.band.tileScale.set(1, (H - BAND) / 128); h.addChild(S.band);
  const sb = new PIXI.Container(); S.sb = sb; h.addChild(sb);
  const pan = new PIXI.Graphics(); pan.beginFill(0x0b1430, .94); pan.lineStyle(4, 0x14171f); pan.drawRoundedRect(-170, 6, 340, 66, 20); pan.endFill(); pan.beginFill(0xffffff, .07); pan.lineStyle(0); pan.drawRoundedRect(-164, 10, 328, 26, 14); pan.endFill(); sb.addChild(pan);
  const tbox = new PIXI.Graphics(); tbox.beginFill(0x1d2a55); tbox.lineStyle(3, 0x14171f); tbox.drawRoundedRect(-46, 14, 92, 50, 12); tbox.endFill(); sb.addChild(tbox);
  S.tTime = txt(String(MATCH_TIME), 36); S.tTime.anchor.set(.5); S.tTime.y = 40; sb.addChild(S.tTime);
  S.tSc = [0, 1].map(i => { const t = txt('0', 46, 0xffd200); t.anchor.set(.5); t.x = i ? 98 : -98; t.y = 40; sb.addChild(t); return t; });
  S.hIco = [0, 1].map(i => { const P = M.P[i], c = new PIXI.Container(); const ring = new PIXI.Graphics(); ring.beginFill(P.club.c1); ring.lineStyle(4, 0x14171f); ring.drawCircle(0, 0, 34); ring.endFill(); c.addChild(ring);
    const m = new PIXI.Graphics(); m.beginFill(0xffffff); m.drawCircle(0, 0, 30); m.endFill(); c.addChild(m);
    const s = new PIXI.Sprite(T('img/h/' + P.ch.id + '_0.webp')); s.anchor.set(.5, .45); const k = 68 / s.texture.height; s.scale.set(k * (i ? -1 : 1), k); s.mask = m; c.addChild(s);
    const cr = new PIXI.Sprite(T('img/cr/' + P.club.cr + '.webp')); cr.anchor.set(.5); cr.width = 28; cr.height = 30; cr.x = i ? -28 : 28; cr.y = 24; c.addChild(cr);
    c.x = i ? 210 : -210; c.y = 38; sb.addChild(c);
    const n = txt(P.name, 18); n.anchor.set(i ? 1 : 0, .5); n.x = i ? 158 : -158; n.y = 86; sb.addChild(n); return c; });
  S.joy = new PIXI.Container(); h.addChild(S.joy);
  const base = new PIXI.Graphics(); base.beginFill(0x000000, .35); base.lineStyle(4, 0xffffff, .5); base.drawCircle(0, 0, JOY.R + 6); base.endFill();
  base.lineStyle(0); base.beginFill(0xffffff, .6); for (const [ax, ay, r] of [[-JOY.R + 4, 0, 0], [JOY.R - 4, 0, Math.PI], [0, -JOY.R + 4, Math.PI / 2]]) base.drawPolygon(rotPts([[-7, 0], [5, -9], [5, 9]], r, ax, ay)); base.endFill(); S.joy.addChild(base);
  const knob = new PIXI.Graphics(); knob.beginFill(0xff8a1a); knob.lineStyle(4, 0x14171f); knob.drawCircle(0, 0, 30); knob.endFill(); knob.beginFill(0xffd27a, .9); knob.lineStyle(0); knob.drawEllipse(-6, -10, 15, 8); knob.endFill(); S.knob = knob; S.joy.addChild(knob);
  S.bLo = mkBtn('img/ui/kick.webp', 'TIR BAS', 96); S.bHi = mkBtn('img/ui/lob.webp', 'TIR HAUT', 96); h.addChild(S.bLo, S.bHi);
  S.bPw = new PIXI.Container(); h.addChild(S.bPw);
  S.pwGlow = new PIXI.Sprite(TEX.glow); S.pwGlow.anchor.set(.5); S.pwGlow.blendMode = PIXI.BLEND_MODES.ADD; S.pwGlow.width = S.pwGlow.height = 170; S.pwGlow.alpha = 0; S.bPw.addChild(S.pwGlow);
  const pwIco = new PIXI.Sprite(T('img/pw/' + M.P[0].power + '.webp')); pwIco.anchor.set(.5); pwIco.width = pwIco.height = 92; S.bPw.addChild(pwIco); S.pwIco = pwIco;
  S.pwRing = new PIXI.Graphics(); S.bPw.addChild(S.pwRing);
  S.bPause = new PIXI.Sprite(T('img/ui/pause.webp')); S.bPause.anchor.set(.5); S.bPause.width = S.bPause.height = 54; h.addChild(S.bPause);
  S.oppPw = new PIXI.Container(); h.addChild(S.oppPw); const op = new PIXI.Sprite(T('img/pw/' + M.P[1].power + '.webp')); op.anchor.set(.5); op.width = op.height = 46; S.oppPw.addChild(op); S.oppRing = new PIXI.Graphics(); S.oppPw.addChild(S.oppRing);
  S.msgC = new PIXI.Container(); h.addChild(S.msgC); S.cardC = new PIXI.Container(); h.addChild(S.cardC); S.tuto = new PIXI.Container(); h.addChild(S.tuto);
}
function rotPts(pts, a, ox, oy) { const r = []; for (const [x, y] of pts) r.push(ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)); return r; }
function mkBtn(src, label, sz) { const c = new PIXI.Container(); const s = new PIXI.Sprite(T(src)); s.anchor.set(.5); s.width = s.height = sz; c.addChild(s); const t = txt(label, 14); t.anchor.set(.5); t.y = sz / 2 + 4; c.addChild(t); return c; }

function layout() {
  if (!S) return;
  const sw = app.screen.width, sh = app.screen.height, k = sh / H, vw = sw / k;
  VIEW = { k, w: vw, ox: (vw - W) / 2 };
  S.root.scale.set(k); S.cam.x = VIEW.ox;
  const V = M.venue, bs = Math.max((PITCH_TOP + 12) / V.h, (vw + 40) / 1672);
  S.bg.scale.set(bs); S.bg.x = W / 2 - 1672 * bs / 2; S.bg.y = PITCH_TOP + 12 - V.h * bs; S.bgS = bs;
  S.lightSp.forEach((g, i) => { const [x, y] = S.lightPts[i]; g.x = S.bg.x + x * bs; g.y = S.bg.y + y * bs; });
  S.rays.forEach((r, i) => { const [x, y] = S.lightPts[i]; r.x = S.bg.x + x * bs; r.y = S.bg.y + y * bs + 30; r.height = 560; r.width = 240; });
  drawPitch();
  S.band.width = vw; S.sb.x = vw / 2;
  const cy = (BAND + H) / 2 + 2;
  S.joyHome = { x: 150, y: cy };
  BTN.lo.x = vw - 360; BTN.lo.y = cy - 6; BTN.hi.x = vw - 236; BTN.hi.y = cy - 6; BTN.pw.x = vw - 96; BTN.pw.y = cy - 4; BTN.pause.x = 44; BTN.pause.y = 42;
  S.bLo.x = BTN.lo.x; S.bLo.y = BTN.lo.y; S.bHi.x = BTN.hi.x; S.bHi.y = BTN.hi.y; S.bPw.x = BTN.pw.x; S.bPw.y = BTN.pw.y; S.bPause.x = BTN.pause.x; S.bPause.y = BTN.pause.y;
  S.oppPw.x = vw - 44; S.oppPw.y = 42;
}
addEventListener('resize', () => setTimeout(layout, 50));

// =====================================================================
// Physique
// =====================================================================
// coup d'envoi : au centre au début, puis devant le joueur qui vient d'encaisser
function kickoff(conceder) {
  M.P.forEach(p => p.reset());
  const b = M.b; b.vx = 0; b.vy = 0; b.last = -1; b.hot = 0; b.fire = 0; b.sq = 0; b.idle = 0;
  if (conceder < 0) { b.x = W / 2; b.y = GROUND - 260; }
  else { const p = M.P[conceder]; b.x = p.x + p.face * 80; b.y = GROUND - 230; }
  b.px = b.x; b.py = b.y; M.trail.length = 0;
}
function stepPlayer(p, I) {
  for (const k of ['kcd', 'kick', 'hd', 'stun', 'frz', 'glue', 'big']) if (p[k] > 0) p[k]--;
  if (p.fireNext > 0) p.fireNext--;
  const can = M.state === 'play' && !p.locked, mv = can && p.glue <= 0;
  const sp = 5 * p.spd, ax = mv ? I.ax : 0;
  p.vx += (ax * sp - p.vx) * (p.onGround ? .24 : .12);
  if (mv && I.jump && p.onGround) { p.vy = -14.8 * p.jmp; p.an.sv += .1; p.an.s = -.18; sfx('jump'); puff(p.x, GROUND, 6); if (p.side === 0) M.ev.jump = 1; }
  if (can && (I.lo || I.hi) && p.kcd <= 0) tryKick(p, I.hi ? 'hi' : 'lo');
  if (can && I.pw) usePower(p);
  const air = !p.onGround, fall = p.vy;
  p.vy += G_PL; p.x += p.vx; p.y += p.vy;
  if (p.y > GROUND) { p.y = GROUND; p.vy = 0; if (air && fall > 3) { p.an.sv -= Math.min(.12, fall * .009); p.an.hv += fall * .6; puff(p.x, GROUND, 8); } }
  p.x = clamp(p.x, GOAL_D - 40, W - GOAL_D + 40);
  const gs = p.x < W / 2 ? 0 : 1;
  if ((p.x < GOAL_D + 18 || p.x > W - GOAL_D - 18) && p.hy - p.hr < gtop(gs) + 6 && p.y > gtop(gs) && p.vy < 0) p.vy = 0;
  if (p.onGround && Math.abs(p.vx) > 3 && M.t % 8 === 0) puff(p.x - p.face * 16, GROUND, 1);
  if (p.side === 0 && Math.abs(p.x - 300) > 80) M.ev.move = 1;
  if (M.state === 'play' && p.pw < 1 && !(M.tuto && M.tuto.i < 4)) p.pw = Math.min(1, p.pw + 1 / (13 * 60));
}
function tryKick(p, type) {
  const b = M.b; p.kcd = 16; p.kt = type;
  if (Math.hypot(b.x - p.hx - p.face * 8, b.y - p.hy) < p.hr + BALL_R + 18 && b.y < p.y - 60) { header(p); return; }
  p.kick = 16; p.kdone = false; sfx('swish');
}
function header(p) {
  const b = M.b; p.hd = 14;
  if (p.kt === 'hi') aimLob(p, b, .9); else { b.vx = p.face * 10 * p.hdp; b.vy = Math.min(b.vy, -4.5); }
  afterShot(p, b, 'head'); impact(b.x, b.y, 4, .7); sfx('head'); if (p.side === 0) { M.ev.head = 1; M.stats.heads++; }
}
// tir haut précis : trajectoire calculée pour retomber sous la barre adverse
function aimLob(p, b, pw) {
  const s = p.face > 0 ? 1 : 0, tx = s ? W - GOAL_D * .45 : GOAL_D * .45, ty = gtop(s) + 52;
  const dx = tx - b.x, dy = ty - b.y, Tt = clamp(Math.abs(dx) / (9.8 * (pw || 1)), 32, 82);
  let vx = dx / Tt, vy = (dy - .5 * G_BALL * Tt * Tt) / Tt;
  const err = (1.25 - Math.min(1.2, p.kp)) * .05 + Math.abs(dx) / 1000 * .03; vx *= 1 + rnd(-err, err);
  b.vx = vx; b.vy = Math.max(vy, -19);
}
function shoot(p, b) {
  if (p.kt === 'hi') aimLob(p, b, 1);
  else { b.vx = p.face * 12.5 * p.kp; b.vy = -3 - Math.max(0, (GROUND - 30 - b.y)) * .01; }
  afterShot(p, b, p.kt); impact(b.x, b.y, 5, 1); sfx('kick'); if (p.side === 0) { M.ev[p.kt] = 1; M.stats.shots++; }
}
function afterShot(p, b, t) {
  b.last = p.side; b.lastT = t; b.hot = t === 'lo' ? 24 : 0; b.sq = .5; b.sqa = Math.atan2(b.vy, b.vx);
  if (p.fireNext > 0) { p.fireNext = 0; b.fire = 80; const fm = 1.15 + .05 * (p.fireMul || 1); b.vx *= fm; b.vy *= 1.1; b.fireBy = p.side; sfx('fire'); }
  p.pw = Math.min(1, p.pw + .03);
}
function impact(x, y, hs, power) { M.hs = Math.max(M.hs, hs); M.shake = Math.max(M.shake, 5 * power); ring(x, y, power); sparks(x, y, 10 * power, 0xfff3b0); }

// ---------- super pouvoirs ----------
function usePower(p) {
  if (p.pw < 1 || M.state !== 'play') return;
  p.pw = 0; const o = M.P[1 - p.side], id = p.power; sfx('power'); M.flash = .25;
  ring(p.hx, p.hy, 1.4); sparks(p.hx, p.hy, 18, 0xffd200);
  showMsg(PW(id).n.toUpperCase() + ' !', p.side === 0 ? 0xffd200 : 0xff6b6b, 'small');
  const f = p.pwf || 1;
  if (id === 'harissa') { p.fireNext = 480; p.fireMul = f; }
  else if (id === 'bard') { o.frz = Math.round(150 * f); o.vx = 0; sfx('ice'); }
  else if (id === 'boutellis') { o.glue = Math.round(150 * f); o.vx = 0; }
  else if (id === 'cage') { M.bigGoal[o.side] = Math.round(330 * f); drawGoals(); }
  else if (id === 'chlaka') { const sp = new PIXI.Sprite(T('img/fx/sandal.webp')); sp.anchor.set(.5); sp.width = 70; sp.height = 52; S.projL.addChild(sp); M.proj.push({ sp, x: p.hx, y: p.hy - 10, vx: p.face * 11, vy: -6, o: p.side, r: 0, st: Math.round(75 * f) }); }
  else if (id === 'raskbir') p.big = Math.round(330 * f);
  if (p.side === 0) { M.ev.pw = 1; M.stats.pw++; }
}
function stepProj() {
  for (const q of M.proj) { q.vy += .3; q.x += q.vx; q.y += q.vy; q.r += .3 * Math.sign(q.vx); const o = M.P[1 - q.o]; if (Math.hypot(q.x - o.hx, q.y - o.hy) < o.hr + 20) { o.stun = q.st || 90; q.dead = 1; sfx('bump'); impact(q.x, q.y, 3, .8); } if (q.y > GROUND || q.x < -50 || q.x > W + 50) q.dead = 1; }
  for (const q of M.proj) if (q.dead) q.sp.destroy();
  M.proj = M.proj.filter(q => !q.dead);
  for (const s of [0, 1]) if (M.bigGoal[s] > 0) { M.bigGoal[s]--; if (M.bigGoal[s] === 0 || M.bigGoal[s] % 6 === 0) drawGoals(); }
}

// ---------- ballon ----------
function circBounce(b, cx, cy, r, pvx, pvy, e) {
  const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), m = r + BALL_R;
  if (d >= m || d === 0) return false;
  const nx = dx / d, ny = dy / d; b.x = cx + nx * m; b.y = cy + ny * m;
  const rvx = b.vx - pvx, rvy = b.vy - pvy, vn = rvx * nx + rvy * ny;
  if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; b.vx += pvx * .25; b.vy += pvy * .25; }
  return true;
}
function barBounce(b, x1, x2, y) {
  const cx = clamp(b.x, x1, x2), dx = b.x - cx, dy = b.y - y, d = Math.hypot(dx, dy), m = BALL_R + 7;
  if (d < m && d > 0) { const nx = dx / d, ny = dy / d; b.x = cx + nx * m; b.y = y + ny * m; const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vy -= 1.6 * vn * ny; if (Math.abs(vn) > 4) { sfx('post'); M.shake = Math.max(M.shake, 4); } } }
}
function stepBall() {
  const b = M.b;
  b.vy += b.fire > 0 ? G_BALL * .4 : G_BALL; b.vx *= .996; if (b.hot > 0) b.hot--; if (b.fire > 0) b.fire--;
  const sp = Math.hypot(b.vx, b.vy), mx = b.fire > 0 ? 19 : 15.5; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; }
  const touched = [false, false];
  for (let s = 0; s < 3; s++) {
    b.x += b.vx / 3; b.y += b.vy / 3;
    if (b.y > GROUND - BALL_R) { b.y = GROUND - BALL_R; if (b.vy > 0) { if (b.vy > 5) { b.sq = Math.min(.35, b.vy * .03); b.sqa = Math.PI / 2; sfx('bounce', Math.min(1, b.vy / 12)); } b.vy *= -.6; if (Math.abs(b.vy) < 1.3) b.vy = 0; } b.vx *= .985; }
    if (b.y < 24) { b.y = 24; b.vy = Math.abs(b.vy) * .5; }
    if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * .5; } if (b.x > W - BALL_R) { b.x = W - BALL_R; b.vx = -Math.abs(b.vx) * .5; }
    barBounce(b, -60, GOAL_D + 6, gtop(0) - 12); barBounce(b, W - GOAL_D - 6, W + 60, gtop(1) - 12);
    for (const p of M.P) {
      if (b.fire > 0 && b.fireBy !== p.side && Math.hypot(b.x - p.hx, b.y - p.hy) < p.hr + BALL_R + 6) { if (p.stun <= 0) { p.stun = 80; p.vx = Math.sign(b.vx) * 7; p.vy = -6; impact(p.hx, p.hy, 4, 1.2); sfx('bump'); } continue; }
      const h1 = circBounce(b, p.hx, p.hy, p.hr, p.vx, p.vy, .45), h2 = circBounce(b, p.x + p.face * 12, p.y - 18, 20, p.vx, p.vy, .3);
      if (h1 || h2) { touched[p.side] = true; if (Math.hypot(b.vx, b.vy) > 5 && s === 0) { sfx('bump'); b.sq = Math.max(b.sq, .25); b.sqa = Math.atan2(b.vy, b.vx); if (h1) p.an.hv -= 5; } b.last = p.side; b.lastT = h1 ? 'head' : 'body'; }
      if (p.kick > 0 && !p.kdone && p.kick < 14 && Math.hypot(b.x - p.fx, b.y - p.fy) < BALL_R + 42) { p.kdone = true; shoot(p, b); }
    }
  }
  // choc : les deux joueurs touchent le ballon en même temps -> il gicle vers le haut, les joueurs reculent
  if (touched[0] && touched[1]) { b.vy = -11; b.vx = rnd(-2, 2); for (const p of M.P) { const sg = Math.sign(p.x - b.x) || -p.face; p.x += sg * 12; p.vx = sg * 7; } sfx('bump'); M.shake = Math.max(M.shake, 4); }
  // sécurité : ballon bloqué au même endroit trop longtemps
  if (Math.abs(b.x - (b.sx || 0)) > 3) { b.sx = b.x; b.st = 0; } else if (++b.st > 110) { b.st = 0; b.y = Math.min(b.y, GROUND - 190); b.vy = -6; b.vx = rnd(-4, 4); }
  if (b.x < GOAL_D - 12 && b.y > gtop(0) - 6) goal(1); else if (b.x > W - GOAL_D + 12 && b.y > gtop(1) - 6) goal(0);
  if ((b.x < GOAL_D + 10 || b.x > W - GOAL_D - 10) && b.y < gtop(b.x < W / 2 ? 0 : 1) && Math.abs(b.vy) < .8 && Math.abs(b.vx) < .6) { b.vx = b.x < W / 2 ? 3 : -3; b.vy = -4; }
  if (b.y < GROUND - BALL_R - 1 || Math.abs(b.vx) > .2) b.rot += b.vx * .05;
  if (Math.abs(b.vx) < .3 && Math.abs(b.vy) < .6) { if (++b.idle > 150) { b.vy = -8; b.vx = rnd(-3, 3); b.idle = 0; } } else b.idle = 0;
}

// ---------- but : une image différente selon qui marque ----------
function goal(side) {
  if (M.state !== 'play') return;
  M.score[side]++; M.state = 'goal'; M.st = 140; M.hs = 8; M.slow = 40; M.net[1 - side] = 1; M.shake = 12; M.celeb = { side }; M.flash = side === 0 ? .6 : .25;
  const gx = side ? 70 : W - 70;
  if (side === 0) { const cols = [0xe70013, 0xffffff, 0xffd200, M.P[0].club.c1]; for (let i = 0; i < 140; i++) confetti(gx, gtop(1) + 60, cols); sfx('goal'); crowdRoar(); vib(120); }
  else { sfx('concede'); vib(60); }
  M.card = { side, t: 0, type: M.b.lastT, mine: side === 0 }; if (side === 0 && M.b.lastT === 'head') M.stats.hg++;
  bumpScore(side); if (M.tuto) M.ev.goal = 1;
}

// =====================================================================
// IA
// =====================================================================
function stepAI(p) {
  const b = M.b, d = p.ai, att = p.face;
  if (p.pw >= 1 && M.state === 'play') { p.aiPw--; if (p.aiPw <= 0 && (p.power !== 'harissa' || Math.abs(b.x - p.x) < 260)) { p.aiPw = rnd(60, 240); return { ax: 0, pw: true }; } }
  p.aiT--;
  if (p.aiT <= 0) {
    p.aiT = Math.round(lerp(13, 4, d) + rnd(0, 4));
    const I = { ax: 0, jump: false, lo: false, hi: false };
    const tl = clamp((GROUND - 40 - b.y) / 10, 0, 40), px = clamp(b.x + b.vx * tl * .6, 40, W - 40), myGoal = p.side ? W - 60 : 60;
    let tx = (b.x - p.x) * att < -10 ? px - att * 70 : px - att * 44;
    if (Math.abs(b.x - myGoal) < 380 && b.vx * att < -2) tx = lerp(myGoal + att * 120, px, .4);
    const opp = M.P[1 - p.side]; if ((opp.x - myGoal) * att < (b.x - myGoal) * att && (b.x - myGoal) * att < 520 && Math.random() < .5 + d * .4) tx = clamp(lerp(myGoal + att * 110, b.x, .45), Math.min(myGoal, myGoal + att * 300), Math.max(myGoal, myGoal + att * 300));
    const toMe = b.vx * att < -2.5 && b.y < GROUND - 140, land = b.x + b.vx * Math.max(0, (-b.vy + Math.sqrt(Math.max(0, b.vy * b.vy + 2 * G_BALL * (GROUND - 100 - b.y)))) / G_BALL);
    p.keep = toMe && Math.abs(land - myGoal) < 320 && Math.random() < .45 + d * .5; if (p.keep) tx = myGoal + att * (GOAL_D + 50);
    const dx = tx - p.x; I.ax = Math.abs(dx) < 10 ? 0 : clamp(dx / 60, -1, 1) * (.8 + .22 * d);
    if (Math.abs(b.x - p.x) < 105 && b.y < p.y - 110 && b.y > p.y - 280 && b.vy > -3 && Math.random() < .35 + d * .5) I.jump = true;
    if (p.keep && Math.abs(b.x - p.x) < 160 && b.y < p.y - 110 && b.y > p.y - 310 && Math.random() < .5 + d * .45) I.jump = true;
    const nearFoot = Math.hypot(b.x - p.fx, b.y - p.fy) < 62, nearHead = Math.hypot(b.x - p.hx, b.y - p.hy) < p.hr + BALL_R + 20 && b.y < p.y - 60;
    if ((nearFoot || nearHead) && (b.x - p.x) * att > -10 && Math.random() < .55 + d * .4) { const far = Math.abs((p.side ? GOAL_D : W - GOAL_D) - b.x) > 460; if (far && Math.random() < .45) I.hi = true; else I.lo = true; }
    p.aiI = I;
  } else { p.aiI = { ax: p.aiI.ax }; }
  return p.aiI;
}

// =====================================================================
// Animation (ressorts) et rendu
// =====================================================================
function animPlayer(p) {
  const a = p.an, b = M.b; a.t++;
  const look = clamp((b.x - p.x) * p.face / 300, -1, 1), hd = p.hd > 0 ? Math.sin(p.hd / 14 * Math.PI) : 0, kk = p.kick > 0 ? Math.sin((1 - p.kick / 16) * Math.PI) : 0;
  let tgt = clamp(-p.vx * .05 * p.face, -.3, .3) + look * .07 + hd * .45 - kk * .22 + (p.stun > 0 ? Math.sin(a.t * .5) * .3 : 0);
  if (M.state === 'goal' && M.celeb) tgt += M.celeb.side === p.side ? Math.sin(a.t * .22) * .2 : .14;
  if (p.frz <= 0) { a.tv += (tgt - a.tilt) * .2; a.tv *= .7; a.tilt += a.tv; a.sv += -a.s * .3; a.sv *= .74; a.s += a.sv; }
  if (!p.onGround) a.s += (clamp(-p.vy * .012, -.08, .14) - a.s) * .12;
  a.hv += (clamp(p.vy * 1.1, -12, 12) - a.ho) * .22; a.hv *= .72; a.ho += a.hv * .3;
  if (p.onGround && Math.abs(p.vx) > .6) a.step += Math.abs(p.vx) * .07; else a.step += (Math.round(a.step / Math.PI) * Math.PI - a.step) * .2;
  let e = 0; if (M.state === 'goal' && M.celeb) e = M.celeb.side === p.side ? 3 : 2; else if (p.stun > 0 || p.frz > 0 || p.glue > 0) e = 2; else if (p.kick > 0 || p.hd > 0 || !p.onGround) e = 1;
  if (e !== p.expr && (e === 1 || p.exprT <= 0)) { p.expr = e; p.exprT = 10; } if (p.exprT > 0) p.exprT--;
  if (M.state === 'goal' && M.celeb && M.celeb.side === p.side && p.onGround && a.t % 30 === 0) { p.vy = -9; a.s = -.15; }
}
function renderPlayer(p, v, al) {
  const a = p.an, x = lerp(p.px, p.x, al), y = lerp(p.py, p.y, al), air = clamp((GROUND - y) / 160, 0, 1);
  v.sh.x = x; v.sh.y = GROUND + 3; v.sh.width = (96 - air * 36) * (1 - a.s * .6); v.sh.height = 20 - air * 8; v.sh.alpha = .85 - air * .4;
  const run = p.onGround ? Math.abs(Math.sin(a.step)) * 4.5 : 0;
  v.root.x = x; v.root.y = y - run; v.rig.scale.set(1 - a.s * .75, 1 + a.s);
  const kp = p.kick > 0 ? 1 - p.kick / 16 : 0, kick = p.kick > 0 ? (kp < .25 ? -kp / .25 * .55 : Math.sin(((kp - .25) / .75) * Math.PI) * (p.kt === 'hi' ? 1.2 : .8)) : 0;
  const stepRot = p.onGround ? Math.sin(a.step * 2) * .09 : clamp(-p.vy * .01, -.12, .12);
  v.bootC.rotation = -(kick + stepRot) * p.face; v.bootC.x = p.face * (kick > 0 ? kick * 12 : kick * 6);
  const hd = p.hd > 0 ? Math.sin(p.hd / 14 * Math.PI) : 0, br = 1 + Math.sin(a.t * .07 + p.side * 2) * .02, big = p.big > 0 ? 1.45 : 1;
  v.head.x = p.face * hd * 14; v.head.y = HEAD_Y - a.ho * .55 + hd * 5; v.head.rotation = a.tilt * p.face; v.head.scale.set(br * big, (2 - br) * big);
  v.heads.forEach((s, i) => s.visible = i === p.expr);
  for (const c of v.tint) c.tint = p.frz > 0 ? 0x9fe6ff : 0xffffff;
  v.ice.alpha += ((p.frz > 0 ? .9 : 0) - v.ice.alpha) * .3; v.ice.y = -24;
  v.honey.x = x; v.honey.y = GROUND + 4; v.honey.alpha += ((p.glue > 0 ? 1 : 0) - v.honey.alpha) * .3;
  const evoA = p.evo >= 3 ? .45 : p.evo === 2 ? .3 : 0, glow = Math.max(evoA + .1 * Math.sin(a.t * .08), p.fireNext > 0 ? .7 : 0, M.celeb && M.celeb.side === p.side ? .5 : 0);
  v.aura.alpha += (glow - v.aura.alpha) * .2; v.aura.tint = p.fireNext > 0 ? 0xff6a00 : p.evo >= 3 ? 0xffc400 : p.evo === 2 ? 0xb060ff : 0xffd200; v.aura.width = v.aura.height = 200 * big; v.aura.y = -84;
}
function render(al) {
  const now = performance.now(), b = M.b, sh = M.shake > .4 ? M.shake : 0;
  S.cam.x = VIEW.ox + rnd(-sh, sh); S.cam.y = rnd(-sh, sh) * .6;
  S.lightSp.forEach((g, i) => { const f = .85 + .15 * Math.sin(now * .004 + i * 1.7) + (M.state === 'goal' ? .25 * Math.sin(now * .03 + i) : 0); g.scale.set(g.base * f * S.bgS * 1.6); g.alpha = .5 + .2 * Math.sin(now * .002 + i); });
  S.rays.forEach((r, i) => { r.rotation = (i ? .5 : -.5) + Math.sin(now * .0004 + i * 2) * .25; r.alpha = .12 + .06 * Math.sin(now * .001 + i); });
  if (M.venue.id === 'stade' && Math.random() < (M.state === 'goal' ? .5 : .05)) { const f = new PIXI.Sprite(TEX.glow); f.anchor.set(.5); f.blendMode = PIXI.BLEND_MODES.ADD; f.x = S.bg.x + rnd(60, 1610) * S.bgS; f.y = S.bg.y + rnd(290, 500) * S.bgS; f.scale.set(rnd(.12, .3)); f.life = 8; S.flashes.addChild(f); }
  for (const f of S.flashes.children.slice()) { f.life--; f.alpha = f.life / 8; if (f.life <= 0) { S.flashes.removeChild(f); f.destroy(); } }
  for (let s = 0; s < 2; s++) if (M.net[s] > .02) { drawGoal(S.goalBack[s], s, 'back', M.net[s]); drawGoal(S.goalFront[s], s, 'front', M.net[s]); } else if (M.net[s] > 0) { M.net[s] = 0; drawGoals(); }
  M.P.forEach((p, i) => renderPlayer(p, S.pl[i], al));
  const bx = lerp(b.px, b.x, al), by = lerp(b.py, b.y, al), spd = Math.hypot(b.vx, b.vy);
  S.ballC.x = bx; S.ballC.y = by;
  const sq = clamp(b.sq + Math.max(0, spd - 12) * .012, 0, .45); S.ballC.rotation = b.sqa; S.ballC.scale.set(1 + sq, 1 - sq * .7); S.ball.rotation = b.rot - b.sqa;
  S.ballSh.x = bx; S.ballSh.y = GROUND + 3; const ah = clamp(1 - (GROUND - by) / 420, .3, 1); S.ballSh.width = 48 * ah; S.ballSh.height = 11 * ah; S.ballSh.alpha = .7 * ah;
  const hot = b.hot > 0 || spd > 13; S.ballGlow.x = bx; S.ballGlow.y = by; S.ballGlow.alpha += ((b.fire > 0 ? .9 : hot ? .6 : 0) - S.ballGlow.alpha) * .2; S.ballGlow.width = S.ballGlow.height = b.fire > 0 ? 150 : 110; S.ballGlow.tint = b.fire > 0 ? 0xff5a00 : b.lastT === 'hi' ? 0x9fe6ff : 0xffb347;
  if (M.state === 'ready') { S.ballGlow.alpha = .8; S.ballGlow.tint = 0xfff6c0; S.ballGlow.width = S.ballGlow.height = 130 + Math.sin(now * .02) * 18; }
  S.fire.visible = b.fire > 0; if (b.fire > 0) { S.fire.x = bx; S.fire.y = by; S.fire.rotation = Math.atan2(b.vy, b.vx); S.fire.width = 130; S.fire.height = 70; }
  M.trail.unshift([bx, by, spd]); if (M.trail.length > 16) M.trail.pop();
  const pts = S.trail.geometry.points; for (let i = 0; i < pts.length; i++) { const t = M.trail[Math.min(i, M.trail.length - 1)] || [bx, by]; pts[i].x = t[0]; pts[i].y = t[1]; }
  S.trail.alpha = clamp((spd - 6) / 8, 0, .85); S.trail.tint = b.fire > 0 ? 0xff8a1a : b.lastT === 'hi' ? 0xbff0ff : b.hot > 0 ? 0xffc06a : 0xffffff;
  for (const q of M.proj) { q.sp.x = q.x; q.sp.y = q.y; q.sp.rotation = q.r; }
  S.flashOv.clear(); if (M.flash > .01) { S.flashOv.beginFill(0xffffff, M.flash); S.flashOv.drawRect(-10, -10, VIEW.w + 20, H + 20); S.flashOv.endFill(); }
  renderFx(); renderHUD(now);
}

// ---------- particules ----------
function addFx(o) { M.fx.push(o); (o.add ? S.fxAdd : S.fxL).addChild(o.sp); }
function puff(x, y, n) { for (let i = 0; i < n; i++) { const sp = new PIXI.Sprite(TEX.smoke); sp.anchor.set(.5); sp.tint = M.venue.id === 'plage' ? 0xf0dcae : 0xe8dcc0; sp.alpha = .6; sp.scale.set(rnd(.22, .45)); addFx({ sp, x: x + rnd(-22, 22), y: y - 4, vx: rnd(-1.4, 1.4), vy: rnd(-1.6, -.3), l: 30, ml: 30, g: -.01, grow: .012 }); } }
function sparks(x, y, n, col) { for (let i = 0; i < n; i++) { const sp = new PIXI.Sprite(TEX.dot); sp.anchor.set(.5); sp.tint = col; const a = rnd(0, 6.28), v = rnd(3, 9); sp.scale.set(rnd(.15, .3)); addFx({ sp, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 22, ml: 22, g: .15, add: 1 }); } }
function ring(x, y, p) { const g = new PIXI.Graphics(); addFx({ sp: g, x, y, vx: 0, vy: 0, l: 16, ml: 16, ring: 1, p, add: 1 }); const st = new PIXI.Sprite(TEX.star); st.anchor.set(.5); st.tint = 0xfff6a0; addFx({ sp: st, x, y, vx: 0, vy: 0, l: 10, ml: 10, star: 1, add: 1 }); }
function confetti(x, y, cols) { const sp = new PIXI.Sprite(TEX.rect); sp.anchor.set(.5); sp.tint = pick(cols); const a = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(6, 17); addFx({ sp, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: rnd(110, 170), ml: 170, g: .22, conf: 1, rot: rnd(0, 6), vr: rnd(-.3, .3) }); }
function renderFx() {
  for (const f of M.fx) { const s = f.sp, k = f.l / f.ml; s.x = f.x; s.y = f.y;
    if (f.ring) { s.clear(); s.lineStyle(8 * k + 1, 0xffffff, k); s.drawCircle(0, 0, BALL_R + (1 - k) * 66 * f.p); }
    else if (f.star) { s.scale.set(.6 + (1 - k) * 1.2); s.alpha = k; s.rotation += .1; }
    else if (f.conf) { s.rotation = f.rot; s.scale.set(1, Math.abs(Math.sin(f.rot * 2)) * .9 + .1); s.alpha = Math.min(1, f.l / 30); }
    else { s.alpha = (f.add ? 1 : .6) * k; if (f.grow) s.scale.set(s.scale.x + f.grow); } }
}
function stepFx() {
  for (const f of M.fx) { f.x += f.vx; f.y += f.vy; f.vy += f.g || 0; if (f.conf) { f.vx *= .985; f.vy = Math.min(f.vy, 3.2); f.rot += f.vr; } f.l--; }
  for (const f of M.fx) if (f.l <= 0) { f.sp.parent && f.sp.parent.removeChild(f.sp); f.sp.destroy(); }
  M.fx = M.fx.filter(f => f.l > 0);
  if (M.venue.id === 'stade' && Math.random() < .06) { const sp = new PIXI.Sprite(TEX.rect); sp.anchor.set(.5); sp.tint = pick([0xe70013, 0xffffff, 0xffd200]); sp.scale.set(.6); addFx({ sp, x: rnd(-100, W + 100), y: -10, vx: rnd(-.5, .5), vy: rnd(.6, 1.2), l: 420, ml: 420, g: 0, conf: 1, rot: rnd(0, 6), vr: rnd(-.08, .08) }); }
}

// ---------- HUD ----------
let LASTSEC = -1;
function bumpScore(side) { const t = S.tSc[side]; t.text = String(M.score[side]); t.pop = 1; }
function renderHUD(now) {
  const sec = Math.ceil(M.time / 60); if (sec !== LASTSEC) { LASTSEC = sec; S.tTime.text = M.tuto ? '∞' : String(Math.max(0, sec)); S.tTime.style.fill = sec <= 10 && !M.tuto ? 0xff5a5a : 0xffffff; if (sec <= 5 && sec > 0 && M.state === 'play' && !M.tuto) sfx('tick'); }
  S.tTime.scale.set(sec <= 10 && !M.tuto ? 1 + .12 * Math.abs(Math.sin(now * .006)) : 1);
  S.tSc.forEach(t => { t.pop = (t.pop || 0) * .9; t.scale.set(1 + t.pop * .8); });
  if (JOY.act) { S.joy.x = JOY.bx; S.joy.y = JOY.by; S.knob.x = JOY.kx; S.knob.y = JOY.ky; S.joy.alpha = 1; } else { S.joy.x += (S.joyHome.x - S.joy.x) * .3; S.joy.y += (S.joyHome.y - S.joy.y) * .3; S.knob.x *= .6; S.knob.y *= .6; S.joy.alpha = .8; }
  for (const [k, c] of [['lo', S.bLo], ['hi', S.bHi], ['pw', S.bPw]]) { const b = BTN[k]; if (b.t > 0) b.t--; const pr = b.id !== null || b.t > 0; c.scale.set(pr ? .88 : 1); }
  const P = M.P[0], full = P.pw >= 1; S.pwRing.clear(); S.pwRing.lineStyle(7, 0x14171f, .8); S.pwRing.drawCircle(0, 0, 50); S.pwRing.lineStyle(6, full ? 0xffd200 : 0x7dff2c); S.pwRing.arc(0, 0, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * P.pw);
  S.pwIco.alpha = full ? 1 : .45; S.pwGlow.alpha = full ? .45 + .3 * Math.sin(now * .01) : 0; if (full) S.bPw.scale.set(S.bPw.scale.x * (1 + .04 * Math.sin(now * .012)));
  const O = M.P[1]; S.oppRing.clear(); S.oppRing.lineStyle(4, 0x14171f, .8); S.oppRing.drawCircle(0, 0, 25); S.oppRing.lineStyle(4, O.pw >= 1 ? 0xff5a5a : 0xffffff); S.oppRing.arc(0, 0, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * O.pw);
  renderMsg(); renderCard(); renderTuto(now);
}
function showMsg(s, col, kind) {
  const size = kind === 'count' ? 150 : 64;
  const tx = new PIXI.Text(s, { fontFamily: FONT, fontSize: size, fill: [0xfffbe0, col || 0xffd200], fillGradientStops: [.15, .75], stroke: 0x14171f, strokeThickness: Math.round(size * .14), lineJoin: 'round', dropShadow: true, dropShadowDistance: Math.round(size * .08), dropShadowAngle: Math.PI / 2, dropShadowColor: 0x6b2a00, dropShadowAlpha: 1, padding: 30 });
  tx.anchor.set(.5); M.msg = { tx, t: 0, d: kind === 'count' ? 40 : 60, kind };
}
function renderMsg() {
  S.msgC.removeChildren(); const m = M.msg; if (!m) return; m.t++;
  const c = new PIXI.Container(); c.x = VIEW.w / 2; c.y = m.kind === 'count' ? 300 : 230; const k = clamp(m.t / 10, 0, 1); c.scale.set(m.kind === 'count' ? 1.9 - k * .9 : .5 + k * .6); c.alpha = Math.min(1, (m.d - m.t) / 10); c.addChild(m.tx); S.msgC.addChild(c);
  if (m.t >= m.d) M.msg = null;
}
// carte du but : dorée quand je marque, rouge sombre quand l'adversaire marque
function renderCard() {
  S.cardC.removeChildren(); const cd = M.card; if (!cd) return; cd.t++;
  const mine = cd.mine, P = M.P[cd.side], O = M.P[1 - cd.side];
  const inK = clamp(cd.t / 14, 0, 1), e = 1 - Math.pow(1 - inK, 3), out = clamp((cd.t - 100) / 14, 0, 1);
  const c = new PIXI.Container(); c.x = VIEW.w / 2; c.y = 270; c.scale.set((.3 + .7 * e) * (1 - out * .3)); c.alpha = 1 - out; S.cardC.addChild(c);
  const rays = new PIXI.Graphics(); rays.beginFill(mine ? 0xffd200 : 0xff3b3b, mine ? .22 : .12); for (let i = 0; i < 14; i++) { const a = i * Math.PI / 7 + cd.t * .015; rays.drawPolygon([0, 0, Math.cos(a - .1) * 560, Math.sin(a - .1) * 560, Math.cos(a + .1) * 560, Math.sin(a + .1) * 560]); } rays.endFill(); rays.blendMode = PIXI.BLEND_MODES.ADD; c.addChild(rays);
  const pan = new PIXI.Graphics(); pan.beginFill(mine ? 0xb86a00 : 0x3a0a12, .96); pan.lineStyle(6, 0x14171f); pan.drawRoundedRect(-330, -110, 660, 220, 36); pan.endFill();
  pan.beginFill(mine ? 0xffc400 : 0x8a1424); pan.lineStyle(0); pan.drawRoundedRect(-322, -102, 644, 104, 30); pan.endFill(); pan.beginFill(0xffffff, .15); pan.drawRoundedRect(-310, -96, 620, 34, 18); pan.endFill(); c.addChild(pan);
  const hS = new PIXI.Sprite(T('img/h/' + P.ch.id + '_3.webp')); hS.anchor.set(.5, .8); const k = 190 / hS.texture.height; hS.scale.set(k * (mine ? 1 : -1), k); hS.x = mine ? -230 : 230; hS.y = 40 + Math.sin(cd.t * .25) * 6; c.addChild(hS);
  const hO = new PIXI.Sprite(T('img/h/' + O.ch.id + '_2.webp')); hO.anchor.set(.5, .8); const k2 = 110 / hO.texture.height; hO.scale.set(k2 * (mine ? -1 : 1), k2); hO.x = mine ? 250 : -250; hO.y = 70; c.addChild(hO);
  const title = mine ? (cd.type === 'head' ? 'TÊTE !!!' : cd.type === 'hi' ? 'LOB !!!' : 'GOOOL !!!') : 'BUT ADVERSE…';
  const t1 = new PIXI.Text(title, { fontFamily: FONT, fontSize: mine ? 84 : 62, fill: mine ? [0xfffbe0, 0xffd200] : [0xffffff, 0xffb0b0], fillGradientStops: [.2, .8], stroke: 0x14171f, strokeThickness: 12, lineJoin: 'round', dropShadow: true, dropShadowDistance: 6, dropShadowAngle: Math.PI / 2, dropShadowColor: 0x000000, padding: 20 });
  t1.anchor.set(.5); t1.y = -48; t1.x = mine ? 30 : -30; t1.rotation = -.04; t1.scale.set(1 + .05 * Math.sin(cd.t * .3)); c.addChild(t1);
  const sub = txt(mine ? P.name + ' marque !' : P.name + ' marque… réagis !', 28); sub.anchor.set(.5); sub.y = 50; sub.x = mine ? 30 : -30; c.addChild(sub);
  const sc = txt(M.score[0] + ' - ' + M.score[1], 38); sc.anchor.set(.5); sc.y = 92; c.addChild(sc);
  if (cd.t > 114) M.card = null;
}

// =====================================================================
// Démo guidée
// =====================================================================
const TUTO = [
  { t: 'Glisse le joystick pour bouger', k: 'move', btn: 'joyx' },
  { t: 'Pousse le joystick vers le haut : saute !', k: 'jump', btn: 'joyup' },
  { t: 'TIR BAS : frappe le ballon !', k: 'lo', btn: 'lo', ball: 1 },
  { t: 'TIR HAUT : un lob précis vers la cage', k: 'hi', btn: 'hi', ball: 1 },
  { t: 'Jauge pleine : lance ton POUVOIR !', k: 'pw', btn: 'pw' },
  { t: 'À toi ! Marque un but', k: 'goal', btn: null, ball: 1 }];
function tutoStep() {
  const Tt = M.tuto, st = TUTO[Tt.i]; if (!st) return; Tt.t++; const p = M.P[0], b = M.b, o = M.P[1];
  if (Tt.t === 1) { M.ev[st.k] = 0; if (st.ball) { b.x = p.x + 140; b.y = GROUND - 120; b.vx = -1; b.vy = 0; b.px = b.x; b.py = b.y; } if (st.k === 'pw') p.pw = 1; }
  if (Tt.i < 5) { o.x += (W - 220 - o.x) * .1; o.vx = 0; o.pw = 0; }
  Tt.slow = (st.k === 'lo' || st.k === 'hi') && Math.hypot(b.x - p.fx, b.y - p.fy) < 80;
  if (st.ball && st.k !== 'goal' && Tt.t > 140 && b.y >= GROUND - BALL_R - 1 && Math.abs(b.vx) < .5) Tt.t = 0;
  if (M.ev[st.k] && Tt.t > 10) { Tt.i++; Tt.t = 0; sfx('coin'); if (TUTO[Tt.i]) showMsg(Tt.i === 5 ? 'BRAVO !' : 'BIEN !', 0x7dff2c, 'small'); else endTuto(); }
}
function renderTuto(now) {
  S.tuto.removeChildren(); const Tt = M.tuto; if (!Tt) return; const st = TUTO[Tt.i]; if (!st) return;
  const bar = new PIXI.Container(); bar.x = VIEW.w / 2; bar.y = 140; S.tuto.addChild(bar);
  const bg = new PIXI.Graphics(); bg.beginFill(0x0b1a3a, .9); bg.lineStyle(4, 0xffd200); bg.drawRoundedRect(-320, -30, 640, 60, 30); bg.endFill(); bar.addChild(bg);
  const t = txt(st.t, 26); t.anchor.set(.5); bar.addChild(t);
  for (let i = 0; i < TUTO.length; i++) { const d = new PIXI.Graphics(); d.beginFill(i < Tt.i ? 0x7dff2c : i === Tt.i ? 0xffd200 : 0x55607a); d.drawCircle(-60 + i * 24, 46, 7); d.endFill(); bar.addChild(d); }
  if (!st.btn) return;
  const show = st.btn.startsWith('joy') || st.btn === 'pw' || Tt.slow; if (!show) return;
  if (Tt.slow) { const dim = new PIXI.Graphics(); dim.beginFill(0x000000, .35); dim.drawRect(0, 0, VIEW.w, BAND); dim.endFill(); S.tuto.addChildAt(dim, 0); }
  const B = BTN[st.btn], hx = B ? B.x : S.joyHome.x, hy = B ? B.y : S.joyHome.y;
  const hand = new PIXI.Sprite(T('img/ui/hand.webp')); hand.width = 64; hand.height = 99; const ph = (now % 1200) / 1200;
  if (st.btn === 'joyx') { hand.x = hx - 8 + Math.sin(ph * Math.PI * 2) * 44; hand.y = hy - 4; }
  else if (st.btn === 'joyup') { hand.x = hx - 8; hand.y = hy - 4 - Math.sin(ph * Math.PI) * 40; }
  else { hand.x = hx - 10; hand.y = hy - 2 + Math.abs(Math.sin(now * .01)) * 10; const r = new PIXI.Graphics(); r.lineStyle(5, 0xffd200, .6 + .4 * Math.sin(now * .012)); r.drawCircle(hx, hy, 60 + Math.sin(now * .012) * 5); S.tuto.addChild(r); }
  S.tuto.addChild(hand);
}

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
      const slowF = M.tuto && M.tuto.slow ? 4 : M.slow > 0 ? 2 : 1; if (M.slow > 0) M.slow--;
      M.slowAcc++; if (M.slowAcc % slowF) continue;
      for (const o of [M.P[0], M.P[1], M.b]) { o.px = o.x; o.py = o.y; }
      step(); if (!M) return;
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
    if (!M.tuto && M.t < 200 && (M.st === 150 || M.st === 105 || M.st === 60)) { showMsg(M.st === 150 ? '3' : M.st === 105 ? '2' : '1', M.st === 60 ? 0xff5a3c : 0xffd200, 'count'); sfx('beep'); }
    if (M.st <= (M.tuto ? 150 : 15)) { M.state = 'play'; if (!M.tuto) { if (M.t < 200) showMsg('GO !', 0x7dff2c, 'count'); sfx('whistle'); } }
  } else if (M.state === 'goal') {
    M.st--; if (M.st <= 0) { if (M.time <= 0 && !M.tuto) { endMatch(); return; } kickoff(1 - M.celeb.side); M.celeb = null; M.state = 'ready'; M.st = 60; }
  } else if (M.state === 'play') {
    if (M.tuto) tutoStep(); else { M.time--; if (M.time <= 0 && M.b.y > GOAL_TOP - 200) { endMatch(); return; } }
    if (!M) return;
  }
  const I0 = M.P[0].ai ? stepAI(M.P[0]) : readInput(), I1 = (M.tuto && M.tuto.i < 5) ? { ax: 0 } : stepAI(M.P[1]);
  stepPlayer(M.P[0], I0); stepPlayer(M.P[1], I1);
  const a = M.P[0], c = M.P[1], dx = c.x - a.x, min = 62; if (Math.abs(dx) < min && Math.abs(a.y - c.y) < 80) { const push = (min - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1); a.x -= push; c.x += push; }
  animPlayer(a); animPlayer(c);
  if (M.state === 'play' || M.state === 'goal') stepBall(); else M.b.rot += .03;
  stepProj();
  M.b.sq *= .82; M.shake *= .86; M.flash *= .9; M.net[0] *= .97; M.net[1] *= .97;
  stepFx();
}
function pauseMatch() { if (!M || M.state === 'end' || M.paused) return; M.paused = true; JOY.id = null; JOY.act = false; INP.ax = 0; onPause(); }
function resumeMatch() { if (!M) return; M.paused = false; last = performance.now(); }
function quitMatch() { crowdSound(false); M = null; app.ticker.stop(); app.stage.removeChildren(); S = null; }
function endMatch() { const r = { score: M.score.slice(), o: M.o, stats: M.stats }; M.state = 'end'; sfx('whistle3'); crowdSound(false); setTimeout(() => { quitMatch(); onMatchEnd(r); }, 900); }
function endTuto() { const o = M.o; setTimeout(() => { quitMatch(); onTutoEnd(o); }, 1400); }
