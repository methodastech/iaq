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
   /about2 — the About copy deck, in the reference page's compositional language.

   EVERY WORD IS THE CLIENT'S: headlines and body copy are the deck verbatim, in
   its order. Nothing rewritten, nothing invented.

   WHAT THE REFERENCE DOES THAT A COLUMN OF TEXT DOES NOT, and what is rebuilt
   here from it:

     · a photograph CUT TO A SHAPE, with a red outline offset behind it and a dot
       field behind that — three pieces at three depths, not a picture with
       decorations parked beside it;
     · the core values as one FULL RED BAND, rounded off the section above, so
       the middle of the page is a block of colour rather than six more rows of
       type on white;
     · imagery that dissolves into the page instead of sitting in a box, which is
       what keeps the intro airy while still being visual;
     · icon-led vision and mission rows rather than two equal cards.

   The depth is real: each layer rides the scroll at its own rate, and the globe
   in Global Presence is WebGL. Both degrade to a static, complete page.
   ========================================================================= */

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const Arr = () => <span className="h2-arr" aria-hidden="true">&rarr;</span>

/* the deck's "Stat counters: Years of Experience | Countries | Certifications" */
const GLANCE = [
  { v: 32, lab: 'Years of technical excellence' },
  { v: 8, lab: 'Countries of presence' },
  { v: 3, lab: 'ISO certifications' },
]

/* The six core values, each with the deck's own headline and body, and a
   photograph. House photography only — the registry shots carrying client
   wordmarks on the building stay off this page as they do on /home2. */
const VALUES = [
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

/* the deck asks for the certification and award logos by name */
const AWARDS = [
  ['/assets/badge-iso.webp', 'ISO certified'],
  ['/assets/badge-ukas.webp', 'UKAS accredited'],
  ['/assets/badge-cidb.webp', 'CIDB registered contractor'],
  ['/assets/badge-highwire-gold-2024.webp', 'Highwire Safety Gold 2024'],
]

/* ------------------------------------------------------------------- hero */
function Hero () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(q('.h2-hl > span'), { yPercent: 108 }, { yPercent: 0, duration: 1.05, stagger: .09 }, .15)
        .fromTo(q('.a2-hero-sub'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .85 }, .58)
        .fromTo(q('.a2-hero-ctas > *'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, stagger: .08 }, .72)

      /* the building leaves slower than the words, which is what makes the reader feel they moved
         rather than that the page did */
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .6 },
      })
        .to(q('.a2-hero-media'), { yPercent: 20, scale: 1.1 }, 0)
        .to(q('.a2-hero-copy'), { yPercent: 62, opacity: 0 }, 0)
        .to(q('.a2-hero-veil'), { opacity: 1 }, 0)
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-hero" id="top" ref={root}>
      {/* the deck's "Supporting visual: Company building" */}
      <div className="a2-hero-media" aria-hidden="true">
        <img src="/assets/about-hero-dusk.webp" alt="" fetchPriority="high" />
      </div>
      <div className="a2-hero-veil" aria-hidden="true" />
      <div className="a2-hero-copy">
        <h1 className="a2-hero-title" aria-label="About IAQ — Engineering Trust Since 1994">
          <span className="h2-hl" aria-hidden="true"><span>About IAQ</span></span>
          <span className="h2-hl" aria-hidden="true"><span><em>Engineering Trust</em></span></span>
          <span className="h2-hl" aria-hidden="true"><span><em>Since 1994</em></span></span>
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

/* ------------------------------------------------------------- at a glance
   Copy left, imagery right and ghosted out into the page. The reference lets the
   picture dissolve rather than sit in a box, which is what keeps the band airy
   while still being a visual. */
