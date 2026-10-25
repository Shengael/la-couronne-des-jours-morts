// The four unique late-game territories are the only source. No random or farm income.
// No imports: Saga and both job systems can depend on this module without a cycle.
export const RELIC_TERRITORIES=Object.freeze(['c4_eaux','c4_forges','c4_val','c4_aires']);
export const EXALTATION_COST=3;
const own=(object,key)=>!!object&&Object.hasOwn(object,key);
const completed=saga=>new Set(Array.isArray(saga?.completed)?saga.completed:[]);
const earnedFromSaga=saga=>{const ids=completed(saga);return RELIC_TERRITORIES.filter(id=>ids.has(id)).length;};

/** Count completed unique territories; never trust a saved balance or reward counter. */
export function earnedRelics(state){return earnedFromSaga(state?.saga);}

/** Return the canonical spent NUMBER, without mutating input. Legacy omission means 0.
 * Optional progress is the already validated campaign/Saga progress map. The owner
 * validates exact final stages; here we reject missing/non-positive completion proof.
 */
export function normalizeRelics(rawSaga,progress){
 const spent=rawSaga?.relicsSpent===undefined?0:rawSaga.relicsSpent;
 const earned=earnedFromSaga(rawSaga);
 if(!Number.isSafeInteger(spent)||spent<0||spent>earned)throw Error('Fragments dépensés invalides.');
 if(progress!==undefined){
  if(!progress||typeof progress!=='object'||Array.isArray(progress))throw Error('Progression des fragments invalide.');
  const ids=completed(rawSaga);
  for(const id of RELIC_TERRITORIES)if(ids.has(id)&&(!own(progress,id)||!Number.isSafeInteger(progress[id])||progress[id]<=0))throw Error('Territoire à fragment incomplet.');
 }
 return spent===0?0:spent;
}

function ignoreKey(ignoreJobId){
 if(ignoreJobId===undefined||ignoreJobId===null)return null;
 if(typeof ignoreJobId==='string'&&/^(base|legion):[1-9]\d*$/.test(ignoreJobId))return ignoreJobId;
 if(ignoreJobId&&typeof ignoreJobId==='object'&&['base','legion'].includes(ignoreJobId.source)&&Number.isSafeInteger(ignoreJobId.id)&&ignoreJobId.id>0)return `${ignoreJobId.source}:${ignoreJobId.id}`;
 throw Error('Identifiant de réservation ambigu : utiliser base:ID ou legion:ID.');
}
const regiment=(state,source,target)=>{
 const units=source==='base'?state?.troops:state?.legion?.units;
 return own(units,target)?units[target]:null;
};

/** Active claims survive pause/shortage. Queued, unstarted work claims nothing.
 * Base jobs have an explicit active flag and trusted spec; Legion jobs currently
 * mark started work by positive progress (or an explicit active flag if provided).
 */
export function reservedRelics(state,{ignoreJobId}={}){
 const ignored=ignoreKey(ignoreJobId);let reserved=0;
 for(const job of state?.jobs||[]){
  if(!job||`base:${job.id}`===ignored||job.kind!=='train'||job.active!==true||job.spec?.relicsCost!==EXALTATION_COST)continue;
  if(regiment(state,'base',job.target)?.tier===10&&(job.goal??11)>10)reserved+=EXALTATION_COST;
 }
 for(const job of state?.legion?.jobs||[]){
  if(!job||`legion:${job.id}`===ignored||job.kind!=='train'||!(job.active===true||Number.isFinite(job.progress)&&job.progress>0))continue;
  if(regiment(state,'legion',job.target)?.tier===10&&(job.goal??11)>10)reserved+=EXALTATION_COST;
 }
 return reserved;
}

export function availableRelics(state,options={}){
 const spent=normalizeRelics(state?.saga);
 return Math.max(0,earnedRelics(state)-spent-reservedRelics(state,options));
}

/** kind is base/legion; train resolves an unambiguous regiment ID for convenience. */
export function exaltationAllowed(state,kind,target,options={}){
 if(state?.saga?.chapter!==4)return false;
 let unit;
 if(kind==='base'||kind==='legion')unit=regiment(state,kind,target);
 else if(kind==='train'){
  const base=regiment(state,'base',target),advanced=regiment(state,'legion',target);
  if(base&&advanced)return false;
  unit=base||advanced;
 }else return false;
 return !!unit&&unit.tier===10&&Number.isSafeInteger(unit.count)&&unit.count>0&&availableRelics(state,options)>=EXALTATION_COST;
}

/** Commit at successful completion BEFORE increasing tier to 11. To consume an
 * owned reservation, pass {ignoreJobId:'base:ID'|'legion:ID'}. Return false without
 * mutation on insufficient stock. Cancelling work never calls this function.
 */
export function consumeRelics(state,amount=EXALTATION_COST,options={}){
 if(amount!==EXALTATION_COST)throw Error('Une exaltation consomme exactement trois fragments.');
 if(!state?.saga||state.saga.chapter!==4)return false;
 const spent=normalizeRelics(state.saga);
 if(availableRelics(state,options)<amount)return false;
 state.saga.relicsSpent=spent+amount;
 return true;
}
