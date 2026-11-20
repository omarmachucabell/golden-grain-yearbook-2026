const J={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
const json=(v,status=200,h={})=>new Response(JSON.stringify(v),{status,headers:{...J,...h}});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=v=>JSON.parse(JSON.stringify(v));
async function hash(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(v=>v.toString(16).padStart(2,'0')).join('');}
async function read(env,k,fallback){const o=await env.BUCKET.get(k);return {data:o?await o.json():copy(fallback),revision:o?.etag||'none'};}
function token(r){return r.headers.get('cookie')?.match(/(?:^|;\s*)gg_editor=([a-f0-9]{64})(?:;|$)/)?.[1];}
async function auth(r,env){const t=token(r);if(!t)return false;const o=await env.BUCKET.get('sessions/'+await hash(t));if(!o)return false;const s=await o.json();return s.expires>Date.now()&&s.user===r.headers.get('oai-authenticated-user-id');}
function photo(p){return '<button class="photo" data-photo="'+esc(p.src)+'" aria-label="Open photograph"><img src="'+esc(p.src)+'" alt="" loading="lazy" decoding="async" style="object-position:'+p.x+'% '+p.y+'%"></button>';}
function render(page,catalog){let h=PAGES[page];if(!h)return null;
 for(const p of catalog.people){const old=SEED.people.find(o=>o.id===p.id);if(p.photo===old.photo&&p.x===old.x&&p.y===old.y)continue;
 const initials=esc(p.name.split(' ').map(w=>w[0]).slice(0,2).join(''));const placeholder='<div class="portrait-placeholder award-portrait-placeholder" role="img" aria-label="Portrait placeholder for '+esc(p.name)+'"><span class="portrait-initials">'+initials+'</span></div>';
 if(!p.photo){if(old.photo)h=h.replace(/<button\b[^>]*>[\s\S]*?<\/button>|<img\b[^>]*>/g,t=>t.includes('src="'+old.photo+'"')?placeholder:t);continue;}
 if(old.photo)h=h.split(old.photo).join(esc(p.photo));
 const first=p.name.split(' ')[0];let names=[first,p.name];if(first==='Maximiliano')names.push('Max');if(first==='Liam')names=[p.name,p.name==='Liam Baynes'?'Liam B.':'Liam V.'];if(first==='Jacob')names=[p.name,p.name==='Jacob Perrault'?'Jacob P.':'Jacob R.'];
 h=h.replace(/<div class="([^"]*placeholder[^"]*)" role="img" aria-label="Portrait placeholder for ([^"]+)">[\s\S]*?<\/div>/g,(m,classes,label)=>names.some(n=>n===label||esc(n)===label)?'<img class="'+classes+' managed-portrait" src="'+esc(p.photo)+'" alt="'+esc(p.name)+'" loading="lazy" style="display:block;object-fit:cover;object-position:'+p.x+'% '+p.y+'%">':m);
 h=h.replace(/<img\b[^>]*>/g,t=>t.includes('src="'+esc(p.photo)+'"')?t.replace(/\sstyle="[^"]*"/g,'').replace(/>$/,' style="display:block;object-fit:cover;object-position:'+p.x+'% '+p.y+'%">'):t);
 }
 const colls=catalog.collections.filter(c=>c.page===page);let idx=0;h=h.replace(/<div class="photos ([^"]*)">[\s\S]*?<\/div>/g,(m,classes)=>{const c=colls.find(c=>c.index===idx++);const old=SEED.collections.find(o=>o.id===c?.id);return c&&JSON.stringify(c.items)!==JSON.stringify(old.items)?'<div class="photos '+classes+'">'+c.items.map(photo).join('')+'</div>':m;});
 for(const c of colls.filter(c=>c.index===-1&&c.items.length)){if(page==='/throwbacks.html'){let j=0;h=h.replace(/<div class="memory-slot">[\s\S]*?<\/div>/g,m=>j<c.items.length?'<div class="memory-slot">'+photo(c.items[j++])+'</div>':m);if(j<c.items.length)h=h.replace('</section></div><footer','</section><div class="photos memory-photos">'+c.items.slice(j).map(photo).join('')+'</div></div><footer');}else h=h.replace('<section class="dog-finish">','<div class="photos memory-photos">'+c.items.map(photo).join('')+'</div><section class="dog-finish">');}
 return h;
}
function validate(d){const ok=s=>typeof s==='string'&&(/^\/media\/[a-f0-9-]+\.jpg$/.test(s)||/^assets\/[a-zA-Z0-9_./-]+$/.test(s)&&!s.includes('..'));const pos=(n,def)=>Number.isFinite(n)&&n>=0&&n<=100?n:def;if(!Array.isArray(d?.people)||!Array.isArray(d?.collections))throw Error('Invalid catalog');return {people:SEED.people.map(p=>{const v=d.people.find(v=>v.id===p.id);if(!v||v.photo!==null&&!ok(v.photo))throw Error('Invalid portrait');return {...p,photo:v.photo,x:pos(v.x,50),y:pos(v.y,35)};}),collections:SEED.collections.map(c=>{const v=d.collections.find(v=>v.id===c.id);if(!v||!Array.isArray(v.items)||v.items.length>2000)throw Error('Invalid collection');const ids=new Set();return {...c,items:v.items.map(p=>{if(!ok(p.src)||typeof p.id!=='string'||p.id.length>100||ids.has(p.id))throw Error('Invalid photo');ids.add(p.id);return {id:p.id,src:p.src,x:pos(p.x,50),y:pos(p.y,50)};})};})};}
async function inboxRequest(req,env){
const json=(v,status=200,extra={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?new TextEncoder().encode(value):value))].map(n=>n.toString(16).padStart(2,'0')).join('');
async function read(env,key){const r=await env.BUCKET.get(key);return r?await r.json():null}
function imageType(b){if(b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';if(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71)return 'image/png';const s=new TextDecoder().decode(b.slice(0,64));if(s.startsWith('GIF87a')||s.startsWith('GIF89a'))return 'image/gif';if(s.startsWith('RIFF')&&s.slice(8,12)==='WEBP')return 'image/webp';if(s.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|mif1|msf1/.test(s))return 'image/heic';if(s.slice(4,8)==='ftyp'&&/avif|avis/.test(s))return 'image/avif';return null}

const u=new URL(req.url),path=u.pathname;
if(!env.INBOX_SERVICE_KEY||req.headers.get('x-inbox-key')!==env.INBOX_SERVICE_KEY)return json({error:'Unauthorized'},401);
 if(path==='/api/inbox/photos'&&req.method==='GET'){
  const result=await env.BUCKET.list({prefix:'inbox/',limit:60,...(u.searchParams.get('cursor')?{cursor:u.searchParams.get('cursor')}:{})});
  const items=await Promise.all(result.objects.map(o=>read(env,o.key)));return json({items:items.filter(Boolean),cursor:result.truncated?result.cursor:null});
 }
 if(path==='/api/inbox/upload'&&req.method==='POST'){
  const max=30*1024*1024;if(Number(req.headers.get('content-length'))>max)return json({error:'Each photo must be under 30 MB.'},413);
  const reader=req.body?.getReader();if(!reader)return json({error:'No photo received.'},400);let size=0;const chunks=[];while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>max){await reader.cancel();return json({error:'Each photo must be under 30 MB.'},413)}chunks.push(r.value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}const type=imageType(bytes);if(!type)return json({error:'Use JPEG, PNG, WebP, GIF, HEIC, or AVIF photos.'},415);
  const name=(u.searchParams.get('name')||'Photo').slice(0,200),batch=(u.searchParams.get('batch')||'Unsorted').slice(0,100),digest=await hash(bytes),id=await hash(digest+'\n'+batch+'\n'+name),key='inbox/'+id+'.json';
  const existing=await read(env,key);if(existing)return json({item:existing,duplicate:true});
  await env.BUCKET.put('photos/'+digest,bytes,{httpMetadata:{contentType:type}});
  const item={id,name,batch,size,type,uploadedAt:new Date().toISOString(),src:'/inbox-media/'+digest};await env.BUCKET.put(key,JSON.stringify(item));return json({item},201);
 }

 if(/^\/api\/inbox\/photo\/[a-f0-9]{64}$/.test(path)&&req.method==='GET'){
 const r=await env.BUCKET.get('photos/'+path.split('/').pop());if(!r)return json({error:'Photo not found.'},404);
 return new Response(r.body,{headers:{'Content-Type':r.httpMetadata.contentType,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}});
 }
 return json({error:'Not found'},404);
}

