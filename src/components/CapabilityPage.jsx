import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import PageHead from './PageHead.jsx'
import Related from './Related.jsx'
import Icon from './FlowIcon.jsx'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/capability.css'

/* ============================================================================
   CapabilityPage: the shared template behind the business units
   (EPC & Construction, Process Critical Utilities, Total Tool Installation,
   Energy Management).

   The delivery-cycle pages under /services/<stage> answer HOW the work runs.
   These four answer WHAT is being bought. A buyer arrives with one or the other
   in their head, so the site carries both axes and they cross-link.

   Body copy is IAQ's own, lifted verbatim from the business-model block already
   approved on the capabilities hub. Anything IAQ still has to supply is carried
   as a labelled slot rather than invented, which is the same convention the
   rest of the site uses.

   props
     id        string   the page id in src/data/sitemap.js, for the Related strip
     no        string   the model number shown in the kicker
     name      string   the model name
     full      string   the model's expanded name
     title     node     the h1; wrap the accent phrase in <em>
     lede      string   one paragraph under the title
     chips     array    mono tags under the lede
     image     object   { src, alt, caption } for the head figure
     what      string[] paragraphs for "what it is"
     pull      string   the one-line claim, set as a pull quote
     steps     array    [{ k, t, d }] the delivery sequence, rendered interactive
     items     string[] the scope list
     why       array    [{ k, t }] why it matters, as beats
     slot      string   the labelled gap: what IAQ still has to supply
     filter    fn       (project) => boolean, picks the proof projects
     proofNote string   caption under the proof strip
     cta       object   { label, route }
   ============================================================================ */

function ProofCard({ p, i }) {
  return (
    <Link className="pg-pc" to={'/projects/' + i}>
      <div className="pg-pcv"><img src={p.img} alt="" loading="lazy" /></div>
      <div className="pg-pc-in">
        <span className="pg-ref"><span>{p.loc}</span><span className="iso">{p.iso}</span></span>
        <h3>{p.name}</h3>
        <span className="pg-cl">{p.client}</span>
        <span className="pg-tags">
          <span className="pg-tag b">{INDLBL[p.ind]}</span>
          <span className="pg-tag">{TYPLBL[p.type]}</span>
        </span>
      </div>
    </Link>
  )
}

export default function CapabilityPage(props) {
  const {
    id, no, name, full, title, lede, chips, image,
    what = [], pull, steps = [], items = [], why = [], slot,
    filter, proofNote, cta,
  } = props

  useEffect(() => { document.title = `IAQ Group · ${name} · Brand Method` }, [name])

  /* the sequence is interactive because the plan asks a non-technical visitor to understand an
     order of operations, and a static row of boxes does not teach one. Open by click or keyboard;
     the first step is open on arrival so the panel is never an empty frame. */
  const [open, setOpen] = useState(0)

  const proof = PROJECTS
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (filter ? filter(p) : true))
    .slice(0, 3)

  return (
    <>
      <Nav />

      <PageHead
        eyebrow={`Business model ${no} · ${full}`}
        title={title}
        lede={lede}
        chips={chips}
        figure={image}
      />

      {/* ------------------------------------------------------- what it is */}
      <section className="pg-sec" aria-labelledby="cap-what">
        <div className="pg-in">
          <span className="pg-k">What it is</span>
          <h2 id="cap-what">{name}, in plain terms.</h2>
          <div className="pg-split">
            <div>{what.map((t, i) => <p className="pg-body" key={i}>{t}</p>)}</div>
            {pull && <p className="pg-pull"><small>The claim</small>{pull}</p>}
          </div>
        </div>
      </section>

      {/* ------------------------------------------- the sequence, interactive */}
      {steps.length > 0 && (
        <section className="pg-sec calm" aria-labelledby="cap-seq">
          <div className="pg-in">
            <span className="pg-k">The sequence</span>
            <h2 id="cap-seq">How the work actually runs.</h2>
            <div className="cap-flow" role="tablist" aria-label={`${name} delivery sequence`}>
              {steps.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`cap-step-${i}`}
                  aria-selected={open === i}
                  aria-controls="cap-step-panel"
                  className={'cap-step' + (open === i ? ' on' : '') + (i < open ? ' done' : '')}
                  onClick={() => setOpen(i)}
                  onKeyDown={e => {
                    if (e.key === 'ArrowRight') { e.preventDefault(); setOpen((open + 1) % steps.length) }
                    if (e.key === 'ArrowLeft') { e.preventDefault(); setOpen((open - 1 + steps.length) % steps.length) }
                  }}
                  tabIndex={open === i ? 0 : -1}
                >
                  <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                  <b>{s.k}</b>
                </button>
              ))}
            </div>
            <div className="cap-panel" id="cap-step-panel" role="tabpanel"
                 aria-labelledby={`cap-step-${open}`} aria-live="polite">
              <span className="cap-panel-n">Step {String(open + 1).padStart(2, '0')} of {String(steps.length).padStart(2, '0')}</span>
              <h3>{steps[open].t}</h3>
              <p>{steps[open].d}</p>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- the systems */}
      {items.length > 0 && (
        <section className="pg-sec" aria-labelledby="cap-scope">
          <div className="pg-in">
            <span className="pg-k">The scope</span>
            <h2 id="cap-scope">What IAQ carries under this model.</h2>
            <ul className="pg-scope cap-scope">
              {items.map((t, i) => <li key={i}><i>{String(i + 1).padStart(2, '0')}</i><span>{t}</span></li>)}
            </ul>
          </div>
        </section>
      )}

      {/* --------------------------------------------------- why it matters */}
      {why.length > 0 && (
        <section className="pg-sec calm" aria-labelledby="cap-why">
          <div className="pg-in">
            <span className="pg-k">Why it matters</span>
            <h2 id="cap-why">What the model is actually for.</h2>
            <div className="pg-beats">
              {why.map((b, i) => (
                <div className="pg-beat" key={i}>
                  <span className="pg-k">{b.k}</span>
                  <p>{b.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------ what IAQ still owes this page, labelled rather than faked */}
      {slot && (
        <section className="pg-sec" aria-label="Content to be supplied">
          <div className="pg-in">
            <div className="pg-slot">
              <div className="pg-slot-in">
                <span className="pg-slot-tag">{slot}</span>
                <p>
                  This block is reserved. It is left visible rather than filled with invented copy,
                  because the detail belongs to IAQ and a plausible guess is worse than an honest gap
                  on a page a buyer makes a decision from.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- proof */}
      {proof.length > 0 && (
        <section className="pg-sec calm" aria-labelledby="cap-proof">
          <div className="pg-in">
            <span className="pg-k">Proof</span>
            <h2 id="cap-proof">Delivered this way.</h2>
            <div className="pg-proof">
              {proof.map(({ p, i }) => <ProofCard p={p} i={i} key={i} />)}
            </div>
            {proofNote && <p className="pg-note">{proofNote}</p>}
            <Link className="pg-more" to="/projects">See the whole record <i aria-hidden="true">&rarr;</i></Link>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- the ask */}
      <section className="pg-sec" aria-label="Start a project">
        <div className="pg-in">
          <div className="pg-cta">
            <div className="pg-cta-meta">
              <span className="pg-k">The next step</span>
              <h2>{cta?.label || 'Start a project'}</h2>
            </div>
            <Link className="pg-cta-act cta" to={cta?.route || '/contact'}>{cta?.label || 'Start a project'}</Link>
          </div>
        </div>
      </section>

      <Related from={id} />
      <Footer />
    </>
  )
}
