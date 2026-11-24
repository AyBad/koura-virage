// Kawarjia — contenu du jeu (V2)
const APP_VERSION = '2.1';
const CHARS=[
 {id:'bey',n:'Ahmed Bey',sub:'Le Bey réformateur (1806-1855)',r:'commun',pr:0,sk:'#e0ab7e',h:'chechia',hc:'#2a1a10',bd:'court',mo:1,spd:1,jmp:1,kp:1,hd:1},
 {id:'chebbi',n:'Abou el Kacem Chebbi',sub:'Le poète de Tozeur (1909-1934)',r:'commun',pr:1500,sk:'#c98e5e',h:'raie',hc:'#16100a',mo:1,spd:1.04,jmp:1.02,kp:1,hd:1.02},
 {id:'haddad',n:'Tahar Haddad',sub:'Le penseur de Gabès (1899-1935)',r:'commun',pr:1800,sk:'#c48a5a',h:'chechia2',hc:'#16100a',mo:1,gl:1,spd:1.02,jmp:1.03,kp:1.02,hd:1.03},
 {id:'aziza',n:'Aziza Othmana',sub:'La princesse bienfaitrice (XVIIe s.)',r:'rare',pr:3500,sk:'#ecbd94',h:'coiffe',hc:'#24150c',spd:1.07,jmp:1.05,kp:1.02,hd:1.04},
 {id:'ibnk',n:'Ibn Khaldoun',sub:'Le savant de Tunis (1332-1406)',r:'rare',pr:4000,sk:'#c08458',h:'turban',hc:'#ddd',bd:'long',bdc:'#e8e8e8',spd:1.02,jmp:1.05,kp:1.08,hd:1.08},
 {id:'kahena',n:'Kahena (Dihya)',sub:'La reine guerrière (VIIe s.)',r:'rare',pr:5000,sk:'#c98e5e',h:'tresses',hc:'#120b06',paint:1,spd:1.1,jmp:1.08,kp:1.04,hd:1.04},
 {id:'jugurtha',n:'Jugurtha',sub:'Le roi numide rebelle (160-104 av. J.-C.)',r:'épique',pr:7000,sk:'#b97a4c',h:'boucles',hc:'#1d120a',bd:'court',diad:1,spd:1.1,jmp:1.1,kp:1.08,hd:1.06},
 {id:'hamilcar',n:'Hamilcar Barca',sub:'L\'éclair de Carthage (IIIe s. av. J.-C.)',r:'épique',pr:8000,sk:'#c58a5c',h:'casque',crest:'#2c6fe0',bd:'long',bdc:'#3a2616',spd:1.08,jmp:1.06,kp:1.14,hd:1.1},
 {id:'elissa',n:'Elissa (3ellissa)',sub:'Fondatrice de Carthage (814 av. J.-C.)',r:'épique',pr:9000,sk:'#efc39c',h:'couronne',hc:'#24150c',spd:1.12,jmp:1.12,kp:1.08,hd:1.06},
 {id:'hannibal',n:'Hannibal Barca',sub:'Le général légendaire (247-183 av. J.-C.)',r:'légendaire',pr:12000,sk:'#b97a4c',h:'casque',crest:'#d01818',bd:'long',bdc:'#2a1a0e',patch:1,spd:1.12,jmp:1.1,kp:1.18,hd:1.14},
 // Légendes de l'équipe de Tunisie 1978 (Argentine) : très difficiles à obtenir
 {id:'l78gk',n:'Atougga',sub:'Légende 78 • le gardien',r:'légende 78',l78:1,pr:30000,sk:'#c98e5e',h:'court',hc:'#16100a',mo:1,spd:1.1,jmp:1.2,kp:1.1,hd:1.2},
 {id:'l78dh',n:'Tarek Dhiyeb',sub:'Légende 78 • le meneur',r:'légende 78',l78:1,pr:40000,sk:'#b97a4c',h:'afro',hc:'#16100a',mo:1,spd:1.18,jmp:1.14,kp:1.2,hd:1.12},
 {id:'l78ag',n:'Hamadi Agribi',sub:'Légende 78 • le magicien',r:'légende 78',l78:1,pr:40000,sk:'#a86d43',h:'afro',hc:'#120b06',mo:1,spd:1.2,jmp:1.12,kp:1.18,hd:1.1},
 {id:'l78ka',n:'Ali Kaebi',sub:'Légende 78 • le buteur',r:'légende 78',l78:1,pr:35000,sk:'#c48a5a',h:'boucles',hc:'#16100a',mo:1,spd:1.16,jmp:1.14,kp:1.22,hd:1.14},
 {id:'l78la',n:'Temime Lahzemi',sub:'Légende 78 • l\'ailier',r:'légende 78',l78:1,pr:35000,sk:'#c98e5e',h:'longs70',hc:'#22160c',mo:1,spd:1.22,jmp:1.1,kp:1.14,hd:1.08}];
