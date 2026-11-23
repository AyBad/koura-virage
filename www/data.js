// ================= KOURA VIRAGE – DONNÉES =================
var APP_VERSION = '0.3';
// Ligue 1 tunisienne 2026-2027 (16 clubs). Écussons : formes neutres aux couleurs du club uniquement.
const CLUBS=[
 {id:'est',n:'Espérance de Tunis',s:'EST',st:'Stade Hammadi-Agrebi (Radès)',c1:'#c8102e',c2:'#ffcc00',p:'rayures',pop:1},
 {id:'ca',n:'Club Africain',s:'CA',st:'Stade Hammadi-Agrebi (Radès)',c1:'#e30613',c2:'#ffffff',p:'bande',pop:.98},
 {id:'ess',n:'Étoile du Sahel',s:'ESS',st:'Stade olympique de Sousse',c1:'#d4021d',c2:'#ffffff',p:'etoile',pop:.86},
 {id:'css',n:'CS Sfaxien',s:'CSS',st:'Stade Taïeb-Mhiri (Sfax)',c1:'#1a1a1a',c2:'#ffffff',p:'rayures',pop:.8},
 {id:'usm',n:'US Monastir',s:'USM',st:'Stade Mustapha-Ben-Jannet',c1:'#3b8fd9',c2:'#ffffff',p:'moitie',pop:.45},
 {id:'st',n:'Stade Tunisien',s:'ST',st:'Stade Hédi-Enneifer (Bardo)',c1:'#d7141a',c2:'#0a8a3e',p:'moitie',pop:.5},
 {id:'cab',n:'CA Bizertin',s:'CAB',st:'Stade du 15-Octobre (Bizerte)',c1:'#ffd200',c2:'#1a1a1a',p:'rayures',pop:.5},
 {id:'asm',n:'AS Marsa',s:'ASM',st:'Stade Abdelaziz-Chtioui (La Marsa)',c1:'#ffd200',c2:'#0a7a3b',p:'diag',pop:.35},
 {id:'usbg',n:'US Ben Guerdane',s:'USBG',st:'Stade du 7-Mars (Ben Guerdane)',c1:'#ffd200',c2:'#1a1a1a',p:'chevron',pop:.36},
 {id:'esz',n:'ES Zarzis',s:'ESZ',st:'Stade Abdessalam-Kazouz (Zarzis)',c1:'#c8102e',c2:'#ffcc00',p:'moitie',pop:.34},
 {id:'jso',n:'JS El Omrane',s:'JSO',st:'Stade Chedly-Zouiten (Tunis)',c1:'#1f4fbf',c2:'#ffd200',p:'bande',pop:.3},
 {id:'ob',n:'Olympique de Béja',s:'OB',st:'Stade Boujemaa-Kmiti (Béja)',c1:'#d7141a',c2:'#ffffff',p:'cercle',pop:.4},
 {id:'esm',n:'ES Métlaoui',s:'ESM',st:'Stade municipal de Métlaoui',c1:'#d7141a',c2:'#ffd200',p:'rayures',pop:.32},
 {id:'cshl',n:'CS Hammam-Lif',s:'CSHL',st:'Stade Bou-Kornine (Hammam-Lif)',c1:'#0a8a3e',c2:'#ffffff',p:'rayures',pop:.38},
 {id:'eshs',n:'ES Hammam-Sousse',s:'ESHS',st:'Stade Bou-Ali-Lahouar (Hammam-Sousse)',c1:'#ffd200',c2:'#1a1a1a',p:'quart',pop:.3},
 {id:'psse',n:'PS Sakiet Eddaïer',s:'PSSE',st:'Stade Taïeb-Mhiri (Sfax)',c1:'#1f5fd1',c2:'#ffffff',p:'diag',pop:.28}];
const CL=id=>CLUBS.find(c=>c.id===id)||CLUBS[0];
const DERBIES=[['est','ca','Derby de la capitale'],['est','ess','Le Classico'],['ess','css','Le Choc Sahel–Sfax'],['ess','usm','Derby du Sahel'],['css','psse','Derby de Sfax'],['ca','st','Derby de Tunis'],['ess','eshs','Derby de Sousse'],['usbg','esz','Derby du Sud'],['cab','ob','Derby du Nord'],['est','css','Le Choc Tunis–Sfax'],['jso','asm','Derby de la banlieue'],['esm','cshl','Le Choc des mineurs']];

// Personnages : uniquement des figures historiques tunisiennes + légendes de 1978 (très rares).
// Apparence : sk peau, hair style (h), couleur cheveux (hc), barbe (bd), moustache (mo), accessoires.
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

