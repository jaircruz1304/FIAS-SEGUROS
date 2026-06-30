# FIAS – Seguro Vehicular dinámico

Repositorio base para publicar una landing informativa de **seguros vehiculares FIAS** con datos sincronizados desde un Excel maestro en **OneDrive / SharePoint**.

## Arquitectura

```text
OneDrive / SharePoint Excel
        ↓
GitHub Actions
        ↓
scripts/fetch-onedrive-excel.js
        ↓
scripts/build-data.js
        ↓
data/seguros/*.json
        ↓
index.html + assets/js/app.js
        ↓
GitHub Pages
```

Los videos informativos se almacenan directamente en el repositorio, dentro de:

```text
assets/videos/
```

Los datos se editan en el Excel maestro:

```text
Base_Datos_Seguros_Vehiculares_FIAS.xlsx
```

## Contenido del repositorio

```text
index.html
seguro-vehicular.html
assets/css/styles.css
assets/js/app.js
assets/videos/
data/seguros/
schemas/seguros-vehiculares.schema.json
scripts/
.github/workflows/
docs/
templates/
```

## Configuración rápida

1. Subir el Excel maestro a OneDrive / SharePoint.
2. Crear la aplicación en Microsoft Entra ID / Azure.
3. Configurar los Secrets del repositorio.
4. Configurar las Repository Variables.
5. Subir los videos `.mp4` a `assets/videos/`.
6. Activar GitHub Pages.
7. Ejecutar manualmente el workflow **Actualizar datos Seguro Vehicular FIAS**.

## GitHub Secrets requeridos

```text
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
```

## GitHub Repository Variables requeridas

```text
OD_SITE_HOST
OD_SITE_PATH
OD_DRIVE_NAME
OD_FILE_PATH
```

Ejemplo:

```text
OD_SITE_HOST=tu-tenant.sharepoint.com
OD_SITE_PATH=/sites/FONDODEINVERSIONAMBIENTALSOSTENIBLE
OD_DRIVE_NAME=Documentos
OD_FILE_PATH=Sistemas_FIAS/Seguro_Vehicular/Base_Datos_Seguros_Vehiculares_FIAS.xlsx
```

## Prueba local

```bash
npm install
cp templates/Base_Datos_Seguros_Vehiculares_FIAS.xlsx tmp/Base_Datos_Seguros_Vehiculares_FIAS.xlsx
npm run build:data
npm run validate
```

Luego abrir `index.html` con un servidor local:

```bash
python -m http.server 8000
```

Abrir:

```text
http://localhost:8000
```

## Actualización de videos

Colocar los videos en:

```text
assets/videos/
```

Registrar la ruta en la hoja `08_Videos` del Excel:

```text
assets/videos/asistencia-siniestro.mp4
assets/videos/prevencion-conduccion.mp4
```

## Notas importantes

- No colocar claves ni secretos en archivos del repositorio.
- No editar manualmente los JSON de `data/seguros/`, porque se regeneran desde el Excel.
- No usar celdas combinadas en las tablas del Excel.
- Mantener los nombres de hojas y columnas definidos en `docs/DICCIONARIO_DATOS.md`.
