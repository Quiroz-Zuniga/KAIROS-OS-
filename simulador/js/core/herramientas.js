import { resolverRuta } from '../services/archivos.js';
import { traducir as t } from './i18n.js';
export const rutaVisible = ruta => 'U:' + (ruta === '/' ? '\\' : ruta.replaceAll('/', '\\'));
export function consultarArchivo(nombre, args, servicio, ruta) {
  if (nombre === 'detalles') {
    const nodo = servicio.nodo(ruta(args[0]));
    return { clave: 'herramientas.detalles', parametros: { ruta: rutaVisible(nodo.ruta), tipo: t(nodo.tipo === 'carpeta' ? 'herramientas.carpeta' : 'herramientas.archivo'), bytes: new TextEncoder().encode(nodo.contenido ?? '').length, elementos: nodo.tipo === 'carpeta' ? servicio.descendientes(nodo.ruta).length - 1 : 0 } };
  }
  if (nombre === 'contar') {
    const contenido = servicio.leer(ruta(args[0]));
    return { clave: 'herramientas.contar', parametros: { lineas: contenido ? contenido.split('\n').length : 0, palabras: contenido.trim() ? contenido.trim().split(/\s+/).length : 0, bytes: new TextEncoder().encode(contenido).length } };
  }
  if (nombre === 'filtrar') return { texto: servicio.leer(ruta(args[1])).split('\n').filter(linea => linea.includes(args[0])).join('\n') };
  if (nombre === 'comparar') return { clave: servicio.leer(ruta(args[0])) === servicio.leer(ruta(args[1])) ? 'herramientas.iguales' : 'herramientas.diferentes' };
  return null;
}
export function crearRespaldo(servicio, hogar, destino) {
  const nodos = servicio.descendientes(hogar).filter(n => n.ruta !== hogar && n.ruta !== destino).map(n => ({ ...n, ruta: n.ruta.slice(hogar.length + 1) }));
  const contenido = JSON.stringify({ kairos: 1, archivos: nodos });
  if (new TextEncoder().encode(contenido).length > 1024 * 1024) throw new Error('terminal.errorTamano');
  servicio.crear('archivo', destino);
  servicio.escribir(destino, contenido);
}
export function restaurarRespaldo(servicio, origen, destino) {
  let respaldo;
  try { respaldo = JSON.parse(servicio.leer(origen)); } catch { throw new Error('herramientas.errorRespaldo'); }
  if (respaldo.kairos !== 1 || !Array.isArray(respaldo.archivos) || respaldo.archivos.length > 10000) throw new Error('herramientas.errorRespaldo');
  servicio.crear('carpeta', destino);
  const nombres = new Set();
  for (const n of [...respaldo.archivos].sort((a,b) => String(a.ruta).length-String(b.ruta).length)) {
    if (typeof n.ruta !== 'string' || !n.ruta || n.ruta.startsWith('/') || n.ruta.includes('\\') || n.ruta.split('/').some(p => p === '..' || p === '.' || !p) || nombres.has(n.ruta)) throw new Error('herramientas.errorRespaldo');
    resolverRuta(n.ruta, destino);
    nombres.add(n.ruta);
    servicio.crear(n.tipo, destino + '/' + n.ruta);
    if (n.tipo === 'archivo') { if (typeof n.contenido !== 'string') throw new Error('herramientas.errorRespaldo'); servicio.escribir(destino + '/' + n.ruta, n.contenido); }
  }
}
