// Server-side page views. Every view renders from the composed service model in src/model.mjs
import {escapeHtml as e} from './search.mjs'
import {go,away,link,articlePath,knowledgeState,audiences,audienceLabel,isExternal,stateTag,sourceLabel} from './ui.mjs'
import {finder,knowledgeList,knowledgeRow} from './render.mjs'
import {audiencesForService} from './service-audiences.mjs'

const pad=n=>String(n).padStart(2,'0')
const plural=(n,one,many=one+'s')=>n+' '+(n===1?one:many)
const href=(base,path)=>e(base+path)

function crumbs(base,items){
 return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([path,label])=>`<li><a href="${href(base,path)}">${e(label)}</a></li>`).join('')}</ol></nav>`
}
function head({eyebrow,title,lede,meta='',actions='',id='page-title'}){
 return `<header class="page-head">${eyebrow?`<p class="eyebrow">${eyebrow}</p>`:''}<h1 id="${id}">${e(title)}</h1>${lede?`<p class="lede">${e(lede)}</p>`:''}${meta}${actions?`<div class="actions">${actions}</div>`:''}</header>`
}
export function button(action,primary=false){
 return `<a class="btn${primary?' btn-primary':''}" href="${e(action.url)}">${e(action.label)}${isExternal(action.url)?away:go}</a>`
}
function section(label,body,{id='',cls=''}={}){
 const hid=id?id+'-label':'s'+Math.abs([...label].reduce((h,c)=>h*31+c.charCodeAt(0)|0,7))
 return `<section class="index${cls?' '+cls:''}"${id?` id="${id}"`:''} aria-labelledby="${hid}"><h2 class="index-label" id="${hid}">${e(label)}</h2><div class="index-body">${body}</div></section>`
}
function rail(items){
 return `<aside class="rail" aria-label="Service properties"><dl>${items.filter(Boolean).map(([label,value,cls])=>`<div${cls?` class="${cls}"`:''}><dt>${e(label)}</dt><dd>${value}</dd></div>`).join('')}</dl></aside>`
}
function stateSummary(list){
 const counts={}
 for(const a of list){const s=knowledgeState(a);counts[s.label]=(counts[s.label]||0)+1}
 const validated=list.filter(a=>knowledgeState(a).id==='validated').length
 const entries=Object.entries(counts)
 if(entries.length===1)return `${e(plural(list.length,'guide'))} · ${validated?'all validated':'all '+e(entries[0][0].toLowerCase())+'s, none validated'}`
 return `${e(plural(list.length,'guide'))} · ${validated} validated${entries.filter(([l])=>l!=='Validated').map(([l,n])=>`<br>${n} ${e(l.toLowerCase())}`).join('')}`
}
// Below the layout breakpoint the rail falls under the page, so the first action is repeated after the heading
function startCompact(action,who){
 return action?`<div class="start-compact">${button(action,true)}${who?`<p class="meta">${e(who)}</p>`:''}</div>`:''
}
const relationLinks=(rels,base)=>rels.map(r=>`<span class="relation"><span class="rel">${e(r.label)}</span> <a class="link" href="${href(base,'/services/'+r.service.id+'/')}">${e(r.service.name)}${go}</a></span>`).join('')
const sourceLinks=urls=>urls.map(u=>`<a class="link link-quiet link-source" href="${e(u)}">${e(sourceLabel(u))}${away}</a>`).join('')

export function taskList(list,base='',{numbered=true,service=true,compact=false}={}){
 return `<ol class="tasks${compact?' tasks-compact':''}">${list.map((j,i)=>`<li><a href="${href(base,'/tasks/'+j.id+'/')}">${numbered?`<span class="num" aria-hidden="true">${pad(i+1)}</span>`:''}<span class="task-text"><span class="task-title">${e(j.title)}</span><span class="task-sum">${e(j.summary)}</span></span>${service?`<span class="task-svc">${e(j.service.name)}</span>`:''}${go}</a></li>`).join('')}</ol>`
}
function audienceFilter(id,{options=['all','student','employee'],label='Show guidance for',controls=''}={}){
 return `<div class="seg" role="group" aria-label="${e(label)}" data-audience-filter="${e(id)}"${controls?` data-controls="${e(controls)}"`:''}><span class="seg-label" aria-hidden="true">${e(label)}</span>${options.map(o=>`<button type="button" data-audience="${o}" aria-pressed="${o==='all'}">${e(audienceLabel[o])}</button>`).join('')}</div>`
}
function offerRow(o,base,{category=false}={}){
 const action=o.actions[0]
 return `<li class="offer" data-offering data-role="${e(o.audiences.join(' '))}" data-category="${e(o.parent_service_id)}" data-label="${e(o.name.toLowerCase())}" data-find="${e([o.name,o.summary,o.who_uses_it||'',...(o.use_cases||[]),category?.name||''].join(' ').toLowerCase())}"><div class="offer-text"><h3><a href="${href(base,'/offerings/'+o.id+'/')}">${e(o.name)}</a></h3><p>${e(o.summary)}</p><p class="meta">${e(audiences(o.audiences))}</p></div>${action?`<a class="offer-act" href="${e(action.url)}">${e(action.label)}${isExternal(action.url)?away:go}</a>`:''}</li>`
}
const supportChannels=(support,ids)=>support.channels.filter(c=>!ids||ids.includes(c.id))

function escalate(model,base,title='Still stuck'){
 const s=model.support
 return `<section class="escalate" aria-labelledby="escalate-title"><h2 id="escalate-title">${e(title)}</h2><p>${e(s.note)}</p><ul>${supportChannels(s,['phone','email','in-person']).map(c=>`<li><span class="label">${e(c.label)}</span><a href="${e(c.href)}">${e(c.value)}</a></li>`).join('')}</ul>${s.prepare?`<p>${link(base+articlePath(s.prepare),'What to have ready before you contact us','link')}</p>`:''}</section>`
}

// Home
export function homeView(model,base=''){
 const services=[...model.services.values()]
 const passport=model.services.get(model.experience.flagship)
 const roles=services.map(s=>[s,audiencesForService(s)])
 const top=new Set(model.topTasks.map(j=>j.id))
 const more=passport.journeys.filter(j=>!top.has(j.id))
 const offer=passport.offerings[0]
 const quick=`<nav class="quick" aria-labelledby="quick-title"><h2 class="label" id="quick-title">Go straight to</h2><ul>${model.quickActions.map(q=>`<li><a href="${e(q.url)}"><span class="quick-name">${e(q.label)}</span>${q.offeringRecord.name.toLowerCase()!==q.label.toLowerCase()?`<span class="quick-for">${e(q.offeringRecord.name)}</span>`:''}${away}</a></li>`).join('')}</ul></nav>`
 return `<section class="hero"><div class="wrap hero-in"><div class="hero-main"><h1 class="display"><span class="display-strong">IT help at York</span><span class="display-light">Start with what you need to do</span></h1>${finder({id:'home-q',base,size:'hero'})}<p class="try"><span class="label">Try</span>${['lost phone','forgot password','connect to Wi-Fi','install Microsoft 365'].map(q=>`<a href="${href(base,'/search/?q='+encodeURIComponent(q))}">${e(q)}</a>`).join('')}</p></div>${quick}</div></section>
