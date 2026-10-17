# Guía de los 120 comandos de KAIRÓS OS

Los comandos funcionan sobre el entorno de KAIROS. Los nombres siguen en español; idioma en cambia los mensajes y ejemplos de ayuda. Usa ayuda comando para ver una tabla con sintaxis, función y ejemplo.

## Empezar con carpetas y archivos

~~~text
crear carpeta Tareas
entrar Tareas
crear archivo nota.txt
escribir nota.txt "Mi primera tarea"
leer nota.txt
entrar ..
carpetas proyectos\semana1\documentos
entrar proyectos\semana1\documentos
volver -
~~~

crear carpeta crea un nivel: el padre debe existir. carpetas crea todos los niveles que falten. crear archivo produce un archivo vacío; escribir necesita que ese archivo exista. Usa comillas si un nombre tiene espacios, por ejemplo crear carpeta "Mis tareas". . representa la carpeta actual; .. representa el padre. entrar sin argumentos vuelve a tu carpeta de usuario. volver - regresa a la ruta anterior. U:\ es la raíz del entorno.

Copiar, mover y restaurar necesitan un destino libre. escribir, vaciar y las transformaciones de texto reemplazan el contenido; consulta la función de cada comando antes de ejecutarlo. Los archivos admiten hasta 1 MiB. No hay papelera ni deshacer de borrado.

## Editar como en una consola

Escribe editar nota.txt para abrir un archivo existente. Ctrl+G muestra ayuda; Ctrl+O o Ctrl+S guarda; Ctrl+X sale. Si hay cambios, S guarda, N descarta y Escape o Ctrl+C cancela el aviso. El editor conserva el texto si hay un error o un conflicto con otra consola.

## Usuarios y contraseña

~~~text
cuenta crear pedro "Pedro López"
cambiarusuario pedro
cuenta clave
~~~

La primera orden solicita después la contraseña en una entrada oculta. El nombre de usuario y el nombre completo se ven normalmente. No incluyas contraseñas en los ejemplos que compartas. KAIRÓS OS rechaza una clave que ya utiliza otra cuenta. cambiarusuario pide las credenciales de la cuenta seleccionada; no basta con cambiar el prompt. Ctrl+C o Escape cancela una contraseña pendiente.

## Red de KAIRÓS OS

~~~text
ip
red
ping google.com 4
registrardns aula.local 10.0.0.20
ping aula.local 2
desconectar
conectar
~~~

Ping se usa para comprobar conectividad. En KAIRÓS OS, sus respuestas son simuladas: no se consulta la IP real de Google ni se envían paquetes ICMP. La instalación recibe una IP privada guardada; reiniciar conserva la IP y reinstalar asigna una nueva mediante el registro de asignaciones. Puertos y rutas también son modelos virtuales.

## Ediciones, teclados y licencias

Plus admite tres cuentas y Pro ocho. Pro requiere una clave del archivo LICENCIAS-PRO.txt. En Live usa configurar edicion Pro y configurar licencia CLAVE antes de instalar. Teclados disponibles: latinoamericano e ingles.

## Catálogo completo

