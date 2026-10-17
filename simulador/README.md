# KAIRÓS OS Simulator

Simulación académica de un sistema operativo para la Universidad Politécnica de Honduras, construida con HTML, CSS y JavaScript.

## Ejecutar la base

Requiere Node.js 20 o posterior instalado. Desde la carpeta `simulador`, ejecutar `npm start` y abrir http://127.0.0.1:8080. Detener el servidor con Ctrl+C. El navegador no necesita dependencias. Para Electron: `pnpm install`, `pnpm desktop` y `pnpm empaquetar` (Node.js 22.12 o posterior). Las versiones están fijadas en `package.json` y `pnpm-lock.yaml`.

Ejecutar `npm test` desde la misma carpeta para probar la consola. Se necesita un servidor HTTP para cargar los módulos JavaScript; no abrir `index.html` directamente mediante `file://`.

## Alcance actual

Primera fase funcional: arranque, bienvenida, idioma, edición Plus/Pro, arquitectura 32/64 bits, teclado, particionado y formateo virtuales, usuario, contraseña, zona horaria, resumen, instalación con progreso, finalización, reinicio simulado e inicio de sesión.

El arranque comprueba IndexedDB automáticamente. Una instalación válida pasa directamente al acceso por consola, que solicita usuario y contraseña; no muestra opciones Live ni limpieza. Antes de instalar se puede elegir el asistente o la consola Live. Al autenticarse se abre la terminal, sin escritorio gráfico. `reiniciar` vuelve automáticamente al acceso; `apagar` termina la sesión.

El disco tiene 64 GiB lógicos. El instalador muestra una tabla y un mapa con particiones y huecos sin asignar. Permite crear hasta 16 particiones, editar nombre y tamaño o eliminarlas del plan con confirmación. Cada partición tiene una posición y un tamaño entero de al menos 1 GiB; el destino de KAIRÓS OS exige 8 GiB. No se permiten superposiciones ni superar el disco. La partición seleccionada se formatea en KAIROSFS; las demás quedan reservadas, sin formato ni montaje en esta fase. KAIROSFS es un modelo virtual, no un formato de disco real. Los cambios del plan se guardan solamente al instalar. La selección de teclado se guarda como preferencia y no cambia la distribución del equipo. Español es el idioma predeterminado e inglés es seleccionable.

El diseño del instalador incluye una guía lateral de pasos, tabla de disco, herramientas inferiores y confirmación de destino. Las transiciones, animación de arranque, indicador de actividad y pantalla final son decorativas. Se desactivan con la preferencia del navegador de movimiento reducido. La rueda refleja las tareas del motor. La capa de presentación reparte los avances en aproximadamente diez segundos para la exposición; el éxito depende de la transacción de IndexedDB. El motor y sus pruebas no requieren esas esperas.

## Base de traducción

- `assets/locales/es.js`: textos en español.
- `assets/locales/en.js`: textos en inglés.
- `js/core/i18n.js`: selección, interpolación y respaldo al español.
- `assets/locales/README.md`: reglas para agregar textos.
- `tests/i18n.test.js`: pruebas de catálogos y selección de idioma.

La interfaz, validaciones, persistencia y mensajes de consola consultan claves centralizadas. El idioma seleccionado se guarda con la instalación y se recupera al iniciar sesión. Instalaciones existentes con `es-HN` siguen siendo compatibles. Los nombres principales de comandos siguen en español; `idioma en` permite mensajes en inglés durante la sesión y `idioma es` vuelve al español, sin cambiar datos ni el idioma guardado. No existe escritorio gráfico.

El progreso corresponde a creación de partición, formateo del modelo virtual, carpetas, configuración, derivación de credenciales y escritura de la instalación. Por solicitud de presentación, `js/installer/ritmo.js` dosifica los avances durante diez segundos. El 100% solo se muestra después de confirmar el guardado. Después ocurre un reinicio breve y se abre automáticamente el login, sin botones adicionales. Si las operaciones tardan más, no se anuncian como completadas antes de terminar.

