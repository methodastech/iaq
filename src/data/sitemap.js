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
  { id: 'foundation', no: '01', name: 'Foundation',  blurb: 'Who IAQ is. The pages every visitor passes through regardless of why they came.' },
  { id: 'capability', no: '02', name: 'What we do',  blurb: 'The capability sell. Disciplines and business models, told as diagrams rather than text.' },
  { id: 'markets',    no: '03', name: 'Who we serve', blurb: 'The seven markets. Each one a sector argument with its own proof.' },
  { id: 'proof',      no: '04', name: 'Proof',       blurb: 'The portfolio. Projects at launch, searchable, the strongest as full case studies.' },
  { id: 'momentum',   no: '05', name: 'Momentum',    blurb: 'Freshness and talent. The pages that keep the site alive between builds.' },
  { id: 'gated',      no: '06', name: 'Gated & compliance', blurb: 'Investor Relations built now and sealed, plus policies and the exhibition portal.' },
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
    blocks: ['Hero reel', 'Credibility strip', 'The delivery cycle', 'Industries', 'Pinned 3D showpiece', 'Selected work', 'Newsroom teaser', 'Careers teaser', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['about', 'services-hub', 'markets-hub', 'projects', 'news', 'careers', 'contact'],
  },
  {
    id: 'about', group: 'foundation', label: 'About the Group', route: '/about', icon: 'building', status: 'live',
    purpose: 'Who IAQ is, what it stands for, and the scale behind the claim. The hub for the company wing.',
    blocks: ['Story', 'Timeline', 'Vision and mission', 'Core values', 'Safety', 'Business model', 'Global presence', 'Leadership', 'Scale'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['history', 'leadership', 'esg', 'global-presence', 'careers', 'projects', 'exhibition'],
  },
  {
    id: 'history', group: 'foundation', label: 'History of IAQ', route: '/about/history', icon: 'clock', status: 'new',
    purpose: 'The record since 1994. Proof that the company has compounded capability, not just survived.',
    blocks: ['Era intro', 'Milestone timeline', 'Firsts and records', 'Where it points next'],
    cta: { label: 'See the work', route: '/projects' },
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
    id: 'esg', group: 'foundation', label: 'Corporate Commitment', route: '/about/esg', icon: 'leaf', status: 'new',
    purpose: 'ESG as an operating standard: environment, people, governance, with the certifications that back it.',
    blocks: ['Commitment intro', 'Environment', 'Social and safety', 'Governance', 'Certifications', 'Reporting'],
    cta: { label: 'Talk to us', route: '/contact' },
    linksOut: ['about', 'investors', 'policies', 'contact'],
  },
  {
    id: 'contact', group: 'foundation', label: 'Contact / RFQ', route: '/contact', icon: 'mail', status: 'live',
    purpose: 'One enquiry surface, routed by intent: project, career, media. Every page ends here.',
    blocks: ['Intent router', 'RFQ form', 'Offices', 'Map', 'Hours'],
    cta: { label: 'Send the enquiry', route: '/contact' },
    linksOut: ['projects', 'careers', 'news'],
  },
  {
    id: 'shortlist', group: 'proof', label: 'Project shortlist', route: '/shortlist', icon: 'file', status: 'new',
    purpose: 'Buying a facility is a committee decision, and the first visitor is rarely the one who signs. Saved projects become a link that can be forwarded, and attach themselves to the enquiry.',
    blocks: ['Saved projects', 'Shareable link', 'Forward to a colleague', 'Attach to an enquiry'],
    cta: { label: 'Send the shortlist', route: '/contact' },
    linksOut: ['projects', 'contact'],
  },


  /* ---------- 02 What we do ---------- */
  {
    id: 'services-hub', group: 'capability', label: 'Capabilities hub', route: '/services', icon: 'cycle', status: 'new',
    purpose: 'The whole delivery story on one page: six stages as one continuous cycle, plus the three business units the work is bought through.',
    blocks: ['The cycle', 'Six stages', 'Business units: EPC (EPCC / EPCM), EFM, Total Tools Hookup Solution', 'Proof strip', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['cap-epc', 'cap-pcu', 'cap-tool', 'cap-energy', 'svc-design', 'svc-procurement', 'svc-construction', 'svc-commissioning', 'svc-maintenance', 'markets-hub', 'projects', 'exhibition'],
  },
  {
    id: 'svc-design', group: 'capability', label: 'Engineering Design & Consultation', route: '/services/design', icon: 'compass', status: 'new',
    purpose: 'Concept to detailed design across CSA and MEP, where cost and compliance are actually decided.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-procurement', 'projects', 'contact'],
  },
  {
    id: 'svc-procurement', group: 'capability', label: 'Procurement', route: '/services/procurement', icon: 'crate', status: 'new',
    purpose: 'Tracked sourcing aligned to quality, budget and programme, with the supply chain held to the design intent.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-construction', 'projects', 'contact'],
  },
  {
    id: 'svc-construction', group: 'capability', label: 'Construction', route: '/services/construction', icon: 'crane', status: 'new',
    purpose: 'Delivery on live sites: programme, trades and safety held together to schedule and budget.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-commissioning', 'projects', 'contact'],
  },
  {
    id: 'svc-commissioning', group: 'capability', label: 'Testing & Commissioning', route: '/services/commissioning', icon: 'gauge', status: 'new',
    purpose: 'Proven performance before handover: classification testing, verification and validation for handover.',
    blocks: ['What it covers', 'Scope list', 'How it runs', 'Proof projects', 'Next stage'],
    cta: { label: 'Start a project', route: '/contact' },
    linksOut: ['services-hub', 'svc-maintenance', 'projects', 'contact'],
  },
  {
    id: 'svc-maintenance', group: 'capability', label: 'Maintenance', route: '/services/maintenance', icon: 'gear', status: 'new',
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
    id: 'cap-epc', group: 'capability', label: 'EPC & Construction', route: '/services/epc-construction', icon: 'crane', status: 'new',
    purpose: 'The turnkey model: one contract carrying design, engineering, procurement and construction, with single-point accountability.',
    blocks: ['What it is', 'The delivery sequence', 'Single-point accountability', 'Where it fits', 'Proof projects', 'Enquiry'],
    cta: { label: 'See the projects delivered this way', route: '/projects' },
    linksOut: ['services-hub', 'cap-pcu', 'markets-hub', 'projects', 'contact'],
  },
  {
    id: 'cap-pcu', group: 'capability', label: 'Process Critical Utilities', route: '/services/process-critical-utilities', icon: 'flask', status: 'new',
    purpose: 'Specialty gases, chemical delivery and process water: the utilities a tool cannot run without, explained plainly before they are sold.',
    blocks: ['What process critical utilities are', 'The systems', 'Standards', 'The delivery sequence', 'Proof projects', 'Enquiry'],
    cta: { label: 'See the reference projects', route: '/projects' },
    linksOut: ['services-hub', 'cap-tool', 'projects', 'contact'],
  },
  {
    id: 'cap-tool', group: 'capability', label: 'Total Tool Installation', route: '/services/tool-installation', icon: 'gear', status: 'new',
    purpose: 'Tool hook-up end to end. Outside the industry nobody knows what hook-up means, so explaining it well is the differentiator.',
    blocks: ['What hook-up involves', 'The six steps', 'Why it is critical', 'Sector relevance', 'Proof projects', 'Enquiry'],
    cta: { label: 'See the reference projects', route: '/projects' },
    linksOut: ['services-hub', 'cap-pcu', 'mkt-semiconductor', 'projects', 'contact'],
  },
  {
    id: 'cap-energy', group: 'capability', label: 'Energy Management', route: '/services/energy-management', icon: 'gauge', status: 'new',
    purpose: 'Audits, retrofits and district cooling, including the route where IAQ funds the works and is paid from the savings.',
    blocks: ['The service list', 'The risk-free financing model', 'Audit to monitoring', 'Savings evidence', 'Proof projects', 'Enquiry'],
    cta: { label: 'Request an energy audit', route: '/contact' },
    linksOut: ['services-hub', 'mkt-district-cooling', 'projects', 'contact'],
  },


  /* ---------- 03 Who we serve ---------- */
  {
    id: 'markets-hub', group: 'markets', label: 'Markets hub', route: '/markets', icon: 'grid', status: 'new',
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
    purpose: `The ${label} argument: what the environment demands, how IAQ builds it, and the projects that prove it.`,
    blocks: ['Sector hero', 'What this market demands', 'How IAQ delivers it', 'Standards and classes', 'Proof projects', 'Enquiry'],
    cta: { label: 'Start a project', route: '/contact' },
    /* R1: straight into the registry pre-filtered to this market, no filter to touch */
    linksOut: ['markets-hub', 'services-hub', 'projects', 'contact'],
  })),

  /* ---------- 04 Proof ---------- */
  {
    id: 'projects', group: 'proof', label: 'Projects · track record', route: '/projects', icon: 'folder', status: 'live',
    purpose: 'The tagged registry. Every project findable by market, location, model and cleanroom class.',
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
    purpose: 'Freshness. Tagged articles that feed the market pages and give the listing audience a pulse.',
    blocks: ['Featured', 'Filter by tag', 'Article grid', 'Subscribe'],
    cta: { label: 'Talk to us', route: '/contact' },
    linksOut: ['article', 'markets-hub', 'about', 'contact'],
  },
  {
    id: 'article', group: 'momentum', label: 'Article', route: '/news/:slug', icon: 'file', status: 'new', dynamic: true,
    purpose: 'One story, with the market and capability it belongs to linked underneath.',
    blocks: ['Header', 'Body', 'Related market', 'Related projects', 'More articles'],
    cta: { label: 'Talk to us', route: '/contact' },
    linksOut: ['news', 'markets-hub', 'projects'],
  },
  {
    id: 'careers', group: 'momentum', label: 'Careers', route: '/careers', icon: 'people', status: 'live',
    purpose: 'Talent. Open roles by department, with the reason to join stated before the list.',
    blocks: ['Headband', 'Why IAQ', 'Filter console', 'Role list', 'Apply', 'Enquiry'],
    cta: { label: 'Apply', route: '/careers' },
    linksOut: ['about', 'leadership', 'contact'],
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
    purpose: 'Quality, safety, environment, privacy and whistleblowing in one compliant place.',
    blocks: ['Policy index', 'Policy detail', 'Certifications', 'Contact'],
    cta: { label: 'Talk to us', route: '/contact' },
    linksOut: ['esg', 'about', 'contact'],
  },
  {
    id: 'exhibition', group: 'gated', label: 'Digital Exhibition', route: '/exhibition', icon: 'cube', status: 'new',
    purpose: 'The show-floor surface: a walkthrough of capability for events and partner briefings.',
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
export const FOOTER_COLUMNS = [
  { title: 'The Company', pages: ['about', 'history', 'leadership', 'esg', 'global-presence'] },
  { title: 'What we do', pages: ['services-hub', 'svc-design', 'svc-procurement', 'svc-construction', 'svc-commissioning', 'svc-maintenance'] },
  { title: 'Who we serve', pages: ['markets-hub', 'mkt-semiconductor', 'mkt-data-centre', 'mkt-ev-battery', 'mkt-photovoltaics', 'mkt-district-cooling', 'mkt-bio-lifescience', 'mkt-food-beverage'] },
  { title: 'Proof & more', pages: ['projects', 'news', 'careers', 'policies', 'contact'] },
]
