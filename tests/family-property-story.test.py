"""Static/privacy contract and behavior tests for the standalone public narrative."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, subprocess, tempfile
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'public/family-property-story'
ALLOWED={'index.html','styles.css','app.js','sources.json'}
assert {p.name for p in SITE.iterdir()}==ALLOWED, 'Unexpected public artifact'
class Document(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=[];self.links=[];self.slides=[];self.sources=[];self.parcels=[];self.moments=[];self.buttons={'source':[],'parcel':[],'timeline':[]};self.current=None;self.remote_assets=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs);id=d.get('id');classes=d.get('class','').split()
  if id:self.ids.append(id)
  if 'data-slide' in d:self.slides.append(id)
  for kind,target in [('source-card',self.sources),('parcel-card',self.parcels),('timeline-item',self.moments)]:
   if kind in classes:self.current={'id':id,'group':d['data-group'],'text':''};target.append(self.current)
  if d.get('data-filter-group'):self.buttons[d['data-filter-group']].append(d['data-filter'])
  if d.get('href'):self.links.append(d['href'])
  if tag in ['img','iframe','object','embed']:raise AssertionError('Document/media embedding is outside this public scope')
  if tag in ['script','link']:
   asset=d.get('src',d.get('href',''));assert not urlsplit(asset).scheme,'Automatic external resource'
 def handle_endtag(self,tag):
  if tag=='article' or (tag=='li' and self.current in self.moments):self.current=None
 def handle_data(self,text):
  if self.current:self.current['text']+=text+' '
html=(SITE/'index.html').read_text();doc=Document();doc.feed(html)
assert len(doc.ids)==len(set(doc.ids))
assert len(doc.slides)==6 and len(doc.parcels)==13 and len(doc.sources)==16 and len(doc.moments)==8
assert len({p['id'] for p in doc.parcels})==13
for href in doc.links:
 u=urlsplit(href)
 if u.scheme:
  assert u.scheme=='https'
  assert u.netloc in {'cotthosting.com','qpublic.schneidercorp.com','www.northamptonrod.org','www.ncleg.gov'},u.netloc
 else:
  if u.path:assert (SITE/unquote(u.path)).is_file(),href
  if u.fragment:assert unquote(u.fragment) in doc.ids,href
css=(SITE/'styles.css').read_text()
assert not re.search(r'@media\s*\([^)]*max-width',css),'Must be mobile first'
assert not re.search(r'(?<![,\w])1fr\b',css),'Grid fractions must be minmax(0,1fr)'
assert 'user-scalable=no' not in html and 'maximum-scale=1' not in html
assert 'font-size:max(16px,1rem)' in css
assert '.toolbar{display:flex;flex-wrap:wrap;' in css, 'Toolbar must wrap before squeezing buttons'
assert '.toolbar button{flex-shrink:0;white-space:nowrap}' in css, 'Toolbar labels must remain whole'
for p in SITE.iterdir():
 text=p.read_text()
 assert not any(s in text for s in ['/workspace/','mail.google.com','drive.google.com','data:image','file://','sediment://','@gmail.com'])
 assert not re.search(r'\b\d{3}-\d{2}-\d{4}\b',text),'Unexpected identity-number pattern'
 assert not re.search(r'\.(pdf|jpe?g|png|docx|zip)(?:["?#]|$)',text,re.I),'Unexpected document attachment'
assert 'not a list of thirteen family-owned' in html
assert 'permission to enter' in html
assert '131.9' in html and '4.47' in html
sources=json.loads((SITE/'sources.json').read_text())
assert len(sources['records'])==16
for source in sources['records']:assert '#record-'+source['id'] in html or 'id="record-'+source['id']+'"' in html
subprocess.run(['node','--check',str(SITE/'app.js')],check=True)
with tempfile.TemporaryDirectory() as tmp:
 fixture=Path(tmp)/'fixture.json'
 fixture.write_text(json.dumps({'ids':doc.ids,'slides':doc.slides,'sources':doc.sources,'parcels':doc.parcels,'moments':doc.moments,'buttons':doc.buttons}))
 subprocess.run(['node',str(ROOT/'tests/family-property-story.interactions.cjs'),str(fixture),str(SITE/'app.js')],check=True)
print(json.dumps({'static_privacy_contract':'passed','chapters':6,'parcels':13,'public_source_groups':16,'timeline_moments':8,'automatic_external_resources':0,'browser_visual_qa':'not run'},indent=2))
