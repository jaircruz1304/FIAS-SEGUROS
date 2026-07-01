# Corrección de error de validación por IDs vacíos

Error corregido:
- `/polizas/14/id_poliza` vacío
- `/bienes/26/id_bien` vacío
- `/bienes/26/id_poliza` vacío

## Causa
El Excel tenía filas de totales/resumen dentro de las hojas de datos:
- `01_Polizas`, fila 16
- `02_Bienes_Asegurados`, fila 28

El workflow las transformaba como registros, pero no tenían ID.

## Archivos que debes reemplazar/subir

1. En OneDrive/SharePoint:
   - Reemplaza el Excel por `templates/Base_Datos_Seguros_Vehiculares_FIAS.xlsx`

2. En GitHub:
   - Reemplaza `scripts/transform-seguros.js`

## Qué se hizo

- Se eliminaron las filas de totales que provocaban IDs vacíos.
- Se actualizó el dashboard de la matriz con los valores reales de este archivo:
  - 14 pólizas
  - 26 bienes vehiculares
  - 2 ramos
  - suma asegurada USD 254.352,12
  - total pagado USD 8.681,04
- Se reforzó el script para que, si en el futuro queda una fila de totales, el workflow la ignore automáticamente.
