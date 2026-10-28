/* ============================================================================
   The SEMICON Europa 2026 booth plan (22 Sep 2026). One source for the portal's Booth tab, the draft
   artwork and the booth screen.

   Bazil: "a detailed proposal plan for the IAQ booth that has booth design, print etc, and also a full
   on screen to show the services full, including the 3D of how it works, specialised in the portal;
   the other stuff we use flyer, banner design, backdrop and the website; and the portal section that
   has all this."

   Sources, and what is fact and what is proposal:
     · FACT  the event: SEMICON Europa, 10 to 13 November 2026, Messe München, co-located with electronica
             (messe-muenchen.de/en/events/semicon-europa-2026.html, checked 22 Sep 2026)
     · FACT  the stand: Green Excel Poland's booth, version 3, with an IAQ zone; renders by berrylife,
             graphic specification v. 15.09 (OneDrive share, 22 Sep 2026). Every size below is read off
             those sheets
     · FACT  the deadlines and the brief: IAQ x Brand Method review, 17 Sep 2026 (Gemini notes): backdrop
             design due 10 October, the 3D animation for the TV due 5 November (Nabilah: submitted before
             4 November); only necessary information for SEMICON Europa; the European show focuses on
             cleanroom construction; mockups and the booster pack are inside the existing project cost
     · FACT  the brand: IAQ Brand OS v3.1 (colours, faces, mark floors, the roll-up and banner system)
     · PROPOSAL  everything else: the message, the layouts, the screen loop, the collateral, the dates
             between the fixed deadlines. Marked as such on the page.
   ============================================================================ */

export const EVENT = {
  name: 'SEMICON Europa 2026',
  where: 'Messe München, Munich, Germany',
  dates: '10 to 13 November 2026',
  with: 'Co-located with electronica',
  stand: 'Shared stand with Green Excel Poland (booth version 3). IAQ’s part is one corner of it. Hall and stand number to confirm.',
  builder: 'berrylife (renders and graphic specification), for Green Excel',
  start: '2026-11-10',
}

/* what IAQ has confirmed since the plan was written (FACT, with who and when) */
export const CONFIRMED = [
  { k: 'IAQ’s part is this corner only, not the whole stand', t: 'The aisle column, the inner face of the side wall, the back wall section with the screen, and the counter. The rest of the stand is Green Excel’s.', who: 'Nabilah Radzli, IAQ, on the project WhatsApp group, 22 Sep 2026' },
  { k: 'No printing on the outside or the back of the walls', t: 'The outer face of the side wall and the back of the walls stay plain, as berrylife builds them. Nothing is designed for them.', who: 'Nabilah Radzli, IAQ, on the project WhatsApp group, 22 Sep 2026' },
]

/* the three fixed dates, and the show */
export const DEADLINES = [
  { k: 'Backdrop artwork', d: '2026-10-10', who: 'To Green Excel and berrylife', note: 'The IAQ walls and counter, print-ready. From the 17 Sep review.' },
  { k: 'Screen content', d: '2026-11-05', who: 'To berrylife', note: 'The 3D animation for the 55 inch screen. Nabilah asked for it before 4 November, so we deliver on 4 November.' },
  { k: 'Show opens', d: '2026-11-10', who: 'Messe München', note: 'Four days, 10 to 13 November.' },
]

/* the brief, in five lines */
export const BRIEF = [
  { k: 'Goal', t: 'Leave European fab owners, EPCM firms and equipment makers knowing one thing: IAQ builds the controlled environment and the whole facility around it, and has a team in Dresden.' },
  { k: 'Focus', t: 'Cleanroom construction, as IAQ asked for the European show. The other two units are named, not explained at length.' },
  { k: 'Only what is necessary', t: 'IAQ asked to show only necessary information. No client savings figures, no revenue, no project a client has not cleared, no render that carries a client logo.' },
  { k: 'The partner', t: 'The stand is Green Excel Poland’s, which makes cleanroom and dry room architecture products. IAQ is the contractor that designs and builds the facility they go into. The two messages should meet, not repeat.' },
  { k: 'One action', t: 'Every surface points to one action: talk to the team at the counter, or scan the code for the 3D story and the projects.' },
]

/* the message, with the recommended line first (PROPOSAL, for IAQ to choose) */
export const MESSAGE = {
  tagline: 'Your Total Facility Solutions Provider',
  options: [
    { h: 'Controlled environments, built to class.', why: 'Recommended. Says cleanroom construction in four words, and “to class” is how a fab buyer judges a cleanroom.' },
    { h: 'The cleanroom, and the whole fab around it.', why: 'Sits beside Green Excel’s products and says what IAQ adds: the facility, not the panels.' },
    { h: 'From Shah Alam to Dresden, since 1995.', why: 'Leads with presence. Better on the map wall than on the back wall.' },
  ],
  proof: [
    ['31', 'years building controlled environments'],
    ['7', 'countries with an IAQ office, Germany among them'],
    ['250+', 'projects completed'],
    ['1,050,000 m²', 'of cleanroom built'],
  ],
  units: [
    { k: 'EPC', t: 'Builds the facility.' },   /* 27 Oct: "under one contract" off (IAQ, 24 Sep) */
    { k: 'PCU & TTI', t: 'Process Critical Utilities & Total Tool Installation Solutions: re-equips a live fab.' },
    { k: 'EFM', t: 'Runs and maintains it, and cuts the energy bill.' },
  ],
}

/* the IAQ surfaces on the stand, from the berrylife sheets (mm). ppi from the builder's guidelines. */
const px = (mm, ppi) => Math.round(mm / 25.4 * ppi)
export const SURFACES = [
  { id: 'w1', no: 1, k: 'Aisle column', w: 310, h: 3472, ppi: 150,
    where: 'The narrow return that faces the aisle, at the front right corner of the stand. Seen first, from up to 20 m.',
    zones: [['3230 to 3330 mm', 'the IAQ, white'], ['480 to 3050 mm', 'the six services as a loop, top to bottom'], ['0 to 250 mm', 'the navy plinth']],
    content: 'Field red full height, the IAQ in white at the top, then the six services as a loop: each object drawn white, its name under it, one white line down the column that turns back up to Design and consultation. The navy plinth at the foot.' },
  { id: 'w2', no: 2, k: 'Side wall · the cleanroom and every layer', w: 2852, h: 3472, ppi: 150,
    where: 'The long wall on the right, facing into the stand and visible from the aisle at an angle.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement, cleanroom first'], ['2620 to 2670 mm', 'the offices, one short line'], ['300 to 2540 mm', 'IAQ’s exploded fab, its four layers named'], ['0 to 250 mm', 'the navy plinth']],
    content: 'The IAQ top left, “The cleanroom, and every layer of the fab around it.”, the offices as one short line with Dresden named, IAQ’s exploded fab with its four layers named, the navy plinth with the tagline. The dot map is retired.' },
  { id: 'w3', no: 3, k: 'Back wall · the screen wall', w: 2046, h: 3472, visible: 1736, ppi: 150,
    where: 'The back wall of the IAQ zone, 1736 mm visible of 2046 mm, with the 55 inch screen on it.',
    screen: { w: 1238, h: 709, bottom: 1900, side: 249 },
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it, 20 mm clear round the frame'], ['1360 to 1840 mm', 'the three units, on the screen’s own edges'], ['0 to 250 mm', 'the navy plinth']],
    content: 'The IAQ, “Cleanrooms, built to class.”, the screen raised to 1900 mm, and the three units directly under it on its own edges.' },
  { id: 'ct', no: 4, k: 'Counter front', w: 600, h: 1170, ppi: 150, radius: 170,
    where: 'The small reception counter, white front with a 170 mm radius corner and a red side.',
    zones: [['0 to 150 mm', 'plinth, no artwork'], ['500 to 790 mm', 'the code and its address'], ['790 to 950 mm', 'one line'], ['980 to 1110 mm', 'the mark']],
    content: 'The mark, one line, the code to the booth page with the 3D story, and the one long red line.' },
].map(s => ({ ...s, pxW: px(s.w, s.ppi), pxH: px(s.h, s.ppi) }))

