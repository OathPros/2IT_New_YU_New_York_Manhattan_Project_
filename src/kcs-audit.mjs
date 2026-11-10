import {loadContent,loadArticles} from './load-content.mjs'
export const vendorDomains=new Set(['support.1password.com','support.microsoft.com','support.google.com','support.apple.com','support.mozilla.org','support.zoom.com','docs.github.com','help.1password.com','learn.microsoft.com'])
export function knowledgeEvidence(a){
 const html=a.resolution_html||''
 const links=[...html.matchAll(/href=["']([^"']+)["']/gi)].map(x=>x[1].replace(/&amp;/g,'&'))
 const official=links.filter(url=>{try{return vendorDomains.has(new URL(url).hostname)}catch{return false}})
 const internal=links.filter(url=>url.startsWith('/knowledge/')||url.startsWith('https://www.yorku.ca/uit/'))
 const plain=html.replace(/<[^>]+>/g,' ').replace(/&(?:gt|lt|amp|quot|nbsp);/g,' ').replace(/\s+/g,' ').trim()
 const specific=/<(?:ol|ul)\b/i.test(html)&&/<li\b/i.test(html)
 const actionable=/(?:\b(?:open|select|click|sign in|sign into|enter|download|install|submit|contact|email|follow|choose|request|verify|check|reset|create|add|remove|go to|save|call|visit|navigate|copy|report)\b)/i.test(plain)
 const placeholder=/\[\s*insert\b|(?:coming soon|learn more|click here)\s*$/i.test(plain)
 const broken=plain.length<55||placeholder||(!actionable&&!official.length&&!specific)
 const mode=broken?'needs_resolution':official.length?'vendor_maintained_reference':internal.length?'york_reference':specific?'local_procedure':'direct_answer'
 return {id:a.id,title:a.title,service_id:a.service_id,mode,needs_review:broken,official_links:official,internal_links:internal,has_steps:specific,word_count:plain.split(' ').length}
}
export function auditKnowledge(articles){return {total:articles.length,results:articles.map(knowledgeEvidence),counts:articles.map(knowledgeEvidence).reduce((n,r)=>(n[r.mode]=(n[r.mode]||0)+1,n),{})}}
