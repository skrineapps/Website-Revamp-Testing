/* =========================================================
   SKRINE — Our Story: John Skrine quote, three backgrounds (review aid)
   Adds a small "Quote background" switch under the quote panel:
     1  People   the partners at the firm's 56th anniversary
     2  1963     no photo: a large, faint "1963" on a paper texture
     3  Design   the art of the chosen design, faded
     4  Design + 1963   the design's art with the "1963" mark on top
   ?qbg=1..4 in the address picks one; the choice is remembered for the
   visit (sessionStorage). Styles: css/quote-bg-options.css.
   Delete this file, its CSS and their two tags once one is chosen.
   ========================================================= */
(function () {
  "use strict";

  var quote = document.querySelector(".st-quote");
  if (!quote) return;

  var OPTIONS = ["1", "2", "3", "4"];
  var NAMES = { "1": "People", "2": "1963", "3": "Design", "4": "Design + 1963" };
  var KEY = "skrine-qbg";

  function remember(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ } }
  function recall() { try { var v = sessionStorage.getItem(KEY); return OPTIONS.indexOf(v) > -1 ? v : null; } catch (e) { return null; } }
  var asked = new URLSearchParams(location.search).get("qbg");
  if (OPTIONS.indexOf(asked) < 0) asked = null;
  if (asked) remember(asked);

  var nav = document.createElement("nav");
  nav.className = "qbg-switch";
  nav.setAttribute("aria-label", "Quote background (review)");
  var label = document.createElement("span");
  label.className = "qbg-switch-label";
  label.textContent = "Quote background";
  nav.appendChild(label);

  var buttons = OPTIONS.map(function (o) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = o + " · " + NAMES[o];
    b.addEventListener("click", function () { remember(o); set(o); });
    nav.appendChild(b);
    return b;
  });
  quote.insertAdjacentElement("afterend", nav);

  function set(o) {
    OPTIONS.forEach(function (k) { quote.classList.toggle("qbg-" + k, k === o); });
    buttons.forEach(function (b, i) { b.setAttribute("aria-pressed", String(OPTIONS[i] === o)); });
  }
  set(asked || recall() || "1");
})();
