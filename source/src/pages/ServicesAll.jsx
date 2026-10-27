import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Icon from '../components/FlowIcon.jsx'
import { CYCLE } from '../data/cycle.js'
import * as Design from './ServiceDesign.jsx'
import * as Procurement from './ServiceProcurement.jsx'
import * as Construction from './ServiceConstruction.jsx'
import * as Commissioning from './ServiceCommissioning.jsx'
import * as Maintenance from './ServiceMaintenance.jsx'
import '../styles/pages.css'
import '../styles/services-all.css'
import ToolsHookupBand from '../components/ToolsHookupBand.jsx'

/* ============================================================================
   /services/all · 25 Sep 2026. IAQ, 24 Sep review: "Is it possible to merge all the description pages for each service
   into one? The interlink is too confusing. Only the header clickable. Overall flow: 1st service with the description,
   What IAQ carries at this stage, then the next service." And: "the bottom section is repetitive, remove it and continue
   with the next service." So: six stages down one page, each as its description then its scope, nothing between them.
   The five stage pages keep their exports (Cover, Scope, META); stage six is the tool installation page, linked.
   ============================================================================ */
const STAGES = [Design, Procurement, Construction, Commissioning, Maintenance]

/* 19 Oct (IAQ feedback, All six services · Service cards and imagery: "For each service card, use: (1) official
   service name, (2) one-sentence scope description, (3) one approved image that actually depicts the service. Avoid
   duplicating the same diagram"): each stage now opens on IAQ's name for the service as its heading, its one sentence,
   and one picture of that service being done, six different pictures, none reused on this page. The marketing line
   that was the heading ("Where the facility is decided") is off the stage head. Pictures are the site's own service
   banners and IAQ's build photograph; IAQ to confirm all six (names, sentences, pictures) before launch. */
const FIG = {
  design:        { src: '/assets/banners/svc-design.jpg',     alt: 'Engineering drawings on a desk beside a screen showing a facility model' },
  /* 21 Oct (Bazil: "replace this image with related"): engineers checking delivered equipment at goods receiving, generated in ChatGPT, in place of the wrapped units with the red ribbon */
  procurement:   { src: '/assets/services/svc-procurement-receiving.webp', alt: 'Two engineers at goods receiving checking a delivered air handling unit and equipment crates against a delivery checklist' },
  construction:  { src: '/assets/iaq/cr-build-2024-clear.webp',     alt: 'A cleanroom nearing completion, wall panels, ceiling grid and perforated floor in place' },
  commissioning: { src: '/assets/banners/svc-commission.jpg', alt: 'An engineer in a cleanroom suit taking a measurement with a tripod-mounted instrument' },
  tool:          { src: '/assets/banners/svc-hookup.jpg',     alt: 'Process utility lines and a connection panel along a cleanroom wall, ready for a production tool' },
  /* 28 Oct (Bazil: "replace this image. maybe like clean room with jumpsuit doing checking"): two engineers in cleanroom
     coveralls reading a wall pressure gauge against a checklist, made in ChatGPT; they check and record only, no hands-on
     work. The picture keeps its left edge (pos) so the 4:3 crop holds the gauge */
  maintenance:   { src: '/assets/services/svc-maintenance-check.webp', pos: '0% 40%', alt: 'Two engineers in cleanroom coveralls checking a wall pressure gauge reading against a checklist on a tablet' },
}
const nameOf = S => S.META.eyebrow.replace(/^Stage \d+ · /, '')
/* 27 Oct (client: "Need to restructure the layout, a bit messy"): one block per stage. The number, the name, the one line
   and the stage's own text sit in one column beside its picture, the picture side alternating down the page. The second
   heading ("The stage where ...") and the pull quote that repeated the text are not drawn (services-all.css .sa-body). */
