import test from 'node:test';
import assert from 'node:assert/strict';
import { VirtualSystem } from '../resources/js/core/virtual-system.js';
const boot = options => { const s = new VirtualSystem(options); s.boot(); return s; };
const process = (s,options={}) => s.createProcess({name:'Proceso',...options});
function invariants(s) {
    const v = s.getState(), live = v.processes.filter(p => p.state !== 'TERMINATED');
    assert.equal(v.memory.used,live.reduce((sum,p) => sum+p.memory,0));
    assert.equal(v.memory.used,v.memory.allocations.reduce((sum,a) => sum+a.size,0));
    assert.ok(v.memory.used <= v.memory.total && v.memory.used >= 0);
    const running = live.filter(p => p.state === 'RUNNING'); assert.ok(running.length <= 1);
    assert.equal(v.cpu.pid,running[0]?.pid ?? null);
    assert.deepEqual(JSON.parse(JSON.stringify(v)),v);
}
test('validación, boot y pausa no avanzan el reloj',() => {
    assert.throws(() => new VirtualSystem({memory:-1})); const s=new VirtualSystem();
    assert.throws(() => process(s));s.boot();s.tick();assert.equal(s.getState().clock,0);
    s.run();s.tick();s.pause();s.tick();assert.equal(s.getState().clock,1);
    s.step();assert.equal(s.getState().clock,2);s.shutdown();assert.throws(() => s.step());
});
test('admisión atómica y liberación de RAM',() => {
    const s=boot({memory:64});const pid=process(s,{memory:64});assert.throws(() => process(s,{memory:1}),/insuficiente/);
    assert.equal(s.getState().processes.length,1);s.terminate(pid);assert.equal(s.getState().memory.used,0);assert.throws(() => s.terminate(pid));invariants(s);
});
for (const [policy,expected] of [['FCFS',1],['SJF',2],['Priority',2]]) test(policy+' elige el proceso esperado sin expropiar',() => {
    const s=boot({policy});process(s,{burst:5,priority:5});process(s,{burst:2,priority:1});s.step();assert.equal(s.getState().cpu.pid,expected);
    s.step();invariants(s);
});
test('Round Robin rota al agotar el quantum',() => {
    const s=boot({quantum:2});const a=process(s),b=process(s);s.step();s.step();assert.equal(s.getState().cpu.pid,a);s.step();assert.equal(s.getState().cpu.pid,b);invariants(s);
});
test('E/S bloquea, libera CPU, completa al tick y se cancela al terminar',() => {
    const s=boot();const a=process(s);s.step();s.requestIO(a,'disk0',2);assert.equal(s.getState().cpu.pid,null);
    s.step();assert.equal(s.getState().processes[0].state,'BLOCKED');s.step();assert.equal(s.getState().processes[0].state,'RUNNING');
    s.requestIO(a,'network0',3);s.terminate(a);assert.equal(s.getState().io.length,0);invariants(s);
});
for(const capacity of [1,2]) test('recursos FIFO capacidad '+capacity,() => {
    const s=boot();s.createResource('r',capacity);const ids=Array.from({length:capacity+2},()=>process(s));
    for(const id of ids)s.acquire(id,'r');assert.equal(s.getState().queues.blocked.length,2);
    s.terminate(ids.at(-1));s.release(ids[0],'r');assert.ok(s.getState().resources[0].owners.includes(ids[capacity]));
    s.terminate(ids[capacity]);assert.equal(s.getState().resources[0].waiters.length,0);invariants(s);
});
test('rechaza transiciones inválidas sin mutar el estado',() => {
    const s=boot();const pid=process(s);s.requestIO(pid);const before=s.getState();
    assert.throws(() => s.requestIO(pid));assert.throws(() => s.acquire(pid,'ausente'));assert.throws(() => s.setScheduler('falso'));
    assert.deepEqual(s.getState(),before);invariants(s);
});
test('snapshots independientes, eventos y procesos terminados acotados',() => {
    const s=boot();const snapshot=s.getState();snapshot.memory.total=0;assert.equal(s.getState().memory.total,1024);
    let notifications=0;const off=s.subscribe(()=>notifications++);
    for(let i=0;i<250;i++){const pid=process(s,{burst:1});s.step();invariants(s);assert.equal(s.getState().processes.at(-1).pid,pid);}
    off();const previous=notifications;s.step();assert.equal(notifications,previous);
    assert.ok(s.getState().events.length<=200);assert.equal(s.getState().processes.length,100);
});
test('reset no reutiliza PID y limpia solicitudes y recursos',() => {
    const s=boot();const a=process(s);s.createResource('r');s.requestIO(a);s.reset();const b=process(s);
    assert.ok(b>a);assert.equal(s.getState().clock,0);assert.equal(s.getState().io.length,0);assert.equal(s.getState().resources.length,0);invariants(s);
});
test('servicios y dispositivos son virtuales y consultables',() => {
    const s=boot();s.setService('desktop',false);assert.equal(s.getState().services[0].status,'stopped');
    assert.equal(s.getState().devices.length,6);assert.throws(() => s.setService('host',true));
});
test('escenario mixto conserva invariantes en cada tick y política',() => {
    const s=boot({memory:512});for(let i=0;i<8;i++)process(s,{memory:32,burst:3+i,priority:8-i});
    s.createResource('disk-lock');s.acquire(1,'disk-lock');s.acquire(2,'disk-lock');s.requestIO(3,'disk0',3);
    for(const policy of ['FCFS','SJF','Priority','Round Robin']){s.setScheduler(policy);for(let i=0;i<25;i++){s.step();invariants(s);}}
    assert.equal(s.getState().memory.used,0);
});
