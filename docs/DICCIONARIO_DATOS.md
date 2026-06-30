# Diccionario de datos – Seguro Vehicular FIAS

El Excel debe conservar los nombres de hojas y encabezados exactamente como se indica.

## 01_Polizas

Tabla lógica: `tblPolizas`

| Campo | Obligatorio | Descripción |
|---|---:|---|
| id_poliza | Sí | Identificador único de la póliza, ejemplo `VP-0205092`. |
| poliza_numero | Sí | Número de póliza, ejemplo `205092`. |
| ramo | Sí | Ramo de la póliza. |
| documento | Sí | PÓLIZA, RENOVACIÓN u otro tipo. |
| anexo | No | Número de anexo. |
| renovacion | No | Número de renovación. |
| aseguradora | Sí | Nombre de la aseguradora. |
| asegurado | Sí | Nombre del asegurado institucional. |
| ruc_asegurado | Sí | RUC del asegurado. |
| emision | Sí | Fecha ISO: `YYYY-MM-DD`. |
| vig_desde | Sí | Fecha ISO: `YYYY-MM-DD`. |
| vig_hasta | Sí | Fecha ISO: `YYYY-MM-DD`. |
| plazo_dias | No | Plazo de vigencia en días. |
| suma_asegurada_poliza | Sí | Valor numérico sin símbolo dólar. |
| prima | No | Prima. |
| scvs | No | Valor SCVS. |
| derechos_emision | No | Derechos de emisión. |
| otros | No | Otros valores. |
| seguro_campesino | No | Seguro social campesino. |
| iva | No | IVA. |
| total_pagado | Sí | Total pagado de la póliza. |
| moneda | Sí | USD. |
| fecha_max_pago | No | Fecha ISO. |
| estado_pago | No | PAGADO / PENDIENTE. |
| reserva_proyecto | Sí | Reserva, programa o proyecto. |
| pdf_nombre | No | Nombre del PDF de respaldo. |
| observaciones | No | Texto libre. |
| mostrar_web | Sí | `SI` o `NO`. |

## 02_Bienes_Asegurados

Tabla lógica: `tblBienesAsegurados`

| Campo | Obligatorio | Descripción |
|---|---:|---|
| id_bien | Sí | Identificador único. Se recomienda usar placa. |
| id_poliza | Sí | Debe coincidir con `01_Polizas.id_poliza`. |
| item | No | Número de ítem en la póliza. |
| placa | Sí | Placa del vehículo, moto o cuadrón. |
| categoria | Sí | Moto, Camioneta, Jeep/SUV, Cuadrón. |
| clase | No | Clase según póliza. |
| marca | Sí | Marca. |
| modelo | Sí | Modelo. |
| anio | Sí | Año. |
| color | No | Color. |
| codigo | No | Código interno o código de póliza. |
| chasis | No | Chasis. |
| motor | No | Motor. |
| uso_vehiculo | No | Uso del vehículo. |
| ocupantes | No | Número de ocupantes. |
| dispositivo | No | Dispositivo de seguridad. |
| reserva_proyecto | Sí | Reserva, área o proyecto. |
| valor_asegurado | Sí | Valor base. |
| valor_accesorios | No | Valor de accesorios. |
| total_asegurado | Sí | Valor total asegurado. |
| deducible | Sí | Deducible resumido. |
| estado_operativo | No | Activo, inactivo, etc. |
| responsable_custodio | No | Custodio/responsable. |
| ubicacion | No | Ubicación. |
| observaciones | No | Texto libre. |
| mostrar_web | Sí | `SI` o `NO`. |

## Hojas complementarias

- `03_Coberturas`: coberturas generales o específicas.
- `04_Asistencia`: contactos y servicios de asistencia.
- `05_Procedimiento_Siniestro`: pasos de qué hacer y qué no hacer.
- `06_Documentos_Requeridos`: documentos necesarios para atención.
- `07_FAQ`: preguntas frecuentes.
- `08_Videos`: rutas de videos dentro del repositorio.
- `09_Config_Web`: textos editables de la web.
- `10_Catalogos`: catálogos de apoyo.

## Reglas de calidad

- No usar celdas combinadas en las tablas.
- No cambiar encabezados.
- Fechas en formato `YYYY-MM-DD`.
- Valores económicos como número.
- `mostrar_web` acepta solo `SI` o `NO`.
- Cada `id_poliza` debe ser único.
- Cada `id_bien` debe ser único.
