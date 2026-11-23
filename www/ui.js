// =====================================================================
// Koura Virage V1 — menus, sauvegarde, sons
// =====================================================================
const ui = document.getElementById('ui');
let SV = null;
function load() {
  try { SV = JSON.parse(localStorage.getItem('kw1') || 'null'); } catch (e) { SV = null; }
  if (!SV) {
    SV = { nick: 'mle3bi_' + (1000 + Math.random() * 9000 | 0), dt: 300, own: ['bey'], char: 'bey', ownB: ['b_base'], boot: 'b_base', tuto: 0, wins: 0, played: 0, snd: 1, streak: 0 };
    // reprise de l'ancienne version
    try { const o = JSON.parse(localStorage.getItem('kv1') || 'null'); if (o) { SV.nick = o.nick || SV.nick; SV.dt = Math.max(SV.dt, o.dt || 0); SV.own = (o.own || ['bey']).filter(id => CHARS.some(c => c.id === id)); if (!SV.own.includes('bey')) SV.own.unshift('bey'); SV.char = SV.own.includes(o.char) ? o.char : 'bey'; SV.tuto = o.tuto ? 1 : 0; const inv = o.inv || {}; SV.ownB = ['b_base'].concat(Object.keys(inv).filter(k => BOOTS.some(b => b.id === k) && k !== 'b_base')); } } catch (e) { }
    save();
  }
}
function save() { try { localStorage.setItem('kw1', JSON.stringify(SV)); } catch (e) { } }
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const RLAB = { 'commun': 'Commun', 'rare': 'Rare', 'épique': 'Épique', 'légendaire': 'Légendaire', 'légende 78': 'Légende 78' };

// ---------- sons (synthétisés, aucun fichier) ----------
let AC = null, MASTER = null, CROWD = null;
function au() { if (AC) { if (AC.state === 'suspended') AC.resume(); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); MASTER = AC.createGain(); MASTER.gain.value = SV.snd ? .8 : 0; MASTER.connect(AC.destination); } catch (e) { } }
function noiseBuf(sec) { const b = AC.createBuffer(1, AC.sampleRate * sec, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
let NB = null;
function tone(f, d, type, vol, f2, delay) { if (!AC) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(vol || .2, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + d + .02); }
function noise(d, vol, fq, q, delay, type) { if (!AC) return; NB = NB || noiseBuf(2); const t = AC.currentTime + (delay || 0), s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = NB; f.type = type || 'bandpass'; f.frequency.value = fq || 1000; f.Q.value = q || 1; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(g); g.connect(MASTER); s.start(t, Math.random()); s.stop(t + d + .05); }
function sfx(k, v) {
  if (!AC || !SV.snd) return; v = v == null ? 1 : v;
  switch (k) {
    case 'kick': tone(150, .18, 'sine', .7, 45); noise(.08, .5, 1800, .8); break;
    case 'head': tone(260, .12, 'sine', .45, 120); noise(.06, .3, 2500, 1); break;
    case 'bump': tone(180, .08, 'sine', .25, 90); break;
    case 'bounce': tone(120, .1, 'sine', .25 * v, 70); break;
    case 'post': tone(900, .5, 'triangle', .25, 860); tone(1350, .4, 'sine', .1); break;
    case 'swish': noise(.12, .18, 3000, 2, 0, 'highpass'); break;
    case 'jump': tone(300, .14, 'square', .06, 620); break;
    case 'beep': tone(660, .14, 'square', .1); break;
    case 'tick': tone(1000, .05, 'square', .06); break;
    case 'whistle': tone(2300, .12, 'sine', .25); tone(2300, .35, 'sine', .25, 2200, .16); break;
    case 'whistle3': for (let i = 0; i < 3; i++) tone(2300, i < 2 ? .14 : .5, 'sine', .25, 2250, i * .22); break;
    case 'goal': tone(392, .25, 'square', .12); tone(523, .25, 'square', .12, 0, .12); tone(659, .25, 'square', .12, 0, .24); tone(784, .6, 'square', .14, 0, .36); break;
    case 'coin': tone(988, .08, 'square', .1); tone(1319, .25, 'square', .1, 0, .08); break;
    case 'tap': tone(520, .06, 'triangle', .15, 700); break;
    case 'slam': tone(90, .5, 'sine', .6, 40); noise(.4, .4, 400, .5); break;
    case 'whoosh': noise(.35, .25, 900, .6, 0, 'bandpass'); break;
    case 'unlock': [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .15, 0, i * .09)); break;
  }
}
// ambiance du stade : rumeur continue + clameur sur les buts
function crowdSound(on) {
  if (!AC) return;
  if (on && !CROWD) { const s = AC.createBufferSource(); s.buffer = noiseBuf(4); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = .5; const g = AC.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(MASTER); s.start(); g.gain.setTargetAtTime(.09, AC.currentTime, .8); CROWD = { s, g, f }; }
  if (!on && CROWD) { const c = CROWD; c.g.gain.setTargetAtTime(0, AC.currentTime, .3); setTimeout(() => { try { c.s.stop(); } catch (e) { } }, 1500); CROWD = null; }
}
function crowdRoar() { if (!CROWD || !AC) return; const t = AC.currentTime; CROWD.g.gain.cancelScheduledValues(t); CROWD.g.gain.setTargetAtTime(.45, t, .08); CROWD.g.gain.setTargetAtTime(.09, t + 2.2, .9); CROWD.f.frequency.setTargetAtTime(1100, t, .1); CROWD.f.frequency.setTargetAtTime(700, t + 2.2, .9); }
function vib(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

// ---------- personnage en HTML (tête + chaussure) animé en CSS ----------
function heroHTML(chId, bootId, cls, expr) {
  return `<div class="hero ${cls || ''}"><div class="hsh"></div><img class="hboot" src="img/eq/${bootId}.webp"><img class="hhead" src="img/h/${chId}_${expr || 0}.webp"></div>`;
}
function headHTML(chId, cls) { return `<img class="${cls || 'mini'}" src="img/h/${chId}_0.webp">`; }

// ---------- écrans ----------
function show(html, cls) { ui.className = 'on ' + (cls || ''); ui.innerHTML = html; ui.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); au(); sfx('tap'); act(el.dataset.a, el); })); }
function topbar() { return `<div class="top"><div class="pill nick">${headHTML(SV.char, 'pico')}<b>${SV.nick}</b></div><div class="pill dt"><span class="cash">💵</span><b id="dtv">${fmt(SV.dt)}</b><small>DT</small></div><button class="sbtn" data-a="snd">${SV.snd ? '🔊' : '🔇'}</button></div>`; }

