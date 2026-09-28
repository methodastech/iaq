import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Icon from '../components/FlowIcon.jsx'
import DetailDiagram from '../components/DetailDiagram.jsx'
import CarriedBy from '../components/CarriedBy.jsx'
import GateList from '../components/GateList.jsx'
import { CYCLE } from '../data/cycle.js'
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

const HERE = 4

const SCOPE = [
  'Planned preventive maintenance programmes',
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


/* 25 Sep (IAQ, 24 Sep review: "merge all the description pages for each service into one"): the cover and the scope
   are exported so the single page /services/all can stack the six stages in order; this page still renders them */
const SLUG = 'maintenance'
export const META = { slug: SLUG, eyebrow: "Stage 05 · Maintenance", title: <>Protecting your investment, <em>long after handover.</em></>, lede: "Planned maintenance that protects asset lifespan, minimises downtime and keeps facilities compliant." }
export function Cover() {
  return (
      <section className="pg-sec" aria-labelledby={"cov-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id={"cov-h-"+SLUG}>The facility, kept at the standard it was handed over at.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                Our maintenance service keeps constructed assets at their optimal lifespan. Regular
                maintenance minimises downtime and prevents breakdowns, and keeps each facility within
                its safety, performance and regulatory standards.
              </p>
              <p className="pg-body">
                It also feeds the cycle. What the maintenance team learns about how a facility behaves in
                service is what the design team uses on the next retrofit, expansion or upgrade. That is
                why the same group carries a facility for its whole life.
              </p>
            </div>
            <p className="pg-pull">
              What maintenance learns, the next retrofit uses.
            </p>
          </div>
        </div>
      </section>
  )
}
export function Scope() {
  return (
      <section className="pg-sec calm" aria-labelledby={"scope-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">Scope</span>
          <h2 id={"scope-h-"+SLUG}>What IAQ carries at this stage.</h2>
          {/* the scope as a diagram (2 Sep): one custom mark per item on a rail that draws in */}
          <DetailDiagram variant="flow" items={SCOPE.map(s => ({ label: s }))} ariaLabel="Scope at this stage" />
          <CarriedBy service="maintain" />
        </div>
      </section>
  )
}

export default function ServiceMaintenance() {
  useEffect(() => { document.title = 'IAQ Group · Maintenance · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* the head carries the service's OWN banner (2 Sep, Bazil: "shouldn't repeat the 3D view"):
          a photoreal scene generated for this stage, so the page opens on where the work happens
          rather than on the same render the ring and the hub already showed. */}
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="Stage 05 · Maintenance"
        title={<>Protecting your investment, <em>long after handover.</em></>}
        lede="Planned maintenance that protects asset lifespan, minimises downtime and keeps facilities compliant."
        chips={['Lifecycle', 'Stage 5 of 6']}
        figure={{ src: '/assets/banners/svc-maintain.jpg', alt: 'Maintenance: a filter change on an air handling unit in the plant room', hero: true }}
      />

      {/* --------------------------------------------------- what it covers */}
      <Cover />

      {/* -------------------------------------------------------- scope list */}
      <Scope />

      {/* -------------------------------------------------------- how it runs */}
      <section className="pg-sec" aria-labelledby="run-h">
        <div className="pg-in">
          <span className="pg-k">How it runs</span>
          <h2 id="run-h">Three things run continuously.</h2>
          {/* the process as a diagram (2 Sep, Bazil: "a whole good process with custom icons") */}
          <GateList items={BEATS} ariaLabel="How it runs" />

          <p className="pg-note">Where this sits in the cycle</p>
          <div className="pg-rail">
            {CYCLE.map((c, i) => (
              i === HERE
                ? <span className="pg-rail-n on" key={c.no} aria-current="page"><span className="pg-rail-ic"><Icon name={c.icon} /></span><span className="n">{c.no}</span><b>{c.short}</b><small>You are here</small></span>
                : <Link className="pg-rail-n" to={c.route} key={c.no}><span className="pg-rail-ic"><Icon name={c.icon} /></span><span className="n">{c.no}</span><b>{c.short}</b><small>Open</small></Link>
            ))}
          </div>
          <p className="pg-loop"><i aria-hidden="true" />Tools hookup feeds the next design</p>
        </div>
      </section>

      {/* ----------------------------------------------------- proof projects */}
      <section className="pg-sec calm" aria-labelledby="proof-h">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2 id="proof-h">Assets that have to run every day.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen because they are continuously operated plant. Operation and
            maintenance of district cooling systems sits inside IAQ&rsquo;s Energy Management model.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
        </div>
      </section>
      <ClosingBand note="Maintenance concept · Brand Method" />
    </>
  )
}
