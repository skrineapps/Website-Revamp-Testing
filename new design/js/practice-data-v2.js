/* =========================================================
   SKRINE — Practice areas & sectors, new structure (Layout 3 / Sectors layout 2)
   Source: "(formatted) Skrine Practice Area and Industry Write-Ups 251126 PSP.docx"
           and "Industries .docx" (sources/ folder).
   - practices: the Level 1 practice areas. kind "disputes-only" = the whole
     write-up is disputes; kind "hub" = Dispute Resolution.
   - disputes: the green "Disputes" parts, each its own page, keyed by slug.
     parent = the practice area / sector it sits in. Each is linked from its
     parent AND from the Dispute Resolution list (drList), so the disputes
     team and experience stay separate from the advisory team.
   - drList: Dispute Resolution's Level 2 headings and where each one opens.
   - img: banner photo (images/<img>.jpg); empty = the brand painting.
   Placeholder text from the documents ([BDCS Team to insert …]) is left out.
   ========================================================= */
window.SKRINE_CAPABILITIES_V2 = {
 "practices": [
  {
   "slug": "arbitration-and-alternative-dispute-resolution",
   "title": "Arbitration and Alternative Dispute Resolution",
   "intro": [
    "We advise and represent clients in domestic and international arbitration, mediation and related court proceedings. We help clients choose the right process, seek urgent relief where needed, and plan for settlement or enforcement from the outset.",
    "Our lawyers act as counsel in proceedings and related court applications. Members of our team also accept appointments as arbitrators and mediators. These appointments are separate from our role as counsel."
   ],
   "groups": [
    {
     "title": "Arbitration-Related Court Proceedings and Enforcement",
     "items": [
      "Court applications for interim measures in support of arbitration.",
      "Applications to stay court proceedings in favour of arbitration and proceedings involving jurisdictional challenges.",
      "Applications to set aside awards and to recognise and enforce domestic and foreign awards.",
      "Coordination with overseas counsel where enforcement is sought in more than one jurisdiction."
     ]
    },
    {
     "title": "Arbitrator Appointments",
     "items": [
      "Members of our team accept appointments as sole arbitrators, presiding arbitrators and co-arbitrators in domestic and international proceedings.",
      "As counsel, we advise clients on nomination and appointment procedures, including candidate suitability, independence and conflicts."
     ]
    },
    {
     "title": "Domestic Arbitration",
     "items": [
      "Drafting and reviewing arbitration agreements and multi-tier dispute resolution clauses.",
      "Advising on the commencement and defence of Malaysian-seated arbitrations, including tribunal constitution, jurisdiction and procedure.",
      "Acting as counsel in institutional and ad hoc proceedings, from pleadings and evidence through to hearing and award.",
      "Advising on interim relief, settlement and related court proceedings."
     ]
    },
    {
     "title": "International Arbitration",
     "items": [
      "Acting as counsel in cross-border commercial disputes involving multinational businesses, financial institutions, state-owned enterprises and sovereign states.",
      "Advising on the seat of arbitration, applicable rules, governing law and the coordination of parallel proceedings.",
      "Acting in proceedings under the ICC, ICDR, SIAC, LCIA, HKIAC, KCAB and AIAC rules, and under the UNCITRAL Arbitration Rules.",
      "Working with overseas counsel on local-law issues, court applications and enforcement strategy."
     ]
    },
    {
     "title": "Mediation",
     "items": [
      "Advising on when to mediate, mediator selection and preparation for the mediation.",
      "Representing clients in commercial, corporate and construction mediations, including where court or arbitral proceedings are already underway.",
      "Negotiating and documenting settlement terms, including payment, releases and the disposal of existing proceedings.",
      "Members of our team also accept appointments as mediators."
     ]
    }
   ],
   "contacts": [
    "Mubashir Mansor",
    "Ivan Loo",
    "Ashok Kumar Mahadev Ranai",
    "Preetha Pillai",
    "Vijay Raj",
    "Sharon Chong Tze Ying",
    "Loshini Ramarmuty",
    "Nimalan Devaraja",
    "Tatvaruban Subramaniam",
    "Muhammad Suhaib bin Ibrahim",
    "Louise Azmi"
   ],
   "img": "practice/litigation-and-arbitration",
   "kind": "practice"
  },
  {
   "slug": "banking-and-finance",
   "title": "Banking and Finance",
   "intro": [
    "We advise banks, development finance institutions, borrowers and sponsors on conventional and Islamic financing in Malaysia and across borders. Our work covers lending, security, regulatory matters and restructuring.",
    "We act on transactions from term sheet through to documentation, perfection of security and drawdown. Where a facility comes under stress, we advise on workouts and refinancing, working with our restructuring colleagues. Contentious matters are covered under Banking and Finance Disputes."
   ],
   "groups": [
    {
     "title": "Acquisition, Asset, Project and Real Estate Finance",
     "items": [
      "Acquisition financing for M&A and leveraged buy-outs.",
      "Project finance for infrastructure, power and industrial facilities.",
      "Asset finance, including aircraft, vessels and equipment.",
      "Real estate development and investment financing."
     ]
    },
    {
     "title": "Consumer Credit, Hire Purchase, Leasing and Moneylending",
     "items": [
      "Compliance with hire purchase, consumer credit and moneylending legislation.",
      "Documentation for hire purchase, leasing and instalment arrangements.",
      "Licensing and regulatory issues for credit providers."
     ]
    },
    {
     "title": "Conventional Lending (syndicated and bilateral term and revolving facilities) and Cross-Border Finance",
     "items": [
      "Syndicated and bilateral term loans and revolving credit facilities.",
      "Acting for arrangers, agents, lenders and borrowers.",
      "Cross-border facilities involving Malaysian borrowers, guarantors or security."
     ]
    },
    {
     "title": "Financial Services Regulation and Fintech (including digital financial services and platform lending)",
     "items": [
      "Advice on licensing and regulatory requirements of Bank Negara Malaysia and the Securities Commission Malaysia.",
      "Digital financial services, e-money, payment systems and platform lending.",
      "Regulatory compliance reviews and engagement with regulators."
     ]
    },
    {
     "title": "Islamic Finance and Sukuk",
     "items": [
      "Islamic financing structures, including murabahah, ijarah and musharakah.",
      "Sukuk issuances and related documentation.",
      "Shariah-compliant security arrangements and documentation."
     ]
    },
    {
     "title": "Refinancing, Workouts and Debt Restructuring",
     "items": [
      "Refinancing and amendment of existing facilities.",
      "Consensual workouts and standstill arrangements with lenders.",
      "Debt restructuring, working with our Restructuring and Insolvency practice where formal processes are involved."
     ]
    },
    {
     "title": "Security Packages and Registration (charges, debentures, assignments and guarantees)",
     "items": [
      "Charges over land, shares and other assets, debentures, assignments and guarantees.",
      "Registration and perfection of security.",
      "Review of security positions in refinancing and enforcement scenarios."
     ]
    }
   ],
   "contacts": [
    "Lee Ai Hsian",
    "Jesy Ooi"
   ],
   "img": "practice/banking-and-finance",
   "kind": "practice",
   "disputes": "banking-and-finance-disputes"
  },
  {
   "slug": "competition-and-antitrust",
   "title": "Competition and Antitrust",
   "intro": [
    "We advise and represent businesses, trade associations and government-linked companies on Malaysian competition law. We help clients assess commercial arrangements before they are implemented, design compliance procedures for their Malaysian operations, and respond to investigations by the Malaysia Competition Commission (MyCC) and other relevant regulators.",
    "Our work spans competitor collaborations, distribution and franchising arrangements, information sharing, cartel investigations and abuse of dominance. We represent clients from the investigation and written submissions stage through to appeals and related court proceedings. Where a matter raises competition issues in more than one jurisdiction, we work with overseas counsel to coordinate the advice."
   ],
   "groups": [
    {
     "title": "Competition Advisory and Commercial Arrangements",
     "items": [
      "Reviewing joint ventures, competitor collaborations, and distribution, franchising and other commercial agreements for competition law risk.",
      "Advising on pricing, exclusivity and other restrictions in commercial arrangements.",
      "Assessing information sharing, benchmarking and other activities involving trade associations or industry participants.",
      "Advising on exemptions and assisting with applications where appropriate, including block exemptions."
     ]
    },
    {
     "title": "Competition Compliance, Audits and Training",
     "items": [
      "Conducting competition law audits and reviewing existing agreements, policies and business practices.",
      "Developing internal competition policies, approval procedures and escalation protocols.",
      "Training boards, management, commercial teams and trade association members on the risks relevant to their roles.",
      "Preparing dawn raid protocols so staff know how to respond to an unannounced inspection."
     ]
    },
    {
     "title": "Investigations, Dawn Raids and Leniency",
     "items": [
      "Advising during dawn raids and other regulatory inspections, including on the scope of an inspection and the handling of documents and information requests.",
      "Representing clients in cartel and abuse-of-dominance investigations, including written and oral representations.",
      "Advising on leniency options and assisting with applications where appropriate.",
      "Coordinating the Malaysian response with in-house teams and overseas counsel in cross-border investigations."
     ]
    },
    {
     "title": "Merger Control and Transaction Risk",
     "items": [
      "Assessing competition risks in proposed mergers, acquisitions and joint ventures, including during due diligence.",
      "Advising on sector-specific merger review and competition approval requirements, including before the Malaysian Communications and Multimedia Commission and the Malaysian Aviation Commission."
     ]
    },
    {
     "title": "Appeals and Competition Disputes",
     "items": [
      "Acting in appeals against MyCC decisions before the Competition Appeal Tribunal.",
      "Representing clients in judicial review and related court proceedings arising from",
      "competition investigations, decisions and enforcement actions."
     ]
    }
   ],
   "contacts": [
    "Tan Shi Wen",
    "Manshan Singh"
   ],
   "img": "practice/regulatory-compliance",
   "kind": "practice"
  },
  {
   "slug": "constitutional-and-administrative-law",
   "title": "Constitutional and Administrative Law",
   "intro": [
    "We advise and represent individuals, businesses, public bodies and state governments on constitutional and administrative law matters. Our work covers judicial review, constitutional challenges, claims involving public authorities, election petitions and public inquiries.",
    "We act both for parties challenging decisions and for the decision-makers defending them, which helps us give balanced advice on the strength of a challenge and the remedies available."
   ],
   "groups": [
    {
     "title": "Claims against the Government and Public Authorities",
     "items": [
      "Civil claims against federal and state governments, local authorities and statutory bodies.",
      "Advice on procedural requirements and limitation in claims against public authorities."
     ]
    },
    {
     "title": "Constitutional Challenges and Fundamental Liberties",
     "items": [
      "Challenges to the validity of legislation and executive action under the Federal Constitution.",
      "Proceedings concerning fundamental liberties."
     ]
    },
    {
     "title": "Election Petitions",
     "items": [
      "Representation of petitioners and respondents in election petitions and related appeals."
     ]
    },
    {
     "title": "Federal–State Matters and Native Customary Rights",
     "items": [
      "Disputes concerning the division of federal and state powers, including in relation to land and natural resources.",
      "Claims involving native customary rights over land."
     ]
    },
    {
     "title": "Judicial Review (including licensing, permit and regulatory decisions)",
     "items": [
      "Challenges to decisions of ministers, regulators, local authorities and tribunals.",
      "Disputes over licences, permits, local authority rates, land use and development decisions.",
      "Acting for state governments, including by special fiat, in defending judicial review proceedings."
     ]
    },
    {
     "title": "Public Inquiries and Commissions of Inquiry",
     "items": [
      "Representation of witnesses and interested parties in public inquiries and royal commissions of inquiry.",
      "Preparation of submissions and witness evidence."
     ]
    },
    {
     "title": "Public Law Advisory and Legislative Review",
     "items": [
      "Advice on the scope of statutory powers and the legality of proposed decisions.",
      "Review of draft legislation and regulatory proposals."
     ]
    }
   ],
   "contacts": [
    "Preetha Pillai",
    "Vijay Raj"
   ],
   "img": "practice/litigation-and-arbitration",
   "kind": "disputes-only"
  },
  {
   "slug": "construction-engineering-projects-and-infrastructure",
   "title": "Construction, Engineering, Projects and Infrastructure",
   "intro": [
    "We advise developers, contractors, consultants, financiers, government bodies and concessionaires on construction, engineering and infrastructure projects. Our work spans commercial and residential developments, power plants, transport infrastructure and industrial facilities.",
    "We support clients through the project life cycle, from concession arrangements and structuring to contract documentation and project management."
   ],
   "groups": [
    {
     "title": "Compliance, Regulatory and Advisory Services Across the Project Life Cycle",
     "items": [
      "Licensing, approvals and regulatory requirements for construction and infrastructure projects.",
      "Advice on contractual and regulatory issues as they arise during a project."
     ]
    },
    {
     "title": "Concession Arrangements and Public–Private Partnerships",
     "items": [
      "Structuring and documenting concessions, privatisations and public–private partnerships.",
      "Acting for government bodies, concessionaires, sponsors and lenders."
     ]
    },
    {
     "title": "Construction Projects",
     "items": [
      "Advising on building and engineering contracts, including PAM, CIDB, PWD and FIDIC forms and bespoke agreements.",
      "Procurement, tendering and subcontracting arrangements."
     ]
    },
    {
     "title": "Contract Documentation and Project Management Arrangements",
     "items": [
      "Drafting and negotiating construction, consultancy and project management agreements.",
      "Advice on notices, payment mechanisms and dispute avoidance during the project."
     ]
    },
    {
     "title": "Energy Projects",
     "items": [
      "Power generation, renewable energy and oil and gas construction projects.",
      "EPC, operation and maintenance, and offtake arrangements."
     ]
    },
    {
     "title": "Project Structuring",
     "items": [
      "Structuring project vehicles, joint ventures and financing arrangements.",
      "Land acquisition and development issues affecting projects."
     ]
    },
    {
     "title": "Transport Infrastructure",
     "items": [
      "Rail, road, port and airport projects.",
      "Acting for authorities, concessionaires, contractors and financiers."
     ]
    }
   ],
   "contacts": [
    "Richard Khoo Boo Hin"
   ],
   "img": "practice/construction-and-engineering",
   "kind": "practice",
   "disputes": "construction-engineering-projects-and-infrastructure-disputes"
  },
  {
   "slug": "corporate-and-commercial",
   "title": "Corporate & Commercial",
   "intro": [
    "We advise Malaysian and international companies, investors and institutional clients on corporate law, capital markets, governance and investment funds. Our work covers the day-to-day legal needs of companies as well as their capital-raising and investment activities.",
    "We work with our Mergers and Acquisitions, Banking and Finance and Tax colleagues so that corporate, regulatory and transactional issues are dealt with together. Through Lex Mundi and other networks, we have access to the right firm to work with in other jurisdictions on cross-border matters."
   ],
   "groups": [
    {
     "title": "Capital Markets and Securities",
     "items": [
      "Initial public offerings and listings on Bursa Malaysia.",
      "Equity and debt issuances, rights issues and private placements.",
      "Compliance with listing requirements and securities laws."
     ]
    },
    {
     "title": "Corporate Advisory and Governance",
     "items": [
      "Advice on the Companies Act 2016 and general corporate governance issues.",
      "Board advisory, directors' duties and shareholder matters.",
      "Commercial contracts, including distribution, licensing, supply and technical assistance agreements."
     ]
    },
    {
     "title": "Corporate Secretarial Services",
     "items": [
      "Company incorporation and statutory compliance.",
      "Registered office services, maintenance of statutory registers and filings with the Companies Commission of Malaysia.",
      "Board and shareholder meeting support."
     ]
    },
    {
     "title": "Funds and Investment Management",
     "items": [
      "Establishment and structuring of investment funds.",
      "Licensing and regulatory requirements for fund managers.",
      "Engagement with the Securities Commission Malaysia on fund registration.",
      "Advice to investors on fund investments and follow-on investments."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Phua Pao Yii",
    "Fariz Abdul Aziz",
    "Sheba Gumis",
    "Tan Shi Wen",
    "Tan Wei Xian",
    "Tan Wei Liang"
   ],
   "img": "practice/corporate",
   "kind": "practice",
   "disputes": "corporate-and-commercial-disputes"
  },
  {
   "slug": "employment",
   "title": "Employment",
   "intro": [
    "We advise and represent employers on employment and industrial relations matters in Malaysia. Our work covers day-to-day advice and compliance, disputes, restructuring, trade union matters and work passes.",
    "We act in proceedings before the Labour Court, Industrial Court and the civil courts up to the Federal Court. We also advise on the employment aspects of transactions and on workplace investigations."
   ],
   "groups": [
    {
     "title": "Employment Advisory and Compliance",
     "items": [
      "Employment contracts, handbooks and workplace policies.",
      "Compliance with the Employment Act 1955, Industrial Relations Act 1967 and related legislation.",
      "Disciplinary procedures, misconduct and performance management."
     ]
    },
    {
     "title": "Employment Aspects of Transactions and Restructuring",
     "items": [
      "Transfer of employees in share and business acquisitions.",
      "Employment due diligence and post-completion integration."
     ]
    },
    {
     "title": "Retrenchment and Workforce Restructuring",
     "items": [
      "Planning and implementing retrenchments, voluntary separation schemes and redeployment.",
      "Compliance with notification and consultation requirements."
     ]
    },
    {
     "title": "Trade Unions, Collective Bargaining and Collective Agreements",
     "items": [
      "Union recognition claims and trade disputes.",
      "Negotiation and interpretation of collective agreements."
     ]
    },
    {
     "title": "Work Passes and Immigration",
     "items": [
      "Employment passes and other work permits for foreign employees.",
      "Compliance with immigration requirements for foreign workers."
     ]
    },
    {
     "title": "Occupational Safety and Health",
     "items": [
      "Compliance with the Occupational Safety and Health Act 1994.",
      "Workplace incidents, investigations and enforcement proceedings."
     ]
    }
   ],
   "contacts": [],
   "img": "practice/employment",
   "kind": "practice",
   "disputes": "employment-disputes"
  },
  {
   "slug": "environmental-social-and-governance-esg",
   "title": "Environmental, Social and Governance (ESG)",
   "intro": [
    "We advise companies, boards and investors on environmental, social and governance matters. Our work covers sustainability reporting, climate and carbon markets, supply chain and human rights risks, governance, and ESG issues in transactions and financing.",
    "We help clients understand the requirements that apply to them and put practical processes in place. We work with environmental consultants and other advisers where technical input is needed."
   ],
   "groups": [
    {
     "title": "Business and Human Rights, Forced Labour and Supply Chain Due Diligence",
     "items": [
      "Assessing forced labour and human rights risks in operations and supply chains.",
      "Supplier codes of conduct, audits and remediation."
     ]
    },
    {
     "title": "Climate Change and Carbon Markets",
     "items": [
      "Advice on climate-related regulation and disclosure.",
      "Carbon credit transactions and participation in carbon markets."
     ]
    },
    {
     "title": "Corporate Governance and Board Advisory",
     "items": [
      "Board oversight of sustainability matters and ESG governance structures.",
      "Board training on ESG duties and risks."
     ]
    },
    {
     "title": "Environmental Compliance and Enforcement",
     "items": [
      "Compliance with the Environmental Quality Act 1974 and related requirements.",
      "Representation in environmental investigations and enforcement proceedings."
     ]
    },
    {
     "title": "ESG Due Diligence in Transactions",
     "items": [
      "Environmental, health and safety and ESG due diligence in acquisitions, property transactions and projects."
     ]
    },
    {
     "title": "Greenwashing Risk and Sustainability Claims",
     "items": [
      "Review of sustainability claims in marketing, disclosures and product labelling."
     ]
    },
    {
     "title": "Sustainability Reporting and Disclosure",
     "items": [
      "Sustainability reporting under Bursa Malaysia requirements and the National Sustainability Reporting Framework."
     ]
    },
    {
     "title": "Sustainable and Green Finance",
     "items": [
      "Green, social and sustainability-linked loans and sukuk, working with our Banking and Finance practice."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Lim Koon Huan",
    "Selvamalar Alagaratnam"
   ],
   "img": null,
   "kind": "practice"
  },
  {
   "slug": "family-law",
   "title": "Family Law",
   "intro": [
    "Family matters are often sensitive, and we aim to give personalised, practical and discreet advice.  Where circumstances permit, we encourage mediation and negotiated settlement. Where litigation becomes necessary, we represent clients in contested proceedings."
   ],
   "groups": [
    {
     "title": "Adoption and Guardianship",
     "items": [
      "Adoption applications and guardianship of minors."
     ]
    },
    {
     "title": "Child Custody and Access",
     "items": [
      "Custody, care and control, and access arrangements.",
      "Child maintenance and relocation applications."
     ]
    },
    {
     "title": "Divorce and Division of Matrimonial Assets",
     "items": [
      "Divorce and annulment proceedings.",
      "Spousal maintenance and division of matrimonial assets.",
      "Pre-marital and settlement agreements."
     ]
    },
    {
     "title": "Mental Capacity and Mental Health Proceedings",
     "items": [
      "Applications under the Mental Health Act 2001 for the management of the affairs and property of persons lacking capacity."
     ]
    }
   ],
   "contacts": [
    "Trevor Mark Jason Padasian"
   ],
   "img": null,
   "kind": "practice"
  },
  {
   "slug": "foreign-direct-investment-and-business-establishment",
   "title": "Foreign Direct Investment and Business Establishment",
   "intro": [
    "We advise foreign investors on establishing and expanding a business in Malaysia. Our work covers market entry, entity structuring, foreign equity conditions, licences and approvals, and investment incentives.",
    "We help clients identify the regulatory requirements that apply to their sector before they commit to a structure, and coordinate with our corporate secretarial, tax, employment and real estate colleagues on set-up."
   ],
   "groups": [
    {
     "title": "Foreign Equity Conditions, Licences and Approvals",
     "items": [
      "Foreign equity restrictions and sector-specific licensing requirements.",
      "Applications for approvals, licences and permits."
     ]
    },
    {
     "title": "Investment Incentives and Government Liaison",
     "items": [
      "Investment incentives, including those administered by the Malaysian Investment Development Authority (MIDA).",
      "Liaison with government agencies on applications."
     ]
    },
    {
     "title": "Market Entry and Entity Structuring",
     "items": [
      "Choice of vehicle, including companies, branches and representative offices.",
      "Incorporation, joint ventures with local partners and post-establishment compliance."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Phua Pao Yii",
    "Fariz Abdul Aziz",
    "Sheba Gumis",
    "Tan Shi Wen",
    "Tan Wei Xian",
    "Tan Wei Liang"
   ],
   "img": "practice/corporate-structures-and-secretarial-services",
   "kind": "practice"
  },
  {
   "slug": "fraud-and-asset-recovery",
   "title": "Fraud and Asset Recovery",
   "intro": [
    "We advise and represent businesses, financial institutions, government-linked entities and sovereign governments in fraud investigations, civil proceedings and asset recovery. We act in Malaysia and coordinate with overseas counsel where assets, evidence or proceedings are spread across jurisdictions.",
    "When fraud is suspected, the immediate questions are often whether assets are at risk of being moved, what evidence needs to be preserved and what action can be taken before the full facts are known. We help clients make those decisions and develop a recovery strategy alongside the investigation. We work with forensic accountants and other specialists where needed."
   ],
   "groups": [
    {
     "title": "Asset Recovery and Asset Tracing",
     "items": [
      "Tracing funds and other property through bank accounts, companies and other intermediaries in Malaysia and abroad.",
      "Seeking disclosure from banks and other third parties, including through Bankers Trust orders where appropriate.",
      "Using civil proceedings, receiverships and insolvency processes to pursue recovery.",
      "Coordinating cross-border recovery and enforcement with counsel in the jurisdictions where assets are located."
     ]
    },
    {
     "title": "Civil and Commercial Fraud",
     "items": [
      "Civil claims arising from financial fraud, misappropriation of company assets, breach of trust and breach of directors' duties.",
      "Claims involving employees, officers, directors and third parties alleged to have participated in a fraud.",
      "Multi-party fraud litigation, including claims involving allegations of conspiracy."
     ]
    },
    {
     "title": "Fraud Investigations",
     "items": [
      "Investigating suspected financial fraud, misappropriation and other misconduct, including matters involving multiple jurisdictions.",
      "Advising on how investigative findings can support urgent applications, civil claims and recovery proceedings.",
      "Advising on cooperation with law enforcement where criminal investigations and civil recovery proceedings run in parallel."
     ]
    },
    {
     "title": "Internal Fraud Management",
     "items": [
      "Advising businesses on suspected employee, management, vendor and accounting fraud, as well as misappropriation and data theft.",
      "Working with employment colleagues on disciplinary and other employment issues while the investigation and recovery work proceed.",
      "Advising on escalation to management or the board, internal communications and reputational risk in sensitive cases."
     ]
    },
    {
     "title": "Urgent Interim Relief (Mareva, Anton Piller and Norwich Pharmacal orders)",
     "items": [
      "Freezing (Mareva) injunctions, including worldwide freezing injunctions where appropriate.",
      "Search (Anton Piller) orders and other interim measures to preserve evidence.",
      "Norwich Pharmacal and asset disclosure orders to identify wrongdoers and establish where funds have moved.",
      "Appointment of interim receivers or provisional liquidators where appropriate, and interim relief in support of arbitration.",
      "Obtained freezing and interim property preservation orders against 11 defendants in a high-value, multi-party fraud case.",
      "Acted as part of the legal team for a sovereign wealth fund in a fraud recovery action involving extensive asset tracing and cross-border enforcement.",
      "Acted for a major international insurer in a conspiracy-to-defraud claim involving 83 defendants.",
      "Acted for a foreign company seeking to recover funds and assets in a fraud matter involving alleged breaches of directors' duties and misappropriation."
     ]
    }
   ],
   "contacts": [
    "Lim Koon Huan",
    "Preetha Pillai",
    "Vijay Raj",
    "Sharon Chong Tze Ying",
    "Nimalan Devaraja"
   ],
   "img": "practice/fraud-and-asset-recovery",
   "kind": "disputes-only"
  },
  {
   "slug": "insurance-and-reinsurance",
   "title": "Insurance and Reinsurance",
   "intro": [
    "We advise Malaysian and foreign insurers, reinsurers and takaful operators on corporate transactions, regulatory matters, commercial arrangements and disputes.",
    "Our work ranges from acquisitions, portfolio transfers and the establishment of new operations to applications for regulatory approval and advice on coverage and claims disputes. Disputes are handled with our dispute resolution colleagues."
   ],
   "groups": [
    {
     "title": "Applications for Regulatory Approvals",
     "items": [
      "Applications to Bank Negara Malaysia and other authorities under the Financial Services Act 2013 and the Islamic Financial Services Act 2013."
     ]
    },
    {
     "title": "Establishment of Branches and Subsidiaries",
     "items": [
      "Licensing and set-up of insurance and reinsurance operations in Malaysia, including in Labuan."
     ]
    },
    {
     "title": "Group Restructurings",
     "items": [
      "Internal reorganisations of insurance groups and related regulatory approvals."
     ]
    },
    {
     "title": "Joint Ventures",
     "items": [
      "Bancassurance and other joint ventures and distribution arrangements."
     ]
    },
    {
     "title": "Mergers and Acquisitions of Insurers and Reinsurers",
     "items": [
      "Acquisitions and disposals of insurers, reinsurers and takaful operators.",
      "Due diligence, transaction documentation and regulatory approvals."
     ]
    },
    {
     "title": "Portfolio Sales and Business Transfer Schemes",
     "items": [
      "Transfers of insurance business and portfolios, including court-sanctioned schemes."
     ]
    },
    {
     "title": "Regulatory and Commercial Advice",
     "items": [
      "Compliance with regulatory requirements, policy documents and guidelines.",
      "Agency, distribution and outsourcing arrangements."
     ]
    },
    {
     "title": "Takaful and Retakaful",
     "items": [
      "Corporate, regulatory and commercial advice to takaful and retakaful operators."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi"
   ],
   "img": "sectors/insurance-and-reinsurance",
   "kind": "practice",
   "disputes": "insurance-and-reinsurance-disputes"
  },
  {
   "slug": "international-trade",
   "title": "International Trade",
   "intro": [
    "We advise and represent businesses on the rules that govern the movement of goods, software and technology across borders. Our work covers trade remedy investigations, customs and tariff matters, export controls and sanctions, and the application of World Trade Organization (WTO) rules and trade agreements.",
    "We assist Malaysian and international manufacturers, importers and exporters. Our work ranges from advising on the duties or restrictions that apply to a product before it enters a market to representing clients in investigations, disputes and appeals. Where a matter involves proceedings in more than one jurisdiction, we work with local counsel to coordinate the response."
   ],
   "groups": [
    {
     "title": "Customs and Tariffs",
     "items": [
      "Tariff classification, customs valuation and country-of-origin determinations.",
      "Preferential tariff treatment under free trade agreements, including rules of origin and supporting documentation.",
      "Import and export procedures, duty exemptions and reliefs, and customs rulings.",
      "Customs audits and investigations, disputes over duty assessments, and appeals before the Customs Appeal Tribunal."
     ]
    },
    {
     "title": "Export Control and Sanctions",
     "items": [
      "Strategic trade controls on goods, software and technology, including dual-use items.",
      "Licensing and permit requirements for exports, transhipment, transit and brokering.",
      "Assessment of sanctions and trade restrictions affecting counterparties, destinations, end users and end uses.",
      "Internal compliance procedures, transaction screening and responses to potential breaches."
     ]
    },
    {
     "title": "WTO, Trade Agreements and Market Access",
     "items": [
      "Application of WTO rules and bilateral and regional trade agreements to business operations.",
      "Market access for goods and services, including import licensing, quotas, technical regulations and other non-tariff barriers.",
      "Advice on trade policy developments and options for engaging with relevant authorities on market-access concerns."
     ]
    }
   ],
   "contacts": [
    "Lim Koon Huan",
    "Manshan Singh"
   ],
   "img": "sectors/maritime-and-shipping",
   "kind": "practice",
   "disputes": "international-trade-disputes"
  },
  {
   "slug": "intellectual-property",
   "title": "Intellectual Property",
   "intro": [
    "We advise and represent clients on the registration, protection, commercialisation and enforcement of patents, trade marks, industrial designs, copyright, trade secrets and confidential information.",
    "Our clients come from a wide range of industries, including pharmaceuticals, luxury goods, technology and telecommunications, aviation, and industrial and consumer products. We work with associate firms across the region and worldwide to manage portfolios that span more than one jurisdiction."
   ],
   "groups": [
    {
     "title": "Brand Protection, and Anti-Counterfeiting",
     "items": [
      "Market surveillance and investigations, working with external investigation firms.",
      "Complaints to enforcement authorities and support during raids and verification exercises.",
      "Online Enforcement and Content Take-Down",
      "Take-down of counterfeit and infringing product listings",
      "Social media infringement",
      "Illegal and unauthorised streaming",
      "Copyright take-downs",
      "Trademark and impersonation complaints",
      "Online monitoring",
      "Digital marketplace enforcement"
     ]
    },
    {
     "title": "IP Registration and Prosecution",
     "items": [
      "Searches, filing and prosecution of patents, trade marks and industrial designs in Malaysia and abroad.",
      "Oppositions, objections and portfolio management.",
      "Drafting and filing of copyright voluntary notifications and statutory declarations.",
      "Patent prosecution by lawyers and paralegals with training in both law and science."
     ]
    },
    {
     "title": "IP Transactions, Franchising and Commercialisation",
     "items": [
      "Licensing, assignment and co-branding of IP rights, including character merchandising.",
      "Franchise registration, advisory and documentation under the Franchise Act 1998.",
      "IP aspects of acquisitions and joint ventures."
     ]
    },
    {
     "title": "Trade Secrets and Confidential Information",
     "items": [
      "Protection of know-how and confidential information through contracts and internal policies.",
      "Claims for misuse of confidential information, including against former employees."
     ]
    }
   ],
   "contacts": [
    "Charmayne Ong Poh Yin",
    "Jillian Chia Yan Ping",
    "Natalie Lim Yen Kuan",
    "Leela Devi Baskaran",
    "Teh Hong Koon"
   ],
   "img": "practice/intellectual-property-and-tmt",
   "kind": "practice",
   "disputes": "intellectual-property-disputes"
  },
  {
   "slug": "investigations",
   "title": "Investigations",
   "intro": [
    "We conduct and advise on internal and regulatory investigations for companies, boards and audit committees. Our work covers suspected corruption, fraud, whistleblower complaints, sanctions and customs issues, and workplace misconduct.",
    "We help clients scope an investigation, preserve evidence, protect privilege and decide what to do with the findings. We work with forensic accountants and digital specialists where needed, and with our employment, regulatory and white-collar crime colleagues where matters lead to disciplinary action or enforcement."
   ],
   "groups": [
    {
     "title": "Anti-Corruption Investigations",
     "items": [
      "Investigating allegations of bribery and corruption involving employees, agents and third parties.",
      "Advising on exposure under the Malaysian Anti-Corruption Commission Act 2009, including section 17A."
     ]
    },
    {
     "title": "Fraud Investigations",
     "items": [
      "Investigating suspected misappropriation, accounting irregularities and other financial misconduct.",
      "Advising on how findings may support civil recovery, working with our Fraud and Asset Recovery practice."
     ]
    },
    {
     "title": "Internal and Whistleblower Investigations",
     "items": [
      "Handling whistleblower reports and planning investigations.",
      "Interviews, document review and investigation reports for boards and audit committees."
     ]
    },
    {
     "title": "Sanctions, Customs and Trade Investigations",
     "items": [
      "Investigating potential breaches of sanctions, export control and customs requirements.",
      "Advising on remediation and engagement with authorities."
     ]
    },
    {
     "title": "Workplace Misconduct Investigations",
     "items": [
      "Investigating harassment, discrimination and other misconduct complaints.",
      "Advising on disciplinary process and outcomes, working with our Employment practice."
     ]
    }
   ],
   "contacts": [
    "Lim Koon Huan",
    "Selvamalar Alagaratnam",
    "Foo Siew Li",
    "Manshan Singh"
   ],
   "img": "practice/regulatory-compliance",
   "kind": "practice"
  },
  {
   "slug": "mergers-and-acquisitions",
   "title": "Mergers and Acquisitions",
   "intro": [
    "We advise Malaysian and international clients on domestic and cross-border mergers, acquisitions, disposals and joint ventures. Our clients include listed companies, multinationals, private equity investors, institutional clients, sovereign funds, and government-linked entities across a range of industries, including digital infrastructure, technology, healthcare, education, manufacturing, insurance and energy.",
    "We act from structuring and due diligence through to negotiation, transaction documentation, regulatory approvals and completion. We work with our competition, employment, tax and real estate colleagues so that each aspect of a transaction is covered."
   ],
   "groups": [
    {
     "title": "Corporate Reorganisations, Demergers and Divestments",
     "items": [
      "Internal reorganisations, demergers and disposals of businesses and assets."
     ]
    },
    {
     "title": "Joint Ventures and Strategic Alliances",
     "items": [
      "Structuring and documenting joint ventures, shareholders' agreements and strategic alliances."
     ]
    },
    {
     "title": "Legal Due Diligence",
     "items": [
      "Legal due diligence on target companies, businesses and assets, and reporting on key risks."
     ]
    },
    {
     "title": "Private Equity and Venture Capital",
     "items": [
      "Investments by private equity and venture capital funds into Malaysian companies.",
      "Advising start-ups and founders on fundraising rounds and investor documentation.",
      "Exits by trade sale, secondary sale or initial public offering."
     ]
    },
    {
     "title": "Private M&A",
     "items": [
      "Share and business acquisitions and disposals.",
      "Transaction documents, conditions precedent and completion, including the transfer of employees."
     ]
    },
    {
     "title": "Public M&A and Take-overs",
     "items": [
      "Take-overs, mergers and schemes involving listed companies under the Malaysian Code on Take-Overs and Mergers 2016.",
      "Advice on issues arising where the target or counterparty is a listed company."
     ]
    },
    {
     "title": "Warranty and Indemnity Insurance",
     "items": [
      "Review and negotiation of warranty and indemnity (W&I) insurance policies.",
      "Engagement and negotiation with W&I insurers on coverage and exposure.",
      "Responding to W&I underwriting queries."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Phua Pao Yii",
    "Fariz Abdul Aziz",
    "Sheba Gumis"
   ],
   "img": "practice/corporate",
   "kind": "practice"
  },
  {
   "slug": "oil-gas-and-energy",
   "title": "Oil, Gas and Energy",
   "intro": [
    "We advise clients across the upstream, midstream and downstream oil and gas sectors, and in power, utilities and renewable energy. Our work covers acquisitions and divestitures, joint ventures, procurement, development and operations, and regulatory and environmental matters.",
    "We are regularly asked to analyse the legal issues in, and to structure and document, cross-border oil and gas transactions and projects. Disputes are covered under Oil, Gas and Energy Disputes."
   ],
   "groups": [
    {
     "title": "Acquisitions and Divestitures of Upstream, Midstream and Downstream Interests",
     "items": [
      "Acquisitions and disposals of participating interests, assets and companies."
     ]
    },
    {
     "title": "Development and Operations",
     "items": [
      "Field development, production and operational arrangements."
     ]
    },
    {
     "title": "Investment Structuring",
     "items": [
      "Structuring of investments in energy assets and projects."
     ]
    },
    {
     "title": "Joint Ventures and Joint Operating Arrangements",
     "items": [
      "Production sharing contracts, joint operating agreements and joint venture arrangements."
     ]
    },
    {
     "title": "Power, Utilities and Renewable Energy",
     "items": [
      "Power purchase agreements, licensing and regulatory requirements.",
      "Solar, hydro and other renewable energy projects."
     ]
    },
    {
     "title": "Procurement",
     "items": [
      "Procurement processes and contracts for goods and services in the energy sector.",
      "PETRONAS licensing and registration requirements."
     ]
    },
    {
     "title": "Regulatory and Environmental Compliance",
     "items": [
      "Licensing, regulatory and environmental requirements for energy operations."
     ]
    },
    {
     "title": "Structuring and Documentation of Cross-Border Oil and Gas Transactions and Projects",
     "items": [
      "Structuring and documenting complex or novel cross-border transactions and projects."
     ]
    }
   ],
   "contacts": [
    "Richard Khoo Boo Hin",
    "Fariz Abdul Aziz",
    "Tan Shi Wen",
    "Tan Wei Xian",
    "Rachel Chiah"
   ],
   "img": "sectors/oil-and-gas-and-energy",
   "kind": "practice",
   "disputes": "oil-gas-and-energy-disputes"
  },
  {
   "slug": "privacy-and-data-protection",
   "title": "Privacy and Data Protection",
   "intro": [
    "We advise Malaysian and multinational organisations on compliance with Malaysia's Personal Data Protection Act 2010 (PDPA) and related privacy and data security requirements. Our work covers data protection compliance programmes, cross-border data transfers, data sharing and processing arrangements, data breach management and regulatory matters.",
    "We also assist multinational groups in adapting global data protection frameworks and policies to Malaysian legal requirements."
   ],
   "groups": [
    {
     "title": "Data Protection Compliance and Governance",
     "items": [
      "PDPA compliance reviews and gap assessments.",
      "Conducting data protection compliance exercises.",
      "Development of internal policies and governance frameworks.",
      "Preparation and review of privacy notices, consent forms and related compliance documentation."
     ]
    },
    {
     "title": "Cross-Border Data Transfers, Data Sharing and Processing",
     "items": [
      "Advice on cross-border personal data transfers.",
      "Drafting and review of data sharing agreements, data processing agreements and related contractual arrangements.",
      "Advice on data protection issues involving artificial intelligence (AI), data analytics and digital platforms."
     ]
    },
    {
     "title": "Data Breach and Incident Response",
     "items": [
      "Data breach assessments, incident response and management.",
      "Regulatory reporting and notifications to the Personal Data Protection Commissioner and affected individuals.",
      "Advice and support on regulatory investigations and enforcement action."
     ]
    },
    {
     "title": "Data Protection Officer (DPO) Advisory and Training",
     "items": [
      "Advice on DPO appointment requirements and ongoing legal and compliance support.",
      "DPO Intensive Training Programmes to equip and upskill internally appointed DPOs.",
      "Practical PDPA compliance training for management and employees."
     ]
    },
    {
     "title": "Personal Data Security and Cybersecurity",
     "items": [
      "Advice on personal data security obligations, including organisational safeguards and third-party data security requirements.",
      "Cybersecurity incident reporting obligations."
     ]
    }
   ],
   "contacts": [
    "Jillian Chia Yan Ping",
    "Natalie Lim Yen Kuan"
   ],
   "img": "sectors/telecommunications-media-and-technology",
   "kind": "practice"
  },
  {
   "slug": "professional-liability-and-indemnity",
   "title": "Professional Liability and Indemnity",
   "intro": [
    "We act for professionals and their insurers in negligence claims, professional indemnity matters and disciplinary proceedings. Our work covers accountants, auditors, engineers, architects, construction professionals, lawyers and medical practitioners.",
    "We work with specialist experts where technical or medical evidence is required, and advise on the interaction between civil claims, insurance and disciplinary proceedings."
   ],
   "groups": [
    {
     "title": "Accountants and Auditors",
     "items": [
      "Defence of negligence claims against accountants and auditors."
     ]
    },
    {
     "title": "Doctors  & Hospitals",
     "items": [
      "Representation in inquiries and disciplinary proceedings before the Malaysian Medical Council.",
      "Representation of medical practitioners and healthcare providers in negligence claims."
     ]
    },
    {
     "title": "Engineers, Architects and Construction Professionals",
     "items": [
      "Professional negligence claims arising from design, supervision and certification."
     ]
    },
    {
     "title": "Legal Professionals",
     "items": [
      "Defence of negligence claims against lawyers, including under the Malaysian Bar's professional indemnity scheme."
     ]
    }
   ],
   "contacts": [
    "Ivan Loo",
    "Ashok Kumar Mahadev Ranai",
    "Loo Peh Fern",
    "Loshini Ramarmuty"
   ],
   "img": "practice/litigation-and-arbitration",
   "kind": "disputes-only"
  },
  {
   "slug": "real-estate",
   "title": "Real Estate",
   "intro": [
    "Real estate transactions in Malaysia move through a regulatory sequence that must be taken in the right order. Foreign acquisition restrictions under the National Land Code, and disposals by government agencies and Bumiputera interests under the relevant guidelines, shape how a deal is structured and how long it takes to close. Greenfield projects and development land transactions bring added complexity, with infrastructure and construction obligations closely interwoven with regulatory and contractual requirements, work that demands a thorough understanding of the technical dimensions and the ability to manage their interplay. The Real Estate practice works inside that framework with a commercial eye, structuring complex transactions and advising on high-profile deals.",
    "We have advised on transactions involving development land, industrial land, estate land, land beneath water, under-construction development, mall, hotel, factory and office building.",
    "We act for leading property developers, government-linked companies, foreign investors, multinational corporations, data centre operators, real estate investment trusts (REIT), receivers and liquidators."
   ],
   "groups": [
    {
     "title": "Real Estate Transactions",
     "items": [
      "Development structuring, joint development agreements and housing development compliance.",
      "Sale and purchase documentation for developers.",
      "Advice on the regulatory framework of the transaction",
      "Acquisitions and disposals of land, buildings and property portfolios.",
      "Transaction structuring and documentation.",
      "Drafting and negotiating sale and purchase agreements, lease and tenancy agreements, development agreements and agreements to build",
      "Handle the transaction regulatory approval applications through to title transfer and completion"
     ]
    },
    {
     "title": "Legal due diligence",
     "items": [
      "Title searches, encumbrance checks and due diligence on land and property."
     ]
    },
    {
     "title": "Landlord and Tenant",
     "items": [
      "Leases and tenancies for commercial, retail and industrial premises.",
      "Acting for S P Setia in its inaugural and second joint ventures with Mitsui Fudosan (Asia) Malaysia.",
      "Acting for leading industrial developer, AME Development Sdn Bhd, in their joint venture with UEM Land Berhad for RM4.0 billion industrial development within the Johor-Singapore Special Economic Zone (JS-SEZ).",
      "Acting for KIP REIT in its acquisition of Setapak Central Mall in Kuala Lumpur for RM435 million, from a subsidiary of Singapore-listed Frasers Property Limited, which will become the REIT’s largest asset by value to date.",
      "Acting for CapitaLand Malaysia Trust (CLMT) in its entry and expansion into the industrial sector.",
      "Acting for the Malaysian investment vehicle of a global infrastructure investment fund on acquisitions to establish data centres in several locations in Malaysia.",
      "Acting for a leading ASEAN data centre provider owned by a Singapore sovereign fund on acquisitions to establish data centres in several locations in Malaysia.",
      "Acted for the property development arm of a listed company on the disposal of industrial land to a global electric vehicle leader.",
      "Acted for Nasdaq-listed and global leader in tubeless insulin pump technology, Insulet Corporation, in the setting up of its new manufacturing facility in Johor, marking Insulet’s first facility in Southeast Asia.",
      "Acted for Gamuda Land in partnership with Taylor’s Education to redevelop Taylor’s SS15 site."
     ]
    },
    {
     "title": "Recognition",
     "items": []
    },
    {
     "title": "Chambers Asia-Pacific 2026: ranked, Real Estate (Malaysia); Band 3",
     "items": []
    },
    {
     "title": "Legal 500 Asia Pacific 2026: ranked, Real estate and construction (Malaysia); Tier 2",
     "items": []
    },
    {
     "title": "Key contacts",
     "items": [
      "Jesy Ooi, Lee Ai Hsian"
     ]
    }
   ],
   "contacts": [
    "Ashok Kumar",
    "Vijay Raj",
    "Claudia Cheah"
   ],
   "img": "practice/real-estate",
   "kind": "practice",
   "disputes": "real-estate-disputes"
  },
  {
   "slug": "regulatory-compliance-and-white-collar-defence",
   "title": "Regulatory Compliance and White-Collar Defence",
   "intro": [],
   "groups": [
    {
     "title": "Anti-Corruption, Anti-Money Laundering and Sanctions Compliance",
     "items": [
      "Adequate procedures under section 17A of the Malaysian Anti-Corruption Commission Act 2009.",
      "Anti-money laundering and counter-terrorism financing compliance.",
      "Sanctions screening and compliance programmes."
     ]
    }
   ],
   "contacts": [],
   "img": "practice/regulatory-compliance",
   "kind": "practice",
   "disputes": "regulatory-compliance-and-white-collar-defence-disputes"
  },
  {
   "slug": "restructuring-and-insolvency",
   "title": "Restructuring and Insolvency",
   "intro": [
    "We advise companies, creditors, financial institutions, insolvency practitioners and investors on restructuring and insolvency in Malaysia and across borders.",
    "Our work covers schemes of arrangement, judicial management, receivership, liquidation and personal bankruptcy. We work with our banking, corporate and dispute resolution colleagues, including on asset tracing where needed."
   ],
   "groups": [
    {
     "title": "Corporate Liquidation and Winding-Up",
     "items": [
      "Winding-up petitions for creditors and defence of petitions for companies.",
      "Members' and creditors' voluntary liquidations, and advice to liquidators."
     ]
    },
    {
     "title": "Insolvency Litigation",
     "items": [
      "Claims by liquidators, including for undue preference and fraudulent trading.",
      "Disputes concerning proofs of debt and the conduct of insolvency practitioners."
     ]
    },
    {
     "title": "Judicial Management",
     "items": [
      "Applications for judicial management orders and the conduct of judicial management."
     ]
    },
    {
     "title": "Personal Bankruptcy",
     "items": [
      "Bankruptcy proceedings for creditors and debtors, and annulment and discharge applications."
     ]
    },
    {
     "title": "Receivership",
     "items": [
      "Appointment of receivers and receivers and managers, and enforcement of security."
     ]
    },
    {
     "title": "Schemes of Arrangement and Corporate Rescue",
     "items": [
      "Schemes of arrangement and restraining orders under the Companies Act 2016.",
      "Cross-border debt restructuring and corporate rescue mechanisms."
     ]
    }
   ],
   "contacts": [
    "Sheba Gumis"
   ],
   "img": "practice/restructuring-and-insolvency",
   "kind": "disputes-only"
  },
  {
   "slug": "tax-and-revenue",
   "title": "Tax and Revenue",
   "intro": [
    "We advise Malaysian and international businesses and individuals on direct and indirect tax matters. We help clients assess the tax implications of transactions and business operations, respond to audits and investigations, and challenge assessments and other decisions by revenue authorities.",
    "Our work ranges from advising on the tax treatment of a proposed transaction to representing clients in negotiations, statutory appeals and judicial review proceedings. Customs duties are covered under International Trade, and local authority rates under Real Estate."
   ],
   "groups": [
    {
     "title": "Indirect Tax (Sales and Service Tax)",
     "items": [
      "Sales and service tax (SST) advice on the treatment of goods and services, including registration and exemption issues.",
      "SST audits, disputes and appeals."
     ]
    },
    {
     "title": "Stamp Duty and Real Property Gains Tax",
     "items": [
      "Stamp duty and real property gains tax in connection with transactions and restructurings, including reliefs and exemptions."
     ]
    },
    {
     "title": "Tax Advisory and Incentives",
     "items": [
      "Corporate income tax advice on commercial transactions, business arrangements and restructurings.",
      "Withholding tax and the tax implications of proposed arrangements before implementation.",
      "Tax incentives and exemptions."
     ]
    },
    {
     "title": "Tax Audits, Investigations",
     "items": [
      "Representation in audits and investigations by the Inland Revenue Board of Malaysia, including responding to information requests and making submissions on proposed adjustments."
     ]
    }
   ],
   "contacts": [
    "Sheba Gumis"
   ],
   "img": "practice/tax-and-revenue",
   "kind": "practice",
   "disputes": "tax-and-revenue-disputes"
  },
  {
   "slug": "technology-media-and-telecommunications-tmt",
   "title": "Technology, Media and Telecommunications (TMT)",
   "intro": [
    "We advise technology companies, telecommunications providers, media businesses, digital platforms and government agencies on transactional, licensing and regulatory matters. Our clients range from established providers to new market entrants.",
    "We advise on regulatory approvals and licences from the Malaysian Communications and Multimedia Commission (MCMC), technology contracts and content regulation, and are regularly consulted on proposed changes to technology and telecommunications legislation. TMT disputes are handled in court and arbitration."
   ],
   "groups": [
    {
     "title": "Artificial Intelligence and Emerging Technology",
     "items": [
      "Legal and regulatory issues in the development and use of artificial intelligence and other emerging technologies.",
      "AI governance policies and contracting for AI tools and services."
     ]
    },
    {
     "title": "Digital Infrastructure and Data Centres",
     "items": [
      "Regulatory advice on data centres, cloud services and sub-sea and terrestrial fibre.",
      "Leasing, sharing, access and licensing agreements for network infrastructure."
     ]
    },
    {
     "title": "E-Commerce and Digital Platforms",
     "items": [
      "Website and platform terms, privacy policies and end user licence agreements.",
      "Content restrictions, take-down requirements and online safety obligations."
     ]
    },
    {
     "title": "Media, Content and Telecommunications Regulation",
     "items": [
      "Licensing under the Communications and Multimedia Act 1998, including spectrum assignments.",
      "Broadcasting, content and over-the-top (OTT) services.",
      "Contests, promotions, gaming and online gambling regulation."
     ]
    },
    {
     "title": "Technology Transactions and Outsourcing",
     "items": [
      "Systems integration, software licensing, maintenance and service level agreements.",
      "IT and business process outsourcing arrangements.",
      "Cybersecurity Regulation and Compliance",
      "Regulatory advice under Malaysia's Cyber Security Act 2024, including obligations of National Critical Information Infrastructure (NCII) entities and incident reporting requirements.",
      "Licensing and regulatory advice on requirements applicable to cybersecurity service providers",
      "Assisting with applications for cybersecurity service provider licences"
     ]
    }
   ],
   "contacts": [
    "Charmayne Ong Poh Yin",
    "Kuek Pei Yee",
    "Jillian Chia Yan Ping",
    "Natalie Lim Yen Kuan",
    "Gooi Yang Shuh"
   ],
   "img": "sectors/telecommunications-media-and-technology",
   "kind": "practice",
   "disputes": "technology-media-and-telecommunications-tmt-disputes"
  },
  {
   "slug": "dispute-resolution",
   "title": "Dispute Resolution",
   "kind": "hub",
   "intro": [
    "We advise and represent Malaysian and international clients in commercial, corporate, financial, construction, regulatory and public law disputes. Our clients include multinational businesses, financial institutions, government-linked companies, public bodies and individuals. We help clients assess their position early, obtain or resist urgent relief, and plan for settlement or enforcement from the outset. Our dispute resolution lawyers work with our corporate, finance, regulatory and industry teams so that the legal and commercial sides of a dispute are handled together. Where a matter crosses borders, we coordinate with our broad network of overseas counsel."
   ],
   "groups": [],
   "contacts": [],
   "img": "practice/litigation-and-arbitration"
  }
 ],
 "sectors": [
  {
   "slug": "automotive",
   "title": "Automotive",
   "intro": [
    "We advise vehicle manufacturers, assemblers, component suppliers, distributors and dealers on corporate, regulatory and commercial matters in Malaysia.",
    "Our lawyers draw on our corporate, competition, intellectual property, international trade, employment and dispute resolution practices to address issues across the automotive supply chain."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Investments, joint ventures and acquisitions involving manufacturing and assembly operations.",
      "Distribution, dealership and after-sales arrangements, including competition law issues.",
      "Customs, tariff and rules of origin matters for vehicles and components.",
      "Brand protection and anti-counterfeiting for vehicles and spare parts.",
      "Product liability and consumer claims."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Teh Hong Koon",
    "Sheba Gumis",
    "Foo Siew Li",
    "Tan Wei Liang"
   ],
   "img": "sectors/industrial-and-manufacturing"
  },
  {
   "slug": "aviation",
   "title": "Aviation",
   "intro": [
    "We advise airlines, airports, governments and regulators, manufacturers, aircraft financiers and lessors, and insurers and reinsurers on corporate, finance, regulatory and contentious aviation matters.",
    "Our lawyers draw on several practice areas, so transactional, regulatory and dispute issues can be handled together."
   ],
   "groups": [
    {
     "title": "Aviation Corporate, Finance and Regulatory",
     "items": []
    },
    {
     "title": "Aircraft Financing and Leasing",
     "items": [
      "Ownership and financing arrangements for passenger, cargo and corporate aircraft.",
      "Acquisition and disposal of new and pre-owned aircraft, and operating and finance leases."
     ]
    },
    {
     "title": "Aviation Regulatory and Transactions",
     "items": [
      "Regulatory requirements of the Civil Aviation Authority of Malaysia and the Malaysian Aviation Commission.",
      "Corporate and commercial transactions in the aviation sector."
     ]
    }
   ],
   "contacts": [
    "Tan Shi Wen"
   ],
   "img": "sectors/aviation",
   "disputes": "aviation-disputes"
  },
  {
   "slug": "consumer-products",
   "title": "Consumer Products",
   "intro": [
    "We advise manufacturers, suppliers, distributors and retailers of consumer products, including fast-moving consumer goods, automobiles and electrical goods.",
    "Our work covers regulatory compliance, claims and recalls, drawing on our regulatory compliance, intellectual property and dispute resolution practices."
   ],
   "groups": [
    {
     "title": "Advertising, Consumer Protection and Product Compliance",
     "items": [
      "Review of advertising and promotional materials.",
      "Compliance with consumer protection and product safety requirements, including labelling and product liability."
     ]
    },
    {
     "title": "Consumer Claims and Tribunal Proceedings",
     "items": [
      "Representation of suppliers and manufacturers in consumer claims, including before the Tribunal for Consumer Claims."
     ]
    },
    {
     "title": "Product Defect Claims",
     "items": [
      "Claims arising from the sale or supply of allegedly defective goods."
     ]
    },
    {
     "title": "Product Recalls",
     "items": [
      "Planning and managing product recalls, and dealings with regulators."
     ]
    }
   ],
   "contacts": [
    "Kuek Pei Yee",
    "Melissa Long",
    "Alyshea Low Khye Lyn"
   ],
   "img": "sectors/consumer-products"
  },
  {
   "slug": "data-centres-and-digital-infrastructure",
   "title": "Data Centres and Digital Infrastructure",
   "intro": [
    "We advise investors, developers and operators across the full life cycle of data centre and digital infrastructure projects, from land acquisition and OpCo-PropCo structuring to financing, licensing and operational compliance.",
    "We also advise on automated warehousing and logistics infrastructure, supporting clients through the structuring, financing and regulatory considerations that come with high-tech, automation-driven logistics facilities.",
    "We have acted for major institutional investors on significant regional transactions, including as Malaysian counsel on some of the largest data centre acquisitions in the market, and we offer practical, commercially attuned guidance at the intersection of technology, infrastructure and regulation."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Site acquisition, leasing and development of data centre facilities.",
      "Construction and engineering contracts.",
      "Electricity supply arrangements, water usage and development requirements.",
      "Regulatory approvals and licences, including from the MCMC.",
      "Colocation, cloud services, connectivity and fibre agreements.",
      "Fibre network rollouts, including licensing, site acquisition and shared infrastructure arrangements.",
      "Data protection and cybersecurity requirements.",
      "Export control considerations affecting the deployment of advanced computing hardware."
     ]
    }
   ],
   "contacts": [
    "Charmayne Ong Poh Yin",
    "Kuek Pei Yee",
    "Jillian Chia Yan Ping",
    "Natalie Lim Yen Kuan",
    "Tan Wei Xian",
    "Richard Khoo Boo Hin",
    "Rachel Chiah"
   ],
   "img": "sectors/telecommunications-media-and-technology"
  },
  {
   "slug": "education",
   "title": "Education",
   "intro": [
    "We support educational institutions and investors in establishing and expanding their presence in Malaysia, from child-care centres to institutions of higher learning.",
    "We act for both Malaysian and foreign institutions."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Establishment, licensing and regulatory approvals for educational institutions.",
      "Educational joint ventures and collaborations between local institutions and foreign universities.",
      "Drafting university constitutions and governance documents.",
      "Facilities management and other operating agreements."
     ]
    }
   ],
   "contacts": [
    "Sheba Gumis"
   ],
   "img": "sectors/education"
  },
  {
   "slug": "fintech",
   "title": "Fintech",
   "intro": [
    "We advise fintech companies, financial institutions and investors on the regulation and commercial arrangements of digital financial services in Malaysia.",
    "Our lawyers draw on our banking and finance, TMT, privacy and corporate practices."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Licensing and regulatory requirements of Bank Negara Malaysia and the Securities Commission Malaysia.",
      "E-money, payment systems, digital lending and platform lending.",
      "Regulatory sandbox applications.",
      "Data protection, cybersecurity and technology contracts.",
      "Investments in fintech businesses."
     ]
    }
   ],
   "contacts": [
    "Lee Ai Hsian",
    "Natalie Lim Yen Kuan"
   ],
   "img": "sectors/financial-institutions"
  },
  {
   "slug": "halal-industry",
   "title": "Halal Industry",
   "intro": [
    "We advise international and local clients on the regulatory framework governing halal products in Malaysia."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "The regulatory framework governing the sale, purchase, export and import of halal products.",
      "Halal certification requirements.",
      "Requirements for the transportation and handling of halal products.",
      "Halal-related commercial and supply arrangements."
     ]
    }
   ],
   "contacts": [
    "Sheba Gumis"
   ],
   "img": "sectors/halal-industry"
  },
  {
   "slug": "hospitality-and-tourism",
   "title": "Hospitality and Tourism",
   "intro": [
    "We act for hotel and resort owners, hotel operators, developers and investors in the hospitality and tourism sector."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Hotel management, pre-opening technical services, licensing and other operating agreements.",
      "Acquisitions and disposals of hotels and branded residences.",
      "Joint ventures in the tourism and hospitality sector.",
      "Applications to regulatory authorities for licences.",
      "Financing of hotel construction and operations, and employment matters."
     ]
    }
   ],
   "contacts": [
    "Sheba Gumis"
   ],
   "img": "sectors/hospitality-and-tourism"
  },
  {
   "slug": "industrials-and-manufacturing",
   "title": "Industrials and Manufacturing",
   "intro": [
    "We advise manufacturers and industrial businesses on investment, operations, regulation and disputes in Malaysia, including in the high technology semiconductor and electronics industry.",
    "Our lawyers draw on our corporate, competition, employment, intellectual property, international trade, environmental and dispute resolution practices."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Investments, acquisitions and joint ventures, including manufacturing licences and incentives.",
      "Supply, distribution and technology licensing arrangements.",
      "Customs, trade remedies and export controls.",
      "Patent and trade secret protection.",
      "Supply chain and rules of origin issues.",
      "Environmental and occupational safety and health compliance.",
      "Employment and industrial relations, and commercial disputes."
     ]
    }
   ],
   "contacts": [
    "To' Puan Janet Looi",
    "Lim Koon Huan",
    "Sheba Gumis",
    "Manshan Singh"
   ],
   "img": "sectors/industrial-and-manufacturing"
  },
  {
   "slug": "life-sciences-healthcare-biotechnology-and-pharmaceuticals",
   "title": "Life Sciences, Healthcare, Biotechnology and Pharmaceuticals",
   "intro": [
    "We act for hospitals and healthcare service providers, pharmaceutical companies, medical device manufacturers, healthcare professionals and insurers.",
    "Our work covers regulatory, intellectual property, transactional and contentious matters."
   ],
   "groups": [
    {
     "title": "",
     "items": [
      "Regulatory compliance, pre-market approval and licensing requirements.",
      "Patent protection, data exclusivity and compulsory licensing.",
      "Advertising and promotion of healthcare products.",
      "Mergers and acquisitions and financing documentation.",
      "Medical negligence and disciplinary proceedings."
     ]
    }
   ],
   "contacts": [
    "Kuek Pei Yee",
    "Sheba Gumis",
    "Foo Siew Li",
    "Melissa Long",
    "Alyshea Low Khye Lyn"
   ],
   "img": "sectors/healthcare-biotechnology-and-pharmaceuticals"
  },
  {
   "slug": "maritime-and-shipping",
   "title": "Maritime and Shipping",
   "intro": [
    "We advise shipowners, charterers, cargo interests, P&I Clubs, insurers, financiers, port operators and other participants in the maritime industry on corporate, finance, regulatory and contentious matters.",
    "Our lawyers draw on several practice areas to provide coordinated advice across a vessel's life cycle."
   ],
   "groups": [
    {
     "title": "Maritime Corporate, Finance and Regulatory",
     "items": []
    },
    {
     "title": "Charterparties",
     "items": [
      "Drafting and negotiating time, voyage and bareboat charterparties."
     ]
    },
    {
     "title": "Ship Finance and Leasing",
     "items": [
      "Financing of vessel construction and acquisition, including FPSOs and other maritime structures.",
      "Leasing arrangements."
     ]
    },
    {
     "title": "Ship Sale, Purchase and Registration",
     "items": [
      "Sale and purchase of vessels, ship registration and flagging."
     ]
    }
   ],
   "contacts": [
    "Fariz Abdul Aziz",
    "Tan Shi Wen"
   ],
   "img": "sectors/maritime-and-shipping",
   "disputes": "maritime-and-shipping-disputes"
  }
 ],
 "disputes": {
  "banking-and-finance-disputes": {
   "slug": "banking-and-finance-disputes",
   "title": "Banking and Finance Disputes",
   "intro": [
    "We advise and represent banks, development finance institutions, borrowers, guarantors and security providers in disputes arising from conventional and Islamic financing. We act in the Malaysian courts and in arbitration.",
    "We act from the first signs of default through to recovery, enforcement and appeal. Where a dispute involves refinancing, a workout or a formal insolvency process, we work with our Banking and Finance and Restructuring and Insolvency colleagues."
   ],
   "groups": [
    {
     "title": "Claims against Financial Institutions",
     "items": [
      "Defence of financial institutions in claims brought by customers and third parties.",
      "Advice on lender liability and the management of litigation risk."
     ]
    },
    {
     "title": "Conventional and Islamic Financing Disputes",
     "items": [
      "Disputes arising from facility agreements, security documents and guarantees.",
      "Disputes involving Islamic financing documents, including murabahah, ijarah and musharakah structures."
     ]
    },
    {
     "title": "Recovery and Enforcement of Security",
     "items": [
      "Recovery proceedings against borrowers, guarantors and security providers.",
      "Foreclosure and enforcement of charges, debentures and assignments.",
      "Enforcement of judgments, including through bankruptcy and winding-up proceedings."
     ]
    }
   ],
   "contacts": [
    "Claudia Cheah Pek Yee",
    "Lim Koon Huan",
    "Vijay Raj",
    "Ratha Govindasamy"
   ],
   "img": "practice/banking-and-finance",
   "parent": "banking-and-finance",
   "parentType": "practice"
  },
  "construction-engineering-projects-and-infrastructure-disputes": {
   "slug": "construction-engineering-projects-and-infrastructure-disputes",
   "title": "Construction, Engineering, Projects and Infrastructure Disputes",
   "intro": [],
   "groups": [
    {
     "title": "Adjudication under CIPAA",
     "items": [
      "Adjudication under the Construction Industry Payment and Adjudication Act 2012 (CIPAA), for claimants and respondents.",
      "Proceedings to enforce, stay or set aside adjudication decisions."
     ]
    },
    {
     "title": "Construction Arbitration and Litigation",
     "items": [
      "Claims for payment, delay, defects, variations and termination.",
      "Arbitration, litigation and mediation of construction and engineering disputes, including under PAM, CIDB, PWD and FIDIC forms.",
      "Working with quantum, delay and technical experts."
     ]
    },
    {
     "title": "Performance Bonds and Urgent Relief",
     "items": [
      "Calls on performance bonds and bank guarantees, and applications to restrain them.",
      "Other urgent interim applications arising from construction projects."
     ]
    },
    {
     "title": "Occupational Safety and Health",
     "items": [
      "Compliance with the Occupational Safety and Health Act 1994.",
      "Workplace incidents, investigations and enforcement proceedings."
     ]
    },
    {
     "title": "Professional Negligence",
     "items": [
      "Professional negligence claims arising from design, supervision and certification. against engineers, architects and construction Professionals"
     ]
    }
   ],
   "contacts": [
    "Ivan Loo",
    "Ashok Kumar Mahadev Ranai",
    "Loshini Ramarmuty"
   ],
   "img": "practice/construction-and-engineering",
   "parent": "construction-engineering-projects-and-infrastructure",
   "parentType": "practice"
  },
  "corporate-and-commercial-disputes": {
   "slug": "corporate-and-commercial-disputes",
   "title": "Corporate & Commercial Disputes",
   "intro": [
    "We act for companies, directors, shareholders, insolvency practitioners and other stakeholders in company law disputes before the Malaysian courts and arbitral tribunals. Our work covers shareholder remedies, directors' duties, governance disputes and winding-up proceedings.",
    "Many shareholder disputes involve both statutory remedies and arbitration, particularly where shareholders' agreements contain arbitration clauses or corporate structures span more than one jurisdiction. We advise on the appropriate forum and remedies at the outset."
   ],
   "groups": [
    {
     "title": "Board and Shareholder Disputes",
     "items": [
      "Disputes over the control, management or governance of companies and joint ventures.",
      "Claims arising from shareholders' agreements and constitutions."
     ]
    },
    {
     "title": "Company Meetings, Resolutions and Requisitions",
     "items": [
      "Requisition of meetings, challenges to resolutions and disputes over voting.",
      "Urgent applications to restrain or validate meetings."
     ]
    },
    {
     "title": "Derivative Actions",
     "items": [
      "Applications for leave to bring derivative actions under the Companies Act 2016.",
      "Acting for shareholders, directors and companies in derivative proceedings."
     ]
    },
    {
     "title": "Directors' Duties and Breach of Fiduciary Duty Claims",
     "items": [
      "Claims against directors and officers for breach of duty.",
      "Defence of directors in claims brought by companies, shareholders and liquidators."
     ]
    },
    {
     "title": "Just and Equitable Winding-Up",
     "items": [
      "Petitions to wind up companies on just and equitable grounds.",
      "Defence of petitions and alternative remedies, including buy-outs."
     ]
    },
    {
     "title": "Shareholder Oppression and Minority Remedies",
     "items": [
      "Claims under section 346 of the Companies Act 2016.",
      "Remedies including share buy-outs, regulation of company affairs and valuation disputes."
     ]
    },
    {
     "title": "Regulatory Enforcement",
     "items": [
      "Civil enforcement proceedings involving securities and capital markets regulation.",
      "Representation of capital markets regulators in enforcement actions and related court proceedings.",
      "Responses to regulatory enquiries, and challenges to regulatory decisions."
     ]
    }
   ],
   "contacts": [
    "Vijay Raj",
    "Sharon Chong Tze Ying",
    "Nimalan Devaraja"
   ],
   "img": "practice/corporate",
   "parent": "corporate-and-commercial",
   "parentType": "practice"
  },
  "employment-disputes": {
   "slug": "employment-disputes",
   "title": "Employment Disputes",
   "intro": [],
   "groups": [
    {
     "title": "Employment Disputes (Industrial Court and civil courts)",
     "items": [
      "Unjust dismissal claims before the Industrial Court and related judicial review proceedings.",
      "Claims involving bonuses, incentives, remuneration and restrictive covenants.",
      "Proceedings before the Labour Court and the civil courts."
     ]
    }
   ],
   "contacts": [
    "Selvamalar Alagaratnam",
    "Foo Siew Li",
    "Sara Lau"
   ],
   "img": "practice/employment",
   "parent": "employment",
   "parentType": "practice"
  },
  "insurance-and-reinsurance-disputes": {
   "slug": "insurance-and-reinsurance-disputes",
   "title": "Insurance and Reinsurance Disputes",
   "intro": [],
   "groups": [
    {
     "title": "",
     "items": [
      "Coverage disputes, policyholder claims and disputes under insurance and reinsurance contracts.",
      "Interpleader applications where there are competing claims to insurance proceeds."
     ]
    }
   ],
   "contacts": [
    "Mubashir Mansor",
    "Loo Peh Fern"
   ],
   "img": "sectors/insurance-and-reinsurance",
   "parent": "insurance-and-reinsurance",
   "parentType": "practice"
  },
  "international-trade-disputes": {
   "slug": "international-trade-disputes",
   "title": "International Trade Disputes",
   "intro": [],
   "groups": [
    {
     "title": "Trade Remedies (anti-dumping, countervailing and safeguard measures)",
     "items": [
      "Preparing applications for domestic producers and responding to investigations on behalf of importers, exporters and foreign producers.",
      "Advising on questionnaires, verification visits, and submissions on dumping, subsidisation, injury and causation.",
      "Reviews of existing measures and challenges to trade remedy determinations.",
      "Coordinating responses to overseas trade remedy proceedings affecting Malaysian exporters."
     ]
    }
   ],
   "contacts": [],
   "img": "sectors/maritime-and-shipping",
   "parent": "international-trade",
   "parentType": "practice"
  },
  "intellectual-property-disputes": {
   "slug": "intellectual-property-disputes",
   "title": "Intellectual Property Disputes",
   "intro": [],
   "groups": [
    {
     "title": "IP Litigation and Enforcement (patents, trade marks, copyright and designs)",
     "items": [
      "Infringement and invalidation proceedings involving patents, trade marks, industrial designs and copyright.",
      "Passing off claims.",
      "Breach of confidence claims.",
      "Urgent applications, including Anton Piller orders to preserve evidence.",
      "Non-use cancellation and invalidation actions involving trade marks."
     ]
    }
   ],
   "contacts": [
    "Kuek Pei Yee"
   ],
   "img": "practice/intellectual-property-and-tmt",
   "parent": "intellectual-property",
   "parentType": "practice"
  },
  "oil-gas-and-energy-disputes": {
   "slug": "oil-gas-and-energy-disputes",
   "title": "Oil, Gas and Energy Disputes",
   "intro": [
    "We advise and represent oil and gas companies, power producers, contractors, service providers and investors in disputes across the upstream, midstream and downstream oil and gas sectors, and in power, utilities and renewable energy. We act in the Malaysian courts, in domestic and international arbitration and in adjudication. Where parties, assets or proceedings are in more than one jurisdiction, we coordinate with overseas counsel."
   ],
   "groups": [
    {
     "title": "Offshore, Pipeline and Construction Disputes",
     "items": [
      "Disputes arising from pipeline and offshore construction projects, including EPC and fabrication contracts, in court, arbitration and adjudication."
     ]
    },
    {
     "title": "Power and Renewable Energy Disputes",
     "items": [
      "Disputes under power purchase agreements and renewable energy project contracts."
     ]
    },
    {
     "title": "Production Sharing, Joint Operating and Joint Venture Disputes",
     "items": [
      "Disputes involving production sharing contracts and joint operating agreements.",
      "Disputes between co-venturers over participating interests, funding and operations."
     ]
    },
    {
     "title": "Service, Supply and Product Quality Disputes",
     "items": [
      "Disputes under service and supply agreements, including payment and termination claims.",
      "Product quality and specification disputes."
     ]
    }
   ],
   "contacts": [
    "Ivan Loo",
    "Ashok Kumar Mahadev Ranai",
    "Lim Koon Huan",
    "Sharon Chong Tze Ying",
    "Manshan Singh",
    "Muhammad Suhaib bin Ibrahim"
   ],
   "img": "sectors/oil-and-gas-and-energy",
   "parent": "oil-gas-and-energy",
   "parentType": "practice"
  },
  "real-estate-disputes": {
   "slug": "real-estate-disputes",
   "title": "Real Estate Disputes",
   "intro": [],
   "groups": [
    {
     "title": "",
     "items": [
      "Land and property disputes for individuals and companies."
     ]
    },
    {
     "title": "Land Acquisition",
     "items": [
      "Land acquisition compensation claims under the Land Acquisition Act 1960 for landowners and acquiring authorities, working with valuers on market value, severance and injurious affection."
     ]
    },
    {
     "title": "Strata Management",
     "items": [
      "Fee Recovery & Arrears: Strategies and legal action to recover outstanding maintenance charges and sinking fund contributions.",
      "By-Law & Conduct Disputes: Advising on house rules, renovations, parking, noise, and common property misuse.",
      "Meetings & Governance: Reviewing meeting procedures, resolutions, and statutory powers of JMBs, MCs, and committees.",
      "Tribunal & Court Strategy: Advising on Strata Management Tribunal claims, judicial/High Court challenges, and settlement negotiations."
     ]
    },
    {
     "title": "Tenancy",
     "items": [
      "Rent Recovery & Arrears: Issuing demands, negotiating repayment terms, and pursuing claims for unpaid rent, utilities, or double rental/mesne profits.",
      "Recovery of Possession & Eviction: Advising on termination notices, forfeiture, and court applications for vacant possession while avoiding unlawful lockouts or self-help.",
      "Security Deposits & Property Condition: Resolving disputes over deposit deductions, fair wear and tear, property damage, and unapproved alterations.",
      "Lease Breaches & Holding Over: Acting on early termination, unauthorized subletting, holding over after expiry, and maintenance or repair obligations.",
      "Tenant Protection & Quiet Enjoyment: Representing tenants facing wrongful eviction, unreturned deposits, or interference with peaceful enjoyment of the property."
     ]
    },
    {
     "title": "Valuations, Rates and Assessments",
     "items": [
      "Advising on whether land, buildings and infrastructure are rateable, and whether liability falls on the owner or occupier.",
      "Objections to valuation lists and assessments before local authorities.",
      "Rating appeals and judicial review proceedings, including challenges to retrospective assessments."
     ]
    }
   ],
   "contacts": [],
   "img": "practice/real-estate",
   "parent": "real-estate",
   "parentType": "practice"
  },
  "regulatory-compliance-and-white-collar-defence-disputes": {
   "slug": "regulatory-compliance-and-white-collar-defence-disputes",
   "title": "White-Collar Defence",
   "intro": [
    "We represent corporations, boards, executives and individuals facing criminal and regulatory investigations and enforcement action. Our work draws on experience in anti-corruption, financial crime, securities regulation and corporate governance.",
    "We advise from the first contact with an enforcement agency, including during raids, through to investigative interviews, prosecution and judicial review. We remain conscious throughout of the reputational, operational and governance issues involved."
   ],
   "groups": [
    {
     "title": "Corporate Liability and Adequate Procedures (section 17A MACC Act)",
     "items": [
      "Advice on corporate liability for corruption and the adequate procedures defence.",
      "Representation of companies and their officers in investigations and proceedings under section 17A."
     ]
    },
    {
     "title": "Forfeiture and Asset Seizure Proceedings",
     "items": [
      "Responding to seizure, freezing and forfeiture actions by enforcement agencies.",
      "Applications for the release of seized property and claims by third parties."
     ]
    },
    {
     "title": "Representation in Enforcement Agency Investigations",
     "items": [
      "On-site support during raids by the Royal Malaysia Police, the Malaysian Anti-Corruption Commission and other agencies.",
      "Advice on statements, interviews and document production.",
      "Defence of criminal charges and related proceedings."
     ]
    }
   ],
   "contacts": [
    "Lim Koon Huan",
    "Manshan Singh"
   ],
   "img": "practice/regulatory-compliance",
   "parent": "regulatory-compliance-and-white-collar-defence",
   "parentType": "practice"
  },
  "tax-and-revenue-disputes": {
   "slug": "tax-and-revenue-disputes",
   "title": "Tax and Revenue Disputes",
   "intro": [],
   "groups": [
    {
     "title": "",
     "items": [
      "Disputed income tax assessments, transfer pricing adjustments and other contentious tax matters.  ( stamp duty?)",
      "Appeals before the Special Commissioners of Income Tax and the courts, and judicial review proceedings where appropriate."
     ]
    }
   ],
   "contacts": [
    "Lim Koon Huan",
    "Preetha Pillai",
    "Vijay Raj",
    "Manshan Singh"
   ],
   "img": "practice/tax-and-revenue",
   "parent": "tax-and-revenue",
   "parentType": "practice"
  },
  "technology-media-and-telecommunications-tmt-disputes": {
   "slug": "technology-media-and-telecommunications-tmt-disputes",
   "title": "Technology, Media and Telecommunications Disputes",
   "intro": [],
   "groups": [
    {
     "title": "",
     "items": [
      "Technology, Outsourcing and IT Contract Disputes",
      "Disputes involving software development, systems integration, licensing and outsourcing contracts."
     ]
    }
   ],
   "contacts": [],
   "img": "sectors/telecommunications-media-and-technology",
   "parent": "technology-media-and-telecommunications-tmt",
   "parentType": "practice"
  },
  "civil-disputes": {
   "slug": "civil-disputes",
   "title": "Civil Disputes",
   "intro": [
    "We advise and represent individuals, institutional clients and public bodies in civil claims before the Malaysian courts. Our work covers defamation, economic torts, negligence, nuisance, trespass and personal injury.",
    "We assist clients from the first assessment of a claim through to settlement, trial, appeal and enforcement. Where urgent relief is needed, we advise on the orders available and the steps required to obtain or oppose them."
   ],
   "groups": [
    {
     "title": "Defamation, Malicious Falsehood and Online Reputation",
     "items": [
      "Claims arising from statements published online, on social media or through traditional media.",
      "Urgent applications for injunctive relief and the removal of content where appropriate.",
      "Representation of claimants, publishers and media organisations in defamation and malicious falsehood proceedings."
     ]
    },
    {
     "title": "Economic Torts",
     "items": [
      "Claims for conspiracy, inducing breach of contract and unlawful interference with business.",
      "Passing off and other claims protecting business goodwill.",
      "Defence of claims brought against businesses and their officers."
     ]
    },
    {
     "title": "Negligence, Nuisance and Trespass",
     "items": [
      "Negligence claims between individuals and businesses.",
      "Nuisance and trespass claims affecting land, property and business operations.",
      "Advice on civil remedies, interim applications, settlement and enforcement."
     ]
    },
    {
     "title": "Personal Injury",
     "items": [
      "Representation of claimants and defendants, including insurers, in personal injury claims.",
      "Claims arising from road accidents, workplace incidents and occupiers' liability.",
      "Coordination with medical and other experts on liability and quantum."
     ]
    }
   ],
   "contacts": [],
   "img": "practice/litigation-and-arbitration",
   "parent": "dispute-resolution",
   "parentType": "practice"
  },
  "commercial-disputes": {
   "slug": "commercial-disputes",
   "title": "Commercial Disputes",
   "intro": [
    "We advise and represent businesses and financial institutions in commercial disputes before the Malaysian courts and in arbitration. Our work covers contractual claims, debt recovery, distribution and joint venture disputes, supply chain claims and disputes involving securities and technology.",
    "We take time to understand each client's commercial objectives and risk profile, and plan the dispute strategy around them. Where a dispute has a cross-border dimension, we work with overseas counsel, including through Lex Mundi. Banking and finance, construction, and oil, gas and energy disputes are covered on their own practice pages, and intellectual property and maritime disputes on the relevant practice and industry pages."
   ],
   "groups": [
    {
     "title": "Contractual Disputes",
     "items": [
      "Claims arising from commercial transactions, supply and services arrangements, and other business relationships.",
      "Urgent interim applications, including injunctions, as well as trials and appeals."
     ]
    },
    {
     "title": "Cross-Border Litigation and Enforcement of Foreign Judgments",
     "items": [
      "Coordination of proceedings where parties, assets or evidence are in more than one jurisdiction.",
      "Registration and enforcement of foreign judgments in Malaysia.",
      "Advice on jurisdiction, forum and service out of jurisdiction."
     ]
    },
    {
     "title": "Debt Recovery and Enforcement of Judgments",
     "items": [
      "Recovery actions for trade and commercial debts.",
      "Enforcement of judgments through execution, garnishee and insolvency proceedings."
     ]
    },
    {
     "title": "Distribution, Agency and Franchise Disputes",
     "items": [
      "Disputes over termination, exclusivity and performance under distribution and agency agreements.",
      "Franchise disputes, including issues under the Franchise Act 1998."
     ]
    },
    {
     "title": "Joint Venture and Partnership Disputes",
     "items": [
      "Disputes between joint venture parties over control, funding, deadlock and exit.",
      "Partnership disputes, including dissolution and the taking of accounts."
     ]
    },
    {
     "title": "M&A Disputes (warranty, indemnity and earn-out claims)",
     "items": [
      "Claims for breach of warranty, indemnity claims and completion accounts and earn-out disputes, with our dispute resolution colleagues."
     ]
    },
    {
     "title": "Sale of Goods, Supply Chain and Commodities Disputes",
     "items": [
      "Claims involving the quality, delivery and price of goods.",
      "Supply chain disruption, force majeure and termination claims.",
      "Commodities disputes, including in arbitration."
     ]
    },
    {
     "title": "Securities and Capital Markets Disputes",
     "items": [
      "Civil claims arising from securities transactions and investments.",
      "Disputes involving listed companies, investors and market intermediaries."
     ]
    }
   ],
   "contacts": [],
   "img": "practice/litigation-and-arbitration",
   "parent": "dispute-resolution",
   "parentType": "practice"
  },
  "aviation-disputes": {
   "slug": "aviation-disputes",
   "title": "Aviation Disputes",
   "intro": [],
   "groups": [
    {
     "title": "Aircraft Repossession and Lease Enforcement",
     "items": [
      "Lease defaults, repossession and deregistration of aircraft.",
      "Delivery and redelivery disputes."
     ]
    },
    {
     "title": "Aviation Claims and Disputes",
     "items": [
      "Manufacturing defect claims, airline passenger claims, and insurance and reinsurance disputes.",
      "Competition law and aviation regulatory disputes, in court and arbitration."
     ]
    }
   ],
   "contacts": [
    "Mubashir Mansor",
    "Vijay Raj",
    "Sharon Chong Tze Ying"
   ],
   "img": "sectors/aviation",
   "parent": "aviation",
   "parentType": "sector"
  },
  "maritime-and-shipping-disputes": {
   "slug": "maritime-and-shipping-disputes",
   "title": "Maritime and Shipping Disputes",
   "intro": [],
   "groups": [
    {
     "title": "Charterparty, Cargo and Casualty Claims",
     "items": [
      "Charterparty disputes, cargo claims, general average and casualty claims, in court and arbitration."
     ]
    },
    {
     "title": "Vessel Arrest and Ship Mortgage Enforcement",
     "items": [
      "Vessel arrests and admiralty proceedings.",
      "Enforcement of ship mortgages."
     ]
    }
   ],
   "contacts": [
    "Vijay Raj",
    "Louise Jacqueline Azmi"
   ],
   "img": "sectors/maritime-and-shipping",
   "parent": "maritime-and-shipping",
   "parentType": "sector"
  }
 },
 "drList": [
  {
   "label": "Arbitration and Alternative Dispute Resolution",
   "area": "arbitration-and-alternative-dispute-resolution"
  },
  {
   "label": "Aviation",
   "disputes": "aviation-disputes"
  },
  {
   "label": "Banking and Finance",
   "disputes": "banking-and-finance-disputes"
  },
  {
   "label": "Civil",
   "disputes": "civil-disputes"
  },
  {
   "label": "Commercial",
   "disputes": "commercial-disputes"
  },
  {
   "label": "Constitutional and Administrative Law",
   "area": "constitutional-and-administrative-law"
  },
  {
   "label": "Construction Engineering, Projects and Infrastructure",
   "disputes": "construction-engineering-projects-and-infrastructure-disputes"
  },
  {
   "label": "Corporate & Shareholders’ Disputes",
   "disputes": "corporate-and-commercial-disputes"
  },
  {
   "label": "Employment",
   "disputes": "employment-disputes"
  },
  {
   "label": "Fraud and Asset Recovery",
   "area": "fraud-and-asset-recovery"
  },
  {
   "label": "Insolvency & Restructuring",
   "area": "restructuring-and-insolvency"
  },
  {
   "label": "Insurance and Reinsurance",
   "disputes": "insurance-and-reinsurance-disputes"
  },
  {
   "label": "Intellectual Property",
   "disputes": "intellectual-property-disputes"
  },
  {
   "label": "International Trade",
   "disputes": "international-trade-disputes"
  },
  {
   "label": "Maritime and Shipping",
   "disputes": "maritime-and-shipping-disputes"
  },
  {
   "label": "Oil, Gas and Energy",
   "disputes": "oil-gas-and-energy-disputes"
  },
  {
   "label": "Probate",
   "pending": true
  },
  {
   "label": "Professional Liability and Indemnity",
   "area": "professional-liability-and-indemnity"
  },
  {
   "label": "Tax",
   "disputes": "tax-and-revenue-disputes"
  },
  {
   "label": "Technology, Media and Telecommunications",
   "disputes": "technology-media-and-telecommunications-tmt-disputes"
  },
  {
   "label": "Real Estate",
   "disputes": "real-estate-disputes"
  },
  {
   "label": "White-Collar Defence",
   "disputes": "regulatory-compliance-and-white-collar-defence-disputes"
  }
 ]
};
