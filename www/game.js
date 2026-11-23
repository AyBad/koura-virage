// ================= KOURA VIRAGE – MOTEUR DE MATCH =================
const W=960,H=540,GW=72,GH=150,BR=15,HR=31,PS=.86,STEP=1000/60;
const cv=document.getElementById('cv'),g=cv.getContext('2d',{alpha:false});
let VW=0,VH=0,DPR=1,SC=1,OX=0,OY=0,BTNC={};
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);VW=innerWidth;VH=innerHeight;cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);SC=Math.min(VW/W,VH/H);OX=(VW-W*SC)/2;OY=(VH-H*SC)/2;BTNC={};}
addEventListener('resize',resize);
const pick=a=>a[Math.random()*a.length|0];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
// ----- entrées -----
const keys={},touches=new Map();
const KTAP={Space:'0j',ArrowUp:'0j',KeyW:'0j',KeyX:'0lo',KeyS:'0lo',KeyZ:'0hi',KeyC:'0hi',Digit1:'0s0',Digit2:'0s1',Digit3:'0s2'},KTAP2={KeyW:'0j',KeyS:'0lo',KeyE:'0hi',ArrowUp:'1j',ArrowDown:'1lo',Enter:'1hi'};
addEventListener('keydown',e=>{if(e.repeat)return;keys[e.code]=true;if(INTRO&&(e.code==='Enter'||e.code==='Space')){introTap();return;}if(M&&M.state!=='vs'){if(e.code==='Escape')pauseMatch();const t=(M.duo?KTAP2:KTAP)[e.code];if(t)M.tap[t]=true;}else if(M&&M.state==='vs'&&(e.code==='Space'||e.code==='Enter'))M.vsT=Math.max(M.vsT,170);});
addEventListener('keyup',e=>{keys[e.code]=false;});
function gp(e){return {x:(e.clientX-OX)/SC,y:(e.clientY-OY)/SC};}
// [action, joueur, x, y, rayon, couleur, forme]
function btns(){if(!M||M.state==='vs')return[];const L=[];
 if(M.duo){L.push(['l',0,42,500,28,'#ff9a1a'],['r',0,108,500,28,'#ff9a1a'],['j',0,174,500,28,'#3fc25a'],['lo',0,240,500,28,'#ff6a1a'],['hi',0,306,500,28,'#ff6a1a']);
  L.push(['l',1,W-306,500,28,'#ff9a1a'],['r',1,W-240,500,28,'#ff9a1a'],['j',1,W-174,500,28,'#3fc25a'],['lo',1,W-108,500,28,'#ff6a1a'],['hi',1,W-42,500,28,'#ff6a1a']);}
 else{L.push(['l',0,56,501,32,'#ff9a1a'],['r',0,140,501,32,'#ff9a1a'],['lo',0,W-236,501,32,'#ff6a1a'],['hi',0,W-152,501,32,'#ff6a1a'],['j',0,W-60,501,34,'#3fc25a']);
  M.P[0].sps.forEach((s,i)=>L.push(['s'+i,0,104+i*62,36,26,SP[s.id].c,'round']));
  if(!M.tuto)L.push(['chat',0,36,96,22,'#3fc25a','round']);}
 L.push(['pause',0,36,36,24,'#3fc25a','round']);if(M.tuto)L.push(['skip',0,W-40,118,22,'#3fc25a','round']);return L;}
function hitBtn(p){let best=null,bd=1e9;for(const b of btns()){const d=Math.hypot(p.x-b[2],p.y-b[3]);if(d<b[4]*1.35&&d<bd){bd=d;best=b;}}return best;}
cv.addEventListener('pointerdown',e=>{e.preventDefault();au();if(INTRO){introTap();return;}if(!M)return;if(M.state==='vs'){M.vsT=Math.max(M.vsT,170);return;}
 if(M.chatOpen){const p=gp(e);const i=chatHit(p);M.chatOpen=false;if(i>=0)sayChat(M.P[0],CHAT[i]);return;}
 const b=hitBtn(gp(e));if(!b)return;if(b[0]==='pause'){pauseMatch();return;}if(b[0]==='skip'){endTuto(true);return;}if(b[0]==='chat'){M.chatOpen=true;return;}
 touches.set(e.pointerId,b);M.tap[b[1]+b[0]]=true;});
