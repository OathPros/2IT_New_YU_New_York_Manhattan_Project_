import fs from 'node:fs/promises'
const contentRoot=new URL('../content/',import.meta.url)
export async function loadContent(name){
 if(!/^[a-z-]+$/.test(name))throw new Error('Invalid content collection')
 const value=JSON.parse(await fs.readFile(new URL('generated/'+name+'.json',contentRoot),'utf8'))
 if(!Array.isArray(value)||!value.length||typeof value[0]!=='string')return value
 return Promise.all(value.map(async relative=>{
  if(typeof relative!=='string'||!/^records\/[a-z-]+\/[A-Za-z0-9_-]+\.json$/.test(relative))throw new Error('Invalid content reference')
  return JSON.parse(await fs.readFile(new URL(relative,contentRoot),'utf8'))
 }))
}
export async function loadArticles(){
 const articles=await loadContent('articles'),byId=new Map(articles.map(a=>[a.id,a]))
 const overrides=JSON.parse(await fs.readFile(new URL('editorial-overrides.json',contentRoot),'utf8'))
 const allowed=new Set(['id','service_id','title','issue','environment','cause','resolution_html','state','reviewed_at','editorial_status','review_flags','editorial_notes'])
 for(const update of overrides){
  const article=byId.get(update.id)
  if(!article)throw new Error('Unknown editorial article '+update.id)
  for(const field of Object.keys(update))if(!allowed.has(field))throw new Error('Cannot override '+field)
  Object.assign(article,update)
 }
 const ownership=JSON.parse(await fs.readFile(new URL('nexus/ownership.json',contentRoot),'utf8'))
 for(const [service,ids] of Object.entries(ownership))for(const id of ids){const article=byId.get(id);if(!article)throw new Error('Unknown NEXUS article '+id);article.service_id=service}
 return articles
}
