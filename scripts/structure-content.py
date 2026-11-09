#!/usr/bin/env python3
import hashlib,html,json,re
from pathlib import Path
from collections import Counter
from bs4 import BeautifulSoup,Tag,NavigableString
ROOT=Path(__file__).resolve().parents[1]
DEFS=[('email','Email and calendar','Open your inbox and manage email','email listserv mail'),('passport-york','Passport York','Sign in and manage your account','passport password username'),('connectivity','Wi-Fi and internet','Connect on campus and from home','internet airyork eduroam vpn off-campus'),('software','Software and apps','Find and use software at York','software antivirus spss sas amos minitab nvivo putty thunderbird winscp adobe chrome firefox'),('microsoft-365','Microsoft 365','Use Microsoft apps for study and work','microsoft-365 m365'),('teaching-learning','Teaching and learning','Use eClass and learning technology','teaching-and-learning learning-technologies learningspaces'),('printing','Printing','Print on campus and from your device','printing'),('storage','Files and storage','Store and share your work','storage'),('devices-labs','Computers and labs','Find labs and device support','computer-labs computer-services spyware'),('security','Cybersecurity and Duo','Protect your account and get Duo help','information-security infosec duo phishing'),('ai','Artificial intelligence','Find AI tools and reusable prompts','/ai/ /prompt/'),('administrative-systems','Administrative systems','Access York business applications','administrative-systems'),('web-media','Web and media','Publish websites and manage media','web-and-media sftp'),('servers','Servers and hosting','Find server and hosting services','servers'),('audio-visual','Audio visual technology','Get classroom meeting and event technology','audio-visual microphone'),('data-reporting','Data and reporting','Find reporting tools and data services','data-and-reporting'),('computer-purchase','Computer purchases','Find computer purchasing guidance','computer-purchase'),('phones','Desk and mobile phones','Find phone services and plans','desk-phones cell-phones'),('github','GitHub','Use York development tools','github'),('support','IT support','Find your support team','contact feedback ticketing unavailable')]
GENERIC={'overview','featured services','frequently asked questions','faqs','learn more','how do i access it','how to access it'}
def text(n):return re.sub(r'\s+',' ',n.get_text(' ',strip=True)).strip()
def title(value):return re.sub(r'\s+',' ',re.sub(r'[^\w\s]',' ',html.unescape(value).replace("'",'').replace('’',''))).strip() or 'York IT guidance'
def slug(value):return re.sub(r'[^a-z0-9]+','-',value.lower()).strip('-')[:120] or 'guidance'
def audience(url):return ['student'] if '/student-services/' in url else ['employee'] if '/faculty-and-staff-services/' in url or '/py-staff-area/' in url else ['all']
def service_for(url):
 for ident,name,summary,keys in DEFS:
  if any(k in url for k in keys.split()):return ident
 if '/package/' in url:return 'software'
 return None
def blocks(markup,source_id):
 soup=BeautifulSoup(markup,'html.parser');out=[];anchors=[]
 def walk(node):
  if isinstance(node,NavigableString):
   if str(node).strip():out.append({'tag':'p','html':'<p>'+html.escape(str(node).strip())+'</p>','text':str(node).strip(),'anchors':anchors[:]});anchors.clear()
   return
  if not isinstance(node,Tag):return
  if node.get('id'):anchors.append(node['id'])
  if node.name in {'p','ol','ul','table','figure','blockquote','pre','dl','details','h2','h3','h4','h5','h6'}:
   if text(node) or node.find('img'):
    out.append({'tag':node.name,'html':str(node),'text':text(node),'anchors':anchors[:]+[n['id'] for n in node.select('[id]')]});anchors.clear()
   return
  for child in node.children:walk(child)
 for node in soup.children:walk(node)
 for i,b in enumerate(out):b['id']=source_id+':'+str(i)
 return out
def display(markup):
 s=BeautifulSoup(markup,'html.parser')
 for node in s.select('h2,h3,h4,h5,h6,p,li,td,th,figcaption'):
  if node.find_parent(['pre','code']):continue
  strings=[x for x in node.descendants if isinstance(x,NavigableString) and str(x).strip() and not x.find_parent(['pre','code'])]
  if node.name.startswith('h'):
   for x in strings:x.replace_with(re.sub(r'[^\w\s]',' ',str(x).replace("'",'').replace('’','')))
  elif strings:strings[-1].replace_with(re.sub(r'\.\s*$','',str(strings[-1])))
 return str(s)
