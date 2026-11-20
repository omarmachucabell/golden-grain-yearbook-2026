const json=(v,status=200,extra={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?new TextEncoder().encode(value):value))].map(n=>n.toString(16).padStart(2,'0')).join('');
async function read(env,key){const r=await env.BUCKET.get(key);return r?await r.json():null}
async function authenticated(req,env){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)inbox_session=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return false;const session=await read(env,'sessions/'+await hash(token));return session?.expires>Date.now()}
function imageType(b){if(b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';if(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71)return 'image/png';const s=new TextDecoder().decode(b.slice(0,64));if(s.startsWith('GIF87a')||s.startsWith('GIF89a'))return 'image/gif';if(s.startsWith('RIFF')&&s.slice(8,12)==='WEBP')return 'image/webp';if(s.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|mif1|msf1/.test(s))return 'image/heic';if(s.slice(4,8)==='ftyp'&&/avif|avis/.test(s))return 'image/avif';return null}
export default {async fetch(req,env){try{
 const u=new URL(req.url),path=u.pathname;
 if(path==='/'&&req.method==='GET')return new Response(HTML,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','X-Content-Type-Options':'nosniff'}});
 if(req.method==='POST'&&req.headers.get('origin')!==u.origin)return json({error:'Please reload the upload page.'},403);
 if(path==='/api/login'&&req.method==='POST'){
  if(!env.UPLOAD_PASSCODE)return json({error:'Uploader not configured.'},503);
  const key='attempts/'+await hash(req.headers.get('cf-connecting-ip')||'unknown');
  for(let retry=0;retry<5;retry++){
   const old=await env.BUCKET.get(key),prior=old?await old.json():null,now=Date.now();const state=prior?.until>now?prior:{count:0,until:now+15*60*1000};
   if(state.count>=8)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
   const updated=await env.BUCKET.put(key,JSON.stringify({...state,count:state.count+1}),{onlyIf:old?{etagMatches:old.etag}:{etagDoesNotMatch:'*'}});if(updated)break;if(retry===4)return json({error:'Please try again shortly.'},429);
  }
  if(Number(req.headers.get('content-length'))>1024)return json({error:'Invalid request.'},400);
  const {passcode}=await req.json();if(typeof passcode!=='string'||passcode.length>128||await hash(passcode)!==await hash(env.UPLOAD_PASSCODE))return json({error:'Incorrect passcode.'},401);
  const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');await env.BUCKET.put('sessions/'+await hash(token),JSON.stringify({expires:Date.now()+86400000}));
  return json({ok:true},200,{'Set-Cookie':'inbox_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400'});
 }
 if(!await authenticated(req,env))return json({error:'Enter your passcode to continue.'},401);
 if(path==='/api/logout'&&req.method==='POST'){const token=req.headers.get('cookie')?.match(/inbox_session=([a-f0-9]{64})/)?.[1];if(token)await env.BUCKET.delete('sessions/'+await hash(token));return json({ok:true},200,{'Set-Cookie':'inbox_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'})}

 if(path==='/api/upload'||path==='/api/photos'||/^\/yearbook-photo\/[a-f0-9]{64}$/.test(path)){
  if(!env.YEARBOOK_ORIGIN||!env.YEARBOOK_ACCESS_TOKEN||!env.INBOX_SERVICE_KEY)return json({error:'Yearbook connection is unavailable. Please retry later.'},503);
  if((path==='/api/upload'&&req.method!=='POST')||(path!=='/api/upload'&&req.method!=='GET'))return json({error:'Method not allowed'},405);
  const cursor=u.searchParams.get('cursor');
  if(path==='/api/photos'&&cursor?.startsWith('legacy:')){
    const old=await env.BUCKET.list({prefix:'inbox/',limit:60,...(cursor.slice(7)?{cursor:cursor.slice(7)}:{})});
    return json({items:(await Promise.all(old.objects.map(o=>read(env,o.key)))).filter(Boolean),cursor:old.truncated?'legacy:'+old.cursor:null});
  }
  const target=path==='/api/upload'?'/api/inbox/upload':path==='/api/photos'?'/api/inbox/photos':'/api/inbox/photo/'+path.split('/').pop();
  const headers={'OAI-Sites-Authorization':'Bearer '+env.YEARBOOK_ACCESS_TOKEN,'x-inbox-key':env.INBOX_SERVICE_KEY};
  for(const h of ['content-type','content-length'])if(req.headers.has(h))headers[h]=req.headers.get(h);
  const upstream=await fetch(env.YEARBOOK_ORIGIN+target+u.search,{method:req.method,headers,body:req.method==='POST'?req.body:undefined,redirect:'manual'});
  const type=upstream.headers.get('content-type')||'';
  if(upstream.status>=300&&upstream.status<400||!type.includes(path.startsWith('/yearbook-photo/')?'image/':'application/json'))return json({error:'Could not reach yearbook storage. Please retry.'},502);
  if(path.startsWith('/yearbook-photo/'))return new Response(upstream.body,{status:upstream.status,headers:{'Content-Type':type,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}});
  const data=await upstream.json();const adapt=item=>({...item,src:item.src.replace('/inbox-media/','/yearbook-photo/')});
  if(data.item)data.item=adapt(data.item);
  if(data.items){data.items=data.items.map(adapt);if(!data.cursor){const old=await env.BUCKET.list({prefix:'inbox/',limit:1});if(old.objects.length)data.cursor='legacy:';}}
  return json(data,upstream.status);
 }
 if(/^\/photos\/[a-f0-9]{64}$/.test(path)&&req.method==='GET'){const r=await env.BUCKET.get(path.slice(1));if(!r)return json({error:'Photo not found.'},404);return new Response(r.body,{headers:{'Content-Type':r.httpMetadata.contentType,'Content-Length':String(r.size),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
 return json({error:'Not found.'},404);
 }catch(e){return json({error:'Could not complete that request. Please retry.'},500)}}};