export const PRINT_SPEC = [
  ['Files', 'PDF, one per surface, at 1:1 (or 1:10 if berrylife prefers; to confirm)'],
  ['Resolution', '150 ppi at final size for the walls and the counter, 300 ppi for the flyer. Photographs 300 ppi or higher at placed size'],
  ['Colour', 'CMYK, profile Coated FOGRA39. IAQ Red 0 92 88 0 (or its Pantone swatch if printed spot). Large navy and black areas as rich black. Direction B’s navy and its pattern tone, and the field red #C8161D of every large red area (A and B columns, D, E’s back wall), matched on the printer’s proof'],
  ['Type', 'Every font embedded or outlined. Direction A: Poppins (headlines), Urbanist (text), League Spartan (labels). Directions B, C, D and E: Switzer (headlines, names, labels), Instrument Sans (sentences)'],
  ['Bleed', 'To confirm with berrylife. We prepare 10 mm on every edge until they answer'],
  ['Direction F renders', 'Generated representations of a cleanroom facility, not photographs of a project. Placed from the 4K files: about 23 to 40 ppi at wall size, fine on fabric print seen from 3 m; the six stage objects on the aisle column are web images (1600 px) and want high resolution stills before print'],
  ['The mark', 'As supplied, never redrawn. Floor 18 mm in print. Always at the top of a piece. Direction A: on navy in a white panel, white on its red column. B: IAQ’s dark file on navy, the white file on red, no panel. C and E: the light file (red letters, black ®) on white. D and E’s red: the white file'],
]

/* the 55 inch screen: the loop, in chapters (PROPOSAL). Runs in the portal; an MP4 of the same loop is the fallback */
export const SCREEN = {
  size: '55 inch, 1238 × 709 mm, bottom edge 1900 mm from the floor (raised 30 Sep, above a standing crowd)',
  canvas: '1920 × 1080 (to confirm the panel is not 4K; the player scales either way)',
  rules: [
    'Silent. A trade hall is loud; the loop reads without sound.',
    'Seen from 1.5 to 4 m: headlines 80 px and up, text 34 px and up, labels 32 px and up, at 1080p (measured on every chapter).',
    'Every chapter says one thing. A visitor who looks for five seconds still leaves with a sentence.',
    'Zoom only where it helps, on the 3D model, as IAQ asked on 17 Sep.',
    'Loads once, then runs without the network: every picture and model frame is preloaded when the tab opens. A copy of the site on the stand machine is the backup if the hall network fails.',
    'The Codex slides are the source, not the layout: they are dense for the company profile, so each chapter is redrawn at booth scale from the same data.',
  ],
  modes: [
    ['Loop', 'Runs itself between conversations, about two minutes a lap, with “Touch to explore” where “Book a meeting” sits once someone is exploring.'],
    ['Explore', 'Any touch hands it over, to a visitor or the team: the header jumps between sections, the fab model scrubs, each unit opens, the services filter by unit, each hook-up phase opens, and “Book a meeting” shows the code. Sixty seconds untouched and it loops again.'],
  ],
  chapters: [
    { id: 'open', k: 'IAQ', t: 'The mark, the tagline, the headline and three figures.', s: 9 },
    { id: 'fab', k: 'The fab, built', t: 'IAQ’s own Revit model assembles, in five plain moments, each with the unit that does it.', s: 35 },
    { id: 'units', k: 'Three units', t: 'The three business units, one picture and one line each.', s: 16 },
    { id: 'services', k: 'Six services', t: 'The six services in one contract; then each unit lights the ones it carries.', s: 21 },
    { id: 'hookup', k: 'Tool hook-up', t: 'IAQ’s four phases to connect a tool in a live fab, beside the hook-up animation.', s: 18 },
    { id: 'europe', k: 'In Europe', t: 'The seven offices, Dresden marked, the contact and the code.', s: 14 },
  ],
  delivery: [
    ['The player', 'A website, not a video: iaqtechnology.com.my/booth/screen open in one browser tab on the stand machine, full screen (F). It loops by itself and answers touch. No sign-in needed.'],
    ['The screen', 'A touch screen if berrylife can supply one; on a plain screen it loops and the team drives it with a mouse or the keys 1 to 6.'],
    ['The test', 'Played on a 55 inch screen hung at 1.9 m, seen from 1.5 m and from 4 m, before it is sent, and the check written down.'],
  ],
}

/* everything that is not the stand itself (PROPOSAL; sizes from the brand book where it sets them) */
export const COLLATERAL = [
  { id: 'flyer', k: 'Flyer', size: 'A5, 148 × 210 mm, two sides, + 3 mm bleed', status: 'Draft below',
    use: 'Handed out at the counter, front and back, in the direction IAQ chooses (A, B, C, D or E), every one with IAQ at the top and the cleanroom first.', qty: 'Quantity to confirm (a four day show: we suggest 500)' },
  { id: 'rollup', k: 'Roll-up banner', size: '850 × 2000 mm, cassette stand, in the chosen direction', status: 'Draft below',
    use: 'Not needed on this stand, which has walls. Recommended for the office, site entrances and any smaller show after Munich, so it is designed in the same pass.', qty: 'Optional' },
  { id: 'cards', k: 'Business cards', size: '85 × 55 mm, the current IAQ card', status: 'Reprint check',
    use: 'Check each person on the stand has enough, and that Dresden team cards exist.', qty: '100 each, on the team' },
  { id: 'pack', k: 'Booster pack', size: 'To define with IAQ', status: 'To define',
    use: 'The minutes confirm the booster pack mockups are inside the project cost. Contents to agree: the flyer, a card, the capability statement once IAQ supplies it.', qty: 'To confirm' },
]

export const ONLINE = [
  { id: 'page', k: 'Booth page on the website', size: 'iaqtechnology.com.my/semicon (proposed)', when: 'Live 26 Oct',
    use: 'The page the code opens: the 3D story, the six services, the projects IAQ clears for Europe, Dresden, and one contact form. The site’s current Exhibition page is internal only and stays so.' },
  { id: 'li', k: 'LinkedIn announcements', size: '1200 × 627 px image, four posts', when: '20 Oct, 3 Nov, 10 Nov, 16 Nov',
    use: 'Three weeks out, one week out, opening day from the stand, and the thank-you with a photo.' },
  { id: 'sig', k: 'Email signature banner', size: '600 × 150 px', when: 'From 26 Oct to 13 Nov',
    use: 'Every IAQ email says where to meet the team, with the stand number.' },
  { id: 'ad', k: 'Event listing and ad banner', size: 'Sizes set by the organiser', when: 'If IAQ books it',
    use: 'The exhibitor listing text and logo, and a banner in the ad system from the brand book: navy band, white field, one message, one red call to action.' },
]