cv.addEventListener('pointermove',e=>{if(!M||!touches.has(e.pointerId))return;const o=touches.get(e.pointerId);if(o[0]!=='l'&&o[0]!=='r')return;const b=hitBtn(gp(e));if(b&&(b[0]==='l'||b[0]==='r')&&b[1]===o[1])touches.set(e.pointerId,b);});
['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,e=>touches.delete(e.pointerId)));
function held(side,k){for(const b of touches.values())if(b[1]===side&&b[0]===k)return true;return false;}
function input(side){const T=k=>!!M.tap[side+k];const I={l:held(side,'l'),r:held(side,'r'),j:T('j')||held(side,'j'),lo:T('lo'),hi:T('hi'),s:[T('s0'),T('s1'),T('s2')]};
 if(M.duo){if(side===0){I.l=I.l||keys.KeyA;I.r=I.r||keys.KeyD;I.j=I.j||keys.KeyW;}else{I.l=I.l||keys.ArrowLeft;I.r=I.r||keys.ArrowRight;I.j=I.j||keys.ArrowUp;}}
 else{I.l=I.l||keys.ArrowLeft||keys.KeyA;I.r=I.r||keys.ArrowRight||keys.KeyD;I.j=I.j||keys.ArrowUp||keys.Space||keys.KeyW;}
 return I;}
// ----- messages rapides -----
function chatRects(){return CHAT.map((t,i)=>({x:60+(i%2)*190,y:120+Math.floor(i/2)*52,w:180,h:44,t}));}
function chatHit(p){return chatRects().findIndex(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);}
function sayChat(p,t){p.bub={t,d:150};}
// ----- joueurs -----
let M=null;
class P{constructor(side,chId,club,name,ai,gear,lvl){this.side=side;this.ch=CH(chId);this.club=club;this.name=name;this.ai=ai;this.lvl=lvl||1;this.face=side?-1:1;this.gear=gear||{boots:'b_base'};this.st=stats(chId,this.gear);this.sps=[];this.reset();this.bub=null;this.ait=0;this.atx=side?700:260;}
 reset(){this.x=this.side?W-250:250;this.y=GY;this.px=this.x;this.py=this.y;this.vx=0;this.vy=0;this.kick=0;this.kt='lo';this.kd=false;this.hd=0;this.stun=0;this.frz=0;this.glue=0;this.big=0;this.chg=0;this.chgK='';this.kcd=0;this.sq=0;this.land=0;}
 get hr(){return HR*(this.big>0?1.5:1);}get hx(){return this.x;}get hy(){return this.y-22-this.hr*.92;}}
function stats(chId,gr){const c=CH(chId),b={kp:0,spd:0,jmp:0,hd:0};if(gr){const cb=CLVB[((gr.clv&&gr.clv[chId])||1)-1]||0;for(const k in b)b[k]+=cb;for(const sl of GSLOTS){const e=EQ(gr[sl]);if(!e)continue;const lv=(gr.lv&&gr.lv[e.id])||1,f=1+.5*(lv-1);for(const k in e.b)b[k]+=e.b[k]*f;}}
 return {spd:c.spd*(1+b.spd/100),jmp:c.jmp*(1+b.jmp/100),kp:c.kp*(1+b.kp/100),hd:(c.hd||1)*(1+b.hd/100),res:1,b};}
function cdist(a,b){const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return Math.abs((x>>16)-(y>>16))+Math.abs((x>>8&255)-(y>>8&255))+Math.abs((x&255)-(y&255));}
function awayKit(k1,k2){if(cdist(k1.c1,k2.c1)>140)return k2;const alt=Object.assign({},k2);if(cdist(k2.c2,k1.c1)>140&&cdist(k2.c2,k1.c2)>100){alt.c1=k2.c2;alt.c2=k2.c1;}else{alt.c1=cdist(k1.c1,'#ffffff')>200&&cdist(k1.c2,'#ffffff')>120?'#ffffff':'#1d2b5a';alt.c2=k2.c1;}return alt;}
let SCN=null;
function newMatch(o){const p1=new P(0,o.c1,CL(o.k1),o.n1,o.ai1||0,o.g1,o.lv1),p2=new P(1,o.c2,awayKit(CL(o.k1),CL(o.k2)),o.n2,o.ai2,o.g2,o.lv2);
 if(!o.duo){p1.sps=(o.tuto?['harissa']:S.eq.filter(id=>spLvl(id)>0)).slice(0,3).map(id=>({id,n:o.tuto?1:spLvl(id)}));p2.sps=(o.aiSp||[]).map(id=>({id,n:1}));}
 M={o,duo:!!o.duo,tuto:o.tuto?{i:0,t:0}:null,P:[p1,p2],b:{x:W/2,y:150,px:W/2,py:150,vx:0,vy:0,fire:0,zig:0,zt:0,wind:0,windDir:1,rot:0,lt:null},score:[0,0],t:0,state:o.noVs?'ready':'vs',vsT:0,st:150,tap:{},fx:[],proj:[],walls:[],msg:null,shake:0,clapT:200,V:o.venue,gs:[1,1],gst:[1,1],cageT:0,ev:{goal:0,head:0,high:0,sp:0,moved:0,jump:0,lo:0,hi:0,header:0},crowdT:0,chatOpen:false,goalFlash:0,net:[0,0],slow:0,zoom:null,scorePop:[0,0],trail:[],flash:[],tick:0,postT:0};
 M.bsk=(EQ(p1.gear&&p1.gear.ball)||{}).kind||'classique';M.celeb=null;
 if(o.tuto)M.st=20;SCN=mkScene(o.venue,CL(o.k1),CL(o.k2));if(M.state==='ready')crowd(true,o.venue.t==='stade'?.08:.03);}
const gtop=side=>GY-GH*M.gs[side];
function say(t,d,col){M.msg={t,d:d||100,col:col||'#fff',max:d||100};}
function resetKick(){M.P.forEach(p=>p.reset());const b=M.b;b.x=W/2;b.y=150;b.px=b.x;b.py=b.y;b.vx=(Math.random()-.5)*1.2;b.vy=0;b.fire=0;b.zig=0;b.wind=0;b.lt=null;M.proj=[];M.walls=[];M.cageT=0;M.gst=[1,1];}
function useSP(p,i){const s=p.sps[i];if(!s||s.n<=0||M.state!=='play')return;const o=M.P[1-p.side];s.n--;const k=s.id,res=o.st.res;
 sfx('power');vib(30);say(SHOUT[k],70,SP[k].c);if(p.side===0)M.ev.sp++;
 if(k==='harissa'||k==='fennec'){p.chg=300;p.chgK=k;}
 else if(k==='chlaka')M.proj.push({x:p.x+p.face*24,y:p.hy,vx:p.face*11,vy:-4,o:p.side,r:0});
 else if(k==='bard'){o.frz=150*res;for(let j=0;j<20;j++)M.fx.push({x:o.x+(Math.random()-.5)*70,y:o.hy+(Math.random()-.5)*70,vx:(Math.random()-.5)*2,vy:-Math.random()*2,l:50,c:'#bfe8ff',s:5});}
 else if(k==='boutellis'){o.glue=180*res;}
 else if(k==='cage'){M.gst[o.side]=1.38;M.gst[p.side]=.72;M.cageT=480;}
 else if(k==='ras')p.big=360;
 else if(k==='kaskrout')M.walls.push({side:p.side,t:300});
 else if(k==='chergui'){M.b.wind=150;M.b.windDir=p.face;}}
function shoot(p,b,type){const k=p.st.kp;
 if(p.chg>0){const kind=p.chgK;p.chg=0;if(kind==='harissa'){b.fire=90;b.vx=p.face*17;b.vy=type==='high'?-3:-.5;}else{b.zig=90;b.zt=0;b.vx=p.face*11.5;b.vy=0;}b.lt={s:p.side,t:kind};M.shake=8;return;}
 if(type==='head'){b.vx=p.face*8.2*p.st.hd+p.vx*.3;b.vy=p.kt==='high'?-7:1.5;}
 else if(type==='high'){b.vx=p.face*(6.6+Math.random())*k+p.vx*.3;b.vy=-11.2*Math.sqrt(k);}
 else{b.vx=p.face*(10.2+Math.random()*1.2)*k+p.vx*.35;b.vy=-3.4;}
 b.lt={s:p.side,t:type};}
function circ(b,cx,cy,cr,pvx,pvy,e){const dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy),m=cr+BR;if(d>=m||d===0)return false;const nx=dx/d,ny=dy/d;b.x=cx+nx*m;b.y=cy+ny*m;const rvx=b.vx-pvx,rvy=b.vy-pvy,vn=rvx*nx+rvy*ny;
 if(vn<0){b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;}b.vx+=pvx*.12;if(pvy<0)b.vy+=pvy*.25;return true;}
function seg(b,x1,x2,y){const cx=clamp(b.x,x1,x2),dx=b.x-cx,dy=b.y-y,d=Math.hypot(dx,dy),m=BR+5;if(d<m&&d>0){const nx=dx/d,ny=dy/d;b.x=cx+nx*m;b.y=y+ny*m;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.6*vn*nx;b.vy-=1.6*vn*ny;if(Math.abs(vn)>5){sfx('post');M.shake=Math.max(M.shake,5);burst(cx,y,'#ffffff');M.postT=40;}}}}
function headZone(p,b){return Math.hypot(b.x-(p.hx+p.face*8),b.y-p.hy)<p.hr+BR+20&&b.y<p.y-44;}
function dust(x,y,n){for(let i=0;i<n;i++)M.fx.push({x:x+(Math.random()-.5)*30,y:y-2,vx:(Math.random()-.5)*2.4,vy:-Math.random()*1.6,l:26+Math.random()*12,c:M.V.t==='stade'?'#d8f0c8':'#e8cfa0',s:7+Math.random()*6,dust:1});}
function burst(x,y,col){M.fx.push({x,y,l:12,burst:1,c:col||'#fff'});for(let i=0;i<8;i++){const a=Math.random()*7;M.fx.push({x,y,vx:Math.cos(a)*4,vy:Math.sin(a)*4,l:14,c:col||'#fff8c0',s:4});}}
function stepPlayer(p,I){const b=M.b;
 for(const k of ['stun','frz','glue','big','chg','kick','kcd','hd'])if(p[k]>0)p[k]--;
 const can=p.stun<=0&&p.frz<=0&&M.state==='play',mv=can&&p.glue<=0,sp=3.7*p.st.spd;
 let ax=0;if(mv){if(I.l)ax-=1;if(I.r)ax+=1;}
 p.vx+=(ax*sp-p.vx)*(p.y<GY-1?.12:.28);
 if(mv&&I.j&&p.y>=GY-.5){p.vy=-11.6*p.st.jmp;p.sq=.18;if(p.side===0)M.ev.jump=1;sfx('jump');dust(p.x,GY,6);}
 if(can&&(I.lo||I.hi)&&p.kcd<=0){const t=I.hi?'high':'lo';p.kt=t;p.kcd=18;if(p.side===0)M.ev[t==='high'?'hi':'lo']=1;
  if(headZone(p,b)){p.hd=12;shoot(p,b,'head');sfx('head');burst(b.x,b.y,'#fff');if(p.side===0)M.ev.header=1;}else{p.kick=14;p.kd=false;sfx('swish');}}
 if(can&&I.s)I.s.forEach((v,i)=>{if(v)useSP(p,i);});
 const wasAir=p.y<GY-1,fall=p.vy;p.vy+=.5;p.x+=p.vx;p.y+=p.vy;if(p.y>GY){p.y=GY;p.vy=0;if(wasAir&&fall>4){p.sq=-.16;dust(p.x,GY,8);}}p.x=clamp(p.x,30,W-30);p.sq*=.82;if(p.y>=GY&&Math.abs(p.vx)>2.5&&M.t%9===0)dust(p.x-p.face*20,GY,1);
 if(p.side===0&&Math.abs(p.x-250)>90)M.ev.moved=1;
 const gt=Math.min(gtop(0),gtop(1));if((p.x<GW+20||p.x>W-GW-20)&&p.hy-p.hr<gt+4&&p.vy<0)p.vy=0;}
