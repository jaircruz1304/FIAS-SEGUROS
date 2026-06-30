const DATA_URL = "./data/seguros/seguros-vehiculares.json";
let STORE = null;

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
const num = new Intl.NumberFormat("es-EC");
const safe = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
const lower = (value) => safe(value).toLowerCase();
const iconFor = (cat = "") => {
  const c = cat.toLowerCase();
  if (c.includes("moto")) return "🏍️";
  if (c.includes("camioneta")) return "🛻";
  if (c.includes("jeep") || c.includes("suv")) return "🚙";
  if (c.includes("cuadr")) return "🏎️";
  return "🚗";
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function statusFor(endIso) {
  if (!endIso) return { key: "sin_fecha", label: "Sin fecha" };
  const today = new Date();
  const end = new Date(`${endIso}T12:00:00`);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diff)) return { key: "sin_fecha", label: "Sin fecha" };
  if (diff < 0) return { key: "vencida", label: "Vencida" };
  if (diff <= 30) return { key: "por_vencer", label: `Por vencer (${diff} días)` };
  return { key: "vigente", label: `Vigente (${diff} días)` };
}

function setConfig(data) {
  const config = data.config || {};
  $("heroTitle").textContent = config.titulo_principal || "Seguro Vehicular FIAS";
  $("heroSubtitle").textContent = config.subtitulo_principal || "Información dinámica de pólizas y bienes asegurados.";
  $("footerNote").textContent = config.nota_general || "Información de carácter informativo.";
  const meta = data.meta || {};
  $("syncMeta").innerHTML = `🟢 Última sincronización: <b>${safe(meta.ultima_actualizacion)}</b> · Fuente: ${safe(meta.fuente)}`;
}

function renderKPIs(kpis = {}) {
  const items = [
    ["Pólizas", kpis.total_polizas || 0],
    ["Bienes asegurados", kpis.total_bienes || 0],
    ["Suma asegurada", money.format(kpis.total_suma_asegurada || 0)],
    ["Total pagado", money.format(kpis.total_primas || 0)],
    ["Motos", kpis.total_motos || 0],
    ["Camionetas", kpis.total_camionetas || 0],
    ["Jeep/SUV", kpis.total_jeep_suv || 0],
    ["Por vencer", kpis.por_vencer || 0]
  ];
  $("kpiGrid").innerHTML = items.map(([label, value]) => `<div class="kpi"><strong>${value}</strong><span>${label}</span></div>`).join("");
}

function renderAssistance(rows = []) {
  $("assistanceList").innerHTML = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0))
    .map(r => `<div class="assist-item">
      <strong>${safe(r.proveedor)} · ${safe(r.servicio)}</strong>
      <span class="phone-num">${safe(r.telefono_principal)}</span>
      <small>${safe(r.descripcion)}</small>
      <small><b>Horario:</b> ${safe(r.horario)} ${r.telefono_secundario ? ` · <b>Alterno:</b> ${r.telefono_secundario}` : ""}</small>
    </div>`).join("");
}

function renderSteps(rows = []) {
  $("stepsGrid").innerHTML = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0))
    .map(r => {
      const no = safe(r.tipo).toUpperCase() === "NO_HACER";
      return `<article class="step">
        <div class="step-top"><span class="tag">${r.orden}. ${safe(r.icono)}</span><span class="badge ${no ? "no" : "ok"}">${no ? "No hacer" : "Hacer"}</span></div>
        <h3>${safe(r.titulo)}</h3>
        <p>${safe(r.descripcion)}</p>
      </article>`;
    }).join("");
}

function populateFilters(data) {
  const categories = [...new Set((data.bienes || []).map(v => safe(v.categoria)).filter(x => x !== "—"))].sort();
  $("categoryFilter").innerHTML = `<option value="">Todas las categorías</option>` + categories.map(c => `<option value="${c}">${c}</option>`).join("");
  $("policyStatus").innerHTML = `<option value="">Todos los estados</option><option value="vigente">Vigentes</option><option value="por_vencer">Por vencer</option><option value="vencida">Vencidas</option>`;
}

