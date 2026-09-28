import { jargon, Glossary } from '../lib/jargon.jsx'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import CycleBand from '../components/CycleBand.jsx'
import WorksBand from '../components/WorksBand.jsx'
import ToolsHookupBand from '../components/ToolsHookupBand.jsx'
import ServicesSectionBar from '../components/ServicesSectionBar.jsx'
import Related from '../components/Related.jsx'
import CycleFlow from '../components/CycleFlow.jsx'
import CycleRing from '../components/CycleRing.jsx'
import Icon from '../components/FlowIcon.jsx'
import { UnitsBand, MapBand, FlowBand, QuestionsBand, WorkBand, FaqBand } from '../components/ServicesMap.jsx'
import SystemMap from '../components/SystemMap.jsx'
import { INDLBL, TYPLBL } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/services.css'

/* ============================================================================
   /services · the capabilities hub.

   Reordered on the client review (16:16–16:19): the three business units lead
   the page, the process flow and the stage cards are merged into one
   interactive diagram (hover a stage for its detail, click to open it), and
   the enquiry CTA sits last.

   Every word of the discipline and business model copy on this page is the
   client's own, taken from the built site and the client copy sheet, cut down
   per the same review.

   The one gap is deliberate and labelled: the business model questionnaire was
   never answered, so the deep scope story for EPC, tool hook-up and the Energy
   Management financing model does not exist. It ships as a placeholder slot on
   each model card rather than as invented copy.
   ============================================================================ */

/* the six stages of the delivery cycle, tools hookup added on the 7 Aug client correction */
const STAGES = [
  {
    id: 'svc-design', no: '1', route: '/services/all#design', icon: 'compass',
    name: 'Engineering Design & Consultation', short: 'Design', tag: 'CSA · MEP',
    kick: 'Where the facility is decided',
    desc: 'Concept to detailed design across CSA and MEP, with expert advice through the development of the project.',
    pts: ['Concept to detailed design across CSA and MEP', 'Feasibility studies and value engineering', 'Regulatory submissions and authority liaison'],
  },
  {
    id: 'svc-procurement', no: '2', route: '/services/all#procurement', icon: 'crate',
    name: 'Procurement', short: 'Procure', tag: 'Supply chain',
    kick: 'The right materials, the right partners, right on time',
    desc: 'Tracked, organised sourcing aligned to project requirements, quality standards and budget constraints.',
    pts: ['Vendor qualification and tender management', 'Long-lead equipment tracking', 'Sourcing aligned to quality and budget'],
  },
  {
    id: 'svc-construction', no: '3', route: '/services/all#construction', icon: 'crane',
    name: 'Construction', short: 'Construct', tag: 'EPCC · EPCM',
    kick: 'Precision engineering, built to exact standards',
    desc: 'Project management and coordination through a construction programme tailored to each client, on schedule and within budget.',
    pts: ['EPCC and EPCM delivery models', 'Site management across all trades', 'Schedule and cost control to handover'],
  },
  {
    id: 'svc-commissioning', no: '4', route: '/services/all#commissioning', icon: 'gauge',
    name: 'Testing & Commissioning', short: 'Commission', tag: 'Validation',
    kick: 'Proven performance before you move in',
    desc: 'Established T&C programmes that prove every facility operates as intended, at its optimum, before handover.',
    pts: ['ISO cleanroom classification testing', 'System performance verification', 'Certified documentation for handover'],
  },
  {
    id: 'svc-maintenance', no: '5', route: '/services/all#maintenance', icon: 'gear',
    name: 'Maintenance', short: 'Maintain', tag: 'Lifecycle',
    kick: 'Protecting your investment, long after handover',
    desc: 'Planned maintenance that protects asset lifespan, minimises downtime and keeps facilities compliant.',
    pts: ['Planned preventive maintenance programmes', 'Rapid breakdown response', 'Compliance and asset lifecycle care'],
  },
  {
    id: 'cap-tool', no: '6', route: '/services/tool-installation', icon: 'link',
    name: 'Tools Hookup', short: 'Hookup', tag: 'Total Tool Installation',
    kick: 'When the machines arrive, or upgrade',
    desc: 'Connecting production tools to the facility, from utilities tie-ins to final qualification. It feeds the next design: the reason the cycle is a loop.',
    pts: ['Tool move-in and hook-up engineering', 'Utilities tie-ins in live, classified environments', 'Qualification and handback to production'],
  },
]

