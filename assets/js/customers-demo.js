/**
 * rt- Customers Demo (demo/customers.html)
 * ------------------------------------------------------------------
 * CRM ligero: lista de clientes filtrable por nombre/teléfono y por
 * estado de riesgo, con un panel de detalle que muestra el ciclo de
 * recompra, la acción de reactivación recomendada y, si corresponde,
 * el caso de feedback asociado.
 */

(function () {
  "use strict";

  const RISK_FILTERS = [
    { id: "todos", label: "Todos" },
    { id: "alto", label: "En riesgo" },
    { id: "vip", label: "VIP" },
    { id: "nuevo", label: "Nuevo" },
    { id: "bajo", label: "Al día" },
  ];

  const RISK_BADGE = {
    alto: { cls: "error", label: "En riesgo" },
    bajo: { cls: "available", label: "Al día" },
    nuevo: { cls: "integration", label: "Nuevo" },
    vip: { cls: "soon", label: "VIP" },
  };

  const FEEDBACK_STATUS = {
    "caso-abierto": { cls: "error", label: "Caso abierto" },
    seguimiento: { cls: "soon", label: "En seguimiento" },
    cerrado: { cls: "available", label: "Cerrado" },
  };

  let customers = [];
  let state = { search: "", riskFilter: "todos", selectedId: null };

  function channelLabel(id) {
    const ch = window.RT_DATA.channels.find((c) => c.id === id);
    return ch ? ch.label : id;
  }

  function riskBadge(risk) {
    return RISK_BADGE[risk] || { cls: "neutral", label: risk };
  }

  function getFilteredCustomers() {
    const q = state.search.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesRisk = state.riskFilter === "todos" || c.risk === state.riskFilter;
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
      return matchesRisk && matchesSearch;
    });
  }

  function renderRiskFilters() {
    const rail = document.getElementById("risk-filter");
    rail.innerHTML = RISK_FILTERS.map(
      (f) => `<button type="button" class="rt-category-pill" role="tab" aria-pressed="${f.id === state.riskFilter}" data-risk="${f.id}">${f.label}</button>`
    ).join("");
    rail.querySelectorAll("[data-risk]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.riskFilter = btn.dataset.risk;
        renderRiskFilters();
        renderList();
      });
    });
  }

  function customerRowHtml(c) {
    const badge = riskBadge(c.risk);
    const isActive = c.id === state.selectedId;
    return `<button type="button" class="rt-card rt-customer-row${isActive ? " is-active" : ""}" data-customer-id="${c.id}" style="width:100%;text-align:left;font:inherit;cursor:pointer;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
        <div>
          <div style="font-weight:800;font-size:1rem;"><span class="rt-risk-dot rt-risk-dot--${c.risk}"></span>${c.name}</div>
          <div style="color:var(--color-muted);font-size:0.85rem;margin-top:0.2rem;">${window.RTFormat.phone(c.phone)} · ${c.daysSinceVisit} días sin visitar</div>
        </div>
        <span class="rt-badge rt-badge--${badge.cls}">${badge.label}</span>
      </div>
      <div style="display:flex;gap:1.25rem;flex-wrap:wrap;margin-top:0.7rem;font-size:0.85rem;color:var(--color-muted);">
        <span>Ticket prom.: <strong style="color:var(--color-text);">${window.RTFormat.clp(c.avgTicket)}</strong></span>
        <span>Favorito: <strong style="color:var(--color-text);">${c.favoriteProduct}</strong></span>
      </div>
    </button>`;
  }

  function renderList() {
    const filtered = getFilteredCustomers();
    const listEl = document.getElementById("customer-list");
    document.getElementById("customer-count").textContent =
      filtered.length === 1 ? "1 cliente encontrado." : `${filtered.length} clientes encontrados.`;

    if (!filtered.length) {
      listEl.innerHTML = `<div class="rt-demo-empty">No se encontraron clientes con ese criterio.<br>Prueba con otro nombre, teléfono o filtro.</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(customerRowHtml).join("");
    listEl.querySelectorAll("[data-customer-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectCustomer(btn.dataset.customerId));
    });
  }

  function cycleBarHtml(c) {
    if (c.cycleMinDays == null || c.cycleMaxDays == null) {
      return `<p class="rt-field__hint">Cliente nuevo, aún sin ciclo definido.</p>`;
    }
    const pct = Math.max(4, Math.min(100, Math.round((c.daysSinceVisit / c.cycleMaxDays) * 100)));
    const fillClass = c.risk === "alto" ? "danger" : "ok";
    return `
      <div class="rt-cycle-bar"><div class="rt-cycle-bar__fill rt-cycle-bar__fill--${fillClass}" style="width:${pct}%;"></div></div>
      <p class="rt-field__hint">Han pasado ${c.daysSinceVisit} días. Su ciclo habitual es de ${c.cycleMinDays} a ${c.cycleMaxDays} días.</p>`;
  }

  function feedbackCaseHtml(c) {
    const fb = window.RT_DATA.feedbackCases.find((f) => f.customer === c.name);
    if (!fb) return "";
    const s = FEEDBACK_STATUS[fb.status] || { cls: "neutral", label: fb.status };
    return `
      <div class="rt-card" style="padding:1rem;margin-top:1.1rem;background:var(--color-surface-alt);box-shadow:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;margin-bottom:0.4rem;">
          <strong style="font-size:0.85rem;display:flex;align-items:center;gap:0.35rem;"><svg width="15" height="15" aria-hidden="true"><use href="#icon-alert"></use></svg>Caso de feedback</strong>
          <span class="rt-badge rt-badge--${s.cls}">${s.label}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--color-muted);margin:0;">"${fb.comment}" — pedido ${fb.orderId}</p>
      </div>`;
  }

  function renderPanel(id) {
    const c = customers.find((x) => x.id === id);
    const panel = document.getElementById("customer-panel");
    if (!c) {
      panel.innerHTML = `<div class="rt-demo-empty">Selecciona un cliente de la lista para ver su detalle.</div>`;
      return;
    }
    const vipStar =
      c.risk === "vip"
        ? '<svg width="18" height="18" aria-hidden="true" style="vertical-align:-3px;color:var(--color-accent);margin-right:0.3rem;"><use href="#icon-star"></use></svg>'
        : "";
    panel.innerHTML = `
      <h2 style="font-size:1.2rem;margin-bottom:0.2rem;">${vipStar}${c.name}</h2>
      <p style="color:var(--color-muted);font-size:0.9rem;margin-bottom:1rem;">${window.RTFormat.phone(c.phone)}</p>
      <div class="rt-stat-row" style="margin-bottom:1rem;">
        <div class="rt-stat"><div class="rt-stat__value">${c.visits}</div><div class="rt-stat__label">Visitas totales</div></div>
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.date(c.firstVisit)}</div><div class="rt-stat__label">Cliente desde</div></div>
      </div>
      ${cycleBarHtml(c)}
      <div style="display:grid;gap:0.6rem;margin:1.1rem 0;font-size:0.9rem;">
        <div style="display:flex;justify-content:space-between;gap:0.75rem;"><span>Ticket promedio</span><strong>${window.RTFormat.clp(c.avgTicket)}</strong></div>
        <div style="display:flex;justify-content:space-between;gap:0.75rem;"><span>Producto favorito</span><strong>${c.favoriteProduct}</strong></div>
        <div style="display:flex;justify-content:space-between;gap:0.75rem;"><span>Canal habitual</span><strong>${channelLabel(c.favoriteChannel)}</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;"><span>Consentimiento de marketing</span><span class="rt-badge rt-badge--${c.consent ? "available" : "neutral"}">${c.consent ? "Sí" : "No"}</span></div>
      </div>
      <p class="rt-field__hint" style="font-style:italic;">${c.notes}</p>
      <div class="rt-card" style="background:var(--color-state-soon-bg);color:var(--color-state-soon-fg);box-shadow:none;padding:1rem;margin:1.1rem 0;">
        <strong style="font-size:0.85rem;">Acción recomendada</strong>
        <p style="margin:0.3rem 0 0;font-size:0.9rem;">${c.recommendedAction}</p>
      </div>
      <button type="button" class="rt-btn rt-btn--primary rt-btn--block" id="reactivate-btn">
        <svg width="16" height="16" aria-hidden="true"><use href="#icon-refresh"></use></svg>
        Simular envío de reactivación
      </button>
      ${feedbackCaseHtml(c)}
    `;
    const btn = document.getElementById("reactivate-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        window.RTToast.show(`Mensaje de reactivación enviado a ${c.name} (simulado)`, "success");
      });
    }
  }

  function selectCustomer(id) {
    state.selectedId = id;
    renderList();
    renderPanel(id);
  }

  function init() {
    window.RestaurantAPI.getCustomers().then((data) => {
      customers = data;
      state.selectedId = customers.length ? customers[0].id : null;
      renderRiskFilters();
      renderList();
      renderPanel(state.selectedId);
    });

    document.getElementById("customer-search").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderList();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
