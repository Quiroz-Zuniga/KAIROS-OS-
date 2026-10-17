import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { contextoTerminal } from './soporte/terminal.js';
import { interpretar } from '../apps/consola/interprete.js';
import { ampliados } from '../apps/consola/catalogo-ampliado.js';
import { traducir, seleccionarIdioma } from '../js/core/i18n.js';
import { entradaVisible, rangoContrasena } from '../apps/consola/secretos.js';
import { crearRed } from '../js/core/red.js';
import { instalar } from '../js/installer/instalar.js';
import { crearBorrador, validarPaso, avanzar } from '../js/installer/modelo.js';
import { autenticar, instalacionValida } from '../js/core/sistema.js';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
import { LICENCIAS_PRO } from '../js/core/licencias.js';
const { AlmacenLocal } = createRequire(import.meta.url)('../electron/almacen-local.cjs');
beforeEach(()=>seleccionarIdioma('es'));

async function fixture(nombre) {
  const { repositorio }=contextoTerminal();const datos=await repositorio.cargar();
  datos.edicion='Pro';datos.red=crearRed('10.1.2.3');datos.usuarios=[datos.usuario,{usuario:'pedro',nombre:'Pedro'}];
  datos.grupos=nombre==='creargrupo'?{}:{alumnos:['pedro']};
  datos.red.dns['aula.local']='10.0.0.20';
  if(nombre==='quitarruta')datos.red.rutas.push({destino:'10.1.0.0/16',puerta:'10.0.0.1'});
  if(nombre==='cerrarpuerto')datos.red.puertos.push({numero:8080,servicio:'pruebas'});
  datos.archivos.push({ruta:'/home',tipo:'carpeta'},{ruta:'/home/jorge',tipo:'carpeta'},...['nota.txt','uno.txt','dos.txt'].map(n=>({ruta:'/home/jorge/'+n,tipo:'archivo',contenido:nombre==='decodificar'?'aG9sYQ==':nombre==='minusculas'?'HOLA':'zeta\nbeta\nbeta',marcas:['importante']})));
  await repositorio.actualizar(datos,0);
  return {repositorio,nucleo:crearGrupoTerminal(datos,repositorio,datos.usuario).crear()};
}

for(const nombre of Object.keys(ampliados))test('Comando funcional y argumentos: '+nombre,async()=>{
  const {nucleo}=await fixture(nombre);const ejemplo=traducir('terminal.ejemplo.'+nombre);
  const resultado=await interpretar(ejemplo,nucleo);assert.equal(resultado.error,undefined,ejemplo+' -> '+resultado.texto);
  assert.ok(resultado.texto || resultado.editor || resultado.mutacion,'El comando debe producir un resultado');
  const incorrecto=nombre+' '+Array(ampliados[nombre].max+1).fill('extra').join(' ');
  assert.equal((await interpretar(incorrecto,nucleo)).error,true);
});

test('Usernames and unclosed display-name quotes remain visible; only password arguments are masked',()=>{
  for(const s of ['cuenta crear pedro "Pedro','cuenta crear pedro "Pedro López"','configurar contrasena','cuenta clave']){assert.equal(entradaVisible(s),s);assert.equal(rangoContrasena(s),null);}
  const entrada='cuenta crear pedro "Pedro López" "contraseña';
  assert.ok(entradaVisible(entrada).startsWith('cuenta crear pedro "Pedro López" '));
  assert.ok(!entradaVisible(entrada).includes('contraseña'));
  assert.equal(entradaVisible('secreto',true),'•••••••');
});

test('Editor saves atomically, rejects stale content and respects read-only attributes',async()=>{
  const {nucleo,repositorio}=await fixture('editar');const doc=(await interpretar('editar nota.txt',nucleo)).editor;
  await interpretar('escribir nota.txt "otra consola"',nucleo);
  await assert.rejects(nucleo.ejecutar('guardarEdicion',[doc.ruta,'edicion',doc.contenido]),/editor.errorConflicto/);
  assert.equal((await interpretar('leer nota.txt',nucleo)).texto,'otra consola');
  await nucleo.ejecutar('guardarEdicion',[doc.ruta,'nuevo','otra consola']);
  await interpretar('sololectura nota.txt',nucleo);const antes=await repositorio.cargar();
  assert.equal((await interpretar('escribir nota.txt "no"',nucleo)).error,true);assert.deepEqual(await repositorio.cargar(),antes);
});

