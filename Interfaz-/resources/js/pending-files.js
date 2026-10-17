document.addEventListener('DOMContentLoaded', () => {
    const note = document.createElement('p'); note.className = 'kairos-note'; note.setAttribute('role','status');
    note.textContent = 'Explorador conservado. Conexión con KAIROSFS pendiente; archivos no disponibles.';
    document.querySelector('main').prepend(note);
    document.querySelectorAll('[onclick], [onchange], [oninput]').forEach(el => {
        for (const name of ['onclick','onchange','oninput']) el.removeAttribute(name);
        if ('disabled' in el) el.disabled = true;
    });
});
