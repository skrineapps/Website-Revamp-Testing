"""
Reads the current homepage content out of ../index.html and ../new design/js/home.js
(read-only) and writes skrine/inc/homepage-content.json, which the theme's importer
(Tools > Import Skrine Content) uses to fill Legal Updates, Deals, Spotlight and Awards.

Run:  py -3 wordpress-theme/tools/extract-homepage-content.py
"""
import html
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
HOME_JS = (ROOT / "new design" / "js" / "home.js").read_text(encoding="utf-8")
OUT = HERE.parent / "skrine" / "inc" / "homepage-content.json"


def text(fragment):
    """Inner text of an HTML fragment, tags removed, entities decoded."""
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def asset(path):
    """'new%20design/images/x.jpg' -> 'images/x.jpg' (relative to the theme's assets folder)."""
    return path.replace("new%20design/", "")


def link(href):
    """Static-site page links -> WordPress-style paths."""
    if href.startswith("new%20design/alert.html?a="):
        return "/alerts/" + href.split("=", 1)[1] + "/"
    m = re.match(r"new%20design/([\w-]+)\.html", href)
    return "/" + m.group(1) + "/" if m else href


def section(section_id):
    start = INDEX.index('id="' + section_id + '"')
    return INDEX[start:INDEX.index("</section>", start)]


# ---- Legal Updates (carousel cards) ----
updates = []
for card in re.findall(r'<li class="slide-card">(.*?)</li>', section("updates"), re.S):
    updates.append({
        "title": text(re.search(r"<h3>(.*?)</h3>", card, re.S).group(1)),
        "tag": text(re.search(r'<span class="slide-tag">(.*?)</span>', card).group(1)),
        "image": asset(re.search(r'<img src="([^"]+)"', card).group(1)),
        "date": re.search(r'<time datetime="([^"]+)"', card).group(1),
        "link": re.search(r'<a href="([^"]+)" class="slide-link"', card).group(1),
    })

# ---- Deals (from the DEALS list in home.js + the list buttons in index.html) ----
src = HOME_JS[HOME_JS.index("var DEALS = [") + len("var DEALS = "):]
src = src[:src.index("\n  ];") + len("\n  ]")]
src = re.sub(r"^\s*//.*$", "", src, flags=re.M)             # drop comment lines
src = re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', src)  # quote keys
src = re.sub(r",(\s*[}\]])", r"\1", src)                     # trailing commas
deals_js = json.loads(src)
buttons = re.findall(
    r'<span class="dl-figure">(.*?)</span><span class="dl-client">(.*?)</span><span class="dl-sector">(.*?)</span>',
    section("deals"))
assert len(buttons) == len(deals_js), "deal list and DEALS differ in length"
deals = []
for d, (fig, client, sector) in zip(deals_js, buttons):
    deals.append({
        "title": d["headline"], "summary": d["summary"], "sector": d["sector"],
        "num": d["num"], "unit": d["unit"], "label": d["label"], "team": d["team"],
        "date_label": d["date"], "image": asset(d["img"]),
        "list_figure": text(fig), "list_client": text(client), "list_sector": text(sector),
    })

# ---- In the Spotlight ----
spotlight = []
for m in re.finditer(r'<a href="([^"]+)" class="spot-card([^"]*)"[^>]*>(.*?)</a>', section("spotlight"), re.S):
    href, classes, body = m.groups()
    is_pub = "spot-card--pub" in classes
    img = re.search(r'<img class="(?:spot-cover-img|spot-cover-photo)" src="([^"]+)" alt="([^"]*)"', body)
    meta = re.search(r'<p class="spot-meta">(.*?)</p>', body, re.S)
    spotlight.append({
        "title": text(re.search(r"<h3>(.*?)</h3>", body, re.S).group(1)),
        "type": "publication" if is_pub else "alert",
        "featured": "spot-card--feature" in classes,
        "image": asset(img.group(1)),
        "image_alt": html.unescape(img.group(2)),
        "date": re.search(r'<time datetime="([^"]+)"', body).group(1),
        "meta": text(meta.group(1)) if meta else "",
        "link": link(href),
    })

# ---- Awards: the row of smaller awards ----
awards = []
for li in re.findall(r'<li class="reveal"><span class="award-mark">(.*?)</li>', section("awards"), re.S):
    awards.append({
        "image": asset(re.search(r'<img src="([^"]+)"', li).group(1)),
        "image_alt": html.unescape(re.search(r'alt="([^"]*)"', li).group(1)),
        "source": text(re.search(r'<span class="award-src">(.*?)</span>', li).group(1)),
        "title": text(re.sub(r".*</span>", "", li, flags=re.S)),
    })

data = {"updates": updates, "deals": deals, "spotlight": spotlight, "awards": awards}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print({k: len(v) for k, v in data.items()}, "->", OUT)
