/* =========================================================
   SKRINE — Individual profile (partners & consultants)
   profile.html?p=<slug>   e.g. profile.html?p=fariz-abdul-aziz
   - Hero: portrait, role & division, key areas, call / email /
     save contact, quick counts
   - Sticky section bar with scroll-spy
   - Overview, Experience (tabs per practice area), Recognition
     (testimonial carousel + rankings), Credentials,
     Publications & Talks, In the news, more profiles
   Data: js/profiles-data.js · js/people-data.js · js/news-data.js
   ========================================================= */
(function () {
  "use strict";

  var PROFILES = window.SKRINE_PROFILES || {};
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var NEWS = (window.SKRINE_NEWS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var FX = window.SkrineFX || { observeReveal: function (el) { el.classList.add("is-visible"); }, attachTilt: function () {} };
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }

  var LIST_SHOWN = 6;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var sectionsEl = document.getElementById("pfSections");
  if (!sectionsEl) return;

  // design switch keeps the same person

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el("i", name); i.setAttribute("aria-hidden", "true"); return i; }
  function slugify(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function initials(name) {
    var skip = { to: 1, puan: 1, tan: 0, sri: 1, dato: 1, bin: 1, binti: 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }
  function fmtDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  // People-page entry (photo file, division) for a profile
  var directory = {};
  [["partners", "Partners"], ["consultants", "Consultants"]].forEach(function (r) {
    (PEOPLE[r[0]] || []).forEach(function (p) { directory[slugify(p.name)] = { person: p, group: r[1] }; });
  });
  function photoFile(slug, name) {
    var d = directory[slug];
    return d ? (d.person.photo || d.person.name + ".png") : name + ".png";
  }
  // portrait image, or a monogram if the photo isn't in the folder yet
  function portrait(slug, name, cls) {
    var wrap = el("span", cls);
    var img = el("img");
    img.src = photoUrl(photoFile(slug, name));
    img.alt = "Portrait of " + name;
    img.decoding = "async";
    img.addEventListener("error", function () {
      var mono = el("span", "pf-monogram", initials(name));
      mono.setAttribute("aria-hidden", "true");
      img.replaceWith(mono);
    });
    wrap.appendChild(img);
    return wrap;
  }

  function section(id, eyebrow, title) {
    var s = el("section", "pf-section reveal");
    s.id = id;
    s.setAttribute("aria-labelledby", id + "-title");
    var head = el("header", "pf-section-head");
    head.appendChild(el("p", "eyebrow", eyebrow));
    var h = el("h2", "pf-section-title", title);
    h.id = id + "-title";
    head.appendChild(h);
    s.appendChild(head);
    var body = el("div", "pf-section-body");
    s.appendChild(body);
    sectionsEl.appendChild(s);
    navItems.push({ id: id, label: eyebrow });
    return body;
  }

  // long lists: first few, then "Show all"
  function expandable(ul, shown, noun) {
    var items = ul.children;
    if (items.length <= shown) return null;
    for (var i = shown; i < items.length; i++) items[i].hidden = true;
    var b = el("button", "pf-more");
    b.type = "button";
    b.setAttribute("aria-expanded", "false");
    var label = noun === "matters" ? "Show more" : "Show all " + items.length + " " + noun;
    b.appendChild(el("span", null, label));
    b.appendChild(icon("fa-solid fa-chevron-down"));
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") !== "true";
      for (var j = shown; j < items.length; j++) items[j].hidden = !open;
      b.setAttribute("aria-expanded", String(open));
      b.firstChild.textContent = open ? "Show fewer" : label;
      if (!open) ul.scrollIntoView({ block: "nearest" });
    });
    return b;
  }

  /* ---------- which profile ---------- */
  var slug = new URLSearchParams(location.search).get("p") || "";
  var P = PROFILES[slug];
  var navItems = [];

  // keys: which profiles to list (all but `exclude` when not given)
  function otherProfiles(exclude, keys) {
    var grid = el("div", "pf-others-grid");
    (keys || Object.keys(PROFILES)).forEach(function (k) {
      if (k === exclude) return;
      var o = PROFILES[k];
      var a = el("a", "pf-other");
      a.href = "profile.html?p=" + encodeURIComponent(k);
      a.appendChild(portrait(k, o.name, "pf-other-photo"));
      var t = el("span", "pf-other-text");
      t.appendChild(el("span", "pf-other-name", o.name));
      var d = directory[k];
      t.appendChild(el("span", "pf-other-role", o.role + (d && d.person.division ? " · " + d.person.division : "")));
      a.appendChild(t);
      a.appendChild(icon("fa-solid fa-arrow-right pf-other-arrow"));
      grid.appendChild(a);
    });
    return grid;
  }

  /* People closest to this profile: shared practice areas count most, then shared words in
     area names (e.g. both do some kind of "Construction"), then the same division.
     Ties are broken by a fixed per-profile order so each page shows a steady, varied set. */
  var AREA_STOP = { and: 1, of: 1, the: 1, law: 1, "&": 1, services: 1, advisory: 1, disputes: 1, litigation: 1 };
  function areasOf(k) {
    var d = directory[k];
    return ((PROFILES[k] && PROFILES[k].keyAreas) || []).concat(d && d.person.areas ? d.person.areas : []);
  }
  function areaKey(a) { return a.toLowerCase().replace(/\boil and gas\b/g, "oil & gas").replace(/[^a-z0-9&]+/g, " ").trim(); }
  function areaWords(list) {
    var w = {};
    list.forEach(function (a) { areaKey(a).split(" ").forEach(function (x) { if (x.length > 2 && !AREA_STOP[x]) w[x] = 1; }); });
    return w;
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  function relatedProfiles(self, count) {
    var mine = areasOf(self), mineKeys = {}, myWords = areaWords(mine);
    mine.forEach(function (a) { mineKeys[areaKey(a)] = a; });
    var myDiv = directory[self] ? directory[self].person.division : "";
    var scored = Object.keys(PROFILES).filter(function (k) { return k !== self; }).map(function (k) {
      var theirs = areasOf(k), shared = 0, seen = {};
      theirs.forEach(function (a) { var key = areaKey(a); if (mineKeys[key] && !seen[key]) { seen[key] = 1; shared++; } });
      var words = 0, tw = areaWords(theirs);
      Object.keys(tw).forEach(function (x) { if (myWords[x]) words++; });
      var div = directory[k] ? directory[k].person.division : "";
      var sameDiv = myDiv && div === myDiv;
      return { k: k, score: shared * 3 + Math.min(words, 4) + (sameDiv ? 2 : 0), tie: hash(self + "|" + k) };
    });
    scored.sort(function (a, b) { return b.score - a.score || a.tie - b.tie; });
    return scored.slice(0, count).map(function (x) { return x.k; });
  }

  if (!P) {
    document.getElementById("pfHero").hidden = true;
    document.getElementById("pfNav").hidden = true;
    document.querySelector(".pf-crumbs").hidden = true;
    var miss = document.getElementById("pfMissing");
    miss.hidden = false;
    document.getElementById("pfMissingList").replaceWith(otherProfiles(null));
    return;
  }

  var entry = directory[slug] || { person: {}, group: P.role === "Consultant" ? "Consultants" : "Partners" };
  var division = entry.person.division || "";
  document.title = P.name + " | Skrine";
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", P.name + ", " + P.role + " at Skrine." + (P.keyAreas.length ? " " + P.keyAreas.join(", ") + "." : ""));

  /* ---------- hero ---------- */
  document.getElementById("pfCrumbRole").textContent = entry.group;
  document.getElementById("pfCrumbName").textContent = P.name;
  // (role · division label above the name removed)
  document.getElementById("pfName").textContent = P.name;

  var areasEl = document.getElementById("pfAreas");
  if (P.keyAreas.length) P.keyAreas.forEach(function (a) { areasEl.appendChild(el("li", null, a)); });
  else areasEl.remove();

  var actions = document.getElementById("pfActions");
  if (P.email) {
    var mail = el("a", "btn btn--solid");
    mail.href = "mailto:" + P.email;
    mail.appendChild(icon("fa-regular fa-envelope"));
    mail.appendChild(document.createTextNode(" " + P.email));
    actions.appendChild(mail);
  }
  if (P.phone) {
    var tel = el("a", "btn btn--outline");
    var m = P.phone.match(/^([+\d\s]+?)\s*ext\.?\s*(\d+)/i);
    tel.href = "tel:" + (m ? m[1].replace(/\s+/g, "") + ",," + m[2] : P.phone.replace(/\s+/g, ""));
    tel.appendChild(icon("fa-solid fa-phone"));
    tel.appendChild(document.createTextNode(" " + P.phone.replace(/\bext\b/, "ext.")));
    actions.appendChild(tel);
  }
  // vCard so people can save the contact straight to their phone
  var vc = el("button", "pf-vcard");
  vc.type = "button";
  vc.appendChild(icon("fa-regular fa-address-card"));
  vc.appendChild(document.createTextNode(" Save contact"));
  vc.addEventListener("click", function () {
    var lines = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + P.name, "ORG:Skrine", "TITLE:" + P.role];
    if (P.phone) lines.push("TEL;TYPE=WORK,VOICE:" + P.phone);
    if (P.email) lines.push("EMAIL;TYPE=WORK:" + P.email);
    lines.push("URL:" + location.href, "END:VCARD");
    var url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/vcard" }));
    var a = el("a");
    a.href = url;
    a.download = slug + ".vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  actions.appendChild(vc);

  // Download profile (the partner's CV as a PDF). The files are supplied later, on WordPress:
  // set P.cv to the file's URL (e.g. from the media library); until then it points at
  // files/cv/<slug>.pdf, the place to drop each partner's PDF.
  var cv = el("a", "pf-vcard pf-cv");
  cv.href = P.cv || "files/cv/" + slug + ".pdf";
  cv.setAttribute("download", slug + "-skrine-profile.pdf");
  cv.appendChild(icon("fa-regular fa-file-pdf"));
  cv.appendChild(document.createTextNode(" Download profile"));
  actions.appendChild(cv);


  var fig = document.getElementById("pfPortrait");
  fig.appendChild(portrait(slug, P.name, "pf-portrait-frame"));

  // full names for institutions that profiles list by short form only (panel memberships)
  var PANEL_ORGS = {
    AIAC: "Asian International Arbitration Centre",
    SIAC: "Singapore International Arbitration Centre",
    HKIAC: "Hong Kong International Arbitration Centre",
    ICC: "International Chamber of Commerce",
    ICSID: "International Centre for Settlement of Investment Disputes",
    THAC: "Thailand Arbitration Center",
    SIDREC: "Securities Industry Dispute Resolution Center",
    KCAB: "Korean Commercial Arbitration Board",
    LCIA: "London Court of International Arbitration"
  };

  /* ---------- overview ---------- */
  if (P.overview.length) {
    var SP = window.SkrineProfile;
    var ov = section("overview", "Overview", "About " + (SP ? SP.givenName(P.name) : P.name));
    ov.classList.add("pf-overview");
    (SP ? SP.shortOverview(P.overview) : P.overview).forEach(function (t, i) { ov.appendChild(el("p", i === 0 ? "pf-lede" : null, t)); });

    // panel memberships (arbitration centres, disciplinary boards…) move out of Credentials
    // into their own container under the write-up (css/profile.css .pf-panels)
    var panelItems = [];
    P.credentials = P.credentials.map(function (c) {
      var keep = c.items.filter(function (it) {
        if (/\bpanel\b/i.test(it)) { panelItems.push(it); return false; }
        return true;
      });
      return { heading: c.heading, items: keep };
    }).filter(function (c) { return c.items.length; });
    if (panelItems.length) {
      // an editorial list: grouped by role, institution in the display serif, short form as a quiet tag
      var groups = [], byRole = {};
      panelItems.forEach(function (it) {
        var txt = it.replace(/\.\s*$/, "");
        // "Panel Arbitrator, AIAC" / "Panel Member of SIAC" / "Panel Member AIAC" → role + institution
        var m = txt.match(/^(Panel\s+[A-Z][a-z]+)(?:\s*,\s*|\s+of\s+|\s+)(.+)$/);
        var role = m ? m[1].replace(/\b(\w)(\w*)$/, function (w, a, b) { return a.toUpperCase() + b; }) : "Panel Member";
        var org = m ? m[2] : txt, abbr = "";
        if (PANEL_ORGS[org]) { abbr = org; org = PANEL_ORGS[org]; }   // short form only: give the full name
        else {
          var ab = org.match(/^(.+?)\s*\(([A-Z]{2,})\)\s*$/);
          if (ab) { org = ab[1]; abbr = ab[2]; }
        }
        if (!byRole[role]) { byRole[role] = []; groups.push(role); }
        byRole[role].push({ org: org, abbr: abbr });
      });
      var pb = el("div", "pf-panels");
      pb.appendChild(el("p", "pf-panels-eyebrow", "Panel memberships"));
      groups.forEach(function (role) {
        var g = el("div", "pf-pg");
        g.appendChild(el("p", "pf-pg-role", byRole[role].length > 1 ? role.replace(/(\w+)$/, "$1s") : role));
        var ul = el("ul", "pf-pg-list");
        byRole[role].forEach(function (x) {
          var li = el("li");
          li.appendChild(el("span", "pf-pg-name", x.org));
          if (x.abbr) li.appendChild(el("abbr", "pf-pg-abbr", x.abbr));
          ul.appendChild(li);
        });
        g.appendChild(ul);
        pb.appendChild(g);
      });
      ov.appendChild(pb);
    }
  }

  /* ---------- experience ---------- */
  if (P.experience.length) {
    var ex = section("experience", "Experience", "Selected matters");
    var tabs = el("div", "pf-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Practice areas");
    ex.appendChild(tabs);
    var panels = [];
    P.experience.forEach(function (e, i) {
      var t = el("button", "pf-tab");
      t.type = "button";
      t.id = "pf-tab-" + i;
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", "pf-panel-" + i);
      t.setAttribute("aria-selected", String(i === 0));
      t.tabIndex = i === 0 ? 0 : -1;
      t.appendChild(el("span", null, e.area));
      tabs.appendChild(t);

      var panel = el("div", "pf-panel");
      panel.id = "pf-panel-" + i;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", t.id);
      panel.hidden = i !== 0;
      var ol = el("ol", "pf-matters");
      e.matters.forEach(function (mt, j) {
        var li = el("li", "pf-matter");
        li.appendChild(el("span", "pf-matter-no", String(j + 1).padStart(2, "0")));
        li.appendChild(el("p", null, mt));
        ol.appendChild(li);
      });
      panel.appendChild(ol);
      // top 3 first; the rest sit behind "Show more"
      var more = expandable(ol, window.SkrineProfile ? window.SkrineProfile.TOP_MATTERS : 3, "matters");
      if (more) panel.appendChild(more);
      ex.appendChild(panel);
      panels.push({ tab: t, panel: panel });
    });
    function selectTab(i, focus) {
      panels.forEach(function (p, k) {
        var on = k === i;
        p.tab.setAttribute("aria-selected", String(on));
        p.tab.tabIndex = on ? 0 : -1;
        p.panel.hidden = !on;
      });
      if (focus) panels[i].tab.focus();
    }
    panels.forEach(function (p, i) {
      p.tab.addEventListener("click", function () { selectTab(i); });
      p.tab.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") selectTab((i + 1) % panels.length, true);
        if (e.key === "ArrowLeft") selectTab((i - 1 + panels.length) % panels.length, true);
      });
    });
  }

  /* ---------- recognition ---------- */
  if (P.quotes.length || P.rankings.length) {
    var rc = section("recognition", "Recognition", "What clients and directories say");
    rc.classList.add("pf-recognition");
    if (P.quotes.length) {
      var car = el("div", "pf-quotes");
      car.setAttribute("aria-roledescription", "carousel");
      car.setAttribute("aria-label", "Client testimonials");
      var mark = el("span", "pf-quote-mark", "“");
      mark.setAttribute("aria-hidden", "true");
      car.appendChild(mark);
      var stage = el("div", "pf-quote-stage");
      stage.setAttribute("aria-live", "polite");
      car.appendChild(stage);
      var foot = el("div", "pf-quote-foot");
      var counter = el("span", "pf-quote-count");
      var prev = el("button", "pf-quote-btn");
      prev.type = "button";
      prev.setAttribute("aria-label", "Previous testimonial");
      prev.appendChild(icon("fa-solid fa-arrow-left"));
      var next = el("button", "pf-quote-btn");
      next.type = "button";
      next.setAttribute("aria-label", "Next testimonial");
      next.appendChild(icon("fa-solid fa-arrow-right"));
      foot.appendChild(counter);
      foot.appendChild(prev);
      foot.appendChild(next);
      car.appendChild(foot);
      var qi = 0;
      function showQuote(i) {
        qi = (i + P.quotes.length) % P.quotes.length;
        var q = P.quotes[qi];
        stage.textContent = "";
        var bq = el("blockquote", "pf-quote" + (q.quote.length > 220 ? " pf-quote--long" : ""));
        bq.appendChild(el("p", null, q.quote));
        bq.appendChild(el("cite", null, q.source));
        stage.appendChild(bq);
        counter.textContent = String(qi + 1).padStart(2, "0") + " / " + String(P.quotes.length).padStart(2, "0");
      }
      prev.addEventListener("click", function () { showQuote(qi - 1); });
      next.addEventListener("click", function () { showQuote(qi + 1); });
      if (P.quotes.length < 2) { prev.hidden = true; next.hidden = true; }
      showQuote(0);
      rc.appendChild(car);
    }
    if (P.rankings.length) {
      var rk = el("div", "pf-rankings");
      rk.appendChild(el("h3", "pf-sub", "Rankings & awards"));
      var ul = el("ul", "pf-rank-list");
      P.rankings.forEach(function (r) {
        var li = el("li");
        li.appendChild(icon("fa-solid fa-award"));
        li.appendChild(el("span", null, r));
        ul.appendChild(li);
      });
      rk.appendChild(ul);
      var rm = expandable(ul, LIST_SHOWN, "recognitions");
      if (rm) rk.appendChild(rm);
      rc.appendChild(rk);
    }
    if (!P.quotes.length) rc.classList.add("pf-recognition--single");
  }

  /* ---------- credentials ---------- */
  if (P.credentials.length) {
    var cr = section("credentials", "Credentials", "Qualifications & memberships");
    var grid = el("div", "pf-cred-grid");
    var ICONS = { qualifications: "fa-solid fa-graduation-cap", directorships: "fa-solid fa-building-columns", mediation: "fa-solid fa-handshake" };
    P.credentials.forEach(function (c) {
      var card = el("article", "pf-cred");
      var key = c.heading.toLowerCase();
      var h = el("h3", "pf-cred-title");
      h.appendChild(icon(ICONS[key] || "fa-solid fa-people-group"));
      h.appendChild(document.createTextNode(" " + c.heading));
      card.appendChild(h);
      var ul = el("ul");
      c.items.forEach(function (it) { ul.appendChild(el("li", null, it)); });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    cr.appendChild(grid);
  }

  /* ---------- publications & talks ---------- */
  if (P.talks.length) {
    var tk = section("talks", "Thought leadership", "Publications & talks");
    P.talks.forEach(function (g) {
      var wrap = el("div", "pf-talk-group");
      // one group: the section title says it all (skrine.com's single label is often inaccurate)
      if (g.heading && P.talks.length > 1) wrap.appendChild(el("h3", "pf-sub", g.heading.replace(/^(authored|delivered) the following\s*/i, function (m0, v) { return v.toLowerCase() === "authored" ? "Authored " : "Delivered "; })));
      var ul = el("ul", "pf-talks");
      g.items.forEach(function (it) {
        var li = el("li");
        li.appendChild(icon(/present|speaker|panel|talk|seminar|webinar|conference/i.test(it) ? "fa-solid fa-microphone-lines" : "fa-regular fa-file-lines"));
        li.appendChild(el("span", null, it));
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      var more = expandable(ul, LIST_SHOWN, "items");
      if (more) wrap.appendChild(more);
      tk.appendChild(wrap);
    });
  }

  /* ---------- in the news: a self-moving carousel ----------
     Only publications, articles (alerts) and speaking engagements / SkrineCast that name this
     person, newest first (no awards, firm news or community posts).
     Data: js/publications-data.js, js/alerts-data.js, js/news-data.js
     (+ js/alerts-full-data.js, js/news-full-data.js for links, js/topic-images.js for alert photos). */
  var NEWS_MAX = 10;
  var STOP = { bin: 1, binti: 1, to: 1, puan: 1, dato: 1, sri: 1 };
  function nameTokens(n) { return String(n).toLowerCase().replace(/[’'.]/g, "").split(/[^a-z]+/).filter(function (t) { return t && !STOP[t]; }); }
  // the same person: every part of the shorter name appears in the longer one ("Charmayne Ong" / "Charmayne Ong Poh Yin")
  function samePerson(a, b) {
    var x = nameTokens(a), y = nameTokens(b);
    var s = x.length <= y.length ? x : y, l = s === x ? y : x;
    return s.length > 1 && s.every(function (t) { return l.indexOf(t) > -1; });
  }
  var myNames = [P.name, entry && entry.person && entry.person.name].filter(Boolean);
  function isMe(n) { return myNames.some(function (m) { return samePerson(m, n); }); }
  function linkSlug(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, ""); }
  var ALERTS_FULL = window.SKRINE_ALERTS_FULL || {}, NEWS_FULL = window.SKRINE_NEWS_FULL || {};

  var feed = [];
  (window.SKRINE_PUBLICATIONS || []).forEach(function (p) {
    if (!(p.authors || []).some(isMe)) return;
    feed.push({ type: "Publication", date: p.date, title: p.title, sub: p.publisher || "",
      img: p.cover ? "images/publications/" + p.cover : "", cover: true,
      href: p.pdf || "publications.html?q=" + encodeURIComponent(p.title), ext: !!p.pdf });
  });
  (window.SKRINE_ALERTS || []).forEach(function (a) {
    if (!a.authors || !a.authors.split(/,\s*|\s+and\s+|\s*&\s*/).some(isMe)) return;
    var s = linkSlug(a.title);
    feed.push({ type: "Article", date: a.date, title: a.title, sub: a.label || a.topic || "",
      img: window.SkrineTopicImage ? window.SkrineTopicImage(a.topic, a.title, a.practice) : "",
      href: ALERTS_FULL[s] ? "alert.html?a=" + encodeURIComponent(s) : "alerts.html?q=" + encodeURIComponent(a.title) });
  });
  NEWS.forEach(function (n) {
    if (!/^(Speaking Events|SkrineCast)$/.test(n.category) || !(n.people || []).some(isMe)) return;
    var s = linkSlug(n.title);
    feed.push({ type: n.category === "SkrineCast" ? "SkrineCast" : "Speaking", date: n.date, title: n.title, sub: "",
      img: n.image ? (/^(https?:)?\/\//.test(n.image) ? n.image : "images/news/" + encodeURIComponent(n.image)) : "",
      href: NEWS_FULL[s] ? "news.html?n=" + encodeURIComponent(s) : "news-events.html" });
  });
  feed.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  feed = feed.slice(0, NEWS_MAX);

  if (feed.length) {
    var nw = section("news", "In the news", "Publications & speaking");
    var car = el("div", "pf-car");
    car.setAttribute("aria-roledescription", "carousel");
    car.setAttribute("aria-label", "Publications and speaking engagements");
    var ctr = el("div", "pf-car-controls");
    var prev = el("button", "pf-car-btn"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.appendChild(icon("fa-solid fa-arrow-left"));
    var next = el("button", "pf-car-btn"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.appendChild(icon("fa-solid fa-arrow-right"));
    ctr.appendChild(prev);
    ctr.appendChild(next);
    // the arrows sit under the section heading (left column), clear of the sticky profile menu
    var newsSec = nw.parentNode;
    newsSec.querySelector(".pf-section-head").appendChild(ctr);
    var track = el("div", "pf-car-track");
    feed.forEach(function (it, i) {
      var a = el("a", "pf-news-card");
      a.href = it.href;
      if (it.ext) { a.target = "_blank"; a.rel = "noopener"; }
      a.setAttribute("aria-label", it.type + ": " + it.title + " (" + (i + 1) + " of " + feed.length + ")");
      var media = el("span", "pf-news-media" + (it.cover ? " is-cover" : ""));
      var img = el("img");
      img.src = it.img || "images/hero-palette.jpg";
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.src = "images/hero-palette.jpg"; media.classList.remove("is-cover"); });
      media.appendChild(img);
      media.appendChild(el("span", "pf-news-type pf-news-type--" + it.type.toLowerCase(), it.type));
      a.appendChild(media);
      var b = el("span", "pf-news-body");
      b.appendChild(el("span", "pf-news-meta", fmtDate(it.date) + (it.sub ? " · " + it.sub : "")));
      b.appendChild(el("span", "pf-news-title", it.title));
      var more = el("span", "pf-news-more", it.type === "Publication" ? "Read publication " : "Read more ");
      more.appendChild(icon("fa-solid fa-arrow-right"));
      b.appendChild(more);
      a.appendChild(b);
      track.appendChild(a);
    });
    car.appendChild(track);
    var foot = el("div", "pf-car-foot");
    var dots = el("div", "pf-car-dots");
    foot.appendChild(dots);
    foot.appendChild(el("p", "pf-src-note", "Content from skrine.com, shown for design review."));
    car.appendChild(foot);
    nw.appendChild(car);

    // one card per step; dots show the position
    var step = function () { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth; };
    var maxLeft = function () { return track.scrollWidth - track.clientWidth; };
    var positions = function () { return Math.max(1, Math.round(maxLeft() / step()) + 1); };
    var at = function () { return Math.min(positions() - 1, Math.round(track.scrollLeft / step())); };
    // an eased glide; snapping is off while it runs
    var anim = 0;
    var glide = function (left, dur) {
      cancelAnimationFrame(anim);
      var from = track.scrollLeft, to = Math.max(0, Math.min(left, maxLeft()));
      if (Math.abs(to - from) < 2) return;
      var t0 = performance.now(), d = dur || 800;
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      track.style.scrollSnapType = "none";
      (function frame(now) {
        var t = Math.min(1, (now - t0) / d);
        track.scrollLeft = from + (to - from) * ease(t);
        if (t < 1) anim = requestAnimationFrame(frame); else track.style.scrollSnapType = "";
      })(t0);
    };
    var goTo = function (i) { glide(i * step()); };
    var sync = function () {
      var n = positions(), c = at();
      if (dots.children.length !== n) {
        dots.textContent = "";
        for (var i = 0; i < n; i++) (function (i) {
          var d = el("button", "pf-car-dot");
          d.type = "button";
          d.setAttribute("aria-label", "Go to item " + (i + 1));
          d.addEventListener("click", function () { goTo(i); restart(); });
          dots.appendChild(d);
        })(i);
      }
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle("is-current", i === c); });
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > maxLeft() - 4;
      newsSec.classList.toggle("is-static", maxLeft() < 4);
    };
    prev.addEventListener("click", function () { goTo(Math.max(0, at() - 1)); restart(); });
    next.addEventListener("click", function () { goTo(Math.min(positions() - 1, at() + 1)); restart(); });
    var raf = 0;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    requestAnimationFrame(sync);

    // moves on by itself: pauses on hover, keyboard focus, touch, off screen, hidden tab; never with reduced motion
    var EVERY = 1500, timer = 0, touchT = 0;
    var hold = { hover: false, focus: false, touch: false, away: true };
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function restart() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () {
        if (hold.hover || hold.focus || hold.touch || hold.away || document.hidden || newsSec.classList.contains("is-static")) return;
        if (track.scrollLeft > maxLeft() - 4) glide(0, 1000);
        else glide((at() + 1) * step(), 650);
      }, EVERY);
    }
    car.addEventListener("mouseenter", function () { hold.hover = true; });
    car.addEventListener("mouseleave", function () { hold.hover = false; restart(); });
    car.addEventListener("focusin", function () { hold.focus = true; });
    car.addEventListener("focusout", function () { hold.focus = false; });
    ["touchstart", "wheel", "pointerdown"].forEach(function (ev) {
      track.addEventListener(ev, function () {
        cancelAnimationFrame(anim);
        track.style.scrollSnapType = "";
        hold.touch = true;
        clearTimeout(touchT);
        touchT = setTimeout(function () { hold.touch = false; }, 6000);
      }, { passive: true });
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { hold.away = !en[0].isIntersecting; }, { threshold: 0.4 }).observe(track);
    } else hold.away = false;
    restart();
  }

  /* ---------- contact band + more profiles ---------- */
  var band = el("section", "pf-contact reveal");
  band.setAttribute("aria-label", "Contact " + P.name);
  var bt = el("div");
  bt.appendChild(el("h2", null, "Get in touch"));
  band.appendChild(bt);
  var ba = el("div", "pf-contact-actions");
  if (P.email) { var be = el("a", "btn btn--light"); be.href = "mailto:" + P.email; be.appendChild(icon("fa-regular fa-envelope")); be.appendChild(document.createTextNode(" Email")); ba.appendChild(be); }
  if (P.phone) { var bp = el("a", "btn btn--ghost-light"); bp.href = tel.href; bp.appendChild(icon("fa-solid fa-phone")); bp.appendChild(document.createTextNode(" Call")); ba.appendChild(bp); }
  band.appendChild(ba);
  sectionsEl.appendChild(band);

  if (Object.keys(PROFILES).length > 1) {
    var more = el("section", "pf-section pf-more-people reveal");
    var mh = el("header", "pf-section-head");
    mh.appendChild(el("p", "eyebrow", "Our people"));
    mh.appendChild(el("h2", "pf-section-title", "Related profiles"));
    more.appendChild(mh);
    var mb = el("div", "pf-section-body");
    mb.appendChild(otherProfiles(slug, relatedProfiles(slug, 6)));
    var all = el("a", "pf-all-link");
    all.href = "people.html";
    all.appendChild(document.createTextNode("See everyone at Skrine "));
    all.appendChild(icon("fa-solid fa-arrow-right"));
    mb.appendChild(all);
    more.appendChild(mb);
    sectionsEl.appendChild(more);
  }

  /* ---------- section bar + scroll-spy ---------- */
  var navInner = document.getElementById("pfNavInner");
  var links = navItems.map(function (n) {
    var a = el("a", "pf-nav-link", n.label);
    a.href = "#" + n.id;
    navInner.appendChild(a);
    return a;
  });
  if (navItems.length < 2) document.getElementById("pfNav").hidden = true;

  // the active link is the last section whose top has passed 40% of the screen
  var targets = navItems.map(function (n) { return document.getElementById(n.id); });
  var current = -1;
  function spy() {
    var line = window.innerHeight * 0.4;
    var idx = -1;
    targets.forEach(function (t, i) { if (t.getBoundingClientRect().top <= line) idx = i; });
    if (idx === current) return;
    current = idx;
    links.forEach(function (a, i) {
      var on = i === idx;
      a.classList.toggle("is-active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        // keep the active link visible in the scrolling bar on phones
        navInner.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }
  var spyTick = false;
  window.addEventListener("scroll", function () {
    if (spyTick) return;
    spyTick = true;
    requestAnimationFrame(function () { spy(); spyTick = false; });
  }, { passive: true });
  spy();

  sectionsEl.querySelectorAll(".reveal").forEach(function (r) { FX.observeReveal(r); });
})();