/* the plan, week by week. Fixed dates carry `fixed` */
export const TIMELINE = [
  { d: '2026-09-22', t: 'Plan, stand files and first drafts in the portal', who: 'Brand Method', done: true },
  { d: '2026-09-25', t: 'IAQ chooses the headline, confirms what may be shown, answers the open questions', who: 'IAQ (Nabilah)' },
  { d: '2026-09-30', t: 'Walls and counter, first full artwork at 1:1', who: 'Brand Method, Shazwan' },
  { d: '2026-10-02', t: 'IAQ comments, one round', who: 'IAQ' },
  { d: '2026-10-06', t: 'Second artwork; berrylife checks sizes, bleed and the screen cut-out', who: 'Brand Method, berrylife' },
  { d: '2026-10-08', t: 'Final approval; print PDFs exported in CMYK FOGRA39 and checked', who: 'IAQ, Brand Method' },
  { d: '2026-10-09', t: 'Screen loop storyboard approved; flyer copy approved', who: 'IAQ' },
  { d: '2026-10-10', t: 'Backdrop artwork delivered to Green Excel and berrylife', who: 'Brand Method', fixed: true },
  { d: '2026-10-16', t: 'First full screen loop running in the portal; flyer artwork', who: 'Brand Method, Azwan' },
  { d: '2026-10-21', t: 'Flyer to print (printed in Germany and delivered to the hall, or in Malaysia and carried)', who: 'IAQ' },
  { d: '2026-10-23', t: 'IAQ reviews the screen loop', who: 'IAQ' },
  { d: '2026-10-26', t: 'Booth page live; email signature banner on', who: 'Brand Method, IAQ' },
  { d: '2026-10-28', t: 'Screen loop final; MP4 fallback recorded', who: 'Brand Method' },
  { d: '2026-10-30', t: 'Tested on a 55 inch screen hung at 1.9 m, from 1.5 m and 4 m', who: 'Brand Method, IAQ' },
  { d: '2026-11-04', t: 'Screen content submitted to berrylife', who: 'IAQ', fixed: true },
  { d: '2026-11-10', t: 'SEMICON Europa opens, Messe München (to 13 Nov)', who: 'IAQ team', fixed: true },
  { d: '2026-11-16', t: 'Thank-you post; every lead answered within one working day', who: 'IAQ' },
]

export const OWNERS = [
  ['IAQ (Nabilah)', 'Approvals, what may be shown, the stand team, print orders, contact with Green Excel'],
  ['Brand Method', 'The plan, the stand artwork, the screen loop and player, the flyer, the booth page, the digital banners'],
  ['Shazwan', 'Brand mockups and the brand book check (from the 17 Sep minutes)'],
  ['Azwan', 'The 3D model and its sequences for the screen'],
  ['berrylife for Green Excel', 'The stand build, printing the walls and counter, the screen hardware'],
]

/* open questions: each says what was done meanwhile */
export const OPEN = [
  { q: 'Hall and stand number?', did: 'Every draft leaves a slot for it; it goes on the flyer, the posts and the signature banner.', who: 'Nabilah, Green Excel' },
  { q: 'How is IAQ named beside Green Excel: partner, co-exhibitor, or no joint wording?', did: 'The drafts carry IAQ’s own message only. No partnership claim is printed until IAQ confirms it.', who: 'Nabilah' },
  { q: 'Which headline?', did: 'Three options above; the drafts use the recommended one, “Controlled environments, built to class.”', who: 'Nabilah' },
  { q: 'Bleed, file scale (1:1 or 1:10) and how the screen sits in the back wall panel?', did: 'Drafts at 1:1 with 10 mm bleed and 20 mm clear round the screen, the common default.', who: 'berrylife' },
  { q: 'Is there a computer for the screen, and can the screen take touch? 4K or full HD?', did: 'The screen is a website that loops and answers touch, so it needs a small computer on HDMI with a browser. Full HD assumed; without touch the team drives it with a mouse or the keys 1 to 6.', who: 'berrylife' },
  { q: 'Which projects may be shown in Europe?', did: 'The screen uses the model, the units and the services only; no client is named until IAQ clears the list.', who: 'Nabilah' },
  { q: 'The booth page address?', did: 'Proposed iaqtechnology.com.my/semicon. The drafts carry a code to that address, marked draft, regenerated once it is final.', who: 'Nabilah, Brand Method' },
  { q: 'Flyer: quantity, English only or English and German, printed where?', did: 'Drafted in English, A5, 500 suggested.', who: 'Nabilah' },
  { q: 'Who from Dresden is on the stand, and whose contact goes on the flyer?', did: 'The flyer carries the Dresden office and the group email until a name is given.', who: 'Nabilah' },
  { q: 'How are leads captured: cards, a scanning app, or a form on a tablet?', did: 'The booth page form works on any tablet; the enquiry endpoint still needs connecting before launch.', who: 'Nabilah' },
  { q: 'Which design direction: A, C, C2 (C with a red front), C3 (C with a red back wall), E or F?', did: 'The five live options are finished on every piece; C is Brand Method’s preferred one (30 Sep) and opens the page. B and D were rejected on 30 Sep and stay viewable. The chooser at the top switches every piece, Compare in the Plan shows the stands at one scale, and the stand turns in 3D in each.', who: 'Nabilah' },
]

export const FILES = [
  { k: 'This plan as a PDF (A3, written by tools/export-booth-plan-0922.mjs)', f: () => '/booth/IAQ-SEMICON-Europa-2026-booth-plan.pdf', src: 'Brand Method, 22 Sep', pdf: true },
  { k: 'Stand renders, version 3', n: 6, f: i => `/booth/render-${i}.webp`, src: 'berrylife for Green Excel, 22 Sep' },
  { k: 'Graphic specification, IAQ surfaces', f: () => '/booth/spec-iaq.webp', src: 'berrylife, v. 15.09' },
  { k: 'Graphic specification, the whole stand', n: 9, f: i => `/booth/spec-ge-${i}.webp`, src: 'berrylife, v. 15.09' },
  { k: 'Print preparation guidelines', f: () => '/booth/print-guidelines-berrylife.pdf', src: 'berrylife', pdf: true },
]

/* ============================================================================
   DESIGN DIRECTION (22 Sep 2026, Bazil: "remember we are supposed to have a design direction or
   element tab", "where we use line, what kind of blue colour", "spacing", "not to do and dos",
   "colour scheme"). Every value here is the one components/booth/Art.jsx draws with.
   ============================================================================ */
