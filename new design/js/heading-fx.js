/* =========================================================
   SKRINE — Immersive heading elements (inner pages)
   Loaded by js/design.js when a Heading style other than
   "Painting" is chosen (html.heading-el.el-<style>).

   Two styles, both drawn live (no photos), coloured from the active
   design's own variables (brand red, its dark red, greys, gold accent):
     silk     layered satin ribbons flowing across, rippling to the cursor
     velvet   a draped surface of fine lines folding slowly from grey into
              brand red, swelling under the cursor, one gold thread

   Everything sits in a layer behind the page heading (div.head-fx),
   fades out before the heading text, pauses while scrolled out of
   view, and is a still frame for people who prefer reduced motion.
   ========================================================= */
(function () {
  "use strict";
  var html = document.documentElement;
  var STYLE = ["silk", "velvet"].filter(function (s) { return html.classList.contains("el-" + s); })[0];
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

    var run = { silk: silk, velvet: velvet }[STYLE];
    run(layer, mouse, function () { return visible && !document.hidden; });
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
  function loop(draw, active) {
    var t0 = performance.now();
    if (reduce) { draw(12); return; }
    (function frame(now) {
      if (active()) draw((now - t0) / 1000);
      requestAnimationFrame(frame);
    })(t0);
  }
  function ease(m) { m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05; }

  /* ---------- silk: satin ribbons ---------- */
  function silk(layer, mouse, active) {
    var cv = canvasIn(layer), ctx = cv.ctx, box = cv.box;
    var RIBBONS = [
      { c: C.light, a: 0.5, w: 86, amp: 30, f: 1.4, sp: 0.11, ph: 0.0, off: 0.20 },
      { c: C.grey, a: 0.18, w: 56, amp: 24, f: 1.8, sp: 0.14, ph: 1.4, off: 0.08 },
      { c: C.dark, a: 0.26, w: 70, amp: 34, f: 1.3, sp: 0.12, ph: 2.6, off: 0.0 },
      { c: C.red, a: 0.36, w: 54, amp: 26, f: 1.7, sp: 0.15, ph: 4.1, off: -0.09 },
      { c: C.gold, a: 0.0, w: 2, amp: 22, f: 2.1, sp: 0.16, ph: 5.2, off: -0.15, line: true }
    ];
    function centre(r, x, t) {
      var n = x / box.w;
      var lift = (mouse.inside ? (0.5 - mouse.y) * 26 : 0) * Math.exp(-Math.pow((n - mouse.x) * 3, 2));
      // rises from lower-left to upper-right, with two overlapping waves
      return box.h * (1.02 - 0.92 * n + r.off) +
        Math.sin(n * Math.PI * r.f + t * r.sp * 2 + r.ph) * r.amp +
        Math.sin(n * Math.PI * r.f * 2.3 - t * r.sp * 1.3 + r.ph) * r.amp * 0.35 + lift;
    }
    loop(function (t) {
      ease(mouse);
      ctx.clearRect(0, 0, box.w, box.h);
      var step = 8;
      RIBBONS.forEach(function (r) {
        var top = [], bot = [];
        for (var x = -20; x <= box.w + 20; x += step) {
          var y = centre(r, x, t);
          var half = r.w * (0.55 + 0.45 * Math.sin(x / box.w * Math.PI * 1.3 + t * 0.4 + r.ph)) / 2;
          top.push([x, y - half]); bot.push([x, y + half]);
        }
        if (r.line) {
          ctx.beginPath();
          top.forEach(function (p, i) { var yy = (p[1] + bot[i][1]) / 2; if (i) ctx.lineTo(p[0], yy); else ctx.moveTo(p[0], yy); });
          ctx.strokeStyle = rgba(r.c, 0.5); ctx.lineWidth = 1.1; ctx.stroke();
          return;
        }
        // body: colour deepening toward the right, with a satin sheen band
        var g = ctx.createLinearGradient(0, 0, box.w, 0);
        g.addColorStop(0, rgba(r.c, 0));
        g.addColorStop(0.35, rgba(r.c, r.a * 0.55));
        g.addColorStop(1, rgba(r.c, r.a));
        ctx.beginPath();
        top.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
        for (var i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1]);
        ctx.closePath();
        ctx.fillStyle = g; ctx.fill();
        // light catching the upper edge
        ctx.beginPath();
        top.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1] + 1); else ctx.moveTo(p[0], p[1] + 1); });
        var s = ctx.createLinearGradient(0, 0, box.w, 0);
        s.addColorStop(0, "rgba(255,255,255,0)"); s.addColorStop(0.6, "rgba(255,255,255,0.2)"); s.addColorStop(1, "rgba(255,255,255,0.3)");
        ctx.strokeStyle = s; ctx.lineWidth = 1.2; ctx.stroke();
      });
    }, active);
  }

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
