/* =========================================================
   SKRINE — Capabilities: practice areas
   - capabilities.html (Design 1): grid of practice areas; clicking one opens a
     the Design 2 panel with a shortened write-up and a deals & transactions carousel
   - capabilities-classic.html (Design 2): the original preview panel
     (overview, related services preview, team)
   - practice-area.html?area=<slug>: full practice area page with every
     related capability
   - sectors.html / sector.html?sector=<slug>: sectors grid and sector page
   Data: js/practice-data.js (practice areas), js/people-data.js (photos),
         js/practice-deals.js (Design 1 deals, from skrine.com Transaction News)
   ========================================================= */
(function () {
  "use strict";

  var AREAS = window.SKRINE_PRACTICES || [];
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var PREVIEW_RELATED = 6; // related services shown in the panel before "View all"
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

  // with a limit, everyone past it is in the list but hidden; "+N more" shows them in place
  var teamListCount = 0;
  function teamList(team, limit) {
    var ul = el("ul", "pa-team");
    ul.id = "paTeam" + (++teamListCount);
    var extra = [];
    team.forEach(function (m, i) {
      var li = el("li", "pa-team-item");
      // linked to the person's profile (js/people-links.js) when they have one
      var to = window.SkrinePeople && window.SkrinePeople.href(m.name);
      var box = li;
      if (to) { box = el("a", "pa-team-link"); box.href = to; li.appendChild(box); }
      box.appendChild(avatar(m));
      var txt = el("span", "pa-team-text");
      txt.appendChild(el("span", "pa-team-name", m.name));
      txt.appendChild(el("span", "pa-team-role", m.role));
      box.appendChild(txt);
      if (limit && i >= limit) { li.hidden = true; li.classList.add("pa-team-extra"); extra.push(li); }
      ul.appendChild(li);
    });
    if (extra.length) {
      var more = el("li", "pa-team-item pa-team-more");
      var btn = el("button", null);
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", ul.id);
      var label = function (open) {
        btn.innerHTML = open
          ? 'Show less <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>'
          : "+" + extra.length + ' more <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
      };
      label(false);
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") !== "true";
        extra.forEach(function (li, k) {
          li.hidden = !open;
          li.style.setProperty("--k", k);
        });
        btn.setAttribute("aria-expanded", String(open));
        label(open);
        // the "more" pill stays after the last name
        ul.appendChild(more);
      });
      more.appendChild(btn);
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
     Design 1: deals & transactions carousel
     ========================================================= */
  var DESIGN = (document.querySelector("[data-design]") || { getAttribute: function () { return ""; } }).getAttribute("data-design");
  var DEALS = window.SKRINE_PRACTICE_DEALS || [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function monthYear(iso) { var p = (iso || "").split("-"); return p.length > 1 ? MONTHS[+p[1] - 1] + " " + p[0] : ""; }

  // figures count up from zero the first time a card comes into view
  function countUp(node, target) {
    var m = String(target).match(/^(\D*)([\d.,]+)$/);
    if (!m || reduceMotion) { node.textContent = target; return; }
    var prefix = m[1], num = parseFloat(m[2].replace(/,/g, "")), dec = (m[2].split(".")[1] || "").length;
    var start = null, DUR = 1100;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / DUR, 1), e = 1 - Math.pow(1 - p, 3);
      node.textContent = prefix + (num * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    node.textContent = prefix + (0).toFixed(dec);
    requestAnimationFrame(step);
  }

  function arrowBtn(dir) {
    var b = el("button", "pv-arrow pv-arrow--" + dir);
    b.type = "button";
    b.setAttribute("aria-label", dir === "prev" ? "Previous deals" : "Next deals");
    b.innerHTML = '<i class="fa-solid fa-chevron-' + (dir === "prev" ? "left" : "right") + '" aria-hidden="true"></i>';
    return b;
  }

  // rough US$ millions, only to rank deals by size
  var FX_USD = { "US$": 1, "USD": 1, "RM": 0.22, "A$": 0.66, "S$": 0.74 };
  function usdMillions(v) {
    if (!v) return 0;
    var m = String(v.num).match(/^([A-Z]*\$?)([\d.,]+)/);
    if (!m) return 0;
    return parseFloat(m[2].replace(/,/g, "")) * (v.unit === "bn" ? 1000 : 1) * (FX_USD[m[1]] || 1);
  }

  /* The practice area's three largest deals, one at a time:  ‹ [ deal ] ›
     Arrows and dots switch between them (wrapping round); swiping works on touch screens. */
  var TOP_DEALS = 3;
  function dealsCarousel(all) {
    var deals = all.slice().sort(function (x, y) {
      return usdMillions(y.value) - usdMillions(x.value) || y.date.localeCompare(x.date);
    }).slice(0, TOP_DEALS);
    var since = all.reduce(function (yr, d) { return Math.min(yr, +d.date.slice(0, 4)); }, 9999);
    var sec = el("section", "pv-deals");
    sec.setAttribute("aria-roledescription", "carousel");
    sec.setAttribute("aria-label", "Top deals and transactions");

    var head = el("div", "pv-head");
    head.appendChild(el("h3", "pa-side-title pv-label", "Deals & Transactions"));
    var sub = el("p", "pv-sub");
    sub.innerHTML = "<b>" + all.length + "</b> " + (all.length === 1 ? "transaction" : "transactions") + " announced since " + since;
    head.appendChild(sub);
    sec.appendChild(head);

    var stage = el("div", "pv-stage");
    var prev = arrowBtn("prev"), next = arrowBtn("next");
    var view = el("div", "pv-view");
    var track = el("ul", "pv-slides");
    view.appendChild(track);
    stage.appendChild(prev);
    stage.appendChild(view);
    stage.appendChild(next);
    sec.appendChild(stage);
    var dots = el("div", "pv-dots");
    sec.appendChild(dots);

    var counted = [];
    deals.forEach(function (d, i) {
      var li = el("li", "pv-slide");
      li.setAttribute("aria-roledescription", "slide");
      li.setAttribute("aria-label", (i + 1) + " of " + deals.length);
      var a = el("a", "pv-deal");
      a.href = d.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", d.title + (d.value ? ", " + d.value.num + d.value.unit : "") + ", " + monthYear(d.date) + " (opens skrine.com)");
      var side = el("div", "pv-deal-side");
      side.appendChild(el("span", "pv-deal-rank", "#" + (i + 1)));
      var fig = el("p", "pv-deal-fig");
      if (d.value) {
        var num = el("span", "pv-num", d.value.num);
        fig.appendChild(num);
        fig.appendChild(el("span", "pv-unit", d.value.unit));
        counted[i] = function () { countUp(num, d.value.num); };
      } else {
        fig.classList.add("pv-deal-fig--none");
        fig.textContent = "Undisclosed";
      }
      side.appendChild(fig);
      side.appendChild(el("p", "pv-deal-what", d.value ? d.value.label : "Value not announced"));
      a.appendChild(side);
      var main = el("div", "pv-deal-main");
      main.appendChild(el("p", "pv-deal-title", d.title));
      var foot = el("p", "pv-deal-foot");
      foot.appendChild(el("span", null, monthYear(d.date) + (d.team.length ? "  ·  " + d.team.slice(0, 2).join(", ") + (d.team.length > 2 ? " +" + (d.team.length - 2) : "") : "")));
      foot.insertAdjacentHTML("beforeend", '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>');
      main.appendChild(foot);
      a.appendChild(main);
      li.appendChild(a);
      track.appendChild(li);

      var dot = el("button", "pv-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show deal " + (i + 1));
      dot.addEventListener("click", function () { index = i; render(); });
      dots.appendChild(dot);
    });

    var slides = track.children, index = 0;
    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      for (var k = 0; k < slides.length; k++) {
        var shown = k === index;
        slides[k].setAttribute("aria-hidden", String(!shown));
        slides[k].querySelector("a").tabIndex = shown ? 0 : -1;
        dots.children[k].setAttribute("aria-current", shown ? "true" : "false");
      }
      if (counted[index]) { counted[index](); counted[index] = null; }
    }
    function go(dir) { index = (index + dir + deals.length) % deals.length; render(); }
    var many = deals.length > 1;
    prev.hidden = next.hidden = dots.hidden = !many;
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    sec.addEventListener("keydown", function (e) {
      if (!many) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    });
    var sx = null;
    view.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    view.addEventListener("touchend", function (e) {
      if (sx === null || !many) return;
      var dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    requestAnimationFrame(render);
    return { el: sec, stop: function () {} };
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
      if (DESIGN === "1") fillPanelV1(area); else fillPanel2(area);
    }

    function fillPanel2(area) {
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

      // right: related services preview + team
      var right = el("div", "pa-panel-side");
      if (area.related.length) {
        right.appendChild(el("h3", "pa-side-title", "Related Services"));
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
          ? "View all " + area.related.length + " related services"
          : "View related services") + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
        right.appendChild(all);
      }
      if (area.team.length) {
        right.appendChild(el("h3", "pa-side-title", "Team Members"));
        right.appendChild(teamList(area.team, PREVIEW_TEAM));
      }
      body.appendChild(right);

      card.appendChild(body);
      panel.appendChild(card);
    }

    /* ---------- Design 1 panel (capabilities.html) ----------
       Same as Design 2, except the write-up is cut to three lines with
       "Show more", and the deals & transactions carousel sits under it. */
    var stopPanel = function () {};

    function fillPanelV1(area) {
      stopPanel();
      fillPanel2(area);
      var left = panel.querySelector(".pa-panel-overview");
      var cta = left.querySelector(".pa-panel-cta");
      var text = el("div", "pv-text");
      text.id = "pvText";
      Array.prototype.slice.call(left.querySelectorAll(".pa-panel-text")).forEach(function (p) { p.remove(); });
      area.desc.forEach(function (p) { text.appendChild(el("p", null, p)); });
      left.insertBefore(text, cta);

      var actions = el("div", "pv-intro-actions");
      left.insertBefore(actions, cta);
      cta.classList.add("pv-explore");
      actions.appendChild(cta);
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
      requestAnimationFrame(function () { if (text.scrollHeight <= text.clientHeight + 2) more.hidden = true; });

      var deals = DEALS.filter(function (d) { return d.areas.indexOf(area.slug) > -1; });
      if (deals.length) {
        var dc = dealsCarousel(deals);
        left.appendChild(dc.el);
        stopPanel = function () { dc.stop(); stopPanel = function () {}; };
      }
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
      crumbs.innerHTML = '<a href="capabilities.html">Services</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="capabilities.html">Practice Areas</a>';
      head.appendChild(crumbs);
      head.appendChild(el("h1", "page-title", area.title));
      var stats = el("p", "pa-hero-stats");
      stats.textContent = [
        area.related.length ? area.related.length + " related services" : null,
        area.team.length ? area.team.length + (area.team.length === 1 ? " team member" : " team members") : null
      ].filter(Boolean).join("  ·  ");
      head.appendChild(stats);
      detail.appendChild(head);
      FX.observeReveal(head);

      // wide banner photo under the heading; without photos (html.pa-nophoto) a full-width dark
      // band of directory quotes about the practice (js/practice-recognition.js). No quotes: no band.
      var hero = null;
      if (document.documentElement.classList.contains("pa-nophoto")) {
        var REC = (window.SKRINE_PRACTICE_RECOGNITION || {})[area.slug] || { quotes: [] };
        if (REC.quotes.length) {
          hero = el("section", "pa-qband reveal");
          hero.setAttribute("aria-label", "What the directories say");
          var inner = el("div", "pa-qband-inner");
          var qMark = el("span", "pa-qband-mark", "“");
          qMark.setAttribute("aria-hidden", "true");
          inner.appendChild(qMark);
          var qStage = el("div", "pa-qband-stage");
          qStage.setAttribute("aria-live", "polite");
          inner.appendChild(qStage);
          var foot = el("div", "pa-qband-foot");
          var count = el("span", "pa-qband-count");
          foot.appendChild(count);
          var bar = el("span", "pa-qband-bar");
          var fill = el("span", "pa-qband-fill");
          bar.appendChild(fill);
          foot.appendChild(bar);
          var qi = 0, qTimer = null, many = REC.quotes.length > 1;
          var prevB = el("button", "pa-qband-btn"); prevB.type = "button"; prevB.setAttribute("aria-label", "Previous quote"); prevB.innerHTML = '<i class="fa-solid fa-arrow-left" aria-hidden="true"></i>';
          var nextB = el("button", "pa-qband-btn"); nextB.type = "button"; nextB.setAttribute("aria-label", "Next quote"); nextB.innerHTML = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
          if (many) { foot.appendChild(prevB); foot.appendChild(nextB); } else { bar.hidden = true; }
          inner.appendChild(foot);
          hero.appendChild(inner);
          var showQ = function (i) {
            qi = (i + REC.quotes.length) % REC.quotes.length;
            var q = REC.quotes[qi];
            qStage.textContent = "";
            var bq = el("blockquote", "pa-qband-quote" + (q.quote.length > 110 ? " is-long" : ""));
            bq.appendChild(el("p", null, q.quote));
            bq.appendChild(el("cite", null, q.source));
            qStage.appendChild(bq);
            count.textContent = many ? String(qi + 1).padStart(2, "0") + " / " + String(REC.quotes.length).padStart(2, "0") : "";
            // the bar fills over the time each quote is shown
            fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = "";
          };
          var reduceQ = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          var restart = function () { clearInterval(qTimer); if (many && !reduceQ) qTimer = setInterval(function () { showQ(qi + 1); }, 7000); };
          prevB.addEventListener("click", function () { showQ(qi - 1); restart(); });
          nextB.addEventListener("click", function () { showQ(qi + 1); restart(); });
          hero.addEventListener("mouseenter", function () { clearInterval(qTimer); hero.classList.add("is-paused"); });
          hero.addEventListener("mouseleave", function () { hero.classList.remove("is-paused"); showQ(qi); restart(); });
          showQ(0);
          restart();
        }
      } else {
        hero = banner(area);
        hero.classList.add("pa-hero", "reveal");
      }
      if (hero) {
        detail.appendChild(hero);
        FX.observeReveal(hero);
      }

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

      // related services (full list)
      if (area.related.length) {
        var rel = el("section", "pa-related");
        rel.id = "related";
        var head = el("div", "pa-related-head");
        head.appendChild(el("h2", "pa-section-title", "Related Services"));
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
  // listed A–Z wherever they appear (index, numbering, previous/next), whatever order the data file has
  var SECTORS = (window.SKRINE_SECTORS || []).slice().sort(function (a, b) { return a.title.localeCompare(b.title, "en", { sensitivity: "base" }); });
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
      if (s.team.length) txt.appendChild(el("span", "sr-meta", s.team.length + (s.team.length === 1 ? " team member" : " team members")));
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
      scrumbs.innerHTML = '<a href="capabilities.html">Services</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="sectors.html">Sectors</a>';
      shead.appendChild(scrumbs);
      shead.appendChild(el("h1", "page-title", sector.title));
      if (sector.team.length) shead.appendChild(el("p", "pa-hero-stats", sector.team.length + (sector.team.length === 1 ? " team member" : " team members")));
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
