// =====================================================================
// Koura Virage V1.1 — menus, sauvegarde, sons, championnat, clubs,
// vestiaire, évolutions, pouvoirs, coffres, missions, jetons et pubs
// =====================================================================
const ui = document.getElementById('ui');
let SV = null;
const DAY = () => Math.floor(Date.now() / 864e5);
const WEEK = () => Math.floor((DAY() + 3) / 7);
const DEF = () => ({
  nick: 'mle3bi_' + (1000 + Math.random() * 9000 | 0), dt: 300, jt: 5, own: ['bey'], char: 'bey', ownB: ['b_base'], boot: 'b_base', tuto: 0, wins: 0, played: 0, goals: 0, snd: 1, streak: 0,
  club: null, gear: { hat: 'h_none', glasses: 'g_none', scarf: 's_none', ball: 'ba_cl' }, ownA: ['h_none', 'g_none', 's_none', 'ba_cl'], evo: {}, pw: 'harissa', ownP: ['harissa'], venue: 'auto',
  div: 10, best: 10, titles: 0, season: { n: 0, pts: 0, res: [] }, chests: [0, null, null, null], miss: { day: -1, list: [] }, daily: { day: -1, k: 0 }, cw: { week: -1, pts: 0 }, ads: { day: -1, n: 0 }
});
function load() {
  try { SV = JSON.parse(localStorage.getItem('kw1') || 'null'); } catch (e) { SV = null; }
  const d = DEF();
  if (!SV) {
    SV = d;
    try { const o = JSON.parse(localStorage.getItem('kv1') || 'null'); if (o) { SV.nick = o.nick || SV.nick; SV.dt = Math.max(SV.dt, o.dt || 0); SV.own = (o.own || ['bey']).filter(id => CHARS.some(c => c.id === id)); if (!SV.own.includes('bey')) SV.own.unshift('bey'); SV.char = SV.own.includes(o.char) ? o.char : 'bey'; SV.tuto = o.tuto ? 1 : 0; } } catch (e) { }
  }
  for (const k in d) if (SV[k] === undefined) SV[k] = d[k];
  for (const k in d.gear) if (!SV.gear[k]) SV.gear[k] = d.gear[k];
  if (SV.chests[0] === 0) SV.chests[0] = { r: 0, end: 0 };   // coffre de bienvenue, prêt à ouvrir
  save();
}
function save() { try { localStorage.setItem('kw1', JSON.stringify(SV)); } catch (e) { } }
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const RLAB = { 'commun': 'Commun', 'rare': 'Rare', 'épique': 'Épique', 'légendaire': 'Légendaire', 'légende 78': 'Légende 78' };
const STN = { kp: 'Tir', spd: 'Vitesse', jmp: 'Saut', hd: 'Tête' };
const bonTxt = b => Object.entries(b || {}).map(([k, v]) => `${STN[k]} +${v}%`).join(' • ') || 'Aucun bonus';
const hrnd = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const isDerbyWeek = () => WEEK() % 3 === 0;
const rivals = id => DERBYS.filter(d => d.includes(id)).map(d => d[0] === id ? d[1] : d[0]);

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
    case 'concede': tone(392, .3, 'triangle', .14, 300); tone(294, .5, 'triangle', .14, 220, .25); break;
    case 'power': tone(220, .5, 'sawtooth', .12, 880); noise(.4, .2, 1500, .7); break;
    case 'fire': noise(.6, .35, 600, .5); tone(110, .5, 'sawtooth', .15, 60); break;
    case 'ice': tone(1800, .3, 'triangle', .1, 2600); tone(2400, .4, 'sine', .08, 1900, .1); break;
    case 'coin': tone(988, .08, 'square', .1); tone(1319, .25, 'square', .1, 0, .08); break;
    case 'tap': tone(520, .06, 'triangle', .15, 700); break;
    case 'slam': tone(90, .5, 'sine', .6, 40); noise(.4, .4, 400, .5); break;
    case 'whoosh': noise(.35, .25, 900, .6, 0, 'bandpass'); break;
    case 'unlock': [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .15, 0, i * .09)); break;
    case 'chest': for (let i = 0; i < 4; i++) tone(200 + i * 40, .08, 'square', .1, 0, i * .12); break;
  }
}
function crowdSound(on) {
  if (!AC) return;
  if (on && !CROWD) { const s = AC.createBufferSource(); s.buffer = noiseBuf(4); s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = .5; const g = AC.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(MASTER); s.start(); g.gain.setTargetAtTime(.09, AC.currentTime, .8); CROWD = { s, g, f }; }
  if (!on && CROWD) { const c = CROWD; c.g.gain.setTargetAtTime(0, AC.currentTime, .3); setTimeout(() => { try { c.s.stop(); } catch (e) { } }, 1500); CROWD = null; }
}
function crowdRoar() { if (!CROWD || !AC) return; const t = AC.currentTime; CROWD.g.gain.cancelScheduledValues(t); CROWD.g.gain.setTargetAtTime(.45, t, .08); CROWD.g.gain.setTargetAtTime(.09, t + 2.2, .9); CROWD.f.frequency.setTargetAtTime(1100, t, .1); CROWD.f.frequency.setTargetAtTime(700, t + 2.2, .9); }
function vib(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }

