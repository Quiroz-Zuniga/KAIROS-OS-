# 18. Entorno de desarrollo y ediciones

Recomendación provisional: **VSCodium**, artefacto Debian amd64 fijado y verificado, con avisos y revisión de dependencias. No se descargó ni instaló durante la revisión.

| Alternativa | Licencia/distribución | Extensiones/actualizaciones | Costo y decisión |
|---|---|---|---|
| Visual Studio Code de Microsoft | Producto bajo licencia Microsoft distinta del fuente Code OSS; revisar condiciones exactas del binario | Marketplace Microsoft; canal propio de actualización | No asumir redistribución por ser gratis; alternativa instalada explícitamente por usuario |
| VSCodium | Builds comunitarios de Code OSS, sin branding Microsoft; revisar avisos del artefacto completo | Open VSX; compatibilidad de cada extensión no garantizada | Preferido para integración inicial; empaquetar versión/checksum y definir origen de updates |
| Code OSS propio | Fuente MIT con dependencias y avisos separados | Requiere elegir galería y mantener build/updates | Más control y trabajo; fallback si hay necesidad técnica demostrada |

Las diferencias de producto y marketplace se contrastaron en [FAQ oficial VS Code](https://code.visualstudio.com/Docs/supporting/faq) y [VSCodium](https://vscodium.com/). La preferencia es una inferencia para reducir mantenimiento, no una certificación legal. No configurar Marketplace Microsoft para el fork sin revisar términos de las extensiones.

Tamaño: los tres comparten base Electron/Code, pero no hay medición local ni promesa de tamaño. Registrar descarga, instalado y delta ISO de cada candidato que se evalúe; no construir tres IDEs para medir si uno cumple. Compatibilidad Debian se prueba en trixie amd64 con sandbox y usuario normal. Registrar repositorio/firma/versión; no importar claves globales ni agregar repositorios desde renderer.

## Ediciones

Kairós OS Standard: escritorio, Firefox, terminal y gestor de archivos. Debe poder abrir VSCodium instalado para cumplir el MVP; la imagen de demostración podrá incluir solo VSCodium y Git sin toda la toolchain, identificando su perfil.

Kairós OS Developer Edition futura: perfil de paquetes separado para VSCodium, Git, Node.js/npm, Python, GCC/G++, Make, CMake y GDB. No agregar todos a Standard automáticamente. OD-04 decide si la primera ISO demo es Standard con VSCodium/Git o Developer mínima; no anunciar dos ISOs mantenidas sin presupuesto.

## Aceptación

Boot → sesión Kairós → launcher → VSCodium real → crear/editar/guardar archivo en hogar invitado → abrir terminal real → verificar contenido y Git init/status en directorio de prueba. Se comprueba también terminal integrada de VSCodium si se anuncia; no exige implementar Kairós Terminal con PTY. Extensiones opcionales no bloquean el MVP básico offline.
