/* =========================================================
   SKRINE — Regional desk pages (china-desk.html, india-desk.html)
   - EN / 中文 switch for the overview (remembered per browser)
   - section bar follows the scroll (same behaviour as profiles)
   - "Expand all" for the practice list
   - people chips link to their profile (js/people-links.js)
   - insights: filter by year + show more
   ========================================================= */
(function () {
  "use strict";

  var page = document.querySelector(".dk-page");
  if (!page) return;

  /* ---------- language switch ---------- */
  var LANG_KEY = "skrine-desk-lang";
  var langBtns = Array.prototype.slice.call(document.querySelectorAll(".dk-lang button"));
  function setLang(l) {
    page.setAttribute("data-lang-mode", l);
    langBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.setLang === l)); });
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* storage blocked: fine */ }
  }
  if (langBtns.length) {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
    setLang(saved === "zh" || saved === "en" ? saved : page.getAttribute("data-lang-mode") || "en");
    langBtns.forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.setLang); }); });
  }

  /* ---------- section bar: the last section whose top has passed 40% of the screen ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".pf-nav-link"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var current = -1;

  // phones: the section bar becomes a compact "On this page" menu (css/desk.css shows it under 760px)
  var navEl = document.querySelector(".dk-page .pf-nav");
  var jump = null, jumpLabel = null;
  if (navEl && links.length) {
    jump = document.createElement("div");
    jump.className = "dk-jump";
    var jb = document.createElement("button");
    jb.type = "button";
    jb.className = "dk-jump-btn";
    jb.setAttribute("aria-expanded", "false");
    jb.innerHTML = '<span class="dk-jump-kicker">On this page</span><span class="dk-jump-label"></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
    jumpLabel = jb.querySelector(".dk-jump-label");
    jumpLabel.textContent = links[0].textContent;
    var menu = document.createElement("ul");
    menu.className = "dk-jump-menu";
    menu.hidden = true;
    links.forEach(function (a) {
      var li = document.createElement("li");
      var m = document.createElement("a");
      m.href = a.getAttribute("href");
      m.textContent = a.textContent;
      m.addEventListener("click", function () { close(); });
      li.appendChild(m);
      menu.appendChild(li);
    });
    function close() { menu.hidden = true; jb.setAttribute("aria-expanded", "false"); jump.classList.remove("is-open"); }
    jb.addEventListener("click", function () {
      var open = menu.hidden;
      menu.hidden = !open;
      jb.setAttribute("aria-expanded", String(open));
      jump.classList.toggle("is-open", open);
    });
    document.addEventListener("click", function (e) { if (!jump.contains(e.target)) close(); });
    jump.appendChild(jb);
    jump.appendChild(menu);
    navEl.appendChild(jump);
  }

  function spy() {
    var line = window.innerHeight * 0.4, idx = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) idx = i; });
    if (idx === current) return;
    current = idx;
    if (jumpLabel) {
      jumpLabel.textContent = links[Math.max(0, idx)].textContent;
      Array.prototype.forEach.call(jump.querySelectorAll(".dk-jump-menu a"), function (m, i) { m.classList.toggle("is-active", i === idx); });
    }
    links.forEach(function (a, i) {
      var on = i === idx;
      a.classList.toggle("is-active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        var bar = a.parentElement;
        if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
      } else a.removeAttribute("aria-current");
    });
  }
  if (links.length) {
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", spy);
    spy();
  }

  /* ---------- practice list: expand / collapse all ---------- */
  document.querySelectorAll("[data-expand-all]").forEach(function (btn) {
    var list = document.getElementById(btn.getAttribute("data-expand-all"));
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("details"));
    function sync() {
      btn.textContent = items.every(function (d) { return d.open; }) ? btn.dataset.collapse : btn.dataset.expand;
    }
    btn.addEventListener("click", function () {
      var open = !items.every(function (d) { return d.open; });
      items.forEach(function (d) { d.open = open; });
      sync();
    });
    items.forEach(function (d) { d.addEventListener("toggle", sync); });
    sync();
  });

  /* ---------- people chips → profile ---------- */
  var SP = window.SkrinePeople;
  document.querySelectorAll("[data-person]").forEach(function (chip) {
    var href = SP && SP.href(chip.getAttribute("data-person"));
    if (href) chip.setAttribute("href", href);
    else {
      var span = document.createElement("span");
      span.className = chip.className;
      span.textContent = chip.textContent;
      chip.replaceWith(span);
    }
  });

  /* ---------- team photos: initials if the file is missing ---------- */
  function initials(name) {
    var parts = String(name).replace(/[’'.]/g, "").split(/\s+/);
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }
  document.querySelectorAll(".pf-other-photo img").forEach(function (img) {
    function fallback() {
      var s = document.createElement("span");
      s.className = "pf-monogram";
      s.textContent = initials(img.getAttribute("data-name") || "");
      img.replaceWith(s);
    }
    if (img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener("error", fallback);
  });

  /* ---------- insights: year filter + show more ---------- */
  document.querySelectorAll("[data-insights]").forEach(function (box) {
    var list = box.querySelector(".dk-talks");
    var items = Array.prototype.slice.call(list.children);
    var step = +box.getAttribute("data-insights") || 10;
    var yearBtns = Array.prototype.slice.call(box.querySelectorAll(".dk-years button"));
    var more = box.querySelector("[data-more]");
    var count = box.querySelector(".dk-count");
    var year = "all", shown = step;

    function render() {
      var match = items.filter(function (li) { return year === "all" || li.dataset.year === year; });
      items.forEach(function (li) { li.hidden = true; });
      match.slice(0, shown).forEach(function (li) { li.hidden = false; });
      var left = match.length - Math.min(shown, match.length);
      if (more) {
        more.hidden = left <= 0;
        more.querySelector("span").textContent = "Show more (" + left + ")";
      }
      if (count) count.textContent = "· showing " + Math.min(shown, match.length) + " of " + match.length;
    }
    yearBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        year = b.dataset.year;
        shown = step;
        yearBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        render();
      });
    });
    if (more) more.addEventListener("click", function () { shown += step * 2; render(); });
    render();
  });
})();
