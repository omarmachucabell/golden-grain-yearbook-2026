import {captureTime, compareTakenDates} from './capture-time.js';
import {chapters, key, tags} from './album-chapters.js';

const root = document.querySelector('#album-root');
const front = document.querySelector('#album-front');
const status = document.querySelector('#album-status');
const viewer = document.querySelector('#album-viewer');
const picture = viewer.querySelector('img');
const viewerCaption = document.createElement('p');
viewerCaption.className='viewer-caption';
viewer.append(viewerCaption);
const viewerCredit = document.createElement('a');
viewerCredit.className='viewer-credit';
viewerCredit.target='_blank';
viewerCredit.rel='noopener noreferrer';
viewerCredit.hidden=true;
const timestamp = document.createElement('time');
timestamp.className='av-timestamp';
timestamp.hidden=true;
viewer.append(timestamp);
let captureDates = {};
const library = new Map();
const holidaySources = new Set();
let photos = [], current = [], selected = 0;
const complete = {id:'all',title:'The Complete Collection'};

function element(tag, cls, text) {
 const node = document.createElement(tag);
 if(cls) node.className = cls;
 if(text) node.textContent = text;
 return node;
}
function image(photo, eager=false) {
 const img = element('img');
 img.loading = eager ? 'eager' : 'lazy';
 img.decoding = 'async';
 img.alt = photo.caption || '';
 if(photo.w && photo.h){img.width=photo.w;img.height=photo.h;}
 img.src = photo.preview || photo.src;
 return img;
}
function directoryLink(collection, className){
 const a=element('a',className);
 a.href='#'+collection.id;
 return a;
}

function directoryTitle(tag, first, last){
 const title=element(tag);
 title.append(first+' ',element('em','',last));
 return title;
}

function landing(){
 const cover=photos.find(p=>key(p.name)==='sunsetcustomerscomingdown1') || photos[0];
 const hero=element('div','edition-cover');
 if(cover)hero.append(image(cover,true));
 hero.append(directoryTitle('h1','Photo','Album'));
 front.replaceChildren(hero);

}

