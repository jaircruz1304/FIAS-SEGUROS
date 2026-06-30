# Configuración GitHub + OneDrive / SharePoint

## 1. Crear App Registration

En Microsoft Entra ID:

1. Ir a **App registrations**.
2. Crear nueva aplicación.
3. Copiar:
   - Application / Client ID.
   - Directory / Tenant ID.
4. Crear un **Client Secret**.
5. Agregar permisos de Microsoft Graph:
   - `Sites.Read.All`
   - `Files.Read.All`
6. Otorgar consentimiento de administrador.

## 2. GitHub Secrets

En GitHub:

`Settings → Secrets and variables → Actions → Secrets`

Crear:

```text
AZURE_TENANT_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
```

## 3. GitHub Variables

En:

`Settings → Secrets and variables → Actions → Variables`

Crear:

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

## 4. Ejecutar workflow

Ir a:

`Actions → Actualizar datos Seguro Vehicular FIAS → Run workflow`

El workflow:

1. Descarga el Excel.
2. Lo transforma a JSON.
3. Valida la estructura.
4. Publica cambios en `data/seguros/`.

## 5. Publicar GitHub Pages

En GitHub:

`Settings → Pages`

Seleccionar:

- Source: GitHub Actions.

El workflow `deploy-pages.yml` publicará la web estática.
