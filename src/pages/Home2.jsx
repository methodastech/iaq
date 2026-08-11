import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { NEWS } from '../data/news.js'
import '../styles/home2.css'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================================
   /home2 — the editorial homepage concept, built to the findrealestate design.

   Every section, transition and easing is carried over from that reference:
   the pinned hero that pushes into the building and clips it inside the
   wordmark, the scroll-linked environment crossfade, the chevron masks, the
   grey-to-black step emphasis, the magazine parallax spread, the rotating
   quote panel, the dark pinned three-row selector, the support card wall, the
   clip-path blog rows and the parallax closing frame.

   Three things are ours, not the reference's:
     · the navigation and footer are the site's own components;
     · every word is IAQ's, carried from the live homepage, the About page and
       the capabilities hub — no invented claims, and the newsroom rows link to
       the real registry rather than inventing article bodies, which do not
       exist in any supplied source;
     · the wordmark moment uses the real IAQ logo as an alpha mask instead of
       the reference's drawn letterforms.

   Class names are all h2- prefixed: the reference's names (.hero, .label,
   .pill, .step, .final) collide with the live site's stylesheets.

   The two pinned sections use a sticky child rather than ScrollTrigger's
   pin — pinning does not survive this project's Lenis + :root zoom setup.
   ========================================================================= */

const LOGO_MASK = {
  WebkitMaskImage: 'url(/assets/iaq-logo.webp)',
  maskImage: 'url(/assets/iaq-logo.webp)',
}

/* the six delivery stages, from the capabilities hub */
const STEPS = [
  { n: '01', lead: 'Design.', cont: 'Concept to detailed design across CSA and MEP, with expert advice through the development of the project.' },
  { n: '02', lead: 'Procure.', cont: 'Vendor qualification, long-lead equipment tracking, sourcing aligned to quality and budget.' },
  { n: '03', lead: 'Construct.', cont: 'EPCC and EPCM delivery, every trade coordinated, schedule and cost held to handover.' },
  { n: '04', lead: 'Commission.', cont: 'ISO cleanroom classification proven by test, and certified documentation for handover.' },
  { n: '05', lead: 'Maintain.', cont: 'Planned maintenance that protects asset lifespan, minimizes downtime and keeps facilities compliant.' },
  { n: '06', lead: 'Hook up.', cont: 'Tools connected to the facility, qualified, handed back to production — and the cycle begins again.' },
]

/* the three business units */
const UNITS = [
  { n: '01', title: 'EPC', to: '/services/epc-construction', img: '/assets/projects/prj-002.webp',
    copy: 'The build unit. It designs, procures and constructs mission-critical facilities and hands them over validated — bought as EPCC or EPCM.' },
  { n: '02', title: 'EFM', to: '/services/energy-management', img: '/assets/projects/prj-012.webp',
    copy: 'The unit that takes over when the facility goes live: planned maintenance, process-critical utilities operation and energy management.' },
  { n: '03', title: 'Hookup', to: '/services/tool-installation', img: '/assets/projects/prj-006.webp',
    copy: 'The unit that re-equips a live facility. Process critical utilities and total tool installation as one specialist package.' },
]

/* what the group holds itself to — all four quotes are IAQ's own */
const CREEDS = [
  { quote: 'To be a regional facility solutions provider with engineering excellence, facilitating technological innovation and advancement in quality of life.', name: 'The vision' },
  { quote: 'Providing innovative and sustainable facility and engineering solutions benefitting our clients and stakeholders, driven by our leadership, employees and partners globally.', name: 'The mission' },
  { quote: 'We firmly believe that all incidents are preventable, and that there is no task so important that it is worth endangering the health and wellbeing of our employees and partners.', name: 'Safety & ESH' },
  { quote: 'IAQ’s humble journey begins out of a small office, armed with little more than a blueprint and unrelenting spirit.', name: 'The founding, 1994' },
]

