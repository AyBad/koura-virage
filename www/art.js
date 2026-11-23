// ================= KOURA VIRAGE – DESSIN (style cartoon) =================
const FONT='"Lilita One","Arial Black",Arial,sans-serif',FONT2='"Luckiest Guy","Lilita One","Arial Black",sans-serif';
const OUT='#1a0e06';
function rrc(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function fillStroke(c,fill,lw){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();}
function grad(c,x0,y0,x1,y1,a,b){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function rgrad(c,x,y,r,a,b){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.05);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function textOut(c,t,x,y,size,fill,stroke,lw,font){c.font=size+'px '+(font||FONT);c.lineJoin='round';c.lineWidth=lw||Math.max(3,size*.16);c.strokeStyle=stroke||OUT;c.strokeText(t,x,y);c.fillStyle=fill||'#fff';c.fillText(t,x,y);}

// texte en relief façon dessin animé (extrusion + dégradé + reflet)
function text3D(c,t,x,y,size,top,bot,side,font){c.font=size+'px '+(font||FONT2);c.lineJoin='round';c.textBaseline='alphabetic';const d=Math.max(3,Math.round(size*.1)),lw=Math.max(4,size*.17);
 c.lineWidth=lw;c.strokeStyle=OUT;c.strokeText(t,x,y+d);c.fillStyle=side;for(let i=d;i>0;i--)c.fillText(t,x,y+i);
 c.strokeText(t,x,y);const gr=c.createLinearGradient(0,y-size*.8,0,y);gr.addColorStop(0,top);gr.addColorStop(1,bot);c.fillStyle=gr;c.fillText(t,x,y);
 c.save();c.beginPath();c.rect(x-2000,y-size*.85,4000,size*.32);c.clip();c.fillStyle='#ffffff55';c.fillText(t,x,y);c.restore();}
// ---------- Écusson (SVG, aux couleurs du club) ----------
function shieldSVG(c,uid){uid=uid||c.id+Math.random().toString(36).slice(2,6);const P='M50 4 L92 16 L92 52 Q92 88 50 108 Q8 88 8 52 L8 16 Z';let inner='';const a=c.c1,b=c.c2;
 if(c.p==='rayures')inner=`<rect width="100" height="112" fill="${a}"/>`+[22,44,66].map(x=>`<rect x="${x}" width="12" height="112" fill="${b}"/>`).join('');
 else if(c.p==='bande')inner=`<rect width="100" height="112" fill="${a}"/><rect y="42" width="100" height="22" fill="${b}"/>`;
 else if(c.p==='moitie')inner=`<rect width="100" height="112" fill="${a}"/><rect x="50" width="50" height="112" fill="${b}"/>`;
 else if(c.p==='diag')inner=`<rect width="100" height="112" fill="${a}"/><polygon points="0,30 0,62 100,112 100,80" fill="${b}"/>`;
 else if(c.p==='chevron')inner=`<rect width="100" height="112" fill="${a}"/><polygon points="8,40 50,70 92,40 92,62 50,92 8,62" fill="${b}"/>`;
 else if(c.p==='etoile')inner=`<rect width="100" height="112" fill="${a}"/><polygon points="50,24 58,46 82,46 63,60 70,83 50,69 30,83 37,60 18,46 42,46" fill="${b}"/>`;
 else if(c.p==='cercle')inner=`<rect width="100" height="112" fill="${a}"/><circle cx="50" cy="54" r="22" fill="${b}"/><circle cx="50" cy="54" r="11" fill="${a}"/>`;
 else if(c.p==='quart')inner=`<rect width="100" height="112" fill="${a}"/><rect x="50" width="50" height="56" fill="${b}"/><rect y="56" width="50" height="56" fill="${b}"/>`;
 return `<svg viewBox="0 0 100 112"><defs><clipPath id="k${uid}"><path d="${P}"/></clipPath><linearGradient id="h${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#k${uid})">${inner}<rect width="100" height="112" fill="url(#h${uid})"/></g><path d="${P}" fill="none" stroke="#1a0e06" stroke-width="7"/><path d="${P}" fill="none" stroke="#fff" stroke-width="2.5" transform="translate(50 56) scale(.86) translate(-50 -56)"/></svg>`;}
let SHC={};
function shieldImg(club){if(SHC[club.id])return SHC[club.id];const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(shieldSVG(club).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="100" height="112" '));SHC[club.id]=im;return im;}

// ---------- Tête cartoon ----------
// ---------- images illustrées (objets, boutons) ----------
const IMG={};function img(p){let im=IMG[p];if(!im){im=IMG[p]=new Image();im.onload=()=>{HREADY++;};im.src=p;}return (im.complete&&im.naturalWidth)?im:null;}
const EQI=id=>EQ_HAS.has(id)?img('img/eq/'+id+'.webp'):null;
const EQ_HAS=new Set(['b_base','b_medina','b_jasmin','b_harissa','b_sahara','b_neptune','b_fluo','b_carthage','h_casq','h_bob','h_mdhalla','h_bonnet','h_laurier','h_chechia','g_sun','g_ronde','g_sport','g_ski','g_star','s_rb','s_nb','s_tn','s_jn','s_vb','s_kef','ba_cl','ba_zel','ba_ice','ba_volt','ba_fire','ba_or']);EQ_HAS.forEach(id=>img('img/eq/'+id+'.webp'));
['left','right','jump','kick','lob','pause'].forEach(n=>img('img/ui/'+n+'.webp'));
// ---------- têtes illustrées (4 expressions : neutre, cri, sonné, joie) ----------
const HIMG={};let HREADY=0;
function loadHeads(ids){for(const id of ids){if(HIMG[id])continue;HIMG[id]=[0,1,2,3].map(i=>{const im=new Image();im.onload=()=>{HREADY++;};im.src='img/h/'+id+'_'+i+'.webp';return im;});}}
const hasHead=id=>{const a=HIMG[id];return !!(a&&a[0].complete&&a[0].naturalWidth);};
function drawHeadImg(c,ch,x,y,r,face,o){const a=HIMG[ch.id];const idx=o.mood==='joy'?3:(o.mood==='sad'||o.stun||o.frozen)?2:(o.mouth==='open'||o.mood==='angry')?1:0;
 let im=a[idx];if(!(im.complete&&im.naturalWidth))im=a[0];const h=r*2.5,w=h*im.naturalWidth/im.naturalHeight,b0=a[0],w0=h*b0.naturalWidth/b0.naturalHeight;
 c.save();c.translate(x,y);c.scale(face,1);c.drawImage(im,-w*.5,-r*1.15,w,h);
 if(o.frozen){c.globalAlpha=.38;c.fillStyle='#bfefff';c.beginPath();c.ellipse(0,r*.05,r*1.05,r*1.2,0,0,7);c.fill();c.globalAlpha=1;}
 const lw=Math.max(2,r*.085);
 if(o.glasses&&o.glasses.kind){const gi=EQI(o.glasses.id);if(gi){const w=r*1.5,h=w*gi.naturalHeight/gi.naturalWidth;c.drawImage(gi,-r*.3,-r*.2-h/2,w,h);}else{c.save();c.translate(r*.12,r*.02);drawGlasses(c,o.glasses,r*.95,-r*.12,lw);c.restore();}}
 if(o.hat&&o.hat.kind){const hi=EQI(o.hat.id);if(hi){const w=r*(o.hat.id==='h_mdhalla'?2.5:2.05),h=w*hi.naturalHeight/hi.naturalWidth;c.drawImage(hi,-w*.5+r*.05,-r*.62-h*.78,w,h);}else{c.save();c.translate(-r*.05,-r*.2);drawHat(c,o.hat,r,lw);c.restore();}}
 c.restore();}
function drawHead(c,ch,x,y,r,face,o){o=o||{};if(hasHead(ch.id))return drawHeadImg(c,ch,x,y,r,face,o);c.save();c.translate(x,y);c.scale(face,1);c.lineJoin='round';c.lineCap='round';
 const lw=Math.max(2,r*.085),sk=ch.sk,hc=ch.hc||'#1d120a',skD=shade(sk,-.28),hatOn=!!(o.hat&&o.hat.kind);
 // éléments derrière la tête
 if(ch.h==='couronne'||ch.h==='longs70'){c.beginPath();c.moveTo(-r*.95,-r*.2);c.quadraticCurveTo(-r*1.25,r*.9,-r*.55,r*1.05);c.lineTo(r*.1,r*.6);c.lineTo(-r*.2,-r*.6);c.closePath();fillStroke(c,grad(c,0,-r,0,r,shade(hc,.15),hc),lw);}
 if(ch.h==='tresses'){for(const dx of [-.62,-.3]){for(let i=0;i<5;i++){c.beginPath();c.ellipse(r*dx,r*(.35+i*.26),r*.14,r*.16,0,0,7);fillStroke(c,hc,lw*.6);}}}
 if(ch.h==='coiffe'&&!hatOn){c.beginPath();c.moveTo(-r*1.02,-r*.3);c.quadraticCurveTo(-r*1.35,r*.8,-r*.7,r*1.12);c.lineTo(-r*.2,r*.3);c.closePath();fillStroke(c,grad(c,0,-r,0,r,'#9b4fe0','#5a1f99'),lw);}
 if(ch.h==='turban'&&!hatOn){c.beginPath();c.moveTo(-r*.9,0);c.quadraticCurveTo(-r*1.25,r*.6,-r*.9,r*.95);c.lineTo(-r*.55,r*.2);c.closePath();fillStroke(c,'#efe9dc',lw);}
 // oreille
 c.beginPath();c.ellipse(-r*.5,r*.08,r*.17,r*.23,-.15,0,7);fillStroke(c,sk,lw);c.beginPath();c.ellipse(-r*.5,r*.08,r*.08,r*.12,0,0,7);c.fillStyle=skD;c.fill();
 // crâne + mâchoire
 c.beginPath();c.moveTo(-r*.92,-r*.1);c.bezierCurveTo(-r*.95,-r*1.05,r*.85,-r*1.12,r*.92,-r*.15);c.bezierCurveTo(r*1.02,r*.35,r*.82,r*.95,r*.35,r*1.0);c.bezierCurveTo(-r*.25,r*1.05,-r*.88,r*.75,-r*.92,-r*.1);c.closePath();
 const hg=c.createRadialGradient(-r*.15,-r*.45,r*.1,0,0,r*1.15);hg.addColorStop(0,shade(sk,.22));hg.addColorStop(.6,sk);hg.addColorStop(1,skD);fillStroke(c,hg,lw);
 // joue
 c.fillStyle='#ff6b6b22';c.beginPath();c.ellipse(r*.38,r*.35,r*.22,r*.14,0,0,7);c.fill();
 // peintures de guerre
 if(ch.paint){c.fillStyle='#d01818';c.fillRect(r*.05,r*.12,r*.55,r*.07);c.fillRect(r*.1,r*.25,r*.45,r*.06);}
 // barbe
 if(ch.bd==='court'){c.beginPath();c.moveTo(-r*.55,r*.25);c.quadraticCurveTo(-r*.5,r*.95,r*.3,r*.98);c.quadraticCurveTo(r*.85,r*.9,r*.9,r*.35);c.quadraticCurveTo(r*.55,r*.72,r*.15,r*.7);c.quadraticCurveTo(-r*.25,r*.65,-r*.55,r*.25);c.fillStyle=hc;c.globalAlpha=.88;c.fill();c.globalAlpha=1;c.lineWidth=lw*.7;c.strokeStyle=OUT;c.stroke();}
 if(ch.bd==='long'){c.beginPath();c.moveTo(-r*.6,r*.2);c.quadraticCurveTo(-r*.55,r*1.45,r*.35,r*1.5);c.quadraticCurveTo(r*1.0,r*1.1,r*.92,r*.35);c.quadraticCurveTo(r*.5,r*.72,r*.1,r*.68);c.quadraticCurveTo(-r*.3,r*.62,-r*.6,r*.2);fillStroke(c,grad(c,0,0,0,r*1.5,ch.bdc||hc,shade(ch.bdc||hc,-.25)),lw*.8);}
 // cheveux / couvre-chefs
 const H=hatOn&&['chechia','chechia2','casque','turban','coiffe','couronne'].includes(ch.h)?'court':ch.h;
 if(H==='chechia'||H==='chechia2'){c.beginPath();c.moveTo(-r*.78,-r*.42);c.quadraticCurveTo(-r*.8,-r*1.32,0,-r*1.32);c.quadraticCurveTo(r*.8,-r*1.32,r*.74,-r*.48);c.quadraticCurveTo(0,-r*.66,-r*.78,-r*.42);fillStroke(c,grad(c,0,-r*1.3,0,-r*.4,'#e8302f','#981012'),lw);
  c.fillStyle='#ffffff30';c.beginPath();c.ellipse(-r*.3,-r*1.05,r*.25,r*.1,-.3,0,7);c.fill();
  c.strokeStyle='#111';c.lineWidth=r*.09;c.beginPath();c.moveTo(-r*.05,-r*1.3);c.quadraticCurveTo(-r*.55,-r*1.42,-r*.72,-r*.95);c.stroke();c.beginPath();c.arc(-r*.72,-r*.88,r*.11,0,7);c.fillStyle='#111';c.fill();
  c.beginPath();c.moveTo(-r*.92,-r*.3);c.quadraticCurveTo(-r*.9,-r*.6,-r*.75,-r*.45);c.lineTo(-r*.72,-r*.1);c.closePath();fillStroke(c,hc,lw*.6);}
 else if(H==='raie'||H==='court'){c.beginPath();c.moveTo(-r*.94,-r*.05);c.bezierCurveTo(-r*1.0,-r*1.15,r*.75,-r*1.25,r*.9,-r*.45);c.quadraticCurveTo(r*.45,-r*.75,r*.05,-r*.72);c.quadraticCurveTo(-r*.4,-r*.65,-r*.62,-r*.35);c.lineTo(-r*.7,-r*.02);c.closePath();fillStroke(c,grad(c,0,-r*1.2,0,-r*.3,shade(hc,.2),hc),lw);
  if(H==='raie'){c.strokeStyle=shade(hc,.35);c.lineWidth=r*.05;c.beginPath();c.moveTo(r*.05,-r*1.02);c.quadraticCurveTo(r*.4,-r*.95,r*.75,-r*.6);c.stroke();}}
 else if(H==='afro'||H==='boucles'){const big=H==='afro'?1.25:1.02;c.fillStyle=hc;c.strokeStyle=OUT;c.lineWidth=lw*.8;const pts=[];for(let i=0;i<13;i++){const a=Math.PI*.92+i*Math.PI*.105;pts.push([Math.cos(a)*r*.92*big,Math.sin(a)*r*.92*big-r*(big-1)*.6]);}
  for(const [px,py] of pts){c.beginPath();c.arc(px,py,r*.3*big,0,7);c.fill();c.stroke();}for(const [px,py] of pts){c.beginPath();c.arc(px*.92,py*.92,r*.27*big,0,7);c.fill();}
  c.beginPath();c.ellipse(0,-r*.55*big,r*.85*big,r*.5*big,0,0,7);c.fill();c.fillStyle=shade(hc,.25);for(let i=0;i<6;i++){c.beginPath();c.arc(-r*.5+i*r*.2,-r*(.8+(i%2)*.15)*big,r*.06,0,7);c.fill();}
  if(ch.diad){c.fillStyle='#ffc400';c.fillRect(-r*.9,-r*.5,r*1.75,r*.13);c.strokeRect(-r*.9,-r*.5,r*1.75,r*.13);c.fillStyle='#e70013';c.beginPath();c.arc(r*.2,-r*.44,r*.07,0,7);c.fill();}}
 else if(H==='longs70'){c.beginPath();c.moveTo(-r*.95,0);c.bezierCurveTo(-r*1.05,-r*1.2,r*.85,-r*1.25,r*.92,-r*.35);c.quadraticCurveTo(r*.5,-r*.62,r*.1,-r*.55);c.quadraticCurveTo(-r*.3,-r*.5,-r*.55,-r*.2);c.closePath();fillStroke(c,grad(c,0,-r*1.2,0,0,shade(hc,.2),hc),lw);}
 else if(H==='couronne'){c.beginPath();c.moveTo(-r*.95,-r*.05);c.bezierCurveTo(-r*1.0,-r*1.1,r*.8,-r*1.2,r*.9,-r*.4);c.quadraticCurveTo(r*.3,-r*.62,-r*.2,-r*.5);c.quadraticCurveTo(-r*.6,-r*.35,-r*.75,0);c.closePath();fillStroke(c,grad(c,0,-r,0,0,shade(hc,.2),hc),lw);
  c.beginPath();c.moveTo(-r*.78,-r*.6);for(let i=0;i<5;i++){c.lineTo(-r*.78+i*r*.36+r*.18,-r*1.38);c.lineTo(-r*.78+(i+1)*r*.36,-r*.86);}c.lineTo(r*1.02,-r*.62);c.closePath();fillStroke(c,grad(c,0,-r*1.4,0,-r*.6,'#fff2a0','#d99a00'),lw*.8);
  [['#e70013',.18],['#2c6fe0',-.38],['#2cc26b',.62]].forEach(([cc,dx])=>{c.beginPath();c.arc(r*dx,-r*.76,r*.08,0,7);c.fillStyle=cc;c.fill();});}
 else if(H==='casque'){c.beginPath();c.moveTo(-r*1.0,-r*.82);c.quadraticCurveTo(-r*.25,-r*2.1,r*.82,-r*1.0);c.quadraticCurveTo(-r*.05,-r*1.42,-r*1.0,-r*.82);fillStroke(c,grad(c,0,-r*2,0,-r*.8,shade(ch.crest,.3),ch.crest),lw);
  c.strokeStyle=shade(ch.crest,-.35);c.lineWidth=r*.045;for(let i=0;i<6;i++){const t=i/5;c.beginPath();c.moveTo(-r*.78+t*r*1.45,-r*1.02-Math.sin(t*Math.PI)*r*.25);c.lineTo(-r*.7+t*r*1.45,-r*1.4-Math.sin(t*Math.PI)*r*.35);c.stroke();}
  c.beginPath();c.arc(0,-r*.12,r*1.08,Math.PI*.97,Math.PI*2.03);c.closePath();fillStroke(c,grad(c,0,-r*1.2,0,-r*.1,'#ffd77a','#9a6414'),lw);
  c.fillStyle='#ffffff55';c.beginPath();c.ellipse(-r*.35,-r*.78,r*.38,r*.12,-.4,0,7);c.fill();
  c.beginPath();rrc(c,-r*1.04,-r*.27,r*2.08,r*.18,r*.06);fillStroke(c,'#7a4c0e',lw*.7);
  c.beginPath();c.moveTo(-r*.85,-r*.12);c.lineTo(-r*.46,-r*.12);c.lineTo(-r*.5,r*.52);c.quadraticCurveTo(-r*.75,r*.6,-r*.88,r*.35);c.closePath();fillStroke(c,grad(c,0,0,0,r*.6,'#f2c35a','#9a6414'),lw*.8);
  c.beginPath();c.moveTo(r*.62,-r*.12);c.lineTo(r*.8,-r*.12);c.lineTo(r*.76,r*.22);c.closePath();fillStroke(c,'#c08a2a',lw*.6);}
 else if(H==='turban'){c.beginPath();c.ellipse(0,-r*.6,r*1.1,r*.66,0,Math.PI,0);c.lineTo(r*1.06,-r*.42);c.quadraticCurveTo(0,-r*.22,-r*1.06,-r*.42);c.closePath();fillStroke(c,grad(c,0,-r*1.3,0,-r*.3,'#ffffff','#d8d0c0'),lw);
  c.strokeStyle='#bfb49e';c.lineWidth=r*.06;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-r*.95,-r*(.5+i*.25));c.quadraticCurveTo(0,-r*(.85+i*.25),r*.95,-r*(.5+i*.25));c.stroke();}
  c.beginPath();c.arc(r*.1,-r*1.18,r*.14,0,7);fillStroke(c,'#2cc26b',lw*.6);}
 else if(H==='tresses'){c.beginPath();c.moveTo(-r*.95,0);c.bezierCurveTo(-r*1.0,-r*1.15,r*.85,-r*1.2,r*.92,-r*.4);c.quadraticCurveTo(0,-r*.7,-r*.7,-r*.15);c.closePath();fillStroke(c,grad(c,0,-r,0,0,shade(hc,.25),hc),lw);
  c.beginPath();rrc(c,-r*.96,-r*.66,r*1.9,r*.18,r*.05);fillStroke(c,'#c4161c',lw*.6);c.fillStyle='#ffd200';for(let i=0;i<6;i++){c.beginPath();c.moveTo(-r*.8+i*r*.3,-r*.62);c.lineTo(-r*.7+i*r*.3,-r*.52);c.lineTo(-r*.6+i*r*.3,-r*.62);c.fill();}}
 else if(H==='coiffe'){c.beginPath();c.arc(0,-r*.12,r*1.06,Math.PI*1.0,Math.PI*2.0);c.quadraticCurveTo(0,-r*.55,-r*1.06,-r*.12);fillStroke(c,grad(c,0,-r*1.2,0,-r*.2,'#b46cf0','#6a25b0'),lw);
  c.fillStyle='#ffc400';for(let i=0;i<8;i++){c.beginPath();c.arc(-r*.88+i*r*.25,-r*.4-Math.abs(i-3.5)*r*.025,r*.085,0,7);c.fill();c.lineWidth=lw*.4;c.strokeStyle=OUT;c.stroke();}
  c.beginPath();c.arc(r*.05,-r*.95,r*.13,0,7);fillStroke(c,'#e70013',lw*.6);}
 if(hatOn)drawHat(c,o.hat,r,lw);
 // yeux (3/4 profil)
 const lx=Math.max(-1,Math.min(1,o.lx||.5)),ly=Math.max(-1,Math.min(1,o.ly||0)),ey=-r*.12;
 const eyes=[[r*.2,r*.2],[r*.62,r*.17]];
 if(ch.patch){eyes.pop();}
 eyes.forEach(([ex,er])=>{if(o.blink&&!o.stun){c.lineWidth=lw;c.strokeStyle=OUT;c.beginPath();c.moveTo(ex-er,ey);c.quadraticCurveTo(ex,ey+er*.7,ex+er,ey);c.stroke();return;}c.beginPath();c.ellipse(ex,ey,er,er*1.18,0,0,7);fillStroke(c,'#fff',lw*.7);
  if(o.stun){c.lineWidth=lw*.7;c.beginPath();c.moveTo(ex-er*.55,ey-er*.55);c.lineTo(ex+er*.55,ey+er*.55);c.moveTo(ex+er*.55,ey-er*.55);c.lineTo(ex-er*.55,ey+er*.55);c.stroke();}
  else{const ix=ex+lx*er*.42,iy=ey+ly*er*.45;c.beginPath();c.arc(ix,iy,er*.58,0,7);c.fillStyle='#6b3a16';c.fill();c.beginPath();c.arc(ix,iy,er*.32,0,7);c.fillStyle='#120804';c.fill();c.beginPath();c.arc(ix-er*.18,iy-er*.2,er*.16,0,7);c.fillStyle='#fff';c.fill();}
  c.lineWidth=lw*.9;c.strokeStyle=OUT;c.beginPath();c.ellipse(ex,ey,er*1.02,er*1.2,0,Math.PI*1.12,Math.PI*1.88);c.stroke();});
 if(ch.patch){c.beginPath();c.ellipse(r*.62,ey,r*.2,r*.22,0,0,7);c.fillStyle='#111';c.fill();c.strokeStyle='#111';c.lineWidth=r*.05;c.beginPath();c.moveTo(r*.45,ey-r*.15);c.lineTo(-r*.5,-r*.45);c.moveTo(r*.78,ey-r*.12);c.lineTo(r*.95,-r*.42);c.stroke();}
 if(o.glasses&&o.glasses.kind)drawGlasses(c,o.glasses,r,ey,lw);else if(ch.gl){c.lineWidth=r*.06;c.strokeStyle='#222';c.beginPath();c.arc(r*.2,ey,r*.27,0,7);c.moveTo(r*.89,ey);c.arc(r*.62,ey,r*.25,0,7);c.moveTo(r*.47,ey);c.lineTo(r*.37,ey);c.moveTo(-r*.07,ey);c.lineTo(-r*.45,ey-r*.05);c.stroke();}
 if(o.band){c.beginPath();rrc(c,-r*.98,-r*.58,r*1.98,r*.2,r*.06);fillStroke(c,o.band,lw*.6);}
 // sourcils
 const ang=o.mood==='angry'?.3:o.mood==='sad'?-.3:0;c.strokeStyle=ch.bdc&&ch.h==='turban'?'#ccc':hc;c.lineWidth=r*.12;
 c.beginPath();c.moveTo(r*.02,ey-r*.33-ang*r*.2);c.lineTo(r*.36,ey-r*.36+ang*r*.25);c.moveTo(r*.48,ey-r*.36+ang*r*.25);c.lineTo(r*.8,ey-r*.33-ang*r*.2);c.stroke();
 // nez
 c.beginPath();c.moveTo(r*.72,-r*.05);c.quadraticCurveTo(r*1.18,r*.12,r*.92,r*.3);c.quadraticCurveTo(r*.78,r*.36,r*.68,r*.26);fillStroke(c,grad(c,r*.7,0,r*1.1,r*.3,sk,skD),lw*.8);
 // bouche
 const mx=r*.5,my=r*.56;
 if(o.mouth==='open'){c.beginPath();c.moveTo(mx-r*.28,my-r*.08);c.quadraticCurveTo(mx,my-r*.14,mx+r*.3,my-r*.1);c.quadraticCurveTo(mx+r*.15,my+r*.32,mx-r*.28,my-r*.08);fillStroke(c,'#6b1212',lw*.7);c.fillStyle='#fff';c.fillRect(mx-r*.18,my-r*.11,r*.38,r*.08);c.fillStyle='#ff7a7a';c.beginPath();c.ellipse(mx,my+r*.1,r*.1,r*.05,0,0,7);c.fill();}
 else if(o.mood==='sad'){c.lineWidth=lw;c.strokeStyle=OUT;c.beginPath();c.arc(mx,my+r*.12,r*.18,Math.PI*1.2,Math.PI*1.8);c.stroke();}
 else{c.beginPath();c.moveTo(mx-r*.25,my-r*.04);c.quadraticCurveTo(mx,my+r*.16,mx+r*.28,my-r*.08);c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();}
 if(ch.mo){c.beginPath();c.moveTo(r*.18,r*.42);c.quadraticCurveTo(r*.5,r*.26,r*.85,r*.4);c.quadraticCurveTo(r*.88,r*.52,r*.7,r*.5);c.quadraticCurveTo(r*.5,r*.42,r*.3,r*.52);c.quadraticCurveTo(r*.15,r*.52,r*.18,r*.42);fillStroke(c,ch.h==='turban'?'#e8e8e8':hc,lw*.6);}
 if(o.frozen){c.fillStyle='#a8e4ff88';c.beginPath();c.arc(0,0,r*1.08,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(-r*.5,-r*.6);c.lineTo(-r*.2,-r*.2);c.moveTo(r*.3,-r*.7);c.lineTo(r*.5,-r*.3);c.stroke();}
 c.restore();}
// col du maillot sous la tête
function drawCollar(c,x,y,r,face,club,l78){c.save();c.translate(x,y);c.scale(face,1);const lw=Math.max(2,r*.08);const c1=l78?'#e70013':club.c1,c2=l78?'#ffffff':club.c2;
 c.beginPath();c.moveTo(-r*.9,r*.55);c.lineTo(-r*.15,r*1.08);c.lineTo(-r*.25,r*.62);c.lineTo(-r*.75,r*.3);c.closePath();fillStroke(c,grad(c,0,r*.3,0,r*1.1,shade(c1,.25),c1),lw);
 c.beginPath();c.moveTo(r*.85,r*.6);c.lineTo(r*.15,r*1.1);c.lineTo(r*.25,r*.66);c.lineTo(r*.7,r*.4);c.closePath();fillStroke(c,grad(c,0,r*.3,0,r*1.1,shade(c1,.25),c1),lw);
 c.strokeStyle=c2;c.lineWidth=r*.09;c.beginPath();c.moveTo(-r*.8,r*.5);c.lineTo(-r*.25,r*.9);c.moveTo(r*.75,r*.55);c.lineTo(r*.22,r*.92);c.stroke();
 c.restore();}
// grosse chaussure
function bootModel(m){if(!m)return EQ('b_base');if(typeof m==='string')return {c1:m,c2:'#fff',so:'#f4f4f4',pat:'eclair'};return m;}
function drawBoot(c,x,y,s,face,model,ang){const m=bootModel(model);const bi=m&&m.id&&EQI(m.id);
 if(bi){const w=80*s,h=w*bi.naturalHeight/bi.naturalWidth;c.save();c.translate(x-face*24*s,y);c.scale(face,1);c.rotate(-(ang||0));c.drawImage(bi,-8*s,4*s-h,w,h);c.restore();return;}
 c.save();c.translate(x-face*24*s,y);c.scale(face,1);c.rotate(-(ang||0));c.lineJoin='round';c.lineCap='round';const lw=Math.max(2,3*s);
 c.beginPath();c.moveTo(-4*s,-2*s);c.lineTo(58*s,-2*s);c.quadraticCurveTo(67*s,-2*s,64*s,-10*s);c.lineTo(-6*s,-8*s);c.closePath();fillStroke(c,m.so,lw);
 c.fillStyle='#2a2a2a';for(let i=0;i<4;i++){c.beginPath();rrc(c,(4+i*15)*s,-1*s,6*s,5*s,1.5*s);c.fill();}
 c.save();c.beginPath();c.moveTo(-6*s,-8*s);c.quadraticCurveTo(-8*s,-30*s,6*s,-34*s);c.lineTo(22*s,-32*s);c.quadraticCurveTo(34*s,-22*s,52*s,-20*s);c.quadraticCurveTo(68*s,-18*s,64*s,-10*s);c.closePath();
 c.fillStyle=grad(c,0,-34*s,0,-6*s,shade(m.c1,.35),shade(m.c1,-.25));c.fill();c.clip();
 c.fillStyle=m.c2;
 if(m.pat==='eclair'){c.beginPath();c.moveTo(8*s,-12*s);c.lineTo(26*s,-22*s);c.lineTo(24*s,-16*s);c.lineTo(42*s,-24*s);c.lineTo(30*s,-11*s);c.lineTo(32*s,-16*s);c.closePath();c.fill();}
 else if(m.pat==='flamme'){for(let i=0;i<4;i++){c.beginPath();c.moveTo((-4+i*14)*s,-8*s);c.quadraticCurveTo((4+i*14)*s,-30*s,(10+i*14)*s,-22*s);c.quadraticCurveTo((12+i*14)*s,-14*s,(18+i*14)*s,-8*s);c.fill();}}
 else if(m.pat==='vague'){c.lineWidth=4*s;c.strokeStyle=m.c2;for(let k=0;k<2;k++){c.beginPath();for(let i=0;i<=70;i+=5)c.lineTo((i-6)*s,(-14-k*9+Math.sin(i*.25)*3)*s);c.stroke();}}
 else if(m.pat==='dune'){c.beginPath();c.moveTo(-6*s,-8*s);c.quadraticCurveTo(14*s,-24*s,30*s,-12*s);c.quadraticCurveTo(46*s,-24*s,66*s,-10*s);c.lineTo(66*s,0);c.lineTo(-6*s,0);c.fill();}
 else if(m.pat==='fleur'){for(let i=0;i<3;i++){const fx=(10+i*16)*s,fy=(-16-(i%2)*6)*s;for(let a=0;a<5;a++){c.beginPath();c.arc(fx+Math.cos(a*1.26)*3*s,fy+Math.sin(a*1.26)*3*s,2.4*s,0,7);c.fill();}c.fillStyle='#ffd200';c.beginPath();c.arc(fx,fy,1.8*s,0,7);c.fill();c.fillStyle=m.c2;}}
 else if(m.pat==='etoile'){for(let i=0;i<3;i++){const fx=(8+i*17)*s,fy=(-17-(i%2)*5)*s;c.beginPath();for(let a=0;a<10;a++){const rr_=a%2?2.4*s:5.5*s;c.lineTo(fx+Math.cos(a*Math.PI/5-Math.PI/2)*rr_,fy+Math.sin(a*Math.PI/5-Math.PI/2)*rr_);}c.fill();}}
 c.fillStyle='#ffffff40';c.beginPath();c.ellipse(6*s,-27*s,9*s,4*s,-.5,0,7);c.fill();c.restore();
 c.beginPath();c.moveTo(-6*s,-8*s);c.quadraticCurveTo(-8*s,-30*s,6*s,-34*s);c.lineTo(22*s,-32*s);c.quadraticCurveTo(34*s,-22*s,52*s,-20*s);c.quadraticCurveTo(68*s,-18*s,64*s,-10*s);c.closePath();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();
 c.strokeStyle='#fff';c.lineWidth=2.4*s;for(let i=0;i<3;i++){c.beginPath();c.moveTo((26+i*7)*s,(-29+i*2.5)*s);c.lineTo((31+i*7)*s,(-24+i*2.5)*s);c.stroke();}
 c.restore();}
// chapeaux (repère de la tête, regard vers la droite)
function drawHat(c,h,r,lw){const col=h.col||'#e70013';c.save();
 if(h.kind==='casquette'){c.beginPath();c.moveTo(-r*.98,-r*.25);c.bezierCurveTo(-r*1.0,-r*1.25,r*.85,-r*1.3,r*.92,-r*.35);c.closePath();fillStroke(c,grad(c,0,-r*1.2,0,-r*.3,shade(col,.3),shade(col,-.2)),lw);
  c.beginPath();c.moveTo(r*.55,-r*.42);c.quadraticCurveTo(r*1.35,-r*.55,r*1.5,-r*.28);c.quadraticCurveTo(r*1.0,-r*.2,r*.6,-r*.25);c.closePath();fillStroke(c,shade(col,-.15),lw);
  c.beginPath();c.arc(-r*.05,-r*1.12,r*.1,0,7);fillStroke(c,shade(col,.2),lw*.5);c.fillStyle='#fff';c.font='bold '+(r*.4|0)+'px '+FONT;c.textAlign='center';c.fillText('KV',r*.05,-r*.55);}
 else if(h.kind==='paille'){c.beginPath();c.ellipse(0,-r*.55,r*1.7,r*.38,-.05,0,7);fillStroke(c,grad(c,0,-r*.9,0,-r*.2,'#f6d88c','#c9993e'),lw);
  c.strokeStyle='#a87a2a';c.lineWidth=r*.035;for(let i=1;i<4;i++){c.beginPath();c.ellipse(0,-r*.55,r*1.7*i/4,r*.38*i/4,-.05,0,7);c.stroke();}
  c.beginPath();c.moveTo(-r*.75,-r*.6);c.quadraticCurveTo(-r*.7,-r*1.45,0,-r*1.42);c.quadraticCurveTo(r*.7,-r*1.45,r*.75,-r*.6);c.closePath();fillStroke(c,grad(c,0,-r*1.4,0,-r*.6,'#f8e0a0','#d4a84e'),lw);
  c.beginPath();rrc(c,-r*.76,-r*.86,r*1.52,r*.22,r*.05);fillStroke(c,'#e70013',lw*.6);c.fillStyle='#1f5fd1';c.fillRect(-r*.76,-r*.79,r*1.52,r*.07);}
 else if(h.kind==='bob'){c.beginPath();c.moveTo(-r*1.25,-r*.3);c.quadraticCurveTo(-r*.85,-r*.62,-r*.72,-r*.62);c.bezierCurveTo(-r*.75,-r*1.35,r*.75,-r*1.35,r*.72,-r*.62);c.quadraticCurveTo(r*.9,-r*.62,r*1.28,-r*.3);c.quadraticCurveTo(0,-r*.5,-r*1.25,-r*.3);c.closePath();fillStroke(c,grad(c,0,-r*1.3,0,-r*.3,shade(col,.3),shade(col,-.2)),lw);
  c.strokeStyle='#fff';c.lineWidth=r*.07;c.beginPath();c.moveTo(-r*.74,-r*.7);c.quadraticCurveTo(0,-r*.85,r*.74,-r*.7);c.stroke();}
 else if(h.kind==='bonnet'){c.beginPath();c.moveTo(-r*.95,-r*.35);c.bezierCurveTo(-r*1.0,-r*1.45,r*.95,-r*1.45,r*.92,-r*.4);c.closePath();fillStroke(c,grad(c,0,-r*1.3,0,-r*.3,shade(col,.3),shade(col,-.15)),lw);
  c.fillStyle='#e70013';c.fillRect(-r*.95,-r*.98,r*1.9,r*.16);c.beginPath();rrc(c,-r*1.0,-r*.58,r*2.0,r*.28,r*.1);fillStroke(c,'#e70013',lw*.7);
  c.beginPath();c.arc(0,-r*1.42,r*.2,0,7);fillStroke(c,'#fff',lw*.6);}
 else if(h.kind==='laurier'){c.lineWidth=r*.06;c.strokeStyle='#2a6b12';c.beginPath();c.arc(0,-r*.2,r*.98,Math.PI*1.05,Math.PI*1.95);c.stroke();
  for(let i=0;i<11;i++){const a=Math.PI*1.08+i*Math.PI*.08,px=Math.cos(a)*r*.98,py=-r*.2+Math.sin(a)*r*.98;c.save();c.translate(px,py);c.rotate(a+Math.PI/2+(i%2?.5:-.5));c.beginPath();c.ellipse(0,-r*.12,r*.08,r*.17,0,0,7);fillStroke(c,grad(c,0,-r*.3,0,0,'#7ad61a','#2f8a12'),lw*.4);c.restore();}}
 else if(h.kind==='chechia'){c.beginPath();c.moveTo(-r*.78,-r*.42);c.quadraticCurveTo(-r*.8,-r*1.32,0,-r*1.32);c.quadraticCurveTo(r*.8,-r*1.32,r*.74,-r*.48);c.quadraticCurveTo(0,-r*.66,-r*.78,-r*.42);fillStroke(c,grad(c,0,-r*1.3,0,-r*.4,'#fff2a0','#d99a00'),lw);
  c.fillStyle='#ffffff66';c.beginPath();c.ellipse(-r*.3,-r*1.05,r*.25,r*.1,-.3,0,7);c.fill();c.strokeStyle='#8a5a00';c.lineWidth=r*.09;c.beginPath();c.moveTo(-r*.05,-r*1.3);c.quadraticCurveTo(-r*.55,-r*1.42,-r*.72,-r*.95);c.stroke();c.beginPath();c.arc(-r*.72,-r*.88,r*.11,0,7);c.fillStyle='#8a5a00';c.fill();
  [[0,-.95],[.35,-.9],[-.35,-.9]].forEach(([dx,dy])=>{c.beginPath();c.arc(r*dx,r*dy,r*.07,0,7);c.fillStyle='#e70013';c.fill();});}
 c.restore();}
function drawGlasses(c,gl,r,ey,lw){const col=gl.col||'#111';c.save();c.lineJoin='round';
 const e1=r*.2,e2=r*.62;
 if(gl.kind==='soleil'){[[e1,.27],[e2,.24]].forEach(([ex,er])=>{c.beginPath();rrc(c,ex-r*er,ey-r*.2,r*er*2,r*.36,r*.12);fillStroke(c,grad(c,0,ey-r*.2,0,ey+r*.16,'#3a3a44','#050508'),lw*.6);c.fillStyle='#ffffff55';c.fillRect(ex-r*er*.6,ey-r*.14,r*er*.7,r*.06);});
  c.strokeStyle=OUT;c.lineWidth=lw*.6;c.beginPath();c.moveTo(e1+r*.27,ey-r*.06);c.lineTo(e2-r*.24,ey-r*.06);c.moveTo(e1-r*.27,ey-r*.06);c.lineTo(-r*.5,ey-r*.18);c.stroke();}
 else if(gl.kind==='ronde'){c.strokeStyle=col;c.lineWidth=r*.07;[[e1,.26],[e2,.23]].forEach(([ex,er])=>{c.beginPath();c.arc(ex,ey,r*er,0,7);c.stroke();c.fillStyle='#bfe8ff33';c.fill();});c.beginPath();c.moveTo(e1+r*.26,ey);c.lineTo(e2-r*.23,ey);c.moveTo(e1-r*.26,ey);c.lineTo(-r*.5,ey-r*.12);c.stroke();}
 else if(gl.kind==='sport'){c.beginPath();c.moveTo(-r*.15,ey-r*.2);c.quadraticCurveTo(r*.45,ey-r*.32,r*.95,ey-r*.15);c.lineTo(r*.88,ey+r*.12);c.quadraticCurveTo(r*.45,ey+r*.05,-r*.1,ey+r*.16);c.closePath();fillStroke(c,grad(c,-r*.1,0,r*.9,0,col,'#7a33cc'),lw*.6);c.fillStyle='#ffffff77';c.fillRect(r*.05,ey-r*.14,r*.5,r*.05);c.strokeStyle=OUT;c.lineWidth=lw*.6;c.beginPath();c.moveTo(-r*.12,ey-r*.05);c.lineTo(-r*.55,ey-r*.18);c.stroke();}
 else if(gl.kind==='ski'){c.strokeStyle=OUT;c.lineWidth=r*.16;c.beginPath();c.moveTo(-r*.95,ey-r*.1);c.lineTo(-r*.1,ey-r*.04);c.stroke();c.strokeStyle=col;c.lineWidth=r*.1;c.stroke();
  c.beginPath();rrc(c,-r*.18,ey-r*.3,r*1.12,r*.56,r*.22);fillStroke(c,'#fff',lw*.6);c.beginPath();rrc(c,-r*.1,ey-r*.23,r*.96,r*.42,r*.17);c.fillStyle=grad(c,0,ey-r*.23,0,ey+r*.2,'#ffcf3a','#ff5a1a');c.fill();c.fillStyle='#ffffff88';c.fillRect(r*.05,ey-r*.18,r*.4,r*.07);}
 else if(gl.kind==='star'){[[e1,.3],[e2,.26]].forEach(([ex,er])=>{c.beginPath();for(let a=0;a<10;a++){const rr_=a%2?r*er*.55:r*er*1.1;c.lineTo(ex+Math.cos(a*Math.PI/5-Math.PI/2)*rr_,ey+Math.sin(a*Math.PI/5-Math.PI/2)*rr_);}c.closePath();fillStroke(c,grad(c,0,ey-r*.3,0,ey+r*.3,'#fff2a0','#e0a000'),lw*.5);c.beginPath();c.arc(ex,ey,r*er*.42,0,7);c.fillStyle='#ff3d9acc';c.fill();});
  c.strokeStyle=OUT;c.lineWidth=lw*.5;c.beginPath();c.moveTo(e1-r*.3,ey);c.lineTo(-r*.5,ey-r*.12);c.stroke();}
 c.restore();}
// joueur complet : tête posée sur la chaussure (pas de corps)
function gearLook(gear){gear=gear||{};return {boot:EQ(gear.boots)||EQ('b_base'),hat:EQ(gear.hat),glasses:EQ(gear.glasses),scarf:EQ(gear.scarf)};}
// écharpe nouée autour du cou (pans qui flottent derrière)
function drawScarf(c,e,x,y,r,face,t,part){if(!e||!e.kind)return;const si=EQI(e.id);if(si){if(part==='tail')return;const w=r*2.1,h=w*si.naturalHeight/si.naturalWidth;c.save();c.translate(x,y);c.scale(face,1);c.drawImage(si,-w*.52,-h*.45,w,h);c.restore();return;}c.save();c.translate(x,y);c.scale(face,1);const lw=Math.max(2,r*.07);c.lineJoin='round';
 const fill=(w0)=>{if(e.kind==='kef'){c.fillStyle=e.c1;c.fill();c.save();c.clip();c.strokeStyle=e.c2;c.lineWidth=r*.04;for(let i=-r*2;i<r*2;i+=r*.16){c.beginPath();c.moveTo(i,-r);c.lineTo(i+r,r);c.moveTo(i+r,-r);c.lineTo(i,r);c.stroke();}c.restore();}
  else{c.fillStyle=e.c1;c.fill();c.save();c.clip();c.fillStyle=e.c2;for(let i=-r*2;i<r*2;i+=r*.32)c.fillRect(i,-r*2,r*.13,r*4);if(e.kind==='etoile'){c.fillStyle='#fff';c.beginPath();c.arc(0,0,r*.12,0,7);c.fill();}c.restore();}};
 const sw=Math.sin((t||0)*.008)*r*.08;
 if(part!=='ring'){c.beginPath();c.moveTo(-r*.25,-r*.02);c.quadraticCurveTo(-r*.7,r*.1+sw,-r*1.05,r*.05+sw*1.6);c.lineTo(-r*1.08,r*.32+sw*1.6);c.quadraticCurveTo(-r*.72,r*.36+sw,-r*.3,r*.28);c.closePath();fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();
 c.fillStyle=e.c2;for(let i=0;i<4;i++){c.fillRect(-r*1.08-r*.08,r*.06+sw*1.6+i*r*.07,r*.09,r*.03);}
 }if(part==='tail'){c.restore();return;}
 c.beginPath();c.ellipse(r*.05,r*.06,r*.66,r*.2,0,0,7);fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();
 c.beginPath();c.ellipse(-r*.32,r*.12,r*.14,r*.14,0,0,7);fill();c.stroke();c.restore();}
// aura d'évolution : niveau 2 halo bleu, niveau 3 aura dorée et flammes
function drawAura(c,x,y,r,lv,t){if(!lv||lv<2)return;c.save();c.translate(x,y);const k=t*.004;
 if(lv===2){const g_=c.createRadialGradient(0,0,r*.6,0,0,r*1.55);g_.addColorStop(0,'#9fe6ff00');g_.addColorStop(.6,'#9fe6ff55');g_.addColorStop(1,'#9fe6ff00');c.fillStyle=g_;c.beginPath();c.arc(0,0,r*1.55,0,7);c.fill();
  for(let i=0;i<5;i++){const a=k*1.4+i*1.26,rr=r*(1.15+.12*Math.sin(k*3+i));c.fillStyle='#e8fbff';c.globalAlpha=.6+.4*Math.sin(k*5+i);c.beginPath();c.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*.05,0,7);c.fill();}}
 else{const g_=c.createRadialGradient(0,0,r*.5,0,0,r*1.75);g_.addColorStop(0,'#ffe06600');g_.addColorStop(.55,'#ffc40088');g_.addColorStop(.8,'#ff7a0044');g_.addColorStop(1,'#ff6a0000');c.fillStyle=g_;c.beginPath();c.arc(0,0,r*1.75,0,7);c.fill();
  for(let i=0;i<14;i++){const a_=i/14*Math.PI*2,fl=1+.25*Math.sin(k*9+i*2.1),r0=r*1.02,r1=r*(1.38+.18*fl);c.fillStyle=i%2?'#ffb000cc':'#ff7a1acc';c.beginPath();c.moveTo(Math.cos(a_-.16)*r0,Math.sin(a_-.16)*r0);c.quadraticCurveTo(Math.cos(a_)*r1*1.05,Math.sin(a_)*r1*1.05,Math.cos(a_+.05+Math.sin(k*6+i)*.06)*r1,Math.sin(a_+.05)*r1);c.lineTo(Math.cos(a_+.16)*r0,Math.sin(a_+.16)*r0);c.closePath();c.fill();}
  for(let i=0;i<8;i++){const ph=((k*1.2+i/8)%1),a_=i*.8+k*.3,rr=r*(1.1+ph*.8);c.globalAlpha=1-ph;c.fillStyle='#fff6b0';c.beginPath();c.arc(Math.cos(a_)*rr,Math.sin(a_)*rr,r*.06*(1-ph*.5),0,7);c.fill();}}
 c.restore();c.globalAlpha=1;}
// objets de célébration (icônes et après un but)
function drawCeleb(c,kind,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';c.strokeStyle=OUT;c.lineWidth=3;const w=Math.sin((t||0)*.012);
 if(kind==='drapeau'){c.beginPath();c.moveTo(-18,30);c.lineTo(-18,-34);c.stroke();c.beginPath();c.moveTo(-18,-34);for(let i=0;i<=8;i++){c.lineTo(-18+i*5.5,-34+Math.sin(i*.8+w*3)*3);}c.lineTo(26,-6+Math.sin(6.4+w*3)*3);for(let i=8;i>=0;i--){c.lineTo(-18+i*5.5,-6+Math.sin(i*.8+w*3)*3);}c.closePath();c.fillStyle='#e70013';c.fill();c.stroke();
  c.beginPath();c.arc(4,-20,7,0,7);c.fillStyle='#fff';c.fill();c.beginPath();c.arc(5,-20,5,.6,5.7);c.fillStyle='#e70013';c.fill();}
 else if(kind==='tambour'){c.beginPath();c.ellipse(0,-14,24,8,0,0,7);c.fillStyle='#f4ead8';c.fill();c.stroke();c.beginPath();c.moveTo(-24,-14);c.lineTo(-24,14);c.ellipse(0,14,24,8,0,Math.PI,0,true);c.lineTo(24,-14);c.ellipse(0,-14,24,8,0,0,Math.PI);c.fillStyle='#d01818';c.fill();c.stroke();
  c.strokeStyle='#ffd200';c.lineWidth=2;c.beginPath();for(let i=0;i<5;i++){c.moveTo(-20+i*10,-6);c.lineTo(-15+i*10,18);}c.stroke();c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(8,-30+w*6);c.lineTo(-4,-16);c.stroke();}
 else if(kind==='megaphone'){c.save();c.rotate(-.3);c.beginPath();c.moveTo(-22,-6);c.lineTo(10,-18);c.lineTo(10,18);c.lineTo(-22,6);c.closePath();c.fillStyle='#e70013';c.fill();c.stroke();c.beginPath();c.ellipse(10,0,5,18,0,0,7);c.fillStyle='#ffd200';c.fill();c.stroke();c.fillStyle='#333';c.fillRect(-20,6,8,14);c.strokeRect(-20,6,8,14);
  c.strokeStyle='#fff';c.lineWidth=2.5;for(let i=1;i<=3;i++){c.globalAlpha=.5+.5*Math.sin((t||0)*.02-i);c.beginPath();c.arc(14,0,8+i*7,-.6,.6);c.stroke();}c.restore();}
 else if(kind==='fumigene'){c.beginPath();rrc(c,-6,-4,12,34,3);c.fillStyle='#333';c.fill();c.stroke();c.fillStyle='#ff3a1a';c.beginPath();c.arc(0,-6,7,0,7);c.fill();
  for(let i=0;i<6;i++){const ph=(((t||0)*.0015+i/6)%1);c.globalAlpha=.75*(1-ph);c.fillStyle=i%2?'#ff5a3c':'#ff8a6a';c.beginPath();c.arc(Math.sin(ph*6+i)*8*ph,-10-ph*50,6+ph*16,0,7);c.fill();}}
 else if(kind==='confettis'){c.save();c.rotate(-.5);c.beginPath();c.moveTo(-6,26);c.lineTo(6,26);c.lineTo(12,-14);c.lineTo(-12,-14);c.closePath();c.fillStyle='#2c6fe0';c.fill();c.stroke();c.fillStyle='#ffd200';c.fillRect(-10,0,20,5);c.restore();
  const cols=['#e70013','#ffd200','#2cc26b','#2c6fe0','#fff'];for(let i=0;i<10;i++){const ph=(((t||0)*.001+i/10)%1);c.globalAlpha=1-ph;c.fillStyle=cols[i%5];c.save();c.translate(10+Math.cos(i*2.4)*ph*34,-18-ph*40+ph*ph*30);c.rotate(i+ph*6);c.fillRect(-3,-2,6,4);c.restore();}}
 else if(kind==='trophee'){c.beginPath();c.moveTo(-16,-28);c.lineTo(16,-28);c.quadraticCurveTo(16,2,0,6);c.quadraticCurveTo(-16,2,-16,-28);c.fillStyle=grad(c,0,-28,0,6,'#fff3a0','#e0a000');c.fill();c.stroke();
  c.beginPath();c.arc(-18,-18,8,1.2,4.7,false);c.stroke();c.beginPath();c.arc(18,-18,8,-1.5,1.9,false);c.stroke();c.fillStyle='#c08a00';c.fillRect(-4,6,8,10);c.strokeRect(-4,6,8,10);c.beginPath();rrc(c,-14,16,28,9,3);c.fillStyle='#7a4a1c';c.fill();c.stroke();
  c.fillStyle='#fff';c.globalAlpha=.5+.5*Math.sin((t||0)*.01);c.beginPath();c.arc(-7,-20,3,0,7);c.fill();}
 c.restore();c.globalAlpha=1;}
// peaux de ballon
const BALLSK={classique:['#ffffff','#d0d4dc','#1d1d22',null],zellige:['#2cc26b','#137a3c','#ffffff',null],or:['#fff3a0','#e0a000','#8a5a00','#ffd20088'],glace:['#e8fbff','#7fd6ff','#2c8cf0','#7fe0ff99'],feu:['#ffd27a','#ff5a1a','#7a1a00','#ff6a00aa'],volt:['#e0b8ff','#8a2ae0','#2a0a5a','#c070ffaa']};
function drawPlayerArt(c,ch,club,gear,x,y,s,face,o){o=o||{};const r=34*s*(o.big||1);const hy=y-26*s-r*.92+(o.bob||0)*s;const L=gearLook(gear);
 if(!o.noShadow){c.fillStyle='#0005';c.beginPath();c.ellipse(x,y+2,34*s,6*s,0,0,7);c.fill();}
 if(!o.noBoot)drawBoot(c,x,y,s,face,L.boot,o.kick||0);
 if(!o.noHead){if(o.aura)drawAura(c,x+(o.hd||0)*face,hy,r,o.aura,Date.now());if(!hasHead(ch.id))drawCollar(c,x+(o.hd||0)*face,hy+r*.32,r,face,club,ch.l78);drawScarf(c,L.scarf,x+(o.hd||0)*face,hy+r*.7,r,face,Date.now(),'tail');
 drawHead(c,ch,x+(o.hd||0)*face,hy,r,face,{lx:o.lx,ly:o.ly,mouth:o.mouth,mood:o.mood,stun:o.stun,frozen:o.frozen,hat:L.hat,glasses:L.glasses,blink:o.blink});drawScarf(c,L.scarf,x+(o.hd||0)*face,hy+r*.86,r,face,Date.now(),'ring');
 if(ch.l78&&!o.noBadge){c.save();c.textAlign='center';textOut(c,'78',x+face*r*.95,hy-r*.75,13*s,'#ffd200',OUT,3*s);c.restore();}}}
// aperçu dans un canvas DOM
function preview(cnv,chId,club,gear,mode){const d=Math.min(2,devicePixelRatio||1);const w=cnv.clientWidth||100,h=cnv.clientHeight||100;cnv.width=w*d;cnv.height=h*d;const c=cnv.getContext('2d');c.scale(d,d);c.clearRect(0,0,w,h);const ch=CH(chId);
 if(mode==='full'){const s=Math.min(w/100,h/120);drawPlayerArt(c,ch,club||CLUBS[0],gear||{},w/2,h-6*s,s,1,{lx:.5,ly:.1,mouth:'open'});}
 else{const r=Math.min(w,h)*.32;if(!hasHead(ch.id))drawCollar(c,w/2-r*.05,h*.47+r*.32,r,1,club||CLUBS[0],ch.l78);drawHead(c,ch,w/2-r*.05,h*.47,r,1,{lx:.5,ly:.1});}}
// ballon
const BALLID={classique:'ba_cl',zellige:'ba_zel',or:'ba_or',glace:'ba_ice',feu:'ba_fire',volt:'ba_volt'};
function drawBall(c,x,y,rot,r,skin){const K=BALLSK[skin]||BALLSK.classique;const bim=EQI(BALLID[skin||'classique']);if(bim){if(K[3]&&skin!=='classique'){c.save();c.fillStyle=K[3];c.globalAlpha=.35+.2*Math.sin(Date.now()*.012);c.beginPath();c.arc(x,y,r*1.45,0,7);c.fill();c.restore();c.globalAlpha=1;}c.save();c.translate(x,y);c.rotate(rot);c.drawImage(bim,-r*1.06,-r*1.06,r*2.12,r*2.12);c.restore();return;}
 if(K[3]){c.save();c.fillStyle=K[3];c.globalAlpha=.55+.25*Math.sin(Date.now()*.012);c.beginPath();c.arc(x,y,r*1.55,0,7);c.fill();c.restore();c.globalAlpha=1;}
 c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=rgrad(c,0,0,r,K[0],K[1]);c.fill();
 c.fillStyle=K[2];const pent=(px,py,s)=>{c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;c.lineTo(px+Math.cos(a)*s,py+Math.sin(a)*s);}c.closePath();c.fill();};
 pent(0,0,r*.36);for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;pent(Math.cos(a)*r*.92,Math.sin(a)*r*.92,r*.3);}
 c.restore();c.beginPath();c.arc(x,y,r,0,7);c.lineWidth=Math.max(2,r*.14);c.strokeStyle=OUT;c.stroke();c.fillStyle='#ffffff99';c.beginPath();c.ellipse(x-r*.35,y-r*.42,r*.3,r*.16,-.6,0,7);c.fill();}
