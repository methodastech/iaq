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
   /services/maintenance · stage 05, and the stage that closes the loop.
   The long paragraph is IAQ's own live-site service description, verbatim. The
   scope list and the three beats are the approved built-site detail lines. The
   final block returns to design, because that is what the cycle does.
   ============================================================================ */

const CYCLE = [
  { no: '01', short: 'Design', route: '/services/design' },
  { no: '02', short: 'Procure', route: '/services/procurement' },
  { no: '03', short: 'Construct', route: '/services/construction' },
  { no: '04', short: 'Commission', route: '/services/commissioning' },
  { no: '05', short: 'Maintain', route: '/services/maintenance' },
  { no: '06', short: 'Hookup', route: '/services/tool-installation' },
]
const HERE = 4

const SCOPE = [
  'Planned preventive maintenance programs',
  'Rapid breakdown response',
  'Compliance and asset lifecycle care',
  'Feeds the next cycle: retrofit, expansion and upgrade',
]

const BEATS = [
  'Planned preventive programmes',
  'Rapid breakdown response',
  'Compliance across the lifecycle',
]

/* the published assets that run continuously after handover. Operation and
   maintenance of district cooling systems is named in IAQ's own Energy
   Management scope, which is why the cooling plants lead here. */
const PROOF = [11, 12, 13, 16]

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

export default function ServiceMaintenance() {
  useEffect(() => { document.title = 'IAQ Group · Maintenance · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="Stage 05 · Maintenance"
        title={<>Protecting your investment, <em>long after handover.</em></>}
        lede="Planned maintenance that protects asset lifespan, minimizes downtime and keeps facilities compliant."
        chips={['Lifecycle', 'Stage 05 of 06', 'Closes the loop']}
        figure={{ src: '/assets/ph-boiler.webp', alt: 'Facility plant under a planned maintenance programme', caption: 'Stage imagery · placeholder, replaced with IAQ project photography at production' }}
      />

      {/* --------------------------------------------------- what it covers */}
      <section className="pg-sec" aria-labelledby="cov-h">
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id="cov-h">The facility, kept at the standard it was handed over at.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                Our maintenance services maintain the optimal lifespan of constructed assets, regular
                maintenance minimizing downtime, prevents breakdowns and to ensure that the facilities
                or structures continue to meet safety, performance, and regulatory standards.
              </p>
              <p className="pg-body">
                It is also where the cycle closes. What the maintenance team learns about how a facility
                actually behaves in service is what the design team uses on the next retrofit, expansion
                or upgrade. That is the reason the same group carries a facility for its whole life.
              </p>
            </div>
            <p className="pg-pull">
              <small>The claim</small>
              Protecting your investment, long after handover.
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
          <h2 id="run-h">Three things run continuously, not once.</h2>
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
          <h2 id="proof-h">Assets that have to run every day.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen because they are continuously operated plant. Operation and
            maintenance of district cooling systems sits inside IAQ&rsquo;s Energy Management model.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
          <div className="pg-mores">
            <Link className="pg-more" to="/projects">See the full registry</Link>
            <Link className="pg-more" to="/services">See the Energy Management model</Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ back to design */}
      <section className="pg-sec tight flush" aria-labelledby="next-h">
        <div className="pg-in">
          <span className="pg-k" id="next-h">Back to design</span>
          <Link className="pg-nextcard" to="/services/design">
            <span className="pg-nextic"><Icon name="compass" /></span>
            <span>
              <b>Engineering Design &amp; Consultation</b>
              <small>The cycle never ends: what maintenance learns, the next design uses.</small>
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
            <h2>Tell us what has to keep running.</h2>
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

      <Related from="svc-maintenance" />
      <Footer note="Maintenance concept · Brand Method" />
    </>
  )
}
