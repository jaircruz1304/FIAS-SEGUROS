# Cambio: usar imagen real como marco de teléfono

Reemplaza estos archivos en tu repositorio:

- `seguro-vehicular.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/img/phone-frame-video.png`

## Qué se cambió

- El teléfono de los videos ya no se dibuja con CSS.
- Se usa la imagen real del teléfono que enviaste como marco.
- El video se coloca dentro de la pantalla del teléfono.
- El marco queda encima con `pointer-events:none`, para que los controles del video sigan funcionando.

## Importante

Después de subir los cambios, limpia caché del navegador con Ctrl + F5.
