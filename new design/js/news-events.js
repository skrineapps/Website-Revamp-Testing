/* =========================================================
   SKRINE — News & Events
   - Page nav: Latest / Upcoming tabs (#latest, #upcoming)
   - Latest: headline story + 3 more, category chips, search,
     card grid with "Load more" and a quick-view pop-up
   - Upcoming: event list, or a designed empty state when
     nothing is scheduled
   Data: js/news-data.js · photos via js/people-data.js
   ========================================================= */
(function () {
  "use strict";

  var NEWS = (window.SKRINE_NEWS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var UPCOMING = (window.SKRINE_UPCOMING || []).slice().sort(function (a, b) { return a.date > b.date ? 1 : -1; });
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var IMG_DIR = "images/news/";
  var PHOTO_DIR = "../current design/images/people/";
  var PAGE = 12;
  var HEADLINES = 4;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var grid = document.getElementById("neGrid");
  if (!grid) return;

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.,]/g, "").replace(/\s+/g, " ").trim(); }
  function fmtDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  // photo framed whole over a blurred copy (shared .pub-cover styles)
  function picture(item) {
    var frame = el("span", "pub-cover");
    if (!item.image) return frame;
    var url = IMG_DIR + encodeURIComponent(item.image);
    frame.style.setProperty("--cover", 'url("' + new URL(url, document.baseURI).href + '")');
    var img = el("img");
    img.src = url;
    img.alt = "";
    img.loading = "lazy";
    frame.appendChild(img);
    return frame;
  }

  var photoByName = {};
  // same files as the People page: partners and consultants fall back to "<Full Name>.png"
  ["partners", "consultants"].forEach(function (role) {
    (PEOPLE[role] || []).forEach(function (p) { photoByName[p.name] = p.photo || p.name + ".png"; });
  });
  function initials(name) {
    var p = name.replace(/^To’? ?Puan /i, "").replace(/[’'.]/g, "").split(/\s+/);
    return ((p[0] || "")[0] + ((p[1] || "")[0] || "")).toUpperCase();
  }
  function avatar(name) {
    var a = el("span", "pub-avatar");
    a.title = name;
    var file = photoByName[name];
    if (file) {
      var img = el("img");
      img.src = PHOTO_DIR + encodeURIComponent(file);
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.replaceWith(el("span", null, initials(name))); });
      a.appendChild(img);
    } else {
      a.appendChild(el("span", null, initials(name)));
    }
    return a;
  }
  function stack(names, max) {
    var w = el("span", "pub-stack");
    names.slice(0, max).forEach(function (n) { w.appendChild(avatar(n)); });
    if (names.length > max) w.appendChild(el("span", "pub-avatar pub-avatar--more", "+" + (names.length - max)));
    return w;
  }
  function catTag(c) { return el("span", "alert-tag ne-cat-tag", c); }

  NEWS.forEach(function (n) { n._hay = norm([n.title, n.category, n.people.join(" "), n.summary].join(" ")); });

  /* ---------- Tabs (page nav) ---------- */
  var tabs = { latest: document.getElementById("tab-latest"), upcoming: document.getElementById("tab-upcoming") };
  var panels = { latest: document.getElementById("panel-latest"), upcoming: document.getElementById("panel-upcoming") };
  document.getElementById("countLatest").textContent = NEWS.length;
  document.getElementById("countUpcoming").textContent = UPCOMING.length;

  function showTab(name, push) {
    Object.keys(tabs).forEach(function (k) {
      var on = k === name;
      tabs[k].setAttribute("aria-selected", String(on));
      tabs[k].tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
    });
    if (push) history.replaceState(null, "", "#" + name);
    panels[name].querySelectorAll(".reveal").forEach(function (r) { FX.observeReveal(r); });
  }
  Object.keys(tabs).forEach(function (k) {
    tabs[k].addEventListener("click", function () { showTab(k, true); });
    tabs[k].addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var next = k === "latest" ? "upcoming" : "latest";
        showTab(next, true);
        tabs[next].focus();
      }
    });
  });

  /* ---------- Headlines ---------- */
  var headEl = document.getElementById("neHeadlines");
  NEWS.slice(0, HEADLINES).forEach(function (n, i) {
    var lead = i === 0;
    var c = el("button", "ne-head reveal" + (lead ? " ne-head--lead" : ""));
    c.type = "button";
    c.style.setProperty("--delay", (i * 0.07) + "s");
    c.appendChild(picture(n));
    var body = el("span", "ne-head-body");
    var meta = el("span", "ne-head-meta");
    if (lead) meta.appendChild(el("span", "ne-badge", "Latest"));
    meta.appendChild(catTag(n.category));
    meta.appendChild(el("time", "ne-date", fmtDate(n.date)));
    body.appendChild(meta);
    body.appendChild(el("span", "ne-head-title", n.title));
    if (lead && n.summary) body.appendChild(el("span", "ne-head-summary", n.summary));
    if (lead && n.people.length) body.appendChild(stack(n.people, 5));
    c.appendChild(body);
    c.addEventListener("click", function () { openModal(n); });
    headEl.appendChild(c);
    FX.observeReveal(c);
  });

  /* ---------- Category chips ---------- */
  var state = { cat: null, q: "", shown: PAGE };
  var catsEl = document.getElementById("neCats");
  var counts = {};
  NEWS.forEach(function (n) { counts[n.category] = (counts[n.category] || 0) + 1; });
  var cats = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  function chip(label, value, count) {
    var b = el("button", "topic-chip");
    b.type = "button";
    b.dataset.value = value || "";
    b.setAttribute("aria-pressed", String(!value));
    b.appendChild(el("span", null, label));
    b.appendChild(el("span", "topic-chip-count", String(count)));
    b.addEventListener("click", function () { state.cat = value; state.shown = PAGE; render(); });
    catsEl.appendChild(b);
  }
  chip("All", null, NEWS.length);
  cats.forEach(function (c) { chip(c, c, counts[c]); });

  /* ---------- Grid ---------- */
  var resultsEl = document.getElementById("neResults");
  var emptyEl = document.getElementById("neEmpty");
  var moreWrap = document.getElementById("neMoreWrap");
  var keep = 0;

  function card(n, i) {
    var c = el("button", "ne-card reveal");
    c.type = "button";
    c.style.setProperty("--delay", ((i % 3) * 0.06) + "s");
    c.setAttribute("aria-haspopup", "dialog");
    var media = el("span", "ne-card-media");
    media.appendChild(picture(n));
    c.appendChild(media);
    var body = el("span", "ne-card-body");
    var meta = el("span", "ne-head-meta");
    meta.appendChild(catTag(n.category));
    meta.appendChild(el("time", "ne-date", fmtDate(n.date)));
    body.appendChild(meta);
    body.appendChild(el("span", "ne-card-title", n.title));
    if (n.summary) body.appendChild(el("span", "ne-card-summary", n.summary));
    if (n.people.length) body.appendChild(stack(n.people, 4));
    c.appendChild(body);
    c.addEventListener("click", function () { openModal(n); });
    return c;
  }

  function render() {
    var q = norm(state.q);
    var filtered = !!(q || state.cat);
    var list = NEWS.filter(function (n) {
      if (state.cat && n.category !== state.cat) return false;
      if (q && n._hay.indexOf(q) === -1) return false;
      return true;
    });
    // headlines already show the four newest
    var items = filtered ? list : list.slice(HEADLINES);
    headEl.hidden = filtered;
    catsEl.querySelectorAll(".topic-chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String((b.dataset.value || null) === state.cat));
    });
    resultsEl.textContent = filtered ? list.length + " of " + NEWS.length + " posts" : "More news";
    emptyEl.hidden = list.length > 0;

    grid.textContent = "";
    items.slice(0, state.shown).forEach(function (n, i) {
      var c = card(n, i);
      grid.appendChild(c);
      if (i < keep) c.classList.add("is-visible"); else FX.observeReveal(c);
    });
    keep = 0;
    moreWrap.hidden = items.length <= state.shown;
  }

  var t;
  document.getElementById("neSearch").addEventListener("input", function (e) {
    clearTimeout(t);
    t = setTimeout(function () { state.q = e.target.value; state.shown = PAGE; render(); }, 150);
  });
  document.getElementById("neMore").addEventListener("click", function () { keep = state.shown; state.shown += PAGE; render(); });
  document.getElementById("neReset").addEventListener("click", function () {
    state = { cat: null, q: "", shown: PAGE };
    document.getElementById("neSearch").value = "";
    render();
  });

  /* ---------- Upcoming ---------- */
  var upEl = document.getElementById("neUpcoming");
  if (UPCOMING.length) {
    var list = el("div", "ne-up-list");
    UPCOMING.forEach(function (ev) {
      var p = ev.date.split("-");
      var row = el("article", "ne-up reveal");
      var d = el("time", "ne-up-date");
      d.dateTime = ev.date;
      d.appendChild(el("span", "ne-up-day", String(Number(p[2]))));
      d.appendChild(el("span", "ne-up-mon", MONTHS[Number(p[1]) - 1] + " " + p[0]));
      row.appendChild(d);
      var b = el("div", "ne-up-body");
      if (ev.type) b.appendChild(el("span", "alert-tag", ev.type));
      b.appendChild(el("h3", "ne-up-title", ev.title));
      var info = [ev.time, ev.location].filter(Boolean).join(" · ");
      if (info) b.appendChild(el("p", "ne-up-info", info));
      if (ev.summary) b.appendChild(el("p", "ne-up-summary", ev.summary));
      if (ev.people && ev.people.length) b.appendChild(stack(ev.people, 5));
      row.appendChild(b);
      if (ev.register) {
        var a = el("a", "btn btn--solid ne-up-cta");
        a.href = ev.register;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = 'Register <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
        row.appendChild(a);
      }
      list.appendChild(row);
    });
    upEl.appendChild(list);
  } else {
    // nothing scheduled: a designed empty state + the most recent events
    var empty = el("div", "ne-up-empty reveal");
    var ic = el("span", "ne-up-empty-icon");
    ic.innerHTML = '<i class="fa-regular fa-calendar" aria-hidden="true"></i>';
    empty.appendChild(ic);
    var tx = el("div");
    tx.appendChild(el("h2", null, "No upcoming events right now"));
    tx.appendChild(el("p", null, "Our lawyers regularly speak at conferences, seminars and webinars. Subscribe to hear about new events as soon as they are announced."));
    var acts = el("div", "ne-up-empty-actions");
    var sub = el("a", "btn btn--solid");
    sub.href = "#";
    sub.innerHTML = 'Subscribe for updates <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    acts.appendChild(sub);
    var back = el("button", "btn btn--outline");
    back.type = "button";
    back.textContent = "See the latest news";
    back.addEventListener("click", function () { showTab("latest", true); tabs.latest.focus(); });
    acts.appendChild(back);
    tx.appendChild(acts);
    empty.appendChild(tx);
    upEl.appendChild(empty);

    var recent = NEWS.filter(function (n) { return n.category === "Speaking & Events"; }).slice(0, 3);
    if (recent.length) {
      var head = el("div", "alerts-subhead ne-recent-head");
      head.appendChild(el("h2", null, "Recent events"));
      upEl.appendChild(head);
      var g = el("div", "ne-grid");
      recent.forEach(function (n, i) { g.appendChild(card(n, i)); });
      upEl.appendChild(g);
    }
  }

  /* ---------- Quick view ---------- */
  var modal = document.getElementById("neModal");
  var lastFocus = null;
  function openModal(n) {
    lastFocus = document.activeElement;
    var holder = document.getElementById("neModalCover");
    var pic = picture(n);
    pic.id = "neModalCover";
    pic.classList.add("pub-modal-cover");
    holder.replaceWith(pic);
    document.getElementById("neModalMeta").textContent = n.category + " · " + fmtDate(n.date);
    document.getElementById("neModalTitle").textContent = n.title;
    document.getElementById("neModalSummary").textContent = n.summary || "";
    var pe = document.getElementById("neModalPeople");
    pe.textContent = "";
    if (n.people.length) {
      pe.appendChild(el("p", "pub-modal-label", "From Skrine"));
      var ul = el("ul", "pub-modal-people");
      n.people.forEach(function (name) {
        var li = el("li");
        li.appendChild(avatar(name));
        li.appendChild(el("span", null, name));
        ul.appendChild(li);
      });
      pe.appendChild(ul);
    }
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }
  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest("[data-close]")) modal.close(); });

  /* ---------- start ---------- */
  render();
  showTab(location.hash === "#upcoming" ? "upcoming" : "latest", false);
  // keep in step with links such as news-events.html#upcoming
  window.addEventListener("hashchange", function () { if (location.hash === "#upcoming" || location.hash === "#latest") showTab(location.hash.slice(1), false); });
})();
