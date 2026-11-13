/* =========================================================
   SKRINE — Shared helpers for full-content pages
   (alert.html, news.html)
   - slug rule shared with the listing pages
   - reading-progress bar
   - share buttons (copy link, LinkedIn, email, print)
   - people lookup: photo, role, profile link
   ========================================================= */
(function () {
  "use strict";

  var PEOPLE = window.SKRINE_PEOPLE || {};
  var PROFILES = window.SKRINE_PROFILES || {};
  var PHOTO_DIR = "../current design/images/people/";
  // a file name in that folder, or a full URL (WordPress media library)
  function photoUrl(f) { return /^(https?:)?\/\//.test(f) ? f : PHOTO_DIR + encodeURIComponent(f); }
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var ROLE = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el("i", name); i.setAttribute("aria-hidden", "true"); return i; }

  // same rule as the data extractor and the listing pages
  function slugify(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");
  }
  function longDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1] + " " + p[0]; }
  function shortDate(iso) { var p = iso.split("-"); return Number(p[2]) + " " + MONTHS[Number(p[1]) - 1].slice(0, 3) + " " + p[0]; }

  function profileSlug(name) {
    return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  // { name, role label, photo url|null, href|null }
  function person(name) {
    var key = profileSlug(name);
    var words = key.split("-");
    var found = null, roleKey = null;
    function scan(test) {
      Object.keys(ROLE).some(function (r) {
        return (PEOPLE[r] || []).some(function (p) {
          if (test(profileSlug(p.name))) { found = p; roleKey = r; return true; }
          return false;
        });
      });
    }
    scan(function (k) { return k === key || k.indexOf(key) === 0 || key.indexOf(k) === 0; });
    // credits often use the full name ("Nurul Syafinas binti Ibrahim" → "Syafinas Ibrahim")
    if (!found) scan(function (k) { var ks = k.split("-"); return ks.length > 1 && ks.every(function (w) { return words.indexOf(w) > -1; }); });
    // shortened names and one-letter spelling differences (js/people-links.js)
    if (!found && window.SkrinePeople) {
      var f = window.SkrinePeople.find(name);
      if (f) { found = f.person; roleKey = f.group; }
    }
    var nm = found ? found.name : name;
    var withPhoto = roleKey === "partners" || roleKey === "consultants";
    var slug = profileSlug(nm);
    return {
      name: nm,
      role: roleKey ? ROLE[roleKey] : "",
      division: found && found.division || "",
      photo: withPhoto ? photoUrl(found.photo || nm + ".png") : null,
      // partners/consultants → profile; other Skrine lawyers → the People page, filtered to them
      href: PROFILES[slug] ? "profile.html?p=" + encodeURIComponent(slug) : found ? "people.html?q=" + encodeURIComponent(nm) : null,
    };
  }
  function initials(name) {
    var skip = { to: 1, puan: 1, sri: 1, dato: 1, bin: 1, binti: 1 };
    var parts = name.replace(/[’'.]/g, "").split(/\s+/).filter(function (p) { return !skip[p.toLowerCase()]; });
    return (((parts[0] || "")[0] || "") + ((parts[1] || "")[0] || "")).toUpperCase();
  }
  function avatar(p, cls) {
    var a = el("span", cls || "ar-avatar");
    a.setAttribute("aria-hidden", "true");
    if (p.photo) {
      var img = el("img");
      img.src = p.photo;
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("error", function () { img.replaceWith(el("span", null, initials(p.name))); });
      a.appendChild(img);
    } else {
      a.appendChild(el("span", null, initials(p.name)));
    }
    return a;
  }
  // person chip: photo + name + role, a link when they have a profile page
  function personChip(name, cls) {
    var p = person(name);
    var c = el(p.href ? "a" : "div", cls || "ar-person");
    if (p.href) c.href = p.href;
    c.appendChild(avatar(p));
    var t = el("span", "ar-person-text");
    t.appendChild(el("span", "ar-person-name", p.name));
    if (p.role) t.appendChild(el("span", "ar-person-role", p.role + (p.division && p.role === "Partner" ? " · " + p.division : "")));
    c.appendChild(t);
    return c;
  }

  /* ---------- reading progress ---------- */
  function progress(target) {
    var bar = document.getElementById("arProgress");
    if (!bar || !target) return;
    var tick = false;
    function update() {
      var r = target.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var done = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / (total > 0 ? total : 1)));
      bar.style.transform = "scaleX(" + done.toFixed(3) + ")";
      tick = false;
    }
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- share ---------- */
  function share(title) {
    var row = document.querySelector("#arShare .ar-share-row");
    if (!row) return;
    var url = location.href;
    function btn(label, iconName, onClick, href) {
      var b = el(href ? "a" : "button", "ar-share-btn");
      if (href) { b.href = href; if (/^https?:/.test(href)) { b.target = "_blank"; b.rel = "noopener"; } }
      else b.type = "button";
      b.setAttribute("aria-label", label);
      b.title = label;
      b.appendChild(icon(iconName));
      if (onClick) b.addEventListener("click", onClick);
      row.appendChild(b);
      return b;
    }
    var copy = btn("Copy link", "fa-solid fa-link", function () {
      var done = function () {
        copy.classList.add("is-done");
        copy.setAttribute("aria-label", "Link copied");
        copy.title = "Link copied";
        setTimeout(function () { copy.classList.remove("is-done"); copy.setAttribute("aria-label", "Copy link"); copy.title = "Copy link"; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
      else done();
    });
    btn("Share on LinkedIn", "fa-brands fa-linkedin-in", null, "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url));
    btn("Share by email", "fa-regular fa-envelope", null, "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(title + "\n" + url));
    btn("Print", "fa-solid fa-print", function () { window.print(); });
  }

  /* ---------- related cards ---------- */
  function relatedCard(opts) {
    var a = el("a", "ar-card reveal");
    a.href = opts.href;
    if (opts.image) {
      var m = el("span", "ar-card-media");
      var img = el("img");
      img.src = opts.image;
      img.alt = "";
      img.loading = "lazy";
      m.appendChild(img);
      a.appendChild(m);
    }
    var b = el("span", "ar-card-body");
    b.appendChild(el("span", "ar-card-meta", opts.meta));
    b.appendChild(el("span", "ar-card-title", opts.title));
    if (opts.full) {
      var f = el("span", "ar-card-full");
      f.appendChild(document.createTextNode("Read full story "));
      f.appendChild(icon("fa-solid fa-arrow-right"));
      b.appendChild(f);
    }
    a.appendChild(b);
    return a;
  }

  window.SkrineArticle = {
    el: el, icon: icon, slugify: slugify, longDate: longDate, shortDate: shortDate,
    person: person, personChip: personChip, avatar: avatar,
    progress: progress, share: share, relatedCard: relatedCard, fillBody: fillBody,
  };

  // article text from the editor: plain tables (pasted from Word, classic editor) get a
  // scrolling wrapper so they don't squash on phones; WordPress table blocks already have one
  function fillBody(target, parts) {
    target.innerHTML = parts.join("");
    Array.prototype.forEach.call(target.querySelectorAll("table"), function (t) {
      if (t.closest(".wp-block-table, .ar-table")) return;
      var wrap = document.createElement("div");
      wrap.className = "ar-table";
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
  }
})();
