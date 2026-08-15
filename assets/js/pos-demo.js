/**
 * rt- POS Demo (demo/pos.html)
 * ------------------------------------------------------------------
 * Pantalla de venta POS Lite: turnos, productos con modificadores,
 * descuento, propina, medios de pago, envío a cocina y boleta/factura
 * simulada mediante Bsale.
 */

(function () {
  "use strict";

  const shift = { open: false, user: "", startAmount: 0, startedAt: null, sales: [] };
  const ticket = {
    items: [],
    discount: 0,
    tip: { mode: null, amount: 0 }, // sin selección por defecto (spec 4.7)
    method: "efectivo",
    fulfillment: "mesa",
    tableNumber: "5",
    customer: "",
    channel: "pos",
  };

  let activeCategory = "todos";
  let saleCounter = 3000;
  const els = {};

  function qs(id) { return document.getElementById(id); }

  function cacheEls() {
    [
      "shift-banner", "shift-banner-title", "shift-banner-detail", "shift-toggle-btn",
      "pos-content", "pos-search", "pos-category-rail", "pos-product-grid",
      "pos-customer", "pos-channel", "pos-fulfillment-toggle", "pos-table-field", "pos-table-number",
      "pos-ticket-items", "pos-ticket-empty", "pos-discount", "pos-tip-row", "pos-tip-custom-field", "pos-tip-custom",
      "pos-totals", "pos-payment-method", "pos-create-order", "pos-print", "pos-invoice",
      "shift-modal", "shift-modal-body", "pos-product-modal", "pos-product-modal-title", "pos-product-modal-body",
      "invoice-modal", "invoice-modal-body", "shift-summary-card", "shift-summary-stats", "shift-sales-tbody",
    ].forEach((id) => { els[toCamel(id)] = qs(id); });
  }
  function toCamel(id) { return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

  /* ============ Turno ============ */
  function renderShiftBanner() {
    if (shift.open) {
      els.shiftBanner.className = "rt-shift-banner rt-shift-banner--open";
      els.shiftBannerTitle.textContent = `Turno abierto — ${shift.user || "Cajero"}`;
      els.shiftBannerDetail.textContent = `Monto inicial ${window.RTFormat.clp(shift.startAmount)} · desde ${new Date(shift.startedAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`;
      els.shiftToggleBtn.textContent = "Cerrar turno";
      els.posContent.style.opacity = "1";
      els.posContent.style.pointerEvents = "auto";
    } else {
      els.shiftBanner.className = "rt-shift-banner rt-shift-banner--closed";
      els.shiftBannerTitle.textContent = "Turno cerrado";
      els.shiftBannerDetail.textContent = "Abre un turno para comenzar a vender.";
      els.shiftToggleBtn.textContent = "Abrir turno";
      els.posContent.style.opacity = "0.4";
      els.posContent.style.pointerEvents = "none";
    }
  }

  function openShiftModal() {
    if (shift.open) {
      renderCloseShiftForm();
    } else {
      renderOpenShiftForm();
    }
    window.RTModal.open(els.shiftModal);
  }

  function renderOpenShiftForm() {
    qs("shift-modal-title").textContent = "Abrir turno";
    els.shiftModalBody.innerHTML = `
      <div class="rt-field"><label for="shift-user">Usuario responsable</label><input type="text" id="shift-user" value="Camila R." data-rt-modal-autofocus></div>
      <div class="rt-field"><label for="shift-amount">Monto inicial de caja (CLP)</label><input type="number" id="shift-amount" value="30000" min="0" step="1000"></div>
      <button class="rt-btn rt-btn--primary rt-btn--block" id="shift-open-confirm">Abrir turno</button>
    `;
    qs("shift-open-confirm").addEventListener("click", () => {
      shift.open = true;
      shift.user = qs("shift-user").value.trim() || "Cajero";
      shift.startAmount = Number(qs("shift-amount").value) || 0;
      shift.startedAt = new Date().toISOString();
      shift.sales = [];
      els.shiftSummaryCard.hidden = true;
      renderShiftBanner();
      window.RTModal.close(els.shiftModal);
      window.RTToast.show("Turno abierto correctamente", "success");
    });
  }

  function renderCloseShiftForm() {
    qs("shift-modal-title").textContent = "Cerrar turno";
    const totals = { efectivo: 0, tarjeta: 0, mercadopago: 0, transferencia: 0, tips: 0 };
    shift.sales.forEach((s) => {
      totals[s.method] = (totals[s.method] || 0) + s.amount;
      totals.tips += s.tip;
    });
    const expectedCash = shift.startAmount + totals.efectivo;
    els.shiftModalBody.innerHTML = `
      <div class="rt-stat-row" style="margin-bottom:1rem;">
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(totals.efectivo)}</div><div class="rt-stat__label">Efectivo</div></div>
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(totals.tarjeta)}</div><div class="rt-stat__label">Tarjeta externa</div></div>
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(totals.mercadopago)}</div><div class="rt-stat__label">Mercado Pago</div></div>
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(totals.transferencia)}</div><div class="rt-stat__label">Transferencia</div></div>
        <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(totals.tips)}</div><div class="rt-stat__label">Propinas</div></div>
      </div>
      <div class="rt-field"><label>Efectivo esperado</label><input type="text" value="${window.RTFormat.clp(expectedCash)}" disabled></div>
      <div class="rt-field"><label for="shift-counted">Efectivo contado</label><input type="number" id="shift-counted" value="${expectedCash}" min="0" step="500" data-rt-modal-autofocus></div>
      <div class="rt-field"><label for="shift-notes">Observaciones</label><textarea id="shift-notes" placeholder="Ej: diferencia por vuelto entregado de más"></textarea></div>
      <button class="rt-btn rt-btn--dark rt-btn--block" id="shift-close-confirm">Cerrar turno</button>
    `;
    qs("shift-close-confirm").addEventListener("click", () => {
      const counted = Number(qs("shift-counted").value) || 0;
      const diff = counted - expectedCash;
      renderShiftSummary(totals, expectedCash, counted, diff, qs("shift-notes").value.trim());
      shift.open = false;
      renderShiftBanner();
      window.RTModal.close(els.shiftModal);
      window.RTToast.show(diff === 0 ? "Turno cerrado sin diferencias" : "Turno cerrado con diferencia registrada", diff === 0 ? "success" : "warning");
    });
  }

  function renderShiftSummary(totals, expected, counted, diff, notes) {
    els.shiftSummaryCard.hidden = false;
    els.shiftSummaryStats.innerHTML = `
      <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(expected)}</div><div class="rt-stat__label">Total esperado</div></div>
      <div class="rt-stat"><div class="rt-stat__value">${window.RTFormat.clp(counted)}</div><div class="rt-stat__label">Total contado</div></div>
      <div class="rt-stat"><div class="rt-stat__value" style="color:${diff === 0 ? "var(--color-success)" : "var(--color-danger)"};">${window.RTFormat.clp(diff)}</div><div class="rt-stat__label">Diferencia</div></div>
      <div class="rt-stat"><div class="rt-stat__value">${shift.sales.length}</div><div class="rt-stat__label">Ventas del turno</div></div>
    `;
    els.shiftSalesTbody.innerHTML = shift.sales
      .map(
        (s) => `<tr>
          <td data-label="Hora">${new Date(s.at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</td>
          <td data-label="Cliente">${s.customer || "—"}</td>
          <td data-label="Medio de pago">${methodLabel(s.method)}</td>
          <td data-label="Total">${window.RTFormat.clp(s.amount)}</td>
        </tr>`
      )
      .join("") || '<tr><td colspan="4">Sin ventas registradas.</td></tr>';
    if (notes) window.RTToast.show("Observación registrada: " + notes, "warning");
  }

  function methodLabel(method) {
    return { efectivo: "Efectivo", tarjeta: "Tarjeta externa", mercadopago: "Mercado Pago", transferencia: "Transferencia" }[method] || method;
  }

  /* ============ Productos ============ */
  function renderCategoryRail() {
    const all = [{ id: "todos", name: "Todos" }].concat(window.RT_DATA.categories);
    els.posCategoryRail.innerHTML = all
      .map((c) => `<button class="rt-category-pill" type="button" aria-pressed="${c.id === activeCategory}" data-cat="${c.id}">${c.name}</button>`)
      .join("");
    els.posCategoryRail.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        els.posCategoryRail.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        renderProductGrid();
      });
    });
  }

  function renderProductGrid() {
    const term = els.posSearch.value.trim().toLowerCase();
    const products = window.RT_DATA.products.filter((p) => {
      const matchesCat = activeCategory === "todos" || p.categoryId === activeCategory;
      const matchesSearch = !term || p.name.toLowerCase().includes(term);
      return matchesCat && matchesSearch && p.available;
    });
    els.posProductGrid.innerHTML = products
      .map((p) => `<button class="rt-pos-product-btn" type="button" data-product="${p.id}"><strong>${p.name}</strong><span>${window.RTFormat.clp(p.price)}</span></button>`)
      .join("") || '<p class="rt-muted">Sin resultados.</p>';
    els.posProductGrid.querySelectorAll("[data-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = window.RT_DATA.products.find((p) => p.id === btn.dataset.product);
        if (product.modifiers && product.modifiers.length) openProductModal(product);
        else addToTicket(product, [], product.price, 1);
      });
    });
  }

  function openProductModal(product) {
    qs("pos-product-modal-title").textContent = product.name;
    const body = qs("pos-product-modal-body");
    body.innerHTML =
      (product.modifiers || [])
        .map((group) => {
          const inputType = group.type === "single" ? "radio" : "checkbox";
          const opts = group.options
            .map(
              (o, idx) => `<div class="rt-modifier-option"><label><input type="${inputType}" name="pmod-${group.id}" value="${o.id}" data-delta="${o.priceDelta}" data-label="${o.name}" ${group.type === "single" && group.required && idx === 0 ? "checked" : ""}> ${o.name}</label><span class="rt-modifier-option__delta">${o.priceDelta > 0 ? "+ " + window.RTFormat.clp(o.priceDelta) : "—"}</span></div>`
            )
            .join("");
          return `<div class="rt-modifier-group"><div class="rt-modifier-group__head"><span class="rt-modifier-group__title">${group.name}</span><span class="rt-badge ${group.required ? "rt-badge--soon" : "rt-badge--neutral"}">${group.required ? "Obligatorio" : "Opcional"}</span></div>${opts}</div>`;
        })
        .join("") +
      `<button class="rt-btn rt-btn--primary rt-btn--block" id="pos-add-to-ticket">Agregar a la venta</button>`;

    qs("pos-add-to-ticket").addEventListener("click", () => {
      const missing = (product.modifiers || []).some((g) => g.required && !body.querySelector(`input[name="pmod-${g.id}"]:checked`));
      if (missing) { window.RTToast.show("Selecciona las opciones obligatorias.", "warning"); return; }
      const checked = Array.from(body.querySelectorAll("input:checked"));
      const delta = checked.reduce((s, i) => s + Number(i.dataset.delta || 0), 0);
      const labels = checked.map((i) => i.dataset.label);
      addToTicket(product, labels, product.price + delta, 1);
      window.RTModal.close(els.posProductModal);
    });
    window.RTModal.open(els.posProductModal);
  }

  function addToTicket(product, labels, unitPrice, qty) {
    ticket.items.push({ lineId: Date.now() + Math.random(), name: product.name, unitPrice, qty, labels });
    renderTicket();
    window.RTToast.show(`${product.name} agregado`, "success");
  }

  /* ============ Ticket / totales ============ */
  function ticketSubtotal() {
    return ticket.items.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  }
  function computeTip(base) {
    if (ticket.tip.mode === "custom") return Math.max(0, Number(ticket.tip.amount) || 0);
    return Math.round(base * Number(ticket.tip.mode));
  }

  function renderTicket() {
    els.posTicketEmpty.hidden = ticket.items.length > 0;
    els.posTicketItems.innerHTML = ticket.items
      .map(
        (l) => `<div class="rt-cart-item"><div><strong>${l.qty} × ${l.name}</strong>${l.labels.length ? `<div class="rt-cart-item__mods">${l.labels.join(", ")}</div>` : ""}</div><div style="text-align:right;"><div>${window.RTFormat.clp(l.unitPrice * l.qty)}</div><button class="rt-cart-item__remove" data-remove="${l.lineId}">Quitar</button></div></div>`
      )
      .join("");
    els.posTicketItems.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        ticket.items = ticket.items.filter((l) => String(l.lineId) !== btn.dataset.remove);
        renderTicket();
      });
    });

    const subtotal = ticketSubtotal();
    const discount = Math.min(subtotal, Number(els.posDiscount.value) || 0);
    const afterDiscount = subtotal - discount;
    const tip = computeTip(afterDiscount);
    const total = afterDiscount + tip;

    els.posTotals.innerHTML = `
      <div class="rt-cart-totals__row"><span>Subtotal</span><span>${window.RTFormat.clp(subtotal)}</span></div>
      <div class="rt-cart-totals__row"><span>Descuento</span><span>− ${window.RTFormat.clp(discount)}</span></div>
      <div class="rt-cart-totals__row"><span>Propina</span><span>${window.RTFormat.clp(tip)}</span></div>
      <div class="rt-cart-totals__row rt-cart-totals__row--total"><span>Total</span><span>${window.RTFormat.clp(total)}</span></div>
    `;
    return { subtotal, discount, tip, total };
  }

  /* ============ Crear venta ============ */
  function createSale() {
    if (!shift.open) { window.RTToast.show("Abre un turno antes de vender.", "warning"); return; }
    if (!ticket.items.length) { window.RTToast.show("Agrega productos a la venta.", "warning"); return; }
    const totals = renderTicket();
    saleCounter += 1;
    const saleId = "SU-" + saleCounter;
    const customer = els.posCustomer.value.trim();

    shift.sales.push({ at: new Date().toISOString(), amount: totals.total, tip: totals.tip, method: ticket.method, customer });

    window.RestaurantAPI.createOrder({
      channel: els.posChannel.value,
      tableOrPickup: ticket.fulfillment === "mesa" ? "Mesa " + els.posTableNumber.value : "Retiro",
      items: ticket.items.map((l) => ({ name: l.name, qty: l.qty, mods: l.labels })),
      notes: "",
      commercialStatus: "completado",
      paymentStatus: "aprobado",
      kitchenStatus: "nuevo",
      taxStatus: "no-solicitado",
      total: totals.total,
    }).then((order) => {
      window.RTToast.show(`Venta ${order.id} creada y enviada a cocina`, "success");
      ticket.items = [];
      els.posDiscount.value = 0;
      els.posCustomer.value = "";
      renderTicket();
    });
  }

  /* ============ Boleta / factura ============ */
  function openInvoiceModal() {
    const totals = renderTicket();
    if (totals.total === 0) { window.RTToast.show("Agrega productos antes de solicitar el documento.", "warning"); return; }
    renderInvoiceChoice(totals.total);
    window.RTModal.open(els.invoiceModal);
  }

  function renderInvoiceChoice(total) {
    els.invoiceModalBody.innerHTML = `
      <div class="rt-toggle-row" role="group" aria-label="Tipo de documento" id="invoice-type-toggle">
        <button type="button" data-doctype="boleta" aria-pressed="true">Boleta</button>
        <button type="button" data-doctype="factura" aria-pressed="false">Factura</button>
      </div>
      <div id="invoice-factura-fields" hidden>
        <div class="rt-field"><label for="invoice-rut">RUT</label><input type="text" id="invoice-rut" placeholder="76.123.456-7"></div>
        <div class="rt-field__error" id="invoice-rut-error" hidden>RUT no válido (verificación visual, sin consulta al SII).</div>
        <div class="rt-field"><label for="invoice-razon">Razón social</label><input type="text" id="invoice-razon" placeholder="Empresa SpA"></div>
        <div class="rt-field"><label for="invoice-giro">Giro</label><input type="text" id="invoice-giro" placeholder="Servicios de alimentación"></div>
      </div>
      <p class="rt-muted">Total del documento: <strong>${window.RTFormat.clp(total)}</strong></p>
      <button class="rt-btn rt-btn--primary rt-btn--block" id="invoice-emit">Emitir documento</button>
    `;
    const toggle = qs("invoice-type-toggle");
    const facturaFields = qs("invoice-factura-fields");
    let docType = "boleta";
    toggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        docType = btn.dataset.doctype;
        toggle.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        facturaFields.hidden = docType !== "factura";
      });
    });
    qs("invoice-emit").addEventListener("click", () => {
      if (docType === "factura") {
        const rut = qs("invoice-rut").value;
        const valid = window.RTFormat.isValidRut(rut);
        qs("invoice-rut-error").hidden = valid;
        if (!valid) return;
      }
      emitDocument(docType, total);
    });
  }

  function emitDocument(docType, total) {
    els.invoiceModalBody.innerHTML = `
      <div class="rt-payment-state rt-payment-state--pending" id="invoice-status">
        <svg width="24" height="24" aria-hidden="true"><use href="#icon-receipt"></use></svg>
        <div><strong>Emitiendo ${docType} electrónica…</strong><div>Consultando a Bsale.</div></div>
      </div>
    `;
    setTimeout(() => {
      const folio = Math.floor(Math.random() * 90000 + 10000);
      qs("invoice-status").outerHTML = `
        <div class="rt-payment-state rt-payment-state--approved">
          <svg width="24" height="24" aria-hidden="true"><use href="#icon-check"></use></svg>
          <div><strong>${docType === "boleta" ? "Boleta" : "Factura"} folio ${folio}</strong><div>Total ${window.RTFormat.clp(total)} · Estado SII: Aceptado</div></div>
        </div>
        <p class="rt-field__hint">Documento simulado. En producción se envía por WhatsApp o correo y queda asociado al pedido.</p>
        <button class="rt-btn rt-btn--outline rt-btn--block" data-rt-modal-close>Cerrar</button>
      `;
      els.invoiceModalBody.querySelector("[data-rt-modal-close]").addEventListener("click", () => window.RTModal.close(els.invoiceModal));
      window.RTToast.show(`${docType === "boleta" ? "Boleta" : "Factura"} emitida — folio ${folio}`, "success");
    }, 900);
  }

  /* ============ Eventos ============ */
  function bindEvents() {
    els.shiftToggleBtn.addEventListener("click", openShiftModal);
    els.posSearch.addEventListener("input", renderProductGrid);
    els.posDiscount.addEventListener("input", renderTicket);
    els.posCreateOrder.addEventListener("click", createSale);
    els.posPrint.addEventListener("click", () => window.RTToast.show("Comanda enviada a Print Bridge", "success"));
    els.posInvoice.addEventListener("click", openInvoiceModal);

    els.posFulfillmentToggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        ticket.fulfillment = btn.dataset.fulfillment;
        els.posFulfillmentToggle.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        els.posTableField.hidden = ticket.fulfillment !== "mesa";
      });
    });

    els.posPaymentMethod.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        ticket.method = btn.dataset.method;
        els.posPaymentMethod.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      });
    });

    els.posTipRow.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        ticket.tip.mode = btn.dataset.tip;
        els.posTipRow.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        els.posTipCustomField.hidden = ticket.tip.mode !== "custom";
        renderTicket();
      });
    });
    els.posTipCustom.addEventListener("input", (e) => { ticket.tip.amount = Number(e.target.value) || 0; renderTicket(); });
  }

  function init() {
    cacheEls();
    bindEvents();
    renderShiftBanner();
    renderCategoryRail();
    renderProductGrid();
    renderTicket();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
