import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {shell,reader} from '../src/render.mjs'
import {escapeHtml as e,validateArticle} from '../src/search.mjs'
import {loadContent,loadArticles} from '../src/load-content.mjs'
import {auditKnowledge} from '../src/kcs-audit.mjs'
import {loadOntology,validateOntology} from '../src/nexus.mjs'
import {loadExperience,validateExperience,composeModel,serviceDigest,searchRecords} from '../src/model.mjs'
import {homeView,tasksView,taskView,servicesView,serviceView,offeringView,knowledgeView,articleView,searchView,helpView,listingView,pageView,notFoundView} from '../src/views.mjs'
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')

export async function build(){
 const [services,articles,pages,ledger,stats,offerings,ontology,{journeys,experience}]=await Promise.all([loadContent('services'),loadArticles(),loadContent('pages'),loadContent('ledger'),loadContent('stats'),loadContent('offerings'),loadOntology(),loadExperience()])
 const base=(process.env.BASE_PATH||'').replace(/\/$/,'')
 const errors=[...articles.flatMap(validateArticle),...validateOntology(ontology),...validateExperience({journeys,experience},{articles,offerings,services})]
 if(errors.length)throw new Error(errors.join('\n'))

 // Rewrite legacy UIT links in imported HTML to their canonical destinations
 const routes=new Map()
 const destinationFor=row=>{const p=new URL(row.source_url).pathname;return /\/1password(?:-|\/)/i.test(p)?'/services/1password/':/\/duo(?:-|\/)|\/2fa(?:-|\/)/i.test(p)?'/services/duo/':row.special_route||row.destinations.find(x=>x.startsWith('/'))}
 for(const row of ledger){const destination=destinationFor(row);if(destination)routes.set(row.source_url,destination);for(const assignment of row.assignments)for(const anchor of assignment.anchors||[])if(assignment.destination.startsWith('/'))routes.set(row.source_url+'#'+anchor,assignment.destination)}
 function rewrite(html){return html.replace(/href="([^"]*)"/g,(original,value)=>{let next=value.startsWith('/knowledge/')?value:routes.get(value.replace(/&amp;/g,'&'));if(!next)try{const u=new URL(value.replace(/&amp;/g,'&'));if(['yorku.ca','www.yorku.ca'].includes(u.hostname)){const clean='https://www.yorku.ca'+u.pathname.replace(/\/{2,}/g,'/');next=routes.get(clean+u.hash)||routes.get(clean)}}catch{}return next?'href="'+e(base+next)+'"':original})}
 for(const a of articles)a.resolution_html=rewrite(a.resolution_html)
 for(const s of services)for(const detail of s.details)detail.html=rewrite(detail.html)
 for(const p of pages)p.html=rewrite(p.html)

 const quality=auditKnowledge(articles),qualityMap=new Map(quality.results.map(x=>[x.id,x]))
 for(const a of articles)if(qualityMap.get(a.id)?.needs_review)a.review_flags=[...new Set([...(a.review_flags||[]),'resolution-needs-work'])]
 const model=composeModel({services,offerings,articles,ontology,quality,journeys,experience})

 const out=path.join(root,'dist')
 await fs.rm(out,{recursive:true,force:true})
 await fs.mkdir(path.join(out,'assets'),{recursive:true})
 const write=async(route,html)=>{const target=path.join(out,route,'index.html');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,html)}
 const json=async(relative,value)=>{const target=path.join(out,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(value))}
 const page=(title,body,options={})=>shell(title,body,{base,support:model.support,...options})
 for(const filename of ['styles.css','client.mjs','render.mjs','search.mjs','ui.mjs'])await fs.copyFile(path.join(root,'src',filename),path.join(out,'assets',filename))
 try{await fs.cp(path.join(root,'public'),out,{recursive:true})}catch(error){if(error.code!=='ENOENT')throw error}

 await write('',page('IT help at York',homeView(model,base),{kind:'home'}))
 await write('tasks',page('Tasks',tasksView(model,base),{current:'tasks',kind:'tasks'}))
 for(const j of model.journeys.values())await write('tasks/'+j.id,page(j.title,taskView(model,j,base),{current:'tasks',kind:'task',description:j.summary}))
 await write('services',page('Services',servicesView(model,base),{current:'services'}))
 for(const s of model.services.values()){await write('services/'+s.id,page(s.name,serviceView(model,s,base),{current:'services',kind:'service',description:s.summary,alternate:base+'/_data/services/'+s.id+'.json'}));await json('_data/services/'+s.id+'.json',serviceDigest(model,s.id,base))}
 for(const o of model.offerings.values())await write('offerings/'+o.id,page(o.name,offeringView(model,o,base),{current:'services',kind:'offering',description:o.summary}))
 await write('knowledge',page('Knowledge',knowledgeView(model,base),{current:'knowledge'}))
 for(const a of articles){const s=model.services.get(a.service_id);await write('knowledge/'+a.slug,page(a.title,articleView(model,a,base,reader(a,{base,service:s})),{current:'knowledge',kind:'article',description:a.issue,alternate:base+'/_data/articles/'+a.id+'.json'}));await json('_data/articles/'+a.id+'.json',{...a,service_name:s?.name})}
 for(const p of pages)await write(p.route,page(p.title,pageView(p,base)))
 for(const [type,route,title,lede] of [['resource','resources','Resources','Reference material from the UIT website'],['prompt','prompts','AI prompts','Prompts for York approved AI tools']])await write(route,page(title,listingView(title,'York IT',lede,pages.filter(p=>p.type===type).sort((a,b)=>a.title.localeCompare(b.title)),base)))
 const contact=pages.find(p=>p.source_url===experience.support.source_url)
 await write('help',page('Get help',helpView(model,contact?.html||'',base),{current:'help',kind:'help'}))
 await write('search',page('Search',searchView(base),{kind:'search'}))
 await fs.writeFile(path.join(out,'404.html'),page('Page not found',notFoundView(base)))

 const graph={schema:'NEXUS-CORE',version:ontology.version,entities:[...ontology.entities,...services.filter(s=>!ontology.entities.some(x=>x.id==='service:'+s.id)).map(s=>({id:'service:'+s.id,type:'Service',name:s.name,external_ids:[s.id]})),...offerings.map(o=>({id:'offering:'+o.id,type:'Offering',name:o.name,parent_service:o.parent_service_id,source_urls:o.source_urls,audiences:o.audiences})),...articles.map(a=>({id:'knowledge:'+a.id,type:'Knowledge',name:a.title,review_state:a.state,quality_state:qualityMap.get(a.id)?.mode||'unknown',source_urls:a.source_urls})),...journeys.map(j=>({id:'journey:'+j.id,type:'Journey',name:j.title,intents:j.intents}))],relationships:[...ontology.relationships,...offerings.map(o=>({subject:'service:'+o.parent_service_id,predicate:'HAS_OFFERING',object:'offering:'+o.id})),...articles.map(a=>({subject:a.offering_id?'offering:'+a.offering_id:'service:'+a.service_id,predicate:'HAS_KNOWLEDGE',object:'knowledge:'+a.id})),...offerings.flatMap(o=>o.article_ids.filter(id=>!articles.some(a=>a.id===id&&a.offering_id===o.id)).map(id=>({subject:'offering:'+o.id,predicate:'HAS_KNOWLEDGE',object:'knowledge:'+id}))),...[...model.journeys.values()].flatMap(j=>[{subject:(j.offering_id?'offering:'+j.offering_id:'service:'+j.service_id),predicate:'HAS_JOURNEY',object:'journey:'+j.id},...j.articleIds.map(id=>({subject:'journey:'+j.id,predicate:'CITES',object:'knowledge:'+id}))])]}
 await json('_data/nexus.json',graph)
 await json('_data/knowledge-audit.json',quality)
 await json('_data/journeys.json',{schema:'york-journeys',version:1,journeys:[...model.journeys.values()].map(j=>serviceDigest(model,j.service_id,base).journeys.find(x=>x.id===j.id))})

 const index=searchRecords(model,pages)
 await json('_data/search.json',index)
 await json('_data/offerings.json',offerings)

 const redirects=[],canonical=new Set(['offerings/','services/','knowledge/','resources/','prompts/','help/','search/','tasks/'])
 for(const row of ledger){const dest=destinationFor(row);if(!dest)continue;const original=new URL(row.source_url).pathname;const alias=original.replace(/^\/uit\/?/,'');if(!alias||alias==='index.html'||alias.includes('.html/')||canonical.has(alias))continue;redirects.push({source:original,destination:dest,status:301});const redirectHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${e(base+dest)}"><link rel="canonical" href="${e(base+dest)}"><title>York IT page moved</title></head><body><p>This information has moved <a href="${e(base+dest)}">Continue</a></p></body></html>`;if(/\.html?$/.test(alias)){const file=path.join(out,alias);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,redirectHtml)}else await write(alias,redirectHtml)}
 await json('redirects.json',redirects)
 await fs.writeFile(path.join(out,'_redirects'),redirects.map(r=>`${r.source} ${base+r.destination} 301`).join('\n'))
 await fs.writeFile(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Content-Security-Policy: ${CSP}\n`)
 await json('_data/build-report.json',{built_at:new Date().toISOString(),base,stats,redirects:redirects.length,knowledge_audit:quality.counts,nexus_nodes:graph.entities.length,nexus_edges:graph.relationships.length,offerings:offerings.length,journeys:journeys.length})
 console.log(`Built ${articles.length} knowledge articles, ${offerings.length} offerings in ${services.length} services, ${journeys.length} guided tasks, ${pages.length} reference pages, ${redirects.length} redirects`)
 return {out,index,stats,model}
}
export const CSP="default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' https: data:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build()
