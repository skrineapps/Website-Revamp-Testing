/* =========================================================
   SKRINE — pick a photo for an alert / article
   Neither data file has its own images, so we use the practice-area
   and sector photos: first by keywords in the title (so items sharing
   a topic still get varied, relevant pictures), then by topic/practice.
   Paths are relative to pages in /new design/.
   ========================================================= */
(function () {
  "use strict";
  var P = "images/practice/", S = "images/sectors/";

  // [pattern in the title, photo]: first match wins
  var KEYWORDS = [
    [/aviation|airline|flight|airport|航班|航空|机场/i, S + "aviation.jpg"],
    [/insurance|insurer|takaful|保险/i, S + "insurance-and-reinsurance.jpg"],
    [/medical|health|hospital|pharma|\bdrugs?\b|clinic|\bfood/i, S + "healthcare-biotechnology-and-pharmaceuticals.jpg"],
    [/\boil\b|gas field|petroleum|energy|renewable|solar|electricity|cress/i, S + "oil-and-gas-and-energy.jpg"],
    [/\bship|vessel|cargo|maritime|admiralty|\bports?\b|海事|船/i, P + "maritime-and-shipping.jpg"],
    [/strata|management corporation|common property|joint management/i, P + "strata-management.jpg"],
    [/construction|cipaa|adjudicat|contractor|building/i, P + "construction-and-engineering.jpg"],
    [/fraud|corrupt|macc|money laundering|bribe|anti-corruption|white collar/i, P + "fraud-and-asset-recovery.jpg"],
    [/insolven|winding[- ]up|bankrupt|restructur|liquidat|清盘|破产|重组|清算/i, P + "restructuring-and-insolvency.jpg"],
    [/\btax|budget|customs|anti-dumping|countervailing|\bgst\b|\bsst\b|税/i, P + "tax-and-revenue.jpg"],
    [/bank negara|\bbnm\b|\bbank|financ|fintech|sukuk|\bbonds?\b|securities|payment|e-money|\bloans?\b|credit|银行|金融|贷款/i, P + "banking-and-finance.jpg"],
    [/\bdata\b|privacy|cyber|digital|artificial intelligence|\bai\b|online|internet|communications|multimedia|telecom|数据|个人信息/i, S + "telecommunications-media-and-technology.jpg"],
    [/trade ?mark|patent|copyright|intellectual property|\bip\b|\bbrand|商标|专利|版权/i, P + "intellectual-property-and-tmt.jpg"],
    [/employ|salary|wage|worker|dismiss|termination|labour|industrial relations|harass|雇员|雇主|员工|劳/i, P + "employment.jpg"],
    [/\bproperty|\bland\b|tenan|landlord|housing|developer|real estate|vacant possession|房/i, P + "real-estate.jpg"],
    [/court|appeal|arbitrat|litigation|judgment|tribunal|dispute|法院|法庭|诉讼|仲裁|判决/i, P + "litigation-and-arbitration.jpg"],
    [/competition|mycc|cartel|bid-rigging|anti-competitive|竞争/i, P + "regulatory-compliance.jpg"],
    [/company|companies|director|shareholder|merger|acquisition|corporate|joint venture|竞业|公司|董事|股东/i, P + "corporate.jpg"]
  ];

  // topic / practice names used by alerts-data.js and articles-data.js
  var TOPICS = {
    "corporate & m&a": P + "corporate.jpg", "corporate": P + "corporate.jpg",
    "transaction news": P + "corporate-structures-and-secretarial-services.jpg",
    "employment": P + "employment.jpg", "employment law": P + "employment.jpg",
    "regulatory & compliance": P + "regulatory-compliance.jpg", "regulatory compliance": P + "regulatory-compliance.jpg",
    "maritime & shipping": P + "maritime-and-shipping.jpg", "maritime and shipping": P + "maritime-and-shipping.jpg",
    "tax": P + "tax-and-revenue.jpg", "tax and revenue": P + "tax-and-revenue.jpg",
    "banking & finance": P + "banking-and-finance.jpg", "banking and finance": P + "banking-and-finance.jpg",
    "real estate": P + "real-estate.jpg",
    "dispute resolution": P + "litigation-and-arbitration.jpg", "litigation and arbitration": P + "litigation-and-arbitration.jpg",
    "competition & trade": P + "regulatory-compliance.jpg",
    "tmt & intellectual property": P + "intellectual-property-and-tmt.jpg", "intellectual property and tmt": P + "intellectual-property-and-tmt.jpg",
    "restructuring & insolvency": P + "restructuring-and-insolvency.jpg", "restructuring and insolvency": P + "restructuring-and-insolvency.jpg",
    "construction and engineering": P + "construction-and-engineering.jpg"
  };

  window.SkrineTopicImage = function (topic, title, practice) {
    var t = String(title || "");
    for (var i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][0].test(t)) return KEYWORDS[i][1];
    var k = String(topic || "").toLowerCase();
    if (TOPICS[k]) return TOPICS[k];
    k = String(practice || "").toLowerCase();
    if (TOPICS[k]) return TOPICS[k];
    return P + "corporate.jpg";
  };
})();
