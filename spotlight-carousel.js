(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.honoree-carousel').forEach(root=>{
 const slides=[...root.querySelectorAll('.honoree-slide')],stage=root.querySelector('.honoree-stage'),status=root.querySelector('.honoree-count');let index=0,busy=false,start=null,suppressClick=false;
 function fitFrame(){
 const img=slides[index].querySelector('img');if(!img.naturalWidth)return;
 const css=getComputedStyle(stage),n=k=>parseFloat(css[k])||0;
 const bx=n('borderLeftWidth')+n('borderRightWidth')+n('paddingLeft')+n('paddingRight');
 const by=n('borderTopWidth')+n('borderBottomWidth')+n('paddingTop')+n('paddingBottom');
 const mobile=matchMedia('(max-width:600px)').matches,legacy=!!root.closest('.legacy-person');
 const cap=mobile?Math.max(300,Math.min(innerHeight*.55,520)):legacy?Math.max(330,Math.min(innerHeight*.60,620)):Math.max(320,Math.min(innerHeight*.64,650));
 const ratio=img.naturalWidth/img.naturalHeight,w=Math.max(1,Math.min(root.clientWidth-bx,(cap-by)*ratio));
 stage.style.width=(w+bx)+'px';stage.style.height=(w/ratio+by)+'px';
 }
 slides.forEach(slide=>slide.querySelector('img').addEventListener('load',()=>{if(slides[index]===slide)fitFrame()}));
 new ResizeObserver(fitFrame).observe(root);fitFrame();
 const count=()=>{status.textContent=`${index+1} / ${slides.length}`};count();
 async function move(direction){if(busy||slides.length<2)return;const old=slides[index];index=(index+direction+slides.length)%slides.length;const next=slides[index];busy=true;const nextImage=next.querySelector("img");nextImage.loading="eager";try{await nextImage.decode()}catch{}old.inert=true;
 const mode=root.dataset.motion;let enter,leave;
 if(mode==='fade'){enter=[{opacity:0,filter:'brightness(1.18)'},{opacity:1,filter:'brightness(1)'}];leave=[{opacity:1},{opacity:0}];}
 else if(mode==='print'){enter=[{opacity:0,transform:`translateY(16px) rotate(${direction*3}deg) scale(.97)`},{opacity:1,transform:'none'}];leave=[{opacity:1},{opacity:0,transform:`translateY(-8px) rotate(${-direction*2}deg)`}];}
 else if(mode==='pan'){enter=[{opacity:0,transform:`translateX(${direction*7}%) scale(1.03)`},{opacity:1,transform:'none'}];leave=[{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-direction*7}%)`}];}
 else{enter=[{opacity:0,transform:`translateX(${direction*22}%)`},{opacity:1,transform:'none'}];leave=[{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-direction*22}%)`}];}
 const swap=()=>{old.hidden=true;next.hidden=false;next.inert=false;fitFrame()};
 const done=()=>{busy=false;count()};
 if(reduced.matches||!stage.animate){swap();done();return;}
 // Move the complete framed photograph out, change the image, then bring its frame back in.
 const options={duration:mode==='fade'?240:220,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'};
 let animation;
 try{animation=stage.animate(leave,options);await animation.finished;swap();animation.cancel();animation=stage.animate(enter,options);await animation.finished;}
 catch{swap();}
 finally{animation?.cancel();done();}
 }
 root.querySelector('.honoree-prev').onclick=()=>move(-1);root.querySelector('.honoree-next').onclick=()=>move(1);
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 stage.addEventListener('pointerdown',e=>{if(e.button===0){start={x:e.clientX,y:e.clientY,id:e.pointerId};suppressClick=false}});
 stage.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25){suppressClick=true;move(dx<0?1:-1)}});
 stage.addEventListener('pointercancel',()=>{start=null});stage.addEventListener('pointerleave',()=>{start=null});
 stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false}},true);
 stage.addEventListener('dragstart',e=>e.preventDefault());
});
})();
