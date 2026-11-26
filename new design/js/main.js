/* =========================================================
   SKRINE — Shared site interactions
   - Header state, top-nav dropdowns, search toggle
   - 3D coverflow carousel (Legal Updates)
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
    // smooth scrolling eases out in tiny (sometimes zero or sub-pixel) steps: only act on a
    // real movement, or the header flickers between shown and hidden at the end of each glide
    if (Math.abs(y - lastY) < 6 && y > 0) return;
    var goingDown = y > lastY && y > 300;
    var menuOpen = !!document.querySelector(".nav-item.is-open") || header.classList.contains("nav-open");
    var hide = goingDown && !menuOpen;
    header.classList.toggle("is-hidden", hide);
    // pinned bars and sidebars move up into the space the header leaves
    document.body.classList.toggle("header-hidden", hide);
    lastY = y;
  }

  /* ---------- Top-nav dropdowns ----------
     Hover opens them on desktop (CSS); the buttons toggle them for
     touch and keyboard users. */
  var navItems = document.querySelectorAll(".nav-item.has-menu");

  function closeMenus(except) {
    navItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove("is-open");
      var t = item.querySelector(".nav-trigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  navItems.forEach(function (item) {
    var trigger = item.querySelector(".nav-trigger");
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !item.classList.contains("is-open");
      closeMenus(item);
      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    });
    // leaving the menu with the keyboard closes it
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item.has-menu")) closeMenus();
  });

  /* ---------- Burger (tablet & phone) ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function setNav(open) {
    header.classList.toggle("nav-open", open);
    document.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) closeMenus();
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      setNav(!header.classList.contains("nav-open"));
    });
    // following a link closes the panel
    primaryNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    // back to desktop width: reset
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".nav-item.is-open .nav-trigger");
      closeMenus();
      if (open) open.focus();
      if (header.classList.contains("nav-open")) { setNav(false); navToggle.focus(); }
      if (searchBar.classList.contains("is-open")) {
        if (searchBar.contains(document.activeElement)) searchToggle.focus();
        searchBar.classList.remove("is-open");
        hideSuggest();
      }
    }
  });

  /* ---------- Search ----------
     Enter (or the arrow) opens search.html?q=…; while typing, the best few
     matches appear under the bar. The search index and the data files it
     reads (js/search-index.js) load the first time the bar is opened. */
  var searchToggle = document.getElementById("searchToggle");
  var searchBar = document.getElementById("searchBar");
  var searchInput = searchBar.querySelector("input");
  searchToggle.addEventListener("click", function () {
    var open = searchBar.classList.toggle("is-open");
    if (open) { loadSearch(); setTimeout(function () { searchInput.focus(); }, 200); }
    else hideSuggest();
  });

  // the "new design" folder, worked out from this script's own address (the home page lives one level up)
  var SEARCH_CFG = window.SKRINE_SEARCH || {};
  var ME = document.currentScript && document.currentScript.src;
  var SITE_ROOT = SEARCH_CFG.root || (ME ? new URL("../", ME).href : "");
  var SEARCH_PAGE = SEARCH_CFG.page || SITE_ROOT + "search.html";
  function siteUrl(href) { return SITE_ROOT ? new URL(href, SITE_ROOT).href : href; }

  function searchUrl(q) { return SEARCH_PAGE + (q ? "?q=" + encodeURIComponent(q) : ""); }

  searchBar.addEventListener("submit", function (e) {
    e.preventDefault();
    var act = activeOption();
    location.href = act ? act.querySelector("a").href : searchUrl(searchInput.value.trim());
  });

  // load the index and any data files this page doesn't already have
  var SEARCH_FILES = [
    ["SKRINE_PEOPLE", "people-data"], ["SKRINE_PRACTICES", "practice-data"], ["SKRINE_SECTORS", "sector-data"],
    ["SKRINE_ALERTS", "alerts-data"], ["SKRINE_ALERTS_FULL", "alerts-full-data"], ["SKRINE_NEWS", "news-data"],
    ["SKRINE_NEWS_FULL", "news-full-data"], ["SKRINE_PUBLICATIONS", "publications-data"],
    ["SKRINE_LIFE", "life-data"], ["SKRINE_JOBS", "jobs-data"], ["SkrineSearch", "search-index"],
  ];
  // on WordPress, SKRINE_SEARCH.files gives the latest content's addresses and .js the theme's js folder
  var JS_DIR = SEARCH_CFG.js || SITE_ROOT + "js/";
  var searchLoad = null;
  function loadSearch() {
    if (searchLoad) return searchLoad;
    searchLoad = new Promise(function (resolve) {
      var urls = [];
      SEARCH_FILES.forEach(function (f) {
        if (window[f[0]]) return;
        var u = (SEARCH_CFG.files && SEARCH_CFG.files[f[0]]) || JS_DIR + f[1] + ".js";
        if (urls.indexOf(u) === -1) urls.push(u); // one WordPress file can hold two of these
      });
      var left = urls.length;
      if (!left) { resolve(); return; }
      urls.forEach(function (u) {
        var s = document.createElement("script");
        s.src = u;
        s.async = false; // run in this order: the index comes last
        s.onload = s.onerror = function () { if (--left === 0) resolve(); };
        document.body.appendChild(s);
      });
    });
    return searchLoad;
  }

  /* suggestions: a list box under the bar, moved through with the arrow keys */
  var suggest = document.createElement("div");
  suggest.className = "search-suggest";
  suggest.hidden = true;
  var suggestList = document.createElement("ul");
  suggestList.id = "searchSuggestList";
  suggestList.setAttribute("role", "listbox");
  suggestList.setAttribute("aria-label", "Suggestions");
  suggest.appendChild(suggestList);
  searchBar.appendChild(suggest);
  searchInput.setAttribute("role", "combobox");
  searchInput.setAttribute("aria-autocomplete", "list");
  searchInput.setAttribute("aria-controls", "searchSuggestList");
  searchInput.setAttribute("aria-expanded", "false");
  searchInput.setAttribute("autocomplete", "off");

  function hideSuggest() {
    suggest.hidden = true;
    searchBar.classList.remove("has-suggest");
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }
  function options() { return suggestList.querySelectorAll('[role="option"]'); }
  function activeOption() { return suggest.hidden ? null : suggestList.querySelector(".is-active"); }
  function setActive(i) {
    var opts = options();
    opts.forEach(function (o, k) { o.classList.toggle("is-active", k === i); o.setAttribute("aria-selected", String(k === i)); });
    if (opts[i]) { searchInput.setAttribute("aria-activedescendant", opts[i].id); opts[i].scrollIntoView({ block: "nearest" }); }
    else searchInput.removeAttribute("aria-activedescendant");
  }

  function option(id, href, cls) {
    var li = document.createElement("li");
    li.id = id;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    if (cls) li.className = cls;
    var a = document.createElement("a");
    a.href = href;
    a.tabIndex = -1;
    li.appendChild(a);
    return li;
  }

  function showSuggest() {
    var q = searchInput.value.trim();
    var S = window.SkrineSearch;
    if (!q || !S) { hideSuggest(); return; }
    var hits = S.search(q);
    var re = S.marker(q);
    suggestList.textContent = "";
    hits.slice(0, 6).forEach(function (it, i) {
      var li = option("sugg-" + i, siteUrl(it.href));
      var a = li.firstChild;
      var ic = document.createElement("span");
      ic.className = "suggest-icon";
      var fa = document.createElement("i");
      fa.className = S.TYPES[it.type].icon;
      fa.setAttribute("aria-hidden", "true");
      ic.appendChild(fa);
      a.appendChild(ic);
      var txt = document.createElement("span");
      txt.className = "suggest-text";
      var title = document.createElement("span");
      title.className = "suggest-title";
      S.highlight(title, it.title, re);
      var meta = document.createElement("span");
      meta.className = "suggest-meta";
      meta.textContent = [S.TYPES[it.type].one, it.meta, it.date ? S.shortDate(it.date) : ""].filter(Boolean).join(" · ");
      txt.appendChild(title);
      txt.appendChild(meta);
      a.appendChild(txt);
      suggestList.appendChild(li);
    });
    var all = option("sugg-all", searchUrl(q), "suggest-all");
    all.firstChild.textContent = hits.length
      ? "See all " + hits.length + (hits.length === 1 ? " result" : " results") + " for “" + q + "”"
      : "No quick matches for “" + q + "”. Search the whole site";
    var arrow = document.createElement("i");
    arrow.className = "fa-solid fa-arrow-right";
    arrow.setAttribute("aria-hidden", "true");
    all.firstChild.appendChild(arrow);
    suggestList.appendChild(all);
    suggest.hidden = false;
    searchBar.classList.add("has-suggest");
    searchInput.setAttribute("aria-expanded", "true");
    setActive(-1);
  }

  var suggestTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(function () { loadSearch().then(showSuggest); }, 120);
  });
  searchInput.addEventListener("focus", function () { loadSearch().then(function () { if (searchInput.value.trim()) showSuggest(); }); });
  searchInput.addEventListener("keydown", function (e) {
    var opts = options();
    if (suggest.hidden || !opts.length) return;
    var cur = Array.prototype.indexOf.call(opts, activeOption());
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(cur + 1 >= opts.length ? 0 : cur + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(cur <= 0 ? opts.length - 1 : cur - 1); }
    else if (e.key === "Escape") { e.stopPropagation(); hideSuggest(); }
  });
  // clicking or tabbing away closes the suggestions
  document.addEventListener("click", function (e) { if (!searchBar.contains(e.target)) hideSuggest(); });
  searchBar.addEventListener("focusout", function (e) { if (!searchBar.contains(e.relatedTarget)) hideSuggest(); });

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
      // reveal once the top edge is well on screen; a share-of-element threshold never fires for
      // sections taller than the screen (e.g. a long grid on a small laptop), leaving them blank
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
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

  /* ---------- 3D coverflow carousel (any .carousel on the page) ---------- */
  document.querySelectorAll(".carousel").forEach(initCarousel);

  function initCarousel(carousel) {
    var cards = Array.prototype.slice.call(carousel.querySelectorAll(".slide-card"));
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
      b.setAttribute("aria-label", "Slide " + (i + 1));
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
