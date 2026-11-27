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
    var count = el("p", "sw-count");
    side.appendChild(count);
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
    count.textContent = n + (n === 1 ? " area of work" : " areas of work");
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
    a.appendChild(el("span", "cv2-dlink-label", "See also · Disputes"));
    var t = el("span", "cv2-dlink-title", x.title + " ");
    t.appendChild(icon("fa-solid fa-arrow-right"));
    a.appendChild(t);
    a.appendChild(el("span", "cv2-dlink-text", "Our disputes team and experience in this area."));
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
    cols.appendChild(show(ov));
    // the side column: Key Contacts in their own box, the Disputes link as a separate card below
    var aside = el("aside", "cv2-side reveal");
    if (page.contacts.length) {
      var box = el("div", "pa-team-box");
      box.appendChild(el("h2", "pa-section-title", "Key Contacts"));
      box.appendChild(teamList(page.contacts));
      aside.appendChild(box);
    }
    side.forEach(function (n) { if (n) aside.appendChild(n); });
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
     Matters:  js/practice-deals.js (Transaction News), by the old practice slugs below.
     Insights: js/alerts-data.js + js/publications-data.js, by practice / topic names below.
     Styles:   css/capabilities-v2.css (.cv2-matters, .cv2-ins). ---------- */
  var DEALS = window.SKRINE_PRACTICE_DEALS || [];
  var ALERTS = window.SKRINE_ALERTS || [];
  var PUBS = window.SKRINE_PUBLICATIONS || [];
  var FULL = window.SKRINE_ALERTS_FULL || {};
  var MATTER_KEYS = {
    "corporate-and-commercial": ["corporate"],
    "mergers-and-acquisitions": ["corporate"],
    "real-estate": ["real-estate"],
    "construction-engineering-projects-and-infrastructure": ["construction-and-engineering"],
    "employment": ["employment"],
    "banking-and-finance": ["banking-and-finance"],
    "intellectual-property": ["intellectual-property-and-tmt"],
    "technology-media-and-telecommunications-tmt": ["intellectual-property-and-tmt"],
    "restructuring-and-insolvency": ["restructuring-and-insolvency"]
  };
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
  var MATTERS_SHOWN = 5, INSIGHTS_MAX = 10;
  var MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function shortDate(iso) { var p = String(iso).split("-"); return Number(p[2]) + " " + MONTHS_S[Number(p[1]) - 1] + " " + p[0]; }
  // same rule as js/alerts.js, for the alert.html?a= links
  function alertSlug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }

  function addMatters(root, slug) {
    var keys = MATTER_KEYS[slug];
    if (!keys || !DEALS.length) return;
    var list = DEALS.filter(function (d) { return d.areas.some(function (a) { return keys.indexOf(a) > -1; }); })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    if (!list.length) return;
    var sec = el("section", "cv2-matters reveal");
    var head = el("div", "pa-related-head");
    head.appendChild(el("h2", "pa-section-title", "Selected Matters"));
    sec.appendChild(head);
    var ol = el("ol", "cv2-matters-list");
    list.forEach(function (d, i) {
      var li = el("li", "cv2-matter");
      if (i >= MATTERS_SHOWN) li.hidden = true;
      var a = el("a", "cv2-matter-link");
      a.href = d.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.appendChild(el("span", "cv2-matter-date", shortDate(d.date)));
      a.appendChild(el("span", "cv2-matter-title", d.title));
      var v = el("span", "cv2-matter-value");
      if (d.value) {
        v.appendChild(el("strong", null, d.value.num + (d.value.unit || "")));
        if (d.value.label) v.appendChild(el("span", null, d.value.label));
      }
      a.appendChild(v);
      a.appendChild(icon("fa-solid fa-arrow-right cv2-matter-go"));
      li.appendChild(a);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    if (list.length > MATTERS_SHOWN) {
      var more = el("button", "cv2-matters-more");
      more.type = "button";
      var label = function (open) {
        more.textContent = open ? "Show fewer " : "Show all " + list.length + " matters ";
        more.appendChild(icon("fa-solid fa-chevron-down"));
        more.classList.toggle("is-open", open);
        more.setAttribute("aria-expanded", String(open));
      };
      label(false);
      more.addEventListener("click", function () {
        var open = !more.classList.contains("is-open");
        ol.querySelectorAll(".cv2-matter").forEach(function (li, i) { if (i >= MATTERS_SHOWN) li.hidden = !open; });
        label(open);
        if (!open) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      sec.appendChild(more);
    }
    root.appendChild(show(sec));
  }

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

    var sec = el("section", "cv2-ins reveal");
    sec.setAttribute("aria-roledescription", "carousel");
    sec.setAttribute("aria-label", "Insights");
    var head = el("div", "pa-related-head cv2-ins-head");
    head.appendChild(el("h2", "pa-section-title", "Insights"));
    var ctr = el("div", "cv2-ins-controls");
    var prev = el("button", "cv2-ins-btn"); prev.type = "button"; prev.setAttribute("aria-label", "Previous insights"); prev.appendChild(icon("fa-solid fa-arrow-left"));
    var next = el("button", "cv2-ins-btn"); next.type = "button"; next.setAttribute("aria-label", "Next insights"); next.appendChild(icon("fa-solid fa-arrow-right"));
    ctr.appendChild(prev);
    ctr.appendChild(next);
    head.appendChild(ctr);
    sec.appendChild(head);

    var track = el("div", "cv2-ins-track");
    items.forEach(function (it, i) {
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
      fig.appendChild(el("span", "cv2-ins-type", it.type));
      card.appendChild(fig);
      var bodyEl = el("span", "cv2-ins-body");
      bodyEl.appendChild(el("span", "cv2-ins-date", shortDate(it.date)));
      bodyEl.appendChild(el("span", "cv2-ins-title", it.title));
      if (it.by) bodyEl.appendChild(el("span", "cv2-ins-by", it.by));
      var more = el("span", "cv2-ins-more", "Read more ");
      more.appendChild(icon("fa-solid fa-arrow-right"));
      bodyEl.appendChild(more);
      card.appendChild(bodyEl);
      track.appendChild(card);
    });
    sec.appendChild(track);
    var dots = el("div", "cv2-ins-dots");
    sec.appendChild(dots);

    // one "page" = as many cards as fit; the arrows and dots move a page at a time
    function step() {
      var c = track.querySelector(".cv2-ins-card");
      return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth;
    }
    function perPage() { return Math.max(1, Math.floor((track.clientWidth + 2) / step())); }
    function pages() { return Math.max(1, Math.ceil((items.length - perPage()) / perPage()) + 1); }
    function current() {
      if (track.scrollLeft + track.clientWidth > track.scrollWidth - 4) return pages() - 1;
      return Math.min(pages() - 1, Math.round(track.scrollLeft / (step() * perPage())));
    }
    function goTo(p) { track.scrollTo({ left: p * step() * perPage(), behavior: "smooth" }); }
    function sync() {
      var n = pages(), c = current();
      if (dots.children.length !== n) {
        dots.textContent = "";
        for (var i = 0; i < n; i++) (function (i) {
          var b = el("button", "cv2-ins-dot");
          b.type = "button";
          b.setAttribute("aria-label", "Go to page " + (i + 1));
          b.addEventListener("click", function () { goTo(i); });
          dots.appendChild(b);
        })(i);
      }
      Array.prototype.forEach.call(dots.children, function (b, i) { b.classList.toggle("is-current", i === c); });
      var atStart = track.scrollLeft < 4, atEnd = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
      prev.disabled = atStart;
      next.disabled = atEnd;
      sec.classList.toggle("is-static", atStart && atEnd);
    }
    prev.addEventListener("click", function () { goTo(Math.max(0, current() - 1)); });
    next.addEventListener("click", function () { goTo(Math.min(pages() - 1, current() + 1)); });
    var raf = 0;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    root.appendChild(show(sec));
    requestAnimationFrame(sync);
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
      addMatters(detail, A.slug);
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
