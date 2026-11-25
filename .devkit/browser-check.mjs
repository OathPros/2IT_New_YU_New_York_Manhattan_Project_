import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const here=dirname(fileURLToPath(import.meta.url));
const require=createRequire(join(here,'../package.json'));
const idx=process.argv.indexOf('--base');
if(idx<0 || !process.argv[idx+1]) throw Error('Usage: node .devkit/browser-check.mjs --base http://localhost:3000');
const base=new URL(process.argv[idx+1]);
if(!['http:','https:'].includes(base.protocol)||!['localhost','127.0.0.1','[::1]'].includes(base.hostname)) throw Error('Use a local preview URL only.');
const { chromium }=require('playwright');
const cfg=JSON.parse(await readFile(join(here,'browser-targets.json'),'utf8'));
const out=join(here,'artifacts',new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});
const browser=await chromium.launch();const results=[];
try{
 for(const route of cfg.routes){
  const url=new URL(route,base);if(url.origin!==base.origin)throw Error('External route blocked: '+route);
  for(const viewport of cfg.viewports){
   const page=await browser.newPage({viewport});const errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   const record={route,viewport,errors};results.push(record);
   try{
    const response=await page.goto(url.href,{waitUntil:'load',timeout:30000});record.status=response?.status()??null;
    await page.evaluate(()=>document.fonts.ready);
    record.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    record.screenshot=`${results.length}-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({path:join(out,record.screenshot),fullPage:true,animations:'disabled'});
   }catch(e){record.failure=e.message}finally{await page.close()}
  }
 }
}finally{await browser.close();await writeFile(join(out,'report.json'),JSON.stringify(results,null,2));}
console.log('Evidence:',out);console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.failure||r.status===null||r.status>=400||r.overflow||r.errors.length))process.exitCode=1;
