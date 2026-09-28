import React, { useEffect, useRef, useState } from 'react'
import Icon from './FlowIcon.jsx'
import { Link } from 'react-router-dom'
import { SERVICES } from '../data/codex.js'
import { CYCLE_SVG } from '../data/cycleMarks.js'
import { useMomentum } from '../lib/momentum.js'
import '../styles/services-cover.css'

/* ============================================================================
   ServicesCover · the Services page head, 24 Sep 2026.

   Bazil, on the Codex's "Hero, with the cover picture": "this section at the top is very important and I want it to
   be there, but done very well and premium". The cover slide is a 1920px composite whose labels go illegible at
   hero size, so the cover is built live here: IAQ's own Revit section (the same frame the Codex uses), nine numbered
   pins in the Codex colours (work amber, service azure), a legend that reads at any size, and one layer lit at a
   time. The lit layer advances every 2.4s while the head is on screen, stops under the pointer, and follows a hover
   or a click on a pin or a legend row. Layers and pins are the Codex cover's own (CodexSlides.jsx LAYERS), copied
   here so the page does not import the slides.
   ============================================================================ */
export const LAYERS = [
  { n: 1, x: 55, y: 9,  t: 'Roof steel and structural frame', d: 'csa' },
  { n: 2, x: 31, y: 17, t: 'Air handling and ducting', d: 'mep' },
  { n: 3, x: 77, y: 26, t: 'Building services, the interstitial level', d: 'mep' },
  { n: 4, x: 43, y: 41, t: 'Cleanroom envelope', d: 'csa' },
  { n: 5, x: 71, y: 45, t: 'Process tools, hooked up', d: 'hookup' },
  { n: 6, x: 32, y: 49, t: 'Waffle slab and raised floor', d: 'csa' },
  { n: 7, x: 48, y: 58, t: 'Process utilities in the sub-fab', d: 'process' },
  { n: 8, x: 69, y: 76, t: 'Sub-fab plant and fire protection', d: 'mep' },
  { n: 9, x: 42, y: 87, t: 'Piles and pile caps', d: 'csa' },
]
/* 24 Sep (Bazil: "I need the circular process service also here"): the six services as a ring under the copy, the
   same marks the home ring uses, a red arc that grows to the stage in turn, the stage's name and link in the centre */
const MARK = { design: 'des', procure: 'prc', construct: 'con', commission: 'com', maintain: 'mnt', hookup: 'hok' }
const ROUTE = { design: '/services/all#design', procure: '/services/all#procurement', construct: '/services/all#construction', commission: '/services/all#commissioning', maintain: '/services/all#maintenance', hookup: '/services/tool-installation' }
const DISC = [
  ['csa', 'CSA', 'Civil, Structural and Architectural'],
  ['mep', 'MEP', 'Mechanical, Electrical and Plumbing'],
  ['process', 'Process utilities', 'What the tools run on'],
  ['hookup', 'Tools hookup', 'Service 6, the tools themselves'],
]

