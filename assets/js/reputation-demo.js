/**
 * Demo: Centro de reputación
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getReputationCases(status) y
 * renderiza una grilla de casos (rating, sentimiento, canal, comentario,
 * respuesta sugerida por IA, compensación y estado), con filtros por
 * estado, un botón para simular la resolución de un caso abierto, y un
 * panel de "Problemas frecuentes". Incluye estado de carga simulada y
 * estado de error con reintento.
 *
 * Importante: esta demo no hace review gating — todos los casos,
 * positivos o negativos, siguen el mismo flujo de recolección de
 * feedback. La resolución de un caso aquí es una simulación puramente
 * local (sin persistencia más allá de esta carga de página).
 */
(function () {
  "use strict";

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("rep-loading"),
    content: document.getElementById("rep-content"),
    error: document.getElementById("rep-error"),
    retry: document.getElementById("rep-retry"),
    tabsList: document.getElementById("rep-tabs-list"),
    caseGrid: document.getElementById("case-grid"),
    caseEmpty: document.getElementById("case-empty"),
    trendList: document.getElementById("trend-list"),
    summary: document.getElementById("rep-summary"),
  };

  // Copia local de los casos ya cargados, para poder simular
  // resoluciones sin tener que volver a pedirlos a la API.
  let localCases = [];
  let currentStatus = "todos";

  const sentimentBadge = {
    positivo: "rt-badge--available",
    neutral: "rt-badge--neutral",
    negativo: "rt-badge--error",
  };
  const statusBadge = {
    abierto: "rt-badge--error",
    resuelto: "rt-badge--integration",
    cerrado: "rt-badge--neutral",
  };
  const statusLabel = {
    abierto: "Abierto",
    resuelto: "Resuelto",
    cerrado: "Cerrado",
  };

  function starIcons(rating) {
    const r = Math.max(0, Math.min(5, rating || 0));
    let html = "";
    for (let i = 0; i < 5; i++) {
      const filled = i < r;
      html += `<svg width="16" height="16" style="opacity:${filled ? "1" : "0.28"}"><use href="#icon-star"></use></svg>`;
    }
    return html;
  }

  function caseCard(item) {
    const card = document.createElement("article");
    card.className = "rt-card rt-case-card";
    card.dataset.caseId = item.id;

    const compensationHtml = item.compensation
      ? `<p style="margin:0; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;"><svg width="16" height="16" style="color:var(--color-accent); flex-shrink:0;"><use href="#icon-gift"></use></svg> ${item.compensation}</p>`
      : "";

    const resolutionHtml =
      item.resolutionTimeHours != null
        ? `<span class="rt-muted" style="font-size:0.78rem; display:inline-flex; align-items:center; gap:0.3rem;"><svg width="14" height="14"><use href="#icon-clock"></use></svg> Resuelto en ${item.resolutionTimeHours}h</span>`
        : "";

    const recoveredHtml = item.recovered
      ? `<span class="rt-badge rt-badge--available"><svg width="12" height="12" style="margin-right:0.1rem;"><use href="#icon-check"></use></svg>Cliente recuperado</span>`
      : "";

    const actionHtml =
      item.status === "abierto"
        ? `<button class="rt-btn rt-btn--dark rt-btn--sm rt-btn--block" type="button" data-resolve-btn data-case-id="${item.id}">Marcar como resuelto</button>`
        : "";

    card.innerHTML = `
      <div class="rt-case-card__head">
        <div>
          <p style="margin:0; font-weight:700;">${item.customer}</p>
          <p class="rt-muted" style="margin:0; font-size:0.78rem;">${window.RTFormat.date(item.date)} · ${item.channel}</p>
        </div>
        <span class="rt-badge ${statusBadge[item.status] || "rt-badge--neutral"}">${statusLabel[item.status] || item.status}</span>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">
        <div class="rt-case-card__rating" aria-label="Valoración ${item.rating} de 5 estrellas">${starIcons(item.rating)}</div>
        <span class="rt-badge ${sentimentBadge[item.sentiment] || "rt-badge--neutral"}">${item.sentiment}</span>
      </div>
      <p style="margin:0; font-weight:700; font-size:0.9rem;">${item.topic}</p>
      <p style="margin:0; font-size:0.9rem;">"${item.comment}"</p>
      <div class="rt-case-card__suggested">
        <strong>Respuesta sugerida por IA</strong>
        ${item.suggestedResponse}
      </div>
      ${compensationHtml}
      <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; flex-wrap:wrap;">
        ${resolutionHtml}
        ${recoveredHtml}
      </div>
      ${actionHtml}
    `;
    return card;
  }

  function renderCases(list) {
    els.caseGrid.innerHTML = "";
    els.caseEmpty.hidden = list.length > 0;
    list.forEach((item) => els.caseGrid.append(caseCard(item)));
  }

  function renderTrends(trends) {
    els.trendList.innerHTML = "";
    const max = Math.max(1, ...trends.map((t) => t.count));
    trends.forEach((t) => {
      const pct = Math.round((t.count / max) * 100);
      const row = document.createElement("div");
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:0.5rem; margin-bottom:0.3rem;">
          <span style="font-weight:700; font-size:0.9rem;">${t.label}</span>
          <span class="rt-muted" style="font-size:0.78rem;">${t.count} casos · ${t.area}</span>
        </div>
        <span class="rt-channel-bars__track" style="display:block;">
          <span class="rt-channel-bars__fill" style="width:${pct}%; background:var(--color-primary); display:block;"></span>
        </span>`;
      els.trendList.append(row);
    });
  }

  function renderSummary(allCases) {
    const total = allCases.length;
    const open = allCases.filter((c) => c.status === "abierto").length;
    const recovered = allCases.filter((c) => c.recovered).length;
    const avgRating = total ? (allCases.reduce((sum, c) => sum + (c.rating || 0), 0) / total).toFixed(1) : "—";

    els.summary.innerHTML = "";
    const rows = [
      ["Feedback recibido", total],
      ["Casos abiertos", open],
      ["Clientes recuperados", recovered],
      ["Valoración promedio", avgRating.toString().replace(".", ",")],
    ];
    rows.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; justify-content:space-between; align-items:center; font-size:0.9rem;";
      row.innerHTML = `<span class="rt-muted">${label}</span><strong>${value}</strong>`;
      els.summary.append(row);
    });
  }

  function applyFilter() {
    const list =
      currentStatus === "todos" ? localCases : localCases.filter((c) => c.status === currentStatus);
    renderCases(list);
  }

  function selectTab(status) {
    currentStatus = status;
    Array.from(els.tabsList.querySelectorAll("[data-status]")).forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.status === status));
    });
    applyFilter();
  }

  function handleResolveClick(e) {
    const btn = e.target.closest("[data-resolve-btn]");
    if (!btn) return;
    const caseId = btn.dataset.caseId;
    const item = localCases.find((c) => c.id === caseId);
    if (!item) return;

    btn.disabled = true;
    btn.textContent = "Actualizando…";

    setTimeout(() => {
      item.status = "resuelto";
      if (item.resolutionTimeHours == null) item.resolutionTimeHours = 1;
      applyFilter();
      renderSummary(localCases);
      if (window.RTToast) {
        window.RTToast.show(`Caso ${caseId} marcado como resuelto.`, "success");
      }
    }, 550);
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

    window.GrowthPlatformAPI.getReputationCases("todos")
      .then((data) => {
        localCases = data.cases.slice();
        currentStatus = "todos";
        selectTab("todos");
        renderTrends(data.trends);
        renderSummary(localCases);
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.tabsList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if (btn) selectTab(btn.dataset.status);
  });
  els.caseGrid.addEventListener("click", handleResolveClick);
  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
