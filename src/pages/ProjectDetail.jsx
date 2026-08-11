import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import initProjectPage from '../scenes/project.js'
import SaveProject from '../components/SaveProject.jsx'
import Tour360 from '../components/Tour360.jsx'
import '../styles/shortlist.css'
import { INDLBL, REGLBL, TYPLBL, ICONS, CLOGOS, BLURB, pad3, fmtSize } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import { PROJECT_DETAIL, CLASS_MEANING, DELIVERY_NOTE } from '../data/projectDetail.js'

/* registry industry key -> the market page that argues that sector */
const MARKET_ROUTE = {
  semiconductor: '/markets/semiconductor', 'data-centre': '/markets/data-centre',
  'ev-battery': '/markets/ev-battery', photovoltaic: '/markets/photovoltaics',
  pharma: '/markets/bio-lifescience', fnb: '/markets/food-beverage',
  'district-cooling': '/markets/district-cooling',
}
import '../styles/pages.css'
import '../styles/project.css'

/* the class string trimmed to its ISO part, for the hero chip and the sticky card.
   The full string with the US Class equivalents stays in Standards and classes. */
function isoShort(d, P) {
  if (d && d.isoDetail) return d.isoDetail.split('(')[0].trim().replace(/[,&]\s*$/, '')
  if (d && d.isoNotApplicable) return 'Not applicable'
  return P.iso
}

