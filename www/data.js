// Koura Virage — nouveau projet (V1). Contenu du jeu.
const APP_VERSION = '1.1';
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
const BOOTS=[
 {id:'b_base',slot:'boots',n:'Crampons noirs',r:'commun',pr:0,b:{},c1:'#2b2b2b',c2:'#ffffff',so:'#f4f4f4',pat:'eclair'},
 {id:'b_medina',slot:'boots',n:'Crampons Médina',r:'commun',pr:600,b:{spd:3},c1:'#1f5fd1',c2:'#ffffff',so:'#f4f4f4',pat:'eclair'},
 {id:'b_jasmin',slot:'boots',n:'Crampons Jasmin',r:'commun',pr:800,b:{jmp:3},c1:'#f4f4f4',c2:'#2cc26b',so:'#2cc26b',pat:'fleur'},
 {id:'b_harissa',slot:'boots',n:'Crampons Harissa',r:'rare',pr:2500,b:{kp:5},c1:'#e8301c',c2:'#ffb000',so:'#1a1a1a',pat:'flamme'},
 {id:'b_sahara',slot:'boots',n:'Crampons Sahara',r:'rare',pr:3000,b:{spd:4,jmp:2},c1:'#e2b06a',c2:'#7a4a1c',so:'#f4e4c0',pat:'dune'},
 {id:'b_neptune',slot:'boots',n:'Crampons Oasis',r:'épique',pr:7000,b:{kp:5,spd:4},c1:'#18c6e8',c2:'#0a3d8f',so:'#ffffff',pat:'vague'},
 {id:'b_fluo',slot:'boots',n:'Crampons Royal',r:'épique',pr:8000,b:{spd:7,jmp:3},c1:'#b4ff1a',c2:'#ff2a7a',so:'#ffffff',pat:'eclair'},
 {id:'b_carthage',slot:'boots',n:'Crampons de Carthage',r:'légendaire',pr:20000,b:{kp:9,spd:5,jmp:4},c1:'#ffc400',c2:'#8a5a00',so:'#fff6d0',pat:'etoile'}];