const CH=id=>CHARS.find(c=>c.id===id)||CHARS[0];
const RCOL={'commun':'#7a8599','rare':'#2c8cf0','épique':'#a64df0','légendaire':'#f2a900','légende 78':'#e70013'};
const NICKS=['Hamma_10','Dali.ES','Saber_CSS','Nour93','Yassine.Sahli','Kais_Bizerte','Rami_Virage','Aziz.Sfax','Wassim_7','Oussema.CA','Mehdi_Ultras','Firas.Ezz','Sofien_9','Bilel.Kef','Ghassen_TN','Malek.Marsa','Anis_Hlif','Taha_Zarzis','Skander.T','Chiheb_88','Amine.Bja','Houssem_ST','Zied.Monastir','Karim_Gafsa','Seif.Nabeul','Hedi_1978','Lotfi.Sousse','Mounir_10','Jasser.Tozeur','Raed_Jerba'];
// Chaussures (cartes à collectionner : chaque carte fait progresser le bonus)
const BOOTS=[
 {id:'b_base',slot:'boots',n:'Crampons Classiques',r:'commun',pr:0,b:{spd:1}},
 {id:'b_jasmin',slot:'boots',n:'Crampons Jasmin',r:'commun',pr:600,b:{jmp:3}},
 {id:'b_harissa',slot:'boots',n:'Crampons Harissa',r:'commun',pr:800,b:{kp:3}},
 {id:'b_neptune',slot:'boots',n:'Crampons Sidi Bou Saïd',r:'rare',pr:2500,b:{spd:4,jmp:1}},
 {id:'b_oasis',slot:'boots',n:'Crampons Oasis',r:'rare',pr:2500,b:{jmp:4,hd:1}},
 {id:'b_sahara',slot:'boots',n:'Crampons Sahara',r:'rare',pr:3000,b:{kp:4,spd:1}},
 {id:'b_medina',slot:'boots',n:'Crampons Médina',r:'épique',pr:6000,b:{spd:5,kp:3}},
 {id:'b_rose',slot:'boots',n:'Crampons Jasmin Rose',r:'épique',pr:6500,b:{jmp:5,hd:3}},
 {id:'b_bleu',slot:'boots',n:'Crampons Lagune',r:'épique',pr:7000,b:{spd:6,jmp:2}},
 {id:'b_fluo',slot:'boots',n:'Crampons Royal',r:'légendaire',pr:15000,b:{spd:6,kp:5,jmp:3}},
 {id:'b_argent',slot:'boots',n:'Crampons d\'Argent',r:'légendaire',pr:16000,b:{kp:7,hd:4,spd:3}},
 {id:'b_carthage',slot:'boots',n:'Crampons de Carthage',r:'légende 78',pr:0,b:{kp:8,spd:6,jmp:5}}];
