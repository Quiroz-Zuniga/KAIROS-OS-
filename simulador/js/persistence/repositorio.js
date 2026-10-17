import { traducir as t } from '../core/i18n.js';
import { siguienteDireccion } from '../core/red.js';
// Una única transacción publica la instalación completa: nunca un estado parcial.
export function crearRepositorio(indexedDB = globalThis.indexedDB) {
  let conexion;
  async function abrir() {
    if (conexion) return conexion;
    if (!indexedDB) throw new Error(t('error.indexedDB'));
    conexion = await new Promise((resolver, rechazar) => {
      let bloqueada = false;
      const solicitud = indexedDB.open('uphos-simulator', 1);
      solicitud.onupgradeneeded = () => solicitud.result.createObjectStore('sistema');
      solicitud.onsuccess = () => {
        const base = solicitud.result;
        if (bloqueada) { base.close(); return; }
        base.onversionchange = () => { base.close(); conexion = undefined; };
        resolver(base);
      };
      solicitud.onerror = () => rechazar(new Error(t('error.abrir')));
      solicitud.onblocked = () => { bloqueada = true; rechazar(new Error(t('error.bloqueo'))); };
    });
    return conexion;
  }
  return {
    async reservarIP() {
      const base = await abrir();
      return new Promise((resolver,rechazar)=>{
        const transaccion=base.transaction('sistema','readwrite');const almacen=transaccion.objectStore('sistema');
        const lectura=almacen.get('cursor-red');let reserva;
        lectura.onsuccess=()=>{try{reserva=siguienteDireccion(lectura.result);almacen.put(reserva.cursor,'cursor-red');}catch{transaccion.abort();}};
        transaccion.oncomplete=()=>resolver(reserva.ip);
        transaccion.onabort=()=>rechazar(new Error(t('red.errorDireccion')));
      });
    },
    async cargar() {
      const base = await abrir();
      return new Promise((resolver, rechazar) => {
        const transaccion = base.transaction('sistema', 'readonly');
        const solicitud = transaccion.objectStore('sistema').get('instalacion');
        transaccion.oncomplete = () => resolver(solicitud.result ?? null);
        transaccion.onabort = () => rechazar(new Error(t('error.leer')));
      });
    },
    async borrarInstalacion(revisionEsperada, fechaEsperada) {
      const base = await abrir();
      return new Promise((resolver, rechazar) => {
        const transaccion = base.transaction('sistema', 'readwrite');
        // Solo elimina la instalación de UPHOS; no borra otras bases del sitio.
        const almacen = transaccion.objectStore('sistema');
        let conflicto = false;
        if (revisionEsperada === undefined) almacen.delete('instalacion');
        else {
          const solicitud = almacen.get('instalacion');
          solicitud.onsuccess = () => {
            if (!solicitud.result || (solicitud.result.revision ?? 0) !== revisionEsperada || solicitud.result.fecha !== fechaEsperada) {
              conflicto = true;
              transaccion.abort();
            } else almacen.delete('instalacion');
          };
        }
        transaccion.oncomplete = () => resolver();
        transaccion.onabort = () => rechazar(new Error(conflicto ? 'terminal.errorConflicto' : t('error.borrar')));
      });
    },
    async guardar(datos) {
      const base = await abrir();
      return new Promise((resolver, rechazar) => {
        const transaccion = base.transaction('sistema', 'readwrite');
        // add evita sobrescribir una instalación realizada desde otra pestaña.
        transaccion.objectStore('sistema').add(datos, 'instalacion');
        transaccion.oncomplete = resolver;
        transaccion.onabort = () => rechazar(new Error(t('error.guardar')));
      });
    },
    async actualizar(datos, revisionEsperada, fechaEsperada) {
      const base = await abrir();
      return new Promise((resolver, rechazar) => {
        const transaccion = base.transaction('sistema', 'readwrite');
        const almacen = transaccion.objectStore('sistema');
        const solicitud = almacen.get('instalacion');
        let conflicto = false;
        solicitud.onsuccess = () => {
          if (!solicitud.result || (solicitud.result.revision ?? 0) !== revisionEsperada || solicitud.result.fecha !== fechaEsperada) {
            conflicto = true;
            transaccion.abort();
            return;
          }
          almacen.put(datos, 'instalacion');
        };
        transaccion.oncomplete = () => resolver();
        transaccion.onabort = () => rechazar(new Error(conflicto ? 'terminal.errorConflicto' : 'terminal.errorGuardar'));
      });
    }
  };
}