function StageHead({ no, name, line, fig, children }) {
  return (
    <header className={'sa-head' + (no % 2 === 0 ? ' is-flip' : '')}>
      <div className="pg-in sa-head-in">
        <div className="sa-copy">
          {/* 21 Oct ("already got numbering why repeated?"): the "Service 1 of 6" words are gone; 22 Oct ("where is the
              numbering"): the red number stays, alone, above each heading */}
          {/* 28 Oct ("my boss said dont add numbering"): no number above the stage heading; the stage bar at the top keeps its own */}
          <h2>{name}</h2>
          <p className="pg-lede">{line}</p>
          {children && <div className="sa-body">{children}</div>}
        </div>
        <figure className="sa-fig"><img src={fig.src} alt={fig.alt} loading="lazy" decoding="async" style={fig.pos ? { objectPosition: fig.pos } : undefined} /></figure>
      </div>
    </header>
  )
}

export default function ServicesAll() {
  useEffect(() => { document.title = 'IAQ Group · The six services · Brand Method' }, [])
  return (
    <>
      <Nav />
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="The six services"
        title={<>Six stages, <em>one page.</em></>}
        lede="Each service, what it covers and what IAQ carries at that stage, in the order a facility runs through them." />
      {/* 21 Oct ("remove"): the six stage tags under the lede are gone; the numbered stage bar below already names them */}
      <nav className="sa-jump" aria-label="Stages">
        <div className="pg-in">
          {/* router links, so the hash lands through ScrollToTop's own offset scroll (a bare anchor is swallowed by the smooth-scroll layer) */}
          {CYCLE.map(c => <Link key={c.id} to={'#' + (c.route.split('#').pop().split('/').pop())}><span className="n">{c.no}</span>{c.short}</Link>)}
        </div>
      </nav>
      {/* 15 Oct (client review of 13 Oct, Sunny: "Use \"Tool Installation\" and the sequence comes before \"Maintenance\""):
          stage 05 is Tool Installation, by IAQ's name, and Maintenance closes the page as stage 06 */}
      {STAGES.slice(0, 4).map((S, i) => (
        <article key={S.META.slug} id={S.META.slug} className="sa-stage">
          <StageHead no={i + 1} name={nameOf(S)} line={S.META.lede} fig={FIG[S.META.slug]}><S.Cover /></StageHead>
          {/* 21 Oct ("remove this section repeating"): S.Scope, "What IAQ carries at this stage.", is off every stage */}
        </article>
      ))}
      {/* 28 Oct ("when i click Tool Installation should be redirect to this section"): #tool-installation is the stage itself,
          its head and picture, as the other five stages are; the four phases under it take their own id */}
      <article className="sa-stage" id="tool-installation">
        {/* 27 Oct ("this one no description"): the stage carries its own text like the other five, IAQ's description of tool
            installation from the PCU & TTI page (the SL questionnaire, section D) */}
        <StageHead no={5} name="Tool Installation" line="Each production tool is connected into the live facility and released to production." fig={FIG.tool}>
          <p className="pg-body">Total Tool Installation connects production equipment fully and precisely into the facility it sits in. IAQ designs, installs and commissions the process critical utilities, then brings each of them to the tool.</p>
          <p className="pg-body">The utilities are built in two sections. The bulk systems are designed and built with the base build. Once the building is complete and the tools arrive, each utility is tapped from its valve manifold and connected into the tool: the hook-up.</p>
        </StageHead>
        <ToolsHookupBand embed bare id="tool-installation-phases" />
      </article>
      {STAGES.slice(4).map((S, j) => { const i = j + 5; return (
        <article key={S.META.slug} id={S.META.slug} className="sa-stage">
          <StageHead no={i + 1} name={nameOf(S)} line={S.META.lede} fig={FIG[S.META.slug]}><S.Cover /></StageHead>
          {/* 21 Oct ("remove this section repeating"): S.Scope, "What IAQ carries at this stage.", is off every stage */}
        </article>
      ) })}
      <ClosingBand note="The six services on one page · Brand Method" />
    </>
  )
}
