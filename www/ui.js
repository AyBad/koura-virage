// ================= KOURA VIRAGE – SAUVEGARDE, SONS, ÉCRANS =================
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const DEF={cgu:0,acc:0,nick:'',club:null,char:'bey',own:['bey'],tok:MAXT,tokT:Date.now(),dt:300,lvl:1,xp:0,snd:1,vib:1,
 ch:{div:10,played:0,pts:0,res:[],best:10,titles:0,seasons:0},cs:'',contrib:0,stats:{w:0,d:0,l:0,gf:0,ga:0},lastDay:'',streak:0,adDay:'',adN:0,
 sp:{harissa:1},eq:['harissa'],inv:{b_base:1,h_none:1,g_none:1,s_none:1,ba_cl:1,c_flag:1},load:{boots:'b_base',hat:'h_none',glasses:'g_none',scarf:'s_none',ball:'ba_cl',celeb:'c_flag'},clv:{},chests:[],mis:{day:'',list:[]},tuto:0,form:[]};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem('kv1')||'{}'));}catch(e){S=Object.assign({},DEF);}
['ch','stats','mis','inv','load','clv'].forEach(k=>S[k]=Object.assign({},DEF[k],S[k]));if(!S.sp)S.sp={harissa:1};if(!Array.isArray(S.eq))S.eq=['harissa'];if(!Array.isArray(S.chests))S.chests=[];if(!Array.isArray(S.form))S.form=[];
if(S.coins!=null){S.dt=(S.dt||0)+S.coins;delete S.coins;if(S.club)S.acc=1;}
if(S.acc)S.cgu=1;
S.own=(S.own||[]).filter(id=>CHARS.some(c=>c.id===id));if(!S.own.includes('bey'))S.own.unshift('bey');if(!S.own.includes(S.char))S.char='bey';
// ancienne amélioration par niveaux : remboursée en dinars
if(S.gear){const OLD={shoes:[400,1200,3500,8000,18000],band:[300,1000,3000,7000,16000],arm:[300,1000,3000,7000,16000],khomsa:[500,1500,4000,9000,20000]};let rb=0;for(const k in OLD)for(let i=0;i<Math.min(5,S.gear[k]||0);i++)rb+=OLD[k][i];S.dt+=rb;delete S.gear;}
for(const sl in S.load)if(!S.inv[S.load[sl]])S.load[sl]=DEF.load[sl];
function myGear(){const g={lv:S.inv,clv:S.clv};for(const sl of GSLOTS)g[sl]=S.load[sl];return g;}
function save(){try{localStorage.setItem('kv1',JSON.stringify(S));}catch(e){}}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const monthId=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1);};
function tokSync(){const now=Date.now();if(S.tok>=MAXT){S.tokT=now;return;}const n=Math.floor((now-S.tokT)/REGEN);if(n>0){S.tok=Math.min(MAXT,S.tok+n);S.tokT=S.tok>=MAXT?now:S.tokT+n*REGEN;save();}}
function nextTok(){return S.tok>=MAXT?0:Math.max(0,REGEN-(Date.now()-S.tokT));}
function spendTok(){tokSync();if(S.tok<=0)return false;if(S.tok>=MAXT)S.tokT=Date.now();S.tok--;save();return true;}
const mmss=ms=>{const s=Math.ceil(ms/1000);return (s/60|0)+':'+String(s%60).padStart(2,'0');};
function isoWeek(d){d=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));return Math.ceil(((d-y)/864e5+1)/7)+d.getUTCFullYear()*53;}
function derbyNow(){return DERBIES[isoWeek(new Date())%DERBIES.length];}
function derbyEnds(){const d=new Date();const day=d.getDay()||7;const e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+8-day);return e-d;}
function inDerby(id){const d=derbyNow();return d[0]===id||d[1]===id;}
function seasonSync(){const m=monthId();if(S.cs!==m){S.cs=m;S.contrib=0;save();}}
function clubTable(){seasonSync();const now=new Date(),st=new Date(now.getFullYear(),now.getMonth(),1);const hrs=(now-st)/36e5;const d=derbyNow();
 const wk=new Date(now.getFullYear(),now.getMonth(),now.getDate()-((now.getDay()||7)-1));const dh=Math.max(0,(now-Math.max(wk,st))/36e5);
 return CLUBS.map(c=>{let p=c.pop*hrs*3.2+(hash(S.cs+c.id)%90)+Math.sin(hrs/7+hash(c.id))*12*c.pop;if(d[0]===c.id||d[1]===c.id)p+=c.pop*dh*3.2;if(c.id===S.club)p+=S.contrib;return {c,p:Math.max(0,Math.round(p))};}).sort((a,b)=>b.p-a.p);}
function spLvl(id){return S.sp[id]||0;}
// ----- sons -----
let AC=null,crowdG=null,NB=null;
function au(){if(!S.snd)return null;try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();}if(AC.state==='suspended')AC.resume();}catch(e){return null;}return AC;}
function noiseBuf(a){const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
function tone(a,type,f0,f1,t0,dur,vol){const o=a.createOscillator(),gn=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);gn.gain.setValueAtTime(vol,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+dur);o.connect(gn).connect(a.destination);o.start(t0);o.stop(t0+dur+.02);}
function noise(a,t0,dur,vol,ft,ff){const s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain();s.buffer=NB;f.type=ft;f.frequency.value=ff;gn.gain.setValueAtTime(vol,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+dur);s.connect(f).connect(gn).connect(a.destination);s.start(t0,Math.random());s.stop(t0+dur+.05);}
function sfx(t){const a=au();if(!a)return;const n=a.currentTime;NB=NB||noiseBuf(a);
 if(t==='kick'){tone(a,'sine',170,50,n,.14,.55);noise(a,n,.05,.25,'lowpass',2200);}
 else if(t==='bump'){tone(a,'sine',240,90,n,.09,.3);}
 else if(t==='head'){tone(a,'sine',300,110,n,.1,.45);noise(a,n,.04,.15,'lowpass',1800);}
 else if(t==='swish'){noise(a,n,.12,.08,'bandpass',1500);}
 else if(t==='jump'){tone(a,'sine',300,520,n,.1,.06);}
 else if(t==='beep'){tone(a,'square',660,0,n,.12,.06);}
 else if(t==='whistle'||t==='end'){const reps=t==='end'?3:1;for(let r=0;r<reps;r++){const s=n+r*.35,o=a.createOscillator(),l=a.createOscillator(),lg=a.createGain(),gn=a.createGain();o.type='square';o.frequency.value=2800;l.frequency.value=32;lg.gain.value=90;l.connect(lg).connect(o.frequency);gn.gain.setValueAtTime(0,s);gn.gain.linearRampToValueAtTime(.06,s+.02);gn.gain.setValueAtTime(.06,s+(r===reps-1?.5:.22));gn.gain.linearRampToValueAtTime(0,s+(r===reps-1?.55:.27));o.connect(gn).connect(a.destination);o.start(s);l.start(s);o.stop(s+.6);l.stop(s+.6);}}
 else if(t==='goal'){const s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain();s.buffer=NB;s.loop=true;f.type='bandpass';f.frequency.value=900;f.Q.value=.6;gn.gain.setValueAtTime(0,n);gn.gain.linearRampToValueAtTime(.45,n+.3);gn.gain.linearRampToValueAtTime(0,n+2.6);s.connect(f).connect(gn).connect(a.destination);s.start(n);s.stop(n+2.7);[523,659,784,1046].forEach((f2,i)=>tone(a,'triangle',f2,0,n+i*.09,.25,.12));}
 else if(t==='power'){tone(a,'sawtooth',200,900,n,.35,.12);}
 else if(t==='post'){tone(a,'triangle',520,0,n,.5,.3);}
 else if(t==='clap'){for(let i=0;i<3;i++)noise(a,n+i*.22,.08,.1,'highpass',1200);}
 else if(t==='tap'){tone(a,'sine',700,0,n,.07,.07);}
 else if(t==='coin'){[880,1320].forEach((fq,i)=>tone(a,'square',fq,0,n+i*.08,.12,.05));}
 else if(t==='chest'){[392,523,659,784,1046].forEach((f2,i)=>tone(a,'triangle',f2,0,n+i*.07,.3,.12));}
 else if(t==='slam'){tone(a,'sine',120,40,n,.4,.6);noise(a,n,.3,.3,'lowpass',600);}}
function crowd(on,vol){const a=au();if(!a)return;NB=NB||noiseBuf(a);
 if(on&&!crowdG){const s=a.createBufferSource(),f=a.createBiquadFilter(),gn=a.createGain();s.buffer=NB;s.loop=true;f.type='lowpass';f.frequency.value=700;gn.gain.value=0;s.connect(f).connect(gn).connect(a.destination);s.start();crowdG={s,g:gn};}
 if(crowdG){crowdG.g.gain.setTargetAtTime(on?(vol||.07):0,a.currentTime,.3);if(!on){const c=crowdG;crowdG=null;setTimeout(()=>{try{c.s.stop();}catch(e){}},1500);}}}
