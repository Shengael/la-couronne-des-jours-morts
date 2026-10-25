import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../campaign.mjs';
function endgame(){const s=C.fresh();s.saga.chapter=4;s.saga.ascensions=3;s.saga.memories=C.Saga.CHAPTERS.slice(0,3).map(c=>c.memory);for(const id of ['refuge','quarry','fen','archive','c4_accueil','c4_eaux','c4_forges','c4_val'])s.progress[id]=C.ZONES[id].stages;for(const id of ['c4_accueil','c4_eaux','c4_forges','c4_val']){s.saga.completed.push(id);s.saga.progress[id]=C.ZONES[id].stages;}C.Saga.bootstrapSaga(s);s.sites={mine:true,fen:true};s.groups.settlers.total=40;s.groups.orcs.total=12;s.groups.aquatic.total=12;s.troops.guards={count:8,tier:10};s.troops.raiders={count:4,tier:10};s.resources={bones:200000,iron:20000,herbs:10000};return s;}
test('rare training reserves unique fragments, survives reload and consumes them exactly once',()=>{
 let s=endgame();assert.equal(C.Relics.availableRelics(s),3);assert.equal(C.addJob(s,'train','guards',11),null);C.tick(s,2,{combat:false});assert.equal(C.Relics.availableRelics(s),0);
 s=C.restore(C.snapshot(s));assert.equal(C.Relics.availableRelics(s),0);C.tick(s,160,{combat:false});assert.equal(s.troops.guards.tier,11);assert.equal(s.saga.relicsSpent,3);assert.equal(C.Relics.availableRelics(s),0);assert.equal(C.restore(C.snapshot(s)).troops.guards.tier,11);assert(C.addJob(s,'train','raiders',11));
});
test('rare military unlock does not grant free civilian T11 and cancellation releases a claim',()=>{
 const s=endgame();s.groups.orcs.tier=10;assert.equal(C.specification(s,'worker','orcs'),null);C.addJob(s,'train','guards',11);C.tick(s,1,{combat:false});assert.equal(C.Relics.availableRelics(s),0);C.editJob(s,s.jobs[0].id,'cancel');assert.equal(C.Relics.availableRelics(s),3);assert.equal(s.troops.guards.tier,10);assert.equal(s.saga.relicsSpent,0);
});