IndexedDB guarda la instalación completa en una transacción. Las contraseñas se derivan con PBKDF2-SHA256, sal aleatoria e iteraciones; no se persisten en texto plano. El borrador previo a la instalación solo vive en memoria: recargar antes de finalizar vuelve al arranque. Una recarga después de finalizar conserva la instalación, pero cierra la sesión. La persistencia depende del navegador y del origen exacto; usa siempre http://127.0.0.1:8080. Borrar los datos del sitio elimina la instalación. Un fallo de almacenamiento muestra un error y permite reintentar; no se sobrescriben instalaciones existentes.

La terminal ofrece 120 comandos principales en español, con alias Windows, prompt y ejecución con Enter, sin botón Ejecutar ni selector gráfico de idioma. `+` o Alt+Mayús+T abre otra pestaña. Cada pestaña conserva ruta, historial, salida y borrador propios. Los archivos se comparten; las operaciones entre pestañas se ordenan y leen el estado actualizado. Si otra pestaña elimina la carpeta actual, se vuelve al hogar. Las operaciones pasan por el núcleo y el servicio de archivos virtuales. La carpeta inicial es `/home/usuario`; al cerrar o recargar se pierde el historial, pero los archivos de la cuenta instalada permanecen guardados. Consulta `apps/consola/README.md` para sintaxis y atajos.

## KAIRÓS OS Live e instalación desde consola

Antes de instalar, el arranque ofrece `Probar KAIRÓS OS Live`; después de instalar se abre directamente el acceso. La sesión usa archivos temporales compartidos entre sus pestañas y no modifica la instalación guardada. Reiniciar o recargar descarta estos archivos. `js/core/live.js` administra el borrador y delega la instalación al mismo motor y validaciones del asistente gráfico. La cuenta y el plan de disco se guardan únicamente con `instalar confirmar`; los archivos creados en Live no se transfieren.

```text
configurar nombre "Ana López"
configurar usuario ana
configurar contrasena
```

Después de la última orden, escribir la contraseña en la entrada oculta y pulsar Enter. Escape cancela. La contraseña no se añade al historial ni a la salida. Continuar con:

```text
particionar
particionar editar principal 24 Sistema
particionar crear 24 40 Datos
formatear confirmar
instalar
instalar confirmar
```

`particionar usar id` selecciona el destino; `particionar borrar id confirmar` elimina una partición del plan. Los cambios requieren volver a confirmar el formato. Las unidades de inicio y tamaño son GiB. `configurar idioma en`, `configurar teclado espanol` y `configurar zona UTC` ajustan preferencias; español, teclado latinoamericano y Honduras son los valores iniciales. `configurar` muestra el resumen sin revelar la contraseña. Una instalación existente nunca se reemplaza desde Live: la sesión instalada permite borrarla con `reinstalar confirmar`, tras revisar la advertencia de `reinstalar`.

`ruta`, `arbol [ruta]`, `buscar nombre [ruta]` y `discos` funcionan tanto en Live como en la cuenta instalada. La ayuda Live incluye configurar, particionar, formatear e instalar; la ayuda de la cuenta instalada incluye reinstalar y omite las órdenes exclusivas de Live.

La identidad visual usa `assets/logo.jpeg`, el azul #1c1858 y el dorado #e8b313. `css/marca.css` reúne el tema y las transiciones; respeta la preferencia de movimiento reducido. Las animaciones no agregan esperas al motor de instalación. Los avisos técnicos permanecen en la documentación; la interfaz conserva confirmaciones de eliminación y errores necesarios.

No incluye escritorio, navegación externa, descargas, ejecución de EXE ni Electron.

## Verificación manual en navegador

Para repetir la instalación, iniciar sesión y ejecutar `reinstalar`. La consola informa que se perderán la cuenta, las preferencias y todos los archivos de KAIROS. `reinstalar confirmar` realiza la limpieza y abre el asistente. Cualquier otra entrada conserva los datos. La sesión solo se cierra después de confirmar la transacción; se comparan revisión y fecha para evitar borrar una instalación reemplazada desde otra sesión.

