export function initializeDockMenu(launchMonitor) {
    const bar=document.querySelector('.barra-tareas'),menu=document.querySelector('#dock-menu'),options=document.querySelector('#dock-options');
    let previous;
    function close(restore=false) {menu.hidden=true;options.setAttribute('aria-expanded','false');if(restore)previous?.focus();}
    function open(event) {
        previous=document.activeElement;menu.hidden=false;options.setAttribute('aria-expanded','true');
        const rect=bar.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(event?.clientX||rect.right-230,innerWidth-menu.offsetWidth-8))+'px';
        menu.style.top=Math.max(64,Math.min(event?.clientY||rect.top-10,rect.top-menu.offsetHeight-10))+'px';
        menu.querySelector('button').focus();
    }
    options.addEventListener('click',event=>{event.stopPropagation();if(menu.hidden)open();else close(true);});
    bar.addEventListener('contextmenu',event=>{event.preventDefault();event.stopPropagation();open(event);});
    bar.addEventListener('click',event=>{if(!event.target.closest('button,a')){event.stopPropagation();if(menu.hidden)open(event);else close();}});
    bar.addEventListener('keydown',event=>{if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){event.preventDefault();open();}});
    document.querySelector('#dock-view-processes').addEventListener('click',()=>{close();try{launchMonitor();}catch(error){window.dispatchEvent(new CustomEvent('uphos:notice',{detail:error.message}));}});
    document.addEventListener('click',event=>{if(!menu.contains(event.target)&&!bar.contains(event.target))close();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden)close(true);});
    window.addEventListener('resize',()=>close());
}
