/* =========================================================
   SKRINE — Alert edit screen: Import from Word, live preview, HTML editor
   (inc/alert-tools.php sets up the panels and window.SKRINE_ALERT_TOOLS)

   Import from Word
   - .docx, or Word's "Save as XML" (one-file) format, converted in the browser with
     mammoth.js (admin/vendor), which keeps the structure and drops Word's own fonts and spacing
   - then tidied into the site's alert format: footnotes become the numbered notes
     (Footnotes field + <sup><a href="#note-1" id="ref-1">1</a></sup> in the text), lettered /
     roman lists and continued numbering are kept, centred / right-aligned text and indents
     get the site's classes, the title, date, author credit and practice are picked out
   - a preview in the site's design before anything is changed; "Use this content"
     uploads the images to the Media Library and fills in the alert

   Preview on the site
   - the real alert page drawing the unsaved alert (posted to alert.html?a=skrine-preview),
     refreshed as you type; desktop / phone; optional HTML code editor beside it
   ========================================================= */
(function ($) {
  "use strict";

  var CFG = window.SKRINE_ALERT_TOOLS;
  if (!CFG) return;

  /* ---------- the alert on the edit screen ---------- */
  function editor() { return window.tinymce && window.tinymce.get("content"); }
  function visualOn() { var ed = editor(); return !!(ed && !ed.isHidden()); }
  function getContent() { return visualOn() ? editor().getContent() : $("#content").val(); }
  // into the editor: the Visual tab (which also updates the HTML tab's text), or straight into the HTML tab
  function setContent(html) {
    var ed = editor();
    if (visualOn()) { ed.setContent(html); ed.save(); }
    else { $("#content").val(html); if (ed) ed.setContent(html); }
    schedule();
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function getDate() {
    var y = +$("#aa").val(), m = +$("#mm").val(), d = +$("#jj").val();
    if (!y || !m || !d) { var t = new Date(); return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()); }
    return y + "-" + pad(m) + "-" + pad(d);
  }
  function getTopic() {
    var box = $("#skrine_topicchecklist input:checked").first();
    return box.length ? $.trim(box.parent().text()) : "";
  }
  function fields() {
    return {
      sk_title: $("#title").val() || "",
      sk_content: getContent() || "",
      sk_date: getDate(),
      sk_label: $("#skrine_f_label").val() || "",
      sk_practice: $("#skrine_f_practice").val() || "",
      sk_topic: getTopic(),
      sk_authors: $("#skrine_f_authors").val() || "",
      sk_notes: $("#skrine_f_notes").val() || "",
    };
  }

  // post the fields to the alert page, shown in the named frame
  function postPreview(frameName, data) {
    var form = document.createElement("form");
    form.method = "post";
    form.action = CFG.previewUrl;
    form.target = frameName;
    form.hidden = true;
    var all = $.extend({ skrine_preview: CFG.postId, _skn: CFG.nonce }, data);
    Object.keys(all).forEach(function (k) {
      var i = document.createElement("textarea");
      i.name = k;
      i.value = all[k];
      form.appendChild(i);
    });
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  /* ---------- device size: the page is drawn at full width and scaled to fit ---------- */
  var WIDTHS = { desktop: 1280, phone: 390 };
  function fit(frameBox) {
    var box = $(frameBox);
    var iframe = box.find("iframe");
    var dev = box.attr("data-device") || "desktop";
    var w = WIDTHS[dev];
    var avail = box.innerWidth();
    var scale = Math.min(1, avail / w);
    var h = box.innerHeight();
    iframe.css({ width: w + "px", height: Math.round(h / scale) + "px", transform: "scale(" + scale + ")" });
  }
  function fitAll() { $(".skrine-pv-frame").each(function () { fit(this); }); }
  $(window).on("resize", fitAll);

  /* ---------- Preview on the site ---------- */
  var box = $("#skrine_alert_preview");
  var pvFrame = $("#skrine-pv-frame");
  var stateEl = $("#skrine-pv-state");
  var timer = null;

  function refresh() {
    clearTimeout(timer);
    if (!box.length || box.hasClass("closed")) return;
    stateEl.text("Updating…");
    postPreview("skrine-pv-iframe", fields());
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(refresh, 900);
  }
  $("#skrine-pv-iframe").on("load", function () { stateEl.text(""); });

  box.on("click", ".skrine-pv-seg button", function () {
    var dev = $(this).data("device");
    box.find(".skrine-pv-seg button").attr("aria-pressed", "false");
    $(this).attr("aria-pressed", "true");
    pvFrame.attr("data-device", dev);
    fit(pvFrame);
  });
  $("#skrine-pv-refresh").on("click", refresh);
  $("#skrine-pv-open").attr("href", CFG.openUrl).on("click", function (e) {
    // WordPress's own Preview saves the draft first, then opens our preview page
    var wp = $("#post-preview");
    if (wp.length) { e.preventDefault(); wp.trigger("click"); }
  });
  box.on("click", ".handlediv, .hndle", function () { setTimeout(function () { fitAll(); refresh(); }, 50); });

  // anything that changes the alert refreshes the preview
  $(document).on("input change", "#title, #excerpt, #content, #skrine_fields :input, #skrine_topicchecklist :input, #aa, #mm, #jj", schedule);
  function watchEditor(ed) {
    if (!ed || ed.id !== "content" || ed._skrineWatched) return;
    ed._skrineWatched = true;
    ed.on("input change keyup undo redo SetContent", function () { schedule(); syncToCode(); });
  }
  $(document).on("tinymce-editor-init", function (e, ed) { watchEditor(ed); });
  watchEditor(editor());

  /* ---------- HTML beside the preview (WordPress's code editor) ---------- */
  var cm = null;
  var codeBox = $("#skrine-pv-code");
  var codeArea = document.getElementById("skrine-html");
  var fromCode = false;
  function codeValue() { return cm ? cm.getValue() : codeArea.value; }
  function setCode(v) { if (cm) cm.setValue(v); else codeArea.value = v; }
  function syncToCode() {
    if (fromCode || codeBox.prop("hidden")) return;
    if (cm && cm.hasFocus()) return;
    var v = tidyHtml(getContent());
    if (v !== codeValue()) setCode(v);
  }
  var codeTimer = null;
  function codeChanged() {
    clearTimeout(codeTimer);
    codeTimer = setTimeout(function () {
      fromCode = true;
      setContent(codeValue());
      fromCode = false;
    }, 500);
  }
  $("#skrine-pv-html").on("click", function () {
    var on = codeBox.prop("hidden");
    codeBox.prop("hidden", !on);
    $(this).attr("aria-pressed", String(on));
    $("#skrine-pv-split").toggleClass("has-code", on);
    if (on) {
      if (!cm && CFG.code && window.wp && wp.codeEditor) {
        cm = wp.codeEditor.initialize(codeArea, CFG.code).codemirror;
        cm.on("change", function (c, ch) { if (ch.origin !== "setValue") codeChanged(); });
      } else if (!cm) {
        $(codeArea).on("input", codeChanged);
      }
      setCode(tidyHtml(getContent()));
      if (cm) setTimeout(function () { cm.refresh(); }, 30);
    }
    setTimeout(fitAll, 30);
  });

  // one block element per line, so the HTML is easy to read
  function tidyHtml(html) {
    return String(html || "")
      .replace(/\s*(<\/?(p|h[1-6]|ul|ol|li|table|thead|tbody|tr|blockquote|figure|div)\b[^>]*>)\s*/gi, function (m, tag) {
        // a new line before each opening block tag; closing tags stay at the end of their line
        return tag.charAt(1) === "/" ? tag : "\n" + tag;
      })
      .replace(/(<\/(p|h[1-6]|li|tr|ul|ol|table|blockquote|figure|div)>)\n?/gi, "$1\n")
      .replace(/\n{2,}/g, "\n")
      .trim();
  }

  /* =========================================================
     Import from Word
     ========================================================= */
  var drop = $("#skrine-word-drop");
  var fileIn = $("#skrine-word-file");
  var statusEl = $("#skrine-word-status");
  var result = $("#skrine-word-result");
  var current = null; // the converted alert

  function status(msg, isError) {
    statusEl.text(msg || "").toggleClass("is-error", !!isError);
  }

  var mammothLoad = null;
  function loadMammoth() {
    if (window.mammoth) return Promise.resolve();
    if (mammothLoad) return mammothLoad;
    mammothLoad = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = CFG.mammoth;
      s.onload = resolve;
      s.onerror = function () { mammothLoad = null; reject(new Error("The Word converter could not be loaded.")); };
      document.head.appendChild(s);
    });
    return mammothLoad;
  }

  ["dragenter", "dragover"].forEach(function (ev) {
    drop.on(ev, function (e) { e.preventDefault(); drop.addClass("is-over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    drop.on(ev, function () { drop.removeClass("is-over"); });
  });
  drop.on("drop", function (e) {
    e.preventDefault();
    var f = e.originalEvent.dataTransfer.files[0];
    if (f) start(f);
  });
  fileIn.on("change", function () { if (this.files[0]) start(this.files[0]); this.value = ""; });
  $("#skrine-word-cancel").on("click", function () { current = null; result.prop("hidden", true); status(""); });
  $("#skrine-word-bold").on("change", function () { if (current) { current = build(current.raw, current.file); show(current); } });

  function start(file) {
    result.prop("hidden", true);
    status("Reading " + file.name + "…");
    readFile(file)
      .then(function (buf) { return toDocx(buf, file.name); })
      .then(function (buf) { status("Converting…"); return loadMammoth().then(function () { return convert(buf); }); })
      .then(function (raw) {
        current = build(raw, file.name);
        show(current);
        status("");
      })
      .catch(function (err) { status(err && err.message ? err.message : "This file could not be read.", true); });
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error("This file could not be read.")); };
      r.readAsArrayBuffer(file);
    });
  }

  /* ---------- file formats ---------- */
  // .docx is used as it is; Word's one-file XML ("flat OPC") is packed back into a .docx
  function toDocx(buf, name) {
    var b = new Uint8Array(buf);
    if (b[0] === 0x50 && b[1] === 0x4b) return buf; // "PK": a zip (.docx)
    if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) {
      throw new Error("This is an old-style Word file (.doc). In Word, use File → Save As → Word Document (.docx), then import that.");
    }
    var text = new TextDecoder("utf-8").decode(b);
    if (/<pkg:package\b/.test(text)) return flatToDocx(text);
    if (/<w:wordDocument\b/.test(text)) {
      throw new Error("This is the old Word 2003 XML format. In Word, use File → Save As → Word Document (.docx) or Word XML Document, then import that.");
    }
    throw new Error(name + " is not a Word document. Please choose a .docx file or a Word XML file.");
  }

  function flatToDocx(text) {
    var xml = new DOMParser().parseFromString(text, "application/xml");
    if (xml.getElementsByTagName("parsererror").length) throw new Error("This XML file could not be read.");
    var PKG = "http://schemas.microsoft.com/office/2006/xmlPackage";
    var parts = xml.getElementsByTagNameNS(PKG, "part");
    var files = [];
    var types = [];
    var enc = new TextEncoder();
    var ser = new XMLSerializer();
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var name = (p.getAttributeNS(PKG, "name") || p.getAttribute("pkg:name") || "").replace(/^\//, "");
      var type = p.getAttributeNS(PKG, "contentType") || p.getAttribute("pkg:contentType") || "";
      var data = p.getElementsByTagNameNS(PKG, "xmlData")[0];
      var bin = p.getElementsByTagNameNS(PKG, "binaryData")[0];
      var bytes;
      if (data) {
        var root = null;
        for (var c = data.firstChild; c; c = c.nextSibling) if (c.nodeType === 1) { root = c; break; }
        if (!root) continue;
        bytes = enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + ser.serializeToString(root));
      } else if (bin) {
        var s = atob(bin.textContent.replace(/\s+/g, ""));
        bytes = new Uint8Array(s.length);
        for (var k = 0; k < s.length; k++) bytes[k] = s.charCodeAt(k);
      } else continue;
      files.push({ name: name, bytes: bytes });
      if (type) types.push('<Override PartName="/' + name.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '" ContentType="' + type + '"/>');
    }
    if (!files.some(function (f) { return f.name === "word/document.xml"; })) throw new Error("No document was found in this XML file.");
    files.unshift({
      name: "[Content_Types].xml",
      bytes: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        types.join("") + "</Types>"),
    });
    return zipStore(files);
  }

  // a .zip with the files stored as they are (no compression)
  var CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(b) { var c = 0xffffffff; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zipStore(files) {
    var enc = new TextEncoder();
    var chunks = [], central = [], offset = 0;
    files.forEach(function (f) {
      var name = enc.encode(f.name), crc = crc32(f.bytes), size = f.bytes.length;
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true);
      chunks.push(new Uint8Array(h.buffer), name, f.bytes);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint32(16, crc, true); c.setUint32(20, size, true); c.setUint32(24, size, true); c.setUint16(28, name.length, true);
      c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), name);
      offset += 30 + name.length + size;
    });
    var csize = central.reduce(function (s, x) { return s + x.length; }, 0);
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, csize, true); e.setUint32(16, offset, true);
    var all = chunks.concat(central, [new Uint8Array(e.buffer)]);
    var out = new Uint8Array(all.reduce(function (s, x) { return s + x.length; }, 0));
    var at = 0;
    all.forEach(function (x) { out.set(x, at); at += x.length; });
    return out.buffer;
  }

  /* ---------- Word → HTML ---------- */
  // each paragraph starts with an invisible tag carrying what mammoth doesn't put in its HTML:
  // alignment, indent and the list it belongs to (numbering style, level, start)
  var M0 = "", M1 = "";
  function convert(buf) {
    var mammoth = window.mammoth;
    function firstText(node) {
      if (!node) return null;
      if (node.type === "text") return node;
      var kids = node.children || [];
      for (var i = 0; i < kids.length; i++) { var t = firstText(kids[i]); if (t) return t; }
      return null;
    }
    /* table colours (from the patched mammoth): the table style's colours for the whole table, header row,
       first column and banded rows, then the colour filled into each cell. Word's order of precedence. */
    function cellFormats(table) {
      var cond = (table.skStyle && table.skStyle.skCondAll) || {};
      var look = table.skLook || { firstRow: true, firstColumn: true, noVBand: true };
      var rows = (table.children || []).filter(function (r) { return r.type === "tableRow"; });
      rows.forEach(function (row, r) {
        var isFirst = r === 0, isLast = r === rows.length - 1;
        var bodyRow = r - (look.firstRow ? 1 : 0);
        var cells = (row.children || []).filter(function (c) { return c.type === "tableCell"; });
        var col = 0;
        cells.forEach(function (cell, ci) {
          var f = {};
          function apply(k) { var x = cond[k]; if (x) Object.keys(x).forEach(function (p) { f[p] = x[p]; }); }
          apply("wholeTable");
          if (table.skShd) f.fill = table.skShd;
          var bodyCol = col - (look.firstColumn ? 1 : 0);
          if (!look.noVBand && bodyCol >= 0) apply(bodyCol % 2 === 0 ? "band1Vert" : "band2Vert");
          if (!look.noHBand && bodyRow >= 0 && !(look.lastRow && isLast)) apply(bodyRow % 2 === 0 ? "band1Horz" : "band2Horz");
          if (look.firstColumn && col === 0) apply("firstCol");
          if (look.lastColumn && ci === cells.length - 1) apply("lastCol");
          if (look.firstRow && isFirst) apply("firstRow");
          if (look.lastRow && isLast) apply("lastRow");
          if (look.firstRow && isFirst && look.firstColumn && col === 0) apply("nwCell");
          if (look.firstRow && isFirst && look.lastColumn && ci === cells.length - 1) apply("neCell");
          if (cell.skShd) f.fill = cell.skShd;
          // shading on the cell's text instead of the cell
          var p0 = (cell.children || [])[0];
          if (!f.fill && p0 && p0.type === "paragraph" && p0.skShd) f.fill = p0.skShd;
          var tags = [];
          if (f.fill) tags.push("cbg=" + f.fill);
          if (f.color && f.color !== "000000") tags.push("cfg=" + f.color);
          if (f.bold) tags.push("cb=1");
          if (tags.length && p0 && p0.type === "paragraph") p0._skCell = tags;
          col += cell.colSpan || 1;
        });
      });
    }
    function tagParagraph(p, inCell) {
      var tags = (p._skCell || []).slice();
      if (p.alignment === "center" || p.alignment === "right" || p.alignment === "end") tags.push("al=" + (p.alignment === "center" ? "center" : "right"));
      var ind = p.indent && parseInt(p.indent.start, 10);
      if (!p.numbering && ind >= 360) tags.push("in=" + Math.min(3, Math.max(1, Math.round(ind / 720))));
      if (p.numbering) {
        tags.push("nf=" + (p.numbering.numFmt || ""), "ni=" + (p.numbering.numId || ""), "lv=" + (p.numbering.level || 0), "st=" + (p.numbering.start || 1),
          "lt=" + encodeURIComponent(p.numbering.lvlText || ""));
      }
      // a shaded paragraph outside a table (e.g. a "Key points" box)
      if (!inCell && p.skShd) tags.push("bg=" + p.skShd);
      if (!tags.length) return;
      var t = firstText(p);
      if (t) t.value = M0 + tags.join(";") + M1 + t.value;
      // no text (an empty cell, or a paragraph holding only an image): carry the tag in a run of its own
      else p.children = [{ type: "run", children: [{ type: "text", value: M0 + tags.join(";") + M1 }] }].concat(p.children || []);
    }
    function walk(node, inCell) {
      if (!node) return;
      if (node.type === "table") cellFormats(node);
      if (node.type === "paragraph") { tagParagraph(node, inCell); return; }
      (node.children || []).forEach(function (c) { walk(c, inCell || node.type === "tableCell"); });
    }
    function transform(doc) { walk(doc, false); return doc; }
    return mammoth.convertToHtml({ arrayBuffer: buf }, {
      transformDocument: transform,
      styleMap: [
        "p[style-name='Title'] => h1.sk-doc-title:fresh",
        "p[style-name='Subtitle'] => p.sk-doc-subtitle:fresh",
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h3:fresh",
        "p[style-name='Heading 3'] => h4:fresh",
        "p[style-name='Heading 4'] => h5:fresh",
        "p[style-name='Quote'] => blockquote > p:fresh",
        "p[style-name='Intense Quote'] => blockquote > p:fresh",
        "u => u",
        "strike => s",
        "comment-reference => ",
      ],
    });
  }

  /* ---------- tidy into the site's alert format ---------- */
  var MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  var LIST_TYPE = { lowerLetter: "a", upperLetter: "A", lowerRoman: "i", upperRoman: "I" };
  var LIST_CLASS = { lowerLetter: "sk-la", upperLetter: "sk-ua", lowerRoman: "sk-lr", upperRoman: "sk-ur" };

  function txt(n) { return (n.textContent || "").replace(/\s+/g, " ").trim(); }
  // a dark fill needs white text
  function isDark(hex) {
    var c = parseInt(hex, 16), r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
  }
  function unwrap(n) { var p = n.parentNode; while (n.firstChild) p.insertBefore(n.firstChild, n); p.removeChild(n); }
  function allBold(n) {
    var t = txt(n);
    if (!t) return false;
    var b = Array.prototype.map.call(n.querySelectorAll("strong, b"), txt).join(" ").replace(/\s+/g, " ").trim();
    return b.length >= t.length - 1;
  }
  function parseDate(s) {
    s = s.toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/,/g, " ").replace(/\s+/g, " ").trim();
    var m = s.match(/^(\d{1,2}) ([a-z]+) (\d{4})$/), d, mo, y;
    if (m) { d = +m[1]; mo = MONTHS.indexOf(m[2]); y = +m[3]; }
    else if ((m = s.match(/^([a-z]+) (\d{1,2}) (\d{4})$/))) { d = +m[2]; mo = MONTHS.indexOf(m[1]); y = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/))) { d = +m[1]; mo = +m[2] - 1; y = +m[3]; }
    else return null;
    if (mo < 0 || d < 1 || d > 31 || y < 1960) return null;
    return y + "-" + pad(mo + 1) + "-" + pad(d);
  }
  // "Alert by A, B and C of the Tax Practice of Skrine" and similar credit lines
  var CREDIT = /^(?:this\s+)?(?:(?:legal\s+)?alert|article|update|note|insight)?\s*(?:is\s+|was\s+)?(?:written|prepared|contributed|authored)?\s*by\s+(.+?)(?:,?\s+(?:of|from)\s+(?:the\s+|our\s+)?(.+?)\s+(?:practice|department|team|group|practice group)(?:\s+(?:of|at)\s+skrine)?)?\s*\.?$/i;

  function build(raw, fileName) {
    var opts = { bold: $("#skrine-word-bold").prop("checked") };
    var doc = new DOMParser().parseFromString("<!doctype html><body>" + raw.value + "</body>", "text/html");
    var body = doc.body;
    var out = { raw: raw, file: fileName, title: "", date: "", authors: [], practice: "", label: "", notes: [], images: 0, tables: 0, warnings: [] };

    // 1. paragraph tags: alignment, indent, list details
    var walker = doc.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    var marked = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.indexOf(M0) > -1) marked.push(walker.currentNode);
    marked.forEach(function (t) {
      var v = t.nodeValue, a = v.indexOf(M0), b = v.indexOf(M1, a);
      if (b < 0) return;
      var info = {};
      v.slice(a + 1, b).split(";").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) info[kv.slice(0, i)] = kv.slice(i + 1); });
      t.nodeValue = v.slice(0, a) + v.slice(b + 1);
      if (!t.parentNode) return;
      // table cell colours: Word's fill, its text colour (or white on a dark fill) and bold header cells
      if (info.cbg || info.cfg || info.cb) {
        var cell = t.parentNode.closest("td, th");
        if (cell) {
          if (info.cbg) cell.style.backgroundColor = "#" + info.cbg;
          var fg = info.cfg || (info.cbg && isDark(info.cbg) ? "FFFFFF" : "");
          if (fg) cell.style.color = "#" + fg;
          if (info.cb) cell.style.fontWeight = "700";
        }
      }
      var block = t.parentNode.closest("p, h1, h2, h3, h4, h5, h6, li");
      if (!block) return;
      if (block.tagName === "LI") {
        if (info.ni) {
          block.dataset.ni = info.ni; block.dataset.lv = info.lv || "0"; block.dataset.nf = info.nf || ""; block.dataset.st = info.st || "1";
          block.dataset.lt = info.lt ? decodeURIComponent(info.lt) : "";
        }
        return;
      }
      if (info.al) block.classList.add("has-text-align-" + info.al);
      if (info.bg && block.tagName === "P") {
        block.classList.add("sk-shaded");
        block.style.backgroundColor = "#" + info.bg;
        if (isDark(info.bg)) block.style.color = "#FFFFFF";
      }
      if (info.in && block.tagName === "P" && !block.closest("td, th, blockquote")) block.classList.add("sk-indent-" + info["in"]);
    });

    // 2. footnotes and endnotes → numbered notes
    var noteItems = {};
    Array.prototype.forEach.call(body.querySelectorAll('li[id^="footnote-"], li[id^="endnote-"]'), function (li) { noteItems[li.id] = li; });
    var n = 0;
    Array.prototype.forEach.call(body.querySelectorAll('a[href^="#footnote-"], a[href^="#endnote-"]'), function (a) {
      var id = a.getAttribute("href").slice(1);
      var li = noteItems[id];
      if (!li || !a.closest("sup")) return;
      n++;
      var c = li.cloneNode(true);
      Array.prototype.forEach.call(c.querySelectorAll('a[href^="#footnote-ref"], a[href^="#endnote-ref"]'), function (x) { x.remove(); });
      var html = Array.prototype.map.call(c.querySelectorAll("p"), function (p) { return p.innerHTML.trim(); }).filter(Boolean).join("<br>") || c.innerHTML.trim();
      out.notes.push(html.replace(/\s*\n\s*/g, " "));
      var sup = a.closest("sup");
      sup.innerHTML = '<a href="#note-' + n + '" id="ref-' + n + '">' + n + "</a>";
    });
    Object.keys(noteItems).forEach(function (id) {
      var ol = noteItems[id].parentNode;
      if (ol && ol.parentNode) ol.parentNode.removeChild(ol);
    });
    Array.prototype.forEach.call(body.querySelectorAll("dl"), function (dl) { if (!txt(dl)) dl.remove(); });

    // 3. lists: Word's numbering style (a, A, i, I) and numbers that carry on after a break
    var counts = {};
    Array.prototype.forEach.call(body.querySelectorAll("li[data-ni]"), function (li) {
      var ni = li.dataset.ni, lv = +li.dataset.lv;
      var c = counts[ni] || (counts[ni] = {});
      c[lv] = (c[lv] || (+li.dataset.st || 1) - 1) + 1;
      Object.keys(c).forEach(function (k) { if (+k > lv) delete c[k]; });
      li.dataset.num = c[lv];
    });
    Array.prototype.forEach.call(body.querySelectorAll("ol"), function (ol) {
      var first = ol.querySelector(":scope > li[data-ni]");
      if (!first) return;
      // type="a" for meaning; the class for the site's styles (CSS can't tell type="a" from type="A")
      var type = LIST_TYPE[first.dataset.nf];
      if (type) { ol.setAttribute("type", type); ol.classList.add(LIST_CLASS[first.dataset.nf]); }
      if (+first.dataset.num > 1) ol.setAttribute("start", first.dataset.num);
      // "(a)" and "a)" numbering (Word's number format for the level)
      var lt = first.dataset.lt || "";
      if (/^\(%\d\)$/.test(lt)) ol.classList.add("sk-paren");
      else if (/^%\d\)$/.test(lt)) ol.classList.add("sk-close");
    });
    Array.prototype.forEach.call(body.querySelectorAll("li"), function (li) {
      ["ni", "lv", "nf", "st", "lt", "num"].forEach(function (k) { delete li.dataset[k]; });
    });

    // 4. clean-up: bookmarks, empty paragraphs, bold inside headings, single paragraphs in table cells
    Array.prototype.forEach.call(body.querySelectorAll("a:not([href])"), function (a) { if (!txt(a)) a.remove(); else unwrap(a); });
    Array.prototype.forEach.call(body.querySelectorAll("p"), function (p) { if (!txt(p) && !p.querySelector("img")) p.remove(); });
    Array.prototype.forEach.call(body.querySelectorAll("h1 strong, h2 strong, h3 strong, h4 strong, h5 strong, h1 b, h2 b, h3 b, h4 b, h5 b"), unwrap);
    Array.prototype.forEach.call(body.querySelectorAll("td, th"), function (cell) {
      var ps = cell.querySelectorAll(":scope > p");
      if (ps.length === 1 && cell.children.length === 1) unwrap(ps[0]);
    });
    Array.prototype.forEach.call(body.querySelectorAll("a[href]"), function (a) {
      var h = a.getAttribute("href");
      if (/^https?:\/\//i.test(h) && h.indexOf(CFG.home) !== 0) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
    });

    // 5. the title, date and author credit at the top (or the credit at the end)
    var blocks = function () { return Array.prototype.filter.call(body.children, function (x) { return txt(x) || x.querySelector("img"); }); };
    var top = blocks()[0];
    var titleEl = body.querySelector("h1.sk-doc-title") || (top && /^H[12]$/.test(top.tagName) ? top : null) ||
      (top && top.tagName === "P" && txt(top).length < 250 && allBold(top) ? top : null);
    if (titleEl) { out.title = txt(titleEl); titleEl.remove(); }
    Array.prototype.forEach.call(body.querySelectorAll("p.sk-doc-subtitle"), function (p) { p.classList.remove("sk-doc-subtitle"); if (!p.className) p.removeAttribute("class"); });
    blocks().slice(0, 4).some(function (b) {
      if (b.tagName !== "P") return false;
      var d = parseDate(txt(b));
      if (d) { out.date = d; b.remove(); return true; }
      return false;
    });
    var bl = blocks();
    bl.slice(0, 3).concat(bl.slice(-4)).some(function (b) {
      if (b.tagName !== "P") return false;
      var t = txt(b).replace(/^[\s—–*-]+/, "");
      if (t.length > 400) return false;
      var m = t.match(CREDIT);
      if (!m || !/\bby\b/i.test(t)) return false;
      out.authors = m[1].replace(/\s*\((?:[^)]*)\)/g, "").split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s*&\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
      out.practice = m[2] ? m[2].replace(/^the\s+/i, "").trim() : "";
      b.remove();
      return true;
    });
    // authors: the name as it is in the People list, when it can be found
    if (window.SkrinePeople) {
      out.authors = out.authors.map(function (a) { var f = window.SkrinePeople.find(a); return f ? f.person.name : a; });
    }
    (CFG.labels || []).some(function (l) {
      if (out.title.toLowerCase().indexOf(l.toLowerCase()) === 0) { out.label = l; return true; }
      return false;
    });

    // 6. bold one-line paragraphs as subheadings (Word files often use bold instead of heading styles)
    if (opts.bold) {
      Array.prototype.forEach.call(body.querySelectorAll(":scope > p"), function (p) {
        var t = txt(p);
        if (t.length > 0 && t.length <= 120 && !/[.:;,]$/.test(t) && allBold(p) && !p.querySelector("img, br")) {
          var h = doc.createElement("h2");
          h.innerHTML = p.innerHTML;
          Array.prototype.forEach.call(h.querySelectorAll("strong, b"), unwrap);
          if (p.className) h.className = p.className;
          p.replaceWith(h);
        }
      });
    }

    // 7. what to tell the person
    out.images = body.querySelectorAll('img[src^="data:"]').length;
    out.tables = body.querySelectorAll("table").length;
    out.coloured = body.querySelectorAll('td[style*="background"], th[style*="background"]').length;
    out.lists = body.querySelectorAll("ul, ol").length;
    out.headings = body.querySelectorAll("h2, h3, h4, h5").length;
    out.excerpt = "";
    var firstP = body.querySelector(":scope > p");
    if (firstP) {
      var plain = firstP.cloneNode(true);
      Array.prototype.forEach.call(plain.querySelectorAll("sup"), function (s) { s.remove(); }); // footnote numbers
      var words = txt(plain).split(" ");
      out.excerpt = words.slice(0, 45).join(" ") + (words.length > 45 ? "…" : "");
    }
    var seen = {};
    (raw.messages || []).forEach(function (m) {
      var t = String(m.message || "");
      if (/Unrecognised (paragraph|run) style/i.test(t)) return; // Word's own style names: the site's design is used instead
      if (seen[t]) return;
      seen[t] = 1;
      out.warnings.push(t);
    });
    if (body.querySelector("img:not([src])")) out.warnings.push("Some images could not be read from the file.");

    out.html = body.innerHTML.replace(/\s*<(p|h[2-6]|ul|ol|table|blockquote)\b/g, "\n<$1").trim();
    return out;
  }

  /* ---------- show the result ---------- */
  function show(r) {
    $("#skrine-word-name").text(r.file);
    var dl = $("#skrine-word-summary").empty();
    function row(k, v, missing) {
      dl.append($("<dt>").text(k));
      dl.append($("<dd>").toggleClass("is-missing", !!missing).text(v));
    }
    row("Title", r.title || "Not found: type it in the title box", !r.title);
    row("Date", r.date ? r.date.split("-").reverse().join("/") : "Not found: set it under Publish", !r.date);
    row("Authors", r.authors.length ? r.authors.join(", ") : "No author credit found", !r.authors.length);
    if (r.practice) row("Practice", r.practice);
    if (r.label) row("Label", r.label);
    var bits = [];
    if (r.headings) bits.push(r.headings + (r.headings === 1 ? " subheading" : " subheadings"));
    if (r.lists) bits.push(r.lists + (r.lists === 1 ? " list" : " lists"));
    if (r.tables) bits.push(r.tables + (r.tables === 1 ? " table" : " tables") + (r.coloured ? " (" + r.coloured + " coloured cells kept)" : ""));
    if (r.notes.length) bits.push(r.notes.length + (r.notes.length === 1 ? " footnote" : " footnotes"));
    if (r.images) bits.push(r.images + (r.images === 1 ? " image (uploaded to the Media Library)" : " images (uploaded to the Media Library)"));
    row("Content", bits.length ? bits.join(" · ") : "Text only");

    var warn = $("#skrine-word-warnings").empty();
    r.warnings.slice(0, 6).forEach(function (w) { warn.append($("<li>").text(w)); });
    warn.prop("hidden", !r.warnings.length);

    result.prop("hidden", false);
    var frameBox = result.find(".skrine-pv-frame");
    fit(frameBox);
    postPreview("skrine-word-frame", previewFields(r));
    $("html, body").animate({ scrollTop: result.offset().top - 60 }, 300);
  }

  function previewFields(r) {
    var f = fields();
    var all = $("#skrine-word-fields").prop("checked");
    f.sk_content = r.html;
    f.sk_notes = r.notes.join("\n");
    if (all) {
      if (r.title) f.sk_title = r.title;
      if (r.date) f.sk_date = r.date;
      if (r.authors.length) f.sk_authors = r.authors.join("\n");
      if (r.practice) f.sk_practice = shortPractice(r.practice);
      if (r.label) f.sk_label = r.label;
      var t = matchTopic(r.practice);
      if (t) f.sk_topic = t.name;
    }
    return f;
  }
  $("#skrine-word-fields").on("change", function () { if (current) postPreview("skrine-word-frame", previewFields(current)); });

  // "Tax, SST and Customs" → "Tax" for the short practice label on cards
  function shortPractice(p) { return p.replace(/\s+practice$/i, "").split(/\s*(?:,|&| and )\s*/)[0] || p; }
  function words(s) { return String(s || "").toLowerCase().replace(/&/g, " ").split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2 && w !== "and" && w !== "the"; }); }
  function matchTopic(practice) {
    if (!practice) return null;
    var pw = words(practice), best = null, bestScore = 0;
    (CFG.topics || []).forEach(function (t) {
      var tw = words(t.name);
      var score = pw.filter(function (w) { return tw.indexOf(w) > -1; }).length;
      if (score > bestScore) { best = t; bestScore = score; }
    });
    return best;
  }

  /* ---------- "Use this content" ---------- */
  $("#skrine-word-use").on("click", function () {
    if (!current) return;
    var r = current;
    var has = $.trim(getContent().replace(/<[^>]+>/g, ""));
    if (has && !window.confirm("Replace the alert's current text with the Word file's content?")) return;
    var btn = $(this).prop("disabled", true);
    uploadImages(r.html)
      .then(function (html) {
        setContent(html);
        $("#skrine_f_notes").val(r.notes.join("\n")).trigger("change");
        if ($("#skrine-word-fields").prop("checked")) fillFields(r);
        result.prop("hidden", true);
        current = null;
        status("Done. Check the preview below, then Save Draft or Publish.");
        refresh();
        var target = $("#postdivrich");
        if (target.length) $("html, body").animate({ scrollTop: target.offset().top - 60 }, 300);
      })
      .catch(function (err) { status((err && err.message) || "The images could not be uploaded.", true); })
      .then(function () { btn.prop("disabled", false); });
  });

  function fillFields(r) {
    if (r.title) {
      $("#title").val(r.title).trigger("input");
      $("#title-prompt-text").addClass("screen-reader-text");
    }
    if (r.date) {
      var p = r.date.split("-");
      $("#aa").val(p[0]);
      $("#mm").val(p[1]);
      $("#jj").val(p[2]);
      // show the new date in the Publish box (WordPress saves it from these fields)
      var stamp = $("#timestamp b");
      if (stamp.length) stamp.text(p[2] + " " + $("#mm option:selected").text().replace(/^\d+-/, "") + " " + p[0]);
    }
    if (r.authors.length) {
      $("#skrine_f_authors").val(r.authors.join("\n"));
      $('.skrine-people[data-target="skrine_f_authors"]').trigger("skrine:reload");
    }
    if (r.practice) $("#skrine_f_practice").val(shortPractice(r.practice)).trigger("change");
    if (r.label) $("#skrine_f_label").val(r.label).trigger("change");
    var t = matchTopic(r.practice);
    if (t) {
      $("#skrine_topicchecklist input[type=checkbox]").prop("checked", false);
      $('#skrine_topicchecklist input[type=checkbox][value="' + t.id + '"]').prop("checked", true).trigger("change");
    }
    if (r.excerpt && !$.trim($("#excerpt").val())) $("#excerpt").val(r.excerpt);
  }

  // images inside the Word file → Media Library, then their addresses in the text
  function uploadImages(html) {
    var doc = new DOMParser().parseFromString("<body>" + html + "</body>", "text/html");
    var imgs = Array.prototype.slice.call(doc.querySelectorAll('img[src^="data:"]'));
    if (!imgs.length) return Promise.resolve(html);
    if (!window.wp || !wp.apiFetch) return Promise.reject(new Error("The images could not be uploaded (the media uploader isn't available)."));
    var done = 0;
    status("Uploading " + imgs.length + (imgs.length === 1 ? " image…" : " images…"));
    var base = ($("#title").val() || current.title || "alert").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "alert";
    return imgs.reduce(function (chain, img, i) {
      return chain.then(function () {
        var m = img.getAttribute("src").match(/^data:([^;]+);base64,(.*)$/);
        if (!m) return;
        var bin = atob(m[2]), bytes = new Uint8Array(bin.length);
        for (var k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
        var ext = (m[1].split("/")[1] || "png").replace("jpeg", "jpg").replace(/\+.*/, "");
        var form = new FormData();
        form.append("file", new Blob([bytes], { type: m[1] }), base + "-" + (i + 1) + "." + ext);
        if (img.getAttribute("alt")) form.append("alt_text", img.getAttribute("alt"));
        if (CFG.postId) form.append("post", CFG.postId);
        return wp.apiFetch({ path: "/wp/v2/media", method: "POST", body: form }).then(function (media) {
          img.setAttribute("src", media.source_url);
          if (media.id) img.classList.add("wp-image-" + media.id);
          done++;
          status("Uploading images… " + done + " of " + imgs.length);
        });
      });
    }, Promise.resolve()).then(function () { return doc.body.innerHTML; });
  }

  /* ---------- start ---------- */
  $(function () {
    fitAll();
    if (box.length) setTimeout(refresh, 300);
  });
})(jQuery);