<div class="wrap">
${section('Most needed',taskList(model.topTasks,base),{id:'top-tasks'})}
</div>
<section class="spotlight" aria-labelledby="spotlight-title"><div class="wrap spotlight-in"><div class="spotlight-intro"><p class="eyebrow">Your York account</p><h2 id="spotlight-title">${e(passport.name)}</h2><p class="lede">${e(passport.summary)}</p><div class="actions">${passport.actions.map((a,i)=>button(a,i===0)).join('')}${link(base+'/services/'+passport.id+'/','Everything about '+passport.name)}</div></div><div class="spotlight-facts"><dl>${offer?.who_uses_it?`<div><dt>Who can use it</dt><dd>${e(offer.who_uses_it)}</dd></div>`:''}${passport.relations.length?`<div><dt>Connected services</dt><dd class="relations">${relationLinks(passport.relations,base)}</dd></div>`:''}<div><dt>Guidance</dt><dd>${e(plural(passport.visibleArticles.length,'guide'))} in ${e(plural(passport.topics.length,'topic'))} ${link(base+'/services/'+passport.id+'/#guidance','Browse guidance')}</dd></div>${more.length?`<div><dt>More guided tasks</dt><dd>${taskList(more,base,{numbered:false,service:false,compact:true})}</dd></div>`:''}</dl></div></div></section>
<div class="wrap">
${section('All services',`<div class="bar">${audienceFilter('home-services',{label:'Show services for',controls:'service-index'})}<p class="meta" id="service-count" role="status">Showing ${services.length} of ${services.length} services</p></div><ul class="svc-index" id="service-index">${roles.map(([s,r])=>`<li data-service-card data-audiences="${e(r.join(' '))}"><a href="${href(base,'/services/'+s.id+'/')}"><span class="svc-name">${e(s.name)}</span><span class="svc-sum">${e(s.summary)}</span></a></li>`).join('')}</ul>`,{id:'services'})}
</div>`
}
// Tasks
export function tasksView(model,base=''){
 const groups=new Map()
 for(const j of model.journeys.values()){if(!groups.has(j.service_id))groups.set(j.service_id,[]);groups.get(j.service_id).push(j)}
 const solo=[...groups.values()].filter(l=>l.length===1).flat()
 const sections=[...groups].filter(([,l])=>l.length>1).map(([id,list])=>section(model.services.get(id).name,taskList(list,base,{service:false})))
 if(solo.length)sections.push(section('Other services',taskList(solo,base)))
 return `<div class="wrap page">${head({eyebrow:'Guided tasks',title:'Tasks',lede:'Step by step paths through common problems. Each step links to the York guidance it comes from'})}${sections.join('')}${escalate(model,base,'Not listed here')}</div>`
}

function stepView(step,i,base,model){
 const a=step.articleRecord
 const target=step.journeyRecord?`<a class="step-title" href="${href(base,'/tasks/'+step.journey+'/')}">${e(step.title)}${go}</a>`:`<span class="step-title">${e(step.title)}</span>`
 return `<li class="step"><span class="num" aria-hidden="true">${pad(i+1)}</span><div class="step-body"><h4>${target}</h4><p>${e(step.detail)}</p>${step.needs?.length?`<div class="needs"><span class="label">You need</span><ul>${step.needs.map(n=>`<li>${e(n)}</li>`).join('')}</ul></div>`:''}<div class="step-links">${step.action?button(step.action,true):''}${a?`<a class="link" href="${href(base,articlePath(a))}" data-preview="${e(a.id)}">Read the guide<span class="sr-only"> ${e(a.title)}</span>${go}</a><span class="meta">${e(a.title)} · ${e(knowledgeState(a).label)}</span>`:''}</div></div></li>`
}

export function taskView(model,j,base=''){
 const s=model.services.get(j.service_id),o=j.offering
 const cited=j.articleIds.map(id=>model.articles.get(id)).filter(Boolean)
 let body
 if(j.kind==='diagnose'){
  const b=j.branches[0]
  body=`<section class="diagnose" aria-labelledby="question"><h2 id="question" class="question">${e(j.question)}</h2><ol class="choices">${b.steps.map(st=>{const target=st.journeyRecord?base+'/tasks/'+st.journey+'/':base+articlePath(st.articleRecord);return `<li><a href="${e(target)}"${st.journeyRecord?'':` data-preview="${e(st.article)}"`}><span class="choice-title">${e(st.title)}</span><span class="choice-detail">${e(st.detail)}</span>${go}</a></li>`}).join('')}</ol></section>`
 }else{
  const multi=j.branches.length>1
  body=`<section class="branching" aria-labelledby="question" data-branching><h2 id="question" class="question">${e(j.question)}</h2>${multi?`<div class="choose" role="group" aria-labelledby="question" data-branch-buttons hidden>${j.branches.map((b,i)=>`<button type="button" data-branch="${e(b.audience)}" aria-controls="branch-${e(b.audience)}" aria-pressed="${i===0}"><span class="choose-label">${e(b.label)}</span><span class="choose-meta">${e(plural(b.steps.length,j.kind==='procedure'&&/reset|recover/i.test(j.title)?'way':'step'))}</span></button>`).join('')}</div>`:''}${j.branches.map(b=>`<section class="branch" id="branch-${e(b.audience)}" data-branch-panel="${e(b.audience)}" aria-labelledby="branch-${e(b.audience)}-title"><h3 class="branch-title" id="branch-${e(b.audience)}-title">${e(b.label)}</h3>${b.hubArticle?`<p class="hub">${link(base+articlePath(b.hubArticle),'Overview · '+b.hubArticle.title,'link link-quiet')}</p>`:''}<ol class="steps">${b.steps.map((st,i)=>stepView(st,i,base,model)).join('')}</ol>${b.fallback?`<aside class="fallback"><h4>${e(b.fallback.title)}</h4><p>${e(b.fallback.detail)}</p>${b.fallback.articleRecord?`<a class="link" href="${href(base,articlePath(b.fallback.articleRecord))}" data-preview="${e(b.fallback.article)}">${e(b.fallback.articleRecord.title)}${go}</a>`:''}</aside>`:''}</section>`).join('')}</section>`
 }
 const after=j.after?`<section class="after" aria-labelledby="after-title"><h2 id="after-title">${e(j.after.title)}</h2><p>${e(j.after.detail)}</p>${knowledgeList(j.after.articleRecords,base)}</section>`:''
 const primary=o?.actions?.[0]
 return `<div class="wrap page">${crumbs(base,[['/tasks/','Tasks'],['/services/'+s.id+'/',s.name]])}${head({eyebrow:'Guided task · '+e(s.name),title:j.title,lede:j.summary})}<div class="layout"><div class="layout-main">${startCompact(primary,o?.who_uses_it)}${body}${after}${escalate(model,base)}</div>${rail([
  ['Service',`<a class="link" href="${href(base,'/services/'+s.id+'/')}">${e(s.name)}${go}</a>`],
  primary&&['Start here',button(primary,true),'rail-start'],
  o&&['Who can use it',e(o.who_uses_it||audiences(o.audiences)),'rail-start'],
  s.relations.length&&['Connected services',relationLinks(s.relations,base)],
  ['Based on',stateSummary(cited)],
  s.notice&&['Scheduled',`${e(s.notice.detail)}${s.notice.source?' '+link(s.notice.source,'Schedule source','link link-source'):''}`]
 ])}</div></div>`
}

// Catalogue
export function servicesView(model,base=''){
 const services=[...model.services.values()]
 const offers=[...model.offerings.values()]
 const n=r=>offers.filter(o=>o.audiences.includes(r)).length
 return `<div class="wrap page">${head({eyebrow:'Service catalogue',title:'Services',lede:'Every York IT service and what it offers. Each offering appears once with the audiences it serves'})}
