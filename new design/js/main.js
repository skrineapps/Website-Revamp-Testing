/* =========================================================
   SKRINE — Home page interactions
   - Header state, hamburger drawer, search toggle
   - 3D coverflow carousel for Deals & Transactions
   - Scroll-triggered reveals
   - Subtle 3D tilt on cards
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  var header = document.getElementById("siteHeader");
  var lastY = window.scrollY;

  function onScrollHeader() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    var goingDown = y > lastY && y > 300;
    header.classList.toggle("is-hidden", goingDown && !document.body.classList.contains("drawer-open"));
    lastY = y;
  }

  /* ---------- Drawer ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var drawer = document.getElementById("mobileNav");
  var backdrop = document.getElementById("drawerBackdrop");

  function setDrawer(open) {
    drawer.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    document.body.classList.toggle("drawer-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", function () {
    setDrawer(!drawer.classList.contains("is-open"));
  });
  backdrop.addEventListener("click", function () { setDrawer(false); });
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) setDrawer(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setDrawer(false);
      searchBar.classList.remove("is-open");
    }
  });

  /* ---------- Search ---------- */
  var searchToggle = document.getElementById("searchToggle");
  var searchBar = document.getElementById("searchBar");
  searchToggle.addEventListener("click", function () {
    var open = searchBar.classList.toggle("is-open");
    if (open) setTimeout(function () { searchBar.querySelector("input").focus(); }, 200);
  });

  /* ---------- Scroll handler ---------- */
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      ticking = false;
    });
  }, { passive: true });
  onScrollHeader();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");

  // stagger siblings inside the same grid/list
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var siblings = Array.prototype.filter.call(parent.children, function (c) {
      return c.classList.contains("reveal");
    });
    if (siblings.length > 1) {
      el.style.setProperty("--delay", (siblings.indexOf(el) * 0.1) + "s");
    }
  });

  var io = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  }

  function observeReveal(el) {
    if (io) io.observe(el);
    else el.classList.add("is-visible");
  }
  reveals.forEach(observeReveal);

  /* ---------- Subtle 3D tilt ---------- */
  function attachTilt(card) {
    if (!finePointer || reduceMotion || card.dataset.tiltReady) return;
    card.dataset.tiltReady = "1";
    (function () {
      var max = card.classList.contains("event") ? 3 : 7; // wide rows tilt less
      var glare = document.createElement("span");
      glare.className = "tilt-glare";
      card.appendChild(glare);

      card.addEventListener("mouseenter", function () {
        card.style.transition = "transform 0.15s ease-out, box-shadow 0.4s, background 0.4s, border-color 0.4s";
      });

      card.addEventListener("mousemove", function (e) {
        if (!card.classList.contains("is-visible") && card.classList.contains("reveal")) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * max * 2;
        var ry = (px - 0.5) * max * 2;
        card.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(6px)";
        card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });

      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s, background 0.4s, border-color 0.4s";
        card.style.transform = "";
      });
    })();
  }
  document.querySelectorAll("[data-tilt]").forEach(attachTilt);

  // shared with page scripts that render content later (e.g. people.js)
  window.SkrineFX = { observeReveal: observeReveal, attachTilt: attachTilt };

  /* ---------- Deals: 3D coverflow carousel ---------- */
  var carousel = document.getElementById("dealsCarousel");
  if (carousel) {
    var cards = Array.prototype.slice.call(carousel.querySelectorAll(".deal-card"));
    var dotsWrap = carousel.querySelector(".carousel-dots");
    var stage = carousel.querySelector(".carousel-stage");
    var index = 0;
    var total = cards.length;
    var timer = null;
    var AUTOPLAY_MS = 5000;

    // dots
    var dots = cards.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Deal " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    function spacing() {
      var w = stage.clientWidth;
      if (w < 520) return 150;
      if (w < 900) return 230;
      return 300;
    }

    function render() {
      var gap = spacing();
      cards.forEach(function (card, i) {
        // shortest signed distance in a loop
        var off = i - index;
        if (off > total / 2) off -= total;
        if (off < -total / 2) off += total;

        var abs = Math.abs(off);
        var x = off * gap;
        var z = -abs * 160;
        var ry = reduceMotion ? 0 : -off * 28;
        var scale = abs === 0 ? 1 : 0.88;
        var opacity = abs > 2 ? 0 : abs === 2 ? 0.45 : 1;

        card.style.transform =
          "translateX(" + x + "px) translateZ(" + z + "px) rotateY(" + ry + "deg) scale(" + scale + ")";
        card.style.opacity = opacity;
        card.style.zIndex = String(10 - abs);
        card.style.filter = abs === 0 ? "none" : "grayscale(" + Math.min(abs * 0.4, 0.8) + ")";
        card.classList.toggle("is-active", abs === 0);
        card.classList.toggle("is-far", abs > 2);
        card.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
      });
      dots.forEach(function (d, i) { d.setAttribute("aria-selected", String(i === index)); });
    }

    function go(i) {
      index = (i + total) % total;
      render();
    }

    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, AUTOPLAY_MS);
    }

    carousel.querySelector(".prev").addEventListener("click", function () { go(index - 1); restart(); });
    carousel.querySelector(".next").addEventListener("click", function () { go(index + 1); restart(); });

    // click a side card to bring it forward
    cards.forEach(function (card, i) {
      card.addEventListener("click", function () {
        if (i !== index) { go(i); restart(); }
      });
    });

    // pause on hover / focus
    carousel.addEventListener("mouseenter", function () { clearInterval(timer); });
    carousel.addEventListener("mouseleave", restart);
    carousel.addEventListener("focusin", function () { clearInterval(timer); });

    // keyboard
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(index - 1); restart(); }
      if (e.key === "ArrowRight") { go(index + 1); restart(); }
    });

    // swipe / drag
    var startX = null;
    stage.addEventListener("pointerdown", function (e) { startX = e.clientX; });
    window.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    });

    window.addEventListener("resize", render);
    render();
    restart();
  }
})();
