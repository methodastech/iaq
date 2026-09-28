import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import FooterNav from '../components/FooterNav.jsx'
import CloseAmbient from '../components/CloseAmbient.jsx'
import CareersPromo from '../components/CareersPromo.jsx'
import CultureCollage from '../components/CultureCollage.jsx'
import { useMomentum } from '../lib/momentum.js'
import ContactCta from '../components/ContactCta.jsx'
import { crumbLd } from '../components/PageHead.jsx'
import { VALUES } from '../data/values.js'
import ValueMotion from '../components/ValueMotion.jsx'
import { ROLES, HR_EMAIL, speculativeHref } from '../data/roles.js'
import { bySlug, longDate } from '../data/news.js'
import '../styles/pages.css'
import '../styles/culture.css'

/* ============================================================================
   Culture at IAQ · /careers/culture                                   14 Sep 2026

   Benchmark and pattern map: _reference/culture-benchmark.md (frog, Instrument, Arup, Spotify).

   THE HONESTY RULE. Nothing here is invented.
     · Numbers are site canon (1995, 450, seven countries) or derived from the role registry.
     · Values are the client's own lines (data/values.js); the proof beside each one is published.
     · Every moment, training, voice and practice is an IAQ newsroom post in data/news.js, linked
       internally, and each line restates the post without adding to it.
     · Every photograph is IAQ's own and appears ONCE on the page (sources:
       public/assets/culture/SOURCES.md and public/assets/newsroom/SOURCES.md).

   15 Sep, design pass (Bazil: "not all over the place", "no repetition", "complete it"):
     · removed: the 2025 story rail (repeated the News page), the levels bar chart (the roles band
       counts roles), the "Is this for you" tiles, and every grey slot and "Supplied by IAQ" chip
     · "A day in the life" folded into the moments tabs: three published moments, each with its photo
     · all newsroom links internal, "Read the story"
     · photographs sit in frames that drift with momentum (lib/momentum.js, data-mo on a wrapper)

   CSS is not scoped per route, so every class is prefixed cu-. The page sits under [data-mo-skip]:
   the global motion system leaves it alone and this page's own reveal (cu-rv) owns the motion.
   Content is visible without JavaScript: the hidden start state only exists under .cu-armed.
   ============================================================================ */

/* the proof beside each value, every line from a published page on this site */
const PROOF = {
  'V·01': { text: '2.6 million safe manhours on the East Malaysia wafer fab expansion.', to: '/news/celebrating-2-6-million-safe-manhours' },
  'V·02': { text: 'ISO 9001:2015 quality management, certified by Intertek and audited.', to: '/about/commitment' },
  'V·03': { text: 'A written Whistleblowing Policy, published beside the Quality and Environment, Health and Safety policies.', to: '/policies' },
  'V·04': { text: 'An ISO Class 1 cleanroom, the highest class IAQ has built, delivered for a semiconductor client.', to: '/about/history' },
  'V·05': { text: 'A green certified plant delivered ahead of schedule, through the pandemic.', to: '/about/history' },
  'V·06': { text: 'Builder of the Year at the 2024 Malaysian Construction Industry Excellence Awards, by CIDB.', to: '/about/history' },
}

/* The strip. Every photograph here appears nowhere else on the page; the hero owns the cleanroom,
   the headquarters lobby and Annual Dinner 2025. Captions say only what the source post says. */
const STRIP = [
  /* 17 Sep: IAQ's own event photographs from the SharePoint share (Photos from past event) replace the
     newsroom captures where the same event was photographed properly. Captions say what the folder,
     the banner in the picture or the file date says, nothing more. */
  { src: '/assets/iaq/events/mciea-2024-stage.webp', cap: 'MCIEA 2024, Builder of the Year, on stage', w: 1.6 },
  { src: '/assets/iaq/events/world-osh-day-2024.webp', cap: 'World OSH Day 2024, on site', w: 1.2 },
  /* newsroom 17 Nov 2022: 20 staff rewarded with a Western Discovery Trip to Europe */
  { src: '/assets/newsroom/western-discovery-trip-europe.webp', cap: 'Western Discovery Trip to Europe, 2022', w: 1.33 },
  /* newsroom 26 Sep 2024: ENGINEER & MARVEX 2024 at the Kuala Lumpur Convention Centre */
  { src: '/assets/newsroom/engineer-marvex-2024-cleanroom.webp', cap: 'IAQ at ENGINEER & MARVEX 2024, Kuala Lumpur', w: 1.33 },
  { src: '/assets/iaq/events/cultural-run-2024.webp', cap: 'IAQ Cultural Run, July 2024', w: 1.33 },
  { src: '/assets/iaq/events/robocon-um-robot-testing.webp', cap: 'Robot testing with the Universiti Malaya Robocon team, 2025', w: 1.5 },
  /* newsroom 24 Apr 2024: Cosplay Night at the Shangri-La Golden Sands Resort, Penang */
  { src: '/assets/iaq/events/annual-dinner-cosplay.webp', cap: 'Annual Dinner 2024, Cosplay Night in Penang', w: 1.5 },
  /* newsroom 10 Apr 2025: laptops, air-conditioning units and gym mats donated to PDK Kota Raja, Klang */
  { src: '/assets/newsroom/pdk-kota-raja-community-visit.webp', cap: 'Donating equipment to PDK Kota Raja, Klang, 2025', w: 1.33 },
]

