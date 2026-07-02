# Corrección de Dashboard/KPIs

Reemplaza estos archivos en GitHub:

- `scripts/transform-seguros.js`
- `assets/js/app.js`
- `assets/css/styles.css`

## Qué corrige

- Corrige `Ramos cubiertos` cuando salía 0.
- Corrige `Vigencia hasta` cuando salía `—`.
- El Dashboard ahora calcula datos relevantes desde las pólizas y bienes sincronizados:
  - Pólizas
  - Ramos cubiertos
  - Bienes vehiculares
  - Motos
  - Camionetas
  - Jeep/SUV
  - Cuadrón
  - Suma pólizas
  - Valor bienes
  - Prima / total pagado
  - Vigencia hasta
- El cálculo ahora usa los registros reales generados por el workflow, no valores fijos.

## Importante

Después de reemplazar los archivos, vuelve a ejecutar el workflow en GitHub Actions.
Si la página ya tiene JSON generado con campos incompletos, el nuevo `app.js` igual calcula el resumen desde `polizas` y `bienes`.
