import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LINE_SHAPES } from './HeroLineMarks.jsx'
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
    to: '/markets/semiconductor', vid: '/assets/videos/mkt-semiconductor.mp4', img: '/assets/industries/semiconductor-poster.jpg', icon: 'chip',
    title: ['Semiconductor'], alt: 'Semiconductor cleanroom production floor',
    desc: 'Wafer fabs, backend plants, ISO 3 to 7 cleanrooms.',
  },
  {
    to: '/markets/data-centre', vid: '/assets/videos/mkt-data-centre.mp4', img: '/assets/services/data-centre.jpg', icon: 'server',
    title: ['Data Centre'], alt: 'Data centre server hall',
    desc: 'Cooling, power and controlled environments at scale.',
  },
  {
    to: '/markets/ev-battery', vid: '/assets/videos/mkt-ev-battery.mp4', img: '/assets/services/ev-charger.webp', icon: 'battery',
    title: ['EV Battery'], alt: 'Electric vehicle charging',
    desc: 'Gigafactory dry rooms, humidity-critical builds.',
  },
  {
    to: '/markets/photovoltaics', vid: '/assets/videos/mkt-photovoltaic.mp4', img: '/assets/services/photocolotaic.webp', icon: 'sun',
    title: ['Photovoltaics'], alt: 'Solar photovoltaic array',
    desc: 'Solar cell and module production facilities.',
  },
  {
    to: '/markets/bio-lifescience', vid: '/assets/videos/mkt-bio-lifescience.mp4', img: '/assets/industries/bio-lifescience-poster.jpg', icon: 'flask',
    /* 4 Sep (client): the market is Bio LifeScience per the questionnaire (A1.4), and the visual is
       an operating theatre, the environment the client asked for */
    title: ['Bio', 'LifeScience'], alt: 'Hospital operating theatre under a laminar-flow ceiling',
    desc: 'GMP parenteral, labs and medical device plants.',
  },
  {
    to: '/markets/food-beverage', vid: '/assets/videos/mkt-food-beverage.mp4', img: '/assets/services/capping_machine.jpg', icon: 'bottle',
    title: ['Food &', 'Beverage'], alt: 'Bottling and capping line',
    desc: 'Hygienic flavour and food production environments.',
  },
  {
    to: '/markets/district-cooling', vid: '/assets/videos/mkt-district-cooling.mp4', img: '/assets/services/District-cooling-Heating-1.png', icon: 'snow',
    title: ['District', 'Cooling &', 'Heating'], alt: 'District cooling plant',
    desc: 'Including Malaysia’s largest district cooling centre.',
  },
]

/* 4 Sep rebuild (client: "recreate the icon... bigger and a bit more complicated in terms of
   premium look"). Same 24 grid and the same base + trace contract, but every mark now carries a
   second layer of detail — pins, indicator dots, inner geometry — so the red tracer has a real
   circuit to run. Strokes are ordered build-outward so the stagger reads as the thing assembling. */
const ICONS = {
  chip: <>
    <rect x="6.5" y="6.5" width="11" height="11" rx="1.2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx=".6" />
    <path d="M9 2.5v4M12 2.5v4M15 2.5v4M9 17.5v4M12 17.5v4M15 17.5v4" />
    <path d="M2.5 9h4M2.5 12h4M2.5 15h4M17.5 9h4M17.5 12h4M17.5 15h4" />
    <path d="M12 9.5v-3M14.5 12h3" />
  </>,
  server: <>
    <rect x="3" y="3" width="18" height="6" rx="1.2" />
    <rect x="3" y="9.5" width="18" height="6" rx="1.2" />
    <rect x="3" y="16" width="18" height="5" rx="1.2" />
    <path d="M6.5 6h.01M6.5 12.5h.01M6.5 18.5h.01" />
    <path d="M10 6h6M10 12.5h6M10 18.5h4" />
    <path d="M17.5 6h.01M17.5 12.5h.01" />
  </>,
  battery: <>
    <rect x="2.5" y="7" width="17" height="10" rx="1.8" />
    <path d="M19.5 10.2h1.6a.8.8 0 0 1 .8.8v2a.8.8 0 0 1-.8.8h-1.6" />
    <path d="M5 9.5v5M7.5 9.5v5" />
    <path d="M13.2 8.6l-2.8 3.4h4l-2.8 3.4" />
  </>,
  sun: <>
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="12" cy="12" r="6.2" strokeDasharray="1.2 2.4" />
    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4" />
    <path d="M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7" />
  </>,
  flask: <>
    <path d="M9 2.5h6M10 2.5v6.2l-5.4 9.4a1.7 1.7 0 0 0 1.5 2.5h11.8a1.7 1.7 0 0 0 1.5-2.5L14 8.7V2.5" />
    <path d="M7.2 15.5h9.6" />
    <path d="M10.5 18.2h.01M13.4 17.4h.01M12 19.3h.01" />
    <path d="M12 5.5h2" />
  </>,
  bottle: <>
    <path d="M9.5 2.5h5M10.5 2.5v4.3L8 10.5V20a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20v-9.5l-2.5-3.7V2.5" />
    <path d="M8 13h8M8 17.5h8" />
    <path d="M10.2 15.2h3.6" />
    <path d="M10.5 4.6h3" />
  </>,
  snow: <>
    <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
    <path d="M12 6l-2.3-2.3M12 6l2.3-2.3M12 18l-2.3 2.3M12 18l2.3 2.3" />
    <path d="M6.8 9l-3.1-.8M6.8 9l.8-3.1M17.2 15l3.1.8M17.2 15l-.8 3.1" />
    <path d="M6.8 15l-3.1.8M6.8 15l.8 3.1M17.2 9l3.1-.8M17.2 9l-.8-3.1" />
    <circle cx="12" cy="12" r="1.6" />
  </>,
}

