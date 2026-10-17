import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CATALOGOS, IDIOMA_PREDETERMINADO, traducir, seleccionarIdioma, obtenerIdioma, normalizarIdioma } from '../js/core/i18n.js';
import { PASOS, crearBorrador, validarPaso } from '../js/installer/modelo.js';
import { instalar } from '../js/installer/instalar.js';
import { arrancar } from '../js/core/sistema.js';
import { interpretar } from '../apps/consola/interprete.js';
import { contextoTerminal } from './soporte/terminal.js';

beforeEach(() => seleccionarIdioma('es'));
test('Español predeterminado e inglés seleccionable, sin detección del idioma del navegador', () => {
  assert.equal(IDIOMA_PREDETERMINADO, 'es');
  assert.equal(crearBorrador().idioma, 'es');
  assert.equal(obtenerIdioma(), 'es');
  assert.equal(traducir('accion.continuar'), 'Continuar');
  assert.equal(seleccionarIdioma('en'), 'en');
  assert.equal(traducir('accion.continuar'), 'Continue');
  assert.equal(validarPaso('idioma', { idioma: 'en' }), '');
  assert.equal(validarPaso('usuario', { nombre: '', usuario: '' }), CATALOGOS.en['error.nombre']);
  assert.equal(seleccionarIdioma('desconocido'), 'es');
  assert.equal(normalizarIdioma('es-HN'), 'es');
});
test('Ambos catálogos tienen las mismas claves, parámetros y textos no vacíos', () => {
  assert.deepEqual(Object.keys(CATALOGOS.es).sort(), Object.keys(CATALOGOS.en).sort());
  for (const clave of Object.keys(CATALOGOS.es)) {
    for (const idioma of ['es', 'en']) assert.ok(CATALOGOS[idioma][clave].trim(), `${idioma}: ${clave}`);
    const parametros = texto => [...texto.matchAll(/\{(\w+)\}/g)].map(valor => valor[1]).sort();
    assert.deepEqual(parametros(CATALOGOS.es[clave]), parametros(CATALOGOS.en[clave]), clave);
  }
  for (const paso of PASOS) assert.ok(Object.hasOwn(CATALOGOS.en, `titulo.${paso}`));
});
test('La interpolación preserva datos literales y las claves ausentes son identificables', () => {
  assert.equal(traducir('paso', { actual: 3, total: 9 }, 'en'), 'Step 3 of 9');
  assert.equal(traducir('sesion.bienvenida', { nombre: '$& <María>' }, 'es'), 'Bienvenido, $& <María>.');
  assert.equal(traducir('ausente'), '[ausente]');
  assert.equal(traducir('constructor'), '[constructor]');
  assert.equal(traducir('accion.continuar', {}, 'fr'), 'Continuar');
});
test('Cambiar el idioma traduce mensajes sin cambiar comandos ni archivos', async () => {
  const { nucleo, repositorio } = contextoTerminal();
  await interpretar('crear archivo nota', nucleo);
  await interpretar('escribir nota "Contenido en español"', nucleo);
  const antes = await repositorio.cargar();
  seleccionarIdioma('en');
  const respuesta = await interpretar('ayuda', nucleo);
  assert.match(respuesta.texto, /\| ayuda /);
  assert.match(respuesta.texto, /Show the catalog/);
  assert.equal((await interpretar('no-existe', nucleo)).texto, CATALOGOS.en['consola.desconocido']);
  assert.equal((await interpretar('leer nota', nucleo)).texto, 'Contenido en español');
  assert.equal((await interpretar('help', nucleo)).error, undefined);
  assert.deepEqual(await repositorio.cargar(), antes);
});
test('La instalación persiste inglés y admite instalaciones anteriores en español', async () => {
  let guardado;
  const repositorio = { guardar: async datos => { guardado = structuredClone(datos); }, cargar: async () => structuredClone(guardado) };
  const datos = { ...crearBorrador(), respuestaSeguridad: 'respuesta de prueba', idioma: 'en', nombre: 'Test User', usuario: 'prueba', contrasena: 'clave-segura', confirmacion: 'clave-segura', confirmarFormato: true };
  await instalar(datos, repositorio);
  assert.equal((await arrancar(repositorio)).instalacion.preferencias.idioma, 'en');
  guardado.preferencias.idioma = 'es-HN';
  assert.equal((await arrancar(repositorio)).pantalla, 'acceso');
});
test('Las claves literales utilizadas por los módulos existen en el catálogo', async () => {
  const archivos = ['js/installer/interfaz.js', 'js/installer/modelo.js', 'js/installer/instalar.js', 'js/core/sistema.js', 'js/core/terminal.js', 'js/services/archivos.js', 'js/core/configuracion.js', 'js/persistence/repositorio.js', 'apps/consola/consola.js', 'apps/consola/interprete.js', 'apps/consola/validador.js', 'apps/consola/analizador.js', 'apps/consola/registro-comandos.js', 'servidor.js'];
  for (const archivo of archivos) {
    const contenido = await readFile(new URL(`../${archivo}`, import.meta.url), 'utf8');
    const referencias = [...contenido.matchAll(/(?:t\(|texto\(|respuesta\(|new Error\(|descripcion: |\[|etapa: )'((?:terminal|error|etapa|consola|servidor|accion|campo|titulo|resumen|bienvenida|instalando|final|sesion|acceso|arranque|particionado|formateo|usuario|contrasena|zona|idioma|teclado)\.[\w.]+)'/g)];
    for (const referencia of referencias) assert.ok(Object.hasOwn(CATALOGOS.es, referencia[1]), `${archivo}: ${referencia[1]}`);
  }
});
