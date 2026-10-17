import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRecuperacion } from '../js/core/recuperacion.js';
import { validarSeguridad, normalizarRespuesta } from '../js/core/preguntas-seguridad.js';
import { crearBorrador, validarInstalacion } from '../js/installer/modelo.js';
import { instalar } from '../js/installer/instalar.js';
import { autenticar, instalacionValida } from '../js/core/sistema.js';
import { modificarCuenta } from '../js/core/usuarios.js';
import { entradaVisible } from '../apps/consola/secretos.js';
import { interpretar } from '../apps/consola/interprete.js';
import { crearLive } from '../js/core/live.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const { AlmacenLocal } = createRequire(import.meta.url)('../electron/almacen-local.cjs');

async function contexto() {
  let datos, escrituras=0, fallo=false;
  const repo={guardar:async d=>{datos=structuredClone(d);},cargar:async()=>structuredClone(datos),actualizar:async(d,r,f)=>{
    if(fallo)throw new Error('terminal.errorGuardar');
    assert.equal(r,datos.revision??0);assert.equal(f,datos.fecha);datos=structuredClone(d);escrituras++;
  }};
  await instalar({...crearBorrador(),nombre:'Ana',usuario:'ana',contrasena:'clave antigua',confirmacion:'clave antigua',respuestaSeguridad:'Mi Luna',confirmarFormato:true},repo);
  return {repo,leer:()=>datos,escrituras:()=>escrituras,fallar:()=>{fallo=true;},editar:funcion=>funcion(datos)};
}
test('La instalación exige respuesta válida y guarda solo un hash con sal',async()=>{
  const datos={...crearBorrador(),nombre:'Ana',usuario:'ana',contrasena:'clave antigua',confirmacion:'clave antigua',confirmarFormato:true};
  assert.match(validarInstalacion(datos),/respuesta/);
  assert.equal(validarSeguridad('inventada','Luna'),'seguridad.errorPregunta');
  assert.equal(validarSeguridad('mascota','  '),'seguridad.errorRespuesta');
  const {leer}=await contexto();assert.equal(instalacionValida(leer()),true);
  assert.equal(leer().usuario.recuperacion.pregunta,'mascota');
  assert.equal(leer().usuarios[0].recuperacion.credencial.hash.length,64);
  assert.ok(!JSON.stringify(leer()).includes('Mi Luna'));
  const corrupto=structuredClone(leer());corrupto.usuarios[0].recuperacion.credencial.hash='mal';assert.equal(instalacionValida(corrupto),false);
});
test('Recuperar cambia la contraseña, conserva archivos y permite iniciar sesión tras recargar',async()=>{
  const {repo,leer,escrituras,editar}=await contexto();editar(d=>d.archivos.push({ruta:'/nota.txt',tipo:'archivo',contenido:'conservar'}));
  const servicio=crearRecuperacion(repo);assert.match(await servicio.preguntar('ana'),/mascota/);
  const guardar=await servicio.verificar('ana','  MI   LUNA  ');await guardar('clave nueva','clave nueva');
  assert.equal(escrituras(),1);assert.equal(leer().archivos.at(-1).contenido,'conservar');
  assert.equal((await autenticar(await repo.cargar(),'ana','clave nueva')).usuario,'ana');
  await assert.rejects(autenticar(leer(),'ana','clave antigua'));
  assert.deepEqual(leer().usuario.credencial,leer().usuarios[0].credencial);
  await assert.rejects(guardar('otra clave','otra clave'),/caducó/);
});
test('Respuestas incorrectas, cuentas desconocidas, antiguas o bloqueadas no escriben',async()=>{
  const {repo,leer,escrituras,editar}=await contexto(),servicio=crearRecuperacion(repo),antes=structuredClone(leer());
  await assert.rejects(servicio.verificar('ana','incorrecta'),/no coincide/);
  await assert.rejects(servicio.preguntar('inexistente'),/No se puede/);assert.equal(escrituras(),0);assert.deepEqual(leer(),antes);
  editar(d=>{delete d.usuario.recuperacion;delete d.usuarios[0].recuperacion;});assert.equal(instalacionValida(leer()),true);
  await assert.rejects(servicio.preguntar('ana'),/No se puede/);
  const otra=await contexto();otra.editar(d=>d.usuarios[0].bloqueado=true);await assert.rejects(crearRecuperacion(otra.repo).preguntar('ana'),/No se puede/);
});
test('Rechaza clave corta, confirmación distinta, clave anterior y la de otra cuenta',async()=>{
  const {repo,leer,escrituras}=await contexto();await modificarCuenta(leer(),'ana',['crear','pedro','Pedro','clave pedro']);
  const guardar=await crearRecuperacion(repo).verificar('ana','Mi Luna');
  for(const [clave,confirmacion] of [['corta','corta'],['clave nueva','distinta'],['clave antigua','clave antigua'],['clave pedro','clave pedro']])await assert.rejects(guardar(clave,confirmacion));
  assert.equal(escrituras(),0);await autenticar(leer(),'ana','clave antigua');await autenticar(leer(),'pedro','clave pedro');
});
test('El permiso expira y se invalida al cambiar la pregunta o contraseña',async()=>{
  const uno=await contexto();let tiempo=0;
  const guardar=await crearRecuperacion(uno.repo,()=>tiempo).verificar('ana','Mi Luna');tiempo=300001;await assert.rejects(guardar('clave nueva','clave nueva'),/caducó/);
  const dos=await contexto(),permiso=await crearRecuperacion(dos.repo).verificar('ana','Mi Luna');
  await modificarCuenta(dos.leer(),'ana',['seguridad','escuela','Mi escuela']);await assert.rejects(permiso('clave nueva','clave nueva'),/cambió|otra sesión|conflicto/i);
  assert.equal(dos.escrituras(),0);
});
test('Un fallo del almacenamiento conserva la contraseña anterior',async()=>{
  const {repo,leer,fallar}=await contexto(),antes=structuredClone(leer()),guardar=await crearRecuperacion(repo).verificar('ana','Mi Luna');fallar();
  await assert.rejects(guardar('clave nueva','clave nueva'),/Guardar/);assert.deepEqual(leer(),antes);
});
test('Cinco intentos fallidos bloquean temporalmente la recuperación en esta pantalla',async()=>{
  const {repo}=await contexto();let tiempo=0;const servicio=crearRecuperacion(repo,()=>tiempo);
  for(let i=0;i<5;i++)await assert.rejects(servicio.verificar('ana','no coincide'));
  await assert.rejects(servicio.verificar('ana','Mi Luna'),/un minuto/);tiempo=60001;
  assert.equal(typeof await servicio.verificar('ana','Mi Luna'),'function');
});
test('La respuesta se oculta incluso con comillas incompletas y no se expone en Live',async()=>{
  assert.equal(entradaVisible('cuenta seguridad mascota "Luna'),'cuenta seguridad mascota '+ '•'.repeat(5));
  assert.equal(entradaVisible('configurar respuesta "Luna'),'configurar respuesta '+ '•'.repeat(5));
  assert.equal(normalizarRespuesta(' A\u0301NGEL   AZUL '),'ángel azul');
  const live=crearLive({}).crear();assert.equal((await interpretar('configurar respuesta',live)).secreto,true);
  assert.equal((await interpretar('configurar respuesta "Secreto Luna"',live)).error,undefined);
  assert.ok(!(await interpretar('instalar',live)).texto.includes('Secreto Luna'));
});
test('Electron guarda la pregunta y permite recuperar después de reabrir el almacenamiento',async()=>{
  const raiz=await mkdtemp(path.join(tmpdir(),'kairos-recuperacion-'));
  try {
    const repo=new AlmacenLocal(raiz,instalacionValida);
    await instalar({...crearBorrador(),nombre:'Ana',usuario:'ana',contrasena:'clave antigua',confirmacion:'clave antigua',respuestaSeguridad:'Luna secreta',confirmarFormato:true},repo);
    const reabierto=new AlmacenLocal(raiz,instalacionValida),servicio=crearRecuperacion(reabierto);
    const guardar=await servicio.verificar('ana','Luna secreta');await guardar('clave nueva','clave nueva');
    const tercero=new AlmacenLocal(raiz,instalacionValida);await autenticar(await tercero.cargar(),'ana','clave nueva');
    const registro=await readFile(path.join(raiz,'estado.json'),'utf8');
    for(const secreto of ['Luna secreta','clave antigua','clave nueva'])assert.ok(!registro.includes(secreto));
  }finally{
    assert.ok(path.resolve(raiz).startsWith(path.resolve(tmpdir())+path.sep));await rm(raiz,{recursive:true,force:true});
  }
});