function stepAI(p){const o=M.P[1-p.side],b=M.b,d=p.ai,att=p.face;const I={l:0,r:0,j:0,lo:0,hi:0,s:[0,0,0]};
 if(M.tuto){const home=p.side?W-115:115;if(Math.abs(p.x-home)>8)I[p.x<home?'r':'l']=1;return I;}
 p.ait--;if(p.ait<=0){p.ait=Math.round(16-11*d);let bx=clamp(b.x+b.vx*(6+d*14)*.5,40,W-40);const behind=(b.x-p.x)*att<-4;let tx=behind?b.x-att*58:bx-att*(22+Math.random()*14*(1-d));
  const myG=p.side?W-50:50;if(b.vx*att<-4&&Math.abs(b.x-myG)<430&&(b.x-p.x)*att<60)tx=(b.x+myG)/2;if(Math.random()>.55+d*.45)tx+=(Math.random()-.5)*160*(1-d);p.atx=tx;}
 const dx=p.atx-p.x;if(dx>10)I.r=1;else if(dx<-10)I.l=1;
 if(b.y<p.hy-4&&Math.abs(b.x-p.x)<85&&b.vy>-2&&Math.random()<.05+d*.16)I.j=1;
 const front=(b.x-p.x)*att>-4;
 if(front&&headZone(p,b)&&Math.random()<.15+d*.45)I[Math.random()<.4?'hi':'lo']=1;
 const fd=Math.hypot(b.x-(p.x+att*30),b.y-(p.y-16));if(fd<58&&front&&Math.random()<.14+d*.45){const block=(o.x-p.x)*att>0&&Math.abs(o.x-p.x)<170;I[block&&Math.random()<.65?'hi':'lo']=1;}
 if(p.sps.length&&M.t>200&&Math.random()<.005+d*.005){const i=p.sps.findIndex(s=>s.n>0);if(i>=0){const k=p.sps[i].id;const ok=k==='kaskrout'?b.vx*att<-3:(k==='harissa'||k==='fennec')?Math.hypot(b.x-p.x,b.y-p.y)<200:true;if(ok)I.s[i]=1;}}
 if(d<.5&&Math.random()<(.5-d)*.3)I.l=I.r=0;return I;}
function stepBall(){const b=M.b;const grav=(b.fire>0||b.zig>0)?0:.34;
 if(b.fire>0)b.fire--;if(b.wind>0){b.wind--;b.vx+=b.windDir*.25;}
 if(b.zig>0){b.zig--;b.zt++;b.vy=Math.sin(b.zt*.3)*5;}
 b.vy+=grav;b.vx*=.996;const sp=Math.hypot(b.vx,b.vy),mx=b.fire>0?19:15;if(sp>mx){b.vx*=mx/sp;b.vy*=mx/sp;}
 const touched=[false,false];
 for(let sub=0;sub<2;sub++){b.x+=b.vx/2;b.y+=b.vy/2;
  if(b.y>GY-BR){b.y=GY-BR;if(b.vy>0){b.vy*=-.6;if(Math.abs(b.vy)<1.2)b.vy=0;}b.vx*=.98;if(b.zig>0)b.zig=0;}
  if(b.y<BR){b.y=BR;b.vy=Math.abs(b.vy)*.6;}
  if(b.x<BR){b.x=BR;b.vx=Math.abs(b.vx)*.5;}if(b.x>W-BR){b.x=W-BR;b.vx=-Math.abs(b.vx)*.5;}
  seg(b,0,GW+4,gtop(0));seg(b,W-GW-4,W,gtop(1));
  for(const w of M.walls){const x0=w.side?W-GW-34:GW+6,x1=x0+28,top=gtop(w.side)-10;if(b.x+BR>x0&&b.x-BR<x1&&b.y+BR>top){const fromL=b.x<(x0+x1)/2;if(b.y<top+BR&&b.vy>0&&b.x>x0&&b.x<x1){b.y=top-BR;b.vy*=-.5;}else{b.x=fromL?x0-BR:x1+BR;b.vx=(fromL?-1:1)*Math.abs(b.vx)*.7;}}}
  for(const p of M.P){
   if(b.fire>0&&b.lt&&b.lt.s!==p.side){if(Math.hypot(b.x-p.hx,b.y-p.hy)<p.hr+BR||Math.hypot(b.x-p.x,b.y-(p.y-16))<20+BR){if(p.stun<=0){p.stun=60*p.st.res;p.vx=b.vx>0?6:-6;p.vy=-5;vib(40);for(let i=0;i<14;i++)M.fx.push({x:p.hx,y:p.hy,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6,l:30,c:'#ff7a00',s:6});}continue;}}
   const h1=circ(b,p.hx,p.hy,p.hr,p.vx,p.vy,.5),h2=circ(b,p.x+p.face*9,p.y-12,17,p.vx,p.vy,.35);
   if(h1||h2){touched[p.side]=true;if(Math.hypot(b.vx,b.vy)>4&&sub===0)sfx('bump');b.lt={s:p.side,t:h1?'head':'body'};if(p.chg>0)shoot(p,b,'lo');}
   if(p.kick>0&&!p.kd&&p.kick<12){const fx=p.x+p.face*26,fy=p.y-(p.kt==='high'?19:12);if(Math.hypot(b.x-fx,b.y-fy)<BR+26){p.kd=true;shoot(p,b,p.kt);sfx('kick');M.shake=Math.max(M.shake,4);burst(b.x,b.y,'#fff6a0');}}}}
 // ballon coincé entre les deux joueurs : il est éjecté vers le haut
 if(touched[0]&&touched[1]){b.vy=-8.5;b.vx*=.25;b.y-=4;}
 if(b.x<GW-6&&b.y>gtop(0)+4)goal(1);else if(b.x>W-GW+6&&b.y>gtop(1)+4)goal(0);
 if((b.x<GW||b.x>W-GW)&&b.y<gtop(b.x<W/2?0:1)&&Math.abs(b.vx)<.4&&Math.abs(b.vy)<.6){b.vx=b.x<W/2?2.5:-2.5;b.vy=-3;}}
function goal(side){if(M.state!=='play')return;M.score[side]++;M.state='goal';M.st=150;M.net[1-side]=14;M.slow=40;M.zoom={t:150,x:side?W-80:80,y:GY-80};M.scorePop[side]=1;sfx('goal');vib(80);M.shake=12;M.goalFlash=1;
 const t=M.b.lt&&M.b.lt.s===side?M.b.lt.t:'lo';if(side===0){M.ev.goal++;if(t==='head')M.ev.head++;if(t==='high')M.ev.high++;}
 M.celeb={side,kind:(EQ(M.P[side].gear.celeb)||{}).kind||'drapeau'};const me_=M.duo||side===0;say(t==='head'?'TÊTE !':t==='high'?'LOB !':'GOOOL !',140,me_?'#ffd200':'#ff5a5a');
 const op=M.P[1];if(op.ai&&Math.random()<.35)setTimeout(()=>{if(M&&M.P[1]===op)sayChat(op,side===1?pick(['Hhhhh 😂','Barcha ! 🔥','Yalla ! 💪']):pick(['Ya khsara 😩','Chbik ?! 😅','Mrigel 👍']));},900);
 const cl=M.P[side].club;for(let i=0;i<110;i++)M.fx.push({x:side?W-90:90,y:gtop(1-side)+50,vx:(Math.random()-.5)*14,vy:-Math.random()*13,l:90+Math.random()*50,c:pick([cl.c1,cl.c2,'#ffd200','#fff']),s:6,gr:.25,cf:1,rot:Math.random()*6});
 if(crowdG&&AC)crowdG.g.gain.setTargetAtTime(.25,AC.currentTime,.1);setTimeout(()=>{if(crowdG&&AC)crowdG.g.gain.setTargetAtTime(.07,AC.currentTime,.5);},1800);}
function stepProj(){for(const q of M.proj){q.vy+=.25;q.x+=q.vx;q.y+=q.vy;q.r+=.4;const o=M.P[1-q.o];if(Math.hypot(q.x-o.hx,q.y-o.hy)<o.hr+12){o.stun=110*o.st.res;q.dead=1;vib(40);sfx('bump');}if(q.y>GY||q.x<0||q.x>W)q.dead=1;}M.proj=M.proj.filter(q=>!q.dead);
 for(const w of M.walls)w.t--;M.walls=M.walls.filter(w=>w.t>0);
 if(M.cageT>0){M.cageT--;if(M.cageT<=0)M.gst=[1,1];}for(let s=0;s<2;s++)M.gs[s]+=(M.gst[s]-M.gs[s])*.08;}