const BT=id=>BOOTS.find(b=>b.id===id)||BOOTS[0];
// Accessoires (chapeaux, lunettes, écharpes, ballons)
const ACC=[
 {id:'h_none',slot:'hat',n:'Sans chapeau',r:'commun',pr:0,b:{}},
 {id:'h_casq',slot:'hat',n:'Casquette Ultras',r:'commun',pr:700,b:{spd:2},kind:1},
 {id:'h_bob',slot:'hat',n:'Bob du Virage',r:'commun',pr:900,b:{hd:3},kind:1},
 {id:'h_mdhalla',slot:'hat',n:'Mdhalla (chapeau de paille)',r:'rare',pr:2200,b:{jmp:4},kind:1},
 {id:'h_bonnet',slot:'hat',n:'Bonnet de supporter',r:'rare',pr:2600,b:{hd:4,kp:2},kind:1},
 {id:'h_laurier',slot:'hat',n:'Couronne de laurier',r:'épique',pr:7500,b:{hd:6,jmp:3},kind:1},
 {id:'h_chechia',slot:'hat',n:'Chéchia brodée d\'or',r:'légendaire',pr:18000,b:{hd:8,kp:5,jmp:3},kind:1},
 {id:'g_none',slot:'glasses',n:'Sans lunettes',r:'commun',pr:0,b:{}},
 {id:'g_sun',slot:'glasses',n:'Lunettes de soleil',r:'commun',pr:800,b:{kp:2},kind:1},
 {id:'g_ecaille',slot:'glasses',n:'Lunettes écaille',r:'commun',pr:900,b:{hd:2},kind:1},
 {id:'g_ronde',slot:'glasses',n:'Lunettes rondes',r:'rare',pr:2400,b:{hd:3,kp:2},kind:1},
 {id:'g_avia',slot:'glasses',n:'Lunettes d\'aviateur',r:'rare',pr:2800,b:{spd:4},kind:1},
 {id:'g_club',slot:'glasses',n:'Lunettes de club',r:'épique',pr:7000,b:{jmp:5,spd:3},kind:1},
 {id:'g_sport',slot:'glasses',n:'Lunettes de sport',r:'légendaire',pr:16000,b:{kp:6,hd:5,spd:3},kind:1},
 {id:'s_none',slot:'scarf',n:'Sans écharpe',r:'commun',pr:0,b:{}},
 {id:'s_rb',slot:'scarf',n:'Écharpe rouge et blanche',r:'commun',pr:700,b:{hd:2},kind:1},
 {id:'s_nb',slot:'scarf',n:'Écharpe noire et blanche',r:'commun',pr:900,b:{spd:2},kind:1},
 {id:'s_kef',slot:'scarf',n:'Écharpe bleue et blanche',r:'rare',pr:2400,b:{jmp:4},kind:1},
 {id:'s_vb',slot:'scarf',n:'Écharpe verte et blanche',r:'rare',pr:2600,b:{kp:3,spd:2},kind:1},
 {id:'s_tn',slot:'scarf',n:'Écharpe rouge et jaune',r:'épique',pr:6500,b:{spd:4,jmp:3},kind:1},
 {id:'s_rv',slot:'scarf',n:'Écharpe rouge et verte',r:'légendaire',pr:15000,b:{hd:5,kp:4,spd:3},kind:1},
 {id:'ba_cl',slot:'ball',n:'Ballon classique',r:'commun',pr:0,b:{},kind:1},
 {id:'ba_zel',slot:'ball',n:'Ballon rouge',r:'commun',pr:800,b:{kp:2},kind:1},
 {id:'ba_ice',slot:'ball',n:'Ballon bleu',r:'rare',pr:2800,b:{hd:3},kind:1},
 {id:'ba_vert',slot:'ball',n:'Ballon vert',r:'rare',pr:3000,b:{spd:3},kind:1},
 {id:'ba_jaune',slot:'ball',n:'Ballon jaune',r:'épique',pr:7000,b:{kp:4,jmp:2},kind:1},
 {id:'ba_or',slot:'ball',n:'Ballon d\'or',r:'légendaire',pr:15000,b:{kp:5,spd:3,hd:2},kind:1}];