// ---------- Boutons de jeu (sprites) ----------
function mkBtnSprite(kind,r,col,d){const R=Math.ceil((r+8)*d),cv_=document.createElement('canvas');cv_.width=cv_.height=R*2;const c=cv_.getContext('2d');c.scale(d,d);const m=R/d;c.lineJoin='round';c.lineCap='round';
 const sq=kind!=='round';const w=r*2,h=r*2;
 c.fillStyle='#0007';if(sq){rrc(c,m-r,m-r+5,w,h,r*.42);}else{c.beginPath();c.arc(m,m+4,r,0,7);}c.fill();
 if(sq)rrc(c,m-r,m-r,w,h,r*.42);else{c.beginPath();c.arc(m,m,r,0,7);}c.fillStyle=grad(c,0,m-r,0,m+r,shade(col,.35),shade(col,-.25));c.fill();c.lineWidth=4;c.strokeStyle=OUT;c.stroke();
 if(sq)rrc(c,m-r+5,m-r+4,w-10,h*.45,r*.3);else{c.beginPath();c.ellipse(m,m-r*.4,r*.7,r*.4,0,0,7);}c.fillStyle='#ffffff40';c.fill();
 return {c:cv_,m};}
function btnIcon(c,kind,x,y,r){c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';c.lineWidth=Math.max(3,r*.1);c.strokeStyle=OUT;c.fillStyle='#fff';
 if(kind==='l'||kind==='r'){c.scale(kind==='l'?-1:1,1);c.beginPath();c.moveTo(-r*.35,-r*.5);c.lineTo(r*.45,0);c.lineTo(-r*.35,r*.5);c.closePath();c.fill();c.stroke();}
 else if(kind==='j'){c.beginPath();c.moveTo(0,-r*.55);c.lineTo(r*.48,r*.05);c.lineTo(r*.18,r*.05);c.lineTo(r*.18,r*.5);c.lineTo(-r*.18,r*.5);c.lineTo(-r*.18,r*.05);c.lineTo(-r*.48,r*.05);c.closePath();c.fill();c.stroke();}
 else if(kind==='lo'||kind==='hi'){c.save();c.translate(-r*.05,r*.15);c.scale(.62*r/34,.62*r/34);drawBoot(c,0,14,1,1,'#5b2c10',kind==='hi'?.25:0,0);c.restore();
  if(kind==='hi'){c.beginPath();c.moveTo(r*.48,-r*.62);c.lineTo(r*.78,-r*.25);c.lineTo(r*.58,-r*.25);c.lineTo(r*.58,r*.05);c.lineTo(r*.38,r*.05);c.lineTo(r*.38,-r*.25);c.lineTo(r*.18,-r*.25);c.closePath();c.fill();c.stroke();}
  else{c.strokeStyle='#fff';c.lineWidth=r*.07;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-r*.75,-r*.2+i*r*.18);c.lineTo(-r*.5,-r*.2+i*r*.18);c.stroke();}}}
 else if(kind==='pause'){c.fillRect(-r*.3,-r*.4,r*.2,r*.8);c.fillRect(r*.1,-r*.4,r*.2,r*.8);c.strokeRect(-r*.3,-r*.4,r*.2,r*.8);c.strokeRect(r*.1,-r*.4,r*.2,r*.8);}
 else if(kind==='chat'){c.beginPath();c.ellipse(0,-r*.05,r*.55,r*.4,0,0,7);c.moveTo(-r*.25,r*.25);c.lineTo(-r*.4,r*.55);c.lineTo(0,r*.32);c.fill();c.stroke();c.fillStyle=OUT;for(let i=-1;i<=1;i++){c.beginPath();c.arc(i*r*.22,-r*.05,r*.07,0,7);c.fill();}}
 else if(kind==='skip'){c.font='bold '+(r*.9|0)+'px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('»',0,2);}
 c.restore();}

