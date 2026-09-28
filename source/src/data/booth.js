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
    { k: 'EPC', t: 'Builds the facility, under one contract.' },
    { k: 'PCU & TTI', t: 'Process Critical Utilities & Total Tool Installation Solutions: re-equips a live fab.' },
    { k: 'EFM', t: 'Runs and maintains it, and cuts the energy bill.' },
  ],
}

/* the IAQ surfaces on the stand, from the berrylife sheets (mm). ppi from the builder's guidelines. */
const px = (mm, ppi) => Math.round(mm / 25.4 * ppi)
export const SURFACES = [
  { id: 'w1', no: 1, k: 'Aisle column', w: 310, h: 3472, ppi: 150,
    where: 'The narrow return that faces the aisle, at the front right corner of the stand. Seen first, from up to 20 m.',
    zones: [['0 to 900 mm', 'kept clear, below the aisle crowd'], ['900 to 2900 mm', 'the tagline, set vertically'], ['2900 to 3350 mm', 'the IAQ mark in a white panel']],
    content: 'IAQ Red full height, the tagline “Your Total Facility Solutions Provider” in white reading up, the mark at the top.' },
  { id: 'w2', no: 2, k: 'Side wall · global presence', w: 2852, h: 3472, ppi: 150,
    where: 'The long wall on the right, facing into the stand and visible from the aisle at an angle.',
    zones: [['0 to 1000 mm', 'quiet: people and the counter stand here'], ['1000 to 1600 mm', 'the four proof numbers, two rows, at eye height'], ['1700 to 2900 mm', 'the dot map with the seven offices, Europe marked'], ['2900 to 3350 mm', 'the headline']],
    content: 'Headline, a dot map drawn from the same world as the website’s globe with the seven offices named, the European three (Germany, Ireland, Sweden) in red, and the four proof numbers.' },
  { id: 'w3', no: 3, k: 'Back wall · the screen wall', w: 2046, h: 3472, visible: 1736, ppi: 150,
    where: 'The back wall of the IAQ zone, 1736 mm visible of 2046 mm, with the 55 inch screen on it.',
    screen: { w: 1238, h: 709, bottom: 1500, side: 249 },
    zones: [['0 to 1000 mm', 'quiet'], ['1000 to 1400 mm', 'the three business units, one line each'], ['1500 to 2209 mm', 'the 55 inch screen: no artwork behind it, 20 mm clear round the frame'], ['2350 to 2750 mm', 'the headline'], ['2850 to 3350 mm', 'the mark with the tagline (Lockup B)']],
    content: 'The mark with the tagline, the headline, the screen, and the three units under it.' },
  { id: 'ct', no: 4, k: 'Counter front', w: 600, h: 1170, ppi: 150, radius: 170,
    where: 'The small reception counter, white front with a 170 mm radius corner and a red side.',
    zones: [['0 to 150 mm', 'plinth, no artwork'], ['500 to 790 mm', 'the code and its address'], ['790 to 950 mm', 'one line'], ['980 to 1110 mm', 'the mark']],
    content: 'The mark, one line, and the code to the booth page with the 3D story.' },
].map(s => ({ ...s, pxW: px(s.w, s.ppi), pxH: px(s.h, s.ppi) }))

export const PRINT_SPEC = [
  ['Files', 'PDF, one per surface, at 1:1 (or 1:10 if berrylife prefers; to confirm)'],
  ['Resolution', '150 ppi at final size for the walls and the counter, 300 ppi for the flyer. Photographs 300 ppi or higher at placed size'],
  ['Colour', 'CMYK, profile Coated FOGRA39. IAQ Red 0 · 92 · 88 · 0 (or its Pantone swatch if printed spot). Large navy and black areas as rich black'],
  ['Type', 'Every font embedded or outlined. Brand faces: Poppins (headlines), Urbanist (text), League Spartan (labels)'],
  ['Bleed', 'To confirm with berrylife. We prepare 10 mm on every edge until they answer'],
  ['The mark', 'As supplied, never redrawn. On navy or red it sits in a white panel. Floor 18 mm in print'],
]

/* the 55 inch screen: the loop, in chapters (PROPOSAL). Runs in the portal; an MP4 of the same loop is the fallback */
export const SCREEN = {
  size: '55 inch, 1238 × 709 mm, bottom edge 1500 mm from the floor',
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
    ['The test', 'Played on a 55 inch screen at 1.5 m and at 4 m before it is sent, and the check written down.'],
  ],
}