// ---------- personnage HTML (tête + accessoires + chaussure) animé en CSS ----------
function heroHTML(chId, bootId, cls, expr, gear) {
  const g = gear || {}, has = id => id && AC_(id) && AC_(id).kind;
  const acc = (has(g.scarf) ? `<img class="ascarf" src="img/eq/${g.scarf}.webp">` : '') + (has(g.glasses) ? `<img class="aglass" src="img/eq/${g.glasses}.webp">` : '') + (has(g.hat) ? `<img class="ahat ${g.hat}" src="img/eq/${g.hat}.webp">` : '');
  return `<div class="hero ${cls || ''}"><div class="hsh"></div><img class="hboot" src="img/eq/${bootId}.webp"><div class="hhead"><img class="hface" src="img/h/${chId}_${expr || 0}.webp">${acc}</div></div>`;
}
const myHero = (cls, expr) => heroHTML(SV.char, SV.boot, cls, expr, SV.gear);
function headHTML(chId, cls) { return `<img class="${cls || 'mini'}" src="img/h/${chId}_0.webp">`; }
const crest = (id, cls) => `<img class="${cls || 'crest'}" src="img/cr/${CL(id).cr}.webp">`;
const evoLv = id => SV.evo[id] || 1;

// ---------- écrans ----------
function show(html, cls) { ui.className = 'on ' + (cls || ''); ui.innerHTML = html; bind(ui); tickTimers(); }
function bind(root) { root.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); au(); sfx('tap'); act(el.dataset.a, el); })); }
function topbar() {
  return `<div class="top"><div class="pill nick" data-a="nick">${headHTML(SV.char, 'pico')}<b>${SV.nick}</b></div>
  ${SV.club ? `<div class="pill club" data-a="clubs">${crest(SV.club, 'pcr')}<b>${CL(SV.club).s}</b></div>` : ''}
  <div class="pill jt" data-a="ad"><img class="pic" src="img/ic/gem.webp"><b id="jtv">${fmt(SV.jt)}</b><i class="plus">+</i></div>
  <div class="pill dt"><img class="pic" src="img/ic/coins.webp"><b id="dtv">${fmt(SV.dt)}</b><small>DT</small></div>
  <button class="sbtn" data-a="snd">${SV.snd ? '🔊' : '🔇'}</button></div>`;
}
function refreshTop() { const a = document.getElementById('dtv'), b = document.getElementById('jtv'); if (a) a.textContent = fmt(SV.dt); if (b) b.textContent = fmt(SV.jt); }

