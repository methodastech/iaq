/* ============================================================================
   business.js · the public data of IAQ's business: the six SERVICES, the three kinds of WORK with their systems, the
   three business UNITS. Moved out of data/codex.js on 24 Sep 2026 so that public pages (the home page's FabExplorer)
   can read it WITHOUT bundling the Codex: codex.js carries internal notes, decisions and document cross-checks that
   must never reach the launch bundle. codex.js re-exports these three, so every Codex import still works.
   ============================================================================ */
export const SERVICES = [
  { id: 'design',     n: 1, name: 'Engineering design and consultation', short: 'Design',     icon: 'compass', line: 'Concept to detailed design, feasibility, permitting, BIM.' },
  { id: 'procure',    n: 2, name: 'Procurement',                          short: 'Procure',    icon: 'crate',   line: 'Sourcing, tenders and long-lead equipment, tracked in one system.' },
  { id: 'construct',  n: 3, name: 'Construction',                         short: 'Construct',  icon: 'crane',   line: 'Site management, safety, quality, programme and cost.' },
  { id: 'commission', n: 4, name: 'Testing and commissioning',            short: 'Commission', icon: 'gauge',   line: 'Proven to operate as intended, before handover.' },
  { id: 'maintain',   n: 5, name: 'Maintenance',                          short: 'Maintain',   icon: 'gear',    line: 'Planned care that protects lifespan and uptime.' },
  { id: 'hookup',     n: 6, name: 'Tools hookup',                         short: 'Hook up',    icon: 'link',    line: 'Production tools connected into the facility and released to production.' },
]

export const WORK = [
  { id: 'csa', name: 'CSA', full: 'Civil, Structural and Architectural', icon: 'building',
    line: 'The building itself.',
    systems: ['Piling and foundations', 'Structural frame and roof', 'Cleanroom envelope: walls, ceiling grid, raised floor', 'Architectural finishes'] },
  { id: 'mep', name: 'MEP', full: 'Mechanical, Electrical and Plumbing', icon: 'airflow',
    line: 'What makes the building run.',
    systems: ['HVAC, ACMV and fan filter units', 'Process cooling water (PCW)', 'Chiller plant and district cooling', 'Fire protection', 'Electrical, high and low voltage', 'Plumbing and drainage'] },
  { id: 'process', name: 'Process utilities', full: 'The utilities a production tool consumes', icon: 'gas',
    line: 'What the tool runs on.',
    systems: ['Clean dry air (CDA)', 'Specialty gases and chemical delivery', 'Ultrapure water (UPW)', 'Process vacuum (PV) and exhaust', 'Waste treatment'] },
]

/* services: `core` is what the unit always carries; `ask` is carried when the client asks for it */
export const UNITS = [
  {
    id: 'epc', no: 1, name: 'EPC', full: 'Engineering, Procurement and Construction', icon: 'epcUnit',
    line: 'Builds the facility.',
    what: 'One contract for a hi-tech facility, from the first drawing to handover. IAQ answers for the system working as intended.',
    models: [
      { t: 'EPCC', s: 'IAQ delivers the whole project, commissioning included.' },
      { t: 'EPCM', s: 'IAQ manages it; the owner holds the construction contracts. Engaged by large multinationals on the biggest programmes.' },
    ],
    /* 25 Sep (Bazil: "EPC unit is not supposed to be in maintenance and tools hookup"): maintenance sits with EFM, tools
       hookup with PCU & TTI. NOTE: IAQ's questionnaire (Q-EPC-A) lists them as EPC stages 5 and 6; to confirm with IAQ */
    core: ['design', 'procure', 'construct', 'commission'], ask: [],
    work: ['csa', 'mep', 'process'],
    bought: 'The whole facility, or any one service under the same model.',
    when: 'You are building or extending a facility and want one company to answer for all of it.',
    term: '12 to 24 months',
    route: '/services/epc-construction',
  },
  {
    id: 'hookup', no: 2, name: 'Process Critical Utilities & Total Tool Installation Solutions', short: 'PCU & TTI', full: 'The specialist EPCM partner for semiconductor fabs', icon: 'pcuUnit',
    line: 'Re-equips a live semiconductor fab.',
    what: 'Process Critical Utilities builds the gas, chemical, water and exhaust systems. Total Tool Installation connects each tool to them, inside a fab that keeps running. Semiconductor only.',
    models: [
      { t: 'Standalone', s: 'Bought on its own, on a facility built by IAQ or by others.' },
      { t: 'On the EPC or EPCM model', s: 'IAQ’s own deck presents the unit as a specialist EPCM partner.' },
    ],
    core: ['design', 'procure', 'construct', 'commission', 'hookup'], ask: ['maintain'],
    work: ['mep', 'process'],
    bought: 'Process Critical Utilities, Total Tool Installation, or the two together, as one offering.',
    when: 'Your fab is running and new tools are coming in, or the gas, chemical, water or exhaust systems need to grow.',
    term: 'Per tool set',
    route: '/services/tool-installation',
  },
  {
    id: 'efm', no: 3, name: 'EFM', full: 'Energy Facility Management', icon: 'efmUnit',
    line: 'Runs and maintains it.',
    /* 25 Sep (Bazil: "make sure these are correct"), read against the Energy Management questionnaire (Q-EM, 27 Jul):
       EFM's energy management services are Cooling as a Service, Energy Performance Contracting, Energy Audit,
       Chiller Plant / HVAC Upgrading, Operation and Maintenance, and Build Operate Transfer for district cooling.
       CaaS is "a fixed tariff energy cost charged to end user"; EPC contracting is "all payment based on actual savings
       achieved"; "IAQ fund the implementation of energy saving solutions including equipment upgrading, operation and
       maintenance". The contract lengths (10 to 20, 5 to 10 years) and "registered ESCO" are NOT in IAQ's papers:
       kept from the 17 Sep review, flagged in HANDOVER for Nabilah to confirm. */
    what: 'A registered Energy Service Company (ESCO). IAQ funds and runs the energy upgrade and is paid from the savings, or supplies cooling under a tariff; it also audits energy use, upgrades chiller plants and HVAC, and operates and maintains them.',
    models: [
      { t: 'Cooling as a Service', s: 'IAQ finances, builds and operates the chiller plant. A fixed tariff, 10 to 20 years.' },
      { t: 'Energy Performance Contracting', s: 'IAQ funds the upgrades and is paid from measured savings, 5 to 10 years.' },
      { t: 'Build Operate Transfer', s: 'IAQ builds and runs a district cooling system, then hands it over.' },
    ],
    core: ['maintain', 'commission'], ask: ['design', 'procure', 'construct'],
    work: ['mep'],
    bought: 'The saving itself, measured against an audited baseline. IAQ funds the work upfront.',
    when: 'Your energy or cooling bill is high and you want it cut, with IAQ funding the work and paid from the saving.',
    term: '5 to 20 years',
    route: '/services/energy-management',
  },
]

/* 18 Sep (Bazil: "we do what we feel is the best but leave the questions at the top if we have
   any"). Each question carries what was done in the meantime, so nothing waits on the answer, and
   who can answer it. When one is answered, move its outcome into the data above and delete the row. */
/* 18 Sep, later: IAQ forwarded a competitor's company introduction deck ("This is Sunny expectation
   on the deliverable from Brandmethod. Infographic that help clients to understand our business")
   and asked for the unit pages to be extended into the company profile "after 3 business unit
   page". The deck is read here by DEVICE, not reproduced: what each slide does, why it works, and
   which IAQ slide answers it. Figures from their deck stay out of this file. */
