import test from 'node:test';
import assert from 'node:assert/strict';
import {RELIC_TERRITORIES,EXALTATION_COST,earnedRelics,normalizeRelics,reservedRelics,availableRelics,exaltationAllowed,consumeRelics} from '../relics.mjs';

function state(count=4){return {saga:{chapter:4,completed:RELIC_TERRITORIES.slice(0,count),relicsSpent:0},troops:{guards:{tier:10,count:4}},jobs:[],legion:{units:{vampires:{tier:10,count:4}},jobs:[]}};}
const base=(id=1)=>({id,kind:'train',target:'guards',goal:11,active:true,progress:0,spec:{relicsCost:EXALTATION_COST}});
const advanced=(id=1)=>({id,kind:'train',target:'vampires',goal:11,progress:1});

test('only four unique late territories grant fragments, not duplicate victories or arbitrary saved counters',()=>{
 const s=state();s.saga.completed.push(...RELIC_TERRITORIES,'c4_severin','unknown');s.saga.relics=1e9;s.resources={relics:1e9};assert.equal(earnedRelics(s),4);
 s.saga.completed=[];assert.equal(earnedRelics(s),0);assert.equal(earnedRelics({}),0);assert(Object.isFrozen(RELIC_TERRITORIES));
});
test('three fragments are available before the final boss and can fund exactly one exaltation',()=>{
 const s=state(3);assert(!s.saga.completed.includes('c4_severin'));assert.equal(availableRelics(s),3);assert(exaltationAllowed(s,'base','guards'));
 assert.equal(consumeRelics(s,3),true);assert.equal(s.saga.relicsSpent,3);assert.equal(availableRelics(s),0);assert.equal(consumeRelics(s,3),false);assert.equal(s.saga.relicsSpent,3);
});
test('normalization is pure, accepts legacy absence and canonicalizes negative zero',()=>{
 const raw={completed:RELIC_TERRITORIES.slice()};const before=structuredClone(raw);assert.equal(normalizeRelics(raw),0);assert.deepEqual(raw,before);assert.equal(normalizeRelics(undefined),0);
 assert.equal(Object.is(normalizeRelics({...raw,relicsSpent:-0}),-0),false);
 assert.equal(normalizeRelics({...raw,relicsSpent:3},Object.fromEntries(RELIC_TERRITORIES.map(id=>[id,1]))),3);
});
test('normalization rejects nonfinite, fractional, coerced, negative and unearned spending',()=>{
 for(const value of [NaN,Infinity,-Infinity,-1,.5,'3',null,true,5])assert.throws(()=>normalizeRelics({completed:RELIC_TERRITORIES,relicsSpent:value}));
 assert.throws(()=>normalizeRelics({completed:[...RELIC_TERRITORIES.slice(0,2),...RELIC_TERRITORIES.slice(0,2)],relicsSpent:3}));
});
test('optional completion proof rejects absent and invalid progress without granting fragments from progress alone',()=>{
 const raw={completed:[RELIC_TERRITORIES[0]],relicsSpent:0};for(const progress of [[],null,{}, {[RELIC_TERRITORIES[0]]:0},{[RELIC_TERRITORIES[0]]:Infinity}])assert.throws(()=>normalizeRelics(raw,progress));
 assert.equal(normalizeRelics({completed:[]},Object.fromEntries(RELIC_TERRITORIES.map(id=>[id,100]))),0);
});
test('eligibility requires chapter4, a populated tier10 regiment and enough unreserved fragments',()=>{
 const s=state();assert(exaltationAllowed(s,'base','guards'));assert(exaltationAllowed(s,'legion','vampires'));assert(exaltationAllowed(s,'train','vampires'));
 for(const chapter of [1,2,3,5]){s.saga.chapter=chapter;assert.equal(exaltationAllowed(s,'base','guards'),false);}s.saga.chapter=4;
 for(const tier of [1,9,11]){s.troops.guards.tier=tier;assert.equal(exaltationAllowed(s,'base','guards'),false);}s.troops.guards.tier=10;
 s.troops.guards.count=0;assert.equal(exaltationAllowed(s,'base','guards'),false);assert.equal(exaltationAllowed(state(),'worker','guards'),false);assert.equal(exaltationAllowed(state(),'base','__proto__'),false);
});
test('base active claims block rival exaltation and remain reserved when paused or resource-starved',()=>{
 const s=state();s.jobs=[base()];assert.equal(reservedRelics(s),3);assert.equal(availableRelics(s),1);assert.equal(exaltationAllowed(s,'legion','vampires'),false);
 s.jobs[0].paused=true;s.jobs[0].status='Ressources insuffisantes';assert.equal(availableRelics(s),1);
 s.jobs[0].active=false;assert.equal(availableRelics(s),4);
});
test('Legion positive progress or explicit active claims reserve fragments, including pause at positive progress',()=>{
 const s=state();s.legion.jobs=[advanced()];assert.equal(availableRelics(s),1);s.legion.jobs[0].paused=true;assert.equal(availableRelics(s),1);
 s.legion.jobs[0].progress=0;assert.equal(availableRelics(s),4);s.legion.jobs[0].active=true;assert.equal(availableRelics(s),1);
});
test('queued work and unrelated jobs claim nothing; completed tier11 no longer reserves a second cost',()=>{
 const s=state();s.jobs=[{...base(),active:false},{...base(2),kind:'recruit'}];s.legion.jobs=[{...advanced(),progress:0}];assert.equal(reservedRelics(s),0);
 s.jobs=[base()];s.troops.guards.tier=11;assert.equal(reservedRelics(s),0);
});
test('namespaced own-job exclusion cannot accidentally release a rival reservation with the same numeric ID',()=>{
 const s=state();s.jobs=[base(1)];s.legion.jobs=[advanced(1)];assert.equal(reservedRelics(s),6);assert.equal(availableRelics(s),0);
 assert.equal(reservedRelics(s,{ignoreJobId:'base:1'}),3);assert.equal(reservedRelics(s,{ignoreJobId:{source:'legion',id:1}}),3);
 assert.equal(consumeRelics(s,3,{ignoreJobId:'base:1'}),false);assert.equal(s.saga.relicsSpent,0);
 assert.throws(()=>availableRelics(s,{ignoreJobId:1}));assert.throws(()=>availableRelics(s,{ignoreJobId:'1'}));
});
test('owner consumes exactly once and releasing a cancelled claim restores availability',()=>{
 const s=state();s.jobs=[base()];assert.equal(consumeRelics(s,3),false);assert(exaltationAllowed(s,'base','guards',{ignoreJobId:'base:1'}));
 assert.equal(consumeRelics(s,3,{ignoreJobId:'base:1'}),true);s.troops.guards.tier=11;s.jobs=[];assert.equal(availableRelics(s),1);assert.equal(consumeRelics(s,3),false);
 const cancelled=state();cancelled.jobs=[base()];cancelled.jobs=[];assert.equal(availableRelics(cancelled),4);assert.equal(cancelled.saga.relicsSpent,0);
});
test('invalid spending is atomic; snapshot reload preserves spent budget and active claims',()=>{
 const s=state();for(const amount of [0,1,2,4,-3,NaN,Infinity,'3']){const before=structuredClone(s);assert.throws(()=>consumeRelics(s,amount));assert.deepEqual(s,before);}
 s.jobs=[base()];const loaded=JSON.parse(JSON.stringify(s));assert.equal(availableRelics(loaded),1);assert.equal(consumeRelics(loaded,3,{ignoreJobId:'base:1'}),true);assert.equal(normalizeRelics(loaded.saga),3);assert.equal(s.saga.relicsSpent,0);
});
