// ================================
// Explorador de Archivos - script.js
// ================================

// Clase para representar un archivo
class File {
  constructor(name, content = '', created = null) {
    this.name = name;
    this.content = content;
    this.isDirectory = false;
    this.created = created ? new Date(created) : new Date();
  }
}

// Clase para representar un directorio
class Directory {
  constructor(name, children = [], created = null) {
    this.name = name;
    this.isDirectory = true;
    this.children = children;
    this.created = created ? new Date(created) : new Date();
  }
}

// Clase principal
class FileManager {
  constructor() {
    this.root = null;
  }

  addFileOrDirectory(parent, name, isDirectory = true, content = '') {
    const newNode = isDirectory ? new Directory(name) : new File(name, content);
    parent.children.push(newNode);
    saveToStorage();
    return newNode;
  }

  getChildren(node) {
    return node.children;
  }

  deleteFileOrDirectory(parent, name) {
    parent.children = parent.children.filter(child => child.name !== name);
    saveToStorage();
  }
}

// -------- Persistencia localStorage --------
function saveToStorage() {
  localStorage.setItem('fileSystem', JSON.stringify(serializeNode(fileManager.root)));
}

function loadFromStorage() {
  const data = localStorage.getItem('fileSystem');
  if (data) {
    fileManager.root = deserializeNode(JSON.parse(data));
    return true;
  }
  return false;
}

function serializeNode(node) {
  if (node.isDirectory) {
    return {
      type: 'dir',
      name: node.name,
      created: node.created,
      children: node.children.map(serializeNode),
    };
  } else {
    return {
      type: 'file',
      name: node.name,
      content: node.content,
      created: node.created,
    };
  }
}

function deserializeNode(obj) {
  if (obj.type === 'dir') {
    return new Directory(obj.name, obj.children.map(deserializeNode), obj.created);
  } else {
    return new File(obj.name, obj.content, obj.created);
  }
}

// -------- Utilidades --------
function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join('-');
}

// -------- Variables globales --------
const fileManager = new FileManager();
let root, currentDir, selectedNode = null, selectedParent = null, undoStack = [];

// -------- Inicialización --------
if (!loadFromStorage()) {
  fileManager.root = new Directory('root');
  fileManager.addFileOrDirectory(fileManager.root, 'documents');
  fileManager.addFileOrDirectory(fileManager.root, 'pictures');
  saveToStorage();
}
root = fileManager.root;
currentDir = root;

// -------- Modal --------
function showModal({ title, fields, initial = {}, onOk }) {
  const modalBg = document.getElementById('modal-bg');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalFields = document.getElementById('modal-fields');
  const modalForm = document.getElementById('modal-form');
  const modalCancel = document.getElementById('modal-cancel');

  modalTitle.textContent = title;
  modalFields.innerHTML = '';

  fields.forEach(({ name, label, type = 'text', accept }) => {
    const wrapper = document.createElement('div');
    const labelEl = document.createElement('label');
    labelEl.htmlFor = `modal-input-${name}`;
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);

    let inputEl;
    if (type === 'textarea') {
      inputEl = document.createElement('textarea');
      inputEl.rows = 4;
    } else {
      inputEl = document.createElement('input');
      inputEl.type = type;
      if (accept) inputEl.accept = accept;
    }

    inputEl.id = `modal-input-${name}`;
    inputEl.name = name;
    inputEl.style.width = '100%';
    if (type !== 'file') inputEl.value = initial[name] || '';
    wrapper.appendChild(inputEl);
    wrapper.style.marginBottom = '12px';
    modalFields.appendChild(wrapper);
  });

  modalBg.style.display = modal.style.display = 'block';

  const closeModal = () => {
    modalBg.style.display = modal.style.display = 'none';
    modalForm.onsubmit = null;
    modalCancel.onclick = null;
  };

  modalCancel.onclick = closeModal;

  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = {};
    for (let field of fields) {
      const input = modalForm.elements[field.name];
      data[field.name] = field.type === 'file' ? input : input.value;
    }
    const result = await onOk(data, modalForm, closeModal);
    if (result !== false) closeModal();
  };
}

// -------- Agregar imagen --------
function contextAddImage() {
  showModal({
    title: "Agregar imagen",
    fields: [
      { name: "name", label: "Nombre de la imagen:" },
      { name: "content", label: "Seleccionar imagen:", type: "file", accept: "image/*" }
    ],
    onOk: ({ name, content }, form, close) => {
      const file = form.elements['content'].files[0];
      if (!file || !name.trim()) return alert("Datos incompletos"), false;
      const reader = new FileReader();
      reader.onload = e => {
        fileManager.addFileOrDirectory(currentDir, name.trim(), false, e.target.result);
        renderDirectories(currentDir);
        updateBreadcrumb(currentDir);
        saveToStorage();
        close();
      };
      reader.readAsDataURL(file);
      return false;
    }
  });
}


// -------- Visualizar archivo --------
function openViewerModal(title, content) {
  const modalBg = document.getElementById('viewer-modal-bg');
  const modal = document.getElementById('viewer-modal');
  const viewerTitle = document.getElementById('viewer-title');
  const viewerContent = document.getElementById('viewer-content');

  viewerTitle.textContent = title;
  viewerContent.innerHTML = '';

  if (content.startsWith('data:image')) {
    const img = document.createElement('img');
    img.src = content;
    img.style.maxWidth = '100%';
    viewerContent.appendChild(img);
  } else if (content.startsWith('data:video')) {
    const video = document.createElement('video');
    video.src = content;
    video.controls = true;
    video.style.width = '100%';
    viewerContent.appendChild(video);
  } else {
    viewerContent.textContent = content;
  }

  modalBg.style.display = modal.style.display = 'block';
  document.getElementById('viewer-close').onclick = () => {
    modalBg.style.display = modal.style.display = 'none';
  };
}

