import { VirtualSystem } from '../core/virtual-system.js';
import { applications, aliases } from './applications.js';
import { createAppWindow } from '../template.js';

export class SystemController {
    #core = new VirtualSystem();
    #windows = new Map();
    #listeners = new Set();
    #timer;
    constructor() {
        this.#core.subscribe(state => {
            const live = new Set(state.processes.filter(p => p.state !== 'TERMINATED').map(p => p.pid));
            for (const [pid, view] of this.#windows) if (!live.has(pid)) { this.#windows.delete(pid); view.destroy(); }
            for (const listener of this.#listeners) listener(state);
        });
        this.#core.boot(); this.#core.run();
        this.#timer = setInterval(() => this.#core.tick(), 1000);
    }
    getState() { return this.#core.getState(); }
    subscribe(listener) { this.#listeners.add(listener); listener(this.getState()); return () => this.#listeners.delete(listener); }
    launch(id) {
        id = aliases[id] || id;
        const app = applications[id]; if (!app) throw Error('Aplicación no encontrada');
        for (const view of this.#windows.values()) if (view.appId === id) { view.restore(); view.focus(); return view.pid; }
        const pid = this.#core.createProcess({ name: app.title, appId: id, memory: app.memory });
        try {
            const view = createAppWindow({ ...app, pid, onClose: () => this.terminate(pid) });
            view.appId = id; view.pid = pid; this.#windows.set(pid,view);
            return pid;
        } catch (error) { this.#core.terminate(pid); throw error; }
    }
    command(action, ...args) {
        const commands = ['boot','pause','run','step','reset','shutdown','setScheduler','createProcess','requestIO','createResource','acquire','release','setService'];
        if (!commands.includes(action)) throw Error('Acción no disponible');
        // Programar desde el padre antes de destruir el iframe que inició el apagado.
        if (action === 'shutdown') setTimeout(() => window.location.assign(new URL('../../../index.html', import.meta.url).href), 0);
        const result = this.#core[action](...args);
        return result;
    }
    // El clic en el fondo oculta las ventanas; restaurar no termina sus procesos.
    hideWindows() { for (const view of this.#windows.values()) view.minimize(); }
    resetSession(start = true) {
        this.#core.shutdown();
        if (start) { this.#core.boot(); this.#core.run(); }
    }
    terminate(pid) { this.#core.terminate(pid); }
    dispose() { clearInterval(this.#timer); this.#core.shutdown(); this.#listeners.clear(); }
}