// ----- match démo -----
const TUTO=[{t:'Bouge avec ◀ ▶',k:'moved'},{t:'Saute avec la flèche verte',k:'jump'},{t:'Tir BAS : un tir rapide au ras du sol',k:'lo',ball:'front'},{t:'Tir HAUT : un lob par-dessus l\'adversaire',k:'hi',ball:'front'},
 {t:'Ballon à hauteur de tête : appuie sur un tir = TÊTE !',k:'header',ball:'head'},{t:'Super pouvoir en haut à gauche, puis tire !',k:'sp',ball:'front'},{t:'Maintenant, marque un but !',k:'goal'}];
function tutoStep(){const T=M.tuto,st=TUTO[T.i];if(!st)return;T.t++;const p=M.P[0],b=M.b;
 if(T.t===1&&st.ball){M.ev[st.k]=0;if(st.ball==='front'){b.x=p.x+75;b.y=GY-50;}else{b.x=p.x+24;b.y=110;}b.vx=0;b.vy=0;b.px=b.x;b.py=b.y;}
 if(st.ball==='head'&&b.y>GY-30&&T.t>50){b.x=clamp(p.x+24,120,W-120);b.y=110;b.vx=0;b.vy=0;b.px=b.x;b.py=b.y;}
 if(M.ev[st.k]&&T.t>20){T.i++;T.t=0;sfx('coin');}}
function endTuto(skip){if(!M||!M.tuto)return;S.tuto=1;save();M.state='end';crowd(false);touches.clear();M=null;SCN=null;
 if(skip){showUI();return;}S.dt+=150;S.chests.push('argent');save();sfx('chest');showUI();
 modal(`<h2 class="ttl g">Bravo, tu sais jouer !</h2><div class="txt">Match démo terminé : <b class="y">+150 DT</b> et un <b class="y">coffre en argent</b> !</div><div class="row"><button class="bt y" data-a="open">OUVRIR LE COFFRE</button></div>`,a=>{if(a==='open')openChest();},true);}
function step(){if(!M||M.paused)return;
 if(M.state==='vs'){M.vsT++;if(M.vsT===110)sfx('slam');if(M.vsT>=200){M.state='ready';M.st=150;crowd(true,M.V.t==='stade'?.08:.03);}return;}
 if(M.state==='ready'){M.st--;if(M.st===120||M.st===80||M.st===40)sfx('beep');if(M.st<=0){M.state='play';sfx('whistle');M.goT=40;}}
 else if(M.state==='goal'){M.st--;if(M.st<=0){if(M.tuto){endTuto(false);return;}if(M.t>=MATCH_S*60){endMatch();return;}resetKick();M.state='ready';M.st=120;}}
 if(M.state==='play'){if(M.tuto)tutoStep();else M.t++;if(!M)return;if(M.t>=MATCH_S*60){endMatch();return;}M.clapT--;if(M.clapT<=0){M.clapT=240+Math.random()*200;if(M.V.t==='stade')sfx('clap');}}
 const I0=M.P[0].ai?stepAI(M.P[0]):input(0),I1=M.P[1].ai?stepAI(M.P[1]):(M.duo?input(1):{});
 stepPlayer(M.P[0],I0);stepPlayer(M.P[1],I1);
 const a=M.P[0],c=M.P[1];const dx=c.x-a.x,min=(a.hr+c.hr)*.95;if(Math.abs(dx)<min&&Math.abs(a.y-c.y)<85){const push=(min-Math.abs(dx))/2*(dx>=0?1:-1);a.x-=push;c.x+=push;}
 if(M.state==='play'||M.state==='goal')stepBall();else{M.b.vy+=.25;M.b.y=Math.min(M.b.y+M.b.vy,150);if(M.b.y>=150)M.b.vy=0;}
 stepProj();
 for(const f of M.fx){f.x+=f.vx;f.y+=f.vy;f.vy+=f.gr||0;if(f.cf)f.vx*=.98;f.l--;}M.fx=M.fx.filter(f=>f.l>0);
 const tk=M.t+(M.tuto?M.tuto.t:0);
 if(M.b.fire>0&&tk%2===0)M.fx.push({x:M.b.x,y:M.b.y,vx:-M.b.vx*.1+(Math.random()-.5),vy:(Math.random()-.5)*2,l:24,c:Math.random()<.5?'#ff4d00':'#ffd200',s:9});
 if(M.b.zig>0&&tk%2===0)M.fx.push({x:M.b.x,y:M.b.y,vx:0,vy:0,l:16,c:'#f2d7a0',s:6});
 if(M.b.wind>0&&tk%3===0)M.fx.push({x:M.b.x-M.b.windDir*30,y:M.b.y+(Math.random()-.5)*40,vx:M.b.windDir*5,vy:0,l:20,c:'#e0c084',s:4});
 if(M.goT>0)M.goT--;M.net[0]*=.95;M.net[1]*=.95;M.scorePop[0]*=.9;M.scorePop[1]*=.9;if(M.zoom){M.zoom.t--;if(M.zoom.t<=0)M.zoom=null;}if(M.postT>0)M.postT--;
 const sp_=Math.hypot(M.b.vx,M.b.vy);M.trail.unshift([M.b.x,M.b.y,sp_]);if(M.trail.length>9)M.trail.pop();
 if(M.shake>0)M.shake*=.85;if(M.msg){M.msg.d--;if(M.msg.d<=0)M.msg=null;}if(M.goalFlash>0)M.goalFlash*=.93;
 for(const p of M.P)if(p.bub){p.bub.d--;if(p.bub.d<=0)p.bub=null;}
 M.tap={};}
// ----- rendu -----
function sprite(kind,r,col){const key=kind+r+col;if(BTNC[key])return BTNC[key];return BTNC[key]=mkBtnSprite(kind==='round'?'round':'sq',r,col,Math.max(1,DPR*SC));}
function drawBtn(b,on,dim,cnt){const [k,side,x,y,r,col,shape]=b;const bim=img('img/ui/'+({l:'left',r:'right',j:'jump',lo:'kick',hi:'lob',pause:'pause'}[k]||'_')+'.webp');if(bim&&!dim){const s=(on?.9:1)*r*2.35;g.drawImage(bim,x-s/2,y-s/2+(on?3:0),s,s);return;}const sp=sprite(shape||'sq',r,col);const s=on?.9:1;g.globalAlpha=dim?.4:1;g.drawImage(sp.c,x-sp.m*s,y-sp.m*s+(on?3:0),sp.m*2*s,sp.m*2*s);
 if(k[0]==='s'&&k.length===2){const s_=M.P[0].sps[+k[1]];g.font=(r*1.05|0)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SP[s_.id].e,x,y+2);g.textBaseline='alphabetic';}
 else btnIcon(g,k,x,y+(on?3:0),r);g.globalAlpha=1;
 if(cnt!=null){g.beginPath();g.arc(x+r*.8,y-r*.8,10,0,7);g.fillStyle=cnt>0?'#e70013':'#666';g.fill();g.lineWidth=2.5;g.strokeStyle=OUT;g.stroke();g.textAlign='center';textOut(g,String(cnt),x+r*.8,y-r*.8+5,13,'#fff',OUT,2.5);}}
const PC=new Map();
function goalSprite(side,gt,kind){const col=M.gs[side]>1.05?'#ffd200':M.gs[side]<.95?'#ff6b6b':'#ffffff',wob=M.net[side];
 if(wob>.3){if(kind==='b')drawGoalBack(g,side,gt,GW,wob,M.tick);else drawGoalFront(g,side,gt,GW,col,wob,M.tick);return;}
 const d=Math.max(1,Math.min(3,DPR*SC)),q=Math.round(gt/3)*3,key='g|'+side+'|'+q+'|'+kind+'|'+col+'|'+d;let s=PC.get(key);
 if(!s){const w=GW+100,h=GY-q+70,c=document.createElement('canvas');c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);const x=c.getContext('2d');x.scale(d,d);const ox=side?DW+50-w:-50;x.translate(-ox,-(q-40));if(kind==='b')drawGoalBack(x,side,q,GW,0,0);else drawGoalFront(x,side,q,GW,col,0,0);s={c,w,h,ox,oy:q-40};PC.set(key,s);}
 g.drawImage(s.c,s.ox,s.oy,s.w,s.h);}
