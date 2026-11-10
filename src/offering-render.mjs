import {escapeHtml as e} from './search.mjs'
import {link,arrow,rows} from './render.mjs'
export function offerCard(o,byArticle,byFamily,base=''){
 const family=byFamily.get(o.parent_service_id)
 const knowledge=o.article_ids.map(id=>byArticle.get(id)).filter(Boolean).slice(0,2)
 const tags=o.audiences.map(role=>`<span class="oc-tag">${e(role==='student'?'Students':role==='employee'?'Faculty and staff':'Visitors')}</span>`).join('')
 return `<article class="oc-card" data-offering data-role="${e(o.audiences.join(' '))}" data-category="${e(o.parent_service_id)}" data-label="${e(o.name.toLowerCase())}" data-find="${e([o.name,o.summary,family?.name||'',...o.audiences].join(' ').toLowerCase())}">
 <div class="oc-card-top"><span class="oc-category-label">${e(family?.name||'IT services')}</span><h3><a href="${base}/offerings/${e(o.id)}/">${e(o.name)}</a></h3><p>${e(o.summary)}</p><div class="oc-tags">${tags}</div></div>
 <div class="oc-card-bottom"><div class="oc-card-actions">${o.actions.map((a,i)=>`<a class="${i?'oc-secondary':'oc-primary'}" href="${e(a.url)}">${e(a.label)} <span aria-hidden="true">↗</span></a>`).join('')}<a class="oc-more" href="${base}/offerings/${e(o.id)}/">Service details <span aria-hidden="true">→</span></a></div>
 ${knowledge.length?`<div class="oc-knowledge"><strong>Related knowledge</strong>${knowledge.map(a=>`<a href="${base}/knowledge/${e(a.slug)}/" data-preview="${e(a.id)}">${e(a.title)} <span aria-hidden="true">→</span></a>`).join('')}</div>`:''}</div></article>`
}

export function offeringHome(offerings,services,articles,base=''){
 const fam=new Map(services.map(s=>[s.id,s])),byA=new Map(articles.map(a=>[a.id,a]))
 const groups=services.filter(s=>offerings.some(o=>o.parent_service_id===s.id)).sort((a,b)=>a.name.localeCompare(b.name))
 const audienceCount=r=>offerings.filter(o=>o.audiences.includes(r)).length
 return `<section class="shell hero oc-hero"><p class="eyebrow">Technology at York</p><h1>Find the service you need</h1><p class="oc-hero-intro">Browse specific IT services, take action and find help without sorting through broad categories</p><form action="${base}/search/" class="ask-form" role="search"><div class="ask-box ask-row"><label class="sr-only" for="home-query">Search IT knowledge</label><textarea id="home-query" class="question" name="q" rows="1" placeholder="Describe your question or issue" required></textarea><button class="send" aria-label="Search knowledge">${arrow}</button></div></form><div class="suggestions">${['Reset my password','Connect to Wi-Fi','Install software','Report phishing'].map(q=>link(base+'/search/?q='+encodeURIComponent(q),q,'suggestion')).join('')}</div></section>
 <section class="oc-catalog" id="browse-services" aria-labelledby="oc-title"><div class="shell"><div class="oc-catalog-header"><div><p class="eyebrow">Service catalogue</p><h2 id="oc-title">Explore IT services</h2><p>Services are grouped by what they provide, not by separate student or employee pages</p></div><p id="oc-count" role="status" aria-live="polite">Showing ${offerings.length} of ${offerings.length} services</p></div>
 <div class="oc-controls"><div class="oc-audience" role="group" aria-label="Filter services by audience"><button type="button" data-oc-audience="all" aria-pressed="true">All <span>${offerings.length}</span></button><button type="button" data-oc-audience="student" aria-pressed="false">Students <span>${audienceCount('student')}</span></button><button type="button" data-oc-audience="employee" aria-pressed="false">Faculty and staff <span>${audienceCount('employee')}</span></button><button type="button" data-oc-audience="visitor" aria-pressed="false">Visitors <span>${audienceCount('visitor')}</span></button></div><div class="oc-selectors"><label for="oc-query" class="sr-only">Filter service list</label><input id="oc-query" type="search" placeholder="Filter services" autocomplete="off"><label for="oc-category">Category</label><select id="oc-category"><option value="all">All categories</option>${groups.map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('')}</select><label for="oc-sort">Sort</label><select id="oc-sort"><option value="featured">Featured</option><option value="az">A–Z</option><option value="za">Z–A</option></select></div></div>
 <div id="oc-grid" class="oc-grid">${offerings.map(o=>offerCard(o,byA,fam,base)).join('')}</div>
 <div id="oc-empty" class="oc-empty" hidden><h3>No matching services</h3><p>Try another category or audience</p><button type="button" id="oc-reset">Clear filters</button></div></div></section>`
}

