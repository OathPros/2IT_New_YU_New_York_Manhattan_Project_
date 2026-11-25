// Browser-safe page shell, knowledge reader and finder. Used by the static build and the client quick view
import {escapeHtml as e} from './search.mjs'
import {go,away,link,articlePath,knowledgeState,stateTag,audiences,isExternal,sourceLabel} from './ui.mjs'
export {go,away,link,articlePath}

export function finder({id,base='',label='Search tasks, services and guidance',placeholder='Describe what you need',value='',size=''}){
 return `<form class="finder${size?' finder-'+size:''}" action="${e(base)}/search/" role="search" data-finder><label class="sr-only" for="${e(id)}">${e(label)}</label><input id="${e(id)}" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="${e(placeholder)}" value="${e(value)}" aria-describedby="${e(id)}-hint" aria-controls="${e(id)}-results"><button class="finder-go" type="submit"><span class="sr-only">Search</span><span aria-hidden="true">→</span></button><p class="sr-only" id="${e(id)}-hint">Results appear as you type. Press the down arrow to move into results</p><div class="finder-results" id="${e(id)}-results" data-finder-results hidden></div><p class="sr-only" role="status" data-finder-status></p></form>`
}

export function reader(a,{base='',popup=false,service=null}={}){
 const state=knowledgeState(a)
 const titleId=popup?'popup-title':'article-title'
 const validated=state.id==='validated'
 const tools=`<div class="reader-tools">${link(base+'/services/'+a.service_id+'/',service?.name||a.service_name||'Service','link link-quiet')}<button type="button" class="link link-quiet" data-copy="${e(base+articlePath(a))}">Copy link</button>${popup?link(base+articlePath(a),'Open full article','link link-strong'):'<button type="button" class="link link-quiet" data-print>Print</button>'}</div>`
 return `<article class="reader${popup?' reader-popup':''}">
<header class="reader-head"><p class="kicker"><span class="mono">${e(a.id)}</span><span>${e(a.type)}</span>${stateTag(state)}</p><h1 id="${titleId}">${e(a.title)}</h1>${validated?'':`<p class="reader-state">${e(state.label)} · ${e(state.detail)}</p>`}${tools}</header>
<section class="halo" aria-label="Description"><dl><div><dt>Issue</dt><dd>${e(a.issue)}</dd></div><div><dt>Environment</dt><dd><ul>${a.environment.map(x=>`<li>${e(x)}</li>`).join('')}</ul></dd></div>${a.cause?`<div><dt>Cause</dt><dd>${e(a.cause)}</dd></div>`:''}</dl></section>
${a.review_flags?.length?'<aside class="caution"><strong>Content review required</strong><p>These imported instructions need verification before use</p></aside>':''}
<section class="resolution"><h2>Resolution</h2><div class="prose">${a.resolution_html}</div></section>
<footer class="provenance"><h2>Source and review</h2><dl><div><dt>Knowledge state</dt><dd>${e(state.label)}${validated?'':' · '+e(state.detail)}</dd></div><div><dt>Captured</dt><dd>${e(a.captured_at.slice(0,10))}${a.source_modified_at?' · Source updated '+e(a.source_modified_at.slice(0,10)):''}</dd></div><div><dt>Review</dt><dd>${validated?'Reviewed '+e(a.reviewed_at.slice(0,10)):'No validation date recorded'}</dd></div><div><dt>Audience</dt><dd>${e(audiences(a.audiences))}</dd></div></dl><p class="provenance-links">${a.source_urls.map(u=>link(u,a.source_urls.length>1?'Source '+sourceLabel(u):'Original source','link link-quiet')).join('')}${link('mailto:askIT@yorku.ca?subject='+encodeURIComponent('Knowledge update: '+a.title),'Suggest an update','link link-quiet')}</p></footer>
</article>`
}