export default function ServicesCover({ title, lede, chips }) {
  useMomentum({ range: 14 })
  const ref = useRef(null)
  const hover = useRef(false)
  const [on, setOn] = useState(1)
  const [st, setSt] = useState(0)
  const [inView, setIn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el || !('IntersectionObserver' in window)) { setIn(true); return }
    const io = new IntersectionObserver(([e]) => setIn(e.isIntersecting), { threshold: 0.3 })
    io.observe(el); return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!hover.current && !document.hidden) { setOn(n => (n % LAYERS.length) + 1); setSt(k => (k + 1) % SERVICES.length) } }, 2400)
    return () => clearInterval(t)
  }, [inView])
  const lit = LAYERS.find(l => l.n === on)
  return (
    <header ref={ref} className={'pg-head sc-head' + (inView ? ' in' : '')}
      onPointerEnter={() => { hover.current = true }} onPointerLeave={() => { hover.current = false }}>
      <div className="pg-in sc-in">
        <div className="sc-copy">
          <h1>{title}</h1>
          <p className="pg-head-lede">{lede}</p>
          {chips && <ul className="pg-chips">{chips.map((c, i) => <li className="pg-chip" key={i}>{c}</li>)}</ul>}
          <div className="sc-ring" aria-label="The six services, in order">
            <svg className="sc-ring-arc" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" pathLength="6" />
              {/* the return from 6 to 1: dashed red over the last sixth, with its arrowhead landing on 1 */}
              <circle className="sc-ring-ret" cx="50" cy="50" r="46" pathLength="6" style={{ strokeDasharray: '0.82 5.18', strokeDashoffset: -5.09 }} />
              <path className="sc-ring-head" d="M50 4L47.4 7.4L52.6 7.4Z" transform="rotate(-9 50 50)" />
              <circle className="sc-ring-red" cx="50" cy="50" r="46" pathLength="6" style={{ strokeDasharray: `${st} 6` }} />
              {[0, 1, 2, 3, 4].map(i => { const d = (i + 0.5) * 60; return <path key={i} className={'sc-ring-chev' + (i < st ? ' on' : '')} d="M-2.6 -2.6L0 0L-2.6 2.6" transform={`rotate(${d} 50 50) translate(50 4) rotate(90)`} /> })}
            </svg>
            {SERVICES.map((sv, i) => (
              <button type="button" key={sv.id} className={'sc-st' + (i === st ? ' on' : '')} style={{ '--a': `${i * 60 - 90}deg`, '--i': i }}
                aria-pressed={i === st} aria-label={`${sv.n} ${sv.name}`} onPointerEnter={() => setSt(i)} onFocus={() => setSt(i)} onClick={() => setSt(i)}>
                <span className="sc-st-mk" dangerouslySetInnerHTML={{ __html: CYCLE_SVG[MARK[sv.id]] }} />
                <span className="sc-st-l"><i>{sv.n}</i>{sv.short}</span>
              </button>
            ))}
            <div className="sc-ring-c" key={SERVICES[st].id}>
              <span className="sc-ring-n">{SERVICES[st].n}<small>/ 6</small></span>
              <b>{SERVICES[st].name}</b>
              <Link to={ROUTE[SERVICES[st].id]}>See {SERVICES[st].short} <i aria-hidden="true">&rarr;</i></Link>
            </div>
          </div>
        </div>
        <div className="sc-cover" aria-label="A section through IAQ’s Revit model of a fab, with its nine layers numbered">
          <div className="sc-model">
            <span className="sc-mo" data-mo="0.5"><img src="/assets/iaq/model-seq/44.webp" alt="A section through a fab in IAQ’s Revit model: roof steel, services, cleanroom, tools, sub-fab and piles" decoding="async" fetchPriority="high" /></span>
            {LAYERS.map((l, i) => (
              <button type="button" key={l.n} className={'sc-pin d-' + l.d + (l.n === on ? ' on' : '')} style={{ left: l.x + '%', top: l.y + '%', '--i': i }}
                aria-label={l.t} aria-pressed={l.n === on} onPointerEnter={() => setOn(l.n)} onFocus={() => setOn(l.n)} onClick={() => setOn(l.n)}>{l.n}</button>
            ))}
            <span className={'sc-tip d-' + lit.d} key={lit.n}><i>{lit.n}</i>{lit.t}</span>
          </div>
          <div className="sc-leg">
            {DISC.map(([k, short, full]) => (
              <div className={'sc-grp d-' + k} key={k}>
                <span className="sc-grp-h"><b>{short}</b><small>{full}</small></span>
                <ul>{LAYERS.filter(l => l.d === k).map(l => (
                  <li key={l.n} className={l.n === on ? 'on' : undefined} onPointerEnter={() => setOn(l.n)}><i>{l.n}</i>{l.t}</li>
                ))}</ul>
              </div>
            ))}
          </div>
          <p className="sc-cap">IAQ’s own Revit model of a fab. Every layer is designed, procured, built and proven by the same company.</p>
        </div>
      </div>
    </header>
  )
}
