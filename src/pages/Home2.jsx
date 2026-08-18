import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import NewsRail from '../components/NewsRail.jsx'
import ModelFigure from '../components/ModelFigure.jsx'
import {
  MarkYrs, MarkCtr, MarkIso, MarkInd, MarkPrj, MarkCln,
  MarkEpc, MarkPcu, MarkTol, MarkEnr,
} from '../components/Marks.jsx'
import { PROJECTS } from '../data/projects.js'
import '../styles/home2.css'
import '../styles/mark-motion.css'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================================
   /home2 — the LANDING PAGE (HOME) brief, built as the successor to the live
   iaqtechnology.com homepage. Section order, headlines and body copy are the
   client's copy deck, verbatim; nothing here invents a claim.

   WHAT MAKES IT THE BETTER PAGE, section by section, against the old one:

     old: a flat 2x3 table of red glyphs and numbers, no hierarchy
     new: the six real dimetric objects from the mark system, each with its own
          entry move — the cornerstone is SET, the seal is STAMPED, the plan
          opens its seven divisions. A number you watch arrive is a number you
          read.

     old: five service tiles as a static photo mosaic
     new: one depth rail. The six stages sit on a shared perspective and rotate
          out of the wall as they cross centre, so the sequence reads as a
          sequence rather than as a grid of equals.

     old: a single strip of seven industry photos, cropped to slivers
     new: seven cards on their own plane, each holding an over-scaled photo that
          tracks the scroll inside its frame — parallax as depth, not as drift.

   WHY THE 3D IS CSS AND NOT WebGL: the page already lives in a bundle where
   three.js is a lazy chunk owned by scenes/home.js, welded to that page's DOM
   ids. A second WebGL context here would cost a megabyte and a second render
   loop to say what a perspective and a translateZ already say. Every depth
   effect below is real 3D transform work on the compositor, and the six marks
   are genuine dimetric solids under one lamp. Nothing fakes depth with a
   drop shadow.

   Class names are all h2- prefixed: the reference names (.hero, .card, .step,
   .final) collide with the live site's stylesheets, which stay loaded once
   their route has been visited.

   The pinned section uses a sticky child rather than ScrollTrigger's pin —
   pinning does not survive this project's Lenis + :root zoom setup.
   ========================================================================= */

const Arr = () => <span className="h2-arr" aria-hidden="true">&rarr;</span>

/* the six milestones — the client's Company Snapshot counters, in their order */
const MILESTONES = [
  { M: MarkYrs, v: 32, lab: 'Years of technical excellence' },
  { M: MarkCtr, v: 8, lab: 'Countries with global presence' },
  { M: MarkIso, v: 3, lab: 'ISO certifications' },
  { M: MarkInd, v: 7, lab: 'Industries served' },
  { M: MarkPrj, v: 250, lab: 'Projects completed' },
  { M: MarkCln, v: 1000000, lab: 'm² cleanroom built' },
]

/* What We Do — the client's six items and their taglines. Item 6 arrived with an
   empty tagline cell, so it carries IAQ's own words for hookup from the
   capabilities hub rather than an invented line. */
const STAGES = [
  { n: '01', t: 'Engineering Design & Consultation', tag: 'Where Every Great Facility Begins',
    to: '/services/design', img: '/assets/ph-blueprint.webp' },
  { n: '02', t: 'Procurement', tag: 'The Right Materials, the Right Partners, Right on Time',
    to: '/services/procurement', img: '/assets/ph-digital.webp' },
  { n: '03', t: 'Construction', tag: 'Precision Engineering, Built to Exact Standards',
    to: '/services/construction', img: '/assets/ph-crane.webp' },
  { n: '04', t: 'Testing & Commissioning', tag: 'Proven Performance Before You Move In',
    to: '/services/commissioning', img: '/assets/ph-electrical.webp' },
  { n: '05', t: 'Maintenance', tag: 'Protecting Your Investment, Long After Handover',
    to: '/services/maintenance', img: '/assets/ph-boiler.webp' },
  { n: '06', t: 'Tools Hookup', tag: 'Tools connected, qualified, handed back to production',
    to: '/services/tool-installation', img: '/assets/about-2015-robotics.webp' },
]

