import { comandos, alias, LIMITE_COMANDOS } from './registro-comandos.js';

export function validarComando(analisis) {
  if (Object.keys(comandos).length > LIMITE_COMANDOS) throw new Error('consola.limite');
  if (!analisis.nombre) return null;
  const nombre = Object.hasOwn(alias, analisis.nombre) ? alias[analisis.nombre] : analisis.nombre;
  if (!Object.hasOwn(comandos, nombre)) throw new Error('consola.desconocido');
  const comando = comandos[nombre];
  const args = analisis.argumentos;
  if (args.length < comando.min || args.length > comando.max) {
    const error = new Error('terminal.errorArgumentos');
    error.parametros = { sintaxis: comando.sintaxis };
    throw error;
  }
  if (nombre === 'crear' && !['archivo', 'carpeta'].includes(args[0])) throw new Error('terminal.errorTipo');
  if (nombre === 'borrar' && args.length === 2 && args[0] !== '-recursivo') throw new Error('terminal.errorRecursivo');
  if (nombre === 'volver' && args.length && args[0] !== '-') throw new Error('terminal.errorVolver');
  if (['entrar', 'archivos', 'leer', 'escribir', 'copiar', 'mover', 'borrar'].includes(nombre) && args.some((arg, indice) => !(nombre === 'escribir' && indice === 1) && !arg)) throw new Error('terminal.errorRuta');
  return { nombre, argumentos: args };
}
