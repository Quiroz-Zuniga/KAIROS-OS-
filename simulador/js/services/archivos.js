const dentro = (ruta, carpeta) => ruta === carpeta || ruta.startsWith(carpeta + '/');
export function resolverRuta(ruta, actual) {
  if (!ruta || /[\x00-\x1f\x7f]/.test(ruta) || ruta.length > 1024) throw new Error('terminal.errorRuta');
  ruta = ruta.replace(/^U:[\\/]/i, '/').replaceAll('\\', '/');
  if (ruta.includes(':')) throw new Error('terminal.errorRuta');
  const segmentos = (ruta.startsWith('/') ? ruta : `${actual}/${ruta}`).split('/');
  const resultado = [];
  for (const segmento of segmentos) {
    if (!segmento || segmento === '.') continue;
    if (segmento === '..') resultado.pop();
    else {
      if (/[<>:"|?*]/.test(segmento) || /[. ]$/.test(segmento) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segmento)) throw new Error('terminal.errorRuta');
      resultado.push(segmento);
    }
  }
  return '/' + resultado.join('/');
}
export function prepararArchivos(archivos, usuario) {
  const resultado = structuredClone(archivos);
  for (const ruta of ['/home', `/home/${usuario}`]) {
    if (!resultado.some(nodo => nodo.ruta === ruta)) resultado.push({ ruta, tipo: 'carpeta' });
  }
  return resultado;
}
export function crearServicioArchivos(archivos, usuario) {
  const hogar = `/home/${usuario}`;
  const buscar = ruta => {
    if (/^\/home\/[^/]+/.test(ruta) && !dentro(ruta, hogar)) throw new Error('terminal.errorProtegido');
    const nodo = archivos.find(nodo => nodo.ruta === ruta);
    if (!nodo) throw new Error('terminal.errorNoExiste');
    return nodo;
  };
  const carpeta = ruta => {
    const nodo = buscar(ruta);
    if (nodo.tipo !== 'carpeta') throw new Error('terminal.errorNoCarpeta');
    return nodo;
  };
  const editable = ruta => {
    if (!dentro(ruta, hogar) || ruta === hogar) throw new Error('terminal.errorProtegido');
  };
  const padre = ruta => ruta.slice(0, ruta.lastIndexOf('/')) || '/';
  const destinoLibre = ruta => {
    editable(ruta);
    carpeta(padre(ruta));
    if (archivos.some(nodo => nodo.ruta.toLowerCase() === ruta.toLowerCase())) throw new Error('terminal.errorExiste');
  };
  return {
    carpeta,
    nodo(ruta) { return structuredClone(buscar(ruta)); },
    descendientes(ruta) { buscar(ruta); return archivos.filter(n => dentro(n.ruta, ruta) && (!/^\/home\/[^/]+/.test(n.ruta) || dentro(n.ruta,hogar))).map(n => structuredClone(n)); },
    atributos(ruta, cambios) { editable(ruta); Object.assign(buscar(ruta), cambios); },
    carpetas(ruta) {
      editable(ruta);
      const faltantes = [];
      for (let siguiente = ruta; !archivos.some(n => n.ruta === siguiente); siguiente = padre(siguiente)) faltantes.unshift(siguiente);
      if (faltantes.length) carpeta(padre(faltantes[0]));
      for (const siguiente of faltantes) this.crear('carpeta', siguiente);
      carpeta(ruta);
    },
    copiarCarpeta(origen, destino) {
      carpeta(origen);
      if (dentro(destino, origen)) throw new Error('terminal.errorMover');
      destinoLibre(destino);
      const nodos = this.descendientes(origen).map(n => ({ ...n, ruta: destino + n.ruta.slice(origen.length) }));
      archivos.push(...nodos);
    },
    listar(ruta, todos=false) { carpeta(ruta); return archivos.filter(nodo => nodo.ruta !== '/' && padre(nodo.ruta) === ruta && (todos || !nodo.oculto)).map(nodo => ({ nombre: nodo.ruta.slice(nodo.ruta.lastIndexOf('/') + 1), tipo: nodo.tipo })).sort((a, b) => a.nombre.localeCompare(b.nombre)); },
    crear(tipo, ruta) { if (!['archivo', 'carpeta'].includes(tipo)) throw new Error('terminal.errorTipo'); destinoLibre(ruta); archivos.push({ ruta, tipo, ...(tipo === 'archivo' ? { contenido: '' } : {}) }); },
    leer(ruta) { const nodo = buscar(ruta); if (nodo.tipo !== 'archivo') throw new Error('terminal.errorNoArchivo'); return nodo.contenido ?? ''; },
    escribir(ruta, contenido) {
      editable(ruta);
      const nodo = buscar(ruta);
      if (nodo.tipo !== 'archivo') throw new Error('terminal.errorNoArchivo');
      if (nodo.soloLectura) throw new Error('archivo.errorLectura');
      if (new TextEncoder().encode(contenido).length > 1024 * 1024) throw new Error('terminal.errorTamano');
      nodo.contenido = contenido;
    },
    borrar(ruta, recursivo, actual) {
      editable(ruta);
      const nodo = buscar(ruta);
      if (dentro(actual, ruta)) throw new Error('terminal.errorDirectorioActual');
      const descendientes = archivos.filter(nodo => dentro(nodo.ruta, ruta));
      if (nodo.tipo === 'carpeta' && descendientes.length > 1 && !recursivo) throw new Error('terminal.errorNoVacia');
      for (let i = archivos.length - 1; i >= 0; i--) if (dentro(archivos[i].ruta, ruta)) archivos.splice(i, 1);
    },
    copiar(origen, destino) {
      const contenido = this.leer(origen);
      destinoLibre(destino);
      archivos.push({ ruta: destino, tipo: 'archivo', contenido });
    },
    mover(origen, destino) {
      editable(origen);
      buscar(origen);
      if (dentro(destino, origen)) throw new Error('terminal.errorMover');
      destinoLibre(destino);
      for (const nodo of archivos) if (dentro(nodo.ruta, origen)) nodo.ruta = destino + nodo.ruta.slice(origen.length);
    },
    bytes() { return archivos.reduce((total, nodo) => total + new TextEncoder().encode(nodo.contenido ?? '').length, 0); }
  };
}
