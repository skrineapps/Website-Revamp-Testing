/* =========================================================
   SKRINE — Sample upcoming events (review aid only)
   Loaded after js/news-data.js on the home page and News & Events.

   ?events=demo  fills SKRINE_UPCOMING with sample events (dated a few
                 weeks from today, so they always count as upcoming)
   ?events=none  empties it, to see the pages with no events
   The choice is remembered for the visit. A "Test events" pill (bottom
   left) is always shown to switch between them; on "Off" the real data
   in js/news-data.js is used.
   Delete this file and its <script> tags before going live.
   ========================================================= */
(function () {
  var KEY = "skrine-events-test";
  var asked = new URLSearchParams(location.search).get("events");
  var mode = null;
  try {
    if (asked === "demo" || asked === "none") sessionStorage.setItem(KEY, asked);
    if (asked === "real") sessionStorage.removeItem(KEY);
    mode = sessionStorage.getItem(KEY);
  } catch (e) { mode = asked === "demo" || asked === "none" ? asked : null; }
  // the switch is always shown (so it can be found); with no choice the real data is used
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pill); else pill();
  if (!mode) return;

  function inDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  if (mode === "none") {
    window.SKRINE_UPCOMING = [];
  } else {
    window.SKRINE_UPCOMING = [
      {
        title: "Employment Law Outlook: What Employers Need to Know for the Year Ahead",
        date: inDays(12),
        time: "9:00 am – 12:30 pm",
        location: "Skrine, Wisma UOA Damansara, Kuala Lumpur",
        format: "In person",
        type: "Seminar",
        summary: "A practical briefing on recent amendments, enforcement trends and the questions HR teams are asking most, with time for your own questions.",
        takeaways: [
          "What the latest amendments change for day-to-day HR",
          "How the courts and the Industrial Court are reading them",
          "A checklist to review your policies and contracts"
        ],
        cpd: "CPD points apply",
        people: ["Selvamalar Alagaratnam", "Leela Devi Baskaran"],
        register: "contact.html"
      },
      {
        title: "Arbitration in Asia: Drafting Clauses That Hold Up",
        date: inDays(26),
        time: "3:00 pm – 4:30 pm (MYT)",
        location: "Online",
        format: "Webinar",
        type: "Webinar",
        summary: "How to choose seats, rules and institutions for cross-border contracts, and the drafting slips that send disputes to court instead.",
        takeaways: ["Choosing the seat and the rules", "Common drafting pitfalls", "Enforcing awards in Malaysia"],
        people: ["Ivan Loo", "Lim Koon Huan"],
        register: "contact.html"
      },
      {
        title: "Data Protection Update: PDPA Amendments in Practice",
        date: inDays(41),
        time: "10:00 am – 12:00 pm",
        location: "Kuala Lumpur",
        format: "In person",
        type: "Breakfast briefing",
        summary: "What the amended PDPA asks of businesses now, from breach notification to data portability, explained with real scenarios.",
        people: ["Charmayne Ong Poh Yin"],
        register: "contact.html"
      }
    ].map(function (e) { e.sample = true; return e; });
  }

  // the switch, bottom left (so it never covers the design pill)
  function pill() {
    var here = location.pathname + location.hash;
    var nav = document.createElement("nav");
    nav.className = "events-test";
    nav.setAttribute("aria-label", "Test events");
    nav.innerHTML = '<span>Test events</span>' +
      '<a href="' + location.pathname + '?events=demo' + location.hash + '"' + (mode === "demo" ? ' aria-current="true"' : "") + '>With events</a>' +
      '<a href="' + location.pathname + '?events=none' + location.hash + '"' + (mode === "none" ? ' aria-current="true"' : "") + '>No events</a>' +
      '<a href="' + location.pathname + '?events=real' + location.hash + '"' + (!mode ? ' aria-current="true"' : '') + '>Off</a>';
    document.body.appendChild(nav);
  }
})();
