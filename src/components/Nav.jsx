import React, { useEffect, useRef, useState } from 'react'
import * as SL from '../lib/shortlist.js'
import '../styles/shortlist.css'
import Icon from './FlowIcon.jsx'
import { Link, NavLink } from 'react-router-dom'
import { openSearch } from './UniversalSearch.jsx'
import { byId, pagesInGroup } from '../data/sitemap.js'

/* the two grouped wings get a dropdown, built from the sitemap so they can never drift */
const CAP = pagesInGroup('capability').filter(p => p.id !== 'services-hub').map(p => p.id)
const MODELS = ['cap-epc', 'cap-pcu', 'cap-tool', 'cap-energy']

const MENUS = [
  {
    hub: 'services-hub', label: 'Services',
    /* two axes, named: what is being bought, and how the work runs. Nine links in one column is a
       scroll; the same nine split by the question they answer is a menu. */
    cols: [
      { k: 'What we deliver', pages: MODELS },
      { k: 'How we deliver it', pages: CAP.filter(id => !MODELS.includes(id)) },
    ],
  },
  {
    hub: 'markets-hub', label: 'Markets',
    cols: (() => {
      const all = pagesInGroup('markets').filter(p => p.id !== 'markets-hub').map(p => p.id)
      const half = Math.ceil(all.length / 2)
      return [{ k: 'Sectors', pages: all.slice(0, half) }, { k: '', pages: all.slice(half) }]
    })(),
  },
]

const LOGO = '/assets/iaq-logo.webp'
const DEPTHS = [-6.3, -5.6, -4.9, -4.2, -3.5, -2.8, -2.1, -1.4]