/* one loop per service (2 Sep): generated from the isometric stage renders, shared with the
   homepage ring and each service page, so the object stays recognisable across all three */
/* 4 Sep (client: "please put a resting visual that's better for this"). The card at rest was
   still the OLD isometric render (`{k}-card.webp`), even though the stage panel beside the
   diagram was moved to photoreal photography on 2 Sep for exactly this reason ("an actual
   realistic visual here, high quality corporate, about each one"). The card and the panel were
   showing two different worlds for the same service. Both are photoreal now, and hover plays
   the matching photoreal loop rather than dissolving from a photograph into a render.
   The poster is a 1200px re-encode of the panel's still (stage-{k}-card.jpg, 558KB for the six
   against 369KB for the webps) rather than the 1600px original, which would have put 1.8MB of
   stills behind a six-card grid. */
const LOOPS = ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup']
  .map(k => ({ video: `/assets/cycle3d/stage-${k}-loop.mp4`, poster: `/assets/cycle3d/stage-${k}-card.jpg` }))

/* 2 Sep (Bazil: "an actual realistic visual here, high quality corporate, about each one"): the
   stage panel beside the diagram now shows a photoreal Higgsfield photograph of the stage in
   progress, not the isometric render. Stages listed in STAGE_LIVE also carry a 5s photoreal
   loop over the photograph; the rest stay stills until their clip lands. */
const STAGE_KEYS = ['design', 'procure', 'construct', 'commission', 'maintain', 'hookup']
const STAGE_STILL = STAGE_KEYS.map(k => `/assets/cycle3d/stage-${k}.jpg`)
const STAGE_LIVE = new Set(STAGE_KEYS)
/* 24 Sep (Bazil: "no, there was a previous horizontal looking process before"): the serpentine is the cycle
   diagram again. It carries the process the ring could not say at a glance: 1 to 6 left to right, the U-turn,
   and the red return from Hookup into the next Design. The ring stays one query away: ?cycle=ring */
const CYCLE_FLOW = !(typeof location !== 'undefined' && /(?:\?|&)cycle=ring\b/.test(location.search))
const stageLoop = i => STAGE_LIVE.has(STAGE_KEYS[i]) ? `/assets/cycle3d/stage-${STAGE_KEYS[i]}-loop.mp4` : null

/* hover-to-play, so six clips are never decoding at once: the poster carries the card at rest */
/* 17 Sep: ServiceCard went with the six-card grid; the cycle diagram carries those links now. */

/* the three business units, corrected on the 7 Aug review: EPC (bought as
   EPCC or EPCM), EFM and the Total Tools Hookup Solution. They are subsidiaries
   of IAQ Group; the operating entity names stay unpublished. */
/* 9 Sep (Bazil: "level and structure the content correctly while ensuring you fill in gaps and
   content, also add the right icons for each").

   The three cards were the same component carrying three different shapes. EPC ran to a
   five-sentence paragraph, hookup to two. EPC had one route link, the others two. Only hookup
   carried a content slot, so it stood a slot taller than its neighbours for a reason that had
   nothing to do with the unit. Three cards side by side that are meant to be read as three ways
   to buy the same capability cannot be three different lengths.

   Levelled by giving all three the SAME five parts, in the same order: mark and unit number,
   name, one short paragraph, three spec rows, five scope lines, then the links.

   The spec rows are where the gap got filled, and nothing in them is invented. Each unit's own
   copy already answered "how is it bought" and "what is IAQ on the hook for"; both answers were
   buried mid-paragraph, where a procurement reader scanning three cards would never find them.
   They are lifted out into labelled rows that sit at the same height on all three cards, so the
   three units can be compared line for line instead of read end to end.

   Icons follow the cycle's own vocabulary rather than a new set: the unit that builds carries the
   same crane as the construction stage, the unit that re-equips carries the same hookup link. */
