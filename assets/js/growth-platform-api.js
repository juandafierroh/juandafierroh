/**
 * window.GrowthPlatformAPI
 * ------------------------------------------------------------------
 * Adaptador único entre las pantallas /demo y los datos de la
 * plataforma. Hoy lee de window.GP_DATA y localStorage. Cada método
 * incluye un comentario "TODO integración" señalando el punto de
 * conexión futuro con GoHighLevel, WooCommerce/WPCafe, Mercado Pago,
 * Bsale o un Restaurant Orchestrator.
 *
 * Ninguna pantalla debería leer GP_DATA directamente: siempre a
 * través de estos métodos, para que migrar a un backend real no
 * requiera tocar HTML ni CSS.
 */

(function () {
  "use strict";

  const DATA = window.GP_DATA || {};
  const STORAGE_KEY = "gp-local-campaigns";

  function readLocalCampaigns() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function writeLocalCampaigns(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* localStorage no disponible */
    }
  }
  function simulateLatency(value, ms) {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms || 260));
  }

  const GrowthPlatformAPI = {
    // TODO integración: agregación real desde Restaurant Orchestrator / GoHighLevel.
    getDashboard() {
      return simulateLatency({
        kpis: DATA.kpis,
        opportunityChannels: DATA.opportunityChannels,
        recommendations: DATA.recommendations,
        growthInsights: DATA.growthInsights,
        atRiskCount: DATA.customers.filter((c) => c.risk === "alto" || c.risk === "caso abierto").length,
      });
    },

    // TODO integración: fuente de oportunidades vía webhooks de cada canal.
    getOpportunities(filter) {
      let list = DATA.opportunities.slice();
      if (filter && filter.channel && filter.channel !== "Todos") {
        list = list.filter((o) => o.channel === filter.channel);
      }
      if (filter && filter.status && filter.status !== "todas") {
        list = list.filter((o) => o.status === filter.status);
      }
      return simulateLatency(list);
    },

    // TODO integración: GoHighLevel (campañas, workflows, envío real).
    getCampaigns() {
      return simulateLatency(DATA.campaigns.concat(readLocalCampaigns()));
    },

    // TODO integración: creación real de campaña en GoHighLevel + grupo de control.
    createCampaign(payload) {
      const campaign = Object.assign(
        {
          id: "CMP-LOCAL-" + Date.now(),
          status: payload.sendNow ? "activa" : "programada",
          sent: 0,
          opened: 0,
          converted: 0,
          revenue: 0,
        },
        payload
      );
      const local = readLocalCampaigns();
      local.unshift(campaign);
      writeLocalCampaigns(local);
      return simulateLatency(campaign, 500);
    },

    // TODO integración: generación real de copy vía modelo de lenguaje conectado a la marca.
    generateCampaignCopy(objectiveId, customerName, favoriteProduct) {
      const bank = DATA.campaignCopyBank[objectiveId] || DATA.campaignCopyBank.reactivacion;
      const template = bank[Math.floor(Math.random() * bank.length)];
      const text = template
        .replace(/\{\{nombre\}\}/g, customerName || "cliente")
        .replace(/\{\{producto_favorito\}\}/g, favoriteProduct || "plato favorito")
        .replace(/\{\{producto_nuevo\}\}/g, favoriteProduct || "una novedad de la carta");
      return simulateLatency(text, 700);
    },

    // TODO integración: transcripciones reales desde el proveedor de Voice AI / WhatsApp Business API.
    getConversations(channel) {
      let list = DATA.conversations.slice();
      if (channel && channel !== "Todos") list = list.filter((c) => c.channel === channel);
      return simulateLatency(list);
    },

    // TODO integración: GoHighLevel / CRM como fuente única del perfil de cliente.
    getCustomers(segment) {
      let list = DATA.customers.slice();
      if (segment && segment !== "todos") list = list.filter((c) => c.tags.includes(segment));
      return simulateLatency(list);
    },

    getCustomerProfile(id) {
      const customer = DATA.customers.find((c) => c.id === id) || DATA.customers[0];
      return simulateLatency(customer);
    },

    // TODO integración: cálculo real de riesgo mediante el motor de recurrencia (ver recurrencia.html).
    getAtRiskCustomers() {
      return simulateLatency(DATA.customers.filter((c) => c.risk === "alto" || c.risk === "caso abierto"));
    },

    getRecommendations() {
      return simulateLatency(DATA.recommendations);
    },

    // TODO integración: casos reales desde encuestas post-visita + reseñas públicas (Google, Instagram).
    getReputationCases(status) {
      let list = DATA.reputationCases.slice();
      if (status && status !== "todos") list = list.filter((c) => c.status === status);
      return simulateLatency({ cases: list, trends: DATA.reputationTrends });
    },

    // TODO integración: agregación real desde Restaurant Orchestrator con filtros por fecha real.
    getFunnel(filters) {
      return simulateLatency({ stages: DATA.funnel.stages, filters: DATA.funnel.filters, applied: filters || {} });
    },

    // TODO integración: estado real de cada conector (OAuth, webhooks, colas de sincronización).
    getIntegrations() {
      return simulateLatency(DATA.integrations);
    },

    // TODO integración: WooCommerce/WPCafe (pedidos), POS conectado (mesas, caja).
    getOrders() {
      return simulateLatency(DATA.orders);
    },
  };

  window.GrowthPlatformAPI = GrowthPlatformAPI;
})();
