const { contextBridge, ipcRenderer } = require('electron');
const llamar = (nombre,...args)=>ipcRenderer.invoke('uphos:'+nombre,...args);
contextBridge.exposeInMainWorld('uphosLocal', {
  reservarIP:()=>llamar('reservarIP'), cargar:()=>llamar('cargar'), guardar:datos=>llamar('guardar',datos),
  actualizar:(datos,revision,fecha)=>llamar('actualizar',datos,revision,fecha),
  borrarInstalacion:(revision,fecha)=>llamar('borrar',revision,fecha), info:()=>llamar('info')
});
