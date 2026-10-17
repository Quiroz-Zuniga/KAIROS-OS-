import { traducir as t } from '../core/i18n.js';
import { espaciosLibres, crearParticion, editarParticion, eliminarParticion, seleccionarParticion } from './particiones.js';
const escapar = valor => String(valor).replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]));

export function montarParticiones(contenedor, datos, alCambiar) {
  let fila = datos.particionSeleccionada || '', editor = null, eliminar = false, error = '';
  function renderizar() {
    const segmentos = [...datos.particiones.map(particion => ({ ...particion, libre: false })), ...espaciosLibres(datos.particiones).map(espacio => ({ ...espacio, id: 'libre-' + espacio.inicioGiB, nombre: t('disco.sinAsignar'), libre: true }))].sort((a, b) => a.inicioGiB - b.inicioGiB);
    const elegida = segmentos.find(segmento => segmento.id === fila);
    contenedor.innerHTML = `
      <div class="disco-cabecera"><div class="icono-disco" aria-hidden="true">▰</div><div><strong>${escapar(t('disco.titulo'))}</strong><small>${escapar(t('disco.descripcion'))}</small></div></div>
      <div class="mapa-disco" aria-label="${escapar(t('disco.mapa'))}">${segmentos.map(segmento => `<span class="${segmento.libre ? 'libre' : 'asignada'} ${segmento.id === datos.particionSeleccionada ? 'destino' : ''}" style="flex-grow:${segmento.capacidadGiB}" title="${escapar(segmento.nombre)} · ${segmento.capacidadGiB} GiB"></span>`).join('')}</div>
      <div class="tabla-desplazable"><table class="tabla-particiones"><caption>${escapar(t('disco.tabla'))}</caption><thead><tr>${['disco.colSeleccion', 'disco.colNombre', 'disco.colTamano', 'disco.colInicio', 'disco.colTipo', 'disco.colDestino'].map(clave => `<th scope="col">${escapar(t(clave))}</th>`).join('')}</tr></thead><tbody>${segmentos.map(segmento => `<tr class="${segmento.id === fila ? 'seleccionada' : ''}"><td><input type="radio" name="filaDisco" value="${escapar(segmento.id)}" aria-label="${escapar(t('disco.seleccionarFila', { nombre: segmento.nombre }))}" ${segmento.id === fila ? 'checked' : ''}></td><th scope="row">${escapar(segmento.nombre)}</th><td>${segmento.capacidadGiB} GiB</td><td>${segmento.inicioGiB} GiB</td><td>${escapar(t(segmento.libre ? 'disco.sinAsignar' : 'disco.primaria'))}</td><td>${segmento.id === datos.particionSeleccionada ? escapar(t('disco.destino')) : '—'}</td></tr>`).join('')}</tbody></table></div>
      <div class="herramientas-disco"><button type="button" data-nueva ${!elegida?.libre || editor ? 'disabled' : ''}>${escapar(t('disco.nueva'))}</button><button type="button" data-editar ${!elegida || elegida.libre || editor ? 'disabled' : ''}>${escapar(t('disco.editar'))}</button><button type="button" data-eliminar ${!elegida || elegida.libre || editor ? 'disabled' : ''}>${escapar(t('disco.eliminar'))}</button><button type="button" data-destino ${!elegida || elegida.libre || elegida.capacidadGiB < 8 || editor ? 'disabled' : ''}>${escapar(t('disco.usar'))}</button></div>
      ${editor ? `<fieldset class="editor-particion"><legend>${escapar(t(editor.nuevo ? 'disco.nueva' : 'disco.editar'))}</legend><label>${escapar(t('disco.nombre'))}<input data-nombre value="${escapar(editor.nombre)}" maxlength="40"></label><label>${escapar(t('campo.capacidad'))}<input data-tamano type="number" min="1" max="64" step="1" value="${editor.capacidadGiB}"></label><div><button type="button" data-aplicar>${escapar(t('disco.aplicar'))}</button><button type="button" data-cancelar>${escapar(t('limpiar.cancelar'))}</button></div></fieldset>` : ''}
      ${eliminar ? `<div class="confirmacion-disco" role="alert"><p>${escapar(t('disco.confirmarEliminacion', {nombre: elegida?.nombre}))}</p><button type="button" data-confirmar>${escapar(t('disco.eliminar'))}</button><button type="button" data-cancelar>${escapar(t('limpiar.cancelar'))}</button></div>` : ''}
      <p class="error" data-error-disco role="alert" tabindex="-1">${error ? escapar(t(error)) : ''}</p><small>${escapar(t('disco.ayuda'))}</small>`;
    // No se avanza dejando una edición sin aplicar o una confirmación pendiente.
    const continuar = contenedor.closest('form')?.querySelector('button[type="submit"]');
    if (continuar) continuar.disabled = Boolean(editor || eliminar);
    const intentar = accion => {
      try { accion(); error = ''; alCambiar(); }
      catch (fallo) { error = fallo.message; }
      renderizar();
      if (error) contenedor.querySelector('[data-error-disco]').focus();
    };
    contenedor.querySelectorAll('[name="filaDisco"]').forEach(control => control.addEventListener('change', () => { fila = control.value; editor = null; eliminar = false; error = ''; renderizar(); }));
    contenedor.querySelector('[data-nueva]').addEventListener('click', () => { editor = { ...elegida, nuevo: true, nombre: t('disco.nombreInicial') }; eliminar = false; renderizar(); contenedor.querySelector('[data-nombre]').focus(); });
    contenedor.querySelector('[data-editar]').addEventListener('click', () => { editor = { ...elegida, nuevo: false }; eliminar = false; renderizar(); contenedor.querySelector('[data-nombre]').focus(); });
    contenedor.querySelector('[data-eliminar]').addEventListener('click', () => { eliminar = true; renderizar(); });
    contenedor.querySelector('[data-destino]').addEventListener('click', () => intentar(() => seleccionarParticion(datos, elegida.id)));
    contenedor.querySelector('[data-cancelar]')?.addEventListener('click', () => { editor = null; eliminar = false; error = ''; renderizar(); });
    contenedor.querySelector('[data-confirmar]')?.addEventListener('click', () => intentar(() => { eliminarParticion(datos, elegida.id); eliminar = false; fila = ''; }));
    contenedor.querySelector('[data-aplicar]')?.addEventListener('click', () => {
      editor.nombre = contenedor.querySelector('[data-nombre]').value;
      const valor = contenedor.querySelector('[data-tamano]').value;
      editor.capacidadGiB = /^\d+$/.test(valor) ? Number(valor) : NaN;
      intentar(() => {
        if (editor.nuevo) {
          if (editor.capacidadGiB > elegida.capacidadGiB) throw new Error('disco.errorEspacio');
          fila = crearParticion(datos, editor.inicioGiB, editor.capacidadGiB, editor.nombre);
        } else editarParticion(datos, editor.id, editor.capacidadGiB, editor.nombre);
        editor = null;
      });
    });
    contenedor.querySelector('.editor-particion')?.addEventListener('keydown', evento => {
      if (evento.key === 'Enter' && evento.target.tagName === 'INPUT') { evento.preventDefault(); contenedor.querySelector('[data-aplicar]').click(); }
    });
  }
  renderizar();
}
