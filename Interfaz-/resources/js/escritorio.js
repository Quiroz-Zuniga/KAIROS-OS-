import { applications } from './system/applications.js';
import { SystemController } from './system/controller.js';
import { initializeDockMenu } from './system/dock-menu.js';
import { initializeHardwarePanel } from './system/hardware.js';
import { readDesktop, writeDesktop, createItem } from './system/desktop-store.js';

// Rubén Quiroz: interacción gráfica; la consola y el instalador tienen su propio alcance.
const $ = selector => document.querySelector(selector);
const controller = new SystemController();
window.uphos = controller;
let noticeTimer, dragging, selected, dialogAction;
function notify(message) {
    $('#uph-notice').textContent = message; $('#uph-notice').hidden = false;
    clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('#uph-notice').hidden = true, 6000);
}
function safe(action) { try { action(); } catch (error) { notify(error.message); } }
function launch(id) { closePanels(); safe(() => controller.launch(id)); }
function closePanels() {
    for (const id of ['menu-inicio','power-menu','contextMenuEscritorio','hardware-panel','dock-menu']) $('#'+id).hidden = true;
    for (const node of document.querySelectorAll('[aria-expanded]')) node.setAttribute('aria-expanded','false');
}
function place(panel, x, y) {
    panel.hidden = false;
    panel.style.left = Math.max(8, Math.min(x, innerWidth-panel.offsetWidth-8))+'px';
    panel.style.top = Math.max(60, Math.min(y, innerHeight-panel.offsetHeight-8))+'px';
}
function toggle(panel, trigger) {
    const open = panel.hidden; closePanels();
    if (open) { panel.hidden = false; const rect = trigger.getBoundingClientRect(); place(panel,rect.left,rect.top > innerHeight/2 ? rect.top-panel.offsetHeight-16 : rect.bottom+8); trigger.setAttribute('aria-expanded','true'); }
}
// Los diálogos usan texto plano; nombres y propiedades nunca se insertan como HTML.
function showDialog(title, detail, value, action) {
    closePanels(); dialogAction = action;
    $('#dialog-title').textContent = title; $('#dialog-detail').textContent = detail;
    $('#name-label').hidden = value === null; $('#item-name').required = value !== null;
    $('#item-name').value = value || ''; $('#dialog-error').textContent = '';
    $('#desktop-dialog').showModal();
    if (value !== null) { $('#item-name').focus(); $('#item-name').select(); }
}
$('#desktop-dialog form').addEventListener('submit', event => {
    if (event.submitter?.value !== 'ok') return;
    try { dialogAction?.($('#item-name').value); }
    catch (error) { event.preventDefault(); $('#dialog-error').textContent = error.message; }
});
function openItem(item) {
    if (item.kind === 'shortcut') return launch(item.app);
    window.uphosSelectedItem = item.id;
    launch('explorer');
    window.dispatchEvent(new CustomEvent('uphos:open-item',{detail:item.id}));
    // El explorador recién creado lee la selección al cargar.
}
function iconFor(item) { return applications[item.app]?.icon || (['text','word'].includes(item.kind) ? applications.editor.icon : applications.explorer.icon); }
function renderIcons() {
    const state = readDesktop(); const host = $('#desktop-icons'); host.replaceChildren(); host.dataset.size = state.size;
    state.items.filter(item => !item.deleted && (item.kind === 'shortcut' || item.parent === 'desktop')).forEach(item => {
        const button = document.createElement('button'); button.className = 'icono-escritorio'; button.dataset.id = item.id;
        button.style.left = Math.max(0,Math.min(item.x || 20,innerWidth-110))+'px';
        button.style.top = Math.max(64,Math.min(item.y || 76,innerHeight-180))+'px'; button.draggable = true;
        const image = document.createElement('img'); image.src = iconFor(item); image.alt = ''; image.draggable = false;
        const name = document.createElement('span'); name.textContent = item.name; button.append(image,name);
        button.addEventListener('click', () => openItem(item));
        button.addEventListener('dragstart', event => { dragging = { id:item.id }; event.dataTransfer.setData('text/plain',item.id); });
        button.addEventListener('dragend', () => dragging = null);
        button.addEventListener('contextmenu', event => { event.preventDefault(); event.stopPropagation(); context(event,item); });
        host.append(button);
    });
}
function context(event, item = null) {
    closePanels(); selected = item; const menu = $('#contextMenuEscritorio'); menu.replaceChildren();
    function option(label, action) { const button = document.createElement('button'); button.textContent = label; button.onclick = () => { closePanels(); safe(action); }; menu.append(button); }
    function group(title, choices) { const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = title; details.append(summary); for (const [label,action] of choices) { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { closePanels(); safe(action); }; details.append(b); } menu.append(details); }
    const mutate = fn => { const state=readDesktop(); fn(state); writeDesktop(state); };
    if (item) {
        option('Abrir', () => openItem(item));
        if (item.kind === 'shortcut') option('Ejecutar como administrador', () => showDialog('Administrador simulado', item.name+' se abrirá dentro de UPHOS. No concede permisos sobre el equipo.', null, () => launch(item.app)));
        else if (['text','word'].includes(item.kind)) group('Abrir con', [['Editor de texto', () => { window.uphosSelectedItem=item.id; launch('editor'); window.dispatchEvent(new CustomEvent('uphos:open-editor',{detail:item.id})); }],['Editor de documentos', () => openItem(item)]]);
        option('Propiedades', () => showDialog('Propiedades de '+item.name, 'Tipo: '+item.kind+' · Ubicación: Escritorio de UPHOS · '+(item.app ? 'Aplicación: '+applications[item.app]?.title : 'Contenido virtual guardado en este navegador.'), null));
        if (item.id !== 'recycle') option(item.kind === 'shortcut' ? 'Quitar acceso del escritorio' : 'Mover a la papelera', () => mutate(state => { state.items.find(x=>x.id===item.id).deleted = true; }));
    } else {
        group('Ver', [['Iconos grandes',()=>mutate(s=>s.size='large')],['Iconos medianos',()=>mutate(s=>s.size='medium')],['Iconos pequeños',()=>mutate(s=>s.size='small')]]);
        group('Ordenar por', [['Nombre',()=>sort('name')],['Tipo',()=>sort('kind')],['Fecha de creación',()=>sort('created')]]);
        option('Actualizar', () => { renderIcons(); applyWallpaper(); notify('Escritorio actualizado.'); });
        group('Nuevo', [['Carpeta',()=>newItem('folder','Nueva carpeta')],['Documento de texto',()=>newItem('text','Nota.txt')],['Documento de Word',()=>newItem('word','Documento.docx')],['Carpeta comprimida',()=>newItem('zip','Archivo.zip')]]);
        option('Propiedades',()=>showDialog('Propiedades del escritorio', 'UPHOS · '+innerWidth+' × '+innerHeight+' · Archivos y dispositivos simulados.',null));
    }
    place(menu,event.clientX,event.clientY); menu.querySelector('button,summary')?.focus();
}
function newItem(kind,name) { showDialog('Crear '+name, 'Se guardará en el escritorio virtual.',name,value=>createItem(kind,value)); }
function sort(field) {
    const state=readDesktop(); const items=state.items.filter(x=>!x.deleted && (x.kind==='shortcut'||x.parent==='desktop'));
    items.sort((a,b)=>field==='created'?(a.created||0)-(b.created||0):String(a[field]).localeCompare(String(b[field]),'es'));
    const rows=Math.max(1,Math.floor((innerHeight-220)/105));
    items.forEach((item,i)=>{item.x=20+Math.floor(i/rows)*115;item.y=76+(i%rows)*105;}); writeDesktop(state);
}
// Un único origen de arrastre evita listeners duplicados y admite mover accesos guardados.
function draggable(button,id) {
    button.draggable=true; button.addEventListener('dragstart',event=>{dragging={app:id};event.dataTransfer.setData('text/plain',id);});
    button.addEventListener('dragend',()=>dragging=null);
}
const appsHost=$('#start-apps');
Object.values(applications).forEach(app=>{
    const b=document.createElement('button'); b.className='app-launch';b.dataset.app=app.id;
    const img=document.createElement('img');img.src=app.icon;img.alt='';img.draggable=false;
    const text=document.createElement('span');text.textContent=app.title;b.append(img,text);b.onclick=()=>launch(app.id);draggable(b,app.id);appsHost.append(b);
});
$('#app-search').addEventListener('input',event=>{
    const term=event.target.value.toLocaleLowerCase('es');let count=0;
    for(const b of appsHost.children){b.hidden=!b.textContent.toLocaleLowerCase('es').includes(term);if(!b.hidden)count++;}
    $('#app-empty').hidden=count>0;
});
$('#boton-inicio').onclick=()=>{toggle($('#menu-inicio'),$('#boton-inicio'));if(!$('#menu-inicio').hidden)$('#app-search').focus();};
$('#power-button').onclick=()=>toggle($('#power-menu'),$('#power-button'));
$('#start-power').onclick=()=>{closePanels();place($('#power-menu'),20,innerHeight-300);};
for(const b of document.querySelectorAll('[data-launch]')) {b.onclick=()=>launch(b.dataset.launch);draggable(b,b.dataset.launch);}
const surface=$('#desktop-surface');
surface.addEventListener('dragover',event=>{if(dragging)event.preventDefault();});
surface.addEventListener('drop',event=>{
    event.preventDefault();const drag=dragging;dragging=null;if(!drag || event.target.closest('.barra-tareas,.barra-superior,.desktop-popover'))return;
    safe(()=>{const state=readDesktop();let item=state.items.find(x=>x.id===drag.id);
        if(!item){const app=applications[drag.app];if(!app)return;item={id:crypto.randomUUID(),name:app.title,app:app.id,kind:'shortcut',created:Date.now()};state.items.push(item);}
        item.x=Math.max(0,Math.min(event.clientX-40,innerWidth-110));item.y=Math.max(64,Math.min(event.clientY-30,innerHeight-180));writeDesktop(state);closePanels();
    });
});
surface.addEventListener('contextmenu',event=>{if(event.target===surface||event.target===$('#desktop-icons')){event.preventDefault();context(event);}});
surface.addEventListener('click',event=>{
    if(event.target===surface||event.target===$('#desktop-icons')){closePanels();controller.hideWindows();}
});
document.addEventListener('click',event=>{if(!event.target.closest('.desktop-popover,#boton-inicio,#power-button,.hardware-trigger,#dock-options'))closePanels();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanels();});
// Bloqueo y suspensión conservan ventanas. Reinicio y apagado cierran solo procesos virtuales.
for(const b of document.querySelectorAll('[data-power]'))b.onclick=()=>{
    const action=b.dataset.power;closePanels();
    if(action==='restart'||action==='off')controller.resetSession(action==='restart');else controller.command('pause');
    const labels={lock:['Escritorio bloqueado','Desbloquear'],restart:['UPHOS reiniciado','Entrar a UPHOS'],sleep:['UPHOS en suspensión','Reanudar'],off:['UPHOS apagado','Encender']};
    $('#session-title').textContent=labels[action][0];$('#session-description').textContent='Tus archivos virtuales se conservan.';$('#session-resume').textContent=labels[action][1];$('#session-screen').hidden=false;
    $('#session-resume').onclick=()=>{$('#session-screen').hidden=true;if(action==='off')controller.resetSession(true);else controller.command('run');};$('#session-resume').focus();
};
$('#calendar').onclick=()=>launch('calendar');
$('#pantalla-completa').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('No se pudo activar la pantalla completa.');}};
function applyWallpaper(){const value=UPHOSPreferences.wallpaper();if(value)surface.style.backgroundImage='url('+JSON.stringify(value)+')';}
applyWallpaper();window.addEventListener('storage',()=>{applyWallpaper();renderIcons();});document.addEventListener('uphos:wallpaper',applyWallpaper);
window.addEventListener('uphos:desktop-change',renderIcons);window.addEventListener('resize',()=>{renderIcons();closePanels();});
const updateClock=()=>$('.hora_actual').textContent=new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'});
updateClock();const clock=setInterval(updateClock,1000);
controller.subscribe(state=>{for(const b of document.querySelectorAll('[data-launch]'))b.classList.toggle('is-running',state.processes.some(p=>p.appId===b.dataset.launch&&p.state!=='TERMINATED'));});
initializeDockMenu(()=>controller.launch('procesos'));initializeHardwarePanel();renderIcons();
window.addEventListener('pagehide',()=>{clearInterval(clock);controller.dispose();},{once:true});
