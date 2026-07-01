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


const DAMAGE_COVERAGE_BASE = [
  {
    tipo_cobertura: "Daños propios",
    nombre_cobertura: "Choque, volcadura, incendio, rayo, explosión y rotura de vidrios",
    descripcion: "Daños materiales del vehículo asegurado ocasionados por accidentes o eventos cubiertos, según las condiciones particulares de cada póliza.",
    aplica_a: "Vehículos y motos",
    deducible: "Según póliza",
    mostrar_web: "SI"
  },
  {
    tipo_cobertura: "Robo / hurto",
    nombre_cobertura: "Pérdida total o parcial por robo o hurto",
    descripcion: "Ampara la desaparición física del vehículo o partes aseguradas, conforme requisitos de denuncia, notificación y documentación.",
    aplica_a: "Vehículos y motos",
    deducible: "Según póliza",
    mostrar_web: "SI"
  },
  {
    tipo_cobertura: "Fenómenos naturales",
    nombre_cobertura: "Inundación, terremoto, erupción, deslizamiento, caída de rocas y otros eventos naturales",
    descripcion: "Cubre daños derivados de fenómenos de la naturaleza cuando consten dentro de las condiciones de la póliza.",
    aplica_a: "Vehículos y motos",
    deducible: "Según póliza",
    mostrar_web: "SI"
  },
  {
    tipo_cobertura: "Impactos y eventos externos",
    nombre_cobertura: "Impacto con objetos sólidos, caída de árboles, edificios, aeronaves o partes de ellos",
    descripcion: "Protección frente a impactos accidentales y caídas de objetos que afecten al bien asegurado.",
    aplica_a: "Vehículos y motos",
    deducible: "Según póliza",
    mostrar_web: "SI"
  },
  {
    tipo_cobertura: "Orden público / tránsito",
    nombre_cobertura: "Motín, huelga, conmoción civil, daños maliciosos, paso de puentes y gabarras",
    descripcion: "Eventos especiales descritos en las condiciones de la póliza y sujetos a exclusiones o requisitos de respaldo.",
    aplica_a: "Vehículos y motos",
    deducible: "Según póliza",
    mostrar_web: "SI"
  },
  {
    tipo_cobertura: "Amparos adicionales",
    nombre_cobertura: "Responsabilidad civil, accidentes personales, gastos médicos y asistencia vial",
    descripcion: "Coberturas complementarias sujetas a límites por póliza, tipo de vehículo, ocupantes y canales oficiales de asistencia.",
    aplica_a: "Según póliza",
    deducible: "Según póliza",
    mostrar_web: "SI"
  }
];

const coverageIcon = (text = "") => {
  const t = clean(text).toLowerCase();
  if (t.includes("robo") || t.includes("hurto")) return "🔐";
  if (t.includes("natural") || t.includes("terremoto") || t.includes("inund")) return "🌧️";
  if (t.includes("responsabilidad")) return "🤝";
  if (t.includes("asistencia") || t.includes("grúa") || t.includes("wincha")) return "🛠️";
  if (t.includes("accidente") || t.includes("médico")) return "🧑‍⚕️";
  if (t.includes("impacto") || t.includes("caída")) return "🌳";
  return "🚗";
};



