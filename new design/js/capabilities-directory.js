/* =========================================================
   SKRINE — Practice Areas, Layout 4: the directory
   The partners' structure (write-ups document) shown as an A–Z
   directory: every practice area is one row with its two doors side
   by side, "Advisory" (the practice area page) and "Disputes" (its
   own disputes page, with its own team). Dispute Resolution sits on
   top as a band listing every area of dispute, each opening the same
   Disputes page as the row below, so both ways in lead to one page.
   Data: js/practice-data-v2.js (shared with Layout 3).
   Pages: practice-area-v2.html (shared with Layout 3).
   Styles: css/capabilities-directory.css.
   ========================================================= */
(function () {
  "use strict";
  var D = window.SKRINE_CAPABILITIES_V2;
  var root = document.getElementById("paDirectory");
  if (!D || !root) return;

  var FX = window.SkrineFX || { observeReveal: function (n) { n.classList.add("is-visible"); } };
  var areaUrl = function (slug) { return "practice-area-v2.html?area=" + encodeURIComponent(slug); };
  var disputesUrl = function (slug) { return "practice-area-v2.html?disputes=" + encodeURIComponent(slug); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el("i", name); i.setAttribute("aria-hidden", "true"); return i; }
  // first sentence of the intro, as a one-line description
  function firstSentence(x) {
    var t = (x.intro && x.intro[0]) || "";
    var m = t.match(/^.*?[.!?](\s|$)/);
    return (m ? m[0] : t).trim();
  }

  var byTitle = function (a, b) { return a.title.localeCompare(b.title, "en", { sensitivity: "base" }); };
  var practices = D.practices.slice().sort(byTitle);
  var hub = practices.filter(function (p) { return p.kind === "hub"; })[0];
  var rows = practices.filter(function (p) { return p.kind !== "hub"; });

  /* ---------- Dispute Resolution band ---------- */
  if (hub) {
    var band = el("section", "pd-band reveal");
    band.setAttribute("aria-labelledby", "pdBandTitle");
    var head = el("div", "pd-band-head");
    var txt = el("div");
    txt.appendChild(el("p", "pd-band-eyebrow", D.drList.length + " areas of dispute"));
    var h = el("h2", "pd-band-title");
    h.id = "pdBandTitle";
    var ha = el("a", null, hub.title);
    ha.href = areaUrl(hub.slug);
    h.appendChild(ha);
    txt.appendChild(h);
    txt.appendChild(el("p", "pd-band-text", firstSentence(hub)));
    head.appendChild(txt);
    var go = el("a", "pd-band-go");
    go.href = areaUrl(hub.slug);
    go.appendChild(document.createTextNode("Overview "));
    go.appendChild(icon("fa-solid fa-arrow-right"));
    head.appendChild(go);
    band.appendChild(head);

    var chips = el("ul", "pd-band-chips");
    D.drList.forEach(function (r) {
      var li = el("li");
      if (r.pending) {
        var s = el("span", "pd-chip is-pending", r.label);
        s.title = "Page to follow";
        li.appendChild(s);
      } else {
        var a = el("a", "pd-chip", r.label);
        a.href = r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area);
        li.appendChild(a);
      }
      chips.appendChild(li);
    });
    band.appendChild(chips);
    root.appendChild(band);
  }

  /* ---------- the filter: all / with a disputes team ---------- */
  var bar = el("div", "pd-bar reveal");
  var count = el("p", "pd-count");
  bar.appendChild(count);
  var filters = el("div", "pd-filter");
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Show");
  var FILTERS = [["all", "All practice areas"], ["both", "With a disputes team"]];
  var buttons = FILTERS.map(function (f) {
    var b = el("button", null, f[1]);
    b.type = "button";
    b.addEventListener("click", function () { setFilter(f[0]); });
    filters.appendChild(b);
    return b;
  });
  bar.appendChild(filters);
  root.appendChild(bar);

  /* ---------- row style switch (review aid) ----------
     1  Rows     the whole row opens the practice area; a small "Disputes team" link when there is one
     2  Columns  two columns headed Advisory / Disputes, a dot where a page exists
     ?rows=1..2 picks one; remembered for the visit.
     (An earlier "Buttons" style was dropped after review.) */
  var STYLES = ["1", "2"];
  var STYLE_NAMES = { "1": "Rows", "2": "Columns" };
  var STYLE_KEY = "skrine-pd-rows-v2";
  function remember(v) { try { sessionStorage.setItem(STYLE_KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(STYLE_KEY); return STYLES.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  var asked = new URLSearchParams(location.search).get("rows");
  if (STYLES.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);

  var styleNav = el("div", "pd-style");
  styleNav.setAttribute("role", "group");
  styleNav.setAttribute("aria-label", "Row style (review)");
  styleNav.appendChild(el("span", "pd-style-label", "Row style"));
  var styleButtons = STYLES.map(function (s) {
    var b = el("button", null, s);
    b.type = "button";
    b.title = STYLE_NAMES[s];
    b.setAttribute("aria-label", "Row style " + s + ": " + STYLE_NAMES[s]);
    b.addEventListener("click", function () { remember(s); setStyle(s); });
    styleNav.appendChild(b);
    return b;
  });
  bar.insertBefore(styleNav, filters);

  /* ---------- the A–Z rows ---------- */
  var list = el("ol", "pd-list");
  root.appendChild(list);
  var style = asked || recall() || "1";
  var filter = "all";

  // style 1: a small disputes link under the description
  function tag1(p) {
    if (p.kind === "disputes-only") return el("span", "pd-tag pd-tag--plain", "Disputes practice");
    if (!p.disputes) return null;
    var a = el("a", "pd-tag");
    a.href = disputesUrl(p.disputes);
    a.appendChild(icon("fa-solid fa-scale-balanced"));
    a.appendChild(document.createTextNode(" Disputes team "));
    a.appendChild(icon("fa-solid fa-arrow-right"));
    return a;
  }

  // style 2: one cell per column
  function cell2(href, label) {
    var c = el("span", "pd-cell");
    if (!href) { c.appendChild(el("span", "pd-dash", "–")); return c; }
    var a = el("a", "pd-dot");
    a.href = href;
    a.setAttribute("aria-label", label);
    a.appendChild(icon("fa-solid fa-arrow-right"));
    c.appendChild(a);
    return c;
  }

  function render() {
    list.textContent = "";
    list.className = "pd-list pd-s" + style;
    if (style === "2") {
      var hd = el("li", "pd-row pd-head");
      hd.setAttribute("aria-hidden", "true");
      hd.appendChild(el("span", "pd-letter"));
      hd.appendChild(el("span", "pd-main"));
      hd.appendChild(el("span", "pd-cell", "Advisory"));
      hd.appendChild(el("span", "pd-cell", "Disputes"));
      list.appendChild(hd);
    }
    var lastLetter = "";
    rows.forEach(function (p) {
      var li = el("li", "pd-row");
      li.dataset.both = (p.disputes || p.kind === "disputes-only") ? "1" : "0";
      var letter = p.title.charAt(0).toUpperCase();
      li.appendChild(el("span", "pd-letter", letter !== lastLetter ? letter : ""));
      lastLetter = letter;

      var main = el("div", "pd-main");
      var name = el("a", "pd-name", p.title);
      name.href = areaUrl(p.slug);
      main.appendChild(name);
      main.appendChild(el("p", "pd-desc", firstSentence(p)));
      li.appendChild(main);

      if (style === "1") {
        var t = tag1(p);
        if (t) main.appendChild(t);
        li.appendChild(icon("fa-solid fa-arrow-right pd-go"));
      } else {
        var only = p.kind === "disputes-only";
        li.appendChild(cell2(only ? null : areaUrl(p.slug), p.title + ": advisory"));
        li.appendChild(cell2(only ? areaUrl(p.slug) : p.disputes ? disputesUrl(p.disputes) : null, p.title + ": disputes"));
      }
      list.appendChild(li);
    });
    applyFilter();
  }

  function applyFilter() {
    var shown = 0;
    list.querySelectorAll(".pd-row:not(.pd-head)").forEach(function (li) {
      var on = filter === "all" || li.dataset.both === "1";
      li.hidden = !on;
      if (on) shown++;
    });
    buttons.forEach(function (b, i) { b.setAttribute("aria-pressed", String(FILTERS[i][0] === filter)); });
    count.textContent = shown + " practice areas";
    list.classList.toggle("is-filtered", filter !== "all");
  }
  function setFilter(f) { filter = f; applyFilter(); }
  function setStyle(s) {
    style = s;
    styleButtons.forEach(function (b, i) { b.setAttribute("aria-pressed", String(STYLES[i] === s)); });
    render();
  }
  setStyle(style);

  root.querySelectorAll(".reveal").forEach(function (n) { FX.observeReveal(n); });
})();
