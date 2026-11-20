import fs from 'node:fs';
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const HTML='+JSON.stringify(fs.readFileSync('worker/page.html','utf8'))+';\n'+fs.readFileSync('worker/index.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