/* Industries We Serve — the client's seven, each to its own market page.
   PHOTO RULE, and the reason these are not simply the seven matching registry shots: the registry
   carries client wordmarks on the building in prj-005 (MEMC) and prj-008 (SVOLT), which is the
   same confidentiality breach that put prj-001 and prj-012 behind a neutral frame. Neither appears
   here. Where a market has only one registry photograph and the Track Record rows below already
   spend it, the tile takes a house photograph instead — a market tile is a category, not a
   specific job, so it does not owe the reader a particular project. */
const INDS = [
  { t: 'Semiconductor', to: '/markets/semiconductor', img: '/assets/contact-cleanroom.webp' },
  { t: 'Data Centre', to: '/markets/data-centre', img: '/assets/film-backdrop.webp' },
  { t: 'EV Batteries', to: '/markets/ev-battery', img: '/assets/projects/prj-006.webp' },
  { t: 'Photovoltaics', to: '/markets/photovoltaics', img: '/assets/projects/prj-018.webp' },
  { t: 'Pharmaceuticals', to: '/markets/bio-lifescience', img: '/assets/projects/prj-011.webp' },
  { t: 'District Cooling & Heating', to: '/markets/district-cooling', img: '/assets/projects/prj-013.webp' },
  { t: 'Food and Beverages', to: '/markets/food-beverage', img: '/assets/projects/prj-016.webp' },
]

/* Our Business Model — the headline says four and the site carries four routes,
   so the brief's bundled item 2 is shown as the two it names. */
const MODELS = [
  { n: '01', t: 'EPC', to: '/services/epc-construction', M: MarkEpc, k: 'epc',
    copy: 'Engineering, Procurement & Construction for full turnkey delivery under one accountable team.' },
  { n: '02', t: 'Process Critical Utilities', to: '/services/process-critical-utilities', M: MarkPcu, k: 'pcu',
    copy: 'The specialized systems a production line cannot run without: specialty gases, chemical delivery and process water.' },
  { n: '03', t: 'Total Tool Installation', to: '/services/tool-installation', M: MarkTol, k: 'tol',
    copy: 'The equipment hook-up that brings a facility’s production line to life, qualified and handed back to production.' },
  { n: '04', t: 'Energy Management', to: '/services/energy-management', M: MarkEnr, k: 'enr',
    copy: 'Ongoing, risk-managed optimization of a facility’s energy performance long after handover.' },
]

/* Track Record — the client's three showcase markets, drawn from the real registry */
const SHOWCASE = [
  { k: 'Semiconductor', p: PROJECTS[2] },
  { k: 'Data Centre', p: PROJECTS[16] },
  { k: 'EV Batteries', p: PROJECTS[6] },
]

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/* THE HERO FOOTAGE. One clip, not the four-way rotation the other concept runs: this hero already
   moves — three planes separating on scroll and a few degrees of yaw under the pointer — and a
   crossfading reel on top of that is two ideas competing for the same second of attention.
   The poster is cut from frame zero of this exact clip, so the handover from still to footage has
   no seam. It is also what ships to everyone who never gets the video. */
const HERO_CLIP = '/assets/videos/hero-plant.mp4'
const HERO_POSTER = '/assets/hero-plant-poster.webp'

/* ------------------------------------------------------------------- hero
   Four planes on one perspective: sky, skyline, the facility, and the copy.
   Scroll drives them apart at different rates, which is what depth IS — the
   near plane must travel further than the far one or the whole thing is a
   photograph sliding upward. */
