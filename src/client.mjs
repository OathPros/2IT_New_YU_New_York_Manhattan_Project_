import {escapeHtml as e,search,groupResults} from './search.mjs'
import {reader} from './render.mjs'

const {base}=JSON.parse(document.getElementById('config').textContent)
document.documentElement.classList.add('js')
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)]
const notice=text=>{const n=$('#notice');n.textContent='';requestAnimationFrame(()=>n.textContent=text)}
const get=async path=>{const r=await fetch(base+path);if(!r.ok)throw new Error('Content unavailable');return r.json()}
const storage={get(){try{return sessionStorage.getItem('uit-audience')||'all'}catch{return 'all'}},set(v){try{sessionStorage.setItem('uit-audience',v)}catch{}}}
const typeLabel={task:'Guided task',service:'Service',offering:'Offering',article:'Guidance',resource:'Resource',prompt:'AI prompt'}
let indexPromise=null
const loadIndex=()=>indexPromise??=get('/_data/search.json').catch(error=>{indexPromise=null;throw error})

// Quick view, copy and print
const dialog=$('#kb-dialog'),dialogBody=$('#dialog-body'),cache=new Map()
let returnFocus=null
document.addEventListener('click',async event=>{
 const preview=event.target.closest('[data-preview]')
 if(preview&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){
  event.preventDefault();returnFocus=preview
  try{const a=cache.get(preview.dataset.preview)||await get('/_data/articles/'+preview.dataset.preview+'.json');cache.set(a.id,a);dialogBody.innerHTML=reader(a,{base,popup:true});if(palette.open)palette.close();dialog.showModal();dialog.scrollTop=0;$('.close-dialog',dialog).focus()}catch{location.assign(preview.href)}
  return
 }
 if(event.target.closest('.close-dialog'))dialog.close()
 const copy=event.target.closest('[data-copy]')
 if(copy){try{await navigator.clipboard.writeText(new URL(copy.dataset.copy,location.origin).href);notice('Article link copied')}catch{notice('Copy the address from the full article page')}}
 if(event.target.closest('[data-print]'))window.print()
})
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})
dialog.addEventListener('close',()=>{returnFocus?.focus();returnFocus=null})

// Instant finder used by the hero, the command palette, the search page and the 404 page
function resultItem(r,cls='fr-item'){
 return `<li><a class="${cls}" href="${e(base+r.route)}"><span class="fr-title">${e(r.title)}</span><span class="fr-meta">${e(typeLabel[r.type]||'Page')}${r.context?' · '+e(r.context):''}</span></a></li>`
}
function finderMarkup(results,q,tasks){
 if(!q)return tasks.length?`<div class="fr-group"><p class="fr-label">Most needed</p><ul>${tasks.map(t=>resultItem(t)).join('')}</ul></div>`:''
 if(!results.length)return `<p class="fr-empty">No direct match for “${e(q)}”</p><a class="fr-all fr-item" href="${e(base+'/help/')}">Get help from a person</a>`
 const limits={task:3,service:3,offering:3,article:5,resource:2,prompt:2}
 return groupResults(results).map(g=>`<div class="fr-group"><p class="fr-label">${e(g.label)}</p><ul>${g.items.slice(0,limits[g.type]).map(r=>resultItem(r)).join('')}</ul></div>`).join('')+`<a class="fr-all fr-item" href="${e(base+'/search/?q='+encodeURIComponent(q))}">See all ${results.length} results</a>`
}
function setupFinder(form){
 const input=$('input[type=search]',form),box=$('[data-finder-results]',form),status=$('[data-finder-status]',form)
 const inPalette=!!form.closest('#palette'),onSearchPage=form.closest('.kind-search')
 let timer=0
 async function update(){
  const q=input.value.trim()
  if(onSearchPage)return
  try{
   const index=await loadIndex()
   const results=q?search(index,q,{audience:storage.get()}):[]
   const tasks=inPalette&&!q?index.filter(r=>r.type==='task').slice(0,6):[]
   box.innerHTML=finderMarkup(results,q,tasks)
   box.hidden=!box.innerHTML
   status.textContent=q?(results.length?results.length+' results available':'No direct match'):''
  }catch{box.hidden=true}
 }
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(update,90)})
 input.addEventListener('focus',()=>{loadIndex().catch(()=>{});if(inPalette||input.value.trim())update()})
 form.addEventListener('keydown',event=>{
  const items=$$('.fr-item',box);if(box.hidden||!items.length){return}
  const i=items.indexOf(document.activeElement)
  if(event.key==='ArrowDown'){event.preventDefault();(items[i+1]||items[0]).focus()}
  else if(event.key==='ArrowUp'){event.preventDefault();i<=0?input.focus():items[i-1].focus()}
  else if(event.key==='Escape'&&!inPalette){event.preventDefault();box.hidden=true;input.focus()}
 })
 form.addEventListener('focusout',event=>{if(!inPalette&&!form.contains(event.relatedTarget)){box.hidden=true}})
 if(onSearchPage)form.addEventListener('submit',event=>{event.preventDefault();runSearch()})
}
$$('[data-finder]').forEach(setupFinder)

