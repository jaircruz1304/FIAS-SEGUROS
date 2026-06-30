# Revisión del repositorio FIAS-DONACIONES-main

El repositorio de donaciones es más simple que la primera propuesta de seguros porque usa:

1. Un solo HTML (`Donaciones.html`).
2. Un solo script de conversión (`scripts/build-data.mjs`).
3. Un solo JSON principal (`data/control-donaciones.json`).
4. Un workflow único para actualizar datos.
5. Un Excel público descargado desde SharePoint, sin Microsoft Graph ni secrets de Azure.

Esta versión simplificada de seguros replica ese patrón, pero adaptado a vehículos y pólizas.
