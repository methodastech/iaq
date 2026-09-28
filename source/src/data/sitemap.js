/* ============================================================================
   IAQ website framework: the single source of truth for structure and flow.

   Every page on the site is declared here once, with the group it belongs to,
   its route, why it exists, the blocks it carries, the one action it asks for,
   and the routes it links out to. Navigation, the footer, the universal search
   index, the interlinking checks and the /flow diagram all read from this file,
   so the site can never drift from the agreed architecture.

   Source: BM SS Portal · IAQ sitemap and website architecture ("lean public
   structure, one hidden wing"). Six groups, one gated wing.

   The five interlinking rules this data must satisfy:
     R1 every market links straight into projects filtered to that market
     R2 every project points back to its market and its capability
     R3 every capability shows real work
     R4 one obvious next step per page, never two competing calls
     R5 nothing orphaned: every page has an inbound link from its group hub
   ============================================================================ */

export const GROUPS = [
  { id: 'foundation', no: '1', name: 'Foundation',  blurb: 'Who IAQ is. The pages every visitor passes through regardless of why they came.' },
  { id: 'capability', no: '2', name: 'What we do',  blurb: 'The capability sell. Disciplines and business models, told as diagrams rather than text.' },
  { id: 'markets',    no: '3', name: 'Who we serve', blurb: 'The seven markets. Each one a sector argument with its own proof.' },
  { id: 'proof',      no: '4', name: 'Proof',       blurb: 'The portfolio. Projects at launch, searchable, the strongest as full case studies.' },
  { id: 'momentum',   no: '5', name: 'Momentum',    blurb: 'Freshness and talent. The pages that keep the site alive between builds.' },
  { id: 'gated',      no: '6', name: 'Gated & compliance', blurb: 'Investor Relations built now and sealed, plus policies and the exhibition portal.' },
]

/* audience routes: who walks the site, and in what order */
export const ROUTES_BY_AUDIENCE = [
  { id: 'buyer',    name: 'The facility buyer', icon: 'factory', path: ['home', 'markets-hub', 'market', 'projects', 'project', 'contact'] },
  { id: 'talent',   name: 'The talent',         icon: 'people',  path: ['home', 'about', 'careers', 'contact'] },
  { id: 'listing',  name: 'The listing audience', icon: 'chart', path: ['home', 'about', 'esg', 'investors'] },
  { id: 'press',    name: 'The partner or press', icon: 'press', path: ['home', 'news', 'about', 'contact'] },
]

