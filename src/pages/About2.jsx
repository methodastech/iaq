import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import GlobeFigure from '../components/GlobeFigure.jsx'
import '../styles/home2.css'
import '../styles/about2.css'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================================
   /about2 — a REVAMP, not a refine.

   THE COPY IS THE CLIENT'S DECK, VERBATIM. What changed is the ARGUMENT, which
   is the only thing that separates a revamp from a new coat of paint.

   The old page argues:  who we are -> what we believe -> what we won -> where
                         we are -> get in touch.
   That is a brochure. It asks a technically demanding buyer to care about our
   ethos before we have given them a single reason to believe us.

   This page argues:     PROOF -> REACH -> METHOD -> PURPOSE -> ask.

     1 PROOF    the record and the certifications, first and at full scale.
                A buyer procuring a nine-figure facility asks "are you real and
                are you certified" before anything else, so it is answered before
                anything else. The deck's "At a Glance" and "Awards &
                Recognition" are one band here, because they answer one question.
     2 REACH    "have you done it where I need it" — the globe, at full size.
     3 METHOD   the six core values reframed as HOW THE WORK IS DONE, with a
                spine down the page telling you where you are in the six. Same
                six headlines, same six paragraphs, different job.
     4 PURPOSE  vision and mission LAST, where they have been earned. Stating
                your ethos to someone who does not yet believe you is noise;
                stating it after the evidence is a close.

   No section of the deck is dropped and no word is rewritten. Two are merged,
   and the order is inverted.

   The WebGL is an upgrade and never a requirement: three.js loads only when a
   scene is near, and with reduced motion or no WebGL the page keeps every word,
   photograph and number.
   ========================================================================= */

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const Arr = () => <span className="h2-arr" aria-hidden="true">&rarr;</span>

const COUNTS = [
  { v: 32, lab: 'Years of technical excellence' },
  { v: 8, lab: 'Countries of presence' },
  { v: 3, lab: 'ISO certifications' },
]

const AWARDS = [
  ['/assets/badge-iso.webp', 'ISO 9001 · 14001 · 45001'],
  ['/assets/badge-ukas.webp', 'UKAS accredited'],
  ['/assets/badge-cidb.webp', 'CIDB registered contractor'],
  ['/assets/badge-highwire-gold-2024.webp', 'Highwire Safety Gold 2024'],
]

/* the deck's six core values, reframed as the method — headlines and bodies verbatim */
const METHOD = [
  ['01', 'Safety Commitment', 'Everybody Goes Home Safe', '/assets/ph-crane.webp',
    'IAQ is committed to an injury-free workplace where everybody goes home safe. Senior leadership is actively engaged to proactively manage risk during project execution, using active risk management and continuous improvement techniques to protect both our people and our reputation. Enforcing and upscaling best working practices through multilingual training and educational aids is at the forefront of everything we do.'],
  ['02', 'Quality Consistency', 'Excellence, Built Into Every Process', '/assets/contact-cleanroom.webp',
    'Our team has the skills to bring excellence to every project. A robust Quality Management System (QMS), including Project Quality Plans (PQP), procedures, Inspection Test Plans (ITPs), witness hold points, and full records, proactively manages quality at every stage. Digitalized quality management tools, combined with strong project management, give clients a single point of contact throughout construction, ensuring progress never comes at the expense of quality.'],
  ['03', 'Honesty and Integrity', 'Built on Honesty, Sustained by Trust', '/assets/photo-opening.webp',
    'Honesty and integrity are the cornerstone of our organizational ethos. We believe in transparent communication of accurate information, encouraging openness and sincerity in all interactions. Upholding consistency between words and actions, we prioritize ethical practices and moral principles fostering a culture of trust among our team members and stakeholders.'],
  ['04', 'Engineering Capabilities', 'An In-House Team Built for Complexity', '/assets/ph-blueprint.webp',
    'Our experienced, multi-disciplinary in-house engineering team integrates advanced technology and value engineering solutions for hi-tech facilities. With over 20 years of excellence, our multi-rounded solutions and considerations are tailored to deliver total facility solutions to our esteemed clients.'],
  ['05', 'Efficiency & Proficiency', 'Speed Without Compromise', '/assets/about-2015-robotics.webp',
    'Flexible fast-track execution and contractual approaches are available to fit each client’s needs. IAQ is driven by innovative engineering solutions that accelerate build time and time to market. Construction timelines are tracked across multiple critical paths to keep progress aligned with schedule and resources, and we are committed to maximizing available resources to achieve the best result collectively.'],
  ['06', 'Pursuit of Excellence', 'Delivering on Every Commitment', '/assets/photo-awards.webp',
    'IAQ delivers on our commitments with the highest degree of engineering excellence. Our customer-focused approach to project execution fosters mutual trust and credibility, and we conduct business in accordance with the highest ethical, moral, and legal standards.'],
]

