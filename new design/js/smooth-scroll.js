/* =========================================================
   SKRINE — Smooth scrolling (every page)
   Loaded by js/design.js. Uses Lenis (js/vendor/lenis.min.js,
   v1.1.20, MIT licence): mouse-wheel and trackpad scrolling glide
   with momentum instead of jumping a step at a time.

   - The page still scrolls natively underneath, so sticky elements,
     scroll-driven effects and window.scrollTo() all keep working.
   - Touch screens keep their own native scrolling (Lenis default).
   - Off for people who prefer reduced motion.
   - Anything that scrolls on its own (menus, pop-ups, carousels,
     lists inside a panel) scrolls normally, not the page behind it.
   - Paused while a pop-up is open (body.modal-open or an open dialog).
   ========================================================= */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // an element under the pointer that can scroll the way the wheel is going keeps the wheel
  function scrollsItself(node) {
    for (var el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      if (el.hasAttribute && el.hasAttribute("data-lenis-prevent")) return true;
      if (el.tagName === "DIALOG" && el.open) return true;
      var cs = getComputedStyle(el);
      var y = cs.overflowY, x = cs.overflowX;
      if ((y === "auto" || y === "scroll") && el.scrollHeight > el.clientHeight + 1) return true;
      if ((x === "auto" || x === "scroll") && el.scrollWidth > el.clientWidth + 1) return true;
    }
    return false;
  }

  function start() {
    if (!window.Lenis) return;
    // Lenis replaces the browser's own smooth scroll
    document.documentElement.style.scrollBehavior = "auto";

    var lenis = new window.Lenis({
      duration: 1.15,                                   // how long each glide lasts
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      wheelMultiplier: 1,
      smoothWheel: true,
      anchors: { offset: -90 },                         // in-page links (#section) glide too, clear of the header
      prevent: scrollsItself
    });
    window.SkrineLenis = lenis;

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // pause while a pop-up is open
    function sync() {
      var open = document.body.classList.contains("modal-open") || !!document.querySelector("dialog[open]");
      if (open) lenis.stop(); else lenis.start();
    }
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: false });
    document.addEventListener("close", sync, true);
    document.addEventListener("toggle", sync, true);

    // content that grows or shrinks (filters, "Load more", accordions) keeps the scroll limits right
    if (window.ResizeObserver) new ResizeObserver(function () { lenis.resize(); }).observe(document.body);
  }

  var src = (document.currentScript && document.currentScript.src) || "";
  var s = document.createElement("script");
  s.src = src ? new URL("vendor/lenis.min.js", src).href : "js/vendor/lenis.min.js";
  s.onload = function () {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  };
  document.head.appendChild(s);
})();