| Comando | Uso | Función | Ejemplo |
|---|---|---|---|
| abrirpuerto | `abrirpuerto numero servicio` | Registra un puerto virtual con el nombre de su servicio. | `abrirpuerto 8080 pruebas` |
| activar | `activar clave` | Valida una licencia académica de Pro; requiere administrador. | `activar KAIROS-PRO-H7K2-M9Q4-T6XA` |
| agregargrupo | `agregargrupo grupo usuario` | Agrega una cuenta existente a un grupo. | `agregargrupo alumnos pedro` |
| agregarlinea | `agregarlinea ruta "texto"` | Agrega una línea al final y guarda. | `agregarlinea nota.txt "Nueva tarea"` |
| agregarruta | `agregarruta red/prefijo puerta` | Agrega una ruta al modelo de red. | `agregarruta 10.1.0.0/16 10.0.0.1` |
| almacen | `almacen` | Muestra la ubicación del almacenamiento local. | `almacen` |
| anexar | `anexar ruta "contenido"` | Agrega contenido al final de un archivo. | `anexar nota.txt " más texto"` |
| apagar | `apagar` | Termina la sesión y muestra el estado apagado; conserva archivos. | `apagar` |
| arbol | `arbol [ruta]` | Muestra la estructura de carpetas y archivos. | `arbol proyectos` |
| archivos | `archivos [-todo] [ruta]` | Lista archivos y carpetas. -todo incluye elementos ocultos. | `archivos .` |
| archivosvacios | `archivosvacios [carpeta]` | Busca archivos sin contenido en una carpeta. | `archivosvacios .` |
| atributos | `atributos ruta` | Muestra atributos y etiquetas del elemento. | `atributos nota.txt` |
| ayuda | `ayuda [comando]` | Muestra el catálogo o la ayuda de un comando. | `ayuda crear` |
| bloquearusuario | `bloquearusuario usuario` | Bloquea el acceso de otra cuenta; requiere administrador. | `bloquearusuario pedro` |
| borrar | `borrar [-recursivo] ruta` | Elimina archivos o carpetas vacías; -recursivo elimina una carpeta y su contenido. No hay papelera. | `borrar -recursivo tareas` |
| borrardns | `borrardns dominio` | Elimina un registro DNS simulado existente. | `borrardns aula.local` |
| borrargrupo | `borrargrupo nombre` | Elimina un grupo sin eliminar sus usuarios. | `borrargrupo alumnos` |
| borrarlinea | `borrarlinea ruta numero` | Elimina la línea indicada y guarda. | `borrarlinea nota.txt 2` |
| buscar | `buscar nombre [ruta]` | Busca nombres dentro de una carpeta y sus subcarpetas. | `buscar nota .` |
| cabeza | `cabeza ruta [cantidad]` | Muestra las primeras líneas. | `cabeza nota.txt 5` |
| cambiarnombre | `cambiarnombre "Nombre"` | Actualiza el nombre visible de tu cuenta. | `cambiarnombre "Ana López"` |
| cambiarusuario | `cambiarusuario [usuario]` | Cierra la sesión y solicita las credenciales del usuario elegido. | `cambiarusuario pedro` |
| carpetas | `carpetas ruta` | Crea todos los niveles de una ruta. Ejemplo: carpetas proyectos\tarea. | `carpetas proyectos\tarea` |
| carpetasvacias | `carpetasvacias [carpeta]` | Busca carpetas sin elementos. | `carpetasvacias .` |
| cerrarpuerto | `cerrarpuerto numero` | Elimina un puerto del modelo virtual. | `cerrarpuerto 8080` |
| cerrarsesion | `cerrarsesion` | Cierra la sesión y vuelve al acceso por consola. | `cerrarsesion` |
| codificar | `codificar ruta` | Convierte el archivo a Base64 y guarda. | `codificar nota.txt` |
| cola | `cola ruta [cantidad]` | Muestra las últimas líneas. | `cola nota.txt 5` |
| comparar | `comparar origen destino` | Compara el contenido de dos archivos. | `comparar nota.txt copia.txt` |
| comprobar | `comprobar` | Comprueba la coherencia de rutas y carpetas. | `comprobar` |
| conectar | `conectar` | Activa la conectividad simulada. | `conectar` |
| configurar | `configurar [nombre\|usuario\|idioma\|teclado\|zona valor] \| configurar contrasena` | En Live, consulta o ajusta la instalación. configurar contrasena solicita una entrada oculta. | `configurar nombre "Ana López"` |
| contar | `contar ruta` | Cuenta líneas, palabras y bytes de un archivo. | `contar nota.txt` |
| copiar | `copiar origen destino` | Copia un archivo a un destino nuevo. | `copiar nota.txt copia.txt` |
| copiarcarpeta | `copiarcarpeta origen destino` | Copia una carpeta y todos sus elementos a un destino nuevo. | `copiarcarpeta tareas copia` |
| crear | `crear archivo\|carpeta ruta` | Crea un archivo vacío o una carpeta. Usa crear archivo nota.txt o crear carpeta "Mis tareas". El padre debe existir. | `crear carpeta "Mis tareas"` |
| creargrupo | `creargrupo nombre` | Crea una agrupación virtual; requiere administrador. | `creargrupo alumnos` |
| cuenta | `cuenta crear usuario "Nombre" \| clave \| borrar usuario confirmar` | Administra cuentas. crear y clave solicitan la contraseña oculta; borrar requiere confirmar. | `cuenta crear pedro "Pedro López"` |
| decodificar | `decodificar ruta` | Restaura un archivo Base64 a texto UTF-8 y guarda. | `decodificar nota.txt` |
| desbloquearusuario | `desbloquearusuario usuario` | Restablece el acceso de una cuenta. | `desbloquearusuario pedro` |
| desconectar | `desconectar` | Desactiva la conectividad simulada. | `desconectar` |
| desmarcar | `desmarcar ruta etiqueta` | Elimina una etiqueta de un archivo o carpeta. | `desmarcar nota.txt importante` |
| detalles | `detalles ruta` | Consulta tipo, tamaño y elementos. | `detalles nota.txt` |
| discos | `discos` | Consulta capacidad, particiones y contenido almacenado. | `discos` |
| dividir | `dividir ruta lineas carpeta` | Divide un archivo en bloques dentro de una carpeta nueva. | `dividir nota.txt 5 partes` |
| dns | `dns` | Muestra la tabla DNS simulada. | `dns` |
| duplicar | `duplicar origen destino` | Crea una segunda copia de un archivo en un destino nuevo. | `duplicar nota.txt copia.txt` |
| editar | `editar ruta` | Abre el editor. Ctrl+O guarda; Ctrl+X sale; Ctrl+G muestra ayuda. | `editar nota.txt` |
| editarlinea | `editarlinea ruta numero "texto"` | Reemplaza una línea por su número y guarda. | `editarlinea nota.txt 1 "Inicio"` |
| entrar | `entrar [ruta]` | Entra en una carpeta; sin ruta vuelve a tu hogar. | `entrar proyectos\tarea` |
| escribible | `escribible ruta` | Permite volver a escribir un archivo. | `escribible nota.txt` |
| escribir | `escribir ruta "contenido"` | Reemplaza el contenido de un archivo existente. Usa comillas para espacios; "" lo vacía. | `escribir nota.txt "Hola KAIRÓS OS"` |
| estado | `estado` | Muestra el estado y la ruta actual. | `estado` |
| existe | `existe ruta` | Comprueba si existe un elemento accesible. | `existe nota.txt` |
| extension | `extension ruta` | Muestra la extensión de una ruta. | `extension nota.txt` |
| filtrar | `filtrar "texto" ruta` | Muestra las líneas que contienen el texto indicado. | `filtrar "tarea" nota.txt` |
| formatear | `formatear confirmar` | En Live, confirma el formato del destino antes de instalar. | `formatear confirmar` |
| grupos | `grupos` | Consulta grupos y sus miembros; son agrupaciones virtuales. | `grupos` |
| hexadecimal | `hexadecimal ruta` | Muestra los bytes UTF-8 en hexadecimal. | `hexadecimal nota.txt` |
| historial | `historial` | Muestra los comandos de esta pestaña, sin contraseñas. | `historial` |
| hostname | `hostname [valor]` | Consulta o cambia el nombre del equipo en el prompt. | `hostname laboratorio` |
| idioma | `idioma [es\|en]` | Consulta el idioma o cambia los mensajes de la sesión con idioma es o idioma en. No cambia archivos ni comandos. | `idioma en` |
| idiomapermanente | `idiomapermanente [valor]` | Guarda es o en para los siguientes inicios. | `idiomapermanente es` |
| insertarlinea | `insertarlinea ruta numero "texto"` | Inserta una línea en la posición indicada y guarda. | `insertarlinea nota.txt 1 "Inicio"` |
| instalar | `instalar [confirmar]` | En Live, muestra el resumen; confirmar instala y vuelve al arranque. | `instalar confirmar` |
| invertir | `invertir ruta` | Invierte el orden de las líneas y guarda. | `invertir nota.txt` |
| ip | `ip` | Muestra la IP asignada a esta instalación. | `ip` |
| leer | `leer ruta` | Muestra el contenido de un archivo. | `leer nota.txt` |
| licencia | `licencia` | Consulta la activación académica de tu edición. | `licencia` |
| limpiar | `limpiar` | Limpia la salida; conserva el historial. | `limpiar` |
| marcar | `marcar ruta etiqueta` | Agrega una etiqueta al archivo o carpeta. | `marcar nota.txt importante` |
| marcas | `marcas [carpeta]` | Lista elementos etiquetados dentro de una carpeta. | `marcas .` |
| mayusculas | `mayusculas ruta` | Convierte el contenido a mayúsculas y guarda. | `mayusculas nota.txt` |
| memoria | `memoria` | Muestra un modelo sencillo de memoria virtual. | `memoria` |
| minusculas | `minusculas ruta` | Convierte el contenido a minúsculas y guarda. | `minusculas nota.txt` |
| mostrar | `mostrar ruta` | Quita el atributo oculto. | `mostrar nota.txt` |
| mover | `mover origen destino` | Mueve o renombra un archivo o carpeta a un destino nuevo. | `mover copia.txt final.txt` |
| nombrearchivo | `nombrearchivo ruta` | Muestra el nombre final de una ruta. | `nombrearchivo nota.txt` |
| normalizar | `normalizar ruta` | Resuelve una ruta relativa o absoluta. | `normalizar nota.txt` |
| numerar | `numerar ruta` | Muestra el archivo con números de línea, sin modificarlo. | `numerar nota.txt` |
| ocultar | `ocultar ruta` | Marca un elemento como oculto. Es un atributo virtual. | `ocultar nota.txt` |
| ordenar | `ordenar ruta` | Ordena las líneas y guarda el archivo. | `ordenar nota.txt` |
| padre | `padre ruta` | Muestra la ruta de la carpeta padre. | `padre nota.txt` |
| particionar | `particionar [crear inicio tamaÃ±o nombre \| editar id tamaÃ±o nombre \| borrar id confirmar \| usar id]` | En Live, gestiona el plan del disco. Inicio y tamaño en GiB. El asterisco indica el destino. | `particionar crear 32 16 Datos` |
| perfil | `perfil [usuario]` | Consulta nombre, estado y grupos; no revela credenciales. | `perfil pedro` |
| permisos | `permisos` | Consulta los permisos de la cuenta actual. | `permisos` |
| ping | `ping destino [cantidad]` | Comprueba conectividad del modelo de red. No envía ICMP real. | `ping google.com 4` |
| preferencias | `preferencias` | Consulta las preferencias guardadas. | `preferencias` |
| procesos | `procesos` | Muestra dos procesos de la simulación; no consulta procesos reales. | `procesos` |
| puertos | `puertos` | Lista puertos virtuales; no abre puertos del equipo. | `puertos` |
| quitargrupo | `quitargrupo grupo usuario` | Retira una cuenta de un grupo. | `quitargrupo alumnos pedro` |
| quitarruta | `quitarruta red/prefijo` | Elimina una ruta del modelo de red. | `quitarruta 10.1.0.0/16` |
| raiz | `raiz` | Va a la raíz U:\. | `raiz` |
| recortar | `recortar ruta` | Quita espacios de los extremos de cada línea y guarda. | `recortar nota.txt` |
| red | `red` | Muestra el estado de la red simulada. | `red` |
| reemplazar | `reemplazar ruta "buscar" "nuevo"` | Sustituye todas las coincidencias literales y guarda. | `reemplazar nota.txt "hola" "saludo"` |
| registrardns | `registrardns dominio ip` | Agrega o actualiza un registro DNS simulado. | `registrardns aula.local 10.0.0.20` |
| reiniciar | `reiniciar` | Cierra la sesión y vuelve al arranque; conserva archivos. | `reiniciar` |
| reinstalar | `reinstalar [confirmar]` | Prepara una instalación limpia. reinstalar confirmar elimina la cuenta y todos los archivos de KAIRÓS OS y abre el instalador. | `reinstalar confirmar` |
| renombrar | `renombrar ruta nombre` | Cambia el nombre sin moverlo a otra carpeta. | `renombrar nota.txt tarea.txt` |
| resolver | `resolver dominio` | Consulta una dirección en la tabla DNS simulada. | `resolver google.com` |
| respaldo | `respaldo archivo` | Guarda un respaldo JSON de tu carpeta de usuario. | `respaldo copia.json` |
| restaurar | `restaurar archivo carpeta` | Restaura un respaldo en una carpeta nueva. | `restaurar copia.json recuperado` |
| ruta | `ruta` | Muestra la ruta actual. | `ruta` |
| rutasred | `rutasred` | Muestra las rutas de red simuladas. | `rutasred` |
| salir | `salir` | Sale al directorio padre, como entrar ... | `salir` |
| sololectura | `sololectura ruta` | Impide escribir el archivo hasta usar escribible. | `sololectura nota.txt` |
| suma | `suma ruta` | Calcula SHA-256 del contenido UTF-8 sin modificarlo. | `suma nota.txt` |
| tamano | `tamano ruta` | Muestra los bytes UTF-8 de un archivo. | `tamano nota.txt` |
| teclado | `teclado [valor]` | Consulta o guarda latinoamericano o ingles. | `teclado ingles` |
| tema | `tema [valor]` | Consulta o cambia claro u oscuro en la terminal. | `tema claro` |
| tocar | `tocar ruta` | Crea un archivo vacío o actualiza su marca de modificación. | `tocar nota.txt` |
| unicos | `unicos ruta` | Elimina líneas repetidas y guarda el archivo. | `unicos nota.txt` |
| unir | `unir archivo1 archivo2 destino` | Concatena dos archivos en un destino nuevo, sin separadores añadidos. | `unir uno.txt dos.txt unido.txt` |
| usuario | `usuario` | Muestra el usuario de la sesión. | `usuario` |
| usuarios | `usuarios` | Consulta el usuario instalado, sin revelar sus credenciales. | `usuarios` |
| vaciar | `vaciar ruta` | Vacía el contenido de un archivo. | `vaciar nota.txt` |
| version | `version` | Consulta edición y arquitectura de KAIROS. | `version` |
| volver | `volver [-]` | Sin argumentos va al padre; con - regresa al directorio anterior. | `volver -` |
| zona | `zona [valor]` | Consulta o guarda la zona horaria de KAIROS. | `zona America/Tegucigalpa` |

