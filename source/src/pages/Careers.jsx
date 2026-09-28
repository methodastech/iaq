import ContactCta from '../components/ContactCta.jsx'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import { MarkGrw, MarkCtr, MarkEmp } from '../components/Marks.jsx'
import { DmGrow } from '../components/DioramaMarks.jsx'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import FooterNav from '../components/FooterNav.jsx'
import CloseAmbient from '../components/CloseAmbient.jsx'
import CultureCollage from '../components/CultureCollage.jsx'
import Icon from '../components/FlowIcon.jsx'
import ValueMotion from '../components/ValueMotion.jsx'
import { useMomentum } from '../lib/momentum.js'
import initCareers from '../scenes/careers.js'
import { ROLES, HR_EMAIL, speculativeHref } from '../data/roles.js'
import { WHY_JOIN } from '../data/careersWhy.js'
import { VALUES } from '../data/values.js'
import { bySlug, longDate } from '../data/news.js'
import '../styles/pages.css'
import '../styles/console.css'   /* the shared filter console; must load before the page sheet */
import '../styles/careers.css'
import '../styles/culture.css'   /* the culture section's own sheet; every class in it is prefixed cu- */

/* ============================================================================
   Careers · /careers

   18 Sep (Bazil: "For the careers just have 2 sections, not all this: one is Careers, the other
   one is Culture. And it's just one page. The Culture is the top section of the website and the
   Careers is the bottom one, depending on which they click brings them to it. For the Culture
   only put relevant and important info, but don't leave out valuable ones.")

   So this is ONE page in two sections:
     1 · CULTURE (#culture), condensed from the former /careers/culture page (pages/Culture.jsx,
         kept on disk, no longer routed): the opening statement and figures over the team photo
         set, the founder's origin, the six values each beside its proof, the safety record, where
         engineers start and grow, and two people by name. Dropped: the photo strip, the three
         moments, the offices grid (Contact carries the offices), "How hiring works" (the Careers
         section already has "How applying works"), the care tiles, the promo band and its own
         closing band.
     2 · CAREERS (#roles): the head band, the filter console and the role list, the four reasons
         to build a career here, what the work is, how applying works, the two routes for a
         candidate the list misses, and the one closing band.
   /careers/culture redirects to /careers#culture (main.jsx). The nav's Careers wing is the two
   sections (components/Nav.jsx). #culture and #roles are landed by ScrollToTop in main.jsx and,
   as a fallback, by scenes/careers.js; both aim at the same element with the same nav offset.

   THE HONESTY RULE from the culture page holds. Nothing here is invented: numbers are site canon
   (1995, 450, seven countries) or derived from the role registry, the values are the client's own
   lines (data/values.js), every training, voice and record is an IAQ newsroom post (data/news.js)
   restated without addition, and every photograph is IAQ's own.

   MOTION. The culture wrapper sits under [data-mo-skip], so lib/motion.js leaves it alone and the
   section's own reveal (.cu-rv, armed by the layout effect below) owns it. Content is visible
   without JavaScript: the hidden start state only exists under .cu-armed. The careers head band
   keeps data-mo-skip for the same reason (14 Sep: its CSS entrance and lib/motion.js both tweened
   the same h1 and it never appeared; one animation per element).

   4 Sep, three things this page was getting wrong, still fixed:
     · the banner claimed 8 countries while the body copy said 6, and 6 is site
       canon everywhere else. The chips are DERIVED from the registry now, so a
       CMS edit cannot make them stale.
     · the whole bottom third addressed a client procuring a facility ("START A
       PROJECT", the sales email, the switchboard, the HQ address). There was no
       HR route and no way out for a candidate none of the sixteen roles fits.
     · the visitor-facing copy carried build talk.
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
/* 24 Sep (Bazil: "too empty"): five campus stories, and the collaboration story is the lead card on the left */
const UNI = [
  { slug: 'utar-engineering-science-fiesta-2025', who: 'UTAR Engineering Science and Fiesta 2025', what: 'Meeting future engineers on campus', img: '/assets/culture/utar-fiesta-2025.webp' },
  { slug: 'asian-physics-olympiad-2024', who: 'Asian Physics Olympiad 2024', what: 'IAQ backed the young physicists', img: '/assets/newsroom/asian-physics-olympiad-2024.webp' },
  { slug: 'matrade-paris-talent-development', who: 'MATRADE Paris', what: 'Talent development with the trade office in France', img: '/assets/newsroom/matrade-paris-talent-development.webp' },
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

/* the offset ScrollToTop (main.jsx) lands a hash with; the sticky nav is 75px tall */
const NAV_OFFSET = 70

/* An in-page Link to the hash the address already carries changes nothing in the router, so
   ScrollToTop never runs. Land it here in that one case; every other click is the router's. */
function jumpIfSameHash(e, id) {
  if (window.location.hash !== '#' + id) return
  e.preventDefault()
  const el = document.getElementById(id); if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -NAV_OFFSET })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: 'smooth' })
}

