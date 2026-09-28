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
   /services/construction · stage 03 of the delivery cycle.
   The long paragraph is IAQ's own live-site service description, verbatim. The
   scope list and the three beats are the approved built-site detail lines.
   ============================================================================ */

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


/* 25 Sep (IAQ, 24 Sep review: "merge all the description pages for each service into one"): the cover and the scope
   are exported so the single page /services/all can stack the six stages in order; this page still renders them */
const SLUG = 'construction'
export const META = { slug: SLUG, eyebrow: "Stage 03 · Construction", title: <>Precision engineering, <em>built to exact standards.</em></>, lede: "Project management, coordination and communication through a construction programme tailored to each client, on schedule and within budget." }
export function Cover() {
  return (
      <section className="pg-sec" aria-labelledby={"cov-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id={"cov-h-"+SLUG}>A live site, held to the programme.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                IAQ provides project management, coordination and communication through a construction
                programme tailored to each client&rsquo;s needs. Successful delivery depends on strong
                leadership and precise execution. IAQ&rsquo;s experience keeps each project managed
                effectively, on schedule and within budget.
              </p>
              <p className="pg-body">
                This is the stage where the contract model shows itself. Under EPCC the whole scope sits with
                IAQ on a single contract. Under EPCM IAQ leads the programme while the client holds the
                individual construction contracts. Both models are set out on the Services page.
              </p>
            </div>
            <p className="pg-pull">
              One contract under EPCC, or one programme lead under EPCM.
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
          <CarriedBy service="construct" />
          <Link className="pg-more" to="/services">Compare the business models</Link>
        </div>
      </section>
  )
}

export default function ServiceConstruction() {
  useEffect(() => { document.title = 'IAQ Group · Construction · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* the head carries the service's OWN banner (2 Sep, Bazil: "shouldn't repeat the 3D view"):
          a photoreal scene generated for this stage, so the page opens on where the work happens
          rather than on the same render the ring and the hub already showed. */}
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="Stage 03 · Construction"
        title={<>Precision engineering, <em>built to exact standards.</em></>}
        lede="Project management, coordination and communication through a construction programme tailored to each client, on schedule and within budget."
        chips={['EPCC · EPCM', 'Stage 3 of 6']}
        figure={{ src: '/assets/iaq/cr-build-2024.webp', alt: 'Construction: a cleanroom going up on an IAQ site, wall panels and ceiling grid in, scaffold still on the floor', hero: true }}
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
          <h2 id="proof-h">Built at scale, on live industrial sites.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen for the floor area carried through construction.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
        </div>
      </section>
      <ClosingBand note="Construction concept · Brand Method" />
    </>
  )
}