export const DIRECTION = {
  idea: {
    h: 'Every layer, built to class.',
    t: 'A fab is built floor by floor, system by system. The IAQ mark is drawn the same way, in stripes. So the stand is drawn that way too: a white cleanroom ground, IAQ’s own exploded fab showing every layer, the logo’s stripes as the one graphic device, a navy plinth that holds the whole zone together, and one red signal on each surface.',
  },
  colours: [
    { k: 'IAQ Red', hex: '#EC2027', rgb: '236 32 39', cmyk: '0 92 88 0', src: 'brand', share: 6, use: 'The signal. The second line of a headline, the European offices on the map, the one call to action, a small stripe marker, and the aisle column, the only surface allowed to be red all over.' },
    { k: 'Deep Navy', hex: '#0A101F', rgb: '10 16 31', cmyk: '88 78 55 72', src: 'brand', share: 16, use: 'The only blue IAQ uses. The 250 mm plinth on every wall, the crown of the flyer, roll-ups and banners. On navy the mark always sits in a white panel.' },
    { k: 'Ink', hex: '#0C1220', rgb: '12 18 32', cmyk: '85 75 55 70', src: 'est', share: 4, use: 'Headlines and names. Never used as a background: that is Deep Navy.' },
    { k: 'Slate', hex: '#48536A', rgb: '72 83 106', cmyk: '58 44 24 18', src: 'brand', share: 2, use: 'Supporting text under a headline or a figure.' },
    { k: 'Mist', hex: '#828B9E', rgb: '130 139 158', cmyk: '45 33 20 5', src: 'est', share: 1, use: 'Small labels only (League Spartan, tracked capitals) and the second part of a map label.' },
    { k: 'White', hex: '#FFFFFF', rgb: '255 255 255', cmyk: '0 0 0 0', src: 'brand', share: 69, use: 'The ground of every wall, the counter and the flyer: the cleanroom.' },
    { k: 'Stripe grey', hex: '#DCE2EC', rgb: '220 226 236', cmyk: '12 7 3 0', src: 'est', share: 1, use: 'The quiet version of the stripes, low on the back wall and the counter. Nothing else.' },
    { k: 'Map dot', hex: '#C4CBD8', rgb: '196 203 216', cmyk: '22 14 8 0', src: 'est', share: 1, use: 'The land dots of the world map. The same world as the website’s globe.' },
  ],
  blue: 'The stand is shared with Green Excel Poland, whose side is royal blue. IAQ’s side uses no royal or bright blue at all: its one blue is Deep Navy, and it appears only as a band (the plinth, a crown, a banner field). Two blues side by side would read as one company.',
  type: [
    { k: 'Poppins', w: 'SemiBold 600', role: 'Headlines, figures, unit names', rule: 'Sentence case. Tight tracking (about -3 %). The second line of a headline may be red.' },
    { k: 'Urbanist', w: 'Medium 500, SemiBold 600', role: 'Every line of text, addresses, the web address', rule: 'Slate for supporting text, Ink for names and contacts.' },
    { k: 'League Spartan', w: 'SemiBold 600', role: 'Small labels only', rule: 'Capitals, tracked wide (about +12 %). Never for a headline, never more than five words.' },
  ],
  scale: [
    ['Walls (read at 1 to 8 m)', 'Headline 126 to 168 mm', 'Figures 150 to 156 mm', 'Text 54 to 66 mm', 'Labels 51 to 56 mm'],
    ['Counter (read at 0.5 to 2 m)', 'Line 40 mm', '', 'Text 26 to 27 mm', ''],
    ['Roll-up (read at 1 to 4 m)', 'Headline 70 to 96 mm', 'Names 34 mm', 'Text 20 to 26 mm', 'Labels 22 to 24 mm'],
    ['Flyer, A5 (in the hand)', 'Headline 7.2 to 7.6 mm (about 21 pt)', 'Figures 9 mm', 'Text 3.1 to 3.4 mm (about 9 pt)', 'Labels 2.9 mm'],
    ['LinkedIn, 1080 × 1350', 'Headline 78 to 84 px', 'Line 44 px', 'Text 27 to 34 px', 'Labels 28 px'],
    ['Booth screen, 1920 × 1080', 'Headline 80 px and up', '', 'Text 34 px and up', 'Labels 32 px and up'],
  ],
  mark: [
    ['Lockup A, the mark alone', 'The default, on every surface but the back wall.'],
    ['Lockup B, the tagline under the mark', 'The back wall only. The tagline runs the full width of the mark, in League Spartan.'],
    ['On navy or red', 'Always in a white panel, with 14 to 16 % of the mark’s width as padding on every side.'],
    ['Smallest size', '18 mm wide in print, 72 px on screen.'],
    ['The file', 'A vector trace of IAQ’s own logo, for the drafts. The official vector from IAQ replaces it before print.'],
  ],
  device: 'The stripes: three bars taken from the logo’s own letters. Red and small (120 mm on a wall) to mark a headline; white at 22 % above the plinth on the aisle column; stripe grey, long and low, on the back wall and the counter. They are a marker, never a divider.',
  lines: {
    yes: ['Inside the exploded fab drawing: it is a technical drawing, and its lines are the building.', 'The chapter progress bars at the foot of the booth screen, which are for the presenter.'],
    no: ['No rules between text blocks, no underlines under headlines.', 'No borders round boxes, no outlined cards.', 'No coloured stripe down the left edge of anything.', 'No dividers in tables or lists: space and the navy plinth do the separating.'],
  },
  spacing: [
    ['The plinth', '250 mm of Deep Navy along the foot of every IAQ surface, at the same height, so the walls, the column and the counter read as one zone.'],
    ['Margins', 'Walls 130 to 150 mm; counter 60 mm; roll-up 70 mm; flyer 12 mm; LinkedIn 80 px; ads 7 % of their width.'],
    ['Height zones', '0 to 1000 mm quiet (people, the counter); 1000 to 1700 mm the facts, at eye height; 1700 to 2900 mm the main visual; 2900 to 3350 mm the headline or the mark.'],
    ['The screen', '1900 to 2609 mm on the back wall (raised 30 Sep): nothing is printed behind it.'],
    ['Rhythm', 'The space under a headline is one headline height; between groups, two.'],
  ],
  imagery: [
    ['IAQ’s exploded fab', 'Vector, prints at any size. The hero of the flyer, the roll-up, option B of the side wall and the posts.'],
    ['The dot world', 'The same land grid as the website’s globe. Seven offices, the European three in red.'],
    ['Line icons', 'The website’s own icon set, red on white for the units, ink for the six services.'],
    ['Photographs', 'Only IAQ’s own, and only on screen or in the LinkedIn posts: none is sharp enough for a wall.'],
  ],
  dos: [
    'Red for one thing per surface: a second headline line, the European offices, or the call to action.',
    'The navy plinth on every wall, the column and the counter, at the same height.',
    'The mark in a white panel on navy or red.',
    'One message per surface, in sentence case.',
    'Numbers the website already publishes, and nothing more.',
    'Keep 0 to 1000 mm quiet on every wall.',
  ],
  donts: [
    'No royal or bright blue on IAQ’s side: that is Green Excel’s colour.',
    'No red backgrounds, except the aisle column.',
    'No lines as separators, no boxes round text.',
    'No monospaced type, no capital-letter headlines.',
    'No dashes as pauses and no exclamation marks.',
    'No stretched, outlined, shadowed or recoloured logo.',
    'No client names, savings figures or client logos.',
    'No two calls to action on one piece.',
  ],
}

/* the four LinkedIn posts: when, the image (components/booth/Art.jsx), and the caption to post with it */
export const POSTS = [
  { id: 'post1', when: 'Tue 20 Oct, three weeks out', caption: 'IAQ will be at SEMICON Europa in Munich, 10 to 13 November. Meet the IAQ team on the stand for cleanrooms and the whole cycle: design, procurement, construction, testing and commissioning, and the tool hook-up. Bring the brief, or book a time with us now. Stand number to follow.' },
  { id: 'post2', when: 'Tue 3 Nov, one week out', caption: 'One week to SEMICON Europa. IAQ works from offices in seven countries, and in Germany through IAQ Engineering (DE) GmbH in Dresden. Meet the team at Messe München, 10 to 13 November.' },
  { id: 'post3', when: 'Tue 10 Nov, opening day', caption: 'The stand is open at SEMICON Europa. On the screen, a fab built layer by layer, and the six services that take it from the first drawing to handover. Find us at the stand this week.' },
  { id: 'post4', when: 'Mon 16 Nov, the thank-you', caption: 'Thank you, Munich. Four days of briefs and conversations at SEMICON Europa. Every enquiry gets an answer within one working day.' },
]

