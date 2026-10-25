import * as C from '../campaign.mjs';
import assert from 'node:assert/strict';
function simulate(route){const s=C.fresh(0),events=[];let current=0;
 const plan=(kind,target,goal)=>{if(!s.jobs.some(j=>j.kind===kind&&j.target===target)&&C.jobLevel(s,kind,target)<goal)C.addJob(s,kind,target,goal);};
 for(let second=0;second<7200;second++){
  if(C.opened(s)){
   plan('recruit','guards',16);plan('spell','bolt',1);if(s.knowledge.bolt){plan('spell','ward',1);if(!s.knowledge.silence)C.setDeck(s,{spells:s.knowledge.ward?['bolt','ward']:['bolt']});}
   if(s.troops.guards.count&&!s.deck.units.includes('guards'))C.setDeck(s,{units:['guards',...s.deck.units.filter(k=>k!=='guards')]});
   if(s.sites.mine){if(C.free(s,'orcs')>=1&&Object.values(s.assignments.mine).reduce((a,b)=>a+b,0)<8)C.assign(s,'mine','orcs',1);plan('tools','mine',2);plan('weapon','army',3);plan('armor','army',3);plan('train','guards',2);}
   if(s.sites.fen){if(C.free(s,'aquatic')>=1&&Object.values(s.assignments.fen).reduce((a,b)=>a+b,0)<4)C.assign(s,'fen','aquatic',1);plan('recruit','lancers',8);if(s.troops.lancers.count){plan('train','lancers',2);if(!s.deck.units.includes('lancers'))C.setDeck(s,{units:['guards','lancers']});}}
   if(C.done(s,'archive')){plan('spell','silence',1);if(s.knowledge.silence)C.setDeck(s,{spells:['silence','bolt']});}
   plan('physical','neran',4);if(s.progress.forest>=2||s.progress.bastion>=1){plan('weapon','army',4);plan('armor','army',4);}
   if(s.progress.bastion>=3){plan('armor','army',4);plan('weapon','army',4);C.setDeck(s,{doctrine:'bulwark'});}
  }
  const next=route[current];if(!next)break;
  if(C.done(s,next)){events.push({zone:next,seconds:Math.round(s.elapsed)});current++;if(s.battle)C.retreat(s);continue;}
  if(!s.battle&&(s.expedition.zone!==next||!s.expedition.running||s.expedition.mode==='farm'))C.start(s,next);
  C.tick(s,1);
 }
 assert(C.done(s,'bastion'),`Route incomplete ${route.join(',')}: ${JSON.stringify(events)}; ${JSON.stringify({troops:s.troops,progress:s.progress,weapon:s.weapon,armor:s.armor,physical:s.physical,jobs:s.jobs,report:s.reports[0]})}`);
 for(const g in C.GROUPS)assert(C.free(s,g)>=0);
 return {order:route.join(' → '),seconds:Math.round(s.elapsed),victories:s.victories,defeats:s.defeats,events};
}
for(const route of [['refuge','quarry','fen','archive','forest','bastion'],['refuge','archive','fen','quarry','forest','bastion'],['refuge','fen','quarry','archive','forest','bastion']])console.log(JSON.stringify(simulate(route)));
