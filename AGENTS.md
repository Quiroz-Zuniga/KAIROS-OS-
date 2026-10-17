# AGENTS.md — UPHOS

## Proyecto

UPHOS es una simulación funcional de un sistema operativo desarrollada
como proyecto académico de la Universidad Politécnica de Honduras.

La simulación se desarrollará principalmente utilizando:

- HTML
- CSS
- JavaScript

El objetivo es recrear de forma funcional la experiencia de un sistema
operativo, incluyendo instalación, escritorio, archivos, aplicaciones,
usuarios, configuración y navegación web.

## Naturaleza del proyecto

UPHOS en esta etapa es una SIMULACIÓN.

No es un sistema operativo real.
No es una distribución Linux.
No se debe crear ni modificar un kernel.
No se debe modificar el sistema operativo anfitrión.

Las operaciones sobre archivos reales del equipo solamente podrán
realizarse cuando sean explícitamente necesarias y autorizadas, por
ejemplo, una descarga iniciada por el usuario.

## Arquitectura

La simulación debe mantenerse modular.

Estructura principal:

```text
simulador/
├── css/
├── js/
├── apps/
├── assets/
├── index.html
└── README.md