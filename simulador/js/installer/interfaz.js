import { traducir as t, seleccionarIdioma, obtenerIdioma } from '../core/i18n.js';
import { PASOS, IDIOMAS, TECLADOS, ZONAS, crearBorrador, avanzar, retroceder } from './modelo.js';
import { instalarPresentado } from './ritmo.js';
import { arrancar, autenticar } from '../core/sistema.js';
import { crearGrupoTerminal } from '../core/sesiones-terminal.js';
import { montarConsola } from '../../apps/consola/consola.js';
import { montarParticiones } from './vista-particiones.js';
import { objetivo, espaciosLibres } from './particiones.js';
import { EDICIONES, ARQUITECTURAS } from '../core/configuracion.js';
import { montarAccesoConsola } from '../../apps/consola/acceso.js';
import { crearLive } from '../core/live.js';
import { usarDistribucion } from '../core/teclado.js';
import { PREGUNTAS_SEGURIDAD, validarSeguridad } from '../core/preguntas-seguridad.js';

const texto = (clave, parametros = {}) => escapar(t(clave, parametros));
const opcionesTraducidas = opciones => Object.fromEntries(Object.entries(opciones).map(([clave, valor]) => [clave, t(valor)]));
const escapar = valor => String(valor).replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]));
function campo(nombre, etiqueta, valor, tipo = 'text', extra = '') {
  return `<label class="campo">${etiqueta}<input name="${nombre}" type="${tipo}" value="${escapar(valor)}" ${extra}></label>`;
}
function selector(nombre, etiqueta, opciones, valor) {
  return `<label class="campo">${etiqueta}<select name="${nombre}">${Object.entries(opciones).map(([clave, texto]) => `<option value="${clave}" ${clave === valor ? 'selected' : ''}>${escapar(texto)}</option>`).join('')}</select></label>`;
}

