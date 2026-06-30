import fs from "node:fs";
import path from "node:path";
import { ensureDir } from "./utils.js";

const {
  AZURE_TENANT_ID,
  AZURE_CLIENT_ID,
  AZURE_CLIENT_SECRET,
  OD_SITE_HOST,
  OD_SITE_PATH,
  OD_DRIVE_NAME = "Documentos",
  OD_FILE_PATH,
  OD_DRIVE_ID,
  OD_ITEM_ID,
  OUTPUT_EXCEL_PATH = "tmp/Base_Datos_Seguros_Vehiculares_FIAS.xlsx"
} = process.env;

function required(name, value) {
  if (!value) throw new Error(`Falta configurar ${name}`);
}

async function getToken() {
  required("AZURE_TENANT_ID", AZURE_TENANT_ID);
  required("AZURE_CLIENT_ID", AZURE_CLIENT_ID);
  required("AZURE_CLIENT_SECRET", AZURE_CLIENT_SECRET);

  const body = new URLSearchParams({
    client_id: AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials"
  });

  const res = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) throw new Error(`No se pudo obtener token: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

async function graph(token, url) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${url}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Graph error ${res.status} en ${url}: ${await res.text()}`);
  return res;
}

async function resolveDriveAndItem(token) {
  if (OD_DRIVE_ID && OD_ITEM_ID) return { driveId: OD_DRIVE_ID, itemId: OD_ITEM_ID };

  required("OD_SITE_HOST", OD_SITE_HOST);
  required("OD_SITE_PATH", OD_SITE_PATH);
  required("OD_FILE_PATH", OD_FILE_PATH);

  const siteRes = await graph(token, `/sites/${OD_SITE_HOST}:${OD_SITE_PATH}`);
  const site = await siteRes.json();

  const drivesRes = await graph(token, `/sites/${site.id}/drives`);
  const drives = await drivesRes.json();
  const drive = (drives.value || []).find(d => d.name === OD_DRIVE_NAME) || (drives.value || [])[0];

  if (!drive) throw new Error(`No se encontró biblioteca/drive: ${OD_DRIVE_NAME}`);

  const encodedPath = OD_FILE_PATH.split("/").map(encodeURIComponent).join("/");
  const itemRes = await graph(token, `/drives/${drive.id}/root:/${encodedPath}`);
  const item = await itemRes.json();

  return { driveId: drive.id, itemId: item.id };
}

async function downloadExcel() {
  const token = await getToken();
  const { driveId, itemId } = await resolveDriveAndItem(token);

  const res = await graph(token, `/drives/${driveId}/items/${itemId}/content`);
  const arrayBuffer = await res.arrayBuffer();

  ensureDir(path.dirname(OUTPUT_EXCEL_PATH));
  fs.writeFileSync(OUTPUT_EXCEL_PATH, Buffer.from(arrayBuffer));
  console.log(`Excel descargado en ${OUTPUT_EXCEL_PATH}`);
}

downloadExcel().catch(err => {
  console.error(err);
  process.exit(1);
});
