/* =========================================================
   SKRINE — Life at Skrine section pages
   Renders the story list for the page's section (body[data-life])
   from js/life-data.js: the latest story featured, the rest in an
   editorial grid (newest first). Each story opens on life-story.html.
   ========================================================= */
(function () {
  "use strict";
  var key = document.body.getAttribute("data-life");
  var list = (window.SKRINE_LIFE || {})[key] || [];
  var root = document.getElementById("lifeStories");
  if (!root || !list.length) return;

  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmt(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MON[Number(p[1]) - 1] + " " + p[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var items = list.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var countEl = document.getElementById("lifeCount");
  if (countEl) countEl.textContent = items.length;

  function href(it) { return "life-story.html?n=" + encodeURIComponent(it.slug); }

  var first = items[0];
  var html =
    '<a class="life-latest" href="' + esc(href(first)) + '">' +
      '<span class="kit-frame life-latest-media">' + (first.image ? '<img src="' + esc(first.image) + '" alt="">' : "") + "</span>" +
      '<span class="life-latest-body">' +
        '<span class="brush-tag">Latest</span>' +
        '<time datetime="' + first.date + '">' + fmt(first.date) + "</time>" +
        '<span class="life-latest-title">' + esc(first.title) + "</span>" +
        '<span class="kit-link">Read the story <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>' +
      "</span></a>";

  html += '<ol class="life-grid">' + items.slice(1).map(function (it) {
    return '<li><a class="life-item" href="' + esc(href(it)) + '">' +
      '<span class="life-item-media">' + (it.image ? '<img src="' + esc(it.image) + '" alt="" loading="lazy">' : "") + "</span>" +
      '<span class="life-item-meta"><time datetime="' + it.date + '">' + fmt(it.date) + "</time></span>" +
      '<span class="life-item-title">' + esc(it.title) + "</span>" +
      "</a></li>";
  }).join("") + "</ol>";

  root.innerHTML = html;
})();
