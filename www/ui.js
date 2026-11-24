// =====================================================================
// Kawarjia V2 — menus, sauvegarde, cartes, championnat, classements
// hebdomadaires, Coupe de Tunisie, coffres, boutique, missions, pubs
// =====================================================================
const ui = document.getElementById('ui');
let SV = null;
const DAY = () => Math.floor(Date.now() / 864e5);
const WEEK = () => Math.floor((DAY() + 3) / 7);
const weekFrac = () => Math.min(1, (((DAY() + 3) % 7) + (Date.now() % 864e5) / 864e5) / 7);
const DEF = () => ({
  nick: 'mle3bi_' + (1000 + Math.random() * 9000 | 0), dt: 500, gem: 15, char: 'bey', boot: 'b_base',
  gear: { ball: 'ba_cl' }, pws: ['harissa', 'bard'],
  cd: { bey: { n: 0, p: 0, u: 1 }, b_base: { n: 0, p: 0, u: 1 }, ba_cl: { n: 0, p: 0, u: 1 }, harissa: { n: 10, p: 0, u: 1 }, bard: { n: 6, p: 0, u: 1 } },
  tuto: 0, snd: 1, wins: 0, played: 0, goals: 0, streak: 0, bestStreak: 0, club: null, venue: 'auto',
  div: 10, best: 10, titles: 0, cups: 0, season: { n: 0, pts: 0, res: [] }, chests: [{ r: 1, end: 0 }, null, null, null],
  miss: { day: -1, list: [] }, daily: { day: -1, k: 0 }, ads: { day: -1, n: 0 }, wk: { week: WEEK(), pts: 0, wins: 0, cw: 0 }, cup: null, rew: []
});
function load() {
  try { SV = JSON.parse(localStorage.getItem('kw2') || 'null'); } catch (e) { SV = null; }
  const d = DEF();
  if (!SV) {
    SV = d;
    try { const o = JSON.parse(localStorage.getItem('kw1') || 'null'); if (o) { SV.nick = o.nick || SV.nick; SV.dt = Math.max(SV.dt, o.dt || 0); SV.gem = Math.max(SV.gem, o.jt || 0); SV.club = o.club || null; SV.tuto = o.tuto ? 1 : 0; SV.wins = o.wins || 0; SV.played = o.played || 0; SV.goals = o.goals || 0;
      for (const id of o.own || []) if (CHARS.some(c => c.id === id)) SV.cd[id] = { n: 0, p: 0, u: 1 }; if (SV.cd[o.char]) SV.char = o.char; } } catch (e) { }
  }
  for (const k in d) if (SV[k] === undefined) SV[k] = d[k];
  SV.gear = { ball: AC_(SV.gear && SV.gear.ball) ? SV.gear.ball : 'ba_cl' };
  if (!CHARS.some(c => c.id === SV.char)) SV.char = 'bey'; if (!BOOTS.some(b => b.id === SV.boot)) SV.boot = 'b_base';
  save();
}
function save() { try { localStorage.setItem('kw2', JSON.stringify(SV)); } catch (e) { } }
const fmt = n => Math.round(n).toLocaleString('fr-FR');
const RLAB = { 'commun': 'Commun', 'rare': 'Rare', 'épique': 'Épique', 'légendaire': 'Légendaire', 'légende 78': 'Légende 78' };
const RCARD = { 'commun': 'commun', 'rare': 'rare', 'épique': 'epique', 'légendaire': 'legendaire', 'légende 78': 'legende78' };
const STN = { kp: 'Tir', spd: 'Vitesse', jmp: 'Saut', hd: 'Tête' };
const bonTxt = b => Object.entries(b || {}).map(([k, v]) => `${STN[k]} +${v} %`).join(' • ') || 'Aucun bonus';
const hrnd = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const isDerbyWeek = () => WEEK() % 3 === 0;
const rivals = id => DERBYS.filter(d => d.includes(id)).map(d => d[0] === id ? d[1] : d[0]);
// ---------- cartes ----------
const CD = id => SV.cd[id] || (SV.cd[id] = { n: 0, p: 0, u: 0 });
const prog = id => (SV.cd[id] && SV.cd[id].p) || 0;
const nCards = id => (SV.cd[id] && SV.cd[id].n) || 0;
const unlocked = id => !!(SV.cd[id] && SV.cd[id].u) || id.endsWith('_none');
const needUnlock = it => it.type === 'char' ? CHAR_UNLOCK[it.r] : it.type === 'pw' ? 1 : UNLOCK[it.r];
const itemImg = it => it.type === 'char' ? `img/h/${it.id}_0.webp` : it.type === 'pw' ? it.icon : `img/eq/${it.id}.webp`;
function addCards(id, n) {
  const c = CD(id), it = ITEM(id); c.n += n; let fresh = false;
  if (!c.u) { const need = needUnlock(it); if (it.type === 'pw') { c.u = 1; fresh = true; } else if (c.n >= need) { c.n -= need; c.u = 1; fresh = true; } }
  return fresh;
}
const pwCount = id => nCards(id);
// appelé par le moteur quand je lance un pouvoir : une carte, sinon des diamants
function pwAsk(id) {
  const c = CD(id);
  if (c.n > 0) { c.n--; save(); return true; }
  const g = PW(id).gem; if (SV.gem >= g) { SV.gem -= g; save(); toast(`−${g} diamants : ${PW(id).n}`); return true; }
  toast('Plus de cartes ni de diamants'); return false;
}
// ---------- puissance (comme Head Ball) ----------
const STAT = [['spd', 'Vitesse', 'img/ic2/coins.webp'], ['jmp', 'Saut', ''], ['kp', 'Tir', ''], ['hd', 'Tête', '']];
function statsFor(chId, bootId, gear, pf) {
  pf = pf || prog; const c = CH(chId), e = charMul(pf(chId)), bon = { spd: 0, jmp: 0, kp: 0, hd: 0 };
  const add = it => { if (!it) return; const b = itemB(it.b, pf(it.id)); for (const k in b) bon[k] += b[k]; };
  add(BT(bootId)); add(AC_(gear.ball));
  const rows = ['spd', 'jmp', 'kp', 'hd'].map(k => { const m = (c[k] || 1) * e; return { k, base: Math.round((m - .8) * 50 * 10) / 10, bo: Math.round(m * bon[k] / 100 * 50 * 10) / 10 }; });
  return { rows, pow: Math.round(rows.reduce((a, r) => a + r.base + r.bo, 0) / 4 * 10) / 10 };
}
const myPow = () => statsFor(SV.char, SV.boot, SV.gear).pow;

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


// ---------- personnage HTML (tête + couvre-chef + accessoires + chaussure) ----------
function heroHTML(chId, bootId, cls, expr) {
  return `<div class="hero ${cls || ''}"><div class="hsh"></div><img class="hboot" src="img/eq/${bootId}.webp"><div class="hhead"><img class="hface" src="img/h/${chId}_${expr || 0}.webp"></div></div>`;
}
const myHero = (cls, expr) => heroHTML(SV.char, SV.boot, cls, expr, SV.gear);
function headHTML(chId, cls) { return `<img class="${cls || 'mini'}" src="img/h/${chId}_0.webp">`; }
const crest = (id, cls) => `<img class="${cls || 'crest'}" src="img/cr/${CL(id).cr}.webp">`;
const stars = (p, big) => { const s = Math.floor(p / 5), f = p % 5; let h = ''; for (let i = 0; i < 5; i++) h += `<i class="${i < s ? 'on' : i === s && f ? 'part' : ''}" style="--f:${i === s ? f * 20 : 0}%">★</i>`; return `<span class="stars ${big ? 'big' : ''}">${h}</span>`; };
// carte à collectionner (cadre selon la rareté)
function cardHTML(it, extra, cls) {
  return `<div class="kcard ${cls || ''}" style="--rc:${RCOL[it.r] || '#7a8599'}"><img class="kframe" src="img/cards/${RCARD[it.r] || 'commun'}.webp"><img class="kimg ${it.type}" src="${itemImg(it)}"><div class="kname">${it.n}</div>${extra || ''}</div>`;
}

// ---------- écrans ----------
function show(html, cls) { ui.className = 'on ' + (cls || ''); ui.innerHTML = html; bind(ui); tickTimers(); }
function bind(root) { root.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', e => { e.stopPropagation(); au(); sfx('tap'); act(el.dataset.a, el); })); }
function topbar(back) {
  return `<div class="top2">${back ? '<button class="rbtn back2" data-a="home"><img src="img/ui2/back.webp"></button>' : ''}
  <div class="pill2 nick" data-a="profile">${headHTML(SV.char, 'pico')}<div><b>${SV.nick}</b><small>⚡ ${String(myPow()).replace('.', ',')}</small></div></div>
  ${SV.club ? `<div class="pill2 club" data-a="clubs">${crest(SV.club, 'pcr')}<b>${CL(SV.club).s}</b></div>` : ''}
  <span class="sp"></span>
  <div class="pill2 money"><img src="img/ic2/coins.webp"><b id="dtv">${fmt(SV.dt)}</b></div>
  <div class="pill2 money" data-a="shop"><img src="img/ic2/gem.webp"><b id="gmv">${fmt(SV.gem)}</b><i class="plus">+</i></div>
  <button class="rbtn snd" data-a="snd">${SV.snd ? '🔊' : '🔇'}</button></div>`;
}
function refreshTop() { const a = document.getElementById('dtv'), b = document.getElementById('gmv'); if (a) a.textContent = fmt(SV.dt); if (b) b.textContent = fmt(SV.gem); }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2000); }
function pay(pr) { if (SV.dt < pr) { toast('Il te manque ' + fmt(pr - SV.dt) + ' DT'); return false; } SV.dt -= pr; return true; }
function payGem(pr) { if (SV.gem < pr) { toast('Il te manque ' + fmt(pr - SV.gem) + ' diamants'); return false; } SV.gem -= pr; return true; }
function popup(html, cls) { closePop(); const d = document.createElement('div'); d.className = 'pop ' + (cls || ''); d.innerHTML = `<div class="pbx">${html}</div>`; d.addEventListener('click', e => { if (e.target === d) closePop(); }); document.body.appendChild(d); bind(d); tickTimers(); }
function closePop() { document.querySelectorAll('.pop').forEach(p => p.remove()); }

