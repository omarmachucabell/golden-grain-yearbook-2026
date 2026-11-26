(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
const photos=[...document.querySelectorAll('.dia-photo')];document.body.classList.add('dia-ready');
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('dia-unseen');observer.unobserve(entry.target)}},{rootMargin:'0px 0px 50px 0px',threshold:.05});
photos.forEach(photo=>{photo.classList.add('dia-unseen');observer.observe(photo)});
document.addEventListener('focusin',e=>e.target.closest('.dia-photo')?.classList.remove('dia-unseen'));
})();