function vib(ms){if(S.vib&&navigator.vibrate)try{navigator.vibrate(ms);}catch(e){}}
// ----- publicité (AdMob, identifiants de TEST : à remplacer avant publication) -----
const ADMOB={reward:'ca-app-pub-3940256099942544/5224354917',testing:true};
const Ads={ok:false,A:null,busy:false,
 async init(){try{const P=window.Capacitor&&window.Capacitor.Plugins;this.A=P&&P.AdMob;if(!this.A)return;await this.A.initialize({});
  try{const ci=await this.A.requestConsentInfo();if(ci&&ci.isConsentFormAvailable&&ci.status==='REQUIRED')await this.A.showConsentForm();}catch(e){}this.ok=true;}catch(e){this.ok=false;}},
 reward(cb){if(this.busy)return;if(!this.ok){fakeAd(cb);return;}this.busy=true;const A=this.A;
  Promise.resolve().then(()=>A.prepareRewardVideoAd({adId:ADMOB.reward,isTesting:ADMOB.testing})).then(()=>A.showRewardVideoAd()).then(r=>{this.busy=false;cb(!!r);},()=>{this.busy=false;fakeAd(cb);});}};
function fakeAd(cb){const d=document.createElement('div');d.className='ad';let t=5;d.innerHTML='<div style="font-size:3vh;opacity:.6">PUBLICITÉ</div><div style="font-size:7vh">Koura Virage ⚽</div><div id="adc" style="font-size:5vh">'+t+'</div>';document.body.appendChild(d);
 const iv=setInterval(()=>{t--;const e=d.querySelector('#adc');if(e)e.textContent=t;if(t<=0){clearInterval(iv);d.remove();cb(true);}},1000);}
function adAllowed(){if(S.adDay!==today()){S.adDay=today();S.adN=0;}return S.adN<ADMAX;}
function watchAd(after){if(!adAllowed()){toast('Plus de pubs pour aujourd\'hui, reviens demain !');return;}Ads.reward(ok=>{if(ok){S.adN++;save();after();}});}
// ----- utilitaires d'interface -----
const ui=document.getElementById('ui');let modalLock=false;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Math.round(n).toLocaleString('fr-FR');
function dur(ms){const h=Math.floor(ms/36e5);return h>=24?Math.floor(h/24)+'j '+(h%24)+'h':h+'h '+Math.floor(ms%36e5/6e4)+'min';}
function modal(html,cb,lock,cls){closeModal();const d=document.createElement('div');d.className='modal';d.id='mdl';d.innerHTML='<div class="box '+(cls||'')+'">'+(lock?'':'<button class="xb" data-a="close">✕</button>')+html+'</div>';document.body.appendChild(d);modalLock=lock;
 d.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t){if(e.target===d&&!lock){closeModal();refreshHome();}return;}sfx('tap');const a=t.dataset.a;if(a==='close'){closeModal();refreshHome();return;}cb&&cb(a,t);});
 paintCanvases(d);return d;}
function closeModal(){const d=document.getElementById('mdl');if(d)d.remove();}
function refreshHome(){if(!M&&ui.dataset.v==='home')home();}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2400);}
function paintCanvases(root){root.querySelectorAll('canvas[data-c]').forEach(c=>{if(c.classList.contains('live'))return;preview(c,c.dataset.c,CL(c.dataset.k||S.club||'ca'),c.dataset.g?myGear():{},c.dataset.m||'');});root.querySelectorAll('canvas[data-item]').forEach(c=>itemIcon(c,EQ(c.dataset.item)));}
function itemIcon(cnv,e){const d=Math.min(2,devicePixelRatio||1),w=cnv.clientWidth||80,h=cnv.clientHeight||80;cnv.width=w*d;cnv.height=h*d;const c=cnv.getContext('2d');c.scale(d,d);c.lineJoin='round';
 {const ii=EQI(e.id);if(ii){const k=Math.min(w*.86/ii.naturalWidth,h*.8/ii.naturalHeight),iw=ii.naturalWidth*k,ih=ii.naturalHeight*k;c.drawImage(ii,(w-iw)/2,(h-ih)/2,iw,ih);return;}}
 if(e.slot==='ball'){const r=Math.min(w,h)*.3;drawBall(c,w/2,h/2,.3,r,e.kind);return;}
 if(e.slot==='celeb'){const s=Math.min(w,h)/80;drawCeleb(c,e.kind,w/2,h*.55,s,600);return;}
 if(e.slot==='scarf'&&e.kind){const r=Math.min(w,h)*.42;drawScarf(c,e,w/2+r*.25,h*.38,r,1,0);return;}
 if(e.slot==='boots'){const s=Math.min(w/80,h/50);drawBoot(c,w/2-6*s,h*.78,s,1,e,0);}
 else if(!e.kind){c.font=(h*.5|0)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';c.globalAlpha=.5;c.fillText('🚫',w/2,h/2);}
 else{const r=Math.min(w,h)*.42;c.save();c.translate(w/2,e.slot==='hat'?h*.92:h*.62);if(e.slot==='hat')drawHat(c,e,r,Math.max(2,r*.085));else drawGlasses(c,e,r*1.3,0,Math.max(2,r*.1));c.restore();}}
// personnages animés (accueil, vestiaire) : il jongle avec le ballon de la tête
function liveLoop(){requestAnimationFrame(liveLoop);const now=Date.now();if(!LIVEON)return;document.querySelectorAll('canvas.live').forEach(cnv=>{const d=Math.min(2,devicePixelRatio||1),w=cnv.clientWidth,h=cnv.clientHeight;if(!w||!h)return;if(cnv.width!==Math.round(w*d)){cnv.width=Math.round(w*d);cnv.height=Math.round(h*d);}
 const c=cnv.getContext('2d');c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);const s=Math.min(w/100,h/150),gear=cnv.dataset.try?Object.assign(myGear(),JSON.parse(cnv.dataset.try)):myGear();
 const ph=(now%1100)/1100,hop=Math.sin(ph*Math.PI),ch=CH(cnv.dataset.c),baseY=h-6*s;
 drawPlayerArt(c,ch,CL(S.club||'ca'),gear,w/2,baseY,s,1,{lx:.2,ly:-.9,mouth:hop>.8?'open':'',bob:-hop*4,blink:(Math.floor(now/120))%30===0,aura:(gear.clv&&gear.clv[ch.id])||1});
 const r=34*s,hy=baseY-26*s-r*.92-hop*4*s,by=hy-r*1.35-hop*(h*.32);drawBall(c,w/2+r*.15,by,now*.006,13*s,(EQ(gear.ball)||{}).kind);
 if(cnv.dataset.cel){const ce=EQ(gear.celeb);if(ce&&ce.kind)drawCeleb(c,ce.kind,w/2+r*1.45,hy-r*.6,s*.9,now);}
 c.fillStyle='rgba(0,0,0,.2)';});}
let LIVEON=true;requestAnimationFrame(liveLoop);
function showUI(){ui.classList.remove('hide');setOrient('landscape');home();}
let BGURL={};
function homeBg(){const k=S.club||'ca';if(BGURL[k])return BGURL[k];const sc=mkScene({t:'stade',n:CL(k).st},CL(k),CL(k==='est'?'ca':'est'));const c=document.createElement('canvas');c.width=960;c.height=540;const x=c.getContext('2d');x.drawImage(sc.base,0,0);x.drawImage(sc.crowd[0],0,0);x.drawImage(sc.front,0,0);return BGURL[k]=c.toDataURL('image/jpeg',.7);}
// ----- premier lancement : conditions, compte, club, démo -----
function onboard(){ui.classList.remove('hide');setOrient('landscape');setMenuScene();ui.innerHTML=`<div class="scr"></div>`;
 if(!S.cgu){welcome();return;}if(!S.acc){account();return;}if(!S.club){pickClub(true);return;}if(!S.tuto){demo();return;}home();}
function welcome(){modal(`<div class="hdr">Bienvenue</div><div class="white"><p>En appuyant sur « Accepter », je confirme avoir lu et accepté les conditions d'utilisation et la politique de confidentialité de Koura Virage.</p><div class="row"><a data-a="priv">Politique de confidentialité</a><a data-a="cgu">Conditions générales</a></div></div><div class="row"><button class="bt g big" data-a="ok">Accepter</button></div>`,a=>{
 if(a==='ok'){S.cgu=1;save();closeModal();onboard();}else if(a==='priv'||a==='cgu')legal(()=>welcome());},true,'blue');}
