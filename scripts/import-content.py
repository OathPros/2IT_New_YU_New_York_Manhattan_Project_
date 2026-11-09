#!/usr/bin/env python3
"""Import public UIT pages, packages and prompts. Posts are out of scope."""
import concurrent.futures as futures
import hashlib, json, re, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin,urlsplit,urlunsplit,quote,unquote
from urllib.request import urlopen,Request
from urllib.error import HTTPError
from xml.etree import ElementTree as ET
from bs4 import BeautifulSoup,Tag,NavigableString
ROOT=Path(__file__).resolve().parents[1];HOST='https://www.yorku.ca';BASE=HOST+'/uit/'
NS={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
SOURCE=ROOT/'content/sources';SOURCE.mkdir(parents=True,exist_ok=True)
EXCLUDE=re.compile(r'/\d{4}/\d{2}/|/(?:category|tag|author|page)/|/(?:news|announcements-alerts)/?$|/wp-(?:content|admin|includes|json|login)|/feed/|/sitemap',re.I)
ASSETS={'.png','.jpg','.jpeg','.gif','.webp','.svg','.pdf','.doc','.docx','.xls','.xlsx','.ppt','.pptx','.zip','.exe','.msi','.dmg','.pkg','.mp4','.mp3','.woff','.woff2','.ttf','.txt','.csv','.ico'}
TAGS={'p','br','strong','b','em','i','u','ul','ol','li','a','img','figure','figcaption','blockquote','pre','code','table','caption','thead','tbody','tr','td','th','h2','h3','h4','h5','h6','sup','sub','dl','dt','dd','details','summary','div','span'}
def now():return datetime.now(timezone.utc).isoformat()
def text(n):return re.sub(r'\s+',' ',n.get_text(' ',strip=True)).strip()
def normalize(value,source=BASE):
 u=urlsplit(urljoin(source,value));p=re.sub('/+','/',unquote(u.path))
 if u.hostname not in ['www.yorku.ca','yorku.ca'] or not p.startswith('/uit/') or u.query or EXCLUDE.search(p) or Path(p).suffix.lower() in ASSETS:return None
 if not Path(p).suffix:p=p.rstrip('/')+'/'
 return HOST+p
def fetch(url):
 u=urlsplit(url);encoded=urlunsplit((u.scheme,u.netloc,quote(unquote(u.path),safe='/@:-_.~'),u.query,''))
 with urlopen(Request(encoded,headers={'User-Agent':'York-UIT-Pages-Migration/1.0'}),timeout=24) as r:return r.geturl(),r.read(12_000_000),dict(r.headers)
def sanitize(fragment,url):
 s=BeautifulSoup(str(fragment),'html.parser')
 for tabs in s.select('.kt-tabs-wrap'):
  labels=[text(x) for x in tabs.select(':scope > .kt-tabs-title-list .kt-title-text')]
  for label,panel in zip(labels,tabs.select(':scope > .kt-tabs-content-wrap > .kt-tab-inner-content')):
   h=s.new_tag('h2');h.string=label;panel.insert(0,h)
  for nav in tabs.select(':scope > .kt-tabs-title-list'):nav.decompose()
 for button in s.select('button'):
  label=button.select_one('.kt-blocks-accordion-title')
  if label or button.get('aria-controls'):
   h=s.new_tag('h4');h.string=text(label or button);button.replace_with(h)
 for p in s.select('p'):
  strong=p.find(['strong','b']);value=text(p)
  if strong and value==text(strong) and len(value)<250 and (value.endswith('?') or re.fullmatch(r'(Windows|macOS|Mac OSX|Android|iOS|iPhone|iPad)[\w .()/-]*',value,re.I)):p.name='h4'
 for node in list(s.find_all(True)):
  if node.parent is None:continue
  if node.name=='iframe':
   target=urljoin(url,node.get('src',''));
   if urlsplit(target).scheme not in {'http','https'}:node.decompose();continue
   a=s.new_tag('a',href=target);a.string=node.get('title') or 'Open embedded guide';p=s.new_tag('p');p.append(a);node.replace_with(p);continue
  if node.name in {'script','style','noscript','form','input','select','textarea','button','svg','canvas','template','meta','link','nav'}:node.decompose();continue
  if node.name=='h1':node.name='h2'
  if node.name not in TAGS:node.unwrap();continue
  attrs={}
  if node.get('id') or node.get('name'):attrs['id']=node.get('id') or node['name']
  if node.name=='a':
   u=urljoin(url,node.get('href',''))
   if urlsplit(u).scheme in {'https','http','tel','mailto'}:attrs['href']=u
  if node.name=='img':
   u=urljoin(url,node.get('src',''))
   if urlsplit(u).scheme not in {'http','https'}:node.decompose();continue
   attrs.update(src=u,alt=node.get('alt',''),loading='lazy')
  if node.name in ['th','td']:
   for key in ['colspan','rowspan','scope']:
    if node.get(key):attrs[key]=node[key]
  if node.name=='ol' and str(node.get('start','')).isdigit():attrs['start']=node['start']
  node.attrs=attrs
 for node in reversed(s.find_all(['div','span'])):
  if not node.get('id'):node.unwrap()
 return str(s)
def capture(url):
 ident=hashlib.sha256(url.encode()).hexdigest()[:16];path=SOURCE/(ident+'.json')
 if path.exists():
  old=json.loads(path.read_text())
  if old['status']=='captured':return old
 row={'id':ident,'url':url,'captured_at':now(),'status':'failed','links':[]}
 try:
  final,data,headers=fetch(url);s=BeautifulSoup(data,'html.parser');main=s.select_one('.entry-content') or s.select_one('main') or s.body or s
  title=s.select_one('h1.entry-title') or s.select_one('h1') or s.title
  mod=s.find('meta',property='article:modified_time');published=s.find('meta',property='article:published_time') or s.select_one('time[datetime]')
  row.update(status='captured',final_url=final,title=text(title) if title else url,original_html=str(main),html=sanitize(main,url),text=text(main),sha256=hashlib.sha256(data).hexdigest(),source_modified_at=mod.get('content') if mod else None,source_published_at=(published.get('content') or published.get('datetime')) if published else None)
  row['links']=sorted({u for a in s.select('a[href]') if (u:=normalize(a['href'],url))})
  row['assets']=sorted({urljoin(url,a.get('src') or a.get('href') or '') for a in main.select('img[src],iframe[src],a[href]') if a.name in ['img','iframe'] or Path(urlsplit(a.get('href','')).path).suffix.lower() in ASSETS})
  row['protected']=bool(s.select('input[type="password"]'))
  row['dynamic_review']=len(row['text'])<500 and any(len(x.get_text())>2000 for x in main.select('script'))
  row['forms']=[{'action':urljoin(url,f.get('action','')),'labels':[text(x) for x in f.select('label')]} for f in main.select('form') if f.select('input:not([type="hidden"]),textarea,select')]
 except HTTPError as ex:row.update(error=str(ex),http_status=ex.code)
 except Exception as ex:row['error']=str(ex)
 temp=path.with_suffix('.tmp');temp.write_text(json.dumps(row,ensure_ascii=False,indent=2));temp.replace(path);return row
def sitemap(url):
 cache=ROOT/'content/sitemaps'/(hashlib.sha256(url.encode()).hexdigest()[:8]+'-'+Path(urlsplit(url).path).name);cache.parent.mkdir(parents=True,exist_ok=True)
 try:_,data,_=fetch(url);cache.write_bytes(data)
 except Exception:
  if not cache.exists():return []
  data=cache.read_bytes()
 document=ET.fromstring(data);urls=[x.text for x in document.findall('.//s:loc',NS)]
 if document.tag.endswith('sitemapindex'):
  return [item for child in urls if re.search(r'/(?:page|package|prompt)-sitemap\d*\.xml$',child) for item in sitemap(child)]
 return [u for u in urls if normalize(u)]
def run():
 known={BASE,BASE+'cio/',BASE+'infosec/',BASE+'cio/opex/kb/kcs/our-content-standard/'}
 for source in SOURCE.glob('*.json'):known.add(json.loads(source.read_text())['url'])
 for url in [BASE+'wp-sitemap-posts-'+kind+'-1.xml' for kind in ['page','package','prompt']]+[BASE+name+'/sitemap_index.xml' for name in ['cio','infosec']]:
  try:known.update(sitemap(url))
  except Exception as ex:print('Sitemap warning',url,str(ex),flush=True)
 pending=sorted({normalize(u) for u in known if normalize(u)});known=set(pending);done={};start=time.time()
 with futures.ThreadPoolExecutor(max_workers=6) as pool:
  running={}
  while pending or running:
   while pending and len(running)<6:
    u=pending.pop(0);running[pool.submit(capture,u)]=u
   completed,_=futures.wait(running,return_when=futures.FIRST_COMPLETED)
   for task in completed:
    u=running.pop(task);r=task.result();done[u]=r
    for target in r['links']:
     if target not in known:known.add(target);pending.append(target)
    if len(done)%20==0:save(known,done);print(f'Processed {len(done)} of {len(known)} pages in {time.time()-start:.0f}s',flush=True)
 save(known,done);print('Capture complete',len(done),'pages',sum(r['status']=='captured' for r in done.values()),'captured',flush=True)
def save(known,done):
 rows=[{k:r.get(k) for k in ['id','url','title','status','error','protected','dynamic_review']} for r in done.values()]
 (ROOT/'content/inventory.json').write_text(json.dumps({'scope':'Pages packages and prompts only; posts excluded','captured_at':now(),'discovered':len(known),'completed':len(done),'pending':len(known)-len(done),'sources':rows},ensure_ascii=False,indent=2))
if __name__=='__main__':run()
