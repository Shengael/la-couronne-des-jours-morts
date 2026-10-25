import * as Relics from './relics.mjs';
export {Relics};
// Domain model for the playable frontier. No browser dependencies.
import * as Saga from './saga.mjs';
import * as Legion from './legion.mjs';
export {Saga,Legion};
export const VERSION=2;
export const BALANCE_REVISION=2;
export const COMMON_MAX_TIER=10,EXCEPTIONAL_TIER=11;
export const GUIDE_IDS=['intro','kingdom','recruit','task','spell','army','equip','equip-spell','routes','site','automation','offline','report'];
export const RESOURCES={bones:'Os',iron:'Fer',herbs:'Herbes'};
export const GROUPS={settlers:{name:'Réfugiés des Veilles',people:'Humains',affinity:'Polyvalents',mine:1,fen:.8},orcs:{name:'Orcs des Marches',people:'Orcs',affinity:'Extraction lourde +30 %',mine:1.3,fen:.7},aquatic:{name:'Habitants du chenal',people:'Peuple aquatique',affinity:'Récolte des marais +50 %',mine:.8,fen:1.5}};
export const SITES={mine:{name:'Carrière des Veilles',icon:'⛰',resource:'iron',slots:12,base:.12,description:'Extraction de fer. Les outils et les mineurs formés augmentent le rendement.'},fen:{name:'Jardins du chenal',icon:'♧',resource:'herbs',slots:10,base:.12,description:'Récolte des marais. Les habitants aquatiques y sont particulièrement efficaces.'}};
export const UNITS={guards:{name:'Gardes des Veilles',icon:'⛨',role:'Protection',hp:32,attack:2.2},raiders:{name:'Briseurs des Marches',icon:'⚒',role:'Assaut',hp:22,attack:3.7},lancers:{name:'Lanciers du chenal',icon:'♜',role:'Polyvalence',hp:28,attack:2.8}};
export const SPELLS={bolt:{name:'Trait funèbre',icon:'✦',description:'Inflige 48 dégâts toutes les 7 secondes. Avec Néran au commandement : 60 dégâts.',cost:2,cooldown:7},ward:{name:'Rempart d’ossements',icon:'⛨',description:'Réduit les dégâts subis de 40 % pendant 5 secondes, lorsque les PV tombent sous 75 %.',cost:3,cooldown:12},silence:{name:'Silence profane',icon:'◈',description:'Interrompt un soin en préparation. Attend une incantation ennemie avant de se déclencher.',cost:2,cooldown:6}};
export const BASE_ZONE_IDS=["refuge","quarry","fen","archive","forest","bastion"];
const extended=id=>!!Saga.TERRITORIES[id]&&!BASE_ZONE_IDS.includes(id);
export const ZONES={...Saga.SAGA_ZONES,
 refuge:{name:'Le passage des Veilles',kind:'Libération',biome:'Lisière',icon:'♙',purpose:'Accueillir les premiers habitants',reward:'18 habitants · Armée et Royaume · apprentissage magique',after:'Affectez des habitants à la formation. La carte ouvrira trois routes.',enemy:'Une petite escorte',threat:'Vous pouvez la vaincre seul.',hp:120,dps:3.2,stages:2},
 quarry:{name:'Carrière des Veilles',kind:'Conquête',biome:'Montagne',icon:'⛰',purpose:'Produire du fer et recruter des orcs',reward:'12 orcs · mine de fer · briseurs des Marches',after:'La mine demande des travailleurs. Les briseurs demandent une formation.',enemy:'Gardes de la carrière',threat:'Une première ligne équipée aidera à tenir.',hp:390,dps:13,stages:3},
 fen:{name:'Le village des roseaux',kind:'Libération',biome:'Marécage',icon:'♧',purpose:'Récolter des herbes et rallier des lanciers',reward:'12 habitants aquatiques · jardins · lanciers du chenal',after:'Affectez des récolteurs ou formez les nouvelles recrues.',enemy:'Forces du blocus',threat:'Le siège exige davantage de puissance que le passage initial.',hp:360,dps:12,stages:3},
 archive:{name:'Les archives sous les ronces',kind:'Savoir',biome:'Forêt',icon:'▤',purpose:'Préparer une réponse aux soins ennemis',reward:'Formule de Silence · étude des gisements · accès à la seconde lisière',after:'Il faudra étudier la formule avant de pouvoir équiper Silence.',enemy:'Pilleurs des archives',threat:'Des forces modestes, mais une résistance croissante.',hp:330,dps:11,stages:3},
 forest:{name:'Les bois des anciennes routes',kind:'Conquête',biome:'Forêt',icon:'♠',purpose:'Accueillir une nouvelle communauté',reward:'10 habitants · revenus de butin supérieurs',after:'Les nouveaux habitants peuvent travailler ou rejoindre les formations.',enemy:'Compagnie des routes',threat:'À explorer après les archives ; améliorez votre formation.',hp:680,dps:24,stages:4},
 bastion:{name:'Le bastion du chenal',kind:'Objectif régional',biome:'Forteresse',icon:'♜',purpose:'Sécuriser la première région',reward:'Maîtrise de la région · bilan de royaume',after:'Les routes de la coalition mènent maintenant aux ateliers et au prochain objectif du chapitre.',enemy:'Garnison et officiant',threat:'Un soigneur prépare des soins. Silence ou une forte puissance peut le contrer.',hp:1100,dps:34,healing:100,stages:4}
};
export const HELP={welcome:{title:'Un souverain, une première route',text:'Commencez avec Néran seul. Le passage des Veilles permet de sauver des habitants. Chaque destination indique ce que vous gagnerez et ce qu’il faudra encore développer.'},population:{title:'Des habitants, des choix',text:'Les habitants accueillis rejoignent votre réserve. Dans Royaume, affectez-les à la production ou formez-les pour l’armée. Un habitant mobilisé par une formation ne peut pas travailler en même temps.'},army:{title:'Préparer son armée',text:'Formez un premier groupe de gardes dans Royaume, puis ajoutez-le à votre armée. Les sorts doivent être appris avant d’être équipés. Le même build est conservé pendant la progression automatique.'},parallel:{title:'Travailler sans multiplier les clics',text:'Deux formations, une étude et un chantier peuvent avancer en parallèle. Choisissez une cible pour automatiser. Les ressources sont consommées pendant le travail ; une pénurie suspend la tâche sans perdre la progression.'},routes:{title:'Trois routes, trois besoins',text:'La carrière ouvre le fer et les orcs. Le village des roseaux ouvre les récoltes et les lanciers. Les archives donnent accès à de nouveaux savoirs. Choisissez leur ordre selon les besoins de votre royaume.'},site:{title:'Une source de revenus à organiser',text:'Un site ne produit que si des travailleurs sont affectés. Comparez effectifs, qualification et affinité. Les outils améliorent tout le site. Vous pouvez déplacer les travailleurs libres entre les postes.'},magic:{title:'Un savoir utilisable',text:'Apprendre un sort le rend disponible dans Armée. Équipez-le pour qu’il se déclenche automatiquement selon sa fonction. Le détail explique dégâts, coût et condition ; un bonus indique son bénéficiaire.'},completion:{title:'La première frontière est sécurisée',text:'Les sites continuent à produire et les patrouilles rapportent des os. D’autres routes du chapitre apparaissent dans Monde. Les objectifs de fin de chapitre ouvrent un ancrage unique, avec un récapitulatif avant toute reconstruction.'}};
const copy=x=>JSON.parse(JSON.stringify(x));
const finite=(v,min=0,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const integer=(v,min=0,max=1e6)=>Number.isSafeInteger(v)&&finite(v,min,max);
export function fresh(now=Date.now()){return {version:VERSION,balanceRevision:BALANCE_REVISION,prologueRead:false,saga:Saga.initialSaga(),legion:Legion.freshLegion(),savedAt:now,elapsed:0,resources:{bones:30,iron:0,herbs:0},reserves:{bones:0,iron:0,herbs:0},groups:{settlers:{total:0,tier:1},orcs:{total:0,tier:1},aquatic:{total:0,tier:1}},assignments:{mine:{settlers:0,orcs:0,aquatic:0},fen:{settlers:0,orcs:0,aquatic:0}},sites:{mine:false,fen:false},tools:{mine:0,fen:0},study:{mine:0,fen:0},troops:{guards:{count:0,tier:1},raiders:{count:0,tier:1},lancers:{count:0,tier:1}},physical:1,weapon:0,armor:0,knowledge:{bolt:false,ward:false,silence:false},deck:{units:[],spells:[],commander:'neran',doctrine:'balanced'},progress:Object.fromEntries(Object.keys(ZONES).map(k=>[k,0])),selected:'refuge',expedition:{running:false,mode:'progress',zone:'refuge',stage:0,wait:0},jobs:[],nextJob:1,guide:{enabled:true,seen:[]},tutorialPaused:false,nextOrder:null,helpSeen:[],helpQueue:['welcome'],log:[],reports:[],battle:null,victories:0,defeats:0,revision:0};}
export function note(s,text){s.log.unshift({text,time:s.elapsed});s.log=s.log.slice(0,30);}
export function introduce(s,id){if(!s.helpSeen.includes(id)&&!s.helpQueue.includes(id))s.helpQueue.push(id);}
export function dismissHelp(s){const id=s.helpQueue.shift();if(id&&!s.helpSeen.includes(id))s.helpSeen.push(id);}
export const done=(s,id)=>!!ZONES[id]&&s.progress[id]>=ZONES[id].stages;
export function lootFor(id,stage){if(!ZONES[id]||!integer(stage,0,ZONES[id].stages-1))return null;const z=Saga.TERRITORIES[id],factor=extended(id)?z.chapter*z.chapter*(1+.35*z.position):1;return {bones:Math.round((14+stage*5)*factor),iron:0,herbs:0};}
export function requirements(s,id){
 if(extended(id)){const result=Saga.sagaRequirements(s,id),gate=result.find(r=>r.key==='preparation');if(gate){const tier=Saga.TERRITORIES[id].chapter+(Saga.TERRITORIES[id].kind==='boss'?1:0),ready=army(s);gate.met=ready.some(u=>u.id!=='neran'&&(s.troops[u.id]?.tier||s.legion.units[u.id]?.tier)>=tier)||s.physical>=tier&&s.weapon>=tier;gate.label+=' · prêt et équipé';}return result;}
 const ready=army(s).filter(u=>u.id!=='neran'),count=ready.reduce((sum,u)=>sum+u.count,0),tier=ready.some(u=>s.troops[u.id].tier>=2),aquatic=ready.find(u=>u.id==='lancers')?.count||0;
 const req=(key,label,met,screen='army')=>({key,label,met:!!met,screen});
 const troops=n=>req('troops',n+' soldats prêts et équipés ('+count+'/'+n+')',count>=n,Object.values(s.troops).reduce((sum,t)=>sum+t.count,0)>=n?'army':'kingdom');
 const spell=key=>req(key,SPELLS[key].name+' appris et équipé',s.knowledge[key]&&s.deck.spells.includes(key),s.knowledge[key]?'army':'kingdom');
 if(id==='quarry')return [troops(8)];
 if(id==='archive')return [troops(4),spell('bolt')];
 if(id==='fen')return [troops(8),spell('ward')];
 if(id==='forest')return [troops(12),req('body','Corps de Néran au rang 2 ('+s.physical+'/2)',s.physical>=2,'kingdom'),req('tools','Outils de la mine au niveau 1',s.sites.mine&&s.tools.mine>=1,'kingdom')];
 if(id==='bastion')return [req('aquatic','8 lanciers du chenal prêts et équipés ('+aquatic+'/8) pour franchir les eaux',aquatic>=8,s.troops.lancers.count>=8?'army':'kingdom'),troops(16),req('tier','Un régiment équipé de qualification T2 au minimum',tier,'kingdom'),spell('silence')];
 return [];
}
export function missingRequirements(s,id){return requirements(s,id).filter(r=>!r.met);}
export function requestExpedition(s,id,mode='progress'){if(!s.battle)return start(s,id,mode);if(mode==='progress'&&missingRequirements(s,id).length)return 'Préparation requise : '+missingRequirements(s,id).map(r=>r.label).join(' · ');if(!ZONES[id]||!visible(s,id))return 'Cette destination reste à découvrir.';if(!['farm','progress'].includes(mode)||mode==='farm'&&!s.progress[id]||mode==='progress'&&done(s,id))return 'Cet ordre n’est pas disponible pour cette zone.';s.nextOrder={zone:id,mode};s.revision++;return null;}
export const opened=s=>done(s,'refuge');
export function visible(s,id){if(extended(id))return Saga.sagaVisible(s,id);if(s.saga.chapter>1)return done(s,id);if(id==='refuge')return true;if(!opened(s))return false;if(id==='forest')return done(s,'archive');if(id==='bastion')return ['quarry','fen','archive'].filter(k=>done(s,k)).length>=2;return true;}
export function unitAvailable(s,id){return id==='guards'?opened(s):id==='raiders'?done(s,'quarry'):id==='lancers'?done(s,'fen'):false;}
export const trainingGroup=id=>({guards:'settlers',raiders:'orcs',lancers:'aquatic'})[id];
export function assigned(s,group){return Object.values(s.assignments).reduce((n,a)=>n+a[group],0);}
export function deployed(s,group){return Object.entries(s.troops).reduce((n,[id,t])=>n+(trainingGroup(id)===group?t.count:0),0);}
export function busy(s,group){return s.jobs.reduce((n,j)=>n+(j.active&&j.spec?.personnel?.group===group?j.spec.personnel.count:0),0);}
export function free(s,group){return s.groups[group].total-assigned(s,group)-deployed(s,group)-busy(s,group);}
export function siteProduction(s,id){if(!s.sites[id])return 0;let base=0;for(const [g,count]of Object.entries(s.assignments[id]))base+=count*GROUPS[g][id]*(1+.35*(s.groups[g].tier-1));return base*SITES[id].base*(1+.25*s.tools[id])*(1+.2*s.study[id])*(Saga.productionBonuses(s)[SITES[id].resource]||1);}
export function income(s){return {bones:.5,iron:siteProduction(s,'mine'),herbs:siteProduction(s,'fen')};}
export function assign(s,site,group,delta){if(!SITES[site]||!GROUPS[group]||!integer(delta,-100000,100000)||delta===0)return 'Affectation invalide.';if(!s.sites[site])return 'Ce site est à conquérir.';const current=s.assignments[site][group],slots=SITES[site].slots-Object.values(s.assignments[site]).reduce((a,b)=>a+b,0);if(delta>0&&(free(s,group)<delta||slots<delta))return 'Habitants libres ou postes insuffisants.';if(current+delta<0)return 'Ce groupe ne compte pas autant de travailleurs sur ce site.';s.assignments[site][group]+=delta;s.revision++;return null;}
export function availableResearch(s,id){if(s.saga?.ascensions>0&&s.knowledge[id])return true;return id==='bolt'?opened(s):id==='ward'?opened(s):id==='silence'?done(s,'archive'):false;}
export function jobLevel(s,kind,target){if(kind==='recruit')return s.troops[target]?.count;if(kind==='train')return s.troops[target]?.tier;if(kind==='worker')return s.groups[target]?.tier;if(kind==='tools')return s.tools[target];if(kind==='study')return s.study[target];if(kind==='spell')return s.knowledge[target]?1:0;if(kind==='physical')return s.physical;if(kind==='weapon')return s.weapon;if(kind==='armor')return s.armor;return 0;}
function legacySpecification(s,kind,target){const level=jobLevel(s,kind,target);if(level===undefined)return null;
 if(kind==='recruit'&&unitAvailable(s,target))return {family:'formation',label:`Former 4 ${UNITS[target].name.toLowerCase()}`,duration:24,cost:{bones:16,iron:target==='guards'?0:3},personnel:{group:trainingGroup(target),count:4}};
 if(kind==='train'&&unitAvailable(s,target)&&s.troops[target].count>0&&level<4)return {family:'formation',label:`${UNITS[target].name} : T${level} → T${level+1}`,duration:45*level,cost:{bones:35*level,iron:12*level},personnel:{group:trainingGroup(target),count:0},trainingUnit:target};
 if(kind==='worker'&&GROUPS[target]&&s.groups[target].total>0&&level<4)return {family:'formation',label:`Qualification civile : ${GROUPS[target].people} T${level} → T${level+1}`,duration:50*level,cost:{bones:30*level,iron:10*level},personnel:{group:target,count:1}};
 if(kind==='tools'&&s.sites[target]&&level<5)return {family:'works',label:`Outils : ${SITES[target].name} ${level} → ${level+1}`,duration:35*(level+1),cost:{bones:20*(level+1),iron:14*(level+1)}};
 if(kind==='study'&&s.sites[target]&&done(s,'archive')&&level<3)return {family:'study',label:`Étude : ${SITES[target].name} ${level} → ${level+1}`,duration:45*(level+1),cost:{bones:30*(level+1),[SITES[target].resource]:10*(level+1)}};
 if(kind==='spell'&&availableResearch(s,target)&&!s.knowledge[target])return {family:'study',label:`Apprendre ${SPELLS[target].name}`,duration:target==='silence'?55:25,cost:{bones:target==='silence'?65:22}};
 if(kind==='physical'&&opened(s)&&level<12)return {family:'works',label:`Corps de Néran ${level} → ${level+1}`,duration:25+level*8,cost:{bones:30*Math.pow(1.4,level-1)}};
 if((kind==='weapon'||kind==='armor')&&opened(s)&&level<8)return {family:'works',label:`${kind==='weapon'?'Armes':'Armures'} ${level} → ${level+1}`,duration:30+level*10,cost:{bones:25*Math.pow(1.4,level),iron:12*Math.pow(1.4,level)}};
 return null;
}
export function trainingCeiling(s){if(s.saga.chapter===4&&Relics.earnedRelics(s)>=3)return 11;return Math.max(done(s,'archive')&&(s.sites.mine||s.sites.fen)?2:1,s.saga.chapter>1&&opened(s)?Saga.trainingCap(s):s.saga.completed.includes('fonderie')?3:1);}
export function jobLimit(s,kind){return kind==='recruit'?80:kind==='spell'?1:kind==='worker'?Math.min(10,trainingCeiling(s)):kind==='train'?trainingCeiling(s):kind==='tools'?5:kind==='study'?3:kind==='physical'?12:8;}
export function specification(s,kind,target,legacy=false){
 let spec=legacySpecification(s,kind,target);if(legacy)return spec;
 const current=jobLevel(s,kind,target);
 if(!spec&&kind==='train'&&unitAvailable(s,target)&&s.troops[target].count>0&&current<trainingCeiling(s))spec={family:'formation',personnel:{group:trainingGroup(target),count:0},trainingUnit:target};
 if(!spec&&kind==='worker'&&s.groups[target]?.total>0&&current<trainingCeiling(s))spec={family:'formation',label:'Qualification civile : '+GROUPS[target].people+' T'+current+' → T'+(current+1),personnel:{group:target,count:1}};
 if(!spec)return null;
 const level=jobLevel(s,kind,target);
 if(kind==='worker'&&level>=10)return null;
 if(['train','worker'].includes(kind)&&level>=trainingCeiling(s))return null;
 if(kind==='train'&&level===10){const own=s.jobs.find(j=>j.kind==='train'&&j.target===target);if(!Relics.exaltationAllowed(s,'base',target,{ignoreJobId:own?'base:'+own.id:undefined}))return null;return {family:'formation',label:UNITS[target].name+' : maîtrise exceptionnelle T11 · 3 fragments',duration:300/(1+.35*s.saga.ascensions),cost:{bones:50000,iron:4000,herbs:1500},personnel:{group:trainingGroup(target),count:0},trainingUnit:target,relicsCost:3};}
 if(kind==='recruit')spec.duration=level===0?8:12;
 if(kind==='spell'){spec.duration=target==='bolt'?8:target==='ward'?18:35;spec.cost=target==='silence'?{bones:120,herbs:20}:{bones:target==='bolt'?22:45};}
 if(kind==='train'){spec.label=UNITS[target].name+' : qualification militaire T'+level+' → T'+(level+1);spec.duration=45*level;spec.cost={bones:180*level*Math.pow(1.35,level-1),iron:90*level*Math.pow(1.3,level-1)};}
 if(kind==='worker'){spec.duration=45*level;spec.cost={bones:140*level*Math.pow(1.3,level-1),iron:60*level*Math.pow(1.3,level-1)};}
 if(kind==='tools'){spec.duration=15+level*15;spec.cost={bones:80*Math.pow(1.8,level),iron:35*Math.pow(1.7,level)};}
 if(kind==='physical'){spec.duration=12+(level-1)*6;spec.cost={bones:45*Math.pow(1.8,level-1),iron:level<=1?0:10*(level-1)};}
 if(kind==='weapon'||kind==='armor'){spec.duration=18+level*8;spec.cost={bones:80*Math.pow(1.8,level),iron:35*Math.pow(1.7,level)};}
 spec.duration/=(Saga.productionBonuses(s).reconstruction||1);return spec;
}
export function quoteJob(s,kind,target,goal){
 const from=jobLevel(s,kind,target),step=kind==='recruit'?4:1;if(!integer(goal,from+1,jobLimit(s,kind))||(goal-from)%step)return null;
 const preview=copy(s),cost={bones:0,iron:0,herbs:0};let duration=0,steps=0;
 while(jobLevel(preview,kind,target)<goal){const spec=specification(preview,kind,target);if(!spec)return null;duration+=spec.duration;steps++;for(const [id,value]of Object.entries(spec.cost))cost[id]+=value;
  if(kind==='recruit')preview.troops[target].count+=4;else if(kind==='train')preview.troops[target].tier++;else if(kind==='worker')preview.groups[target].tier++;else if(kind==='tools')preview.tools[target]++;else if(kind==='study')preview.study[target]++;else if(kind==='spell')preview.knowledge[target]=true;else preview[kind]++;
 }
 return {duration,cost,steps};
}
export function addJob(s,kind,target,goal){const spec=specification(s,kind,target);if(!spec)return 'Ce programme est verrouillé ou terminé.';if(s.jobs.length>=12)return 'Douze programmes maximum : terminez ou retirez un programme.';if(s.jobs.some(j=>j.kind===kind&&j.target===target))return 'Ce programme existe déjà : ajustez sa cible.';
 const current=jobLevel(s,kind,target),maximum=jobLimit(s,kind);
 if(goal===undefined)goal=kind==='recruit'?current+4:current+1;if(!integer(goal,current+1,maximum))return 'Cible hors limites.';if(kind==='recruit'&&(goal-current)%4!==0)return 'La formation se fait par groupes de quatre.';
 s.jobs.push({id:s.nextJob++,kind,target,goal,paused:false,active:false,progress:0,spec:null,rulesVersion:BALANCE_REVISION,status:'En attente'});introduce(s,'parallel');s.revision++;return null;
}
export function editJob(s,id,action,value){const at=s.jobs.findIndex(j=>j.id===id);if(at<0)return 'Programme absent.';const j=s.jobs[at];if(action==='pause')j.paused=!j.paused;else if(action==='cancel')s.jobs.splice(at,1);else if(action==='up'&&at>0)[s.jobs[at-1],s.jobs[at]]=[j,s.jobs[at-1]];else if(action==='goal'){const max=jobLimit(s,j.kind);if(!integer(value,1,max)||value<=jobLevel(s,j.kind,j.target)||j.kind==='recruit'&&(value-jobLevel(s,j.kind,j.target))%4!==0)return 'Cible invalide.';j.goal=value;}else return 'Action invalide.';s.revision++;return null;}
export function setReserve(s,id,value){if(!(id in RESOURCES)||!finite(value,0,1e6))return 'Réserve invalide.';s.reserves[id]=value;return null;}
function finishJob(s,j){const {kind,target}=j;if(j.spec.relicsCost&&!Relics.consumeRelics(s,j.spec.relicsCost,{ignoreJobId:'base:'+j.id}))throw Error('Fragments réservés incohérents.');if(kind==='recruit')s.troops[target].count+=4;else if(kind==='train')s.troops[target].tier++;else if(kind==='worker')s.groups[target].tier++;else if(kind==='tools')s.tools[target]++;else if(kind==='study')s.study[target]++;else if(kind==='spell'){s.knowledge[target]=true;introduce(s,'magic');}else s[kind]++;
 note(s,`${j.spec.label} — terminé.`);j.active=false;j.progress=0;j.spec=null;s.revision++;
}
function processJobs(s,dt){const counts={formation:0,study:0,works:0};for(const j of s.legion.jobs){if(!j.paused&&j.status==='En cours'){const q=Legion.legionQuote(s,j.kind,j.target);if(q)counts[q.family]++;}}for(const j of s.jobs){if(j.active&&!j.paused)counts[j.spec.family]++;}
 const remove=[];
 for(const j of s.jobs){if(j.paused){j.status='En pause';continue;}if(jobLevel(s,j.kind,j.target)>=j.goal){if(!j.active)remove.push(j.id);continue;}
  if(!j.active){const spec=specification(s,j.kind,j.target,j.rulesVersion===1);if(!spec){j.status='Prérequis manquant';continue;}if(counts[spec.family]>=(spec.family==='formation'?2:1)){j.status='Attend une place';continue;}
   if(spec.personnel&&free(s,spec.personnel.group)<spec.personnel.count){j.status='Attend des habitants libres';continue;}
   if(spec.trainingUnit&&s.battle?.deck.units.includes(spec.trainingUnit)){j.status='Attend la fin du combat';continue;}
   j.spec=copy(spec);j.active=true;counts[spec.family]++;
  }
  let work=Math.min(dt,j.spec.duration-j.progress);for(const [k,cost]of Object.entries(j.spec.cost)){if(cost>0)work=Math.min(work,Math.max(0,s.resources[k]-s.reserves[k])*j.spec.duration/cost);}
  if(work<1e-8){j.status='Attend des ressources · réserve protégée';continue;}
  for(const [k,cost]of Object.entries(j.spec.cost))if(cost>0)s.resources[k]=Math.max(0,s.resources[k]-cost*work/j.spec.duration);
  j.progress+=work;j.status=work+1e-6<dt?'Ralentit · ressources limitées':'En cours';
  if(j.progress+1e-7>=j.spec.duration){const family=j.spec.family;finishJob(s,j);counts[family]--;if(jobLevel(s,j.kind,j.target)>=j.goal)remove.push(j.id);}
 }
 s.jobs=s.jobs.filter(j=>!remove.includes(j.id));
}
export function army(s){const training=new Set(s.jobs.filter(j=>j.active&&j.kind==='train').map(j=>j.target));const attack=1+s.weapon*.18,armor=1+s.armor*.2,doctrine=s.deck.doctrine;
 const units=s.deck.units.filter(id=>s.troops[id].count&&!training.has(id)).map(id=>{const t=s.troops[id],type=UNITS[id],hp=type.hp*(1+.25*(t.tier-1))*armor*(doctrine==='bulwark'?1.25:doctrine==='assault'?.85:1);return {id,name:type.name,icon:type.icon,count:t.count,initial:t.count,hp:t.count*hp,maxHP:t.count*hp,unitHP:hp,attack:type.attack*(1+.3*(t.tier-1))*attack*(doctrine==='assault'?1.2:doctrine==='bulwark'?.9:1)};});
 const hp=180+s.physical*45;units.push({id:'neran',name:'Néran',icon:'♛',count:1,initial:1,hp,maxHP:hp,unitHP:hp,attack:9+s.physical*3});const bonus=Legion.legionBonuses(s);
 for(const u of units){const multiplier=u.id==='neran'?(bonus.heroAttack||1):(bonus.attack||1);u.attack*=multiplier;const health=u.id==='neran'?(bonus.heroHealth||1):(bonus.health||1);u.hp*=health;u.maxHP*=health;u.unitHP*=health;}
 const advanced=Legion.legionArmy(s);for(const u of advanced){u.attack*=(bonus.attack||1)*attack*(doctrine==='assault'?1.2:doctrine==='bulwark'?.9:1);const h=(bonus.health||1)*armor*(doctrine==='bulwark'?1.25:doctrine==='assault'?.85:1);u.hp*=h;u.maxHP*=h;u.unitHP*=h;}units.splice(units.length-1,0,...advanced);return units;
}
export function setDeck(s,patch){const deck={...s.deck,...patch};if(!Array.isArray(deck.units)||deck.units.length+(s.legion?.loadout.units.length||0)>3||new Set(deck.units).size!==deck.units.length||deck.units.some(id=>!UNITS[id]||!s.troops[id].count))return 'Choisissez au plus trois régiments déjà formés.';if(!Array.isArray(deck.spells)||deck.spells.length+(s.legion?.loadout.spells.length||0)>2||new Set(deck.spells).size!==deck.spells.length||deck.spells.some(id=>!s.knowledge[id]))return 'Choisissez au plus deux sorts appris.';if(!['balanced','assault','bulwark'].includes(deck.doctrine)||!['neran','tesk'].includes(deck.commander)||deck.commander==='tesk'&&!done(s,'fen'))return 'Commandement indisponible.';s.deck=copy(deck);s.revision++;return null;}
export function demobilize(s,id,count=4){if(!UNITS[id]||!integer(count,1,80)||s.troops[id].count<count)return 'Effectif insuffisant.';if(s.battle?.deck.units.includes(id)||s.jobs.some(j=>j.active&&j.target===id&&['recruit','train'].includes(j.kind)))return 'Terminez ou annulez le combat et les formations de ce régiment.';s.troops[id].count-=count;if(!s.troops[id].count)s.deck.units=s.deck.units.filter(k=>k!==id);note(s,`${count} ${UNITS[id].name.toLowerCase()} retournent à la réserve civile, sans remboursement des coûts de formation.`);s.revision++;return null;}
export function start(s,id,mode='progress'){if(!ZONES[id]||!visible(s,id))return 'Cette destination reste à découvrir.';if(s.battle)return 'Terminez ou interrompez le combat actuel avant de changer de destination.';if(mode==='progress'&&missingRequirements(s,id).length)return 'Préparation requise : '+missingRequirements(s,id).map(r=>r.label).join(' · ');if(!['progress','farm'].includes(mode))return 'Mode invalide.';if(mode==='farm'&&s.progress[id]===0)return 'Remportez un palier avant de l’exploiter.';if(mode==='progress'&&done(s,id))return 'Cette zone est déjà sécurisée : choisissez son exploitation.';s.selected=id;s.expedition={running:true,mode,zone:id,stage:mode==='progress'?s.progress[id]:Math.max(0,s.progress[id]-1),wait:0};s.revision++;return null;}
export function retreat(s){s.battle=null;s.nextOrder=null;s.expedition.running=false;note(s,'Expédition interrompue sans butin ; les effectifs sont récupérés.');s.revision++;}
function rewardZone(s,id){if(extended(id)){Saga.recordVictory(s,id,{stage:ZONES[id].stages-1,first:true});Legion.syncUnlocks(s,legionContext(s));return;}
if(id==='refuge'){s.groups.settlers.total+=18;introduce(s,'population');introduce(s,'army');introduce(s,'routes');}
 if(id==='quarry'){s.groups.orcs.total+=12;s.sites.mine=true;introduce(s,'site');}
 if(id==='fen'){s.groups.aquatic.total+=12;s.sites.fen=true;introduce(s,'site');}
 if(id==='forest')s.groups.settlers.total+=10;
 Saga.bootstrapSaga(s);if(id==='bastion')introduce(s,'completion');Legion.syncUnlocks(s,legionContext(s));
 note(s,`${ZONES[id].name} : ${ZONES[id].reward}.`);
}
function beginBattle(s){if(s.expedition.mode==='progress'){const missing=missingRequirements(s,s.expedition.zone);if(missing.length){s.expedition.running=false;note(s,'Préparation requise pour poursuivre : '+missing.map(r=>r.label).join(' · '));s.revision++;return;}}const ex=s.expedition,z=ZONES[ex.zone],factor=Math.pow(1.3,ex.stage),hp=z.hp*factor;const allies=army(s);s.battle={zone:ex.zone,stage:ex.stage,deck:copy(s.deck),allies,enemyHP:hp,enemyMax:hp,dps:z.dps*factor,elapsed:0,mana:5,cooldowns:{bolt:0,ward:0,silence:0},ward:0,cast:0,nextHeal:5,healed:0,interrupts:0,events:[],heroRank:s.physical,companions:[...s.legion.loadout.companions],advancedSpells:Legion.legionBonuses(s).spells};for(const sp of s.battle.advancedSpells)s.battle.cooldowns[sp.id]=0;}
function battleNote(b,text){b.events.unshift(text);b.events=b.events.slice(0,6);}
function endBattle(s,won){const b=s.battle,z=ZONES[b.zone],first=won&&b.stage===s.progress[b.zone];const rewards=won?lootFor(b.zone,b.stage):{bones:0,iron:0,herbs:0};
 for(const k in rewards)s.resources[k]=Math.min(1e9,s.resources[k]+rewards[k]);
 const reasons=won?['Effectifs récupérés pour le prochain combat.']:b.healed>0?['Le soigneur a restauré des PV. Étudiez Silence ou augmentez vos dégâts.']:['La formation a cédé. Formez davantage de soldats, renforcez-les ou changez votre doctrine.'];
 const r={won,zone:b.zone,stage:b.stage,time:b.elapsed,rewards,healed:b.healed,interrupts:b.interrupts,reasons,first};s.reports.unshift(r);s.reports=s.reports.slice(0,8);
 if(won){s.victories++;Legion.awardExperience(s.legion,first?20:2,{companions:b.companions||[]});if(first){s.progress[b.zone]++;if(done(s,b.zone))rewardZone(s,b.zone);}}
 else{s.defeats++;s.expedition.mode='farm';s.expedition.stage=Math.max(0,b.stage-1);note(s,`Défaite : loot au palier précédent de ${z.name}.`);if(b.stage===0){s.expedition.running=false;note(s,'Aucun palier inférieur conquis dans cette zone. Choisissez un autre site maîtrisé pour le loot.');}}
 if(won&&s.expedition.mode==='progress'){if(done(s,b.zone)){s.expedition.mode='farm';s.expedition.stage=z.stages-1;}else s.expedition.stage=s.progress[b.zone];}
 s.battle=null;s.expedition.wait=2;s.revision++;if(s.nextOrder){const next=s.nextOrder;s.nextOrder=null;const error=start(s,next.zone,next.mode);if(error)note(s,error);else note(s,`Nouvel objectif : ${ZONES[next.zone].name}.`);}
}
function fight(s,dt){const b=s.battle,z=ZONES[b.zone];b.elapsed+=dt;b.mana=Math.min(5,b.mana+.7*dt);b.ward=Math.max(0,b.ward-dt);for(const k in b.cooldowns)b.cooldowns[k]=Math.max(0,b.cooldowns[k]-dt);
 if(z.healing){if(b.cast>0){b.cast=Math.max(0,b.cast-dt);if(!b.cast){const heal=Math.min(z.healing,b.enemyMax-b.enemyHP);b.enemyHP+=heal;b.healed+=heal;b.nextHeal=7;battleNote(b,`Le soin restaure ${Math.round(heal)} PV.`);}}else{b.nextHeal-=dt;if(b.nextHeal<=0){b.cast=2;battleNote(b,'Le soigneur prépare une incantation.');}}}
 for(const id of b.deck.spells){const sp=SPELLS[id];if(b.cooldowns[id]>0||b.mana<sp.cost)continue;if(id==='silence'&&!b.cast)continue;if(id==='ward'&&(b.ward>0||b.allies.reduce((n,u)=>n+u.hp,0)/b.allies.reduce((n,u)=>n+u.maxHP,0)>.75))continue;b.mana-=sp.cost;b.cooldowns[id]=sp.cooldown;
  if(id==='bolt'){b.enemyHP-=48*(b.deck.commander==='neran'?1.25:1);battleNote(b,'Trait funèbre frappe.');}if(id==='ward'){b.ward=5;battleNote(b,'Rempart protège les lignes.');}if(id==='silence'){b.cast=0;b.nextHeal=7;b.interrupts++;battleNote(b,'Silence interrompt le soin.');}}
 for(const sp of b.advancedSpells||[]){if(b.cooldowns[sp.id]>0||b.mana<sp.mana)continue;if(sp.ward&&!sp.damage&&(b.ward>0||b.allies.reduce((v,u)=>v+u.hp,0)/b.allies.reduce((v,u)=>v+u.maxHP,0)>.75))continue;b.mana-=sp.mana;b.cooldowns[sp.id]=sp.cooldown;if(sp.damage)b.enemyHP-=sp.damage;if(sp.ward)b.ward=Math.max(b.ward,sp.ward);battleNote(b,sp.name+' se déclenche.');}
 b.enemyHP=Math.max(0,b.enemyHP-b.allies.reduce((n,u)=>n+u.count*u.attack,0)*dt);if(!b.enemyHP){endBattle(s,true);return;}
 let damage=b.dps*(.6+.4*b.enemyHP/b.enemyMax)*(b.ward>0?.6:1)*(b.deck.commander==='tesk'?.85:1)*dt;
 for(const u of b.allies){const take=Math.min(u.hp,damage);u.hp-=take;damage-=take;u.count=Math.ceil(u.hp/u.unitHP);if(damage<=0)break;}
 if(b.allies.every(u=>u.hp<=0)||b.elapsed>=100)endBattle(s,false);
}
export function tick(s,seconds,{combat=true}={}){if(!finite(seconds,0,86400*7))throw Error('Durée invalide.');if(s.tutorialPaused)return s;let left=seconds;const step=combat?.2:1;while(left>1e-7){const dt=Math.min(left,step);left-=dt;s.elapsed+=dt;const gains=income(s);for(const k in RESOURCES)s.resources[k]=Math.min(1e9,s.resources[k]+gains[k]*dt);processJobs(s,dt);Legion.tickLegion(s,dt);if(combat&&s.expedition.running){if(!s.battle){s.expedition.wait-=dt;if(s.expedition.wait<=0)beginBattle(s);}if(s.battle)fight(s,dt);}}return s;}
export function snapshot(s,now=Date.now()){const out=copy(s);out.savedAt=now;out.battle=null;out.expedition.running=false;out.expedition.wait=0;return out;}
export function restore(raw){if(!raw||raw.version!==VERSION)throw Error('Format de campagne non reconnu.');const s=fresh();s.saga=Saga.restoreSaga(raw.saga);
 for(const k of Object.keys(RESOURCES)){if(!finite(raw.resources?.[k])||!finite(raw.reserves?.[k],0,1e6))throw Error('Ressources invalides.');s.resources[k]=raw.resources[k];s.reserves[k]=raw.reserves[k];}
 for(const g in GROUPS){const group=raw.groups?.[g];if(!integer(group?.total,0,1000)||!integer(group?.tier,1,EXCEPTIONAL_TIER))throw Error('Population invalide.');s.groups[g]=copy(group);}
 for(const id in SITES){if(typeof raw.sites?.[id]!=='boolean'||!integer(raw.tools?.[id],0,5)||!integer(raw.study?.[id],0,3))throw Error('Site invalide.');s.sites[id]=raw.sites[id];s.tools[id]=raw.tools[id];s.study[id]=raw.study[id];let sum=0;for(const g in GROUPS){const n=raw.assignments?.[id]?.[g];if(!integer(n,0,SITES[id].slots))throw Error('Affectation invalide.');s.assignments[id][g]=n;sum+=n;}if(sum>SITES[id].slots||!s.sites[id]&&sum>0)throw Error('Capacité de site dépassée.');}
 for(const id in ZONES){const progress=raw.progress?.[id]??(Saga.TERRITORIES[id]?0:undefined);if(!integer(progress,0,ZONES[id].stages))throw Error('Progression invalide.');s.progress[id]=progress;}
 if(s.sites.mine!==done(s,'quarry')||s.sites.fen!==done(s,'fen'))throw Error('Sites incohérents avec la conquête.');
 for(const id in UNITS){if(!integer(raw.troops?.[id]?.count,0,80)||!integer(raw.troops?.[id]?.tier,1,EXCEPTIONAL_TIER)||raw.troops[id].count>0&&!unitAvailable(s,id))throw Error('Troupe invalide.');s.troops[id]=copy(raw.troops[id]);}
 for(const id in SPELLS){if(typeof raw.knowledge?.[id]!=='boolean'||raw.knowledge[id]&&!availableResearch(s,id)&&s.saga.ascensions===0)throw Error('Savoir invalide.');s.knowledge[id]=raw.knowledge[id];}
 for(const [key,max,min]of [['physical',12,1],['weapon',8,0],['armor',8,0]]){if(!integer(raw[key],min,max))throw Error('Amélioration invalide.');s[key]=raw[key];}
 const context={...Saga.sagaContext(s),completed:Object.keys(s.progress).filter(k=>done(s,k)),retainedSpells:s.saga.ascensions?(raw.legion?.knowledge||[]).filter(id=>Legion.ADVANCED_SPELLS[id]?.unlock.chapter<s.saga.chapter):[],retainedPassives:s.saga.ascensions?(raw.legion?.passives||[]).filter(id=>Legion.PASSIVES[id]?.unlock.chapter<s.saga.chapter):[]};s.legion=Legion.normalizeLegion(raw.legion,context);
 if(setDeck(s,raw.deck))throw Error('Armée invalide.');if(!integer(raw.nextJob,1,1e9)||!Array.isArray(raw.jobs)||raw.jobs.length>12)throw Error('Programmes invalides.');s.nextJob=raw.nextJob;const ids=new Set();
 // Rebuild executable specs from trusted definitions. Imported costs/labels are never authoritative.
 for(const old of raw.jobs){if(!integer(old.id,1,s.nextJob-1)||ids.has(old.id)||s.jobs.some(j=>j.kind===old.kind&&j.target===old.target)||typeof old.paused!=='boolean'||typeof old.active!=='boolean')throw Error('Programme invalide.');const rulesVersion=raw.balanceRevision===BALANCE_REVISION?(old.rulesVersion===1?1:BALANCE_REVISION):1;const spec=specification(s,old.kind,old.target,rulesVersion===1);if(!spec)throw Error('Prérequis de programme invalide.');const current=jobLevel(s,old.kind,old.target),max=old.kind==='recruit'?80:old.kind==='spell'?1:old.kind==='worker'||old.kind==='train'?(rulesVersion===1?4:trainingCeiling(s)):old.kind==='tools'?5:old.kind==='study'?3:old.kind==='physical'?12:8;if(!integer(old.goal,current+1,max)||old.kind==='recruit'&&(old.goal-current)%4!==0||!finite(old.progress,0,spec.duration)||!old.active&&old.progress!==0)throw Error('Progression de programme invalide.');ids.add(old.id);s.jobs.push({id:old.id,kind:old.kind,target:old.target,goal:old.goal,paused:old.paused,active:old.active,progress:old.progress,rulesVersion,spec:old.active?copy(spec):null,status:old.paused?'En pause':'Reprise'});}
 if(Relics.reservedRelics(s)+s.saga.relicsSpent>Relics.earnedRelics(s))throw Error('Fragments engagés plusieurs fois.');if(Object.values(s.troops).filter(t=>t.tier===11).length*3>s.saga.relicsSpent)throw Error('Maîtrise exceptionnelle sans trésor.');
 const families={formation:0,study:0,works:0};for(const j of s.jobs)if(j.active&&!j.paused)families[j.spec.family]++;if(families.formation>2||families.study>1||families.works>1)throw Error('Capacité de travail dépassée.');
 for(const g in GROUPS)if(free(s,g)<0)throw Error('Habitants engagés plusieurs fois.');
 s.helpSeen=Array.isArray(raw.helpSeen)?[...new Set(raw.helpSeen.filter(id=>id in HELP))]:[];s.helpQueue=Array.isArray(raw.helpQueue)?[...new Set(raw.helpQueue.filter(id=>id in HELP&&!s.helpSeen.includes(id)))]:[];
 s.elapsed=finite(raw.elapsed)?raw.elapsed:0;s.savedAt=finite(raw.savedAt,0,1e15)?raw.savedAt:Date.now();s.selected=ZONES[raw.selected]&&visible(s,raw.selected)?raw.selected:'refuge';
 const ex=raw.expedition;if(ex&&ZONES[ex.zone]&&visible(s,ex.zone)&&['progress','farm'].includes(ex.mode)&&integer(ex.stage,0,ZONES[ex.zone].stages-1)){if(ex.mode==='farm'&&ex.stage>=s.progress[ex.zone])throw Error('Palier de loot non maîtrisé.');s.expedition={zone:ex.zone,stage:ex.mode==='progress'?Math.min(s.progress[ex.zone],ZONES[ex.zone].stages-1):ex.stage,mode:ex.mode,running:false,wait:0};}
 for(const key of ['victories','defeats'])s[key]=integer(raw[key],0,1e9)?raw[key]:0;
 s.log=Array.isArray(raw.log)?raw.log.filter(l=>l&&typeof l.text==='string'&&l.text.length<=400&&finite(l.time)).slice(0,30).map(l=>({text:l.text,time:l.time})):[];
 s.reports=Array.isArray(raw.reports)?raw.reports.filter(r=>r&&ZONES[r.zone]&&integer(r.stage,0,ZONES[r.zone].stages-1)&&typeof r.won==='boolean'&&finite(r.time,0,101)&&finite(r.healed)&&integer(r.interrupts,0,1000)&&Object.keys(RESOURCES).every(k=>finite(r.rewards?.[k]))).slice(0,8).map(r=>({zone:r.zone,stage:r.stage,won:r.won,time:r.time,healed:r.healed,interrupts:r.interrupts,rewards:Object.fromEntries(Object.keys(RESOURCES).map(k=>[k,r.rewards[k]])),reasons:[r.won?'Effectifs récupérés après la victoire.':r.healed>0?'Le soutien ennemi a restauré des PV ; une interruption peut aider.':'Renforcez ou adaptez votre formation avant de réessayer.'],first:false})):[];
 s.prologueRead=raw.prologueRead===true;s.balanceRevision=BALANCE_REVISION;
 s.guide={enabled:raw.guide?.enabled!==false,seen:Array.isArray(raw.guide?.seen)?[...new Set(raw.guide.seen.filter(id=>GUIDE_IDS.includes(id)))]:[]};s.tutorialPaused=raw.tutorialPaused===true;
 s.nextOrder=null;if(raw.nextOrder&&ZONES[raw.nextOrder.zone]&&visible(s,raw.nextOrder.zone)&&['progress','farm'].includes(raw.nextOrder.mode)){start(s,raw.nextOrder.zone,raw.nextOrder.mode);s.expedition.running=false;}
 Saga.bootstrapSaga(s);Legion.syncUnlocks(s,legionContext(s));s.revision=0;return s;
}
export function applyOffline(s,now=Date.now()){if(!finite(now,0,1e15))throw Error('Date invalide.');const absence=(now-s.savedAt)/1000,seconds=s.tutorialPaused?0:Math.max(0,Math.min(86400*7,absence)),before=copy(s.resources),troops=copy(s.troops),knowledge=copy(s.knowledge),previousLegion=copy(s.legion),jobs=s.jobs.length;tick(s,seconds,{combat:false});s.savedAt=Math.max(s.savedAt,now);s.expedition.running=false;s.battle=null;return {seconds,paused:!!s.tutorialPaused,limited:absence>86400*7,gains:Object.fromEntries(Object.keys(RESOURCES).map(k=>[k,s.resources[k]-before[k]])),trained:Object.keys(UNITS).reduce((n,k)=>n+s.troops[k].count-troops[k].count,0)+Object.keys(Legion.LEGION_UNITS).reduce((sum,k)=>sum+s.legion.units[k].count-previousLegion.units[k].count,0),learned:Object.keys(SPELLS).filter(k=>s.knowledge[k]&&!knowledge[k]).concat(s.legion.knowledge.filter(k=>!previousLegion.knowledge.includes(k))),completed:Math.max(0,jobs-s.jobs.length)+Math.max(0,previousLegion.jobs.length-s.legion.jobs.length)};}

export function ascend(s){const next=Saga.ascendSaga(s,()=>fresh());next.legion=JSON.parse(JSON.stringify(s.legion));Legion.ascendLegion(next,Saga.sagaContext(next));next.prologueRead=true;next.guide={enabled:false,seen:[]};return next;}

export function legionContext(s){return {...Saga.sagaContext(s),completed:Object.keys(s.progress).filter(k=>done(s,k)),retainedSpells:s.saga.ascensions?s.legion.knowledge.filter(id=>Legion.ADVANCED_SPELLS[id]?.unlock.chapter<s.saga.chapter):[],retainedPassives:s.saga.ascensions?s.legion.passives.filter(id=>Legion.PASSIVES[id]?.unlock.chapter<s.saga.chapter):[]};}
