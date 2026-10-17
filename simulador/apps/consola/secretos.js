// Scan incomplete input without hiding usernames or display names.
export function rangoContrasena(entrada) {
  const tokens=[];let inicio=-1, valor='', comilla='';
  const cerrar=fin=>{if(inicio>=0)tokens.push({inicio,fin,valor});inicio=-1;valor='';};
  for(let i=0;i<entrada.length;i++){
    const c=entrada[i];
    if(inicio<0 && /\s/.test(c))continue;
    if(inicio<0)inicio=i;
    if(c==='\\' && ['\\','"',"'",' '].includes(entrada[i+1])){valor+=entrada[++i];}
    else if(comilla){if(c===comilla)comilla='';else valor+=c;}
    else if(c==='"'||c==="'")comilla=c;
    else if(/\s/.test(c))cerrar(i);
    else valor+=c;
  }
  cerrar(entrada.length);
  const valores=tokens.map(t=>t.valor);
  const indice=valores[0]==='cuenta'?(valores[1]==='crear'?4:valores[1]==='clave'?2:valores[1]==='seguridad'?3:-1):valores[0]==='configurar'&&['contrasena','respuesta'].includes(valores[1])?2:-1;
  return tokens[indice]??null;
}
export function entradaVisible(entrada,secreto=false){const rango=rangoContrasena(entrada);return secreto?'•'.repeat(entrada.length):rango?entrada.slice(0,rango.inicio)+'•'.repeat(entrada.length-rango.inicio):entrada;}
