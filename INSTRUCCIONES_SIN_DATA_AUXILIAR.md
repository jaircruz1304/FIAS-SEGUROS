# Corrección: sin data auxiliar y UX compacta mejorada

Esta versión corrige dos puntos:

1. La página ya no contiene coberturas auxiliares escritas dentro de `app.js`.
2. El archivo `data/seguros/seguros-vehiculares.json` queda como placeholder vacío hasta que GitHub Actions sincronice la matriz desde OneDrive/SharePoint.

## Para aplicar solo la mejora visual y de lógica
Reemplaza:
- `seguro-vehicular.html`
- `assets/css/styles.css`
- `assets/js/app.js`

## Para eliminar la data auxiliar que quedó en el repositorio
Reemplaza también:
- `data/seguros/seguros-vehiculares.json`
- `data/seguros/polizas.json`
- `data/seguros/bienes-asegurados.json`
- `data/seguros/coberturas.json`
- `data/seguros/asistencia.json`
- `data/seguros/procedimientos.json`
- `data/seguros/documentos-requeridos.json`
- `data/seguros/faq.json`
- `data/seguros/videos.json`
- `data/seguros/catalogos.json`
- `data/seguros/kpis.json`
- `data/seguros/sync-meta.json`

Después ejecuta el workflow `Actualizar datos Seguro Vehicular FIAS`.

La web debe mostrar “Información pendiente de sincronización” hasta que GitHub Actions descargue el Excel real desde OneDrive/SharePoint.