/* ============================================================================
   TWO DIRECTIONS (29 Sep 2026, Bazil: "complete the exhibition with 2 choices of direction"). Every piece exists in
   both: Direction A in components/booth/Art.jsx, Direction B in components/booth/ArtB.jsx. 30 Sep: five (Bazil: "make a 4th
   variation as well", "make a 5th version as well, all red on the back wall"): C, Isometric cleanroom (ArtC.jsx), D, Field
   red (ArtD.jsx), E, Red back wall (ArtE.jsx). The portal's chooser switches every piece between them; Direction A's full rulebook is DIRECTION above. Direction B follows the IAQ Design
   tab decided on 29 Sep (public/design/apps.css, tools/design-apps/elements.html and applications.html).
   ============================================================================ */
export const DIRECTIONS = {
  A: {
    k: 'A', name: 'White cleanroom',
    line: 'A white ground, IAQ’s exploded fab drawn layer by layer, the six services looping down the red column, a navy plinth round the zone.',
    idea: { h: 'Every layer, built to class.', t: 'A fab is built floor by floor. The stand is a white cleanroom: the cleanroom first, IAQ’s exploded fab showing every layer around it, the six services as a loop down the red aisle column, and one navy plinth running round the whole IAQ zone.' },
    colours: [
      { k: 'White', hex: '#FFFFFF', share: 69, use: 'The ground of every surface' },
      { k: 'Deep Navy', hex: '#0A101F', share: 16, use: 'The plinth, crowns and bands' },
      { k: 'Field red', hex: '#C8161D', share: 4, use: 'The aisle column, the large red' },
      { k: 'IAQ Red', hex: '#EC2027', share: 3, use: 'The signal: a phrase, the one line' },
      { k: 'Ink', hex: '#0C1220', share: 4, use: 'Headlines and names' },
      { k: 'Slate', hex: '#48536A', share: 2, use: 'Supporting text' },
      { k: 'Greys', hex: '#C4CBD8', share: 2, use: 'The drawing’s own greys' },
    ],
    type: [
      ['Poppins 600', 'Headlines, figures and unit names, sentence case'],
      ['Urbanist 500 and 600', 'Every line of text and the web address'],
      ['League Spartan 600', 'Small labels in tracked capitals, five words at most'],
    ],
    device: [
      ['The plinth', '250 mm of Deep Navy along the foot of every wall, the column and the counter, at one height.'],
      ['The loop', 'The six services down the red column, each object drawn white, joined by one white line that turns back up to the start.'],
      ['The logo', 'The mark at the top of every piece; on navy it sits in a white panel, on the red column it is white. The tagline in the side wall’s plinth.'],
      ['Pictures', 'IAQ’s exploded fab, line icons for the units. No dot map on the walls (one small one on post 2). No photograph in print.'],
    ],
    dos: ['The cleanroom first on every wall.', 'The navy plinth on every surface, at one height.', 'The IAQ at the top of every piece.', 'Numbers the website already publishes.', 'Keep 0 to 1000 mm quiet on every wall.'],
    donts: ['No royal or bright blue: that is Green Excel’s side.', 'No red ground except the aisle column.', 'No stripes as a marker, no grey lines.', 'No map as the hero of a wall.', 'No two calls to action on one piece.'],
  },
  B: {
    k: 'B', name: 'Navy statement', status: 'rejected', when: '30 Sep',
    line: 'A navy ground in IAQ’s square pattern, one statement per surface, and the seven lines at the foot of every wall.',
    idea: { h: 'Seven lines, one statement.', t: 'IAQ’s wordmark is drawn in seven horizontal rows. Direction B carries the Design tab to the stand: navy in the square pattern, the wordmark top left, one statement per surface, the seven rows full width at the foot of every wall, and the detail on white blocks with IAQ’s isometric objects.' },
    colours: [
      { k: 'Navy', hex: '#17213A', share: 58, use: 'The ground of every piece' },
      { k: 'Square tone', hex: '#1F2C4B', share: 6, use: 'The pattern’s grid, one tone apart' },
      { k: 'White', hex: '#FFFFFF', share: 24, use: 'Type and blocks; the seven lines only on the red column' },
      { k: 'IAQ Red', hex: '#EC2027', share: 5, use: 'The signal and the seven lines' },
      { k: 'Field red', hex: '#C8161D', share: 3, use: 'The aisle column' },
      { k: 'Black', hex: '#231F20', share: 2, use: 'Text on the white blocks' },
      { k: 'Greys', hex: '#C5CCD9', share: 2, use: 'Sentences on navy and white' },
    ],
    type: [
      ['Switzer 600', 'Headlines, figures and names, sentence case, tracked in by 2.4 %'],
      ['Switzer 500', 'The foot, the web address, the slim box'],
      ['Instrument Sans 400', 'Sentences only. No capitals outside a slim box'],
    ],
    device: [
      ['The seven lines', 'The wordmark’s own rows, 18.4 to 26.3 thick on gaps of 8.3, full width at the foot of the three walls, as tall as the wordmark’s letters. Red on navy; white only on the red column. One wordmark size on the walls, so the lines stand at one height round the zone.'],
      ['The long line', 'Every other piece takes one straight line above its foot, margin to margin, 1.2 % of the wordmark’s width thick: white on navy, red on white.'],
      ['The logo', 'The Design tab’s rule: the red wordmark with a white ® on navy, the all white file on red, no panel. Top left on the margin; big across the top of the aisle column.'],
      ['Pictures', 'IAQ’s isometric objects on white blocks. One wide IAQ photograph on the leaflet, the roll-up and the digital pieces, in its own block. None on the walls.'],
    ],
    dos: ['The wordmark top left on every piece.', 'One statement per surface, one phrase in red.', 'The seven lines at the foot of the walls only.', 'One long line above the foot everywhere else.', 'Detail on a white block, a photograph in its own block.'],
    donts: ['No seven lines beside the logo, small, or tall mid board; never white on navy.', 'No type on a photograph, no photograph on a wall.', 'No gradient, no glow, no royal or bright blue.', 'No dot map and no stripes as a marker.', 'No capitals for a sentence, no numbering.'],
  },
}

