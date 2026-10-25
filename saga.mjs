import {normalizeRelics} from './relics.mjs';
// Campaign extension: data and deterministic rules only, without browser or engine imports.
export const SAGA_VERSION=1;
export const CHAPTER_TIER_CAPS=[3,5,7,10];
export const CHAPTER_PRESSURE=[1,1.55,2.2,3];
export const CHAPTERS=[
 {id:1,title:'Un royaume pour les indésirables',question:'Pourquoi accepter la protection d’un mort-vivant ?',final:'phare',memory:'plans-industriels',ascension:'Premier ancrage',intro:'Ossène retrouve un ordre incomplet : conserver ce qui ne peut être remplacé. Les réfugiés frappent aux portes.'},
 {id:2,title:'Le prix du sang',question:'Peut-on protéger des prédateurs sans leur livrer des habitants ?',final:'c2_message',memory:'contre-mesures',ascension:'Deuxième ancrage',intro:'Le premier matin revient. Les routes connues permettent cette fois d’atteindre une fugitive du Val avant ses chasseurs.'},
 {id:3,title:'La guerre des aubes',question:'Que vaut une paix que personne ne peut refuser ?',final:'c3_choeur',memory:'ancrages-libres',ascension:'Troisième et dernier ancrage',intro:'L’adversaire reconnaît certaines méthodes. Des villes libres cherchent une protection qui ne devienne pas une nouvelle tutelle.'},
 {id:4,title:'Le dernier jour',question:'Quel royaume mérite un avenir sans nouvelle tentative ?',final:'c4_severin',memory:null,ascension:null,intro:'Il ne reste aucun retour. Les plans des ancrages locaux sont prêts ; il faut bâtir leur protection et préparer les relais du royaume.'}
];
const row=(id,name,kind,requires=[],options={})=>({id,name,kind,requires,...options});
const rows=[
 row('refuge','Le passage des Veilles','liberation',[],{people:{settlers:18},companion:'ossene',unlock:'refuge',text:'Néran ouvre les portes aux fugitifs. Ossène inscrit leurs noms sans demander leur origine.'}),
 row('quarry','Carrière des Veilles','resource',['refuge'],{people:{orcs:12},site:'mine',companion:'rovek',unlock:'quarry',text:'Rovek retourne les ateliers contre la compagnie qui retenait ses apprentis.'}),
 row('fen','Le village des roseaux','liberation',['refuge'],{people:{aquatic:12},site:'fen',companion:'tesk',unlock:'fen',text:'Tesk accepte une coopération après que les terres d’éclosion ont retrouvé un accès à l’eau.'}),
 row('archive','Les archives sous les ronces','knowledge',['refuge'],{unlock:'archive',event:'flux-reveles',text:'Des ordres de transport contredisent les récits de maladie. Les captifs alimentent les protections du Phare.'}),
 row('forest','Les bois des anciennes routes','liberation',['archive'],{people:{settlers:10},text:'Une communauté retrouve une route sûre. Elle conserve ses propres porte-parole.'}),
 row('convoi','Les comptes du préfet','resource',['archive'],{any:['quarry','fen'],need:{iron:12},event:'comptes-rouvre',text:'Les registres d’un convoi relient les rafles aux comptes du préfet ; une copie des ateliers garantit la preuve même sans son intendant.'}),
 row('ecloserie','Les eaux partagées','defense',['fen'],{event:'eaux-partagees',signature:'tesk',text:'Les gardiens protègent les écloseries et maintiennent un débit pour les villages humains en aval.'}),
 row('fonderie','Les ateliers retournés','resource',['quarry','convoi'],{need:{iron:25},event:'plans-rovek',signature:'rovek',text:'Les contrats des ateliers sont rendus publics. Rovek conserve les plans et refuse de remplacer un maître par un autre.'}),
 row('bastion','La forteresse de Rouvre','boss',['convoi'],{any:['ecloserie','fonderie'],boss:'Cassian Rouvre',text:'La forteresse tombe. La victoire libère les captifs, mais le transfert interrompu déclenche une procédure du Phare.'}),
 row('phare','Le délai de la première Aube','defense',['bastion','archive'],{any:['ecloserie','fonderie'],event:'premier-ancrage',text:'La région tient. Ossène trouve un délai et un premier ancrage, tandis que les plans nécessaires restent enfermés dans le Val.'}),
 row('c2_refuge','Avant les rafles','liberation',[],{people:{settlers:20,orcs:10,aquatic:10},site:'both',unlock:'all',text:'Prévenus avant les rafles, les réfugiés organisent eux-mêmes leur départ. Les anciennes routes servent à rebâtir, sans recréer d’armée gratuitement.'}),
 row('c2_maera','La route de la fugitive','liberation',['c2_refuge'],{companion:'maera',event:'maera-sauvee',text:'Maëra échappe aux chasseurs. Elle propose un accord limité et reconnaît sa participation passée aux arrestations.'}),
 row('c2_ateliers','Les forges de l’argent','resource',['c2_refuge'],{need:{iron:40},people:{orcs:12},companion:'rovek',text:'Les ateliers révèlent comment désassembler les protections argentées. Rovek organise leur reconversion.'}),
 row('c2_falaises','Les falaises des Exilées','liberation',['c2_maera'],{companion:'kesh',people:{settlers:8},text:'Kesh ouvre une voie aérienne lorsque les postes de chasse cessent de tenir ses aires en otage.'}),
 row('c2_hospice','L’Aube basse','defense',['c2_refuge'],{need:{herbs:35},companion:'iria',event:'patients-proteges',text:'Iria soigne les patients pendant que les gardes protègent le petit Phare. Détruire toute l’Aube les aurait condamnés.'}),
 row('c2_alchimie','Les jardins de subsistance','resource',['c2_maera','c2_hospice'],{need:{herbs:65},event:'subsistance',text:'Donneurs volontaires et substituts alchimiques rendent une autre économie du sang praticable.'}),
 row('c2_pacte','Le Pacte cramoisi','liberation',['c2_alchimie'],{signature:'maera',event:'pacte-cramoisi',text:'Maëra accepte un contrat qu’elle ne peut modifier seule. Les vampires obtiennent une place sans domaine de captifs.'}),
 row('c2_aire','Une aire où revenir','defense',['c2_falaises'],{signature:'kesh',event:'operations-ciblees',text:'Les convois sont détournés et une aire sûre est défendue. Kesh cesse de vivre uniquement par la fuite.'}),
 row('c2_velis','Le domaine sans captifs','boss',['c2_pacte'],{any:['c2_ateliers','c2_aire'],boss:'Dame Vélis',text:'Le pouvoir de Vélis est brisé. Les maisons doivent désormais négocier les conditions réelles de leur subsistance.'}),
 row('c2_message','Le message impossible','defense',['c2_velis','c2_hospice','c2_aire'],{event:'memoire-adverse',text:'Les habitants sont sauvés et les accès défendus. Séverin cite pourtant une phrase d’une autre boucle : Néran n’est pas seul à se souvenir.'}),
 row('c3_veyre','Les portes de Veyre','liberation',[],{people:{settlers:24,orcs:14,aquatic:14},site:'both',unlock:'all',text:'Les cités demandent des clauses de protection vérifiables. Une coalition civile commence à se former.'}),
 row('c3_convois','Le ravitaillement libre','resource',['c3_veyre'],{need:{iron:80},people:{orcs:8},event:'logistique-libre',text:'Les convois ne passent plus par les réserves de captifs du Concordat.'}),
 row('c3_hospices','Les soins hors du réseau','defense',['c3_veyre'],{need:{herbs:90},companion:'iria',signature:'iria',event:'soins-libres',text:'Iria maintient les soins avec des relais locaux. La protection peut être assurée sans obéissance au centre.'}),
 row('c3_cimes','Les Cimes d’Ourdre','knowledge',['c3_convois'],{any:['c3_hospices','c3_dossier'],companion:'vaul',event:'histoire-phares',text:'Vaul reconnaît la dette des dragons : les premières protections reposaient sur des contributions réparties.'}),
 row('c3_sanctuaire','Le sanctuaire des contributions','defense',['c3_cimes'],{signature:'vaul',event:'pacte-draconique',text:'Un premier contingent draconique défend le sanctuaire. Ce pacte engage des responsabilités, pas une armée illimitée.'}),
 row('c3_dossier','Le dossier du gardien','knowledge',['c3_veyre'],{companion:'ossene',signature:'ossene',event:'origine-neran',text:'Néran découvre qu’il conservait les témoignages et exécutait des effacements. Ossène remet le dossier ; ensemble ils assument cette responsabilité.'}),
 row('c3_forges','Les composants de l’Aube','resource',['c3_convois'],{need:{iron:140},companion:'rovek',event:'composants-phares',text:'Les ateliers identifient les pièces qu’il faudra capturer intactes pour remplacer le réseau.'}),
 row('c3_darian','La Croisade solaire','boss',['c3_hospices'],{any:['c3_forges','c3_sanctuaire'],boss:'Darian Voss',text:'La Croisade est vaincue. Interruption, endurance et ravitaillement ont rendu possible une victoire sans sacrifier les cités.'}),
 row('c3_rempart','Le Rempart blanc','boss',['c3_darian','c3_dossier','c3_cimes'],{event:'rempart-ouvert',text:'Le Rempart tombe et l’interface du Chœur devient accessible.'}),
 row('c3_choeur','Le verrou du Chœur','defense',['c3_rempart','c3_forges','c3_sanctuaire'],{event:'plan-ancrages-libres',text:'Le centre peut être pris, mais le briser seul couperait les protections. Vaul et Iria établissent un plan distribué à préparer dès le premier matin.'}),
 row('c4_accueil','Le premier matin préparé','liberation',[],{people:{settlers:28,orcs:18,aquatic:18},site:'both',unlock:'all',text:'Les accords retrouvés abrègent les reconquêtes. Aucun retour ne suivra ce matin ; chaque relais doit pouvoir décider et tenir.'}),
 row('c4_eaux','L’ancrage des eaux','defense',['c4_accueil'],{companion:'tesk',event:'ancrage-eaux',need:{herbs:110},text:'Tesk partage les eaux et les responsabilités de la protection entre les communautés.'}),
 row('c4_forges','L’ancrage des ateliers','resource',['c4_accueil'],{companion:'rovek',event:'ancrage-forges',need:{iron:160},text:'Rovek construit les relais selon des contrats publics. Les ateliers produisent pour ceux qui y vivent.'}),
 row('c4_val','L’ancrage du Val','liberation',['c4_accueil'],{companion:'maera',event:'ancrage-val',need:{herbs:140},text:'Le Pacte cramoisi reste contraignant même après la défaite de ses anciens adversaires.'}),
 row('c4_aires','Les relais des hauteurs','liberation',['c4_accueil'],{companion:'kesh',event:'relais-aeriens',text:'Les aires accueillent messages et réserves. Kesh choisit enfin un lieu où revenir.'}),
 row('c4_ancrages','Les accords des dernières flammes','knowledge',['c4_eaux','c4_forges'],{any:['c4_val','c4_aires'],companion:'vaul',event:'ancrages-connectes',text:'Vaul et Iria relient les installations sans remettre leur commandement à une autorité unique.'}),
 row('c4_defense','La défense des ancrages','defense',['c4_ancrages','c4_val','c4_aires'],{event:'ancrages-defendus',text:'Les garnisons repoussent les assauts simultanés. Une défense échouée reste une opération à reprendre, jamais la disparition définitive d’un peuple.'}),
 row('c4_rempart','Le Rempart vivant','boss',['c4_defense'],{event:'commandants-retires',text:'Les commandants qui alimentaient la défense centrale sont retirés du réseau. Les ancrages locaux continuent à tenir.'}),
 row('c4_voix','Les Voix enchaînées','defense',['c4_rempart'],{event:'voix-liberees',text:'Les consciences sont rendues à leurs détenteurs ou à leurs communautés pendant que les relais maintiennent les protections.'}),
 row('c4_severin','Le Premier Veilleur','boss',['c4_voix','c4_defense'],{boss:'Séverin d’Orme',event:'unisson-interrompu',text:'Séverin est vaincu. Néran détruit le noyau du retour ; son corps demeure animé, mais le lendemain ne pourra plus être corrigé.'})
];
export const TERRITORIES=Object.fromEntries(rows.map((zone,index)=>{
 const chapter=Math.floor(index/10)+1,position=index%10,baseStages={refuge:2,quarry:3,fen:3,archive:3,forest:4,bastion:4},stages=baseStages[zone.id]||(position===0?2:zone.id==='c4_severin'?12:zone.kind==='boss'?8:zone.kind==='defense'?6:5);
 return [zone.id,{...zone,chapter,position,stages,hp:Math.round((120+position*95)*CHAPTER_PRESSURE[chapter-1]),dps:Number(((3.2+position*2.8)*CHAPTER_PRESSURE[chapter-1]).toFixed(1)),healing:zone.kind==='boss'?30*chapter:0,bonus:zone.kind==='resource'?.06:zone.kind==='liberation'?.025:0}];
}));
const labels={liberation:'Libération',resource:'Ressources',defense:'Défense',boss:'Boss',knowledge:'Savoir'};
export const SAGA_ZONES=Object.fromEntries(Object.values(TERRITORIES).map(z=>[z.id,{...z,kind:labels[z.kind],biome:z.chapter===1?'Frontières':z.chapter===2?'Val et Falaises':z.chapter===3?'Cités et Cimes':'Auréance',icon:z.kind==='boss'?'♜':z.kind==='defense'?'⛨':z.kind==='resource'?'⚒':'◈',purpose:z.kind==='resource'?'Sécuriser un revenu et les réserves de la coalition':z.kind==='defense'?'Tenir le relais et protéger ses habitants':'Préparer la suite de la coalition',reward:z.companion?'Alliance · '+z.companion:z.event?'Mémoire et routes nouvelles':'Habitants et ressources',enemy:z.boss||'Forces du Concordat',threat:z.kind==='defense'?'Une ligne durable et un ravitaillement préparé sont conseillés.':'Comparez la formation, ses équipements et ses sorts.',after:z.text}]));
const copy=value=>JSON.parse(JSON.stringify(value));
const baseIds=['refuge','quarry','fen','archive','forest','bastion'];
const unique=values=>[...new Set(values)];
export function initialSaga(){return {version:SAGA_VERSION,chapter:1,ascensions:0,relicsSpent:0,progress:{},completed:[],events:[],memories:[],signatures:[],signatureOffers:[],companions:['ossene'],metCompanions:['ossene'],decisions:{},history:[],scenes:[],chronicles:[],ended:false,ending:null};}
export function restoreSaga(raw){
 if(raw===undefined||raw===null)return initialSaga();
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.version!==SAGA_VERSION)throw Error('Format de récit non reconnu.');
 const s=initialSaga();
 if(!Number.isInteger(raw.chapter)||raw.chapter<1||raw.chapter>4||raw.ascensions!==raw.chapter-1)throw Error('Ancrages incohérents.');
 s.chapter=raw.chapter;s.ascensions=raw.ascensions;s.relicsSpent=normalizeRelics(raw);
 for(const id of ['completed','events','memories','signatures','signatureOffers','companions','metCompanions','history']){
  if(!Array.isArray(raw[id])||raw[id].length>200||raw[id].some(value=>typeof value!=='string'||value.length>250))throw Error('Mémoire de campagne invalide.');s[id]=unique(raw[id]);
 }
 const people=new Set(['ossene','tesk','rovek','maera','kesh','iria','vaul']);
 for(const key of ['signatures','signatureOffers','companions','metCompanions'])if(s[key].some(id=>!people.has(id)))throw Error('Compagnon de mémoire inconnu.');
 const events=new Set(Object.values(TERRITORIES).map(z=>z.event).filter(Boolean));
 if(s.events.some(id=>!events.has(id)))throw Error('Événement de mémoire inconnu.');
 if(s.memories.some(id=>!CHAPTERS.some(ch=>ch.memory===id)))throw Error('Souvenir inconnu.');
 if(s.completed.some(id=>!TERRITORIES[id])||s.history.some(id=>!TERRITORIES[id]))throw Error('Territoire inconnu.');
 if(s.completed.some(id=>TERRITORIES[id].chapter!==s.chapter&&!baseIds.includes(id)))throw Error('Un territoire appartient à une autre boucle.');
 for(let chapter=1;chapter<s.chapter;chapter++)if(!s.memories.includes(CHAPTERS[chapter-1].memory))throw Error('Un ancrage a été consommé sans sa mémoire.');
 if(!raw.progress||typeof raw.progress!=='object'||Array.isArray(raw.progress))throw Error('Progression narrative invalide.');
 for(const [id,value]of Object.entries(raw.progress)){if(!TERRITORIES[id]||!Number.isInteger(value)||value<0||value>TERRITORIES[id].stages||value>0&&TERRITORIES[id].chapter!==s.chapter&&!baseIds.includes(id))throw Error('Palier narratif invalide.');s.progress[id]=value;}
 for(const id of s.completed)if(s.progress[id]!==TERRITORIES[id].stages)throw Error('Territoire incomplet déclaré libéré.');
 if(!raw.decisions||typeof raw.decisions!=='object'||Array.isArray(raw.decisions))throw Error('Accords invalides.');
 for(const [id,value]of Object.entries(raw.decisions)){if(!TERRITORIES[id]||!['alliance','protectorate','occupation'].includes(value))throw Error('Accord inconnu.');s.decisions[id]=value;}
 s.scenes=[];
 for(const item of raw.scenes||[]){if(!item||typeof item.id!=='string'||typeof item.title!=='string'||typeof item.text!=='string'||item.text.length>2000||!Number.isInteger(item.chapter)||item.chapter<1||item.chapter>s.chapter||s.scenes.length>=50)throw Error('Scène invalide.');s.scenes.push({id:item.id,title:item.title,text:item.text,chapter:item.chapter});}
 s.chronicles=[];for(const item of raw.chronicles||[]){if(!item||!Number.isInteger(item.chapter)||item.chapter<1||item.chapter>4||typeof item.title!=='string'||typeof item.summary!=='string'||s.chronicles.length>=4)throw Error('Chronique invalide.');s.chronicles.push(copy(item));}
 if(typeof raw.ended!=='boolean'||raw.ended&&s.chapter!==4)throw Error('Fin incohérente.');
 s.ended=raw.ended;
 if(raw.ending!==null){if(!raw.ending||!['concord','empire','withdrawal'].includes(raw.ending.choice)||!s.ended||!s.completed.includes('c4_severin'))throw Error('Épilogue invalide.');s.ending=epilogue({...s,ending:raw.ending},raw.ending.choice);}
 if(s.ended&&!s.ending)throw Error('Épilogue absent.');
 return s;
}
export function ensureSaga(s){if(!s.saga)s.saga=initialSaga();return s.saga;}
export function sagaContext(s){const saga=ensureSaga(s);return {chapter:saga.chapter,completed:[...saga.completed],events:[...saga.events],signatures:[...saga.signatures]};}
export const chapterTierCap=s=>CHAPTER_TIER_CAPS[ensureSaga(s).chapter-1];
export const trainingCap=chapterTierCap;
export function sagaScene(s){return ensureSaga(s).scenes[0]||null;}
export function acknowledgeScene(s){return ensureSaga(s).scenes.shift()||null;}
export function zonesFor(s){const chapter=ensureSaga(s).chapter;return Object.fromEntries(Object.entries(SAGA_ZONES).filter(([id,z])=>z.chapter===chapter||baseIds.includes(id)));}
export function sagaDone(s,id){return ensureSaga(s).completed.includes(id);}
function routesMet(s,z){return z.requires.every(id=>sagaDone(s,id))&&(!z.any||z.any.some(id=>sagaDone(s,id)));}
export function sagaVisible(s,id){const z=TERRITORIES[id];return !!z&&(z.chapter===ensureSaga(s).chapter||baseIds.includes(id))&&routesMet(s,z);}
export function sagaRequirements(s,id){
 const z=TERRITORIES[id];if(!z)return [{key:'zone',label:'Destination inconnue',met:false,screen:'map'}];
 const req=z.requires.map(key=>({key,label:'Sécuriser '+TERRITORIES[key].name,met:sagaDone(s,key),screen:'map'}));
 if(z.any)req.push({key:'route',label:'Une route parmi : '+z.any.map(key=>TERRITORIES[key].name).join(' / '),met:z.any.some(key=>sagaDone(s,key)),screen:'map'});
 for(const [key,value]of Object.entries(z.need||{}))req.push({key:'stock-'+key,label:`Réunir ${value} ${key==='iron'?'fer':key==='herbs'?'herbes':'os'} en réserve`,met:(s.resources?.[key]||0)>=value,screen:'kingdom'});
 if(z.chapter>1&&z.position>0){const tier=z.chapter+(z.kind==='boss'?1:0),units=[...Object.values(s.troops||{}),...Object.values(s.legion?.units||{})],qualified=units.some(unit=>unit.count>0&&unit.tier>=tier),hero=(s.physical||1)>=tier&&(s.weapon||0)>=tier;req.push({key:'preparation',label:`Un régiment T${tier} ou Néran avec corps et arme rang ${tier}`,met:qualified||hero,screen:'kingdom'});}
 return req;
}
export function productionBonuses(s){const saga=ensureSaga(s),memory=.25*saga.ascensions,ironSites=['quarry','fonderie','c2_ateliers','c3_convois','c3_forges','c4_forges'],herbSites=['fen','c2_alchimie','c3_hospices','c4_eaux','c4_val'];return {bones:1+memory,iron:1+memory+.2*saga.completed.filter(id=>ironSites.includes(id)).length,herbs:1+memory+.2*saga.completed.filter(id=>herbSites.includes(id)).length,reconstruction:1+.35*saga.ascensions};}
function addResource(s,key,amount){if(!s.resources)s.resources={};s.resources[key]=Math.min(1e9,Math.max(0,Number.isFinite(s.resources[key])?s.resources[key]:0)+amount);}
export function recordVictory(s,id,{stage=0,first=true}={}){
 const saga=ensureSaga(s),z=TERRITORIES[id];
 if(!z||!Number.isInteger(stage)||stage<0||stage>=z.stages||!sagaVisible(s,id))return {ok:false,error:'Route ou palier indisponible.'};
 if(!first||stage<(saga.progress[id]||0))return {ok:true,replayed:true,completed:sagaDone(s,id)};
 const engineCompleted=stage===z.stages-1&&(s.progress?.[id]||0)>=z.stages;
 if(stage!==(saga.progress[id]||0)&&!engineCompleted)return {ok:false,error:'Les paliers précédents restent à sécuriser.'};
 saga.progress[id]=stage+1;
 if(s.progress)s.progress[id]=Math.max(s.progress[id]||0,stage+1);
 if(stage+1<z.stages)return {ok:true,completed:false};
 if(sagaDone(s,id))return {ok:true,replayed:true,completed:true};
 saga.completed.push(id);
 for(const [key,amount]of Object.entries({bones:25*z.chapter,iron:z.kind==='resource'?15*z.chapter:0,herbs:z.kind==='defense'?12*z.chapter:0}))addResource(s,key,amount);
 for(const [key,count]of Object.entries(z.people||{}))if(s.groups?.[key])s.groups[key].total+=count;
 if(z.site&&s.sites){if(z.site==='both'){s.sites.mine=true;s.sites.fen=true;}else s.sites[z.site]=true;}
 if(z.unlock&&s.progress){const ids=z.unlock==='all'?['refuge','quarry','fen','archive']:[z.unlock];for(const key of ids){s.progress[key]=TERRITORIES[key].stages;if(!saga.completed.includes(key))saga.completed.push(key);saga.progress[key]=TERRITORIES[key].stages;}}
 if(z.companion){saga.companions=unique([...saga.companions,z.companion]);saga.metCompanions=unique([...saga.metCompanions,z.companion]);}
 if(z.signature)saga.signatureOffers=unique([...saga.signatureOffers,z.signature]);
 if(z.event)saga.events=unique([...saga.events,z.event]);
 saga.history.push(id);saga.history=saga.history.slice(-200);
 saga.scenes.push({id,title:z.name,text:z.text,chapter:z.chapter});saga.scenes=saga.scenes.slice(-50);
 return {ok:true,completed:true,text:z.text,signatureOffer:z.signature||null,ascensionAvailable:canAscend(s),finalBattleWon:id==='c4_severin'};
}
export function onBaseVictory(s,id){if(!baseIds.includes(id))return {ok:false};bootstrapSaga(s);return {ok:true,completed:sagaDone(s,id)};}
export function bootstrapSaga(s){
 const saga=ensureSaga(s);
 // Old frontier saves represent victories already paid by the original engine: never duplicate their material rewards.
 for(const id of baseIds){if((s.progress?.[id]||0)>=TERRITORIES[id].stages&&!saga.completed.includes(id)){saga.completed.push(id);saga.progress[id]=TERRITORIES[id].stages;if(TERRITORIES[id].event)saga.events=unique([...saga.events,TERRITORIES[id].event]);}}
 if(saga.completed.includes('refuge'))saga.companions=unique([...saga.companions,'ossene']);
 if(saga.completed.includes('quarry'))saga.companions=unique([...saga.companions,'rovek']);
 if(saga.completed.includes('fen'))saga.companions=unique([...saga.companions,'tesk']);
 saga.metCompanions=unique([...saga.metCompanions,...saga.companions]);return saga;
}
export function acceptSignature(s,id){const saga=ensureSaga(s);if(!saga.signatureOffers.includes(id))return 'Cette signature n’a pas encore été proposée.';saga.signatures=unique([...saga.signatures,id]);return null;}
export function decideTerritory(s,id,choice){const saga=ensureSaga(s);if(!sagaDone(s,id)||!['alliance','protectorate','occupation'].includes(choice))return 'Cet accord n’est pas disponible.';saga.decisions[id]=choice;return null;}
export const govern=decideTerritory;
export function canAscend(s){const saga=ensureSaga(s);return !saga.ended&&saga.chapter<4&&saga.ascensions===saga.chapter-1&&sagaDone(s,CHAPTERS[saga.chapter-1].final);}
export function ascendSaga(s,freshFactory){
 if(!canAscend(s))throw Error('Le prochain ancrage n’est pas disponible.');
 if(typeof freshFactory!=='function')throw Error('Une reconstruction matérielle fraîche est nécessaire.');
 const previous=ensureSaga(s),next=freshFactory();if(!next||next===s||!next.resources||next.resources===s.resources)throw Error('La reconstruction doit fournir un état neuf.');
 const saga=initialSaga();saga.chapter=previous.chapter+1;saga.ascensions=previous.ascensions+1;
 for(const key of ['events','memories','signatures','metCompanions','decisions','history'])saga[key]=copy(previous[key]);
 saga.memories=unique([...saga.memories,CHAPTERS[previous.chapter-1].memory]);saga.companions=['ossene'];
 next.saga=saga;next.knowledge=copy(s.knowledge||{});
 const entry=Object.values(TERRITORIES).find(zone=>zone.chapter===saga.chapter&&zone.position===0).id;
 next.selected=entry;if(next.expedition)next.expedition={running:false,mode:'progress',zone:entry,stage:0,wait:0};
 if(typeof s.prologueRead==='boolean')next.prologueRead=s.prologueRead;
 if(s.guide)next.guide=copy(s.guide);
 if(s.helpSeen){next.helpSeen=copy(s.helpSeen);next.helpQueue=[];}
 saga.scenes=[{id:'chapter-'+saga.chapter,title:CHAPTERS[saga.chapter-1].title,text:CHAPTERS[saga.chapter-1].intro,chapter:saga.chapter}];
 saga.chronicles=[...copy(previous.chronicles),{chapter:previous.chapter,title:CHAPTERS[previous.chapter-1].title,summary:TERRITORIES[CHAPTERS[previous.chapter-1].final].text}];
 // Optional magical mastery from companion systems is knowledge, never a copy of an army or gear.
 if(s.magicalKnowledge)next.magicalKnowledge=copy(s.magicalKnowledge);
 return next;
}
export function epilogue(s,choice='concord'){
 const saga=ensureSaga(s),counts={alliance:0,protectorate:0,occupation:0};for(const value of Object.values(saga.decisions))counts[value]++;
 const titles={concord:'La Concorde des Cendres',empire:'L’Empire des Veilles',withdrawal:'Le Trône vacant'};
 const texts={concord:'Les peuples conservent leurs représentants et un droit réel de désaccord. Néran accepte une fonction de protection limitée par leurs accords.',empire:'Les territoires demeurent unis sous une autorité centrale forte. La paix est réelle ; le poids des garnisons et la confiance inégale restent des responsabilités du royaume.',withdrawal:'Les relais locaux et les compagnons assument le gouvernement. Néran demeure un témoin et un conseiller, sans exercer une autorité quotidienne.'};
 return {choice,title:titles[choice],text:texts[choice],agreements:counts,resolution:'L’Unisson est interrompu. Les noms captifs sont rendus et les protections passent aux ancrages régionaux. Néran reste animé mais le protocole de retour est détruit.',companions:{tesk:'Partage les eaux et rend publiques ses erreurs.',rovek:'Transforme les ateliers de guerre en un réseau aux contrats connus.',maera:'Fait vivre le Pacte cramoisi sans domaine de captifs.',kesh:'Rouvre les routes aériennes et choisit une aire où revenir.',iria:'Défend une Aube qui peut être contestée.',vaul:'Reconnaît la dette des dragons et tient ses engagements.',ossene:'Achève la liste des noms restitués et laisse une page vide.'},lastImage:'Les archives sont ouvertes. Les cloches sonnent un matin qui n’existait dans aucune boucle précédente.'};
}
export function finishSaga(s,choice='concord'){
 const saga=ensureSaga(s);if(saga.chapter!==4||!sagaDone(s,'c4_severin')||!['concord','empire','withdrawal'].includes(choice))return 'La conclusion n’est pas encore disponible.';
 if(saga.ended)return saga.ending.choice===choice?null:'La décision finale a déjà été inscrite.';
 saga.ended=true;saga.ending=epilogue(s,choice);saga.chronicles.push({chapter:4,title:CHAPTERS[3].title,summary:saga.ending.resolution});return null;
}
