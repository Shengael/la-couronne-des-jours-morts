import assert from 'node:assert/strict';
import * as C from '../../campaign.mjs';

export const ROUTES=[['refuge','quarry','fen','archive','forest','bastion'],['refuge','archive','fen','quarry','forest','bastion'],['refuge','fen','quarry','archive','forest','bastion']];
export const POLICIES=['balanced','economy','army'];
const copy=x=>JSON.parse(JSON.stringify(x));
export function developed(){
 const s=C.fresh(100000);s.prologueRead=true;s.guide.enabled=false;s.helpQueue=[];
 if(s.saga)s.saga.scenes=[];
 for(const id of ['refuge','quarry','fen','archive'])s.progress[id]=C.ZONES[id].stages;
 s.groups.settlers.total=18;s.groups.orcs.total=12;s.groups.aquatic.total=12;
 s.sites={mine:true,fen:true};s.resources={bones:2000,iron:2000,herbs:200};
 return s;
}
export function chapterTwo(){
 let s=developed();C.Saga.bootstrapSaga(s);
 const final=C.Saga.CHAPTERS[0].final;s.saga.completed.push(final);s.saga.progress[final]=C.Saga.TERRITORIES[final].stages;
 s=C.ascend(s);s.prologueRead=true;s.guide.enabled=false;s.tutorialPaused=false;s.resources={bones:10000,iron:10000,herbs:10000};
 for(const z of Object.values(C.Saga.TERRITORIES).filter(z=>z.chapter===2)){
  s.progress[z.id]=z.stages;const result=C.Saga.recordVictory(s,z.id,{stage:z.stages-1,first:true});assert(result.ok,`fixture route:${z.id}`);
  if(z.id==='c2_pacte')break;
 }
 s.saga.scenes=[];C.Legion.syncUnlocks(s,C.Saga.sagaContext(s));return C.restore(C.snapshot(s,120000));
}
export function completedChapter(chapter){
 let s=C.fresh(120000);s.prologueRead=true;s.guide.enabled=false;s.helpQueue=[];
 for(let n=1;n<=chapter;n++){
  s.resources={bones:100000,iron:100000,herbs:100000};
  for(const z of Object.values(C.Saga.TERRITORIES).filter(z=>z.chapter===n)){s.progress[z.id]=z.stages;assert(C.Saga.recordVictory(s,z.id,{stage:z.stages-1,first:true}).ok,`reading fixture:${z.id}`);}
  if(n<chapter)s=C.ascend(s);
 }
 s.saga.scenes=[];s.tutorialPaused=false;C.Legion.syncUnlocks(s,C.Saga.sagaContext(s));return C.restore(C.snapshot(s,120000));
}
export function invariants(s){
 for(const id in C.RESOURCES)assert(Number.isFinite(s.resources[id])&&s.resources[id]>=-1e-7&&s.resources[id]<=1e9,`resource:${id}`);
 for(const id in C.GROUPS)assert(C.free(s,id)>=0,`population:${id}`);
 for(const id in C.SITES)assert(Object.values(s.assignments[id]).reduce((a,b)=>a+b,0)<=C.SITES[id].slots,`slots:${id}`);
 assert(s.jobs.length<=12,'queue capacity');
 const families={};for(const j of s.jobs){assert(Number.isFinite(j.progress)&&j.progress>=0,'job progress');if(j.active){assert(j.spec&&j.progress<=j.spec.duration+1e-6,'active duration');families[j.spec.family]=(families[j.spec.family]||0)+1;}}
 assert((families.formation||0)<=2&&(families.study||0)<=1&&(families.works||0)<=1,'parallel capacities');
 for(const id in C.ZONES)assert(s.progress[id]>=0&&s.progress[id]<=C.ZONES[id].stages,`progress:${id}`);
}
function policyStep(s,policy){
 const plan=(kind,target,goal)=>{if(!s.jobs.some(j=>j.kind===kind&&j.target===target)&&C.jobLevel(s,kind,target)<goal)C.addJob(s,kind,target,goal);};
 if(!C.opened(s))return;
 plan('recruit','guards',16);plan('spell','bolt',1);
 if(s.knowledge.bolt){plan('spell','ward',1);if(!s.knowledge.silence)C.setDeck(s,{spells:s.knowledge.ward?['bolt','ward']:['bolt']});}
 if(s.troops.guards.count&&!s.deck.units.includes('guards'))C.setDeck(s,{units:['guards',...s.deck.units.filter(k=>k!=='guards')]});
 if(s.sites.mine){
  if(C.free(s,'orcs')>=1&&Object.values(s.assignments.mine).reduce((a,b)=>a+b,0)<8)C.assign(s,'mine','orcs',1);
  const plans=policy==='army'?[['weapon','army',3],['armor','army',3],['tools','mine',2]]:[['tools','mine',policy==='economy'?3:2],['weapon','army',3],['armor','army',3]];
  for(const args of plans)plan(...args);plan('train','guards',2);
 }
 if(s.sites.fen){
  if(C.free(s,'aquatic')>=1&&Object.values(s.assignments.fen).reduce((a,b)=>a+b,0)<4)C.assign(s,'fen','aquatic',1);
  plan('recruit','lancers',8);
  if(s.troops.lancers.count){plan('train','lancers',2);if(!s.deck.units.includes('lancers'))C.setDeck(s,{units:['guards','lancers']});}
 }
 if(C.done(s,'archive')){plan('spell','silence',1);if(s.knowledge.silence)C.setDeck(s,{spells:['silence','bolt']});}
 plan('physical','neran',4);
 if(s.progress.forest>=2||s.progress.bastion>=1){plan('weapon','army',4);plan('armor','army',4);}
 if(s.progress.bastion>=3){plan('armor','army',4);plan('weapon','army',4);C.setDeck(s,{doctrine:'bulwark'});}
}
export function simulate(route,policy='balanced',limit=7200){
 const s=C.fresh(0),events=[];let current=0,stalls=0;const errors={};
 for(let second=0;second<limit;second++){
  policyStep(s,policy);const next=route[current];if(!next)break;
  if(C.done(s,next)){events.push({checkpoint:current,seconds:Math.round(s.elapsed)});current++;if(s.battle)C.retreat(s);continue;}
  if(!s.battle&&(s.expedition.zone!==next||!s.expedition.running||s.expedition.mode==='farm')){const error=C.start(s,next);if(error){stalls++;errors[error]=(errors[error]||0)+1;}}
  C.tick(s,1);try{invariants(s);}catch(error){error.details={policy,second,checkpoint:current,progress:copy(s.progress),resources:copy(s.resources),jobs:copy(s.jobs)};throw error;}
 }
 return {complete:route.every(id=>C.done(s,id)),seconds:Math.round(s.elapsed),victories:s.victories,defeats:s.defeats,events,blockedSeconds:stalls,blockedReasons:errors,resources:copy(s.resources),progress:copy(s.progress)};
}
export async function modelCases(record){
 for(let i=0;i<ROUTES.length;i++)for(const policy of POLICIES)await record(`progression.route-${i+1}.${policy}`,'progression',()=>{
  const result=simulate(ROUTES[i],policy);if(!result.complete){const error=new Error('Policy did not reach the baseline objective in 7200 simulated seconds');error.details=result;throw error;}return result;
 },`simulate(ROUTES[${i}], '${policy}')`);
 await record('determinism.same-input','invariant',()=>{assert.deepEqual(simulate(ROUTES[0]),simulate(ROUTES[0]));return {seed:'no randomness in campaign',equal:true};},'simulate(ROUTES[0]) twice');
 const mutations={negative:s=>s.resources.bones=-1,nonfinite:s=>s.resources.iron=Infinity,oversized:s=>s.resources.herbs=1e30,duplicatePopulation:s=>{s.assignments.mine.orcs=12;s.troops.raiders.count=4;},siteWithoutConquest:s=>s.sites.mine=false,duplicateJobs:s=>s.jobs.push(copy(s.jobs[0])),forgedDeck:s=>s.deck.spells=['unknown'],forgedTier:s=>s.troops.guards.tier=99};
 for(const [name,mutate]of Object.entries(mutations))await record(`import.reject.${name}`,'adversarial',()=>{
  const s=developed();C.addJob(s,'spell','bolt');C.tick(s,1,{combat:false});const before=JSON.stringify(s),raw=C.snapshot(s,100000);mutate(raw);assert.throws(()=>C.restore(raw));assert.equal(JSON.stringify(s),before);return {rejected:true,currentStateUnchanged:true};
 },`developed(); addJob(spell,bolt); tick(1); snapshot; mutation=${name}; restore(raw)`);
 await record('save.active-job-roundtrip','invariant',()=>{
  const s=developed();C.addJob(s,'recruit','guards',12);C.tick(s,3,{combat:false});const raw=C.snapshot(s,100000),text=JSON.stringify(raw);raw.jobs[0].spec.cost={bones:-10000};const t=C.restore(raw);assert.equal(t.jobs[0].progress,s.jobs[0].progress);assert(t.jobs[0].spec.cost.bones>0);const rawAfter=JSON.stringify(raw);C.tick(t,120,{combat:false});assert.equal(t.troops.guards.count,12);assert.equal(JSON.stringify(raw),rawAfter);return {partialProgressPreserved:true,untrustedCostsIgnored:true,sourceSnapshotBytes:text.length};
 },'developed(); recruit guards12; tick3; snapshot; forge spec.cost; restore; tick120');
 await record('automation.reserve-pause-cancel','invariant',()=>{
  const s=developed();s.resources={bones:120,iron:20,herbs:0};C.setReserve(s,'bones',100);C.addJob(s,'recruit','guards',12);
  for(let i=0;i<50;i++){C.tick(s,1,{combat:false});invariants(s);assert(s.resources.bones>=100-1e-7);}
  const j=s.jobs[0];assert(j);C.editJob(s,j.id,'pause');const progress=j.progress;C.tick(s,50,{combat:false});assert.equal(j.progress,progress);C.editJob(s,j.id,'cancel');assert.equal(C.busy(s,'settlers'),0);return {reserveRespected:true,pausedProgress:progress};
 },'developed(); bones120 reserve100; recruit12; tick50; pause; tick50; cancel');
 await record('offline.exactly-once-and-no-combat','invariant',()=>{
  const s=developed();C.assign(s,'mine','orcs',4);C.start(s,'refuge','farm');const progress=copy(s.progress);const first=C.applyOffline(s,160000),stocks=copy(s.resources),second=C.applyOffline(s,160000);assert.equal(first.seconds,60);assert.equal(second.seconds,0);assert.deepEqual(s.resources,stocks);assert.deepEqual(s.progress,progress);assert.equal(s.battle,null);assert.equal(s.expedition.running,false);return {seconds:first.seconds,repeat:second.seconds};
 },'developed(savedAt100000); applyOffline160000 twice');
 await record('offline.backward-clock-watermark','adversarial',()=>{
  const s=developed();C.applyOffline(s,160000);const stocks=copy(s.resources);C.applyOffline(s,100000);const report=C.applyOffline(s,160000);assert.equal(report.seconds,0,'A backward clock must not replay an already credited interval');assert.deepEqual(s.resources,stocks);return {replayedSeconds:report.seconds};
 },'s=developed(savedAt100000); applyOffline(s,160000); applyOffline(s,100000); applyOffline(s,160000): last call must credit0');
 await record('adversarial.seeded-actions','adversarial',()=>{
  let s=developed(),seed=0xC0FFEE;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let i=0;i<450;i++){
   switch(rand()%7){
    case 0:C.assign(s,'mine','orcs',rand()%2?1:-1);break;
    case 1:C.addJob(s,'recruit','guards',[4,8,12,16][rand()%4]);break;
    case 2:if(s.jobs.length)C.editJob(s,s.jobs[rand()%s.jobs.length].id,rand()%2?'pause':'cancel');break;
    case 3:C.setReserve(s,'bones',rand()%80);break;
    case 4:{const before=JSON.stringify(s);assert(C.setDeck(s,{units:['invalid']}));assert.equal(JSON.stringify(s),before);break;}
    case 5:s=C.restore(C.snapshot(s,100000+i*1000));break;
    case 6:C.addJob(s,'spell','bolt');break;
   }
   C.tick(s,.5,{combat:false});invariants(s);
  }
  return {seed:'0xC0FFEE',steps:450,resources:s.resources};
 },'LCG seed0xC0FFEE;450 API operations; invariant check after each; see tests/bots/model.mjs');
 if(C.Legion&&C.Saga){
  const contextual=()=>{const s=developed();C.Saga.bootstrapSaga(s);C.Legion.syncUnlocks(s,C.Saga.sagaContext(s));return s;};
  await record('integration.companion-save-roundtrip','invariant',()=>{
   const s=contextual();assert.equal(C.Legion.setLegionLoadout(s,{companions:['rovek']}),null);C.Legion.awardExperience(s.legion,60,{companions:true});
   const t=C.restore(C.snapshot(s,100000));assert.equal(t.legion.companions.rovek.xp,60);assert.deepEqual(t.legion.loadout.companions,['rovek']);return {experiencePreserved:true,loadoutPreserved:true};
  },'developed(); Saga.bootstrapSaga; Legion.syncUnlocks(s,Saga.sagaContext(s)); equip rovek; awardExperience60 companions=true; snapshot; C.restore');
  await record('integration.shared-deck-unit-cap','invariant',()=>{
   const s=contextual();C.Legion.syncUnlocks(s,{chapter:2,completed:['c2_pacte'],events:['E09']});s.legion.units.vampires.count=4;
   assert.equal(C.Legion.setLegionLoadout(s,{units:['vampires']}),null);for(const id in s.troops)s.troops[id].count=4;
   const before=copy(s.deck);assert(C.setDeck(s,{units:['guards','raiders','lancers']}),'Base deck accepted 3 regiments alongside 1 Legion regiment');assert.deepEqual(s.deck,before);return {combinedCapEnforced:true};
  },'context chapter2/c2_pacte; Legion vampires4; equip vampires first; base troops4 each; C.setDeck3 units must reject without mutation');
  await record('integration.shared-deck-spell-cap','invariant',()=>{
   const s=contextual();C.Legion.syncUnlocks(s,{chapter:2,completed:['c2_pacte'],events:['E09']});s.legion.knowledge=['blood'];
   assert.equal(C.Legion.setLegionLoadout(s,{spells:['blood']}),null);s.knowledge.bolt=true;s.knowledge.ward=true;
   const before=copy(s.deck);assert(C.setDeck(s,{spells:['bolt','ward']}),'Base deck accepted 2 spells alongside 1 Legion spell');assert.deepEqual(s.deck,before);return {combinedCapEnforced:true};
  },'context chapter2/c2_pacte; Legion knowledge blood; equip blood first; base knows bolt+ward; C.setDeck2 spells must reject');
  await record('integration.shared-works-slot','invariant',()=>{
   const s=contextual();assert.equal(C.addJob(s,'weapon','army',1),null);assert.equal(C.Legion.trainLegion(s,'equipment','armor',1),null);
   C.tick(s,5,{combat:false});assert(s.jobs[0].progress>0);assert.equal(s.legion.jobs[0].progress,0,'Legacy and Legion works used the same slot concurrently');
   C.editJob(s,s.jobs[0].id,'cancel');C.tick(s,1,{combat:false});assert(s.legion.jobs[0].progress>0);invariants(s);return {sharedCapacity:true,queuedJobResumes:true};
  },'developed; bootstrap+sync context; base weapon1 and Legion armor1; tick5; only base works progresses; cancel base; tick1 Legion progresses');
  await record('integration.ascension-save-retained-knowledge','invariant',()=>{
   const s=contextual();s.knowledge.bolt=true;
   const chapter=C.Saga.CHAPTERS[s.saga.chapter-1],last=C.Saga.TERRITORIES[chapter.final];
   // Synthetic completed milestone tests the transition contract; not a full saga bot.
   s.saga.completed.push(chapter.final);s.saga.progress[chapter.final]=last.stages;
   const next=C.ascend(s);assert.equal(next.saga.chapter,2);assert(next.knowledge.bolt,'Ascension lost learned knowledge');assert.equal(next.troops.guards.count,0);
   const loaded=C.restore(C.snapshot(next,100000));assert(loaded.knowledge.bolt);assert.equal(loaded.saga.chapter,2);return {retainedKnowledgeReloads:true,materialTroopsReset:true};
  },'developed + bootstrap; knowledge.bolt=true; synthetic current final milestone marked complete; C.ascend; snapshot; C.restore must retain knowledge');
  await record('integration.presentation-cannot-award-resources','adversarial',()=>{
   const s=contextual(),raw=C.snapshot(s,100000),resources=copy(raw.resources),progress=copy(raw.progress);
   raw.saga.scenes=[{id:'chapter-1',title:'<img src=x onerror="window.__botInjected=1">',text:'<script>window.__botInjected=1</script>',chapter:1}];
   const t=C.restore(raw);assert.deepEqual(t.resources,resources);assert.deepEqual(t.progress,progress);const before=copy(t.resources);C.Saga.acknowledgeScene(t);assert.deepEqual(t.resources,before);return {presentationCannotCreditLoot:true};
  },'snapshot developed; replace scene title/text with HTML payload; C.restore; acknowledgeScene; resources and progress must be unchanged');
  await record('integration.reject-unknown-signature-offer','adversarial',()=>{
   const raw=C.snapshot(contextual(),100000);raw.saga.signatureOffers=['x"><img src=x onerror="window.__botInjected=1">'];assert.throws(()=>C.restore(raw),'Untrusted signature IDs were accepted into an executable data-id attribute');return {unknownSignatureRejected:true};
  },'snapshot developed; saga.signatureOffers=[HTML attribute payload]; C.restore must reject unknown companion ID');
 }
}
