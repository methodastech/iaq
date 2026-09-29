/* The record, in one place: the History page's timeline (components/HistorySpan.jsx).

   29 Sep 2026: the copy is IAQ's own milestone document, 1995 to 2026, entered as given ("change the copywriting").
   Each entry: the year, the title, the description (`text`) and the technical highlights (`tech`). The contract values
   and the project names in it are IAQ's own, in that document.

   Pictures: "image placeholder first". Where the document carries a photograph, the entry holds a placeholder
   (`fig.ph`) naming the picture that goes there; a placeholder becomes a photograph by giving `fig.img` (and `alt`)
   (pictures supplied for the timeline are kept in public/assets/history/, named year-subject.webp)
   and dropping `ph`. Entries the document gives no picture have none.

   `proj` links a year to its project in the registry (client, 17 Sep: "interlink our project reference in each
   year"), only where the registry holds that project: Ipoh (2009), the backend plant (2019), the Swedish gigafactory
   (2020) and the Kulim wafer fab (2025). `kind: 'achievement'` marks an award.

   The timeline before this rewrite (founding, ten milestones and the newsroom's awards and safety records, with their
   photographs and sources) is in git history. */

const ph = cap => ({ ph: true, kind: 'Photograph to come', cap })

export const SPAN = [
  {
    yr: 1995, label: '1995', key: true, title: 'IAQ Is Founded',
    text: 'IAQ begins as a cleanroom specialist in Malaysia, founded by Ir. Tiew Soon Aik with a small office and a commitment to engineering excellence.',
    tech: 'Cleanroom design and construction.',
    /* 29 Sep: the photograph it had before the rewrite, back in place of the placeholder: IAQ's own headquarters in
       Shah Alam, where it began, photographed today (HQ Offices, TianChad 4595) */
    fig: { img: '/assets/iaq/hq-front-4595.webp', kind: 'IAQ, Shah Alam', pos: '50% 55%',
           alt: 'The IAQ headquarters building in Shah Alam',
           cap: 'The Shah Alam headquarters, where it began, photographed today.' },
  },
  {
    yr: 2000, label: '2000', title: 'First Project in China',
    text: 'IAQ delivers its first project in China for a multinational client, serving the foreign chip investment wave during the dot-com boom as a bilingual contractor.',
    tech: '25,000 sqm facility; cleanroom, M&E and all utilities services.',
    /* 29 Sep: supplied as "First Project in China.png", kept as assets/history/2000-first-project-china.webp. A rendered
       aerial view, not a photograph, so it carries the representation label */
    fig: { img: '/assets/history/2000-first-project-china.webp', rep: true, kind: 'Representation', ar: '1761 / 893',
           alt: 'An aerial rendering of a cleanroom manufacturing facility with a green curved roof, set among fields',
           cap: 'The first project in China, as an illustration.' },
  },
  {
    yr: 2002, label: '2002', title: 'LCD Production Facility, China',
    text: 'IAQ designs and builds a cleanroom facility in Nanjing for LCD production.',
    tech: '7,000 sqm; Class 1K, 10K and 100K cleanrooms; M&E and process utility works.',
    fig: ph('The LCD production facility, Nanjing'),
  },
  {
    yr: 2006, label: '2006', title: 'Cleanroom Facility, Selangor',
    text: 'IAQ delivers a complete cleanroom facility for a semiconductor client, securing a RM22 million contract.',
    tech: '3,000 sqm; Class 10 to 100K cleanrooms; architectural, HVAC, electrical, BMS, fire protection, plumbing and utilities.',
    /* 29 Sep: supplied as "Cleanroom Facility, Selangor.png", kept as assets/history/2006-cleanroom-facility-selangor.webp.
       An aerial photograph. It shows the occupier's signage (a pharmaceutical company) while the text above says a
       semiconductor client; asked, the instruction was to use it as supplied */
    fig: { img: '/assets/history/2006-cleanroom-facility-selangor.webp', kind: 'Selangor', ar: '1808 / 870',
           alt: 'An aerial photograph of a cleanroom manufacturing facility in Selangor with blue roofs and a white office block',
           cap: 'The cleanroom facility, from the air.' },
  },
  {
    yr: 2007, label: '2007', title: 'Expansion into Europe: Poland',
    text: 'IAQ opens a branch office in Poland, taking its first step from Asia into Europe.',
    tech: 'EPCC (Engineering, Procurement, Construction and Commissioning) covering cleanroom architecture and M&E systems.',
  },
  {
    yr: 2008, label: '2008', title: 'Expansion in Europe: France',
    text: "A client's recommendation brings IAQ to France, where an FMEA analysis of facility bottlenecks earns the client's trust and a new project.",
    tech: 'MEP general contractor role for a cleanroom facility; FMEA-driven productivity improvements.',
  },
  {
    yr: 2009, label: '2009', title: 'Class 1 Cleanroom, Ipoh',
    text: 'IAQ completes its highest cleanroom classification to date, a turnkey wafer fab facility in Ipoh.',
    tech: 'Class 1, 1K and 10K cleanrooms; architectural and civil works, HVAC, fire protection, process utilities and electrical and instrumentation.',
    fig: ph('The wafer fab facility, Ipoh'),
    proj: { to: '/projects/4', label: 'The Ipoh plant in the registry' },
  },
  {
    yr: 2011, label: '2011', title: 'Class 10 Cleanroom Expansion for Western Digital',
    text: 'IAQ completes a phased cleanroom upgrade for Western Digital during the HDD manufacturing boom, building ultra-clean environments for data storage.',
    tech: '12,000 sqm; Class 10 and 100; ACMV, fire protection, electrical, building works, process utilities, testing and commissioning.',
  },
  {
    yr: 2013, label: '2013', title: 'Entry into Energy: KLCC District Cooling Plant',
    text: "IAQ completes Phase 0 of Malaysia's largest district cooling plant as main contractor, marking its entry into the energy industry.",
    tech: 'Demolition, civil and structural, mechanical and electrical works.',
    fig: ph('The KLCC district cooling plant'),
  },
  {
    yr: 2014, label: '2014', title: 'Electronics Manufacturing Plant, Johor',
    text: 'IAQ completes a progressive build of an electronics manufacturing plant in Johor.',
    tech: '6,000 sqm; Class 1K and 10K cleanrooms; architectural, ventilation and fire protection works.',
  },
  {
    yr: 2015, label: '2015', title: 'KLCC District Cooling Plant Completed',
    text: 'IAQ completes Phase 1 of the plant, supplying centralised chilled water to the KLCC area without interruption and backed by a 25-year maintenance contract.',
    tech: 'Zero Lost Time Injury throughout; civil and structural, mechanical and electrical works.',
  },
  {
    yr: 2016, label: '2016', title: 'Pagoh Education Hub District Cooling Plant',
    text: 'IAQ completes a district cooling plant in Johor, extending its energy track record beyond KLCC.',
    tech: 'Civil and structural, architectural and MEP works for the plant.',
    fig: ph('Pagoh Education Hub, Johor'),
  },
  {
    yr: 2017, label: '2017', title: 'Kajang Underground MRT',
    text: 'IAQ completes the mechanical and electrical package for the Kajang underground MRT, a RM45 million contract.',
    tech: 'M&E Works Package 5: construction, completion, testing, commissioning, care and maintenance.',
  },
  {
    yr: 2018, label: '2018', title: "Malaysia's National Wafer Fab",
    text: "IAQ upgrades and expands Malaysia's national wafer fab as EPCC contractor, contributing to the country's semiconductor ambitions.",
    tech: '5,000 sqm; Class 100 cleanroom; civil, structural, architectural, MEP and tool hook-up.',
    fig: ph("Malaysia's national wafer fab"),
  },
  {
    yr: 2019, label: '2019', title: 'Semiconductor Backend Facility',
    text: 'IAQ completes a large test and assembly facility for a semiconductor client under an EPCM contract.',
    tech: '43,000 sqm facility; Class 10K to 100K cleanrooms; EPCM (GMP contract model) covering architectural, cleanroom, ACMV, process utilities and carpark.',
    proj: { to: '/projects/2', label: 'The backend plant in the registry' },
  },
  {
    yr: 2020, label: '2020', title: 'Entry into the EV Battery Industry: Sweden',
    text: 'IAQ is awarded works for a Gigafactory in Sweden, opening the EV battery market and aligning with the global push for clean energy.',
    tech: 'Architectural, structural and dry room systems for battery cell manufacturing.',
    proj: { to: '/projects/6', label: 'The gigafactory in the registry' },
  },
  {
    yr: 2021, label: '2021', title: 'KVMRT2 Construction Management',
    text: 'IAQ completes construction management services for the KVMRT2 rail project in Selangor.',
    tech: 'Construction management covering civil, structural, architectural and MEP works.',
  },
  {
    yr: 2022, label: '2022', title: 'Singapore Expansion and Green Building Index Facility',
    text: 'IAQ expands its operations in Singapore in preparation for upcoming projects. The same year, IAQ delivers a RM215 million GBI-certified plant as EPCC main contractor, building through COVID-19 restrictions.',
    tech: 'GBI plant: 5,000 sqm; Class 1K to 10K cleanrooms; 25,000 sqm facility; civil, MEP, cleanroom and tool hook-up.',
    fig: ph('The GBI-certified plant'),
  },
  {
    yr: 2023, label: '2023', title: 'Entry into Data Centres',
    text: 'IAQ completes its first data centre project for a hyperscale client, delivering the HVAC wet system as a PCC contractor.',
    tech: '9.6 MW Phase 1; HVAC wet (chilled water) system; 60,000 sqm facility; LOD 350 BIM.',
    /* 29 Sep: a photograph of the chilled water pipework is to come (shown pasted, not yet supplied as a file) */
    fig: ph('The chilled water pipework, data centre'),
  },
  {
    yr: 2024, label: '2024', kind: 'achievement', title: 'MCIEA Builder of the year 2024',
    text: 'CIDB awards IAQ the MCIEA Builder of the year in the G7 category, recognising its excellence in construction.',
    /* 29 Sep: the photograph asked for is IAQ's own newsroom picture of the night, already on the site (its source is
       listed in assets/newsroom/SOURCES.md) */
    fig: { img: '/assets/newsroom/mciea-2024-awards-night-team.webp', kind: 'MCIEA 2024', ar: '1600 / 1000',
           alt: 'The IAQ team standing in front of the MCIEA 2024 backdrop at the awards night',
           cap: 'The IAQ team at the MCIEA 2024 awards night.' },
  },
  {
    yr: 2024, label: '2024', title: 'Advanced Packaging Cleanroom, Penang',
    text: 'IAQ delivers a design and build advanced packaging cleanroom in Penang as General Contractor.',
    tech: '75,000 sqm; Class 1 to 1000; ultra-pure water, wastewater treatment, chemical and gas systems; LOD 500 BIM.',
  },
  {
    yr: 2025, label: '2025', title: 'Wafer Fab Mega Project, Kulim',
    text: 'IAQ completes the RM900 million wafer fab expansion in Kulim, Kedah, the largest project in its history. IAQ also establishes its presence in Germany.',
    tech: '35,000 sqm; Class 10 to 10K cleanrooms; 65,000 sqm facility; mechanical and cleanroom general contractor for WP06; LOD 500 BIM.',
    proj: { to: '/projects/1', label: 'The wafer fab in the registry' },
  },
  {
    yr: 2026, label: '2026', title: "India's First Wafer Fab",
    text: "IAQ begins turnkey design and build works for India's first wafer fab, alongside new entities in Ireland and the United States.",
    tech: '40,000 sqm; Class 10 to 10K cleanrooms; design, supply, installation, testing and commissioning; LOD 500 as-built BIM.',
    fig: ph("India's first wafer fab, the model"),
  },
]