// -------- Renderizar directorios --------
function renderDirectories(node = currentDir) {
  currentDir = node;
  selectedNode = null;
  selectedParent = null;
  const display = document.getElementById('files');
  display.innerHTML = '';
  const sortedChildren = [...fileManager.getChildren(node)].sort((a, b) => b.created - a.created);

  sortedChildren.forEach((child, i) => {
    const tr = document.createElement('tr');
    const num = document.createElement('td');
    const name = document.createElement('td');
    const type = document.createElement('td');
    const date = document.createElement('td');
    const icon = document.createElement('i');

    num.textContent = i + 1;
    date.textContent = formatDate(child.created);
    icon.classList = child.isDirectory ? 'fa-solid fa-folder' : 'fa-solid fa-file';
    name.appendChild(icon);
    name.append(` ${child.name}`);
    type.textContent = child.isDirectory ? 'Directorio' : 'Archivo';

    tr.ondblclick = () => child.isDirectory && (renderDirectories(child), updateBreadcrumb(child));
    tr.onclick = () => !child.isDirectory && openViewerModal(child.name, child.content);
    tr.oncontextmenu = e => {
      e.preventDefault();
      selectedNode = child;
      selectedParent = node;
      showContextMenu(e.pageX, e.pageY);
    };

    tr.append(num, name, type, date);
    display.appendChild(tr);
  });
}

// -------- Breadcrumb --------
function getPathToNode(node) {
  const path = [];
  let current = node;
  while (current) {
    path.unshift(current);
    if (current === root) break;
    current = findParent(root, current);
  }
  return path;
}

function findParent(parent, child) {
  if (!parent.isDirectory) return null;
  for (const c of parent.children) {
    if (c === child) return parent;
    if (c.isDirectory) {
      const found = findParent(c, child);
      if (found) return found;
    }
  }
  return null;
}

function updateBreadcrumb(dir) {
  const directoriesList = document.getElementById('directories');
  directoriesList.innerHTML = '';
  getPathToNode(dir).forEach((node, idx, arr) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = node.name;
    strong.style.cursor = 'pointer';
    strong.onclick = () => (renderDirectories(node), updateBreadcrumb(node));
    li.appendChild(strong);
    directoriesList.appendChild(li);
    if (idx < arr.length - 1) {
      const sep = document.createElement('span');
      sep.textContent = ' / ';
      directoriesList.appendChild(sep);
    }
  });
}

// -------- Menú contextual --------
function showContextMenu(x, y) {
  const menu = document.getElementById('context-menu');
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.display = 'block';
}

window.onclick = e => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target)) menu.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
  const explorerMain = document.getElementById('explorer-main');
  explorerMain && explorerMain.addEventListener('contextmenu', e => {
    if (!e.target.closest('tr')) {
      e.preventDefault();
      selectedNode = null;
      selectedParent = null;
      showContextMenu(e.pageX, e.pageY);
    }
  });
});

// -------- Acciones del menú contextual --------
function contextAddDir() {
  showModal({
    title: "Nueva carpeta",
    fields: [{ name: "name", label: "Nombre de la carpeta:" }],
    onOk: ({ name }) => {
      if (!name.trim()) return false;
      fileManager.addFileOrDirectory(currentDir, name.trim(), true);
      renderDirectories(currentDir);
      updateBreadcrumb(currentDir);
      saveToStorage();
    }
  });
}

function contextAddFile() {
  showModal({
    title: "Nuevo documento",
    fields: [
      { name: "name", label: "Nombre del documento:" },
      { name: "content", label: "Contenido:", type: "textarea" }
    ],
    onOk: ({ name, content }) => {
      if (!name.trim()) return false;
      fileManager.addFileOrDirectory(currentDir, name.trim(), false, content || "");
      renderDirectories(currentDir);
      updateBreadcrumb(currentDir);
      saveToStorage();
    }
  });
}

function contextRename() {
  if (!selectedNode) return;
  showModal({
    title: "Renombrar",
    fields: [{ name: "name", label: "Nuevo nombre:" }],
    initial: { name: selectedNode.name },
    onOk: ({ name }) => {
      if (!name.trim()) return false;
      selectedNode.name = name.trim();
      renderDirectories(currentDir);
      updateBreadcrumb(currentDir);
      saveToStorage();
    }
  });
}

function contextDelete() {
  if (!selectedNode) return;
  showModal({
    title: "¿Deseas eliminar este elemento?",
    fields: [],
    onOk: () => {
      undoStack.push({
        node: selectedNode,
        parent: selectedParent || currentDir,
        index: (selectedParent || currentDir).children.indexOf(selectedNode)
      });
      fileManager.deleteFileOrDirectory(selectedParent || currentDir, selectedNode.name);
      renderDirectories(currentDir);
      updateBreadcrumb(currentDir);
      saveToStorage();
    }
  });
}

// -------- Deshacer eliminar --------
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key.toLowerCase() === 'z') undoDelete();
});

function undoDelete() {
  if (undoStack.length === 0) return;
  const { node, parent, index } = undoStack.pop();
  parent.children.splice(index, 0, node);
  renderDirectories(currentDir);
  updateBreadcrumb(currentDir);
  saveToStorage();
}

// -------- Inicio --------
window.onload = () => {
  renderDirectories(root);
  updateBreadcrumb(root);
};
