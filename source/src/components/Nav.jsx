import React, { useEffect, useRef, useState } from 'react'
import { LAUNCH } from '../lib/launch.js'
import * as SL from '../lib/shortlist.js'
import '../styles/shortlist.css'
import Icon from './FlowIcon.jsx'
/* 25 Sep: a route may carry a stage anchor (/services/all#design) since the six service pages became one; the router
   wants the hash apart from the pathname */
const toObj = (route, hash) => { const [pathname, h] = String(route || '').split('#'); return { pathname, hash: h ? '#' + h : (hash || '') } }
import MemberLogin from './MemberLogin.jsx'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { openSearch } from './UniversalSearch.jsx'
import { byId, pagesInGroup } from '../data/sitemap.js'
import { ROLES, LOCS } from '../data/roles.js'
/* the town, not the full address line, for the wing's sub lines */
const LOC_SHORT = { 'shah-alam': 'Shah Alam', penang: 'Penang' }

/* the two grouped wings get a dropdown, built from the sitemap so they can never drift */
const MODELS = ['cap-epc', 'cap-pcu', 'cap-tool', 'cap-energy']

const MENUS = [
  {
    /* About gets its own wing, per the client review (16:11). Prototype 3 rule
       (23 Aug): the dropdown separates the About PAGE into the sections the
       client listed, exactly those, and the removed blocks stay out of it. */
    hub: 'about', label: 'About',
    /* EXACTLY three items, per the client's own mock (WhatsApp, 24 Aug: "Yes 3 only"):
       Overview, History of IAQ, Corporate Commitment. Nothing else goes in here. */
    /* 15 Sep (Bazil: "this dropdown looks saddest compared to others"): the same SET shape as the other
       wings, a count header and red marks, still exactly the three items. */
    cols: [
      { head: 'About the Group', note: 'Who IAQ is, and the record behind it', kind: 'units', links: [
        /* 17 Sep (Bazil: "people need to know which is the main page and which are sub pages"):
           rows that are not their own page carry `section` and a tag instead of an arrow. Overview IS the
           About page, so it is tagged as the main page. */
        /* 30 Sep (client: "these should be different picture"): each row previews its own photograph. Overview keeps
           the headquarters (the panel's own photo, so no `img`), History the plant at dusk its page opens on, and
           Corporate Commitment the team on stage at MCIEA 2024 (events/mciea-2024-stage; not ev-mciea-award-6260, whose
           screen names a subsidiary and sits in the caption). */
        { label: 'Overview', hash: '', icon: 'building', sub: 'Who IAQ is, at a glance', section: true, tag: 'Main page', pitch: 'The group in one page: what it builds, where, and the scale behind the claim.' },
        { label: 'History of IAQ', hash: '', route: '/about/history', icon: 'clock', img: 'about-history', sub: 'The record since 1995', pitch: 'Thirty years to scale, from an indoor air quality specialist to a total facility solutions provider.' },
        { label: 'Corporate Commitment', hash: '', route: '/about/commitment', icon: 'file', img: 'about-commitment', sub: 'Policies, certificates, ISO and the awards', pitch: 'The policies IAQ signs its name to, and the certificates and awards that back them.' },
      ] },
    ],
  },
  {
    hub: 'services-hub', label: 'Services',
    /* 2 Sep (Bazil): ONE main services page and a page per service. The wing therefore
       lists the six services of the delivery cycle in order, the same six the homepage ring
       and the hub diagram show, and the hub itself sits in the lead panel. The three
       business units (EPC, EFM, Tools Hookup Solution) are contract types, not services:
       they stay on the hub as their own section and are reached from there. Until now the
       wing listed those three instead, so "Services" opened a contract-model page with a
       placeholder image and read as the wrong page. Markets carries no dropdown at all. */
    /* 10 Sep (client review, Nabilah): the three business units were unreachable from the menu
       ("it's like missing pages here, it's not even stated"). They take a second, titled column,
       so the six services and the three ways the work is bought read as two different lists. */
    /* 14 Sep (Bazil: "make sure this looks better in segregation in set", then "more visual and
       animation and interactive"). The two lists were two bare columns on one white surface, and
       the units column ran out after three rows, so it read as one list with a hole in it. Each
       list is now a SET with its own header (count, name, what it is): the six services are an
       ordered cycle with numbered stages and a six step track, the three units sit on their own
       tinted panel as photo cards. Hovering any row previews it in the lead panel. `img` names a
       560x640 crop in /assets/menu (the banners are 2560px, 200 to 700KB each); `pitch` is the
       page's own sitemap purpose, shortened, not new copy. */
    cols: [
      /* 17 Sep (client, arrows drawn between the two columns in the feedback deck, and on the
         Services page: "better to have 3 business unit on top of the page instead?"): the units
         come first in the menu now, the same order the page itself runs in. */
      /* 14 Sep (Bazil: "not clear enough"): the first thumbnails were centre crops of wide banners, so
         EPC showed a white display wall and hookup an empty room. Each unit now has a photograph that
         says what it is at a glance (a site under cranes, a chiller plant, a valve manifold piped into
         a tool), and the one-liners say what the unit does instead of how it is paid. */
      /* 18 Sep, evening (Bazil, on the wing: "remove the top one. put the 3 business unit in a group but
         segmentize them then at the bottom the 6 services as a group as well"). Two groups, stacked:
         the three units as one segmented group, each segment carrying what sits inside that unit (the
         two hookup pages are links; the contract models are chips, they have no page), then the six
         services as one numbered strip. Units first and large, services second and compact, so the
         ten destinations read as three choices with a cycle under them. */
      /* 22 Sep (Bazil, on the wing with the units across the top and the services in a strip under them:
         "this is supposed to have 3 columns only, the picture, the 3 units and the 6 services", "just 3 big
         buttons to click", "design it in such a way that they are cards", "the unit yes you can click each
         section", "even the service putting like this confuses", then: "im sure you had a look on the codex").
         Three columns: the photograph, the three units as three cards, the six services as one numbered
         list. Every section inside a unit is a link now (the contract models go to "Two ways to buy it" on
         the unit's page). And the wing says what the Codex says: a unit CARRIES services. Point at a unit and
         the list lights the services it always carries, marks the ones it carries when asked, and lets the
         rest go quiet. `core` and `ask` are data/codex.js UNITS, as indices into the six. */
      { head: 'Business units', kind: 'segs', links: [
        { label: 'EPC', sub: 'Builds the facility, under one contract.', route: '/services/epc-construction', icon: 'epcUnit', img: 'u-epc',
          pitch: 'One contract carrying design, procurement and construction, with single point accountability. Delivered as EPCC, or managed as EPCM.',
          full: 'Engineering, Procurement and Construction', core: [0, 1, 2, 3], ask: []   /* 25 Sep (Bazil): EPC carries design to commissioning */,
          subs: [{ label: 'EPCC', route: '/services/epc-construction', hash: '#un-models-h' }, { label: 'EPCM', route: '/services/epc-construction', hash: '#un-models-h' }] },
        /* 18 Sep, cross-check: IAQ's own name for unit 2 in the Discovery answers (A2.1), its website copy sheet, the
           questionnaire and Nabilah's 18 Sep message. "Total Tools Hookup Solution" is in none of them. */
        /* 22 Sep (Bazil: "no need so long and make it clean"): the short name, like the other two units, with the full
           name beside it */
        { label: 'PCU & TTI', full: 'Process Critical Utilities & Total Tool Installation', sub: 'Re-equips a live semiconductor fab.', route: '/services/tool-installation', icon: 'pcuUnit', img: 'u-hookup',
          pitch: 'Re-equips a live facility: utilities delivered to the tool, qualified and handed back. Bought on its own, or under EPC.',
          core: [0, 1, 2, 3, 5], ask: [4],
          subs: [{ label: 'Process Critical Utilities', route: '/services/tool-installation', hash: '#un-svc7-h' }, { label: 'Total Tool Installation', route: '/services/tool-installation' }] },   /* 25 Sep (Bazil: "3 sub pages business unit"): one page per unit; the utilities are a section of it */
        { label: 'EFM', sub: 'Runs and maintains it.', route: '/services/energy-management', icon: 'efmUnit', img: 'u-efm',
          pitch: 'A registered ESCO. IAQ funds and runs the energy upgrade and is paid from the savings, or supplies cooling under a tariff.',
          full: 'Energy Facility Management', core: [3, 4], ask: [0, 1, 2],
          subs: [{ label: 'Cooling as a Service', route: '/services/energy-management', hash: '#un-models-h' }, { label: 'Energy Performance Contracting', route: '/services/energy-management', hash: '#un-models-h' }] },
      ] },
      { head: 'Six services', kind: 'strip', links: [
        { label: 'Engineering Design',      route: '/services/all#design',            icon: 'compass', img: 'svc-design',     pitch: 'Concept to detailed design across CSA and MEP, where cost and compliance are decided.' },
        { label: 'Procurement',             route: '/services/all#procurement',       icon: 'crate',   img: 'svc-procure',    pitch: 'Tracked sourcing aligned to quality, budget and programme.' },
        { label: 'Construction',            route: '/services/all#construction',      icon: 'crane',   img: 'svc-construct',  pitch: 'Delivery on live sites: programme, trades and safety held together.' },
        { label: 'Testing & Commissioning', route: '/services/all#commissioning',     icon: 'gauge',   img: 'svc-commission', pitch: 'Proven performance before handover: classification testing and validation.' },
        { label: 'Maintenance',             route: '/services/all#maintenance',       icon: 'gear',    img: 'svc-maintain',   pitch: 'Protecting the investment after handover, and feeding it into the next design.' },
        { label: 'Tools Hookup',            route: '/services/tool-installation', icon: 'link',    img: 'svc-hookup',     pitch: 'Tool hook-up end to end, alongside production that keeps running.' },
      ] },
    ],
    /* `stack` left the wing on 22 Sep: the two groups sit side by side */
  },
  {
    /* main page + subs (24 Aug): the hub leads the menu, the seven sectors follow */
    hub: 'markets-hub', label: 'Markets',
    /* 14 Sep (Bazil: "list more structured and clear"): the photo tiles became a list with column
       heads, one row per market: photograph, red mark and name, what the market is measured by,
       and its class or specification. Both facts are the Markets hub table's own cells
       (pages/MarketsHub.jsx), copied here so the menu does not import a page. */
    cols: [{ head: 'Seven markets', note: 'Where IAQ builds', kind: 'mlist',
      pages: pagesInGroup('markets').filter(p => p.id !== 'markets-hub').map(p => p.id) }],
  },
  {
    /* 15 Sep (Bazil: "a dropdown for the careers that feels great"): two sets, the roles by department
       and Life at IAQ as photo cards into the Culture page.
       18 Sep (Bazil: "For the careers just have 2 sections, not all this: one is Careers, the other
       one is Culture. And it's just one page. The Culture is the top section of the website and the
       Careers is the bottom one, depending on which they click brings them to it."): the wing is
       EXACTLY the two sections of that one page, in page order, in the About wing's SET shape (one
       column, red marks). Both rows are sections, so the set carries no page count. The department
       filter rows and the Life at IAQ column are gone. #culture and #roles are landed by ScrollToTop
       (main.jsx) and scenes/careers.js. */
    hub: 'careers', label: 'Careers',
    /* 24 Sep (Bazil: "career should land here", on the roles banner): the trigger lands on the roles, not the page top */
    to: '/careers#roles',
    lead: { title: 'Careers', pitch: `${ROLES.length} roles open in engineering, project delivery, commercial and finance, in Shah Alam and Penang.`, cta: 'Open Careers' },
    cols: [
      { head: 'One page, two sections', note: 'Culture first, then the open roles', kind: 'units', links: [
        { label: 'Culture', route: '/careers', hash: '#culture', section: true, tag: 'Top of the page', icon: 'people', img: 'life-culture',
          sub: 'How the team works, the values, the safety record, where engineers grow',
          pitch: 'How the team works, the six values on the record, the safety record, and where engineers start and grow.' },
        { label: 'Careers', route: '/careers', hash: '#roles', section: true, tag: 'On the page', icon: 'grid',
          sub: `${ROLES.length} open roles, ${LOCS.map(([l]) => LOC_SHORT[l] || l).join(' and ')}`,
          pitch: 'Every current opening, filterable by location and department and searchable by role.' },
      ] },
    ],
  },
]

