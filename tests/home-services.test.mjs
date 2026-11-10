import test from 'node:test'
import assert from 'node:assert/strict'
import {home,homeServiceCard} from '../src/render.mjs'
import {audiencesForService,serviceAudiences} from '../src/service-audiences.mjs'
import {loadContent} from '../src/load-content.mjs'

test('homepage shows all 22 service preview cards by default',async()=>{
 const services=await loadContent('services')
 const html=home(services,'/uit')
 assert.equal(services.length,22)
 assert.equal((html.match(/data-service-card/g)||[]).length,22)
 for(const s of services){
  assert.ok(html.includes('href="/uit/services/'+s.id+'/"'),s.id)
  assert.ok(html.includes(s.summary),s.id)
 }
 assert.ok(html.includes('id="home-service-grid"'))
 assert.ok(html.includes('id="home-services-count"'))
 assert.ok(html.includes('id="home-service-search"'))
 assert.ok(html.includes('id="home-service-sort"'))
 assert.ok(html.includes('data-service-audience="student"'))
 assert.ok(html.includes('data-service-audience="employee"'))
 assert.ok(html.includes('aria-pressed="true"'))
 assert.ok(!html.includes('https://www.yorku.ca/uit/infosec/duo/'))
})
test('audience categories cover every service without inventing student access',async()=>{
 const services=await loadContent('services')
 assert.equal(Object.keys(serviceAudiences).length,22)
 const valid=['student','employee']
 for(const s of services){
  const roles=audiencesForService(s)
  assert.ok(roles.length&&roles.every(role=>valid.includes(role)),s.id)
  assert.equal(new Set(roles).size,roles.length)
 }
 assert.deepEqual(audiencesForService({id:'github'}),['employee'])
 const html=home(services)
 const student=services.filter(s=>audiencesForService(s).includes('student')).length
 assert.ok(html.includes('Students <span class="home-audience-number">'+student+'</span>'))
})
test('card descriptions preserve full content and HTML-escape unsafe input',()=>{
 const result=homeServiceCard({id:'email',name:'Email <unsafe>',summary:'Long & detailed > summary',aliases:['mail']})
 assert.ok(result.includes('Email &lt;unsafe&gt;'))
 assert.ok(result.includes('Long &amp; detailed &gt; summary'))
 assert.ok(!result.includes('<unsafe>'))
})
