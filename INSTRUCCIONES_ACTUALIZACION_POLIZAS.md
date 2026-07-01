# Actualización de matriz y web - pólizas FIAS

Reemplaza/sube estos archivos:

## Matriz para OneDrive
- `templates/Base_Datos_Seguros_Vehiculares_FIAS.xlsx`

## Datos JSON para la web
- todos los archivos dentro de `data/seguros/`

## Web
- `seguro-vehicular.html`
- `assets/js/app.js`

## Cambios aplicados
- Se procesaron 18 pólizas desde PDFs.
- Se extrajeron 26 bienes vehiculares.
- Se registraron 4 riesgos o ubicaciones no vehiculares.
- Se retiró el KPI principal de "por vencer" y se reemplazó por indicadores más útiles:
  pólizas, ramos cubiertos, bienes vehiculares, motos, camionetas, suma asegurada, prima total y vigencia hasta.
- La vigencia principal detectada es 2027-01-01.