/* 2 Sep (Bazil): the lead panel needs a visual so people know it is a click. Each wing's
   panel carries a photograph behind a dark scrim and the whole panel is the link. */
const LEAD_BG = {
  /* 24 Sep (Bazil: "improve all the vertical visuals for each dropdown"): IAQ's own photographs, cropped for the panel
     (public/assets/menu/lead-*.webp, 720 x 1120): the headquarters from the air, the litho bay of a cleanroom IAQ built,
     a plant at dusk, the office. Then (Bazil: "empty room does not represent us", "we're more red and greyish"): the
     Services panel is IAQ's crew in a cleanroom IAQ built, graded towards grey so the panel reads grey, white and the red
     accents; the empty-room previews went back to their originals (red valves, the crane, the counter), only svc-design
     keeps IAQ's boardroom. Originals in _backups/menu-0924c. */
  about: '/assets/menu/lead-about.webp',
  'services-hub': '/assets/menu/lead-services.webp',
  'markets-hub': '/assets/menu/lead-markets.webp',
  careers: '/assets/menu/lead-careers.webp',
}

const LOGO = '/assets/iaq-logo.webp'
/* same wordmark with the registered mark in white: the black ® vanished against the
   dark hero while the nav was still transparent (Bazil, 25 Aug) */
const LOGO_DARK = '/assets/iaq-logo-dark.webp'
/* the pages under a hub, flattened from MENUS, for the phone drawer */
const subOf = hub => {
  const m = MENUS.find(x => x.hub === hub); if (!m) return []
  return m.cols.flatMap(c => [
    ...(c.links || []).map(l => ({ label: l.label, to: toObj(l.route || byId(m.hub).route, l.hash) })),
    ...(c.pages || []).map(id => { const p = byId(id); return { label: p.label, to: p.route } }),
  ])
}

