import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRepositorio } from '../js/persistence/repositorio.js';

// Doble de almacenamiento: prueba el contrato de guardado y control de revisión.
function baseControlada(inicial, fallar = false) {
  let registro = structuredClone(inicial);
  const base = { transaction() {
    let abortada = false, pendiente = registro;
    const transaccion = {
      abort() { abortada = true; queueMicrotask(() => transaccion.onabort()); },
      objectStore: () => ({
        get() {
          const solicitud = {};
          queueMicrotask(() => { solicitud.result = structuredClone(registro); solicitud.onsuccess?.(); });
          return solicitud;
        },
        put(datos) { pendiente = structuredClone(datos); },
        delete() { pendiente = undefined; }
      })
    };
    setImmediate(() => {
      if (abortada) return;
      if (fallar) { transaccion.abort(); return; }
      registro = pendiente;
      transaccion.oncomplete();
    });
    return transaccion;
  } };
  return { indexedDB: { open() { const solicitud = { result: base }; queueMicrotask(() => solicitud.onsuccess()); return solicitud; } }, leer: () => structuredClone(registro) };
}
test('El repositorio actualiza una revisión coincidente y rechaza una escritura obsoleta', async () => {
  const base = baseControlada({ archivos: [], revision: 0 });
  const repositorio = crearRepositorio(base.indexedDB);
  await repositorio.actualizar({ archivos: [{ ruta: '/home/jorge/a' }], revision: 1 }, 0);
  assert.equal(base.leer().revision, 1);
  await assert.rejects(repositorio.actualizar({ archivos: [], revision: 1 }, 0), /terminal.errorConflicto/);
  assert.equal(base.leer().archivos.length, 1);
});

test('La reinstalación solo borra una revisión y fecha coincidentes y conserva datos al abortar', async () => {
  const datos = { revision: 2, fecha: 'actual', archivos: [{ ruta: '/' }] };
  const base = baseControlada(datos);
  const repo = crearRepositorio(base.indexedDB);
  await assert.rejects(repo.borrarInstalacion(1, 'actual'), /terminal.errorConflicto/);
  await assert.rejects(repo.borrarInstalacion(2, 'anterior'), /terminal.errorConflicto/);
  assert.deepEqual(base.leer(), datos);
  await repo.borrarInstalacion(2, 'actual');
  assert.equal(base.leer(), undefined);
  const fallida = baseControlada(datos, true);
  await assert.rejects(crearRepositorio(fallida.indexedDB).borrarInstalacion(2, 'actual'), /No se pudo borrar/);
  assert.deepEqual(fallida.leer(), datos);
});
test('No se recrea una instalación borrada desde una sesión antigua', async () => {
  const base = baseControlada(undefined);
  await assert.rejects(crearRepositorio(base.indexedDB).actualizar({ revision: 1 }, 0), /terminal.errorConflicto/);
  assert.equal(base.leer(), undefined);
});
test('Un aborto de escritura conserva el estado anterior', async () => {
  const base = baseControlada({ revision: 0, archivos: [] }, true);
  await assert.rejects(crearRepositorio(base.indexedDB).actualizar({ revision: 1, archivos: [{ ruta: '/nuevo' }] }, 0), /terminal.errorGuardar/);
  assert.deepEqual(base.leer(), { revision: 0, archivos: [] });
});
test('Una sesión antigua no puede sobrescribir una instalación nueva con la misma revisión', async () => {
  const base = baseControlada({ revision: 0, fecha: 'instalacion-nueva', archivos: [] });
  await assert.rejects(crearRepositorio(base.indexedDB).actualizar({ revision: 1, fecha: 'instalacion-antigua' }, 0, 'instalacion-antigua'), /terminal.errorConflicto/);
  assert.equal(base.leer().fecha, 'instalacion-nueva');
});