function playerSprite(p,o){const r=p.hr,d=Math.max(1,Math.min(3,DPR*SC)),lx=Math.round(o.lx*2)/2,ly=Math.round(o.ly*2)/2;
 const key=[HREADY,p.ch.id,p.club.c1,p.club.c2,p.gear.hat,p.gear.glasses,p.gear.scarf,r,p.face,o.mouth,o.mood,o.stun?1:0,o.frozen?1:0,o.blink?1:0,lx,ly,d].join('|');let s=PC.get(key);if(s)return s;if(PC.size>500)PC.clear();
 const w=r*3.8,h=r*4+34,c=document.createElement('canvas');c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);const x=c.getContext('2d');x.scale(d,d);
 drawPlayerArt(x,p.ch,p.club,p.gear,w/2,h-4,1,p.face,Object.assign({},o,{lx,ly,noBoot:1,noShadow:1,big:r/HR*PS,bob:0}));s={c,w,h};PC.set(key,s);return s;}
function bootSprite(p,kick){const d=Math.max(1,Math.min(3,DPR*SC)),q=Math.round(kick/.06)*.06,col=EQ(p.gear.boots)||EQ('b_base');const key='b|'+HREADY+'|'+col.id+'|'+p.face+'|'+q+'|'+d;let s=PC.get(key);if(s)return s;
 const w=170,h=120,ox=85,oy=92,c=document.createElement('canvas');c.width=Math.ceil(w*d);c.height=Math.ceil(h*d);const x=c.getContext('2d');x.scale(d,d);drawBoot(x,ox,oy,PS,p.face,col,q);s={c,w,h,ox,oy};PC.set(key,s);return s;}
function drawPlayer(p){const b=M.b;
 if(p.glue>0){g.fillStyle='#e0a10acc';g.beginPath();g.ellipse(p.x,GY+2,46,9,0,0,7);g.fill();g.strokeStyle=OUT;g.lineWidth=2;g.stroke();}
 const kick=p.kick>0?Math.sin((1-p.kick/14)*Math.PI)*(p.kt==='high'?.95:.6):0;
 const air=clamp((GY-p.y)/120,0,1);g.fillStyle='rgba(0,0,0,'+(.38-air*.2)+')';g.beginPath();g.ellipse(p.x,GY+2,34-air*12,6-air*2,0,0,7);g.fill();
 {const cl=(p.gear.clv&&p.gear.clv[p.ch.id])||1;if(cl>1)drawAura(g,p.hx,p.hy,p.hr,cl,Date.now());}
 const sq=p.sq,sy=1+sq,sx=1-sq*.6,run=Math.abs(p.vx)>.5&&p.y>=GY-1?Math.abs(Math.sin(M.t*.35+p.side))*3:0;
 g.save();g.translate(p.x,p.y);g.scale(sx,sy);g.translate(-p.x,-p.y-run);
 const bs=bootSprite(p,kick);g.drawImage(bs.c,p.x-bs.ox,p.y-bs.oy,bs.w,bs.h);
 const blink=(Math.floor(Date.now()/100)+p.side*13)%40===0;
 const o={lx:clamp((b.x-p.x)/200*p.face,-1,1),ly:clamp((b.y-p.hy)/200,-1,1),mouth:(p.y<GY-5||p.kick>0||p.hd>0)?'open':'',mood:M.state==='goal'&&M.celeb?(M.celeb.side===p.side?'joy':'sad'):p.stun>0||p.frz>0||p.glue>0?'sad':(p.chg>0?'angry':''),stun:p.stun>0,frozen:p.frz>0,blink};
 const hs=playerSprite(p,o);g.drawImage(hs.c,p.x-hs.w/2+(p.hd>0?p.face*Math.sin(p.hd/12*Math.PI)*10:0),p.y-hs.h+4-run*.5,hs.w,hs.h);g.restore();
 if(p.stun>0){for(let i=0;i<3;i++){const an=Date.now()*.008+i*2.1;g.textAlign='center';textOut(g,'★',p.hx+Math.cos(an)*p.hr*.9,p.hy-p.hr-6+Math.sin(an)*8,18,'#ffd200',OUT,3);}}
 if(p.chg>0){g.strokeStyle=p.chgK==='harissa'?'#ff6a00':'#ffb347';g.lineWidth=4;g.globalAlpha=.5+Math.sin(Date.now()*.02)*.3;g.beginPath();g.arc(p.hx,p.hy,p.hr+8,0,7);g.stroke();g.globalAlpha=1;}
 if(p.bub){g.font='17px '+FONT;const tw=g.measureText(p.bub.t).width+26;const bx=clamp(p.hx-tw/2,6,W-tw-6),by=p.hy-p.hr-58;g.fillStyle='#fff';rrc(g,bx,by,tw,34,14);g.fill();g.lineWidth=3;g.strokeStyle=OUT;g.stroke();g.beginPath();g.moveTo(p.hx-8,by+33);g.lineTo(p.hx,by+45);g.lineTo(p.hx+8,by+33);g.fillStyle='#fff';g.fill();g.stroke();g.fillRect(p.hx-6,by+30,12,5);g.fillStyle=OUT;g.textAlign='center';g.fillText(p.bub.t,bx+tw/2,by+23);}}
function drawHUD(){g.save();g.translate(W/2,0);g.scale(.8,.8);g.translate(-W/2,0);drawHUD0();g.restore();drawHUD1();}
function drawHUD0(){const sx=W/2;
 g.fillStyle='#3d4452';rrc(g,sx-215,2,430,92,14);g.fill();g.lineWidth=4;g.strokeStyle=OUT;g.stroke();
 const box=(x,w,t,col)=>{g.fillStyle='#14171f';rrc(g,x,34,w,52,8);g.fill();g.lineWidth=3;g.strokeStyle=OUT;g.stroke();g.textAlign='center';g.font='42px '+FONT2;g.globalAlpha=.35;g.fillStyle=col;g.fillText(t,x+w/2+1,80);g.globalAlpha=1;g.fillText(t,x+w/2,78);};
 const pop=(i,x)=>{const k=M.scorePop[i];g.save();g.translate(x+55,60);g.scale(1+k*.5,1+k*.5);g.translate(-x-55,-60);box(x,110,String(M.score[i]),k>.1?'#ffd200':'#b4ff3c');g.restore();};pop(0,sx-200);pop(1,sx+90);
 const rem=M.tuto?'∞':String(Math.max(0,Math.ceil(MATCH_S-M.t/60)));box(sx-60,120,rem,rem!=='∞'&&+rem<=10?'#ff5a3c':'#ffffff');
 [0,1].forEach(i=>{const p=M.P[i],im=shieldImg(CL(M.o[i?'k2':'k1']));const x=i?sx+10:sx-10;if(im.complete)g.drawImage(im,i?x:x-20,8,20,22);g.textAlign=i?'left':'right';textOut(g,String(p.name).slice(0,15),i?x+26:x-26,26,17,'#fff',OUT,3);});
}
function drawHUD1(){const sx=W/2;
 if(M.cageT>0){g.textAlign='center';textOut(g,'CAGE XXL '+Math.ceil(M.cageT/60)+'s',sx,96,18,'#ffd200',OUT,4);}
 if(!M.duo)M.P[1].sps.forEach((s,i)=>{g.globalAlpha=s.n>0?.95:.3;g.font='24px sans-serif';g.textAlign='center';g.fillText(SP[s.id].e,W-40-i*38,44);g.globalAlpha=1;});}
