import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import PageHead from '../components/PageHead.jsx'
import Related from '../components/Related.jsx'
import Icon from '../components/FlowIcon.jsx'
import { TYPLBL, fmtSize, pad3 } from '../data/projects.js'
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

const MARKETS = [
  { id: 'mkt-semiconductor', name: 'Semiconductor', to: '/markets/semiconductor', icon: 'chip',
    img: '/assets/industries/semiconductor.webp', ind: 'semiconductor',
    line: 'Wafer fabs, backend plants, ISO 3 to 6 cleanrooms.', spec: 'ISO 3 to 7' },
  { id: 'mkt-data-centre', name: 'Data Centre', to: '/markets/data-centre', icon: 'server',
    img: '/assets/industries/data-centre.webp', ind: 'data-centre',
    line: 'Cooling, power and controlled environments at scale.', spec: 'Cooling and power' },
  { id: 'mkt-ev-battery', name: 'EV Battery', to: '/markets/ev-battery', icon: 'battery',
    img: '/assets/industries/ev-battery.webp', ind: 'ev-battery',
    line: 'Gigafactory dry rooms, humidity-critical builds.', spec: 'Dry room' },
  { id: 'mkt-photovoltaics', name: 'Photovoltaics', to: '/markets/photovoltaics', icon: 'sun',
    img: '/assets/industries/photovoltaic.webp', ind: 'photovoltaic',
    line: 'Solar cell and module production facilities.', spec: 'ISO 6 to 8' },
  { id: 'mkt-district-cooling', name: 'District Cooling & Heating', to: '/markets/district-cooling', icon: 'snow',
    img: '/assets/industries/district-cooling.webp', ind: 'district-cooling',
    line: "Including Malaysia's largest district cooling centre.", spec: 'Energy at scale' },
  { id: 'mkt-bio-lifescience', name: 'Bio LifeScience', to: '/markets/bio-lifescience', icon: 'flask',
    img: '/assets/industries/pharma.webp', ind: 'pharma',
    line: 'GMP parenteral, labs and medical device plants.', spec: 'ISO 5 to 8, GMP' },
  { id: 'mkt-food-beverage', name: 'Food & Beverage', to: '/markets/food-beverage', icon: 'leaf',
    img: '/assets/industries/fnb.webp', ind: 'fnb',
    line: 'Hygienic flavor and food production environments.', spec: 'Hygienic' },
]

/* one flagship per market, taken in registry order so the strip stays honest */
const FLAGSHIPS = MARKETS.map(m => {
  const i = PROJECTS.findIndex(p => p.ind === m.ind)
  return i < 0 ? null : { ...PROJECTS[i], i, market: m.name }
}).filter(Boolean)

export default function MarketsHub() {
  useEffect(() => { document.title = 'IAQ Group · Markets · Brand Method' }, [])

  return (
    <>
      <Nav />

      {/* -------------------------------------------------- 01 · intro */}
      <PageHead
        eyebrow="Where we build"
        title={<>Seven industries, <em>one standard of clean</em>.</>}
        lede="Each of these environments is judged by a different measure: a particle count, a dew point, a temperature that never moves, a hygiene regime. Pick the one you are building and the page tells you what it demands, how IAQ builds it, and the projects that prove it."
        chips={['7 markets', '230+ projects', '1,050,000 m² cleanroom built', '8 countries']}
      />

      {/* ------------------------------------- 02 · seven market cards */}
      <section className="pg-sec tight">
        <div className="pg-in">
          <div className="mk-cards">
            {MARKETS.map((m, i) => {
              const n = PROJECTS.filter(p => p.ind === m.ind).length
              return (
                <Link className="mk-card" key={m.id} to={m.to}>
                  <div className="mk-cv">
                    <img src={m.img} alt="" loading="lazy" />
                    <span className="no">MKT &middot; {pad3(i + 1)}</span>
                  </div>
                  <div className="mk-cb">
                    <span className="ic"><Icon name={m.icon} /></span>
                    <h3>{m.name}</h3>
                    <p>{m.line}</p>
                    <span className="cls"><b>{m.spec}</b> &middot; {n} published {n === 1 ? 'project' : 'projects'}</span>
                    <span className="go">Open market &rarr;</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------- 03 · standards strip */}
      <section className="pg-sec calm">
        <div className="pg-in">
          <span className="pg-k">One standard, seven measures</span>
          <h2>What clean means, market by market</h2>
          <p className="pg-lede">Clean is not one number. A wafer fab counts particles, a battery line counts moisture, a district cooling plant counts kilowatt hours. The same five delivery stages serve all seven, and the class is always a test result rather than a note on a drawing.</p>

          <div className="pg-stats">
            <div className="pg-stat"><b>ISO 3 to 8</b><span>Cleanroom classes across the delivered record, Class 1 to Class 100K</span></div>
            <div className="pg-stat"><b>Grade B, C, D</b><span>GMP grades held on recorded Bio LifeScience work</span></div>
            <div className="pg-stat"><b>Dry room</b><span>Battery lines specified by humidity, not by ISO class</span></div>
            <div className="pg-stat"><b>1,050,000 m²</b><span>Cleanroom built-up area delivered by the group</span></div>
          </div>

          <div className="pg-slot">
            <div className="pg-slot-in">
              <span className="pg-slot-tag">Content slot &middot; certifications</span>
              <b>Certificate files and the full ESH award record</b>
              <p>The ISO 9001, ISO 14001 and ISO 45001 certificates, the CIDB G7 registration and the complete Environment, Safety and Health award list are outstanding. This panel holds the downloadable set once they arrive, so every market page can point at the same source.</p>
              <span className="pg-k">Supplied by IAQ</span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- 04 · proof strip */}
      <section className="pg-sec">
        <div className="pg-in">
          <span className="pg-k">Proof</span>
          <h2>One project from each market</h2>
          <p className="pg-lede">Seven flagships from the sample registry, one per market. The full 230+ record migrates with the new site.</p>

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
          </div>

          <Link className="pg-nextcard" to="/projects">
            <span className="pg-nextic"><Icon name="folder" /></span>
            <span>
              <b>Search the whole record</b>
              <small>Every project tagged by market, location, delivery model and cleanroom class.</small>
            </span>
            <span className="pg-nextarrow"><Icon name="arrow" /></span>
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ 05 · enquiry */}
      <section className="pg-cta">
        <div className="pg-in">
          <div>
            <span className="eyebrow">Start a project</span>
            <h2>Tell us what you are building</h2>
            <p>From feasibility to handover, one accountable team. Name the environment and the brief goes to the people who have built it before.</p>
          </div>
          <div className="pg-cta-act">
            <Link className="cta" to="/contact">Start a project</Link>
            <span className="pg-cta-meta">Project enquiry<br />Response within one working day</span>
          </div>
        </div>
      </section>

      <Related from="markets-hub" />
      <Footer note="Markets concept · Brand Method" />
    </>
  )
}
