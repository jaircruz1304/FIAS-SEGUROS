# Cambio: video en el banner principal

Reemplaza estos archivos en el repositorio:

- `seguro-vehicular.html`
- `assets/css/styles.css`
- `assets/js/app.js`

## Qué cambia

El teléfono del banner principal deja de mostrar la imagen/texto estático “Siempre a tu lado” y ahora muestra el video **¿Qué hacer en caso de siniestro?** dentro del mockup de teléfono.

El video se toma automáticamente desde `data/seguros/videos.json`, buscando el registro que contenga “siniestro” o “asistencia”. Si no encuentra coincidencia, usa el primer video visible.

## Archivo de video esperado

El JSON actual apunta a:

`assets/videos/asistencia-siniestro.mp4`

Debes subir ese MP4 a la carpeta `assets/videos/` del repositorio.

La miniatura opcional está configurada como:

`assets/img/thumb-siniestro.png`

Si no tienes esa miniatura, el video igual funcionará.
