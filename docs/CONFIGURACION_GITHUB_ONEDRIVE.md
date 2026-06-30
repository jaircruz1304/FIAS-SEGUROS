# Configuración simplificada GitHub + OneDrive / SharePoint

Esta versión mantiene la base de datos completa del sistema de **Seguro Vehicular FIAS** y simplifica únicamente la conexión con OneDrive/SharePoint.

La actualización funciona así:

```text
Excel compartido de OneDrive/SharePoint
        ↓
GitHub Actions descarga el Excel con enlace compartido
        ↓
scripts/build-data.js transforma todas las hojas a JSON
        ↓
scripts/validate-seguros.js valida la estructura
        ↓
La web lee data/seguros/seguros-vehiculares.json
```

No se requiere Azure App Registration, Microsoft Graph ni secretos de cliente. Solo se necesita un enlace compartido de Excel que GitHub Actions pueda descargar.

## 1. Excel maestro

Usa el archivo:

```text
Base_Datos_Seguros_Vehiculares_FIAS.xlsx
```

Debe conservar las hojas completas:

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

No se debe simplificar el Excel. La conexión es la única parte simplificada.

## 2. Subir el Excel a OneDrive / SharePoint

Ubicación sugerida:

```text
Documentos/Sistemas_FIAS/Seguro_Vehicular/Base_Datos_Seguros_Vehiculares_FIAS.xlsx
```

Luego comparte el archivo con un enlace que permita lectura. Para este esquema, el enlace debe poder descargar el archivo desde GitHub Actions.

## 3. Variable principal en GitHub

En el repositorio de GitHub:

```text
Settings → Secrets and variables → Actions → Variables
```

Crea esta variable:

```text
FIAS_SEGUROS_EXCEL_URL
```

Valor: pega el enlace compartido completo del Excel.

Ejemplo:

```text
https://fiasec-my.sharepoint.com/:x:/g/personal/usuario_fias_org_ec/CODIGO_DEL_ARCHIVO
```

El script probará automáticamente estas variantes:

```text
Enlace original
Enlace con ?download=1
Enlace con ?web=0
Enlace con ?web=0&download=1
Descarga download.aspx inferida desde el enlace
```

## 4. Variables alternativas

Si prefieres usar solo el código del enlace, puedes crear:

```text
FIAS_SEGUROS_SHARE_ID
```

Y, si la ruta base no corresponde al valor por defecto, crea también:

```text
FIAS_SHAREPOINT_DOWNLOAD_BASE
```

Ejemplo:

```text
https://fiasec-my.sharepoint.com/personal/jcruzg_fias_org_ec/_layouts/15/download.aspx
```

## 5. Ejecutar actualización manual

Ir a:

```text
Actions → Actualizar datos Seguro Vehicular FIAS → Run workflow
```

El workflow descargará el Excel, generará JSON y actualizará la carpeta:

```text
data/seguros/
```

## 6. Actualización automática

El workflow está configurado para correr cada 6 horas:

```yaml
schedule:
  - cron: "0 */6 * * *"
```

GitHub Actions usa horario UTC.

## 7. Archivos JSON generados

El sistema genera:

```text
data/seguros/seguros-vehiculares.json
data/seguros/polizas.json
data/seguros/bienes-asegurados.json
data/seguros/coberturas.json
data/seguros/asistencia.json
data/seguros/procedimientos.json
data/seguros/documentos-requeridos.json
data/seguros/faq.json
data/seguros/videos.json
data/seguros/catalogos.json
data/seguros/kpis.json
data/seguros/sync-meta.json
data/seguros/polizas-consolidado.csv
```

## 8. Publicar GitHub Pages

En GitHub:

```text
Settings → Pages → Source: GitHub Actions
```

El workflow `deploy-pages.yml` publicará la web estática.

## 9. Nota importante

Si GitHub Actions descarga una página HTML en lugar del Excel, significa que el enlace no tiene permiso de lectura directa o SharePoint está pidiendo autenticación. En ese caso, vuelve a generar el enlace compartido desde OneDrive/SharePoint y verifica que el archivo pueda abrirse con el enlace desde una ventana privada del navegador.
