/* =========================================================
   SKRINE — Design 9 immersive hero (home page only)
   Runs only when Design 9 is chosen (html.skin-9).

   One image: images/d9/heritage.jpg (Sultan Abdul Samad building, the scales
   of justice, the KL skyline). Each value brings the camera closer to the scales.

   Laptop / desktop (wide screen with a mouse):
     the hero pins in place while the page scrolls through it.
     Scrolling moves Wisdom -> Fortitude -> Ingenuity while the photo
     zooms in smoothly; after the third the page carries on as normal.
     Clicking a word scrolls to it. A rail beside the words shows progress.
   Phone / tablet (touch, or narrow):
     scrolling is never hijacked. Swipe across the photo, or tap a word,
     to move between values; a three-step bar shows where you are.

   Value lines are quoted from skrine.com/profile/our-values.
   After the third value the hero settles into the finished look (all three
   words, "Ingenuity." on the red band, the original tagline) and "Our Story"
   pulses once. Scrolling back up (or tapping a word) returns to the values.
   Hover (laptop): a gentle zoom-in and a soft light follow the cursor; the
   photo never slides, so its edges are never shown.
   ========================================================= */
(function () {
  "use strict";
  var html = document.documentElement;
  if (!html.classList.contains("imm")) return;
  var hero = document.querySelector(".hero");
  if (!hero) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = (document.querySelector('link[href*="themes.css"]') || {}).href;
  // every design's own painting: [file under images/, where it sits, where the camera moves in]
  var ART = {
    "1": ["hero-palette.jpg", "50% 50%", "62% 45%"],
    "2": ["d2/ribbons.jpg", "68% 50%", "76% 50%"],
    "2.5": ["d25/arches.jpg", "70% 50%", "78% 50%"],
    "3": ["d3/artistic.jpg", "0% 50%", "20% 58%"],
    "4": ["d4/songket.jpg", "0% 50%", "20% 50%"],
    "6": ["d6/peaks.jpg", "50% 30%", "50% 40%"],
    "7": ["d7/metal.jpg", "50% 0%", "50% 25%"],   // pinned to the top: the image watermark sits low
    "9": ["d9/heritage.jpg", "0% 50%", "30% 52%"],   // clock tower, Twin Towers, Merdeka 118
    "10": ["d10/kl.jpg", "0% 50%", "30% 52%"]
  };
  var art = ART[window.SKRINE_DESIGN] || ART["1"];
  var IMG = BASE ? BASE.replace(/css\/themes\.css.*$/, "images/") : "new%20design/images/";
  var PHOTO = art[0];
  var ORIGIN = art[2];
  var VALUES = [
    { zoom: 1.0, line: "We believe that wisdom comes from being open to learning." },
    { zoom: 1.16, line: "Just ‘good’ is never good enough — we strive for excellence in all that we do." },
    { zoom: 1.34, line: "We don’t believe in standing still." }
  ];

  /* ---------- build: a stage that holds everything, photo layers, light ---------- */
  var stage = document.createElement("div");
  stage.className = "v9-stage";
  while (hero.firstChild) stage.appendChild(hero.firstChild);
  hero.appendChild(stage);
  hero.classList.add("v9-hero");

  var bg = stage.querySelector(".hero-bg");
  var photo = document.createElement("div");
  photo.className = "v9-layer is-on";
  photo.setAttribute("aria-hidden", "true");
  photo.style.setProperty("--img", 'url("' + IMG + PHOTO + '")');
  photo.style.setProperty("--pos", art[1]);
  photo.style.setProperty("--origin", ORIGIN);
  photo.style.setProperty("--zoom", VALUES[0].zoom);
  bg.insertAdjacentElement("afterend", photo);
  var layers = [photo];
  var light = document.createElement("div");
  light.className = "v9-light";
  light.setAttribute("aria-hidden", "true");
  layers[layers.length - 1].insertAdjacentElement("afterend", light);

  var panel = stage.querySelector(".hero-panel");
  var words = Array.prototype.slice.call(stage.querySelectorAll(".ht-word"));
  var sub = stage.querySelector(".hero-sub");
  var story = stage.querySelector(".hero-actions .btn--solid");
  var names = words.map(function (w) { return w.textContent.trim().replace(/\.$/, ""); });

  // progress: a rail beside the words (desktop) / a three-step bar (phone)
  var steps = document.createElement("div");
  steps.className = "v9-steps";
  steps.setAttribute("aria-hidden", "true");
  VALUES.forEach(function () { steps.appendChild(document.createElement("span")); });
  panel.insertBefore(steps, panel.querySelector(".hero-tagline"));
  var hint = document.createElement("p");
  hint.className = "v9-hint";
  hint.setAttribute("aria-hidden", "true");
  panel.insertBefore(hint, panel.querySelector(".hero-foot"));

  var subOriginal = sub ? sub.innerHTML : "";
  var current = -1, seen = {}, DONE = VALUES.length;

  // the finished look, shown once all three values have been seen
  function finish() {
    if (current === DONE) return;
    current = DONE;
    hero.classList.add("v9-done");
    words.forEach(function (w) { w.classList.remove("is-on"); w.setAttribute("aria-pressed", "false"); });
    Array.prototype.forEach.call(steps.children, function (s) { s.classList.remove("is-on"); s.classList.add("is-done"); });
    if (sub) {
      sub.classList.add("is-swapping");
      setTimeout(function () { sub.innerHTML = subOriginal; sub.classList.remove("is-swapping"); }, reduce ? 0 : 320);
    }
    hint.classList.add("is-gone");
    if (story && !story.classList.contains("v9-ready")) story.classList.add("v9-ready");
  }

  function show(i) {
    if (i === current) return;
    current = i;
    hero.classList.remove("v9-done");
    if (mode !== "scroll") photo.style.setProperty("--zoom", VALUES[i].zoom);   // phone: step to this value's zoom
    words.forEach(function (w, k) { w.classList.toggle("is-on", k === i); w.setAttribute("aria-pressed", String(k === i)); });
    Array.prototype.forEach.call(steps.children, function (s, k) { s.classList.toggle("is-on", k === i); s.classList.toggle("is-done", k < i); });
    if (sub) {
      sub.classList.add("is-swapping");
      setTimeout(function () {
        sub.innerHTML = "“" + VALUES[i].line + "”<span class=\"v9-from\">" + names[i] + " · Our values</span>";
        sub.classList.remove("is-swapping");
      }, reduce ? 0 : 320);
    }
    seen[i] = true;
    clearTimeout(settle);
    // phone: after resting on the last value, settle into the finished look
    if (mode === "swipe" && i === VALUES.length - 1 && Object.keys(seen).length === VALUES.length) settle = setTimeout(finish, reduce ? 0 : 3200);
  }
  var settle = null;

  words.forEach(function (w) { w.setAttribute("tabindex", "0"); w.setAttribute("role", "button"); });

  /* ---------- choose a mode; switch if the window changes ---------- */
  var desktopMQ = window.matchMedia("(min-width: 761px) and (hover: hover) and (pointer: fine)");
  var mode = null, cleanup = [];
  function on(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); cleanup.push(function () { el.removeEventListener(ev, fn, opt); }); }

  function setMode() {
    var next = desktopMQ.matches && !reduce ? "scroll" : "swipe";
    if (next === mode) return;
    cleanup.forEach(function (f) { f(); });
    cleanup = [];
    mode = next;
    hero.classList.toggle("v9-scroll", mode === "scroll");
    hero.classList.toggle("v9-swipe", mode === "swipe");
    if (mode === "scroll") startScroll(); else startSwipe();
  }

  /* ---------- laptop: scroll through the values ---------- */
  function startScroll() {
    hint.textContent = "Scroll to explore our values";
    var ticking = false;
    function progress() {
      var r = hero.getBoundingClientRect();
      var run = hero.offsetHeight - window.innerHeight;
      return run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0;
    }
    function update() {
      ticking = false;
      var p = progress();
      // four bands of scroll: Wisdom, Fortitude, Ingenuity, then the finished look
      var band = Math.floor(p * (VALUES.length + 1) * 0.999);
      if (band >= VALUES.length) finish(); else show(band);
      hero.style.setProperty("--v9-p", p.toFixed(3));
      // zoom glides continuously with the scroll, from the first value's framing to the last
      var z = VALUES[0].zoom + (VALUES[VALUES.length - 1].zoom - VALUES[0].zoom) * p;
      photo.style.setProperty("--zoom", z.toFixed(3));
      hint.classList.toggle("is-gone", p > 0.04);
    }
    on(window, "scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    on(window, "resize", update);

    // clicking a word scrolls to its band
    words.forEach(function (w, i) {
      function go() {
        var top = hero.getBoundingClientRect().top + window.scrollY;
        var run = hero.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + run * ((i + 0.5) / (VALUES.length + 1)), behavior: "smooth" });
      }
      on(w, "click", go);
      on(w, "keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });

    // hover: a gentle zoom-in (never a slide, so no edge shows) and a soft light under the cursor
    on(hero, "pointerenter", function () { photo.style.setProperty("--hz", "1.035"); });
    on(hero, "pointerleave", function () { photo.style.setProperty("--hz", "1"); });
    var raf = null, mx = 50, my = 50;
    on(hero, "pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width * 100; my = (e.clientY - r.top) / r.height * 100;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = null;
        light.style.setProperty("--mx", mx.toFixed(1) + "%");
        light.style.setProperty("--my", my.toFixed(1) + "%");
      });
    });
    update();
  }

  /* ---------- phone: swipe or tap ---------- */
  function startSwipe() {
    hint.textContent = "Swipe to explore our values";
    hint.classList.remove("is-gone");
    photo.style.setProperty("--hz", "1");
    photo.style.setProperty("--zoom", VALUES[Math.min(VALUES.length - 1, Math.max(0, current))].zoom);

    words.forEach(function (w, i) {
      on(w, "click", function () { show(i); hint.classList.add("is-gone"); });
      on(w, "keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); } });
    });

    // horizontal swipe changes value; vertical movement is left to the page
    var x0 = null, y0 = null;
    on(stage, "touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    on(stage, "touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      var n = current + (dx < 0 ? 1 : -1);
      if (n < 0) return;
      if (n >= VALUES.length) { if (current < DONE) finish(); return; }
      show(n);
      hint.classList.add("is-gone");
    }, { passive: true });
  }

  show(0);
  setMode();
  if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", setMode);
  else if (desktopMQ.addListener) desktopMQ.addListener(setMode);
})();
