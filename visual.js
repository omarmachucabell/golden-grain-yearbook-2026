const buttons=[...document.querySelectorAll('[data-photo]')],viewer=document.querySelector('dialog'),image=viewer?.querySelector('img');if(viewer){let current=0;function show(){image.src=buttons[current].dataset.photo;image.alt=buttons[current].querySelector('img').alt;viewer.querySelector('.photo-number').textContent=`${current+1} / ${buttons.length}`}function move(n){current=(current+n+buttons.length)%buttons.length;show()}buttons.forEach((b,i)=>b.addEventListener('click',()=>{current=i;show();viewer.showModal()}));viewer.querySelector('.close').onclick=()=>viewer.close();viewer.querySelector('.photo-prev').onclick=()=>move(-1);viewer.querySelector('.photo-next').onclick=()=>move(1);window.Yearbook.bindViewer(viewer,move);}
// Keep directory labels as links; the adjacent control opens their subsections.
const directoryMenus={
 'team-directory.html':[['Meet the Team','team.html'],['Superlatives','superlatives.html'],['Team Member of the Week','spotlight.html']],
 'moments.html':[['Photo Album','photo-album.html'],['TikToks & Videos','videos.html'],['Last Season','throwbacks.html']],
 'holidays.html':[['Halloween','halloween.html'],['Day of the Dead','dia.html'],['Dog Days','dogs.html']]
};
document.querySelectorAll('.topic-nav > a.snapshot-nav-link').forEach((link,index)=>{
 const items=directoryMenus[link.getAttribute('href')];if(!items)return;
 const section=document.createElement('div'),toggle=document.createElement('button'),menu=document.createElement('div');
 section.className='nav-section shutter-nav';toggle.className='section-toggle';toggle.type='button';
 toggle.setAttribute('aria-label','Show '+link.textContent+' subsections');toggle.setAttribute('aria-expanded','false');
 menu.id='directory-menu-'+index;menu.className='section-menu';menu.hidden=true;
 toggle.setAttribute('aria-controls',menu.id);toggle.innerHTML='<span class="menu-chevron" aria-hidden="true">⌄</span>';
 items.forEach(([title,href])=>{const a=document.createElement('a');a.textContent=title;a.href=href;if(location.pathname.split('/').pop()===href)a.setAttribute('aria-current','page');menu.append(a);});
 link.before(section);section.append(link,toggle,menu);
 link.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();closeMenus(section);setMenu(section,true);menu.querySelector('a').focus();}});
});
const sections=[...document.querySelectorAll('.nav-section')];
function setMenu(section,open){section.querySelector('.section-toggle').setAttribute('aria-expanded',String(open));section.querySelector('.section-menu').hidden=!open;}
function closeMenus(except){sections.forEach(section=>{if(section!==except)setMenu(section,false);});}
sections.forEach(section=>{
 const toggle=section.querySelector('.section-toggle'),menu=section.querySelector('.section-menu');
 toggle.addEventListener('click',event=>{const open=toggle.getAttribute('aria-expanded')!=='true';closeMenus();setMenu(section,open);});
 section.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&matchMedia('(min-width:601px)').matches){closeMenus(section);setMenu(section,true);}});
 section.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'&&matchMedia('(min-width:601px)').matches&&!section.contains(document.activeElement))setMenu(section,false);});
 section.addEventListener('focusout',event=>{if(!section.contains(event.relatedTarget))setMenu(section,false);});
 toggle.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();closeMenus(section);setMenu(section,true);menu.querySelector('a').focus();}});
 section.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();toggle.focus();setMenu(section,false);}});
});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-section'))closeMenus();});

