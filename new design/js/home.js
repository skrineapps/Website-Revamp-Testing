/* =========================================================
   SKRINE — Home page only
   - Deals & Transactions: featured deal switcher
   - Global Network: rotating dotted globe (canvas)
   - Awards: engraved guilloché background + foil sheen
   - Count-up figures
   Sources: skrine.com > Insights > Latest, items titled "Transaction News: …"
   (detail pages under /insights/alerts/). Checked against the site Nov 2026.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Deals & Transactions ---------- */
  var DEALS = [
    {
      // source: https://www.skrine.com/insights/alerts/november-2026/transaction-news-skrine-advises-totalenergies-on-i
      sector: "Oil & Gas · Energy",
      num: "6.5", unit: "tcf",
      label: "more than 6.5 trillion cubic feet of gas resources across the Lang Lebah and B14 fields",
      headline: "TotalEnergies acquires a 30% operated interest in the Lang Lebah and B14 gas fields offshore Sarawak",
      summary: "Skrine acted as Malaysian legal counsel to TotalEnergies on its arrangements with PETRONAS Carigali, PTTEP and KUFPEC. Lang Lebah is one of Malaysia's largest offshore gas discoveries.",
      team: "Fariz Abdul Aziz · Samson Kong",
      date: "06 Nov 2026",
      img: "new%20design/images/sectors/oil-and-gas-and-energy.jpg"
    },
    {
      // source: https://www.skrine.com/insights/alerts/november-2026/transaction-news-ame-elite-enters-into-joint-ventu
      sector: "Real Estate · Industrial",
      num: "RM4.0", unit: "bn",
      label: "estimated gross development value",
      headline: "AME Elite and UEM Sunrise form a joint venture for an industrial development in the Johor-Singapore Special Economic Zone",
      summary: "Skrine acted as legal counsel to AME Development on the 50:50 joint venture to develop 402.1 acres of freehold industrial land in Gerbang Nusajaya, Iskandar Puteri.",
      team: "Sheba Gumis · Jesy Ooi · Engy Tan",
      date: "03 Nov 2026",
      img: "new%20design/images/sectors/real-estate.jpg"
    },
    {
      // source: https://www.skrine.com/insights/alerts/july-2026/transaction-news-airtrunk-secures-us2-325-billion
      sector: "Banking & Finance · Data Centres",
      num: "US$2.325", unit: "bn",
      label: "green financing from 30 financial institutions",
      headline: "AirTrunk secures the largest green project financing for a single data centre in Malaysia",
      summary: "Skrine acted as Malaysian counsel for AirTrunk on the financing for its JHB2 hyperscale data centre campus in Johor Bahru — AirTrunk's largest single-asset financing to date.",
      team: "Lee Ai Hsian · Javene Fan · Chong Zhi Shin",
      date: "31 Jul 2026",
      img: "new%20design/images/sectors/telecommunications-media-and-technology.jpg"
    },
    {
      // source: https://www.skrine.com/insights/alerts/august-2026/transaction-news-thermo-fisher-sells-microbiology
      sector: "Corporate / M&A · Healthcare",
      num: "US$1.08", unit: "bn",
      label: "sale of Thermo Fisher's microbiology business",
      headline: "Thermo Fisher sells its microbiology business to private equity firm Astorg",
      summary: "Skrine acted as Malaysian counsel for Thermo Fisher Scientific on the sale, which included its shareholding in its Malaysian subsidiary.",
      team: "Sheba Gumis · Joey Tiw · Faith Chan",
      date: "17 Aug 2026",
      img: "new%20design/images/sectors/healthcare-biotechnology-and-pharmaceuticals.jpg"
    },
    {
      // source: https://www.skrine.com/insights/alerts/august-2026/transaction-news-allianz-to-acquire-uob-asset-mana
      sector: "Corporate / M&A · Asset Management",
      num: "8", unit: "jurisdictions",
      label: "in one regional acquisition",
      headline: "Allianz Global Investors to acquire UOB Asset Management's operations across Asia",
      summary: "Skrine, as part of the global team led by Freshfields, advised AllianzGI on the Malaysian law and regulatory aspects, including due diligence and regulatory approvals.",
      team: "To' Puan Janet Looi · Tan Wei Xian",
      date: "11 Aug 2026",
      img: "new%20design/images/sectors/financial-institutions.jpg"
    },
    {
      // source: https://www.skrine.com/insights/alerts/july-2026/transaction-news-carlsberg-and-sapporo-to-form-str
      sector: "Corporate / M&A · Consumer",
      num: "US$643", unit: "m",
      label: "for Sapporo's 25% stake in the regional joint venture",
      headline: "Carlsberg and Sapporo form a strategic partnership across Southeast Asia and Hong Kong",
      summary: "Skrine acted as Malaysian counsel for Carlsberg on the joint venture and the internal cross-border restructuring behind it.",
      team: "To' Puan Janet Looi · Tan Wei Xian · Kyra Iman Yaacob",
      date: "22 Jul 2026",
      img: "new%20design/images/sectors/industrial-and-manufacturing.jpg"
    }
  ];

  var board = document.getElementById("dealsBoard");
  if (board) {
    var feature = document.getElementById("dealFeature");
    var content = feature.querySelector(".deal-feature-content");
    var art = feature.querySelector(".deal-feature-art");
    // warm the cache so the photo swap doesn't flash
    DEALS.forEach(function (d) { new Image().src = d.img; });
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
      art.classList.add("is-leaving");
      setTimeout(function () {
        art.style.backgroundImage = "url(\"" + d.img + "\")";
        art.classList.remove("is-leaving");
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

  /* ---------- News & Events: everything visible at once ----------
     Left: the latest story, large. Right: upcoming events (or skrine.com's
     "no upcoming events" state) above the next few stories.
     Data: js/news-data.js — SKRINE_NEWS and SKRINE_UPCOMING, from skrine.com. */
  var neBoard = document.getElementById("newsEvents");
  if (neBoard && window.SKRINE_NEWS && window.SKRINE_NEWS.length) {
    var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var IMG = "new%20design/images/news/";
    var LIST_URL = "new%20design/news-events.html";
    var todayISO = new Date().toISOString().slice(0, 10);
    var UP = (window.SKRINE_UPCOMING || [])
      .filter(function (e) { return (e.endDate || e.date) >= todayISO; })
      .sort(function (x, y) { return x.date < y.date ? -1 : 1; })
      .slice(0, 3);
    var NEWS5 = window.SKRINE_NEWS.slice(0, 5);

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    }
    function fmt(iso) { var d = iso.split("-"); return d[2] + " " + MON[Number(d[1]) - 1] + " " + d[0]; }

    var f = NEWS5[0];
    var html =
      '<a href="' + LIST_URL + '#latest" class="ne-feature">' +
        (f.image ? '<img src="' + IMG + esc(f.image) + '" alt="" class="ne-feature-img">' : "") +
        '<div class="ne-feature-body">' +
          '<p class="ne-kicker"><span>Latest News</span>' + esc(f.category) + " · " + fmt(f.date) + "</p>" +
          "<h3>" + esc(f.title) + "</h3>" +
          (f.summary ? '<p class="ne-feature-sum">' + esc(f.summary) + "</p>" : "") +
          '<span class="ne-more">Read the story <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
        "</div>" +
      "</a>";

    html += '<div class="ne-side">';

    // upcoming events
    html += '<section class="ne-up" aria-labelledby="neUpHead"><h3 class="ne-side-head" id="neUpHead">Upcoming Events</h3>';
    if (UP.length) {
      html += '<ul class="ne-up-rows">';
      UP.forEach(function (e) {
        var d = e.date.split("-");
        html += '<li><a href="' + (e.register || LIST_URL + "#upcoming") + '" class="ne-up-row">' +
          '<span class="ne-up-date"><b>' + d[2] + "</b>" + MON[Number(d[1]) - 1] + "</span>" +
          '<span class="ne-up-text"><small>' + esc([e.type, e.location, e.time].filter(Boolean).join(" · ")) + "</small>" + esc(e.title) + "</span>" +
          "</a></li>";
      });
      html += "</ul>";
    } else {
      html += '<div class="ne-up-none">' +
        '<span class="ne-up-icon"><i class="fa-regular fa-calendar" aria-hidden="true"></i></span>' +
        "<p><strong>No upcoming events right now.</strong> Our lawyers speak regularly at conferences, seminars and webinars — new events will appear here.</p>" +
        '<a href="' + LIST_URL + '#upcoming" class="ne-up-link">Get notified <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
      "</div>";
    }
    html += "</section>";

    // more news
    html += '<section class="ne-list" aria-labelledby="neListHead"><h3 class="ne-side-head" id="neListHead">More News</h3><ul>';
    NEWS5.slice(1).forEach(function (n) {
      html += '<li><a href="' + LIST_URL + '#latest" class="ne-row">' +
        (n.image ? '<img src="' + IMG + esc(n.image) + '" alt="" loading="lazy">' : '<span class="ne-row-noimg"></span>') +
        '<span class="ne-row-text"><small>' + esc(n.category) + " · " + fmt(n.date) + "</small>" + esc(n.title) + "</span>" +
        "</a></li>";
    });
    html += "</ul></section></div>";

    neBoard.innerHTML = html;
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
    // partner nodes: spread over the land, but only within reach of KL
    // (routes to the far side of the world would just loop round the globe)
    for (var n = 0; NODES.length < 20 && n < 400; n++) {
      var cand = nodeSource[(n * 977 + 131) % nodeSource.length];
      var cd = cand[0] * HUB[0] + cand[1] * HUB[1] + cand[2] * HUB[2];
      if (cd > 0.05 && cd < 0.97) NODES.push(cand);
    }

    // Regional desks: each gets a marker, a bold route from KL and a label.
    // The globe turns to show KL and the active desk together.
    var DESKS = {
      china: { pos: fromLatLon(31.23, 121.47) },  // Shanghai
      india: { pos: fromLatLon(19.08, 72.88) },   // Mumbai
      mena:  { pos: fromLatLon(25.2, 55.27) }     // Dubai
    };
    Object.keys(DESKS).forEach(function (k) {
      var d = DESKS[k], p = d.pos;
      var m = [p[0] + HUB[0], p[1] + HUB[1], p[2] + HUB[2]];
      d.focusY = Math.atan2(m[0], m[2]);                       // centre the KL–desk midpoint
      d.focusX = Math.asin(m[1] / Math.hypot(m[0], m[1], m[2])) * 0.9 + 0.05;
      d.pin = globe.parentElement.querySelector('.globe-pin--desk[data-desk="' + k + '"]');
    });
    var activeDesk = "china", lastUserSpin = -1e9;

    // start with Asia facing us, Kuala Lumpur just left of centre
    var rotY = DESKS.china.focusY, rotX = DESKS.china.focusX, targetX = rotX, dragV = 0;
    var size = 0, dpr = 1, pin = globe.parentElement.querySelector(".globe-pin:not(.globe-pin--desk)");

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

    // A route between two points on the globe: follows the great circle,
    // lifted off the surface towards the middle, and hidden where it passes
    // behind the sphere (so lines never cut across the globe).
    var ARC_STEPS = 40;
    function arcPoint(a, b, ang, u, h) {
      var s = Math.sin(ang) || 1;
      var wa = Math.sin((1 - u) * ang) / s, wb = Math.sin(u * ang) / s;
      var lift = 1 + h * Math.sin(Math.PI * u);
      return [(a[0] * wa + b[0] * wb) * lift, (a[1] * wa + b[1] * wb) * lift, (a[2] * wa + b[2] * wb) * lift];
    }
    function onShow(p) {
      // in front of the sphere, or outside its outline on screen
      if (p.z >= 0) return true;
      var dx = p.x - size / 2, dy = p.y - size / 2, R = size * 0.44;
      return dx * dx + dy * dy > R * R;
    }
    function arc(a, b, t, strong) {
      var dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      var ang = Math.acos(dot);
      if (ang < 0.01) return;
      var h = Math.min(0.16, 0.03 + ang * 0.09);          // longer routes arc a little higher
      var pts = [];
      for (var i = 0; i <= ARC_STEPS; i++) {
        var pr = project(arcPoint(a, b, ang, i / ARC_STEPS, h));
        pr.v = onShow(pr);
        pts.push(pr);
      }
      gctx.lineWidth = strong ? 2.6 : 1.1;
      gctx.lineCap = "round";
      gctx.beginPath();
      var drawing = false, depth = 0, n = 0;
      for (var k = 0; k < pts.length; k++) {
        var q = pts[k];
        if (!q.v) { drawing = false; continue; }
        if (drawing) gctx.lineTo(q.x, q.y); else { gctx.moveTo(q.x, q.y); drawing = true; }
        depth += q.z; n++;
      }
      if (!n) return;
      gctx.strokeStyle = strong
        ? "rgba(195, 32, 48, 0.95)"
        : "rgba(195, 32, 48, " + (0.12 + 0.18 * Math.max(0, depth / n)) + ")";
      gctx.stroke();
      // pulses travelling along the route (three on a desk route)
      var count = strong ? 3 : 1;
      for (var c = 0; c < count; c++) {
        var u = (t * (strong ? 1.6 : 1) + c / count) % 1;
        var pp = project(arcPoint(a, b, ang, u, h));
        if (!onShow(pp)) continue;
        gctx.beginPath();
        gctx.arc(pp.x, pp.y, strong ? 3.4 : 2.2, 0, Math.PI * 2);
        gctx.fillStyle = strong ? "#c32030" : "rgba(195, 32, 48, 0.7)";
        gctx.fill();
      }
    }

    function deskMarker(d, isActive, time) {
      var p = project(d.pos);
      if (d.pin) {
        d.pin.style.transform = "translate(" + p.x + "px," + p.y + "px)";
        d.pin.style.opacity = p.z > 0.12 ? (isActive ? 1 : 0.75) : 0;
      }
      if (p.z < 0) return;
      if (isActive) {
        var pl = (time % 1500) / 1500;
        gctx.beginPath();
        gctx.arc(p.x, p.y, 6 + pl * 18, 0, Math.PI * 2);
        gctx.strokeStyle = "rgba(195, 32, 48, " + (0.7 * (1 - pl)) + ")";
        gctx.lineWidth = 2;
        gctx.stroke();
      }
      gctx.beginPath();
      gctx.arc(p.x, p.y, isActive ? 6 : 4.5, 0, Math.PI * 2);
      gctx.fillStyle = "#fff";
      gctx.fill();
      gctx.lineWidth = isActive ? 3 : 2;
      gctx.strokeStyle = isActive ? "#c32030" : "#757575";
      gctx.stroke();
    }

    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(globe);
    }

    function frame(time) {
      requestAnimationFrame(frame);
      if (!visible || !size) return;
      if (activeDesk && time - lastUserSpin > 4000) {
        // glide to the active desk (shortest way round)
        var goal = DESKS[activeDesk].focusY;
        var diff = Math.atan2(Math.sin(goal - rotY), Math.cos(goal - rotY));
        rotY += reduceMotion ? diff : diff * 0.045;
        targetX = DESKS[activeDesk].focusX;
      } else {
        rotY -= (reduceMotion ? 0 : 0.0016) + dragV;
      }
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
      Object.keys(DESKS).forEach(function (k) {
        if (k === activeDesk) arc(HUB, DESKS[k].pos, t, true);
      });

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

      Object.keys(DESKS).forEach(function (k) { deskMarker(DESKS[k], k === activeDesk, time); });

      if (pin) {
        pin.style.transform = "translate(" + h.x + "px," + h.y + "px)";
        pin.style.opacity = h.z > 0.1 ? 1 : 0;
      }
    }

    // gentle drag to spin
    var lastX = null;
    globe.addEventListener("pointerdown", function (e) { lastX = e.clientX; lastUserSpin = performance.now(); globe.setPointerCapture(e.pointerId); });
    globe.addEventListener("pointermove", function (e) {
      if (lastX !== null) { dragV = (e.clientX - lastX) * 0.0012; lastX = e.clientX; lastUserSpin = performance.now(); }
    });
    globe.addEventListener("pointerup", function () { lastX = null; });

    // desk cards: cycle on their own; hover, focus or tap picks one
    var deskCards = Array.prototype.slice.call(document.querySelectorAll(".nd-card"));
    var deskOrder = deskCards.map(function (c) { return c.dataset.desk; });
    var deskTimer = null, deskHold = false;
    function setDesk(k) {
      activeDesk = k;
      lastUserSpin = -1e9;
      deskCards.forEach(function (c) { c.classList.toggle("is-active", c.dataset.desk === k); });
    }
    function cycleDesks() {
      clearInterval(deskTimer);
      if (reduceMotion) return;
      deskTimer = setInterval(function () {
        if (deskHold || !visible) return;
        setDesk(deskOrder[(deskOrder.indexOf(activeDesk) + 1) % deskOrder.length]);
      }, 4500);
    }
    deskCards.forEach(function (c) {
      c.addEventListener("pointerenter", function () { deskHold = true; setDesk(c.dataset.desk); });
      c.addEventListener("pointerleave", function () { deskHold = false; cycleDesks(); });
      c.addEventListener("focus", function () { deskHold = true; setDesk(c.dataset.desk); });
      c.addEventListener("blur", function () { deskHold = false; cycleDesks(); });
    });
    cycleDesks();

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