const MODELS = [
  {
    no: '1', name: 'EPC', full: 'Engineering, Procurement & Construction \u00b7 bought as EPCC or EPCM',
    icon: 'crane',
    /* 10 Sep (client review): a representation photograph first, the 3D render returns once reviewed */
    img: '/assets/banners/cap-epc.jpg', alt: 'A cleanroom facility under construction',
    routes: [{ to: '/services/epc-construction', label: 'The EPC unit' }],
    /* IAQ's own words, business unit questionnaire of 27 Jul 2026 (Section B) */
    desc: 'A one-stop solution: IAQ designs and engineers the system, procures the equipment and materials, carries out the installation and construction works, and ensures the system operates as intended on completion.',
    /* the EPCC / EPCM sentence and the duration are the client's own, moved out of the paragraph
       into the rows so they can be compared against the other two units at a glance */
    spec: [
      ['Bought as', 'EPCC, IAQ delivers the complete project. EPCM, IAQ manages it on your behalf.'],
      ['Accountable for', 'The finished facility and its performance, through one point of contact.'],
      ['Typical term', '12 to 24 months, depending on the project.'],
    ],
    items: ['Engineering design and consultation', 'Procurement of equipment and materials', 'Construction of the hi-tech facility', 'Testing and commissioning to the contracted class', 'Handover with certified documentation'],
  },
  {
    no: '3', name: 'EFM', full: 'Energy Facility Management \u00b7 the life of the facility',
    icon: 'power',
    img: '/assets/banners/cap-energy.jpg', alt: 'A chiller plant in operation',
    routes: [{ to: '/services/energy-management', label: 'The EFM unit' }],
    /* carried over from the EFM page of the current site (client, 4 Sep: "EFM use on the current
       website"), client names removed per the questionnaire's confidentiality rule */
    desc: 'A registered Energy Service Company (ESCO) under Suruhanjaya Tenaga, helping facility owners cut cooling costs, lower their carbon footprint and meet regulatory requirements without big upfront investment.',
    spec: [
      ['Bought as', 'IAQ funds the upgrade and is paid from the savings, or supplies chilled water under a service agreement.'],
      ['Accountable for', 'The savings themselves, measured against the audited baseline.'],
      ['Typical term', '10 to 20 years for Cooling as a Service, 5 to 10 years for Energy Performance Contracting.'],
    ],
    items: ['Energy audit and Energy Saving Measures', 'Energy Performance Contracting, IAQ-funded', 'Cooling-as-a-Service and Build-Operate-Transfer', 'District cooling systems, feasibility to operation', 'Maintenance and reliability, cogeneration'],
  },
  {
    no: '2', name: 'Process Critical Utilities & Total Tool Installation Solutions', full: 'Semiconductor fabs \u00b7 standalone, on the EPC or EPCM model',
    icon: 'link',
    img: '/assets/iaq/cr-utilities-p1010242.webp', alt: 'Utility runs above a cleanroom bay in an IAQ-built facility',
    routes: [{ to: '/services/tool-installation', label: 'Total Tool Installation' }, { to: '/services/process-critical-utilities', label: 'Process Critical Utilities' }],
    desc: 'The unit that re-equips a live facility. When production machines arrive or upgrade, it engineers, procures and installs the hookup that connects them, alongside production that keeps running.',
    spec: [
      ['Bought as', 'Process Critical Utilities, Total Tool Installation, or the two together.'],
      ['Accountable for', 'Utilities delivered to the tool, qualified and handed back to production.'],
      /* the questionnaire's Section D is unanswered, so this row says what is known and the note
         under the grid says what is not. It does not guess a timeline. */
      ['Typical term', 'Per tool set, inside a classified environment already in operation.'],
    ],
    items: ['CDA, PCW, PV', 'Process Exhaust System', 'Chemical / Gas Delivery System', 'UPW (ultrapure water)', 'Tools hookup and qualification'],
  },
]
/* the one unanswered question on this section, lifted OUT of unit 3's card. Inside it, an
   honest note made one of three matched cards a slot taller than the other two for a reason
   that had nothing to do with the unit. */
