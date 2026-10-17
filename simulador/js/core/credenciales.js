const ITERACIONES = 210000;
function aHex(bytes) { return Array.from(bytes, valor => valor.toString(16).padStart(2, '0')).join(''); }
function deHex(texto) { return Uint8Array.from(texto.match(/.{2}/g), valor => parseInt(valor, 16)); }
async function derivar(contrasena, sal) {
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(contrasena), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' }, clave, 256);
  return aHex(new Uint8Array(bits));
}
export async function crearCredencial(contrasena) {
  const sal = crypto.getRandomValues(new Uint8Array(16));
  return { algoritmo: 'PBKDF2-SHA256', iteraciones: ITERACIONES, sal: aHex(sal), hash: await derivar(contrasena, sal) };
}
export function credencialValida(credencial) {
  return credencial?.algoritmo === 'PBKDF2-SHA256' && credencial.iteraciones === ITERACIONES && /^[a-f0-9]{32}$/.test(credencial.sal) && /^[a-f0-9]{64}$/.test(credencial.hash);
}
export async function verificarCredencial(contrasena, credencial) {
  if (!credencialValida(credencial)) return false;
  const hash = await derivar(contrasena, deHex(credencial.sal));
  let diferencia = 0;
  for (let i = 0; i < hash.length; i++) diferencia |= hash.charCodeAt(i) ^ credencial.hash.charCodeAt(i);
  return diferencia === 0;
}
