const input = document.querySelector('#input-box');
input.placeholder = 'Proveedor de clima pendiente'; input.disabled = true;
const note = document.createElement('p'); note.textContent = 'Sin proveedor de clima configurado.';
note.className = 'uph-note'; input.parentElement.append(note);
