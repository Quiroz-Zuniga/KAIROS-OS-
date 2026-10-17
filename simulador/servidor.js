import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { traducir as t } from './js/core/i18n.js';

const raiz = dirname(fileURLToPath(import.meta.url));
const tipos = { '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const servidor = createServer(async (peticion, respuesta) => {
  if (peticion.method !== 'GET' && peticion.method !== 'HEAD') {
    respuesta.writeHead(405).end();
    return;
  }
  try {
    const ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
    const archivo = resolve(raiz, ruta === '/' ? 'index.html' : `.${ruta}`);
    if (!archivo.startsWith(raiz + sep) || !tipos[extname(archivo)]) {
      respuesta.writeHead(403).end(t('servidor.prohibido'));
      return;
    }
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, { 'Content-Type': tipos[extname(archivo)], 'X-Content-Type-Options': 'nosniff' });
    respuesta.end(peticion.method === 'HEAD' ? undefined : contenido);
  } catch {
    respuesta.writeHead(404).end(t('servidor.ausente'));
  }
});
servidor.on('error', (error) => { console.error(t('servidor.error', { detalle: error.message })); process.exitCode = 1; });
servidor.listen(8080, '127.0.0.1', () => console.log(t('servidor.disponible', { url: 'http://127.0.0.1:8080' })));
