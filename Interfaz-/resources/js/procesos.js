import { applications } from './system/applications.js';
const controller = window.parent !== window ? window.parent.uphos : null;
const $ = selector => document.querySelector(selector);
const states = { NEW:'Preparando',READY:'Listo',RUNNING:'En ejecución',BLOCKED:'En espera',TERMINATED:'Finalizado' };
const devices = { disk0:['Disco virtual','fa-hard-drive'],keyboard0:['Teclado','fa-keyboard'],mouse0:['Ratón','fa-computer-mouse'],display0:['Pantalla','fa-display'],network0:['Red virtual','fa-network-wired'],audio0:['Audio virtual','fa-volume-high'] };
const colors = ['#303070','#E8A810','#6666A0','#3e7485','#a47845','#8b739e'];
let latest, active = 'processes';
const node = (tag,className,text) => { const el = document.createElement(tag); if(className) el.className = className; if(text !== undefined) el.textContent = text; return el; };
const processName = pid => latest?.processes.find(p => p.pid === pid)?.name || `Proceso ${pid}`;
function perform(fn, target = $('#monitor-error')) {
    try { target.textContent = ''; fn(); return true; } catch(error) { target.textContent = error.message; return false; }
}
function options(select,items) {
    const signature = JSON.stringify(items);
    if(select.dataset.options === signature) return;
    const selected = select.value; select.replaceChildren(...items.map(([id,name]) => new Option(name,id)));
    if(items.some(([id])=>String(id)===selected)) select.value = selected;
    select.dataset.options = signature;
}
function stats() {
    const live = latest.processes.filter(p=>p.state !== 'TERMINATED'), cpu = latest.clock ? Math.round(latest.cpu.busyTicks/latest.clock*100) : 0;
    $('#resumen').textContent = `RAM ${latest.memory.used}/${latest.memory.total} MB · Paso virtual ${latest.clock}`;
    $('#cpu-value').textContent = `${cpu}%`;
    $('#cpu-caption').textContent = latest.cpu.pid === null ? 'El procesador está libre' : processName(latest.cpu.pid);
    $('#cpu-meter').value = cpu;
    $('#memory-value').textContent = `${Math.round(latest.memory.used/latest.memory.total*100)}%`;
    $('#memory-caption').textContent = `${latest.memory.used} de ${latest.memory.total} MB`;
    $('#memory-meter').value = latest.memory.used/latest.memory.total*100;
    $('#process-value').textContent = live.length;
    $('#process-caption').textContent = `${live.filter(p=>p.type==='application').length} aplicaciones abiertas`;
    $('#waiting-value').textContent = latest.queues.blocked.length;
    $('#clock-caption').textContent = `Tiempo virtual · ${latest.clock} pasos`;
    $('#run-status').textContent = latest.status === 'running' ? 'En marcha' : latest.status === 'paused' ? 'En pausa' : 'Detenido';
    $('#run-status').className = 'status-pill '+(latest.status === 'running'?'running':'stopped');
    document.querySelector('[data-action="pause"]').disabled = latest.status !== 'running';
    document.querySelector('[data-action="run"]').disabled = latest.status === 'running';
}
function renderProcesses() {
    const search = $('#process-search').value.toLocaleLowerCase();
    const live = latest.processes.filter(p=>p.state !== 'TERMINATED' && `${p.pid} ${p.name}`.toLocaleLowerCase().includes(search));
    const body = $('#procesos'), ids = new Set(live.map(p=>String(p.pid)));
    for(const row of [...body.children]) if(!ids.has(row.dataset.pid)) row.remove();
    for(const p of live) {
        let row = body.querySelector(`[data-pid="${p.pid}"]`);
        if(!row) {
            row = node('tr'); row.dataset.pid = p.pid;
            for(let i=0;i<6;i++) row.append(node('td'));
            const label = node('div','process-name'); const app = applications[p.appId];
            if(app) { const img=node('img'); img.src=app.icon; img.alt=''; label.append(img); }
            else label.append(node('span','process-avatar','T'));
            label.append(node('span','',p.name)); row.children[1].append(label);
            const io = node('button','row-action','E/S'); io.dataset.operation='io'; io.title='Esperar al disco virtual durante dos pasos'; io.setAttribute('aria-label',`Solicitar E/S para ${p.name}`);
            const stop = node('button','row-action','Finalizar'); stop.dataset.operation='terminate'; stop.setAttribute('aria-label',`Finalizar ${p.name}`);
            row.children[5].append(io,stop); body.append(row);
        }
        row.children[0].textContent=p.pid;
        row.children[2].replaceChildren(node('span','status-pill '+(p.state==='RUNNING'?'running':p.state==='BLOCKED'?'waiting':'stopped'),states[p.state]));
        row.children[3].textContent=`${p.memory} MB`; row.children[4].textContent=p.cpuTicks;
        row.querySelector('[data-operation="io"]').disabled=p.state==='BLOCKED';
    }
    $('#process-empty').hidden=live.length>0;
}
function renderMemory() {
    const live=latest.processes.filter(p=>p.state!=='TERMINATED');
    $('#memory-free').textContent=`${latest.memory.total-latest.memory.used} MB libres`;
    const segments=$('#memory-segments'), legend=$('#memory-legend'); segments.replaceChildren();legend.replaceChildren();
    live.forEach((p,i)=>{
        const bar=node('span');bar.style.width=`${p.memory/latest.memory.total*100}%`;bar.style.background=colors[i%colors.length];bar.title=`${p.name}: ${p.memory} MB`;segments.append(bar);
        const item=node('span'),dot=node('i','legend-dot');dot.style.background=colors[i%colors.length];item.append(dot,document.createTextNode(`${p.name} · ${p.memory} MB`));legend.append(item);
    });
    const queues=$('#queue-cards');queues.replaceChildren();
    for(const [title,ids] of [['En ejecución',latest.cpu.pid === null?[]:[latest.cpu.pid]],['Listos para continuar',latest.queues.ready],['Esperando',latest.queues.blocked]]) {
        const card=node('article','queue-card');card.append(node('h3','',title));const chips=node('div','queue-chips');
        ids.forEach(id=>chips.append(node('span','',processName(id))));if(!ids.length)card.append(node('p','','Sin tareas en esta cola'));card.append(chips);queues.append(card);
    }
    if(document.activeElement !== $('#politica')) $('#politica').value=latest.scheduler.policy;
    if(document.activeElement !== $('#quantum')) $('#quantum').value=latest.scheduler.quantum;
}
function renderDevices() {
    const cards=$('#device-cards');cards.replaceChildren();
    latest.devices.forEach(device=>{
        const card=node('article','device-card'),symbol=node('div','device-symbol'),icon=node('i','fa-solid '+devices[device.id][1]);icon.setAttribute('aria-hidden','true');symbol.append(icon);
        card.append(symbol,node('h3','',devices[device.id][0]),node('p','',`Identificador: ${device.id}`),node('span','status-pill '+(device.status==='busy'?'waiting':'running'),device.status==='busy'?'Atendiendo solicitudes':'Disponible'));cards.append(card);
    });
    const requests=$('#io-requests');requests.replaceChildren();
    latest.io.forEach(io=>{const row=node('div','io-row'),label=node('div');label.append(node('strong','',processName(io.pid)),node('p','',devices[io.device][0]));row.append(label,node('span','status-pill waiting',`${io.remaining} pasos restantes`));requests.append(row);});
    if(!latest.io.length)requests.append(node('p','empty-state','Todo está al día. No hay solicitudes de entrada/salida pendientes.'));
}
function renderResources() {
    const cards=$('#resource-cards');cards.replaceChildren();
    latest.resources.forEach(r=>{const card=node('article','resource-card');card.append(node('h3','',r.id),node('p','',r.capacity===1?'Acceso exclusivo':`${r.capacity} accesos simultáneos`),node('p','',`Utilizando: ${r.owners.map(processName).join(', ')||'Nadie'}`),node('p','',`En espera: ${r.waiters.map(processName).join(', ')||'Sin tareas'}`));cards.append(card);});
    if(!latest.resources.length)cards.append(node('p','empty-state','Crea tu primer recurso compartido para empezar.'));
    options($('#recurso-id'),latest.resources.map(r=>[r.id,r.id]));
    options($('#resource-process'),latest.processes.filter(p=>p.state!=='TERMINATED').map(p=>[p.pid,`${p.name} (#${p.pid})`]));
    $('#operar-recurso').querySelectorAll('button').forEach(b=>b.disabled=!latest.resources.length);
}
function describeEvent(e) {
    const p=e.pid?processName(e.pid):'';
    const text={boot:'UPHOS se inició',run:'La simulación continúa',pause:'La simulación se puso en pausa',reset:'Se reinició la simulación',shutdown:'El sistema se apagó',created:`Se creó ${p}`,ready:`${p} está listo`,dispatched:`El procesador atiende a ${p}`,terminated:`${p} finalizó`,'io-requested':`${p} solicitó ${devices[e.device]?.[0]||'un dispositivo'}`,'io-completed':`${p} completó su entrada/salida`,'resource-created':`Se creó el recurso ${e.id}`,'resource-acquire':`${p} solicitó acceso a ${e.id}`,'resource-release':`${p} liberó ${e.id}`,'resource-granted':`${e.id} se asignó a ${p}`,scheduler:`Se cambió la planificación a ${e.policy}`,service:'Se actualizó el estado del servicio del escritorio'};
    return text[e.type]||'El sistema se actualizó';
}
function renderActivity() {
    const services=$('#service-cards');services.replaceChildren();
    latest.services.forEach(s=>{const row=node('div','service-row'),label=node('div');label.append(node('strong','','Servicio del escritorio'),node('p','','Registro lógico de la simulación'));const toggle=node('button','secondary-button',s.status==='running'?'Marcar inactivo':'Marcar activo');toggle.addEventListener('click',()=>perform(()=>controller.command('setService',s.id,s.status!=='running')));row.append(label,node('span','status-pill '+(s.status==='running'?'running':'stopped'),s.status==='running'?'Activo':'Inactivo'),toggle);services.append(row);});
    const timeline=$('#event-timeline');timeline.replaceChildren();
    latest.events.slice(-40).reverse().forEach(e=>{const item=node('li'),label=node('div','',describeEvent(e));label.append(node('small','',`Paso virtual ${e.tick}`));item.append(node('span','event-marker'),label);timeline.append(item);});
}
function renderView() { ({processes:renderProcesses,memory:renderMemory,devices:renderDevices,resources:renderResources,activity:renderActivity}[active])(); }
$('#monitor-tabs').addEventListener('click',event=>{
    const button=event.target.closest('[data-panel]');if(!button)return;active=button.dataset.panel;
    document.querySelectorAll('[data-panel]').forEach(b=>{b.classList.toggle('active',b===button);if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    document.querySelectorAll('[data-view]').forEach(panel=>panel.hidden=panel.dataset.view!==active);if(latest)renderView();
});
if(controller) {
    const unsubscribe=controller.subscribe(state=>{latest=state;stats();renderView();});window.addEventListener('pagehide',unsubscribe,{once:true});
    $('#procesos').addEventListener('click',event=>{const button=event.target.closest('[data-operation]');if(!button)return;const pid=Number(button.closest('[data-pid]').dataset.pid);perform(()=>button.dataset.operation==='terminate'?controller.terminate(pid):controller.command('requestIO',pid,'disk0',2));});
    $('#process-search').addEventListener('input',renderProcesses);
    $('#new-process').addEventListener('click',()=>{$('#process-form-error').textContent='';$('#process-dialog').showModal();});
    document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>$('#process-dialog').close()));
    document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>perform(()=>controller.command(b.dataset.action))));
    $('#planificar').addEventListener('click',()=>perform(()=>controller.command('setScheduler',$('#politica').value,Number($('#quantum').value))));
    $('#escenario').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.target));if(perform(()=>controller.command('createProcess',{name:data.name,memory:Number(data.memory),burst:Number(data.burst),priority:Number(data.priority),type:'simulation'}),$('#process-form-error')))$('#process-dialog').close();});
    $('#recurso').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);perform(()=>controller.command('createResource',data.get('id'),Number(data.get('capacity'))));});
    $('#operar-recurso').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.target);perform(()=>controller.command(event.submitter.value,Number(data.get('pid')),data.get('id')));});
} else { $('#monitor-error').textContent='Abre «Ver procesos» desde la barra de aplicaciones del escritorio.';document.querySelectorAll('input,select,button:not([data-panel])').forEach(el=>el.disabled=true); }
