import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stages=[
 ['unit-and-integration',['--test',...fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.test.mjs')).sort().map(f=>'tests/'+f)]],
 ['browser-first-session',['tests/frontier-browser.cjs']],
 ['browser-guidance',['tests/contextual-browser.cjs']],
 ['browser-stability',['tests/stability-browser.cjs']],
 ['campaign-journeys',['tests/campaign-journey.mjs']],
 ['milestone-bots',['tests/bots/run.mjs','--milestone','v04-release']]
];
const results=[];
for(const [id,args]of stages){const start=Date.now(),result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:8e6});const stdout=result.stdout||'',stderr=result.stderr||'';const file=id+'.log';fs.mkdirSync(path.join(root,'tests/reports'),{recursive:true});fs.writeFileSync(path.join(root,'tests/reports',file),stdout+stderr);results.push({id,passed:result.status===0,exitCode:result.status,milliseconds:Date.now()-start,log:file,error:result.error?.message});console.log((result.status===0?'PASS ':'FAIL ')+id);if(result.status!==0)console.log((stdout+stderr).slice(-5000));}
const passed=results.every(r=>r.passed),report={version:'0.4.0',createdAt:new Date().toISOString(),passed,results};
fs.writeFileSync(path.join(root,'tests/reports/v04-validation.json'),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(root,'tests/reports/v04-validation.md'),[
 '# Validation du jalon 0.4 — sans révélations','',
 `Résultat : **${passed?'tous les lots exécutés réussissent':'des contrôles restent en échec'}**. ${report.createdAt}.`,'',
 '| Lot | Résultat | Trace |','|---|---|---|',...results.map(r=>`| ${r.id} | ${r.passed?'Réussi':'Échec'} | [Journal](${r.log}) |`),'',
 '[Détail des bots et limites](v04-release.md) · [Parcours économiques et structurels](v04-campaign-journey.md) · [Données de validation](v04-validation.json)','',
 'Les parcours économiques paient les coûts du jeu. Les fixtures puissantes restent séparées et servent à tester la structure. Les vérifications d’interface sont des mesures de DOM, de clavier et de mise en page ; elles ne prouvent ni la compréhension humaine ni un équilibre définitif.'
 ].join('\n')+'\n');
if(!passed)process.exitCode=1;
