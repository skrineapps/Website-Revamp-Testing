/* =========================================================
   SKRINE — In the Spotlight: three layouts to compare (review aid)
   The homepage's "In the Spotlight" now holds both Legal Updates
   (alerts) and Publications. Three ways to show them, switched by
   the "Layout A / B / C" pill in the section:
     A  Two columns   newest alerts on the left, newest publications on the right
     B  Tabs          the Spotlight card grid, with Latest / Legal Updates / Publications tabs
     C  Featured      one featured item, the alerts carousel, then a shelf of publications
   ?spot=a|b|c in the address picks one; the choice is remembered for
   the visit (sessionStorage), like the Design pill.

   Content is automatic, newest first, from js/alerts-data.js and
   js/publications-data.js. "Transaction News" alerts are left out:
   they belong to Deals & Transactions.

   Load order: after the data files and js/topic-images.js, and BEFORE
   js/main.js, so main.js's reveal, tilt and carousel set-up pick up
   everything built here.
   ========================================================= */
(function () {
  "use strict";

  var section = document.getElementById("spotlight");
  if (!section) return;

  var ROOT = "new%20design/";                 // index.html sits one level above "new design"
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var FULL = window.SKRINE_ALERTS_FULL || {};

  // Option C's featured item (an editor's pick): matched by title, falls back to the newest alert
  var FEATURED_TITLE = "Malaysia’s Cross-Border Insolvency Act 2026 Comes into Operation";

  var ALERTS = (window.SKRINE_ALERTS || [])
    .filter(function (a) { return a.label !== "Transaction News" && a.topic !== "Transaction News"; })
    .sort(function (x, y) { return x.date < y.date ? 1 : -1; });
  var PUBS = (window.SKRINE_PUBLICATIONS || []).slice()
    .sort(function (x, y) { return x.date < y.date ? 1 : -1; });

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function parts(iso) { var p = iso.split("-"); return { y: p[0], m: MONTHS[Number(p[1]) - 1], d: p[2] }; }
  function shortDate(iso) { var p = parts(iso); return p.d + " " + p.m + " " + p.y; }
  function monthYear(iso) { var p = parts(iso); return p.m + " " + p.y; }
  // same slug rule as js/article-common.js
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }
  function arrow() { return ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>'; }

  function alertHref(a) {
    var s = slugify(a.title);
    return FULL[s] ? ROOT + "alert.html?a=" + encodeURIComponent(s) : ROOT + "alerts.html";
  }
  function alertTopic(a) { return a.topic || a.practice || a.label || "Alert"; }
  function alertPhoto(a) {
    return window.SkrineTopicImage ? ROOT + window.SkrineTopicImage(a.topic, a.title, a.practice) : ROOT + "images/practice/corporate.jpg";
  }
  function pubHref(p) { return ROOT + "publications.html?q=" + encodeURIComponent(p.title); }
  function pubCover(p) { return ROOT + "images/publications/" + encodeURIComponent(p.cover); }

  var ALL_ALERTS = ROOT + "alerts.html";
  var ALL_PUBS = ROOT + "publications.html";

  /* ---------- shared card markup (the existing Spotlight card styles) ---------- */
  function spotCard(item, feature) {
    var cls = "spot-card" + (feature ? " spot-card--feature" : "") + " reveal";
    if (item.kind === "pub") {
      var p = item.data;
      return '<a href="' + pubHref(p) + '" class="' + cls + ' spot-card--pub" data-tilt>' +
        '<div class="spot-cover spot-cover--photo">' +
          '<img class="spot-cover-blur" src="' + pubCover(p) + '" alt="" aria-hidden="true" loading="lazy">' +
          '<img class="spot-cover-img" src="' + pubCover(p) + '" alt="' + esc(p.title) + '" loading="lazy">' +
        "</div>" +
        '<div class="spot-body">' +
          '<p class="spot-tagline"><span class="spot-pill spot-pill--pub">Publication</span><time datetime="' + p.date + '">' + shortDate(p.date) + "</time></p>" +
          "<h3>" + esc(p.title) + "</h3>" +
          '<span class="read-more">Read more' + arrow() + "</span>" +
        "</div></a>";
    }
    var a = item.data;
    return '<a href="' + alertHref(a) + '" class="' + cls + ' spot-card--alert" data-tilt>' +
      '<div class="spot-cover spot-cover--alert">' +
        '<img class="spot-cover-photo" src="' + alertPhoto(a) + '" alt="" loading="lazy">' +
      "</div>" +
      '<div class="spot-body">' +
        '<p class="spot-tagline"><span class="spot-pill spot-pill--alert">Alert</span><time datetime="' + a.date + '">' + shortDate(a.date) + "</time></p>" +
        "<h3>" + esc(a.title) + "</h3>" +
        '<p class="spot-meta">' + esc([alertTopic(a), a.authors].filter(Boolean).join(" · ")) + "</p>" +
        '<span class="read-more">Read alert' + arrow() + "</span>" +
      "</div></a>";
  }
  function A(a) { return { kind: "alert", data: a }; }
  function P(p) { return { kind: "pub", data: p }; }

  /* =========================================================
     Option A: two columns
     ========================================================= */
  function buildA() {
    var lead = ALERTS[0];
    var rows = ALERTS.slice(1, 5);
    var html = '<div class="sp-a">';

    // alerts
    html += '<div class="sp-col sp-col--alerts">' +
      '<div class="sp-col-head"><h3>Legal Updates</h3><a href="' + ALL_ALERTS + '" class="sp-all">All legal updates' + arrow() + "</a></div>";
    if (lead) {
      html += '<a href="' + alertHref(lead) + '" class="sp-lead reveal" data-tilt>' +
        '<span class="sp-lead-photo"><img src="' + alertPhoto(lead) + '" alt="" loading="lazy"></span>' +
        '<span class="sp-lead-body">' +
          '<span class="sp-tagline"><span class="spot-pill spot-pill--alert">Alert</span><span class="sp-topic">' + esc(alertTopic(lead)) + '</span><time datetime="' + lead.date + '">' + shortDate(lead.date) + "</time></span>" +
          '<span class="sp-lead-title">' + esc(lead.title) + "</span>" +
          (lead.excerpt ? '<span class="sp-lead-excerpt">' + esc(lead.excerpt) + "</span>" : "") +
          '<span class="sp-lead-foot">' + (lead.authors ? '<span class="sp-by">By ' + esc(lead.authors) + "</span>" : "<span></span>") +
            '<span class="read-more">Read alert' + arrow() + "</span></span>" +
        "</span></a>";
    }
    html += '<ol class="sp-rows">';
    rows.forEach(function (a) {
      var p = parts(a.date);
      html += '<li class="reveal"><a href="' + alertHref(a) + '" class="sp-row">' +
        '<time class="sp-date" datetime="' + a.date + '"><b>' + p.d + "</b>" + p.m + "</time>" +
        '<span class="sp-row-text"><small>' + esc(alertTopic(a)) + "</small>" + esc(a.title) + "</span>" +
        '<i class="fa-solid fa-arrow-right sp-row-go" aria-hidden="true"></i></a></li>';
    });
    html += "</ol></div>";

    // publications
    var pl = PUBS[0];
    html += '<div class="sp-col sp-col--pubs">' +
      '<div class="sp-col-head"><h3>Publications</h3><a href="' + ALL_PUBS + '" class="sp-all">All publications' + arrow() + "</a></div>";
    if (pl) {
      html += '<a href="' + pubHref(pl) + '" class="sp-pub-lead reveal" data-tilt>' +
        '<span class="sp-pub-cover"><img class="spot-cover-blur" src="' + pubCover(pl) + '" alt="" aria-hidden="true" loading="lazy">' +
          '<img class="sp-pub-img" src="' + pubCover(pl) + '" alt="' + esc(pl.title) + '" loading="lazy"></span>' +
        '<span class="sp-pub-body">' +
          '<span class="sp-tagline"><span class="spot-pill spot-pill--pub">Publication</span>' + (pl.publisher ? '<span class="sp-topic">' + esc(pl.publisher) + "</span>" : "") + '<time datetime="' + pl.date + '">' + monthYear(pl.date) + "</time></span>" +
          '<span class="sp-pub-title">' + esc(pl.title) + "</span>" +
          '<span class="read-more">Read more' + arrow() + "</span>" +
        "</span></a>";
    }
    PUBS.slice(1, 3).forEach(function (p) {
      html += '<a href="' + pubHref(p) + '" class="sp-pub-row reveal">' +
        '<span class="sp-pub-thumb"><img src="' + pubCover(p) + '" alt="" loading="lazy"></span>' +
        '<span class="sp-pub-row-text"><small>' + esc([p.publisher, monthYear(p.date)].filter(Boolean).join(" · ")) + "</small>" + esc(p.title) + "</span></a>";
    });
    html += "</div></div>";
    return html;
  }

  /* =========================================================
     Option B: tabs over the Spotlight card grid
     ========================================================= */
  function buildB() {
    var a = ALERTS, p = PUBS;
    // Latest: both kinds, newest publication as the large card, then alternating
    var latest = [P(p[0]), A(a[0]), P(p[1]), A(a[1]), P(p[2]), A(a[2]), A(a[3]), P(p[3])].filter(function (x) { return x.data; });
    var tabs = [
      { key: "latest", label: "Latest", items: latest },
      { key: "alerts", label: "Legal Updates", items: a.slice(0, 8).map(A) },
      { key: "pubs", label: "Publications", items: p.slice(0, 8).map(P) }
    ];
    var html = '<div class="sp-tabs" role="tablist" aria-label="Spotlight">';
    tabs.forEach(function (t, i) {
      html += '<button type="button" role="tab" id="spTab-' + t.key + '" aria-controls="spPanel-' + t.key + '" aria-selected="' + (i === 0) + '" data-sp-tab="' + t.key + '">' + t.label + "</button>";
    });
    html += "</div>";
    tabs.forEach(function (t, i) {
      html += '<div class="spotlight-grid" role="tabpanel" id="spPanel-' + t.key + '" aria-labelledby="spTab-' + t.key + '"' + (i ? " hidden" : "") + ">" +
        t.items.map(function (it, k) { return spotCard(it, k === 0); }).join("") + "</div>";
    });
    html += '<div class="section-cta sp-b-cta">' +
      '<a href="' + ALL_ALERTS + '" class="btn btn--outline">All Legal Updates' + arrow() + "</a>" +
      '<a href="' + ALL_PUBS + '" class="btn btn--outline">All Publications' + arrow() + "</a></div>";
    return html;
  }

  /* =========================================================
     Option C: featured, then the alerts carousel, then a shelf of publications
     ========================================================= */
  function buildC() {
    var featured = null;
    ALERTS.some(function (a) { if (a.title === FEATURED_TITLE) { featured = a; return true; } return false; });
    if (!featured) featured = ALERTS[0];
    var carouselAlerts = ALERTS.filter(function (a) { return a !== featured; }).slice(0, 8);

    var html = "";
    if (featured) {
      html += '<a href="' + alertHref(featured) + '" class="sp-featured reveal" data-tilt>' +
        '<span class="sp-featured-photo"><img src="' + alertPhoto(featured) + '" alt="" loading="lazy"></span>' +
        '<span class="sp-featured-body">' +
          '<span class="sp-tagline"><span class="sp-badge">Featured</span><span class="spot-pill spot-pill--alert">Alert</span><time datetime="' + featured.date + '">' + shortDate(featured.date) + "</time></span>" +
          '<span class="sp-featured-title">' + esc(featured.title) + "</span>" +
          (featured.excerpt ? '<span class="sp-featured-excerpt">' + esc(featured.excerpt) + "</span>" : "") +
          '<span class="sp-lead-foot">' + (featured.authors ? '<span class="sp-by">' + esc(alertTopic(featured)) + " · By " + esc(featured.authors) + "</span>" : "<span></span>") +
            '<span class="read-more">Read alert' + arrow() + "</span></span>" +
        "</span></a>";
    }

    // the existing 3D carousel (js/main.js sets it up), filled with the newest alerts
    html += '<div class="sp-sub-head reveal"><h3>Legal Updates</h3><a href="' + ALL_ALERTS + '" class="sp-all">All legal updates' + arrow() + "</a></div>" +
      '<div class="carousel reveal" id="spCarousel" aria-roledescription="carousel" aria-label="Legal updates">' +
        '<button class="carousel-arrow prev" aria-label="Previous update"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<div class="carousel-stage"><ul class="carousel-track">';
    carouselAlerts.forEach(function (a, i) {
      html += '<li class="slide-card">' +
        '<div class="slide-art art-' + ((i % 6) + 1) + '"><span class="slide-tag">' + esc(alertTopic(a)) + '</span><img src="' + alertPhoto(a) + '" alt="" loading="lazy"></div>' +
        '<div class="slide-body"><h3>' + esc(a.title) + '</h3><a href="' + alertHref(a) + '" class="slide-link">Read update' + arrow() + "</a>" +
        '<time datetime="' + a.date + '">' + shortDate(a.date) + "</time></div></li>";
    });
    html += "</ul></div>" +
        '<button class="carousel-arrow next" aria-label="Next update"><i class="fa-solid fa-chevron-right"></i></button>' +
        '<div class="carousel-dots" role="tablist" aria-label="Choose update"></div>' +
      "</div>";

    // shelf of covers
    html += '<div class="sp-sub-head reveal"><h3>Publications</h3><a href="' + ALL_PUBS + '" class="sp-all">All publications' + arrow() + "</a></div>" +
      '<div class="sp-shelf">';
    PUBS.slice(0, 4).forEach(function (p) {
      html += '<a href="' + pubHref(p) + '" class="sp-book reveal" data-tilt>' +
        '<span class="sp-book-cover"><img class="spot-cover-blur" src="' + pubCover(p) + '" alt="" aria-hidden="true" loading="lazy">' +
          '<img class="sp-pub-img" src="' + pubCover(p) + '" alt="' + esc(p.title) + '" loading="lazy"></span>' +
        '<span class="sp-book-text"><small>' + esc([p.publisher, monthYear(p.date)].filter(Boolean).join(" · ")) + "</small>" + esc(p.title) + "</span></a>";
    });
    html += "</div>";
    return html;
  }

  /* ---------- build ---------- */
  var builders = { a: buildA, b: buildB, c: buildC };
  Object.keys(builders).forEach(function (k) {
    var box = section.querySelector('[data-sp-option="' + k + '"]');
    if (box) box.innerHTML = builders[k]();
  });

  /* ---------- Option B tabs ---------- */
  var tabBtns = Array.prototype.slice.call(section.querySelectorAll("[data-sp-tab]"));
  function showTab(key, focus) {
    tabBtns.forEach(function (b) {
      var on = b.dataset.spTab === key;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
      document.getElementById("spPanel-" + b.dataset.spTab).hidden = !on;
    });
    revealIn(document.getElementById("spPanel-" + key));
  }
  tabBtns.forEach(function (b, i) {
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener("click", function () { showTab(b.dataset.spTab); });
    b.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      showTab(tabBtns[(i + dir + tabBtns.length) % tabBtns.length].dataset.spTab, true);
    });
  });

  // cards that were hidden when the page loaded: show them straight away when they appear
  function revealIn(box) {
    if (!box) return;
    box.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- the A / B / C switch ---------- */
  var KEY = "skrine-spotlight";
  var OPTIONS = ["a", "b", "c"];
  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return OPTIONS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }

  var asked = (new URLSearchParams(location.search).get("spot") || "").toLowerCase();
  if (OPTIONS.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);
  var current = asked || recall() || "a";

  var switchBtns = Array.prototype.slice.call(section.querySelectorAll("[data-sp]"));
  function showOption(key, fromUser) {
    current = key;
    section.querySelectorAll("[data-sp-option]").forEach(function (box) {
      var on = box.dataset.spOption === key;
      box.hidden = !on;
      if (on && fromUser) revealIn(box);
    });
    switchBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.sp === key)); });
    // the carousel measures its width: let it re-measure now that it may be visible
    if (key === "c") window.dispatchEvent(new Event("resize"));
    // keep ?spot= in the address, so the link can be shared (and the Design pill keeps it)
    try {
      var url = new URL(location.href);
      url.searchParams.set("spot", key);
      history.replaceState(null, "", url.href);
    } catch (e) { /* file:// in some browsers */ }
  }
  switchBtns.forEach(function (b) {
    b.addEventListener("click", function () { remember(b.dataset.sp); showOption(b.dataset.sp, true); });
  });
  showOption(current, false);
})();
