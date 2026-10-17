import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const base = (process.env.KAIROS_BASE_URL || 'http://127.0.0.1:4174') + (process.env.KAIROS_BASE_PATH || '');
const server = process.env.KAIROS_BASE_URL ? null : spawn(process.execPath,['scripts/serve.js'],{env:{...process.env,PORT:'4174'},stdio:'ignore'});
if (server) {
    for(let i=0;i<40;i++) { try { await fetch(base);break; } catch { await new Promise(resolve=>setTimeout(resolve,100)); } }
    process.on('exit',()=>server.kill());
}
const results = [];
for (const [engine,name] of [[chromium,'chromium'],[firefox,'firefox'],[webkit,'webkit']]) {
 let browser;
 try { browser = await engine.launch(name === 'chromium' ? {executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome',args:['--no-sandbox']} : (process.env['KAIROS_'+name.toUpperCase()+'_PATH'] ? {executablePath:process.env['KAIROS_'+name.toUpperCase()+'_PATH']} : {})); }
 catch(e) { results.push({name,available:false,reason:e.message.split('\n')[0]});continue; }
 const page = await browser.newPage({viewport:{width:1366,height:768}});
 const errors=[], failures=[];page.on('pageerror',e=>errors.push(e.stack));page.on('response',r=>{if(r.status()>=400 && r.url().startsWith(new URL(base).origin))failures.push(r.status()+' '+r.url());});
 const fixture={source:'local-python',updatedAt:new Date().toISOString(),battery:{available:true,level:78,charging:true,plugged:true,source:'sysfs'},audio:{available:true,volume:37,muted:false,source:'PipeWire'},network:{available:true,connected:true,connectionType:'wifi',wifiAvailable:true,wifiEnabled:true,ssid:'KAIROS-Laboratorio',signal:85,networks:[{ssid:'KAIROS-Laboratorio',signal:85,secure:true,connected:true},{ssid:'Biblioteca',signal:62,secure:true,connected:false}],source:'NetworkManager'}};
 // La interfaz debe arrancar sin servicios externos ni CDN.
 await page.route('**/*',route => route.request().url().startsWith(new URL(base).origin) || route.request().url().startsWith('data:') ? route.continue() : route.abort());
 await page.route('**/api/system-status',route=>route.fulfill({json:fixture}));
 try {
  await page.goto(base+'/index.html');
  await page.evaluate(()=>{localStorage.setItem('calendar-events','{dato inválido');localStorage.setItem('imagenesGuardadas','{dato inválido');localStorage.setItem('wallpaper','/resources/assets/images/kairos-wallpaper.svg');});
  await page.screenshot({path:`docs/evidencia/despues-bloqueo-${name}.png`});
  await page.locator('#desbloquear').click();await page.waitForURL('**/escritorio.html');await page.waitForFunction(()=>!!window.kairos);
  assert.equal(await page.locator('.terminal, #guest-entry, input[type="password"]').count(),0);
  assert.equal(await page.evaluate(()=>{try {window.kairos.launch('terminal');return false;}catch{return true;}}),true);
  for (const removed of ['login','register','terminal']) assert.equal((await page.request.get(`${base}/resources/html/${removed}.html`)).status(),404);
  assert.equal(await page.locator('.barra-superior').evaluate(el => getComputedStyle(el).position),'absolute');
  await page.waitForFunction(()=>[...document.querySelectorAll('.barra-superior img, .barra-tareas img')].every(img=>img.complete&&img.naturalWidth>0));
  await page.evaluate(()=>window.kairos.command('pause'));
  assert.equal(await page.evaluate(()=>document.fullscreenElement),null);
  await page.locator('.calculator').click();const win=page.locator('.window');await win.waitFor();
  const pid=Number(await win.getAttribute('data-pid'));
  const calc=page.frameLocator('.window iframe');await calc.locator('#displayBox').waitFor();
  await calc.getByRole('button',{name:'2',exact:true}).click();await calc.getByRole('button',{name:'+',exact:true}).click();await calc.getByRole('button',{name:'3',exact:true}).click();await calc.getByRole('button',{name:'=',exact:true}).click();
  assert.equal(await calc.locator('#displayBox').inputValue(),'5');
  assert.equal(await page.evaluate(()=>window.kairos.getState().memory.used),16);
  await win.getByRole('button',{name:'Minimizar',exact:true}).click();assert.equal(await win.isVisible(),false);
  assert.equal(await page.evaluate(()=>window.kairos.getState().memory.used),16);
  await page.locator('.calculator').click();assert.equal(await win.getAttribute('data-pid'),String(pid));
  assert.equal(await page.locator('.window').count(),1);
  await win.getByRole('button',{name:'Maximizar o restaurar',exact:true}).click();assert.ok((await win.getAttribute('class')).includes('maximized'));
  await win.getByRole('button',{name:'Maximizar o restaurar',exact:true}).click();
  await win.getByRole('button',{name:'Cerrar',exact:true}).click();assert.equal(await page.locator('.window').count(),0);assert.equal(await page.evaluate(()=>window.kairos.getState().memory.used),0);
  await page.locator('#dock-options').click();await page.getByRole('menuitem',{name:/Ver procesos/}).click();const monitor=page.frameLocator('.window iframe');await monitor.locator('#procesos tr').waitFor();
  assert.match(await monitor.locator('#resumen').textContent(),/32\/1024/);
  await monitor.locator('#new-process').click();await monitor.getByRole('button',{name:'Crear tarea',exact:true}).click();assert.equal(await monitor.locator('#procesos tr').count(),2);
  await monitor.getByRole('button',{name:'Avanzar un tick',exact:true}).click();assert.equal(await page.evaluate(()=>window.kairos.getState().clock),1);
  await page.screenshot({path:`docs/evidencia/despues-monitor-${name}.png`});
  for(const panel of ['memory','devices','resources','activity']) {await monitor.locator(`[data-panel="${panel}"]`).click();assert.equal(await monitor.locator('pre').count(),0);}
  await monitor.locator('[data-panel="processes"]').click();
  await monitor.locator('#procesos tr').last().locator('[data-operation="io"]').click();
  await monitor.locator('[data-panel="devices"]').click();assert.equal(await monitor.locator('.device-card').count(),6);assert.equal(await monitor.locator('.io-row').count(),1);
  await page.screenshot({path:`docs/evidencia/despues-dispositivos-${name}.png`});
  await monitor.getByRole('button',{name:'Avanzar un tick',exact:true}).click();await monitor.getByRole('button',{name:'Avanzar un tick',exact:true}).click();
  assert.equal(await monitor.locator('.io-row').count(),0);
  await monitor.locator('[data-panel="memory"]').click();assert.equal(await monitor.locator('#memory-legend>span').count(),2);
  await page.screenshot({path:`docs/evidencia/despues-memoria-${name}.png`});
  await monitor.locator('[data-panel="resources"]').click();await monitor.getByRole('button',{name:'Crear recurso',exact:true}).click();
  const taskPid=await page.evaluate(()=>window.kairos.getState().processes.find(p=>p.name==='Mi tarea').pid);
  await monitor.locator('#resource-process').selectOption(String(taskPid));await monitor.getByRole('button',{name:'Solicitar acceso',exact:true}).click();
  assert.match(await monitor.locator('#resource-cards').textContent(),/Utilizando: Mi tarea/);
  await monitor.getByRole('button',{name:'Liberar acceso',exact:true}).click();assert.match(await monitor.locator('#resource-cards').textContent(),/Utilizando: Nadie/);
  await monitor.locator('[data-panel="processes"]').click();await monitor.locator('#process-search').fill('no existe');assert.equal(await monitor.locator('#procesos tr').count(),0);await monitor.locator('#process-search').fill('');
  const monitorFrame=page.frames().find(f=>f.url().endsWith('/procesos.html'));await monitorFrame.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const monitorA11y=await monitorFrame.evaluate(async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  assert.deepEqual(monitorA11y,[]);
  // Terminación externa destruye ventana y libera RAM.
  await page.evaluate(()=>{const p=window.kairos.getState().processes.find(p=>p.appId==='procesos'&&p.state!=='TERMINATED');window.kairos.terminate(p.pid);});assert.equal(await page.locator('.window').count(),0);
  // Agotar memoria no admite una ventana huérfana.
  await page.evaluate(()=>{window.kairos.command('reset');window.kairos.command('createProcess',{name:'Reserva',memory:1024});});
  await page.locator('.calculator').click();assert.match(await page.locator('#kairos-notice').textContent(),/insuficiente/);assert.equal(await page.locator('.window').count(),0);
  await page.locator('#kairos-notice').evaluate(node=>node.hidden=true);
  await page.evaluate(()=>window.kairos.command('reset'));
  // Las rutas de todas las apps se montan sin reemplazar sus vistas.
  for(const id of ['editor','explorer','imagenes','video','spotify','tasks','antivirus','webadpp','camara','google','temporisador','pac_man']){
    await page.evaluate(id=>window.kairos.launch(id),id);await page.locator('.window iframe').waitFor();
    await page.waitForTimeout(250);
    if(id==='imagenes'){
       const gallery=page.frameLocator('.window iframe');await gallery.locator('#image-gallery img').first().waitFor();
       await gallery.getByRole('button',{name:/fondo/i}).click();
       assert.match(await page.locator('main > .bg-cover').getAttribute('style'),/kairos-wallpaper/);
    }
    await page.locator('.window .close-btn').click();
  }
  // Accesos originales: arrastrar desde el dock, abrir y eliminar con contexto.
  await page.locator('.calculator img').dragTo(page.locator('main > .bg-cover'),{targetPosition:{x:120,y:160}});
  const shortcut=page.locator('.icono-escritorio');await shortcut.waitFor();await shortcut.click();
  await page.locator('.window .close-btn').click();await shortcut.click({button:'right'});
  await page.locator('#contextMenuEscritorio li').filter({hasText:'Eliminar ícono'}).click();assert.equal(await shortcut.count(),0);
  await page.locator('#boton-inicio').click();await page.screenshot({path:`docs/evidencia/despues-menu-${name}.png`});await page.locator('#boton-inicio').click();
  // Calendario: crear, editar, cambiar vista, filtrar y eliminar sin perder preferencias.
  await page.locator('#calendar').click();
  const calendar=page.frameLocator('.window iframe');await calendar.locator('#calendar-grid').waitFor();
  assert.equal(await calendar.locator('.month-day').last().evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight+1),true);
  await calendar.locator('#calendar-create').click();await calendar.locator('#event-title').fill('Entrega KAIRÓS OS');
  await calendar.locator('[name="start"]').fill('10:00');await calendar.locator('[name="end"]').fill('11:00');
  await calendar.getByRole('button',{name:'Guardar evento',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('calendar-events'))[0].event_title),'Entrega KAIRÓS OS');
  await page.screenshot({path:`docs/evidencia/despues-calendario-${name}.png`});
  const calendarMonthFrame=page.frames().find(f=>f.url().endsWith('/calendario.html'));await calendarMonthFrame.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const calendarMonthA11y=await calendarMonthFrame.evaluate(async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});assert.deepEqual(calendarMonthA11y,[]);

  await calendar.locator('#calendar-view').selectOption('week');await calendar.locator('.week-event').filter({hasText:'Entrega KAIRÓS OS'}).click();
  await calendar.locator('#event-title').fill('Entrega actualizada');await calendar.getByRole('button',{name:'Guardar evento',exact:true}).click();
  await page.screenshot({path:`docs/evidencia/despues-semana-${name}.png`});
  await calendar.locator('#calendar-view').selectOption('agenda');await calendar.locator('.agenda-event').filter({hasText:'Entrega actualizada'}).click();
  await calendar.locator('#event-delete').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('calendar-events')).length),0);
  await calendar.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await calendar.locator('.agenda-event').count(),1);
  await calendar.locator('#calendar-search').fill('no existe');assert.equal(await calendar.locator('.agenda-event').count(),0);await calendar.locator('#calendar-search').fill('');
  const calendarFrame=page.frames().find(f=>f.url().endsWith('/calendario.html'));await calendarFrame.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const calendarA11y=await calendarFrame.evaluate(async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  assert.deepEqual(calendarA11y,[]);

  await page.locator('.window .close-btn').click();
  // Panel físico: datos de prueba explícitos, sin guardar nombres de redes reales en capturas.
  await page.locator('#hardware-network').click();await page.locator('#wifi-list li').first().waitFor();
  assert.match(await page.locator('#network-detail').textContent(),/KAIROS-Laboratorio/);
  assert.match(await page.locator('#audio-detail').textContent(),/37%/);
  assert.match(await page.locator('#battery-detail').textContent(),/78%/);
  await page.screenshot({path:`docs/evidencia/despues-equipo-${name}.png`});
  await page.keyboard.press('Escape');
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const a11y=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:['wcag2a','wcag2aa']});return r.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));});
  await page.locator('#kairos-notice').evaluate(node => node.hidden = true);
  await page.screenshot({path:`docs/evidencia/despues-escritorio-${name}.png`});
  await page.setViewportSize({width:390,height:844});await page.locator('.calculator').click();
  const box=await page.locator('.window').boundingBox();assert.ok(box.x>=0 && box.x+box.width<=391);
  await page.screenshot({path:`docs/evidencia/despues-movil-${name}.png`});
  await page.locator('.window .close-btn').click();
  await page.locator('#monitor-sistema').click();
  await page.frameLocator('.window iframe').locator('.advanced-actions summary').click();
  await page.frameLocator('.window iframe').getByRole('button',{name:'Apagar',exact:true}).click();
  await page.waitForURL('**/index.html');
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  results.push({name,available:true,status:'passed',a11y,monitorA11y,calendarMonthA11y,calendarA11y,errors,failures});
 } catch(e) {await page.screenshot({path:`docs/evidencia/fallo-${name}.png`});results.push({name,available:true,status:'failed',error:e.message,errors,failures});}
 await browser.close();
}
server?.kill();
console.log(JSON.stringify(results,null,2));
await (await import('node:fs/promises')).writeFile('docs/evidencia/browser-results.json',JSON.stringify(results,null,2)+'\n');
if(results.some(r=>r.status==='failed') || !results.some(r=>r.status==='passed')) process.exitCode=1;
