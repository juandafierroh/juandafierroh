/**
 * rt- Components
 * ------------------------------------------------------------------
 * Comportamiento genérico de componentes de interfaz reutilizables:
 * tabs, acordeón, modal, tooltip, toast y utilidades de formato
 * chileno (CLP, teléfono, RUT). Se activa automáticamente al cargar
 * cualquier página que incluya este script.
 *
 * Convención: todo el comportamiento se activa mediante atributos
 * `data-rt-*`, nunca lógica de negocio embebida en el HTML.
 */

(function () {
  "use strict";

  /* ============ Formato chileno (RTFormat) ============ */
  const currencyFormatter = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const RTFormat = {
    clp(value) {
      return currencyFormatter.format(Math.round(value || 0));
    },
    phone(raw) {
      const digits = String(raw || "").replace(/\D/g, "");
      if (digits.length < 9) return raw;
      const last9 = digits.slice(-9);
      return `+56 9 ${last9.slice(1, 5)} ${last9.slice(5)}`;
    },
    date(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
    dateTime(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      return `${this.date(iso)} · ${d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`;
    },
    // Validación visual simulada de RUT chileno (módulo 11). No consulta al SII.
    isValidRut(rut) {
      const clean = String(rut || "").replace(/[.\-]/g, "").toUpperCase();
      if (!/^[0-9]{7,8}[0-9K]$/.test(clean)) return false;
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1);
      let sum = 0;
      let mul = 2;
      for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * mul;
        mul = mul === 7 ? 2 : mul + 1;
      }
      const res = 11 - (sum % 11);
      const expected = res === 11 ? "0" : res === 10 ? "K" : String(res);
      return dv === expected;
    },
  };
  window.RTFormat = RTFormat;

  /* ============ Toast ============ */
  function ensureToastRegion() {
    let region = document.querySelector(".rt-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "rt-toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
    }
    return region;
  }

  const RTToast = {
    show(message, type) {
      const region = ensureToastRegion();
      const toast = document.createElement("div");
      toast.className = "rt-toast" + (type ? ` rt-toast--${type}` : "");
      toast.setAttribute("role", "status");
      toast.textContent = message;
      region.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 200ms ease";
        setTimeout(() => toast.remove(), 220);
      }, 3600);
    },
  };
  window.RTToast = RTToast;

  /* ============ Navegación móvil ============ */
  function initMobileNav() {
    const toggle = document.querySelector("[data-rt-nav-toggle]");
    const nav = document.querySelector("[data-rt-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ============ Tabs ============ */
  function initTabs() {
    document.querySelectorAll("[data-rt-tabs]").forEach((group) => {
      const buttons = Array.from(group.querySelectorAll("[data-rt-tab-btn]"));
      const panels = Array.from(group.querySelectorAll("[data-rt-tab-panel]"));
      function select(name) {
        buttons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.rtTabBtn === name)));
        panels.forEach((p) => {
          const match = p.dataset.rtTabPanel === name;
          p.hidden = !match;
        });
      }
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => select(btn.dataset.rtTabBtn));
        btn.addEventListener("keydown", (e) => {
          const idx = buttons.indexOf(btn);
          if (e.key === "ArrowRight") buttons[(idx + 1) % buttons.length].focus();
          if (e.key === "ArrowLeft") buttons[(idx - 1 + buttons.length) % buttons.length].focus();
        });
      });
      const active = buttons.find((b) => b.getAttribute("aria-selected") === "true") || buttons[0];
      if (active) select(active.dataset.rtTabBtn);
    });
  }

  /* ============ Acordeón ============ */
  function initAccordion() {
    document.querySelectorAll("[data-rt-accordion-trigger]").forEach((trigger) => {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : trigger.parentElement.querySelector("[data-rt-accordion-panel]");
      if (!panel) return;
      trigger.addEventListener("click", () => {
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        panel.dataset.open = String(!expanded);
      });
    });
  }

  /* ============ Modal ============ */
  let lastFocusedBeforeModal = null;
  function openModal(modal) {
    lastFocusedBeforeModal = document.activeElement;
    modal.hidden = false;
    const focusable = modal.querySelector("[data-rt-modal-autofocus]") || modal.querySelector("button, a, input, select, textarea");
    if (focusable) focusable.focus();
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedBeforeModal) lastFocusedBeforeModal.focus();
  }
  function initModals() {
    document.querySelectorAll("[data-rt-modal-open]").forEach((trigger) => {
      const modal = document.getElementById(trigger.getAttribute("data-rt-modal-open"));
      if (!modal) return;
      trigger.addEventListener("click", () => openModal(modal));
    });
    document.querySelectorAll("[data-rt-modal]").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
      modal.querySelectorAll("[data-rt-modal-close]").forEach((btn) => btn.addEventListener("click", () => closeModal(modal)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) closeModal(modal);
      });
    });
  }
  window.RTModal = { open: openModal, close: closeModal };

  /* ============ Switcher Conecta / POS Lite ============ */
  function initSwitcher() {
    document.querySelectorAll("[data-rt-switcher]").forEach((group) => {
      const buttons = Array.from(group.querySelectorAll("[data-rt-switcher-btn]"));
      const targets = document.querySelectorAll("[data-rt-switcher-target]");
      function select(mode, persist) {
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rtSwitcherBtn === mode)));
        targets.forEach((t) => {
          t.hidden = t.dataset.rtSwitcherTarget !== mode;
        });
        if (persist) {
          try { localStorage.setItem("rt-mode", mode); } catch (e) { /* almacenamiento no disponible */ }
        }
      }
      buttons.forEach((btn) => btn.addEventListener("click", () => select(btn.dataset.rtSwitcherBtn, true)));
      let initial = buttons[0] ? buttons[0].dataset.rtSwitcherBtn : null;
      try {
        const saved = localStorage.getItem("rt-mode");
        if (saved && buttons.some((b) => b.dataset.rtSwitcherBtn === saved)) initial = saved;
      } catch (e) { /* almacenamiento no disponible */ }
      if (initial) select(initial, false);
    });
  }

  /* ============ Filtro de tablas/tarjetas por etiqueta ============ */
  function initFilters() {
    document.querySelectorAll("[data-rt-filter-group]").forEach((group) => {
      const groupName = group.dataset.rtFilterGroup;
      const buttons = Array.from(group.querySelectorAll("[data-rt-filter-btn]"));
      const items = document.querySelectorAll(`[data-rt-filter-scope="${groupName}"] [data-rt-filter-tags]`);
      function apply(value) {
        buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rtFilterBtn === value)));
        items.forEach((item) => {
          const tags = (item.dataset.rtFilterTags || "").split(" ");
          const show = value === "todos" || tags.includes(value);
          item.hidden = !show;
        });
      }
      buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.rtFilterBtn)));
      apply("todos");
    });
  }

  /* ============ Inicialización ============ */
  document.addEventListener("DOMContentLoaded", () => {
    initMobileNav();
    initTabs();
    initAccordion();
    initModals();
    initSwitcher();
    initFilters();
  });
})();
