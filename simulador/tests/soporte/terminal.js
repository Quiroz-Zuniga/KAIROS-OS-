import { crearNucleoTerminal } from '../../js/core/terminal.js';
export function contextoTerminal() {
  let datos = {
    version: 1, estado: 'instalado', usuario: { usuario: 'jorge', nombre: 'Jorge' },
    preferencias: { idioma: 'es', zona: 'America/Tegucigalpa', teclado: 'latinoamericano' },
    disco: { particiones: [{ capacidadGiB: 32, formato: 'UPHFS' }] },
    archivos: [{ ruta: '/', tipo: 'carpeta' }, { ruta: '/sistema', tipo: 'carpeta' }]
  };
  const repositorio = {
    borrarInstalacion: async (revision, fecha) => {
      if (!datos || (datos.revision ?? 0) !== revision || datos.fecha !== fecha) throw new Error('terminal.errorConflicto');
      datos = null;
    },
    cargar: async () => structuredClone(datos),
    actualizar: async (nuevo, revision) => {
      if ((datos.revision ?? 0) !== revision) throw new Error('terminal.errorConflicto');
      datos = structuredClone(nuevo);
    }
  };
  return { repositorio, nucleo: crearNucleoTerminal(datos, repositorio, { usuario: 'jorge', nombre: 'Jorge' }, () => new Date('2026-10-08T18:00:00Z')) };
}
