const DATA_URL = "./data/seguros/seguros-vehiculares.json";
let STORE = null;

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
const num = new Intl.NumberFormat("es-EC");

const safe = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
const clean = (value) => value === null || value === undefined || value === "" || value === "—" ? "" : String(value).trim();
const lower = (value) => safe(value).toLowerCase();
const esc = (value) => clean(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatDate = (value) => {
  const raw = clean(value);
  if (!raw) return "—";
  const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const iconFor = (cat = "") => {
  const c = clean(cat).toLowerCase();
  if (c.includes("moto")) return "🏍️";
  if (c.includes("camioneta")) return "🛻";
  if (c.includes("jeep") || c.includes("suv")) return "🚙";
  if (c.includes("cuadr")) return "🏎️";
  return "🚗";
};

const coverageIcon = (text = "") => {
  const t = clean(text).toLowerCase();
  if (t.includes("robo") || t.includes("hurto")) return "🔐";
  if (t.includes("natural") || t.includes("terremoto") || t.includes("inund") || t.includes("erupción") || t.includes("desliz")) return "🌧️";
  if (t.includes("responsabilidad")) return "🤝";
  if (t.includes("asistencia") || t.includes("grúa") || t.includes("wincha")) return "🛠️";
  if (t.includes("médico") || t.includes("accidental") || t.includes("ocupante")) return "🧑‍⚕️";
  if (t.includes("impacto") || t.includes("caída") || t.includes("árbol")) return "🌳";
  if (t.includes("incendio") || t.includes("explosión")) return "🔥";
  return "🚗";
};

function statusFor(dateEnd) {
  const raw = clean(dateEnd);
  if (!raw) return { key: "sin-fecha", label: "Sin fecha" };
  const today = new Date();
  const end = new Date(raw.includes("T") ? raw : `${raw}T23:59:59`);
  if (Number.isNaN(end.getTime())) return { key: "sin-fecha", label: "Sin fecha" };
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { key: "vencida", label: "Vencida" };
  if (diff <= 30) return { key: "por-vencer", label: `Por vencer (${diff} días)` };
  return { key: "vigente", label: `Vigente (${diff} días)` };
}

function emptyCardState(title, detail = "") {
  return `<div class="empty-state"><strong>${esc(title)}</strong>${detail ? `<span>${esc(detail)}</span>` : ""}</div>`;
}

function emptyTableRow(title, detail = "", colspan = 5) {
  return `<tr class="empty-row"><td colspan="${colspan}">${emptyCardState(title, detail)}</td></tr>`;
}

function getRows(key) {
  return Array.isArray(STORE?.[key]) ? STORE[key] : [];
}

function isPlaceholderData(data) {
  return Boolean(data?.meta?.placeholder || data?.meta?.estado === "pendiente_sincronizacion");
}

function setConfig(data) {
  const config = data.config || {};
  $("heroTitle").textContent = config.titulo_principal || "Seguro Vehicular FIAS";
  $("heroSubtitle").textContent = config.subtitulo_principal || "Consulta de pólizas, bienes asegurados, asistencia y pasos de atención ante siniestros.";
  $("footerNote").textContent = config.nota_general || "La información publicada es de carácter informativo y debe contrastarse con la póliza vigente y sus condiciones particulares.";

  const meta = data.meta || {};
  if (isPlaceholderData(data) || !clean(meta.ultima_actualizacion)) {
    $("syncMeta").innerHTML = `🟡 <b>Información pendiente de sincronización</b>`;
    return;
  }
  $("syncMeta").innerHTML = `🟢 Información actualizada al <b>${formatDate(meta.ultima_actualizacion)}</b>`;
}

function renderKPIs(kpis = {}) {
  const items = [
    ["Pólizas", kpis.total_polizas || 0],
    ["Bienes asegurados", kpis.total_bienes || 0],
    ["Suma asegurada", money.format(kpis.total_suma_asegurada || 0)],
    ["Total pagado", money.format(kpis.total_primas || 0)],
    ["Motos", kpis.total_motos || 0],
    ["Camionetas", kpis.total_camionetas || 0],
    ["Por vencer", kpis.por_vencer || 0]
  ];
  $("kpiGrid").innerHTML = items.map(([label, value]) => `<div class="kpi"><strong>${value}</strong><span>${label}</span></div>`).join("");
}

function renderAssistance(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("assistanceList").innerHTML = visible.map(r => `<div class="assist-item">
      <strong>${safe(r.proveedor)} · ${safe(r.servicio)}</strong>
      <span class="phone-num">${safe(r.telefono_principal)}</span>
      <small>${safe(r.descripcion)}</small>
      <small><b>Horario:</b> ${safe(r.horario)} ${clean(r.telefono_secundario) ? ` · <b>Alterno:</b> ${esc(r.telefono_secundario)}` : ""}</small>
    </div>`).join("") || emptyCardState("Asistencia pendiente de sincronización", "Carga la hoja 04_Asistencia en la matriz de OneDrive y ejecuta el workflow.");
}

function renderCoverages(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .map(r => ({
      tipo_cobertura: clean(r.tipo_cobertura) || "Cobertura",
      nombre_cobertura: clean(r.nombre_cobertura) || "Cobertura registrada",
      descripcion: clean(r.descripcion) || "Aplicable según condiciones particulares de la póliza.",
      limite_usd: clean(r.limite_usd),
      deducible: clean(r.deducible),
      aplica_a: clean(r.aplica_a) || "Según póliza"
    }));

  if (!visible.length) {
    $("coverageSummary").innerHTML = emptyCardState("Coberturas pendientes de sincronización", "La sección se llenará únicamente con los datos de la hoja 03_Coberturas del Excel maestro.");
    $("coverageAccordion").innerHTML = "";
    return;
  }

  $("coverageSummary").innerHTML = visible.slice(0, 8).map(r => `
    <article class="coverage-card">
      <span class="coverage-icon">${coverageIcon(r.nombre_cobertura + " " + r.tipo_cobertura)}</span>
      <h3>${esc(r.tipo_cobertura)}</h3>
      <p>${esc(r.nombre_cobertura)}</p>
    </article>
  `).join("");

  $("coverageAccordion").innerHTML = visible.map((r, index) => {
    const limit = clean(r.limite_usd) ? `<span><b>Límite:</b> ${money.format(+r.limite_usd || 0)}</span>` : "";
    const deductible = clean(r.deducible) ? `<span><b>Deducible:</b> ${esc(r.deducible)}</span>` : "";
    return `<details class="accordion-item" ${index === 0 ? "open" : ""}>
      <summary>
        <span class="accordion-icon">${coverageIcon(r.nombre_cobertura + " " + r.tipo_cobertura)}</span>
        <span>
          <b>${esc(r.nombre_cobertura)}</b>
          <small>${esc(r.tipo_cobertura)} · ${esc(r.aplica_a)}</small>
        </span>
      </summary>
      <div class="accordion-body">
        <p>${esc(r.descripcion)}</p>
        <div class="coverage-meta">
          ${limit}
          ${deductible}
          <span><b>Nota:</b> Aplicación sujeta a condiciones particulares, exclusiones, deducibles y documentación de respaldo.</span>
        </div>
      </div>
    </details>`;
  }).join("");
}

function renderSteps(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("stepsGrid").innerHTML = visible.map(r => {
    const no = safe(r.tipo).toUpperCase() === "NO_HACER";
    const order = Number(r.orden) || 0;
    return `<details class="step step-detail ${no ? "step-no" : "step-ok"}">
      <summary class="step-summary">
        <div class="step-icon-wrap" aria-hidden="true">${coverageIcon(r.titulo + " " + r.descripcion)}</div>
        <div class="step-title-wrap">
          <span class="step-number">PASO ${order.toString().padStart(2, "0")}</span>
          <h3>${safe(r.titulo)}</h3>
        </div>
        <span class="step-kind ${no ? "no" : "ok"}">${no ? "No hacer" : "Hacer"}</span>
      </summary>
      <div class="step-body"><p>${safe(r.descripcion)}</p></div>
    </details>`;
  }).join("") || emptyCardState("Procedimiento pendiente de sincronización", "Carga la hoja 05_Procedimiento_Siniestro en la matriz.");
}

function populateFilters(data) {
  const statusOptions = ["vigente","por-vencer","vencida","sin-fecha"];
  $("policyStatus").innerHTML = `<option value="">Todos los estados</option>` + statusOptions.map(s => `<option value="${s}">${s.replace("-", " ")}</option>`).join("");

  const categories = [...new Set(getRows("bienes").map(v => clean(v.categoria)).filter(Boolean))].sort();
  $("categoryFilter").innerHTML = `<option value="">Todas las categorías</option>` + categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
}

function renderPolicies() {
  if (!STORE) return;
  const q = clean($("policySearch").value).toLowerCase();
  const status = $("policyStatus").value;
  const allRows = getRows("polizas").filter(p => safe(p.mostrar_web).toUpperCase() !== "NO");

  if (!allRows.length) {
    $("policyTable").innerHTML = emptyTableRow("Pólizas pendientes de sincronización", "Ejecuta el workflow para cargar la matriz desde OneDrive.", 5);
    return;
  }

  const rows = allRows.filter(p => {
    const st = statusFor(p.vig_hasta);
    const text = [p.id_poliza,p.poliza_numero,p.aseguradora,p.reserva_proyecto,p.pdf_nombre].map(lower).join(" ");
    return (!q || text.includes(q)) && (!status || st.key === status);
  });

  if (!rows.length) {
    $("policyTable").innerHTML = emptyTableRow("No hay resultados con esos criterios", "Limpia la búsqueda o cambia el estado seleccionado.", 5);
    return;
  }

  $("policyTable").innerHTML = rows.map(p => {
    const st = statusFor(p.vig_hasta);
    return `<tr>
      <td><b>${safe(p.id_poliza)}</b><br><small>${safe(p.poliza_numero)} · ${safe(p.documento)}</small></td>
      <td>${formatDate(p.vig_desde)}<br><b>${formatDate(p.vig_hasta)}</b></td>
      <td>${money.format(+p.suma_asegurada_poliza || 0)}</td>
      <td><span class="status ${st.key}">${st.label}</span></td>
      <td>
        <details class="mini-details">
          <summary>Ver detalle</summary>
          <div>
            <b>Aseguradora:</b> ${safe(p.aseguradora)}<br>
            <b>Reserva / proyecto:</b> ${safe(p.reserva_proyecto)}<br>
            <b>Total pagado:</b> ${money.format(+p.total_pagado || 0)}<br>
            <b>Archivo:</b> ${safe(p.pdf_nombre)}
          </div>
        </details>
      </td>
    </tr>`;
  }).join("");
}

function renderVehicles() {
  if (!STORE) return;
  const q = clean($("vehicleSearch").value).toLowerCase();
  const cat = $("categoryFilter").value;
  const allRows = getRows("bienes").filter(v => safe(v.mostrar_web).toUpperCase() !== "NO");

  if (!allRows.length) {
    $("vehicleCards").innerHTML = emptyCardState("Bienes pendientes de sincronización", "Ejecuta el workflow para cargar la matriz desde OneDrive.");
    return;
  }

  const rows = allRows.filter(v => {
    const text = [v.placa,v.marca,v.modelo,v.reserva_proyecto,v.id_poliza,v.categoria].map(lower).join(" ");
    return (!q || text.includes(q)) && (!cat || v.categoria === cat);
  });

  if (!rows.length) {
    $("vehicleCards").innerHTML = emptyCardState("No hay resultados con esos criterios", "Limpia la búsqueda o cambia la categoría seleccionada.");
    return;
  }

  $("vehicleCards").innerHTML = rows.map(v => `<details class="vcard vehicle-detail-card">
    <summary>
      <span class="tag">${iconFor(v.categoria)} ${safe(v.categoria)}</span>
      <h3>${safe(v.marca)} ${safe(v.modelo)}</h3>
      <p><b>Placa:</b> ${safe(v.placa)} · <b>Año:</b> ${safe(v.anio)} · <b>Valor:</b> ${money.format(+v.total_asegurado || 0)}</p>
    </summary>
    <div class="detail-grid">
      <div class="detail"><b>Póliza</b><span>${safe(v.id_poliza)}</span></div>
      <div class="detail"><b>Valor asegurado</b><span>${money.format(+v.total_asegurado || 0)}</span></div>
      <div class="detail"><b>Reserva / Proyecto</b><span>${safe(v.reserva_proyecto)}</span></div>
      <div class="detail"><b>Deducible</b><span>${safe(v.deducible)}</span></div>
      <div class="detail"><b>Color</b><span>${safe(v.color)}</span></div>
      <div class="detail"><b>Custodio / ubicación</b><span>${safe(v.responsable_custodio)} · ${safe(v.ubicacion)}</span></div>
    </div>
  </details>`).join("");
}

function renderDocuments(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("docList").innerHTML = visible.map(r => `<details class="accordion-item compact-accordion-item">
    <summary>
      <span class="accordion-icon">📋</span>
      <span><b>${safe(r.documento)}</b><small>${safe(r.aplica_a)}</small></span>
    </summary>
    <div class="accordion-body"><p>${safe(r.descripcion)}</p></div>
  </details>`).join("") || emptyCardState("Documentos pendientes de sincronización", "Carga la hoja 06_Documentos_Requeridos en la matriz.");
}

function renderFAQ(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("faqList").innerHTML = visible.map(r => `<details class="accordion-item compact-accordion-item">
    <summary>
      <span class="accordion-icon">❓</span>
      <span><b>${safe(r.pregunta)}</b><small>${safe(r.categoria || "Consulta general")}</small></span>
    </summary>
    <div class="accordion-body"><p>${safe(r.respuesta)}</p></div>
  </details>`).join("") || emptyCardState("Preguntas frecuentes pendientes de sincronización", "Carga la hoja 07_FAQ en la matriz.");
}

function setHeroVideo(rows = []) {
  const heroVideo = $("heroVideo");
  const heroSource = $("heroVideoSource");
  if (!heroVideo || !heroSource) return;

  const siniestroVideo = (rows || []).find(v => {
    const text = `${clean(v.titulo)} ${clean(v.descripcion)} ${clean(v.categoria)}`.toLowerCase();
    return text.includes("siniestro") || text.includes("asistencia");
  });

  const src = clean(siniestroVideo?.archivo_repo);
  const poster = clean(siniestroVideo?.miniatura_repo);

  if (src) {
    heroSource.setAttribute("src", src);
    heroVideo.load();
  }
  if (poster) heroVideo.setAttribute("poster", poster);

  const tryPlay = heroVideo.play();
  if (tryPlay && typeof tryPlay.catch === "function") tryPlay.catch(() => {});
}

function renderVideos(rows = []) {
  const visible = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("videoGrid").classList.add("phone-video-grid");
  $("videoGrid").innerHTML = visible.map((r, index) => {
    const videoSrc = clean(r.archivo_repo);
    const poster = clean(r.miniatura_repo);
    const posterAttr = poster ? ` poster="${esc(poster)}"` : "";
    const media = videoSrc
      ? `<video class="phone-video" controls playsinline preload="metadata"${posterAttr} aria-label="${esc(r.titulo)}">
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
          <div class="phone-screen-video">${media}</div>
        </div>
      </div>
      <div class="video-caption">
        <span class="video-pill">${index + 1 < 10 ? `0${index + 1}` : index + 1} · ${safe(r.categoria || "Video informativo")}</span>
        <h3>${safe(r.titulo)}</h3>
        <p>${safe(r.descripcion)}</p>
      </div>
    </article>`;
  }).join("") || emptyCardState("Videos pendientes de sincronización", "Carga los archivos MP4 en assets/videos/ y registra sus rutas en la hoja 08_Videos.");
}

async function init() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    STORE = await res.json();

    setConfig(STORE);
    renderKPIs(STORE.kpis || {});
    renderAssistance(getRows("asistencia"));
    renderCoverages(getRows("coberturas"));
    renderSteps(getRows("procedimiento_siniestro"));
    populateFilters(STORE);
    renderPolicies();
    renderVehicles();
    setHeroVideo(getRows("videos"));
    renderVideos(getRows("videos"));
    renderDocuments(getRows("documentos_requeridos"));
    renderFAQ(getRows("faq"));
  } catch (err) {
    console.error(err);
    $("syncMeta").innerHTML = document.getElementById("errorTemplate").innerHTML;
  }
}

["policySearch","policyStatus","vehicleSearch","categoryFilter"].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener(id.includes("policy") ? (id === "policySearch" ? "input" : "change") : (id === "vehicleSearch" ? "input" : "change"), id.includes("policy") ? renderPolicies : renderVehicles);
});

$("menuButton").addEventListener("click", () => $("navLinks").classList.toggle("open"));
init();
