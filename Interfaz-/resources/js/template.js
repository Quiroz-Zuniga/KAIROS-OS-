let stack = 200;
export class WindowManager {
    constructor(element, onClose) {
        this.window = element; this.onClose = onClose;
        this.isMinimized = false; this.isMaximized = false;
        this.events = new AbortController();
        const listen = (target, event, handler) => target.addEventListener(event, handler, { signal: this.events.signal });
        const bar = element.querySelector('.title-bar');
        listen(element, 'pointerdown', () => this.focus());
        const frame = element.querySelector('iframe');
        listen(frame, 'load', () => {
            try { listen(frame.contentWindow, 'pointerdown', () => this.focus()); }
            catch { /* Una navegación externa conserva su frontera de origen. */ }
        });
        listen(bar, 'pointerdown', event => {
            if (this.isMaximized || event.target.closest('button') || event.button !== 0) return;
            const rect = element.getBoundingClientRect();
            this.drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            bar.setPointerCapture(event.pointerId);
        });
        listen(bar, 'pointermove', event => {
            if (!this.drag) return;
            element.style.left = Math.max(0, Math.min(event.clientX-this.drag.x, innerWidth-element.offsetWidth))+'px';
            element.style.top = Math.max(56, Math.min(event.clientY-this.drag.y, innerHeight-100))+'px';
        });
        listen(bar, 'pointerup', () => { this.drag = null; });
        listen(bar, 'pointercancel', () => { this.drag = null; });
        listen(bar, 'dblclick', event => { if (!event.target.closest('button')) this.toggleMaximize(); });
        listen(element.querySelector('.minimize-btn'), 'click', () => this.minimize());
        listen(element.querySelector('.maximize-btn'), 'click', () => this.toggleMaximize());
        listen(element.querySelector('.close-btn'), 'click', () => this.onClose());
        this.restoreBtn = document.createElement('button');
        this.restoreBtn.className = 'uph-restore'; this.restoreBtn.textContent = element.querySelector('.app-title').textContent;
        this.restoreBtn.hidden = true; this.restoreBtn.setAttribute('aria-label','Restaurar '+this.restoreBtn.textContent);
        document.querySelector('#restaurar-ventanas').append(this.restoreBtn);
        listen(this.restoreBtn,'click', () => this.restore());
        listen(window,'resize', () => this.constrain());
        this.window.style.left = Math.max(0,(innerWidth-this.window.offsetWidth)/2)+'px';
        this.window.style.top = 56+Math.max(0,(innerHeight-150-this.window.offsetHeight)/2)+'px';
        this.focus();
    }
    focus() {
        document.querySelectorAll('.window.is-focused').forEach(el => el.classList.remove('is-focused'));
        this.window.classList.add('is-focused'); this.window.style.zIndex = ++stack;
        // Reducir el contador antes de alcanzar el nivel reservado a menús.
        if (stack > 9000) { document.querySelectorAll('.window').forEach((el,i) => el.style.zIndex = 200+i); stack = 200+document.querySelectorAll('.window').length; this.window.style.zIndex = ++stack; }
    }
    constrain() {
        this.window.style.left = Math.max(0,Math.min(parseFloat(this.window.style.left)||0,innerWidth-this.window.offsetWidth))+'px';
        this.window.style.top = Math.max(56,Math.min(parseFloat(this.window.style.top)||56,innerHeight-100))+'px';
    }
    minimize() { this.isMinimized = true; this.window.hidden = true; this.restoreBtn.hidden = false; }
    restore() { this.isMinimized = false; this.window.hidden = false; this.restoreBtn.hidden = true; this.focus(); }
    toggleMaximize() { this.isMaximized = !this.isMaximized; this.window.classList.toggle('maximized',this.isMaximized); }
    destroy() {
        this.events.abort();
        const frame = this.window.querySelector('iframe');
        // Destruir el documento libera sus timers, listeners y reproductores.
        if (frame) {
            try { frame.contentWindow?.dispatchEvent(new Event('pagehide')); } catch { /* Documento de otro origen. */ }
            frame.src = 'about:blank'; frame.remove();
        }
        this.restoreBtn.remove(); this.window.remove();
    }
}
export function createAppWindow({ title, icon, htmlUrl, pid, onClose, width = 800, height = 600 }) {
    const container = document.querySelector('#windowsContainer');
    if (!container) throw Error('Escritorio no disponible');
    const element = document.createElement('div'); element.className = 'window'; element.id = 'window_'+pid;
    element.style.setProperty('--window-width',width+'px'); element.style.setProperty('--window-height',height+'px');
    element.dataset.pid = pid; element.setAttribute('role','region'); element.setAttribute('aria-label',title);
    element.innerHTML = `<div class="title-bar"><div class="title"><img class="app-icon" alt=""><span class="app-title"></span></div>
        <div class="window-controls"><button class="control-btn minimize-btn" aria-label="Minimizar" title="Minimizar"></button>
        <button class="control-btn maximize-btn" aria-label="Maximizar o restaurar" title="Maximizar o restaurar"></button>
        <button class="control-btn close-btn" aria-label="Cerrar" title="Cerrar"></button></div></div><div class="app-content"></div>`;
    element.querySelector('.app-title').textContent = title; element.querySelector('.app-icon').src = icon;
    const frame = document.createElement('iframe'); frame.src = htmlUrl; frame.title = title;
    frame.setAttribute('sandbox','allow-same-origin allow-scripts allow-popups allow-forms allow-downloads');
    element.querySelector('.app-content').append(frame); container.append(element);
    return new WindowManager(element,onClose);
}
