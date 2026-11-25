import fs from 'node:fs/promises'
import {audienceLabel,isValidated,knowledgeState,articlePath,audiences} from './ui.mjs'
export {audienceLabel,isValidated,knowledgeState}

const contentRoot=new URL('../content/',import.meta.url)

export async function loadExperience(){
 const [journeys,experience]=await Promise.all(['journeys.json','experience.json'].map(async name=>JSON.parse(await fs.readFile(new URL(name,contentRoot),'utf8'))))
 return {journeys:journeys.journeys,experience}
}

export function validateExperience({journeys,experience},{articles,offerings,services}){
 const errors=[],articleIds=new Set(articles.map(a=>a.id)),offeringIds=new Set(offerings.map(o=>o.id)),serviceIds=new Set(services.map(s=>s.id)),journeyIds=new Set()
 const audiences=new Set(['all','student','employee','visitor'])
 for(const j of journeys){
  if(journeyIds.has(j.id))errors.push('Duplicate journey '+j.id);journeyIds.add(j.id)
  if(!/^[a-z0-9-]+$/.test(j.id))errors.push('Invalid journey id '+j.id)
  if(!serviceIds.has(j.service_id))errors.push('Journey service missing '+j.id)
  if(j.offering_id&&!offeringIds.has(j.offering_id))errors.push('Journey offering missing '+j.id)
  if(!j.intents?.length)errors.push('Journey has no intents '+j.id)
  if(!j.branches?.length)errors.push('Journey has no branches '+j.id)
  for(const b of j.branches||[]){
   if(!audiences.has(b.audience))errors.push('Invalid journey audience '+j.id)
   if(b.hub&&!articleIds.has(b.hub))errors.push('Journey hub missing '+j.id+' '+b.hub)
   for(const step of [...b.steps,...(b.fallback?[b.fallback]:[])]){
    if(!step.article||!articleIds.has(step.article))errors.push('Journey step must cite an existing article '+j.id+' '+step.title)
    if(step.action&&!/^https:\/\//.test(step.action.url))errors.push('Journey action must be https '+j.id)
   }
  }
  for(const id of j.after?.articles||[])if(!articleIds.has(id))errors.push('Journey follow-up missing '+id)
 }
 for(const j of journeys)for(const b of j.branches)for(const s of b.steps)if(s.journey&&!journeyIds.has(s.journey))errors.push('Journey link missing '+s.journey)
 for(const id of experience.top_tasks)if(!journeyIds.has(id))errors.push('Top task missing '+id)
 for(const q of experience.quick_actions)if(!offeringIds.has(q.offering))errors.push('Quick action offering missing '+q.offering)
 for(const [service,topics] of Object.entries(experience.topics)){
  if(!serviceIds.has(service))errors.push('Topic service missing '+service)
  for(const t of topics)for(const id of t.article_ids)if(!articleIds.has(id))errors.push('Topic article missing '+id)
 }
 for(const c of experience.support.channels)if(c.article&&!articleIds.has(c.article))errors.push('Support article missing '+c.article)
 return errors
}

const unique=items=>[...new Map(items.filter(Boolean).map(x=>[x.id,x])).values()]

export function composeModel({services,offerings,articles,ontology,quality,journeys,experience}){
 const qualityMap=new Map((quality?.results||[]).map(r=>[r.id,r]))
 const articleById=new Map(articles.map(a=>[a.id,a])),serviceById=new Map(services.map(s=>[s.id,s])),offeringById=new Map(offerings.map(o=>[o.id,o]))
 const publishable=a=>a&&!qualityMap.get(a.id)?.needs_review&&a.state!=='archived'
 const stateOf=a=>knowledgeState(a,qualityMap.get(a.id))
 const journeyById=new Map(journeys.map(j=>[j.id,j]))
 const resolvedJourneys=journeys.map(j=>({...j,service:serviceById.get(j.service_id),offering:offeringById.get(j.offering_id),branches:j.branches.map(b=>({...b,hubArticle:articleById.get(b.hub),steps:b.steps.map(s=>({...s,articleRecord:articleById.get(s.article),journeyRecord:s.journey?journeyById.get(s.journey):null})),fallback:b.fallback?{...b.fallback,articleRecord:articleById.get(b.fallback.article)}:null})),after:j.after?{...j.after,articleRecords:j.after.articles.map(id=>articleById.get(id))}:null,articleIds:[...new Set(j.branches.flatMap(b=>[b.hub,...b.steps.map(s=>s.article),b.fallback?.article]).concat(j.after?.articles||[]).filter(Boolean))]}))
 const relations=[]
 for(const r of ontology?.relationships||[]){
  const [st,sid]=String(r.subject).split(':'),[ot,oid]=String(r.object).split(':')
  if(st==='service'&&ot==='service'&&serviceById.has(sid)&&serviceById.has(oid))relations.push({from:sid,to:oid,predicate:r.predicate})
 }
 const relationLabel={PROTECTS:['Protects','Protected by'],AUTHENTICATES_WITH:['Signs in with','Used to sign in to'],RELATED_TO:['Related to','Related to'],USES_APPLICATION:['Uses','Used by'],PROVIDED_BY:['Provided by','Provides'],AVAILABLE_TO:['Available to','Available to']}
 const serviceModels=new Map()
 for(const s of services){
  const own=articles.filter(a=>a.service_id===s.id)
  const visible=own.filter(publishable)
  const offeringsFor=offerings.filter(o=>o.parent_service_id===s.id)
  const curated=experience.topics[s.id]
  let topics
  if(curated){
   const listed=new Set(curated.flatMap(t=>t.article_ids))
   topics=curated.map(t=>({id:t.id,title:t.title,articles:t.article_ids.map(id=>articleById.get(id)).filter(publishable)}))
   const rest=visible.filter(a=>!listed.has(a.id))
   if(rest.length)topics.push({id:'more',title:'More guidance',articles:rest})
  }else{
   const used=new Set()
   topics=offeringsFor.map(o=>{const list=o.article_ids.map(id=>articleById.get(id)).filter(a=>publishable(a)&&!used.has(a.id));list.forEach(a=>used.add(a.id));return {id:o.id,title:o.name,articles:list}}).filter(t=>t.articles.length)
   const rest=visible.filter(a=>!used.has(a.id))
   if(rest.length)topics.push({id:'more',title:topics.length?'More guidance':'Guidance',articles:rest})
  }
  topics=topics.filter(t=>t.articles.length)
  const links=relations.filter(r=>r.from===s.id||r.to===s.id).map(r=>{const outward=r.from===s.id;return {service:serviceById.get(outward?r.to:r.from),predicate:r.predicate,label:(relationLabel[r.predicate]||[r.predicate,r.predicate])[outward?0:1]}})
  const serviceJourneys=resolvedJourneys.filter(j=>j.service_id===s.id)
  const linkedJourneys=resolvedJourneys.filter(j=>j.service_id!==s.id&&links.some(l=>l.service?.id===j.service_id))
  serviceModels.set(s.id,{...s,offerings:offeringsFor,articles:own,visibleArticles:visible,hiddenCount:own.length-visible.length,topics,relations:unique(links.map(l=>({...l,id:l.service.id+l.predicate}))),journeys:serviceJourneys,relatedJourneys:linkedJourneys,notice:experience.notices?.[s.id]?{...experience.notices[s.id],articleRecord:articleById.get(experience.notices[s.id].article)}:null})
 }
 const offeringModels=new Map()
 for(const o of offerings){
  const service=serviceModels.get(o.parent_service_id)
  const own=o.article_ids.map(id=>articleById.get(id)).filter(publishable)
  const ownIds=new Set(own.map(a=>a.id))
  const primary=(experience.primary_offerings||{})[o.parent_service_id]===o.id
  const inherits=primary||service.offerings.length===1
  const js=resolvedJourneys.filter(j=>j.offering_id===o.id)
  offeringModels.set(o.id,{...o,service,knowledge:own,topics:inherits?service.topics:null,serviceKnowledge:inherits?[]:service.visibleArticles.filter(a=>!ownIds.has(a.id)),journeys:js,siblings:service.offerings.filter(x=>x.id!==o.id)})
 }
 const supportArticles=Object.fromEntries(experience.support.channels.filter(c=>c.article).map(c=>[c.id,articleById.get(c.article)]))
 return {services:serviceModels,offerings:offeringModels,journeys:new Map(resolvedJourneys.map(j=>[j.id,j])),articles:articleById,experience,support:{...experience.support,articles:supportArticles,prepare:articleById.get(experience.support.prepare_article)},stateOf,publishable,topTasks:experience.top_tasks.map(id=>resolvedJourneys.find(j=>j.id===id)),quickActions:experience.quick_actions.map(q=>({...q,offeringRecord:offeringById.get(q.offering)}))}
}

export function serviceDigest(model,id,base=''){
 const s=model.services.get(id)
 return {schema:'york-service-digest',version:1,id:s.id,name:s.name,summary:s.summary,aliases:s.aliases,route:base+'/services/'+s.id+'/',source_urls:s.source_urls,
  offerings:s.offerings.map(o=>({id:o.id,name:o.name,summary:o.summary,audiences:o.audiences,who_uses_it:o.who_uses_it,use_cases:o.use_cases,access_note:o.access_note,actions:o.actions,editorial_status:o.editorial_status||null,reviewed_at:o.reviewed_at||null,route:base+'/offerings/'+o.id+'/'})),
  journeys:s.journeys.map(j=>({id:j.id,title:j.title,summary:j.summary,intents:j.intents,route:base+'/tasks/'+j.id+'/',branches:j.branches.map(b=>({audience:b.audience,steps:b.steps.map(st=>({title:st.title,detail:st.detail,needs:st.needs||[],article:st.article,journey:st.journey||null}))}))})),
  relationships:s.relations.map(r=>({predicate:r.predicate,service:r.service.id})),
  knowledge:s.articles.map(a=>({id:a.id,title:a.title,audiences:a.audiences,state:model.stateOf(a).id,route:base+'/knowledge/'+a.slug+'/',source_urls:a.source_urls})),
  support:model.support.channels.map(c=>({id:c.id,label:c.label,value:c.value,href:c.href})),
  provenance:{generated_from:['content/records','content/editorial-offering-details.json','content/journeys.json','content/experience.json','content/nexus'],validated:s.articles.filter(isValidated).length,total:s.articles.length}}
}

const plain=html=>String(html||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
const same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase()
// One shared retrieval index for the search page, the command palette and future grounded answers
export function searchRecords(model,pages=[]){
 const service=id=>model.services.get(id)
 return [
  ...[...model.journeys.values()].map(j=>({id:j.id,type:'task',title:j.title,summary:j.summary,route:'/tasks/'+j.id+'/',text:[j.title,j.summary,service(j.service_id).name,j.question,...j.branches.flatMap(b=>b.steps.flatMap(s=>[s.title,s.detail]))].join(' '),intents:j.intents,audiences:['all'],context:service(j.service_id).name})),
  ...[...model.services.values()].map(s=>({id:s.id,type:'service',title:s.name,summary:s.summary,route:'/services/'+s.id+'/',text:s.name+' '+s.summary+' '+s.aliases.join(' '),audiences:['all']})),
  ...[...model.offerings.values()].map(o=>({id:o.id,type:'offering',title:o.name,summary:o.summary,route:'/offerings/'+o.id+'/',text:o.name+' '+o.summary+' '+o.parent_service_id,audiences:o.audiences,context:service(o.parent_service_id).name})),
  ...[...model.articles.values()].map(a=>({id:a.id,type:'article',title:a.title,summary:same(a.issue,a.title)?'':a.issue,route:articlePath(a),text:a.title+' '+a.issue+' '+a.environment.join(' ')+' '+plain(a.resolution_html),audiences:a.audiences,context:[service(a.service_id).name,audiences(a.audiences),knowledgeState(a).id==='validated'?knowledgeState(a).label:''].filter(Boolean).join(' · '),state:knowledgeState(a).id,blocked:!!(a.review_flags||[]).length||a.state==='archived'})),
  ...pages.map(p=>({id:p.id,type:p.type,title:p.title,route:p.route,text:p.title+' '+plain(p.html),audiences:p.audiences,blocked:p.dynamic_review}))
 ]
}