import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/industry-grid.css'

/* "Where we build" — the seven markets: a two-column intro over one straight
   ACCIONA-style row. All seven markets sit side by side as tall vertical
   panels, each with a line icon and an uppercase label at the top. Hovering
   a panel stretches it, its siblings give way, and the description and the
   "See the market" pill fade up inside the widened panel.

   Labels carry authored line breaks and never reflow, so the accordion
   stretch moves the panel without re-wrapping the text inside it. */

const MARKETS = [
  {
    to: '/markets/semiconductor', img: '/assets/services/semiconductor.png', icon: 'chip',
    title: ['Semiconductor'], alt: 'Semiconductor cleanroom production floor',
    desc: 'Wafer fabs, backend plants, ISO 3 to 6 cleanrooms.',
  },
  {
    to: '/markets/data-centre', img: '/assets/services/data-centre.jpg', icon: 'server',
    title: ['Data Centre'], alt: 'Data centre server hall',
    desc: 'Cooling, power and controlled environments at scale.',
  },
  {
    to: '/markets/ev-battery', img: '/assets/services/ev-charger.webp', icon: 'battery',
    title: ['EV Battery'], alt: 'Electric vehicle charging',
    desc: 'Gigafactory dry rooms, humidity-critical builds.',
  },
  {
    to: '/markets/photovoltaics', img: '/assets/services/photocolotaic.webp', icon: 'sun',
    title: ['Photovoltaic'], alt: 'Solar photovoltaic array',
    desc: 'Solar cell and module production facilities.',
  },
  {
    to: '/markets/bio-lifescience', img: '/assets/services/pharmacy.jpg', icon: 'flask',
    title: ['Pharma &', 'Hospitals'], alt: 'Pharmaceutical production line',
    desc: 'GMP parenteral, labs and medical device plants.',
  },
  {
    to: '/markets/food-beverage', img: '/assets/services/capping_machine.jpg', icon: 'bottle',
    title: ['Food &', 'Beverages'], alt: 'Bottling and capping line',
    desc: 'Hygienic flavor and food production environments.',
  },
  {
    to: '/markets/district-cooling', img: '/assets/services/District-cooling-Heating-1.png', icon: 'snow',
    title: ['District', 'Cooling'], alt: 'District cooling plant',
    desc: 'Including Malaysia’s largest district cooling centre.',
  },
]

const ICONS = {
  chip: <><rect x="6" y="6" width="12" height="12" rx="1" /><path d="M9.5 9.5h5v5h-5zM9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" /></>,
  server: <><rect x="3.5" y="3.5" width="17" height="7" rx="1" /><rect x="3.5" y="13.5" width="17" height="7" rx="1" /><path d="M7 7h.01M7 17h.01M11 7h3M11 17h3" /></>,
  battery: <><rect x="2.5" y="7.5" width="17" height="9" rx="1.5" /><path d="M21.5 10.5v3M12.2 9l-2.4 3h4l-2.4 3" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1L19 19M19 5l-1.9 1.9M6.9 17.1L5 19" /></>,
  flask: <><path d="M9.5 3h5M10.5 3v6l-5.2 9a1.6 1.6 0 0 0 1.4 2.4h10.6a1.6 1.6 0 0 0 1.4-2.4L13.5 9V3" /><path d="M8 15.5h8" /></>,
  bottle: <><path d="M10 2.5h4M10.5 2.5v4.2L8 10.2V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20v-9.8l-2.5-3.5V2.5" /><path d="M8 13.5h8" /></>,
  snow: <><path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5M12 6.5l-2.5-2.5M12 6.5l2.5-2.5M12 17.5l-2.5 2.5M12 17.5l2.5 2.5" /></>,
}

const Icon = ({ name }) => (
  <svg className="ig-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[name]}
  </svg>
)

const Arrow = () => (
  <svg className="ig-arw" width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
    <path d="M0 6h18M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Card({ m }) {
  return (
    <Link className="ig-card" to={m.to} data-reveal="">
      <span className="ig-media">
        <img src={m.img} alt={m.alt} loading="lazy" decoding="async" />
      </span>
      <span className="ig-scrim" aria-hidden="true" />
      <span className="ig-tint" aria-hidden="true" />
      <span className="ig-head">
        <Icon name={m.icon} />
        <span className="ig-title">
          {m.title.map((l, k) => <React.Fragment key={k}>{k > 0 && <br />}{l}</React.Fragment>)}
        </span>
      </span>
      <span className="ig-foot">
        <span className="ig-desc">{m.desc}</span>
        <span className="ig-pill"><span>See the market</span><Arrow /></span>
      </span>
    </Link>
  )
}

export default function IndustryGrid() {
  const rowRef = useRef(null)

  /* mobile: the row becomes a snap carousel that advances one panel every
     few seconds — only while it is on screen, never against a reduced-motion
     preference, and it stands down for a while whenever the user touches it */
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const mobile = window.matchMedia('(max-width: 640px)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer = null
    let idle = null
    let held = false
    let seen = false

    const step = () => {
      if (!mobile.matches || held || !seen) return
      const card = row.firstElementChild
      if (!card) return
      const max = row.scrollWidth - row.clientWidth
      const cw = card.offsetWidth
      const next = row.scrollLeft >= max - cw / 2 ? 0 : Math.min(row.scrollLeft + cw, max)
      row.scrollTo({ left: next, behavior: 'smooth' })
    }
    const arm = () => {
      if (timer) clearInterval(timer)
      timer = (mobile.matches && !still.matches) ? setInterval(step, 3800) : null
    }
    const hold = () => {
      held = true
      clearTimeout(idle)
      idle = setTimeout(() => { held = false }, 6000)
    }

    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting }, { threshold: 0.35 })
    io.observe(row)
    row.addEventListener('pointerdown', hold)
    row.addEventListener('touchstart', hold, { passive: true })
    mobile.addEventListener?.('change', arm)
    arm()

    return () => {
      if (timer) clearInterval(timer)
      clearTimeout(idle)
      io.disconnect()
      row.removeEventListener('pointerdown', hold)
      row.removeEventListener('touchstart', hold)
      mobile.removeEventListener?.('change', arm)
    }
  }, [])

  return (
    <>
      <div className="wrap">
      <span className="eyebrow"><span data-scramble="">WHERE WE BUILD</span></span>
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
      </div>

      <div className="ig-grid">
        <div className="ig-row" ref={rowRef}>
          {MARKETS.map(m => <Card m={m} key={m.to} />)}
        </div>
      </div>
    </>
  )
}
