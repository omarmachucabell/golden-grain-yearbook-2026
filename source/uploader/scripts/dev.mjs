import http from 'node:http';import app from '../dist/server/index.js';
const bucket={get:async()=>null};const port=Number(process.argv[process.argv.indexOf('--port')+1])||4173;
http.createServer(async(req,res)=>{try{const r=await app.fetch(new Request('http://localhost:'+port+req.url),{BUCKET:bucket});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))}catch{res.writeHead(500);res.end('Preview unavailable')}}).listen(port,'0.0.0.0');
