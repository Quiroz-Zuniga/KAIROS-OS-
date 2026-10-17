import { credencialValida } from './credenciales.js';
export const PREGUNTAS_SEGURIDAD = Object.freeze({ mascota: 'seguridad.mascota', escuela: 'seguridad.escuela', ciudad: 'seguridad.ciudad' });
export const normalizarRespuesta = respuesta => respuesta.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
export function validarSeguridad(pregunta, respuesta) {
  if (!Object.hasOwn(PREGUNTAS_SEGURIDAD, pregunta)) return 'seguridad.errorPregunta';
  if (typeof respuesta !== 'string' || normalizarRespuesta(respuesta).length < 3 || respuesta.length > 128) return 'seguridad.errorRespuesta';
  return '';
}
export function recuperacionValida(valor) {
  return valor === undefined || (Object.hasOwn(PREGUNTAS_SEGURIDAD, valor?.pregunta) && credencialValida(valor.credencial));
}
