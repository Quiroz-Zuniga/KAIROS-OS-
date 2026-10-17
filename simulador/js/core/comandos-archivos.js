import { rutaVisible } from './herramientas.js';
import { traducir as t } from './i18n.js';
export const COMANDOS_ARCHIVOS = new Set('editar cabeza cola numerar ordenar unicos invertir mayusculas minusculas reemplazar recortar agregarlinea insertarlinea editarlinea borrarlinea dividir unir duplicar tocar ocultar mostrar atributos marcar desmarcar marcas sololectura escribible suma hexadecimal codificar decodificar archivosvacios carpetasvacias extension nombrearchivo padre normalizar existe tamano'.split(' '));
export async function ejecutarArchivo(nombre, args, { servicio, ruta, actual }) {
  if (!COMANDOS_ARCHIVOS.has(nombre)) return null;
  const destino = args.length ? ruta(args[0]) : actual;
  const texto = valor => ({ texto: String(valor) });
  const numero = (valor, defecto, maximo) => {
    if (valor == null) return defecto;
    if (!/^\d+$/.test(valor) || +valor < 1 || +valor > maximo) throw new Error('archivo.errorNumero');
    return +valor;
  };
  const guardar = contenido => { servicio.escribir(destino, contenido); return { mutacion:true, clave:'herramientas.guardado', parametros:{ruta:rutaVisible(destino)} }; };
  const cambiarAtributo = cambios => { servicio.atributos(destino,cambios); return {mutacion:true,clave:'archivo.atributoGuardado'}; };
  switch(nombre) {
    case 'normalizar': return texto(rutaVisible(destino));
    case 'padre': return texto(rutaVisible(destino.slice(0,destino.lastIndexOf('/')) || '/'));
    case 'nombrearchivo': return texto(destino.split('/').at(-1));
    case 'extension': return texto(/\.[^.]+$/.exec(destino.split('/').at(-1))?.[0] ?? '');
    case 'existe': try { servicio.nodo(destino);return {clave:'archivo.existe'}; } catch(e) {if(e.message!=='terminal.errorNoExiste')throw e;return {clave:'archivo.noExiste'};}
    case 'tamano': return texto(new TextEncoder().encode(servicio.leer(destino)).length + ' bytes');
    case 'atributos': { const n=servicio.nodo(destino); return texto(t('archivo.atributos',{oculto:t(n.oculto?'live.si':'live.no'),lectura:t(n.soloLectura?'live.si':'live.no'),marcas:(n.marcas??[]).join(', ') || '—'})); }
    case 'ocultar': return cambiarAtributo({oculto:true});
    case 'mostrar': return cambiarAtributo({oculto:false});
    case 'sololectura': return cambiarAtributo({soloLectura:true});
    case 'escribible': return cambiarAtributo({soloLectura:false});
    case 'marcar': case 'desmarcar': {
      if(!/^[\p{L}\p{N}_-]{1,30}$/u.test(args[1]))throw new Error('archivo.errorMarca');
      const marcas=servicio.nodo(destino).marcas??[];
      if(nombre==='marcar' && marcas.length>=20 && !marcas.includes(args[1]))throw new Error('archivo.errorMarca');
      return cambiarAtributo({marcas:nombre==='marcar'?[...new Set([...marcas,args[1]])]:marcas.filter(m=>m!==args[1])});
    }
    case 'marcas': case 'archivosvacios': case 'carpetasvacias': {
      servicio.carpeta(destino);const todos=servicio.descendientes(destino);
      const filtrados=todos.filter(n=>nombre==='marcas'?(n.marcas??[]).length:nombre==='archivosvacios'?n.tipo==='archivo' && !n.contenido:n.tipo==='carpeta' && !todos.some(c=>c.ruta!==n.ruta&&c.ruta.startsWith(n.ruta+'/')));
      return texto(filtrados.map(n=>rutaVisible(n.ruta)+(nombre==='marcas'?' · '+n.marcas.join(', '):'')).join('\n') || t('terminal.vacio'));
    }
    case 'tocar': try { servicio.leer(destino); return cambiarAtributo({modificado:new Date().toISOString()}); } catch(e) {if(e.message!=='terminal.errorNoExiste')throw e;servicio.crear('archivo',destino);return {mutacion:true,clave:'terminal.crear',parametros:{ruta:rutaVisible(destino)}};}
    case 'duplicar': servicio.copiar(destino,ruta(args[1]));return {mutacion:true,clave:'terminal.copiar',parametros:{ruta:rutaVisible(ruta(args[1]))}};
    case 'unir': { const contenido=servicio.leer(destino)+servicio.leer(ruta(args[1]));servicio.crear('archivo',ruta(args[2]));servicio.escribir(ruta(args[2]),contenido);return {mutacion:true,clave:'herramientas.guardado',parametros:{ruta:rutaVisible(ruta(args[2]))}}; }
  }
  const contenido = servicio.leer(destino);
  const lineas = contenido.split('\n');
  switch(nombre) {
    case 'editar': return { editor:{ruta:destino,contenido}, texto:t('editor.abriendo',{ruta:rutaVisible(destino)}) };
    case 'cabeza': return texto(lineas.slice(0,numero(args[1],10,10000)).join('\n'));
    case 'cola': return texto(lineas.slice(-numero(args[1],10,10000)).join('\n'));
    case 'numerar': return texto(lineas.map((l,i)=>`${i+1}  ${l}`).join('\n'));
    case 'ordenar': return guardar([...lineas].sort().join('\n'));
    case 'unicos': return guardar([...new Set(lineas)].join('\n'));
    case 'invertir': return guardar([...lineas].reverse().join('\n'));
    case 'mayusculas': return guardar(contenido.toUpperCase());
    case 'minusculas': return guardar(contenido.toLowerCase());
    case 'recortar': return guardar(lineas.map(l=>l.trim()).join('\n'));
    case 'reemplazar': if(!args[1])throw new Error('archivo.errorTexto');return guardar(contenido.split(args[1]).join(args[2]));
    case 'agregarlinea': return guardar(contenido+(contenido && !contenido.endsWith('\n')?'\n':'')+args[1]);
    case 'insertarlinea': case 'editarlinea': case 'borrarlinea': {
      const i=numero(args[1],1,lineas.length+(nombre==='insertarlinea'?1:0))-1;
      if(nombre==='insertarlinea')lineas.splice(i,0,args[2]);else if(nombre==='editarlinea')lineas[i]=args[2];else lineas.splice(i,1);
      return guardar(lineas.join('\n'));
    }
    case 'dividir': {
      const ancho=numero(args[1],10,10000);const carpeta=ruta(args[2]);servicio.crear('carpeta',carpeta);
      if(Math.ceil(lineas.length/ancho)>1000)throw new Error('archivo.errorNumero');
      for(let i=0;i<lineas.length;i+=ancho){const p=carpeta+`/parte-${i/ancho+1}.txt`;servicio.crear('archivo',p);servicio.escribir(p,lineas.slice(i,i+ancho).join('\n'));}
      return {mutacion:true,clave:'herramientas.guardado',parametros:{ruta:rutaVisible(carpeta)}};
    }
    case 'suma': { const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(contenido));return texto([...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')); }
    case 'hexadecimal': return texto([...new TextEncoder().encode(contenido)].map(b=>b.toString(16).padStart(2,'0')).join(' '));
    case 'codificar': { const bytes=new TextEncoder().encode(contenido);let binario='';for(let i=0;i<bytes.length;i+=8192)binario+=String.fromCharCode(...bytes.subarray(i,i+8192));return guardar(btoa(binario)); }
    case 'decodificar': try { const binario=atob(contenido);return guardar(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binario,c=>c.charCodeAt(0)))); }catch(e){if(e.message.startsWith('terminal.'))throw e;throw new Error('archivo.errorBase64');}
    default: throw new Error('consola.desconocido');
  }
}