const carousel=document.querySelector('.section-carousel');
if(carousel){
 const slides=[...carousel.querySelectorAll('.topic-entry')],dots=[...carousel.querySelectorAll('[data-slide]')],stage=carousel.querySelector('.carousel-stage');let selected=0;
 const headingMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const photoLayers=slides.map((slide,i)=>{
  const layer=document.createElement('div'),photo=document.createElement('div');
  layer.className='carousel-photo-layer'+(i===0?' is-current':'');
  layer.setAttribute('aria-hidden','true');
  photo.className='carousel-photo photo-'+i;
  photo.style.backgroundImage=slide.style.getPropertyValue('--topic-photo');
  layer.append(photo);slide.prepend(layer);return layer;
 });
 stage.classList.add('has-photo-motion');

 slides.forEach(slide=>{
  const link=slide.querySelector('h2'),float=document.createElement('span');
  float.className='heading-float';
  while(link.firstChild)float.append(link.firstChild);
  link.append(float);
 });
 let headingFrame=0,pointerX=0,pointerY=0;
 function resetHeadingPointer(){
  cancelAnimationFrame(headingFrame);headingFrame=0;
  stage.style.setProperty('--heading-x','0px');stage.style.setProperty('--heading-y','0px');
 }
 stage.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||headingMotion.matches)return;
  pointerX=event.clientX;pointerY=event.clientY;
  if(!headingFrame)headingFrame=requestAnimationFrame(()=>{
   headingFrame=0;const bounds=stage.getBoundingClientRect();
   const clamp=n=>Math.max(-1,Math.min(1,n));
   stage.style.setProperty('--heading-x',clamp((pointerX-bounds.left)/bounds.width*2-1)*4+'px');
   stage.style.setProperty('--heading-y',clamp((pointerY-bounds.top)/bounds.height*2-1)*3+'px');
  });
 },{passive:true});
 stage.addEventListener('pointerleave',resetHeadingPointer);
 headingMotion.addEventListener('change',resetHeadingPointer);
 const headingObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>stage.classList.toggle('headings-in-view',entry.isIntersecting));
 },{threshold:.15});
 headingObserver.observe(stage);
 let sliding=false,queuedSlide=null,panelAnimations=[];
 headingMotion.addEventListener('change',()=>{if(headingMotion.matches)panelAnimations.forEach(animation=>animation.finish());});
 function selectSlide(index,direction=1){
  const next=(index+slides.length)%slides.length;
  if(sliding){queuedSlide={index:next,direction};return;}
  if(next===selected)return;
  resetHeadingPointer();
  const outgoing=slides[selected],incoming=slides[next];selected=next;
  if(outgoing.contains(document.activeElement))dots[selected].focus();
  incoming.hidden=false;incoming.inert=false;
  outgoing.inert=true;outgoing.setAttribute('aria-hidden','true');
  dots.forEach((dot,i)=>{if(i===selected)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
  carousel.querySelector('.carousel-status').textContent=incoming.querySelector('h2').textContent+' · '+(selected+1)+' of '+slides.length;
  photoLayers[selected].classList.add('is-current');
  function finish(){
   outgoing.hidden=true;outgoing.inert=false;outgoing.removeAttribute('aria-hidden');outgoing.classList.remove('is-leaving');
   panelAnimations.forEach(animation=>animation.cancel());panelAnimations=[];
   photoLayers.forEach((layer,i)=>layer.classList.toggle('is-current',i===selected));
   sliding=false;
   if(queuedSlide){const queued=queuedSlide;queuedSlide=null;selectSlide(queued.index,queued.direction);}
  }
  if(headingMotion.matches){finish();return;}
  sliding=true;outgoing.classList.add('is-leaving');
  const sign=direction<0?-1:1,options={duration:700,easing:'cubic-bezier(.22,.8,.25,1)',fill:'both'};
  panelAnimations=[
   outgoing.animate([{transform:'translateX(0)'},{transform:`translateX(${-sign*100}%)`}],options),
   incoming.animate([{transform:`translateX(${sign*100}%)`},{transform:'translateX(0)'}],options)
  ];
  Promise.all(panelAnimations.map(animation=>animation.finished)).then(finish);
 }

 carousel.querySelector('.carousel-prev').addEventListener('click',()=>selectSlide(selected-1,-1));carousel.querySelector('.carousel-next').addEventListener('click',()=>selectSlide(selected+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>selectSlide(i,i<selected?-1:1)));
 carousel.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const step=event.key==='ArrowRight'?1:-1;const fromSlide=event.target.closest('.topic-entry');selectSlide(selected+step,step);if(fromSlide)dots[selected].focus();}});
 let gesture=null,suppressClick=false;
 stage.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;gesture={x:event.clientX,y:event.clientY,id:event.pointerId};suppressClick=false;});
 stage.addEventListener('pointerup',event=>{if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25){suppressClick=true;selectSlide(selected+(dx<0?1:-1),dx<0?1:-1);}});
 stage.addEventListener('pointercancel',()=>{gesture=null;});stage.addEventListener('dragstart',event=>event.preventDefault());stage.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
}

