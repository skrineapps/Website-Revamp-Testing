/* =========================================================
   SKRINE — Design switch (review aid)
   Loaded in <head> on every page, before anything is drawn.

   The site has eight looks. Pick one on any page (the "Design" pill,
   bottom right) and every page after that uses it:
     Design 1  the current painted look (no extra class)
     Design 2  ribbons        html.skin-2.themed
     Design 3  artistic       html.skin-3.themed
     Design 4  songket        html.skin-4.themed
     Design 5  steps          html.skin-5.themed  (Batu Caves stairs)
     Design 6  peaks          html.skin-6.themed  (misty karst mountains)
     Design 7  steel          html.skin-7.themed  (brushed corrugated steel)
     Design 8  bridge         html.skin-8.themed  (cable-stayed bridge at sunrise)
   The looks live in css/themes.css; every page keeps one copy of its markup.

   - ?design=N in the address picks a look; the choice is remembered for
     the rest of the visit (sessionStorage), so a shared link or a click on
     the pill carries through the whole site.
   - Pages with more than one layout (People, Practice Areas, Profile) list
     them in their own <nav class="layout-switch">. The layout pill sits
     above the design pill; switching layout keeps the chosen design.
   ========================================================= */
(function () {
  var KEY = "skrine-design";
  var SKINS = ["1", "2", "3", "4", "5", "6", "7", "8"];
  var html = document.documentElement;
  var params = new URLSearchParams(location.search);
  var asked = params.get("design");
  if (SKINS.indexOf(asked) < 0) asked = null;

  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked: the address still works */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return SKINS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }

  if (asked) remember(asked);
  var skin = asked || recall() || "1";
  if (skin !== "1") { html.classList.add("skin-" + skin); html.classList.add("themed"); }
  window.SKRINE_DESIGN = skin;

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
