import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {search,validateArticle} from '../src/search.mjs'
import {reader} from '../src/render.mjs'
import {loadContent} from '../src/load-content.mjs'
test('retrieval enforces audience context and excludes flagged instructions',()=>{const rows=[{id:'student',title:'Open student email',text:'email gmail',audiences:['student'],type:'article'},{id:'employee',title:'Open work email',text:'email outlook',audiences:['employee'],type:'article'},{id:'bad',title:'Old email instructions',text:'email',audiences:['all'],blocked:true,type:'article'}];const found=search(rows,'email',{audience:'student'});assert.deepEqual(found.map(x=>x.id),['student'])})
test('unsafe markup and unsupported validation claims fail checks',()=>{const a={id:'test',slug:'test',title:'Test',issue:'Test',environment:['York'],resolution_html:'<script>alert(1)</script>',source_urls:['https://www.yorku.ca/uit/'],state:'validated'};assert.equal(validateArticle(a).length,2)})
test('popup and permanent page share the same content and escape text',()=>{const a={id:'test',slug:'test',title:'<unsafe>',type:'How to',service_id:'email',issue:'Issue',environment:['York'],resolution_html:'<ol><li>First</li><li>Second</li></ol>',captured_at:'2026-11-09',source_urls:['https://www.yorku.ca/uit/']};for(const popup of [true,false]){const html=reader(a,{popup});assert.ok(html.includes('&lt;unsafe&gt;'));assert.ok(html.includes(a.resolution_html));assert.ok(!html.includes('<dt>Cause</dt>'))}assert.ok(reader(a,{popup:true}).includes('/knowledge/test/'))})
test('every imported content block is assigned and posts are excluded',async()=>{const rows=await loadContent('ledger');for(const r of rows){assert.ok(!/\/\d{4}\/\d{2}\//.test(r.source_url));if(r.state==='structured')assert.equal(new Set(r.assignments.map(x=>x.block_id)).size,r.source_block_count,r.source_url)}})
test('source exports contain no bearer style JWT values',async()=>{const directory=new URL('../content/sources/',import.meta.url);for(const name of await fs.readdir(directory)){if(!name.endsWith('.json'))continue;const content=await fs.readFile(new URL(name,directory),'utf8');assert.ok(!/(?<![A-Za-z0-9_-])eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(content),name)}})

test('every committed collection resolves to complete records',async()=>{
 for(const name of ['articles','services','pages','ledger','assets']){
  const rows=await loadContent(name)
  assert.ok(rows.length>0,name)
  assert.ok(rows.every(row=>row&&typeof row==='object'&&!Array.isArray(row)),name)
 }
 await assert.rejects(()=>loadContent('../sources'),/Invalid content collection/)
})
test('reader shows evidence-backed review state in both views',()=>{
 const a={id:'reviewed',slug:'reviewed',title:'Reviewed guidance',type:'How to',service_id:'email',issue:'Issue',environment:['York'],resolution_html:'<p>Answer</p>',captured_at:'2026-11-09',source_urls:['https://www.yorku.ca/uit/'],state:'validated',reviewed_at:'2026-11-09'}
 for(const popup of [true,false]){
  const html=reader(a,{popup})
  assert.ok(html.includes('Reviewed 2026-11-09'))
  assert.ok(!html.includes('Not validated'))
 }
 assert.ok(reader({...a,reviewed_at:null}).includes('No validation date recorded'))
})

test('authentication and unrelated redirect responses never become public content',async()=>{
 const ledger=await loadContent('ledger'),blocked=new Set(ledger.filter(r=>['protected','redirected_outside_scope'].includes(r.state)).map(r=>r.source_url))
 for(const a of await loadContent('articles'))for(const url of a.source_urls)assert.ok(!blocked.has(url),url)
 for(const p of await loadContent('pages'))assert.ok(!blocked.has(p.source_url),p.source_url)

})

test('generic sign in failures prioritize Passport York without overriding named products',()=>{
 const rows=[{id:'passport-york',type:'service',title:'Passport York',text:'Sign in and manage your account',audiences:['all']},{id:'password',type:'article',title:'Recover your forgotten Passport York password',text:'Recover password',audiences:['all']},{id:'vendor',type:'article',title:'Sign in to your York 1Password account',text:'1Password account',audiences:['all']}]
 assert.equal(search(rows,'I cannot sign in')[0].id,'passport-york')
 assert.equal(search(rows,'I cannot sign in')[1].id,'password')
 assert.equal(search(rows,'I cannot sign in to 1Password')[0].id,'vendor')
})

test('Passport York recovery links to complete methods and keeps the Email rewrite',async()=>{
 const {loadArticles}=await import('../src/load-content.mjs')
 const articles=await loadArticles(),byId=new Map(articles.map(a=>[a.id,a]))
 assert.equal(byId.get('UIT-KA-9B42BE286CDC').title,'Create an email signature in Outlook for Windows')
 for(const id of ['UIT-KA-300BB058F717','UIT-KA-5869E88374F4']){
  const a=byId.get(id)
  assert.ok(!a.resolution_html.includes('#current-'))
  assert.ok(!a.resolution_html.includes('/knowledge/'+a.slug+'/'))
  for(const match of a.resolution_html.matchAll(/href="(\/knowledge\/[^"]+)"/g))assert.ok(articles.some(x=>'/knowledge/'+x.slug+'/'===match[1]))
 }
})