/* Recipe A, the "accent trace": the mark is ALWAYS fully drawn at rest in its resting grey,
   and hovering draws a red tracer OVER it rather than building the icon from nothing. An
   icon that redraws itself on every hover reads cheap; one that gets traced reads
   instrument-grade. pathLength=1 normalises every shape to a length of 1, so one dash
   pattern draws any of them with no per-icon tuning, and --n staggers the strokes so the
   parts of a mark arrive in order. Round caps are kept deliberately: several marks draw
   their indicator dots as zero-length segments (M7 7h.01), which butt caps would erase. */
/* 23 Sep (Bazil: "make the icons a lot better and premium", "sharp"): the strip drew its own set, on its own grid,
   at its own weight, with round caps. It draws THE MARKET MARKS now (HeroLineMarks.LINE_SHAPES), the same geometry
   the hero row and the record block use, at the house weight with butt caps and mitred joins. The red tracer stays:
   it runs the same paths, and the last path of each mark is the one that stays red. */
const MARK_ID = {
  chip: 'mkt-semiconductor', server: 'mkt-data-centre', battery: 'mkt-ev-battery', sun: 'mkt-photovoltaics',
  flask: 'mkt-bio-lifescience', bottle: 'mkt-food-beverage', snow: 'mkt-district-cooling',
}
const Icon = ({ name }) => {
  const shapes = LINE_SHAPES[MARK_ID[name]] || []
  return (
    <svg className="ig-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.95"
         strokeLinecap="butt" strokeLinejoin="miter" aria-hidden="true">
      <g className="ig-ic-base">
        {shapes.map((d, k) => d.startsWith('F:')
          ? <path key={k} d={d.slice(2)} fill={k === shapes.length - 1 ? '#FF3B42' : 'currentColor'} stroke="none" />
          : <path key={k} d={d} className={k === shapes.length - 1 ? 'ig-ic-sig' : undefined} />)}
      </g>
      <g className="ig-ic-trace" aria-hidden="true">
        {shapes.map((d, k) => <path key={k} d={d.replace(/^F:/, '')} pathLength={1} style={{ '--n': k }} />)}
      </g>
    </svg>
  )
}

