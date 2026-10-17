// Distribuciones internas: nunca cambian el teclado del sistema anfitrión.
const ingles = {
  Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'],
  Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'],
  Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'],
  Equal: ['=', '+'], BracketLeft: ['[', '{'], BracketRight: [']', '}'],
  Backslash: ['\\', '|'], Semicolon: [';', ':'], Quote: ["'", '"'],
  Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'], IntlBackslash: ['\\', '|']
};
const latinoamericano = {
  ...ingles, Backquote: ['|', '°', '¬'], Digit2: ['2', '"'], Digit3: ['3', '#'],
  Digit6: ['6', '&'], Digit7: ['7', '/', '\\'], Digit8: ['8', '('],
  Digit9: ['9', ')'], Digit0: ['0', '='], Minus: ["'", '?'], Equal: ['¿', '¡'],
  BracketLeft: ['´', '¨'], BracketRight: ['+', '*', '~'], Backslash: ['}', ']', '`'],
  Semicolon: ['ñ', 'Ñ'], Quote: ['{', '[', '^'], Slash: ['-', '_'], Comma: [',', ';'], Period: ['.', ':'],
  IntlBackslash: ['<', '>'], KeyQ: ['q', 'Q', '@']
};
const acentos = { '´': '\u0301', '¨': '\u0308' };
let distribucion = () => 'latinoamericano';
export function usarDistribucion(valor) {
  distribucion = typeof valor === 'function' ? valor : () => valor;
}
export function traducirTecla(evento, teclado) {
  // Conserva composición IME, navegación y atajos, incluso Ctrl+Alt sin AltGr.
  const altGr = evento.getModifierState?.('AltGraph') === true;
  if (evento.isComposing || evento.metaKey || (!altGr && (evento.ctrlKey || evento.altKey))) return null;
  if (!['latinoamericano', 'ingles'].includes(teclado)) return null;
  const tabla = teclado === 'ingles' ? ingles : latinoamericano;
  const par = tabla[evento.code];
  let texto;
  if (altGr) texto = par?.[2];
  else if (/^Key[A-Z]$/.test(evento.code) && !par) {
    const mayuscula = !!evento.shiftKey !== (evento.getModifierState?.('CapsLock') === true);
    texto = mayuscula ? evento.code.slice(3) : evento.code.slice(3).toLowerCase();
  } else if (par) {
    const mayuscula = /^Key[A-Z]$/.test(evento.code) || (evento.code === 'Semicolon' && teclado === 'latinoamericano')
      ? !!evento.shiftKey !== (evento.getModifierState?.('CapsLock') === true) : !!evento.shiftKey;
    texto = par[Number(mayuscula)];
  } else if (evento.code === 'Space') texto = ' ';
  if (texto === undefined) return null;
  return { texto, acento: teclado === 'latinoamericano' && Object.hasOwn(acentos, texto) };
}
export function combinarAcento(acento, texto) {
  if (texto === ' ') return acento;
  const compuesto = (texto + acentos[acento]).normalize('NFC');
  return [...compuesto].length === 1 ? compuesto : acento + texto;
}
export function conectarTeclado(contenedor) {
  const pendientes = new WeakMap();
  const limpiar = evento => pendientes.delete(evento.target);
  contenedor.addEventListener('focusout', limpiar);
  contenedor.addEventListener('paste', limpiar);
  contenedor.addEventListener('compositionstart', limpiar);
  contenedor.addEventListener('keydown', evento => {
    const campo = evento.target;
    if (!campo?.matches?.('textarea, input[type=text], input[type=password], input:not([type])') || campo.disabled || campo.readOnly) return;
    const teclado = distribucion();
    let pendiente = pendientes.get(campo);
    if (pendiente?.teclado !== teclado) pendiente = undefined;
    if (['Escape', 'Backspace', 'Delete', 'Enter', 'Tab'].includes(evento.key) || evento.key.startsWith('Arrow')) {
      pendientes.delete(campo);
      if (pendiente && evento.key === 'Backspace') evento.preventDefault();
      return;
    }
    const tecla = traducirTecla(evento, teclado);
    if (!tecla) return;
    evento.preventDefault();
    if (tecla.acento && !pendiente) { pendientes.set(campo, { teclado, texto: tecla.texto }); return; }
    pendientes.delete(campo);
    const texto = pendiente ? combinarAcento(pendiente.texto, tecla.texto) : tecla.texto;
    const inicio = campo.selectionStart, fin = campo.selectionEnd;
    if (inicio === null || fin === null || (campo.maxLength >= 0 && campo.value.length - (fin - inicio) + texto.length > campo.maxLength)) return;
    campo.setRangeText(texto, inicio, fin, 'end');
    campo.dispatchEvent(new campo.ownerDocument.defaultView.Event('input', { bubbles: true }));
  }, true);
}
