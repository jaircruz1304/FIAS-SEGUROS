import fs from "node:fs";
import { transformWorkbook } from "./transform-seguros.js";

const inputPath = process.env.LOCAL_EXCEL_PATH || process.env.OUTPUT_EXCEL_PATH || "tmp/Base_Datos_Seguros_Vehiculares_FIAS.xlsx";
const outDir = process.env.OUT_DATA_DIR || "data/seguros";

if (!fs.existsSync(inputPath)) {
  console.error(`No existe el Excel de entrada: ${inputPath}`);
  console.error("Ejecuta primero scripts/fetch-onedrive-excel.js o copia el Excel en tmp/.");
  process.exit(1);
}

transformWorkbook(inputPath, outDir);