export function montarInstalador(contenedor, repositorio) {
  let borrador = crearBorrador();
  let paso = 'bienvenida';
  let instalacion;
  let ocupado = false;
  function mostrarError(error) {
    const elemento = contenedor.querySelector('.error');
    elemento.textContent = error.message || t('error.generico');
    elemento.focus();
  }
  function enfocarTitulo() { contenedor.querySelector('h1')?.focus(); }
  function capturar(formulario) {
    const capacidadAnterior = borrador.capacidad;
    for (const control of formulario.elements) {
      if (Object.hasOwn(borrador, control.name)) borrador[control.name] = control.type === 'checkbox' ? control.checked : control.value;
    }
    if (capacidadAnterior !== borrador.capacidad) borrador.confirmarFormato = false;
  }
  function contenido() {
    switch (paso) {
      case 'bienvenida': return `<p>${texto('bienvenida.entorno')}</p><p>${texto('bienvenida.alcance')}</p>`;
      case 'idioma': return selector('idioma', t('campo.idioma'), opcionesTraducidas(IDIOMAS), borrador.idioma) + `<small>${texto('idioma.ayuda')}</small>`;
      case 'version': return selector('edicion', t('campo.edicion'), opcionesTraducidas(EDICIONES), borrador.edicion) + selector('arquitectura', t('campo.arquitectura'), opcionesTraducidas(ARQUITECTURAS), borrador.arquitectura) + campo('licencia', t('campo.licencia'), borrador.licencia, 'text', 'autocomplete="off" maxlength="40"') + `<small>${texto('version.ayuda')}</small>`;
      case 'teclado': return selector('teclado', t('campo.teclado'), opcionesTraducidas(TECLADOS), borrador.teclado) + campo('prueba', t('campo.prueba'), '') + `<small>${texto('teclado.ayuda')}</small>`;
      case 'particionado': return `<p>${texto('disco.instruccion')}</p><div data-particiones></div>`;
      case 'formateo': return `<div class="destino-formato"><span class="icono-disco" aria-hidden="true">▰</span><div><strong>${escapar(objetivo(borrador)?.nombre ?? 'KAIROS')}</strong><p>${texto('formateo.detalle', {capacidad: borrador.capacidad})}</p></div></div><label class="confirmar-formato"><input type="checkbox" name="confirmarFormato" ${borrador.confirmarFormato ? 'checked' : ''}>${texto('formateo.confirmar')}</label><p>${texto('disco.formatoAyuda')}</p>`;
      case 'usuario': return campo('nombre', t('campo.nombre'), borrador.nombre, 'text', 'required maxlength="80" autocomplete="name"') + campo('usuario', t('campo.usuario'), borrador.usuario, 'text', 'required maxlength="24" autocomplete="username"') + `<small>${texto('usuario.ayuda')}</small>`;
      case 'contrasena': return campo('contrasena', t('campo.contrasena'), borrador.contrasena, 'password', 'required minlength="8" maxlength="128" autocomplete="new-password"') + campo('confirmacion', t('campo.confirmacion'), borrador.confirmacion, 'password', 'required minlength="8" maxlength="128" autocomplete="new-password"') + `<small>${texto('contrasena.ayuda')}</small>` + selector('preguntaSeguridad', t('seguridad.pregunta'), opcionesTraducidas(PREGUNTAS_SEGURIDAD), borrador.preguntaSeguridad) + campo('respuestaSeguridad', t('seguridad.respuesta'), borrador.respuestaSeguridad, 'password', 'required minlength="3" maxlength="128" autocomplete="off"') + `<small>${texto('seguridad.ayuda')}</small>`;
      case 'zona': return selector('zona', t('titulo.zona'), Object.fromEntries(ZONAS.map(zona => [zona, zona.replaceAll('_', ' ')])), borrador.zona) + `<small>${texto('zona.ayuda')}</small>`;
      case 'resumen': return `<p>${texto('resumen.ayuda')}</p><dl>${[
        [t('campo.edicion'), borrador.edicion], [t('campo.arquitectura'), borrador.arquitectura + ' bits'], [t('resumen.idioma'), t(IDIOMAS[borrador.idioma])], [t('resumen.teclado'), t(TECLADOS[borrador.teclado])], [t('resumen.disco'), '64 GiB'], [t('resumen.particion'), `${objetivo(borrador)?.nombre ?? 'KAIROS'} · ${borrador.capacidad} GiB`], [t('resumen.libre'), `${espaciosLibres(borrador.particiones).reduce((suma, espacio) => suma + espacio.capacidadGiB, 0)} GiB`], [t('disco.colParticiones'), borrador.particiones.map(particion => `${particion.nombre} (${particion.capacidadGiB} GiB)`).join(', ')], [t('resumen.formato'), 'KAIROSFS'], [t('resumen.nombre'), borrador.nombre], [t('resumen.usuario'), borrador.usuario], [t('campo.contrasena'), t('resumen.oculta')], [t('seguridad.pregunta'), t(PREGUNTAS_SEGURIDAD[borrador.preguntaSeguridad])], [t('titulo.zona'), borrador.zona]
      ].map(([etiqueta, valor]) => `<dt>${etiqueta}</dt><dd>${escapar(valor)}</dd>`).join('')}</dl>`;
    }
  }
  function actualizarIdioma() {
    document.body.classList.remove('modo-terminal');
    document.body.classList.remove('modo-instalador', 'modo-acceso');
    document.documentElement.lang = obtenerIdioma();
    document.querySelector('[data-aviso]').textContent = t('aviso');
    contenedor.setAttribute('aria-label', t('sistema'));
  }
  function mostrarPaso() {
    usarDistribucion(() => borrador.teclado);
    actualizarIdioma();
    document.body.classList.add('modo-instalador');
    const indicePaso = PASOS.indexOf(paso);
    contenedor.innerHTML = `<div class="instalador-layout"><aside class="ruta-instalacion"><div class="marca-instalador"><img src="./assets/logo.jpeg" alt="KAIROS"><span>${texto('instalador.edicion')}</span></div><p>${texto('instalador.guia')}</p><ol>${PASOS.map((nombre, indice) => `<li class="${indice === indicePaso ? 'actual' : indice < indicePaso ? 'completo' : ''}"><button type="button" data-ir="${nombre}" ${indice > indicePaso ? 'disabled' : ''} ${indice === indicePaso ? 'aria-current="step"' : ''}><span class="numero-paso">${indice < indicePaso ? '✓' : indice + 1}</span><span>${texto('titulo.' + nombre)}</span></button></li>`).join('')}</ol><small>${texto('instalador.virtual')}</small></aside><div class="panel-paso"><div class="avance-pasos" aria-hidden="true"><span style="width:${(indicePaso + 1) / PASOS.length * 100}%"></span></div><p class="paso">${texto('paso', {actual: indicePaso + 1, total: PASOS.length})}</p><h1 tabindex="-1">${texto('titulo.' + paso)}</h1><form novalidate>${contenido()}<p class="error" role="alert" tabindex="-1"></p><div class="acciones">${paso === 'bienvenida' ? `<button type="button" data-arranque>${texto('accion.arranque')}</button>` : `<button type="button" data-atras>${texto('accion.anterior')}</button>`}<button type="submit">${paso === 'resumen' ? t('accion.instalar') : t('accion.continuar')} →</button></div></form></div></div>`;
    enfocarTitulo();
    const formulario = contenedor.querySelector('form');
    if (paso === 'teclado') {
      const prueba = formulario.querySelector('[name=prueba]');
      prueba.autocomplete = 'off'; prueba.spellcheck = false;
      formulario.querySelector('[name=teclado]').addEventListener('change', evento => {
        borrador.teclado = evento.target.value;
        prueba.value = ''; prueba.focus();
      });
    }
    if (paso === 'version') {
      const licencia = formulario.querySelector('[name=licencia]');
      const mostrarLicencia = () => { const pro = formulario.querySelector('[name=edicion]').value === 'Pro'; licencia.closest('label').hidden = !pro; licencia.required = pro; };
      formulario.querySelector('[name=edicion]').addEventListener('change', mostrarLicencia); mostrarLicencia();
    }
    contenedor.querySelectorAll('[data-ir]').forEach(boton => boton.addEventListener('click', () => {
      capturar(formulario);
      paso = boton.dataset.ir;
      mostrarPaso();
    }));
    if (paso === 'particionado') montarParticiones(contenedor.querySelector('[data-particiones]'), borrador, () => {
      const error = contenedor.querySelector('form > .error');
      if (error) error.textContent = '';
    });
    formulario.querySelector('[name="idioma"]')?.addEventListener('change', () => {
      capturar(formulario);
      seleccionarIdioma(borrador.idioma);
      mostrarPaso();
    });
    contenedor.querySelector('[data-atras]')?.addEventListener('click', () => {
      capturar(formulario);
      paso = retroceder(paso);
      mostrarPaso();
    });
    contenedor.querySelector('[data-arranque]')?.addEventListener('click', () => void iniciarAutomatico());
    formulario.addEventListener('submit', async evento => {
      evento.preventDefault();
      if (ocupado) return;
      capturar(formulario);
      try {
        const siguiente = avanzar(paso, borrador);
        if (paso === 'contrasena') { const error = validarSeguridad(borrador.preguntaSeguridad, borrador.respuestaSeguridad); if (error) throw new Error(t(error)); }
        if (paso === 'resumen') await ejecutarInstalacion();
        else { seleccionarIdioma(borrador.idioma); paso = siguiente; mostrarPaso(); }
      } catch (error) { mostrarError(error); }
    });
  }
  async function ejecutarInstalacion() {
    ocupado = true;
    const etapas = ['etapa.particion', 'etapa.formatear', 'etapa.carpetas', 'etapa.credenciales', 'etapa.guardar'];
    contenedor.innerHTML = `<div class="panel-instalando"><div class="rueda-progreso" style="--avance:0"><span data-porcentaje>0%</span></div><p class="paso">KAIROS</p><h1 tabindex="-1">${texto('instalando.titulo')}</h1><p>${texto('instalando.ayuda')}</p><progress class="progreso-accesible" max="100" value="0" aria-label="${texto('instalando.progreso')}"></progress><div class="barra-progreso" aria-hidden="true"><span data-relleno></span></div><p data-progreso role="status"></p><ul class="etapas" aria-label="${texto('instalando.etapas')}">${etapas.map(etapa => `<li data-etapa="${etapa}"><span class="estado-etapa" aria-hidden="true">○</span><span>${texto(etapa)}</span></li>`).join('')}</ul><p class="error" role="alert" tabindex="-1"></p></div>`;
    enfocarTitulo();
    const completadas = new Set();
    try {
      instalacion = await instalarPresentado(borrador, repositorio, ({ porcentaje, etapa }) => {
        const barra = contenedor.querySelector('progress');
        const anterior = Number(barra.value);
        barra.value = porcentaje;
        contenedor.querySelector('.rueda-progreso').style.setProperty('--avance', porcentaje);
        contenedor.querySelector('[data-porcentaje]').textContent = porcentaje + '%';
        contenedor.querySelector('[data-relleno]').style.width = porcentaje + '%';
        contenedor.querySelector('[data-progreso]').textContent = `${porcentaje}% · ${t(etapa)}`;
        contenedor.querySelectorAll('[data-etapa]').forEach(elemento => elemento.classList.toggle('en-curso', elemento.dataset.etapa === etapa && !completadas.has(etapa)));
        if (porcentaje > anterior && !completadas.has(etapa)) {
          completadas.add(etapa);
          const item = contenedor.querySelector(`[data-etapa="${etapa}"]`);
          if (item) { item.classList.add('terminada'); item.classList.remove('en-curso'); item.querySelector('.estado-etapa').textContent = '✓'; }
        }
      });
      // La pantalla final solo aparece tras confirmar la transacción de persistencia.
      borrador.contrasena = '';
      borrador.confirmacion = '';
      borrador.respuestaSeguridad = '';
      await new Promise(resolve => setTimeout(resolve, 350));
      await iniciarAutomatico(true);
    } catch (error) {
      mostrarError(error);
      const boton = document.createElement('button');
      boton.textContent = t('accion.resumen');
      boton.addEventListener('click', () => { paso = 'resumen'; mostrarPaso(); });
      contenedor.append(boton);
    } finally { ocupado = false; }
  }
  function mostrarAcceso(usuarioInicial = '') {
    usarDistribucion(instalacion.preferencias.teclado);
    seleccionarIdioma(instalacion.preferencias.idioma);
    actualizarIdioma();
    montarAccesoConsola(contenedor, repositorio, (datos, sesion) => {
      instalacion = datos;
      const grupo = crearGrupoTerminal(instalacion, repositorio, sesion);
      montarConsola(contenedor, () => grupo.crear(), (accion, resultado) => {
        document.body.classList.remove('modo-terminal');
        if (accion === 'reinstalar') { instalacion = undefined; borrador = crearBorrador(); seleccionarIdioma(borrador.idioma); paso = 'bienvenida'; mostrarPaso(); }
        else if (accion === 'cambiarusuario' || accion === 'cerrarsesion') mostrarAcceso(resultado.usuario || '');
        else if (accion === 'reiniciar') void iniciarAutomatico(true);
        else {
          contenedor.innerHTML = `<h1>${texto('terminal.apagadoTitulo')}</h1><button data-encender>${texto('accion.iniciar')}</button>`;
          contenedor.querySelector('[data-encender]').addEventListener('click', () => void iniciarAutomatico());
        }
      });
    }, usuarioInicial, () => {
      instalacion = undefined; borrador = crearBorrador(); seleccionarIdioma(borrador.idioma); paso = 'bienvenida'; mostrarPaso();
    });
  }
  function mostrarLive() {
    if (ocupado) return;
    actualizarIdioma();
    const live = crearLive(repositorio, { instalar: instalarPresentado });
    montarConsola(contenedor, () => live.crear(), accion => {
      document.body.classList.remove('modo-terminal');
      if (accion === 'reinstalar') { instalacion = undefined; borrador = crearBorrador(); seleccionarIdioma(borrador.idioma); paso = 'bienvenida'; mostrarPaso(); }
          else if (accion === 'reiniciar') void iniciarAutomatico(true);
      else {
        contenedor.innerHTML = `<div class="pantalla-arranque"><h1>${texto('terminal.apagadoTitulo')}</h1><button data-encender>${texto('accion.iniciar')}</button></div>`;
        contenedor.querySelector('[data-encender]').addEventListener('click', () => void iniciarAutomatico());
      }
    }, t('live.guia'));
  }
  function mostrarArranque() {
    actualizarIdioma();
    contenedor.innerHTML = `<div class="pantalla-arranque"><div class="marca-arranque"><img src="./assets/logo.jpeg" alt="KAIROS"></div><p class="paso">${texto('arranque.titulo')}</p><h1 tabindex="-1">KAIROS</h1><p>${texto('arranque.ayuda')}</p><p class="error" role="alert" tabindex="-1"></p><div class="acciones"><button data-live>${texto('live.abrir')}</button><button class="principal" data-instalar>${texto('accion.instalar')} →</button></div></div>`;
    enfocarTitulo();
    contenedor.querySelector('[data-live]').addEventListener('click', mostrarLive);
    contenedor.querySelector('[data-instalar]').addEventListener('click', () => { paso = 'bienvenida'; mostrarPaso(); });
  }
  async function iniciarAutomatico(reinicio = false) {
    actualizarIdioma();
    contenedor.innerHTML = `<div class="pantalla-arranque"><div class="marca-arranque"><img src="./assets/logo.jpeg" alt="KAIROS"></div><div class="cargando-sistema" aria-hidden="true"></div><h1 tabindex="-1">${texto(reinicio ? 'arranque.reiniciando' : 'arranque.comprobando')}</h1><p class="error" role="alert" tabindex="-1"></p></div>`;
    try {
      if (reinicio) await new Promise(resolve => setTimeout(resolve, 900));
      const sistema = await arrancar(repositorio);
      instalacion = sistema.instalacion;
      if (instalacion) mostrarAcceso();
      else mostrarArranque();
    } catch (error) {
      mostrarError(error);
      const boton = document.createElement('button');
      boton.textContent = t('accion.reintentar');
      boton.addEventListener('click', () => void iniciarAutomatico());
      contenedor.querySelector('.pantalla-arranque').append(boton);
    }
  }
  void iniciarAutomatico();
}
