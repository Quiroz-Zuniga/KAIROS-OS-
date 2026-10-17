import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearLive } from '../js/core/live.js';
import { interpretar } from '../apps/consola/interprete.js';
import { esComandoSecreto } from '../apps/consola/consola.js';
import { seleccionarIdioma } from '../js/core/i18n.js';
import { arrancar, autenticar } from '../js/core/sistema.js';

beforeEach(() => seleccionarIdioma('es'));
function contexto(inicial = null) {
  let guardado = inicial, escrituras = 0;
  const repositorio = { cargar: async () => structuredClone(guardado), guardar: async datos => { escrituras++; guardado = structuredClone(datos); } };
  const live = crearLive(repositorio);
  return { live, nucleo: live.crear(), repositorio, escrituras: () => escrituras };
}
async function configurar(nucleo) {
  for (const linea of ['configurar nombre "Ana López"', 'configurar usuario ana', 'configurar contrasena "clave segura"', 'configurar pregunta mascota', 'configurar respuesta Luna', 'formatear confirmar']) {
    const r = await interpretar(linea, nucleo);
    assert.equal(r.error, undefined, r.texto);
  }
}
test('Live comparte archivos entre pestañas sin escribir la instalación persistida', async () => {
  const { live, nucleo, repositorio, escrituras } = contexto();
  const otra = live.crear();
  await interpretar('crear carpeta documentos', nucleo);
  await interpretar('crear archivo documentos/nota', nucleo);
  await interpretar('escribir documentos/nota "Hola Live"', nucleo);
  assert.equal((await interpretar('leer documentos/nota', otra)).texto, 'Hola Live');
  assert.match((await interpretar('arbol', otra)).texto, /documentos[\s\S]*nota/);
  assert.match((await interpretar('buscar nota', otra)).texto, /\/home\/live\/documentos\/nota/);
  assert.equal((await interpretar('ruta', otra)).texto, String.raw`U:\home\live`);
  assert.match((await interpretar('discos', otra)).texto, /64 GiB/);
  assert.equal((await interpretar('arbol noexiste', otra)).error, true);
  assert.equal((await interpretar('buscar nota noexiste', otra)).error, true);
  assert.equal(await repositorio.cargar(), null);
  assert.equal(escrituras(), 0);
  const nueva = crearLive(repositorio).crear();
  assert.equal((await interpretar('leer documentos/nota', nueva)).error, true);
});
test('El instalador por consola guarda una instalación autenticable y reporta tareas completadas', async () => {
  const { nucleo, repositorio, escrituras } = contexto();
  await configurar(nucleo);
  const resumen = await interpretar('instalar', nucleo);
  assert.match(resumen.texto, /ana/);
  assert.ok(!resumen.texto.includes('clave segura'));
  assert.equal(escrituras(), 0);
  const etapas = [];
  const final = await interpretar('instalar confirmar', nucleo, etapa => etapas.push(etapa));
  assert.equal(final.error, undefined, final.texto);
  assert.equal(final.accion, 'reiniciar');
  assert.equal(etapas.at(-1).porcentaje, 100);
  assert.equal(escrituras(), 1);
  const { instalacion } = await arrancar(repositorio);
  assert.equal((await autenticar(instalacion, 'ana', 'clave segura')).usuario, 'ana');
  assert.ok(!JSON.stringify(instalacion).includes('clave segura'));
  assert.equal((await interpretar('crear archivo tardio', nucleo)).error, true);
});
test('Entradas inválidas conservan el borrador y nunca guardan instalaciones incompletas', async () => {
  const { nucleo, escrituras } = contexto();
  const antes = (await interpretar('instalar', nucleo)).texto;
  for (const linea of ['configurar usuario 1Ana', 'configurar nombre ""', 'configurar idioma fr', 'configurar zona inexistente', 'configurar contrasena corta', 'configurar desconocido a', 'particionar crear 20 64 solapada', 'particionar editar principal 3.5 dato', 'particionar borrar principal', 'particionar usar ausente', 'formatear no', 'instalar no', 'instalar confirmar']) {
    const r = await interpretar(linea, nucleo);
    assert.equal(r.error, true, linea);
    assert.ok(!r.texto.includes('[live.'), linea);
  }
  assert.equal((await interpretar('instalar', nucleo)).texto, antes);
  assert.equal(escrituras(), 0);
});
test('Particionado desde consola aplica el plan y exige confirmar nuevamente el formato', async () => {
  const { nucleo, repositorio } = contexto();
  await configurar(nucleo);
  for (const linea of ['particionar editar principal 24 Sistema', 'particionar crear 24 40 Datos']) {
    assert.equal((await interpretar(linea, nucleo)).error, undefined);
  }
  assert.equal((await interpretar('instalar confirmar', nucleo)).error, true);
  assert.equal((await interpretar('formatear confirmar', nucleo)).error, undefined);
  assert.equal((await interpretar('instalar confirmar', nucleo)).error, undefined);
  const datos = await repositorio.cargar();
  assert.equal(datos.disco.particiones.length, 2);
  assert.equal(datos.disco.particiones[0].capacidadGiB, 24);
  assert.equal(datos.disco.particiones[1].formato, null);
});
test('Live no reemplaza una instalación existente y permite reintentar un fallo de guardado', async () => {
  const { nucleo, repositorio, escrituras } = contexto({ existente: true });
  await configurar(nucleo);
  assert.equal((await interpretar('instalar confirmar', nucleo)).error, true);
  assert.equal(escrituras(), 0);
  assert.deepEqual(await repositorio.cargar(), { existente: true });
  const limpio = contexto();
  await configurar(limpio.nucleo);
  const guardar = limpio.repositorio.guardar;
  limpio.repositorio.guardar = async () => { throw new Error('Sin espacio'); };
  assert.equal((await interpretar('instalar confirmar', limpio.nucleo)).error, true);
  assert.equal(await limpio.repositorio.cargar(), null);
  limpio.repositorio.guardar = guardar;
  assert.equal((await interpretar('instalar confirmar', limpio.nucleo)).error, undefined);
});
test('Entrada de contraseña se reconoce para ocultarla y no expone el secreto en respuestas', async () => {
  for (const linea of ['configurar "contrasena" "valor"', 'configurar contrasena "sin cerrar']) assert.equal(esComandoSecreto(linea), true);
  assert.equal(esComandoSecreto('configurar nombre Ana'), false);
  const { nucleo } = contexto();
  assert.equal((await interpretar('configurar contrasena', nucleo)).secreto, true);
  const r = await interpretar('configurar contrasena "clave de prueba"', nucleo);
  assert.ok(!r.texto.includes('clave de prueba'));
});
test('Cerrar o apagar una consola impide usar sus comandos de instalación', async () => {
  const { live, nucleo } = contexto();
  const cerrada = live.crear();
  cerrada.cerrar();
  assert.equal((await interpretar('configurar usuario prueba', cerrada)).error, true);
  await interpretar('apagar', nucleo);
  assert.equal((await interpretar('configurar usuario prueba', live.crear())).error, true);
});
