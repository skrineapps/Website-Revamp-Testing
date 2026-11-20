/* =========================================================
   SKRINE — Design switch (review aid)
   Loaded in <head> on every page, before anything is drawn.

   Design 2 is a site-wide look (css/design2.css, built on the
   warm "ribbons" artwork in images/d2/). It is a class on <html>:
     html.skin-2
   so every page keeps one copy of its markup.

   - ?design=2 / ?design=1 in the address picks the look; the choice
     is remembered for the rest of the visit (sessionStorage), so
     moving around the site stays in the same design.
   - Pages that are another layout of a page (profile-classic) set
     <html data-variant>; they always show the Design 1 look. Pages with <html data-skin="2">
     (People and Practice Areas, all their layouts) always show Design 2.
   - The pill at the bottom right: pages with extra layouts list them in
     their own <nav class="design-switch"> (links to the same page carry
     data-skin="1|2"); every other page gets a Design 1 / Design 2 pill.
   ========================================================= */
(function () {
  var KEY = "skrine-design";
  var html = document.documentElement;
  var variant = html.hasAttribute("data-variant");
  var params = new URLSearchParams(location.search);
  var asked = params.get("design");
  if (asked !== "1" && asked !== "2") asked = null;

  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked: the address still works */ } }
  function recall() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }

  // a page can fix its own look: <html data-skin="2"> (the People pages) always shows Design 2
  // and leaves the visitor's choice for the rest of the site as it was
  var fixed = html.getAttribute("data-skin");
  if (asked && !fixed) remember(asked);
  if (variant) remember("1");
  var skin = fixed || (variant ? "1" : (asked || recall() || "1"));
  if (skin === "2") html.classList.add("skin-2");
  window.SKRINE_DESIGN = skin;

  function fileOf(path) {
    var f = decodeURIComponent(path.split("#")[0].split("?")[0].split("/").pop() || "");
    return f || "index.html";
  }

  // the link keeps this page's own query (e.g. ?p=name for a profile) and hash
  function hrefFor(a) {
    var url = new URL(a.getAttribute("href").split("?")[0], location.href);
    params.forEach(function (v, k) { if (k !== "design") url.searchParams.set(k, v); });
    var s = a.getAttribute("data-skin");
    if (s) url.searchParams.set("design", s);
    url.hash = location.hash;
    return url.href;
  }

  function build() {
    var here = fileOf(location.pathname);
    var nav = document.querySelector(".design-switch");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "design-switch";
      nav.setAttribute("aria-label", "Page design");
      nav.innerHTML = '<a href="' + here + '" data-skin="1">Design 1</a><a href="' + here + '" data-skin="2">Design 2</a>';
      document.body.appendChild(nav);
    }
    nav.querySelectorAll("a").forEach(function (a) {
      var s = a.getAttribute("data-skin");
      var mine = fileOf(a.getAttribute("href")) === here && (!s || s === skin);
      if (mine) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      a.href = hrefFor(a);
      // the hash can change while reading (e.g. an open practice area), so refresh on use
      ["pointerdown", "focus"].forEach(function (ev) { a.addEventListener(ev, function () { a.href = hrefFor(a); }); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