/* 15 Sep: the moments. "A day in the life" asked IAQ for named people and working days; no source gives
   those, so the day folds into three published moments, each a newsroom post with its own photograph. */
const TABS = [
  { id: 'site', label: 'On site', slug: 'osh-week-safety-pledge-signing', img: '/assets/culture/osh-week-2025.webp', pos: '50% 60%',
    alt: 'The site team spelling out OSH WEEK 2025 beside an IAQ site office, seen from above',
    meta: 'Negeri Sembilan project site',
    h: 'OSH Week ends with a signed pledge.',
    p: ['Staff, contractors and workers signed a safety pledge together.', 'The IAQ EHS team led the ceremony.'] },
  { id: 'office', label: 'In the office', slug: 'ims-global-standards-commitment', img: '/assets/photo-opening.webp', pos: '50% 50%',
    alt: 'IAQ colleagues around a boardroom table at the opening meeting of the internal audit',
    meta: 'Integrated Management System',
    h: 'An internal audit, across every department.',
    p: ['The audit checked the management system against ISO 9001, ISO 14001 and ISO 45001.', 'It confirmed compliance with all three.'] },
  { id: 'community', label: 'In the community', slug: 'house-of-love-chocolate-museum-day', img: '/assets/iaq/events/house-of-love-2025.webp', pos: '50% 55%',
    alt: 'IAQ staff with children from House of Love outside Chocolate Museum Malaysia',
    meta: 'Chocolate Museum Malaysia',
    h: 'A day out with House of Love.',
    p: ['The team spent a day with the children of House of Love.', 'The children explored the museum and made their own chocolate.'] },
].map(t => ({ ...t, n: bySlug(t.slug) })).filter(t => t.n)

/* training and coaching IAQ has published; the line under each title restates the post */
const TRAIN = [
  { kind: 'In-house technical training', slug: 'wafer-fab-facility-design-excellence',
    img: '/assets/culture/training-wafer-fab-2025.webp', alt: 'IAQ engineers after the in-house wafer fabrication training',
    title: 'Introduction to Wafer Fabrication for Design & Construction',
    p: 'Four modules for the engineering team. They cover fab technology, manufacturing, automation and fab construction design.' },
  { kind: 'Leadership', slug: 'leader-as-a-coach-penang',
    img: '/assets/culture/coaching-leader-as-coach-penang-2024.webp', alt: 'The IAQ Penang team after the Leader as a Coach training',
    title: 'Leader as a Coach, for the Penang team',
    p: 'The training set coaching apart from mentoring. Leaders learn to ask the right questions rather than give answers.' },
  { kind: 'Coaching', slug: 'coaching-training-programmes-2024',
    img: '/assets/culture/coaching-programme-2024.webp', alt: 'IAQ team members with their trainer after a coaching training programme',
    title: 'Coaching models, processes and practices',
    p: 'Team members joined coaching training programmes. The aim is peers who inspire each other to reach their goals.' },
].map(t => ({ ...t, n: bySlug(t.slug) })).filter(t => t.n)

/* university outreach, newest first, each with IAQ's own photograph from the post */
const UNI = [
  { slug: 'university-malaya-engineering-insight', who: 'University of Malaya', what: 'Engineering Realities and Career Insight, a workshop for students', img: '/assets/culture/um-workshop-2025.webp' },
  { slug: 'utar-engineering-science-fiesta-2025', who: 'UTAR Engineering Science and Fiesta 2025', what: 'Meeting future engineers on campus', img: '/assets/culture/utar-fiesta-2025.webp' },
  { slug: 'umengine-career-day-2024', who: 'UMEnGinE Career Day 2024', what: 'IAQ took part as a sponsor', img: '/assets/culture/umengine-2024.webp' },
].map(u => ({ ...u, n: bySlug(u.slug) })).filter(u => u.n)