/* support beyond handover */
const SUPPORT = [
  { n: '01', title: 'Maintenance', to: '/services/maintenance', img: '/assets/photo-cleanroom.webp',
    copy: 'Planned preventive programmes, rapid breakdown response, and compliance across the lifecycle.' },
  { n: '02', title: 'Energy Management', to: '/services/energy-management', img: '/assets/about-2013-energy.webp',
    copy: 'Audits, retrofits and district cooling, including the route where IAQ funds the works and is paid from the savings.' },
  { n: '03', title: 'Process Critical Utilities', to: '/services/process-critical-utilities', img: '/assets/ph-electrical.webp',
    copy: 'Specialty gases, chemical delivery and process water: the utilities a tool cannot run without.' },
]

const NEWS_IMG = ['/assets/photo-team.webp', '/assets/photo-awards.webp', '/assets/tl-2025-global.webp']

const Arr = () => <span className="h2-arr" aria-hidden="true">&rarr;</span>

/* ---------------------------------------------------------------- hero */
function Hero() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const mm = gsap.matchMedia()

      mm.add({
        desktop: '(prefers-reduced-motion: no-preference) and (min-width: 900px)',
        mobile: '(prefers-reduced-motion: no-preference) and (max-width: 899px)',
        reduced: '(prefers-reduced-motion: reduce)',
      }, mmCtx => {
        const { desktop, reduced } = mmCtx.conditions

        if (reduced) {
          gsap.set(q('.h2-hero-outline'), { opacity: 1 })
          return
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        })

        /* camera pushes toward the building */
        tl.to([q('.h2-hero-zoom'), q('.h2-hero-zoom2')], {
          scale: desktop ? 1.35 : 1.22, yPercent: -8, transformOrigin: '50% 68%', duration: 0.28,
        }, 0)
          .to(q('.h2-hero-title'), { opacity: 0.22, duration: 0.2 }, 0.06)
          .to([q('.h2-hero-sub'), q('.h2-hero-cta')], { opacity: 0, y: -14, duration: 0.16 }, 0.06)

          /* the mark appears over the architecture */
          .fromTo(q('.h2-hero-outline'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.14 }, 0.3)

          /* the building is clipped into the letterforms */
          .to(q('.h2-hero-outline'), { opacity: 0, duration: 0.12 }, 0.5)
          .fromTo(q('.h2-hero-masked'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.46)
          .to(q('.h2-hero-zoom'), { opacity: 0, duration: 0.2 }, 0.5)
          .to(q('.h2-hero-title'), { opacity: 0, duration: 0.1 }, 0.5)
          .to(q('.h2-hero-whiteout'), { opacity: 0.55, duration: 0.22 }, 0.5)

          /* the mark floats in the clouds */
          .fromTo(q('.h2-hero-msub'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.62)
          .to(q('.h2-hero-masked'), { scale: 0.8, transformOrigin: '50% 45%', duration: 0.18 }, 0.68)

          /* release into the page */
          .to(q('.h2-hero-masked'), { yPercent: -6, opacity: 0, duration: 0.12 }, 0.88)
          .to(q('.h2-hero-whiteout'), { opacity: 1, duration: 0.12 }, 0.88)
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-hero" id="top" ref={root}>
      <div className="h2-hero-pin">
        <div className="h2-hero-sky" />
        <div className="h2-cloud h2-cloud-d" />
        <div className="h2-cloud h2-cloud-e" />

        <div className="h2-hero-stage">
          <div className="h2-hero-zoom">
            <img className="h2-hero-bld" src="/assets/hero-campus-dusk.webp"
                 alt="An IAQ facility at dusk" fetchpriority="high" />
          </div>

          <div className="h2-cloud h2-cloud-a" />
          <div className="h2-cloud h2-cloud-b" />
          <div className="h2-cloud h2-cloud-c" />

          {/* the mark, solid, over the architecture */}
          <div className="h2-hero-outline" aria-hidden="true">
            <span className="h2-hero-marksolid" style={LOGO_MASK} />
            <span className="h2-hero-osub">Total Facility Solutions</span>
          </div>

          {/* the building clipped inside the mark */}
          <div className="h2-hero-masked" aria-hidden="true">
            <div className="h2-hero-maskshape" style={LOGO_MASK}>
              <div className="h2-hero-zoom2">
                <img className="h2-hero-bld" src="/assets/hero-campus-dusk.webp" alt="" />
              </div>
            </div>
            <span className="h2-hero-msub">Total Facility Solutions</span>
          </div>
        </div>

        <div className="h2-hero-copy">
          <h1 className="h2-hero-title">We build the environments where the future is made</h1>
          <p className="h2-hero-sub">
            The end-to-end total solution provider for cleanrooms, dry rooms and hi-tech facilities.{' '}
            <span className="h2-muted">Engineered, procured, built, commissioned and maintained by one team, for 32 years.</span>
          </p>
          <Link to="/projects" className="h2-pill h2-pill-red h2-hero-cta">
            Explore 230+ projects <Arr />
          </Link>
        </div>

        <div className="h2-hero-whiteout" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------- why IAQ + cinema */
function WhyIaq() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(q('.h2-mask > *'), { yPercent: 105 }, {
        yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: q('.h2-why-grid'), start: 'top 78%' },
      })
      gsap.fromTo(q('.h2-label'), { opacity: 0.4 }, {
        opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: q('.h2-why-grid'), start: 'top 78%' },
      })

      const imgs = q('.h2-cinema img')
      gsap.set(imgs, { scale: 1.04 })
      gsap.set(imgs[0], { scale: 1 })

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: q('.h2-cinema'), start: 'top 85%', end: 'bottom -60%', scrub: true },
      })
        .fromTo(q('.h2-cinema'), { scale: 0.94 }, { scale: 1, duration: 0.3 }, 0)
        .to(imgs[1], { opacity: 1, scale: 1, duration: 0.28 }, 0.32)
        .to(imgs[2], { opacity: 1, scale: 1, duration: 0.28 }, 0.66)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-why" ref={root}>
      <div className="h2-why-grid">
        <span className="h2-label">Why IAQ</span>
        <h2 className="h2-xl h2-why-state">
          <span className="h2-mask">
            <span>
              IAQ began in 1994 with the air itself.{' '}
              <span className="h2-muted">
                Three decades on, we design, procure, build, commission and maintain the cleanest
                environments on earth — one team, accountable from first drawing to the life of the facility.
              </span>
            </span>
          </span>
        </h2>
      </div>

      <div className="h2-cinema">
        <img src="/assets/hero-campus-dusk.webp" alt="An IAQ facility at dusk" />
        <img src="/assets/photo-cleanroom.webp" alt="Cleanroom interior" />
        <img src="/assets/tl-2020-dryroom.webp" alt="Battery dry room" />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- chevrons */
