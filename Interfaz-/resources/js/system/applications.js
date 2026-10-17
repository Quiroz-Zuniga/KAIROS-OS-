const html = new URL('../../html/', import.meta.url).href;
const app = new URL('../../app/', import.meta.url).href;
// Rubén Quiroz: catálogo compartido y rutas de demostración de interfaz.
// IDs y rutas originales: una instancia por aplicación; dock y accesos comparten PID.
export const applications = Object.freeze(Object.fromEntries([
    ['antivirus','Antivirus',app+'antivirus/indexAntivirus.html','antivirus.png',32],
    ['google','Chrome',html+'virtual.html?mode=browser','cromo.png',96],
    ['camara','Cámara',html+'virtual.html?mode=camara','camera-solid 1.png',96],
    ['pac_man','Pac Man',app+'pac_man/index.html','juego.png',64],
    ['temporisador','Temporizador',app+'temp/Temporizador.html','temporizador.png',16],
    ['webadpp','Clima',html+'virtual.html?mode=webadpp','tiempo.png',32],
    ['explorer','Explorador de archivos',html+'virtual.html?mode=files','folder-regular 1.png',32],
    ['calculator','Calculadora',html+'calculadora.html','calculator-solid 1.png',16],
    ['editor','Editor de texto',html+'editor.html','clipboard-regular 1.png',32],
    ['video','Videos',html+'virtual.html?mode=video','video-solid 1.png',96],
    ['tasks','Gestor de tareas',app+'Gestor-Tareas-Proyecto-ED-UPh/index.html','test_tasks_list_clipboard_todo_icon_191634 1.png',32],
    ['spotify','KAIRÓS OS Beats',html+'virtual.html?mode=spotify','musica.png',64],
    ['imagenes','Imágenes',html+'virtual.html?mode=imagenes','imagen.png',64],
    ['calendar','Calendario',html+'calendario.html','calendar-kairos.svg',32],
    ['recycle','Papelera de reciclaje',html+'virtual.html?mode=recycle','recycle-kairos.svg',16],
    ['procesos','Monitor del sistema',html+'procesos.html','test_tasks_list_clipboard_todo_icon_191634 1.png',32]
].map(([id,title,htmlUrl,icon,memory]) => [id,Object.freeze({id,title,htmlUrl,...(id==='calendar'?{width:1180,height:760}:id==='procesos'?{width:1100,height:720}:{}),icon:new URL('../../assets/images/'+icon, import.meta.url).href,memory})])));
export const aliases = Object.freeze({'explorer-files':'explorer',ed_texto:'editor',temporizador:'temporisador'});
