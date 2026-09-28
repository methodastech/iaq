import ContactCta from '../components/ContactCta.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import FooterNav from '../components/FooterNav.jsx'
import CloseAmbient from '../components/CloseAmbient.jsx'
import initProjectPage from '../scenes/project.js'
import SaveProject from '../components/SaveProject.jsx'
import Tour360 from '../components/Tour360.jsx'
import Icon from '../components/FlowIcon.jsx'
import '../styles/shortlist.css'
import { INDLBL, REGLBL, TYPLBL, ICONS, CLOGOS, BLURB, SCOPES, pad3 } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import { PROJECT_DETAIL, CLASS_MEANING, DELIVERY_NOTE } from '../data/projectDetail.js'
import { CYCLE } from '../data/cycle.js'

/* registry industry key -> the market page that argues that sector */
const MARKET_ROUTE = {
  semiconductor: '/markets/semiconductor', 'data-centre': '/markets/data-centre',
  'ev-battery': '/markets/ev-battery', photovoltaic: '/markets/photovoltaics',
  pharma: '/markets/bio-lifescience', fnb: '/markets/food-beverage',
  'district-cooling': '/markets/district-cooling',
}
import '../styles/pages.css'
import '../styles/project.css'
import { crumbLd } from '../components/PageHead.jsx'

/* ============================================================================
   The case study template (14 Sep, Bazil: "every project page needs to have more
   visuals and better icons and story").

   Built to IAQ's own case study format (checklist pn3): title; sector, location,
   year; the brief in three lines; scope delivered as a list; the numbers (class,
   m², systems, duration); the story in three beats; 6 to 10 photos and one video;
   the business units involved; related projects.

   The honesty rule is unchanged. Every value is registry data or a verified profile
   field (data/projectDetail.js). Anything IAQ has not supplied renders as one tidy
   "Supplied by IAQ" slot, and every image that is not this project is labelled as
   sector imagery or illustration on the image itself.
   ============================================================================ */

/* the line icon that stands for each market, from the house set */
const IND_ICON = {
  semiconductor: 'chip', 'data-centre': 'server', 'ev-battery': 'battery', photovoltaic: 'sun',
  pharma: 'flask', fnb: 'bottle', 'district-cooling': 'snow',
}
/* the market banner photograph, used only as labelled sector imagery */
const MKT_IMG = {
  semiconductor: 'mkt-semiconductor', 'data-centre': 'mkt-data-centre', 'ev-battery': 'mkt-ev-battery',
  photovoltaic: 'mkt-photovoltaics', pharma: 'mkt-bio-lifescience', fnb: 'mkt-food-beverage',
  'district-cooling': 'mkt-district-cooling',
}
/* stage stills for the six cycle stages, in CYCLE order. Illustrations of the cycle, not of a site */
const STAGE_IMG = ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup']
  .map(k => `/assets/cycle3d/stage-${k}-card.jpg`)

/* the three business units, names and routes as the services hub and nav carry them */
const UNITS = [
  /* 14 Sep: the same three photographs and one-liners as the Services menu (Bazil found the white
     display wall behind EPC unclear), as 640x400 crops instead of the 2560px banners */
  { key: 'EPC', name: 'EPC', line: 'Bought as EPCC or EPCM. Builds the facility.', to: '/services/epc-construction', icon: 'crane', img: '/assets/menu/u-epc-m.webp' },
  /* 15 Sep: in IAQ's own numbered order (Discovery A2.1): EPC 1, utilities and tool installation 2, energy 3 */
  { key: 'Hookup', name: 'Process Critical Utilities & Total Tool Installation Solutions', line: 'Re-equips a live semiconductor fab.', to: '/services/tool-installation', icon: 'link', img: '/assets/menu/u-hookup-m.webp' },
  { key: 'EFM', name: 'EFM', line: 'Energy Facility Management. Runs and maintains it.', to: '/services/energy-management', icon: 'power', img: '/assets/menu/u-efm-m.webp' },
]

