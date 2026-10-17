import { categories,dateKey,weekDates,monthDates,shiftMonth,minutes,prepareEvent,normalizeEvents } from './calendar/model.js';
const $=selector=>document.querySelector(selector), preferences=window.KAIROSPreferences;
const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
const weekdays=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const format=(date,options)=>date.toLocaleDateString('es-HN',options);
let anchor=new Date(),view='month',editingId=null,events=normalizeEvents(preferences.read('calendar-events',[],Array.isArray));
const filtered=()=>events.filter(e=>document.querySelector(`.calendar-filters input[value="${e.category}"]`)?.checked && `${e.event_title} ${e.description} ${e.location}`.toLocaleLowerCase().includes($('#calendar-search').value.toLocaleLowerCase()));
const sorted=items=>[...items].sort((a,b)=>a.event_date.localeCompare(b.event_date)||(a.allDay?-1:0)-(b.allDay?-1:0)||a.start.localeCompare(b.start));
function editEvent(event=null,date=dateKey(anchor),hour='09:00') {
    editingId=event?.id||null;const form=$('#event-form');form.reset();
    const values=event||{event_title:'',event_date:date,start:hour,end:`${String(Math.min(23,Number(hour.slice(0,2))+1)).padStart(2,'0')}:${hour.startsWith('23')?'59':'00'}`,category:'academic',description:'',location:''};
    for(const name of ['event_title','event_date','start','end','category','description','location'])form.elements[name].value=values[name];
    $('#event-all-day').checked=event?.allDay||false;$('#event-hours').hidden=$('#event-all-day').checked;
    $('#event-delete').hidden=!event;$('#event-error').textContent='';$('#event-dialog-title').textContent=event?'Editar evento':'Nuevo evento';$('#event-dialog').showModal();$('#event-title').focus();
}
function chip(event,className='event-chip') {
    const button=create('button',className);button.style.setProperty('--event-color',categories[event.category].color);
    button.textContent=(event.allDay?'':`${event.start} `)+event.event_title;button.title=`${event.event_title} · ${event.allDay?'Todo el día':event.start+'–'+event.end}`;
    button.addEventListener('click',()=>editEvent(event));return button;
}
function renderMini() {
    $('#mini-title').textContent=format(anchor,{month:'long',year:'numeric'});
    const grid=$('#mini-grid');grid.replaceChildren();
    monthDates(anchor).forEach(date=>{const button=create('button','',date.getDate());button.classList.toggle('is-outside',date.getMonth()!==anchor.getMonth());button.classList.toggle('is-today',dateKey(date)===dateKey(new Date()));button.classList.toggle('is-selected',dateKey(date)===dateKey(anchor));button.setAttribute('aria-label',format(date,{dateStyle:'full'}));button.addEventListener('click',()=>{anchor=date;render();});grid.append(button);});
    const upcoming=$('#calendar-upcoming');upcoming.replaceChildren();
    const next=sorted(filtered()).filter(e=>e.event_date>=dateKey(new Date())).slice(0,3);
    next.forEach(event=>{const button=create('button','upcoming-entry');button.append(create('strong','',event.event_title),create('span','',format(new Date(event.event_date+'T12:00:00'),{day:'numeric',month:'short'})+' · '+(event.allDay?'Todo el día':event.start)));button.addEventListener('click',()=>editEvent(event));upcoming.append(button);});
    if(!next.length)upcoming.append(create('p','muted','Un poco de espacio libre. Añade tu próximo evento.'));
}
function renderMonth(content,list) {
    const header=create('div','month-weekdays');weekdays.forEach(day=>header.append(create('span','',day)));content.append(header);
    const grid=create('div','month-grid');grid.id='calendar-grid';
    monthDates(anchor).forEach(date=>{
        const key=dateKey(date),cell=create('div','month-day');cell.classList.toggle('outside',date.getMonth()!==anchor.getMonth());cell.classList.toggle('today',key===dateKey(new Date()));
        const button=create('button','day-select',date.getDate());button.dataset.date=key;button.setAttribute('aria-label',`Crear evento el ${format(date,{dateStyle:'full'})}`);button.addEventListener('click',()=>editEvent(null,key));cell.append(button);
        const dayEvents=sorted(list.filter(e=>e.event_date===key)),limit=innerHeight>=700?2:1;dayEvents.slice(0,limit).forEach(e=>cell.append(chip(e)));
        if(dayEvents.length>limit){const more=create('button','more-events',`+${dayEvents.length-limit} más`);more.addEventListener('click',()=>{anchor=date;view='agenda';$('#calendar-view').value=view;render();});cell.append(more);}
        grid.append(cell);
    });content.append(grid);
}
function placements(items) {
    const groups=[];for(const event of [...items].sort((a,b)=>minutes(a.start)-minutes(b.start))){let group=groups.at(-1);if(!group||minutes(event.start)>=group.end){group={end:0,events:[],lanes:[]};groups.push(group);}let lane=group.lanes.findIndex(end=>end<=minutes(event.start));if(lane<0)lane=group.lanes.length;group.lanes[lane]=minutes(event.end);group.end=Math.max(group.end,minutes(event.end));group.events.push({event,lane});}
    return groups.flatMap(group=>group.events.map(item=>({...item,columns:group.lanes.length})));
}
function renderWeek(content,list) {
    const dates=weekDates(anchor),scroll=create('div','week-scroll'),table=create('div','week-table'),header=create('div','week-header');header.append(create('div'));
    dates.forEach((date,i)=>{const day=create('div',dateKey(date)===dateKey(new Date())?'today':'',weekdays[i]);day.append(create('strong','',date.getDate()));header.append(day);});table.append(header);
    const allDay=create('div','all-day-row');allDay.append(create('div','all-day-label','Todo el día'));
    dates.forEach(date=>{const column=create('div');list.filter(e=>e.event_date===dateKey(date)&&e.allDay).forEach(e=>column.append(chip(e)));allDay.append(column);});table.append(allDay);
    const body=create('div','week-body'),hours=create('div','week-hours');for(let h=0;h<24;h++)hours.append(create('div','',`${String(h).padStart(2,'0')}:00`));body.append(hours);
    dates.forEach(date=>{
        const key=dateKey(date),column=create('div','week-column');
        for(let hour=0;hour<24;hour++){const slot=create('button','week-slot');slot.setAttribute('aria-label',`Crear evento ${format(date,{weekday:'long',day:'numeric'})} a las ${hour}:00`);slot.addEventListener('click',()=>editEvent(null,key,`${String(hour).padStart(2,'0')}:00`));column.append(slot);}
        placements(list.filter(e=>e.event_date===key&&!e.allDay)).forEach(({event,lane,columns})=>{
            const button=chip(event,'event-chip week-event');button.replaceChildren(create('strong','',event.event_title),create('span','',`${event.start}–${event.end}`));
            button.style.top=`${minutes(event.start)/60*52}px`;button.style.height=`${Math.max(23,(minutes(event.end)-minutes(event.start))/60*52-3)}px`;
            button.style.left=`calc(${lane/columns*100}% + 3px)`;button.style.width=`calc(${100/columns}% - 6px)`;column.append(button);
        });body.append(column);
    });table.append(body);scroll.append(table);content.append(scroll);scroll.scrollTop=7*52;
}
function renderAgenda(content,list) {
    const end=new Date(anchor);end.setDate(end.getDate()+30);
    const items=sorted(list).filter(e=>e.event_date>=dateKey(anchor)&&e.event_date<dateKey(end));
    const agenda=create('div','agenda-list');
    for(const key of [...new Set(items.map(e=>e.event_date))]) {
        const date=new Date(key+'T12:00:00'),group=create('section','agenda-group'),label=create('div','agenda-date',format(date,{weekday:'short'}));label.append(create('strong','',date.getDate()),create('span','',format(date,{month:'short'})));group.append(label);
        const entries=create('div','agenda-events');items.filter(e=>e.event_date===key).forEach(event=>{
            const button=create('button','agenda-event'),dot=create('span','category-dot');dot.style.background=categories[event.category].color;
            const info=create('div');info.append(create('strong','',event.event_title));if(event.location)info.append(create('small','',event.location));if(event.description)info.append(create('small','',event.description.slice(0,100)));
            button.append(create('span','agenda-time',event.allDay?'Todo el día':`${event.start}–${event.end}`),dot,info);button.addEventListener('click',()=>editEvent(event));entries.append(button);
        });group.append(entries);agenda.append(group);
    }
    if(!items.length){const empty=create('div','empty-state');empty.append(create('h2','','Tu agenda tiene espacio'),create('p','','No hay eventos en los próximos 30 días con estos filtros.'));const add=create('button','primary-button','Crear evento');add.addEventListener('click',()=>editEvent());empty.append(add);agenda.append(empty);}content.append(agenda);
}
function render() {
    const list=filtered();$('#calendar-count').textContent=`${list.length} ${list.length===1?'evento':'eventos'}`;
    let title=format(anchor,{month:'long',year:'numeric'});
    if(view==='week'){const dates=weekDates(anchor);title=`${format(dates[0],{day:'numeric',month:'short'})} – ${format(dates[6],{day:'numeric',month:'short',year:'numeric'})}`;}
    if(view==='agenda')title='Agenda · '+format(anchor,{day:'numeric',month:'long'});
    $('#calendar-period').textContent=title.charAt(0).toLocaleUpperCase()+title.slice(1);renderMini();
    const content=$('#calendar-content');content.replaceChildren();({month:renderMonth,week:renderWeek,agenda:renderAgenda}[view])(content,list);
}
function save(next,message,undo=null) {
    if(!preferences.write('calendar-events',next)){ $('#event-error').textContent='No se pudo guardar. Revisa el almacenamiento del navegador.';return; }
    events=next;$('#event-dialog').close();$('#calendar-feedback').replaceChildren(document.createTextNode(message));if(undo){const button=create('button','','Deshacer');button.addEventListener('click',undo);$('#calendar-feedback').append(button);}render();
}
$('#calendar-create').addEventListener('click',()=>editEvent());
$('#calendar-create-mobile').addEventListener('click',()=>editEvent());
$('#calendar-today').addEventListener('click',()=>{anchor=new Date();render();});
for(const [selector,delta] of [['#calendar-previous',-1],['#calendar-next',1]])$(selector).addEventListener('click',()=>{if(view==='month')anchor=shiftMonth(anchor,delta);else {anchor=new Date(anchor);anchor.setDate(anchor.getDate()+delta*(view==='week'?7:30));}render();});
$('#calendar-view').addEventListener('change',event=>{view=event.target.value;render();});
$('#calendar-search').addEventListener('input',render);document.querySelectorAll('.calendar-filters input').forEach(input=>input.addEventListener('change',render));
$('#event-all-day').addEventListener('change',event=>$('#event-hours').hidden=event.target.checked);
document.querySelectorAll('[data-event-close]').forEach(button=>button.addEventListener('click',()=>$('#event-dialog').close()));
$('#event-form').addEventListener('submit',event=>{
    event.preventDefault();$('#event-error').textContent='';const data=Object.fromEntries(new FormData(event.target));data.allDay=$('#event-all-day').checked;
    try {const item=prepareEvent(data,editingId||crypto.randomUUID());save(editingId?events.map(e=>e.id===editingId?item:e):[...events,item],editingId?'Evento actualizado.':'Evento guardado.');}catch(error){$('#event-error').textContent=error.message;}
});
$('#event-delete').addEventListener('click',()=>{const removed=events.find(e=>e.id===editingId);save(events.filter(e=>e.id!==editingId),'Evento eliminado.',()=>save([...events,removed],'Evento recuperado.'));});
render();