/* status: live = built, new = built in this phase, gated = built but sealed */
export const PAGES = [
  /* ---------- 01 Foundation ---------- */
  {
    id: 'home', group: 'foundation', label: 'Home', route: '/', icon: 'home', status: 'live',
    purpose: 'The flagship. Prove capability in one screen and route every audience to the right wing of the site.',
    /* Selected work (KIV, returns with real project images) and the careers teaser
       were removed on the client review of 19 Aug 2026 */
    blocks: ['Hero reel', 'Credibility strip', 'The delivery cycle', 'Industries', 'Pinned 3D showpiece', 'Newsroom teaser', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['about', 'services-hub', 'markets-hub', 'projects', 'news', 'careers', 'contact'],
  },
  {
    id: 'about', group: 'foundation', label: 'About the Group', route: '/about', icon: 'building', status: 'live',
    purpose: 'Who IAQ is, what it stands for, and the scale behind the claim. The hub for the company wing.',
    /* Business model, global presence, leadership (KIV) and scale were removed on the
       client review of 19 Aug 2026; corporate commitment was added in their place */
    blocks: ['Story', 'Timeline', 'Vision and mission', 'Core values', 'Safety', 'Corporate commitment', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['history', 'leadership', 'esg', 'global-presence', 'careers', 'projects', 'exhibition'],
  },
  {
    id: 'history', group: 'foundation', label: 'History of IAQ', route: '/about/history', icon: 'clock', status: 'new',
    purpose: 'The record since 1995. Proof that the company has compounded capability, decade after decade.',
    blocks: ['Era intro', 'Milestone timeline', 'Firsts and records', 'Where it points next'],
    cta: { label: 'See the projects', route: '/projects' },
    linksOut: ['about', 'projects', 'global-presence'],
  },
  {
    id: 'leadership', group: 'foundation', label: 'Board & Leadership', route: '/about/leadership', icon: 'people', status: 'new',
    purpose: 'The people accountable for delivery and for the listing. Governance made legible.',
    blocks: ['Board', 'Executive team', 'Governance note', 'Join us'],
    cta: { label: 'Join the team', route: '/careers' },
    linksOut: ['about', 'careers', 'investors'],
  },
  {
    id: 'esg', group: 'foundation', label: 'ESG Commitment', route: '/about/esg', icon: 'leaf', status: 'new',
    purpose: 'ESG as an operating standard: environment, people, governance, with the certifications that back it.',
    blocks: ['Commitment intro', 'Environment', 'Social and safety', 'Governance', 'Certifications', 'Reporting'],
    cta: { label: 'Contact us', route: '/contact' },
    linksOut: ['about', 'investors', 'policies', 'contact'],
  },
  {
    id: 'contact', group: 'foundation', label: 'Start a project', route: '/contact', icon: 'mail', status: 'live',
    purpose: 'Send a project, career or media enquiry, and it reaches the right team.',
    blocks: ['Intent router', 'RFQ form', 'Offices', 'Map', 'Hours'],
    cta: { label: 'Send the enquiry', route: '/contact' },
    linksOut: ['projects', 'careers', 'news'],
  },
  {
    id: 'shortlist', group: 'proof', label: 'Project shortlist', route: '/shortlist', icon: 'file', status: 'new',
    purpose: 'The projects you saved, ready to send to a colleague or attach to an enquiry.',
    blocks: ['Saved projects', 'Shareable link', 'Forward to a colleague', 'Attach to an enquiry'],
    cta: { label: 'Send the shortlist', route: '/contact' },
    linksOut: ['projects', 'contact'],
  },


  /* ---------- 02 What we do ---------- */
  {
    id: 'services-hub', group: 'capability', label: 'Services', route: '/services', icon: 'cycle', status: 'new',
    purpose: 'The six services of the delivery cycle, and the three business units the work is contracted through.',
    /* reordered on the client review of 19 Aug 2026: units first, the six stages
       merged into the interactive cycle diagram, enquiry last */
    blocks: ['Business units: EPC (EPCC / EPCM), Process Critical Utilities & Total Tool Installation Solutions, EFM', 'The cycle (six stages, interactive)', 'Proof strip', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['cap-epc', 'cap-pcu', 'cap-tool', 'cap-energy', 'svc-design', 'svc-procurement', 'svc-construction', 'svc-commissioning', 'svc-maintenance', 'markets-hub', 'projects', 'exhibition'],
  },
  {
    id: 'svc-design', group: 'capability', label: 'Engineering Design & Consultation', route: '/services/all#design', icon: 'compass', status: 'new',
    purpose: 'Concept to detailed design across CSA and MEP, where cost and compliance are decided.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-procurement', 'projects', 'contact'],
  },
  {
    id: 'svc-procurement', group: 'capability', label: 'Procurement', route: '/services/all#procurement', icon: 'crate', status: 'new',
    purpose: 'Tracked sourcing aligned to quality, budget and programme, with the supply chain held to the design intent.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-construction', 'projects', 'contact'],
  },
  {
    id: 'svc-construction', group: 'capability', label: 'Construction', route: '/services/all#construction', icon: 'crane', status: 'new',
    purpose: 'Delivery on live sites: programme, trades and safety held together to schedule and budget.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-commissioning', 'projects', 'contact'],
  },
  {
    id: 'svc-commissioning', group: 'capability', label: 'Testing & Commissioning', route: '/services/all#commissioning', icon: 'gauge', status: 'new',
    purpose: 'Proven performance before handover: classification testing, verification and validation for handover.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-maintenance', 'projects', 'contact'],
  },
  {
    id: 'svc-maintenance', group: 'capability', label: 'Maintenance', route: '/services/all#maintenance', icon: 'gear', status: 'new',
    purpose: 'Protecting the investment after handover, and feeding what is learned back into the next design.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Back to design'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-design', 'projects', 'contact'],
  },
  /* ---------- 02b the three business units ----------
     The delivery cycle above answers HOW the work runs. The three business units answer WHAT is being bought,
     which is the language IAQ's own capability statement and the client plan both use. A buyer
     arrives with one or the other in their head, so the hub carries both axes and they cross-link. */
  {
    id: 'cap-epc', group: 'capability', label: 'EPC', route: '/services/epc-construction', icon: 'crane', status: 'new',
    purpose: 'The turnkey model: one contract carrying design, engineering, procurement and construction, with single-point accountability.',
    blocks: ['What it is', 'The delivery sequence', 'Single-point accountability', 'Where it fits', 'Proof projects', 'Enquiry'],
    cta: { label: 'Discuss an EPC project', route: '/contact' },
    linksOut: ['services-hub', 'cap-pcu', 'markets-hub', 'projects', 'contact'],
  },
  {
    id: 'cap-pcu', group: 'capability', label: 'Process Critical Utilities', route: '/services/tool-installation', icon: 'flask', status: 'new',
    purpose: 'Specialty gases, chemicals, ultrapure water and exhaust: the utilities a production tool runs on.',
    blocks: ['What process critical utilities are', 'The systems', 'Standards', 'The delivery sequence', 'Proof projects', 'Enquiry'],
    cta: { label: 'Discuss a utilities scope', route: '/contact' },
    linksOut: ['services-hub', 'cap-tool', 'projects', 'contact'],
  },
  {
    id: 'cap-tool', group: 'capability', label: 'Total Tool Installation', route: '/services/tool-installation', icon: 'link', status: 'new',
    purpose: 'Tool hook-up end to end. Outside the industry nobody knows what hook-up means, so explaining it well is the differentiator.',
    blocks: ['What hook-up involves', 'The six steps', 'Why it is critical', 'Sector relevance', 'Proof projects', 'Enquiry'],
    cta: { label: 'Plan a tool hook-up', route: '/contact' },
    linksOut: ['services-hub', 'cap-pcu', 'mkt-semiconductor', 'projects', 'contact'],
  },
  {
    id: 'cap-energy', group: 'capability', label: 'EFM', route: '/services/energy-management', icon: 'gauge', status: 'new',
    purpose: 'Energy audits, retrofits and district cooling with no upfront cost, paid from the savings or a fixed cooling tariff.',
    blocks: ['The service list', 'The risk-free financing model', 'Audit to monitoring', 'Savings evidence', 'Proof projects', 'Enquiry'],
    cta: { label: 'Request an energy audit', route: '/contact' },
    linksOut: ['services-hub', 'mkt-district-cooling', 'projects', 'contact'],
  },


  /* ---------- 03 Who we serve ---------- */
  {
    id: 'markets-hub', group: 'markets', label: 'Markets', route: '/markets', icon: 'grid', status: 'new',
    purpose: 'Seven markets, one standard of clean. The page where a buyer self-identifies in one click.',
    blocks: ['Intro', 'Seven market cards', 'Standards strip', 'Proof strip', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['mkt-semiconductor', 'mkt-data-centre', 'mkt-ev-battery', 'mkt-photovoltaics', 'mkt-district-cooling', 'mkt-bio-lifescience', 'mkt-food-beverage', 'projects'],
  },
  ...[
    ['mkt-semiconductor',   'Semiconductor',              '/markets/semiconductor',    'chip',    'Semiconductor'],
    ['mkt-data-centre',     'Data Centre',                '/markets/data-centre',      'server',  'Data Centre'],
    ['mkt-ev-battery',      'EV Battery',                 '/markets/ev-battery',       'battery', 'EV Battery'],
    ['mkt-photovoltaics',   'Photovoltaics',              '/markets/photovoltaics',    'sun',     'Photovoltaics'],
    ['mkt-district-cooling','District Cooling & Heating', '/markets/district-cooling', 'snow',    'District Cooling & Heating'],
    ['mkt-bio-lifescience', 'Bio LifeScience',            '/markets/bio-lifescience',  'flask',   'Pharmaceuticals & Hospitals'],
    ['mkt-food-beverage',   'Food & Beverage',            '/markets/food-beverage',    'bottle',    'Food & Beverages'],
  ].map(([id, label, route, icon, filter]) => ({
    id, group: 'markets', label, route, icon, status: 'new', projectFilter: filter,
    purpose: `What a ${label} facility demands, how IAQ builds it, and the projects that prove it.`,
    blocks: ['Sector hero', 'What this market demands', 'How IAQ delivers it', 'Standards and classes', 'Proof projects', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    /* R1: straight into the registry pre-filtered to this market, no filter to touch */
    linksOut: ['markets-hub', 'services-hub', 'projects', 'contact'],
  })),

  /* ---------- 04 Proof ---------- */
  {
    id: 'projects', group: 'proof', label: 'Projects', route: '/projects', icon: 'folder', status: 'live',
    purpose: 'Every published project, findable by market, location, delivery model and cleanroom class.',
    blocks: ['Headband', 'Search', 'Filter console', 'Registry grid', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['project', 'markets-hub', 'contact', 'shortlist'],
  },
  {
    id: 'project', group: 'proof', label: 'Project detail', route: '/projects/:id', icon: 'file', status: 'live', dynamic: true,
    purpose: 'One project told properly: brief, scope, numbers, and where it sits in the record.',
    blocks: ['Hero', 'Chips', 'Brief', 'Scope', 'Figure', 'Stats', 'Sticky facts', 'Related work', 'Pager'],
    cta: { label: 'Start a project', route: '/contact' },
    /* R2: a project points back to its market and the capability that delivered it */
    linksOut: ['projects', 'markets-hub', 'services-hub', 'contact'],
  },
  {
    id: 'global-presence', group: 'proof', label: 'Global Presence', route: '/global-presence', icon: 'globe', status: 'new',
    purpose: 'Where IAQ has delivered and where it operates from. Reach as evidence.',
    blocks: ['Globe', 'Office list', 'Projects by country', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['projects', 'about', 'contact'],
  },

  /* ---------- 05 Momentum ---------- */
  {
    id: 'news', group: 'momentum', label: 'News & Insights', route: '/news', icon: 'press', status: 'new',
    purpose: 'Announcements, project milestones and awards from across the group.',
    blocks: ['Featured', 'Filter by tag', 'Article grid', 'Subscribe'],
    cta: { label: 'Contact us', route: '/contact' },
    linksOut: ['article', 'markets-hub', 'about', 'contact'],
  },
  {
    id: 'article', group: 'momentum', label: 'Article', route: '/news/:slug', icon: 'file', status: 'new', dynamic: true,
    purpose: 'One story, with the market and capability it belongs to linked underneath.',
    blocks: ['Header', 'Body', 'Related market', 'Related projects', 'More articles'],
    cta: { label: 'Contact us', route: '/contact' },
    linksOut: ['news', 'markets-hub', 'projects'],
  },
  {
    id: 'careers', group: 'momentum', label: 'Careers', route: '/careers', icon: 'people', status: 'live',
    /* 18 Sep (Bazil: "just have 2 sections, one is Careers, the other one is Culture. And it's just one
       page"): the culture section sits at the top of this page (#culture), the roles below (#roles). */
    purpose: 'One page, two sections: how IAQ works, then the open roles by department.',
    blocks: ['Culture (top section)', 'Headband', 'Filter console', 'Role list', 'Why IAQ', 'What the work is', 'How applying works', 'Enquiry'],
    cta: { label: 'Apply', route: '/careers#roles' },
    /* 'culture' added 14 Sep: the Careers page is to lead with culture (checklist pn7) */
    linksOut: ['about', 'leadership', 'contact', 'culture'],
  },
  {
    /* 14 Sep (client: "make a culture page", "share how IAQ looks like"). Benchmarked against four
       culture pages, see _reference/culture-benchmark.md.
       18 Sep: folded into the Careers page as its top section (Bazil: "just one page"). The id stays so
       byId('culture') and every linksOut still resolve; the route carries the section hash, and
       tools/sitemap.mjs leaves hash routes out of sitemap.xml. /careers/culture redirects here. */
    id: 'culture', group: 'momentum', label: 'Culture', route: '/careers#culture', icon: 'people', status: 'live',
    purpose: 'The top section of the Careers page: how IAQ works, keeps people safe and grows engineers, before a candidate reaches the role list.',
    blocks: ['Opening statement and figures', 'Origin, 1995', 'Six values on the record', 'Safety record', 'Where engineers start and grow', 'People by name'],
    cta: { label: 'See open roles', route: '/careers#roles' },
    linksOut: ['careers', 'esg', 'news', 'global-presence', 'contact'],
  },

  /* ---------- 06 Gated & compliance ---------- */
  {
    id: 'investors', group: 'gated', label: 'Investor Relations', route: '/investors', icon: 'chart', status: 'gated',
    purpose: 'Built now, sealed until listing day. Unindexed, unlinked from public nav, opened with one configuration change.',
    blocks: ['Gate', 'Announcements', 'Reports', 'Governance', 'Share information', 'IR contact'],
    cta: { label: 'IR enquiry', route: '/contact' },
    linksOut: ['esg', 'leadership', 'policies', 'contact'],
  },
  {
    id: 'policies', group: 'gated', label: 'Policies', route: '/policies', icon: 'shield', status: 'new',
    purpose: 'IAQ’s quality, safety, environment, privacy and whistleblowing policies in one place.',
    blocks: ['Policy index', 'Policy detail', 'Certifications', 'Contact'],
    cta: { label: 'Contact us', route: '/contact' },
    linksOut: ['esg', 'about', 'contact'],
  },
  {
    id: 'exhibition', group: 'gated', label: 'Digital Exhibition', route: '/exhibition', icon: 'cube', status: 'new',
    purpose: 'A guided walkthrough of IAQ capability for exhibitions and partner briefings.',
    blocks: ['Entry', 'Guided stops', 'Downloads', 'Enquiry'],
    cta: { label: 'Request access', route: '/contact' },
    linksOut: ['services-hub', 'projects', 'contact'],
  },
]

/* ---- derived helpers: the flow diagram and the orphan check both use these ---- */
export const byId = id => PAGES.find(p => p.id === id)
export const pagesInGroup = g => PAGES.filter(p => p.group === g)

/** every page that links TO the given page id (R5: nothing orphaned) */
export const linksInto = id => PAGES.filter(p => (p.linksOut || []).includes(id)).map(p => p.id)

/** pages with no inbound link at all, ignoring the homepage which is the root */
export const orphans = () => PAGES.filter(p => p.id !== 'home' && linksInto(p.id).length === 0).map(p => p.id)

export const NAV_PRIMARY = ['about', 'services-hub', 'markets-hub', 'projects', 'news', 'careers']
/* shortened on the client review of 19 Aug 2026: hubs only, the sub-pages are
   reachable from the nav dropdowns and each hub page */
/* Two columns only (28 Aug, client). The ten links split evenly rather than 3/3/4, so the
   pair reads as one balanced block instead of a ragged third column. */
export const FOOTER_COLUMNS = [
  { title: 'The Company', pages: ['about', 'esg', 'global-presence', 'careers', 'policies'] },
  { title: 'What we do', pages: ['services-hub', 'markets-hub', 'projects', 'news', 'contact'] },
]
