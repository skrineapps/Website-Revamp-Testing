// Build the "skrine" WordPress theme from the static design.
// usage: node wordpress-theme/build.js <output folder>      (run from the repo root)
//
// What comes out
// - page-<slug>.php / front-page.php: the design's header, footer and scripts, with the
//   wording inside <main> printed from the WordPress page (skrine_page_content)
// - content/<slug>.html: that wording, one Custom HTML block per section (imported into each page)
// - content/parts/*.html: home sections that become live lists (carousel, spotlight, deals)
// - seed/*.json: alerts, publications, news, deals and the images for Skrine → Import
// - inc/pages.php, inc/topic-map.php: generated lists; everything else is copied from src/
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ND = path.join(ROOT, "new design");
const SRC = path.join(__dirname, "src");
const OUT = path.resolve(process.argv[2] || path.join(ROOT, "build", "skrine"));

const read = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const write = (rel, s) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
function copyDir(src, dst, filter) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d, filter);
    else if (!filter || filter(s)) fs.copyFileSync(s, d);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
copyDir(SRC, OUT);
copyDir(path.join(ND, "css"), path.join(OUT, "css"));
copyDir(path.join(ND, "js"), path.join(OUT, "js"));
copyDir(path.join(ND, "images"), path.join(OUT, "images"));
copyDir(path.join(ROOT, "current design/images/people"), path.join(OUT, "people"), (f) => /\.(png|jpe?g|webp)$/i.test(f));
// home.js was written for index.html at the repo root
write("js/home.js", read(path.join(ND, "js/home.js"))
  .replace(/new%20design\/images\//g, "images/")
  .replace(/new%20design\/([a-z0-9-]+)\.html/g, "$1.html"));

/* ---------- design data (for the seeds) ---------- */
const W = {};
for (const f of ["alerts-data", "alerts-full-data", "publications-data", "news-data", "news-full-data"]) {
  vm.runInNewContext(read(path.join(ND, "js", f + ".js")), { window: W });
}
// same rule as js/article-common.js
const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).replace(/-$/, "");

/* ---------- pages ---------- */
const NAMES = { alert: "Alert", news: "News Story", job: "Job Opening", profile: "Profile", "profile-classic": "Profile (Classic)",
  "life-story": "Life at Skrine Story", capabilities: "Practice Areas", "practice-area": "Practice Area", sector: "Sector" };
const T = "<?php echo esc_url( get_template_directory_uri() ); ?>";
const HOME = "<?php echo esc_url( home_url( '/' ) ); ?>";

// split HTML into its top-level elements (one editable block each)
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
function topLevel(html) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*?(\/?)>/g;
  let depth = 0, start = 0, m;
  while ((m = re.exec(html))) {
    const close = m[1] === "/", tag = m[2].toLowerCase(), self = m[3] === "/" || VOID.has(tag);
    if (!close && (tag === "script" || tag === "style")) {
      const end = html.indexOf("</" + tag, re.lastIndex);
      re.lastIndex = html.indexOf(">", end) + 1;
      if (depth === 0) out.push(html.slice(m.index, re.lastIndex));
      continue;
    }
    if (!close) {
      if (depth === 0) start = m.index;
      if (self) { if (depth === 0) out.push(html.slice(start, re.lastIndex)); }
      else depth++;
    } else if (--depth === 0) out.push(html.slice(start, re.lastIndex));
  }
  return out;
}
const squash = (s) => s.replace(/\s+/g, "");

