# Guía de actualización del Excel maestro

## Flujo recomendado

1. Descargar o abrir el Excel maestro desde OneDrive.
2. Registrar o actualizar pólizas en `01_Polizas`.
3. Registrar o actualizar vehículos, motos o cuadrones en `02_Bienes_Asegurados`.
4. Verificar que `id_poliza` del bien exista en `01_Polizas`.
5. Editar contactos en `04_Asistencia` cuando cambien.
6. Editar videos en `08_Videos` cuando se agreguen archivos al repositorio.
7. Guardar el Excel en OneDrive.
8. Ejecutar el workflow manualmente o esperar la sincronización programada.

## Errores frecuentes

| Error | Solución |
|---|---|
| La web no muestra una póliza | Revisar `mostrar_web = SI`. |
| Un vehículo no aparece | Revisar que tenga `id_bien`, `id_poliza`, placa y categoría. |
| El workflow falla por referencia | El `id_poliza` del bien no existe en `01_Polizas`. |
| Las fechas se ven mal | Usar formato `YYYY-MM-DD`. |
| Los valores no suman | Escribir montos como número, sin `$` ni comas. |

## Videos

Los videos no se sincronizan desde OneDrive. Deben estar en:

```text
assets/videos/
```

Y registrarse en `08_Videos` con su ruta exacta.