// ---------- Décors ----------
const DW=960,DH=540,GY=440,EX=200;
function mkFan(home,away,left){const cl=left?home:away;return {sh:Math.random()<.55?cl.c1:cl.c2,sk:['#f0c8a0','#e0ab7e','#c98e5e','#a86d43','#8a5530'][Math.random()*5|0],hair:['#1a0e06','#3a2412','#6b4423','#c8a060','#e70013'][Math.random()*5|0],scarf:Math.random()<.4?cl.c1:null,g:Math.random()<.5?0:1,flag:Math.random()<.06};}
function drawFan(c,f,x,y,up,s){c.lineJoin='round';const lw=1.6;
 // bras
 c.strokeStyle=OUT;c.lineWidth=lw;
 const arm=(dir)=>{c.beginPath();if(up){c.moveTo(x+dir*7*s,y-4*s);c.lineTo(x+dir*12*s,y-20*s);}else{c.moveTo(x+dir*8*s,y-2*s);c.lineTo(x+dir*11*s,y+8*s);}c.lineWidth=5*s;c.strokeStyle=OUT;c.stroke();c.lineWidth=3*s;c.strokeStyle=f.sh;c.stroke();c.beginPath();c.arc(x+dir*(up?12:11)*s,y+(up?-21:9)*s,2.6*s,0,7);c.fillStyle=f.sk;c.fill();c.lineWidth=1.2;c.strokeStyle=OUT;c.stroke();};
 arm(-1);arm(1);
 c.beginPath();rrc(c,x-9*s,y-6*s,18*s,18*s,6*s);c.fillStyle=f.sh;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();
 if(f.scarf){c.fillStyle=f.scarf;c.fillRect(x-8*s,y-6*s,16*s,4*s);}
 c.beginPath();c.arc(x,y-13*s,8*s,0,7);c.fillStyle=f.sk;c.fill();c.stroke();
 c.beginPath();c.arc(x,y-15*s,8*s,Math.PI*1.05,Math.PI*1.95);c.fillStyle=f.hair;c.fill();
 c.fillStyle=OUT;c.beginPath();c.arc(x-2.6*s,y-13*s,1.2*s,0,7);c.arc(x+2.6*s,y-13*s,1.2*s,0,7);c.fill();
 c.beginPath();if(up){c.ellipse(x,y-9*s,2.4*s,2.2*s,0,0,7);c.fill();}else{c.arc(x,y-10*s,2.4*s,.2,Math.PI-.2);c.lineWidth=1.2;c.stroke();}
 if(f.flag&&up){c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.moveTo(x+12*s,y-20*s);c.lineTo(x+12*s,y-46*s);c.stroke();c.fillStyle=f.sh;c.fillRect(x+12*s,y-46*s,18*s,12*s);c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(x+12*s,y-46*s,18*s,12*s);}}