/* a scope or system line -> the icon that names it. Presentation only: it reads the
   words already on record and never adds a system that is not there. */
function scopeIcon(s) {
  const t = String(s).toLowerCase()
  if (/dry room/.test(t)) return 'dewpoint'
  if (/cleanroom/.test(t)) return 'particle'
  if (/hookup/.test(t)) return 'link'
  if (/civil|structural|architect|epcc|carpark|csa/.test(t)) return 'building'
  if (/gas/.test(t)) return 'gas'
  if (/chemical/.test(t)) return 'flask'
  if (/fire/.test(t)) return 'shield'
  if (/bms|fmcs|instrumentation|controls/.test(t)) return 'gauge'
  if (/chill|condenser|cooling|wcct|thermal/.test(t)) return 'snow'
  if (/air-conditioning|acmv|hvac/.test(t)) return 'airflow'
  if (/erection/.test(t)) return 'crane'
  if (/mechanical|m&e|mep/.test(t)) return 'gear'
  if (/substation|electrical/.test(t)) return 'power'
  if (/plumbing|water|sanitary|piping/.test(t)) return 'water'
  if (/process utilit/.test(t)) return 'cycle'
  if (/commissioning|testing|validation|verification/.test(t)) return 'check'
  if (/plant|facility|build/.test(t)) return 'factory'
  if (/iso|environment|design/.test(t)) return 'drawing'
  return 'check'
}

/* the class string trimmed to its ISO part, for the hero chip and the numbers band.
   The full string with the US Class equivalents stays in the class card. */
function isoShort(d) {
  if (d && d.isoDetail) return d.isoDetail.split('(')[0].trim().replace(/[,&]\s*$/, '')
  if (d && d.isoNotApplicable) return 'Engineered space'
  return null
}

/* registry captions carry a middot separator; the page copy rule is colons */
const capText = c => String(c || 'Site photo').replace(/\s*·\s*/g, ': ')

/* registry card, identical markup to the ported registry renderer */
function RelCard({ idx }) {
  const p = PROJECTS[idx]
  return (
    <Link className="pc" to={`/projects/${idx}`}>
      {p.img ? (
        <div className="pcv photo"><div className="clip"><img src={p.img} alt={`${p.client} project`} loading="lazy" /></div><span className="ph-cap">{capText(p.cap)}</span></div>
      ) : (
        <div className="pcv"><div className="grid-bg"></div><span className="ph-ico" dangerouslySetInnerHTML={{ __html: ICONS[p.ind] || '' }} /><span className="ph-cap">{INDLBL[p.ind]}: photo at production</span></div>
      )}
      <div className="pc-in">
        <div className="ref"><span>IAQ-PRJ-{pad3(idx + 1)}</span><span className="iso">{p.iso}</span></div>
        <h3>{p.name}</h3>
        <div className="cl">{CLOGOS[p.client] ? <img src={CLOGOS[p.client]} alt={p.client} loading="lazy" /> : p.client}</div>
        <div className="meta"><span>{p.loc}</span>{p.size ? <span>{p.size.toLocaleString('en-US')} m&sup2;</span> : null}</div>
        <div className="tags"><span className="tag b">{INDLBL[p.ind]}</span><span className="tag">{REGLBL[p.region]}</span><span className="tag">{TYPLBL[p.type]}</span></div>
      </div>
    </Link>
  )
}

/* the one "not supplied yet" mark used everywhere on the page */
const Slot = ({ children = 'Supplied by IAQ' }) => <span className="pd-chip">{children}</span>

/* one fact in the numbers band: icon, value, label. A missing value is a slot, not a dash */
function Fact({ icon, label, value }) {
  const has = value != null && value !== ''
  return (
    <div className={'pd-fact' + (has ? '' : ' is-slot')}>
      <span className="pd-ic" aria-hidden="true"><Icon name={icon} /></span>
      <div className="pd-ft">
        {has ? <b className="pd-fv">{value}</b> : <b className="pd-fv"><Slot /></b>}
        <span className="pd-fl">{label}</span>
      </div>
    </div>
  )
}

