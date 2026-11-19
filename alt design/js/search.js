/* =========================================================
   SKRINE — Search results (search.html?q=<words>&type=<kind>)
   - Searches as you type; the address keeps the search, so it can be shared
   - "All": results grouped by kind (best group first), a few of each
   - One kind (filter chips or "See all"): the full list, 20 at a time
   Needs js/search-index.js and the data files it reads.
   ========================================================= */
(function () {
  "use strict";

  var S = window.SkrineSearch;
  var TYPES = S.TYPES;
  var PER_GROUP = 4;
  var PAGE = 20;
  var POPULAR = ["Arbitration", "Employment", "Tax", "Mergers & Acquisitions", "Data protection", "Intellectual property", "Banking", "Pupillage"];

  var params = new URLSearchParams(location.search);
  var state = { q: params.get("q") || "", type: TYPES[params.get("type")] ? params.get("type") : null, shown: PAGE };

  var form = document.getElementById("srForm");
  var input = document.getElementById("srInput");
  var filters = document.getElementById("srFilters");
  var count = document.getElementById("srCount");
  var results = document.getElementById("srResults");
  var empty = document.getElementById("srEmpty");
  var start = document.getElementById("srStart");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { var i = el("i", name); i.setAttribute("aria-hidden", "true"); return i; }
  function initials(name) {
    return name.replace(/^(To'? Puan|Dato'?|Datuk|Tan Sri|Dr\.?)\s+/i, "").split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  /* ---------- one result ---------- */
  function card(it, re) {
    var T = TYPES[it.type];
    var a = el("a", "sr-item sr-item--" + it.type);
    a.href = it.href;

    var thumb = el("span", "sr-thumb");
    if (it.image) {
      var img = el("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = it.image;
      img.addEventListener("error", function () {
        thumb.textContent = "";
        if (it.type === "person") thumb.appendChild(el("span", "sr-initials", initials(it.title)));
        else thumb.appendChild(icon(T.icon));
        thumb.classList.add("is-icon");
      });
      thumb.appendChild(img);
    } else {
      thumb.classList.add("is-icon");
      thumb.appendChild(icon(T.icon));
    }
    a.appendChild(thumb);

    var body = el("span", "sr-body");
    var meta = el("span", "sr-meta");
    meta.appendChild(el("span", "sr-type", T.one));
    [it.meta, it.date ? S.shortDate(it.date) : ""].forEach(function (m) {
      if (!m) return;
      meta.appendChild(el("span", "sr-dot", "·"));
      meta.appendChild(document.createTextNode(m));
    });
    body.appendChild(meta);
    body.appendChild(S.highlight(el("span", "sr-title"), it.title, re));
    var snip = S.snippet(it, state.q);
    if (snip) body.appendChild(S.highlight(el("span", "sr-snippet"), snip, re));
    a.appendChild(body);
    a.appendChild(icon("fa-solid fa-arrow-right sr-go"));

    var li = el("li");
    li.appendChild(a);
    return li;
  }

  /* ---------- filter chips ---------- */
  function chips(byType, total) {
    filters.textContent = "";
    function chip(type, label, n) {
      var b = el("button", "sr-chip");
      b.type = "button";
      b.setAttribute("aria-pressed", String(state.type === type));
      if (type) b.appendChild(icon(TYPES[type].icon));
      b.appendChild(document.createTextNode(" " + label + " "));
      b.appendChild(el("span", "sr-chip-n", String(n)));
      b.addEventListener("click", function () { setType(type); });
      filters.appendChild(b);
    }
    chip(null, "All", total);
    Object.keys(TYPES).forEach(function (t) { if (byType[t]) chip(t, TYPES[t].label, byType[t].length); });
    filters.hidden = false;
  }

  function setType(type, focusResults) {
    state.type = type;
    state.shown = PAGE;
    render();
    remember();
    var top = filters.getBoundingClientRect().top;
    if (top < 0 || focusResults) window.scrollTo({ top: top + window.scrollY - 110, behavior: "smooth" });
  }

  /* ---------- the page ---------- */
  function render() {
    var q = state.q.trim();
    results.textContent = "";
    empty.hidden = true;

    if (!q) {
      filters.hidden = true;
      count.textContent = "";
      start.hidden = false;
      document.title = "Search | Skrine";
      return;
    }
    start.hidden = true;
    document.title = q + " — Search | Skrine";

    var all = S.search(q);
    // groups in the order of TYPES (only those with matches), with the best match's group first
    var byType = {};
    all.forEach(function (it) { (byType[it.type] = byType[it.type] || []).push(it); });
    var order = Object.keys(TYPES).filter(function (t) { return byType[t]; });
    if (all.length) order = [all[0].type].concat(order.filter(function (t) { return t !== all[0].type; }));
    if (state.type && !byType[state.type]) state.type = null;

    if (!all.length) {
      filters.hidden = true;
      count.textContent = "";
      document.getElementById("srEmptyQ").textContent = "“" + q + "”";
      empty.hidden = false;
      start.hidden = false;
      return;
    }

    chips(byType, all.length);
    var re = S.marker(q);

    if (state.type) {
      var list = byType[state.type];
      count.textContent = list.length + " " + TYPES[state.type].label.toLowerCase() + " matching “" + q + "”";
      var ul = el("ul", "sr-list");
      list.slice(0, state.shown).forEach(function (it) { ul.appendChild(card(it, re)); });
      results.appendChild(ul);
      if (list.length > state.shown) {
        var more = el("button", "btn btn--outline sr-more-btn");
        more.type = "button";
        more.textContent = "Show more (" + (list.length - state.shown) + " left)";
        more.addEventListener("click", function () {
          var at = state.shown;
          state.shown += PAGE;
          render();
          var next = results.querySelectorAll(".sr-item")[at];
          if (next) next.focus({ preventScroll: true });
        });
        results.appendChild(more);
      }
      return;
    }

    count.textContent = all.length + (all.length === 1 ? " result" : " results") + " for “" + q + "”";
    order.forEach(function (t) {
      var list = byType[t];
      var sec = el("section", "sr-group");
      var head = el("div", "sr-group-head");
      var h = el("h2", "sr-group-title");
      h.appendChild(icon(TYPES[t].icon));
      h.appendChild(document.createTextNode(" " + TYPES[t].label + " "));
      h.appendChild(el("span", "sr-group-n", String(list.length)));
      head.appendChild(h);
      if (list.length > PER_GROUP) {
        var all2 = el("button", "sr-see-all");
        all2.type = "button";
        all2.appendChild(document.createTextNode("See all " + list.length + " "));
        all2.appendChild(icon("fa-solid fa-arrow-right"));
        all2.addEventListener("click", function () { setType(t, true); });
        head.appendChild(all2);
      }
      sec.appendChild(head);
      var ul = el("ul", "sr-list");
      list.slice(0, PER_GROUP).forEach(function (it) { ul.appendChild(card(it, re)); });
      sec.appendChild(ul);
      results.appendChild(sec);
    });
  }

  // keep the search in the address bar (shareable, and Back returns to it)
  function remember() {
    var p = new URLSearchParams();
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.type) p.set("type", state.type);
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  /* ---------- typing and submitting ---------- */
  var t;
  input.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = input.value; state.type = null; state.shown = PAGE; render(); remember(); }, 180);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearTimeout(t);
    state.q = input.value;
    state.shown = PAGE;
    render();
    remember();
    input.blur();
  });

  /* ---------- popular searches ---------- */
  var pop = document.getElementById("srPopular");
  POPULAR.forEach(function (w) {
    var li = el("li");
    var b = el("button", "sr-chip", w);
    b.type = "button";
    b.addEventListener("click", function () {
      input.value = w;
      state.q = w;
      state.type = null;
      render();
      remember();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    li.appendChild(b);
    pop.appendChild(li);
  });

  input.value = state.q;
  render();
  if (!state.q) input.focus({ preventScroll: true });
})();
