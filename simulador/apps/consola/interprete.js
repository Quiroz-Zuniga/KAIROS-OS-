import { analizar } from './analizador.js';
import { validarComando } from './validador.js';
import { ejecutarComando } from './ejecutor.js';
import { traducir as t, CATALOGOS } from '../../js/core/i18n.js';

export async function interpretar(entrada, nucleo, progreso) {
  try {
    const comando = validarComando(analizar(entrada));
    return comando ? await ejecutarComando(comando, nucleo, progreso) : { texto: '' };
  } catch (error) {
    const clave = Object.hasOwn(CATALOGOS.es, error.message) ? error.message : 'error.generico';
    return { texto: t(clave, error.parametros), error: true };
  }
}
