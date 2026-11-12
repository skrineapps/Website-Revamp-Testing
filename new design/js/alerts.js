/* =========================================================
   SKRINE — Alerts page
   - Latest: the four newest alerts
   - Filter bar: search + topic dropdown
   - Archive: every alert grouped by month, with a month rail
     that highlights the month in view and jumps on click
   Data: js/alerts-data.js
   ========================================================= */
(function () {
  "use strict";

  var ALERTS = (window.SKRINE_ALERTS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var LATEST = 4;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var listEl = document.getElementById("alertList");
  if (!listEl) return;
  var latestEl = document.getElementById("alertLatest");
  var latestSection = latestEl.closest(".alerts-latest");
  var railEl = document.getElementById("monthRail");
  var chipsEl = document.getElementById("alertTopics");
  var searchEl = document.getElementById("alertSearch");
  var resultsEl = document.getElementById("alertResults");
  var emptyEl = document.getElementById("alertEmpty");
  var toggle = document.getElementById("topicToggle");
  var panel = document.getElementById("topicPanel");
  var currentEl = document.getElementById("topicCurrent");
  var clearBtn = document.getElementById("topicClear");

  var state = { q: "", topic: null };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, ""); }
  function parts(iso) { var p = iso.split("-"); return { y: p[0], m: Number(p[1]) - 1, d: p[2] }; }
  function longDate(iso) { var p = parts(iso); return Number(p.d) + " " + MONTHS[p.m] + " " + p.y; }
  function monthKey(iso) { var p = parts(iso); return p.y + "-" + String(p.m + 1).padStart(2, "0"); }
  // site header + the sticky filter bar + a little breathing room
  function headerOffset() {
    var bar = document.querySelector(".alerts-toolbar");
    return (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 76) + (bar ? bar.offsetHeight : 0) + 20;
  }

  ALERTS.forEach(function (a) { a._hay = norm([a.title, a.label, a.topic, a.practice, a.authors, a.excerpt].join(" ")); });

  // full-content page (alert.html) when one exists; slug rule matches js/article-common.js
  var FULL = window.SKRINE_ALERTS_FULL || {};
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }
  function fullHref(a) { var s = slugify(a.title); return FULL[s] ? "alert.html?a=" + encodeURIComponent(s) : "#"; }

  function tags(a) {
    var wrap = el("p", "alert-tags");
    if (a.label) wrap.appendChild(el("span", "alert-tag alert-tag--label", a.label));
    // skip the topic when the series label already names it (e.g. "Employment Law Update")
    var repeats = a.label && a.topic && norm(a.label).indexOf(norm(a.topic.split(" ")[0])) > -1;
    if (a.topic && !repeats) wrap.appendChild(el("span", "alert-tag", a.topic));
    return wrap;
  }

  /* ---------- Latest ---------- */
  ALERTS.slice(0, LATEST).forEach(function (a, i) {
    var lead = i === 0;
    var card = el("a", "latest-card reveal" + (lead ? " latest-card--lead" : ""));
    card.href = fullHref(a);
    card.style.setProperty("--delay", (i * 0.08) + "s");
    if (lead) card.setAttribute("data-tilt", "");
    var top = el("div", "latest-top");
    if (lead) top.appendChild(el("span", "latest-badge", "Newest"));
    top.appendChild(el("time", "latest-date", longDate(a.date)));
    card.appendChild(top);
    card.appendChild(tags(a));
    card.appendChild(el("h3", "latest-title", a.title));
    if (lead && a.excerpt) card.appendChild(el("p", "latest-excerpt", a.excerpt));
    var foot = el("div", "latest-foot");
    if (lead && a.authors) foot.appendChild(el("span", "alert-authors", "By " + a.authors));
    var cta = el("span", "alert-read");
    cta.innerHTML = 'Read alert <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    foot.appendChild(cta);
    card.appendChild(foot);
    latestEl.appendChild(card);
    FX.observeReveal(card);
    if (lead) FX.attachTilt(card);
  });

  /* ---------- Topic dropdown ---------- */
  var counts = {};
  ALERTS.forEach(function (a) { if (a.topic) counts[a.topic] = (counts[a.topic] || 0) + 1; });
  var topics = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });

  function chip(label, value, count) {
    var b = el("button", "topic-chip");
    b.type = "button";
    b.dataset.topic = value || "";
    b.setAttribute("aria-pressed", "false");
    b.appendChild(el("span", null, label));
    b.appendChild(el("span", "topic-chip-count", String(count)));
    b.addEventListener("click", function () {
      state.topic = value;
      setPanel(false);
      render();
      toResults();
      toggle.focus();
    });
    chipsEl.appendChild(b);
  }
  chip("All topics", null, ALERTS.length);
  topics.forEach(function (t) { chip(t, t, counts[t]); });

  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setPanel(panel.hidden);
  });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !e.target.closest("#topicFilter")) setPanel(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { setPanel(false); toggle.focus(); }
  });
  clearBtn.addEventListener("click", function () { state.topic = null; render(); toResults(); });

  // after changing topic, bring the top of the results into view
  function toResults() {
    var bar = document.querySelector(".alerts-toolbar");
    var top = bar.parentElement.querySelector(".alerts-archive").getBoundingClientRect().top + window.scrollY - headerOffset() + 20;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  /* ---------- Archive by month ---------- */
  var observer = null;

  function row(a) {
    var p = parts(a.date);
    var r = el("a", "alert-row reveal");
    r.href = fullHref(a);
    var date = el("time", "alert-date");
    date.dateTime = a.date;
    date.appendChild(el("span", "alert-day", p.d));
    date.appendChild(el("span", "alert-mon", MONTHS[p.m].slice(0, 3)));
    r.appendChild(date);
    var body = el("div", "alert-body");
    body.appendChild(tags(a));
    body.appendChild(el("h4", "alert-title", a.title));
    if (a.authors) body.appendChild(el("p", "alert-authors", "By " + a.authors));
    r.appendChild(body);
    var arrow = el("span", "alert-arrow");
    arrow.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    r.appendChild(arrow);
    return r;
  }

  function render() {
    var q = norm(state.q.trim());
    var filtered = !!(q || state.topic);
    var matches = ALERTS.filter(function (a) {
      if (state.topic && a.topic !== state.topic) return false;
      if (q && a._hay.indexOf(q) === -1) return false;
      return true;
    });

    // toolbar state
    currentEl.textContent = state.topic || "All topics";
    toggle.classList.toggle("has-value", !!state.topic);
    clearBtn.hidden = !state.topic;
    chipsEl.querySelectorAll(".topic-chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String((b.dataset.topic || null) === state.topic));
    });
    resultsEl.textContent = filtered ? matches.length + " of " + ALERTS.length + " alerts" : ALERTS.length + " alerts";
    latestSection.hidden = filtered; // while filtering, the archive shows the results

    // group by month
    var groups = [];
    var byKey = {};
    matches.forEach(function (a) {
      var k = monthKey(a.date);
      if (!byKey[k]) { byKey[k] = { key: k, date: a.date, items: [] }; groups.push(byKey[k]); }
      byKey[k].items.push(a);
    });

    listEl.textContent = "";
    railEl.textContent = "";
    emptyEl.hidden = matches.length > 0;
    if (observer) observer.disconnect();

    groups.forEach(function (g) {
      var p = parts(g.date);
      var id = "m-" + g.key;

      // month rail entry
      var li = el("li");
      var link = el("a", "month-link");
      link.href = "#" + id;
      link.appendChild(el("span", "month-link-name", MONTHS[p.m] + " " + p.y));
      link.appendChild(el("span", "month-link-count", String(g.items.length)));
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(id);
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerOffset(), behavior: "smooth" });
      });
      li.appendChild(link);
      railEl.appendChild(li);

      // month section
      var sec = el("section", "alert-month");
      sec.id = id;
      sec.dataset.key = g.key;
      var head = el("header", "alert-month-head");
      var big = el("h2", "alert-month-title");
      big.appendChild(el("span", "alert-month-name", MONTHS[p.m]));
      big.appendChild(el("span", "alert-month-year", p.y));
      head.appendChild(big);
      head.appendChild(el("span", "alert-month-count", g.items.length + (g.items.length === 1 ? " alert" : " alerts")));
      sec.appendChild(head);
      var list = el("div", "alert-month-list");
      g.items.forEach(function (a) {
        var r = row(a);
        list.appendChild(r);
        FX.observeReveal(r);
      });
      sec.appendChild(list);
      listEl.appendChild(sec);
    });

    // highlight the month currently in view
    if ("IntersectionObserver" in window && groups.length) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var key = en.target.dataset.key;
          railEl.querySelectorAll(".month-link").forEach(function (l) {
            l.classList.toggle("is-current", l.getAttribute("href") === "#m-" + key);
          });
        });
      }, { rootMargin: "-35% 0px -60% 0px" });
      listEl.querySelectorAll(".alert-month").forEach(function (s) { observer.observe(s); });
      railEl.querySelector(".month-link").classList.add("is-current");
    }
  }

  var t;
  searchEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = searchEl.value; render(); }, 150);
  });
  document.getElementById("alertReset").addEventListener("click", function () {
    state = { q: "", topic: null };
    searchEl.value = "";
    render();
  });

  render();
})();
