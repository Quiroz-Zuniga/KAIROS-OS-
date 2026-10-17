import { instalar } from './instalar.js';

// Ritmo de presentación solicitado para la exposición; el motor sigue ejecutando
// sus tareas y solo comunica 100% después de confirmar el guardado.
export function crearRitmo(progreso, { duracion = 10000, ahora = () => performance.now(), esperar = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const inicio = ahora();
  return async avance => {
    const restante = inicio + duracion * avance.porcentaje / 100 - ahora();
    if (restante > 0) await esperar(restante);
    progreso(avance);
  };
}
export function instalarPresentado(datos, repositorio, progreso) {
  return instalar(datos, repositorio, crearRitmo(progreso));
}