/* the founder's own signed words, "Reflecting on 2023: A Message from IAQ Group CEO", 15 Jan 2024; exact */
const FOUNDER_Q = {
  text: 'None of this would have been possible without the incredible dedication and hard work of our remarkable team.',
  who: 'Ir. Tiew Soon Aik', role: 'Founder and Chief Executive Officer, January 2024', to: '/news/ceo-message-2023',
}

/* IAQ newsroom, 28 Apr 2025. Every word as published; the em dash shows as an ellipsis (no dashes). The
   photograph is the post's own booth photograph and is captioned as the event, not as him. */
const VOICE = {
  text: 'Engineers are not just problem-solvers … they are visionaries who shape the future.',
  who: 'Ir. Then Kim Kian', role: 'Assistant Electrical Manager, keynote at UMEnGinE Career Day 2025',
  to: '/news/umengine-career-day-2025', img: '/assets/culture/umengine-2025.webp',
}

/* a career on the record, not a quote. IAQ newsroom, 24 Jul 2024, #EmployeeInSpotlight */
const LIM = [
  ['2004', 'Joined as an M&E Site Supervisor'],
  ['2009', 'Seconded to IAQ Morocco for a project'],
  ['2011', 'Promoted to Project Executive on his return'],
  ['A decade on', 'Promoted to Senior Project Executive'],
  ['2024', 'On a mega project in Kulim, Kedah'],
]

/* practices IAQ has published, each with its source post's photograph */
const CARE = [
  { k: 'Recognition', h: 'A company trip to Beijing', slug: 'beijing-team-retreat-2024',
    p: 'IAQ took the team to Beijing in November 2024, as thanks for their work.',
    img: '/assets/culture/beijing-company-trip-2024.webp', alt: 'IAQ staff on the Great Wall of China with their company trip banner' },
  { k: 'Together', h: 'Iftar across departments', slug: 'cross-department-iftar-gathering',
    p: 'Teams from across headquarters broke their fast together at M Resort & Hotel.',
    img: '/assets/newsroom/cross-department-iftar-gathering.webp', alt: 'IAQ colleagues from several departments at the Iftar gathering' },
  { k: 'Together', h: 'Dinner for the safety team', slug: 'safety-team-dinner-team-bonds',
    p: 'The safety team met over dinner, away from daily work routines.',
    img: '/assets/newsroom/safety-team-dinner-team-bonds.webp', alt: 'The IAQ safety team together at their team dinner' },
  { k: 'Health', h: 'Monthly football in Penang', slug: 'football-work-life-balance',
    p: 'Penang staff turned a friendly kickabout into a monthly football match in 2024.',
    img: '/assets/newsroom/football-work-life-balance.webp', alt: 'IAQ Penang staff on the football pitch with an IAQ flag' },
  { k: 'Health', h: 'Say No to Sugar', slug: 'kempen-tolak-gula-workplace-health',
    p: 'Staff joined Kempen Tolak Gula, a PERKESO campaign on sugar and health.',
    img: '/assets/newsroom/kempen-tolak-gula-workplace-health.webp', alt: 'IAQ staff at the Kempen Tolak Gula workplace health campaign' },
  { k: 'Growth', h: 'Mentorship for women', slug: 'womens-international-day-2024',
    p: 'IAQ commits to mentorship, training and advancement for its women colleagues.',
    img: '/assets/newsroom/womens-international-day-2024.webp', alt: 'A group of IAQ women colleagues' },
].map(c => ({ ...c, n: bySlug(c.slug) })).filter(c => c.n)