const AC_=id=>ACC.find(a=>a.id===id);
const SLOTS={ball:'Ballons'};
// Clubs de Ligue 1 (noms et couleurs réels, écussons inventés)
const CLUBS=[
 {id:'est',n:'Espérance de Tunis',s:'EST',c1:0xc8102e,c2:0xffcc00,cr:2},
 {id:'ca',n:'Club Africain',s:'CA',c1:0xe30613,c2:0xffffff,cr:0},
 {id:'ess',n:'Étoile du Sahel',s:'ESS',c1:0xd4021d,c2:0xffffff,cr:7},
 {id:'css',n:'CS Sfaxien',s:'CSS',c1:0x1a1a1a,c2:0xffffff,cr:3},
 {id:'usm',n:'US Monastir',s:'USM',c1:0x3b8fd9,c2:0xffffff,cr:4},
 {id:'st',n:'Stade Tunisien',s:'ST',c1:0xd7141a,c2:0x0a8a3e,cr:11},
 {id:'cab',n:'CA Bizertin',s:'CAB',c1:0xffd200,c2:0x1a1a1a,cr:1},
 {id:'asm',n:'AS Marsa',s:'ASM',c1:0xffd200,c2:0x0a7a3b,cr:8},
 {id:'usbg',n:'US Ben Guerdane',s:'USBG',c1:0xff8a00,c2:0x1a1a1a,cr:12},
 {id:'esz',n:'ES Zarzis',s:'ESZ',c1:0xc8102e,c2:0xffffff,cr:14},
 {id:'jso',n:'JS El Omrane',s:'JSO',c1:0x1f4fbf,c2:0xffd200,cr:6},
 {id:'ob',n:'Olympique de Béja',s:'OB',c1:0xd7141a,c2:0xffffff,cr:5},
 {id:'esm',n:'ES Métlaoui',s:'ESM',c1:0x7a3fc0,c2:0xffffff,cr:9},
 {id:'cshl',n:'CS Hammam-Lif',s:'CSHL',c1:0x0a8a3e,c2:0xffffff,cr:15},
 {id:'eshs',n:'ES Hammam-Sousse',s:'ESHS',c1:0x14286e,c2:0xffffff,cr:13},
 {id:'psse',n:'PS Sakiet Eddaïer',s:'PSSE',c1:0x3fb0e8,c2:0xffffff,cr:10}];
const CL=id=>CLUBS.find(c=>c.id===id)||CLUBS[0];
const hex=n=>'#'+n.toString(16).padStart(6,'0');
// Super pouvoirs : chaque carte = 1 utilisation. On peut aussi en racheter en diamants pendant le match.
// Améliorer un pouvoir (avec des cartes) allonge son effet.
const POWERS=[
 {id:'harissa',n:'Tir Harissa',d:'Ton prochain tir part en boule de feu et assomme l\'adversaire.',r:'commun',gem:3,icon:'img/pw/harissa.webp'},
 {id:'bard',n:'Bard (glace)',d:'L\'adversaire est gelé dans un bloc de glace.',r:'commun',gem:3,icon:'img/fx2/ice.webp'},
 {id:'boutellis',n:'Boutellis',d:'Du miel colle l\'adversaire au sol.',r:'rare',gem:4,icon:'img/fx2/honey.webp'},
 {id:'chlaka',n:'Chlaka',d:'Tu lances une claquette qui assomme l\'adversaire.',r:'rare',gem:4,icon:'img/pw/chlaka.webp'},
 {id:'cage',n:'Cage XXL',d:'La cage adverse devient géante.',r:'épique',gem:5,icon:'img/pw/cage.webp'},
 {id:'raskbir',n:'Ras Kbir',d:'Ta tête devient énorme.',r:'épique',gem:5,icon:'img/pw/raskbir.webp'}];
