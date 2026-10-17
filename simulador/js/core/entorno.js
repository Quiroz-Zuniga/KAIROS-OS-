// Metadatos compartidos. El arranque persistente se coordina en sistema.js.
export function crearEntorno() {
  return Object.freeze({ nombre: 'UPHOS Simulator', version: '0.1.0', estado: 'base' });
}
