# FIAS Seguro Vehicular — implementación simplificada

Esta versión sigue el mismo esquema del repositorio de donaciones: el navegador no lee OneDrive directamente. GitHub Actions descarga el Excel publicado en OneDrive/SharePoint, genera `data/seguros-vehiculares.json` y la página `Seguros.html` consume ese JSON desde GitHub Pages.

## Archivos principales

- `Seguros.html`: página pública dinámica.
- `data/seguros-vehiculares.json`: datos que lee la web.
- `data/seguros-vehiculares-meta.json`: fecha, fuente y diagnóstico de la última generación.
- `scripts/build-data.mjs`: descarga el Excel y lo convierte a JSON.
- `.github/workflows/update-seguros-vehiculares.yml`: actualiza datos cada 6 horas o manualmente.
- `templates/Base_Datos_Seguros_Vehiculares_FIAS_SIMPLIFICADO.xlsx`: plantilla Excel de una sola hoja.
- `assets/videos/`: carpeta para videos informativos que se almacenarán en GitHub.

## Configuración en GitHub

En `Settings > Secrets and variables > Actions > Variables`, crea al menos una de estas variables:

```text
FIAS_SEGUROS_EXCEL_URL=https://fiasec-my.sharepoint.com/:x:/g/personal/...
FIAS_SEGUROS_SHARE_ID=CODIGO_DEL_ENLACE_COMPARTIDO
```

Si el enlace público con `download=1` funciona, basta `FIAS_SEGUROS_EXCEL_URL`. Si SharePoint devuelve HTML, usa `FIAS_SEGUROS_SHARE_ID`, igual que en el repositorio de donaciones.

## Excel maestro

El Excel debe tener una hoja llamada `Control` con una fila de encabezados. Los encabezados mínimos son:

```text
Nro., Programa / Reserva / Proyecto, Placa, Categoría, Marca, Modelo, Año, Póliza, Aseguradora, Vigencia desde, Vigencia hasta, Total asegurado, Deducible, Asistencia, Mostrar web
```

Se permite cambiar ligeramente los nombres porque el script usa alias flexibles. Sin embargo, se recomienda mantener la plantilla para evitar errores.

## Publicación

1. Sube estos archivos al repositorio GitHub Pages.
2. Sube el Excel maestro a OneDrive/SharePoint.
3. Comparte el Excel con enlace de lectura.
4. Coloca el enlace o share ID en variables de GitHub.
5. Ejecuta `Actions > Actualizar seguro vehicular FIAS > Run workflow`.
6. Abre `Seguros.html` desde GitHub Pages.

## Videos

Los videos no se sincronizan desde OneDrive. Súbelos directamente al repositorio en:

```text
assets/videos/asistencia-siniestro.mp4
assets/videos/prevencion-conduccion.mp4
assets/videos/seguro-vehicular-fias.mp4
```

Luego edita los textos de la sección de videos en `Seguros.html` si necesitas cambiar nombres o descripciones.
