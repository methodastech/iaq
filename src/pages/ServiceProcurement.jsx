import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import Icon from '../components/FlowIcon.jsx'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'

/* ============================================================================
   /services/procurement · stage 02 of the delivery cycle.
   The long paragraph is IAQ's own live-site service description, verbatim. The
   scope list and the three beats are the approved built-site detail lines.
   ============================================================================ */

const CYCLE = [
  { no: '01', short: 'Design', route: '/services/design' },
  { no: '02', short: 'Procure', route: '/services/procurement' },
  { no: '03', short: 'Construct', route: '/services/construction' },
  { no: '04', short: 'Commission', route: '/services/commissioning' },
  { no: '05', short: 'Maintain', route: '/services/maintenance' },
  { no: '06', short: 'Hookup', route: '/services/tool-installation' },
]
const HERE = 1

const SCOPE = [
  'Vendor qualification and tender management',
  'Long-lead equipment tracking',
  'Sourcing aligned to quality and budget',
]

const BEATS = [
  'Vendors qualified, tenders run',
  'Long-lead equipment tracked',
  'Quality and budget locked',
]

/* published projects whose value sits in plant and long-lead equipment:
   central cooling plant, co-generation, data centre piping, module plant M&E */
const PROOF = [11, 12, 16, 17]

function ProofCard({ i }) {
  const p = PROJECTS[i]
  if (!p) return null
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

export default function ServiceProcurement() {
  useEffect(() => { document.title = 'IAQ Group · Procurement · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Stage 02 · Procurement"
        title={<>The right materials, the right partners, <em>right on time.</em></>}
        lede="Tracked, organized sourcing aligned to project requirements, quality standards and budget constraints."
        chips={['Supply chain', 'Stage 02 of 06']}
        figure={{ src: '/assets/ph-digital.webp', alt: 'Tracked procurement and supply chain systems', caption: 'Stage imagery · placeholder, replaced with IAQ project photography at production' }}
      />

      {/* --------------------------------------------------- what it covers */}
      <section className="pg-sec" aria-labelledby="cov-h">
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id="cov-h">The design intent, held all the way to site.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                We have an organized system where all activities for procurement can be tracked. It is
                crucial that process of identifying, resourcing, purchasing, and managing resources is
                align with project requirements, quality standards and budget constraints.
              </p>
              <p className="pg-body">
                On a hi-tech facility the programme is usually set by one or two long-lead items, not by
                the building. Tracking them from the day the design is signed off is what keeps the
                construction stage from waiting.
              </p>
            </div>
            <p className="pg-pull">
              <small>The claim</small>
              The right materials, the right partners, right on time.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- scope list */}
      <section className="pg-sec calm" aria-labelledby="scope-h">
        <div className="pg-in">
          <span className="pg-k">Scope list</span>
          <h2 id="scope-h">What IAQ carries at this stage.</h2>
          <ul className="pg-scope">
            {SCOPE.map((s, i) => (
              <li key={s}><i>{String(i + 1).padStart(2, '0')}</i><span>{s}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- how it runs */}
      <section className="pg-sec" aria-labelledby="run-h">
        <div className="pg-in">
          <span className="pg-k">How it runs</span>
          <h2 id="run-h">Three things have to be true before it moves on.</h2>
          <div className="pg-beats">
            {BEATS.map((b, i) => (
              <div className="pg-beat" key={b}><i>{String(i + 1).padStart(2, '0')}</i><p>{b}</p></div>
            ))}
          </div>

          <p className="pg-note">Where this sits in the cycle</p>
          <div className="pg-rail">
            {CYCLE.map((c, i) => (
              i === HERE
                ? <span className="pg-rail-n on" key={c.no} aria-current="page"><span className="n">{c.no}</span><b>{c.short}</b><small>You are here</small></span>
                : <Link className="pg-rail-n" to={c.route} key={c.no}><span className="n">{c.no}</span><b>{c.short}</b><small>Open</small></Link>
            ))}
          </div>
          <p className="pg-loop"><i aria-hidden="true" />Tools hookup feeds the next design</p>
        </div>
      </section>

      {/* ----------------------------------------------------- proof projects */}
      <section className="pg-sec calm" aria-labelledby="proof-h">
        <div className="pg-in">
          <span className="pg-k">Proof projects</span>
          <h2 id="proof-h">Plant and equipment heavy, delivered to programme.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen because their programme was set by plant and long-lead equipment.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
          <Link className="pg-more" to="/projects">See the full registry</Link>
        </div>
      </section>

      {/* --------------------------------------------------------- next stage */}
      <section className="pg-sec tight flush" aria-labelledby="next-h">
        <div className="pg-in">
          <span className="pg-k" id="next-h">Next stage</span>
          <Link className="pg-nextcard" to="/services/construction">
            <span className="pg-nextic"><Icon name="crane" /></span>
            <span>
              <b>Construction</b>
              <small>Precision engineering, built to exact standards.</small>
            </span>
            <span className="pg-nextarrow" aria-hidden="true"><Icon name="arrow" /></span>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------ enquiry */}
      <section className="pg-cta" id="enquiry">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Start a project</span>
            <h2>Tell us what has to arrive, and when.</h2>
            <p>
              Whatever stage your project is at, whether it is concept, construction, or ongoing
              operations, our team is ready to help.
            </p>
          </div>
          <div className="pg-cta-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="pg-cta-meta">
              Response within one working day<br />
              <a href="mailto:info@iaqtechnology.com.my">info@iaqtechnology.com.my</a><br />
              <a href="tel:+60351248319">+603 5124 8319</a>
            </span>
          </div>
        </div>
      </section>

      <Related from="svc-procurement" />
      <Footer note="Procurement concept · Brand Method" />
    </>
  )
}
