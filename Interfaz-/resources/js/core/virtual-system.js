// Núcleo virtual determinista. No usa DOM, almacenamiento, red ni reloj del anfitrión.
const POLICIES = ['FCFS', 'SJF', 'Priority', 'Round Robin'];
const DEVICES = ['disk0', 'keyboard0', 'mouse0', 'display0', 'network0', 'audio0'];
const integer = (value, min = 1) => Number.isSafeInteger(value) && value >= min;
const copy = value => structuredClone(value);

export class VirtualSystem {
    #state;
    #nextPid = 1;
    #sequence = 0;
    #listeners = new Set();
    constructor({ memory = 1024, quantum = 2, policy = 'Round Robin' } = {}) {
        if (!integer(memory) || !integer(quantum) || !POLICIES.includes(policy)) throw Error('Configuración virtual inválida');
        this.#state = { status: 'initialized', clock: 0, cpu: { pid: null, busyTicks: 0, slice: 0 },
            scheduler: { policy, quantum }, memory: { total: memory, used: 0, allocations: [] },
            processes: [], io: [], resources: [], services: [{ id: 'desktop', status: 'stopped' }],
            devices: DEVICES.map(id => ({ id, status: 'available' })), events: [] };
    }
    subscribe(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }
    getState() {
        const s = copy(this.#state);
        s.devices.forEach(device => device.status = s.io.some(io => io.device === device.id) ? 'busy' : 'available');
        s.queues = { ready: s.processes.filter(p => p.state === 'READY').sort((a,b) => a.readyOrder-b.readyOrder).map(p => p.pid),
            blocked: s.processes.filter(p => p.state === 'BLOCKED').map(p => p.pid) };
        return s;
    }
    #event(type, detail = {}) {
        this.#state.events.push({ sequence: ++this.#sequence, tick: this.#state.clock, type, ...detail });
        this.#state.events = this.#state.events.slice(-200);
    }
    #publish() { for (const listener of this.#listeners) listener(this.getState()); }
    #active() { if (!['paused','running'].includes(this.#state.status)) throw Error('El sistema virtual no está iniciado'); }
    #process(pid) {
        const p = this.#state.processes.find(p => p.pid === pid && p.state !== 'TERMINATED');
        if (!p) throw Error('Proceso no disponible');
        return p;
    }
    #ready(p) { p.state = 'READY'; p.waitingFor = null; p.readyOrder = ++this.#sequence; }
    #detach(p) {
        if (this.#state.cpu.pid === p.pid) { this.#state.cpu.pid = null; this.#state.cpu.slice = 0; }
    }
    boot() {
        if (['paused','running'].includes(this.#state.status)) return this.getState();
        this.#state.status = 'paused'; this.#state.services[0].status = 'running';
        this.#event('boot'); this.#publish(); return this.getState();
    }
    run() { this.#active(); this.#state.status = 'running'; this.#event('run'); this.#publish(); }
    pause() { this.#active(); this.#state.status = 'paused'; this.#event('pause'); this.#publish(); }
    createProcess({ name, appId = null, memory = 32, burst = null, priority = 5, type = 'application', owner = null, session = null } = {}) {
        this.#active();
        if (![appId,owner,session].every(value => value === null || typeof value === 'string')) throw Error('Identidad de proceso inválida');
        if (typeof name !== 'string' || !name.trim() || !integer(memory) || (burst !== null && !integer(burst)) || !integer(priority,0) || !['application','system','service','simulation'].includes(type)) throw Error('Proceso inválido');
        if (this.#state.memory.used + memory > this.#state.memory.total) throw Error('Memoria virtual insuficiente');
        const p = { pid: this.#nextPid++, name: name.trim().slice(0,100), appId, type, owner, session,
            state: 'NEW', memory, burst, remaining: burst, priority, cpuTicks: 0, createdAt: this.#state.clock, waitingFor: null };
        this.#state.processes.push(p); this.#state.memory.used += memory;
        this.#state.memory.allocations.push({ pid: p.pid, size: memory });
        this.#event('created', { pid: p.pid, state: 'NEW' }); this.#ready(p);
        this.#event('ready', { pid: p.pid }); this.#publish(); return p.pid;
    }
    #terminate(p) {
        this.#detach(p); p.state = 'TERMINATED'; p.finishedAt = this.#state.clock; p.waitingFor = null;
        this.#state.memory.used -= p.memory;
        this.#state.memory.allocations = this.#state.memory.allocations.filter(a => a.pid !== p.pid);
        this.#state.io = this.#state.io.filter(i => i.pid !== p.pid);
        for (const r of this.#state.resources) {
            r.waiters = r.waiters.filter(pid => pid !== p.pid);
            if (r.owners.includes(p.pid)) { r.owners = r.owners.filter(pid => pid !== p.pid); this.#wakeResource(r); }
        }
        // Historial acotado; los procesos vivos nunca se descartan.
        const history = this.#state.processes.filter(p => p.state === 'TERMINATED').slice(-100);
        this.#state.processes = this.#state.processes.filter(p => p.state !== 'TERMINATED' || history.includes(p));
        this.#event('terminated', { pid: p.pid });
    }
    terminate(pid) { this.#active(); this.#terminate(this.#process(pid)); this.#publish(); }
    setScheduler(policy, quantum = this.#state.scheduler.quantum) {
        this.#active();
        if (!POLICIES.includes(policy) || !integer(quantum)) throw Error('Planificación inválida');
        if (this.#state.cpu.pid !== null) this.#ready(this.#process(this.#state.cpu.pid));
        this.#state.cpu.pid = null; this.#state.cpu.slice = 0;
        this.#state.scheduler = { policy, quantum }; this.#event('scheduler', { policy, quantum }); this.#publish();
    }
    requestIO(pid, device = 'disk0', ticks = 2) {
        this.#active(); const p = this.#process(pid);
        if (!DEVICES.includes(device) || !integer(ticks) || !['READY','RUNNING'].includes(p.state)) throw Error('Solicitud de E/S inválida');
        this.#detach(p); p.state = 'BLOCKED'; p.waitingFor = device;
        this.#state.io.push({ pid, device, remaining: ticks }); this.#event('io-requested', { pid, device }); this.#publish();
    }
    createResource(id, capacity = 1) {
        this.#active();
        if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,40}$/.test(id) || !integer(capacity) || this.#state.resources.some(r => r.id === id)) throw Error('Recurso inválido o existente');
        this.#state.resources.push({ id, kind: capacity === 1 ? 'mutex' : 'semaphore', capacity, owners: [], waiters: [] });
        this.#event('resource-created', { id }); this.#publish();
    }
    acquire(pid, id) {
        this.#active(); const p = this.#process(pid), r = this.#state.resources.find(r => r.id === id);
        if (!r || !['READY','RUNNING'].includes(p.state) || r.owners.includes(pid)) throw Error('Adquisición de recurso inválida');
        if (r.owners.length < r.capacity) r.owners.push(pid);
        else { this.#detach(p); p.state = 'BLOCKED'; p.waitingFor = id; r.waiters.push(pid); }
        this.#event('resource-acquire', { pid, id }); this.#publish();
    }
    #wakeResource(r) {
        while (r.waiters.length && r.owners.length < r.capacity) {
            const pid = r.waiters.shift(), p = this.#process(pid);
            r.owners.push(pid); this.#ready(p); this.#event('resource-granted', { pid, id: r.id });
        }
    }
    release(pid, id) {
        this.#active(); this.#process(pid); const r = this.#state.resources.find(r => r.id === id);
        if (!r || !r.owners.includes(pid)) throw Error('El proceso no posee el recurso');
        r.owners = r.owners.filter(owner => owner !== pid); this.#wakeResource(r);
        this.#event('resource-release', { pid, id }); this.#publish();
    }
    setService(id, running) {
        this.#active(); const s = this.#state.services.find(s => s.id === id);
        if (!s || typeof running !== 'boolean') throw Error('Servicio inválido');
        s.status = running ? 'running' : 'stopped'; this.#event('service', { id, status: s.status }); this.#publish();
    }
    #advance() {
        this.#state.clock++;
        for (const io of [...this.#state.io]) {
            if (--io.remaining === 0) {
                this.#state.io = this.#state.io.filter(i => i !== io); this.#ready(this.#process(io.pid));
                this.#event('io-completed', { pid: io.pid, device: io.device });
            }
        }
        const cpu = this.#state.cpu, scheduler = this.#state.scheduler;
        if (cpu.pid !== null && scheduler.policy === 'Round Robin' && cpu.slice >= scheduler.quantum) {
            this.#ready(this.#process(cpu.pid)); cpu.pid = null; cpu.slice = 0;
        }
        if (cpu.pid === null) {
            const ready = this.#state.processes.filter(p => p.state === 'READY').sort((a,b) => {
                if (scheduler.policy === 'SJF') return (a.remaining ?? Infinity) - (b.remaining ?? Infinity) || a.readyOrder - b.readyOrder;
                if (scheduler.policy === 'Priority') return a.priority - b.priority || a.readyOrder - b.readyOrder;
                return a.readyOrder - b.readyOrder;
            });
            if (ready.length) { const p = ready[0]; p.state = 'RUNNING'; cpu.pid = p.pid; cpu.slice = 0; this.#event('dispatched', { pid: p.pid }); }
        }
        if (cpu.pid !== null) {
            const p = this.#process(cpu.pid); p.cpuTicks++; cpu.busyTicks++; cpu.slice++;
            if (p.remaining !== null && --p.remaining === 0) this.#terminate(p);
        }
        this.#publish();
    }
    step() { this.#active(); this.#advance(); return this.getState(); }
    tick() { if (this.#state.status === 'running') this.#advance(); return this.getState(); }
    shutdown() {
        for (const p of [...this.#state.processes]) if (p.state !== 'TERMINATED') this.#terminate(p);
        this.#state.status = 'stopped'; this.#state.services.forEach(s => s.status = 'stopped');
        this.#event('shutdown'); this.#publish();
    }
    reset() {
        this.shutdown(); this.#state.processes = []; this.#state.clock = 0;
        this.#state.cpu = { pid: null, busyTicks: 0, slice: 0 }; this.#state.resources = []; this.#state.events = [];
        this.boot(); this.#event('reset'); this.#publish();
    }
}