export default function Nav() {
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  /* Keep an open wing inside the viewport. Measured rather than guessed, because the trigger's
     position depends on the nav's own centring, the :root zoom above 1025px, and the label widths,
     none of which a fixed offset can anticipate. */
  const megaRefs = useRef({})
  useEffect(() => {
    if (!openMenu) return
    const el = megaRefs.current[openMenu]
    if (!el) return
    const clamp = () => {
      el.style.setProperty('--nm-shift', '0px')
      const r = el.getBoundingClientRect()
      /* clientWidth, not innerWidth: it excludes the scrollbar, which is what actually clips */
      const vw = document.documentElement.clientWidth
      const gut = 16
      let shift = 0
      if (r.left < gut) shift = gut - r.left
      else if (r.right > vw - gut) shift = (vw - gut) - r.right
      el.style.setProperty('--nm-shift', shift.toFixed(1) + 'px')
    }
    clamp()
    window.addEventListener('resize', clamp)
    return () => window.removeEventListener('resize', clamp)
  }, [openMenu])
  const openedY = useRef(0)

  useEffect(() => {
    const nav = navRef.current
    const tb = document.querySelector('.topbar')
    let lastY = window.scrollY || 0
    const onScroll = () => {
      const y = window.scrollY
      if (y < 90) { nav.classList.remove('nav-hide', 'nav-float'); tb && tb.classList.remove('tb-hide') }
      else if (y > lastY + 5) { nav.classList.add('nav-hide'); nav.classList.remove('nav-float'); tb && tb.classList.add('tb-hide') }
      else if (y < lastY - 5) { nav.classList.remove('nav-hide'); nav.classList.add('nav-float') }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <div className="topbar"><div className="topbar-in">
        <div className="wscrumb"><b>IAQ &middot; Website 1</b><span>Brand Method &middot; Admin Navigation</span></div>
        <nav className="wsw">
          <a href="audit.html"><i>00</i>Web Audit</a><a href="competitors.html"><i>01</i>Competitors</a><a href="plan.html"><i>02</i>Web Plan</a><NavLink to="/" end className={onHere}><i>03</i>Prototype Web 1</NavLink><NavLink to="/home2" className={onHere}><i>04</i>Prototype Web 2</NavLink><Link to="/portal"><i>05</i>CMS</Link>
        </nav>
      </div></div>

      <nav className={'nav' + (menuOpen ? ' menu-open' : '')} ref={navRef}><div className="nav-in">
        <Link className="wordmark" to="/"><span className="logo3d"><span className="logo3d-in">
          {DEPTHS.map(z => (
            <img key={z} className="ldepth" src={LOGO} alt="" aria-hidden="true" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <img className="lface" src={LOGO} alt="IAQ" />
        </span></span></Link>
        <div className="nav-links">
          {/* 7 Aug decision: no Home tab, the logo is the way home — still true for the SITE.
              Home 2 is here anyway, by request: while two homepage concepts are in review, the
              quickest way to compare them is one click from wherever you happen to be. It goes
              with the concept it points at. */}
          <NavLink to="/home2" className={here}>Home 2</NavLink>
          <NavLink to="/about" className={here}>About</NavLink>
          {MENUS.map(m => (
            <div className="nav-has" key={m.hub}
              onMouseEnter={() => setOpenMenu(m.hub)} onMouseLeave={() => setOpenMenu(null)}
              onKeyDown={e => { if (e.key === 'Escape') { setOpenMenu(null); e.currentTarget.querySelector('a').focus() } }}>
              <NavLink to={byId(m.hub).route} className={here}>{m.label}</NavLink>
              <div className={'nav-mega' + (openMenu === m.hub ? ' open' : '')}
                   ref={el => { megaRefs.current[m.hub] = el }}>
                <div className="nm-head">
                  <Link to={byId(m.hub).route} onClick={() => setOpenMenu(null)}>
                    <b>{byId(m.hub).label}</b>
                    <span>{byId(m.hub).purpose.split('.')[0]}.</span>
                  </Link>
                </div>
                <div className="nm-cols">
                  {m.cols.map((c, ci) => (
                    <div className="nm-col" key={ci}>
                      {c.k && <span className="nm-k">{c.k}</span>}
                      {c.pages.map(id => { const p = byId(id); return (
                        <Link key={id} to={p.route} onClick={() => setOpenMenu(null)}>
                          <i aria-hidden="true"><Icon name={p.icon} /></i>
                          <em><b>{p.label}</b><span>{p.purpose.split('.')[0]}.</span></em>
                        </Link>
                      )})}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <NavLink to="/projects" className={here}>Projects</NavLink>
          <NavLink to="/news" className={here}>News</NavLink>
          <NavLink to="/careers" className={here}>Careers</NavLink>
        </div>
        {/* search sits immediately beside the primary CTA, as one action cluster on the right */}
        <div className="nav-act">
          <button className="nav-search" type="button" aria-label="Search the site" title="Search ( / )" onClick={openSearch}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          </button>
          <ShortlistLink />
          <Link className="cta" to="/contact">Start a project</Link>
        </div>
        <button className="nav-burger" type="button" aria-label="Menu" aria-expanded={menuOpen} aria-controls="navDrawer"
          onClick={() => setMenuOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="bx-lid" d="M12 2.6 20.4 7.4 12 12.2 3.6 7.4z" />
            <path className="bx-body" d="M3.6 7.4v9.2L12 21.4l8.4-4.8V7.4M3.6 7.4 12 12.2l8.4-4.8M12 12.2v9.2" />
          </svg>
        </button>
      </div>
        <div className="nav-drawer" id="navDrawer">
          <span className="nd-k">Menu</span>
          <Link to="/about" onClick={close}><span className="nn">01</span>About</Link>
          <Link to="/services" onClick={close}><span className="nn">02</span>Services</Link>
          <Link to="/markets" onClick={close}><span className="nn">03</span>Markets</Link>
          <Link to="/projects" onClick={close}><span className="nn">04</span>Projects</Link>
          <Link to="/news" onClick={close}><span className="nn">05</span>News</Link>
          <Link to="/careers" onClick={close}><span className="nn">06</span>Careers</Link>
          <Link className="nd-cta" to="/contact" onClick={close}>Start a project →</Link>
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