/* the Markets hub table's cells for each market, verbatim (pages/MarketsHub.jsx MARKETS) */
const MKT_FACT = {
  'mkt-semiconductor':    { sub: 'Particle count',             spec: 'ISO 3 to 7' },
  'mkt-data-centre':      { sub: 'Uptime and thermal stability', spec: 'Hyperscale, by design' },
  'mkt-ev-battery':       { sub: 'Dew point',                  spec: 'Dry room' },
  'mkt-photovoltaics':    { sub: 'Process stability at scale', spec: 'ISO 6 to 8' },
  'mkt-district-cooling': { sub: 'Kilowatt hours',             spec: 'Chilled water, by contract' },
  'mkt-bio-lifescience':  { sub: 'GMP grade',                  spec: 'ISO 5 to 8, GMP' },
  'mkt-food-beverage':    { sub: 'Hygiene regime',             spec: 'Hygienic' },
}

/* lower-case the first letter unless the word is an acronym (GMP grade stays GMP) */
const lowerFirst = t => (/^[A-Z]{2}/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1))

/* one row shape for both kinds of column: hand-written links, and sitemap page ids. Market pages
   carry a preview by id, because their banners are already named after them. */
const rowsOf = (c, hub) => [
  ...(c.links || []).map(l => ({ ...l, key: l.label, to: toObj(l.route || byId(hub).route, l.hash) })),
  ...(c.pages || []).map(id => { const p = byId(id); return { key: id, label: p.label, icon: p.icon, to: p.route, img: id.startsWith('mkt-') ? id : undefined, ...(MKT_FACT[id] || {}), pitch: MKT_FACT[id] ? `Measured by ${lowerFirst(MKT_FACT[id].sub)}. Class or spec: ${MKT_FACT[id].spec}.` : undefined } }),
]

