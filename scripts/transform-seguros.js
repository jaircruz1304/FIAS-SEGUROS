import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import { ensureDir, writeJson, normalizeText, toNumber, excelDateToISO, visible, statusFor, csvEscape } from "./utils.js";

const SHEETS = {
  polizas: "01_Polizas",
  bienes: "02_Bienes_Asegurados",
  coberturas: "03_Coberturas",
  asistencia: "04_Asistencia",
  procedimiento: "05_Procedimiento_Siniestro",
  documentos: "06_Documentos_Requeridos",
  faq: "07_FAQ",
  videos: "08_Videos",
  config: "09_Config_Web",
  catalogos: "10_Catalogos",
  riesgos: "11_Riesgos_No_Vehiculares"
};

function rows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`Advertencia: no existe la hoja ${sheetName}. Se usará arreglo vacío.`);
    return [];
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

function normalizePolizas(rows) {
  return rows.filter(r => visible(r) && normalizeText(r.id_poliza).length > 0).map(r => {
    const vigHasta = excelDateToISO(r.vig_hasta);
    const st = statusFor(vigHasta);
    return {
      id_poliza: normalizeText(r.id_poliza),
      poliza_numero: normalizeText(r.poliza_numero),
      ramo: normalizeText(r.ramo),
      documento: normalizeText(r.documento),
      anexo: normalizeText(r.anexo),
      renovacion: normalizeText(r.renovacion),
      aseguradora: normalizeText(r.aseguradora),
      asegurado: normalizeText(r.asegurado),
      ruc_asegurado: normalizeText(r.ruc_asegurado),
      emision: excelDateToISO(r.emision),
      vig_desde: excelDateToISO(r.vig_desde),
      vig_hasta: vigHasta,
      plazo_dias: toNumber(r.plazo_dias),
      suma_asegurada_poliza: toNumber(r.suma_asegurada_poliza),
      prima: toNumber(r.prima),
      scvs: toNumber(r.scvs),
      derechos_emision: toNumber(r.derechos_emision),
      otros: toNumber(r.otros),
      seguro_campesino: toNumber(r.seguro_campesino),
      iva: toNumber(r.iva),
      total_pagado: toNumber(r.total_pagado),
      moneda: normalizeText(r.moneda || "USD"),
      fecha_max_pago: excelDateToISO(r.fecha_max_pago),
      estado_pago: normalizeText(r.estado_pago),
      reserva_proyecto: normalizeText(r.reserva_proyecto),
      pdf_nombre: normalizeText(r.pdf_nombre),
      observaciones: normalizeText(r.observaciones),
      mostrar_web: normalizeText(r.mostrar_web || "SI"),
      estado: st.estado,
      dias_restantes: st.dias_restantes
    };
  });
}

function normalizeBienes(rows) {
  return rows.filter(r => visible(r) && normalizeText(r.id_poliza).length > 0 && normalizeText(r.id_bien || r.placa).length > 0).map(r => ({
    id_bien: normalizeText(r.id_bien || r.placa),
    id_poliza: normalizeText(r.id_poliza),
    item: normalizeText(r.item),
    placa: normalizeText(r.placa),
    categoria: normalizeText(r.categoria),
    clase: normalizeText(r.clase),
    marca: normalizeText(r.marca),
    modelo: normalizeText(r.modelo),
    anio: normalizeText(r.anio),
    color: normalizeText(r.color),
    codigo: normalizeText(r.codigo),
    chasis: normalizeText(r.chasis),
    motor: normalizeText(r.motor),
    uso_vehiculo: normalizeText(r.uso_vehiculo),
    ocupantes: toNumber(r.ocupantes),
    dispositivo: normalizeText(r.dispositivo),
    reserva_proyecto: normalizeText(r.reserva_proyecto),
    valor_asegurado: toNumber(r.valor_asegurado),
    valor_accesorios: toNumber(r.valor_accesorios),
    total_asegurado: toNumber(r.total_asegurado),
    deducible: normalizeText(r.deducible),
    estado_operativo: normalizeText(r.estado_operativo),
    responsable_custodio: normalizeText(r.responsable_custodio),
    ubicacion: normalizeText(r.ubicacion),
    observaciones: normalizeText(r.observaciones),
    mostrar_web: normalizeText(r.mostrar_web || "SI")
  }));
}

function normalizeGeneric(rows) {
  return rows.filter(visible).map(r => {
    const o = {};
    for (const [k, v] of Object.entries(r)) o[k] = typeof v === "string" ? v.trim() : v;
    return o;
  });
}

function configObject(rows) {
  const config = {};
  rows.filter(r => normalizeText(r.activo || "SI").toUpperCase() !== "NO").forEach(r => {
    if (r.clave) config[normalizeText(r.clave)] = normalizeText(r.valor);
  });
  return config;
}

