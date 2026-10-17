import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKey,validDate,weekDates,monthDates,shiftMonth,prepareEvent,normalizeEvents } from '../resources/js/calendar/model.js';
test('mes y semana usan fechas locales y comienzan en lunes',()=>{
 const date=new Date(2026,9,15);const month=monthDates(date),week=weekDates(date);
 assert.equal(month.length,42);assert.equal(month[0].getDay(),1);assert.equal(week.length,7);assert.equal(week[0].getDay(),1);
 assert.equal(dateKey(week[3]),'2026-10-15');
});
test('navegar meses conserva días válidos y cruza años',()=>{
 assert.equal(dateKey(shiftMonth(new Date(2026,0,31),1)),'2026-02-28');
 assert.equal(dateKey(shiftMonth(new Date(2026,11,15),1)),'2027-01-15');
 assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2028-02-29'),true);
});
test('migrar eventos antiguos conserva título y fecha como evento de todo el día',()=>{
 const events=normalizeEvents([{event_title:'Entrega',event_date:'2026-10-15'},{event_title:'Inválido',event_date:'2026-02-31'},null]);
 assert.equal(events.length,1);assert.equal(events[0].event_title,'Entrega');assert.equal(events[0].allDay,true);assert.equal(events[0].category,'academic');
});
test('el formulario valida intervalos y conserva notas, horario y categoría',()=>{
 const data={event_title:' Reunión ',event_date:'2026-10-15',start:'10:00',end:'11:30',category:'work',description:'Notas',location:'Aula 2'};
 assert.throws(()=>prepareEvent({...data,end:'09:00'}),/posterior/);
 assert.throws(()=>prepareEvent({...data,event_title:' '}),/título/);
 assert.throws(()=>prepareEvent({...data,start:'24:00'}),/hora/);
 const e=prepareEvent(data,'id');assert.equal(e.event_title,'Reunión');assert.equal(e.description,'Notas');assert.equal(e.category,'work');assert.equal(e.id,'id');
});
test('identificadores duplicados no confunden la edición de eventos',()=>{
 const events=normalizeEvents([{id:'x',event_title:'Uno',event_date:'2026-10-15'},{id:'x',event_title:'Dos',event_date:'2026-10-16'}]);assert.notEqual(events[0].id,events[1].id);
});
