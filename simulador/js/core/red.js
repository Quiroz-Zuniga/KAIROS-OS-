import { traducir as t } from './i18n.js';
export function siguienteDireccion(cursor) {
  const siguiente = cursor == null ? (crypto.getRandomValues(new Uint32Array(1))[0] % 8000000) + 2 : cursor + 1;
  if (!Number.isInteger(siguiente) || siguiente < 2 || siguiente > 0xfffffe) throw new Error('red.errorDireccion');
  return { cursor: siguiente, ip: `10.${siguiente >>> 16}.${(siguiente >>> 8) & 255}.${siguiente & 255}` };
}
export const ipv4Valida = valor => typeof valor === 'string' && /^\d{1,3}(\.\d{1,3}){3}$/.test(valor) && valor.split('.').every(n => Number(n) <= 255);
export function crearRed(ip = siguienteDireccion().ip) {
  return { ip, conectada: true, dns: { 'google.com': '203.0.113.10', 'www.google.com': '203.0.113.10', 'kairos.local': ip }, rutas: [{ destino: '0.0.0.0/0', puerta: '10.0.0.1' }], puertos: [] };
}
export function redValida(red) {
  return red == null || (ipv4Valida(red.ip) && typeof red.conectada === 'boolean' && red.dns && typeof red.dns === 'object' && !Array.isArray(red.dns) && Object.keys(red.dns).length<=100 && Object.entries(red.dns).every(([n,v]) => dominioValido(n) && ipv4Valida(v)) &&
    Array.isArray(red.rutas) && red.rutas.length<=100 && red.rutas.every(r=>r && typeof r.destino==='string' && ipv4Valida(r.destino.split('/')[0]) && /^\d+$/.test(r.destino.split('/')[1]??'') && +r.destino.split('/')[1]<=32 && ipv4Valida(r.puerta)) &&
    Array.isArray(red.puertos) && red.puertos.length<=100 && new Set(red.puertos.map(p=>p?.numero)).size===red.puertos.length && red.puertos.every(p=>p && Number.isInteger(p.numero) && p.numero>=1 && p.numero<=65535 && typeof p.servicio==='string' && p.servicio.trim() && p.servicio.length<=40));
}
export const dominioValido = n => typeof n === 'string' && n.length <= 253 && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(n);
export const COMANDOS_RED = new Set('ip ping red conectar desconectar dns resolver registrardns borrardns rutasred agregarruta quitarruta puertos abrirpuerto cerrarpuerto'.split(' '));
export function ejecutarRed(nombre, args, datos) {
  if (!COMANDOS_RED.has(nombre)) return null;
  const red = datos.red;
  if (!red) throw new Error('red.sinConfigurar');
  const consulta = texto => ({ texto: t('red.simulada') + '\n' + texto });
  const mutacion = () => ({ mutacion: true, clave: 'red.actualizada' });
  const resolver = valor => {
    const host = valor.toLowerCase();
    if (!dominioValido(host) && !ipv4Valida(host)) throw new Error('red.errorHost');
    const ip = ipv4Valida(host) ? host : Object.hasOwn(red.dns, host) ? red.dns[host] : null;
    if (!ip) throw new Error('red.errorDNS');
    return ip;
  };
  switch (nombre) {
    case 'ip': return consulta(red.ip);
    case 'red': return consulta(t('red.estado', { ip: red.ip, estado: t(red.conectada ? 'red.conectada' : 'red.desconectada') }));
    case 'ping': {
      if (!red.conectada) throw new Error('red.errorConexion');
      const ip = resolver(args[0]); const cantidad = args[1] ?? '4';
      if (!/^\d+$/.test(cantidad) || +cantidad < 1 || +cantidad > 10) throw new Error('red.errorCantidad');
      return consulta(Array.from({length:+cantidad},(_,i)=>t('red.respuesta',{ip,numero:i+1,tiempo:3+i})).join('\n') + '\n' + t('red.estadistica',{cantidad}));
    }
    case 'conectar': red.conectada = true; return mutacion();
    case 'desconectar': red.conectada = false; return mutacion();
    case 'dns': return consulta(Object.entries(red.dns).map(([n,ip])=>`${n} -> ${ip}`).join('\n'));
    case 'resolver': return consulta(resolver(args[0]));
    case 'registrardns': {
      const n=args[0].toLowerCase(); if (!dominioValido(n) || !ipv4Valida(args[1])) throw new Error('red.errorHost');
      if (!Object.hasOwn(red.dns,n) && Object.keys(red.dns).length >= 100) throw new Error('red.errorLimite');
      Object.defineProperty(red.dns,n,{value:args[1],enumerable:true,writable:true,configurable:true}); return mutacion();
    }
    case 'borrardns': if (!Object.hasOwn(red.dns,args[0].toLowerCase())) throw new Error('red.errorDNS'); delete red.dns[args[0].toLowerCase()]; return mutacion();
    case 'rutasred': return consulta(red.rutas.map(r=>`${r.destino} -> ${r.puerta}`).join('\n') || t('terminal.vacio'));
    case 'agregarruta': {
      const [ip,prefijo]=args[0].split('/');
      if (!ipv4Valida(ip) || !/^\d+$/.test(prefijo ?? '') || +prefijo>32 || !ipv4Valida(args[1])) throw new Error('red.errorHost');
      if (red.rutas.some(r=>r.destino===args[0]) || red.rutas.length>=100) throw new Error('red.errorLimite');
      red.rutas.push({destino:args[0],puerta:args[1]}); return mutacion();
    }
    case 'quitarruta': if (!red.rutas.some(r=>r.destino===args[0])) throw new Error('terminal.errorNoExiste'); red.rutas=red.rutas.filter(r=>r.destino!==args[0]); return mutacion();
    case 'puertos': return consulta(red.puertos.map(p=>`${p.numero} -> ${p.servicio}`).join('\n') || t('terminal.vacio'));
    default: {
      if (!/^\d+$/.test(args[0]) || +args[0]<1 || +args[0]>65535) throw new Error('red.errorPuerto');
      const numero=+args[0];
      if(nombre==='abrirpuerto') {
        if (!args[1].trim() || args[1].length>40 || red.puertos.some(p=>p.numero===numero) || red.puertos.length>=100) throw new Error('red.errorLimite');
        red.puertos.push({numero,servicio:args[1]});
      } else { if(!red.puertos.some(p=>p.numero===numero))throw new Error('terminal.errorNoExiste');red.puertos=red.puertos.filter(p=>p.numero!==numero); }
      return mutacion();
    }
  }
}