function draw(al){g.setTransform(1,0,0,1,0,0);g.fillStyle='#101320';g.fillRect(0,0,cv.width,cv.height);
 if(INTRO){drawIntro();return;}if(!M){if(MENU&&!ui.classList.contains('hide'))drawMenu();return;}if(!SCN)return;
 if(M.state==='vs'){g.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);drawVS();return;}
 const sv=[];for(const o of [M.P[0],M.P[1],M.b]){sv.push([o,o.x,o.y]);o.x=o.px+(o.x-o.px)*al;o.y=o.py+(o.y-o.py)*al;}
 const sh=M.shake>.5?(Math.random()-.5)*M.shake:0;g.setTransform(DPR*SC,0,0,DPR*SC,DPR*(OX+sh),DPR*(OY+sh*.6));
 if(OX>1||OY>1){const ex=OX/SC+4,ey=OY/SC+4;for(const [y0,y1,cc] of SCN.bands){g.fillStyle=cc;g.fillRect(-ex,y0-(y0===0?ey:0),W+ex*2,y1-y0+(y0===0?ey:0)+(y1===H?ey:0));}}
 g.save();if(M.zoom){const k=Math.sin(Math.min(1,(150-M.zoom.t)/20)*Math.PI/2)*Math.min(1,M.zoom.t/30),z=1+.14*k;g.translate(M.zoom.x,M.zoom.y);g.scale(z,z);g.translate(-M.zoom.x,-M.zoom.y);}
 const now=Date.now(),fr=(M.state==='goal'?Math.floor(now/110):Math.floor(now/420))%2;g.drawImage(SCN.full[fr],-EX,0);drawLive(now,M.V,M.state==='goal');
 goalSprite(0,gtop(0),'b');goalSprite(1,gtop(1),'b');
 for(const w of M.walls){const x0=w.side?W-GW-34:GW+6,top=gtop(w.side)-10;g.beginPath();rrc(g,x0,top,28,GY-top,10);g.fillStyle='#e8b86a';g.fill();g.lineWidth=3;g.strokeStyle=OUT;g.stroke();g.fillStyle='#7ab648';g.fillRect(x0+3,top+30,22,10);g.fillStyle='#d23b2b';g.fillRect(x0+3,top+65,22,8);g.fillStyle='#f2e3a0';g.fillRect(x0+3,top+100,22,10);}
 // ombres
 const b=M.b;const shs=clamp(1-(GY-b.y)/380,.25,1);g.fillStyle='rgba(0,0,0,'+(.35*shs)+')';g.beginPath();g.ellipse(b.x,GY+3,BR*shs*1.2,4.5*shs,0,0,7);g.fill();
 drawPlayer(M.P[0]);drawPlayer(M.P[1]);
 if(M.celeb&&M.state==='goal'){const p=M.P[M.celeb.side],nw=Date.now();drawCeleb(g,M.celeb.kind,p.hx,p.hy-p.hr-52-Math.abs(Math.sin(nw*.008))*10,1.25,nw);}
 for(const q of M.proj){g.save();g.translate(q.x,q.y);g.rotate(q.r);g.beginPath();rrc(g,-15,-6,30,12,6);g.fillStyle='#2c6fe0';g.fill();g.lineWidth=2.5;g.strokeStyle=OUT;g.stroke();g.restore();}
 if(b.fire>0){g.fillStyle='#ff6a0066';g.beginPath();g.arc(b.x,b.y,BR*2.1,0,7);g.fill();g.fillStyle='#ffd20077';g.beginPath();g.arc(b.x,b.y,BR*1.5,0,7);g.fill();}
 for(let i=M.trail.length-1;i>0;i--){const [tx,ty,ts]=M.trail[i];if(ts<7)continue;g.globalAlpha=(1-i/M.trail.length)*.35*Math.min(1,(ts-7)/5);g.fillStyle=b.fire>0?'#ff8a1a':'#ffffff';g.beginPath();g.arc(tx,ty,BR*(1-i/14),0,7);g.fill();}g.globalAlpha=1;
 drawBall(g,b.x,b.y,b.rot,BR,M.bsk);if(b.y<-2){g.fillStyle='#ffd200';g.beginPath();g.moveTo(b.x,6);g.lineTo(b.x-9,20);g.lineTo(b.x+9,20);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=2;g.stroke();}
 goalSprite(0,gtop(0),'f');goalSprite(1,gtop(1),'f');
 for(const f of M.fx){if(f.dust){g.globalAlpha=Math.min(.55,f.l/40);g.fillStyle=f.c;g.beginPath();g.arc(f.x,f.y,f.s*(1.6-f.l/40),0,7);g.fill();continue;}
  if(f.burst){const k=1-f.l/12;g.globalAlpha=1-k;g.save();g.translate(f.x,f.y);g.rotate(k);g.beginPath();for(let i=0;i<16;i++){const rr_=(i%2?10:30)*(.5+k);g.lineTo(Math.cos(i*Math.PI/8)*rr_,Math.sin(i*Math.PI/8)*rr_);}g.closePath();g.fillStyle='#fff6a0';g.fill();g.lineWidth=2;g.strokeStyle=OUT;g.stroke();g.restore();continue;}
  g.globalAlpha=Math.min(1,f.l/20);g.fillStyle=f.c;if(f.cf){g.save();g.translate(f.x,f.y);g.rotate(f.rot+f.l*.15);g.fillRect(-5,-3,10,6);g.restore();}else{g.beginPath();g.arc(f.x,f.y,f.s/2,0,7);g.fill();}}g.globalAlpha=1;
 g.restore();
 if(M.goT>0){const k=M.goT/40;g.save();g.translate(W/2,250);g.scale(1.6-k*.6,1.6-k*.6);g.globalAlpha=Math.min(1,k*2);g.textAlign='center';text3D(g,'GO !',0,30,116,'#e8ffb0','#5fdc1a','#1f6e0c');g.restore();g.globalAlpha=1;}
 drawHUD();
 // flèche verte au-dessus de son joueur avant le coup d'envoi
 if(M.state==='ready'&&!M.duo){const p=M.P[0],yy=p.hy-p.hr-40+Math.sin(now*.01)*6;g.beginPath();g.moveTo(p.x-16,yy-26);g.lineTo(p.x+16,yy-26);g.lineTo(p.x+16,yy-6);g.lineTo(p.x+28,yy-6);g.lineTo(p.x,yy+16);g.lineTo(p.x-28,yy-6);g.lineTo(p.x-16,yy-6);g.closePath();g.fillStyle=grad(g,0,yy-26,0,yy+16,'#b4ff3c','#3fae1a');g.fill();g.lineWidth=4;g.strokeStyle=OUT;g.stroke();}
 if(M.msg){const m=M.msg;const k=clamp((m.max-m.d)/10,0,1);const sc=k<1?.4+k*.8:1.2-.2*Math.min(1,(m.max-m.d-10)/10);g.save();g.translate(W/2,230);g.scale(sc,sc);g.rotate(-.05);g.globalAlpha=Math.min(1,m.d/12);g.textAlign='center';
  if(M.state==='goal'){g.globalCompositeOperation='lighter';g.fillStyle='#ffd20018';for(let i=0;i<14;i++){g.rotate(Math.PI/7);g.beginPath();g.moveTo(0,0);g.lineTo(-40,-400);g.lineTo(40,-400);g.fill();}g.globalCompositeOperation='source-over';}
  if(M.state==='goal'){const el=m.max-m.d,fl=clamp(el/9,0,1);g.translate(-(1-fl)*700,0);g.globalAlpha=1;g.fillStyle='#ffffffaa';for(let i=0;i<7;i++){const ly=-70+i*22,ln=120+(i*67)%160;g.fillRect(-330-ln-(1-fl)*200,ly,ln*(1.2-fl*.6),5);}text3D(g,m.t,0,30,104,'#fff6b0','#ff9d00','#b5470f');}
  else text3D(g,m.t,0,0,54,shade(m.col,.45),m.col,shade(m.col,-.5));g.restore();g.globalAlpha=1;}
 if(M.state==='ready'&&!M.tuto){const n=Math.ceil(M.st/40);if(n>=1&&n<=3){const fr_=(M.st%40)/40;g.save();g.translate(W/2,250);g.scale(.8+fr_*.6,.8+fr_*.6);g.textAlign='center';g.globalAlpha=Math.min(1,(1-fr_)*3);g.fillStyle='#6fe3ff';g.beginPath();g.moveTo(-260+fr_*120,-20);g.quadraticCurveTo(0,-50,40,-5);g.quadraticCurveTo(0,0,-260+fr_*120,10);g.fill();g.globalAlpha=1;text3D(g,String(n),0,40,130,n===1?'#ffb0a0':'#fff3a0',n===1?'#ff3c2a':'#ffb000',n===1?'#8f1a10':'#a8560b');g.restore();}}
 if(M.tuto){const st=TUTO[M.tuto.i];if(st){g.fillStyle='#000c';rrc(g,190,92,580,54,18);g.fill();g.lineWidth=4;g.strokeStyle='#ffd200';g.stroke();g.textAlign='left';textOut(g,'DÉMO '+(M.tuto.i+1)+'/'+TUTO.length,208,113,15,'#ffd200',OUT,3);textOut(g,st.t,208,137,20,'#fff',OUT,3);
  const tgt={moved:['l','r'],jump:['j'],lo:['lo'],hi:['hi'],header:['lo','hi'],sp:['s0']}[st.k]||[];const pulse=8+Math.sin(now*.01)*5;for(const bb of btns())if(tgt.includes(bb[0])&&bb[1]===0){g.strokeStyle='#ffd200';g.lineWidth=5;g.beginPath();g.arc(bb[2],bb[3],bb[4]+pulse,0,7);g.stroke();}}}
 for(const bb of btns()){const k=bb[0],side=bb[1];const P_=M.P[side];if(P_&&P_.ai&&k!=='pause'&&k!=='skip')continue;
  if(k[0]==='s'&&k.length===2){const s=P_.sps[+k[1]];drawBtn(bb,held(side,k),!s||s.n<=0,s?s.n:0);if(P_.chg>0&&s&&s.id===P_.chgK){g.strokeStyle='#ffd200';g.lineWidth=4;g.beginPath();g.arc(bb[2],bb[3],bb[4]+5,0,7);g.stroke();}continue;}
  drawBtn(bb,held(side,k),false);}
 if(M.chatOpen){g.fillStyle='#000a';g.fillRect(0,0,W,H);for(const r of chatRects()){g.beginPath();rrc(g,r.x,r.y,r.w,r.h,14);g.fillStyle='#fff';g.fill();g.lineWidth=4;g.strokeStyle=OUT;g.stroke();g.textAlign='center';g.font='19px '+FONT;g.fillStyle=OUT;g.fillText(r.t,r.x+r.w/2,r.y+29);}g.textAlign='left';textOut(g,'Choisis un message :',60,105,22,'#fff',OUT,4);}
 for(const [o,x,y] of sv){o.x=x;o.y=y;}}