const pinnedCover=document.querySelector('.cover-page .cover');
if(pinnedCover){
 const entrance=document.querySelector('.topic-entrances'),motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),tube=document.querySelector('.tube-flight');let scrollFrame=0;
 // Only PUSH uses a timed scroll; wheel and touch keep native behavior.
 const pushButton=pinnedCover.querySelector('.begin');
 let pushFrame=0;
 function cancelPush(){cancelAnimationFrame(pushFrame);pushFrame=0;}
 for(const event of ['wheel','touchstart','pointerdown'])addEventListener(event,cancelPush,{passive:true});
 addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Escape','Tab'].includes(event.key))cancelPush();});
 motionPreference.addEventListener('change',cancelPush);
 pushButton?.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();cancelPush();
  const from=scrollY,target=from+entrance.getBoundingClientRect().top;
  function finish(){
   pushFrame=0;
   entrance.setAttribute('tabindex','-1');entrance.focus({preventScroll:true});
   if(location.hash!=='#yearbook')history.pushState(null,'','#yearbook');
  }
  if(motionPreference.matches){scrollTo({top:target,behavior:'instant'});finish();return;}
  const started=performance.now(),duration=1900;
  function step(now){
   const t=Math.min(1,(now-started)/duration),eased=t*t*(3-2*t);
   scrollTo({top:from+(target-from)*eased,behavior:'instant'});
   if(t<1)pushFrame=requestAnimationFrame(step);else finish();
  }
  pushFrame=requestAnimationFrame(step);
 });
 const seed=tube?.querySelector('img');
 // Stable pseudo-random values keep reverse scrolling perfectly repeatable.
 const noise=(i,salt)=>{const n=Math.sin((i+1)*127.1+salt*311.7)*43758.5453;return n-Math.floor(n);};
 const swarm=seed?Array.from({length:27},(_,i)=>{
  const item=document.createElement('div'),ring=seed.cloneNode(true),cushion=seed.cloneNode(true);
  const variant=(i*5)%9;
  item.className='rush-tube';item.dataset.variant=variant;
  ring.className='tube-ring tube-color-'+Math.floor(variant/3);
  cushion.className='tube-cushion tube-color-'+(variant%3);
  item.append(ring,cushion);tube.append(item);
  return item;
 }):[];
 seed?.remove();
 function updateCover(){
  scrollFrame=0;
  const height=pinnedCover.offsetHeight,top=entrance.getBoundingClientRect().top;
  const progress=motionPreference.matches?0:Math.min(1,Math.max(0,1-top/height));
  pinnedCover.style.setProperty('--cover-progress',progress.toFixed(3));
  pinnedCover.inert=!motionPreference.matches&&top<=0;
  if(tube){
   const visible=!motionPreference.matches&&progress>.045&&progress<.99;
   tube.style.visibility=visible?'visible':'hidden';
   if(visible){
    const columns=innerWidth<=600?4:6;
    swarm.forEach((img,i)=>{
     const size=Math.max(145,Math.min(450,innerWidth/(columns-1)*1.5))*(.72+noise(i,1)*.58);
     const start=.045+noise(i,2)*.19;
     const duration=.62+noise(i,3)*.10;
     const flight=Math.max(0,Math.min(1,(progress-start)/duration));
     const y=innerHeight+size*.8-flight*(innerHeight+size*2.6);
     // Jitter coverage slots rather than arranging tubes in visible rows.
     const x=((i%columns)+noise(i,4)*.95-.35)*innerWidth/(columns-1);
     const drift=Math.sin(flight*Math.PI)*(noise(i,5)-.5)*size*.65;
     const rotation=noise(i,6)*360+flight*(noise(i,7)-.5)*240;
     img.style.width=size+'px';
     img.style.left=x+'px';
     img.style.transform=`translate3d(calc(-50% + ${drift}px),${y}px,0) rotate(${rotation}deg) scale(${1-flight*.12})`;
    });
   }
  }
 }
 function queueCover(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateCover);}
 addEventListener('scroll',queueCover,{passive:true});addEventListener('resize',queueCover);motionPreference.addEventListener('change',queueCover);updateCover();
}

