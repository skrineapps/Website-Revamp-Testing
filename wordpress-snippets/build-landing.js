// Bundle the landing page (no header/footer) into ONE html file for an Elementor HTML widget.
// usage: node bundle-home.js <repo root> <out file>
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = process.argv[2];
const OUT = process.argv[3];
const ND = path.join(ROOT, "new design");
const ASSET = "https://skrineapps.github.io/Website-Revamp-Testing/new%20design/";
const PAGE_SLUG = { capabilities: "practice-areas" }; // design file -> WordPress page slug (others: same name)
const read = (p) => fs.readFileSync(path.join(ND, p), "utf8").replace(/\r\n/g, "\n");

/* ---------- links + assets ---------- */
const links = new Set();
function fixPaths(s) {
  s = s.replace(/new%20design\/images\//g, ASSET + "images/");
  s = s.replace(/new%20design\/([a-z0-9-]+)\.html/g, (m, slug) => {
    const url = "/" + (PAGE_SLUG[slug] || slug) + "/";
    links.add(url);
    return url;
  });
  return s;
}

/* ---------- HTML: the inside of <main> ---------- */
const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/\r\n/g, "\n");
let body = index.slice(index.indexOf("<main>") + 6, index.indexOf("</main>"));
body = fixPaths(body).replace(/\n{3,}/g, "\n\n");

/* ---------- CSS: style.css + home.css, scoped under .sk-home ---------- */
const DROP = /site-header|site-footer|footer-|nav-|primary-nav|search-bar|search-toggle|#siteHeader|\.brand\b|body\.|main\.(?!sk)|\.page-main|\.life\b|\.contact\b/;
const keyframes = new Set();
function scopeSel(sel) {
  sel = sel.trim();
  if (!sel) return null;
  if (DROP.test(sel)) return null;
  if (/^(:root|html|body)$/.test(sel)) return ".sk-home";
  if (/^(html|body)\s*>?\s*/.test(sel) && !/^(html|body)$/.test(sel)) return ".sk-home " + sel.replace(/^(html|body)\s*>?\s*/, "");
  if (/^main\b/.test(sel)) return sel.replace(/^main/, ".sk-home");
  return ".sk-home " + sel;
}
// tiny block parser: walks {...} keeping @media/@supports nesting
function scopeCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let out = "", i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    // find the matching close brace
    let depth = 1, j = open + 1;
    while (j < css.length && depth) { if (css[j] === "{") depth++; else if (css[j] === "}") depth--; j++; }
    const inner = css.slice(open + 1, j - 1);
    if (/^@(media|supports)/.test(head)) {
      const s = scopeCss(inner);
      if (s.trim()) out += head + " {\n" + s + "}\n";
    } else if (/^@(-webkit-)?keyframes/.test(head)) {
      const name = head.split(/\s+/)[1];
      keyframes.add(name);
      out += head.replace(name, "sk-" + name) + " {" + inner.trim().replace(/\s+/g, " ") + "}\n";
    } else if (head.startsWith("@")) {
      out += head + " {" + inner + "}\n";
    } else {
      const sels = head.split(/,(?![^(]*\))/).map(scopeSel).filter(Boolean);
      if (sels.length) out += [...new Set(sels)].join(", ") + " {" + inner.trim().replace(/\s*\n\s*/g, " ") + "}\n";
    }
    i = j;
  }
  return out;
}
let css = scopeCss(read("css/style.css") + "\n" + read("css/home.css"));
// prefix animation names, so they can't clash with Elementor's own (fadeIn, spin…)
css = css.replace(/(animation(?:-name)?\s*:)([^;}]*)/g, (m, prop, val) =>
  prop + val.replace(/[A-Za-z_][\w-]*/g, (w) => (keyframes.has(w) ? "sk-" + w : w)));