function Glance () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-glance-copy > *'), { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      })
      gsap.fromTo(q('.a2-ghost img'), { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .7 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-glance" id="glance" ref={root}>
      <div className="h2-wrap a2-glance-grid">
        <div className="a2-glance-copy">
          <span className="a2-k">About IAQ</span>
          <h2 className="h2-xl">IAQ <em>At a glance</em></h2>
          <p>
            IAQ is a Malaysia-based leading Total Facility Solutions Provider with over 30 years of
            technical excellence in hi-tech facility solutions, delivered through various service
            models.
          </p>
          <p>
            Our expertise spans semiconductors, district cooling and heating plants, and life
            sciences, through to industrial infrastructure, oil and gas, petrochemical, and power
            plants. We offer a broad range of services and comprehensive turnkey solutions, delivered
            to the highest quality and safety standards for our technically demanding clients.
          </p>
        </div>
        <div className="a2-ghost" aria-hidden="true">
          <img src="/assets/ph-crane.webp" alt="" loading="lazy" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------- excellence, vision and mission
   THE SHAPED FRAME. The reference builds this band from three pieces at three
   depths: a photograph cut to an arch, a red outline offset behind it, and a dot
   field behind that. Each rides the scroll at its own rate, so the composition
   has real depth instead of being a picture with decorations parked beside it. */
function Excellence () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      const runCount = el => {
        const end = +el.dataset.count
        if (still()) { el.textContent = end.toLocaleString('en-US'); return }
        gsap.to({ v: 0 }, {
          v: end, duration: 1.6, ease: 'power2.out',
          onUpdate () { el.textContent = Math.round(this.targets()[0].v).toLocaleString('en-US') },
        })
      }
      ScrollTrigger.create({
        trigger: root.current, start: 'top 74%', once: true,
        onEnter: () => q('[data-count]').forEach(runCount),
      })
      if (still()) return

      gsap.fromTo(q('.a2-arch'), { y: 46, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 76%', once: true },
      })
      gsap.fromTo(q('.a2-xl-copy > *'), { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
      /* three layers, three rates — the frame and the dots move against the picture */
      const layers = [['.a2-arch img', -7, 7], ['.a2-arch-frame', 14, -14], ['.a2-dots', 24, -24]]
      layers.forEach(([sel, from, to]) => {
        gsap.fromTo(q(sel), { yPercent: from }, {
          yPercent: to, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .8 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-xl" id="excellence" ref={root}>
      <div className="h2-wrap a2-xl-grid">
        <div className="a2-xl-figure">
          <i className="a2-dots" aria-hidden="true" />
          <i className="a2-arch-frame" aria-hidden="true" />
          <figure className="a2-arch">
            <img src="/assets/projects/prj-018.webp" alt="An IAQ-delivered facility" loading="lazy" />
          </figure>
        </div>

        <div className="a2-xl-copy">
          <h2 className="h2-xl">
            32 years of technical excellence through various service models with global presence{' '}
            <em>across 8 countries</em>
          </h2>
          <p className="a2-xl-body">
            IAQ is a leading ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 certified
            Malaysian-owned company, delivering engineering design, procurement, construction,
            commissioning and maintenance services, alongside on-board project management, to
            clients in diverse industries — both locally and globally.
          </p>

          <div className="a2-counts">
            {GLANCE.map(({ v, lab }) => (
              <div className="a2-count" key={lab}>
                <b><span data-count={v}>0</span></b>
                <span>{lab}</span>
              </div>
            ))}
          </div>

          <article className="a2-vm-row">
            <span className="a2-vm-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" />
              </svg>
            </span>
            <div>
              <h3>IAQ Vision</h3>
              <p>
                To be a regional facility solutions provider with engineering excellence,
                facilitating technological innovation and advancement in quality of life.
              </p>
            </div>
          </article>

          <article className="a2-vm-row">
            <span className="a2-vm-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2c3 2.2 4.8 5.6 4.8 9.4L17 16l-2.6 2H9.6L7 16l.2-4.6C7.2 7.6 9 4.2 12 2z" />
                <path d="M7.6 13.6 5 15.4 5.6 19l3-1.2M16.4 13.6 19 15.4 18.4 19l-3-1.2" />
                <circle cx="12" cy="10" r="1.8" />
              </svg>
            </span>
            <div>
              <h3>IAQ Mission</h3>
              <p>
                Providing innovative and sustainable facility and engineering solutions that benefit
                our clients and stakeholders, driven by our leadership, employees, and partners
                globally.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- core values
   The full red band the reference builds the page around: six alternating rows,
   white on red, rounded off the section above it. */
function Values () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      q('.a2-val').forEach(row => {
        gsap.fromTo([row.querySelector('.a2-val-media'), row.querySelector('.a2-val-in')],
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .08,
            scrollTrigger: { trigger: row, start: 'top 85%', once: true },
          })
        /* the picture travels inside a frame that does not; overscan exceeds the travel, or the
           frame shows through at the ends */
        gsap.fromTo(row.querySelector('.a2-val-media img'), { yPercent: -8 }, {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: .7 },
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-values" id="values" ref={root}>
      <div className="h2-wrap">
        <h2 className="a2-values-head">IAQ <em>Core Values</em></h2>
      </div>
      {VALUES.map(([n, k, head, img, body]) => (
        <article className="a2-val" key={n}>
          <div className="h2-wrap a2-val-grid">
            <figure className="a2-val-media">
              <img src={img} alt="" loading="lazy" />
            </figure>
            <div className="a2-val-in">
              <h3>{k}</h3>
              <p>{body}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

/* ----------------------------------------------------------------- awards
   Ghosted line-work on the left, the recognition on the right — the reference's
   own split, and the reason the logos read as a record rather than a sponsor bar. */
function Awards () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-award'), { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .75, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: q('.a2-award-row')[0], start: 'top 88%', once: true },
      })
      gsap.fromTo(q('.a2-aw-ghost img'), { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: .7 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-awards" id="awards" ref={root}>
      <div className="h2-wrap a2-aw-grid">
        <div className="a2-aw-ghost" aria-hidden="true">
          <img src="/assets/ph-blueprint.webp" alt="" loading="lazy" />
        </div>
        <div className="a2-aw-copy">
          <span className="a2-k">Awards &amp; Recognition</span>
          <h2 className="h2-xl">What We’ve <em>Achieved</em></h2>
          <div className="a2-award-row">
            {AWARDS.map(([src, alt]) => (
              <figure className="a2-award" key={alt}>
                <img src={src} alt={alt} loading="lazy" />
              </figure>
            ))}
          </div>
          <p className="a2-aw-note">
            We are proud to be recognized by important organizations for our contribution towards
            the community and, more importantly, our clients.
          </p>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- global presence */
function Presence () {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(self => {
      const q = self.selector
      if (still()) return
      gsap.fromTo(q('.a2-pres-copy > *'), { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: .85, ease: 'power3.out', stagger: .1,
        scrollTrigger: { trigger: root.current, start: 'top 76%', once: true },
      })
      gsap.fromTo(q('.a2-globe'), { scale: .9, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 74%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="a2-pres" id="presence" ref={root}>
      <div className="h2-wrap a2-pres-grid">
        <div className="a2-pres-copy">
          <h2 className="h2-xl h2-on-dark">From a Local Engineering Firm <em>to a Regional Leader</em></h2>
          <p className="h2-lede h2-on-dark">
            From modest Malaysian engineering firm in 1994 to a trusted global Total Facility
            Solutions Provider. This is the Journey of IAQ Group.
          </p>
          <ul className="a2-legend">
            <li><i className="of" />Offices · Shah Alam HQ, Penang, Singapore, Dresden, France, India</li>
            <li><i className="dl" />Delivered in · China, Sweden, Poland, Morocco</li>
          </ul>
          <Link to="/about/history" className="h2-pill h2-pill-ghost a2-pres-cta">
            Our History <Arr />
          </Link>
        </div>
        <GlobeFigure />
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- closing */
function Closing () {
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
        <h2 className="h2-xl h2-on-dark">Partner With a Team <em>That Delivers</em></h2>
        <p className="h2-lede h2-on-dark">
          Discover how three decades of engineering excellence can bring your next facility to life.
        </p>
        <div className="a2-final-ctas">
          <Link to="/services" className="h2-pill h2-pill-red">View Our Services <Arr /></Link>
          <Link to="/contact" className="h2-pill h2-pill-ghost">Contact Us</Link>
        </div>
      </div>
    </section>
  )
}

/* ============================================================== the page */
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
        <Glance />
        <Excellence />
        <Values />
        <Awards />
        <Presence />
        <Closing />
      </main>
      <Footer note="About · concept 2 · Brand Method" />
    </>
  )
}
