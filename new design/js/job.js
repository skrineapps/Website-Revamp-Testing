/* =========================================================
   SKRINE — Open role (job.html?j=<slug>)
   - Role header, sections, sticky "Apply" card
   - Three-step application form: data protection consent,
     your details + CV upload, review & submit.
     FRONT END ONLY: submitting shows a confirmation; nothing is sent.
     Connect the form to the firm's HR system / form handler later.
   - Other open roles
   Data: js/jobs-data.js
   ========================================================= */
(function () {
  "use strict";

  var A = window.SkrineArticle;
  var JOBS = window.SKRINE_JOBS || [];
  var el = A.el;

  var slug = new URLSearchParams(location.search).get("j") || "";
  var J = JOBS.filter(function (j) { return j.slug === slug; })[0];
  if (!J) {
    document.querySelectorAll(".ar-crumbs, .jb-head, .jb-layout, .jb-apply").forEach(function (n) { n.hidden = true; });
    document.getElementById("arMissing").hidden = false;
    return;
  }
  document.title = J.title + " | Careers | Skrine";

  /* ---------- header ---------- */
  var place = /damansara/i.test(J.location) ? "Damansara Heights, Kuala Lumpur" : J.location;
  var type = J.group === "Pupil" ? "Pupillage" : "Full-time";
  document.getElementById("jbCrumb").textContent = J.title;
  document.getElementById("jbGroup").textContent = J.group;
  document.getElementById("jbTitle").textContent = J.title;
  var meta = document.getElementById("jbMeta");
  [["fa-solid fa-location-dot", place], ["fa-regular fa-clock", type], ["fa-solid fa-briefcase", J.group === "Office Support" ? "Office Support" : "Legal"]].forEach(function (m) {
    var li = el("li");
    li.appendChild(A.icon(m[0]));
    li.appendChild(document.createTextNode(" " + m[1]));
    meta.appendChild(li);
  });
  var intro = document.getElementById("jbIntro");
  J.intro.forEach(function (t) { intro.appendChild(el("p", null, t)); });

  /* ---------- sections ---------- */
  var ICON = [
    [/role|description|practice/i, "fa-solid fa-scale-balanced"],
    [/qualif/i, "fa-solid fa-graduation-cap"],
    [/essential|requirement/i, "fa-solid fa-list-check"],
    [/remuneration|salary/i, "fa-solid fa-sack-dollar"],
    [/get|offer|benefit/i, "fa-solid fa-gift"],
  ];
  var body = document.getElementById("jbBody");
  J.sections.forEach(function (s) {
    var sec = el("section", "jb-section reveal");
    var h = el("h2", "jb-section-title");
    var ic = (ICON.filter(function (x) { return x[0].test(s.heading); })[0] || [0, "fa-solid fa-circle-info"])[1];
    h.appendChild(el("span", "jb-section-icon")).appendChild(A.icon(ic));
    h.appendChild(document.createTextNode(s.heading));
    sec.appendChild(h);
    var ul = el("ul", "jb-list");
    s.items.forEach(function (t) {
      // "- Debt Recovery" style lines are sub-points of the line before
      var sub = /^[-–]\s*/.test(t);
      ul.appendChild(el("li", sub ? "jb-sub" : null, t.replace(/^[-–]\s*/, "")));
    });
    sec.appendChild(ul);
    body.appendChild(sec);
    window.SkrineFX && window.SkrineFX.observeReveal(sec);
  });

  /* ---------- side card ---------- */
  document.getElementById("jbCardTitle").textContent = J.title;
  var facts = document.getElementById("jbCardFacts");
  [["Location", place], ["Type", type], ["Apply by", "Online form below"]].forEach(function (f) {
    var d = el("div");
    d.appendChild(el("dt", null, f[0]));
    d.appendChild(el("dd", null, f[1]));
    facts.appendChild(d);
  });
  A.share(J.title + " — Skrine");

  /* ---------- application form ---------- */
  document.getElementById("jbApplyRole").textContent = J.title;
  if (J.group === "Pupil") document.getElementById("jbExpLabel").textContent = "Current stage";
  var form = document.getElementById("jbForm");
  var panes = form.querySelectorAll(".jb-pane");
  var pills = document.querySelectorAll(".jb-step-pill");
  var applyTop = document.getElementById("apply");

  function go(n) {
    panes.forEach(function (p) { p.classList.toggle("is-current", +p.dataset.pane === n); });
    pills.forEach(function (p) {
      var k = +p.dataset.step;
      p.classList.toggle("is-current", k === n);
      p.classList.toggle("is-done", k < n);
    });
    var r = applyTop.getBoundingClientRect();
    if (r.top < 0) window.scrollTo({ top: r.top + window.scrollY - 100, behavior: "smooth" });
    var first = form.querySelector('.jb-pane[data-pane="' + n + '"] input, .jb-pane[data-pane="' + n + '"] button');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 300);
  }

  // step checks
  function okConsent() {
    var ok = document.getElementById("jbConsent").checked;
    document.getElementById("jbConsentErr").hidden = ok;
    return ok;
  }
  function okDetails() {
    var bad = 0;
    ["name", "email", "phone"].forEach(function (n) {
      var f = form.elements[n];
      var v = f.value.trim();
      var good = v && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      f.closest(".jb-field").classList.toggle("is-invalid", !good);
      if (!good) bad++;
    });
    var hasCv = !!(cv.files && cv.files.length);
    drop.classList.toggle("is-invalid", !hasCv);
    if (!hasCv) bad++;
    document.getElementById("jbDetailsErr").hidden = !bad;
    return !bad;
  }

  form.addEventListener("click", function (e) {
    var next = e.target.closest("[data-next]");
    var back = e.target.closest("[data-back]");
    if (back) go(+back.dataset.back);
    if (!next) return;
    var to = +next.dataset.next;
    if (to === 2 && !okConsent()) return;
    if (to === 3) { if (!okDetails()) return; fillReview(); }
    go(to);
  });
  document.getElementById("jbConsent").addEventListener("change", okConsent);
  // clear a field's error as soon as it is filled in
  form.addEventListener("input", function (e) {
    var f = e.target.closest(".jb-field");
    if (f && e.target.value.trim()) f.classList.remove("is-invalid");
  });

  // CV: click or drag and drop; show the chosen file
  var drop = document.getElementById("jbDrop");
  var cv = document.getElementById("jbCv");
  var cvName = document.getElementById("jbCvName");
  function showFile() {
    var f = cv.files && cv.files[0];
    cvName.hidden = !f;
    drop.classList.toggle("has-file", !!f);
    if (f) {
      cvName.textContent = "";
      cvName.appendChild(A.icon("fa-regular fa-file-lines"));
      cvName.appendChild(document.createTextNode(" " + f.name + " · " + Math.max(1, Math.round(f.size / 1024)) + " KB"));
      drop.classList.remove("is-invalid");
    }
  }
  cv.addEventListener("change", showFile);
  ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) {
    e.preventDefault();
    if (e.dataTransfer.files.length) { cv.files = e.dataTransfer.files; showFile(); }
  });

  function fillReview() {
    var rv = document.getElementById("jbReview");
    rv.textContent = "";
    [["Role", J.title], ["Full name", form.elements.name.value], ["Email", form.elements.email.value], ["Phone", form.elements.phone.value],
      [document.getElementById("jbExpLabel").textContent, form.elements.experience.value || "—"], ["Current position", form.elements.current.value || "—"],
      ["CV", cv.files[0] ? cv.files[0].name : "—"], ["Cover note", form.elements.note.value || "—"]]
      .forEach(function (r) {
        var d = el("div");
        d.appendChild(el("dt", null, r[0]));
        d.appendChild(el("dd", null, r[1]));
        rv.appendChild(d);
      });
  }

  // Front end only: show the confirmation instead of sending anything
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("jbDoneName").textContent = form.elements.name.value.trim().split(/\s+/)[0];
    document.getElementById("jbDoneRole").textContent = J.title;
    form.hidden = true;
    document.querySelector(".jb-steps").hidden = true;
    var done = document.getElementById("jbDone");
    done.hidden = false;
    done.focus();
  });

  /* ---------- other roles ---------- */
  var others = JOBS.filter(function (j) { return j.slug !== slug; });
  var list = document.getElementById("jbMoreList");
  others.forEach(function (j) {
    var li = el("li");
    var a = el("a", "jb-more-item");
    a.href = "job.html?j=" + encodeURIComponent(j.slug);
    a.appendChild(el("span", "jb-more-group", j.group));
    a.appendChild(el("span", "jb-more-title", j.title));
    a.appendChild(A.icon("fa-solid fa-arrow-right jb-more-go"));
    li.appendChild(a);
    list.appendChild(li);
  });
  if (others.length) document.getElementById("jbMore").hidden = false;
})();
