/* Campaign landing pages.

   Ads and outbound need a page with one argument and one action, not the full navigation. Each
   campaign is a data entry here, so launching a new one never needs a rebuild: add an object,
   and /lp/<slug> exists.

   `proof` is a predicate over the project registry rather than a hand-picked list, so a campaign
   page cannot go stale when the registry grows.

   `form` picks the form at the foot: 'pack' (the default) asks for three fields and sends the capability pack;
   'project' is the full lead form (contact, market, what is needed, timing, a message) for a project enquiry. Every
   campaign form posts to Netlify Forms as "lead" (lib/enquiry.js). `back` names the page the footer link opens. */

export const CAMPAIGNS = {
  /* 29 Sep ("make me lead form page", a campaign landing page with leads to Netlify Forms): the general one, for
     ads and outbound that are about a facility project rather than one market */
  project: {
    slug: 'project',
    eyebrow: 'Cleanroom and facility projects',
    title: 'Tell us what you are building. One team delivers it.',
    lede: 'Cleanrooms, dry rooms and the systems that hold them in spec, designed, built and maintained by one accountable team since 1995. Send the brief and an engineer replies within a working day.',
    points: [
      'Design, procurement and construction under one contract',
      'ISO 3 to 7 cleanrooms and dry rooms to a specified dew point',
      'Process critical utilities and tool hook-up',
      'Testing, commissioning and maintenance after handover',
    ],
    stat: [
      { v: '1,050,000', k: 'm² cleanroom built-up' },
      { v: '250+', k: 'projects delivered' },
      { v: '7', k: 'countries' },
    ],
    image: '/assets/contact-cleanroom.webp',
    proof: p => ['semiconductor', 'ev-battery', 'data-centre'].includes(p.ind),
    market: '/services',
    back: 'services',
    form: 'project',
  },
  semiconductor: {
    slug: 'semiconductor',
    eyebrow: 'Semiconductor facilities',
    title: 'Cleanrooms for the companies making the chips.',
    lede: 'ISO 3 to 7 cleanrooms, wafer fabs and backend plants, delivered across Malaysia, India and Europe by one accountable team. 31 years, over 250 projects, 1,050,000 m² of cleanroom built.',
    points: [
      'ISO 3 to 7 cleanroom design, build and certification',
      'Process critical utilities: gases, chemicals, ultrapure water',
      'Total tool installation and hook-up',
      'One contract from design to commissioning',
    ],
    stat: [
      { v: '1,050,000', k: 'm² cleanroom built-up' },
      { v: '250+', k: 'projects delivered' },
      { v: '7', k: 'countries' },
    ],
    image: '/assets/industries/semiconductor.webp',
    proof: p => p.ind === 'semiconductor',
    market: '/markets/semiconductor',
  },
  'data-centre': {
    slug: 'data-centre',
    eyebrow: 'Data centre facilities',
    title: 'Where uptime is the only specification that matters.',
    lede: 'Cooling, power and controlled environments at hyperscale. IAQ has delivered up to 160 MW in Malaysia, and maintains what it builds.',
    points: [
      'Chilled and condenser water systems at scale',
      'District cooling design, build and operation',
      'Testing and commissioning against uptime targets',
      'Lifetime maintenance by the team that built it',
    ],
    stat: [
      { v: '160 MW', k: 'largest delivered' },
      { v: '250+', k: 'projects delivered' },
      { v: '32', k: 'years' },
    ],
    image: '/assets/industries/data-centre.webp',
    proof: p => p.ind === 'data-centre' || p.ind === 'district-cooling',
    market: '/markets/data-centre',
  },
  'ev-battery': {
    slug: 'ev-battery',
    eyebrow: 'EV Battery facilities',
    title: 'Dry rooms at the dew point the cell chemistry demands.',
    lede: 'Battery manufacturing demands humidity control far beyond ordinary cleanroom practice. IAQ has been building dry rooms to that standard since 2020.',
    points: [
      'Dry room design and construction to specified dew point',
      'Process critical utilities for cell manufacturing',
      'Energy management on high-load dehumidification',
      'Commissioning against the dew point the finished room holds',
    ],
    stat: [
      { v: '2020', k: 'first dry room delivered' },
      { v: '250+', k: 'projects delivered' },
      { v: '7', k: 'countries' },
    ],
    image: '/assets/industries/ev-battery.webp',
    proof: p => p.ind === 'ev-battery' || p.type === 'dryroom',
    market: '/markets/ev-battery',
  },
}

export const bySlug = s => CAMPAIGNS[s] || null
export const ALL = Object.values(CAMPAIGNS)
