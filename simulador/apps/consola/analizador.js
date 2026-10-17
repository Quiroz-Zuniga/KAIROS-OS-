// Gramática: espacios separan argumentos; comillas agrupan texto, incluso vacío.
// Barra inversa permite escapar comillas, espacios y otra barra inversa.
export function analizar(entrada) {
  if (entrada.length > 8192 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(entrada)) throw new Error('terminal.errorEntrada');
  const tokens = [];
  let token = '', comilla = '', activo = false;
  for (let i = 0; i < entrada.length; i++) {
    const caracter = entrada[i];
    if (caracter === '\\') {
      const siguiente = entrada[i + 1];
      if (['\\', '"', "'", ' '].includes(siguiente)) { token += siguiente; i++; }
      else token += '\\';
      activo = true;
    } else if (comilla) {
      if (caracter === comilla) comilla = '';
      else token += caracter;
    } else if (caracter === '"' || caracter === "'") {
      comilla = caracter;
      activo = true;
    } else if (/\s/.test(caracter)) {
      if (activo) { tokens.push(token); token = ''; activo = false; }
    } else {
      token += caracter;
      activo = true;
    }
  }
  if (comilla) throw new Error('terminal.errorComillas');
  if (activo) tokens.push(token);
  return { nombre: tokens.shift() ?? '', argumentos: tokens };
}
