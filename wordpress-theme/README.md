# Skrine WordPress theme — proof of concept

The new homepage as a WordPress theme. It loads the design's own CSS/JS from
`new design/`, so it looks the same as `index.html`, and **every homepage section is editable**.

## Where things are edited

| Homepage section | Edit in |
|---|---|
| Section headings, button text and links | Appearance > Customize > **Skrine Pages** > (section) |
| Hero: background image, tagline, buttons, award badges | Customize > Skrine Pages > **Hero** |
| Legal Updates cards | **Legal Updates** menu (headline, category label, card image, date, link) |
| Deals & Transactions | **Deals** menu (headline, figure, sector, summary, team, background image, list labels, position) |
| In the Spotlight | **Spotlight** menu (title, publication or alert, cover/photo, date, link, large card, position) |
| News & Events | **News** menu (title, story, summary, category, image) |
| Global Network: text, figures, regional desks, logo | Customize > Skrine Pages > **Global Network** |
| Awards: headline cards, banner | Customize > Skrine Pages > **Awards** |
| Awards: row of smaller awards | **Awards** menu (name, source and year, logo, position) |
| Footer: logo, social links, legal links | Customize > Skrine Pages > **Footer** |
| **Alerts** list page (`/alerts/`) and each alert's page (`/alerts/<name>/`) | **Alerts** menu: title, article (headings become "On this page"), summary, topic, series label, practice, authors, footnotes, optional photo |
| Alerts page intro, Subscribe box, disclaimer under each alert | Customize > Skrine Pages > **Alerts pages** |

(The Customize panel was called "Homepage" in earlier versions; it is now **Skrine Pages**.)

Layout, colours, fonts and animations stay in the code, so edits can't break the design.

The Alerts pages are drawn by the design's own `alerts.js` and `alert-page.js`; WordPress hands them the
alerts in the same shape as `alerts-data.js` / `alerts-full-data.js` (see `inc/alerts.php`). The small
adjustments the build makes to the theme's copies of the scripts are listed in `tools/js-patches.json`.

## Build

```powershell
powershell -ExecutionPolicy Bypass -File wordpress-theme\build-theme.ps1
```

Produces `wordpress-theme/skrine-theme.zip` (about 25 MB, of which 16 MB is lawyer photos for alert author chips). The build only **reads** from `new design/`
and `index.html`; it never changes them. It copies the files into `skrine/assets/` and adjusts the
copied `home.js` so its image paths, news and deals come from WordPress.

If `index.html` content changes, refresh the importer's data with:

```powershell
py -3 wordpress-theme\tools\extract-homepage-content.py
```

## Install and test (Local, or a staging copy — never the live site)

1. Appearance > Themes > Add New Theme > Upload Theme > `skrine-theme.zip` > Install
   (if the theme is already installed, choose **Replace current with uploaded**). Activate it.
2. Tools > **Import Skrine Content** > Import content. Fills News, Legal Updates, Deals, Spotlight, Awards
   and Alerts with the design's current content, images included. Safe to run again; existing items are skipped.
3. View the site and compare with `index.html` and `alerts.html`.
   (Web addresses for new page types refresh automatically after a theme update; if a page ever shows
   "not found", Settings > Permalinks > Save Changes fixes it.)

## Known limits of the proof of concept

- Other menu links (People, Capabilities, ...) go to URLs like `/people/` that are not built yet.
- "Upcoming Events" always shows the "no upcoming events" state.
- The `/news-events/` list and story pages are simple layouts, not the full `news-events.html` design.
- Alerts: the design has the full article for 5 of the 96 alerts; the other 91 show their summary until the
  full text is pasted in.
- A lawyer's name on an alert links to `/profile/?p=…`, which is not built yet.
- The homepage "Legal Updates" carousel is still its own list; it is not yet filled from Alerts automatically.
- The three regional desks (China, India, MENA) are tied to fixed points on the globe; their text and links
  are editable, but adding a fourth desk needs a code change.
- If the vendor's own News post type already uses the `/news-events/` URL, the two will clash.
  Change the slug in `inc/content-types.php` (`'news-events'`) and re-save Permalinks.