configurar, particionar, formatear e instalar se utilizan en Live. reinstalar requiere una instalación activa y la cuenta administradora. Las órdenes de cuentas y grupos que administran otros usuarios requieren privilegios de administrador. Los grupos organizan usuarios; no conceden acceso a archivos de otras cuentas.


## Recuperar la contrasena

En el acceso por consola, escribe `recuperar` cuando solicite Usuario, o pulsa F2. Ingresa tu usuario, responde la pregunta de seguridad y escribe dos veces la contrasena nueva. Escape cancela. No necesitas reinstalar y tus archivos se conservan.

Si tu cuenta se creo antes de esta funcion, inicia sesion y configura tu pregunta:

```text
cuenta seguridad mascota
```

Escribe la respuesta cuando la consola la solicite; estara oculta y no ira al historial. Puedes elegir mascota, escuela o ciudad. Sin una pregunta configurada no es posible recuperar una contrasena olvidada con este mecanismo.

Para instalar desde Live:

```text
configurar pregunta mascota
configurar respuesta
```

El segundo comando pide la respuesta de forma oculta. Las respuestas no distinguen mayusculas ni espacios repetidos; las contrasenas si distinguen mayusculas. No uses una respuesta que otras personas puedan adivinar facilmente.

En el acceso, `recuperar` recupera la contrasena mediante la pregunta de seguridad. `restaurar` solicita escribir `confirmar` para borrar la instalacion completa de KAIRÓS OS y abrir el asistente para una instalacion limpia. Escape cancela y ningun dato se borra hasta confirmar. No requiere recordar la contrasena. El borrado pasa por el nucleo y verifica que la instalacion no haya cambiado mientras se confirma. Dentro de una sesion iniciada, `restaurar` conserva su funcion de restaurar respaldos de archivos; `reinstalar confirmar` permite borrar la instalacion desde esa sesion.

Los nombres de usuario admiten letras mayusculas y minusculas, conservando la escritura elegida (por ejemplo Jorge). Para identificar una cuenta en el acceso, recuperacion o comandos de usuarios, Jorge, jorge y JORGE se consideran el mismo usuario. No se permiten cuentas duplicadas que solo cambien por mayusculas. Las carpetas y el prompt conservan el nombre guardado; las contrasenas si distinguen mayusculas. La longitud sigue siendo de 3 a 24 caracteres, comenzando con una letra sin tilde y admitiendo numeros, guion y guion bajo.
