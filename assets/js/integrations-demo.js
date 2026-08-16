/**
 * Demo: Integraciones y sincronización
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getIntegrations() y renderiza una
 * grilla de conectores (POS, WPCafe, Mercado Pago, Bsale, KDS, etc.)
 * con su modo (nativa/parcial/puente), estado (conectado/sincronizando/
 * error) y última sincronización. Incluye estado de carga y error con
 * reintento para la página completa, además de un reintento puntual
 * por tarjeta para el conector con error (Print Bridge).
 *
 * Es la capa operativa: solo ejecuta lo que la IA de Recurra ya
 * convirtió. No es un panel de configuración de POS.
 */
(function () {
  "use strict";

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("int-loading"),
    content: document.getElementById("int-content"),
    error: document.getElementById("int-error"),
    retry: document.getElementById("int-retry"),
    grid: document.getElementById("integration-grid"),
    printQueue: document.getElementById("print-queue"),
  };

  const CATEGORY_ICON = {
    "Menú y mesas": "icon-table",
    "Pedidos": "icon-cash",
    "Pagos": "icon-card",
    "Facturación": "icon-receipt",
    "CRM y campañas": "icon-megaphone",
    "POS": "icon-store",
    "Cocina": "icon-chef",
    "Impresión": "icon-printer",
    "Desarrollo": "icon-plug",
  };

  const MODE_LABEL = { nativa: "Nativa", parcial: "Parcial", puente: "Puente" };
  const MODE_BADGE = { nativa: "rt-badge--available", parcial: "rt-badge--beta", puente: "rt-badge--integration" };

  const STATUS_LABEL = { conectado: "Conectado", sincronizando: "Sincronizando", error: "Con error" };
  const STATUS_BADGE = {
    conectado: "rt-badge--available",
    sincronizando: "rt-badge--soon rt-badge--pulse",
    error: "rt-badge--error",
  };

  // Trabajos de ejemplo para la "Cola de impresión" — puramente ilustrativos,
  // no provienen de GP_DATA ni representan actividad real.
  const PRINT_QUEUE_SAMPLE = [
    { order: "PED-3309", destination: "Impresora cocina", status: "Impreso", icon: "icon-check", tone: "success" },
    { order: "PED-3311", destination: "Impresora barra", status: "En cola", icon: "icon-clock", tone: "muted" },
    { order: "PED-3308", destination: "Impresora cocina", status: "Error de impresión", icon: "icon-alert", tone: "danger" },
  ];

  function categoryIcon(category) {
    return CATEGORY_ICON[category] || "icon-star";
  }

  function cardMarkup(item) {
    const statusBadge = STATUS_BADGE[item.status] || "rt-badge--neutral";
    const statusLabel = STATUS_LABEL[item.status] || item.status;
    const modeBadge = MODE_BADGE[item.mode] || "rt-badge--neutral";
    const modeLabel = MODE_LABEL[item.mode] || item.mode;
    const retryBtn =
      item.status === "error"
        ? `<div class="rt-integration-card__actions">
             <button class="rt-btn rt-btn--sm rt-btn--outline" type="button" data-retry-id="${item.id}">
               <svg width="16" height="16" aria-hidden="true"><use href="#icon-refresh"></use></svg>
               Reintentar sincronización
             </button>
           </div>`
        : "";
    return `
      <div class="rt-card rt-integration-card" id="integration-${item.id}">
        <div class="rt-integration-card__head">
          <div style="display:flex; gap:0.7rem; align-items:flex-start;">
            <div class="rt-card__icon" style="margin-bottom:0; width:38px; height:38px;">
              <svg width="20" height="20"><use href="#${categoryIcon(item.category)}"></use></svg>
            </div>
            <div>
              <h3 style="margin:0; font-size:1rem;">${item.name}</h3>
              <span class="rt-muted" style="font-size:0.8rem;">${item.category}</span>
            </div>
          </div>
          <span class="rt-badge ${statusBadge}" data-status-badge>${statusLabel}</span>
        </div>
        <div class="rt-integration-card__meta">
          <span>Modo: <span class="rt-badge ${modeBadge}" style="margin-left:0.2rem;">${modeLabel}</span></span>
          <span>Última sincronización: <strong data-last-sync>${window.RTFormat.dateTime(item.lastSync)}</strong></span>
        </div>
        ${retryBtn}
      </div>`;
  }

  function renderGrid(list) {
    els.grid.innerHTML = list.map(cardMarkup).join("");
    els.grid.querySelectorAll("[data-retry-id]").forEach((btn) => {
      btn.addEventListener("click", () => handleRetry(btn));
    });
  }

  function handleRetry(btn) {
    const card = btn.closest(".rt-integration-card");
    if (!card) return;
    btn.disabled = true;
    btn.innerHTML = `<svg width="16" height="16" class="rt-spin" aria-hidden="true"><use href="#icon-refresh"></use></svg> Reintentando…`;

    setTimeout(() => {
      const badge = card.querySelector("[data-status-badge]");
      const lastSync = card.querySelector("[data-last-sync]");
      if (badge) {
        badge.className = "rt-badge " + STATUS_BADGE.conectado;
        badge.textContent = STATUS_LABEL.conectado;
      }
      if (lastSync) lastSync.textContent = window.RTFormat.dateTime(new Date().toISOString());
      const actions = card.querySelector(".rt-integration-card__actions");
      if (actions) actions.remove();
      if (window.RTToast) window.RTToast.show("Print Bridge se reconectó correctamente.", "success");
    }, 1000);
  }

  function renderPrintQueue() {
    els.printQueue.innerHTML = PRINT_QUEUE_SAMPLE.map(
      (job) => `
        <div class="rt-printqueue__job">
          <span><strong>${job.order}</strong> · ${job.destination}</span>
          <span style="display:flex; align-items:center; gap:0.4rem; color:var(--color-${job.tone === "muted" ? "muted" : job.tone === "success" ? "success-dark" : "danger"});">
            <svg width="16" height="16" aria-hidden="true"><use href="#${job.icon}"></use></svg>
            ${job.status}
          </span>
        </div>`
    ).join("");
  }

  function showError() {
    els.loading.hidden = true;
    els.content.hidden = true;
    els.error.hidden = false;
  }

  function load() {
    els.loading.hidden = false;
    els.content.hidden = true;
    els.error.hidden = true;
    els.notice.textContent = "Cargando datos demostrativos…";

    if (!window.GrowthPlatformAPI) {
      showError();
      return;
    }

    window.GrowthPlatformAPI.getIntegrations()
      .then((list) => {
        renderGrid(list);
        renderPrintQueue();
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
