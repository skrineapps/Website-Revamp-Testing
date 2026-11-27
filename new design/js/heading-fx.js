/* =========================================================
   SKRINE — Immersive heading elements (inner pages)
   Loaded by js/design.js on every inner page (html.heading-el.el-velvet).

   Velvet, drawn live (no photos) and coloured from the active design's
   own variables (brand red, its dark red, greys, gold accent): a draped
   surface of fine lines folding slowly from grey into brand red,
   swelling under the cursor, with one gold thread.

   Everything sits in a layer behind the page heading (div.head-fx),
   fades out before the heading text, pauses while scrolled out of
   view, and is a still frame for people who prefer reduced motion.
   ========================================================= */
(function () {
  "use strict";
  var html = document.documentElement;
  var STYLE = ["velvet"].filter(function (s) { return html.classList.contains("el-" + s); })[0];
  if (!STYLE) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- colours from the active design ---------- */
  function cssVar(name, fallback) {
    var v = getComputedStyle(html).getPropertyValue(name).trim();
    return v || fallback;
  }
  function rgb(hex) {
    var h = String(hex).replace("#", "").trim();
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var n = parseInt(h, 16);
    if (isNaN(n)) return [149, 152, 151];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  var C = {
    red: rgb(cssVar("--red", "#c32030")),
    dark: rgb(cssVar("--red-dark", "#9a1825")),
    grey: rgb(cssVar("--grey-500", "#959897")),
    light: rgb(cssVar("--grey-300", "#cecbcc")),
    ink: rgb(cssVar("--grey-700", "#757575")),
    gold: rgb(cssVar("--accent", "") || "#b8955a")
  };

  /* ---------- the layer ---------- */
  function start() {
    var main = document.querySelector("main.page-main, main.contact, main.life");
    if (!main) return;
    var layer = document.createElement("div");
    layer.className = "head-fx head-fx--" + STYLE;
    layer.setAttribute("aria-hidden", "true");
    main.insertBefore(layer, main.firstChild);
    html.classList.add("head-fx-on");

    // pointer, relative to the layer (0..1), eased
    var mouse = { x: 0.75, y: 0.4, tx: 0.75, ty: 0.4, inside: false };
    window.addEventListener("pointermove", function (e) {
      var r = layer.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = (e.clientY - r.top) / r.height;
      mouse.inside = e.clientY >= r.top && e.clientY <= r.bottom;
    }, { passive: true });

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(layer);
    }

    velvet(layer, mouse, function () { return visible && !document.hidden; });
  }

  /* a canvas that fills the layer, sharp on retina, resized with it */
  function canvasIn(layer) {
    var cv = document.createElement("canvas");
    layer.appendChild(cv);
    var ctx = cv.getContext("2d");
    var box = { w: 0, h: 0, dpr: 1 };
    function size() {
      box.dpr = Math.min(window.devicePixelRatio || 1, 2);
      box.w = layer.clientWidth; box.h = layer.clientHeight;
      cv.width = Math.round(box.w * box.dpr); cv.height = Math.round(box.h * box.dpr);
      ctx.setTransform(box.dpr, 0, 0, box.dpr, 0, 0);
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(layer); else window.addEventListener("resize", size);
    return { ctx: ctx, box: box };
  }
  // drawn at ~30 frames a second, and held still while the page is scrolling, so the
  // smooth scroll (js/smooth-scroll.js) always has the frames to itself
  var scrolling = false, scrollTimer = null;
  window.addEventListener("scroll", function () {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () { scrolling = false; }, 160);
  }, { passive: true });
  function loop(draw, active) {
    var t0 = performance.now(), lastDraw = 0, held = 0;
    if (reduce) { draw(12); return; }
    (function frame(now) {
      var busy = scrolling || (window.SkrineLenis && window.SkrineLenis.isScrolling);
      if (busy) held += now - (lastDraw || now);   // the drape picks up where it stopped
      else if (active() && now - lastDraw >= 33) draw((now - t0 - held) / 1000);
      if (!busy && now - lastDraw >= 33) lastDraw = now;
      if (busy) lastDraw = now;
      requestAnimationFrame(frame);
    })(t0);
  }
  function ease(m) { m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05; }

  /* ---------- velvet: a draped surface of fine lines ---------- */
  function velvet(layer, mouse, active) {
    var cv = canvasIn(layer), ctx = cv.ctx, box = cv.box;
    var L = 54;
    loop(function (t) {
      ease(mouse);
      var W = box.w, H = box.h;
      ctx.clearRect(0, 0, W, H);
      var mx = mouse.x * W, my = mouse.y * H;
      for (var i = 0; i < L; i++) {
        var k = i / (L - 1);
        // colour runs from soft grey (back) into brand red (front), with the deepest fold in wine
        var c = k < 0.5 ? C.light : (k < 0.82 ? C.red : C.dark);
        var a = 0.12 + 0.5 * Math.pow(k, 1.6);
        ctx.beginPath();
        for (var x = -10; x <= W + 10; x += 10) {
          var n = x / W;
          var base = H * (0.06 + 0.78 * k) - n * H * 0.32;               // the surface tilts up to the right
          var z = Math.sin(n * 4.4 + t * 0.18 + k * 2.6) * 70 * (0.35 + k) +
                  Math.sin(n * 11 - t * 0.11 + k * 6.3) * 14 +
                  Math.sin(n * 2.4 + t * 0.08) * 30;
          if (mouse.inside) {                                              // a soft swell under the cursor
            var d2 = ((x - mx) * (x - mx)) / 26000 + ((base - my) * (base - my)) / 9000;
            z -= 34 * Math.exp(-d2);
          }
          var y = base + z;
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.42, rgba(c, a * 0.45)); g.addColorStop(1, rgba(c, a));
        ctx.strokeStyle = g;
        ctx.lineWidth = i % 9 === 4 ? 1.6 : 0.9;
        ctx.stroke();
      }
      // one gold thread running through the drape
      ctx.beginPath();
      for (var x2 = -10; x2 <= W + 10; x2 += 10) {
        var n2 = x2 / W, k2 = 0.62;
        var y2 = H * (0.06 + 0.78 * k2) - n2 * H * 0.32 + Math.sin(n2 * 4.4 + t * 0.18 + k2 * 2.6) * 70 * (0.35 + k2) + Math.sin(n2 * 11 - t * 0.11 + k2 * 6.3) * 14 + Math.sin(n2 * 2.4 + t * 0.08) * 30;
        if (x2 === -10) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      var gg = ctx.createLinearGradient(0, 0, W, 0);
      gg.addColorStop(0, rgba(C.gold, 0)); gg.addColorStop(0.5, rgba(C.gold, 0.5)); gg.addColorStop(1, rgba(C.gold, 0.9));
      ctx.strokeStyle = gg; ctx.lineWidth = 1.3; ctx.stroke();
    }, active);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