const topics = new Set();
const savedAlbum = () => window.Yearbook.read('album:'+location.hash, {});
function saveAlbum(){window.Yearbook.write('album:'+location.hash,{query,member,sort,topics:[...topics]});}
const shuffleSeed=window.Yearbook.read('album-shuffle',Math.random());window.Yearbook.write('album-shuffle',shuffleSeed);
let query = '', member = '', sort = 'alpha', route = null;
const roster = ["Abrielle Hollis", "Alejandra Zepeda", "Alexa Galvan", "Andreah Macias", "Anthony Handy", "Ashley Solorio", "Asina Msoshi", "Austin Parris", "Caden Tilley", "Catherine Woodruff", "Chaise Dennis", "Colin Forest", "Connor Miller", "Danielle Gatlin", "Elyas Herrera", "Evelyn Ortiz", "Giana Bramhill", "Guadalupe Hernandez", "Hayden May", "Hope Nghiem", "Jackson Rollins", "Jacob Perrault", "Jacob Russell", "Jesus (Emiliano) Mendez Morales", "Jillian Lemus", "Joely Sjotvedt", "Jonaven St. Martin", "Judith Solorio", "Kailyn Lopez", "Kyle Gordon", "Liam Baynes", "Liam Valladares", "Logan Sorenson", "Makenzie Antaramian", "Maximiliano Gutierrez Montejo", "Melissa Collazo", "Michael Chao-Largent JR", "Omar Machuca", "Paris Berrelez", "Peyton Reynolds", "Roberto Oregel", "Romeo Fabian", "Sensamia Guzman", "Sophia Duarte", "Sy'Rae Reddrick", "Trinity Portusach", "Tyler Pesenti"];
const aliases = {
 'Maximiliano':['Max'], 'Jonaven':['Jonovan','Jonavan'], 'Roberto':['Rob'],
 'Sophia':['Sofia'], 'Michael':['Micheal'], 'Alejandra':['Ale'], "Sy'Rae":['Syrae']
};
function normalize(value){
 return value.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
const matchers = roster.map(name=>{
 const [first,last] = name.split(' ');
 const shared = first==='Liam' || first==='Jacob';
 const words = shared ? [name,first+' '+last[0]] : [first,...(aliases[first] || [])];
 return [name,words.map(normalize)];
});
function namedPeople(p){
 const caption = (p.caption || '').replace(/with Abrielle just out of frame|for Max’s friend/gi,'');
 const words=' '+normalize(caption || p.name.replace(/\.[^.]+$/,'').replace(/([a-z])([A-Z])/g,'$1 $2'))+' ';
 return matchers.filter(([,aliases])=>aliases.some(alias=>words.includes(' '+alias+' '))).map(([name])=>name);
}

// Small, curated moments are the default; the complete collection remains one tap away.
let highlightLimit=10;
let activeMomentTitle="";
viewer.addEventListener("close",()=>{activeMomentTitle="";});
const highlightMoments=[
 ['Opening-day group photo','parissensamiajudithanthonyliambmaxgroupphotofirstdayopen'],
 ['Last-day crew photos','^lastdaygroupphoto(atthebottom|infrontofsign|onlanes1to3)'],
 ['Stacks of tubes','anthonyandliambinawefromtoweroftubes|tubesstackedontopofjackson|liamwithtubesstackeduponhim'],
 ['Rainy-day photos','rainydaygroupphoto|rainydaycrewphoto|maxtrinityrainydaybottom'],
 ['Playing Roblox on break','anthonyabrielleliambplayingroblox|abrielleanthonyandliambonbreak'],
 ['Sunset views of the Raceway','sunsetcustomerscomingdown|sunsetphotoofraceway|^bpfgoldengrain21$|^bpfracewaywhirl[34]$|^goldengrain1$'],
 ['Asina’s trash-bag outfits','asinatrashbagoutfit|asinaintrashbag|asinatrashoutfit'],
 ['Omar, Trinity, and Judith','omartrinityandjudith|trinityomarandjudith|judithandtrinity'],
 ['Frog and possum sightings','departmentfrogpet|possuminthedapartmentundergrates'],
 ['Jackson and Tyler at the conveyor','jacksonandtylerconveyor|tylerjacksonconveyor'],
 ['Last rides of the season','lasttimegoingdownraceway|ridingdownracewaylast(?:time|ime)'],
 ['Sunflower Whirl and sunflower cutting','daniellecatherineandmelissaonsunflowerwhirl|jacksononsunflowerwhirl|andreahsunflowercutting|^bpfracewaywhirl7$'],
 ['Michael visiting the farm','maxandmichealasguest|maxwithmichealasguest|michealasaguest'],
 ['Broken and dirty brooms','kylewithbrokenbroom|kylebrokenbroom|tylershowingoffdirtybroom'],
 ['Anthony and Liam B. at the conveyor at sunset','anthonyandliambworkingconveyorsunset'],
 ['Team group photo','omarjonavansensamiaparismaxjudithmichealromeoliambgroupphoto'],
 ['Food and snack breaks','anthonyandliameating|gianaandsophiawithcaramelapples|sophiaeatingcookie'],
 ['Paraglider above the Raceway','paragliderflyingoverraceway'],
 ['Photos with Max','maxandabrielleselfie|omarandmaxhappy'],
 ['Flowers around the Raceway','flowerviewofraceway|racewayflowerview|^bpf2626$|^goldengrain6$'],
 ['Rides at the Raceway','^bpfgoldengrain2(?:2trinty|5)$|^bpf2624$|^goldengrain2trinity$'],
 ['Michael’s and Sy’Rae’s last-day photos','groupphotolastdayofmichael|michalelastdaygroupphoto|syraeslastdaywithmax'],
 ['A pumpkin and trash can on the slides','jacobrpushingpumpkin|elyassendingdowntrashcan'],
 ['Working at the bottom','loganrobertoandliamvworkingatthebottom|sensamiaworkingbottomwithjonovan'],
 ['Pigadeli and Cluck ’n Dogs','liamoutsidepigadeli|anthonycluckndogs'],
 ['End-of-season cleaning','finalcleaningday']
];
function highlights(){
 const section=element('section','season-highlights');
 const heading=element('header','highlights-heading');

 const full=element('a','highlight-full','Explore the full collection');full.href='#all';heading.append(full);
 const grid=element('div','highlight-grid'),seen=new Set();
 const moments=highlightMoments.map(([title,pattern])=>{
  const rule=new RegExp(pattern);
  const items=photos.filter(p=>p.preview&&rule.test(key(p.name))&&!seen.has(p.src));
  items.forEach(p=>seen.add(p.src));return {title,items};
 }).filter(m=>m.items.length);
 const more=element('button','highlight-more','Another 10');more.type='button';
 const progress=element('p','highlight-progress');progress.setAttribute('aria-live','polite');
 function draw(){
  grid.replaceChildren();
  moments.slice(0,highlightLimit).forEach((moment,i)=>{
   const card=element('article','highlight-card'+(i%5===0?' highlight-feature':''));
   const button=element('button','highlight-photo');button.type='button';
   button.setAttribute('aria-label',moment.title+' — '+moment.items.length+(moment.items.length===1?' photo':' photos'));
   button.append(image(moment.items[0]));
   if(moment.items.length>1)button.append(element('span','moment-count','See the rest · '+moment.items.length+' photos'));

   button.onclick=()=>{activeMomentTitle=moment.title;current=moment.items;selected=0;show();viewer.showModal();};
   card.append(button);grid.append(card);
  });
  more.hidden=highlightLimit>=moments.length;
  progress.textContent=Math.min(highlightLimit,moments.length)+' of '+moments.length+' moments';
 }
 more.onclick=()=>{const previous=highlightLimit;highlightLimit+=10;draw();const next=grid.children[previous]?.querySelector('button');next?.focus({preventScroll:true});next?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 const ending=element('div','highlight-ending');ending.append(element('h2','','There’s more in the album.'),element('p','','Browse by topic, search, or shuffle the whole collection.'));
 const browse=element('a','highlight-full','Explore all photos');browse.href='#all';ending.append(browse);
 section.append(grid,more,ending);root.replaceChildren(section);draw();
}

function gallery(){
 const header=element('header','spread-heading');
 const back=element('a','album-back','← Photo Album');back.href='#';
 if(front.hidden)header.append(back);
 header.append(element(front.hidden?'h1':'h2','',complete.title));
 const controls=element('div','collection-controls');
 const search=element('input');search.type='search';search.placeholder='Search photos';search.value=query;
 const person=element('select'), sorting=element('select');
 person.add(new Option('Everyone',''));
 for(const name of roster.filter(name=>photos.some(p=>p.people.has(name)))){
  person.add(new Option(name,name));
 }
 person.value=member;
 for(const [id,label] of [['alpha','Alphabetical'],['date-newest','Date taken: newest first'],['date-oldest','Date taken: oldest first'],['shuffle','Shuffle']]){
  sorting.add(new Option(label,id));
 }
 sorting.value=sort;
 for(const [label,field] of [['Search captions and filenames',search],['Team member',person],['Sort by',sorting]]){
  const wrapper=element('label','',label);wrapper.append(field);controls.append(wrapper);
 }
 const choices = element('fieldset','collection-topics');
 const blocks = element('div','topic-blocks');
 choices.append(element('legend','','Topics'), blocks);
 const checkboxes = [];
 for(const chapter of chapters){
  const label = element('label','topic-block');
  const box = element('input');
  box.type = 'checkbox';
  box.setAttribute('aria-labelledby','topic-title-'+chapter.id);
  box.setAttribute('aria-describedby','topic-description-'+chapter.id);
  box.checked = topics.has(chapter.id);
  box.onchange = () => {
   if(box.checked) topics.add(chapter.id);
   else topics.delete(chapter.id);
   refresh();
  };
  checkboxes.push(box);
  const face = element('span','topic-face');
  const candidates = photos.filter(p => p.preview && p.tags.has(chapter.id));
  const cover = candidates.find(p => key(p.name).startsWith(chapter.cover)) ?? candidates[0];
  if(cover){
   const thumbnail = image(cover);
   thumbnail.alt = '';
   face.append(thumbnail);
  }
  const title = element('span','topic-title',chapter.title);
  title.id = 'topic-title-'+chapter.id;
  const description = element('span','topic-description',chapter.description);
  description.id = 'topic-description-'+chapter.id;
  description.hidden = !box.checked;
  face.append(title,description);
  box.addEventListener('change',()=>description.hidden=!box.checked);
  label.append(box,face);
  blocks.append(label);
 }
 const toolbar=element('div','collection-toolbar'), count=element('output'), clear=element('button','','Clear filters');
 clear.type='button';toolbar.append(count,clear);
 const grid=element('div','photographs all film-sheet');
 function refresh(){
  saveAlbum();
  const terms=normalize(query).split(' ').filter(Boolean);
  current=photos.filter(p=>(!member || p.people.has(member)) &&
   (!topics.size || [...topics].some(t=>p.tags.has(t))) && terms.every(term=>p.search.includes(term)));
  current.sort((a,b)=>{
   if(sort==='shuffle')return a.shuffle-b.shuffle;
   if(sort==='date-newest' || sort==='date-oldest'){
    const difference=compareTakenDates(a.takenAt,b.takenAt,sort==='date-newest');
    if(difference)return difference;
   }
   return (a.caption || a.name).localeCompare(b.caption || b.name,'en',{numeric:true}) || a.name.localeCompare(b.name);
  });
  count.textContent=current.length+' '+(current.length===1?'photo':'photos');
  clear.disabled=!(member || query || topics.size);
  const contents=document.createDocumentFragment();
  current.forEach((p,i)=>{
   const btn=element('button','print');btn.type='button';
   const rail=element('span','film-edge');
   rail.setAttribute('aria-hidden','true');
   rail.append(element('span','','GGR 2026'),element('span','',String(i+1).padStart(3,'0')));
   const frame=element('span','film-window');
   frame.append(image(p,i<3),element('span','album-caption',p.caption || 'A memory from the season'));
   btn.append(rail,frame);
   btn.setAttribute('aria-label','Open photograph: '+(p.caption || p.name));
   btn.onclick=()=>{selected=i;show();viewer.showModal()};contents.append(btn);
  });
  if(!current.length)contents.append(element('p','','No photos match these filters.'));
  grid.replaceChildren(contents);
 }
 search.oninput=()=>{query=search.value;refresh()};
 person.onchange=()=>{member=person.value;refresh()};
 sorting.onchange=()=>{sort=sorting.value;refresh()};
 clear.onclick=()=>{member=query=person.value=search.value='';topics.clear();checkboxes.forEach(box=>{box.checked=false;box.nextElementSibling.querySelector('.topic-description').hidden=true;});refresh()};
 root.replaceChildren(header,choices,controls,toolbar,grid);
 refresh();
}
function render(){
 const id=location.hash.slice(1);
 const chapter=chapters.find(c=>c.id===id);
 if(route!==id){
  const saved=savedAlbum();
  topics.clear();
  if(Array.isArray(saved.topics))saved.topics.filter(t=>chapters.some(c=>c.id===t)).forEach(t=>topics.add(t));
  else if(chapter)topics.add(id);
  query=typeof saved.query==='string'?saved.query:'';member=typeof saved.member==='string'?saved.member:'';sort=['alpha','date-newest','date-oldest','shuffle'].includes(saved.sort)?saved.sort:'alpha';
  route=id;
 }
 front.hidden=id==='all' || Boolean(chapter);
 if(!front.hidden)landing();
 if(front.hidden)gallery();else highlights();
 document.title=(front.hidden?complete.title:'Photo Album')+' — Golden Grain Yearbook';
 root.setAttribute('aria-busy','false');
}
function show(){
 const p=current[selected];
 const captured=captureTime(captureDates[p.src]);
 timestamp.hidden=!captured;
 timestamp.textContent=captured?.label || '';
 if(captured){timestamp.dateTime=captured.dateTime;timestamp.title=captured.title;}
 else {timestamp.removeAttribute('datetime');timestamp.removeAttribute('title');}
 picture.alt=p.caption || 'A memory from the season';
 viewerCaption.textContent=activeMomentTitle ? activeMomentTitle+' · '+picture.alt : picture.alt;
 let creditUrl;
 try {creditUrl=new URL(p.credit?.url);} catch {}
 const hasCredit=Boolean(p.credit?.name && creditUrl?.protocol==='https:');
 viewer.classList.toggle('has-credit',hasCredit);
 viewerCredit.hidden=!hasCredit;
 if(hasCredit){
  viewerCredit.href=creditUrl.href;
  viewerCredit.textContent='Photos by '+p.credit.name;
  viewerCredit.setAttribute('aria-label','Photos by '+p.credit.name+' — photographer website (opens in a new tab)');
  viewerCaption.append(viewerCredit);
 } else {
  viewerCredit.removeAttribute('href');
  viewerCredit.textContent='';
 }
 // Use the same display-quality copy in the viewer and gallery.
 picture.src = p.preview || p.src;
 viewer.querySelector('output').textContent=(selected+1)+' / '+current.length;
}
function advance(by){selected=(selected+by+current.length)%current.length;show();}
viewer.querySelector('.av-prev').onclick=()=>advance(-1);
viewer.querySelector('.av-next').onclick=()=>advance(1);
viewer.querySelector('.av-close').onclick=()=>viewer.close();
window.Yearbook.bindViewer(viewer,advance);
window.addEventListener('hashchange',()=>{if(viewer.open)viewer.close();render();window.scrollTo({top:0,behavior:'instant'});window.Yearbook.restore();const target=front.hidden?root:front;target.tabIndex=-1;target.focus({preventScroll:true});});

function add(p){
 if(holidaySources.has(p.src))return false;
 const existing=library.get(p.src);
 const people=[...new Set([...namedPeople(p),...(Array.isArray(p.people)?p.people.filter(name=>roster.includes(name)):[])])];
 const assignedTopics=Array.isArray(p.topics)?p.topics.filter(id=>chapters.some(chapter=>chapter.id===id)):[];
 const topicIds=assignedTopics.length?assignedTopics:tags(p.name);
 const search=normalize([p.name,p.caption || '',p.credit?.name || '',...people].join(' '));
 if(existing){
  people.forEach(n=>existing.people.add(n));
  topicIds.forEach(t=>existing.tags.add(t));
  existing.search+=' '+search;
  return false;
 }
 library.set(p.src,{...p,takenAt:captureTime(captureDates[p.src])?.dateTime.slice(0,19) || null,people:new Set(people),tags:new Set(topicIds),search,shuffle:[...p.src].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,Math.floor(shuffleSeed*4294967295))});
 return true;
}
function order(){photos=[...library.values()]}
async function loadAlbum(){
 const [response,dates]=await Promise.all([fetch('album-catalog.json'),fetch('album-capture-dates.json').then(r=>r.ok?r.json():{}).catch(()=>({}))]);
 captureDates=dates;
 if(!response.ok)throw Error();
 const catalog=await response.json();
 for(const photo of catalog){
  if(photo.holidayGallery || photo.lastSeason){
   holidaySources.add(photo.src);
   holidaySources.add(photo.preview);
  }
 }
 catalog.forEach(add);
 // Retain the original album and any manager-published additions.
 for(const b of document.querySelector('#album-originals').content.querySelectorAll('[data-photo]')){
  const src=b.dataset.photo;add({id:src,name:'Yearbook photograph '+(library.size+1),src});
 }
 order();render();window.Yearbook.restore();
 // Merge subsequent uploads, following every catalog page (including video-only pages).
 let cursor='', changed=false;
 try{
  do{
   const r=await fetch(window.YEARBOOK_CONFIG.albumEndpoint+(cursor?'?cursor='+encodeURIComponent(cursor):''));
   if(!r.ok)throw Error();
   const page=await r.json();
   for(const p of page.items){add(p);changed=true}
   cursor=page.cursor;
  }while(cursor);
 }catch{status.textContent='Showing the saved album. Recent uploads could not be checked.';}
 if(changed){
  const refresh=()=>{order();render();window.Yearbook.restore()};
  if(viewer.open)viewer.addEventListener('close',refresh,{once:true});else refresh();
 }
}
loadAlbum().catch(()=>{root.setAttribute('aria-busy','false');status.textContent='The album could not load. Refresh to try again.';});
