import { IDIOMAS, TECLADOS, ZONAS } from './configuracion.js';
import { obtenerUsuarios, esAdministrador, encontrarUsuario } from './usuarios.js';
import { mismoUsuario } from './nombres-usuario.js';
import { licenciaValida } from './licencias.js';
import { traducir as t, seleccionarIdioma } from './i18n.js';
export const COMANDOS_CONFIGURACION = new Set('teclado zona hostname tema idiomapermanente perfil cambiarnombre bloquearusuario desbloquearusuario grupos creargrupo borrargrupo agregargrupo quitargrupo licencia activar'.split(' '));
export function ejecutarConfiguracion(nombre,args,datos,sesion) {
  if(!COMANDOS_CONFIGURACION.has(nombre))return null;
  const modificado=()=>({mutacion:true,clave:'config.guardada'});
  const admin=()=>{if(datos.estado!=='instalado'||!esAdministrador(datos,sesion.usuario))throw new Error('cuenta.errorAdministrador');};
  const cuentas=()=>{datos.usuarios=obtenerUsuarios(datos).map(u=>({...u}));return datos.usuarios;};
  const cuenta=usuario=>{cuentas();const u=encontrarUsuario(datos,usuario);if(!u)throw new Error('cuenta.errorNoExiste');return u;};
  switch(nombre){
    case 'teclado':case 'zona':case 'hostname':case 'tema':case 'idiomapermanente':{
      const clave=nombre==='idiomapermanente'?'idioma':nombre;
      if(!args.length)return {texto:String(datos.preferencias[clave]??(clave==='hostname'?'kairos':clave==='tema'?'oscuro':'—'))};
      const v=args[0];
      if((clave==='teclado'&&!Object.hasOwn(TECLADOS,v))||(clave==='zona'&&!ZONAS.includes(v))||(clave==='idioma'&&!Object.hasOwn(IDIOMAS,v))||(clave==='tema'&&!['oscuro','claro'].includes(v))||(clave==='hostname'&&!/^[a-z][a-z0-9-]{1,30}$/.test(v)))throw new Error('config.errorValor');
      datos.preferencias[clave]=v;return {...modificado(),idioma:clave==='idioma'?v:undefined,tema:clave==='tema'?v:undefined};
    }
    case 'perfil': {const u=encontrarUsuario(datos,args[0]??sesion.usuario);if(!u)throw new Error('cuenta.errorNoExiste');return {texto:t('config.perfil',{usuario:u.usuario,nombre:u.nombre,estado:t(u.bloqueado?'config.bloqueado':'config.activo'),grupos:Object.entries(datos.grupos??{}).filter(([,g])=>g.includes(u.usuario)).map(([n])=>n).join(', ')||'—'})};}
    case 'cambiarnombre': {if(!args[0].trim()||args[0].length>80)throw new Error('config.errorValor');const u=cuenta(sesion.usuario);u.nombre=args[0].trim();if(u.usuario===datos.usuario.usuario)datos.usuario={...datos.usuario,nombre:u.nombre};return modificado();}
    case 'bloquearusuario':case 'desbloquearusuario':admin();if(mismoUsuario(args[0],datos.usuario.usuario)||mismoUsuario(args[0],sesion.usuario))throw new Error('cuenta.errorPrincipal');cuenta(args[0]).bloqueado=nombre==='bloquearusuario';return modificado();
    case 'grupos':return {texto:Object.entries(datos.grupos??{}).map(([n,u])=>`${n}: ${u.join(', ')}`).join('\n')||t('terminal.vacio')};
    case 'creargrupo':case 'borrargrupo':case 'agregargrupo':case 'quitargrupo':{
      admin();if(!/^[a-z][a-z0-9_-]{2,23}$/.test(args[0]))throw new Error('config.errorValor');datos.grupos??={};const n=args[0];
      if(nombre==='creargrupo'){if(Object.hasOwn(datos.grupos,n)||Object.keys(datos.grupos).length>=50)throw new Error('terminal.errorExiste');Object.defineProperty(datos.grupos,n,{value:[],enumerable:true,writable:true,configurable:true});}
      else{if(!Object.hasOwn(datos.grupos,n))throw new Error('terminal.errorNoExiste');if(nombre==='borrargrupo')delete datos.grupos[n];else{const miembro=cuenta(args[1]).usuario;datos.grupos[n]=nombre==='agregargrupo'?[...new Set([...datos.grupos[n],miembro])]:datos.grupos[n].filter(u=>!mismoUsuario(u,miembro));}}
      return modificado();
    }
    case 'licencia':return {texto:t(datos.licencia?'licencia.activa':'licencia.inactiva',{edicion:datos.edicion??'Plus'})};
    case 'activar':admin();if(datos.edicion!=='Pro'||!licenciaValida(args[0]))throw new Error('licencia.error');datos.licencia=args[0].trim().toUpperCase();return modificado();
  }
}