function title() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title.webp)"></div><div class="spark"></div>
  <div class="ttap" data-a="start"><span>TOUCHE POUR JOUER</span></div><div class="ver">V${APP_VERSION}</div>`, 'title');
}
function venueNow() { return SV.venue === 'auto' ? VENUES[(SV.season.n + SV.div) % VENUES.length] : VENUES.find(v => v.id === SV.venue) || VENUES[0]; }
function home() {
  missionsDay();
  const c = CH(SV.char), lv = evoLv(c.id), claim = SV.miss.list.some(m => m.p >= MIS(m.id).n && !m.c), ready = SV.chests.filter(x => x && x.end && x.end <= Date.now() || (x && x.end === 0)).length;
  const V = venueNow(), dw = isDerbyWeek();
  show(`<div class="bgimg kb2" style="background-image:url(img/bg/vest.webp)"></div><div class="vign"></div><div class="beams"><i></i><i></i><i></i></div>
  ${topbar()}
  <div class="homeL">
    <button class="mbtn blue" data-a="vest"><img class="bic" src="img/ic/crown.webp">Vestiaire</button>
    <button class="mbtn orange" data-a="league"><img class="bic" src="img/ic/podium.webp">Classements</button>
    <button class="mbtn blue" data-a="missions"><img class="bic" src="img/ic/cal.webp">Missions${claim ? '<em class="dot">!</em>' : ''}</button>
    <button class="mbtn gray small" data-a="demo"><span>🎓</span>Démo</button>
  </div>
  <div class="stagec">${myHero('big idle' + (lv > 1 ? ' evo' + lv : ''))}<div class="plate"><b>${c.n}</b><small style="color:${RCOL[c.r]}">${RLAB[c.r]} • ${EVO_N[lv - 1]}</small></div></div>
  <div class="homeR">
    <div class="divb"><img src="img/dv/${SV.div}.webp"><div><b>Division ${DIV_N[SV.div]}</b><small>Saison : ${SV.season.pts} pts • match ${Math.min(10, SV.season.n + 1)}/10</small></div></div>
    <button class="playbtn" data-a="play"><span class="pl1">JOUER</span><span class="pl2">Championnat • 60 s</span></button>
    <button class="venue" data-a="venue">🏟 ${SV.venue === 'auto' ? 'Auto : ' : ''}${V.n}</button>
    ${dw ? '<div class="derby">🔥 SEMAINE DU DERBY : points du club ×2</div>' : ''}
  </div>
  <div class="chestbar">${chestSlots()}</div>`, 'home');
  if (SV.daily.day !== DAY() && SV.tuto && SV.club) setTimeout(dailyGift, 400);
}
// ---------- coffres ----------
function chestSlots() {
  return SV.chests.map((x, i) => {
    if (!x) return `<div class="cslot empty"><span>Gagne un match</span></div>`;
    const ch = CHESTS[x.r], rd = x.end === 0 || (x.end && x.end <= Date.now()), run = x.end && !rd;
    return `<button class="cslot r${x.r} ${rd ? 'ready' : ''}" data-a="chest:${i}"><img src="img/ch/${x.r}.webp"><b>${rd ? 'OUVRIR !' : run ? `<i data-t="${x.end}"></i>` : fmtMin(ch.min)}</b><small>${ch.n.replace('Coffre ', '')}</small></button>`;
  }).join('');
}
const fmtMin = m => m >= 60 ? (m / 60 | 0) + ' h' + (m % 60 ? ' ' + (m % 60) : '') : m + ' min';
function fmtLeft(ms) { const s = Math.max(0, Math.ceil(ms / 1000)), h = s / 3600 | 0, m = (s % 3600) / 60 | 0, ss = s % 60; return h ? `${h}h ${String(m).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`; }
function tickTimers() { document.querySelectorAll('[data-t]').forEach(e => { const l = +e.dataset.t - Date.now(); e.textContent = l > 0 ? fmtLeft(l) : 'PRÊT'; if (l <= 0 && !e.dataset.done) { e.dataset.done = 1; if (ui.classList.contains('home')) setTimeout(home, 300); } }); }
setInterval(tickTimers, 1000);
function chestAct(i) {
  const x = SV.chests[i]; if (!x) return; const ch = CHESTS[x.r];
  if (x.end === 0 || (x.end && x.end <= Date.now())) return openChest(i);
  const running = SV.chests.some(c => c && c.end > Date.now());
  const cost = x.end ? Math.max(1, Math.ceil((x.end - Date.now()) / 6e5)) : Math.max(1, Math.ceil(ch.min / 10));
  popup(`<img class="popimg" src="img/ch/${x.r}.webp"><h3>${ch.n}</h3><p>${x.end ? 'Ouverture en cours : <b data-t="' + x.end + '"></b>' : 'Temps d\'ouverture : ' + fmtMin(ch.min)}</p>
   <p class="sm">Contient ${ch.dt[0]}-${ch.dt[1]} DT, ${ch.jt[0]}-${ch.jt[1]} jetons${ch.it ? ', ' + Math.round(ch.it * 100) + ' % de chance d\'objet' : ''}</p>
   <div class="prow">${!x.end ? (running ? '<div class="mbtn gray small">Un coffre est déjà en cours</div>' : `<button class="mbtn green small" data-a="cstart:${i}">Démarrer</button>`) : `<button class="mbtn blue small" data-a="cad:${i}">📺 Pub : −30 min</button>`}
   <button class="mbtn yellow small" data-a="cnow:${i}">Ouvrir • <img class="bic s" src="img/ic/gem.webp">${cost}</button></div>`);
}
function addChest(r) { const i = SV.chests.findIndex(x => !x); if (i < 0) return -1; SV.chests[i] = { r, end: null }; return i; }
function rollChest() { const f = (10 - SV.div) / 9, w = [60 - 30 * f, 28, 9 + 15 * f, 2.5 + 8 * f, .5 + 3 * f]; let r = Math.random() * w.reduce((a, b) => a + b), i = 0; while (r > w[i]) { r -= w[i]; i++; } return Math.min(4, i); }
function openChest(i) {
  const x = SV.chests[i], ch = CHESTS[x.r]; SV.chests[i] = null;
  const dt = Math.round(rnd(ch.dt[0], ch.dt[1]) / 10) * 10, jt = Math.round(rnd(ch.jt[0], ch.jt[1]));
  SV.dt += dt; SV.jt += jt; let item = null;
  if (Math.random() < ch.it) {
    const ok = ['commun', 'rare', 'épique', 'légendaire'].slice(0, 2 + (x.r >= 2) + (x.r >= 4));
    const pool = [...ACC.filter(a => a.kind && !SV.ownA.includes(a.id)), ...BOOTS.filter(b => !SV.ownB.includes(b.id))].filter(a => ok.includes(a.r));
    if (pool.length) { item = pick(pool); if (item.slot === 'boots') SV.ownB.push(item.id); else SV.ownA.push(item.id); }
  }
  save(); sfx('chest');
  const d = document.createElement('div'); d.className = 'unlock'; d.innerHTML = `<div class="urays"></div><div class="ubox"><img class="chshake" src="img/ch/${x.r}.webp"></div>`;
  document.body.appendChild(d);
  setTimeout(() => {
    sfx('unlock'); vib(80);
    d.querySelector('.ubox').innerHTML = `<div class="ut">${ch.n.toUpperCase()}</div><div class="rew">
      <div class="rw"><img src="img/ic/coins.webp"><b>+${fmt(dt)} DT</b></div>${jt ? `<div class="rw"><img src="img/ic/gem.webp"><b>+${jt} jetons</b></div>` : ''}
      ${item ? `<div class="rw item" style="--rc:${RCOL[item.r]}"><img src="img/eq/${item.id}.webp"><b>${item.n}</b><small>${RLAB[item.r]}</small></div>` : ''}</div><div class="un">Touche pour continuer</div>`;
    d.addEventListener('click', () => { d.remove(); home(); });
  }, 1300);
}
// ---------- jetons et pubs ----------
function adsLeft() { if (SV.ads.day !== DAY()) { SV.ads = { day: DAY(), n: 0 }; } return 8 - SV.ads.n; }
function showAd(done) {
  if (adsLeft() <= 0) { toast('Plus de pubs aujourd\'hui, reviens demain'); return; }
  const d = document.createElement('div'); d.className = 'adv'; let s = 5;
  d.innerHTML = `<div class="adbox"><small>PUBLICITÉ</small><img src="img/bg/title.webp"><b>Koura Virage • Joue avec ton club !</b><div class="adc">${s}</div></div>`;
  document.body.appendChild(d);
  const it = setInterval(() => { s--; d.querySelector('.adc').textContent = s > 0 ? s : '✔'; if (s <= 0) { clearInterval(it); setTimeout(() => { d.remove(); SV.ads.n++; save(); done(); }, 400); } }, 1000);
}
// ---------- missions et cadeau du jour ----------
const MIS = id => MISSIONS.find(m => m.id === id);
function missionsDay() {
  if (SV.miss.day === DAY()) return;
  const ids = MISSIONS.map(m => m.id).sort((a, b) => hrnd(a + DAY()) - hrnd(b + DAY())).slice(0, 3);
  SV.miss = { day: DAY(), list: ids.map(id => ({ id, p: 0, c: 0 })) }; save();
}
function missionsScr() {
  missionsDay();
  show(`<div class="bgimg" style="background-image:url(img/bg/vest.webp);filter:blur(3px) brightness(.5)"></div>${topbar()}<button class="back" data-a="home">◀</button>
  <div class="panel mis"><h2><img src="img/ic/cal.webp">Missions du jour</h2>
   ${SV.miss.list.map((m, i) => { const M_ = MIS(m.id), done = m.p >= M_.n; return `<div class="mrow ${m.c ? 'cl' : done ? 'dn' : ''}"><div class="mt"><b>${M_.t.replace('{n}', M_.n)}</b><i><em style="width:${Math.min(100, m.p / M_.n * 100)}%"></em></i><small>${Math.min(m.p, M_.n)} / ${M_.n}</small></div>
     <div class="mr"><span><img src="img/ic/coins.webp">${M_.dt}</span><span><img src="img/ic/gem.webp">${M_.jt}</span></div>
     ${m.c ? '<div class="mbtn gray small">✔</div>' : done ? `<button class="mbtn green small" data-a="mclaim:${i}">Prendre</button>` : '<div class="mbtn gray small">En cours</div>'}</div>`; }).join('')}
   <div class="mrow adrow"><div class="mt"><b>Regarde une pub</b><small>${adsLeft()} restantes aujourd'hui</small></div><div class="mr"><span><img src="img/ic/gem.webp">3</span><span><img src="img/ic/coins.webp">100</span></div><button class="mbtn blue small" data-a="adgem">📺 Voir</button></div>
   <p class="sm">Nouvelles missions demain. Le cadeau du jour grandit si tu reviens chaque jour.</p></div>`, 'shopv');
}
function dailyGift() {
  if (SV.daily.day === DAY()) return;
  const k = SV.daily.day === DAY() - 1 ? (SV.daily.k % 7) + 1 : 1, dt = k * 100, jt = k === 7 ? 10 : k >= 4 ? 2 : 1;
  SV.daily = { day: DAY(), k }; SV.dt += dt; SV.jt += jt; save();
  popup(`<img class="popimg" src="img/ic/gift.webp"><h3>Cadeau du jour ${k}/7</h3><div class="days">${[1, 2, 3, 4, 5, 6, 7].map(i => `<i class="${i < k ? 'ok' : i === k ? 'now' : ''}">${i}</i>`).join('')}</div>
   <div class="rew"><div class="rw"><img src="img/ic/coins.webp"><b>+${dt} DT</b></div><div class="rw"><img src="img/ic/gem.webp"><b>+${jt}</b></div></div><button class="mbtn green small" data-a="pclose">Merci !</button>`);
  sfx('unlock'); refreshTop();
}
function popup(html) { closePop(); const d = document.createElement('div'); d.className = 'pop'; d.innerHTML = `<div class="pbx">${html}</div>`; d.addEventListener('click', e => { if (e.target === d) closePop(); }); document.body.appendChild(d); bind(d); tickTimers(); }
function closePop() { document.querySelectorAll('.pop').forEach(p => p.remove()); }

// ---------- clubs ----------
function clubsScr(first) {
  show(`<div class="bgimg" style="background-image:url(img/bg/vs.webp);filter:brightness(.45)"></div>${first ? '' : topbar() + '<button class="back" data-a="home">◀</button>'}
  <div class="clubw"><h2>${first ? 'Choisis ton club !' : 'Ton club'}</h2><p class="sm">Chaque match que tu joues rapporte des points à ton club dans le classement des supporters.</p>
  <div class="cgrid">${CLUBS.map(c => `<button class="ccard ${SV.club === c.id ? 'sel' : ''}" data-a="club:${c.id}" style="--c1:${hex(c.c1)};--c2:${hex(c.c2)}">${crest(c.id)}<b>${c.s}</b><small>${c.n}</small></button>`).join('')}</div></div>`, 'clubs');
}
// ---------- classements : division et clubs ----------
function clubTable() {
  const w = WEEK(), f = Math.min(1, ((DAY() + 3) % 7 + (Date.now() % 864e5) / 864e5) / 7 + .05);
  if (SV.cw.week !== w) { SV.cw = { week: w, pts: 0 }; save(); }
  return CLUBS.map(c => ({ c, p: Math.round((300 + hrnd(c.id + w) * 900 + (['est', 'ca', 'ess', 'css'].includes(c.id) ? 300 : 0)) * f) + (c.id === SV.club ? SV.cw.pts : 0) })).sort((a, b) => b.p - a.p);
}
let LTAB = 'div';
function leagueScr() {
  const s = SV.season, D = DIVS[SV.div];
  const divHTML = `<div class="ladder">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<div class="lrow ${i === SV.div ? 'me' : ''} ${i < SV.div ? 'up' : ''}"><img src="img/dv/${i}.webp"><b>${DIV_N[i]}</b>${i === SV.div ? `<span>${headHTML(SV.char, 'pico')}TOI</span>` : ''}</div>`).join('')}</div>
   <div class="sinfo"><h3>Saison en cours</h3><div class="sres">${Array.from({ length: 10 }, (_, i) => `<i class="${s.res[i] || ''}">${s.res[i] === 'w' ? 'V' : s.res[i] === 'd' ? 'N' : s.res[i] === 'l' ? 'D' : i + 1}</i>`).join('')}</div>
    <div class="spts"><b>${s.pts}</b> points</div>
    <p>${SV.div > 1 ? `Montée en ${DIV_N[SV.div - 1]} : <b>${D.up} pts</b>` : `Titre de champion : <b>${D.up} pts</b>`}</p>${D.down && SV.div < 10 ? `<p>Descente sous <b>${D.down} pts</b></p>` : ''}
    <p class="sm">Victoire 3 pts • Nul 1 pt • 10 matchs par saison</p>${SV.titles ? `<p><img class="bic s" src="img/ic/cup.webp"> ${SV.titles} titre(s) de champion</p>` : ''}</div>`;
  const tb = clubTable(), myR = tb.findIndex(r => r.c.id === SV.club) + 1;
  const clubHTML = `<div class="ctab">${isDerbyWeek() ? '<div class="derby">🔥 SEMAINE DU DERBY : tes points pour ton club comptent double !</div>' : ''}
   ${tb.map((r, i) => `<div class="crow ${r.c.id === SV.club ? 'me' : ''}"><em>${i + 1}</em>${crest(r.c.id, 'pcr')}<b>${r.c.n}</b><span>${fmt(r.p)}</span></div>`).join('')}
   <p class="sm">Classement de la semaine. Ta contribution à ${CL(SV.club).s} : <b>${fmt(SV.cw.pts)} pts</b> (${myR}e). Récompense le lundi pour le top 3.</p></div>`;
  show(`<div class="bgimg" style="background-image:url(img/bg/vs.webp);filter:blur(2px) brightness(.45)"></div>${topbar()}<button class="back" data-a="home">◀</button>
  <div class="panel lg"><div class="tabs"><button class="${LTAB === 'div' ? 'on' : ''}" data-a="ltab:div">Ma division</button><button class="${LTAB === 'club' ? 'on' : ''}" data-a="ltab:club">Clubs</button></div>
  <div class="lgb">${LTAB === 'div' ? divHTML : clubHTML}</div></div>`, 'shopv');
}
// ---------- vestiaire (onglets) ----------
const VTABS = [['char', 'Joueurs'], ['boots', 'Chaussures'], ['hat', 'Chapeaux'], ['glasses', 'Lunettes'], ['scarf', 'Écharpes'], ['ball', 'Ballons'], ['pw', 'Pouvoirs']];
let VT = 'char', VS = {};
function listFor(t) { return t === 'char' ? CHARS : t === 'boots' ? BOOTS : t === 'pw' ? POWERS : ACC.filter(a => a.slot === t); }
const owns = (t, id) => t === 'char' ? SV.own.includes(id) : t === 'boots' ? SV.ownB.includes(id) : t === 'pw' ? SV.ownP.includes(id) : SV.ownA.includes(id);
const equipped = (t, id) => t === 'char' ? SV.char === id : t === 'boots' ? SV.boot === id : t === 'pw' ? SV.pw === id : SV.gear[t] === id;
function vest() {
  const L = listFor(VT); let id = VS[VT]; if (!L.some(x => x.id === id)) id = VS[VT] = (VT === 'char' ? SV.char : VT === 'boots' ? SV.boot : VT === 'pw' ? SV.pw : SV.gear[VT]);
  const x = L.find(i => i.id === id) || L[0], own = owns(VT, x.id), eq = equipped(VT, x.id), rc = RCOL[x.r] || '#7a8599';
  let stage, info, extra = '';
  const prevGear = Object.assign({}, SV.gear); if (SLOTS[VT] && VT !== 'ball') prevGear[VT] = x.id;
  if (VT === 'char') {
    const lv = evoLv(x.id), st = k => Math.round((x[k] || 1) * (1 + EVO_B[lv - 1] / 100) * 100);
    stage = `${EVO_IMG.has(x.id) ? `<img class="evop ${own ? '' : 'locked'}" src="img/evo/${x.id}_${lv}.webp">` : ''}${heroHTML(x.id, SV.boot, 'big idle' + (own ? '' : ' locked') + (lv > 1 ? ' evo' + lv : ''), 0, SV.gear)}`;
    info = `<div class="shSub">${x.sub}</div>`;
    extra = `<div class="stats">${[['Vitesse', 'spd'], ['Saut', 'jmp'], ['Tir', 'kp'], ['Tête', 'hd']].map(([n, k]) => `<div class="st"><span>${n}</span><i><b style="width:${Math.min(100, (st(k) - 80) * 1.8)}%"></b></i><em>${st(k)}</em></div>`).join('')}</div>
     <div class="evo">${[1, 2, 3].map(i => `<i class="${i <= lv ? 'on' : ''}">★</i>`).join('')}<b>${EVO_N[lv - 1]}</b>${own && lv < 3 ? `<button class="mbtn orange small" data-a="evo:${x.id}">Évoluer • 💵 ${fmt(EVO_C(x, lv + 1))}</button>` : ''}</div>`;
  } else if (VT === 'pw') {
    stage = `<img class="pwbig" src="img/pw/${x.id}.webp">`; info = `<div class="shSub">${x.d}</div>`;
  } else if (VT === 'ball') {
    stage = `<img class="ballbig" src="img/eq/${x.id}.webp">`; info = `<div class="shSub">${bonTxt(x.b)}</div>`;
  } else {
    stage = heroHTML(SV.char, VT === 'boots' ? x.id : SV.boot, 'big idle', 0, prevGear); info = `<div class="shSub">${bonTxt(x.b)}</div>`;
  }
  const btn = own ? (eq ? '<div class="mbtn gray wide">✔ Équipé</div>' : `<button class="mbtn green wide" data-a="eq:${x.id}">Équiper</button>`) : `<button class="mbtn yellow wide" data-a="buy:${x.id}">Acheter • 💵 ${fmt(x.pr)}</button>`;
  const cardImg = i => VT === 'char' ? headHTML(i.id, 'chead') : VT === 'pw' ? `<img class="cpw" src="img/pw/${i.id}.webp">` : i.kind || VT === 'boots' ? `<img class="cboot" src="img/eq/${i.id}.webp">` : '<span class="none">∅</span>';
  show(`<div class="bgimg" style="background-image:url(img/bg/vest.webp);filter:blur(3px) brightness(.5)"></div>
  <div class="vtabs">${VTABS.map(([k, n]) => `<button class="${VT === k ? 'on' : ''}" data-a="vt:${k}">${n}</button>`).join('')}</div>
  <div class="shop" style="--rc:${rc}">
   <div class="shL"><div class="shName">${x.n}</div>${info}<div class="shStage"><div class="halo"></div>${stage}</div>${extra}${btn}</div>
   <div class="shR"><div class="grid">${L.map(i => `<button class="card ${i.id === x.id ? 'sel' : ''} ${owns(VT, i.id) ? '' : 'lock'}" data-a="vs:${i.id}" style="--rc:${RCOL[i.r] || '#7a8599'}">${cardImg(i)}${equipped(VT, i.id) ? '<span class="chk">✔</span>' : ''}${VT === 'char' && evoLv(i.id) > 1 ? `<span class="ev">${'★'.repeat(evoLv(i.id))}</span>` : ''}<span class="cr">${owns(VT, i.id) ? (RLAB[i.r] || 'Commun') : '💵 ' + fmt(i.pr)}</span></button>`).join('')}</div></div>
  </div><button class="back" data-a="home">◀</button>${topbar()}`, 'shopv vestv');
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1900); }
function pay(pr) { if (SV.dt < pr) { toast('Il te manque ' + fmt(pr - SV.dt) + ' DT'); return false; } SV.dt -= pr; return true; }

