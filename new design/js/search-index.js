/* =========================================================
   SKRINE — Site search: the index and the matching
   Builds one list from the site's own data files (people, practice areas,
   sectors, alerts, news, publications, Life at Skrine stories,
   open roles) plus the main pages, and ranks matches for a query.
   Used by the results page (search.html, js/search.js) and the suggestions
   under the header search bar (js/main.js loads this file when needed).
   Links are relative to the "new design" folder; js/main.js adds the
   folder in front when the home page shows a suggestion.
   ========================================================= */
(function () {
  "use strict";

  // in the order the results page shows the groups
  var TYPES = {
    person:      { label: "People",         one: "Person",         icon: "fa-regular fa-user" },
    practice:    { label: "Practice areas", one: "Practice area",  icon: "fa-solid fa-scale-balanced" },
    sector:      { label: "Sectors",        one: "Sector",         icon: "fa-solid fa-industry" },
    page:        { label: "Pages",          one: "Page",           icon: "fa-regular fa-file-lines" },
    alert:       { label: "Alerts",         one: "Alert",          icon: "fa-regular fa-bell" },
    publication: { label: "Publications",   one: "Publication",    icon: "fa-solid fa-book-open" },
    news:        { label: "News & events",  one: "News",           icon: "fa-regular fa-newspaper" },
    life:        { label: "Life at Skrine", one: "Life at Skrine", icon: "fa-solid fa-people-group" },
    job:         { label: "Careers",        one: "Open role",      icon: "fa-solid fa-briefcase" },
  };
  // ranking lift for the kinds of result people most often look for
  var BOOST = { page: 20, person: 20, practice: 20, sector: 18, job: 12 };

  // the main pages, with extra words people might search for
  var PAGES = [
    ["Home", "../index.html", "Skrine — Malaysia's full-service law firm with global insight and local expertise.", "home skrine advocates solicitors awards rankings network lex mundi deals"],
    ["People", "people.html", "Meet Skrine's partners, consultants and associates.", "lawyers team partners consultants associates directory"],
    ["Practice Areas", "capabilities.html", "Skrine's practice areas — litigation, corporate, intellectual property and more.", "capabilities services expertise"],
    ["Sectors", "sectors.html", "The sectors Skrine serves — aviation, financial institutions, energy and more.", "industries capabilities services"],
    ["Alerts", "alerts.html", "Legal alerts from Skrine on developments in Malaysian law and regulation.", "insights legal updates newsletter subscribe"],
    ["Publications", "publications.html", "Chapters and guides by Skrine lawyers in leading international legal publications.", "insights books guides chapters"],
    ["News & Events", "news-events.html", "The latest news from Skrine, and upcoming events our lawyers are speaking at.", "insights news events press"],
    ["Upcoming events", "news-events.html#upcoming", "Events and talks Skrine lawyers are speaking at.", "seminar webinar talk conference"],
    ["Our Story", "our-story.html", "Founded on 1 May 1963, Skrine is guided by one belief: integrity is the cornerstone of the practice of law.", "about history founded 1963 values integrity firm"],
    ["Careers", "careers.html", "Life at Skrine, and how to join us as a lawyer, pupil, attachment student or member of our office team.", "jobs vacancies join us pupillage chambering internship attachment recruitment hiring work"],
    ["Professional Development", "professional-development.html", "Skrine's Professional Development programme: at least two legal talks a month, CPD accredited by the Bar Council Malaysia.", "training cpd learning talks"],
    ["Social Responsibility", "social-responsibility.html", "Skrine for the Greater Good: our social responsibility initiatives, from Skrine x Project ID to the Pertiwi Soup Kitchen.", "csr pro bono community charity volunteering"],
    ["Sports & Social", "sports-social.html", "Company trips, family days, lawyers' socials, sport and the Annual Dinner: life outside the office at Skrine.", "life at skrine events trips dinner"],
    ["Skrine Dragons", "skrine-dragons.html", "The Skrine Dragons: the only dragon boat team backed by a legal firm in Malaysia, racing since 2005.", "dragon boat team sport"],
    ["Contact", "contact.html", "Contact Skrine: general enquiries, legal support and patent enquiries, and directions to our office at Wisma UOA Damansara, Kuala Lumpur.", "address office location phone email enquiry map directions"],
  ];

  var LIFE_LABEL = { dragons: "Skrine Dragons", socials: "Sports & Social", development: "Professional Development", responsibility: "Social Responsibility", awards: "Skrine Awards" };
  var PEOPLE_GROUPS = [["partners", "Partner", true], ["consultants", "Consultant", true], ["seniorAssociates", "Senior Associate", false], ["associates", "Associate", false]];
  var STOP = { the: 1, of: 1, a: 1, an: 1, in: 1, on: 1, for: 1, to: 1, at: 1, by: 1, with: 1, is: 1 };

  /* ---------- text ---------- */
  // lower case, no accents or apostrophes, "&" between words read as "and", words split by spaces
  function norm(s) {
    return " " + String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "")
      .replace(/\s&\s/g, " and ").replace(/[^a-z0-9&]+/g, " ").trim() + " ";
  }
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function itemSlug(s) { return slugify(s).slice(0, 80).replace(/-$/, ""); } // same rule as js/article-common.js
  function words(list) { return list.filter(Boolean).join(" "); }
  function first(a) { return Array.isArray(a) ? a[0] || "" : a || ""; }

  /* ---------- the index ---------- */
  var INDEX = null;

  function add(list, type, o) {
    o.type = type;
    o._t = norm(o.title);
    o._k = norm(o.keys);
    o._b = norm(o.text);
    o._year = o.date ? Number(o.date.slice(0, 4)) : 0;
    list.push(o);
  }

  function build() {
    var W = window, out = [];

    PAGES.forEach(function (p) { add(out, "page", { title: p[0], href: p[1], text: p[2], keys: p[3] }); });

    var people = W.SKRINE_PEOPLE || {};
    PEOPLE_GROUPS.forEach(function (g) {
      (people[g[0]] || []).forEach(function (p) {
        add(out, "person", {
          title: p.name,
          meta: g[1] + (p.division ? " · " + p.division : ""),
          href: g[2] ? "profile.html?p=" + encodeURIComponent(slugify(p.name)) : "people.html?q=" + encodeURIComponent(p.name),
          image: /^(https?:)?\/\//.test(p.photo || "") ? p.photo : "../current design/images/people/" + encodeURIComponent(p.photo || p.name + ".png"),
          keys: words([g[1], p.division]),
          text: [].concat(p.areas || [], p.keyAreas || []).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).join(" · "),
        });
      });
    });

    var practices = W.SKRINE_PRACTICES || [];
    var topNames = {};
    practices.forEach(function (a) { topNames[norm(a.title)] = 1; });
    practices.forEach(function (a) {
      // related services, leaving out ones that are also a practice area of their own
      var related = (a.related || []).filter(function (r) { return !topNames[norm(r.name)]; });
      add(out, "practice", {
        title: a.title,
        href: "practice-area.html?area=" + encodeURIComponent(a.slug),
        keys: words(related.map(function (r) { return r.name; })),
        text: words([].concat(a.desc || [])),
        snippet: first(a.desc),
      });
      related.forEach(function (r) {
        add(out, "practice", {
          title: r.name,
          meta: "Part of " + a.title,
          href: "practice-area.html?area=" + encodeURIComponent(a.slug) + "#rel-" + r.slug,
          keys: a.title,
          text: words([].concat(r.intro || [], r.points || [])),
          snippet: first(r.intro),
          _sub: true,
        });
      });
    });

    (W.SKRINE_SECTORS || []).forEach(function (s) {
      add(out, "sector", {
        title: s.title,
        href: "sector.html?sector=" + encodeURIComponent(s.slug),
        text: words([].concat(s.desc || [])),
        snippet: first(s.desc),
      });
    });

    var alertsFull = W.SKRINE_ALERTS_FULL || {};
    (W.SKRINE_ALERTS || []).forEach(function (a) {
      var s = itemSlug(a.title);
      add(out, "alert", {
        title: a.title,
        date: a.date,
        meta: a.label || a.topic || "",
        href: alertsFull[s] ? "alert.html?a=" + encodeURIComponent(s) : "alerts.html?q=" + encodeURIComponent(a.title),
        keys: words([a.label, a.topic, a.practice, a.authors]),
        text: a.excerpt,
      });
    });

    var newsFull = W.SKRINE_NEWS_FULL || {};
    (W.SKRINE_NEWS || []).forEach(function (n) {
      var s = itemSlug(n.title);
      add(out, "news", {
        title: n.title,
        date: n.date,
        meta: n.category,
        href: newsFull[s] ? "news.html?n=" + encodeURIComponent(s) : "news-events.html?q=" + encodeURIComponent(n.title),
        image: n.image ? (/^(https?:)?\/\//.test(n.image) ? n.image : "images/news/" + n.image) : null,
        keys: words([n.category].concat(n.people || [])),
        text: n.summary,
      });
    });

    (W.SKRINE_PUBLICATIONS || []).forEach(function (p) {
      add(out, "publication", {
        title: p.title,
        date: p.date,
        meta: p.publisher || "",
        href: "publications.html?q=" + encodeURIComponent(p.title),
        image: p.cover ? (/^(https?:)?\/\//.test(p.cover) ? p.cover : "images/publications/" + p.cover) : null,
        keys: words([p.publisher, p.topic].concat(p.authors || [])),
        text: p.summary,
      });
    });

    var life = W.SKRINE_LIFE || {};
    Object.keys(life).forEach(function (k) {
      (life[k] || []).forEach(function (it) {
        if (!it.slug) return;
        add(out, "life", {
          title: it.title,
          date: it.date,
          meta: LIFE_LABEL[k] || "",
          href: "life-story.html?n=" + encodeURIComponent(it.slug),
          image: it.image || null,
          keys: LIFE_LABEL[k] || "",
          text: "",
        });
      });
    });

    (W.SKRINE_JOBS || []).forEach(function (j) {
      add(out, "job", {
        title: j.title,
        meta: j.group + (j.location ? " · " + j.location : ""),
        href: "job.html?j=" + encodeURIComponent(j.slug),
        keys: words(["career job vacancy hiring", j.group]),
        text: words([].concat(j.intro || [], (j.sections || []).map(function (s) { return s.heading + " " + (s.items || []).join(" "); }))),
        snippet: first(j.intro),
      });
    });

    return out;
  }

  /* ---------- matching ---------- */
  function tokens(q) {
    var all = norm(q).trim().split(" ").filter(Boolean);
    var kept = all.filter(function (t) { return !STOP[t] && t !== "and"; });
    return kept.length ? kept : all;
  }

  // every word of the query must start a word somewhere in the item
  function score(it, toks, phrase, year) {
    var s = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = " " + toks[i];
      if (it._t.indexOf(t) > -1) s += 10;
      else if (it._k.indexOf(t) > -1) s += 4;
      else if (it._b.indexOf(t) > -1) s += 1;
      else return 0;
    }
    var title = it._t.trim();
    if (title === phrase) s += 80;
    else if (title.indexOf(phrase) === 0) s += 30;
    else if (it._t.indexOf(" " + phrase) > -1) s += 25;
    if (toks.every(function (t) { return it._t.indexOf(" " + t) > -1; })) s += 20;
    s += BOOST[it.type] || 0;
    if (it._sub) s -= 4;
    if (it._year) s += Math.max(0, 4 - (year - it._year)); // newer items first among equals
    return s;
  }

  function search(q) {
    if (!INDEX) INDEX = build();
    var toks = tokens(q);
    if (!toks.length) return [];
    var phrase = norm(q).trim();
    var year = new Date().getFullYear();
    var hits = [];
    INDEX.forEach(function (it) {
      var s = score(it, toks, phrase, year);
      if (s) hits.push({ item: it, score: s });
    });
    hits.sort(function (a, b) { return b.score - a.score || (b.item.date || "").localeCompare(a.item.date || ""); });
    return hits.map(function (h) { return h.item; });
  }

  /* ---------- showing a match ---------- */
  // regular expression for the query's words, to mark them in titles and snippets
  function marker(q) {
    var toks = tokens(q).map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    return toks.length ? new RegExp("(^|[^A-Za-z0-9])(" + toks.join("|") + ")", "gi") : null;
  }

  // append text to a node with the query's words wrapped in <mark>
  function highlight(node, text, re) {
    text = String(text || "");
    if (!re) { node.appendChild(document.createTextNode(text)); return node; }
    var last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      var start = m.index + m[1].length;
      if (start > last) node.appendChild(document.createTextNode(text.slice(last, start)));
      var mk = document.createElement("mark");
      mk.textContent = m[2];
      node.appendChild(mk);
      last = start + m[2].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
    return node;
  }

  // a short piece of the item's text around the first matching word
  function snippet(it, q, len) {
    len = len || 180;
    var text = String(it.snippet && !it.text ? it.snippet : it.text || it.snippet || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    var re = marker(q);
    var m = re && (re.lastIndex = 0, re.exec(text));
    var at = m ? m.index + m[1].length : 0;
    if (!m && it.snippet) text = String(it.snippet).replace(/\s+/g, " ").trim();
    if (text.length <= len) return text;
    var from = Math.max(0, at - Math.round(len / 3));
    if (from > 0) { var sp = text.indexOf(" ", from); from = sp > -1 && sp < at ? sp + 1 : from; }
    var cut = text.slice(from, from + len);
    var end = cut.lastIndexOf(" ");
    if (from + len < text.length && end > len * 0.6) cut = cut.slice(0, end);
    return (from > 0 ? "… " : "") + cut + (from + cut.length < text.length ? " …" : "");
  }

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function shortDate(iso) { var p = String(iso).split("-"); return p.length < 3 ? "" : Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }

  window.SkrineSearch = {
    TYPES: TYPES,
    search: search,
    marker: marker,
    highlight: highlight,
    snippet: snippet,
    shortDate: shortDate,
    reset: function () { INDEX = null; },
  };
})();
