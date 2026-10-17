// Rubén Quiroz: volumen exclusivo de la interfaz; no accede al disco del anfitrión.
const key = 'kairos.desktop.v1';
export function readDesktop() {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value?.version === 1 && Array.isArray(value.items)) return value;
    } catch { /* Un estado ilegible vuelve a los accesos iniciales. */ }
    return { version: 1, size: 'medium', items: [
        { id: 'recycle', name: 'Papelera de reciclaje', app: 'recycle', kind: 'shortcut', x: 20, y: 76 },
        { id: 'chrome', name: 'Chrome', app: 'google', kind: 'shortcut', x: 20, y: 184 }
    ] };
}
export function writeDesktop(value) {
    // El aviso impide prometer persistencia si el navegador rechaza la escritura.
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { throw Error('No se pudieron guardar los cambios en este navegador.'); }
    window.dispatchEvent(new Event('kairos:desktop-change'));
}
export function createItem(kind, name, parent = 'desktop') {
    name = name.trim();
    if (!name || name.length > 100 || /[\/\\]/.test(name)) throw Error('Escribe un nombre de 1 a 100 caracteres sin barras.');
    const state = readDesktop();
    if (state.items.some(item => !item.deleted && item.parent === parent && item.name.toLowerCase() === name.toLowerCase())) throw Error('Ya existe un elemento con ese nombre.');
    const item = { id: crypto.randomUUID(), kind, name, parent, content: '', created: Date.now(), x: 130, y: 76 + (state.items.length % 4) * 100 };
    state.items.push(item); writeDesktop(state); return item;
}
