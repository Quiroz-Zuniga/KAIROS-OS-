import test from 'node:test';
import assert from 'node:assert/strict';
import { crearBorrador, validarPaso } from '../js/installer/modelo.js';
import { espaciosLibres, crearParticion, editarParticion, eliminarParticion, seleccionarParticion, validarParticiones } from '../js/installer/particiones.js';
import { instalar } from '../js/installer/instalar.js';
import { instalacionValida } from '../js/core/sistema.js';

test('Crear, editar y eliminar actualiza la distribución y libera espacio', () => {
  const datos = crearBorrador();
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 32, capacidadGiB: 32 }]);
  const id = crearParticion(datos, 32, 16, 'Documentos');
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 48, capacidadGiB: 16 }]);
  editarParticion(datos, id, 8, 'Datos');
  assert.equal(datos.particiones.find(particion => particion.id === id).nombre, 'Datos');
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 40, capacidadGiB: 24 }]);
  eliminarParticion(datos, id);
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 32, capacidadGiB: 32 }]);
});
test('El espacio libre conserva los huecos y no se superponen las particiones', () => {
  const datos = crearBorrador();
  crearParticion(datos, 40, 8, 'Datos');
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 32, capacidadGiB: 8 }, { inicioGiB: 48, capacidadGiB: 16 }]);
  const antes = structuredClone(datos);
  assert.throws(() => editarParticion(datos, 'principal', 48, 'KAIROS'), /disco.errorPlan/);
  assert.deepEqual(datos, antes);
  assert.throws(() => crearParticion(datos, 30, 8, 'Superposición'), /disco.errorPlan/);
  assert.deepEqual(datos, antes);
});
test('Se rechazan tamaños inválidos, nombres vacíos, duplicados y exceso de disco', () => {
  for (const capacidad of [0, -1, 1.5, NaN, 65]) {
    const datos = crearBorrador();
    const antes = structuredClone(datos);
    assert.throws(() => crearParticion(datos, 32, capacidad, 'Datos'));
    assert.deepEqual(datos, antes);
  }
  assert.throws(() => editarParticion(crearBorrador(), 'principal', 32, ' '));
  assert.ok(validarParticiones([null]));
  const particion = crearBorrador().particiones[0];
  assert.ok(validarParticiones([particion, { ...particion, inicioGiB: 32 }]));
});
test('El destino exige 8 GiB y cualquier cambio requiere confirmar otra vez el formato', () => {
  const datos = crearBorrador();
  datos.confirmarFormato = true;
  const id = crearParticion(datos, 32, 4, 'Reserva');
  assert.equal(datos.confirmarFormato, false);
  assert.throws(() => seleccionarParticion(datos, id), /disco.errorDestino/);
  datos.confirmarFormato = true;
  editarParticion(datos, 'principal', 24, 'Sistema');
  assert.equal(datos.capacidad, '24');
  assert.equal(datos.confirmarFormato, false);
  assert.equal(validarPaso('particionado', datos), '');
  eliminarParticion(datos, 'principal');
  assert.ok(validarPaso('particionado', datos));
  eliminarParticion(datos, id);
  assert.deepEqual(espaciosLibres(datos.particiones), [{ inicioGiB: 0, capacidadGiB: 64 }]);
  crearParticion(datos, 0, 64, 'KAIROS');
  assert.equal(validarPaso('particionado', datos), '');
});
test('Instalar conserva todas las particiones y solo formatea el destino seleccionado', async () => {
  const datos = crearBorrador();
  const id = crearParticion(datos, 32, 24, 'Sistema nuevo');
  seleccionarParticion(datos, id);
  Object.assign(datos, { respuestaSeguridad: 'respuesta de prueba', nombre: 'Jorge', usuario: 'jorge', contrasena: 'clave-segura', confirmacion: 'clave-segura', confirmarFormato: true });
  let guardado;
  const resultado = await instalar(datos, { guardar: async valor => { guardado = structuredClone(valor); } });
  assert.equal(resultado.disco.particionSistema, id);
  assert.equal(guardado.disco.particiones.length, 2);
  assert.equal(guardado.disco.particiones.find(particion => particion.id === id).formato, 'KAIROSFS');
  assert.equal(guardado.disco.particiones.find(particion => particion.id === 'principal').formato, null);
  assert.equal(guardado.disco.particiones[0].id, id);
  assert.equal(instalacionValida(guardado), true);
});
