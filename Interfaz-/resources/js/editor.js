const textarea = document.getElementById("textarea1")

function f1(e) {
    let value = e.value
    textarea.style.fontSize = value + "px"
}

function f2(e) {
    if (textarea.style.fontWeight == "bold") {
        textarea.style.fontWeight = "normal"
        e.classList.remove("active")
    }
    else {
        textarea.style.fontWeight = "bold"
        e.classList.add("active")
    }
}

function f3(e) {
    if (textarea.style.fontStyle == "italic") {
        textarea.style.fontStyle = "normal"
        e.classList.remove("active")
    }
    else {
        textarea.style.fontStyle = "italic"
        e.classList.add("active")
    }
}

function f4(e) {
    if (textarea.style.textDecoration == "underline") {
        textarea.style.textDecoration = "none"
        e.classList.remove("active")
    }
    else {
        textarea.style.textDecoration = "underline"
        e.classList.add("active")
    }
}

function f5(e) {
    textarea.style.textAlign = "left"
}

function f6(e) {
    textarea.style.textAlign = "center"
}

function f7(e) {
    textarea.style.textAlign = "right"
}

function f8(e) {
    if (textarea.style.textTransform == "uppercase") {
        textarea.style.textTransform = "none"
        e.classList.remove("active")
    }
    else {
        textarea.style.textTransform = "uppercase"
        e.classList.add("active")
    }
}

function f9() {
    textarea.style.fontWeight = "normal"
    textarea.style.textAlign = "left"
    textarea.style.fontStyle = "normal"
    textarea.style.textTransform = "capitalize"
    textarea.value = ""
}

function f10(e) {
    let value = e.value
    textarea.style.color = value
}

// Rubén Quiroz: documentos de interfaz, sin integrarse con la consola del compañero.
let selectedDocument = null;
let virtualFiles;
const filename = document.createElement('input');
filename.value = 'Nota.txt'; filename.maxLength = 100; filename.setAttribute('aria-label','Nombre del documento');
filename.style.cssText = 'padding:8px;border:1px solid #6666a0;border-radius:6px;background:#181858;color:white;margin:8px';
document.querySelector('.botones').prepend(filename);
const editorStatus = document.createElement('p'); editorStatus.setAttribute('role','status');
document.querySelector('.botones').append(editorStatus);
function listDocuments() {
    const host=document.querySelector('#listado');host.replaceChildren();
    for (const item of virtualFiles.readDesktop().items.filter(x=>!x.deleted&&['text','word'].includes(x.kind))) {
        const b=document.createElement('button');b.textContent=item.name;b.onclick=()=>loadDocument(item.id);host.append(b);
    }
}
function loadDocument(id) {
    const item=virtualFiles.readDesktop().items.find(x=>x.id===id&&!x.deleted);
    if(!item)return;
    selectedDocument=id;filename.value=item.name;textarea.value=item.content||'';editorStatus.textContent='';
}
function saveFile() {
    if(!virtualFiles)return;
    try {
        if(!selectedDocument)selectedDocument=virtualFiles.createItem('text',filename.value).id;
        const state=virtualFiles.readDesktop();const item=state.items.find(x=>x.id===selectedDocument&&!x.deleted);
        if(!item)throw Error('El documento se eliminó; vuelve a abrirlo desde el escritorio.');
        const name=filename.value.trim();
        if(!name||name.length>100||/[\/\\]/.test(name))throw Error('Escribe un nombre válido sin barras.');
        if(state.items.some(x=>x.id!==item.id&&!x.deleted&&x.parent===item.parent&&x.name.toLowerCase()===name.toLowerCase()))throw Error('Ya existe un documento con ese nombre.');
        item.name=name;item.content=textarea.value;virtualFiles.writeDesktop(state);listDocuments();editorStatus.textContent='Documento guardado en KAIROS.';
    } catch(error) {editorStatus.textContent=error.message;}
}
import('./system/desktop-store.js').then(api=>{
    virtualFiles=api;listDocuments();
    if(window.parent.kairosSelectedItem){loadDocument(window.parent.kairosSelectedItem);window.parent.kairosSelectedItem=null;}
    textarea.dataset.ready='true';
    const open=event=>{loadDocument(event.detail);window.parent.kairosSelectedItem=null;};
    window.parent.addEventListener('kairos:open-editor',open);
    window.addEventListener('pagehide',()=>window.parent.removeEventListener('kairos:open-editor',open),{once:true});
}).catch(error=>editorStatus.textContent=error.message);
