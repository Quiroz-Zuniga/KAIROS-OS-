import { readDesktop, writeDesktop, createItem } from './desktop-store.js';
// Rubén Quiroz: navegador y documentos locales de demostración; sin shell ni ejecutables.
const mode=new URLSearchParams(location.search).get('mode');
const $=selector=>document.querySelector(selector);
const controls=$('#app-controls'),body=$('#app-body');
const status=text=>$('#app-status').textContent=text;
const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
function button(label,action){const b=node('button',label);b.type='button';b.onclick=()=>{try{action();}catch(error){status(error.message);}};return b;}
function heading(title,description){$('#app-heading').textContent=title;document.title=title;$('#app-description').textContent=description;}
const mutate=fn=>{const state=readDesktop();fn(state);writeDesktop(state);};
const catalog=[
    {title:'Wikipedia',terms:'enciclopedia conocimiento wikipedia',description:'Una enciclopedia reúne artículos de consulta. Esta ficha es una muestra local para probar búsquedas.'},
    {title:'Universidad Politécnica de Honduras',terms:'universidad uph honduras',description:'UPHOS es un proyecto académico de simulación de sistemas operativos.'},
    {title:'WinRAR para UPHOS',terms:'winrar descargar rar zip compresion',description:'Descarga de demostración: agrega un instalador virtual a Descargas. No contiene ni ejecuta software real.',download:'WinRAR-demo.exe'},
    {title:'Manual de UPHOS',terms:'ayuda manual archivos escritorio',description:'Usa Inicio para abrir aplicaciones; arrástralas al escritorio y haz clic derecho para ver sus opciones.'}
];
function browser(){
    heading('Chrome','Busca en el catálogo de demostración o abre una búsqueda web en una pestaña del navegador.');
    const form=node('form'),input=node('input');input.type='search';input.placeholder='Buscar en UPHOS';input.setAttribute('aria-label','Buscar');input.required=true;const submit=node('button','Buscar');submit.type='submit';form.append(input,submit);controls.append(form);
    const results=query=>{
        body.replaceChildren();const q=query.trim().toLocaleLowerCase('es');
        const found=catalog.filter(entry=>!q||(entry.title+' '+entry.terms).toLocaleLowerCase('es').includes(q));
        if(!found.length)body.append(node('p','Sin resultados en el catálogo local. Puedes continuar con una búsqueda web.'));
        found.forEach(entry=>{const article=node('article');article.append(node('h2',entry.title),node('p',entry.description));if(entry.download)article.append(button('Descargar en UPHOS',()=>{
            const state=readDesktop();if(state.items.some(x=>!x.deleted&&x.parent==='downloads'&&x.name===entry.download)){status('El archivo ya está en Descargas.');return;}
            createItem('download',entry.download,'downloads');status('Descarga virtual completada. Abre el Explorador y selecciona Descargas.');
        }));body.append(article);});
        if(q){const link=node('a','Buscar en la web: '+query);link.href='https://www.google.com/search?q='+encodeURIComponent(query);link.target='_blank';link.rel='noopener noreferrer';body.append(link);}
    };
    form.onsubmit=event=>{event.preventDefault();results(input.value);};results('');
}
let folder='desktop';
function files(){
    const recycle=mode==='recycle';heading(recycle?'Papelera de reciclaje':'Explorador de archivos',recycle?'Restaura elementos eliminados del escritorio virtual.':'Documentos guardados dentro de UPHOS, separados de los archivos del equipo.');
    controls.replaceChildren();controls.append(button('Escritorio',()=>{folder='desktop';renderFiles();}),button('Descargas',()=>{folder='downloads';renderFiles();}));
    if(recycle)controls.replaceChildren();
    renderFiles();
    const open=event=>{openFile(event.detail);window.parent.uphosSelectedItem=null;};
    window.parent.addEventListener('uphos:open-item',open);
    window.addEventListener('pagehide',()=>window.parent.removeEventListener('uphos:open-item',open),{once:true});
    const selected=window.parent.uphosSelectedItem;window.parent.uphosSelectedItem=null;if(selected&&!recycle)openFile(selected);
}
function renderFiles(){
    body.replaceChildren();status('');const state=readDesktop();const recycle=mode==='recycle';
    body.append(node('h2',recycle?'Elementos eliminados':folder==='desktop'?'Escritorio':folder==='downloads'?'Descargas':state.items.find(x=>x.id===folder)?.name||'Carpeta'));
    if(!recycle && folder!=='desktop'&&folder!=='downloads')body.append(button('Subir',()=>{folder=state.items.find(x=>x.id===folder)?.parent||'desktop';renderFiles();}));
    const items=state.items.filter(x=>recycle?x.deleted:!x.deleted&&x.parent===folder);
    if(!items.length)body.append(node('p','Esta carpeta está vacía.'));
    for(const item of items){const row=node('div');row.className='file-row';const open=button(item.name,()=>openFile(item.id));open.className='file-open';row.append(open,node('small',item.kind));
        if(recycle){row.append(button('Restaurar',()=>{mutate(s=>s.items.find(x=>x.id===item.id).deleted=false);renderFiles();}));}
        else row.append(button('Eliminar',()=>{mutate(s=>s.items.find(x=>x.id===item.id).deleted=true);renderFiles();}));body.append(row);
    }
}
function openFile(id){
    const item=readDesktop().items.find(x=>x.id===id);if(!item||item.deleted){renderFiles();return;}
    if(item.kind==='folder'){folder=id;renderFiles();return;}
    if(item.kind==='shortcut'){window.parent.uphos.launch(item.app);return;}
    body.replaceChildren();body.append(button('Volver',renderFiles),node('h2',item.name));
    if(item.kind==='download'){body.append(node('p','Instalador de demostración. UPHOS no ejecuta archivos EXE ni instala programas en el equipo.'));return;}
    if(item.kind==='zip'){body.append(node('p','Contenedor comprimido virtual vacío. No es un ZIP exportable.'));return;}
    const label=node('label','Contenido del documento');const area=node('textarea');area.value=item.content||'';area.setAttribute('aria-label','Contenido del documento');label.append(area);body.append(label);
    if(item.kind==='word')body.append(node('p','Documento de Word simulado: editor de texto sin formato DOCX exportable.'));
    body.append(button('Guardar',()=>{mutate(s=>{const current=s.items.find(x=>x.id===id);if(!current||current.deleted)throw Error('El documento ya no está disponible.');current.content=area.value;});status('Documento guardado en UPHOS.');}));
}
function demo(){
    const configs={camara:['Cámara','Vista previa de demostración. No accede a cámara ni micrófono.'],webadpp:['Clima','Datos de ejemplo para la presentación.'],video:['Videos','Reproductor de demostración sin archivos del equipo.'],spotify:['UPHOS Beats','Controles virtuales sin salida de audio.'],imagenes:['Imágenes','Galería de demostración de UPHOS.']};
    const [title,description]=configs[mode]||['Aplicación','Demostración de UPHOS'];heading(title,description);
    const preview=node('div',mode==='webadpp'?'☀ 26 °C · Tegucigalpa':mode==='camara'?'◉ Vista previa virtual':mode==='imagenes'?'Paisaje UPHOS':'▶ En pausa');preview.className='virtual-preview';body.append(preview);
    if(mode==='camara')controls.append(button('Capturar imagen virtual',()=>{createItem('text','Captura-'+Date.now()+'.txt');status('Captura de demostración agregada al escritorio.');}));
    if(mode==='video'||mode==='spotify'){let playing=false;controls.append(button('Reproducir / Pausar',()=>{playing=!playing;preview.textContent=playing?'▶ Reproduciendo demostración':'▶ En pausa';}));}
}
try{if(mode==='browser')browser();else if(mode==='files'||mode==='recycle')files();else demo();}catch(error){status(error.message);}
