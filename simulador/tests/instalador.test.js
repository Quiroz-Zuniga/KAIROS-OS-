import test from 'node:test';
import assert from 'node:assert/strict';
import { crearBorrador, PASOS, validarPaso, avanzar, retroceder } from '../js/installer/modelo.js';
import { instalar } from '../js/installer/instalar.js';
import { arrancar, autenticar } from '../js/core/sistema.js';
import { crearRepositorio } from '../js/persistence/repositorio.js';
import { crearCredencial, verificarCredencial } from '../js/core/credenciales.js';

const configuracion = () => ({ ...crearBorrador(), respuestaSeguridad: 'respuesta de prueba', nombre: 'María López', usuario: 'maria', contrasena: 'clave-segura', confirmacion: 'clave-segura', confirmarFormato: true });
function memoria() {
  let datos = null;
  return { cargar: async () => structuredClone(datos), guardar: async valor => { datos = structuredClone(valor); } };
}
test('El flujo completo instala, vuelve a arrancar y autentica sin repetir el instalador', async () => {
  const repositorio = memoria();
  assert.equal((await arrancar(repositorio)).pantalla, 'bienvenida');
  const datos = configuracion();
  for (let indice = 0; indice < PASOS.length - 1; indice++) assert.equal(avanzar(PASOS[indice], datos), PASOS[indice + 1]);
  assert.equal(retroceder('bienvenida'), 'bienvenida');
  assert.equal(retroceder('resumen'), 'zona');
  const eventos = [];
  const resultado = await instalar(datos, repositorio, evento => eventos.push(evento));
  assert.equal(resultado.disco.particiones[0].capacidadGiB, 32);
  assert.ok(resultado.archivos.some(archivo => archivo.ruta === '/usuarios/maria/documentos'));
  assert.equal(resultado.preferencias.zona, 'America/Tegucigalpa');
  assert.equal(eventos.at(-1).porcentaje, 100);
  assert.ok(eventos.every((evento, indice) => indice === 0 || evento.porcentaje >= eventos[indice - 1].porcentaje));
  assert.ok(!JSON.stringify(resultado).includes(datos.contrasena));
  const nuevoArranque = await arrancar(repositorio);
  assert.equal(nuevoArranque.pantalla, 'acceso');
  assert.equal((await autenticar(nuevoArranque.instalacion, 'maria', 'clave-segura')).nombre, 'María López');
  await assert.rejects(autenticar(resultado, 'maria', 'incorrecta'), /incorrectos/);
  await assert.rejects(autenticar(resultado, 'otra', 'clave-segura'), /incorrectos/);
  await assert.rejects(autenticar(resultado, '', ''), /Escribe/);
});
test('Cada paso rechaza entradas inválidas y bloquea el avance', () => {
  const casos = [
    ['idioma', { idioma: 'fr' }], ['teclado', { teclado: 'otro' }],
    ...['', '0', '65', '8.5', '32abc', '-1'].map(capacidad => ['particionado', { capacidad }]),
    ['formateo', { confirmarFormato: false }], ['formateo', { formato: 'NTFS' }],
    ['usuario', { nombre: ' ' }], ['usuario', { usuario: '1Admin' }], ['usuario', { usuario: '../otra' }],
    ['contrasena', { contrasena: 'corta' }], ['contrasena', { confirmacion: 'distinta' }],
    ['contrasena', { contrasena: '        ', confirmacion: '        ' }], ['zona', { zona: 'inventada' }]
  ];
  for (const [paso, cambios] of casos) {
    const datos = { ...configuracion(), ...cambios };
    assert.ok(validarPaso(paso, datos), `${paso}: ${JSON.stringify(cambios)}`);
    assert.throws(() => avanzar(paso, datos));
  }
  for (const capacidad of ['8', '64']) assert.equal(validarPaso('particionado', { capacidad }), '');
});
test('Una configuración inválida no escribe en persistencia', async () => {
  let escrituras = 0;
  await assert.rejects(instalar({ ...configuracion(), confirmarFormato: false }, { guardar: async () => escrituras++ }), /Confirma/);
  assert.equal(escrituras, 0);
});
test('Un fallo de guardado no comunica finalización y permite reintentar', async () => {
  const eventos = [];
  await assert.rejects(instalar(configuracion(), { guardar: async () => { throw new Error('Sin espacio'); } }, evento => eventos.push(evento)), /Sin espacio/);
  assert.ok(eventos.every(evento => evento.porcentaje < 100));
  assert.equal((await instalar(configuracion(), memoria())).estado, 'instalado');
});
test('Los datos corruptos se conservan y detienen el arranque', async () => {
  await assert.rejects(arrancar({ cargar: async () => ({ version: 99 }) }), /dañada/);
  await assert.rejects(arrancar({ cargar: async () => { throw new Error('Lectura bloqueada'); } }), /Lectura bloqueada/);
});
test('La falta de IndexedDB produce un error comprensible', async () => {
  await assert.rejects(crearRepositorio(null).cargar(), /IndexedDB/);
});
test('Todos los pasos editables permiten volver y las correcciones desbloquean el avance', () => {
  for (let indice = 1; indice < PASOS.length; indice++) assert.equal(retroceder(PASOS[indice]), PASOS[indice - 1]);
  const datos = configuracion();
  datos.usuario = '';
  assert.throws(() => avanzar('usuario', datos));
  datos.usuario = 'nuevo_usuario';
  assert.equal(avanzar('usuario', datos), 'contrasena');
  assert.equal(validarPaso('resumen', datos), '');
});
test('Las credenciales tienen sal independiente y rechazan registros alterados', async () => {
  const primera = await crearCredencial('clave-segura');
  const segunda = await crearCredencial('clave-segura');
  assert.notEqual(primera.sal, segunda.sal);
  assert.notEqual(primera.hash, segunda.hash);
  assert.equal(await verificarCredencial('clave-segura', primera), true);
  assert.equal(await verificarCredencial('clave-segura', { ...primera, iteraciones: 1 }), false);
});
