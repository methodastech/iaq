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
   /services/procurement · stage 02 of the delivery cycle.
   The long paragraph is IAQ's own live-site service description, verbatim. The
   scope list and the three beats are the approved built-site detail lines.
   ============================================================================ */

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


/* 25 Sep (IAQ, 24 Sep review: "merge all the description pages for each service into one"): the cover and the scope
   are exported so the single page /services/all can stack the six stages in order; this page still renders them */
const SLUG = 'procurement'
export const META = { slug: SLUG, eyebrow: "Stage 02 · Procurement", title: <>The right materials, the right partners, <em>right on time.</em></>, lede: "Tracked, organised sourcing aligned to project requirements, quality standards and budget constraints." }
export function Cover() {
  return (
      <section className="pg-sec" aria-labelledby={"cov-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id={"cov-h-"+SLUG}>The design intent, held all the way to site.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                We run an organised system in which every procurement activity is tracked. Identifying,
                sourcing, purchasing and managing resources stays aligned with the project requirements,
                quality standards and budget.
              </p>
              <p className="pg-body">
                On a hi-tech facility the programme is usually set by one or two long-lead items rather than the building. Tracking them from the day the design is signed off is what puts the
                construction stage on programme.
              </p>
            </div>
            <p className="pg-pull">
              Long-lead items set the programme, so they are tracked from design sign-off.
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
          <CarriedBy service="procure" />
        </div>
      </section>
  )
}

export default function ServiceProcurement() {
  useEffect(() => { document.title = 'IAQ Group · Procurement · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* the head carries the service's OWN banner (2 Sep, Bazil: "shouldn't repeat the 3D view"):
          a photoreal scene generated for this stage, so the page opens on where the work happens
          rather than on the same render the ring and the hub already showed. */}
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="Stage 02 · Procurement"
        title={<>The right materials, the right partners, <em>right on time.</em></>}
        lede="Tracked, organised sourcing aligned to project requirements, quality standards and budget constraints."
        chips={['Supply chain', 'Stage 2 of 6']}
        figure={{ src: '/assets/banners/svc-procure.jpg', alt: 'Procurement: crated long-lead equipment strapped on pallets in the logistics hall', hero: true }}
      />

      {/* --------------------------------------------------- what it covers */}
      <Cover />

      {/* -------------------------------------------------------- scope list */}
      <Scope />

      {/* -------------------------------------------------------- how it runs */}
      <section className="pg-sec" aria-labelledby="run-h">
        <div className="pg-in">
          <span className="pg-k">How it runs</span>
          <h2 id="run-h">Three things have to be true before it moves on.</h2>
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
          <h2 id="proof-h">Plant and equipment heavy, delivered to programme.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen because their programme was set by plant and long-lead equipment.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
        </div>
      </section>
      <ClosingBand note="Procurement concept · Brand Method" />
    </>
  )
}
