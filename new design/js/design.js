/* =========================================================
   SKRINE — Design switch (review aid)
   Loaded in <head> on every page, before anything is drawn.

   The site has eleven looks. Pick one on any page (the "Design" pill,
   bottom right) and every page after that uses it:
     Design 1  the current painted look (no extra class)
     Design 2  ribbons        html.skin-2.themed
     Design 2.5 arches        html.skin-2.skin-2-5.themed  (Design 2 with the white arches and red ribbon, images/d25/)
     Design 3  artistic       html.skin-3.themed
     Design 4  songket        html.skin-4.themed
     Design 6  peaks          html.skin-6.themed  (misty karst mountains)
     Design 7  steel          html.skin-7.themed  (brushed corrugated steel)
     Design 9  heritage       html.skin-9.themed  (immersive hero, js/hero-immersive.js)
     Design 10 kuala lumpur   html.skin-9.skin-10.themed  (Design 9 with the KL painting, images/d10/)
   The looks live in css/themes.css; every page keeps one copy of its markup.

   - ?design=N in the address picks a look; the choice is remembered for
     the rest of the visit (sessionStorage), so a shared link or a click on
     the pill carries through the whole site.
   - Pages with more than one layout (People, Practice Areas, Profile) list
     them in their own <nav class="layout-switch">. The layout pill sits
     above the design pill; switching layout keeps the chosen design.
   - Heading style (inner pages only): the "Heading" pill swaps the art
     behind each page heading between the design's painting and one of two
     immersive, animated element styles drawn live in the browser (no photos;
     js/heading-fx.js, css/style.css): silk, velvet.
     ?heading=<style> or ?heading=art,
     remembered for the visit like the design.
   ========================================================= */
(function () {
  var KEY = "skrine-design";
  var SKINS = ["1", "2", "2.5", "3", "4", "6", "7", "9", "10"];   // 5 and 8 removed; numbers kept so links stay the same
  var html = document.documentElement;
  var params = new URLSearchParams(location.search);
  var asked = params.get("design");
  if (SKINS.indexOf(asked) < 0) asked = null;

  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked: the address still works */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return SKINS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }

  if (asked) remember(asked);
  var skin = asked || recall() || "1";
  if (skin !== "1") { html.classList.add("skin-" + skin.replace(".", "-")); html.classList.add("themed"); }
  // Design 2.5 is Design 2 (same ribbon treatments and layout) with its own artwork and cool palette
  if (skin === "2.5") html.classList.add("skin-2");
  // Design 10 is Design 9 (same immersive hero and behaviour) with its own painting and colours
  if (skin === "10") html.classList.add("skin-9");
  // every design gets the immersive home hero (js/hero-immersive.js)
  html.classList.add("imm");
  window.SKRINE_DESIGN = skin;

  /* ---------- heading style: painting or design elements ---------- */
  // pages whose heading area is their own (home hero, Career collage, desk photos) are left alone
  var NO_HEADING_ART = { "index.html": 1, "careers.html": 1, "china-desk.html": 1, "india-desk.html": 1 };
  var HEAD_KEY = "skrine-heading";
  var hereFile = decodeURIComponent(location.pathname.split("/").pop() || "index.html") || "index.html";
  var headAsked = params.get("heading");
  var HEAD_STYLES = [["art", "Painting"], ["silk", "Silk"], ["velvet", "Velvet"]];
  var isStyle = function (v) { return HEAD_STYLES.some(function (h) { return h[0] === v; }); };
  if (!isStyle(headAsked)) headAsked = null;
  try { if (headAsked) sessionStorage.setItem(HEAD_KEY, headAsked); } catch (e) {}
  var headMode = headAsked || (function () { try { var v = sessionStorage.getItem(HEAD_KEY); return isStyle(v) ? v : null; } catch (e) { return null; } })() || "art";
  var headingPage = !NO_HEADING_ART[hereFile];

  // practice area pages are shown without the practice photos (the Photos On/Off pill was dropped after review)
  var PHOTO_PAGES = { "capabilities.html": 1, "capabilities-classic.html": 1, "practice-area.html": 1, "capabilities-v2.html": 1, "capabilities-tiles.html": 1, "practice-area-v2.html": 1 };
  if (PHOTO_PAGES[hereFile]) html.classList.add("pa-nophoto");
  if (headingPage && headMode !== "art") { html.classList.add("heading-el"); html.classList.add("el-" + headMode); }
  // the animated styles live in js/heading-fx.js, loaded only when one is chosen
  if (headingPage && headMode !== "art") {
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

    // heading pill: inner pages only
    if (headingPage) {
      var sp = document.createElement("nav");
      sp.className = "scene-switch";
      sp.setAttribute("aria-label", "Heading style");
      sp.innerHTML = '<span class="layout-switch-label">Heading</span>';
      HEAD_STYLES.forEach(function (m) {
        var a = document.createElement("a");
        a.textContent = m[1];
        if (m[0] === headMode) a.setAttribute("aria-current", "true");
        var set = function () { var u = new URL(hrefFor(here, null)); u.searchParams.delete("scene"); u.searchParams.set("heading", m[0]); a.href = u.href; };
        set();
        ["pointerdown", "focus"].forEach(function (ev) { a.addEventListener(ev, set); });
        sp.appendChild(a);
      });
      document.body.appendChild(sp);
      if (document.querySelector(".layout-switch")) sp.classList.add("is-stacked");
    }

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