// décors peints (partie haute : ciel, tribunes, public) ; pf = hauteur relative où commence la pelouse dans l'image
const BGI={stade:{src:'img/bg/stade.webp',pf:.6},plage:{src:'img/bg/plage.webp',pf:.6},quartier:{src:'img/bg/quartier.webp',pf:.62}};
for(const k in BGI){const im=new Image();im.onload=()=>{BGI[k].ok=1;if(typeof onBgReady==='function')onBgReady();};im.src=BGI[k].src;BGI[k].im=im;}
function mkScene(V,home,away){const S_={bands:null,layers:[]};const BG=BGI[V.t]&&BGI[V.t].ok?BGI[V.t]:null;const L=()=>{const c=document.createElement('canvas');c.width=DW+2*EX;c.height=DH;return c;},TX=k=>{k.translate(EX,0);return k;};
 const base=L(),x=TX(base.getContext('2d'));x.lineJoin='round';
 if(BG){const im=BG.im,w=DW+2*EX,h=w*im.naturalHeight/im.naturalWidth,dy=Math.min(0,350-BG.pf*h);x.save();x.beginPath();x.rect(-EX,0,w,352);x.clip();x.drawImage(im,-EX,dy,w,h);
  const sh=x.createLinearGradient(0,250,0,352);sh.addColorStop(0,'#00000000');sh.addColorStop(1,'#00000055');x.fillStyle=sh;x.fillRect(-EX,250,w,102);x.restore();}
 else if(V.t==='stade'){
  const sky=grad(x,0,0,0,200,'#5fb6ff','#bfe6ff');x.fillStyle=sky;x.fillRect(-EX,0,DW+2*EX,DH);
  x.fillStyle='#ffffffcc';[[120,40],[420,26],[760,50]].forEach(([cx,cy])=>{x.beginPath();x.arc(cx,cy,18,0,7);x.arc(cx+20,cy-8,22,0,7);x.arc(cx+44,cy,18,0,7);x.fill();});
  // structure de tribune
  x.fillStyle=grad(x,0,70,0,330,'#8a93a3','#5b6475');x.fillRect(-EX,80,DW+2*EX,260);
  x.fillStyle='#6d7686';for(let i=0;i<9;i++)x.fillRect(-EX,96+i*24,DW+2*EX,4);
  // pylônes d'éclairage
  [90,DW-90].forEach(px=>{x.strokeStyle='#3d4452';x.lineWidth=4;x.beginPath();x.moveTo(px-14,96);x.lineTo(px,20);x.lineTo(px+14,96);x.stroke();for(let i=0;i<5;i++){x.beginPath();x.moveTo(px-12+i*1.5,90-i*15);x.lineTo(px+12-i*1.5,80-i*15);x.stroke();}
   x.beginPath();rrc(x,px-34,4,68,26,4);x.fillStyle='#2b313d';x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();for(let i=0;i<4;i++){x.fillStyle='#fffbd0';x.beginPath();x.arc(px-24+i*16,17,6,0,7);x.fill();}});
  // toit de la tribune
  x.fillStyle='#4a5160';x.fillRect(-EX,72,DW+2*EX,12);x.fillStyle='#3d4452';for(let i=-240;i<DW+EX;i+=120)x.fillRect(i+58,60,6,24);
 } else if(V.t==='plage'){x.fillStyle=grad(x,0,0,0,300,'#3aa0e8','#bfe6ff');x.fillRect(-EX,0,DW+2*EX,DH);x.fillStyle='#fff6c8';x.beginPath();x.arc(820,70,38,0,7);x.fill();
  x.fillStyle='#1f7fc4';x.fillRect(-EX,250,DW+2*EX,80);x.fillStyle='#ffffff55';for(let i=0;i<40;i++)x.fillRect((Math.random()*(DW+2*EX)-EX),255+Math.random()*70,30,2);
  x.fillStyle='#f2d7a0';x.fillRect(-EX,320,DW+2*EX,40);
  [[110,'#e70013'],[480,'#ffd200'],[850,'#1f8a4c']].forEach(([px,cc])=>{x.strokeStyle='#5a3a1a';x.lineWidth=5;x.beginPath();x.moveTo(px,230);x.lineTo(px,330);x.stroke();x.beginPath();x.moveTo(px-60,250);x.quadraticCurveTo(px,180,px+60,250);x.closePath();x.fillStyle=cc;x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();});
 } else {const sk=[['#7ec8f2','#e8f6ff'],['#f6a35a','#ffe2b0'],['#5fa8d8','#dbeefa']][V.sky||0];x.fillStyle=grad(x,0,0,0,300,sk[0],sk[1]);x.fillRect(-EX,0,DW+2*EX,DH);
  let hx=-20-EX;while(hx<DW+EX){const hw=120+Math.random()*90,hh=150+Math.random()*120,hy=330-hh;x.beginPath();x.rect(hx,hy,hw,hh);x.fillStyle=Math.random()<.8?'#f4f1ea':'#ecdcba';x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();
   x.fillStyle='#00000010';x.fillRect(hx+hw-10,hy,10,hh);
   for(let wy=hy+18;wy<330-80;wy+=46){[hx+16,hx+hw-42].forEach(wx=>{x.beginPath();rrc(x,wx,wy,26,28,4);x.fillStyle='#1f5fd1';x.fill();x.stroke();});}
   x.beginPath();x.moveTo(hx+hw/2-16,330);x.lineTo(hx+hw/2-16,282);x.arc(hx+hw/2,282,16,Math.PI,0);x.lineTo(hx+hw/2+16,330);x.fillStyle='#1f5fd1';x.fill();x.stroke();
   if(Math.random()<.6){x.beginPath();x.ellipse(hx+hw*.7,hy-8,14,9,-.4,0,7);x.fillStyle='#e8e8e8';x.fill();x.stroke();}hx+=hw+6;}
  x.strokeStyle='#444';x.lineWidth=2;x.beginPath();x.moveTo(250,150);x.quadraticCurveTo(360,175,470,150);x.stroke();['#e70013','#fff','#ffd200','#1f8a4c','#1f5fd1'].forEach((cc,i)=>{x.beginPath();x.rect(268+i*40,160+Math.sin(i)*4,22,26);x.fillStyle=cc;x.fill();x.lineWidth=2;x.strokeStyle=OUT;x.stroke();});}
 // supporters (deux images : bras levés/baissés)
 const fans=[];const rows=V.t==='stade'?[[150,.95],[200,1],[250,1.05],[300,1.1]]:V.t==='quartier'?[[300,.95]]:[[318,.9]];
 if(!BG)for(const [ry,s] of rows){const step=V.t==='stade'?30*s:58;for(let fx=10+(ry%60)-EX;fx<DW+EX;fx+=step+(V.t==='stade'?Math.random()*4:Math.random()*40)){fans.push({x:fx,y:ry,s,f:mkFan(home,away,fx<DW/2)});}}
 const crowd=[0,1].map(fr=>{const c=L(),cx=TX(c.getContext('2d'));for(const F of fans){drawFan(cx,F.f,F.x,F.y,(F.f.g===fr),F.s);}return c;});
 S_.crowd=crowd;
 // devant : grillage, panneaux, pelouse, bande de commandes
 const front=L(),f=TX(front.getContext('2d'));f.lineJoin='round';
 if(V.t==='stade'){if(!BG){f.strokeStyle='#c5ccd8aa';f.lineWidth=1.2;for(let i=-EX-40;i<DW+EX+40;i+=14){f.beginPath();f.moveTo(i,250);f.lineTo(i+60,318);f.moveTo(i+60,250);f.lineTo(i,318);f.stroke();}
  f.fillStyle='#4a5160';for(let i=-160;i<DW+EX;i+=160)f.fillRect(i,240,6,80);f.fillRect(-EX,240,DW+2*EX,5);}
  [[-240,'YA3TIK ESSA7A','#14171f'],[960,'KAWARJIA','#e70013'],[0,'KAWARJIA','#e70013'],[240,'SYPHAX APPS','#1f5fd1'],[480,V.n.toUpperCase(),home.c1],[720,'LIGUE 1 • 2026-27','#1f8a4c']].forEach(([bx,t,cc])=>{f.beginPath();rrc(f,bx+6,318,228,30,5);f.fillStyle=grad(f,0,318,0,348,shade(cc,.15),shade(cc,-.25));f.fill();f.strokeStyle=OUT;f.lineWidth=3;f.stroke();f.textAlign='center';f.font='15px '+FONT;textOut(f,t.length>24?t.slice(0,23)+'…':t,bx+120,339,15,'#fff',OUT,3);});
 } else if(V.t==='quartier'&&!BG){f.beginPath();f.rect(-EX,300,DW+2*EX,52);f.fillStyle='#d4bf98';f.fill();f.strokeStyle=OUT;f.lineWidth=3;f.stroke();f.fillStyle='#b9a37c';for(let i=-EX;i<DW+EX;i+=44)f.fillRect(i,302,3,48);
  f.textAlign='left';textOut(f,'KOURA W BAS',90,338,26,'#e70013',OUT,4);textOut(f,'ALLEZ '+home.s+' !',DW-300,338,26,'#1f5fd1',OUT,4);textOut(f,'ULTRAS 7OUMA',DW/2-90,334,22,'#222','#fff',3);}
 // pelouse en perspective (style terrain de match)
 const G=V.t==='plage'?['#f6dca2','#ecc98a','#d9b06a']:V.t==='quartier'?['#cfa46a','#c19358','#a87a44']:['#5fd14a','#47bd3a','#2f9a2a'];
 const VX=DW/2,VY=-260,pt=(xb,yy)=>VX+(xb-VX)*((yy-VY)/(470-VY));
 f.fillStyle=grad(f,0,348,0,470,G[1],G[0]);f.fillRect(-EX,348,DW+2*EX,122);
 for(let i=-6;i<20;i++){if(i%2)continue;const x0=i*80,x1=x0+80;f.beginPath();f.moveTo(pt(x0,348),348);f.lineTo(pt(x1,348),348);f.lineTo(x1,470);f.lineTo(x0,470);f.closePath();f.fillStyle=G[2]+'33';f.fill();}
 const lg=f.createRadialGradient(DW/2,330,40,DW/2,420,620);lg.addColorStop(0,'#ffffff30');lg.addColorStop(.55,'#ffffff00');lg.addColorStop(1,'#00000040');f.fillStyle=lg;f.fillRect(-EX,348,DW+2*EX,122);
 f.strokeStyle='#00000018';f.lineWidth=1;for(let i=0;i<650;i++){const gx=(Math.random()*(DW+2*EX)-EX),gy=352+Math.random()*116;f.beginPath();f.moveTo(gx,gy);f.lineTo(gx+(Math.random()-.5)*3,gy-3-Math.random()*3);f.stroke();}
 // taches de terre
 const blob=(cx,cy,rw,rh,col)=>{f.beginPath();for(let a=0;a<=14;a++){const t=a/14*Math.PI*2,k=.7+Math.random()*.5;f.lineTo(cx+Math.cos(t)*rw*k,cy+Math.sin(t)*rh*k);}f.closePath();f.fillStyle=col;f.fill();};
 // Pelouse de stade premium : supprimer les plaques de terre.
 // Reflets subtils de la pelouse, calculés une seule fois dans le décor mis en cache.
 if(V.t==='stade'){f.save();const sheen=f.createLinearGradient(0,352,0,470);sheen.addColorStop(0,'#c8ffb314');sheen.addColorStop(.48,'#ffffff06');sheen.addColorStop(1,'#001a191b');f.fillStyle=sheen;f.fillRect(-EX,352,DW+2*EX,118);f.strokeStyle='#ffffff0b';f.lineWidth=1;for(let i=0;i<18;i++){const yy=354+i*6.5;f.beginPath();f.moveTo(-EX,yy);f.lineTo(DW+EX,yy);f.stroke();}f.restore();}
 // lignes du terrain
 if(V.t!=='plage'){f.lineCap='round';f.lineJoin='round';const line=(pts,close)=>{f.beginPath();pts.forEach(([xx,yy],k)=>k?f.lineTo(xx,yy):f.moveTo(xx,yy));if(close)f.closePath();f.strokeStyle='#ffffff';f.lineWidth=4;f.stroke();};
  f.save();f.shadowColor='#ffffff66';f.shadowBlur=6;
  line([[pt(40,356),356],[pt(DW-40,356),356],[DW-20,464],[20,464]],true);line([[DW/2,356],[DW/2,464]]);
  f.beginPath();f.ellipse(DW/2,410,96,30,0,0,7);f.strokeStyle='#fff';f.lineWidth=4;f.stroke();f.beginPath();f.ellipse(DW/2,410,5,2.5,0,0,7);f.fillStyle='#fff';f.fill();
  line([[pt(40,372),372],[pt(205,372),372],[198,450],[pt(40,450),450]]);line([[pt(DW-40,372),372],[pt(DW-205,372),372],[DW-198,450],[pt(DW-40,450),450]]);
  f.restore();
  // poteaux de corner
  [[pt(40,356),356],[pt(DW-40,356),356]].forEach(([cx,cy],k)=>{f.strokeStyle=OUT;f.lineWidth=3;f.beginPath();f.moveTo(cx,cy);f.lineTo(cx,cy-30);f.stroke();f.beginPath();f.moveTo(cx,cy-30);f.lineTo(cx+(k?-14:14),cy-25);f.lineTo(cx,cy-20);f.closePath();f.fillStyle=k?away.c1:home.c1;f.fill();f.lineWidth=2;f.stroke();});}
 // ombre des panneaux sur la pelouse
 f.fillStyle=grad(f,0,348,0,362,'#00000040','#00000000');f.fillRect(-EX,348,DW+2*EX,14);
 // bande de terre (commandes)
 f.fillStyle=V.t==='stade'?grad(f,0,470,0,DH,'#278d42','#104d32'):grad(f,0,470,0,DH,'#8a5428','#4e2d14');f.fillRect(-EX,470,DW+2*EX,DH-470);f.fillStyle=grad(f,0,466,0,476,'#2f9a2a','#5a3418');if(V.t==='stade')f.fillRect(-EX,466,DW+2*EX,8);
 if(V.t!=='stade')for(let i=0;i<100;i++){const rx=(Math.random()*(DW+2*EX)-EX),ry=480+Math.random()*55;f.beginPath();f.ellipse(rx,ry,3+Math.random()*5,2+Math.random()*2,0,0,7);f.fillStyle=Math.random()<.5?'#6b3e1c':'#a66a34';f.fill();}
 if(V.t!=='stade')for(let i=0;i<20;i++){const rx=(Math.random()*(DW+2*EX)-EX);f.fillStyle='#4fb83a';f.beginPath();f.moveTo(rx,474);f.lineTo(rx+4,462);f.lineTo(rx+7,474);f.lineTo(rx+11,464);f.lineTo(rx+13,474);f.fill();}
 // Liseré lumineux du bord du terrain : apporte du volume sans WebGL.
 if(V.t==='stade'){f.save();const rim=f.createLinearGradient(0,460,0,477);rim.addColorStop(0,'#ffffff00');rim.addColorStop(.45,'#d5ffba66');rim.addColorStop(1,'#173d27aa');f.fillStyle=rim;f.fillRect(-EX,460,DW+2*EX,17);f.restore();}
 S_.base=base;S_.front=front;S_.full=crowd.map(cw=>{const c=L(),x=c.getContext('2d');x.drawImage(base,0,0);x.drawImage(cw,0,0);x.drawImage(front,0,0);return c;});
 S_.bands=V.t==='stade'?[[0,80,'#7cc2ff'],[80,348,'#6b7484'],[348,470,G[0]],[470,DH,'#5e3719']]:V.t==='plage'?[[0,250,'#8ccdf5'],[250,348,'#1f7fc4'],[348,470,G[0]],[470,DH,'#5e3719']]:[[0,300,['#a8d8f5','#f9c98a','#9ccbe8'][V.sky||0]],[300,348,'#d4bf98'],[348,470,G[0]],[470,DH,'#5e3719']];
 return S_;}