function act(a, el) {
  const [k, v] = a.split(':');
  switch (k) {
    case 'start': if (!SV.tuto) return startTuto(); if (!SV.club) return clubsScr(true); return home();
    case 'home': return home();
    case 'snd': SV.snd = SV.snd ? 0 : 1; save(); if (MASTER) MASTER.gain.value = SV.snd ? .8 : 0; el.textContent = SV.snd ? '🔊' : '🔇'; return;
    case 'nick': { const n = prompt('Ton pseudo :', SV.nick); if (n && n.trim()) { SV.nick = n.trim().slice(0, 16); save(); ui.querySelector('.nick b').textContent = SV.nick; } return; }
    case 'vest': return vest();
    case 'vt': VT = v; return vest();
    case 'vs': VS[VT] = v; return vest();
    case 'eq': if (VT === 'char') SV.char = v; else if (VT === 'boots') SV.boot = v; else if (VT === 'pw') SV.pw = v; else SV.gear[VT] = v; save(); sfx('coin'); return vest();
    case 'buy': { const x = listFor(VT).find(i => i.id === v); if (!pay(x.pr)) return; if (VT === 'char') { SV.own.push(v); SV.char = v; save(); sfx('unlock'); return unlockFx(v); } if (VT === 'boots') { SV.ownB.push(v); SV.boot = v; } else if (VT === 'pw') { SV.ownP.push(v); SV.pw = v; } else { SV.ownA.push(v); SV.gear[VT] = v; } save(); sfx('unlock'); toast(x.n + ' : débloqué !'); return vest(); }
    case 'evo': { const c = CH(v), lv = evoLv(v); if (lv >= 3 || !pay(EVO_C(c, lv + 1))) return; SV.evo[v] = lv + 1; save(); sfx('unlock'); return evoFx(v, lv + 1); }
    case 'league': return leagueScr();
    case 'ltab': LTAB = v; return leagueScr();
    case 'clubs': return clubsScr(false);
    case 'club': { const first = !SV.club; if (SV.club !== v) SV.cw.pts = 0; SV.club = v; save(); sfx('unlock'); toast('Tu supportes ' + CL(v).n + ' !'); return first ? home() : clubsScr(false); }
    case 'missions': return missionsScr();
    case 'mclaim': { const m = SV.miss.list[+v], M_ = MIS(m.id); if (m.c) return; m.c = 1; SV.dt += M_.dt; SV.jt += M_.jt; save(); sfx('coin'); toast(`+${M_.dt} DT  +${M_.jt} jetons`); return missionsScr(); }
    case 'ad': return showAd(() => { SV.jt += 3; SV.dt += 100; save(); sfx('coin'); toast('+3 jetons  +100 DT'); refreshTop(); });
    case 'adgem': return showAd(() => { SV.jt += 3; SV.dt += 100; save(); sfx('coin'); missionsScr(); });
    case 'chest': return chestAct(+v);
    case 'cstart': SV.chests[+v].end = Date.now() + CHESTS[SV.chests[+v].r].min * 6e4; save(); closePop(); return home();
    case 'cad': closePop(); return showAd(() => { const x = SV.chests[+v]; if (x && x.end) x.end -= 30 * 6e4; save(); home(); });
    case 'cnow': { const x = SV.chests[+v], cost = x.end ? Math.max(1, Math.ceil((x.end - Date.now()) / 6e5)) : Math.max(1, Math.ceil(CHESTS[x.r].min / 10)); if (SV.jt < cost) { toast('Pas assez de jetons : regarde une pub'); return; } SV.jt -= cost; closePop(); return openChest(+v); }
    case 'pclose': closePop(); return;
    case 'venue': { const ids = ['auto', ...VENUES.map(x => x.id)]; SV.venue = ids[(ids.indexOf(SV.venue) + 1) % ids.length]; save(); return home(); }
    case 'demo': return startTuto();
    case 'play': case 'again': return vsScreen();
    case 'resume': document.querySelector('.pause')?.remove(); resumeMatch(); return;
    case 'quit': document.querySelector('.pause')?.remove(); quitMatch(); return home();
  }
}
function unlockFx(id) {
  const d = document.createElement('div'); d.className = 'unlock'; d.innerHTML = `<div class="urays"></div><div class="ubox">${heroHTML(id, SV.boot, 'big joy', 3, SV.gear)}<div class="ut">NOUVEAU JOUEUR !</div><div class="un">${CH(id).n}</div></div>`;
  document.body.appendChild(d); const go = () => { if (d.isConnected) { d.remove(); vest(); } }; d.addEventListener('click', go); setTimeout(go, 3200);
}
function evoFx(id, lv) {
  const d = document.createElement('div'); d.className = 'unlock evoU'; d.innerHTML = `<div class="urays"></div><div class="ubox">${EVO_IMG.has(id) ? `<img class="evobig" src="img/evo/${id}_${lv}.webp">` : heroHTML(id, SV.boot, 'big joy evo' + lv, 3, SV.gear)}<div class="ut">ÉVOLUTION !</div><div class="un">${CH(id).n} • ${EVO_N[lv - 1]} (+${EVO_B[lv - 1]} %)</div></div>`;
  document.body.appendChild(d); const go = () => { if (d.isConnected) { d.remove(); vest(); } }; d.addEventListener('click', go); setTimeout(go, 3500);
}

