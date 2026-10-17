import es from '../../assets/locales/es.js';
import en from '../../assets/locales/en.js';

export const IDIOMA_PREDETERMINADO = 'es';
export const CATALOGOS = Object.freeze({ es, en });
let idiomaActual = IDIOMA_PREDETERMINADO;
// Compatibilidad con instalaciones anteriores; no modifica sus datos guardados.
export function normalizarIdioma(idioma) {
  if (idioma === 'es-HN') return 'es';
  return Object.hasOwn(CATALOGOS, idioma) ? idioma : IDIOMA_PREDETERMINADO;
}
export function seleccionarIdioma(idioma) {
  idiomaActual = normalizarIdioma(idioma);
  return idiomaActual;
}
export function obtenerIdioma() { return idiomaActual; }
// Devuelve texto, nunca HTML. Quien lo inserta en HTML debe escaparlo.
export function traducir(clave, parametros = {}, idioma = idiomaActual) {
  const catalogo = CATALOGOS[normalizarIdioma(idioma)];
  const plantilla = Object.hasOwn(catalogo, clave) ? catalogo[clave] : Object.hasOwn(es, clave) ? es[clave] : `[${clave}]`;
  return plantilla.replace(/\{(\w+)\}/g, (original, nombre) => Object.hasOwn(parametros, nombre) ? String(parametros[nombre]) : original);
}
