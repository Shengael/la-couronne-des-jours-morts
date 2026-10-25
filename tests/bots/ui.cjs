const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

// This is a keyboard/DOM/layout heuristic, not a screen-reader certification or user study.
async function uiCases(record,{root,reports,milestone}){
 let browser;
 try{
  let playwright;
  try{playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');}
  catch{playwright=require(path.join(path.dirname(path.dirname(process.execPath)),'node_modules/playwright'));}
  const {developed,chapterTwo,completedChapter}=await import(pathToFileURL(path.join(root,'tests/bots/model.mjs')).href);
  const C=await import(pathToFileURL(path.join(root,'campaign.mjs')).href);
  browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  for(const width of [320,390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.setDefaultTimeout(5000);
   page.on('pageerror',error=>errors.push(error.message));
   page.on('dialog',dialog=>dialog.accept()); // Only isolated synthetic fixtures are imported.
   await page.route('**/*',async route=>{
    const url=new URL(route.request().url());if(url.origin!=='http://couronne-bots.test')return route.abort();
    const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
    if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
    try{await route.fulfill({status:200,contentType:({'.html':'text/html','.mjs':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});}catch{return route.fulfill({status:404,body:''});}
   });
   await page.clock.install({time:new Date(100000)});
   await page.clock.pauseAt(new Date(100010));
   await record(`ui.${width}.initial-context`,'ui',async()=>{
    await page.goto('http://couronne-bots.test');
    assert(await page.locator('.prologue-page').isVisible(),'Initial contextual page missing');assert.equal(await page.locator('.topbar').isVisible(),false,'Prologue must hide resources');assert.equal(await page.locator('.prototype-strip').isVisible(),false,'Prologue must hide gameplay status');
    const before=await page.locator('#stock').textContent();await page.clock.runFor(20000);assert.equal(await page.locator('#stock').textContent(),before,'Reading context advanced resources');
    assert.equal(await page.locator('html').getAttribute('lang'),'fr');
    assert(await page.locator('main').count());
    assert.equal(await page.locator('[data-action="finish-prologue"]').count(),1);
    return {width,contextPresent:true,readingPausesTime:true};
   },`Fresh browser context ${width}px; load index; clock+20s; compare stock`);
   // Synthetic unlocked fixture covers layouts without mutating a user's browser/save.
   const fixture=developed();fixture.troops.guards.count=8;fixture.deck.units=['guards'];fixture.knowledge.bolt=true;fixture.deck.spells=['bolt'];fixture.savedAt=120000;
   // Inject after pagehide: the departing application intentionally saves on pagehide.
   await page.addInitScript(raw=>{if(!sessionStorage.getItem('bot.fixture.loaded')){localStorage.setItem('couronne.frontier.v2',JSON.stringify(raw));sessionStorage.setItem('bot.fixture.loaded','1');}},C.snapshot(fixture,120000));
   await page.reload();
   if(await page.locator('[data-action="dismiss-offline"]').count())await page.locator('[data-action="dismiss-offline"]').click();
   for(const screen of ['world','kingdom','army'])await record(`ui.${width}.${screen}`,'ui',async()=>{
    await page.locator(`[data-screen="${screen}"]`).click();
    const audit=await page.evaluate(()=>{
     const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
     const controls=[...document.querySelectorAll('button,input,select,textarea,a[href]')].filter(visible);
     const label=el=>el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')?.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ')||(el.labels?[...el.labels].map(l=>l.textContent).join(' '):'')||el.textContent||el.getAttribute('title')||'';
     return {overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
      unnamed:controls.filter(el=>!label(el).trim()).map(el=>({tag:el.tagName,id:el.id,type:el.type})),
      compactTargets:controls.filter(el=>{const r=el.getBoundingClientRect();return !el.disabled&&(r.width<24||r.height<24);}).map(el=>({tag:el.tagName,label:label(el).trim().slice(0,60)})),
      symbolicNames:controls.filter(el=>/^[+−↑↓]$/.test(label(el).trim())&&!el.getAttribute('aria-label')).map(el=>({label:label(el).trim(),context:el.closest('article,section')?.querySelector('h3')?.textContent||''})),
      horizontalControls:controls.filter(el=>{const r=el.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5;}).length,
      activeStatusRegions:document.querySelectorAll('[role="status"],[aria-live]').length};
    });
    assert(audit.overflow<=1,`Horizontal overflow ${audit.overflow}px`);
    assert.equal(audit.horizontalControls,0,'Interactive controls extend outside viewport');
    assert.equal(audit.unnamed.length,0,`Controls without name: ${JSON.stringify(audit.unnamed)}`);
    await page.locator('body').click({position:{x:1,y:1}});let focusable=false;
    for(let n=0;n<8;n++){await page.keyboard.press('Tab');if(await page.evaluate(()=>['BUTTON','INPUT','SELECT','A','SUMMARY'].includes(document.activeElement.tagName)))focusable=true;}
    assert(focusable,'No interactive control reached with Tab');
    const screenshot=`${milestone}-${width}-${screen}.png`;await page.screenshot({path:path.join(reports,screenshot),fullPage:true});
    return {...audit,width,screen,keyboardReachesControls:true,screenshot,observations:[...(audit.compactTargets.length?['Compact input targets need contextual spacing / touch review.']:[]),...(audit.symbolicNames.length?['Symbol-only controls need accessible names including affected group/site.']:[])]};
   },`Isolated developed fixture; viewport${width}; navigate ${screen}; DOM audit;8 Tabs`);
   await record(`ui.${width}.invalid-import-transaction`,'ui',async()=>{
    // Flush normal navigation metadata through the existing no-file change path,
    // then compare at a stopped clock. Otherwise normal autosave looks like import damage.
    await page.locator('#save-file').dispatchEvent('change');
    const previous=await page.evaluate(()=>localStorage.getItem('couronne.frontier.v2'));
    const bad=C.snapshot(fixture,120000);bad.resources.bones=-1;
    await page.locator('#save-file').setInputFiles({name:'invalid-bot.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Import refusé'));
    assert.equal(await page.evaluate(()=>localStorage.getItem('couronne.frontier.v2')),previous,'Invalid import overwrote current local save');
    assert.deepEqual(errors,[],'Browser uncaught errors');return {rejected:true,preserved:true,browserErrors:errors};
   },`viewport${width}; inject invalid JSON into #save-file; compare localStorage exact text`);
   if(width===1440&&C.Saga)await record('ui.imported-presentation-escaping','ui',async()=>{
    const payload=C.snapshot(fixture,120000);payload.saga.scenes=[{id:'chapter-1',title:'<img src=x onerror="window.__botInjected=1">',text:'<script>window.__botInjected=1</script>',chapter:1}];
    await page.locator('#save-file').setInputFiles({name:'presentation-bot.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))});
    await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Campagne importée'));
    assert(await page.locator('.saga-story').isVisible(),'Imported scene was not rendered, so its escaping could not be checked');
    assert((await page.locator('.saga-story').textContent()).includes('<img src=x'),'Payload was not exercised as rendered text');
    assert.equal(await page.evaluate(()=>window.__botInjected),undefined,'Imported text executed JavaScript');
    assert.equal(await page.locator('#view img[src="x"],#view script').count(),0,'Imported narrative was inserted as executable markup');
    const frozen=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));
    assert(frozen.tutorialPaused,'Story reading was not persisted as paused');
    await page.clock.runFor(20000);await page.reload();
    assert(await page.locator('.saga-story').isVisible(),'Story reading was lost on reload');
    const reloaded=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));
    assert.deepEqual(reloaded.resources,frozen.resources,'Reading/reload granted offline resources');
    assert.equal(reloaded.elapsed,frozen.elapsed,'Reading advanced simulation time');
    assert.deepEqual(reloaded.jobs,frozen.jobs,'Reading advanced jobs');
    return {payloadRenderedAsText:true,scriptDidNotExecute:true,executableMarkupAbsent:true,readingPausesTime:true,readingSurvivesReload:true};
   },'Import synthetic scene with img onerror/script tags; confirm import; inspect DOM and window marker');
   if(width===1440&&C.Saga)await record('ui.advanced-development-reload','ui',async()=>{
    const advanced=chapterTwo();await page.locator('#save-file').setInputFiles({name:'chapter-fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(C.snapshot(advanced,140000)))});
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')).saga.chapter===2);
    await page.locator('[data-screen="kingdom"]').click();
    await page.locator('[data-action="legion-job"][data-kind="recruit"][data-target="vampires"]:not([data-goal])').click();
    await page.clock.runFor(5000);
    const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));assert(before.legion.jobs.some(j=>j.kind==='recruit'&&j.target==='vampires'&&j.progress>0),'Advanced task did not progress');
    await page.reload();await page.locator('[data-screen="kingdom"]').click();
    const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));assert(after.legion.jobs.some(j=>j.kind==='recruit'&&j.target==='vampires'&&j.progress>0),'Advanced task lost on reload');
    await page.clock.runFor(35000);await page.locator('[data-screen="army"]').click();
    assert.equal(await page.locator('[data-legion-key="units"][data-legion-id="vampires"]').isEnabled(),true,'Trained advanced regiment cannot be equipped');
    assert.deepEqual(errors,[]);return {advancedJobPersists:true,recruitmentCompletes:true,navigationWorks:true};
   },'chapterTwo synthetic valid snapshot; import; queue one advanced recruit; clock5s; reload; clock35s; army equip available');
   if(width===1440&&C.Saga)for(const reading of [{id:'ascension',chapter:1,action:'ascension-review'},{id:'ending',chapter:4,action:'ending-review'}])await record(`ui.reading.${reading.id}-freeze`,'ui',async()=>{
    const prepared=completedChapter(reading.chapter);
    await page.locator('#save-file').setInputFiles({name:'reading-fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(C.snapshot(prepared,180000)))});
    await page.waitForFunction(chapter=>JSON.parse(localStorage.getItem('couronne.frontier.v2')).saga.chapter===chapter,reading.chapter);
    await page.locator(`[data-action="${reading.action}"]`).click();
    const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));assert(before.tutorialPaused);
    await page.clock.runFor(20000);
    const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));assert.deepEqual(after.resources,before.resources);assert.equal(after.elapsed,before.elapsed);assert.deepEqual(after.jobs,before.jobs);
    return {reading:reading.id,twentySecondsPaused:true,resourcesUnchanged:true};
   },`completedChapter(${reading.chapter}) synthetic valid fixture; import; click${reading.action}; clock20s; compare resources/elapsed/jobs`);
   await context.close();
  }
 }finally{if(browser)await browser.close();}
}
module.exports={uiCases};