/* 24 Sep (Bazil: "do not put an icon in a box in a box", "our icons look better"): the four reasons carry the site's own
   isometric marks, bare on the card: the construction crane, the career steps, the globe, the people */
const WHY_MARK = [
  () => <span className="cr-why-mk" aria-hidden="true" dangerouslySetInnerHTML={{ __html: CYCLE_SVG.con }} />,
  () => <MarkGrw className="cr-why-mk" aria-hidden="true" />,
  () => <MarkCtr className="cr-why-mk" aria-hidden="true" />,
  () => <MarkEmp className="cr-why-mk" aria-hidden="true" />,
]

/* 24 Sep (Bazil: "this is culture bro, use better visual"): three of IAQ's own team photographs, crossfading with a
   slow drift, behind the 1995 section. Newsroom photographs, each used once on the page. */
const ORIGIN_PICS = [
  { src: '/assets/newsroom/mciea-2024-awards-night-team.webp', pos: '50% 40%' },
  { src: '/assets/newsroom/annual-dinner-2024.webp', pos: '50% 45%' },
  { src: '/assets/newsroom/beijing-team-retreat-2024.webp', pos: '50% 50%' },
]
function OriginClip() {
  return (
    <div className="cu-origin-bg" aria-hidden="true">
      {ORIGIN_PICS.map((p, i) => <img key={p.src} src={p.src} alt="" loading={i ? 'lazy' : 'eager'} decoding="async" style={{ objectPosition: p.pos, '--i': i }} />)}
    </div>
  )
}

