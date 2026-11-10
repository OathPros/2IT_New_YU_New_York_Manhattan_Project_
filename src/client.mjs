import {escapeHtml as e,search} from './search.mjs'
import {reader} from './render.mjs'
const root=document.getElementById('uit-next'),{base}=JSON.parse(document.getElementById('config').textContent),dialog=document.getElementById('kb-dialog'),dialogBody=document.getElementById('dialog-body');let previousFocus=null,index=null,matches=[],page=1
const cache=new Map(),notice=s=>document.getElementById('notice').textContent=s
const get=async path=>{const r=await fetch(base+path);if(!r.ok)throw new Error('Content unavailable');return r.json()}
const storage={get(){try{return sessionStorage.getItem('uit-audience')||'all'}catch{return 'all'}},set(v){try{sessionStorage.setItem('uit-audience',v)}catch{}}}
root.addEventListener('click',async event=>{
 const preview=event.target.closest('[data-preview]')
 if(preview&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&event.button===0){event.preventDefault();previousFocus=document.activeElement;try{const a=cache.get(preview.dataset.preview)||await get('/_data/articles/'+preview.dataset.preview+'.json');cache.set(a.id,a);dialogBody.innerHTML=reader(a,{base,popup:true});dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.close-dialog').focus()}catch{location.assign(preview.href)}return}
 if(event.target.closest('.close-dialog'))dialog.close()
 const copy=event.target.closest('[data-copy]');if(copy){try{await navigator.clipboard.writeText(new URL(copy.dataset.copy,location.origin).href);notice('Article link copied')}catch{notice('Copy the address from the full article page')}}
 if(event.target.closest('[data-print]'))window.print()
 const pagination=event.target.closest('[data-page]');if(pagination){page=Number(pagination.dataset.page);renderResults();document.getElementById('result-status').focus()}
})
dialog.addEventListener('close',()=>previousFocus?.focus())
for(const t of root.querySelectorAll('textarea')){t.addEventListener('input',()=>{t.style.height='auto';t.style.height=t.scrollHeight+'px'});t.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();t.form.requestSubmit()}})}
const audience=document.getElementById('audience'),filter=document.getElementById('article-filter')
function filterArticles(){let count=0;const role=audience.value,q=filter.value.toLowerCase().trim();for(const r of root.querySelectorAll('.kb-row')){r.hidden=!((role==='all'||r.dataset.audiences.split(' ').some(x=>x==='all'||x===role))&&(!q||r.textContent.toLowerCase().includes(q)));if(!r.hidden)count++}for(const [attribute,dataset] of [['data-action-audiences','actionAudiences'],['data-detail-audiences','detailAudiences']])for(const r of root.querySelectorAll('['+attribute+']'))r.hidden=role!=='all'&&!r.dataset[dataset].split(' ').some(x=>x==='all'||x===role);document.getElementById('filter-empty').hidden=count>0}
if(audience){audience.value=storage.get();audience.addEventListener('change',()=>{storage.set(audience.value);filterArticles()});filter.addEventListener('input',filterArticles);filterArticles()}
function renderResults(){const size=25,start=(page-1)*size,shown=matches.slice(start,start+size);document.getElementById('result-status').textContent=matches.length?`Showing ${start+1} to ${start+shown.length} of ${matches.length} matches`:'No matching guidance found';document.getElementById('results').innerHTML=shown.map(r=>`<div class="search-result"><a href="${base+e(r.route)}" ${r.type==='article'?`data-preview="${e(r.id)}"`:''}><span class="quiet">${r.type==='article'?'Knowledge article':r.type==='service'?'Service category':r.type==='offering'?'IT service':'Resource'}</span><h2>${e(r.title)}</h2></a><a class="text-link" href="${base+e(r.route)}">Open page &gt;&gt;</a></div>`).join('')+`<div class="pagination">${page>1?`<button class="secondary" data-page="${page-1}">Previous &gt;&gt;</button>`:''}${start+size<matches.length?`<button class="secondary" data-page="${page+1}">Next &gt;&gt;</button>`:''}</div>`+(!shown.length?`<p>Try a service name or a few words about your issue</p><a class="primary" href="${base}/help/">Get IT help &gt;&gt;</a>`:'')}
const searchForm=document.getElementById('search-form')
async function runSearch(){const q=document.getElementById('search-query').value.trim(),role=document.getElementById('search-audience').value;history.replaceState(null,'',location.pathname+'?'+new URLSearchParams({q,audience:role}));document.getElementById('result-status').textContent='Finding relevant guidance';try{index??=await get('/_data/search.json');matches=search(index,q,{audience:role});page=1;renderResults()}catch{document.getElementById('result-status').textContent='Search is unavailable';document.getElementById('results').innerHTML=`<a href="${base}/services/">Browse services &gt;&gt;</a>`}}
if(searchForm){const params=new URLSearchParams(location.search);document.getElementById('search-query').value=params.get('q')||'';document.getElementById('search-audience').value=params.get('audience')||storage.get();searchForm.addEventListener('submit',event=>{event.preventDefault();runSearch()});document.getElementById('search-audience').addEventListener('change',runSearch);await runSearch()}

