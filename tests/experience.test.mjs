import test from 'node:test'
import assert from 'node:assert/strict'
import {loadArticles,loadContent} from '../src/load-content.mjs'
import {loadOntology} from '../src/nexus.mjs'
import {auditKnowledge} from '../src/kcs-audit.mjs'
import {loadExperience,validateExperience,composeModel,searchRecords} from '../src/model.mjs'
import {homeView,taskView,servicesView,serviceView,offeringView,knowledgeView} from '../src/views.mjs'
import {shell} from '../src/render.mjs'
import {search} from '../src/search.mjs'
import {audiencesForService,serviceAudiences} from '../src/service-audiences.mjs'

const load=async()=>{
 const [services,offerings,articles,ontology,{journeys,experience}]=await Promise.all([loadContent('services'),loadContent('offerings'),loadArticles(),loadOntology(),loadExperience()])
 return {services,offerings,articles,journeys,experience,model:composeModel({services,offerings,articles,ontology,quality:auditKnowledge(articles),journeys,experience})}
}
const ctx=load()

test('homepage leads with tasks and still reaches every service',async()=>{
 const {services,model}=await ctx
 const html=homeView(model,'/uit')
 assert.equal((html.match(/data-service-card/g)||[]).length,22)
 for(const s of services){assert.ok(html.includes('href="/uit/services/'+s.id+'/"'),s.id);assert.ok(html.includes(s.summary),s.id)}
 assert.ok(html.includes('data-finder'),'search is the first entry point')
 for(const j of model.topTasks)assert.ok(html.includes('href="/uit/tasks/'+j.id+'/"'),j.id)
 assert.ok(html.includes('data-audience-filter="home-services"'))
 assert.ok(html.includes('id="service-count"'))
 assert.ok(!html.includes('https://www.yorku.ca/uit/infosec/duo/'))
})

test('audience categories cover every service without inventing student access',async()=>{
 const services=await loadContent('services')
 assert.equal(Object.keys(serviceAudiences).length,22)
 for(const s of services){const roles=audiencesForService(s);assert.ok(roles.length&&roles.every(r=>['student','employee'].includes(r)),s.id);assert.equal(new Set(roles).size,roles.length)}
 assert.deepEqual(audiencesForService({id:'github'}),['employee'])
})

test('guided tasks validate and every step cites existing York guidance',async()=>{
 const {services,offerings,articles,journeys,experience,model}=await ctx
 assert.deepEqual(validateExperience({journeys,experience},{articles,offerings,services}),[])
 assert.equal(model.journeys.size,8)
 const ids=new Set(articles.map(a=>a.id))
 for(const j of model.journeys.values()){
  const html=taskView(model,j,'/uit')
  assert.ok(html.includes('Still stuck'),j.id)
  for(const b of j.branches)for(const s of b.steps)if(s.article)assert.ok(ids.has(s.article),j.id+' '+s.article)
  assert.ok(!html.includes('Validated'),j.id+' must not claim validation')
 }
})

test('task language finds the right guided task while named products still win',async()=>{
 const {model}=await ctx
 const rows=searchRecords(model)
 assert.equal(search(rows,'lost phone')[0].id,'lost-device')
 assert.equal(search(rows,'forgot password')[0].id,'forgot-password')
 assert.equal(search(rows,'connect to wifi')[0].id,'connect-wifi')
 assert.equal(search(rows,'1Password')[0].type==='task',false)
 assert.ok(rows.filter(r=>r.type==='article').every(r=>r.summary!==r.title))
})

test('Passport York unifies offerings, tasks and all of its guidance',async()=>{
 const {model}=await ctx
 const s=model.services.get('passport-york'),html=serviceView(model,s,'/uit')
 const guides=s.visibleArticles.length
 assert.equal(guides,33)
 assert.equal(s.topics.reduce((n,t)=>n+t.articles.length,0),guides)
 for(const o of s.offerings)assert.ok(html.includes('/uit/offerings/'+o.id+'/'),o.id)
 for(const j of [...model.journeys.values()].filter(j=>j.service_id==='passport-york'))assert.ok(html.includes('/uit/tasks/'+j.id+'/'),j.id)
 assert.ok(html.includes('About this service'))
 assert.ok(html.includes('Every Wednesday from 5:00 to 7:00 AM'),'the sourced maintenance schedule is shown')
})

