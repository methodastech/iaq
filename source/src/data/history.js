/* The record, in one place.

   This merges the two datasets the History page used to carry separately: the ten narrative
   milestones (_source/about.html) and the per-milestone specification metadata that only the
   scene timeline had. Every `meta` value below is drawn from the milestone's own published
   copy; nothing is inferred and no figure is invented. The four contract values that appear
   in the source timeline remain withheld, as they are uncorroborated.

   15 Sep: two additions, both requested by the client.

   1. FIGURES. Every entry carries a `fig`: a photograph or a short muted clip with a poster,
      or, for the undated credentials, the certification badges themselves.
      The honesty rule, broken twice before on this project: a figure shows what its
      milestone says, or it is labelled a representation. Each `fig` below records what
      the file actually shows (looked at, not assumed), and `rep: true` marks the ones
      that stand in for a project with no photograph on file. Registry numbers are
      the project registry's own (src/data/projects.js, index N is prj-00N+1).

   2. ACHIEVEMENTS. Entries with `kind: 'achievement'` are awards, recognitions, safety
      records and certifications. Undated items are never placed on a year they do not
      belong to: the ISO and CIDB credentials have no certification year on record, so
      they sit against Today as "held", not on a date.

   15 Sep, second pass: IAQ's own newsroom.

   The achievements now carry IAQ's own newsroom photographs (iaqtechnology.com.my),
   converted into public/assets/newsroom/ with every source listed in SOURCES.md there.
   Each dated achievement takes only the date and wording of its newsroom post; `Newsroom`
   in the meta is the date IAQ published the post, not a claimed event date.

   Two findings from comparing the build's files against the newsroom originals pixel
   for pixel, both corrected here:
     a. photo-opening.webp, previously captioned as the Penang branch opening, is the
        photograph from the IMS internal audit post of 8 May 2025 (Opening.png). It now
        sits on that entry, and Penang takes the actual Grand Opening Ceremony photograph.
     b. The 2.6 million safe manhours were previously said to be recognised by DOSH
        Kuching in July 2025. The 2.6 million post is dated 28 February 2025; the DOSH
        post of 3 July 2025 names no figure and the banner in its photograph reads
        2.74 million. They are two entries now.
   photo-awards.webp is the same frame as the photograph IAQ published with its Star
   feature post; the Star entry uses the newsroom original. */