/* entities and zones from Contact.jsx; the US office publishes no zone, so it shows no clock */
const REP_CAP = 'Representation image, not the office itself.'
const PLACES = [
  { city: 'Shah Alam', country: 'Malaysia', note: 'Headquarters', tz: 'Asia/Kuala_Lumpur', loc: 'shah-alam',
    /* IAQ newsroom, 21 Feb 2024, "a jubilant celebration at our headquarters" */
    /* 17 Sep: IAQ's own aerial photograph of the headquarters (SharePoint, HQ Offices, drone 0007) */
    photo: '/assets/iaq/hq-aerial-0007.webp', alt: 'The IAQ headquarters in Shah Alam, photographed from the air', cap: 'Headquarters, Shah Alam' },
  { city: 'Penang', country: 'Malaysia', note: 'Branch, opened July 2025', tz: 'Asia/Kuala_Lumpur', loc: 'penang',
    photo: '/assets/newsroom/penang-branch-grand-opening-2025.webp', alt: 'Ribbon cutting at the grand opening of the IAQ Penang branch', cap: 'Penang branch opening, July 2025' },
  { city: 'Singapore', country: 'Singapore', note: 'IAQ Engineering (SG) Pte. Ltd.', tz: 'Asia/Singapore',
    photo: '/assets/culture/sg-office-open-plan-2026.webp', alt: 'The open plan IAQ Engineering Singapore office with its lit IAQ sign and pantry', cap: 'Office interior, opened August 2026' },
  { city: 'Dresden', country: 'Germany', note: 'IAQ Engineering (DE) GmbH', tz: 'Europe/Berlin',
    photo: '/assets/culture/offices/de.webp', rep: true, cap: REP_CAP },
  { city: 'Ahmedabad', country: 'India', note: 'IAQ Solutions India Private Limited', tz: 'Asia/Kolkata',
    photo: '/assets/culture/india-office-opening-2026.webp', alt: 'IAQ colleagues celebrating in a meeting room at the new India office', cap: 'Office opening, September 2026' },
  { city: 'Sweden', country: 'Nordic office', note: 'IAQ Group', tz: 'Europe/Stockholm',
    photo: '/assets/culture/offices/se.webp', rep: true, cap: REP_CAP },
  { city: 'United States', country: 'US office', note: 'IAQ Group',
    photo: '/assets/culture/offices/us.webp', rep: true, cap: REP_CAP },
  { city: 'Ireland', country: 'Ireland', note: 'IAQ Group', tz: 'Europe/Dublin',
    photo: '/assets/culture/offices/ie.webp', rep: true, cap: REP_CAP },
]

/* published on the Careers page; restated here in the same order */
const STEPS = [
  ['Send your CV', 'Apply from the role, or write to HR with the role title and reference in the subject.'],
  ['HR reviews it', 'The hiring manager for that department sees every application that matches the discipline.'],
  ['Interview', 'A conversation with HR and the department, technical for engineering roles.'],
  ['Offer and start', 'Terms, start date and the project you join are agreed together.'],
]

const Arrow = () => <svg className="cu-arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
const monthYear = iso => longDate(iso).split(' ').slice(1).join(' ')

/* a photograph in a fixed frame; the wrapper drifts with momentum, the image keeps its hover zoom */
function Photo({ src, alt = '', mo = 0.5, pos, cap, className = '' }) {
  return (
    <span className={'cu-fr ' + className}>
      <span className="cu-mo" data-mo={mo}>
        <img src={src} alt={alt} loading="lazy" decoding="async" style={pos ? { objectPosition: pos } : undefined} />
      </span>
      {cap && <span className="cu-cap">{cap}</span>}
    </span>
  )
}

function Clock({ tz, now }) {
  if (!tz) return null
  if (!now) return <span className="cu-clock is-off">Local time</span>
  let t = ''
  try { t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now) } catch (e) { return null }
  return <span className="cu-clock"><i aria-hidden="true" />{t} <small>local</small></span>
}

