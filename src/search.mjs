export const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const stop=new Set('a an the i my me to for of and or do how can cannot with is are it on at in need want please york university'.split(' '))
export function terms(s){return String(s).toLowerCase().replace(/wi[ -]?fi/g,'wifi').replace(/sign[ -]?in|log[ -]?in/g,'login').replace(/[^\p{L}\p{N}]+/gu,' ').split(' ').filter(t=>t&&!stop.has(t))}
export function search(records,query,{audience='all'}={}){
 const needles=terms(query);if(!needles.length)return []
 const recovery=/\b(?:cannot|cant|unable|trouble|forgot|forgotten|lost)\b/.test(String(query).toLowerCase().replace(/'/g,''))&&/sign[ -]?in|log[ -]?in|login|password/i.test(query)&&! /\b(?:1password|github|zoom|outlook|gmail|eduroam|airyork|wifi|wi-fi)\b/i.test(query)
 const synonyms={wifi:['wireless','airyork','eduroam'],login:['passport','password'],password:['reset','recover','forgot'],email:['mail','outlook','gmail'],phone:['duo','mobile'],software:['apps','download']}
 return records.filter(r=>!r.blocked&&(audience==='all'||r.type==='service'||r.audiences.includes('all')||r.audiences.includes(audience))).map(r=>{const t=terms(r.title).join(' '),body=terms(r.text).join(' ');let score=needles.reduce((n,k)=>n+(t.includes(k)?20:body.includes(k)?4:0)+(synonyms[k]||[]).reduce((v,s)=>v+(t.includes(s)?4:body.includes(s)?1:0),0),0);if(recovery){if(r.type==='service'&&r.id==='passport-york')score+=100;else if(/passport york/i.test(r.title)&&/recover|reset|forgot/i.test(r.title))score+=70}score+=intentScore(r,needles,body);return {...r,score}}).filter(r=>r.score>4).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title))
}
// Guided tasks declare intent phrases. A task is boosted only when every intent term is present
// and every query term is understood by the task, so named products still win their own queries
export function intentScore(r,needles,body){
 if(!r.intents?.length)return 0
 const query=new Set(needles),known=' '+body+' '+r.intents.flatMap(terms).join(' ')+' '
 if(!needles.every(n=>known.includes(' '+n+' ')))return 0
 let best=0
 for(const intent of r.intents){const words=terms(intent);if(words.length&&words.every(w=>query.has(w)))best=Math.max(best,100+words.length*10)}
 return best
}
export function groupResults(results){
 const order=[['task','Guided tasks'],['service','Services'],['offering','Offerings'],['article','Guidance'],['resource','Resources'],['prompt','AI prompts']]
 return order.map(([type,label])=>({type,label,items:results.filter(r=>r.type===type)})).filter(g=>g.items.length)
}
export function validateArticle(a){const errors=[];for(const k of ['id','slug','title','issue','resolution_html'])if(!a[k])errors.push('Missing '+k+' on '+a.id);if(!a.environment?.length||!a.source_urls?.length)errors.push('Missing context or provenance on '+a.id);if(a.state==='validated'&&!a.reviewed_at)errors.push('Validation requires review evidence on '+a.id);if(/<(script|style|form|input|iframe|object)\b|\bon\w+\s*=|(?:href|src)=["']\s*(?:javascript|data):/i.test(a.resolution_html))errors.push('Unsafe article markup '+a.id);return errors}