<div class="filters" role="search" aria-label="Filter offerings"><div class="filters-row"><label class="field"><span class="label">Find</span><input id="oc-query" type="search" autocomplete="off" placeholder="Filter by name or task"></label><label class="field"><span class="label">Service</span><select id="oc-category"><option value="all">All services</option>${services.map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('')}</select></label></div><div class="seg" role="group" aria-label="Show offerings for"><span class="seg-label" aria-hidden="true">For</span>${[['all',offers.length],['student',n('student')],['employee',n('employee')],['visitor',n('visitor')]].map(([r,c])=>`<button type="button" data-oc-audience="${r}" aria-pressed="${r==='all'}">${e(audienceLabel[r])} <span class="count">${c}</span></button>`).join('')}</div><p id="oc-count" class="meta" role="status">Showing ${offers.length} of ${offers.length} offerings</p></div>
<div id="oc-grid">${services.map(s=>`<section class="svc-group" data-group="${e(s.id)}" aria-labelledby="g-${e(s.id)}"><div class="svc-group-head"><h2 id="g-${e(s.id)}"><a href="${href(base,'/services/'+s.id+'/')}">${e(s.name)}</a></h2><p>${e(s.summary)}</p><p class="meta">${e(plural(s.offerings.length,'offering'))} · ${e(plural(s.visibleArticles.length,'guide'))}${s.journeys.length?' · '+e(plural(s.journeys.length,'guided task')):''}</p></div><ul class="offers">${s.offerings.map(o=>offerRow(o,base,{category:s})).join('')}</ul></section>`).join('')}</div>
<div id="oc-empty" class="empty" hidden><h2>No matching offerings</h2><p>Try another service or audience, or search all guidance</p><button type="button" class="btn" id="oc-reset">Clear filters</button></div></div>`
}

export function serviceView(model,s,base=''){
 const roles=audiencesForService(s)
 const actions=s.actions.map((a,i)=>button(a,i===0)).join('')
 const notice=s.notice?`<aside class="notice-band" aria-label="${e(s.notice.title)}"><span class="label">${e(s.notice.title)}</span><p>${e(s.notice.detail)}</p>${s.notice.articleRecord?`<a class="link" href="${href(base,articlePath(s.notice.articleRecord))}" data-preview="${e(s.notice.article)}">Details${go}</a>`:''}${s.notice.source?link(s.notice.source,'Schedule source '+sourceLabel(s.notice.source),'link link-source'):''}</aside>`:''
 const journeys=s.journeys.length?section('Common tasks',taskList(s.journeys,base,{service:false}),{id:'tasks'}):''
 const related=s.relatedJourneys.length?section('From connected services',taskList(s.relatedJourneys,base,{numbered:false})):''
 const offerings=s.offerings.length?section(s.offerings.length===1?'Offering':'Offerings',`<ul class="offers">${s.offerings.map(o=>offerRow(o,base)).join('')}</ul>`,{id:'offerings'}):''
 const guidance=s.topics.length?section('Guidance',`<div class="bar">${audienceFilter('svc-guidance',{controls:'guidance-topics'})}<label class="field field-inline"><span class="sr-only">Filter guidance</span><input id="article-filter" type="search" autocomplete="off" placeholder="Filter ${e(plural(s.visibleArticles.length,'guide'))}"></label></div><div class="topics" id="guidance-topics">${s.topics.map(t=>`<section class="topic" aria-labelledby="t-${e(t.id)}"><h3 id="t-${e(t.id)}">${e(t.title)} <span class="count">${t.articles.length}</span></h3>${knowledgeList(t.articles,base)}</section>`).join('')}</div><p id="filter-empty" class="empty-inline" hidden>No guidance matches this filter ${link(base+'/search/','Search everything')}</p>${s.hiddenCount?`<p class="meta">${e(plural(s.hiddenCount,'imported article'))} withheld until the resolution is reviewed</p>`:''}`,{id:'guidance'}):''
 const about=s.details.length?section('About this service',`<div class="about">${s.details.map((d,i)=>`<details class="about-block" data-audiences="${e(d.audiences.join(' '))}"${i?'':' open'}><summary><h3>${e(d.title)} <span class="meta">${e(audiences(d.audiences))}</span></h3></summary><div class="prose">${d.html}</div></details>`).join('')}</div>`,{id:'about'}):''
 return `<div class="wrap page">${crumbs(base,[['/services/','Services']])}<div class="layout"><div class="layout-main">${head({eyebrow:'Service',title:s.name,lede:s.summary,actions})}${notice}</div>${rail([
  ['Available to',e(roles.map(r=>audienceLabel[r]).join(' · '))],
  s.relations.length&&['Connected services',relationLinks(s.relations,base)],
  ['Knowledge',stateSummary(s.visibleArticles)],
  ['Sources',sourceLinks(s.source_urls)]
 ])}</div>${journeys}${related}${offerings}${guidance}${about}${escalate(model,base,'Need a person')}</div>`
}

export function offeringView(model,o,base=''){
 const s=o.service
 const knowledge=o.topics?`<div class="topics">${o.topics.map(t=>`<section class="topic" aria-labelledby="t-${e(t.id)}"><h3 id="t-${e(t.id)}">${e(t.title)} <span class="count">${t.articles.length}</span></h3>${knowledgeList(t.articles,base)}</section>`).join('')}</div>`:o.knowledge.length?knowledgeList(o.knowledge,base):`<p>Service specific instructions are being reviewed. ${link(base+'/help/','Contact IT for help with this service')}</p>`
 const more=!o.topics&&o.serviceKnowledge.length?`<p class="more">${link(base+'/services/'+s.id+'/#guidance',`${plural(o.serviceKnowledge.length,'more guide')} for ${s.name}`)}</p>`:''
 return `<div class="wrap page">${crumbs(base,[['/services/','Services'],['/services/'+s.id+'/',s.name]])}<div class="layout"><div class="layout-main">${head({eyebrow:e(s.name),title:o.name,lede:o.description||o.summary,meta:`<p class="meta">${e(audiences(o.audiences))}</p>`})}
