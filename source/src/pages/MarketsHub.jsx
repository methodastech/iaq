import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import ClosingBand from '../components/ClosingBand.jsx'
import PageHead from '../components/PageHead.jsx'
import Icon from '../components/FlowIcon.jsx'
import { IndustryRow } from '../components/IndustryGrid.jsx'
import { TYPLBL, fmtSize, pad3 } from '../data/projects.js'
import { MARKETS } from '../data/markets.js'
import { HERO_LINE } from '../components/HeroLineMarks.jsx'
import { cmsProjects, live } from '../lib/cms.js'
const PROJECTS = live(cmsProjects)
import '../styles/pages.css'
import '../styles/markets.css'

/* ============================================================================
   03 · Who we serve. The hub where a buyer self-identifies in one click.

   Card order is the client's confirmed priority (discovery A1.4, verbatim):
   Semiconductor, Data Centre, EV Battery, Photovoltaics, District Cooling &
   Heating, Bio LifeScience, Food & Beverages.

   Card one-liners and the images are the built site's own industries section.
   The h1 is that section's approved headline. Every count on this page is read
   from src/data/projects.js rather than typed, so it can never drift.
   ========================================================================= */

/* Each market carries what its own market page publishes, not a hand-typed label:
     measure  the quantity a buyer is actually judged on
     spec     the market page's OWN Classification or Specification fact, verbatim. For a
              market with no cleanroom class that is the words "Not applicable", which is what
              the page says, not a capacity figure borrowed from another column
     flag     the market page's "Largest delivered" fact, and nothing else
     ind      the registry facet, so the card can offer a second action into /projects
   10 Sep: five of seven rows had a largest-delivered claim sitting under spec and a
   regional-first claim under flag, so the two columns could not be read down as a comparison.
   Each cell now carries only the fact its column is named for. Three specs are a class WORD
   rather than a number, which is the point. */
/* 18 Sep: the rows moved to data/markets.js, so the home hero's market rail reads the same seven */

/* one flagship per market. Sorted by SIZE first, then registry order as the tie-break:
   findIndex alone returned whatever happened to sit first in the file, which showed the
   25,000 m² testing plant for semiconductor rather than the 43,000 m² backend plant the
   market page itself names as its largest delivered, and undersold four of the seven. */
const FLAGSHIPS = MARKETS.map(m => {
  const rows = PROJECTS
    .map((p, i) => ({ ...p, i }))
    .filter(p => p.ind === m.ind)
    .sort((a, b) => (b.size || 0) - (a.size || 0) || a.i - b.i)
  return rows.length ? { ...rows[0], market: m.name } : null
}).filter(Boolean)

