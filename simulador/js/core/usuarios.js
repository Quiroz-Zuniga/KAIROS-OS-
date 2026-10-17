import { crearCredencial, credencialValida, verificarCredencial } from './credenciales.js';
import { validarPaso } from '../installer/modelo.js';
import { licenciaValida } from './licencias.js';
import { recuperacionValida, validarSeguridad, normalizarRespuesta, PREGUNTAS_SEGURIDAD } from './preguntas-seguridad.js';
import { usuarioValido, identidadUsuario, mismoUsuario } from './nombres-usuario.js';

export const obtenerUsuarios = datos => datos.usuarios ?? [datos.usuario];
export const encontrarUsuario = (datos, nombre) => obtenerUsuarios(datos).find(u => mismoUsuario(u.usuario,nombre));
async function claveUnica(lista, clave, excluir) {
  for (const u of lista) if (u.usuario !== excluir && credencialValida(u.credencial) && await verificarCredencial(clave, u.credencial)) throw new Error('cuenta.errorClaveRepetida');
}
export function usuariosValidos(datos) {
  const usuarios = obtenerUsuarios(datos);
  return Array.isArray(usuarios) && usuarios.length > 0 && usuarios.length <= 8 && new Set(usuarios.map(u => identidadUsuario(u?.usuario))).size === usuarios.length && usuarios.every(u => typeof u?.nombre === 'string' && usuarioValido(u.usuario) && credencialValida(u.credencial) && recuperacionValida(u.recuperacion)) && usuarios.some(u => u.usuario === datos.usuario?.usuario);
}
export function esAdministrador(datos, usuario) { return mismoUsuario(usuario, datos.usuario.usuario); }
export async function modificarCuenta(datos, actualIngresado, args) {
  const actual = encontrarUsuario(datos,actualIngresado)?.usuario ?? actualIngresado;
  const [accion, ingresado, nombre, contrasena] = args;
  const usuario = accion === 'crear' ? ingresado : encontrarUsuario(datos,ingresado)?.usuario ?? ingresado;
  const lista = obtenerUsuarios(datos);
  if (accion === 'crear') {
    if (!esAdministrador(datos, actual)) throw new Error('cuenta.errorAdministrador');
    if (datos.edicion === 'Pro' && !licenciaValida(datos.licencia)) throw new Error('licencia.error');
    if (args.length === 3) return { secreto: true, ordenSecreta: { nombre: 'cuenta', argumentos: args }, clave: 'live.pedirClave' };
    if (args.length !== 4) throw new Error('cuenta.errorSintaxis');
    if (lista.some(u => mismoUsuario(u.usuario,usuario))) throw new Error('cuenta.errorExiste');
    if (lista.length >= (datos.edicion === 'Pro' ? 8 : 3)) throw new Error('cuenta.errorLimite');
    const error = validarPaso('usuario', { usuario, nombre }) || validarPaso('contrasena', { contrasena, confirmacion: contrasena });
    if (error) { const fallo = new Error('live.errorValidacion'); fallo.parametros = { detalle: error }; throw fallo; }
    const nueva = { usuario, nombre: nombre.trim(), credencial: await crearCredencial(contrasena) };
    await claveUnica(lista, contrasena);
    datos.usuarios = [...lista, nueva];
    for (const ruta of ['/home', `/home/${usuario}`]) if (!datos.archivos.some(n => n.ruta === ruta)) datos.archivos.push({ ruta, tipo: 'carpeta' });
  } else if (accion === 'seguridad') {
    if (!Object.hasOwn(PREGUNTAS_SEGURIDAD, args[1])) throw new Error('seguridad.errorPregunta');
    if (args.length === 2) return { secreto: true, ordenSecreta: { nombre: 'cuenta', argumentos: args }, clave: 'seguridad.pedirRespuesta' };
    if (args.length !== 3) throw new Error('cuenta.errorSintaxis');
    const error = validarSeguridad(args[1], args[2]);
    if (error) throw new Error(error);
    const recuperacion = { pregunta: args[1], credencial: await crearCredencial(normalizarRespuesta(args[2])) };
    datos.usuarios = lista.map(u => u.usuario === actual ? { ...u, recuperacion } : u);
    if (datos.usuario.usuario === actual) datos.usuario.recuperacion = recuperacion;
  } else if (accion === 'clave') {
    if (args.length === 1) return { secreto: true, ordenSecreta: { nombre: 'cuenta', argumentos: args }, clave: 'live.pedirClave' };
    if (args.length !== 2) throw new Error('cuenta.errorSintaxis');
    const clave = args[1];
    const error = validarPaso('contrasena', { contrasena: clave, confirmacion: clave });
    if (error) { const fallo = new Error('live.errorValidacion'); fallo.parametros = { detalle: error }; throw fallo; }
    datos.usuarios = lista.map(u => ({ ...u }));
    const credencial = await crearCredencial(clave);
    await claveUnica(lista, clave, actual);
    datos.usuarios.find(u => u.usuario === actual).credencial = credencial;
    if (datos.usuario.usuario === actual) datos.usuario = { ...datos.usuario, credencial };
  } else if (accion === 'borrar') {
    if (!esAdministrador(datos, actual)) throw new Error('cuenta.errorAdministrador');
    if (args.length !== 3 || args[2] !== 'confirmar') throw new Error('cuenta.errorSintaxis');
    if (usuario === datos.usuario.usuario || usuario === actual) throw new Error('cuenta.errorPrincipal');
    if (!lista.some(u => u.usuario === usuario)) throw new Error('cuenta.errorNoExiste');
    datos.usuarios = lista.filter(u => u.usuario !== usuario);
    for (const grupo of Object.values(datos.grupos ?? {})) for (let i=grupo.length-1;i>=0;i--) if (grupo[i]===usuario) grupo.splice(i,1);
    datos.archivos = datos.archivos.filter(n => n.ruta !== `/home/${usuario}` && !n.ruta.startsWith(`/home/${usuario}/`));
  } else throw new Error('cuenta.errorSintaxis');
  return { clave: 'cuenta.actualizada' };
}
