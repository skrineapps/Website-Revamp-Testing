/* =========================================================
   SKRINE — People directory (Designs 1 and 2: filter bar on top)
   Renders the people in people-data.js, with practice areas
   from profiles-data.js (taken from each skrine.com profile).
   - opens on Partners; the role buttons switch group
   - one search box covers names, practice areas, sectors,
     qualifications, affiliations and profile text, across everyone
   - Practice Area and Sector dropdowns narrow the list
   - partner cards on hover: Design 1 (people.html) turns them over slowly;
     Design 2 (people-fade.html) darkens the photo and fades the practice areas in
   Design 3 (sidebar filters) is people-classic.html + js/people-classic.js.
   ========================================================= */
(function () {
  "use strict";

  // review aid: keep ?q= etc. when switching designs
  document.querySelectorAll("[data-switch]").forEach(function (a) { a.href = a.getAttribute("href") + location.search; });

  var DATA = window.SKRINE_PEOPLE;
  if (!DATA) return;
  var PROFILES = window.SKRINE_PROFILES || {};

  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var ROLES = ["partners", "consultants", "seniorAssociates", "associates"];
  var PHOTO_ROLES = { partners: true, consultants: true };
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var ROLE_LABEL = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };
  var ROLE_PLURAL = { partners: "partners", consultants: "consultants", seniorAssociates: "senior associates", associates: "associates" };
  var DEFAULT_ROLE = "partners";
  // partner cards: "flip" (Design 1, people.html) or "fade" (Design 2, people-fade.html)
  var pageEl = document.querySelector(".people-page");
  var CARD_MODE = (pageEl && pageEl.getAttribute("data-cards")) || "flip";

  /* Each filter matches a person when any of their practice areas
     contains one of its keywords. Adjust the keywords to tune the matching. */
  var PRACTICE_FILTERS = [
    { label: "Litigation and Arbitration", keys: ["dispute resolution", "litigation", "arbitrat", "disputes"] },
    { label: "Corporate", keys: ["corporate", "mergers", "capital markets", "notary"] },
    { label: "Intellectual Property and TMT", keys: ["intellectual property", "ip ", "ip &", "technology", "media", "telecommunications", "data protection", "branding", "entertainment"] },
    { label: "Construction and Engineering", keys: ["construction"] },
    { label: "Employment", keys: ["employment", "employee", "occupational"] },
    { label: "Banking and Finance", keys: ["banking", "finance", "fintech", "capital markets"] },
    { label: "Real Estate", keys: ["real estate", "land acquisition"] },
    { label: "Regulatory Compliance", keys: ["compliance", "bribery", "corruption", "trade and customs", "immigration", "environment"] },
    { label: "Fraud and Asset Recovery", keys: ["fraud", "asset recovery"] },
    { label: "Corporate Structures and Transactions", keys: ["corporate advisory", "transaction"] },
    { label: "Tax and Revenue", keys: ["tax"] },
    { label: "Restructuring and Insolvency", keys: ["restructuring", "insolvency", "bankruptcy"] },
    { label: "Maritime and Shipping", keys: ["maritime", "shipping"] }
  ];

  var INDUSTRY_FILTERS = [
    { label: "Projects and Infrastructure", keys: ["projects", "infrastructure", "construction"] },
    { label: "Financial Institutions", keys: ["banking", "finance", "capital markets", "insurance", "fintech"] },
    { label: "Aviation", keys: ["aviation"] },
    { label: "Healthcare, Biotechnology and Pharmaceuticals", keys: ["healthcare", "biotechnology", "pharmaceutical", "medical"] },
    { label: "Industrial and Manufacturing", keys: ["manufacturing", "industrial", "occupational safety"] },
    { label: "Insurance and Reinsurance", keys: ["insurance"] },
    { label: "Oil & Gas, and Energy", keys: ["oil & gas", "oil and gas", "energy"] },
    { label: "Real Estate", keys: ["real estate", "land acquisition"] },
    { label: "Maritime and Shipping", keys: ["maritime", "shipping"] },
    { label: "Technology, Media and Telecommunications", keys: ["technology", "media", "telecommunications", "fintech", "data protection"] }
  ];

  /* ---------- helpers ---------- */
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’'`]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function list(items, cls) {
    var ul = el("ul", cls);
    items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    return ul;
  }
  function initials(name) {
    var skip = { "to": 1, "puan": 1, "sri": 1, "dato": 1, "bin": 1, "binti": 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }
  // profile page slug (same rule as js/profile.js)
  function profileSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  // practice area names as published: drop hidden characters and the Chinese translations some profiles add
  function cleanArea(s) {
    return String(s || "")
      .replace(/[​-‍﻿]/g, "")
      .replace(/[　-〿㐀-鿿＀-￯][\s\S]*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function matches(person, filter) {
    return filter.keys.some(function (k) { return person._areasHay.indexOf(k) !== -1; });
  }

  /* ---------- people: practice areas + everything search looks at ---------- */
  var everyone = [];
  ROLES.forEach(function (role) {
    (DATA[role] || []).forEach(function (p) {
      var prof = PROFILES[profileSlug(p.name)] || null;
      var fromProfile = prof ? (prof.keyAreas || []).map(cleanArea).filter(Boolean) : [];
      p._role = role;
      p._profile = prof;
      // skrine.com profile first; the directory's own list when the profile has none
      p._areas = fromProfile.length ? fromProfile : (p.areas || p.keyAreas || []).map(cleanArea).filter(Boolean);
      p._areasHay = " " + norm([].concat(p._areas, p.areas || [], p.keyAreas || []).join(" | ")) + " ";
      everyone.push(p);
    });
  });

  // search text: name, role, practice areas, sectors, qualifications, affiliations, rankings, profile text
  everyone.forEach(function (p) {
    var prof = p._profile || {};
    var bits = [p.name, ROLE_LABEL[p._role], p._areas, p.areas, p.keyAreas, p.quals, p.affiliations, prof.overview, prof.rankings];
    (prof.credentials || []).forEach(function (c) { bits.push(c.heading, c.items); });
    (prof.experience || []).forEach(function (x) { bits.push(x.area); });
    (prof.talks || []).forEach(function (t) { bits.push(t.items); });
    PRACTICE_FILTERS.forEach(function (f) { if (matches(p, f)) bits.push(f.label); });
    INDUSTRY_FILTERS.forEach(function (f) { if (matches(p, f)) bits.push(f.label); });
    p._name = norm(p.name);
    p._hay = norm([].concat.apply([], bits.map(function (b) { return b || []; })).join(" | "));
  });

  /* ---------- cards ---------- */
  function photoFront(p) {
    var inner = el("div", "photo-card-inner");
    var img = el("img", "photo-card-img");
    img.src = photoUrl(p.photo || p.name + ".png");
    img.alt = "Portrait of " + p.name;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function () {   // no photo yet: initials
      var mono = el("div", "photo-card-monogram", initials(p.name).toUpperCase());
      mono.setAttribute("aria-hidden", "true");
      img.replaceWith(mono);
    });
    inner.appendChild(img);
    var info = el("div", "photo-card-info");
    info.appendChild(el("h3", "photo-card-name", p.name));
    inner.appendChild(info);
    return inner;
  }

  // corner chevron on a partner card: it opens their profile
  function goChevron() {
    var go = el("span", "pd-go");
    go.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
    return go;
  }

  function photoCard(p, role) {
    var slug = profileSlug(p.name);
    var linked = !!PROFILES[slug];
    var flips = role === "partners";
    var card = el(linked ? "a" : "article", "photo-card reveal" +
      (role === "consultants" ? " photo-card--consultant" : "") +
      (linked ? " photo-card--link" : "") +
      (flips ? (CARD_MODE === "fade" ? " photo-card--fade" : " photo-card--flip") : ""));
    if (linked) {
      card.href = "profile.html?p=" + encodeURIComponent(slug);
      card.setAttribute("aria-label", p.name + ", " + ROLE_LABEL[role] +
        (flips && p._areas.length ? ". Practice areas: " + p._areas.join(", ") : ""));
    }
    if (!flips) {
      card.setAttribute("data-tilt", "");
      card.appendChild(photoFront(p));
      return card;
    }

    // Design 2: the photo slowly darkens and the practice areas rise in one after another
    if (CARD_MODE === "fade") {
      var face = photoFront(p);
      var panel = el("div", "pd-panel");
      panel.setAttribute("aria-hidden", "true");
      panel.appendChild(el("p", "pd-back-role", ROLE_LABEL[role]));
      panel.appendChild(el("h3", "pd-back-name", p.name));
      if (p._areas.length) {
        panel.appendChild(el("p", "pd-back-label", "Practice areas"));
        var ul = list(p._areas, "pd-back-areas");
        Array.prototype.forEach.call(ul.children, function (li, k) { li.style.setProperty("--i", k); });
        panel.appendChild(ul);
      }
      if (linked) panel.appendChild(goChevron());
      face.appendChild(panel);
      card.appendChild(face);
      return card;
    }

    // Design 1: photo on the front, name + practice areas on the back
    var flip = el("div", "pd-flip");
    var front = photoFront(p);
    front.classList.add("pd-face", "pd-front");
    var back = el("div", "pd-face pd-back");
    back.setAttribute("aria-hidden", "true");
    back.appendChild(el("p", "pd-back-role", ROLE_LABEL[role]));
    back.appendChild(el("h3", "pd-back-name", p.name));
    if (p._areas.length) {
      back.appendChild(el("p", "pd-back-label", "Practice areas"));
      back.appendChild(list(p._areas, "pd-back-areas"));   // fitBacks() keeps as many as the card holds
    }
    if (linked) back.appendChild(goChevron());
    flip.appendChild(front);
    flip.appendChild(back);
    card.appendChild(flip);
    return card;
  }

  // senior associates: preview card that opens the details pop-up; associates: name only
  function miniCard(p, role) {
    if (role === "associates") {
      var plain = el("article", "mini-card mini-card--static reveal");
      plain.appendChild(el("span", "mini-card-role", ROLE_LABEL[role]));
      plain.appendChild(el("span", "mini-card-name", p.name));
      return plain;
    }
    var card = el("button", "mini-card reveal");
    card.type = "button";
    card.setAttribute("data-tilt", "");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", p.name + ", " + ROLE_LABEL[role]);
    card.appendChild(el("span", "mini-card-role", ROLE_LABEL[role]));
    card.appendChild(el("span", "mini-card-name", p.name));
    var areas = p._areas;
    var preview = el("span", "mini-card-preview");
    if (areas.length) {
      preview.appendChild(el("span", "mini-card-area", areas[0]));
      if (areas.length > 1) preview.appendChild(el("span", "mini-card-more", "+" + (areas.length - 1)));
    }
    card.appendChild(preview);
    card.addEventListener("click", function () { openModal(p); });
    return card;
  }

  /* ---------- render ---------- */
  var perRoleIndex = {};
  everyone.forEach(function (p) {
    var role = p._role;
    var i = perRoleIndex[role] = (perRoleIndex[role] || 0) + 1;
    p._el = PHOTO_ROLES[role] ? photoCard(p, role) : miniCard(p, role);
    p._el.style.setProperty("--delay", (((i - 1) % 4) * 0.08) + "s");
    document.getElementById("grid-" + role).appendChild(p._el);
    FX.observeReveal(p._el);
    if (p._el.hasAttribute("data-tilt")) FX.attachTilt(p._el);
  });

  /* ---------- dropdown filters ---------- */
  function buildFilters(containerId, filters, groupName) {
    var box = document.getElementById(containerId);
    filters.forEach(function (f, i) {
      var count = everyone.filter(function (p) { return matches(p, f); }).length;
      var id = groupName + "-" + i;
      var label = el("label", "filter-option");
      label.htmlFor = id;
      var input = el("input");
      input.type = "checkbox";
      input.id = id;
      input.value = String(i);
      input.dataset.group = groupName;
      var span = el("span", "filter-label", f.label);
      span.title = f.label;
      label.appendChild(input);
      label.appendChild(el("span", "filter-box"));
      label.appendChild(span);
      label.appendChild(el("span", "filter-count", String(count)));
      box.appendChild(label);
    });
  }
  buildFilters("practiceFilters", PRACTICE_FILTERS, "practice");
  buildFilters("industryFilters", INDUSTRY_FILTERS, "industry");

  var drops = Array.prototype.slice.call(document.querySelectorAll("[data-drop]"));
  function closeDrops(except) {
    drops.forEach(function (d) {
      if (d === except) return;
      d.querySelector(".pd-drop-btn").setAttribute("aria-expanded", "false");
      d.querySelector(".pd-drop-menu").hidden = true;
      d.classList.remove("is-open");
    });
  }
  drops.forEach(function (d) {
    var btn = d.querySelector(".pd-drop-btn"), menu = d.querySelector(".pd-drop-menu");
    btn.addEventListener("click", function () {
      var open = menu.hidden;
      closeDrops(d);
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      d.classList.toggle("is-open", open);
      if (open) { var first = menu.querySelector("input"); if (first) first.focus({ preventScroll: true }); }
    });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { closeDrops(); btn.focus(); }
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("[data-drop]")) closeDrops(); });

  /* ---------- state + apply ---------- */
  var state = { q: "", role: DEFAULT_ROLE, practice: [], industry: [] };

  var searchInput = document.getElementById("peopleSearch");
  var resultsLine = document.getElementById("resultsLine");
  var emptyBox = document.getElementById("peopleEmpty");
  var clearBtn = document.getElementById("filtersClear");
  var roleButtons = document.querySelectorAll("#roleTabs button");
  var dropCounts = { practice: drops[0].querySelector(".pd-drop-count"), industry: drops[1].querySelector(".pd-drop-count") };

  function apply() {
    var words = norm(state.q).split(" ").filter(Boolean);
    // a search looks across everyone; otherwise show the chosen group
    var role = words.length ? null : state.role;
    var shown = 0, perRole = {};

    everyone.forEach(function (p) {
      var ok = !role || p._role === role;
      if (ok && words.length) ok = words.every(function (w) { return p._hay.indexOf(w) !== -1; });
      if (ok && state.practice.length) ok = state.practice.some(function (i) { return matches(p, PRACTICE_FILTERS[i]); });
      if (ok && state.industry.length) ok = state.industry.some(function (i) { return matches(p, INDUSTRY_FILTERS[i]); });
      p._el.hidden = !ok;
      if (ok) {
        shown++;
        perRole[p._role] = (perRole[p._role] || 0) + 1;
        p._el.classList.add("is-visible");   // revealed while hidden would skip the animation
      }
    });

    ROLES.forEach(function (r) { document.getElementById("group-" + r).hidden = !perRole[r]; });

    var filters = state.practice.length + state.industry.length;
    if (words.length) {
      resultsLine.textContent = shown + (shown === 1 ? " result" : " results") + " for “" + state.q.trim() + "” across everyone";
    } else {
      var total = (DATA[role] || []).length;
      resultsLine.textContent = filters ? "Showing " + shown + " of " + total + " " + ROLE_PLURAL[role] : total + " " + ROLE_PLURAL[role];
    }
    emptyBox.hidden = shown !== 0;

    clearBtn.hidden = !(filters || words.length);
    ["practice", "industry"].forEach(function (g) {
      dropCounts[g].hidden = !state[g].length;
      dropCounts[g].textContent = state[g].length;
      dropCounts[g].closest(".pd-drop").classList.toggle("has-value", !!state[g].length);
    });
    roleButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.role === role)); });
    fitBacks();
  }

  /* ---------- card backs: list as many practice areas as fit, leaving room at the bottom ---------- */
  function fitBacks() {
    document.querySelectorAll(".pd-back, .pd-panel").forEach(function (b) {
      if (!b.clientHeight) return;                       // in a hidden group: fitted when it is shown
      var items = Array.prototype.slice.call(b.querySelectorAll(".pd-back-areas li"));
      items.forEach(function (li) { li.hidden = false; });
      for (var i = items.length - 1; i > 0 && b.scrollHeight > b.clientHeight; i--) items[i].hidden = true;
    });
  }
  var fitTimer;
  window.addEventListener("resize", function () { clearTimeout(fitTimer); fitTimer = setTimeout(fitBacks, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitBacks);

  var searchTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { state.q = searchInput.value; apply(); }, 120);
  });

  document.getElementById("filtersPanel").addEventListener("change", function (e) {
    var input = e.target;
    if (!input.dataset.group) return;
    var arr = state[input.dataset.group];
    var v = Number(input.value);
    var at = arr.indexOf(v);
    if (input.checked && at === -1) arr.push(v);
    if (!input.checked && at !== -1) arr.splice(at, 1);
    apply();
  });

  roleButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      // picking a group leaves any search
      state.role = b.dataset.role;
      state.q = "";
      searchInput.value = "";
      apply();
      var tabs = document.getElementById("roleTabs");
      var top = tabs.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  function clearFilters() {
    state.practice = [];
    state.industry = [];
    document.querySelectorAll("#filtersPanel input[type=checkbox]").forEach(function (c) { c.checked = false; });
  }
  clearBtn.addEventListener("click", function () {
    clearFilters();
    state.q = "";
    searchInput.value = "";
    apply();
  });
  document.getElementById("emptyReset").addEventListener("click", function () {
    clearFilters();
    state = { q: "", role: DEFAULT_ROLE, practice: [], industry: [] };
    searchInput.value = "";
    apply();
  });

  /* ---------- people.html?q=Name ----------
     Name links from alerts, news and publications (js/people-links.js) arrive here
     for lawyers without a profile page: show that person straight away. */
  var arriving = new URLSearchParams(location.search).get("q");
  if (arriving) {
    searchInput.value = arriving;
    state.q = arriving;
    apply();
    var hit = everyone.filter(function (p) { return !p._el.hidden; })[0];
    if (hit) setTimeout(function () { hit._el.scrollIntoView({ behavior: "smooth", block: "center" }); }, 350);
  }

  /* ---------- person pop-up (senior associates) ---------- */
  var modal = document.getElementById("personModal");
  var pmRole = document.getElementById("pmRole");
  var pmName = document.getElementById("pmName");
  var pmBody = document.getElementById("pmBody");
  var pmCount = document.getElementById("pmCount");
  var current = null, lastFocus = null;

  function siblingsOf(p) {
    return everyone.filter(function (o) { return o._role === p._role && !o._el.hidden; });
  }
  function fillModal(p) {
    current = p;
    pmRole.textContent = ROLE_LABEL[p._role] || "";
    pmName.textContent = p.name;
    pmBody.textContent = "";
    function section(title, items, chips) {
      if (!items || !items.length) return;
      var wrap = el("section", "pm-section");
      wrap.appendChild(el("h3", "pm-label", title));
      if (chips) {
        var row = el("div", "pm-chips");
        items.forEach(function (t) { row.appendChild(el("span", "pm-chip", t)); });
        wrap.appendChild(row);
      } else {
        wrap.appendChild(list(items, "pm-list"));
      }
      pmBody.appendChild(wrap);
    }
    section("Key Practice Areas", p._areas, true);
    section("Qualifications", p.quals);
    section("Professional Affiliations", p.affiliations);
    if (!pmBody.children.length) pmBody.appendChild(el("p", "pm-empty", "Further details for " + p.name + " have not been published yet."));
    var sibs = siblingsOf(p), at = sibs.indexOf(p);
    pmCount.textContent = (at + 1) + " / " + sibs.length;
    var card = modal.querySelector(".pm-card");
    card.classList.remove("is-swapping");
    void card.offsetWidth;
    card.classList.add("is-swapping");
  }
  function openModal(p) {
    lastFocus = document.activeElement;
    fillModal(p);
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    document.body.classList.add("modal-open");
  }
  function closeModal() {
    if (modal.open && typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }
  function step(dir) {
    if (!current) return;
    var sibs = siblingsOf(current), at = sibs.indexOf(current);
    fillModal(sibs[(at + dir + sibs.length) % sibs.length]);
  }
  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-close]")) closeModal();
  });
  modal.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  document.getElementById("pmPrev").addEventListener("click", function () { step(-1); });
  document.getElementById("pmNext").addEventListener("click", function () { step(1); });

  apply();
})();
