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
    var hero = el("section", "pa-qband reveal");
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
      bq.appendChild(el("cite", null, q.source));
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
    var aside = el("aside", "pa-team-box reveal");
    side.forEach(function (n) { if (n) aside.appendChild(n); });
    if (page.contacts.length) {
      aside.appendChild(el("h2", "pa-section-title", "Key Contacts"));
      aside.appendChild(teamList(page.contacts));
    }
    if (aside.children.length) cols.appendChild(show(aside));
    else cols.classList.add("cv2-cols--single");
    root.appendChild(cols);
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

    PRACTICES.forEach(function (x, i) {
      var wrap = el("div", "pa-tile-wrap reveal");
      wrap.setAttribute("role", "listitem");
      wrap.style.setProperty("--delay", (i % 4) * 0.06 + "s");
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
  var detail = document.getElementById("paDetailV2");
  if (detail) {
    var q = new URLSearchParams(location.search);
    var dSlug = q.get("disputes"), aSlug = q.get("area");
    var X = dSlug ? D.disputes[dSlug] : null;
    var A = aSlug ? AREA[aSlug] : null;
    var capCrumbs = [["Capabilities", "capabilities-v2.html"], ["Practice Areas", "capabilities-v2.html"]];

    if (X) {
      var parent = parentOf(X);
      document.title = X.title + " | Skrine";
      var isSector = X.parentType === "sector";
      var crumbs = isSector ? [["Capabilities", "capabilities-v2.html"], ["Sectors", "sectors-v2.html"], [parent.title, parentUrl(X)]]
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
      var sec = el("section", "cv2-dr reveal");
      sec.appendChild(el("h2", "pa-section-title", "Areas of Dispute"));
      var ul = el("ul", "cv2-dr-list");
      D.drList.forEach(function (r) {
        var li = el("li");
        if (r.pending) {
          var s = el("span", "cv2-dr-row is-pending");
          s.appendChild(el("span", "cv2-dr-name", r.label));
          s.appendChild(el("span", "cv2-dr-where", "Coming soon"));
          li.appendChild(s);
        } else {
          var a = el("a", "cv2-dr-row");
          a.href = r.disputes ? disputesUrl(r.disputes) : areaUrl(r.area);
          a.appendChild(el("span", "cv2-dr-name", r.label));
          var target = r.disputes ? D.disputes[r.disputes] : AREA[r.area];
          var where = r.disputes && target.parent !== "dispute-resolution" ? "Part of " + parentOf(target).title : (r.area ? "Practice area" : "");
          a.appendChild(el("span", "cv2-dr-where", where));
          a.appendChild(icon("fa-solid fa-arrow-right cv2-dr-arrow"));
          li.appendChild(a);
        }
        ul.appendChild(li);
      });
      sec.appendChild(ul);
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
      heading(sdetail, [["Capabilities", "capabilities-v2.html"], ["Sectors", "sectors-v2.html"]], S.title);
      sdetail.appendChild(bannerFor(S.img));
      body(sdetail, S, [S.disputes ? disputesLink(D.disputes[S.disputes]) : null]);
      if (S.groups.length) sdetail.appendChild(groupsSection(S.groups, "Our Work"));
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
