import assert from 'node:assert/strict';
// Rubén Quiroz: recorrido por interfaz. Recibe una página aislada, sin shell ni datos personales.
export async function verifyDesktop(page, base) {
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const results=[];
    const check=(name,actual,expected)=>{assert.equal(JSON.stringify(actual),JSON.stringify(expected),name);results.push(name);};
    await page.goto(base+'/resources/html/escritorio.html');await page.locator('.icono-escritorio').first().waitFor();
    check('Accesos iniciales',await page.locator('.icono-escritorio').allTextContents(),['Papelera de reciclaje','Chrome']);
    await page.locator('#boton-inicio').click();await page.locator('#app-search').fill('calcul');
    check('Filtro de Inicio',await page.locator('.app-launch:visible').allTextContents(),['Calculadora']);
    await page.locator('[data-app=calculator]').click();await page.locator('.window').waitFor();
    await page.locator('#desktop-surface').click({position:{x:1100,y:120}});
    check('Clic en fondo oculta ventana',await page.locator('.window').isHidden(),true);
    await page.locator('.kairos-restore').click();await page.locator('.close-btn').click();
    await page.locator('#boton-inicio').click();await page.locator('#app-search').fill('');
    await page.locator('[data-app=calculator]').dragTo(page.locator('#desktop-surface'),{targetPosition:{x:450,y:150}});
    check('Arrastre crea acceso',await page.locator('.icono-escritorio').filter({hasText:'Calculadora'}).count(),1);
    await page.reload();await page.locator('.icono-escritorio').filter({hasText:'Calculadora'}).waitFor();
    results.push('Acceso conserva posición al recargar');
    async function create(label,name) {
        await page.locator('#desktop-surface').click({button:'right',position:{x:700,y:140}});
        await page.locator('#contextMenuEscritorio summary').filter({hasText:'Nuevo'}).click();
        await page.locator('#contextMenuEscritorio button').filter({hasText:label}).click();
        await page.locator('#item-name').fill(name);await page.locator('#dialog-ok').click();
    }
    await create('Documento de texto','Verificación.txt');
    await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).click();
    let frame=page.frameLocator('.window iframe');await frame.locator('textarea').fill('Texto conservado');
    await frame.getByRole('button',{name:'Guardar',exact:true}).click();await frame.locator('#app-status').filter({hasText:'guardado'}).waitFor();
    await page.reload();await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).click();
    frame=page.frameLocator('.window iframe');check('Contenido persiste tras recarga',await frame.locator('textarea').inputValue(),'Texto conservado');
    await page.locator('.close-btn').click();
    await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).click({button:'right'});
    await page.locator('#contextMenuEscritorio summary').filter({hasText:'Abrir con'}).click();
    await page.locator('#contextMenuEscritorio button').filter({hasText:'Editor de texto'}).click();
    frame=page.frameLocator('.window iframe');await frame.locator('#textarea1[data-ready]').waitFor();check('Abrir con editor original',await frame.locator('#textarea1').inputValue(),'Texto conservado');
    await frame.locator('#textarea1').fill('Editado desde editor');await frame.locator('#save-button').click();await frame.getByRole('status').filter({hasText:'guardado'}).waitFor();
    await page.locator('.close-btn').click();
    await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).click({button:'right'});
    await page.getByRole('button',{name:'Mover a la papelera',exact:true}).click();
    check('Eliminación retira el icono',await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).count(),0);
    await page.locator('.icono-escritorio').filter({hasText:'Papelera de reciclaje'}).click();
    frame=page.frameLocator('.window iframe');await frame.getByRole('button',{name:'Restaurar',exact:true}).click();
    await page.locator('.icono-escritorio').filter({hasText:'Verificación.txt'}).waitFor();results.push('Papelera restaura el documento');await page.locator('.close-btn').click();
    await page.locator('.icono-escritorio').filter({hasText:'Chrome'}).click();frame=page.frameLocator('.window iframe');
    await frame.getByRole('searchbox',{name:'Buscar',exact:true}).fill('Wikipedia');await frame.getByRole('button',{name:'Buscar',exact:true}).click();
    check('Búsqueda muestra resultado',await frame.getByRole('heading',{name:'Wikipedia',exact:true}).count(),1);
    check('Búsqueda web sale del iframe',await frame.locator('a').getAttribute('target'),'_blank');
    await frame.getByRole('searchbox',{name:'Buscar',exact:true}).fill('WinRAR');await frame.getByRole('button',{name:'Buscar',exact:true}).click();
    await frame.getByRole('button',{name:'Descargar en KAIRÓS OS'}).click();await frame.locator('#app-status').filter({hasText:'completada'}).waitFor();
    check('Descarga virtual',await page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.desktop.v1')).items.some(x=>x.name==='WinRAR-demo.exe'&&x.parent==='downloads')),true);
    await page.locator('#hardware-audio').click();await page.locator('#virtual-volume').fill('23');
    check('Volumen simulado',await page.locator('#audio-label').textContent(),'23%');
    await page.locator('#virtual-wifi').uncheck();check('Wi-Fi simulado',await page.locator('#network-label').textContent(),'Sin red');
    await page.locator('#desktop-surface').click({position:{x:1100,y:120}});
    for(const [label,status] of [['Bloquear','paused'],['Suspender','paused'],['Reiniciar','running'],['Apagar','stopped']]) {
        await page.locator('#power-button').click();await page.getByRole('button',{name:label,exact:true}).click();
        check('Energía: '+label,await page.evaluate(()=>window.kairos.getState().status),status);
        if(label==='Reiniciar'||label==='Apagar')check(label+' cierra ventanas',await page.locator('.window').count(),0);
        await page.locator('#session-resume').click();
    }
    check('Sin errores de JavaScript',errors,[]);return results;
}
