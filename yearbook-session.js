(() => {
  const prefix = 'ggr-session-v1:';
  const read = (key, fallback = null) => {try {return JSON.parse(sessionStorage.getItem(prefix + key)) ?? fallback;} catch {return fallback;}};
  const write = (key, value) => {try {sessionStorage.setItem(prefix + key, JSON.stringify(value));} catch {}};
  let pageKey = () => 'scroll:' + location.pathname + location.hash;
  let currentKey = pageKey(), restoring = false, restoreTimer, saveTimer;
  const save = () => {if (!restoring) write(currentKey, scrollY);};
  const cancelRestore = () => {clearTimeout(restoreTimer); restoring = false;};
  const restore = () => {
    cancelRestore();
    const y = read(currentKey);
    if (!Number.isFinite(y)) return;
    restoring = true;
    const deadline = performance.now() + 2500;
    const attempt = () => {
      scrollTo({top:y, behavior:'instant'});
      if (Math.abs(scrollY-y)>2 && performance.now()<deadline) restoreTimer=setTimeout(attempt,100);
      else restoring=false;
    };
    requestAnimationFrame(() => requestAnimationFrame(attempt));
  };
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  addEventListener('scroll',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(save,150);},{passive:true});
  addEventListener('pagehide',save);
  for (const event of ['wheel','touchstart','pointerdown','keydown']) addEventListener(event,cancelRestore,{passive:true});
  addEventListener('hashchange',()=>{currentKey=pageKey();restore();});
  addEventListener('pageshow',event=>{if(!event.persisted)restore();});
  const bindViewer = (dialog, move) => {
    dialog.classList.add('yearbook-photo-viewer');
    dialog.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
    });
    let start;
    dialog.addEventListener('touchstart',event=>{start=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    dialog.addEventListener('touchcancel',()=>{start=null;},{passive:true});
    dialog.addEventListener('touchend',event=>{
      if(!start||!event.changedTouches.length)return;
      const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;start=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.25)move(dx<0?1:-1);
    },{passive:true});
  };
  window.Yearbook = {read,write,restore,save,bindViewer};
  const parent = {
    'team.html':['team-directory.html','Team'], 'superlatives.html':['team-directory.html','Team'], 'spotlight.html':['team-directory.html','Team'],
    'photo-album.html':['moments.html','Season Snapshot'], 'throwbacks.html':['moments.html','Season Snapshot'],
    'halloween.html':['holidays.html','Holidays'], 'dia.html':['holidays.html','Holidays'], 'dogs.html':['holidays.html','Holidays']
  }[location.pathname.split('/').pop()];
  const updateParent = () => {if(parent)document.querySelectorAll('.section-ending .back-home').forEach(link=>{link.href=parent[0];link.textContent='Back to '+parent[1];});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateParent,{once:true});else updateParent();
})();