// buts en perspective (montants épais, filet en losanges, filet qui tremble après un but)
const GD={dx:30,dy:26};
function postLine(c,pts,w,col){c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=OUT;c.lineWidth=w+5;c.stroke();c.strokeStyle=shade(col,-.18);c.lineWidth=w;c.stroke();c.strokeStyle=col;c.lineWidth=w*.55;c.stroke();c.strokeStyle='#ffffffcc';c.lineWidth=w*.18;c.stroke();}
function netMesh(c,A,B,C,D,n1,n2,wob,t){// quadrilatère A(haut-av) B(haut-ar) C(bas-ar) D(bas-av)
 const P=(u,v)=>{const x=A[0]+(B[0]-A[0])*u+(D[0]-A[0])*v+(A[0]-B[0]+C[0]-D[0])*u*v,y=A[1]+(B[1]-A[1])*u+(D[1]-A[1])*v+(A[1]-B[1]+C[1]-D[1])*u*v;const w=wob?Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*wob*Math.sin(t*.5+v*6):0;return [x+w,y+w*.4];};
 c.beginPath();for(let i=0;i<=n1;i++){for(let k=0;k<=n2;k++){const [x,y]=P(i/n1,k/n2);k?c.lineTo(x,y):c.moveTo(x,y);}}for(let k=0;k<=n2;k++){for(let i=0;i<=n1;i++){const [x,y]=P(i/n1,k/n2);i?c.lineTo(x,y):c.moveTo(x,y);}}c.stroke();}
