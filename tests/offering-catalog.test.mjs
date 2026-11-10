import test from 'node:test'
import assert from 'node:assert/strict'
import {loadArticles,loadContent} from '../src/load-content.mjs'
import {offeringHome,offeringDetail,serviceFamily,offerCard} from '../src/offering-render.mjs'

test('every service offering is linked to its own action and scoped knowledge',async()=>{
 const [offers,services,articles]=await Promise.all([loadContent('offerings'),loadContent('services'),loadArticles()])
 assert.equal(offers.length,75)
 assert.equal(new Set(offers.map(o=>o.id)).size,75)
 const byId=new Map(articles.map(a=>[a.id,a])),families=new Map(services.map(s=>[s.id,s]))
 for(const o of offers){
  assert.ok(families.has(o.parent_service_id),o.id)
  assert.ok(o.summary.length>20,o.id)
  assert.ok(o.actions.some(a=>a.label&&a.url),o.id)
  assert.ok(o.article_ids.length>0,o.id)
  assert.ok(o.article_ids.every(id=>byId.has(id)),o.id)
  const page=offeringDetail(o,services,articles,offers,'/test')
  assert.ok(page.includes('Get started'),o.id)
  assert.ok(page.includes('Knowledge and instructions'),o.id)
  assert.ok(page.includes(o.actions[0].label),o.id)
  assert.ok(page.includes('href="/test/knowledge/'),o.id)
 }
})

test('homepage shows all offering cards with action and knowledge links',async()=>{
 const [offers,services,articles]=await Promise.all([loadContent('offerings'),loadContent('services'),loadArticles()])
 const page=offeringHome(offers,services,articles,'/uit')
 assert.equal((page.match(/data-offering(?![a-z])/g)||[]).length,75)
 assert.ok(page.includes('id="oc-query"'))
 assert.ok(page.includes('id="oc-category"'))
 assert.ok(page.includes('data-oc-audience="student"'))
 assert.ok(page.includes('data-oc-audience="employee"'))
 assert.ok(page.includes('data-oc-audience="visitor"'))
 assert.ok(page.includes('/uit/offerings/1password-vault/'))
 assert.ok(page.includes('/uit/offerings/eduroam/'))
 assert.ok(page.includes('/uit/knowledge/'))
 assert.ok(page.includes('Related knowledge'))
 const family=serviceFamily(services.find(s=>s.id==='teaching-learning'),offers,articles,'/uit')
 assert.ok(family.includes('Services and actions'))
 assert.ok(family.includes('/uit/offerings/eclass/'))
 assert.ok(family.includes('/uit/offerings/turnitin/'))
})

test('offering cards escape input and do not nest action links inside another link',()=>{
 const o={id:'test',name:'Test <unsafe>',summary:'A & B tasks',parent_service_id:'email',audiences:['student'],actions:[{label:'Open',url:'https://example.com'}],article_ids:[]}
 const html=offerCard(o,new Map(),new Map([['email',{name:'Email'}]]))
 assert.ok(html.includes('&lt;unsafe&gt;'))
 assert.ok(html.includes('A &amp; B tasks'))
 assert.ok(!html.includes('<unsafe>'))
 assert.ok(html.includes('<article'))
 assert.ok(!html.includes('<a class="oc-card"'))
})
