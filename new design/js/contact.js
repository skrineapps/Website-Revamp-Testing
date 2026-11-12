/* =========================================================
   SKRINE — Contact: the enquiry form is a design preview only.
   Submitting shows a note instead of sending anything.
   ========================================================= */
(function () {
  "use strict";
  var form = document.getElementById("enquiryForm");
  var note = document.getElementById("formPreview");
  if (!form || !note) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    note.hidden = false;
  });
})();
