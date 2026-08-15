/**
 * rt- Dashboard Demo (demo/dashboard.html)
 * ------------------------------------------------------------------
 * Panel del dueño: KPIs, gráficos, alertas, clientes en riesgo y
 * tabla de pedidos, filtrables por rango de fecha y canal.
 */

(function () {
  "use strict";

  const RANGE_MULTIPLIER = { hoy: 1, semana: 6.2, mes: 26 };
  const BASE = {
    ventas: 1310000,
    pedidos: 86,
    ticketPromedio: 15200,
    clientesNuevos: 4,
    clientesRecurrentes: 62,
    pagosPendientes: 3,
    pagosRechazados: 1,
  };

  function channelLabel(id) {
    const ch = window.RT_DATA.channels.find((c) => c.id === id);
    return ch ? ch.label : id;
  }
  function channelColor(id) {
    const ch = window.RT_DATA.channels.find((c) => c.id === id);
    return ch ? ch.color : "#999";
  }

  function channelShare(channelId) {
    const series = window.RT_DATA.dashboardSeries.salesByChannel;
    const total = series.reduce((s, c) => s + c.total, 0);
    if (channelId === "todos") return 1;
    const found = series.find((c) => c.channel === channelId);
    return found ? found.total / total : 0;
  }

  function renderChannelOptions() {
    const select = document.getElementById("filter-channel");
    window.RT_DATA.channels.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.label;
      select.appendChild(opt);
    });
  }

  function renderKpis(range, channel) {
    const mult = RANGE_MULTIPLIER[range];
    const share = channelShare(channel);
    const ventas = Math.round(BASE.ventas * mult * share);
    const pedidos = Math.max(1, Math.round(BASE.pedidos * mult * share));
    const ticket = Math.round(ventas / pedidos) || 0;

    const kpis = [
      { label: "Ventas", value: window.RTFormat.clp(ventas) },
      { label: "Pedidos", value: pedidos },
      { label: "Ticket promedio", value: window.RTFormat.clp(ticket) },
      { label: "Clientes nuevos", value: Math.round(BASE.clientesNuevos * mult * share) },
      { label: "Clientes recurrentes", value: Math.round(BASE.clientesRecurrentes * mult * share) },
      { label: "Pagos pendientes", value: BASE.pagosPendientes },
      { label: "Pagos rechazados", value: BASE.pagosRechazados },
      { label: "Integraciones con error", value: window.RT_DATA.integrations.filter((i) => i.status === "con-error").length },
    ];
    document.getElementById("kpi-row").innerHTML = kpis
      .map((k) => `<div class="rt-stat"><div class="rt-stat__value">${k.value}</div><div class="rt-stat__label">${k.label}</div></div>`)
      .join("");
  }

  function renderBarChart() {
    const series = window.RT_DATA.dashboardSeries.salesByDay;
    const max = Math.max(...series.map((d) => d.total));
    document.getElementById("sales-bar-chart").innerHTML = series
      .map((d) => {
        const pct = Math.round((d.total / max) * 100);
        return `<div class="rt-bar-chart__col"><div class="rt-bar-chart__bar" style="height:${pct}%;" title="${window.RTFormat.clp(d.total)}"></div><span class="rt-bar-chart__label">${d.day}</span></div>`;
      })
      .join("");
  }

  function renderChannelBars() {
    const series = window.RT_DATA.dashboardSeries.salesByChannel;
    const max = Math.max(...series.map((c) => c.total));
    document.getElementById("channel-bars").innerHTML = series
      .map(
        (c) => `<div class="rt-channel-bars__row">
          <span>${channelLabel(c.channel)}</span>
          <span class="rt-channel-bars__track"><span class="rt-channel-bars__fill" style="width:${Math.round((c.total / max) * 100)}%;background:${channelColor(c.channel)};"></span></span>
          <strong>${window.RTFormat.clp(c.total)}</strong>
        </div>`
      )
      .join("");
  }

  function renderTopProducts() {
    document.getElementById("top-products-tbody").innerHTML = window.RT_DATA.dashboardSeries.topProducts
      .map((p) => `<tr><td data-label="Producto">${p.name}</td><td data-label="Unidades">${p.qty}</td></tr>`)
      .join("");
  }

  function renderAlerts() {
    const alerts = [];
    const rejected = window.RT_DATA.orders.filter((o) => o.paymentStatus === "rechazado");
    if (rejected.length) alerts.push(`${rejected.length} pedido(s) con pago rechazado — requieren seguimiento.`);
    const errorIntegrations = window.RT_DATA.integrations.filter((i) => i.status === "con-error");
    errorIntegrations.forEach((i) => alerts.push(`${i.name}: ${i.note || "presenta errores de sincronización."}`));
    const openCases = window.RT_DATA.feedbackCases.filter((f) => f.status !== "cerrado");
    if (openCases.length) alerts.push(`${openCases.length} caso(s) de feedback abiertos pendientes de respuesta.`);
    const atRisk = window.RT_DATA.customers.filter((c) => c.risk === "alto");
    if (atRisk.length) alerts.push(`${atRisk.length} cliente(s) en riesgo de no volver — reactivación sugerida.`);

    document.getElementById("alert-list").innerHTML = alerts.length
      ? alerts.map((a) => `<div class="rt-alert-item"><svg width="18" height="18" aria-hidden="true"><use href="#icon-alert"></use></svg><span>${a}</span></div>`).join("")
      : '<div class="rt-demo-empty">Sin alertas por ahora.</div>';
  }

  function renderRiskCustomers() {
    const atRisk = window.RT_DATA.customers.filter((c) => c.risk === "alto" || c.risk === "vip");
    document.getElementById("risk-customers").innerHTML = atRisk
      .map(
        (c) => `<div class="rt-alert-item">
          <span class="rt-risk-dot rt-risk-dot--${c.risk}"></span>
          <span><strong>${c.name}</strong> — ${c.daysSinceVisit} días sin visitar (ciclo ${c.cycleMinDays || "?"}–${c.cycleMaxDays || "?"} días). ${c.recommendedAction}</span>
        </div>`
      )
      .join("") || '<div class="rt-demo-empty">Sin clientes en riesgo.</div>';
  }

  function statusBadge(status, kind) {
    const map = {
      comercial: { pendiente: "neutral", procesando: "integration", completado: "available", cancelado: "error", fallido: "error", reembolsado: "roadmap" },
      pago: { "no-iniciado": "neutral", pendiente: "soon", aprobado: "available", rechazado: "error", cancelado: "neutral", reembolsado: "roadmap" },
      cocina: { bloqueado: "roadmap", nuevo: "integration", aceptado: "integration", preparando: "soon", listo: "available", entregado: "available", cancelado: "error" },
    };
    const cls = (map[kind] && map[kind][status]) || "neutral";
    return `<span class="rt-badge rt-badge--${cls}">${status}</span>`;
  }

  function renderOrdersTable(channel) {
    const local = window.RestaurantAPI.getLocalOrders();
    let all = local.concat(window.RT_DATA.orders);
    if (channel !== "todos") all = all.filter((o) => o.channel === channel);
    document.getElementById("orders-count-badge").textContent = `${all.length} pedidos`;
    document.getElementById("orders-tbody").innerHTML = all.length
      ? all
          .map(
            (o) => `<tr>
          <td data-label="Pedido">${o.id}</td>
          <td data-label="Canal">${channelLabel(o.channel)}</td>
          <td data-label="Mesa/Retiro">${o.tableOrPickup}</td>
          <td data-label="Comercial">${statusBadge(o.commercialStatus, "comercial")}</td>
          <td data-label="Pago">${statusBadge(o.paymentStatus, "pago")}</td>
          <td data-label="Cocina">${statusBadge(o.kitchenStatus, "cocina")}</td>
          <td data-label="Total">${window.RTFormat.clp(o.total)}</td>
        </tr>`
          )
          .join("")
      : '<tr><td colspan="7">Sin pedidos para este filtro.</td></tr>';
  }

  function renderAll() {
    const range = document.getElementById("filter-range").value;
    const channel = document.getElementById("filter-channel").value;
    renderKpis(range, channel);
    renderOrdersTable(channel);
  }

  function init() {
    renderChannelOptions();
    renderBarChart();
    renderChannelBars();
    renderTopProducts();
    renderAlerts();
    renderRiskCustomers();
    renderAll();
    document.getElementById("filter-range").addEventListener("change", renderAll);
    document.getElementById("filter-channel").addEventListener("change", renderAll);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