const BT=id=>BOOTS.find(b=>b.id===id)||BOOTS[0];
const NICKS=['Hamma_10','Dali.ES','Saber_CSS','Nour93','Yassine.Sahli','Kais_Bizerte','Rami_Virage','Aziz.Sfax','Wassim_7','Oussema.CA','Mehdi_Ultras','Firas.Ezz','Sofien_9','Bilel.Kef','Ghassen_TN','Malek.Marsa','Anis_Hlif','Taha_Zarzis'];
// Accessoires (chapeaux, lunettes, écharpes, ballons) : chacun donne un petit bonus
const ACC=[
 {id:'h_none',slot:'hat',n:'Sans chapeau',r:'commun',pr:0,b:{}},
 {id:'h_casq',slot:'hat',n:'Casquette ultras',r:'commun',pr:700,b:{spd:2},col:'#e70013',kind:'casquette'},
 {id:'h_mdhalla',slot:'hat',n:'Mdhalla (chapeau de paille)',r:'rare',pr:2200,b:{jmp:4},col:'#e8c06a',kind:'paille'},
 {id:'h_bob',slot:'hat',n:'Bob du virage',r:'commun',pr:900,b:{hd:3},col:'#2c6fe0',kind:'bob'},
 {id:'h_bonnet',slot:'hat',n:'Bonnet de supporter',r:'rare',pr:2600,b:{hd:4,kp:2},col:'#ffd200',kind:'bonnet'},
 {id:'h_laurier',slot:'hat',n:'Couronne de laurier',r:'épique',pr:7500,b:{hd:6,jmp:3},col:'#3fae1a',kind:'laurier'},
 {id:'h_chechia',slot:'hat',n:'Chéchia brodée d\'or',r:'légendaire',pr:18000,b:{hd:8,kp:5,jmp:3},col:'#ffc400',kind:'chechia'},
 {id:'g_none',slot:'glasses',n:'Sans lunettes',r:'commun',pr:0,b:{}},
 {id:'g_sun',slot:'glasses',n:'Lunettes de soleil',r:'commun',pr:800,b:{kp:2},col:'#111',kind:'soleil'},
 {id:'g_ronde',slot:'glasses',n:'Lunettes rondes',r:'rare',pr:2400,b:{hd:3,kp:2},col:'#c08a2a',kind:'ronde'},
 {id:'g_sport',slot:'glasses',n:'Lunettes de sport',r:'rare',pr:2800,b:{spd:4},col:'#ff2a7a',kind:'sport'},
 {id:'g_ski',slot:'glasses',n:'Masque de ski de Aïn Draham',r:'épique',pr:7000,b:{jmp:5,spd:3},col:'#18c6e8',kind:'ski'},
 {id:'g_star',slot:'glasses',n:'Lunettes de star',r:'légendaire',pr:16000,b:{kp:6,hd:5,spd:3},col:'#ffc400',kind:'star'},
 {id:'s_none',slot:'scarf',n:'Sans écharpe',r:'commun',pr:0,b:{}},
 {id:'s_rb',slot:'scarf',n:'Écharpe rouge et blanche',r:'commun',pr:700,b:{hd:2},c1:'#e70013',c2:'#ffffff',kind:'raye'},
 {id:'s_nb',slot:'scarf',n:'Écharpe noire et blanche',r:'commun',pr:900,b:{spd:2},c1:'#1a1a1a',c2:'#ffffff',kind:'raye'},
 {id:'s_jn',slot:'scarf',n:'Écharpe jaune et noire',r:'rare',pr:2600,b:{jmp:4},c1:'#ffd200',c2:'#1a1a1a',kind:'raye'},
 {id:'s_tn',slot:'scarf',n:'Écharpe rouge et jaune',r:'rare',pr:2400,b:{kp:3,spd:2},c1:'#e70013',c2:'#ffffff',kind:'etoile'},
 {id:'s_vb',slot:'scarf',n:'Écharpe verte et blanche',r:'épique',pr:6500,b:{spd:4,jmp:3},c1:'#0a8a3e',c2:'#ffffff',kind:'raye'},
 {id:'s_kef',slot:'scarf',n:'Écharpe bleue et blanche',r:'légendaire',pr:15000,b:{hd:5,kp:4,spd:3},c1:'#f4f1ea',c2:'#1a1a1a',kind:'kef'},
 {id:'ba_cl',slot:'ball',n:'Ballon classique',r:'commun',pr:0,b:{},kind:'classique'},
 {id:'ba_zel',slot:'ball',n:'Ballon Virage',r:'rare',pr:2800,b:{hd:3},kind:'zellige'},
 {id:'ba_or',slot:'ball',n:'Ballon d\'or',r:'rare',pr:3000,b:{kp:3},kind:'or'},
 {id:'ba_ice',slot:'ball',n:'Ballon étoilé',r:'épique',pr:7000,b:{spd:4,hd:2},kind:'glace'},
 {id:'ba_fire',slot:'ball',n:'Ballon arc-en-ciel',r:'épique',pr:8000,b:{kp:5},kind:'feu'},
 {id:'ba_volt',slot:'ball',n:'Ballon noir et or',r:'légendaire',pr:15000,b:{kp:4,spd:4,jmp:2},kind:'volt'}];