export default function Careers() {
  /* derived, not typed: totRoles is already computed this way in the scene */
  const nRoles = ROLES.length
  const nLocs = new Set(ROLES.map(r => r.loc)).size
  const nDepts = new Set(ROLES.map(r => r.dept)).size
  const cu = useRef(null)

  useEffect(() => {
    document.title = 'IAQ Group · Careers · Brand Method'
    return initCareers()
  }, [])
  /* momentum drift for every photo frame marked data-mo (lib/momentum.js) */
  useMomentum()

  /* ---- the culture section's reveal and count up ----
     a layout effect, so the hidden start state is in place before the first paint. Ported whole
     from the culture page. Only .cu-rv inside the culture wrapper is touched; the hidden state
     exists only under .cu-armed, so with this effect never running everything is visible. */
  useLayoutEffect(() => {
    const el = cu.current
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

    /* a scroll that outruns the observer, or a jump to #roles past the whole section, still releases
       everything above the fold */
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

  return (
    <>
      <Nav />

      {/* ═══════════════════════════════════════════════════════════════════
          1 · CULTURE, the top section
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="cu-page" id="culture" ref={cu} data-mo-skip="">
        {/* ── 1.1 · Opening statement over the team ─────────────────────── */}
        <header className="cu-hero">
          <div className="cu-w cu-hero-in">
            <div className="cu-hero-copy">
              <h1 className="cu-h1 cu-rv">
                <span className="cu-ln"><span>The people behind</span></span>{' '}
                <span className="cu-ln"><em>the cleanest rooms.</em></span>
              </h1>
              <p className="cu-lede cu-rv" style={{ '--d': '.12s' }}>
                450 people in seven countries build facilities that must hold their class. How the team works, and the roles open now.
              </p>
              <div className="cu-ctas cu-rv" style={{ '--d': '.2s' }}>
                <Link className="cu-btn" to="/careers#roles" onClick={e => jumpIfSameHash(e, 'roles')}>See open roles <Arrow /></Link>
                {/* 24 Sep (Bazil: "no need this button"): one action in the hero; HR is in the closing band */}
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

        {/* ── 1.2 · Where it started ─────────────────────────────────────── */}
        {/* 24 Sep (Bazil: "make a nice visual banner behind, maybe video moving"): the cleanroom ceiling fit-out clip
            already on file runs slowly behind the section under a dark scrim. No src until the section is near,
            paused off screen, poster only under reduced motion (OriginClip below). */}
        <section className="cu-sec cu-origin" aria-labelledby="cu-origin-h">
          <OriginClip />
          <div className="cu-w cu-origin-in">
            <div className="cu-origin-copy">
              {/* 24 Sep (Bazil: "the 1995 on top of the title") */}
              <div className="cu-year-big cu-rv" aria-hidden="true">1995</div>
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

        {/* ── 1.3 · Values, each beside its record ───────────────────────── */}
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

        {/* ── 1.4 · Safety record ────────────────────────────────────────────
            Two separate claims, each with its own figure, date and photograph:
              · 2.6 million: crossed 28 February 2025 on the XFAB 40K Expansion Project (newsroom 28 Feb 2025)
              · DOSH Kuching: July 2025, banner "2.74 million Safe Manhours without LTI" (newsroom 3 Jul 2025)
            Zero LTI: the client wafer fab building IAQ delivered with zero lost time injury (newsroom 1 Jun 2023). */}
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

        {/* ── 1.5 · Learning and growth ──────────────────────────────────── */}
        <section className="cu-sec cu-grow" id="cu-grow" aria-labelledby="cu-grow-h">
          <div className="cu-w">
            <div className="cu-head">
              <h2 id="cu-grow-h" className="cu-h2 cu-h2-mk cu-rv"><DmGrow className="cu-hmk" aria-hidden="true" /><span>Where engineers <em>start and grow.</em></span></h2>
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
                <p className="cu-p">IAQ signed a strategic collaboration with University of Malaya in May 2025. Its engineers also meet students on campus.</p>
                {bySlug('university-malaya-strategic-collaboration') && (
                  <Link className="cu-uni-lead" to="/news/university-malaya-strategic-collaboration">
                    {/* the collaboration post carries no usable photo (AI watermark); the June workshop on the same campus is the picture */}
                    <Photo className="cu-uni-lead-pic" src="/assets/culture/um-workshop-2025.webp" mo={0.5} alt="IAQ engineers with students at the University of Malaya workshop, June 2025" />
                    <span className="cu-uni-lead-t"><span className="cu-cd">May to June 2025</span><b>A strategic collaboration with University of Malaya, then a workshop for its students</b><span className="cu-link">Read the story <Arrow /></span></span>
                  </Link>
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

        {/* 25 Sep (Bazil: "remove this info"): the People, by name section is off this page and off Culture */}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2 · CAREERS, the bottom section
          ═══════════════════════════════════════════════════════════════════ */}
      {/* 14 Sep: data-mo-skip on the head. The band runs its own CSS entrance (bandUp, careers.css), and
          lib/motion.js used to tween the same heading and lede: it read their values while the CSS
          animation still held them at opacity 0, so it tweened them TO invisible and the headline
          never appeared. One animation per element.
          18 Sep: the page's h1 is the culture opening above, so this band's title is an h2 wearing the
          same size (careers.css .head-h1). */}
      <div className="headband cr-band"><div className="hb" aria-hidden="true"><img src="/assets/photo-awards.webp" alt=""  loading="lazy" decoding="async" /></div><header className="head wrap" data-mo-skip="">
        <span className="eyebrow">Careers</span>
        <h2 className="head-h1">Open roles, <em>by department.</em></h2>
        <p className="lede">Engineering, project delivery, commercial and finance roles, on facilities that have to work to the micron.</p>
        <div className="head-stats">
          <div className="hchip"><b id="totRoles">{nRoles}</b><span>Open roles</span></div>
          <div className="hchip"><b>{nLocs}</b><span>Hiring locations</span></div>
          <div className="hchip"><b>{nDepts}</b><span>Departments</span></div>
          {/* 450 people is site canon (About, Home) and it speaks to a candidate. */}
          <div className="hchip"><b>450</b><span>People</span></div>
        </div>
      </header></div>

      {/* #roles is the landing for the nav's Careers row and the hero's "See open roles": the console
          under the nav, the list right below it. The wrapper also bounds the console's sticky range to
          the list, so the filters do not ride over the sections that follow. */}
      <div className="cr-roles" id="roles">
        <div className="console"><div className="wrap">
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="2.6" /></svg>Location</span>
            <div className="chips" id="fLoc"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>Department</span>
            <div className="chips" id="fDept"></div>
          </div>
          {/* a third facet, derived from the job title rather than a field HR was never
              asked for: "Senior Engineer, Process" and "Manager, Project" both state
              their level in the title */}
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>Level</span>
            <div className="chips" id="fLevel"></div>
          </div>
          <div className="row">
            <span className="flabel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>Search</span>
            <label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg><input id="q" type="search" placeholder="Role, keyword, e.g. mechanical" aria-label="Search roles" /></label>
            <button className="clearbtn" id="clear" type="button">Reset</button>
            <span className="readout" id="readout" role="status" aria-live="polite"></span>
          </div>
        </div></div>

        <main className="wrap">
          <div className="joblist" id="joblist"></div>
          <div className="empty" id="empty">
            <h3>Try another combination</h3>
            <p>Loosen a filter or clear the search. New roles appear here the moment HR publishes them.</p>
          </div>
          <p className="note">Roles are published by IAQ HR. Applications go to {HR_EMAIL}</p>
        </main>
      </div>

      {/* ── For candidates ───────────────────────────────────────────────────
          Everything stated here is drawn from what the site already publishes
          about how IAQ delivers; nothing about pay, benefits or headcount growth
          is asserted, because IAQ has not published any of it. */}
      {/* 17 Sep (client, on the feedback deck: "Maybe we can have the working culture /
          opportunities here:", with the four points written out). Their words, kept whole, in
          data/careersWhy.js so the vacancy pages read the same four. */}
      <section className="pg-sec cr-why" aria-labelledby="cr-why-h">
        <div className="wrap">
          <span className="eyebrow">Working culture</span>
          <h2 id="cr-why-h">Why build your career <em>at IAQ.</em></h2>
          <div className="cr-why-grid">
            {WHY_JOIN.map((w, i) => (
              <article className="cr-why-c" key={w.t}>
                {/* 24 Sep (Bazil: "make this look a lot better"): a mark for each reason instead of a grey numeral */}
                {WHY_MARK[i]()}
                <h3>{w.t}</h3>
                <p>{w.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 24 Sep (Bazil: "no need to be too long and detailed, not a hiring agency"): the What the work is block, the
          four application steps and the two route boxes are gone. The roles list, the four reasons and the HR
          address in the closing band are the page. */}

      {/* the one closing band on the page (the culture page's own is gone with the page) */}
      <section className="close3d dark-band" id="contact">
        <div className="close-in wrap split">
  {/* the sitemap sits in this grid's LEFT column, level with the contact block */}
  <FooterNav />
          <div>
            {/* this used to read START A PROJECT / "Tell us what you are building",
                addressing a client, on the careers page */}
            <span className="eyebrow u-sig"><span data-scramble>JOIN THE TEAM</span></span>
            <h2 className="u-mt14 close-h">Send a CV</h2>
            <p className="lede u-mt16">Sixteen roles are open across four departments. For a role that is missing here, send the CV to HR; every application is read.</p>
            <ContactCta />
          </div>
          {/* the same open ledger rows as every other closing block, pointed at HR
              rather than at sales */}
          <div className="close-cards">
            <a className="crow" href={`mailto:${HR_EMAIL}`}><span className="ref">Recruitment</span><b>{HR_EMAIL}</b><i aria-hidden="true">&#8594;</i></a>
            <a className="crow" href={speculativeHref}><span className="ref">No role fits</span><b>Send a speculative CV</b><i aria-hidden="true">&#8594;</i></a>
            <div className="crow is-static"><span className="ref">HQ &middot; Shah Alam</span><b className="adr">No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</b></div>
          </div>
        </div>
        <CloseAmbient />
        <Footer note="Career page concept · Brand Method" nav={false} />
      </section>
    </>
  )
}
