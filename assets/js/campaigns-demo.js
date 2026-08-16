/**
 * Demo: Campañas (asistente de creación)
 * ------------------------------------------------------------------
 * Wizard de una sola pantalla para crear una campaña: objetivo,
 * audiencia (con alcance estimado y grupo de control automático),
 * generación de mensaje con IA (GrowthPlatformAPI.generateCampaignCopy),
 * canal, envío inmediato o programado y una tabla con todas las
 * campañas (existentes + creadas en esta sesión).
 *
 * Los objetivos y audiencias son catálogos de referencia (no datos
 * operativos), así que se leen directamente de window.GP_DATA, igual
 * que growth-dashboard-demo.js hace con GP_DATA.demoNotice.
 */
(function () {
  "use strict";

  const CONTROL_GROUP_RATIO = 0.17; // ~15%–20% de la audiencia

  const els = {
    notice: document.getElementById("demo-notice"),
    initError: document.getElementById("cf-init-error"),
    wizardWrap: document.getElementById("cf-wizard-wrap"),
    form: document.getElementById("campaign-form"),
    name: document.getElementById("cf-name"),
    objective: document.getElementById("cf-objective"),
    audience: document.getElementById("cf-audience"),
    audienceHint: document.getElementById("cf-audience-hint"),
    customerName: document.getElementById("cf-customer-name"),
    favoriteProduct: document.getElementById("cf-favorite-product"),
    generateBtn: document.getElementById("cf-generate-btn"),
    generateStatus: document.getElementById("cf-generate-status"),
    message: document.getElementById("cf-message"),
    channelGroup: document.getElementById("cf-channel-group"),
    timingGroup: document.getElementById("cf-timing-group"),
    scheduleFields: document.getElementById("cf-schedule-fields"),
    date: document.getElementById("cf-date"),
    time: document.getElementById("cf-time"),
    formError: document.getElementById("cf-form-error"),
    submit: document.getElementById("cf-submit"),
    reachValue: document.getElementById("cf-reach-value"),
    controlValue: document.getElementById("cf-control-value"),
    summaryObjective: document.getElementById("cf-summary-objective"),
    summaryChannel: document.getElementById("cf-summary-channel"),
    summaryTiming: document.getElementById("cf-summary-timing"),
    cmpLoading: document.getElementById("cmp-loading"),
    cmpContent: document.getElementById("cmp-content"),
    cmpError: document.getElementById("cmp-error"),
    cmpRetry: document.getElementById("cmp-retry"),
    cmpTbody: document.getElementById("cmp-tbody"),
  };

  let audiencesById = {};
  let selectedChannel = "WhatsApp";
  let selectedTiming = "now";

  function statusBadgeClass(status) {
    if (status === "activa") return "rt-badge--available";
    if (status === "programada") return "rt-badge--soon";
    if (status === "finalizada") return "rt-badge--neutral";
    return "rt-badge--neutral";
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  /* ============ Poblar catálogos ============ */
  function populateSelects() {
    const objectives = (window.GP_DATA && window.GP_DATA.campaignObjectives) || [];
    const audiences = (window.GP_DATA && window.GP_DATA.campaignAudiences) || [];

    objectives.forEach((obj) => {
      const opt = document.createElement("option");
      opt.value = obj.id;
      opt.textContent = obj.label;
      els.objective.append(opt);
    });

    audiences.forEach((aud) => {
      audiencesById[aud.id] = aud;
      const opt = document.createElement("option");
      opt.value = aud.id;
      opt.textContent = `${aud.label} (${aud.size})`;
      els.audience.append(opt);
    });
  }

  /* ============ Resumen en vivo (alcance / grupo de control) ============ */
  function updateSummary() {
    const audience = audiencesById[els.audience.value];
    if (audience) {
      els.reachValue.textContent = audience.size.toLocaleString("es-CL");
      const control = Math.round(audience.size * CONTROL_GROUP_RATIO);
      els.controlValue.textContent = control.toLocaleString("es-CL");
      els.audienceHint.textContent = `Alcance estimado: ${audience.size.toLocaleString("es-CL")} clientes.`;
    } else {
      els.reachValue.textContent = "—";
      els.controlValue.textContent = "—";
      els.audienceHint.textContent = "El alcance estimado aparece en el resumen →";
    }

    const objOption = els.objective.options[els.objective.selectedIndex];
    els.summaryObjective.textContent = els.objective.value ? objOption.textContent : "—";
    els.summaryChannel.textContent = selectedChannel;
    els.summaryTiming.textContent = selectedTiming === "now" ? "Ahora" : "Programado";
  }

  /* ============ Toggle: canal ============ */
  function initChannelToggle() {
    els.channelGroup.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        els.channelGroup.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        selectedChannel = btn.dataset.channel;
        updateSummary();
      });
    });
  }

  /* ============ Toggle: envío ahora / programar ============ */
  function initTimingToggle() {
    els.timingGroup.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        els.timingGroup.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        selectedTiming = btn.dataset.timing;
        els.scheduleFields.hidden = selectedTiming !== "schedule";
        if (selectedTiming === "schedule" && !els.date.value) {
          const d = new Date();
          d.setDate(d.getDate() + 3);
          els.date.value = d.toISOString().slice(0, 10);
          els.time.value = "12:00";
        }
        updateSummary();
      });
    });
  }

  /* ============ Generar mensaje con IA ============ */
  function initGenerate() {
    els.generateBtn.addEventListener("click", () => {
      if (!els.objective.value) {
        els.generateStatus.textContent = "Selecciona un objetivo antes de generar el mensaje.";
        return;
      }
      if (!window.GrowthPlatformAPI) {
        els.generateStatus.textContent = "No se pudo generar el mensaje.";
        return;
      }
      els.generateBtn.disabled = true;
      els.generateStatus.textContent = "Generando mensaje con IA…";
      window.GrowthPlatformAPI
        .generateCampaignCopy(els.objective.value, els.customerName.value.trim(), els.favoriteProduct.value.trim())
        .then((text) => {
          els.message.value = text;
          els.generateStatus.textContent = "Mensaje generado — puedes editarlo antes de enviar.";
        })
        .catch(() => {
          els.generateStatus.textContent = "No se pudo generar el mensaje. Intenta de nuevo.";
        })
        .finally(() => {
          els.generateBtn.disabled = false;
        });
    });
  }

  /* ============ Tabla de campañas ============ */
  function renderRow(campaign) {
    const tr = document.createElement("tr");
    tr.dataset.campaignId = campaign.id;
    tr.innerHTML = `
      <td data-label="Nombre"><strong>${campaign.name}</strong></td>
      <td data-label="Objetivo">${campaign.objective}</td>
      <td data-label="Audiencia">${campaign.audience}</td>
      <td data-label="Canal">${campaign.channel}</td>
      <td data-label="Estado"><span class="rt-badge ${statusBadgeClass(campaign.status)}">${campaign.status}</span></td>
      <td data-label="Enviados" class="rt-table__center" data-cell="sent">${campaign.sent.toLocaleString("es-CL")}</td>
      <td data-label="Abiertos" class="rt-table__center" data-cell="opened">${campaign.opened.toLocaleString("es-CL")}</td>
      <td data-label="Convertidos" class="rt-table__center" data-cell="converted">${campaign.converted.toLocaleString("es-CL")}</td>
      <td data-label="Grupo control" class="rt-table__center">${(campaign.controlGroup || 0).toLocaleString("es-CL")}</td>
      <td data-label="Ingresos" data-cell="revenue">${window.RTFormat.clp(campaign.revenue)}</td>
    `;
    return tr;
  }

  function loadCampaigns() {
    els.cmpLoading.hidden = false;
    els.cmpContent.hidden = true;
    els.cmpError.hidden = true;

    if (!window.GrowthPlatformAPI) {
      els.cmpLoading.hidden = true;
      els.cmpError.hidden = false;
      return;
    }

    window.GrowthPlatformAPI.getCampaigns()
      .then((campaigns) => {
        els.cmpTbody.innerHTML = "";
        campaigns.forEach((c) => els.cmpTbody.append(renderRow(c)));
        els.cmpLoading.hidden = true;
        els.cmpContent.hidden = false;
      })
      .catch(() => {
        els.cmpLoading.hidden = true;
        els.cmpError.hidden = false;
      });
  }

  /* ============ Simular resultados de una campaña recién creada ============ */
  function simulateResults(campaign, audienceSize) {
    const row = els.cmpTbody.querySelector(`tr[data-campaign-id="${campaign.id}"]`);
    if (!row) return;

    const sent = audienceSize;
    const opened = Math.round(sent * randomBetween(0.55, 0.75));
    const converted = Math.round(opened * randomBetween(0.25, 0.45));
    const revenue = Math.round(converted * randomBetween(9000, 22000));

    const sentCell = row.querySelector('[data-cell="sent"]');
    const openedCell = row.querySelector('[data-cell="opened"]');
    const convertedCell = row.querySelector('[data-cell="converted"]');
    const revenueCell = row.querySelector('[data-cell="revenue"]');
    if (sentCell) sentCell.textContent = sent.toLocaleString("es-CL");
    if (openedCell) openedCell.textContent = opened.toLocaleString("es-CL");
    if (convertedCell) convertedCell.textContent = converted.toLocaleString("es-CL");
    if (revenueCell) revenueCell.textContent = window.RTFormat.clp(revenue);

    window.RTToast.show(`Resultados simulados para "${campaign.name}" listos.`, "success");
  }

  /* ============ Envío del formulario ============ */
  function validateForm() {
    if (!els.name.value.trim()) return "Ingresa un nombre para la campaña.";
    if (!els.objective.value) return "Selecciona un objetivo.";
    if (!els.audience.value) return "Selecciona una audiencia.";
    if (!els.message.value.trim()) return "Escribe o genera un mensaje.";
    if (selectedTiming === "schedule" && (!els.date.value || !els.time.value)) return "Indica fecha y hora de envío.";
    return null;
  }

  function resetForm() {
    els.form.reset();
    els.channelGroup.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.channel === "WhatsApp" ? "true" : "false"));
    els.timingGroup.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.timing === "now" ? "true" : "false"));
    selectedChannel = "WhatsApp";
    selectedTiming = "now";
    els.scheduleFields.hidden = true;
    els.generateStatus.textContent = "";
    updateSummary();
  }

  function initForm() {
    els.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const error = validateForm();
      els.formError.hidden = !error;
      els.formError.textContent = error || "";
      if (error) return;

      const audience = audiencesById[els.audience.value];
      const objectiveLabel = els.objective.options[els.objective.selectedIndex].textContent;
      const audienceLabel = `${audience.label} (${audience.size})`;
      const controlGroup = Math.round(audience.size * CONTROL_GROUP_RATIO);
      const sendNow = selectedTiming === "now";
      const scheduledFor = sendNow ? new Date().toISOString() : new Date(`${els.date.value}T${els.time.value}`).toISOString();

      const payload = {
        name: els.name.value.trim(),
        objective: objectiveLabel,
        audience: audienceLabel,
        channel: selectedChannel,
        message: els.message.value.trim(),
        controlGroup: controlGroup,
        sendNow: sendNow,
        scheduledFor: scheduledFor,
      };

      els.submit.disabled = true;
      els.submit.textContent = "Creando campaña…";

      window.GrowthPlatformAPI.createCampaign(payload)
        .then((campaign) => {
          window.RTToast.show(sendNow ? "Campaña creada y enviada. Simulando resultados…" : "Campaña programada correctamente.", "success");
          els.cmpTbody.prepend(renderRow(campaign));
          resetForm();
          if (sendNow) {
            setTimeout(() => simulateResults(campaign, audience.size), 1000);
          }
        })
        .catch(() => {
          els.formError.hidden = false;
          els.formError.textContent = "No se pudo crear la campaña. Intenta de nuevo.";
        })
        .finally(() => {
          els.submit.disabled = false;
          els.submit.textContent = "Crear campaña";
        });
    });
  }

  function init() {
    if (!window.GP_DATA || !window.GrowthPlatformAPI) {
      els.wizardWrap.hidden = true;
      els.cmpLoading.hidden = true;
      els.initError.hidden = false;
      return;
    }

    els.notice.textContent = window.GP_DATA.demoNotice;
    populateSelects();
    updateSummary();
    initChannelToggle();
    initTimingToggle();
    initGenerate();
    initForm();
    loadCampaigns();

    els.objective.addEventListener("change", updateSummary);
    els.audience.addEventListener("change", updateSummary);
    els.cmpRetry && els.cmpRetry.addEventListener("click", loadCampaigns);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
