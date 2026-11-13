/* =========================================================
   SKRINE — Life at Skrine story, full content (life-story.html?n=<slug>)
   Same design as a news story: hero photo, story + side panel,
   video (where the story has one), photo gallery with a viewer,
   more stories from the same section.
   Data: js/life-full-data.js (+ life-data.js for "more stories")
   ========================================================= */
(function () {
  "use strict";

  var A = window.SkrineArticle;
  var FULL = window.SKRINE_LIFE_FULL || {};
  var LIFE = window.SKRINE_LIFE || {};
  var FX = window.SkrineFX || { observeReveal: function (n) { n.classList.add("is-visible"); } };
  var IMG = "images/life/";
  var SECTIONS = {
    dragons: { label: "Skrine Dragons", page: "skrine-dragons.html" },
    socials: { label: "Sports & Social", page: "sports-social.html" },
    development: { label: "Professional Development", page: "professional-development.html" },
    responsibility: { label: "Social Responsibility", page: "social-responsibility.html" },
    awards: { label: "Skrine Awards", page: "careers.html#awards" }
  };
  var el = A.el;

  var slug = new URLSearchParams(location.search).get("n") || "";
  var D = FULL[slug];
  if (!D) {
    document.querySelectorAll(".ar-crumbs, .nw-head, .nw-hero, .nw-layout").forEach(function (n) { n.hidden = true; });
    document.getElementById("arMissing").hidden = false;
    return;
  }
  document.title = D.title + " | Skrine";

  function frame(src, cls) {
    var f = el("span", "pub-cover " + (cls || ""));
    f.style.setProperty("--cover", 'url("' + new URL(src, document.baseURI).href + '")');
    var img = el("img");
    img.src = src;
    img.alt = "";
    f.appendChild(img);
    return f;
  }

  /* ---------- header ---------- */
  var SEC = SECTIONS[D.section] || { label: "Life at Skrine", page: "careers.html#life" };
  var crumb = document.getElementById("lsCrumbSection");
  crumb.textContent = SEC.label;
  crumb.href = SEC.page;
  var back = document.getElementById("lsBack");
  back.href = SEC.page;
  back.querySelector("span").textContent = "Back to " + SEC.label;
  document.getElementById("lsAll").href = SEC.page;
  var tags = document.getElementById("nwTags");
  tags.appendChild(el("span", "alert-tag alert-tag--label", SEC.label));
  var t = el("time", "ar-tag-date", A.longDate(D.date));
  t.dateTime = D.date;
  tags.appendChild(t);
  document.getElementById("nwTitle").textContent = D.title;

  // hero: first gallery photo (larger) or the listing thumbnail
  var heroSrc = D.gallery.length ? IMG + D.gallery[0] : D.image;
  var hero = document.getElementById("nwHero");
  if (heroSrc) hero.appendChild(frame(heroSrc, "nw-hero-frame"));
  else hero.remove();

  /* ---------- body + side ---------- */
  var body = document.getElementById("nwBody");
  A.fillBody(body, D.body);
  // Chinese sections: tag the language so the right font and line breaking apply
  body.querySelectorAll("p, h2").forEach(function (n) { if (/[一-鿿]{4,}/.test(n.textContent)) n.lang = "zh"; });
  // the story's video (YouTube), shown in our own frame
  (D.videos || []).forEach(function (src) {
    var v = el("figure", "ls-video");
    var f = document.createElement("iframe");
    f.src = src;
    f.title = D.title + " — video";
    f.loading = "lazy";
    f.allow = "accelerometer; encrypted-media; picture-in-picture; fullscreen";
    f.setAttribute("allowfullscreen", "");
    v.appendChild(f);
    body.appendChild(v);
  });

  var facts = document.getElementById("nwFacts");
  [["Date", A.longDate(D.date)], ["Section", SEC.label], D.gallery.length > 1 ? ["Photos", String(D.gallery.length)] : null]
    .filter(Boolean)
    .forEach(function (f) {
      var d = el("div");
      d.appendChild(el("dt", null, f[0]));
      d.appendChild(el("dd", null, f[1]));
      facts.appendChild(d);
    });

  A.share(D.title);
  A.progress(body);

  /* ---------- gallery + viewer ---------- */
  if (D.gallery.length > 1) {
    var grid = document.getElementById("nwGrid");
    document.getElementById("nwGalleryCount").textContent = D.gallery.length + " photos";
    // 4-column mosaic with no gaps: one large tile (2x2), then enough
    // double-width tiles to fill the last row. Small sets sit in one even row.
    var n = D.gallery.length;
    var feature = n >= 5 ? 1 : -1; // the 2nd photo; the 1st is already the hero
    var extra = n >= 5 ? (4 - ((n + 3) % 4)) % 4 : 0;
    var spans = {};
    for (var k = n - 1; k >= 0 && extra > 0; k--) { if (k !== feature) { spans[k] = true; extra--; } }
    if (n < 5) grid.classList.add("nw-grid--row", "nw-grid--" + n);
    D.gallery.forEach(function (g, i) {
      var b = el("button", "nw-shot reveal" + (i === feature ? " nw-shot--wide" : "") + (spans[i] ? " nw-shot--span" : ""));
      b.type = "button";
      b.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + D.gallery.length);
      var img = el("img");
      img.src = IMG + g;
      img.alt = "";
      img.loading = "lazy";
      b.appendChild(img);
      b.appendChild(A.icon("fa-solid fa-expand nw-shot-icon"));
      b.addEventListener("click", function () { open(i); });
      grid.appendChild(b);
      FX.observeReveal(b);
    });
    document.getElementById("nwGallery").hidden = false;

    var lb = document.getElementById("nwLightbox");
    var lbImg = document.getElementById("nwLbImg");
    var lbCount = document.getElementById("nwLbCount");
    var cur = 0, last = null;
    function show(i) {
      cur = (i + D.gallery.length) % D.gallery.length;
      lbImg.src = IMG + D.gallery[cur];
      lbImg.alt = D.title + " — photo " + (cur + 1);
      lbCount.textContent = (cur + 1) + " / " + D.gallery.length;
    }
    function open(i) {
      last = document.activeElement;
      show(i);
      lb.showModal();
      document.body.classList.add("modal-open");
    }
    document.getElementById("nwPrev").addEventListener("click", function () { show(cur - 1); });
    document.getElementById("nwNext").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(cur - 1);
      if (e.key === "ArrowRight") show(cur + 1);
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest("[data-close]")) lb.close(); });
    lb.addEventListener("close", function () { document.body.classList.remove("modal-open"); if (last) last.focus(); });
    // swipe on touch screens
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------- more stories ---------- */
  var related = (LIFE[D.section] || []).filter(function (n) { return n.slug !== slug; }).slice(0, 3);
  var rg = document.getElementById("arRelatedGrid");
  related.forEach(function (n) {
    var c = A.relatedCard({ href: "life-story.html?n=" + encodeURIComponent(n.slug), image: n.image || null, meta: SEC.label + " · " + A.shortDate(n.date), title: n.title, full: true });
    rg.appendChild(c);
    FX.observeReveal(c);
  });
  if (related.length) document.getElementById("arRelated").hidden = false;
})();