function title() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title2.webp)"></div><div class="tdark"></div><img class="tlogo" src="img/ui2/logo.webp">
  <div class="ttap" data-a="start"><span>TOUCHE POUR JOUER</span></div><div class="ver">V${APP_VERSION}</div>`, 'title');
}
function venueNow() { return SV.venue === 'auto' ? VENUES[(SV.season.n + SV.div) % VENUES.length] : VENUES.find(v => v.id === SV.venue) || VENUES[0]; }

// ---------- accueil façon Head Ball ----------
function home() {
  weekCheck(); missionsDay();
  const c = CH(SV.char), p = prog(c.id), claim = SV.miss.list.some(m => m.p >= MIS(m.id).n && !m.c), cup = cupState(), D = DIVS[SV.div];
  const adN = adsLeft();
  show(`<div class="bgimg" style="background-image:url(img/bg/home.webp)"></div><div class="vign"></div>
  ${topbar()}
  <div class="side">
    <button class="sbtn2" data-a="shop"><img src="img/ic2/shop.webp"><small>Boutique</small></button>
    <button class="sbtn2" data-a="adchest"><img src="img/ch2/1_0.webp"><small>Pub = coffre</small>${adN > 0 ? `<em class="dot">${adN}</em>` : ''}</button>
    <button class="sbtn2" data-a="missions"><img src="img/ic2/tasks.webp"><small>Missions</small>${claim ? '<em class="dot">!</em>' : ''}</button>
    <button class="sbtn2" data-a="venue"><img src="img/ic2/home.webp"><small>${SV.venue === 'auto' ? 'Stade auto' : venueNow().n.replace('Stade de ', '')}</small></button>
    <button class="sbtn2" data-a="demo"><img src="img/ui/hand.webp"><small>Démo</small></button>
  </div>
  <div class="hstage" data-a="vest"><div class="pedestal"></div>${myHero('big idle' + (p >= 15 ? ' evo3' : p >= 5 ? ' evo2' : ''))}
    <div class="plate"><b>${c.n}</b>${stars(p)}</div></div>
  <div class="events">
    <button class="evc league" data-a="league"><img class="evbg" src="img/bg/rank.webp"><div class="evt"><img src="img/dv/${SV.div}.webp"><div><b>Championnat</b><small>Division ${DIV_N[SV.div]}</small></div></div>
      <div class="evp"><span>${SV.season.pts} pts</span><span class="sres mini">${Array.from({ length: 10 }, (_, i) => `<i class="${SV.season.res[i] || ''}"></i>`).join('')}</span><small>${SV.div > 1 ? 'Monter : ' + D.up + ' pts' : 'Rester : 24 pts'}</small></div></button>
    <button class="evc cup" data-a="cup"><img class="evbg" src="img/bg/cup.webp"><div class="evt"><img src="img/ic2/trophy.webp"><div><b>Coupe de Tunisie</b><small>${cup.txt}</small></div></div>
      <div class="evp"><span class="timer">Fin : <i data-t="${weekEnd()}"></i></span></div></button>
    ${isDerbyWeek() ? '<div class="derby">🔥 SEMAINE DU DERBY : points du club ×2</div>' : ''}
  </div>
  <button class="chestcard" data-a="chests"><img class="cc1" src="img/ch2/${(SV.chests.find(x => x) || { r: 0 }).r}_${readyN() ? 1 : 0}.webp"><div><b>Salle des coffres</b><small>${readyN() ? readyN() + ' coffre(s) à ouvrir !' : runningChest() ? 'Ouverture : <i data-t="' + runningChest().end + '"></i>' : SV.chests.filter(x => x).length + ' / 4 coffres'}</small></div>${readyN() ? `<em class="dot">${readyN()}</em>` : ''}</button>
  <div class="bbar">
    <button class="playbtn2" data-a="play"><span>JOUER</span><small>Championnat • match ${Math.min(10, SV.season.n + 1)}/10</small></button>
    <button class="nbtn t1" data-a="vest:char"><img src="img/ic2/cards.webp"><small>Joueurs</small></button>
    <button class="nbtn t2" data-a="vest:boots"><img src="img/eq/${SV.boot}.webp"><small>Chaussures</small></button>
    <button class="nbtn t3" data-a="vest:pw"><img src="${PW(SV.pws[0]).icon}"><small>Pouvoirs</small></button>
    <button class="nbtn t4" data-a="chests"><img src="img/ch2/2_1.webp"><small>Coffres</small>${readyN() ? `<em class="dot">${readyN()}</em>` : ''}</button>
    <button class="nbtn t5" data-a="league"><img src="img/ic2/podium.webp"><small>Classements</small></button>
    <button class="nbtn t6" data-a="cup"><img src="img/ic2/trophy.webp"><small>Coupe</small></button>
    <button class="nbtn t7" data-a="clubs">${crest(SV.club || 'est', '')}<small>Club</small></button>
  </div>`, 'home2');
  if (SV.rew.length) setTimeout(showRewards, 300);
  else if (SV.daily.day !== DAY() && SV.tuto && SV.club) setTimeout(dailyGift, 400);
}
const weekEnd = () => (WEEK() + 1) * 7 * 864e5 - 3 * 864e5;

// ---------- coffres ----------
function chestSlots() {
  return SV.chests.map((x, i) => {
    if (!x) return `<div class="cslot empty"><span>Gagne un match</span></div>`;
    const ch = CHESTS[x.r], rd = x.end === 0 || (x.end && x.end <= Date.now()), run = x.end && !rd;
    return `<button class="cslot r${x.r} ${rd ? 'ready' : ''}" data-a="chest:${i}"><img src="img/ch2/${x.r}_${rd ? 1 : 0}.webp"><b>${rd ? 'OUVRIR !' : run ? `<i data-t="${x.end}"></i>` : fmtMin(ch.min)}</b><small>${ch.n.replace('Coffre ', '')}</small></button>`;
  }).join('');
}
const readyN = () => SV.chests.filter(x => x && (x.end === 0 || (x.end && x.end <= Date.now()))).length;
const runningChest = () => SV.chests.find(x => x && x.end > Date.now());
function chestRoom() {
  show(`<div class="bgimg" style="background-image:url(img/bg/chests.webp)"></div><div class="vign"></div>${topbar(1)}
  <div class="croom"><h2><img src="img/ch2/4_1.webp">Salle des coffres</h2><p class="sm">Chaque victoire te donne un coffre. Un seul s'ouvre à la fois : démarre-le, puis reviens l'ouvrir.</p>
   <div class="cpeds">${SV.chests.map((x, i) => { if (!x) return `<div class="cped empty"><div class="pd"></div><span>Place libre</span><small>Gagne un match</small></div>`;
     const ch = CHESTS[x.r], rd = x.end === 0 || (x.end && x.end <= Date.now()), run = x.end && !rd;
     return `<button class="cped r${x.r} ${rd ? 'ready' : run ? 'run' : ''}" data-a="chest:${i}"><img src="img/ch2/${x.r}_${rd ? 1 : 0}.webp"><div class="pd"></div><b>${ch.n.replace('Coffre ', '')}</b>
       <span class="cbtn">${rd ? 'OUVRIR !' : run ? '<i data-t="' + x.end + '"></i>' : 'Démarrer • ' + fmtMin(ch.min)}</span></button>`; }).join('')}</div>
   <div class="cfree"><button class="mbtn blue" data-a="adchest">📺 Coffre gratuit avec une pub (${adsLeft()}/10)</button><button class="mbtn yellow" data-a="shop">Boutique</button></div></div>`, 'shopv');
}
const fmtMin = m => m >= 60 ? (m / 60 | 0) + ' h' + (m % 60 ? ' ' + (m % 60) : '') : m + ' min';
function fmtLeft(ms) { const s = Math.max(0, Math.ceil(ms / 1000)), d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, ss = s % 60; return d ? `${d}j ${h}h` : h ? `${h}h ${String(m).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`; }
function tickTimers() { document.querySelectorAll('[data-t]').forEach(e => { const l = +e.dataset.t - Date.now(); e.textContent = l > 0 ? fmtLeft(l) : 'PRÊT'; if (l <= 0 && !e.dataset.done) { e.dataset.done = 1; if (!document.querySelector('.pop,.chopen')) { if (ui.classList.contains('home2')) setTimeout(home, 300); else if (document.querySelector('.croom')) setTimeout(chestRoom, 300); } } }); }
setInterval(tickTimers, 1000);
const chestCost = x => x.end ? Math.max(1, Math.ceil((x.end - Date.now()) / 6e5)) : Math.max(1, Math.ceil(CHESTS[x.r].min / 10));
function chestAct(i) {
  const x = SV.chests[i]; if (!x) return; const ch = CHESTS[x.r];
  if (x.end === 0 || (x.end && x.end <= Date.now())) { SV.chests[i] = null; save(); return openChest(x.r); }
  const running = SV.chests.some(c => c && c.end > Date.now());
  popup(`<img class="popimg" src="img/ch2/${x.r}_0.webp"><h3>${ch.n}</h3><p>${x.end ? 'Ouverture en cours : <b data-t="' + x.end + '"></b>' : 'Temps d\'ouverture : ' + fmtMin(ch.min)}</p>
   <p class="sm">${ch.cards} cartes • ${ch.dt[0]}-${ch.dt[1]} DT • ${ch.gem[0]}-${ch.gem[1]} diamants</p>
   <div class="prow">${!x.end ? (running ? '<div class="mbtn gray small">Un coffre est déjà en cours</div>' : `<button class="mbtn green small" data-a="cstart:${i}">Démarrer</button>`) : `<button class="mbtn blue small" data-a="cad:${i}">📺 Pub : −30 min</button>`}
   <button class="mbtn yellow small" data-a="cnow:${i}">Ouvrir • <img class="bic s" src="img/ic2/gem.webp">${chestCost(x)}</button></div>`);
}
function addChest(r) { const i = SV.chests.findIndex(x => !x); if (i < 0) return -1; SV.chests[i] = { r, end: null }; return i; }
function rollChest() { const f = (10 - SV.div) / 9, w = [55 - 30 * f, 30, 11 + 15 * f, 3 + 8 * f, .8 + 3 * f]; let r = Math.random() * w.reduce((a, b) => a + b), i = 0; while (r > w[i]) { r -= w[i]; i++; } return Math.min(4, i); }
// tirage des cartes : surtout ce que tu utilises, rarement les joueurs et objets rares
function drawCards(total, boost) {
  const all = ALLITEMS().filter(it => !(it.type === 'char' && it.r === 'légende 78' && boost < 3)), used = new Set([SV.char, SV.boot, ...Object.values(SV.gear), ...SV.pws]);
  const w = it => (RARW[it.r] || .1) * (1 + boost * (it.r === 'commun' ? 0 : .6)) * (used.has(it.id) ? 4 : unlocked(it.id) ? 1.5 : 1) * (it.type === 'pw' ? 1.6 : 1) * (it.type === 'char' ? .7 : 1);
  const stacks = Math.min(total, 2 + Math.min(4, boost + (Math.random() < .5 ? 1 : 0))), out = {};
  let left = total;
  for (let s = 0; s < stacks; s++) {
    let tot = 0; for (const it of all) tot += w(it); let r = Math.random() * tot, it = all[0]; for (const x of all) { r -= w(x); if (r <= 0) { it = x; break; } }
    const n = s === stacks - 1 ? left : Math.max(1, Math.round(left * rnd(.2, .45) / (it.r === 'commun' ? 1 : it.r === 'rare' ? 1.5 : 3)));
    out[it.id] = (out[it.id] || 0) + n; left -= n; if (left <= 0) break;
  }
  return Object.entries(out).map(([id, n]) => ({ id, n }));
}
function grantCards(list) { return list.map(c => ({ ...c, fresh: addCards(c.id, c.n) })); }
// ouverture animée : le coffre tremble, s'ouvre, puis les cartes sortent une par une
function openChest(r) {
  const ch = CHESTS[r], dt = Math.round(rnd(ch.dt[0], ch.dt[1]) / 10) * 10, gm = Math.round(rnd(ch.gem[0], ch.gem[1]));
  const cards = grantCards(drawCards(ch.cards, r)); SV.dt += dt; SV.gem += gm; save();
  const items = [{ k: 'dt', n: dt }, ...(gm ? [{ k: 'gem', n: gm }] : []), ...cards];
  const d = document.createElement('div'); d.className = 'chopen'; d.innerHTML = `<div class="chbg"></div><div class="chrays"></div><div class="chglow"></div><div class="chname">${ch.n.toUpperCase()}</div><img class="chbox shake" src="img/ch2/${r}_0.webp"><div class="chcards"></div><div class="chcount"></div><div class="un">Touche pour continuer</div>`;
  document.body.appendChild(d); sfx('chest');
  let i = -1, phase = 0;
  const box = d.querySelector('.chbox'), cc = d.querySelector('.chcards'), cnt = d.querySelector('.chcount');
  setTimeout(() => { box.src = `img/ch2/${r}_1.webp`; box.classList.remove('shake'); box.classList.add('pop'); sfx('unlock'); vib(60); }, 900);
  setTimeout(() => { box.src = `img/ch2/${r}_2.webp`; d.classList.add('opened'); phase = 1; next(); }, 1500);
  function itemCard(x) {
    if (x.k === 'dt') return `<div class="money-card" style="--rc:#f2a900"><img src="img/ic2/coins.webp"><b>+${fmt(x.n)} DT</b></div>`;
    if (x.k === 'gem') return `<div class="money-card" style="--rc:#2c8cf0"><img src="img/ic2/gem.webp"><b>+${x.n}</b></div>`;
    const it = ITEM(x.id), need = it.type === 'pw' ? 0 : !unlocked(x.id) ? needUnlock(it) : STEP_CARDS(prog(x.id));
    const bar = it.type === 'pw' ? `<div class="kn">×${x.n}</div><div class="kbar"><small>${nCards(x.id)} utilisations</small></div>` : `<div class="kn">×${x.n}</div><div class="kbar"><i style="width:${Math.min(100, nCards(x.id) / need * 100)}%"></i><small>${x.fresh ? 'DÉBLOQUÉ !' : nCards(x.id) + ' / ' + need}</small></div>`;
    return cardHTML(it, bar, x.fresh ? 'fresh' : '');
  }
  function next() {
    i++;
    if (i < items.length) {
      const x = items[i], it = x.id ? ITEM(x.id) : null, rare = it && it.r !== 'commun';
      cc.innerHTML = `<div class="fly ${rare ? 'rare' : ''}" style="--rc:${it ? RCOL[it.r] : '#f2a900'}">${rare ? `<img class="cglow" src="img/fx2/${it.r === 'rare' ? 'glow_b' : it.r === 'épique' ? 'glow_v' : 'glow_o'}.webp">` : ''}${itemCard(x)}</div>`;
      cnt.textContent = (items.length - i - 1) ? (items.length - i - 1) + ' restante(s)' : '';
      sfx(rare ? 'unlock' : 'coin'); if (x.fresh) vib(120);
    } else {
      phase = 2; d.classList.add('sum'); cnt.textContent = '';
      cc.innerHTML = `<div class="sumgrid">${items.map(x => `<div class="smini">${itemCard(x)}</div>`).join('')}</div>`;
    }
  }
  d.addEventListener('click', () => { if (phase === 1) next(); else if (phase === 2) { d.remove(); if (ui.classList.contains('shopv') && document.querySelector('.croom')) chestRoom(); else home(); } });
}
// ---------- pubs (placeholder tant que la régie n'est pas branchée) ----------
function adsLeft() { if (SV.ads.day !== DAY()) SV.ads = { day: DAY(), n: 0 }; return 10 - SV.ads.n; }
function showAd(done, forced) {
  if (!forced && adsLeft() <= 0) { toast('Plus de pubs aujourd\'hui, reviens demain'); return; }
  const d = document.createElement('div'); d.className = 'adv'; let s = forced ? 4 : 5;
  d.innerHTML = `<div class="adbox"><small>PUBLICITÉ</small><img src="img/bg/title2.webp"><b>Kawarjia • Joue pour ton club !</b><div class="adc">${s}</div></div>`;
  document.body.appendChild(d);
  const it = setInterval(() => { s--; d.querySelector('.adc').textContent = s > 0 ? s : '✔'; if (s <= 0) { clearInterval(it); setTimeout(() => { d.remove(); if (!forced) SV.ads.n++; save(); done(); }, 400); } }, 1000);
}
// ---------- boutique ----------
function shopScr() {
  const offers = [1, 2, 3, 4].map(r => ({ r, ch: CHESTS[r] }));
  show(`<div class="bgimg" style="background-image:url(img/bg/chests.webp)"></div><div class="vign"></div>${topbar(1)}
  <div class="shop2"><h2><img src="img/ic2/shop.webp">Boutique</h2><div class="offers">
   <button class="offer free" data-a="adchest"><img src="img/ch2/0_0.webp"><b>Coffre Bronze</b><small>Gratuit avec une pub</small><span class="price">📺 ${adsLeft()} / 10</span></button>
   ${offers.map(o => `<button class="offer r${o.r}" data-a="buychest:${o.r}"><img src="img/ch2/${o.r}_0.webp"><b>${o.ch.n}</b><small>${o.ch.cards} cartes</small><span class="price"><img src="img/ic2/gem.webp">${o.ch.gemPrice}</span></button>`).join('')}
   <button class="offer" data-a="adgem"><img src="img/ic2/gem.webp"><b>+3 diamants</b><small>Regarde une pub</small><span class="price">📺 Gratuit</span></button>
   <button class="offer" data-a="buydt"><img src="img/ic2/coins.webp"><b>+1 500 DT</b><small>Échange</small><span class="price"><img src="img/ic2/gem.webp">25</span></button>
  </div></div>`, 'shopv');
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
  show(`<div class="bgimg" style="background-image:url(img/bg/board.webp)"></div><div class="vign"></div>${topbar(1)}
  <div class="panel mis"><h2><img src="img/ic2/tasks.webp">Missions du jour</h2>
   ${SV.miss.list.map((m, i) => { const M_ = MIS(m.id), done = m.p >= M_.n; return `<div class="mrow ${m.c ? 'cl' : done ? 'dn' : ''}"><div class="mt"><b>${M_.t.replace('{n}', M_.n)}</b><i><em style="width:${Math.min(100, m.p / M_.n * 100)}%"></em></i><small>${Math.min(m.p, M_.n)} / ${M_.n}</small></div>
     <div class="mr"><span><img src="img/ic2/coins.webp">${M_.dt}</span><span><img src="img/ic2/gem.webp">${M_.gem}</span></div>
     ${m.c ? '<div class="mbtn gray small">✔</div>' : done ? `<button class="mbtn green small" data-a="mclaim:${i}">Prendre</button>` : '<div class="mbtn gray small">En cours</div>'}</div>`; }).join('')}
   <div class="mrow adrow"><div class="mt"><b>Regarde une pub : un coffre gratuit</b><small>${adsLeft()} pubs restantes aujourd'hui</small></div><div class="mr"><span><img src="img/ch2/0_0.webp">Bronze</span></div><button class="mbtn blue small" data-a="adchest">📺 Voir</button></div>
   <p class="sm">Nouvelles missions demain. Le cadeau du jour grandit si tu reviens chaque jour.</p></div>`, 'shopv');
}
function dailyGift() {
  if (SV.daily.day === DAY()) return;
  const k = SV.daily.day === DAY() - 1 ? (SV.daily.k % 7) + 1 : 1, dt = k * 100, gm = k === 7 ? 15 : k >= 4 ? 3 : 1;
  SV.daily = { day: DAY(), k }; SV.dt += dt; SV.gem += gm; if (k === 7) addChest(2); save();
  popup(`<img class="popimg" src="img/ic2/gift.webp"><h3>Cadeau du jour ${k}/7</h3><div class="days">${[1, 2, 3, 4, 5, 6, 7].map(i => `<i class="${i < k ? 'ok' : i === k ? 'now' : ''}">${i}</i>`).join('')}</div>
   <div class="rew"><div class="rw"><img src="img/ic2/coins.webp"><b>+${dt} DT</b></div><div class="rw"><img src="img/ic2/gem.webp"><b>+${gm}</b></div>${k === 7 ? '<div class="rw"><img src="img/ch2/2_0.webp"><b>Coffre Or</b></div>' : ''}</div><button class="mbtn green small" data-a="pclose">Merci !</button>`);
  sfx('unlock'); refreshTop();
}
// récompenses de fin de semaine (top 3 des classements)
function showRewards() {
  const r = SV.rew.shift(); save(); if (!r) return;
  popup(`<img class="popimg" src="img/ic2/${r.icon}.webp"><h3>${r.t}</h3><p>${r.d}</p><div class="rew">${r.dt ? `<div class="rw"><img src="img/ic2/coins.webp"><b>+${fmt(r.dt)}</b></div>` : ''}${r.gem ? `<div class="rw"><img src="img/ic2/gem.webp"><b>+${r.gem}</b></div>` : ''}${r.chest != null ? `<div class="rw"><img src="img/ch2/${r.chest}_0.webp"><b>${CHESTS[r.chest].n}</b></div>` : ''}</div><button class="mbtn green small" data-a="pclose">Super !</button>`);
  sfx('unlock');
}

// ---------- clubs ----------
function clubsScr(first) {
  show(`<div class="bgimg" style="background-image:url(img/bg/clubs.webp)"></div><div class="vign"></div>${first ? '' : topbar(1)}
  <div class="clubw"><h2>${first ? 'Choisis ton club !' : 'Ton club'}</h2><p class="sm">Tu joues pour ce club : chacune de tes victoires compte dans le classement des clubs de la semaine.</p>
  <div class="cgrid">${CLUBS.map(c => `<button class="ccard2 ${SV.club === c.id ? 'sel' : ''}" data-a="club:${c.id}" style="--c1:${hex(c.c1)};--c2:${hex(c.c2)}">${crest(c.id)}<div class="cn"><b>${c.s}</b><small>${c.n}</small></div></button>`).join('')}</div></div>`, 'clubs');
}
// ---------- classements de la semaine (simulés hors ligne) ----------
const simPts = (seed, f) => Math.round(Math.pow(hrnd(seed), 1.3) * 42 * f);
function indivTable(week, f) {
  week = week == null ? WEEK() : week; f = f == null ? weekFrac() : f;
  const rows = NICKS.map((n, i) => ({ n, club: CLUBS[Math.floor(hrnd(n + week) * CLUBS.length)].id, ch: CHARS[Math.floor(hrnd(n + 'c') * 10)].id, p: simPts(n + week + SV.div, f) }));
  rows.push({ n: SV.nick, club: SV.club || 'est', ch: SV.char, p: SV.wk.pts, me: 1 });
  return rows.sort((a, b) => b.p - a.p || (b.me ? 1 : -1));
}
function clubTable(week, f) {
  week = week == null ? WEEK() : week; f = f == null ? weekFrac() : f;
  return CLUBS.map(c => ({ c, p: Math.round((200 + hrnd(c.id + week) * 700 + (['est', 'ca', 'ess', 'css'].includes(c.id) ? 250 : 0)) * f) + (c.id === SV.club ? SV.wk.cw : 0) })).sort((a, b) => b.p - a.p);
}
// nouvelle semaine : récompenses du top 3 puis remise à zéro
function weekCheck() {
  if (SV.wk.week === WEEK()) return;
  const w = SV.wk.week;
  if (SV.wk.pts > 0) { const r = indivTable(w, 1).findIndex(x => x.me) + 1; if (r <= 3) SV.rew.push({ t: `${r === 1 ? '1er' : r + 'e'} du classement joueurs !`, d: 'Classement de la semaine dernière', icon: 'podium', gem: [50, 30, 20][r - 1], dt: [3000, 2000, 1000][r - 1], chest: [4, 3, 2][r - 1] }); }
  if (SV.wk.cw > 0 && SV.club) { const r = clubTable(w, 1).findIndex(x => x.c.id === SV.club) + 1; if (r <= 3) SV.rew.push({ t: `${CL(SV.club).n} ${r === 1 ? '1er' : r + 'e'} !`, d: 'Ton club est sur le podium des supporters', icon: 'trophy', gem: [30, 20, 10][r - 1], chest: 2 }); }
  for (const r of SV.rew) { SV.dt += r.dt || 0; SV.gem += r.gem || 0; if (r.chest != null) addChest(r.chest); }
  SV.wk = { week: WEEK(), pts: 0, wins: 0, cw: 0 }; save();
}
let LTAB = 'div';
function leagueScr() {
  weekCheck(); const s = SV.season, D = DIVS[SV.div];
  const divHTML = `<div class="ladder">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `<div class="lrow ${i === SV.div ? 'me' : ''} ${i < SV.div ? 'up' : ''}"><img src="img/dv/${i}.webp"><b>${DIV_N[i]}</b>${i === SV.div ? `<span>${headHTML(SV.char, 'pico')}TOI</span>` : ''}</div>`).join('')}</div>
   <div class="sinfo"><h3>Saison en cours</h3><div class="sres">${Array.from({ length: 10 }, (_, i) => `<i class="${s.res[i] || ''}">${s.res[i] === 'w' ? 'V' : s.res[i] === 'd' ? 'N' : s.res[i] === 'l' ? 'D' : i + 1}</i>`).join('')}</div>
    <div class="spts"><b>${s.pts}</b> points</div>
    <p>${SV.div > 1 ? `Montée en ${DIV_N[SV.div - 1]} : <b>${D.up} points</b> sur 10 matchs` : `Rester en Élite : <b>24 points</b> • Titre : <b>${D.up} points</b>`}</p>${D.down && SV.div < 10 && SV.div > 1 ? `<p>Descente sous <b>${D.down} points</b></p>` : ''}
    <p class="sm">Victoire 3 pts • Nul 1 pt • Adversaires de puissance proche</p>${SV.titles ? `<p><img class="bic s" src="img/ic2/trophy.webp"> ${SV.titles} titre(s) de champion</p>` : ''}</div>`;
  const it = indivTable(), myR = it.findIndex(x => x.me) + 1;
  const indHTML = `<div class="ctab">${it.slice(0, 10).map((r, i) => rankRow(i, headHTML(r.ch, 'pico') + crest(r.club, 'pcr'), r.n, r.p + ' pts', r.me)).join('')}${myR > 10 ? '<div class="dots">…</div>' + rankRow(myR - 1, headHTML(SV.char, 'pico'), SV.nick, SV.wk.pts + ' pts', 1) : ''}
   <p class="sm">Division ${DIV_N[SV.div]} • Victoire 3 pts, nul 1 pt. Le top 3 reçoit un coffre et des diamants à la fin de la semaine (fin dans <b data-t="${weekEnd()}"></b>).</p></div>`;
  const tb = clubTable(), cr = tb.findIndex(r => r.c.id === SV.club) + 1;
  const clubHTML = `<div class="ctab">${isDerbyWeek() ? '<div class="derby">🔥 SEMAINE DU DERBY : tes victoires comptent double pour ton club !</div>' : ''}
   ${tb.map((r, i) => rankRow(i, crest(r.c.id, 'pcr'), r.c.n, fmt(r.p) + ' victoires', r.c.id === SV.club)).join('')}
   <p class="sm">Total des victoires de tous les supporters de chaque club cette semaine. Ta part pour ${CL(SV.club || 'est').s} : <b>${SV.wk.cw}</b> (${cr}e). Le top 3 reçoit des cadeaux.</p></div>`;
  show(`<div class="bgimg" style="background-image:url(img/bg/rank.webp)"></div><div class="vign"></div>${topbar(1)}
  <div class="panel lg"><div class="tabs"><button class="${LTAB === 'div' ? 'on' : ''}" data-a="ltab:div">Championnat</button><button class="${LTAB === 'ind' ? 'on' : ''}" data-a="ltab:ind">Joueurs (semaine)</button><button class="${LTAB === 'club' ? 'on' : ''}" data-a="ltab:club">Clubs (semaine)</button></div>
  <div class="lgb">${LTAB === 'div' ? divHTML : LTAB === 'ind' ? indHTML : clubHTML}</div></div>`, 'shopv');
}
function rankRow(i, ico, name, val, me) { const md = ['🥇', '🥈', '🥉'][i] || (i + 1); return `<div class="crow ${me ? 'me' : ''} ${i < 3 ? 'podr' : ''}"><em>${md}</em>${ico}<b>${name}</b><span>${val}</span></div>`; }

// ---------- Coupe de Tunisie (chaque semaine, élimination directe, but en or) ----------
const ROUNDS = ['8e de finale', 'Quart de finale', 'Demi-finale', 'Finale'];
function cupState() {
  if (!SV.cup || SV.cup.week !== WEEK()) { SV.cup = { week: WEEK(), round: 0, out: false, won: false, opps: [0, 1, 2, 3].map(i => oppFor(i * .06 + .02)), retry: 0 }; save(); }
  const c = SV.cup; c.txt = c.won ? 'Vainqueur ! 🏆' : c.out ? 'Éliminé au ' + ROUNDS[c.round].toLowerCase() : ROUNDS[c.round]; return c;
}
function cupScr() {
  const c = cupState();
  const col = (r) => { const o = c.opps[r], played = r < c.round || (r === c.round && (c.out || c.won)), lost = c.out && r === c.round, won = r < c.round || (c.won && r === 3);
    return `<div class="cround ${r === c.round && !c.out && !c.won ? 'cur' : ''} ${played ? (lost ? 'lost' : 'won') : ''}"><h4>${ROUNDS[r]}</h4>
      <div class="cm"><div class="cp me">${headHTML(SV.char, 'pico')}<b>${SV.nick}</b></div><span>${won ? '✔' : lost ? '✘' : 'VS'}</span><div class="cp">${headHTML(o.ch, 'pico')}<b>${o.name}</b><small>⚡ ${String(o.pow).replace('.', ',')}</small></div></div>
      <small class="crew">Gain : ${fmt(250 * (r + 1))} DT${r === 3 ? ' + Coffre Légendaire' : ''}</small></div>`; };
  show(`<div class="bgimg" style="background-image:url(img/bg/cup.webp)"></div><div class="vign"></div>${topbar(1)}
  <div class="cupw"><h2><img src="img/ic2/trophy.webp">Coupe de Tunisie</h2><p class="sm">Élimination directe. En cas d'égalité : but en or. Nouvelle coupe dans <b data-t="${weekEnd()}"></b>.</p>
   <div class="bracket">${[0, 1, 2, 3].map(col).join('<div class="arrow">▶</div>')}<div class="arrow">▶</div><div class="ctrophy"><img src="img/ic2/trophy.webp"><small>${SV.cups} coupe(s)</small></div></div>
   <div class="cupact">${c.won ? '<div class="mbtn gray">Bravo, reviens la semaine prochaine !</div>' : c.out ? `<button class="mbtn blue" data-a="cupretry:ad">📺 Rejouer (pub)</button><button class="mbtn yellow" data-a="cupretry:gem">Rejouer • <img class="bic s" src="img/ic2/gem.webp">20</button>` : `<button class="mbtn green wide" data-a="cupplay">Jouer le ${ROUNDS[c.round].toLowerCase()} ▶</button>`}</div></div>`, 'shopv');
}

// ---------- vestiaire : cartes, étoiles, amélioration ----------
const VTABS = [['char', 'Joueurs'], ['boots', 'Chaussures'], ['ball', 'Ballons'], ['pw', 'Pouvoirs']];
let VT = 'char', VS = {};
function listFor(t) { return (t === 'char' ? CHARS.map(c => ({ ...c, type: 'char' })) : t === 'boots' ? BOOTS.map(b => ({ ...b, type: 'boots' })) : t === 'pw' ? POWERS.map(p => ({ ...p, type: 'pw' })) : ACC.filter(a => a.slot === t && a.kind).map(a => ({ ...a, type: t }))); }
const equipped = (t, id) => t === 'char' ? SV.char === id : t === 'boots' ? SV.boot === id : t === 'pw' ? SV.pws.includes(id) : SV.gear[t] === id;
const TICO = { char: () => `img/h/${SV.char}_0.webp`, boots: () => `img/eq/${SV.boot}.webp`, ball: () => `img/eq/${SV.gear.ball || 'ba_cl'}.webp`, pw: () => PW(SV.pws[0]).icon };
function vest() {
  const L = listFor(VT); let id = VS[VT]; if (!L.some(x => x.id === id)) id = VS[VT] = (VT === 'char' ? SV.char : VT === 'boots' ? SV.boot : VT === 'pw' ? SV.pws[0] : SV.gear[VT]);
  const x = L.find(i => i.id === id) || L[0], none = x.id.endsWith('_none'), own = unlocked(x.id), eq = equipped(VT, x.id), rc = RCOL[x.r] || '#7a8599';
  const pg = Object.assign({}, SV.gear); let pc = SV.char, pb = SV.boot;
  if (VT === 'char') pc = x.id; else if (VT === 'boots') pb = x.id; else if (SLOTS[VT]) pg[VT] = x.id;
  const st = statsFor(pc, pb, pg), cur = statsFor(SV.char, SV.boot, SV.gear);
  const p = prog(x.id), n = nCards(x.id), isPw = VT === 'pw';
  const need = none ? 0 : !own ? needUnlock(x) : p < PMAX ? STEP_CARDS(p) : 0;
  let sub = isPw ? x.d + (p ? ` Effet +${Math.round((PWF(p) - 1) * 100)} %.` : '') : VT === 'char' ? x.sub : none ? 'Aucun accessoire' : bonTxt(itemB(x.b, p));
  // carte de gauche
  const bar = none ? '' : isPw ? `<div class="kbar big"><small>${n} utilisation(s) • ${x.gem} 💎 l'unité en match</small></div>`
    : `<div class="kbar big"><i style="width:${need ? Math.min(100, n / need * 100) : 100}%"></i><small>${!own ? n + ' / ' + need + ' pour débloquer' : p >= PMAX ? 'Niveau max' : n + ' / ' + need}</small></div>`;
  const card = none ? `<div class="kcard" style="--rc:#7a8599"><img class="kframe" src="img/cards/commun.webp"><span class="knone">∅</span><div class="kname">${x.n}</div></div>` : cardHTML(x, '', own ? '' : 'locked');
  let action = '';
  if (none) action = eq ? '<div class="mbtn gray wide">✔ Équipé</div>' : `<button class="mbtn green wide" data-a="eq:${x.id}">Équiper</button>`;
  else if (!own) {
    const buyable = x.pr > 0 && x.r !== 'légende 78' && !isPw;
    action = buyable ? `<button class="mbtn yellow wide" data-a="buy:${x.id}">Acheter • ${fmt(x.pr)} DT</button>` : '';
    action += `<button class="mbtn blue wide small" data-a="shop">Cartes dans les coffres</button>`;
  } else {
    if (isPw) action = `<div class="prow2"><button class="mbtn ${SV.pws[0] === x.id ? 'gray' : 'green'} small" data-a="pwslot:0:${x.id}">${SV.pws[0] === x.id ? '✔ ' : ''}Bouton 1</button><button class="mbtn ${SV.pws[1] === x.id ? 'gray' : 'green'} small" data-a="pwslot:1:${x.id}">${SV.pws[1] === x.id ? '✔ ' : ''}Bouton 2</button></div>
      <button class="mbtn blue wide small" data-a="buypw:${x.id}">+5 utilisations • <img class="bic s" src="img/ic2/gem.webp">${x.gem * 4}</button>`;
    else action = eq ? '<div class="mbtn gray wide">✔ Équipé</div>' : `<button class="mbtn green wide" data-a="eq:${x.id}">Équiper</button>`;
    if (p < PMAX) action += n >= need ? `<button class="mbtn orange wide" data-a="up:${x.id}">Améliorer • ${fmt(STEP_DT(p))} DT</button>` : `<div class="mbtn gray wide small">Il manque ${need - n} carte(s)</div>`;
  }
  const bars = st.rows.map((r, i) => { const t = Math.round((r.base + r.bo) * 10) / 10, d = Math.round((t - (cur.rows[i].base + cur.rows[i].bo)) * 10) / 10; return `<div class="vrow"><em class="st${i}"></em><div class="vsb"><small>${STAT[i][1]}</small><i><b style="width:${Math.min(100, r.base * 3)}%"></b><u style="width:${Math.min(100 - Math.min(100, r.base * 3), r.bo * 3)}%"></u></i></div><strong>${String(t).replace('.', ',')}</strong>${d ? `<span class="${d > 0 ? 'p' : 'n'}">${d > 0 ? '+' : ''}${String(d).replace('.', ',')}</span>` : '<span></span>'}</div>`; }).join('');
  const strip = L.map(i => { const o = unlocked(i.id), pp = prog(i.id), nn = nCards(i.id), nd = i.id.endsWith('_none') ? 0 : !o ? needUnlock(i) : STEP_CARDS(pp);
    const img = i.id.endsWith('_none') ? '<span class="none">∅</span>' : `<img class="${i.type === 'char' ? 'sh' : i.type === 'pw' ? 'sp' : 'si'}" src="${itemImg(i)}">`;
    const top = i.type === 'pw' ? `<span class="spr">×${nn}</span>` : !i.id.endsWith('_none') ? `<span class="spr ${o && nn >= nd ? 'up' : ''}">${o && nn >= nd ? '⬆ ' : ''}${nn}/${nd}</span>` : '';
    return `<button class="scard ${i.id === x.id ? 'sel' : ''} ${o ? '' : 'lock'}" data-a="vs:${i.id}" style="--rc:${RCOL[i.r] || '#7a8599'}">${img}${top}${equipped(VT, i.id) ? '<span class="chk">✔</span>' : ''}${o && pp ? `<span class="slv">${'★'.repeat(Math.floor(pp / 5))}${pp % 5 ? '☆' : ''}</span>` : ''}<span class="sr">${RLAB[i.r] || 'Commun'}</span></button>`; }).join('');
  show(`<div class="bgimg" style="background-image:url(img/bg/vest2.webp)"></div><div class="vdark" style="--rc:${rc}"></div>
  <button class="rbtn back2 vb" data-a="home"><img src="img/ui2/back.webp"></button>
  <div class="vtitle"><h1>${x.n}</h1><p>${sub}</p></div>
  <div class="vcard2">${card}${bar}${!none && !isPw && own ? `<div class="vlv">${stars(p, 1)}</div>` : ''}${action}</div>
  <div class="vhero"><div class="halo" style="--rc:${rc}"></div>${isPw ? `<img class="pwbig" src="${x.icon}">` : VT === 'ball' && !none ? `<img class="ballbig" src="img/eq/${x.id}.webp">` : heroHTML(pc, pb, 'big idle' + (VT === 'char' && !own ? ' locked' : ''), 0, pg)}</div>
  <div class="vstat"><h3><img src="img/fx2/sparkle.webp">Puissance : <b>${String(st.pow).replace('.', ',')}</b></h3>${bars}</div>
  <div class="vtabs2">${VTABS.map(([k, nm]) => `<button class="${VT === k ? 'on' : ''}" data-a="vt:${k}"><img src="${TICO[k]()}"><small>${nm}</small></button>`).join('')}</div>
  <div class="vstrip">${strip}</div>
  <div class="top2 vtop"><span class="sp"></span><div class="pill2 money"><img src="img/ic2/coins.webp"><b id="dtv">${fmt(SV.dt)}</b></div><div class="pill2 money" data-a="shop"><img src="img/ic2/gem.webp"><b id="gmv">${fmt(SV.gem)}</b><i class="plus">+</i></div></div>`, 'vest3');
  const sel = ui.querySelector('.scard.sel'); if (sel) sel.scrollIntoView({ inline: 'center', block: 'nearest' });
}
function upgrade(id) {
  const it = ITEM(id), c = CD(id), p = c.p, need = STEP_CARDS(p);
  if (p >= PMAX) return; if (c.n < need) { toast('Il manque ' + (need - c.n) + ' carte(s)'); return; }
  if (!pay(STEP_DT(p))) return;
  c.n -= need; c.p++; save(); sfx('unlock'); vib(60);
  const star = c.p % 5 === 0;
  const d = document.createElement('div'); d.className = 'unlock'; d.innerHTML = `<div class="urays"></div><div class="ubox">${cardHTML(it, '', 'big')}<div class="ut">${star ? 'NOUVELLE ÉTOILE !' : 'AMÉLIORÉ !'}</div>${stars(c.p, 1)}<div class="un">${it.type === 'char' ? 'Toutes les stats augmentent' : it.type === 'pw' ? 'Effet plus long' : 'Bonus plus fort'}</div></div>`;
  document.body.appendChild(d); const go = () => { if (d.isConnected) { d.remove(); vest(); } }; d.addEventListener('click', go); setTimeout(go, 2600);
}
// ---------- profil ----------
function profile() {
  const st = statsFor(SV.char, SV.boot, SV.gear), rate = SV.played ? Math.round(SV.wins / SV.played * 100) : 0;
  popup(`<div class="prof"><div class="pfL">${myHero('big idle')}<div class="pfpow"><img src="img/fx2/sparkle.webp">${String(st.pow).replace('.', ',')}</div></div>
   <div class="pfR"><div class="pfn">${crest(SV.club || 'est', 'pcr')}<b>${SV.nick}</b><button class="mbtn blue small" data-a="nick">✎</button></div>
   <div class="pfg">${[['Taux de victoires', rate + ' %'], ['Victoires', fmt(SV.wins)], ['Matchs', fmt(SV.played)], ['Buts', fmt(SV.goals)], ['Meilleure série', SV.bestStreak], ['Meilleure division', DIV_N[SV.best]], ['Titres', SV.titles], ['Coupes', SV.cups]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
   <div class="pfp"><span>Pouvoirs :</span>${SV.pws.map(id => `<img src="${PW(id).icon}"><b>${PW(id).n} ×${nCards(id)}</b>`).join('')}</div></div></div>`, 'wide');
}

