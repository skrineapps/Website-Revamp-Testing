/* =========================================================
   SKRINE — Individual profile, "Classic" layout
   profile-classic.html?p=<slug>
   Same layout as the old profile page (current design/pages/fariz.html):
   - Left (stays in view): photo, key practice areas
   - Right: name & title with contacts and Download profile,
     About, accordions (experience per area, qualifications,
     publications & talks, accolades), Latest Insights carousel
   Data: js/profiles-data.js · js/people-data.js · js/news-data.js
   ========================================================= */
(function () {
  "use strict";

  var PROFILES = window.SKRINE_PROFILES || {};
  var PEOPLE = window.SKRINE_PEOPLE || {};
  var NEWS = (window.SKRINE_NEWS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // design switch keeps the same person
  document.querySelectorAll("[data-switch]").forEach(function (a) { a.href = a.getAttribute("href") + location.search; });

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
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }
  function fmtDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  var directory = {};
  [["partners", "Partners"], ["consultants", "Consultants"]].forEach(function (r) {
    (PEOPLE[r[0]] || []).forEach(function (p) { directory[slugify(p.name)] = { person: p, group: r[1] }; });
  });

  var slug = new URLSearchParams(location.search).get("p") || "";
  var P = PROFILES[slug];

  if (!P) {
    document.querySelector(".pc-left").hidden = true;
    document.querySelector(".pc-right").hidden = true;
    document.getElementById("pcMissing").hidden = false;
    var list = document.getElementById("pcMissingList");
    Object.keys(PROFILES).forEach(function (k) {
      var li = el("li");
      var a = el("a", null, PROFILES[k].name);
      a.href = "profile-classic.html?p=" + encodeURIComponent(k);
      li.appendChild(a);
      list.appendChild(li);
    });
    return;
  }

  var entry = directory[slug] || { person: {}, group: P.role === "Consultant" ? "Consultants" : "Partners" };
  var division = entry.person.division || "";
  document.title = P.name + " | Skrine";

  /* ---------- left: photo + practice areas ---------- */
  var photo = document.getElementById("pcPhoto");
  var img = el("img");
  img.src = photoUrl(entry.person.photo || P.name + ".png");
  img.alt = "Portrait of " + P.name;
  img.addEventListener("error", function () {
    var m = el("span", "pc-monogram", initials(P.name));
    m.setAttribute("aria-hidden", "true");
    img.replaceWith(m);
  });
  photo.appendChild(img);

  // key practice areas sit in the name band
  var areasBox = document.getElementById("pcAreas");
  if (P.keyAreas.length) P.keyAreas.forEach(function (a) { areasBox.querySelector("ul").appendChild(el("li", "pc-tag", a)); });
  else areasBox.remove();

  // client quotes under the photo: Chambers Asia Pacific first, newest first
  (function () {
    var box = document.getElementById("pcSaid");
    var quotes = P.quotes.slice().sort(function (a, b) {
      var ca = /chambers/i.test(a.source) ? 0 : 1, cb = /chambers/i.test(b.source) ? 0 : 1;
      if (ca !== cb) return ca - cb;
      var ya = +(a.source.match(/(20\d\d)(?!.*20\d\d)/) || [0, 0])[1], yb = +(b.source.match(/(20\d\d)(?!.*20\d\d)/) || [0, 0])[1];
      return yb - ya;
    });
    if (!quotes.length) return;
    box.hidden = false;
    var stage = document.getElementById("pcSaidStage");
    var dotsWrap = document.getElementById("pcSaidDots");
    var MAX_DOTS = 8;
    var shown = quotes.slice(0, MAX_DOTS);
    var idx = 0, timer = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dots = shown.map(function (q, i) {
      var d = el("button", "pc-said-dot");
      d.type = "button";
      d.setAttribute("aria-label", "Quote " + (i + 1) + " of " + shown.length);
      d.addEventListener("click", function () { show(i); restart(); });
      dotsWrap.appendChild(d);
      return d;
    });
    if (shown.length < 2) dotsWrap.hidden = true;
    function show(i) {
      idx = (i + shown.length) % shown.length;
      var q = shown[idx];
      stage.textContent = "";
      var bq = el("blockquote", "pc-said-quote" + (q.quote.length > 200 ? " is-long" : ""));
      bq.appendChild(el("p", null, q.quote));
      bq.appendChild(el("cite", null, q.source));
      stage.appendChild(bq);
      dots.forEach(function (d, k) { d.setAttribute("aria-pressed", String(k === idx)); });
    }
    function restart() {
      clearInterval(timer);
      if (!reduce && shown.length > 1) timer = setInterval(function () { show(idx + 1); }, 8000);
    }
    box.addEventListener("mouseenter", function () { clearInterval(timer); });
    box.addEventListener("mouseleave", restart);
    box.addEventListener("focusin", function () { clearInterval(timer); });
    show(0);
    restart();
  })();

  /* ---------- right: identity + contacts ---------- */
  document.getElementById("pcCrumbRole").textContent = entry.group;
  document.getElementById("pcName").textContent = P.name;
  document.getElementById("pcTitle").textContent = P.role + (division ? " · " + division : "");

  var contacts = document.getElementById("pcContacts");
  if (P.phone) {
    var m = P.phone.match(/^([+\d\s]+?)\s*ext\.?\s*(\d+)/i);
    var tel = el("a", "pc-contact");
    tel.href = "tel:" + (m ? m[1].replace(/\s+/g, "") + ",," + m[2] : P.phone.replace(/\s+/g, ""));
    tel.appendChild(el("span", "pc-contact-icon")).appendChild(icon("fa-solid fa-phone"));
    tel.appendChild(el("span", null, P.phone.replace(/\bext\b/, "(ext.") + (m ? ")" : "")));
    contacts.appendChild(tel);
  }
  if (P.email) {
    var mail = el("a", "pc-contact");
    mail.href = "mailto:" + P.email;
    mail.appendChild(el("span", "pc-contact-icon")).appendChild(icon("fa-solid fa-envelope"));
    mail.appendChild(el("span", null, P.email));
    contacts.appendChild(mail);
  }
  // "Download profile": the print stylesheet lays the page out as a clean PDF
  var dl = el("button", "pc-download");
  dl.type = "button";
  dl.appendChild(icon("fa-solid fa-file-pdf"));
  dl.appendChild(document.createTextNode(" Download Profile"));
  dl.addEventListener("click", function () { window.print(); });
  contacts.appendChild(dl);

  /* ---------- about ---------- */
  var about = document.getElementById("pcAboutText");
  if (P.overview.length) P.overview.forEach(function (t) { about.appendChild(el("p", null, t)); });
  else document.getElementById("pcAbout").remove();

  /* ---------- accordion ---------- */
  var acc = document.getElementById("pcAccordion");
  var items = [];

  function bullets(arr, cls) {
    var ul = el("ul", cls || "pc-list");
    arr.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    return ul;
  }
  function addItem(title, build, count) {
    var i = items.length;
    var item = el("div", "pc-acc-item");
    var h = el("h3", "pc-acc-h");
    var btn = el("button", "pc-acc-btn");
    btn.type = "button";
    btn.id = "pc-acc-" + i;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "pc-acc-panel-" + i);
    btn.appendChild(el("span", "pc-acc-no", String(i + 1).padStart(2, "0")));
    btn.appendChild(el("span", "pc-acc-title", title));
    if (count) btn.appendChild(el("span", "pc-acc-count", String(count)));
    btn.appendChild(el("span", "pc-acc-icon"));
    h.appendChild(btn);
    item.appendChild(h);

    var panel = el("div", "pc-acc-panel");
    panel.id = "pc-acc-panel-" + i;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", btn.id);
    var inner = el("div", "pc-acc-inner");
    var content = el("div", "pc-acc-content");
    build(content);
    inner.appendChild(content);
    panel.appendChild(inner);
    item.appendChild(panel);

    btn.addEventListener("click", function () { setOpen(item, btn.getAttribute("aria-expanded") !== "true"); });
    acc.appendChild(item);
    items.push(item);
  }
  function setOpen(item, open) {
    var btn = item.querySelector(".pc-acc-btn");
    btn.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);
  }

  P.experience.forEach(function (e) {
    addItem(e.area, function (c) { c.appendChild(bullets(e.matters, "pc-list pc-list--matters")); }, e.matters.length);
  });

  if (P.credentials.length) {
    var credTitle = P.credentials.some(function (c) { return /affiliation/i.test(c.heading); }) ? "Qualifications & Professional Affiliations" : "Qualifications";
    addItem(credTitle, function (c) {
      var grid = el("div", "pc-cred");
      P.credentials.forEach(function (g) {
        var box = el("div");
        box.appendChild(el("h4", "pc-sub", g.heading));
        box.appendChild(bullets(g.items));
        grid.appendChild(box);
      });
      c.appendChild(grid);
    });
  }

  if (P.talks.length) {
    var tc = P.talks.reduce(function (n, t) { return n + t.items.length; }, 0);
    addItem("Publications & Talks", function (c) {
      P.talks.forEach(function (g) {
        if (g.heading && P.talks.length > 1) c.appendChild(el("h4", "pc-sub", g.heading.replace(/:$/, "")));
        c.appendChild(bullets(g.items));
      });
    }, tc);
  }

  if (P.rankings.length || P.quotes.length) {
    addItem("Accolades", function (c) {
      if (P.rankings.length) c.appendChild(bullets(P.rankings, "pc-list pc-list--awards"));
      if (P.quotes.length) {
        c.appendChild(el("h4", "pc-sub", "What clients say"));
        var qs = el("div", "pc-quotes");
        P.quotes.forEach(function (q) {
          var b = el("blockquote", "pc-quote");
          b.appendChild(el("p", null, q.quote));
          b.appendChild(el("cite", null, q.source));
          qs.appendChild(b);
        });
        c.appendChild(qs);
      }
    }, P.rankings.length + P.quotes.length);
  }

  if (items.length) setOpen(items[0], true);

  /* ---------- latest insights ---------- */
  var mine = NEWS.filter(function (n) { return (n.people || []).indexOf(P.name) > -1 || (entry.person.name && n.people.indexOf(entry.person.name) > -1); });
  // top up with the firm's latest so the row is never sparse
  if (mine.length < 4) mine = mine.concat(NEWS.filter(function (n) { return mine.indexOf(n) === -1; }).slice(0, 4 - mine.length));
  mine = mine.slice(0, 8);
  if (mine.length) {
    var track = document.getElementById("pcTrack");
    mine.forEach(function (n) {
      var li = el("li", "pc-card");
      var a = el("a");
      a.href = "news-events.html";
      var media = el("span", "pc-card-media");
      if (n.image) {
        var im = el("img");
        im.src = /^(https?:)?\/\//.test(n.image) ? n.image : "images/news/" + encodeURIComponent(n.image);
        im.alt = "";
        im.loading = "lazy";
        media.appendChild(im);
      }
      a.appendChild(media);
      a.appendChild(el("span", "pc-card-meta", n.category + " · " + fmtDate(n.date)));
      a.appendChild(el("span", "pc-card-title", n.title));
      li.appendChild(a);
      track.appendChild(li);
    });
    document.getElementById("pcInsights").hidden = false;
    function step(dir) {
      var card = track.querySelector(".pc-card");
      var w = card ? card.getBoundingClientRect().width + 20 : 300;
      track.scrollBy({ left: dir * w, behavior: "smooth" });
    }
    var prev = document.getElementById("pcPrev");
    var next = document.getElementById("pcNext");
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    function arrows() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    }
    track.addEventListener("scroll", arrows, { passive: true });
    window.addEventListener("resize", arrows);
    arrows();
  }

  // print: open every accordion so the PDF has the full profile
  var printState = [];
  window.addEventListener("beforeprint", function () {
    printState = items.map(function (it) { return it.classList.contains("is-open"); });
    items.forEach(function (it) { setOpen(it, true); });
  });
  window.addEventListener("afterprint", function () {
    items.forEach(function (it, i) { setOpen(it, printState[i]); });
  });
})();
