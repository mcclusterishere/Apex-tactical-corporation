const fs = require('fs'), vm = require('vm'), assert = require('assert');
const path = require('path'), root = __dirname;
const fixture = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let slides;
class Node {
  constructor(id) {this.id=id;this.listeners={};this.attrs={};this.classes=new Set();this.classList={toggle:(k,v)=>{if(v===undefined)v=!this.classes.has(k);v?this.classes.add(k):this.classes.delete(k);return v},contains:k=>this.classes.has(k)};this.dataset={};this.hidden=false;this.textContent='';this.value='';this.disabled=false;}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)}
  setAttribute(k,v){this.attrs[k]=v} removeAttribute(k){delete this.attrs[k]} getAttribute(k){return this.attrs[k]}
  scrollIntoView(){this.scrolled=true} focus(){this.focused=true} contains(target){return target===this}
  matches(q){return q==='[data-slide]'&&this.isSlide}
  closest(q){if(q==='[data-slide]')return this.isSlide?this:slides.find(s=>s.id===(this.kind==='parcel'?'parcels':this.kind==='timeline'?'timeline':'sources'));if(q==='a[href^="#"]')return this.isAnchor?this:null;if(q==='input,textarea,select,summary,button,a')return this.isControl?this:null;return null}
  fire(k){for(const fn of this.listeners[k]||[])fn({target:this})}
}
const nodes=new Map(fixture.ids.map(id=>[id,new Node(id)]));
slides=fixture.slides.map(id=>nodes.get(id));slides.forEach(s=>s.isSlide=true);
const nav=slides.map(s=>{const n=new Node('link-'+s.id);n.hash='#'+s.id;return n});
const make=(list,kind)=>list.map(s=>{const n=nodes.get(s.id);n.kind=kind;n.dataset.group=s.group;n.textContent=s.text;return n});
const sources=make(fixture.sources,'source'),parcels=make(fixture.parcels,'parcel'),moments=make(fixture.moments,'timeline');
const buttons={};for(const [group,keys]of Object.entries(fixture.buttons)){buttons[group]=keys.map(k=>{const n=new Node(group+'-'+k);n.dataset.filter=k;return n})}
const body=new Node('body'),controls=new Node('controls'),listeners={},windowListeners={};let printed=0;
const document={body,querySelectorAll(q){const group=q.match(/^\[data-filter-group="([^"]+)"\]$/);if(group)return buttons[group[1]];return {'[data-slide]':slides,'.chapter-nav a':nav,'.source-card':sources,'.parcel-card':parcels,'.timeline-item':moments}[q]||[]},querySelector(q){return q==='.present-controls'?controls:nodes.get(q.slice(1))||null},getElementById(id){return nodes.get(id)||null},addEventListener(k,f){(listeners[k]??=[]).push(f)}};
const window={location:{hash:''},scrollTo(){},print(){printed++},addEventListener(k,f){(windowListeners[k]??=[]).push(f)}};
vm.runInNewContext(fs.readFileSync(process.argv[3],'utf8'),{document,window});
let tests=0;function check(v,m){assert(v,m);tests++}function click(id){nodes.get(id).fire('click')}function shown(cards){return cards.filter(c=>!c.hidden)}function key(key,control=false){for(const fn of listeners.keydown)fn({key,target:{closest:()=>control?{}:null},preventDefault(){}})}
check(shown(sources).length===16,'All records visible');check(shown(parcels).length===13,'All parcels visible');check(shown(moments).length===8,'All moments visible');
check(nodes.get('slide-count').textContent==='1 / 6','Starts on first slide');click('present');check(body.classes.has('presenting'),'Presentation starts');click('next');check(nodes.get('slide-count').textContent==='2 / 6','Next works');for(let i=0;i<20;i++)click('next');check(nodes.get('slide-count').textContent==='6 / 6'&&nodes.get('next').disabled,'Clamps at end');for(let i=0;i<20;i++)click('previous');check(nodes.get('slide-count').textContent==='1 / 6'&&nodes.get('previous').disabled,'Clamps at beginning');key('ArrowRight');check(nodes.get('slide-count').textContent==='2 / 6','Arrow works');key('ArrowRight',true);check(nodes.get('slide-count').textContent==='2 / 6','Typing context ignored');key('Escape',true);check(!body.classes.has('presenting'),'Escape works from controls');
buttons.parcel.find(b=>b.dataset.filter==='molly').fire('click');check(shown(parcels).length===1&&shown(parcels)[0].id==='parcel-1200458','Molly parcel filter');buttons.parcel.find(b=>b.dataset.filter==='charles').fire('click');check(shown(parcels).length===2,'Charles parcel filter');nodes.get('parcel-search').value='NO MATCH 7843';nodes.get('parcel-search').fire('input');check(shown(parcels).length===0&&!nodes.get('parcel-empty').hidden,'Parcel zero state');
const anchor=new Node('anchor');anchor.isAnchor=true;anchor.attrs.href='#parcel-1200458';for(const fn of listeners.click)fn({target:anchor});check(shown(parcels).length===13&&nodes.get('parcel-search').value==='','Anchor reveals filtered parcel');
buttons.source.find(b=>b.dataset.filter==='northampton').fire('click');check(shown(sources).length>0&&shown(sources).every(c=>c.dataset.group==='northampton'),'Northampton source filter');nodes.get('source-search').value='NO MATCH 7843';nodes.get('source-search').fire('input');check(shown(sources).length===0&&!nodes.get('source-empty').hidden,'Source zero state');window.location.hash='#'+sources[0].id;for(const fn of windowListeners.hashchange)fn();check(shown(sources).length===16,'Hash navigation reveals source');check(sources[0].scrolled,'Hash navigation scrolls to source');
nodes.get('source-search').value='1978';nodes.get('source-search').fire('input');check(shown(sources).length===1&&shown(sources)[0].id==='record-1978','Source year finds trust record');nodes.get('source-search').value='2025';nodes.get('source-search').fire('input');check(shown(sources).length===1&&shown(sources)[0].id==='record-north2025','Source year finds Northampton record');nodes.get('source-search').value='';nodes.get('source-search').fire('input');
buttons.timeline.find(b=>b.dataset.filter==='molly').fire('click');check(shown(moments).length===2,'Molly timeline filter');buttons.timeline.find(b=>b.dataset.filter==='all').fire('click');check(shown(moments).length===8,'Timeline reset');
click('print');check(printed===1,'Print called');for(let i=0;i<20;i++)click('present');check(!body.classes.has('presenting'),'Repeated present toggles stable');click('present');window.location.hash='#access';for(const fn of windowListeners.hashchange)fn();check(nodes.get('slide-count').textContent==='5 / 6','Back/forward hash opens correct slide');click('exit-present');check(!body.classes.has('presenting')&&controls.attrs['aria-hidden']==='true','Exit restores full story');check(nodes.get('present').focused,'Exit restores keyboard focus');
console.log(JSON.stringify({passed:true,interaction_assertions:tests,scope:'Node VM DOM behavior, not browser layout or visual QA'},null,2));
