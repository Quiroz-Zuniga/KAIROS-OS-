import { crearNucleoTerminal } from './terminal.js';

// Pestañas: rutas independientes, almacenamiento compartido y escrituras en orden.
export function crearGrupoTerminal(instalacion, repositorio, sesion) {
  let cola = Promise.resolve(), finalizado = false;
  return {
    crear() {
      const nucleo = crearNucleoTerminal(instalacion, repositorio, sesion);
      let cerrada = false;
      return {
        prompt: () => nucleo.prompt(),
        rutaActual: () => nucleo.rutaActual(),
        temaActual: () => nucleo.temaActual(),
        tecladoActual: () => nucleo.tecladoActual(),
        cerrar: () => { cerrada = true; },
        ejecutar(nombre, argumentos) {
          const tarea = cola.then(async () => {
            if (cerrada || finalizado) throw new Error('terminal.errorApagado');
            if (!['reiniciar', 'apagar'].includes(nombre)) nucleo.sincronizar(await repositorio.cargar());
            const resultado = await nucleo.ejecutar(nombre, argumentos);
            if (resultado.accion) finalizado = true;
            return resultado;
          });
          cola = tarea.catch(() => {});
          return tarea;
        }
      };
    }
  };
}