DIRECTIONS.C = {
  k: 'C', name: 'Isometric cleanroom', status: 'preferred', when: '30 Sep',
  line: 'A white stand drawn in IAQ’s isometric: a cleanroom being built, layer by layer, its layers named on fine leaders.',
  idea: { h: 'The cleanroom, built layer by layer.', t: 'Cleanroom construction is what IAQ asked the European show to see. Direction C draws it: the raised floor on its pedestals, the wall panels with one being set, the fan filter units in the ceiling grid, the air handling above, drawn large on the side wall with every layer named. The same bay stands tall on the aisle column; the three units sit under the raised screen.' },
  colours: [
    { k: 'White', hex: '#FFFFFF', share: 72, use: 'The ground of every piece' },
    { k: 'Cleanroom grey', hex: '#F4F6F9', share: 6, use: 'The aisle column, a band on the leaflet' },
    { k: 'Drawing greys', hex: '#C9CDD3', share: 10, use: 'The isometric drawings, in their own tones' },
    { k: 'IAQ Red', hex: '#EC2027', share: 5, use: 'One red part per drawing, one phrase, the one line' },
    { k: 'Black', hex: '#231F20', share: 5, use: 'Statements, names, labels' },
    { k: 'Slate', hex: '#5A5F6B', share: 2, use: 'Sentences and the labels’ second line' },
  ],
  type: [
    ['Switzer 600', 'Statements, figures, names and the layer labels, sentence case'],
    ['Switzer 500', 'The foot and the web address'],
    ['Instrument Sans 400', 'Sentences and each label’s second line'],
  ],
  device: [
    ['The drawing', 'The Design tab’s isometric, drawn for the stand on its own engine: true isometric, soft greys, one red part, no keylines or glow, vector at 1:1.'],
    ['The leaders', 'Fine horizontal lines in the drawing’s edge grey, from each layer to its name. Never vertical, never a divider.'],
    ['The long line', 'One straight red line 400 mm above the floor across all three walls, edge to edge at one height, so it reads as one line round the zone; above the foot on every other piece.'],
    ['The logo', 'IAQ’s light file (red letters, black ®) top left on every piece; 520 mm on the walls, on the same grid as B.'],
  ],
  dos: ['The cleanroom drawn large, its layers named.', 'One red part in each drawing.', 'The IAQ top left on every piece.', 'One long red line, at one height round the zone.', 'Detailed drawings large, simple ones small.'],
  donts: ['No keylines, glow or shadow on a drawing.', 'No photograph: this direction is drawn.', 'No seven lines and no stripes.', 'No detailed and simple objects in one row.', 'No label boxes or numbers on the drawing.'],
}
DIRECTIONS.D = {
  k: 'D', name: 'Field red', status: 'rejected', when: '30 Sep',
  line: 'IAQ’s deep field red as the ground, white type, IAQ’s cleanrooms in square blocks, the figures large, the white seven lines.',
  idea: { h: 'One red, held calm.', t: 'The stand in IAQ’s field red, the deeper red for large areas, with a lot of red space inside it: the figure as the statement, one IAQ cleanroom per wall in its own square cornered block, the six services looping down the aisle column, and the seven lines in white at the foot of every wall, the one ground where white lines are allowed.' },
  colours: [
    { k: 'Field red', hex: '#C8161D', share: 70, use: 'The ground of the walls, the counter and every front' },
    { k: 'White', hex: '#FFFFFF', share: 20, use: 'Every word on red, the seven lines, the leaflet’s back' },
    { k: 'Photographs', hex: '#9BA3AE', share: 7, use: 'IAQ’s cleanrooms, in their own blocks' },
    { k: 'IAQ Red', hex: '#EC2027', share: 1, use: 'Small, on white only: one phrase on the leaflet’s back' },
    { k: 'Black', hex: '#231F20', share: 2, use: 'Text on the leaflet’s white back' },
  ],
  type: [
    ['Switzer 600', 'Statements and figures, large, white'],
    ['Switzer 500', 'The foot and the web address'],
    ['Instrument Sans 400', 'Sentences, white on red'],
  ],
  device: [
    ['The seven lines', 'White, at the foot of the three walls, as tall as the wall wordmark’s letters, one height round the zone. White only because the ground is IAQ red.'],
    ['The loop', 'The six services down the aisle column, drawn white, joined by one white line that turns back up to the start.'],
    ['The logo', 'IAQ’s all white file, top left, across the top of the column and the roll-up.'],
    ['Pictures', 'IAQ’s own cleanrooms, wide, no close faces, in square cornered blocks, never under type. The camera originals are needed before the walls print.'],
  ],
  dos: ['A lot of red space, few things per surface.', 'Every word white on the red.', 'The figures large.', 'One IAQ cleanroom per surface, in its block.', 'The seven lines white at the foot of the walls.'],
  donts: ['No bright red as a ground; it stays small.', 'No black or grey type on the red.', 'No type on a photograph.', 'No close faces, no crowd shots.', 'No red gradient, no second red block.'],
}
DIRECTIONS.E = {
  k: 'E', name: 'Red back wall',
  line: 'A white stand with one red plane: the back wall, field red, the screen set in it, the white IAQ across its top.',
  idea: { h: 'One red wall, seen from the aisle.', t: 'The back wall is the one red plane on the stand: field red edge to edge, the white IAQ big across its top, the raised screen set into the red, the cleanroom statement in white under it and the white seven lines at its foot. The side wall and the aisle column stay white and lead with IAQ’s own cleanrooms; the counter is white with one red line.' },
  colours: [
    { k: 'White', hex: '#FFFFFF', share: 52, use: 'The side wall, the counter, every piece under its red plane' },
    { k: 'Field red', hex: '#C8161D', share: 30, use: 'The back wall, and one plane at the top of each piece' },
    { k: 'Photographs', hex: '#9BA3AE', share: 10, use: 'IAQ’s cleanrooms, in square cornered blocks' },
    { k: 'IAQ Red', hex: '#EC2027', share: 2, use: 'One phrase and the one line, on white' },
    { k: 'Black', hex: '#231F20', share: 6, use: 'Statements and figures on white' },
  ],
  type: [
    ['Switzer 600', 'Statements, figures and names'],
    ['Switzer 500', 'The foot and the web address'],
    ['Instrument Sans 400', 'Sentences'],
  ],
  device: [
    ['The red plane', 'The back wall entirely field red, the screen set into it. On every other piece, one field red plane at the top that carries the white IAQ and the statement.'],
    ['The seven lines', 'White, at the foot of the back wall only, as tall as its wordmark’s letters. Nowhere else.'],
    ['The long line', 'Red on white: 400 mm above the floor on the side wall and the column, above the foot on the counter and every piece.'],
    ['Pictures', 'IAQ’s own cleanrooms in square cornered blocks on the white side wall and the column. The camera originals are needed before the walls print.'],
  ],
  dos: ['One red plane the aisle can read.', 'The IAQ big and white across the red wall.', 'The side wall white, a real cleanroom first.', 'The counter white with one red line.', 'The seven lines only at the red wall’s foot.'],
  donts: ['No second red wall: that is Direction D.', 'No white lines on white or on a photograph.', 'No type on a photograph.', 'No red gradient into the white.', 'No map, no numbering.'],
}

