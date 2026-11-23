/* =========================================================
   SKRINE — Home: Upcoming Events, layout B + the A / B switch (review aid)
   The section, its data and its show / hide rule belong to home.js
   (layout A: the next event featured, "Also coming up" beside it).
   Sample events come from js/events-demo.js ("Test events" pill,
   bottom left). This file adds a second way to show the same events:
     B  one event: a feature banner; two or three: cards side by side;
        four or more: the next three plus "See all upcoming events".
        Countdown, format, CPD, why attend, speaker photos,
        Register and Add to calendar (.ics).
   and the "Layout A / B" switch in the section to compare them.
   ?evlayout=a|b picks one; remembered for the visit.

   Data: SKRINE_UPCOMING (js/news-data.js, or the samples from
   js/events-demo.js); speaker photos from js/people-data.js.
   Load after js/main.js, js/news-data.js, js/events-demo.js and
   js/people-data.js. With no upcoming events it draws nothing:
   home.js keeps the whole section hidden.
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
  var TODAY = isoOf(new Date());

  function countdown(e) {
    var days = Math.round((dateOf(e.date) - dateOf(TODAY)) / 86400000);
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

  /* ---------- links: same rule as home.js (a full URL as is, a page of this site from new design/) ---------- */
  function registerHref(e) {
    if (!e.register) return "";
    return /^(https?:)?\/\//.test(e.register) || e.register.charAt(0) === "#" ? e.register : ROOT + e.register;
  }

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
        // "Leela Devi Baskaran" and "Leela Baskaran" are the same person: all of the shorter name's words appear in the longer
        var a = pk.split(" "), b = k.split(" ");
        var shorter = a.length <= b.length ? a : b, longer = a.length <= b.length ? b : a;
        if (pk === k || pk.indexOf(k) === 0 || k.indexOf(pk) === 0 ||
            (shorter.length > 1 && shorter.every(function (w) { return longer.indexOf(w) > -1; }))) { found = p; return true; }
        return false;
      });
    });
    return {
      name: found ? found.name : name,
      photo: found ? PHOTO_DIR + encodeURIComponent(found.photo || found.name + ".png") : null,
      href: ROOT + "people.html?q=" + encodeURIComponent(found ? found.name : name)
    };
  }
  function initials(name) {
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var w = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (x) { return !skip[x.toLowerCase()]; });
    return (((w[0] || "")[0] || "") + ((w[1] || "")[0] || "")).toUpperCase();
  }

  /* ---------- Add to calendar (.ics) ---------- */
  var TIME_RE = /(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)/gi;
  function icsTime(t, which) {
    // "9.00am – 12.30pm" / "9:00 am – 12:30 pm" -> "090000" (which=0) / "123000" (which=1); null if not readable
    var all = String(t || "").match(TIME_RE);
    if (!all || !all[which]) return null;
    var x = all[which].match(/(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)/i);
    var h = Number(x[1]) % 12 + (x[3].toLowerCase() === "pm" ? 12 : 0);
    return pad(h) + (x[2] || "00") + "00";
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
    var reg = registerHref(e);
    if (e.summary) lines.push("DESCRIPTION:" + icsEscape(e.summary + (/^https?:/.test(reg) ? "\nRegister: " + reg : "")));
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
    var online = /online|webinar|virtual/i.test((e.format || "") + " " + (e.location || "") + " " + (e.type || ""));
    var mode = e.format && !/webinar/i.test(e.format) ? e.format : online ? "Online" : "In person";
    var showType = e.type && key(e.type) !== key(mode);
    return '<span class="ue-badges">' +
      (showType ? '<span class="ue-type">' + esc(e.type) + "</span>" : "") +
      '<span class="ue-mode"><i class="fa-solid ' + (online ? "fa-video" : "fa-location-dot") + '" aria-hidden="true"></i> ' + esc(online && !e.format ? "Online" : (/webinar/i.test(e.format || "") ? "Online" : mode)) + "</span>" +
      (e.cpd ? '<span class="ue-cpd"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i> ' + esc(e.cpd) + "</span>" : "") +
      (e.sample ? '<span class="ue-sample">Sample</span>' : "") +
      "</span>";
  }
  function why(e, max) {
    if (!e.takeaways || !e.takeaways.length) return "";
    return '<span class="ue-why"><span class="ue-label">Why attend</span><ul>' +
      e.takeaways.slice(0, max).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></span>";
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
    var reg = registerHref(e);
    var h = '<span class="ue-actions">';
    if (reg) h += '<a class="btn btn--solid ue-register" href="' + esc(reg) + '"' + (/^https?:/.test(reg) ? ' target="_blank" rel="noopener"' : "") + ">Register now" + arrow() + "</a>";
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
        why(e, 3) +
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

  /* ---------- render layout B ---------- */
  var events = (window.SKRINE_UPCOMING || [])
    .filter(function (e) { return e && e.date && (e.endDate || e.date) >= TODAY; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  if (events.length) {
    var shown = events.slice(0, 3);
    var html = shown.length === 1 ? feature(shown[0]) : '<div class="ue-grid ue-grid--' + shown.length + '">' + shown.map(card).join("") + "</div>";
    if (events.length > 3) {
      html += '<div class="section-cta reveal"><a href="' + ALL_EVENTS + '" class="btn btn--outline">See all ' + events.length + " upcoming events" + arrow() + "</a></div>";
    }
    board.innerHTML = html;
    board.querySelectorAll(".reveal").forEach(function (n) { FX.observeReveal(n); });
    board.querySelectorAll("[data-tilt]").forEach(function (n) { FX.attachTilt(n); });
  }

  /* ---------- the A / B switch (review aid) ---------- */
  var KEY = "skrine-events-layout";
  var LAYOUTS = ["a", "b"];
  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return LAYOUTS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  var asked = (new URLSearchParams(location.search).get("evlayout") || "").toLowerCase();
  if (LAYOUTS.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);

  var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-ev-layout]"));
  function show(layout, fromUser) {
    section.querySelectorAll("[data-ev-option]").forEach(function (box) {
      var on = box.getAttribute("data-ev-option") === layout;
      box.hidden = !on;
      // shown after the page loaded: reveal its content straight away
      if (on && fromUser) {
        if (box.classList.contains("reveal")) box.classList.add("is-visible");
        box.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
      }
    });
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-ev-layout") === layout)); });
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { var l = b.getAttribute("data-ev-layout"); remember(l); show(l, true); });
  });
  show(asked || recall() || "a", false);
})();
