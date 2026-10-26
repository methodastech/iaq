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

/* 19 Oct (IAQ feedback, History of IAQ: "Use milestone-led wording with a clear year and event", "Hide
   unpublished/sensitive details until approved"): the milestone text stays IAQ's amendment, word for word. What went:
   the four project links (they tied a year to a named project, i.e. when it was won) and every caption, alt and tag
   that named a project, client or place the amendment does not (China, Nanjing, France, Ipoh, Pagoh, Tun Razak
   Exchange, Selangor). Pictures stay as illustrations until IAQ approves naming them. */

/* 21 Oct (IAQ: confidentiality of the pictures; Bazil: "generate related image", "also these two"): 2014 (the lithography
   bay with its KELUAR sign), 2015 (the district cooling drawing) and 2026 (the BIM model of a client's facility) are now
   generic pictures generated in ChatGPT for each milestone, invented, with no client, facility, sign or name in them:
   an industrial manufacturing hall, a central utility plant, an advanced manufacturing campus. The files they replaced
   stay in public/assets. */

const ph = cap => ({ ph: true, kind: 'Photograph to come', cap })

export const SPAN = [
  /* 17 Oct ("client give the amendment on history. follow that pdf", 2026.10.16_IAQ history Amendment.pdf): every
     milestone's header and description are IAQ's amendment, as given (spelling slips only corrected); the document has
     no technical highlights, so `tech` is gone; 2007 (Poland) is not in it and the 2024 cleanroom entry gave way to the
     one 2024 milestone, Recognition for Project Excellence, which keeps the awards-night photograph */
  {
    yr: 1995, label: '1995', key: true, title: "Foundation of IAQ",
    text: "IAQ was established in Malaysia with a focus on engineering-led solutions for controlled environments and technology-driven industries, laying the foundation for a commitment to quality, reliability and technical excellence.",
    /* 29 Sep: the photograph it had before the rewrite, back in place of the placeholder: IAQ's own headquarters in
       Shah Alam, where it began, photographed today (HQ Offices, TianChad 4595) */
    fig: { img: '/assets/iaq/hq-front-4595.webp', kind: 'IAQ, Shah Alam', pos: '50% 55%',
           alt: 'The IAQ headquarters building in Shah Alam',
           cap: 'The IAQ headquarters, Shah Alam.' },
  },
  {
    yr: 2000, label: '2000', title: "Regional Expansion",
    text: "IAQ expanded beyond Malaysia, delivering large-scale industrial facilities and strengthening its capabilities in cleanroom, utility and infrastructure solutions for advanced manufacturing environments.",
    /* 29 Sep: supplied as "First Project in China.png", kept as assets/history/2000-first-project-china.webp. A rendered
       aerial view, not a photograph, so it carries the representation label */
    fig: { img: '/assets/history/2000-first-project-china.webp', rep: true, kind: 'Representation', ar: '1761 / 893',
           alt: 'An aerial rendering of a cleanroom manufacturing facility with a green curved roof, set among fields',
           cap: 'Shown for illustration.' },
  },
  {
    yr: 2002, label: '2002', title: "Advancing Technical Expertise",
    text: "As demand for higher-performance facilities grew, IAQ broadened its engineering capabilities to support specialised manufacturing environments requiring stringent environmental control and utility integration.",
    /* 29 Sep: supplied as "ChatGPT Image Sep 29, 2026, 01_59_51 PM.png", kept as
       assets/history/2002-lcd-facility-nanjing.webp. Generated, so it carries the representation label */
    fig: { img: '/assets/history/2002-lcd-facility-nanjing.webp', rep: true, kind: 'Representation', ar: '1546 / 1017',
           alt: 'A multi-storey white factory building with blue windows behind a gatehouse and a vehicle barrier',
           cap: 'Shown for illustration.' },
  },
  {
    yr: 2006, label: '2006', title: "Integrated Facility Delivery",
    text: "IAQ strengthened its multidisciplinary approach by delivering complete facility solutions encompassing architecture, mechanical and electrical systems, process utilities and building infrastructure.",
    /* 29 Sep: supplied as "Cleanroom Facility, Selangor.png", kept as assets/history/2006-cleanroom-facility-selangor.webp.
       An aerial photograph. It shows the occupier's signage (a pharmaceutical company) while the text above says a
       semiconductor client; asked, the instruction was to use it as supplied */
    /* 1 Oct ("replace"): supplied as "Texas Instruments industrial building exterior.png", kept as
       assets/history/2006-texas-instruments-building.webp: the semiconductor plant from the street, its own name on the
       facade. Used as supplied, as the photograph before it was; the earlier file stays in the folder */
    /* 22 Oct (Bazil: "please remove the signage"): the occupier's name is painted out of the facade, same photograph */
    fig: { img: '/assets/history/2006-semiconductor-plant.webp', kind: 'Photograph', ar: '1600 / 983',
           alt: 'A white semiconductor plant building under a blue sky, with a covered walkway in front',
           cap: 'A semiconductor plant, shown for illustration.' },
  },
  {
    yr: 2008, label: '2008', title: "Building International Experience in Europe",
    text: "IAQ continued to develop its presence in international markets while enhancing expertise in facility optimisation, engineering analysis and operational performance improvement.",
    /* 29 Sep: supplied as "ChatGPT Image Sep 29, 2026, 02_10_21 PM.png", kept as assets/history/2008-cleanroom-france.webp.
       Generated, so it carries the representation label. It shows a client's name on the facade, used as supplied */
    /* 22 Oct (Bazil: "please remove the signage"): the occupier's name is painted out of the facade, same photograph */
    fig: { img: '/assets/history/2008-semiconductor-facility.webp', rep: true, kind: 'Representation', ar: '1566 / 1005',
           alt: 'A curved-roof white semiconductor facility with blue glazing behind planting',
           cap: 'Shown for illustration.' },
  },
  {
    yr: 2009, label: '2009', title: "Supporting Semiconductor Manufacturing",
    text: "IAQ further strengthened its cleanroom and process facility expertise through project requiring highly controlled manufacturing environment and integrated utility systems.",
    /* 29 Sep: supplied as "ChatGPT Image Sep 29, 2026, 02_15_34 PM.png" (it replaced 02_10_21), kept as assets/history/2009-wafer-fab-ipoh.webp.
       Generated, so it carries the representation label. It shows a client's name on the facade, used as supplied */
    /* 22 Oct (Bazil: "please remove the signage"): the occupier's name is painted out of the facade, same photograph */
    /* 27 Oct (client: "can we remove the electric pole in front of the building?"): the poles, the street lamps and the
       overhead wires are taken out of the photograph; the original stays beside it */
    /* 26 Oct: the -clear version showed smudges on the roofline and louvres where the poles were; redone in ChatGPT from the
       original photo, all lines straight, kept as 2009-wafer-fab-building-v3.webp */
    fig: { img: '/assets/history/2009-wafer-fab-building-v3.webp', rep: true, kind: 'Representation', ar: '1727 / 911',
           alt: 'A white two-storey wafer fab building with blue roofs behind a green fence and palms',
           cap: 'Shown for illustration.' },
  },
  {
    yr: 2011, label: '2011', title: "Growth in Electronics Manufacturing",
    text: "As global demand for advanced electronics accelerated, IAQ supported facility expansions and manufacturing infrastructure developments requiring high-precision engineering execution.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/iaq/cr-ballroom-8575.webp', kind: 'IAQ cleanroom', ar: '16 / 10',
           alt: 'An empty finished cleanroom ballroom under rows of ceiling lights',
           cap: 'A finished cleanroom ballroom built by IAQ, shown for illustration.' },
  },
  {
    yr: 2013, label: '2013', title: "Diversification into Energy Infrastructure",
    text: "IAQ expanded into energy and utility infrastructure projects, applying its engineering expertise to large-scale developments supporting long-term operational reliability.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    /* 1 Oct ("replcae"): a row of primary chilled water pumps (PCHWP) under their insulated risers, in place of the market
       band's chiller hall (band-district-cooling.jpg stays the Markets page's own). Saved as assets/history/2013-dcs-pump-row.webp; not shown
       to be KLCC itself, so it keeps the Representation label; the motor's labels are illegible, no maker's name. */
    /* 22 Oct (Bazil: "make this image proper and clean"): background person, floor puddles and rust stains removed;
       saved as 2013-dcs-pump-row-clean.webp. */
    fig: { img: '/assets/history/2013-dcs-pump-row-clean.webp', rep: true, kind: 'Representation', ar: '1453 / 1083',
           alt: 'A row of chilled water pumps under insulated pipe risers in a district cooling plant',
           cap: 'The primary chilled water pumps of a district cooling plant, as an illustration.' },
  },
  {
    yr: 2014, label: '2014', title: "Expanding Industrial Capabilities",
    text: "The company continued to support a broader range of industrial and manufacturing projects, reinforcing its role as a multidisciplinary engineering and construction partner.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/history/2014-industrial-hall.webp', rep: true, kind: 'Illustration', ar: '16 / 9',
           alt: 'A large industrial manufacturing hall with overhead services and two engineers reviewing a tablet on the walkway',
           cap: 'An industrial manufacturing hall, shown for illustration.' },
  },
  {
    yr: 2015, label: '2015', title: "Delivering Critical Infrastructure",
    text: "IAQ completed major utility infrastructure developments while strengthening long-term maintenance and operational support capabilities across complex facilities.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/history/2015-central-utility-plant.webp', rep: true, kind: 'Illustration', ar: '16 / 9',
           alt: 'A central utility plant with cooling towers, pipe racks and a storage tank, an engineer inspecting it',
           cap: 'A central utility plant, shown for illustration.' },
  },
  {
    yr: 2016, label: '2016', title: "Strengthening Energy Solutions",
    text: "Building on its growing experience in utility infrastructure, IAQ expanded its involvement in sustainable energy and district cooling developments.",
    /* 29 Sep: supplied as "ChatGPT Image Sep 29, 2026, 02_03_30 PM.png", kept as
       assets/history/2016-pagoh-district-cooling.webp. Generated, so it carries the representation label */
    fig: { img: '/assets/history/2016-pagoh-district-cooling.webp', rep: true, kind: 'Representation', ar: '1617 / 973',
           alt: 'An aerial view of a campus of blue and white buildings around a roundabout drive',
           cap: 'Shown for illustration.' },
  },
  {
    yr: 2017, label: '2017', title: "Infrastructure and Transportation Projects",
    text: "IAQ broadened its project portfolio through participation in large-scale public infrastructure developments, further enhancing its multidisciplinary project delivery expertise.",
    /* 29 Sep: supplied as "Entrance_B_of_Tun_Razak_Exchange_MRT_station.jpg" (a 2017 phone photograph), kept as
       assets/history/2017-mrt-tun-razak-exchange.webp. The file name is Wikimedia Commons' style: if it came from there,
       its licence will ask for the photographer's credit in the caption. TO CONFIRM before launch */
    fig: { img: '/assets/history/2017-mrt-tun-razak-exchange.webp', kind: 'Photograph', ar: '4160 / 2336',
           alt: 'A rail station entrance, a white canopy and a dark louvred block beyond a lawn',
           cap: 'Public infrastructure, shown for illustration.' },
  },
  {
    yr: 2018, label: '2018', title: "Supporting Semiconductor Growth",
    text: "As semiconductor investment accelerated across the region, IAQ continued strengthening its capabilities in wafer fabrication and advanced manufacturing facilities.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/iaq/cr-utilities-p1010244.webp', kind: 'IAQ cleanroom', ar: '16 / 10',
           alt: 'Process utility lines running above a cleanroom bay',
           cap: 'Utilities above a cleanroom bay built by IAQ, shown for illustration.' },
  },
  {
    yr: 2019, label: '2019', title: "Scaling Project Delivery",
    text: "The successful delivery of large-scale industrial facilities demonstrated IAQ's growing capability in managing complex project through integrated engineering and construction delivery models.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/projects/prj-003.webp', kind: 'Photograph', ar: '16 / 10',
           alt: 'A semiconductor backend plant from the air',
           cap: 'A semiconductor plant from the air, shown for illustration.' },
  },
  {
    yr: 2020, label: '2020', title: "Entry into EV Battery Manufacturing",
    text: "IAQ entered the rapidly expanding EV battery sector, extending its expertise into specialised manufacturing facilities supporting the global energy transition.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    /* 1 Oct ("replace the image"): an aerial rendering of a battery gigafactory, solar on its roofs, in the forest, in place
       of the registry's dusk photograph (prj-007.webp stays the registry's own). Saved as assets/history/2020-ev-gigafactory-aerial.webp,
       labelled a rendering, framed at its own ratio. Its two facade signs are the renderer's own invented marks, no
       legible name. */
    fig: { img: '/assets/history/2020-ev-gigafactory-aerial.webp', kind: 'Rendering', ar: '1639 / 960',
           alt: 'An aerial rendering of a battery gigafactory with solar panels on its roofs, set in forest',
           cap: 'A battery gigafactory from the air, shown for illustration.' },
  },
  {
    yr: 2021, label: '2021', title: "Enhancing Construction Management Services",
    text: "The company further developed its construction management capabilities, supporting complex developments through effective coordination, planning and execution.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/iaq/site-aerial-build.webp', kind: 'IAQ site', ar: '16 / 10',
           alt: 'An IAQ construction site from the air',
           cap: 'A construction site run by IAQ, shown for illustration.' },
  },
  {
    yr: 2022, label: '2022', title: "Continued Regional Growth",
    text: "IAQ strengthened its regional presence while delivering large-scale industrial developments that showcased resilience, adaptability and engineering excellence.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    fig: { img: '/assets/iaq/plant-dusk-01.webp', kind: 'IAQ plant', ar: '16 / 9',
           alt: 'A manufacturing plant lit at dusk beside a river',
           cap: 'A plant built by IAQ, shown for illustration.' },
  },
  {
    yr: 2023, label: '2023', title: "Expansion into Data Centres",
    text: "Responding to the rapid growth of digital infrastructure, IAQ expanded into data centre developments, supporting mission-critical facilities that demand reliability and operational continuity.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    /* 1 Oct ("rename and replace"): a chilled water plant room, the HVAC wet system this milestone delivered, in place of
       the campus rendering (prj-017.webp stays the registry's own). Saved as assets/history/2023-dc-chilled-water-plant.webp; a restored
       photograph, so it keeps the Representation label; no company marks on it. Framed at its own ratio. */
    fig: { img: '/assets/history/2023-dc-chilled-water-plant.webp', rep: true, kind: 'Representation', ar: '1673 / 940',
           alt: 'A chilled water plant room: insulated pipework, pumps and valves',
           cap: 'A chilled water plant room, the HVAC wet system, as an illustration.' },
  },
  {
    yr: 2024, label: '2024', kind: 'achievement', title: "Recognition for Project Excellence",
    text: "Industry recognition reinforced IAQ's commitment to quality, safety and project delivery excellence while continuing to support increasingly sophisticated manufacturing facilities.",
    /* 29 Sep: the photograph asked for is IAQ's own newsroom picture of the night, already on the site (its source is
       listed in assets/newsroom/SOURCES.md) */
    fig: { img: '/assets/newsroom/mciea-2024-awards-night-team.webp', kind: 'MCIEA 2024', ar: '1600 / 1000',
           alt: 'The IAQ team standing in front of the MCIEA 2024 backdrop at the awards night',
           cap: 'The IAQ team at the MCIEA 2024 awards night.' },
  },
  {
    yr: 2025, label: '2025', title: "Strengthening Global Presence",
    text: "IAQ expanded its international footprint and continued delivering highly complex semiconductor and advanced technology facilities across multiple regions.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    /* 1 Oct ("replace"): an aerial rendering of the wafer fab complex in place of the registry's street photograph
       (prj-002.webp stays the registry's own). Saved as assets/history/2025-fab-aerial-render.webp, labelled a rendering, framed at its own
       ratio, uncropped; no company marks on it. */
    fig: { img: '/assets/history/2025-fab-aerial-render.webp', kind: 'Rendering', ar: '1836 / 856',
           alt: 'An aerial rendering of a wafer fab complex, with its offices, car park and utility buildings',
           cap: 'A wafer fab complex from the air, shown for illustration.' },
  },
  {
    yr: 2026, label: '2026', title: "Supporting the Next Generation of Industry",
    text: "Today, IAQ continues to support advanced manufacturing and critical infrastructure developments worldwide, helping clients transform ambitious visions into operationally successful facilities.",
    /* 29 Sep ("filled in the images. use suitable image"): the site's own */
    /* 1 Oct ("replace the image and rename"): the whole facility in BIM, the cleanroom block with its rooftop systems, in
       place of the process pipe rack. Saved as assets/history/2026-bim-facility-rooftop.webp; the client's mark on the facade is painted out
       with the wall's own panels (other companies' marks stay off IAQ's pages). Framed at its own ratio, uncropped. */
    /* 21 Oct, later (Bazil: "looks like ai generated"): the sunset campus gave way to a plain overcast drone view */
    fig: { img: '/assets/history/2026-advanced-plant.webp', rep: true, kind: 'Illustration', ar: '16 / 9',
           alt: 'A modern manufacturing plant in an industrial park from a low drone height, with its utility yard, pipe rack and car park',
           cap: 'An advanced manufacturing plant, shown for illustration.' },
  },
]
