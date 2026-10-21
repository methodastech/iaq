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
  construction:  { src: '/assets/iaq/cr-build-2024.webp',     alt: 'A cleanroom under construction, with scaffolding and wall panels in place' },
  commissioning: { src: '/assets/banners/svc-commission.jpg', alt: 'An engineer in a cleanroom suit taking a measurement with a tripod-mounted instrument' },
  tool:          { src: '/assets/banners/svc-hookup.jpg',     alt: 'Process utility lines and a connection panel along a cleanroom wall, ready for a production tool' },
  maintenance:   { src: '/assets/banners/svc-maintain.jpg',   alt: 'A technician with an equipment cabinet opened for servicing' },
}
const nameOf = S => S.META.eyebrow.replace(/^Stage \d+ · /, '')
function StageHead({ no, name, line, fig }) {
  return (
    <header className="sa-head">
      <div className="pg-in sa-head-in">
        <div>
          <span className="pg-k"><span className="sa-no">{String(no).padStart(2, '0')}</span>Service {no} of 6</span>
          <h2>{name}</h2>
          <p className="pg-lede">{line}</p>
        </div>
        <figure className="sa-fig"><img src={fig.src} alt={fig.alt} loading="lazy" decoding="async" /></figure>
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
          <StageHead no={i + 1} name={nameOf(S)} line={S.META.lede} fig={FIG[S.META.slug]} />
          <S.Cover />
          {/* 21 Oct ("remove this section repeating"): S.Scope, "What IAQ carries at this stage.", is off every stage */}
        </article>
      ))}
      <article className="sa-stage" id="tool-installation-stage">
        <StageHead no={5} name="Tool Installation" line="Each production tool is connected into the live facility and released to production." fig={FIG.tool} />
        <ToolsHookupBand embed bare id="tool-installation" />
      </article>
      {STAGES.slice(4).map((S, j) => { const i = j + 5; return (
        <article key={S.META.slug} id={S.META.slug} className="sa-stage">
          <StageHead no={i + 1} name={nameOf(S)} line={S.META.lede} fig={FIG[S.META.slug]} />
          <S.Cover />
          {/* 21 Oct ("remove this section repeating"): S.Scope, "What IAQ carries at this stage.", is off every stage */}
        </article>
      ) })}
      <ClosingBand note="The six services on one page · Brand Method" />
    </>
  )
}
