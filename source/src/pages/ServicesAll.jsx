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

export default function ServicesAll() {
  useEffect(() => { document.title = 'IAQ Group · The six services · Brand Method' }, [])
  return (
    <>
      <Nav />
      <PageHead crumbs={[{ label: 'Services', to: '/services' }]}
        eyebrow="The six services"
        title={<>Six stages, <em>one page.</em></>}
        lede="Each service, what it covers and what IAQ carries at that stage, in the order a facility runs through them."
        chips={CYCLE.map(c => c.short)} />
      <nav className="sa-jump" aria-label="Stages">
        <div className="pg-in">
          {/* router links, so the hash lands through ScrollToTop's own offset scroll (a bare anchor is swallowed by the smooth-scroll layer) */}
          {CYCLE.map(c => <Link key={c.id} to={'#' + (c.route.split('#').pop().split('/').pop())}><span className="n">{c.no}</span>{c.short}</Link>)}
        </div>
      </nav>
      {STAGES.map((S, i) => (
        <article key={S.META.slug} id={S.META.slug} className="sa-stage">
          <header className="sa-head">
            <div className="pg-in">
              <span className="pg-k"><span className="sa-no">{String(i + 1).padStart(2, '0')}</span>{S.META.eyebrow.replace(/^Stage \d+ · /, '')}</span>
              <h2>{S.META.title}</h2>
              <p className="pg-lede">{S.META.lede}</p>
            </div>
          </header>
          <S.Cover />
          <S.Scope />
        </article>
      ))}
      <article className="sa-stage" id="tool-installation-stage">
        <header className="sa-head">
          <div className="pg-in"><span className="pg-k"><span className="sa-no">06</span>Tools hookup</span></div>
        </header>
        <ToolsHookupBand embed id="tool-installation" />
      </article>
      <ClosingBand note="The six services on one page · Brand Method" />
    </>
  )
}
