# Datos y seguridad

## Espacios de almacenamiento

| Entorno | Identificador | Alcance |
| --- | --- | --- |
| Simulador web | IndexedDB `kairos-simulator` | Instalación, usuarios, archivos y cursor de red virtual. |
| Escritorio | localStorage `kairos.desktop.v1` | Documentos y accesos del escritorio. Otros módulos usan claves `kairos.*`. |
| Electron | Carpeta privada `KAIROS/datos` | Estado JSON y espejo físico validado del volumen virtual. |

El almacenamiento del navegador depende del origen: protocolo, host y puerto. Usa siempre la misma dirección para volver a encontrar tu instalación. Borrar los datos del sitio elimina lo persistido en ese origen.

## Cambio de identidad

Los identificadores técnicos, canales IPC, nombres de producto, variables de entorno y licencias de demostración pasan a la familia `kairos`/`KAIROS`. Esta versión comienza con un espacio de almacenamiento propio. No incorpora migración automática ni borra los datos de versiones anteriores.

Para conservar archivos de una instalación anterior, exporta un respaldo desde aquella versión antes de actualizar. No copies bases de datos o estados JSON entre implementaciones sin comprobar su esquema y credenciales.

## Credenciales

El simulador deriva las contraseñas mediante PBKDF2-SHA256 con sal y conserva hashes. La recuperación usa una respuesta derivada y verifica revisiones antes de cambiar credenciales. Son cuentas del simulador; no crean usuarios Linux o Windows. Las claves Pro son valores académicos de demostración validados localmente.

## Operaciones nativas

Electron limita las escrituras a su directorio privado y rechaza rutas que escapan del volumen. Las descargas externas requieren una acción explícita del usuario. Las operaciones de particionado, red, planificación y energía son virtuales.

El servidor de la interfaz permite consultar estado del equipo con un colector Python de solo lectura. Sirve en `127.0.0.1`; no debe exponerse directamente a una red pública.

## Evidencia y límites

Los tests automatizados validan escenarios concretos, no una auditoría integral. Las capturas de revisiones anteriores pueden mostrar una identidad distinta. La arquitectura Linux propuesta necesita su propia validación en VM y no se considera implementada por la documentación.
