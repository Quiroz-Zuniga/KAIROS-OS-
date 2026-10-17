import { crearGrupoTerminal } from './sesiones-terminal.js';
import { crearBorrador, validarPaso } from '../installer/modelo.js';
import { crearParticion, editarParticion, eliminarParticion, seleccionarParticion, objetivo } from '../installer/particiones.js';
import { instalar } from '../installer/instalar.js';
import { traducir as t, seleccionarIdioma } from './i18n.js';
import { crearRed } from './red.js';
import { validarSeguridad, PREGUNTAS_SEGURIDAD } from './preguntas-seguridad.js';

// El Live usa un repositorio en memoria; únicamente instalar publica en IndexedDB.
export function crearLive(repositorioDestino, opciones = {}) {
  const motorInstalacion = opciones.instalar ?? instalar;
  let estado = {
    version: 1, estado: 'live', fecha: new Date().toISOString(), revision: 0, red:crearRed(),
    usuario: { usuario: 'live', nombre: 'KAIROS Live' },
    preferencias: { idioma: 'es', teclado: 'latinoamericano', zona: 'America/Tegucigalpa' },
    disco: { capacidadGiB: 64, particiones: [{ capacidadGiB: 32, nombre: 'Live', formato: 'KAIROSFS' }] },
    archivos: [{ ruta: '/', tipo: 'carpeta' }, { ruta: '/sistema', tipo: 'carpeta' }]
  };
  let borrador = crearBorrador(), ocupado = false, finalizado = false;
  const temporal = {
    cargar: async () => structuredClone(estado),
    actualizar: async (datos, revision, fecha) => {
      if (revision !== estado.revision || fecha !== estado.fecha) throw new Error('terminal.errorConflicto');
      estado = structuredClone(datos);
    }
  };
  const grupo = crearGrupoTerminal(estado, temporal, estado.usuario);
  const respuesta = clave => ({ clave });
  const validar = error => {
    if (error) { const fallo = new Error('live.errorValidacion'); fallo.parametros = { detalle: error }; throw fallo; }
  };
  const resumen = () => ({ texto: t('live.resumen', {
    edicion: borrador.edicion, arquitectura: borrador.arquitectura, usuario: borrador.usuario || '—', nombre: borrador.nombre || '—', idioma: borrador.idioma,
    teclado: borrador.teclado, zona: borrador.zona, destino: objetivo(borrador)?.nombre || '—',
    capacidad: borrador.capacidad || '—', formato: t(borrador.confirmarFormato ? 'live.si' : 'live.no'),
    clave: t(borrador.contrasena ? 'live.si' : 'live.no')
  }) });
  return {
    crear() {
      const nucleo = grupo.crear();
      let cerrada = false;
      return {
        prompt: nucleo.prompt, rutaActual: nucleo.rutaActual, temaActual: nucleo.temaActual,
        tecladoActual: () => borrador.teclado,
        cerrar() { cerrada = true; nucleo.cerrar(); },
        async ejecutar(nombre, args = [], progreso = () => {}) {
          if (cerrada || finalizado) throw new Error('terminal.errorApagado');
          if (ocupado) throw new Error('terminal.errorOcupado');
          if (!['configurar', 'particionar', 'formatear', 'instalar'].includes(nombre)) {
            const resultado = await nucleo.ejecutar(nombre, args);
            if (nombre === 'teclado' && args.length === 1) borrador.teclado = args[0];
            if (resultado.accion) finalizado = true;
            return resultado;
          }
          ocupado = true;
          try {
            if (nombre === 'configurar') {
              if (!args.length) return resumen();
              const campo = args[0];
              const propiedad = campo === 'pregunta' ? 'preguntaSeguridad' : campo === 'respuesta' ? 'respuestaSeguridad' : campo;
              const pasos = { pregunta: 'seguridad', respuesta: 'seguridad', idioma: 'idioma', teclado: 'teclado', zona: 'zona', usuario: 'usuario', nombre: 'usuario', edicion: 'version', arquitectura: 'version', licencia: 'version', contrasena: 'contrasena' };
              if (!Object.hasOwn(pasos, campo)) throw new Error('live.errorCampo');
              if (['contrasena','respuesta'].includes(campo) && args.length === 1) return { secreto: true, ...respuesta(campo === 'respuesta' ? 'seguridad.pedirRespuesta' : 'live.pedirClave'), ordenSecreta: { nombre: 'configurar', argumentos: [campo] } };
              if (args.length !== 2) throw new Error('live.errorConfigurar');
              const copia = structuredClone(borrador);
              copia[propiedad] = args[1];
              if (campo === 'contrasena') copia.confirmacion = args[1];
              const prueba = { ...copia, nombre: campo === 'nombre' ? copia.nombre : copia.nombre || 'Live', usuario: campo === 'usuario' ? copia.usuario : copia.usuario || 'live' };
              const error = campo === 'pregunta' ? (Object.hasOwn(PREGUNTAS_SEGURIDAD, copia.preguntaSeguridad) ? '' : t('seguridad.errorPregunta')) : campo === 'respuesta' ? (validarSeguridad(copia.preguntaSeguridad, copia.respuestaSeguridad) ? t(validarSeguridad(copia.preguntaSeguridad, copia.respuestaSeguridad)) : '') : pasos[campo] === 'version' && campo !== 'licencia' ? (['Plus','Pro'].includes(copia.edicion) && ['32','64'].includes(copia.arquitectura) ? '' : t('error.version')) : validarPaso(pasos[campo], prueba);
              validar(error);
              borrador = copia;
              if (campo === 'teclado') estado.preferencias.teclado = copia.teclado;
              if (campo === 'idioma') seleccionarIdioma(copia.idioma);
              return respuesta('live.configurado');
            }
            if (nombre === 'particionar') {
              if (!args.length) return { texto: borrador.particiones.map(p => `${p.id} · ${p.nombre} · ${p.inicioGiB} GiB → ${p.inicioGiB + p.capacidadGiB} GiB${p.id === borrador.particionSeleccionada ? ' *' : ''}`).join('\n') || t('terminal.vacio') };
              const copia = structuredClone(borrador);
              const [accion, ...valores] = args;
              const entero = valor => /^\d+$/.test(valor ?? '') ? Number(valor) : NaN;
              if (accion === 'crear' && valores.length === 3) crearParticion(copia, entero(valores[0]), entero(valores[1]), valores[2]);
              else if (accion === 'editar' && valores.length === 3) editarParticion(copia, valores[0], entero(valores[1]), valores[2]);
              else if (accion === 'borrar' && valores.length === 2 && valores[1] === 'confirmar') eliminarParticion(copia, valores[0]);
              else if (accion === 'usar' && valores.length === 1) seleccionarParticion(copia, valores[0]);
              else throw new Error('live.errorParticionar');
              borrador = copia;
              return respuesta('live.particionado');
            }
            if (nombre === 'formatear') {
              if (args[0] !== 'confirmar') throw new Error('live.errorFormato');
              const error = validarPaso('particionado', borrador);
              validar(error);
              borrador.confirmarFormato = true;
              return respuesta('live.formateado');
            }
            if (!args.length) return resumen();
            if (args[0] !== 'confirmar') throw new Error('live.errorInstalar');
            if (await repositorioDestino.cargar()) throw new Error('live.errorExistente');
            try { await motorInstalacion(borrador, repositorioDestino, progreso); }
            catch (error) {
              // El instalador comparte las validaciones traducidas de los formularios.
              validar(error.message);
            }
            borrador.contrasena = ''; borrador.confirmacion = ''; borrador.respuestaSeguridad = '';
            finalizado = true;
            return { ...respuesta('live.instalado'), accion: 'reiniciar' };
          } finally { ocupado = false; }
        }
      };
    }
  };
}
