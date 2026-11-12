/* =========================================================
   SKRINE — Home page only
   - Deals & Transactions: featured deal switcher
   - Global Network: rotating dotted globe (canvas)
   - Awards: engraved guilloché background + foil sheen
   - Count-up figures
   Sources: deal details from skrine.com Transaction News (Jul–Nov 2026).
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Deals & Transactions ---------- */
  var DEALS = [
    {
      sector: "Oil & Gas · Energy",
      num: "6.5", unit: "tcf",
      label: "of gas resources across the Lang Lebah and B14 fields",
      headline: "TotalEnergies acquires a 30% operated interest in the Lang Lebah and B14 gas fields offshore Sarawak",
      summary: "Skrine acted as Malaysian legal counsel to TotalEnergies on its arrangements with PETRONAS Carigali, PTTEP and KUFPEC. Lang Lebah is one of Malaysia's largest offshore gas discoveries.",
      team: "Fariz Abdul Aziz · Samson Kong",
      date: "06 Nov 2026"
    },
    {
      sector: "Real Estate · Industrial",
      num: "RM4.0", unit: "bn",
      label: "estimated gross development value",
      headline: "AME Elite and UEM Sunrise form a joint venture for an industrial development in the Johor-Singapore Special Economic Zone",
      summary: "Skrine acted as legal counsel to AME Development on the 50:50 joint venture to develop 402.1 acres of freehold industrial land in Gerbang Nusajaya, Iskandar Puteri.",
      team: "Partners including Sheba Gumis",
      date: "03 Nov 2026"
    },
    {
      sector: "Banking & Finance · Data Centres",
      num: "US$2.325", unit: "bn",
      label: "green financing from 30 financial institutions",
      headline: "AirTrunk secures the largest green project financing for a single data centre in Malaysia",
      summary: "Skrine acted as Malaysian counsel for AirTrunk on the financing for its JHB2 hyperscale data centre campus in Johor Bahru — AirTrunk's largest single-asset financing to date.",
      team: "Lee Ai Hsian · Javene Fan · Chong Zhi Shin",
      date: "31 Jul 2026"
    },
    {
      sector: "Corporate / M&A · Healthcare",
      num: "US$1.08", unit: "bn",
      label: "sale of Thermo Fisher's microbiology business",
      headline: "Thermo Fisher sells its microbiology business to private equity firm Astorg",
      summary: "Skrine acted as Malaysian counsel for Thermo Fisher Scientific on the sale, which included its shareholding in its Malaysian subsidiary.",
      team: "Sheba Gumis · Joey Tiw · Faith Chan",
      date: "17 Aug 2026"
    },
    {
      sector: "Corporate / M&A · Asset Management",
      num: "8", unit: "jurisdictions",
      label: "in one regional acquisition",
      headline: "Allianz Global Investors to acquire UOB Asset Management's operations across Asia",
      summary: "Skrine, as part of the global team led by Freshfields, advised AllianzGI on the Malaysian law and regulatory aspects, including due diligence and regulatory approvals.",
      team: "Team including Tan Wei Xian",
      date: "11 Aug 2026"
    },
    {
      sector: "Corporate / M&A · Consumer",
      num: "US$643", unit: "m",
      label: "for Sapporo's 25% stake in the regional joint venture",
      headline: "Carlsberg and Sapporo form a strategic partnership across Southeast Asia and Hong Kong",
      summary: "Skrine acted as Malaysian counsel for Carlsberg on the joint venture and the internal cross-border restructuring behind it.",
      team: "To' Puan Janet Looi · Tan Wei Xian · Kyra Iman Yaacob",
      date: "22 Jul 2026"
    }
  ];

  var board = document.getElementById("dealsBoard");
  if (board) {
    var feature = document.getElementById("dealFeature");
    var content = feature.querySelector(".deal-feature-content");
    var tabs = Array.prototype.slice.call(board.querySelectorAll(".deal-list button"));
    var current = 0;
    var rotate = null;
    var ROTATE_MS = 7000;

    function q(sel) { return content.querySelector(sel); }

    function show(i, fromUser) {
      if (i === current && fromUser) return;
      current = (i + DEALS.length) % DEALS.length;
      var d = DEALS[current];
      content.classList.add("is-leaving");
      setTimeout(function () {
        q(".deal-sector").textContent = d.sector;
        q(".deal-figure-num").textContent = d.num;
        q(".deal-figure-unit").textContent = d.unit;
        q(".deal-figure-label").textContent = d.label;
        q(".deal-headline").textContent = d.headline;
        q(".deal-summary").textContent = d.summary;
        q(".deal-team").textContent = d.team;
        q("time").textContent = d.date;
        content.classList.remove("is-leaving");
      }, reduceMotion ? 0 : 260);
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", String(k === current));
        t.tabIndex = k === current ? 0 : -1;
      });
    }

    function restartRotate() {
      if (reduceMotion) return;
      clearInterval(rotate);
      rotate = setInterval(function () { show(current + 1); }, ROTATE_MS);
    }

    tabs.forEach(function (t, k) {
      t.tabIndex = k === 0 ? 0 : -1;
      t.addEventListener("click", function () { show(k, true); restartRotate(); });
      t.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        show(current + dir, true);
        tabs[current].focus();
        restartRotate();
      });
    });

    board.addEventListener("mouseenter", function () { clearInterval(rotate); });
    board.addEventListener("mouseleave", restartRotate);
    board.addEventListener("focusin", function () { clearInterval(rotate); });
    restartRotate();
  }

  /* ---------- Count-up figures ---------- */
  function countUp(el) {
    var to = Number(el.dataset.to);
    if (!to || reduceMotion) return;
    var start = null;
    var DUR = 1400;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / DUR, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll(".count-up");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Global Network: dotted globe ---------- */
  var globe = document.getElementById("globe");
  if (globe && globe.getContext) {
    var gctx = globe.getContext("2d");
    var DOTS = [];
    var N = 900;
    // even spread of points over a sphere (Fibonacci lattice)
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var th = i * Math.PI * (3 - Math.sqrt(5));
      DOTS.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    function fromLatLon(lat, lon) {
      var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
      return [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)];
    }
    var HUB = fromLatLon(3.14, 101.69); // Kuala Lumpur
    // continents: land dots from js/globe-land.js
    var LAND = (window.SKRINE_LAND || []).map(function (p) { return fromLatLon(p[0], p[1]); });
    // illustrative partner nodes spread over the continents (not specific member cities)
    var NODES = [];
    var nodeSource = LAND.length ? LAND : DOTS;
    for (var n = 0; n < 24; n++) NODES.push(nodeSource[(n * 977 + 131) % nodeSource.length]);

    // start with Asia facing us, Kuala Lumpur just left of centre; spin west to east
    var rotY = Math.atan2(HUB[0], HUB[2]) + 0.45, rotX = 0.18, targetX = 0.18, dragV = 0;
    var size = 0, dpr = 1, pin = globe.parentElement.querySelector(".globe-pin");

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = globe.clientWidth;
      globe.width = size * dpr;
      globe.height = size * dpr;
    }

    function project(p) {
      var cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
      var x = p[0] * cy - p[2] * sy;
      var z = p[0] * sy + p[2] * cy;
      var y2 = p[1] * cx - z * sx;
      var z2 = p[1] * sx + z * cx;
      var R = size * 0.44;
      return { x: size / 2 + x * R, y: size / 2 - y2 * R, z: z2 };
    }

    function arc(a, b, t) {
      // great-circle-ish arc lifted off the surface
      var m = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
      var len = Math.hypot(m[0], m[1], m[2]) || 1;
      var lift = 1.35;
      m = [m[0] / len * lift, m[1] / len * lift, m[2] / len * lift];
      var pa = project(a), pb = project(b), pm = project(m);
      if (pa.z < -0.15 && pb.z < -0.15) return;
      gctx.beginPath();
      gctx.moveTo(pa.x, pa.y);
      gctx.quadraticCurveTo(pm.x, pm.y, pb.x, pb.y);
      gctx.strokeStyle = "rgba(195, 32, 48, " + (0.18 + 0.25 * Math.max(0, (pa.z + pb.z) / 2)) + ")";
      gctx.lineWidth = 1.2;
      gctx.stroke();
      // a pulse travelling along the arc
      var u = t % 1;
      var qx = (1 - u) * (1 - u) * pa.x + 2 * (1 - u) * u * pm.x + u * u * pb.x;
      var qy = (1 - u) * (1 - u) * pa.y + 2 * (1 - u) * u * pm.y + u * u * pb.y;
      gctx.beginPath();
      gctx.arc(qx, qy, 2.4, 0, Math.PI * 2);
      gctx.fillStyle = "rgba(195, 32, 48, 0.9)";
      gctx.fill();
    }

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(globe);
    }

    function frame(time) {
      requestAnimationFrame(frame);
      if (!visible || !size) return;
      rotY -= (reduceMotion ? 0 : 0.0016) + dragV;
      dragV *= 0.94;
      rotX += (targetX - rotX) * 0.05;

      gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gctx.clearRect(0, 0, size, size);

      // soft sphere shading
      var g = gctx.createRadialGradient(size * 0.4, size * 0.38, size * 0.05, size / 2, size / 2, size * 0.46);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(206,203,204,0.25)");
      gctx.beginPath();
      gctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
      gctx.fillStyle = g;
      gctx.fill();

      // faint lattice gives the sphere its shape
      for (var k = 0; k < DOTS.length; k++) {
        var p = project(DOTS[k]);
        if (p.z < 0) continue;
        gctx.beginPath();
        gctx.arc(p.x, p.y, 0.8 + p.z * 0.5, 0, Math.PI * 2);
        gctx.fillStyle = "rgba(149,152,151," + (0.06 + p.z * 0.14) + ")";
        gctx.fill();
      }

      // continents
      gctx.fillStyle = "#757575";
      for (var l = 0; l < LAND.length; l++) {
        var q = project(LAND[l]);
        if (q.z < 0.02) continue;
        gctx.globalAlpha = 0.25 + q.z * 0.7;
        gctx.beginPath();
        gctx.arc(q.x, q.y, 1.1 + q.z * 1.1, 0, Math.PI * 2);
        gctx.fill();
      }
      gctx.globalAlpha = 1;

      var t = time / 2600;
      for (var a = 0; a < NODES.length; a++) arc(HUB, NODES[a], t + a * 0.137);

      NODES.forEach(function (nd) {
        var p = project(nd);
        if (p.z < 0) return;
        gctx.beginPath();
        gctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        gctx.fillStyle = "rgba(149,152,151,0.95)";
        gctx.fill();
      });

      var h = project(HUB);
      var pulse = (time % 1800) / 1800;
      gctx.beginPath();
      gctx.arc(h.x, h.y, 5 + pulse * 16, 0, Math.PI * 2);
      gctx.strokeStyle = "rgba(195, 32, 48, " + (0.6 * (1 - pulse)) + ")";
      gctx.lineWidth = 2;
      gctx.stroke();
      gctx.beginPath();
      gctx.arc(h.x, h.y, 5, 0, Math.PI * 2);
      gctx.fillStyle = "#c32030";
      gctx.fill();

      if (pin) {
        pin.style.transform = "translate(" + h.x + "px," + h.y + "px)";
        pin.style.opacity = h.z > 0.1 ? 1 : 0;
      }
    }

    // gentle drag to spin
    var lastX = null;
    globe.addEventListener("pointerdown", function (e) { lastX = e.clientX; globe.setPointerCapture(e.pointerId); });
    globe.addEventListener("pointermove", function (e) {
      if (lastX !== null) { dragV = (e.clientX - lastX) * 0.0012; lastX = e.clientX; }
      else if (finePointer) {
        var r = globe.getBoundingClientRect();
        targetX = 0.18 + ((e.clientY - r.top) / r.height - 0.5) * 0.4;
      }
    });
    globe.addEventListener("pointerup", function () { lastX = null; });
    globe.addEventListener("pointerleave", function () { targetX = 0.18; });

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }

  /* ---------- Awards: guilloché + foil ---------- */
  var gcan = document.getElementById("guilloche");
  if (gcan && gcan.getContext) {
    var section = gcan.closest(".awards");

    function drawGuilloche() {
      var dpr2 = Math.min(window.devicePixelRatio || 1, 2);
      var w = gcan.clientWidth, h = gcan.clientHeight;
      gcan.width = w * dpr2;
      gcan.height = h * dpr2;
      var c = gcan.getContext("2d");
      c.setTransform(dpr2, 0, 0, dpr2, 0, 0);
      c.lineWidth = 0.6;

      // engraved rosette: rings of phase-shifted waves, like a banknote
      function rosette(cx, cy, R, rings, alpha) {
        c.strokeStyle = "rgba(236, 237, 236, " + alpha + ")";
        rings.forEach(function (ring) {
          var base = ring[0], amp = ring[1], lobes = ring[2], copies = ring[3];
          for (var k = 0; k < copies; k++) {
            var phase = (k / copies) * (Math.PI * 2 / lobes);
            c.beginPath();
            var steps = Math.max(720, lobes * 36);
            for (var s = 0; s <= steps; s++) {
              var a = (s / steps) * Math.PI * 2;
              var rr = R * (base + amp * Math.sin(lobes * (a + phase)));
              var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
              if (s) c.lineTo(x, y); else c.moveTo(x, y);
            }
            c.stroke();
          }
        });
      }

      var R = Math.min(w * 0.4, h * 0.45, 620);
      rosette(w * 0.92, h * 0.38, R, [[0.96, 0.025, 54, 3], [0.8, 0.04, 40, 4], [0.64, 0.05, 30, 4], [0.48, 0.06, 22, 5], [0.32, 0.07, 14, 5]], 0.24);
      rosette(w * 0.04, h * 0.96, R * 0.55, [[0.95, 0.03, 36, 3], [0.66, 0.06, 22, 4]], 0.17);

      // certificate-style wave border along the foot
      c.strokeStyle = "rgba(236, 237, 236, 0.14)";
      for (var k = 0; k < 6; k++) {
        c.beginPath();
        for (var x = 0; x <= w; x += 3) {
          var y = h - 50 + Math.sin(x * 0.028 + k * 0.7) * 12 + Math.sin(x * 0.01 + k) * 5;
          if (x) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.stroke();
      }
    }

    drawGuilloche();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawGuilloche, 200); });

    // spotlight on the engraving + foil sheen follow the pointer
    var foils = section.querySelectorAll(".foil");
    if (finePointer && !reduceMotion) {
      section.addEventListener("pointermove", function (e) {
        var r = section.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        section.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        section.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        foils.forEach(function (f) { f.style.setProperty("--fx", (20 + px * 60).toFixed(1) + "%"); });
      });
    }
  }
})();

/* ---------- Background art drift ----------
   The decorative layers behind each section move a little slower
   than the page as you scroll (a soft depth effect). */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var secs = Array.prototype.slice.call(document.querySelectorAll(".section--art"));
  if (!secs.length) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    secs.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      // 0 when the section is centred in the viewport
      var off = (r.top + r.height / 2 - vh / 2) * -0.08;
      s.style.setProperty("--drift", off.toFixed(1) + "px");
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
