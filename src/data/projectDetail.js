/* ============ per-project case study detail ============
   Keyed by the registry index in src/data/projects.js (0..17, in registry order).

   EVERY field here is traceable to one entry in
   iaq_content.json -> projects.verified_references, which was mined from the IAQ
   company profile. Nothing is written from memory or inference. If the source did
   not state a thing, the key is simply absent from the object and the page renders
   a labelled gap instead of guessing.

   Field contract
     ref               the verified_references key this project maps to
     confidence        'verified'  the profile names this client and this project
                       'matched'   the profile carries this project but under a
                                   different or anonymised client name (recorded
                                   in `attribution`), so the works are sourced and
                                   the client attribution comes from the approved
                                   concept, not from the profile
     attribution       what the profile actually calls it, when it differs
     role              delivery role, only where the source states it
     isoDetail         the full class string exactly as the profile records it
     isoNotApplicable  true where the profile records "Not Applicable"
     scopeOfWorks      the profile's scope field, split into discrete items
     systems           only the systems the scope itself names
     summary           the profile's description, edited only for house copy rules
     siteType          Greenfield / Brownfield / Greenfield on brownfield, if stated
     builtUp           built-up area, only where the source says "built-up area"
     source            the profile page, so every claim above is checkable

   NOT in here, because none of it is verified anywhere: years, dates, durations,
   contract values, client quotes, outcome metrics, photography rights.
   Those are the labelled placeholder slot on the page.

   Known source conflicts, flagged rather than silently resolved:
     0  registry says ISO 4 to 6, profile records ISO 6, 7
     2  registry says ISO 5, profile records ISO 6, 7
     3  registry says ISO 4, profile records ISO 5, 6, 7
     7  registry publishes Southeast Asia, profile records the plant in China
     17 registry says ISO 6, profile records no cleanroom classification
   The profile is the higher authority per PAGEBUILD.md, so the class strings below
   are the profile's. The registry cards in projects.js still carry the short
   summaries and should be reconciled by whoever owns that file. */

