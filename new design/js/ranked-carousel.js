/* =========================================================
   SKRINE — "Individually ranked" honour roll (home page, Awards)
   One lawyer at a time: their top ranking set large, portrait beside.
   Moves on by itself every few seconds; a roster of every ranked
   name underneath shows where you are and jumps on click. Hover or
   focus pauses; arrows step; swipe works on touch; it loops.
   ========================================================= */
(function () {
  "use strict";
  var root = document.getElementById("rankedCarousel");
  if (!root) return;
  var track = root.querySelector(".rk-track");
  var slides = Array.prototype.slice.call(track.children);
  var roster = root.querySelector(".rk-roster");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STEP_MS = 5500;
  var index = 0, timer = null, paused = false, visible = true;

  // roster: one entry per lawyer, with a thin bar that fills while it is shown
  var names = slides.map(function (s, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.innerHTML = '<span class="rk-roster-name"></span><span class="rk-roster-bar" aria-hidden="true"><span></span></span>';
    b.querySelector(".rk-roster-name").textContent = s.getAttribute("data-name");
    b.addEventListener("click", function () { go(i, true); });
    li.appendChild(b);
    roster.appendChild(li);
    return b;
  });

  function go(i, user) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translate3d(" + (-index * 100) + "%,0,0)";
    slides.forEach(function (s, k) {
      var on = k === index;
      s.classList.toggle("is-shown", on);
      s.setAttribute("aria-hidden", String(!on));
      Array.prototype.forEach.call(s.querySelectorAll(".rk-copy a"), function (a) { a.tabIndex = on ? 0 : -1; });
    });
    names.forEach(function (b, k) { b.setAttribute("aria-current", k === index ? "true" : "false"); });
    // keep the active name in view on narrow screens
    var act = names[index];
    if (roster.scrollWidth > roster.clientWidth) roster.scrollTo({ left: act.parentNode.offsetLeft - roster.clientWidth / 2 + act.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
    if (user) restart();
  }

  function restart() {
    clearTimeout(timer);
    names.forEach(function (b, k) {
      var bar = b.querySelector(".rk-roster-bar span");
      bar.style.transition = "none";
      bar.style.transform = "scaleX(" + (k === index ? (paused || reduce ? 1 : 0) : 0) + ")";
    });
    if (reduce || paused || !visible) return;
    var bar = names[index].querySelector(".rk-roster-bar span");
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      bar.style.transition = "transform " + STEP_MS + "ms linear";
      bar.style.transform = "scaleX(1)";
    }); });
    timer = setTimeout(function () { go(index + 1); restart(); }, STEP_MS);
  }

  root.querySelector(".rk-prev").addEventListener("click", function () { go(index - 1, true); });
  root.querySelector(".rk-next").addEventListener("click", function () { go(index + 1, true); });
  root.addEventListener("pointerenter", function () { paused = true; restart(); });
  root.addEventListener("pointerleave", function () { paused = false; restart(); });
  root.addEventListener("focusin", function () { paused = true; restart(); });
  root.addEventListener("focusout", function () { paused = false; restart(); });

  var x0 = null;
  track.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; restart(); }, { threshold: 0.25 }).observe(root);
  }
  go(0);
  restart();
})();