// ---------- actions ----------
function act(a, el) {
  const [k, v, w] = a.split(':');
  switch (k) {
    case 'start': if (!SV.tuto) return startTuto(); if (!SV.club) return clubsScr(true); return home();
    case 'home': closePop(); return home();
    case 'snd': SV.snd = SV.snd ? 0 : 1; save(); if (MASTER) MASTER.gain.value = SV.snd ? .8 : 0; el.textContent = SV.snd ? '🔊' : '🔇'; return;
    case 'profile': return profile();
    case 'nick': { const n = prompt('Ton pseudo :', SV.nick); if (n && n.trim()) { SV.nick = n.trim().slice(0, 16); save(); closePop(); profile(); } return; }
    case 'vest': if (v) VT = v; return vest();
    case 'vt': VT = v; return vest();
    case 'vs': VS[VT] = v; return vest();
    case 'eq': if (VT === 'char') SV.char = v; else if (VT === 'boots') SV.boot = v; else SV.gear[VT] = v; save(); sfx('coin'); return vest();
    case 'pwslot': { const s = +v; if (SV.pws[1 - s] === w) SV.pws[1 - s] = SV.pws[s]; SV.pws[s] = w; save(); sfx('coin'); return vest(); }
    case 'buypw': { const pw = PW(v); if (!payGem(pw.gem * 4)) return; CD(v).n += 5; save(); sfx('coin'); toast('+5 utilisations : ' + pw.n); return vest(); }
    case 'buy': { const x = ITEM(v); if (!pay(x.pr)) return; const c = CD(v); c.u = 1; save(); sfx('unlock'); toast(x.n + ' : débloqué !'); if (VT === 'char') SV.char = v; else if (VT === 'boots') SV.boot = v; else if (SLOTS[VT]) SV.gear[VT] = v; save(); return vest(); }
    case 'up': return upgrade(v);
    case 'league': return leagueScr();
    case 'ltab': LTAB = v; return leagueScr();
    case 'cup': return cupScr();
    case 'cupplay': return searchScreen('cup');
    case 'cupretry': { const go = () => { SV.cup = { week: WEEK(), round: 0, out: false, won: false, opps: [0, 1, 2, 3].map(i => oppFor(i * .06 + .02)), retry: (SV.cup.retry || 0) + 1 }; save(); cupScr(); }; if (v === 'ad') return showAd(go); if (!payGem(20)) return; return go(); }
    case 'clubs': return clubsScr(false);
    case 'club': { const first = !SV.club; if (SV.club !== v) SV.wk.cw = 0; SV.club = v; save(); sfx('unlock'); toast('Tu joues pour ' + CL(v).n + ' !'); return first ? home() : clubsScr(false); }
    case 'missions': return missionsScr();
    case 'mclaim': { const m = SV.miss.list[+v], M_ = MIS(m.id); if (m.c) return; m.c = 1; SV.dt += M_.dt; SV.gem += M_.gem; save(); sfx('coin'); toast(`+${M_.dt} DT  +${M_.gem} diamants`); return missionsScr(); }
    case 'shop': closePop(); return shopScr();
    case 'adchest': return showAd(() => openChest(0));
    case 'adgem': return showAd(() => { SV.gem += 3; save(); sfx('coin'); toast('+3 diamants'); refreshTop(); });
    case 'buychest': { const r = +v; if (!payGem(CHESTS[r].gemPrice)) return; save(); return openChest(r); }
    case 'buydt': if (!payGem(25)) return; SV.dt += 1500; save(); sfx('coin'); refreshTop(); toast('+1 500 DT'); return;
    case 'chest': return chestAct(+v);
    case 'chests': return chestRoom();
    case 'cstart': SV.chests[+v].end = Date.now() + CHESTS[SV.chests[+v].r].min * 6e4; save(); closePop(); return chestRoom();
    case 'cad': closePop(); return showAd(() => { const x = SV.chests[+v]; if (x && x.end) x.end -= 30 * 6e4; save(); chestRoom(); });
    case 'cnow': { const x = SV.chests[+v]; if (!payGem(chestCost(x))) return; SV.chests[+v] = null; save(); closePop(); return openChest(x.r); }
    case 'pclose': closePop(); if (SV.rew.length) setTimeout(showRewards, 200); return;
    case 'venue': { const ids = ['auto', ...VENUES.map(x => x.id)]; SV.venue = ids[(ids.indexOf(SV.venue) + 1) % ids.length]; save(); toast('Stade : ' + (SV.venue === 'auto' ? 'automatique' : venueNow().n)); return home(); }
    case 'demo': return startTuto();
    case 'play': case 'again': return searchScreen('league');
    case 'rematch': return rematch(el);
    case 'resume': document.querySelector('.pause')?.remove(); resumeMatch(); return;
    case 'quit': { document.querySelector('.pause')?.remove(); const tu = M && M.tuto, sc = M ? [M.score[0], Math.max(M.score[0] + 1, M.score[1])] : [0, 1]; quitMatch(); if (tu) return home(); onMatchEnd({ score: sc, stats: {}, quit: 1 }); return; }
  }
}