export const PROJECT_DETAIL = {
  /* 0 · Semiconductor manufacturer, testing manufacturing plant */
  0: {
    ref: 'iaq-prj-001',
    confidence: 'verified',
    role: 'General contractor',
    isoDetail: 'ISO 6, 7 (Class 1K, 10K)',
    scopeOfWorks: [
      'Main building civil, structural and architectural (CSA)',
      'Mechanical, electrical and process utilities (MEP)',
      'Cleanroom package',
    ],
    systems: ['Cleanroom', 'CSA', 'Mechanical and electrical', 'Process utilities'],
    summary: 'General contractor for a greenfield testing and manufacturing plant. Built-up area up to 25,000 m².',
    siteType: 'Greenfield',
    builtUp: '25,000 m²',
    source: 'IAQ company profile, page 25',
  },

  /* 1 · Wafer foundry, wafer fab facility and expansion.
     The profile carries this entry anonymised as "Wafer Fab Facility & Expansion".
     The works, class and areas below are the profile's. The client name is the
     approved concept's, not the profile's. */
  1: {
    ref: 'iaq-prj-002',
    confidence: 'matched',
    attribution: 'The company profile records this reference as "Wafer Fab Facility & Expansion" without naming the client.',
    role: 'EPCC with design and build',
    isoDetail: 'ISO 5 (Class 100)',
    scopeOfWorks: [
      'New building EPCC',
      'Civil, structural and architectural (CSA)',
      'Mechanical and electrical',
      'Cleanroom',
      'Process utilities',
      'Specialty gases',
      'Bulk gases',
      'Chemical delivery system',
    ],
    systems: ['Cleanroom', 'CSA', 'Mechanical and electrical', 'Process utilities', 'Specialty gases', 'Bulk gases', 'Chemical delivery'],
    summary: 'EPCC and design and build for the FAB1E A and B expansion. Cleanroom area up to 1,000 m², new CUB building area 5,000 m².',
    source: 'IAQ company profile, page 26',
  },

  /* 2 · Semiconductor manufacturer, Malaysia Block 8 */
  2: {
    ref: 'iaq-prj-003',
    confidence: 'verified',
    role: 'EPCM',
    isoDetail: 'ISO 6, 7 (Class 1K, 10K)',
    scopeOfWorks: [
      'Civil and structural works',
      'Cleanroom',
      'Air-conditioning',
      'Process utilities',
      'Multi-storey carpark',
    ],
    systems: ['Cleanroom', 'CSA', 'Air-conditioning', 'Process utilities'],
    summary: 'Block 8, a testing, probe and assembly plant. Built-up area up to 43,000 m².',
    builtUp: '43,000 m²',
    source: 'IAQ company profile, page 29',
  },

  /* 3 · Semiconductor manufacturer, DLP cleanroom */
  3: {
    ref: 'iaq-prj-004',
    confidence: 'verified',
    isoDetail: 'ISO 5, 6, 7 (Class 100, 1K, 10K)',
    scopeOfWorks: [
      'Cleanroom architectural',
      'Mechanical, electrical and process utilities (MEP)',
      'Plumbing',
      'BMS system',
    ],
    systems: ['Cleanroom', 'Mechanical and electrical', 'Process utilities', 'Plumbing', 'BMS'],
    summary: 'DLP cleanroom project.',
    source: 'IAQ company profile, page 27',
  },

  /* 4 · Silicon wafer manufacturer, Ipoh */
  4: {
    ref: 'iaq-prj-005',
    confidence: 'verified',
    isoDetail: 'ISO 3, 4, 5, 6 & 7 (Class 1, 10, 100, 1K, 10K)',
    scopeOfWorks: [
      'Mechanical and electrical',
      'Process utilities',
      'Cleanroom',
      'Fire fighting system',
      'FMCS',
      'Civil, structural and architectural (CSA)',
      'Tools hookup',
    ],
    systems: ['Cleanroom', 'CSA', 'Mechanical and electrical', 'Process utilities', 'Fire fighting', 'FMCS', 'Tools hookup'],
    summary: 'Greenfield project.',
    siteType: 'Greenfield',
    source: 'IAQ company profile, page 30',
  },

  /* 5 · Battery manufacturer, Skelleftea */
  5: {
    ref: 'iaq-prj-006',
    confidence: 'verified',
    isoDetail: 'Dry room',
    scopeOfWorks: ['Cleanroom architecture works', 'Dry room architecture works'],
    systems: ['Cleanroom', 'Dry room'],
    summary: 'Europe gigafactory for lithium-ion battery. Built-up area up to 62,000 m².',
    builtUp: '62,000 m²',
    source: 'IAQ company profile, page 42',
  },

  /* 6 · Battery manufacturer, phase 1 */
  6: {
    ref: 'iaq-prj-007',
    confidence: 'verified',
    isoDetail: 'Dry room',
    /* the 8,000 m² qualifier is the profile's own, from the same reference's
       description, and is what separates this scope from the Battery manufacturer one */
    scopeOfWorks: ['Cleanroom architecture works', 'Dry room architecture works, an 8,000 m² system'],
    systems: ['Cleanroom', 'Dry room'],
    summary: '8,000 m² dry room architectural system inside a built-up area of up to 35,000 m². Greenfield project.',
    siteType: 'Greenfield',
    builtUp: '35,000 m²',
    source: 'IAQ company profile, page 43',
  },

  /* 7 · Battery manufacturer, lithium cell facility.
     The profile carries this reference as "HVOLT lithium-ion battery Co., Ltd" and
     places it in China. Class, scope and area match the registry entry exactly. */
  7: {
    ref: 'iaq-prj-008',
    confidence: 'matched',
    attribution: 'The company profile records this reference as "HVOLT lithium-ion battery Co., Ltd" and places the plant in China.',
    isoDetail: 'ISO 7 (Class 10K)',
    scopeOfWorks: ['Air-conditioning system'],
    systems: ['Air-conditioning'],
    summary: 'Built-up area up to 79,000 m².',
    builtUp: '79,000 m²',
    source: 'IAQ company profile, page 64',
  },

  /* 8 · Pharmaceutical manufacturer, Puchong */
  8: {
    ref: 'iaq-prj-009',
    confidence: 'verified',
    isoDetail: 'ISO 5, 7, 8 (Class 100, 10K and 100K)',
    scopeOfWorks: [
      'Cleanroom system',
      'Air-conditioning and mechanical ventilation system (ACMV)',
    ],
    systems: ['Cleanroom', 'ACMV'],
    summary: 'Small volume parenteral facility.',
    source: 'IAQ company profile, page 34',
  },

  /* 9 · Medical device manufacturer Healthcare */
  9: {
    ref: 'iaq-prj-010',
    confidence: 'verified',
    role: 'General contractor',
    isoDetail: 'ISO 8 (Class 100K)',
    scopeOfWorks: [
      'Civil and structural works',
      '33kV substation',
      'Mechanical, electrical and process utilities (MEP)',
    ],
    systems: ['CSA', 'Mechanical and electrical', 'Process utilities', '33kV substation'],
    summary: 'Medical device manufacturing plant, greenfield project.',
    siteType: 'Greenfield',
    source: 'IAQ company profile, page 33',
  },

  /* 10 · National University of Singapore, tissue culture laboratory */
  10: {
    ref: 'iaq-prj-011',
    confidence: 'verified',
    isoDetail: 'ISO 6 & 7 (Class 1K & 10K)',
    scopeOfWorks: [
      'Mechanical and electrical (M&E)',
      'Cleanroom construction works',
    ],
    systems: ['Cleanroom', 'Mechanical and electrical'],
    summary: 'Tissue culture laboratory cleanroom construction work package.',
    source: 'IAQ company profile, page 35',
  },

  /* 11 · District cooling operator district cooling plant */
  11: {
    ref: 'iaq-prj-012',
    confidence: 'verified',
    isoNotApplicable: true,
    scopeOfWorks: [
      'Air-conditioning and mechanical',
      'Electrical and instrumentation',
      'Fire protection',
      'Process utility',
      'Plumbing and sanitary',
      'Water treatment',
      'Civil, structural and architectural (CSA)',
    ],
    systems: ['District cooling', 'Air-conditioning and mechanical', 'Electrical and instrumentation', 'Fire protection', 'Process utilities', 'Plumbing and sanitary', 'Water treatment', 'CSA'],
    summary: 'District cooling operator district cooling plant, the largest district cooling centre in Malaysia.',
    source: 'IAQ company profile, page 38',
  },

  /* 12 · Energy technology group co-generative plant.
     The profile carries this reference as the Rapid Petronas Pengerang Co-gen Plant
     (PCP) at Pengerang, Johor. The "first co-gen plant in SEA" claim and the scope
     below are the profile's. The Energy technology group attribution is the approved concept's. */
  12: {
    ref: 'iaq-prj-013',
    confidence: 'matched',
    attribution: 'The company profile records this reference as the Rapid Petronas Pengerang Co-gen Plant (PCP) at Pengerang, Johor.',
    isoNotApplicable: true,
    scopeOfWorks: ['Mechanical erection works', 'BoP piping', 'WCCT'],
    systems: ['Mechanical erection', 'Piping'],
    summary: 'The first co-generation plant in Southeast Asia.',
    source: 'IAQ company profile, page 39',
  },

  /* 13 · District cooling operator cool energy centre.
     No entry in the company profile matches this project under any spelling. The
     profile's district cooling and heating references are GDC Putrajaya, District cooling operator KGP,
     the District cooling operator district cooling plant, Rapid MCD, Pagoh Education Hub and the Rapid
     Pengerang co-gen plant. None of them is a "cool energy centre" and the word
     "District cooling operator" does not appear in the profile at all. This project therefore ships
     with the page structure and no invented detail. */

  /* 14 · Flavour manufacturer, flavour manufacturing plant */
  14: {
    ref: 'iaq-prj-015',
    confidence: 'verified',
    isoNotApplicable: true,
    scopeOfWorks: ['MDR mechanical and electrical works', 'ACMV system'],
    systems: ['Mechanical and electrical', 'ACMV'],
    summary: 'Spray dryer and microwave tunnel renovation works.',
    source: 'IAQ company profile, page 36',
  },

  /* 15 · Flavour manufacturer, flavour manufacturing plant.
     The profile states the scope but carries no description for this reference, so
     the page has no verified brief and says so. */
  15: {
    ref: 'iaq-prj-016',
    confidence: 'verified',
    role: 'Package contractor',
    isoNotApplicable: true,
    scopeOfWorks: [
      'Civil, structural and architectural works',
      'HVAC system',
      'Electrical system',
      'Fire protection system',
      'Process utilities system',
    ],
    systems: ['CSA', 'HVAC', 'Electrical', 'Fire protection', 'Process utilities'],
    source: 'IAQ company profile, page 36',
  },

  /* 16 · Hyperscale data centre operator DTC-KUL 03 */
  16: {
    ref: 'iaq-prj-017',
    confidence: 'verified',
    role: 'Package contractor',
    isoNotApplicable: true,
    scopeOfWorks: [
      'Chilled water (CHW) piping works',
      'Condenser water (CW) piping works',
    ],
    systems: ['Chilled water piping', 'Condenser water piping'],
    summary: '9.6 MW data centre, the data centre campus phase 1.',
    source: 'IAQ company profile, page 32',
  },

  /* 17 · Solar module manufacturer, KMW building */
  17: {
    ref: 'iaq-prj-018',
    confidence: 'verified',
    role: 'Package contractor',
    isoNotApplicable: true,
    scopeOfWorks: [
      'Mechanical and electrical works for the KMW building',
      'Civil, structural and architectural (CSA) and M&E for the forming gas plant',
      'Mechanical and electrical for SCO1',
    ],
    systems: ['Mechanical and electrical', 'CSA'],
    summary: 'Solar module manufacturer KMW building in the northern corridor.',
    source: 'IAQ company profile, page 31',
  },
}

