/* =========================================================
   SKRINE — link people's names to their page
   Needs js/people-data.js. Used by alerts, publications, news & events,
   SkrineShots and the full article pages.
   - Partners and consultants → their profile (profile.html?p=<slug>)
   - Other Skrine lawyers     → the People page, filtered to them (people.html?q=<name>)
   - Anyone else (e.g. co-authors from other firms) stays plain text
   Names are matched loosely, as credits often use a longer or shorter form
   ("Nurul Syafinas binti Ibrahim" → "Syafinas Ibrahim", "Charmayne Ong" → "Charmayne Ong Poh Yin").
   ========================================================= */
(function () {
  "use strict";

  var PEOPLE = window.SKRINE_PEOPLE || {};
  var GROUPS = ["partners", "consultants", "seniorAssociates", "associates"];
  var WITH_PROFILE = { partners: 1, consultants: 1 };

  function slug(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // a and b differ by one letter (changed, added or missing)
  function oneEdit(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }

  var cache = {};
  function find(name) {
    var key = slug(name);
    if (!key) return null;
    if (key in cache) return cache[key];
    var words = key.split("-");
    var found = null;
    function scan(test) {
      GROUPS.some(function (g) {
        return (PEOPLE[g] || []).some(function (p) {
          if (test(slug(p.name))) { found = { person: p, group: g }; return true; }
          return false;
        });
      });
    }
    scan(function (k) { return k === key; });
    if (!found) scan(function (k) { return k.indexOf(key + "-") === 0 || key.indexOf(k + "-") === 0; });
    // every word of the directory name is in the credit ("Nurul Syafinas binti Ibrahim" → "Syafinas Ibrahim")
    if (!found) scan(function (k) { var ks = k.split("-"); return ks.length > 1 && ks.every(function (w) { return words.indexOf(w) > -1; }); });
    // every word of the credit is in the directory name ("Calvin Tee" → "Tee Wei-Herng Calvin")
    if (!found && words.length > 1) scan(function (k) { var ks = k.split("-"); return words.every(function (w) { return ks.indexOf(w) > -1; }); });
    // one letter out in one word ("Kyra Iman Yaakob" → "Kyra Iman Yaacob")
    if (!found && words.length > 1) scan(function (k) {
      var ks = k.split("-");
      if (ks.length !== words.length) return false;
      var off = 0;
      for (var i = 0; i < ks.length; i++) {
        if (ks[i] === words[i]) continue;
        if (++off > 1 || ks[i].length < 4 || !oneEdit(ks[i], words[i])) return false;
      }
      return true;
    });
    cache[key] = found;
    return found;
  }

  function href(name) {
    var f = find(name);
    if (!f) return null;
    return WITH_PROFILE[f.group]
      ? "profile.html?p=" + encodeURIComponent(slug(f.person.name))
      : "people.html?q=" + encodeURIComponent(f.person.name);
  }

  // one name: <a> when the person is at Skrine, <span> otherwise.
  // inside: the name sits inside a card that is itself a link or button (a link can't hold
  // another link), so it becomes a click target that opens the person instead of the card.
  function link(name, cls, inside) {
    var h = href(name);
    var e = document.createElement(h && !inside ? "a" : "span");
    e.textContent = name;
    if (cls) e.className = cls;
    if (!h) return e;
    e.classList.add("person-link");
    if (!inside) {
      e.href = h;
    } else {
      e.title = "View " + name;
      e.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        location.href = h;
      });
    }
    return e;
  }

  // "A, B and C" or ["A", "B", "C"] → names
  function names(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    return String(v || "").split(/\s*,\s*|\s+and\s+|\s*&\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // "A, B and C" with each name linked
  function linkList(v, inside) {
    var list = names(v);
    var frag = document.createDocumentFragment();
    list.forEach(function (n, i) {
      if (i) frag.appendChild(document.createTextNode(i === list.length - 1 ? " and " : ", "));
      frag.appendChild(link(n, null, inside));
    });
    return frag;
  }

  window.SkrinePeople = { find: find, href: href, link: link, names: names, linkList: linkList };
})();
