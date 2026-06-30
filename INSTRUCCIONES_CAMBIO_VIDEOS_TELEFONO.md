# Ajuste de videos en formato teléfono

## Archivos que debes reemplazar

Reemplaza estos dos archivos dentro de tu repositorio:

1. `assets/css/styles.css`
2. `assets/js/app.js`

No necesitas modificar el Excel, los JSON ni el workflow.

## Qué cambia

- Los videos ya no se visualizan como reproductores horizontales.
- Cada video se muestra dentro de un mockup vertical de teléfono.
- El video se ajusta con `object-fit: cover` para que el contenido vertical se vea centrado dentro de la pantalla.
- Se conserva la carga dinámica desde `data/seguros/seguros-vehiculares.json`.
- Los videos siguen almacenándose en `assets/videos/`.

## Datos que siguen viniendo del JSON

La sección de videos sigue usando estos campos:

- `titulo`
- `descripcion`
- `archivo_repo`
- `miniatura_repo`
- `categoria`
- `orden`
- `mostrar_web`

## Ejemplo de registro en Excel / JSON

```json
{
  "id_video": "VID-001",
  "titulo": "¿Qué hacer en caso de siniestro?",
  "descripcion": "Video informativo para custodios y conductores sobre los pasos inmediatos ante un accidente o avería.",
  "archivo_repo": "assets/videos/asistencia-siniestro.mp4",
  "miniatura_repo": "assets/img/poster-siniestro.jpg",
  "categoria": "Siniestro",
  "orden": 1,
  "mostrar_web": "SI"
}
```

Si no tienes miniatura, puedes dejar `miniatura_repo` vacío.