function NotJust() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(q('.h2-chevron'), { scale: 0.78, y: 50, opacity: 0 }, {
        scale: 1, y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.07,
        scrollTrigger: { trigger: q('.h2-chevrons'), start: 'top 74%' },
      })
      gsap.fromTo(q('.h2-chevron img'), { xPercent: -5 }, {
        xPercent: 5, ease: 'none',
        scrollTrigger: { trigger: q('.h2-chevrons'), start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.fromTo(q('.h2-nj-copy'), { opacity: 0.4 }, {
        opacity: 1, duration: 0.9,
        scrollTrigger: { trigger: q('.h2-nj-copy'), start: 'top 82%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const imgs = [
    ['/assets/about-2015-robotics.webp', 'Robotics in a semiconductor facility'],
    ['/assets/photo-cleanroom.webp', 'Cleanroom interior'],
    ['/assets/about-2013-energy.webp', 'Energy plant works'],
    ['/assets/photo-team.webp', 'The IAQ team on site'],
  ]

  return (
    <section className="h2-nj" ref={root}>
      <h2 className="h2-nj-title">
        This isn’t just <span className="h2-muted">about cleanrooms.</span>
      </h2>

      <div className="h2-chevrons" aria-hidden="true">
        {imgs.map(([src, alt], i) => (
          <div className="h2-chevron" key={i}><img src={src} alt={alt} loading="lazy" /></div>
        ))}
      </div>

      <div className="h2-nj-copy">
        <p>A particle count. A dew point. A temperature that never moves.</p>
        <p>
          You are not commissioning a building.{' '}
          <span className="h2-muted">
            You are commissioning the conditions your product cannot be made without.
            That is what IAQ engineers.
          </span>
        </p>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- the six stages */
function Cycle() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(q('.h2-mask > *'), { yPercent: 105 }, {
        yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: q('.h2-rw-title'), start: 'top 80%' },
      })

      q('.h2-step').forEach(row => {
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: row, start: 'top 85%', end: 'bottom 25%', scrub: true },
        })
          .fromTo(row, { opacity: 0.45 }, { opacity: 1, duration: 0.4 })
          .fromTo(row.querySelector('.h2-step-lead'), { color: '#A8A8A4' }, { color: '#111312', duration: 0.4 }, 0)
          .to(row, { opacity: 1, duration: 0.25 })
          .to(row, { opacity: 0.7, duration: 0.35 })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-rw" id="cycle" ref={root}>
      <div className="h2-rw-grid">
        <div>
          <h2 className="h2-rw-title">
            <span className="h2-mask"><span>From blueprint</span></span>
            <span className="h2-mask"><span className="h2-muted">to handover.</span></span>
          </h2>
          <Link to="/services" className="h2-pill h2-pill-red h2-rw-cta">
            See the delivery cycle <Arr />
          </Link>
        </div>

        <div>
          <p className="h2-steps-label">Six stages, one accountable team:</p>
          {STEPS.map(s => (
            <div className="h2-step" key={s.n}>
              <span className="h2-step-n">{s.n}</span>
              <p className="h2-step-tx">
                <span className="h2-step-lead">{s.lead}</span>{' '}
                <span className="h2-step-cont">{s.cont}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- inside IAQ */
function Inside() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.fromTo(q('.h2-mask > *'), { yPercent: 105 }, {
        yPercent: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: q('.h2-ag-head'), start: 'top 78%' },
      })

      const drift = (sel, from, to) => gsap.fromTo(q(sel), { yPercent: from }, {
        yPercent: to, ease: 'none',
        scrollTrigger: { trigger: q('.h2-ag-comp'), start: 'top bottom', end: 'bottom top', scrub: true },
      })
      drift('.h2-ag-wide img', -2, 3)
      drift('.h2-ag-port img', 5, -4)
      drift('.h2-ag-aer img', -3, 2)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-ag" id="inside" ref={root}>
      <div className="h2-ag-head">
        <span className="h2-label">Inside IAQ</span>
        <h2 className="h2-ag-title">
          <span className="h2-mask">
            <span>One team. <span className="h2-muted">Accountable end to end.</span></span>
          </span>
        </h2>
      </div>

      <div className="h2-ag-comp">
        <div className="h2-ag-wide"><img src="/assets/photo-team.webp" alt="The IAQ team" loading="lazy" /></div>
        <div className="h2-ag-port"><img src="/assets/about-1994-workshop.webp" alt="The first workshop, 1994" loading="lazy" /></div>
        <div className="h2-ag-aer"><img src="/assets/hero-campus.webp" alt="An IAQ facility campus" loading="lazy" /></div>
      </div>

      <div className="h2-ag-copy">
        <p>
          Locally founded and still locally owned.{' '}
          <span className="h2-muted">
            The group has grown from a small office into a builder of hi-tech facilities across
            eight countries, with the same promise it started with: everybody goes home safe, and
            the room performs to specification. 450 people, more than 250 projects, and over a
            million square metres of cleanroom built.
          </span>
        </p>
        <Link to="/about" className="h2-pill h2-pill-red">Read the IAQ story <Arr /></Link>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- the creed */
function Creed() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const timer = useRef(null)

  const select = i => {
    if (i === index) return
    setFading(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { setIndex(i); setFading(false) }, 350)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const t = CREEDS[index]

  return (
    <section className="h2-testi">
      <h2 className="h2-testi-title">
        What the group <span className="h2-muted">holds itself to.</span>
      </h2>

      <div className="h2-testi-grid">
        <div className="h2-testi-img">
          <img src="/assets/photo-opening.webp" alt="The opening of a plant IAQ delivered" loading="lazy" />
        </div>

        <div className="h2-testi-panel">
          <div className="h2-testi-meta">
            <div className="h2-testi-dots" role="tablist" aria-label="What the group holds itself to">
              {CREEDS.map((c, i) => (
                <button key={c.name} role="tab" aria-selected={i === index} aria-label={c.name}
                        className={'h2-testi-dot' + (i === index ? ' is-active' : '')}
                        onClick={() => select(i)}>{i + 1}</button>
              ))}
            </div>
            <span className="h2-testi-mark" aria-hidden="true">&rdquo;</span>
          </div>

          <blockquote className={'h2-testi-quote' + (fading ? ' is-fading' : '')}>
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          <div className="h2-testi-who">
            <span>{t.name}</span>
            <span aria-hidden="true">/</span>
            <span className="h2-testi-src">IAQ Group</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------- dark: three business units */
function Units() {
  const root = useRef(null)
  const stuck = useRef(false)

  useEffect(() => {
    const rows = Array.from(root.current?.querySelectorAll('.h2-svc-row') ?? [])
    const activate = idx => rows.forEach((r, i) => r.classList.toggle('is-active', i === idx))

    const ctx = gsap.context(self => {
      const q = self.selector
      const mm = gsap.matchMedia()

      mm.add({
        desktop: '(prefers-reduced-motion: no-preference) and (min-width: 900px)',
        mobile: '(prefers-reduced-motion: no-preference) and (max-width: 899px)',
        reduced: '(prefers-reduced-motion: reduce)',
      }, mmCtx => {
        const { desktop, mobile } = mmCtx.conditions

        if (desktop) {
          let current = -1
          ScrollTrigger.create({
            trigger: q('.h2-svc-track'), start: 'top top', end: 'bottom bottom',
            onToggle(st) {
              stuck.current = st.isActive
              if (!st.isActive && st.progress <= 0) { current = -1; activate(-1) }
            },
            onUpdate(st) {
              const idx = Math.min(2, Math.floor(st.progress * 3))
              if (idx !== current) { current = idx; activate(idx) }
            },
          })
        }

        if (mobile) {
          rows.forEach((row, i) => ScrollTrigger.create({
            trigger: row, start: 'top 60%', end: 'bottom 40%',
            onToggle(st) { if (st.isActive) activate(i) },
          }))
        }
      })

      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(q('.h2-mask > *'), { yPercent: 105 }, {
          yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: q('.h2-svc-intro'), start: 'top 70%' },
        })
      }
    }, root)

    const handlers = rows.map((row, i) => {
      const fn = () => { if (!stuck.current) activate(i) }
      row.addEventListener('mouseenter', fn)
      return fn
    })

    return () => {
      rows.forEach((row, i) => row.removeEventListener('mouseenter', handlers[i]))
      ctx.revert()
    }
  }, [])

  return (
    <section className="h2-dark" data-dark ref={root}>
      <div className="h2-svc-intro">
        <span className="h2-label">The business units</span>
        <h2 className="h2-svc-intro-title">
          <span className="h2-mask"><span>Three units.</span></span>
          <span className="h2-mask"><span className="h2-muted">One accountable group.</span></span>
        </h2>
      </div>

      {/* sticky viewport: the track's height is the scroll runway */}
      <div className="h2-svc-track">
        <div className="h2-svc-pin">
          <div className="h2-svc">
            {UNITS.map(u => (
              <Link className="h2-svc-row" to={u.to} key={u.title}>
                <div className="h2-svc-bg"><img src={u.img} alt="" loading="lazy" /></div>
                <div className="h2-svc-in">
                  <div className="h2-svc-aside">
                    <span className="h2-svc-num">{u.n}</span>
                    <p className="h2-svc-copy">{u.copy}</p>
                  </div>
                  <span className="h2-svc-title">{u.title}</span>
                  <span className="h2-svc-arrow" aria-hidden="true">
                    <svg viewBox="0 0 150 24" fill="none">
                      <path d="M0 12 H146 M136 2 L148 12 L136 22" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="h2-dark-cta">
        <p className="h2-dark-cta-copy">
          One contract, one team, from feasibility to handover{' '}
          <span className="h2-muted">— and the whole life of the facility after it.</span>
        </p>
        <Link to="/contact" className="h2-pill h2-pill-red">Start a project <Arr /></Link>
      </div>
    </section>
  )
}

/* --------------------------------------------- dark: support beyond handover */
function Support() {
  return (
    <section className="h2-dark h2-support" data-dark id="support">
      <div className="h2-sp-head">
        <h2 className="h2-sp-title">
          Support<br />
          <span className="h2-muted">Beyond<br />Handover</span>
        </h2>

        <div className="h2-sp-copy">
          <p>
            A facility does not stop at handover.{' '}
            <span className="h2-muted">
              Protecting the investment afterwards is its own engineering — and what maintenance
              learns is what the next design uses.
            </span>
          </p>
          <Link to="/services" className="h2-pill h2-pill-red">Discover the capabilities <Arr /></Link>
        </div>
      </div>

      <div className="h2-sp-grid">
        {SUPPORT.map(card => (
          <Link className="h2-scard" to={card.to} key={card.n}>
            <img src={card.img} alt="" loading="lazy" />
            <div className="h2-scard-shade" />
            <div className="h2-scard-in">
              <h3 className="h2-scard-title">{card.title}</h3>
              <p className="h2-scard-para">{card.copy}</p>
              <span className="h2-pill h2-pill-outline h2-pill-sm h2-scard-cta">Learn more <Arr /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------------------- newsroom */
function Newsroom() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

      q('.h2-brow').forEach(row => {
        gsap.fromTo(row.querySelector('img'),
          { clipPath: 'inset(0 0 10% 0)', scale: 1.035 },
          { clipPath: 'inset(0% 0 0% 0)', scale: 1, ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 42%', scrub: true } })
        gsap.fromTo([row.querySelector('.h2-brow-body'), row.querySelector('.h2-brow-date')],
          { opacity: 0.5 },
          { opacity: 1, ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 50%', scrub: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-blog" id="news" ref={root}>
      <div className="h2-blog-head">
        <h2 className="h2-blog-title">
          Newsroom <span className="h2-muted">&amp;</span><br />
          <span className="h2-muted">Resources</span>
        </h2>
        <div className="h2-blog-lede">
          <p>What the group has been doing — on site, in the community, and across the eight countries it builds in.</p>
          <Link to="/news" className="h2-pill h2-pill-red">Visit the newsroom <Arr /></Link>
        </div>
      </div>

      <div>
        {NEWS.slice(0, 3).map((post, i) => (
          <article className="h2-brow" key={post.slug}>
            <span className="h2-brow-date">{post.date}</span>
            <div className="h2-brow-body">
              <h3 className="h2-brow-title">{post.title}</h3>
              <p className="h2-brow-copy">{post.tag} &middot; from the IAQ newsroom.</p>
              <Link to={`/news/${post.slug}`} className="h2-pill h2-pill-outline h2-pill-sm h2-brow-cta">
                Read more <Arr />
              </Link>
            </div>
            <div className="h2-brow-img">
              <img src={NEWS_IMG[i]} alt="" loading="lazy" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- final CTA */
function FinalCta() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(q('.h2-final-media img'), { yPercent: -3 }, {
        yPercent: 3, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-final" data-dark ref={root}>
      <div className="h2-final-media">
        <img src="/assets/contact-cleanroom.webp" alt="A finished IAQ cleanroom" loading="lazy" />
      </div>
      <div className="h2-final-in">
        <h2 className="h2-final-title">
          Tell us what you are building.{' '}
          <span className="h2-muted">We will engineer the environment around it.</span>
        </h2>
        <Link to="/contact" className="h2-pill h2-pill-red">Start a project <Arr /></Link>
      </div>
    </section>
  )
}

/* ============================================================== the page */
export default function Home2() {
  useEffect(() => {
    document.title = 'IAQ Group · Homepage Concept 2 · Brand Method'
    /* the pinned/scrubbed sections all measure on mount; one refresh after the
       lazy images settle keeps their start/end points honest */
    const id = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Nav />
      <main className="h2-page">
        <Hero />
        <WhyIaq />
        <NotJust />
        <Cycle />
        <Inside />
        <Creed />
        <Units />
        <Support />
        <Newsroom />
        <FinalCta />
      </main>
      <Footer note="Homepage concept 2 · Brand Method" />
    </>
  )
}