const walkiePlayers=[...document.querySelectorAll('.walkie-clip audio')];
walkiePlayers.forEach(player=>player.addEventListener('play',()=>{walkiePlayers.forEach(other=>{if(other!==player)other.pause();});}));

// Two cloud depths: slow behind the content, faster than the page in front.
if(document.body.classList.contains('superlatives-page')){
 function makeCloudLayer(parent,depth){
  const layer=document.createElement('div');
  layer.className='superlative-clouds clouds-'+depth;
  layer.setAttribute('aria-hidden','true');
  parent.append(layer);
  return layer;
 }
 const backClouds=makeCloudLayer(document.querySelector('main'),'back');
 const frontClouds=makeCloudLayer(document.body,'front');
 const reducedCloudMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const cloudSpecs=[[-35,.10,.16,.20],[45,.48,.23,.17],[-19,.95,.19,.14],[61,1.45,.13,.22],[-44,1.95,.22,.18],[23,2.48,.17,.15]];
 const frontSpecs=[[-42,.28,1.35,.15],[52,.92,1.55,.13],[-26,1.72,1.45,.12],[37,2.55,1.65,.14]];
 function populateClouds(veil,specs){return specs.map(([left,offset,speed,opacity])=>{
  const cloud=document.createElement('div');
  cloud.className='superlative-cloud';
  cloud.style.left=left+'%';
  cloud.style.setProperty('--cloud-opacity',opacity);
  veil.append(cloud);
  return {cloud,offset,speed};
 });}
 const clouds=[...populateClouds(backClouds,cloudSpecs),...populateClouds(frontClouds,frontSpecs)];
 let cloudFrame=0;
 function paintClouds(){
  cloudFrame=0;
  const height=innerHeight;
  const travel=height*3.2+650;
  const scroll=reducedCloudMotion.matches?0:Math.max(0,scrollY);
  clouds.forEach(({cloud,offset,speed})=>{
   const origin=offset*height-scroll*speed;
   const y=((origin+650)%travel+travel)%travel-650;
   cloud.style.transform=`translate3d(0,${y.toFixed(1)}px,0)`;
  });
 }
 function queueClouds(){if(!cloudFrame)cloudFrame=requestAnimationFrame(paintClouds);}
 addEventListener('scroll',queueClouds,{passive:true});
 addEventListener('resize',queueClouds);
 reducedCloudMotion.addEventListener('change',queueClouds);
 paintClouds();
}

// Clip the decoration to the outside portrait edges plus only 5–8px.
if(document.body.classList.contains('team-page')){
 const main=document.querySelector('main');
 const grid=document.querySelector('.portraits');
 const layer=main.querySelector('.sticker-litter-layer');
 function fitStickerEdges(){
  const bounds=main.getBoundingClientRect();
  const cards=[...grid.querySelectorAll(':scope > figure')].map(card=>card.getBoundingClientRect());
  if(!cards.length)return;
  const overlap=innerWidth<=600?5:8;
  layer.style.setProperty('--sticker-left-rail',Math.max(0,Math.min(...cards.map(r=>r.left))-bounds.left+overlap)+'px');
  layer.style.setProperty('--sticker-right-rail',Math.max(0,bounds.right-Math.max(...cards.map(r=>r.right))+overlap)+'px');
 }
 new ResizeObserver(fitStickerEdges).observe(grid);
 addEventListener('resize',fitStickerEdges);
 fitStickerEdges();
}