/* 17 Sep: section D came back. The BU head's answer (2026.07.27_IAQ BM Questionnaire_SL (Utility))
   sets out hook-up in four phases, and they are on the Total Tool Installation page. What it does
   not give is a move-in timeline, so that is what this note still asks for, and only that. */
const MODEL_GAP = 'Still to come from IAQ’s business model questionnaire: the typical move-in timeline for a tool set. The hook-up sequence itself is now published on the Total Tool Installation page.'
/* verified figures only: these are the counters already published on the built
   home page, so the whole site reports one set of numbers */
const STATS = [
  /* [value shown, numeric target, suffix, label]: the number counts up from zero as the band
     enters (2 Sep, Bazil: the proof strip was "lame"), the label is the built site's own */
  ['250+', 250, '+', 'Completed projects'],
  ['1,050,000', 1050000, '', 'm² cleanroom built-up'],
  ['450', 450, '', 'Employees group-wide'],
  ['7', 7, '', 'Countries, global offices'],
]

/* the count-up: eased over 1.6s once the strip is 40% on screen; reduced motion and no-IO get the
   final figure at once. Formatting keeps the thousands separators the still figure carries. */
function Stat({ v, n, suffix, label }) {
  const ref = React.useRef(null)
  const [shown, setShown] = React.useState(v)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still || !('IntersectionObserver' in window)) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1600
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), e2 = 1 - Math.pow(1 - k, 3)
        setShown(Math.round(n * e2).toLocaleString('en-US') + (k === 1 ? suffix : ''))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      el.classList.add('in')
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [n, suffix])
  return <div className="pg-stat sv-stat" ref={ref}><b>{shown}</b><span>{label}</span><i className="sv-stat-bar" aria-hidden="true" /></div>
}

/* six published projects, one per market where the registry allows */
/* step 7 (24 Sep plan): five projects with real photographs, one market each: semiconductor (the lead), EV battery,
   district cooling, data centre, photovoltaics. The two team photographs with the logo (prj-001, prj-012) are placeholders
   until IAQ sends site photographs. */
