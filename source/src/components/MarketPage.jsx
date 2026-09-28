import { TONAL_MARK } from './TonalMarks.jsx'
import MarketMotion from './MarketMotion.jsx'
import MarketFlow from './MarketFlow.jsx'

/* 25 Sep, night (Bazil: "put more visuals that are related, from the web, the client files, or remake something accurate
   with Higgsfield"): one photograph band per market after the delivery section. Semiconductor and bio are IAQ's own
   cleanroom photographs (SharePoint, Cleanroom Photos); the five others are generated facility stills (gpt_image_2,
   architectural, no people) and are tagged Representation, as the house rule requires. */
const BAND = {
  'mkt-semiconductor':   { src: '/assets/markets/band-semiconductor.jpg',   alt: 'A cleanroom bay delivered by IAQ, under its ceiling grid and light lines', cap: 'A cleanroom delivered by IAQ' },
  'mkt-bio-lifescience': { src: '/assets/markets/band-bio-lifescience.jpg', alt: 'A wide cleanroom hall delivered by IAQ', cap: 'A cleanroom delivered by IAQ' },
  'mkt-data-centre':     { src: '/assets/markets/band-data-centre.jpg',     alt: 'A data hall: rows of server racks along a cold aisle', cap: 'A data hall', rep: true },
  'mkt-ev-battery':      { src: '/assets/markets/band-ev-battery.jpg',      alt: 'A battery dry room with cell assembly equipment behind glass', cap: 'A gigafactory dry room', rep: true },
  'mkt-photovoltaics':   { src: '/assets/markets/band-photovoltaics.jpg',   alt: 'A solar module production line with cells on conveyors', cap: 'A cell and module line', rep: true },
  'mkt-district-cooling':{ src: '/assets/markets/band-district-cooling.jpg',alt: 'A district cooling plant room with chillers and chilled water headers', cap: 'A district cooling plant room', rep: true },
  'mkt-food-beverage':   { src: '/assets/markets/band-food-beverage.jpg',   alt: 'A hygienic food and beverage processing hall with stainless vessels', cap: 'A hygienic processing hall', rep: true },
}
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from './Nav.jsx'
import ClosingBand from './ClosingBand.jsx'
import PageHead from './PageHead.jsx'
import Icon from './FlowIcon.jsx'
import DetailDiagram from './DetailDiagram.jsx'
import { jargon } from '../lib/jargon.jsx'
import { CYCLE } from '../data/cycle.js'
import { SCOPES, INDLBL, TYPLBL, fmtSize, pad3 } from '../data/projects.js'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/markets.css'

/* ============================================================================
   The sector page template. Every market page in group 03 renders through this,
   so all seven carry the block order sitemap.js declares for them:

     Sector hero · What this market demands · How IAQ delivers it ·
     Standards and classes · Proof projects · Enquiry

   The copy lives in the page files, verbatim from the verified sources. This
   file holds only the structure, so a copy correction is a one-line edit in one
   place and never a hunt through seven near-identical pages.

   Interlinking: R1 is satisfied twice on every page, once from the hero fact
   strip and once from the card under the proof grid, both straight into the
   registry pre-filtered on the market's existing hash slug. R3 is satisfied by
   the proof grid, which reads src/data/projects.js rather than a hand list.
   ========================================================================= */

/* the six stages come from ONE source (data/cycle.js) so the rail here matches the service pages */
export const DISCIPLINES = CYCLE

/** every published project in a market, with its registry index preserved */
export function projectsFor(ind) {
  return PROJECTS.map((p, i) => ({ ...p, i })).filter(p => p.ind === ind)
}

