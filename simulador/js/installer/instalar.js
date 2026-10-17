import { validarInstalacion } from './modelo.js';
import { crearRed } from '../core/red.js';
import { crearCredencial } from '../core/credenciales.js';
import { normalizarRespuesta } from '../core/preguntas-seguridad.js';

export async function instalar(datos, repositorio, progreso = () => {}) {
  const error = validarInstalacion(datos);
  if (error) throw new Error(error);
  // Captura la configuración antes de comenzar las operaciones asincrónicas.
  const configuracion = structuredClone(datos);
  const instalacion = { version: 1, estado: 'preparando', edicion: configuracion.edicion ?? 'Plus', arquitectura: configuracion.arquitectura ?? '64' };
  const etapas = [
    ['etapa.particion', () => {
      const particiones = configuracion.particiones ?? [{ id: 'principal', nombre: 'UPHOS', inicioGiB: 0, capacidadGiB: Number(configuracion.capacidad) }];
      const destino = configuracion.particionSeleccionada ?? 'principal';
      instalacion.disco = { capacidadGiB: 64, particionSistema: destino, particiones: [...particiones].sort((a, b) => Number(b.id === destino) - Number(a.id === destino)).map(particion => ({ ...particion, formato: null })) };
    }],
    ['etapa.formatear', () => {
      instalacion.disco.particiones[0].formato = configuracion.formato;
      instalacion.archivos = [{ ruta: '/', tipo: 'carpeta' }];
    }],
    ['etapa.carpetas', () => {
      instalacion.archivos.push(...['/sistema', '/usuarios', `/usuarios/${configuracion.usuario}`, `/usuarios/${configuracion.usuario}/documentos`].map(ruta => ({ ruta, tipo: 'carpeta' })));
      instalacion.preferencias = { idioma: configuracion.idioma, teclado: configuracion.teclado, zona: configuracion.zona };
    }],
    ['etapa.credenciales', async () => {
      instalacion.usuario = { usuario: configuracion.usuario, nombre: configuracion.nombre.trim(), credencial: await crearCredencial(configuracion.contrasena) };
      if (configuracion.preguntaSeguridad) instalacion.usuario.recuperacion = { pregunta: configuracion.preguntaSeguridad, credencial: await crearCredencial(normalizarRespuesta(configuracion.respuestaSeguridad)) };
      instalacion.usuarios = [structuredClone(instalacion.usuario)];
      instalacion.red = crearRed(repositorio.reservarIP ? await repositorio.reservarIP() : undefined);
      if (configuracion.edicion === 'Pro') instalacion.licencia = configuracion.licencia.trim().toUpperCase();
    }],
    ['etapa.guardar', async () => {
      instalacion.estado = 'instalado';
      instalacion.fecha = new Date().toISOString();
      await repositorio.guardar(instalacion);
    }]
  ];
  await progreso({ porcentaje: 0, etapa: 'etapa.preparar' });
  for (let indice = 0; indice < etapas.length; indice++) {
    const [etapa, ejecutar] = etapas[indice];
    await progreso({ porcentaje: Math.round(indice / etapas.length * 100), etapa });
    await ejecutar();
    await progreso({ porcentaje: Math.round((indice + 1) / etapas.length * 100), etapa });
  }
  return instalacion;
}
