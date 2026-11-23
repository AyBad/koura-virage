// ================= KOURA VIRAGE – DESSIN (style cartoon) =================
const FONT='"Lilita One","Arial Black",Arial,sans-serif',FONT2='"Luckiest Guy","Lilita One","Arial Black",sans-serif';
const OUT='#1a0e06';
function rrc(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
function fillStroke(c,fill,lw){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=OUT;c.stroke();}
function grad(c,x0,y0,x1,y1,a,b){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function rgrad(c,x,y,r,a,b){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.05);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function textOut(c,t,x,y,size,fill,stroke,lw,font){c.font=size+'px '+(font||FONT);c.lineJoin='round';c.lineWidth=lw||Math.max(3,size*.16);c.strokeStyle=stroke||OUT;c.strokeText(t,x,y);c.fillStyle=fill||'#fff';c.fillText(t,x,y);}

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
function drawHead(c,ch,x,y,r,face,o){o=o||{};c.save();c.translate(x,y);c.scale(face,1);c.lineJoin='round';c.lineCap='round';
 const lw=Math.max(2,r*.085),sk=ch.sk,hc=ch.hc||'#1d120a',skD=shade(sk,-.28);
 // éléments derrière la tête
 if(ch.h==='couronne'||ch.h==='longs70'){c.beginPath();c.moveTo(-r*.95,-r*.2);c.quadraticCurveTo(-r*1.25,r*.9,-r*.55,r*1.05);c.lineTo(r*.1,r*.6);c.lineTo(-r*.2,-r*.6);c.closePath();fillStroke(c,grad(c,0,-r,0,r,shade(hc,.15),hc),lw);}
 if(ch.h==='tresses'){for(const dx of [-.62,-.3]){for(let i=0;i<5;i++){c.beginPath();c.ellipse(r*dx,r*(.35+i*.26),r*.14,r*.16,0,0,7);fillStroke(c,hc,lw*.6);}}}
 if(ch.h==='coiffe'){c.beginPath();c.moveTo(-r*1.02,-r*.3);c.quadraticCurveTo(-r*1.35,r*.8,-r*.7,r*1.12);c.lineTo(-r*.2,r*.3);c.closePath();fillStroke(c,grad(c,0,-r,0,r,'#9b4fe0','#5a1f99'),lw);}
 if(ch.h==='turban'){c.beginPath();c.moveTo(-r*.9,0);c.quadraticCurveTo(-r*1.25,r*.6,-r*.9,r*.95);c.lineTo(-r*.55,r*.2);c.closePath();fillStroke(c,'#efe9dc',lw);}
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
 const H=ch.h;
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
 // yeux (3/4 profil)
 const lx=Math.max(-1,Math.min(1,o.lx||.5)),ly=Math.max(-1,Math.min(1,o.ly||0)),ey=-r*.12;
 const eyes=[[r*.2,r*.2],[r*.62,r*.17]];
 if(ch.patch){eyes.pop();}
 eyes.forEach(([ex,er])=>{c.beginPath();c.ellipse(ex,ey,er,er*1.18,0,0,7);fillStroke(c,'#fff',lw*.7);
  if(o.stun){c.lineWidth=lw*.7;c.beginPath();c.moveTo(ex-er*.55,ey-er*.55);c.lineTo(ex+er*.55,ey+er*.55);c.moveTo(ex+er*.55,ey-er*.55);c.lineTo(ex-er*.55,ey+er*.55);c.stroke();}
  else{const ix=ex+lx*er*.42,iy=ey+ly*er*.45;c.beginPath();c.arc(ix,iy,er*.58,0,7);c.fillStyle='#6b3a16';c.fill();c.beginPath();c.arc(ix,iy,er*.32,0,7);c.fillStyle='#120804';c.fill();c.beginPath();c.arc(ix-er*.18,iy-er*.2,er*.16,0,7);c.fillStyle='#fff';c.fill();}
  c.lineWidth=lw*.9;c.strokeStyle=OUT;c.beginPath();c.ellipse(ex,ey,er*1.02,er*1.2,0,Math.PI*1.12,Math.PI*1.88);c.stroke();});
 if(ch.patch){c.beginPath();c.ellipse(r*.62,ey,r*.2,r*.22,0,0,7);c.fillStyle='#111';c.fill();c.strokeStyle='#111';c.lineWidth=r*.05;c.beginPath();c.moveTo(r*.45,ey-r*.15);c.lineTo(-r*.5,-r*.45);c.moveTo(r*.78,ey-r*.12);c.lineTo(r*.95,-r*.42);c.stroke();}
 if(ch.gl){c.lineWidth=r*.06;c.strokeStyle='#222';c.beginPath();c.arc(r*.2,ey,r*.27,0,7);c.moveTo(r*.89,ey);c.arc(r*.62,ey,r*.25,0,7);c.moveTo(r*.47,ey);c.lineTo(r*.37,ey);c.moveTo(-r*.07,ey);c.lineTo(-r*.45,ey-r*.05);c.stroke();}
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
function drawBoot(c,x,y,s,face,col,ang,lvl){c.save();c.translate(x-face*24*s,y);c.scale(face,1);c.rotate(-(ang||0));c.lineJoin='round';const lw=Math.max(2,3*s);
 // semelle
 c.beginPath();c.moveTo(-4*s,-2*s);c.lineTo(58*s,-2*s);c.quadraticCurveTo(66*s,-2*s,64*s,-10*s);c.lineTo(-6*s,-8*s);c.closePath();fillStroke(c,'#f4f4f4',lw);
 c.fillStyle='#333';for(let i=0;i<4;i++){c.fillRect((4+i*15)*s,-1*s,5*s,4*s);}
 // tige
 c.beginPath();c.moveTo(-6*s,-8*s);c.quadraticCurveTo(-8*s,-30*s,6*s,-34*s);c.lineTo(22*s,-32*s);c.quadraticCurveTo(34*s,-22*s,52*s,-20*s);c.quadraticCurveTo(68*s,-18*s,64*s,-10*s);c.closePath();
 fillStroke(c,grad(c,0,-34*s,0,-6*s,shade(col,.3),shade(col,-.2)),lw);
 // éclair décoratif
 c.beginPath();c.moveTo(8*s,-12*s);c.lineTo(26*s,-22*s);c.lineTo(24*s,-16*s);c.lineTo(42*s,-24*s);c.lineTo(30*s,-11*s);c.lineTo(32*s,-16*s);c.closePath();c.fillStyle=lvl>=5?'#fff':lvl>=4?'#ffc400':'#fff';c.globalAlpha=.9;c.fill();c.globalAlpha=1;
 // lacets
 c.strokeStyle='#fff';c.lineWidth=2.2*s;for(let i=0;i<3;i++){c.beginPath();c.moveTo((26+i*7)*s,(-29+i*2.5)*s);c.lineTo((31+i*7)*s,(-24+i*2.5)*s);c.stroke();}
 c.fillStyle='#ffffff55';c.beginPath();c.ellipse(4*s,-26*s,5*s,3*s,-.6,0,7);c.fill();
 c.restore();}
// joueur complet : tête posée sur la chaussure (pas de corps)
function drawPlayerArt(c,ch,club,gear,x,y,s,face,o){o=o||{};const r=34*s*(o.big||1);const hy=y-26*s-r*.92;
 if(!o.noShadow){c.fillStyle='#0005';c.beginPath();c.ellipse(x,y+2,34*s,6*s,0,0,7);c.fill();}
 const bootCol=gear&&gear.shoes?GCOL[gear.shoes]:'#2b2b2b';
 if(!o.noBoot)drawBoot(c,x,y,s,face,bootCol,o.kick||0,gear&&gear.shoes||0);
 drawCollar(c,x+(o.hd||0)*face,hy+r*.32,r,face,club,ch.l78);
 drawHead(c,ch,x+(o.hd||0)*face,hy,r,face,{lx:o.lx,ly:o.ly,mouth:o.mouth,mood:o.mood,stun:o.stun,frozen:o.frozen,band:gear&&gear.band?GCOL[gear.band]:null});
 if(gear&&gear.khomsa){c.save();c.translate(x+face*r*.05,hy+r*1.02);const kc=['','#c87533','#d8d8e0','#ffc400','#2cc26b','#fff6a0'][gear.khomsa];c.fillStyle=kc;c.strokeStyle=OUT;c.lineWidth=1.5*s;c.beginPath();c.arc(0,0,6*s,0,7);c.fill();c.stroke();for(let i=-2;i<=2;i++){c.beginPath();rrc(c,i*2.6*s-1.2*s,-10*s+Math.abs(i)*1.5*s,2.4*s,7*s,1.2*s);c.fill();}c.restore();}
 if(gear&&gear.arm){c.save();c.translate(x-face*r*.75,hy+r*.62);c.rotate(face*.5);c.beginPath();rrc(c,-5*s,-4*s,10*s,8*s,2*s);fillStroke(c,GCOL[gear.arm],1.5*s);c.restore();}
 if(ch.l78&&!o.noBadge){c.save();c.font=(12*s)+'px '+FONT;c.textAlign='center';textOut(c,'78',x+face*r*.95,hy-r*.75,13*s,'#ffd200',OUT,3*s);c.restore();}}
// aperçu dans un canvas DOM
function preview(cnv,chId,club,gear,mode){const d=Math.min(2,devicePixelRatio||1);const w=cnv.clientWidth||100,h=cnv.clientHeight||100;cnv.width=w*d;cnv.height=h*d;const c=cnv.getContext('2d');c.scale(d,d);c.clearRect(0,0,w,h);const ch=CH(chId);
 if(mode==='full'){const s=Math.min(w/100,h/120);drawPlayerArt(c,ch,club||CLUBS[0],gear||{},w/2,h-6*s,s,1,{lx:.5,ly:.1,mouth:'open'});}
 else{const r=Math.min(w,h)*.32;drawCollar(c,w/2-r*.05,h*.47+r*.32,r,1,club||CLUBS[0],ch.l78);drawHead(c,ch,w/2-r*.05,h*.47,r,1,{lx:.5,ly:.1});}}
// ballon
function drawBall(c,x,y,rot,r){c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=rgrad(c,0,0,r,'#ffffff','#d0d4dc');c.fill();
 c.fillStyle='#1d1d22';const pent=(px,py,s)=>{c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;c.lineTo(px+Math.cos(a)*s,py+Math.sin(a)*s);}c.closePath();c.fill();};
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
const DW=960,DH=540,GY=440;
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
function mkScene(V,home,away){const S_={bands:null,layers:[]};const L=()=>{const c=document.createElement('canvas');c.width=DW;c.height=DH;return c;};
 const base=L(),x=base.getContext('2d');x.lineJoin='round';
 if(V.t==='stade'){
  const sky=grad(x,0,0,0,200,'#5fb6ff','#bfe6ff');x.fillStyle=sky;x.fillRect(0,0,DW,DH);
  x.fillStyle='#ffffffcc';[[120,40],[420,26],[760,50]].forEach(([cx,cy])=>{x.beginPath();x.arc(cx,cy,18,0,7);x.arc(cx+20,cy-8,22,0,7);x.arc(cx+44,cy,18,0,7);x.fill();});
  // structure de tribune
  x.fillStyle=grad(x,0,70,0,330,'#8a93a3','#5b6475');x.fillRect(0,80,DW,260);
  x.fillStyle='#6d7686';for(let i=0;i<9;i++)x.fillRect(0,96+i*24,DW,4);
  // pylônes d'éclairage
  [90,DW-90].forEach(px=>{x.strokeStyle='#3d4452';x.lineWidth=4;x.beginPath();x.moveTo(px-14,96);x.lineTo(px,20);x.lineTo(px+14,96);x.stroke();for(let i=0;i<5;i++){x.beginPath();x.moveTo(px-12+i*1.5,90-i*15);x.lineTo(px+12-i*1.5,80-i*15);x.stroke();}
   x.beginPath();rrc(x,px-34,4,68,26,4);x.fillStyle='#2b313d';x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();for(let i=0;i<4;i++){x.fillStyle='#fffbd0';x.beginPath();x.arc(px-24+i*16,17,6,0,7);x.fill();}});
  // toit de la tribune
  x.fillStyle='#4a5160';x.fillRect(0,72,DW,12);x.fillStyle='#3d4452';for(let i=0;i<DW;i+=120)x.fillRect(i+58,60,6,24);
 } else if(V.t==='plage'){x.fillStyle=grad(x,0,0,0,300,'#3aa0e8','#bfe6ff');x.fillRect(0,0,DW,DH);x.fillStyle='#fff6c8';x.beginPath();x.arc(820,70,38,0,7);x.fill();
  x.fillStyle='#1f7fc4';x.fillRect(0,250,DW,80);x.fillStyle='#ffffff55';for(let i=0;i<40;i++)x.fillRect(Math.random()*DW,255+Math.random()*70,30,2);
  x.fillStyle='#f2d7a0';x.fillRect(0,320,DW,40);
  [[110,'#e70013'],[480,'#ffd200'],[850,'#1f8a4c']].forEach(([px,cc])=>{x.strokeStyle='#5a3a1a';x.lineWidth=5;x.beginPath();x.moveTo(px,230);x.lineTo(px,330);x.stroke();x.beginPath();x.moveTo(px-60,250);x.quadraticCurveTo(px,180,px+60,250);x.closePath();x.fillStyle=cc;x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();});
 } else {const sk=[['#7ec8f2','#e8f6ff'],['#f6a35a','#ffe2b0'],['#5fa8d8','#dbeefa']][V.sky||0];x.fillStyle=grad(x,0,0,0,300,sk[0],sk[1]);x.fillRect(0,0,DW,DH);
  let hx=-20;while(hx<DW){const hw=120+Math.random()*90,hh=150+Math.random()*120,hy=330-hh;x.beginPath();x.rect(hx,hy,hw,hh);x.fillStyle=Math.random()<.8?'#f4f1ea':'#ecdcba';x.fill();x.strokeStyle=OUT;x.lineWidth=3;x.stroke();
   x.fillStyle='#00000010';x.fillRect(hx+hw-10,hy,10,hh);
   for(let wy=hy+18;wy<330-80;wy+=46){[hx+16,hx+hw-42].forEach(wx=>{x.beginPath();rrc(x,wx,wy,26,28,4);x.fillStyle='#1f5fd1';x.fill();x.stroke();});}
   x.beginPath();x.moveTo(hx+hw/2-16,330);x.lineTo(hx+hw/2-16,282);x.arc(hx+hw/2,282,16,Math.PI,0);x.lineTo(hx+hw/2+16,330);x.fillStyle='#1f5fd1';x.fill();x.stroke();
   if(Math.random()<.6){x.beginPath();x.ellipse(hx+hw*.7,hy-8,14,9,-.4,0,7);x.fillStyle='#e8e8e8';x.fill();x.stroke();}hx+=hw+6;}
  x.strokeStyle='#444';x.lineWidth=2;x.beginPath();x.moveTo(250,150);x.quadraticCurveTo(360,175,470,150);x.stroke();['#e70013','#fff','#ffd200','#1f8a4c','#1f5fd1'].forEach((cc,i)=>{x.beginPath();x.rect(268+i*40,160+Math.sin(i)*4,22,26);x.fillStyle=cc;x.fill();x.lineWidth=2;x.strokeStyle=OUT;x.stroke();});}
 // supporters (deux images : bras levés/baissés)
 const fans=[];const rows=V.t==='stade'?[[150,.95],[200,1],[250,1.05],[300,1.1]]:V.t==='quartier'?[[300,.95]]:[[318,.9]];
 for(const [ry,s] of rows){const step=V.t==='stade'?30*s:58;for(let fx=10+(ry%60);fx<DW;fx+=step+(V.t==='stade'?Math.random()*4:Math.random()*40)){fans.push({x:fx,y:ry,s,f:mkFan(home,away,fx<DW/2)});}}
 const crowd=[0,1].map(fr=>{const c=L(),cx=c.getContext('2d');for(const F of fans){drawFan(cx,F.f,F.x,F.y,(F.f.g===fr),F.s);}return c;});
 S_.crowd=crowd;
 // devant : grillage, panneaux, pelouse, bande de commandes
 const front=L(),f=front.getContext('2d');f.lineJoin='round';
 if(V.t==='stade'){f.strokeStyle='#c5ccd8aa';f.lineWidth=1.2;for(let i=-40;i<DW+40;i+=14){f.beginPath();f.moveTo(i,250);f.lineTo(i+60,318);f.moveTo(i+60,250);f.lineTo(i,318);f.stroke();}
  f.fillStyle='#4a5160';for(let i=0;i<DW;i+=160)f.fillRect(i,240,6,80);f.fillRect(0,240,DW,5);
  [[0,'KOURA VIRAGE','#e70013'],[240,'SYPHAX APPS','#1f5fd1'],[480,V.n.toUpperCase(),home.c1],[720,'LIGUE 1 • 2026-27','#1f8a4c']].forEach(([bx,t,cc])=>{f.beginPath();rrc(f,bx+6,318,228,30,5);f.fillStyle=grad(f,0,318,0,348,shade(cc,.15),shade(cc,-.25));f.fill();f.strokeStyle=OUT;f.lineWidth=3;f.stroke();f.textAlign='center';f.font='15px '+FONT;textOut(f,t.length>24?t.slice(0,23)+'…':t,bx+120,339,15,'#fff',OUT,3);});
 } else if(V.t==='quartier'){f.beginPath();f.rect(0,300,DW,52);f.fillStyle='#d4bf98';f.fill();f.strokeStyle=OUT;f.lineWidth=3;f.stroke();f.fillStyle='#b9a37c';for(let i=0;i<DW;i+=44)f.fillRect(i,302,3,48);
  f.textAlign='left';textOut(f,'KOURA W BAS',90,338,26,'#e70013',OUT,4);textOut(f,'ALLEZ '+home.s+' !',DW-300,338,26,'#1f5fd1',OUT,4);textOut(f,'ULTRAS 7OUMA',DW/2-90,334,22,'#222','#fff',3);}
 // pelouse en perspective
 const grass=V.t==='plage'?['#f0d49a','#e6c788']:V.t==='quartier'?['#c49a62','#b38a54']:['#3fae4a','#35a040'];
 f.fillStyle=grass[0];f.fillRect(0,348,DW,122);for(let i=0;i<12;i++){if(i%2){f.beginPath();f.moveTo(i*80+(i*80-DW/2)*-.12,348);f.lineTo((i+1)*80+((i+1)*80-DW/2)*-.12,348);f.lineTo((i+1)*80,470);f.lineTo(i*80,470);f.fillStyle=grass[1];f.fill();}}
 if(V.t!=='plage'){f.strokeStyle='#ffffffcc';f.lineWidth=3;f.beginPath();f.moveTo(118,356);f.lineTo(DW-118,356);f.lineTo(DW-30,462);f.lineTo(30,462);f.closePath();f.moveTo(DW/2,356);f.lineTo(DW/2,462);f.stroke();f.beginPath();f.ellipse(DW/2,410,90,28,0,0,7);f.stroke();
  f.beginPath();f.moveTo(105,372);f.lineTo(200,372);f.lineTo(178,446);f.lineTo(50,446);f.stroke();f.beginPath();f.moveTo(DW-105,372);f.lineTo(DW-200,372);f.lineTo(DW-178,446);f.lineTo(DW-50,446);f.stroke();}
 f.fillStyle='#a8743a66';[[150,430],[DW-160,425],[DW/2+120,395]].forEach(([px,py])=>{f.beginPath();f.ellipse(px,py,46,12,0,0,7);f.fill();});
 // bande de terre (commandes)
 f.fillStyle=grad(f,0,470,0,DH,'#7a4a24','#4e2d14');f.fillRect(0,470,DW,DH-470);f.fillStyle='#ffffff14';f.fillRect(0,470,DW,4);f.fillStyle='#00000025';for(let i=0;i<120;i++)f.fillRect(Math.random()*DW,476+Math.random()*60,4,2);
 S_.base=base;S_.front=front;S_.full=crowd.map(cw=>{const c=L(),x=c.getContext('2d');x.drawImage(base,0,0);x.drawImage(cw,0,0);x.drawImage(front,0,0);return c;});
 S_.bands=V.t==='stade'?[[0,80,'#7cc2ff'],[80,348,'#6b7484'],[348,470,grass[0]],[470,DH,'#5e3719']]:V.t==='plage'?[[0,250,'#8ccdf5'],[250,348,'#1f7fc4'],[348,470,grass[0]],[470,DH,'#5e3719']]:[[0,300,['#a8d8f5','#f9c98a','#9ccbe8'][V.sky||0]],[300,348,'#d4bf98'],[348,470,grass[0]],[470,DH,'#5e3719']];
 return S_;}
// buts en perspective (arrière : filet ; avant : montants)
function drawGoalBack(c,side,gt,gw){const sx=side?DW:0,d=side?-1:1,fx=sx+d*gw;c.save();c.lineJoin='round';
 c.fillStyle='#ffffff18';c.beginPath();c.moveTo(sx,gt+10);c.lineTo(fx-d*14,gt-12);c.lineTo(fx-d*14,GY-12);c.lineTo(sx,GY);c.closePath();c.fill();
 c.strokeStyle='#ffffffaa';c.lineWidth=1.2;c.beginPath();for(let t=0;t<=1;t+=.12){const yy=gt+10+(GY-gt-10)*t;c.moveTo(sx,yy);c.lineTo(fx-d*14,gt-12+(GY-gt)*t);}for(let t=0;t<=1;t+=.18){const xx=sx+(fx-d*14-sx)*t;c.moveTo(xx,gt+10-22*t);c.lineTo(xx,GY-12*t);}c.stroke();
 // montant arrière
 c.strokeStyle=OUT;c.lineWidth=8;c.beginPath();c.moveTo(fx-d*14,GY-12);c.lineTo(fx-d*14,gt-12);c.lineTo(sx,gt-12);c.stroke();c.strokeStyle='#e8ecf2';c.lineWidth=4.5;c.stroke();c.restore();}
function drawGoalFront(c,side,gt,gw,col){const sx=side?DW:0,d=side?-1:1,fx=sx+d*gw;c.save();c.lineJoin='round';c.lineCap='round';
 c.strokeStyle='#ffffff99';c.lineWidth=1.2;c.beginPath();for(let t=0;t<=1;t+=.15){c.moveTo(fx,gt+(GY-gt)*t);c.lineTo(fx-d*14,gt-12+(GY-gt)*t);}c.stroke();
 c.strokeStyle=OUT;c.lineWidth=11;c.beginPath();c.moveTo(fx,GY+2);c.lineTo(fx,gt);c.lineTo(fx-d*14,gt-12);c.moveTo(fx,gt);c.lineTo(sx,gt+10);c.stroke();
 c.strokeStyle=col||'#ffffff';c.lineWidth=6.5;c.stroke();c.strokeStyle='#ffffff88';c.lineWidth=2;c.beginPath();c.moveTo(fx-d*1.5,GY);c.lineTo(fx-d*1.5,gt+2);c.stroke();c.restore();}
