/* =========================================================
   SKRINE — Design switch (review aid)
   Loaded in <head> on every page, before anything is drawn.

   The site has two looks. Pick one on any page (the "Design" pill,
   bottom right) and every page after that uses it:
     Design 1  arches     html.skin-2.skin-2-5.themed  (white arches and a red ribbon, images/d25/)
     Design 2  heritage   html.skin-9.themed           (grey KL painting, images/d9/)
   The class names are the historical ones (Design 1 was "2.5", built on the
   old Design 2 rules; Design 2 was "9"); the looks live in css/themes.css.
   Both get the immersive home hero (js/hero-immersive.js).

   - ?design=1 or ?design=2 in the address picks a look; the choice is
     remembered for the rest of the visit (sessionStorage), so a shared link
     or a click on the pill carries through the whole site.
   - Pages with more than one layout (People, Practice Areas) list them in
     their own <nav class="layout-switch">, above the design pill.
   - Fixed choices (no pills): every inner page heading uses the animated
     "velvet" effect (js/heading-fx.js), and the practice area pages use the
     design without photos (html.pa-nophoto).
   ========================================================= */
(function () {
  var KEY = "skrine-design";
  var SKINS = ["1", "2"];
  // each design's classes on <html> (names kept from the earlier numbering)
  var CLASSES = { "1": ["skin-2", "skin-2-5"], "2": ["skin-9"] };
  var html = document.documentElement;
  var params = new URLSearchParams(location.search);
  var asked = params.get("design");
  var OLD = { "2.5": "1", "9": "2" };   // links made with the earlier numbers still land on the right look
  if (OLD[asked]) asked = OLD[asked];
  if (SKINS.indexOf(asked) < 0) asked = null;

  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked: the address still works */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return SKINS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }

  if (asked) remember(asked);
  var skin = asked || recall() || "1";
  CLASSES[skin].forEach(function (c) { html.classList.add(c); });
  html.classList.add("themed");
  // the immersive home hero (js/hero-immersive.js)
  html.classList.add("imm");
  window.SKRINE_DESIGN = skin;

  /* ---------- page headings: the animated velvet effect (fixed) ---------- */
  // pages whose heading area is their own (home hero, Career collage, desk photos) are left alone
  var NO_HEADING_ART = { "index.html": 1, "careers.html": 1, "china-desk.html": 1, "india-desk.html": 1 };
  var hereFile = decodeURIComponent(location.pathname.split("/").pop() || "index.html") || "index.html";
  var headMode = "velvet";
  var headingPage = !NO_HEADING_ART[hereFile];

  // practice area pages: the design without the practice photos (fixed)
  var PHOTO_PAGES = { "capabilities.html": 1, "capabilities-classic.html": 1, "practice-area.html": 1, "capabilities-v2.html": 1, "capabilities-tiles.html": 1, "practice-area-v2.html": 1 };
  if (PHOTO_PAGES[hereFile]) html.classList.add("pa-nophoto");
  if (headingPage) { html.classList.add("heading-el"); html.classList.add("el-" + headMode); }
  // the effect lives in js/heading-fx.js
  if (headingPage) {
    var fxSrc = new URL("heading-fx.js", (document.currentScript && document.currentScript.src) || location.href).href;
    var fxScript = document.createElement("script");
    fxScript.src = fxSrc;
    fxScript.defer = true;
    fxScript.setAttribute("data-style", headMode);
    document.head.appendChild(fxScript);
  }

  // smooth scrolling on every page (js/smooth-scroll.js, Lenis)
  (function () {
    var ss = document.createElement("script");
    ss.src = new URL("smooth-scroll.js", (document.currentScript && document.currentScript.src) || location.href).href;
    ss.defer = true;
    document.head.appendChild(ss);
  })();

  function fileOf(path) {
    var f = decodeURIComponent(path.split("#")[0].split("?")[0].split("/").pop() || "");
    return f || "index.html";
  }

  // a link keeps this page's own query (e.g. ?p=name for a profile) and its hash
  function hrefFor(file, design) {
    var url = new URL(file, location.href);
    params.forEach(function (v, k) { if (k !== "design") url.searchParams.set(k, v); });
    if (design) url.searchParams.set("design", design);
    url.hash = location.hash;
    return url.href;
  }
  // the hash can change while reading (e.g. an open practice area), so refresh on use
  function live(a, file, design) {
    a.href = hrefFor(file, design);
    ["pointerdown", "focus"].forEach(function (ev) { a.addEventListener(ev, function () { a.href = hrefFor(file, design); }); });
  }

  function build() {
    var here = fileOf(location.pathname);

    // the site-wide design pill
    var nav = document.createElement("nav");
    nav.className = "design-switch";
    nav.setAttribute("aria-label", "Site design");
    SKINS.forEach(function (s) {
      var a = document.createElement("a");
      a.innerHTML = '<span class="ds-word">Design </span>' + s;
      a.setAttribute("aria-label", "Design " + s);
      if (s === skin) a.setAttribute("aria-current", "true");
      live(a, here, s);
      nav.appendChild(a);
    });
    document.body.appendChild(nav);

    // this page's layouts, if it has any
    var layouts = document.querySelector(".layout-switch");
    if (layouts) {
      layouts.querySelectorAll("a").forEach(function (a) {
        var file = fileOf(a.getAttribute("href"));
        if (file === here) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        live(a, file, null);
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