export default function MarketPage({
  id, no, name, title, lede, image, ind, hash,
  facts = [], why, demands = [], deliverIntro = [], scopeTitle,
  cycleLede, standards, slot, proofLede,
}) {
  useEffect(() => { document.title = `IAQ Group · ${name} · Brand Method` }, [name])

  const proof = projectsFor(ind)
  const scope = SCOPES[ind] || []
  const classes = Array.from(new Set(proof.map(p => p.iso).filter(Boolean)))
  const regLabel = INDLBL[ind] || name

  /* the fourth fact is always the registry, so R1 is reachable from the hero */
  const allFacts = facts.concat([{
    k: 'On the registry',
    v: `${proof.length} published`,
    sub: 'Live on the site today. The full 250+ record migrates at launch.',
    to: `/projects#${hash}`,
  }])

  return (
    <>
      <Nav />

      {/* ------------------------------------------------ 01 · sector hero */}
      <div className="mkb">
        <div className="mkb-bg" aria-hidden="true"><img src={image} alt="" /></div>
        <div className="mkb-grid" aria-hidden="true" />
        {/* 25 Sep (Bazil: "put a detailed icon visual for each market here"), then that night ("have better looking icons for
            the market and put it at the right side of the title and description"): the tonal drawing is gone; the market's
            own line mark, large, on a frosted tile with its red duotone shadow, standing right after the title and lede */}
        <PageHead crumbs={[{ label: 'Markets', to: '/markets' }]} eyebrow={`Market ${no} · Who we serve`} title={title} lede={lede}
          aside={<span className="mkb-ico"><MarketMotion id={id} /></span>} />
        <div className="mk-facts-w">
          <div className="pg-in">
            <div className="mk-facts">
              {allFacts.map(f => {
                const body = <><span className="k">{f.k}</span><span className="v">{f.v}{f.sub ? <small>{f.sub}</small> : null}</span></>
                return f.to
                  ? <Link className="mk-fact" key={f.k} to={f.to}>{body}</Link>
                  : <div className="mk-fact" key={f.k}>{body}</div>
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- 02 · what this market demands */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">What this market demands</span>
          <h2>{why.head}</h2>
          <div className="pg-split">
            <blockquote className="pg-pull"><small>{why.cite}</small>{why.quote}</blockquote>
            <p className="pg-body u-mt0">{jargon(why.body)}</p>
          </div>
          {/* the requirements as icon tiles (2 Sep): what the market is judged on, each with its
              own mark, no order implied */}
          <DetailDiagram variant="grid" items={demands.map(d => ({ label: d }))} ariaLabel="What this market demands" />
        </div>
      </section>

      {/* ----------------------------------- 03 · how IAQ delivers it */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">How IAQ delivers it</span>
          <h2>One accountable team, every system</h2>
          {deliverIntro.map((p, i) => <p className="pg-body" key={i}>{jargon(p)}</p>)}

          {/* 25 Sep, night (Bazil: "make sure every market complete flow or diagram easier for people to understand"): one
              diagram in two rows, the scope as numbered tiles with arrows and the six stages as tiles with their line
              (MarketFlow). The flow rail and the six-box strip that stood here are gone. */}
          <MarketFlow scope={scope} scopeTitle={scopeTitle} lede={cycleLede} />
        </div>
      </section>

      {/* ------------------------------- 03b · the market, photographed */}
      {BAND[id] && (
        <section className="mk-band" aria-label={BAND[id].cap}>
          <img src={BAND[id].src} alt={BAND[id].alt} loading="lazy" decoding="async" />
          <span className="mk-band-cap">{BAND[id].cap}{BAND[id].rep && <i>Representation</i>}</span>
        </section>
      )}

      {/* ------------------------------- 04 · standards and classes */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">Standards and classes</span>
          <h2>{standards.head}</h2>
          <div className="pg-split">
            <div>
              <p className="pg-body u-mt0">{jargon(standards.body)}</p>
              {classes.length > 0 && (
                <ul className="pg-chips">
                  <li className="pg-chip b">Published record</li>
                  {classes.map(c => <li className="pg-chip" key={c}>{c}</li>)}
                </ul>
              )}
            </div>
            {slot ? (
              <div className="pg-slot u-mt0">
                <div className="pg-slot-in">
                  <span className="pg-slot-tag">{slot.tag}</span>
                  <b>{slot.title}</b>
                  <p>{slot.body}</p>
                  <span className="pg-k">{slot.who}</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="pg-k">{standards.k2}</span>
                <p className="pg-body">{jargon(standards.body2)}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------- 05 · proof projects */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2>Delivered in this market</h2>
          <p className="pg-lede">{proofLede}</p>

          <div className={proof.length < 3 ? 'pg-proof few' : 'pg-proof'}>
            {proof.map(p => (
              <Link className="pg-pc" key={p.i} to={`/projects/${p.i}`}>
                <div className="pg-pcv"><img src={p.img} alt="" loading="lazy" /></div>
                <div className="pg-pc-in">
                  <span className="pg-ref"><span>PRJ &middot; {pad3(p.i)}</span><span className="iso">{p.iso}</span></span>
                  <h3>{p.name}</h3>
                  <span className="pg-cl">{p.client} &middot; {p.loc}</span>
                  <div className="pg-tags">
                    {/* fmtSize prints "At scale" when a size is not recorded, which
                        says nothing on a tag: only show the tag when there is a number */}
                    {p.size > 0 && <span className="pg-tag b">{fmtSize(p)}</span>}
                    {TYPLBL[p.type] && <span className="pg-tag">{TYPLBL[p.type]}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
      <ClosingBand note={`${name} market concept · Brand Method`} />
    </>
  )
}