function renderPolicies() {
  const q = lower($("policySearch").value);
  const status = $("policyStatus").value;
  const rows = (STORE.polizas || []).filter(p => safe(p.mostrar_web).toUpperCase() !== "NO").filter(p => {
    const st = statusFor(p.vig_hasta);
    const text = [p.id_poliza,p.poliza_numero,p.aseguradora,p.reserva_proyecto,p.pdf_nombre].map(lower).join(" ");
    return (!q || text.includes(q)) && (!status || st.key === status);
  });
  $("policyTable").innerHTML = rows.map(p => {
    const st = statusFor(p.vig_hasta);
    return `<tr>
      <td><b>${safe(p.id_poliza)}</b><br><small>${safe(p.poliza_numero)} · ${safe(p.documento)}</small></td>
      <td>${safe(p.aseguradora)}</td>
      <td>${formatDate(p.vig_desde)}<br><b>${formatDate(p.vig_hasta)}</b></td>
      <td>${safe(p.reserva_proyecto)}</td>
      <td>${money.format(+p.suma_asegurada_poliza || 0)}</td>
      <td>${money.format(+p.total_pagado || 0)}</td>
      <td><span class="status ${st.key}">${st.label}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="7">No se encontraron pólizas.</td></tr>`;
}

function renderVehicles() {
  const q = lower($("vehicleSearch").value);
  const cat = $("categoryFilter").value;
  const rows = (STORE.bienes || []).filter(v => safe(v.mostrar_web).toUpperCase() !== "NO").filter(v => {
    const text = [v.placa,v.marca,v.modelo,v.reserva_proyecto,v.id_poliza,v.categoria].map(lower).join(" ");
    return (!q || text.includes(q)) && (!cat || v.categoria === cat);
  });
  $("vehicleCards").innerHTML = rows.map(v => `<article class="vcard">
    <span class="tag">${iconFor(v.categoria)} ${safe(v.categoria)}</span>
    <h3>${safe(v.marca)} ${safe(v.modelo)}</h3>
    <p><b>Placa:</b> ${safe(v.placa)} · <b>Año:</b> ${safe(v.anio)}</p>
    <div class="detail-grid">
      <div class="detail"><b>Póliza</b><span>${safe(v.id_poliza)}</span></div>
      <div class="detail"><b>Valor asegurado</b><span>${money.format(+v.total_asegurado || 0)}</span></div>
      <div class="detail"><b>Reserva / Proyecto</b><span>${safe(v.reserva_proyecto)}</span></div>
      <div class="detail"><b>Deducible</b><span>${safe(v.deducible)}</span></div>
    </div>
  </article>`).join("") || `<div class="error-box">No se encontraron bienes asegurados.</div>`;
}

function renderDocuments(rows = []) {
  $("docList").innerHTML = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0))
    .map(r => `<div class="check-item"><strong>✅ ${safe(r.documento)}</strong><small>${safe(r.descripcion)} · ${safe(r.aplica_a)}</small></div>`).join("");
}

function renderFAQ(rows = []) {
  $("faqList").innerHTML = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0))
    .map(r => `<div class="faq-item"><strong>${safe(r.pregunta)}</strong><p>${safe(r.respuesta)}</p></div>`).join("");
}

function renderVideos(rows = []) {
  $("videoGrid").innerHTML = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0))
    .map(r => `<article class="video-card">
      <video controls preload="metadata" poster="${safe(r.miniatura_repo)}" onerror="this.outerHTML='<div class=&quot;video-placeholder&quot;>▶️ ${safe(r.titulo)}</div>'">
        <source src="${safe(r.archivo_repo)}" type="video/mp4">
      </video>
      <div class="content"><h3>${safe(r.titulo)}</h3><p>${safe(r.descripcion)}</p></div>
    </article>`).join("");
}

function exportCsv() {
  if (!STORE) return;
  const rows = STORE.bienes || [];
  const headers = ["id_poliza","placa","categoria","marca","modelo","anio","color","reserva_proyecto","total_asegurado","deducible"];
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => `"${safe(r[h]).replaceAll('"','""')}"`).join(","))).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fias_polizas_vehiculares_consolidado.csv";
  a.click();
  URL.revokeObjectURL(url);
}

async function init() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STORE = await res.json();
    setConfig(STORE);
    renderKPIs(STORE.kpis);
    renderAssistance(STORE.asistencia);
    renderSteps(STORE.procedimiento_siniestro);
    populateFilters(STORE);
    renderPolicies();
    renderVehicles();
    renderVideos(STORE.videos);
    renderDocuments(STORE.documentos_requeridos);
    renderFAQ(STORE.faq);
  } catch (err) {
    console.error(err);
    $("syncMeta").innerHTML = document.getElementById("errorTemplate").innerHTML;
  }
}

$("policySearch").addEventListener("input", renderPolicies);
$("policyStatus").addEventListener("change", renderPolicies);
$("vehicleSearch").addEventListener("input", renderVehicles);
$("categoryFilter").addEventListener("change", renderVehicles);
$("btnExportCsv").addEventListener("click", exportCsv);
$("menuButton").addEventListener("click", () => $("navLinks").classList.toggle("open"));
init();
