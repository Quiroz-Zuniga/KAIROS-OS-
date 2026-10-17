import test from 'node:test';
import assert from 'node:assert/strict';
import { montarAccesoConsola } from '../apps/consola/acceso.js';
import { traducir as t } from '../js/core/i18n.js';
import { contextoTerminal } from './soporte/terminal.js';
import { crearCredencial } from '../js/core/credenciales.js';
import { prepararRestauracion } from '../js/core/restauracion.js';

// Prueba del controlador de acceso con elementos controlados, sin navegador.
function vista(repositorio) {
  const anterior=globalThis.document;
  globalThis.document={body:{classList:{remove(){},add(){}}}};
  const manejadores={},formulario={addEventListener:(nombre,funcion)=>{manejadores[nombre]=funcion;}};
  const input={value:'',isConnected:true,focus(){},setAttribute(){},addEventListener:(nombre,funcion)=>{manejadores['input:'+nombre]=funcion;}};
  const salida={textContent:''},prompt={textContent:''},error={textContent:''};
  const contenedor={querySelector:selector=>({input,pre:salida,label:prompt,'.error':error,form:formulario})[selector]};
  let accesos=0,restauraciones=0;montarAccesoConsola(contenedor,repositorio,()=>{accesos++;},'',()=>{restauraciones++;});
  return {input,salida,prompt,error,accesos:()=>accesos,restauraciones:()=>restauraciones,
    enviar:async valor=>{input.value=valor;await manejadores.submit({preventDefault(){}});},
    tecla:key=>manejadores['input:keydown']({key,preventDefault(){}}),
    cerrar:()=>{globalThis.document=anterior;}};
}
test('recuperar abre recuperación sin depender de F2 y Escape vuelve al acceso',async()=>{
  let lecturas=0;
  const ui=vista({cargar:async()=>{lecturas++;return null;}});
  try {
    for(const comando of ['recuperar',' RECUPERAR ']) {
      const antes=lecturas;
      await ui.enviar(comando);
      assert.equal(ui.prompt.textContent,t('seguridad.usuario'));assert.equal(ui.input.type,'text');
      assert.equal(lecturas,antes);assert.equal(ui.accesos(),0);
      await ui.enviar('desconocido');assert.equal(ui.error.textContent,t('seguridad.noDisponible'));
      ui.tecla('Escape');assert.equal(ui.prompt.textContent,t('acceso.consoleUsuario'));
    }
    ui.tecla('F2');assert.equal(ui.prompt.textContent,t('seguridad.usuario'));
  }finally{ui.cerrar();}
});
test('restaurar solicita confirmar; entrada incorrecta y Escape no borran',async()=>{
  let borrados=0;
  const ui=vista({cargar:async()=>({revision:2,fecha:'instalacion'}),borrarInstalacion:async()=>{borrados++;}});
  try {
    await ui.enviar('restaurar');assert.equal(ui.prompt.textContent,t('restauracion.prompt'));assert.equal(ui.input.type,'text');
    assert.equal(borrados,0);assert.match(ui.salida.textContent,/eliminarán/);
    await ui.enviar('si');assert.equal(borrados,0);assert.equal(ui.error.textContent,t('restauracion.errorConfirmacion'));
    ui.tecla('Escape');await ui.enviar('confirmar');assert.equal(ui.input.type,'password');assert.equal(borrados,0);
    ui.tecla('Escape');await ui.enviar('restaurar');await ui.enviar('confirmar');assert.equal(borrados,1);assert.equal(ui.restauraciones(),1);assert.equal(ui.accesos(),0);
  }finally{ui.cerrar();}
});
test('El acceso no abre instalación limpia si falla el borrado',async()=>{
  const ui=vista({cargar:async()=>({revision:0,fecha:'instalacion'}),borrarInstalacion:async()=>{throw new Error('terminal.errorConflicto');}});
  try{await ui.enviar('restaurar');await ui.enviar('confirmar');assert.equal(ui.restauraciones(),0);assert.equal(ui.error.textContent,t('terminal.errorConflicto'));}
  finally{ui.cerrar();}
});
test('El núcleo confirma el borrado de la revisión capturada y rechaza repetirlo',async()=>{
  let datos={revision:3,fecha:'instalacion'},borrados=0;
  const restaurar=await prepararRestauracion({cargar:async()=>datos,borrarInstalacion:async(r,f)=>{assert.equal(r,3);assert.equal(f,'instalacion');borrados++;datos=null;}});
  await assert.rejects(restaurar('si'),/errorConfirmacion/);assert.equal(borrados,0);
  await restaurar('confirmar');assert.equal(datos,null);await assert.rejects(restaurar('confirmar'),/errorConflicto/);assert.equal(borrados,1);
});
test('Una instalación nueva o modificada no se elimina con una confirmación vieja',async()=>{
  let datos={revision:0,fecha:'vieja'};
  const restaurar=await prepararRestauracion({cargar:async()=>datos,borrarInstalacion:async(r,f)=>{if(r!==datos.revision||f!==datos.fecha)throw new Error('terminal.errorConflicto');datos=null;}});
  datos={revision:0,fecha:'nueva'};await assert.rejects(restaurar('confirmar'),/errorConflicto/);assert.equal(datos.fecha,'nueva');
  await assert.rejects(prepararRestauracion({cargar:async()=>null}),/noInstalacion/);
});
test('restaurar no se interpreta como comando en el campo de contraseña',async()=>{
  let lecturas=0;
  const {repositorio}=contextoTerminal();
  const datos=await repositorio.cargar();datos.usuario.credencial=await crearCredencial('clave de prueba');
  const ui=vista({cargar:async()=>{lecturas++;return structuredClone(datos);}});
  try {
    await ui.enviar('ana');assert.equal(ui.input.type,'password');
    await ui.enviar('restaurar');assert.equal(lecturas,1);assert.equal(ui.error.textContent,t('error.acceso'));
    assert.equal(ui.accesos(),0);assert.equal(ui.prompt.textContent,t('acceso.consoleUsuario'));
    await ui.enviar('usuario restaurar');assert.equal(ui.input.type,'password');
    assert.ok(ui.salida.textContent.includes('restaurar'));
  }finally{ui.cerrar();}
});