/* What ISO 14644-1 and the equivalents actually mean, per market. Standards facts,
   not IAQ claims: safe to state, and they make the class string readable to a buyer
   who does not live inside cleanroom specifications. */
export const CLASS_MEANING = {
  'semiconductor': 'ISO 14644-1 grades a cleanroom by how many airborne particles a cubic metre of its air may hold. Each step down the scale is a tenfold reduction, and the Class numbers in brackets are the older US equivalents. Wafer and backend processes sit at the tight end because the features being printed are measured in nanometres.',
  'ev-battery': 'A dry room is graded on dew point rather than on particle count. Lithium chemistry reacts with water vapour, so the air is dried far below anything a conventional cleanroom controls for, and it is held there through every shift.',
  'pharma': 'ISO 14644-1 grades a cleanroom by airborne particles per cubic metre, with the Class numbers in brackets the older US equivalents. Sterile and parenteral production runs at the tight end, and the rooms around it step down in a pressure cascade so air always moves from cleaner to less clean.',
  'data-centre': 'No cleanroom classification applies to this scope. The controlling standards are thermal and hydraulic: flow rates, approach temperatures, and pressure testing and flushing on the water side before any load is put on the plant.',
  'photovoltaic': 'Cell and module lines run under controlled particle counts only where the coating and lamination steps demand it. The balance of the plant is graded as industrial mechanical and electrical work.',
  'fnb': 'Hygienic design rather than a particle class. The controlling requirements are washdown surfaces, air change rates and hard separation between raw and finished product zones.',
  'district-cooling': 'No cleanroom classification applies to a central plant. It is measured instead on installed capacity, plant efficiency and availability across every building it serves.',
}

/* How the delivery role was structured. EPCC and EPCM wording is the client's own,
   verbatim from the approved services copy. The contractor roles are stated plainly
   because no client-written definition exists for them. */
export const DELIVERY_NOTE = {
  'EPCC with design and build': 'One accountable team from first drawing to final handover: engineering design, procurement, construction and commissioning under a single contract.',
  'EPCM': 'Engineering and procurement leadership held by IAQ while the client keeps direct control of the individual construction contracts.',
  'General contractor': 'IAQ held the main contract for the works listed above and carried them to handover.',
  'Package contractor': 'IAQ held a defined package inside a larger construction programme, delivering the works listed above to the main programme.',
}

export function detailFor(idx) { return PROJECT_DETAIL[idx] || null }
