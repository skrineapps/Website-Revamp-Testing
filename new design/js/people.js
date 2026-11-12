/* =========================================================
   SKRINE — People directory
   Renders the people in people-data.js and handles
   search, role buttons and practice/industry filters.
   ========================================================= */
(function () {
  "use strict";

  var DATA = window.SKRINE_PEOPLE;
  if (!DATA) return;

  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var ROLES = ["partners", "consultants", "seniorAssociates", "associates"];
  var PHOTO_ROLES = { partners: true, consultants: true };
  var PHOTO_DIR = "../current design/images/people/";
  var ROLE_LABEL = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };

  /* Each filter matches a person when any of their listed practice areas
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
    { label: "Oil & Gas, and Energy", keys: ["oil & gas", "energy"] },
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
    var skip = { "to": 1, "puan": 1, "tan": 0, "sri": 1, "dato": 1, "bin": 1, "binti": 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return ((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "");
  }

  function matches(person, filter) {
    return filter.keys.some(function (k) { return person._hay.indexOf(k) !== -1; });
  }

  /* ---------- card builders ---------- */
  // profile page slug (same rule as js/profile.js); only people in profiles-data.js get a link
  function profileSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function photoCard(p, role) {
    var slug = profileSlug(p.name);
    var linked = !!(window.SKRINE_PROFILES && window.SKRINE_PROFILES[slug]);
    var card = el(linked ? "a" : "article", "photo-card reveal" + (role === "consultants" ? " photo-card--consultant" : "") + (linked ? " photo-card--link" : ""));
    if (linked) {
      card.href = "profile.html?p=" + encodeURIComponent(slug);
      card.setAttribute("aria-label", p.name + (p.division ? ", " + p.division : "") + " — view profile");
    }
    card.setAttribute("data-tilt", "");
    var inner = el("div", "photo-card-inner");

    var img = el("img", "photo-card-img");
    img.src = PHOTO_DIR + encodeURIComponent(p.photo || p.name + ".png");
    img.alt = "Portrait of " + p.name;
    img.loading = "lazy";
    img.decoding = "async";
    // no photo in the folder yet: show initials instead
    img.addEventListener("error", function () {
      var mono = el("div", "photo-card-monogram", initials(p.name).toUpperCase());
      mono.setAttribute("aria-hidden", "true");
      img.replaceWith(mono);
    });
    inner.appendChild(img);

    var info = el("div", "photo-card-info");
    info.appendChild(el("h3", "photo-card-name", p.name));
    // name + division; no division means name only
    if (p.division) info.appendChild(el("p", "photo-card-area", p.division));
    if (linked) {
      var cta = el("span", "photo-card-cta");
      cta.innerHTML = 'View profile <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
      info.appendChild(cta);
    }
    inner.appendChild(info);

    card.appendChild(inner);
    return card;
  }


  /* Uniform preview card; the full details open in the person modal. */
  function miniCard(p, role) {
    var card = el("button", "mini-card reveal");
    card.type = "button";
    card.setAttribute("data-tilt", "");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", p.name + ", " + ROLE_LABEL[role] + " — view details");

    card.appendChild(el("span", "mini-card-role", ROLE_LABEL[role]));
    card.appendChild(el("span", "mini-card-name", p.name));

    var areas = p.keyAreas || [];
    var preview = el("span", "mini-card-preview");
    if (areas.length) {
      preview.appendChild(el("span", "mini-card-area", areas[0]));
      if (areas.length > 1) preview.appendChild(el("span", "mini-card-more", "+" + (areas.length - 1)));
    }
    card.appendChild(preview);

    var cta = el("span", "mini-card-cta");
    cta.innerHTML = 'View details <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    card.appendChild(cta);

    card.addEventListener("click", function () { openModal(p); });
    return card;
  }

  /* ---------- render ---------- */
  var everyone = [];

  ROLES.forEach(function (role) {
    var grid = document.getElementById("grid-" + role);
    (DATA[role] || []).forEach(function (p, i) {
      p._role = role;
      p._name = norm(p.name);
      p._hay = norm([].concat(p.areas || [], p.keyAreas || []).join(" | ")) + " ";
      p._el = PHOTO_ROLES[role] ? photoCard(p, role) : miniCard(p, role);
      p._el.style.setProperty("--delay", ((i % 4) * 0.08) + "s");
      grid.appendChild(p._el);
      FX.observeReveal(p._el);
      FX.attachTilt(p._el);
      everyone.push(p);
    });
  });

  /* ---------- filter checkboxes ---------- */
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

  /* ---------- state + apply ---------- */
  var state = { q: "", role: null, practice: [], industry: [] };

  var searchInput = document.getElementById("peopleSearch");
  var resultsLine = document.getElementById("resultsLine");
  var emptyBox = document.getElementById("peopleEmpty");
  var clearBtn = document.getElementById("filtersClear");
  var countBadge = document.getElementById("filtersCount");
  var roleButtons = document.querySelectorAll("#roleTabs button");

  function apply() {
    var q = norm(state.q);
    var shown = 0;
    var perRole = {};

    everyone.forEach(function (p) {
      var ok = true;
      if (state.role && p._role !== state.role) ok = false;
      if (ok && q) ok = p._name.indexOf(q) !== -1 || p._hay.indexOf(q) !== -1;
      if (ok && state.practice.length) ok = state.practice.some(function (i) { return matches(p, PRACTICE_FILTERS[i]); });
      if (ok && state.industry.length) ok = state.industry.some(function (i) { return matches(p, INDUSTRY_FILTERS[i]); });

      p._el.hidden = !ok;
      if (ok) {
        shown++;
        perRole[p._role] = (perRole[p._role] || 0) + 1;
        // cards revealed while hidden would skip their animation; show them straight away
        p._el.classList.add("is-visible");
      }
    });

    ROLES.forEach(function (role) {
      document.getElementById("group-" + role).hidden = !perRole[role];
    });

    var activeFilters = state.practice.length + state.industry.length;
    var narrowed = q || state.role || activeFilters;
    resultsLine.textContent = narrowed
      ? "Showing " + shown + " of " + everyone.length + " people"
      : everyone.length + " people";
    emptyBox.hidden = shown !== 0;

    clearBtn.hidden = !activeFilters;
    countBadge.hidden = !activeFilters;
    countBadge.textContent = activeFilters;

    roleButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.role === state.role));
    });
  }

  var searchTimer;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = searchInput.value;
      apply();
    }, 120);
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
      state.role = state.role === b.dataset.role ? null : b.dataset.role;
      apply();
      var target = document.getElementById(state.role ? "group-" + state.role : "roleTabs");
      var top = target.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  function resetAll() {
    state = { q: "", role: null, practice: [], industry: [] };
    searchInput.value = "";
    document.querySelectorAll("#filtersPanel input[type=checkbox]").forEach(function (c) { c.checked = false; });
    apply();
  }
  clearBtn.addEventListener("click", function () {
    state.practice = [];
    state.industry = [];
    document.querySelectorAll("#filtersPanel input[type=checkbox]").forEach(function (c) { c.checked = false; });
    apply();
  });
  document.getElementById("emptyReset").addEventListener("click", resetAll);

  /* mobile: collapsible filters */
  var filtersToggle = document.getElementById("filtersToggle");
  var sidebar = document.getElementById("peopleSidebar");
  filtersToggle.addEventListener("click", function () {
    var open = sidebar.classList.toggle("filters-open");
    filtersToggle.setAttribute("aria-expanded", String(open));
  });

  /* ---------- person modal ---------- */
  var modal = document.getElementById("personModal");
  var pmRole = document.getElementById("pmRole");
  var pmName = document.getElementById("pmName");
  var pmBody = document.getElementById("pmBody");
  var pmCount = document.getElementById("pmCount");
  var current = null;
  var lastFocus = null;

  // people the modal can step through: same group, currently visible
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
    section("Key Practice Areas", p.keyAreas, true);
    section("Qualifications", p.quals);
    section("Professional Affiliations", p.affiliations);
    if (!pmBody.children.length) {
      pmBody.appendChild(el("p", "pm-empty", "Further details for " + p.name + " have not been published yet."));
    }


    var sibs = siblingsOf(p);
    var at = sibs.indexOf(p);
    pmCount.textContent = (at + 1) + " / " + sibs.length;

    // replay the entrance animation on each change
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
    var sibs = siblingsOf(current);
    var at = sibs.indexOf(current);
    fillModal(sibs[(at + dir + sibs.length) % sibs.length]);
  }

  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  // click on the dimmed backdrop closes
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
