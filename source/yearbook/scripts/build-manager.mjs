import fs from 'node:fs';
const pages=Object.fromEntries(fs.readdirSync('dist').filter(n=>n.endsWith('.html')).map(n=>['/'+n,fs.readFileSync('dist/'+n,'utf8')]));
const people=[...pages['/team.html'].matchAll(/<figure>([\s\S]*?)<figcaption>(.*?)<\/figcaption><\/figure>/g)].map(([,body,name])=>({id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:name.replace(/&#x27;/g,"'"),photo:(body.match(/<img[^>]*src="([^"]+)"/)||[])[1]||null,x:50,y:35}));
const collections=[];
for(const [id,title,page] of [['album','Photo Album','/photo-album.html'],['vips','Raceway VIPs','/vips.html'],['halloween','Halloween','/halloween.html'],['dia','Día de los Muertos','/dia.html'],['dogs','Dog Days','/dogs.html'],['last','Last Season','/throwbacks.html']]){const matches=[...pages[page].matchAll(/<div class="photos [^"]*">([\s\S]*?)<\/div>/g)];if(matches.length)matches.forEach((m,i)=>{const headings=[...pages[page].slice(0,m.index).matchAll(/<h2[^>]*>(.*?)<\/h2>/g)];collections.push({id:id+'-'+i,title:title+(matches.length>1?' · '+(headings.at(-1)?.[1]||'More photographs')+(i===4?' (continued)':''):''),page,index:i,items:[...m[1].matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)].map((im,j)=>({id:id+'-'+i+'-'+j,src:im[1],x:50,y:50}))});});else collections.push({id,title,page,index:-1,items:[]});}
const seed={people,collections};fs.writeFileSync('manager/seed.json',JSON.stringify(seed,null,2));
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/client',{recursive:true});
for(const n of fs.readdirSync('dist'))if(!['server','client','.openai'].includes(n))fs.cpSync('dist/'+n,'dist/client/'+n,{recursive:true});
for(const n of fs.readdirSync('dist/client'))if(n.endsWith('.html'))fs.unlinkSync('dist/client/'+n);
const text={};for(const n of fs.readdirSync('dist'))if(/\.(css|js|svg|json)$/.test(n))text['/'+n]=fs.readFileSync('dist/'+n,'utf8');
text['/manager.js']=fs.readFileSync('manager/admin.js','utf8');text['/manager.css']=fs.readFileSync('manager/admin.css','utf8');
fs.writeFileSync('dist/server/index.js','const PAGES='+JSON.stringify(pages)+';\nconst SEED='+JSON.stringify(seed)+';\nconst TEXT='+JSON.stringify(text)+';\nconst ADMIN='+JSON.stringify(fs.readFileSync('manager/admin.html','utf8'))+';\n'+fs.readFileSync('worker/manager.js','utf8'));
fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built',people.length,'people and',collections.length,'collections');
