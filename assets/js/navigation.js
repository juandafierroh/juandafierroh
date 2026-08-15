/**
 * rt- Navigation
 * ------------------------------------------------------------------
 * Utilidades de navegación compartidas entre todas las páginas:
 * año dinámico en el footer, resaltado del enlace activo y
 * desplazamiento suave compensando el header fijo.
 */

(function () {
  "use strict";

  function setYear() {
    document.querySelectorAll("[data-rt-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function markActiveLink() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".rt-nav__list a[href], .rt-demo-subnav a[href]").forEach((link) => {
      const href = link.getAttribute("href").split("/").pop().split("#")[0];
      if (href === path) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function smoothAnchorOffset() {
    const header = document.querySelector(".rt-header");
    if (!header) return;
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href").slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    markActiveLink();
    smoothAnchorOffset();
  });
})();
