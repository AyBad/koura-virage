// Koura Virage — nouveau projet (V1). Contenu du jeu.
const APP_VERSION = '1.0';
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
const NICKS=['Saber','Wassim','Oussema','Bilel','Rami','Houssem','Yassine','Firas','Aymen','Skander','Hamza','Mehdi'];
const CLUBS=[{s:'EST',c:0xffd200,c2:0xe70013},{s:'CA',c:0xe70013,c2:0xffffff},{s:'ESS',c:0xe70013,c2:0xffffff},{s:'CSS',c:0x111111,c2:0xffffff},{s:'USM',c:0x2c6fe0,c2:0xffffff},{s:'ST',c:0x1f8a4c,c2:0xe70013}];
