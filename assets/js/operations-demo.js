/**
 * Demo: Operación del día
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getOrders() y renderiza un tablero
 * Kanban compacto (Nuevo / En preparación / Listo / Entregado) que
 * ilustra la capa operativa de Recurra — POS, cocina, pagos y
 * documentos — sin pretender ser un punto de venta completo.
 *
 * Cada tarjeta puede abrir un documento simulado (boleta) mediante
 * el modal reutilizable de components.js (window.RTModal). Incluye
 * estado de carga y error con reintento para la carga inicial.
 */
(function () {
  "use strict";

  const els = {
    loading: document.getElementById("ops-loading"),
    content: document.getElementById("ops-content"),
    error: document.getElementById("ops-error"),
    retry: document.getElementById("ops-retry"),
    board: document.getElementById("order-board"),
    modal: document.getElementById("doc-modal"),
    modalOrder: document.getElementById("doc-modal-order"),
    modalBody: document.getElementById("doc-modal-body"),
  };

  const CHANNEL_ICON = {
    "Teléfono": "icon-phone",
    "Web": "icon-search",
    "QR": "icon-qr",
    "WhatsApp": "icon-chat",
    "Instagram": "icon-heart",
  };

  const COLUMNS = [
    { key: "nuevo", title: "Nuevo" },
    { key: "prep", title: "En preparación" },
    { key: "listo", title: "Listo" },
    { key: "entregado", title: "Entregado" },
  ];

  let ordersById = {};

  function columnFor(status) {
    if (status === "confirmada" || status === "pagado") return "nuevo";
    if (status === "en preparación" || status === "en cocina") return "prep";
    if (status === "listo") return "listo";
    if (status === "entregado") return "entregado";
    return "nuevo";
  }

  function channelIcon(channel) {
    return CHANNEL_ICON[channel] || "icon-search";
  }

  function totalLabel(order) {
    return order.total > 0 ? window.RTFormat.clp(order.total) : "Sin cobro asociado";
  }

  function cardMarkup(order) {
    return `
      <div class="rt-kds-card">
        <div class="rt-kds-card__head">
          <span class="rt-kds-card__id">${order.id}</span>
          <span class="rt-tag" style="font-size:0.72rem; padding:0.15rem 0.55rem;">${order.type}</span>
        </div>
        <div class="rt-kds-card__meta">
          <span style="display:flex; align-items:center; gap:0.3rem; color:var(--color-muted);">
            <svg width="14" height="14" aria-hidden="true"><use href="#${channelIcon(order.channel)}"></use></svg>
            ${order.channel}
          </span>
        </div>
        <p style="margin:0 0 0.7rem; font-weight:600; font-size:0.9rem;">${order.customer}</p>
        <div class="rt-kds-card__actions" style="justify-content:space-between; align-items:center;">
          <strong style="font-size:0.9rem;">${totalLabel(order)}</strong>
          <button class="rt-btn rt-btn--sm rt-btn--outline" type="button" data-doc-order="${order.id}">Ver documento</button>
        </div>
      </div>`;
  }

  function columnMarkup(col, orders) {
    const cards = orders.length
      ? orders.map(cardMarkup).join("")
      : `<p class="rt-muted" style="font-size:0.82rem; padding:0.4rem 0.2rem;">Sin pedidos en este estado.</p>`;
    return `
      <div class="rt-kds-column">
        <div class="rt-kds-column__head">
          <span class="rt-kds-column__title">${col.title}</span>
          <span class="rt-badge rt-badge--neutral">${orders.length}</span>
        </div>
        <div class="rt-kds-column__list">${cards}</div>
      </div>`;
  }

  function renderBoard(orders) {
    ordersById = {};
    orders.forEach((o) => { ordersById[o.id] = o; });

    const grouped = { nuevo: [], prep: [], listo: [], entregado: [] };
    orders.forEach((o) => grouped[columnFor(o.status)].push(o));

    els.board.innerHTML = COLUMNS.map((col) => columnMarkup(col, grouped[col.key])).join("");

    els.board.querySelectorAll("[data-doc-order]").forEach((btn) => {
      btn.addEventListener("click", () => openDocument(btn.getAttribute("data-doc-order")));
    });
  }

  function openDocument(orderId) {
    const order = ordersById[orderId];
    if (!order) return;
    els.modalOrder.textContent = "Sabor Urbano · Providencia";
    els.modalBody.innerHTML = `
      <div style="font-size:0.92rem; display:grid; gap:0.4rem;">
        <div style="display:flex; justify-content:space-between;"><span>Pedido</span><strong>${order.id}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Cliente</span><strong>${order.customer}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Canal</span><strong>${order.channel}</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Tipo</span><strong>${order.type}</strong></div>
      </div>
      <hr class="rt-divider">
      <p class="rt-muted" style="font-size:0.85rem;">1 x Detalle de productos del pedido (línea ilustrativa)</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.1rem; font-weight:800; margin-top:0.5rem;">
        <span>Total</span><span>${totalLabel(order)}</span>
      </div>
      <p class="rt-muted" style="font-size:0.78rem; margin-top:1.25rem; text-align:center;">Documento simulado — sin validez tributaria.</p>`;
    if (window.RTModal) window.RTModal.open(els.modal);
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

    if (!window.GrowthPlatformAPI) {
      showError();
      return;
    }

    window.GrowthPlatformAPI.getOrders()
      .then((orders) => {
        renderBoard(orders);
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
