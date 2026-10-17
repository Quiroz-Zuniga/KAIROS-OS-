export const categories = { academic:{label:'Universidad',color:'#303070'},personal:{label:'Personal',color:'#846010'},work:{label:'Trabajo',color:'#39717e'} };
export const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function validDate(value) { return typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value+'T12:00:00').getTime()) && dateKey(new Date(value+'T12:00:00'))===value; }
export function weekDates(anchor) { const start=new Date(anchor.getFullYear(),anchor.getMonth(),anchor.getDate());start.setDate(start.getDate()-(start.getDay()+6)%7);return Array.from({length:7},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i)); }
export function monthDates(anchor) { const start=weekDates(new Date(anchor.getFullYear(),anchor.getMonth(),1))[0];return Array.from({length:42},(_,i)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+i)); }
export function shiftMonth(anchor,delta) { const date=new Date(anchor.getFullYear(),anchor.getMonth()+delta,1);date.setDate(Math.min(anchor.getDate(),new Date(date.getFullYear(),date.getMonth()+1,0).getDate()));return date; }
export const minutes = value => Number(value.slice(0,2))*60+Number(value.slice(3));
export function prepareEvent(data,id=crypto.randomUUID()) {
    const title=String(data.event_title||'').trim(),date=data.event_date;
    if(!title || title.length>140)throw Error('Escribe un título de hasta 140 caracteres.');
    if(!validDate(date))throw Error('Selecciona una fecha válida.');
    const allDay=!!data.allDay,start=data.start||'09:00',end=data.end||'10:00';
    if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))throw Error('Revisa la hora del evento.');
    if(!allDay && minutes(end)<=minutes(start))throw Error('La hora de fin debe ser posterior a la de inicio.');
    return {id,event_title:title,event_date:date,start,end,allDay,category:categories[data.category]?data.category:'academic',description:String(data.description||'').slice(0,2000),location:String(data.location||'').slice(0,200)};
}
export function normalizeEvents(items) {
    const ids=new Set(),events=[];
    for(const item of items) {
        if(!item || typeof item!=='object')continue;
        try {const id=typeof item.id==='string'&&!ids.has(item.id)?item.id:crypto.randomUUID();const event=prepareEvent({...item,allDay:item.allDay??!item.start},id);ids.add(id);events.push(event);}catch { /* Conservar las entradas válidas de preferencias antiguas. */ }
    }
    return events;
}
