const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function rutaSegura(raiz, ruta) {
  if (typeof ruta !== 'string' || !ruta.startsWith('/') || /[\\\x00-\x1f<>:"|?*]/.test(ruta)) throw new Error('terminal.errorRuta');
  const partes = ruta.split('/').filter(Boolean);
  if (partes.some(p => p === '.' || p === '..' || /[. ]$/.test(p) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p))) throw new Error('terminal.errorRuta');
  const destino = path.resolve(raiz, ...partes);
  if (destino !== raiz && !destino.startsWith(raiz + path.sep)) throw new Error('terminal.errorRuta');
  return destino;
}
class AlmacenLocal {
  constructor(raiz, validar) { this.raiz = path.resolve(raiz); this.validar = validar; this.cola = Promise.resolve(); }
  serializar(tarea) { const resultado = this.cola.then(tarea); this.cola = resultado.catch(() => {}); return resultado; }
  reservarIP() { return this.serializar(async()=>{
    await this.asegurarCarpeta(this.raiz);
    const { siguienteDireccion } = await import('../js/core/red.js');
    const archivo=path.join(this.raiz,'cursor-red.json');let cursor;
    try{cursor=JSON.parse(await fs.readFile(archivo,'utf8'));}catch(e){if(e.code!=='ENOENT')throw new Error('red.errorDireccion');}
    const reserva=siguienteDireccion(cursor);const temporal=path.join(this.raiz,'red-'+randomUUID()+'.tmp');
    try{await fs.writeFile(temporal,JSON.stringify(reserva.cursor),{flag:'wx'});await fs.rename(temporal,archivo);}catch(e){await fs.rm(temporal,{force:true}).catch(()=>{});throw e;}
    return reserva.ip;
  }); }
  async leerRegistro() {
    try { return JSON.parse(await fs.readFile(path.join(this.raiz, 'estado.json'), 'utf8')); }
    catch (e) { if (e.code === 'ENOENT') return null; throw new Error('error.instalacion'); }
  }
  cargar() { return this.serializar(async () => (await this.leerRegistro())?.instalacion ?? null); }
  guardar(datos) { return this.serializar(async () => { if (await this.leerRegistro()) throw new Error('live.errorExistente'); await this.publicar(datos); }); }
  actualizar(datos, revision, fecha) { return this.serializar(async () => {
    const registro = await this.leerRegistro();
    if (!registro || (registro.instalacion.revision ?? 0) !== revision || registro.instalacion.fecha !== fecha) throw new Error('terminal.errorConflicto');
    await this.publicar(datos);
  }); }
  async asegurarCarpeta(ruta) {
    await fs.mkdir(ruta, { recursive: true });
    const stat = await fs.lstat(ruta);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('terminal.errorProtegido');
  }
  async borrarVolumen(nombre) {
    if (!/^volumen-[a-f0-9-]{36}$/.test(nombre ?? '')) return;
    const destino = path.resolve(this.raiz, nombre);
    if (!destino.startsWith(this.raiz + path.sep)) throw new Error('terminal.errorProtegido');
    // Solo carpetas generadas por KAIROS dentro de su almacenamiento privado.
    await fs.rm(destino, { recursive: true, force: true });
  }
  async publicar(datos) {
    if (!this.validar(datos) || !Array.isArray(datos.archivos) || datos.archivos.length > 10000 || Buffer.byteLength(JSON.stringify(datos)) > 32 * 1024 * 1024) throw new Error('error.instalacion');
    await this.asegurarCarpeta(this.raiz);
    const anterior = await this.leerRegistro();
    const nombre = 'volumen-' + randomUUID(), volumen = path.resolve(this.raiz, nombre);
    const temporal = path.join(this.raiz, 'estado-' + randomUUID() + '.tmp');
    try {
      await this.asegurarCarpeta(volumen);
      const rutas = new Set();
      for (const nodo of [...datos.archivos].sort((a,b) => a.ruta.length-b.ruta.length)) {
        const destino = rutaSegura(volumen, nodo.ruta);
        const normal = destino.toLowerCase();
        if (rutas.has(normal)) throw new Error('terminal.errorExiste');
        rutas.add(normal);
        if (nodo.tipo === 'carpeta') await fs.mkdir(destino, { recursive: true });
        else if (nodo.tipo === 'archivo' && typeof nodo.contenido === 'string') {
          if (Buffer.byteLength(nodo.contenido) > 1024 * 1024) throw new Error('terminal.errorTamano');
          await fs.writeFile(destino, nodo.contenido, { flag: 'wx' });
        } else throw new Error('error.instalacion');
      }
      await fs.writeFile(temporal, JSON.stringify({ instalacion: datos, volumen: nombre }), { flag: 'wx' });
      await fs.rename(temporal, path.join(this.raiz, 'estado.json'));
    } catch (error) {
      await fs.rm(temporal, { force: true }).catch(() => {});
      await this.borrarVolumen(nombre).catch(() => {});
      throw error;
    }
    // El puntero ya se confirmó; un fallo de limpieza no revierte el guardado.
    if (anterior?.volumen) await this.borrarVolumen(anterior.volumen).catch(() => {});
  }
  borrarInstalacion(revision, fecha) { return this.serializar(async () => {
    const registro = await this.leerRegistro();
    if (revision !== undefined && (!registro || (registro.instalacion.revision ?? 0) !== revision || registro.instalacion.fecha !== fecha)) throw new Error('terminal.errorConflicto');
    await fs.rm(path.join(this.raiz, 'estado.json'), { force: true });
    if (registro?.volumen) await this.borrarVolumen(registro.volumen).catch(() => {});
  }); }
  info() { return this.serializar(async () => { const r = await this.leerRegistro(); return { carpeta: this.raiz, archivos: r?.volumen ? path.join(this.raiz, r.volumen) : this.raiz }; }); }
}
module.exports = { AlmacenLocal, rutaSegura };
