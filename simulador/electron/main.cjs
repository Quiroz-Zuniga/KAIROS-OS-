const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { AlmacenLocal } = require('./almacen-local.cjs');
const raiz = path.resolve(__dirname, '..');
const datos = path.join(process.env.UPHOS_TEST_DATA || path.join(process.env.LOCALAPPDATA || app.getPath('appData'), 'UPHOS'), 'datos');
app.setPath('userData', path.join(path.dirname(datos), 'perfil'));
app.commandLine.appendSwitch('disable-http-cache');
if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(async () => {
  const { instalacionValida } = await import(pathToFileURL(path.join(raiz, 'js/core/sistema.js')));
  const almacen = new AlmacenLocal(datos, instalacionValida);
  const ventana = new BrowserWindow({ width: 1280, height: 850, minWidth: 600, minHeight: 500, title: 'UPHOS', icon: path.join(raiz,'assets/logo.ico'), backgroundColor:'#0b0e26', autoHideMenuBar:true,
    webPreferences: { preload:path.join(__dirname,'preload.cjs'), contextIsolation:true, nodeIntegration:false, sandbox:true, webSecurity:true } });
  ventana.removeMenu();
  ventana.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const principal = pathToFileURL(path.join(raiz,'index.html')).href;
  ventana.webContents.on('will-navigate', (evento, url) => { if (url !== principal) evento.preventDefault(); });
  const canales = { reservarIP: () => almacen.reservarIP(), cargar: () => almacen.cargar(), guardar: d => almacen.guardar(d), actualizar:(d,r,f)=>almacen.actualizar(d,r,f), borrar:(r,f)=>almacen.borrarInstalacion(r,f), info:()=>almacen.info() };
  for (const [nombre, ejecutar] of Object.entries(canales)) ipcMain.handle('uphos:'+nombre, async (evento, ...args) => {
    if (evento.sender !== ventana.webContents || evento.senderFrame.url !== principal) return { error:'terminal.errorProtegido' };
    try { return { datos: await ejecutar(...args) }; }
    catch (e) { return { error: /^[a-z]+\.[\w.]+$/.test(e.message) ? e.message : 'terminal.errorGuardar' }; }
  });
  await ventana.loadFile(path.join(raiz,'index.html'));
  app.on('second-instance',()=>{ if(ventana.isMinimized())ventana.restore(); ventana.focus(); });
}).catch(e => { dialog.showErrorBox('UPHOS',e.message); app.quit(); });
app.on('window-all-closed',()=>app.quit());
