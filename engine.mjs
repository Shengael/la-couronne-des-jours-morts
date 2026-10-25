export const UNITS={
 guards:{name:"Gardes d’os",icon:"⛨",capacity:3,count:12,hp:32,attack:1.65,description:"Une première ligne résistante."},
 horde:{name:"Horde sépulcrale",icon:"☠",capacity:2,count:40,hp:6,attack:.62,description:"Le nombre à faible coût de commandement."},
 marsh:{name:"Lanciers des marais",icon:"♜",capacity:4,count:16,hp:25,attack:2,description:"Résistance et puissance après une libération."}
};
export const SPELLS={bolt:{name:"Trait funèbre",icon:"✦",cost:2,cooldown:6,description:"Dégâts magiques réguliers."},ward:{name:"Rempart d’ossements",icon:"⛨",cost:3,cooldown:10,description:"Réduit les dégâts de 45 % pendant 5 s, quand la ligne est menacée."},silence:{name:"Silence profane",icon:"◈",cost:3,cooldown:5,description:"Interrompt la préparation du soin ennemi."}};
export const DOCTRINES={balanced:{name:"Discipline",description:"Aucune contrepartie ; formation équilibrée.",attack:1,hp:1},assault:{name:"Assaut",description:"Dégâts +22 %, PV des régiments −18 %.",attack:1.22,hp:.82},bulwark:{name:"Tenir la ligne",description:"PV +25 %, dégâts −12 %.",attack:.88,hp:1.25}};
export const STAGES=[
 {name:"Les abords",zone:"Carrière des Veilles",type:"Conquête",hp:510,dps:22,count:18,enemy:"Bandes pillardes"},
 {name:"La voie des chariots",zone:"Carrière des Veilles",type:"Conquête",hp:730,dps:35,count:24,enemy:"Gardes du passage"},
 {name:"Le contremaître",zone:"Carrière des Veilles",type:"Conquête",hp:1050,dps:48,count:31,enemy:"Garnison de la carrière",elite:true},
 {name:"Les pistes du marais",zone:"Écloserie assiégée",type:"Libération",hp:1300,dps:55,count:36,enemy:"Éclaireurs ennemis"},
 {name:"Le cordon",zone:"Écloserie assiégée",type:"Libération",hp:1750,dps:68,count:45,enemy:"Forces d’encerclement"},
 {name:"Rompre le siège",zone:"Écloserie assiégée",type:"Libération",hp:2250,dps:84,count:54,enemy:"Armée de siège",elite:true},
 {name:"La route protégée",zone:"Poste du chenal",type:"Conquête",hp:2750,dps:95,count:62,enemy:"Escorte et soigneur",healing:230},
 {name:"Les portes du poste",zone:"Poste du chenal",type:"Conquête",hp:3400,dps:113,count:72,enemy:"Gardes et officiant",healing:340},
 {name:"Le poste du chenal",zone:"Poste du chenal",type:"Conquête",hp:4400,dps:138,count:86,enemy:"Garnison renforcée",healing:480,elite:true}
];
const clone=x=>JSON.parse(JSON.stringify(x));
const bounded=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export function fresh(){return {version:1,resources:{bones:100,iron:30},physical:1,levels:{horde:1,guards:1,marsh:1},forge:{weapon:0,armor:0},xp:{neran:0,tesk:0},deck:{commander:"neran",units:["guards","horde"],spells:["bolt","ward"],doctrine:"balanced",weapon:1},inventory:[{id:1,name:"Bâton fendu",rarity:"Commun",power:.03}],nextItem:2,knowledge:{silence:false,marsh:false,reconstruction:false},cleared:-1,record:-1,target:0,mode:"progress",running:false,speed:1,elapsed:0,wait:0,cycle:0,victories:0,defeats:0,seed:314159,log:[],lastReport:null,reports:[],battle:null,metrics:{firstClear:{},farmSeconds:0},completionNotified:false};}
export function note(s,text,kind="info"){s.log.unshift({text,kind,time:s.elapsed});s.log=s.log.slice(0,30);}
export function unlocked(s,id){return id!=="marsh"||s.cleared>=5;}
export function spellKnown(s,id){return !!SPELLS[id]&&(id!=="silence"||s.knowledge.silence);}
export function capacity(deck){return deck.units.reduce((sum,id)=>sum+(UNITS[id]?.capacity||0),0);}
export function checkDeck(s,deck){if(!deck||!Array.isArray(deck.units)||!deck.units.length||deck.units.length>3)return "Choisis entre un et trois régiments.";
 if(new Set(deck.units).size!==deck.units.length||deck.units.some(id=>!UNITS[id]||!unlocked(s,id)))return "Ce régiment n’est pas disponible dans cette campagne.";
 if(capacity(deck)>9)return "La capacité de commandement est de 9.";
 if(!Array.isArray(deck.spells)||deck.spells.length>2||new Set(deck.spells).size!==deck.spells.length||deck.spells.some(id=>!spellKnown(s,id)))return "Deux sorts connus maximum, sans doublon.";
 if(!DOCTRINES[deck.doctrine])return "Doctrine inconnue.";
 if(!["neran","tesk"].includes(deck.commander)||(deck.commander==="tesk"&&s.cleared<5))return "Ce commandant n’est pas encore disponible.";
 if(!s.inventory.some(item=>item.id===deck.weapon))return "Arme absente de l’inventaire.";return null;
}
export function prepare(s,deck){const error=checkDeck(s,deck);if(error)return error;s.deck=clone(deck);return null;}
export function xpLevel(xp){return 1+Math.floor(Math.sqrt(xp/80));}
export function roster(s,deck=s.deck){const doctrine=DOCTRINES[deck.doctrine],equipment=s.inventory.find(x=>x.id===deck.weapon)?.power||0;
 const attack=(1+s.forge.weapon*.12)*doctrine.attack,armor=(1+s.forge.armor*.15)*doctrine.hp;
 const units=deck.units.map(id=>{const type=UNITS[id],rank=s.levels[id],count=Math.floor(type.count*(1+.16*(rank-1))),unitHP=type.hp*(1+.065*(rank-1))*armor;return {id,name:type.name,icon:type.icon,count,initialCount:count,unitHP,hp:count*unitHP,maxHP:count*unitHP,attack:type.attack*(1+.1*(rank-1))*attack,hero:false};});
 const heroHP=(125+s.physical*42)*(1+s.forge.armor*.10),heroAttack=(6+s.physical*3)*(1+.035*(xpLevel(s.xp.neran)-1))*(1+equipment);
 units.push({id:"neran",name:"Néran",icon:"♛",count:1,initialCount:1,unitHP:heroHP,hp:heroHP,maxHP:heroHP,attack:heroAttack,hero:true});return units;
}
export function income(s){const memory=s.knowledge.reconstruction?1.3:1;return {bones:(.65+(s.cleared>=2?1.05:0)+(s.cleared>=5?.6:0))*memory,iron:(.16+(s.cleared>=2?.45:0)+(s.cleared>=8?.7:0))*memory};}
export function price(s,key){const discount=s.knowledge.reconstruction?.8:1;let bones=0,iron=0;
 if(key==="physical"){bones=70*Math.pow(1.55,s.physical-1);iron=15*Math.pow(1.35,s.physical-1);}
 else if(key==="weapon"){bones=35*Math.pow(1.5,s.forge.weapon);iron=30*Math.pow(1.55,s.forge.weapon);}
 else if(key==="armor"){bones=45*Math.pow(1.5,s.forge.armor);iron=25*Math.pow(1.5,s.forge.armor);}
 else if(UNITS[key]){bones=50*Math.pow(1.55,s.levels[key]-1);iron=10*Math.pow(1.4,s.levels[key]-1);}
 else return null;return {bones:Math.ceil(bones*discount),iron:Math.ceil(iron*discount)};
}
export function buy(s,key){const costs=price(s,key);if(!costs)return false;if(UNITS[key]&&!unlocked(s,key))return false;
 const level=key==="physical"?s.physical:UNITS[key]?s.levels[key]:s.forge[key];if(level>=50||Object.entries(costs).some(([k,v])=>s.resources[k]<v))return false;
 for(const [k,v]of Object.entries(costs))s.resources[k]-=v;if(key==="physical")s.physical++;else if(UNITS[key])s.levels[key]++;else s.forge[key]++;return true;
}
export function start(s,mode="progress",target){const error=checkDeck(s,s.deck);if(error)return error;if(s.battle)return "Une bataille est en cours. Mets en pause ou attends son bilan.";
 if(!["progress","farm"].includes(mode))return "Mode inconnu.";let next=mode==="progress"?Math.min(8,s.cleared+1):(target??Math.max(0,s.cleared));
 if(!Number.isInteger(next)||next<0||next>8||(mode==="farm"&&next>Math.max(0,s.cleared)))return "Palier non maîtrisé.";
 if(mode==="progress"&&s.cleared===8)return "Les trois objectifs du prototype sont accomplis.";
 s.mode=mode;s.target=next;s.running=true;s.wait=0;return null;
}
export function begin(s){const stage=STAGES[s.target];if(!stage||checkDeck(s,s.deck)){s.running=false;return;}
 const ally=roster(s);s.battle={stage:s.target,deck:clone(s.deck),allies:ally,commanderReduction:s.deck.commander==='tesk'?Math.max(.75,.85-(xpLevel(s.xp.tesk)-1)*.005):1,enemyHP:stage.hp,enemyMax:stage.hp,enemyCount:stage.count,elapsed:0,command:5,spellCD:Object.fromEntries(s.deck.spells.map(id=>[id,0])),ward:0,enemyCD:4,cast:0,healed:0,damageTaken:0,interrupts:0,events:[],initialHP:ally.reduce((v,a)=>v+a.hp,0)};
 battleEvent(s,`${stage.enemy} — ${stage.type.toLowerCase()} engagée.`);
}
function battleEvent(s,text){if(!s.battle)return;s.battle.events.unshift({time:s.battle.elapsed,text});s.battle.events=s.battle.events.slice(0,10);}
function damageParty(b,amount){for(const a of b.allies){if(amount<=0)break;const taken=Math.min(a.hp,amount);a.hp-=taken;amount-=taken;a.count=Math.max(0,Math.ceil(a.hp/a.unitHP));}}
function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function loot(s,index){const chance=random(s);if(!STAGES[index].elite&&chance>.24)return null;
 const roll=random(s),rarity=roll>.985?"Légendaire":roll>.78?"Rare":"Commun",rank=rarity==="Légendaire"?3:rarity==="Rare"?2:1;
 const item={id:s.nextItem++,name:["Bâton des veilles","Lame gravée","Sceptre d’os"][Math.floor(random(s)*3)],rarity,power:Math.min(.35,.025+index*.009+rank*.018)};
 s.inventory.push(item);while(s.inventory.length>40){const at=s.inventory.findIndex(x=>x.id!==s.deck.weapon);s.inventory.splice(at,1);}return item;
}
function end(s,won){const b=s.battle,index=b.stage,stage=STAGES[index],first=won&&index>s.cleared;let rewards={bones:0,iron:0,xp:0},item=null,unlocks=[];
 if(won){s.victories++;rewards={bones:32+index*13,iron:10+index*5,xp:22+index*10};s.resources.bones+=rewards.bones;s.resources.iron+=rewards.iron;s.xp.neran+=rewards.xp;if(b.deck.commander==="tesk")s.xp.tesk+=rewards.xp;
  item=loot(s,index);if(first){s.cleared=index;s.record=Math.max(s.record,index);s.metrics.firstClear[index]=s.elapsed;
   if(index===2){unlocks.push("Carrière capturée : production d’os et de fer augmentée.");}
   if(index===5){s.knowledge.marsh=true;s.knowledge.silence=true;unlocks.push("Libération : Tesk et les lanciers des marais sont disponibles.","Connaissance acquise : Silence profane.");}
   if(index===8){unlocks.push("Poste conquis : portion de démonstration accomplie. Essai de reconstruction disponible.");}
  }
 }else{s.defeats++;s.mode="farm";s.target=Math.max(0,index-1);note(s,`Défaite au palier ${index+1}. Retour en loot au palier ${s.target+1}.`,"warning");}
 const remaining=b.allies.reduce((v,a)=>v+a.hp,0),reasons=[];
 if(!won){if(b.healed>0)reasons.push(`Le soutien ennemi a rendu ${Math.round(b.healed)} PV. Une interruption ou plus de puissance peut aider.`);if(remaining<=0)reasons.push("La formation n’a pas tenu : renforce la ligne, sa protection ou sa puissance.");if(b.elapsed>=90)reasons.push("La bataille a dépassé 90 secondes : dégâts insuffisants.");}
 else reasons.push("Objectif remporté. Les effectifs seront reformés au prochain combat.");
 const report={won,stage:index,name:stage.name,zone:stage.zone,time:b.elapsed,rewards,item,unlocks,reasons,commander:b.deck.commander,interrupts:b.interrupts,healed:b.healed};
 s.lastReport=report;s.reports.unshift(report);s.reports=s.reports.slice(0,8);for(const msg of unlocks)note(s,msg,"unlock");if(item)note(s,`${item.rarity} : ${item.name} obtenu.`,"loot");
 if(won){if(s.mode==="progress"){if(index===8){s.running=false;s.completionNotified=true;}else s.target=index+1;}else s.target=Math.min(s.target,Math.max(0,s.cleared));}
 s.battle=null;s.wait=1.5;
}
function fight(s,dt){const b=s.battle,enemy=STAGES[b.stage];b.elapsed+=dt;b.command=Math.min(5,b.command+.8*dt);b.ward=Math.max(0,b.ward-dt);
 for(const id of b.deck.spells)b.spellCD[id]=Math.max(0,b.spellCD[id]-dt);
 if(enemy.healing){if(b.cast>0){b.cast=Math.max(0,b.cast-dt);if(b.cast===0){const heal=Math.min(enemy.healing,b.enemyMax-b.enemyHP);b.enemyHP+=heal;b.healed+=heal;b.enemyCD=7;battleEvent(s,`Le soutien restaure ${Math.round(heal)} PV ennemis.`);}}
  else{b.enemyCD-=dt;if(b.enemyCD<=0){b.cast=2;battleEvent(s,"Le soutien prépare un soin. Fenêtre d’interruption ouverte.");}}}
 for(const id of b.deck.spells){const spell=SPELLS[id];if(b.spellCD[id]>0||b.command<spell.cost)continue;const partyRatio=b.allies.reduce((sum,a)=>sum+a.hp,0)/b.initialHP;
  if(id==="silence"&&b.cast<=0)continue;if(id==="ward"&&(partyRatio>.78||b.ward>0))continue;
  b.command-=spell.cost;b.spellCD[id]=spell.cooldown;
  if(id==="bolt"){b.enemyHP-=58*(b.deck.commander==="neran"?1.25:1)*(s.knowledge.reconstruction?1.3:1);battleEvent(s,"Trait funèbre frappe la force ennemie.");}
  if(id==="ward"){b.ward=5;battleEvent(s,"Rempart d’ossements protège la formation.");}
  if(id==="silence"){b.cast=0;b.enemyCD=7;b.interrupts++;battleEvent(s,"Silence profane interrompt le soutien ennemi.");}
 }
 const dps=b.allies.reduce((sum,a)=>sum+a.count*a.attack,0);b.enemyHP=Math.max(0,b.enemyHP-dps*dt);
 if(b.enemyHP<=0){end(s,true);return;}
 const scale=.55+.45*b.enemyHP/b.enemyMax,damage=enemy.dps*scale*b.commanderReduction*(b.ward>0?.55:1)*dt;
 b.damageTaken+=damage;damageParty(b,damage);b.enemyCount=Math.ceil(enemy.count*b.enemyHP/b.enemyMax);
 if(b.allies.every(a=>a.hp<=0)||b.elapsed>=90)end(s,false);
}
export function tick(s,seconds){if(!bounded(seconds,0,3600))throw Error("Durée invalide");let remaining=seconds;while(remaining>1e-8){const dt=Math.min(.2,remaining);remaining-=dt;s.elapsed+=dt;const gains=income(s);for(const k of ["bones","iron"])s.resources[k]=Math.min(1e12,s.resources[k]+gains[k]*dt);
 if(s.running){if(s.mode==="farm")s.metrics.farmSeconds+=dt;if(!s.battle){s.wait-=dt;if(s.wait<=0)begin(s);}if(s.battle)fight(s,dt);}}
 return s;
}
export function reconstruct(s){if(s.cleared<8)return "Termine les trois objectifs avant cet essai.";const next=fresh();next.knowledge={...s.knowledge,reconstruction:true};next.record=s.record;next.cycle=s.cycle+1;next.knowledge.marsh=true;note(next,"Essai de reconstruction : savoir conservé, corps, armes et armées à rebâtir.","unlock");return next;}
export function snapshot(s){const out=clone(s);out.battle=null;out.running=false;out.wait=0;return out;}
export function restore(raw){if(!raw||raw.version!==1)throw Error("Format de sauvegarde non reconnu.");const s=fresh();
 for(const key of ["bones","iron"]){if(!bounded(raw.resources?.[key],0,1e12))throw Error("Ressources invalides.");s.resources[key]=raw.resources[key];}
 for(const key of ["physical","nextItem","cycle","victories","defeats"]){if(!Number.isSafeInteger(raw[key])||raw[key]<(key==="physical"||key==="nextItem"?1:0)||raw[key]>1e9)throw Error("Compteur invalide.");s[key]=raw[key];}
 if(s.physical>50)throw Error("Niveau non pris en charge.");
 for(const key of Object.keys(UNITS)){if(!Number.isInteger(raw.levels?.[key])||!bounded(raw.levels[key],1,50))throw Error("Régiment invalide.");s.levels[key]=raw.levels[key];}
 for(const key of ["weapon","armor"]){if(!Number.isInteger(raw.forge?.[key])||!bounded(raw.forge[key],0,50))throw Error("Forge invalide.");s.forge[key]=raw.forge[key];}
 for(const key of ["neran","tesk"]){if(!bounded(raw.xp?.[key],0,1e9))throw Error("XP invalide.");s.xp[key]=raw.xp[key];}
 for(const key of ["cleared","record"]){if(!Number.isInteger(raw[key])||!bounded(raw[key],-1,8))throw Error("Progression invalide.");s[key]=raw[key];}if(s.record<s.cleared)throw Error("Record invalide.");
 if(!Array.isArray(raw.inventory)||!raw.inventory.length||raw.inventory.length>40)throw Error("Inventaire invalide.");const ids=new Set();s.inventory=raw.inventory.map(item=>{if(!item||!Number.isSafeInteger(item.id)||item.id<1||ids.has(item.id)||typeof item.name!=="string"||item.name.length>80||!["Commun","Rare","Légendaire"].includes(item.rarity)||!bounded(item.power,0,.35))throw Error("Arme invalide.");ids.add(item.id);return {id:item.id,name:item.name,rarity:item.rarity,power:item.power};});if(s.nextItem<=Math.max(...ids))throw Error("Identifiants d’objets invalides.");
 for(const key of Object.keys(s.knowledge)){if(typeof raw.knowledge?.[key]!=="boolean")throw Error("Connaissance invalide.");s.knowledge[key]=raw.knowledge[key];}
 if(s.cleared>=5&&(!s.knowledge.silence||!s.knowledge.marsh))throw Error("Déblocages incohérents.");if(s.cycle>0&&!s.knowledge.reconstruction)throw Error("Reconstruction incohérente.");
 const deck=raw.deck;if(checkDeck(s,deck))throw Error("Formation invalide.");s.deck=clone(deck);s.mode=["farm","progress"].includes(raw.mode)?raw.mode:"farm";s.target=s.mode==="progress"?Math.min(8,s.cleared+1):Math.max(0,Math.min(s.cleared,Number.isInteger(raw.target)?raw.target:0));
 s.elapsed=bounded(raw.elapsed,0,1e9)?raw.elapsed:0;s.speed=[1,4,12].includes(raw.speed)?raw.speed:1;s.seed=Number.isInteger(raw.seed)?raw.seed>>>0:314159;s.completionNotified=s.cleared===8;
 // Logs/reports are presentation, not authority: no imported HTML, history or partial battle is trusted.
 note(s,"Sauvegarde chargée. L’expédition attend votre ordre.");return s;
}
