import test from 'node:test'
import assert from 'node:assert/strict'
import {loadArticles,loadContent} from '../src/load-content.mjs'
import {loadOntology,validateOntology} from '../src/nexus.mjs'
import {auditKnowledge} from '../src/kcs-audit.mjs'
test('distinct canonical NEXUS service nodes and consistent article ownership',async()=>{
 const ontology=await loadOntology();assert.deepEqual(validateOntology(ontology),[])
 const services=await loadContent('services'),articles=await loadArticles(),byId=new Map(articles.map(a=>[a.id,a]))
 const names=new Set(services.map(s=>s.id));assert.equal(services.length,22)
 for(const key of ['passport-york','1password','duo','security'])assert.ok(names.has(key))
 for(const s of services)for(const id of s.article_ids){assert.equal(byId.get(id)?.service_id,s.id,id)}
 assert.equal(byId.get('UIT-KA-007E315D03DF').service_id,'1password')
 assert.equal(byId.get('UIT-KA-2192D1307363').service_id,'email')
 assert.equal(byId.get('UIT-KA-000000000016').service_id,'duo')
 const password=services.find(s=>s.id==='passport-york')
 assert.ok(!password.details.some(d=>/1password/i.test(d.title)))
})
test('knowledge editorial audit reports actionable and missing resolutions',async()=>{
 const report=auditKnowledge(await loadArticles())
 assert.equal(report.total,210)
 assert.ok(report.counts.vendor_maintained_reference>0)
 assert.ok(report.results.every(r=>r.id&&r.service_id&&r.mode))
 assert.equal(report.results.find(r=>r.id==='UIT-KA-007E315D03DF').mode,'vendor_maintained_reference')
})
