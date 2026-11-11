/* =========================================================
   SKRINE — People directory data
   Edit this file to add, remove or update people.
   - photo:  file name inside "current design/images/people/".
             If omitted, the page looks for "<Full Name>.png" in that folder
             (e.g. "Loshini Ramarmuty.png") and shows initials if it isn't there.
   - division: shown under the name on partner/consultant cards; leave it out to
               show the name only. Partner divisions come from the PEOPLE.png mockup;
               entries marked "inferred" were guessed from their practice areas.
   - areas:  practice areas (used by search and the filters; not shown on cards)
   - keyAreas / quals / affiliations: shown in the senior associate pop-up
   Sources: partners, senior associates and associates from skrine.com/people
   (Nov 2026); consultants from the PEOPLE.png mockup.
   ========================================================= */
window.SKRINE_PEOPLE = {
  partners: [
    { name: "Chin Yoong Chong", photo: "Chin Yoong Chong.png", division: "Corporate", areas: ["Real Estate","Notary Public"] },
    { name: "To' Puan Janet Looi", photo: "To Puan Janet Looi.png", division: "Corporate", areas: ["Mergers & Acquisitions","Corporate Governance","Corporate Restructuring","Environment","Competition"] },
    { name: "Charmayne Ong Poh Yin", photo: "Charmayne Ong.png", division: "Intellectual Property", areas: ["Technology, Media and Telecommunications","Intellectual Property","Data Protection"] },
    { name: "Mubashir Mansor", photo: "Mubasir Mansor.png", division: "Dispute Resolution", areas: ["Domestic and International Arbitration","Fraud and Asset Recovery","Cross-border Disputes","Contractual Disputes (including construction disputes)","Blockchain Disputes","Aviation Disputes (including inquests on air accidents)","Company Law (particularly Corporate and Shareholders' Disputes)","Commercial and Contractual Disputes","Tort (particularly Defamation)","Media Law","Administrative Law & Constitutional Law","Insurance and Reinsurance","International Organisations – Privileges and Immunities"] },
    { name: "Ivan Loo", photo: "Ivan Loo.png", division: "Dispute Resolution", areas: ["International Arbitration","Construction Litigation, Arbitration and Adjudication","Oil & Gas, and Energy Disputes"] },
    { name: "Phua Pao Yii", photo: "Phua Pao Yii.png", division: "Corporate", areas: ["Mergers & Acquisitions","Corporate Advisory and Transactions"] },
    { name: "Lim Koon Huan", photo: "Lim Koon Huan.png", division: "Dispute Resolution", areas: ["Corporate and Commercial Litigation","Compliance and Investigations","Trade Remedies","Sanctions and Export Control","Fraud and Asset Recovery","Banking and Finance","White-Collar Crimes"] },
    { name: "Ashok Kumar Mahadev Ranai", photo: "Ashok.png", division: "Dispute Resolution", areas: ["Construction Litigation, Arbitration and Adjudication","Oil and Gas, and Energy Disputes","Construction Inquiries and Investigations"] },
    { name: "Selvamalar Alagaratnam", photo: "Selvamalar.png", division: "Dispute Resolution", areas: ["Employment Advisory and Compliance","Employment Disputes","Environmental, Social and Governance","Employee Fraud Management and Investigations","Medical Negligence"] },
    { name: "Preetha Pillai", photo: "Preetha.png", division: "Dispute Resolution", areas: ["Commercial Litigation and Arbitration","Fraud and Asset Recovery","Tax Litigation, Audits and Investigations","International Arbitration","Administrative Law"] },
    { name: "Claudia Cheah Pek Yee", photo: "Claudia.png", division: "Dispute Resolution", areas: ["Banking and Finance Litigation","Restructuring and Insolvency","Civil Litigation","Commercial Litigation and Arbitration"] },
    { name: "Loo Peh Fern", photo: "Loo Peh Fern.png", division: "Dispute Resolution", areas: ["Insurance and Reinsurance Disputes","Professional Negligence","Medical Negligence","Banking and Finance Litigation","Commercial Litigation and Arbitration","Tenancy Disputes"] },
    { name: "Leela Devi Baskaran", photo: "Leela.png", division: "Intellectual Property", areas: ["IP Registration and Prosecution","Branding, Franchising and Licensing","Technology, Media and Telecommunications"] },
    { name: "Vijay Raj", photo: "Vijay.png", division: "Dispute Resolution", areas: ["Commercial Litigation and Arbitration","Rates, Assessment and Valuations","Land Acquisition and Land Law","Aviation & Shipping Disputes"] },
    { name: "Kuek Pei Yee", photo: "Kuek Pei Yee.png", division: "Intellectual Property", areas: ["IP Litigation and Enforcement","Advertising and Product Liability","Consumer Protection Disputes","IP Registration and Prosecution","TMT Disputes"] },
    { name: "Teh Hong Koon", photo: "Teh Hong Koon.png", division: "Intellectual Property", areas: ["IP Advisory, Registration and Prosecution","Life Science","Franchise Advisory and Registration","Advertising and Product Liability","Cosmetics, Pharmaceutical and Medical Device Compliance"] },
    { name: "Richard Khoo Boo Hin", photo: "Richard.png", division: "Dispute Resolution", areas: ["Energy","Projects and Infrastructure","Project Management","Construction Compliance and Advisory"] },
    { name: "Fariz Abdul Aziz", photo: "Fariz.png", division: "Corporate", areas: ["Oil & Gas, and Energy","Mergers & Acquisitions","Maritime and Shipping Advisory"] },
    { name: "Jillian Chia Yan Ping", photo: "Jillian.png", division: "Intellectual Property", areas: ["Privacy and Data Protection","Technology, Media and Telecommunications","IP Registration and Prosecution"] },
    { name: "Sharon Chong Tze Ying", division: "Dispute Resolution", areas: ["International Arbitration","Oil & Gas, and Commodity Disputes","Aviation Disputes","Commercial Litigation and Arbitration","Company Law and Shareholders' Disputes","Restructuring and Insolvency","Regulatory Enforcement","Fraud and Asset Recovery"] },
    { name: "Sheba Gumis", division: "Corporate", areas: ["Mergers & Acquisition","Corporate Advisory and Transactions","Education","Hospitality and Tourism","Tax"] },
    { name: "Foo Siew Li", division: "Dispute Resolution", areas: ["Employment Advisory and Disputes","Employee Fraud Management and Investigations","Fraud and Asset Recovery","Immigration"] },
    { name: "Tan Shi Wen", division: "Corporate", areas: ["Mergers & Acquisitions","Investments","Oil and Gas","Competition law","Shipping Law","Corporate Advisory"] },
    { name: "Lee Ai Hsian", division: "Corporate", areas: ["Banking and Finance","Fintech","Real Estate"] },
    { name: "Loshini Ramarmuty", division: "Dispute Resolution" /* inferred */, areas: ["Construction Litigation and Arbitration","Construction Inquiries and Investigations","Adjudication","Construction Project Management"] },
    { name: "Natalie Lim Yen Kuan", division: "Intellectual Property", areas: ["Technology, Media and Telecommunications","Privacy and Data Protection","Entertainment, Gaming and Media","IP Registration and Prosecution"] },
    { name: "Nimalan Devaraja", division: "Dispute Resolution" /* inferred */, areas: ["International Arbitration","Commercial Litigation and Arbitration","Company Law and Shareholders' Disputes","Regulatory Enforcement","Restructuring and Insolvency"] },
    { name: "Jesy Ooi", division: "Corporate" /* inferred */, areas: ["Real Estate"] },
    { name: "Trevor Jason Mark Padasian", division: "Dispute Resolution", areas: ["Family Law","Personal Bankruptcy","Civil Litigation"] },
    { name: "Ratha Govindasamy", division: "Dispute Resolution" /* inferred */, areas: ["Banking and Finance Litigation","Personal Bankruptcy"] },
    { name: "Joshua Teoh Beni Chris", division: "Intellectual Property" /* inferred */, areas: ["IP Litigation and Enforcement","Commercial Litigation","Civil Litigation","Regulatory Defence"] },
    { name: "Sara Lau", division: "Dispute Resolution" /* inferred */, areas: ["Employment Disputes","Employment Advisory and Compliance","Employee Fraud Management & Investigations","Environment, Social and Governance (ESG)","Bribery & Corruption","Medical Negligence","Immigration","General & Civil Litigation","Professional Liability"] },
    { name: "Melissa Long", division: "Intellectual Property" /* inferred */, areas: ["IP Litigation and Enforcement","Civil Litigation"] },
    { name: "Alyshea Low Khye Lyn", division: "Intellectual Property" /* inferred */, areas: ["IP Litigation and Enforcement","Civil and Commercial Litigation","Hire Purchase and Consumer Protection"] },
    { name: "Tatvaruban Subramaniam", division: "Dispute Resolution" /* inferred */, areas: ["General Litigation","Construction Litigation, Arbitration and Adjudication","Oil & Gas, and Energy Disputes","Regulatory Compliance (Construction, Occupational Safety and Environmental)"] },
    { name: "Aufa Radzi", division: "Dispute Resolution" /* inferred */, areas: ["Commercial Litigation and Arbitration","Banking and Finance","Restructuring and Insolvency","Civil Litigation","Defamation","Land Disputes and Land Acquisition","Professional Liability"] },
    { name: "Manshan Singh", division: "Dispute Resolution" /* inferred */, areas: ["Corporate and Commercial Litigation","Trade and Customs","Trade Remedies","Tax Litigation, Audits and Investigations","Sanctions and Export Controls","Antitrust and Competition","Fraud and Asset Recovery","White-Collar Crimes","Compliance and Investigations"] },
    { name: "Tan Wei Xian", division: "Corporate" /* inferred */, areas: ["Oil & Gas, and Energy","Mergers & Acquisitions","Corporate Advisory"] },
    { name: "Louise Jacqueline Azmi", division: "Dispute Resolution" /* inferred */, areas: ["Fraud and Asset Recovery","Maritime and Shipping","Civil and Commercial Litigation"] },
    { name: "Rachel Chiah", division: "Corporate" /* inferred */, areas: ["Projects and Infrastructure","Energy","Construction Compliance and Advisory"] },
    { name: "Muhammad Suhaib Ibrahim", division: "Dispute Resolution" /* inferred */, areas: ["Civil and Commercial Litigation","Domestic and International Arbitration","Corporate Litigation and Shareholders' Disputes","Estate Disputes","Fraud and Asset Recovery"] },
    { name: "Tan Wei Liang", division: "Corporate" /* inferred */, areas: ["Mergers & Acquisitions","Corporate Advisory and Transaction"] },
    { name: "Gooi Yang Shuh", division: "Intellectual Property" /* inferred */, areas: ["IP Litigation and Enforcement","Entertainment, Gaming and Media","Civil & Commercial Litigation"] },
    { name: "Engy Tan", division: "Corporate" /* inferred */, areas: ["Real Estate"] },
    { name: "Kailash Kalaiarasu", division: "Dispute Resolution" /* inferred */, areas: ["Fraud and Asset Recovery","Civil and Commercial Litigation","Public Law, Constitutional Law & Fundamental Rights"] },
    { name: "Brenda Chan", division: "Dispute Resolution" /* inferred */, areas: ["Litigation and Arbitration","Fraud and Asset Recovery","Restructuring and Insolvency"] }
  ],

  consultants: [
    { name: "Tan Sri Dato' V.C. George", areas: ["Arbitrator"] },
    { name: "Chen Kah Leng", areas: ["Corporate Advisory"] },
    { name: "Lee Tatt Boon", areas: ["IP & Notary Public"] },
    { name: "Kok Chee Kheong", areas: ["Professional Development & Knowledge Management", "Editor-in-Chief, Skrine's Legal Insights"] },
    { name: "Wong Chee Lin", areas: ["Banking & Finance Litigation", "Restructuring and Insolvency"] }
  ],

  seniorAssociates: [
    {
      name: "Kalaiarasan Rasadurai",
      keyAreas: ["Construction Litigation, Arbitration and Adjudication","Oil & Gas, Energy and Engineering Disputes","International Arbitration","Civil Litigation and Commercial Arbitration"],
      quals: ["Advocate and Solicitor, High Court of Malaya","LL.B (Hons), Multimedia University"],
      affiliations: ["Head of Law Reform Sub-Committee and Committee Member, Construction Law Committee of Bar Council Malaysia","Committee Member, Society of Construction Law, Malaysia"]
    },
    {
      name: "Francine Ariel Paul",
      keyAreas: ["Mergers & Acquisitions","Corporate Advisory and Transactions","Environment"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2017)","Barrister-at-Law (Lincoln's Inn) (2016)","Very Competent, Bar Professional Training Course (BPTC), BPP Law School, UK (2016)","Second Class Upper Division, LL.B (Hons), University of Manchester, UK (2015)"]
    },
    {
      name: "Karen Tan Wee Sean",
      keyAreas: ["Restructuring and Insolvency","Banking and Finance Litigation","Commercial Litigation and Arbitration"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2018)","LL.B (Hons), University of Malaya (2017)"]
    },
    {
      name: "Eric Gabriel Gomez",
      keyAreas: ["Civil Litigation","Commercial Litigation and Arbitration","Aviation Disputes","Construction Litigation, Arbitration and Adjudication"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2018)","Barrister-at-Law (Lincoln's Inn) (2017)","LL.B (First Class Honours), University of Reading (2015)"],
      affiliations: ["Committee Member, Society of Construction Law Malaysia (2023-2025)","Chairman, Young Society of Construction Law Malaysia (2022-2023)","Member, Bar Council Constitutional Law Committee (2021-2022)"]
    },
    {
      name: "Joey Tiw",
      keyAreas: ["Merger and Acquisitions","Corporate Advisory and Transactions","Corporate Tax"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2018)","Barrister-at-Law (Lincoln's Inn) (2017)","LL.B (Hons), University of Reading (2016)"]
    },
    {
      name: "Siew Ka Yan",
      keyAreas: ["Civil and Commercial Litigation","Insurance Disputes and Advisory","Banking and Finance Litigation","Compliance and Advisory"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2018)","Certificate of Legal Practice (2017)","LL.B (Hons), University of Liverpool (2016)"]
    },
    {
      name: "Teng Wei Hun",
      keyAreas: ["Employment Disputes","Employment Advisory and Compliance","Employment Fraud Management and Investigations","Civil & Commercial Litigation","Restructuring and Insolvency","Medical Negligence"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2019)","Barrister-at-Law (Lincoln's Inn) (2017)","LL.B (Hons), University of Reading (2016)"]
    },
    {
      name: "Beatrice Yew",
      keyAreas: ["Privacy and Data Protection","Technology, Media and Telecommunications","Entertainment, Gaming and Media"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2019)","LL.B (Hons), University of Malaya (2018)"]
    },
    {
      name: "Javene Fan Pooi Ling",
      keyAreas: ["Banking and Finance","Real Estate","Fintech"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2017)","Certificate in Legal Practice (2015)","LL.B (Hons), University of Reading (2013)"]
    },
    {
      name: "Arif Umar Faruq bin Faiz",
      keyAreas: ["Fraud and Asset Recovery","Land Acquisition","Civil and Commercial Litigation"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2021)","LLM in Comparative and International Dispute Resolution, Queen Mary University of London (2019)","Barrister-at-Law (Lincoln's Inn) (2018)","LL.B (Hons) Queen Mary University of London (2017)"],
      affiliations: ["Committee Member, Bar Council's Publications Committee (2024 – present)"]
    },
    {
      name: "Chin Ching Yee, Joen",
      keyAreas: ["Real Estate"],
      quals: ["Advocate and Solicitor, High Court of Malaya (Jan 2021)","Certificate of Legal Practice, Malaysia (2019)","University of Liverpool, LLB (Hons) (2018)"]
    },
    {
      name: "Cheam Tat Sean",
      keyAreas: ["Technology, Media and Telecommunications","Privacy and Data Protection","Entertainment, Gaming and Media","Intellectual Property"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2021)","ADR ODR International Accredited Civil-Commercial Mediator (2019)","Barrister-at-Law, Middle Temple (2019)","LL.B (Hons), University of Reading (2018)"]
    },
    {
      name: "Samson Kong",
      keyAreas: ["Mergers & Acquisitions","Oil & Gas, and Energy","Projects and Infrastructure","Corporate Advisory"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2021)","Certificate of Legal Practice, LPQB (2019)","LL.M (Master of Laws), University of Hull (2018)","LL.B (Hons), University of Hull (2017)"]
    },
    {
      name: "Faith Chan",
      keyAreas: ["Merger and Acquisitions","Corporate Advisory & Transactions"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2021)","Barrister-at-Law (Middle Temple) (2019)","LL.B, University of Kent (2017)"]
    },
    {
      name: "Tee Wei-Herng Calvin",
      keyAreas: ["Civil and Commercial Litigation","Restructuring and Insolvency","Banking and Finance Litigation"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2020)","Master of Laws in Bar Professional Training, Cardiff University (2021)","Barrister-at-Law (Middle Temple) (2019)","LL.B (Hons), Cardiff University (2018)"]
    },
    {
      name: "Latifa Haiqa Yusoff",
      keyAreas: ["Commercial Litigation & Arbitration","Fraud and Asset Recovery","Maritime & Shipping","Medical Negligence"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2019)","LL.B (Hons), Universiti Malaya (2018)"]
    },
    {
      name: "Syafinas Ibrahim",
      keyAreas: ["Commercial Dispute Resolution","Arbitration & Alternative Dispute Resolution","Maritime & Shipping Disputes"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2020)","LL.B (Hons), Universiti Malaya (2019)"]
    },
    {
      name: "Ashreyna Kaur Bhatia",
      keyAreas: ["Employment Disputes","Employment Advisory and Compliance","Employment Fraud Management and Investigations"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2022)","Barrister-at-Law (Gray's Inn) (2021)","LL.B (Hons), University of Bristol (2019)"]
    },
    {
      name: "Adryenne Lim",
      keyAreas: ["Employment Advisory and Compliance","Employment Disputes","Civil Litigation"],
      quals: ["Advocate and Solicitor, High Court of Malaya (2022)","LL.B, University of Tasmania (2012)"]
    }
  ],

  /* Associates: skrine.com lists names only (no profile pages or practice areas). */
  associates: [
    { name: "Anson Liow" },
    { name: "Wong Shun Yong" },
    { name: "Ho Pui Yan" },
    { name: "Isabelle Chip Oi-Yi" },
    { name: "Lee Li Zhu" },
    { name: "Siti Ayenaa Binti Mohd Anis" },
    { name: "Chong Cai Yi" },
    { name: "Kong Zhen Zhen" },
    { name: "Iffah Afrina binti Saleh" },
    { name: "Rachel Ang" },
    { name: "Denise Teoh Yun Ni" },
    { name: "Tan Yng Yiin" },
    { name: "Lim Shu Yi" },
    { name: "Lim Wen Keat" },
    { name: "Sarah Aida binti Mohammad Ali" },
    { name: "Valerie Chung Shu En" },
    { name: "Agnes Teh Ying Ying" },
    { name: "Darren Conrad Bartolome" },
    { name: "Chong Zhi Shin" },
    { name: "Clover Lum Ker Parn" },
    { name: "Ashwaty Ashley" },
    { name: "Lim Ke Xin Belinda" },
    { name: "Charmaine Denisha" },
    { name: "Jarod Jimmy Lee Pillay" },
    { name: "Anna Tan Ling Er" },
    { name: "Hannis Fakhrina" },
    { name: "Kelly Ho Suet Chen" },
    { name: "Chong Zheng Yang" },
    { name: "Loo Junyuan" },
    { name: "Jason Lee Poh Hong" },
    { name: "Siva Darshen" },
    { name: "Kyra Iman Yaacob" },
    { name: "Shanthigni Ravindran" },
    { name: "Cheah Ke Hui" },
    { name: "Peng Hsin" },
    { name: "Yiew Xiu Jing" },
    { name: "Sumita Selvakumar" }
  ]
};
