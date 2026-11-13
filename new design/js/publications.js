/* =========================================================
   SKRINE — Publications page
   - Spotlight: the newest publication
   - Filter bar: search, topic + publisher dropdowns, year
   - Grid grouped by year; a card opens a quick-view pop-up
   Data: js/publications-data.js · author photos via js/people-data.js
   ========================================================= */
(function () {
  "use strict";

  var PUBS = (window.SKRINE_PUBLICATIONS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var COVER_DIR = "images/publications/";
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var listEl = document.getElementById("pubList");
  if (!listEl) return;

  var state = { q: "", topic: null, publisher: null, year: "" };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.,]/g, "").replace(/\s+/g, " ").trim(); }
  function fmtDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  var photoByName = {};
  ["partners", "consultants", "seniorAssociates", "associates"].forEach(function (role) {
    (PEOPLE[role] || []).forEach(function (p) { if (p.photo) photoByName[p.name] = p.photo; });
  });
  function initials(name) {
    var p = name.replace(/^To’? ?Puan /i, "").replace(/[’'.]/g, "").split(/\s+/);
    return ((p[0] || "")[0] + ((p[1] || "")[0] || "")).toUpperCase();
  }
  function avatar(name, cls) {
    var a = el("span", "pub-avatar" + (cls ? " " + cls : ""));
    a.title = name;
    var file = photoByName[name];
    if (file) {
      var img = el("img");
      img.src = photoUrl(file);
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.replaceWith(el("span", null, initials(name))); });
      a.appendChild(img);
    } else {
      a.appendChild(el("span", null, initials(name)));
    }
    return a;
  }
  function avatarStack(names, max) {
    var wrap = el("span", "pub-stack");
    names.slice(0, max).forEach(function (n) { wrap.appendChild(avatar(n)); });
    if (names.length > max) wrap.appendChild(el("span", "pub-avatar pub-avatar--more", "+" + (names.length - max)));
    return wrap;
  }
  function metaLine(p) {
    return [p.publisher, fmtDate(p.date)].filter(Boolean).join(" · ");
  }
  // the whole cover is shown (covers differ in shape and carry their own titles);
  // a blurred copy of it fills the space behind
  function cover(p) {
    var url = /^(https?:)?\/\//.test(p.cover) ? p.cover : COVER_DIR + encodeURIComponent(p.cover);
    var frame = el("span", "pub-cover");
    // absolute address: a url() inside a CSS variable resolves against the stylesheet otherwise
    frame.style.setProperty("--cover", 'url("' + new URL(url, document.baseURI).href + '")');
    var img = el("img");
    img.src = url;
    img.alt = "";
    img.loading = "lazy";
    frame.appendChild(img);
    return frame;
  }

  PUBS.forEach(function (p) { p._hay = norm([p.title, p.publisher, p.topic, p.authors.join(" "), p.summary].join(" ")); p._year = p.date.slice(0, 4); });

  /* ---------- Spotlight ---------- */
  var spot = document.getElementById("pubSpotlight");
  (function () {
    var p = PUBS[0];
    if (!p) return;
    var media = el("button", "pub-spot-media");
    media.type = "button";
    media.setAttribute("aria-label", "Open " + p.title);
    media.appendChild(cover(p));
    media.addEventListener("click", function () { openModal(p); });
    spot.appendChild(media);
    var body = el("div", "pub-spot-body");
    var top = el("p", "pub-spot-top");
    top.appendChild(el("span", "pub-spot-badge", "Latest publication"));
    if (p.topic) top.appendChild(el("span", "alert-tag", p.topic));
    body.appendChild(top);
    body.appendChild(el("p", "pub-meta", metaLine(p)));
    body.appendChild(el("h2", "pub-spot-title", p.title));
    if (p.summary) body.appendChild(el("p", "pub-spot-summary", p.summary));
    if (p.authors.length) {
      var by = el("div", "pub-spot-authors");
      by.appendChild(avatarStack(p.authors, 5));
      var namesEl = el("span", "pub-authors-names");
      if (window.SkrinePeople) namesEl.appendChild(window.SkrinePeople.linkList(p.authors));
      else namesEl.textContent = p.authors.join(", ");
      by.appendChild(namesEl);
      body.appendChild(by);
    }
    body.appendChild(actions(p));
    spot.appendChild(body);
  })();

  function actions(p) {
    var wrap = el("div", "pub-actions");
    if (p.pdf) {
      var a = el("a", "btn btn--solid");
      a.href = p.pdf;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = 'Read the full publication <i class="fa-solid fa-file-pdf" aria-hidden="true"></i>';
      wrap.appendChild(a);
    }
    return wrap;
  }

  /* ---------- Cards ---------- */
  function card(p, i) {
    var c = el("button", "pub-card reveal");
    c.type = "button";
    c.style.setProperty("--delay", ((i % 3) * 0.06) + "s");
    c.setAttribute("aria-haspopup", "dialog");
    var media = el("span", "pub-card-media");
    media.appendChild(cover(p));
    if (p.pdf) {
      var b = el("span", "pub-card-pdf");
      b.innerHTML = '<i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF';
      media.appendChild(b);
    }
    c.appendChild(media);
    var body = el("span", "pub-card-body");
    body.appendChild(el("span", "pub-meta", metaLine(p)));
    body.appendChild(el("span", "pub-card-title", p.title));
    var foot = el("span", "pub-card-foot");
    if (p.authors.length) foot.appendChild(avatarStack(p.authors, 4));
    if (p.topic) foot.appendChild(el("span", "alert-tag", p.topic));
    body.appendChild(foot);
    c.appendChild(body);
    c.addEventListener("click", function () { openModal(p); });
    return c;
  }

  /* ---------- Dropdown filters (topic, publisher) ---------- */
  function setupDropdown(key, label) {
    var wrap = document.querySelector('.topic-filter[data-filter="' + key + '"]');
    var toggle = wrap.querySelector(".topic-toggle");
    var panel = wrap.querySelector(".topic-panel");
    var chips = wrap.querySelector(".topic-chips");
    var current = wrap.querySelector(".topic-current");
    var counts = {};
    PUBS.forEach(function (p) { if (p[key]) counts[p[key]] = (counts[p[key]] || 0) + 1; });
    var values = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });

    function chip(text, value, n) {
      var b = el("button", "topic-chip");
      b.type = "button";
      b.dataset.value = value || "";
      b.setAttribute("aria-pressed", String(!value));
      b.appendChild(el("span", null, text));
      b.appendChild(el("span", "topic-chip-count", String(n)));
      b.addEventListener("click", function () { state[key] = value; open(false); render(); toggle.focus(); });
      chips.appendChild(b);
    }
    chip("All " + label, null, PUBS.length);
    values.forEach(function (v) { chip(v, v, counts[v]); });

    function open(on) {
      panel.hidden = !on;
      toggle.setAttribute("aria-expanded", String(on));
      toggle.classList.toggle("is-open", on);
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      document.querySelectorAll(".topic-filter .topic-panel").forEach(function (p) { if (p !== panel) p.hidden = true; });
      open(panel.hidden);
    });
    document.addEventListener("click", function (e) { if (!panel.hidden && !wrap.contains(e.target)) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { open(false); toggle.focus(); } });

    return function sync() {
      current.textContent = state[key] || "All " + label;
      toggle.classList.toggle("has-value", !!state[key]);
      chips.querySelectorAll(".topic-chip").forEach(function (b) { b.setAttribute("aria-pressed", String((b.dataset.value || null) === state[key])); });
    };
  }
  var syncTopic = setupDropdown("topic", "topics");
  var syncPublisher = setupDropdown("publisher", "publishers");

  var yearSel = document.getElementById("pubYear");
  Array.from(new Set(PUBS.map(function (p) { return p._year; }))).forEach(function (y) {
    var o = el("option", null, y);
    o.value = y;
    yearSel.appendChild(o);
  });
  yearSel.addEventListener("change", function () { state.year = yearSel.value; render(); });

  /* ---------- Render ---------- */
  var resultsEl = document.getElementById("pubResults");
  var emptyEl = document.getElementById("pubEmpty");

  function render() {
    var q = norm(state.q);
    var list = PUBS.filter(function (p) {
      if (state.topic && p.topic !== state.topic) return false;
      if (state.publisher && p.publisher !== state.publisher) return false;
      if (state.year && p._year !== state.year) return false;
      if (q && p._hay.indexOf(q) === -1) return false;
      return true;
    });
    var filtered = !!(q || state.topic || state.publisher || state.year);
    var items = filtered ? list : list.slice(1); // newest is in the spotlight

    syncTopic();
    syncPublisher();
    spot.hidden = filtered;
    resultsEl.textContent = filtered ? list.length + " of " + PUBS.length + " publications" : PUBS.length + " publications";
    emptyEl.hidden = list.length > 0;

    listEl.textContent = "";
    var byYear = {};
    var years = [];
    items.forEach(function (p) {
      if (!byYear[p._year]) { byYear[p._year] = []; years.push(p._year); }
      byYear[p._year].push(p);
    });
    years.forEach(function (y) {
      var sec = el("section", "pub-year");
      var head = el("header", "pub-year-head");
      head.appendChild(el("h2", "pub-year-title", y));
      head.appendChild(el("span", "alert-month-count", byYear[y].length + (byYear[y].length === 1 ? " publication" : " publications")));
      sec.appendChild(head);
      var grid = el("div", "pub-grid");
      byYear[y].forEach(function (p, i) {
        var c = card(p, i);
        grid.appendChild(c);
        FX.observeReveal(c);
      });
      sec.appendChild(grid);
      listEl.appendChild(sec);
    });
  }

  var t;
  document.getElementById("pubSearch").addEventListener("input", function (e) {
    clearTimeout(t);
    t = setTimeout(function () { state.q = e.target.value; render(); }, 150);
  });
  document.getElementById("pubReset").addEventListener("click", function () {
    state = { q: "", topic: null, publisher: null, year: "" };
    document.getElementById("pubSearch").value = "";
    yearSel.value = "";
    render();
  });

  /* ---------- Quick-view pop-up ---------- */
  var modal = document.getElementById("pubModal");
  var lastFocus = null;
  function openModal(p) {
    lastFocus = document.activeElement;
    var holder = modal.querySelector(".pub-modal-cover");
    holder.replaceWith((function () { var c = cover(p); c.classList.add("pub-modal-cover"); return c; })());
    document.getElementById("pubModalMeta").textContent = metaLine(p) + (p.topic ? " · " + p.topic : "");
    document.getElementById("pubModalTitle").textContent = p.title;
    document.getElementById("pubModalSummary").textContent = p.summary || "";
    var au = document.getElementById("pubModalAuthors");
    au.textContent = "";
    if (p.authors.length) {
      au.appendChild(el("p", "pub-modal-label", "Contributors"));
      var ul = el("ul", "pub-modal-people");
      p.authors.forEach(function (n) {
        var li = el("li");
        li.appendChild(avatar(n));
        li.appendChild(window.SkrinePeople ? window.SkrinePeople.link(n) : el("span", null, n));
        ul.appendChild(li);
      });
      au.appendChild(ul);
    }
    var act = document.getElementById("pubModalActions");
    act.textContent = "";
    act.appendChild(actions(p));
    if (!p.pdf) act.appendChild(el("p", "pub-modal-note", "The full text is available from the publisher."));
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }
  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-close]")) modal.close();
  });

  render();
})();
