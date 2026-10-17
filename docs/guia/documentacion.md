# Documentación y publicación

## Un sitio principal

`mkdocs.yml` en la raíz reúne el manual técnico, el manual del escritorio y las especificaciones. Las fuentes viven en `docs/`. El README de GitHub presenta el estado y los comandos esenciales.

La configuración usa [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/), con navegación por pestañas, búsqueda en español, tema claro/oscuro y código copiable. La [documentación oficial de MkDocs](https://www.mkdocs.org/user-guide/configuration/) describe su configuración.

## Preparar y previsualizar

```bash
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install -r requirements-docs.txt
.venv-docs/bin/mkdocs serve
```

Abrir <http://127.0.0.1:8000>. Los cambios Markdown se recargan automáticamente.

## Validar

```bash
.venv-docs/bin/mkdocs build --strict
```

El sitio estático se genera en `site/`, excluido de Git. La validación estricta evita publicar advertencias de configuración y enlaces rotos. Las fuentes del manual independiente de interfaz siguen en `Interfaz-/docs/manual/`; sincroniza sus cambios con `docs/interfaz/` cuando corresponda.

## GitHub Actions y Pages

El workflow `.github/workflows/docs.yml` compila el sitio en cada push a `main` y en pull requests. Una ejecución manual publica el artefacto mediante GitHub Pages.

1. En **Settings → Pages**, selecciona **GitHub Actions** como origen.
2. Abre **Actions → Documentación KAIRÓS OS → Run workflow**.
3. Comprueba los jobs de compilación y despliegue.

La dirección prevista es <https://quiroz-zuniga.github.io/KAIROS-OS-/>. Esa URL solo estará disponible después de habilitar Pages y completar el despliegue. La subida del código no confirma que el sitio esté publicado.

## Editar contenido

Agrega páginas en Markdown y enlázalas en `nav` dentro de `mkdocs.yml`. Usa rutas relativas entre documentos; para archivos de código fuera de `docs/`, enlaza su URL en GitHub. Marca explícitamente si una capacidad está implementada, propuesta o pendiente de verificación.