/* registry card, identical markup to the ported registry renderer */
function RelCard({ idx }) {
  const p = PROJECTS[idx]
  return (
    <Link className="pc" to={`/projects/${idx}`}>
      {p.img ? (
        <div className="pcv photo"><div className="clip"><img src={p.img} alt={`${p.client} project`} loading="lazy" /></div><span className="ph-cap">{p.cap || 'Site photo'}</span></div>
      ) : (
        <div className="pcv"><div className="grid-bg"></div><span className="ph-ico" dangerouslySetInnerHTML={{ __html: ICONS[p.ind] || '' }} /><span className="ph-cap">{INDLBL[p.ind]} &middot; photo at production</span></div>
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

export default function ProjectDetail() {
  const { id } = useParams()
  const v = parseInt(id, 10)
  const PIDX = v >= 0 && v < PROJECTS.length ? v : 0
  const P = PROJECTS[PIDX]
  const D = PROJECT_DETAIL[PIDX] || null

  useEffect(() => {
    document.title = 'IAQ Group · ' + P.client + ' · ' + INDLBL[P.ind] + ' · Brand Method'
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

  const cls = isoShort(D, P)
  const chips = [P.client, P.loc, fmtSize(P), cls, TYPLBL[P.type]].filter(Boolean)

  /* every value below is either registry data or a verified profile field. Nothing
     falls back to prose that would read as a claim we cannot source. */
  const builtUp = (D && D.builtUp) || (P.size ? P.size.toLocaleString('en-US') + ' m²' : 'Not stated')
  const model = (D && D.role) || TYPLBL[P.type]
  const modelNote = (D && D.role && DELIVERY_NOTE[D.role])
    || `The registry records this as ${TYPLBL[P.type].toLowerCase()} scope. The company profile does not state the contract role for this reference.`

  return (
    <>
      <Nav />

      <div className="prj-hero">
        {P.img ? <img id="prjHero" src={P.img} alt="" /> : null}
        <div className="prj-scrim" aria-hidden="true"></div>
        <div className="prj-head wrap">
          <span className="eyebrow" id="prjRef">IAQ-PRJ-{pad3(PIDX + 1)} &middot; {INDLBL[P.ind]}</span>
          <h1 id="prjTitle">{P.name}</h1>
          <div className="prj-chips" id="prjChips">{chips.map((c, i) => <span key={i}>{c}</span>)}</div>
          <div className="prj-save"><SaveProject id={PIDX} label={P.name} /></div>
        </div>
      </div>

      {/* ---- 02 at a glance: registry facts and verified profile figures, nothing else ---- */}
      <section className="prj-glance">
        <div className="wrap">
          <span className="pg-k">At a glance</span>
          <div className="pg-stats prj-six">
            <div className="pg-stat"><b>IAQ-PRJ-{pad3(PIDX + 1)}</b><span>Reference</span></div>
            <div className="pg-stat"><b>{INDLBL[P.ind]}</b><span>Market</span></div>
            <div className="pg-stat"><b>{P.loc}</b><span>Location</span></div>
            <div className="pg-stat"><b>{D ? cls : 'Not stated'}</b><span>Cleanroom class</span></div>
            <div className="pg-stat"><b>{builtUp}</b><span>Built-up area</span></div>
            <div className="pg-stat"><b>{model}</b><span>Delivery model</span></div>
          </div>
        </div>
      </section>

      <main className="prj-grid wrap">
        <article className="prj-body">

          {/* ---- 03 the brief ---- */}
          <span className="pb-k">The brief</span>
          {D && D.summary ? (
            <p className="pb-lede" id="prjBrief">{D.summary}</p>
          ) : (
            <p className="pb-lede" id="prjBrief">
              {P.name} for {P.client} in {P.loc}.
              <span className="prj-flag">The company profile carries no written brief for this reference.</span>
            </p>
          )}
          <p className="prj-ctx" id="prjBrief2">
            <i>Sector context, not project specific</i>
            {INDLBL[P.ind]} work is delivered into {BLURB[P.ind]}.
          </p>
          {D && D.attribution ? <p className="prj-attr">{D.attribution}</p> : null}

          {/* ---- 04 scope of works ---- */}
          <span className="pb-k">Scope of works</span>
          {D && D.scopeOfWorks ? (
            <ul className="pb-scope" id="prjScope">{D.scopeOfWorks.map((s, i) => <li key={i}>{s}</li>)}</ul>
          ) : (
            <div className="pg-slot mini" id="prjScope">
              <div className="pg-slot-in">
                <span className="pg-slot-tag">Scope of works &middot; supplied by IAQ</span>
                <p>No entry in the IAQ company profile matches this project, so no scope is published here. IAQ supplies the works breakdown and this list fills in.</p>
              </div>
            </div>
          )}

                    {/* ---- 04b the walkthrough: the strongest proof IAQ already owns, placed where the
                    decision is made rather than on the homepage ---- */}
          <span className="pb-k">Walk the facility</span>
          <Tour360 src={P.tour} poster={P.img} label={P.name} />

{/* ---- 05 systems delivered, only where the scope names them ---- */}
          {D && D.systems ? (
            <>
              <span className="pb-k">Systems delivered</span>
              <div className="pg-chips prj-sys">{D.systems.map((s, i) => <span className="pg-chip" key={i}>{s}</span>)}</div>
            </>
          ) : null}

          {/* ---- 06 standards and classes ---- */}
          <span className="pb-k">Standards and classes</span>
          <p className="prj-class">
            {D && D.isoDetail ? D.isoDetail : (D && D.isoNotApplicable ? 'No cleanroom classification recorded' : 'Class not stated in the company profile')}
          </p>
          <p className="prj-classnote">{CLASS_MEANING[P.ind]}</p>

          {/* ---- 07 delivery model, pointing at the capability that carried it ---- */}
          <span className="pb-k">Delivery model</span>
          <p className="prj-class sm">{model}</p>
          <p className="prj-classnote">{modelNote}</p>
          <Link className="pg-more" to="/services">The five stage delivery cycle</Link>

          {photoFigure(P)}

          {/* ---- 08 what IAQ still owes on every case study ---- */}
          <span className="pb-k">Still to come</span>
          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Case study content &middot; supplied by IAQ</span>
              <b>What turns this reference into a case study</b>
              <p>Everything above is drawn from the IAQ company profile and the approved project registry. The record below does not exist in any source we hold, so it is not written here.</p>
              <ul>
                <li>The narrative: the challenge on site, the approach taken, the outcome at handover</li>
                <li>Start date and completion date</li>
                <li>Project photography, with written permission to publish</li>
                <li>A client quote, with the name and title cleared for use</li>
              </ul>
              <p>Supplied by IAQ. Brand Method drops each item into this page as it lands.</p>
            </div>
          </div>

          {/* ---- 09 provenance: every fact above is checkable against one page ---- */}
          <p className="pg-note prj-prov">
            {D
              ? `Source · ${D.source}. Client name, image and registry reference from the approved project concept.`
              : 'Source · no matching entry in the IAQ company profile. Client name, image and registry reference from the approved project concept.'}
          </p>
        </article>

        <aside className="prj-side">
          <div className="ps-card">
            <div className="ps-logo" id="prjLogo">{CLOGOS[P.client] ? <img src={CLOGOS[P.client]} alt={P.client}  loading="lazy" decoding="async" /> : <span className="txt">{P.client}</span>}</div>
            <dl id="prjFacts">
              <dt>Client</dt><dd>{P.client}</dd>
              <dt>Industry</dt><dd>{INDLBL[P.ind]}</dd>
              <dt>Location</dt><dd>{P.loc}</dd>
              <dt>Delivery</dt><dd>{model}</dd>
              <dt>Class</dt><dd>{cls}</dd>
              <dt>Size</dt><dd>{fmtSize(P)}</dd>
            </dl>
            <Link className="cta" to="/contact">Start a project</Link>
          </div>
          {/* rule 02: every project points back to its market and to the capability behind it */}
          <div className="ps-links">
            <span className="ps-k">Where this sits</span>
            <Link to={MARKET_ROUTE[P.ind] || '/markets'}>{INDLBL[P.ind]} market</Link>
            <Link to="/services">How it was delivered</Link>
            <Link to={`/projects#${P.ind}`}>More {INDLBL[P.ind].toLowerCase()} work</Link>
          </div>
          <Link className="ps-back" to="/projects">&larr; All projects</Link>
        </aside>
      </main>

      <section className="prj-rel"><div className="wrap">
        <span className="eyebrow">Related work</span>
        <h2 id="relTitle">More in {INDLBL[P.ind]}</h2>
        <div className="reg" id="relReg">{related.map(idx => <RelCard key={idx} idx={idx} />)}</div>
        <div className="prj-pager">
          <Link id="prevP" to={`/projects/${pv}`}><small>&larr; Previous project</small><b>{PROJECTS[pv].client} &middot; {PROJECTS[pv].name}</b></Link>
          <Link id="nextP" to={`/projects/${nx}`} className="nx"><small>Next project &rarr;</small><b>{PROJECTS[nx].client} &middot; {PROJECTS[nx].name}</b></Link>
        </div>
      </div></section>

      <section className="close3d dark-band" id="contact">
        <div className="close-in wrap split">
          <div>
            <span className="eyebrow u-sig"><span data-scramble="">START A PROJECT</span></span>
            <h2 className="u-mt14 u-mw18">Tell us what you are building</h2>
            <p className="lede u-mt16">From feasibility to handover, one accountable team. Response within one working day.</p>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            <a className="fpc u-panel-dark" href="mailto:info@iaqtechnology.com.my"><span className="ref">Email</span><h3 className="u-fs17">info@iaqtechnology.com.my</h3></a>
            <a className="fpc u-panel-dark" href="tel:+60351248319"><span className="ref">Phone</span><h3 className="u-fs17">+603 5124 8319</h3></a>
            <div className="fpc" style={{ '--panel': 'rgba(15,23,40,.82)', cursor: 'default' }}><span className="ref">HQ &middot; Shah Alam</span><h3 style={{ fontSize: '15px', lineHeight: 1.45, fontWeight: 500 }}>No.12, Jalan Sungai Jeluh 32/192, Kawasan Perindustrian Kemuning, Seksyen 32, 40460 Shah Alam, Selangor</h3></div>
          </div>
        </div>
        <div className="close-viz" aria-hidden="true"><canvas id="closeCv"></canvas><div className="close-scrim"></div></div>
        <Footer note="Registry concept · Brand Method" />
      </section>
    </>
  )
}

/* the approved concept photo. Captioned with its own provenance, never presented as
   a documentary record of a specific moment on that site. */
function photoFigure(P) {
  if (!P.img) return null
  return (
    <figure className="pb-fig">
      <img id="prjPhoto" src={P.img} alt=""  loading="lazy" decoding="async" />
      <figcaption id="prjCap">{(P.cap || 'Site photo')} &middot; {P.client}</figcaption>
    </figure>
  )
}
