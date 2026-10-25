import test from 'node:test';
import assert from 'node:assert/strict';
import {runEconomicOpening,runEconomicCampaign,runStructuralJourney} from './campaign-journey.mjs';
test('paid economic policy clears the first chapter without injected resources or progress',()=>{
 const run=runEconomicOpening();assert.equal(run.mode,'economic-opening-no-injection');assert.equal(run.resourceInjection,false);assert.equal(run.progressInjected,false);assert.equal(run.completed,true,JSON.stringify(run.blocked));assert.equal(run.zones.length,10);assert(run.simulatedSeconds>1000);assert(run.simulatedSeconds<=14400);assert(run.zones.every(z=>z.saveRestore));assert.equal(run.zones.at(-1).zone,'phare');for(const row of run.zones)for(const stock of Object.values(row.stocks))assert(Number.isFinite(stock)&&stock>=0);
});
test('real combat engine traverses all four chapters, three material resets, saves and final conclusion with explicit fixture power',()=>{
 const run=runStructuralJourney();assert(run.completed);assert.equal(run.zones.length,40);assert.equal(new Set(run.zones.map(row=>row.zone)).size,40);assert.equal(run.ascensionCount,3);assert.equal(run.fixture.progressInjected,false);assert.match(run.claim,/Does not validate/);assert(run.zones.every(row=>row.saveRestore));assert.deepEqual(run.ascensions.map(row=>[row.from,row.to]),[[1,2],[2,3],[3,4]]);for(const reset of run.ascensions){assert.deepEqual(reset.stocks,{bones:30,iron:0,herbs:0});assert(Object.values(reset.forces).every(count=>count===0));}assert.equal(run.endingChoice,'concord');
});
test('a different available-route policy reaches the same resolved campaign with a different explicit epilogue',()=>{
 const standard=runStructuralJourney(),alternate=runStructuralJourney({alternate:true});assert(alternate.completed);assert.equal(alternate.zones.length,40);assert.equal(alternate.ascensionCount,3);assert.notDeepEqual(alternate.zones.map(z=>z.zone),standard.zones.map(z=>z.zone));assert.equal(alternate.endingChoice,'withdrawal');assert.deepEqual(new Set(alternate.zones.map(z=>z.zone)),new Set(standard.zones.map(z=>z.zone)));
});
test('all four chapters can be cleared with actual production, paid coalition forces and three resets without material injection',()=>{
 const run=runEconomicCampaign();assert.equal(run.resourceInjection,false);assert.equal(run.progressInjected,false);assert.equal(run.completed,true,JSON.stringify(run.blocked));assert.equal(run.zones.length,40);assert.equal(new Set(run.zones.map(z=>z.zone)).size,40);assert.equal(run.ascensionCount,3);assert.equal(run.endingChoice,'concord');assert(run.simulatedSeconds<259200);assert(run.zones.every(z=>z.saveRestore));assert(Object.values(run.finalBuild.advanced).some(unit=>unit.count>0&&unit.tier>1));for(const reset of run.ascensions)assert(Object.values(reset.forces).every(count=>count===0));for(const z of run.zones)for(const stock of Object.values(z.stocks))assert(Number.isFinite(stock)&&stock>=0);
});
