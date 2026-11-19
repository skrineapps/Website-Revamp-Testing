/* =========================================================
   SKRINE — Alert, full content (alert.html?a=<slug>)
   - Title, tags, date, reading time, authors
   - Left rail: "On this page" (from the subheadings) + share
   - Body with numbered notes that link both ways
   - Disclaimer, previous / next full alerts, related alerts
   Data: js/alerts-full-data.js (+ alerts-data.js for related)
   ========================================================= */
(function () {
  "use strict";

  var A = window.SkrineArticle;
  var FULL = window.SKRINE_ALERTS_FULL || {};
  var ALL = (window.SKRINE_ALERTS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var FX = window.SkrineFX || { observeReveal: function (n) { n.classList.add("is-visible"); } };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var el = A.el;

  var slug = new URLSearchParams(location.search).get("a") || "";
  var D = FULL[slug];
  if (!D) {
    document.querySelectorAll(".ar-crumbs, .ar-head, .ar-layout").forEach(function (n) { n.hidden = true; });
    document.getElementById("arMissing").hidden = false;
    return;
  }

  document.title = D.title + " | Skrine";

  /* ---------- header ---------- */
  var p = D.date.split("-");
  var crumb = document.getElementById("arCrumbMonth");
  crumb.textContent = MONTHS[Number(p[1]) - 1] + " " + p[0];

  var tags = document.getElementById("arTags");
  if (D.label) tags.appendChild(el("span", "alert-tag alert-tag--label", D.label));
  if (D.topic && D.topic !== D.label) tags.appendChild(el("span", "alert-tag", D.topic));
  if (!tags.children.length) tags.remove();

  document.getElementById("arTitle").textContent = D.title;

  var words = D.body.join(" ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  var meta = document.getElementById("arMeta");
  [["fa-regular fa-calendar", A.longDate(D.date)], ["fa-regular fa-clock", Math.max(1, Math.round(words / 220)) + " min read"], D.practice ? ["fa-solid fa-scale-balanced", D.practice + " Practice"] : null]
    .filter(Boolean)
    .forEach(function (m) {
      var s = el("span", "ar-meta-item");
      s.appendChild(A.icon(m[0]));
      s.appendChild(document.createTextNode(" " + m[1]));
      meta.appendChild(s);
    });

  var authorsEl = document.getElementById("arAuthors");
  if (D.authors.length) {
    authorsEl.appendChild(el("p", "ar-rail-label", D.authors.length > 1 ? "Authors" : "Author"));
    var row = el("div", "ar-people");
    D.authors.forEach(function (a) { row.appendChild(A.personChip(a.name)); });
    authorsEl.appendChild(row);
  } else {
    authorsEl.remove();
  }

  /* ---------- body ---------- */
  var body = document.getElementById("arBody");
  A.fillBody(body, D.body);

  // subheadings get ids for the "On this page" list
  var heads = body.querySelectorAll("h2");
  if (heads.length >= 2) {
    var toc = document.getElementById("arToc");
    var list = document.getElementById("arTocList");
    heads.forEach(function (h, i) {
      h.id = "s-" + (i + 1);
      var li = el("li");
      var a = el("a", null, h.textContent);
      a.href = "#" + h.id;
      li.appendChild(a);
      list.appendChild(li);
    });
    toc.hidden = false;
    var links = list.querySelectorAll("a");
    var current = -1;
    function spy() {
      var idx = -1;
      heads.forEach(function (h, i) { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i; });
      if (idx === current) return;
      current = idx;
      links.forEach(function (a, i) { a.classList.toggle("is-active", i === idx); if (i === idx) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    }
    window.addEventListener("scroll", function () { requestAnimationFrame(spy); }, { passive: true });
    spy();
  }

  // notes, linked both ways
  if (D.notes.length) {
    var notes = el("section", "ar-notes");
    notes.setAttribute("aria-label", "Notes");
    notes.appendChild(el("h2", "ar-notes-title", "Notes"));
    var ol = el("ol");
    D.notes.forEach(function (n) {
      var li = el("li");
      li.id = "note-" + n.n;
      li.value = n.n;
      var span = el("span");
      span.innerHTML = n.html;
      li.appendChild(span);
      if (document.getElementById("ref-" + n.n)) {
        var back = el("a", "ar-note-back");
        back.href = "#ref-" + n.n;
        back.setAttribute("aria-label", "Back to text");
        back.appendChild(A.icon("fa-solid fa-arrow-turn-up"));
        li.appendChild(back);
      }
      ol.appendChild(li);
    });
    notes.appendChild(ol);
    body.appendChild(notes);
  }

  var disc = el("aside", "ar-disclaimer");
  disc.appendChild(A.icon("fa-solid fa-circle-info"));
  var dt = el("p");
  dt.innerHTML = 'This alert contains general information only. It does not constitute legal advice nor an expression of legal opinion and should not be relied upon as such. For further information, kindly contact <a href="mailto:skrine@skrine.com">skrine@skrine.com</a>.';
  disc.appendChild(dt);
  body.appendChild(disc);

  // previous / next among the full alerts (newest first)
  var keys = Object.keys(FULL).sort(function (a, b) { return FULL[a].date < FULL[b].date ? 1 : -1; });
  var i = keys.indexOf(slug);
  var pager = el("nav", "ar-pager");
  pager.setAttribute("aria-label", "More alerts");
  [[keys[i + 1], "Previous alert", "prev"], [keys[i - 1], "Next alert", "next"]].forEach(function (x) {
    if (!x[0]) { pager.appendChild(el("span")); return; }
    var a = el("a", "ar-pager-link ar-pager-link--" + x[2]);
    a.href = "alert.html?a=" + encodeURIComponent(x[0]);
    a.appendChild(el("span", "ar-pager-dir", x[1]));
    a.appendChild(el("span", "ar-pager-title", FULL[x[0]].title));
    pager.appendChild(a);
  });
  body.appendChild(pager);

  A.share(D.title);
  A.progress(body);

  /* ---------- related ---------- */
  var related = ALL.filter(function (a) { return A.slugify(a.title) !== slug && a.topic === D.topic; });
  if (related.length < 3) related = related.concat(ALL.filter(function (a) { return A.slugify(a.title) !== slug && related.indexOf(a) === -1; }));
  related = related.slice(0, 3);
  if (related.length) {
    var grid = document.getElementById("arRelatedGrid");
    related.forEach(function (a) {
      var s = A.slugify(a.title);
      var c = A.relatedCard({ href: FULL[s] ? "alert.html?a=" + encodeURIComponent(s) : "alerts.html", meta: (a.label || a.topic || "Alert") + " · " + A.shortDate(a.date), title: a.title, full: !!FULL[s] });
      grid.appendChild(c);
      FX.observeReveal(c);
    });
    document.getElementById("arRelated").hidden = false;
  }
})();