// Super pouvoirs (achetés ou gagnés dans les coffres). Niveau = utilisations par match, rechargées à chaque match.
const SP={
 harissa:{n:'Tir Harissa',e:'🌶️',c:'#ff4d1a',d:'Ton prochain tir part en boule de feu et assomme le gardien.',pr:600},
 boutellis:{n:'Boutellis',e:'🍯',c:'#e0a10a',d:'L\'adversaire reste collé au sol 3 secondes.',pr:800},
 cage:{n:'Cage XXL',e:'🥅',c:'#2cc26b',d:'Agrandit la cage adverse et réduit la tienne 8 secondes.',pr:1200},
 bard:{n:'Bard !',e:'❄️',c:'#5fc8ff',d:'Gèle l\'adversaire 2,5 secondes.',pr:700},
 chlaka:{n:'Chlaka volante',e:'🩴',c:'#2c6fe0',d:'Ta claquette assomme l\'adversaire 2 secondes.',pr:500},
 ras:{n:'Ras Kbir',e:'🤯',c:'#f28c1a',d:'Ta tête devient énorme 6 secondes.',pr:500},
 kaskrout:{n:'Mur Kaskrout',e:'🥪',c:'#d9a05a',d:'Un sandwich géant protège ton but 5 secondes.',pr:900},
 chergui:{n:'Chergui',e:'🌪️',c:'#c8b07a',d:'Le vent du désert pousse le ballon vers le but adverse.',pr:700},
 fennec:{n:'Tir Fennec',e:'🦊',c:'#ff8a3d',d:'Ton prochain tir zigzague.',pr:700}};
const SHOUT={harissa:'HARISSA !',boutellis:'BOUTELLIS !',cage:'CAGE XXL !',bard:'BARD !',chlaka:'CHLAKA !',ras:'RAS KBIR !',kaskrout:'KASKROUT !',chergui:'CHERGUI !',fennec:'FENNEC !'};

// Améliorations (difficiles à obtenir) : 5 niveaux chacune, prix élevés.
const GEAR={
 shoes:{n:'Chaussures',e:'👟',d:'Puissance de tir',pr:[400,1200,3500,8000,18000],t:['Crampons bleus','Crampons rouges','Crampons verts fluo','Crampons argent','Crampons en or']},
 band:{n:'Bandeau',e:'🎽',d:'Hauteur de saut',pr:[300,1000,3000,7000,16000],t:['Bandeau blanc','Bandeau bleu','Bandeau rouge','Bandeau argent','Bandeau en or']},
 arm:{n:'Brassard',e:'💪',d:'Vitesse de course',pr:[300,1000,3000,7000,16000],t:['Brassard bleu','Brassard vert','Brassard capitaine','Brassard argent','Brassard en or']},
 khomsa:{n:'Khomsa',e:'🖐️',d:'Résistance aux pouvoirs',pr:[500,1500,4000,9000,20000],t:['Khomsa en cuivre','Khomsa en argent','Khomsa en or','Khomsa émeraude','Khomsa bénie']}};
const GCOL=['#2b2b2b','#2c6fe0','#e70013','#7ad61a','#c9d1db','#ffc400'];

// Messages rapides que le joueur choisit d'afficher pendant le match
const CHAT=['Yalla ! 💪','Ya3tik essa7a 👏','Chbik ?! 😅','Barcha ! 🔥','Hhhhh 😂','Mrigel 👍','Ya khsara 😩','Allez le virage ! 📣'];

const VAGUES=[{t:'quartier',n:'Terrain vague – Cité Ettadhamen',sky:0},{t:'quartier',n:'Terrain vague – Médina (El Hafsia)',sky:1},{t:'plage',n:'Plage de Hammamet'},{t:'quartier',n:'Terrain vague – Cité Ezzouhour (Kasserine)',sky:2}];
const NICKS=['Hamma_10','Dali.ES','Saber_CSS','Nour93','Yassine.Sahli','Kais_Bizerte','Rami_Virage','Aziz.Sfax','Wassim_7','Oussema.CA','Mehdi_Ultras','Firas.Ezz','Sofien_9','Bilel.Kef','Ghassen_TN','Malek.Marsa','Anis_Hlif','Taha_Zarzis','Skander.Bardo','Iheb_Gafsa','Achref_10','Zied.Monastir','Houssem_GK','Amine.Djerba','mle3bi_4417','mle3bi_9032'];
const DIVS={10:{pr:10,rl:null},9:{pr:11,rl:3},8:{pr:12,rl:4},7:{pr:13,rl:5},6:{pr:14,rl:6},5:{pr:15,rl:7},4:{pr:16,rl:8},3:{pr:17,rl:9},2:{pr:19,rl:11},1:{pr:24,rl:24}};
const MISSIONS=[{id:'win',t:'Gagne des matchs',n:[2,3]},{id:'goal',t:'Marque des buts',n:[5,8]},{id:'head',t:'Buts de la tête',n:[1,2]},{id:'high',t:'Buts sur tir haut',n:[1,2]},{id:'sp',t:'Utilise des super pouvoirs',n:[3,5]},{id:'play',t:'Joue des matchs classés',n:[3,4]},{id:'clean',t:'Gagne sans encaisser',n:[1]}];
const MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const MAXT=5,REGEN=15*60e3,ADMAX=12,MATCH_S=60;
const XPL=lv=>200+lv*150; // XP nécessaire pour passer le niveau
