import { comandos, alias } from './registro-comandos.js';
import { traducir as t } from '../../js/core/i18n.js';

// Rangos de texto, nunca HTML: el resaltado no interviene en la ejecución.
export function resaltarEntrada(texto) {
  const coincidencia = /^(\s*)(\S+)/.exec(texto);
  if (!coincidencia) return [];
  const nombre = coincidencia[2];
  if (!Object.hasOwn(comandos, nombre) && !Object.hasOwn(alias, nombre)) return [];
  return [{ inicio: coincidencia[1].length, fin: coincidencia[1].length + nombre.length, clase: 'comando-reconocido' }];
}
export function presentarAyuda(filas, individual = false) {
  const anchos=[18,28,32,36], resaltados=[];
  const borde='+'+anchos.map(n=>'-'.repeat(n+2)).join('+')+'+\n';
  const partir=(valor,ancho)=>{
    const lineas=[];let resto=String(valor??'');
    while(resto.length>ancho){let corte=resto.lastIndexOf(' ',ancho);if(corte<1)corte=ancho;lineas.push(resto.slice(0,corte));resto=resto.slice(corte).trimStart();}
    lineas.push(resto);return lineas;
  };
  const linea=celdas=>'| '+celdas.map((v,i)=>v.padEnd(anchos[i])).join(' | ')+' |\n';
  let texto=t('ayuda.instruccion')+'\n\n'+borde+linea(['ayuda.comando','ayuda.uso','ayuda.funcion','ayuda.ejemplo'].map(k=>t(k)))+borde;
  for(const fila of filas){
    const celdas=[fila.nombre,fila.sintaxis,fila.descripcion,fila.ejemplo].map((v,i)=>partir(v,anchos[i]));
    const inicio=texto.length+2;
    for(let j=0;j<Math.max(...celdas.map(c=>c.length));j++)texto+=linea(celdas.map(c=>c[j]??''));
    resaltados.push({inicio,fin:inicio+fila.nombre.length,clase:'comando-ayuda'});texto+=borde;
  }
  return {texto,resaltados};
}
export function agregarSalida(pestaña, texto, resaltados = []) {
  const desplazamiento = pestaña.salida.length;
  pestaña.salida += texto;
  pestaña.resaltados.push(...resaltados.map(rango => ({ ...rango, inicio: rango.inicio + desplazamiento, fin: rango.fin + desplazamiento })));
  const corte = Math.max(0, pestaña.salida.length - 100000);
  pestaña.salida = pestaña.salida.slice(corte);
  pestaña.resaltados = pestaña.resaltados.filter(rango => rango.fin > corte).map(rango => ({ ...rango, inicio: Math.max(0, rango.inicio - corte), fin: rango.fin - corte }));
}
export function limpiarSalida(pestaña) { pestaña.salida = ''; pestaña.resaltados = []; }
export function segmentosTexto(texto, resaltados) {
  const segmentos = [];
  let posicion = 0;
  for (const rango of resaltados) {
    if (rango.inicio > posicion) segmentos.push({ texto: texto.slice(posicion, rango.inicio) });
    segmentos.push({ texto: texto.slice(rango.inicio, rango.fin), clase: rango.clase });
    posicion = rango.fin;
  }
  if (posicion < texto.length) segmentos.push({ texto: texto.slice(posicion) });
  return segmentos;
}
export function dibujarTexto(elemento, texto, resaltados) {
  const fragmento = elemento.ownerDocument.createDocumentFragment();
  for (const segmento of segmentosTexto(texto, resaltados)) {
    const span = elemento.ownerDocument.createElement('span');
    span.textContent = segmento.texto;
    if (segmento.clase) span.className = segmento.clase;
    fragmento.append(span);
  }
  elemento.replaceChildren(fragmento);
}