function legal(back){modal(`<div class="hdr">Conditions & confidentialité</div><div class="white scroll"><p><b>Éditeur :</b> Syphax Apps. Jeu gratuit financé par la publicité.</p><p><b>Données :</b> ta progression (pseudo, club, dinars, personnages) est enregistrée uniquement sur ton téléphone.</p><p><b>Publicité (Android) :</b> Google AdMob peut utiliser l'identifiant publicitaire de l'appareil ; ton consentement est demandé au premier lancement. Les vidéos sont toujours facultatives.</p><p><b>Clubs et stades :</b> noms utilisés à titre de référence ; écussons neutres aux couleurs des clubs, sans lien officiel avec eux ni avec la FTF. Personnages : caricatures affectueuses de figures historiques.</p></div><div class="row"><button class="bt g" data-a="back">Retour</button></div>`,a=>{if(a==='back')back();},true,'blue');}
function account(){const def='mle3bi_'+(1000+Math.random()*9000|0);
 modal(`<div class="hdr">Crée ton compte</div><div class="txt">Choisis ton pseudo : c'est lui que verront tes adversaires.</div><input id="nk" maxlength="14" placeholder="Ton pseudo"><div class="row"><button class="bt g" data-a="ok">Créer mon compte</button><button class="bt s" data-a="later">Plus tard (${def})</button></div><div class="txt sm">Ton compte est enregistré sur ce téléphone.</div>`,a=>{
  if(a==='ok'){const v=document.getElementById('nk').value.trim().replace(/[<>]/g,'').slice(0,14);if(v.length<3){toast('3 caractères minimum');return;}S.nick=v;}else if(a==='later')S.nick=def;else return;
  S.acc=1;save();closeModal();pickClub(true);},true,'blue');}
function pickClub(first){let sel=S.club||null;
 const render=()=>modal(`<div class="hdr">${first?'Ahla bik '+esc(S.nick)+' ! Choisis ton club':'Changer de club'}</div><div class="clubs">${CLUBS.map(c=>`<button class="cb ${sel===c.id?'on':''}" data-a="c:${c.id}">${shieldSVG(c)}<span>${c.s}</span></button>`).join('')}</div><div class="txt sm">${sel?CL(sel).n+' • '+CL(sel).st:'Chaque victoire rapporte des points à ton club dans le classement de la saison.'}${!first&&S.club?' — ta contribution de la saison repart à zéro.':''}</div><div class="row"><button class="bt g" data-a="ok" ${sel?'':'disabled'}>C'est mon club !</button></div>`,(a)=>{
  if(a.startsWith('c:')){sel=a.slice(2);render();}else if(a==='ok'){if(S.club!==sel)S.contrib=0;S.club=sel;BGURL={};save();closeModal();if(first&&!S.tuto)demo();else home();}},first,'blue');render();}
function demo(){modal(`<div class="hdr">Match démo</div><div class="txt">On t'apprend à jouer en une minute : courir, sauter, tir bas, tir haut, tête et super pouvoir.<br>À la fin : <b class="y">+150 DT et un coffre</b> !</div><div class="row"><button class="bt g" data-a="go">C'est parti !</button><button class="bt s" data-a="skip">Passer</button></div>`,a=>{
 if(a==='go'){closeModal();startMatch(me({mode:'tuto',tuto:1,noVs:1,cost:0,c2:'chebbi',k2:S.club==='est'?'ca':'est',n2:'Gardien',ai2:.1,venue:VAGUES[0],label:'Match démo'}));}
 else if(a==='skip'){S.tuto=1;save();closeModal();home();}},true,'blue');}
// ----- accueil -----
function xpBar(){const need=XPL(S.lvl);return `<div class="lvl" data-a="lvl"><div class="star">${S.lvl}</div><div class="xpb"><i style="width:${Math.min(100,S.xp/need*100)}%"></i><span>${fmt(S.xp)}/${fmt(need)}</span></div></div>`;}
function home(){seasonSync();missionsSync();ui.dataset.v='home';if(!S.cgu||!S.acc||!S.club){onboard();return;}tokSync();
 const club=CL(S.club),ch=CH(S.char),d=derbyNow(),div=S.ch.div,D=DIVS[div],nc=S.chests.length,mdone=S.mis.list.filter(m=>m.c).length;
 let toks='';for(let i=0;i<Math.max(MAXT,S.tok);i++)toks+=`<span class="tk ${i<S.tok?'':'off'}">⚽</span>`;
 setMenuScene();ui.innerHTML=`<div class="scr"><div class="topbar">${xpBar()}
  <div class="pill" data-a="shop:sp"><span class="ico">💵</span><b class="cnt" data-v="${S.dt}">${fmt(LASTDT==null?S.dt:LASTDT)}</b><span class="plus">+</span></div>
  <div class="pill" data-a="tok">${toks}${S.tok<MAXT?`<small id="tkt">${mmss(nextTok())}</small>`:''}<span class="plus">+</span></div>
  <div class="pill" data-a="table"><span class="ico">📣</span><b>${fmt(S.contrib)}</b></div><div class="sp"></div>
  <button class="rb" data-a="chests">🎁${nc?`<span class="badge">${nc}</span>`:''}</button><button class="rb" data-a="set">⚙️</button></div>
 <div class="hm">
  <div class="lcol"><button class="side" data-a="shop:sp"><span class="e">🛒</span>Boutique</button><button class="side" data-a="chests"><span class="e">🎁</span>Coffres${nc?`<span class="badge">${nc}</span>`:''}</button><button class="side" data-a="watch"><span class="e">📺</span>Regarde<br>et gagne</button></div>
  <div class="ped" data-a="shop:chars"><canvas class="hero live" data-c="${S.char}"></canvas><div class="podium"></div><div class="nplate">${esc(S.nick)}</div><div class="rar" style="background:${RCOL[ch.r]}">${ch.n}</div></div>
  <div class="rcol"><button class="big card cg" data-a="champ"><div class="vsart"><canvas data-c="hannibal" data-k="est"></canvas><span class="vsb">VS</span><canvas data-c="${S.char}"></canvas></div><div class="ct"><h3>Championnat</h3><span>Division ${div} • ${S.ch.played}/10 • ${S.ch.pts} pts</span></div>${S.ch.played===0?'<span class="badge">1</span>':''}</button>
   <div class="duo"><button class="card co" data-a="derby"><h4>🔥 ${d[2]}</h4><span>${CL(d[0]).s} – ${CL(d[1]).s} • points ×2</span></button><button class="card cp" data-a="table"><h4>📊 Classement</h4><span>${club.s} : ${rankOf(club.id)}e • ${MOIS[new Date().getMonth()]}</span></button></div></div></div>
 <div class="bottom"><button class="play" data-a="champ"><span class="wh">📯</span>JOUER</button>
  <button class="ib" data-a="shop:chars"><span class="e">👑</span>Personnages</button><button class="ib" data-a="shop:sp"><span class="e">⚡</span>Super pouvoirs</button><button class="ib" data-a="chests"><span class="e">📋</span>Missions${S.mis.list.length-mdone?`<span class="badge g">${S.mis.list.length-mdone}</span>`:''}</button>
  <button class="ib" data-a="shop:gear"><span class="e">👟</span>Vestiaire</button><button class="ib" data-a="quick"><span class="e">⚽</span>Match rapide</button><button class="ib" data-a="duo"><span class="e">🤝</span>Duel à 2</button><button class="ib" data-a="train"><span class="e">🎯</span>Entraînement</button></div>
 <div class="ver">V${APP_VERSION} • Syphax Apps</div></div>`;
 paintCanvases(ui);countUp();
 ui.onclick=e=>{const t=e.target.closest('[data-a]');if(!t)return;au();sfx('tap');const a=t.dataset.a;
  if(a==='shop:chars')return vest('char');if(a==='shop:gear')return vest('boots');if(a.startsWith('shop:'))return shop(a.slice(5));
  const F={champ:champScreen,derby:derbyScreen,table:tableScreen,quick:quickScreen,duo:duoScreen,train:()=>startMatch(trainSetup()),chests:chestScreen,set:settings,tok:()=>tokScreen(),watch:watchEarn,lvl:levelInfo}[a];if(F)F();};
 checkDaily();}