// Command palette
const palette=$('#palette'),paletteInput=$('#palette-q')
let paletteReturn=null
function openPalette(){if(palette.open)return;paletteReturn=document.activeElement;palette.showModal();paletteInput.focus();paletteInput.select();paletteInput.dispatchEvent(new Event('focus'))}
$$('[data-palette-open]').forEach(a=>a.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey)return;event.preventDefault();openPalette()}))
palette.addEventListener('click',event=>{if(event.target===palette)palette.close()})
palette.addEventListener('close',()=>{paletteReturn?.focus?.();paletteReturn=null})
document.addEventListener('keydown',event=>{
 if((event.key==='k'||event.key==='K')&&(event.ctrlKey||event.metaKey)){event.preventDefault();palette.open?palette.close():openPalette()}
})

// Audience filtering for lists, service guidance and service details
const roleMatch=(roles,role)=>role==='all'||roles.includes('all')||roles.includes(role)
function applyAudience(group){
 const role=$('[aria-pressed="true"]',group)?.dataset.audience||'all'
 const scope=document.getElementById(group.dataset.controls)||document
 const fold=s=>s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,'')
 const words=fold($('#article-filter')?.value||'').split(/\s+/).filter(Boolean)
 let shown=0,total=0
 for(const row of $$('[data-audiences]',scope)){
  const roles=row.dataset.audiences.split(' ')
  const isRow=row.matches('.k-row,[data-service-card]')
  const visible=roleMatch(roles,role)&&(!isRow||!words.length||(t=>words.every(w=>t.includes(w)))(fold((row.dataset.find||row.textContent)+' '+(row.closest('.topic')?.querySelector('h2,h3')?.firstChild?.textContent||''))))
  row.hidden=!visible
  if(isRow){total++;if(visible)shown++}
 }
 for(const t of $$('.topic',scope)){
  const n=$$('.k-row',t).filter(r=>!r.hidden).length
  t.hidden=!n
  const c=$('.count',t);if(c)c.textContent=String(n)
  const id=t.getAttribute('aria-labelledby');const j=id&&$(`.jump a[href="#${id}"]`);if(j)j.parentElement.hidden=!n
 }
 for(const a of $$('.about-block',document))a.hidden=!roleMatch(a.dataset.audiences.split(' '),role)
 const empty=$('#filter-empty');if(empty)empty.hidden=shown>0
 const count=$('#service-count');if(count&&scope.id==='service-index')count.textContent=`Showing ${shown} of ${total} services`
 const kbCount=$('#kb-count');if(kbCount&&scope.id==='kb-index')kbCount.textContent=`Showing ${shown} of ${total} guides`
}
for(const group of $$('[data-audience-filter]')){
 if(group.dataset.audienceFilter==='search')continue
 const stored=storage.get()
 if($(`[data-audience="${stored}"]`,group))for(const b of $$('button',group))b.setAttribute('aria-pressed',String(b.dataset.audience===stored))
 group.addEventListener('click',event=>{const b=event.target.closest('button[data-audience]');if(!b)return;for(const x of $$('button',group))x.setAttribute('aria-pressed',String(x===b));storage.set(b.dataset.audience);applyAudience(group)})
 applyAudience(group)
}
const articleFilter=$('#article-filter')
if(articleFilter)articleFilter.addEventListener('input',()=>{const g=$('[data-audience-filter]');if(g)applyAudience(g)})

// Journey branches. Without JavaScript every branch is visible; with it, one audience is shown at a time
for(const area of $$('[data-branching]')){
 const group=$('[data-branch-buttons]',area);if(!group)continue
 const buttons=$$('button',group),panels=$$('[data-branch-panel]',area)
 const select=(audience,remember)=>{for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.branch===audience));for(const p of panels)p.hidden=p.dataset.branchPanel!==audience;if(remember)storage.set(audience)}
 group.hidden=false;area.classList.add('is-branching')
 const stored=storage.get()
 select(buttons.some(b=>b.dataset.branch===stored)?stored:buttons[0].dataset.branch,false)
 group.addEventListener('click',event=>{const b=event.target.closest('button');if(b){select(b.dataset.branch,true);notice(b.querySelector('.choose-label').textContent+' steps shown')}})
}

