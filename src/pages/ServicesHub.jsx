import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import GatedDownload from '../components/GatedDownload.jsx'
import Related from '../components/Related.jsx'
import CycleFlow from '../components/CycleFlow.jsx'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'

/* ============================================================================
   /services · the capabilities hub.

   Every word of the discipline and business model copy on this page is the
   client's own, taken verbatim from the built site (_source/index.html delivery
   cycle) and the client copy sheet. Nothing is written here that IAQ has not
   already approved.

   The one gap is deliberate and labelled: the business model questionnaire was
   never answered, so the deep scope story for EPC, tool hook-up and the Energy
   Management financing model does not exist. It ships as a placeholder slot on
   each model card rather than as invented copy.
   ============================================================================ */

/* the six stages of the delivery cycle, tools hookup added on the 7 Aug client correction */
const STAGES = [
  {
    id: 'svc-design', no: '01', route: '/services/design', icon: 'compass',
    name: 'Engineering Design & Consultation', short: 'Design', tag: 'CSA · MEP',
    kick: 'Where every great facility begins',
    desc: 'Concept to detailed design across CSA and MEP, with expert advice through the development of the project.',
    pts: ['Concept to detailed design across CSA and MEP', 'Feasibility studies and value engineering', 'Regulatory submissions and authority liaison'],
  },
  {
    id: 'svc-procurement', no: '02', route: '/services/procurement', icon: 'crate',
    name: 'Procurement', short: 'Procure', tag: 'Supply chain',
    kick: 'The right materials, the right partners, right on time',
    desc: 'Tracked, organized sourcing aligned to project requirements, quality standards and budget constraints.',
    pts: ['Vendor qualification and tender management', 'Long-lead equipment tracking', 'Sourcing aligned to quality and budget'],
  },
  {
    id: 'svc-construction', no: '03', route: '/services/construction', icon: 'crane',
    name: 'Construction', short: 'Construct', tag: 'EPCC · EPCM',
    kick: 'Precision engineering, built to exact standards',
    desc: 'Project management, coordination and communication through a construction program tailored to each client, on schedule and within budget.',
    pts: ['EPCC and EPCM delivery models', 'Site management across all trades', 'Schedule and cost control to handover'],
  },
  {
    id: 'svc-commissioning', no: '04', route: '/services/commissioning', icon: 'gauge',
    name: 'Testing & Commissioning', short: 'Commission', tag: 'Validation',
    kick: 'Proven performance before you move in',
    desc: 'Established T&C programs that prove every facility operates as intended, at its optimum, before handover.',
    pts: ['ISO cleanroom classification testing', 'System performance verification', 'Certified documentation for handover'],
  },
  {
    id: 'svc-maintenance', no: '05', route: '/services/maintenance', icon: 'gear',
    name: 'Maintenance', short: 'Maintain', tag: 'Lifecycle',
    kick: 'Protecting your investment, long after handover',
    desc: 'Planned maintenance that protects asset lifespan, minimizes downtime and keeps facilities compliant.',
    pts: ['Planned preventive maintenance programs', 'Rapid breakdown response', 'Compliance and asset lifecycle care', 'Hands to tools hookup when the machines change'],
  },
  {
    id: 'cap-tool', no: '06', route: '/services/tool-installation', icon: 'link',
    name: 'Tools Hookup', short: 'Hookup', tag: 'Total Tool Installation',
    kick: 'When the machines arrive, or upgrade',
    desc: 'Connecting production tools to the facility, from utilities tie-ins to final qualification. It follows maintenance, comprises its own engineering, and feeds the next design: the reason the cycle is a loop.',
    pts: ['Tool move-in and hook-up engineering', 'Process utilities tie-ins in live, classified environments', 'Qualification and handback to production', 'Feeds the next cycle: the facility re-equips and the design begins again'],
  },
]

/* the three business units, corrected on the 7 Aug review: EPC (bought as
   EPCC or EPCM), EFM and the Total Tools Hookup Solution. They are subsidiaries
   of IAQ Group; the operating entity names stay unpublished. */