<section class="start" aria-labelledby="start-title"><h2 id="start-title" class="label">Get started</h2><div class="actions">${o.actions.map((a,i)=>button(a,i===0)).join('')}</div>${o.access_note?`<p class="note">${e(o.access_note)}</p>`:''}</section>
<div class="facts"><section aria-labelledby="who-title"><h2 id="who-title" class="label">Who can use it</h2><p>${e(o.who_uses_it||audiences(o.audiences))}</p></section><section aria-labelledby="what-title"><h2 id="what-title" class="label">What you can do</h2>${o.use_cases?.length?`<ul>${o.use_cases.map(u=>`<li>${e(u)}</li>`).join('')}</ul>`:'<p>See the instructions below</p>'}</section></div></div>${rail([
  ['Service',`<a class="link" href="${href(base,'/services/'+s.id+'/')}">${e(s.name)}${go}</a>`],
  ['Knowledge',stateSummary(o.topics?o.topics.flatMap(t=>t.articles):o.knowledge)],
  ['Record status',`${o.reviewed_at?'Reviewed '+e(o.reviewed_at.slice(0,10)):'Based on the existing York catalogue and not yet validated for production release'}`],
  ['Sources',sourceLinks(o.source_urls)]
 ])}</div>
${o.journeys.length?section('Guided tasks',taskList(o.journeys.slice(0,3),base,{numbered:false,service:false,compact:true})+(o.journeys.length>3?`<p class="more">${link(base+'/services/'+s.id+'/#tasks','All '+o.journeys.length+' '+s.name+' tasks')}</p>`:'')):''}
${section('Knowledge and instructions',knowledge+more,{id:'knowledge'})}
${o.siblings.length?section('Also in '+s.name,`<ul class="offers offers-compact">${o.siblings.map(x=>offerRow(x,base)).join('')}</ul>`):''}
${escalate(model,base,'Need a person')}</div>`
}

// Knowledge
export function knowledgeView(model,base=''){
 const all=[...model.articles.values()].filter(model.publishable)
 const validated=all.filter(a=>knowledgeState(a).id==='validated').length
 return `<div class="wrap page">${head({eyebrow:'Knowledge',title:'Every York IT guide',lede:'Instructions and reference imported from the current UIT website, organised by service'})}<p class="honesty"><strong>${all.length} guides · ${validated} validated</strong> Imported guidance is labelled as a draft until a service owner reviews it</p><div class="bar">${audienceFilter('kb',{controls:'kb-index'})}<label class="field field-inline"><span class="sr-only">Filter guides</span><input id="article-filter" type="search" autocomplete="off" placeholder="Filter ${all.length} guides"></label></div><nav class="jump" aria-label="Jump to a service"><span class="label">Jump to</span><ul>${[...model.services.values()].filter(s=>s.visibleArticles.length).map(s=>`<li><a href="#k-${e(s.id)}">${e(s.name)}</a></li>`).join('')}</ul></nav><div id="kb-index" class="topics-index">${[...model.services.values()].filter(s=>s.visibleArticles.length).map(s=>`<section class="index topic" aria-labelledby="k-${e(s.id)}"><h2 class="index-label" id="k-${e(s.id)}"><a href="${href(base,'/services/'+s.id+'/#guidance')}">${e(s.name)}</a> <span class="count">${s.visibleArticles.length}</span></h2><div class="index-body">${knowledgeList([...s.visibleArticles].sort((a,b)=>a.title.localeCompare(b.title)),base,'k-cols')}</div></section>`).join('')}</div><p id="filter-empty" class="empty-inline" hidden>No guides match this filter ${link(base+'/search/','Search everything')}</p></div>`
}

export function articleView(model,a,base='',readerHtml=''){
 const s=model.services.get(a.service_id)
 const offerings=[...model.offerings.values()].filter(o=>o.article_ids.includes(a.id))
 const tasks=[...model.journeys.values()].filter(j=>j.articleIds.includes(a.id))
 return `<div class="wrap page">${crumbs(base,[['/knowledge/','Knowledge'],['/services/'+s.id+'/',s.name]])}<div class="layout layout-reader"><div class="layout-main">${readerHtml}</div>${rail([
  ['Service',`<a class="link" href="${href(base,'/services/'+s.id+'/')}">${e(s.name)}${go}</a>`],
  offerings.length&&['Offerings',offerings.map(o=>`<a class="link" href="${href(base,'/offerings/'+o.id+'/')}">${e(o.name)}${go}</a>`).join('<br>')],
  tasks.length&&['Used in guided tasks',tasks.map(j=>`<a class="link" href="${href(base,'/tasks/'+j.id+'/')}">${e(j.title)}${go}</a>`).join('<br>')],
  ['Get help',`<a class="link" href="${href(base,'/help/')}">Contact the Service Desk${go}</a>`]
 ])}</div></div>`
}

// Search
export function searchView(base=''){
 return `<div class="wrap page">${head({eyebrow:'Search',title:'What do you need',lede:'Results combine guided tasks, services, offerings and guidance'})}${finder({id:'search-q',base,size:'hero'})}<div class="bar">${audienceFilter('search',{label:'Results for',options:['all','student','employee']})}<p id="result-status" class="meta" role="status" tabindex="-1"></p></div><div id="results" class="results"></div><noscript><p>Search needs JavaScript. ${link(base+'/tasks/','Browse tasks')} ${link(base+'/services/','Browse services')} ${link(base+'/knowledge/','Browse knowledge')}</p></noscript></div>`
}

// Support
export function helpView(model,contactHtml,base=''){
 const s=model.support
 return `<div class="wrap page">${head({eyebrow:'Support',title:'Get help',lede:'Reach the UIT Service Desk by phone, email, online request or in person'})}<ul class="channels-lg">${s.channels.map(c=>`<li><h2>${e(c.label)}</h2><a class="channel-value" href="${e(c.href)}">${e(c.value)}</a>${c.hours.length?`<dl>${c.hours.map(([who,when])=>`<div><dt>${e(who)}</dt><dd>${e(when)}</dd></div>`).join('')}</dl>`:''}${s.articles[c.id]?`<a class="link link-quiet" href="${href(base,articlePath(s.articles[c.id]))}" data-preview="${e(s.articles[c.id].id)}">${e(s.articles[c.id].title)}${go}</a>`:''}</li>`).join('')}</ul><p class="note">${e(s.note)}</p>${s.prepare?section('Before you contact us',`<ul class="k-list">${knowledgeRow(s.prepare,base)}</ul>`):''}${contactHtml?section('Original contact page',`<details class="about-block legacy"><summary><h3>Contact page as captured from the current UIT website</h3></summary><p class="note">Preserved for migration reference. Some references, such as a live chat button, belong to that page and are not available here</p><div class="prose">${contactHtml}</div></details><p class="meta">Source ${link(s.source_url,sourceLabel(s.source_url),'link link-quiet')}</p>`,{id:'contacts'}):''}</div>`
}

export function listingView(title,eyebrow,lede,pages,base=''){
 return `<div class="wrap page">${head({eyebrow,title,lede})}<ul class="k-list k-cols">${pages.map(p=>`<li class="k-row"><a href="${href(base,p.route)}"><span class="k-title">${e(p.title)}</span>${p.dynamic_review?'<span class="k-meta">Interactive content migration pending</span>':''}</a></li>`).join('')}</ul></div>`
}
export function pageView(p,base=''){
 const parent=p.type==='prompt'?['/prompts/','AI prompts']:['/resources/','Resources']
 return `<div class="wrap page">${crumbs(base,[parent])}<div class="layout layout-reader"><div class="layout-main">${head({eyebrow:p.type==='prompt'?'AI prompt':'Resource',title:p.title})}${p.dynamic_review?'<aside class="caution"><strong>Interactive content migration pending</strong><p>The source data is preserved in the repository for a functional replacement</p></aside>':''}<div class="prose">${p.html}</div></div>${rail([['Source',`<a class="link link-quiet" href="${e(p.source_url)}">Original source${away}</a>`],['Captured',e(p.captured_at.slice(0,10))]])}</div></div>`
}
export function notFoundView(base=''){
 return `<div class="wrap page">${head({eyebrow:'Page not found',title:'Let’s find what you need',lede:'The page may have moved during the migration from the old UIT website'})}${finder({id:'nf-q',base,size:'hero'})}<p class="actions">${link(base+'/tasks/','Browse tasks')}${link(base+'/services/','Browse services')}${link(base+'/help/','Get help')}</p></div>`
}
export {stateTag}
