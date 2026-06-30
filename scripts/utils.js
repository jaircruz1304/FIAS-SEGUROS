import fs from "node:fs";
import path from "node:path";

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/\$/g, "").replace(/\s/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function excelDateToISO(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return s;
}

export function visible(row) {
  return normalizeText(row.mostrar_web || row.activo || "SI").toUpperCase() !== "NO";
}

export function statusFor(endIso) {
  if (!endIso) return { estado: "SIN_FECHA", dias_restantes: null };
  const today = new Date();
  const end = new Date(`${endIso}T12:00:00`);
  const dias = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (!Number.isFinite(dias)) return { estado: "SIN_FECHA", dias_restantes: null };
  if (dias < 0) return { estado: "VENCIDA", dias_restantes: dias };
  if (dias <= 30) return { estado: "POR_VENCER", dias_restantes: dias };
  return { estado: "VIGENTE", dias_restantes: dias };
}

export function csvEscape(value) {
  return `"${normalizeText(value).replace(/"/g, '""')}"`;
}