setInterval(()=>{const e=document.getElementById('tkt');if(e){tokSync();if(S.tok>=MAXT&&!M&&!document.getElementById('mdl'))home();else e.textContent=mmss(nextTok());}},1000);
let LASTDT=null;
function countUp(){const e=ui.querySelector('.cnt');if(!e)return;const to=+e.dataset.v,from=LASTDT==null?to:LASTDT;LASTDT=to;if(from===to)return;const t0=performance.now();sfx('coin');const st=()=>{const k=Math.min(1,(performance.now()-t0)/900);e.textContent=fmt(from+(to-from)*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(st);else{e.classList.add('bump');setTimeout(()=>e.classList.remove('bump'),400);}};st();}
function rankOf(id){return clubTable().findIndex(r=>r.c.id===id)+1;}
function levelInfo(){modal(`<div class="hdr">Niveau ${S.lvl}</div><div class="txt">Gagne de l'expérience à chaque match (victoire +100, nul +50, défaite +25).<br>Chaque niveau gagné = un <b class="y">coffre en argent</b>, tous les 5 niveaux = un <b class="y">coffre en or</b>.</div><div class="xpb wide"><i style="width:${Math.min(100,S.xp/XPL(S.lvl)*100)}%"></i><span>${fmt(S.xp)}/${fmt(XPL(S.lvl))}</span></div>`,null,false,'blue');}
function watchEarn(){const left=ADMAX-(S.adDay===today()?S.adN:0);modal(`<div class="hdr">Regarde et gagne</div><div class="txt">Regarde une courte vidéo pour gagner <b class="y">60 DT</b>.<br><span class="sm">${left} vidéo(s) encore disponible(s) aujourd'hui.</span></div><div class="row"><button class="bt g" data-a="go" ${left>0?'':'disabled'}>▶ Regarder</button></div>`,a=>{if(a==='go')watchAd(()=>{rewardCard([{k:'dt',n:60}],()=>home());});},false,'blue');}
// ----- cadeau du jour, missions, coffres -----
const CHN={bois:'en bois',argent:'en argent',or:'en or'},CHM={bois:['#c08a4a','#7a4c1c'],argent:['#f4f6ff','#9aa3c0'],or:['#ffe680','#d49a00']};
function checkDaily(){const t=today();if(S.lastDay===t)return;const y=new Date();y.setDate(y.getDate()-1);const ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
 S.streak=S.lastDay===ys?S.streak%7+1:1;S.lastDay=t;const type=S.streak===7?'or':S.streak>=4?'argent':'bois';S.chests.push(type);save();
 setTimeout(()=>{if(M||document.getElementById('mdl'))return;let d='';for(let i=1;i<=7;i++)d+=`<div class="day ${i<S.streak?'done':i===S.streak?'now':''}"><span>Jour ${i}</span><b>${i===7?'🏆':i>=4?'🎁':'📦'}</b></div>`;
  modal(`<div class="hdr">Récompenses quotidiennes</div><div class="days">${d}</div><div class="txt">Jour ${S.streak} : un coffre ${CHN[type]} t'attend ! Reviens chaque jour : le 7e jour, c'est un coffre en or.</div><div class="row"><button class="bt g" data-a="open">Ouvrir</button></div>`,a=>{if(a==='open')openChest();},false,'blue');sfx('coin');},400);}
function missionsSync(){if(S.mis.day===today()&&S.mis.list.length)return;const pool=MISSIONS.slice().sort(()=>Math.random()-.5).slice(0,3);S.mis={day:today(),list:pool.map(m=>({id:m.id,t:m.t,n:pick(m.n),p:0,c:0}))};save();}
function missionEvents(ev){missionsSync();const got=[];for(const m of S.mis.list){if(m.c)continue;m.p=Math.min(m.n,m.p+(ev[m.id]||0));if(m.p>=m.n){m.c=1;S.chests.push('argent');got.push(m.t);}}save();return got;}
function rollChest(type){const q={bois:1,argent:1.7,or:3}[type];const out=[];const n=type==='or'?3:type==='argent'?2:1;
 for(let i=0;i<n;i++){const r=Math.random();
  if(r<.45)out.push({k:'dt',n:Math.round((40+Math.random()*60)*q/5)*5});
  else if(r<.75){const ids=Object.keys(SP).filter(id=>spLvl(id)<3);if(!ids.length){out.push({k:'dt',n:120});continue;}out.push({k:'sp',id:pick(ids)});}
  else if(r<.9)out.push({k:'tok',n:type==='or'?3:2});
  else if(r<.985||type==='bois')out.push({k:'xp',n:Math.round(60*q)});
  else{const pool=CHARS.filter(c=>!S.own.includes(c.id)&&(type==='or'||!c.l78));const lock=pool.filter(c=>c.l78?Math.random()<.15:true);if(lock.length)out.push({k:'char',id:pick(lock).id});else out.push({k:'dt',n:400});}}
 return out;}
function applyRew(r){if(r.k==='dt')S.dt+=r.n;else if(r.k==='sp'){S.sp[r.id]=Math.min(3,spLvl(r.id)+1);if(!S.eq.includes(r.id)&&S.eq.length<3)S.eq.push(r.id);}else if(r.k==='tok')S.tok+=r.n;else if(r.k==='xp')addXp(r.n);else if(r.k==='char'&&!S.own.includes(r.id))S.own.push(r.id);}
function addXp(n){S.xp+=n;const ups=[];while(S.xp>=XPL(S.lvl)){S.xp-=XPL(S.lvl);S.lvl++;S.chests.push(S.lvl%5===0?'or':'argent');ups.push(S.lvl);}return ups;}
function rewHTML(r){if(r.k==='dt')return `<div class="rimg">💵</div><b>${fmt(r.n)} DT</b>`;if(r.k==='sp')return `<div class="rimg">${SP[r.id].e}</div><b>${SP[r.id].n}</b><small>Niveau ${spLvl(r.id)}</small>`;if(r.k==='tok')return `<div class="rimg">⚽</div><b>+${r.n} jetons</b>`;if(r.k==='xp')return `<div class="rimg">⭐</div><b>+${r.n} XP</b>`;const c=CH(r.id);return `<canvas data-c="${c.id}" class="rcv"></canvas><b>${c.n}</b><small style="color:${RCOL[c.r]}">${c.r.toUpperCase()}</small>`;}
function rewardCard(list,done,title){let i=0;list.forEach(applyRew);save();const show=()=>{const r=list[i];
 modal(`<div class="reveal"><div class="rays2"></div><div class="conf"></div><div class="rcard">${rewHTML(r)}</div></div><div class="row"><button class="bt g big" data-a="ok">${i<list.length-1?'Suivant ('+(list.length-1-i)+')':'Récupérer'}</button></div>`,a=>{if(a==='ok'){i++;if(i<list.length){sfx('coin');show();}else{closeModal();done&&done();}}},true,'clear');sfx('chest');};show();}
function openChest(){if(!S.chests.length){chestScreen();return;}const type=S.chests[0];const [m1,m2]=CHM[type];
 modal(`<div class="hdr">Coffre ${CHN[type]}</div><div class="chestw"><div class="chest shake" data-a="tap" style="--m1:${m1};--m2:${m2}"><div class="base"><div class="band" style="left:3vh"></div><div class="band" style="right:3vh"></div></div><div class="lid"><div class="band" style="left:2.6vh"></div><div class="band" style="right:2.6vh"></div></div><div class="lock"></div></div></div><div class="txt">Touche le coffre pour l'ouvrir !</div>`,a=>{
  if(a==='tap'){const c=document.querySelector('.chest');if(c.classList.contains('open'))return;c.classList.remove('shake');c.classList.add('open');sfx('chest');vib(60);S.chests.shift();save();
   setTimeout(()=>rewardCard(rollChest(type),()=>{if(S.chests.length)openChest();else home();}),550);}},true,'blue');}
function chestScreen(){missionsSync();const ms=S.mis.list.map(m=>`<div class="mis ${m.c?'ok':''}"><span class="mi">${m.c?'✅':'🎯'}</span><div class="mt"><b>${m.t}</b><div class="xpb"><i style="width:${m.p/m.n*100}%"></i><span>${m.p}/${m.n}</span></div></div><span class="mr">🎁</span></div>`).join('');
 const cc={};S.chests.forEach(c=>cc[c]=(cc[c]||0)+1);
 modal(`<div class="hdr">Missions du jour</div>${ms}<div class="txt sm">Chaque mission réussie en match classé = un coffre en argent. Nouvelles missions demain.</div><div class="row">${S.chests.length?`<button class="bt y" data-a="open">🎁 Ouvrir (${Object.entries(cc).map(([k,v])=>v+' '+CHN[k]).join(', ')})</button>`:'<div class="txt sm">Aucun coffre à ouvrir pour le moment.</div>'}</div>`,a=>{if(a==='open')openChest();},false,'blue');}
// ----- animation de montée de niveau (fond rouge, flèches, flash blanc, étincelles) -----
function levelUp(chId,lv,done){closeModal();const d=document.createElement('div');d.className='lvup';d.innerHTML=`<div class="lvar"></div><div class="lvhero"><canvas class="live" data-c="${chId}"></canvas><div class="lvsp"></div></div><div class="lvrib">Niveau <b>${lv}</b></div><div class="lvtxt">${CH(chId).n} évolue ! +${CLVB[lv-1]}% sur toutes ses stats</div>`;document.body.appendChild(d);sfx('chest');
 setTimeout(()=>{d.classList.add('flash');sfx('goal');vib(60);},900);setTimeout(()=>d.classList.add('done'),1500);
 const end=()=>{d.remove();done&&done();};setTimeout(()=>d.addEventListener('click',end),1500);setTimeout(()=>{if(d.isConnected)end();},4200);}
// ----- vestiaire plein écran (style Head Ball 2) : personnage au centre, stats à droite, objets en bas -----
const VTABS=Object.assign({char:{n:'Personnages',e:'👤'}},SLOTS);
function vest(slot){if(slot)VST.slot=slot;const sl=VST.slot,isC=sl==='char';
 const list=isC?CHARS:EQUIP.filter(e=>e.slot===sl);
 if(isC){if(!CHARS.some(c=>c.id===VST.sel))VST.sel=S.char;}else if(!EQ(VST.sel)||EQ(VST.sel).slot!==sl)VST.sel=S.load[sl];
 const it=isC?CH(VST.sel):EQ(VST.sel),own=isC?S.own.includes(it.id):!!S.inv[it.id],lv=isC?(S.clv[it.id]||1):(S.inv[it.id]||1),eqd=isC?S.char===it.id:S.load[sl]===it.id;
 const chId=isC?it.id:S.char,tryG=isC?myGear():Object.assign(myGear(),{[sl]:it.id}),cur=stats(S.char,myGear()),nxt=stats(chId,tryG);
 const pw=o=>((o.kp+o.spd+o.jmp+o.hd)/4*6-1).toFixed(1).replace('.',',');
 const bar=(lab,k,ic,col)=>{const a=Math.round(cur[k]*100),b=Math.round(nxt[k]*100),df=b-a,wa=Math.max(4,Math.min(100,(Math.min(a,b)-70)/80*100)),wd=Math.min(100-wa,Math.abs(df)/80*100);
  return `<div class="vb"><span class="vi" style="background:${col}">${ic}</span><div class="vbw"><small>${lab}</small><div class="vbb"><i style="width:${wa}%"></i>${df?`<em class="${df>0?'':'dn'}" style="left:${wa}%;width:${wd}%"></em>`:''}</div></div><b>${b}${df?`<small class="${df>0?'up':'dn'}">${df>0?'+':''}${df}</small>`:''}</b></div>`;};
 const bon=isC?it.sub:(Object.entries(it.b).map(([k,v])=>`${{kp:'Tir',spd:'Vitesse',jmp:'Saut',hd:'Tête'}[k]} +${Math.round(v*(1+.5*(lv-1)))}%`).join(' • ')||'Style uniquement, aucun bonus');
 const upc=!isC&&own&&lv<5&&it.pr?Math.round(it.pr*EQUP(lv)):0;
 const icon=isC?`<canvas data-c="${it.id}" data-k="${it.l78?'ca':S.club}"></canvas>`:`<canvas data-item="${it.id}"></canvas>`;
 const left=`<div class="vcard" style="--rc:${RCOL[it.r]}"><div class="vstack"><span></span><span></span><div>${icon}</div></div>
  ${isC?`<div class="vlv">${own?'★'.repeat(lv)+'☆'.repeat(CLVMAX-lv)+` <small>Évolution ${lv}/${CLVMAX}</small>`:'Verrouillé'}</div>${own&&lv<CLVMAX?`<button class="bt g vup" data-a="evo:${it.id}">✨ Évoluer<small>💵 ${fmt(CLVC(it,lv))} • +${CLVB[lv]}% partout</small></button>`:own?'<div class="vmax">ÉVOLUTION MAX</div>':''}`:it.pr?`<div class="vlv">${own?'★'.repeat(lv)+'☆'.repeat(5-lv)+` <small>Niv. ${lv}/5</small>`:'Niveau max 5'}</div>`:''}
  ${upc?`<button class="bt g vup" data-a="up:${it.id}">⬆ Améliorer<small>💵 ${fmt(upc)}</small></button>`:(!isC&&own&&lv>=5&&it.pr?'<div class="vmax">NIVEAU MAX</div>':'')}</div>`;
 const main=!own?`<button class="bt y vgo" data-a="buy:${it.id}">Acheter • 💵 ${fmt(it.pr)}</button>`:eqd?'<div class="vgo done">✔ Équipé</div>':`<button class="bt o vgo" data-a="eq:${it.id}">${isC?'Choisir':'Équiper'}</button>`;
 const cards=list.map(x=>{const o=isC?S.own.includes(x.id):!!S.inv[x.id],q=isC?S.char===x.id:S.load[sl]===x.id;
  return `<button class="vc ${x.id===it.id?'sel':''} ${o?'':'lock'}" data-a="v:${x.id}" style="--rc:${RCOL[x.r]}">${isC?`<canvas data-c="${x.id}" data-k="${x.l78?'ca':S.club}"></canvas>`:`<canvas data-item="${x.id}"></canvas>`}${q?'<span class="chk">✔</span>':''}${!o?`<span class="vpr">💵 ${fmt(x.pr)}</span>`:(!isC&&x.pr?`<span class="vst">${'★'.repeat(S.inv[x.id])}</span>`:'')}<span class="vr">${x.r}</span></button>`;}).join('');
 const html=`<div class="vbeam b1"></div><div class="vbeam b2"></div><div class="vbeam b3"></div>
 <div class="vhead"><div class="vname">${it.n}</div><div class="vsub">${bon}</div></div>
 <div class="vmid">${left}<div class="vhero"><canvas class="live" data-c="${chId}" data-try='${JSON.stringify(isC?{}:{[sl]:it.id})}'${sl==='celeb'?' data-cel="1"':''}></canvas><div class="vspot"></div>${main}</div>
  <div class="vstats"><div class="vpw">⚡ Puissance : <b>${pw(nxt)}</b>${pw(nxt)!==pw(cur)?`<small class="${nxt.kp+nxt.spd+nxt.jmp+nxt.hd>cur.kp+cur.spd+cur.jmp+cur.hd?'up':'dn'}">(${pw(cur)})</small>`:''}</div>${bar('Vitesse','spd','⚡','#2c8cf0')}${bar('Saut','jmp','🦘','#3fae1a')}${bar('Tir','kp','🦶','#ff6a00')}${bar('Tête','hd','🧠','#a64df0')}</div></div>
 <div class="vtabs">${Object.entries(VTABS).map(([k,v])=>`<button class="vt ${k===sl?'on':''}" data-a="sl:${k}"><span>${v.e}</span><i>${v.n}</i></button>`).join('')}<span class="pill vdt"><span class="ico">💵</span><b>${fmt(S.dt)}</b></span></div>
 <div class="vstrip">${cards}</div>`;
 const d=modal(html,a=>{
  if(a.startsWith('sl:')){VST.slot=a.slice(3);VST.sel=null;vest();}
  else if(a.startsWith('v:')){VST.sel=a.slice(2);sfx('tap');vest();}
  else if(a.startsWith('eq:')){const id=a.slice(3);if(isC){S.char=id;toast(CH(id).n+' choisi !');}else{const e=EQ(id);S.load[e.slot]=e.id;toast(e.n+' équipé !');}save();sfx('chest');vest();}
  else if(a.startsWith('buy:')){const id=a.slice(4);if(isC){const c=CH(id);if(S.dt<c.pr)return toast('Il te manque '+fmt(c.pr-S.dt)+' DT');S.dt-=c.pr;S.own.push(id);S.char=id;save();sfx('chest');rewardCard([{k:'char',id}],()=>vest());return;}
   const e=EQ(id);if(S.dt<e.pr)return toast('Il te manque '+fmt(e.pr-S.dt)+' DT');S.dt-=e.pr;S.inv[e.id]=1;S.load[e.slot]=e.id;save();sfx('chest');toast(e.n+' acheté et équipé !');vest();}
  else if(a.startsWith('evo:')){const c=CH(a.slice(4)),l=S.clv[c.id]||1,co=CLVC(c,l);if(l>=CLVMAX)return;if(S.dt<co)return toast('Il te manque '+fmt(co-S.dt)+' DT');S.dt-=co;S.clv[c.id]=l+1;save();levelUp(c.id,l+1,()=>vest());}
  else if(a.startsWith('up:')){const e=EQ(a.slice(3)),l=S.inv[e.id],c_=Math.round(e.pr*EQUP(l));if(S.dt<c_)return toast('Il te manque '+fmt(c_-S.dt)+' DT');S.dt-=c_;S.inv[e.id]=l+1;save();sfx('chest');toast(e.n+' niveau '+(l+1)+' !');vest();}
 },false,'vst');
 const s=d.querySelector('.vc.sel');if(s)s.scrollIntoView({inline:'center',block:'nearest'});}
// ----- boutique : personnages, super pouvoirs, améliorations -----
let VST={slot:'boots',sel:null};
function shop(tab){tab=tab||'chars';const T=`<div class="tabs"><button class="tab ${tab==='chars'?'on':''}" data-a="t:chars">👑 Personnages</button><button class="tab ${tab==='sp'?'on':''}" data-a="t:sp">⚡ Super pouvoirs</button><button class="tab ${tab==='gear'?'on':''}" data-a="t:gear">👟 Vestiaire</button><span class="pill"><span class="ico">💵</span><b>${fmt(S.dt)}</b></span></div>`;let body='';
 if(tab==='chars'){body=`<div class="cards">${CHARS.map(c=>{const own=S.own.includes(c.id),sel=S.char===c.id;return `<button class="pc ${sel?'on':''} ${own?'':'lock'}" data-a="h:${c.id}" style="--rc:${RCOL[c.r]}"><div class="rtag">${c.r}</div><canvas data-c="${c.id}" data-k="${c.l78?'ca':S.club}"></canvas><b>${c.n}</b><small>${c.sub}</small><div class="st3"><span>⚡${Math.round(c.spd*100)}</span><span>🦘${Math.round(c.jmp*100)}</span><span>🦶${Math.round(c.kp*100)}</span></div><div class="pp">${own?(sel?'✔ Sélectionné':'Choisir'):'💵 '+fmt(c.pr)}</div></button>`;}).join('')}</div><div class="txt sm">Les personnages s'obtiennent avec des dinars ou, très rarement, dans les coffres. Les légendes de 78 sont les plus difficiles à obtenir.</div>`;}
 else if(tab==='sp'){body=`<div class="txt sm">Équipe jusqu'à 3 super pouvoirs : ils sont en haut à gauche pendant le match et se rechargent à chaque match. Niveau = nombre d'utilisations par match.</div><div class="items">${Object.entries(SP).map(([id,s])=>{const lv=spLvl(id),eq=S.eq.includes(id),pr=Math.round(s.pr*(1+lv*1.5));
  return `<div class="it ${eq?'on':''}"><div class="ic" style="background:${s.c}">${s.e}</div><div class="iw"><b>${s.n}</b><i>${s.d}</i><div class="lv">${[1,2,3].map(i=>`<span class="${i<=lv?'on':''}"></span>`).join('')}</div><div class="row l">${lv<3?`<button class="bt y sm" data-a="b:${id}">${lv?'Niv. '+(lv+1):'Acheter'} • ${fmt(pr)} DT</button>`:''}${lv?`<button class="bt ${eq?'g':'s'} sm" data-a="e:${id}">${eq?'★ Équipé':'Équiper'}</button>`:''}</div></div></div>`;}).join('')}</div>`;}
 else{const sl=VST.slot,list=EQUIP.filter(e=>e.slot===sl);if(!EQ(VST.sel)||EQ(VST.sel).slot!==sl)VST.sel=S.load[sl];const e=EQ(VST.sel),own=S.inv[e.id],lv=own||1,eqd=S.load[sl]===e.id;
  const cur=stats(S.char,myGear()),tryG=Object.assign(myGear(),{[sl]:e.id}),nxt=stats(S.char,tryG);
  const bar=(lab,k,ic)=>{const a=Math.round(cur[k]*100),b=Math.round(nxt[k]*100),df=b-a;return `<div class="sbar"><span>${ic} ${lab}</span><div class="sb"><i style="width:${Math.min(100,(a-80)/70*100)}%"></i>${df>0?`<em style="left:${Math.min(100,(a-80)/70*100)}%;width:${Math.min(100,df/70*100)}%"></em>`:''}</div><b>${a}${df?`<small class="${df>0?'up':'dn'}">${df>0?'+':''}${df}</small>`:''}</b></div>`;};
  const bon=Object.entries(e.b).map(([k,v])=>`${{kp:'Tir',spd:'Vitesse',jmp:'Saut',hd:'Tête'}[k]} +${Math.round(v*(1+.5*(lv-1)))}%`).join(' • ')||'Aucun bonus';
  const upc=own&&lv<5&&e.pr?Math.round(e.pr*EQUP(lv)):0;
  body=`<div class="vest"><div class="vprev"><canvas class="live" data-c="${S.char}" data-try='${JSON.stringify({[sl]:e.id})}'></canvas><div class="podium sm"></div><div class="sbars">${bar('Tir','kp','🦶')}${bar('Vitesse','spd','⚡')}${bar('Saut','jmp','🦘')}${bar('Tête','hd','🧠')}</div></div>
  <div class="vright"><div class="slots">${Object.entries(SLOTS).map(([k,v])=>`<button class="slot ${k===sl?'on':''}" data-a="sl:${k}"><span>${v.e}</span>${v.n}</button>`).join('')}</div>
  <div class="eqgrid">${list.map(x=>`<button class="eqc ${x.id===e.id?'sel':''} ${S.inv[x.id]?'':'lock'}" data-a="v:${x.id}" style="--rc:${RCOL[x.r]}"><canvas data-item="${x.id}"></canvas>${S.load[sl]===x.id?'<span class="eqb">✔</span>':''}${S.inv[x.id]&&x.pr?`<span class="lvb">${'★'.repeat(S.inv[x.id])}</span>`:''}${S.inv[x.id]?'':`<span class="prb">💵 ${fmt(x.pr)}</span>`}</button>`).join('')}</div>
  <div class="vdet" style="--rc:${RCOL[e.r]}"><div><b>${e.n}</b><span class="rt">${e.r}</span>${own&&e.pr?`<span class="lvt">Niveau ${lv}/5</span>`:''}<div class="bon">${bon}</div></div><div class="row">${!own?`<button class="bt y" data-a="buy:${e.id}">Acheter • ${fmt(e.pr)} DT</button>`:eqd?'<span class="tagok">✔ Équipé</span>':`<button class="bt g" data-a="eq:${e.id}">Équiper</button>`}${upc?`<button class="bt" data-a="up:${e.id}">Améliorer • ${fmt(upc)} DT</button>`:''}</div></div></div></div>`;}
 modal(T+body,a=>{if(a==='t:gear')return vest('boots');if(a==='t:chars')return vest('char');if(a.startsWith('t:'))return shop(a.slice(2));
  if(a.startsWith('b:')){const id=a.slice(2),lv=spLvl(id),pr=Math.round(SP[id].pr*(1+lv*1.5));if(S.dt<pr)return toast('Il te manque '+fmt(pr-S.dt)+' DT');S.dt-=pr;S.sp[id]=lv+1;if(!S.eq.includes(id)&&S.eq.length<3)S.eq.push(id);save();sfx('coin');shop('sp');}
  else if(a.startsWith('e:')){const id=a.slice(2);if(S.eq.includes(id))S.eq=S.eq.filter(x=>x!==id);else{if(S.eq.length>=3)return toast('3 super pouvoirs maximum : retire-en un');S.eq.push(id);}save();shop('sp');}
  else if(a.startsWith('h:')){const id=a.slice(2),c=CH(id);if(S.own.includes(id)){S.char=id;save();shop('chars');}else if(S.dt>=c.pr){S.dt-=c.pr;S.own.push(id);S.char=id;save();sfx('chest');rewardCard([{k:'char',id}],()=>shop('chars'));}else toast('Il te manque '+fmt(c.pr-S.dt)+' DT');}
  else if(a.startsWith('sl:')){VST.slot=a.slice(3);VST.sel=S.load[VST.slot];shop('gear');}
  else if(a.startsWith('v:')){VST.sel=a.slice(2);sfx('tap');shop('gear');}
  else if(a.startsWith('eq:')){const e=EQ(a.slice(3));S.load[e.slot]=e.id;save();sfx('chest');toast(e.n+' équipé !');shop('gear');}
  else if(a.startsWith('buy:')){const e=EQ(a.slice(4));if(S.dt<e.pr)return toast('Il te manque '+fmt(e.pr-S.dt)+' DT');S.dt-=e.pr;S.inv[e.id]=1;S.load[e.slot]=e.id;save();sfx('chest');toast(e.n+' acheté et équipé !');shop('gear');}
  else if(a.startsWith('up:')){const e=EQ(a.slice(3)),lv=S.inv[e.id],c_=Math.round(e.pr*EQUP(lv));if(S.dt<c_)return toast('Il te manque '+fmt(c_-S.dt)+' DT');S.dt-=c_;S.inv[e.id]=lv+1;save();sfx('chest');toast(e.n+' niveau '+(lv+1)+' !');shop('gear');}},false,'blue wide');}
function settings(){modal(`<div class="hdr">Paramètres</div><div class="row"><button class="bt ${S.snd?'g':'s'}" data-a="snd">Son : ${S.snd?'oui':'non'}</button><button class="bt ${S.vib?'g':'s'}" data-a="vib">Vibrations : ${S.vib?'oui':'non'}</button></div>
 <div class="row"><input id="nk2" maxlength="14" value="${esc(S.nick)}" style="width:40%"><button class="bt s" data-a="nick">Changer le pseudo</button></div>
 <div class="row"><button class="bt s" data-a="club">Changer de club</button><button class="bt s" data-a="help">Commandes</button><button class="bt s" data-a="demo">Match démo</button><button class="bt s" data-a="legal">Conditions</button>${Ads.ok?'<button class="bt s" data-a="consent">Confidentialité pub</button>':''}</div>
 <div class="txt sm">Bilan : ${S.stats.w} V • ${S.stats.d} N • ${S.stats.l} D • ${S.stats.gf} buts • ${S.ch.titles} titre(s) • V${APP_VERSION} • © 2026 Syphax Apps</div>`,a=>{
 if(a==='snd'){S.snd=S.snd?0:1;save();settings();}else if(a==='vib'){S.vib=S.vib?0:1;save();settings();}
 else if(a==='nick'){const v=document.getElementById('nk2').value.trim().replace(/[<>]/g,'').slice(0,14);if(v.length>=3){S.nick=v;save();toast('Pseudo : '+v);closeModal();home();}}
 else if(a==='club')pickClub(false);else if(a==='help')help();else if(a==='demo')demo();else if(a==='legal')legal(settings);
 else if(a==='consent'){try{const p=Ads.A.showPrivacyOptionsForm();if(p&&p.catch)p.catch(()=>{});}catch(_){}}},false,'blue');}
function help(){modal(`<div class="hdr">Commandes</div><div class="txt">◀ ▶ courir • flèche verte : sauter • chaussure : tir bas • chaussure + flèche : tir haut (lob)<br>Ballon à hauteur de tête : les boutons de tir font une tête.<br>Super pouvoirs : en haut à gauche. Bulle : envoyer un message.<br><br><span class="sm">Clavier : flèches, Espace (saut), X (tir bas), Z (tir haut), 1-2-3 (pouvoirs). Duel à 2 : J1 = A D W S E • J2 = flèches + Entrée.</span></div>`,null,false,'blue');}
function tokScreen(cont){tokSync();const left=ADMAX-(S.adDay===today()?S.adN:0);
 modal(`<div class="hdr">${S.tok>0?'Tes jetons':'Plus de jetons !'}</div><div class="txt" style="font-size:6vh">${'⚽'.repeat(S.tok)||'—'}</div><div class="txt">Chaque match classé coûte 1 jeton. Un jeton se recharge toutes les 15 minutes (maximum ${MAXT}).${S.tok<MAXT?`<br>Prochain jeton dans <b id="tk2" class="y">${mmss(nextTok())}</b>`:''}</div>
 <div class="row"><button class="bt g" data-a="ad" ${left>0?'':'disabled'}>▶ Pub : +1 jeton</button><button class="bt s" data-a="close">Plus tard</button></div><div class="txt sm">${left} pub(s) encore possible(s) aujourd'hui. L'entraînement et le duel à 2 sont gratuits.</div>`,a=>{
 if(a==='ad')watchAd(()=>{S.tok++;save();sfx('coin');toast('+1 jeton ⚽');closeModal();if(cont)cont();else home();});},false,'blue');
 const iv=setInterval(()=>{const e=document.getElementById('tk2');if(!e){clearInterval(iv);return;}tokSync();e.textContent=mmss(nextTok());},1000);}
function needTok(go){tokSync();if(S.tok>0){go();return;}tokScreen(go);}
// ----- modes de jeu -----
function aiGear(d){const R=['commun','rare','épique','légendaire'],maxR=d<.35?0:d<.6?1:d<.85?2:3,lv=Math.max(1,Math.round(d*5)),g={lv:{},clv:Object.fromEntries(CHARS.map(c=>[c.id,d<.5?1:d<.8?2:3]))};
 for(const sl of GSLOTS){const pool=EQUIP.filter(e=>e.slot===sl&&R.indexOf(e.r)<=maxR&&(e.kind||sl==='boots'));const e=pool.length&&Math.random()<.85?pick(pool):EQUIP.find(x=>x.slot===sl);g[sl]=e.id;g.lv[e.id]=lv;}return g;}
function aiSps(d){const n=d<.3?0:d<.6?1:2;return Object.keys(SP).sort(()=>Math.random()-.5).slice(0,n);}
function oppFor(div){const d=clamp(.2+(10-div)*.075+(Math.random()-.5)*.08,.15,.95);const cl=CLUBS[Math.random()*CLUBS.length|0];const pool=CHARS.filter(c=>c.pr<=1000+(10-div)*1400);return {name:pick(NICKS),club:cl.id,char:pick(pool).id,ai:d,lv:Math.max(1,S.lvl+Math.round((Math.random()-.5)*4))};}
function me(o){return Object.assign({c1:S.char,k1:S.club,n1:S.nick,g1:myGear(),lv1:S.lvl},o);}
function champScreen(){const C=S.ch,D=DIVS[C.div];let lad='';for(let i=10;i>=1;i--)lad+=`<div class="ld ${i===C.div?'on':i>C.div?'done':''}">${i}</div>`;
 const max=Math.max(30,D.pr);const pct=v=>Math.min(100,v/max*100);let dots='';for(let i=0;i<10;i++){const r=C.res[i];dots+=`<div class="dot ${r?r.r:''}">${r?r.s:i+1}</div>`;}
 const goal=C.div===1?`Division 1 : <b class="y">24 pts</b> sur 10 matchs pour garder sa place et gagner le titre, sinon retour en Division 2.`:`Montée dès <b class="y">${D.pr} pts</b>${D.rl!=null?` • relégation sous <b class="r">${D.rl} pts</b> après 10 matchs`:' • pas de relégation en Division 10'}.`;
 modal(`<div class="hdr">Championnat</div><div class="ladder">${lad}</div><div class="bar"><i style="width:${pct(C.pts)}%"></i><div class="mk" style="left:${pct(D.pr)}%"></div>${D.rl!=null&&C.div!==1?`<div class="mk r" style="left:${pct(D.rl)}%"></div>`:''}</div><div class="dots">${dots}</div>
 <div class="txt">${goal}<br>Saison : ${C.played}/10 matchs • ${C.pts} pts (victoire 3, nul 1)</div>
 <div class="row"><button class="bt g big" data-a="play">📯 Jouer le match ${C.played+1} (1 ⚽)</button></div>`,a=>{if(a==='play')needTok(()=>{const o=oppFor(C.div);const h=Math.random()<.5;
  launch(me({mode:'champ',cost:1,c2:o.char,k2:o.club,n2:o.name,lv2:o.lv,ai2:o.ai,g2:aiGear(o.ai),aiSp:aiSps(o.ai),venue:{t:'stade',n:CL(h?S.club:o.club).st},label:`Division ${C.div} • Match ${C.played+1}/10`}));});},false,'blue');}
function derbyScreen(){const d=derbyNow(),a=CL(d[0]),b=CL(d[1]),mine=inDerby(S.club);const riv=mine?CL(d[0]===S.club?d[1]:d[0]):null;
 modal(`<div class="hdr">🔥 ${d[2]} 🔥</div><div class="vs"><div class="sd">${shieldSVG(a)}<b>${a.n}</b></div><div class="v">VS</div><div class="sd">${shieldSVG(b)}<b>${b.n}</b></div></div>
 <div class="txt">Semaine de derby : tous les points gagnés par les fans de ces deux clubs comptent <b class="y">double</b> au classement. Fin dans ${dur(derbyEnds())}.</div>
 <div class="row">${mine?`<button class="bt g big" data-a="play">Jouer le derby contre ${riv.s} (1 ⚽)</button>`:`<div class="txt sm">${CL(S.club).s} n'est pas concerné cette semaine. Les derbies changent chaque lundi !</div>`}</div>`,x=>{if(x==='play')needTok(()=>{const ai=clamp(.35+(10-S.ch.div)*.05,.35,.9);launch(me({mode:'derby',cost:1,c2:pick(CHARS.filter(c=>!c.l78)).id,k2:riv.id,n2:'Ultras '+riv.s,lv2:S.lvl+1,ai2:ai,g2:aiGear(ai),aiSp:aiSps(ai),venue:{t:'stade',n:a.st},label:d[2]}));});},false,'blue');}
function tableScreen(){const T=clubTable();const now=new Date(),end=new Date(now.getFullYear(),now.getMonth()+1,1);
 const rows=T.map((r,i)=>`<tr class="${r.c.id===S.club?'me':''}"><td>${i+1}</td><td class="sh">${shieldSVG(r.c)}</td><td>${r.c.n}${inDerby(r.c.id)?' 🔥×2':''}</td><td class="n">${fmt(r.p)}</td></tr>`).join('');
 modal(`<div class="hdr">Classement des clubs – ${MOIS[now.getMonth()]}</div><div class="white scroll"><table>${rows}</table></div><div class="txt sm">Victoire = 3 pts pour ton club, nul = 1 pt (×2 pendant le derby). Ta contribution : <b class="y">${S.contrib} pts</b> • fin de saison dans ${dur(end-now)}.</div>`,null,false,'blue');}
let QS={opp:null,diff:1,ven:'auto'};
function quickScreen(){const diffs=['Facile','Moyen','Difficile','Légende'];const vens=[['auto','Stade adverse'],['mine','Mon stade'],...VAGUES.map((v,i)=>['v'+i,v.n.replace('Terrain vague – ','')])];
 const render=()=>modal(`<div class="hdr">Match rapide</div><div class="clubs">${CLUBS.map(c=>`<button class="cb ${QS.opp===c.id?'on':''}" data-a="o:${c.id}">${shieldSVG(c)}<span>${c.s}</span></button>`).join('')}</div>
 <div class="sel">${diffs.map((d,i)=>`<button class="opt ${QS.diff===i?'on':''}" data-a="d:${i}">${d}</button>`).join('')}</div><div class="sel">${vens.map(v=>`<button class="opt sm ${QS.ven===v[0]?'on':''}" data-a="v:${v[0]}">${v[1]}</button>`).join('')}</div>
 <div class="row"><button class="bt g big" data-a="go">Jouer (1 ⚽)</button></div>`,a=>{
  if(a.startsWith('o:')){QS.opp=a.slice(2);render();}else if(a.startsWith('d:')){QS.diff=+a.slice(2);render();}else if(a.startsWith('v:')){QS.ven=a.slice(2);render();}
  else if(a==='go')needTok(()=>{const opp=QS.opp||pick(CLUBS.filter(c=>c.id!==S.club)).id;const venue=QS.ven==='auto'?{t:'stade',n:CL(opp).st}:QS.ven==='mine'?{t:'stade',n:CL(S.club).st}:VAGUES[+QS.ven.slice(1)];const ai=[.3,.55,.78,.95][QS.diff];
   launch(me({mode:'quick',cost:1,c2:pick(CHARS.filter(c=>!c.l78||QS.diff===3)).id,k2:opp,n2:pick(NICKS),lv2:S.lvl+QS.diff-1,ai2:ai,g2:aiGear(ai),aiSp:aiSps(ai),venue,label:'Match rapide • '+diffs[QS.diff]}));});},false,'blue');render();}
function trainSetup(){return me({mode:'train',cost:0,noVs:1,c2:pick(CHARS.slice(0,4)).id,k2:pick(CLUBS).id,n2:'Weld el 7ouma',ai2:.35,venue:pick(VAGUES),label:'Entraînement'});}
function duoScreen(){let c2=pick(CLUBS.filter(c=>c.id!==S.club)).id,h2=pick(CHARS.filter(c=>!c.l78)).id;
 const render=()=>modal(`<div class="hdr">Duel à 2</div><div class="clubs">${CLUBS.map(c=>`<button class="cb ${c2===c.id?'on':''}" data-a="o:${c.id}">${shieldSVG(c)}<span>${c.s}</span></button>`).join('')}</div><div class="sel">${CHARS.filter(c=>!c.l78).map(c=>`<button class="opt sm ${h2===c.id?'on':''}" data-a="h:${c.id}">${c.n}</button>`).join('')}</div><div class="row"><button class="bt g big" data-a="go">Jouer (gratuit)</button></div>`,a=>{
  if(a.startsWith('o:')){c2=a.slice(2);render();}else if(a.startsWith('h:')){h2=a.slice(2);render();}else if(a==='go'){closeModal();startMatch({mode:'duo',duo:1,noVs:1,cost:0,c1:S.char,k1:S.club,n1:'Joueur 1',g1:myGear(),c2:h2,k2:c2,n2:'Joueur 2',venue:pick([...VAGUES,{t:'stade',n:CL(S.club).st}]),label:'Duel à 2'});}},false,'blue');render();}
function launch(o){if(o.cost&&!spendTok()){tokScreen();return;}closeModal();startMatch(o);}
function startMatch(o){ui.classList.add('hide');closeModal();au();newMatch(o);}
// ----- écran de résultat -----
function results(o,sc,res,ev,P2){const st=S.stats;let dt=0,xp=0,fans=0,ex='',got=[];
 if(o.mode!=='duo'&&o.mode!=='train'){st[res==='W'?'w':res==='D'?'d':'l']++;st.gf+=sc[0];st.ga+=sc[1];S.form.push(res);S.form=S.form.slice(-5);}
 if(o.cost){dt=(res==='W'?50:res==='D'?20:8)+sc[0]*4;if(o.mode==='champ')dt+=(10-S.ch.div)*3;xp=res==='W'?100:res==='D'?50:25;
  fans=(res==='W'?3:res==='D'?1:0)*(inDerby(S.club)?2:1);S.contrib+=fans;
  got=missionEvents({win:res==='W'?1:0,goal:ev.goal,head:ev.head,high:ev.high,sp:ev.sp,play:1,clean:res==='W'&&sc[1]===0?1:0});}
 else if(o.mode==='train'){xp=10;}
 if(o.mode==='champ'){const C=S.ch;C.played++;C.pts+=res==='W'?3:res==='D'?1:0;C.res.push({r:res,s:sc[0]+'-'+sc[1]});const D=DIVS[C.div];
  if(C.div>1&&C.pts>=D.pr){ex=`⬆ Montée en Division ${C.div-1} ! Coffre en or`;S.chests.push('or');C.div--;C.best=Math.min(C.best,C.div);C.played=0;C.pts=0;C.res=[];C.seasons++;}
  else if(C.played>=10){if(C.div===1){if(C.pts>=24){ex='🏆 Champion de Division 1 ! 2 coffres en or';S.chests.push('or','or');C.titles++;}else{ex='⬇ Relégation en Division 2…';C.div=2;}}
   else if(D.rl!=null&&C.pts<D.rl){ex=`⬇ Relégation en Division ${C.div+1}…`;C.div++;}else ex=`Maintien en Division ${C.div} : nouvelle saison !`;C.played=0;C.pts=0;C.res=[];C.seasons++;}}
 S.dt+=dt;const ups=addXp(xp);save();
 const title=o.duo?(sc[0]>sc[1]?'Joueur 1 gagne':sc[0]<sc[1]?'Joueur 2 gagne':'Match nul'):res==='W'?'Tu as gagné':res==='L'?'Tu as perdu':'Match nul';
 const row=(ic,v,k)=>v?`<div class="rrow"><span class="ri">${ic}</span><b>+${fmt(v)}</b>${adAllowed()?`<button class="x2" data-a="x2:${k}">▶ 2x</button>`:''}</div>`:'';
 const msHTML=S.mis.list.map(m=>`<div class="mside ${m.c?'ok':''}"><b>${m.t}</b><div class="xpb"><i style="width:${m.p/m.n*100}%"></i><span>${m.p}/${m.n}</span></div></div>`).join('');
 modal(`<div class="res"><div class="ml">${o.cost?msHTML:''}</div><div class="rp"><h2 class="ttl ${res==='W'||o.duo?'g':res==='L'?'r':''}">${title}</h2><div class="sc">${sc[0]}-${sc[1]}</div>
  <div class="por l"><canvas data-c="${o.c1}" data-k="${o.k1}"></canvas><div class="np">${esc(o.n1)}</div></div><div class="por r"><canvas data-c="${o.c2}" data-k="${o.k2}"></canvas><div class="np">${esc(o.n2)}</div></div>
  <div class="rows">${row('💵',dt,'dt')}${row('📣',fans,'fans')}${row('⭐',xp,'xp')}</div>
  ${ex||got.length||ups.length?`<div class="ex">${ex?ex+'<br>':''}${got.map(t=>'✅ '+t+' → coffre').join('<br>')}${ups.length?'<br>⭐ Niveau '+ups[ups.length-1]+' ! Coffre gagné':''}</div>`:''}
  <div class="rb2"><button class="sq y" data-a="menu">🏠</button>${S.chests.length?`<button class="sq b" data-a="chest">🎁<span class="badge">${S.chests.length}</span></button>`:''}<div class="sp"></div>${o.mode==='champ'?'':`<button class="sq y" data-a="again">↻</button>`}<button class="bt g big" data-a="next">📯 Jouer</button></div></div></div>`,x=>{
  if(x.startsWith('x2:')){const k=x.slice(3);watchAd(()=>{if(k==='dt')S.dt+=dt;else if(k==='xp')addXp(xp);else{S.contrib+=fans;}save();sfx('coin');toast('Gain doublé !');const bt=document.querySelector(`[data-a="x2:${k}"]`);if(bt)bt.outerHTML='<span class="x2 done">✔ 2x</span>';});}
  else if(x==='chest')openChest();else if(x==='next'){if(o.mode==='duo'){startMatch(o);return;}if(o.mode==='train'){startMatch(trainSetup());return;}champScreen();}
  else if(x==='again'){if(o.mode==='train'){startMatch(trainSetup());return;}if(o.duo){startMatch(o);return;}needTok(()=>launch(Object.assign({},o)));}
  else if(x==='menu'){closeModal();home();}},true,'teal');
 if(dt)sfx('coin');}
// ================= DÉMARRAGE =================
function setOrient(o){try{const P=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.ScreenOrientation;if(P){const r=P.lock({orientation:o});if(r&&r.catch)r.catch(()=>{});return;}}catch(e){}try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock(o).catch(()=>{});}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(M&&M.state==='play')pauseMatch();crowd(false);}else{tokSync();if(M&&!M.paused&&M.state!=='vs')crowd(true);}});
try{if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App)window.Capacitor.Plugins.App.addListener('backButton',()=>{if(INTRO)introTap();else if(M)pauseMatch();else if(document.getElementById('mdl')&&!modalLock){closeModal();refreshHome();}else home();});}catch(e){}
resize();setOrient('landscape');Ads.init();
Promise.race([Promise.all([document.fonts.load('20px "Lilita One"'),document.fonts.load('20px "Luckiest Guy"')]),new Promise(r=>setTimeout(r,1500))]).then(()=>{startIntro();requestAnimationFrame(loop);});
try{if('serviceWorker' in navigator&&location.protocol==='https:'&&!window.Capacitor)navigator.serviceWorker.register('sw.js');}catch(e){}
