/**
 * Demo: Reactivación
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getCustomers() y arma la tabla de
 * clientes atrasados respecto de su ciclo habitual: ciclo esperado,
 * días sin visitar, riesgo, acción sugerida y un botón "Activar" que
 * simula el envío de una campaña de reactivación — incluyendo la
 * asignación aleatoria (~15%) a un grupo de control, para mostrar de
 * forma honesta cómo se mide el impacto incremental real. Incluye
 * estado de carga simulada y estado de error con reintento.
 */
(function () {
  "use strict";

  const CONTROL_GROUP_RATE = 0.15;
  const SEND_DELAY_MS = 900;

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("react-loading"),
    content: document.getElementById("react-content"),
    error: document.getElementById("react-error"),
    retry: document.getElementById("react-retry"),
    tbody: document.getElementById("react-tbody"),
    newCustomerDetail: document.getElementById("new-customer-detail"),
  };

  // "caso abierto" → "caso-abierto" para calzar con los modificadores CSS.
  function riskClass(risk) {
    return String(risk || "").trim().replace(/\s+/g, "-");
  }

  function riskLabel(risk) {
    switch (risk) {
      case "alto": return "Atrasado";
      case "bajo": return "Al día";
      case "caso abierto": return "Caso abierto";
      default: return risk || "—";
    }
  }

  function renderRow(customer) {
    const tr = document.createElement("tr");
    tr.dataset.id = customer.id;

    const isSuspended = customer.risk === "caso abierto";
    const noConsent = customer.consent === false;
    const disabled = isSuspended || noConsent;
    let note = "";
    if (isSuspended) note = "Campañas suspendidas mientras el caso de reputación siga abierto.";
    else if (noConsent) note = "Sin consentimiento de marketing — no se puede enviar campaña.";

    tr.innerHTML = `
      <td data-label="Cliente">
        <strong>${customer.name}</strong>
        <div class="rt-muted" style="font-size:0.78rem;">${customer.segment}</div>
      </td>
      <td data-label="Ciclo esperado">${customer.cycleMinDays}–${customer.cycleMaxDays} días</td>
      <td data-label="Días sin visitar">${customer.lastVisitDaysAgo} días</td>
      <td data-label="Estado"><span class="rt-cycle-status rt-cycle-status--${riskClass(customer.risk)}" data-role="estado">${riskLabel(customer.risk)}</span></td>
      <td data-label="Acción sugerida">${customer.recommendedAction}</td>
      <td data-label="Activar" style="min-width:180px;">
        <button type="button" class="rt-btn rt-btn--sm rt-btn--dark" data-role="activar-btn" ${disabled ? "disabled aria-disabled=\"true\"" : ""}>Activar</button>
        <div data-role="resultado" hidden style="margin-top:0.6rem; font-size:0.82rem; display:grid; gap:0.2rem;"></div>
        ${note ? `<p class="rt-muted" data-role="nota" style="font-size:0.78rem; margin-top:0.5rem;">${note}</p>` : ""}
      </td>`;

    const btn = tr.querySelector('[data-role="activar-btn"]');
    if (!disabled) {
      btn.addEventListener("click", () => activate(tr, customer, btn));
    }
    return tr;
  }

  function activate(tr, customer, btn) {
    btn.disabled = true;
    btn.textContent = "Enviando…";

    setTimeout(() => {
      const estadoEl = tr.querySelector('[data-role="estado"]');
      const resultadoEl = tr.querySelector('[data-role="resultado"]');
      const isControl = Math.random() < CONTROL_GROUP_RATE;

      if (isControl) {
        estadoEl.className = "rt-cycle-status rt-cycle-status--nuevo";
        estadoEl.textContent = "En grupo de control";
        resultadoEl.innerHTML = `
          <span><svg width="14" height="14" style="vertical-align:-2px; margin-right:0.3rem; color:var(--color-muted);"><use href="#icon-shield"></use></svg>En grupo de control — sin envío</span>
          <span class="rt-muted">Se reserva para medir el impacto incremental real de la campaña.</span>`;
        btn.textContent = "Sin envío";
      } else {
        const attributedSale = Math.round((customer.avgTicket * (0.85 + Math.random() * 0.5)) / 100) * 100;
        const returnDays = Math.max(2, Math.round(customer.cycleMinDays * (0.3 + Math.random() * 0.4)));
        estadoEl.className = "rt-cycle-status rt-cycle-status--bajo";
        estadoEl.textContent = "Contactado";
        resultadoEl.innerHTML = `
          <span><svg width="14" height="14" style="vertical-align:-2px; margin-right:0.3rem; color:var(--color-success);"><use href="#icon-check"></use></svg>Mensaje enviado</span>
          <span>Venta atribuida: <strong>${window.RTFormat.clp(attributedSale)}</strong></span>
          <span>Regreso estimado: en ${returnDays} días</span>`;
        btn.textContent = "Enviado";
      }
      resultadoEl.hidden = false;
    }, SEND_DELAY_MS);
  }

  function render(customers) {
    const withCycle = customers.filter((c) => c.cycleMinDays != null && c.cycleMaxDays != null);
    const withoutCycle = customers.filter((c) => c.cycleMinDays == null);

    els.tbody.innerHTML = "";
    withCycle.forEach((c) => els.tbody.append(renderRow(c)));

    if (withoutCycle.length) {
      const names = withoutCycle.map((c) => c.name).join(", ");
      els.newCustomerDetail.textContent =
        `${names} — todavía no completa suficientes visitas para calcular un ciclo. En vez de reactivación, la IA sugiere una campaña liviana de "segunda visita" para consolidar el hábito.`;
    } else {
      document.getElementById("new-customer-callout").hidden = true;
    }
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

    window.GrowthPlatformAPI.getCustomers()
      .then((list) => {
        render(list);
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
