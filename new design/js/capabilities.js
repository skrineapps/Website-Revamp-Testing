/* =========================================================
   SKRINE — Capabilities: practice areas
   - capabilities.html (Design 1): grid of practice areas; clicking one opens a
     two-column panel (write-up, related, deals & transactions, team carousel)
   - capabilities-classic.html (Design 2): the original preview panel
     (overview, related capabilities preview, team)
   - practice-area.html?area=<slug>: full practice area page with every
     related capability
   - sectors.html / sector.html?sector=<slug>: sectors grid and sector page
   Data: js/practice-data.js (practice areas), js/people-data.js (photos),
         js/practice-deals.js (Design 1 deals, from skrine.com Transaction News)
   ========================================================= */
(function () {
  "use strict";

  // review aid: switching designs keeps the open practice area (#slug)
  document.querySelectorAll("[data-switch]").forEach(function (a) {
    a.addEventListener("click", function () { a.href = a.getAttribute("href").split("#")[0] + location.hash; });
  });

  var AREAS = window.SKRINE_PRACTICES || [];
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var PREVIEW_RELATED = 6; // related capabilities shown in the panel before "View all"
  var PREVIEW_TEAM = 9;

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function norm(s) { return String(s || "").toLowerCase().replace(/[’'.,]/g, "").replace(/\s+/g, " ").trim(); }
  function areaUrl(slug, hash) { return "practice-area.html?area=" + encodeURIComponent(slug) + (hash ? "#" + hash : ""); }
  function initials(name) {
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }

  // photo files live in "current design/images/people/" — reuse the People page mapping
  var photoByName = {};
  ["partners", "consultants", "seniorAssociates", "associates"].forEach(function (role) {
    (PEOPLE[role] || []).forEach(function (p) { if (p.photo) photoByName[norm(p.name)] = p.photo; });
  });
  function photoFor(name) {
    var key = norm(name);
    if (photoByName[key]) return photoByName[key];
    // team names on skrine.com are sometimes shorter/longer than the People data
    for (var k in photoByName) {
      if (k.indexOf(key) === 0 || key.indexOf(k) === 0) return photoByName[k];
    }
    return name + ".png";
  }

  function avatar(person, size) {
    var wrap = el("span", "pa-avatar" + (size ? " pa-avatar--" + size : ""));
    wrap.setAttribute("aria-hidden", "true");
    var img = el("img");
    img.src = photoUrl(photoFor(person.name));
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", function () { img.replaceWith(el("span", "pa-avatar-initials", initials(person.name))); });
    wrap.appendChild(img);
    return wrap;
  }

  function teamList(team, limit, moreHref) {
    var ul = el("ul", "pa-team");
    team.slice(0, limit || team.length).forEach(function (m) {
      var li = el("li", "pa-team-item");
      li.appendChild(avatar(m));
      var txt = el("span", "pa-team-text");
      txt.appendChild(el("span", "pa-team-name", m.name));
      txt.appendChild(el("span", "pa-team-role", m.role));
      li.appendChild(txt);
      ul.appendChild(li);
    });
    if (limit && team.length > limit) {
      var more = el("li", "pa-team-item pa-team-more");
      var a = el("a", null, "+" + (team.length - limit) + " more");
      a.href = moreHref;
      more.appendChild(a);
      ul.appendChild(more);
    }
    return ul;
  }

  // banner photo for each practice area (images/practice/<slug>.jpg, from skrine.com)
  function banner(area, tag, folder) {
    var b = el(tag || "div", "pa-banner");
    var img = el("img", "pa-banner-img");
    img.src = "images/" + (folder || "practice") + "/" + area.slug + ".jpg";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    b.appendChild(img);
    return b;
  }

  /* =========================================================
     Design 1 building blocks: deals strip + team carousel
     ========================================================= */
  var DESIGN = (document.querySelector("[data-design]") || { getAttribute: function () { return ""; } }).getAttribute("data-design");
  var DEALS = window.SKRINE_PRACTICE_DEALS || [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function monthYear(iso) { var p = (iso || "").split("-"); return p.length > 1 ? MONTHS[+p[1] - 1] + " " + p[0] : ""; }

  // rough US$ millions, only to pick the largest deal for the feature card
  var FX_USD = { "US$": 1, "USD": 1, "RM": 0.22, "A$": 0.66, "S$": 0.74 };
  function usdMillions(v) {
    if (!v) return 0;
    var m = String(v.num).match(/^([A-Z]*\$?)([\d.,]+)/);
    if (!m) return 0;
    var n = parseFloat(m[2].replace(/,/g, "")) * (v.unit === "bn" ? 1000 : 1);
    return n * (FX_USD[m[1]] || 1);
  }

  // partners and consultants have a profile page; everyone else opens the People page filtered to them
  var PROFILE_ROLES = {};
  ["partners", "consultants"].forEach(function (r) { (PEOPLE[r] || []).forEach(function (p) { PROFILE_ROLES[norm(p.name)] = 1; }); });
  function personHref(name) {
    if (PROFILE_ROLES[norm(name)]) {
      return "profile.html?p=" + name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    return "people.html?q=" + encodeURIComponent(name);
  }

  // figures count up from zero when the panel opens
  function countUp(node, target) {
    var m = String(target).match(/^(\D*)([\d.,]+)$/);
    if (!m || reduceMotion) { node.textContent = target; return; }
    var prefix = m[1], num = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length;
    var start = null, DUR = 1300;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / DUR, 1), e = 1 - Math.pow(1 - p, 3);
      node.textContent = prefix + (num * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    node.textContent = prefix + (0).toFixed(dec);
    requestAnimationFrame(step);
  }

  /* A horizontal rail: native scrolling (wheel, trackpad, touch), drag with the
     mouse, arrow buttons, and optionally moving on its own until someone touches it. */
  function makeRail(track, prev, next, auto) {
    function step() { var item = track.firstElementChild; return item ? item.getBoundingClientRect().width + 14 : 240; }
    function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; }
    function sync() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = atEnd();
    }
    prev.addEventListener("click", function () { hold(); track.scrollBy({ left: -step() * 2, behavior: "smooth" }); });
    next.addEventListener("click", function () { hold(); track.scrollBy({ left: step() * 2, behavior: "smooth" }); });
    track.addEventListener("scroll", sync, { passive: true });

    // drag with a mouse (touch and trackpads scroll natively)
    var down = null, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = { x: e.clientX, left: track.scrollLeft };
      moved = false;
      hold();
    });
    function onMove(e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-dragging"); }
      track.scrollLeft = down.left - dx;
    }
    function onUp() {
      if (!down) return;
      down = null;
      track.classList.remove("is-dragging");
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    // a drag shouldn't also count as a click on a card
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // moving on its own: pauses while hovered, focused or touched, resumes after a moment
    var timer = null, paused = false, resumeAt = 0;
    function hold() { resumeAt = Date.now() + 5000; }
    ["pointerenter", "focusin", "touchstart", "wheel"].forEach(function (ev) {
      track.addEventListener(ev, function () { paused = true; hold(); }, { passive: true });
    });
    ["pointerleave", "focusout"].forEach(function (ev) { track.addEventListener(ev, function () { paused = false; hold(); }); });
    if (auto && !reduceMotion) {
      timer = setInterval(function () {
        if (paused || Date.now() < resumeAt || track.scrollWidth <= track.clientWidth) return;
        if (atEnd()) track.scrollTo({ left: 0, behavior: "smooth" });
        else track.scrollBy({ left: step(), behavior: "smooth" });
      }, 2600);
    }
    requestAnimationFrame(sync);
    return function stop() {
      clearInterval(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }

  function railHead(label, count, sub) {
    var head = el("div", "pv-head");
    var t = el("div", "pv-head-text");
    var h = el("h3", "pv-label", label);
    if (count) h.appendChild(el("span", "pv-count", String(count)));
    t.appendChild(h);
    if (sub) { var s = el("p", "pv-sub"); s.innerHTML = sub; t.appendChild(s); }
    head.appendChild(t);
    var nav = el("div", "pv-arrows");
    var prev = el("button", "pv-arrow");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous");
    prev.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i>';
    var next = el("button", "pv-arrow");
    next.type = "button";
    next.setAttribute("aria-label", "Next");
    next.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
    nav.appendChild(prev);
    nav.appendChild(next);
    head.appendChild(nav);
    return { el: head, prev: prev, next: next };
  }

  function dealFigure(v, cls) {
    var fig = el("p", cls);
    var num = el("span", "pv-num", v.num);
    fig.appendChild(num);
    fig.appendChild(el("span", "pv-unit", v.unit));
    return { el: fig, num: num };
  }

  function dealsBlock(deals) {
    var sec = el("section", "pv-deals");
    var biggest = deals.reduce(function (b, d) { return usdMillions(d.value) > usdMillions(b && b.value) ? d : b; }, null);
    var since = deals.reduce(function (y, d) { return Math.min(y, +d.date.slice(0, 4)); }, 9999);
    var counters = [];

    var head = el("div", "pv-head");
    var ht = el("div", "pv-head-text");
    ht.appendChild(el("h3", "pv-label", "Deals & Transactions"));
    var sub = el("p", "pv-sub");
    sub.innerHTML = "<b>" + deals.length + "</b> " + (deals.length === 1 ? "transaction" : "transactions") + " announced since " + since;
    ht.appendChild(sub);
    head.appendChild(ht);
    sec.appendChild(head);

    // feature: the largest deal this team has announced
    var rest = deals.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    if (biggest && biggest.value) {
      var ft = el("a", "pv-feature");
      ft.href = biggest.url;
      ft.target = "_blank";
      ft.rel = "noopener";
      ft.setAttribute("aria-label", "Largest mandate: " + biggest.title + ", " + biggest.value.num + biggest.value.unit + " (opens skrine.com)");
      ft.appendChild(el("span", "pv-feature-tag", "Largest mandate · " + monthYear(biggest.date)));
      var fig = dealFigure(biggest.value, "pv-feature-fig");
      counters.push([fig.num, biggest.value.num]);
      ft.appendChild(fig.el);
      ft.appendChild(el("p", "pv-feature-what", biggest.value.label));
      ft.appendChild(el("p", "pv-feature-title", biggest.title));
      var ff = el("p", "pv-feature-foot");
      ff.appendChild(el("span", null, biggest.team.slice(0, 3).join(" · ") + (biggest.team.length > 3 ? " +" + (biggest.team.length - 3) : "")));
      ff.insertAdjacentHTML("beforeend", '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>');
      ft.appendChild(ff);
      sec.appendChild(ft);
      rest = rest.filter(function (d) { return d !== biggest; });
    }

    // ledger: every other deal, newest first, scrolls inside its box
    if (rest.length) {
      var ledger = el("ol", "pv-ledger");
      ledger.setAttribute("aria-label", "More deals and transactions");
      rest.forEach(function (d, i) {
        var li = el("li");
        li.style.setProperty("--i", Math.min(i, 8));
        var a = el("a", "pv-row");
        a.href = d.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.setAttribute("aria-label", d.title + (d.value ? ", " + d.value.num + d.value.unit : "") + ", " + monthYear(d.date) + " (opens skrine.com)");
        if (d.value) {
          var rf = dealFigure(d.value, "pv-row-fig");
          if (i < 6) counters.push([rf.num, d.value.num]);
          a.appendChild(rf.el);
        } else {
          a.appendChild(el("p", "pv-row-fig pv-row-fig--none", "Undisclosed"));
        }
        var txt = el("span", "pv-row-text");
        txt.appendChild(el("span", "pv-row-title", d.title));
        txt.appendChild(el("span", "pv-row-meta", monthYear(d.date) + "  ·  " + d.team.slice(0, 2).join(", ") + (d.team.length > 2 ? " +" + (d.team.length - 2) : "")));
        a.appendChild(txt);
        a.insertAdjacentHTML("beforeend", '<i class="fa-solid fa-arrow-up-right-from-square pv-row-go" aria-hidden="true"></i>');
        li.appendChild(a);
        ledger.appendChild(li);
      });
      var wrap = el("div", "pv-ledger-wrap");
      wrap.appendChild(ledger);
      sec.appendChild(wrap);
      // the fade shows only while there's more to scroll
      var syncFade = function () { wrap.classList.toggle("has-more", ledger.scrollTop + ledger.clientHeight < ledger.scrollHeight - 4); };
      ledger.addEventListener("scroll", syncFade, { passive: true });
      requestAnimationFrame(syncFade);
    }

    requestAnimationFrame(function () { counters.forEach(function (c) { countUp(c[0], c[1]); }); });
    return { el: sec, stop: function () {} };
  }

  function teamCarousel(team) {
    var sec = el("section", "pv-team");
    var head = railHead("Team Members", team.length);
    sec.appendChild(head.el);
    var track = el("ul", "pv-track pv-team-track");
    track.setAttribute("aria-label", "Team members");
    team.forEach(function (m) {
      var li = el("li");
      var a = el("a", "pv-member");
      a.href = personHref(m.name);
      a.appendChild(avatar(m, "lg"));
      var txt = el("span", "pv-member-text");
      txt.appendChild(el("span", "pv-member-name", m.name));
      txt.appendChild(el("span", "pv-member-role", m.role));
      a.appendChild(txt);
      li.appendChild(a);
      track.appendChild(li);
    });
    sec.appendChild(track);
    return { el: sec, stop: makeRail(track, head.prev, head.next, true) };
  }

  /* =========================================================
     Practice areas grid + in-place preview panel
     ========================================================= */
  var grid = document.getElementById("paGrid");
  if (grid) {
    var tiles = [];
    var openIndex = -1;

    var panel = el("section", "pa-panel");
    panel.id = "paPanel";
    panel.setAttribute("role", "region");
    panel.hidden = true;

    AREAS.forEach(function (area, i) {
      var item = el("div", "pa-tile-wrap reveal");
      item.setAttribute("role", "listitem");
      item.style.setProperty("--delay", ((i % 4) * 0.06) + "s");
      var btn = el("button", "pa-tile");
      btn.type = "button";
      btn.id = "tile-" + area.slug;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "paPanel");
      btn.appendChild(el("span", "pa-tile-label", area.title));
      var chev = el("i", "fa-solid fa-chevron-down pa-tile-chev");
      chev.setAttribute("aria-hidden", "true");
      btn.appendChild(chev);
      btn.addEventListener("click", function () { toggle(i, true); });
      item.appendChild(btn);
      grid.appendChild(item);
      FX.observeReveal(item);
      tiles.push({ wrap: item, btn: btn, area: area });
    });

    function columns() {
      var cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
      return cols || 1;
    }

    // the panel sits after the last tile of the clicked tile's row
    function placePanel(i) {
      var cols = columns();
      var rowEnd = Math.min(Math.ceil((i + 1) / cols) * cols, tiles.length) - 1;
      tiles[rowEnd].wrap.after(panel);
    }

    function fillPanel(area) {
      if (DESIGN === "1") { fillPanelV1(area); return; }
      panel.textContent = "";
      panel.setAttribute("aria-labelledby", "panelTitle");

      var card = el("div", "pa-panel-card");
      card.appendChild(banner(area));

      var close = el("button", "pa-panel-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close " + area.title);
      close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      close.addEventListener("click", function () { toggle(openIndex, true); });
      card.appendChild(close);

      var body = el("div", "pa-panel-body");

      // left: overview
      var left = el("div", "pa-panel-overview");
      var h = el("h2", "pa-panel-title", area.title);
      h.id = "panelTitle";
      left.appendChild(h);
      area.desc.slice(0, 2).forEach(function (p) { left.appendChild(el("p", "pa-panel-text", p)); });
      var go = el("a", "btn btn--solid pa-panel-cta");
      go.href = areaUrl(area.slug);
      go.innerHTML = 'Explore ' + area.title + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
      left.appendChild(go);
      body.appendChild(left);

      // right: related capabilities preview + team
      var right = el("div", "pa-panel-side");
      if (area.related.length) {
        right.appendChild(el("h3", "pa-side-title", "Related Capabilities"));
        var ul = el("ul", "pa-related-preview");
        area.related.slice(0, PREVIEW_RELATED).forEach(function (r) {
          var li = el("li");
          var a = el("a", null, r.name);
          a.href = areaUrl(area.slug, "rel-" + r.slug);
          a.insertAdjacentHTML("beforeend", ' <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>');
          li.appendChild(a);
          ul.appendChild(li);
        });
        right.appendChild(ul);
        var all = el("a", "pa-view-all");
        all.href = areaUrl(area.slug, "related");
        all.innerHTML = (area.related.length > PREVIEW_RELATED
          ? "View all " + area.related.length + " related capabilities"
          : "View related capabilities") + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
        right.appendChild(all);
      }
      if (area.team.length) {
        right.appendChild(el("h3", "pa-side-title", "Team Members"));
        right.appendChild(teamList(area.team, PREVIEW_TEAM, areaUrl(area.slug, "team")));
      }
      body.appendChild(right);

      card.appendChild(body);
      panel.appendChild(card);
    }

    /* ---------- Design 1 panel (capabilities.html) ----------
       banner with the title · write-up cut to three lines with "Show more" ·
       related capabilities · deals & transactions (js/practice-deals.js) ·
       team carousel that moves on its own and can be dragged or scrolled */
    var stopPanel = function () {};
    var V1_RELATED = 4;   // related capabilities in the Design 1 panel before "View all"

    function fillPanelV1(area) {
      stopPanel();
      panel.textContent = "";
      panel.setAttribute("aria-labelledby", "panelTitle");
      var deals = DEALS.filter(function (d) { return d.areas.indexOf(area.slug) > -1; });
      var card = el("div", "pa-panel-card pv-card" + (deals.length ? "" : " pv-card--nodeals"));

      var close = el("button", "pa-panel-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close " + area.title);
      close.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      close.addEventListener("click", function () { toggle(openIndex, true); });
      card.appendChild(close);

      var grid = el("div", "pv-grid");

      // left: photo + title, write-up, Explore, related capabilities
      var left = el("div", "pv-left");
      var top = banner(area);
      top.classList.add("pv-banner");
      var h = el("h2", "pv-title", area.title);
      h.id = "panelTitle";
      top.appendChild(h);
      if (area.team.length) top.appendChild(el("span", "pv-banner-meta", area.team.length + " lawyers" + (deals.length ? "  ·  " + deals.length + " deals" : "")));
      left.appendChild(top);

      var text = el("div", "pv-text");
      text.id = "pvText";
      area.desc.forEach(function (p) { text.appendChild(el("p", null, p)); });
      left.appendChild(text);
      var actions = el("div", "pv-intro-actions");
      var go = el("a", "btn btn--solid pv-explore");
      go.href = areaUrl(area.slug);
      go.innerHTML = "Explore " + area.title + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
      actions.appendChild(go);
      var more = el("button", "pv-more", "Show more");
      more.type = "button";
      more.setAttribute("aria-expanded", "false");
      more.setAttribute("aria-controls", "pvText");
      more.addEventListener("click", function () {
        var open = text.classList.toggle("is-open");
        more.textContent = open ? "Show less" : "Show more";
        more.setAttribute("aria-expanded", String(open));
      });
      actions.appendChild(more);
      left.appendChild(actions);

      var related = null;
      var lim = deals.length ? V1_RELATED : 12;
      if (area.related.length) {
        related = el("div", "pv-related");
        related.appendChild(el("h3", "pv-label", "Related Capabilities"));
        var ul = el("ul", "pv-chips");
        area.related.slice(0, lim).forEach(function (r) {
          var li = el("li");
          var a = el("a", "pv-chip", r.name);
          a.href = areaUrl(area.slug, "rel-" + r.slug);
          li.appendChild(a);
          ul.appendChild(li);
        });
        related.appendChild(ul);
        if (area.related.length > lim) {
          var all = el("a", "pa-view-all");
          all.href = areaUrl(area.slug, "related");
          all.innerHTML = "View all " + area.related.length + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
          related.appendChild(all);
        }
      }

      var stops = [];
      grid.appendChild(left);
      // right: deals (or, with no deals, the related capabilities)
      var right = el("div", "pv-right");
      if (deals.length) {
        var dl = dealsBlock(deals);
        right.appendChild(dl.el);
        stops.push(dl.stop);
        if (related) left.appendChild(related);
      } else if (related) {
        right.appendChild(related);
      }
      grid.appendChild(right);
      card.appendChild(grid);

      if (area.team.length) {
        var tc = teamCarousel(area.team);
        card.appendChild(tc.el);
        stops.push(tc.stop);
      }
      panel.appendChild(card);

      requestAnimationFrame(function () {
        if (text.scrollHeight <= text.clientHeight + 2) more.hidden = true;
      });
      stopPanel = function () { stops.forEach(function (fn) { fn(); }); stopPanel = function () {}; };
    }

    function toggle(i, fromUser) {
      var closing = i === openIndex;
      if (DESIGN === "1") stopPanel();
      if (openIndex > -1) {
        tiles[openIndex].btn.setAttribute("aria-expanded", "false");
        tiles[openIndex].btn.classList.remove("is-active");
      }
      if (closing) {
        panel.classList.remove("is-open");
        panel.hidden = true;
        openIndex = -1;
        history.replaceState(null, "", location.pathname + location.search);
        if (fromUser) tiles[i].btn.focus();
        return;
      }
      openIndex = i;
      var t = tiles[i];
      t.btn.setAttribute("aria-expanded", "true");
      t.btn.classList.add("is-active");
      fillPanel(t.area);
      placePanel(i);
      panel.hidden = false;
      panel.classList.remove("is-open");
      void panel.offsetWidth; // restart the open animation
      panel.classList.add("is-open");
      history.replaceState(null, "", "#" + t.area.slug);

      if (fromUser) {
        // keep the clicked tile and the panel in view
        var top = t.btn.getBoundingClientRect().top + window.scrollY - 110;
        var bottom = panel.getBoundingClientRect().bottom + window.scrollY;
        if (bottom > window.scrollY + window.innerHeight || top < window.scrollY) {
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      }
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openIndex > -1 && !document.querySelector(".nav-item.is-open")) toggle(openIndex, true);
    });

    var lastCols = columns();
    window.addEventListener("resize", function () {
      var c = columns();
      if (c !== lastCols && openIndex > -1) placePanel(openIndex);
      lastCols = c;
    });

    // open from a link like capabilities.html#corporate
    var fromHash = location.hash.slice(1);
    var at = tiles.findIndex(function (t) { return t.area.slug === fromHash; });
    if (at > -1) toggle(at, false);
  }

  /* =========================================================
     Individual practice area page
     ========================================================= */
  var detail = document.getElementById("paDetail");
  if (detail) {
    var slug = new URLSearchParams(location.search).get("area");
    var area = AREAS.find(function (a) { return a.slug === slug; });

    if (!area) {
      detail.appendChild(el("h1", "page-title", "Practice area not found"));
      var back = el("a", "btn btn--outline", "See all practice areas");
      back.href = "capabilities.html";
      detail.appendChild(back);
    } else {
      document.title = area.title + " | Skrine";

      // page heading in the same position as every other page:
      // breadcrumb (eyebrow slot) → title → stats line
      var head = el("header", "page-head reveal");
      var crumbs = el("nav", "pa-crumbs");
      crumbs.setAttribute("aria-label", "Breadcrumb");
      crumbs.innerHTML = '<a href="capabilities.html">Capabilities</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="capabilities.html">Practice Areas</a>';
      head.appendChild(crumbs);
      head.appendChild(el("h1", "page-title", area.title));
      var stats = el("p", "pa-hero-stats");
      stats.textContent = [
        area.related.length ? area.related.length + " related capabilities" : null,
        area.team.length ? area.team.length + " team members" : null
      ].filter(Boolean).join("  ·  ");
      head.appendChild(stats);
      detail.appendChild(head);
      FX.observeReveal(head);

      // wide banner photo under the heading
      var hero = banner(area);
      hero.classList.add("pa-hero", "reveal");
      detail.appendChild(hero);
      FX.observeReveal(hero);

      // overview + team
      var cols = el("div", "pa-detail-cols");
      var ov = el("section", "pa-overview reveal");
      ov.appendChild(el("h2", "pa-section-title", "Overview"));
      area.desc.forEach(function (p) { ov.appendChild(el("p", "pa-overview-text", p)); });
      cols.appendChild(ov);
      FX.observeReveal(ov);

      if (area.team.length) {
        var tm = el("aside", "pa-team-box reveal");
        tm.id = "team";
        tm.appendChild(el("h2", "pa-section-title", "Team Members"));
        tm.appendChild(teamList(area.team));
        cols.appendChild(tm);
        FX.observeReveal(tm);
      }
      detail.appendChild(cols);

      // related capabilities (full list)
      if (area.related.length) {
        var rel = el("section", "pa-related");
        rel.id = "related";
        var head = el("div", "pa-related-head");
        head.appendChild(el("h2", "pa-section-title", "Related Capabilities"));
        var expandAll = el("button", "pa-expand-all", "Expand all");
        expandAll.type = "button";
        head.appendChild(expandAll);
        rel.appendChild(head);

        var list = el("div", "pa-related-list");
        area.related.forEach(function (r, i) {
          var item = el("details", "pa-rel reveal");
          item.id = "rel-" + r.slug;
          item.style.setProperty("--delay", ((i % 6) * 0.04) + "s");
          var sum = el("summary", "pa-rel-summary");
          sum.appendChild(el("span", "pa-rel-num", String(i + 1).padStart(2, "0")));
          sum.appendChild(el("span", "pa-rel-name", r.name));
          var ic = el("i", "fa-solid fa-plus pa-rel-icon");
          ic.setAttribute("aria-hidden", "true");
          sum.appendChild(ic);
          item.appendChild(sum);
          var bodyR = el("div", "pa-rel-body");
          r.intro.forEach(function (t) { bodyR.appendChild(el("p", null, t)); });
          if (r.points.length) {
            var pl = el("ul", "pa-rel-points");
            r.points.forEach(function (t) { pl.appendChild(el("li", null, t)); });
            bodyR.appendChild(pl);
          }
          item.appendChild(bodyR);
          list.appendChild(item);
          FX.observeReveal(item);
        });
        rel.appendChild(list);
        detail.appendChild(rel);

        expandAll.addEventListener("click", function () {
          var items = list.querySelectorAll("details");
          var openAll = Array.prototype.some.call(items, function (d) { return !d.open; });
          items.forEach(function (d) { d.open = openAll; });
          expandAll.textContent = openAll ? "Collapse all" : "Expand all";
        });

        // arriving from a preview link: open and show that capability
        var target = location.hash && document.getElementById(location.hash.slice(1));
        if (target && target.tagName === "DETAILS") {
          target.open = true;
          target.classList.add("is-visible");
          setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
        }
      }

      // other practice areas
      var others = el("nav", "pa-others reveal");
      others.setAttribute("aria-label", "Other practice areas");
      others.appendChild(el("h2", "pa-section-title", "Other Practice Areas"));
      var chips = el("div", "pa-other-chips");
      AREAS.forEach(function (a) {
        if (a.slug === area.slug) return;
        var c = el("a", "pa-other-chip", a.title);
        c.href = areaUrl(a.slug);
        chips.appendChild(c);
      });
      others.appendChild(chips);
      detail.appendChild(others);
      FX.observeReveal(others);
    }
  }

  /* =========================================================
     Sectors (formerly "Industries")
     ========================================================= */
  var SECTORS = window.SKRINE_SECTORS || [];
  function sectorUrl(slug) { return "sector.html?sector=" + encodeURIComponent(slug); }

  // practice areas sharing the most team members with a sector
  function relatedPractices(sector, limit) {
    var names = {};
    sector.team.forEach(function (m) { names[norm(m.name)] = 1; });
    return AREAS.map(function (a) {
      var shared = a.team.filter(function (m) { return names[norm(m.name)]; }).length;
      return { area: a, shared: shared };
    }).filter(function (x) { return x.shared > 0; })
      .sort(function (x, y) { return y.shared - x.shared; })
      .slice(0, limit)
      .map(function (x) { return x.area; });
  }

  /* ---------- Sectors index + live preview ---------- */
  var sectorList = document.getElementById("sectorList");
  if (sectorList) {
    var preview = document.getElementById("sectorPreview");
    var imgs = preview.querySelectorAll(".sp-img");
    var pIndex = preview.querySelector(".sp-index");
    var pTitle = preview.querySelector(".sp-title");
    var pSummary = preview.querySelector(".sp-summary");
    var pCta = preview.querySelector(".sp-cta");
    var rows = [];
    var shown = -1;
    var pad = function (n) { return String(n).padStart(2, "0"); };

    // first one or two sentences of the overview, kept short
    function summary(s) {
      var text = s.desc[0] || "";
      var sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
      var out = sentences[0];
      if (out.length < 140 && sentences[1]) out += sentences[1];
      return out.trim();
    }

    function show(i) {
      if (i === shown) return;
      shown = i;
      var s = SECTORS[i];
      // cross-fade between the two image layers
      var cur = preview.querySelector(".sp-img.is-current");
      var next = cur === imgs[0] ? imgs[1] : imgs[0];
      next.src = "images/sectors/" + s.slug + ".jpg";
      next.classList.add("is-current");
      cur.classList.remove("is-current");

      preview.classList.remove("is-swapping");
      void preview.offsetWidth;
      preview.classList.add("is-swapping");
      pIndex.textContent = pad(i + 1) + " / " + pad(SECTORS.length);
      pTitle.textContent = s.title;
      pSummary.textContent = summary(s);
      pCta.href = sectorUrl(s.slug);
      pCta.setAttribute("aria-label", "Explore " + s.title);
      rows.forEach(function (r, k) { r.classList.toggle("is-active", k === i); });
    }

    SECTORS.forEach(function (s, i) {
      var li = el("li", "reveal");
      li.style.setProperty("--delay", (i * 0.04) + "s");
      var a = el("a", "sector-row");
      a.href = sectorUrl(s.slug);
      var thumb = el("img", "sr-thumb");
      thumb.src = "images/sectors/" + s.slug + ".jpg";
      thumb.alt = "";
      thumb.loading = "lazy";
      a.appendChild(thumb);
      a.appendChild(el("span", "sr-num", pad(i + 1)));
      var txt = el("span", "sr-text");
      txt.appendChild(el("span", "sr-name", s.title));
      if (s.team.length) txt.appendChild(el("span", "sr-meta", s.team.length + " team members"));
      a.appendChild(txt);
      var arrow = el("i", "fa-solid fa-arrow-right sr-arrow");
      arrow.setAttribute("aria-hidden", "true");
      a.appendChild(arrow);
      a.addEventListener("mouseenter", function () { show(i); });
      a.addEventListener("focus", function () { show(i); });
      li.appendChild(a);
      sectorList.appendChild(li);
      FX.observeReveal(li);
      rows.push(a);
    });

    show(0);
  }

  /* ---------- Individual sector page ---------- */
  var sectorDetail = document.getElementById("sectorDetail");
  if (sectorDetail) {
    var sslug = new URLSearchParams(location.search).get("sector");
    var sector = SECTORS.find(function (s) { return s.slug === sslug; });

    if (!sector) {
      sectorDetail.appendChild(el("h1", "page-title", "Sector not found"));
      var sb = el("a", "btn btn--outline", "See all sectors");
      sb.href = "sectors.html";
      sectorDetail.appendChild(sb);
    } else {
      document.title = sector.title + " | Skrine";

      var shead = el("header", "page-head reveal");
      var scrumbs = el("nav", "pa-crumbs");
      scrumbs.setAttribute("aria-label", "Breadcrumb");
      scrumbs.innerHTML = '<a href="capabilities.html">Capabilities</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="sectors.html">Sectors</a>';
      shead.appendChild(scrumbs);
      shead.appendChild(el("h1", "page-title", sector.title));
      if (sector.team.length) shead.appendChild(el("p", "pa-hero-stats", sector.team.length + " team members"));
      sectorDetail.appendChild(shead);
      FX.observeReveal(shead);

      var shero = banner(sector, null, "sectors");
      shero.classList.add("pa-hero", "reveal");
      sectorDetail.appendChild(shero);
      FX.observeReveal(shero);

      var scols = el("div", "pa-detail-cols");
      var sov = el("section", "pa-overview reveal");
      sov.appendChild(el("h2", "pa-section-title", "Overview"));
      sector.desc.forEach(function (p) { sov.appendChild(el("p", "pa-overview-text", p)); });
      scols.appendChild(sov);
      FX.observeReveal(sov);
      if (sector.team.length) {
        var stm = el("aside", "pa-team-box reveal");
        stm.appendChild(el("h2", "pa-section-title", "Team Members"));
        stm.appendChild(teamList(sector.team));
        scols.appendChild(stm);
        FX.observeReveal(stm);
      }
      sectorDetail.appendChild(scols);

      // related practice areas (by shared team members)
      var rel = relatedPractices(sector, 4);
      if (rel.length) {
        var rp = el("section", "sector-related reveal");
        rp.appendChild(el("h2", "pa-section-title", "Related Practice Areas"));
        var rg = el("div", "sector-related-grid");
        rel.forEach(function (a) {
          var card = el("a", "sector-related-card");
          card.href = areaUrl(a.slug);
          card.setAttribute("data-tilt", "");
          var im = el("img");
          im.src = "images/practice/" + a.slug + ".jpg";
          im.alt = "";
          im.loading = "lazy";
          card.appendChild(im);
          var t = el("span", "sector-related-name", a.title);
          t.insertAdjacentHTML("beforeend", ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>');
          card.appendChild(t);
          rg.appendChild(card);
          FX.attachTilt(card);
        });
        rp.appendChild(rg);
        sectorDetail.appendChild(rp);
        FX.observeReveal(rp);
      }

      var sothers = el("nav", "pa-others reveal");
      sothers.setAttribute("aria-label", "Other sectors");
      sothers.appendChild(el("h2", "pa-section-title", "Other Sectors"));
      var schips = el("div", "pa-other-chips");
      SECTORS.forEach(function (s) {
        if (s.slug === sector.slug) return;
        var c = el("a", "pa-other-chip", s.title);
        c.href = sectorUrl(s.slug);
        schips.appendChild(c);
      });
      sothers.appendChild(schips);
      sectorDetail.appendChild(sothers);
      FX.observeReveal(sothers);
    }
  }
})();