// Each spotlight gets a single entrance; decorative motion respects user preferences.
if(document.body.classList.contains('spotlight-page')){
 const spotlights=document.querySelectorAll('.spotlight-vibe');
 const spotlightObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-entered');spotlightObserver.unobserve(entry.target);}
  });
 },{threshold:.12});
 spotlights.forEach(section=>spotlightObserver.observe(section));
}

// Scroll depth is bounded and measured only for nearby spotlight sections.
if(document.body.classList.contains('spotlight-page')){
 const depthSections=[...document.querySelectorAll('.spotlight-vibe')];
 const depthMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let depthFrame=0;
 function paintSpotlightDepth(){
  depthFrame=0;
  depthSections.forEach(section=>{
   const rect=section.getBoundingClientRect();
   if(rect.bottom < -200 || rect.top > innerHeight+200)return;
   const progress=depthMotion.matches?0:Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight));
   section.style.setProperty('--atmosphere-shift',(progress*65).toFixed(1)+'px');
   section.style.setProperty('--photo-shift',(progress*-9).toFixed(1)+'px');
  });
 }
 function queueSpotlightDepth(){if(!depthFrame)depthFrame=requestAnimationFrame(paintSpotlightDepth);}
 addEventListener('scroll',queueSpotlightDepth,{passive:true});
 addEventListener('resize',queueSpotlightDepth);
 depthMotion.addEventListener('change',queueSpotlightDepth);
 paintSpotlightDepth();
}

// Reversible boundary reveals follow native scrolling without pinning or snapping.
if(document.body.classList.contains('spotlight-page')){
 const boundaries=[...document.querySelectorAll('.spotlight-transition')];
 const boundaryMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let boundaryFrame=0;
 function paintBoundaries(){
  boundaryFrame=0;
  boundaries.forEach(boundary=>{
   const box=boundary.getBoundingClientRect();
   const progress=boundaryMotion.matches?.65:Math.max(0,Math.min(1,(innerHeight*.9-box.top)/(innerHeight*.65)));
   boundary.style.setProperty('--transition-progress',progress.toFixed(4));
   boundary.style.setProperty('--light-leak',(Math.sin(progress*Math.PI)*.55).toFixed(4));
  });
 }
 function queueBoundaries(){if(!boundaryFrame)boundaryFrame=requestAnimationFrame(paintBoundaries);}
 addEventListener('scroll',queueBoundaries,{passive:true});
 addEventListener('resize',queueBoundaries);
 boundaryMotion.addEventListener('change',queueBoundaries);
 paintBoundaries();
}

// Pin only the opening card; the wheel/touch scroll remains fully native.
if(document.body.classList.contains('spotlight-page')){
 const introTrack=document.querySelector('.spotlight-intro-track');
 const introCard=document.querySelector('.spotlight-title-card');
 const introMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let introFrame=0;
 function paintSpotlightIntro(){
  introFrame=0;
  if(!introTrack || !introCard)return;
  const header=document.querySelector('.topic-header').getBoundingClientRect().height;
  const travel=introTrack.offsetHeight-introCard.offsetHeight;
  const progress=introMotion.matches?0:Math.max(0,Math.min(1,(header-introTrack.getBoundingClientRect().top)/Math.max(1,travel)));
  introCard.style.setProperty('--intro-x',(-progress*105).toFixed(3)+'%');
  introCard.style.visibility=progress>=1?'hidden':'visible';
  introCard.inert=progress>=1;
 }
 function queueSpotlightIntro(){if(!introFrame)introFrame=requestAnimationFrame(paintSpotlightIntro);}
 addEventListener('scroll',queueSpotlightIntro,{passive:true});
 addEventListener('resize',queueSpotlightIntro);
 introMotion.addEventListener('change',queueSpotlightIntro);
 paintSpotlightIntro();
}

