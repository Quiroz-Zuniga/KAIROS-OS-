import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { contextoTerminal } from './soporte/terminal.js';
import { interpretar } from '../apps/consola/interprete.js';
import { crearBorrador, validarPaso } from '../js/installer/modelo.js';
import { instalar } from '../js/installer/instalar.js';
import { autenticar, instalacionValida } from '../js/core/sistema.js';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
const { AlmacenLocal } = createRequire(import.meta.url)('../electron/almacen-local.cjs');

test('Windows paths, nested folders, content tools and backups round-trip', async () => {
  const { nucleo, repositorio } = contextoTerminal();
  for (const linea of [String.raw`carpetas proyecto\datos`, String.raw`entrar .\proyecto\datos`, 'crear archivo nota.txt', 'escribir nota.txt "uno dos"', 'anexar nota.txt " tres"', 'copiar nota.txt copia.txt']) {
    const r = await interpretar(linea, nucleo); assert.equal(r.error, undefined, r.texto);
  }
  assert.match((await interpretar('contar nota.txt', nucleo)).texto, /Palabras: 3/);
  assert.match((await interpretar('comparar nota.txt copia.txt', nucleo)).texto, /mismo/);
  assert.equal((await interpretar('filtrar dos nota.txt', nucleo)).texto, 'uno dos tres');
  await interpretar('entrar', nucleo);
  for (const linea of ['copiarcarpeta proyecto duplicado', 'respaldo respaldo.json', 'restaurar respaldo.json recuperado', String.raw`leer recuperado\proyecto\datos\nota.txt`]) {
    const r = await interpretar(linea, nucleo); assert.equal(r.error, undefined, r.texto);
  }
  await interpretar('renombrar duplicado renombrado', nucleo);
  assert.ok((await repositorio.cargar()).archivos.some(n => n.ruta === '/home/jorge/renombrado/datos/nota.txt'));
  for (const ruta of ['C:\\Windows', 'CON', 'mal?', 'a:']) assert.equal((await interpretar('crear archivo ' + JSON.stringify(ruta), nucleo)).error, true);
  await interpretar('raiz', nucleo); assert.equal((await interpretar('ruta', nucleo)).texto, 'U:\\');
});

test('Native storage persists accounts, credentials and physical file content; rejects stale writes and escape paths', async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), 'uphos-prueba-'));
  try {
    const almacen = new AlmacenLocal(raiz, instalacionValida);
    const borrador = { ...crearBorrador(), respuestaSeguridad: 'respuesta de prueba', edicion: 'Pro', licencia: 'UPHOS-PRO-H7K2-M9Q4-T6XA', arquitectura: '32', nombre: 'Ana', usuario: 'ana', contrasena: 'clave segura', confirmacion: 'clave segura', confirmarFormato: true };
    const datos = await instalar(borrador, almacen);
    assert.equal(datos.edicion, 'Pro'); assert.equal(datos.arquitectura, '32');
    const nucleo = crearGrupoTerminal(datos, almacen, await autenticar(datos, 'ana', 'clave segura')).crear();
    const secreto = await interpretar('cuenta crear pedro "Pedro"', nucleo);
    assert.equal(secreto.secreto, true); assert.equal(secreto.ordenSecreta.nombre, 'cuenta');
    assert.equal((await interpretar('cuenta crear pedro "Pedro" "otra clave"', nucleo)).error, undefined);
    for (const linea of ['crear archivo nota.txt', 'escribir nota.txt "persistencia"']) assert.equal((await interpretar(linea, nucleo)).error, undefined);
    const actual = await almacen.cargar();
    assert.equal(await readFile(path.join((await almacen.info()).archivos, 'home/ana/nota.txt'), 'utf8'), 'persistencia');
    const reabierto = new AlmacenLocal(raiz, instalacionValida);
    const pedro = await autenticar(await reabierto.cargar(), 'pedro', 'otra clave');
    await assert.rejects(autenticar(actual, 'pedro', 'incorrecta'));
    const otro = crearGrupoTerminal(actual, reabierto, pedro).crear();
    assert.equal((await interpretar('leer U:\\home\\ana\\nota.txt', otro)).error, true);
    assert.equal((await interpretar('cuenta borrar ana confirmar', otro)).error, true);
    await assert.rejects(almacen.actualizar(actual, 0, actual.fecha), /Conflicto/);
    const corrupto = structuredClone(actual); corrupto.archivos.push({ ruta: '/../fuera', tipo: 'archivo', contenido: 'no' });
    await assert.rejects(almacen.actualizar(corrupto, actual.revision, actual.fecha), /Ruta/);
    assert.deepEqual(await almacen.cargar(), actual);
    await almacen.borrarInstalacion(actual.revision, actual.fecha); assert.equal(await almacen.cargar(), null);
  } finally {
    assert.ok(path.resolve(raiz).startsWith(path.resolve(tmpdir()) + path.sep));
    await rm(raiz, { recursive: true, force: true });
  }
});

test('Edition and architecture validation rejects unknown profiles', () => {
  assert.ok(validarPaso('version', { edicion: 'Otro', arquitectura: '64' }));
  assert.ok(validarPaso('version', { edicion: 'Plus', arquitectura: '16' }));
  assert.equal(validarPaso('version', { edicion: 'Plus', arquitectura: '32' }), '');
});
