import { traducir } from '../core/i18n.js';
export function crearRepositorioLocal(api) {
  const llamar = async (nombre,...args)=>{
    const resultado = await api[nombre](...args);
    if (resultado.error) throw new Error(['cargar','guardar','reservarIP'].includes(nombre) ? traducir(resultado.error) : resultado.error);
    return resultado.datos;
  };
  return Object.fromEntries(['reservarIP','cargar','guardar','actualizar','borrarInstalacion','info'].map(nombre=>[nombre,(...args)=>llamar(nombre,...args)]));
}
