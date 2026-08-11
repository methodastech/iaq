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
   /services/commissioning · stage 04 of the delivery cycle.
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
const HERE = 3

const SCOPE = [
  'ISO cleanroom classification testing',
  'System performance verification',
  'Certified documentation for handover',
]

const BEATS = [
  'ISO class proven by test',
  'Systems tuned to specification',
  'Certified handover dossier',
]

/* the published projects that carry the tightest classifications: ISO 4, ISO 3
   to 7, a GMP parenteral plant and a class 1K to 10K laboratory */
const PROOF = [3, 4, 8, 10]

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

export default function ServiceCommissioning() {
  useEffect(() => { document.title = 'IAQ Group · Testing & Commissioning · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Stage 04 · Testing & Commissioning"
        title={<>Proven performance <em>before you move in.</em></>}
        lede="Established T&C programs that prove every facility operates as intended, at its optimum, before handover."
        chips={['Validation', 'Stage 04 of 06']}
        figure={{ src: '/assets/ph-electrical.webp', alt: 'Systems being verified before facility handover', caption: 'Stage imagery · placeholder, replaced with IAQ project photography at production' }}
      />

      {/* --------------------------------------------------- what it covers */}
      <section className="pg-sec" aria-labelledby="cov-h">
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id="cov-h">The stage that turns a specification into a number.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                We execute testing and commissioning based on our established programme to ensure that
                constructed facility operates as intended and at its optimal whilst meets all specified
                requirements. Identification and rectification of any issues or deficiencies, ensuring
                functionality before the facility is handed over for operation.
              </p>
              <p className="pg-body">
                A cleanroom class is a measurement, not a claim. This stage is where the classification
                the design promised is proven by test, the deficiencies are closed out, and the
                documentation the client will be audited against is issued.
              </p>
            </div>
            <p className="pg-pull">
              <small>The claim</small>
              Proven performance before you move in.
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
          <h2 id="run-h">Three things have to be true before handover.</h2>
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
          <h2 id="proof-h">Classified, tested, handed over.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen for the tightness of the classification they were proven against.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
          <Link className="pg-more" to="/projects">See the full registry</Link>
        </div>
      </section>

      {/* --------------------------------------------------------- next stage */}
      <section className="pg-sec tight flush" aria-labelledby="next-h">
        <div className="pg-in">
          <span className="pg-k" id="next-h">Next stage</span>
          <Link className="pg-nextcard" to="/services/maintenance">
            <span className="pg-nextic"><Icon name="gear" /></span>
            <span>
              <b>Maintenance</b>
              <small>Protecting your investment, long after handover.</small>
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
            <h2>Tell us the class you have to hit.</h2>
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

      <Related from="svc-commissioning" />
      <Footer note="Testing and commissioning concept · Brand Method" />
    </>
  )
}