1. Sin instalación, elegir `Instalar KAIRÓS OS` o `Probar KAIRÓS OS Live`.
2. Recorrer los pasos del asistente, comprobar errores y ajustes de particiones.
3. Instalar y observar la rueda durante unos diez segundos; el acceso aparece automáticamente tras reiniciar.
4. Probar contraseña incorrecta, mostrar u ocultar la contraseña y luego entrar con la correcta.
5. Crear archivos, recargar y comprobar que se abre directamente el login y los archivos permanecen.
6. Ejecutar `reiniciar` y comprobar acceso automático; abrir pestañas y revisar sus rutas e historial independientes.
7. Ejecutar `reinstalar`, verificar que solo muestra la advertencia, y luego `reinstalar confirmar` para una instalación nueva.
8. Probar el mismo recorrido desde Live con la guía de comandos y el indicador circular de progreso.


Las pruebas automatizadas validan instalación, traducciones, análisis y sintaxis de comandos, archivos, navegación, historial, errores, sesiones y contratos de persistencia con adaptadores controlados. La revisión manual verifica la integración DOM e IndexedDB real.

## Organización

- `js/core/`: arranque, credenciales y núcleo de operaciones de terminal.
- `js/installer/`: modelo de pasos, validación, ejecución de tareas e interfaz.
- `js/desktop/`: futuro escritorio y ventanas.
- `js/services/`: servicio de archivos virtuales; configuración y navegación quedan pendientes.
- `js/persistence/`: repositorio IndexedDB versionado y guardado transaccional.
- `js/platform/`: futuros adaptadores de navegador y Electron.
- `apps/consola/`: interfaz, intérprete y catálogo de comandos.
- `assets/`: recursos visuales e idiomas.
- `tests/`: pruebas de esta base.

Las carpetas pendientes contienen documentación de responsabilidad; no duplican módulos de archivos, navegador o configuración.


## Electron y almacenamiento local

El comando `pnpm empaquetar` produce `entregables/KAIROS-Portable-0.2.0-x64.exe` con el logotipo como icono. Es portátil: ejecutarlo abre KAIRÓS OS sin un asistente de instalación de Windows. En un equipo sin datos previos muestra el arranque y las opciones del instalador de KAIRÓS OS; después de instalar, solicita usuario y contraseña en consola. No necesita Node.js instalado en el equipo de presentación.

El paquete es para Windows x64. La selección de 32/64 bits pertenece al perfil simulado: no produce un emulador de procesador ni otro ejecutable. Plus admite hasta tres cuentas y Pro hasta ocho, incluida la administradora creada al instalar.

Electron guarda el estado en `%LOCALAPPDATA%\KAIROS\datos\estado.json` y los archivos y carpetas en un volumen dentro de esa misma carpeta. `almacen` muestra la ubicación actual. Cada escritura prepara un volumen nuevo, confirma el estado y retira el volumen anterior; evita publicar cambios incompletos. El estado JSON es la fuente de verdad: editar directamente el espejo desde el Explorador no importa cambios a KAIROS. Modifica archivos mediante la consola. En el navegador se conserva IndexedDB; sus instalaciones son independientes de Electron.

`electron/main.cjs` configura la ventana y permite solamente operaciones de almacenamiento; `preload.cjs` expone un puente limitado. La interfaz no recibe acceso a Node.js, al shell ni a rutas arbitrarias del anfitrión. `almacen-local.cjs` valida rutas y revisiones; `js/platform/repositorio-local.js` adapta el puente al contrato del núcleo. `electron/empaquetar.cjs` prepara una copia de producción en una carpeta temporal para evitar bloqueos de OneDrive. No sobrescribe un EXE existente: cambia la versión o conserva el archivo anterior con otro nombre antes de volver a empaquetar. El EXE no tiene firma comercial; Windows puede mostrar una advertencia de editor desconocido.

