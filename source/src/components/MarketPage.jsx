import { TONAL_MARK } from './TonalMarks.jsx'
import MarketMotion from './MarketMotion.jsx'
import MarketFlow from './MarketFlow.jsx'

/* 25 Sep, night (Bazil: "put more visuals that are related, from the web, the client files, or remake something accurate
   with Higgsfield"): one photograph band per market after the delivery section. Semiconductor and bio are IAQ's own
   cleanroom photographs (SharePoint, Cleanroom Photos); the five others are generated facility stills (gpt_image_2,
   architectural, no people) and are tagged Representation, as the house rule requires. */
const BAND = {
  /* 22 Oct (Bazil: "generate new one and replace"): a wafer fab bay generated in ChatGPT in place of the ceiling photograph */
  'mkt-semiconductor':   { src: '/assets/markets/band-semiconductor-fab.jpg', alt: 'A semiconductor fab bay: process tools either side of the aisle, raised perforated floor, ceiling grid', cap: 'A semiconductor fab bay', rep: true },
  /* 21 Oct (Bazil: "the floor should no reflection"): the same photograph with a matte floor and no date stamp, edited in ChatGPT;
     22 Oct ("remove the scafolding"): the scaffold tower at the back wall is painted out */
  'mkt-bio-lifescience': { src: '/assets/markets/band-bio-lifescience-clean.jpg', alt: 'A wide cleanroom hall delivered by IAQ', cap: 'A cleanroom delivered by IAQ' },
  /* 22 Oct (Bazil: "should be consistent, the image should be big"): Data Centre and EV Battery carry the full-width band
     like Semiconductor, each a ChatGPT-generated still (no people, no logos) in place of the stills the client removed */
  'mkt-data-centre':     { src: '/assets/markets/band-data-centre-plant.jpg', alt: 'A data centre central utility plant: chillers, pumps and insulated chilled water pipes, switchgear behind', cap: 'A data centre utility plant', rep: true },
  'mkt-ev-battery':      { src: '/assets/markets/band-ev-battery-line.jpg', alt: 'An enclosed battery cell assembly line, utility ducts and pipes overhead', cap: 'A battery cell assembly line', rep: true },
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
  return PROJECTS.map((p, i) => ({ ...p, i })).filter(p => !p.hide && p.ind === ind)
}

/* 22 Oct (client: the market pages look "plain, no color"): the section headings take the house form, the last word in the
   market violet, and the overview stands beside a picture of the market (the same set the home page's market strip uses,
   not the hero's own frame) */
const accent = h => {
  if (typeof h !== 'string') return h
  const k = h.lastIndexOf(' ')
  return k > 0 ? <>{h.slice(0, k)} <em>{h.slice(k + 1)}</em></> : h
}
/* 22 Oct (Bazil: "please generate new image related with the market. i dont want to use repeated image"): the overview
   pictures no longer repeat the home page's market strip. Seven new stills generated in ChatGPT, each a subject the page
   does not show elsewhere (not the hero, not the band): a wafer at a load port, a data centre roof of dry coolers, an
   electrode coating line, solar cells at a robot gripper, a district cooling pipe tunnel, an aseptic filling isolator, a
   high-care packing line. Matte floors, no logos or readable text. Representations, so no project is claimed */
const OVPIC = {
  'mkt-semiconductor': '/assets/markets/ov-semiconductor.jpg',
  'mkt-data-centre': '/assets/markets/ov-data-centre.jpg',
  'mkt-ev-battery': '/assets/markets/ov-ev-battery.jpg',
  'mkt-photovoltaics': '/assets/markets/ov-photovoltaics.jpg',
  'mkt-district-cooling': '/assets/markets/ov-district-cooling.jpg',
  'mkt-bio-lifescience': '/assets/markets/ov-bio-lifescience.jpg',
  'mkt-food-beverage': '/assets/markets/ov-food-beverage.jpg',
}

