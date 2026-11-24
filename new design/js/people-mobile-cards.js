/* =========================================================
   SKRINE — People: partner practice areas on phones (review aid)
   On laptops the partner cards show their practice areas on hover
   (Layout 1 flips, Layout 2 fades). Phones have no hover, so this
   adds three ways to show them, picked with the "Mobile cards" pill
   (only shown on phone-sized screens, 640 px and below):
     1  Tap       first tap plays the flip / fade, second tap opens the profile
     2  List      one partner per row: photo, name, and up to three chips
     3  Sheet     a tap slides up a panel with every practice area
   (An earlier "Line" option was dropped after review and the rest
   renumbered 1 to 3.)
   ?mcard=1..3 in the address picks one; the choice is remembered for
   the visit (sessionStorage), across Layout 1 and Layout 2.
   Laptop and desktop are unchanged: everything here is scoped to
   phone widths in css/people-mobile-cards.css.

   Load after js/people.js (it uses the cards and practice areas
   people.js has already built: SKRINE_PEOPLE.partners[i]._el / ._areas).
   ========================================================= */
(function () {
  "use strict";

  var PEOPLE = window.SKRINE_PEOPLE;
  if (!PEOPLE || !PEOPLE.partners) return;
  var partners = PEOPLE.partners.filter(function (p) { return p._el; });
  if (!partners.length) return;

  var html = document.documentElement;
  var phone = window.matchMedia("(max-width: 640px)");
  var OPTIONS = ["1", "2", "3"];
  var NAMES = { "1": "Tap", "2": "List", "3": "Sheet" };
  var KEY = "skrine-mcard-v2";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el("i", name); i.setAttribute("aria-hidden", "true"); return i; }
  function initials(name) {
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (w) { return !skip[w.toLowerCase()]; });
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }
  function photoOf(card) {
    var img = card.querySelector(".photo-card-img");
    return img ? img.currentSrc || img.src : "";
  }
  function roleLine(p) { return "Partner" + (p.division ? " · " + p.division : ""); }

  /* ---------- extras on every partner card (each is shown by one option only) ---------- */
  partners.forEach(function (p) {
    var card = p._el;
    var areas = p._areas || [];

    // 1: a small hint on the photo that a tap shows more
    var front = card.querySelector(".photo-card-inner");
    if (front && areas.length) {
      var hint = el("span", "mc-hint");
      hint.setAttribute("aria-hidden", "true");
      hint.appendChild(document.createTextNode("Practice areas "));
      hint.appendChild(icon("fa-solid fa-plus"));
      front.appendChild(hint);
    }

    // 2: a row for the list view
    var row = el("span", "mc-row");
    var ph = el("span", "mc-row-photo");
    var src = photoOf(card);
    if (src) {
      var img = el("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { img.replaceWith(el("span", "mc-initials", initials(p.name))); });
      ph.appendChild(img);
    } else {
      ph.appendChild(el("span", "mc-initials", initials(p.name)));
    }
    row.appendChild(ph);
    var text = el("span", "mc-row-text");
    text.appendChild(el("span", "mc-row-name", p.name));
    text.appendChild(el("span", "mc-row-role", roleLine(p)));
    if (areas.length) {
      var chips = el("span", "mc-chips");
      areas.slice(0, 3).forEach(function (a) { chips.appendChild(el("span", null, a)); });
      if (areas.length > 3) chips.appendChild(el("span", "mc-more", "+" + (areas.length - 3)));
      text.appendChild(chips);
    }
    row.appendChild(text);
    if (card.tagName === "A") row.appendChild(icon("fa-solid fa-chevron-right mc-row-go"));
    card.appendChild(row);
  });

  /* ---------- 3: the bottom sheet ---------- */
  var sheet = el("div", "mc-sheet");
  sheet.hidden = true;
  var backdrop = el("div", "mc-sheet-backdrop");
  var panel = el("div", "mc-sheet-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", "mcSheetName");
  panel.tabIndex = -1;
  sheet.appendChild(backdrop);
  sheet.appendChild(panel);
  document.body.appendChild(sheet);
  var lastFocus = null;

  function openSheet(p) {
    var card = p._el;
    var areas = p._areas || [];
    panel.textContent = "";
    panel.appendChild(el("span", "mc-sheet-handle"));
    var close = el("button", "mc-sheet-close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.appendChild(icon("fa-solid fa-xmark"));
    close.addEventListener("click", closeSheet);
    panel.appendChild(close);

    var head = el("div", "mc-sheet-head");
    var ph = el("span", "mc-sheet-photo");
    var src = photoOf(card);
    if (src) { var img = el("img"); img.src = src; img.alt = ""; ph.appendChild(img); }
    else ph.appendChild(el("span", "mc-initials", initials(p.name)));
    head.appendChild(ph);
    var who = el("div");
    var name = el("h2", "mc-sheet-name", p.name);
    name.id = "mcSheetName";
    who.appendChild(name);
    who.appendChild(el("p", "mc-sheet-role", roleLine(p)));
    head.appendChild(who);
    panel.appendChild(head);

    if (areas.length) {
      panel.appendChild(el("p", "mc-sheet-label", "Practice areas"));
      var ul = el("ul", "mc-sheet-areas");
      areas.forEach(function (a) { ul.appendChild(el("li", null, a)); });
      panel.appendChild(ul);
    }
    if (card.tagName === "A") {
      var go = el("a", "btn btn--solid mc-sheet-go");
      go.href = card.href;
      go.appendChild(document.createTextNode("View full profile "));
      go.appendChild(icon("fa-solid fa-arrow-right"));
      panel.appendChild(go);
    }

    lastFocus = document.activeElement;
    sheet.hidden = false;
    html.classList.add("mc-sheet-open");
    requestAnimationFrame(function () { sheet.classList.add("is-open"); panel.focus(); });
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("is-open");
    html.classList.remove("mc-sheet-open");
    setTimeout(function () { sheet.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  backdrop.addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  /* ---------- taps on partner cards (options 1 and 3, phones only) ---------- */
  function closeOpenCards(except) {
    partners.forEach(function (p) { if (p._el !== except) p._el.classList.remove("mc-open"); });
  }
  partners.forEach(function (p) {
    p._el.addEventListener("click", function (e) {
      if (!phone.matches) return;
      if (current === "1") {
        // first tap: show the practice areas; second tap: follow the link to the profile
        if (!p._el.classList.contains("mc-open")) {
          e.preventDefault();
          closeOpenCards(p._el);
          p._el.classList.add("mc-open");
        }
      } else if (current === "3") {
        e.preventDefault();
        openSheet(p);
      }
    });
  });
  // a tap anywhere else closes an open card
  document.addEventListener("click", function (e) {
    if (current === "1" && !e.target.closest(".mc-open")) closeOpenCards(null);
  });

  /* ---------- the switch ---------- */
  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return OPTIONS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  var asked = new URLSearchParams(location.search).get("mcard");
  if (OPTIONS.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);
  var current = asked || recall() || "1";

  var nav = el("nav", "mc-switch");
  nav.setAttribute("aria-label", "Partner cards on phones (review)");
  nav.appendChild(el("span", "mc-switch-label", "Mobile cards"));
  var buttons = OPTIONS.map(function (o) {
    var b = el("button", null, o);
    b.type = "button";
    b.title = NAMES[o];
    b.setAttribute("aria-label", "Mobile cards option " + o + ": " + NAMES[o]);
    b.addEventListener("click", function () { remember(o); setOption(o); });
    nav.appendChild(b);
    return b;
  });
  var caption = el("span", "mc-switch-name");
  nav.appendChild(caption);
  document.body.appendChild(nav);

  function setOption(o) {
    current = o;
    OPTIONS.forEach(function (k) { html.classList.toggle("mc-" + k, k === o); });
    buttons.forEach(function (b, i) { b.setAttribute("aria-pressed", String(OPTIONS[i] === o)); });
    caption.textContent = NAMES[o];
    closeOpenCards(null);
    closeSheet();
  }
  setOption(current);
})();
