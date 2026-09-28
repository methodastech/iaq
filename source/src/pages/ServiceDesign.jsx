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
   /services/design · stage 01 of the delivery cycle.
   Body copy is IAQ's own, verbatim: the long paragraph is the live-site service
   description, the scope list and the three beats are the approved built-site
   detail lines. Reference projects are pulled from the published registry.
   ============================================================================ */

const HERE = 0

const SCOPE = [
  'Concept to detailed design across CSA and MEP',
  'Feasibility studies and value engineering',
  'Regulatory submissions and authority liaison',
]

const BEATS = [
  'Concept to detailed CSA + MEP design',
  'Feasibility and value engineering',
  'Authority submissions signed off',
]

/* published projects where the design package carried the build: two delivered
   under a named contract model, two multi-class greenfields with full MEP */
const PROOF = [1, 2, 4, 0]

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
const SLUG = 'design'
export const META = { slug: SLUG, eyebrow: "Stage 01 · Engineering Design & Consultation", title: <>Where the facility <em>is decided.</em></>, lede: "Concept to detailed design across CSA and MEP, with expert advice through the development of the project." }
export function Cover() {
  return (
      <section className="pg-sec" aria-labelledby={"cov-h-"+SLUG}>
        <div className="pg-in">
          <span className="pg-k">What it covers</span>
          <h2 id={"cov-h-"+SLUG}>The stage where cost and compliance are decided.</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body">
                Our engineering design and consultation service turns a client&rsquo;s concept into a
                design that can be built. We produce the detailed plans, specifications and drawings for
                every construction element, from Civil, Structural and Architectural (CSA) to Mechanical,
                Electrical and Plumbing (MEP). We advise on the project as it develops.
              </p>
              <p className="pg-body">
                Decisions taken here set the budget, the programme and the classification the facility
                will be tested against four stages later. That is why design sits inside the same team
                that builds and commissions it, rather than outside it.
              </p>
            </div>
            <p className="pg-pull">
              The budget, the programme and the class are set here.
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
          <CarriedBy service="design" />
        </div>
      </section>
  )
}

export default function ServiceDesign() {
  useEffect(() => { document.title = 'IAQ Group · Engineering Design & Consultation · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* the head carries the service's OWN banner (2 Sep, Bazil: "shouldn't repeat the 3D view"):
          a photoreal scene generated for this stage, so the page opens on where the work happens
          rather than on the same render the ring and the hub already showed. */}
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="Stage 01 · Engineering Design & Consultation"
        title={<>Where the facility <em>is decided.</em></>}
        lede="Concept to detailed design across CSA and MEP, with expert advice through the development of the project."
        chips={['CSA · MEP', 'Stage 1 of 6']}
        figure={{ src: '/assets/iaq/bim-archi.webp', alt: 'Engineering design: the architectural model of a hi-tech facility, from IAQ\u2019s own Revit coordination model', hero: true }}
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
          <h2 id="proof-h">Designed, then built by the same team.</h2>
          <p className="pg-lede">
            One process, six stages: every project below ran the full cycle. These are drawn from the
            published registry, chosen for the class and the scale of the design package.
          </p>
          <div className="pg-proof">{PROOF.map(i => <ProofCard i={i} key={i} />)}</div>
        </div>
      </section>
      <ClosingBand note="Engineering design and consultation concept · Brand Method" />
    </>
  )
}