El login gráfico anterior se conserva en `apps/acceso-grafico/acceso-grafico.js` como módulo futuro. No se importa ni muestra actualmente. No hay escritorio gráfico.

Consulta [GUIA-CONSOLA.md](GUIA-CONSOLA.md) para rutas Windows, cuentas, respaldos y el catálogo de 120 comandos. `cuenta crear usuario "Nombre"` y `cuenta clave` solicitan la contraseña en una entrada oculta, sin guardarla en el historial. `cambiarusuario usuario` cierra todas las pestañas y exige autenticarse de nuevo; no basta con cambiar el nombre del prompt.

## Verificación de esta ampliación

61 pruebas automatizadas: instalación, credenciales, traducciones, argumentos, rutas, pestañas, comandos, respaldos y almacenamiento físico. Se probó también la aplicación empaquetada con una carpeta aislada: instalación Pro/32, progreso de diez segundos, login por consola, cuentas, contraseñas ocultas, pestañas, archivos locales y reapertura sin repetir la instalación.


## Correcciones de consola (sin nuevo empaquetado)

El código fuente incorpora 120 comandos registrados. La ayuda aparece como tabla ASCII con comando, uso, función y ejemplo. `ayuda crear` explica archivo/carpeta; `carpetas proyectos\tarea` crea los niveles faltantes. Las columnas conservan su alineación y la consola admite desplazamiento horizontal en pantallas pequeñas.

`editar nota.txt` abre el editor en la consola. Ctrl+G muestra ayuda; Ctrl+O o Ctrl+S guarda; Ctrl+X sale y pregunta si hay cambios. S guarda, N descarta y Escape/Ctrl+C cancela el aviso. Guardar pasa por el núcleo y rechaza sobrescribir un archivo que cambió desde otra pestaña. Ctrl+C cancela la entrada de comandos o una contraseña pendiente; Ctrl+U limpia la entrada.

El nombre del usuario y el nombre completo permanecen visibles, incluso mientras se escriben comillas. Solo se enmascara la contraseña. La entrada separada de contraseña no se guarda en el historial. La creación de cuentas y los cambios de contraseña rechazan una clave usada por otra cuenta; el inicio de sesión siempre verifica las credenciales de la cuenta elegida. No se alteran contraseñas existentes durante esta actualización.

El instalador solo ofrece teclado español latinoamericano e inglés (Estados Unidos). La selección cambia la escritura por posición física dentro de KAIRÓS OS y se puede comprobar inmediatamente en el campo de prueba. Incluye Shift, Bloq Mayús, AltGr, tildes y diéresis. Se guarda para el acceso por consola y el editor; pegar texto e introducir texto mediante IME conserva el comportamiento nativo. Los atajos siguen funcionando. La antigua preferencia español de España conserva entrada nativa para instalaciones previas. No cambia el teclado de Windows.

Pro requiere una de las cinco claves de `LICENCIAS-PRO.txt`; la fuente central de validación es `js/core/licencias.js`. Son licencias académicas de demostración, verificadas localmente y reutilizables entre instalaciones. No existe servidor de activación. Las instalaciones Pro anteriores se conservan; `activar clave` permite registrar su clave antes de crear cuentas adicionales.

La red es un modelo, sin ICMP real ni puertos del equipo. `ip` muestra la dirección privada asignada; `ping google.com 4` muestra respuestas simuladas usando el DNS del modelo. El nombre ping se utiliza como comprobación de conectividad. `registrardns aula.local 10.0.0.20` añade un destino al modelo; una dirección no registrada produce un error de DNS.

Cada instalación nueva reserva una IPv4 10.x.x.x. El cursor de asignación se guarda en IndexedDB (clave cursor-red) o en el archivo nativo cursor-red.json. Borrar la instalación con reinstalar conserva ese cursor, por lo que la siguiente instalación recibe otra dirección. Reiniciar conserva la dirección guardada. El cursor no es un archivo de usuario y no puede borrarse desde la consola. Eliminar todos los datos del navegador o toda la carpeta privada también elimina el registro de asignaciones. Las instalaciones antiguas reciben una IP al arrancar, conservando sus cuentas y archivos.

