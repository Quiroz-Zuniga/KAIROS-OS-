import { traducir as t } from '../core/i18n.js';
import { IDIOMAS, TECLADOS, ZONAS, EDICIONES, ARQUITECTURAS } from '../core/configuracion.js';
import { licenciaValida } from '../core/licencias.js';
import { validarSeguridad } from '../core/preguntas-seguridad.js';
import { usuarioValido } from '../core/nombres-usuario.js';
import { validarParticiones, objetivo } from './particiones.js';
export { IDIOMAS, TECLADOS, ZONAS } from '../core/configuracion.js';
export const PASOS = Object.freeze(['bienvenida', 'idioma', 'version', 'teclado', 'particionado', 'formateo', 'usuario', 'contrasena', 'zona', 'resumen']);
export function crearBorrador() {
  return { preguntaSeguridad: 'mascota', respuestaSeguridad: '', licencia: '', edicion: 'Plus', arquitectura: '64', idioma: 'es', teclado: 'latinoamericano', capacidad: '32', particiones: [{ id: 'principal', nombre: 'KAIROS', inicioGiB: 0, capacidadGiB: 32 }], particionSeleccionada: 'principal', siguienteParticion: 1, formato: 'KAIROSFS', confirmarFormato: false, nombre: '', usuario: '', contrasena: '', confirmacion: '', zona: 'America/Tegucigalpa' };
}
export function validarPaso(paso, datos) {
  switch (paso) {
    case 'bienvenida': return '';
    case 'version':
      if (datos.edicion === 'Pro' && !licenciaValida(datos.licencia)) return t('licencia.error');
      return Object.hasOwn(EDICIONES, datos.edicion ?? 'Plus') && Object.hasOwn(ARQUITECTURAS, datos.arquitectura ?? '64') ? '' : t('error.version');
    case 'idioma': return Object.hasOwn(IDIOMAS, datos.idioma) ? '' : t('error.idioma');
    case 'teclado': return Object.hasOwn(TECLADOS, datos.teclado) ? '' : t('error.teclado');
    case 'particionado': {
      if (!/^\d+$/.test(String(datos.capacidad)) || Number(datos.capacidad) < 8 || Number(datos.capacidad) > 64) return t('error.capacidad');
      if (datos.particiones) {
        const error = validarParticiones(datos.particiones);
        if (error) return t(error);
        const seleccionada = objetivo(datos);
        if (!seleccionada || seleccionada.capacidadGiB !== Number(datos.capacidad)) return t('disco.errorDestino');
      }
      return '';
    }
    case 'formateo': return datos.formato === 'KAIROSFS' && datos.confirmarFormato === true ? '' : t('error.formato');
    case 'usuario':
      if (!datos.nombre.trim() || datos.nombre.trim().length > 80) return t('error.nombre');
      return usuarioValido(datos.usuario) ? '' : t('error.usuario');
    case 'contrasena':
      if (datos.contrasena.length < 8 || datos.contrasena.length > 128 || !datos.contrasena.trim()) return t('error.contrasena');
      return datos.contrasena === datos.confirmacion ? '' : t('error.confirmacion');
    case 'zona': return ZONAS.includes(datos.zona) ? '' : t('error.zona');
    case 'resumen': return validarInstalacion(datos);
    default: return t('error.paso');
  }
}
export function validarInstalacion(datos) {
  for (const paso of PASOS.slice(1, -1)) {
    const error = validarPaso(paso, datos);
    if (error) return error;
  }
  return tError(validarSeguridad(datos.preguntaSeguridad, datos.respuestaSeguridad));
}
const tError = clave => clave ? t(clave) : '';
export function avanzar(paso, datos) {
  const error = validarPaso(paso, datos);
  if (error) throw new Error(error);
  const indice = PASOS.indexOf(paso);
  return PASOS[Math.min(indice + 1, PASOS.length - 1)];
}
export function retroceder(paso) {
  return PASOS[Math.max(0, PASOS.indexOf(paso) - 1)];
}