export default function Culture() {
  const root = useRef(null)
  const [now, setNow] = useState(null)

  const nRoles = ROLES.length
  const byLoc = id => ROLES.filter(r => r.loc === id).length

  useEffect(() => { document.title = 'IAQ Group · Culture · Brand Method' }, [])
  /* momentum drift for every photo frame marked data-mo (lib/momentum.js) */
  useMomentum()

  /* ---- reveal and count up ----
     a layout effect, so the hidden start state is in place before the first paint */
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const items = Array.from(el.querySelectorAll('.cu-rv'))
    const timers = []

    const count = node => {
      const target = parseFloat(node.dataset.count), dec = parseInt(node.dataset.dec || '0', 10)
      const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      if (reduce || !isFinite(target)) { node.textContent = fmt(target); return }
      const t0 = performance.now(), dur = 1600
      const step = t => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3)
        node.textContent = fmt(target * e)
        if (k < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
      /* a stalled frame loop must never strand a half counted number */
      timers.push(setTimeout(() => { node.textContent = fmt(target) }, dur + 400))
    }
    const release = node => {
      if (node.classList.contains('cu-in')) return
      node.classList.add('cu-in')
      node.querySelectorAll('[data-count]').forEach(count)
    }

    if (reduce || !('IntersectionObserver' in window)) { items.forEach(release); return () => {} }
    el.classList.add('cu-armed')
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { release(en.target); io.unobserve(en.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 })
    items.forEach(n => io.observe(n))

    /* a scroll that outruns the observer, or a jump to an anchor, still releases everything above the fold */
    let raf = 0
    const sweep = () => {
      raf = 0
      const vh = window.innerHeight
      items.forEach(n => { if (!n.classList.contains('cu-in') && n.getBoundingClientRect().top < vh * 0.96) release(n) })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep) }
    window.addEventListener('scroll', onScroll, { passive: true })
    timers.push(setTimeout(sweep, 900))

    return () => {
      io.disconnect(); timers.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /* ---- live local time for the offices ---- */
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(t)
  }, [])

  const ld = crumbLd([{ label: 'Home', to: '/' }, { label: 'Careers', to: '/careers' }, { label: 'Culture', to: '/careers/culture' }])
  const stripRow = [...STRIP, ...STRIP]

  return (
    <>
      <Nav />

      <div className="cu-page" ref={root} data-mo-skip="">
        {/* ── 1 · Opening statement over the team ─────────────────────────── */}
        <header className="cu-hero" id="top">
          <div className="cu-w cu-hero-in">
            <div className="cu-hero-copy">
              <nav className="pg-crumbs cu-crumbs" aria-label="Breadcrumb">
                <Link to="/">Home</Link><span aria-hidden="true">&rsaquo;</span><Link to="/careers">Careers</Link>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
              </nav>
              <h1 className="cu-h1 cu-rv">
                <span className="cu-ln"><span>The people behind</span></span>{' '}
                <span className="cu-ln"><em>the cleanest rooms.</em></span>
              </h1>
              <p className="cu-lede cu-rv" style={{ '--d': '.12s' }}>
                450 people in seven countries design, build, commission and maintain facilities that must hold their class.
                This page shows how the team works, holds safety and grows its engineers.
              </p>
              <div className="cu-ctas cu-rv" style={{ '--d': '.2s' }}>
                <Link className="cu-btn" to="/careers">See open roles <Arrow /></Link>
                <a className="cu-btn ghost" href="#cu-hire">How hiring works</a>
              </div>
              <div className="cu-stats cu-rv" style={{ '--d': '.28s' }}>
                <div><span className="cu-sn">1995</span><span className="cu-sl">Founded in Malaysia</span></div>
                <div><span className="cu-sn"><span data-count="450">450</span></span><span className="cu-sl">People</span></div>
                <div><span className="cu-sn"><span data-count="7">7</span></span><span className="cu-sl">Countries</span></div>
                <div><span className="cu-sn"><span data-count={nRoles}>{nRoles}</span></span><span className="cu-sl">Roles open now</span></div>
              </div>
            </div>

            <CultureCollage />
          </div>
        </header>

        {/* ── 2 · The moving photo strip ──────────────────────────────────── */}
        <section className="cu-strip" aria-label="IAQ in photographs">
          <div className="cu-strip-track">
            {stripRow.map((s, i) => (
              <figure className="cu-st" key={i} style={{ '--w': s.w }} aria-hidden={i >= STRIP.length ? 'true' : undefined}>
                <img src={s.src} alt={i >= STRIP.length ? '' : s.cap} loading="lazy" decoding="async" />
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── 3 · Where it started ─────────────────────────────────────────── */}
        <section className="cu-sec cu-origin" aria-labelledby="cu-origin-h">
          <div className="cu-w cu-origin-in">
            <div className="cu-year-big cu-rv" aria-hidden="true">1995</div>
            <div className="cu-origin-copy">
              <h2 id="cu-origin-h" className="cu-h2 cu-rv">It started with <em>indoor air quality.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>
                Ir. Tiew Soon Aik founded IAQ in Malaysia in 1995, as a cleanroom specialist. Today it builds in seven countries.
              </p>
              <Link className="cu-link cu-rv" style={{ '--d': '.12s' }} to="/about/history">The record since 1995 <Arrow /></Link>
            </div>
            <figure className="cu-quote cu-rv" style={{ '--d': '.16s' }}>
              <span className="cu-qm" aria-hidden="true">&ldquo;</span>
              <blockquote className="cu-quote-t">{FOUNDER_Q.text}</blockquote>
              <figcaption><b>{FOUNDER_Q.who}</b><small>{FOUNDER_Q.role}</small></figcaption>
              <Link className="cu-link" to={FOUNDER_Q.to}>Read the story <Arrow /></Link>
            </figure>
          </div>
        </section>

        {/* ── 4 · Values, each beside its record ───────────────────────────── */}
        <section className="cu-sec cu-values" id="cu-values" aria-labelledby="cu-values-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-values-h" className="cu-h2 cu-rv">Six values, <em>on the record.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>The values are IAQ&rsquo;s own words. Beside each one is where the record already shows it.</p>
            </div>
            <div className="cu-vgrid">
              {VALUES.map((v, i) => {
                const pr = PROOF[v.ix]
                return (
                  <article className="cu-vc cu-rv" key={v.ix} style={{ '--d': `${i * 0.06}s` }}>
                    <span className="cu-vc-top">
                      <ValueMotion k={v.ix} i={i} />
                      {/* 16 Sep (Bazil: "why got v06 etc", "just number normally"): a plain 1 to 6 */}
                      <span className="cu-vc-ix">{i + 1}</span>
                    </span>
                    <h3>{v.title}</h3>
                    <span className="cu-vc-line">{v.line}</span>
                    <span className="cu-vc-proof">{pr.text}</span>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 5 · Safety culture ──────────────────────────────────────────────
            Two separate claims, each with its own figure, date and photograph:
              · 2.6 million: crossed 28 February 2025 on the XFAB 40K Expansion Project (newsroom 28 Feb 2025)
              · DOSH Kuching: July 2025, banner "2.74 million Safe Manhours without LTI" (newsroom 3 Jul 2025)
            Zero LTI: the client wafer fab building IAQ delivered with zero lost time injury (newsroom 1 Jun 2023),
            IAQ's own photograph, replacing the market still that stood in as a representation. */}
        <section className="cu-sec cu-safety" id="cu-safety" aria-labelledby="cu-safety-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-safety-h" className="cu-h2 cu-rv">Everybody goes <em>home safe.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>
                An injury free workplace is the aim of IAQ&rsquo;s <abbr title="Environment, Health and Safety">EHS</abbr> policy.
              </p>
            </div>
            <div className="cu-sf">
              <div className="cu-sf-big cu-rv">
                <Photo className="cu-sf-fig" src="/assets/newsroom/safe-manhours-2-6-million-2025.webp" pos="50% 45%" mo={0.6}
                  alt="The XFAB 40K Expansion Project site team holding their 2.6 million safe manhours banner"
                  cap="XFAB 40K Expansion Project team, February 2025" />
                <span className="cu-sf-panel">
                  <span className="cu-sf-num"><span data-count="2.6" data-dec="1">2.6</span></span>
                  <span className="cu-sf-unit">million safe manhours</span>
                  <span className="cu-sf-sub">Crossed on 28 February 2025 on the XFAB 40K Expansion Project, with no lost time injury.</span>
                  <span className="cu-sf-dosh">
                    <img src="/assets/newsroom/dosh-kuching-safety-benchmark-2025.webp" alt="The IAQ team at DOSH Kuching with a banner reading 2.74 million safe manhours without LTI" loading="lazy" decoding="async" />
                    <span>
                      A separate record: in July 2025, the Sarawak project team presented 2.74 million safe manhours
                      without <abbr title="lost time injury">LTI</abbr> to <abbr title="Department of Occupational Safety and Health">DOSH</abbr> Kuching.
                    </span>
                  </span>
                </span>
              </div>
              <ul className="cu-sf-tiles">
                <li className="cu-rv" style={{ '--d': '.05s' }}>
                  <Photo className="cu-sf-vis is-photo" src="/assets/culture/moshpa-osh-gold-2024.webp" mo={0.45} alt="IAQ receiving the Gold award on stage at the MOSHPA OSH Excellence Award 2024" />
                  <span className="cu-sf-txt"><strong>Gold</strong><span className="cu-sf-c"><abbr title="Occupational Safety and Health">OSH</abbr> Management, MOSHPA 2024</span></span>
                </li>
                <li className="cu-rv" style={{ '--d': '.1s' }}>
                  <span className="cu-sf-vis is-badge"><img src="/assets/badge-highwire-gold-2024.webp" alt="Highwire Safety Gold 2024 badge" loading="lazy" decoding="async" /></span>
                  <span className="cu-sf-txt"><strong>Gold</strong><span className="cu-sf-c">Highwire Safety Award 2024</span></span>
                </li>
                <li className="cu-rv" style={{ '--d': '.15s' }}>
                  <span className="cu-sf-vis is-badge">
                    <img src="/assets/badge-iso.webp" alt="Intertek certification mark for ISO 9001, ISO 14001 and ISO 45001" loading="lazy" decoding="async" />
                    <img src="/assets/badge-ukas.webp" alt="UKAS Management Systems accreditation mark" loading="lazy" decoding="async" />
                  </span>
                  <span className="cu-sf-txt"><strong>ISO 45001</strong><span className="cu-sf-c">Intertek certified, UKAS accredited</span></span>
                </li>
                <li className="cu-rv" style={{ '--d': '.2s' }}>
                  <Photo className="cu-sf-vis is-photo" src="/assets/newsroom/fab1e-building-opening.webp" mo={0.45} alt="The IAQ team at the opening of a client's wafer fab building" />
                  <span className="cu-sf-txt"><strong>Zero LTI</strong><span className="cu-sf-c">Client wafer fab building, 2023</span></span>
                </li>
              </ul>
            </div>
            <blockquote className="cu-sf-q cu-rv">
              We believe every incident is preventable. No task is worth risking someone&rsquo;s safety.
              <cite>IAQ safety commitment</cite>
            </blockquote>
          </div>
        </section>

        {/* ── 6 · What IAQ looks like: three published moments ─────────────── */}
        <section className="cu-sec cu-life" id="cu-life" aria-labelledby="cu-life-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-life-h" className="cu-h2 cu-rv">What IAQ <em>looks like.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>Three moments IAQ published: on site, in the office and in the community.</p>
            </div>
            {/* 15 Sep (Bazil: "2 column top, 1 column bottom"): the three moments side by side, the third full width */}
            <div className="cu-moments">
              {TABS.map((t, i) => (
                <article className={'cu-mt cu-rv' + (i === TABS.length - 1 ? ' is-wide' : '')} key={t.id} style={{ '--d': `${i * 0.08}s` }}>
                  <Photo className="cu-mt-fig" src={t.img} alt={t.alt} pos={t.pos} mo={0.55} />
                  <div className="cu-mt-copy">
                    <span className="cu-k">0{i + 1} &middot; {t.label}</span>
                    <h3>{t.h}</h3>
                    {t.p.map(s => <p key={s}>{s}</p>)}
                    <span className="cu-meta"><span>{monthYear(t.n.date)}</span><span>{t.meta}</span></span>
                    <Link className="cu-link" to={`/news/${t.slug}`}>Read the story <Arrow /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7 · Learning and growth ──────────────────────────────────────── */}
        <section className="cu-sec cu-grow" id="cu-grow" aria-labelledby="cu-grow-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-grow-h" className="cu-h2 cu-rv">Where engineers <em>start and grow.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>IAQ trains its engineers in house and coaches its leaders. It also takes the work into universities.</p>
            </div>
            <h3 className="cu-h3 cu-sub cu-rv">Training and coaching</h3>
            <div className="cu-cards3">
              {TRAIN.map((t, i) => (
                <Link className="cu-card cu-rv" to={`/news/${t.slug}`} key={t.slug} style={{ '--d': `${i * 0.07}s` }}>
                  <Photo className="cu-card-fig" src={t.img} alt={t.alt} mo={0.5} />
                  <span className="cu-card-body">
                    <span className="cu-k">{t.kind}</span>
                    <b className="cu-ct">{t.title}</b>
                    <span className="cu-cp">{t.p}</span>
                    <span className="cu-cd">{monthYear(t.n.date)}</span>
                    <span className="cu-vc-go">Read the story <Arrow /></span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="cu-uni">
              <div className="cu-uni-intro cu-rv">
                <h3 className="cu-h3">With universities</h3>
                <p className="cu-p">IAQ announced a strategic collaboration with University of Malaya in May 2025. Its engineers also meet students on campus.</p>
                {bySlug('university-malaya-strategic-collaboration') && (
                  <Link className="cu-link" to="/news/university-malaya-strategic-collaboration">Read the story <Arrow /></Link>
                )}
              </div>
              <div className="cu-uni-list">
                {UNI.map((u, i) => (
                  <Link className="cu-uni-row cu-rv" to={`/news/${u.slug}`} key={u.slug} style={{ '--d': `${i * 0.06}s` }}>
                    <span className="cu-uni-pic" aria-hidden="true"><img src={u.img} alt="" loading="lazy" decoding="async" /></span>
                    <span className="cu-uni-t"><span className="cu-cd">{monthYear(u.n.date)}</span><b>{u.who}</b><span>{u.what}</span></span>
                    <Arrow />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 8 · People by name, and how IAQ looks after them ─────────────── */}
        <section className="cu-sec cu-voices" id="cu-voices" aria-labelledby="cu-voices-h">
          <div className="cu-w">
            {/* 25 Sep (Bazil: "remove this info"): the People, by name head and its two named cards are off; the care cards lead the section */}
            <div className="cu-head">
              <h2 id="cu-voices-h" className="cu-h2 cu-rv">Recognition, health <em>and time together.</em></h2>
            </div>
            <div className="cu-care">
              {CARE.map((c, i) => (
                <Link className="cu-card cu-rv" to={`/news/${c.slug}`} key={c.slug} style={{ '--d': `${(i % 3) * 0.06}s` }}>
                  <Photo className="cu-card-fig" src={c.img} alt={c.alt} mo={0.45} />
                  <span className="cu-card-body">
                    <span className="cu-k">{c.k}</span>
                    <b className="cu-ct">{c.h}</b>
                    <span className="cu-cp">{c.p}</span>
                    <span className="cu-vc-go">Read the story <Arrow /></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9 · Where people work ────────────────────────────────────────── */}
        <section className="cu-sec cu-places" id="cu-places" aria-labelledby="cu-places-h">
          <div className="cu-w">
            <div className="cu-head cu-head-row">
              <div>
                <h2 id="cu-places-h" className="cu-h2 cu-rv">Seven countries, <em>one standard.</em></h2>
                <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>Hiring today is in Shah Alam and Penang. The group&rsquo;s offices take the work further.</p>
              </div>
              <Link className="cu-link cu-rv" to="/global-presence">Global presence <Arrow /></Link>
            </div>
            <div className="cu-pgrid">
              {PLACES.map((pl, i) => {
                const open = pl.loc ? byLoc(pl.loc) : 0
                return (
                  <div className={'cu-pc cu-rv' + (open ? ' is-hiring' : '')} key={pl.city} style={{ '--d': `${i * 0.05}s` }}>
                    <Photo className="cu-pc-pic" src={pl.photo} alt={pl.rep ? '' : (pl.alt || `${pl.city} office`)} mo={0.45} />
                    {/* the parts are direct children on the grid's subgrid, so each shares its row across cards */}
                    <h3>{pl.city}</h3>
                    <span className="cu-pc-c">{pl.country}</span>
                    <span className="cu-pc-e">{pl.note}</span>
                    <span className="cu-pc-foot">
                      <Clock tz={pl.tz} now={now} />
                      {open > 0 && <Link className="cu-pc-open" to={`/careers#loc=${pl.loc}`}>{open} {open === 1 ? 'role' : 'roles'} open</Link>}
                    </span>
                    <span className="cu-pc-cap">{pl.cap || ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 10 · How hiring works ────────────────────────────────────────── */}
        <section className="cu-sec cu-hire" id="cu-hire" aria-labelledby="cu-hire-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-hire-h" className="cu-h2 cu-rv">How hiring <em>works.</em></h2>
              <p className="cu-p cu-rv" style={{ '--d': '.08s' }}>Four steps, from your CV to your first day on the team.</p>
            </div>
            <ol className="cu-steps cu-rv">
              {STEPS.map(([h, p], i) => (
                <li key={h} style={{ '--d': `${0.1 + i * 0.14}s` }}>
                  <span className="cu-step-n">{i + 1}</span>
                  <strong>{h}</strong>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 11 · Open roles: the shared Careers promo band ── */}
      </div>
      <CareersPromo variant="roles" />

      <section className="close3d dark-band" id="contact">
        <div className="close-in wrap split">
          <FooterNav />
          <div>
            <span className="eyebrow u-sig"><span data-scramble>JOIN THE TEAM</span></span>
            <h2 className="u-mt14 close-h">Send a CV</h2>
            <p className="lede u-mt16">Questions about a role, a site or a start date go straight to HR.</p>
            <ContactCta />
          </div>
          <div className="close-cards">
            <a className="crow" href={`mailto:${HR_EMAIL}`}><span className="ref">Recruitment</span><b>{HR_EMAIL}</b><i aria-hidden="true">&#8594;</i></a>
            <a className="crow" href={speculativeHref}><span className="ref">No role fits</span><b>Send a speculative CV</b><i aria-hidden="true">&#8594;</i></a>
            <div className="crow is-static"><span className="ref">HQ &middot; Shah Alam</span><b className="adr">No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</b></div>
          </div>
        </div>
        <CloseAmbient />
        <Footer note="Culture page concept · Brand Method" nav={false} />
      </section>
    </>
  )
}
