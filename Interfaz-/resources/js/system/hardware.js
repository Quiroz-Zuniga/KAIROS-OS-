// Rubén Quiroz: controles de demostración sin consultar hardware, red ni permisos.
export function initializeHardwarePanel() {
    const panel=document.querySelector('#hardware-panel');
    const triggers=[...document.querySelectorAll('.hardware-trigger')];
    let muted=false;
    const volume=document.querySelector('#virtual-volume');
    const render=()=>{document.querySelector('#audio-label').textContent=muted?'Silencio':volume.value+'%';document.querySelector('#virtual-mute').textContent=muted?'Activar sonido':'Silenciar';};
    volume.addEventListener('input',()=>{muted=false;render();});
    document.querySelector('#virtual-mute').onclick=()=>{muted=!muted;render();};
    document.querySelector('#virtual-wifi').onchange=event=>{document.querySelector('#network-label').textContent=event.target.checked?'UPHOS':'Sin red';document.querySelector('#virtual-network').textContent=event.target.checked?'Conectado a UPHOS Campus':'Wi-Fi virtual desactivado';};
    triggers.forEach(trigger=>trigger.onclick=()=>{const open=panel.hidden||trigger.getAttribute('aria-expanded')!=='true';triggers.forEach(t=>t.setAttribute('aria-expanded','false'));panel.hidden=!open;if(open)trigger.setAttribute('aria-expanded','true');});
    document.addEventListener('click',event=>{if(!panel.contains(event.target)&&!event.target.closest('.hardware-trigger')){panel.hidden=true;triggers.forEach(t=>t.setAttribute('aria-expanded','false'));}});
    render();
}