// Catalogue filters
const offeringGrid=$('#oc-grid')
if(offeringGrid){
 const rows=$$('[data-offering]',offeringGrid),groups=$$('.svc-group',offeringGrid),buttons=$$('[data-oc-audience]')
 const query=$('#oc-query'),category=$('#oc-category'),count=$('#oc-count'),empty=$('#oc-empty')
 let role='all'
 function apply(){
  const term=query.value.trim().toLocaleLowerCase('en-CA')
  let shown=0
  for(const row of rows){const ok=(role==='all'||row.dataset.role.split(' ').includes(role))&&(category.value==='all'||row.dataset.category===category.value)&&(!term||row.dataset.find.includes(term));row.hidden=!ok;if(ok)shown++}
  for(const g of groups)g.hidden=!$$('[data-offering]',g).some(r=>!r.hidden)
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.ocAudience===role))
  count.textContent=`Showing ${shown} of ${rows.length} offerings`
  empty.hidden=shown>0
 }
 for(const b of buttons)b.addEventListener('click',()=>{role=b.dataset.ocAudience;apply()})
 query.addEventListener('input',apply);category.addEventListener('change',apply)
 $('#oc-reset').addEventListener('click',()=>{role='all';query.value='';category.value='all';apply();query.focus()})
 const params=new URLSearchParams(location.search);if(params.get('service')&&$(`option[value="${CSS.escape(params.get('service'))}"]`,category))category.value=params.get('service')
 apply()
}

// Full search results
const resultsBox=$('#results')
function searchAudience(){return $('[data-audience-filter="search"] [aria-pressed="true"]')?.dataset.audience||'all'}
async function runSearch(){
 const input=$('#search-q'),q=input.value.trim(),role=searchAudience(),status=$('#result-status')
 history.replaceState(null,'',location.pathname+(q?'?'+new URLSearchParams({q,audience:role}):''))
 if(!q){status.textContent='Describe a task, a service or a problem';resultsBox.innerHTML='';return}
 status.textContent='Finding relevant guidance'
 try{
  const results=search(await loadIndex(),q,{audience:role})
  if(!results.length){status.textContent='No matching guidance found';resultsBox.innerHTML=`<div class="empty"><h2>Nothing matched “${e(q)}”</h2><p>Try a service name or a few words about the problem</p><p class="actions"><a class="btn" href="${e(base)}/tasks/">Browse tasks</a><a class="btn btn-primary" href="${e(base)}/help/">Get help from a person</a></p></div>`;return}
  status.textContent=`${results.length} results for “${q}”`
  const best=results[0]
  resultsBox.innerHTML=`<article class="best"><p class="label">Best match · ${e(typeLabel[best.type]||'Page')}</p><h2><a href="${e(base+best.route)}"${best.type==='article'?` data-preview="${e(best.id)}"`:''}>${e(best.title)}</a></h2>${best.summary?`<p>${e(best.summary)}</p>`:''}${best.context?`<p class="meta">${e(best.context)}</p>`:''}</article>`+groupResults(results.slice(1)).map(g=>{const show=g.items.slice(0,12),rest=g.items.slice(12);const item=r=>`<li><a href="${e(base+r.route)}"${r.type==='article'?` data-preview="${e(r.id)}"`:''}><span class="r-title">${e(r.title)}</span>${r.summary?`<span class="r-sum">${e(r.summary)}</span>`:''}${r.context?`<span class="meta">${e(r.context)}</span>`:''}</a></li>`;return `<section class="result-group" aria-label="${e(g.label)}"><h2 class="index-label">${e(g.label)} <span class="count">${g.items.length}</span></h2><div><ul class="r-list">${show.map(item).join('')}</ul>${rest.length?`<ul class="r-list" hidden>${rest.map(item).join('')}</ul><button type="button" class="link" data-more>Show ${rest.length} more ${e(g.label.toLowerCase())}</button>`:''}</div></section>`}).join('')
 }catch{status.textContent='Search is unavailable';resultsBox.innerHTML=`<p><a class="link" href="${e(base)}/services/">Browse services</a></p>`}
}
if(resultsBox){
 const params=new URLSearchParams(location.search),group=$('[data-audience-filter="search"]')
 $('#search-q').value=params.get('q')||''
 const role=params.get('audience')||storage.get()
 for(const b of $$('button',group))b.setAttribute('aria-pressed',String(b.dataset.audience===role))
 if(!$('[aria-pressed="true"]',group))$('button',group).setAttribute('aria-pressed','true')
 group.addEventListener('click',event=>{const b=event.target.closest('button[data-audience]');if(!b)return;for(const x of $$('button',group))x.setAttribute('aria-pressed',String(x===b));storage.set(b.dataset.audience);runSearch()})
 resultsBox.addEventListener('click',event=>{const more=event.target.closest('[data-more]');if(more){const list=more.previousElementSibling;list.hidden=false;$('a',list)?.focus();more.remove()}})
 runSearch()
}
