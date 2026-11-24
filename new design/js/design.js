/* =========================================================
   SKRINE — Design switch (review aid)
   Loaded in <head> on every page, before anything is drawn.

   The site has nine looks. Pick one on any page (the "Design" pill,
   bottom right) and every page after that uses it:
     Design 1  the current painted look (no extra class)
     Design 2  ribbons        html.skin-2.themed
     Design 3  artistic       html.skin-3.themed
     Design 4  songket        html.skin-4.themed
     Design 5  steps          html.skin-5.themed  (Batu Caves stairs)
     Design 6  peaks          html.skin-6.themed  (misty karst mountains)
     Design 7  steel          html.skin-7.themed  (brushed corrugated steel)
     Design 8  bridge         html.skin-8.themed  (cable-stayed bridge at sunrise)
     Design 9  heritage       html.skin-9.themed  (immersive hero, js/hero-immersive.js)
   The looks live in css/themes.css; every page keeps one copy of its markup.

   - ?design=N in the address picks a look; the choice is remembered for
     the rest of the visit (sessionStorage), so a shared link or a click on
     the pill carries through the whole site.
   - Pages with more than one layout (People, Practice Areas, Profile) list
     them in their own <nav class="layout-switch">. The layout pill sits
     above the design pill; switching layout keeps the chosen design.
   - Heading scenes (inner pages only): the "Heading" pill swaps the art
     behind each page heading between the design's painting and a
     Malaysian scene chosen for that page (images/scenes/, see SCENES).
     ?scene=photo / ?scene=art, remembered for the visit like the design.
   ========================================================= */
(function () {
  var KEY = "skrine-design";
  var SKINS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
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

  /* ---------- heading scenes ---------- */
  // page file -> scene (images/scenes/<scene>.jpg); pages not listed keep the painting
  var SCENES = {
    "people.html": "kl-skyline", "people-fade.html": "kl-skyline", "people-classic.html": "kl-skyline", "profile.html": "kl-skyline",
    "capabilities.html": "sultan-abdul-samad", "capabilities-classic.html": "sultan-abdul-samad", "practice-area.html": "sultan-abdul-samad",
    "sectors.html": "putrajaya", "sector.html": "putrajaya",
    "our-story.html": "melaka",
    "news-events.html": "kl-tower", "news.html": "kl-tower", "alerts.html": "kl-tower", "alert.html": "kl-tower",
    "publications.html": "kl-tower", "archive.html": "kl-tower", "search.html": "kl-tower",
    "contact.html": "kl-skyline", "job.html": "kl-skyline",
    "professional-development.html": "putrajaya", "skrine-dragons.html": "langkawi",
    "sports-social.html": "penang", "social-responsibility.html": "kinabalu", "life-story.html": "penang"
    // china-desk / india-desk keep their own hero photo; kek-lok-si.jpg and batu-caves.jpg are spare
  };
  var SCENE_KEY = "skrine-scene";
  var hereFile = decodeURIComponent(location.pathname.split("/").pop() || "index.html") || "index.html";
  var sceneAsked = params.get("scene");
  if (sceneAsked !== "photo" && sceneAsked !== "art") sceneAsked = null;
  try { if (sceneAsked) sessionStorage.setItem(SCENE_KEY, sceneAsked); } catch (e) {}
  var sceneMode = sceneAsked || (function () { try { return sessionStorage.getItem(SCENE_KEY); } catch (e) { return null; } })() || "art";
  var scene = SCENES[hereFile] || null;
  if (scene && sceneMode === "photo") {
    html.classList.add("scene-on");
    // an absolute URL, so it resolves the same from any stylesheet
    var sceneUrl = new URL("images/scenes/" + scene + ".jpg", (document.currentScript && document.currentScript.src) ? new URL("../", document.currentScript.src) : location.href).href;
    html.style.setProperty("--scene", 'url("' + sceneUrl + '")');
  }

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

    // heading scene pill: inner pages with a scene
    if (scene) {
      var sp = document.createElement("nav");
      sp.className = "scene-switch";
      sp.setAttribute("aria-label", "Heading background");
      sp.innerHTML = '<span class="layout-switch-label">Heading</span>';
      [["art", "Painting"], ["photo", "Malaysia"]].forEach(function (m) {
        var a = document.createElement("a");
        a.textContent = m[1];
        if (m[0] === sceneMode) a.setAttribute("aria-current", "true");
        var set = function () { var u = new URL(hrefFor(here, null)); u.searchParams.set("scene", m[0]); a.href = u.href; };
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
