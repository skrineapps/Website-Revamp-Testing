/* =========================================================
   SKRINE — Careers: highlight the chapter in view in the sticky chapter nav
   ========================================================= */
(function () {
  "use strict";
  var links = Array.prototype.slice.call(document.querySelectorAll(".cr-chapters a[href^='#']:not(.cr-chapters-join)"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  function setActive(id) {
    links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (s) { io.observe(s); });
})();
