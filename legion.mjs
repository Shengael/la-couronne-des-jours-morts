/** Independent Legion progression; never imports campaign or browser code.
 * campaign.legion = normalizeLegion(saved, context), context={chapter,completed,events}.
 * syncUnlocks(legion,context) derives access from conquered zones (not saved flags).
 * trainLegion(campaign,kind,id,goal?) queues a target; tickLegion(campaign,seconds)
 * pays proportional costs respecting resources/reserves; two formation/one study/one works.
 * legionQuote, legionLevel, setLegionLoadout, pauseLegionJob, cancelLegionJob provide UI data.
 * awardExperience(legion,amount,{companions}) grants total XP; levels are derived.
 * legionArmy(campaign) returns battle snapshots; legionBonuses(campaign) returns modifiers.
 * ascendLegion(campaign,context) keeps knowledge/XP, rebuilds people and equipment.
 */
export const LEGION_VERSION=1;
export const LEGION_TIER_CAPS=[3,5,7,10];
const MAX=1e9,clone=x=>JSON.parse(JSON.stringify(x));
const num=(n,min=0,max=MAX)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const int=(n,min=0,max=MAX)=>Number.isSafeInteger(n)&&num(n,min,max);
const gate=(chapter,zones,event)=>({chapter,zones,event});
export const COMPANIONS={
 tesk:{name:'Tesk',role:'Gardien des eaux',unlock:gate(1,['fen'],'eaux-partagees'),attack:.02,health:.12},
 rovek:{name:'Rovek',role:'Forge et siège',unlock:gate(1,['quarry'],'plans-rovek'),attack:.12,health:.02},
 maera:{name:'Maëra',role:'Pacte cramoisi',unlock:gate(2,['c2_maera','c4_val'],'maera-sauvee'),attack:.12,health:.04},
 kesh:{name:'Kesh',role:'Reconnaissance aérienne',unlock:gate(2,['c2_falaises','c4_aires'],'operations-ciblees'),attack:.1,health:.03},
 iria:{name:'Iria',role:'Protection des vivants',unlock:gate(2,['c2_hospice','c3_hospices'],'patients-proteges'),attack:.02,health:.14},
 vaul:{name:'Vaul',role:'Émissaire des Cimes',unlock:gate(3,['c3_cimes','c4_ancrages'],'histoire-phares'),attack:.14,health:.12}
};
export const LEGION_UNITS={
 vampires:{name:'Lames du Pacte',icon:'◊',role:'Assaut',unlock:gate(2,['c2_pacte','c4_val'],'pacte-cramoisi'),hp:44,attack:5.6,batch:4,cap:80,cost:{bones:50,iron:12,herbs:16},duration:32},
 harpies:{name:'Harpies des Falaises',icon:'⋀',role:'Ciblage',unlock:gate(2,['c2_aire','c4_aires'],'operations-ciblees'),hp:26,attack:6.4,batch:4,cap:80,cost:{bones:42,iron:9,herbs:18},duration:30},
 dragons:{name:'Gardiens draconiques',icon:'♨',role:'Intervention lourde',unlock:gate(3,['c3_sanctuaire','c4_ancrages'],'pacte-draconique'),hp:360,attack:38,batch:1,cap:3,cost:{bones:400,iron:220,herbs:180},duration:120}
};
export const ADVANCED_SPELLS={
 blood:{name:'Sceau cramoisi',description:'Inflige 100 dégâts pour 3 mana, avec 10 secondes de recharge.',unlock:gate(2,['c2_pacte','c4_val'],'pacte-cramoisi'),cost:{bones:90,herbs:70},duration:70,mana:3,cooldown:10,damage:100},
 gale:{name:'Lames du vent',description:'Inflige 72 dégâts pour 2 mana, avec 8 secondes de recharge.',unlock:gate(2,['c2_aire','c4_aires'],'operations-ciblees'),cost:{bones:80,herbs:50},duration:65,mana:2,cooldown:8,damage:72},
 dawn:{name:'Aube libre',description:'Réduit de 40 % les dégâts subis pendant 7 secondes pour 4 mana, sous 75 % de PV ; recharge de 16 secondes.',unlock:gate(2,['c2_hospice','c3_hospices'],'patients-proteges'),cost:{iron:60,herbs:110},duration:90,mana:4,cooldown:16,ward:7},
 flame:{name:'Flamme des anciens',description:'Inflige 250 dégâts pour 5 mana, avec 18 secondes de recharge.',unlock:gate(3,['c3_cimes','c4_ancrages'],'histoire-phares'),cost:{bones:210,iron:130,herbs:150},duration:120,mana:5,cooldown:18,damage:250},
 concord:{name:'Ancrage partagé',description:'Inflige 190 dégâts et protège les lignes pendant 3 secondes pour 4 mana ; recharge de 14 secondes.',unlock:gate(4,['c4_ancrages'],'ancrages-connectes'),cost:{bones:400,iron:240,herbs:280},duration:180,mana:4,cooldown:14,damage:190,ward:3}
};
export const PASSIVES={
 bulwark:{name:'Mémoire des crues',description:'+15 % PV de l’armée.',unlock:COMPANIONS.tesk.unlock,cost:{bones:45,herbs:25},duration:40,health:.15},
 siege:{name:'Plans des Marches',description:'+15 % dégâts de l’armée.',unlock:COMPANIONS.rovek.unlock,cost:{bones:50,iron:30},duration:45,attack:.15},
 covenant:{name:'Subsistance négociée',description:'+10 % PV et dégâts.',unlock:LEGION_UNITS.vampires.unlock,cost:{bones:80,herbs:75},duration:65,attack:.1,health:.1},
 wings:{name:'Routes aériennes',description:'+18 % dégâts ; doctrine de reconnaissance.',unlock:COMPANIONS.kesh.unlock,cost:{iron:55,herbs:65},duration:60,attack:.18},
 freeDawn:{name:'Protection distribuée',description:'+25 % PV.',unlock:gate(3,['c3_cimes','c4_ancrages'],'histoire-phares'),cost:{iron:100,herbs:150},duration:100,health:.25}
};
export const ARTIFACTS={
 river:{name:'Pierre des eaux rendues',slot:'relic',unlock:COMPANIONS.tesk.unlock,health:.12},
 chains:{name:'Maillon rompu',slot:'weapon',unlock:COMPANIONS.rovek.unlock,attack:.12},
 chalice:{name:'Calice du Pacte',slot:'relic',unlock:LEGION_UNITS.vampires.unlock,attack:.1,health:.08},
 feather:{name:'Plume des Exilées',slot:'weapon',unlock:COMPANIONS.kesh.unlock,attack:.18},
 ember:{name:'Braise des premiers feux',slot:'relic',unlock:gate(3,['c3_sanctuaire','c4_ancrages'],'pacte-draconique'),attack:.2,health:.15},
 crown:{name:'Couronne des accords',slot:'relic',unlock:gate(4,['c4_ancrages'],'ancrages-connectes'),attack:.25,health:.25}
};
function ids(value){return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x.length<80))].slice(0,100):[];}
function contextOf(value={}){return {chapter:int(value.chapter,1,4)?value.chapter:1,completed:ids(value.completed),events:ids(value.events),retainedSpells:ids(value.retainedSpells),retainedPassives:ids(value.retainedPassives)};}
function accessible(rule,c){if(c.chapter<rule.chapter)return false;if(rule.zones.some(id=>c.completed.includes(id)))return true;const entry=c.chapter===3?'c3_veyre':c.chapter===4?'c4_accueil':null;return c.events.includes(rule.event)&&(c.chapter===rule.chapter||entry!==null&&c.completed.includes(entry));}
export function freshLegion(){return {version:LEGION_VERSION,context:contextOf(),heroXP:0,companions:Object.fromEntries(Object.keys(COMPANIONS).map(id=>[id,{xp:0,training:0}])),units:Object.fromEntries(Object.keys(LEGION_UNITS).map(id=>[id,{count:0,tier:1}])),knowledge:[],passives:[],equipment:{weapon:0,armor:0},loadout:{units:[],companions:[],spells:[],passives:[],artifacts:[]},jobs:[],nextJob:1};}
export function levelFromXP(xp){let level=1,left=num(xp)?xp:0;while(level<100&&left>=50*level*level){left-=50*level*level;level++;}return level;}
export function syncUnlocks(state,context){const legion=state.legion||state;legion.context=contextOf(context);return legion;}
export function unlocked(state,kind,id){const table={companion:COMPANIONS,unit:LEGION_UNITS,spell:ADVANCED_SPELLS,passive:PASSIVES,artifact:ARTIFACTS}[kind];return !!table&&Object.hasOwn(table,id)&&accessible(table[id].unlock,state.context);}
export function legionLevel(campaign,kind,id){const l=campaign.legion;if(kind==='recruit')return l.units[id]?.count;if(kind==='train')return l.units[id]?.tier;if(kind==='companion')return l.companions[id]?.training;if(kind==='spell')return l.knowledge.includes(id)?1:0;if(kind==='passive')return l.passives.includes(id)?1:0;if(kind==='equipment')return l.equipment[id];return undefined;}
function baseLegionQuote(campaign,kind,id){const l=campaign.legion,n=legionLevel(campaign,kind,id),ceiling=LEGION_TIER_CAPS[l.context.chapter-1];if(n===undefined)return null;
 if(kind==='recruit'&&unlocked(l,'unit',id)&&n<LEGION_UNITS[id].cap){const u=LEGION_UNITS[id];return {family:'formation',label:`Former ${Math.min(u.batch,u.cap-n)} ${u.name}`,duration:u.duration,cost:clone(u.cost),gain:Math.min(u.batch,u.cap-n),max:u.cap};}
 if(kind==='train'&&unlocked(l,'unit',id)&&l.units[id].count>0&&n<ceiling)return {family:'formation',label:`${LEGION_UNITS[id].name} T${n+1}`,duration:25+15*n,cost:{bones:25*n*n,iron:12*n*n,herbs:8*n},gain:1,max:ceiling};
 if(kind==='companion'&&unlocked(l,'companion',id)&&n<ceiling)return {family:'formation',label:`Entraîner ${COMPANIONS[id].name}`,duration:30+20*n,cost:{bones:35*(n+1)**2,iron:15*(n+1),herbs:12*(n+1)},gain:1,max:ceiling};
 const table=kind==='spell'?ADVANCED_SPELLS:kind==='passive'?PASSIVES:null;
 if(table?.[id]&&unlocked(l,kind,id)&&n===0)return {family:'study',label:`Étudier ${table[id].name}`,duration:table[id].duration,cost:clone(table[id].cost),gain:1,max:1};
 if(kind==='equipment'&&['weapon','armor'].includes(id)&&l.context.completed.length&&n<ceiling)return {family:'works',label:`${id==='weapon'?'Arme':'Armure'} de Néran ${n+1}`,duration:30+15*n,cost:{bones:20*(n+1),iron:25*(n+1)**2},gain:1,max:ceiling};
 return null;
}
export function legionQuote(campaign,kind,id){const q=baseLegionQuote(campaign,kind,id);return q?{...q,duration:q.duration/(1+.35*(campaign.saga?.ascensions||0))}:null;}
export function trainLegion(campaign,kind,id,goal){const l=campaign.legion,q=legionQuote(campaign,kind,id),current=legionLevel(campaign,kind,id);if(!q)return 'Développement indisponible ou plafond atteint.';if(l.jobs.length>=12||l.jobs.some(j=>j.kind===kind&&j.target===id))return 'Un programme existe déjà ou la file est pleine.';goal=goal??Math.min(q.max,current+q.gain);if(!int(goal,current+1,q.max)||kind==='recruit'&&(goal-current)%q.gain!==0)return 'Cible invalide.';l.jobs.push({id:l.nextJob++,kind,target:id,goal,progress:0,paused:false,status:'En attente'});return null;}
export function pauseLegionJob(campaign,id,paused=true){const job=campaign.legion.jobs.find(j=>j.id===id);if(!job||typeof paused!=='boolean')return false;job.paused=paused;job.status=paused?'En pause':'En attente';return true;}
export function cancelLegionJob(campaign,id){const l=campaign.legion,index=l.jobs.findIndex(j=>j.id===id);if(index<0)return false;l.jobs.splice(index,1);return true;}
function complete(l,job,q){if(job.kind==='recruit')l.units[job.target].count+=q.gain;else if(job.kind==='train')l.units[job.target].tier++;else if(job.kind==='companion')l.companions[job.target].training++;else if(job.kind==='equipment')l.equipment[job.target]++;else if(job.kind==='spell')l.knowledge.push(job.target);else if(job.kind==='passive')l.passives.push(job.target);job.progress=0;}
export function tickLegion(campaign,seconds){if(!num(seconds,0,604800))throw Error('Durée de Légion invalide.');if(campaign.tutorialPaused||!campaign.legion.jobs.length)return campaign.legion;let remaining=seconds;
 while(remaining>1e-8&&campaign.legion.jobs.length){const dt=Math.min(1,remaining);remaining-=dt;const slots={formation:2,study:1,works:1};for(const base of campaign.jobs||[])if(base.active&&!base.paused&&slots[base.spec?.family]!==undefined)slots[base.spec.family]=Math.max(0,slots[base.spec.family]-1);for(const job of [...campaign.legion.jobs]){if(job.paused)continue;let q=legionQuote(campaign,job.kind,job.target);if(!q||legionLevel(campaign,job.kind,job.target)>=job.goal){cancelLegionJob(campaign,job.id);continue;}if(job.kind==='train'&&campaign.battle?.allies?.some(u=>u.id===job.target)){job.status='Fin du combat en attente';continue;}if(!slots[q.family]){job.status='En attente';continue;}slots[q.family]--;let work=Math.min(dt,q.duration-job.progress);for(const [r,cost]of Object.entries(q.cost)){const stock=campaign.resources?.[r],reserve=campaign.reserves?.[r]??0;if(!num(stock)||!num(reserve)){work=0;break;}if(cost>0)work=Math.min(work,Math.max(0,stock-reserve)*q.duration/cost);}if(work<=1e-9){job.status='Ressources insuffisantes';continue;}for(const [r,cost]of Object.entries(q.cost))campaign.resources[r]=Math.max(campaign.reserves?.[r]??0,campaign.resources[r]-cost*work/q.duration);job.progress+=work;job.status='En cours';if(job.progress+1e-7>=q.duration){complete(campaign.legion,job,q);if(legionLevel(campaign,job.kind,job.target)>=job.goal)cancelLegionJob(campaign,job.id);}}}
 return campaign.legion;
}
export function awardExperience(state,amount,{companions=state.loadout.companions}={}){if(!num(amount,0,1e6))throw Error('Expérience invalide.');state.heroXP=Math.min(MAX,state.heroXP+amount);for(const id of ids(companions===true?state.loadout.companions:companions))if(unlocked(state,'companion',id))state.companions[id].xp=Math.min(MAX,state.companions[id].xp+amount);return levelFromXP(state.heroXP);}
export function setLegionLoadout(campaign,patch){const l=campaign.legion,next={...clone(l.loadout),...patch};if((campaign.deck?.units?.length||0)+(next.units?.length||0)>3||(campaign.deck?.spells?.length||0)+(next.spells?.length||0)>2)return 'Capacité totale du deck dépassée.';const checks={units:[3,id=>LEGION_UNITS[id]&&l.units[id].count>0&&unlocked(l,'unit',id)],companions:[2,id=>unlocked(l,'companion',id)],spells:[2,id=>l.knowledge.includes(id)],passives:[l.context.chapter>=3?2:1,id=>l.passives.includes(id)],artifacts:[2,id=>unlocked(l,'artifact',id)]};for(const [key,[cap,test]]of Object.entries(checks)){if(!Array.isArray(next[key])||next[key].length>cap||new Set(next[key]).size!==next[key].length||next[key].some(id=>typeof id!=='string'||!test(id)))return 'Composition de Légion invalide.';}if(new Set(next.artifacts.map(id=>ARTIFACTS[id].slot)).size!==next.artifacts.length)return 'Un seul artefact par emplacement.';l.loadout=Object.fromEntries(Object.keys(checks).map(k=>[k,next[k]]));return null;}
export function legionBonuses(campaign){const l=campaign.legion;let attack=1,health=1;for(const id of l.loadout.companions){if(!unlocked(l,'companion',id))continue;const c=COMPANIONS[id],scale=1+.04*(levelFromXP(l.companions[id].xp)-1)+.05*l.companions[id].training;attack+=c.attack*scale;health+=c.health*scale;}for(const id of l.loadout.passives){if(l.passives.includes(id)){attack+=PASSIVES[id].attack||0;health+=PASSIVES[id].health||0;}}for(const id of l.loadout.artifacts)if(unlocked(l,'artifact',id)){attack+=ARTIFACTS[id].attack||0;health+=ARTIFACTS[id].health||0;}return {attack,health,heroAttack:1+.04*(levelFromXP(l.heroXP)-1)+.12*l.equipment.weapon,heroHealth:1+.06*(levelFromXP(l.heroXP)-1)+.12*l.equipment.armor,spells:l.loadout.spells.filter(id=>l.knowledge.includes(id)).map(id=>({id,...clone(ADVANCED_SPELLS[id])}))};}
export function legionArmy(campaign){const l=campaign.legion;return l.loadout.units.filter(id=>unlocked(l,'unit',id)&&l.units[id].count>0&&!l.jobs.some(j=>j.kind==='train'&&j.target===id&&j.progress>0)).map(id=>{const u=LEGION_UNITS[id],t=l.units[id],scale=1+.35*(t.tier-1),unitHP=u.hp*scale,hp=unitHP*t.count;return {id,name:u.name,icon:u.icon,count:t.count,initial:t.count,hp,maxHP:hp,unitHP,attack:u.attack*scale};});}
export function normalizeLegion(raw,context={}){const l=freshLegion();l.context=contextOf(context);if(!raw)return l;if(raw.version!==LEGION_VERSION)throw Error('Format de Légion inconnu.');if(!num(raw.heroXP))throw Error('Expérience invalide.');l.heroXP=raw.heroXP;const ceiling=LEGION_TIER_CAPS[l.context.chapter-1];
 for(const id in COMPANIONS){const c=raw.companions?.[id];if(!num(c?.xp)||!int(c.training,0,ceiling))throw Error('Compagnon invalide.');if((c.xp||c.training)&&!unlocked(l,'companion',id))throw Error('Compagnon non rencontré.');l.companions[id]={xp:c.xp,training:c.training};}
 for(const id in LEGION_UNITS){const u=raw.units?.[id];if(!int(u?.count,0,LEGION_UNITS[id].cap)||!int(u.tier,1,ceiling)||(u.count||u.tier>1)&&!unlocked(l,'unit',id))throw Error('Régiment de Légion invalide.');l.units[id]={count:u.count,tier:u.tier};}
 for(const [key,table,retained]of [['knowledge',ADVANCED_SPELLS,l.context.retainedSpells],['passives',PASSIVES,l.context.retainedPassives]]){if(!Array.isArray(raw[key])||raw[key].length>Object.keys(table).length||new Set(raw[key]).size!==raw[key].length||raw[key].some(id=>!Object.hasOwn(table,id)||!accessible(table[id].unlock,l.context)&&!retained.includes(id)))throw Error('Savoir de Légion invalide.');l[key]=raw[key].slice();}
 for(const id of ['weapon','armor']){if(!int(raw.equipment?.[id],0,ceiling)||raw.equipment[id]>0&&!l.context.completed.length)throw Error('Équipement invalide.');l.equipment[id]=raw.equipment[id];}
 const holder={legion:l,saga:{ascensions:l.context.chapter-1}};if(setLegionLoadout(holder,raw.loadout||{}))throw Error('Deck de Légion invalide.');if(!int(raw.nextJob,1,1e9)||!Array.isArray(raw.jobs)||raw.jobs.length>12)throw Error('Programmes de Légion invalides.');l.nextJob=raw.nextJob;const seen=new Set();for(const job of raw.jobs){if(!job||!int(job.id,1,l.nextJob-1)||seen.has(job.id)||typeof job.paused!=='boolean')throw Error('Programme de Légion invalide.');const q=legionQuote(holder,job.kind,job.target);if(!q||!num(job.progress,0,q.duration)||job.progress>=q.duration)throw Error('Progression de Légion invalide.');if(trainLegion(holder,job.kind,job.target,job.goal))throw Error('Cible de Légion invalide.');const added=l.jobs.at(-1);added.id=job.id;added.progress=job.progress;added.paused=job.paused;added.status=job.paused?'En pause':job.progress>0?'En cours':'En attente';seen.add(job.id);}l.nextJob=raw.nextJob;return l;
}
export function ascendLegion(campaign,context={}){const old=campaign.legion,l=freshLegion();l.knowledge=old.knowledge.slice();l.passives=old.passives.slice();l.context=contextOf({...context,retainedSpells:l.knowledge,retainedPassives:l.passives});l.loadout.spells=old.loadout.spells.slice();l.loadout.passives=old.loadout.passives.slice(0,l.context.chapter>=3?2:1);campaign.legion=l;return l;}

export function legionGoalQuote(campaign,kind,id,goal){
 const preview=clone(campaign),cost={bones:0,iron:0,herbs:0};let duration=0,steps=0;
 if(!int(goal,1,1000))return null;
 while(legionLevel(preview,kind,id)<goal){const q=legionQuote(preview,kind,id);if(!q||legionLevel(preview,kind,id)+q.gain>goal)return null;
  duration+=q.duration;steps++;for(const [k,v]of Object.entries(q.cost))cost[k]+=v;
  complete(preview.legion,{kind,target:id},q);
 }
 return steps?{duration,cost,steps}:null;
}
