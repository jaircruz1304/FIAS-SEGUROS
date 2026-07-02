# Corrección del error: Deployment cancelled

## Causa

El error no está en el Excel ni en los JSON. El problema es que había más de un workflow intentando publicar GitHub Pages.

Cuando dos workflows publican Pages casi al mismo tiempo, GitHub puede cancelar uno de los deployments y muestra:

`Error: Deployment cancelled.`

El aviso de Node 20 / `punycode` viene de acciones internas de GitHub y no es la causa principal del fallo.

## Corrección aplicada

- `deploy-pages.yml` queda como el único workflow que:
  1. Descarga el Excel real desde OneDrive/SharePoint.
  2. Genera JSON en `public/data/seguros`.
  3. Valida los datos.
  4. Publica GitHub Pages.
- `update-seguros-fias.yml` queda desactivado para que no intente publicar al mismo tiempo.
- Se cambió la concurrencia a:
  `cancel-in-progress: false`

## Archivos que debes reemplazar

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/update-seguros-fias.yml`

## Recomendación

En GitHub, ejecuta manualmente solo este workflow:

`Publicar Web FIAS desde OneDrive`

No ejecutes el workflow desactivado.