export default function MarketsHub() {
  useEffect(() => { document.title = 'IAQ Group · Markets · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* -------------------------------------------------- 01 · intro */}
      {/* 25 Sep (Bazil: "not red but purple"): the hub's headline phrase in the market violet (markets.css .mk-hub-head) */}
      <div className="mk-hub-head">
      <PageHead
        eyebrow="Where we build"
        title={<>Seven markets, <em>one standard of clean</em>.</>}
        lede="Each market page sets out what the environment demands, how IAQ builds it and the projects that prove it."
        chips={['7 markets', '250+ projects', '1,050,000 m² cleanroom built', '7 countries']}
        figure={{ src: '/assets/banners/mkt-hub.jpg', alt: 'A hi-tech industrial campus at dusk: facility blocks, rooftop plant, a data hall and a solar roof', hero: true }}
      />
      </div>

      {/* ------------------------------------- 02 · seven market cards */}
      {/* This section does the page's entire job and used to open with no kicker, no
          heading and no aria-label — the only band on the page without one. */}
      {/* 25 Sep (Bazil: "remove this title", "somehow make it fit well here"): the seven stand straight under the hero,
          no heading over them; the band is tighter and the cards a screen high */}

      {/* ---------------------------------------- 03 · standards strip */}
      <section className="pg-sec deep">
        <div className="pg-in">
          <span className="pg-k">One standard, seven measures</span>
          {/* 25 Sep (Bazil: "better title, stop saying wacky things") */}
          <h2>What each market requires</h2>
          <p className="pg-lede">Each market sets its own measure: particles in a wafer fab, moisture on a battery line, kilowatt hours in a cooling plant.</p>

          {/* WAS: a seven-tile icon lattice repeating the same seven markets in the same
              order, with five of the seven glyphs identical to the cards above and the
              semiconductor line character-for-character the card's own spec. It also
              stranded one tile beside five empty tinted cells, because auto-fit resolved
              to six tracks for seven items.

              NOW: the one object the section promised and never delivered. The band says
              clean means seven different things, so here are the seven side by side, in a
              form a buyer can actually compare. Every value is already published on the
              market page it links to. */}
          {/* 24 Sep (Bazil: "make this look better"): the same seven rows as a board, each row a link to its market,
              the market's own line mark in front, the class as a plate, the registry count as a red chip. */}
          {/* 25 Sep (Bazil: "isn't it supposed to be in table view instead, so easier to compare"): the seven as one table
              on wide screens, one row per market, the same four measures side by side; the cards below serve phones */}
          <div className="mk-tbl-wrap">
            <table className="mk-tbl">
              <thead><tr><th scope="col">Market</th><th scope="col">Measured by</th><th scope="col">Class or spec</th><th scope="col">Largest delivered</th><th scope="col">In registry</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
              <tbody>
                {MARKETS.map(m => {
                  const n = PROJECTS.filter(p => p.ind === m.ind).length
                  const Ln = HERO_LINE[m.id]
                  return (
                    <tr key={m.id}>
                      <th scope="row"><Link to={m.to} className="mk-tbl-name">{Ln && <Ln />}<b>{m.name}</b></Link></th>
                      <td>{m.measure}</td>
                      <td><i className="mk-spec">{m.spec}</i></td>
                      <td>{m.flag}</td>
                      <td><span className="mk-cd-sq" aria-hidden="true">{Array.from({ length: Math.max(1, n) }, (_, k) => <i key={k} />)}</span><span className="mk-tbl-n">{n} {n === 1 ? 'project' : 'projects'}</span></td>
                      <td><Link to={m.to} className="mk-cd-go">Open the market &rarr;</Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mk-cards" role="list" aria-label="What each market is measured by, its class or specification, its largest delivered project and how many rows it holds in the sample registry">
            {MARKETS.map(m => {
              const n = PROJECTS.filter(p => p.ind === m.ind).length
              const Ln = HERO_LINE[m.id]
              return (
                <Link className="mk-cd" role="listitem" key={m.id} to={m.to}>
                  <span className="mk-cd-top">{Ln && <Ln />}<b>{m.name}</b></span>
                  {/* 25 Sep, 22:05 (Bazil: equal widths and fewer labels): four labels per card became one; the measure reads
                      as a sentence beside the class plate, the registry count as squares with its words */}
                  <span className="mk-cd-lead">Measured by {/^[A-Z][a-z]/.test(m.measure) ? m.measure.charAt(0).toLowerCase() + m.measure.slice(1) : m.measure}</span>
                  <i className="mk-spec">{m.spec}</i>
                  <span className="mk-cd-row"><small>Largest delivered</small><span className="mk-cd-v">{m.flag}</span></span>
                  <span className="mk-cd-n2"><span className="mk-cd-sq" aria-hidden="true">{Array.from({ length: Math.max(1, n) }, (_, k) => <i key={k} />)}</span><span>{n} {n === 1 ? 'project' : 'projects'} in the registry</span></span>
                  <span className="mk-cd-go" aria-hidden="true">Open the market &rarr;</span>
                </Link>
              )
            })}
          </div>

          <div className="pg-stats">
            <div className="pg-stat"><b>ISO 3 to 8</b><span>Cleanroom classes across the delivered record, Class 1 to Class 100K</span></div>
            <div className="pg-stat"><b>Grade B, C, D</b><span>GMP grades held on recorded Bio LifeScience work</span></div>
            <div className="pg-stat"><b>Dry room</b><span>Battery lines specified by humidity, with the dew point as the measure</span></div>
            <div className="pg-stat"><b>1,050,000 m²</b><span>Cleanroom built-up area delivered by the group</span></div>
          </div>

          {/* A dashed "Content slot · certifications" panel used to close this band at
              full width, so the section ended on an admission that it is unfinished. The
              certificates are named in the standards copy above and the badge row already
              shows them; a downloadable set is a launch task, not a page element. */}
        </div>
      </section>

      {/* 26 Sep (Bazil: "after that table only then show this"): the seven-market strip follows the board */}
      <section className="pg-sec tight mk-seven" aria-label="The seven markets">
        <div className="pg-in">

          {/* 4 Sep: the client asked for the home page's expanding strip here rather than a
              card grid — "i said side by side like teh industry at homepage". Same component,
              so the two can never drift apart. The registry fallback that filled the grid's
              eighth cell follows as its own line, since a strip has no empty cell to fill. */}
          <IndustryRow />
          {/* 25 Sep, night (Bazil: "remove this"): the "Not sure which fits?" registry line is gone */}
        </div>
      </section>

      {/* --------------------------------------------- 04 · proof strip */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2>One project from each market</h2>
          <p className="pg-lede">One project from each market, from the published registry. The full record of 250+ projects follows at launch.</p>

          <div className="pg-proof">
            {FLAGSHIPS.map(p => (
              <Link className="pg-pc" key={p.i} to={`/projects/${p.i}`}>
                <div className="pg-pcv"><img src={p.img} alt="" loading="lazy" /></div>
                <div className="pg-pc-in">
                  <span className="pg-ref"><span>{p.market}</span><span className="iso">{p.iso}</span></span>
                  <h3>{p.name}</h3>
                  <span className="pg-cl">{p.client} &middot; {p.loc}</span>
                  <div className="pg-tags">
                    {p.size > 0 && <span className="pg-tag b">{fmtSize(p)}</span>}
                    {TYPLBL[p.type] && <span className="pg-tag">{TYPLBL[p.type]}</span>}
                  </div>
                </div>
              </Link>
            ))}
            {/* the eighth cell, so seven proof cards read as a deliberate 4 over 4
                rather than a ragged half-row with the record link hanging below it */}
            <Link className="pg-pc pg-pc-more" to="/projects">
              <span className="pg-nextic"><Icon name="folder" /></span>
              <b>Search the whole record</b>
              <small>Every project tagged by market, location, delivery model and cleanroom class.</small>
              <span className="pg-more-go">Search all projects &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* <Related from="markets-hub" /> removed: linksOut for this page is the seven
          markets plus /projects, so the strip rendered eight tiles — seven of them
          markets the visitor has now been shown twice, each carrying generated
          boilerplate, and a second /projects link within one screen of the proof
          strip's own. The cards and the table are the routes into the markets. */}

      <ClosingBand note="Markets concept · Brand Method" />
    </>
  )
}