// A knowledge row always shows audience and knowledge state so duplicate titles stay distinguishable
export function knowledgeRow(a,base='',{note=''}={}){
 const state=knowledgeState(a)
 return `<li class="k-row" data-audiences="${e((a.audiences||['all']).join(' '))}" data-find="${e((a.title+' '+(a.issue||'')).toLowerCase())}"><a href="${e(base+articlePath(a))}" data-preview="${e(a.id)}"><span class="k-title">${e(a.title)}</span><span class="k-meta">${e(audiences(a.audiences))}${note?' · '+e(note):''} · ${e(state.label)}</span></a></li>`
}
export const knowledgeList=(list,base='',cls='')=>`<ul class="k-list${cls?' '+cls:''}">${list.map(a=>knowledgeRow(a,base)).join('')}</ul>`

const nav=[['tasks','/tasks/','Tasks'],['services','/services/','Services'],['knowledge','/knowledge/','Knowledge'],['help','/help/','Get help']]

function footer(base,support,compact){
 const channels=support?.channels||[]
 return `<footer class="foot">${compact?'':`<div class="wrap foot-help"><h2 class="foot-title">Get help from a person</h2><ul class="channels">${channels.map(c=>`<li><span class="label">${e(c.label)}</span><a href="${e(c.href)}">${e(c.value)}</a>${c.hours.length?`<dl>${c.hours.map(([who,when])=>`<div><dt>${e(who)}</dt><dd>${e(when)}</dd></div>`).join('')}</dl>`:''}</li>`).join('')}</ul>${support?.note?`<p class="foot-note">${e(support.note)} ${link(base+'/help/','Faculty IT support','link link-invert')}</p>`:''}</div>`}<div class="wrap foot-base"><p><span class="mark-york">York University</span> University Information Technology</p><ul>${[['/resources/','Resources'],['/prompts/','AI prompts'],['https://www.yorku.ca/about/privacy-legal/','Privacy']].map(([u,l])=>`<li><a href="${e(isExternal(u)?u:base+u)}">${e(l)}</a></li>`).join('')}</ul></div></footer>`
}

const ownHelp=new Set(['task','tasks','service','offering','help'])
export function shell(title,body,{base='',current='',support=null,description='Technology services, tasks and knowledge at York University',kind='page',alternate=''}={}){
 return `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${e(description)}"><meta name="color-scheme" content="light"><title>${e(title)} | York University IT</title><link rel="icon" type="image/svg+xml" href="${base}/favicon.svg"><link rel="preload" href="${base}/assets/fonts/ibmplexsans-regular.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="${base}/assets/fonts/ibmplexsans-semibold.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${base}/assets/styles.css">${alternate?`<link rel="alternate" type="application/json" href="${e(alternate)}">`:''}</head><body class="kind-${e(kind)}"><div id="app"><a class="skip" href="#main">Skip to content</a><header class="top"><div class="wrap top-in"><a class="mark" href="${base}/"><span class="mark-york">York University</span><span class="mark-it">IT</span></a><nav class="nav" aria-label="Main"><ul>${nav.map(([id,href,label])=>`<li><a href="${base+href}"${current===id?' aria-current="page"':''}>${label}</a></li>`).join('')}</ul></nav><a class="find-open" href="${base}/search/" data-palette-open><span>Search</span><kbd aria-hidden="true">Ctrl K</kbd></a></div></header><main id="main" tabindex="-1">${body}</main>${footer(base,support,ownHelp.has(kind))}<dialog id="kb-dialog" class="sheet" aria-labelledby="popup-title"><div class="sheet-bar"><span class="label">Quick view</span><button type="button" class="link link-quiet close-dialog">Close<span class="sr-only"> quick view</span></button></div><div id="dialog-body"></div></dialog><dialog id="palette" class="palette" aria-label="Search York IT"><div class="palette-in">${finder({id:'palette-q',base,size:'palette'})}<p class="palette-hint"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></p></div></dialog><div id="notice" class="notice" role="status" aria-live="polite"></div><script id="config" type="application/json">${JSON.stringify({base}).replace(/</g,'\\u003c')}</script><script type="module" src="${base}/assets/client.mjs"></script></div></body></html>`
}
