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
   /services/commissioning · stage 04 of the delivery cycle.
   The long paragraph is IAQ's own live-site service description, verbatim. The
   scope list and the three beats are the approved built-site detail lines.
   ============================================================================ */

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


/* 25 Sep (IAQ, 24 Sep review: "merge all the description pages for each service into one"): the cover and the scope
   are exported so the single page /services/all can stack the six stages in order; this page still renders them */
const SLUG = 'commissioning'
export const META = { slug: SLUG, eyebrow: "Stage 04 · Testing & Commissioning", title: <>Proven performance <em>before you move in.</em></>, lede: "Established testing and commissioning programmes that prove every facility operates as intended, at its optimum, before handover." }
export function Cover() {
  return (
      <section className="pg-sec" aria-labelledby={"cov-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id={"cov-h-"+SLUG}>The stage that turns a specification into a number.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                We test and commission every facility to our established programme. It proves the
                facility operates as intended, at its best, and meets every specified requirement. Any
                issue or deficiency is found and put right, so the facility is fully functional before it
                is handed over for operation.
              </p>
              <p className="pg-body">
                A cleanroom class is proven by measurement. At this stage the classification the
                design promised is proven by test, and every system is tuned to specification. The
                certified documentation the client presents at audit is issued here.
              </p>
            </div>
            <p className="pg-pull">
              The class the design promised, proven by test.
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
          <CarriedBy service="commission" />
        </div>
      </section>
  )
}

export default function ServiceCommissioning() {
  useEffect(() => { document.title = 'IAQ Group · Testing & Commissioning · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* the head carries the service's OWN banner (2 Sep, Bazil: "shouldn't repeat the 3D view"):
          a photoreal scene generated for this stage, so the page opens on where the work happens
          rather than on the same render the ring and the hub already showed. */}
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="Stage 04 · Testing & Commissioning"
        title={<>Proven performance <em>before you move in.</em></>}
        lede="Established testing and commissioning programmes that prove every facility operates as intended, at its optimum, before handover."
        chips={['Validation', 'Stage 4 of 6']}
        figure={{ src: '/assets/iaq/cr-ballroom-8575.webp', alt: 'Testing and commissioning: a finished IAQ cleanroom ballroom before the tools move in', hero: true }}
      />

      {/* --------------------------------------------------- what it covers */}
      <Cover />

      {/* -------------------------------------------------------- scope list */}
      <Scope />

      {/* -------------------------------------------------------- how it runs */}
      <section className="pg-sec" aria-labelledby="run-h">
        <div className="pg-in">
          <span className="pg-k">How it runs</span>
          <h2 id="run-h">Three things have to be true before handover.</h2>
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
          <h2 id="proof-h">Classified, tested, handed over.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen for the tightness of the classification they were proven against.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
        </div>
      </section>
      <ClosingBand note="Testing and commissioning concept · Brand Method" />
    </>
  )
}
