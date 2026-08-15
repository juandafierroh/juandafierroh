/**
 * rt- Kitchen Demo (demo/kitchen.html)
 * ------------------------------------------------------------------
 * KDS tipo Kanban con columnas Nuevos / Aceptados / Preparando / Listos.
 * Los pedidos bloqueados (pago no confirmado) aparecen inmovilizados
 * en "Nuevos" hasta que se simula la confirmación del pago.
 */

(function () {
  "use strict";

  const COLUMNS = [
    { key: "nuevo", title: "Nuevos" },
    { key: "aceptado", title: "Aceptados" },
    { key: "preparando", title: "Preparando" },
    { key: "listo", title: "Listos" },
  ];

  const STATIONS = ["Todas", "Parrilla", "Horno", "Barra", "Postres", "Freidora", "Fría"];

  let orders = [];
  let activeStation = "Todas";
  let orderCounter = 2000;

  function productByName(name) {
    return window.RT_DATA.products.find((p) => p.name === name);
  }

  function elapsedMinutes(createdAt) {
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  }

  function isOverdue(order) {
    if (!order.promisedAt) return false;
    return Date.now() > new Date(order.promisedAt).getTime() && order.kitchenStatus !== "listo";
  }

  function loadOrders() {
    const seed = window.RT_DATA.orders
      .filter((o) => ["bloqueado", "nuevo", "aceptado", "preparando", "listo"].includes(o.kitchenStatus))
      .map((o) => Object.assign({}, o));
    const local = window.RestaurantAPI.getLocalOrders().map((o) =>
      Object.assign(
        {
          promisedAt: new Date(Date.now() + 20 * 60000).toISOString(),
        },
        o
      )
    );
    orders = local.concat(seed);
  }

  function stationsForOrder(order) {
    return order.items
      .map((it) => {
        const product = productByName(it.name);
        return product ? product.kitchenTag : null;
      })
      .filter(Boolean);
  }

  function renderStationFilter() {
    const rail = document.getElementById("station-filter");
    rail.innerHTML = STATIONS.map(
      (s) => `<button class="rt-category-pill" type="button" role="tab" aria-pressed="${s === activeStation}" data-station="${s}">${s}</button>`
    ).join("");
    rail.querySelectorAll("[data-station]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeStation = btn.dataset.station;
        rail.querySelectorAll("[data-station]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        renderBoard();
      });
    });
  }

  function channelLabel(channelId) {
    const ch = window.RT_DATA.channels.find((c) => c.id === channelId);
    return ch ? ch.label : channelId;
  }

  function cardHtml(order) {
    const blocked = order.kitchenStatus === "bloqueado";
    const overdue = isOverdue(order);
    const itemsHtml = order.items
      .map((it) => `<li>${it.qty} × ${it.name}${it.mods && it.mods.length ? `<div class="rt-kds-card__mods">${it.mods.join(", ")}</div>` : ""}</li>`)
      .join("");

    const paymentBadge =
      order.paymentStatus === "aprobado"
        ? '<span class="rt-badge rt-badge--available">Pago aprobado</span>'
        : order.paymentStatus === "pendiente"
        ? '<span class="rt-badge rt-badge--soon">Pago pendiente</span>'
        : '<span class="rt-badge rt-badge--error">Pago rechazado</span>';

    let actions = "";
    if (blocked) {
      actions = `<button class="rt-btn rt-btn--sm rt-btn--outline" data-action="unblock" data-id="${order.id}">Simular pago confirmado</button>`;
    } else if (order.kitchenStatus === "nuevo") {
      actions = `<button class="rt-btn rt-btn--sm rt-btn--primary" data-action="advance" data-id="${order.id}">Aceptar</button>
                 <button class="rt-btn rt-btn--sm rt-btn--outline" data-action="cancel" data-id="${order.id}">Cancelar</button>`;
    } else if (order.kitchenStatus === "aceptado") {
      actions = `<button class="rt-btn rt-btn--sm rt-btn--primary" data-action="advance" data-id="${order.id}">Preparar</button>
                 <button class="rt-btn rt-btn--sm rt-btn--outline" data-action="cancel" data-id="${order.id}">Cancelar</button>`;
    } else if (order.kitchenStatus === "preparando") {
      actions = `<button class="rt-btn rt-btn--sm rt-btn--success" data-action="advance" data-id="${order.id}">Marcar listo</button>
                 <button class="rt-btn rt-btn--sm rt-btn--outline" data-action="cancel" data-id="${order.id}">Cancelar</button>`;
    } else if (order.kitchenStatus === "listo") {
      actions = `<button class="rt-btn rt-btn--sm rt-btn--success" data-action="advance" data-id="${order.id}">Entregar</button>
                 <button class="rt-btn rt-btn--sm rt-btn--outline" data-action="reprint" data-id="${order.id}"><svg width="14" height="14" aria-hidden="true"><use href="#icon-printer"></use></svg> Reimprimir</button>`;
    }

    return `
    <div class="rt-kds-card ${overdue ? "rt-kds-card--alert" : ""}" data-card-id="${order.id}">
      <div class="rt-kds-card__head">
        <span class="rt-kds-card__id">${order.id}</span>
        <span class="rt-kds-card__timer"><svg width="14" height="14" aria-hidden="true"><use href="#icon-clock"></use></svg>${elapsedMinutes(order.createdAt)} min</span>
      </div>
      <div class="rt-kds-card__meta">
        <span class="rt-badge rt-badge--neutral">${channelLabel(order.channel)}</span>
        <span class="rt-badge rt-badge--neutral">${order.tableOrPickup}</span>
        ${paymentBadge}
        ${overdue ? '<span class="rt-badge rt-badge--error"><svg width="12" height="12"><use href="#icon-alert"></use></svg>Demorado</span>' : ""}
        ${blocked ? '<span class="rt-badge rt-badge--roadmap"><svg width="12" height="12"><use href="#icon-lock"></use></svg>Bloqueado</span>' : ""}
      </div>
      <ul class="rt-kds-card__items">${itemsHtml}</ul>
      ${order.notes ? `<div class="rt-kds-card__notes">"${order.notes}"</div>` : ""}
      <div class="rt-kds-card__actions">${actions}</div>
    </div>`;
  }

  function renderBoard() {
    const board = document.getElementById("kds-board");
    board.innerHTML = COLUMNS.map((col) => {
      let colOrders = orders.filter((o) => o.kitchenStatus === col.key || (col.key === "nuevo" && o.kitchenStatus === "bloqueado"));
      if (activeStation !== "Todas") {
        colOrders = colOrders.filter((o) => stationsForOrder(o).includes(activeStation));
      }
      colOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const cards = colOrders.length
        ? colOrders.map(cardHtml).join("")
        : '<div class="rt-demo-empty" style="padding:1.5rem 0.5rem;">Sin pedidos en esta columna.</div>';
      return `
      <section class="rt-kds-column" aria-label="${col.title}">
        <div class="rt-kds-column__head">
          <span class="rt-kds-column__title">${col.title}</span>
          <span class="rt-badge rt-badge--neutral">${colOrders.length}</span>
        </div>
        <div class="rt-kds-column__list">${cards}</div>
      </section>`;
    }).join("");

    board.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => handleAction(btn.dataset.action, btn.dataset.id));
    });
  }

  function handleAction(action, id) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const flow = ["nuevo", "aceptado", "preparando", "listo", "entregado"];

    if (action === "unblock") {
      order.paymentStatus = "aprobado";
      order.kitchenStatus = "nuevo";
      announce(`Pago confirmado para ${order.id}. El pedido pasó a Nuevos.`);
    } else if (action === "advance") {
      const idx = flow.indexOf(order.kitchenStatus);
      const next = flow[idx + 1];
      if (next === "entregado") {
        orders = orders.filter((o) => o.id !== id);
        announce(`Pedido ${order.id} entregado.`);
        window.RTToast.show(`Pedido ${order.id} entregado`, "success");
      } else {
        order.kitchenStatus = next;
        announce(`Pedido ${order.id} pasó a ${next}.`);
      }
    } else if (action === "cancel") {
      orders = orders.filter((o) => o.id !== id);
      announce(`Pedido ${order.id} cancelado.`);
      window.RTToast.show(`Pedido ${order.id} cancelado`, "danger");
    } else if (action === "reprint") {
      window.RTToast.show(`Comanda de ${order.id} reenviada a Print Bridge`, "success");
      return;
    }
    renderBoard();
  }

  function announce(msg) {
    const region = document.getElementById("live-region");
    if (region) region.textContent = msg;
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) { /* audio no disponible en este navegador */ }
  }

  function simulateNewOrder() {
    orderCounter += 1;
    const sampleProducts = ["Hamburguesa clásica", "Pizza vegetariana", "Bowl veggie", "Limonada", "Cheesecake"];
    const channels = ["qr", "whatsapp", "phone"];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const item = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const order = {
      id: "SU-" + orderCounter,
      channel,
      tableOrPickup: channel === "qr" ? "Mesa " + (Math.floor(Math.random() * 8) + 1) : "Retiro",
      createdAt: new Date().toISOString(),
      promisedAt: new Date(Date.now() + 18 * 60000).toISOString(),
      items: [{ name: item, qty: 1, mods: [] }],
      notes: "",
      commercialStatus: "procesando",
      paymentStatus: "aprobado",
      kitchenStatus: "nuevo",
      taxStatus: "en-cola",
      total: 8990,
    };
    orders.unshift(order);
    beep();
    announce(`Nuevo pedido recibido: ${order.id}.`);
    window.RTToast.show(`Nuevo pedido ${order.id} recibido`, "success");
    renderBoard();
  }

  function init() {
    loadOrders();
    renderStationFilter();
    renderBoard();
    document.getElementById("new-order-btn").addEventListener("click", simulateNewOrder);
    setInterval(renderBoard, 30000);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