const Arrow = () => (
  <svg className="ig-arw" width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">
    <path d="M0 6h18M13 1l5 5-5 5" stroke="currentColor" strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ---- hover-to-play, built to the pattern the best implementations actually use ----
   (Cuberto's card CSS, web.dev's lazy-video guidance, Chrome's play()/pause() note.)

   No `src` and no `poster` in the markup. The still <img> already IS the poster, and a
   poster attribute would fetch the same frame a second time. Bytes are spent only once
   the pointer has committed.

   A 110ms dwell gate before that commitment: a pointer crossing seven panels fires seven
   mouseenters inside 200ms, and without the gate that is seven downloads and seven
   decodes racing each other. This one number removes most of the stutter.

   ONE decoder at a time, held module-level. Browsers will cheerfully decode seven 720p
   streams at once and drop to 20fps doing it.

   Never pause a play() that is still pending (that is the "play() request was interrupted
   by a call to pause()" exception), and never rewind synchronously on leave, or the frame
   visibly snaps back to 0 while it is still half-opaque.

   Reveal on the first DECODED frame rather than on hover, so a black rectangle can never
   bloom in over the still.

   Only the markets with a clip that HONESTLY depicts them carry one; the rest keep the
   still and its slow drift. Drop a `vid` on any market later and it inherits all of this. */

let currentStop = null
const HOVER_INTENT = 110
const FADE_OUT = 400

function Card({ m, i }) {
  const cardRef = useRef(null)
  const vref = useRef(null)
  const st = useRef({ want: false, armed: false, pending: null, intentT: 0, resetT: 0 })

  useEffect(() => {
    const v = vref.current
    const s = st.current
    if (v) {
      /* React drops the muted ATTRIBUTE during hydration and Safari then refuses to
         play inline; setting the PROPERTY is what actually sticks. */
      v.muted = true
      v.setAttribute('disableremoteplayback', '')
    }
    return () => { clearTimeout(s.intentT); clearTimeout(s.resetT) }
  }, [])

  /* coarse pointers never fetch a byte, and neither does a reduced-motion or
     data-saver visitor */
  const capable = () => {
    if (!m.vid || !window.matchMedia) return false
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return false
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const c = navigator.connection
    return !(c && c.saveData)
  }

  const stop = () => {
    const s = st.current, v = vref.current
    if (!v || s.pending) return
    v.pause()
    clearTimeout(s.resetT)
    s.resetT = setTimeout(() => { if (!s.want) { try { v.currentTime = 0 } catch (e) {} } }, FADE_OUT)
  }

  const start = () => {
    const s = st.current, v = vref.current, card = cardRef.current
    if (!v || !card) return
    if (!s.armed) {
      s.armed = true
      const ready = () => card.classList.add('is-vready')
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) v.requestVideoFrameCallback(ready)
      else v.addEventListener('loadeddata', ready, { once: true })
      /* ONLY a real load/decode failure retires the clip. A rejected play() is not that:
         a hidden tab, a policy refusal or a fast pointer sweep all reject transiently, and
         retiring the card on one of those would kill the video for the rest of the session. */
      v.addEventListener('error', () => card.classList.add('is-novideo'), { once: true })
      v.src = m.vid
      v.load()
    }
    if (document.hidden) return          /* a hidden tab always refuses; retry on return */
    if (currentStop && currentStop !== stop) currentStop()
    currentStop = stop
    if (s.pending) return
    const p = v.play()
    if (p && p.then) {
      s.pending = p
      p.then(() => { s.pending = null; if (!s.want) stop() })
       .catch(() => { s.pending = null })   /* transient: the next hover tries again */
    }
  }

  const enter = () => {
    if (!capable()) return
    const s = st.current
    s.want = true
    clearTimeout(s.resetT)
    s.intentT = setTimeout(start, HOVER_INTENT)
  }
  const leave = () => {
    const s = st.current
    s.want = false
    clearTimeout(s.intentT)
    stop()
  }

  return (
    <Link className="ig-card" to={m.to} style={{ '--i': i }} ref={cardRef}
          onPointerEnter={enter} onPointerLeave={leave} onFocus={enter} onBlur={leave}>
      <span className="ig-media">
        <img src={m.img} alt={m.alt} loading="lazy" decoding="async" />
        {m.vid && (
          <video ref={vref} className="ig-vid" loop playsInline preload="none"
                 disablePictureInPicture tabIndex={-1} aria-hidden="true" />
        )}
      </span>
      <span className="ig-scrim" aria-hidden="true" />
      <span className="ig-tint" aria-hidden="true" />
      <span className="ig-no" aria-hidden="true">{i + 1}</span>
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
      if (max <= 0) return   /* stacked (phone), or everything already fits: nothing to advance */
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

    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting
      /* staggered entrance, armed once; without JS the cards are simply visible */
      if (e.isIntersecting) row.classList.add('ig-in')
      /* the stills only drift while the band is actually on screen */
      row.classList.toggle('ig-live', e.isIntersecting)
    }, { threshold: 0.35 })
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
      <div className="ig-intro">
        {/* 24 Sep (Bazil: "better title, and make this follow the theme, something looks weird"): the site's own
            heading form, ink then the red phrase, instead of a three-line grey fade */}
        <h2 className="ig-h" data-reveal="">
          Seven markets, <br />
          <em>one standard of clean.</em>
        </h2>

        <div className="ig-intro-r">
          <p className="ig-copy" data-reveal="">
            <span className="lead">Each is judged by its own measure:</span>{' '}
            a particle count, a dew point, a temperature held steady, a hygiene regime.
          </p>
          <Link className="ig-cta" to="/markets" data-reveal="">
            <span>Compare the seven markets</span><Arrow />
          </Link>
        </div>
      </div>
      </div>

      <IndustryRow rowRef={rowRef} />
    </>
  )
}

/* 4 Sep (client: "i said side by side like teh industry at homepage"). The markets hub asked for
   this same expanding strip, so the ROW is split out and both pages render the one component
   rather than the markup being cloned. IndustryGrid keeps its own section chrome (eyebrow,
   heading, "Explore the markets"); the hub supplies its own, so it takes the row alone.
   `rowRef` is optional: the home band passes its ref in for the mobile auto-advance carousel,
   the hub does not need it. */
export function IndustryRow({ rowRef }) {
  const own = useRef(null)
  return (
    <div className="ig-grid">
      <div className="ig-inner">
        <div className="ig-row" ref={rowRef || own}>
          {MARKETS.map((m, i) => <Card m={m} i={i} key={m.to} />)}
        </div>
      </div>
    </div>
  )
}
