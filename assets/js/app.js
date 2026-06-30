const DATA_URL = "./data/seguros/seguros-vehiculares.json";
let STORE = null;

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
const num = new Intl.NumberFormat("es-EC");

const safe = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
const lower = (value) => safe(value).toLowerCase();
const clean = (value) => value === null || value === undefined || value === "" || value === "—" ? "" : String(value).trim();
const esc = (value) => clean(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

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

function emptyTableRow(title, text, colspan = 7) {
  return `<tr class="empty-row"><td colspan="${colspan}"><div class="empty-state"><strong>${title}</strong>${text}</div></td></tr>`;
}

function emptyCardState(title, text) {
  return `<div class="empty-state"><strong>${title}</strong>${text}</div>`;
}

function renderPolicies() {
  if (!STORE) return;
  const qRaw = clean($("policySearch").value);
  const q = qRaw.toLowerCase();
  const status = $("policyStatus").value;
  const allRows = (STORE.polizas || []).filter(p => safe(p.mostrar_web).toUpperCase() !== "NO");

  if (!allRows.length) {
    $("policyTable").innerHTML = emptyTableRow(
      "Ingresa datos para procesar la información",
      "Actualiza la hoja de pólizas en el Excel maestro o ejecuta la sincronización desde OneDrive/SharePoint para visualizar los registros."
    );
    return;
  }

  const rows = allRows.filter(p => {
    const st = statusFor(p.vig_hasta);
    const text = [p.id_poliza,p.poliza_numero,p.aseguradora,p.reserva_proyecto,p.pdf_nombre].map(lower).join(" ");
    return (!q || text.includes(q)) && (!status || st.key === status);
  });

  if (!rows.length) {
    $("policyTable").innerHTML = emptyTableRow(
      "No hay resultados con esos criterios",
      "Modifica la búsqueda, limpia los filtros o selecciona otro estado para consultar las pólizas disponibles."
    );
    return;
  }

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
  }).join("");
}

function renderVehicles() {
  if (!STORE) return;
  const qRaw = clean($("vehicleSearch").value);
  const q = qRaw.toLowerCase();
  const cat = $("categoryFilter").value;
  const allRows = (STORE.bienes || []).filter(v => safe(v.mostrar_web).toUpperCase() !== "NO");

  if (!allRows.length) {
    $("vehicleCards").innerHTML = emptyCardState(
      "Ingresa datos para procesar la información",
      "Actualiza la hoja de bienes asegurados en el Excel maestro o ejecuta la sincronización desde OneDrive/SharePoint para visualizar los vehículos."
    );
    return;
  }

  const rows = allRows.filter(v => {
    const text = [v.placa,v.marca,v.modelo,v.reserva_proyecto,v.id_poliza,v.categoria].map(lower).join(" ");
    return (!q || text.includes(q)) && (!cat || v.categoria === cat);
  });

  if (!rows.length) {
    $("vehicleCards").innerHTML = emptyCardState(
      "No hay resultados con esos criterios",
      "Modifica la búsqueda, limpia los filtros o selecciona otra categoría para consultar los bienes asegurados disponibles."
    );
    return;
  }

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
  </article>`).join("");
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

function setHeroVideo(rows = []) {
  const heroVideo = $("heroVideo");
  const heroSource = $("heroVideoSource");
  if (!heroVideo || !heroSource) return;

  const visibleVideos = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  const siniestroVideo = visibleVideos.find(r => {
    const text = [r.titulo, r.categoria, r.descripcion].map(lower).join(" ");
    return text.includes("siniestro") || text.includes("asistencia");
  }) || visibleVideos[0];

  if (!siniestroVideo) return;

  const src = clean(siniestroVideo.archivo_repo);
  const poster = clean(siniestroVideo.miniatura_repo);

  if (src && heroSource.getAttribute("src") !== src) {
    heroSource.setAttribute("src", src);
    heroVideo.load();
  }

  if (poster) {
    heroVideo.setAttribute("poster", poster);
  }

  heroVideo.setAttribute("aria-label", clean(siniestroVideo.titulo) || "¿Qué hacer en caso de siniestro?");

  const tryPlay = heroVideo.play();
  if (tryPlay && typeof tryPlay.catch === "function") {
    tryPlay.catch(() => {
      // El navegador puede bloquear la reproducción automática; el usuario podrá reproducirlo con los controles.
    });
  }
}

function renderVideos(rows = []) {
  const visibleVideos = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("videoGrid").classList.add("phone-video-grid");

  $("videoGrid").innerHTML = visibleVideos.map((r, index) => {
    const videoSrc = clean(r.archivo_repo);
    const poster = clean(r.miniatura_repo);
    const posterAttr = poster ? ` poster="${esc(poster)}"` : "";
    const title = safe(r.titulo);
    const description = safe(r.descripcion);
    const category = clean(r.categoria) || "Video informativo";

    const media = videoSrc
      ? `<video class="phone-video" controls playsinline preload="metadata"${posterAttr} aria-label="${esc(title)}">
          <source src="${esc(videoSrc)}" type="video/mp4">
          Tu navegador no puede reproducir este video.
        </video>`
      : `<div class="phone-video-placeholder"><strong>▶</strong><span>Agrega el archivo MP4 en assets/videos/</span></div>`;

    return `<article class="video-phone-card">
      <div class="phone-frame" aria-label="Video en formato teléfono">
        <div class="phone-side phone-side-left"></div>
        <div class="phone-side phone-side-right"></div>
        <div class="phone-inner">
          <div class="phone-speaker"></div>
          <div class="phone-camera"></div>
          <div class="phone-screen-video">
            ${media}
          </div>
        </div>
      </div>
      <div class="video-caption">
        <span class="video-pill">${index + 1 < 10 ? `0${index + 1}` : index + 1} · ${safe(category)}</span>
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </article>`;
  }).join("") || emptyCardState("Ingresa videos informativos", "Carga los archivos MP4 en assets/videos/ y registra sus rutas en la hoja Videos del Excel maestro.");
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
    setHeroVideo(STORE.videos);
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