def run():
 services={i:{'id':i,'name':n,'summary':s,'aliases':k.split(),'source_urls':[],'article_ids':[],'details':[],'actions':[]} for i,n,s,k in DEFS};articles=[];pages=[];ledger=[];assets={}
 for p in sorted((ROOT/'content/sources').glob('*.json')):
  source=json.loads(p.read_text());url=source['url'];row={'source_id':source['id'],'source_url':url,'title':source.get('title',''),'capture_status':source['status'],'destinations':[],'assignments':[]}
  if re.search(r'/\d{4}/\d{2}/',url):continue
  if source['status']!='captured':row.update(state='unavailable',error=source.get('error'));ledger.append(row);continue
  if source.get('protected'):row['state']='protected';ledger.append(row);continue
  for u in source.get('assets',[]):assets.setdefault(u,{'url':u,'source_urls':[],'status':'authoritative_reference'})['source_urls'].append(url)
  sid=service_for(url);aud=audience(url)
  if url.rstrip('/') in ['https://www.yorku.ca/uit','https://www.yorku.ca/uit/student-services','https://www.yorku.ca/uit/faculty-and-staff-services']:
   row.update(state='consolidated',destinations=['/' if url.rstrip('/')=='https://www.yorku.ca/uit' else '/services/']);ledger.append(row);continue
  normative=bool(re.search(r'\b(policy|standard|agreement|guidelines)\b',source['title'],re.I))
  if not sid or '/cio/' in url or normative or '/prompt/' in url or url.endswith('/contact/') or source.get('dynamic_review'):
   kind='prompt' if '/prompt/' in url else 'resource';pslug=slug(title(source['title']))+'-'+source['id'][:6];route=('/prompts/' if kind=='prompt' else '/resources/')+pslug+'/'
   pages.append({'id':source['id'],'title':title(source['title']),'route':route,'type':kind,'html':display(source['html']),'source_url':url,'captured_at':source['captured_at'],'dynamic_review':source.get('dynamic_review',False),'forms':source.get('forms',[]),'audiences':aud})
   row.update(state='reference',destinations=[route]);
   if url.endswith('/contact/'):row['special_route']='/help/'
   ledger.append(row);continue
  services[sid]['source_urls'].append(url);items=blocks(source['html'],source['id']);groups=[];heading=source['title'];context=source['title'];current=[]
  def flush():
   if current:groups.append((heading,context,current[:]))
   current.clear()
  for b in items:
   if re.fullmatch('h[2-6]',b['tag']):
    flush();heading=b['text']
    if int(b['tag'][1])<=3 and title(heading).lower() not in GENERIC:context=heading
   current.append(b)
  flush();row.update(state='structured',source_block_count=len(items),destinations=['/services/'+sid+'/'])
  for heading,context,group in groups:
   lower=title(heading).lower();body=[b for b in group if not re.fullmatch('h[2-6]',b['tag'])]
   if not body or lower in ['featured services','learn more']:
    row['assignments'] += [{'block_id':b['id'],'destination':'navigation','anchors':b['anchors']} for b in group];continue
   resolution=display('\n'.join(b['html'] for b in body))
   if lower=='overview' or lower==title(source['title']).lower() or re.search(r'\b(policy|standard|agreement)\b',lower):
    services[sid]['details'].append({'title':title(context),'audiences':aud,'html':resolution,'source_url':url})
    row['assignments'] += [{'block_id':b['id'],'destination':'/services/'+sid+'/#details','anchors':b['anchors']} for b in group];continue
   label=('Access '+context) if lower in ['how do i access it','how to access it'] else heading
   for start,replacement in [('How do I ',' '),('How can I ',' '),('Creating ','Create '),('Recovering ','Recover '),('Viewing ','View '),('Accessing ','Access '),('Deleting ','Delete '),('Applying ','Apply '),('Organizing ','Organize '),('Setting up ','Set up '),('Changing ','Change ')]:
    if label.lower().startswith(start.lower()):label=replacement+label[len(start):];break
   label=label.strip();label=title(label[:1].upper()+label[1:]);ident='UIT-KA-'+hashlib.sha256((url+'#'+group[0]['id']).encode()).hexdigest()[:12].upper();aslug=slug(label)+'-'+ident[-6:].lower()
   env=[services[sid]['name']];combined=context+' '+source['title']
   for regex,name in [(r'Gmail|Undergraduate','Google Mail'),(r'Outlook','Microsoft Outlook'),(r'LISTSERV','LISTSERV'),(r'Windows 11','Windows 11'),(r'Windows 10','Windows 10'),(r'Android','Android'),(r'iPhone|iPad|iOS','iOS'),(r'macOS|Mac OSX','macOS')]:
    if re.search(regex,combined,re.I):env.append(name)
   env.append('York students' if aud==['student'] else 'York faculty and staff' if aud==['employee'] else 'York community')
   flags=[name for regex,name in [(r'do not validate','certificate-validation'),(r'Gmail Labs','obsolete-gmail-interface'),(r'Windows XP','unsupported-platform'),(r'there are (a few|several) reasons','multiple-resolution-paths')] if re.search(regex,resolution,re.I)]
   article={'id':ident,'slug':aslug,'title':label,'type':'How to' if re.match(r'(access|use|set|connect|install|download|reset|change|recover|forward|create|add|remove|open|find|view|delete|apply)',label,re.I) else 'Question and answer','service_id':sid,'issue':label,'environment':env,'cause':None,'resolution_html':resolution,'audiences':aud,'source_urls':[url],'source_block_ids':[b['id'] for b in group],'captured_at':source['captured_at'],'source_modified_at':source.get('source_modified_at'),'reviewed_at':None,'state':'not_validated','editorial_status':'structured_import','review_flags':flags}
   articles.append(article);services[sid]['article_ids'].append(ident);route='/knowledge/'+aslug+'/'
   row['destinations'].append(route);row['assignments'] += [{'block_id':b['id'],'destination':route,'article_id':ident,'anchors':b['anchors']} for b in group]
  ledger.append(row)
 # Deduplicate exact answers and equivalent link-only answers without losing provenance
 unique=[];seen={};aliases={}
 for a in articles:
  s=BeautifulSoup(a['resolution_html'],'html.parser');answer=text(s);links=sorted({x['href'] for x in s.select('a[href]')});linktext=' '.join(text(x) for x in s.select('a[href]'))
  if links and re.sub(r'\W','',answer)==re.sub(r'\W','',linktext):answer='|'.join(links)
  fingerprint=(a['service_id'],a['title'].lower(),answer)
  if fingerprint in seen:
   target=seen[fingerprint];target['source_urls']=sorted(set(target['source_urls']+a['source_urls']));target['audiences']=sorted(set(target['audiences']+a['audiences']));target['environment']=list(dict.fromkeys(target['environment']+a['environment']));target['source_block_ids']+=a['source_block_ids'];aliases[a['id']]=target
  else:seen[fingerprint]=a;unique.append(a)
 articles=unique;byid={a['id']:a for a in articles}
 actions={'email':[('Undergraduate Google Mail','https://mail.my.yorku.ca/',['student']),('Graduate and employee Outlook','https://outlook.office.com/',['student','employee'])],'passport-york':[('Manage My Services','https://mms.yorku.ca/',['all'])],'teaching-learning':[('Open eClass','https://eclass.yorku.ca/',['all'])],'software':[('Open MyApps','https://myapps.yorku.ca/',['all'])]}
 for s in services.values():
  s['article_ids']=list(dict.fromkeys(aliases.get(i,byid.get(i))['id'] for i in s['article_ids']));s['article_ids'].sort(key=lambda i:byid[i]['title'].lower());s['actions']=[{'label':l,'url':u,'audiences':a} for l,u,a in actions.get(s['id'],[])]
 for row in ledger:
  for assignment in row['assignments']:
   if assignment.get('article_id') in aliases:
    a=aliases[assignment['article_id']];assignment.update(article_id=a['id'],destination='/knowledge/'+a['slug']+'/')
  row['destinations']=list(dict.fromkeys([d for d in row['destinations'] if not d.startswith('/knowledge/')]+[a['destination'] for a in row['assignments'] if a['destination'].startswith('/knowledge/')]))
 inventory=json.loads((ROOT/'content/inventory.json').read_text());stats={'posts_included':0,'discovered_sources':inventory['discovered'],'captured_sources':sum(r['capture_status']=='captured' for r in ledger),'services':len(services),'articles':len(articles),'resources':sum(p['type']=='resource' for p in pages),'prompts':sum(p['type']=='prompt' for p in pages),'asset_references':len(assets),'source_states':dict(Counter(r['state'] for r in ledger)),'pending_sources':inventory['pending'],'priority_review_articles':sum(bool(a['review_flags']) for a in articles)}
 for filename,value in [('services',list(services.values())),('articles',articles),('pages',pages),('ledger',ledger),('assets',list(assets.values())),('stats',stats)]:
  target=ROOT/'content/generated';target.mkdir(exist_ok=True);(target/(filename+'.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2))
 print(json.dumps(stats,indent=2))
if __name__=='__main__':run()
