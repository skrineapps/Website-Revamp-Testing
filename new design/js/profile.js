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
  var MATTERS_SHOWN = 6;
  var LIST_SHOWN = 6;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var sectionsEl = document.getElementById("pfSections");
  if (!sectionsEl) return;

  // design switch keeps the same person
  document.querySelectorAll("[data-switch]").forEach(function (a) { a.href = a.getAttribute("href") + location.search; });

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
    var label = "Show all " + items.length + " " + noun;
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

  function otherProfiles(exclude) {
    var grid = el("div", "pf-others-grid");
    Object.keys(PROFILES).forEach(function (k) {
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
  document.getElementById("pfRole").textContent = P.role + (division ? " · " + division : "");
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


  var fig = document.getElementById("pfPortrait");
  fig.appendChild(portrait(slug, P.name, "pf-portrait-frame"));

  /* ---------- overview ---------- */
  if (P.overview.length) {
    var ov = section("overview", "Overview", "About " + P.name);
    ov.classList.add("pf-overview");
    P.overview.forEach(function (t, i) { ov.appendChild(el("p", i === 0 ? "pf-lede" : null, t)); });
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
      t.appendChild(el("span", "pf-tab-count", String(e.matters.length)));
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
      var more = expandable(ol, MATTERS_SHOWN, "matters");
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
    var cr = section("credentials", "Credentials", "Qualifications & affiliations");
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

  /* ---------- in the news ---------- */
  var mine = NEWS.filter(function (n) { return (n.people || []).indexOf(P.name) > -1 || (entry.person.name && n.people.indexOf(entry.person.name) > -1); }).slice(0, 3);
  if (mine.length) {
    var nw = section("news", "In the news", "Latest from " + P.name);
    var ng = el("div", "pf-news");
    mine.forEach(function (n) {
      var a = el("a", "pf-news-card");
      a.href = "news-events.html";
      var media = el("span", "pf-news-media");
      if (n.image) {
        var img = el("img");
        img.src = /^(https?:)?\/\//.test(n.image) ? n.image : "images/news/" + encodeURIComponent(n.image);
        img.alt = "";
        img.loading = "lazy";
        media.appendChild(img);
      }
      a.appendChild(media);
      var b = el("span", "pf-news-body");
      b.appendChild(el("span", "pf-news-meta", n.category + " · " + fmtDate(n.date)));
      b.appendChild(el("span", "pf-news-title", n.title));
      a.appendChild(b);
      ng.appendChild(a);
    });
    nw.appendChild(ng);
  }

  /* ---------- contact band + more profiles ---------- */
  var band = el("section", "pf-contact reveal");
  band.setAttribute("aria-label", "Contact " + P.name);
  var bt = el("div");
  bt.appendChild(el("p", "eyebrow", "Get in touch"));
  bt.appendChild(el("h2", null, "Speak with " + P.name));
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
    mh.appendChild(el("h2", "pf-section-title", "More profiles"));
    more.appendChild(mh);
    var mb = el("div", "pf-section-body");
    mb.appendChild(otherProfiles(slug));
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