// ---------- avant-match (VS) ----------
function oppFor() {
  const dv = SV.div, lvl = clamp(.28 + (10 - dv) * .065 + SV.season.n * .006, .25, .95);
  const pool = CHARS.filter(c => c.id !== SV.char && c.pr <= 3000 + (10 - dv) * 3500);
  const c = pick(pool.length ? pool : CHARS.filter(c => c.id !== SV.char));
  const bp = BOOTS.filter(b => b.pr <= 900 + (10 - dv) * 2000);
  const riv = SV.club ? rivals(SV.club) : [];
  const club = isDerbyWeek() && riv.length && Math.random() < .6 ? pick(riv) : pick(CLUBS.filter(x => x.id !== SV.club)).id;
  const gear = { ball: 'ba_cl' }; for (const s of ['hat', 'glasses', 'scarf']) if (Math.random() < .25 + (10 - dv) * .06) gear[s] = pick(ACC.filter(a => a.slot === s && a.kind && a.pr <= 2500 + (10 - dv) * 2000)).id;
  const evo = 1 + (Math.random() < (10 - dv) * .08 ? 1 : 0) + (dv <= 3 && Math.random() < .3 ? 1 : 0);
  return { ch: c.id, boot: pick(bp).id, name: pick(NICKS) + '_' + (10 + Math.random() * 89 | 0), club, gear, evo, power: pick(POWERS).id, ai: clamp(lvl + rnd(-.06, .06), .25, .95) };
}
async function vsScreen() {
  const o = oppFor(), me = CH(SV.char), op = CH(o.ch), derby = isDerbyWeek() && rivals(SV.club || '').includes(o.club), V = venueNow();
  show(`<div class="bgimg" style="background-image:url(img/bg/vs.webp)"></div><div class="vsW">
   <div class="vsP L">${crest(SV.club, 'vscr')}${myHero('big', 1)}<div class="vsN">${SV.nick}</div><div class="vsC">${me.n} • ${CL(SV.club).s}</div></div>
   <div class="vsP R">${crest(o.club, 'vscr')}${heroHTML(op.id, o.boot, 'big flip', 1, o.gear)}<div class="vsN">${o.name}</div><div class="vsC">${op.n} • ${CL(o.club).s}</div></div>
   <div class="vsTag">${derby ? '🔥 DERBY ! ' : ''}Division ${DIV_N[SV.div]} • Match ${SV.season.n + 1}/10 • ${V.n}</div>
   <div class="vsLoad"><i id="ldb"></i></div></div>`, 'vs');
  sfx('whoosh'); setTimeout(() => sfx('slam'), 450);
  const t0 = Date.now();
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  const wait = Math.max(0, 2400 - (Date.now() - t0));
  setTimeout(() => {
    ui.className = ''; ui.innerHTML = '';
    newMatch({ me: { ch: SV.char, boot: SV.boot, name: SV.nick, club: SV.club, gear: SV.gear, evo: evoLv(SV.char), power: SV.pw }, op: { ...o, name: o.name }, venue: V.id, derby });
  }, wait);
}
async function startTuto() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title.webp)"></div><div class="loadc"><b>Match démo</b><div class="vsLoad"><i id="ldb"></i></div></div>`, 'title');
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  ui.className = ''; ui.innerHTML = '';
  newMatch({ me: { ch: SV.char, boot: SV.boot, name: SV.nick, club: SV.club || 'est', gear: SV.gear, evo: evoLv(SV.char), power: 'harissa' }, op: { ch: 'chebbi', boot: 'b_base', name: 'Gardien', club: 'ca', gear: {}, evo: 1, power: 'harissa', ai: .15 }, venue: 'stade', tuto: 1 });
}
function onTutoEnd() { const first = !SV.tuto; SV.tuto = 1; if (first) SV.dt += 200; save(); resultScreen({ score: [1, 0], tuto: 1, gain: first ? 200 : 0 }); }
function onPause() {
  const d = document.createElement('div'); d.className = 'pause'; d.innerHTML = `<div class="pbox"><h2>PAUSE</h2><button class="mbtn green wide" data-a="resume">Reprendre</button><button class="mbtn red wide" data-a="quit">Quitter le match</button></div>`;
  document.body.appendChild(d); d.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', () => { sfx('tap'); act(el.dataset.a, el); }));
}
function onMatchEnd(r) {
  const [a, b] = r.score, win = a > b, draw = a === b, st = r.stats || {};
  const mult = 1 + (10 - SV.div) * .1, gain = Math.round(((win ? 150 : draw ? 70 : 40) + a * 20) * mult / 10) * 10;
  SV.played++; SV.goals += a; if (win) { SV.wins++; SV.streak++; } else SV.streak = 0; SV.dt += gain;
  // championnat
  const s = SV.season; s.n++; s.pts += win ? 3 : draw ? 1 : 0; s.res.push(win ? 'w' : draw ? 'd' : 'l');
  // points pour le club (doublés pendant la semaine du derby)
  if (SV.cw.week !== WEEK()) SV.cw = { week: WEEK(), pts: 0 };
  const derbyX = isDerbyWeek() ? 2 : 1, cpts = ((win ? 30 : draw ? 10 : 3) + a * 2) * derbyX; SV.cw.pts += cpts;
  // coffre
  let chest = -1; if (win) { const rr = rollChest(); chest = addChest(rr); if (chest >= 0) chest = rr; else chest = -2; }
  // missions
  missionsDay(); const add = { play: 1, win: win ? 1 : 0, goals: a, heads: st.hg || 0, pw: st.pw || 0, clean: win && b === 0 ? 1 : 0, shots: st.shots || 0 };
  for (const m of SV.miss.list) if (!m.c) m.p += add[m.id] || 0;
  // fin de saison
  let end = null;
  if (s.n >= 10) {
    const D = DIVS[SV.div]; end = { pts: s.pts, from: SV.div };
    if (SV.div === 1 && s.pts >= D.up) { SV.titles++; end.kind = 'title'; SV.dt += 5000; SV.jt += 30; addChest(4); }
    else if (SV.div > 1 && s.pts >= D.up) { SV.div--; end.kind = 'up'; SV.dt += 800 * (11 - SV.div) / 2; SV.jt += 5; addChest(Math.min(4, 2 + (SV.div <= 4))); }
    else if (D.down && SV.div < 10 && s.pts < D.down) { SV.div++; end.kind = 'down'; }
    else { end.kind = 'stay'; SV.dt += 300; }
    SV.best = Math.min(SV.best, SV.div); SV.season = { n: 0, pts: 0, res: [] }; end.to = SV.div;
  }
  save();
  resultScreen({ score: r.score, gain, win, draw, cpts, derbyX, chest, end, res: end ? null : s.res.slice() });
}
function resultScreen(r) {
  const win = r.tuto || r.win, [a, b] = r.score;
  const endTxt = r.end ? { title: `🏆 CHAMPION DE TUNISIE ! +5000 DT`, up: `⬆ MONTÉE en Division ${DIV_N[r.end.to]} !`, down: `⬇ Descente en Division ${DIV_N[r.end.to]}`, stay: `Saison terminée : maintien en Division ${DIV_N[r.end.to]}` }[r.end.kind] : '';
  show(`<div class="bgimg kb" style="background-image:url(img/bg/${win ? 'win' : 'lose'}.webp)"></div>${win ? '<div class="conf"></div>' : ''}
  <div class="res ${win ? 'w' : r.draw ? 'd' : 'l'}">
   <div class="rT">${r.tuto ? 'DÉMO RÉUSSIE !' : win ? 'VICTOIRE !' : r.draw ? 'MATCH NUL' : 'DÉFAITE'}</div>
   <div class="rRow">${myHero('big ' + (win ? 'joy' : ''), win ? 3 : 2)}<div class="rS">${a}<span>-</span>${b}</div></div>
   ${r.gain ? `<div class="rG"><img class="bic" src="img/ic/coins.webp">+ <b id="gv">0</b> DT</div>` : ''}
   ${r.tuto ? '' : `<div class="rInfo">${SV.club ? `<span>${crest(SV.club, 'pcr')} +${r.cpts} pts pour ${CL(SV.club).s}${r.derbyX > 1 ? ' (derby ×2)' : ''}</span>` : ''}
     ${r.chest >= 0 ? `<span><img class="bic" src="img/ch/${r.chest}.webp"> ${CHESTS[r.chest].n} gagné !</span>` : r.chest === -2 ? '<span>Coffres pleins : ouvre-les !</span>' : ''}
     ${r.res ? `<span class="sres mini">${Array.from({ length: 10 }, (_, i) => `<i class="${r.res[i] || ''}"></i>`).join('')}</span>` : ''}</div>`}
   ${endTxt ? `<div class="send ${r.end.kind}">${endTxt}</div>` : ''}
   <div class="rB"><button class="mbtn blue" data-a="home">Menu</button>${r.tuto ? `<button class="mbtn green" data-a="${SV.club ? 'play' : 'start'}">${SV.club ? 'Premier match ▶' : 'Choisir mon club ▶'}</button>` : '<button class="mbtn green" data-a="again">Match suivant ▶</button>'}</div>
  </div>`, 'result');
  if (win) sfx('unlock');
  if (r.gain) { const e = document.getElementById('gv'), st = Date.now(); const f = () => { const k = Math.min(1, (Date.now() - st) / 900); if (e) e.textContent = fmt(r.gain * k); if (k < 1) requestAnimationFrame(f); else sfx('coin'); }; setTimeout(f, 500); }
}

// ---------- lancement ----------
load();
title();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
try { if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.ScreenOrientation) Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) { }
