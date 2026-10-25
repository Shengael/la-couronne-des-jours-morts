import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../campaign.mjs';
function later(){const s=C.fresh();s.saga.chapter=2;s.saga.ascensions=1;for(const id of ['refuge','quarry','fen','archive','c2_refuge','c2_maera','c2_hospice','c2_alchimie','c2_pacte']){s.progress[id]=C.ZONES[id].stages;}C.Legion.syncUnlocks(s,C.legionContext(s));s.resources={bones:1000,iron:1000,herbs:1000};return s;}
test('automatic coalition quote includes all batches, leaves state unchanged and agrees with paid work',()=>{
 const s=later(),before=JSON.stringify(s),q=C.Legion.legionGoalQuote(s,'recruit','vampires',12);
 assert.equal(JSON.stringify(s),before);assert.equal(q.steps,3);assert.deepEqual(q.cost,{bones:150,iron:36,herbs:48});assert(Math.abs(q.duration-96/1.35)<1e-8);
 assert.equal(C.Legion.trainLegion(s,'recruit','vampires',12),null);C.Legion.tickLegion(s,q.duration+3);
 assert.equal(s.legion.units.vampires.count,12);assert(Math.abs(s.resources.bones-850)<1e-7);assert(Math.abs(s.resources.herbs-952)<1e-7);
});
test('restored coalition progress is validated against accelerated canonical duration',()=>{
 const s=later();C.Legion.trainLegion(s,'recruit','vampires');const raw=structuredClone(s.legion);raw.jobs[0].progress=30;
 assert.throws(()=>C.Legion.normalizeLegion(raw,C.legionContext(s)),/Progression/);
 raw.jobs[0].progress=12;const normalized=C.Legion.normalizeLegion(raw,C.legionContext(s));s.legion=normalized;C.Legion.tickLegion(s,15);assert.equal(s.legion.units.vampires.count,4);
});
test('a new material territory strengthens a shared supply chain without changing combat loot',()=>{
 const s=later();s.saga.completed=['quarry'];s.sites.mine=true;s.assignments.mine.orcs=4;s.groups.orcs.total=12;
 const before=C.income(s).iron,loot=C.lootFor('quarry',2);s.saga.completed.push('fonderie');assert(C.income(s).iron>before);assert.deepEqual(C.lootFor('quarry',2),loot);assert.equal(s.assignments.mine.orcs,4);
});
