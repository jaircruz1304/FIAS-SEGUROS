import fs from "node:fs";
import path from "node:path";
import { ensureDir } from "./utils.js";

const {
  FIAS_SEGUROS_EXCEL_URL = "",
  FIAS_SEGUROS_SHARE_ID = "",
  FIAS_SHAREPOINT_DOWNLOAD_BASE: RAW_DOWNLOAD_BASE = "",
  OUTPUT_EXCEL_PATH = "tmp/Base_Datos_Seguros_Vehiculares_FIAS.xlsx"
} = process.env;

const FIAS_SHAREPOINT_DOWNLOAD_BASE = RAW_DOWNLOAD_BASE.trim() || "https://fiasec-my.sharepoint.com/personal/jcruzg_fias_org_ec/_layouts/15/download.aspx";

function addParam(url, key, value) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function isProbablyHtml(buffer) {
  const text = buffer.subarray(0, 900).toString("utf8").trim().toLowerCase();
  return text.startsWith("<!doctype html") || text.startsWith("<html") || text.includes("<html") ||
    (text.includes("microsoft") && text.includes("sharepoint"));
}

function isProbablyXlsx(buffer) {
  // Los archivos XLSX son ZIP: empiezan con PK.
  return buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b;
}

function parseShareLink(url) {
  try {
    const u = new URL(url);
    // Ejemplo: /:x:/g/personal/jcruzg_fias_org_ec/IQAUjBvk...
    const parts = u.pathname.split("/").filter(Boolean);
    const personalIndex = parts.indexOf("personal");
    const shareId = parts[parts.length - 1];
    if (personalIndex >= 0 && parts[personalIndex + 1] && shareId && shareId.length > 10) {
      const personalPath = parts.slice(personalIndex, personalIndex + 2).join("/");
      return {
        host: u.host,
        personalPath,
        shareId
      };
    }
  } catch {
    return null;
  }
  return null;
}

function candidateUrls() {
  const candidates = [];
  const link = FIAS_SEGUROS_EXCEL_URL.trim();
  const shareId = FIAS_SEGUROS_SHARE_ID.trim();

  if (link) {
    candidates.push({ name: "Enlace compartido original", url: link });
    candidates.push({ name: "Enlace compartido con download=1", url: addParam(link, "download", "1") });
    candidates.push({ name: "Enlace compartido con web=0", url: addParam(link, "web", "0") });
    candidates.push({ name: "Enlace compartido con web=0 y download=1", url: addParam(addParam(link, "web", "0"), "download", "1") });

    const parsed = parseShareLink(link);
    if (parsed) {
      candidates.push({
        name: "SharePoint download.aspx inferido desde enlace",
        url: `https://${parsed.host}/${parsed.personalPath}/_layouts/15/download.aspx?share=${encodeURIComponent(parsed.shareId)}`
      });
    }
  }

  if (shareId) {
    candidates.push({
      name: "SharePoint download.aspx con FIAS_SEGUROS_SHARE_ID",
      url: `${FIAS_SHAREPOINT_DOWNLOAD_BASE}?share=${encodeURIComponent(shareId)}`
    });
  }

  const unique = [];
  const seen = new Set();
  for (const c of candidates) {
    if (!c.url || seen.has(c.url)) continue;
    seen.add(c.url);
    unique.push(c);
  }
  return unique;
}

async function downloadExcel() {
  const candidates = candidateUrls();
  if (!candidates.length) {
    throw new Error([
      "No hay URL de Excel configurada.",
      "Configura en GitHub Actions → Variables una de estas opciones:",
      "- FIAS_SEGUROS_EXCEL_URL: enlace compartido del Excel de OneDrive/SharePoint",
      "- FIAS_SEGUROS_SHARE_ID: código share del enlace, usando FIAS_SHAREPOINT_DOWNLOAD_BASE si aplica"
    ].join("\n"));
  }

  const errors = [];

  for (const candidate of candidates) {
    console.log(`Intentando descarga: ${candidate.name}`);
    try {
      const res = await fetch(candidate.url, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 GitHubActions FIAS Seguro Vehicular",
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*"
        }
      });

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = res.headers.get("content-type") || "sin content-type";
      console.log(`HTTP ${res.status}; ${contentType}; bytes ${buffer.length}`);

      if (!res.ok) {
        errors.push(`${candidate.name}: HTTP ${res.status}`);
        continue;
      }

      if (buffer.length < 1000 || isProbablyHtml(buffer) || contentType.toLowerCase().includes("text/html")) {
        errors.push(`${candidate.name}: SharePoint devolvió HTML o una página de acceso, no el Excel.`);
        continue;
      }

      if (!isProbablyXlsx(buffer)) {
        errors.push(`${candidate.name}: la respuesta no parece ser un archivo XLSX válido.`);
        continue;
      }

      ensureDir(path.dirname(OUTPUT_EXCEL_PATH));
      fs.writeFileSync(OUTPUT_EXCEL_PATH, buffer);
      console.log(`Excel descargado correctamente en ${OUTPUT_EXCEL_PATH}`);
      return;
    } catch (err) {
      errors.push(`${candidate.name}: ${err.message}`);
    }
  }

  throw new Error(`No se pudo descargar un XLSX válido.\n${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}`);
}

downloadExcel().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
