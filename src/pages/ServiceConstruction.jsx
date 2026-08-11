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
   /services/construction · stage 03 of the delivery cycle.
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
const HERE = 2

const SCOPE = [
  'EPCC and EPCM delivery models',
  'Site management across all trades',
  'Schedule and cost control to handover',
]

const BEATS = [
  'EPCC / EPCM delivery models',
  'Every trade coordinated',
  'Schedule and cost held',
]

/* the largest published builds by floor area: 79,000 m², 62,000 m², 43,000 m²
   and a 25,000 m² greenfield */
const PROOF = [7, 5, 2, 0]

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

export default function ServiceConstruction() {
  useEffect(() => { document.title = 'IAQ Group · Construction · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Stage 03 · Construction"
        title={<>Precision engineering, <em>built to exact standards.</em></>}
        lede="Project management, coordination and communication through a construction program tailored to each client, on schedule and within budget."
        chips={['EPCC · EPCM', 'Stage 03 of 06']}
        figure={{ src: '/assets/ph-crane.webp', alt: 'A live construction site for a hi-tech facility', caption: 'Stage imagery · placeholder, replaced with IAQ project photography at production' }}
      />

      {/* --------------------------------------------------- what it covers */}
      <section className="pg-sec" aria-labelledby="cov-h">
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id="cov-h">A live site, held to the programme.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                IAQ provides efficient project management, coordination, and communication services
                through construction program tailored to specific client need. Success project delivery
                relies on strong leadership along coupled with precise execution, IAQ&rsquo;s vast
                experience ensures that project is managed effectively, on schedule and within budget.
              </p>
              <p className="pg-body">
                This is the stage the contract model shows itself. Under EPCC the whole scope sits with
                IAQ on a single contract. Under EPCM IAQ leads the programme while the client holds the
                individual construction contracts. Both models are set out on the capabilities page.
              </p>
            </div>
            <p className="pg-pull">
              <small>The claim</small>
              Precision engineering, built to exact standards.
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
          <Link className="pg-more" to="/services">Compare the business models</Link>
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
          <h2 id="proof-h">Built at scale, on live industrial sites.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen for the floor area carried through construction.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
          <Link className="pg-more" to="/projects">See the full registry</Link>
        </div>
      </section>

      {/* --------------------------------------------------------- next stage */}
      <section className="pg-sec tight flush" aria-labelledby="next-h">
        <div className="pg-in">
          <span className="pg-k" id="next-h">Next stage</span>
          <Link className="pg-nextcard" to="/services/commissioning">
            <span className="pg-nextic"><Icon name="gauge" /></span>
            <span>
              <b>Testing &amp; Commissioning</b>
              <small>Proven performance before you move in.</small>
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
            <h2>Tell us the site, the scope and the date.</h2>
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

      <Related from="svc-construction" />
      <Footer note="Construction concept · Brand Method" />
    </>
  )
}