export default function MarketPage({
  id, no, name, title, lede, image, ind, hash,
  facts = [], why, demands = [], deliverIntro = [], scopeTitle,
  cycleLede, standards, slot, proofLede,
  hideRegistry = false,   /* 20 Oct: a page with no figures strip at all (Food & Beverage) */
  /* 20 Oct (Food & Beverage, IAQ's amendment sheet): a page's own section headings and kickers, a heading over the tiles,
     and the scope row switched off */
  whyKick = 'What this market demands', demandsHead, whyMore, hideBand = false, deliverKick = 'How IAQ delivers it', deliverHead, hideScope = false,
}) {
  useEffect(() => { document.title = `IAQ Group · ${name} · Brand Method` }, [name])
  /* 22 Oct: the capability cards' light follows the pointer (markets.css, .mk-caps .dd-n::before); in percent, so the page zoom
     on wide screens does not throw it off */
  useEffect(() => {
    const cards = [...document.querySelectorAll('.mk-caps .dd-n')]
    const move = e => {
      const r = e.currentTarget.getBoundingClientRect()
      e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%')
      e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%')
    }
    cards.forEach(c => c.addEventListener('pointermove', move))
    return () => cards.forEach(c => c.removeEventListener('pointermove', move))
  }, [id])

  const proof = projectsFor(ind)
  const scope = SCOPES[ind] || []
  const classes = Array.from(new Set(proof.map(p => p.iso).filter(Boolean)))
  const regLabel = INDLBL[ind] || name

  /* the fourth fact is always the registry, so R1 is reachable from the hero */
  const allFacts = facts.concat(hideRegistry ? [] : [{
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
        {allFacts.length > 0 && <div className="mk-facts-w">
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
        </div>}
      </div>

      {/* ------------------------------- 02 · what this market demands */}
      <section className="pg-sec">
        <div className="pg-in">
          <div className={'mk-ov' + (OVPIC[id] ? ' has-fig' : '')}>
            <div className="mk-ov-copy">
              {whyKick && <span className="pg-k">{whyKick}</span>}
              <h2>{accent(why.head)}</h2>
              {why.quote ? (
              <div className="pg-split">
                <blockquote className="pg-pull"><small>{why.cite}</small>{why.quote}</blockquote>
                <p className="pg-body u-mt0">{jargon(why.body)}</p>
              </div>
              ) : <p className="pg-body mk-why-body">{jargon(why.body)}</p>}
            </div>
            {OVPIC[id] && (
              <figure className="mk-ov-fig" aria-hidden="true">
                <img src={OVPIC[id]} alt="" loading="lazy" decoding="async" />
                <span className="mk-ov-mark"><Icon name={({ 'mkt-semiconductor': 'chip', 'mkt-data-centre': 'server', 'mkt-ev-battery': 'battery', 'mkt-photovoltaics': 'sun', 'mkt-district-cooling': 'snow', 'mkt-bio-lifescience': 'flask', 'mkt-food-beverage': 'bottle' })[id] || 'factory'} /></span>
              </figure>
            )}
          </div>
          {/* 20 Oct: a second heading and paragraph under the overview (Semiconductor, "How IAQ Supports ...") */}
          {whyMore && <div className="mk-supp"><h3 className="mk-demands-h">{accent(whyMore.head)}</h3><p className="pg-body mk-why-body">{jargon(whyMore.body)}</p></div>}
          {demandsHead && <h3 className="mk-demands-h">{accent(demandsHead)}</h3>}
          {/* the requirements as icon tiles (2 Sep): what the market is judged on, each with its
              own mark, no order implied */}
          <div className={demandsHead ? 'mk-caps' : undefined}><DetailDiagram variant="grid" items={demands.map(d => (typeof d === 'string' ? { label: d } : d))} ariaLabel="What this market demands" /></div>
        </div>
      </section>

      {/* ----------------------------------- 03 · how IAQ delivers it */}
      <section className="pg-sec calm">
        <div className="pg-in">
          {deliverKick && <span className="pg-k">{deliverKick}</span>}
          <h2>{accent(deliverHead || 'One accountable team, every system')}</h2>
          {deliverIntro.map((p, i) => <p className="pg-body" key={i}>{jargon(p)}</p>)}

          {/* 25 Sep, night (Bazil: "make sure every market complete flow or diagram easier for people to understand"): one
              diagram in two rows, the scope as numbered tiles with arrows and the six stages as tiles with their line
              (MarketFlow). The flow rail and the six-box strip that stood here are gone. */}
          <MarketFlow scope={hideScope ? [] : scope} scopeTitle={scopeTitle} lede={cycleLede} />
        </div>
      </section>

      {/* ------------------------------- 03b · the market, photographed */}
      {/* 20 Oct: `hideBand` drops a generated still a page should not carry (Data Centre, client: "So not our project?") */}
      {BAND[id] && !hideBand && (
        <section className="mk-band" aria-label={BAND[id].cap}>
          <img src={BAND[id].src} alt={BAND[id].alt} loading="lazy" decoding="async" />
          {/* 15 Oct ("remove all the tag"): no caption chip or Representation tag on the photograph */}
        </section>
      )}

      {/* ------------------------------- 04 · standards and classes */}
      {/* 20 Oct: drawn only when the page passes `standards` (Data Centre's was removed on the client's review) */}
      {standards && <section className="pg-sec">
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
      </section>}

      {/* ------------------------------------- 05 · proof projects */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2>Delivered in this <em>market</em></h2>
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