const PROOF = [2, 6, 12, 16, 17]

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
  useEffect(() => { document.title = 'IAQ Group · Services · Brand Method' }, [])
  /* the stage the interactive diagram is detailing: hover/focus a node to change it */
  const [stageI, setStageI] = useState(0)
  const s = STAGES[stageI]

  /* 2 Sep (Bazil: "more interactive and better animated"): the cycle turns on its own, one
     stage every 5s, the same cadence as the homepage ring — but only while the band is on
     screen, never while the pointer is over it (someone is reading), and never under reduced
     motion. Hover, click and the arrow keys all set the same state, so nothing fights. */
  const cycRef = useRef(null)
  const hover = useRef(false)
  const seen = useRef(false)
  useEffect(() => {
    const el = cycRef.current
    if (!el) return
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting }, { threshold: 0.25 })
    io.observe(el)
    const enter = () => { hover.current = true }
    const leave = () => { hover.current = false }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    const t = still ? null : setInterval(() => {
      if (seen.current && !hover.current && !document.hidden) setStageI(i => (i + 1) % 6)
    }, 5000)
    return () => { io.disconnect(); el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); if (t) clearInterval(t) }
  }, [])

  return (
    <>
      <Nav />

      {/* 9 Sep (Bazil: "icons for each"). Three chips of pure text read as one grey blur under the
          lede; a mark in front of each gives the eye three anchors and says what kind of thing each
          count is: a set, a loop, a set of solids. */}
      {/* 24 Sep (Bazil: the cover "is very important, done very well and premium"): the head is the cover built live,
          components/ServicesCover.jsx, in place of PageHead with a flat picture */}
      {/* 24 Sep (Bazil: "look at the services page and plan what's best to actually show", step 1 of the plan): the page
          opens with the delivery cycle, the same band the home page carries second: the heading as the page's h1, the
          lede, three plain facts, the serpentine. The square-box ring and the mono chips are gone; the Revit fab with
          its nine layers moves down to the work band (step 5). */}
      {/* 24 Sep, late (Bazil: "this should be the banner", "the whole banner should be the grey background", "so this is
          inside the 3D interface", and of the cycle: "this should be below business units"): the 3D and the map open the
          page as one dark banner; the units follow; the cycle sits below the units; the flow and the chart after. */}
      <MapBand />
      {/* 26 Sep (Bazil: "make the services page better ... more interesting, easy to understand"): the page's parts in one
          bar under the nav, the part in view lit */}
      <ServicesSectionBar />

      {/* 17 Sep (client: "better to have 3 business unit on top of the page instead?" and "To
          minimize the description on this landing page and transfer the information to their
          dedicated pages instead"). The three units open the page, and each card is now a name, a
          sentence and the way in: the spec rows and the scope list they used to carry are on the
          unit's own page, which is where a reader who wants that detail is going anyway. */}
      {/* 24 Sep (Bazil: "upgrade the services page with this new info"): the page now tells the Codex story in the
          Codex order, from the one data file the Codex, the slides and the unit pages read. The old unit cards and
          the glossary block are replaced by ServicesMap (components/ServicesMap.jsx). */}
      {/* 24 Sep (Bazil: "a visual that can represent the services, the units, and the CSA, MEP, process utilities,
          tools hookup and everything"): one chart, straight under the cover. It replaces the click-to-explore map
          that sat lower on the page (RelExplorer, still in the Codex). */}
      {/* step 2 (24 Sep plan): the three units come first, because a buyer chooses the unit before anything else
          (the client asked for the units on top on 17 Sep); the one-view chart then summarises what the reader has met */}
      <UnitsBand />
      <CycleBand id="services-cycle" />
      {/* 26 Sep (Bazil: "after this should be four works, and detail them") */}
      <WorksBand />
      {/* 25 Sep (Bazil: "tools hookup will have a dedicated section, like the diagram the client gave") */}
      {/* 26 Sep: the Main Tool schematic opens on demand here; it stands open on the PCU & TTI page and on /services/all */}
      <ToolsHookupBand fold />
      {/* 25 Sep (Bazil: "remove this section"): the one-flow band (OneFlow) is off the page; the component stays */}
      <SystemMap />
      {/* 24 Sep (Bazil: "in between put the old services looping view"): the ring sits between the units and the map */}
      {/* ------------- the cycle FIRST (2 Sep, Bazil: "this should be at the top"): the one
           interactive diagram carries the whole story — hover a stage for its scope, click it
           to open the service page. The six service cards and the business units follow. */}
      {/* pure white behind the diagram (Bazil, 2 Sep): the marks and discs are white objects, and
          on the off-white page ground they read as cut-outs rather than as the drawing */}
      {/* 24 Sep: the serpentine section that stood here is the page head now (step 1) */}
      <QuestionsBand />


      {/* 17 Sep: "Six services. Open the one you need." stood here and said, in cards, exactly
          what the cycle above says in one diagram (client: "These 2 section have the same
          content"). The cards are gone; every service page is still one click away, from its own
          stage on the diagram. The glossary moved up to the units. */}

      {/* 17 Sep: the business units used to stand here, under the six services. They are at the
          top of the page now (client: "better to have 3 business unit on top of the page instead?"). */}

      {/* 24 Sep (client: "Remove this section."): the kinds-of-work band with its who-does-what table is gone */}

      <FaqBand />
      {/* 24 Sep (Bazil: "move this to the bottom"): proof sits under the FAQ, last before the closing band. */}
      {/* 24 Sep (client: "Remove this section as project reference should be interlinked at each business unit
          description pages"): the proof strip is gone; each unit page keeps its own delivered projects */}

      {/* the related-navigation grid removed per the client (16:19, "remove this"):
          the enquiry is the last element, with nothing competing under it */}



      <ClosingBand note="Services concept · Brand Method" />
    </>
  )
}
