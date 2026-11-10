from pathlib import Path
from urllib.parse import urlsplit,unquote
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]/'dist';missing=set();count=0
import json
report=ROOT/'_data/build-report.json'
BASE=json.loads(report.read_text()).get('base','') if report.exists() else ''
class Check(HTMLParser):
 def handle_starttag(self,tag,attrs):
  global count
  for attribute,value in attrs:
   if attribute not in ['href','src'] or not value or value.startswith('#'):continue
   u=urlsplit(value)
   if u.scheme or u.netloc:continue
   count+=1;local=unquote(u.path)
   if BASE and (local==BASE or local.startswith(BASE+'/')):local=local[len(BASE):] or '/'
   p=ROOT/local.lstrip('/') if local.startswith('/') else self.path.parent/local
   if p.is_dir():p=p/'index.html'
   if not p.exists():missing.add((str(self.path.relative_to(ROOT)),value))
pages=[p for p in ROOT.rglob('*.html') if p.is_file() and not any(part.startswith('.') for part in p.relative_to(ROOT).parts)]
for p in pages:
 checker=Check();checker.path=p;checker.feed(p.read_text())
if missing:
 print('\n'.join(a+' -> '+b for a,b in sorted(missing)));raise SystemExit('Missing local dependencies: '+str(len(missing)))
print(f'Checked {count} local links across {len(pages)} pages')