/* everything that is not the stand itself (PROPOSAL; sizes from the brand book where it sets them) */
export const COLLATERAL = [
  { id: 'flyer', k: 'Flyer', size: 'A5, 148 × 210 mm, two sides, + 3 mm bleed', status: 'Draft below',
    use: 'Handed out at the counter. Two design sets, front and back: A leads with “Controlled environments, built to class.”, B with “The cleanroom, and the whole fab around it.” IAQ picks one.', qty: 'Quantity to confirm (a four day show: we suggest 500)' },
  { id: 'rollup', k: 'Roll-up banner', size: '850 × 2000 mm, cassette stand (Brand OS, design 1: navy crown, white field, red foot)', status: 'Draft below',
    use: 'Not needed on this stand, which has walls. Recommended for the office, site entrances and any smaller show after Munich, so it is designed in the same pass.', qty: 'Optional' },
  { id: 'cards', k: 'Business cards', size: '85 × 55 mm, the current IAQ card', status: 'Reprint check',
    use: 'Check each person on the stand has enough, and that Dresden team cards exist.', qty: '100 each, on the team' },
  { id: 'pack', k: 'Booster pack', size: 'To define with IAQ', status: 'To define',
    use: 'The minutes confirm the booster pack mockups are inside the project cost. Contents to agree: the flyer, a card, the capability statement once IAQ supplies it.', qty: 'To confirm' },
]

export const ONLINE = [
  { id: 'page', k: 'Booth page on the website', size: 'iaqtechnology.com.my/semicon (proposed)', when: 'Live 26 Oct',
    use: 'The page the code opens: the 3D story, the six services, the projects IAQ clears for Europe, Dresden, and one contact form. The site’s current Exhibition page is internal only and stays so.' },
  { id: 'li', k: 'LinkedIn announcements', size: '1200 × 627 px image, four posts', when: '20 Oct · 3 Nov · 10 Nov · 16 Nov',
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
  { d: '2026-10-30', t: 'Tested on a 55 inch screen at 1.5 m and 4 m', who: 'Brand Method, IAQ' },
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
    { k: 'IAQ Red', hex: '#EC2027', rgb: '236 · 32 · 39', cmyk: '0 · 92 · 88 · 0', src: 'brand', share: 6, use: 'The signal. The second line of a headline, the European offices on the map, the one call to action, a small stripe marker, and the aisle column, the only surface allowed to be red all over.' },
    { k: 'Deep Navy', hex: '#0A101F', rgb: '10 · 16 · 31', cmyk: '88 · 78 · 55 · 72', src: 'brand', share: 16, use: 'The only blue IAQ uses. The 250 mm plinth on every wall, the crown of the flyer, roll-ups and banners. On navy the mark always sits in a white panel.' },
    { k: 'Ink', hex: '#0C1220', rgb: '12 · 18 · 32', cmyk: '85 · 75 · 55 · 70', src: 'est', share: 4, use: 'Headlines and names. Never used as a background: that is Deep Navy.' },
    { k: 'Slate', hex: '#48536A', rgb: '72 · 83 · 106', cmyk: '58 · 44 · 24 · 18', src: 'brand', share: 2, use: 'Supporting text under a headline or a figure.' },
    { k: 'Mist', hex: '#828B9E', rgb: '130 · 139 · 158', cmyk: '45 · 33 · 20 · 5', src: 'est', share: 1, use: 'Small labels only (League Spartan, tracked capitals) and the second part of a map label.' },
    { k: 'White', hex: '#FFFFFF', rgb: '255 · 255 · 255', cmyk: '0 · 0 · 0 · 0', src: 'brand', share: 69, use: 'The ground of every wall, the counter and the flyer: the cleanroom.' },
    { k: 'Stripe grey', hex: '#DCE2EC', rgb: '220 · 226 · 236', cmyk: '12 · 7 · 3 · 0', src: 'est', share: 1, use: 'The quiet version of the stripes, low on the back wall and the counter. Nothing else.' },
    { k: 'Map dot', hex: '#C4CBD8', rgb: '196 · 203 · 216', cmyk: '22 · 14 · 8 · 0', src: 'est', share: 1, use: 'The land dots of the world map. The same world as the website’s globe.' },
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
    ['The screen', '1500 to 2209 mm on the back wall: nothing is printed behind it.'],
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
  { id: 'post1', when: 'Tue 20 Oct · three weeks out', caption: 'IAQ will be at SEMICON Europa in Munich, 10 to 13 November. Meet the IAQ team on the stand for cleanrooms and the whole cycle: design, procurement, construction, testing and commissioning, and the tool hook-up. Bring the brief, or book a time with us now. Stand number to follow.' },
  { id: 'post2', when: 'Tue 3 Nov · one week out', caption: 'One week to SEMICON Europa. IAQ works from offices in seven countries, and in Germany through IAQ Engineering (DE) GmbH in Dresden. Meet the team at Messe München, 10 to 13 November.' },
  { id: 'post3', when: 'Tue 10 Nov · opening day', caption: 'The stand is open at SEMICON Europa. On the screen, a fab built layer by layer, and the six services that take it from the first drawing to handover. Find us at the stand this week.' },
  { id: 'post4', when: 'Mon 16 Nov · the thank-you', caption: 'Thank you, Munich. Four days of briefs and conversations at SEMICON Europa. Every enquiry gets an answer within one working day.' },
]
