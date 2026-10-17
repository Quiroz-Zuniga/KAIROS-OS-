import { crearRepositorio } from './persistence/repositorio.js';
import { montarInstalador } from './installer/interfaz.js';
import { crearRepositorioLocal } from './platform/repositorio-local.js';
import { conectarTeclado } from './core/teclado.js';

conectarTeclado(document);
montarInstalador(document.querySelector('#sistema'), globalThis.uphosLocal ? crearRepositorioLocal(globalThis.uphosLocal) : crearRepositorio());