/* 30 Sep, after Bazil's review: C2 (C with a red front column) and F (built around photoreal renders) */
DIRECTIONS.C2 = {
  ...DIRECTIONS.C, k: 'C2', tab: 'C red front', name: 'Isometric cleanroom, red front', status: undefined, when: undefined,
  line: 'Direction C with its front panel red: the aisle column in field red, the six services looping down it in white.',
  idea: { h: 'The same clear cleanroom, a red front to the aisle.', t: 'Everything in Direction C stays: the cleanroom being built, drawn large on the side wall with its layers named, the three units under the raised screen. Only the front panel changes: the aisle column facing the aisle turns field red, with the white IAQ at the top, the six services as a loop drawn white, and the white seven lines at its foot.' },
  colours: [
    { k: 'White', hex: '#FFFFFF', share: 66, use: 'The ground of every piece but the front' },
    { k: 'Field red', hex: '#C8161D', share: 8, use: 'The front panel, the aisle column' },
    { k: 'Drawing greys', hex: '#C9CDD3', share: 12, use: 'The isometric drawings, in their own tones' },
    { k: 'IAQ Red', hex: '#EC2027', share: 5, use: 'One red part per drawing, one phrase, the one line' },
    { k: 'Black', hex: '#231F20', share: 6, use: 'Statements, names, labels' },
    { k: 'Slate', hex: '#5A5F6B', share: 3, use: 'Sentences and the labels’ second line' },
  ],
  device: [
    ['The front', 'The aisle column in field red: the white IAQ at the top, the six services as a loop drawn white, joined by one white line that turns back up, the white seven lines at the foot (white only on IAQ red).'],
    ['The drawing', 'As C: the Design tab’s isometric, drawn for the stand, one red part, vector at 1:1.'],
    ['The long line', 'Red, 400 mm above the floor across the side and back walls, above the foot on every other piece.'],
    ['The logo', 'White on the red front; IAQ’s light file top left on every white piece.'],
  ],
  dos: ['The front red, everything else as C.', 'The loop white on the red, one line.', 'The white seven lines only on the red front.', 'One red part in each drawing.', 'The IAQ top left on every piece.'],
  donts: ['No second red wall.', 'No white lines on white.', 'No numbers on the loop.', 'No photograph: this direction is drawn.', 'No stripes.'],
}
DIRECTIONS.C3 = {
  ...DIRECTIONS.C, k: 'C3', tab: 'C3 red back', name: 'Isometric cleanroom, red back wall', status: 'new', when: '30 Sep',
  line: 'Direction C with a field red back wall under a big white IAQ, and the six services looping down the aisle column.',
  idea: { h: 'The clear cleanroom, a red wall behind the screen.', t: 'Direction C’s side wall and counter stay as they are: the cleanroom being built, drawn large, its layers named. The back wall turns field red: the white IAQ big and centred, the title in white, the raised screen, the same cleanroom drawing on a white block under it, a white world map with the offices and four figures at its foot. The aisle column carries the six services as a loop in C’s own drawings.' },
  colours: [
    { k: 'White', hex: '#FFFFFF', share: 55, use: 'The side wall, the counter, the white block' },
    { k: 'Field red', hex: '#C8161D', share: 24, use: 'The back wall' },
    { k: 'Drawing greys', hex: '#C9CDD3', share: 10, use: 'The isometric drawings, in their own tones' },
    { k: 'IAQ Red', hex: '#EC2027', share: 4, use: 'One red part per drawing, the loop, the one line' },
    { k: 'Black', hex: '#231F20', share: 5, use: 'Statements, names, labels' },
    { k: 'Slate', hex: '#5A5F6B', share: 2, use: 'Sentences' },
  ],
  device: [
    ['The red back wall', 'Field red edge to edge, the white IAQ big and centred, the title centred, the screen set in the red, the drawing on a white block on the screen’s edges; the line at 400 mm white.'],
    ['The loop', 'The six services down the aisle column in C’s own drawings, joined by one red line with plain chevrons that turns back up to Design.'],
    ['The world map', 'White dots on the red at the back wall’s foot, the offices named, beside four figures. Small, never the hero.'],
    ['The logo', 'White and big on the red back wall; IAQ’s light file top left on every white piece.'],
  ],
  dos: ['The back wall red, the rest as C.', 'The IAQ big and centred on the red.', 'The loop on the column, one red line.', 'The drawing on a white block, its layers named.', 'The map small, beside the figures.'],
  donts: ['No second red wall.', 'No map as the hero.', 'No numbers on the loop.', 'No type on the drawing.', 'No seven lines and no stripes.'],
}
DIRECTIONS.F = {
  k: 'F', name: '3D cleanroom',
  line: 'A white stand built around photoreal renders of a cleanroom facility, the six services as the site’s 3D objects.',
  idea: { h: 'The cleanroom, rendered.', t: 'Premium architectural renders of a cleanroom facility carry the stand: the fab exploded into its four layers on the side wall, each layer named, the cleanroom with its one red fan filter unit; a cleanroom under construction under the raised screen on the back wall; the six services down the aisle column as the website’s own photoreal objects. White ground, the IAQ at the top of every piece, one long red line.' },
  colours: [
    { k: 'White', hex: '#FFFFFF', share: 70, use: 'The ground; the renders sit on it with no edge' },
    { k: 'Render greys', hex: '#B9BEC6', share: 20, use: 'The renders, graded to greys' },
    { k: 'IAQ Red', hex: '#EC2027', share: 3, use: 'One red part per render, one phrase, the one line' },
    { k: 'Black', hex: '#231F20', share: 5, use: 'Statements, names, labels' },
    { k: 'Slate', hex: '#5A5F6B', share: 2, use: 'Sentences and the labels’ second line' },
  ],
  type: [
    ['Switzer 600', 'Statements, names and the layer labels'],
    ['Switzer 500', 'The foot and the web address'],
    ['Instrument Sans 400', 'Sentences'],
  ],
  device: [
    ['The renders', 'Photoreal CGI of a cleanroom facility, graded to the IAQ palette: greys, one red part each, the ground pure white so each sits on the wall’s white with no box edge. Generated representations, said in the spec, never on the art.'],
    ['The leaders', 'Fine horizontal lines from each layer of the hero render to its name.'],
    ['The long line', 'One straight red line 400 mm above the floor across the three walls, at one height; above the foot on every other piece.'],
    ['The six services', 'The website’s photoreal stage objects, down the aisle column and on the leaflet’s back.'],
  ],
  dos: ['The renders large, on the white.', 'One red part per render.', 'The IAQ top left on every piece.', 'Each layer named on a fine leader.', 'One long red line, at one height.'],
  donts: ['No box or frame round a render.', 'No type on a render.', 'No blue, green or yellow in a render.', 'No render passed off as a photograph of a project.', 'No seven lines and no stripes.'],
}

