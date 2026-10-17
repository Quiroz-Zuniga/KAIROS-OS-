import { obtenerUsuarios, encontrarUsuario } from './usuarios.js';
import { traducir as t } from './i18n.js';
export async function consultarSistema(nombre, args, datos, sesion, repositorio) {
  const instalado = () => { if (datos.estado !== 'instalado') throw new Error('terminal.errorReinstalarLive'); };
  switch (nombre) {
    case 'usuarios': return { texto: obtenerUsuarios(datos).map(u => `${u.usuario} · ${u.nombre}`).join('\n') };
    case 'cambiarusuario':
      instalado();
      if (args.length && !encontrarUsuario(datos,args[0])) throw new Error('cuenta.errorNoExiste');
      return { clave: 'cuenta.cambiar', accion: 'cambiarusuario', usuario: args.length ? encontrarUsuario(datos,args[0]).usuario : '' };
    case 'cerrarsesion': instalado(); return { clave: 'cuenta.cambiar', accion: 'cerrarsesion' };
    case 'version': return { clave: 'herramientas.version', parametros: { edicion: datos.edicion || 'Plus', arquitectura: datos.arquitectura || '64', version: '0.2.0' } };
    case 'preferencias': return { texto: Object.entries(datos.preferencias).map(([clave, valor]) => `${t('preferencia.' + clave)}: ${valor}`).join('\n') };
    case 'permisos': return { clave: 'herramientas.permisos', parametros: { usuario: sesion.usuario } };
    case 'comprobar': {
      const rutas = new Set(datos.archivos.map(n => n.ruta));
      const bien = rutas.size === datos.archivos.length && rutas.has('/') && datos.archivos.every(n => n.ruta === '/' || rutas.has(n.ruta.slice(0,n.ruta.lastIndexOf('/')) || '/'));
      return { clave: bien ? 'herramientas.correcto' : 'herramientas.inconsistente' };
    }
    case 'historial': return { historial: true };
    case 'almacen': return repositorio.info ? { texto: (await repositorio.info()).archivos } : { clave: 'herramientas.almacenBrowser' };
    default: return null;
  }
}
