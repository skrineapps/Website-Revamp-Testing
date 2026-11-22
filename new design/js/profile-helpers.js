/* =========================================================
   SKRINE — rules for the profile page (profile.html)
   - SkrineProfile.givenName(name): the name a person goes by, for
     "About <given name>". Malaysian names vary (Western first name,
     Chinese surname-first, Malay/Indian), so it is listed per person;
     anyone not listed falls back to the first word.
   - SkrineProfile.shortOverview(paragraphs): the opening of the bio,
     enough paragraphs to reach ~40 words, at most two.
   - SkrineProfile.TOP_MATTERS: how many selected matters show before "Show more".
   ========================================================= */
window.SkrineProfile = (function () {
  "use strict";
  var GIVEN = {
    "Alyshea Low Khye Lyn": "Alyshea",
    "Ashok Kumar Mahadev Ranai": "Ashok",
    "Aufa Radzi": "Aufa",
    "Brenda Chan": "Brenda",
    "Charmayne Ong Poh Yin": "Charmayne",
    "Chen Kah Leng": "Kah Leng",
    "Chin Yoong Chong": "Yoong Chong",
    "Claudia Cheah Pek Yee": "Claudia",
    "Engy Tan": "Engy",
    "Fariz Abdul Aziz": "Fariz",
    "Foo Siew Li": "Siew Li",
    "Gooi Yang Shuh": "Yang Shuh",
    "Ivan Loo": "Ivan",
    "Jesy Ooi": "Jesy",
    "Jillian Chia Yan Ping": "Jillian",
    "Joshua Teoh Beni Chris": "Joshua",
    "Kailash Kalaiarasu": "Kailash",
    "Kok Chee Kheong": "Chee Kheong",
    "Kuek Pei Yee": "Pei Yee",
    "Lee Ai Hsian": "Ai Hsian",
    "Lee Tatt Boon": "Tatt Boon",
    "Leela Devi Baskaran": "Leela",
    "Lim Koon Huan": "Koon Huan",
    "Loo Peh Fern": "Peh Fern",
    "Loshini Ramarmuty": "Loshini",
    "Louise Jacqueline Azmi": "Louise",
    "Manshan Singh": "Manshan",
    "Melissa Long": "Melissa",
    "Mubashir Mansor": "Mubashir",
    "Muhammad Suhaib Ibrahim": "Suhaib",
    "Natalie Lim Yen Kuan": "Natalie",
    "Nimalan Devaraja": "Nimalan",
    "Phua Pao Yii": "Pao Yii",
    "Preetha Pillai": "Preetha",
    "Rachel Chiah": "Rachel",
    "Ratha Govindasamy": "Ratha",
    "Richard Khoo Boo Hin": "Richard",
    "Sara Lau": "Sara",
    "Selvamalar Alagaratnam": "Selvamalar",
    "Sharon Chong Tze Ying": "Sharon",
    "Sheba Gumis": "Sheba",
    "Tan Shi Wen": "Shi Wen",
    "Tan Sri Dato’ V.C. George": "Tan Sri V.C. George",
    "Tan Wei Liang": "Wei Liang",
    "Tan Wei Xian": "Wei Xian",
    "Tatvaruban Subramaniam": "Tatvaruban",
    "Teh Hong Koon": "Hong Koon",
    "To' Puan Janet Looi": "Janet",
    "Trevor Jason Mark Padasian": "Trevor",
    "Vijay Raj": "Vijay",
    "Wong Chee Lin": "Chee Lin"
  };
  function givenName(name) {
    if (GIVEN[name]) return GIVEN[name];
    var n = String(name || "").replace(/^(To'|Tan Sri|Dato'?|Datin|Datuk|Dr\.?)\s+/i, "");
    return n.split(/\s+/)[0] || name;
  }
  function shortOverview(paras) {
    var out = [], words = 0;
    for (var i = 0; i < paras.length && out.length < 2; i++) {
      if (words >= 40) break;
      out.push(paras[i]);
      words += paras[i].split(/\s+/).length;
    }
    return out;
  }
  return { givenName: givenName, shortOverview: shortOverview, TOP_MATTERS: 3 };
})();
