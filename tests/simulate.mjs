import {fresh,tick,start,buy,prepare,STAGES,price,reconstruct} from '../engine.mjs';
export function run(state=fresh(),limit=7200){let changes=0;start(state);while(state.elapsed<limit&&state.cleared<8){
 if(state.cleared>=5&&state.deck.commander!=='tesk'){prepare(state,{...state.deck,commander:'tesk',units:['guards','marsh','horde'],spells:['silence','ward'],doctrine:'balanced'});changes++;}
 for(const key of ['guards','horde','armor','weapon','physical',...(state.cleared>=5?['marsh']:[])])buy(state,key);
 if(!state.battle&&state.mode==='farm'&&state.elapsed%5<.5)start(state,'progress');tick(state,.5);
 }return {state,summary:{complete:state.cleared===8,seconds:Math.round(state.elapsed),victories:state.victories,defeats:state.defeats,levels:state.levels,forge:state.forge,firstClear:state.metrics.firstClear,changes}};}
const a=run();console.log(JSON.stringify(a.summary,null,2));if(!a.summary.complete)process.exitCode=1;else{const b=run(reconstruct(a.state));console.log('Reconstruction',JSON.stringify(b.summary,null,2));if(!b.summary.complete||b.summary.seconds>=a.summary.seconds)process.exitCode=1;}
