import test from 'node:test';
import assert from 'node:assert/strict';
import { instalar } from '../js/installer/instalar.js';
import { crearBorrador, validarPaso } from '../js/installer/modelo.js';
import { autenticar, instalacionValida } from '../js/core/sistema.js';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
import { crearRecuperacion } from '../js/core/recuperacion.js';
import { crearLive } from '../js/core/live.js';
import { interpretar } from '../apps/consola/interprete.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const {AlmacenLocal}=createRequire(import.meta.url)('../electron/almacen-local.cjs');
const borrador=()=>({...crearBorrador(),usuario:'Jorge',nombre:'Jorge',contrasena:'Clave Original',confirmacion:'Clave Original',respuestaSeguridad:'Luna secreta',confirmarFormato:true});
async function contexto(){let datos;const repo={guardar:async d=>{datos=structuredClone(d);},cargar:async()=>structuredClone(datos),actualizar:async(d,r,f)=>{assert.equal(r,datos.revision??0);assert.equal(f,datos.fecha);datos=structuredClone(d);}};await instalar(borrador(),repo);return repo;}
test('Instalación conserva mayúsculas y acceso y recuperación resuelven la identidad de la cuenta',async()=>{
  assert.equal(validarPaso('usuario',{nombre:'Jorge',usuario:'JORGE_123'}),'');
  for(const usuario of ['1Jorge','Jo','Jorge nombre','Jórge'])assert.ok(validarPaso('usuario',{nombre:'Jorge',usuario}));
  const repo=await contexto(),datos=await repo.cargar();assert.equal(datos.usuario.usuario,'Jorge');assert.equal(instalacionValida(datos),true);
  for(const nombre of ['Jorge','jorge','JORGE'])assert.equal((await autenticar(datos,nombre,'Clave Original')).usuario,'Jorge');
  await assert.rejects(autenticar(datos,'jorge','clave original'));
  const nucleo=crearGrupoTerminal(datos,repo,await autenticar(datos,'JORGE','Clave Original')).crear();
  assert.equal(nucleo.rutaActual(),'/home/Jorge');assert.match(nucleo.prompt(),/^Jorge@/);
  const guardar=await crearRecuperacion(repo).verificar('jORGE','Luna secreta');await guardar('Clave Nueva','Clave Nueva');
  assert.equal((await autenticar(await repo.cargar(),'jorge','Clave Nueva')).usuario,'Jorge');
});
test('Crear, consultar, cambiar, agrupar, bloquear y borrar cuentas usan su nombre conservado',async()=>{
  const repo=await contexto(),datos=await repo.cargar(),nucleo=crearGrupoTerminal(datos,repo,await autenticar(datos,'jorge','Clave Original')).crear();
  const ejecutar=async linea=>{const r=await interpretar(linea,nucleo);assert.equal(r.error,undefined,r.texto);return r;};
  await ejecutar('cuenta crear Pedro "Pedro" "Clave Pedro"');
  assert.equal((await interpretar('cuenta crear pEDRO "Otro" "Otra Clave"',nucleo)).error,true);
  assert.match((await ejecutar('perfil pedro')).texto,/Pedro/);
  await ejecutar('creargrupo alumnos');await ejecutar('agregargrupo alumnos pEDRO');assert.deepEqual((await repo.cargar()).grupos.alumnos,['Pedro']);
  await ejecutar('quitargrupo alumnos PEDRO');assert.deepEqual((await repo.cargar()).grupos.alumnos,[]);
  assert.equal((await interpretar('bloquearusuario JORGE',nucleo)).error,true);
  await ejecutar('bloquearusuario pedro');await assert.rejects(autenticar(await repo.cargar(),'PEDRO','Clave Pedro'));
  await ejecutar('desbloquearusuario PEDRO');await autenticar(await repo.cargar(),'pedro','Clave Pedro');
  await ejecutar('cuenta borrar pEDRO confirmar');assert.equal((await repo.cargar()).usuarios.length,1);
  await ejecutar('cuenta crear Ana "Ana" "Clave Ana"');assert.equal((await ejecutar('cambiarusuario ANA')).usuario,'Ana');
});
test('Instalación Live admite usuario con mayúsculas sin convertir su nombre',async()=>{
  let datos;const repo={cargar:async()=>datos??null,guardar:async d=>{datos=d;}};const live=crearLive(repo).crear();
  for(const linea of ['configurar nombre Jorge','configurar usuario Jorge','configurar contrasena "Clave Original"','configurar pregunta mascota','configurar respuesta Luna','formatear confirmar','instalar confirmar'])assert.equal((await interpretar(linea,live)).error,undefined,linea);
  assert.equal(datos.usuario.usuario,'Jorge');assert.equal(instalacionValida(datos),true);
});
test('Electron conserva cuentas y carpetas con mayúsculas tras reabrir',async()=>{
  const raiz=await mkdtemp(path.join(tmpdir(),'kairos-mayusculas-'));
  try{const repo=new AlmacenLocal(raiz,instalacionValida);await instalar(borrador(),repo);
    const datos=await repo.cargar(),nucleo=crearGrupoTerminal(datos,repo,await autenticar(datos,'jorge','Clave Original')).crear();
    assert.equal((await interpretar('crear archivo nota.txt',nucleo)).error,undefined);
    const reabierto=new AlmacenLocal(raiz,instalacionValida),guardado=await reabierto.cargar();
    assert.equal((await autenticar(guardado,'JORGE','Clave Original')).usuario,'Jorge');assert.ok(guardado.archivos.some(n=>n.ruta==='/home/Jorge/nota.txt'));
  }finally{assert.ok(path.resolve(raiz).startsWith(path.resolve(tmpdir())+path.sep));await rm(raiz,{recursive:true,force:true});}
});