css = fixPaths(css); // before the url() rewrite, so the new absolute URLs aren't rewritten twice
css = css.replace(/url\((["']?)\.\.\/images\//g, (m, q) => `url(${q}${ASSET}images/`);

/* ---------- JS ---------- */
// main.js: keep reveal, tilt and carousel; drop header/nav/search (they need the site header)
const mainJs = read("js/main.js");
const keepFrom = mainJs.indexOf("/* ---------- Reveal on scroll");
const mainTrim = "(function () {\n  \"use strict\";\n" +
  "  var reduceMotion = window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches;\n" +
  "  var finePointer = window.matchMedia(\"(hover: hover) and (pointer: fine)\").matches;\n\n  " +
  mainJs.slice(keepFrom).replace(/document\.querySelectorAll\("\.reveal"\)/, 'document.querySelectorAll(".sk-home .reveal")');

// news-data.js: only what the landing page shows (latest 5 + upcoming)
const sandbox = { window: {} };
vm.runInNewContext(read("js/news-data.js"), sandbox);
const newsJs = "window.SKRINE_NEWS = " + JSON.stringify(sandbox.window.SKRINE_NEWS.slice(0, 5)) + ";\n" +
  "window.SKRINE_UPCOMING = " + JSON.stringify(sandbox.window.SKRINE_UPCOMING || []) + ";\n";

const globeJs = read("js/globe-land.js");
let homeJs = fixPaths(read("js/home.js"));
// any in-script animation names
homeJs = homeJs.replace(/(animation\s*=\s*["'])([A-Za-z][\w-]*)/g, (m, a, n) => (keyframes.has(n) ? a + "sk-" + n : m));

/* ---------- shield from the theme's global element styles ----------
   :where() keeps these at the specificity of one class, so every design rule
   (.sk-home .something) still wins, but plain theme rules (h3, img, button…) lose. */
const SHIELD = `.sk-home :where(h1,h2,h3,h4,h5,h6,p,ul,ol,li,figure,blockquote,dl,dd) { margin: 0; padding: 0; border: 0; background: none; font-family: inherit; color: inherit; text-transform: inherit; letter-spacing: inherit; line-height: inherit; text-align: inherit; }
.sk-home :where(ul,ol) { list-style: none; }
.sk-home :where(img,svg,video) { border: 0; border-radius: 0; box-shadow: none; padding: 0; margin: 0; max-width: 100%; }
.sk-home :where(a) { color: inherit; text-decoration: none; background: none; box-shadow: none; }
.sk-home :where(button,[type=button],[type=submit]) { margin: 0; padding: 0; border: 0; border-radius: 0; background: none; color: inherit; font: inherit; text-transform: none; letter-spacing: inherit; box-shadow: none; min-height: 0; line-height: inherit; }
.sk-home :where(button,[type=button],[type=submit]):is(:hover,:focus) { background: none; color: inherit; border: 0; }
`;
css = SHIELD + css;

/* ---------- strip comments ---------- */
// JS: walk the source so strings, template literals and regex literals are left intact
function stripJs(src) {
  let out = "", i = 0, last = "";
  const regexBefore = /[(,=:[!&|?{};+\-*%<>~^]|^$/;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1); i = j + 1; last = c; continue;
    }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; out += " "; continue; }
    if (c === "/" && (regexBefore.test(last) || /\b(return|typeof|case)\s*$/.test(out))) {
      let j = i + 1, cls = false;
      while (j < src.length && (src[j] !== "/" || cls)) { if (src[j] === "\\") j++; else if (src[j] === "[") cls = true; else if (src[j] === "]") cls = false; j++; }
      j++; while (/[a-z]/i.test(src[j] || "")) j++;
      out += src.slice(i, j); i = j; last = "x"; continue;
    }
    out += c;
    if (!/\s/.test(c)) last = c;
    i++;
  }
  return out.split("\n").map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim()).join("\n");
}
body = body.replace(/<!--[\s\S]*?-->/g, "").split("\n").filter((l) => l.trim()).join("\n");
const stripped = [mainTrim, newsJs, globeJs, homeJs].map(stripJs);
stripped.forEach((s, k) => new Function(s)); // throws if stripping broke the syntax

/* ---------- ASCII-only output, so no charset setting can garble it ---------- */
const hex = (c) => c.charCodeAt(0).toString(16).padStart(4, "0");
const asciiHtml = (s) => s.replace(/[^\x00-\x7f]/g, (c) => "&#x" + hex(c) + ";");
const asciiJs = (s) => s.replace(/[^\x00-\x7f]/g, (c) => "\\u" + hex(c));
const asciiCss = (s) => s.replace(/[^\x00-\x7f]/g, (c) => "\\" + hex(c) + " ");
body = asciiHtml(body);
css = asciiCss(css);
const jsParts = stripped.map(asciiJs);

/* ---------- write ---------- */
// The output carries no comments. Notes for whoever pastes it:
// - paste into ONE Elementor "HTML" widget (section Full Width, no padding)
// - images load from ASSET; find & replace it to host them in WordPress
// - page links use the addresses printed below; find & replace if yours differ
const html = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

<style>
${css}
.sk-home { --header-h: 0px; overflow-x: clip; }
</style>

<div class="sk-home">
${body.trim()}
</div>

<script>
${jsParts[0].trim()}
</script>
<script>
${jsParts[1]}</script>
<script>
${jsParts[2].trim()}
</script>
<script>
${jsParts[3].trim()}
</script>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log("bytes", html.length, "keyframes", keyframes.size, "links", [...links].join(" "));