const AC_=id=>ACC.find(a=>a.id===id);
const SLOTS={hat:'Chapeaux',glasses:'Lunettes',scarf:'Écharpes',ball:'Ballons'};
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
// Super pouvoirs : la jauge se remplit pendant le match, puis un bouton les déclenche
const POWERS=[
 {id:'harissa',n:'Tir Harissa',d:'Ton prochain tir part en boule de feu et assomme l\'adversaire.',pr:0},
 {id:'bard',n:'Bard (glace)',d:'L\'adversaire est gelé pendant 3 secondes.',pr:1500},
 {id:'boutellis',n:'Boutellis',d:'Du miel colle l\'adversaire au sol pendant 3 secondes.',pr:1800},
 {id:'cage',n:'Cage XXL',d:'La cage adverse grandit pendant 7 secondes.',pr:2500},
 {id:'chlaka',n:'Chlaka',d:'Tu lances une claquette qui assomme l\'adversaire.',pr:2200},
 {id:'raskbir',n:'Ras Kbir',d:'Ta tête devient énorme pendant 7 secondes.',pr:3000}];
const PW=id=>POWERS.find(p=>p.id===id)||POWERS[0];
// Évolutions : niveau 1 → 3, bonus sur toutes les stats, portraits illustrés
const EVO_IMG=new Set(['bey','haddad','aziza','ibnk','kahena','jugurtha','hamilcar','elissa','hannibal','l78dh','l78ag','l78ka','l78la']);
const EVO_B=[0,6,12],EVO_C=(c,lv)=>Math.round(((c.pr||1000)*.6+1500)*lv/100)*100;
const EVO_N=['Classique','Champion','Légendaire'];
// Stades
const VENUES=[
 {id:'stade',n:'Stade de Radès',img:'img/bg/stade_top.webp',h:560,grass:[0x3fa52a,0x4cbb34],line:0xffffff,fy:520},
 {id:'plage',n:'Plage de Hammamet',img:'img/bg/plage.webp',h:470,grass:[0xe8c98a,0xdcb877],line:0xffffff,fy:455},
 {id:'medina',n:'Médina de Tunis',img:'img/bg/medina.webp',h:526,grass:[0xb9a58a,0xa8957a],line:0xf4f4f4,fy:500}];
// Championnat en 10 divisions (saisons de 10 matchs)
const DIVS={10:{up:10},9:{up:11,down:3},8:{up:12,down:4},7:{up:13,down:5},6:{up:14,down:6},5:{up:15,down:7},4:{up:16,down:8},3:{up:17,down:9},2:{up:19,down:11},1:{up:24,down:24}};
const DIV_N={1:'Élite',2:'Nationale',3:'Professionnelle',4:'Fédérale',5:'Régionale',6:'Honneur',7:'Promotion',8:'District',9:'Espoir',10:'Amateur'};
// Coffres : temps d'ouverture (minutes) et contenu
const CHESTS=[
 {n:'Coffre Bronze',min:15,dt:[120,220],jt:[0,1],it:.10},
 {n:'Coffre Argent',min:60,dt:[250,450],jt:[1,3],it:.25},
 {n:'Coffre Or',min:180,dt:[500,900],jt:[3,6],it:.45},
 {n:'Coffre Épique',min:360,dt:[1000,1800],jt:[6,10],it:.75},
 {n:'Coffre Légendaire',min:600,dt:[2200,3500],jt:[10,18],it:1}];
// Missions du jour (3 tirées au sort chaque jour)
const MISSIONS=[
 {id:'play',t:'Joue {n} matchs',n:3,dt:250,jt:1},
 {id:'win',t:'Gagne {n} matchs',n:2,dt:400,jt:2},
 {id:'goals',t:'Marque {n} buts',n:6,dt:300,jt:1},
 {id:'heads',t:'Marque {n} buts de la tête',n:2,dt:350,jt:2},
 {id:'pw',t:'Utilise {n} super pouvoirs',n:4,dt:300,jt:1},
 {id:'clean',t:'Gagne {n} match sans encaisser',n:1,dt:450,jt:3},
 {id:'shots',t:'Tire {n} fois',n:25,dt:200,jt:1}];
// Derbys : rivalités historiques (points doublés pendant la semaine du derby)
const DERBYS=[['est','ca'],['ess','est'],['css','ess'],['css','est'],['ca','st'],['usm','ess'],['cab','est'],['ess','eshs']];