const DEPTHS = [-6.3, -5.6, -4.9, -4.2, -3.5, -2.8, -2.1, -1.4]

/* Keep a wing inside the viewport. Rects are compared only to rects: the desktop zoom makes
   clientWidth and getBoundingClientRect disagree, so never mix them. Two passes converge. */
function clampWing(el) {
  /* measured at the OPEN geometry (scale 1, no rise) with transitions off, so a wing clamped at rest
     still fits once it opens; at rest the panel is hidden, so this flash of state is never seen */
  const prevT = el.style.transform, prevTr = el.style.transition
  el.style.transition = 'none'
  el.style.transform = 'translate(-50%, 0) scale(1)'
  el.style.setProperty('--nm-shift', '0px')
  const gut = 16
  for (let pass = 0; pass < 3; pass++) {
    const r = el.getBoundingClientRect()
    const vw = document.documentElement.getBoundingClientRect().width
    let delta = 0
    if (r.left < gut) delta = gut - r.left
    else if (r.right > vw - gut) delta = (vw - gut) - r.right
    if (Math.abs(delta) < .5) break
    const ratio = el.offsetWidth ? r.width / el.offsetWidth : 1
    const cur = parseFloat(el.style.getPropertyValue('--nm-shift')) || 0
    el.style.setProperty('--nm-shift', (cur + delta / ratio).toFixed(1) + 'px')
  }
  el.style.transform = prevT
  void el.offsetWidth
  el.style.transition = prevTr
}