test('every service offering is linked to its own action and scoped knowledge',async()=>{
 const {services,articles,offerings,model}=await ctx
 assert.equal(offerings.length,75)
 assert.equal(new Set(offerings.map(o=>o.id)).size,75)
 const byId=new Map(articles.map(a=>[a.id,a])),families=new Set(services.map(s=>s.id))
 for(const o of offerings){
  assert.ok(families.has(o.parent_service_id),o.id)
  assert.ok(o.summary.length>20,o.id)
  assert.ok(o.actions.some(a=>a.label&&a.url),o.id)
  assert.ok(o.article_ids.length>0&&o.article_ids.every(id=>byId.has(id)),o.id)
  const page=offeringView(model,model.offerings.get(o.id),'/test')
  for(const text of ['Get started','Knowledge and instructions','Who can use it','What you can do',o.actions[0].label])assert.ok(page.includes(text),o.id+' '+text)
  assert.ok(page.includes('href="/test/knowledge/'),o.id)
 }
})

test('catalogue lists all offerings with search, service and audience filters',async()=>{
 const {model}=await ctx
 const page=servicesView(model,'/uit')
 assert.equal((page.match(/data-offering(?![a-z-])/g)||[]).length,75)
 for(const id of ['oc-query','oc-category','oc-count','oc-empty'])assert.ok(page.includes('id="'+id+'"'),id)
 for(const r of ['student','employee','visitor'])assert.ok(page.includes('data-oc-audience="'+r+'"'),r)
 for(const id of ['1password-vault','eduroam','eclass','turnitin'])assert.ok(page.includes('/uit/offerings/'+id+'/'),id)
})

test('service and offering names are escaped and offering rows never nest links',async()=>{
 const {services,offerings,articles,journeys,experience}=await ctx
 const ontology=await loadOntology()
 const unsafe='<b onclick=x>&'
 const model=composeModel({services:services.map((s,i)=>i?s:{...s,name:unsafe,summary:unsafe}),offerings:offerings.map((o,i)=>i?o:{...o,name:unsafe,summary:unsafe}),articles,ontology,quality:auditKnowledge(articles),journeys,experience})
 for(const html of [homeView(model,'/uit'),servicesView(model,'/uit')]){
  assert.ok(!html.includes(unsafe),'raw markup leaked')
  assert.ok(html.includes('&lt;b onclick=x&gt;&amp;'),'escaped name rendered')
 }
 const catalogue=servicesView(model,'/uit')
 for(const row of catalogue.match(/<li[^>]*data-offering[\s\S]*?<\/li>/g)){
  let depth=0
  for(const tag of row.match(/<\/?a[\s>]/g)||[]){depth+=tag.startsWith('</')?-1:1;assert.ok(depth<=1,'nested link in offering row')}
 }
})

test('all offerings explain what they are, who uses them, and what users can do',async()=>{
 const {offerings,model}=await ctx
 for(const o of offerings){
  assert.ok(o.description.length>85,o.id);assert.ok(o.who_uses_it.length>20,o.id);assert.ok(o.use_cases.length>=3,o.id);assert.ok(o.access_note.length>20,o.id)
 }
 const sharepoint=offerings.find(x=>x.id==='sharepoint')
 assert.equal(sharepoint.actions[0].url,'https://yuoffice.sharepoint.com/')
 assert.ok(sharepoint.description.includes('team sites'))
 assert.equal(offerings.find(x=>x.id==='outlook').actions[0].url,'https://outlook.office.com/')
 const detail=offeringView(model,model.offerings.get('sharepoint'))
 assert.ok(detail.includes('Open York SharePoint')&&detail.includes('yuoffice.sharepoint.com'))
})

test('knowledge index searches every guide without disclaimers or false validation',async()=>{
 const {model}=await ctx
 const html=knowledgeView(model,'/uit'),total=model.articles.size
 assert.ok(html.includes('id="article-filter"')&&html.includes('Search '),'large guide search')
 assert.ok(html.includes('id="kb-count"'))
 assert.ok(!/class="(honesty|caution|reader-state)"/.test(html),'no disclaimer blocks')
 assert.ok(!html.includes('Imported draft'),'draft state is not repeated on every row')
 if(![...model.articles.values()].some(a=>a.state==='validated'))assert.ok(!html.includes('Validated'))
 assert.ok(total>0)
})

test('shell escapes titles, keeps search reachable and avoids inline script or style',()=>{
 const html=shell('A <b> & c','<p>x</p>',{support:{channels:[]}})
 assert.ok(html.includes('A &lt;b&gt; &amp; c'))
 assert.ok(html.includes('data-palette-open')&&html.includes('href="/search/"'))
 assert.ok(!/<script(?![^>]*(type="module"|type="application\/json"))/.test(html))
 assert.ok(!/\sstyle="/.test(html))
})