const MODELS = [
  {
    no: '01', name: 'EPC', full: 'Engineering, Procurement & Construction · bought as EPCC or EPCM',
    routes: [{ to: '/services/epc-construction', label: 'EPC & Construction' }],
    desc: 'The build unit. It designs, procures and constructs mission-critical facilities and hands them over validated. Bought as EPCC when one contract should carry the facility from first drawing to validated handover, or as EPCM when the owner keeps direct control of the construction contracts and IAQ leads engineering, procurement and construction management.',
    items: ['Engineering design', 'Procurement of materials and equipment', 'Construction and site management', 'Testing and commissioning to the contracted class', 'EPCC: single contract, single point of accountability', 'EPCM: owner control, specialist leadership'],
    gap: 'Business unit questionnaire · exact included scope, the risk IAQ carries under each contract form, and which industries choose which · supplied by IAQ',
  },
  {
    no: '02', name: 'EFM', full: 'Energy Facility Management · the life of the facility',
    routes: [{ to: '/services/energy-management', label: 'Energy Management' }, { to: '/services/maintenance', label: 'Maintenance' }],
    desc: 'The unit that takes over when the facility goes live: planned maintenance, process-critical utilities operation and energy management, delivered by engineers who build these environments. Includes the risk-free energy model where IAQ designs, implements and finances energy projects, paid from the achieved savings.',
    items: ['Planned and preventive maintenance', 'Process-critical utilities operation', 'Energy design, implementation and financing', 'Risk-free, no-upfront-cost model with returns from achieved savings', 'District cooling and heating plants'],
    gap: 'Business unit questionnaire · how the no-upfront-cost financing works in plain terms, and verified savings figures · supplied by IAQ',
  },
  {
    no: '03', name: 'Total Tools Hookup Solution', full: 'Process Critical Utilities & Total Tool Installation',
    routes: [{ to: '/services/tool-installation', label: 'Total Tool Installation' }, { to: '/services/process-critical-utilities', label: 'Process Critical Utilities' }],
    desc: 'The unit that re-equips a live facility. When production machines arrive or upgrade, it engineers, procures and installs the hookup that connects them: process critical utilities and total tool installation as one specialist package. It comprises its own EPC, which is why the delivery cycle never ends.',
    items: ['CDA, PCW, PV', 'Process Exhaust System', 'Chemical / Gas Delivery System', 'UPW (ultrapure water)', 'Waste Water Treatment', 'Tools hookup and qualification'],
    gap: 'Business unit questionnaire · the step by step of what a tool hook-up involves, and the typical move-in timeline · supplied by IAQ',
  },
]
/* verified figures only: these are the counters already published on the built
   home page, so the whole site reports one set of numbers */
const STATS = [
  ['230+', 'Completed projects'],
  ['1,050,000', 'm² cleanroom built-up'],
  ['450', 'Employees group-wide'],
  ['8', 'Countries, global offices'],
]

/* six published projects, one per market where the registry allows */
const PROOF = [0, 2, 5, 11, 16, 17]

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

