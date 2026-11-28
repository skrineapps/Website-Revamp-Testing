/* =========================================================
   SKRINE — Capabilities, new structure
   (Practice Areas layout 3 / Sectors layout 2)
   - capabilities-v2.html: practice area tiles (Dispute Resolution is one of them)
   - sectors-v2.html: sector tiles
   - practice-area-v2.html?area=<slug>     practice area page
   - practice-area-v2.html?disputes=<slug> a "Disputes" page: the green part of
     a practice area (or sector), linked from that parent AND from the
     Dispute Resolution list, so the disputes team stays separate
   - sector-v2.html?sector=<slug>          sector page
   Data: js/practice-data-v2.js; photos from js/people-data.js.
   Uses the same classes as the other practice area pages (css/capabilities.css),
   so every site design restyles it.
   ========================================================= */
(function () {
  "use strict";
  var D = window.SKRINE_CAPABILITIES_V2;
  if (!D) return;
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var FX = window.SkrineFX || { observeReveal: function (n) { n.classList.add("is-visible"); }, attachTilt: function () {} };
  var PHOTO_DIR = "../current design/images/people/";
  var byTitle = function (a, b) { return a.title.localeCompare(b.title, "en", { sensitivity: "base" }); };
  var PRACTICES = D.practices.slice().sort(byTitle);
  var SECTORS = D.sectors.slice().sort(byTitle);
  var AREA = {}, SECTOR = {};
  PRACTICES.forEach(function (p) { AREA[p.slug] = p; });
  SECTORS.forEach(function (s) { SECTOR[s.slug] = s; });
  // the Dispute Resolution entry that opens each page
  var DR_LABEL = {};
  D.drList.forEach(function (r) { DR_LABEL[r.disputes || r.area || ""] = r.label; });

  var areaUrl = function (slug) { return "practice-area-v2.html?area=" + encodeURIComponent(slug); };
  var disputesUrl = function (slug) { return "practice-area-v2.html?disputes=" + encodeURIComponent(slug); };
  var sectorUrl = function (slug) { return "sector-v2.html?sector=" + encodeURIComponent(slug); };
  var parentOf = function (x) { return x.parentType === "sector" ? SECTOR[x.parent] : AREA[x.parent]; };
  var parentUrl = function (x) { return x.parentType === "sector" ? sectorUrl(x.parent) : areaUrl(x.parent); };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function slugify(t) { return String(t).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function icon(cls) { var i = el("i", cls); i.setAttribute("aria-hidden", "true"); return i; }
  function show(n) { FX.observeReveal(n); return n; }

  /* ---------- people: match document names to the People data (photo, role) ---------- */
  var ROLE = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };
  var STOP = { bin: 1, binti: 1, to: 1, puan: 1, tan: 0, sri: 1, dato: 1 };
  function tokens(n) { return String(n).toLowerCase().replace(/[’'.]/g, "").split(/[^a-z]+/).filter(function (t) { return t && !STOP[t]; }); }
  var DIRECTORY = [];
  Object.keys(ROLE).forEach(function (r) {
    (PEOPLE[r] || []).forEach(function (p) { DIRECTORY.push({ name: p.name, photo: p.photo || p.name + ".png", role: ROLE[r], t: tokens(p.name) }); });
  });
  // every part of the name in the document appears in the People entry (handles "Louise Azmi", "Aufa binti Radzi")
  function person(name) {
    var t = tokens(name);
    var hit = DIRECTORY.find(function (p) { return t.length && t.every(function (x) { return p.t.indexOf(x) > -1; }); });
    return hit || { name: name, role: "", photo: name + ".png" };
  }
  function initials(n) { var t = tokens(n); return ((t[0] || "")[0] || "").toUpperCase() + ((t[1] || "")[0] || "").toUpperCase(); }
  function teamList(names) {
    var ul = el("ul", "pa-team");
    names.forEach(function (n) {
      var p = person(n);
      var li = el("li", "pa-team-item");
      // linked to the person's profile (js/people-links.js) when they have one
      var to = window.SkrinePeople && window.SkrinePeople.href(p.name);
      var box = li;
      if (to) { box = el("a", "pa-team-link"); box.href = to; li.appendChild(box); }
      var av = el("span", "pa-avatar");
      av.setAttribute("aria-hidden", "true");
      var img = el("img");
      img.src = /^(https?:)?\/\//.test(p.photo) ? p.photo : PHOTO_DIR + encodeURIComponent(p.photo);
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.replaceWith(el("span", "pa-avatar-initials", initials(p.name))); });
      av.appendChild(img);
      box.appendChild(av);
      var txt = el("span", "pa-team-text");
      txt.appendChild(el("span", "pa-team-name", p.name));
      if (p.role) txt.appendChild(el("span", "pa-team-role", p.role));
      box.appendChild(txt);
      ul.appendChild(li);
    });
    return ul;
  }

  /* ---------- shared page parts ---------- */
  function heading(root, crumbs, title, note) {
    var head = el("header", "page-head reveal");
    var nav = el("nav", "pa-crumbs");
    nav.setAttribute("aria-label", "Breadcrumb");
    crumbs.forEach(function (c, i) {
      if (i) nav.appendChild(icon("fa-solid fa-chevron-right"));
      var a = el("a", null, c[0]);
      a.href = c[1];
      nav.appendChild(a);
    });
    head.appendChild(nav);
    head.appendChild(el("h1", "page-title", title));
    if (note) head.appendChild(note);
    root.appendChild(show(head));
  }
  function bannerFor(img) {
    var b = el("div", "pa-banner pa-hero reveal");
    var im = el("img", "pa-banner-img");
    im.src = img ? "images/" + img + ".jpg" : "images/hero-palette.jpg";
    im.alt = "";
    im.setAttribute("aria-hidden", "true");
    b.appendChild(im);
    return show(b);
  }

  /* Photos "Off" (html.pa-nophoto, the Photos pill): no banner photo; instead the
     band of directory quotes used on the other practice area pages
     (js/practice-recognition.js). No quotes for a page: no band. */
  var REC = window.SKRINE_PRACTICE_RECOGNITION || {};
  var REC_KEY = {
    "banking-and-finance": "banking-and-finance",
    "corporate-and-commercial": "corporate",
    "mergers-and-acquisitions": "corporate",
    "intellectual-property": "intellectual-property-and-tmt",
    "technology-media-and-telecommunications-tmt": "intellectual-property-and-tmt",
    "construction-engineering-projects-and-infrastructure": "construction-and-engineering",
    "employment": "employment",
    "arbitration-and-alternative-dispute-resolution": "litigation-and-arbitration",
    "dispute-resolution": "litigation-and-arbitration"
  };
  var NO_PHOTO = document.documentElement.classList.contains("pa-nophoto");
  function quoteBand(quotes) {
    quotes = quotes.slice(0, 2);   // at most two quotes
    var hero = el("section", "pa-qband cv2-qband reveal");
    hero.setAttribute("aria-label", "What the directories say");
    var inner = el("div", "pa-qband-inner");
    var mark = el("span", "pa-qband-mark", "“");
    mark.setAttribute("aria-hidden", "true");
    inner.appendChild(mark);
    var stage = el("div", "pa-qband-stage");
    stage.setAttribute("aria-live", "polite");
    inner.appendChild(stage);
    var foot = el("div", "pa-qband-foot");
    var count = el("span", "pa-qband-count");
    foot.appendChild(count);
    var bar = el("span", "pa-qband-bar");
    var fill = el("span", "pa-qband-fill");
    bar.appendChild(fill);
    foot.appendChild(bar);
    var many = quotes.length > 1, qi = 0, timer = null;
    var prev = el("button", "pa-qband-btn"); prev.type = "button"; prev.setAttribute("aria-label", "Previous quote"); prev.appendChild(icon("fa-solid fa-arrow-left"));
    var next = el("button", "pa-qband-btn"); next.type = "button"; next.setAttribute("aria-label", "Next quote"); next.appendChild(icon("fa-solid fa-arrow-right"));
    if (many) { foot.appendChild(prev); foot.appendChild(next); } else { bar.hidden = true; }
    inner.appendChild(foot);
    hero.appendChild(inner);
    function go(i) {
      qi = (i + quotes.length) % quotes.length;
      var q = quotes[qi];
      stage.textContent = "";
      var bq = el("blockquote", "pa-qband-quote" + (q.quote.length > 110 ? " is-long" : ""));
      bq.appendChild(el("p", null, q.quote));
      bq.appendChild(el("cite", null, String(q.source).replace(/\s+\d{4}(\s*[\/–-]\s*\d{2,4})?$/, "")));   // no year
      stage.appendChild(bq);
      count.textContent = many ? String(qi + 1).padStart(2, "0") + " / " + String(quotes.length).padStart(2, "0") : "";
      fill.style.animation = "none"; void fill.offsetWidth; fill.style.animation = "";
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function restart() { clearInterval(timer); if (many && !reduce) timer = setInterval(function () { go(qi + 1); }, 7000); }
    prev.addEventListener("click", function () { go(qi - 1); restart(); });
    next.addEventListener("click", function () { go(qi + 1); restart(); });
    hero.addEventListener("mouseenter", function () { clearInterval(timer); hero.classList.add("is-paused"); });
    hero.addEventListener("mouseleave", function () { hero.classList.remove("is-paused"); go(qi); restart(); });
    go(0);
    restart();
    return show(hero);
  }
  // banner photo, or (photos off) the quotes band; disputes pages use the dispute resolution quotes
  function heroFor(page, isDisputes) {
    if (!NO_PHOTO) return bannerFor(page.img);
    var key = isDisputes ? "litigation-and-arbitration" : REC_KEY[page.slug];
    var rec = key && REC[key];
    return rec && rec.quotes && rec.quotes.length ? quoteBand(rec.quotes) : null;
  }
  function addHero(root, page, isDisputes) { var h = heroFor(page, isDisputes); if (h) root.appendChild(h); }
  // the write-up's sub-headings with their bullet points, as the site's expandable rows
  /* "Our Work" on a sector page: an editorial list (no numbers). A plain list gives one
     row per piece of work; a titled group gives a row headed by its title with its
     work underneath; a group with a title but no work is an umbrella label. */
  function sectorWork(groups) {
    var sec = el("section", "sw reveal");
    var side = el("div", "sw-side");
    side.appendChild(el("h2", "pa-section-title", "Our Work"));
    // (the "N areas of work" count under the heading was removed after partner feedback)
    sec.appendChild(side);
    var list = el("ol", "sw-list");
    var n = 0;
    groups.forEach(function (g) {
      if (!g.title) {
        g.items.forEach(function (t) { list.appendChild(row(++n, null, [t])); });
      } else if (!g.items.length) {
        list.appendChild(el("li", "sw-label", g.title));
      } else {
        list.appendChild(row(++n, g.title, g.items));
      }
    });
    sec.appendChild(list);
    function row(i, title, items) {
      var li = el("li", "sw-row");
      li.style.setProperty("--i", i);
      var mk = el("span", "sw-mark");
      mk.setAttribute("aria-hidden", "true");
      li.appendChild(mk);
      var body = el("div", "sw-body");
      if (title) {
        body.appendChild(el("h3", "sw-title", title));
        var ul = el("ul", "sw-points");
        items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        body.appendChild(ul);
      } else {
        body.appendChild(el("p", "sw-text", items[0]));
      }
      li.appendChild(body);
      return li;
    }
    return show(sec);
  }

  function groupsSection(groups, title) {
    var sec = el("section", "pa-related");
    var head = el("div", "pa-related-head");
    head.appendChild(el("h2", "pa-section-title", title));
    var all = el("button", "pa-expand-all", "Expand all");
    all.type = "button";
    head.appendChild(all);
    sec.appendChild(head);
    var list = el("div", "pa-related-list");
    var loose = [];
    groups.forEach(function (g) {
      if (!g.title) { loose = loose.concat(g.items); return; }
      var item = el("details", "pa-rel reveal");
      item.id = "rel-" + slugify(g.title);
      if (location.hash === "#" + item.id) {
        item.open = true;
        setTimeout(function () { item.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
      }
      var sum = el("summary", "pa-rel-summary");
      sum.appendChild(el("span", "pa-rel-name", g.title));
      sum.appendChild(icon("fa-solid fa-plus pa-rel-icon"));
      item.appendChild(sum);
      if (g.items.length) {
        var body = el("div", "pa-rel-body");
        var ul = el("ul", "pa-rel-points");
        g.items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
        body.appendChild(ul);
        item.appendChild(body);
      }
      list.appendChild(show(item));
    });
    if (loose.length) {
      var lu = el("ul", "pa-rel-points cv2-points");
      loose.forEach(function (t) { lu.appendChild(el("li", null, t)); });
      sec.insertBefore(lu, null);
    }
    if (list.children.length) sec.appendChild(list); else all.remove();
    all.addEventListener("click", function () {
      var items = list.querySelectorAll("details");
      var open = Array.prototype.some.call(items, function (x) { return !x.open; });
      items.forEach(function (x) { x.open = open; });
      all.textContent = open ? "Collapse all" : "Expand all";
    });
    return sec;
  }
  // "Banking and Finance Disputes →": the way from a practice area / sector to its disputes page
  function disputesLink(x) {
    var a = el("a", "cv2-dlink");
    a.href = disputesUrl(x.slug);
    a.appendChild(el("span", "cv2-dlink-label", "Disputes"));
    var t = el("span", "cv2-dlink-title", x.title + " ");
    t.appendChild(icon("fa-solid fa-arrow-right"));
    a.appendChild(t);
    // the disputes partners' own faces on the card: different people from the Key Contacts,
    // so it reads as another team without saying so
    var team = el("span", "cv2-dlink-team");
    var faces = el("span", "cv2-dlink-faces");
    var people = (x.contacts || []).map(person);
    people.slice(0, 4).forEach(function (p) {
      var f = el("span", "cv2-dlink-face");
      var img = el("img");
      img.src = /^(https?:)?\/\//.test(p.photo) ? p.photo : PHOTO_DIR + encodeURIComponent(p.photo);
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.replaceWith(el("span", "cv2-dlink-initials", initials(p.name))); });
      f.appendChild(img);
      faces.appendChild(f);
    });
    if (people.length > 4) faces.appendChild(el("span", "cv2-dlink-face cv2-dlink-more", "+" + (people.length - 4)));
    if (people.length) team.appendChild(faces);
    var names = people.slice(0, 2).map(function (p) { return p.name; }).join(", ");
    team.appendChild(el("span", "cv2-dlink-names", people.length > 2 ? names + " and " + (people.length - 2) + " more" : people.length ? names : "Our disputes practice"));
    a.appendChild(team);
    a.setAttribute("aria-label", x.title + (people.length ? ", with " + people.map(function (p) { return p.name; }).join(", ") : ""));
    return a;
  }
  function others(root, label, items, current, url) {
    var nav = el("nav", "pa-others reveal");
    nav.setAttribute("aria-label", label);
    nav.appendChild(el("h2", "pa-section-title", label));
    var chips = el("div", "pa-other-chips");
    items.forEach(function (x) {
      if (x.slug === current) return;
      var c = el("a", "pa-other-chip", x.title);
      c.href = url(x.slug);
      chips.appendChild(c);
    });
    nav.appendChild(chips);
    root.appendChild(show(nav));
  }
  // overview text + side column (disputes link, contacts)
  function body(root, page, side, overviewTitle) {
    var cols = el("div", "pa-detail-cols");
    var ov = el("section", "pa-overview reveal");
    if (page.intro.length) {
      ov.appendChild(el("h2", "pa-section-title", overviewTitle || "Overview"));
      page.intro.forEach(function (p) { ov.appendChild(el("p", "pa-overview-text", p)); });
    }
    // the Disputes link sits under the overview, away from the Key Contacts, so it reads as
    // a separate team (its own partners are on its own page)
    side.forEach(function (n) { if (n) { n.classList.add("cv2-dlink--card"); ov.appendChild(n); } });
    cols.appendChild(show(ov));
    // the side column: this page's own Key Contacts, named after the page
    var aside = el("aside", "cv2-side reveal");
    if (page.contacts.length) {
      var box = el("div", "pa-team-box");
      box.appendChild(el("p", "cv2-team-for", page.title));
      box.appendChild(el("h2", "pa-section-title", "Key Contacts"));
      box.appendChild(teamList(page.contacts));
      aside.appendChild(box);
    }
    if (aside.children.length) cols.appendChild(show(aside));
    else cols.classList.add("cv2-cols--single");
    root.appendChild(cols);
  }

  /* ---------- Layout 5: the Dispute Resolution container (css/capabilities-v2.css .cv2-drf)
     a light panel: the practice on the left, its areas of dispute as small tiles on the right ---------- */
  function drFeature(H) {
    var SHOW = 9;
    var box = el("section", "cv2-drf reveal");
    box.setAttribute("aria-labelledby", "drfTitle");
    var art = el("div", "cv2-drf-art");
    art.setAttribute("aria-hidden", "true");
    art.innerHTML = '<svg viewBox="0 0 240 240" fill="none"><circle cx="120" cy="120" r="112" stroke="currentColor"/><circle cx="120" cy="120" r="86" stroke="currentColor"/><circle cx="120" cy="120" r="60" stroke="currentColor"/><circle cx="120" cy="120" r="34" stroke="currentColor"/><circle cx="120" cy="8" r="5" class="cv2-pv-dot"/><circle cx="206" cy="120" r="3.5" class="cv2-pv-dot cv2-pv-dot--soft"/></svg>';
    box.appendChild(art);

    var lead = el("div", "cv2-drf-lead");
    lead.appendChild(el("p", "cv2-drf-eyebrow", D.drList.length + " areas of dispute"));
    var h = el("h2", "cv2-drf-title", H.title);
    h.id = "drfTitle";
    lead.appendChild(h);
    var first = String((H.intro || [])[0] || "").match(/^.+?[.!?](?=\s|$)/);
    if (first) lead.appendChild(el("p", "cv2-drf-text", first[0]));
    var go = el("a", "cv2-drf-go", "Explore Dispute Resolution");
    go.href = areaUrl(H.slug);
    go.appendChild(icon("fa-solid fa-arrow-right"));
    lead.appendChild(go);
    box.appendChild(lead);

    var side = el("div", "cv2-drf-side");
    var ul = el("ul", "cv2-drf-list");
    D.drList.forEach(function (r, i) {
      var li = el("li");
      if (i >= SHOW) li.className = "is-extra";
      var t;
      if (r.pending) {
        t = el("span", "cv2-drf-tile is-pending");
        t.appendChild(el("span", "cv2-drf-name", r.label));
        t.appendChild(el("span", "cv2-drf-soon", "Coming soon"));
      } else {
        t = el("a", "cv2-drf-tile");
        t.href = r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area);
        t.appendChild(el("span", "cv2-drf-name", r.label));
        t.appendChild(icon("fa-solid fa-arrow-right cv2-drf-arrow"));
      }
      li.appendChild(t);
      ul.appendChild(li);
    });
    side.appendChild(ul);
    if (D.drList.length > SHOW) {
      var more = el("button", "cv2-drf-more");
      more.type = "button";
      more.setAttribute("aria-expanded", "false");
      var label = function (open) { more.textContent = open ? "Show fewer" : "Show all " + D.drList.length + " areas "; if (!open) more.appendChild(icon("fa-solid fa-chevron-down")); };
      label(false);
      more.addEventListener("click", function () {
        var open = !box.classList.contains("is-open");
        box.classList.toggle("is-open", open);
        more.setAttribute("aria-expanded", String(open));
        label(open);
      });
      side.appendChild(more);
    }
    box.appendChild(side);
    return box;
  }

  /* ---------- Practice areas index: tiles that open a preview panel in place
     (as Layout 1, capabilities.html); the panel links on to the full page ---------- */
  var PREVIEW_ROWS = 6, PREVIEW_TEAM = 6;
  var paGrid = document.getElementById("paGridV2");
  if (paGrid) {
    var pTiles = [], openAt = -1;
    var panel = el("section", "pa-panel");
    panel.id = "paPanel";
    panel.setAttribute("role", "region");
    panel.hidden = true;

    // Layout 5 (capabilities-tiles.html, data-dr-split): Dispute Resolution gets its own container above the tiles
    var drSplit = paGrid.hasAttribute("data-dr-split");
    var TILES = drSplit ? PRACTICES.filter(function (p) { return p.kind !== "hub"; }) : PRACTICES;
    if (drSplit) {
      var HUB = PRACTICES.filter(function (p) { return p.kind === "hub"; })[0];
      if (HUB) paGrid.before(show(drFeature(HUB)));
    }

    // Layout 3 (capabilities-v2.html): no preview panel, a tile opens its page straight away
    var direct = !drSplit;

    TILES.forEach(function (x, i) {
      var wrap = el("div", "pa-tile-wrap reveal");
      wrap.setAttribute("role", "listitem");
      wrap.style.setProperty("--delay", (i % 4) * 0.06 + "s");
      if (direct) {
        var link = el("a", "pa-tile cv2-tile cv2-tile--link");
        link.href = areaUrl(x.slug);
        link.appendChild(el("span", "cv2-tile-name", x.title));
        if (x.kind === "hub") link.appendChild(el("span", "cv2-tile-tag", D.drList.length + " areas of dispute"));
        link.appendChild(icon("fa-solid fa-arrow-right pa-tile-chev"));
        wrap.appendChild(link);
        paGrid.appendChild(show(wrap));
        return;
      }
      var btn = el("button", "pa-tile cv2-tile");
      btn.type = "button";
      btn.id = "tile-" + x.slug;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "paPanel");
      btn.appendChild(el("span", "cv2-tile-name", x.title));
      var tag = x.kind === "hub" ? D.drList.length + " areas of dispute" : x.disputes ? "Advisory & disputes" : "";
      if (tag) btn.appendChild(el("span", "cv2-tile-tag", tag));
      btn.appendChild(icon("fa-solid fa-chevron-down pa-tile-chev"));
      btn.addEventListener("click", function () { toggleP(i, true); });
      wrap.appendChild(btn);
      paGrid.appendChild(show(wrap));
      pTiles.push({ wrap: wrap, btn: btn, x: x });
    });

    if (direct) {
      // old links like capabilities-v2.html#banking-and-finance now go to the page itself
      var hashed = AREA[location.hash.slice(1)];
      if (hashed) location.replace(areaUrl(hashed.slug));
    }
    var colsOf = function () { return getComputedStyle(paGrid).gridTemplateColumns.split(" ").filter(Boolean).length || 1; };
    // the panel sits after the last tile of the clicked tile's row
    var placeP = function (i) {
      var c = colsOf();
      pTiles[Math.min(Math.ceil((i + 1) / c) * c, pTiles.length) - 1].wrap.after(panel);
    };
    var linkRow = function (text, href) {
      var li = el("li");
      var a = el("a", null, text + " ");
      a.href = href;
      a.appendChild(icon("fa-solid fa-chevron-right"));
      li.appendChild(a);
      return li;
    };

    var fillP = function (x) {
      panel.textContent = "";
      panel.setAttribute("aria-labelledby", "panelTitle");
      var card = el("div", "pa-panel-card");
      var ban = el("div", "pa-banner");
      var im = el("img", "pa-banner-img");
      im.src = x.img ? "images/" + x.img + ".jpg" : "images/hero-palette.jpg";
      im.alt = "";
      im.setAttribute("aria-hidden", "true");
      ban.appendChild(im);
      card.appendChild(ban);
      var close = el("button", "pa-panel-close");
      close.type = "button";
      close.setAttribute("aria-label", "Close " + x.title);
      close.appendChild(icon("fa-solid fa-xmark"));
      close.addEventListener("click", function () { toggleP(openAt, true); });
      card.appendChild(close);

      var body = el("div", "pa-panel-body");
      var left = el("div", "pa-panel-overview");
      var h = el("h2", "pa-panel-title", x.title);
      h.id = "panelTitle";
      left.appendChild(h);
      x.intro.slice(0, 2).forEach(function (t) { left.appendChild(el("p", "pa-panel-text", t)); });
      var go = el("a", "btn btn--solid pa-panel-cta", "Explore " + x.title + " ");
      go.href = areaUrl(x.slug);
      go.appendChild(icon("fa-solid fa-arrow-right"));
      left.appendChild(go);
      if (x.disputes && D.disputes[x.disputes]) {
        var dl = disputesLink(D.disputes[x.disputes]);
        dl.classList.add("cv2-dlink--panel");
        left.appendChild(dl);
      }
      body.appendChild(left);

      var right = el("div", "pa-panel-side");
      var ul = el("ul", "pa-related-preview");
      var all = el("a", "pa-view-all");
      if (x.kind === "hub") {
        right.appendChild(el("h3", "pa-side-title", "Areas of Dispute"));
        D.drList.filter(function (r) { return !r.pending; }).slice(0, PREVIEW_ROWS).forEach(function (r) {
          ul.appendChild(linkRow(r.label, r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area)));
        });
        all.textContent = "View all " + D.drList.length + " areas of dispute ";
        all.href = areaUrl(x.slug);
      } else {
        var named = x.groups.filter(function (g) { return g.title; });
        if (named.length) {
          right.appendChild(el("h3", "pa-side-title", "What We Do"));
          named.slice(0, PREVIEW_ROWS).forEach(function (g) {
            ul.appendChild(linkRow(g.title, areaUrl(x.slug) + "#rel-" + slugify(g.title)));
          });
          all.textContent = (named.length > PREVIEW_ROWS ? "View all " + named.length + " areas" : "View the full practice") + " ";
          all.href = areaUrl(x.slug);
        }
      }
      if (ul.children.length) {
        right.appendChild(ul);
        all.appendChild(icon("fa-solid fa-arrow-right"));
        right.appendChild(all);
      }
      if (x.contacts.length) {
        right.appendChild(el("h3", "pa-side-title", "Key Contacts"));
        right.appendChild(teamList(x.contacts.slice(0, PREVIEW_TEAM)));
      }
      body.appendChild(right);
      card.appendChild(body);
      panel.appendChild(card);
    };

    var toggleP = function (i, fromUser) {
      var closing = i === openAt;
      if (openAt > -1) {
        pTiles[openAt].btn.setAttribute("aria-expanded", "false");
        pTiles[openAt].btn.classList.remove("is-active");
      }
      if (closing) {
        panel.classList.remove("is-open");
        panel.hidden = true;
        openAt = -1;
        history.replaceState(null, "", location.pathname + location.search);
        if (fromUser) pTiles[i].btn.focus();
        return;
      }
      openAt = i;
      var t = pTiles[i];
      t.btn.setAttribute("aria-expanded", "true");
      t.btn.classList.add("is-active");
      fillP(t.x);
      placeP(i);
      panel.hidden = false;
      panel.classList.remove("is-open");
      void panel.offsetWidth; // restart the open animation
      panel.classList.add("is-open");
      history.replaceState(null, "", "#" + t.x.slug);
      if (fromUser) {
        var top = t.btn.getBoundingClientRect().top + window.scrollY - 110;
        var bottom = panel.getBoundingClientRect().bottom + window.scrollY;
        if (bottom > window.scrollY + window.innerHeight || top < window.scrollY) window.scrollTo({ top: top, behavior: "smooth" });
      }
    };
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openAt > -1 && !document.querySelector(".nav-item.is-open")) toggleP(openAt, true);
    });
    var lastC = colsOf();
    window.addEventListener("resize", function () {
      var c = colsOf();
      if (c !== lastC && openAt > -1) placeP(openAt);
      lastC = c;
    });
    // open from a link like capabilities-v2.html#banking-and-finance
    var hashAt = pTiles.findIndex(function (t) { return t.x.slug === location.hash.slice(1); });
    if (hashAt > -1) toggleP(hashAt, false);
  }

  /* ---------- Sectors index: same list + live preview as Layout 1 (sectors.html) ---------- */
  var sectorList = document.getElementById("sectorListV2");
  if (sectorList) {
    var preview = document.getElementById("sectorPreviewV2");
    var imgs = preview.querySelectorAll(".sp-img");
    var pIndex = preview.querySelector(".sp-index"), pTitle = preview.querySelector(".sp-title");
    var pSummary = preview.querySelector(".sp-summary"), pCta = preview.querySelector(".sp-cta");
    var rows = [], shown = -1;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var imgOf = function (x) { return x.img ? "images/" + x.img + ".jpg" : "images/hero-palette.jpg"; };
    // first one or two sentences of the write-up
    var summary = function (x) {
      var text = x.intro[0] || "";
      var sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
      var out = sentences[0];
      if (out.length < 140 && sentences[1]) out += sentences[1];
      return out.trim();
    };
    var showSector = function (i) {
      if (i === shown) return;
      shown = i;
      var x = SECTORS[i];
      var cur = preview.querySelector(".sp-img.is-current");
      var nxt = cur === imgs[0] ? imgs[1] : imgs[0];
      nxt.src = imgOf(x);
      nxt.classList.add("is-current");
      cur.classList.remove("is-current");
      preview.classList.remove("is-swapping");
      void preview.offsetWidth;
      preview.classList.add("is-swapping");
      pIndex.textContent = pad(i + 1) + " / " + pad(SECTORS.length);
      pTitle.textContent = x.title;
      pSummary.textContent = summary(x);
      pCta.href = sectorUrl(x.slug);
      pCta.setAttribute("aria-label", "Explore " + x.title);
      rows.forEach(function (r, k) { r.classList.toggle("is-active", k === i); });
    };
    SECTORS.forEach(function (x, i) {
      var li = el("li", "reveal");
      li.style.setProperty("--delay", (i * 0.04) + "s");
      var a = el("a", "sector-row");
      a.href = sectorUrl(x.slug);
      var thumb = el("img", "sr-thumb");
      thumb.src = imgOf(x);
      thumb.alt = "";
      thumb.loading = "lazy";
      a.appendChild(thumb);
      a.appendChild(el("span", "sr-num", pad(i + 1)));
      var txt = el("span", "sr-text");
      txt.appendChild(el("span", "sr-name", x.title));
      txt.appendChild(el("span", "sr-meta", x.disputes ? "Advisory & disputes" : (x.contacts.length ? x.contacts.length + (x.contacts.length === 1 ? " key contact" : " key contacts") : "")));
      a.appendChild(txt);
      a.appendChild(icon("fa-solid fa-arrow-right sr-arrow"));
      a.addEventListener("mouseenter", function () { showSector(i); });
      a.addEventListener("focus", function () { showSector(i); });
      li.appendChild(a);
      sectorList.appendChild(show(li));
      rows.push(a);
    });
    showSector(0);
  }

  /* ---------- practice area / disputes page ---------- */
  /* ---------- Selected Matters + Insights (practice area / disputes pages, after "Our Work")
     Both are carousels (carousel() below), each with a small note saying where the content is from.
     Matters:  the "Selected matters" on the page's Key Contacts' profiles (js/profiles-data.js,
               from skrine.com), kept to the profile headings that fit this page (MATTER_AREAS);
               no deal values. Falls back to Transaction News titles, then to example text.
     Insights: js/alerts-data.js + js/publications-data.js, by practice / topic names (INSIGHT_KEYS).
     Styles:   css/capabilities-v2.css (.cv2-car, .cv2-mt, .cv2-ins). ---------- */
  var PROFILES = window.SKRINE_PROFILES || {};
  var DEALS = window.SKRINE_PRACTICE_DEALS || [];
  var ALERTS = window.SKRINE_ALERTS || [];
  var PUBS = window.SKRINE_PUBLICATIONS || [];
  var FULL = window.SKRINE_ALERTS_FULL || {};
  var MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function shortDate(iso) { var p = String(iso).split("-"); return Number(p[2]) + " " + MONTHS_S[Number(p[1]) - 1] + " " + p[0]; }
  // same rule as js/alerts.js, for the alert.html?a= links
  function alertSlug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }

  /* a carousel section: heading + arrows, a scroll-snapped track, page dots, a source note */
  function carousel(cls, title, cards, note, opts) {
    var sec = el("section", "cv2-car " + cls + " reveal");
    sec.setAttribute("aria-roledescription", "carousel");
    sec.setAttribute("aria-label", title);
    var head = el("div", "pa-related-head cv2-car-head");
    head.appendChild(el("h2", "pa-section-title", title));
    var ctr = el("div", "cv2-car-controls");
    var prev = el("button", "cv2-car-btn"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.appendChild(icon("fa-solid fa-arrow-left"));
    var next = el("button", "cv2-car-btn"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.appendChild(icon("fa-solid fa-arrow-right"));
    ctr.appendChild(prev);
    ctr.appendChild(next);
    head.appendChild(ctr);
    sec.appendChild(head);
    var track = el("div", "cv2-car-track");
    cards.forEach(function (c) { track.appendChild(c); });
    sec.appendChild(track);
    var foot = el("div", "cv2-car-foot");
    var dots = el("div", "cv2-car-dots");
    foot.appendChild(dots);
    if (note) foot.appendChild(el("p", "cv2-src-note", note));
    sec.appendChild(foot);

    /* one "page" = as many cards as fit; the arrows and dots move a page at a time.
       It never ends: the cards are copied twice after the real ones, so after the last
       card the first comes round again, and once the strip is into the copies it hops
       back by one set (no visible jump) instead of running back to the start. */
    var n = cards.length, looping = false;
    function step() {
      var c = track.firstElementChild;
      return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth;
    }
    function perPage() { return Math.max(1, Math.floor((track.clientWidth + 2) / step())); }
    function dropClones() {
      Array.prototype.slice.call(track.querySelectorAll(".is-clone")).forEach(function (c) { c.remove(); });
      looping = false;
    }
    function buildClones() {
      dropClones();
      if (n * step() <= track.clientWidth + 4) return;   // everything fits: nothing to loop
      for (var r = 0; r < 2; r++) cards.forEach(function (c) {
        var k = c.cloneNode(true);
        k.classList.add("is-clone");
        k.setAttribute("aria-hidden", "true");
        k.tabIndex = -1;
        Array.prototype.forEach.call(k.querySelectorAll("a, button"), function (x) { x.tabIndex = -1; });
        track.appendChild(k);
      });
      looping = true;
    }
    function loopW() { return n * step(); }
    function wrap() {
      if (!looping) return;
      if (track.scrollLeft >= loopW() - 2) {
        track.style.scrollSnapType = "none";
        track.scrollLeft -= loopW();
        requestAnimationFrame(function () { track.style.scrollSnapType = ""; });
      }
    }
    function cardAt() { return ((Math.round(track.scrollLeft / step()) % n) + n) % n; }
    function pages() {
      if (looping) return Math.ceil(n / perPage());
      return Math.max(1, Math.ceil((n - perPage()) / perPage()) + 1);
    }
    function current() {
      if (looping) return Math.min(pages() - 1, Math.floor(cardAt() / perPage()));
      if (track.scrollLeft + track.clientWidth > track.scrollWidth - 4) return pages() - 1;
      return Math.min(pages() - 1, Math.round(track.scrollLeft / (step() * perPage())));
    }
    // an eased glide (smoother than the browser's own smooth scroll); snapping is off while it runs
    var anim = 0;
    function glide(left, dur) {
      cancelAnimationFrame(anim);
      var from = track.scrollLeft, to = Math.max(0, Math.min(left, track.scrollWidth - track.clientWidth));
      if (Math.abs(to - from) < 2) { anim = 0; return; }
      var t0 = performance.now(), d = dur || 900;
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      track.style.scrollSnapType = "none";
      (function frame(now) {
        var t = Math.min(1, (now - t0) / d);
        track.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) anim = requestAnimationFrame(frame);
        else { anim = 0; track.style.scrollSnapType = ""; wrap(); }
      })(t0);
    }
    function stopGlide() { cancelAnimationFrame(anim); anim = 0; track.style.scrollSnapType = ""; }
    function by(cardsToMove, dur) {
      wrap();
      // going back from the very start: hop onto the copy first
      if (looping && cardsToMove < 0 && track.scrollLeft < step() * -cardsToMove - 2) {
        track.style.scrollSnapType = "none";
        track.scrollLeft += loopW();
      }
      var base = Math.round(track.scrollLeft / step());
      if (!looping) base = Math.max(0, Math.min(base, n - 1));
      glide((base + cardsToMove) * step(), dur);
    }
    function goTo(p) { wrap(); glide(p * perPage() * step()); }
    function sync() {
      var np = pages(), c = current();
      if (dots.children.length !== np) {
        dots.textContent = "";
        for (var i = 0; i < np; i++) (function (i) {
          var b = el("button", "cv2-car-dot");
          b.type = "button";
          b.setAttribute("aria-label", "Go to page " + (i + 1));
          b.addEventListener("click", function () { goTo(i); });
          dots.appendChild(b);
        })(i);
      }
      Array.prototype.forEach.call(dots.children, function (b, i) { b.classList.toggle("is-current", i === c); });
      var atStart = track.scrollLeft < 4, atEnd = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
      prev.disabled = !looping && atStart;
      next.disabled = !looping && atEnd;
      sec.classList.toggle("is-static", !looping && atStart && atEnd);
    }
    prev.addEventListener("click", function () { by(-perPage()); });
    next.addEventListener("click", function () { by(perPage()); });
    var raf = 0;
    track.addEventListener("scroll", function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () { if (!anim) wrap(); sync(); });
    }, { passive: true });
    var lastW = 0;
    window.addEventListener("resize", function () {
      if (track.clientWidth === lastW) return;
      lastW = track.clientWidth;
      buildClones();
      sync();
    });
    requestAnimationFrame(function () { lastW = track.clientWidth; buildClones(); sync(); });

    /* autoplay (opts.autoplay = ms between moves): one card at a time, round and round;
       pauses on hover, keyboard focus, touch, while off screen or the tab is hidden,
       and never runs for people who ask for reduced motion */
    var every = opts && opts.autoplay;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (every && !reduce) {
      var hold = { hover: false, focus: false, touch: false, away: true }, timer = 0, touchTimer = 0;
      var held = function () { return hold.hover || hold.focus || hold.touch || hold.away || document.hidden; };
      var tick = function () {
        if (held() || !looping) return;
        by(1, 800);
      };
      var restart = function () { clearInterval(timer); timer = setInterval(tick, every); };
      sec.addEventListener("mouseenter", function () { hold.hover = true; sec.classList.add("is-paused"); });
      sec.addEventListener("mouseleave", function () { hold.hover = false; sec.classList.remove("is-paused"); restart(); });
      sec.addEventListener("focusin", function () { hold.focus = true; });
      sec.addEventListener("focusout", function () { hold.focus = false; restart(); });
      // a swipe or wheel takes over; autoplay comes back a few seconds later
      ["touchstart", "wheel", "pointerdown"].forEach(function (ev) {
        track.addEventListener(ev, function () {
          stopGlide();
          hold.touch = true;
          clearTimeout(touchTimer);
          touchTimer = setTimeout(function () { hold.touch = false; restart(); }, 6000);
        }, { passive: true });
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { hold.away = !en[0].isIntersecting; if (!hold.away) restart(); }, { threshold: 0.4 }).observe(track);
      } else hold.away = false;
      prev.addEventListener("click", restart);
      next.addEventListener("click", restart);
      restart();
    }
    return show(sec);
  }

  /* ---------- Selected Matters ---------- */
  // which profile "Selected matters" headings belong on each page (matched against the heading)
  var MATTER_AREAS = {
    "arbitration-and-alternative-dispute-resolution": /arbitrat|adjudicat|mediat/i,
    "banking-and-finance": /banking|finance/i,
    "competition-and-antitrust": /competition/i,
    "constitutional-and-administrative-law": /public law|administrative|constitution/i,
    "construction-engineering-projects-and-infrastructure": /construction|projects|infrastructure|government contracts/i,
    "corporate-and-commercial": /corporate (advisory|and commercial$)|company law|corporate restructuring/i,
    "employment": /employ|workplace|occupational|immigration/i,
    "environmental-social-and-governance-esg": /environment/i,
    "family-law": /family|probate/i,
    "fraud-and-asset-recovery": /fraud|asset recovery/i,
    "insurance-and-reinsurance": /insurance/i,
    "intellectual-property": /\bip\b|intellectual|brand|trade ?mark|patent/i,
    "international-trade": /trade remed|anti-dumping|customs/i,
    "investigations": /investigat|bribery|corruption/i,
    "mergers-and-acquisitions": /merger|acquisitions(?! and disposal)/i,
    "oil-gas-and-energy": /energy|oil/i,
    "privacy-and-data-protection": /privacy|data/i,
    "professional-liability-and-indemnity": /negligence|professional/i,
    "real-estate": /real estate|land|strata|tenancy|rates/i,
    "regulatory-compliance-and-white-collar-defence": /regulat|bribery|corruption|white collar/i,
    "restructuring-and-insolvency": /restructur|insolven/i,
    "tax-and-revenue": /\btax/i,
    "technology-media-and-telecommunications-tmt": /technology|telecom|media|entertainment/i
  };
  var CONTENTIOUS = /litigation|disput|arbitrat|adjudicat|cases|enforcement|defence|negligence/i;
  // some profile text still carries HTML entities (e.g. "&pound;")
  var decoder = document.createElement("textarea");
  function decode(s) { if (String(s).indexOf("&") < 0) return s; decoder.innerHTML = s; return decoder.value; }
  var PROFILE_LIST = Object.keys(PROFILES).map(function (k) { return PROFILES[k]; });
  // the page's matters, from the "Selected matters" headings on lawyer profiles that fit this page
  function mattersFor(page, isDisputes, parentSlug) {
    var re = MATTER_AREAS[page.slug] || MATTER_AREAS[parentSlug];
    var anyKind = page.kind === "disputes-only" || page.slug === "arbitration-and-alternative-dispute-resolution";
    function fits(area) {
      if (!re) return isDisputes && CONTENTIOUS.test(area);
      if (!re.test(area)) return false;
      if (isDisputes) return CONTENTIOUS.test(area);     // a disputes page: the contentious headings
      return anyKind || !CONTENTIOUS.test(area);          // an advisory page: the non-contentious ones
    }
    var out = [], seen = {};
    function take(p) {
      if (!p) return;
      (p.experience || []).forEach(function (e) {
        if (!fits(e.area)) return;
        e.matters.forEach(function (m) {
          var key = m.slice(0, 80);
          if (seen[key]) return;
          seen[key] = 1;
          out.push({ text: decode(m), area: decode(e.area), who: p.name, slug: p.slug });
        });
      });
    }
    // every lawyer's profile, not the page's contacts first
    PROFILE_LIST.forEach(take);
    // mix the sources so one profile's matters do not fill the carousel
    var byWho = {};
    out.forEach(function (m) { (byWho[m.who] = byWho[m.who] || []).push(m); });
    var mixed = [], lists = Object.keys(byWho).map(function (k) { return byWho[k]; });
    for (var i = 0; mixed.length < out.length; i++) lists.forEach(function (l) { if (l[i]) mixed.push(l[i]); });
    return mixed.slice(0, 12);
  }
  var EXAMPLE_MATTERS = [
    "Advised a regional client on a cross-border matter in this practice area, from structuring through to completion.",
    "Acted for a listed company on a significant transaction, including regulatory approvals and documentation.",
    "Represented a multinational group in proceedings arising from this practice area, at first instance and on appeal.",
    "Advised a financial institution on its obligations and risk under new legislation affecting this practice area."
  ];

  // a short title for a matter, from what it is about (first rule that matches)
  var MATTER_TITLES = [
    [/syndicated/i, "Syndicated Loan Facility"],
    [/sukuk/i, "Sukuk Issuance"],
    [/\bbonds?\b|medium term notes|notes programme/i, "Bond Issuance"],
    [/initial public offering|\bIPO\b|listing on the main market/i, "IPO and Listing"],
    [/refinanc/i, "Refinancing"],
    [/islamic (bank|financ)|shariah|syariah|murabahah|ijarah|tawarruq|musharakah/i, "Islamic Financing"],
    [/revolving credit|borrowing base/i, "Revolving Credit Facility"],
    [/term loan/i, "Term Loan Facility"],
    [/rights issue|placement of|new ordinary shares/i, "Equity Fundraising"],
    [/private equity/i, "Private Equity Investment"],
    [/joint venture/i, "Joint Venture"],
    [/share subscription|subscription (of|for) (new )?shares/i, "Share Subscription"],
    [/take-?over|general offer/i, "Takeover Offer"],
    [/merger/i, "Merger"],
    [/land acquisition|acquisitions? of (approximately )?[\d,]+ acres|compulsory acquisition/i, "Land Acquisition"],
    [/acquisition of (a |an )?[\d.]+\s?(%|percent|per cent)|stake in/i, "Stake Acquisition"],
    [/acquisition|acquire/i, "Acquisition"],
    [/disposal|divest/i, "Disposal"],
    [/anti-dumping|countervailing|safeguard/i, "Trade Remedies Investigation"],
    [/judicial review/i, "Judicial Review"],
    [/adjudicat|cipaa/i, "Construction Adjudication"],
    [/uncitral|\bicc\b|\bsiac\b|\baiac\b|international arbitration/i, "International Arbitration"],
    [/arbitrat/i, "Arbitration"],
    [/restraining order|scheme of arrangement|debt restructur/i, "Debt Restructuring"],
    [/restructur/i, "Restructuring"],
    [/winding[- ]up|liquidat|insolven|receiver/i, "Insolvency Proceedings"],
    [/trade ?mark|passing off/i, "Trademark Dispute"],
    [/copyright/i, "Copyright Infringement"],
    [/industrial design/i, "Industrial Design"],
    [/patent/i, "Patent Matter"],
    [/franchis/i, "Franchising"],
    [/licen[cs]e agreement|licensing/i, "Licensing Arrangement"],
    [/personal data|data protection|privacy/i, "Data Protection"],
    [/telecommunication|spectrum|communications and multimedia/i, "Telecoms Regulation"],
    [/competition|cartel|mycc/i, "Competition Law"],
    [/trade union|collective agreement/i, "Industrial Relations"],
    [/dismiss|employ|industrial court/i, "Employment Matter"],
    [/negligen/i, "Negligence Claim"],
    [/defamat|libel/i, "Defamation"],
    [/fraud|misappropriat|asset recovery|tracing/i, "Fraud and Asset Recovery"],
    [/corrupt|bribe|macc/i, "Anti-Corruption"],
    [/insur|takaful/i, "Insurance and Takaful"],
    [/\btax|stamp duty/i, "Tax Matter"],
    [/tenan|lease/i, "Lease and Tenancy"],
    [/strata|management corporation/i, "Strata Management"],
    [/solar|renewable|power plant|hydro/i, "Renewable Energy Project"],
    [/\boil\b|\bgas\b|petroleum|energy/i, "Oil, Gas and Energy"],
    [/construction|contractor|infrastructure|highway|railway/i, "Construction Project"],
    [/financ|loan|facilit(y|ies)|lender/i, "Financing"],
    [/development of|developer/i, "Property Development"],
    [/environment/i, "Environmental Matter"],
    [/aircraft|aviation|air carrier|airline/i, "Aviation"],
    [/\bipp\b|\d\s?mw\b|power station/i, "Power Project"],
    [/concession/i, "Concession"],
    [/due diligence/i, "Due Diligence"],
    [/hotel|hospitality|resort/i, "Hospitality"],
    [/shareholder/i, "Shareholder Dispute"],
    [/acquitt|charge[ds]? (under|on|for)|prosecut/i, "Regulatory Defence"],
    [/investigat|inquiry/i, "Investigation"],
    [/sale of|purchase price/i, "Sale and Purchase"],
    [/investment/i, "Investment"],
    [/breach of contract/i, "Contract Dispute"],
    [/agreement/i, "Commercial Agreements"],
    [/setting aside|enforcement proceedings|enforce/i, "Enforcement Proceedings"],
    [/debt recovery|recover/i, "Debt Recovery"],
    [/regulat|licen[cs]/i, "Regulatory Advice"],
    [/court|appeal|suit|proceedings|dispute|claim/i, "Litigation"]
  ];
  // rules for matters under a given profile heading, tried before the general ones,
  // so (say) an employment matter on a takeover reads as employment work
  var AREA_TITLES = [
    [/(banking|finance).*(litigation|disput)/i, [
      [/guarant/i, "Guarantee Claim"],
      [/winding[- ]up|insolven|liquidat|receiver|restraining order/i, "Insolvency Proceedings"],
      [/islamic|syariah|shariah|\bbba\b|bai bithaman/i, "Islamic Finance Dispute"],
      [/foreclos|auction|charge|security|debenture/i, "Enforcement of Security"],
      [/fraud|forg|misappropriat/i, "Banking Fraud Claim"],
      [/recover|default|repay|outstanding/i, "Debt Recovery Action"],
      [/./, "Banking Litigation"]
    ]],
    [/employ|workplace|industrial relations|occupational|immigration/i, [
      [/retrench|redundan|voluntary separation|\bvss\b|mutual separation/i, "Retrenchment Exercise"],
      [/trade union|collective agreement|union/i, "Industrial Relations"],
      [/harass/i, "Workplace Harassment"],
      [/misconduct|domestic inquiry|investigat/i, "Workplace Investigation"],
      [/dismiss|termination|industrial court/i, "Dismissal Claim"],
      [/work pass|work permit|expatriate|immigration|foreign worker/i, "Work Passes"],
      [/bonus|remuneration|salary|wage|benefit|pension|retirement/i, "Pay and Benefits"],
      [/non-?compet|restraint|restrictive covenant|confidential/i, "Restrictive Covenants"],
      [/handbook|polic(y|ies)|contracts? of employment|employment contract/i, "Employment Policies"],
      [/acquisition|merger|takeover|transfer of (business|employees)|due diligence|listing|bond/i, "Employment Aspects of a Transaction"],
      [/./, "Employment Advisory"]
    ]],
    [/\bip\b|intellectual|trade ?mark|patent|brand|copyright|franchis/i, [
      [/trade ?mark|passing off/i, "Trademark Protection"],
      [/patent/i, "Patent Matter"],
      [/copyright/i, "Copyright"],
      [/franchis/i, "Franchising"],
      [/licen[cs]/i, "IP Licensing"],
      [/counterfeit|raid|trade description/i, "Anti-Counterfeiting"],
      [/./, "Intellectual Property"]
    ]],
    [/real estate|land|strata|tenan|rates|valuation/i, [
      [/rates|assessment|valuation/i, "Rates and Valuation"],
      [/strata|management corporation/i, "Strata Management"],
      [/tenan|lease/i, "Lease and Tenancy"],
      [/acquisition of .*land|land acquisition|acres/i, "Land Acquisition"],
      [/joint venture|development/i, "Property Development"],
      [/sale|purchase|dispos|acquisition/i, "Property Transaction"],
      [/./, "Real Estate Advisory"]
    ]]
  ];
  function matterTitle(text, area, fallback) {
    // a reported case ("A v B [2015] 1 LNS 1140"): "Reported Case, 2015"
    var c = String(text).match(/\s(?:v|lwn)\.?\s.+?\[(\d{4})\]/i);
    if (c) return "Reported Case, " + c[1];
    var i, set = AREA_TITLES.filter(function (a) { return a[0].test(area || ""); })[0];
    if (set) for (i = 0; i < set[1].length; i++) if (set[1][i][0].test(text)) return set[1][i][1];
    for (i = 0; i < MATTER_TITLES.length; i++) if (MATTER_TITLES[i][0].test(text)) return MATTER_TITLES[i][1];
    return fallback || "Advisory Mandate";
  }
  // order the cards so the same title does not show twice in a row where it can be avoided
  function spreadTitles(list) {
    var groups = {}, order = [];
    list.forEach(function (m) { if (!groups[m.title]) { groups[m.title] = []; order.push(m.title); } groups[m.title].push(m); });
    var out = [], last = null;
    while (out.length < list.length) {
      // the largest group that is not the last one used
      var pick = order.filter(function (t) { return groups[t].length && t !== last; })
        .sort(function (a, b) { return groups[b].length - groups[a].length; })[0]
        || order.filter(function (t) { return groups[t].length; })[0];
      out.push(groups[pick].shift());
      last = pick;
    }
    return out;
  }

  function addMatters(root, page, isDisputes, parentSlug) {
    var list = mattersFor(page, isDisputes, parentSlug), note = "Matters from lawyer profiles on skrine.com; card titles generated. Shown for design review.";
    if (!list.length) {
      // the Transaction News titles for this area (no values), else example text
      var key = { "corporate-and-commercial": "corporate", "mergers-and-acquisitions": "corporate", "real-estate": "real-estate", "construction-engineering-projects-and-infrastructure": "construction-and-engineering", "employment": "employment", "banking-and-finance": "banking-and-finance" }[page.slug];
      list = key ? DEALS.filter(function (d) { return d.areas.indexOf(key) > -1; }).slice(0, 8).map(function (d) { return { text: d.title, area: "Transaction News", href: d.url }; }) : [];
      note = "Matters from Transaction News on skrine.com; card titles generated. Shown for design review.";
    }
    if (!list.length) {
      list = EXAMPLE_MATTERS.map(function (t) { return { text: t, area: page.title }; });
      note = "Example content for design review only.";
    }
    list.forEach(function (m) { m.title = matterTitle(m.text, m.area); });
    list = spreadTitles(list);
    var cards = list.map(function (m, i) {
      var card = el("article", "cv2-mt");
      var top = el("div", "cv2-mt-top");
      top.appendChild(el("span", "cv2-mt-no", String(i + 1).padStart(2, "0")));
      top.appendChild(el("h3", "cv2-mt-title", m.title));
      card.appendChild(top);
      card.appendChild(el("p", "cv2-mt-text", m.text));
      if (m.href) {
        var src = el("a", "cv2-mt-by cv2-mt-by--plain", "Read on skrine.com ");
        src.href = m.href;
        src.target = "_blank";
        src.rel = "noopener";
        src.appendChild(icon("fa-solid fa-arrow-right"));
        card.appendChild(src);
      }
      return card;
    });
    root.appendChild(carousel("cv2-matters", "Selected Matters", cards, note, { autoplay: 2500 }));
  }

  /* ---------- Insights ---------- */
  // [alert practices, publication topics]
  var INSIGHT_KEYS = {
    "arbitration-and-alternative-dispute-resolution": [["Dispute Resolution", "Construction and Arbitration"], ["Litigation and Arbitration"]],
    "banking-and-finance": [["Banking and Finance", "Fintech"], []],
    "competition-and-antitrust": [["Competition Law"], []],
    "construction-engineering-projects-and-infrastructure": [["Construction and Arbitration"], []],
    "corporate-and-commercial": [["Corporate"], ["Corporate"]],
    "employment": [["Employment Law"], ["Employment"]],
    "family-law": [["Family Law"], []],
    "intellectual-property": [["Intellectual Property"], ["Intellectual Property and TMT"]],
    "international-trade": [["Trade Remedies", "Trade and Customs"], []],
    "investigations": [["Compliance and Investigations", "White Collar Crimes"], []],
    "mergers-and-acquisitions": [["Corporate"], ["Corporate"]],
    "oil-gas-and-energy": [["Energy"], []],
    "real-estate": [["Real Estate"], []],
    "regulatory-compliance-and-white-collar-defence": [["Compliance and Investigations", "White Collar Crimes", "Product Law"], ["Regulatory Compliance"]],
    "restructuring-and-insolvency": [["Restructuring and Insolvency"], []],
    "tax-and-revenue": [["Tax"], []],
    "technology-media-and-telecommunications-tmt": [["Technology, Media and Telecommunications"], ["Intellectual Property and TMT"]],
    // disputes pages
    "banking-and-finance-disputes": [["Banking and Finance Litigation"], ["Litigation and Arbitration"]],
    "construction-engineering-projects-and-infrastructure-disputes": [["Construction and Arbitration"], ["Litigation and Arbitration"]],
    "regulatory-compliance-and-white-collar-defence-disputes": [["White Collar Crimes"], ["Litigation and Arbitration"]],
    "_disputes": [["Dispute Resolution", "Banking and Finance Litigation", "Construction and Arbitration"], ["Litigation and Arbitration"]]
  };
  var INSIGHTS_MAX = 10;

  function addInsights(root, slug, isDisputes) {
    var keys = INSIGHT_KEYS[slug] || (isDisputes ? INSIGHT_KEYS._disputes : null);
    if (!keys) return;
    var items = [];
    ALERTS.forEach(function (a) {
      if (keys[0].indexOf(a.practice) < 0) return;
      var s = alertSlug(a.title);
      items.push({
        type: a.label || "Alert", date: a.date, title: a.title, by: a.authors || "",
        img: window.SkrineTopicImage ? window.SkrineTopicImage(a.topic, a.title, a.practice) : "images/hero-palette.jpg",
        href: FULL[s] ? "alert.html?a=" + encodeURIComponent(s) : "alerts.html?q=" + encodeURIComponent(a.title)
      });
    });
    PUBS.forEach(function (p) {
      if (keys[1].indexOf(p.topic) < 0) return;
      items.push({
        type: "Publication", date: p.date, title: p.title, by: (p.authors || []).join(", "),
        img: p.cover ? "images/publications/" + p.cover : "images/hero-palette.jpg", cover: !!p.cover,
        href: p.pdf || "publications.html?q=" + encodeURIComponent(p.title), ext: !!p.pdf
      });
    });
    if (!items.length) return;
    items.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    items = items.slice(0, INSIGHTS_MAX);
    var cards = items.map(function (it, i) {
      var card = el("a", "cv2-ins-card");
      card.href = it.href;
      if (it.ext) { card.target = "_blank"; card.rel = "noopener"; }
      card.setAttribute("aria-label", it.title + " (" + (i + 1) + " of " + items.length + ")");
      var fig = el("span", "cv2-ins-img" + (it.cover ? " is-cover" : ""));
      var im = el("img");
      im.src = it.img;
      im.alt = "";
      im.loading = "lazy";
      im.addEventListener("error", function () { im.src = "images/hero-palette.jpg"; fig.classList.remove("is-cover"); });
      fig.appendChild(im);
      card.appendChild(fig);
      var bodyEl = el("span", "cv2-ins-body");
      // type pill + date on one line, as on the profile pages' Insights cards
      var meta = el("span", "cv2-ins-meta");
      meta.appendChild(el("span", "cv2-ins-type cv2-ins-type--" + String(it.type).toLowerCase(), it.type));
      meta.appendChild(el("span", "cv2-ins-date", shortDate(it.date)));
      bodyEl.appendChild(meta);
      bodyEl.appendChild(el("span", "cv2-ins-title", it.title));
      if (it.by) bodyEl.appendChild(el("span", "cv2-ins-by", it.by));
      var more = el("span", "cv2-ins-more", "Read more ");
      more.appendChild(icon("fa-solid fa-arrow-right"));
      bodyEl.appendChild(more);
      card.appendChild(bodyEl);
      return card;
    });
    root.appendChild(carousel("cv2-ins", "Insights", cards, "Content from Alerts and Publications on skrine.com, shown for design review."));
  }

  var detail = document.getElementById("paDetailV2");
  if (detail) {
    var q = new URLSearchParams(location.search);
    var dSlug = q.get("disputes"), aSlug = q.get("area");
    var X = dSlug ? D.disputes[dSlug] : null;
    var A = aSlug ? AREA[aSlug] : null;
    var capCrumbs = [["Services", "capabilities-v2.html"], ["Practice Areas", "capabilities-v2.html"]];

    if (X) {
      var parent = parentOf(X);
      document.title = X.title + " | Skrine";
      var isSector = X.parentType === "sector";
      var crumbs = isSector ? [["Services", "capabilities-v2.html"], ["Sectors", "sectors-v2.html"], [parent.title, parentUrl(X)]]
                            : capCrumbs.concat([[parent.title, parentUrl(X)]]);
      // the two ways in to this page
      var ways = el("p", "cv2-ways");
      ways.appendChild(document.createTextNode("Also under "));
      if (X.parent !== "dispute-resolution") {
        var p1 = el("a", null, parent.title);
        p1.href = parentUrl(X);
        ways.appendChild(p1);
        ways.appendChild(document.createTextNode("  ·  "));
      }
      var p2 = el("a", null, "Dispute Resolution");
      p2.href = areaUrl("dispute-resolution");
      ways.appendChild(p2);
      heading(detail, crumbs, X.title, ways);
      addHero(detail, X, true);
      body(detail, X, [], "Overview");
      if (X.groups.length) detail.appendChild(groupsSection(X.groups, "Our Work"));
      addMatters(detail, X, true, X.parent);
      addInsights(detail, X.slug, true);
      // other disputes areas
      var all = D.drList.filter(function (r) { return !r.pending; }).map(function (r) {
        return { slug: r.disputes || r.area, title: r.label, url: r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area) };
      });
      var nav = el("nav", "pa-others reveal");
      nav.setAttribute("aria-label", "Other areas of dispute");
      nav.appendChild(el("h2", "pa-section-title", "Other Areas of Dispute"));
      var chips = el("div", "pa-other-chips");
      all.forEach(function (r) {
        if (r.slug === X.slug) return;
        var c = el("a", "pa-other-chip", r.title);
        c.href = r.url;
        chips.appendChild(c);
      });
      nav.appendChild(chips);
      detail.appendChild(show(nav));
    } else if (A && A.kind === "hub") {
      // Dispute Resolution: every area of dispute, each opening its own page
      document.title = A.title + " | Skrine";
      heading(detail, capCrumbs, A.title, el("p", "cv2-ways", D.drList.length + " areas of dispute"));
      addHero(detail, A, false);
      body(detail, A, []);
      // a lighter hub layout (css/capabilities-v2.css .cv2-hub): the overview opens with its first sentence as a lead
      detail.classList.add("cv2-hub");
      var firstP = detail.querySelector(".pa-overview-text");
      if (firstP) {
        var m = firstP.textContent.match(/^(.+?[.!?])\s+([\s\S]+)$/);
        if (m) {
          firstP.textContent = "";
          firstP.appendChild(el("span", "cv2-lead", m[1]));
          firstP.appendChild(document.createTextNode(" " + m[2]));
        }
      }
      // Areas of Dispute: an index of names beside a preview that follows the pointer / focus (laptop);
      // phones get the plain list (the preview is hidden in css)
      var sec = el("section", "cv2-dr reveal");
      var drHead = el("div", "cv2-dr-head");
      drHead.appendChild(el("h2", "pa-section-title", "Areas of Dispute"));
      drHead.appendChild(el("p", "cv2-dr-hint", "Point at an area to preview it"));
      sec.appendChild(drHead);
      var drWrap = el("div", "cv2-dr-wrap");
      var ul = el("ul", "cv2-dr-list");
      var pv = el("aside", "cv2-dr-preview");
      pv.setAttribute("aria-live", "polite");
      var pvInner = el("div", "cv2-dr-pv");
      // decoration: soft ripples in brand red and grey that turn a little with each area
      var art = el("div", "cv2-pv-art");
      art.setAttribute("aria-hidden", "true");
      art.innerHTML = '<svg viewBox="0 0 240 240" fill="none">' +
        '<circle cx="120" cy="120" r="112" stroke="currentColor" stroke-width="1"/>' +
        '<circle cx="120" cy="120" r="86" stroke="currentColor" stroke-width="1"/>' +
        '<circle cx="120" cy="120" r="60" stroke="currentColor" stroke-width="1"/>' +
        '<circle cx="120" cy="120" r="34" stroke="currentColor" stroke-width="1"/>' +
        '<circle class="cv2-pv-dot" cx="120" cy="8" r="5"/>' +
        '<circle class="cv2-pv-dot cv2-pv-dot--soft" cx="206" cy="120" r="3.5"/>' +
        '<circle class="cv2-pv-dot cv2-pv-dot--soft" cx="120" cy="180" r="3"/></svg>';
      pv.appendChild(art);
      pv.appendChild(pvInner);
      var turn = 0;
      function firstSentence(t) { var m = String(t || "").match(/^.+?[.!?](?=\s|$)/); return m ? m[0] : String(t || ""); }
      function preview(r, target, where, href) {
        pvInner.classList.remove("is-in");
        void pvInner.offsetWidth;   // restart the fade
        pvInner.textContent = "";
        pvInner.appendChild(el("p", "cv2-pv-eyebrow", where || "Dispute Resolution"));
        pvInner.appendChild(el("h3", "cv2-pv-title", r.label));
        if (!target) {
          pvInner.appendChild(el("p", "cv2-pv-text", "A page for this area is being prepared. Please contact us to discuss a matter."));
        } else {
          // areas without their own write-up borrow the opening line of the practice / sector they belong to
          var intro = (target.intro || [])[0];
          if (!intro && target.parent) { var par = parentOf(target); intro = par && (par.intro || [])[0]; }
          if (intro) pvInner.appendChild(el("p", "cv2-pv-text", firstSentence(intro)));
          var gs = (target.groups || []).map(function (g) { return g.title; }).filter(Boolean).slice(0, 4);
          if (gs.length) {
            pvInner.appendChild(el("p", "cv2-pv-label", "Matters we handle"));
            var tags = el("ul", "cv2-pv-tags");
            gs.forEach(function (g) { tags.appendChild(el("li", null, g)); });
            pvInner.appendChild(tags);
          }
          var go = el("a", "cv2-pv-go", "Explore " + r.label);
          go.href = href;
          go.appendChild(icon("fa-solid fa-arrow-right"));
          pvInner.appendChild(go);
        }
        pvInner.classList.add("is-in");
        turn += 40;
        art.style.setProperty("--turn", turn + "deg");
      }
      var rows = [];
      D.drList.forEach(function (r) {
        var li = el("li");
        var row, target = null, where = "", href = "";
        if (r.pending) {
          row = el("span", "cv2-dr-row is-pending");
          row.setAttribute("tabindex", "0");
          row.appendChild(el("span", "cv2-dr-name", r.label));
          row.appendChild(el("span", "cv2-dr-where", "Coming soon"));
          where = "Coming soon";
        } else {
          row = el("a", "cv2-dr-row");
          href = row.href = r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area);
          row.appendChild(el("span", "cv2-dr-name", r.label));
          target = r.disputes ? D.disputes[r.disputes] : AREA[r.area];
          where = r.disputes && target.parent !== "dispute-resolution" ? "Part of " + parentOf(target).title : (r.area ? "Practice area" : "");
          row.appendChild(el("span", "cv2-dr-where", where));
          row.appendChild(icon("fa-solid fa-arrow-right cv2-dr-arrow"));
        }
        function pick() {
          rows.forEach(function (x) { x.classList.toggle("is-current", x === row); });
          preview(r, target, where, href);
        }
        row.addEventListener("pointerenter", pick);
        row.addEventListener("focus", pick);
        rows.push(row);
        li.appendChild(row);
        ul.appendChild(li);
        if (rows.length === 1) pick();
      });
      drWrap.appendChild(ul);
      drWrap.appendChild(pv);
      sec.appendChild(drWrap);
      detail.appendChild(show(sec));
      others(detail, "Other Practice Areas", PRACTICES, A.slug, areaUrl);
    } else if (A) {
      document.title = A.title + " | Skrine";
      var note = null;
      if (A.kind === "disputes-only" && DR_LABEL[A.slug]) {
        note = el("p", "cv2-ways");
        note.appendChild(document.createTextNode("Also under "));
        var dl = el("a", null, "Dispute Resolution");
        dl.href = areaUrl("dispute-resolution");
        note.appendChild(dl);
      }
      heading(detail, capCrumbs, A.title, note);
      addHero(detail, A, false);
      body(detail, A, [A.disputes ? disputesLink(D.disputes[A.disputes]) : null]);
      if (A.groups.length) detail.appendChild(groupsSection(A.groups, "Our Work"));
      addMatters(detail, A, false);
      addInsights(detail, A.slug, A.kind === "disputes-only");
      others(detail, "Other Practice Areas", PRACTICES, A.slug, areaUrl);
    } else {
      detail.appendChild(el("h1", "page-title", "Practice area not found"));
      var back = el("a", "btn btn--outline", "See all practice areas");
      back.href = "capabilities-v2.html";
      detail.appendChild(back);
    }
  }

  /* ---------- sector page ---------- */
  var sdetail = document.getElementById("sectorDetailV2");
  if (sdetail) {
    var S = SECTOR[new URLSearchParams(location.search).get("sector")];
    if (!S) {
      sdetail.appendChild(el("h1", "page-title", "Sector not found"));
      var sb = el("a", "btn btn--outline", "See all sectors");
      sb.href = "sectors-v2.html";
      sdetail.appendChild(sb);
    } else {
      document.title = S.title + " | Skrine";
      heading(sdetail, [["Services", "capabilities-v2.html"], ["Sectors", "sectors-v2.html"]], S.title);
      sdetail.appendChild(bannerFor(S.img));
      body(sdetail, S, [S.disputes ? disputesLink(D.disputes[S.disputes]) : null]);
      if (S.groups.length) sdetail.appendChild(sectorWork(S.groups));
      // related practice areas (as Layout 1): the ones sharing the most key contacts
      var mine = {};
      S.contacts.concat(S.disputes ? D.disputes[S.disputes].contacts : []).forEach(function (n) { mine[person(n).name] = 1; });
      var rel = PRACTICES.filter(function (p) { return p.kind !== "hub"; }).map(function (p) {
        var all = p.contacts.concat(p.disputes ? D.disputes[p.disputes].contacts : []);
        return { p: p, n: all.filter(function (n) { return mine[person(n).name]; }).length };
      }).filter(function (r) { return r.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
      if (rel.length) {
        var rp = el("section", "sector-related reveal");
        rp.appendChild(el("h2", "pa-section-title", "Related Practice Areas"));
        var rg = el("div", "sector-related-grid");
        rel.forEach(function (r) {
          var card = el("a", "sector-related-card");
          card.href = areaUrl(r.p.slug);
          card.setAttribute("data-tilt", "");
          var im = el("img");
          im.src = r.p.img ? "images/" + r.p.img + ".jpg" : "images/hero-palette.jpg";
          im.alt = "";
          im.loading = "lazy";
          card.appendChild(im);
          var nm = el("span", "sector-related-name", r.p.title + " ");
          nm.appendChild(icon("fa-solid fa-arrow-right"));
          card.appendChild(nm);
          rg.appendChild(card);
          FX.attachTilt(card);
        });
        rp.appendChild(rg);
        sdetail.appendChild(show(rp));
      }
      others(sdetail, "Other Sectors", SECTORS, S.slug, sectorUrl);
    }
  }
})();