export default {async fetch(r,env){try{const u=new URL(r.url),path=u.pathname;
if(path.startsWith('/api/inbox/'))return await inboxRequest(r,env);
if(/^\/inbox-media\/[a-f0-9]{64}$/.test(path)&&['GET','HEAD'].includes(r.method)){
const o=await env.BUCKET.get('photos/'+path.split('/').pop());return o?new Response(r.method==='HEAD'?null:o.body,{headers:{'content-type':o.httpMetadata.contentType,'cache-control':'private,max-age=86400','x-content-type-options':'nosniff'}}):new Response('Not found',{status:404});}
if(path.startsWith('/api/manager/')){
 if(!env.BUCKET||!env.PHOTO_MANAGER_PASSWORD)return json({error:'Photo storage is not configured.'},503);
 if(r.method!=='GET'&&r.headers.get('origin')!==u.origin)return json({error:'Invalid origin'},403);
 if(path==='/api/manager/login'&&r.method==='POST'){
  const user=r.headers.get('oai-authenticated-user-id'),email=r.headers.get('oai-authenticated-user-email');if(!user||email?.toLowerCase()!==env.PHOTO_MANAGER_OWNER_EMAIL?.toLowerCase())return json({error:'Sign in with the yearbook owner’s ChatGPT account to unlock the manager.'},401);
  const key='attempts/'+await hash(user);let a=(await read(env,key,{count:0,until:0})).data;if(a.until<Date.now())a={count:0,until:Date.now()+900000};if(a.count>=6)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  const {password}=await r.json();if(typeof password!=='string'||password.length>200||await hash(password)!==await hash(env.PHOTO_MANAGER_PASSWORD)){await env.BUCKET.put(key,JSON.stringify({...a,count:a.count+1}));return json({error:'Incorrect password'},401);}
  await env.BUCKET.delete(key);const t=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');await env.BUCKET.put('sessions/'+await hash(t),JSON.stringify({user,expires:Date.now()+28800000}));return json({ok:true},200,{'set-cookie':'gg_editor='+t+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'});
 }
 if(!await auth(r,env))return json({error:'Please unlock the photo manager.'},401);
 if(path==='/api/manager/logout'&&r.method==='POST'){await env.BUCKET.delete('sessions/'+await hash(token(r)));return json({ok:true},200,{'set-cookie':'gg_editor=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});}
 if(path==='/api/manager/catalog'&&r.method==='GET'){const d=await read(env,'catalog/draft.json',SEED);return json({catalog:d.data,revision:d.revision});}
 if(path==='/api/manager/catalog'&&r.method==='PUT'){if(Number(r.headers.get('content-length'))>2000000)return json({error:'Catalog too large'},413);const b=await r.json();let data;try{data=validate(b.catalog);}catch(e){return json({error:e.message},400);}const result=await env.BUCKET.put('catalog/draft.json',JSON.stringify(data),{onlyIf:b.revision==='none'?{etagDoesNotMatch:'*'}:{etagMatches:b.revision},httpMetadata:{contentType:'application/json'}});return result?json({revision:result.etag}):json({error:'Another tab saved changes. Reload before editing.'},409);}
 if(path==='/api/manager/publish'&&r.method==='POST'){const b=await r.json(),d=await read(env,'catalog/draft.json',SEED);if(b.revision!==d.revision)return json({error:'The draft changed. Reload before publishing.'},409);const old=await read(env,'catalog/live.json',SEED);await env.BUCKET.put('catalog/previous.json',JSON.stringify(old.data));await env.BUCKET.put('catalog/live.json',JSON.stringify(validate(d.data)));return json({ok:true});}
 if(path==='/api/manager/upload'&&r.method==='POST'){if(r.headers.get('content-type')!=='image/jpeg')return json({error:'Upload a JPEG image.'},415);if(Number(r.headers.get('content-length'))>15000000)return json({error:'Image too large'},413);const bytes=await r.arrayBuffer(),b=new Uint8Array(bytes);if(b.length>15000000||b.length<3||b[0]!==255||b[1]!==216)return json({error:'Invalid JPEG'},400);const id=crypto.randomUUID()+'.jpg';await env.BUCKET.put('media/'+id,bytes,{httpMetadata:{contentType:'image/jpeg'}});return json({src:'/media/'+id});}
 return json({error:'Not found'},404);
}
if(path.startsWith('/media/')){if(!/^\/media\/[a-f0-9-]+\.jpg$/.test(path))return new Response('Not found',{status:404});const o=await env.BUCKET.get(path.slice(1));return o?new Response(r.method==='HEAD'?null:o.body,{headers:{'content-type':'image/jpeg','cache-control':'private,max-age=86400','x-content-type-options':'nosniff'}}):new Response('Not found',{status:404});}
if(path==='/manage'||path==='/manage.html')return new Response(ADMIN,{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store','x-frame-options':'DENY'}});
if(TEXT[path])return new Response(TEXT[path],{headers:{'content-type':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':'application/json'}});
const page=path==='/'?'/index.html':path;if(PAGES[page]){let c=SEED;if(env.BUCKET)c=(await read(env,u.searchParams.has('preview')&&await auth(r,env)?'catalog/draft.json':'catalog/live.json',SEED)).data;return new Response(render(page,c),{headers:{'content-type':'text/html;charset=utf-8','cache-control':'no-store'}});}
return env.ASSETS?env.ASSETS.fetch(r):new Response('Not found',{status:404});
}catch(e){console.error(e);return json({error:'Unable to complete this request. Try again; your published photos are unchanged.'},500);}}};
