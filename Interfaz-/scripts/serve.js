import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { readHardware } from './hardware-bridge.js';
const root = path.resolve(process.env.UPHOS_SERVE_DIR || '.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp3':'audio/mpeg','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
http.createServer(async (req,res) => {
    if(new URL(req.url,'http://localhost').pathname === '/api/system-status') {
        const host=req.headers.host||'';
        if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host) || (req.headers.origin && req.headers.origin!==`http://${host}`)) {res.writeHead(403).end();return;}
        if(req.method!=='GET') {res.writeHead(405,{'Allow':'GET'}).end();return;}
        try {const data=await readHardware();res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
        catch {res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'}).end(JSON.stringify({message:'No se pudo iniciar la lectura local. Comprueba que Python 3 esté disponible.'}));}
        return;
    }
    try {
        const file = path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
        if (!file.startsWith(root+path.sep) && file !== root) { res.writeHead(403).end(); return; }
        const target = (await stat(file)).isDirectory() ? path.join(file,'index.html') : file;
        let data = await readFile(target);
        if(path.extname(target)==='.html') data=Buffer.from(data.toString('utf8').replace('</head>','<meta name="uphos-local-bridge" content="/api/system-status"></head>'));
        res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}); res.end(data);
    } catch { res.writeHead(404).end('Archivo no encontrado'); }
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',() => console.log('UPHOS: http://127.0.0.1:'+(process.env.PORT||4173)));
