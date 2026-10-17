import test from 'node:test';
import assert from 'node:assert/strict';
import { comandos, alias } from '../apps/consola/registro-comandos.js';
import { resaltarEntrada, segmentosTexto, agregarSalida, limpiarSalida } from '../apps/consola/presentacion.js';
import { interpretar } from '../apps/consola/interprete.js';
import { contextoTerminal } from './soporte/terminal.js';
import { crearLive } from '../js/core/live.js';
import { seleccionarIdioma } from '../js/core/i18n.js';

test('El catálogo y ayuda se ordenan de A a Z en Live e instalado, en ambos idiomas', async () => {
  const ordenar = nombres => [...nombres].sort((a,b) => a.localeCompare(b,'es'));
  assert.deepEqual(Object.keys(comandos), ordenar(Object.keys(comandos)));
  try {
    for (const idioma of ['es','en']) {
      seleccionarIdioma(idioma);
      for (const nucleo of [contextoTerminal().nucleo, crearLive({}).crear()]) {
        const ayuda = await interpretar('ayuda', nucleo);
        const nombres = ayuda.resaltados.map(rango => ayuda.texto.slice(rango.inicio,rango.fin));
        assert.ok(nombres.length > 100);
        assert.deepEqual(nombres, ordenar(nombres));
        assert.equal(new Set(nombres).size, nombres.length);
      }
    }
  } finally { seleccionarIdioma('es'); }
});

test('Cada comando y alias completo se resalta, sin colorear argumentos ni coincidencias parciales', () => {
  for (const nombre of [...Object.keys(comandos), ...Object.keys(alias)]) {
    const texto = `  ${nombre} "archivo con espacios"`;
    const segmentos = segmentosTexto(texto, resaltarEntrada(texto));
    assert.equal(segmentos.find(segmento => segmento.clase).texto, nombre);
    assert.equal(segmentos.at(-1).clase, undefined);
    assert.equal(segmentos.map(segmento => segmento.texto).join(''), texto);
    assert.deepEqual(resaltarEntrada(nombre + 'desconocido'), []);
  }
  for (const texto of ['', 'ayu', 'ayud', 'AYUDA', 'constructor', 'archivo ayuda']) assert.deepEqual(resaltarEntrada(texto), []);
});
test('La ayuda proporciona rangos de nombres sin cambiar su texto ni resultados', async () => {
  const { nucleo } = contextoTerminal();
  for (const orden of ['ayuda', 'ayuda escribir', 'help leer']) {
    const resultado = await interpretar(orden, nucleo);
    const segmentos = segmentosTexto(resultado.texto, resultado.resaltados);
    assert.equal(segmentos.map(segmento => segmento.texto).join(''), resultado.texto);
    assert.ok(segmentos.some(segmento => segmento.clase === 'comando-ayuda'));
    assert.ok(segmentos.filter(segmento => segmento.clase).every(segmento => Object.hasOwn(comandos, segmento.texto)));
  }
  await interpretar('crear archivo nota', nucleo);
  await interpretar('escribir nota "ayuda: texto literal"', nucleo);
  const leido = await interpretar('leer nota', nucleo);
  assert.equal(leido.texto, 'ayuda: texto literal');
  assert.equal(leido.resaltados, undefined);
});
test('Recortar y limpiar el registro mantiene alineados los colores y conserva el texto literal', () => {
  const pestaña = { salida: '', resaltados: [] };
  agregarSalida(pestaña, 'x'.repeat(99999));
  agregarSalida(pestaña, 'ayuda <script>', [{ inicio: 0, fin: 5, clase: 'comando-reconocido' }]);
  assert.equal(pestaña.salida.length, 100000);
  const rango = pestaña.resaltados[0];
  assert.equal(pestaña.salida.slice(rango.inicio, rango.fin), 'ayuda');
  assert.ok(pestaña.salida.endsWith('<script>'));
  limpiarSalida(pestaña);
  assert.equal(pestaña.salida, '');
  assert.deepEqual(pestaña.resaltados, []);
});