/* full-screen viewer for the gallery. Arrow keys and Escape; the image is sized by the
   flex box rather than vh, so the 1.12 desktop zoom cannot push it off screen */
function Lightbox({ items, at, setAt }) {
  const close = useCallback(() => setAt(-1), [setAt])
  const n = items.length
  useEffect(() => {
    if (at < 0) return
    const onKey = e => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setAt(i => (i + 1) % n)
      if (e.key === 'ArrowLeft') setAt(i => (i - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); html.style.overflow = prev }
  }, [at, n, close, setAt])
  if (at < 0 || !items[at]) return null
  const it = items[at]
  return (
    <div className="pd-lb" role="dialog" aria-modal="true" aria-label="Project media" onClick={close}>
      <div className="pd-lb-stage" onClick={e => e.stopPropagation()}>
        {it.kind === 'video'
          ? <video src={it.src} poster={it.poster} controls autoPlay playsInline />
          : <img src={it.src} alt={it.cap} />}
      </div>
      <div className="pd-lb-bar" onClick={e => e.stopPropagation()}>
        <span className="pd-lb-cap">{it.rep ? <em>{it.rep}</em> : null}{it.cap}</span>
        <span className="pd-lb-ctl">
          {n > 1 && <button type="button" onClick={() => setAt((at - 1 + n) % n)} aria-label="Previous">&larr;</button>}
          {n > 1 && <span className="pd-lb-n">{at + 1} of {n}</span>}
          {n > 1 && <button type="button" onClick={() => setAt((at + 1) % n)} aria-label="Next">&rarr;</button>}
          <button type="button" onClick={close}>Close</button>
        </span>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const v = parseInt(id, 10)
  const PIDX = v >= 0 && v < PROJECTS.length ? v : 0
  const P = PROJECTS[PIDX]
  const D = PROJECT_DETAIL[PIDX] || null
  const [lb, setLb] = useState(-1)

  useEffect(() => {
    document.title = 'IAQ Group · ' + P.name + ' · ' + INDLBL[P.ind] + ' · Brand Method'
    setLb(-1)
  }, [PIDX])
  useEffect(() => initProjectPage(), [])

  /* related: same industry first, then nearest neighbours */
  const rel = []
  PROJECTS.forEach((p, i) => { if (i !== PIDX && p.ind === P.ind) rel.push(i) })
  for (let r2 = 1; rel.length < 3 && r2 < PROJECTS.length; r2++) {
    const cand = (PIDX + r2) % PROJECTS.length
    if (cand !== PIDX && rel.indexOf(cand) < 0) rel.push(cand)
  }
  const related = rel.slice(0, 3)
  const pv = (PIDX - 1 + PROJECTS.length) % PROJECTS.length
  const nx = (PIDX + 1) % PROJECTS.length

  const ind = INDLBL[P.ind]
  /* registry locations can open lower case ('the northern corridor, Kedah'); a fact tile or chip starts a line */
  const loc = P.loc ? P.loc.charAt(0).toUpperCase() + P.loc.slice(1) : P.loc
  const cls = isoShort(D)
  const isDry = !!(D && D.isoDetail === 'Dry room')
  const area = (D && D.builtUp) || (P.size ? P.size.toLocaleString('en-US') + ' m²' : null)
  const sysN = D && D.systems ? D.systems.length : 0
  const role = (D && D.role) || null
  const roleNote = role && DELIVERY_NOTE[role]
  const year = D && D.year
  const duration = D && D.duration
  const story = D && D.story
  const brief = D && Array.isArray(D.brief) ? D.brief : null

  /* ---- media: the project's own photographs first, then labelled sector imagery ---- */
  const own = D && Array.isArray(D.photos) && D.photos.length
    ? D.photos.map(x => (typeof x === 'string' ? { src: x, cap: 'Site photo' } : x))
    : (P.img ? [{ src: P.img, cap: capText(P.cap) }] : [])
  const REP = 'Sector imagery, not this project'
  const reps = [
    { src: `/assets/banners/${MKT_IMG[P.ind] || 'mkt-hub'}.jpg`, cap: `${ind} facilities`, rep: REP },
    { src: `/assets/industries/${P.ind}.webp`, cap: `A typical ${ind} facility, illustrated`, rep: 'Illustration, not this project' },
  ]
  const media = [...own, ...reps]
  if (D && D.video) media.push({ kind: 'video', src: D.video.src, poster: D.video.poster || P.img, cap: D.video.cap || 'Project film' })
  const at = src => media.findIndex(m => m.src === src)
  const tiles = [own[0] || reps[0], own[1] || (own[0] ? reps[0] : reps[1]), own[2] || (own[0] ? reps[1] : null)].filter(Boolean)
  const photoCount = own.length
  const morePhotos = own.length > 3 ? own[3] : null

  /* ---- the pn3 record, so the open items read as a plan rather than as gaps ---- */
  const numbersIn = [cls, area, sysN || null, duration].filter(Boolean).length
  const record = [
    ['Title, sector and location', true],
    ['Year', !!year],
    ['The brief', !!(brief || (D && D.summary))],
    ['Scope delivered', !!(D && D.scopeOfWorks)],
    [`The numbers, ${numbersIn} of 4`, numbersIn === 4],
    ['The story in three beats', !!story],
    [`Photos, ${photoCount} of 6 to 10`, photoCount >= 6],
    ['Project film', !!(D && D.video)],
    ['Business units', !!(D && D.units)],
    ['Related projects', true],
  ]
  const recDone = record.filter(r => r[1]).length

  const beats = [
    { k: 'challenge', no: '1', title: 'The challenge', icon: 'target', prompt: 'What made the site, the programme or the class demanding.',
      rec: D && D.siteType ? ['Site on record', D.siteType] : null },
    { k: 'approach', no: '2', title: 'The approach', icon: 'cycle', prompt: 'How IAQ planned, built and proved the facility.',
      rec: role ? ['Contract on record', role] : null },
    { k: 'result', no: '3', title: 'The result', icon: 'flag', prompt: 'What was handed over, when, and how it performs.',
      rec: area ? ['Area on record', area] : null },
  ]
  const stagesOn = D && Array.isArray(D.stages) ? D.stages : null
  const unitsOn = D && Array.isArray(D.units) ? D.units : null

  return (
    <>
      <Nav />

      <div className="prj-hero">
        {P.img ? <img id="prjHero" src={P.img} alt="" /> : null}
        <div className="prj-scrim" aria-hidden="true"></div>
        <div className="prj-head wrap">
          <nav className="pg-crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">&rsaquo;</span><Link to="/projects">Projects</Link>
            {/* 11 Sep audit (P50): the trail was here but the machine-readable list was not, so
                project pages were the one template search engines could not place. */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd([{ label: 'Home', to: '/' }, { label: 'Projects', to: '/projects' }, { label: P.name, to: `/projects/${PIDX}` }])) }} />
          </nav>
          <h1 id="prjTitle">{P.name}</h1>
          {/* pn3 line two: sector, location, year. The year shows only once IAQ supplies it */}
          <div className="pd-meta" id="prjChips">
            <span><Icon name={IND_ICON[P.ind] || 'factory'} />{ind}</span>
            <span><Icon name="pin" />{loc}</span>
            {year ? <span><Icon name="calendar" />{year}</span> : null}
            <span><Icon name="building" />{P.client}</span>
          </div>
          <div className="prj-save"><SaveProject id={PIDX} label={P.name} /></div>
        </div>
      </div>

      {/* ---- the numbers: registry facts and verified profile figures, eight icon facts ---- */}
      <section className="pd-band" aria-label="Project facts">
        <div className="wrap">
          <div className="pd-facts">
            <Fact icon={IND_ICON[P.ind] || 'factory'} label="Market" value={ind} />
            <Fact icon="pin" label="Location" value={loc} />
            <Fact icon={isDry ? 'dewpoint' : 'particle'} label={isDry ? 'Environment' : 'Cleanroom class'} value={cls} />
            <Fact icon="area" label="Built-up area" value={area} />
            <Fact icon="layers" label="Systems on record" value={sysN ? `${sysN} system${sysN > 1 ? 's' : ''}` : null} />
            <Fact icon="file" label="Contract role" value={role} />
            <Fact icon="clock" label="Duration" value={duration} />
            <Fact icon="calendar" label="Completed" value={year} />
          </div>

          {/* ---- photos and film. The project's photographs lead; sector imagery is labelled on the image ---- */}
          <div className="pd-gal" aria-label="Photos and film">
            {tiles.map((t, i) => (
              <button type="button" key={t.src + i} className={'pd-tile' + (i === 0 ? ' is-lead' : '') + (t.rep ? ' is-rep' : '')} onClick={() => setLb(at(t.src))} aria-label={`Open ${t.cap}`}>
                <img src={t.src} alt="" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
                {t.rep ? <span className="pd-rep">{t.rep}</span> : null}
                <span className="pd-cap">{t.cap}</span>
              </button>
            ))}
            {D && D.video ? (
              <button type="button" className="pd-tile is-film" onClick={() => setLb(media.length - 1)} aria-label="Play the project film">
                <img src={D.video.poster || P.img} alt="" loading="lazy" decoding="async" />
                <span className="pd-play" aria-hidden="true"><Icon name="play" /></span>
                <span className="pd-cap">{D.video.cap || 'Project film'}</span>
              </button>
            ) : (
              <div className="pd-tile is-slot">
                <span className="pd-sic" aria-hidden="true"><Icon name="play" /></span>
                <b>Project film</b>
                <Slot />
              </div>
            )}
            {morePhotos ? (
              <button type="button" className="pd-tile is-more" onClick={() => setLb(3)} aria-label={`View all ${photoCount} photos`}>
                <img src={morePhotos.src} alt="" loading="lazy" decoding="async" />
                <span className="pd-more-n">+{photoCount - 3} photos</span>
              </button>
            ) : (
              <div className="pd-tile is-slot">
                <span className="pd-sic" aria-hidden="true"><Icon name="camera" /></span>
                <b>Photography, {photoCount} of 6 to 10</b>
                <Slot />
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="prj-grid wrap">
        <article className="prj-body">

          {/* ---- 1 the brief ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">The brief</h2>
            {brief ? (
              <ul className="pd-brief" id="prjBrief">{brief.map((l, i) => <li key={i}>{l}</li>)}</ul>
            ) : D && D.summary ? (
              <p className="pd-lede" id="prjBrief">{D.summary}</p>
            ) : (
              <p className="pd-lede" id="prjBrief">{P.name}, {P.loc}.</p>
            )}
            {!brief ? <p className="pd-slotline"><Slot /><span>The full brief in three lines.</span></p> : null}
            {D && D.attribution ? <p className="pd-attr">{D.attribution}</p> : null}

            <div className="pd-ctx">
              <div className="pd-ctx-t">
                <span className="pd-ctx-k"><Icon name={IND_ICON[P.ind] || 'factory'} />Sector context, not project specific</span>
                <p>{ind} work is delivered into {BLURB[P.ind]}.</p>
                <Link className="pd-link" to={MARKET_ROUTE[P.ind] || '/markets'}>The {ind} market</Link>
              </div>
              <img src={`/assets/industries/${P.ind}.webp`} alt="" loading="lazy" decoding="async" />
            </div>
          </section>

          {/* ---- 2 scope delivered ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">Scope delivered</h2>
            {D && D.scopeOfWorks ? (
              <>
                <ul className="pd-scope" id="prjScope">
                  {D.scopeOfWorks.map((s, i) => (
                    <li key={i}><span className="pd-ic sm" aria-hidden="true"><Icon name={scopeIcon(s)} /></span><span>{s}</span></li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="pd-slotline" id="prjScope"><Slot /><span>The scope delivered on this project, as a list.</span></p>
                <p className="pd-typk">Typical scope in {ind}, sector context</p>
                <ul className="pd-scope is-typical">
                  {(SCOPES[P.ind] || []).map((s, i) => (
                    <li key={i}><span className="pd-ic sm" aria-hidden="true"><Icon name={scopeIcon(s)} /></span><span>{s}</span></li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* ---- 3 the story in three beats ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">The story</h2>
            <ol className="pd-beats">
              {beats.map(b => {
                const txt = story && story[b.k]
                return (
                  <li key={b.k} className={'pd-beat' + (txt ? '' : ' is-slot')}>
                    <div className="pd-beat-hd">
                      <span className="pd-ic" aria-hidden="true"><Icon name={b.icon} /></span>
                      <span className="pd-no">{b.no}</span>
                    </div>
                    <h3>{b.title}</h3>
                    {txt ? <p>{txt}</p> : <p className="pd-prompt">{b.prompt}</p>}
                    {!txt ? <Slot /> : null}
                    {b.rec ? <p className="pd-onrec"><span>{b.rec[0]}</span>{b.rec[1]}</p> : null}
                  </li>
                )
              })}
            </ol>
          </section>

          {/* ---- 4 the approach, stage by stage: IAQ's delivery cycle ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">How IAQ delivers</h2>
            <p className="pd-slotline">
              {stagesOn
                ? <span>The stages IAQ carried on this project are marked.</span>
                : <><Slot /><span>The stages used on this project. Stage images illustrate the cycle.</span></>}
            </p>
            <div className="pd-stages">
              {CYCLE.map((s, i) => {
                const off = stagesOn && stagesOn.indexOf(s.short) < 0
                return (
                  <Link key={s.no} to={s.route} className={'pd-stage' + (off ? ' is-off' : '') + (stagesOn && !off ? ' is-on' : '')}>
                    <span className="pd-stage-img"><img src={STAGE_IMG[i]} alt="" loading="lazy" decoding="async" /></span>
                    <span className="pd-stage-b">
                      <span className="pd-stage-hd"><Icon name={s.icon} /><b>{s.no}. {s.short}</b></span>
                      <span className="pd-stage-l">{s.line}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ---- 5 class and contract ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">Class and contract</h2>
            <div className="pd-two">
              <div className="pd-card">
                <span className="pd-ic" aria-hidden="true"><Icon name={isDry ? 'dewpoint' : 'particle'} /></span>
                <span className="pd-card-k">{isDry ? 'Environment' : 'Cleanroom class'}</span>
                {D && D.isoDetail ? <b className="pd-card-v red">{D.isoDetail}</b>
                  : D && D.isoNotApplicable ? <b className="pd-card-v">Engineered space, outside a cleanroom class</b>
                  : <b className="pd-card-v"><Slot /></b>}
                <p><span className="pd-in">In {ind}:</span> {CLASS_MEANING[P.ind]}</p>
              </div>
              <div className="pd-card">
                <span className="pd-ic" aria-hidden="true"><Icon name="file" /></span>
                <span className="pd-card-k">Contract role</span>
                {role ? <b className="pd-card-v">{role}</b> : <b className="pd-card-v"><Slot /></b>}
                <p>{roleNote || `Registered as ${/[A-Z]{2}/.test(TYPLBL[P.type]) ? TYPLBL[P.type] : TYPLBL[P.type].toLowerCase()} work. The contract form for this reference is confirmed by IAQ.`}</p>
                <Link className="pd-link" to="/services">The delivery cycle</Link>
              </div>
            </div>
          </section>

          {/* ---- 6 business units involved ---- */}
          <section className="pd-sec">
            <h2 className="pd-h">Business units</h2>
            <p className="pd-slotline">
              {unitsOn
                ? <span>The units that carried this project are marked.</span>
                : <><Slot /><span>Which of IAQ&rsquo;s three business units carried this project.</span></>}
            </p>
            <div className="pd-units">
              {UNITS.map(u => {
                const off = unitsOn && unitsOn.indexOf(u.key) < 0
                return (
                  <Link key={u.key} to={u.to} className={'pd-unit' + (off ? ' is-off' : '') + (unitsOn && !off ? ' is-on' : '')}>
                    <span className="pd-unit-img"><img src={u.img} alt="" loading="lazy" decoding="async" /></span>
                    <span className="pd-unit-b">
                      <span className="pd-ic sm" aria-hidden="true"><Icon name={u.icon} /></span>
                      <span><b>{u.name}</b><i>{u.line}</i></span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* ---- the walkthrough, only where a capture exists: no dead frame otherwise ---- */}
          {P.tour ? (
            <section className="pd-sec">
              <h2 className="pd-h">Walk the facility</h2>
              <Tour360 src={P.tour} poster={P.img} label={P.name} />
            </section>
          ) : null}

          {/* ---- provenance: every fact above is checkable against one page ---- */}
          <p className="pd-prov">
            {D
              ? `Source: ${D.source}, and the approved project registry. Client names are withheld.`
              : 'Source: the approved project registry. Client names are withheld.'}
          </p>
        </article>

        <aside className="prj-side">
          <div className="ps-card">
            <span className="pd-ref">IAQ-PRJ-{pad3(PIDX + 1)}</span>
            <div className="ps-logo" id="prjLogo">{CLOGOS[P.client] ? <img src={CLOGOS[P.client]} alt={P.client} loading="lazy" decoding="async" /> : <span className="txt">{P.client}</span>}</div>
            <p className="pd-side-sub">{TYPLBL[P.type]}, {P.loc}</p>

            <div className="pd-rec">
              <div className="pd-rec-hd"><b>Case study record</b><span>{recDone} of {record.length}</span></div>
              <span className="pd-bar" aria-hidden="true"><i style={{ width: `${Math.round(recDone / record.length * 100)}%` }} /></span>
              <ul>
                {record.map(([t, ok]) => (
                  <li key={t} className={ok ? 'ok' : ''}>
                    <span className="pd-tick" aria-hidden="true">{ok ? <svg viewBox="0 0 12 12"><path d="m2.5 6.2 2.3 2.3 4.7-4.9" /></svg> : null}</span>
                    <span>{t}</span>
                    <span className="pd-sr">{ok ? 'in' : 'supplied by IAQ'}</span>
                  </li>
                ))}
              </ul>
              <p className="pd-rec-note">Open items are supplied by IAQ.</p>
            </div>
            <Link className="cta" to="/contact">Start a project</Link>
          </div>
          {/* rule 02: every project points back to its market and to the capability behind it */}
          <div className="ps-links">
            <span className="ps-k">Where this sits</span>
            <Link to={MARKET_ROUTE[P.ind] || '/markets'}>{ind} market</Link>
            <Link to="/services">The six services</Link>
            <Link to={`/projects#${P.ind}`}>See all {ind} projects</Link>
          </div>
          <Link className="ps-back" to="/projects">&larr; All projects</Link>
        </aside>
      </main>

      <section className="prj-rel"><div className="wrap">
        <h2 id="relTitle">Related projects</h2>
        <div className="reg" id="relReg">{related.map(idx => <RelCard key={idx} idx={idx} />)}</div>
        <div className="prj-pager">
          <Link id="prevP" to={`/projects/${pv}`}>
            {PROJECTS[pv].img ? <img src={PROJECTS[pv].img} alt="" loading="lazy" decoding="async" /> : null}
            <span><small>&larr; Previous project</small><b>{PROJECTS[pv].name}</b></span>
          </Link>
          <Link id="nextP" to={`/projects/${nx}`} className="nx">
            <span><small>Next project &rarr;</small><b>{PROJECTS[nx].name}</b></span>
            {PROJECTS[nx].img ? <img src={PROJECTS[nx].img} alt="" loading="lazy" decoding="async" /> : null}
          </Link>
        </div>
      </div></section>

      {/* 21 Sep: the inline copy of the closing band is gone; the shared, rebuilt one renders here */}
      <ClosingBand note="Registry concept · Brand Method" />

      <Lightbox items={media} at={lb} setAt={setLb} />
    </>
  )
}
