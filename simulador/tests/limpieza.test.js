import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRepositorio } from '../js/persistence/repositorio.js';
import { arrancar } from '../js/core/sistema.js';

// Adaptador controlado para verificar el contrato transaccional sin navegador.
function almacenamientoControlado() {
  const registros = new Map([['instalacion', { usuario: 'anterior' }], ['otro', { conservar: true }]]);
  let transaccion;
  let objetivo;
  const base = {
    transaction(almacen, modo) {
      assert.equal(almacen, 'sistema');
      assert.equal(modo, 'readwrite');
      transaccion = { objectStore: nombre => {
        assert.equal(nombre, 'sistema');
        return { delete: clave => { objetivo = clave; } };
      } };
      return transaccion;
    }
  };
  const indexedDB = { open() {
    const solicitud = { result: base };
    queueMicrotask(() => solicitud.onsuccess());
    return solicitud;
  } };
  return { indexedDB, registros, completar() { registros.delete(objetivo); transaccion.oncomplete(); }, abortar() { transaccion.onabort(); } };
}
test('La limpieza solo borra la instalación y espera la confirmación transaccional', async () => {
  const almacenamiento = almacenamientoControlado();
  const repositorio = crearRepositorio(almacenamiento.indexedDB);
  let terminado = false;
  const borrado = repositorio.borrarInstalacion().then(() => { terminado = true; });
  await new Promise(resolver => setImmediate(resolver));
  assert.equal(terminado, false);
  assert.ok(almacenamiento.registros.has('instalacion'));
  almacenamiento.completar();
  await borrado;
  assert.equal(almacenamiento.registros.has('instalacion'), false);
  assert.equal(almacenamiento.registros.has('otro'), true);
  assert.equal((await arrancar({ cargar: async () => almacenamiento.registros.get('instalacion') ?? null })).pantalla, 'bienvenida');
});
test('Un borrado abortado conserva los datos y comunica el error', async () => {
  const almacenamiento = almacenamientoControlado();
  const borrado = crearRepositorio(almacenamiento.indexedDB).borrarInstalacion();
  const comprobacion = assert.rejects(borrado, /No se pudo borrar/);
  await new Promise(resolver => setImmediate(resolver));
  almacenamiento.abortar();
  await comprobacion;
  assert.ok(almacenamiento.registros.has('instalacion'));
});