const PW=id=>POWERS.find(p=>p.id===id)||POWERS[0];
// Stades (tribunes ; la pelouse est dessinée par le jeu)
const VENUES=[
 {id:'rades',n:'Stade de Radès',img:'img/bg/st_rades.webp',w:1671,h:876,grass:[0x3fa52a,0x4cbb34],line:0xffffff},
 {id:'rouge',n:'Radès en rouge',img:'img/bg/st_rouge.webp',w:1670,h:911,grass:[0x3a9c27,0x47b231],line:0xffffff},
 {id:'sfax',n:'Stade de Sfax',img:'img/bg/st_sfax.webp',w:1671,h:883,grass:[0x46ad2c,0x55c238],line:0xffffff},
 {id:'plage',n:'Plage de Hammamet',img:'img/bg/plage.webp',w:1672,h:470,grass:[0xe8c98a,0xdcb877],line:0xffffff},
 {id:'medina',n:'Médina de Tunis',img:'img/bg/medina.webp',w:1672,h:526,grass:[0xb9a58a,0xa8957a],line:0xf4f4f4}];
// Championnat : on démarre en division 10. 13 points sur 10 matchs pour monter, 24 points pour rester en division 1.
const DIVS={10:{up:13},9:{up:13,down:6},8:{up:13,down:6},7:{up:13,down:7},6:{up:13,down:7},5:{up:13,down:8},4:{up:13,down:8},3:{up:13,down:9},2:{up:13,down:9},1:{up:28,down:24}};
const DIV_N={1:'Élite',2:'Nationale',3:'Professionnelle',4:'Fédérale',5:'Régionale',6:'Honneur',7:'Promotion',8:'District',9:'Espoir',10:'Amateur'};
// Coffres
const CHESTS=[
 {n:'Coffre Bronze',min:15,dt:[80,160],gem:[0,1],cards:6,gemPrice:0},
 {n:'Coffre Argent',min:60,dt:[180,320],gem:[1,2],cards:12,gemPrice:30},
 {n:'Coffre Or',min:180,dt:[400,700],gem:[2,4],cards:24,gemPrice:80},
 {n:'Coffre Épique',min:360,dt:[800,1400],gem:[4,8],cards:45,gemPrice:200},
 {n:'Coffre Légendaire',min:600,dt:[1800,3000],gem:[8,15],cards:80,gemPrice:450}];
// Missions du jour (3 tirées au sort chaque jour)
const MISSIONS=[
 {id:'play',t:'Joue {n} matchs',n:3,dt:250,gem:1},
 {id:'win',t:'Gagne {n} matchs',n:2,dt:400,gem:2},
 {id:'goals',t:'Marque {n} buts',n:6,dt:300,gem:1},
 {id:'heads',t:'Marque {n} buts de la tête',n:2,dt:350,gem:2},
 {id:'pw',t:'Utilise {n} super pouvoirs',n:4,dt:300,gem:1},
 {id:'clean',t:'Gagne {n} match sans encaisser',n:1,dt:450,gem:3},
 {id:'shots',t:'Tire {n} fois',n:25,dt:200,gem:1}];
// Derbys : rivalités historiques (points doublés pendant la semaine du derby)
const DERBYS=[['est','ca'],['ess','est'],['css','ess'],['css','est'],['ca','st'],['usm','ess'],['cab','est'],['ess','eshs']];
// Géométrie des têtes (fraction de la largeur pour x, de la hauteur pour y) :
// cx/hw = centre et largeur du haut du crâne, ex/ey = œil visible, mesurés sur chaque visage
const HG={bey:[.529,.564,.66,.39],chebbi:[.614,.646,.71,.43],haddad:[.531,.584,.69,.37],aziza:[.519,.553,.58,.37],ibnk:[.525,.601,.72,.38],
 kahena:[.481,.596,.63,.33],jugurtha:[.499,.58,.61,.33],hamilcar:[.468,.542,.62,.32],elissa:[.46,.695,.63,.32],hannibal:[.467,.559,.62,.33],
 l78gk:[.514,.633,.65,.37],l78dh:[.521,.632,.62,.36],l78ag:[.525,.681,.66,.37],l78ka:[.467,.627,.58,.37],l78la:[.497,.644,.62,.37]};