const homeServiceGrid=document.getElementById('home-service-grid')
if(homeServiceGrid){
 const cards=Array.from(homeServiceGrid.querySelectorAll('[data-service-card]'))
 const buttons=Array.from(document.querySelectorAll('[data-service-audience]'))
 const searchInput=document.getElementById('home-service-search')
 const sortInput=document.getElementById('home-service-sort')
 const resultCount=document.getElementById('home-services-count')
 const emptyState=document.getElementById('home-services-empty')
 const initialOrder=new Map(cards.map((card,i)=>[card,i]))
 let selectedAudience='all'
 function applyServiceFilters(){
  const query=searchInput.value.trim().toLocaleLowerCase('en-CA')
  const sort=sortInput.value
  const ordered=Array.from(cards).sort((a,b)=>sort==='default'?initialOrder.get(a)-initialOrder.get(b):sort==='za'?b.dataset.name.localeCompare(a.dataset.name,'en-CA'):a.dataset.name.localeCompare(b.dataset.name,'en-CA'))
  for(const card of ordered)homeServiceGrid.appendChild(card)
  let visible=0
  for(const card of cards){
   const eligible=selectedAudience==='all'||card.dataset.audiences.split(' ').includes(selectedAudience)
   const matched=!query||card.dataset.search.includes(query)
   card.hidden=!(eligible&&matched)
   if(!card.hidden)visible++
  }
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.serviceAudience===selectedAudience))
  resultCount.textContent='Showing '+visible+' of '+cards.length+' services'
  emptyState.hidden=visible>0
 }
 for(const button of buttons)button.addEventListener('click',()=>{selectedAudience=button.dataset.serviceAudience;applyServiceFilters()})
 searchInput.addEventListener('input',applyServiceFilters)
 sortInput.addEventListener('change',applyServiceFilters)
 document.getElementById('home-service-reset').addEventListener('click',()=>{selectedAudience='all';searchInput.value='';sortInput.value='default';applyServiceFilters();searchInput.focus()})
 applyServiceFilters()
}

const offeringGrid=document.getElementById('oc-grid')
if(offeringGrid){
 const cards=Array.from(offeringGrid.querySelectorAll('[data-offering]'))
 const initial=new Map(cards.map((c,i)=>[c,i]))
 const buttons=Array.from(document.querySelectorAll('[data-oc-audience]'))
 const query=document.getElementById('oc-query')
 const category=document.getElementById('oc-category')
 const sorter=document.getElementById('oc-sort')
 const count=document.getElementById('oc-count')
 const empty=document.getElementById('oc-empty')
 let role='all'
 function apply(){
  const term=query.value.trim().toLocaleLowerCase('en-CA')
  const sorted=[...cards].sort((a,b)=>sorter.value==='featured'?initial.get(a)-initial.get(b):sorter.value==='az'?a.dataset.label.localeCompare(b.dataset.label,'en-CA'):b.dataset.label.localeCompare(a.dataset.label,'en-CA'))
  for(const card of sorted)offeringGrid.appendChild(card)
  let shown=0
  for(const card of cards){
   const eligible=(role==='all'||card.dataset.role.split(' ').includes(role))&&(category.value==='all'||card.dataset.category===category.value)&&(!term||card.dataset.find.includes(term))
   card.hidden=!eligible
   if(eligible)shown++
  }
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ocAudience===role)))
  count.textContent='Showing '+shown+' of '+cards.length+' services'
  empty.hidden=shown!==0
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{role=b.dataset.ocAudience;apply()}))
 query.addEventListener('input',apply)
 category.addEventListener('change',apply)
 sorter.addEventListener('change',apply)
 document.getElementById('oc-reset').addEventListener('click',()=>{role='all';query.value='';category.value='all';sorter.value='featured';apply();query.focus()})
 apply()
}
