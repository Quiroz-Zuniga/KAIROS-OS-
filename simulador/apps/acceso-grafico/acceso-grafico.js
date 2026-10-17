import { traducir as t } from '../../js/core/i18n.js';
const escapar = valor => String(valor).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const texto = clave => escapar(t(clave));
const campo = (nombre, etiqueta, valor, tipo, extra) => `<label class="campo">${escapar(etiqueta)}<input name="${nombre}" type="${tipo}" value="${escapar(valor)}" ${extra}></label>`;
// Future graphical login: deliberately not imported by the current console interface.
export function montarAccesoGrafico(contenedor, instalacion, alEnviar) {
    contenedor.innerHTML = `<div class="acceso-layout"><div class="acceso-identidad"><img src="./assets/logo.jpeg" alt="UPHOS"><p>${texto('acceso.edicion')}</p><div class="acceso-decoracion" aria-hidden="true"></div></div><div class="acceso-cuenta"><div class="avatar-usuario" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="34" r="17"/><path d="M17 88c0-24 13-36 33-36s33 12 33 36z"/></svg></div><p class="paso">${texto('acceso.bienvenido')}</p><h1 tabindex="-1">${escapar(instalacion.usuario.nombre)}</h1><p class="identificador-usuario">@${escapar(instalacion.usuario.usuario)}</p><form novalidate><input type="hidden" name="usuario" value="${escapar(instalacion.usuario.usuario)}"><div class="entrada-clave">${campo('contrasena', t('campo.contrasena'), '', 'password', 'required autocomplete="current-password" maxlength="128"')}<button type="button" class="ver-clave" data-ver-clave aria-pressed="false">${texto('acceso.mostrarClave')}</button></div><p class="error" role="alert" tabindex="-1"></p><button class="principal acceder" type="submit">${texto('acceso.titulo')} →</button></form><p class="acceso-pie">${texto('acceso.pie')}</p></div></div>`;
    contenedor.querySelector('[name="contrasena"]').focus();
    contenedor.querySelector('[data-ver-clave]').addEventListener('click', evento => {
      const clave = contenedor.querySelector('[name="contrasena"]');
      const visible = clave.type === 'password';
      clave.type = visible ? 'text' : 'password';
      evento.currentTarget.setAttribute('aria-pressed', String(visible));
      evento.currentTarget.textContent = t(visible ? 'acceso.ocultarClave' : 'acceso.mostrarClave');
    });
    contenedor.querySelector('form').addEventListener('submit', evento => { evento.preventDefault(); const datos = new FormData(evento.target); alEnviar(datos.get('usuario'), datos.get('contrasena')); evento.target.reset(); });
}
