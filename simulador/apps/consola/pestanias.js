import { crearHistorial } from './historial.js';

export function crearPestanias(crearNucleo) {
  const pestañas = [];
  let contador = 0, actual;
  return {
    abrir() {
      const pestaña = { id: ++contador, nucleo: crearNucleo(), historial: crearHistorial(), salida: '', resaltados: [], entrada: '', scroll: 0, ocupado: false };
      pestañas.push(pestaña);
      actual = pestaña;
      return pestaña;
    },
    seleccionar(id) { const pestaña = pestañas.find(item => item.id === id); if (pestaña) actual = pestaña; return actual; },
    cerrar(id) {
      const indice = pestañas.findIndex(item => item.id === id);
      if (indice < 0 || pestañas.length === 1 || pestañas[indice].ocupado) return false;
      const [pestaña] = pestañas.splice(indice, 1);
      pestaña.nucleo.cerrar();
      if (actual === pestaña) actual = pestañas[Math.min(indice, pestañas.length - 1)];
      return true;
    },
    recorrer(direccion) {
      const indice = pestañas.indexOf(actual);
      actual = pestañas[(indice + direccion + pestañas.length) % pestañas.length];
      return actual;
    },
    actual: () => actual,
    listar: () => [...pestañas]
  };
}