const stepIconSvg = (name = "", type = "") => {
  const key = clean(name).toLowerCase();
  const isNo = clean(type).toUpperCase() === "NO_HACER";
  const stroke = isNo ? "#b42318" : "#078750";
  const fill = isNo ? "#fef2f2" : "#e6f7ed";
  const icons = {
    shield: `<svg viewBox="0 0 64 64" role="img" aria-label="Seguridad"><path d="M32 6 52 14v16c0 13.5-8 23.5-20 28C20 53.5 12 43.5 12 30V14L32 6Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/><path d="M24 32l5.5 5.5L42 23" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    phone: `<svg viewBox="0 0 64 64" role="img" aria-label="Llamar"><path d="M23 13c-2 0-7 6-7 9 0 20 16 36 36 36 3 0 9-5 9-7l-3-11c-.6-2-2.7-3-4.6-2.3l-7.2 2.8c-4.8-2.4-9-6.6-11.4-11.4l2.8-7.2C37.3 20 36.3 18 34.3 17.4L23 13Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M43 12c5 1.4 8.6 5 10 10M41 22c2.1.6 3.5 2 4 4" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/></svg>`,
    camera: `<svg viewBox="0 0 64 64" role="img" aria-label="Evidencia fotográfica"><path d="M14 22h10l4-6h8l4 6h10a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/><circle cx="32" cy="38" r="10" fill="none" stroke="${stroke}" stroke-width="4"/><path d="M47 30h.1" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/></svg>`,
    ban: `<svg viewBox="0 0 64 64" role="img" aria-label="No pactar"><circle cx="32" cy="32" r="23" fill="${fill}" stroke="${stroke}" stroke-width="4"/><path d="M17 47 47 17" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/><path d="M23 34c4-5 9-5 14 0 4 4 8 3 11-1" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    alert: `<svg viewBox="0 0 64 64" role="img" aria-label="Alerta"><path d="M32 8 58 54H6L32 8Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M32 24v14" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="46" r="3" fill="${stroke}"/></svg>`,
    file: `<svg viewBox="0 0 64 64" role="img" aria-label="Comunicar y documentar"><path d="M18 8h20l12 12v34a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M38 8v14h12" fill="none" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/><path d="M23 34h18M23 43h18M23 25h8" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/></svg>`,
    check: `<svg viewBox="0 0 64 64" role="img" aria-label="Paso"><circle cx="32" cy="32" r="24" fill="${fill}" stroke="${stroke}" stroke-width="4"/><path d="M21 33l7 7 16-18" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };
  return icons[key] || icons.check;
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

function finalUserText(value, fallback) {
  const text = clean(value) || fallback;
  return text
    .replace(/Información dinámica de pólizas, bienes asegurados, asistencia y pasos de atención ante siniestros\.?/gi, "Consulta de pólizas vigentes, bienes asegurados, asistencia y pasos de atención ante siniestros.")
    .replace(/Información dinámica de pólizas y bienes asegurados\.?/gi, "Consulta de pólizas vigentes y bienes asegurados.")
    .replace(/dinámica/gi, "")
    .replace(/OneDrive\s*\/?\s*SharePoint\s*\+\s*GitHub Actions/gi, "")
    .replace(/OneDrive/gi, "")
    .replace(/SharePoint/gi, "")
    .replace(/GitHub Actions/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatPublicDate(value) {
  const raw = clean(value);
  if (!raw) return "";
  const datePart = raw.split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return raw;
  const [y,m,d] = datePart.split("-");
  return `${d}/${m}/${y}`;
}

function setConfig(data) {
  const config = data.config || {};
  $("heroTitle").textContent = finalUserText(config.titulo_principal, "Seguro Vehicular FIAS");
  $("heroSubtitle").textContent = finalUserText(config.subtitulo_principal, "Consulta de pólizas vigentes, bienes asegurados, asistencia y pasos de atención ante siniestros.");
  $("footerNote").textContent = finalUserText(config.nota_general, "La información publicada es de carácter informativo y debe contrastarse con la póliza vigente y sus condiciones particulares.");
  const meta = data.meta || {};
  const fecha = formatPublicDate(meta.ultima_actualizacion);
  $("syncMeta").innerHTML = fecha
    ? `🟢 Información actualizada al <b>${safe(fecha)}</b>`
    : `🟢 Información disponible para consulta institucional`;
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


function renderCoverages(rows = []) {
  const registeredRows = (rows || [])
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .map(r => ({
      tipo_cobertura: clean(r.tipo_cobertura) || "Cobertura",
      nombre_cobertura: clean(r.nombre_cobertura) || "Cobertura registrada",
      descripcion: clean(r.descripcion) || "Aplicable según condiciones particulares de la póliza.",
      limite_usd: clean(r.limite_usd),
      deducible: clean(r.deducible),
      aplica_a: clean(r.aplica_a) || "Según póliza"
    }));

  const baseRows = DAMAGE_COVERAGE_BASE;
  const summaryRows = baseRows.slice(0, 6);

  $("coverageSummary").innerHTML = summaryRows.map(r => `
    <article class="coverage-card">
      <span class="coverage-icon">${coverageIcon(r.nombre_cobertura + " " + r.tipo_cobertura)}</span>
      <h3>${esc(r.tipo_cobertura)}</h3>
      <p>${esc(r.nombre_cobertura)}</p>
    </article>
  `).join("");

  const combined = [
    ...baseRows.map(r => ({...r, fuente: "Daños principales"})),
    ...registeredRows.map(r => ({...r, fuente: "Cobertura registrada"}))
  ];

  $("coverageAccordion").innerHTML = combined.map((r, index) => {
    const limit = clean(r.limite_usd) ? `<span><b>Límite:</b> ${money.format(+r.limite_usd || 0)}</span>` : "";
    const deductible = clean(r.deducible) ? `<span><b>Deducible:</b> ${esc(r.deducible)}</span>` : "";
    return `<details class="accordion-item" ${index === 0 ? "open" : ""}>
      <summary>
        <span class="accordion-icon">${coverageIcon(r.nombre_cobertura + " " + r.tipo_cobertura)}</span>
        <span>
          <b>${esc(r.nombre_cobertura)}</b>
          <small>${esc(r.tipo_cobertura)} · ${esc(r.aplica_a || "Según póliza")}</small>
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
  }).join("") || emptyCardState("Ingresa coberturas", "Actualiza la hoja Coberturas del Excel maestro para visualizar los daños cubiertos.");
}

function renderSteps(rows = []) {
  const visibleRows = rows
    .filter(r => safe(r.mostrar_web).toUpperCase() !== "NO")
    .sort((a,b)=>(+a.orden||0)-(+b.orden||0));

  $("stepsGrid").innerHTML = visibleRows.map(r => {
      const no = safe(r.tipo).toUpperCase() === "NO_HACER";
      const order = Number(r.orden) || 0;
      return `<details class="step step-detail ${no ? "step-no" : "step-ok"}">
        <summary class="step-summary">
          <div class="step-icon-wrap" aria-hidden="true">${stepIconSvg(r.icono, r.tipo)}</div>
          <div class="step-title-wrap">
            <span class="step-number">PASO ${order.toString().padStart(2, "0")}</span>
            <h3>${safe(r.titulo)}</h3>
          </div>
          <span class="step-kind ${no ? "no" : "ok"}">${no ? "No hacer" : "Hacer"}</span>
        </summary>
        <div class="step-body">
          <p>${safe(r.descripcion)}</p>
        </div>
      </details>`;
    }).join("") || emptyCardState("Ingresa el procedimiento", "Actualiza la hoja Procedimiento_Siniestro del Excel maestro para visualizar los pasos con sus íconos.");
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
      "Actualiza la hoja de pólizas en el Excel maestro o ejecuta la sincronización para visualizar los registros.",
      5
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
      "Modifica la búsqueda, limpia los filtros o selecciona otro estado para consultar las pólizas disponibles.",
      5
    );
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
  const qRaw = clean($("vehicleSearch").value);
  const q = qRaw.toLowerCase();
  const cat = $("categoryFilter").value;
  const allRows = (STORE.bienes || []).filter(v => safe(v.mostrar_web).toUpperCase() !== "NO");

  if (!allRows.length) {
    $("vehicleCards").innerHTML = emptyCardState(
      "Ingresa datos para procesar la información",
      "Actualiza la hoja de bienes asegurados en el Excel maestro o ejecuta la sincronización para visualizar los vehículos."
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
  </details>`).join("") || emptyCardState("Ingresa documentos requeridos", "Actualiza la hoja Documentos_Requeridos del Excel maestro.");
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
  </details>`).join("") || emptyCardState("Ingresa preguntas frecuentes", "Actualiza la hoja FAQ del Excel maestro.");
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
    renderCoverages(STORE.coberturas);
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
if ($("btnExportCsv")) $("btnExportCsv").addEventListener("click", exportCsv);
$("menuButton").addEventListener("click", () => $("navLinks").classList.toggle("open"));
init();
