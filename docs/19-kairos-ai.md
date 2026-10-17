# 19. Kairós AI

Estado: arquitectura propuesta; no hay aplicación, proveedor ni credenciales implementados. AI no bloquea sesión, launcher, ISO o aplicaciones nativas.

MVP: app propia con lateral de conversaciones, chat central y panel contextual opcional; usa mismos tokens y geometría. Búho discreto, sin saturar superficies de marca. Conversaciones locales versionadas en XDG, límites y eliminación explícita. Un error de red no bloquea el escritorio.

Flujo: renderer AI → preload con métodos AI tipados → AI Service de usuario en main/helper → proveedor HTTPS. No REST localhost ni microservicio nuevo. Mantener interfaz de proveedor para una evolución a servicio local Ollama/llama.cpp sin descargar modelos grandes ahora. OD-05 resuelve proveedor, modelo, presupuesto, autenticación y persistencia de secretos antes de conectar cloud; esta revisión no presupone servicio gratuito ni credenciales del desarrollador.

## Contexto de sistema

Solo lectura y opt-in: resumen CPU/memoria, carga, almacenamiento e inventario mínimo con timestamp y origen. Mostrar vista previa del contexto enviado; no adjuntar automáticamente cmdline, entorno, seriales, SSID, home, archivos, logs o conversaciones ajenas. Una petición como «por qué está lenta» puede consultar métricas mediante capacidades permitidas, con evidencia temporal y limitaciones; no inventar diagnóstico si faltan fuentes.

El modelo no recibe shell, root, señales de procesos, archivos de escritura, paquetes ni energía. Tratar instrucciones en logs/nombres como datos. Confirmar qué información sale del equipo antes de cada envío de contexto nuevo según política elegida. No poner API keys en renderer, bundle, repositorio o logs. Si no hay almacén seguro, sesión efímera y reingreso antes que persistencia en texto plano. Cifrado local no evita lectura por procesos comprometidos del mismo usuario.

## Aceptación

App abre offline con error claro si no está configurada. Con proveedor elegido y credencial de prueba autorizada: enviar mensaje, recibir respuesta real, cancelar, manejar timeout y cuota; enviar contexto mínimo visible y comprobar ausencia de capacidades de escritura. Abrir solo una maqueta no satisface el MVP de AI funcional. Estado no configurado conserva el escritorio operativo y deja ese criterio pendiente.
