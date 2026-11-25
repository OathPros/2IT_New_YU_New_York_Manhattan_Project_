// Local visual evidence capture. Playwright is resolved from NODE_PATH or a local tool cache so the
// project itself stays free of npm dependencies
// Usage: node scripts/capture.mjs --base http://localhost:3000 --out .devkit/artifacts/name [--routes /,/search/?q=wifi] [--full]
import {mkdir,writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i>=0?process.argv[i+1]:fallback}
let playwright
for(const from of [path.join(root,'package.json'),path.join(root,'.cache','tools','package.json')]){try{playwright=createRequire(from)('playwright');break}catch{}}
if(!playwright)throw new Error('Playwright is unavailable. Install it outside the project, for example in .cache/tools')
const base=new URL(arg('base','http://localhost:3000'))
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname))throw new Error('Capture local previews only')
const out=path.resolve(root,arg('out','.devkit/artifacts/capture'))
const routes=arg('routes','/,/offerings/passport-account/,/services/passport-york/,/search/?q=lost%20phone,/knowledge/,/help/').split(',')
const viewports=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]
await mkdir(out,{recursive:true})
const browser=await playwright.chromium.launch(),report=[]
try{
 for(const route of routes)for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},reducedMotion:'reduce'}),errors=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})
  const url=new URL(route,base),file=(route.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')||'home')+'-'+vp.name+'.png'
  const response=await page.goto(url.href,{waitUntil:'networkidle'})
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForTimeout(250)
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)
  await page.screenshot({path:path.join(out,file),fullPage:process.argv.includes('--full')||true,animations:'disabled'})
  report.push({route,viewport:vp.name,status:response?.status(),overflow,errors,file})
  await page.close()
 }
}finally{await browser.close()}
await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2))
console.log(JSON.stringify(report.map(r=>[r.route,r.viewport,r.status,r.overflow?'OVERFLOW':'',r.errors.join(' ')].join(' ').trim()),null,1))
