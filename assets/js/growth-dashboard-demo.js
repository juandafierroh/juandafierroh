/**
 * Demo: Dashboard de crecimiento
 * ------------------------------------------------------------------
 * Consume window.GrowthPlatformAPI.getDashboard() y renderiza KPIs,
 * recomendaciones de IA, oportunidades por canal y el panel de
 * "Oportunidades de crecimiento". Incluye estado de carga simulada
 * y estado de error con reintento.
 */
(function () {
  "use strict";

  const els = {
    notice: document.getElementById("demo-notice"),
    loading: document.getElementById("dash-loading"),
    content: document.getElementById("dash-content"),
    error: document.getElementById("dash-error"),
    retry: document.getElementById("dash-retry"),
    kpiRow: document.getElementById("kpi-row"),
    recList: document.getElementById("rec-list"),
    channelBars: document.getElementById("channel-bars"),
    insightList: document.getElementById("insight-list"),
    atRiskCount: document.getElementById("at-risk-count"),
  };

  const channelColors = ["var(--color-primary)", "var(--color-accent)", "var(--color-ai)", "var(--color-success)", "var(--color-teal)", "var(--color-rose)"];

  function kpiCard(value, label) {
    const div = document.createElement("div");
    div.className = "rt-stat";
    div.innerHTML = `<div class="rt-stat__value">${value}</div><div class="rt-stat__label">${label}</div>`;
    return div;
  }

  function renderKpis(kpis) {
    els.kpiRow.innerHTML = "";
    els.kpiRow.append(
      kpiCard(kpis.opportunities.toLocaleString("es-CL"), "Oportunidades · " + kpis.period),
      kpiCard(kpis.conversations.toLocaleString("es-CL"), "Conversaciones"),
      kpiCard(kpis.ordersOrReservations.toLocaleString("es-CL"), "Pedidos / reservas"),
      kpiCard(kpis.conversionRate + "%", "Conversión"),
      kpiCard(window.RTFormat.clp(kpis.attributedRevenue), "Ventas atribuidas"),
      kpiCard(kpis.reactivatedCustomers, "Reactivados este mes"),
      kpiCard(kpis.avgRating.toString().replace(".", ","), "Valoración promedio"),
      kpiCard(kpis.recoveredCases, "Casos recuperados")
    );
  }

  function renderRecommendations(list) {
    els.recList.innerHTML = "";
    list.forEach((rec) => {
      const div = document.createElement("div");
      div.className = "rt-rec-card";
      div.innerHTML = `
        <div class="rt-rec-card__icon"><svg width="20" height="20"><use href="#${rec.icon}"></use></svg></div>
        <div>
          <p class="rt-rec-card__title">${rec.title}</p>
          <p class="rt-rec-card__detail">${rec.detail}</p>
          <a class="rt-btn rt-btn--sm rt-btn--dark rt-rec-card__action" href="${rec.link}">${rec.action}</a>
        </div>`;
      els.recList.append(div);
    });
  }

  function renderChannels(channels) {
    els.channelBars.innerHTML = "";
    const max = Math.max(...channels.map((c) => c.count));
    channels.forEach((c, i) => {
      const row = document.createElement("div");
      row.className = "rt-channel-bars__row";
      const pct = Math.round((c.count / max) * 100);
      row.innerHTML = `
        <span>${c.channel}</span>
        <span class="rt-channel-bars__track"><span class="rt-channel-bars__fill" style="width:${pct}%; background:${channelColors[i % channelColors.length]}"></span></span>
        <span><strong>${c.count}</strong> <span class="rt-muted" style="font-size:0.75rem;">${c.trend >= 0 ? "+" : ""}${c.trend}%</span></span>`;
      els.channelBars.append(row);
    });
  }

  function renderInsights(insights) {
    els.insightList.innerHTML = "";
    insights.forEach((text) => {
      const li = document.createElement("li");
      li.innerHTML = `<svg width="18" height="18"><use href="#icon-sparkles"></use></svg><span>${text}</span>`;
      els.insightList.append(li);
    });
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

    window.GrowthPlatformAPI.getDashboard()
      .then((data) => {
        renderKpis(data.kpis);
        renderRecommendations(data.recommendations);
        renderChannels(data.opportunityChannels);
        renderInsights(data.growthInsights);
        els.atRiskCount.textContent = data.atRiskCount;
        els.notice.textContent = window.GP_DATA.demoNotice;
        els.loading.hidden = true;
        els.content.hidden = false;
      })
      .catch(showError);
  }

  els.retry && els.retry.addEventListener("click", load);
  document.addEventListener("DOMContentLoaded", load);
})();
