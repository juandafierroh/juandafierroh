/**
 * Demo: Centro de agentes
 * ------------------------------------------------------------------
 * Consume GrowthPlatformAPI.getAgentStatus() y getConversations(channel)
 * y renderiza la grilla de estado por canal, un filtro de conversaciones
 * con transcripción expandible (patrón acordeón) y un cálculo de
 * conversión combinada del día. Incluye estado de carga simulada y
 * estado de error con reintento, igual que growth-dashboard-demo.js.
 */
(function () {
  "use strict";

  const CHANNEL_ICON = {
    "Teléfono": "icon-phone",
    "WhatsApp": "icon-chat",
    "Web": "icon-layers",
    "QR": "icon-qr",
  };

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("agent-loading"),
    content: document.getElementById("agent-content"),
    error: document.getElementById("agent-error"),
    retry: document.getElementById("agent-retry"),
    agentGrid: document.getElementById("agent-grid"),
    blendedRate: document.getElementById("agent-blended-rate"),
    blendedDetail: document.getElementById("agent-blended-detail"),
    filterGroup: document.getElementById("conv-filter-group"),
    convList: document.getElementById("conv-list"),
    convEmpty: document.getElementById("conv-empty"),
  };

  function statusBadgeClass(status) {
    if (status === "convertida") return "rt-badge--available";
    if (status === "no resuelta") return "rt-badge--error";
    return "rt-badge--neutral"; // "no convertida"
  }

  function confidenceBadgeClass(level) {
    if (level === "alta") return "rt-badge--ai";
    if (level === "media") return "rt-badge--soon";
    return "rt-badge--error"; // "baja"
  }

  /* ============ Grilla de estado por canal ============ */
  function renderAgentGrid(statusList) {
    els.agentGrid.innerHTML = "";
    statusList.forEach((s) => {
      const card = document.createElement("div");
      card.className = "rt-card rt-agent-status-card";
      const icon = CHANNEL_ICON[s.channel] || "icon-sparkles";
      card.innerHTML = `
        <span class="rt-agent-status-dot" aria-hidden="true"></span>
        <div>
          <p style="margin:0; font-weight:700; display:flex; align-items:center; gap:0.4rem;">
            <svg width="16" height="16" style="color:var(--color-muted);"><use href="#${icon}"></use></svg>
            ${s.channel}
          </p>
          <p class="rt-muted" style="margin:0.15rem 0 0; font-size:0.8rem;">Activos ahora: <strong style="color:var(--color-text);">${s.activeNow}</strong></p>
          <p class="rt-muted" style="margin:0.1rem 0 0; font-size:0.8rem;">Hoy: <strong style="color:var(--color-text);">${s.todayCount}</strong> · Conversión <strong style="color:var(--color-text);">${s.conversionRate}%</strong></p>
        </div>`;
      els.agentGrid.append(card);
    });
  }

  function renderBlendedRate(statusList) {
    const totalToday = statusList.reduce((acc, s) => acc + s.todayCount, 0);
    const weighted = statusList.reduce((acc, s) => acc + s.todayCount * s.conversionRate, 0);
    const blended = totalToday ? Math.round(weighted / totalToday) : 0;
    els.blendedRate.textContent = blended + "%";
    els.blendedDetail.textContent = `Calculado sobre ${totalToday.toLocaleString("es-CL")} conversaciones atendidas hoy en los ${statusList.length} canales.`;
  }

  /* ============ Lista de conversaciones (acordeón) ============ */
  function renderConversations(list) {
    els.convList.innerHTML = "";
    els.convEmpty.hidden = list.length > 0;

    list.forEach((c) => {
      const item = document.createElement("div");
      item.className = "rt-accordion__item";
      const panelId = "conv-panel-" + c.id;
      const triggerId = "conv-trigger-" + c.id;
      const icon = CHANNEL_ICON[c.channel] || "icon-sparkles";

      const transcriptHtml = c.transcript
        .map((msg) => {
          const cls = msg.from === "cliente" ? "rt-chat__msg--user" : "rt-chat__msg--bot";
          return `<div class="rt-chat__msg ${cls}">${msg.text}</div>`;
        })
        .join("");

      item.innerHTML = `
        <button type="button" class="rt-accordion__trigger" id="${triggerId}" aria-expanded="false" aria-controls="${panelId}" data-rt-accordion-trigger>
          <span style="display:flex; align-items:center; gap:0.65rem; text-align:left; min-width:0;">
            <svg width="18" height="18" style="color:var(--color-muted); flex-shrink:0;"><use href="#${icon}"></use></svg>
            <span style="min-width:0;">
              <span style="display:block; font-weight:700; font-size:0.95rem;">${c.customer}</span>
              <span class="rt-muted" style="font-size:0.78rem;">${c.channel} · ${window.RTFormat.dateTime(c.time)}</span>
            </span>
          </span>
          <span style="display:flex; align-items:center; gap:0.6rem; flex-shrink:0;">
            <span class="rt-badge ${statusBadgeClass(c.status)}">${c.status}</span>
            <svg width="18" height="18" class="rt-accordion__icon"><use href="#icon-plus"></use></svg>
          </span>
        </button>
        <div class="rt-accordion__panel" id="${panelId}" data-rt-accordion-panel data-open="false">
          <div class="rt-accordion__panel-inner">
            <p style="margin:0 0 1rem;"><strong>Resultado:</strong> ${c.outcome}</p>
            <div class="rt-chat">${transcriptHtml}</div>
            <div class="rt-rec-card" style="margin-top:1.1rem;">
              <div class="rt-rec-card__icon"><svg width="20" height="20"><use href="#icon-sparkles"></use></svg></div>
              <div>
                <p class="rt-rec-card__title" style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                  Resumen de la IA
                  <span class="rt-badge ${confidenceBadgeClass(c.confidence)}">confianza ${c.confidence}</span>
                </p>
                <p class="rt-rec-card__detail">${c.summary}</p>
              </div>
            </div>
          </div>
        </div>`;
      els.convList.append(item);
    });
  }

  /* ============ Acordeón: alternar sin depender de components.js ============
     components.js enlaza [data-rt-accordion-trigger] solo una vez, en
     DOMContentLoaded. Como las conversaciones se agregan de forma
     asíncrona (después de resolver la promesa de la API), delegamos el
     evento en el contenedor estable #conv-list. */
  function initAccordionDelegation() {
    els.convList.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-rt-accordion-trigger]");
      if (!trigger) return;
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      panel.dataset.open = String(!expanded);
    });
  }

  /* ============ Filtro de canal ============ */
  function loadConversations(channel) {
    if (!window.GrowthPlatformAPI) return;
    window.GrowthPlatformAPI.getConversations(channel).then(renderConversations);
  }

  function initFilterButtons() {
    const buttons = Array.from(els.filterGroup.querySelectorAll("button"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.setAttribute("aria-pressed", "false");
          b.classList.remove("rt-btn--dark");
          b.classList.add("rt-btn--outline");
        });
        btn.setAttribute("aria-pressed", "true");
        btn.classList.remove("rt-btn--outline");
        btn.classList.add("rt-btn--dark");
        loadConversations(btn.dataset.channel);
      });
    });
  }

  /* ============ Carga inicial ============ */
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

    Promise.all([window.GrowthPlatformAPI.getAgentStatus(), window.GrowthPlatformAPI.getConversations("Todos")])
      .then(([agentStatus, conversations]) => {
        renderAgentGrid(agentStatus);
        renderBlendedRate(agentStatus);
        renderConversations(conversations);
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  initFilterButtons();
  initAccordionDelegation();
  document.addEventListener("DOMContentLoaded", load);
})();
