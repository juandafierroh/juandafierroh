/**
 * Demo: Cliente 360
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getCustomers() / getCustomerProfile()
 * y renderiza una lista de clientes (izquierda) + un panel de perfil
 * completo (derecha): datos de contacto, estadísticas, ciclo de
 * visitas, riesgo, productos favoritos, próxima mejor acción e
 * historial. Incluye estado de carga simulada y estado de error con
 * reintento.
 */
(function () {
  "use strict";

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("c360-loading"),
    content: document.getElementById("c360-content"),
    error: document.getElementById("c360-error"),
    retry: document.getElementById("c360-retry"),
    list: document.getElementById("customer-list"),
    name: document.getElementById("panel-name"),
    badges: document.getElementById("panel-badges"),
    cycleStatus: document.getElementById("panel-cycle-status"),
    channel: document.getElementById("panel-channel"),
    phone: document.getElementById("panel-phone"),
    email: document.getElementById("panel-email"),
    stats: document.getElementById("panel-stats"),
    cycleWrap: document.getElementById("panel-cycle-wrap"),
    cycleFill: document.getElementById("panel-cycle-fill"),
    cycleText: document.getElementById("panel-cycle-text"),
    nextVisit: document.getElementById("panel-next-visit"),
    products: document.getElementById("panel-products"),
    recDetail: document.getElementById("panel-rec-detail"),
    timeline: document.getElementById("panel-timeline"),
  };

  let customers = [];
  let activeId = null;

  /* ============ Utilidades de riesgo / ciclo ============ */

  // "caso abierto" → "caso-abierto" para calzar con los modificadores CSS.
  function riskClass(risk) {
    return String(risk || "").trim().replace(/\s+/g, "-");
  }

  function riskLabel(risk) {
    switch (risk) {
      case "alto": return "Riesgo alto";
      case "bajo": return "Sin riesgo";
      case "nuevo": return "Cliente nueva/o";
      case "caso abierto": return "Caso abierto";
      default: return risk || "—";
    }
  }

  function cycleInfo(customer) {
    if (customer.cycleMinDays == null || customer.cycleMaxDays == null) {
      return { hasCycle: false };
    }
    const { cycleMinDays, cycleMaxDays, lastVisitDaysAgo } = customer;
    let state = "ok";
    if (lastVisitDaysAgo > cycleMaxDays) state = "danger";
    else if (lastVisitDaysAgo >= cycleMinDays) state = "risk";
    const pct = Math.max(4, Math.min(100, Math.round((lastVisitDaysAgo / cycleMaxDays) * 100)));
    return { hasCycle: true, state, pct, cycleMinDays, cycleMaxDays, lastVisitDaysAgo };
  }

  /* ============ Lista de clientes ============ */

  function renderList() {
    els.list.innerHTML = "";
    customers.forEach((c) => {
      const row = document.createElement("div");
      row.className = "rt-customer-row" + (c.id === activeId ? " is-active" : "");
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(c.id === activeId));
      row.setAttribute("tabindex", c.id === activeId ? "0" : "-1");
      row.dataset.id = c.id;
      row.style.cssText = "display:flex; align-items:center; justify-content:space-between; gap:0.75rem; padding:0.9rem 1rem; border-bottom:1px solid var(--color-border); cursor:pointer; min-height:44px;";
      row.innerHTML = `
        <span style="display:flex; align-items:center; gap:0.55rem; min-width:0;">
          <span class="rt-risk-dot rt-risk-dot--${riskClass(c.risk)}" aria-hidden="true"></span>
          <span style="min-width:0;">
            <strong style="display:block; font-size:0.95rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.name}</strong>
            <span class="rt-muted" style="font-size:0.78rem;">${c.segment}</span>
          </span>
        </span>
        <span class="rt-muted" style="font-size:0.78rem; text-align:right; flex-shrink:0;">${riskLabel(c.risk)}</span>`;
      row.addEventListener("click", () => selectCustomer(c.id));
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectCustomer(c.id);
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const idx = customers.findIndex((x) => x.id === c.id);
          const nextIdx = e.key === "ArrowDown" ? Math.min(customers.length - 1, idx + 1) : Math.max(0, idx - 1);
          const nextId = customers[nextIdx].id;
          selectCustomer(nextId);
          const nextRow = els.list.querySelector(`[data-id="${nextId}"]`);
          if (nextRow) nextRow.focus();
        }
      });
      els.list.append(row);
    });
  }

  /* ============ Panel de perfil ============ */

  function renderPanel(customer) {
    els.name.textContent = customer.name;

    els.badges.innerHTML = `<span class="rt-badge rt-badge--neutral">${customer.segment}</span>` +
      (customer.consent
        ? `<span class="rt-badge rt-badge--available">Acepta marketing</span>`
        : `<span class="rt-badge rt-badge--error">Sin consentimiento</span>`);

    els.cycleStatus.className = "rt-cycle-status rt-cycle-status--" + riskClass(customer.risk);
    els.cycleStatus.textContent = riskLabel(customer.risk);

    els.channel.textContent = "Canal preferido: " + customer.channelPreferred;
    els.phone.innerHTML = `<svg width="14" height="14" style="vertical-align:-2px; margin-right:0.3rem;"><use href="#icon-phone"></use></svg>${window.RTFormat.phone(customer.phone)}`;
    els.email.innerHTML = `<svg width="14" height="14" style="vertical-align:-2px; margin-right:0.3rem;"><use href="#icon-mail"></use></svg>${customer.email}`;

    els.stats.innerHTML = "";
    [
      [customer.visits, "Visitas totales"],
      [window.RTFormat.clp(customer.avgTicket), "Ticket promedio"],
      [window.RTFormat.clp(customer.ltv), "Valor de vida (LTV)"],
      [customer.lastVisitDaysAgo + " días", "Desde la última visita"],
    ].forEach(([value, label]) => {
      const div = document.createElement("div");
      div.className = "rt-stat";
      div.innerHTML = `<div class="rt-stat__value">${value}</div><div class="rt-stat__label">${label}</div>`;
      els.stats.append(div);
    });

    const cycle = cycleInfo(customer);
    if (cycle.hasCycle) {
      els.cycleWrap.hidden = false;
      els.cycleFill.className = "rt-cycle-bar__fill rt-cycle-bar__fill--" + cycle.state;
      els.cycleFill.style.width = cycle.pct + "%";
      els.cycleText.textContent = `Ciclo habitual: ${cycle.cycleMinDays}–${cycle.cycleMaxDays} días · ${cycle.lastVisitDaysAgo} días sin visitar`;
    } else {
      els.cycleWrap.hidden = false;
      els.cycleFill.className = "rt-cycle-bar__fill";
      els.cycleFill.style.width = "0%";
      els.cycleText.textContent = "Sin patrón todavía — aún no hay suficientes visitas para calcular un ciclo.";
    }
    els.nextVisit.textContent = customer.nextExpectedVisit;

    els.products.innerHTML = "";
    (customer.favoriteProducts || []).forEach((p) => {
      const span = document.createElement("span");
      span.className = "rt-tag";
      span.textContent = p;
      els.products.append(span);
    });

    els.recDetail.textContent = customer.recommendedAction;

    els.timeline.innerHTML = "";
    (customer.timeline || []).slice().forEach((item) => {
      const div = document.createElement("div");
      div.className = "rt-timeline__item rt-timeline__item--" + item.type;
      div.innerHTML = `<div class="rt-timeline__date">${window.RTFormat.date(item.date)} · ${timelineTypeLabel(item.type)}</div><div class="rt-timeline__detail">${item.detail}</div>`;
      els.timeline.append(div);
    });
  }

  function timelineTypeLabel(type) {
    switch (type) {
      case "visita": return "Visita";
      case "campaña": return "Campaña";
      case "feedback": return "Feedback";
      default: return type;
    }
  }

  function selectCustomer(id) {
    activeId = id;
    renderList();
    window.GrowthPlatformAPI.getCustomerProfile(id).then(renderPanel);
    const activeRow = els.list.querySelector(`[data-id="${id}"]`);
    if (activeRow) activeRow.scrollIntoView({ block: "nearest" });
  }

  /* ============ Carga / error ============ */

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

    window.GrowthPlatformAPI.getCustomers()
      .then((list) => {
        customers = list;
        activeId = list.length ? list[0].id : null;
        renderList();
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
        if (activeId) {
          return window.GrowthPlatformAPI.getCustomerProfile(activeId).then(renderPanel);
        }
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