// ----- décor vivant -----
const CLOUDS=[[0,34,1],[340,22,.8],[620,48,1.15]];
function drawLive(now,V,goal){
 for(const [cx0,cy,sc] of CLOUDS){const cx=((cx0+now*.012*sc)%(W+2*EX+240))-120-EX;g.save();g.translate(cx,cy);g.scale(sc,sc);g.globalAlpha=V.t==='stade'?.85:.95;g.fillStyle='#fff';g.beginPath();g.arc(0,0,16,0,7);g.arc(18,-8,20,0,7);g.arc(40,0,16,0,7);g.arc(20,6,16,0,7);g.fill();g.restore();g.globalAlpha=1;}
 if(V.t==='stade'){
  if(Math.random()<(goal?.6:.12))FLASH.push({x:Math.random()*W,y:130+Math.random()*180,l:8});
  for(const f of FLASH){f.l--;g.globalAlpha=f.l/8;g.fillStyle='#fffbe0';g.beginPath();for(let i=0;i<8;i++){const r=i%2?2:9;g.lineTo(f.x+Math.cos(i*Math.PI/4)*r,f.y+Math.sin(i*Math.PI/4)*r);}g.fill();}g.globalAlpha=1;FLASH=FLASH.filter(f=>f.l>0);
  const msgs=['KOURA VIRAGE','SYPHAX APPS','ALLEZ '+(M?M.P[0].club.s:'')+' !','YA3TIK ESSA7A','LIGUE 1 • 2026-27'];
  for(let i=-1;i<5;i++){const bx=i*240+6,by=318;g.save();g.beginPath();rrc(g,bx,by,228,30,5);g.clip();const hue=goal?['#ff2a2a','#ffd200','#2cc26b','#2c6fe0'][(Math.floor(now/150)+i+4)%4]:['#c4161c','#1d4fb8','#14171f','#1f8a4c'][(i+4)%4];g.fillStyle=hue;g.fillRect(bx,by,228,30);
   g.fillStyle='#ffffff10';for(let k=0;k<30;k+=3)g.fillRect(bx,by+k,228,1);const t=goal?'GOOOOOL !!!':msgs[(Math.floor(now/6000)+i+5)%msgs.length];g.font='16px '+FONT;const tw=g.measureText(t).width;const off=(now*.06+i*90)%(tw+228);g.textAlign='left';textOut(g,t,bx+228-off,by+21,16,goal?'#fff':'#ffd200',OUT,3);g.restore();g.beginPath();rrc(g,bx,by,228,30,5);g.lineWidth=3;g.strokeStyle=OUT;g.stroke();}}}
let FLASH=[];
// ----- menu : stade vivant derrière l'interface -----
let MENU=null;
function setMenuScene(){const k=S.club||'ca';if(MENU&&MENU.k===k)return;MENU={k,scn:mkScene({t:'stade',n:CL(k).st},CL(k),CL(k==='est'?'ca':'est'))};}
function drawMenu(){const now=Date.now();g.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);const sc=MENU.scn;
 if(OX>1||OY>1){const ex=OX/SC+4,ey=OY/SC+4;for(const [y0,y1,cc] of sc.bands){g.fillStyle=cc;g.fillRect(-ex,y0-(y0===0?ey:0),W+ex*2,y1-y0+(y0===0?ey:0)+(y1===H?ey:0));}}
 const z=1.06+Math.sin(now*.0003)*.03;g.save();g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2+Math.sin(now*.0002)*12,-H/2);g.drawImage(sc.full[Math.floor(now/450)%2],-EX,0);drawLive(now,{t:'stade'},false);g.restore();
 g.fillStyle='rgba(10,14,30,.55)';g.fillRect(-OX/SC-4,-OY/SC-4,W+OX*2/SC+8,H+OY*2/SC+8);
 g.save();g.globalCompositeOperation='lighter';[[120,1],[W-120,-1]].forEach(([px,d])=>{const an=Math.PI/2+d*.5*Math.sin(now*.0008);g.fillStyle='#fff6c014';g.beginPath();g.moveTo(px,0);g.lineTo(px+Math.cos(an-.14)*800,Math.sin(an-.14)*800);g.lineTo(px+Math.cos(an+.14)*800,Math.sin(an+.14)*800);g.fill();});g.restore();}
// ----- écran VS (adversaire trouvé) -----
function drawVS(){const t=M.vsT,now=Date.now();const k=clamp(t/30,0,1),e=1-Math.pow(1-k,3);
 g.fillStyle=grad(g,0,0,0,H,'#ffb21a','#ff6a00');g.fillRect(-OX/SC,-OY/SC,W/2+OX/SC,H+2*OY/SC);g.fillStyle=grad(g,0,0,0,H,'#2c8cf0','#1640b8');g.fillRect(W/2,-OY/SC,W/2+OX/SC+2,H+2*OY/SC);
 g.globalAlpha=.35;g.fillStyle='#fff';for(let i=0;i<26;i++){const y=(i*37+13)%H,len=80+(i*53)%220,sp=(now*.6+i*90)%(W+400);g.fillRect(W/2-sp+200-len,y,len,4+(i%3));g.fillRect(W/2+sp-200,((i*53)%H),len,3+(i%2));}g.globalAlpha=1;
 g.fillStyle=OUT;g.fillRect(W/2-5,0,10,H);
 const searching=t<90;
 g.textAlign='center';textOut(g,searching?'Recherche d\'un adversaire'+'...'.slice(0,(now/300|0)%4):'Adversaire trouvé !',W/2,62,46,'#fff',OUT,9,FONT2);
 const p1=M.P[0],p2=M.P[1];
 g.save();g.translate(-300*(1-e),0);drawPlayerArt(g,p1.ch,p1.club,p1.gear,250,380,2.4,1,{lx:.6,mouth:'open',noShadow:1});g.restore();
 if(!searching){const e2=1-Math.pow(1-clamp((t-90)/25,0,1),3);g.save();g.translate(300*(1-e2),0);drawPlayerArt(g,p2.ch,p2.club,p2.gear,W-250,380,2.4,-1,{lx:.6,mouth:'open',mood:'angry',noShadow:1});g.restore();
  const s2=clamp((t-105)/15,0,1);g.save();g.translate(W/2,300);g.scale(.5+s2*.7-.2*Math.max(0,s2-1),.5+s2*.7);g.rotate(-.08);
  g.beginPath();g.moveTo(-80,-70);g.lineTo(80,-70);g.lineTo(70,40);g.lineTo(0,85);g.lineTo(-70,40);g.closePath();g.fillStyle=grad(g,0,-70,0,85,'#3fc25a','#1a6b2a');g.fill();g.lineWidth=7;g.strokeStyle=OUT;g.stroke();g.strokeStyle='#ffd200';g.lineWidth=3;g.stroke();
  textOut(g,'VS',0,30,84,'#ffc400',OUT,10,FONT2);g.restore();}
 else{g.save();g.translate(W-250,300);g.rotate(now*.004);g.beginPath();g.arc(0,0,60,0,5);g.lineWidth=10;g.strokeStyle='#fff';g.stroke();g.restore();}
 const plate=(x,p,show,al)=>{if(!show)return;g.fillStyle='#000b';rrc(g,x-170,410,340,66,33);g.fill();g.lineWidth=4;g.strokeStyle=OUT;g.stroke();
  g.save();g.translate(x-138,443);g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?16:34;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fillStyle=grad(g,0,-34,0,34,'#b46cf0','#5a1f99');g.fill();g.lineWidth=4;g.strokeStyle=OUT;g.stroke();textOut(g,String(p.lvl),0,10,26,'#fff',OUT,4);g.restore();
  g.textAlign='left';textOut(g,String(p.name).slice(0,16),x-94,438,22,'#ffd200',OUT,4);textOut(g,p.club.n||'',x-94,464,15,'#fff',OUT,3);
  const im=shieldImg(CL(M.o[p.side?'k2':'k1']));if(im.complete)g.drawImage(im,x+118,422,36,42);};
 plate(250,p1,true);plate(W-250,p2,!searching);
 g.textAlign='center';textOut(g,'📍 '+M.V.n,W/2,H-14,18,'#fff',OUT,4);}