/* ═══════════════════════════════════════════════════════ 0 · hero
   FOOTAGE, NOT GEOMETRY. The WebGL corridor was a drawing of a cleanroom; this is
   one, with two technicians fitting a ceiling filter panel in it. For a page whose
   whole argument is "believe us", a real room beats a rendered one.

   The clip is an UPGRADE, never a requirement: no src is attached until we know
   the visitor will see it, so reduced motion and data-saver never pay for it, and
   the poster underneath is a frame of this same clip — no jump when it starts. */
const HERO_CLIP = '/assets/videos/hero-cleanroom.mp4'
const HERO_POSTER = '/assets/about-hero-poster.webp'

function Hero () {
  const root = useRef(null)
  const vid = useRef(null)

  useEffect(() => {
    const v = vid.current
    if (!v || still()) return
    if (navigator.connection && navigator.connection.saveData) return
    let dead = false
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}) }
    const onPlaying = () => { if (!dead) v.classList.add('is-live') }
    const onError = () => { dead = true; v.classList.remove('is-live') }
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
      /* drop the buffer on unmount: a multi-megabyte clip held by a detached
         element outlives the route */
      v.pause(); v.removeAttribute('src'); v.load()
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(q('.h2-hl > span'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: .1 }, .2)
        .fromTo(q('.a2-hero-sub'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .9 }, .68)
        .fromTo(q('.a2-hero-ctas > *'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8, stagger: .09 }, .82)
      gsap.to(q('.a2-hero-copy'), {
        yPercent: -24, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .5 },
      })
      /* the footage leaves slower than the words: the room stays, the type gets
         out of its way */
      gsap.to(q('.a2-hero-media'), {
        yPercent: 14, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-hero" id="top" ref={root}>
      <div className="a2-hero-media" aria-hidden="true">
        <img src={HERO_POSTER} alt="" fetchPriority="high" />
        <video ref={vid} className="a2-hero-vid" muted playsInline loop
               preload="none" tabIndex={-1} />
      </div>
      <div className="a2-hero-scrim" aria-hidden="true" />
      <div className="a2-hero-copy">
        <span className="a2-k">About IAQ</span>
        <h1 className="a2-hero-title" aria-label="Engineering Trust Since 1994">
          <span className="h2-hl" aria-hidden="true"><span>Engineering <em>Trust</em></span></span>
          <span className="h2-hl" aria-hidden="true"><span>Since 1994</span></span>
        </h1>
        <p className="a2-hero-sub">
          IAQ is a Malaysia-based leading Total Facility Solutions Provider with over 30 years of
          technical excellence in hi-tech facility solutions, delivered through various service
          models.
        </p>
        <div className="a2-hero-ctas">
          <Link to="/services" className="h2-pill h2-pill-red">View Our Services <Arr /></Link>
          <Link to="/contact" className="h2-pill h2-pill-ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════ 1 · proof
   The record and the certifications, first and at full scale. The deck's "At a
   Glance" and "Awards & Recognition" answer one question between them — is this
   company real, and is it certified — so they are one band. */
function Proof () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const runCount = el => {
        const end = +el.dataset.count
        if (still()) { el.textContent = end.toLocaleString('en-US'); return }
        gsap.to({ v: 0 }, {
          v: end, duration: 1.9, ease: 'power2.out',
          onUpdate () { el.textContent = Math.round(this.targets()[0].v).toLocaleString('en-US') },
        })
      }
      ScrollTrigger.create({
        trigger: root.current, start: 'top 74%', once: true,
        onEnter: () => q('[data-count]').forEach(runCount),
      })
      if (still()) return
      gsap.fromTo(q('.a2-pf-line > span'), { yPercent: 108 }, {
        yPercent: 0, duration: 1.05, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
      })
      gsap.fromTo(q('.a2-fig'), { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: .95, ease: 'power3.out', stagger: .12,
        scrollTrigger: { trigger: q('.a2-figs')[0], start: 'top 86%', once: true },
      })
      gsap.fromTo(q('.a2-cert'), { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .08,
        scrollTrigger: { trigger: q('.a2-certs')[0], start: 'top 90%', once: true },
      })
      gsap.fromTo(q('.a2-pf-note'), { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: q('.a2-pf-note')[0], start: 'top 92%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-proof" id="proof" ref={root}>
      <div className="h2-wrap">
        <h2 className="a2-pf-head">
          <span className="a2-pf-line"><span>32 years of technical excellence,</span></span>
          <span className="a2-pf-line"><span><em>one trusted name</em></span></span>
        </h2>

        <div className="a2-figs">
          {COUNTS.map(({ v, lab }) => (
            <div className="a2-fig" key={lab}>
              <b><span data-count={v}>0</span></b>
              <span>{lab}</span>
            </div>
          ))}
        </div>

        <div className="a2-certs">
          {AWARDS.map(([src, alt]) => (
            <figure className="a2-cert" key={alt}>
              <img src={src} alt={alt} loading="lazy" />
              <figcaption>{alt}</figcaption>
            </figure>
          ))}
        </div>

        <div className="a2-pf-note">
          <p>
            IAQ is a leading ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 certified
            Malaysian-owned company, delivering engineering design, procurement, construction,
            commissioning and maintenance services, alongside on-board project management, to
            clients in diverse industries — both locally and globally. With 32 years of technical
            excellence across multiple service models, our presence now spans 8 countries.
          </p>
          <p className="a2-pf-aw">
            We are proud to be recognized by important organizations for our contribution towards
            the community and, more importantly, our clients.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═════════════════════════════════════════════════════ 2 · reach
   "Have you done it where I need it." The globe gets the whole band. */
function Reach () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-rc-copy > *'), { y: 32, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: root.current, start: 'top 76%', once: true },
      })
      gsap.fromTo(q('.a2-globe'), { scale: .88, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-reach" id="reach" ref={root}>
      <div className="h2-wrap a2-rc-grid">
        <div className="a2-rc-copy">
          <span className="a2-k">Global Presence</span>
          <h2 className="a2-h2">From a Local Engineering Firm <em>to a Regional Leader</em></h2>
          <p>
            From modest Malaysian engineering firm in 1994 to a trusted global Total Facility
            Solutions Provider. This is the Journey of IAQ Group.
          </p>
          <ul className="a2-legend">
            <li><i className="of" />Offices · Shah Alam HQ, Penang, Singapore, Dresden, France, India</li>
            <li><i className="dl" />Delivered in · China, Sweden, Poland, Morocco</li>
          </ul>
          <Link to="/about/history" className="h2-pill h2-pill-ghost a2-rc-cta">
            Our History <Arr />
          </Link>
        </div>
        <GlobeFigure />
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════ 3 · the break
   One full-bleed photograph between the evidence and the method. No copy is
   invented for it: the deck has none, and a picture is allowed to be a breath. */
function Break () {
  const root = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-break img'), { yPercent: -12, scale: 1.16 }, {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section className="a2-break" ref={root} aria-hidden="true">
      <img src="/assets/projects/prj-006.webp" alt="" loading="lazy" />
    </section>
  )
}

/* ═════════════════════════════════════════════════════ 4 · method
   The six values, reframed as how the work is done, with a spine down the page
   that tells you which of the six you are in. The old page made you guess. */
function Method () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const dots = q('.a2-spine-dot')

      /* the spine marks the row you are reading — the fix for "where am I in the six" */
      q('.a2-step').forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row, start: 'top 55%', end: 'bottom 55%',
          onToggle: s => dots[i] && dots[i].classList.toggle('on', s.isActive),
        })
        if (still()) return
        gsap.fromTo(row.querySelector('.a2-step-in'), { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: .95, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 84%', once: true },
        })
        gsap.fromTo(row.querySelector('.a2-step-media'), { y: 56, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 86%', once: true },
        })
        gsap.fromTo(row.querySelector('.a2-step-media img'), { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: .7 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-method" id="method" ref={root}>
      <div className="h2-wrap a2-mt-head">
        <span className="a2-k">How the work is done</span>
        <h2 className="a2-h2">Six commitments, <em>held on every site</em></h2>
      </div>

      <div className="h2-wrap a2-mt-grid">
        {/* the spine: sticky, so you always know which of the six you are in */}
        <nav className="a2-spine" aria-hidden="true">
          {METHOD.map(([n, k]) => (
            <span className="a2-spine-dot" key={n}><i />{n}<em>{k}</em></span>
          ))}
        </nav>

        <div className="a2-steps">
          {METHOD.map(([n, k, head, img, body]) => (
            <article className="a2-step" key={n}>
              <div className="a2-step-in">
                <span className="a2-step-n">{n}</span>
                <span className="a2-step-k">{k}</span>
                <h3>{head}</h3>
                <p>{body}</p>
              </div>
              <figure className="a2-step-media">
                <img src={img} alt="" loading="lazy" />
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════ 5 · purpose
   Vision and mission LAST, where the evidence has earned them. Set as the two
   largest statements on the page, over the work they describe. */
function Purpose () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-pp-bg'), { yPercent: -10, scale: 1.16 }, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .7 },
      })
      q('.a2-pp-card').forEach(card => {
        gsap.fromTo(card, { y: 48, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-purpose" id="purpose" ref={root}>
      <div className="a2-pp-media" aria-hidden="true">
        <img className="a2-pp-bg" src="/assets/tl-2020-dryroom.webp" alt="" loading="lazy" />
      </div>
      <div className="h2-wrap a2-pp-in">
        <article className="a2-pp-card">
          <span className="a2-k">IAQ Vision</span>
          <p>
            To be a regional facility solutions provider with engineering excellence, facilitating
            technological innovation and advancement in quality of life.
          </p>
        </article>
        <article className="a2-pp-card">
          <span className="a2-k">IAQ Mission</span>
          <p>
            Providing innovative and sustainable facility and engineering solutions that benefit our
            clients and stakeholders, driven by our leadership, employees, and partners globally.
          </p>
        </article>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════ 6 · close */
function Close () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-cl-bg'), { yPercent: -10 }, {
        yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .6 },
      })
      gsap.fromTo(q('.a2-cl-in > *'), { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: root.current, start: 'top 76%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-close" ref={root}>
      <div className="a2-cl-media" aria-hidden="true">
        <img className="a2-cl-bg" src="/assets/contact-cleanroom.webp" alt="" loading="lazy" />
      </div>
      <div className="h2-wrap a2-cl-in">
        <h2 className="a2-cl-title">Partner With a Team <em>That Delivers</em></h2>
        <p>Discover how three decades of engineering excellence can bring your next facility to life.</p>
        <div className="a2-cl-ctas">
          <Link to="/services" className="h2-pill h2-pill-red">View Our Services <Arr /></Link>
          <Link to="/contact" className="h2-pill h2-pill-ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════ the page */
export default function About2 () {
  useEffect(() => {
    document.title = 'IAQ Group · About · Engineering Trust Since 1994'
    const id = setTimeout(() => ScrollTrigger.refresh(), 420)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      <Nav />
      <main className="h2-page a2-page">
        <Hero />
        <Proof />
        <Reach />
        <Break />
        <Method />
        <Purpose />
        <Close />
      </main>
      <Footer note="About · concept 2 · Brand Method" />
    </>
  )
}
