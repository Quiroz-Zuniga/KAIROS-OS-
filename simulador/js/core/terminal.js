import { prepararArchivos, crearServicioArchivos, resolverRuta } from '../services/archivos.js';
import { obtenerIdioma, seleccionarIdioma, traducir } from './i18n.js';
import { obtenerUsuarios, modificarCuenta, esAdministrador } from './usuarios.js';
import { rutaVisible, consultarArchivo, crearRespaldo, restaurarRespaldo } from './herramientas.js';
import { consultarSistema } from './comandos-sistema.js';
import { COMANDOS_ARCHIVOS, ejecutarArchivo } from './comandos-archivos.js';
import { COMANDOS_RED, ejecutarRed, crearRed } from './red.js';
import { COMANDOS_CONFIGURACION, ejecutarConfiguracion } from './comandos-configuracion.js';

// El núcleo es el único punto de entrada a las operaciones virtuales de consola.
export function crearNucleoTerminal(instalacion, repositorio, sesion, ahora = () => new Date()) {
  let datos = structuredClone(instalacion);
  datos.archivos = prepararArchivos(datos.archivos, sesion.usuario);
  datos.red ??= crearRed();
  let actual = `/home/${sesion.usuario}`, anterior = actual, activo = true, ocupado = false;
  const cambiar = ruta => { const previo = actual; actual = ruta; anterior = previo; };
  const respuesta = (clave, parametros) => ({ clave, parametros });
  return {
    prompt() { return `${sesion.usuario}@${datos.preferencias.hostname ?? 'kairos'} ${rutaVisible(actual)}>`; },
    rutaActual() { return actual; },
    temaActual() { return datos.preferencias.tema ?? 'oscuro'; },
    tecladoActual() { return datos.preferencias.teclado; },
    sincronizar(estado) {
      if (!estado || estado.fecha !== datos.fecha || !obtenerUsuarios(estado).some(u => u.usuario === sesion.usuario)) throw new Error('terminal.errorConflicto');
      const redAnterior = datos.red;
      datos = structuredClone(estado);
      if (obtenerUsuarios(datos).find(u=>u.usuario===sesion.usuario)?.bloqueado) throw new Error('cuenta.errorBloqueado');
      datos.archivos = prepararArchivos(datos.archivos, sesion.usuario);
      datos.red ??= redAnterior ?? crearRed();
      const existe = ruta => datos.archivos.some(nodo => nodo.ruta === ruta && nodo.tipo === 'carpeta');
      // Otra pestaña puede haber borrado o renombrado la carpeta de trabajo.
      if (!existe(actual)) actual = `/home/${sesion.usuario}`;
      if (!existe(anterior)) anterior = actual;
    },
    async ejecutar(nombre, args = []) {
      if (!activo) throw new Error('terminal.errorApagado');
      if (ocupado) throw new Error('terminal.errorOcupado');
      ocupado = true;
      try {
        const archivos = crearServicioArchivos(datos.archivos, sesion.usuario);
        const ruta = valor => resolverRuta(valor, actual);
        if (COMANDOS_ARCHIVOS.has(nombre) || COMANDOS_RED.has(nombre) || COMANDOS_CONFIGURACION.has(nombre) || nombre === 'guardarEdicion') {
          const copia = structuredClone(datos);
          const servicio = crearServicioArchivos(copia.archivos, sesion.usuario);
          let resultado;
          if (nombre === 'guardarEdicion') {
            if (servicio.leer(ruta(args[0])) !== args[2]) throw new Error('editor.errorConflicto');
            servicio.escribir(ruta(args[0]),args[1]); resultado = {mutacion:true,clave:'editor.guardado'};
          } else resultado = await ejecutarArchivo(nombre,args,{servicio,ruta,actual}) || ejecutarRed(nombre,args,copia) || ejecutarConfiguracion(nombre,args,copia,sesion);
          if (resultado.mutacion) {
            if (servicio.bytes() > copia.disco.particiones[0].capacidadGiB * 1024 ** 3) throw new Error('terminal.errorCuota');
            copia.revision=(datos.revision??0)+1;
            await repositorio.actualizar(copia,datos.revision??0,datos.fecha);
            datos=copia;
            if(resultado.idioma)seleccionarIdioma(resultado.idioma);
          }
          return resultado;
        }
        const consulta = consultarArchivo(nombre, args, archivos, ruta) || await consultarSistema(nombre, args, datos, sesion, repositorio);
        if (consulta) { if (consulta.accion) activo = false; return consulta; }
        switch (nombre) {
          case 'salir': { const destino = ruta('..'); archivos.carpeta(destino); cambiar(destino); return { texto: rutaVisible(actual) }; }
          case 'raiz': cambiar('/'); return { texto: rutaVisible(actual) };
          case 'reinstalar':
            if (datos.estado !== 'instalado') throw new Error('terminal.errorReinstalarLive');
            if (!esAdministrador(datos, sesion.usuario)) throw new Error('cuenta.errorAdministrador');
            if (!args.length) return respuesta('terminal.confirmarReinstalar');
            if (args[0] !== 'confirmar') throw new Error('terminal.errorReinstalar');
            await repositorio.borrarInstalacion(datos.revision ?? 0, datos.fecha);
            activo = false;
            return { ...respuesta('terminal.reinstalando'), accion: 'reinstalar' };
          case 'ruta': return { texto: rutaVisible(actual) };
          case 'arbol': {
            const base = args[0] ? ruta(args[0]) : actual;
            archivos.carpeta(base);
            const nodos = datos.archivos.filter(n => n.ruta === base || n.ruta.startsWith(base === '/' ? '/' : base + '/')).sort((a, b) => a.ruta.localeCompare(b.ruta));
            return { texto: nodos.map(n => n.ruta === base ? base : '  '.repeat(n.ruta.slice(base === '/' ? 1 : base.length + 1).split('/').length) + (n.tipo === 'carpeta' ? '▸ ' : '· ') + n.ruta.split('/').at(-1)).join('\n') };
          }
          case 'buscar': {
            if (!args[0]) throw new Error('terminal.errorRuta');
            const base = args[1] ? ruta(args[1]) : actual;
            archivos.carpeta(base);
            const encontrados = datos.archivos.filter(n => (n.ruta === base || n.ruta.startsWith(base === '/' ? '/' : base + '/')) && n.ruta.split('/').at(-1).toLowerCase().includes(args[0].toLowerCase()));
            return { texto: encontrados.map(n => n.ruta).join('\n') || '' , ...(encontrados.length ? {} : respuesta('terminal.vacio')) };
          }
          case 'discos': return { texto: tDisco(datos, archivos.bytes()) };
          case 'configurar': case 'particionar': case 'formatear': case 'instalar': throw new Error('live.soloLive');
          case 'ayuda': return { ayuda: true, modo: datos.estado };
          case 'limpiar': return { limpiar: true };
          case 'archivos': {
            const todos=args[0]==='-todo';
            if(args.length===2 && !todos)throw new Error('archivo.errorOpcion');
            const listado = archivos.listar(args[todos?1:0] ? ruta(args[todos?1:0]) : actual, todos);
            return listado.length ? { texto: listado.map(nodo => `${nodo.tipo === 'carpeta' ? '/' : '-'} ${nodo.nombre}`).join('\n') } : respuesta('terminal.vacio');
          }
          case 'entrar': { const destino = args[0] ? ruta(args[0]) : `/home/${sesion.usuario}`; archivos.carpeta(destino); cambiar(destino); return { texto: rutaVisible(actual) }; }
          case 'volver': { const destino = args[0] === '-' ? anterior : ruta('..'); archivos.carpeta(destino); cambiar(destino); return { texto: rutaVisible(actual) }; }
          case 'leer': return { texto: archivos.leer(ruta(args[0])) };
          case 'usuario': return respuesta('terminal.usuario', { usuario: sesion.usuario, nombre: obtenerUsuarios(datos).find(u=>u.usuario===sesion.usuario)?.nombre ?? sesion.nombre });
          case 'usuarios': return respuesta('terminal.usuario', { usuario: datos.usuario.usuario, nombre: datos.usuario.nombre });
          case 'procesos': return respuesta('terminal.procesos');
          case 'memoria': return respuesta('terminal.memoria', { usada: (24 + archivos.bytes() / 1024 / 1024).toFixed(2), total: 128 });
          case 'fecha': return { texto: new Intl.DateTimeFormat(obtenerIdioma(), { timeZone: datos.preferencias.zona, dateStyle: 'full' }).format(ahora()) };
          case 'hora': return { texto: new Intl.DateTimeFormat(obtenerIdioma(), { timeZone: datos.preferencias.zona, timeStyle: 'long' }).format(ahora()) };
          case 'estado': return respuesta(datos.estado === 'live' ? 'live.estado' : 'terminal.estado', { usuario: sesion.usuario, ruta: actual });
          case 'idioma':
            if (args.length) {
              if (!['es', 'en'].includes(args[0])) throw new Error('terminal.errorIdioma');
              seleccionarIdioma(args[0]);
            }
            return respuesta('terminal.idiomaActual', { idioma: obtenerIdioma() });
          case 'reiniciar': activo = false; return { ...respuesta('terminal.reinicio'), accion: 'reiniciar' };
          case 'apagar': activo = false; return { ...respuesta('terminal.apagado'), accion: 'apagar' };
        }
        // Las mutaciones trabajan en una copia y solo se publican tras guardar.
        const copia = structuredClone(datos);
        const servicio = crearServicioArchivos(copia.archivos, sesion.usuario);
        let destino, origen;
        switch (nombre) {
          case 'cuenta': {
            if (datos.estado !== 'instalado') throw new Error('terminal.errorReinstalarLive');
            const resultado = await modificarCuenta(copia, sesion.usuario, args);
            if (resultado.secreto) return resultado;
            destino = sesion.usuario;
            break;
          }
          case 'carpetas': destino = ruta(args[0]); servicio.carpetas(destino); break;
          case 'anexar': destino = ruta(args[0]); servicio.escribir(destino, servicio.leer(destino) + args[1]); break;
          case 'vaciar': destino = ruta(args[0]); servicio.escribir(destino, ''); break;
          case 'renombrar':
            if (/[\\/]/.test(args[1]) || args[1] === '.' || args[1] === '..') throw new Error('terminal.errorRuta');
            origen = ruta(args[0]); destino = resolverRuta(args[1], origen.slice(0, origen.lastIndexOf('/')) || '/'); servicio.mover(origen, destino); break;
          case 'copiarcarpeta': origen = ruta(args[0]); destino = ruta(args[1]); servicio.copiarCarpeta(origen, destino); break;
          case 'respaldo': destino = ruta(args[0]); crearRespaldo(servicio, `/home/${sesion.usuario}`, destino); break;
          case 'restaurar': origen = ruta(args[0]); destino = ruta(args[1]); restaurarRespaldo(servicio, origen, destino); break;
          case 'crear': destino = ruta(args[1]); servicio.crear(args[0], destino); break;
          case 'escribir': destino = ruta(args[0]); servicio.escribir(destino, args[1]); break;
          case 'borrar': destino = ruta(args.at(-1)); servicio.borrar(destino, args[0] === '-recursivo', actual); break;
          case 'copiar': origen = ruta(args[0]); destino = ruta(args[1]); servicio.copiar(origen, destino); break;
          case 'mover': origen = ruta(args[0]); destino = ruta(args[1]); servicio.mover(origen, destino); break;
          default: throw new Error('consola.desconocido');
        }
        if (crearServicioArchivos(copia.archivos,sesion.usuario).bytes() > copia.disco.particiones[0].capacidadGiB * 1024 ** 3) throw new Error('terminal.errorCuota');
        copia.revision = (datos.revision ?? 0) + 1;
        await repositorio.actualizar(copia, datos.revision ?? 0, datos.fecha);
        datos = copia;
        if (['mover','renombrar'].includes(nombre)) {
          const actualizarRuta = valor => valor === origen || valor.startsWith(origen + '/') ? destino + valor.slice(origen.length) : valor;
          actual = actualizarRuta(actual);
          anterior = actualizarRuta(anterior);
        }
        return nombre === 'cuenta' ? respuesta('cuenta.actualizada') : respuesta(['crear','escribir','borrar','copiar','mover'].includes(nombre) ? 'terminal.' + nombre : 'herramientas.guardado', { ruta: rutaVisible(destino) });
      } finally { ocupado = false; }
    }
  };
}

function tDisco(datos, bytes) {
  return traducir('terminal.discos', { capacidad: datos.disco.capacidadGiB, usada: (bytes / 1024 / 1024).toFixed(2) }) + '\n' + datos.disco.particiones.map(p => `${p.nombre || p.id || 'KAIROS'} · ${p.capacidadGiB} GiB · ${p.formato || '—'}`).join('\n');
}
