import fs from 'node:fs/promises'
import {validateArticle} from '../src/search.mjs'
import {loadContent as read,loadArticles} from '../src/load-content.mjs'
const [articles,services,ledger,stats]=await Promise.all([loadArticles(),read('services'),read('ledger'),read('stats')]);const errors=articles.flatMap(validateArticle),ids=new Set(articles.map(a=>a.id)),slugs=new Set()
for(const a of articles){if(slugs.has(a.slug))errors.push('Duplicate slug '+a.slug);slugs.add(a.slug)}
for(const s of services)for(const id of s.article_ids)if(!ids.has(id))errors.push('Missing article '+id)
for(const source of ledger)if(source.state==='structured'){if(new Set(source.assignments.map(a=>a.block_id)).size!==source.source_block_count)errors.push('Source coverage mismatch '+source.source_url);for(const a of source.assignments)if(a.article_id&&!ids.has(a.article_id))errors.push('Missing ledger article '+a.article_id)}
if(stats.posts_included!==0||ledger.some(s=>/\/\d{4}\/\d{2}\//.test(s.source_url)))errors.push('Posts must be excluded')
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`Checked ${articles.length} articles, ${services.length} services, and ${ledger.length} page sources`)
if(process.argv.includes('--release')&&(stats.pending_sources||ledger.some(r=>['unavailable','protected','redirected_outside_scope'].includes(r.state))||articles.some(a=>a.state!=='validated'))){console.error('Release blocked: resolve source failures and validate the imported content');process.exitCode=1}
