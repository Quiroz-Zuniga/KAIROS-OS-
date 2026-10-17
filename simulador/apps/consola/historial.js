export function crearHistorial() {
  const entradas = [];
  let posicion = 0, borrador = '';
  return {
    agregar(texto) { if (texto.trim()) entradas.push(texto); posicion = entradas.length; borrador = ''; },
    anterior(textoActual) {
      if (posicion === entradas.length) borrador = textoActual;
      posicion = Math.max(0, posicion - 1);
      return entradas[posicion] ?? textoActual;
    },
    siguiente() {
      posicion = Math.min(entradas.length, posicion + 1);
      return posicion === entradas.length ? borrador : entradas[posicion];
    },
    listar() { return [...entradas]; }
  };
}
