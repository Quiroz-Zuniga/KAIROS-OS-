import { interpretar } from './interprete.js';
import { crearPestanias } from './pestanias.js';
import { traducir as t, obtenerIdioma } from '../../js/core/i18n.js';
import { resaltarEntrada, dibujarTexto, agregarSalida, limpiarSalida } from './presentacion.js';
import { rangoContrasena, entradaVisible } from './secretos.js';
import { montarEditor } from './editor.js';
import { usarDistribucion } from '../../js/core/teclado.js';

export function esComandoSecreto(entrada) {
  return !!rangoContrasena(entrada);
}

export function montarConsola(contenedor, crearNucleo, alCambiarEstado = () => {}, bienvenida = '') {
  const pestañas = crearPestanias(crearNucleo);
  usarDistribucion(() => pestañas.actual()?.nucleo.tecladoActual?.());
  let finalizado = false;
  let editando = false;
  const eventos = new AbortController();
  document.body.classList.remove('modo-acceso', 'modo-instalador');
  document.body.classList.add('modo-terminal');
  contenedor.innerHTML = `
    <div class="barra-terminal"><h1 data-titulo></h1><span data-atajos></span></div>
    <div class="barra-pestanias"><div role="tablist" data-pestanias></div><button type="button" class="nueva-pestania" data-nueva>+</button></div>
    <div class="zona-terminal" role="tabpanel" tabindex="-1">
      <pre class="salida" role="log" aria-live="polite"></pre>
      <form novalidate><div class="linea-comando"><label class="prompt" for="entrada-comando"></label><div class="editor-comando"><div class="texto-comando" aria-hidden="true"></div><input id="entrada-comando" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="8192"></div></div></form>
    </div>`;
  const zona = contenedor.querySelector('.zona-terminal');
  const salida = contenedor.querySelector('.salida');
  const entrada = contenedor.querySelector('input');
  const textoEntrada = contenedor.querySelector('.texto-comando');
  function refrescarEntrada() {
    entrada.type = pestañas.actual()?.secreto ? 'password' : 'text';
    dibujarTexto(textoEntrada, entradaVisible(entrada.value,pestañas.actual()?.secreto), pestañas.actual()?.secreto ? [] : resaltarEntrada(entrada.value));
    textoEntrada.scrollLeft = entrada.scrollLeft;
    textoEntrada.classList.toggle('ocupado', entrada.disabled);
  }
  entrada.addEventListener('scroll', () => { textoEntrada.scrollLeft = entrada.scrollLeft; });
  const barra = contenedor.querySelector('[data-pestanias]');
  const nueva = contenedor.querySelector('[data-nueva]');
  const guardarVista = () => {
    const pestaña = pestañas.actual();
    if (!pestaña) return;
    pestaña.entrada = entrada.value;
    pestaña.scroll = zona.scrollTop;
  };
  function refrescarTextos() {
    document.documentElement.lang = obtenerIdioma();
    contenedor.querySelector('[data-titulo]').textContent = t('terminal.titulo');
    contenedor.querySelector('[data-atajos]').textContent = t('terminal.atajos');
    nueva.setAttribute('aria-label', t('terminal.nuevaPestania'));
    nueva.title = t('terminal.nuevaPestania');
    barra.setAttribute('aria-label', t('terminal.pestanias'));
    salida.setAttribute('aria-label', t('consola.salida'));
    entrada.setAttribute('aria-label', t('consola.comando'));
    document.querySelector('[data-aviso]').textContent = t('aviso');
    contenedor.setAttribute('aria-label', t('terminal.titulo'));
  }
  function mostrar() {
    contenedor.dataset.tema = pestañas.actual()?.nucleo.temaActual?.() ?? 'oscuro';
    refrescarTextos();
    const activa = pestañas.actual();
    barra.replaceChildren();
    for (const pestaña of pestañas.listar()) {
      const grupo = document.createElement('span');
      grupo.className = 'pestania';
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = 'pestania-' + pestaña.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(pestaña === activa));
      tab.setAttribute('aria-controls', 'panel-terminal');
      tab.tabIndex = pestaña === activa ? 0 : -1;
      tab.textContent = t('terminal.pestania', { numero: pestaña.id }) + (pestaña.ocupado ? ' · …' : '');
      tab.addEventListener('click', () => { guardarVista(); pestañas.seleccionar(pestaña.id); mostrar(); });
      tab.addEventListener('keydown', evento => {
        if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
          evento.preventDefault(); guardarVista(); pestañas.recorrer(evento.key === 'ArrowLeft' ? -1 : 1); mostrar();
          barra.querySelector('[aria-selected="true"]').focus();
        }
      });
      const cerrar = document.createElement('button');
      cerrar.type = 'button';
      cerrar.className = 'cerrar-pestania';
      cerrar.textContent = '×';
      cerrar.disabled = pestañas.listar().length === 1 || pestaña.ocupado;
      cerrar.setAttribute('aria-label', t('terminal.cerrarPestania', { numero: pestaña.id }));
      cerrar.addEventListener('click', () => { guardarVista(); pestañas.cerrar(pestaña.id); mostrar(); });
      grupo.append(tab, cerrar);
      barra.append(grupo);
    }
    zona.id = 'panel-terminal';
    zona.setAttribute('aria-labelledby', 'pestania-' + activa.id);
    dibujarTexto(salida, activa.salida, activa.resaltados);
    entrada.value = activa.entrada;
    entrada.disabled = activa.ocupado;
    refrescarEntrada();
    const respuestaSeguridad = activa.ordenSecreta?.argumentos?.[0] === 'seguridad' || activa.ordenSecreta?.argumentos?.[0] === 'respuesta';
    contenedor.querySelector('.prompt').textContent = activa.secreto ? t(respuestaSeguridad ? 'seguridad.promptRespuesta' : 'live.promptClave') : activa.nucleo.prompt();
    zona.scrollTop = activa.scroll;
    if (!activa.ocupado) entrada.focus();
  }
  function abrir() {
    if (editando) return;
    guardarVista();
    const pestaña = pestañas.abrir();
    pestaña.salida = (bienvenida || t('terminal.bienvenidaCompacta')) + '\n\n';
    mostrar();
  }
  nueva.addEventListener('click', abrir);
  zona.addEventListener('click', evento => {
    if (evento.target === zona || evento.target === salida) {
      if (!window.getSelection()?.toString()) entrada.focus();
    }
  });
  contenedor.addEventListener('keydown', evento => {
    if (finalizado || editando) return;
    if (evento.altKey && evento.shiftKey && evento.key.toLowerCase() === 't') { evento.preventDefault(); abrir(); }
    else if (evento.altKey && evento.shiftKey && evento.key.toLowerCase() === 'w') {
      evento.preventDefault(); guardarVista(); pestañas.cerrar(pestañas.actual().id); mostrar();
    } else if (evento.altKey && ['ArrowLeft', 'ArrowRight'].includes(evento.key)) {
      evento.preventDefault(); guardarVista(); pestañas.recorrer(evento.key === 'ArrowLeft' ? -1 : 1); mostrar();
    } else if (evento.ctrlKey && evento.key.toLowerCase() === 'l') {
      evento.preventDefault(); limpiarSalida(pestañas.actual()); pestañas.actual().scroll = 0; mostrar();
    }
  }, { signal: eventos.signal });
  entrada.addEventListener('input', () => { pestañas.actual().entrada = entrada.value; refrescarEntrada(); });
  entrada.addEventListener('keydown', evento => {
    if(evento.ctrlKey && ['c','u'].includes(evento.key.toLowerCase()) && !pestañas.actual().ocupado){
      evento.preventDefault();
      if(evento.key.toLowerCase()==='c'){pestañas.actual().secreto=false;pestañas.actual().ordenSecreta=undefined;}
      pestañas.actual().entrada='';mostrar();return;
    }
    if (pestañas.actual().secreto) {
      if (evento.key === 'Escape') { pestañas.actual().secreto = false; pestañas.actual().ordenSecreta = undefined; pestañas.actual().entrada = ''; mostrar(); }
      if (['ArrowUp', 'ArrowDown'].includes(evento.key)) evento.preventDefault();
      return;
    }
    if (!evento.altKey && ['ArrowUp', 'ArrowDown'].includes(evento.key)) {
      evento.preventDefault();
      const pestaña = pestañas.actual();
      entrada.value = evento.key === 'ArrowUp' ? pestaña.historial.anterior(entrada.value) : pestaña.historial.siguiente();
      pestaña.entrada = entrada.value;
      entrada.setSelectionRange(entrada.value.length, entrada.value.length);
      refrescarEntrada();
    }
  });
  contenedor.querySelector('form').addEventListener('submit', async evento => {
    evento.preventDefault();
    const pestaña = pestañas.actual();
    if (finalizado || pestaña.ocupado || !entrada.value.trim()) return;
    const comando = entrada.value;
    const prompt = pestaña.nucleo.prompt();
    const secreto = pestaña.secreto || esComandoSecreto(comando);
    if (!secreto) pestaña.historial.agregar(comando);
    pestaña.entrada = '';
    pestaña.ocupado = true;
    if (secreto) agregarSalida(pestaña, t('live.claveOculta') + '\n');
    else agregarSalida(pestaña, `${prompt} ${comando}\n`, resaltarEntrada(comando).map(rango => ({ ...rango, inicio: rango.inicio + prompt.length + 1, fin: rango.fin + prompt.length + 1 })));
    mostrar();
    zona.scrollTop = zona.scrollHeight;
    const progreso = ({ porcentaje, etapa }) => {
      let panel = contenedor.querySelector('.progreso-terminal');
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'progreso-terminal';
        panel.innerHTML = '<div class="rueda-progreso"><span data-porcentaje></span></div><p role="status"></p>';
        zona.before(panel);
      }
      panel.querySelector('.rueda-progreso').style.setProperty('--avance', porcentaje);
      panel.querySelector('[data-porcentaje]').textContent = porcentaje + '%';
      panel.querySelector('p').textContent = t(etapa);
      agregarSalida(pestaña, `[${String(porcentaje).padStart(3)}%] ${t(etapa)}\n`);
      if (pestañas.actual() === pestaña) { dibujarTexto(salida, pestaña.salida, pestaña.resaltados); zona.scrollTop = zona.scrollHeight; }
    };
    const orden = pestaña.ordenSecreta ?? { nombre: 'configurar', argumentos: ['contrasena'] };
    const linea = pestaña.secreto ? [orden.nombre, ...orden.argumentos, comando].map(valor => JSON.stringify(valor)).join(' ') : comando;
    const resultado = await interpretar(linea, pestaña.nucleo, progreso);
    contenedor.querySelector('.progreso-terminal')?.remove();
    if (resultado.ordenSecreta) pestaña.ordenSecreta = resultado.ordenSecreta;
    if (resultado.historial) resultado.texto = pestaña.historial.listar().map((linea, i) => `${i + 1}  ${linea}`).join('\n');
    pestaña.secreto = resultado.secreto || (pestaña.secreto && resultado.error);
    pestaña.ocupado = false;
    if (resultado.limpiar) limpiarSalida(pestaña);
    else if (resultado.texto) agregarSalida(pestaña, resultado.texto + '\n', resultado.resaltados);
    if (resultado.accion) {
      finalizado = true;
      eventos.abort();
      for (const item of pestañas.listar()) item.nucleo.cerrar();
      alCambiarEstado(resultado.accion, resultado);
      return;
    }
    if (resultado.editor) {
      editando = true;
      montarEditor(contenedor, resultado.editor, async (contenido, original) => {
        await pestaña.nucleo.ejecutar('guardarEdicion',[resultado.editor.ruta,contenido,original]);
      }, () => { editando=false; mostrar(); });
      return;
    }
    if (finalizado) return;
    if (pestañas.actual() === pestaña) {
      mostrar();
      zona.scrollTop = zona.scrollHeight;
      pestaña.scroll = zona.scrollTop;
    } else {
      // No cambia la pestaña elegida ni borra el texto que el usuario esté escribiendo.
      guardarVista();
      mostrar();
    }
  });
  abrir();
}