function calcKpis(polizas, bienes, riesgos = []) {
  const categories = {};
  bienes.forEach(b => {
    const cat = normalizeText(b.categoria) || "Sin categoría";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const ramos = [...new Set(polizas.map(p => normalizeText(p.ramo)).filter(Boolean))].sort();
  const vigencias = polizas.map(p => normalizeText(p.vig_hasta)).filter(Boolean);
  const desde = polizas.map(p => normalizeText(p.vig_desde)).filter(Boolean).sort();
  const vigenciaCounts = {};
  vigencias.forEach(v => vigenciaCounts[v] = (vigenciaCounts[v] || 0) + 1);
  const vigenciaPrincipal = Object.entries(vigenciaCounts)
    .sort((a, b) => (b[1] - a[1]) || b[0].localeCompare(a[0]))[0]?.[0] || "";

  const stateCounts = { VIGENTE: 0, POR_VENCER: 0, VENCIDA: 0, SIN_FECHA: 0 };
  polizas.forEach(p => stateCounts[p.estado || "SIN_FECHA"] = (stateCounts[p.estado || "SIN_FECHA"] || 0) + 1);

  const totalSumaPolizas = Number(polizas.reduce((s, p) => s + (+p.suma_asegurada_poliza || 0), 0).toFixed(2));
  const totalValorBienes = Number(bienes.reduce((s, b) => s + (+b.total_asegurado || 0), 0).toFixed(2));
  const totalPrimas = Number(polizas.reduce((s, p) => s + (+p.total_pagado || 0), 0).toFixed(2));

  return {
    total_polizas: polizas.length,
    ramos_cubiertos: ramos.length,
    ramos_lista: ramos,
    total_bienes: bienes.length,
    total_riesgos_no_vehiculares: riesgos.length,
    total_motos: categories["Motocicleta"] || categories["Moto"] || 0,
    total_camionetas: categories["Camioneta"] || 0,
    total_jeep_suv: categories["Jeep/SUV"] || categories["Jeep"] || categories["SUV"] || 0,
    total_cuadrones: categories["Cuadrón"] || categories["Cuadron"] || 0,
    total_suma_asegurada: totalSumaPolizas,
    total_valor_bienes: totalValorBienes,
    diferencia_polizas_bienes: Number((totalSumaPolizas - totalValorBienes).toFixed(2)),
    total_primas: totalPrimas,
    vigencia_principal_hasta: vigenciaPrincipal,
    cobertura_anual: desde.length && vigenciaPrincipal ? `${desde[0]} a ${vigenciaPrincipal}` : "",
    vigentes: stateCounts.VIGENTE || 0,
    por_vencer: stateCounts.POR_VENCER || 0,
    vencidas: stateCounts.VENCIDA || 0,
    sin_fecha: stateCounts.SIN_FECHA || 0,
    categorias: categories
  };
}

export function transformWorkbook(inputPath, outDir = "data/seguros") {
  const workbook = XLSX.readFile(inputPath, { cellDates: true });
  const polizas = normalizePolizas(rows(workbook, SHEETS.polizas));
  const bienes = normalizeBienes(rows(workbook, SHEETS.bienes));
  const coberturas = normalizeGeneric(rows(workbook, SHEETS.coberturas));
  const asistencia = normalizeGeneric(rows(workbook, SHEETS.asistencia));
  const procedimiento_siniestro = normalizeGeneric(rows(workbook, SHEETS.procedimiento));
  const documentos_requeridos = normalizeGeneric(rows(workbook, SHEETS.documentos));
  const faq = normalizeGeneric(rows(workbook, SHEETS.faq));
  const videos = normalizeGeneric(rows(workbook, SHEETS.videos));
  const catalogos = normalizeGeneric(rows(workbook, SHEETS.catalogos));
  const riesgos_no_vehiculares = normalizeGeneric(rows(workbook, SHEETS.riesgos));
  const configRows = rows(workbook, SHEETS.config);
  const config = configObject(configRows);
  const kpis = calcKpis(polizas, bienes, riesgos_no_vehiculares);

  const payload = {
    meta: {
      sistema: "FIAS Seguro Vehicular",
      version: "1.0.0",
      ultima_actualizacion: new Date().toISOString(),
      fuente: "OneDrive / SharePoint + GitHub Actions",
      archivo_excel: path.basename(inputPath),
      timezone: "America/Guayaquil"
    },
    config,
    polizas,
    bienes,
    coberturas,
    asistencia,
    procedimiento_siniestro,
    documentos_requeridos,
    faq,
    videos,
    catalogos,
    riesgos_no_vehiculares,
    kpis
  };

  ensureDir(outDir);
  writeJson(path.join(outDir, "seguros-vehiculares.json"), payload);
  writeJson(path.join(outDir, "polizas.json"), polizas);
  writeJson(path.join(outDir, "bienes-asegurados.json"), bienes);
  writeJson(path.join(outDir, "coberturas.json"), coberturas);
  writeJson(path.join(outDir, "asistencia.json"), asistencia);
  writeJson(path.join(outDir, "procedimientos.json"), procedimiento_siniestro);
  writeJson(path.join(outDir, "documentos-requeridos.json"), documentos_requeridos);
  writeJson(path.join(outDir, "faq.json"), faq);
  writeJson(path.join(outDir, "videos.json"), videos);
  writeJson(path.join(outDir, "catalogos.json"), catalogos);
  writeJson(path.join(outDir, "riesgos-no-vehiculares.json"), riesgos_no_vehiculares);
  writeJson(path.join(outDir, "kpis.json"), kpis);
  writeJson(path.join(outDir, "sync-meta.json"), payload.meta);

  const headers = ["id_poliza","placa","categoria","marca","modelo","anio","color","reserva_proyecto","total_asegurado","deducible"];
  const csv = [headers.join(",")]
    .concat(bienes.map(r => headers.map(h => csvEscape(r[h])).join(",")))
    .join("\n");
  fs.writeFileSync(path.join(outDir, "polizas-consolidado.csv"), `\ufeff${csv}`, "utf8");

  console.log(`Datos generados en ${outDir}`);
  return payload;
}
