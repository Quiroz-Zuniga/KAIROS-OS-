import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { interpretar } from '../apps/consola/interprete.js';
import { comandos, alias, LIMITE_COMANDOS } from '../apps/consola/registro-comandos.js';
import { analizar } from '../apps/consola/analizador.js';
import { crearHistorial } from '../apps/consola/historial.js';
import { crearNucleoTerminal } from '../js/core/terminal.js';
import { seleccionarIdioma } from '../js/core/i18n.js';
import { contextoTerminal } from './soporte/terminal.js';

beforeEach(() => seleccionarIdioma('es'));
test('El catálogo incluye 120 comandos principales y alias Windows válidos', () => {
  assert.equal(Object.keys(comandos).length, 120);
  assert.ok(Object.keys(comandos).length <= LIMITE_COMANDOS);
});
test('Ayuda, alias, entradas vacías y comandos desconocidos', async () => {
  const { nucleo } = contextoTerminal();
  const resultado = await interpretar('ayuda', nucleo);
  for (const nombre of Object.keys(comandos).filter(nombre => !['configurar', 'particionar', 'formatear', 'instalar'].includes(nombre))) assert.ok(resultado.texto.includes('| ' + nombre.padEnd(18)));
  assert.ok(!resultado.texto.includes('| particionar '));
  assert.match((await interpretar('help leer', nucleo)).texto, /leer ruta/);
  for (const nombre of ['powershell', 'constructor', 'toString', 'ayuda;', 'eval']) assert.equal((await interpretar(nombre, nucleo)).error, true);
  assert.equal((await interpretar('  ', nucleo)).texto, '');
  assert.equal((await interpretar('limpiar', nucleo)).limpiar, true);
  assert.match((await interpretar('acerca', nucleo)).texto, /UPHOS instalado/);
});
test('El analizador conserva comillas, argumentos vacíos y escapes sin ejecutar contenido', () => {
  assert.deepEqual(analizar('escribir "mi archivo" "hola mundo"').argumentos, ['mi archivo', 'hola mundo']);
  assert.deepEqual(analizar("escribir 'mi archivo' ''").argumentos, ['mi archivo', '']);
  assert.deepEqual(analizar(String.raw`leer mi\ archivo`).argumentos, ['mi archivo']);
  assert.deepEqual(analizar(String.raw`escribir a "hola \"mundo\""`).argumentos, ['a', 'hola "mundo"']);
  for (const entrada of ['leer "sin cerrar', "leer 'sin cerrar"]) assert.throws(() => analizar(entrada));
});
test('Crear, escribir, leer, copiar, mover, listar y borrar persisten archivos virtuales', async () => {
  const { nucleo, repositorio } = contextoTerminal();
  assert.equal(nucleo.prompt(), String.raw`jorge@uphos U:\home\jorge>`);
  for (const comando of ['crear carpeta "mis documentos"', 'entrar "mis documentos"', 'crear archivo "nota.txt"', 'escribir nota.txt "Hola UPHOS"', 'copiar nota.txt copia.txt', 'mover copia.txt final.txt']) {
    assert.equal((await interpretar(comando, nucleo)).error, undefined, comando);
  }
  assert.equal((await interpretar('leer nota.txt', nucleo)).texto, 'Hola UPHOS');
  const listado = (await interpretar('archivos', nucleo)).texto;
  assert.match(listado, /final.txt/);
  assert.ok(!listado.includes('copia.txt'));
  assert.equal((await interpretar('escribir nota.txt ""', nucleo)).error, undefined);
  assert.equal((await interpretar('leer nota.txt', nucleo)).texto, '');
  assert.equal((await interpretar('borrar final.txt', nucleo)).error, undefined);
  assert.equal((await interpretar('leer final.txt', nucleo)).error, true);
  const recargado = crearNucleoTerminal(await repositorio.cargar(), repositorio, { usuario: 'jorge', nombre: 'Jorge' });
  assert.equal((await interpretar('leer "/home/jorge/mis documentos/nota.txt"', recargado)).texto, '');
  assert.equal((await interpretar('leer "/home/jorge/mis documentos/final.txt"', recargado)).error, true);
});
test('Rutas relativas, padre y directorio anterior conservan el estado', async () => {
  const { nucleo } = contextoTerminal();
  await interpretar('crear carpeta uno', nucleo);
  await interpretar('crear carpeta uno/dos', nucleo);
  await interpretar('entrar ./uno//dos', nucleo);
  assert.equal(nucleo.rutaActual(), '/home/jorge/uno/dos');
  await interpretar('volver', nucleo);
  assert.equal(nucleo.rutaActual(), '/home/jorge/uno');
  await interpretar('volver -', nucleo);
  assert.equal(nucleo.rutaActual(), '/home/jorge/uno/dos');
  await interpretar('entrar', nucleo);
  assert.equal(nucleo.rutaActual(), '/home/jorge');
  await interpretar('entrar /', nucleo);
  await interpretar('volver', nucleo);
  assert.equal(nucleo.rutaActual(), '/');
});
test('Argumentos incorrectos, rutas inexistentes y errores de sintaxis no escriben datos', async () => {
  const { nucleo, repositorio } = contextoTerminal();
  const antes = await repositorio.cargar();
  for (const comando of ['limpiar extra', 'crear', 'crear disco prueba', 'leer', 'escribir a', 'copiar a', 'mover a b c', 'volver otro', 'borrar -f archivo', 'entrar inexistente', 'leer inexistente', 'archivos inexistente', 'crear archivo inexistente/a', 'crear archivo ""', 'leer ""', 'crear archivo /sistema/nuevo', 'crear carpeta ../../otra', 'escribir a "sin cerrar']) {
    assert.equal((await interpretar(comando, nucleo)).error, true, comando);
  }
  assert.deepEqual(await repositorio.cargar(), antes);
});
test('Carpetas no vacías requieren borrado recursivo y el directorio actual está protegido', async () => {
  const { nucleo } = contextoTerminal();
  await interpretar('crear carpeta carpeta', nucleo);
  await interpretar('crear archivo carpeta/a', nucleo);
  assert.equal((await interpretar('borrar carpeta', nucleo)).error, true);
  assert.equal((await interpretar('copiar carpeta otra', nucleo)).error, true);
  await interpretar('entrar carpeta', nucleo);
  assert.equal((await interpretar('borrar -recursivo .', nucleo)).error, true);
  await interpretar('volver', nucleo);
  assert.equal((await interpretar('borrar -recursivo carpeta', nucleo)).error, undefined);
  assert.equal((await interpretar('entrar carpeta', nucleo)).error, true);
});
test('Mover una carpeta actualiza rutas y no permite sobrescritura ni ciclos', async () => {
  const { nucleo } = contextoTerminal();
  await interpretar('crear carpeta original', nucleo);
  await interpretar('crear archivo original/a', nucleo);
  await interpretar('entrar original', nucleo);
  assert.equal((await interpretar('mover . ../renombrada', nucleo)).error, undefined);
  assert.equal(nucleo.rutaActual(), '/home/jorge/renombrada');
  assert.equal((await interpretar('mover . subcarpeta', nucleo)).error, true);
  await interpretar('crear archivo b', nucleo);
  assert.equal((await interpretar('copiar a b', nucleo)).error, true);
  assert.equal((await interpretar('escribir . "texto"', nucleo)).error, true);
});
test('Un fallo de persistencia conserva archivos y ruta; los conflictos no sobrescriben', async () => {
  const { nucleo, repositorio } = contextoTerminal();
  const otraSesion = crearNucleoTerminal(await repositorio.cargar(), repositorio, { usuario: 'jorge', nombre: 'Jorge' });
  await interpretar('crear archivo primero', nucleo);
  assert.equal((await interpretar('crear archivo segundo', otraSesion)).error, true);
  assert.ok(!(await repositorio.cargar()).archivos.some(nodo => nodo.ruta.endsWith('/segundo')));
  const sinGuardar = crearNucleoTerminal(await repositorio.cargar(), { actualizar: async () => { throw new Error('terminal.errorGuardar'); } }, { usuario: 'jorge', nombre: 'Jorge' });
  assert.equal((await interpretar('crear archivo fallido', sinGuardar)).error, true);
  assert.equal((await interpretar('leer fallido', sinGuardar)).error, true);
});
test('Usuario, usuarios, procesos, memoria, preferencias, version y estado son consultables', async () => {
  const { nucleo } = contextoTerminal();
  for (const comando of ['usuario', 'usuarios', 'procesos', 'memoria', 'preferencias', 'version', 'estado']) {
    const resultado = await interpretar(comando, nucleo);
    assert.equal(resultado.error, undefined, comando);
    assert.ok(resultado.texto.length, comando);
    assert.ok(!resultado.texto.includes('credencial'));
  }
  assert.match((await interpretar('memoria', nucleo)).texto, /MiB de 128 MiB/);
  assert.match((await interpretar('procesos', nucleo)).texto, /Núcleo UPHOS/);
});
test('Reiniciar y apagar terminan la sesión sin borrar archivos', async () => {
  for (const comando of ['reiniciar', 'apagar']) {
    const { nucleo, repositorio } = contextoTerminal();
    await interpretar('crear archivo conservar', nucleo);
    assert.equal((await interpretar(comando, nucleo)).accion, comando);
    assert.equal((await interpretar('usuario', nucleo)).error, true);
    assert.ok((await repositorio.cargar()).archivos.some(nodo => nodo.ruta.endsWith('/conservar')));
  }
});
test('El historial conserva órdenes, recorre extremos y restaura el borrador', () => {
  const historial = crearHistorial();
  assert.equal(historial.anterior('borrador'), 'borrador');
  historial.agregar('ayuda');
  historial.agregar('archivos');
  assert.equal(historial.anterior('leer nota'), 'archivos');
  assert.equal(historial.anterior(''), 'ayuda');
  assert.equal(historial.anterior(''), 'ayuda');
  assert.equal(historial.siguiente(), 'archivos');
  assert.equal(historial.siguiente(), 'leer nota');
  assert.equal(historial.siguiente(), 'leer nota');
  assert.deepEqual(historial.listar(), ['ayuda', 'archivos']);
});