// Native scroll drives a pinned year reel; no wheel or touch interception.
{
 const track=document.querySelector('.season-rewind-track');
 const card=document.querySelector('.season-rewind-card');
 if(track && card){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  function paintRewind(){
   frame=0;
   const header=document.querySelector('.topic-header').getBoundingClientRect().height;
   const travel=Math.max(1,track.offsetHeight-card.offsetHeight);
   const raw=Math.max(0,Math.min(1,(header-track.getBoundingClientRect().top)/travel));
   const t=motion.matches?1:Math.max(0,Math.min(1,(raw-.12)/.72));
   const p=t*t*(3-2*t);
   card.style.setProperty('--rewind-progress',p.toFixed(4));
   card.style.setProperty('--rewind-bg',[233+(236-233)*p,191+(236-191)*p,82+(236-82)*p].map(Math.round).join(' '));
  }
  function queueRewind(){if(!frame)frame=requestAnimationFrame(paintRewind);}
  addEventListener('scroll',queueRewind,{passive:true});
  addEventListener('resize',queueRewind);
  motion.addEventListener('change',queueRewind);
  paintRewind();
 }
}

// A compact scroll reveal for the spotlight season break; no sticky interval.
{
 const bridge=document.querySelector('.spotlight-season-bridge');
 if(bridge){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  function paintBridge(){
   frame=0;
   const top=bridge.getBoundingClientRect().top;
   const p=motion.matches?1:Math.max(0,Math.min(1,(innerHeight*.95-top)/(innerHeight*.5)));
   bridge.style.setProperty('--bridge-progress',p.toFixed(4));
  }
  function queueBridge(){if(!frame)frame=requestAnimationFrame(paintBridge);}
  addEventListener('scroll',queueBridge,{passive:true});
  addEventListener('resize',queueBridge);
  motion.addEventListener('change',queueBridge);
  paintBridge();
 }
}

// Continuous, slow sticker falls; each rail remains clipped above the directory.
if(document.body.classList.contains('team-page')){
 const rails=[...document.querySelectorAll('.sticker-edge')];
 function sizeStickerFalls(){
  rails.forEach((rail,side)=>{
   const distance=rail.clientHeight+480;
   rail.querySelectorAll('.award-sticker').forEach((sticker,index)=>{
    const speed=10+((index*7+side*11)%19);
    const duration=distance/speed;
    const initial=parseFloat(sticker.style.getPropertyValue('--sticker-y'))/100;
    sticker.style.setProperty('--fall-distance',distance+'px');
    sticker.style.setProperty('--fall-duration',duration+'s');
    sticker.style.setProperty('--fall-delay',(-duration*(initial*rail.clientHeight+240)/distance)+'s');
   });
   rail.classList.add('sticker-fall-ready');
  });
 }
 const fallObserver=new ResizeObserver(sizeStickerFalls);
 rails.forEach(rail=>fallObserver.observe(rail));
 sizeStickerFalls();
 document.addEventListener('visibilitychange',()=>{
  rails.forEach(rail=>rail.style.setProperty('--fall-play-state',document.hidden?'paused':'running'));
 });
}

// Reveal each arriving group once, without hiding content if JavaScript is unavailable.
if(document.body.classList.contains('team-page')){
 const portraits=[...document.querySelectorAll('.portraits > figure')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const observer=new IntersectionObserver(entries=>{
  const arriving=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>portraits.indexOf(a.target)-portraits.indexOf(b.target));
  arriving.forEach((entry,index)=>{
   if(!reduced.matches){
    entry.target.style.setProperty('--print-delay',Math.min(index,3)*75+'ms');
    entry.target.classList.add('print-entering');
    entry.target.addEventListener('animationend',()=>entry.target.classList.remove('print-entering'),{once:true});
   }
   observer.unobserve(entry.target);
  });
 },{threshold:.08});
 portraits.forEach(portrait=>observer.observe(portrait));
}
