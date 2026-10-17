import { crearCredencial, verificarCredencial } from './credenciales.js';
import { obtenerUsuarios, encontrarUsuario } from './usuarios.js';
import { PREGUNTAS_SEGURIDAD, normalizarRespuesta, recuperacionValida } from './preguntas-seguridad.js';
import { traducir as t } from './i18n.js';

// El permiso para cambiar la clave se crea solo tras verificar la respuesta.
// Permanece en memoria, caduca y no se publica en el estado persistente.
export function crearRecuperacion(repositorio, ahora = () => Date.now()) {
  const cuenta = async usuario => {
    const datos = await repositorio.cargar();
    const elegida = datos && encontrarUsuario(datos, usuario);
    if (!elegida || elegida.bloqueado || !elegida.recuperacion || !recuperacionValida(elegida.recuperacion)) throw new Error(t('seguridad.noDisponible'));
    return { datos, elegida };
  };
  let intentos = 0, bloqueoHasta = 0;
  return {
    async preguntar(usuario) {
      const { elegida } = await cuenta(usuario);
      return t(PREGUNTAS_SEGURIDAD[elegida.recuperacion.pregunta]);
    },
    async verificar(usuario, respuesta) {
      if (ahora() < bloqueoHasta) throw new Error(t('seguridad.bloqueo'));
      const { datos, elegida } = await cuenta(usuario);
      if (typeof respuesta !== 'string' || respuesta.length > 128 || !await verificarCredencial(normalizarRespuesta(respuesta), elegida.recuperacion.credencial)) {
        intentos++;
        if (intentos >= 5) { bloqueoHasta = ahora() + 60000; intentos = 0; }
        throw new Error(t(ahora() < bloqueoHasta ? 'seguridad.bloqueo' : 'seguridad.incorrecta'));
      }
      intentos = 0;
      const emitido = ahora(), identidad = elegida.usuario;
      const sello = JSON.stringify([datos.fecha, elegida.credencial, elegida.recuperacion]);
      let usado = false;
      return async (nueva, confirmacion) => {
        if (usado || ahora() - emitido > 300000) throw new Error(t('seguridad.expirado'));
        if (typeof nueva !== 'string' || nueva.length < 8 || nueva.length > 128 || !nueva.trim()) throw new Error(t('error.contrasena'));
        if (nueva !== confirmacion) throw new Error(t('error.confirmacion'));
        const actual = await cuenta(identidad);
        if (sello !== JSON.stringify([actual.datos.fecha, actual.elegida.credencial, actual.elegida.recuperacion])) throw new Error(t('terminal.errorConflicto'));
        if (await verificarCredencial(nueva, actual.elegida.credencial)) throw new Error(t('seguridad.claveAnterior'));
        for (const otra of obtenerUsuarios(actual.datos)) if (otra.usuario !== identidad && await verificarCredencial(nueva, otra.credencial)) throw new Error(t('cuenta.errorClaveRepetida'));
        const copia = structuredClone(actual.datos), credencial = await crearCredencial(nueva);
        copia.usuarios = obtenerUsuarios(copia).map(u => u.usuario === identidad ? { ...u, credencial } : u);
        if (copia.usuario.usuario === identidad) copia.usuario.credencial = credencial;
        copia.revision = (actual.datos.revision ?? 0) + 1;
        await repositorio.actualizar(copia, actual.datos.revision ?? 0, actual.datos.fecha);
        usado = true;
      };
    }
  };
}
