/* Per-page meta, for a single-page app.
   The pages already set document.title themselves, but the description, canonical and og:* tags
   were written once in index.html and then never changed, so every route shared the homepage's
   description and every shared link previewed as the homepage. Crawlers that execute JS read the
   live head, so updating it on navigation is what makes the per-page requirement real.
   Called from the shell on every route change; unknown routes fall back to the site default. */
const SITE = 'https://iaqtechnology.com'
const DEFAULT_IMG = '/assets/hero-campus.webp'

/* description per route. Keys are matched longest-first, so '/services/design' wins over '/services'. */
export const META = {
  '/': ['IAQ Technology: design, procurement, construction, commissioning and maintenance of cleanrooms and hi-tech facilities across Asia.', '/assets/hero-campus.webp'],
  '/about': ['A Malaysian cleanroom specialist since 1994, now a total facility solutions provider operating across eight countries.', '/assets/about-hero-dusk.webp'],
  '/about/history': ['Three decades of IAQ, from a 1994 indoor air quality workshop to a group delivering across eight countries.', '/assets/tl-2025-global.webp'],
  '/about/leadership': ['The people accountable for how IAQ designs, builds and maintains process-critical facilities.', '/assets/photo-team.webp'],
  '/about/esg': ['How IAQ measures safety, carbon and governance across the group.', '/assets/about-2013-energy.webp'],
  '/projects': ['Over 230 delivered projects across semiconductor, data centre, EV battery and life science facilities.', '/assets/photo-cleanroom.webp'],
  '/services': ['Engineering design, procurement, construction, testing and commissioning, and lifetime maintenance, delivered by one accountable team.', '/assets/ph-blueprint.webp'],
  '/services/design': ['Concept to detailed design across CSA and MEP for process-critical facilities.', '/assets/ph-blueprint.webp'],
  '/services/procurement': ['Specification, sourcing and delivery of long-lead process-critical equipment.', '/assets/ph-crane.webp'],
  '/services/construction': ['Cleanroom and hi-tech facility construction, self-delivered and supervised by IAQ.', '/assets/ph-crane.webp'],
  '/services/commissioning': ['Testing, balancing, validation and handover against the classification the facility was designed to.', '/assets/ph-digital.webp'],
  '/services/maintenance': ['Planned and reactive maintenance that carries a facility for its whole life.', '/assets/ph-boiler.webp'],
  '/services/epc-construction': ['The turnkey model: engineering, procurement, construction and commissioning under a single contract, with single-point accountability.', '/assets/ph-crane.webp'],
  '/services/process-critical-utilities': ['Specialty gases, chemical delivery, ultrapure water and process exhaust: the utilities a production tool cannot run without.', '/assets/ph-boiler.webp'],
  '/services/tool-installation': ['Total tool installation and hook-up: connecting production equipment precisely into the facility it sits in.', '/assets/ph-electrical.webp'],
  '/services/energy-management': ['Energy audits, retrofits and district cooling, funded by IAQ and paid from the savings achieved.', '/assets/about-2013-energy.webp'],
  '/shortlist': ['The projects you saved. Send the list to a colleague, or attach it to an enquiry.', '/assets/photo-cleanroom.webp'],
  '/markets': ['Seven industries, one standard of clean: semiconductor, data centre, EV battery, life science and more.', '/assets/industries/semiconductor.webp'],
  '/global-presence': ['Eight countries, one standard of clean. Where IAQ has offices and delivered work.', '/assets/tl-2025-global.webp'],
  '/portal': ['Staff sign-in for the IAQ CMS: newsroom, careers and the project registry.', '/assets/photo-team.webp'],
  '/careers': ['Engineering, project delivery and site roles across the IAQ group.', '/assets/photo-team.webp'],
  '/contact': ['Start a project with IAQ. Tell us the facility, the classification and the programme.', '/assets/contact-cleanroom.webp'],
  '/news': ['Announcements, project milestones and awards from across the IAQ group.', '/assets/photo-awards.webp'],
  '/exhibition': ['The IAQ digital exhibition portal.', '/assets/photo-opening.webp'],
  '/flow': ['The site framework: every page, its group, and the links between them.', '/assets/hero-campus.webp'],
  '/investors': ['Investor relations for IAQ Group.', '/assets/photo-opening.webp'],
  '/policies': ['Governance and corporate policies for IAQ Group.', '/assets/photo-opening.webp'],
}

/* The app runs on HashRouter, so a real page URL is /#/about, not /about. Emit the URL that
   actually resolves rather than the one we wish it had — a canonical pointing at /about would
   404 today. Moving to BrowserRouter is the real SEO fix and is flagged separately. */
const urlFor = p => SITE + '/#' + p

function put (sel, attr, key, val) {
  let el = document.head.querySelector(sel)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', val)
}

let _desc = '', _img = DEFAULT_IMG

export default function applyMeta (pathname) {
  const keys = Object.keys(META).sort((a, b) => b.length - a.length)
  const hit = keys.find(k => k === pathname || (k !== '/' && pathname.startsWith(k + '/'))) || '/'
  const [desc, img] = META[hit]
  const url = urlFor(pathname)
  /* the title is owned by the page component, whose effect runs AFTER this one, so reading it
     here would pick up the PREVIOUS page's title. Store what we need and let the observer below
     stamp the title-derived tags the moment the page actually sets it. */
  _desc = desc; _img = img || DEFAULT_IMG
  const title = document.title || 'IAQ Group'
  put('meta[name="description"]', 'name', 'description', desc)
  put('meta[property="og:title"]', 'property', 'og:title', title)
  put('meta[property="og:description"]', 'property', 'og:description', desc)
  put('meta[property="og:image"]', 'property', 'og:image', img || DEFAULT_IMG)
  put('meta[property="og:url"]', 'property', 'og:url', url)
  put('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  put('meta[name="twitter:description"]', 'name', 'twitter:description', desc)
  put('meta[name="twitter:image"]', 'name', 'twitter:image', img || DEFAULT_IMG)
  let c = document.head.querySelector('link[rel="canonical"]')
  if (!c) { c = document.createElement('link'); c.rel = 'canonical'; document.head.appendChild(c) }
  c.href = url
}

/* Keep og:title / twitter:title locked to whatever the page set document.title to. A MutationObserver
   is used rather than a timeout because pages are lazy() + Suspense, so there is no fixed moment by
   which the title is known to have landed. Runs once for the life of the document. */
export function watchTitle () {
  const el = document.head.querySelector('title')
  if (!el || typeof MutationObserver === 'undefined') return
  const sync = () => {
    const t = document.title || 'IAQ Group'
    put('meta[property="og:title"]', 'property', 'og:title', t)
    put('meta[name="twitter:title"]', 'name', 'twitter:title', t)
    if (_desc) {
      put('meta[name="description"]', 'name', 'description', _desc)
      put('meta[property="og:description"]', 'property', 'og:description', _desc)
      put('meta[name="twitter:description"]', 'name', 'twitter:description', _desc)
      put('meta[property="og:image"]', 'property', 'og:image', _img)
      put('meta[name="twitter:image"]', 'name', 'twitter:image', _img)
    }
  }
  new MutationObserver(sync).observe(el, { childList: true, characterData: true, subtree: true })
  sync()
}