Se añadieron módulos independientes: `comandos-archivos.js`, `comandos-configuracion.js`, `red.js`, `licencias.js`, `catalogo-ampliado.js`, `secretos.js` y `editor.js`. Los textos y ejemplos nuevos se centralizan en `assets/locales/comandos-es.js` y `comandos-en.js`.

Verificación actual: 165 pruebas automatizadas aprobadas, prueba integral en navegador de instalador/Live, licencias, teclado, editor y red, y prueba del almacenamiento nativo de Electron desde el código fuente. El teclado se verificó además con pulsaciones físicas en navegador: cambio de distribución, contraseña durante instalación y acceso tras recargar, editor y persistencia. El EXE 0.2.0 anterior no incluye estas correcciones y no se ha regenerado.


## Recuperacion de contrasena

Las instalaciones nuevas exigen una pregunta de seguridad en el paso de contrasena. La respuesta se oculta y se guarda como PBKDF2-SHA256 con sal independiente; no se conserva texto plano. Los textos se centralizan en `assets/locales/seguridad-es.js` y `seguridad-en.js`. `preguntas-seguridad.js` valida preguntas y normaliza respuestas; `recuperacion.js` verifica la respuesta y actualiza la clave mediante el repositorio, conservando archivos y preferencias.

En el acceso, escribe `recuperar` en Usuario o pulsa F2. Introduce el usuario, responde la pregunta y escribe y confirma la nueva contrasena. Escape cancela. El permiso caduca en cinco minutos y solo puede usarse una vez; cambiar las credenciales o la pregunta lo invalida. Se rechazan claves cortas, confirmaciones diferentes, la clave anterior y claves de otras cuentas. Cinco respuestas incorrectas bloquean durante un minuto esa pantalla; este contador es temporal y no es una proteccion contra ataques locales ni contra recargas.

Las instalaciones antiguas se conservan. No se inventa una respuesta para cuentas que no la tienen: desde una sesion autenticada, `cuenta seguridad mascota` configura la recuperacion de la cuenta actual y solicita una respuesta oculta. Tambien se puede usar `escuela` o `ciudad`. Usuarios adicionales deben configurar su propia pregunta. Una cuenta antigua sin pregunta y cuya contrasena se desconoce no puede recuperarse mediante este mecanismo.

Para instalar desde Live, configura `pregunta mascota` y `respuesta` mediante el comando configurar, ademas de usuario y contrasena. El resumen nunca muestra la respuesta. Pruebas: 165 verificaciones automatizadas, recuperacion integral en navegador con datos aislados, recarga y acceso con nueva clave, archivos conservados y almacenamiento nativo reabierto. No se ha generado un nuevo EXE.

En el acceso, `recuperar` recupera la contrasena mediante la pregunta de seguridad. `restaurar` solicita escribir `confirmar` para borrar la instalacion completa de KAIRÓS OS y abrir el asistente para una instalacion limpia. Escape cancela y ningun dato se borra hasta confirmar. No requiere recordar la contrasena. El borrado pasa por el nucleo y verifica que la instalacion no haya cambiado mientras se confirma. Dentro de una sesion iniciada, `restaurar` conserva su funcion de restaurar respaldos de archivos; `reinstalar confirmar` permite borrar la instalacion desde esa sesion.

Los nombres de usuario admiten letras mayusculas y minusculas, conservando la escritura elegida (por ejemplo Jorge). Para identificar una cuenta en el acceso, recuperacion o comandos de usuarios, Jorge, jorge y JORGE se consideran el mismo usuario. No se permiten cuentas duplicadas que solo cambien por mayusculas. Las carpetas y el prompt conservan el nombre guardado; las contrasenas si distinguen mayusculas. La longitud sigue siendo de 3 a 24 caracteres, comenzando con una letra sin tilde y admitiendo numeros, guion y guion bajo.
