export const usuarioValido = nombre => typeof nombre === 'string' && /^[A-Za-z][A-Za-z0-9_-]{2,23}$/.test(nombre);
export const identidadUsuario = nombre => typeof nombre === 'string' ? nombre.trim().toLowerCase() : '';
export const mismoUsuario = (a,b) => identidadUsuario(a) === identidadUsuario(b);
