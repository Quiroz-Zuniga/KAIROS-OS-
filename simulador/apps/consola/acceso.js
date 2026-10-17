import { arrancar, autenticar } from '../../js/core/sistema.js';
import { traducir as t } from '../../js/core/i18n.js';
import { crearRecuperacion } from '../../js/core/recuperacion.js';
import { prepararRestauracion } from '../../js/core/restauracion.js';

// Acceso por consola. La contraseña no se envía al intérprete ni al historial.
export function montarAccesoConsola(contenedor, repositorio, alIngresar, usuarioInicial = '', alRestaurar = () => {}) {
  document.body.classList.remove('modo-acceso', 'modo-instalador');
  document.body.classList.add('modo-terminal');
  contenedor.innerHTML = '<div class="barra-terminal"><h1>KAIRÓS OS</h1></div><div class="zona-terminal"><pre class="salida" role="log" aria-live="polite"></pre><form class="linea-comando"><label class="prompt" for="acceso-terminal"></label><input id="acceso-terminal" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="128" required></form><p class="error" role="alert"></p></div>';
  const input = contenedor.querySelector('input'), salida = contenedor.querySelector('pre'), prompt = contenedor.querySelector('label'), error = contenedor.querySelector('.error');
  const recuperacion = crearRecuperacion(repositorio);
  let usuario = usuarioInicial, ocupado = false, fase = usuarioInicial ? 'clave' : 'usuario', permiso, nueva = '';
  let restaurar;
  function cancelar() { usuario = ''; fase = 'usuario'; permiso = undefined; nueva = ''; restaurar = undefined; }
  function actualizar() {
    input.type = ['usuario','recuperarUsuario','restaurarSistema'].includes(fase) ? 'text' : 'password';
    input.autocomplete = fase === 'clave' ? 'current-password' : ['nueva','confirmar'].includes(fase) ? 'new-password' : 'off';
    input.value = '';
    prompt.textContent = t({usuario:'acceso.consoleUsuario',clave:'acceso.consoleClave',recuperarUsuario:'seguridad.usuario',respuesta:'seguridad.promptRespuesta',nueva:'seguridad.nueva',confirmar:'seguridad.confirmar',restaurarSistema:'restauracion.prompt'}[fase]);
    input.setAttribute('aria-label', prompt.textContent);
    input.focus();
  }
  salida.textContent = t('acceso.consoleInicio') + '\n' + t('seguridad.recuperar') + '\n' + t('restauracion.ayuda') + '\n\n';
  if (usuario) salida.textContent += t('acceso.consoleUsuario') + ' ' + usuario + '\n';
  actualizar();
  input.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && !ocupado) { cancelar(); error.textContent = ''; actualizar(); }
    if (evento.key === 'F2' && !ocupado) { evento.preventDefault(); cancelar(); fase = 'recuperarUsuario'; error.textContent = ''; actualizar(); }
  });
  contenedor.querySelector('form').addEventListener('submit', async evento => {
    evento.preventDefault();
    if (ocupado) return;
    error.textContent = '';
    const valor = input.value; input.value = '';
    if (fase === 'usuario' && valor.trim().toLowerCase() !== 'restaurar') {
      if (!valor.trim()) { error.textContent = t('error.accesoVacio'); return; }
      if (valor.trim().toLowerCase() === 'recuperar') { fase = 'recuperarUsuario'; salida.textContent += t('seguridad.inicio') + '\n'; actualizar(); return; }
      usuario = valor.trim().replace(/^usuario\s+/, ''); fase = 'clave';
      salida.textContent += t('acceso.consoleUsuario') + ' ' + usuario + '\n';
      actualizar(); return;
    }
    ocupado = true; input.disabled = true;
    try {
      if (fase === 'usuario') {
        restaurar = await prepararRestauracion(repositorio);
        fase = 'restaurarSistema'; salida.textContent += t('restauracion.confirmacion') + '\n'; return;
      }
      if (fase === 'restaurarSistema') {
        await restaurar(valor); cancelar(); alRestaurar(); return;
      }
      if (fase === 'recuperarUsuario') {
        usuario = valor.trim();
        salida.textContent += await recuperacion.preguntar(usuario) + '\n'; fase = 'respuesta'; return;
      }
      if (fase === 'respuesta') { permiso = await recuperacion.verificar(usuario, valor); fase = 'nueva'; return; }
      if (fase === 'nueva') {
        if (valor.length < 8 || valor.length > 128 || !valor.trim()) throw new Error(t('error.contrasena'));
        nueva = valor; fase = 'confirmar'; return;
      }
      if (fase === 'confirmar') {
        await permiso(nueva, valor); cancelar(); salida.textContent += t('seguridad.exito') + '\n'; return;
      }
      const { instalacion } = await arrancar(repositorio);
      if (!instalacion) throw new Error(t('terminal.errorConflicto'));
      const sesion = await autenticar(instalacion, usuario, valor);
      alIngresar(instalacion, sesion);
    } catch (fallo) {
      error.textContent = t(fallo.message || 'error.acceso');
      if (error.textContent.startsWith('[')) error.textContent = fallo.message || t('error.acceso');
      if (fase === 'clave') cancelar();
      else if (fase === 'confirmar') {
        nueva = '';
        if ([t('seguridad.expirado'), t('terminal.errorConflicto'), t('seguridad.noDisponible')].includes(error.textContent)) { permiso = undefined; fase = 'recuperarUsuario'; }
        else fase = 'nueva';
      }
    }
    finally { ocupado = false; if (input.isConnected) { input.disabled = false; actualizar(); } }
  });
}
