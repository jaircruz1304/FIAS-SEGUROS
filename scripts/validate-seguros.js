import fs from "node:fs";
import Ajv from "ajv";

const DATA_PATH = process.env.DATA_PATH || "data/seguros/seguros-vehiculares.json";
const SCHEMA_PATH = process.env.SCHEMA_PATH || "schemas/seguros-vehiculares.schema.json";

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile(schema);
const ok = validate(data);

function assertUnique(rows, field, label) {
  const seen = new Set();
  for (const row of rows) {
    const value = row[field];
    if (!value) throw new Error(`${label}: campo obligatorio vacío ${field}`);
    if (seen.has(value)) throw new Error(`${label}: valor duplicado en ${field}: ${value}`);
    seen.add(value);
  }
}

function assertRefs(data) {
  const polizas = new Set(data.polizas.map(p => p.id_poliza));
  for (const b of data.bienes) {
    if (!polizas.has(b.id_poliza)) {
      throw new Error(`Bien ${b.id_bien} referencia una póliza inexistente: ${b.id_poliza}`);
    }
  }
}

if (!ok) {
  console.error("El JSON no cumple el esquema:");
  console.error(validate.errors);
  process.exit(1);
}

try {
  assertUnique(data.polizas, "id_poliza", "Pólizas");
  assertUnique(data.bienes, "id_bien", "Bienes");
  assertRefs(data);
} catch (err) {
  console.error(`Validación lógica fallida: ${err.message}`);
  process.exit(1);
}

console.log(`Validación OK: ${data.polizas.length} pólizas y ${data.bienes.length} bienes asegurados.`);
