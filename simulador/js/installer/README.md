# Instalador
`modelo.js` valida pasos y configuración. `particiones.js` gestiona el plan de disco (64 GiB, posiciones, espacio libre, destino, creación, edición y eliminación). `vista-particiones.js` presenta la tabla y sus herramientas. `instalar.js` ejecuta tareas y confirma el guardado; `interfaz.js` coordina pantallas, navegación y progreso.

Los cambios de particiones antes de instalar solo afectan el borrador. Únicamente el destino se formatea en KAIROSFS. Las otras particiones se conservan como metadatos sin montaje ni formato. No se modifican discos reales.

Las animaciones viven en `css/installer.css`, respetan movimiento reducido y no introducen temporizadores en el motor. El progreso depende de tareas completadas y el resultado final requiere guardar en IndexedDB.

La selección de teclado aplica inmediatamente al campo de prueba y a los siguientes campos de la instalación. `js/core/teclado.js` interpreta posiciones físicas para español latinoamericano e inglés estadounidense, con Shift, Bloq Mayús, AltGr y composición de tildes. La preferencia guardada se utiliza al iniciar sesión, escribir comandos y editar archivos. Conserva atajos, entrada IME y texto pegado. La antigua distribución española mantiene el manejo nativo para instalaciones anteriores. No cambia la configuración de Windows.

El paso de contraseña exige una pregunta y respuesta de seguridad. `preguntas-seguridad.js` centraliza preguntas, normalización y validación; `instalar.js` guarda la respuesta como PBKDF2-SHA256 con sal independiente. El resumen no muestra la respuesta. `recuperacion.js` verifica la respuesta y entrega un permiso en memoria de cinco minutos para actualizar la contraseña mediante el repositorio y su control de revisión. La recuperación conserva archivos y preferencias. Las instalaciones anteriores siguen siendo válidas, pero deben configurar la recuperación desde una sesión autenticada con `cuenta seguridad mascota`, `escuela` o `ciudad`.
