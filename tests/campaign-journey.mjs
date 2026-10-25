// Two explicitly different checks: real economic opening, and a powered structural campaign.
import * as C from '../campaign.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
function acknowledge(s){s.prologueRead=true;s.tutorialPaused=false;s.guide.enabled=false;while(s.helpQueue.length)C.dismissHelp(s);while(C.Saga.sagaScene(s))C.Saga.acknowledgeScene(s);}
function roundTrip(s){const raw=C.snapshot(s,1_800_000_000_000);const loaded=C.restore(JSON.parse(JSON.stringify(raw)));if(JSON.stringify(loaded.progress)!==JSON.stringify(s.progress))throw Error('Progression changed during save/restore');if(JSON.stringify(loaded.resources)!==JSON.stringify(s.resources))throw Error('Stocks changed during save/restore');if(loaded.saga.chapter!==s.saga.chapter)throw Error('Chapter changed during save/restore');return loaded;}
function row(s,id,started,losses){return {chapter:s.saga.chapter,zone:id,elapsedSeconds:Number((s.elapsed-started).toFixed(2)),runElapsedSeconds:Number(s.elapsed.toFixed(2)),victories:s.victories,defeats:s.defeats,fallenObserved:losses,stocks:{...s.resources},saveRestore:true};}
function watchStep(s,dt,stats){const before=s.battle;C.tick(s,dt);stats.seconds+=dt;if(before&&s.battle!==before)stats.fallen+=before.allies.reduce((n,u)=>n+Math.max(0,u.initial-u.count),0);}
function chooseBasicDeck(s){const units=Object.keys(C.UNITS).filter(id=>C.unitAvailable(s,id)&&s.troops[id].count>0);const spells=['ward',s.knowledge.silence?'silence':'bolt'].filter(id=>s.knowledge[id]);const error=C.setDeck(s,{units,spells,commander:'neran',doctrine:'balanced'});if(error)throw Error(error);}
function powerFixture(s){
 // Explicit fixture: no progress or territory flags are written. This does NOT measure economic balance.
 for(const resource of Object.keys(C.RESOURCES))s.resources[resource]=1e6;
 for(const group of Object.values(s.groups))group.total=900;
 s.physical=12;s.weapon=8;s.armor=8;s.legion.heroXP=1e9;
 for(const id of Object.keys(C.SITES))if(s.sites[id])s.tools[id]=5;
 for(const id of Object.keys(C.UNITS))if(C.unitAvailable(s,id)){s.troops[id].count=80;s.troops[id].tier=Math.min(10,C.trainingCeiling(s));}
 for(const id of Object.keys(C.SPELLS))if(C.availableResearch(s,id))s.knowledge[id]=true;
 chooseBasicDeck(s);
}
export function runStructuralJourney({alternate=false}={}){
 let s=C.fresh(1_800_000_000_000);const stats={seconds:0,fallen:0},zones=[],ascensions=[];acknowledge(s);
 for(let chapter=1;chapter<=4;chapter++){
  const pending=Object.values(C.Saga.TERRITORIES).filter(z=>z.chapter===chapter).map(z=>z.id);
  while(pending.length){
   powerFixture(s);acknowledge(s);
   const available=pending.filter(id=>C.visible(s,id)&&C.missingRequirements(s,id).length===0);
   if(!available.length)throw Error('No route available in chapter '+chapter+': '+pending.join(','));
   const id=alternate?available.at(-1):available[0],started=s.elapsed,beforeFallen=stats.fallen;
   const error=C.start(s,id);if(error)throw Error(id+': '+error);
   let iterations=0;while(!C.done(s,id)&&iterations++<15000){watchStep(s,.2,stats);if(!s.expedition.running&&!C.done(s,id))throw Error('Structural expedition stopped at '+id);}
   if(!C.done(s,id))throw Error('Structural battle limit at '+id);
   s.expedition.running=false;s.battle=null;acknowledge(s);s=roundTrip(s);
   zones.push(row(s,id,started,stats.fallen-beforeFallen));pending.splice(pending.indexOf(id),1);
  }
  if(chapter<4){if(!C.Saga.canAscend(s))throw Error('Missing ascension '+chapter);const known=JSON.stringify(s.knowledge);s=C.ascend(s);s=roundTrip(s);if(s.physical!==1||s.weapon!==0||s.armor!==0||Object.values(s.troops).some(t=>t.count)||s.jobs.length||JSON.stringify(s.knowledge)!==known)throw Error('Ascension failed to reset material or preserve knowledge');ascensions.push({from:chapter,to:s.saga.chapter,stocks:{...s.resources},forces:Object.fromEntries(Object.entries(s.troops).map(([id,t])=>[id,t.count]))});}
 }
 const error=C.Saga.finishSaga(s,alternate?'withdrawal':'concord');if(error)throw Error(error);s=roundTrip(s);
 return {mode:'structural-powered-fixture',claim:'Checks route reachability, real battles, three resets, save/restore and conclusion. Does not validate costs, population or pacing.',fixture:{stocks:1e6,populationPerGroup:900,ordinaryForces:80,tiers:'current chapter ceiling',heroBody:12,weapon:8,armor:8,heroXP:1e9,progressInjected:false},completed:s.saga.ended,chapters:4,ascensionCount:ascensions.length,simulatedSeconds:Number(stats.seconds.toFixed(2)),fallenObserved:stats.fallen,zones,ascensions,endingChoice:s.saga.ending.choice,limits:['Material power is injected before each territory.','Casualties counted from observed battle snapshots; formations are restored by the engine after a fight.','One route order does not establish all builds or all economic strategies.']};
}
function queue(s,kind,target,goal){if(C.jobLevel(s,kind,target)>=goal||s.jobs.some(j=>j.kind===kind&&j.target===target))return;const spec=C.specification(s,kind,target);if(spec)C.addJob(s,kind,target,goal);}
function economicPrepare(s){
 if(!C.opened(s))return;
 queue(s,'recruit','guards',C.done(s,'forest')?24:12);
 for(const id of ['bolt','ward','silence'])if(C.availableResearch(s,id))queue(s,'spell',id,1);
 if(s.sites.mine){const workers=s.assignments.mine.orcs;if(workers<8){const amount=Math.min(8-workers,C.free(s,'orcs'));if(amount>0)C.assign(s,'mine','orcs',amount);}queue(s,'tools','mine',1);queue(s,'weapon',null,C.done(s,'fonderie')?3:2);queue(s,'armor',null,C.done(s,'fonderie')?3:2);queue(s,'physical',null,C.done(s,'fonderie')?5:3);}
 if(s.sites.fen){const workers=s.assignments.fen.aquatic;if(workers<4){const amount=Math.min(4-workers,C.free(s,'aquatic'));if(amount>0)C.assign(s,'fen','aquatic',amount);}queue(s,'recruit','lancers',8);}
 if(C.done(s,'archive'))queue(s,'train','guards',Math.min(3,C.trainingCeiling(s)));
 if(C.done(s,'fonderie')&&s.troops.lancers.count)queue(s,'train','lancers',3);
 chooseBasicDeck(s);
}
export function runEconomicOpening({maxSeconds=14400,includeState=false}={}){
 let s=C.fresh(1_800_000_000_000);const stats={seconds:0,fallen:0},zones=[],orders=['refuge','quarry','archive','fen','convoi','forest','ecloserie','fonderie','bastion','phare'];acknowledge(s);let blocked=null;
 for(const id of orders){const began=s.elapsed,beforeFallen=stats.fallen;let attempts=0;
  while(!C.done(s,id)&&stats.seconds<maxSeconds){
   acknowledge(s);economicPrepare(s);
   if(!s.expedition.running&&!s.battle){const missing=C.missingRequirements(s,id);if(!missing.length&&C.visible(s,id)){const error=C.start(s,id);if(!error)attempts++;else blocked=error;}else blocked=missing.map(r=>r.key).join(',');}
   // Recover deliberately after defeat; the engine's farm fallback remains a genuine source of income.
   if(s.expedition.running&&s.expedition.mode==='farm'&&!s.battle&&s.expedition.zone===id){s.expedition.running=false;}
   watchStep(s,s.expedition.running?.2:1,stats);
   if(attempts>100){blocked='More than 100 expedition starts with this economic policy';break;}
  }
  if(!C.done(s,id)){blocked=blocked||'Time budget exhausted';break;}
  s.expedition.running=false;s.battle=null;acknowledge(s);
  try{s=roundTrip(s);}catch(error){throw Error('Economic save after '+id+': '+error.message);}
  zones.push(row(s,id,began,stats.fallen-beforeFallen));
 }
 return {mode:'economic-opening-no-injection',claim:'All stocks, recruitment, equipment and qualifications come from actual income, loot and paid jobs. Tests one explicit first-chapter policy.',resourceInjection:false,progressInjected:false,completed:orders.every(id=>C.done(s,id)),simulatedSeconds:Number(stats.seconds.toFixed(2)),defeats:s.defeats,fallenObserved:stats.fallen,zones,blocked:orders.every(id=>C.done(s,id))?null:{zone:orders.find(id=>!C.done(s,id)),reason:blocked,jobs:s.jobs.map(j=>({kind:j.kind,target:j.target,status:j.status})),income:C.income(s),stocks:{...s.resources},missing:C.missingRequirements(s,orders.find(id=>!C.done(s,id)))},limits:['Only the first chapter is economically exercised.','This deterministic policy is not an optimal player and can expose a policy deadlock rather than an impossible game.','No assertion of whole-campaign pacing follows from the powered structural run.'],...(includeState?{state:s}:{})};
}
function legionQueue(s,kind,id,goal){const L=C.Legion,current=L.legionLevel(s,kind,id);if(current===undefined||current>=goal||s.legion.jobs.some(j=>j.kind===kind&&j.target===id)||!L.legionQuote(s,kind,id))return;L.trainLegion(s,kind,id,goal);}
function prepareLaterEconomy(s,target){
 const chapter=s.saga.chapter,z=C.Saga.TERRITORIES[target];
 const military=Math.min(C.trainingCeiling(s),chapter+Math.ceil(z.position/3)+(z.kind==='boss'?3:0));
 if(C.opened(s)){
  const targets={guards:Math.min(24,Math.floor(s.groups.settlers.total/4)*4),raiders:Math.min(12,Math.floor(Math.max(0,s.groups.orcs.total-8)/4)*4),lancers:Math.min(8,Math.floor(s.groups.aquatic.total/4)*4)};
  for(const [site,group,desired]of [['mine','orcs',Math.min(8,s.groups.orcs.total-targets.raiders)],['fen','aquatic',Math.min(4,s.groups.aquatic.total-targets.lancers)]])if(s.sites[site]){const current=s.assignments[site][group];if(current>desired)C.assign(s,site,group,desired-current);else if(current<desired){const amount=Math.min(desired-current,C.free(s,group));if(amount>0)C.assign(s,site,group,amount);}}
  for(const [id,count]of Object.entries(targets))if(count>0)queue(s,'recruit',id,count);
  // Train only one step at a time so each improvement can immediately improve farming.
  for(const id of Object.keys(C.UNITS))if(s.troops[id].count&&s.troops[id].tier<military)queue(s,'train',id,s.troops[id].tier+1);
  for(const site of Object.keys(C.SITES))if(s.sites[site]){queue(s,'tools',site,Math.min(5,chapter+1));queue(s,'study',site,Math.min(3,chapter-1));}
  queue(s,'weapon',null,Math.min(8,chapter*2));queue(s,'armor',null,Math.min(8,chapter*2));queue(s,'physical',null,Math.min(12,chapter*3));
 }
 const L=C.Legion,l=s.legion;
 for(const [id]of Object.entries(L.PASSIVES))if(L.unlocked(l,'passive',id))legionQueue(s,'passive',id,1);
 const companions=Object.keys(L.COMPANIONS).filter(id=>L.unlocked(l,'companion',id));
 for(const id of companions.slice(0,2))legionQueue(s,'companion',id,Math.min(chapter,l.companions[id].training+1));
 for(const id of ['weapon','armor'])if(C.opened(s))legionQueue(s,'equipment',id,Math.min(chapter+1,l.equipment[id]+1));
 for(const [id,count]of [['vampires',16],['harpies',12],['dragons',3]])if(L.unlocked(l,'unit',id)){legionQueue(s,'recruit',id,count);if(l.units[id].count&&l.units[id].tier<military)legionQueue(s,'train',id,l.units[id].tier+1);}
 const options=[];
 for(const id of Object.keys(C.UNITS))if(s.troops[id].count>0&&C.unitAvailable(s,id)){const t=s.troops[id],unit=C.UNITS[id];options.push({id,advanced:false,score:t.count*Math.sqrt(unit.hp*(1+.25*(t.tier-1))*unit.attack*(1+.3*(t.tier-1)))});}
 for(const id of Object.keys(L.LEGION_UNITS))if(l.units[id].count&&L.unlocked(l,'unit',id)){const t=l.units[id],unit=L.LEGION_UNITS[id],factor=1+.35*(t.tier-1);options.push({id,advanced:true,score:t.count*Math.sqrt(unit.hp*unit.attack)*factor});}
 const selected=options.sort((a,b)=>b.score-a.score).slice(0,3),units=selected.filter(item=>!item.advanced).map(item=>item.id),advanced=selected.filter(item=>item.advanced).map(item=>item.id);
 const spells=['ward',C.ZONES[target].healing?'silence':'bolt'].filter(id=>s.knowledge[id]);
 // Train and equip advanced forces through their paid public programs once the coalition unlocks them.
 L.setLegionLoadout(s,{units:[],spells:[]});
 const error=C.setDeck(s,{units,spells,commander:'neran',doctrine:'balanced'});if(error)throw Error(error);
 const passives=['freeDawn','siege','covenant','bulwark','wings'].filter(id=>l.passives.includes(id)).slice(0,chapter>=3?2:1);
 const artifacts=[];for(const id of ['ember','feather','chains','chalice','river'])if(L.unlocked(l,'artifact',id)&&!artifacts.some(other=>L.ARTIFACTS[other].slot===L.ARTIFACTS[id].slot))artifacts.push(id);
 const loadError=L.setLegionLoadout(s,{units:advanced,companions:companions.slice(0,2),passives,artifacts:artifacts.slice(0,2)});if(loadError)throw Error(loadError);
}
function bestFarm(s){
 const army=C.army(s),damage=army.reduce((n,u)=>n+u.count*u.attack,0),health=army.reduce((n,u)=>n+u.hp,0);let best=null;
 for(const [id,count]of Object.entries(s.progress)){if(count<=0||!C.visible(s,id))continue;const z=C.ZONES[id],stage=count-1,factor=1.3**stage,time=z.hp*factor/Math.max(1,damage),incoming=z.dps*factor;
  if(z.healing||time>40||health<incoming*time*1.7)continue;
  const score=C.lootFor(id,stage).bones/(time+2);if(!best||score>best.score)best={id,score};
 }return best;
}
export function runEconomicCampaign({maxSeconds=259200,onCheckpoint=null}={}){
 const opening=runEconomicOpening({includeState:true});let s=opening.state;
 if(!opening.completed)return {...opening,mode:'economic-full-no-injection',state:undefined};
 const stats={seconds:opening.simulatedSeconds,fallen:opening.fallenObserved},zones=[...opening.zones],ascensions=[];let defeats=0,blocked=null,iterations=0;
 for(let chapter=2;chapter<=4;chapter++){
  defeats+=s.defeats;s=C.ascend(s);s=roundTrip(s);ascensions.push({from:chapter-1,to:chapter,stocks:{...s.resources},forces:Object.fromEntries(Object.entries(s.troops).map(([id,t])=>[id,t.count]))});
  const pending=Object.values(C.Saga.TERRITORIES).filter(z=>z.chapter===chapter).map(z=>z.id);
  while(pending.length&&stats.seconds<maxSeconds){
   const target=pending.find(id=>C.visible(s,id));if(!target){blocked={reason:'No available route',chapter,pending};break;}
   const started=s.elapsed,beforeFallen=stats.fallen;let attempts=0;
   while(!C.done(s,target)&&stats.seconds<maxSeconds){
    acknowledge(s);prepareLaterEconomy(s,target);
    if(s.battle){watchStep(s,.2,stats);continue;}
    // Start pending training before evaluating farm safety, since an active drill removes that regiment from the field.
    C.tick(s,1,{combat:false});stats.seconds++;
    const missing=C.missingRequirements(s,target),farm=bestFarm(s);
    const drilling=s.jobs.some(j=>j.active&&j.kind==='train')||s.legion.jobs.some(j=>j.kind==='companion');
    const canTry=!missing.length&&(!drilling||!farm)&&attempts<120;
    if(canTry){const error=C.start(s,target);if(error)blocked={reason:error};else attempts++;}
    else if(farm){const error=C.start(s,farm.id,'farm');if(error)blocked={reason:error};}
    else{s.expedition.running=false;}
    watchStep(s,s.expedition.running?.2:10,stats);
    if(++iterations>300000){blocked={reason:'Policy iteration limit'};break;}
    if(attempts>=120&&!s.jobs.length&&!s.legion.jobs.length){blocked={reason:'120 attempts after planned development'};break;}
   }
   if(!C.done(s,target)){blocked={...blocked,zone:target,chapter,simulatedSeconds:stats.seconds,missing:C.missingRequirements(s,target),jobs:s.jobs,legionJobs:s.legion.jobs,stocks:{...s.resources},forces:s.troops,hero:{physical:s.physical,weapon:s.weapon,armor:s.armor},income:C.income(s),legion:s.legion};break;}
   s.expedition.running=false;s.battle=null;acknowledge(s);s=roundTrip(s);zones.push(row(s,target,started,stats.fallen-beforeFallen));pending.splice(pending.indexOf(target),1);if(onCheckpoint)onCheckpoint({chapter,zone:target,seconds:stats.seconds});
  }
  if(blocked||pending.length)break;
 }
 const completed=s.saga.chapter===4&&C.done(s,'c4_severin');if(completed){const error=C.Saga.finishSaga(s,'concord');if(error)throw Error(error);s=roundTrip(s);}
 return {mode:'economic-full-no-injection',resourceInjection:false,progressInjected:false,completed,claim:'All four chapters use actual income, loot, paid programs and real battle simulation; no material or progress fixture is applied.',simulatedSeconds:Number(stats.seconds.toFixed(2)),defeats:defeats+s.defeats,fallenObserved:stats.fallen,zones,ascensions,ascensionCount:ascensions.length,blocked:completed?null:blocked,endingChoice:s.saga.ending?.choice||null,finalBuild:{ordinary:s.troops,advanced:s.legion.units,hero:{physical:s.physical,weapon:s.weapon,armor:s.armor},deck:s.deck,legionLoadout:s.legion.loadout,production:C.income(s)},limits:['One deterministic policy is tested; this is neither the fastest route nor a guarantee for every build.','Advanced recruitment, training and companion support are paid using the actual production and loot.']};
}
export async function writeJourneyReports(directory=new URL('./reports/',import.meta.url)){
 const report={generatedAt:new Date().toISOString(),schema:2,economic:runEconomicOpening(),fullEconomic:runEconomicCampaign(),structural:runStructuralJourney(),alternate:runStructuralJourney({alternate:true})};
 await mkdir(directory,{recursive:true});
 await writeFile(new URL('v04-campaign-journey.json',directory),JSON.stringify(report,null,2));
 const lines=['# Parcours de campagne v0.4','',`Simulation économique du chapitre I : ${report.economic.completed?'terminée':'politique bloquée'} en ${report.economic.simulatedSeconds}s ; ${report.economic.defeats} défaites.`,`Simulation économique complète : ${report.fullEconomic.completed?'40 territoires, 3 ascensions et conclusion atteinte':'politique bloquée'} en ${report.fullEconomic.simulatedSeconds}s ; ${report.fullEconomic.defeats} défaites.`,`Parcours structurel : ${report.structural.zones.length} territoires, ${report.structural.ascensionCount} ascensions, fin atteinte.`,`Ordre alternatif : ${report.alternate.zones.length} territoires, fin atteinte.`,'','Le parcours économique complet utilise exclusivement les revenus, le butin et les programmes payés du moteur. Une seule politique est testée ; elle ne garantit ni un temps optimal ni la réussite de tous les builds. Les parcours structurels injectent explicitement la puissance matérielle et servent uniquement à tester des routes différentes. Les identifiants ci-dessous évitent de détailler le récit.','','| Contrôle | Chapitre | Zone | Secondes | Défaites dans la boucle | Pertes au combat observées | Os | Fer | Herbes |','|---|---:|---|---:|---:|---:|---:|---:|---:|'];
 for(const run of [report.economic,report.fullEconomic,report.structural,report.alternate])for(const z of run.zones)lines.push(`| ${run.mode} | ${z.chapter} | ${z.zone} | ${z.elapsedSeconds} | ${z.defeats} | ${z.fallenObserved} | ${z.stocks.bones.toFixed(1)} | ${z.stocks.iron.toFixed(1)} | ${z.stocks.herbs.toFixed(1)} |`);
 if(report.economic.blocked)lines.push('','Blocage économique observé : `'+report.economic.blocked.zone+'` — '+report.economic.blocked.reason+'.');
 if(report.fullEconomic.blocked)lines.push('','Blocage de la politique complète : `'+report.fullEconomic.blocked.zone+'` — '+report.fullEconomic.blocked.reason+'.');
 lines.push('','Sauvegarde et restauration vérifiées après chaque territoire terminé et chaque ascension. Les morts observés sont des pertes pendant le combat, pas des suppressions persistantes de régiments.','',`Production en fin de parcours économique : ${JSON.stringify(report.fullEconomic.finalBuild?.production)}. Les stocks et qualifications détaillés figurent dans le rapport JSON.`);
 await writeFile(new URL('v04-campaign-journey.md',directory),lines.join('\n')+'\n');return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{const report=await writeJourneyReports();console.log(JSON.stringify({economic:report.economic.completed,economicSeconds:report.economic.simulatedSeconds,fullEconomic:report.fullEconomic.completed,fullEconomicSeconds:report.fullEconomic.simulatedSeconds,fullEconomicBlocked:report.fullEconomic.blocked?.zone,structuralZones:report.structural.zones.length,ascensions:report.fullEconomic.ascensionCount}));}catch(error){console.error(error.stack);process.exitCode=1;}}
