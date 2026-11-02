const buttons=[...document.querySelectorAll('[data-photo]')],viewer=document.querySelector('dialog'),image=viewer.querySelector('img');let current=0;function show(){image.src=buttons[current].dataset.photo;image.alt=buttons[current].querySelector('img').alt;viewer.querySelector('.photo-number').textContent=`${current+1} / ${buttons.length}`}function move(n){current=(current+n+buttons.length)%buttons.length;show()}buttons.forEach((b,i)=>b.addEventListener('click',()=>{current=i;show();viewer.showModal()}));viewer.querySelector('.close').onclick=()=>viewer.close();viewer.querySelector('.photo-prev').onclick=()=>move(-1);viewer.querySelector('.photo-next').onclick=()=>move(1);viewer.addEventListener('keydown',e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1)});let x=0;viewer.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX},{passive:true});viewer.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-x;if(Math.abs(delta)>60)move(delta<0?1:-1)},{passive:true});
const sections=[...document.querySelectorAll('.nav-section')];
function setMenu(section,open){section.querySelector('.section-toggle').setAttribute('aria-expanded',String(open));section.querySelector('.section-menu').hidden=!open;}
function closeMenus(except){sections.forEach(section=>{if(section!==except)setMenu(section,false);});}
sections.forEach(section=>{
 const toggle=section.querySelector('.section-toggle'),menu=section.querySelector('.section-menu');
 toggle.addEventListener('click',event=>{const open=event.pointerType==='mouse'||toggle.getAttribute('aria-expanded')!=='true';closeMenus();setMenu(section,open);});
 section.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){closeMenus(section);setMenu(section,true);}});
 section.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'&&!section.contains(document.activeElement))setMenu(section,false);});
 section.addEventListener('focusout',event=>{if(!section.contains(event.relatedTarget))setMenu(section,false);});
 toggle.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();closeMenus(section);setMenu(section,true);menu.querySelector('a').focus();}});
 section.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();toggle.focus();setMenu(section,false);}});
});
document.addEventListener('click',event=>{if(!event.target.closest('.nav-section'))closeMenus();});

const carousel=document.querySelector('.section-carousel');
if(carousel){
 const slides=[...carousel.querySelectorAll('.topic-entry')],dots=[...carousel.querySelectorAll('[data-slide]')],stage=carousel.querySelector('.carousel-stage');let selected=0;
 function selectSlide(index,direction=1){selected=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==selected;slide.classList.toggle('is-arriving',i===selected);});stage.style.setProperty('--slide-entry',direction<0?'-25px':'25px');dots.forEach((dot,i)=>{if(i===selected)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});carousel.querySelector('.carousel-status').textContent=slides[selected].querySelector('h2').textContent+' · '+(selected+1)+' of '+slides.length;}
 carousel.querySelector('.carousel-prev').addEventListener('click',()=>selectSlide(selected-1,-1));carousel.querySelector('.carousel-next').addEventListener('click',()=>selectSlide(selected+1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>selectSlide(i,i<selected?-1:1)));
 carousel.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const step=event.key==='ArrowRight'?1:-1;const fromSlide=event.target.closest('.topic-entry');selectSlide(selected+step,step);if(fromSlide)dots[selected].focus();}});
 let gesture=null,suppressClick=false;
 stage.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;gesture={x:event.clientX,y:event.clientY,id:event.pointerId};suppressClick=false;});
 stage.addEventListener('pointerup',event=>{if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25){suppressClick=true;selectSlide(selected+(dx<0?1:-1),dx<0?1:-1);}});
 stage.addEventListener('pointercancel',()=>{gesture=null;});stage.addEventListener('dragstart',event=>event.preventDefault());stage.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
}

const pinnedCover=document.querySelector('.cover-page .cover');
if(pinnedCover){
 const entrance=document.querySelector('.topic-entrances'),motionPreference=matchMedia('(prefers-reduced-motion: reduce)');let scrollFrame=0;
 function updateCover(){scrollFrame=0;const height=pinnedCover.offsetHeight;const progress=motionPreference.matches?0:Math.min(1,Math.max(0,1-entrance.getBoundingClientRect().top/height));pinnedCover.style.setProperty('--cover-progress',progress.toFixed(3));pinnedCover.inert=!motionPreference.matches&&entrance.getBoundingClientRect().top<=0;}
 function queueCover(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateCover);}
 addEventListener('scroll',queueCover,{passive:true});addEventListener('resize',queueCover);motionPreference.addEventListener('change',queueCover);updateCover();
}
