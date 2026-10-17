import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRitmo } from '../js/installer/ritmo.js';
import { instalar } from '../js/installer/instalar.js';
import { crearBorrador } from '../js/installer/modelo.js';
import { contextoTerminal } from './soporte/terminal.js';
import { interpretar } from '../apps/consola/interprete.js';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
import { crearLive } from '../js/core/live.js';

test('El ritmo alcanza diez segundos sin esperas duplicadas ni añadir tiempo a tareas lentas', async () => {
  let reloj = 0;
  const vistos = [], esperas = [];
  const ritmo = crearRitmo(avance => vistos.push([avance.porcentaje, reloj]), {
    ahora: () => reloj, esperar: async ms => { esperas.push(ms); reloj += ms; }
  });
  for (const porcentaje of [0, 20, 20, 40, 40, 60, 80, 100]) await ritmo({ porcentaje });
  assert.equal(reloj, 10000);
  assert.equal(esperas.length, 5);
  assert.deepEqual(vistos.at(-1), [100, 10000]);
  reloj = 0;
  const lento = crearRitmo(() => {}, { ahora: () => reloj, esperar: async ms => { reloj += ms; } });
  reloj = 15000;
  await lento({ porcentaje: 100 });
  assert.equal(reloj, 15000);
});
test('La presentación no muestra 100 por ciento si el guardado falla', async () => {
  let reloj = 0;
  const vistos = [];
  const ritmo = crearRitmo(avance => vistos.push(avance.porcentaje), { ahora: () => reloj, esperar: async ms => { reloj += ms; } });
  const borrador = { ...crearBorrador(), respuestaSeguridad: 'respuesta de prueba', nombre: 'Ana', usuario: 'ana', contrasena: 'clave segura', confirmacion: 'clave segura', confirmarFormato: true };
  await assert.rejects(instalar(borrador, { guardar: async () => { throw new Error('fallo'); } }, ritmo), /fallo/);
  assert.ok(!vistos.includes(100));
  assert.equal(reloj, 8000);
});
test('Reinstalar exige confirmación explícita y cierra todas las consolas solo tras borrar', async () => {
  const { repositorio } = contextoTerminal();
  const datos = await repositorio.cargar();
  const grupo = crearGrupoTerminal(datos, repositorio, datos.usuario);
  const primera = grupo.crear(), segunda = grupo.crear();
  await interpretar('crear archivo conservar', primera);
  assert.ok((await interpretar('reinstalar', primera)).texto.includes('reinstalar confirmar'));
  assert.equal((await interpretar('reinstalar no', primera)).error, true);
  assert.ok((await repositorio.cargar()).archivos.some(n => n.ruta.endsWith('/conservar')));
  assert.equal((await interpretar('reinstalar confirmar', primera)).accion, 'reinstalar');
  assert.equal(await repositorio.cargar(), null);
  assert.equal((await interpretar('usuario', segunda)).error, true);
});
test('Fallar el borrado conserva sesión y archivos; Live no permite reinstalar', async () => {
  const { repositorio, nucleo } = contextoTerminal();
  const antes = await repositorio.cargar();
  repositorio.borrarInstalacion = async () => { throw new Error('error.borrar'); };
  assert.equal((await interpretar('reinstalar confirmar', nucleo)).error, true);
  assert.deepEqual(await repositorio.cargar(), antes);
  assert.equal((await interpretar('usuario', nucleo)).error, undefined);
  const live = crearLive(repositorio).crear();
  assert.equal((await interpretar('reinstalar confirmar', live)).error, true);
  const ayuda = (await interpretar('ayuda', live)).texto;
  assert.ok(ayuda.includes('| particionar '));
  assert.ok(!ayuda.includes('| reinstalar '));
});
