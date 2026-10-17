import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
import { crearPestanias } from '../apps/consola/pestanias.js';
import { interpretar } from '../apps/consola/interprete.js';
import { contextoTerminal } from './soporte/terminal.js';
import { seleccionarIdioma, obtenerIdioma } from '../js/core/i18n.js';

beforeEach(() => seleccionarIdioma('es'));
async function preparar() {
  const { repositorio } = contextoTerminal();
  const grupo = crearGrupoTerminal(await repositorio.cargar(), repositorio, { usuario: 'jorge', nombre: 'Jorge' });
  return { repositorio, grupo, pestañas: crearPestanias(() => grupo.crear()) };
}
test('Pestañas conservan directorios, historial y borradores independientes', async () => {
  const { pestañas } = await preparar();
  const primera = pestañas.abrir();
  await interpretar('crear carpeta documentos', primera.nucleo);
  await interpretar('entrar documentos', primera.nucleo);
  primera.historial.agregar('entrar documentos');
  primera.entrada = 'leer nota';
  primera.salida = 'salida de la primera';
  const segunda = pestañas.abrir();
  assert.equal(segunda.nucleo.rutaActual(), '/home/jorge');
  assert.equal(primera.nucleo.rutaActual(), '/home/jorge/documentos');
  assert.deepEqual(segunda.historial.listar(), []);
  pestañas.seleccionar(primera.id);
  assert.equal(pestañas.actual().entrada, 'leer nota');
  assert.equal(pestañas.actual().salida, 'salida de la primera');
  assert.deepEqual(primera.historial.listar(), ['entrar documentos']);
  assert.equal(pestañas.recorrer(1).id, segunda.id);
  assert.equal(pestañas.recorrer(1).id, primera.id);
});
test('Las pestañas comparten archivos y serializan escrituras simultáneas', async () => {
  const { pestañas, repositorio } = await preparar();
  const primera = pestañas.abrir(), segunda = pestañas.abrir();
  const resultados = await Promise.all([
    interpretar('crear archivo uno', primera.nucleo),
    interpretar('crear archivo dos', segunda.nucleo),
    interpretar('escribir uno "compartido"', segunda.nucleo)
  ]);
  assert.ok(resultados.every(resultado => !resultado.error));
  assert.equal((await interpretar('leer uno', primera.nucleo)).texto, 'compartido');
  assert.equal((await interpretar('leer uno', segunda.nucleo)).texto, 'compartido');
  assert.ok((await repositorio.cargar()).archivos.some(nodo => nodo.ruta.endsWith('/dos')));
});
test('Una carpeta borrada desde otra pestaña devuelve la ruta al hogar', async () => {
  const { grupo } = await preparar();
  const primera = grupo.crear(), segunda = grupo.crear();
  await interpretar('crear carpeta temporal', primera);
  await interpretar('entrar temporal', primera);
  await interpretar('borrar temporal', segunda);
  assert.equal((await interpretar('estado', primera)).error, undefined);
  assert.equal(primera.rutaActual(), '/home/jorge');
});
test('Cerrar una pestaña conserva archivos y no cierra la última ni una ocupada', async () => {
  const { pestañas } = await preparar();
  const primera = pestañas.abrir();
  assert.equal(pestañas.cerrar(primera.id), false);
  const segunda = pestañas.abrir();
  await interpretar('crear archivo conservar', segunda.nucleo);
  segunda.ocupado = true;
  assert.equal(pestañas.cerrar(segunda.id), false);
  segunda.ocupado = false;
  assert.equal(pestañas.cerrar(segunda.id), true);
  assert.equal(pestañas.actual().id, primera.id);
  assert.equal((await interpretar('leer conservar', primera.nucleo)).texto, '');
  assert.equal((await interpretar('usuario', segunda.nucleo)).error, true);
});
test('Apagar o reiniciar termina todas las pestañas de la sesión', async () => {
  for (const comando of ['apagar', 'reiniciar']) {
    const { grupo } = await preparar();
    const primera = grupo.crear(), segunda = grupo.crear();
    assert.equal((await interpretar(comando, primera)).accion, comando);
    assert.equal((await interpretar('usuario', segunda)).error, true);
  }
});
test('El comando idioma cambia mensajes sin alterar los datos virtuales', async () => {
  const { grupo, repositorio } = await preparar();
  const nucleo = grupo.crear();
  await interpretar('crear archivo nota', nucleo);
  const antes = await repositorio.cargar();
  assert.equal((await interpretar('idioma en', nucleo)).texto, 'Session language: en.');
  assert.equal(obtenerIdioma(), 'en');
  assert.equal((await interpretar('idioma fr', nucleo)).error, true);
  assert.deepEqual(await repositorio.cargar(), antes);
  assert.equal((await interpretar('idioma es', nucleo)).texto, 'Idioma de la sesión: es.');
});