// ---------- adversaire de puissance proche ----------
const progMap = () => { const o = {}; for (const id in SV.cd) o[id] = SV.cd[id].p || 0; return o; };
function oppFor(boost) {
  boost = boost || 0; const dv = SV.div, target = myPow() * (1 + boost) * rnd(.95, 1.05);
  const okR = dv >= 8 ? ['commun', 'rare'] : dv >= 5 ? ['commun', 'rare', 'épique'] : dv >= 2 ? ['commun', 'rare', 'épique', 'légendaire'] : Object.keys(RCOL);
  const c = pick(CHARS.filter(x => x.id !== SV.char && okR.includes(x.r)));
  const boot = pick(BOOTS.filter(b => okR.includes(b.r))).id;
  const gear = { ball: 'ba_cl' };
  let bp = 0, bd = 1e9;
  for (let p = 0; p <= PMAX; p++) { const d = Math.abs(statsFor(c.id, boot, gear, () => p).pow - target); if (d < bd) { bd = d; bp = p; } }
  const prog = { [c.id]: bp, [boot]: bp }; for (const s in gear) prog[gear[s]] = bp;
  const pws = [pick(POWERS).id]; pws.push(pick(POWERS.filter(p => p.id !== pws[0])).id); pws.forEach(id => prog[id] = Math.floor(bp / 2));
  const riv = SV.club ? rivals(SV.club) : [], club = isDerbyWeek() && riv.length && Math.random() < .6 ? pick(riv) : pick(CLUBS.filter(x => x.id !== SV.club)).id;
  return { ch: c.id, boot, gear, prog, powers: pws, club, name: pick(NICKS) + '_' + (10 + Math.random() * 89 | 0), ai: clamp(.3 + (10 - dv) * .055 + rnd(-.05, .05) + boost * 2, .25, .95), pow: statsFor(c.id, boot, gear, () => bp).pow };
}
let MODE = 'league', LASTOPP = null;
// écran dynamique : recherche d'un adversaire
function searchScreen(mode, opp) {
  MODE = mode || 'league'; const o = opp || (MODE === 'cup' ? cupState().opps[SV.cup.round] : oppFor(0));
  const faces = CHARS.map(c => c.id), t0 = Date.now(), dur = opp ? 1600 : rnd(2200, 4200);
  show(`<div class="bgimg" style="background-image:url(img/bg/vs2.webp)"></div><div class="srdark"></div>
   <div class="srch"><div class="radar"><i></i><i></i><i></i><div class="sweep"></div></div>
    <div class="srL">${myHero('big idle', 0)}<div class="vsN">${SV.nick}</div><div class="vsC">⚡ ${String(myPow()).replace('.', ',')}</div></div>
    <div class="srR"><div class="srface"><img id="sface" src="img/h/${pick(faces)}_0.webp"></div><div class="vsN" id="sname">???</div><div class="vsC" id="spow">⚡ ~ ${String(myPow()).replace('.', ',')}</div></div>
    <div class="srtxt"><b id="stt">${MODE === 'cup' ? 'Coupe de Tunisie : tirage de l\'adversaire' : 'Recherche d\'un adversaire'}<span class="dots3"><i>.</i><i>.</i><i>.</i></span></b><small>${MODE === 'cup' ? ROUNDS[SV.cup.round] : 'Division ' + DIV_N[SV.div] + ' • puissance proche'} • <i id="stime">0 s</i></small></div>
    <button class="mbtn red small srcancel" data-a="home">Annuler</button></div>`, 'search');
  let k = 0;
  const it = setInterval(() => {
    if (!document.getElementById('sface')) { clearInterval(it); return; }
    const el = Date.now() - t0; document.getElementById('stime').textContent = Math.floor(el / 1000) + ' s';
    if (el < dur) { if (k++ % 2 === 0) { document.getElementById('sface').src = `img/h/${faces[(Math.random() * faces.length) | 0]}_0.webp`; sfx('tick'); } return; }
    clearInterval(it); sfx('slam'); vib(80);
    document.getElementById('sface').src = `img/h/${o.ch}_1.webp`; document.querySelector('.srR').classList.add('found');
    document.getElementById('sname').textContent = o.name; document.getElementById('spow').textContent = '⚡ ' + String(o.pow).replace('.', ',') + ' • ' + CL(o.club).s;
    document.getElementById('stt').innerHTML = 'Adversaire trouvé !'; document.querySelector('.srch').classList.add('done');
    setTimeout(() => { if (document.querySelector('.srch.done')) vsScreen(MODE, o); }, 1300);
  }, 120);
}
async function vsScreen(mode, oGiven) {
  MODE = mode || 'league';
  const o = oGiven || (MODE === 'cup' ? cupState().opps[SV.cup.round] : oppFor(0)); LASTOPP = o;
  const me = CH(SV.char), op = CH(o.ch), derby = isDerbyWeek() && rivals(SV.club || '').includes(o.club), V = venueNow();
  const tag = MODE === 'cup' ? `🏆 Coupe de Tunisie • ${ROUNDS[SV.cup.round]}` : `${derby ? '🔥 DERBY ! ' : ''}Division ${DIV_N[SV.div]} • Match ${SV.season.n + 1}/10`;
  show(`<div class="bgimg" style="background-image:url(img/bg/vs2.webp)"></div><div class="vsW">
   <div class="vsP L">${crest(SV.club, 'vscr')}${myHero('big', 1)}<div class="vsN">${SV.nick}</div><div class="vsC">${me.n} • ⚡ ${String(myPow()).replace('.', ',')}</div></div>
   <div class="vsBig">VS</div>
   <div class="vsP R">${crest(o.club, 'vscr')}${heroHTML(op.id, o.boot, 'big flip', 1)}<div class="vsN">${o.name}</div><div class="vsC">${op.n} • ⚡ ${String(o.pow).replace('.', ',')}</div></div>
   <div class="vsTag">${tag} • ${V.n}</div>
   <div class="vsLoad"><i id="ldb"></i></div></div>`, 'vs');
  sfx('whoosh'); setTimeout(() => sfx('slam'), 450);
  const t0 = Date.now();
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  setTimeout(() => {
    ui.className = ''; ui.innerHTML = '';
    newMatch({ me: { ch: SV.char, boot: SV.boot, name: SV.nick, club: SV.club, gear: SV.gear, prog: progMap(), powers: SV.pws }, op: { ...o }, venue: V.id, derby, golden: MODE === 'cup', mode: MODE });
  }, Math.max(0, 2200 - (Date.now() - t0)));
}
async function startTuto() {
  show(`<div class="bgimg kb" style="background-image:url(img/bg/title2.webp)"></div><div class="tdark"></div><img class="tlogo" src="img/ui2/logo.webp"><div class="loadc"><b>Match démo</b><div class="vsLoad"><i id="ldb"></i></div></div>`, 'title');
  initPixi(); await loadAssets(p => { const e = document.getElementById('ldb'); if (e) e.style.width = (p * 100) + '%'; });
  ui.className = ''; ui.innerHTML = '';
  newMatch({ me: { ch: SV.char, boot: SV.boot, name: SV.nick, club: SV.club || 'est', gear: SV.gear, prog: progMap(), powers: SV.pws }, op: { ch: 'chebbi', boot: 'b_base', name: 'Gardien', club: 'ca', gear: {}, prog: {}, powers: ['harissa'], ai: .15 }, venue: 'rades', tuto: 1 });
}
function onTutoEnd() { const first = !SV.tuto; SV.tuto = 1; if (first) { SV.dt += 200; addChest(1); } save(); resultScreen({ score: [1, 0], tuto: 1, gain: first ? 200 : 0, cards: [] }); }
function onPause() {
  const d = document.createElement('div'); d.className = 'pause'; d.innerHTML = `<div class="pbox"><h2>Quitter le match ?</h2><p class="sm">Le match comptera comme une défaite.</p><button class="mbtn green wide" data-a="resume">Continuer à jouer</button><button class="mbtn red wide" data-a="quit">Quitter</button></div>`;
  document.body.appendChild(d); d.querySelectorAll('[data-a]').forEach(el => el.addEventListener('click', () => { sfx('tap'); act(el.dataset.a, el); }));
}
function onMatchEnd(r) {
  MODE = MODE || 'league';
  const [a, b] = r.score, win = a > b, draw = a === b, st = r.stats || {};
  const mult = 1 + (10 - SV.div) * .08, gain = Math.round(((win ? 120 : draw ? 60 : 30) + a * 15) * mult * rnd(.9, 1.15) / 10) * 10;
  SV.played++; SV.goals += a; if (win) { SV.wins++; SV.streak++; SV.bestStreak = Math.max(SV.bestStreak, SV.streak); } else SV.streak = 0; SV.dt += gain;
  const cards = grantCards(win ? drawCards(Math.round(rnd(2, 5)), 0) : draw ? drawCards(1, 0) : []);
  // classements de la semaine
  weekCheck(); const derbyX = isDerbyWeek() ? 2 : 1; SV.wk.pts += win ? 3 : draw ? 1 : 0; if (win) { SV.wk.wins++; SV.wk.cw += derbyX; }
  let chest = -1; if (win) { const rr = rollChest(); chest = addChest(rr) >= 0 ? rr : -2; }
  missionsDay(); const add = { play: 1, win: win ? 1 : 0, goals: a, heads: st.hg || 0, pw: st.pw || 0, clean: win && b === 0 ? 1 : 0, shots: st.shots || 0 };
  for (const m of SV.miss.list) if (!m.c) m.p += add[m.id] || 0;
  let end = null, cup = null;
  if (MODE === 'cup') {
    const c = cupState(); cup = { round: c.round };
    if (win) { const bonus = 250 * (c.round + 1); SV.dt += bonus; cup.bonus = bonus; c.round++; if (c.round >= 4) { c.round = 3; c.won = true; SV.cups++; SV.gem += 50; addChest(4); cup.won = true; } }
    else { c.out = true; cup.out = true; }
  } else {
    const s = SV.season; s.n++; s.pts += win ? 3 : draw ? 1 : 0; s.res.push(win ? 'w' : draw ? 'd' : 'l');
    if (s.n >= 10) {
      const D = DIVS[SV.div]; end = { pts: s.pts, from: SV.div };
      if (SV.div === 1) { if (s.pts >= D.up) { SV.titles++; end.kind = 'title'; SV.dt += 5000; SV.gem += 50; addChest(4); } else if (s.pts >= 24) { end.kind = 'stay'; SV.dt += 1500; addChest(2); } else { SV.div = 2; end.kind = 'down'; } }
      else if (s.pts >= D.up) { SV.div--; end.kind = 'up'; SV.dt += 500 * (11 - SV.div); SV.gem += 10; addChest(Math.min(4, 1 + Math.floor((10 - SV.div) / 3))); }
      else if (D.down && s.pts < D.down) { SV.div++; end.kind = 'down'; }
      else { end.kind = 'stay'; SV.dt += 300; }
      SV.best = Math.min(SV.best, SV.div); SV.season = { n: 0, pts: 0, res: [] }; end.to = SV.div;
    }
  }
  save();
  resultScreen({ score: r.score, gain, win, draw, cards, chest, end, cup, res: end || MODE === 'cup' ? null : SV.season.res.slice(), derbyX, quit: r.quit });
}
// fin de match : une pub, puis l'écran face à face avec l'adversaire (revanche possible)
function resultScreen(r) {
  if (r.tuto || r.quit) return postMatch(r);
  showAd(() => postMatch(r), true);
}
function postMatch(r) {
  const win = r.tuto || r.win, [a, b] = r.score, o = r.tuto ? { ch: 'chebbi', boot: 'b_base', name: 'Gardien', club: 'ca', pow: 8 } : LASTOPP;
  const endTxt = r.end ? { title: `🏆 CHAMPION DE TUNISIE ! +5 000 DT`, up: `⬆ MONTÉE en Division ${DIV_N[r.end.to]} !`, down: `⬇ Descente en Division ${DIV_N[r.end.to]}`, stay: `Saison terminée : maintien en Division ${DIV_N[r.end.to]}` }[r.end.kind] : r.cup ? (r.cup.won ? '🏆 VAINQUEUR DE LA COUPE DE TUNISIE !' : r.cup.out ? 'Éliminé de la Coupe de Tunisie' : `Qualifié pour le ${ROUNDS[SV.cup.round].toLowerCase()} ! (+${fmt(r.cup.bonus)} DT)`) : '';
  const kind = r.end ? r.end.kind : r.cup ? (r.cup.out ? 'down' : 'up') : '';
  const canRematch = !r.tuto && MODE !== 'cup' && o;
  show(`<div class="bgimg" style="background-image:url(img/bg/vs2.webp)"></div><div class="pmdark"></div>${win ? '<div class="conf"></div>' : ''}
  <div class="pm ${win ? 'w' : r.draw ? 'd' : 'l'}">
   <div class="pmT">${r.tuto ? 'DÉMO RÉUSSIE !' : r.quit ? 'ABANDON' : win ? 'VICTOIRE !' : r.draw ? 'MATCH NUL' : 'DÉFAITE'}</div>
   <div class="pmP L">${crest(SV.club || 'est', 'vscr')}${myHero('big ' + (win ? 'joy' : ''), win ? 3 : r.draw ? 0 : 2)}<div class="vsN">${SV.nick}</div></div>
   <div class="pmS">${a}<span>-</span>${b}</div>
   <div class="pmP R">${o ? crest(o.club, 'vscr') + heroHTML(o.ch, o.boot, 'big flip' + (!win && !r.draw ? ' joy' : ''), win ? 2 : r.draw ? 0 : 3) + `<div class="vsN">${o.name}</div>` : ''}</div>
   <div class="pmG">${r.gain ? `<div class="rg"><img src="img/ic2/coins.webp"><b id="gv">0</b><small>DT</small></div>` : ''}
     ${(r.cards || []).map(c => `<div class="rg card">${cardHTML(ITEM(c.id), `<div class="kn">×${c.n}</div>`, c.fresh ? 'fresh' : '')}</div>`).join('')}
     ${r.chest >= 0 ? `<div class="rg"><img src="img/ch2/${r.chest}_0.webp"><small>${CHESTS[r.chest].n}</small></div>` : r.chest === -2 ? '<div class="rg"><small>Salle des coffres pleine</small></div>' : ''}
     ${r.res ? `<div class="rg"><span class="sres mini">${Array.from({ length: 10 }, (_, i) => `<i class="${r.res[i] || ''}"></i>`).join('')}</span><small>${SV.season.pts} pts</small></div>` : ''}</div>
   ${endTxt ? `<div class="send ${kind}">${endTxt}</div>` : ''}
   <div class="pmwait" id="pmw"></div>
   <div class="pmB"><button class="mbtn blue" data-a="home">Menu</button>
     ${canRematch ? `<button class="mbtn orange" id="rbtn" data-a="rematch">⟲ Rejouer contre ${o.name.split('_')[0]}</button>` : ''}
     ${r.tuto ? `<button class="mbtn green" data-a="${SV.club ? 'play' : 'start'}">${SV.club ? 'JOUER ▶' : 'Choisir mon club ▶'}</button>` : MODE === 'cup' ? `<button class="mbtn green" data-a="cup">Coupe ▶</button>` : '<button class="mbtn green" data-a="play">JOUER ▶</button>'}</div>
  </div>`, 'result pmv');
  if (win) sfx('unlock');
  if (r.gain) { const e = document.getElementById('gv'), st = Date.now(); const f = () => { const k = Math.min(1, (Date.now() - st) / 900); if (e) e.textContent = fmt(r.gain * k); if (k < 1) requestAnimationFrame(f); else sfx('coin'); }; setTimeout(f, 500); }
}
// revanche : on attend la réponse de l'adversaire
function rematch(el) {
  const o = LASTOPP, w = document.getElementById('pmw'); if (!o || !w) return;
  el.disabled = true; el.classList.add('waiting'); el.innerHTML = '<span class="spin"></span> En attente…';
  w.innerHTML = `<div class="wcard">${headHTML(o.ch, 'pico')}<span>En attente de l'acceptation de <b>${o.name}</b><span class="dots3"><i>.</i><i>.</i><i>.</i></span></span></div>`;
  const ok = Math.random() < .6;
  setTimeout(() => {
    if (!document.getElementById('pmw')) return;
    if (ok) { w.innerHTML = `<div class="wcard ok">${headHTML(o.ch, 'pico')}<span><b>${o.name}</b> accepte la revanche !</span></div>`; sfx('unlock'); setTimeout(() => { if (document.getElementById('pmw')) vsScreen('league', o); }, 1200); }
    else { w.innerHTML = `<div class="wcard no">${headHTML(o.ch, 'pico')}<span><b>${o.name}</b> a refusé la revanche.</span></div>`; sfx('bump'); el.remove(); }
  }, rnd(2200, 4500));
}

// ---------- lancement ----------
load();
title();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
try { if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.ScreenOrientation) Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' }); } catch (e) { }