function drawGoalBack(c,side,gt,gw,wob,t){const d=side?-1:1,mouth=side?DW-gw:gw,back=side?DW+40:-40;c.save();
 const FT=[mouth,gt],FB=[mouth,GY],BT=[back+d*0,gt-GD.dy],BB=[back,GY-GD.dy*.5],RT=[mouth-d*GD.dx,gt-GD.dy],RB=[mouth-d*GD.dx,GY-GD.dy];
 c.fillStyle='#00000030';c.beginPath();c.moveTo(mouth,GY+2);c.lineTo(back,GY+2);c.lineTo(back,GY-6);c.lineTo(mouth-d*GD.dx,GY-GD.dy);c.closePath();c.fill();
 c.fillStyle='#ffffff14';c.beginPath();c.moveTo(RT[0],RT[1]);c.lineTo(BT[0],BT[1]);c.lineTo(BB[0],BB[1]);c.lineTo(RB[0],RB[1]);c.fill();
 c.strokeStyle='#ffffffb0';c.lineWidth=1.3;netMesh(c,RT,BT,BB,RB,7,9,wob,t);
 netMesh(c,[back,gt+6],RT,RB,[back,GY],3,9,wob*.6,t);
 postLine(c,[[RB[0],RB[1]],[RT[0],RT[1]],[back,gt-GD.dy+2]],7,'#e8ecf2');c.restore();}
function drawGoalFront(c,side,gt,gw,col,wob,t){const d=side?-1:1,mouth=side?DW-gw:gw,back=side?DW+40:-40;c.save();
 c.strokeStyle='#ffffffa0';c.lineWidth=1.3;netMesh(c,[mouth,gt],[mouth-d*GD.dx,gt-GD.dy],[mouth-d*GD.dx,GY-GD.dy],[mouth,GY],2,9,wob*.4,t);
 c.strokeStyle='#ffffff90';netMesh(c,[back,gt],[mouth-d*GD.dx,gt-GD.dy],[mouth,gt],[back,gt+8],4,2,0,t);
 postLine(c,[[mouth,GY+3],[mouth,gt],[back,gt+4]],10,col||'#ffffff');postLine(c,[[mouth,gt],[mouth-d*GD.dx,gt-GD.dy]],8,col||'#ffffff');
 c.fillStyle=OUT;c.beginPath();c.ellipse(mouth,GY+3,9,4,0,0,7);c.fill();c.restore();}

loadHeads(['bey','chebbi','haddad','aziza','ibnk','kahena','jugurtha','hamilcar','elissa','hannibal','l78gk','l78dh','l78ag','l78ka','l78la']);
