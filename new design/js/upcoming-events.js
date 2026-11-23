/* =========================================================
   SKRINE — Home: Upcoming Events
   Replaces the homepage's News & Events. Shown only while there is
   at least one event that hasn't finished; otherwise the whole
   section is hidden. Events drop off by themselves once their end
   date (or date) has passed.
     1 event     a feature banner
     2-3 events  cards side by side
     4+ events   the next three, plus "See all upcoming events"
   Each event: date block, a countdown ("In 12 days"), format, time
   and place, speaker photos, Register (when there is a link) and
   Add to calendar (downloads an .ics file).

   Data: SKRINE_UPCOMING in js/news-data.js (format described there);
   speakers are matched to js/people-data.js for their photos.

   REVIEW AID: there are no real upcoming events yet, so the
   "Events preview" pill (bottom left) swaps in sample events:
     Live (the real data) · None · 1 · 3
   ?events=live|0|1|3 picks one; remembered for the visit.
   Remove the pill and SAMPLES once the design is chosen.

   Load after js/main.js, js/news-data.js and js/people-data.js.
   ========================================================= */
(function () {
  "use strict";

  var section = document.getElementById("events");
  var board = document.getElementById("upcomingEvents");
  if (!section || !board) return;

  var ROOT = "new%20design/";
  var PHOTO_DIR = "current%20design/images/people/";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var ALL_EVENTS = ROOT + "news-events.html#upcoming";
  var FX = window.SkrineFX || { observeReveal: function (n) { n.classList.add("is-visible"); }, attachTilt: function () {} };

  /* ---------- dates ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function dateOf(iso) { var p = iso.split("-"); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function addDays(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return isoOf(d); }
  var TODAY = isoOf(new Date());

  function countdown(e) {
    var start = dateOf(e.date), today = dateOf(TODAY);
    var days = Math.round((start - today) / 86400000);
    if (days < 0) return "Happening now";          // started, not yet ended
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return "In " + days + " days";
  }
  function dateRange(e) {
    var a = dateOf(e.date);
    var s = DAYS[a.getDay()] + ", " + a.getDate() + " " + MONTHS[a.getMonth()] + " " + a.getFullYear();
    if (e.endDate && e.endDate !== e.date) {
      var b = dateOf(e.endDate);
      s = a.getDate() + (a.getMonth() !== b.getMonth() ? " " + MONTHS[a.getMonth()] : "") + " – " + b.getDate() + " " + MONTHS[b.getMonth()] + " " + b.getFullYear();
    }
    return s;
  }

  /* ---------- sample events (review only; dates kept in the future) ---------- */
  var SAMPLES = [
    {
      sample: true,
      title: "Employment Law Update 2027: The Starting Basic Salary Guidelines and What Employers Should Do Now",
      date: addDays(12),
      time: "9.00am – 12.30pm",
      location: "Skrine, Kuala Lumpur",
      type: "Seminar",
      people: ["Foo Siew Li", "Selvamalar Alagaratnam"],
      summary: "A practical half-day briefing on the new salary guidelines announced in the 2027 Budget: who they cover, the timeline to June 2027, and the steps HR and legal teams should take now.",
      register: "#"
    },
    {
      sample: true,
      title: "Cross-Border Insolvency Act 2026: A Practical Briefing for Creditors and Insolvency Practitioners",
      date: addDays(33),
      time: "3.00pm – 4.30pm",
      location: "Online",
      type: "Webinar",
      people: ["Sharon Chong Tze Ying", "Lee Ai Hsian"],
      summary: "How foreign proceedings are recognised under the new Act and Order 88A, and what it means for creditors with assets in Malaysia.",
      register: "#"
    },
    {
      sample: true,
      title: "Malaysia M&A Outlook 2027",
      date: addDays(61),
      endDate: addDays(62),
      time: "9.00am – 5.00pm",
      location: "Kuala Lumpur Convention Centre",
      type: "Conference",
      people: ["To' Puan Janet Looi", "Tan Wei Liang"],
      summary: "Skrine partners join regional deal-makers to discuss the year ahead in public M&A, private equity and cross-border joint ventures.",
      register: ""
    }
  ];

  /* ---------- speakers: photo from the People data ---------- */
  var PEOPLE = window.SKRINE_PEOPLE || {};
  function key(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function person(name) {
    var k = key(name), found = null;
    ["partners", "consultants", "seniorAssociates", "associates"].some(function (r) {
      return (PEOPLE[r] || []).some(function (p) {
        var pk = key(p.name);
        if (pk === k || pk.indexOf(k) === 0 || k.indexOf(pk) === 0) { found = p; return true; }
        return false;
      });
    });
    return {
      name: found ? found.name : name,
      photo: found && (found.photo || found.name + ".png") ? PHOTO_DIR + encodeURIComponent(found.photo || found.name + ".png") : null,
      href: ROOT + "people.html?q=" + encodeURIComponent(found ? found.name : name)
    };
  }
  function initials(name) {
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var w = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (x) { return !skip[x.toLowerCase()]; });
    return (((w[0] || "")[0] || "") + ((w[1] || "")[0] || "")).toUpperCase();
  }

  /* ---------- Add to calendar (.ics) ---------- */
  function icsTime(t, which) {
    // "9.00am – 12.30pm" -> "090000" for start (which=0) or end (which=1); null if not readable
    var m = String(t || "").match(/(\d{1,2})[.:](\d{2})\s*(am|pm)/gi);
    if (!m || !m[which]) return null;
    var x = m[which].match(/(\d{1,2})[.:](\d{2})\s*(am|pm)/i);
    var h = Number(x[1]) % 12 + (x[3].toLowerCase() === "pm" ? 12 : 0);
    return pad(h) + x[2] + "00";
  }
  function icsEscape(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
  function icsHref(e) {
    var d1 = e.date.replace(/-/g, ""), d2 = (e.endDate || e.date).replace(/-/g, "");
    var t1 = icsTime(e.time, 0), t2 = icsTime(e.time, 1);
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Skrine//Events//EN", "BEGIN:VEVENT",
      "UID:" + d1 + "-" + key(e.title).replace(/ /g, "-").slice(0, 40) + "@skrine.com",
      "DTSTAMP:" + isoOf(new Date()).replace(/-/g, "") + "T000000Z"];
    if (t1) {
      lines.push("DTSTART;TZID=Asia/Kuala_Lumpur:" + d1 + "T" + t1);
      lines.push("DTEND;TZID=Asia/Kuala_Lumpur:" + d2 + "T" + (t2 || t1));
    } else {   // no readable time: an all-day event
      var end = dateOf(e.endDate || e.date); end.setDate(end.getDate() + 1);
      lines.push("DTSTART;VALUE=DATE:" + d1);
      lines.push("DTEND;VALUE=DATE:" + isoOf(end).replace(/-/g, ""));
    }
    lines.push("SUMMARY:" + icsEscape(e.title));
    if (e.location) lines.push("LOCATION:" + icsEscape(e.location));
    if (e.summary) lines.push("DESCRIPTION:" + icsEscape(e.summary + (e.register && e.register !== "#" ? "\nRegister: " + e.register : "")));
    lines.push("END:VEVENT", "END:VCALENDAR");
    return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
  }
  function icsName(e) { return "skrine-" + key(e.title).replace(/ /g, "-").slice(0, 50) + ".ics"; }

  /* ---------- markup ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function arrow() { return ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>'; }
  function dateBlock(e) {
    var d = dateOf(e.date);
    return '<span class="ue-date" aria-hidden="true"><b>' + d.getDate() + "</b>" + MONTHS[d.getMonth()] + "<small>" + d.getFullYear() + "</small></span>";
  }
  function badges(e) {
    var online = /online|webinar/i.test((e.location || "") + " " + (e.type || ""));
    return '<span class="ue-badges">' +
      (e.type ? '<span class="ue-type">' + esc(e.type) + "</span>" : "") +
      '<span class="ue-mode">' + (online ? '<i class="fa-solid fa-video" aria-hidden="true"></i> Online' : '<i class="fa-solid fa-location-dot" aria-hidden="true"></i> In person') + "</span>" +
      (e.sample ? '<span class="ue-sample">Sample</span>' : "") +
      "</span>";
  }
  function speakers(e, big) {
    if (!e.people || !e.people.length) return "";
    var h = '<span class="ue-speakers' + (big ? " ue-speakers--big" : "") + '"><span class="ue-label">Speakers</span><span class="ue-people">';
    e.people.forEach(function (n) {
      var p = person(n);
      h += '<a class="ue-person" href="' + p.href + '">' +
        '<span class="ue-avatar">' + (p.photo ? '<img src="' + p.photo + '" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode(\'' + initials(p.name) + '\'))">' : esc(initials(p.name))) + "</span>" +
        (big ? '<span class="ue-person-name">' + esc(p.name) + "</span>" : "") + "</a>";
    });
    if (!big) h += '<span class="ue-people-names">' + esc(e.people.map(function (n) { return person(n).name; }).join(", ")) + "</span>";
    return h + "</span></span>";
  }
  function actions(e) {
    var h = '<span class="ue-actions">';
    if (e.register) h += '<a class="btn btn--solid ue-register" href="' + esc(e.register) + '"' + (/^https?:/.test(e.register) ? ' target="_blank" rel="noopener"' : "") + ">Register now" + arrow() + "</a>";
    else h += '<a class="btn btn--outline" href="' + ALL_EVENTS + '">Event details' + arrow() + "</a>";
    h += '<a class="ue-cal" href="' + icsHref(e) + '" download="' + icsName(e) + '"><i class="fa-regular fa-calendar-plus" aria-hidden="true"></i> Add to calendar</a>';
    return h + "</span>";
  }
  function when(e) {
    return '<span class="ue-when"><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + esc(dateRange(e)) + (e.time ? " · " + esc(e.time) : "") +
      (e.location ? '<br><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' + esc(e.location) : "") + "</span>";
  }

  function feature(e) {
    return '<article class="ue-feature reveal">' +
      '<div class="ue-feature-side">' + dateBlock(e) + '<span class="ue-countdown">' + esc(countdown(e)) + "</span></div>" +
      '<div class="ue-feature-body">' +
        badges(e) +
        '<h3 class="ue-title">' + esc(e.title) + "</h3>" +
        when(e) +
        (e.summary ? '<p class="ue-summary">' + esc(e.summary) + "</p>" : "") +
        speakers(e, true) +
        actions(e) +
      "</div></article>";
  }
  function card(e) {
    return '<article class="ue-card reveal" data-tilt>' +
      '<div class="ue-card-top">' + dateBlock(e) + '<span class="ue-countdown">' + esc(countdown(e)) + "</span></div>" +
      badges(e) +
      '<h3 class="ue-title">' + esc(e.title) + "</h3>" +
      when(e) +
      speakers(e, false) +
      actions(e) +
      "</article>";
  }

  /* ---------- render ---------- */
  function render(list) {
    var events = list
      .filter(function (e) { return e && e.date && (e.endDate || e.date) >= TODAY; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    section.hidden = !events.length;      // nothing coming up: no section at all
    board.textContent = "";
    if (!events.length) return;

    var shown = events.slice(0, 3);
    var html = shown.length === 1 ? feature(shown[0]) : '<div class="ue-grid ue-grid--' + shown.length + '">' + shown.map(card).join("") + "</div>";
    if (events.length > 3) {
      html += '<div class="section-cta reveal"><a href="' + ALL_EVENTS + '" class="btn btn--outline">See all ' + events.length + " upcoming events" + arrow() + "</a></div>";
    }
    board.innerHTML = html;
    board.querySelectorAll(".reveal").forEach(function (n) { FX.observeReveal(n); });
    board.querySelectorAll("[data-tilt]").forEach(function (n) { FX.attachTilt(n); });
  }

  /* ---------- review pill: Live · None · 1 · 3 ---------- */
  var KEY = "skrine-events-preview";
  var MODES = ["live", "0", "1", "3"];
  var LABELS = { live: "Live", "0": "None", "1": "1", "3": "3" };
  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return MODES.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  var asked = new URLSearchParams(location.search).get("events");
  if (MODES.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);
  var mode = asked || recall() || "1";

  function dataFor(m) {
    if (m === "live") return window.SKRINE_UPCOMING || [];
    return SAMPLES.slice(0, Number(m));
  }

  var pill = document.createElement("nav");
  pill.className = "ue-switch";
  pill.setAttribute("aria-label", "Upcoming events preview (review)");
  var lab = document.createElement("span");
  lab.className = "ue-switch-label";
  lab.textContent = "Events preview";
  pill.appendChild(lab);
  var btns = MODES.map(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = LABELS[m];
    b.title = m === "live" ? "The real upcoming events (none right now)" : m === "0" ? "No events: the section is hidden" : m + " sample event" + (m === "1" ? "" : "s");
    b.addEventListener("click", function () {
      remember(m);
      setMode(m);
      if (!section.hidden) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    pill.appendChild(b);
    return b;
  });
  document.body.appendChild(pill);

  function setMode(m) {
    mode = m;
    btns.forEach(function (b, i) { b.setAttribute("aria-pressed", String(MODES[i] === m)); });
    render(dataFor(m));
  }
  setMode(mode);
})();
