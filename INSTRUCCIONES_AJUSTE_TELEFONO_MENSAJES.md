# Ajuste de banner, teléfono y mensajes vacíos

Reemplaza estos archivos en tu repositorio:

```text
seguro-vehicular.html
assets/css/styles.css
assets/js/app.js
```

## Cambios incluidos

1. El teléfono del banner principal ahora es más ancho.
2. El video del banner usa `object-fit: contain` para que no se corte el contenido.
3. Los videos informativos también usan teléfono más ancho.
4. Cuando no hay datos cargados, ya no aparece “No se encontraron pólizas” o “No se encontraron bienes asegurados”. Ahora muestra:
   - “Ingresa datos para procesar la información”.
5. Cuando sí hay datos pero la búsqueda/filtro no coincide, muestra:
   - “No hay resultados con esos criterios”.

## Ruta esperada del video principal

```text
assets/videos/asistencia-siniestro.mp4
```

## No debes cambiar

- Excel maestro.
- JSON.
- Workflows.
- Scripts de sincronización.
