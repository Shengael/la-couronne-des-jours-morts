const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..','_site'),prefix='/la-couronne-des-jours-morts/';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(path.dirname(path.dirname(process.execPath)),'node_modules/playwright'));
let browser;
(async()=>{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],missing=[],loaded=new Set();
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!=='https://pages.test'||!u.pathname.startsWith(prefix)){missing.push(u.pathname);return route.abort();}
  const relative=decodeURIComponent(u.pathname.slice(prefix.length))||'index.html',file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
  try{const body=fs.readFileSync(file);loaded.add(relative);return route.fulfill({status:200,contentType:({'.html':'text/html','.mjs':'text/javascript','.css':'text/css'})[path.extname(file)]||'application/octet-stream',body});}catch{missing.push(relative);return route.fulfill({status:404,body:''});}
 });
 await page.clock.install();await page.goto('https://pages.test'+prefix);
 assert(await page.locator('.prologue-page').isVisible());assert.equal(await page.locator('.topbar').isVisible(),false);
 await page.locator('[data-action="finish-prologue"]').click();await page.locator('[data-action="guide-skip"]').click();
 await page.locator('[data-action="start"][data-zone="refuge"]').click();await page.clock.runFor(35000);
 assert(await page.locator('[data-screen="kingdom"]').isVisible());
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('couronne.frontier.v2')));
 const saved=await read();assert.equal(saved.groups.settlers.total,18);await page.reload();assert.equal((await read()).groups.settlers.total,18);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'build-info.json'),'utf8'));assert(manifest.files.every(f=>loaded.has(f)),JSON.stringify([...loaded]));
 await page.screenshot({path:path.join(__dirname,'reports','pages-preview.png')});
 fs.writeFileSync(path.join(__dirname,'reports','pages-preview.json'),JSON.stringify({passed:true,basePath:prefix,width:390,assets:loaded.size,firstLiberation:true,reloadPreservesSave:true,pageErrors:errors,missingAssets:missing},null,2));
 console.log('PASS GitHub Pages subdirectory: all 17 assets, mobile, first victory and persistent save');await context.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();});