function Hero() {
  const root = useRef(null)
  const vid = useRef(null)

  /* THE FOOTAGE IS AN UPGRADE, NEVER A REQUIREMENT. The <video> ships with no src at all, so a
     visitor who will not be shown it never spends a byte on it: reduced motion, data-saver, or a
     browser that refuses the format. It fades in only once the element reports it is genuinely
     PLAYING — not on canplay, which lies often enough to leave a black rectangle over the poster. */
  useEffect(() => {
    const v = vid.current
    if (!v || still()) return
    if (navigator.connection && navigator.connection.saveData) return

    let dead = false
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}) }
    const onPlaying = () => { if (!dead) v.classList.add('is-live') }
    const onError = () => { dead = true; v.classList.remove('is-live') }
    /* iOS low-power mode and some tab-restore paths drop a playing video back to paused */
    const onPause = () => { if (!dead) play() }

    v.addEventListener('playing', onPlaying)
    v.addEventListener('error', onError)
    v.addEventListener('pause', onPause)
    v.preload = 'auto'
    v.src = HERO_CLIP
    play()

    return () => {
      dead = true
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('error', onError)
      v.removeEventListener('pause', onPause)
      v.pause()
      /* drop the buffer on unmount: a 2 MB clip held by a detached element outlives the route */
      v.removeAttribute('src')
      v.load()
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      /* the entrance: lines rise out of their own masks, then the furniture */
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(q('.h2-hl > span'), { yPercent: 108 }, { yPercent: 0, duration: 1.05, stagger: .09 }, .15)
        .fromTo(q('.h2-hero-sub'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8 }, .55)
        .fromTo(q('.h2-hero-ctas > *'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .08 }, .68)
        .fromTo(q('.h2-hero-scroll'), { opacity: 0 }, { opacity: 1, duration: .6 }, .95)

      /* the departure, scrubbed: near planes outrun far ones */
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .6 },
      })
        .to(q('.h2-hero-sky'), { yPercent: 12, scale: 1.06 }, 0)
        .to(q('.h2-hero-far'), { yPercent: 26 }, 0)
        .to(q('.h2-hero-near'), { yPercent: 52, scale: 1.1 }, 0)
        .to(q('.h2-hero-copy'), { yPercent: 74, opacity: 0 }, 0)
        .to(q('.h2-hero-veil'), { opacity: 1 }, 0)

      /* pointer parallax, desktop only: the planes are already separated in Z,
         so a few degrees of yaw is enough and anything more reads as a gimmick */
      const mm = gsap.matchMedia()
      mm.add('(min-width: 900px) and (pointer: fine)', () => {
        const stage = q('.h2-hero-stage')[0]
        const xTo = gsap.quickTo(q('.h2-hero-planes'), 'rotationY', { duration: .9, ease: 'power3' })
        const yTo = gsap.quickTo(q('.h2-hero-planes'), 'rotationX', { duration: .9, ease: 'power3' })
        const move = e => {
          const r = stage.getBoundingClientRect()
          xTo(((e.clientX - r.left) / r.width - .5) * 7)
          yTo(((e.clientY - r.top) / r.height - .5) * -4)
        }
        stage.addEventListener('pointermove', move)
        return () => stage.removeEventListener('pointermove', move)
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-hero" id="top" ref={root}>
      <div className="h2-hero-stage">
        <div className="h2-hero-planes">
          <div className="h2-hero-sky" aria-hidden="true" />
          <div className="h2-hero-far" aria-hidden="true">
            <img src="/assets/hero-campus.webp" alt="" />
          </div>
          <div className="h2-hero-near">
            <img src={HERO_POSTER}
                 alt="An IAQ facility under construction at dusk" fetchPriority="high" />
            <video ref={vid} className="h2-hero-vid" muted playsInline loop
                   preload="none" tabIndex={-1} aria-hidden="true" />
          </div>
        </div>
        <div className="h2-hero-veil" aria-hidden="true" />
      </div>

      <div className="h2-hero-copy">
        <h1 className="h2-hero-title" aria-label="Your Total Facility Solutions Provider">
          <span className="h2-hl" aria-hidden="true"><span>Your Total Facility</span></span>
          <span className="h2-hl" aria-hidden="true"><span><em>Solutions Provider</em></span></span>
        </h1>
        <p className="h2-hero-sub">
          Engineering Precision. <span className="h2-muted">Where hi-tech industries build with confidence.</span>
        </p>
        <div className="h2-hero-ctas">
          <Link to="/services" className="h2-pill h2-pill-red">Explore Our Services <Arr /></Link>
          <Link to="/contact" className="h2-pill h2-pill-ghost">Get in Touch</Link>
        </div>
      </div>

      <div className="h2-hero-scroll" aria-hidden="true"><i />Scroll</div>
    </section>
  )
}