// ----- intro -----
let INTRO=null;
function startIntro(){INTRO={t:0,parts:[],a:CH(S.char||'bey')};SCN=mkScene({t:'stade',n:'Koura Virage'},CL(S.club||'ca'),CL(S.club==='est'?'ca':'est'));ui.classList.add('hide');}
function introTap(){if(!INTRO||INTRO.t<20)return;au();sfx('slam');INTRO=null;SCN=null;onboard();}
function drawIntro(){const I=INTRO;I.t++;const t=I.t/60;g.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);
 if(OX>1||OY>1){g.fillStyle='#05070f';g.fillRect(-OX/SC-2,-OY/SC-2,W+OX*2/SC+4,H+OY*2/SC+4);}
 g.globalAlpha=clamp(t*1.5,0,1);g.drawImage(SCN.base,-EX,0);g.drawImage(SCN.crowd[Math.floor(Date.now()/250)%2],-EX,0);g.drawImage(SCN.front,-EX,0);g.globalAlpha=1;g.fillStyle='rgba(0,0,20,'+clamp(.75-t*.2,.35,.75)+')';g.fillRect(0,0,W,H);
 g.save();g.globalCompositeOperation='lighter';[[90,1],[W-90,-1]].forEach(([px,d])=>{const an=Math.PI/2+d*.55*Math.sin(t*1.6);g.fillStyle='#fff6c026';g.beginPath();g.moveTo(px,10);g.lineTo(px+Math.cos(an-.16)*760,10+Math.sin(an-.16)*760);g.lineTo(px+Math.cos(an+.16)*760,10+Math.sin(an+.16)*760);g.fill();});g.restore();
 if(I.t%3===0)for(const sx of [40,W-40])I.parts.push({x:sx+(Math.random()-.5)*60,y:H-30,vx:(Math.random()-.5)*1.5,vy:-2-Math.random()*2,l:90,c:Math.random()<.5?'#ff2a2a':'#ffd200',s:12});
 if(t>1.25&&!I.boom){I.boom=1;I.sh=16;for(let i=0;i<170;i++)I.parts.push({x:W/2,y:250,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*16,l:70+Math.random()*50,c:pick(['#e70013','#fff','#ffd200','#3fc25a']),s:6,gr:.2,cf:1});}
 for(const p of I.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.gr||0;p.l--;g.globalAlpha=p.cf?Math.min(1,p.l/30):p.l/220;g.fillStyle=p.c;if(p.cf)g.fillRect(p.x,p.y,p.s,p.s*.6);else{g.beginPath();g.arc(p.x,p.y,p.s+(90-p.l)*.3,0,7);g.fill();}}I.parts=I.parts.filter(p=>p.l>0);g.globalAlpha=1;
 if(I.sh>.5){g.translate((Math.random()-.5)*I.sh,(Math.random()-.5)*I.sh);I.sh*=.9;}
 const bt=clamp(t/1.2,0,1),by=t<1.2?-40+bt*bt*330:290-Math.abs(Math.sin((t-1.2)*4))*50*Math.exp(-(t-1.2)*1.4);drawBall(g,W/2,by,t*6,15*2.2);
 const e=k=>{const x=clamp(k,0,1);return 1+2.7*Math.pow(x-1,3)+1.7*Math.pow(x-1,2);};const k1=e((t-1.25)/.45),k2=e((t-1.45)/.45);g.textAlign='center';
 if(t>1.25){g.save();g.translate(-650*(1-k1)+W/2-170,135);g.rotate(-.06);textOut(g,'KOURA',0,0,104,'#fff',OUT,16,FONT2);g.restore();}
 if(t>1.45){g.save();g.translate(650*(1-k2)+W/2+190,160);g.rotate(-.06);textOut(g,'VIRAGE',0,0,104,'#ff2a2a',OUT,16,FONT2);g.restore();}
 if(t>1.9){const k=e((t-1.9)/.5);const hy=H+150-k*250;drawPlayerArt(g,I.a,CL(S.club||'ca'),myGear(),W/2+300,hy,2,-1,{lx:-.8,mouth:'open'});drawPlayerArt(g,CH('hannibal'),CL('est'),{shoes:5},W/2-300,hy+10,1.9,1,{lx:.8,mouth:'open',mood:'angry'});}
 if(t>2.2){g.globalAlpha=clamp((t-2.2)*2,0,1);g.fillStyle='#000c';rrc(g,W/2-320,190,640,36,18);g.fill();textOut(g,'FOOT DE QUARTIER • AMBIANCE VIRAGE • 100% TOUNSI',W/2,216,22,'#ffd200',OUT,4);g.globalAlpha=1;}
 if(t>2.6){g.globalAlpha=.6+Math.sin(t*6)*.4;textOut(g,'TOUCHE POUR JOUER',W/2,H-36,34,'#fff',OUT,7,FONT2);g.globalAlpha=1;}
 g.textAlign='left';g.font='12px Arial';g.fillStyle='#fff9';g.fillText('V'+APP_VERSION+' • SYPHAX APPS',10,H-10);}
let last=0,acc=0;
function loop(ts){requestAnimationFrame(loop);let dt=ts-last;last=ts;if(!(dt>0)||dt>250)dt=STEP;acc+=dt;let n=0;
 while(acc>=STEP&&n<5){if(M){M.tick++;if(M.slow>0){M.slow--;if(M.tick%2){acc-=STEP;n++;continue;}}for(const o of [M.P[0],M.P[1],M.b]){o.px=o.x;o.py=o.y;}}step();acc-=STEP;n++;}if(n===5)acc=0;
 if(M||INTRO||MENU)draw(M?clamp(acc/STEP,0,1):1);}
function pauseMatch(){if(!M||M.paused||M.state==='end'||M.state==='vs')return;M.paused=true;touches.clear();M.chatOpen=false;
 modal(`<h2 class="ttl">Pause</h2><div class="txt">${M.o.label||''}</div><div class="row"><button class="bt g" data-a="resume">REPRENDRE</button><button class="bt s" data-a="quit">${M.tuto?'PASSER LA DÉMO':'ABANDONNER'}</button></div>${M.o.cost?'<div class="txt sm">Abandonner compte comme une défaite 0-3.</div>':''}`,a=>{if(a==='resume'){closeModal();M.paused=false;}else if(a==='quit'){closeModal();M.paused=false;if(M.tuto){endTuto(true);return;}if(M.o.cost)M.score=[0,3];endMatch();}},true);}
function endMatch(){if(!M||M.state==='end')return;M.state='end';sfx('end');crowd(false);const sc=M.score.slice(),o=M.o,ev=M.ev,P2=M.P[1];touches.clear();
 setTimeout(()=>{const res=sc[0]>sc[1]?'W':sc[0]<sc[1]?'L':'D';M=null;SCN=null;showUI();results(o,sc,res,ev,P2);},1000);}
// quand un décor peint finit de charger, on reconstruit les scènes de menu
function onBgReady(){MENU=null;if(typeof BGURL==='object')for(const k in BGURL)delete BGURL[k];}
