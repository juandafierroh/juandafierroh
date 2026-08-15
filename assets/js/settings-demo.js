/**
 * rt- Settings Demo (demo/settings.html)
 * ------------------------------------------------------------------
 * Comportamiento propio de la pantalla de configuración, más allá del
 * cambio de pestañas (que ya resuelve components.js vía data-rt-tabs):
 * botones "Guardar cambios" (simulados) y el agregador de preguntas
 * frecuentes.
 */

(function () {
  "use strict";

  const STATUS_BADGE = {
    conectado: { cls: "available", label: "Conectado" },
    sincronizando: { cls: "integration", label: "Sincronizando" },
    "con-error": { cls: "error", label: "Con error" },
    "no-disponible": { cls: "neutral", label: "No disponible" },
  };

  let faqCount = 3;

  function initSaveButtons() {
    document.querySelectorAll("[data-rt-settings-save]").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.RTToast.show("Cambios guardados (simulado)", "success");
      });
    });
  }

  function initFaqAdd() {
    const addBtn = document.getElementById("faq-add-btn");
    const list = document.getElementById("faq-list");
    if (!addBtn || !list) return;
    addBtn.addEventListener("click", () => {
      faqCount += 1;
      const row = document.createElement("div");
      row.className = "rt-faq-item";
      row.setAttribute("data-faq-row", "");
      row.style.borderBottom = "1px solid var(--color-border)";
      row.style.paddingBottom = "1rem";
      row.style.marginBottom = "1.1rem";
      row.innerHTML = `
        <div class="rt-field">
          <label for="faq-q-${faqCount}">Pregunta ${faqCount}</label>
          <input type="text" id="faq-q-${faqCount}" placeholder="Escribe la nueva pregunta...">
        </div>
        <div class="rt-field" style="margin-bottom:0;">
          <label for="faq-a-${faqCount}">Respuesta ${faqCount}</label>
          <textarea id="faq-a-${faqCount}" placeholder="Escribe la respuesta que debe dar el agente..."></textarea>
        </div>`;
      list.appendChild(row);
      const newInput = document.getElementById(`faq-q-${faqCount}`);
      if (newInput) newInput.focus();
    });
  }

  function renderIntegrationsSummary() {
    const el = document.getElementById("settings-integrations-summary");
    if (!el) return;
    const integrations = (window.RT_DATA && window.RT_DATA.integrations) || [];
    el.innerHTML = integrations
      .map((i) => {
        const badge = STATUS_BADGE[i.status] || { cls: "neutral", label: i.status };
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;padding:0.7rem 0.9rem;background:var(--color-surface-alt);border-radius:var(--radius-sm);">
          <span><strong>${i.name}</strong> <span style="color:var(--color-muted);font-size:0.85rem;">· ${i.category}</span></span>
          <span class="rt-badge rt-badge--${badge.cls}">${badge.label}</span>
        </div>`;
      })
      .join("");
  }

  function init() {
    initSaveButtons();
    initFaqAdd();
    renderIntegrationsSummary();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
