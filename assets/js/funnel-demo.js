/**
 * Demo: Funnel de crecimiento
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getFunnel() y renderiza las 7 etapas
 * (oportunidad → conversación → pedido/reserva → pago → visita →
 * segunda visita → cliente frecuente) como barras horizontales
 * (.rt-funnel). Los 4 selectores (canal, campaña, sucursal, segmento)
 * aplican un efecto SIMULADO y determinístico sobre el mismo set de
 * datos: no hay una fuente de datos distinta por filtro, solo un
 * factor de reducción calculado a partir del texto de cada selección,
 * para que la demo se sienta interactiva sin inventar cifras nuevas
 * cada vez. Incluye estado de carga simulada y estado de error con
 * reintento.
 */
(function () {
  "use strict";

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("funnel-loading"),
    content: document.getElementById("funnel-content"),
    error: document.getElementById("funnel-error"),
    retry: document.getElementById("funnel-retry"),
    channel: document.getElementById("filter-channel"),
    campaign: document.getElementById("filter-campaign"),
    branch: document.getElementById("filter-branch"),
    segment: document.getElementById("filter-segment"),
    reset: document.getElementById("filter-reset"),
    note: document.getElementById("filter-note"),
    rows: document.getElementById("funnel-rows"),
  };

  let baseStages = [];

  // Hash determinístico de una cadena de texto (no criptográfico,
  // solo para derivar un factor de reducción estable por selección).
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  // Traduce el texto seleccionado en un factor entre ~0.4 y ~0.85.
  // "Todos"/"Todas" (siempre la primera opción de cada filtro) no
  // reduce nada: factor 1.
  function factorFor(value, isDefaultOption) {
    if (!value || isDefaultOption) return 1;
    const hash = hashString(value);
    const span = 0.85 - 0.4;
    return 0.4 + (hash % 1000) / 1000 * span;
  }

  function selectedFactor(select) {
    if (!select.options.length) return 1;
    const idx = select.selectedIndex;
    return factorFor(select.value, idx === 0);
  }

  function combinedFactor() {
    return (
      selectedFactor(els.channel) *
      selectedFactor(els.campaign) *
      selectedFactor(els.branch) *
      selectedFactor(els.segment)
    );
  }

  function isAnyFilterActive() {
    return (
      els.channel.selectedIndex > 0 ||
      els.campaign.selectedIndex > 0 ||
      els.branch.selectedIndex > 0 ||
      els.segment.selectedIndex > 0
    );
  }

  function populateSelect(select, options) {
    select.innerHTML = "";
    options.forEach((opt) => {
      const el = document.createElement("option");
      el.value = opt;
      el.textContent = opt;
      select.append(el);
    });
  }

  function renderFunnel(stages) {
    els.rows.innerHTML = "";
    // Evita división por cero: si por algún motivo la primera etapa
    // llegara en 0, usamos 1 como piso para el cálculo de proporciones.
    const firstValue = Math.max(1, stages[0] ? stages[0].value : 1);
    stages.forEach((stage) => {
      const pct = Math.max(2, Math.round((stage.value / firstValue) * 100));
      const row = document.createElement("div");
      row.className = "rt-funnel__row";
      row.innerHTML = `
        <span class="rt-funnel__label">${stage.label}</span>
        <span class="rt-funnel__track"><span class="rt-funnel__fill" style="width:${pct}%"></span></span>
        <span class="rt-funnel__value">${stage.value.toLocaleString("es-CL")}</span>`;
      els.rows.append(row);
    });
  }

  function applyFilters() {
    const factor = combinedFactor();
    const active = isAnyFilterActive();
    els.note.hidden = !active;

    if (!active) {
      renderFunnel(baseStages);
      return;
    }

    const adjusted = baseStages.map((stage) => ({
      key: stage.key,
      label: stage.label,
      value: Math.max(1, Math.round(stage.value * factor)),
    }));
    renderFunnel(adjusted);
  }

  function resetFilters() {
    [els.channel, els.campaign, els.branch, els.segment].forEach((sel) => {
      sel.selectedIndex = 0;
    });
    applyFilters();
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

    window.GrowthPlatformAPI.getFunnel()
      .then((data) => {
        baseStages = data.stages.slice();
        populateSelect(els.channel, data.filters.channels);
        populateSelect(els.campaign, data.filters.campaigns);
        populateSelect(els.branch, data.filters.branches);
        populateSelect(els.segment, data.filters.segments);
        renderFunnel(baseStages);
        els.note.hidden = true;
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  [els.channel, els.campaign, els.branch, els.segment].forEach((sel) => {
    sel.addEventListener("change", applyFilters);
  });
  els.reset.addEventListener("click", resetFilters);
  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