export function offeringDetail(o,services,articles,offerings,base=''){
 const family=services.find(s=>s.id===o.parent_service_id)
 const known=new Map(articles.map(a=>[a.id,a]))
 const knowledge=o.article_ids.map(id=>known.get(id)).filter(Boolean)
 const related=offerings.filter(x=>x.parent_service_id===o.parent_service_id&&x.id!==o.id).slice(0,8)
 return `<div class="shell workspace oc-detail"><nav class="breadcrumbs" aria-label="Breadcrumb">${link(base+'/','Home')}${link(base+'/services/','Categories')}${family?link(base+'/services/'+family.id+'/',family.name):''}</nav><p class="eyebrow">IT service</p><h1>${e(o.name)}</h1><p class="intro">${e(o.summary)}</p><div class="oc-tags">${o.audiences.map(x=>`<span class="oc-tag">${e(x==='student'?'Students':x==='employee'?'Faculty and staff':'Visitors')}</span>`).join('')}</div>
 <section class="oc-detail-section"><h2>Get started</h2><div class="oc-action-panel">${o.actions.map(a=>`<a class="oc-primary" href="${e(a.url)}">${e(a.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div></section>
 <section class="oc-detail-section"><div class="section-top"><h2>Knowledge and instructions</h2><span class="quiet">${knowledge.length} ${knowledge.length===1?'article':'articles'}</span></div>${knowledge.length?`<div class="oc-knowledge-list">${knowledge.map(a=>`<a href="${base}/knowledge/${e(a.slug)}/" data-preview="${e(a.id)}"><span><strong>${e(a.title)}</strong><small>${e(a.issue)}</small></span><span aria-hidden="true">→</span></a>`).join('')}</div>`:`<p>Service-specific instructions are being reviewed. Contact IT for help with this service</p>`}</section>
 ${related.length?`<section class="oc-detail-section"><h2>Related services</h2><div class="oc-related">${related.map(x=>`<a href="${base}/offerings/${e(x.id)}/"><strong>${e(x.name)}</strong><span>${e(x.summary)}</span></a>`).join('')}</div></section>`:''}
 <div class="oc-source"><strong>Source and review</strong><p>This service record is based on York's existing catalogue and has not yet been validated for production release</p><p>${o.source_urls.map(u=>link(u,'Source reference')).join(' ')}</p></div></div>`
}

export function serviceFamily(s,offers,articles,base=''){
 const associated=offers.filter(o=>o.parent_service_id===s.id),byA=new Map(articles.map(a=>[a.id,a])),byS=new Map([[s.id,s]])
 const included=new Set(associated.flatMap(o=>o.article_ids))
 const other=articles.filter(a=>a.service_id===s.id&&!included.has(a.id))
 return `<div class="shell workspace oc-family"><div class="breadcrumbs">${link(base+'/','Home')}${link(base+'/services/','All categories')}</div><p class="eyebrow">Service category</p><h1>${e(s.name)}</h1><p class="intro">${e(s.summary)}</p><div class="oc-family-count">${associated.length} specific services</div>
 <section class="oc-detail-section"><h2>Services and actions</h2><div class="oc-grid">${associated.map(o=>offerCard(o,byA,byS,base)).join('')}</div></section>
 ${other.length?`<section class="oc-detail-section"><h2>More knowledge in ${e(s.name)}</h2>${rows(other,base)}</section>`:''}
 ${s.details?.length?`<details class="service-details"><summary>Additional information and eligibility</summary>${s.details.map(d=>`<section><h2>${e(d.title)}</h2><div class="prose">${d.html}</div></section>`).join('')}</details>`:''}
 <div class="trail"><span>Need more support</span>${link(base+'/help/','Get IT help')}</div></div>`
}
