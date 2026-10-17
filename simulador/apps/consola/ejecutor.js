import { comandos, alias } from './registro-comandos.js';
import { traducir as t } from '../../js/core/i18n.js';
import { presentarAyuda } from './presentacion.js';

export async function ejecutarComando(comando, nucleo, progreso) {
  const resultado = await nucleo.ejecutar(comando.nombre, comando.argumentos, progreso);
  if (resultado.ayuda) {
    const soloLive = ['configurar', 'particionar', 'formatear', 'instalar'];
    const disponible = nombre => resultado.modo === 'live' ? nombre !== 'reinstalar' : !soloLive.includes(nombre);
    const nombre = comando.argumentos[0];
    if (nombre) {
      const canonico = Object.hasOwn(alias, nombre) ? alias[nombre] : nombre;
      if (!Object.hasOwn(comandos, canonico)) throw new Error('consola.desconocido');
      if (!disponible(canonico)) throw new Error(resultado.modo === 'live' ? 'terminal.errorReinstalarLive' : 'live.soloLive');
      return presentarAyuda([{ nombre: canonico, sintaxis: comandos[canonico].sintaxis, descripcion: t(comandos[canonico].descripcion), ejemplo:t('terminal.ejemplo.'+canonico) }], true);
    }
    return presentarAyuda(Object.entries(comandos).filter(([nombre]) => disponible(nombre)).map(([nombre, datos]) => ({ nombre, sintaxis: datos.sintaxis, descripcion: t(datos.descripcion), ejemplo:t('terminal.ejemplo.'+nombre) })));
  }
  return { ...resultado, texto: resultado.clave ? t(resultado.clave, resultado.parametros) : resultado.texto ?? '' };
}
