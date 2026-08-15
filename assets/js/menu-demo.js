/**
 * rt- Menu Demo (demo/menu.html)
 * ------------------------------------------------------------------
 * Carta digital funcional: filtrado, modificadores, carrito, propina,
 * selección de entrega/pago y checkout con estados de pago simulados.
 * Usa window.RestaurantAPI como única fuente de datos/negocio.
 */

(function () {
  "use strict";

  const state = {
    categories: [],
    products: [],
    activeCategory: "todos",
    search: "",
    cart: [], // { lineId, productId, name, unitPrice, qty, optionLabels: [], notes }
    fulfillment: "mesa",
    payment: "ahora",
    tip: { mode: null, amount: 0 }, // sin selección por defecto (spec 4.7)
    paymentAttempt: null,
  };

  let nextLineId = 1;

  const els = {};

  function qs(id) { return document.getElementById(id); }

  function cacheEls() {
    els.categoryRail = qs("category-rail");
    els.productGrid = qs("product-grid");
    els.emptyState = qs("empty-state");
    els.search = qs("menu-search");
    els.cartItems = qs("cart-items");
    els.cartTotals = qs("cart-totals");
    els.cartEmptyMsg = qs("cart-empty-msg");
    els.postCartControls = qs("post-cart-controls");
    els.checkoutBtn = qs("checkout-btn");
    els.cartBar = qs("cart-bar");
    els.cartBarSummary = qs("cart-bar-summary");
    els.cartBarBtn = qs("cart-bar-btn");
    els.cartPanel = qs("cart-panel");
    els.cartCloseMobile = qs("cart-close-mobile");
    els.fulfillmentToggle = qs("fulfillment-toggle");
    els.paymentToggle = qs("payment-toggle");
    els.tipRow = qs("tip-row");
    els.tipCustomField = qs("tip-custom-field");
    els.tipCustomInput = qs("tip-custom-input");
    els.productModal = qs("product-modal");
    els.productModalTitle = qs("product-modal-title");
    els.productModalBody = qs("product-modal-body");
    els.checkoutModal = qs("checkout-modal");
    els.checkoutModalBody = qs("checkout-modal-body");
  }

  /* ============ Carga de datos ============ */
  function init() {
    cacheEls();
    window.RestaurantAPI.getMenu().then((menu) => {
      state.categories = menu.categories;
      state.products = menu.products;
      renderCategories();
      renderProducts();
    });
    bindStaticEvents();
  }

  /* ============ Categorías ============ */
  function renderCategories() {
    const all = [{ id: "todos", name: "Todos" }].concat(state.categories);
    els.categoryRail.innerHTML = all
      .map(
        (cat) =>
          `<button class="rt-category-pill" type="button" role="tab" aria-pressed="${cat.id === state.activeCategory}" data-category="${cat.id}">${cat.name}</button>`
      )
      .join("");
    els.categoryRail.querySelectorAll("[data-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeCategory = btn.dataset.category;
        els.categoryRail.querySelectorAll("[data-category]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        renderProducts();
      });
    });
  }

  /* ============ Grilla de productos ============ */
  function filteredProducts() {
    const term = state.search.trim().toLowerCase();
    return state.products.filter((p) => {
      const matchesCategory = state.activeCategory === "todos" || p.categoryId === state.activeCategory;
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }

  function renderProducts() {
    const products = filteredProducts();
    els.emptyState.hidden = products.length !== 0;
    els.productGrid.hidden = products.length === 0;
    els.productGrid.innerHTML = products
      .map((p) => {
        const tags = (p.tags || [])
          .map((t) => `<span class="rt-badge rt-badge--neutral">${t}</span>`)
          .join("");
        const unavailable = !p.available;
        return `
        <button class="rt-product-tile ${unavailable ? "rt-product-tile--unavailable" : ""}" type="button" data-product-id="${p.id}" ${unavailable ? "disabled" : ""} data-product-id-attr="${p.id}">
          <div class="rt-product-tile__image"><svg width="30" height="30" aria-hidden="true"><use href="#icon-chef"></use></svg></div>
          <div class="rt-product-tile__body">
            <div class="rt-product-tile__tags">${tags}${unavailable ? `<span class="rt-badge rt-badge--error">${p.unavailableReason || "Agotado"}</span>` : ""}</div>
            <div class="rt-product-tile__name">${p.name}</div>
            <div class="rt-product-tile__desc">${p.description}</div>
            <div class="rt-product-tile__foot">
              <span class="rt-product-tile__price">${window.RTFormat.clp(p.price)}</span>
              <span class="rt-muted" style="font-size:0.75rem;">${p.prepTime} min</span>
            </div>
          </div>
        </button>`;
      })
      .join("");

    els.productGrid.querySelectorAll("[data-product-id]").forEach((tile) => {
      tile.addEventListener("click", () => {
        if (tile.disabled) return;
        const product = state.products.find((p) => p.id === tile.dataset.productId);
        if (product) openProductModal(product);
      });
    });
  }

  /* ============ Modal de producto / modificadores ============ */
  function openProductModal(product) {
    els.productModalTitle.textContent = product.name;
    let qty = 1;

    function buildOptionsHtml() {
      return (product.modifiers || [])
        .map((group) => {
          const inputType = group.type === "single" ? "radio" : "checkbox";
          const options = group.options
            .map((opt, idx) => {
              const checkedDefault = group.type === "single" && group.required && idx === 0 ? "checked" : "";
              return `
              <div class="rt-modifier-option">
                <label>
                  <input type="${inputType}" name="mod-${group.id}" value="${opt.id}" data-group="${group.id}" data-delta="${opt.priceDelta}" data-label="${opt.name}" ${checkedDefault}>
                  ${opt.name}
                </label>
                <span class="rt-modifier-option__delta">${opt.priceDelta > 0 ? "+ " + window.RTFormat.clp(opt.priceDelta) : "—"}</span>
              </div>`;
            })
            .join("");
          return `
          <div class="rt-modifier-group">
            <div class="rt-modifier-group__head">
              <span class="rt-modifier-group__title">${group.name}</span>
              <span class="rt-badge ${group.required ? "rt-badge--soon" : "rt-badge--neutral"}">${group.required ? "Obligatorio" : "Opcional"}</span>
            </div>
            ${options}
          </div>`;
        })
        .join("");
    }

    els.productModalBody.innerHTML = `
      <p class="rt-muted">${product.description}</p>
      <p style="font-weight:800;font-size:1.2rem;color:var(--color-primary-dark);margin:0.5rem 0 1.25rem;">${window.RTFormat.clp(product.price)}</p>
      <form id="product-options-form">
        ${buildOptionsHtml()}
        <div class="rt-field">
          <label for="product-notes">Notas para cocina (opcional)</label>
          <textarea id="product-notes" placeholder="Ej: sin gluten en el pan si es posible"></textarea>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;">
          <div class="rt-qty-stepper">
            <button type="button" id="qty-minus" aria-label="Restar cantidad">−</button>
            <span id="qty-value">1</span>
            <button type="button" id="qty-plus" aria-label="Sumar cantidad">+</button>
          </div>
          <button type="button" class="rt-btn rt-btn--primary" id="add-to-cart-btn">Agregar — <span id="add-to-cart-total">${window.RTFormat.clp(product.price)}</span></button>
        </div>
      </form>
    `;

    const form = qs("product-options-form");
    const qtyValueEl = qs("qty-value");
    const totalEl = qs("add-to-cart-total");

    function computeUnitPrice() {
      let price = product.price;
      form.querySelectorAll("input:checked").forEach((input) => {
        price += Number(input.dataset.delta || 0);
      });
      return price;
    }
    function refreshTotal() {
      totalEl.textContent = window.RTFormat.clp(computeUnitPrice() * qty);
    }
    form.addEventListener("change", refreshTotal);
    qs("qty-minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); qtyValueEl.textContent = qty; refreshTotal(); });
    qs("qty-plus").addEventListener("click", () => { qty = qty + 1; qtyValueEl.textContent = qty; refreshTotal(); });

    qs("add-to-cart-btn").addEventListener("click", () => {
      const missingRequired = (product.modifiers || []).some((group) => {
        if (!group.required) return false;
        return !form.querySelector(`input[name="mod-${group.id}"]:checked`);
      });
      if (missingRequired) {
        window.RTToast.show("Selecciona las opciones obligatorias antes de continuar.", "warning");
        return;
      }
      const optionLabels = Array.from(form.querySelectorAll("input:checked")).map((i) => i.dataset.label);
      const unitPrice = computeUnitPrice();
      const notes = qs("product-notes").value.trim();
      state.cart.push({
        lineId: nextLineId++,
        productId: product.id,
        name: product.name,
        unitPrice,
        qty,
        optionLabels,
        notes,
      });
      window.RTModal.close(els.productModal);
      renderCart();
      window.RTToast.show(`${product.name} agregado al carrito`, "success");
    });

    window.RTModal.open(els.productModal);
  }

  /* ============ Carrito ============ */
  function cartSubtotal() {
    return state.cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  }

  function computeTip(subtotal) {
    if (state.tip.mode === "custom") return Math.max(0, Number(state.tip.amount) || 0);
    return Math.round(subtotal * Number(state.tip.mode));
  }

  function renderCart() {
    const hasItems = state.cart.length > 0;
    els.cartEmptyMsg.hidden = hasItems;
    els.postCartControls.hidden = !hasItems;

    els.cartItems.innerHTML = state.cart
      .map(
        (line) => `
      <div class="rt-cart-item">
        <div>
          <strong>${line.qty} × ${line.name}</strong>
          ${line.optionLabels.length ? `<div class="rt-cart-item__mods">${line.optionLabels.join(", ")}</div>` : ""}
          ${line.notes ? `<div class="rt-cart-item__mods">Nota: ${line.notes}</div>` : ""}
        </div>
        <div style="text-align:right;">
          <div>${window.RTFormat.clp(line.unitPrice * line.qty)}</div>
          <button class="rt-cart-item__remove" type="button" data-remove="${line.lineId}">Quitar</button>
        </div>
      </div>`
      )
      .join("");

    els.cartItems.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.cart = state.cart.filter((l) => String(l.lineId) !== btn.dataset.remove);
        renderCart();
      });
    });

    const subtotal = cartSubtotal();
    const tip = computeTip(subtotal);
    const total = subtotal + tip;

    els.cartTotals.innerHTML = `
      <div class="rt-cart-totals__row"><span>Subtotal</span><span>${window.RTFormat.clp(subtotal)}</span></div>
      <div class="rt-cart-totals__row"><span>Propina</span><span>${window.RTFormat.clp(tip)}</span></div>
      <div class="rt-cart-totals__row rt-cart-totals__row--total"><span>Total</span><span>${window.RTFormat.clp(total)}</span></div>
    `;

    const count = state.cart.reduce((n, l) => n + l.qty, 0);
    els.cartBarSummary.textContent = `${count} producto${count === 1 ? "" : "s"} · ${window.RTFormat.clp(total)}`;
    els.cartBar.classList.toggle("is-visible", hasItems);
  }

  /* ============ Controles estáticos (toggles, checkout) ============ */
  function bindStaticEvents() {
    els.search.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderProducts();
    });

    els.fulfillmentToggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.fulfillment = btn.dataset.fulfillment;
        els.fulfillmentToggle.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      });
    });

    els.paymentToggle.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.payment = btn.dataset.payment;
        els.paymentToggle.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      });
    });

    els.tipRow.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tip.mode = btn.dataset.tip;
        els.tipRow.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        els.tipCustomField.hidden = state.tip.mode !== "custom";
        if (state.tip.mode === "custom") {
          els.tipCustomInput.focus();
        } else {
          renderCart();
        }
      });
    });
    els.tipCustomInput.addEventListener("input", (e) => {
      state.tip.amount = Number(e.target.value) || 0;
      renderCart();
    });

    els.cartBarBtn.addEventListener("click", () => {
      els.cartPanel.classList.add("is-mobile-open");
    });
    els.cartCloseMobile.addEventListener("click", () => {
      els.cartPanel.classList.remove("is-mobile-open");
    });

    els.checkoutBtn.addEventListener("click", openCheckout);
  }

  /* ============ Checkout / pago simulado ============ */
  function openCheckout() {
    const subtotal = cartSubtotal();
    const tip = computeTip(subtotal);
    const total = subtotal + tip;

    if (state.payment === "garzon") {
      els.checkoutModalBody.innerHTML = `
        <div class="rt-payment-state rt-payment-state--pending">
          <svg width="26" height="26" aria-hidden="true"><use href="#icon-cash"></use></svg>
          <div><strong>Pago con garzón</strong><div>Un garzón confirmará el pago de ${window.RTFormat.clp(total)} en mesa.</div></div>
        </div>
        <button class="rt-btn rt-btn--primary rt-btn--block" id="confirm-waiter-order">Confirmar pedido</button>
      `;
      qs("confirm-waiter-order").addEventListener("click", () => finalizeOrder("pendiente"));
      window.RTModal.open(els.checkoutModal);
      return;
    }

    renderPaymentChoice(total);
    window.RTModal.open(els.checkoutModal);
  }

  function renderPaymentChoice(total) {
    els.checkoutModalBody.innerHTML = `
      <p class="rt-muted">Total a pagar: <strong>${window.RTFormat.clp(total)}</strong></p>
      <p class="rt-field__hint">Este es un pago simulado. Elige un resultado para continuar la demostración.</p>
      <div class="rt-btn-group" style="flex-direction:column;align-items:stretch;margin-top:1rem;">
        <button class="rt-btn rt-btn--success" data-sim="aprobado">Simular pago aprobado</button>
        <button class="rt-btn rt-btn--outline" data-sim="pendiente">Simular pago pendiente</button>
        <button class="rt-btn rt-btn--outline" data-sim="rechazado">Simular pago rechazado</button>
        <button class="rt-btn rt-btn--outline" data-sim="expirado">Simular link expirado</button>
      </div>
    `;
    els.checkoutModalBody.querySelectorAll("[data-sim]").forEach((btn) => {
      btn.addEventListener("click", () => handlePaymentSimulation(btn.dataset.sim, total));
    });
  }

  function handlePaymentSimulation(result, total) {
    if (result === "aprobado") {
      finalizeOrder("aprobado");
      return;
    }
    const copy = {
      pendiente: { cls: "pending", title: "Pago pendiente", text: "Estamos esperando la confirmación de Mercado Pago." },
      rechazado: { cls: "rejected", title: "Pago rechazado", text: "El medio de pago fue rechazado. Puedes reintentar." },
      expirado: { cls: "expired", title: "Link de pago expirado", text: "El link de pago venció. Genera uno nuevo para continuar." },
    }[result];

    els.checkoutModalBody.innerHTML = `
      <div class="rt-payment-state rt-payment-state--${copy.cls}">
        <svg width="26" height="26" aria-hidden="true"><use href="#icon-${result === "rechazado" ? "alert" : "clock"}"></use></svg>
        <div><strong>${copy.title}</strong><div>${copy.text}</div></div>
      </div>
      ${result === "pendiente" ? '<button class="rt-btn rt-btn--outline rt-btn--block" id="recheck-payment">Revisar estado del pago</button>' : ""}
      <button class="rt-btn rt-btn--primary rt-btn--block" id="retry-payment" style="margin-top:0.75rem;">Reintentar pago</button>
    `;
    if (result === "pendiente") {
      qs("recheck-payment").addEventListener("click", () => {
        window.RTToast.show("Pago confirmado por Mercado Pago.", "success");
        finalizeOrder("aprobado");
      });
    }
    qs("retry-payment").addEventListener("click", () => renderPaymentChoice(total));
  }

  function finalizeOrder(paymentStatus) {
    const subtotal = cartSubtotal();
    const tip = computeTip(subtotal);
    const total = subtotal + tip;
    const order = {
      channel: "qr",
      tableOrPickup: state.fulfillment === "mesa" ? "Mesa 4" : "Retiro",
      items: state.cart.map((l) => ({ name: l.name, qty: l.qty, mods: l.optionLabels })),
      notes: state.cart.map((l) => l.notes).filter(Boolean).join(" · "),
      commercialStatus: "procesando",
      paymentStatus,
      kitchenStatus: paymentStatus === "aprobado" ? "nuevo" : "bloqueado",
      taxStatus: paymentStatus === "aprobado" ? "en-cola" : "no-solicitado",
      total,
      tip,
      subtotal,
    };

    window.RestaurantAPI.createOrder(order).then((created) => {
      renderOrderConfirmation(created);
      state.cart = [];
      renderCart();
      els.cartPanel.classList.remove("is-mobile-open");
    });
  }

  function renderOrderConfirmation(order) {
    const steps = ["Pendiente", "Confirmado", "En preparación", "Listo"];
    const doneUpTo = order.paymentStatus === "aprobado" ? 1 : 0;
    els.checkoutModalBody.innerHTML = `
      <div class="rt-payment-state rt-payment-state--approved">
        <svg width="26" height="26" aria-hidden="true"><use href="#icon-check"></use></svg>
        <div><strong>Pedido ${order.id} confirmado</strong><div>${window.RTFormat.clp(order.total)} · ${order.tableOrPickup}</div></div>
      </div>
      <div class="rt-order-tracker">
        ${steps.map((s, i) => `<div class="rt-order-tracker__step ${i <= doneUpTo ? "is-done" : ""} ${i === doneUpTo + 1 ? "is-current" : ""}">${s}</div>`).join("")}
      </div>
      <p class="rt-field__hint">Este pedido de demostración quedó guardado en tu navegador y aparece en el <a href="kitchen.html">KDS de cocina</a>.</p>
      <button class="rt-btn rt-btn--outline rt-btn--block" data-rt-modal-close>Seguir comprando</button>
    `;
    els.checkoutModalBody.querySelector("[data-rt-modal-close]").addEventListener("click", () => window.RTModal.close(els.checkoutModal));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
