/* =========================================================
   SKRINE — Archive (archive.html)
   Everything published before ARCHIVE_BEFORE, gathered from the
   existing data files, plus collections retired on skrine.com.
   Kept out of the main navigation: linked from the footer and from
   the end of the Alerts, Publications and News & Events listings.
   - year rail (left) jumps to a year; search and type filters on top
   - compact ruled rows: date · type · title
   ========================================================= */
window.SKRINE_ARCHIVE_BEFORE = "2025-01-01";
(function () {
  "use strict";
  var BEFORE = window.SKRINE_ARCHIVE_BEFORE;
  var listEl = document.getElementById("arcList");
  if (!listEl) return;

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmt(iso) { var p = iso.split("-"); return p[2] + " " + MON[Number(p[1]) - 1] + " " + p[0]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  // same slug rule as js/news-events.js / js/article-common.js
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }

  var NEWS_FULL = window.SKRINE_NEWS_FULL || {};
  var ITEMS = [];
  (window.SKRINE_PUBLICATIONS || []).forEach(function (p) {
    if (!p.date || p.date >= BEFORE) return;
    ITEMS.push({ type: "pub", label: "Publication", date: p.date, title: p.title, meta: p.publisher || "",
      href: p.pdf || "publications.html", ext: !!p.pdf });
  });
  (window.SKRINE_NEWS || []).forEach(function (n) {
    if (!n.date || n.date >= BEFORE) return;
    var s = slugify(n.title);
    ITEMS.push({ type: "news", label: "News & Events", date: n.date, title: n.title, meta: n.category || "",
      href: NEWS_FULL[s] ? "news.html?n=" + encodeURIComponent(s) : "news-events.html", ext: false });
  });
  ITEMS.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  ITEMS.forEach(function (it) { it._hay = norm(it.title + " " + it.meta + " " + it.label); });

  var state = { q: "", type: "all" };
  var railEl = document.getElementById("arcRail");
  var countEl = document.getElementById("arcCount");
  var emptyEl = document.getElementById("arcEmpty");

  function render() {
    var q = norm(state.q).trim();
    var rows = ITEMS.filter(function (it) {
      return (state.type === "all" || it.type === state.type) && (!q || it._hay.indexOf(q) > -1);
    });
    var years = {};
    rows.forEach(function (it) { (years[it.date.slice(0, 4)] = years[it.date.slice(0, 4)] || []).push(it); });
    var ys = Object.keys(years).sort().reverse();

    listEl.innerHTML = ys.map(function (y) {
      return '<section class="arc-year" id="y' + y + '"><h2 class="arc-year-head">' + y + '<span>' + years[y].length + "</span></h2><ul>" +
        years[y].map(function (it) {
          return '<li><a class="arc-row" href="' + esc(it.href) + '"' + (it.ext ? ' target="_blank" rel="noopener"' : "") + ">" +
            '<time datetime="' + it.date + '">' + fmt(it.date) + "</time>" +
            '<span class="arc-type arc-type--' + it.type + '">' + esc(it.label) + "</span>" +
            '<span class="arc-title">' + esc(it.title) + (it.meta ? "<small>" + esc(it.meta) + "</small>" : "") + "</span>" +
            '<i class="fa-solid ' + (it.ext ? "fa-arrow-up-right-from-square" : "fa-arrow-right") + '" aria-hidden="true"></i>' +
            "</a></li>";
        }).join("") + "</ul></section>";
    }).join("");

    railEl.innerHTML = ys.map(function (y) {
      return '<li><a href="#y' + y + '">' + y + "<span>" + years[y].length + "</span></a></li>";
    }).join("");
    countEl.textContent = rows.length + (rows.length === 1 ? " item" : " items");
    emptyEl.hidden = rows.length > 0;
  }

  var search = document.getElementById("arcSearch");
  var t = null;
  search.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = search.value; render(); }, 150); });
  Array.prototype.forEach.call(document.querySelectorAll(".arc-types button"), function (b) {
    b.addEventListener("click", function () {
      state.type = b.dataset.type;
      document.querySelectorAll(".arc-types button").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      render();
    });
  });
  // ?type=pub|news from the "browse the archive" links
  var asked = new URLSearchParams(location.search).get("type");
  var btn = asked && document.querySelector('.arc-types button[data-type="' + asked + '"]');
  if (btn) btn.click(); else render();
})();
