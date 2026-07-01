# Ajuste responsive móvil con filtros y paginación

Reemplaza estos archivos:

- `seguro-vehicular.html`
- `assets/css/styles.css`
- `assets/js/app.js`

Cambios:
- En móvil, las pólizas se muestran como tarjetas compactas en lugar de tabla.
- Se agregó paginación para pólizas y vehículos.
- Por defecto en móvil se muestran 5 pólizas y 6 vehículos por página.
- En escritorio se mantiene una vista amplia.
- Se agregaron filtros adicionales:
  - Pólizas: estado, año, aseguradora, reserva/proyecto.
  - Vehículos: categoría, póliza, reserva/proyecto, estado operativo.
- Se agregaron botones para limpiar filtros.
- Se agregó selector de cantidad: mostrar 5/10/20/todo en pólizas y 6/12/24/todo en vehículos.

No se modifica la conexión con OneDrive ni los JSON.
