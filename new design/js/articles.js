/* =========================================================
   SKRINE — Articles (SkrineShot)
   - Featured: the newest SkrineShot
   - Filter bar: search, topic dropdown, language, year
   - Grid of 3D flip cards: question on the front,
     "Ask our experts" (contact partners) on the back
   Data: js/articles-data.js · photos via js/people-data.js
   ========================================================= */
(function () {
  "use strict";

  var SHOTS = (window.SKRINE_SHOTS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var PHOTO_DIR = "../current design/images/people/";
  var PAGE = 12;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var grid = document.getElementById("shotGrid");
  if (!grid) return;

  var state = { q: "", topic: null, lang: "", year: "", shown: PAGE };

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.,]/g, "").replace(/\s+/g, " ").trim(); }
  function fmtDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  // "Did you know that X?" → eyebrow "Did you know…" + "X?"
  function splitQuestion(s) {
    var t = s.title.trim();
    var m = t.match(/^(did|do) you know(?: that)?,?\s*/i);
    if (m) {
      var rest = t.slice(m[0].length);
      return { lead: "Did you know…", text: rest.charAt(0).toUpperCase() + rest.slice(1) };
    }
    var zh = t.match(/^(您是否知道|您知道吗[，,]?)\s*/);
    if (zh) return { lead: "您知道吗…", text: t.slice(zh[0].length) };
    return { lead: s.lang === "zh" ? "法律小知识" : "Fact", text: t };
  }

  // photos: same files and matching as the People page
  var photoByName = {};
  ["partners", "consultants", "seniorAssociates", "associates"].forEach(function (role) {
    (PEOPLE[role] || []).forEach(function (p) { if (p.photo) photoByName[norm(p.name)] = p.photo; });
  });
  function photoFor(name) {
    var tokens = norm(name).split(" ");
    for (var k in photoByName) {
      var parts = k.split(" ");
      if (tokens.every(function (t) { return parts.indexOf(t) > -1; })) return photoByName[k];
    }
    return null;
  }
  function initials(name) {
    var p = name.replace(/[’'.]/g, "").split(/\s+/);
    return ((p[0] || "")[0] + ((p[1] || "")[0] || "")).toUpperCase();
  }
  function avatar(name) {
    var a = el("span", "shot-avatar");
    a.setAttribute("aria-hidden", "true");
    var file = photoFor(name);
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
  function contactList(names) {
    var ul = el("ul", "shot-contacts");
    names.forEach(function (n) {
      var li = el("li");
      li.appendChild(avatar(n));
      li.appendChild(el("span", "shot-contact-name", n));
      ul.appendChild(li);
    });
    return ul;
  }

  SHOTS.forEach(function (s) { s._hay = norm([s.title, s.topic, s.contacts.join(" ")].join(" ")); s._year = s.date.slice(0, 4); });

  /* ---------- Featured ---------- */
  var featureEl = document.getElementById("shotFeature");
  (function () {
    var s = SHOTS[0];
    if (!s) return;
    var q = splitQuestion(s);
    featureEl.setAttribute("data-tilt", "");
    var mark = el("span", "shot-feature-mark", "?");
    mark.setAttribute("aria-hidden", "true");
    featureEl.appendChild(mark);
    var body = el("div", "shot-feature-body");
    var top = el("p", "shot-feature-top");
    top.appendChild(el("span", "shot-feature-badge", "Latest SkrineShot"));
    top.appendChild(el("time", null, fmtDate(s.date)));
    body.appendChild(top);
    body.appendChild(el("p", "shot-feature-lead", q.lead));
    var h = el("h2", "shot-feature-q", q.text);
    if (s.lang === "zh") h.lang = "zh";
    body.appendChild(h);
    var foot = el("div", "shot-feature-foot");
    if (s.topic) foot.appendChild(el("span", "shot-feature-topic", s.topic));
    if (s.contacts.length) {
      var ask = el("div", "shot-feature-ask");
      ask.appendChild(el("span", "shot-feature-ask-label", "Ask our experts"));
      ask.appendChild(contactList(s.contacts));
      foot.appendChild(ask);
    }
    body.appendChild(foot);
    featureEl.appendChild(body);
    FX.attachTilt(featureEl);
  })();

  /* ---------- Flip cards ---------- */
  function card(s, i) {
    var q = splitQuestion(s);
    var wrap = el("article", "shot-card reveal");
    wrap.style.setProperty("--delay", ((i % 3) * 0.06) + "s");
    if (s.lang === "zh") wrap.lang = "zh";

    var flip = el("button", "shot-flip");
    flip.type = "button";
    flip.setAttribute("aria-pressed", "false");
    flip.setAttribute("aria-label", s.title + (s.contacts.length ? " — show who to ask" : ""));

    var front = el("span", "shot-face shot-front");
    var meta = el("span", "shot-meta");
    if (s.topic) meta.appendChild(el("span", "alert-tag", s.topic));
    meta.appendChild(el("time", "shot-date", fmtDate(s.date)));
    front.appendChild(meta);
    front.appendChild(el("span", "shot-lead", q.lead));
    front.appendChild(el("span", "shot-q", q.text));
    var hint = el("span", "shot-hint");
    hint.innerHTML = s.contacts.length
      ? 'Ask our experts <i class="fa-solid fa-rotate" aria-hidden="true"></i>'
      : 'SkrineShot <i class="fa-solid fa-bolt" aria-hidden="true"></i>';
    front.appendChild(hint);
    flip.appendChild(front);

    var back = el("span", "shot-face shot-back");
    back.appendChild(el("span", "shot-back-title", s.contacts.length ? "Ask our experts" : "SkrineShot"));
    if (s.contacts.length) back.appendChild(contactList(s.contacts));
    else back.appendChild(el("span", "shot-back-note", "Contact us at skrine@skrine.com for more information."));
    if (s.topic) back.appendChild(el("span", "shot-back-topic", s.topic));
    flip.appendChild(back);

    // tap / Enter flips (hover flips on desktop via CSS)
    flip.addEventListener("click", function () {
      var on = flip.getAttribute("aria-pressed") !== "true";
      flip.setAttribute("aria-pressed", String(on));
    });
    wrap.appendChild(flip);
    return wrap;
  }

  /* ---------- Filters ---------- */
  var topicsEl = document.getElementById("shotTopics");
  var toggle = document.getElementById("topicToggle");
  var panel = document.getElementById("topicPanel");
  var currentEl = document.getElementById("topicCurrent");
  var counts = {};
  SHOTS.forEach(function (s) { if (s.topic) counts[s.topic] = (counts[s.topic] || 0) + 1; });
  var topics = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });

  function chip(label, value, count) {
    var b = el("button", "topic-chip");
    b.type = "button";
    b.dataset.topic = value || "";
    b.setAttribute("aria-pressed", "false");
    b.appendChild(el("span", null, label));
    b.appendChild(el("span", "topic-chip-count", String(count)));
    b.addEventListener("click", function () { state.topic = value; state.shown = PAGE; setPanel(false); render(); toggle.focus(); });
    topicsEl.appendChild(b);
  }
  chip("All topics", null, SHOTS.length);
  topics.forEach(function (t) { chip(t, t, counts[t]); });

  function setPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function (e) { e.stopPropagation(); setPanel(panel.hidden); });
  document.addEventListener("click", function (e) { if (!panel.hidden && !e.target.closest("#topicFilter")) setPanel(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setPanel(false); toggle.focus(); } });

  // language + year segmented controls
  var yearSeg = document.getElementById("yearSeg");
  var years = Array.from(new Set(SHOTS.map(function (s) { return s._year; })));
  [""].concat(years).forEach(function (y) {
    var b = el("button", null, y || "All years");
    b.type = "button";
    b.dataset.year = y;
    b.setAttribute("aria-pressed", String(!y));
    yearSeg.appendChild(b);
  });
  function seg(groupId, key) {
    document.getElementById(groupId).addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      state[key] = b.dataset[key];
      state.shown = PAGE;
      this.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      render();
    });
  }
  seg("langSeg", "lang");
  seg("yearSeg", "year");

  /* ---------- Render ---------- */
  var resultsEl = document.getElementById("shotResults");
  var emptyEl = document.getElementById("shotEmpty");
  var moreWrap = document.getElementById("shotMoreWrap");
  var keepVisible = 0;

  function render() {
    var q = norm(state.q);
    var list = SHOTS.filter(function (s) {
      if (state.topic && s.topic !== state.topic) return false;
      if (state.lang && s.lang !== state.lang) return false;
      if (state.year && s._year !== state.year) return false;
      if (q && s._hay.indexOf(q) === -1) return false;
      return true;
    });
    var filtered = !!(q || state.topic || state.lang || state.year);
    // the featured card is the newest overall, so skip it in the unfiltered grid
    var items = filtered ? list : list.slice(1);

    currentEl.textContent = state.topic || "All topics";
    toggle.classList.toggle("has-value", !!state.topic);
    topicsEl.querySelectorAll(".topic-chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String((b.dataset.topic || null) === state.topic));
    });
    featureEl.hidden = filtered;
    resultsEl.textContent = filtered ? list.length + " of " + SHOTS.length + " SkrineShots" : SHOTS.length + " SkrineShots";
    emptyEl.hidden = list.length > 0;

    grid.textContent = "";
    items.slice(0, state.shown).forEach(function (s, i) {
      var c = card(s, i);
      grid.appendChild(c);
      if (i < keepVisible) c.classList.add("is-visible");
      else FX.observeReveal(c);
    });
    keepVisible = 0;
    moreWrap.hidden = items.length <= state.shown;
  }

  var t;
  document.getElementById("shotSearch").addEventListener("input", function (e) {
    clearTimeout(t);
    t = setTimeout(function () { state.q = e.target.value; state.shown = PAGE; render(); }, 150);
  });
  document.getElementById("shotMore").addEventListener("click", function () { keepVisible = state.shown; state.shown += PAGE; render(); });
  document.getElementById("shotReset").addEventListener("click", function () {
    state = { q: "", topic: null, lang: "", year: "", shown: PAGE };
    document.getElementById("shotSearch").value = "";
    document.querySelectorAll("#langSeg button, #yearSeg button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(!(b.dataset.lang || b.dataset.year)));
    });
    render();
  });

  render();
})();
