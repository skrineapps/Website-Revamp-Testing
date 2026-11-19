/* =========================================================
   SKRINE — Our Story
   - Opening: the year rewinds from today to 1963
   - Chapters: the chapter in view lights up; the big year beside it
     changes with an animation; a rail shows progress and jumps to a chapter
   - Values: choose a word to read what it means (accordion on phones)
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- Opening: rewind the year ---------- */
  var rewind = document.getElementById("stRewind");
  if (rewind && !reduce) {
    var from = new Date().getFullYear(), to = 1963, dur = 1800, start = null;
    rewind.textContent = from;
    var go = function (t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3); // ease out: fast at first, settling on 1963
      rewind.textContent = Math.round(from - (from - to) * e);
      if (k < 1) requestAnimationFrame(go);
      else rewind.parentNode.classList.add("is-done");
    };
    setTimeout(function () { requestAnimationFrame(go); }, 450);
  } else if (rewind) {
    rewind.parentNode.classList.add("is-done");
  }

  /* ---------- Chapters ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll("#stSteps .st-step"));
  var rail = document.getElementById("stRail");
  var big = document.getElementById("stBigYear");
  var list = document.getElementById("stSteps");
  if (steps.length && rail) {
    var railBtns = steps.map(function (s, i) {
      var li = el("li");
      var b = el("button", "st-rail-btn");
      b.type = "button";
      b.appendChild(el("span", "st-rail-dot"));
      b.appendChild(el("span", "st-rail-label", s.dataset.label));
      b.addEventListener("click", function () {
        var top = s.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
        window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
      });
      li.appendChild(b);
      rail.appendChild(li);
      return b;
    });

    var current = -1;
    var setActive = function (i) {
      if (i === current) return;
      current = i;
      steps.forEach(function (s, k) {
        s.classList.toggle("is-active", k === i);
        s.classList.toggle("is-past", k < i);
      });
      railBtns.forEach(function (b, k) {
        b.classList.toggle("is-active", k === i);
        b.classList.toggle("is-past", k < i);
        if (k === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      if (big) {
        var word = steps[i].dataset.year;
        big.parentNode.classList.toggle("is-word", !/^\d+$/.test(word));
        if (reduce) { big.textContent = word; return; }
        big.classList.remove("is-in");
        big.classList.add("is-out");
        setTimeout(function () {
          big.textContent = word;
          big.classList.remove("is-out");
          void big.offsetWidth;
          big.classList.add("is-in");
        }, 180);
      }
    };

    var ticking = false;
    var update = function () {
      ticking = false;
      var line = window.innerHeight * 0.45;
      var idx = 0;
      steps.forEach(function (s, k) { if (s.getBoundingClientRect().top < line) idx = k; });
      setActive(idx);
      // red fill along the steps list
      var r = list.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      list.style.setProperty("--progress", p.toFixed(3));
      rail.style.setProperty("--progress", (idx / Math.max(1, steps.length - 1)).toFixed(3));
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Values ---------- */
  var vbox = document.getElementById("stValues");
  if (vbox) {
    var items = Array.prototype.slice.call(vbox.querySelectorAll(".st-v"));
    var wide = window.matchMedia("(min-width: 901px)");
    var open = function (item) {
      items.forEach(function (it) {
        var on = it === item;
        // on phones each word opens and closes on its own
        if (!wide.matches && it !== item) return;
        if (!wide.matches) on = !it.classList.contains("is-active");
        it.classList.toggle("is-active", on);
        it.querySelector(".st-v-word").setAttribute("aria-expanded", String(on));
      });
    };
    items.forEach(function (it) {
      var b = it.querySelector(".st-v-word");
      b.addEventListener("click", function () { open(it); });
      // desktop: hovering a word previews it
      b.addEventListener("mouseenter", function () { if (wide.matches) open(it); });
      b.addEventListener("focus", function () { if (wide.matches) open(it); });
    });
    // phones: start with every value open so nothing is hidden
    var sync = function () {
      if (!wide.matches) items.forEach(function (it) { it.classList.add("is-active"); it.querySelector(".st-v-word").setAttribute("aria-expanded", "true"); });
      else open(items.filter(function (it) { return it.classList.contains("is-active"); })[0] || items[0]);
    };
    if (wide.addEventListener) wide.addEventListener("change", sync);
    if (!wide.matches) sync();
  }
})();
