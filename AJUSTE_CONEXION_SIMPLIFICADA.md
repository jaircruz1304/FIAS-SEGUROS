# Ajuste realizado: base completa + conexión simplificada

Se mantuvo la estructura completa de la base de datos entregada inicialmente y se ajustó únicamente la forma de obtener el Excel desde SharePoint/OneDrive.

## Qué se mantiene

- Excel completo con 10 hojas.
- JSON principal completo en `data/seguros/seguros-vehiculares.json`.
- JSON separados por módulo: pólizas, bienes, coberturas, asistencia, procedimientos, documentos, FAQ, videos, catálogos y KPIs.
- Validación de estructura mediante `schemas/seguros-vehiculares.schema.json`.
- Web dinámica que lee la información desde `data/seguros/`.
- Carpeta `assets/videos/` para videos dentro del repositorio.

## Qué se simplificó

Antes:

```text
Azure App Registration + Microsoft Graph + Client Secret + Tenant ID + Client ID
```

Ahora:

```text
Enlace compartido del Excel en SharePoint/OneDrive + GitHub Actions
```

## Nueva variable principal

En GitHub Actions → Variables:

```text
FIAS_SEGUROS_EXCEL_URL
```

Valor: enlace compartido del Excel.

## Variables opcionales

```text
FIAS_SEGUROS_SHARE_ID
FIAS_SHAREPOINT_DOWNLOAD_BASE
```

## Workflow actualizado

Archivo:

```text
.github/workflows/update-seguros-fias.yml
```

Ejecuta:

```text
scripts/fetch-onedrive-excel.js
scripts/build-data.js
scripts/validate-seguros.js
```

## Script actualizado

Archivo:

```text
scripts/fetch-onedrive-excel.js
```

El script prueba automáticamente varias formas de descarga del Excel:

- Enlace original.
- Enlace con `download=1`.
- Enlace con `web=0`.
- Enlace con `web=0&download=1`.
- Ruta `download.aspx` inferida desde el enlace de SharePoint.

Si SharePoint devuelve una página HTML en vez del archivo XLSX, el workflow se detiene y muestra el motivo.
