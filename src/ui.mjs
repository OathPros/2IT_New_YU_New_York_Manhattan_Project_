// Browser-safe presentation primitives shared by the static build and the client
import {escapeHtml as e} from './search.mjs'

export const audienceLabel={all:'Everyone',student:'Students',employee:'Faculty and staff',visitor:'Visitors'}
export const go='<span class="go" aria-hidden="true">→</span>'
export const away='<span class="go go-out" aria-hidden="true">↗</span>'
export const articlePath=a=>'/knowledge/'+a.slug+'/'
export const isExternal=url=>/^https?:\/\//.test(url)

export function isValidated(a){return a.state==='validated'&&!!a.reviewed_at}

// Honest knowledge state. Validation requires review evidence; imported content stays labelled as a draft
export function knowledgeState(a,quality){
 if(isValidated(a))return {id:'validated',label:'Validated',detail:'Reviewed '+a.reviewed_at.slice(0,10)}
 if(a.state==='archived')return {id:'archived',label:'Archived',detail:'Kept for reference only'}
 if(a.review_flags?.length||quality?.needs_review)return {id:'needs-review',label:'Needs review',detail:'Imported instructions need verification before use'}
 return {id:'draft',label:'Imported draft',detail:'Not validated by a service owner'}
}

export const stateTag=state=>`<span class="state state-${e(state.id)}">${e(state.label)}</span>`

export function audiences(list){
 const roles=(list||[]).filter(r=>r!=='all')
 return roles.length?roles.map(r=>audienceLabel[r]||r).join(' · '):audienceLabel.all
}

export function link(url,label,cls='link'){
 return `<a class="${cls}" href="${e(url)}">${e(label)}${isExternal(url)?away:go}</a>`
}

// Readable link text for source URLs (WCAG 2.4.4): host and path rather than "Source 1"
export function sourceLabel(url){try{const u=new URL(url);return (u.hostname.replace(/^www\./,'')+decodeURIComponent(u.pathname).replace(/\/(index\.html?)?$/,'')).replace(/\/+$/,'')}catch{return url}}