const HGW={bey:466/493,chebbi:444/494,haddad:459/492,aziza:512/492,ibnk:446/493,kahena:508/503,jugurtha:512/507,hamilcar:509/512,elissa:479/504,hannibal:1,l78gk:447/510,l78dh:468/512,l78ag:454/508,l78ka:501/512,l78la:497/509};
const SIGHAT=new Set(['bey','haddad','aziza','ibnk','kahena','jugurtha','hamilcar','elissa','hannibal']);  // couvre-chef d'origine (img/hg)
const HGEO=id=>{const a=HG[id]||HG.bey;return {w:HGW[id]||1,cx:a[0],hw:a[1],ex:a[2],ey:a[3],cut:a[3]-.17,sig:SIGHAT.has(id)};};
// Chapeaux : largeur (x largeur du crâne), point d'ancrage (bas du chapeau) dans l'image
const HATG={h_casq:{w:1.45,ax:.5,ay:.8},h_mdhalla:{w:1.65,ax:.5,ay:.7},h_bob:{w:1.4,ax:.5,ay:.86},h_bonnet:{w:1.3,ax:.5,ay:.9},h_laurier:{w:1.3,ax:.5,ay:.75,clip:0},h_chechia:{w:1.2,ax:.5,ay:.88}};
const GLW={g_sun:.5,g_ecaille:.5,g_ronde:.48,g_avia:.52,g_club:.5,g_sport:.56};
// ===== Cartes et progression =====
// Chaque objet a une progression p (en cinquièmes d'étoile, de 0 à 25 = 5 étoiles).
// Passer un cinquième coûte des cartes (4, 6, 8, 10, 12, +2 par étoile déjà gagnée) et un peu d'argent.
const PMAX=25;
const STEP_CARDS=p=>[4,6,8,10,12][p%5]+2*Math.floor(p/5);
const STEP_DT=p=>(60+50*Math.floor(p/5))*((p%5)+1);
const UNLOCK={'commun':3,'rare':6,'épique':10,'légendaire':15,'légende 78':25};   // cartes pour débloquer
const CHAR_UNLOCK={'commun':10,'rare':20,'épique':30,'légendaire':40,'légende 78':50};
const charMul=p=>1+.016*(p||0);                 // joueur : +1,6 % par cinquième
const itemB=(b,p)=>{const o={},m=1+.12*(p||0);for(const k in b||{})o[k]=Math.round(b[k]*m*10)/10;return o;};
const PWF=p=>1+.04*(p||0);                      // pouvoir : effet plus long
const ALLITEMS=()=>[...CHARS.map(c=>({...c,type:'char'})),...BOOTS.map(b=>({...b,type:'boots'})),...ACC.filter(a=>a.kind&&a.slot==='ball').map(a=>({...a,type:'ball'})),...POWERS.map(p=>({...p,type:'pw'}))];
const ITEM=id=>ALLITEMS().find(x=>x.id===id);
const RARW={'commun':1,'rare':.4,'épique':.15,'légendaire':.05,'légende 78':.015};  // chance relative de tirer une carte
// Couvre-chefs d'origine (dessinés à part) : posés comme les chapeaux ; clip = cache les cheveux dessous
const SIGG={bey:{w:1.3,ax:.55,ay:.8,clip:1},haddad:{w:1.3,ax:.55,ay:.62,clip:1},ibnk:{w:1.25,ax:.5,ay:.62,clip:0},
 hamilcar:{w:1.38,ax:.5,ay:.55,clip:1},hannibal:{w:1.38,ax:.5,ay:.55,clip:1},aziza:{w:1.4,ax:.5,ay:.4,clip:0},
 elissa:{w:1.0,ax:.5,ay:.92,clip:0},jugurtha:{w:1.2,ax:.5,ay:.72,clip:0},kahena:{w:1.3,ax:.5,ay:.36,clip:0}};
