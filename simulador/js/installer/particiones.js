export const CAPACIDAD_DISCO = 64;
export function objetivo(datos) { return datos.particiones?.find(particion => particion.id === datos.particionSeleccionada); }
export function espaciosLibres(particiones) {
  const libres = [];
  let inicio = 0;
  for (const particion of [...particiones].sort((a, b) => a.inicioGiB - b.inicioGiB)) {
    if (particion.inicioGiB > inicio) libres.push({ inicioGiB: inicio, capacidadGiB: particion.inicioGiB - inicio });
    inicio = particion.inicioGiB + particion.capacidadGiB;
  }
  if (inicio < CAPACIDAD_DISCO) libres.push({ inicioGiB: inicio, capacidadGiB: CAPACIDAD_DISCO - inicio });
  return libres;
}
export function validarParticiones(particiones) {
  if (!Array.isArray(particiones) || particiones.length > 16 || particiones.some(particion => !particion)) return 'disco.errorPlan';
  const ids = new Set();
  let final = 0;
  for (const particion of [...particiones].sort((a, b) => a.inicioGiB - b.inicioGiB)) {
    if (!particion || typeof particion.id !== 'string' || ids.has(particion.id) ||
      typeof particion.nombre !== 'string' || !particion.nombre.trim() || particion.nombre.length > 40 ||
      !Number.isInteger(particion.inicioGiB) || !Number.isInteger(particion.capacidadGiB) ||
      particion.inicioGiB < final || particion.capacidadGiB < 1 || particion.inicioGiB + particion.capacidadGiB > CAPACIDAD_DISCO) return 'disco.errorPlan';
    ids.add(particion.id);
    final = particion.inicioGiB + particion.capacidadGiB;
  }
  return '';
}
function publicar(datos, particiones) {
  const error = validarParticiones(particiones);
  if (error) throw new Error(error);
  datos.particiones = particiones;
  const seleccionada = objetivo(datos);
  datos.capacidad = seleccionada ? String(seleccionada.capacidadGiB) : '';
  datos.confirmarFormato = false;
}
export function crearParticion(datos, inicioGiB, capacidadGiB, nombre) {
  const id = 'particion-' + (datos.siguienteParticion ?? 1);
  const nueva = { id, inicioGiB, capacidadGiB, nombre: nombre.trim() };
  publicar(datos, [...datos.particiones, nueva]);
  datos.siguienteParticion = (datos.siguienteParticion ?? 1) + 1;
  // Una nueva partición apta pasa a ser el destino cuando no había uno.
  if (!objetivo(datos) && capacidadGiB >= 8) seleccionarParticion(datos, id);
  return id;
}
export function editarParticion(datos, id, capacidadGiB, nombre) {
  if (!datos.particiones.some(particion => particion.id === id)) throw new Error('disco.errorSeleccion');
  publicar(datos, datos.particiones.map(particion => particion.id === id ? { ...particion, capacidadGiB, nombre: nombre.trim() } : { ...particion }));
}
export function eliminarParticion(datos, id) {
  if (!datos.particiones.some(particion => particion.id === id)) throw new Error('disco.errorSeleccion');
  if (datos.particionSeleccionada === id) datos.particionSeleccionada = '';
  publicar(datos, datos.particiones.filter(particion => particion.id !== id));
}
export function seleccionarParticion(datos, id) {
  const particion = datos.particiones.find(particion => particion.id === id);
  if (!particion || particion.capacidadGiB < 8) throw new Error('disco.errorDestino');
  datos.particionSeleccionada = id;
  datos.capacidad = String(particion.capacidadGiB);
  datos.confirmarFormato = false;
}
