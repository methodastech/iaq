import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/industry-grid.css'

/* "Where we build" — the seven markets, laid out from sectionreference.html:
   a two-column intro over an accordion card wall (three cards, then four, all
   one height). Hovering a card stretches it, its siblings give way, and the
   description fades up inside the widened card.

   The reference's dark shell is dropped: colours, type and the red accent come
   from the IAQ system, and the copy is the client's own, carried over from the
   old industry cards and the markets hub lede. Photography is the new set in
   /assets/services.

   Titles carry authored line breaks and never reflow, so the accordion stretch
   moves the card without re-wrapping the text inside it. */

const MARKETS = [
  {
    to: '/markets/semiconductor', img: '/assets/services/semiconductor.png',
    title: ['Semiconductor'], alt: 'Semiconductor cleanroom production floor',
    desc: 'Wafer fabs, backend plants, ISO 3 to 6 cleanrooms.',
  },
  {
    to: '/markets/data-centre', img: '/assets/services/data-centre.jpg',
    title: ['Data', 'Centre'], alt: 'Data centre server hall',
    desc: 'Cooling, power and controlled environments at scale.',
  },
  {
    to: '/markets/ev-battery', img: '/assets/services/ev-charger.webp',
    title: ['EV', 'Battery'], alt: 'Electric vehicle charging',
    desc: 'Gigafactory dry rooms, humidity-critical builds.',
  },
  {
    to: '/markets/photovoltaics', img: '/assets/services/photocolotaic.webp',
    title: ['Photovoltaic'], alt: 'Solar photovoltaic array',
    desc: 'Solar cell and module production facilities.',
  },
  {
    to: '/markets/bio-lifescience', img: '/assets/services/pharmacy.jpg',
    title: ['Pharmaceuticals', '& Hospitals'], alt: 'Pharmaceutical production line',
    desc: 'GMP parenteral, labs and medical device plants.',
  },
  {
    to: '/markets/food-beverage', img: '/assets/services/capping_machine.jpg',
    title: ['Food &', 'Beverages'], alt: 'Bottling and capping line',
    desc: 'Hygienic flavor and food production environments.',
  },
  {
    to: '/markets/district-cooling', img: '/assets/services/District-cooling-Heating-1.png',
    title: ['District', 'Cooling &', 'Heating'], alt: 'District cooling plant',
    desc: 'Including Malaysia’s largest district cooling centre.',
  },
]

const Arrow = () => (
  <svg className="ig-arw" width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
    <path d="M0 6h18M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Card({ m, i }) {
  return (
    <Link className="ig-card" to={m.to} data-reveal="">
      <span className="ig-media">
        <img src={m.img} alt={m.alt} loading="lazy" decoding="async" />
      </span>
      <span className="ig-scrim" aria-hidden="true" />
      <span className="ig-tint" aria-hidden="true" />
      <span className="ig-no" aria-hidden="true">IND &middot; {String(i + 1).padStart(2, '0')}</span>
      <span className="ig-body">
        <span className="ig-title">
          {m.title.map((l, k) => <React.Fragment key={k}>{k > 0 && <br />}{l}</React.Fragment>)}
        </span>
        <span className="ig-desc">{m.desc}</span>
      </span>
      <span className="ig-pill"><span>See the market</span><Arrow /></span>
    </Link>
  )
}

export default function IndustryGrid() {
  return (
    <>
      <div className="ig-intro">
        <h2 className="ig-h" data-reveal="">
          Seven industries,<br />
          <span className="muted">one standard</span><br />
          <span className="muted">of clean<span className="ig-stop">.</span></span>
        </h2>

        <div className="ig-intro-r">
          <p className="ig-copy" data-reveal="">
            <span className="lead">Each of these environments is judged by a different measure:</span>{' '}
            a particle count, a dew point, a temperature that never moves, a hygiene regime.
          </p>
          <Link className="ig-cta" to="/markets" data-reveal="">
            <span>Explore the markets</span><Arrow />
          </Link>
        </div>
      </div>

      <div className="ig-grid">
        <div className="ig-row">
          {MARKETS.slice(0, 3).map((m, i) => <Card m={m} i={i} key={m.to} />)}
        </div>
        <div className="ig-row">
          {MARKETS.slice(3).map((m, i) => <Card m={m} i={i + 3} key={m.to} />)}
        </div>
      </div>
    </>
  )
}