test('Native IP survives restart and clean reinstall allocates a distinct IP; account passwords cannot repeat',async()=>{
  const raiz=await mkdtemp(path.join(tmpdir(),'uphos-red-prueba-'));
  try{
    const repo=new AlmacenLocal(raiz,instalacionValida);
    const borrador={...crearBorrador(), respuestaSeguridad: 'respuesta de prueba',nombre:'Ana',usuario:'ana',contrasena:'clave primera',confirmacion:'clave primera',confirmarFormato:true};
    const instalada=await instalar(borrador,repo);const primera=instalada.red.ip;
    assert.equal((await new AlmacenLocal(raiz,instalacionValida).cargar()).red.ip,primera);
    const nucleo=crearGrupoTerminal(instalada,repo,await autenticar(instalada,'ana','clave primera')).crear();
    const antes=await repo.cargar();const repetida=await interpretar('cuenta crear pedro "Pedro" "clave primera"',nucleo);
    assert.match(repetida.texto,/otra cuenta/);assert.equal(repetida.error,true);assert.deepEqual(await repo.cargar(),antes);
    assert.equal((await interpretar('cuenta crear pedro "Pedro" "clave segunda"',nucleo)).error,undefined);
    const actual=await repo.cargar();await assert.rejects(autenticar(actual,'pedro','clave primera'));await autenticar(actual,'pedro','clave segunda');
    const pedro=crearGrupoTerminal(actual,repo,await autenticar(actual,'pedro','clave segunda')).crear();
    assert.equal((await interpretar('cuenta clave "clave primera"',pedro)).error,true);
    const vigente=await repo.cargar();await repo.borrarInstalacion(vigente.revision,vigente.fecha);
    assert.notEqual((await instalar(borrador,repo)).red.ip,primera);
  }finally{assert.ok(path.resolve(raiz).startsWith(path.resolve(tmpdir())+path.sep));await rm(raiz,{recursive:true,force:true});}
});

test('Pro requires a valid key, all five keys work, and keyboards have only the requested options',()=>{
  const base={...crearBorrador(), respuestaSeguridad: 'respuesta de prueba',edicion:'Pro'};
  assert.ok(validarPaso('version',base));assert.throws(()=>avanzar('version',base));
  for(const licencia of LICENCIAS_PRO)assert.equal(validarPaso('version',{...base,licencia}),'');
  assert.ok(validarPaso('version',{...base,licencia:'inventada'}));
  assert.equal(validarPaso('teclado',{teclado:'ingles'}),'');assert.ok(validarPaso('teclado',{teclado:'espanol'}));
});

test('Creating a Pro account requires activating the installation first',async()=>{
  const {nucleo}=await fixture('activar');
  assert.equal((await interpretar('cuenta crear nuevo "Nuevo"',nucleo)).error,true);
  await interpretar('activar '+LICENCIAS_PRO[0],nucleo);
  assert.equal((await interpretar('cuenta crear nuevo "Nuevo"',nucleo)).secreto,true);
});

test('Network errors are understandable and changes survive subsequent commands',async()=>{
  const {nucleo,repositorio}=await fixture('red');await interpretar('desconectar',nucleo);
  assert.equal((await interpretar('ping google.com',nucleo)).error,true);await interpretar('conectar',nucleo);
  const ping=await interpretar('ping google.com 3',nucleo);assert.match(ping.texto,/SIMULADA/);assert.match(ping.texto,/3 enviados/);
  for(const linea of ['ping google.com 999','resolver desconocido.test','registrardns aula 999.0.0.1','abrirpuerto 99999 aula'])assert.equal((await interpretar(linea,nucleo)).error,true);
  await interpretar('registrardns examen.local 10.2.3.4',nucleo);
  const nuevo=crearGrupoTerminal(await repositorio.cargar(),repositorio,{usuario:'jorge',nombre:'Jorge'}).crear();
  assert.match((await interpretar('resolver examen.local',nuevo)).texto,/10.2.3.4/);
});

test('Hidden items can be listed explicitly and an empty path is rejected',async()=>{
  const {nucleo}=await fixture('ocultar');await interpretar('ocultar nota.txt',nucleo);
  assert.ok(!(await interpretar('archivos',nucleo)).texto.includes('nota.txt'));
  assert.ok((await interpretar('archivos -todo',nucleo)).texto.includes('nota.txt'));
  await interpretar('mostrar nota.txt',nucleo);assert.ok((await interpretar('archivos',nucleo)).texto.includes('nota.txt'));
  assert.equal((await interpretar('editar ""',nucleo)).error,true);
});

test('Text transformation produces saved content, and failed decoding is atomic',async()=>{
  const {nucleo,repositorio}=await fixture('ordenar');await interpretar('ordenar nota.txt',nucleo);await interpretar('unicos nota.txt',nucleo);
  assert.equal((await interpretar('leer nota.txt',nucleo)).texto,'beta\nzeta');
  await interpretar('reemplazar nota.txt beta alfa',nucleo);await interpretar('codificar nota.txt',nucleo);await interpretar('decodificar nota.txt',nucleo);
  assert.equal((await interpretar('leer nota.txt',nucleo)).texto,'alfa\nzeta');
  const antes=await repositorio.cargar();assert.equal((await interpretar('decodificar nota.txt',nucleo)).error,true);assert.deepEqual(await repositorio.cargar(),antes);
});
