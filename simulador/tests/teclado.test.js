import test from 'node:test';
import assert from 'node:assert/strict';
import { traducirTecla, combinarAcento, usarDistribucion, conectarTeclado } from '../js/core/teclado.js';
import { crearBorrador } from '../js/installer/modelo.js';
import { instalar } from '../js/installer/instalar.js';
import { crearGrupoTerminal } from '../js/core/sesiones-terminal.js';
import { autenticar } from '../js/core/sistema.js';
import { crearLive } from '../js/core/live.js';

const tecla = (code, opciones = {}) => ({ code, shiftKey: false, key: '', ...opciones,
  getModifierState: nombre => !!opciones[nombre] });

test('Distribuciones latinoamericana e inglesa producen símbolos distintos por posición física', () => {
  for (const [code, latino, ingles] of [['Semicolon','ñ',';'], ['Quote','{',"'"], ['Slash','-','/'], ['Minus',"'",'-']]) {
    assert.equal(traducirTecla(tecla(code), 'latinoamericano').texto, latino);
    assert.equal(traducirTecla(tecla(code), 'ingles').texto, ingles);
  }
  assert.equal(traducirTecla(tecla('Digit2', {shiftKey:true}), 'latinoamericano').texto, '"');
  assert.equal(traducirTecla(tecla('Digit2', {shiftKey:true}), 'ingles').texto, '@');
  assert.equal(traducirTecla(tecla('Comma', {shiftKey:true}), 'latinoamericano').texto, ';');
  assert.equal(traducirTecla(tecla('Period', {shiftKey:true}), 'latinoamericano').texto, ':');
});
test('AltGr, bloqueo de mayúsculas y tildes', () => {
  assert.equal(traducirTecla(tecla('KeyQ', {AltGraph:true,ctrlKey:true,altKey:true}), 'latinoamericano').texto, '@');
  assert.equal(traducirTecla(tecla('Digit7', {AltGraph:true}), 'latinoamericano').texto, '\\');
  assert.equal(traducirTecla(tecla('Semicolon', {CapsLock:true}), 'latinoamericano').texto, 'Ñ');
  assert.equal(traducirTecla(tecla('KeyQ', {CapsLock:true}), 'latinoamericano').texto, 'Q');
  assert.equal(traducirTecla(tecla('KeyA', {CapsLock:true,shiftKey:true}), 'ingles').texto, 'a');
  assert.equal(traducirTecla(tecla('BracketLeft'), 'latinoamericano').acento, true);
  for(const [acento, letra, salida] of [['´','a','á'],['´','E','É'],['¨','u','ü'],['´',' ','´'],['´','x','´x']]) assert.equal(combinarAcento(acento,letra),salida);
});
test('Atajos, IME, teclas no imprimibles y distribución heredada conservan manejo nativo', () => {
  for(const opciones of [{ctrlKey:true},{altKey:true},{metaKey:true},{isComposing:true},{ctrlKey:true,altKey:true}]) assert.equal(traducirTecla(tecla('KeyX', opciones),'latinoamericano'), null);
  for(const code of ['ArrowUp','Enter','Backspace','Numpad1']) assert.equal(traducirTecla(tecla(code),'ingles'),null);
  assert.equal(traducirTecla(tecla('KeyA'),'espanol'),null);
});
test('Entrada aplica selección, longitud máxima, contraseñas, composición y cambio de distribución', () => {
  const manejadores={}; conectarTeclado({addEventListener:(tipo,funcion)=>{manejadores[tipo]=funcion;}});
  let distribucion='latinoamericano';usarDistribucion(()=>distribucion);
  let eventos=0;
  const campo={value:'',maxLength:128,selectionStart:0,selectionEnd:0,matches:()=>true,
    ownerDocument:{defaultView:{Event:class{}}}, dispatchEvent:()=>{eventos++;},
    setRangeText(texto,inicio,fin){this.value=this.value.slice(0,inicio)+texto+this.value.slice(fin);this.selectionStart=this.selectionEnd=inicio+texto.length;}};
  const escribir=(code,opciones={})=>{let impedido=false;manejadores.keydown({...tecla(code,opciones),target:campo,preventDefault:()=>{impedido=true;}});return impedido;};
  assert.equal(escribir('Semicolon'),true);assert.equal(campo.value,'ñ');
  escribir('BracketLeft');escribir('KeyA');assert.equal(campo.value,'ñá');
  campo.selectionStart=0;campo.selectionEnd=2;escribir('KeyZ');assert.equal(campo.value,'z');
  campo.maxLength=1;escribir('KeyA');assert.equal(campo.value,'z');campo.maxLength=128;
  escribir('BracketLeft');distribucion='ingles';escribir('KeyA');assert.equal(campo.value,'za');
  assert.equal(escribir('KeyX',{ctrlKey:true}),false);
  campo.readOnly=true;assert.equal(escribir('KeyB'),false);campo.readOnly=false;
  distribucion='latinoamericano';escribir('BracketLeft');manejadores.paste({target:campo});escribir('KeyE');assert.equal(campo.value,'zae');
  escribir('BracketLeft');assert.equal(escribir('Backspace',{key:'Backspace'}),true);escribir('KeyU');assert.equal(campo.value,'zaeu');
  assert.equal(eventos,6);
});
test('La selección del instalador se conserva al recargar y acceder por consola', async () => {
  for(const teclado of ['latinoamericano','ingles']) {
    let estado;
    const repo={guardar:async datos=>{estado=structuredClone(datos);},cargar:async()=>structuredClone(estado)};
    await instalar({...crearBorrador(), respuestaSeguridad: 'respuesta de prueba',teclado,nombre:'Prueba',usuario:'prueba',contrasena:'clave-á123',confirmacion:'clave-á123',confirmarFormato:true},repo);
    const recargado=await repo.cargar();assert.equal(recargado.preferencias.teclado,teclado);
    const sesion=await autenticar(recargado,'prueba','clave-á123');
    assert.equal(crearGrupoTerminal(recargado,repo,sesion).crear().tecladoActual(),teclado);
  }
});
test('Live mantiene coherente la distribución entre configuración, comandos y pestañas', async () => {
  const live = crearLive({}), uno = live.crear(), dos = live.crear();
  await uno.ejecutar('configurar',['teclado','ingles']);
  assert.equal(uno.tecladoActual(),'ingles');assert.equal(dos.tecladoActual(),'ingles');
  assert.equal((await dos.ejecutar('teclado',[])).texto,'ingles');
  await dos.ejecutar('teclado',['latinoamericano']);
  assert.equal(uno.tecladoActual(),'latinoamericano');
});