/* the Direction B stand surfaces (sizes and places as SURFACES above) */
export const SURFACES_B = {
  w1: { id: 'w1-b', content: 'Field red full height, the wordmark in white across the top, the seven lines in white at the foot. The stand’s signpost from the aisle.',
    zones: [['3220 to 3330 mm', 'the wordmark, white'], ['150 to 240 mm', 'the seven lines, as tall as its letters']] },
  w2: { id: 'w2-b', content: 'The wordmark, “The cleanroom, and the whole fab around it.”, six systems of the fab as IAQ’s isometric objects on a white block, the four proof numbers, the seven lines in red at the foot.',
    zones: [['3130 to 3340 mm', 'the wordmark'], ['2750 to 3050 mm', 'the statement'], ['2130 to 2650 mm', 'the fab around the cleanroom, on a white block'], ['1450 to 1940 mm', 'the four proof numbers, at eye height'], ['150 to 350 mm', 'the seven lines']] },
  w3: { id: 'w3-b', content: 'Redesigned 30 Sep: the wordmark, “Cleanrooms, built to class.” large on the side wall’s grid, the screen raised to 1900 mm, the three units on one white block on the screen’s own edges (EPC carries the cleanroom), the seven lines in red at the foot. The part inside wall 2 is plain navy.',
    zones: [['3130 to 3340 mm', 'the wordmark'], ['2750 to 3050 mm', 'the statement'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it'], ['1360 to 1840 mm', 'the three units on one white block, on the screen’s edges'], ['150 to 350 mm', 'the seven lines']] },
  ct: { id: 'ct-b', content: 'The wordmark, “Cleanrooms, built to class.”, the code with one line, and the long line above the address.',
    zones: [['990 to 1100 mm', 'the wordmark'], ['760 to 920 mm', 'the headline'], ['500 to 700 mm', 'the code and one line'], ['310 to 390 mm', 'the long line and the address'], ['0 to 150 mm', 'plinth, no artwork']] },
}

/* 30 Sep: the stand surfaces of Directions C, D and E (sizes and places as SURFACES) */
const W3Z = [['3130 to 3340 mm', 'the wordmark'], ['2750 to 3050 mm', 'the statement'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it'], ['1360 to 1840 mm', 'the three units, on the screen’s own edges']]
export const SURFACES_C = {
  w1: { id: 'w1-c', content: 'Cleanroom grey, the IAQ across the top, one bay of the cleanroom standing tall with its layers lifted apart (the red panel being set), the red line at 400 mm.',
    zones: [['3230 to 3330 mm', 'the IAQ'], ['490 to 2180 mm', 'the cleanroom bay, its layers apart'], ['395 to 400 mm', 'the long red line']] },
  w2: { id: 'w2-c', content: 'The IAQ, “1,050,000 m² of cleanroom, built layer by layer.”, and the cleanroom being built, drawn large: the raised access floor, the wall panels with one being set, the fan filter units, the air handling, each named on a fine leader. The red line at 400 mm.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement'], ['500 to 2610 mm', 'the cleanroom being built, four layers named'], ['395 to 400 mm', 'the long red line, one height round the zone']] },
  w3: { id: 'w3-c', content: 'The IAQ, “Cleanrooms, built to class.”, the screen raised to 1900 mm, the three units under it with their isometric objects (EPC carries the cleanroom), the red line at 400 mm.',
    zones: [...W3Z, ['395 to 400 mm', 'the long red line']] },
  ct: { id: 'ct-c', content: 'White: the IAQ, “Cleanrooms, built to class.”, the code, the finished cleanroom with its red fan filter unit, the red line above the address.',
    zones: [['990 to 1100 mm', 'the IAQ'], ['800 to 920 mm', 'the statement'], ['500 to 750 mm', 'the code and the cleanroom'], ['310 to 390 mm', 'the red line and the address'], ['0 to 150 mm', 'plinth, no artwork']] },
}
export const SURFACES_D = {
  w1: { id: 'w1-d', content: 'Field red, the IAQ in white across the top, the six services as a loop in white, the white seven lines at the foot.',
    zones: [['3230 to 3330 mm', 'the IAQ, white'], ['420 to 3050 mm', 'the six services as a loop'], ['150 to 240 mm', 'the seven lines, white']] },
  w2: { id: 'w2-d', content: 'Field red: the IAQ in white, “1,050,000 m² of cleanroom built since 1995.” as the statement, one IAQ cleanroom in a square block, two more figures, the white seven lines.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2640 to 2990 mm', 'the figure and its line'], ['1250 to 2470 mm', 'one IAQ cleanroom, a square block'], ['1440 to 2350 mm', 'two figures, at eye height'], ['150 to 350 mm', 'the seven lines, white']] },
  w3: { id: 'w3-d', content: 'Field red: the IAQ in white, “Cleanrooms, built to class.”, the screen raised to 1900 mm, the three units in white with their objects drawn white, the white seven lines.',
    zones: [...W3Z, ['150 to 350 mm', 'the seven lines, white']] },
  ct: { id: 'ct-d', content: 'Field red: the IAQ in white, “Cleanrooms, built to class.”, the code with one line, the white line above the address.',
    zones: [['990 to 1100 mm', 'the IAQ'], ['800 to 920 mm', 'the statement'], ['500 to 710 mm', 'the code and one line'], ['310 to 390 mm', 'the line and the address'], ['0 to 150 mm', 'plinth, no artwork']] },
}
export const SURFACES_E = {
  w1: { id: 'w1-e', content: 'Cleanroom grey, the IAQ across the top, one tall IAQ cleanroom corridor in its block, the red line at 400 mm.',
    zones: [['3230 to 3330 mm', 'the IAQ'], ['810 to 2710 mm', 'the cleanroom corridor, one block'], ['395 to 400 mm', 'the long red line']] },
  w2: { id: 'w2-e', content: 'White: the IAQ, “1,050,000 m² of cleanroom, built since 1995.”, one IAQ cleanroom in a square block, three figures beside it, the red line at 400 mm.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement'], ['1250 to 2510 mm', 'one IAQ cleanroom, a square block, and three figures'], ['395 to 400 mm', 'the long red line']] },
  w3: { id: 'w3-e', content: 'The one red plane: field red edge to edge, the IAQ big and white across the top, the screen raised to 1900 mm and set into the red, “Cleanrooms, built to class.” in white under it, the white seven lines at the foot.',
    zones: [['2880 to 3330 mm', 'the IAQ, across the top'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it'], ['1370 to 1810 mm', 'the statement and one line, white'], ['150 to 570 mm', 'the seven lines, white']] },
  ct: { id: 'ct-e', content: 'White: the IAQ, “Cleanrooms, built to class.”, the code with one line, the one red line above the address.',
    zones: [['990 to 1100 mm', 'the IAQ'], ['800 to 920 mm', 'the statement'], ['500 to 710 mm', 'the code and one line'], ['310 to 390 mm', 'the red line and the address'], ['0 to 150 mm', 'plinth, no artwork']] },
}

/* 30 Sep: C2 shares C's surfaces except the red front; F */
export const SURFACES_C2 = {
  ...SURFACES_C,
  w1: { id: 'w1-c2', content: 'The red front: field red, the IAQ in white at the top, the six services as a loop drawn white, joined by one white line that turns back up to the start, the white seven lines at the foot.',
    zones: [['3230 to 3330 mm', 'the IAQ, white'], ['480 to 3050 mm', 'the six services as a loop'], ['150 to 240 mm', 'the seven lines, white']] },
}
export const SURFACES_F = {
  w1: { id: 'w1-f', content: 'White: the IAQ across the top, the six services top to bottom as the website’s photoreal objects with their names, the red line at 400 mm.',
    zones: [['3230 to 3330 mm', 'the IAQ'], ['510 to 3050 mm', 'the six services, photoreal objects'], ['395 to 400 mm', 'the long red line']] },
  w2: { id: 'w2-f', content: 'White: the IAQ, “The cleanroom, and the whole fab around it.”, the fab exploded into four layers as the hero render, each layer named on a fine leader (the cleanroom with its one red fan filter unit), the red line at 400 mm.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement'], ['490 to 2630 mm', 'the hero render (a representation), its four layers named'], ['395 to 400 mm', 'the long red line']] },
  w3: { id: 'w3-f', content: 'White: the IAQ, “Cleanrooms, built to class.”, the screen raised to 1900 mm, a cleanroom under construction (render) directly under it on its edges, the red line at 400 mm.',
    zones: [['3130 to 3340 mm', 'the IAQ'], ['2750 to 3050 mm', 'the statement'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it'], ['1015 to 1840 mm', 'the cleanroom under construction (a representation)'], ['395 to 400 mm', 'the long red line']] },
  ct: { id: 'ct-f', content: 'White: the IAQ, “Cleanrooms, built to class.”, the code, a cleanroom module exploded (render), the red line above the address.',
    zones: [['990 to 1100 mm', 'the IAQ'], ['800 to 920 mm', 'the statement'], ['500 to 750 mm', 'the code and the render'], ['310 to 390 mm', 'the red line and the address'], ['0 to 150 mm', 'plinth, no artwork']] },
}

/* 30 Sep: C3 shares C's surfaces except the loop column and the red back wall */
export const SURFACES_C3 = {
  ...SURFACES_C,
  w1: { id: 'w1-c3', content: 'C’s light column: the IAQ at the top, the six services as a loop in C’s own drawings, names under each, one red line down with plain chevrons that turns back up to Design, the red line at 400 mm.',
    zones: [['3230 to 3330 mm', 'the IAQ'], ['560 to 3050 mm', 'the six services as a loop'], ['395 to 400 mm', 'the long red line']] },
  w3: { id: 'w3-c3', content: 'Field red: the white IAQ big and centred, “From the first drawing to a proven cleanroom.” in white, the screen raised to 1900 mm, the cleanroom being built on a white block on its edges with its layers named, a white world map with the offices beside four figures, the white line at 400 mm.',
    zones: [['3060 to 3360 mm', 'the IAQ, white, centred'], ['2770 to 2990 mm', 'the title'], ['1900 to 2609 mm', 'the 55 inch screen, raised: nothing printed behind it'], ['1284 to 1844 mm', 'the cleanroom drawing on a white block'], ['810 to 1214 mm', 'the world map and four figures'], ['395 to 400 mm', 'the line, white']] },
}
