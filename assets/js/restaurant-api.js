/**
 * window.RestaurantAPI
 * ------------------------------------------------------------------
 * Adaptador simulado de datos. Hoy lee de window.RT_DATA (datos
 * ficticios) y persiste pedidos de demostración en localStorage.
 * Mañana, cada método puede reemplazarse por una llamada real sin
 * tocar el HTML/CSS ni la lógica de las pantallas /demo/*.html.
 *
 * Puntos de conexión futura (ver PRODUCT_SPEC.md §15):
 *   - getMenu()          → WooCommerce REST API (wc/v3/products) + WPCafe (menú, mesas)
 *   - validateCart()     → Restaurant Orchestrator Lite (validación de precios/disponibilidad)
 *   - createOrder()       → WooCommerce (wc/v3/orders) + Restaurant Orchestrator Lite (estados)
 *   - confirmPayment()   → Mercado Pago (Checkout Pro / Payments API)
 *   - issueDocument()     → Bsale (boleta/factura electrónica)
 *   - getOrderStatus()   → Restaurant Orchestrator Lite (WebSocket/polling de estados)
 *   - getCustomers()     → GoHighLevel (contactos, workflows, consentimiento)
 *   - getMetrics()       → Restaurant Orchestrator Lite (agregación de panel omnicanal)
 *   - Optiontics         → motor de modificadores/combos del Menú Maestro (mapeo de variantes)
 */

window.RestaurantAPI = (function () {
  "use strict";

  const STORAGE_KEY = "rt-demo-orders-v1";

  function readLocalOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeLocalOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      /* almacenamiento no disponible: se continúa solo en memoria */
    }
  }

  function delay(value, ms) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms || 250));
  }

  /** Devuelve el menú maestro (categorías + productos). */
  function getMenu() {
    // TODO WordPress: reemplazar por fetch('/wp-json/wc/v3/products?category=...')
    const data = window.RT_DATA;
    return delay({ categories: data.categories, products: data.products });
  }

  /**
   * Valida un carrito contra el menú maestro: existencia, disponibilidad
   * y recálculo de precios/modificadores. Simula lo que en producción
   * haría Restaurant Orchestrator Lite antes de cobrar.
   */
  function validateCart(cartItems) {
    const products = window.RT_DATA.products;
    const errors = [];
    let subtotal = 0;

    (cartItems || []).forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        errors.push(`Producto no encontrado: ${item.productId}`);
        return;
      }
      if (!product.available) {
        errors.push(`${product.name} no está disponible en este momento.`);
        return;
      }
      let unitPrice = product.price;
      (item.selectedOptionIds || []).forEach((optId) => {
        product.modifiers.forEach((mod) => {
          const opt = mod.options.find((o) => o.id === optId);
          if (opt) unitPrice += opt.priceDelta;
        });
      });
      subtotal += unitPrice * (item.qty || 1);
    });

    return delay({ valid: errors.length === 0, errors, subtotal }, 150);
  }

  /** Crea un pedido de demostración y lo guarda en localStorage. */
  function createOrder(order) {
    const orders = readLocalOrders();
    const id = "DEMO-" + Math.floor(Math.random() * 9000 + 1000);
    const record = Object.assign(
      {
        id,
        createdAt: new Date().toISOString(),
        commercialStatus: "pendiente",
        paymentStatus: "pendiente",
        kitchenStatus: "bloqueado",
        taxStatus: "no-solicitado",
      },
      order,
      { id }
    );
    orders.unshift(record);
    writeLocalOrders(orders);
    return delay(record, 400);
  }

  /** Consulta el estado actual de un pedido (fusiona datos locales y seed). */
  function getOrderStatus(orderId) {
    const local = readLocalOrders().find((o) => o.id === orderId);
    if (local) return delay(local);
    const seed = window.RT_DATA.orders.find((o) => o.id === orderId);
    return delay(seed || null);
  }

  function getCustomers() {
    return delay(window.RT_DATA.customers);
  }

  function getMetrics() {
    return delay(window.RT_DATA.dashboardSeries);
  }

  function getLocalOrders() {
    return readLocalOrders();
  }

  function getIntegrations() {
    return delay(window.RT_DATA.integrations);
  }

  return {
    getMenu,
    validateCart,
    createOrder,
    getOrderStatus,
    getCustomers,
    getMetrics,
    getLocalOrders,
    getIntegrations,
  };
})();
