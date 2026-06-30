# FIAS Seguro Vehicular – Web dinámica con conexión simplificada a SharePoint

Repositorio para publicar una landing dinámica de **Seguro Vehicular FIAS** en GitHub Pages.

Esta versión conserva la **base de datos completa** del sistema y simplifica únicamente la forma de conexión con OneDrive/SharePoint.

## Flujo de actualización

```text
Excel maestro en OneDrive/SharePoint
        ↓
GitHub Actions descarga el Excel por enlace compartido
        ↓
Node.js transforma todas las hojas del Excel a JSON
        ↓
La web carga data/seguros/seguros-vehiculares.json
```

## Archivos principales

```text
index.html
seguro-vehicular.html
assets/css/styles.css
assets/js/app.js
data/seguros/seguros-vehiculares.json
scripts/fetch-onedrive-excel.js
scripts/build-data.js
scripts/transform-seguros.js
scripts/validate-seguros.js
.github/workflows/update-seguros-fias.yml
.github/workflows/deploy-pages.yml
templates/Base_Datos_Seguros_Vehiculares_FIAS.xlsx
```

## Excel maestro

El Excel debe conservar estas hojas:

```text
01_Polizas
02_Bienes_Asegurados
03_Coberturas
04_Asistencia
05_Procedimiento_Siniestro
06_Documentos_Requeridos
07_FAQ
08_Videos
09_Config_Web
10_Catalogos
```

No uses celdas combinadas dentro de los encabezados y conserva los nombres de columnas indicados en `docs/DICCIONARIO_DATOS.md`.

## Configuración en GitHub

En:

```text
Settings → Secrets and variables → Actions → Variables
```

crea:

```text
FIAS_SEGUROS_EXCEL_URL
```

Valor: enlace compartido completo del Excel alojado en OneDrive/SharePoint.

Opcionalmente puedes usar:

```text
FIAS_SEGUROS_SHARE_ID
FIAS_SHAREPOINT_DOWNLOAD_BASE
```

## Comandos locales

```bash
npm install
npm run fetch
npm run build:data
npm run validate
```

También puedes ejecutar todo:

```bash
npm run sync
```

## Videos

Los videos informativos deben colocarse en:

```text
assets/videos/
```

En el Excel solo se registra la ruta del archivo dentro del repositorio, por ejemplo:

```text
assets/videos/asistencia-siniestro.mp4
```

## Documentación

- `docs/CONFIGURACION_GITHUB_ONEDRIVE.md`: conexión simplificada con SharePoint.
- `docs/DICCIONARIO_DATOS.md`: estructura completa del Excel.
- `docs/GUIA_USUARIO_EXCEL.md`: guía para editar la base de datos.
