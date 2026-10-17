import { traducir as t } from '../../js/core/i18n.js';
import { rutaVisible } from '../../js/core/herramientas.js';
// In-console text editor. Saving goes through the kernel and its revision checks.
export function montarEditor(contenedor, documento, guardar, cerrar) {
  const panel=document.createElement('section');panel.className='editor-archivo';panel.setAttribute('aria-label',t('editor.titulo'));
  const titulo=document.createElement('div');titulo.className='editor-titulo';titulo.textContent=t('editor.titulo')+' · '+rutaVisible(documento.ruta);
  const area=document.createElement('textarea');area.spellcheck=false;area.setAttribute('aria-label',t('editor.contenido'));area.value=documento.contenido;
  const estado=document.createElement('p');estado.setAttribute('role','status');
  const ayuda=document.createElement('pre');ayuda.textContent=t('editor.atajos');
  panel.append(titulo,area,estado,ayuda);contenedor.append(panel);area.focus();
  let original=documento.contenido, ocupado=false, confirmar=false;
  const salir=()=>{panel.remove();cerrar();};
  async function salvar(salirDespues=false){
    if(ocupado)return;ocupado=true;area.disabled=true;estado.textContent=t('editor.guardando');
    try{await guardar(area.value,original);original=area.value;confirmar=false;estado.textContent=t('editor.guardado');if(salirDespues)salir();}
    catch(e){estado.textContent=t(e.message);}
    finally{ocupado=false;area.disabled=false;if(area.isConnected)area.focus();}
  }
  panel.addEventListener('keydown',e=>{
    e.stopPropagation();if(ocupado){e.preventDefault();return;}
    if(confirmar && !e.ctrlKey){
      e.preventDefault();if(['s','y'].includes(e.key.toLowerCase()))void salvar(true);else if(e.key.toLowerCase()==='n')salir();else if(e.key==='Escape'){confirmar=false;estado.textContent=t('editor.cancelado');}return;
    }
    if(e.ctrlKey && ['g','x','o','s','c'].includes(e.key.toLowerCase())){
      e.preventDefault();const k=e.key.toLowerCase();
      if(k==='g'){ayuda.textContent=ayuda.textContent===t('editor.atajos')?t('editor.ayuda'):t('editor.atajos');}
      else if(k==='o'||k==='s')void salvar();
      else if(k==='c'){confirmar=false;estado.textContent=t('editor.cancelado');}
      else if(area.value===original)salir();else{confirmar=true;estado.textContent=t('editor.confirmar');}
    }
  });
  area.addEventListener('input',()=>{estado.textContent=area.value===original?'':t('editor.modificado');});
}
