import { traducir as t } from './i18n.js';
import { credencialValida, verificarCredencial } from './credenciales.js';
import { IDIOMAS, TECLADOS, ZONAS } from './configuracion.js';
import { encontrarUsuario, usuariosValidos } from './usuarios.js';
import { usuarioValido } from './nombres-usuario.js';
import { crearRed, redValida } from './red.js';
import { recuperacionValida } from './preguntas-seguridad.js';

export function instalacionValida(datos) {
  return datos?.version === 1 && datos.estado === 'instalado' &&
    redValida(datos.red) &&
    ['Plus', 'Pro'].includes(datos.edicion ?? 'Plus') && ['32', '64'].includes(datos.arquitectura ?? '64') && usuariosValidos(datos) &&
    typeof datos.usuario?.nombre === 'string' && usuarioValido(datos.usuario?.usuario) && credencialValida(datos.usuario.credencial) && recuperacionValida(datos.usuario.recuperacion) &&
    Array.isArray(datos.archivos) && datos.archivos.some(archivo => archivo.ruta === '/') &&
    datos.disco?.particiones?.[0]?.formato === 'UPHFS' &&
    Number.isInteger(datos.disco.particiones[0].capacidadGiB) && datos.disco.particiones[0].capacidadGiB >= 8 && datos.disco.particiones[0].capacidadGiB <= 64 &&
    (datos.preferencias?.idioma === 'es-HN' || Object.hasOwn(IDIOMAS, datos.preferencias?.idioma)) && (datos.preferencias?.teclado === 'espanol' || Object.hasOwn(TECLADOS, datos.preferencias?.teclado)) && ZONAS.includes(datos.preferencias?.zona);
}
export async function arrancar(repositorio) {
  let instalacion = await repositorio.cargar();
  if (instalacion !== null && !instalacionValida(instalacion)) throw new Error(t('error.instalacion'));
  if (instalacion && !instalacion.red && repositorio.actualizar) {
    const nueva = structuredClone(instalacion); nueva.red = crearRed(repositorio.reservarIP ? await repositorio.reservarIP() : undefined); nueva.revision = (instalacion.revision ?? 0) + 1;
    await repositorio.actualizar(nueva, instalacion.revision ?? 0, instalacion.fecha); instalacion = nueva;
  }
  return { pantalla: instalacion ? 'acceso' : 'bienvenida', instalacion };
}
export async function autenticar(instalacion, usuario, contrasena) {
  if (!usuario.trim() || !contrasena) throw new Error(t('error.accesoVacio'));
  const cuenta = encontrarUsuario(instalacion, usuario);
  if (!cuenta || cuenta.bloqueado || !(await verificarCredencial(contrasena, cuenta.credencial))) {
    throw new Error(t('error.acceso'));
  }
  return { usuario: cuenta.usuario, nombre: cuenta.nombre };
}
