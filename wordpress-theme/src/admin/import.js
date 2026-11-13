/* Skrine → Import: runs each step in small batches and shows progress */
(function () {
  "use strict";
  var cfg = window.SKRINE_IMPORT;
  var run = document.getElementById("skrineRun");
  var box = document.getElementById("skrineProgress");
  var list = document.getElementById("skrineSteps");
  var status = document.getElementById("skrineStatus");
  if (!cfg || !run) return;

  var rows = {};
  cfg.steps.forEach(function (s) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="skrine-step-label"></span> <progress max="1" value="0"></progress> <span class="skrine-step-count"></span>';
    li.querySelector(".skrine-step-label").textContent = s.label;
    li.querySelector("progress").max = s.total || 1;
    li.querySelector(".skrine-step-count").textContent = "0 / " + s.total;
    list.appendChild(li);
    rows[s.key] = li;
  });

  function post(step, offset, overwrite) {
    var body = new URLSearchParams({ action: "skrine_import", nonce: cfg.nonce, step: step, offset: String(offset), overwrite: overwrite ? "1" : "" });
    return fetch(cfg.ajax, { method: "POST", credentials: "same-origin", body: body }).then(function (r) {
      return r.json().catch(function () { throw new Error("The server stopped responding (HTTP " + r.status + ")."); });
    }).then(function (j) {
      if (!j.success) throw new Error(typeof j.data === "string" ? j.data : "The import step failed.");
      return j.data;
    });
  }

  function runStep(i, overwrite) {
    if (i >= cfg.steps.length) {
      status.textContent = "Finished. Everything is in WordPress now and can be edited.";
      run.disabled = false;
      run.textContent = "Run the import again";
      return;
    }
    var s = cfg.steps[i];
    var li = rows[s.key];
    li.className = "is-running";
    function next(offset, tries) {
      if (offset >= s.total) {
        li.className = "is-done";
        runStep(i + 1, overwrite);
        return;
      }
      status.textContent = s.label + "…";
      post(s.key, offset, overwrite).then(function (r) {
        li.querySelector("progress").value = r.done;
        li.querySelector(".skrine-step-count").textContent = r.done + " / " + r.total;
        next(r.done, 0);
      }).catch(function (err) {
        if (tries < 3) { setTimeout(function () { next(offset, tries + 1); }, 2000); return; }
        li.className = "is-failed";
        status.textContent = "Stopped: " + err.message + " Click the button to carry on from here.";
        run.disabled = false;
      });
    }
    next(0, 0);
  }

  run.addEventListener("click", function () {
    run.disabled = true;
    box.hidden = false;
    runStep(0, document.getElementById("skrineOverwrite").checked);
  });
})();