export default function ServicesHub() {
  useEffect(() => { document.title = 'IAQ Group · Capabilities · Brand Method' }, [])

  return (
    <>
      <Nav />

      <PageHead
        eyebrow="The delivery cycle"
        title={<>One process, six stages, <em>one accountable team.</em></>}
        lede="Design leads to procurement, procurement to construction, construction to commissioning, commissioning to maintenance, and when the machines arrive or upgrade, tools hookup. The cycle then feeds the next design: it never ends, which is why the same team carries a facility for its whole life."
        chips={['Six stages', 'Three business units', 'One contract, one team']}
      />

      {/* ---------------------------------------------------------- the cycle */}
      <section className="pg-sec" aria-labelledby="cycle-h">
        <div className="pg-in">
          <div className="cyc-hd">
            <div>
              <span className="pg-k">The cycle</span>
              <h2 id="cycle-h">From blueprint to handover,<br />and beyond<span className="cyc-stop">.</span></h2>
            </div>
            <p className="cyc-lede">
              IAQ is not a set of separate service lines.<br />
              It is <b>one delivery cycle</b>, carried by one team,<br />
              and every stage below hands directly to the next.
            </p>
          </div>

          <CycleFlow stages={STAGES} />
        </div>
      </section>

      {/* --------------------------------------------------- six stages */}
      <section className="pg-sec calm" aria-labelledby="disc-h">
        <div className="pg-in">
          <span className="pg-k">Six stages</span>
          <h2 id="disc-h">Every stage, opened up.</h2>
          <p className="pg-lede">
            Each stage has its own page: what it covers, the scope it carries, how it runs, and the
            projects that prove it.
          </p>

          <div className="pg-cards three">
            {STAGES.map(s => (
              <Link className="pg-card" to={s.route} key={s.id}>
                <span className="pg-no">STAGE {s.no}</span>
                <h3>{s.name}</h3>
                <span className="pg-kick">{s.kick}</span>
                <p>{s.desc}</p>
                <ul className="pg-list">{s.pts.map(pt => <li key={pt}>{pt}</li>)}</ul>
                <span className="pg-go">Open the stage</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ business models */}
      <section className="pg-sec" aria-labelledby="model-h">
        <div className="pg-in">
          <span className="pg-k">The business units</span>
          <h2 id="model-h">Three business units. One end-to-end promise.</h2>
          <p className="pg-lede">
            Each unit is a subsidiary of IAQ Group, and each one is a solution to a moment in a
            facility&rsquo;s life: EPC builds it, EFM runs and maintains it, the Total Tools Hookup
            Solution re-equips it. Outward, they are one thing: an end-to-end total solution provider.
          </p>

          <div className="pg-cards two">
            {MODELS.map(m => (
              <article className="pg-card" key={m.no}>
                <span className="pg-no">UNIT {m.no}</span>
                <h3>{m.name}<span className="pg-full">{m.full}</span></h3>
                <p>{m.desc}</p>
                <ul className="pg-list">{m.items.map(it => <li key={it}>{it}</li>)}</ul>
                {m.routes && (
                  <div className="pg-mores">
                    {m.routes.map(r => (
                      <Link className="pg-more" to={r.to} key={r.to}>{r.label} <i aria-hidden="true">&rarr;</i></Link>
                    ))}
                  </div>
                )}
                <div className="pg-slot mini">
                  <div className="pg-slot-in">
                    <span className="pg-slot-tag">Content slot</span>
                    <p>{m.gap}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="pg-note">
            Four models are shown, per the client copy sheet and the group structure diagram. The
            discovery session named three. IAQ to confirm the final count and the naming before launch.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- proof strip */}
      <section className="pg-sec calm" aria-labelledby="proof-h">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2 id="proof-h">The capability, in built form.</h2>

          <div className="pg-stats">
            {STATS.map(([v, l]) => <div className="pg-stat" key={l}><b>{v}</b><span>{l}</span></div>)}
          </div>

          <div className="pg-proof">
            {PROOF.map(i => <ProofCard i={i} key={i} />)}
          </div>

          <div className="pg-mores">
            <Link className="pg-more" to="/projects">See the full registry</Link>
            <Link className="pg-more" to="/markets">Find your market</Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ enquiry */}
      <section className="pg-cta" id="enquiry">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Start a project</span>
            <h2>Need a service tailored to your facility?</h2>
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

      <section className="pg-sec" aria-label="Capability statement">
        <div className="pg-in">
          <GatedDownload
            title="Capability statement & certification pack"
            blurb="Scope of services, delivery models, classifications delivered and current certifications, as one PDF for your procurement file."
          />
        </div>
      </section>

      <Related from="services-hub" />
      <Footer note="Capabilities concept · Brand Method" />
    </>
  )
}