export const SPAN = [
  {
    yr: 1995, label: '1995', key: true, title: 'Founded on air',
    text: 'Ir. Tiew Soon Aik establishes IAQ in Malaysia as a cleanroom specialist: a small office, a blueprint and an unrelenting spirit.',
    meta: [{ k: 'Founder', v: 'Ir. Tiew Soon Aik' }, { k: 'Base', v: 'Malaysia' }, { k: 'Focus', v: 'Cleanrooms' }],
    /* ph-blueprint.webp shows an architectural floor plan under a set square, a rule, a
       protractor and a pen. It is stock, not IAQ's, and no photograph of the 1995 office
       exists on file, so it stands as a labelled representation of "a blueprint". The
       newsroom holds no photograph of the founding either. */
    /* 25 Sep (Bazil: "where are the visuals"): IAQ's own headquarters in Shah Alam, where it began, photographed today (HQ Offices, TianChad 4595) */
    fig: { img: '/assets/iaq/hq-front-4595.webp', kind: 'IAQ, Shah Alam', pos: '50% 55%',
           alt: 'The IAQ headquarters building in Shah Alam',
           cap: 'The Shah Alam headquarters, where it began, photographed today.' },
  },
  {
    yr: 2000, label: '2000', title: 'First build abroad',
    text: "25,000 m² of cleanroom, M&E and utilities delivered in China for the dot-com boom's chipmakers: the first project beyond Malaysia, with more across China to follow.",
    meta: [{ k: 'Scale', v: '25,000 m²' }, { k: 'Location', v: 'China' }, { k: 'Scope', v: 'Cleanroom, M&E, utilities' }],
    /* about-story-build.mp4 (5 s, 4:3) shows crews in coveralls on a scaffold fitting
       ceiling units into a cleanroom under construction, a red band on the wall panels.
       about-story-broll.webp is the same scene and serves as the poster. Neither is the
       China project, so both are labelled a representation of a cleanroom fit-out. The
       newsroom's only cleanroom interior (navigating-iaqs-evolution, Jan 2024: a finished
       cleanroom with a perforated raised floor and an IAQ watermark) names no project or
       year, so it cannot stand for China 2000 either. */
    /* 25 Sep (Bazil: "where are the visuals"): a cleanroom fit-out by IAQ, its own photograph (Cleanroom Photos, Dec 2024); the China project itself has no photograph on file */
    fig: { img: '/assets/iaq/cr-build-2024.webp', kind: 'IAQ cleanroom fit-out', pos: '50% 50%',
           alt: 'A cleanroom under construction by IAQ, wall panels and ceiling grid going in',
           cap: 'A cleanroom fit-out by IAQ.' },
  },
  {
    yr: 2007, label: '2007', title: 'Into Europe',
    text: "A branch office opens in Poland for engineering, procurement, construction and commissioning; a project in France follows on a client's recommendation.",
    meta: [{ k: 'Location', v: 'Poland' }, { k: 'Scope', v: 'EPCC' }, { k: 'Then', v: 'France' }],
    /* tl-2007-europe.webp shows four people walking a wet cobbled street past glass office
       blocks at dusk, a lit lobby ahead. A European office district, not the Poland branch.
       The newsroom's France office photograph (Feb 2024) is the Ormoy office years later,
       not the 2007 branch or the France project, so the representation stands. */
    /* 25 Sep (Bazil: "where are the visuals"): IAQ's own office at Ormoy, France, from the newsroom (2024) */
    fig: { img: '/assets/newsroom/ormoy-france-office-visit.webp', kind: 'IAQ newsroom', pos: '50% 45%',
           alt: 'IAQ staff at the Ormoy office in France',
           cap: 'The Ormoy office in France, photographed in 2024.' },
  },
  {
    yr: 2009, label: '2009', title: 'Class 1, delivered',
    /* 17 Sep (client: "interlink our project reference in each year") */
    proj: { to: '/projects/4', label: 'The Ipoh plant in the registry' },
    text: 'A 14,000 m² Class 1 cleanroom is built in Ipoh, among the cleanest rooms in the region, as the group extends its reach to Morocco.',
    meta: [{ k: 'Scale', v: '14,000 m²' }, { k: 'Class', v: 'Class 1' }, { k: 'Location', v: 'Ipoh, Malaysia' }],
    /* prj-005.webp is the registry's photograph of the Ipoh silicon wafer plant: a two
       storey white block with the client's sign on the forecourt, palms, a blue roofed
       plant behind. 706 x 390, scanned with a light border. It is the actual project
       (registry: silicon wafer manufacturing, multi-class greenfield, Ipoh, ISO 3 to 7)
       and it carries a client wordmark, flagged in the handover. */
    fig: { img: '/assets/projects/prj-005.webp', kind: 'Registry 005', pos: '50% 60%',
           alt: 'The silicon wafer plant in Ipoh, seen from the road',
           cap: 'Silicon wafer manufacturing, multi-class greenfield with full MEP, Ipoh, Perak.' },
  },
  {
    yr: 2013, label: '2013', key: true, title: 'The energy pivot',
    text: "Main contractor for Malaysia's largest district cooling plant: a system serving 56,000 parties, delivered with zero lost-time injury and a 25 year maintenance mandate.",
    meta: [{ k: 'Serves', v: '56,000 parties' }, { k: 'Safety', v: 'Zero lost-time injury' }, { k: 'Mandate', v: '25 years' }],
    /* The registry's own photograph of this plant (prj-012) is quarantined and replaced by
       a neutral frame, so nothing on file shows it. mkt-district-cooling.mp4 (5 s, portrait)
       is the market clip already on the homepage: white insulated pipework and a row of
       heat exchangers under an open sky, a red and white stack behind. The landscape still
       services/District-cooling-Heating-1.png is the same scene and serves as the poster.
       Shown 3:2 with the frame held on the exchangers. A labelled representation. */
    /* 25 Sep (Bazil: "where are the visuals"): the ACMV system from IAQ's own Revit coordination model, the energy work drawn */
    /* 25 Sep, night (Bazil: "any better visual for this?"): the ACMV extract showed ductwork, not a district cooling
       plant; nothing on file photographs the plant (the registry's own picture is quarantined). An illustration of how
       a district cooling system works, made in Higgsfield in the house isometric style and labelled as one */
    fig: { img: '/assets/iaq/dcs-illustration.webp', kind: 'Illustration', ar: '160 / 73', pos: '50% 50%',
           alt: 'Illustration of a district cooling system: a central plant with cooling towers and a storage tank pipes chilled water to offices, a hospital, a university and a mall',
           cap: 'How a district cooling system works: one central plant and its storage tank pipe chilled water to every building it serves.' },
  },
  {
    yr: 2015, label: '2015', title: 'Semiconductor scale',
    proj: { to: '/projects/2', label: 'The backend plant in the registry' },
    text: 'A 43,000 m² backend facility marks a new order of scale; Class 100 cleanroom works for the national wafer fab initiative follow a year later.',
    meta: [{ k: 'Scale', v: '43,000 m²' }, { k: 'Class', v: 'Class 100' }, { k: 'Sector', v: 'Semiconductor' }],
    /* prj-003.webp is an aerial photograph of a large flat roofed plant beside a river:
       production halls, a glazed office block, car parks. The registry's 43,000 m² backend
       plant, so the actual project. */
    fig: { img: '/assets/projects/prj-003.webp', kind: 'Registry 003',
           alt: 'Aerial view of the 43,000 m² semiconductor backend plant beside a river',
           cap: 'Semiconductor backend plant, 43,000 m² test, probe and assembly, Malaysia.' },
  },
  {
    yr: 2020, label: '2020', key: true, title: 'The EV era',
    proj: { to: '/projects/6', label: 'The gigafab in the registry' },
    text: 'Dry rooms and architectural works for a Swedish gigafactory carry IAQ into EV batteries; a green-certified plant lands ahead of schedule through the pandemic.',
    meta: [{ k: 'Location', v: 'Sweden' }, { k: 'Scope', v: 'Dry rooms, architectural' }, { k: 'Sector', v: 'EV battery' }],
    /* prj-007.webp is an aerial photograph at sunset of a tall plant with a black and white
       chequered facade and an external stair tower, construction still under way. The
       registry lists it as the EV battery gigafab phase 1 dry room system in Europe; the
       registry does not name the country, so the caption does not either. prj-006, the
       62,000 m² gigafactory dry room, is the closer name match but reads as an
       architectural rendering, so the photograph is used. */
    fig: { img: '/assets/projects/prj-007.webp', kind: 'Registry 007',
           alt: 'The EV battery gigafab at sunset, its chequered facade still under construction',
           cap: 'EV battery gigafab phase 1, 8,000 m² dry room system, Europe.' },
  },
  {
    yr: 2022, label: '2022', title: 'Mega projects',
    proj: { to: '/projects/1', label: 'The wafer fab in the registry' },
    text: 'A wafer fab expansion in the northern corridor, entry into data centres, and a full design and build fab expansion in Kuching the following year.',
    meta: [{ k: 'Region', v: 'Northern corridor' }, { k: 'New', v: 'Data centres' }, { k: 'Model', v: 'Design and build' }],
    /* prj-002.webp is a photograph of the wafer foundry in Kedah: a long white fab with a
       red plant room on the roof, palms along the frontage, the client's name on the wall.
       The registry's northern corridor wafer fab, so the actual project. Carries a client
       wordmark, flagged in the handover. */
    fig: { img: '/assets/projects/prj-002.webp', kind: 'Registry 002', pos: '50% 45%',
           alt: 'The wafer fab in the northern corridor, palms along its frontage',
           cap: 'Wafer fab facility and expansion, cleanroom package with utilities, the northern corridor, Kedah.' },
  },
  {
    /* Newsroom post of 24 Oct 2024, "IAQ Honoured with Gold Award for OSH Management at
       the 20th OSH Excellence Awards 2024". Category and organiser are the post's words.
       The Highwire Safety Gold 2024 badge is dated 2024 on its face and is carried by this
       build's records beside this award (pages/History.jsx RECORDS), so it sits here, on
       its own year, and not against Today with the undated credentials. */
    yr: 2024, label: '2024', kind: 'achievement', title: 'Gold for OSH Management',
    text: "The Gold Award for Occupational Safety and Health Management at the 20th OSH Excellence Awards 2024, in the Engineering, Procurement, Construction and Maintenance Services category. The awards are organised by the Malaysian Occupational Safety and Health Practitioners' Association. The same year brings the Highwire Safety Award at Gold level.",
    meta: [{ k: 'Award', v: 'Gold, OSH Management' }, { k: 'Organiser', v: 'MOSHPA' }, { k: 'Also', v: 'Highwire Safety, Gold 2024' }, { k: 'Newsroom', v: '24 October 2024' }],
    /* newsroom/osh-excellence-awards-2024-gold.webp (from the post's own image): an award
       stage. The screen reads MOSHPA OSH Excellence Award 2024, Gold, IAQ Solutions Sdn.
       Bhd., with the IAQ logo top right. Six men on stage, a trophy and a framed
       certificate being presented; a stage light and speakers in the foreground. The
       award itself, so a real photograph. Nearly square, shown 4:3. */
    fig: { img: '/assets/newsroom/osh-excellence-awards-2024-gold.webp', kind: 'IAQ newsroom', ar: '4 / 3', pos: '50% 46%',
           alt: 'IAQ receiving the MOSHPA OSH Excellence Award 2024 Gold on stage',
           cap: 'On stage at the 20th OSH Excellence Awards. The screen reads MOSHPA OSH Excellence Award 2024, Gold, IAQ Solutions Sdn. Bhd.' },
    badges: [{ src: '/assets/badge-highwire-gold-2024.webp', alt: 'Highwire Safety Gold 2024' }],
  },
  {
    /* Newsroom posts of 19 and 25 Nov 2024. The G7 category is from IAQ's own Award and
       Recognition page ("MCIEA 2024 Award, Builder of the year category G7", Nov 24). The
       judging criteria are this build's existing record (pages/History.jsx RECORDS). */
    yr: 2024, label: '2024', kind: 'achievement', title: 'Builder of the Year',
    text: 'Named Builder of the Year at the Malaysian Construction Industry Excellence Awards 2024 by CIDB Malaysia, judged on company performance, project management, technical expertise, innovation, quality, safety and sustainability.',
    meta: [{ k: 'Award', v: 'Builder of the Year, MCIEA 2024' }, { k: 'Category', v: 'G7' }, { k: 'By', v: 'CIDB Malaysia' }, { k: 'Newsroom', v: '19 November 2024' }],
    /* newsroom/mciea-2024-builder-of-the-year-stage.webp (image from the 19 Nov post): the
       MCIEA 2024 stage. The screen reads The Malaysian Construction Industry Excellence
       Awards 2024, Builder of the Year, IAQ Solutions Sdn Bhd. Six men in dark suits; the
       fourth from left holds the certificate and the trophy. It replaces photo-awards.webp,
       a group photograph at the backdrop, because this frame shows the award being given
       with the company named on screen. The post does not name the people, so neither
       does the caption. */
    fig: { img: '/assets/newsroom/mciea-2024-builder-of-the-year-stage.webp', kind: 'IAQ newsroom', ar: '4 / 3',
           alt: 'The Builder of the Year award presented to IAQ on the MCIEA 2024 stage',
           cap: 'On the MCIEA 2024 stage. The screen reads Builder of the Year, IAQ Solutions Sdn Bhd.' },
  },
  {
    /* Newsroom post of 24 Dec 2024, "IAQ Featured in The Star: A National Spotlight on
       Excellence in Hi-Tech Facility Construction". The wording is the post's. */
    yr: 2024, label: '2024', kind: 'achievement', title: 'Featured in The Star',
    text: 'A national spotlight in The Star following the Builder of the Year recognition, on the hi-tech facilities IAQ builds: cleanrooms, wafer fabrication plants and data centres.',
    meta: [{ k: 'Publication', v: 'The Star' }, { k: 'Following', v: 'Builder of the Year, MCIEA 2024' }, { k: 'Newsroom', v: '24 December 2024' }],
    /* newsroom/mciea-2024-awards-night-team.webp (the post's own image): eleven people in
       formal wear on a blue striped carpet in front of the MCIEA 2024 awards night backdrop,
       the CIDB Malaysia mark at its left, a gold trophy graphic behind them. The same frame
       as the build's photo-awards.webp, taken here from the newsroom original. It is the
       photograph IAQ published with the feature, not the article, and the caption says so. */
    fig: { img: '/assets/newsroom/mciea-2024-awards-night-team.webp', kind: 'IAQ newsroom', pos: '50% 42%',
           alt: 'The IAQ team in formal wear in front of the MCIEA 2024 backdrop',
           cap: 'The IAQ team at the MCIEA 2024 awards night, the photograph IAQ published with the feature.' },
  },
  {
    /* Newsroom posts of 28 Feb 2025 ("IAQ Achieves 2.6 Million Safety Manhours Milestone in
       East Malaysia Project") and 10 Apr 2025 ("Celebrating 2.6 million Safe Manhours",
       which dates the crossing to 28 February 2025). The 1 million step is the post of
       8 May 2024; IAQ's Award and Recognition page lists it as the same Kuching project. */
    yr: 2025, label: '2025', kind: 'achievement', title: '2.6 million safe manhours',
    text: 'Reached on 28 February 2025 on the East Malaysia wafer fab expansion as it approached its final stages: 2.6 million manhours without a single lost time injury. The same project had passed 1 million safe manhours in May 2024.',
    meta: [{ k: 'Manhours', v: '2.6 million' }, { k: 'Lost time injuries', v: 'Zero' }, { k: 'Site', v: 'East Malaysia wafer fab expansion' }, { k: 'Reached', v: '28 February 2025' }],
    /* newsroom/safe-manhours-2-6-million-2025.webp (the post's own image): about forty
       site staff in hard hats and high visibility vests, fists raised, on gravel in front
       of a large white fab building, holding a banner that reads 2.6 Million Safe Manhours
       Achieved Without Lost Time Injury, 28 February 2025, with an aerial photograph of
       the fab and the subcontractors' logos. The milestone itself, so a real photograph.
       Framed low so the banner and the team fill the crop rather than the sky. */
    fig: { img: '/assets/newsroom/safe-manhours-2-6-million-2025.webp', kind: 'IAQ newsroom', pos: '50% 62%',
           alt: 'The site team in hard hats holding the 2.6 million safe manhours banner in front of the fab',
           cap: 'The site team with the banner: 2.6 million safe manhours achieved without lost time injury, 28 February 2025.' },
  },
  {
    /* Newsroom post of 8 May 2025, "Excellence Through Integration: IAQ Reinforces
       Commitment to IMS and Global Standards". The wording is the post's. */
    yr: 2025, label: '2025', kind: 'achievement', title: 'One system, three standards',
    text: "An internal audit of IAQ's Integrated Management System again showed compliance with all three standards it holds. They are ISO 9001:2015 quality, ISO 14001:2015 environmental and ISO 45001:2018 occupational health and safety management.",
    meta: [{ k: 'System', v: 'Integrated Management System' }, { k: 'Standards', v: 'ISO 9001, ISO 14001, ISO 45001' }, { k: 'Newsroom', v: '8 May 2025' }],
    /* newsroom/ims-internal-audit-2025.webp (the post's own image, published as Opening.png):
       about seventeen IAQ colleagues around a long boardroom table with laptops, several
       giving a thumbs up, the IAQ logo overlaid top left. The same frame as the build's
       photo-opening.webp. The post does not caption it beyond being its image, so the
       caption claims no more than that. Framed low so the logo overlay falls outside. */
    fig: { img: '/assets/newsroom/ims-internal-audit-2025.webp', kind: 'IAQ newsroom', pos: '50% 66%',
           alt: 'IAQ colleagues around a boardroom table with laptops',
           cap: 'The photograph IAQ published with its audit post: colleagues around a boardroom table.' },
  },
  {
    /* Newsroom post of 3 Jul 2025, "IAQ Sets a New Safety Benchmark in Sarawak: Recognized
       by DOSH Kuching". The post names no manhour figure; the 2.74 million is read from the
       banner in its photograph and is labelled as such. */
    yr: 2025, label: '2025', kind: 'achievement', title: 'A new safety benchmark in Sarawak',
    text: "Presented to the Department of Occupational Safety and Health in Kuching, Sarawak, as a formal recognition of the safety standards on IAQ's Sarawak project. The department's director commended IAQ's safety policies and standards as a distinctly higher bar than prevailing local contractor practice.",
    meta: [{ k: 'Recognised by', v: 'DOSH Kuching, Sarawak' }, { k: 'On the banner', v: '2.74 million safe manhours without LTI' }, { k: 'Newsroom', v: '3 July 2025' }],
    /* newsroom/dosh-kuching-safety-benchmark-2025.webp (the post's own image, 850 px wide):
       six men giving a thumbs up in an office with wooden display cabinets and a wall clock,
       the Malaysian coat of arms and the Jabatan Keselamatan dan Kesihatan Pekerjaan Sarawak
       sign behind them, holding an IAQ banner that reads 2.74 million Safe Manhours without
       LTI, Milestone Achievement. The recognition itself, so a real photograph. The research
       manifest flags it for IAQ clearance because it includes people outside IAQ. */
    fig: { img: '/assets/newsroom/dosh-kuching-safety-benchmark-2025.webp', kind: 'IAQ newsroom', ar: '4 / 3',
           alt: 'Six people holding the IAQ 2.74 million safe manhours banner in the DOSH office in Sarawak',
           cap: 'At DOSH in Kuching. The IAQ banner reads 2.74 million Safe Manhours without LTI, Milestone Achievement.' },
  },
  {
    yr: 2025, label: '2025', key: true, title: 'Going global',
    text: 'A second Malaysian base opens in Penang; IAQ Engineering (DE) GmbH opens in Dresden, joining offices in Singapore, France and India.',
    meta: [{ k: 'New base', v: 'Penang' }, { k: 'New office', v: 'Dresden' }, { k: 'Joining', v: 'Singapore, France, India' }],
    /* newsroom/penang-branch-grand-opening-2025.webp, the image of the newsroom post of
       23 Jul 2025, "IAQ Opens Official Branch Office in Penang": the Grand Opening Ceremony
       under a marquee. Five people cut a red ribbon in front of an LED backdrop with the
       IAQ logo and the words Grand Opening Ceremony, two lion dance troupes either side,
       an emcee with a microphone at right. It replaces photo-opening.webp, which shows the
       IMS audit boardroom and never showed Penang. The post gives no ceremony date, so the
       caption gives the publication date. */
    fig: { img: '/assets/newsroom/penang-branch-grand-opening-2025.webp', kind: 'IAQ newsroom', pos: '50% 50%',
           alt: 'Five people cutting a red ribbon at the Grand Opening Ceremony, lion dancers either side and the IAQ logo on the backdrop',
           cap: 'The Grand Opening Ceremony of the Penang branch office, published by IAQ on 23 July 2025.' },
  },
  {
    yr: 2026, label: 'Today', kind: 'achievement', title: 'Held and audited',
    text: 'ISO 9001:2015 quality management, certified by Intertek and UKAS accredited. ISO 14001:2015 environmental and ISO 45001:2018 occupational health and safety management, certified by Intertek. CIDB G7, the highest grade of contractor registration.',
    meta: [{ k: 'Quality', v: 'ISO 9001:2015' }, { k: 'Environment', v: 'ISO 14001:2015' }, { k: 'Safety', v: 'ISO 45001:2018' }, { k: 'Registration', v: 'CIDB G7' }],
    /* No photograph: the figure is the badge row. badge-iso.webp is the Intertek
       certification mark for ISO 9001, ISO 14001 and ISO 45001 (black on white);
       badge-ukas.webp the UKAS Management Systems mark, number 014 (navy on white);
       badge-cidb.webp the CIDB Malaysia Registered Contractor mark (green and grey on white). */
    badges: [
      { src: '/assets/badge-iso.webp', alt: 'ISO 9001, ISO 14001 and ISO 45001 certification by Intertek' },
      { src: '/assets/badge-ukas.webp', alt: 'UKAS Management Systems accreditation' },
      { src: '/assets/badge-cidb.webp', alt: 'CIDB Malaysia registered contractor' },
    ],
  },
  {
    yr: 2026, label: 'Today', key: true, title: 'Listing-grade',
    text: 'Seven countries, 450 people, more than 250 projects and over a million square metres of cleanroom built-up, and a group preparing for its public listing.',
    meta: [{ k: 'Countries', v: '7' }, { k: 'People', v: '450' }, { k: 'Built', v: '1,050,000 m²' }],
    /* hero-campus-dusk.mp4 (5 s) is a slow aerial drift over three white production halls
       with a red band at the eaves, cooling towers steaming behind, hills at dusk. It is the
       site's concept footage, already ambient on the About page, and not a photograph of a
       specific IAQ site, so it is labelled as such. hero-campus-dusk.webp is its poster.
       IAQ's global offices map (history-of-iaq page) is a grey graphic with seven pins, not
       a photograph, so the clip stays. */
    /* 25 Sep (Bazil: "use accurate visuals and video of IAQ"): IAQ's own plant at dusk (Xfab drone shot DJI_0514), the clip cut from the photograph for the home hero */
    fig: { clip: '/assets/videos/hero-plant-dusk.mp4', poster: '/assets/iaq/plant-dusk-01.webp', kind: 'IAQ, Kuching plant',
           alt: 'An IAQ-built plant at dusk, from the air',
           cap: 'A plant IAQ delivered, photographed from the air at dusk.' },
  },
]