function title() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title.webp)"></div><div class="spark"></div>
  <div class="ttap" data-a="start"><span>TOUCHE POUR JOUER</span></div><div class="ver">V${APP_VERSION}</div>`, 'title');
}
function home() {
  const c = CH(SV.char), b = BT(SV.boot);
  show(`<div class="bgimg kb2" style="background-image:url(img/bg/vest.webp)"></div><div class="vign"></div><div class="beams"><i></i><i></i><i></i></div>
  ${topbar()}
  <div class="homeL">
    <button class="mbtn blue" data-a="chars"><span>👤</span>Personnages</button>
    <button class="mbtn blue" data-a="boots"><span>👟</span>Chaussures</button>
    <button class="mbtn gray small" data-a="demo"><span>🎓</span>Démo</button>
  </div>
  <div class="stagec">${heroHTML(c.id, b.id, 'big idle')}<div class="plate"><b>${c.n}</b><small style="color:${RCOL[c.r]}">${RLAB[c.r]}</small></div></div>
  <div class="homeR">
    <button class="playbtn" data-a="play"><span class="pl1">JOUER</span><span class="pl2">Match rapide • 90 s</span></button>
    <div class="rec"><span>🏆 ${SV.wins} victoires</span><span>⚽ ${SV.played} matchs</span>${SV.streak > 1 ? `<span>🔥 ${SV.streak} d'affilée</span>` : ''}</div>
  </div>`, 'home');
}
let SEL = null;
function chars() {
  SEL = SEL && CHARS.some(c => c.id === SEL) ? SEL : SV.char; const c = CH(SEL), own = SV.own.includes(c.id);
  const st = k => Math.round((c[k] || 1) * 100);
  show(`<div class="bgimg" style="background-image:url(img/bg/vest.webp);filter:blur(3px) brightness(.55)"></div>
  <div class="shop" style="--rc:${RCOL[c.r]}">
   <div class="shL"><div class="shName">${c.n}</div><div class="shSub">${c.sub}</div>
    <div class="shStage"><div class="halo"></div>${heroHTML(c.id, SV.boot, 'big idle' + (own ? '' : ' locked'), own ? 0 : 0)}</div>
    <div class="stats">${[['Vitesse', 'spd'], ['Saut', 'jmp'], ['Tir', 'kp'], ['Tête', 'hd']].map(([n, k]) => `<div class="st"><span>${n}</span><i><b style="width:${(st(k) - 80) * 2.2}%"></b></i><em>${st(k)}</em></div>`).join('')}</div>
    ${own ? (SV.char === c.id ? '<div class="mbtn gray wide">✔ Équipé</div>' : `<button class="mbtn green wide" data-a="pick:${c.id}">Choisir</button>`) : `<button class="mbtn yellow wide" data-a="buy:${c.id}">Acheter • 💵 ${fmt(c.pr)}</button>`}
   </div>
   <div class="shR"><div class="grid">${CHARS.map(x => `<button class="card ${x.id === SEL ? 'sel' : ''} ${SV.own.includes(x.id) ? '' : 'lock'}" data-a="sel:${x.id}" style="--rc:${RCOL[x.r]}">${headHTML(x.id, 'chead')}${SV.char === x.id ? '<span class="chk">✔</span>' : ''}<span class="cr">${SV.own.includes(x.id) ? RLAB[x.r] : '💵 ' + fmt(x.pr)}</span></button>`).join('')}</div></div>
  </div><button class="back" data-a="home">◀</button>${topbar()}`, 'shopv');
}
let SELB = null;
function boots() {
  SELB = SELB || SV.boot; const b = BT(SELB), own = SV.ownB.includes(b.id);
  const bon = Object.entries(b.b || {}).map(([k, v]) => `${{ kp: 'Tir', spd: 'Vitesse', jmp: 'Saut', hd: 'Tête' }[k]} +${v}%`).join(' • ') || 'Aucun bonus';
  show(`<div class="bgimg" style="background-image:url(img/bg/vest.webp);filter:blur(3px) brightness(.55)"></div>
  <div class="shop" style="--rc:${RCOL[b.r]}">
   <div class="shL"><div class="shName">${b.n}</div><div class="shSub">${bon}</div>
    <div class="shStage"><div class="halo"></div>${heroHTML(SV.char, b.id, 'big idle')}</div>
    ${own ? (SV.boot === b.id ? '<div class="mbtn gray wide">✔ Équipées</div>' : `<button class="mbtn green wide" data-a="pickb:${b.id}">Équiper</button>`) : `<button class="mbtn yellow wide" data-a="buyb:${b.id}">Acheter • 💵 ${fmt(b.pr)}</button>`}
   </div>
   <div class="shR"><div class="grid">${BOOTS.map(x => `<button class="card bt ${x.id === SELB ? 'sel' : ''} ${SV.ownB.includes(x.id) ? '' : 'lock'}" data-a="selb:${x.id}" style="--rc:${RCOL[x.r]}"><img class="cboot" src="img/eq/${x.id}.webp">${SV.boot === x.id ? '<span class="chk">✔</span>' : ''}<span class="cr">${SV.ownB.includes(x.id) ? RLAB[x.r] : '💵 ' + fmt(x.pr)}</span></button>`).join('')}</div></div>
  </div><button class="back" data-a="home">◀</button>${topbar()}`, 'shopv');
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1900); }

function act(a, el) {
  if (a === 'start') { if (!SV.tuto) return startTuto(); return home(); }
  if (a === 'home') return home();
  if (a === 'snd') { SV.snd = SV.snd ? 0 : 1; save(); if (MASTER) MASTER.gain.value = SV.snd ? .8 : 0; el.textContent = SV.snd ? '🔊' : '🔇'; return; }
  if (a === 'chars') return chars(); if (a === 'boots') return boots();
  if (a === 'demo') return startTuto();
  if (a === 'play') return vsScreen();
  if (a.startsWith('sel:')) { SEL = a.slice(4); return chars(); }
  if (a.startsWith('pick:')) { SV.char = a.slice(5); save(); sfx('coin'); return chars(); }
  if (a.startsWith('buy:')) { const c = CH(a.slice(4)); if (SV.dt < c.pr) { toast('Il te manque ' + fmt(c.pr - SV.dt) + ' DT'); return; } SV.dt -= c.pr; SV.own.push(c.id); SV.char = c.id; save(); sfx('unlock'); unlockFx(c.id); return; }
  if (a.startsWith('selb:')) { SELB = a.slice(5); return boots(); }
  if (a.startsWith('pickb:')) { SV.boot = a.slice(6); save(); sfx('coin'); return boots(); }
  if (a.startsWith('buyb:')) { const b = BT(a.slice(5)); if (SV.dt < b.pr) { toast('Il te manque ' + fmt(b.pr - SV.dt) + ' DT'); return; } SV.dt -= b.pr; SV.ownB.push(b.id); SV.boot = b.id; save(); sfx('unlock'); toast(b.n + ' : équipées !'); return boots(); }
  if (a === 'again') return vsScreen();
  if (a === 'resume') { document.querySelector('.pause')?.remove(); resumeMatch(); return; }
  if (a === 'quit') { document.querySelector('.pause')?.remove(); quitMatch(); return home(); }
}
function unlockFx(id) {
  const d = document.createElement('div'); d.className = 'unlock'; d.innerHTML = `<div class="urays"></div><div class="ubox">${heroHTML(id, SV.boot, 'big joy', 3)}<div class="ut">NOUVEAU JOUEUR !</div><div class="un">${CH(id).n}</div></div>`;
  document.body.appendChild(d); d.addEventListener('click', () => { d.remove(); chars(); }); setTimeout(() => { if (d.isConnected) { d.remove(); chars(); } }, 3200);
}

// ---------- avant-match (VS) ----------
function oppFor() {
  const lvl = Math.min(1, .3 + SV.wins * .04);
  const pool = CHARS.filter(c => c.id !== SV.char && (c.pr <= 4000 + SV.wins * 1500));
  const c = pick(pool.length ? pool : CHARS.filter(c => c.id !== SV.char));
  const bp = BOOTS.filter(b => b.pr <= 1000 + SV.wins * 900);
  return { id: c.id, boot: pick(bp).id, name: pick(NICKS) + '_' + (10 + Math.random() * 89 | 0), ai: clamp(lvl + rnd(-.08, .08), .25, .95) };
}
async function vsScreen() {
  const o = oppFor(); const me = CH(SV.char), op = CH(o.id);
  show(`<div class="bgimg" style="background-image:url(img/bg/vs.webp)"></div><div class="vsW">
   <div class="vsP L">${heroHTML(me.id, SV.boot, 'big', 1)}<div class="vsN">${SV.nick}</div><div class="vsC">${me.n}</div></div>
   <div class="vsP R">${heroHTML(op.id, o.boot, 'big flip', 1)}<div class="vsN">${o.name}</div><div class="vsC">${op.n}</div></div>
   <div class="vsLoad"><i id="ldb"></i></div></div>`, 'vs');
  sfx('whoosh'); setTimeout(() => sfx('slam'), 450);
  const t0 = Date.now();
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  const wait = Math.max(0, 2300 - (Date.now() - t0));
  setTimeout(() => { ui.className = ''; ui.innerHTML = ''; newMatch({ me: SV.char, boot: SV.boot, myName: SV.nick, opp: o.id, oppBoot: o.boot, oppName: o.name, ai: o.ai }); }, wait);
}
async function startTuto() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title.webp)"></div><div class="loadc"><b>Match démo</b><div class="vsLoad"><i id="ldb"></i></div></div>`, 'title');
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  ui.className = ''; ui.innerHTML = '';
  newMatch({ me: SV.char, boot: SV.boot, myName: SV.nick, opp: 'chebbi', oppBoot: 'b_base', oppName: 'Gardien', ai: .15, tuto: 1 });
}
function onTutoEnd() { const first = !SV.tuto; SV.tuto = 1; if (first) SV.dt += 200; save(); resultScreen({ score: [1, 0], tuto: 1, gain: first ? 200 : 0 }); }
function onPause() {
  const d = document.createElement('div'); d.className = 'pause'; d.innerHTML = `<div class="pbox"><h2>PAUSE</h2><button class="mbtn green wide" data-a="resume">Reprendre</button><button class="mbtn red wide" data-a="quit">Quitter le match</button></div>`;
  document.body.appendChild(d); d.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', () => { sfx('tap'); act(el.dataset.a, el); }));
}
function onMatchEnd(r) {
  const [a, b] = r.score, win = a > b, draw = a === b;
  const gain = (win ? 150 : draw ? 70 : 40) + a * 20;
  SV.played++; if (win) { SV.wins++; SV.streak++; } else SV.streak = 0; SV.dt += gain; save();
  resultScreen({ score: r.score, gain, win, draw });
}
function resultScreen(r) {
  const win = r.tuto || r.win, [a, b] = r.score;
  show(`<div class="bgimg kb" style="background-image:url(img/bg/${win ? 'win' : 'lose'}.webp)"></div>${win ? '<div class="conf"></div>' : ''}
  <div class="res ${win ? 'w' : r.draw ? 'd' : 'l'}">
   <div class="rT">${r.tuto ? 'DÉMO RÉUSSIE !' : win ? 'VICTOIRE !' : r.draw ? 'MATCH NUL' : 'DÉFAITE'}</div>
   <div class="rRow">${heroHTML(SV.char, SV.boot, 'big ' + (win ? 'joy' : ''), win ? 3 : 2)}<div class="rS">${a}<span>-</span>${b}</div></div>
   ${r.gain ? `<div class="rG">+ <b id="gv">0</b> DT</div>` : ''}
   <div class="rB"><button class="mbtn blue" data-a="home">Menu</button>${r.tuto ? '<button class="mbtn green" data-a="play">Premier match ▶</button>' : '<button class="mbtn green" data-a="again">Rejouer ▶</button>'}</div>
  </div>`, 'result');
  if (win) sfx('unlock');
  if (r.gain) { let v = 0; const e = document.getElementById('gv'), st = Date.now(); const f = () => { const k = Math.min(1, (Date.now() - st) / 900); if (e) e.textContent = fmt(r.gain * k); if (k < 1) requestAnimationFrame(f); else sfx('coin'); }; setTimeout(f, 500); }
}

// ---------- lancement ----------
load();
title();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
try { if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.ScreenOrientation) Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) { }