export default function Nav() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  /* 10 Sep audit: the three lead-panel photographs (961K) loaded with every page. They load the
     first time their wing opens. */
  const [seen, setSeen] = useState({})
  /* the row under the pointer, previewed in the lead panel: { hub, set, i }. Cleared when the
     pointer leaves the lists, so the panel is always the hub again by the time you reach it. */
  const [peek, setPeek] = useState(null)
  useEffect(() => { setPeek(null) }, [openMenu])
  useEffect(() => { if (openMenu) setSeen(s => (s[openMenu] ? s : { ...s, [openMenu]: true })) }, [openMenu])
  /* Keep an open wing inside the viewport. Measured rather than guessed, because the trigger's
     position depends on the nav's own centring, the :root zoom above 1025px, and the label widths,
     none of which a fixed offset can anticipate. */
  const megaRefs = useRef({})
  /* 15 Sep: the clamp ran only for the wing being opened, so a closed wing kept its full-size box
     wherever centring on its trigger put it. The Careers wing sits at the right end of the row, and
     its hidden panel ran 212px past the right edge at 1440, giving /about and /careers/culture a
     sideways scroll. Every wing is now clamped at rest, at its open geometry: on mount, once the fonts
     have loaded (label widths move the triggers), and on resize. Clamping on open is no longer needed,
     and skipping it keeps the open animation intact. */
  useEffect(() => {
    const all = () => Object.values(megaRefs.current).forEach(el => { if (el) clampWing(el) })
    all()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(all)
    const t = setTimeout(all, 600)
    window.addEventListener('resize', all)
    return () => { clearTimeout(t); window.removeEventListener('resize', all) }
  }, [])
  const openedY = useRef(0)

  useEffect(() => {
    const nav = navRef.current
    let lastY = window.scrollY || 0
    /* 3 Sep (Bazil: the news filter bar sat 75px down with cards showing through above it):
       the hide-on-scroll state lived ONLY on the nav element, so nothing else on the page could
       react to it. Every bar that pins under the nav reads `--sticktop`, which this mirrors:
       the nav is sticky at top:0 and merely TRANSFORMED out of view, so it keeps reserving its
       75px whether or not it is on screen. */
    const setOff = off => document.documentElement.classList.toggle('nav-off', off)
    const onScroll = () => {
      const y = window.scrollY
      if (y < 90) { nav.classList.remove('nav-hide', 'nav-float'); setOff(false) }
      else if (y > lastY + 5) { nav.classList.add('nav-hide'); nav.classList.remove('nav-float'); setOff(true) }
      else if (y < lastY - 5) { nav.classList.remove('nav-hide'); nav.classList.add('nav-float'); setOff(false) }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); document.documentElement.classList.remove('nav-off') }
  }, [])

  /* transparent over the homepage hero (23 Aug): the banner runs up behind the bar,
     which goes solid the moment the page scrolls */
  const { pathname } = useLocation()
  /* 25 Sep (Bazil: "the navigation bar should not be white, it should disappear like the homepage when we are at the top"):
     the services page opens on the dark facility map, so the bar runs clear over it too */
  const overlap = pathname === '/' || pathname === '/services'
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px')
    if (!overlap) return
    document.documentElement.classList.add('nav-under')
    const onScroll = () => nav.classList.toggle('nav-clear', (window.scrollY || 0) < 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      nav.classList.remove('nav-clear')
      document.documentElement.classList.remove('nav-under')
    }
  }, [overlap])

  useEffect(() => {
    if (!menuOpen) return
    openedY.current = window.scrollY
    const onKey = e => { if (e.key === 'Escape') setMenuOpen(false) }
    const onScroll = () => { if (Math.abs(window.scrollY - openedY.current) > 90) setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
  }, [menuOpen])

  const here = ({ isActive }) => (isActive ? 'here' : undefined)
  /* the prototype switcher lights its OWN current page. Web 1 was hard-coded .on, so it stayed lit
     while you were looking at Web 2. NavLink needs end on "/" or it matches every route. */
  const onHere = ({ isActive }) => (isActive ? 'on' : undefined)
  const close = () => setMenuOpen(false)

  return (
    <>
      {/* 9 Sep: the workspace bar lives in components/AdminBar.jsx now, one copy shared with
          every Brand Method build. The bar removed here was IAQ's own older 8-tab version:
          no Design tab, a red accent instead of the shared blue, and it is what made the bar
          look doubled. AdminBar publishes --tbh in its place. */}

      <nav className={'nav' + (menuOpen ? ' menu-open' : '') + (pathname.startsWith('/markets') ? ' nav-mkt' : '')} ref={navRef}><div className="nav-in">
        <Link className="wordmark" to="/"><span className="logo3d"><span className="logo3d-in">
          {DEPTHS.map(z => (
            <img key={z} className="ldepth" src={LOGO} alt="" aria-hidden="true" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <img className="lface" src={LOGO} alt="IAQ" />
          <img className="lface-dk" src={LOGO_DARK} alt="" aria-hidden="true" />
        </span></span></Link>
        <div className="nav-links">
          {/* 7 Aug decision: no Home tab, the logo is the way home. The Home 2 / About 2
              concept links left the main row for Prototype 3 (23 Aug): the final nav
              carries only the client's structure, and the concepts stay one click away
              in the admin prototype switcher above. */}
          {(() => { const wing = m => (
            <div className="nav-has" key={m.hub} data-hub={m.hub}
              onMouseEnter={() => setOpenMenu(m.hub)} onMouseLeave={() => setOpenMenu(null)}
              onKeyDown={e => { if (e.key === 'Escape') { setOpenMenu(null); e.currentTarget.querySelector('a').focus() } }}>
              <NavLink to={m.to || byId(m.hub).route} className={here}>{m.label}</NavLink>
              {/* the wing board, rebuilt to the exyte benchmark (24 Aug): the context
                  lives ONCE in a lead panel; the rows are clean icon + label, no
                  repeated descriptions */}
              <div className={'nav-mega' + (m.cols.length === 1 ? ' one' : ' wide') + (m.cols.some(c => c.kind) ? ' sets' : '') + (openMenu === m.hub ? ' open' : '')}
                   ref={el => { megaRefs.current[m.hub] = el }}>
                {/* the whole lead panel is the link to the hub: photograph, scrim, copy, cue.
                    The copy is spans, not a nested link, so the card is one anchor. */}
                {(() => {
                  /* what the lead panel is showing: the hub at rest, the hovered row on peek */
                  const pk = peek && peek.hub === m.hub ? peek : null
                  const col = pk ? m.cols[pk.set] : null
                  const row = pk ? rowsOf(col, m.hub)[pk.i] : null
                  const imgs = m.cols.flatMap(c => rowsOf(c, m.hub)).filter(r => r.img)
                  return (
                    <Link className={'nm-lead' + (row ? ' peek' : '')} data-hub={m.hub} to={byId(m.hub).route} onClick={() => setOpenMenu(null)}>
                      {seen[m.hub] && <img className={'nm-lead-bg' + (row && row.img ? '' : ' on')} src={LEAD_BG[m.hub]} alt="" aria-hidden="true" decoding="async" />}
                      {/* every preview is mounted once the wing has opened, so the swap is a crossfade
                          and never waits on the network mid hover */}
                      {seen[m.hub] && imgs.map(r => (
                        <img key={r.img} className={'nm-lead-bg nm-pv' + (row && row.img === r.img ? ' on' : '')} src={`/assets/menu/${r.img}.webp`} alt="" aria-hidden="true" decoding="async" />
                      ))}
                      <span className="nm-lead-scrim" aria-hidden="true" />
                      {/* keyed on the row, so the copy re-enters with its own small rise on every swap */}
                      <span className="nm-lead-copy" key={row ? row.label : 'hub'}>
                        {/* 22 Sep (Bazil: "why repeating icons"): the row beside it already carries the mark */}
                        {/* 17 Sep: the panel is the MAIN page; a hovered row says whether it is a sub page or a section */}
                        {/* 24 Sep (Bazil: "improve all the vertical visuals for each dropdown"): the mono eyebrow is gone; the link
                            under the copy says whether it opens a page or goes to a section */}
                        <b>{row ? row.label : (m.lead ? m.lead.title : byId(m.hub).label)}</b>
                        {(() => { const t = row ? (row.pitch || row.sub) : (m.lead ? m.lead.pitch : byId(m.hub).purpose.split('.')[0] + '.'); return t && <span className="nm-pitch">{t}</span> })()}
                      </span>
                      <span className="nm-open">{!row || (row.section && row.tag === 'Main page') ? (m.lead && m.lead.cta ? m.lead.cta : 'Open the page') : row.section ? 'Go to the section' : `Open ${row.label}`} <i aria-hidden="true">&rarr;</i></span>
                    </Link>
                  )
                })()}
                <div className={'nm-cols' + (m.cols.some(c => c.kind) ? ' sets' + (m.cols.length === 1 ? ' solo' : '') : '') + (m.stack ? ' stack' : '')} onMouseLeave={() => setPeek(null)}>
                  {m.cols.map((c, ci) => {
                    const rows = rowsOf(c, m.hub)
                    const lit = peek && peek.hub === m.hub && peek.set === ci ? peek.i : -1
                    /* 22 Sep: the unit under the pointer, which the six-service list answers to */
                    const pkCol = peek && peek.hub === m.hub ? m.cols[peek.set] : null
                    const unit = pkCol && pkCol.kind === 'segs' ? pkCol.links[peek.i] : null
                    const pk = ri => ({ onMouseEnter: () => setPeek({ hub: m.hub, set: ci, i: ri }), onFocus: () => setPeek({ hub: m.hub, set: ci, i: ri }) })
                    /* 18 Sep: the segmented group (the three business units) */
                    if (c.kind === 'segs') return (
                      <div className="nm-col nm-set nm-segs" key={ci} style={{ '--si': ci }}>
                        <span className="nm-gl">{c.head}</span>
                        <div className="nm-seg-grid">
                          {rows.map((r, ri) => (
                            <div className={'nm-seg' + (lit === ri ? ' lit' : '')} key={r.key} style={{ '--ri': ri }}>
                              <Link className="nm-seg-a" to={r.to} {...pk(ri)} onClick={() => setOpenMenu(null)}>
                                <i className="nm-ict" aria-hidden="true"><Icon name={r.icon} /></i>
                                {/* 25 Sep (Bazil: "short form should be at the bottom, full name as the title") */}
                                <span className="nm-seg-t"><em>{r.full || r.label}</em>{r.full && <b>{r.label}</b>}<small>{r.sub}</small></span>
                                <span className="nm-go" aria-hidden="true">&rarr;</span>
                              </Link>
                              <div className="nm-seg-sub">
                                {(r.subs || []).map(x => <Link key={x.label} to={toObj(x.route, x.hash)} {...pk(ri)} onClick={() => setOpenMenu(null)}>{x.label}</Link>)}
                                {(r.chips || []).map(x => <span key={x}>{x}</span>)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                    /* 18 Sep: the six services as one numbered strip */
                    if (c.kind === 'strip') return (
                      <div className="nm-col nm-set nm-strip" key={ci} style={{ '--si': ci }}>
                        <span className="nm-gl" key={unit ? unit.label : 'rest'}>{unit ? (unit.full ? `What ${unit.label} carries` : 'What this unit carries') : c.head}</span>
                        <div className="nm-strip-grid">
                          {rows.map((r, ri) => {
                            /* the unit in play, if the pointer is on one: its services light, the rest go quiet */
                            const st = !unit ? '' : unit.core.includes(ri) ? ' carried' : unit.ask.includes(ri) ? ' asked' : ' quiet'
                            return (
                              <Link key={r.key} to={r.to} className={'nm-st' + (lit === ri ? ' lit' : '') + st} style={{ '--ri': ri }} {...pk(ri)} onClick={() => setOpenMenu(null)}>
                                <span className="nm-st-n">{ri + 1}</span>
                                <i className="nm-ict s" aria-hidden="true"><Icon name={r.icon} /></i>
                                <em>{r.label}</em>
                                <span className="nm-st-k" aria-hidden="true">{st === ' asked' ? 'When asked' : ''}</span>
                                <span className="nm-go" aria-hidden="true">&rarr;</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                    return (
                    <div className={'nm-col' + (c.kind ? ' nm-set nm-' + c.kind + (c.kind === 'life' ? ' nm-units' : c.kind === 'roles' ? ' nm-cycle' : '') : '')} key={ci} style={{ '--si': ci }}>
                      {/* 18 Sep (Bazil, on the "2 sub pages · About the Group" block: "no need this kind of info at
                          the dropdown, please remove for all"): the set header, its page count and its note are
                          gone from every wing. The rows start the column. `head` stays in the data because the
                          lead panel's preview line reads it. */}
                      {/* 15 Sep (Bazil: "no need the 2 other column"): the markets list is mark and name only */}
                      <div className="nm-rows">
                        {rows.map((r, ri) => (
                          <Link key={r.key} to={r.to} style={{ '--ri': ri }}
                            className={((lit === ri ? 'lit' : '') + (c.kind === 'roles' && String(r.to).endsWith('#roles') ? ' nm-all' : '') + (r.section ? ' sec' : '')).trim() || undefined}
                            onMouseEnter={() => setPeek({ hub: m.hub, set: ci, i: ri })}
                            onFocus={() => setPeek({ hub: m.hub, set: ci, i: ri })}
                            onClick={() => setOpenMenu(null)}>
                            {/* 15 Sep (Bazil: "remove pictures, icons only; left part can have picture and icon"): rows carry
                                their red mark only; the row's photograph still swaps into the lead panel on hover */}
                            {!(c.kind === 'units' || c.kind === 'life' || c.kind === 'mlist') && <i aria-hidden="true"><Icon name={r.icon} /></i>}
                            {/* 18 Sep (Bazil: "make sure there is a separation and the icon is high end"): the mark is its
                                own tile at the head of the row, not a glyph inside the name */}
                            {(c.kind === 'units' || c.kind === 'life') && <i className="nm-ict" aria-hidden="true"><Icon name={r.icon} /></i>}
                            {c.kind === 'cycle' && <span className="nm-no" aria-hidden="true">{ri + 1}</span>}
                            {/* 14 Sep (Bazil: "where are the icons"): units and markets carry their mark as a red
                                square beside the name, not a badge lost on the photograph */}
                            <span className="nm-txt">
                              <em>{c.kind === 'mlist' && <i className="nm-sq" aria-hidden="true"><Icon name={r.icon} /></i>}{r.label}</em>
                              {(c.kind === 'units' || c.kind === 'life' || c.kind === 'roles') && r.sub && <small>{r.sub}</small>}
                            </span>
                            {c.kind === 'roles' && r.n != null && <span className="nm-cnt" aria-hidden="true">{r.n}</span>}
                            {/* 24 Sep (Bazil: "no need to put these 2 info here"): the section tags are gone; every row ends in the arrow */}
                            <span className="nm-go" aria-hidden="true">&rarr;</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          ); return <>{MENUS.filter(m => m.hub !== 'careers').map(wing)}
          <NavLink to="/projects" className={here}>Projects</NavLink>
          <NavLink to="/news" className={here}>News</NavLink>
          {/* 15 Sep: Careers keeps its place at the end of the row and opens its own wing */}
          {wing(MENUS.find(m => m.hub === 'careers'))}</> })()}
        </div>
        {/* search sits immediately beside the primary CTA, as one action cluster on the right */}
        <div className="nav-act">
          <button className="nav-search" type="button" aria-label="Search the site" title="Search ( / )" onClick={openSearch}>
            {/* 22 Sep (Bazil: "improve icon"): both action icons were 1px hairlines at 19px, thinner than
                the nav type beside them. Same 24 grid, 1.7 stroke, round joins, drawn to the same optical
                size as each other: the lens and the head are both 6.5 across. */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="butt" strokeLinejoin="miter"><circle cx="10.75" cy="10.75" r="6.5" /><path d="M20 20l-4.6-4.6" /></svg>
          </button>
          {/* member sign-in, beside the search icon (2 Sep, Bazil) */}
          {/* 15 Sep: the prototype CMS has one shared passcode in the bundle and no backend, so the public build carries no login */}
          {!LAUNCH && <MemberLogin />}
          <ShortlistLink />
          <Link className="cta" to="/contact">Start a project</Link>
        </div>
        <button className="nav-burger" type="button" aria-label="Menu" aria-expanded={menuOpen} aria-controls="navDrawer"
          onClick={() => setMenuOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true">
            <path className="bx-lid" d="M12 2.6 20.4 7.4 12 12.2 3.6 7.4z" />
            <path className="bx-body" d="M3.6 7.4v9.2L12 21.4l8.4-4.8V7.4M3.6 7.4 12 12.2l8.4-4.8M12 12.2v9.2" />
          </svg>
        </button>
      </div>
        <div className="nav-drawer" id="navDrawer">
          <span className="nd-k">Menu</span>
          {/* 10 Sep audit: on a phone the sub-pages (History, Leadership, the six services, the
              three business units, the seven markets, Global presence) were reachable only by
              landing on a hub first. Each hub now lists its pages under it, from the same MENUS. */}
          <Link to="/about" onClick={close}><span className="nn">1</span>About</Link>
          <div className="nd-sub">{subOf('about').map(l => <Link key={l.label} to={l.to} onClick={close}>{l.label}</Link>)}<Link to="/global-presence" onClick={close}>Global presence</Link></div>
          <Link to="/services" onClick={close}><span className="nn">2</span>Services</Link>
          <div className="nd-sub">{subOf('services-hub').map(l => <Link key={l.label} to={l.to} onClick={close}>{l.label}</Link>)}</div>
          <Link to="/markets" onClick={close}><span className="nn">3</span>Markets</Link>
          <div className="nd-sub">{subOf('markets-hub').map(l => <Link key={l.label} to={l.to} onClick={close}>{l.label}</Link>)}</div>
          <Link to="/projects" onClick={close}><span className="nn">4</span>Projects</Link>
          <Link to="/news" onClick={close}><span className="nn">5</span>News</Link>
          <Link to="/careers" onClick={close}><span className="nn">6</span>Careers</Link>
          <div className="nd-sub"><Link to="/careers#culture" onClick={close}>Culture</Link><Link to="/careers#roles" onClick={close}>Open roles</Link></div>
          {!LAUNCH && <Link to="/portal" onClick={close}><span className="nn">7</span>Staff login</Link>}
          <Link className="nd-cta" to="/contact" onClick={close}>Start a project</Link>
        </div></nav>
    </>
  )
}

/* The shortlist counter. Hidden until something is saved: an empty control on every page is
   clutter, and the feature has to be discovered from a project, not from the nav. */
function ShortlistLink() {
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    setN(SL.count())
    return SL.subscribe(ids => setN(ids.length))
  }, [])
  if (!n) return null
  return (
    <Link className="nav-sl" to="/shortlist" title="Your saved projects">
      Shortlist <span className="sl-count">{n}</span>
    </Link>
  )
}