function dedent(s) {
  const lines = s.split("\n");
  // the first line has already lost its indent; measure the rest
  const rest = lines.slice(1).filter((l) => l.trim() && !/^\[skrine_/.test(l)).map((l) => l.match(/^ */)[0].length);
  const ind = rest.length ? Math.min(...rest) : 0;
  return lines.map((l) => l.slice(Math.min(ind, l.match(/^ */)[0].length))).join("\n");
}

function toBlocks(inner) {
  const clean = inner.replace(/<!--[\s\S]*?-->/g, "");
  const parts = topLevel(clean);
  if (squash(parts.join("")) !== squash(clean)) throw new Error("section split lost content");
  return parts.map((p) => "<!-- wp:html -->\n" + dedent(p.replace(/^\s+/, (w) => w.replace(/\n/g, ""))) + "\n<!-- /wp:html -->").join("\n\n") + "\n";
}

const DATA_SETS = {
  alerts: ["alerts-data.js", "alerts-full-data.js"], publications: ["publications-data.js"], news: ["news-data.js", "news-full-data.js"],
  people: ["people-data.js"], profiles: ["profiles-data.js"],
};
function shellFor(html, slug) {
  let s = html;
  // home links -> site root
  s = s.replace(/href="(\.\.\/)?index\.html(#[^"]*)?"/g, (m, up, hash) => `href="${HOME}${hash || ""}"`);
  // static assets -> theme folder
  s = s.replace(/(href|src|srcset)="(css|js|images)\//g, `$1="${T}/$2/`);
  s = s.replace(/url\((&quot;|'|")?(images\/)/g, (m, q) => `url(${q || ""}${T}/images/`);
  // data files -> content from WordPress
  for (const [set, files] of Object.entries(DATA_SETS)) {
    const present = files.filter((f) => s.includes(`${T}/js/${f}"`));
    if (!present.length) continue;
    let first = true;
    for (const f of present) {
      const tag = new RegExp(`[ \\t]*<script src="${T.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/js/${f.replace(".", "\\.")}"></script>\\n?`);
      s = s.replace(tag, first ? `  <?php skrine_data( '${set}', array( ${present.map((x) => `'${x}'`).join(", ")} ) ); ?>\n` : "");
      first = false;
    }
  }
  if (slug === "home") s = s.replace(/([ \t]*)<script src="[^"]*\/js\/home\.js"><\/script>/, `$1<?php skrine_data( 'deals' ); ?>\n$&`);
  // <base> first in <head>, so relative URLs built in JS resolve from the site root
  s = s.replace(/<head>/i, `<head>\n  <base href="${HOME}">\n  <script>
  /* With <base> at the site root, "#section" links would point at the home page. Keep them on this page. */
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a) return;
    e.preventDefault();
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    var t = document.getElementById(decodeURIComponent(id));
    if (t) { t.scrollIntoView({ behavior: "smooth", block: "start" }); history.pushState(null, "", location.pathname + location.search + "#" + id); }
  });
  </script>`);
  s = s.replace(/<\/head>/i, "  <?php wp_head(); ?>\n</head>");
  s = s.replace(/<\/body>/i, "  <?php wp_footer(); ?>\n</body>");
  return "<?php\n/**\n * Skrine: generated from the design by wordpress-theme/build.js. The wording inside <main> is the page's content in WordPress.\n */\n?>" + s;
}

const pages = [];
const contentImages = new Set();
function buildPage(file, slug, isHome) {
  let html = read(file);
  if (isHome) html = html.replace(/new%20design\//g, "");
  const open = html.search(/<main\b/);
  const openEnd = html.indexOf(">", open) + 1;
  const close = html.lastIndexOf("</main>");
  let inner = html.slice(openEnd, close);
  inner = inner.replace(/(href|src)="\.\.\/index\.html/g, '$1="index.html');

  if (isHome) {
    const live = [
      ["legal-updates", /(<ul class="carousel-track">)([\s\S]*?)(<\/ul>\s*<\/div>\s*<button class="carousel-arrow next")/, "[skrine_legal_updates]"],
      ["spotlight", /(<div class="spotlight-grid">)([\s\S]*?)(<\/div>\s*<div class="section-cta)/, "[skrine_spotlight]"],
      ["deals", /(<div class="deals-board reveal" id="dealsBoard">)([\s\S]*?)(<\/div>\s*<div class="section-cta)/, "[skrine_deals]"],
    ];
    for (const [name, re, code] of live) {
      const m = inner.match(re);
      if (!m) throw new Error("home section not found: " + name);
      write(`content/parts/${name}.html`, m[2].replace(/<!--[\s\S]*?-->/g, "").trim() + "\n");
      inner = inner.replace(re, `$1${code}$3`);
    }
  }
  const blocks = toBlocks(inner);
  for (const m of blocks.matchAll(/(?<![\w./-])images\/[^"'\s)&<>?]+/g)) contentImages.add(decodeURIComponent(m[0]));
  write(`content/${slug}.html`, blocks);

  const shell = html.slice(0, openEnd) + `\n<?php skrine_page_content( '${slug}' ); ?>\n  ` + html.slice(close);
  write(isHome ? "front-page.php" : `page-${slug}.php`, shellFor(shell, slug));
  if (!isHome) {
    const raw = ((html.match(/<title>([^<|]*)/) || [])[1] || slug).trim().replace(/&amp;/g, "&");
    pages.push([slug, NAMES[slug] || raw]);
  }
}
buildPage(path.join(ROOT, "index.html"), "home", true);
for (const f of fs.readdirSync(ND).filter((x) => x.endsWith(".html"))) buildPage(path.join(ND, f), f.replace(/\.html$/, ""), false);

const phpStr = (s) => "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
write("inc/pages.php", "<?php\n// generated by wordpress-theme/build.js: slug => page title\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n\nfunction skrine_pages() {\n\treturn array(\n" +
  pages.map(([s, t]) => `\t\t${phpStr(s)} => ${phpStr(t)},`).join("\n") + "\n\t);\n}\n");

/* ---------- topic photos (from js/topic-images.js) ---------- */
const ti = read(path.join(ND, "js/topic-images.js"));
const DIR = { P: "images/practice/", S: "images/sectors/" };
const kw = [...ti.matchAll(/^\s*\[\/(.*)\/([a-z]*), ([PS]) \+ "([^"]+)"\],?$/gm)].map((m) => `\t\tarray( ${phpStr("/" + m[1] + "/" + m[2] + "u")}, ${phpStr(DIR[m[3]] + m[4])} ),`);
const tp = [...ti.slice(ti.indexOf("var TOPICS")).matchAll(/"([^"]+)": ([PS]) \+ "([^"]+)"/g)].map((m) => `\t\t${phpStr(m[1])} => ${phpStr(DIR[m[2]] + m[3])},`);
if (kw.length < 10 || tp.length < 10) throw new Error("topic-images.js format changed");
write("inc/topic-map.php", "<?php\n// generated by wordpress-theme/build.js from js/topic-images.js\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n\nfunction skrine_topic_keywords() {\n\treturn array(\n" + kw.join("\n") +
  "\n\t);\n}\n\nfunction skrine_topic_images() {\n\treturn array(\n" + tp.join("\n") + "\n\t);\n}\n");

/* ---------- people directory (for the people picker in wp-admin) ---------- */
const PW = {};
vm.runInNewContext(read(path.join(ND, "js/people-data.js")), { window: PW });
const GROUP_LABEL = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };
const directory = Object.keys(GROUP_LABEL).flatMap((g) => (PW.SKRINE_PEOPLE[g] || []).map((p) => `\t\tarray( ${phpStr(p.name)}, ${phpStr(GROUP_LABEL[g])} ),`));
write("inc/people-list.php", "<?php\n// generated by wordpress-theme/build.js from js/people-data.js: [ name, role ]\nif ( ! defined( 'ABSPATH' ) ) { exit; }\n\nfunction skrine_people_directory() {\n\treturn array(\n" + directory.join("\n") + "\n\t);\n}\n");

/* ---------- seeds ---------- */
const media = new Set(contentImages);
const img = (rel) => { if (rel && fs.existsSync(path.join(OUT, rel))) { media.add(rel); return rel; } return ""; };
// the home page's current Spotlight cards: tick the newest item whose title starts the same way
const norm = (s) => String(s).toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]+/g, "").slice(0, 20);
const spotTitles = [...read(path.join(OUT, "content/parts/spotlight.html")).matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => norm(m[1]));
const spotPicked = new Set();
for (const list of [W.SKRINE_ALERTS, W.SKRINE_PUBLICATIONS]) {
  const byDate = list.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const t of spotTitles) { const hit = byDate.find((x) => norm(x.title) === t); if (hit) spotPicked.add(hit); }
}
const isSpot = (item) => (spotPicked.has(item) ? "1" : "");
// import key: date + title, unique even for repeated titles or titles with no Latin letters (Chinese alerts)
function keyMaker() {
  const used = new Set();
  return (date, title) => {
    let k = (date || "undated") + "-" + (slugify(title) || "item");
    for (let n = 2; used.has(k); n++) k = k.replace(/(-dup\d+)?$/, "-dup" + n);
    used.add(k);
    return k;
  };
}
const splitNames =(s) => String(s || "").split(/\s*,\s*|\s+and\s+|\s*&\s*/).map((x) => x.trim()).filter(Boolean);

const alertKey = keyMaker(), pubKey = keyMaker(), newsKey = keyMaker();
const alerts = W.SKRINE_ALERTS.map((a) => {
  const F = W.SKRINE_ALERTS_FULL[slugify(a.title)];
  return {
    key: alertKey(a.date, a.title), title: a.title, date: a.date, excerpt: a.excerpt || "", topic: a.topic || "",
    body: F ? F.body.join("\n") : "",
    meta: {
      label: a.label || "", practice: a.practice || "",
      authors: (F ? F.authors.map((x) => x.name) : splitNames(a.authors)).join("\n"),
      notes: F ? F.notes.map((n) => n.html).join("\n") : "",
      spotlight: isSpot(a),
    },
  };
});
const publications = W.SKRINE_PUBLICATIONS.map((p) => ({
  key: pubKey(p.date, p.title), title: p.title, date: p.date, excerpt: p.summary || "", topic: p.topic || "",
  image: img("images/publications/" + p.cover),
  meta: { publisher: p.publisher || "", authors: (p.authors || []).join("\n"), pdf: p.pdf || "", spotlight: isSpot(p) },
}));
const news = W.SKRINE_NEWS.map((n) => {
  const F = W.SKRINE_NEWS_FULL[slugify(n.title)];
  return {
    key: newsKey(n.date, n.title), title: n.title, date: n.date, excerpt: n.summary || "", category: n.category || "",
    image: n.image ? img("images/news/" + n.image) : "",
    gallery: F ? F.gallery.map((g) => img("images/news/" + g)).filter(Boolean) : [],
    body: F ? F.body.join("\n") : "",
    meta: { people: (n.people || []).join("\n") },
  };
});
// deals: the DEALS array in js/home.js plus the short list labels in index.html
const homeJs = read(path.join(ND, "js/home.js"));
const dealsSrc = homeJs.slice(homeJs.indexOf("[", homeJs.indexOf("var DEALS")), homeJs.indexOf("\n  ];", homeJs.indexOf("var DEALS")) + 4);
const DEALS = vm.runInNewContext("(" + dealsSrc + ")");
const listRows = [...read(path.join(ROOT, "index.html")).matchAll(/<span class="dl-client">([^<]*)<\/span><span class="dl-sector">([^<]*)<\/span>/g)];
const ent = (s) => s.replace(/&amp;/g, "&");
const MON = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
const deals = DEALS.map((d, i) => {
  const dm = String(d.date).match(/^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/);
  return {
    key: slugify(d.headline), title: d.headline, excerpt: d.summary, order: i,
    date: dm ? `${dm[3]}-${MON[dm[2]]}-${dm[1].padStart(2, "0")}` : undefined,
    image: img(d.img.replace(/^new%20design\//, "")),
    meta: {
      sector: d.sector, figure: d.num, unit: d.unit, figure_label: d.label, team: d.team, date_text: d.date,
      client: listRows[i] ? ent(listRows[i][1]) : "", list_sector: listRows[i] ? ent(listRows[i][2]) : "",
    },
  };
});
// people: the directory (js/people-data.js) plus full profiles for partners and consultants (js/profiles-data.js)
vm.runInNewContext(read(path.join(ND, "js/profiles-data.js")), { window: W });
const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const profileSlug = (n) => String(n).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sectionsText = (list, h, items) => (list || []).map((s) => (s[h] ? "## " + s[h] + "\n" : "") + (s[items] || []).join("\n")).join("\n\n");
const people = [];
for (const group of Object.keys(GROUP_LABEL)) {
  (PW.SKRINE_PEOPLE[group] || []).forEach((p, i) => {
    const pr = W.SKRINE_PROFILES[profileSlug(p.name)] || null;
    const meta = {
      group, division: p.division || "", areas: (p.areas || []).join("\n"),
      key_areas: ((pr && pr.keyAreas) || p.keyAreas || []).join("\n"),
      quals: (p.quals || []).join("\n"), affiliations: (p.affiliations || []).join("\n"),
    };
    if (pr) Object.assign(meta, {
      email: pr.email || "", phone: pr.phone || "",
      experience: sectionsText(pr.experience, "area", "matters"),
      credentials: sectionsText(pr.credentials, "heading", "items"),
      talks: sectionsText(pr.talks, "heading", "items"),
      rankings: (pr.rankings || []).join("\n"),
      quotes: (pr.quotes || []).map((q) => q.quote + (q.source ? "\n— " + q.source : "")).join("\n\n"),
    });
    people.push({
      key: group + "-" + profileSlug(p.name), title: p.name, order: i,
      body: pr ? (pr.overview || []).map((t) => `<!-- wp:paragraph -->\n<p>${escHtml(t)}</p>\n<!-- /wp:paragraph -->`).join("\n\n") : "",
      image: img("people/" + (p.photo || p.name + ".png")),
      meta,
    });
  });
}

for (const r of [...alerts, ...news]) for (const m of (r.body || "").matchAll(/(?<![\w./-])images\/[^"'\s)&<>?]+/g)) img(decodeURIComponent(m[0]));

write("seed/people.json", JSON.stringify(people));
write("seed/alerts.json", JSON.stringify(alerts));
write("seed/publications.json", JSON.stringify(publications));
write("seed/news.json", JSON.stringify(news));
write("seed/deals.json", JSON.stringify(deals));
// WordPress refuses SVG uploads; those stay theme files
const mediaList = [...media].filter((r) => fs.existsSync(path.join(OUT, r)) && !/\.svg$/i.test(r)).sort();
write("seed/media.json", JSON.stringify(mediaList, null, 1));

/* ---------- theme files ---------- */
write("index.php", "<?php\n// Fallback template: show the home page design.\nrequire get_template_directory() . '/front-page.php';\n");
write("style.css", `/*
Theme Name: Skrine
Theme URI: https://www.skrine.com
Author: Skrine
Description: The Skrine website design. Alerts, Publications, News, Upcoming Events and Deals are edited in wp-admin; page wording is each page's content. After activating, run Skrine → Import once.
Version: 2.0.0
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: skrine
*/
/* All styling lives in /css; each page template loads what it needs. */
`);

console.log(`pages ${pages.length + 1} · alerts ${alerts.length} (${alerts.filter((a) => a.body).length} full) · publications ${publications.length} · news ${news.length} (${news.filter((n) => n.body).length} full) · deals ${deals.length}`);
console.log(`spotlight: ${alerts.filter((a) => a.meta.spotlight).length} alerts, ${publications.filter((p) => p.meta.spotlight).length} publications · media to import: ${mediaList.length} · missing images: ${[...media].length - mediaList.length}`);
