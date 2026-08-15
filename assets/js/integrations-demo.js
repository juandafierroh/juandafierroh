/**
 * rt- Integrations Demo (demo/integrations.html)
 * ------------------------------------------------------------------
 * Centro de integraciones del modo "Conecta": estado de conectores
 * (POS, documentos tributarios, pagos, CRM, cocina), mapeo ilustrativo
 * de productos y estado del Print Bridge con su cola de impresión.
 * Todas las acciones (reintentar, configurar, imprimir) son
 * simulaciones locales, sin llamadas de red reales.
 */

(function () {
  "use strict";

  const STATUS_BADGE = {
    conectado: { cls: "available", label: "Conectado" },
    sincronizando: { cls: "integration", label: "Sincronizando" },
    "con-error": { cls: "error", label: "Con error" },
    "no-disponible": { cls: "neutral", label: "No disponible" },
  };

  const MAPPING_STATUS = [
    { cls: "available", label: "Mapeado" },
    { cls: "available", label: "Mapeado" },
    { cls: "soon", label: "Conflicto de precio" },
    { cls: "available", label: "Mapeado" },
    { cls: "neutral", label: "Sin correspondencia" },
    { cls: "available", label: "Mapeado" },
  ];

  const PRINT_JOB_BADGE = {
    pendiente: { cls: "soon", label: "Pendiente" },
    impreso: { cls: "available", label: "Impreso" },
    fallido: { cls: "error", label: "Fallido" },
  };

  let integrations = [];
  let printQueue = [
    { id: "PB-241", desc: "Comanda pedido SU-1044 · Parrilla", status: "pendiente" },
    { id: "PB-240", desc: "Comanda pedido SU-1043 · Barra", status: "impreso" },
    { id: "PB-239", desc: "Comanda pedido SU-1042 · Parrilla", status: "fallido" },
  ];

  function integrationCardHtml(i) {
    const badge = STATUS_BADGE[i.status] || { cls: "neutral", label: i.status };
    const canRetry = i.status === "con-error";
    return `<div class="rt-card">
      <div class="rt-integration-card">
        <div class="rt-integration-card__head">
          <div>
            <strong style="font-size:1.02rem;">${i.name}</strong>
            <div style="font-size:0.82rem;color:var(--color-muted);">${i.category}</div>
          </div>
          <span class="rt-badge rt-badge--${badge.cls}">${badge.label}</span>
        </div>
        <div class="rt-integration-card__meta">
          <span>Última sincronización: <strong>${i.lastSync ? window.RTFormat.dateTime(i.lastSync) : "—"}</strong></span>
          ${i.productsSynced != null ? `<span>Productos sincronizados: <strong>${i.productsSynced}</strong></span>` : ""}
          ${i.ordersSent != null ? `<span>Pedidos enviados: <strong>${i.ordersSent}</strong></span>` : ""}
          ${i.note ? `<span>${i.note}</span>` : ""}
        </div>
        <div class="rt-integration-card__actions">
          <button type="button" class="rt-btn rt-btn--sm rt-btn--outline" data-action="retry" data-id="${i.id}" ${canRetry ? "" : "disabled"}>
            <svg width="14" height="14" aria-hidden="true"><use href="#icon-refresh"></use></svg> Reintentar
          </button>
          <button type="button" class="rt-btn rt-btn--sm rt-btn--outline" data-action="configure" data-id="${i.id}">
            <svg width="14" height="14" aria-hidden="true"><use href="#icon-plug"></use></svg> Configurar
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderIntegrations() {
    const grid = document.getElementById("integrations-grid");
    grid.innerHTML = integrations.map(integrationCardHtml).join("");
    grid.querySelectorAll('[data-action="retry"]').forEach((btn) => {
      btn.addEventListener("click", () => retryIntegration(btn.dataset.id, btn));
    });
    grid.querySelectorAll('[data-action="configure"]').forEach((btn) => {
      const integ = integrations.find((i) => i.id === btn.dataset.id);
      btn.addEventListener("click", () => {
        window.RTToast.show(`Abriendo configuración de ${integ.name} (simulado)`, "success");
      });
    });
  }

  function retryIntegration(id, btn) {
    const integ = integrations.find((i) => i.id === id);
    if (!integ) return;
    btn.disabled = true;
    btn.textContent = "Reintentando...";
    setTimeout(() => {
      const succeeded = Math.random() < 0.5;
      if (succeeded) {
        integ.status = "conectado";
        integ.lastSync = new Date().toISOString();
        integ.errors = 0;
        window.RTToast.show(`${integ.name}: conexión restablecida (simulado)`, "success");
      } else {
        window.RTToast.show(`${integ.name}: el reintento sigue fallando (simulado)`, "danger");
      }
      renderIntegrations();
      if (id === "printbridge") renderPrintBridge();
    }, 900);
  }

  function renderMapping() {
    const products = window.RT_DATA.products.slice(0, MAPPING_STATUS.length);
    document.getElementById("mapping-tbody").innerHTML = products
      .map((p, idx) => {
        const sku = "POS-" + (1000 + idx * 7);
        const status = MAPPING_STATUS[idx % MAPPING_STATUS.length];
        return `<tr>
          <td data-label="Producto (Menú Maestro)">${p.name}</td>
          <td data-label="SKU POS">${sku}</td>
          <td data-label="Estado del mapeo"><span class="rt-badge rt-badge--${status.cls}">${status.label}</span></td>
        </tr>`;
      })
      .join("");
  }

  function renderPrintQueue() {
    document.getElementById("print-queue").innerHTML = printQueue
      .map((j) => {
        const badge = PRINT_JOB_BADGE[j.status];
        return `<div class="rt-printqueue__job"><span>${j.desc}</span><span class="rt-badge rt-badge--${badge.cls}">${badge.label}</span></div>`;
      })
      .join("");
  }

  function retryQueue() {
    const btn = document.getElementById("retry-queue-btn");
    btn.disabled = true;
    btn.textContent = "Reintentando...";
    setTimeout(() => {
      printQueue = printQueue.map((j) =>
        j.status === "pendiente" || j.status === "fallido" ? Object.assign({}, j, { status: "impreso" }) : j
      );
      renderPrintQueue();
      btn.disabled = false;
      btn.textContent = "Reintentar cola";
      window.RTToast.show("Cola de impresión reintentada: todos los trabajos se imprimieron (simulado)", "success");
    }, 900);
  }

  function renderPrintBridge() {
    const pb = integrations.find((i) => i.id === "printbridge");
    if (!pb) return;
    const offline = pb.status === "con-error";
    document.getElementById("printbridge-card").innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1.1rem;">
        <div>
          <h3 style="margin-bottom:0.3rem;display:flex;align-items:center;gap:0.4rem;"><svg width="18" height="18" aria-hidden="true"><use href="#icon-printer"></use></svg>Estado de Print Bridge</h3>
          <p style="color:var(--color-muted);font-size:0.9rem;margin:0;">${pb.note || "Puente de impresión entre pedidos entrantes y las impresoras de cocina/barra."}</p>
        </div>
        <span class="rt-badge rt-badge--${offline ? "error" : "available"}">${offline ? "Fuera de línea" : "En línea"}</span>
      </div>
      ${offline ? `<div class="rt-alert-item" style="margin-bottom:1.1rem;"><svg width="18" height="18" aria-hidden="true"><use href="#icon-alert"></use></svg><span>La impresora de cocina no responde. Revisa la conexión o reintenta la cola de impresión.</span></div>` : ""}
      <div class="rt-stat-row" style="margin-bottom:1.25rem;">
        <div class="rt-stat"><div class="rt-stat__value" style="font-size:1.1rem;">${window.RTFormat.dateTime(pb.lastSync)}</div><div class="rt-stat__label">Último contacto</div></div>
        <div class="rt-stat"><div class="rt-stat__value" style="font-size:1.1rem;">Parrilla-01</div><div class="rt-stat__label">Impresora cocina</div></div>
        <div class="rt-stat"><div class="rt-stat__value" style="font-size:1.1rem;">Barra-01</div><div class="rt-stat__label">Impresora barra</div></div>
      </div>
      <p style="font-weight:700;font-size:0.9rem;margin-bottom:0.6rem;">Cola de impresión</p>
      <div class="rt-printqueue" id="print-queue"></div>
      <div class="rt-btn-group" style="margin-top:1.1rem;">
        <button type="button" class="rt-btn rt-btn--outline rt-btn--sm" id="retry-queue-btn">Reintentar cola</button>
        <button type="button" class="rt-btn rt-btn--outline rt-btn--sm" id="test-print-btn"><svg width="14" height="14" aria-hidden="true"><use href="#icon-printer"></use></svg> Impresión de prueba</button>
      </div>
    `;
    renderPrintQueue();
    document.getElementById("retry-queue-btn").addEventListener("click", retryQueue);
    document.getElementById("test-print-btn").addEventListener("click", () => {
      window.RTToast.show("Impresión de prueba enviada a la impresora de cocina (simulado)", "success");
    });
  }

  function init() {
    window.RestaurantAPI.getIntegrations().then((data) => {
      integrations = data;
      renderIntegrations();
      renderMapping();
      renderPrintBridge();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
