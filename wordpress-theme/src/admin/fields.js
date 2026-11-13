/* Skrine fields: pick a file (PDF) or a photo gallery from the Media Library */
(function ($) {
  "use strict";

  $(document).on("click", ".skrine-pick-file", function (e) {
    e.preventDefault();
    var input = document.getElementById($(this).data("target"));
    var frame = wp.media({ title: "Choose a file", button: { text: "Use this file" }, multiple: false });
    frame.on("select", function () {
      input.value = frame.state().get("selection").first().get("url");
    });
    frame.open();
  });

  $(document).on("click", ".skrine-pick-gallery", function (e) {
    e.preventDefault();
    var id = $(this).data("target");
    var input = document.getElementById(id);
    var preview = $('.skrine-gallery-preview[data-target="' + id + '"]');
    var button = $(this);
    var ids = input.value ? input.value.split(",") : [];
    var frame = wp.media({ title: "Photo gallery", button: { text: "Use these photos" }, multiple: "add", library: { type: "image" } });
    frame.on("open", function () {
      var sel = frame.state().get("selection");
      ids.forEach(function (aid) {
        var a = wp.media.attachment(aid);
        a.fetch();
        sel.add(a);
      });
    });
    frame.on("select", function () {
      var chosen = frame.state().get("selection").toJSON();
      input.value = chosen.map(function (a) { return a.id; }).join(",");
      preview.empty();
      chosen.forEach(function (a) {
        var src = a.sizes && a.sizes.thumbnail ? a.sizes.thumbnail.url : a.url;
        preview.append($("<img>").attr({ src: src, alt: "" }));
      });
      button.text(chosen.length ? "Edit gallery" : "Add photos");
    });
    frame.open();
  });

  /* ---------- people picker ----------
     Tags Skrine people; the hidden textarea keeps one name per line (what the site reads).
     Each chip says where the name will link, using the site's own matching (js/people-links.js). */
  var ROLE = { partners: "Partner", consultants: "Consultant", seniorAssociates: "Senior Associate", associates: "Associate" };

  function describe(name) {
    var f = window.SkrinePeople && window.SkrinePeople.find(name);
    if (!f) return { text: "Not at Skrine: no link", linked: false };
    var to = f.group === "partners" || f.group === "consultants" ? "links to profile" : "links to People page";
    var who = f.person.name !== name ? f.person.name + ", " : "";
    return { text: who + ROLE[f.group] + " · " + to, linked: true };
  }

  function initPicker(box) {
    var area = document.getElementById(box.data("target"));
    var chips = box.find(".skrine-people-chips");
    var search = box.find(".skrine-people-search");
    var names = area.value.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    var dragFrom = null;

    function save() { area.value = names.join("\n"); }
    function render() {
      chips.empty();
      names.forEach(function (n, i) {
        var d = describe(n);
        var li = $('<li class="skrine-chip" draggable="true"></li>').toggleClass("is-external", !d.linked);
        li.append($('<span class="skrine-chip-name"></span>').text(n));
        li.append($('<span class="skrine-chip-note"></span>').text(d.text));
        li.append($('<button type="button" class="skrine-chip-remove"></button>').attr("aria-label", "Remove " + n).text("×"));
        li.on("click", ".skrine-chip-remove", function () { names.splice(i, 1); save(); render(); });
        li.on("dragstart", function () { dragFrom = i; li.addClass("is-dragging"); });
        li.on("dragend", function () { li.removeClass("is-dragging"); });
        li.on("dragover", function (e) { e.preventDefault(); });
        li.on("drop", function (e) {
          e.preventDefault();
          if (dragFrom === null || dragFrom === i) return;
          var moved = names.splice(dragFrom, 1)[0];
          names.splice(i, 0, moved);
          dragFrom = null;
          save();
          render();
        });
        chips.append(li);
      });
    }
    function add() {
      var v = $.trim(search.val());
      if (!v) return;
      if (names.indexOf(v) === -1) names.push(v);
      search.val("");
      save();
      render();
      search.trigger("focus");
    }
    box.on("click", ".skrine-people-add", add);
    search.on("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    // picking from the list adds straight away
    search.on("input", function () {
      var v = search.val();
      if ($('#skrine-people-list option').filter(function () { return this.value === v; }).length) add();
    });
    render();
  }
  $(function () { $(".skrine-people").each(function () { initPicker($(this)); }); });

  /* ---------- block editor (Alerts, News): open the field panel ----------
     Newer WordPress folds the boxes under the editor into a thin "Meta Boxes" bar,
     where the details (authors, footnotes, gallery…) are easy to miss. Open it once. */
  (function openMetaBoxes(tries) {
    var btn = document.querySelector(".edit-post-meta-boxes-main__presenter > button[aria-expanded]");
    if (btn) { if (btn.getAttribute("aria-expanded") === "false") btn.click(); return; }
    if (tries < 40 && document.body.classList.contains("block-editor-page")) setTimeout(function () { openMetaBoxes(tries + 1); }, 250);
  })(0);

  /* ---------- People: show only the fields for the chosen role ---------- */
  function syncRoles() {
    var role = $("#skrine_f_group").val();
    $(".skrine-fields tr[data-roles]").each(function () {
      $(this).toggle(!role || this.getAttribute("data-roles").split(" ").indexOf(role) > -1);
    });
  }
  $(document).on("change", "#skrine_f_group", syncRoles);
  $(syncRoles);

  $(document).on("click", ".skrine-clear-gallery", function (e) {
    e.preventDefault();
    var id = $(this).data("target");
    document.getElementById(id).value = "";
    $('.skrine-gallery-preview[data-target="' + id + '"]').empty();
    $('.skrine-pick-gallery[data-target="' + id + '"]').text("Add photos");
  });
})(jQuery);
