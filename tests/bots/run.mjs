import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import uiModule from './ui.cjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2),option=name=>{const at=args.indexOf(name);return at<0?null:args[at+1];};
const milestone=option('--milestone');
if(!milestone||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,70}$/.test(milestone)){console.error('Usage: node tests/bots/run.mjs --milestone v03-baseline [--model-only | --ui-only]');process.exit(2);}
if(args.includes('--model-only')&&args.includes('--ui-only')){console.error('Choose a single subset or no subset.');process.exit(2);}
const reports=path.join(root,'tests/reports');fs.mkdirSync(reports,{recursive:true});
const cases=[];
async function record(id,category,fn,repro){
 const start=performance.now();
 try{const details=await fn();cases.push({id,category,status:'pass',durationMs:Math.round(performance.now()-start),details,repro});console.log(`PASS ${id}`);}
 catch(error){cases.push({id,category,status:'fail',durationMs:Math.round(performance.now()-start),error:error.message,details:error.details,stack:error.stack,repro});console.log(`FAIL ${id}: ${error.message.split('\n')[0]}`);}
}
const hashSources=()=>Object.fromEntries([...fs.readdirSync(root).filter(file=>/\.(mjs|css|html)$/.test(file)),...fs.readdirSync(path.join(root,'tests/bots')).filter(file=>/\.(mjs|cjs)$/.test(file)).map(file=>'tests/bots/'+file)].sort().map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]));
const sourceHashes=hashSources();
if(!args.includes('--ui-only'))await record('model.harness','infrastructure',async()=>{const {modelCases}=await import('./model.mjs');const n=cases.length;await modelCases(record);return {cases:cases.length-n};},'Import campaign.mjs and execute tests/bots/model.mjs');
if(!args.includes('--model-only'))await record('ui.harness','infrastructure',async()=>{const n=cases.length;await uiModule.uiCases(record,{root,reports,milestone});return {cases:cases.length-n};},'Launch browser using PLAYWRIGHT_MODULE and CHROME_PATH, local routing only');
await record('infrastructure.unchanged-source','infrastructure',()=>{if(JSON.stringify(hashSources())!==JSON.stringify(sourceHashes))throw Error('Source changed during this run; rerun on a stable milestone before interpreting results.');return {unchanged:true};},'Compare SHA-256 of root .mjs/.css/.html before and after suite');
const failures=cases.filter(c=>c.status==='fail'),observations=cases.flatMap(c=>(c.details?.observations||[]).map(text=>({case:c.id,text})));
const progression=cases.filter(c=>c.category==='progression').map(c=>({id:c.id,status:c.status,...c.details}));
const comparison=[];
for(let route=1;route<=3;route++){
 const results=progression.filter(c=>c.id.includes(`route-${route}.`)&&c.status==='pass').sort((a,b)=>a.seconds-b.seconds||a.defeats-b.defeats);
 if(results.length)comparison.push({routeId:route,winnerAmongTested:results[0].id.split('.').at(-1),seconds:results[0].seconds,policies:results.map(r=>({policy:r.id.split('.').at(-1),seconds:r.seconds,defeats:r.defeats}))});
}
const report={schemaVersion:1,milestone,createdAt:new Date().toISOString(),node:process.version,scope:args.includes('--model-only')?'model-only':args.includes('--ui-only')?'ui-only':'model+ui',sourceHashes,
 summary:{decision:failures.length?'needs-investigation':'automated-checks-pass',passed:cases.length-failures.length,failed:failures.length,observations:observations.length,spoilerFree:true,
  limitation:'Deterministic scripted policies and DOM/keyboard heuristics do not establish human comprehension, narrative quality, screen-reader compliance or a global optimum.'},
 comparison,observations,cases};
const suffix=args.includes('--model-only')?'-model':args.includes('--ui-only')?'-ui':'';
const stem=milestone+suffix;
fs.writeFileSync(path.join(reports,stem+'.json'),JSON.stringify(report,null,2)+'\n');
const md=[`# Bots — ${milestone}`,'',`Décision : **${report.summary.decision}**. ${report.summary.passed} cas réussis, ${failures.length} échec(s).`,'',
 `Périmètre : ${report.scope}. Rapport du ${report.createdAt}. Empreintes du code et cas détaillés dans [le JSON](${stem}.json).`,'',
 'Le résumé ne révèle aucun événement ni contenu de la campagne. Les détails techniques sont réservés au JSON.','',
 'Ces bots vérifient des politiques écrites, des invariants, la navigation clavier et des heuristiques de mise en page. Ils ne mesurent pas la compréhension réelle, le plaisir, la qualité du récit ni une conformité complète aux lecteurs d’écran. La comparaison ne prouve pas un optimum global.','',
 '## Échecs à reproduire','',...(failures.length?failures.map(c=>`- **${c.id}** : ${c.error.split('\n')[0]}. Reproduction technique dans le JSON.`):['Aucun dans le périmètre exécuté.']),'',
 '## Observations d’interface','',...([...new Set(observations.map(o=>o.text))].map(text=>`- ${text}`)),...(observations.length?[]:['Aucune observation relevée ; cela ne remplace pas un essai utilisateur.']),'',
 '## Comparaison des politiques','',...comparison.map(c=>`- Chemin ${c.routeId} : politique ${c.winnerAmongTested}, ${c.seconds} s simulées parmi les politiques testées.`),'',
 'Chaque échec reste distinct d’un défaut confirmé : le développeur doit confronter l’attendu aux règles produit avant correction. Un échec d’infrastructure indique une couverture absente, jamais un succès.',''];
fs.writeFileSync(path.join(reports,stem+'.md'),md.join('\n'));
console.log(`Report: tests/reports/${stem}.md`);if(failures.length)process.exitCode=1;