/* -------------------------------------------------------- company snapshot */
function Snapshot() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const grid = q('.h2-ms')[0]

      /* THE COUNTERS run whether or not motion is allowed — a number that never
         arrives at its value is a broken number, not a calm one. */
      const runCount = el => {
        const end = +el.dataset.count
        if (still()) { el.textContent = end.toLocaleString('en-US'); return }
        gsap.to({ v: 0 }, {
          v: end, duration: 1.5, ease: 'power2.out',
          onUpdate () { el.textContent = Math.round(this.targets()[0].v).toLocaleString('en-US') },
        })
      }

      ScrollTrigger.create({
        trigger: grid, start: 'top 82%', once: true,
        onEnter: () => {
          /* one class, and the six marks run their own choreographies off --mk-d */
          grid.classList.add('mk-in')
          q('[data-count]').forEach(runCount)
        },
      })

      if (still()) return
      gsap.fromTo(q('.h2-ms-cell'), { y: 22, opacity: 0 }, {
        y: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .075,
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      })
      gsap.fromTo(q('.h2-snap-rule'), { scaleX: 0 }, {
        scaleX: 1, duration: 1.1, ease: 'power3.inOut',
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-snap" id="snapshot" ref={root}>
      <div className="h2-wrap">
        <div className="h2-head">
          <h2 className="h2-xl">Milestones That <em>Define Us</em></h2>
        </div>
        <div className="h2-snap-rule" aria-hidden="true" />

        <div className="h2-ms mk-stage">
          {MILESTONES.map(({ M, v, lab }) => (
            <div className="h2-ms-cell" key={lab}>
              <M className="h2-ms-mark" />
              <div className="h2-ms-txt">
                <div className="h2-ms-num"><span data-count={v}>0</span></div>
                <div className="h2-ms-lab">{lab}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- what we do
   FULL-WIDTH EDITORIAL ROWS, one per service, replacing the card rail. A card
   grid makes six equals; a stacked run of rows makes a SEQUENCE, which is what
   "blueprint to handover" actually is. The picture changes sides each row so the
   eye is handed across the page instead of marched down one gutter.

   The reveal, per row: the red rule draws across first, the number slides up out
   of its own mask, the title and tagline follow, and the photograph WIPES open
   toward its own side of the page — a clip-path reveal, so the image is
   uncovered in place rather than arriving from somewhere. */
function WhatWeDo() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      q('.h2-svc').forEach(row => {
        const flip = row.classList.contains('h2-svc-flip')
        const at = { trigger: row, start: 'top 78%', once: true }

        /* the rule leads, and it grows out of the text side */
        gsap.fromTo(row.querySelector('.h2-svc-rule'), { scaleX: 0 }, {
          scaleX: 1, duration: 1.05, ease: 'power3.inOut', scrollTrigger: at,
        })
        /* the number rises out of its own mask */
        gsap.fromTo(row.querySelector('.h2-svc-n > span'), { yPercent: 115 }, {
          yPercent: 0, duration: .85, ease: 'power3.out', delay: .12, scrollTrigger: at,
        })
        gsap.fromTo(row.querySelectorAll('.h2-svc-body h3, .h2-svc-body p, .h2-svc-go'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .09, delay: .18, scrollTrigger: at })
        /* the wipe travels toward the picture's own side of the page */
        gsap.fromTo(row.querySelector('.h2-svc-media'),
          { clipPath: flip ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0%)', duration: 1.15, ease: 'power4.inOut', delay: .1, scrollTrigger: at })
        /* in-frame parallax, same overscan contract as the rest of the page */
        gsap.fromTo(row.querySelector('.h2-svc-media img'), { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: .7 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-do" id="what-we-do" ref={root}>
      <div className="h2-wrap h2-do-head">
        <div className="h2-head">
          <h2 className="h2-xl">From Blueprint to Handover, <em>and Beyond</em></h2>
        </div>
        <Link to="/services" className="h2-pill h2-pill-ghost h2-do-cta">See How We Work <Arr /></Link>
      </div>

      <div className="h2-wrap h2-svcs">
        {STAGES.map((s, i) => (
          <Link className={'h2-svc' + (i % 2 ? ' h2-svc-flip' : '')} to={s.to} key={s.n}>
            <i className="h2-svc-rule" aria-hidden="true" />
            <div className="h2-svc-grid">
              <div className="h2-svc-body">
                <span className="h2-svc-n" aria-hidden="true"><span>{s.n}</span></span>
                <h3>{s.t}</h3>
                <p>{s.tag}</p>
                <span className="h2-svc-go">Explore <Arr /></span>
              </div>
              <figure className="h2-svc-media">
                <img src={s.img} alt="" loading="lazy" />
              </figure>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* --------------------------------------------------------- industries grid
   Each card holds an over-scaled photograph that travels inside its own frame
   at a fraction of the page's rate. The frame is the window; the picture moves
   behind it. That is parallax used as depth rather than as drift. */
function Industries() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      gsap.fromTo(q('.h2-ind-card'), { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .06,
        scrollTrigger: { trigger: q('.h2-ind-grid')[0], start: 'top 82%', once: true },
      })

      q('.h2-ind-card').forEach(card => {
        gsap.fromTo(card.querySelector('img'), { yPercent: -9 }, {
          yPercent: 9, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: .5 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-ind" id="industries" ref={root}>
      <div className="h2-wrap">
        <div className="h2-head">
          <h2 className="h2-xl">Built for Hi-Tech. <em>Engineered for Precision.</em></h2>
        </div>
        <div className="h2-ind-grid">
          {INDS.map(i => (
            <Link className="h2-ind-card" to={i.to} key={i.t}>
              <div className="h2-ind-media"><img src={i.img} alt="" loading="lazy" /></div>
              <div className="h2-ind-scrim" aria-hidden="true" />
              <h3 className="h2-ind-t">{i.t}</h3>
              <span className="h2-ind-go" aria-hidden="true">&rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- business model */
function BusinessModel() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const grid = q('.h2-mod-grid')[0]

      /* the four marks assemble themselves off --mk-d, exactly as the milestone six do */
      ScrollTrigger.create({
        trigger: grid, start: 'top 84%', once: true,
        onEnter: () => grid.classList.add('mk-in'),
      })

      if (still()) return
      gsap.fromTo(q('.h2-mod-card'), { z: -140, opacity: 0 }, {
        z: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-mod" id="business-model" ref={root}>
      <div className="h2-wrap">
        <div className="h2-head">
          <h2 className="h2-xl h2-on-dark">Four Ways We <em>Deliver Certainty</em></h2>
          <p className="h2-lede h2-on-dark">
            IAQ structures every engagement around its core business models, giving clients the
            flexibility to choose the delivery approach that best fits their project.
          </p>
        </div>
        <div className="h2-mod-grid mk-stage">
          {MODELS.map(({ M, ...m }) => (
            <Link className="h2-mod-card" to={m.to} key={m.n}>
              <span className="h2-mod-n">{m.n}</span>
              <ModelFigure kind={m.k} className="h2-mod-fig"><M className="h2-mod-mark" /></ModelFigure>
              <h3 className="h2-mod-t">{m.t}</h3>
              <p className="h2-mod-copy">{m.copy}</p>
              <span className="h2-mod-go">Explore <Arr /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- track record */
function TrackRecord() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      q('.h2-rec-row').forEach((row, i) => {
        /* scale 1.3 gives 15% of overscan a side against a ±10% travel — see the overscan budget
           note in home2.css. At 1.14 the picture ran out of itself and the frame showed through. */
        gsap.fromTo(row.querySelector('.h2-rec-media img'), { yPercent: -10, scale: 1.3 }, {
          yPercent: 10, ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: .6 },
        })
        gsap.fromTo(row.querySelector('.h2-rec-body'), { y: 34, opacity: 0 }, {
          y: 0, opacity: 1, duration: .85, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 76%', once: true },
        })
        gsap.fromTo(row.querySelector('.h2-rec-media'), { clipPath: 'inset(14% 8% 14% 8%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 80%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-rec" id="track-record" ref={root}>
      <div className="h2-wrap h2-do-head">
        <div className="h2-head">
          <h2 className="h2-xl">Trusted at Home. <em>Expanding Across the Globe</em></h2>
        </div>
        <Link to="/projects" className="h2-pill h2-pill-ghost h2-do-cta">View Our Projects <Arr /></Link>
      </div>

      <div className="h2-wrap">
        {SHOWCASE.map(({ k, p }, i) => (
          <article className={'h2-rec-row' + (i % 2 ? ' h2-rec-flip' : '')} key={k}>
            <div className="h2-rec-media"><img src={p.img} alt={p.name} loading="lazy" /></div>
            <div className="h2-rec-body">
              <h3 className="h2-rec-t">{p.name}</h3>
              <dl className="h2-rec-meta">
                <div><dt>Client</dt><dd>{p.client}</dd></div>
                <div><dt>Location</dt><dd>{p.loc}</dd></div>
                <div><dt>Classification</dt><dd>{p.iso}</dd></div>
              </dl>
              <Link to="/projects" className="h2-rec-go">See the registry <Arr /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- mission
   THE ZOOM-OUT. One image fills the screen carrying the mission statement; the
   words leave, the two calls to action arrive, and then the image pulls back
   until it is one tile in a wall of the work.

   HOW THE FRAMING WORKS: the grid is three cells by three, and every cell is
   exactly one viewport. So at scale 1 the centre cell IS the screen — no
   measuring, no resize maths, and it stays exact at any window size. Scrolling
   scales the grid down to a third, which brings the other eight cells into
   view around it.

   The buttons are NOT in the grid. They sit in an overlay pinned to the centre
   of the stage, which is where the centre tile's middle stays throughout — so
   they hold their size while the picture retreats behind them, exactly as the
   reference does.

   The gap between tiles is divided by the current scale, so it opens to a
   constant on-screen width instead of ballooning as the grid shrinks. */
const MIS_TILES = [
  '/assets/projects/prj-003.webp', '/assets/projects/prj-013.webp', '/assets/projects/prj-018.webp',
  '/assets/projects/prj-017.webp', null /* the hero sits here */, '/assets/projects/prj-006.webp',
  '/assets/ph-crane.webp', '/assets/projects/prj-011.webp', '/assets/projects/prj-007.webp',
]
const MIS_HERO = '/assets/contact-cleanroom.webp'

function Mission() {
  const root = useRef(null)

  /* THE VIEWPORT UNITS LIE ON THIS SITE. base.css sets :root{zoom:1.12} above 1025px to reflow the
     layout on large monitors, and zoom inflates every vh and vw by the same 12% — so a stage
     declared 100vh renders 1008px tall in a 900px window, and the "one cell is one viewport"
     invariant this section is built on is simply false. Measure the real thing and divide the zoom
     back out. The CSS keeps vh fallbacks, so a failure here degrades to slightly-oversized rather
     than to nothing. */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const sync = () => {
      const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
      el.style.setProperty('--vpw', window.innerWidth / z + 'px')
      el.style.setProperty('--vph', window.innerHeight / z + 'px')
      ScrollTrigger.refresh()
    }
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      const grid = q('.h2-mis-grid')[0]
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: 'bottom bottom',
          scrub: .7, invalidateOnRefresh: true,
        },
      })

      /* the statement holds, then leaves before anything else moves — two things
         changing at once is what makes a sequence read as a glitch */
      tl.to(q('.h2-mis-copy'), { opacity: 0, y: -40, duration: .12 }, .2)
        .fromTo(q('.h2-mis-cta'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .1 }, .32)
        .fromTo(grid, { '--s': 1, '--g': 0 }, { '--s': .34, '--g': 1, duration: .58 }, .36)
        /* the scrim exists for the statement, so it leaves once the statement has: this hero is a
           near-white cleanroom and the picture is worth more than the darkness on top of it */
        .to(q('.h2-mis-scrim'), { opacity: .18, duration: .2 }, .3)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-mission" ref={root}>
      <div className="h2-mis-stage">
        <div className="h2-mis-grid">
          {MIS_TILES.map((src, i) => (
            <div className={'h2-mis-tile' + (src ? '' : ' h2-mis-hero')} key={i}>
              <img src={src || MIS_HERO} alt="" loading={src ? 'lazy' : 'eager'} />
            </div>
          ))}
        </div>

        <div className="h2-mis-scrim" aria-hidden="true" />

        <div className="h2-mis-copy">
          <p>
            Providing innovative and sustainable facility and engineering solutions benefitting our
            clients and stakeholders, driven by our leadership, employees and partners globally.
          </p>
        </div>

        <div className="h2-mis-cta">
          <Link to="/projects" className="h2-pill h2-pill-red">Projects <Arr /></Link>
          <Link to="/contact" className="h2-pill h2-pill-ghost">Contact</Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- news teaser */
function NewsTeaser() {
  return (
    <section className="h2-news" id="news">
      {/* the head is a child of the wrap, never the wrap itself: .h2-head caps at 46ch, and a
          capped element that is also the auto-margined container centres itself on the page */}
      <div className="h2-wrap">
        <div className="h2-head">
          <h2 className="h2-xl">Stay Ahead <em>With IAQ</em></h2>
          <p className="h2-lede">
            Explore our latest project milestones, industry insights, and company updates as we
            continue expanding our footprint across advanced, dynamic markets worldwide.
          </p>
        </div>
      </div>
      <NewsRail />
    </section>
  )
}

/* --------------------------------------------------------------- closing */
function ClosingCta() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.h2-final-bg'), { yPercent: -10 }, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .6 },
      })
      gsap.fromTo(q('.h2-final-in > *'), { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="h2-final" ref={root}>
      <div className="h2-final-media" aria-hidden="true">
        <img className="h2-final-bg" src="/assets/contact-cleanroom.webp" alt="" loading="lazy" />
      </div>
      <div className="h2-final-in">
        <h2 className="h2-xl h2-on-dark">Let’s Build Your Next <em>Facility Together</em></h2>
        <p className="h2-lede h2-on-dark">
          Have a project that demands precision, speed, and proven expertise? Talk to our team and
          discover how IAQ can bring your hi-tech facility to life.
        </p>
        <Link to="/contact" className="h2-pill h2-pill-red">Contact Us Today <Arr /></Link>
      </div>
    </section>
  )
}

/* ============================================================== the page */
export default function Home2() {
  useEffect(() => {
    document.title = 'IAQ Group · Your Total Facility Solutions Provider'
    /* the parallax rows all measure on mount; one refresh after the lazy images
       settle keeps every start/end point honest */
    const id = setTimeout(() => ScrollTrigger.refresh(), 420)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Nav />
      <main className="h2-page">
        <Hero />
        <Snapshot />
        <WhatWeDo />
        <Industries />
        <BusinessModel />
        <TrackRecord />
        <Mission />
        <NewsTeaser />
        <ClosingCta />
      </main>
      <Footer note="Homepage concept 2 · Landing page copy deck" />
    </>
  )
}
